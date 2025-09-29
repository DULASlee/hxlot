#!/bin/bash
# SmartAbp Git Safe Sync - 企业级版本管理工具 (Linux/Mac版本)
# 功能: 备份 → 拉取 → 合并 → 推送

set -e  # 遇到错误立即退出

# 参数处理
AUTO_COMMIT=false
NON_INTERACTIVE=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --auto-commit|-a)
            AUTO_COMMIT=true
            shift
            ;;
        --non-interactive|-n)
            NON_INTERACTIVE=true
            AUTO_COMMIT=true  # 非交互模式自动启用自动提交
            shift
            ;;
        --dry-run|-d)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            echo "用法: $0 [选项]"
            echo "选项:"
            echo "  -a, --auto-commit     自动提交本地更改"
            echo "  -n, --non-interactive 非交互模式(自动处理所有确认)"
            echo "  -d, --dry-run         预演模式(不执行实际操作)"
            echo "  -h, --help            显示此帮助信息"
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
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[$1]${NC} $2"
}

# 错误处理函数
handle_error() {
    log_error "脚本执行失败，退出码: $1"
    echo
    echo "💡 故障排除建议:"
    echo "   1. 检查网络连接到GitHub"
    echo "   2. 验证Git配置和权限"
    echo "   3. 检查是否有合并冲突"
    if [ ! -z "$BACKUP_TAG" ]; then
        echo "   4. 使用备份恢复: git reset --hard $BACKUP_TAG"
    fi
    echo
    exit $1
}

# 设置错误处理
trap 'handle_error $?' ERR

echo "========================================"
echo "   SmartAbp 企业级Git安全同步工具"
echo "========================================"
echo
echo "功能: 备份 → 拉取 → 合并 → 推送"
echo "时间: $(date)"
echo "模式: $(if [ "$NON_INTERACTIVE" = true ]; then echo "非交互模式"; elif [ "$DRY_RUN" = true ]; then echo "预演模式"; else echo "交互模式"; fi)"
echo

# 切换到项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$PROJECT_ROOT"

log_info "项目根目录: $PROJECT_ROOT"
echo

# [1/6] 环境检查
log_step "1/6" "环境检查..."

if [ ! -d ".git" ]; then
    log_error "当前目录不是Git仓库!"
    exit 1
fi

if ! command -v git &> /dev/null; then
    log_error "Git未安装或不在PATH中!"
    exit 1
fi

log_success "Git环境检查通过 ✓"
echo

# [2/6] 本地状态检查
log_step "2/6" "检查本地Git状态..."

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    log_warning "检测到本地未提交的更改"
    git status --porcelain | while read line; do
        echo "     发现未提交的更改: $line"
    done

    if [ "$NON_INTERACTIVE" = true ]; then
        log_info "非交互模式：自动提交本地更改..."
        SHOULD_COMMIT=true
    else
        read -p "是否自动提交本地更改? (y/N): " USER_INPUT
        SHOULD_COMMIT=$([ "$USER_INPUT" = "y" ] || [ "$USER_INPUT" = "Y" ])
    fi

    if [ "$SHOULD_COMMIT" = true ]; then
        log_info "正在自动提交本地更改..."
        if [ "$DRY_RUN" = false ]; then
            git add .
            git commit -m "自动提交: $(date) - Git安全同步前的本地更改"
        fi
        log_success "本地更改已自动提交"
    else
        log_warning "本地有未提交更改，请先手动处理"
        echo
        git status
        exit 1
    fi
else
    log_success "本地工作区干净 ✓"
fi
echo

# [3/6] 创建本地备份
log_step "3/6" "创建本地Git备份..."

BACKUP_DIR="tools/git/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"
BACKUP_TAG="backup_$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

# 获取当前分支和HEAD
CURRENT_BRANCH=$(git branch --show-current)
CURRENT_HEAD=$(git rev-parse HEAD)

# 保存备份信息
echo "$CURRENT_BRANCH" > "${BACKUP_PATH}_branch.txt"
echo "$CURRENT_HEAD" > "${BACKUP_PATH}_head.txt"

# 创建备份标签
if [ "$DRY_RUN" = true ]; then
    log_info "[DRY RUN] 将创建备份标签: $BACKUP_TAG"
