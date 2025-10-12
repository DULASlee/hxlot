/**
 * 跨平台脚本执行工具
 * 支持Windows (PowerShell)、macOS/Linux (Bash)
 */

import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ScriptExecutionResult {
    success: boolean;
    stdout: string;
    stderr: string;
    exitCode: number;
}

export class PlatformUtils {
    /**
     * 检测当前平台
     */
    static getPlatform(): 'windows' | 'macos' | 'linux' {
        switch (process.platform) {
            case 'win32':
                return 'windows';
            case 'darwin':
                return 'macos';
            default:
                return 'linux';
        }
    }

    /**
     * 获取脚本文件的正确扩展名
     */
    static getScriptExtension(): '.ps1' | '.sh' {
        return this.getPlatform() === 'windows' ? '.ps1' : '.sh';
    }

    /**
     * 获取脚本执行器
     */
    static getScriptExecutor(): string {
        const platform = this.getPlatform();
        switch (platform) {
            case 'windows':
                return 'pwsh'; // 优先使用PowerShell Core
            case 'macos':
            case 'linux':
                return 'bash';
        }
    }

    /**
     * 执行跨平台脚本
     * @param scriptBaseName 脚本基础名称（不含扩展名）
     * @param scriptDir 脚本目录
     * @param args 脚本参数
     * @param options 执行选项
     */
    static async executeScript(
        scriptBaseName: string,
        scriptDir: string,
        args: string[] = [],
        options: {
            cwd?: string;
            timeout?: number;
            fallbackToBash?: boolean; // Windows下pwsh失败时回退到bash
        } = {}
    ): Promise<ScriptExecutionResult> {
        const platform = this.getPlatform();
        const extension = this.getScriptExtension();
        const scriptPath = path.join(scriptDir, `${scriptBaseName}${extension}`);

        // 检查脚本是否存在
        if (!fs.existsSync(scriptPath)) {
            return {
                success: false,
                stdout: '',
                stderr: `脚本不存在: ${scriptPath}`,
                exitCode: 1
            };
        }

        try {
            let executor = this.getScriptExecutor();
            let command: string;

            if (platform === 'windows') {
                // Windows: pwsh -File script.ps1 args
                command = `${executor} -File "${scriptPath}" ${args.join(' ')}`;
            } else {
                // macOS/Linux: bash script.sh args
                command = `${executor} "${scriptPath}" ${args.join(' ')}`;
            }

            const { stdout, stderr } = await execAsync(command, {
                cwd: options.cwd,
                timeout: options.timeout || 60000,
                maxBuffer: 10 * 1024 * 1024 // 10MB
            });

            return {
                success: true,
                stdout,
                stderr,
                exitCode: 0
            };
        } catch (error: any) {
            // Windows下pwsh失败时回退到bash
            if (platform === 'windows' && options.fallbackToBash) {
                try {
                    const bashScriptPath = path.join(scriptDir, `${scriptBaseName}.sh`);
                    if (fs.existsSync(bashScriptPath)) {
                        const { stdout, stderr } = await execAsync(`bash "${bashScriptPath}" ${args.join(' ')}`, {
                            cwd: options.cwd,
                            timeout: options.timeout || 60000
                        });

                        return {
                            success: true,
                            stdout,
                            stderr,
                            exitCode: 0
                        };
                    }
                } catch (bashError: any) {
                    // 回退失败，返回原始错误
                }
            }

            return {
                success: false,
                stdout: error.stdout || '',
                stderr: error.stderr || error.message,
                exitCode: error.code || 1
            };
        }
    }

    /**
     * 执行npm命令（跨平台）
     */
    static async executeNpm(
        command: string,
        options: {
            cwd?: string;
            timeout?: number;
        } = {}
    ): Promise<ScriptExecutionResult> {
        try {
            const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
            const fullCommand = `${npmCommand} ${command}`;

            const { stdout, stderr } = await execAsync(fullCommand, {
                cwd: options.cwd,
                timeout: options.timeout || 60000
            });

            return {
                success: true,
                stdout,
                stderr,
                exitCode: 0
            };
        } catch (error: any) {
            return {
                success: false,
                stdout: error.stdout || '',
                stderr: error.stderr || error.message,
                exitCode: error.code || 1
            };
        }
    }

    /**
     * 执行dotnet命令（跨平台）
     */
    static async executeDotnet(
        command: string,
        options: {
            cwd?: string;
            timeout?: number;
        } = {}
    ): Promise<ScriptExecutionResult> {
        try {
            const fullCommand = `dotnet ${command}`;

            const { stdout, stderr } = await execAsync(fullCommand, {
                cwd: options.cwd,
                timeout: options.timeout || 120000 // dotnet编译可能需要更长时间
            });

            return {
                success: true,
                stdout,
                stderr,
                exitCode: 0
            };
        } catch (error: any) {
            return {
                success: false,
                stdout: error.stdout || '',
                stderr: error.stderr || error.message,
                exitCode: error.code || 1
            };
        }
    }

    /**
     * 检查命令是否可用
     */
    static async isCommandAvailable(command: string): Promise<boolean> {
        try {
            const checkCommand = process.platform === 'win32'
                ? `where ${command}`
                : `which ${command}`;

            await execAsync(checkCommand);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 获取环境信息（用于诊断）
     */
    static async getEnvironmentInfo(): Promise<{
        platform: string;
        arch: string;
        nodeVersion: string;
        hasPwsh: boolean;
        hasBash: boolean;
        hasNpm: boolean;
        hasDotnet: boolean;
    }> {
        return {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            hasPwsh: await this.isCommandAvailable('pwsh'),
            hasBash: await this.isCommandAvailable('bash'),
            hasNpm: await this.isCommandAvailable('npm'),
            hasDotnet: await this.isCommandAvailable('dotnet')
        };
    }
}

