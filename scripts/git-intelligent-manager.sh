#!/bin/bash
# =============================================================================
# SmartAbp 智能化Git版本管理脚本
# =============================================================================
# 功能: 网络诊断 + 智能重试 + 分步执行 + 自动同步 + 错误恢复
# 版本: v2.0
# 作者: 首席架构师
# 日期: 2025年9月27日
# =============================================================================

set -e  # 错误时立即退出

# =============================================================================
# 配置常量
# =============================================================================
readonly SCRIPT_NAME="SmartAbp Git智能管理器"
readonly VERSION="v2.0"
readonly MAX_RETRY=3
readonly BASE_TIMEOUT=60
readonly NETWORK_TIMEOUT=10

# 颜色定义
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# =============================================================================
# 日志和显示函数
# =============================================================================
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${CYAN}[$1]${NC} $2"; }

print_banner() {
    echo "========================================"
    echo "   $SCRIPT_NAME $VERSION"
    echo "========================================"
    echo
    echo "🚀 功能: 智能诊断 + 自动重试 + 安全同步"
    echo "⏰ 时间: $(date '+%Y年%m月%d日 %H:%M:%S')"
    echo "📁 目录: $(pwd)"
    echo
}

print_help() {
    cat << EOF
用法: $0 [选项]

选项:
  --check          只执行网络和环境检查
  --sync           执行完整的Git同步操作
  --force          强制推送（谨慎使用）
  --verbose        详细输出模式
  --dry-run        模拟执行，不做实际操作
  --help           显示此帮助信息

示例:
  $0 --check       # 仅检查网络和Git状态
  $0 --sync        # 完整同步（推荐）
  $0 --sync --verbose  # 详细同步过程
EOF
}

# =============================================================================
# 网络诊断功能 (整合原network-diagnostic.sh)
# =============================================================================
check_network_connectivity() {
    log_step "1/5" "基础网络连接测试"
    
    if timeout $NETWORK_TIMEOUT ping -c 3 8.8.8.8 >/dev/null 2>&1; then
        log_success "基础网络连接正常"
    else
        log_warning "基础网络连接失败，将尝试离线操作"
        # 不立即返回错误，继续后续检查
    fi
    
    log_step "2/5" "GitHub连通性测试"
    if timeout $NETWORK_TIMEOUT ping -c 3 github.com >/dev/null 2>&1; then
        log_success "GitHub连接正常"
    else
        log_warning "GitHub连接失败，将使用离线模式"
        return 2
    fi
    
    log_step "3/5" "Git远程仓库测试"
    if timeout $NETWORK_TIMEOUT git ls-remote origin >/dev/null 2>&1; then
        log_success "Git远程仓库访问正常"
    else
        log_warning "Git远程仓库访问失败"
        return 3
    fi
    
    log_step "4/5" "DNS解析测试"
    if timeout $NETWORK_TIMEOUT nslookup github.com >/dev/null 2>&1; then
        log_success "DNS解析正常"
    else
        log_warning "DNS解析失败"
    fi
    
    log_step "5/5" "HTTPS连接测试"
    if timeout $NETWORK_TIMEOUT curl -I https://github.com >/dev/null 2>&1; then
        log_success "HTTPS连接正常"
    else
        log_warning "HTTPS连接不稳定"
    fi
    
    log_success "网络诊断完成"
    return 0
}

# =============================================================================
# 智能重试机制 (整合原retry-decorator.sh)
# =============================================================================
execute_with_retry() {
    local cmd="$1"
    local description="$2"
    local max_attempts="${3:-$MAX_RETRY}"
    local timeout_sec="${4:-$BASE_TIMEOUT}"
    
    local attempt=0
    local backoff=1
    
    log_info "🔄 $description"
    
    while [ $attempt -lt $max_attempts ]; do
        attempt=$((attempt + 1))
        
        log_info "   尝试 $attempt/$max_attempts: $cmd"
        
        if timeout $timeout_sec bash -c "$cmd" 2>/dev/null; then
            log_success "✅ $description 执行成功"
            return 0
        else
            local exit_code=$?
            log_warning "⚠️ 尝试 $attempt 失败 (退出码: $exit_code)"
            
            if [ $attempt -lt $max_attempts ]; then
                log_info "   等待 ${backoff} 秒后重试..."
                sleep $backoff
                backoff=$((backoff * 2))  # 指数退避
            fi
        fi
    done
    
    log_error "❌ $description 最终失败"
    return 1
}

