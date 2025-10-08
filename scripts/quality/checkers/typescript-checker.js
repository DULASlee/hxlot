#!/usr/bin/env node

/**
 * SmartAbp Quality Guardian - TypeScript检查器
 * P0规则：100%类型安全，零容忍 as any / @ts-ignore
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class TypeScriptChecker {
  constructor(config = {}) {
    this.config = config;
    this.projectRoot = this.findProjectRoot();
    this.violations = {
      P0: [],
      P1: [],
      P2: []
    };
    this.stats = {
      totalFiles: 0,
      checkedFiles: 0,
      errors: 0,
      warnings: 0
    };
  }

  findProjectRoot() {
    let current = process.cwd();
    while (current !== '/') {
      if (fs.existsSync(path.join(current, 'package.json'))) {
        return current;
      }
      current = path.dirname(current);
    }
    return process.cwd();
  }

  async check() {
    console.log(chalk.blue.bold('\n🔍 TypeScript类型安全检查\n'));
    console.log(chalk.gray('=' .repeat(60)));
    console.log('');

    // 检查1: TypeScript编译检查
    await this.checkTypeScriptCompilation();

    // 检查2: 禁用 as any
    await this.checkNoAsAny();

    // 检查3: 禁用 @ts-ignore
    await this.checkNoTsIgnore();

    // 检查4: 严格null检查
    await this.checkStrictNullChecks();

    // 汇总结果
    this.printSummary();

    return {
      passed: this.violations.P0.length === 0,
      violations: this.violations,
      stats: this.stats
    };
  }

  async checkTypeScriptCompilation() {
    console.log(chalk.blue('  📋 检查1: TypeScript编译'));
    
    const vueDir = path.join(this.projectRoot, 'src/SmartAbp.Vue');
    
    if (!fs.existsSync(vueDir)) {
      console.log(chalk.yellow('     ⚠️ Vue项目目录不存在，跳过'));
      return;
    }

    try {
      // 运行 tsc --noEmit 检查类型
      console.log(chalk.gray('     正在检查类型...'));
      
      const output = execSync(
        'npx tsc --noEmit --project tsconfig.json',
        { 
          cwd: vueDir,
          encoding: 'utf8',
          stdio: 'pipe'
        }
      );

      console.log(chalk.green('     ✅ TypeScript编译通过（0错误）'));
      
    } catch (error) {
      const errorOutput = error.stdout || error.stderr || '';
      const errorLines = errorOutput.split('\n').filter(line => line.trim());
      
      // 解析TypeScript错误
      const tsErrors = this.parseTypeScriptErrors(errorLines);
      
      if (tsErrors.length > 0) {
        console.log(chalk.red(`     ❌ TypeScript编译失败（${tsErrors.length}个错误）`));
        
        // 记录为P0违规
        tsErrors.forEach(err => {
          this.violations.P0.push({
            rule: 'typescript.no-compilation-errors',
            level: 'P0',
            file: err.file,
            line: err.line,
            column: err.column,
            message: err.message,
            code: err.code
          });
        });

        // 显示前5个错误
        console.log(chalk.red('\n     前5个错误:'));
        tsErrors.slice(0, 5).forEach(err => {
          console.log(chalk.red(`       • ${err.file}:${err.line}:${err.column}`));
          console.log(chalk.gray(`         ${err.message}`));
        });
        console.log('');
        
      } else {
        console.log(chalk.yellow('     ⚠️ 编译失败但无法解析错误'));
      }
    }
  }

  parseTypeScriptErrors(errorLines) {
    const errors = [];
    
    for (const line of errorLines) {
      // 匹配格式: src/file.ts(10,5): error TS2345: ...
      const match = line.match(/^(.+\.tsx?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
      
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          code: match[4],
          message: match[5]
        });
      }
    }
    
    return errors;
  }

  async checkNoAsAny() {
    console.log(chalk.blue('  📋 检查2: 禁用 as any'));
    
    const searchDirs = [
      'src/SmartAbp.Vue/src',
      'src/SmartAbp.Vue/packages'
    ];

    let totalViolations = 0;

    for (const dir of searchDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) continue;

      try {
        const result = execSync(
          `grep -rn "as any" --include="*.ts" --include="*.vue" --include="*.tsx" "${fullPath}" || true`,
          { encoding: 'utf8' }
        );

        const violations = this.parseGrepResults(result, 'as any');
        totalViolations += violations.length;

        violations.forEach(v => {
          this.violations.P0.push({
            rule: 'typescript.no-any',
            level: 'P0',
            file: v.file,
            line: v.line,
            message: '禁止使用 as any，必须定义正确的类型',
            snippet: v.content
          });
        });

      } catch (error) {
        // grep没找到结果时会返回非0退出码，这是正常的
      }
    }

    if (totalViolations === 0) {
      console.log(chalk.green('     ✅ 未发现 as any（0违规）'));
    } else {
      console.log(chalk.red(`     ❌ 发现 ${totalViolations} 处 as any 违规`));
    }
  }

  async checkNoTsIgnore() {
    console.log(chalk.blue('  📋 检查3: 禁用 @ts-ignore'));
    
    const searchDirs = [
      'src/SmartAbp.Vue/src',
      'src/SmartAbp.Vue/packages'
    ];

    let totalViolations = 0;

    for (const dir of searchDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) continue;

      try {
        const result = execSync(
          `grep -rn "@ts-ignore\\|@ts-nocheck" --include="*.ts" --include="*.vue" --include="*.tsx" "${fullPath}" || true`,
          { encoding: 'utf8' }
        );

        const violations = this.parseGrepResults(result, '@ts-ignore/@ts-nocheck');
        totalViolations += violations.length;

        violations.forEach(v => {
          this.violations.P0.push({
            rule: 'typescript.no-ts-ignore',
            level: 'P0',
            file: v.file,
            line: v.line,
            message: '禁止使用 @ts-ignore/@ts-nocheck，必须解决类型问题',
            snippet: v.content
          });
        });

      } catch (error) {
        // grep没找到结果时会返回非0退出码，这是正常的
      }
    }

    if (totalViolations === 0) {
      console.log(chalk.green('     ✅ 未发现 @ts-ignore（0违规）'));
    } else {
      console.log(chalk.red(`     ❌ 发现 ${totalViolations} 处 @ts-ignore 违规`));
    }
  }

  async checkStrictNullChecks() {
    console.log(chalk.blue('  📋 检查4: 严格null检查配置'));
    
    const tsconfigPath = path.join(this.projectRoot, 'src/SmartAbp.Vue/tsconfig.json');
    
    if (!fs.existsSync(tsconfigPath)) {
      console.log(chalk.yellow('     ⚠️ tsconfig.json不存在'));
      return;
    }

    try {
      const content = fs.readFileSync(tsconfigPath, 'utf8');
      const config = JSON.parse(content);
      
      const strictNullChecks = config.compilerOptions?.strictNullChecks !== false;
      const strict = config.compilerOptions?.strict !== false;
      
      if (strictNullChecks || strict) {
        console.log(chalk.green('     ✅ 严格null检查已启用'));
      } else {
        console.log(chalk.yellow('     ⚠️ 建议启用 strictNullChecks'));
        this.violations.P1.push({
          rule: 'typescript.strict-null-checks',
          level: 'P1',
          file: 'tsconfig.json',
          message: '建议启用 strictNullChecks 以提高类型安全'
        });
      }
      
    } catch (error) {
      console.log(chalk.yellow(`     ⚠️ 无法读取tsconfig.json: ${error.message}`));
    }
  }

  parseGrepResults(output, pattern) {
    if (!output || !output.trim()) return [];
    
    const violations = [];
    const lines = output.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      // 格式: /path/to/file.ts:123:code content
      const match = line.match(/^(.+):(\d+):(.+)$/);
      if (match) {
        violations.push({
          file: match[1],
          line: parseInt(match[2]),
          content: match[3].trim()
        });
      }
    }
    
    return violations;
  }

  printSummary() {
    console.log('');
    console.log(chalk.gray('=' .repeat(60)));
    console.log(chalk.blue.bold('\n📊 TypeScript检查结果:\n'));

    const totalViolations = 
      this.violations.P0.length + 
      this.violations.P1.length + 
      this.violations.P2.length;

    if (this.violations.P0.length === 0) {
      console.log(chalk.green.bold('  ✅ P0检查全部通过！'));
    } else {
      console.log(chalk.red.bold(`  ❌ P0违规: ${this.violations.P0.length}个`));
    }

    if (this.violations.P1.length > 0) {
      console.log(chalk.yellow(`  ⚠️  P1警告: ${this.violations.P1.length}个`));
    }

    if (this.violations.P2.length > 0) {
      console.log(chalk.yellow(`  ⚠️  P2建议: ${this.violations.P2.length}个`));
    }

    console.log(chalk.gray(`\n  总违规数: ${totalViolations}`));
    console.log('');

    if (this.violations.P0.length > 0) {
      console.log(chalk.red.bold('  ⛔ TypeScript类型安全检查失败！'));
      console.log(chalk.red('  请修复所有P0违规后再提交代码。\n'));
    }
  }

  exportResults(outputPath) {
    const results = {
      checker: 'TypeScript',
      timestamp: new Date().toISOString(),
      passed: this.violations.P0.length === 0,
      summary: {
        P0: this.violations.P0.length,
        P1: this.violations.P1.length,
        P2: this.violations.P2.length,
        total: this.violations.P0.length + this.violations.P1.length + this.violations.P2.length
      },
      violations: this.violations,
      stats: this.stats
    };

    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
    return results;
  }
}

module.exports = TypeScriptChecker;

// CLI接口
if (require.main === module) {
  const checker = new TypeScriptChecker();
  checker.check().then(result => {
    const outputPath = 'reports/quality/typescript-check-results.json';
    checker.exportResults(outputPath);
    
    if (!result.passed) {
      process.exit(1);
    }
  }).catch(error => {
    console.error(chalk.red('\n💥 TypeScript检查异常:'), error.message);
    process.exit(1);
  });
}

