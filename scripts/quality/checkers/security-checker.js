#!/usr/bin/env node

/**
 * SmartAbp Quality Guardian - 安全质量检查器
 * 检查常见安全漏洞和安全隐患
 * 
 * 检查项：
 * 1. XSS漏洞检测（P1）
 * 2. SQL注入检测（P1）
 * 3. 敏感信息泄漏检测（P1）
 * 4. CSRF防护检查（P2）
 * 5. 依赖安全检查（P2）
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

class SecurityChecker {
    constructor(config = {}) {
        this.config = config;
        this.projectRoot = this.findProjectRoot();
        this.violations = {
            P0: [],
            P1: [],
            P2: []
        };

        // 代码路径
        this.frontendPaths = [
            'src/SmartAbp.Vue/src',
            'src/SmartAbp.Vue/packages'
        ];

        this.backendPaths = [
            'src/SmartAbp.Application',
            'src/SmartAbp.HttpApi'
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
        console.log(chalk.blue.bold('\n🛡️  安全质量检查\n'));
        console.log(chalk.gray('='.repeat(60)));
        console.log('');

        // 检查1: XSS漏洞检测
        await this.checkXSSVulnerabilities();

        // 检查2: SQL注入检测
        await this.checkSQLInjection();

        // 检查3: 敏感信息泄漏检测
        await this.checkSensitiveDataLeaks();

        // 检查4: CSRF防护检查
        await this.checkCSRFProtection();

        // 检查5: 不安全的代码模式
        await this.checkUnsafePatterns();

        // 汇总结果
        this.printSummary();

        return {
            passed: this.violations.P0.length === 0,
            violations: this.violations
        };
    }

    /**
     * 检查1: XSS漏洞检测
     * 检测可能导致XSS的代码模式
     */
    async checkXSSVulnerabilities() {
        console.log(chalk.blue('  📋 检查1: XSS漏洞检测'));

        try {
            let xssIssueCount = 0;

            for (const frontendPath of this.frontendPaths) {
                const fullPath = path.join(this.projectRoot, frontendPath);
                if (!fs.existsSync(fullPath)) continue;

                // 检查innerHTML使用
                const innerHTMLResult = execSync(
                    `grep -rn "innerHTML\\s*=" --include="*.ts" --include="*.vue" "${fullPath}" | grep -v "node_modules" | grep -v "/dist/" || true`,
                    { encoding: 'utf8' }
                );

                const innerHTMLLines = innerHTMLResult.split('\n').filter(l => l.trim());
                if (innerHTMLLines.length > 0) {
                    xssIssueCount++;
                    this.violations.P1.push({
                        rule: 'security.xss-innerhtml',
                        level: 'P1',
                        message: `发现 ${innerHTMLLines.length} 处使用innerHTML（可能导致XSS，建议使用textContent）`,
                        count: innerHTMLLines.length,
                        samples: innerHTMLLines.slice(0, 3)
                    });
                }

                // 检查v-html使用
                const vHtmlResult = execSync(
                    `grep -rn "v-html" --include="*.vue" "${fullPath}" | grep -v "node_modules" | grep -v "/dist/" || true`,
                    { encoding: 'utf8' }
                );

                const vHtmlLines = vHtmlResult.split('\n').filter(l => l.trim());
                if (vHtmlLines.length > 0) {
                    xssIssueCount++;
                    this.violations.P1.push({
                        rule: 'security.xss-v-html',
                        level: 'P1',
                        message: `发现 ${vHtmlLines.length} 处使用v-html（可能导致XSS，确保数据已消毒）`,
                        count: vHtmlLines.length,
                        samples: vHtmlLines.slice(0, 3)
                    });
                }

                // 检查dangerouslySetInnerHTML（React模式）
                const dangerousResult = execSync(
                    `grep -rn "dangerouslySetInnerHTML" --include="*.tsx" --include="*.jsx" "${fullPath}" | grep -v "node_modules" || true`,
                    { encoding: 'utf8' }
                );

                const dangerousLines = dangerousResult.split('\n').filter(l => l.trim());
                if (dangerousLines.length > 0) {
                    xssIssueCount++;
                    this.violations.P1.push({
                        rule: 'security.xss-dangerous-html',
                        level: 'P1',
                        message: `发现 ${dangerousLines.length} 处使用dangerouslySetInnerHTML`,
                        count: dangerousLines.length
                    });
                }
            }

            if (xssIssueCount === 0) {
                console.log(chalk.green('     ✅ 无XSS风险代码'));
            } else {
                console.log(chalk.yellow(`     ⚠️  发现 ${xssIssueCount} 类XSS风险`));
            }

        } catch (error) {
            console.log(chalk.yellow(`     ⚠️  检查过程出错: ${error.message}`));
        }
    }

    /**
     * 检查2: SQL注入检测
     * 检测可能导致SQL注入的代码模式
     */
    async checkSQLInjection() {
        console.log(chalk.blue('  📋 检查2: SQL注入检测'));

        try {
            let sqlInjectionCount = 0;

            for (const backendPath of this.backendPaths) {
                const fullPath = path.join(this.projectRoot, backendPath);
                if (!fs.existsSync(fullPath)) continue;

                // 检查字符串拼接SQL
                const sqlConcatResult = execSync(
                    `grep -rn "\\$\\".*SELECT\\|SELECT.*\\+.*\\$\\"" --include="*.cs" "${fullPath}" | grep -v "node_modules" || true`,
                    { encoding: 'utf8' }
                );

                const sqlConcatLines = sqlConcatResult.split('\n').filter(l => l.trim());
                if (sqlConcatLines.length > 0) {
                    sqlInjectionCount++;
                    this.violations.P1.push({
                        rule: 'security.sql-injection',
                        level: 'P1',
                        message: `发现 ${sqlConcatLines.length} 处SQL字符串拼接（可能导致注入，使用参数化查询）`,
                        count: sqlConcatLines.length,
                        samples: sqlConcatLines.slice(0, 3)
                    });
                }

                // 检查FromSqlRaw使用
                const rawSqlResult = execSync(
                    `grep -rn "FromSqlRaw\\|ExecuteSqlRaw" --include="*.cs" "${fullPath}" | grep -v "node_modules" || true`,
                    { encoding: 'utf8' }
                );

                const rawSqlLines = rawSqlResult.split('\n').filter(l => l.trim());
                if (rawSqlLines.length > 0) {
                    this.violations.P2.push({
                        rule: 'security.raw-sql',
                        level: 'P2',
                        message: `发现 ${rawSqlLines.length} 处使用原始SQL（确保使用参数化）`,
                        count: rawSqlLines.length
                    });
                }
            }

            if (sqlInjectionCount === 0) {
                console.log(chalk.green('     ✅ 无SQL注入风险'));
            } else {
                console.log(chalk.yellow(`     ⚠️  发现 ${sqlInjectionCount} 个SQL注入风险`));
            }

        } catch (error) {
            console.log(chalk.yellow(`     ⚠️  检查过程出错: ${error.message}`));
        }
    }

    /**
     * 检查3: 敏感信息泄漏检测
     * 检测硬编码的密钥、密码等
     */
    async checkSensitiveDataLeaks() {
        console.log(chalk.blue('  📋 检查3: 敏感信息泄漏检测'));

        try {
            let sensitiveDataCount = 0;

            // 检查所有代码文件
            const allPaths = [...this.frontendPaths, ...this.backendPaths];

            for (const codePath of allPaths) {
                const fullPath = path.join(this.projectRoot, codePath);
                if (!fs.existsSync(fullPath)) continue;

                // 检查硬编码密码
                const passwordResult = execSync(
                    `grep -rni "password.*=.*['\\\"]\\|apikey.*=.*['\\\"]\\|secret.*=.*['\\\"]" --include="*.ts" --include="*.cs" --include="*.vue" "${fullPath}" | grep -v "node_modules" | grep -v "/dist/" | grep -v "password.*=.*process.env" | grep -v "Password.*Type" | grep -v "// password" || true`,
                    { encoding: 'utf8' }
                );

                const passwordLines = passwordResult.split('\n').filter(l => l.trim() && !l.includes('PasswordType') && !l.includes('PasswordHash'));
                if (passwordLines.length > 0) {
                    sensitiveDataCount++;
                    this.violations.P1.push({
                        rule: 'security.hardcoded-credentials',
                        level: 'P1',
                        message: `发现 ${passwordLines.length} 处可能的硬编码密钥（应使用环境变量）`,
                        count: passwordLines.length,
                        samples: passwordLines.slice(0, 3).map(l => l.substring(0, 100))
                    });
                }

                // 检查JWT密钥
                const jwtResult = execSync(
                    `grep -rni "jwt.*secret\\|signing.*key" --include="*.ts" --include="*.cs" "${fullPath}" | grep -v "node_modules" | grep -v "/dist/" | grep -v "from.*environment" || true`,
                    { encoding: 'utf8' }
                );

                const jwtLines = jwtResult.split('\n').filter(l => l.trim());
                if (jwtLines.length > 0) {
                    this.violations.P2.push({
                        rule: 'security.jwt-key-usage',
                        level: 'P2',
                        message: `发现 ${jwtLines.length} 处JWT密钥使用（确保从环境变量读取）`,
                        count: jwtLines.length
                    });
                }
            }

            if (sensitiveDataCount === 0) {
                console.log(chalk.green('     ✅ 无敏感信息泄漏'));
            } else {
                console.log(chalk.yellow(`     ⚠️  发现 ${sensitiveDataCount} 处敏感信息风险`));
            }

        } catch (error) {
            console.log(chalk.yellow(`     ⚠️  检查过程出错: ${error.message}`));
        }
    }

    /**
     * 检查4: CSRF防护检查
     * 检查CSRF防护配置
     */
    async checkCSRFProtection() {
        console.log(chalk.blue('  📋 检查4: CSRF防护检查'));

        try {
            // 检查后端CSRF配置
            const startupPath = path.join(this.projectRoot, 'src/SmartAbp.Web/Startup.cs');

            if (fs.existsSync(startupPath)) {
                const content = fs.readFileSync(startupPath, 'utf8');

                const hasAntiforgery = content.includes('AddAntiforgery') || content.includes('ValidateAntiForgeryToken');

                if (!hasAntiforgery) {
                    this.violations.P2.push({
                        rule: 'security.no-csrf-protection',
                        level: 'P2',
                        message: 'Startup.cs未配置CSRF防护（建议添加Antiforgery）'
                    });
                    console.log(chalk.yellow('     ⚠️  未检测到CSRF防护配置'));
                } else {
                    console.log(chalk.green('     ✅ CSRF防护已配置'));
                }
            } else {
                console.log(chalk.gray('     ℹ️  未找到Startup.cs，跳过检查'));
            }

        } catch (error) {
            console.log(chalk.yellow(`     ⚠️  检查过程出错: ${error.message}`));
        }
    }

    /**
     * 检查5: 不安全的代码模式
     */
    async checkUnsafePatterns() {
        console.log(chalk.blue('  📋 检查5: 不安全的代码模式'));

        try {
            let unsafePatternCount = 0;

            // 检查eval使用
            for (const frontendPath of this.frontendPaths) {
                const fullPath = path.join(this.projectRoot, frontendPath);
                if (!fs.existsSync(fullPath)) continue;

                const evalResult = execSync(
                    `grep -rn "\\beval\\s*(" --include="*.ts" --include="*.js" "${fullPath}" | grep -v "node_modules" | grep -v "/dist/" || true`,
                    { encoding: 'utf8' }
                );

                const evalLines = evalResult.split('\n').filter(l => l.trim());
                if (evalLines.length > 0) {
                    unsafePatternCount++;
                    this.violations.P1.push({
                        rule: 'security.unsafe-eval',
                        level: 'P1',
                        message: `发现 ${evalLines.length} 处使用eval（严重安全风险）`,
                        count: evalLines.length,
                        samples: evalLines.slice(0, 3)
                    });
                }

                // 检查Function构造器
                const functionResult = execSync(
                    `grep -rn "new Function\\s*(" --include="*.ts" --include="*.js" "${fullPath}" | grep -v "node_modules" | grep -v "/dist/" || true`,
                    { encoding: 'utf8' }
                );

                const functionLines = functionResult.split('\n').filter(l => l.trim());
                if (functionLines.length > 0) {
                    unsafePatternCount++;
                    this.violations.P1.push({
                        rule: 'security.unsafe-function-constructor',
                        level: 'P1',
                        message: `发现 ${functionLines.length} 处使用Function构造器（安全风险）`,
                        count: functionLines.length
                    });
                }
            }

            if (unsafePatternCount === 0) {
                console.log(chalk.green('     ✅ 无不安全代码模式'));
            } else {
                console.log(chalk.yellow(`     ⚠️  发现 ${unsafePatternCount} 个不安全模式`));
            }

        } catch (error) {
            console.log(chalk.yellow(`     ⚠️  检查过程出错: ${error.message}`));
        }
    }

    printSummary() {
        console.log('');
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.blue.bold('\n📊 安全检查结果:\n'));

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
            console.log(chalk.yellow('  🔒 安全加固建议:'));
            console.log(chalk.yellow('     • 避免使用innerHTML和v-html'));
            console.log(chalk.yellow('     • 使用参数化SQL查询'));
            console.log(chalk.yellow('     • 敏感信息使用环境变量'));
            console.log(chalk.yellow('     • 禁用eval和Function构造器\n'));
        }
    }

    exportResults(outputPath) {
        const results = {
            checker: 'Security',
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

module.exports = SecurityChecker;

// CLI接口
if (require.main === module) {
    const checker = new SecurityChecker();
    checker.check().then(result => {
        const outputPath = 'reports/quality/security-check-results.json';
        checker.exportResults(outputPath);

        if (!result.passed) {
            process.exit(1);
        }
    }).catch(error => {
        console.error(chalk.red('\n💥 安全检查异常:'), error.message);
        process.exit(1);
    });
}