# =============================================================================
# Git环境检查和配置优化
# =============================================================================
optimize_git_config() {
    log_info "🔧 优化Git配置"
    
    # 网络优化配置
    git config --global http.lowSpeedLimit 1000
    git config --global http.lowSpeedTime 300
    git config --global http.postBuffer 524288000
    
    # 性能优化配置
    git config --global core.longpaths true
    git config --global core.autocrlf false
    git config --global core.safecrlf false
    git config --global push.default simple
    git config --global pull.rebase true
    
    # 编码优化配置
    git config --global core.quotepath false
    git config --global core.precomposeunicode true
    
    log_success "Git配置优化完成"
}

check_git_environment() {
    log_step "ENV" "Git环境检查"
    
    # 检查Git是否安装
    if ! command -v git >/dev/null 2>&1; then
        log_error "Git未安装或不在PATH中"
        return 1
    fi
    
    # 检查是否在Git仓库中
    if ! git rev-parse --git-dir >/dev/null 2>&1; then
        log_error "当前目录不是Git仓库"
        return 1
    fi
    
    # 检查远程仓库配置
    if ! git remote get-url origin >/dev/null 2>&1; then
        log_error "未配置origin远程仓库"
        return 1
    fi
    
    # 显示当前状态
    local branch=$(git branch --show-current)
    local remote_url=$(git remote get-url origin)
    
    log_info "   当前分支: $branch"
    log_info "   远程仓库: $remote_url"
    
    log_success "Git环境检查通过"
    return 0
}

# =============================================================================
# 智能Git状态分析
# =============================================================================
analyze_git_status() {
    log_step "STATUS" "分析Git状态"
    
    local status_output=$(git status --porcelain)
    local has_staged=false
    local has_unstaged=false
    local has_untracked=false
    
    if [ -n "$status_output" ]; then
        while IFS= read -r line; do
            case "${line:0:2}" in
                "A " | "M " | "D " | "R " | "C ") has_staged=true ;;
                " M" | " D" | " R") has_unstaged=true ;;
                "??") has_untracked=true ;;
            esac
        done <<< "$status_output"
    fi
    
    # 显示状态分析
    if [ "$has_staged" = true ]; then
        log_info "   📝 发现已暂存的更改"
    fi
    
    if [ "$has_unstaged" = true ]; then
        log_info "   ✏️ 发现未暂存的更改"
    fi
    
    if [ "$has_untracked" = true ]; then
        log_info "   📄 发现未跟踪的文件"
    fi
    
    if [ "$has_staged" = false ] && [ "$has_unstaged" = false ] && [ "$has_untracked" = false ]; then
        log_success "   ✨ 工作区干净"
    fi
    
    # 检查与远程的关系
    local ahead=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")
    local behind=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")
    
    if [ "$ahead" -gt 0 ]; then
        log_info "   ⬆️ 本地领先远程 $ahead 个提交"
    fi
    
    if [ "$behind" -gt 0 ]; then
        log_info "   ⬇️ 本地落后远程 $behind 个提交"
    fi
    
    if [ "$ahead" -eq 0 ] && [ "$behind" -eq 0 ]; then
        log_success "   🎯 本地与远程完全同步"
    fi
    
    return 0
}

# =============================================================================
# 智能提交管理
# =============================================================================
smart_commit() {
    local commit_message="$1"
    
    log_step "COMMIT" "智能提交管理"
    
    # 检查是否有需要提交的更改
    if git diff --cached --quiet && git diff --quiet; then
        # 检查未跟踪文件
        if [ -z "$(git ls-files --others --exclude-standard)" ]; then
            log_info "无需提交（无更改）"
            return 0
        fi
    fi
    
    # 自动暂存所有更改
    log_info "📝 自动暂存所有更改..."
    git add -A
    
    # 智能生成提交消息
    if [ -z "$commit_message" ]; then
        local timestamp=$(date '+%Y%m%d_%H%M%S')
        commit_message="docs: 智能同步更新 - $timestamp

- 自动同步本地更改到远程仓库
- 执行时间: $(date '+%Y年%m月%d日 %H:%M:%S')
- 同步工具: $SCRIPT_NAME $VERSION"
    fi
    
    # 执行提交
    if execute_with_retry "git commit -m \"$commit_message\"" "本地提交" 2 30; then
        log_success "📦 本地提交成功"
        return 0
    else
        log_error "本地提交失败"
        return 1
    fi
}

