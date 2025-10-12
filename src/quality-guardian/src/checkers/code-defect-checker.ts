import { AST_NODE_TYPES, TSESTree, parse } from '@typescript-eslint/typescript-estree';
import path from 'path';
import type { CheckResult, QualityConfig, Violation } from '../types/index.js';
import { TraversalContext, visitorTraverse } from '../utils/ast-traverse.js';
import { ASTManager } from '../utils/ast-manager.js';
import { BaseChecker } from './base-checker.js';

export class CodeDefectChecker extends BaseChecker {
    public override readonly name = 'CodeDefectChecker';
    public override readonly description = 'Detects common code defects and potential issues.';
    public override readonly version = '3.0.0';

    protected override async doCheck(): Promise<void> {
        const sourceFiles = await this.findFiles(['**/*.ts', '**/*.js', '**/*.vue']);
        
        const processFile = async (file: string) => {
            const result = await this.checkFile(file, this.config);
            this.violations.push(...result.violations);
        };
        
        await this.runInChunks(sourceFiles, processFile);
    }

    public async checkFile(filePath: string, config: QualityConfig): Promise<CheckResult> {
        const violations: Violation[] = [];
        const maxNestingLevel = config.checks?.codeDefect?.options?.maxNestingLevel || 4;

        try {
            const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(config.projectRoot, filePath);
            const { ast } = await ASTManager.getInstance().getAST(absolutePath);

            visitorTraverse(ast, {
                [AST_NODE_TYPES.Literal]: (node, context) => {
                    this.checkMagicNumbers(node as TSESTree.Literal, filePath, violations, context);
                    this.checkHardcodedUrls(node as TSESTree.Literal, filePath, violations, context);
                },
                [AST_NODE_TYPES.IfStatement]: (node, context) => {
                    this.checkDeepNesting(node, filePath, violations, maxNestingLevel, context);
                },
                [AST_NODE_TYPES.ForStatement]: (node, context) => {
                    this.checkDeepNesting(node, filePath, violations, maxNestingLevel, context);
                },
                [AST_NODE_TYPES.WhileStatement]: (node, context) => {
                    this.checkDeepNesting(node, filePath, violations, maxNestingLevel, context);
                },
                [AST_NODE_TYPES.SwitchStatement]: (node, context) => {
                    this.checkDeepNesting(node, filePath, violations, maxNestingLevel, context);
                },
                [AST_NODE_TYPES.ForOfStatement]: (node, context) => {
                    this.checkDeepNesting(node, filePath, violations, maxNestingLevel, context);
                },
                [AST_NODE_TYPES.ForInStatement]: (node, context) => {
                    this.checkDeepNesting(node, filePath, violations, maxNestingLevel, context);
                },
                [AST_NODE_TYPES.CatchClause]: (node, context) => {
                    this.checkEmptyCatchBlocks(node as TSESTree.CatchClause, filePath, violations, context);
                },
                [AST_NODE_TYPES.TSAsExpression]: (node, context) => {
                    this.checkUnsafeAssertions(node, filePath, violations, context);
                },
                [AST_NODE_TYPES.TSNonNullExpression]: (node, context) => {
                    this.checkUnsafeAssertions(node, filePath, violations, context);
                },
            });

            return { checker: this.name, passed: violations.length === 0, violations, filesChecked: 1, duration: 0 };
        } catch (error) {
            if (error.code !== 'ENOENT') {
                this.logProgress(`Could not check file ${filePath}: ${error.stack || error.message}`, 'error');
            }
            return { checker: this.name, passed: true, violations: [], filesChecked: 1, duration: 0 };
        }
    }

    private checkMagicNumbers(node: TSESTree.Literal, file: string, violations: Violation[], context: TraversalContext): void {
        if (
            typeof node.value === 'number' &&
            node.value !== 0 && node.value !== 1 &&
            context.parent?.type !== AST_NODE_TYPES.VariableDeclarator &&
            context.parent?.type !== AST_NODE_TYPES.Property &&
            context.parent?.type !== AST_NODE_TYPES.TSEnumMember
        ) {
            violations.push({
                rule: 'no-magic-numbers',
                level: 'P2',
                file,
                line: node.loc.start.line,
                message: `Magic number "${node.value}" detected. Consider extracting it to a named constant.`,
            });
        }
    }

    private checkDeepNesting(node: TSESTree.Node, file: string, violations: Violation[], maxNestingLevel: number, context: TraversalContext): void {
        const currentDepth = context.depth + 1;
        if (currentDepth >= maxNestingLevel) {
            const existingViolation = violations.find(v => v.line === node.loc.start.line && v.rule === 'deep-nesting');
            if (!existingViolation) {
                violations.push({
                    rule: 'deep-nesting',
                    level: 'P1',
                    file,
                    line: node.loc.start.line,
                    message: `Nesting level of ${currentDepth} exceeds the maximum of ${maxNestingLevel}.`,
                });
            }
        }
    }

    private checkHardcodedUrls(node: TSESTree.Literal, file: string, violations: Violation[], context: TraversalContext): void {
        if (
            typeof node.value === 'string' &&
            (node.value.startsWith('http://') || node.value.startsWith('https://')) &&
            context.parent?.type !== AST_NODE_TYPES.ImportDeclaration
        ) {
            violations.push({
                rule: 'no-hardcoded-url',
                        level: 'P1',
                        file,
                line: node.loc.start.line,
                message: 'Hardcoded URL found. Use a configuration file or environment variables.',
                    });
                }
            }

    private checkEmptyCatchBlocks(node: TSESTree.CatchClause, file: string, violations: Violation[], context: TraversalContext): void {
        if (node.body.body.length === 0) {
            violations.push({
                rule: 'no-empty-catch',
                level: 'P0',
                file,
                line: node.loc.start.line,
                message: 'Empty catch block found. Errors should be handled or logged.',
            });
        }
    }

    private checkUnsafeAssertions(node: TSESTree.Node, file: string, violations: Violation[], context: TraversalContext): void {
        if (node.type === AST_NODE_TYPES.TSAsExpression && node.typeAnnotation.type === AST_NODE_TYPES.TSAnyKeyword) {
            violations.push({
                rule: 'no-as-any',
                level: 'P0',
                message: 'Unsafe "as any" assertion detected.',
                    file,
                line: node.loc.start.line,
            });
        }

        if (node.type === AST_NODE_TYPES.TSNonNullExpression) {
            violations.push({
                rule: 'no-non-null-assertion',
                level: 'P1',
                message: 'Non-null assertion ("!") detected. Use proper null checks instead.',
                        file,
                line: node.loc.start.line,
                    });
                }
    }
}

