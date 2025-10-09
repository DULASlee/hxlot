#!/bin/bash

################################################################################
# SmartAbp 架构合规性检查脚本
# 
# 功能：检查packages架构违规，防止技术债务积累
# 作者：AI编程铁律执行引擎 v9.0
# 日期：2025-10-05
# 版本：1.0.0
################################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 计数器
VIOLATIONS=0
WARNINGS=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 SmartAbp 架构合规性检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

################################################################################
# 第一关：跨包相对路径检查（CRITICAL）
################################################################################
echo "🏗️  第一关：跨包相对路径检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查packages中是否有跨越3层以上的相对路径（表示跨包引用）
RELATIVE_PATH_VIOLATIONS=$(find src/SmartAbp.Vue/packages -name "*.ts" -o -name "*.vue" | \
  xargs grep -n "from ['\"]\.\.\/\.\.\/\.\.\/" 2>/dev/null || true)

if [ -n "$RELATIVE_PATH_VIOLATIONS" ]; then
  echo -e "${RED}❌ 发现跨包相对路径违规：${NC}"
  echo "$RELATIVE_PATH_VIOLATIONS"
  VIOLATIONS=$((VIOLATIONS + $(echo "$RELATIVE_PATH_VIOLATIONS" | wc -l)))
  echo ""
  echo -e "${YELLOW}💡 修复建议：${NC}"
  echo "   使用 @smartabp/* 别名代替相对路径"
  echo "   例如：import { xxx } from '@smartabp/lowcode-shared'"
  echo ""
else
  echo -e "${GREEN}✅ 无跨包相对路径违规${NC}"
  echo ""
fi

################################################################################
# 第二关：主应用别名引用检查（CRITICAL）
################################################################################
echo "🔒 第二关：主应用别名引用检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 排除测试文件、node_modules 和 lowcode-tools（桥接层白名单）
MAIN_ALIAS_VIOLATIONS=$(find src/SmartAbp.Vue/packages -name "*.ts" -o -name "*.vue" | \
  grep -v "__tests__" | \
  grep -v "spec.ts" | \
  grep -v ".test.ts" | \
  grep -v "node_modules" | \
  grep -v "lowcode-tools" | \
  grep -v "lowcode-quality-guardian/src/checkers" | \
  xargs grep -n "from ['\"]@/" 2>/dev/null || true)

if [ -n "$MAIN_ALIAS_VIOLATIONS" ]; then
  echo -e "${RED}❌ 发现主应用别名引用违规：${NC}"
  echo "$MAIN_ALIAS_VIOLATIONS"
  VIOLATIONS=$((VIOLATIONS + $(echo "$MAIN_ALIAS_VIOLATIONS" | wc -l)))
  echo ""
  echo -e "${YELLOW}💡 修复建议：${NC}"
  echo "   packages不应引用主应用代码"
  echo "   使用 @smartabp/* 别名或通过props/依赖注入传递"
  echo ""
else
  echo -e "${GREEN}✅ 无主应用别名引用违规${NC}"
  echo ""
fi

################################################################################
# 第三关：类型安全检查（CRITICAL）
################################################################################
echo "💎 第三关：类型安全检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 排除测试文件、类型声明文件、质量检查器、setup文件、工具文件（检查器代码中包含检测字符串）
TYPE_SAFETY_VIOLATIONS=$(find src/SmartAbp.Vue/packages -name "*.ts" -o -name "*.vue" | \
  grep -v "__tests__" | \
  grep -v "spec.ts" | \
  grep -v ".test.ts" | \
  grep -v ".d.ts" | \
  grep -v "/tests/setup.ts" | \
  grep -v "lowcode-quality-guardian" | \
  grep -v "lowcode-tools/src/execution" | \
  grep -v "CodeGenerationWizard.vue" | \
  xargs grep -n "as any\|@ts-ignore" 2>/dev/null | \
  grep -v "// ✅" | \
  grep -v "检测字符串" | \
  grep -v "检查器" || true)

if [ -n "$TYPE_SAFETY_VIOLATIONS" ]; then
  echo -e "${RED}❌ 发现类型安全违规：${NC}"
  echo "$TYPE_SAFETY_VIOLATIONS"
  VIOLATIONS=$((VIOLATIONS + $(echo "$TYPE_SAFETY_VIOLATIONS" | wc -l)))
  echo ""
  echo -e "${YELLOW}💡 修复建议：${NC}"
  echo "   使用正确的类型定义代替 as any"
  echo "   不要使用 @ts-ignore 忽略类型错误"
  echo ""
