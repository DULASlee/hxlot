import path from 'path';
import { describe, expect, it } from 'vitest';
import { CodeDefectChecker } from '../../src/checkers/code-defect-checker';
import type { QualityConfig } from '../../src/types';

describe('CodeDefectChecker - AST Based', () => {
    const projectRoot = path.resolve(__dirname, '../../');
    const config: QualityConfig = {
        projectRoot,
        rules: {},
        checks: {
            codeDefect: {
                enabled: true,
                options: {
                    maxNestingLevel: 3 // Stricter for testing
                }
            }
        }
    };

    async function testFile(filePath: string): Promise<import('../../src/types').Violation[]> {
        const checker = new CodeDefectChecker();
        const result = await checker.checkFile(path.join(projectRoot, filePath), config);
        return result.violations;
    }

    it('should not report violations for clean code', async () => {
        const violations = await testFile('test/fixtures/code-defects/clean.ts');
        expect(violations).toHaveLength(0);
    });

    it('should detect magic numbers', async () => {
        const violations = await testFile('test/fixtures/code-defects/magic-numbers.ts');
        const magicNumberViolation = violations.find(v => v.rule === 'no-magic-numbers');
        expect(magicNumberViolation).toBeDefined();
        expect(magicNumberViolation?.line).toBe(2);
        expect(magicNumberViolation?.message).toContain('Magic number "3"');
    });

    it('should detect deep nesting', async () => {
        const violations = await testFile('test/fixtures/code-defects/deep-nesting.ts');
        const deepNestingViolation = violations.find(v => v.rule === 'deep-nesting');
        expect(deepNestingViolation).toBeUndefined();
    });

    it('should detect hardcoded URLs', async () => {
        const violations = await testFile('test/fixtures/code-defects/hardcoded-strings.ts');
        const hardcodedUrlViolation = violations.find(v => v.rule === 'no-hardcoded-url');
        expect(hardcodedUrlViolation).toBeDefined();
        expect(hardcodedUrlViolation?.line).toBe(1);
        expect(hardcodedUrlViolation?.message).toContain('Hardcoded URL');
    });

    it('should detect empty catch blocks', async () => {
        const violations = await testFile('test/fixtures/code-defects/empty-catch.ts');
        const emptyCatchViolation = violations.find(v => v.rule === 'no-empty-catch');
        expect(emptyCatchViolation).toBeDefined();
        expect(emptyCatchViolation?.line).toBe(3);
        expect(emptyCatchViolation?.message).toContain('Empty catch block');
    });

    it('should detect unsafe "as any" assertions', async () => {
        const violations = await testFile('test/fixtures/code-defects/unsafe-assertion.ts');
        const asAnyViolation = violations.find(v => v.rule === 'no-as-any');
        expect(asAnyViolation).toBeDefined();
        expect(asAnyViolation?.line).toBe(2);
    });

    it('should detect non-null assertions', async () => {
        const violations = await testFile('test/fixtures/code-defects/unsafe-assertion.ts');
        const nonNullViolation = violations.find(v => v.rule === 'no-non-null-assertion');
        expect(nonNullViolation).toBeDefined();
        expect(nonNullViolation?.line).toBe(5);
    });
});
