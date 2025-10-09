/**
 * 性能质量检查器
 */

import { BaseChecker } from './base-checker.js';

export class PerformanceChecker extends BaseChecker {
    public readonly name = '性能质量检查器';
    public readonly description = '检查代码性能和优化机会';
    public readonly version = '2.0.0';

    protected async doCheck(): Promise<void> {
        this.logProgress('执行性能质量检查...', 'info');

        await this.checkLargeFiles();
        await this.checkComplexFunctions();
    }

    private async checkLargeFiles(): Promise<void> {
        const largeFiles = await this.findFiles('**/*.{ts,vue,cs}');

        for (const file of largeFiles) {
            const lines = await this.countLines(file);
            if (lines > 500) {
                this.addViolation({
                    rule: 'performance.large-file',
                    level: 'P2',
                    file,
                    message: `文件过大（${lines}行），建议拆分`,
                    suggestion: '将大文件拆分为多个小文件'
                });
            }
        }
    }

    private async checkComplexFunctions(): Promise<void> {
        // 简化实现
        this.logProgress('检查复杂函数...', 'info');
    }
}

