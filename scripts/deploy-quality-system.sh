#!/bin/bash

# SmartAbp低代码引擎质量保障系统部署脚本
# 首席测试架构师设计 - 企业级部署方案

set -e

echo "🚀 开始部署SmartAbp质量保障系统..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    local missing_deps=()
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("Node.js")
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    # 检查.NET Core
    if ! command -v dotnet &> /dev/null; then
        log_warning "未找到.NET Core，部分功能可能受限"
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        log_error "缺少必要依赖: ${missing_deps[*]}"
        exit 1
    fi
    
    log_success "系统依赖检查完成"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    cd src/SmartAbp.Vue
    
    if [ ! -f "package.json" ]; then
        log_error "未找到package.json文件"
        exit 1
    fi
    
    npm ci
    if [ $? -ne 0 ]; then
        log_error "npm安装失败"
        exit 1
    fi
    
    # 安装全局工具
    # npm install -g eslint --registry=https://registry.npmmirror.com
    log_warning "全局安装eslint已移除，请确保其已作为项目的devDependency安装。"
    
    cd ../..
    log_success "依赖安装完成"
}

# 构建项目
build_project() {
    log_info "构建项目..."
    
    # 构建.NET项目
    if command -v dotnet &> /dev/null; then
        cd src/SmartAbp.CodeGenerator
        dotnet build --configuration Release
        if [ $? -ne 0 ]; then
            log_error "项目构建失败"
            exit 1
        fi
        cd ../..
    else
        log_warning "跳过.NET项目构建，未安装.NET Core"
    fi
    
    log_success "项目构建完成"
}

# 配置质量系统
setup_quality_system() {
    log_info "配置质量保障系统..."
    
    # 创建报告目录
    mkdir -p artifacts/quality-reports artifacts/security-reports artifacts/performance-reports
    
    # 复制配置文件
    cp config/quality-config.json ./
    
    # 设置执行权限
    chmod +x src/SmartAbp.Vue/scripts/*.js
    
    log_success "质量系统配置完成"
}

# 运行初始质量检查
run_initial_quality_check() {
    log_info "运行初始质量检查..."
    
    cd src/SmartAbp.Vue
    
    # 运行代码质量检查
    log_info "执行代码质量检查..."
    node scripts/code-quality-engine.js
    
    # 运行安全扫描
    log_info "执行安全扫描..."
    node scripts/security-scanner.js
    
    # 运行性能分析
    log_info "执行性能分析..."
    node scripts/performance-analyzer.js
    
    cd ../..
    
    log_success "初始质量检查完成"
}

# 配置GitHub Actions
setup_github_actions() {
    log_info "配置GitHub Actions..."
    
    if [ ! -d ".github/workflows" ]; then
        mkdir -p .github/workflows
    fi
    
    # 确保工作流文件存在
    if [ ! -f ".github/workflows/code-quality-check.yml" ]; then
        log_warning "GitHub Actions工作流文件未找到"
    fi
    
    log_success "GitHub Actions配置完成"
}

# 创建环境配置
create_environment_config() {
    log_info "创建环境配置文件..."
    
    cat > .env.quality << EOF
# SmartAbp质量保障系统环境配置
# 首席测试架构师设计

# 质量门禁阈值
QUALITY_OVERALL_THRESHOLD=80
QUALITY_COVERAGE_THRESHOLD=75
QUALITY_SECURITY_THRESHOLD=90

# 通知配置
SLACK_WEBHOOK_URL=\${SLACK_WEBHOOK_URL}
TEAMS_WEBHOOK_URL=\${TEAMS_WEBHOOK_URL}
EMAIL_NOTIFICATIONS=true

# 扫描配置
SCAN_DIRECTORIES=src/SmartAbp.CodeGenerator,src/SmartAbp.Application
EXCLUDE_PATTERNS=**/bin/**,**/obj/**,**/node_modules/**,**/artifacts/**

# 性能配置
PERFORMANCE_RESPONSE_TIME_THRESHOLD=100
PERFORMANCE_MEMORY_THRESHOLD=512
PERFORMANCE_CPU_THRESHOLD=70
EOF
    
    log_success "环境配置创建完成"
}

# 显示部署摘要
show_deployment_summary() {
    echo ""
    echo "🎉 SmartAbp质量保障系统部署完成!"
    echo ""
    echo "📊 部署组件:"
    echo "   ✅ 代码质量检查引擎"
    echo "   ✅ 安全扫描工具"
    echo "   ✅ 性能分析工具"
    echo "   ✅ GitHub Actions工作流"
    echo "   ✅ 环境配置文件"
    echo ""
    echo "🚀 可用命令:"
    echo "   npm run quality:check    # 代码质量检查"
    echo "   npm run quality:security # 安全扫描"
    echo "   npm run quality:performance # 性能分析"
    echo "   npm run quality:full    # 完整质量检查"
    echo ""
    echo "📋 下一步:"
    echo "   1. 查看质量报告: artifacts/"
    echo "   2. 配置通知渠道: 编辑.env.quality"
    echo "   3. 自定义质量规则: 编辑quality-config.json"
    echo "   4. 集成到CI/CD: 查看.github/workflows/"
    echo ""
    echo "💡 提示: 系统已自动运行初始质量检查，请查看生成的报告(artifacts/)"
    echo ""
}

# 主部署流程
main() {
    echo ""
    echo "================================================"
    echo "   SmartAbp低代码引擎质量保障系统部署"
    echo "================================================"
    echo ""
    
    # 检查依赖
    check_dependencies
    
    # 安装依赖
    install_dependencies
    
    # 构建项目
    build_project
    
    # 配置质量系统
    setup_quality_system
    
    # 配置GitHub Actions
    setup_github_actions
    
    # 创建环境配置
    create_environment_config
    
    # 运行初始检查
    run_initial_quality_check
    
    # 显示摘要
    show_deployment_summary
    
    echo "部署完成时间: $(date)"
    echo ""
}

# 执行主函数
main "$@"