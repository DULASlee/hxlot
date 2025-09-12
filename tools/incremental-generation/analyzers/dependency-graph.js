#!/usr/bin/env node

/**
 * 依赖关系分析器（CLI）
 * 输出内部/外部依赖数量与热点统计
 */

const fs = require('fs');
const path = require('path');

class DependencyGraph {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.scope = options.scope || 'full';
    this.graph = { internal: {}, external: {}, framework: {} };
  }

  run() {
    const src = path.join(this.rootPath, 'src');
    if (!fs.existsSync(src)) {
      console.error('❌ src 目录不存在');
      process.exit(2);
    }
    this.scanDir(src);
    this.report();
    return this.graph;
  }

  scanDir(dir) {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const p = path.join(dir, entry);
      const stat = fs.statSync(p);
      if (stat.isDirectory() && entry !== 'node_modules' && !entry.startsWith('.')) {
        this.scanDir(p);
      } else if (['.cs', '.ts', '.vue'].some(ext => p.endsWith(ext))) {
        const code = fs.readFileSync(p, 'utf8');
        this.collectDeps(p, code);
      }
    }
  }

  collectDeps(file, code) {
    if (file.endsWith('.cs')) {
      const regex = /using\s+([^;]+);/g;
      let m;
      while ((m = regex.exec(code)) !== null) {
        const ns = m[1].trim();
        this.add(ns.startsWith('SmartAbp') ? 'internal' : ns.startsWith('Volo.Abp') ? 'framework' : 'external', ns);
      }
    } else {
      const regex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
      let m;
      while ((m = regex.exec(code)) !== null) {
        const mod = m[1];
        const type = mod.startsWith('.') || mod.startsWith('@/') ? 'internal' : 'external';
        this.add(type, mod);
      }
    }
  }

  add(type, key) {
    this.graph[type][key] = (this.graph[type][key] || 0) + 1;
  }

  report() {
    const counts = {
      internal: Object.keys(this.graph.internal).length,
      external: Object.keys(this.graph.external).length,
      framework: Object.keys(this.graph.framework).length
    };
    console.log('\n📊 依赖统计');
    console.log(`内部联系: ${counts.internal}`);
    console.log(`外部联系: ${counts.external}`);
    console.log(`框架依赖: ${counts.framework}`);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1] ?? true;
    options[key] = value;
  }
  new DependencyGraph(options).run();
}

module.exports = DependencyGraph;


