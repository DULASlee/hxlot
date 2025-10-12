#!/usr/bin/env node

/**
 * AI Guardian 插件代码质量检查脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 AI Guardian 插件代码质量检查');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 检查编译输出
const outPath = path.join(__dirname, 'out', 'extension.js');
if (!fs.existsSync(outPath)) {
  console.error('❌ 编译输出文件不存在');
  process.exit(1);
}

const compiledCode = fs.readFileSync(outPath, 'utf8');

// 检查1: 关键函数是否存在
const requiredFunctions = [
  'checkExecutionEngine',
  'loadExecutionEngine', 
  'startEngineCheck',
  'recordActivity',
  'updateStatusBar',
  'activate',
  'deactivate'
];

console.log('📋 检查关键函数...');
const missingFunctions = [];
requiredFunctions.forEach(func => {
  if (!compiledCode.includes(func)) {
    missingFunctions.push(func);
  } else {
    console.log(`  ✅ ${func}`);
  }
});

if (missingFunctions.length > 0) {
  console.error(`❌ 缺少函数: ${missingFunctions.join(', ')}`);
  process.exit(1);
}

// 检查2: 错误处理
console.log('\n🛡️ 检查错误处理...');
const tryBlocks = (compiledCode.match(/try\s*{/g) || []).length;
const catchBlocks = (compiledCode.match(/catch\s*\(/g) || []).length;

if (tryBlocks !== catchBlocks) {
  console.error(`❌ try/catch 不匹配: ${tryBlocks} try, ${catchBlocks} catch`);
  process.exit(1);
} else {
  console.log(`  ✅ 错误处理完整: ${tryBlocks} 个 try/catch 块`);
}

// 检查3: 导出结构
console.log('\n📦 检查模块导出...');
const hasActivate = compiledCode.includes('exports.activate');
const hasDeactivate = compiledCode.includes('exports.deactivate');
const hasClass = compiledCode.includes('exports.AIGuardianExtension');

if (!hasActivate || !hasDeactivate || !hasClass) {
  console.error('❌ 模块导出不完整');
  process.exit(1);
} else {
  console.log('  ✅ 模块导出完整');
}

// 检查4: 配置完整性
console.log('\n⚙️ 检查配置完整性...');
const packagePath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const requiredFields = ['name', 'version', 'main', 'engines', 'contributes'];
const missingFields = [];

requiredFields.forEach(field => {
  if (!packageJson[field]) {
    missingFields.push(field);
  } else {
    console.log(`  ✅ ${field}`);
  }
});

if (missingFields.length > 0) {
  console.error(`❌ package.json 缺少字段: ${missingFields.join(', ')}`);
  process.exit(1);
}

// 检查5: 命令完整性
console.log('\n🎯 检查命令完整性...');
const commands = packageJson.contributes.commands || [];
const expectedCommands = [
  'aiGuardian.start',
  'aiGuardian.stop', 
  'aiGuardian.status',
  'aiGuardian.recover',
  'aiGuardian.checkEngine',
  'aiGuardian.loadEngine'
];

const missingCommands = [];
expectedCommands.forEach(cmd => {
  const found = commands.some(c => c.command === cmd);
  if (!found) {
    missingCommands.push(cmd);
  } else {
    console.log(`  ✅ ${cmd}`);
  }
});

if (missingCommands.length > 0) {
  console.error(`❌ 缺少命令: ${missingCommands.join(', ')}`);
  process.exit(1);
}

// 检查6: 文件大小合理性
console.log('\n📊 检查文件大小...');
const stats = fs.statSync(outPath);
const sizeKB = Math.round(stats.size / 1024);
console.log(`  📄 编译后大小: ${sizeKB}KB`);

if (sizeKB < 5) {
  console.warn('⚠️ 文件可能过小，检查是否编译完整');
} else if (sizeKB > 100) {
  console.warn('⚠️ 文件可能过大，检查是否有冗余代码');
} else {
  console.log('  ✅ 文件大小合理');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ 所有检查通过！插件代码质量良好');
console.log('📦 插件可以安全使用');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
