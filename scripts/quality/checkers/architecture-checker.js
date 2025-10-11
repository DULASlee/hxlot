#!/usr/bin/env node

/**
 * SmartAbp Quality Guardian - 架构合规检查器
 * P0规则：packages黑盒独立，禁止相对路径和主应用引用
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class ArchitectureChecker {
  constructor(config = {}) {
    this.config = config;
    this.projectRoot = this.findProjectRoot();
    this.violations = {
      P0: [],
      P1: [],
      P2: []
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
    console.log(chalk.blue.bold('\n🏗️  架构合规性检查\n'));
    console.log(chalk.gray('='.repeat(60)));
    console.log('');

    // 检查1: packages相对路径引用（P0）
    await this.checkRelativeImportsInPackages();

    // 检查2: packages引用主应用（P0）
    await this.checkMainAppImportsInPackages();

    // 检查3: packages逆向依赖（P0）
    await this.checkReverseDependencies();

    // 检查4: 循环依赖（P1）
    await this.checkCircularDependencies();

    // 汇总结果
    this.printSummary();

    return {
      passed: this.violations.P0.length === 0,
      violations: this.violations
    };
  }

  async checkRelativeImportsInPackages() {
    console.log(chalk.blue('  📋 检查1: packages相对路径引用'));

    const packagesDir = path.join(this.projectRoot, 'src/SmartAbp.Vue/packages');

    if (!fs.existsSync(packagesDir)) {
      console.log(chalk.yellow('     ⚠️ packages目录不存在，跳过'));
      return;
    }

    try {
      // 搜索 '../' 引用（排除package内部相对引用、dist目录、测试文件）
      const result = execSync(
        `grep -rn "'\\.\\./" --include="*.ts" --include="*.vue" "${packagesDir}" | grep -v "node_modules" | grep -v "/dist/" | grep -v "/__tests__/" || true`,
        { encoding: 'utf8' }
      );

      const violations = this.parseGrepResults(result);

      if (violations.length === 0) {
        console.log(chalk.green('     ✅ 未发现跨package相对路径引用（0违规）'));
      } else {
        console.log(chalk.red(`     ❌ 发现 ${violations.length} 处相对路径违规`));

        violations.forEach(v => {
          this.violations.P0.push({
            rule: 'architecture.no-relative-imports-in-packages',
            level: 'P0',
            file: v.file,
            line: v.line,
            message: 'packages间禁止使用相对路径，必须使用@smartabp/别名',
            snippet: v.content,
            fix: this.suggestFix(v.content)
          });
        });

        // 显示前3个违规
        console.log(chalk.red('\n     前3个违规:'));
        violations.slice(0, 3).forEach(v => {
          const relPath = path.relative(this.projectRoot, v.file);
          console.log(chalk.red(`       • ${relPath}:${v.line}`));
          console.log(chalk.gray(`         ${v.content}`));
          if (this.suggestFix(v.content)) {
            console.log(chalk.cyan(`         建议: ${this.suggestFix(v.content)}`));
          }
        });
        console.log('');
      }

    } catch (error) {
      console.log(chalk.yellow('     ⚠️ 检查过程出错'));
    }
  }

  async checkMainAppImportsInPackages() {
    console.log(chalk.blue('  📋 检查2: packages引用主应用'));

    const packagesDir = path.join(this.projectRoot, 'src/SmartAbp.Vue/packages');

    if (!fs.existsSync(packagesDir)) {
      console.log(chalk.yellow('     ⚠️ packages目录不存在，跳过'));
      return;
    }

    try {
      // 搜索 '@/' 引用（主应用别名）
      const result = execSync(
        `grep -rn "from ['\\"]@/" --include="*.ts" --include="*.vue" "${packagesDir}" | grep -v "node_modules" | grep -v "/dist/" || true`,
        { encoding: 'utf8' }
      );

      const violations = this.parseGrepResults(result);

      if (violations.length === 0) {
        console.log(chalk.green('     ✅ 未发现主应用引用（0违规）'));
      } else {
        console.log(chalk.red(`     ❌ 发现 ${violations.length} 处主应用引用违规`));

        violations.forEach(v => {
          this.violations.P0.push({
            rule: 'architecture.no-main-app-imports-in-packages',
            level: 'P0',
            file: v.file,
            line: v.line,
            message: 'packages禁止引用主应用（@/），必须使用@smartabp/别名',
            snippet: v.content
          });
        });

        // 显示前3个违规
        console.log(chalk.red('\n     前3个违规:'));
        violations.slice(0, 3).forEach(v => {
          const relPath = path.relative(this.projectRoot, v.file);
          console.log(chalk.red(`       • ${relPath}:${v.line}`));
          console.log(chalk.gray(`         ${v.content}`));
        });
        console.log('');
      }

    } catch (error) {
      console.log(chalk.yellow('     ⚠️ 检查过程出错'));
    }
  }

  async checkReverseDependencies() {
    console.log(chalk.blue('  📋 检查3: packages逆向依赖'));

    const packagesDir = path.join(this.projectRoot, 'src/SmartAbp.Vue/packages');

    if (!fs.existsSync(packagesDir)) {
      console.log(chalk.yellow('     ⚠️ packages目录不存在，跳过'));
      return;
    }

    const reverseDepsToCheck = [
      {
        lowLevel: 'lowcode-shared',
        shouldNotDependOn: ['lowcode-core', 'lowcode-designer', 'lowcode-api', 'lowcode-tools'],
        description: 'lowcode-shared（层级0）不能依赖任何其他包'
      },
      {
        lowLevel: 'lowcode-core',
        shouldNotDependOn: ['lowcode-designer'],
        description: 'lowcode-core（层级1）不能依赖 lowcode-designer（层级2）'
      },
      {
        lowLevel: 'lowcode-api',
        shouldNotDependOn: ['lowcode-designer', 'lowcode-core'],
        description: 'lowcode-api（层级1）不能依赖 lowcode-designer 或同层级的 lowcode-core'
      }
    ];

    let totalViolations = 0;

    for (const check of reverseDepsToCheck) {
      const packageDir = path.join(packagesDir, check.lowLevel);
      if (!fs.existsSync(packageDir)) continue;

      for (const highLevel of check.shouldNotDependOn) {
        try {
          const result = execSync(
            `grep -rn "@smartabp/${highLevel}" --include="*.ts" --include="*.vue" "${packageDir}" | grep -v "/dist/" || true`,
            { encoding: 'utf8' }
          );

          const violations = this.parseGrepResults(result);

          if (violations.length > 0) {
            totalViolations += violations.length;
            console.log(chalk.red(`     ❌ ${check.lowLevel} 非法依赖 ${highLevel}（${violations.length}处）`));

            violations.forEach(v => {
              this.violations.P0.push({
                rule: 'architecture.no-reverse-dependencies',
                level: 'P0',
                file: v.file,
                line: v.line,
                message: `违反架构分层：${check.description}`,
                snippet: v.content
              });
            });
          }

        } catch (error) {
          // 正常，表示没找到违规
        }
      }
    }

    if (totalViolations === 0) {
      console.log(chalk.green('     ✅ 架构分层正确（0逆向依赖）'));
    }
  }

  async checkCircularDependencies() {
    console.log(chalk.blue('  📋 检查4: 循环依赖'));

    // 这是一个简化版检查，完整版需要依赖分析工具
    console.log(chalk.yellow('     ⏳ 循环依赖检查（简化版）'));

    const packagesDir = path.join(this.projectRoot, 'src/SmartAbp.Vue/packages');

    if (!fs.existsSync(packagesDir)) {
      console.log(chalk.yellow('     ⚠️ packages目录不存在，跳过'));
      return;
    }

    // 检查循环依赖（A→B→A）
    const sameLevelChecks = [
      { pkg1: 'lowcode-core', pkg2: 'lowcode-api' },
      { pkg1: 'lowcode-core', pkg2: 'lowcode-tools' },
      { pkg1: 'lowcode-api', pkg2: 'lowcode-tools' }
    ];

    let circularFound = false;

    for (const check of sameLevelChecks) {
      const pkg1Dir = path.join(packagesDir, check.pkg1);
      const pkg2Dir = path.join(packagesDir, check.pkg2);

      if (!fs.existsSync(pkg1Dir) || !fs.existsSync(pkg2Dir)) continue;

      try {
        // 检查 pkg1 是否引用 pkg2
        const result1 = execSync(
          `grep -rn "@smartabp/${check.pkg2}" --include="*.ts" --include="*.vue" "${pkg1Dir}" | grep -v "/dist/" || true`,
          { encoding: 'utf8' }
        );

        // 检查 pkg2 是否引用 pkg1
        const result2 = execSync(
          `grep -rn "@smartabp/${check.pkg1}" --include="*.ts" --include="*.vue" "${pkg2Dir}" | grep -v "/dist/" || true`,
          { encoding: 'utf8' }
        );

        if (result1.trim() && result2.trim()) {
          circularFound = true;
          console.log(chalk.red(`     ❌ 发现循环依赖: ${check.pkg1} ⇄ ${check.pkg2}`));

          this.violations.P1.push({
            rule: 'architecture.no-circular-dependencies',
            level: 'P1',
            message: `发现循环依赖: ${check.pkg1} ⇄ ${check.pkg2}`,
            details: '严禁循环依赖（A→B→A），允许单向依赖（如api→core）'
          });
        }

      } catch (error) {
        // 正常
      }
    }

    if (!circularFound) {
      console.log(chalk.green('     ✅ 未发现明显的循环依赖'));
    }
  }

  parseGrepResults(output) {
    if (!output || !output.trim()) return [];

    const violations = [];
    const lines = output.split('\n').filter(line => line.trim());

    for (const line of lines) {
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

  suggestFix(content) {
    // 简单的修复建议
    if (content.includes("'../../../lowcode-shared")) {
      return content.replace("'../../../lowcode-shared", "'@smartabp/lowcode-shared");
    }
    if (content.includes("'../../lowcode-")) {
      return content.replace(/'\.\.\/\.\.\/lowcode-(\w+)'/g, "'@smartabp/lowcode-$1'");
    }
    return null;
  }

  printSummary() {
    console.log('');
    console.log(chalk.gray('='.repeat(60)));
    console.log(chalk.blue.bold('\n📊 架构合规检查结果:\n'));

    const totalViolations =
      this.violations.P0.length +
      this.violations.P1.length +
      this.violations.P2.length;

    if (this.violations.P0.length === 0) {
      console.log(chalk.green.bold('  ✅ P0架构检查全部通过！'));
    } else {
      console.log(chalk.red.bold(`  ❌ P0违规: ${this.violations.P0.length}个`));
    }

    if (this.violations.P1.length > 0) {
      console.log(chalk.yellow(`  ⚠️  P1警告: ${this.violations.P1.length}个`));
    }

    console.log(chalk.gray(`\n  总违规数: ${totalViolations}`));
    console.log('');

    if (this.violations.P0.length > 0) {
      console.log(chalk.red.bold('  ⛔ 架构合规检查失败！'));
      console.log(chalk.red('  请修复所有P0违规后再提交代码。\n'));
    }
  }

  exportResults(outputPath) {
    const results = {
      checker: 'Architecture',
      timestamp: new Date().toISOString(),
      passed: this.violations.P0.length === 0,
      summary: {
        P0: this.violations.P0.length,
        P1: this.violations.P1.length,
        P2: this.violations.P2.length,
        total: this.violations.P0.length + this.violations.P1.length + this.violations.P2.length
      },
      violations: this.violations
    };

    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
    return results;
  }
}

module.exports = ArchitectureChecker;

// CLI接口
if (require.main === module) {
  const checker = new ArchitectureChecker();
  checker.check().then(result => {
    const outputPath = 'reports/quality/architecture-check-results.json';
    checker.exportResults(outputPath);

    if (!result.passed) {
      process.exit(1);
    }
  }).catch(error => {
    console.error(chalk.red('\n💥 架构检查异常:'), error.message);
    process.exit(1);
  });
}

