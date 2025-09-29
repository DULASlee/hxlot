#!/bin/bash

# SmartAbp 技术债务监控脚本
# 用于自动化识别、量化和追踪技术债务

set -e

echo "🔍 SmartAbp 技术债务监控报告"
echo "========================================"
echo "📅 执行时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 切换到项目根目录
cd "$(dirname "$0")/../.."

# 定义颜色
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 定义阈值
AS_ANY_THRESHOLD=1000
TS_IGNORE_THRESHOLD=200
CONSOLE_LOG_THRESHOLD=3000
DUPLICATE_COMPONENT_THRESHOLD=3

echo "📊 技术债务统计分析"
echo "========================================"

# 1. 类型安全问题统计
echo -e "${BLUE}🔍 类型安全分析:${NC}"
AS_ANY_COUNT=$(grep -r "as any" src/ --include="*.ts" --include="*.vue" | wc -l | tr -d ' ')
TS_IGNORE_COUNT=$(grep -r "@ts-ignore" src/ --include="*.ts" --include="*.vue" | wc -l | tr -d ' ')

if [ "$AS_ANY_COUNT" -gt "$AS_ANY_THRESHOLD" ]; then
    echo -e "  • ${RED}as any 使用: ${AS_ANY_COUNT}个 🚨 (超过阈值 ${AS_ANY_THRESHOLD})${NC}"
else
    echo -e "  • ${YELLOW}as any 使用: ${AS_ANY_COUNT}个 ⚠️${NC}"
fi

if [ "$TS_IGNORE_COUNT" -gt "$TS_IGNORE_THRESHOLD" ]; then
    echo -e "  • ${RED}@ts-ignore 使用: ${TS_IGNORE_COUNT}个 🚨 (超过阈值 ${TS_IGNORE_THRESHOLD})${NC}"
else
    echo -e "  • ${YELLOW}@ts-ignore 使用: ${TS_IGNORE_COUNT}个 ⚠️${NC}"
fi

# 2. 代码重复分析
echo -e "\n${BLUE}🔄 代码重复分析:${NC}"
DUPLICATE_COMPONENTS=$(find src/ -name "*.vue" | sed 's/.*\///' | sort | uniq -d | wc -l | tr -d ' ')

if [ "$DUPLICATE_COMPONENTS" -gt "$DUPLICATE_COMPONENT_THRESHOLD" ]; then
    echo -e "  • ${RED}重复组件: ${DUPLICATE_COMPONENTS}个 🚨 (超过阈值 ${DUPLICATE_COMPONENT_THRESHOLD})${NC}"
    echo -e "  • ${YELLOW}重复组件列表:${NC}"
    find src/ -name "*.vue" | sed 's/.*\///' | sort | uniq -d | sed 's/^/    - /'
else
    echo -e "  • ${GREEN}重复组件: ${DUPLICATE_COMPONENTS}个 ✅${NC}"
fi

# 3. 调试代码分析
echo -e "\n${BLUE}🐛 调试代码分析:${NC}"
CONSOLE_LOG_COUNT=$(grep -r "console\.log\|console\.warn\|console\.error" src/ --include="*.ts" --include="*.vue" | wc -l | tr -d ' ')

if [ "$CONSOLE_LOG_COUNT" -gt "$CONSOLE_LOG_THRESHOLD" ]; then
    echo -e "  • ${RED}调试代码: ${CONSOLE_LOG_COUNT}个 🚨 (超过阈值 ${CONSOLE_LOG_THRESHOLD})${NC}"
else
    echo -e "  • ${YELLOW}调试代码: ${CONSOLE_LOG_COUNT}个 ⚠️${NC}"
fi

# 4. 架构完整性检查
echo -e "\n${BLUE}🏗️ 架构完整性检查:${NC}"
RELATIVE_PATH_VIOLATIONS=$(grep -r "'../'" src/SmartAbp.Vue/packages/ --include="*.ts" --include="*.vue" 2>/dev/null | wc -l | tr -d ' ')
MAIN_APP_REFERENCES=$(grep -r "@/" src/SmartAbp.Vue/packages/ --include="*.ts" --include="*.vue" 2>/dev/null | grep -v "dist/" | wc -l | tr -d ' ')

