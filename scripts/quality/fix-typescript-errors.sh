#!/bin/bash

# SmartAbp TypeScript错误修复助手
# 自动检测和修复TypeScript类型错误

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 SmartAbp TypeScript错误修复助手${NC}\n"

# 进入前端项目目录
cd "$(dirname "$0")/../../src/SmartAbp.Vue"

# 1. 检查并安装依赖
echo -e "${BLUE}📦 检查依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️ 依赖未安装，正在安装...${NC}"
    npm install
else
    echo -e "${GREEN}✅ 依赖已安装${NC}"
fi

# 2. 安装可能缺失的类型声明
echo -e "\n${BLUE}📋 安装类型声明包...${NC}"
npm install --save-dev @types/node || true

# 3. 生成类型错误报告
echo -e "\n${BLUE}🔍 检测TypeScript类型错误...${NC}"
ERROR_LOG="../../reports/quality/type-errors-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "../../reports/quality"

if npm run type-check 2>&1 | tee "$ERROR_LOG"; then
    echo -e "${GREEN}✅ TypeScript编译通过！${NC}"
    exit 0
fi

# 4. 分析错误类型
echo -e "\n${BLUE}📊 分析错误类型...${NC}"
echo -e "\n${YELLOW}错误统计:${NC}"
grep "error TS" "$ERROR_LOG" | \
  sed 's/.*error \(TS[0-9]*\).*/\1/' | \
  sort | uniq -c | sort -rn | head -10 | \
  while read count code; do
    case $code in
      TS2307)
        echo -e "  ${RED}$count x $code${NC} - 无法找到模块 (需要安装依赖或类型声明)"
        ;;
      TS7006)
        echo -e "  ${YELLOW}$count x $code${NC} - 隐式any类型 (需要添加类型注解)"
        ;;
      TS18046)
        echo -e "  ${YELLOW}$count x $code${NC} - unknown类型 (需要类型守卫)"
        ;;
      TS2322)
        echo -e "  ${YELLOW}$count x $code${NC} - 类型不匹配"
        ;;
      *)
        echo -e "  ${YELLOW}$count x $code${NC}"
        ;;
    esac
  done

# 5. 提供修复建议
echo -e "\n${BLUE}💡 修复建议:${NC}"

# 统计TS2307错误数量（找不到模块）
MODULE_ERRORS=$(grep "error TS2307" "$ERROR_LOG" | wc -l)
if [ "$MODULE_ERRORS" -gt 0 ]; then
    echo -e "\n${YELLOW}问题1: 找不到模块声明 (${MODULE_ERRORS}个)${NC}"
    echo -e "  ${BLUE}修复方法:${NC}"
    echo -e "    1. 确保依赖已安装: ${GREEN}npm install${NC}"
    echo -e "    2. 安装类型声明: ${GREEN}npm install --save-dev @types/vue @types/element-plus${NC}"
    
    # 列出缺失的模块
    echo -e "\n  ${BLUE}缺失的模块:${NC}"
    grep "Cannot find module" "$ERROR_LOG" | \
      sed "s/.*Cannot find module '\(.*\)'.*/\1/" | \
      sort -u | head -5 | \
      while read module; do
        echo -e "    - ${YELLOW}$module${NC}"
      done
fi

# 统计TS7006错误数量（隐式any）
ANY_ERRORS=$(grep "error TS7006" "$ERROR_LOG" | wc -l)
if [ "$ANY_ERRORS" -gt 0 ]; then
    echo -e "\n${YELLOW}问题2: 隐式any类型 (${ANY_ERRORS}个)${NC}"
    echo -e "  ${BLUE}修复方法: 为参数添加类型注解${NC}"
    echo -e "    ${RED}// 错误：${NC}"
    echo -e "    ${RED}function handle(data) { ... }${NC}"
    echo -e "    ${GREEN}// 正确：${NC}"
    echo -e "    ${GREEN}function handle(data: DataType) { ... }${NC}"
fi

# 统计TS18046错误数量（unknown类型）
UNKNOWN_ERRORS=$(grep "error TS18046" "$ERROR_LOG" | wc -l)
if [ "$UNKNOWN_ERRORS" -gt 0 ]; then
    echo -e "\n${YELLOW}问题3: unknown类型错误 (${UNKNOWN_ERRORS}个)${NC}"
    echo -e "  ${BLUE}修复方法: 使用类型守卫或类型断言${NC}"
    echo -e "    ${RED}// 错误：${NC}"
    echo -e "    ${RED}data.property // data是unknown${NC}"
    echo -e "    ${GREEN}// 正确：${NC}"
    echo -e "    ${GREEN}if (typeof data === 'object' && data !== null) {${NC}"
    echo -e "    ${GREEN}  (data as DataType).property${NC}"
    echo -e "    ${GREEN}}${NC}"
fi

# 6. 生成修复任务清单
echo -e "\n${BLUE}📋 修复任务清单:${NC}"
echo -e "  [ ] 1. 安装缺失的依赖和类型声明"
echo -e "  [ ] 2. 修复所有隐式any类型（添加类型注解）"
echo -e "  [ ] 3. 修复所有unknown类型（添加类型守卫）"
echo -e "  [ ] 4. 修复类型不匹配问题"
echo -e "  [ ] 5. 重新运行类型检查验证"

echo -e "\n${BLUE}📄 详细错误日志:${NC} $ERROR_LOG"
echo -e "\n${YELLOW}⚠️ 请根据以上建议逐步修复类型错误${NC}\n"

exit 1

