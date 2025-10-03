#!/bin/bash

# 核心功能保护验证脚本
# 用于检查代码修复是否破坏了核心功能
# 兼容macOS bash 3.x

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛡️  核心功能保护验证"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ERRORS=0
WARNINGS=0

# 检查TypeScript核心文件
echo ""
echo "🔍 检查前端核心文件..."
echo ""

# enhancedStateMachine.ts
FILE="src/SmartAbp.Vue/packages/lowcode-core/src/stores/enhancedStateMachine.ts"
if [ -f "$FILE" ]; then
  CURRENT_LINES=$(wc -l < "$FILE" | tr -d ' ')
  MISSING=""
  
  for method in "addState" "updateState" "deleteState" "addTransition" "executeBusinessRules" "generateCode" "validateWorkflow"; do
    if ! grep -q "$method" "$FILE"; then
      MISSING="$MISSING $method"
      ((ERRORS++))
    fi
  done
  
  if [ -n "$MISSING" ]; then
    echo "❌ $FILE"
    echo "   缺少核心方法:$MISSING"
  else
    echo "✅ $FILE"
    echo "   当前行数: $CURRENT_LINES"
    echo "   所有核心方法存在"
  fi
else
  echo "❌ 核心文件丢失: $FILE"
  ((ERRORS++))
fi
echo ""

# codeGeneration.ts
FILE="src/SmartAbp.Vue/packages/lowcode-core/src/stores/codeGeneration.ts"
if [ -f "$FILE" ]; then
  CURRENT_LINES=$(wc -l < "$FILE" | tr -d ' ')
  MISSING=""
  
  for method in "generateCode" "loadTemplates" "applyTemplate" "generateFiles"; do
    if ! grep -q "$method" "$FILE"; then
      MISSING="$MISSING $method"
      ((ERRORS++))
    fi
  done
  
  if [ -n "$MISSING" ]; then
    echo "❌ $FILE"
    echo "   缺少核心方法:$MISSING"
  else
    echo "✅ $FILE"
    echo "   当前行数: $CURRENT_LINES"
    echo "   所有核心方法存在"
  fi
else
  echo "❌ 核心文件丢失: $FILE"
  ((ERRORS++))
fi
echo ""

# entityModeling.ts
FILE="src/SmartAbp.Vue/packages/lowcode-core/src/stores/entityModeling.ts"
if [ -f "$FILE" ]; then
  CURRENT_LINES=$(wc -l < "$FILE" | tr -d ' ')
  MISSING=""
  
  for method in "addEntity" "updateEntity" "deleteEntity" "addField" "validateEntity"; do
    if ! grep -q "$method" "$FILE"; then
      MISSING="$MISSING $method"
      ((ERRORS++))
    fi
  done
  
  if [ -n "$MISSING" ]; then
    echo "❌ $FILE"
    echo "   缺少核心方法:$MISSING"
  else
    echo "✅ $FILE"
    echo "   当前行数: $CURRENT_LINES"
    echo "   所有核心方法存在"
  fi
else
  echo "❌ 核心文件丢失: $FILE"
  ((ERRORS++))
fi
echo ""

# pageDesign.ts
FILE="src/SmartAbp.Vue/packages/lowcode-core/src/stores/pageDesign.ts"
if [ -f "$FILE" ]; then
  CURRENT_LINES=$(wc -l < "$FILE" | tr -d ' ')
  MISSING=""
  
  for method in "addComponent" "updateComponent" "deleteComponent" "validatePage"; do
    if ! grep -q "$method" "$FILE"; then
      MISSING="$MISSING $method"
      ((ERRORS++))
    fi
  done
  
  if [ -n "$MISSING" ]; then
    echo "❌ $FILE"
    echo "   缺少核心方法:$MISSING"
  else
    echo "✅ $FILE"
    echo "   当前行数: $CURRENT_LINES"
    echo "   所有核心方法存在"
  fi
else
  echo "❌ 核心文件丢失: $FILE"
  ((ERRORS++))
fi
echo ""

# 检查C#核心文件
echo "🔍 检查后端核心文件..."
echo ""

FILE="src/SmartAbp.CodeGenerator/Services/CodeGenerationAppService.cs"
if [ -f "$FILE" ]; then
  CURRENT_LINES=$(wc -l < "$FILE" | tr -d ' ')
  MISSING=""
  
  for method in "GenerateModuleAsync" "GenerateDddDomainAsync" "GenerateCqrsAsync" "GenerateAspireSolutionAsync"; do
    if ! grep -q "$method" "$FILE"; then
      MISSING="$MISSING $method"
      ((ERRORS++))
    fi
  done
  
  if [ -n "$MISSING" ]; then
    echo "❌ $FILE"
    echo "   缺少核心方法:$MISSING"
  else
    echo "✅ $FILE"
    echo "   当前行数: $CURRENT_LINES"
    echo "   所有核心方法存在"
  fi
else
  echo "❌ 核心文件丢失: $FILE"
  ((ERRORS++))
fi
echo ""

# 检查是否使用了any类型（前端）
echo "🔍 检查类型安全..."
echo ""

if [ -d "src/SmartAbp.Vue/packages/lowcode-core" ]; then
  ANY_COUNT=$(find src/SmartAbp.Vue/packages/lowcode-core -name "*.ts" -type f -exec grep -h ":\s*any\|<any>" {} \; 2>/dev/null | wc -l | tr -d ' ')
  
  if [ "$ANY_COUNT" -gt 0 ]; then
    echo "⚠️  发现 $ANY_COUNT 处使用any类型"
    echo "   建议: 用具体的类型定义替代any"
    ((WARNINGS++))
  else
    echo "✅ 无any类型使用"
  fi
  
  # 检查是否使用了@ts-ignore
  TS_IGNORE_COUNT=$(find src/SmartAbp.Vue/packages/lowcode-core -name "*.ts" -type f -exec grep -h "@ts-ignore" {} \; 2>/dev/null | wc -l | tr -d ' ')
  
  if [ "$TS_IGNORE_COUNT" -gt 0 ]; then
    echo "⚠️  发现 $TS_IGNORE_COUNT 处使用@ts-ignore"
    echo "   建议: 修复类型定义而非忽略错误"
    ((WARNINGS++))
  else
    echo "✅ 无@ts-ignore使用"
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 验证结果"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "错误: $ERRORS"
echo "警告: $WARNINGS"
echo ""

if [ $ERRORS -gt 0 ]; then
  echo "❌ 核心功能保护验证失败！"
  echo "   发现 $ERRORS 个严重问题"
  echo "   请检查是否有核心功能被删除或简化"
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo "⚠️  核心功能保护验证通过（有警告）"
  echo "   发现 $WARNINGS 个需要改进的地方"
  exit 0
else
  echo "✅ 核心功能保护验证完全通过！"
  echo "   所有核心功能完整保留"
  exit 0
fi