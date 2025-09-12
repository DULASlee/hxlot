#!/usr/bin/env node

/**
 * 常见算法与性能风险启发式检查（CLI）
 * - 嵌套循环
 * - 循环内 I/O（HTTP/DB）
 * - 缺分页（简单启发式）
 */

const fs = require('fs');
const path = require('path');

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

function analyzeFile(code, file) {
  const metrics = {
    nestedLoops: 0,
    ioInLoops: 0,
    missingPagingHints: 0
  };
  // 嵌套循环（粗略）：在500字符窗口内出现两个for/foreach/while
  const loopRegex = /(for\s*\(|foreach\s*\(|while\s*\()/g;
  let match;
  const loopPositions = [];
  while ((match = loopRegex.exec(code)) !== null) loopPositions.push(match.index);
  for (let i = 0; i < loopPositions.length - 1; i++) {
    if (loopPositions[i + 1] - loopPositions[i] < 500) metrics.nestedLoops++;
  }

  // 循环内 I/O：for... { ... axios/fetch/HttpClient/_repository ... }
  const forBlockRegex = /for\s*\([^)]*\)\s*\{([\s\S]*?)\}/g;
  let fb;
  while ((fb = forBlockRegex.exec(code)) !== null) {
    const body = fb[1];
    if (/(axios\.|fetch\(|HttpClient|_repository|Repository|await\s+http|await\s+client)/i.test(body)) {
      metrics.ioInLoops++;
    }
  }

  // 缺少分页提示：存在返回列表方法但没有分页关键词
  if (/Get\w*List|List\w*|GetAll/i.test(code) && !/(Paged|pagination|PageBy|Skip\(|Take\()/i.test(code)) {
    metrics.missingPagingHints++;
  }

  const penalties = metrics.nestedLoops * 5 + metrics.ioInLoops * 20 + metrics.missingPagingHints * 10;
  const score = Math.max(0, 100 - Math.min(80, penalties));
  return { file, metrics, score };
}

function average(arr) { return arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : 0; }

function run(directory = 'src', threshold = 80) {
  const dir = path.resolve(process.cwd(), directory);
  if (!fs.existsSync(dir)) {
    console.error('❌ 目录不存在:', dir);
    process.exit(2);
  }
  const files = collectFiles(dir, ['.ts', '.vue', '.cs']);
  const reports = files.map(f => analyzeFile(fs.readFileSync(f, 'utf8'), f));
  const overall = average(reports.map(r => r.score));
  console.log('\n⚙️  算法与性能启发式检查');
  console.log(`扫描文件: ${files.length}`);
  console.log(`综合评分: ${overall}`);
  const hotIssues = reports.filter(r => r.metrics.ioInLoops > 0 || r.metrics.nestedLoops > 1).slice(0, 10);
  if (hotIssues.length) {
    console.log('\n热点问题文件（前10）：');
    hotIssues.forEach(r => {
      console.log(`- ${path.relative(process.cwd(), r.file)} | loops:${r.metrics.nestedLoops} ioInLoops:${r.metrics.ioInLoops} score:${r.score}`);
    });
  }
  if (overall < threshold) {
    console.error(`❌ 低于阈值(${threshold})`);
    process.exit(5);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let dir = 'src';
  let threshold = 80;
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--','');
    const val = args[i+1];
    if (key === 'directory') dir = val;
    if (key === 'threshold') threshold = Number(val);
  }
  run(dir, threshold);
}

module.exports = { run };


