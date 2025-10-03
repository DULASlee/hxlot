#!/bin/bash

# SmartAbp 数据库切换工具 - 稳定版（不会闪退）
# 双击此文件运行，按Ctrl+C可随时退出

# 错误时不退出
set +e

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

# 切换到项目根目录
cd "$PROJECT_ROOT" || {
    echo "❌ 无法切换到项目目录: $PROJECT_ROOT"
    echo "按任意键退出..."
    read -n 1 -s
    exit 1
}

# 清屏
clear

# 颜色定义
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 显示欢迎信息
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 SmartAbp 数据库一键切换工具${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✅ 成功启动！${NC}"
echo -e "${YELLOW}📂 工作目录: $PROJECT_ROOT${NC}"
echo ""

# 检查主脚本是否存在
if [ ! -f "$SCRIPT_DIR/switch-database.sh" ]; then
    echo -e "${RED}❌ 错误：找不到主脚本${NC}"
    echo -e "${YELLOW}期望位置: $SCRIPT_DIR/switch-database.sh${NC}"
    echo ""
    echo "按任意键退出..."
    read -n 1 -s
    exit 1
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 运行主脚本
bash "$SCRIPT_DIR/switch-database.sh" "$@"
EXIT_CODE=$?

# 显示完成信息
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ 操作完成！${NC}"
else
    echo -e "${YELLOW}⚠️  操作已取消或遇到错误（退出代码: $EXIT_CODE）${NC}"
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}💡 提示：${NC}"
echo -e "  • 可以关闭此窗口"
echo -e "  • 或按任意键关闭..."
echo -e "  • 或在此终端中继续输入命令"
echo ""

# 等待用户按键（可选）
read -t 3600 -n 1 -s -p "" || true

# 显示退出消息
echo ""
echo -e "${GREEN}👋 再见！${NC}"
echo ""

# 等待1秒后关闭
sleep 1

