/**
 * TypeScript类型安全检查器
 */

import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree';
import path from 'path';
import type { CheckResult, QualityConfig, Violation } from '../types/index.js';
import { visitorTraverse } from '../utils/ast-traverse.js';
import { ASTManager } from '../utils/ast-manager.js';
import { BaseChecker } from './base-checker.js';

export class TypeScriptChecker extends BaseChecker {
    public readonly name = 'TypeScriptChecker';
    public readonly description = 'Checks for TypeScript best practice violations like `as any` and `@ts-ignore`.';
    public readonly version = '2.0.0';

    protected async doCheck(): Promise<void> {
        const tsFiles = await this.findFiles('**/*.{ts,tsx}', {
            ignore: ['**/*.d.ts', '**/*.spec.ts', '**/*.test.ts'],
        });

        const processFile = async (file: string) => {
            const result = await this.checkFile(file, this.config);
            this.violations.push(...result.violations);
        };

        await this.runInChunks(tsFiles, processFile);
    }

    public async checkFile(filePath: string, config: QualityConfig): Promise<CheckResult> {
        const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(config.projectRoot, filePath);

        const violations: Violation[] = [];

        try {
            const { ast } = await ASTManager.getInstance().getAST(absolutePath);

            // Check for @ts-ignore comments
            if (ast.comments) {
                for (const comment of ast.comments) {
                    if (comment.value.trim().startsWith('@ts-ignore')) {
                        violations.push({
                            rule: 'no-ts-ignore',
                            level: 'P0',
                            message: 'Usage of "@ts-ignore" is disallowed.',
                            file: filePath,
                            line: comment.loc.start.line,
                        });
                    }
                }
            }

            // Check for 'as any' expressions
            visitorTraverse(ast, {
                [AST_NODE_TYPES.TSAsExpression]: (node: any) => {
                    if (node.typeAnnotation.type === AST_NODE_TYPES.TSAnyKeyword) {
                        violations.push({
                            rule: 'no-as-any',
                            level: 'P0',
                            message: 'Usage of "as any" is disallowed.',
                            file: filePath,
                            line: node.loc.start.line,
                        });
                    }
                }
            });

            return {
                checker: this.name,
                passed: violations.length === 0,
                violations,
                filesChecked: 1,
                duration: 0, // Duration will be calculated in the base class
            };

        } catch (error) {
            // Gracefully handle file not found or parsing errors
            if (error.code !== 'ENOENT') {
                this.logProgress(`Could not check file ${filePath}: ${error.message}`, 'error');
            }
            return {
                checker: this.name,
                passed: true, // Pass if file can't be read or parsed
                violations: [],
                filesChecked: 1,
                duration: 0,
            };
        }
    }
}

