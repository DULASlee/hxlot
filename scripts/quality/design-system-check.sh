#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🎨 设计系统合规性检查脚本
# 文件: scripts/quality/design-system-check.sh
# 用途: 自动检查前端代码是否符合设计系统规范
# 更新: 2025-10-22
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查目标目录
TARGET_DIR="src/SmartAbp.Vue/src/views"

# 如果目录不存在，退出
if [ ! -d "$TARGET_DIR" ]; then
  echo -e "${RED}❌ 目标目录不存在: $TARGET_DIR${NC}"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🎨 设计系统合规性检查${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 总违规数
TOTAL_VIOLATIONS=0

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 第一关：硬编码颜色检查
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo -e "${BLUE}🔍 第一关：检查硬编码颜色...${NC}"

# 检查hex颜色
HEX_COLOR_COUNT=$(grep -rE "#[0-9A-Fa-f]{3,8}" "$TARGET_DIR" --exclude-dir=node_modules 2>/dev/null | wc -l || echo "0")

# 检查rgb/rgba颜色
RGB_COLOR_COUNT=$(grep -rE "rgb\(|rgba\(" "$TARGET_DIR" --exclude-dir=node_modules 2>/dev/null | wc -l || echo "0")

COLOR_VIOLATIONS=$((HEX_COLOR_COUNT + RGB_COLOR_COUNT))

if [ "$COLOR_VIOLATIONS" -gt 0 ]; then
  echo -e "${RED}❌ 发现 $COLOR_VIOLATIONS 处硬编码颜色！${NC}"
  echo ""
  echo -e "${YELLOW}违规示例：${NC}"
  
  # 显示前5个违规
  grep -rE "#[0-9A-Fa-f]{3,8}|rgb\(|rgba\(" "$TARGET_DIR" --exclude-dir=node_modules 2>/dev/null | head -n 5
  
  echo ""
  echo -e "${GREEN}✅ 修复建议：${NC}"
  echo "  - 将硬编码颜色替换为设计令牌"
  echo "  - 例如: #409EFF → var(--color-primary-500)"
  echo "  - 例如: rgb(64, 158, 255) → var(--color-primary-500)"
  echo ""
  
  TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + COLOR_VIOLATIONS))
else
  echo -e "${GREEN}✅ 颜色检查通过（0违规）${NC}"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 第二关：硬编码间距检查
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo -e "${BLUE}🔍 第二关：检查硬编码间距...${NC}"

# 检查padding/margin/gap中的px值
SPACING_VIOLATIONS=$(grep -rE "padding:|margin:|gap:" "$TARGET_DIR" --exclude-dir=node_modules 2>/dev/null | grep -E "[0-9]+px" | wc -l || echo "0")

if [ "$SPACING_VIOLATIONS" -gt 0 ]; then
  echo -e "${RED}❌ 发现 $SPACING_VIOLATIONS 处硬编码间距！${NC}"
  echo ""
  echo -e "${YELLOW}违规示例：${NC}"
  
  # 显示前5个违规
  grep -rE "padding:|margin:|gap:" "$TARGET_DIR" --exclude-dir=node_modules 2>/dev/null | grep -E "[0-9]+px" | head -n 5
  
  echo ""
  echo -e "${GREEN}✅ 修复建议：${NC}"
  echo "  - 使用8px栅格系统的间距令牌"
  echo "  - 例如: padding: 16px → padding: var(--spacing-4)"
  echo "  - 例如: margin: 12px 20px → margin: var(--spacing-3) var(--spacing-5)"
  echo ""
  echo -e "${BLUE}间距令牌对照表：${NC}"
  echo "  --spacing-1: 4px   --spacing-2: 8px   --spacing-3: 12px"
  echo "  --spacing-4: 16px  --spacing-5: 20px  --spacing-6: 24px"
  echo "  --spacing-8: 32px  --spacing-12: 48px --spacing-16: 64px"
  echo ""
  
  TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + SPACING_VIOLATIONS))
else
  echo -e "${GREEN}✅ 间距检查通过（0违规）${NC}"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 第三关：Element Plus组件直接使用检查
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo -e "${BLUE}🔍 第三关：检查Element Plus组件直接使用...${NC}"