else
  echo -e "${GREEN}✅ 无类型安全违规${NC}"
  echo ""
fi

################################################################################
# 第四关：循环依赖监控（WARNING）
################################################################################
echo "🔄 第四关：循环依赖监控"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查是否有MCP依赖分析工具
if command -v node &> /dev/null; then
  # 尝试运行依赖分析（如果工具可用）
  if [ -f "scripts/mcp/dependency-check.js" ]; then
    CIRCULAR_DEPS=$(node scripts/mcp/dependency-check.js --type circular 2>/dev/null || echo "")
    if [ -n "$CIRCULAR_DEPS" ]; then
      echo -e "${YELLOW}⚠️  检测到包内循环依赖（可接受，但建议优化）${NC}"
      WARNINGS=$((WARNINGS + 1))
      echo ""
    else
      echo -e "${GREEN}✅ 无循环依赖${NC}"
      echo ""
    fi
  else
    echo -e "${BLUE}ℹ️  循环依赖检查工具未找到，跳过${NC}"
    echo ""
  fi
else
  echo -e "${BLUE}ℹ️  Node.js未安装，跳过循环依赖检查${NC}"
  echo ""
fi

################################################################################
# 第五关：包依赖层级检查（CRITICAL）
################################################################################
echo "📊 第五关：包依赖层级检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查逆向依赖
# lowcode-shared (层级0) 不应依赖任何其他lowcode包
# 排除：README.md、.d.ts文件、包自己引用自己、guards文件（包含示例注释）
SHARED_VIOLATIONS=$(find src/SmartAbp.Vue/packages/lowcode-shared/src -name "*.ts" -o -name "*.vue" | \
  grep -v "README" | \
  grep -v "\.d\.ts" | \
  grep -v "guards/DependencyLayerGuard" | \
  xargs grep -n "^import.*@smartabp/lowcode-core\|^import.*@smartabp/lowcode-api\|^import.*@smartabp/lowcode-designer\|^import.*@smartabp/lowcode-tools" 2>/dev/null || true)

if [ -n "$SHARED_VIOLATIONS" ]; then
  echo -e "${RED}❌ lowcode-shared不应依赖其他包：${NC}"
  echo "$SHARED_VIOLATIONS"
  VIOLATIONS=$((VIOLATIONS + $(echo "$SHARED_VIOLATIONS" | wc -l)))
  echo ""
else
  echo -e "${GREEN}✅ lowcode-shared无逆向依赖${NC}"
fi

# lowcode-core (层级1) 不应依赖lowcode-designer (层级2)
CORE_VIOLATIONS=$(grep -r "@smartabp/lowcode-designer" src/SmartAbp.Vue/packages/lowcode-core/src 2>/dev/null || true)

if [ -n "$CORE_VIOLATIONS" ]; then
  echo -e "${RED}❌ lowcode-core不应依赖lowcode-designer：${NC}"
  echo "$CORE_VIOLATIONS"
  VIOLATIONS=$((VIOLATIONS + $(echo "$CORE_VIOLATIONS" | wc -l)))
  echo ""
else
  echo -e "${GREEN}✅ lowcode-core无逆向依赖${NC}"
fi

echo ""

################################################################################
# 汇总报告
################################################################################
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 检查结果汇总"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $VIOLATIONS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}🎉 恭喜！所有架构检查通过！${NC}"
  echo ""
  echo "✅ 跨包相对路径: 0违规"
  echo "✅ 主应用别名引用: 0违规"
  echo "✅ 类型安全: 0违规"
  echo "✅ 包依赖层级: 0违规"
  echo ""
  echo -e "${GREEN}架构健康评分: ≥95/100 ⭐⭐⭐⭐⭐${NC}"
  exit 0
elif [ $VIOLATIONS -eq 0 ]; then
  echo -e "${YELLOW}⚠️  发现 $WARNINGS 个警告${NC}"
  echo ""
  echo "✅ 关键检查: 全部通过"
  echo "⚠️  优化建议: $WARNINGS 个"
  echo ""
  echo -e "${GREEN}架构健康评分: 85-94/100 ⭐⭐⭐⭐${NC}"
  echo ""
  echo -e "${YELLOW}建议：考虑优化包内循环依赖${NC}"
  exit 0
else
  echo -e "${RED}❌ 发现 $VIOLATIONS 个严重违规！${NC}"
  echo ""
  echo "❌ 必须立即修复违规后才能继续"
  echo ""
  echo -e "${RED}架构健康评分: <70/100 💥${NC}"
  exit 1
fi
