#!/usr/bin/env node

/**
 * SmartAbp Quality Guardian - SmartAbp特定规则检查器
 * 检查SmartAbp项目特有的代码质量规则
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class SmartAbpChecker {
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
        console.log(chalk.blue.bold('\n🎯 SmartAbp特定规则检查\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log('');

        // 检查1: 硬编码常量检测（P1）
        await this.checkHardcodedConstants();

        // 检查2: 空实现检测（P1）
        await this.checkEmptyImplementations();

        // 检查3: Mock代码检测（P0）
        await this.checkMockCode();

        // 检查4: TODO标记检测（P2）
        await this.checkTodoMarkers();

        // 检查5: console.log检测（P2）
        await this.checkConsoleLog();

        // 汇总结果
        this.printSummary();

        return {
            passed: this.violations.P0.length === 0,
            violations: this.violations
        };
    }

    async checkHardcodedConstants() {
        console.log(chalk.blue('  📋 检查1: 硬编码常量'));

        const patterns = [
            {
                name: '硬编码URL',
                pattern: 'http://|https://',
                excludePatterns: ['i18n/', 'locales/', '__tests__/', 'test/', '.spec.', '.test.'],
                level: 'P1'
            },
            {
                name: '硬编码密码/密钥',
                pattern: 'password.*=.*["\x27]\\|apiKey.*=.*["\x27]\\|secret.*=.*["\x27]',
                excludePatterns: ['__tests__/', 'test/', '.spec.', '.test.'],
                level: 'P0'
            },
            {
                name: '魔法数字',
                pattern: '\\b(1000|2000|3000|5000|10000)\\b',
                excludePatterns: ['__tests__/', 'test/', '.spec.', '.test.', 'constants.ts', 'config.ts'],
                level: 'P2'
            }
        ];

        for (const pattern of patterns) {
            await this.checkPattern(
                pattern.name,
                pattern.pattern,
                pattern.excludePatterns,
                pattern.level,
                'smartabp.no-hardcoded-constants'
            );
        }
    }

    async checkEmptyImplementations() {
        console.log(chalk.blue('  📋 检查2: 空实现检测'));

        const searchDirs = [
            'src/SmartAbp.Vue/src',
            'src/SmartAbp.Vue/packages',
            'src/SmartAbp.Application/*/AppServices'
        ];

        let totalViolations = 0;

        for (const dir of searchDirs) {
            const fullPath = path.join(this.projectRoot, dir);
            if (!fs.existsSync(fullPath)) continue;

            try {
                // 检查空函数：function xxx() {}
                const result = execSync(
                    `grep -rn "\\(\\)\\s*{\\s*}" --include="*.ts" --include="*.vue" --include="*.cs" "${fullPath}" | grep -v "__tests__" | grep -v "/dist/" || true`,
                    { encoding: 'utf8' }
                );

                const violations = this.parseGrepResults(result);
                totalViolations += violations.length;

                violations.forEach(v => {
                    this.violations.P1.push({
                        rule: 'smartabp.no-empty-implementations',
                        level: 'P1',
                        file: v.file,
                        line: v.line,
                        message: '发现空实现，应该提供真实的业务逻辑',
                        snippet: v.content
                    });
                });

            } catch (error) {
                // 正常
            }
        }

        if (totalViolations === 0) {
            console.log(chalk.green('     ✅ 未发现空实现（0违规）'));
        } else {
            console.log(chalk.yellow(`     ⚠️  发现 ${totalViolations} 处空实现`));
        }
    }

    async checkMockCode() {
        console.log(chalk.blue('  📋 检查3: Mock代码检测'));

        const searchDirs = [
            'src/SmartAbp.Vue/src',
            'src/SmartAbp.Application'
        ];

        let totalViolations = 0;

        for (const dir of searchDirs) {
            const fullPath = path.join(this.projectRoot, dir);
            if (!fs.existsSync(fullPath)) continue;

            try {
                // 检查Mock关键词（排除测试文件）
                const result = execSync(
                    `grep -rn "\\bmock\\b|\\bMock\\b|Promise\\.resolve({" --include="*.ts" --include="*.cs" "${fullPath}" | grep -v "__tests__" | grep -v "/test/" | grep -v ".spec." | grep -v ".test." | grep -v "/dist/" || true`,
                    { encoding: 'utf8' }
                );

                const violations = this.parseGrepResults(result);
                totalViolations += violations.length;

                violations.forEach(v => {
                    this.violations.P0.push({
                        rule: 'smartabp.no-mock-code-in-production',
                        level: 'P0',
                        file: v.file,
                        line: v.line,
                        message: '生产代码中禁止使用Mock数据，必须调用真实API',
                        snippet: v.content
                    });
                });

            } catch (error) {
                // 正常
            }
        }

        if (totalViolations === 0) {
            console.log(chalk.green('     ✅ 未发现Mock代码（0违规）'));
        } else {
            console.log(chalk.red(`     ❌ 发现 ${totalViolations} 处Mock代码`));
        }
    }

    async checkTodoMarkers() {
        console.log(chalk.blue('  📋 检查4: TODO标记检测'));

        const searchDirs = [
            'src/SmartAbp.Vue/src',
            'src/SmartAbp.Vue/packages',
            'src/SmartAbp.Application'
        ];

        let totalViolations = 0;

        for (const dir of searchDirs) {
            const fullPath = path.join(this.projectRoot, dir);
            if (!fs.existsSync(fullPath)) continue;

            try {
                const result = execSync(
                    `grep -rn "TODO\\|FIXME\\|XXX\\|HACK" --include="*.ts" --include="*.vue" --include="*.cs" "${fullPath}" | grep -v "__tests__" | grep -v "/dist/" || true`,
                    { encoding: 'utf8' }
                );

                const violations = this.parseGrepResults(result);
                totalViolations += violations.length;

                violations.forEach(v => {
                    this.violations.P2.push({
                        rule: 'smartabp.no-todo-in-production',
                        level: 'P2',
                        file: v.file,
                        line: v.line,
                        message: '建议完成TODO标记的工作',
                        snippet: v.content
                    });
                });

            } catch (error) {
                // 正常
            }
        }

        if (totalViolations === 0) {
            console.log(chalk.green('     ✅ 未发现TODO标记（0个）'));
        } else if (totalViolations <= 10) {
            console.log(chalk.green(`     ✅ TODO标记: ${totalViolations}个（可接受）`));
        } else {
            console.log(chalk.yellow(`     ⚠️  TODO标记: ${totalViolations}个（建议减少）`));
        }
    }

    async checkConsoleLog() {
        console.log(chalk.blue('  📋 检查5: console.log检测'));

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
                    `grep -rn "console\\.log\\|console\\.warn\\|console\\.error" --include="*.ts" --include="*.vue" "${fullPath}" | grep -v "__tests__" | grep -v "/dist/" || true`,
                    { encoding: 'utf8' }
                );

                const violations = this.parseGrepResults(result);
                totalViolations += violations.length;

                violations.forEach(v => {
                    this.violations.P2.push({
                        rule: 'eslint.no-console',
                        level: 'P2',
                        file: v.file,
                        line: v.line,
                        message: '建议使用日志系统代替console.log',
                        snippet: v.content
                    });
                });

            } catch (error) {
                // 正常
            }
        }

        if (totalViolations === 0) {
            console.log(chalk.green('     ✅ 未发现console.log（0个）'));
        } else if (totalViolations <= 20) {
            console.log(chalk.green(`     ✅ console.log: ${totalViolations}个（可接受）`));
        } else {
            console.log(chalk.yellow(`     ⚠️  console.log: ${totalViolations}个（建议使用日志系统）`));
        }
    }

    async checkPattern(name, pattern, excludePatterns, level, rule) {
        const searchDirs = [
            'src/SmartAbp.Vue/src',
            'src/SmartAbp.Vue/packages'
        ];

        let totalViolations = 0;

        for (const dir of searchDirs) {
            const fullPath = path.join(this.projectRoot, dir);
            if (!fs.existsSync(fullPath)) continue;

            try {
                let grepCmd = `grep -rn "${pattern}" --include="*.ts" --include="*.vue" "${fullPath}"`;

                // 添加排除模式
                for (const exclude of excludePatterns) {
                    grepCmd += ` | grep -v "${exclude}"`;
                }

                grepCmd += ` | grep -v "/dist/" || true`;

                const result = execSync(grepCmd, { encoding: 'utf8' });
                const violations = this.parseGrepResults(result);
                totalViolations += violations.length;

                violations.forEach(v => {
                    this.violations[level].push({
                        rule,
                        level,
                        file: v.file,
                        line: v.line,
                        message: `${name}`,
                        snippet: v.content
                    });
                });

            } catch (error) {
                // 正常
            }
        }

        if (totalViolations === 0) {
            console.log(chalk.green(`     ✅ ${name}: 0违规`));
        } else if (level === 'P0') {
            console.log(chalk.red(`     ❌ ${name}: ${totalViolations}处`));
        } else if (level === 'P1') {
            console.log(chalk.yellow(`     ⚠️  ${name}: ${totalViolations}处`));
        } else {
            console.log(chalk.gray(`     ℹ️  ${name}: ${totalViolations}处`));
        }

        return totalViolations;
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

    printSummary() {
        console.log('');
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.blue.bold('\n📊 SmartAbp规则检查结果:\n'));

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
            console.log(chalk.gray(`  ℹ️  P2建议: ${this.violations.P2.length}个`));
        }

        console.log(chalk.gray(`\n  总违规数: ${totalViolations}`));
        console.log('');
    }

    exportResults(outputPath) {
        const results = {
            checker: 'SmartAbp',
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

module.exports = SmartAbpChecker;

// CLI接口
if (require.main === module) {
    const checker = new SmartAbpChecker();
    checker.check().then(result => {
        const outputPath = 'reports/quality/smartabp-check-results.json';
        checker.exportResults(outputPath);

        if (!result.passed) {
            process.exit(1);
        }
    }).catch(error => {
        console.error(chalk.red('\n💥 SmartAbp检查异常:'), error.message);
        process.exit(1);
    });
}