# =============================================================================
# 智能同步管理
# =============================================================================
smart_sync() {
    log_step "SYNC" "开始智能同步"
    
    # 1. 创建本地备份
    local backup_tag="backup_$(date '+%Y%m%d_%H%M%S')"
    log_info "💾 创建本地备份: $backup_tag"
    git tag "$backup_tag" 2>/dev/null || log_warning "备份标签创建失败（可能已存在）"
    
    # 2. 获取远程更新
    log_info "⬇️ 获取远程更新..."
    if ! execute_with_retry "git fetch origin" "获取远程更新" 3 120; then
        log_error "无法获取远程更新，切换到离线模式"
        return 1
    fi
    
    # 3. 检查是否需要合并
    local ahead=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")
    local behind=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")
    
    if [ "$behind" -gt 0 ]; then
        log_info "🔄 检测到远程更新，执行智能合并..."
        
        if [ "$ahead" -gt 0 ]; then
            log_info "   使用rebase保持提交历史清洁"
            if ! execute_with_retry "git rebase origin/main" "智能rebase" 2 180; then
                log_error "Rebase失败，尝试merge策略"
                if ! execute_with_retry "git merge origin/main" "合并远程更新" 2 120; then
                    log_error "合并失败，需要手动解决冲突"
                    return 1
                fi
            fi
        else
            log_info "   使用fast-forward合并"
            execute_with_retry "git merge --ff-only origin/main" "快进合并" 2 60
        fi
    fi
    
    # 4. 推送到远程
    if [ "$ahead" -gt 0 ] || [ "$(git rev-list --count origin/main..HEAD)" -gt 0 ]; then
        log_info "⬆️ 推送本地提交到远程..."
        
        if execute_with_retry "git push origin main" "推送到远程" 3 300; then
            log_success "🚀 推送成功"
        else
            log_error "推送失败，可能需要手动处理"
            return 1
        fi
    else
        log_info "无需推送（无本地提交）"
    fi
    
    log_success "🎉 智能同步完成"
    return 0
}

# =============================================================================
# 质量门禁集成
# =============================================================================
run_quality_gates() {
    log_step "QUALITY" "执行质量门禁检查"
    
    # 检查质量检查脚本是否存在
    if [ ! -f "scripts/ci-quality-check.sh" ]; then
        log_warning "未找到质量检查脚本，跳过质量门禁"
        return 0
    fi
    
    log_info "🚨 执行SmartAbp质量门禁..."
    
    if execute_with_retry "bash scripts/ci-quality-check.sh" "质量门禁检查" 2 300; then
        log_success "✅ 质量门禁检查通过"
        return 0
    else
        log_error "❌ 质量门禁检查失败"
        log_error "   请修复代码质量问题后重试"
        return 1
    fi
}

# =============================================================================
# 智能错误恢复
# =============================================================================
handle_merge_conflicts() {
    log_step "CONFLICT" "处理合并冲突"
    
    if git diff --name-only --diff-filter=U | grep -q .; then
        log_warning "检测到合并冲突文件:"
        git diff --name-only --diff-filter=U | while read file; do
            log_warning "   - $file"
        done
        
        log_info "冲突解决建议:"
        log_info "   1. 手动编辑冲突文件"
        log_info "   2. 执行 git add <文件名>"
        log_info "   3. 执行 git rebase --continue"
        log_info "   4. 重新运行此脚本"
        
        return 1
    fi
    
    return 0
}

