#!/bin/bash
# Cursor IDE Performance Optimizer - 企业级性能优化脚本 (Linux/macOS版本)
# 专为SmartAbp低代码引擎开发环境设计
# 作者: 首席架构师 | 版本: v1.0

set -e

# 参数处理
DEEP_CLEAN=false
BACKUP=true
DRY_RUN=false
RESTART_CURSOR=false
VERBOSE=false
KEEP_DAYS=7

# 全局变量
TOTAL_CLEANED=0
FILES_PROCESSED=0
BACKUP_PATH=""

# 参数解析
while [[ $# -gt 0 ]]; do
    case $1 in
        --deep)
            DEEP_CLEAN=true
            shift
            ;;
        --no-backup)
            BACKUP=false
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --restart)
            RESTART_CURSOR=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --keep-days)
            KEEP_DAYS="$2"
            shift 2
            ;;
        --help)
            echo "Cursor IDE Performance Optimizer"
            echo "用法: $0 [选项]"
            echo "选项:"
            echo "  --deep          深度清理模式"
            echo "  --no-backup     不备份配置文件"
            echo "  --dry-run       预演模式（不执行实际清理）"
            echo "  --restart       清理后重启Cursor"
            echo "  --verbose       详细输出"
            echo "  --keep-days N   保留最近N天的日志（默认7天）"
            echo "  --help          显示此帮助信息"
            exit 0
            ;;
        *)
            echo "未知参数: $1"
            echo "使用 $0 --help 查看帮助"
            exit 1
            ;;
    esac
done

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')] [INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR]${NC} $1"
}

log_progress() {
    echo -e "${PURPLE}[$(date '+%Y-%m-%d %H:%M:%S')] [PROGRESS]${NC} $1"
}

# 获取文件夹大小（MB）
get_folder_size() {
    local path="$1"
    if [ ! -d "$path" ]; then
        echo "0"
        return
    fi

    if command -v du >/dev/null 2>&1; then
        # 使用du命令，转换为MB
        local size_kb=$(du -sk "$path" 2>/dev/null | cut -f1)
        echo "scale=2; ${size_kb:-0} / 1024" | bc 2>/dev/null || echo "0"
    else
        echo "0"
    fi
}

# 安全删除函数
remove_safely_with_backup() {
    local path="$1"
    local description="$2"
    local backup_first="${3:-false}"

    if [ ! -e "$path" ]; then
        log_warning "路径不存在，跳过: $path"
        return
    fi

    local size_mb=$(get_folder_size "$path")

    if [ "$DRY_RUN" = true ]; then
        log_progress "[DRY RUN] 将清理 $description : $path ($size_mb MB)"
        return
    fi

    # 备份重要配置
    if [ "$backup_first" = true ] && [ "$BACKUP" = true ] && [ "$(echo "$size_mb > 0" | bc)" -eq 1 ]; then
        local backup_name=$(basename "$path")
        local backup_target="$BACKUP_PATH/${backup_name}-$(date +%Y%m%d-%H%M%S)"

        if cp -r "$path" "$backup_target" 2>/dev/null; then
            log_success "已备份 $description 到: $backup_target"
        else
            log_error "备份失败: $path"
        fi
    fi

    # 执行清理
    if rm -rf "$path" 2>/dev/null; then
        log_success "✅ 已清理 $description : $size_mb MB"
        TOTAL_CLEANED=$(echo "$TOTAL_CLEANED + $size_mb" | bc)
        FILES_PROCESSED=$((FILES_PROCESSED + 1))
    else
        log_error "清理失败 $description : $path"
    fi
}

# 清理旧文件
clear_old_files() {
    local path="$1"
    local days_to_keep="$2"
    local description="$3"

    if [ ! -d "$path" ]; then
        return
    fi

    if [ "$DRY_RUN" = true ]; then
        local old_files_count=$(find "$path" -type f -mtime +$days_to_keep 2>/dev/null | wc -l)
        log_progress "[DRY RUN] 将清理 $description 中 $days_to_keep 天前的文件: $old_files_count 个"
        return
    fi

    local files_removed=0
    local total_size=0

    # 查找并删除旧文件
    while IFS= read -r -d '' file; do
        if [ -f "$file" ]; then
            local file_size=$(stat -c%s "$file" 2>/dev/null || echo "0")
            total_size=$((total_size + file_size))
            rm -f "$file" 2>/dev/null && files_removed=$((files_removed + 1))
        fi
    done < <(find "$path" -type f -mtime +$days_to_keep -print0 2>/dev/null)

    if [ $files_removed -gt 0 ]; then
        local size_mb=$(echo "scale=2; $total_size / 1024 / 1024" | bc)
        log_success "✅ 已清理 $description 旧文件: $files_removed 个文件, $size_mb MB"
        TOTAL_CLEANED=$(echo "$TOTAL_CLEANED + $size_mb" | bc)
    fi
}

