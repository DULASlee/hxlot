#!/usr/bin/env node

/**
 * 后端代码质量检测器 v1.0
 * 基于2025年企业级最佳实践设计
 * 
 * 功能特性:
 * - C#代码质量检查
 * - ABP框架专项检查
 * - 数据库安全检查
 * - 性能分析
 * - 安全漏洞扫描
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class BackendQualityDetector {
    constructor(options = {}) {
        this.options = {
            projectRoot: options.projectRoot || process.cwd(),
            solutionPath: options.solutionPath || 'src/SmartAbp.sln',
            strictMode: options.strictMode || true,
            ...options
        };

        this.qualityMetrics = {
            overall: 0,
            categories: {
                compilation: { score: 0, weight: 0.30 },
                codeStyle: { score: 0, weight: 0.20 },
                architecture: { score: 0, weight: 0.25 },
                security: { score: 0, weight: 0.15 },
                performance: { score: 0, weight: 0.10 }
            },
            violations: [],
            suggestions: [],
            testResults: null
        };
    }

    /**
     * 执行完整质量检查流程
     */
    async runFullCheck() {
        console.log(chalk.blue.bold('🔍 启动后端代码质量检查...\n'));

        try {
            // 1. 编译检查
            await this.checkCompilation();

            // 2. 代码风格检查
            await this.checkCodeStyle();

            // 3. 架构合规检查
            await this.checkArchitecture();

            // 4. 安全扫描
            await this.checkSecurity();

            // 5. 性能分析
            await this.checkPerformance();

            // 6. 测试执行
            await this.runTests();

            // 7. 生成质量报告
            await this.generateReport();

            // 8. 质量门禁判断
            const passed = this.evaluateQualityGate();

            console.log(chalk.green.bold('\n✅ 后端质量检查完成!'));
            console.log(chalk.yellow(`📊 综合质量评分: ${this.qualityMetrics.overall}/100`));

            return {
                passed,
                metrics: this.qualityMetrics,
                report: this.generateReportContent()
            };

        } catch (error) {
            console.error(chalk.red.bold('❌ 后端质量检查失败:'), error.message);
            throw error;
        }
    }

    /**
     * 编译检查
     */
    async checkCompilation() {
        console.log(chalk.cyan('🔨 执行编译检查...'));

        try {
            // 执行dotnet build
            const buildResult = this.runCommand(`dotnet build "${this.options.solutionPath}" --verbosity minimal --no-incremental`);

            // 检查编译输出中的错误和警告
            const output = buildResult.toString();
            const errorCount = (output.match(/error CS/g) || []).length;
            const warningCount = (output.match(/warning CS/g) || []).length;

            // 计算编译评分
            let score = 100;
            score -= errorCount * 20; // 每个错误扣20分
            score -= warningCount * 2; // 每个警告扣2分

            this.qualityMetrics.categories.compilation.score = Math.max(0, score);

            if (errorCount > 0) {
                this.qualityMetrics.violations.push({
                    category: 'compilation',
                    severity: 'critical',
                    message: `编译失败: ${errorCount} 个错误, ${warningCount} 个警告`,
                    details: this.extractCompilationErrors(output)
                });
            }

            console.log(chalk.green(`✅ 编译检查完成 (${this.qualityMetrics.categories.compilation.score}/100)`));

        } catch (error) {
            this.qualityMetrics.categories.compilation.score = 0;
            this.qualityMetrics.violations.push({
                category: 'compilation',
                severity: 'critical',
                message: '编译失败',
                details: error.message
            });
            console.log(chalk.red('❌ 编译检查失败'));
        }
    }

    /**
     * 代码风格检查
     */
    async checkCodeStyle() {
        console.log(chalk.cyan('🎨 执行代码风格检查...'));

        try {
            // 使用dotnet format检查代码风格
            const formatResult = this.runCommand(`dotnet format "${this.options.solutionPath}" --verify-no-changes --verbosity diagnostic`);

            // 分析格式检查结果
            const output = formatResult.toString();
            const issues = this.parseFormatIssues(output);

            // 计算风格评分
            let score = 100;
            score -= issues.length * 5;

            this.qualityMetrics.categories.codeStyle.score = Math.max(0, score);

            if (issues.length > 0) {
                this.qualityMetrics.violations.push({
                    category: 'codeStyle',
                    severity: 'medium',
                    message: `发现 ${issues.length} 个代码风格问题`,
                    details: issues
                });
            }

            console.log(chalk.green(`✅ 代码风格检查完成 (${this.qualityMetrics.categories.codeStyle.score}/100)`));

        } catch (error) {
            // dotnet format在发现问题时会返回非零退出码
            if (error.status !== 0) {
                this.qualityMetrics.categories.codeStyle.score = 70;
                console.log(chalk.yellow('⚠️ 发现代码风格问题'));
            } else {
                this.qualityMetrics.categories.codeStyle.score = 100;
                console.log(chalk.green('✅ 代码风格检查完成 (100/100)'));
            }
        }
    }

    /**
     * 架构合规检查
     */
    async checkArchitecture() {
        console.log(chalk.cyan('🏗️ 执行架构合规检查...'));

        let score = 100;
        const violations = [];

        // 检查ABP框架规范
        const abpViolations = this.checkABPCompliance();
        if (abpViolations.length > 0) {
            score -= abpViolations.length * 10;
            violations.push({
                type: 'abpCompliance',
                count: abpViolations.length,
                message: 'ABP框架规范违规'
            });
        }

        // 检查依赖注入规范
        const diViolations = this.checkDependencyInjection();
        if (diViolations.length > 0) {
            score -= diViolations.length * 8;
            violations.push({
                type: 'dependencyInjection',
                count: diViolations.length,
                message: '依赖注入规范违规'
            });
        }

        // 检查异常处理规范
        const exceptionViolations = this.checkExceptionHandling();
        if (exceptionViolations.length > 0) {
            score -= exceptionViolations.length * 5;
            violations.push({
                type: 'exceptionHandling',
                count: exceptionViolations.length,
                message: '异常处理规范违规'
            });
        }

        // 检查日志记录规范
        const loggingViolations = this.checkLogging();
        if (loggingViolations.length > 0) {
            score -= loggingViolations.length * 3;
            violations.push({
                type: 'logging',
                count: loggingViolations.length,
                message: '日志记录规范违规'
            });
        }

        this.qualityMetrics.categories.architecture.score = Math.max(0, score);

        if (violations.length > 0) {
            this.qualityMetrics.violations.push({
                category: 'architecture',
                severity: 'high',
                message: '架构合规性检查失败',
                details: violations
            });
        }

        console.log(chalk.green(`✅ 架构合规检查完成 (${this.qualityMetrics.categories.architecture.score}/100)`));
    }

    /**
     * 安全扫描
     */
    async checkSecurity() {
        console.log(chalk.cyan('🔐 执行安全扫描...'));

        let score = 100;
        const vulnerabilities = [];

        // 检查SQL注入风险
        const sqlInjectionRisks = this.findSQLInjectionRisks();
        if (sqlInjectionRisks.length > 0) {
            score -= sqlInjectionRisks.length * 20;
            vulnerabilities.push({
                type: 'sqlInjection',
                count: sqlInjectionRisks.length,
                message: '发现SQL注入风险'
            });
        }

        // 检查敏感信息泄露
        const sensitiveData = this.findSensitiveData();
        if (sensitiveData.length > 0) {
            score -= sensitiveData.length * 15;
            vulnerabilities.push({
                type: 'sensitiveData',
                count: sensitiveData.length,
                message: '发现敏感信息泄露风险'
            });
        }

        // 检查认证授权问题
        const authIssues = this.checkAuthenticationAuthorization();
        if (authIssues.length > 0) {
            score -= authIssues.length * 10;
            vulnerabilities.push({
                type: 'authentication',
                count: authIssues.length,
                message: '发现认证授权问题'
            });
        }

        // 检查输入验证
        const inputValidationIssues = this.checkInputValidation();
        if (inputValidationIssues.length > 0) {
            score -= inputValidationIssues.length * 8;
            vulnerabilities.push({
                type: 'inputValidation',
                count: inputValidationIssues.length,
                message: '发现输入验证问题'
            });
        }

        this.qualityMetrics.categories.security.score = Math.max(0, score);

        if (vulnerabilities.length > 0) {
            this.qualityMetrics.violations.push({
                category: 'security',
                severity: 'high',
                message: '安全扫描发现问题',
                details: vulnerabilities
            });
        }

        console.log(chalk.green(`✅ 安全扫描完成 (${this.qualityMetrics.categories.security.score}/100)`));
    }

    /**
     * 性能分析
     */
    async checkPerformance() {
        console.log(chalk.cyan('⚡ 执行性能分析...'));

        let score = 100;
        const issues = [];

        // 检查大文件
        const largeFiles = this.findLargeFiles();
        if (largeFiles.length > 0) {
            score -= largeFiles.length * 3;
            issues.push({
                type: 'largeFile',
                count: largeFiles.length,
                message: '发现大文件 (>300行)'
            });
        }

        // 检查复杂方法
        const complexMethods = this.findComplexMethods();
        if (complexMethods.length > 0) {
            score -= complexMethods.length * 5;
            issues.push({
                type: 'complexMethod',
                count: complexMethods.length,
                message: '发现复杂方法 (圈复杂度>10)'
            });
        }

        // 检查性能反模式
        const performanceAntipatterns = this.findPerformanceAntipatterns();
        if (performanceAntipatterns.length > 0) {
            score -= performanceAntipatterns.length * 8;
            issues.push({
                type: 'performanceAntipattern',
                count: performanceAntipatterns.length,
                message: '发现性能反模式'
            });
        }

        this.qualityMetrics.categories.performance.score = Math.max(0, score);

        if (issues.length > 0) {
            this.qualityMetrics.violations.push({
                category: 'performance',
                severity: 'medium',
                message: '性能优化建议',
                details: issues
            });
        }

        console.log(chalk.green(`✅ 性能分析完成 (${this.qualityMetrics.categories.performance.score}/100)`));
    }

    /**
     * 运行测试
     */
    async runTests() {
        console.log(chalk.cyan('🧪 执行测试...'));

        try {
            // 运行单元测试
            const testResult = this.runCommand(`dotnet test "${this.options.solutionPath}" --logger "console;verbosity=minimal" --collect:"XPlat Code Coverage"`);

            // 解析测试结果
            const output = testResult.toString();
            const testResults = this.parseTestResults(output);

            this.qualityMetrics.testResults = testResults;

            console.log(chalk.green(`✅ 测试执行完成 (通过: ${testResults.passed}, 失败: ${testResults.failed})`));

        } catch (error) {
            console.log(chalk.yellow('⚠️ 测试执行部分失败'));
            this.qualityMetrics.testResults = { passed: 0, failed: 1, total: 1 };
        }
    }

    /**
     * 生成质量报告
     */
    async generateReport() {
        // 计算综合评分
        this.qualityMetrics.overall = Object.values(this.qualityMetrics.categories)
            .reduce((total, category) => total + (category.score * category.weight), 0);

        // 生成改进建议
        this.generateSuggestions();
    }

    /**
     * 质量门禁评估
     */
    evaluateQualityGate() {
        const { overall, categories } = this.qualityMetrics;

        // P0级门禁检查
        const p0Passed = categories.compilation.score >= 90 &&
            categories.architecture.score >= 85;

        // P1级门禁检查
        const p1Passed = overall >= 80;

        return p0Passed && p1Passed;
    }

    /**
     * 工具方法
     */
    runCommand(command) {
        try {
            return execSync(command, {
                cwd: this.options.projectRoot,
                encoding: 'utf8',
                stdio: 'pipe'
            });
        } catch (error) {
            throw new Error(`命令执行失败: ${command}\n${error.message}`);
        }
    }

    extractCompilationErrors(output) {
        const errors = [];
        const lines = output.split('\n');

        lines.forEach(line => {
            if (line.includes('error CS')) {
                errors.push(line.trim());
            }
        });

        return errors;
    }

    parseFormatIssues(output) {
        const issues = [];
        const lines = output.split('\n');

        lines.forEach(line => {
            if (line.includes('would be reformatted')) {
                issues.push(line.trim());
            }
        });

        return issues;
    }

    parseTestResults(output) {
        const passedMatch = output.match(/(\d+) passed/);
        const failedMatch = output.match(/(\d+) failed/);
        const totalMatch = output.match(/(\d+) total/);

        return {
            passed: passedMatch ? parseInt(passedMatch[1]) : 0,
            failed: failedMatch ? parseInt(failedMatch[1]) : 0,
            total: totalMatch ? parseInt(totalMatch[1]) : 0
        };
    }

    // 架构检查方法
    checkABPCompliance() {
        const violations = [];
        const csFiles = this.getAllFiles('src', ['.cs']);

        csFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');

            // 检查AppService继承
            if (content.includes('public class') && content.includes('AppService')) {
                if (!content.includes(': ApplicationService')) {
                    violations.push({
                        file: path.relative(this.options.projectRoot, file),
                        issue: 'AppService未继承ApplicationService'
                    });
                }
            }

            // 检查Controller继承
            if (content.includes('public class') && content.includes('Controller')) {
                if (!content.includes(': AbpController')) {
                    violations.push({
                        file: path.relative(this.options.projectRoot, file),
                        issue: 'Controller未继承AbpController'
                    });
                }
            }
        });

        return violations;
    }

    checkDependencyInjection() {
        const violations = [];
        const csFiles = this.getAllFiles('src', ['.cs']);

        csFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');

            // 检查构造函数注入
            if (content.includes('public class') && content.includes('Service')) {
                const constructorMatch = content.match(/public\s+\w+\([^)]*\)/);
                if (constructorMatch && !constructorMatch[0].includes('IRepository') &&
                    !constructorMatch[0].includes('IUnitOfWorkManager')) {
                    // 检查是否有依赖注入
                    if (!content.includes('private readonly')) {
                        violations.push({
                            file: path.relative(this.options.projectRoot, file),
                            issue: '缺少依赖注入'
                        });
                    }
                }
            }
        });

        return violations;
    }

    checkExceptionHandling() {
        const violations = [];
        const csFiles = this.getAllFiles('src', ['.cs']);

        csFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');

            // 检查异步方法是否有异常处理
            const asyncMethods = content.match(/public\s+async\s+Task[^}]+}/g);
            if (asyncMethods) {
                asyncMethods.forEach(method => {
                    if (!method.includes('try') && !method.includes('catch')) {
                        violations.push({
                            file: path.relative(this.options.projectRoot, file),
                            issue: '异步方法缺少异常处理'
                        });
                    }
                });
            }
        });

        return violations;
    }

    checkLogging() {
        const violations = [];
        const csFiles = this.getAllFiles('src', ['.cs']);

        csFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');

            // 检查是否有日志记录
            if (content.includes('public class') && content.includes('Service')) {
                if (!content.includes('ILogger') && !content.includes('Logger')) {
                    violations.push({
                        file: path.relative(this.options.projectRoot, file),
                        issue: '缺少日志记录'
                    });
                }
            }
        });

        return violations;
    }

    // 安全检查方法
    findSQLInjectionRisks() {
        const risks = [];
        const csFiles = this.getAllFiles('src', ['.cs']);

        csFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');

            // 检查字符串拼接SQL
            if (content.includes('SELECT') || content.includes('INSERT') ||
                content.includes('UPDATE') || content.includes('DELETE')) {
                if (content.includes('+') && content.includes('"')) {
                    risks.push({
                        file: path.relative(this.options.projectRoot, file),
                        issue: '可能存在SQL注入风险'
                    });
                }
            }
        });

        return risks;
    }

    findSensitiveData() {
        const sensitiveData = [];
        const csFiles = this.getAllFiles('src', ['.cs']);

        const patterns = [
            'password',
            'secret',
            'api[_-]?key',
            'token',
            'private[_-]?key'
        ];

        csFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');

            patterns.forEach(pattern => {
                const regex = new RegExp(pattern, 'gi');
                if (regex.test(content)) {
                    sensitiveData.push({
                        file: path.relative(this.options.projectRoot, file),
                        issue: `发现敏感信息: ${pattern}`
                    });
                }
            });
        });

        return sensitiveData;
    }

    checkAuthenticationAuthorization() {
        const issues = [];
        const csFiles = this.getAllFiles('src', ['.cs']);

        csFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');

            // 检查Controller方法是否有授权
            if (content.includes('[HttpPost]') || content.includes('[HttpPut]') ||
                content.includes('[HttpDelete]')) {
                if (!content.includes('[Authorize]') && !content.includes('[AllowAnonymous]')) {
                    issues.push({
                        file: path.relative(this.options.projectRoot, file),
                        issue: 'API方法缺少授权检查'
                    });
                }
            }
        });

        return issues;
    }

    checkInputValidation() {
        const issues = [];
        const csFiles = this.getAllFiles('src', ['.cs']);

        csFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');

            // 检查DTO是否有验证特性
            if (content.includes('public class') && content.includes('Dto')) {
                if (!content.includes('[Required]') && !content.includes('[StringLength]') &&
                    !content.includes('[Range]')) {
                    issues.push({
                        file: path.relative(this.options.projectRoot, file),
                        issue: 'DTO缺少输入验证'
                    });
                }
            }
        });

        return issues;
    }

    // 性能检查方法
    findLargeFiles() {
        const largeFiles = [];
        const csFiles = this.getAllFiles('src', ['.cs']);

        csFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            const lines = content.split('\n').length;

            if (lines > 300) {
                largeFiles.push({
                    file: path.relative(this.options.projectRoot, file),
                    lines: lines
                });
            }
        });

        return largeFiles;
    }

    findComplexMethods() {
        const complexMethods = [];
        const csFiles = this.getAllFiles('src', ['.cs']);

        csFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');

            // 简单的圈复杂度检查
            const methods = content.match(/public\s+[^{]+{[^}]*}/g);
            if (methods) {
                methods.forEach(method => {
                    const complexity = this.calculateCyclomaticComplexity(method);
                    if (complexity > 10) {
                        complexMethods.push({
                            file: path.relative(this.options.projectRoot, file),
                            complexity: complexity
                        });
                    }
                });
            }
        });

        return complexMethods;
    }

    findPerformanceAntipatterns() {
        const antipatterns = [];
        const csFiles = this.getAllFiles('src', ['.cs']);

        csFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');

            // 检查N+1查询问题
            if (content.includes('foreach') && content.includes('await') &&
                content.includes('GetAsync')) {
                antipatterns.push({
                    file: path.relative(this.options.projectRoot, file),
                    issue: '可能存在N+1查询问题'
                });
            }

            // 检查同步等待异步方法
            if (content.includes('.Result') || content.includes('.Wait()')) {
                antipatterns.push({
                    file: path.relative(this.options.projectRoot, file),
                    issue: '同步等待异步方法'
                });
            }
        });

        return antipatterns;
    }

    calculateCyclomaticComplexity(method) {
        let complexity = 1; // 基础复杂度

        // 计算控制流语句
        const patterns = [
            /if\s*\(/g,
            /else\s+if\s*\(/g,
            /while\s*\(/g,
            /for\s*\(/g,
            /foreach\s*\(/g,
            /switch\s*\(/g,
            /case\s+/g,
            /catch\s*\(/g,
            /\?\s*.*\s*:/g, // 三元运算符
            /&&/g,
            /\|\|/g
        ];

        patterns.forEach(pattern => {
            const matches = method.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        });

        return complexity;
    }

    getAllFiles(dir, extensions) {
        let results = [];
        const searchPath = path.join(this.options.projectRoot, dir);

        if (!fs.existsSync(searchPath)) return results;

        const list = fs.readdirSync(searchPath);

        list.forEach(file => {
            const filePath = path.join(searchPath, file);
            const stat = fs.statSync(filePath);

            if (stat && stat.isDirectory()) {
                results = results.concat(this.getAllFiles(path.join(dir, file), extensions));
            } else if (extensions.some(ext => file.endsWith(ext))) {
                results.push(filePath);
            }
        });

        return results;
    }

    generateReportContent() {
        return {
            timestamp: new Date().toISOString(),
            project: path.basename(this.options.projectRoot),
            overallScore: this.qualityMetrics.overall,
            categories: this.qualityMetrics.categories,
            violations: this.qualityMetrics.violations,
            suggestions: this.qualityMetrics.suggestions,
            testResults: this.qualityMetrics.testResults
        };
    }

    generateSuggestions() {
        const suggestions = [];

        // 基于违规生成建议
        this.qualityMetrics.violations.forEach(violation => {
            switch (violation.category) {
                case 'compilation':
                    suggestions.push('建议修复所有编译错误，确保代码可以正常构建');
                    break;
                case 'architecture':
                    suggestions.push('建议遵循ABP框架规范，正确使用依赖注入和异常处理');
                    break;
                case 'codeStyle':
                    suggestions.push('建议运行 dotnet format 自动修复代码风格问题');
                    break;
                case 'security':
                    suggestions.push('建议修复安全漏洞，加强输入验证和授权检查');
                    break;
                case 'performance':
                    suggestions.push('建议重构大文件和复杂方法，优化性能');
                    break;
            }
        });

        this.qualityMetrics.suggestions = suggestions;
    }
}

// CLI接口
if (require.main === module) {
    const detector = new BackendQualityDetector({
        strictMode: process.argv.includes('--strict'),
        solutionPath: process.argv.find(arg => arg.startsWith('--solution='))?.split('=')[1] || 'src/SmartAbp.sln'
    });

    detector.runFullCheck()
        .then(result => {
            if (result.passed) {
                console.log(chalk.green.bold('\n🎉 后端质量门禁通过!'));
                process.exit(0);
            } else {
                console.log(chalk.red.bold('\n❌ 后端质量门禁未通过!'));
                process.exit(1);
            }
        })
        .catch(error => {
            console.error(chalk.red.bold('\n💥 后端质量检查失败:'), error.message);
            process.exit(1);
        });
}

module.exports = BackendQualityDetector;
