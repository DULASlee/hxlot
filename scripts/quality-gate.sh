#!/bin/bash
# AI Architecture Guardian - Quality Gate Script

# Exit immediately if a command exits with a non-zero status.
set -e

# 📍 确保在项目根目录执行
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🛡️  Starting AI Architecture Guardian Quality Check..."
echo "📏  Project Root: $PROJECT_ROOT"

# --- 1. Architecture Cleanliness Check ---
echo "🔎  Checking for illegal cross-package imports..."
# We search for relative paths ('../') or absolute main app paths ('@/') within the packages directory.
# `grep ... || true` ensures that the script doesn't exit if grep finds no matches (which is the success case).
VIOLATIONS=$(grep -r -E "'\.\./|'@/" src/SmartAbp.Vue/packages/ --include="*.{ts,vue,js}" --exclude-dir=node_modules || true)

if [ -n "$VIOLATIONS" ]; then
  echo "❌ CRITICAL ERROR: Architectural violation detected! Illegal cross-package imports found:"
  echo "$VIOLATIONS"
  echo "   (Reason: Packages must be self-contained and only communicate via '@smartabp/*' aliases.)"
  exit 1
else
  echo "✅  No architectural violations found."
fi

# --- 2. Type Safety Check ---
echo "🔎  Checking for type-safety bypasses ('as any', '@ts-ignore')..."
TYPE_BYPASSES=$(grep -r -E "as any|@ts-ignore" src/SmartAbp.Vue/ --exclude-dir=node_modules --include="*.{ts,vue}" || true)

if [ -n "$TYPE_BYPASSES" ]; then
    echo "❌ CRITICAL ERROR: Type-safety bypass detected! The use of 'as any' or '@ts-ignore' is strictly forbidden:"
    echo "$TYPE_BYPASSES"
    exit 1
else
    echo "✅  Type safety checks passed."
fi

# --- 3. Linting and Type Checking ---
# Note: This runs in the Vue project directory
echo "🔎  Running linter..."
cd "$PROJECT_ROOT/src/SmartAbp.Vue" && npm run lint # Use --quiet to reduce verbose output on success

echo "🔎  Running TypeScript type checker..."
cd "$PROJECT_ROOT/src/SmartAbp.Vue" && npm run type-check

echo "✅  All quality gates passed! Your code is ready to be committed."
exit 0
