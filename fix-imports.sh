#!/bin/bash

# 批量修复 packages 目录下所有 .js 文件中缺少扩展名的相对导入
# 只修复 from './...' 格式，不修改 from '@...' 或 node_modules 导入

echo "🔧 开始修复 lowcode-shared 的导入路径..."

cd src/SmartAbp.Vue/packages/lowcode-shared/src

# 修复所有 .js 文件中的相对导入（排除已有扩展名的）
find . -name "*.js" -type f -exec sed -i '' \
  -e "s|from '\./\([^']*\)'|from './\1.js'|g" \
  -e "s|from \"\./\([^\"]*\)\"|from \"./\1.js\"|g" \
  -e "s|from '\.\./\([^']*\)'|from '../\1.js'|g" \
  -e "s|from \"\.\./\([^\"]*\)\"|from \"../\1.js\"|g" \
  {} \;

# 修复重复的 .js.js 扩展名
find . -name "*.js" -type f -exec sed -i '' \
  -e "s|\.js\.js|.js|g" \
  -e "s|\.vue\.js|.vue|g" \
  {} \;

echo "✅ lowcode-shared 导入路径修复完成！"

cd ../../../../..

echo "🔧 开始修复 lowcode-core 的导入路径..."

cd src/SmartAbp.Vue/packages/lowcode-core/src

# 修复所有 .js 文件中的相对导入
find . -name "*.js" -type f -exec sed -i '' \
  -e "s|from '\./\([^']*\)'|from './\1.js'|g" \
  -e "s|from \"\./\([^\"]*\)\"|from \"./\1.js\"|g" \
  -e "s|from '\.\./\([^']*\)'|from '../\1.js'|g" \
  -e "s|from \"\.\./\([^\"]*\)\"|from \"../\1.js\"|g" \
  {} \;

# 修复重复的扩展名
find . -name "*.js" -type f -exec sed -i '' \
  -e "s|\.js\.js|.js|g" \
  -e "s|\.vue\.js|.vue|g" \
  {} \;

echo "✅ lowcode-core 导入路径修复完成！"

echo "🎉 所有导入路径修复完成！"

