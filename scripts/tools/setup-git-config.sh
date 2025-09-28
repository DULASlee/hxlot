#!/bin/bash
# SmartAbp Git 配置快速设置脚本
# 一键配置Git最佳实践设置

set -e

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

echo "========================================"
echo "   SmartAbp Git 配置快速设置"
echo "========================================"
echo

# 检查是否在Git仓库中
if [ ! -d ".git" ]; then
    log_error "当前目录不是Git仓库!"
    exit 1
fi

# [1/6] 设置提交模板
log_step "1/6" "配置Git提交模板..."

if [ -f ".gitmessage" ]; then
    git config commit.template .gitmessage
    log_success "提交模板已配置"
else
    log_warning ".gitmessage 文件不存在，跳过配置"
fi

echo

# [2/6] 配置基础Git设置
log_step "2/6" "配置基础Git设置..."

# 检查并配置用户信息
USER_NAME=$(git config --global user.name 2>/dev/null || echo "")
if [ -z "$USER_NAME" ]; then
    read -p "请输入您的姓名: " INPUT_NAME
    if [ -n "$INPUT_NAME" ]; then
        git config --global user.name "$INPUT_NAME"
        log_success "已配置用户名: $INPUT_NAME"
    fi
else
    log_info "用户名已配置: $USER_NAME"
fi

USER_EMAIL=$(git config --global user.email 2>/dev/null || echo "")
if [ -z "$USER_EMAIL" ]; then
    read -p "请输入您的邮箱: " INPUT_EMAIL
    if [ -n "$INPUT_EMAIL" ]; then
        git config --global user.email "$INPUT_EMAIL"
        log_success "已配置邮箱: $INPUT_EMAIL"
    fi
else
    log_info "邮箱已配置: $USER_EMAIL"
fi

echo

# [3/6] 配置Git行为设置
log_step "3/6" "配置Git行为设置..."

# 配置换行符处理
git config --global core.autocrlf input
log_success "已配置换行符处理: input"

# 配置默认分支
git config --global init.defaultBranch main
log_success "已配置默认分支: main"

# 配置推送策略
git config --global push.default simple
log_success "已配置推送策略: simple"

# 配置拉取策略
git config --global pull.rebase true
log_success "已配置拉取策略: rebase"

echo

# [4/6] 配置Git别名
log_step "4/6" "配置Git实用别名..."

# 基础别名
git config --global alias.st status
git config --global alias.ci commit
git config --global alias.co checkout
git config --global alias.br branch

# 日志别名
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"

# SmartAbp专用别名
git config --global alias.sync "!bash scripts/git-safe-sync.sh"
git config --global alias.quality-check "!bash scripts/local-quality-check.sh"

log_success "已配置实用别名"

echo

# [5/6] 配置Git安全设置
log_step "5/6" "配置Git安全设置..."

# 启用传输检查
git config --global transfer.fsckobjects true
git config --global receive.fsckObjects true
log_success "已启用传输安全检查"

# 配置编辑器
if command -v code &> /dev/null; then
    git config --global core.editor "code --wait"
    log_success "已配置编辑器: VS Code"
elif command -v vim &> /dev/null; then
    git config --global core.editor vim
    log_success "已配置编辑器: Vim"
fi

echo

# [6/6] 配置性能优化
log_step "6/6" "配置性能优化..."

# 配置并行处理
git config --global fetch.parallel 4
git config --global pack.threads 4
log_success "已配置并行处理"

# 配置垃圾回收
git config --global gc.auto 256
log_success "已配置垃圾回收"

# 启用文件系统监控 (如果支持)
if git config --global core.fsmonitor true 2>/dev/null; then
    log_success "已启用文件系统监控"
else
    log_info "文件系统监控不支持，跳过"
fi

echo

# 显示当前配置
echo "========================================"
echo "          🎉 配置完成!"
echo "========================================"
echo

log_info "当前Git配置:"
echo
git config --global --list | grep -E "(user|core|push|pull|alias)" | head -15

echo
echo "🔧 其他建议:"
echo "   1. 考虑配置GPG签名: git config --global commit.gpgsign true"
echo "   2. 安装Git hooks: bash scripts/setup-git-hooks.sh"
echo "   3. 检查配置完整性: bash scripts/git-config-check.sh"
echo

echo "📚 更多信息:"
echo "   - 完整配置示例: .gitconfig.example"
echo "   - 环境变量配置: docs/environment-variables.md"
echo "   - Git配置检查: scripts/git-config-check.sh"
echo

log_success "Git配置设置完成!"
