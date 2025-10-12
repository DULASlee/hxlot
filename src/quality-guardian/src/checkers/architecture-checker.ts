/**
 * 架构合规性检查器
 */

import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import fs from 'fs/promises';
import path from 'path';
import type { CheckResult, QualityConfig, Violation } from '../types/index.js';
import { simpleTraverse } from '../utils/ast-traverse';
import { getParser } from '../utils/parser';
import { BaseChecker } from './base-checker.js';

const ARCHITECTURE_LAYERS = {
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
    public readonly version = '2.0.0';

    private getPackagesPath(config: QualityConfig): string {
        return config.checks?.architecture?.options?.packagesPath || 'src/SmartAbp.Vue/packages';
    }

    protected async doCheck(): Promise<void> {
        const packagesPath = this.getPackagesPath(this.config);

        const tsFiles = await this.findFiles(`${packagesPath}/**/*.{ts,tsx,vue}`);

        for (const file of tsFiles) {
            const result = await this.checkFile(file, this.config);
            this.violations.push(...result.violations);
        }
    }

    public async checkFile(filePath: string, config: QualityConfig): Promise<CheckResult> {
        const packagesPath = this.getPackagesPath(config);
        const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(config.projectRoot, filePath);
        const relativePath = path.relative(config.projectRoot, absolutePath);

        // Ignore files outside of the packages directory
        if (!relativePath.startsWith(packagesPath)) {
            return { checker: this.name, passed: true, violations: [], filesChecked: 1, duration: 0 };
        }

        const violations: Violation[] = [];

        try {
            const content = await fs.readFile(absolutePath, 'utf-8');

            // For Vue files, only parse the script content
            const scriptContent = this.isVueFile(filePath) ? this.extractScriptContent(content) : content;
            if (!scriptContent) {
                return { checker: this.name, passed: true, violations: [], filesChecked: 1, duration: 0 };
            }

            const parser = getParser(filePath);
            const ast = parser(scriptContent, { loc: true });

            const currentPackage = this.getCurrentPackage(relativePath, packagesPath);

            simpleTraverse(ast, (node: any) => {
                if (node.type === AST_NODE_TYPES.ImportDeclaration && node.source) {
                    const importPath = node.source.value as string;

                    // Rule: No relative imports crossing package boundaries
                    if (importPath.startsWith('../')) {
                        violations.push({
                            rule: 'no-relative-imports',
                            level: 'P0',
                            message: `A prohibited relative path ('../') import was found. Inter-package imports must use '@smartabp/*' aliases.`,
                            file: relativePath,
                            line: node.loc.start.line,
                        });
                    }

                    // Rule: No imports from main app alias
                    if (importPath.startsWith('@/')) {
                        violations.push({
                            rule: 'no-main-app-imports',
                            level: 'P0',
                            message: `A prohibited main app alias ('@/') import was found. Packages must not depend on the main application.`,
                            file: relativePath,
                            line: node.loc.start.line,
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
                                    line: node.loc.start.line,
                                });
                            }
                        }
                    }
                }
            });

            return {
                checker: this.name,
                passed: violations.length === 0,
                violations,
                filesChecked: 1,
                duration: 0,
            };

        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn(`Could not check file ${filePath}: ${error.message}`);
            }
            return {
                checker: this.name,
                passed: true,
                violations: [],
                filesChecked: 1,
                duration: 0,
            };
        }
    }

    private isVueFile(filePath: string): boolean {
        return filePath.endsWith('.vue');
    }

    private extractScriptContent(content: string): string | null {
        const scriptMatch = content.match(/<script\s+lang="ts"\s*(?:setup)?.*?>([\s\S]*)<\/script>/);
        return scriptMatch ? scriptMatch[1] : null;
    }

    private getCurrentPackage(filePath: string, packagesPath: string): PackageName | null {
        const match = filePath.match(new RegExp(`${packagesPath.replace('/', '\\/')}\\/([^\\/]+)`));
        const pkg = match ? match[1] : null;
        return pkg in ARCHITECTURE_LAYERS ? pkg as PackageName : null;
    }

    private getPackageFromAlias(alias: string): PackageName | null {
        const match = alias.match(/@smartabp\/([^\\/]+)/);
        const pkg = match ? match[1] : null;
        return pkg in ARCHITECTURE_LAYERS ? pkg as PackageName : null;
    }
}

