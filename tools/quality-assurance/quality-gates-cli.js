#!/usr/bin/env node

/**
 * 质量门 CLI 包装器
 * - 接收阈值参数，读取目标文件或目录
 * - 使用内部 QualityGateChecker 生成分数
 * - 根据阈值返回非零退出码
 */

const fs = require('fs');
const path = require('path');
const QualityGateChecker = require('./quality-gates');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { threshold: 80, directory: 'src', componentType: 'general' };
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    if (key === 'threshold') options.threshold = Number(value);
    else if (key === 'directory') options.directory = value;
    else if (key === 'componentType') options.componentType = value;
    else if (key === 'file') options.file = value;
  }
  return options;
}

async function run() {
  const options = parseArgs();
  const checker = new QualityGateChecker();
  const results = [];

  try {
    if (options.file) {
      const abs = path.resolve(process.cwd(), options.file);
      const code = fs.readFileSync(abs, 'utf8');
      const report = await checker.checkCodeQuality(abs, code, { componentType: options.componentType });
      results.push(report);
    } else {
      const dir = path.resolve(process.cwd(), options.directory);
      if (!fs.existsSync(dir)) throw new Error(`目录不存在: ${dir}`);
      const files = collectFiles(dir, ['.ts', '.vue', '.cs']);
      for (const f of files) {
        const code = fs.readFileSync(f, 'utf8');
        const type = f.endsWith('.vue') ? 'crud' : 'general';
        const report = await checker.checkCodeQuality(f, code, { componentType: type });
        results.push(report);
      }
    }

    const finalScore = average(results.map(r => r.qualityScore));
    console.log(`\n🏁 质量得分: ${finalScore}`);
    if (finalScore < options.threshold) {
      console.error(`❌ 未达阈值(${options.threshold})`);
      process.exit(4);
    }
  } catch (e) {
    console.error('❌ 质量门执行失败:', e.message);
    process.exit(2);
  }
}

function collectFiles(dir, exts) {
  const out = [];
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const stat = fs.statSync(p);
    if (stat.isDirectory() && entry !== 'node_modules' && !entry.startsWith('.')) {
      out.push(...collectFiles(p, exts));
    } else if (exts.some(ext => p.endsWith(ext))) {
      out.push(p);
    }
  }
  return out;
}

function average(nums) {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

if (require.main === module) {
  run();
}


