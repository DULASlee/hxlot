#!/bin/bash
# SmartAbp Git 配置检查脚本
# 检查Git配置完整性和最佳实践合规性

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
echo "   SmartAbp Git 配置检查工具"
echo "========================================"
echo

# 检查项目根目录
if [ ! -d ".git" ]; then
    log_error "当前目录不是Git仓库!"
    exit 1
fi

TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

check_passed() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    log_success "$1 ✓"
}

check_failed() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    log_error "$1 ✗"
}

check_warning() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    WARNING_CHECKS=$((WARNING_CHECKS + 1))
    log_warning "$1 ⚠"
}

# [1/8] 检查基础Git配置文件
log_step "1/8" "检查基础Git配置文件..."

if [ -f ".gitignore" ]; then
    check_passed ".gitignore 文件存在"
else
    check_failed ".gitignore 文件缺失"
fi

if [ -f ".gitattributes" ]; then
    check_passed ".gitattributes 文件存在"
else
    check_failed ".gitattributes 文件缺失"
fi

if [ -f ".gitmessage" ]; then
    check_passed ".gitmessage 提交模板存在"
else
    check_warning ".gitmessage 提交模板缺失"
fi

if [ -f ".gitconfig.example" ]; then
    check_passed ".gitconfig.example 配置示例存在"
else
    check_warning ".gitconfig.example 配置示例缺失"
fi

echo

# [2/8] 检查Git hooks
log_step "2/8" "检查Git hooks..."

if [ -f ".git/hooks/pre-commit" ] && [ -x ".git/hooks/pre-commit" ]; then
    check_passed "pre-commit hook 已安装且可执行"
else
    check_failed "pre-commit hook 缺失或不可执行"
fi

if [ -f ".git/hooks/commit-msg" ] && [ -x ".git/hooks/commit-msg" ]; then
    check_passed "commit-msg hook 已安装且可执行"
else
    check_warning "commit-msg hook 缺失或不可执行"
fi

if [ -f ".git/hooks/pre-push" ] && [ -x ".git/hooks/pre-push" ]; then
    check_passed "pre-push hook 已安装且可执行"
else
    check_warning "pre-push hook 缺失或不可执行"
fi

echo

# [3/8] 检查Git全局配置
log_step "3/8" "检查Git全局配置..."

USER_NAME=$(git config --global user.name 2>/dev/null || echo "")
if [ -n "$USER_NAME" ]; then
    check_passed "全局用户名已配置: $USER_NAME"
else
    check_failed "全局用户名未配置"
fi

USER_EMAIL=$(git config --global user.email 2>/dev/null || echo "")
if [ -n "$USER_EMAIL" ]; then
    check_passed "全局邮箱已配置: $USER_EMAIL"
else
    check_failed "全局邮箱未配置"
fi

CORE_AUTOCRLF=$(git config --global core.autocrlf 2>/dev/null || echo "")
if [ "$CORE_AUTOCRLF" = "input" ] || [ "$CORE_AUTOCRLF" = "false" ]; then
    check_passed "换行符配置正确: $CORE_AUTOCRLF"
else
    check_warning "建议设置 core.autocrlf = input"
fi

echo

# [4/8] 检查项目特定Git配置
log_step "4/8" "检查项目特定Git配置..."

# 检查提交模板配置
COMMIT_TEMPLATE=$(git config --local commit.template 2>/dev/null || echo "")
if [ -n "$COMMIT_TEMPLATE" ]; then
    check_passed "提交模板已配置: $COMMIT_TEMPLATE"
else
    check_warning "建议配置提交模板: git config commit.template .gitmessage"
fi

# 检查默认分支
DEFAULT_BRANCH=$(git config --local init.defaultBranch 2>/dev/null || echo "")
if [ "$DEFAULT_BRANCH" = "main" ]; then
    check_passed "默认分支配置为 main"
else
    check_warning "建议设置默认分支为 main"
fi

echo

# [5/8] 检查.gitignore内容
log_step "5/8" "检查.gitignore内容..."

