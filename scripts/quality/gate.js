#!/usr/bin/env node

/**
 * SmartAbp Quality Guardian - P0质量门禁
 * 企业级质量门禁系统
 */

const chalk = require('chalk');
const EnvironmentChecker = require('./utils/environment-checker');
const TypeScriptChecker = require('./checkers/typescript-checker');
const ArchitectureChecker = require('./checkers/architecture-checker');
const SmartAbpChecker = require('./checkers/smartabp-checker');
const LowCodeChecker = require('./checkers/lowcode-checker');
const CodeGenChecker = require('./checkers/codegen-checker');
const PerformanceChecker = require('./checkers/performance-checker');
const SecurityChecker = require('./checkers/security-checker');
const ReportGenerator = require('./reporters/report-generator');

class QualityGate {
    constructor(options = {}) {
        this.options = {
            mode: options.mode || 'strict', // strict | moderate | lenient
            ciMode: options.ciMode || false,
            failFast: options.failFast !== false,
            generateReport: options.generateReport !== false,
            ...options
        };

        this.results = {
            timestamp: new Date().toISOString(),
            mode: this.options.mode,
            passed: false,
            checkers: {},
            violations: {
                P0: [],
                P1: [],
                P2: []
            },
            score: 0
        };
    }

    async run() {
        try {
            console.log(chalk.blue.bold('\n🛡️  SmartAbp Quality Gate - P0质量门禁\n'));
            console.log(chalk.gray('='.repeat(60)));
            console.log(chalk.gray(`模式: ${this.options.mode}`));
            console.log(chalk.gray(`CI模式: ${this.options.ciMode ? '是' : '否'}`));
            console.log(chalk.gray('='.repeat(60)));
            console.log('');

            // 阶段0: 环境检查
            console.log(chalk.cyan('📋 阶段0: 环境检查'));
            await this.checkEnvironment();

            // 阶段1: TypeScript类型安全检查（P0）
            console.log(chalk.cyan('\n📋 阶段1: TypeScript类型安全检查'));
            const tsResult = await this.runTypeScriptCheck();

            if (!tsResult.passed && this.options.failFast) {
                return this.fail('TypeScript检查失败，停止后续检查');
            }

            // 阶段2: 架构合规性检查（P0）
            console.log(chalk.cyan('\n📋 阶段2: 架构合规性检查'));
            const archResult = await this.runArchitectureCheck();

            if (!archResult.passed && this.options.failFast) {
                return this.fail('架构检查失败，停止后续检查');
            }

            // 阶段3: SmartAbp特定规则检查
            console.log(chalk.cyan('\n📋 阶段3: SmartAbp特定规则检查'));
            const smartabpResult = await this.runSmartAbpCheck();

            if (!smartabpResult.passed && this.options.failFast) {
                return this.fail('SmartAbp规则检查失败，停止后续检查');
            }

            // 阶段4: 低代码引擎质量检查（P0 - 新增）
            console.log(chalk.cyan('\n📋 阶段4: 低代码引擎质量检查'));
            const lowcodeResult = await this.runLowCodeCheck();

            if (!lowcodeResult.passed && this.options.failFast) {
                return this.fail('低代码引擎检查失败，停止后续检查');
            }

            // 阶段5: 代码生成质量验证（P0 - 新增）
            console.log(chalk.cyan('\n📋 阶段5: 代码生成质量验证'));
            const codegenResult = await this.runCodeGenCheck();

            if (!codegenResult.passed && this.options.failFast) {
                return this.fail('代码生成检查失败，停止后续检查');
            }

            // 阶段6: 性能质量检查（P1 - Phase 2新增）
            console.log(chalk.cyan('\n📋 阶段6: 性能质量检查'));
            const perfResult = await this.runPerformanceCheck();

            // 阶段7: 安全质量检查（P1 - Phase 2新增）
            console.log(chalk.cyan('\n📋 阶段7: 安全质量检查'));
            const securityResult = await this.runSecurityCheck();

            // 汇总结果
            this.aggregateResults();

            // 生成报告
            if (this.options.generateReport) {
                await this.generateReport();
            }

            // 质量门禁判定
            return this.evaluateGate();

        } catch (error) {
            console.error(chalk.red('\n💥 质量门禁异常:'), error.message);
            if (this.options.ciMode) {
                process.exit(1);
            }
            throw error;
        }
    }