# 检测操作系统
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    else
        echo "unknown"
    fi
}

# 获取Cursor配置路径
get_cursor_paths() {
    local os=$(detect_os)
    local home_dir="$HOME"

    case $os in
        "macos")
            echo "config:$home_dir/Library/Application Support/Cursor"
            echo "cache:$home_dir/Library/Caches/Cursor"
            echo "logs:$home_dir/Library/Logs/Cursor"
            ;;
        "linux")
            echo "config:$home_dir/.config/Cursor"
            echo "cache:$home_dir/.cache/cursor"
            echo "logs:$home_dir/.cache/cursor/logs"
            ;;
        *)
            log_error "不支持的操作系统: $OSTYPE"
            exit 1
            ;;
    esac
}

# 主清理函数
start_cursor_cleanup() {
    log_progress "========================================"
    log_progress "   Cursor IDE 企业级性能优化工具"
    log_progress "========================================"
    log_info "开始时间: $(date)"
    log_info "清理模式: $([ "$DEEP_CLEAN" = true ] && echo '深度清理' || echo '标准清理')"
    log_info "执行模式: $([ "$DRY_RUN" = true ] && echo '预演模式' || echo '实际清理')"
    log_info ""

    # 创建备份目录
    if [ "$BACKUP" = true ] && [ "$DRY_RUN" = false ]; then
        BACKUP_PATH="/tmp/CursorBackup-$(date +%Y%m%d-%H%M%S)"
        mkdir -p "$BACKUP_PATH"
        log_info "备份目录: $BACKUP_PATH"
    fi

    # 检测Cursor进程
    if pgrep -f "cursor" >/dev/null 2>&1; then
        log_warning "⚠️  检测到Cursor进程正在运行"
        if [ "$DRY_RUN" = false ]; then
            read -p "是否关闭Cursor进程以进行清理? (y/N): " -r
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                pkill -f "cursor" 2>/dev/null || true
                log_success "已关闭Cursor进程"
                sleep 3
            else
                log_warning "⚠️  在Cursor运行时清理可能效果有限"
            fi
        fi
    fi

    # 获取Cursor路径
    local cursor_paths=($(get_cursor_paths))
    local config_path=""
    local cache_path=""
    local logs_path=""

    for path_info in "${cursor_paths[@]}"; do
        case $path_info in
            config:*)
                config_path="${path_info#config:}"
                ;;
            cache:*)
                cache_path="${path_info#cache:}"
                ;;
            logs:*)
                logs_path="${path_info#logs:}"
                ;;
        esac
    done

    # 定义清理项目
    log_progress "🧹 开始清理Cursor IDE文件..."

    # 标准清理项目
    if [ -n "$cache_path" ]; then
        remove_safely_with_backup "$cache_path/GPUCache" "GPU缓存" false
        remove_safely_with_backup "$cache_path/ShaderCache" "着色器缓存" false
        remove_safely_with_backup "$cache_path/CachedData" "Web缓存数据" false
    fi

    if [ -n "$config_path" ]; then
        remove_safely_with_backup "$config_path/CachedExtensions" "扩展缓存" false
        remove_safely_with_backup "$config_path/CachedExtensionVSIXs" "扩展安装包缓存" false
        remove_safely_with_backup "$config_path/logs" "应用日志" false
    fi

    # 清理工作区存储（备份）
    if [ -n "$config_path" ]; then
        remove_safely_with_backup "$config_path/User/workspaceStorage" "工作区存储" true
    fi

    # 深度清理项目
    if [ "$DEEP_CLEAN" = true ]; then
        log_progress "🔍 深度清理模式：清理更多缓存文件..."

        if [ -n "$config_path" ]; then
            remove_safely_with_backup "$config_path/Crashpad" "崩溃转储文件" false
            remove_safely_with_backup "$config_path/User/tmp" "临时文件" false
        fi

        # 清理Node.js缓存
        local node_cache_paths=(
            "$HOME/.npm"
            "$HOME/.node-gyp"
            "$HOME/.cache/npm"
        )

        for path in "${node_cache_paths[@]}"; do
            if [ -d "$path" ]; then
                local size=$(get_folder_size "$path")
                if [ "$(echo "$size > 100" | bc)" -eq 1 ]; then
                    remove_safely_with_backup "$path" "Node.js缓存 ($size MB)" false
                fi
            fi
        done
    fi

    # 清理旧日志文件
    log_progress "📋 清理旧日志文件..."
    if [ -n "$logs_path" ]; then
        clear_old_files "$logs_path" "$KEEP_DAYS" "Cursor日志"
    fi

    # 清理系统临时文件中的Cursor相关文件
    log_progress "🗑️  清理系统临时文件中的Cursor数据..."
    find /tmp -name "*cursor*" -type f -mtime +1 2>/dev/null | while read -r file; do
        remove_safely_with_backup "$file" "临时Cursor文件" false
    done
}

