#!/bin/bash

# SmartAbp 数据库切换工具 - 双击版本
# macOS双击此文件即可运行

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

# 切换到项目根目录
cd "$PROJECT_ROOT"

# 清屏
clear

# 颜色定义
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 SmartAbp 数据库一键切换工具${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✅ 已启动！${NC}"
echo -e "${YELLOW}📂 工作目录: $PROJECT_ROOT${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 运行主脚本
bash "$SCRIPT_DIR/switch-database.sh" "$@"

# 等待用户按键后关闭
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}按任意键关闭此窗口...${NC}"
read -n 1 -s

