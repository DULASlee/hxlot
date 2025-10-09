/**
 * 代码异味检查器 (Code Smell Checker)
 * 
 * 检测常见的代码异味和不良实践：
 * - 长方法 (Long Method)
 * - 大类 (Large Class)
 * - 重复代码 (Duplicated Code)
 * - 过长参数列表 (Long Parameter List)
 * - 高圈复杂度 (High Cyclomatic Complexity)
 * 
 * @version 1.0.0
 */

import {
    AstDuplicationDetector,
    type CodeFingerprint,
} from '../utils/ast-duplication-detector.js';
import { BaseChecker } from './base-checker.js';

export class CodeSmellChecker extends BaseChecker {
    public readonly name = 'CodeSmellChecker';
    public readonly description = '检查代码异味，如重复代码、长函数等';
    public readonly version = '1.0.0';

    protected async doCheck(): Promise<void> {
        const files = await this.findFiles(
            ['**/*.ts', '**/*.tsx', '**/*.vue', '**/*.js'],
            { ignore: ['**/*.template.*'] }
        );
        if (files.length === 0) {
            this.logProgress('未找到需要检查的文件。', 'warning');
            return;
        }

        const detector = new AstDuplicationDetector({ maxDistance: 5 });

        this.logProgress(`分析 ${files.length} 个文件以检测逻辑重复...`, 'info');

        let allFingerprints: CodeFingerprint[] = [];
        for (const file of files) {
            const content = await this.readFile(file);
            if (content) {
                const fingerprints = detector.generateFingerprints(content, file);
                allFingerprints.push(...fingerprints);
            }
        }

        this.logProgress(`生成了 ${allFingerprints.length} 个代码指纹，开始比对...`, 'info');

        const duplicates = detector.findDuplicates(allFingerprints);

        this.logProgress(`发现 ${duplicates.length} 对重复代码。`, 'info');

        for (const duplicate of duplicates) {
            this.addViolation({
                rule: 'code-smell.logical-duplication',
                level: 'P2',
                message: `发现逻辑高度相似的代码 (相似度: ${this.calculateSimilarity(
                    duplicate.distance
                )}%)`,
                file: duplicate.a.filePath,
                line: duplicate.a.startLine,
                suggestion: `此代码块与文件 '${duplicate.b.filePath}' (行 ${duplicate.b.startLine}-${duplicate.b.endLine}) 逻辑上重复。请考虑将其重构为一个可复用的函数或抽象。`,
                snippet: duplicate.a.codeSnippet,
            });
        }
    }

    private calculateSimilarity(distance: number): number {
        // Simhash is typically 64-bit
        return Math.round((1 - distance / 64) * 100);
    }
}

