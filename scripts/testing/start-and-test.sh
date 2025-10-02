#!/bin/bash

# ============================================================================
# 智能服务启动指引和自动测试脚本
# 检测服务状态，引导用户启动，然后自动执行测试
# ============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 SmartAbp 智能测试执行助手${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================================================
# 检查服务状态
# ============================================================================

check_service() {
    local url=$1
    local name=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name 服务运行中${NC}"
        return 0
    else
        echo -e "${RED}❌ $name 服务未运行${NC}"
        return 1
    fi
}

BACKEND_RUNNING=false
FRONTEND_RUNNING=false

echo -e "${CYAN}📡 检查服务状态...${NC}"
echo ""

if check_service "http://localhost:44379/health" "后端"; then
    BACKEND_RUNNING=true
fi

if check_service "http://localhost:11369" "前端"; then
    FRONTEND_RUNNING=true
fi

echo ""

# ============================================================================
# 如果服务未运行，显示启动指引
# ============================================================================

if [ "$BACKEND_RUNNING" = false ] || [ "$FRONTEND_RUNNING" = false ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⚠️  需要启动服务${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ "$BACKEND_RUNNING" = false ]; then
        echo -e "${MAGENTA}📋 后端服务启动命令（请在新终端执行）:${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "cd $PROJECT_ROOT/src/SmartAbp.Web"
        echo -e "dotnet run"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${YELLOW}等待提示: Now listening on: https://localhost:44379${NC}"
        echo ""
    fi
    
    if [ "$FRONTEND_RUNNING" = false ]; then
        echo -e "${MAGENTA}📋 前端服务启动命令（请在新终端执行）:${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "cd $PROJECT_ROOT/src/SmartAbp.Vue"
        echo -e "npm run dev"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${YELLOW}等待提示: Local: http://localhost:11369/${NC}"
        echo ""
    fi
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}⏳ 等待服务启动...${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${CYAN}此脚本将持续检测服务状态，一旦检测到服务启动将自动开始测试！${NC}"
    echo -e "${CYAN}按 Ctrl+C 可以随时退出${NC}"
    echo ""
    
    # 持续检测服务状态
    check_count=0
    max_wait=300  # 最多等待5分钟
    interval=3
    
    while [ $check_count -lt $((max_wait / interval)) ]; do
        sleep $interval
        check_count=$((check_count + 1))
        
        # 检查后端
        if [ "$BACKEND_RUNNING" = false ]; then
            if curl -s -f "http://localhost:44379/health" > /dev/null 2>&1; then
                BACKEND_RUNNING=true
                echo ""
                echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                echo -e "${GREEN}✅ 后端服务已启动！${NC}"
                echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                echo ""
            fi
        fi
        
        # 检查前端
        if [ "$FRONTEND_RUNNING" = false ]; then
            if curl -s -f "http://localhost:11369" > /dev/null 2>&1; then
                FRONTEND_RUNNING=true
                echo ""
                echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                echo -e "${GREEN}✅ 前端服务已启动！${NC}"
                echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                echo ""
            fi
        fi
        
        # 如果两个服务都启动了，退出循环
        if [ "$BACKEND_RUNNING" = true ] && [ "$FRONTEND_RUNNING" = true ]; then
            break
        fi
        
        # 显示等待提示
        printf "\r${CYAN}⏳ 等待服务启动... %ds ${NC}" $((check_count * interval))
    done
    
    echo ""
fi

# ============================================================================
# 检查服务是否都已启动
# ============================================================================

if [ "$BACKEND_RUNNING" = false ] || [ "$FRONTEND_RUNNING" = false ]; then
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ 等待超时，请手动启动服务后重新运行${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi

# ============================================================================
# 服务已就绪，开始测试
# ============================================================================

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 所有服务已就绪！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 询问用户执行哪种测试
echo -e "${CYAN}请选择测试类型:${NC}"
echo -e "  ${GREEN}1${NC} - 快速API测试（5分钟）"
echo -e "  ${GREEN}2${NC} - 完整E2E测试（30分钟）"
echo -e "  ${GREEN}3${NC} - 两者都执行"
echo ""
read -p "请输入选择 [1-3]: " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}🧪 开始执行快速API测试...${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        "$PROJECT_ROOT/scripts/testing/quick-api-test.sh"
        ;;
    2)
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}🧪 开始执行完整E2E测试...${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        "$PROJECT_ROOT/scripts/testing/smart-full-test.sh"
        ;;
    3)
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}🧪 开始执行所有测试...${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${CYAN}步骤1: 快速API测试${NC}"
        "$PROJECT_ROOT/scripts/testing/quick-api-test.sh"
        echo ""
        echo -e "${CYAN}步骤2: 完整E2E测试${NC}"
        "$PROJECT_ROOT/scripts/testing/smart-full-test.sh"
        ;;
    *)
        echo -e "${RED}无效选择，退出${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ 测试执行完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}📝 测试报告位置:${NC}"
echo -e "   docs/testing/reports/"
echo ""

