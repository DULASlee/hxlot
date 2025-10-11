#!/usr/bin/env node

/**
 * 构建所有packages的脚本
 * 确保packages独立编译和类型检查
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 开始构建SmartAbp LowCode Packages...\n');

const packages = [
  'metadata-core',      // Layer -1: 底层Schema
  'lowcode-shared',     // Layer 0: 共享基础
  'lowcode-api',        // Layer 1: API层
  'lowcode-tools',      // Layer 1: 工具集
  'lowcode-core',       // Layer 1: 核心引擎
  'lowcode-designer'    // Layer 2: 顶层设计器
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
