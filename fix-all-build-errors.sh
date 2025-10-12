#!/bin/bash

# 持续修复前端构建错误，直到成功
# 自动识别"Could not resolve"错误并修复

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 前端构建错误自动修复工具"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd src/SmartAbp.Vue

MAX_ITERATIONS=20
iteration=0

while [ $iteration -lt $MAX_ITERATIONS ]; do
  iteration=$((iteration + 1))
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔄 第 $iteration 次构建尝试"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # 运行构建
  BUILD_OUTPUT=$(npm run build 2>&1)
  BUILD_EXIT_CODE=$?
  
  if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ 构建成功！"
    echo "$BUILD_OUTPUT" | tail -20
    exit 0
  fi
  
  # 提取错误信息
  ERROR_LINE=$(echo "$BUILD_OUTPUT" | grep "Could not resolve")
  
  if [ -z "$ERROR_LINE" ]; then
    echo "❌ 构建失败，但不是路径解析错误"
    echo "$BUILD_OUTPUT" | grep -A 5 "error during build"
    exit 1
  fi
  
  # 解析错误信息
  MISSING_PATH=$(echo "$ERROR_LINE" | sed -n 's/.*Could not resolve "\([^"]*\)".*/\1/p')
  SOURCE_FILE=$(echo "$ERROR_LINE" | sed -n 's/.*from "\([^"]*\)".*/\1/p')
  
  echo "🔍 发现路径错误:"
  echo "   缺失路径: $MISSING_PATH"
  echo "   来源文件: $SOURCE_FILE"
  
  # 转换为实际文件路径
  ACTUAL_SOURCE_FILE="$SOURCE_FILE"
  
  if [ ! -f "$ACTUAL_SOURCE_FILE" ]; then
    echo "⚠️  来源文件不存在: $ACTUAL_SOURCE_FILE"
    
    # 检查是否需要添加.js扩展名
    if [[ "$MISSING_PATH" != *.js ]] && [[ "$MISSING_PATH" != *.vue ]]; then
      NEW_PATH="${MISSING_PATH}.js"
      echo "🔧 尝试修复: 添加.js扩展名"
      echo "   $MISSING_PATH → $NEW_PATH"
      
      # 在源文件中替换
      if [ -f "$ACTUAL_SOURCE_FILE" ]; then
        sed -i '' "s|['\"]${MISSING_PATH}['\"]|'${NEW_PATH}'|g" "$ACTUAL_SOURCE_FILE"
        echo "✅ 已修复"
      fi
    else
      # 检查是否是目录导入，需要添加/index.js
      MISSING_DIR=$(echo "$MISSING_PATH" | sed 's|/[^/]*$||')
      if [ -d "packages/${MISSING_DIR#./}" ] || [ -d "${MISSING_DIR#./}" ]; then
        NEW_PATH="${MISSING_PATH}/index.js"
        echo "🔧 尝试修复: 添加/index.js"
        echo "   $MISSING_PATH → $NEW_PATH"
        
        if [ -f "$ACTUAL_SOURCE_FILE" ]; then
          sed -i '' "s|['\"]${MISSING_PATH}['\"]|'${NEW_PATH}'|g" "$ACTUAL_SOURCE_FILE"
          echo "✅ 已修复"
        fi
      else
        echo "❌ 无法自动修复此错误"
        exit 1
      fi
    fi
  else
    echo "✅ 来源文件存在，尝试修复导入路径"
    
    # 添加.js扩展名
    if [[ "$MISSING_PATH" != *.js ]] && [[ "$MISSING_PATH" != *.vue ]]; then
      NEW_PATH="${MISSING_PATH}.js"
      echo "🔧 修复: $MISSING_PATH → $NEW_PATH"
      sed -i '' "s|from ['\"]${MISSING_PATH}['\"]|from '${NEW_PATH}'|g" "$ACTUAL_SOURCE_FILE"
      echo "✅ 已修复"
    fi
  fi
  
  echo ""
done

echo "❌ 达到最大迭代次数 ($MAX_ITERATIONS)，仍有错误"
exit 1

