#!/bin/bash
# SmartAbp AI编程架构保护守卫
# 版本: v1.0
# 作用: 防止AI编程破坏工程化架构优化成果

set -e

echo "🛡️ SmartAbp AI编程架构保护守卫启动..."
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

VIOLATIONS=0
WARNINGS=0

# 第一关：packages相对路径违规检查
echo -e "\n${BLUE}🔍 第一关：packages相对路径违规检查...${NC}"
RELATIVE_PATH_VIOLATIONS=$(grep -r "from ['\"]\.\.\/\.\.\/" src/SmartAbp.Vue/packages/ 2>/dev/null | wc -l || echo "0")

if [ "$RELATIVE_PATH_VIOLATIONS" -gt 0 ]; then
    echo -e "${RED}❌ 发现 ${RELATIVE_PATH_VIOLATIONS} 个相对路径违规！${NC}"
    echo -e "${YELLOW}违规文件：${NC}"
    grep -r "from ['\"]\.\.\/\.\.\/" src/SmartAbp.Vue/packages/ 2>/dev/null || true
    VIOLATIONS=$((VIOLATIONS + RELATIVE_PATH_VIOLATIONS))
else
    echo -e "${GREEN}✅ 通过：无相对路径违规${NC}"
fi

# 第二关：packages主应用引用违规检查（排除合法的桥接层）
echo -e "\n${BLUE}🔍 第二关：packages主应用引用违规检查...${NC}"
# 白名单：lowcode-tools是合法的桥接层，允许使用@/别名
# 其他packages（lowcode-core, lowcode-designer等）不应该直接引用主应用
MAIN_APP_REF=$(grep -r "from ['\"]@\/" src/SmartAbp.Vue/packages/ 2>/dev/null | \
    grep -v "packages/lowcode-tools/" | \
    wc -l || echo "0")

if [ "$MAIN_APP_REF" -gt 0 ]; then
    echo -e "${RED}❌ 发现 ${MAIN_APP_REF} 个主应用引用违规！${NC}"
    echo -e "${YELLOW}违规文件（排除lowcode-tools桥接层）：${NC}"
    grep -r "from ['\"]@\/" src/SmartAbp.Vue/packages/ 2>/dev/null | \
        grep -v "packages/lowcode-tools/" || true
    VIOLATIONS=$((VIOLATIONS + MAIN_APP_REF))
else
    echo -e "${GREEN}✅ 通过：无主应用引用违规（lowcode-tools桥接层除外）${NC}"
fi

# 第三关：类型安全绕过检查
echo -e "\n${BLUE}🔍 第三关：类型安全绕过检查...${NC}"
AS_ANY_COUNT=$(grep -r "as any" src/SmartAbp.Vue/packages/ 2>/dev/null | wc -l || echo "0")
TS_IGNORE_COUNT=$(grep -r "@ts-ignore" src/SmartAbp.Vue/packages/ 2>/dev/null | wc -l || echo "0")

if [ "$AS_ANY_COUNT" -gt 0 ]; then
    echo -e "${RED}❌ 发现 ${AS_ANY_COUNT} 个 'as any' 使用！${NC}"
    VIOLATIONS=$((VIOLATIONS + AS_ANY_COUNT))
fi

if [ "$TS_IGNORE_COUNT" -gt 0 ]; then
    echo -e "${RED}❌ 发现 ${TS_IGNORE_COUNT} 个 '@ts-ignore' 使用！${NC}"
    VIOLATIONS=$((VIOLATIONS + TS_IGNORE_COUNT))
fi

