import path from 'path';
import { describe, expect, it } from 'vitest';
import { ArchitectureChecker } from '../../src/checkers/architecture-checker';
import type { QualityConfig } from '../../src/types';

describe('ArchitectureChecker - AST Based', () => {
    const projectRoot = path.resolve(__dirname, '../../');
    const config: QualityConfig = {
        projectRoot,
        rules: {},
        checks: {
            architecture: {
                enabled: true,
                options: {
                    packagesPath: 'test/fixtures/packages'
                }
            }
        }
    };

    it('should not report violations for a clean file', async () => {
        const checker = new ArchitectureChecker();
        const filePath = 'test/fixtures/packages/lowcode-core/src/clean.ts';
        const result = await checker.checkFile(path.join(projectRoot, filePath), config);
        expect(result.violations).toHaveLength(0);
    });

    it('should detect relative path violations (`../`) in packages', async () => {
        const checker = new ArchitectureChecker();
        const filePath = 'test/fixtures/packages/lowcode-core/src/relative-import.ts';
        const result = await checker.checkFile(path.join(projectRoot, filePath), config);

        expect(result.violations).toHaveLength(1);
        const violation = result.violations[0];
        expect(violation.rule).toBe('no-relative-imports');
        expect(violation.message).toContain('prohibited relative path');
        expect(violation.line).toBe(1);
    });

    it('should detect main app alias violations (`@/`) in packages', async () => {
        const checker = new ArchitectureChecker();
        const filePath = 'test/fixtures/packages/lowcode-core/src/alias-import.ts';
        const result = await checker.checkFile(path.join(projectRoot, filePath), config);

        expect(result.violations).toHaveLength(1);
        const violation = result.violations[0];
        expect(violation.rule).toBe('no-main-app-imports');
        expect(violation.message).toContain('prohibited main app alias');
        expect(violation.line).toBe(1);
    });

    it('should detect reverse dependency violations (e.g., core depending on designer)', async () => {
        const checker = new ArchitectureChecker();
        const filePath = 'test/fixtures/packages/lowcode-core/src/reverse-dependency.ts';
        const result = await checker.checkFile(path.join(projectRoot, filePath), config);

        expect(result.violations).toHaveLength(1);
        const violation = result.violations[0];
        expect(violation.rule).toBe('no-reverse-dependencies');
        expect(violation.message).toContain('prohibited reverse dependency');
        expect(violation.line).toBe(1);
    });

    it('should ignore files outside of the configured packages path', async () => {
        const checker = new ArchitectureChecker();
        const filePath = 'test/fixtures/outside-package/some-file.ts';
        const result = await checker.checkFile(path.join(projectRoot, filePath), config);

        expect(result.violations).toHaveLength(0);
    });
});
