/**
 * TypeScript类型安全检查器
 */

import { BaseChecker } from './base-checker.js';

export class TypeScriptChecker extends BaseChecker {
    public readonly name = 'TypeScript类型检查器';
    public readonly description = '检查TypeScript类型安全和编译错误';
    public readonly version = '2.0.0';

    protected async doCheck(): Promise<void> {
        this.logProgress('执行TypeScript类型检查...', 'info');

        const { stdout, stderr, exitCode } = await this.execCommand('npx', [
            'tsc',
            '--noEmit',
            '--pretty',
            'false'
        ], { cwd: this.config.projectRoot });

        if (exitCode !== 0) {
            this.parseTypeScriptOutput(stderr || stdout);
        } else {
            this.logProgress('TypeScript检查: ✅ 0错误', 'success');
        }
    }

    private parseTypeScriptOutput(output: string): void {
        const lines = output.split('\n').filter(line => line.trim());

        for (const line of lines) {
            const match = line.match(/^(.+?)\\((\\d+),(\\d+)\\):\\s+error\\s+TS(\\d+):\\s+(.+)$/);
            if (match && match.length >= 6) {
                const [, file, lineNum, column, code, message] = match;

                if (file && lineNum && column && code && message) {
                    this.addViolation({
                        rule: `typescript.TS${code}`,
                        level: 'P0',
                        file: file.replace(this.config.projectRoot + '/', ''),
                        line: parseInt(lineNum, 10),
                        column: parseInt(column, 10),
                        message: message,
                        suggestion: 'Please fix the TypeScript error'
                    });
                }
            }
        }
    }
}