    async checkEnvironment() {
        const checker = new EnvironmentChecker();
        const result = await checker.runAllChecks();
        this.results.environment = result;
    }

    async runTypeScriptCheck() {
        const checker = new TypeScriptChecker();
        const result = await checker.check();

        this.results.checkers.typescript = result;

        // 合并违规
        if (result.violations) {
            this.results.violations.P0.push(...(result.violations.P0 || []));
            this.results.violations.P1.push(...(result.violations.P1 || []));
            this.results.violations.P2.push(...(result.violations.P2 || []));
        }

        return result;
    }

    async runArchitectureCheck() {
        const checker = new ArchitectureChecker();
        const result = await checker.check();

        this.results.checkers.architecture = result;

        // 合并违规
        if (result.violations) {
            this.results.violations.P0.push(...(result.violations.P0 || []));
            this.results.violations.P1.push(...(result.violations.P1 || []));
            this.results.violations.P2.push(...(result.violations.P2 || []));
        }

        return result;
    }

    async runSmartAbpCheck() {
        const checker = new SmartAbpChecker();
        const result = await checker.check();

        this.results.checkers.smartabp = result;

        // 合并违规
        if (result.violations) {
            this.results.violations.P0.push(...(result.violations.P0 || []));
            this.results.violations.P1.push(...(result.violations.P1 || []));
            this.results.violations.P2.push(...(result.violations.P2 || []));
        }

        return result;
    }

    async runLowCodeCheck() {
        const checker = new LowCodeChecker();
        const result = await checker.check();

        this.results.checkers.lowcode = result;

        // 合并违规
        if (result.violations) {
            this.results.violations.P0.push(...(result.violations.P0 || []));
            this.results.violations.P1.push(...(result.violations.P1 || []));
            this.results.violations.P2.push(...(result.violations.P2 || []));
        }

        return result;
    }

    async runCodeGenCheck() {
        const checker = new CodeGenChecker();
        const result = await checker.check();

        this.results.checkers.codegen = result;

        // 合并违规
        if (result.violations) {
            this.results.violations.P0.push(...(result.violations.P0 || []));
            this.results.violations.P1.push(...(result.violations.P1 || []));
            this.results.violations.P2.push(...(result.violations.P2 || []));
        }

        return result;
    }

    async runPerformanceCheck() {
        const checker = new PerformanceChecker();
        const result = await checker.check();

        this.results.checkers.performance = result;

        // 合并违规
        if (result.violations) {
            this.results.violations.P0.push(...(result.violations.P0 || []));
            this.results.violations.P1.push(...(result.violations.P1 || []));
            this.results.violations.P2.push(...(result.violations.P2 || []));
        }

        return result;
    }

    async runSecurityCheck() {
        const checker = new SecurityChecker();
        const result = await checker.check();

        this.results.checkers.security = result;

        // 合并违规
        if (result.violations) {
            this.results.violations.P0.push(...(result.violations.P0 || []));
            this.results.violations.P1.push(...(result.violations.P1 || []));
            this.results.violations.P2.push(...(result.violations.P2 || []));
        }

        return result;
    }

    aggregateResults() {
        console.log('');
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.blue.bold('\n📊 质量门禁结果汇总:\n'));

        const p0Count = this.results.violations.P0.length;
        const p1Count = this.results.violations.P1.length;
        const p2Count = this.results.violations.P2.length;
        const totalCount = p0Count + p1Count + p2Count;

        console.log(chalk.white('  违规统计:'));
        if (p0Count === 0) {
            console.log(chalk.green(`    ✅ P0 阻断性问题: 0个`));
        } else {
            console.log(chalk.red.bold(`    ❌ P0 阻断性问题: ${p0Count}个`));
        }

        if (p1Count === 0) {
            console.log(chalk.green(`    ✅ P1 严重问题: 0个`));
        } else {
            console.log(chalk.yellow(`    ⚠️  P1 严重问题: ${p1Count}个`));
        }

        if (p2Count <= 10) {
            console.log(chalk.green(`    ✅ P2 一般问题: ${p2Count}个`));
        } else {
            console.log(chalk.yellow(`    ⚠️  P2 一般问题: ${p2Count}个`));
        }