if [ "$AS_ANY_COUNT" -eq 0 ] && [ "$TS_IGNORE_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✅ 通过：无类型安全绕过${NC}"
fi

# 第四关：重复组件检查
echo -e "\n${BLUE}🔍 第四关：重复组件检查...${NC}"
DUPLICATE_COMPONENTS=$(find src/SmartAbp.Vue/packages -name "*.vue" 2>/dev/null | xargs basename -a 2>/dev/null | sort | uniq -d | wc -l || echo "0")

if [ "$DUPLICATE_COMPONENTS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  警告：发现 ${DUPLICATE_COMPONENTS} 个重复组件名${NC}"
    find src/SmartAbp.Vue/packages -name "*.vue" 2>/dev/null | xargs basename -a 2>/dev/null | sort | uniq -d || true
    WARNINGS=$((WARNINGS + DUPLICATE_COMPONENTS))
else
    echo -e "${GREEN}✅ 通过：无重复组件${NC}"
fi

# 第五关：packages依赖层级检查
echo -e "\n${BLUE}🔍 第五关：packages依赖层级检查...${NC}"
echo "检查lowcode-shared是否依赖其他package..."

# lowcode-shared不应该依赖任何其他@smartabp package
SHARED_VIOLATIONS=$(grep -r "from '@smartabp/lowcode-\(core\|api\|designer\|tools\)" src/SmartAbp.Vue/packages/lowcode-shared/ 2>/dev/null | wc -l || echo "0")

if [ "$SHARED_VIOLATIONS" -gt 0 ]; then
    echo -e "${RED}❌ lowcode-shared违规依赖其他package！${NC}"
    grep -r "from '@smartabp/lowcode-\(core\|api\|designer\|tools\)" src/SmartAbp.Vue/packages/lowcode-shared/ 2>/dev/null || true
    VIOLATIONS=$((VIOLATIONS + SHARED_VIOLATIONS))
else
    echo -e "${GREEN}✅ 通过：lowcode-shared保持零依赖${NC}"
fi

# 第六关：packages架构完整性检查
echo -e "\n${BLUE}🔍 第六关：packages架构完整性检查...${NC}"

# 检查关键package是否存在
REQUIRED_PACKAGES=("lowcode-shared" "lowcode-core" "lowcode-designer" "lowcode-api" "lowcode-tools")
MISSING_PACKAGES=0

for package in "${REQUIRED_PACKAGES[@]}"; do
    if [ ! -d "src/SmartAbp.Vue/packages/$package" ]; then
        echo -e "${RED}❌ 缺少关键package: $package${NC}"
        MISSING_PACKAGES=$((MISSING_PACKAGES + 1))
    fi
done

if [ "$MISSING_PACKAGES" -eq 0 ]; then
    echo -e "${GREEN}✅ 通过：所有关键packages都存在${NC}"
else
    echo -e "${RED}❌ 缺少 ${MISSING_PACKAGES} 个关键package${NC}"
    VIOLATIONS=$((VIOLATIONS + MISSING_PACKAGES))
fi

# 汇总结果
echo -e "\n=========================================="
echo -e "${BLUE}📊 架构保护检查汇总${NC}"
echo -e "=========================================="
echo -e "关卡1 - 相对路径违规: $RELATIVE_PATH_VIOLATIONS"
echo -e "关卡2 - 主应用引用违规: $MAIN_APP_REF"
echo -e "关卡3 - 类型安全绕过: $((AS_ANY_COUNT + TS_IGNORE_COUNT))"
echo -e "关卡4 - 重复组件: $DUPLICATE_COMPONENTS (警告)"
echo -e "关卡5 - 依赖层级违规: $SHARED_VIOLATIONS"
echo -e "关卡6 - 架构完整性问题: $MISSING_PACKAGES"
echo -e "=========================================="
echo -e "总违规数: ${RED}$VIOLATIONS${NC}"
echo -e "总警告数: ${YELLOW}$WARNINGS${NC}"
echo -e "=========================================="

if [ "$VIOLATIONS" -gt 0 ]; then
    echo -e "\n${RED}🚨 架构保护检查失败！发现 $VIOLATIONS 个违规！${NC}"
    echo -e "${YELLOW}💡 请修复上述违规后重试${NC}"
    echo -e "${BLUE}📚 参考文档: .cursor/rules/07_AI编程架构自动识别保护铁律.mdc${NC}"
    exit 1
fi

if [ "$WARNINGS" -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️  架构保护检查通过，但有 $WARNINGS 个警告${NC}"
    echo -e "${BLUE}💡 建议检查并消除警告项${NC}"
fi

echo -e "\n${GREEN}✅ 架构保护检查全部通过！${NC}"
echo -e "${BLUE}🛡️ SmartAbp架构受到良好保护${NC}"
exit 0
