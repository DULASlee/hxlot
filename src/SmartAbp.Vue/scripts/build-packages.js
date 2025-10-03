#!/usr/bin/env node

/**
 * 构建所有packages的脚本
 * 确保packages独立编译和类型检查
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 开始构建SmartAbp LowCode Packages...\n');

const packages = [
  'lowcode-shared',
  'lowcode-core', 
  'lowcode-api',
  'lowcode-tools',
  'lowcode-designer'
];

let allPassed = true;

for (const pkg of packages) {
  const packagePath = path.join(__dirname, '..', 'packages', pkg);
  
  if (!fs.existsSync(packagePath)) {
    console.log(`⚠️ Package ${pkg} 不存在，跳过...`);
    continue;
  }

  console.log(`📦 正在构建 ${pkg}...`);
  
  try {
    // 检查tsconfig.json是否存在
    const tsconfigPath = path.join(packagePath, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      console.log(`⚠️ ${pkg} 缺少 tsconfig.json，跳过TypeScript构建`);
      continue;
    }

    // 运行TypeScript编译
    execSync(`cd "${packagePath}" && npx tsc`, { 
      stdio: 'inherit',
      cwd: packagePath 
    });
    
    console.log(`✅ ${pkg} 构建成功\n`);
    
  } catch (error) {
    console.error(`❌ ${pkg} 构建失败:`, error.message);
    allPassed = false;
  }
}

if (allPassed) {
  console.log('🎉 所有packages构建成功！');
  process.exit(0);
} else {
  console.log('💥 部分packages构建失败！');
  process.exit(1);
}