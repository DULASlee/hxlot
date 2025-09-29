#!/bin/bash

# SmartAbp 包依赖管理脚本
# 统一管理和更新包间依赖关系，确保版本一致性

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📦 SmartAbp 包依赖管理器${NC}"
echo "========================================"

# 切换到项目根目录
cd "$(dirname "$0")/../.."
FRONTEND_DIR="src/SmartAbp.Vue"

# 显示帮助信息
show_help() {
    echo "用法: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "命令:"
    echo "  check           检查包依赖状态"
    echo "  sync            同步包版本号"
    echo "  install         安装所有包依赖"
    echo "  update          更新包依赖"
    echo "  validate        验证依赖完整性"
    echo "  graph           显示依赖关系图"
    echo ""
    echo "选项:"
    echo "  --fix           自动修复发现的问题"
    echo "  --dry-run       仅显示变更，不执行"
    echo "  -h, --help      显示帮助信息"
}

# 记录函数
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 获取包列表
get_packages() {
    find "$FRONTEND_DIR/packages" -name "package.json" -exec dirname {} \; | sort
}

# 检查包依赖状态
check_dependencies() {
    log "检查包依赖状态..."
    
    local issues=0
    local packages=($(get_packages))
    
    echo ""
    echo "📋 包依赖状态报告:"
    echo "----------------------------------------"
    
    for package_dir in "${packages[@]}"; do
        local package_name=$(basename "$package_dir")
        local package_json="$package_dir/package.json"
        
        echo ""
        echo "📦 $package_name:"
        
        # 检查package.json是否存在
        if [ ! -f "$package_json" ]; then
            error "  ❌ 缺少 package.json"
            issues=$((issues + 1))
            continue
        fi
        
        # 检查基本字段
        local name=$(jq -r '.name // empty' "$package_json")
        local version=$(jq -r '.version // empty' "$package_json")
        local main=$(jq -r '.main // empty' "$package_json")
        local types=$(jq -r '.types // empty' "$package_json")
        
        if [ -z "$name" ]; then
            warn "  ⚠️  缺少 name 字段"
            issues=$((issues + 1))
        else
            echo "  ✅ name: $name"
        fi
        
        if [ -z "$version" ]; then
            warn "  ⚠️  缺少 version 字段"
            issues=$((issues + 1))
        else
            echo "  ✅ version: $version"
        fi
        
        if [ -z "$main" ]; then
            warn "  ⚠️  缺少 main 字段"
        else
            echo "  ✅ main: $main"
        fi
        
        if [ -z "$types" ]; then
            warn "  ⚠️  缺少 types 字段"
        else
            echo "  ✅ types: $types"
        fi
        
        # 检查依赖
        local deps=$(jq -r '.dependencies // {} | keys[]' "$package_json" 2>/dev/null)
        local peer_deps=$(jq -r '.peerDependencies // {} | keys[]' "$package_json" 2>/dev/null)
        
        if [ -n "$deps" ]; then
            echo "  📦 dependencies: $(echo $deps | tr '\n' ', ' | sed 's/, $//')"
        fi
        
        if [ -n "$peer_deps" ]; then
            echo "  🔗 peerDependencies: $(echo $peer_deps | tr '\n' ', ' | sed 's/, $//')"
        fi
        
        # 检查构建产物
        local dist_dir="$package_dir/dist"
        if [ -d "$dist_dir" ]; then
            echo "  ✅ 构建产物存在"
        else
            warn "  ⚠️  缺少构建产物"
        fi
    done
    
    echo ""
    if [ $issues -eq 0 ]; then
        success "所有包依赖状态正常"
    else
        warn "发现 $issues 个问题需要处理"
    fi
    
    return $issues
}

# 同步包版本号
sync_versions() {
    log "同步包版本号..."
    
    local fix_mode=${1:-false}
    local packages=($(get_packages))
    local base_version="1.0.0"
    
    echo ""
    echo "🔄 版本同步操作:"
    echo "----------------------------------------"
    
    for package_dir in "${packages[@]}"; do
        local package_name=$(basename "$package_dir")
        local package_json="$package_dir/package.json"
        
        if [ ! -f "$package_json" ]; then
            warn "跳过 $package_name (无 package.json)"
            continue
        fi
        
        local current_version=$(jq -r '.version // empty' "$package_json")
        
        if [ "$current_version" != "$base_version" ]; then
            echo "📦 $package_name: $current_version → $base_version"
            
            if [ "$fix_mode" = true ]; then
                jq ".version = \"$base_version\"" "$package_json" > "$package_json.tmp"
                mv "$package_json.tmp" "$package_json"
                success "  ✅ 已更新版本号"
            else
                echo "  🔍 (dry-run) 将更新版本号"
            fi
        else
            echo "📦 $package_name: ✅ 版本号已同步"
        fi
    done
}