# 性能优化建议
show_performance_recommendations() {
    log_info ""
    log_progress "🚀 性能优化建议:"
    log_info "1. 定期运行此脚本（建议每周一次）"
    log_info "2. 禁用不必要的扩展以减少内存使用"
    log_info "3. 定期重启Cursor IDE以释放内存"
    log_info "4. 确保有足够的磁盘空间（建议至少5GB）"
    log_info "5. 关闭不必要的文件和标签页"
    log_info "6. 使用.gitignore排除大型node_modules目录"
    log_info ""

    # 系统资源检查
    log_progress "💻 系统资源状态:"

    # 磁盘空间检查
    df -h | grep -E '^/dev/' | while read -r filesystem size used avail use_percent mount; do
        case $use_percent in
            9[0-9]%|100%)
                log_error "磁盘 $mount 使用率: $use_percent (可用: $avail)"
                ;;
            8[0-9]%)
                log_warning "磁盘 $mount 使用率: $use_percent (可用: $avail)"
                ;;
            *)
                log_success "磁盘 $mount 使用率: $use_percent (可用: $avail)"
                ;;
        esac
    done

    # 内存检查
    if command -v free >/dev/null 2>&1; then
        local mem_info=$(free -h | grep '^Mem:')
        log_info "系统内存: $mem_info"
    elif [ -f /proc/meminfo ]; then
        local total_mem=$(grep MemTotal /proc/meminfo | awk '{print $2}')
        local total_gb=$(echo "scale=2; $total_mem / 1024 / 1024" | bc)
        log_info "系统内存: ${total_gb} GB"
    fi
}

# 重启Cursor
restart_cursor() {
    if [ "$RESTART_CURSOR" = true ] && [ "$DRY_RUN" = false ]; then
        log_progress "🔄 重启Cursor IDE..."
        sleep 2

        # 查找Cursor可执行文件
        local cursor_paths=(
            "/Applications/Cursor.app/Contents/MacOS/Cursor"  # macOS
            "/usr/bin/cursor"                                  # Linux
            "/opt/cursor/cursor"                               # Linux alternative
            "$HOME/.local/bin/cursor"                          # User installation
        )

        local cursor_exe=""
        for path in "${cursor_paths[@]}"; do
            if [ -x "$path" ]; then
                cursor_exe="$path"
                break
            fi
        done

        if [ -n "$cursor_exe" ]; then
            nohup "$cursor_exe" "$(pwd)" > /dev/null 2>&1 &
            log_success "✅ Cursor IDE 已重启"
        else
            log_warning "⚠️  未找到Cursor安装路径，请手动启动"
        fi
    fi
}

# 主执行逻辑
main() {
    # 检查必要工具
    if ! command -v bc >/dev/null 2>&1; then
        log_error "需要安装 bc 工具进行数学计算"
        exit 1
    fi

    start_cursor_cleanup

    log_info ""
    log_success "========================================"
    log_success "          🎉 清理完成!"
    log_success "========================================"
    log_info "📊 清理统计:"
    log_success "   💾 释放磁盘空间: $TOTAL_CLEANED MB"
    log_success "   📁 处理项目数: $FILES_PROCESSED 个"

    if [ -n "$BACKUP_PATH" ] && [ -d "$BACKUP_PATH" ]; then
        local backup_size=$(get_folder_size "$BACKUP_PATH")
        log_info "   💼 备份大小: $backup_size MB"
        log_info "   📂 备份位置: $BACKUP_PATH"
    fi

    log_info "   ⏰ 完成时间: $(date)"
    log_info ""

    show_performance_recommendations
    restart_cursor

    log_success "✅ Cursor IDE 性能优化完成!"
}

# 错误处理
trap 'log_error "脚本执行失败，退出码: $?"' ERR

# 运行主函数
main