else
    if git tag "$BACKUP_TAG" HEAD; then
        log_success "本地备份已创建: $BACKUP_TAG"
        log_info "📁 备份位置: $BACKUP_PATH"
    else
        log_warning "备份标签创建失败，但继续执行..."
    fi
fi
echo

# [4/6] 拉取远程更新
log_step "4/6" "拉取远程仓库更新..."

log_info "正在获取远程更新信息..."
if [ "$DRY_RUN" = false ]; then
    git fetch origin
fi

# 检查是否有远程更新
REMOTE_COMMITS=$(git rev-list HEAD..origin/$CURRENT_BRANCH --count)

if [ "$REMOTE_COMMITS" = "0" ]; then
    log_info "ℹ️  远程仓库无新更新"
    HAS_REMOTE_UPDATES=0
else
    log_info "📥 发现 $REMOTE_COMMITS 个远程提交需要合并"
    HAS_REMOTE_UPDATES=1

    echo "     远程更新概要:"
    git log --oneline HEAD..origin/$CURRENT_BRANCH --max-count=5 | sed 's/^/       /'
fi
echo

# [5/6] 合并远程更新
if [ "$HAS_REMOTE_UPDATES" = "1" ]; then
    log_step "5/6" "合并远程更新到本地..."
    log_info "使用策略: merge (保留完整历史)"

    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] 将合并远程更新"
        log_success "[DRY RUN] 模拟合并成功 ✅"
    elif git merge origin/$CURRENT_BRANCH --no-edit; then
        log_success "远程更新合并成功 ✅"
    else
        log_error "合并失败! 可能存在冲突"
        echo
        echo "🚨 冲突解决指南:"
        echo "   1. 使用 'git status' 查看冲突文件"
        echo "   2. 手动编辑冲突文件"
        echo "   3. 使用 'git add .' 标记已解决"
        echo "   4. 使用 'git commit' 完成合并"
        echo "   5. 重新运行此脚本"
        echo
        echo "💡 备份恢复方法:"
        echo "   git reset --hard $BACKUP_TAG"
        echo
        exit 1
    fi
else
    log_step "5/6" "跳过合并 (无远程更新)"
fi
echo

# [6/6] 推送到远程仓库
log_step "6/6" "推送合并后的版本到远程仓库..."

# 检查是否有本地提交需要推送
LOCAL_COMMITS=$(git rev-list origin/$CURRENT_BRANCH..HEAD --count)

if [ "$LOCAL_COMMITS" = "0" ]; then
    log_info "ℹ️  无本地提交需要推送"
    log_info "📊 本地与远程已同步"
else
    log_info "📤 推送 $LOCAL_COMMITS 个本地提交到远程仓库..."

    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] 将推送 $LOCAL_COMMITS 个本地提交"
        log_success "[DRY RUN] 模拟推送成功 ✅"
    elif git push origin $CURRENT_BRANCH; then
        log_success "推送成功 ✅"
    else
        log_error "推送失败!"
        echo
        echo "💡 可能的解决方案:"
        echo "   1. 检查网络连接"
        echo "   2. 验证远程仓库权限"
        echo "   3. 使用备份恢复: git reset --hard $BACKUP_TAG"
        echo
        exit 1
    fi
fi

echo
echo "========================================"
echo "          🎉 Git同步完成!"
echo "========================================"
echo
echo "📊 同步统计:"
echo "   📥 远程提交合并: $REMOTE_COMMITS 个"
echo "   📤 本地提交推送: $LOCAL_COMMITS 个"
echo "   💾 备份标签: $BACKUP_TAG"
echo "   🌿 当前分支: $CURRENT_BRANCH"
echo
echo "🔄 同步结果: 本地与远程仓库完全同步"
echo "⏰ 完成时间: $(date)"
echo

# 清理旧备份 (保留最近10个)
log_info "🧹 清理旧备份 (保留最近10个)..."
BACKUP_COUNT=0
git tag -l "backup_*" --sort=-creatordate | while read tag; do
    BACKUP_COUNT=$((BACKUP_COUNT + 1))
    if [ $BACKUP_COUNT -gt 10 ]; then
        git tag -d "$tag" >/dev/null 2>&1 || true
        echo "     删除旧备份: $tag"
    fi
done

echo
echo "🎯 提示: 可以将此脚本添加到crontab中定期执行"
echo "📝 日志文件: 考虑添加详细日志记录功能"
echo
echo "✅ Git同步脚本执行完成!"