if [ "$RELATIVE_PATH_VIOLATIONS" -eq 0 ]; then
    echo -e "  • ${GREEN}相对路径违规: ${RELATIVE_PATH_VIOLATIONS}个 ✅${NC}"
else
    echo -e "  • ${RED}相对路径违规: ${RELATIVE_PATH_VIOLATIONS}个 🚨${NC}"
fi

if [ "$MAIN_APP_REFERENCES" -le 2 ]; then
    echo -e "  • ${GREEN}主应用引用违规: ${MAIN_APP_REFERENCES}个 ✅ (仅文档注释)${NC}"
else
    echo -e "  • ${YELLOW}主应用引用违规: ${MAIN_APP_REFERENCES}个 ⚠️${NC}"
fi

# 5. 包管理分析
echo -e "\n${BLUE}📦 包管理分析:${NC}"
PACKAGES_WITH_TSCONFIG=$(find src/SmartAbp.Vue/packages/ -name "tsconfig.json" | wc -l | tr -d ' ')
TOTAL_PACKAGES=$(ls src/SmartAbp.Vue/packages/ | wc -l | tr -d ' ')

echo -e "  • ${BLUE}TypeScript配置覆盖: ${PACKAGES_WITH_TSCONFIG}/${TOTAL_PACKAGES}个包${NC}"

# 6. 计算技术债务总分
echo -e "\n${BLUE}📈 技术债务评分:${NC}"

# 评分算法 (满分100分)
SCORE=100

# 类型安全扣分 (最多扣40分)
TYPE_SAFETY_PENALTY=$((AS_ANY_COUNT / 50 + TS_IGNORE_COUNT / 10))
TYPE_SAFETY_PENALTY=$((TYPE_SAFETY_PENALTY > 40 ? 40 : TYPE_SAFETY_PENALTY))
SCORE=$((SCORE - TYPE_SAFETY_PENALTY))

# 代码重复扣分 (最多扣20分)
DUPLICATE_PENALTY=$((DUPLICATE_COMPONENTS * 4))
DUPLICATE_PENALTY=$((DUPLICATE_PENALTY > 20 ? 20 : DUPLICATE_PENALTY))
SCORE=$((SCORE - DUPLICATE_PENALTY))

# 调试代码扣分 (最多扣20分)
DEBUG_PENALTY=$((CONSOLE_LOG_COUNT / 200))
DEBUG_PENALTY=$((DEBUG_PENALTY > 20 ? 20 : DEBUG_PENALTY))
SCORE=$((SCORE - DEBUG_PENALTY))

# 架构违规扣分 (最多扣20分)
ARCH_PENALTY=$((RELATIVE_PATH_VIOLATIONS * 5 + MAIN_APP_REFERENCES))
ARCH_PENALTY=$((ARCH_PENALTY > 20 ? 20 : ARCH_PENALTY))
SCORE=$((SCORE - ARCH_PENALTY))

# 根据分数显示颜色
if [ "$SCORE" -ge 85 ]; then
    echo -e "  • ${GREEN}总体评分: ${SCORE}/100 🎯 (优秀)${NC}"
elif [ "$SCORE" -ge 70 ]; then
    echo -e "  • ${YELLOW}总体评分: ${SCORE}/100 ⚠️ (良好)${NC}"
else
    echo -e "  • ${RED}总体评分: ${SCORE}/100 🚨 (需要改进)${NC}"
fi

echo ""
echo "📋 改进建议:"
echo "========================================"

if [ "$AS_ANY_COUNT" -gt "$AS_ANY_THRESHOLD" ]; then
    echo "• 🎯 优先处理类型安全问题 - 减少 as any 使用"
fi

if [ "$DUPLICATE_COMPONENTS" -gt 0 ]; then
    echo "• 🔄 合并重复组件，提高代码复用率"
fi

if [ "$CONSOLE_LOG_COUNT" -gt "$CONSOLE_LOG_THRESHOLD" ]; then
    echo "• 🧹 清理调试代码，使用统一的日志系统"
fi

if [ "$RELATIVE_PATH_VIOLATIONS" -gt 0 ]; then
    echo "• 🏗️ 修复架构违规，保持模块化隔离"
fi

echo "• 📈 定期执行此脚本，跟踪技术债务变化"

echo ""
echo "📊 报告生成完成"
echo "========================================"
echo "💡 建议: 将此报告集成到CI/CD流程中，实现持续监控"
