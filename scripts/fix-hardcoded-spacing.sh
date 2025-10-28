#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 硬编码间距修复脚本
# 
# 用途: 将硬编码的px间距值替换为设计令牌变量
# 日期: 2025-10-27
# 规范: 基于8px栅格系统
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 开始修复硬编码间距..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$(dirname "$0")/.."

# 统计修复前的硬编码间距数量
echo ""
echo "📊 修复前统计:"
OLD_COUNT=$(grep -rE "padding:|margin:" src/SmartAbp.Vue/src --include="*.vue" --include="*.css" | grep -E "[0-9]+px" | grep -v "backup" | grep -v "var(--" | wc -l | tr -d ' ')
echo "   硬编码间距: ${OLD_COUNT}处"

echo ""
echo "🔧 执行间距令牌替换..."

# 间距映射表（基于8px栅格系统）
# 4px → var(--spacing-1)
# 6px → var(--spacing-1) + var(--spacing-2) / 2
# 8px → var(--spacing-2)
# 10px → var(--spacing-2) + var(--spacing-1) / 2
# 12px → var(--spacing-3)
# 14px → var(--spacing-3) + var(--spacing-1) / 2
# 16px → var(--spacing-4)
# 18px → var(--spacing-4) + var(--spacing-1) / 2
# 20px → var(--spacing-5)
# 24px → var(--spacing-6)
# 32px → var(--spacing-8)

# macOS 使用 sed -i ''，Linux 使用 sed -i
if [[ "$OSTYPE" == "darwin"* ]]; then
  SED_INPLACE="sed -i ''"
else
  SED_INPLACE="sed -i"
fi

# 替换常用间距（从大到小，避免误替换）
echo "   ✅ 替换32px → var(--spacing-8)"
find src/SmartAbp.Vue/src \( -name "*.vue" -o -name "*.css" \) -type f -exec sed -i '' \
  -e 's/padding: 32px/padding: var(--spacing-8)/g' \
  -e 's/margin: 32px/margin: var(--spacing-8)/g' \
  {} \; 2>/dev/null

echo "   ✅ 替换24px → var(--spacing-6)"
find src/SmartAbp.Vue/src \( -name "*.vue" -o -name "*.css" \) -type f -exec sed -i '' \
  -e 's/padding: 24px/padding: var(--spacing-6)/g' \
  -e 's/margin: 24px/margin: var(--spacing-6)/g' \
  -e 's/padding: 0 24px/padding: 0 var(--spacing-6)/g' \
  -e 's/margin: 0 24px/margin: 0 var(--spacing-6)/g' \
  -e 's/padding: 24px 0/padding: var(--spacing-6) 0/g' \
  -e 's/margin: 24px 0/margin: var(--spacing-6) 0/g' \
  {} \; 2>/dev/null

echo "   ✅ 替换20px → var(--spacing-5)"
find src/SmartAbp.Vue/src \( -name "*.vue" -o -name "*.css" \) -type f -exec sed -i '' \
  -e 's/padding: 20px/padding: var(--spacing-5)/g' \
  -e 's/margin: 20px/margin: var(--spacing-5)/g' \
  -e 's/padding: 0 20px/padding: 0 var(--spacing-5)/g' \
  -e 's/margin: 0 20px/margin: 0 var(--spacing-5)/g' \
  {} \; 2>/dev/null

echo "   ✅ 替换16px → var(--spacing-4)"
find src/SmartAbp.Vue/src \( -name "*.vue" -o -name "*.css" \) -type f -exec sed -i '' \
  -e 's/padding: 16px/padding: var(--spacing-4)/g' \
  -e 's/margin: 16px/margin: var(--spacing-4)/g' \
  -e 's/padding: 0 16px/padding: 0 var(--spacing-4)/g' \
  -e 's/margin: 0 16px/margin: 0 var(--spacing-4)/g' \
  -e 's/padding: 16px 0/padding: var(--spacing-4) 0/g' \
  -e 's/margin: 16px 0/margin: var(--spacing-4) 0/g' \
  {} \; 2>/dev/null

echo "   ✅ 替换12px → var(--spacing-3)"
find src/SmartAbp.Vue/src \( -name "*.vue" -o -name "*.css" \) -type f -exec sed -i '' \
  -e 's/padding: 12px/padding: var(--spacing-3)/g' \
  -e 's/margin: 12px/margin: var(--spacing-3)/g' \
  -e 's/padding: 0 12px/padding: 0 var(--spacing-3)/g' \
  -e 's/margin: 0 12px/margin: 0 var(--spacing-3)/g' \
  {} \; 2>/dev/null

echo "   ✅ 替换8px → var(--spacing-2)"
find src/SmartAbp.Vue/src \( -name "*.vue" -o -name "*.css" \) -type f -exec sed -i '' \
  -e 's/padding: 8px/padding: var(--spacing-2)/g' \
  -e 's/margin: 8px/margin: var(--spacing-2)/g' \
  -e 's/padding: 0 8px/padding: 0 var(--spacing-2)/g' \
  -e 's/margin: 0 8px/margin: 0 var(--spacing-2)/g' \
  {} \; 2>/dev/null

echo "   ✅ 替换4px → var(--spacing-1)"
find src/SmartAbp.Vue/src \( -name "*.vue" -o -name "*.css" \) -type f -exec sed -i '' \
  -e 's/padding: 4px/padding: var(--spacing-1)/g' \
  -e 's/margin: 4px/margin: var(--spacing-1)/g' \
  -e 's/padding: 0 4px/padding: 0 var(--spacing-1)/g' \
  -e 's/margin: 0 4px/margin: 0 var(--spacing-1)/g' \
  {} \; 2>/dev/null

# 统计修复后的情况
echo ""
echo "📊 修复后统计:"
NEW_COUNT=$(grep -rE "padding:|margin:" src/SmartAbp.Vue/src --include="*.vue" --include="*.css" | grep -E "[0-9]+px" | grep -v "backup" | grep -v "var(--" | wc -l | tr -d ' ')
FIXED=$((OLD_COUNT - NEW_COUNT))
echo "   剩余硬编码: ${NEW_COUNT}处"
echo "   已修复: ${FIXED}处"

# 显示剩余的硬编码（需要手动检查）
if [ "$NEW_COUNT" -gt 0 ]; then
  echo ""
  echo "⚠️  仍有 ${NEW_COUNT} 处硬编码需要手动检查（特殊值或复杂情况）:"
  grep -rn -E "padding:|margin:" src/SmartAbp.Vue/src --include="*.vue" --include="*.css" | grep -E "[0-9]+px" | grep -v "backup" | grep -v "var(--" | head -10
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 间距修复完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 下一步:"
echo "   1. 检查替换结果: git diff src/"
echo "   2. 测试UI是否正常"
echo "   3. 如无问题，提交: git add . && git commit"
echo ""