# 安装依赖
install_dependencies() {
    log "安装包依赖..."
    
    cd "$FRONTEND_DIR"
    
    # 安装主应用依赖
    echo ""
    echo "📦 安装主应用依赖:"
    npm ci
    
    # 构建packages（这会处理内部依赖）
    echo ""
    echo "🔨 构建packages:"
    if npx tsc --build tsconfig.references.json; then
        success "packages构建成功"
    else
        warn "packages构建有警告，但继续"
    fi
    
    cd - > /dev/null
}

# 验证依赖完整性
validate_dependencies() {
    log "验证依赖完整性..."
    
    local issues=0
    local packages=($(get_packages))
    
    echo ""
    echo "🔍 依赖完整性检查:"
    echo "----------------------------------------"
    
    # 检查循环依赖
    echo ""
    echo "🔄 循环依赖检查:"
    
    # 简化的循环依赖检测
    for package_dir in "${packages[@]}"; do
        local package_name=$(basename "$package_dir")
        local package_json="$package_dir/package.json"
        
        if [ ! -f "$package_json" ]; then
            continue
        fi
        
        # 检查是否依赖了不应该依赖的包
        case $package_name in
            "lowcode-shared")
                if jq -e '.dependencies | has("@smartabp/lowcode-core") or has("@smartabp/lowcode-designer") or has("@smartabp/lowcode-api")' "$package_json" > /dev/null 2>&1; then
                    error "  ❌ lowcode-shared 不应依赖高级包"
                    issues=$((issues + 1))
                else
                    echo "  ✅ lowcode-shared 依赖正确"
                fi
                ;;
            "lowcode-core")
                if jq -e '.dependencies | has("@smartabp/lowcode-designer")' "$package_json" > /dev/null 2>&1; then
                    error "  ❌ lowcode-core 不应依赖 lowcode-designer"
                    issues=$((issues + 1))
                else
                    echo "  ✅ lowcode-core 依赖正确"
                fi
                ;;
        esac
    done
    
    # 检查版本一致性
    echo ""
    echo "📊 版本一致性检查:"
    
    local versions=()
    for package_dir in "${packages[@]}"; do
        local package_json="$package_dir/package.json"
        if [ -f "$package_json" ]; then
            local version=$(jq -r '.version // empty' "$package_json")
            if [ -n "$version" ]; then
                versions+=("$version")
            fi
        fi
    done
    
    local unique_versions=($(printf '%s\n' "${versions[@]}" | sort -u))
    
    if [ ${#unique_versions[@]} -eq 1 ]; then
        echo "  ✅ 所有包版本一致: ${unique_versions[0]}"
    else
        warn "  ⚠️  发现不同版本: ${unique_versions[*]}"
        issues=$((issues + 1))
    fi
    
    echo ""
    if [ $issues -eq 0 ]; then
        success "依赖完整性验证通过"
    else
        warn "发现 $issues 个完整性问题"
    fi
    
    return $issues
}

# 显示依赖关系图
show_dependency_graph() {
    log "生成依赖关系图..."
    
    echo ""
    echo "🌐 SmartAbp 包依赖关系图:"
    echo "========================================"
    echo ""
    echo "  ┌─────────────────┐"
    echo "  │  lowcode-shared │ ← 基础共享库"
    echo "  └─────────────────┘"
    echo "           ↑"
    echo "    ┌──────┴──────┐"
    echo "    │             │"
    echo "  ┌─────────────┐ ┌─────────────┐"
    echo "  │ lowcode-api │ │lowcode-tools│ ← 中间层"
    echo "  └─────────────┘ └─────────────┘"
    echo "           ↑             ↑"
    echo "    ┌──────┴──────┬──────┘"
    echo "    │             │"
    echo "  ┌─────────────┐ ┌──────────────────┐"
    echo "  │lowcode-core │ │ lowcode-designer │ ← 应用层"
    echo "  └─────────────┘ └──────────────────┘"
    echo ""
    echo "📋 依赖原则:"
    echo "• lowcode-shared: 无依赖，被所有包依赖"
    echo "• lowcode-api/tools: 仅依赖 lowcode-shared"
    echo "• lowcode-core/designer: 可依赖下层包"
    echo "• 严禁循环依赖和逆向依赖"
}

# 主函数
main() {
    local command=${1:-check}
    local fix_mode=false
    local dry_run=false
    
    # 解析参数
    shift || true
    while [[ $# -gt 0 ]]; do
        case $1 in
            --fix)
                fix_mode=true
                shift
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 检查依赖工具
    if ! command -v jq &> /dev/null; then
        error "需要安装 jq 工具: brew install jq"
        exit 1
    fi
    
    case $command in
        check)
            check_dependencies
            ;;
        sync)
            sync_versions $fix_mode
            ;;
        install)
            install_dependencies
            ;;
        update)
            log "更新依赖..."
            sync_versions $fix_mode
            install_dependencies
            ;;
        validate)
            validate_dependencies
            ;;
        graph)
            show_dependency_graph
            ;;
        *)
            error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
