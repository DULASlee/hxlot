#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# AI编程铁律自动执行引擎守护脚本
# Auto-Execution Engine Guard Script
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛡️  AI编程铁律自动执行引擎守护检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 第一重检查：确保.cursorules文件存在且完整
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "🔍 第一重检查：.cursorules文件完整性..."

if [ ! -f ".cursorules" ]; then
    echo "❌ 错误: .cursorules文件不存在！"
    echo "   AI自动执行引擎无法启动！"
    exit 1
fi

# 检查关键标记
CRITICAL_MARKERS=(
    "MANDATORY AUTO-EXECUTION ENGINE"
    "AUTOMATIC TRIGGER DETECTION"
    "AI MUST output this as the VERY FIRST LINE"
    "AI Self-Check Checklist"
    "Final Reminder"
)

MISSING_MARKERS=()

for marker in "${CRITICAL_MARKERS[@]}"; do
    if ! grep -q "$marker" .cursorules; then
        MISSING_MARKERS+=("$marker")
    fi
done

if [ ${#MISSING_MARKERS[@]} -gt 0 ]; then
    echo "❌ 错误: .cursorules文件不完整！"
    echo "   缺少以下关键标记:"
    for marker in "${MISSING_MARKERS[@]}"; do
        echo "   - $marker"
    done
    exit 1
fi

echo "✅ .cursorules文件完整性检查通过"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 第二重检查：确保执行引擎详细定义文件存在
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "🔍 第二重检查：执行引擎详细定义文件..."

ENGINE_FILE=".cursor/rules/00_执行引擎.mdc"

if [ ! -f "$ENGINE_FILE" ]; then
    echo "❌ 错误: 执行引擎详细定义文件不存在！"
    echo "   文件路径: $ENGINE_FILE"
    exit 1
fi

# 检查文件大小（应该至少有500行）
LINE_COUNT=$(wc -l < "$ENGINE_FILE")
if [ "$LINE_COUNT" -lt 500 ]; then
    echo "❌ 错误: 执行引擎文件内容不完整！"
    echo "   当前行数: $LINE_COUNT (应该至少500行)"
    exit 1
fi

echo "✅ 执行引擎详细定义文件检查通过 (${LINE_COUNT}行)"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 第三重检查：确保所有铁律规则文件存在
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "🔍 第三重检查：铁律规则文件完整性..."

REQUIRED_RULES=(
    ".cursor/rules/00_core_philosophy.mdc"
    ".cursor/rules/01_code_standards.mdc"
    ".cursor/rules/02_development_process.mdc"
    ".cursor/rules/03_quality_guardian.mdc"
    ".cursor/rules/04_code_quality_prohibitions.mdc"
    ".cursor/rules/05_增量迭代开发质量门禁与GIT版本管理铁律.mdc"
    ".cursor/rules/06_低代码生成器代码质量铁律.mdc"
    ".cursor/rules/07_AI编程架构自动识别保护铁律.mdc"
)

MISSING_RULES=()

for rule in "${REQUIRED_RULES[@]}"; do
    if [ ! -f "$rule" ]; then
        MISSING_RULES+=("$rule")
    fi
done

if [ ${#MISSING_RULES[@]} -gt 0 ]; then
    echo "❌ 错误: 缺少必要的铁律规则文件！"
    for rule in "${MISSING_RULES[@]}"; do
        echo "   - $rule"
    done
    exit 1
fi

echo "✅ 所有铁律规则文件存在 (${#REQUIRED_RULES[@]}个文件)"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 第四重检查：检查Git提交中是否包含代码修改
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "🔍 第四重检查：代码修改检测..."

# 检查是否有暂存的代码文件
STAGED_CODE_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(vue|ts|tsx|cs)$' || true)

if [ -n "$STAGED_CODE_FILES" ]; then
    echo "⚠️  检测到代码文件修改:"
    echo "$STAGED_CODE_FILES" | head -5
    
    CODE_FILE_COUNT=$(echo "$STAGED_CODE_FILES" | wc -l)
    if [ "$CODE_FILE_COUNT" -gt 5 ]; then
        echo "   ... 还有 $((CODE_FILE_COUNT - 5)) 个文件"
    fi
    echo ""
    
    echo "📋 提醒: 这些修改应该经过AI编程铁律自动执行引擎的质量检查"
    echo ""
    
    # 检查提交信息是否包含质量验证标记
    if [ -f ".git/COMMIT_EDITMSG" ]; then
        if grep -q "质量验证" .git/COMMIT_EDITMSG || grep -q "Quality Check" .git/COMMIT_EDITMSG; then
            echo "✅ 提交信息包含质量验证标记"
        else
            echo "⚠️  提示: 提交信息中未发现质量验证标记"
            echo "   建议确认代码已通过五重质量门禁检查"
        fi
    fi
else
    echo "ℹ️  未检测到代码文件修改（仅文档或配置文件）"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 检查通过
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ AI编程铁律自动执行引擎守护检查通过！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 执行引擎状态:"
echo "   ✅ .cursorules主入口: 完整"
echo "   ✅ 执行引擎详细定义: 完整 (${LINE_COUNT}行)"
echo "   ✅ 铁律规则文件: 完整 (${#REQUIRED_RULES[@]}个)"
echo ""
echo "🛡️ AI编程时将自动执行以下流程:"
echo "   1️⃣  触发检测 → 自动启动引擎"
echo "   2️⃣  编程前学习 → 5项强制检查"
echo "   3️⃣  实时监控 → 行数追踪+合规检查"
echo "   4️⃣  质量门禁 → 5关强制检查"
echo "   5️⃣  Git管理 → 6步完整执行"
echo ""
echo "🚀 继续执行Git操作..."
echo ""

exit 0
