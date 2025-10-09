/**
 * TypeScript类型安全检查器
 */

import { execa, ExecaChildProcess } from 'execa';
import path from 'path';
import type { Violation } from '@smartabp/lowcode-shared/types/index.js';
import { BaseChecker } from './base-checker.js';

export class TypeScriptChecker extends BaseChecker {
    private static readonly TSC_BUILD_COMMAND = 'pnpm';
    private static readonly TSC_BUILD_ARGS = ['tsc', '--build', '--force'];
    public name = 'TypeScriptChecker';
    public description = '检查TypeScript类型错误';
    public version = '3.0.0';
    private tscProcess: ExecaChildProcess | null = null;

    public async doCheck(): Promise<void> {
        this.logProgress('开始执行TypeScript类型检查 (tsc --build)...', 'info');
        const projectRoot = this.config.projectRoot as string;

        try {
            this.tscProcess = execa(TypeScriptChecker.TSC_BUILD_COMMAND, TypeScriptChecker.TSC_BUILD_ARGS, {
                cwd: projectRoot,
                timeout: 300000, // 5 minutes timeout
                reject: false, // Don't throw on non-zero exit code
            });

            const result = await this.tscProcess;
            this.tscProcess = null; // Process finished, clear reference

            if (result.stdout || result.stderr) {
                const output = result.stdout + result.stderr;
                const violations = this.parseTypeScriptBuildOutput(output);
                if (violations.length > 0) {
                    violations.forEach(v => this.addViolation(v));
                    this.logProgress(`TypeScript检查发现 ${violations.length} 个问题。`, 'error');
                } else if (result.exitCode === 0) {
                    this.logProgress('TypeScript类型检查通过，未发现问题。', 'success');
                } else {
                    this.logProgress('TypeScript检查器执行完毕，但未能解析出具体错误。将报告为一般性构建失败。', 'error');
                    this.addViolation({
                        file: 'tsconfig.json',
                        line: 1,
                        rule: 'typescript.build.failed',
                        message: `TypeScript构建失败 (exit code ${result.exitCode})，且无法解析具体错误。请查看下方原始输出。`,
                        level: 'P0',
                        snippet: output.substring(0, 1000) + (output.length > 1000 ? '...' : '')
                    });
                }
            } else if (result.exitCode === 0) {
                this.logProgress('TypeScript类型检查通过，未发现问题。', 'success');
            } else {
                this.addViolation({
                    file: 'tsconfig.json',
                    line: 1,
                    rule: 'typescript.execution.failed',
                    message: `TypeScript检查器执行失败: ${result.stderr || result.stdout}`,
                    level: 'P0',
                });
            }
        } catch (error: any) {
            if (error.isTimedOut) {
                this.addViolation({
                    file: 'tsconfig.json',
                    line: 1,
                    rule: 'typescript.execution.timeout',
                    message: `TypeScript检查器执行超时 (超过5分钟)`,
                    level: 'P0',
                });
            } else {
                this.addViolation({
                    file: 'tsconfig.json',
                    line: 1,
                    rule: 'typescript.execution.failed',
                    message: `TypeScript检查器执行失败: ${error.message}`,
                    level: 'P0',
                });
            }
        } finally {
            // Ensure the process is cleaned up if it's still running for any reason
            if (this.tscProcess) {
                await this.cleanup();
            }
        }
    }

    public async cleanup(): Promise<void> {
        if (this.tscProcess && !this.tscProcess.killed) {
            this.logProgress(`检测到TypeScript检查器仍在运行，将强制终止进程 (PID: ${this.tscProcess.pid})...`, 'warning');
            this.tscProcess.kill('SIGTERM', {
                forceKillAfterTimeout: 5000
            });
            this.tscProcess = null;
            this.logProgress('TypeScript检查器进程已终止。', 'success');
        }
    }

    private parseTypeScriptBuildOutput(output: string): Violation[] {
        const violations: Violation[] = [];
        const lines = output.split(/\r?\n/).filter(line => line.trim().length > 0);
        const errorPattern = /^(.*?)\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.*)$/;

        for (const line of lines) {
            const match = line.match(errorPattern);
            if (match) {
                const [, file, lineNum, colNum, code, message] = match;
                if (file && lineNum && colNum && code && message) {
                    violations.push({
                        file: path.relative(this.config.projectRoot as string, file.trim()),
                        line: parseInt(lineNum, 10),
                        column: parseInt(colNum, 10),
                        rule: `typescript.TS${code}`,
                        message: message.trim(),
                        level: 'P0',
                    });
                }
            }
        }
        return violations;
    }
}

