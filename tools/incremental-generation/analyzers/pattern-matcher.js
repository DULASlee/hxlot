#!/usr/bin/env node

/**
 * 设计模式与代码气味检测器（CLI）
 * 扫描仓库，识别常见设计模式使用/缺失与基础代码气味
 */

const fs = require('fs');
const path = require('path');

class PatternMatcher {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.level = options.level || 'standard'; // standard | master
    this.results = [];
  }

  async run() {
    const srcPath = path.join(this.rootPath, 'src');
    if (!fs.existsSync(srcPath)) {
      console.error('❌ src 目录不存在');
      process.exit(2);
    }
    this.scanDir(srcPath);
    this.report();
    return this.results;
  }

  scanDir(dir) {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const p = path.join(dir, entry);
      const stat = fs.statSync(p);
      if (stat.isDirectory() && entry !== 'node_modules' && !entry.startsWith('.')) {
        this.scanDir(p);
      } else if (this.isSource(p)) {
        const code = fs.readFileSync(p, 'utf8');
        this.results.push({ file: p, checks: this.checkFile(p, code) });
      }
    }
  }

  isSource(file) {
    return ['.cs', '.ts', '.vue'].some(ext => file.endsWith(ext));
  }

  checkFile(file, code) {
    const ext = path.extname(file);
    const checks = { passed: [], failed: [], warnings: [] };

    if (ext === '.cs') {
      // ABP 应用服务模式与仓储
      if (code.includes('ApplicationService') || code.includes('IApplicationService')) {
        checks.passed.push('ABP ApplicationService pattern');
      } else if (file.includes('Application') && code.includes('class')) {
        checks.warnings.push('建议使用 ABP ApplicationService 基础类');
      }
      if (code.includes('IRepository') || code.includes('Repository')) {
        checks.passed.push('Repository pattern');
      }
      // 异常处理与权限
      if (code.match(/\btry\b[\s\S]*\bcatch\b/)) {
        checks.passed.push('Exception handling present');
      } else {
        checks.warnings.push('建议添加必要的异常处理');
      }
      if (code.includes('[Authorize') || code.includes('RequirePermissions')) {
        checks.passed.push('Authorization check present');
      } else {
        checks.warnings.push('建议添加权限校验');
      }
    }

    if (ext === '.ts' || ext === '.vue') {
      // Vue/TS 组合式与Pinia
      if (ext === '.vue' && (code.includes('<script setup') || code.includes('setup('))) {
        checks.passed.push('Vue Composition API');
      }
      if (code.includes('defineStore(')) {
        checks.passed.push('Pinia store pattern');
      }
      // 基础复杂度告警
      const longFunctions = (code.match(/function\s+\w+\([^)]*\)\s*\{[\s\S]{200,}?\}/g) || []).length;
      if (longFunctions > 0) {
        checks.warnings.push(`存在 ${longFunctions} 个过长函数`);
      }
    }

    return checks;
  }

  report() {
    let passed = 0, failed = 0, warnings = 0;
    this.results.forEach(r => {
      passed += r.checks.passed.length;
      failed += r.checks.failed.length;
      warnings += r.checks.warnings.length;
    });
    console.log('\n📊 设计模式检测报告');
    console.log(`✅ 通过项: ${passed}`);
    console.log(`❌ 失败项: ${failed}`);
    console.log(`⚠️  警告项: ${warnings}`);
    // master 等级将警告纳入阈值
    if (this.level === 'master' && (failed > 0 || warnings > 20)) {
      process.exitCode = 3;
    } else if (failed > 0) {
      process.exitCode = 3;
    }
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
  new PatternMatcher(options).run().catch(err => {
    console.error(err);
    process.exit(2);
  });
}

module.exports = PatternMatcher;


