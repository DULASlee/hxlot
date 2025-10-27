#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CSS变量替换脚本 - SSOT重构阶段6
# 
# 用途: 将所有旧变量替换为新的--theme-*变量
# 日期: 2025-10-27
# 统计: 75处旧变量需要替换
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e  # 遇到错误立即退出

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 开始替换CSS变量..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 切换到项目根目录
cd "$(dirname "$0")/.."

# 统计替换前的旧变量数量
echo ""
echo "📊 替换前统计:"
OLD_COUNT=$(grep -rE "(--primary-color|--bg-color[^-]|--text-color[^-]|--border-color[^-])" src/SmartAbp.Vue/src --include="*.vue" --include="*.css" 2>/dev/null | wc -l | tr -d ' ')
echo "   旧变量引用: ${OLD_COUNT}处"

# 执行替换（macOS使用 sed -i ''，Linux使用 sed -i）
if [[ "$OSTYPE" == "darwin"* ]]; then
  SED_INPLACE="sed -i ''"
else
  SED_INPLACE="sed -i"
fi

echo ""
echo "🔧 执行替换..."

# 替换主色
find src/SmartAbp.Vue/src \( -name "*.vue" -o -name "*.css" \) -type f -exec sed -i '' \
  -e 's/--primary-color\([^-]\)/--theme-brand-primary\1/g' \
  -e 's/--primary-color$/--theme-brand-primary/g' \
  -e 's/--color-primary-500/--theme-brand-primary/g' \
  -e 's/--color-primary-600/--theme-brand-primary-hover/g' \
  -e 's/--color-primary-700/--theme-brand-primary-active/g' \
  -e 's/--color-primary-50/--theme-brand-primary-lighter/g' \
  -e 's/--color-primary-light/--theme-brand-primary-light/g' \
  -e 's/--primary-light/--theme-brand-primary-light/g' \
  {} \; 2>/dev/null

echo "   ✅ 主色替换完成"

# 替换背景色
find src/SmartAbp.Vue/src \( -name "*.vue" -o -name "*.css" \) -type f -exec sed -i '' \
  -e 's/--bg-color\([^-]\)/--theme-bg-body\1/g' \
  -e 's/--bg-color$/--theme-bg-body/g' \
  -e 's/--color-bg-primary/--theme-bg-component/g' \
  -e 's/--color-bgPrimary/--theme-bg-component/g' \
  -e 's/--bg-white/--theme-bg-component/g' \
  -e 's/--card-bg/--theme-bg-component/g' \
  {} \; 2>/dev/null

echo "   ✅ 背景色替换完成"

# 替换文本色
find src/SmartAbp.Vue/src \( -name "*.vue" -o -name "*.css" \) -type f -exec sed -i '' \
  -e 's/--text-color\([^-]\)/--theme-text-primary\1/g' \
  -e 's/--text-color$/--theme-text-primary/g' \
  -e 's/--color-text-primary/--theme-text-primary/g' \
  -e 's/--color-textPrimary/--theme-text-primary/g' \
  -e 's/--text-secondary/--theme-text-secondary/g' \
  {} \; 2>/dev/null

echo "   ✅ 文本色替换完成"

# 替换边框色
find src/SmartAbp.Vue/src \( -name "*.vue" -o -name "*.css" \) -type f -exec sed -i '' \
  -e 's/--border-color\([^-]\)/--theme-border-base\1/g' \
  -e 's/--border-color$/--theme-border-base/g' \
  -e 's/--color-border-primary/--theme-border-base/g' \
  {} \; 2>/dev/null

echo "   ✅ 边框色替换完成"

# 替换功能色
find src/SmartAbp.Vue/src \( -name "*.vue" -o -name "*.css" \) -type f -exec sed -i '' \
  -e 's/--success-color/--theme-success/g' \
  -e 's/--warning-color/--theme-warning/g' \
  -e 's/--danger-color/--theme-danger/g' \
  -e 's/--error-color/--theme-danger/g' \
  {} \; 2>/dev/null

echo "   ✅ 功能色替换完成"

# 统计替换后的情况
echo ""
echo "📊 替换后统计:"
NEW_COUNT=$(grep -rE "(--primary-color|--bg-color[^-]|--text-color[^-]|--border-color[^-])" src/SmartAbp.Vue/src --include="*.vue" --include="*.css" 2>/dev/null | wc -l | tr -d ' ')
REPLACED=$((OLD_COUNT - NEW_COUNT))
echo "   剩余旧变量: ${NEW_COUNT}处"
echo "   已替换: ${REPLACED}处"

# 显示剩余的旧变量（如果有）
if [ "$NEW_COUNT" -gt 0 ]; then
  echo ""
  echo "⚠️  仍有 ${NEW_COUNT} 处旧变量，需要手动检查:"
  grep -rn --color=always -E "(--primary-color|--bg-color[^-]|--text-color[^-]|--border-color[^-])" src/SmartAbp.Vue/src --include="*.vue" --include="*.css" 2>/dev/null | head -10
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 替换完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 下一步:"
echo "   1. 检查替换结果: git diff src/"
echo "   2. 测试应用: npm run dev"
echo "   3. 如无问题，提交: git add . && git commit"
echo ""

