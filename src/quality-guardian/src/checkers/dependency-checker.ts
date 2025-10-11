/**
 * 依赖关系检查器
 */

import { BaseChecker } from './base-checker.js';

export class DependencyChecker extends BaseChecker {
    public readonly name = '依赖关系检查器';
    public readonly description = '检查npm包依赖和版本安全';
    public readonly version = '2.0.0';

    protected async doCheck(): Promise<void> {
        this.logProgress('执行依赖关系检查...', 'info');

        await this.checkOutdatedPackages();
        await this.checkVulnerabilities();
    }

    private async checkOutdatedPackages(): Promise<void> {
        try {
            const { stdout } = await this.execCommand('npm', ['outdated', '--json']);
            if (stdout) {
                const outdated = JSON.parse(stdout);
                const count = Object.keys(outdated).length;

                if (count > 0) {
                    this.logProgress(`发现 ${count} 个过时的依赖包`, 'warning');
                }
            }
        } catch (error) {
            // npm outdated 返回非0退出码是正常的
        }
    }

    private async checkVulnerabilities(): Promise<void> {
        try {
            const { stdout, exitCode } = await this.execCommand('npm', ['audit', '--json']);

            if (exitCode !== 0 && stdout) {
                const audit = JSON.parse(stdout);
                const vulnerabilities = audit.metadata?.vulnerabilities || {};

                Object.entries(vulnerabilities).forEach(([severity, count]) => {
                    const numCount = typeof count === 'number' ? count : 0;
                    if (numCount > 0) {
                        this.addViolation({
                            rule: 'dependency.vulnerability',
                            level: severity === 'critical' || severity === 'high' ? 'P0' : 'P1',
                            message: `发现 ${numCount} 个 ${severity} 级别的安全漏洞`,
                            suggestion: '运行 npm audit fix 修复漏洞'
                        });
                    }
                });
            }
        } catch (error) {
            // 忽略错误
        }
    }
}

