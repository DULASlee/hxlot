#!/usr/bin/env node

/**
 * 🔍 SmartAbp 核心功能完整性检查脚本
 * 验证前端低代码生成器的关键组件和API
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 开始核心功能完整性检查...\n');

// 1. 检查关键文件是否存在
const criticalFiles = [
  'src/views/lowcode/LowCodeStudioView.vue',
  'src/views/lowcode/DesignView.vue', 
  'src/views/lowcode/EntityModelingView.vue',
  'src/router/index.js',
  'src/config/menus.ts',
  'packages/lowcode-core/index.ts',
  'packages/lowcode-designer/index.ts',
  'packages/lowcode-tools/index.ts'
];

console.log('📁 核心文件存在性检查:');
criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// 2. 检查路由配置
console.log('\n🛤️  路由配置检查:');
try {
  const routerContent = fs.readFileSync('src/router/index.js', 'utf8');
  const hasLowcodeRoute = routerContent.includes('/lowcode');
  const hasStudioRedirect = routerContent.includes('/studio');
  
  console.log(`  ${hasLowcodeRoute ? '✅' : '❌'} /lowcode 路由存在`);
  console.log(`  ${hasStudioRedirect ? '✅' : '❌'} /studio 重定向存在`);
} catch (error) {
  console.log('  ❌ 路由文件读取失败');
}

// 3. 检查菜单配置
console.log('\n📋 菜单配置检查:');
try {
  const menuContent = fs.readFileSync('src/config/menus.ts', 'utf8');
  const hasCorrectPath = menuContent.includes('path: "/lowcode"');
  
  console.log(`  ${hasCorrectPath ? '✅' : '❌'} 菜单路径配置正确`);
} catch (error) {
  console.log('  ❌ 菜单文件读取失败');
}

// 4. 检查包导出
console.log('\n📦 包导出检查:');
const packages = ['lowcode-core', 'lowcode-designer', 'lowcode-tools', 'lowcode-ui-vue'];
packages.forEach(pkg => {
  const indexPath = `packages/${pkg}/index.ts`;
  const exists = fs.existsSync(indexPath);
  console.log(`  ${exists ? '✅' : '❌'} ${pkg} 包导出文件`);
  
  if (exists) {
    const content = fs.readFileSync(indexPath, 'utf8');
    const hasExports = content.includes('export');
    console.log(`    ${hasExports ? '✅' : '❌'} 包含导出语句`);
  }
});

// 5. 检查TypeScript配置
console.log('\n⚙️  TypeScript配置检查:');
try {
  const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  const hasPathMapping = tsConfig.compilerOptions && tsConfig.compilerOptions.paths;
  const smartAbpAliases = hasPathMapping ? Object.keys(tsConfig.compilerOptions.paths).filter(key => key.startsWith('@smartabp/')) : [];
  const hasSmartAbpAlias = smartAbpAliases.length > 0;
  
  console.log(`  ${hasPathMapping ? '✅' : '❌'} 路径映射配置存在`);
  console.log(`  ${hasSmartAbpAlias ? '✅' : '❌'} @smartabp/* 别名配置`);
} catch (error) {
  console.log('  ❌ TypeScript配置读取失败');
}

console.log('\n🏁 核心功能完整性检查完成!');