if [ -f ".gitignore" ]; then
    # 检查关键忽略规则
    if grep -q "node_modules" .gitignore; then
        check_passed ".gitignore 包含 node_modules"
    else
        check_failed ".gitignore 缺少 node_modules"
    fi

    if grep -q "bin/" .gitignore; then
        check_passed ".gitignore 包含 bin/"
    else
        check_failed ".gitignore 缺少 bin/"
    fi

    if grep -q "obj/" .gitignore; then
        check_passed ".gitignore 包含 obj/"
    else
        check_failed ".gitignore 缺少 obj/"
    fi

    if grep -q "\.env" .gitignore; then
        check_passed ".gitignore 包含 .env"
    else
        check_failed ".gitignore 缺少 .env (安全风险)"
    fi
fi

echo

# [6/8] 检查Git安全设置
log_step "6/8" "检查Git安全设置..."

# 检查是否启用了签名提交
SIGNING_KEY=$(git config --global user.signingkey 2>/dev/null || echo "")
if [ -n "$SIGNING_KEY" ]; then
    check_passed "GPG签名密钥已配置"
else
    check_warning "建议配置GPG签名提交"
fi

# 检查是否有敏感文件被跟踪
SENSITIVE_FILES=$(git ls-files | grep -E "\.(key|pem|p12|pfx)$" || echo "")
if [ -z "$SENSITIVE_FILES" ]; then
    check_passed "未发现敏感文件被跟踪"
else
    check_failed "发现敏感文件被跟踪: $SENSITIVE_FILES"
fi

echo

# [7/8] 检查Git工作流配置
log_step "7/8" "检查Git工作流配置..."

# 检查远程仓库配置
REMOTES=$(git remote -v 2>/dev/null | wc -l)
if [ "$REMOTES" -gt 0 ]; then
    check_passed "远程仓库已配置"
    git remote -v | while read line; do
        echo "     $line"
    done
else
    check_warning "未配置远程仓库"
fi

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ -n "$CURRENT_BRANCH" ]; then
    check_passed "当前分支: $CURRENT_BRANCH"
else
    check_warning "无法确定当前分支"
fi

echo

# [8/8] 检查Git性能配置
log_step "8/8" "检查Git性能配置..."

# 检查Git版本
GIT_VERSION=$(git --version | cut -d' ' -f3)
check_passed "Git版本: $GIT_VERSION"

# 检查仓库大小
REPO_SIZE=$(du -sh .git 2>/dev/null | cut -f1)
if [ -n "$REPO_SIZE" ]; then
    check_passed "仓库大小: $REPO_SIZE"
fi

# 检查对象数量
OBJECT_COUNT=$(git count-objects -v 2>/dev/null | grep "count" | cut -d' ' -f2)
if [ -n "$OBJECT_COUNT" ]; then
    check_passed "Git对象数量: $OBJECT_COUNT"
fi

echo

# 生成检查报告
echo "========================================"
echo "          🎉 检查完成!"
echo "========================================"
echo
echo "📊 检查统计:"
echo "   ✅ 通过: $PASSED_CHECKS 项"
echo "   ⚠️  警告: $WARNING_CHECKS 项"
echo "   ❌ 失败: $FAILED_CHECKS 项"
echo "   📝 总计: $TOTAL_CHECKS 项"
echo

# 计算合规率
if [ "$TOTAL_CHECKS" -gt 0 ]; then
    COMPLIANCE_RATE=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))
    echo "🎯 Git配置合规率: $COMPLIANCE_RATE%"
    echo
fi

# 提供建议
if [ "$FAILED_CHECKS" -gt 0 ]; then
    echo "🔧 修复建议:"
    echo "   1. 运行 scripts/setup-git-hooks.sh 安装Git hooks"
    echo "   2. 配置全局Git设置: git config --global user.name '你的姓名'"
    echo "   3. 配置全局Git设置: git config --global user.email '你的邮箱'"
    echo "   4. 检查并更新 .gitignore 文件"
    echo
fi

if [ "$WARNING_CHECKS" -gt 0 ]; then
    echo "💡 优化建议:"
    echo "   1. 配置提交模板: git config commit.template .gitmessage"
    echo "   2. 启用GPG签名提交"
    echo "   3. 设置默认分支为 main"
    echo "   4. 优化Git性能配置"
    echo
fi

echo "📚 更多信息:"
echo "   - Git配置指南: docs/git-configuration.md"
echo "   - 环境变量配置: docs/environment-variables.md"
echo "   - 项目开发规范: docs/项目开发规范总览.md"
echo

# 退出码
if [ "$FAILED_CHECKS" -gt 0 ]; then
    exit 1
else
    exit 0
fi
