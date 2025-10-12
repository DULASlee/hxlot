/**
 * 架构合规性检查器
 */

import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import path from 'path';
import type { CheckResult, Violation } from '../types/index.js';
import { ASTManager } from '../utils/ast-manager.js';
import { visitorTraverse } from '../utils/ast-traverse.js';
import { BaseChecker } from './base-checker.js';

const ARCHITECTURE_LAYERS: Record<string, number> = {
    'lowcode-designer': 2,
    'lowcode-core': 1,
    'lowcode-api': 1,
    'lowcode-tools': 1,
    'lowcode-shared': 0,
    'metadata-core': -1,
};

type PackageName = keyof typeof ARCHITECTURE_LAYERS;

export class ArchitectureChecker extends BaseChecker {
    public readonly name = 'ArchitectureChecker';
    public readonly description = 'Checks for architectural violations like invalid imports.';
    public override readonly version = '2.0.0';

    protected override async doCheck(): Promise<void> {
        const sourceFiles = await this.findFiles('**/*.{ts,vue}');

        const processFile = async (file: string) => {
            const result = await this.checkFile(file, this.config);
            this.violations.push(...result.violations);
        };

        await this.runInChunks(sourceFiles, processFile);
    }

    public async checkFile(filePath: string, config: any): Promise<CheckResult> {
        const violations: Violation[] = [];
        const packagesPath = config.checks?.architecture?.options?.packagesPath || 'src/SmartAbp.Vue/packages';
        const absolutePackagesPath = path.join(config.projectRoot, packagesPath);
        const relativePath = path.relative(config.projectRoot, filePath);

        if (!filePath.startsWith(absolutePackagesPath)) {
            return { checker: this.name, passed: true, violations: [], filesChecked: 1, duration: 0 };
        }

        const currentPackage = this.getCurrentPackage(filePath, absolutePackagesPath);

        try {
            const { content, ast } = await ASTManager.getInstance().getAST(filePath);

            visitorTraverse(ast, {
                [AST_NODE_TYPES.ImportDeclaration]: (node: any) => {
                    const importDecl = node as any;
                    const importPath = importDecl.source.value as string;

                    // Rule: No relative imports crossing package boundaries
                    if (importPath.startsWith('../')) {
                        violations.push({
                            rule: 'no-relative-imports',
                            level: 'P0',
                            message: `A prohibited relative path ('../') import was found. Inter-package imports must use '@smartabp/*' aliases.`,
                            file: relativePath,
                            line: importDecl.loc.start.line,
                        });
                    }

                    // Rule: No imports from main app alias
                    if (importPath.startsWith('@/')) {
                        violations.push({
                            rule: 'no-main-app-imports',
                            level: 'P0',
                            message: `A prohibited main app alias ('@/') import was found. Packages must not depend on the main application.`,
                            file: relativePath,
                            line: importDecl.loc.start.line,
                        });
                    }

                    // Rule: No reverse dependencies
                    if (currentPackage && importPath.startsWith('@smartabp/')) {
                        const importedPackage = this.getPackageFromAlias(importPath);
                        if (importedPackage) {
                            const currentLayer = ARCHITECTURE_LAYERS[currentPackage as PackageName];
                            const importedLayer = ARCHITECTURE_LAYERS[importedPackage as PackageName];

                            if (importedLayer > currentLayer) {
                                violations.push({
                                    rule: 'no-reverse-dependencies',
                                    level: 'P0',
                                    message: `A prohibited reverse dependency was found. A lower-layer package '${currentPackage}' cannot import from a higher-layer package '${importedPackage}'.`,
                                    file: relativePath,
                                    line: importDecl.loc.start.line,
                                });
                            }
                        }
                    }
                }
            });

            return { checker: this.name, passed: violations.length === 0, violations, filesChecked: 1, duration: 0 };
        } catch (error) {
            if (error.code !== 'ENOENT') {
                this.logProgress(`Could not check file ${filePath}: ${error.message}`, 'error');
            }
            return { checker: this.name, passed: true, violations: [], filesChecked: 1, duration: 0 };
        }
    }

    private getCurrentPackage(filePath: string, packagesPath: string): string | null {
        const relativeFilePath = path.relative(packagesPath, filePath);
        const match = relativeFilePath.match(/([^\\/]+)/);
        const pkg = match ? match[1] : null;
        return pkg && pkg in ARCHITECTURE_LAYERS ? pkg as PackageName : null;
    }

    private getPackageFromAlias(alias: string): PackageName | null {
        const match = alias.match(/@smartabp\/([^\\/]+)/);
        const pkg = match ? match[1] : null;
        return pkg in ARCHITECTURE_LAYERS ? pkg as PackageName : null;
    }
}


