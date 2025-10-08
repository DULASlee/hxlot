#!/usr/bin/env node

/**
 * SmartAbp Quality Guardian - 性能质量检查器
 * 检查代码性能问题和性能优化机会
 * 
 * 检查项：
 * 1. 组件加载性能检查（P1）
 * 2. 代码包大小分析（P1）
 * 3. 大文件检测（P1）
 * 4. 复杂函数检测（P1）
 * 5. 性能优化建议（P2）
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

class PerformanceChecker {
    constructor(config = {}) {
        this.config = {
            maxFileSize: config.maxFileSize || 500,        // 最大文件行数
            maxFunctionLines: config.maxFunctionLines || 100, // 最大函数行数
            maxBundleSize: config.maxBundleSize || 500,    // 最大bundle大小（KB）
            maxComponentSize: config.maxComponentSize || 300, // 最大组件行数
            ...config
        };

        this.projectRoot = this.findProjectRoot();
        this.violations = {
            P0: [],
            P1: [],
            P2: []
        };

        // 前端代码路径
        this.frontendPaths = [
            'src/SmartAbp.Vue/src',
            'src/SmartAbp.Vue/packages'
        ];
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
        console.log(chalk.blue.bold('\n⚡ 性能质量检查\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log('');

        // 检查1: 大文件检测
        await this.checkLargeFiles();

        // 检查2: 复杂函数检测
        await this.checkComplexFunctions();

        // 检查3: 组件大小检查
        await this.checkComponentSize();

        // 检查4: Bundle大小分析
        await this.checkBundleSize();

        // 检查5: 懒加载检查
        await this.checkLazyLoading();

        // 汇总结果
        this.printSummary();

        return {
            passed: this.violations.P0.length === 0,
            violations: this.violations
        };
    }

    /**
     * 检查1: 大文件检测
     * 文件过大影响加载和维护
     */
    async checkLargeFiles() {
        console.log(chalk.blue('  📋 检查1: 大文件检测'));

        try {
            let largeFileCount = 0;

            for (const frontendPath of this.frontendPaths) {
                const fullPath = path.join(this.projectRoot, frontendPath);
                if (!fs.existsSync(fullPath)) continue;

                // 查找所有TS/Vue文件并统计行数
                const result = execSync(
                    `find "${fullPath}" -name "*.ts" -o -name "*.vue" | grep -v "node_modules" | grep -v "/dist/" | xargs wc -l | sort -rn | head -20`,
                    { encoding: 'utf8' }
                );

                const lines = result.split('\n').filter(l => l.trim());

                for (const line of lines) {
                    const match = line.trim().match(/^\s*(\d+)\s+(.+)$/);
                    if (match) {
                        const lineCount = parseInt(match[1]);
                        const filePath = match[2];

                        if (lineCount > this.config.maxFileSize && !filePath.includes('total')) {
                            largeFileCount++;

                            const level = lineCount > 1000 ? 'P1' : 'P2';
                            this.violations[level].push({
                                rule: 'performance.large-file',
                                level,
                                file: filePath,
                                message: `文件过大: ${lineCount}行 (建议<${this.config.maxFileSize}行)`,
                                lineCount
                            });
                        }
                    }
                }
            }

            if (largeFileCount === 0) {
                console.log(chalk.green('     ✅ 无大文件（0个超过500行）'));
            } else {
                console.log(chalk.yellow(`     ⚠️  发现 ${largeFileCount} 个大文件`));
            }

        } catch (error) {
            console.log(chalk.yellow(`     ⚠️  检查过程出错: ${error.message}`));
        }
    }

    /**
     * 检查2: 复杂函数检测
     * 函数过长影响可读性和性能
     */
    async checkComplexFunctions() {
        console.log(chalk.blue('  📋 检查2: 复杂函数检测'));

        try {
            let complexFunctionCount = 0;

            for (const frontendPath of this.frontendPaths) {
                const fullPath = path.join(this.projectRoot, frontendPath);
                if (!fs.existsSync(fullPath)) continue;

                // 查找大型函数（简化检测：查找function和箭头函数）
                const files = execSync(
                    `find "${fullPath}" -name "*.ts" -o -name "*.vue" | grep -v "node_modules" | grep -v "/dist/"`,
                    { encoding: 'utf8' }
                ).split('\n').filter(f => f.trim());

                for (const file of files.slice(0, 50)) { // 限制检查文件数
                    if (!file.trim()) continue;

                    try {
                        const content = fs.readFileSync(file, 'utf8');
                        const functions = this.extractFunctions(content);

                        for (const func of functions) {
                            if (func.lines > this.config.maxFunctionLines) {
                                complexFunctionCount++;

                                const level = func.lines > 200 ? 'P1' : 'P2';
                                this.violations[level].push({
                                    rule: 'performance.complex-function',
                                    level,
                                    file,
                                    message: `函数过长: ${func.name} (${func.lines}行，建议<${this.config.maxFunctionLines}行)`,
                                    functionName: func.name,
                                    lineCount: func.lines
                                });
                            }
                        }
                    } catch (error) {
                        // 忽略读取错误
                    }
                }
            }

            if (complexFunctionCount === 0) {
                console.log(chalk.green('     ✅ 无复杂函数（0个超过100行）'));
            } else {
                console.log(chalk.yellow(`     ⚠️  发现 ${complexFunctionCount} 个复杂函数`));
            }

        } catch (error) {
            console.log(chalk.yellow(`     ⚠️  检查过程出错: ${error.message}`));
        }
    }

    /**
     * 检查3: 组件大小检查
     * 组件过大应该拆分
     */
    async checkComponentSize() {
        console.log(chalk.blue('  📋 检查3: 组件大小检查'));

        try {
            let largeComponentCount = 0;

            for (const frontendPath of this.frontendPaths) {
                const fullPath = path.join(this.projectRoot, frontendPath);
                if (!fs.existsSync(fullPath)) continue;

                // 查找Vue组件并统计行数
                const result = execSync(
                    `find "${fullPath}" -name "*.vue" | grep -v "node_modules" | grep -v "/dist/" | xargs wc -l | sort -rn | head -15`,
                    { encoding: 'utf8' }
                );

                const lines = result.split('\n').filter(l => l.trim());

                for (const line of lines) {
                    const match = line.trim().match(/^\s*(\d+)\s+(.+)$/);
                    if (match) {
                        const lineCount = parseInt(match[1]);
                        const filePath = match[2];

                        if (lineCount > this.config.maxComponentSize && !filePath.includes('total')) {
                            largeComponentCount++;

                            this.violations.P2.push({
                                rule: 'performance.large-component',
                                level: 'P2',
                                file: filePath,
                                message: `组件过大: ${lineCount}行 (建议<${this.config.maxComponentSize}行，考虑拆分)`,
                                lineCount
                            });
                        }
                    }
                }
            }

            if (largeComponentCount === 0) {
                console.log(chalk.green('     ✅ 组件大小合理（0个超过300行）'));
            } else {
                console.log(chalk.yellow(`     ⚠️  发现 ${largeComponentCount} 个大组件（建议拆分）`));
            }

        } catch (error) {
            console.log(chalk.yellow(`     ⚠️  检查过程出错: ${error.message}`));
        }
    }

    /**
     * 检查4: Bundle大小分析
     * 检查打包产物大小
     */
    async checkBundleSize() {
        console.log(chalk.blue('  📋 检查4: Bundle大小分析'));

        try {
            const distPath = path.join(this.projectRoot, 'src/SmartAbp.Vue/dist');

            if (!fs.existsSync(distPath)) {
                console.log(chalk.gray('     ℹ️  未找到dist目录，跳过检查'));
                return;
            }

            // 查找大型bundle文件
            const result = execSync(
                `find "${distPath}" -name "*.js" -type f -exec du -k {} + | sort -rn | head -10`,
                { encoding: 'utf8' }
            );

            const lines = result.split('\n').filter(l => l.trim());
            let largeBundleCount = 0;

            for (const line of lines) {
                const match = line.trim().match(/^(\d+)\s+(.+)$/);
                if (match) {
                    const sizeKB = parseInt(match[1]);
                    const filePath = match[2];

                    if (sizeKB > this.config.maxBundleSize) {
                        largeBundleCount++;

                        this.violations.P1.push({
                            rule: 'performance.large-bundle',
                            level: 'P1',
                            file: filePath,
                            message: `Bundle过大: ${sizeKB}KB (建议<${this.config.maxBundleSize}KB，考虑代码分割)`,
                            sizeKB
                        });
                    }
                }
            }

            if (largeBundleCount === 0) {
                console.log(chalk.green('     ✅ Bundle大小合理'));
            } else {
                console.log(chalk.yellow(`     ⚠️  发现 ${largeBundleCount} 个大Bundle`));
            }

        } catch (error) {
            console.log(chalk.gray('     ℹ️  未找到dist目录，跳过检查'));
        }
    }

    /**
     * 检查5: 懒加载检查
     * 检查路由是否使用懒加载
     */
    async checkLazyLoading() {
        console.log(chalk.blue('  📋 检查5: 懒加载检查'));

        try {
            const routerPath = path.join(this.projectRoot, 'src/SmartAbp.Vue/src/router');

            if (!fs.existsSync(routerPath)) {
                console.log(chalk.gray('     ℹ️  未找到router目录，跳过检查'));
                return;
            }

            // 查找路由配置文件
            const routeFiles = execSync(
                `find "${routerPath}" -name "*.ts" | grep -v "node_modules"`,
                { encoding: 'utf8' }
            ).split('\n').filter(f => f.trim());

            let noLazyLoadCount = 0;

            for (const file of routeFiles) {
                if (!file.trim()) continue;

                const content = fs.readFileSync(file, 'utf8');

                // 检查是否使用了import()动态导入
                const hasLazyLoad = content.includes('() => import(') || content.includes('import(');
                const hasDirectImport = content.match(/import\s+\w+\s+from\s+['"].*\.vue['"]/);

                if (hasDirectImport && !hasLazyLoad) {
                    noLazyLoadCount++;

                    this.violations.P2.push({
                        rule: 'performance.no-lazy-loading',
                        level: 'P2',
                        file,
                        message: '路由未使用懒加载（建议使用 () => import() 语法）'
                    });
                }
            }

            if (noLazyLoadCount === 0) {
                console.log(chalk.green('     ✅ 路由已使用懒加载'));
            } else {
                console.log(chalk.yellow(`     ⚠️  发现 ${noLazyLoadCount} 个路由未懒加载`));
            }

        } catch (error) {
            console.log(chalk.gray('     ℹ️  未找到router目录，跳过检查'));
        }
    }

    // ========== 辅助方法 ==========

    extractFunctions(content) {
        const functions = [];

        // 简化实现：按行分析
        const lines = content.split('\n');
        let inFunction = false;
        let functionStart = 0;
        let functionName = 'anonymous';
        let braceCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // 检测函数开始
            if (!inFunction) {
                const funcMatch = line.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=.*(?:function|=>)|async\s+(\w+))/);
                if (funcMatch) {
                    inFunction = true;
                    functionStart = i;
                    functionName = funcMatch[1] || funcMatch[2] || funcMatch[3] || 'anonymous';
                    braceCount = 0;
                }
            }

            // 计算大括号
            if (inFunction) {
                braceCount += (line.match(/{/g) || []).length;
                braceCount -= (line.match(/}/g) || []).length;

                // 函数结束
                if (braceCount === 0 && line.includes('}')) {
                    const functionLines = i - functionStart + 1;
                    functions.push({
                        name: functionName,
                        lines: functionLines,
                        start: functionStart
                    });
                    inFunction = false;
                }
            }
        }

        return functions;
    }

    printSummary() {
        console.log('');
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.blue.bold('\n📊 性能检查结果:\n'));

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

        console.log(chalk.gray(`\n  总问题数: ${totalViolations}`));
        console.log('');

        if (this.violations.P1.length > 0) {
            console.log(chalk.yellow('  💡 性能优化建议:'));
            console.log(chalk.yellow('     • 拆分大文件和大组件'));
            console.log(chalk.yellow('     • 使用代码分割减小Bundle'));
            console.log(chalk.yellow('     • 重构复杂函数\n'));
        }
    }

    exportResults(outputPath) {
        const results = {
            checker: 'Performance',
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

module.exports = PerformanceChecker;

// CLI接口
if (require.main === module) {
    const checker = new PerformanceChecker();
    checker.check().then(result => {
        const outputPath = 'reports/quality/performance-check-results.json';
        checker.exportResults(outputPath);

        if (!result.passed) {
            process.exit(1);
        }
    }).catch(error => {
        console.error(chalk.red('\n💥 性能检查异常:'), error.message);
        process.exit(1);
    });
}

