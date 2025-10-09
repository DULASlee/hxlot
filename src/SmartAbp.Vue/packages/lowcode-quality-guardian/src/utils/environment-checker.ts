/**
 * SmartAbp Quality Guardian - 环境依赖检查器
 * 检查运行环境是否满足要求
 */

import execa from 'execa';
import type { CheckResult } from '../types/index.js';

export class EnvironmentChecker {
    private requirements = {
        node: { min: '20.19.0', name: 'Node.js' },
        npm: { min: '10.0.0', name: 'npm' },
        git: { min: '2.0.0', name: 'Git' }
    };

    async check(): Promise<CheckResult> {
        const violations = [];
        let allPassed = true;

        // 检查Node.js
        const nodeVersion = process.version.replace('v', '');
        if (!this.satisfiesVersion(nodeVersion, this.requirements.node.min)) {
            violations.push({
                rule: 'environment.node-version',
                level: 'P0' as const,
                message: `Node.js版本过低，当前: ${nodeVersion}，要求: >=${this.requirements.node.min}`,
                suggestion: '请升级Node.js到最新LTS版本'
            });
            allPassed = false;
        }

        // 检查npm
        try {
            const { stdout: npmVersion } = await execa('npm', ['--version']);
            if (!this.satisfiesVersion(npmVersion.trim(), this.requirements.npm.min)) {
                violations.push({
                    rule: 'environment.npm-version',
                    level: 'P0' as const,
                    message: `npm版本过低，当前: ${npmVersion}，要求: >=${this.requirements.npm.min}`,
                    suggestion: '运行 npm install -g npm@latest 升级npm'
                });
                allPassed = false;
            }
        } catch (error) {
            violations.push({
                rule: 'environment.npm-missing',
                level: 'P0' as const,
                message: 'npm未安装',
                suggestion: '请安装Node.js（包含npm）'
            });
            allPassed = false;
        }

        // 检查Git
        try {
            const { stdout: gitVersion } = await execa('git', ['--version']);
            const version = gitVersion.match(/(\d+\.\d+\.\d+)/)?.[1];
            if (version && !this.satisfiesVersion(version, this.requirements.git.min)) {
                violations.push({
                    rule: 'environment.git-version',
                    level: 'P1' as const,
                    message: `Git版本过低，当前: ${version}，建议: >=${this.requirements.git.min}`,
                    suggestion: '升级Git到最新版本'
                });
            }
        } catch (error) {
            violations.push({
                rule: 'environment.git-missing',
                level: 'P1' as const,
                message: 'Git未安装',
                suggestion: '请安装Git'
            });
        }

        return {
            checker: 'Environment',
            passed: allPassed,
            duration: 0,
            filesChecked: 0,
            violations
        };
    }

    private satisfiesVersion(current: string, required: string): boolean {
        const currentParts = current.split('.').map(Number);
        const requiredParts = required.split('.').map(Number);

        for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
            const currentPart = currentParts[i] || 0;
            const requiredPart = requiredParts[i] || 0;

            if (currentPart > requiredPart) return true;
            if (currentPart < requiredPart) return false;
        }

        return true;
    }
}

