import path from 'path';
import { describe, expect, it } from 'vitest';
import { TypeScriptChecker } from '../../src/checkers/typescript-checker';
import type { QualityConfig } from '../../src/types';

describe('TypeScriptChecker - AST Based', () => {
    const projectRoot = path.resolve(__dirname, '../../');
    const config: QualityConfig = {
        projectRoot,
        rules: {},
        checks: {
            typescript: {
                enabled: true,
                options: {
                    project: 'tsconfig.json'
                }
            }
        }
    };

    it('should not report violations for clean code', async () => {
        const checker = new TypeScriptChecker();
        const cleanCodePath = path.resolve(__dirname, '../fixtures/typescript/clean.ts');

        const result = await checker.checkFile(cleanCodePath, config);

        expect(result.violations).toHaveLength(0);
    });

    it('should detect `as any` violations', async () => {
        const checker = new TypeScriptChecker();
        const dirtyCodePath = path.resolve(__dirname, '../fixtures/typescript/with-any.ts');

        const result = await checker.checkFile(dirtyCodePath, config);

        expect(result.violations).toHaveLength(1);
        const violation = result.violations[0];
        expect(violation.rule).toBe('no-as-any');
        expect(violation.message).toBe('Usage of "as any" is disallowed.');
        expect(violation.line).toBe(2);
    });

    it('should detect `@ts-ignore` violations', async () => {
        const checker = new TypeScriptChecker();
        const tsIgnorePath = path.resolve(__dirname, '../fixtures/typescript/with-ts-ignore.ts');

        const result = await checker.checkFile(tsIgnorePath, config);

        expect(result.violations).toHaveLength(1);
        const violation = result.violations[0];
        expect(violation.rule).toBe('no-ts-ignore');
        expect(violation.message).toBe('Usage of "@ts-ignore" is disallowed.');
        expect(violation.line).toBe(1);
    });

    it('should handle non-existent files gracefully', async () => {
        const checker = new TypeScriptChecker();
        const nonExistentPath = path.resolve(__dirname, '../fixtures/typescript/non-existent.ts');

        const result = await checker.checkFile(nonExistentPath, config);

        expect(result.violations).toHaveLength(0);
        expect(result.error).toBeUndefined();
    });
});
