#!/bin/bash

# SmartAbp 一键切换数据库演示脚本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🎯 SmartAbp 一键切换数据库演示${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

show_current() {
    echo -e "${BLUE}📊 当前数据库配置:${NC}"
    local db_type=$(grep -A 1 '"Database"' "$PROJECT_ROOT/src/SmartAbp.Web/appsettings.json" | grep '"Type"' | sed 's/.*: "\(.*\)".*/\1/')
    local conn_str=$(grep -A 2 '"ConnectionStrings"' "$PROJECT_ROOT/src/SmartAbp.Web/appsettings.json" | grep '"Default"' | sed 's/.*: "\(.*\)".*/\1/')
    echo -e "  数据库类型: ${YELLOW}$db_type${NC}"
    echo -e "  连接字符串: ${YELLOW}${conn_str:0:60}...${NC}"
    echo ""
}

echo -e "${GREEN}✅ 测试1: 显示当前配置${NC}"
show_current

echo -e "${GREEN}✅ 测试2: 非交互式切换到PostgreSQL${NC}"
echo -e "${YELLOW}命令:${NC} bash scripts/database/switch-database.sh postgresql localhost 5432 smartabp smartabp_user SmartAbp@2025"
echo ""
read -p "按回车继续测试..." -n 1
echo ""

bash "$PROJECT_ROOT/scripts/database/switch-database.sh" postgresql localhost 5432 smartabp smartabp_user SmartAbp@2025
echo ""
show_current

echo -e "${GREEN}✅ 测试3: 切换回SQLite${NC}"
echo -e "${YELLOW}命令:${NC} bash scripts/database/switch-database.sh sqlite smartabp.db"
echo ""
read -p "按回车继续测试..." -n 1
echo ""

bash "$PROJECT_ROOT/scripts/database/switch-database.sh" sqlite smartabp.db
echo ""
show_current

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🎉 演示完成！${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}💡 提示:${NC}"
echo -e "  • 交互式模式: ${YELLOW}bash scripts/database/switch-database.sh${NC}"
echo -e "  • 查看帮助: ${YELLOW}bash scripts/database/switch-database.sh --help${NC}"
echo -e "  • Docker启动: ${YELLOW}docker-compose -f docker-compose.databases.yml up -d postgres${NC}"
echo -e "  • 完整文档: ${YELLOW}docs/deployment/一键切换数据库部署指南.md${NC}"
echo ""