        console.log(chalk.gray(`\n    总违规数: ${totalCount}个`));

        // 计算质量评分
        this.results.score = this.calculateScore(p0Count, p1Count, p2Count);
        console.log(chalk.cyan(`\n  质量评分: ${this.results.score}/100`));
        console.log('');
    }

    calculateScore(p0, p1, p2) {
        // 基础分100分
        let score = 100;

        // P0违规：每个扣10分
        score -= p0 * 10;

        // P1违规：每个扣5分
        score -= p1 * 5;

        // P2违规：每个扣1分
        score -= p2 * 1;

        // 最低0分
        return Math.max(0, score);
    }

    async generateReport() {
        console.log(chalk.blue('📝 生成质量报告...\n'));

        const generator = new ReportGenerator(this.results);
        await generator.generate({ formats: ['json', 'markdown'] });
    }

    evaluateGate() {
        const p0Count = this.results.violations.P0.length;
        const p1Count = this.results.violations.P1.length;

        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.blue.bold('\n🚦 质量门禁判定:\n'));

        // 严格模式：P0 = 0 且 P1 = 0
        if (this.options.mode === 'strict') {
            if (p0Count === 0 && p1Count === 0) {
                this.results.passed = true;
                return this.pass();
            } else {
                this.results.passed = false;
                return this.fail('严格模式：必须P0和P1零违规');
            }
        }

        // 适中模式：P0 = 0
        if (this.options.mode === 'moderate') {
            if (p0Count === 0) {
                this.results.passed = true;
                return this.pass();
            } else {
                this.results.passed = false;
                return this.fail('适中模式：必须P0零违规');
            }
        }

        // 宽松模式：评分 >= 90
        if (this.options.mode === 'lenient') {
            if (this.results.score >= 90) {
                this.results.passed = true;
                return this.pass();
            } else {
                this.results.passed = false;
                return this.fail(`宽松模式：评分未达标（${this.results.score}/90）`);
            }
        }

        // 默认：严格模式
        if (p0Count === 0 && p1Count === 0) {
            this.results.passed = true;
            return this.pass();
        } else {
            this.results.passed = false;
            return this.fail('质量门禁未通过');
        }
    }

    pass() {
        console.log(chalk.green.bold('  ✅ 质量门禁通过！'));
        console.log(chalk.green('\n  🎉 代码质量达到企业级标准，可以提交！\n'));

        if (this.options.ciMode) {
            process.exit(0);
        }

        return this.results;
    }

    fail(reason) {
        console.log(chalk.red.bold('  ❌ 质量门禁失败！'));
        console.log(chalk.red(`\n  💡 原因: ${reason}`));
        console.log(chalk.yellow('\n  📋 请修复所有问题后重新提交。\n'));

        // 显示修复建议
        if (this.results.violations.P0.length > 0) {
            console.log(chalk.yellow('  🔧 P0问题修复建议:'));
            const p0ByRule = this.groupByRule(this.results.violations.P0);
            Object.keys(p0ByRule).slice(0, 3).forEach(rule => {
                console.log(chalk.yellow(`     • ${rule}: ${p0ByRule[rule].length}处`));
            });
            console.log('');
        }

        if (this.options.ciMode) {
            process.exit(1);
        }

        return this.results;
    }

    groupByRule(violations) {
        const grouped = {};
        violations.forEach(v => {
            const rule = v.rule || 'unknown';
            if (!grouped[rule]) {
                grouped[rule] = [];
            }
            grouped[rule].push(v);
        });
        return grouped;
    }
}

// CLI接口
async function main() {
    const args = process.argv.slice(2);

    const options = {
        mode: args.includes('--moderate') ? 'moderate' :
            args.includes('--lenient') ? 'lenient' : 'strict',
        ciMode: args.includes('--ci-mode'),
        failFast: !args.includes('--no-fail-fast'),
        generateReport: !args.includes('--no-report')
    };

    const gate = new QualityGate(options);
    await gate.run();
}

if (require.main === module) {
    main().catch(error => {
        console.error(chalk.red('\n💥 程序异常:'), error);
        process.exit(1);
    });
}

module.exports = QualityGate;