# 检查常用Element Plus组件
COMPONENT_VIOLATIONS=$(grep -rE "<el-(button|card|input|icon|form|table|dialog|select)" "$TARGET_DIR" --exclude-dir=node_modules 2>/dev/null | wc -l || echo "0")

if [ "$COMPONENT_VIOLATIONS" -gt 0 ]; then
  echo -e "${RED}❌ 发现 $COMPONENT_VIOLATIONS 处直接使用Element Plus组件！${NC}"
  echo ""
  echo -e "${YELLOW}违规示例：${NC}"
  
  # 显示前5个违规
  grep -rE "<el-(button|card|input|icon|form|table|dialog|select)" "$TARGET_DIR" --exclude-dir=node_modules 2>/dev/null | head -n 5
  
  echo ""
  echo -e "${GREEN}✅ 修复建议：${NC}"
  echo "  - 使用SmartComponents封装的企业级组件"
  echo "  - <el-button> → <SmartButton>"
  echo "  - <el-card> → <SmartCard>"
  echo "  - <el-input> → <SmartInput>"
  echo "  - <el-icon> → <SmartIcon>"
  echo ""
  
  TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + COMPONENT_VIOLATIONS))
else
  echo -e "${GREEN}✅ 组件检查通过（0违规）${NC}"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 第四关：图标系统检查
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo -e "${BLUE}🔍 第四关：检查图标使用规范...${NC}"

# 检查Element Plus图标和Font Awesome图标
ICON_VIOLATIONS=$(grep -rE "<el-icon|<i class=\"(fa|el-icon)" "$TARGET_DIR" --exclude-dir=node_modules 2>/dev/null | wc -l || echo "0")

if [ "$ICON_VIOLATIONS" -gt 0 ]; then
  echo -e "${RED}❌ 发现 $ICON_VIOLATIONS 处图标使用不规范！${NC}"
  echo ""
  echo -e "${YELLOW}违规示例：${NC}"
  
  # 显示前5个违规
  grep -rE "<el-icon|<i class=\"(fa|el-icon)" "$TARGET_DIR" --exclude-dir=node_modules 2>/dev/null | head -n 5
  
  echo ""
  echo -e "${GREEN}✅ 修复建议：${NC}"
  echo "  - 统一使用Carbon Design Icons"
  echo "  - <el-icon><Edit /></el-icon> → <SmartIcon icon=\"carbon:edit\" />"
  echo "  - <i class=\"fa fa-user\"></i> → <SmartIcon icon=\"carbon:user\" />"
  echo ""
  echo -e "${BLUE}常用图标速查：${NC}"
  echo "  carbon:add     carbon:edit    carbon:delete  carbon:save"
  echo "  carbon:user    carbon:search  carbon:filter  carbon:home"
  echo ""
  
  TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + ICON_VIOLATIONS))
else
  echo -e "${GREEN}✅ 图标检查通过（0违规）${NC}"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 汇总报告
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$TOTAL_VIOLATIONS" -gt 0 ]; then
  echo -e "${RED}🚫 设计系统检查未通过！${NC}"
  echo ""
  echo -e "${YELLOW}检查结果汇总：${NC}"
  echo "  🎨 颜色违规: $COLOR_VIOLATIONS 处"
  echo "  📏 间距违规: $SPACING_VIOLATIONS 处"
  echo "  🧩 组件违规: $COMPONENT_VIOLATIONS 处"
  echo "  🎯 图标违规: $ICON_VIOLATIONS 处"
  echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "  ${RED}总违规数: $TOTAL_VIOLATIONS 处${NC}"
  echo ""
  echo -e "${YELLOW}请修复上述问题后重试。${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  
  exit 1
else
  echo -e "${GREEN}🎉 设计系统合规性检查全部通过！${NC}"
  echo ""
  echo -e "${GREEN}检查结果汇总：${NC}"
  echo "  ✅ 颜色检查: 0违规"
  echo "  ✅ 间距检查: 0违规"
  echo "  ✅ 组件检查: 0违规"
  echo "  ✅ 图标检查: 0违规"
  echo ""
  echo -e "${GREEN}代码符合企业级设计系统规范！${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  
  exit 0
fi

