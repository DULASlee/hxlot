/**
 * 企业级质量监控系统 v1.0
 * 基于2025年业界最佳实践设计
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class QualityMonitor {
    constructor(options = {}) {
        this.projectRoot = options.projectRoot || process.cwd();
        this.reportDir = path.join(this.projectRoot, 'reports', 'quality');
        this.config = {
            thresholds: {
                p0: 90,  // P0级门禁阈值
                p1: 80,  // P1级门禁阈值
                p2: 70   // P2级门禁阈值
            },
            checks: {
                frontend: true,
                backend: true,
                security: true,
                performance: true,
                architecture: true
            },
            ai: {
                enabled: true,
                provider: 'openai',
                model: 'gpt-4'
            }
        };

        this.ensureReportDir();
    }

    /**
     * 确保报告目录存在
     */
    ensureReportDir() {
        if (!fs.existsSync(this.reportDir)) {
            fs.mkdirSync(this.reportDir, { recursive: true });
        }
    }

    /**
     * 执行前端质量检查
     */
    async checkFrontend() {
        console.log('🎨 执行前端质量检查...');

        const frontendPath = path.join(this.projectRoot, 'src', 'SmartAbp.Vue');
        if (!fs.existsSync(frontendPath)) {
            console.log('⚠️ 未找到前端项目，跳过前端检查');
            return { passed: true, score: 100, issues: [] };
        }

        const issues = [];
        let score = 100;

        try {
            // TypeScript类型检查
            console.log('🔒 执行TypeScript类型检查...');
            try {
                execSync('npm run type-check', {
                    cwd: frontendPath,
                    stdio: 'pipe'
                });
                console.log('✅ TypeScript类型检查通过');
            } catch (error) {
                console.log('❌ TypeScript类型检查失败');
                issues.push({
                    type: 'typescript',
                    severity: 'error',
                    message: 'TypeScript类型检查失败',
                    details: error.message
                });
                score -= 30;
            }

            // ESLint代码风格检查
            console.log('🎨 执行ESLint代码风格检查...');
            try {
                execSync('npm run lint', {
                    cwd: frontendPath,
                    stdio: 'pipe'
                });
                console.log('✅ ESLint代码风格检查通过');
            } catch (error) {
                console.log('⚠️ ESLint代码风格检查发现问题');
                issues.push({
                    type: 'eslint',
                    severity: 'warning',
                    message: 'ESLint代码风格检查发现问题',
                    details: error.message
                });
                score -= 10;
            }

            // 架构合规检查
            console.log('🏗️ 执行架构合规检查...');

            // 检查相对路径违规
            try {
                const relativePathViolations = execSync(
                    "grep -r \"'../'\" packages/ 2>/dev/null | wc -l",
                    { cwd: frontendPath, encoding: 'utf8' }
                ).trim();

                if (parseInt(relativePathViolations) > 0) {
                    issues.push({
                        type: 'architecture',
                        severity: 'error',
                        message: `发现 ${relativePathViolations} 个相对路径违规`,
                        details: 'packages中不应使用相对路径引用'
                    });
                    score -= 20;
                } else {
                    console.log('✅ 相对路径检查通过');
                }
            } catch (error) {
                // 忽略grep错误
            }

            // 检查主应用引用违规
            try {
                const mainAppViolations = execSync(
                    "grep -r \"@/\" packages/ 2>/dev/null | wc -l",
                    { cwd: frontendPath, encoding: 'utf8' }
                ).trim();

                if (parseInt(mainAppViolations) > 0) {
                    issues.push({
                        type: 'architecture',
                        severity: 'error',
                        message: `发现 ${mainAppViolations} 个主应用引用违规`,
                        details: 'packages中不应引用主应用'
                    });
                    score -= 20;
                } else {
                    console.log('✅ 主应用引用检查通过');
                }
            } catch (error) {
                // 忽略grep错误
            }

            // 检查类型绕过
            try {
                const typeBypass = execSync(
                    "grep -r \"as any\\|@ts-ignore\" src/ packages/ 2>/dev/null | wc -l",
                    { cwd: frontendPath, encoding: 'utf8' }
                ).trim();

                if (parseInt(typeBypass) > 0) {
                    issues.push({
                        type: 'typescript',
                        severity: 'error',
                        message: `发现 ${typeBypass} 个类型绕过`,
                        details: '不应使用as any或@ts-ignore绕过类型检查'
                    });
                    score -= 15;
                } else {
                    console.log('✅ 类型安全检查通过');
                }
            } catch (error) {
                // 忽略grep错误
            }

        } catch (error) {
            console.error('前端检查过程中发生错误:', error.message);
            issues.push({
                type: 'system',
                severity: 'error',
                message: '前端检查过程中发生错误',
                details: error.message
            });
            score = 0;
        }

        return {
            passed: score >= this.config.thresholds.p0,
            score: Math.max(0, score),
            issues
        };
    }

    /**
     * 执行后端质量检查
     */
    async checkBackend() {
        console.log('🔨 执行后端质量检查...');

        const solutionPath = path.join(this.projectRoot, 'src', 'SmartAbp.sln');
        if (!fs.existsSync(solutionPath)) {
            console.log('⚠️ 未找到后端项目，跳过后端检查');
            return { passed: true, score: 100, issues: [] };
        }

        const issues = [];
        let score = 100;

        try {
            // 编译检查
            console.log('🔨 执行编译检查...');
            try {
                execSync('dotnet build src/SmartAbp.sln --verbosity minimal --no-incremental', {
                    cwd: this.projectRoot,
                    stdio: 'pipe'
                });
                console.log('✅ 编译检查通过');
            } catch (error) {
                console.log('❌ 编译检查失败');
                issues.push({
                    type: 'compilation',
                    severity: 'error',
                    message: '编译检查失败',
                    details: error.message
                });
                score -= 40;
            }

            // 代码风格检查
            console.log('🎨 执行代码风格检查...');
            try {
                execSync('dotnet format src/SmartAbp.sln --verify-no-changes --verbosity diagnostic', {
                    cwd: this.projectRoot,
                    stdio: 'pipe'
                });
                console.log('✅ 代码风格检查通过');
            } catch (error) {
                console.log('⚠️ 代码风格检查发现问题');
                issues.push({
                    type: 'style',
                    severity: 'warning',
                    message: '代码风格检查发现问题',
                    details: error.message
                });
                score -= 10;
            }

            // 运行测试
            console.log('🧪 执行测试...');
            try {
                execSync('dotnet test src/SmartAbp.sln --logger "console;verbosity=minimal"', {
                    cwd: this.projectRoot,
                    stdio: 'pipe'
                });
                console.log('✅ 测试执行通过');
            } catch (error) {
                console.log('⚠️ 测试执行发现问题');
                issues.push({
                    type: 'testing',
                    severity: 'warning',
                    message: '测试执行发现问题',
                    details: error.message
                });
                score -= 15;
            }

        } catch (error) {
            console.error('后端检查过程中发生错误:', error.message);
            issues.push({
                type: 'system',
                severity: 'error',
                message: '后端检查过程中发生错误',
                details: error.message
            });
            score = 0;
        }

        return {
            passed: score >= this.config.thresholds.p0,
            score: Math.max(0, score),
            issues
        };
    }

    /**
     * 执行安全扫描
     */
    async checkSecurity() {
        console.log('🔐 执行安全扫描...');

        const issues = [];
        let score = 100;

        try {
            // 检查敏感信息
            const sensitiveData = execSync(
                "grep -r -i \"password\\|secret\\|api[_-]key\\|token\" src/ 2>/dev/null | wc -l",
                { cwd: this.projectRoot, encoding: 'utf8' }
            ).trim();

            if (parseInt(sensitiveData) > 0) {
                issues.push({
                    type: 'security',
                    severity: 'warning',
                    message: `发现 ${sensitiveData} 个敏感信息`,
                    details: '代码中不应包含密码、密钥等敏感信息'
                });
                score -= 20;
            }

            // 检查SQL注入风险
            const sqlInjection = execSync(
                "grep -r -i \"select\\|insert\\|update\\|delete\" src/ | grep -v \"//\" | grep \"+\" | wc -l",
                { cwd: this.projectRoot, encoding: 'utf8' }
            ).trim();

            if (parseInt(sqlInjection) > 0) {
                issues.push({
                    type: 'security',
                    severity: 'warning',
                    message: `发现 ${sqlInjection} 个潜在SQL注入风险`,
                    details: '应使用参数化查询避免SQL注入'
                });
                score -= 15;
            }

            if (issues.length === 0) {
                console.log('✅ 安全扫描通过');
            } else {
                console.log(`⚠️ 安全扫描发现 ${issues.length} 个问题`);
            }

        } catch (error) {
            console.error('安全扫描过程中发生错误:', error.message);
            issues.push({
                type: 'system',
                severity: 'error',
                message: '安全扫描过程中发生错误',
                details: error.message
            });
            score = 0;
        }

        return {
            passed: score >= this.config.thresholds.p1,
            score: Math.max(0, score),
            issues
        };
    }

    /**
     * 执行性能检查
     */
    async checkPerformance() {
        console.log('⚡ 执行性能检查...');

        const issues = [];
        let score = 100;

        try {
            // 检查大文件
            const largeFiles = execSync(
                "find src/ -name \"*.cs\" -o -name \"*.ts\" -o -name \"*.vue\" | xargs wc -l | awk '$1 > 500 {count++} END {print count+0}'",
                { cwd: this.projectRoot, encoding: 'utf8' }
            ).trim();

            if (parseInt(largeFiles) > 0) {
                issues.push({
                    type: 'performance',
                    severity: 'warning',
                    message: `发现 ${largeFiles} 个大文件 (>500行)`,
                    details: '建议将大文件拆分为更小的模块'
                });
                score -= 10;
            }

            // 检查TODO标记
            const todoCount = execSync(
                "grep -r \"TODO\\|FIXME\\|XXX\" src/ 2>/dev/null | wc -l",
                { cwd: this.projectRoot, encoding: 'utf8' }
            ).trim();

            if (parseInt(todoCount) > 10) {
                issues.push({
                    type: 'performance',
                    severity: 'info',
                    message: `发现 ${todoCount} 个TODO标记`,
                    details: '建议及时处理TODO标记'
                });
                score -= 5;
            }

            if (issues.length === 0) {
                console.log('✅ 性能检查通过');
            } else {
                console.log(`⚠️ 性能检查发现 ${issues.length} 个问题`);
            }

        } catch (error) {
            console.error('性能检查过程中发生错误:', error.message);
            issues.push({
                type: 'system',
                severity: 'error',
                message: '性能检查过程中发生错误',
                details: error.message
            });
            score = 0;
        }

        return {
            passed: score >= this.config.thresholds.p2,
            score: Math.max(0, score),
            issues
        };
    }

    /**
     * 生成质量报告
     */
    async generateReport(results) {
        console.log('📊 生成质量报告...');

        const report = {
            timestamp: new Date().toISOString(),
            project: path.basename(this.projectRoot),
            qualityGate: {
                p0Passed: results.frontend.passed && results.backend.passed,
                p1Passed: results.security.passed,
                p2Passed: results.performance.passed,
                overallPassed: results.frontend.passed && results.backend.passed && results.security.passed
            },
            checks: {
                frontend: results.frontend,
                backend: results.backend,
                security: results.security,
                performance: results.performance
            },
            metrics: {
                totalFiles: this.getTotalFiles(),
                totalLines: this.getTotalLines(),
                todoCount: this.getTodoCount()
            }
        };

        const reportFile = path.join(
            this.reportDir,
            `quality-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
        );

        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
        console.log(`✅ 质量报告已生成: ${reportFile}`);

        return report;
    }

    /**
     * 获取总文件数
     */
    getTotalFiles() {
        try {
            return parseInt(execSync(
                "find src/ -type f \\( -name \"*.cs\" -o -name \"*.ts\" -o -name \"*.vue\" \\) | wc -l",
                { cwd: this.projectRoot, encoding: 'utf8' }
            ).trim());
        } catch (error) {
            return 0;
        }
    }

    /**
     * 获取总行数
     */
    getTotalLines() {
        try {
            return parseInt(execSync(
                "find src/ -type f \\( -name \"*.cs\" -o -name \"*.ts\" -o -name \"*.vue\" \\) | xargs wc -l | tail -1 | awk '{print $1}'",
                { cwd: this.projectRoot, encoding: 'utf8' }
            ).trim());
        } catch (error) {
            return 0;
        }
    }

    /**
     * 获取TODO数量
     */
    getTodoCount() {
        try {
            return parseInt(execSync(
                "grep -r \"TODO\\|FIXME\\|XXX\" src/ 2>/dev/null | wc -l",
                { cwd: this.projectRoot, encoding: 'utf8' }
            ).trim());
        } catch (error) {
            return 0;
        }
    }

    /**
     * 执行完整的质量监控
     */
    async run() {
        console.log('🚀 企业级质量监控开始');
        console.log('==================================');

        const results = {
            frontend: await this.checkFrontend(),
            backend: await this.checkBackend(),
            security: await this.checkSecurity(),
            performance: await this.checkPerformance()
        };

        const report = await this.generateReport(results);

        console.log('');
        console.log('==================================');
        console.log('📊 质量监控结果');
        console.log('==================================');
        console.log(`P0级门禁 (阻断性): ${report.qualityGate.p0Passed ? '✅ 通过' : '❌ 失败'}`);
        console.log(`P1级门禁 (警告性): ${report.qualityGate.p1Passed ? '✅ 通过' : '⚠️ 警告'}`);
        console.log(`P2级门禁 (建议性): ${report.qualityGate.p2Passed ? '✅ 通过' : '⚠️ 建议'}`);
        console.log('');
        console.log(`前端检查: ${results.frontend.passed ? '✅ 通过' : '❌ 失败'} (${results.frontend.score}分)`);
        console.log(`后端检查: ${results.backend.passed ? '✅ 通过' : '❌ 失败'} (${results.backend.score}分)`);
        console.log(`安全扫描: ${results.security.passed ? '✅ 通过' : '⚠️ 警告'} (${results.security.score}分)`);
        console.log(`性能检查: ${results.performance.passed ? '✅ 通过' : '⚠️ 建议'} (${results.performance.score}分)`);
        console.log('');

        if (report.qualityGate.overallPassed) {
            console.log('🎉 质量监控通过！');
            process.exit(0);
        } else {
            console.log('❌ 质量监控未通过！');
            console.log('💡 请根据上述检查结果修复问题后重新提交');
            process.exit(1);
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const monitor = new QualityMonitor();
    monitor.run().catch(console.error);
}

module.exports = QualityMonitor;