emergency_rollback() {
    local backup_tag="$1"
    
    log_step "ROLLBACK" "执行紧急回滚"
    log_warning "正在回滚到备份点: $backup_tag"
    
    # 保存当前状态
    git stash push -m "Emergency rollback stash - $(date)"
    
    # 回滚到备份点
    if git reset --hard "$backup_tag"; then
        log_success "回滚成功"
        
        # 删除备份标签
        git tag -d "$backup_tag" 2>/dev/null
        
        return 0
    else
        log_error "回滚失败"
        return 1
    fi
}

# =============================================================================
# 环境优化应用
# =============================================================================
apply_environment_optimizations() {
    log_step "CONFIG" "应用环境优化"
    
    # 设置终端编码
    export LANG=zh_CN.UTF-8
    export LC_ALL=zh_CN.UTF-8
    export LESSCHARSET=utf-8
    export MSYS_NO_PATHCONV=1
    export MSYS2_ARG_CONV_EXCL="*"
    
    # 应用Git配置优化
    optimize_git_config
    
    log_success "环境优化应用完成"
}

optimize_git_config() {
    # 网络优化
    git config --global http.lowSpeedLimit 1000
    git config --global http.lowSpeedTime 300
    git config --global http.postBuffer 524288000
    git config --global http.maxRequestBuffer 100M
    
    # 性能优化
    git config --global core.longpaths true
    git config --global core.autocrlf false
    git config --global core.safecrlf false
    git config --global core.compression 9
    
    # 工作流优化
    git config --global push.default simple
    git config --global pull.rebase true
    git config --global core.editor "code --wait"
    
    # 编码优化
    git config --global core.quotepath false
    git config --global core.precomposeunicode true
}

# =============================================================================
# 主执行流程
# =============================================================================
main() {
    local action="sync"
    local verbose=false
    local dry_run=false
    local force=false
    local check_only=false
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            --check)
                check_only=true
                shift
                ;;
            --sync)
                action="sync"
                shift
                ;;
            --force)
                force=true
                shift
                ;;
            --verbose)
                verbose=true
                shift
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            --help)
                print_help
                exit 0
                ;;
            *)
                log_error "未知参数: $1"
                print_help
                exit 1
                ;;
        esac
    done
    
    # 显示横幅
    print_banner
    
    # 应用环境优化
    apply_environment_optimizations
    
    # 检查Git环境
    if ! check_git_environment; then
        log_error "Git环境检查失败"
        exit 1
    fi
    
    # 网络连接检查
    check_network_connectivity
    local network_status=$?
    
    if [ $check_only = true ]; then
        log_info "🏁 仅检查模式完成"
        exit 0
    fi
    
    # 如果是dry-run模式
    if [ $dry_run = true ]; then
        log_info "🧪 模拟执行模式，不做实际操作"
        analyze_git_status
        exit 0
    fi
    
    # 分析Git状态
    analyze_git_status
    
    # 执行同步操作
    case $action in
        sync)
            # 质量门禁检查
            if ! run_quality_gates; then
                log_error "质量门禁失败，终止同步"
                exit 1
            fi
            
            # 智能提交
            if ! smart_commit; then
                log_error "智能提交失败"
                exit 1
            fi
            
            # 智能同步
            if ! smart_sync; then
                log_error "智能同步失败"
                
                # 检查是否需要冲突处理
                handle_merge_conflicts
                
                exit 1
            fi
            
            # 最终状态报告
            echo "========================================"
            echo "          🎉 同步完成报告"
            echo "========================================"
            echo
            git log --oneline -5
            echo
            log_success "✅ SmartAbp Git智能同步完成！"
            ;;
        *)
            log_error "未知操作: $action"
            exit 1
            ;;
    esac
}

# =============================================================================
# 错误处理和清理
# =============================================================================
cleanup() {
    local exit_code=$?
    
    if [ $exit_code -ne 0 ]; then
        log_error "脚本执行异常，退出码: $exit_code"
        log_info "💡 故障排除建议:"
        log_info "   1. 检查网络连接: bash $0 --check"
        log_info "   2. 查看详细日志: bash $0 --sync --verbose"
        log_info "   3. 模拟执行: bash $0 --dry-run"
        log_info "   4. 手动解决冲突后重试"
    fi
}

# 设置错误处理
trap cleanup EXIT

# =============================================================================
# 脚本入口
# =============================================================================
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
