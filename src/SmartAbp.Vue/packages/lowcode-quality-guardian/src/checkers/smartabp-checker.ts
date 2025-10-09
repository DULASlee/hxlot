/**
 * SmartAbp Quality Guardian - SmartAbp专用规则检查器 v2.0
 * 检查SmartAbp项目特有的代码质量规则
 */

import * as fs from 'fs-extra';
import { glob } from 'glob';
import path from 'path';
import type { CheckResult } from '@smartabp/lowcode-shared/types/index.js';
import { BaseChecker } from './base-checker.js';

export class SmartAbpChecker extends BaseChecker {
    public override readonly name = 'SmartAbp专用规则检查器';
    public override readonly description = '检查SmartAbp项目特有的代码质量规则和最佳实践';
    public override readonly version = '2.0.0';
    public override enabled = true;

    private totalViolationsFound = 0;

    protected async doCheck(): Promise<void> {
        // Implemented in check() method which overrides the base implementation
    }

    public override async check(): Promise<CheckResult> {
        const startTime = Date.now();
        this.totalViolationsFound = 0;

        console.log('  开始SmartAbp专用规则检查...');

        try {
            // 检查1: 硬编码常量检测
            await this.checkHardcodedConstants();

            // 检查2: Mock代码检测（P0重点）
            await this.checkMockCode();

            // 检查3: TODO/FIXME标记检测
            await this.checkTodoMarkers();

            // 检查4: console.log检测
            await this.checkConsoleLog();

            // 检查5: 低代码引擎规范检查
            await this.checkLowCodeConventions();

            console.log(`  SmartAbp规则检查完成，发现 ${this.totalViolationsFound} 处问题`);

            return {
                checker: this.name,
                passed: this.violations.filter(v => v.level === 'P0').length === 0,
                duration: Date.now() - startTime,
                filesChecked: 0, // TODO: Track files checked
                violations: this.violations,
                details: {
                    totalViolationsFound: this.totalViolationsFound
                }
            };
        } catch (error) {
            return {
                checker: this.name,
                passed: false,
                duration: Date.now() - startTime,
                filesChecked: 0,
                violations: [],
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * 检查硬编码常量
     */
    private async checkHardcodedConstants(): Promise<void> {
        console.log('    检查硬编码常量...');

        const patterns = [
            {
                id: 'smartabp.no-hardcoded-urls',
                pattern: /https?:\/\/[\w.-]+/g,
                level: 'P1' as const,
                message: '发现硬编码URL，应使用配置或环境变量',
                suggestion: '使用 appsettings.json 或环境变量配置URL'
            },
            {
                id: 'smartabp.no-hardcoded-secrets',
                pattern: /(password|apiKey|secret|token)\s*[=:]\s*["'][^"']{8,}/gi,
                level: 'P0' as const,
                message: '发现硬编码密码或API密钥，存在安全风险',
                suggestion: '使用安全的配置管理系统存储敏感信息'
            },
            {
                id: 'smartabp.no-magic-numbers',
                pattern: /\b(1000|2000|3000|5000|10000|999|1024|2048)\b/g,
                level: 'P2' as const,
                message: '发现魔法数字，应使用命名常量',
                suggestion: '将魔法数字定义为命名常量'
            }
        ];

        const searchPaths = [
            'src/SmartAbp.Vue/src/**/*.{ts,vue}',
            'src/SmartAbp.Vue/packages/**/*.{ts,vue}',
            'src/SmartAbp.Application/**/*.cs'
        ];

        for (const searchPath of searchPaths) {
            try {
                const files = await glob(searchPath, {
                    cwd: this.config.projectRoot,
                    ignore: ['**/node_modules/**', '**/test/**', '**/*.test.*', '**/*.spec.*', '**/dist/**'],
                    absolute: false
                });

                for (const file of files) {
                    await this.checkFileWithPatterns(file, patterns);
                }
            } catch (error) {
                // Skip if path doesn't exist
            }
        }
    }

    private async checkFileWithPatterns(
        file: string,
        patterns: Array<{
            id: string;
            pattern: RegExp;
            level: 'P0' | 'P1' | 'P2';
            message: string;
            suggestion?: string;
        }>
    ): Promise<void> {
        try {
            const fullPath = path.join(this.config.projectRoot, file);
            if (!await fs.pathExists(fullPath)) return;

            const content = await fs.readFile(fullPath, 'utf-8');
            const lines = content.split('\n');

            for (const patternDef of patterns) {
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (patternDef.pattern.test(line)) {
                        this.addViolation({
                            rule: patternDef.id,
                            level: patternDef.level,
                            file: file,
                            line: i + 1,
                            message: patternDef.message,
                            snippet: line.trim(),
                            suggestion: patternDef.suggestion
                        });
                        this.totalViolationsFound++;
                    }
                    // Reset regex lastIndex for global patterns
                    patternDef.pattern.lastIndex = 0;
                }
            }
        } catch (error) {
            // Skip files that can't be read
        }
    }

    /**
     * 检查Mock代码（P0重点检查）
     */
    private async checkMockCode(): Promise<void> {
        console.log('    检查Mock代码（P0重点）...');

        const mockPatterns = [
            'Promise.resolve({',
            'return new PagedResultDto<',
            'mock:',
            'Mock.create'
        ];

        const searchPaths = [
            'src/SmartAbp.Vue/src/**/*.{ts,vue}',
            'src/SmartAbp.Application/**/*.cs'
        ];

        for (const searchPath of searchPaths) {
            try {
                const files = await glob(searchPath, {
                    cwd: this.config.projectRoot,
                    ignore: ['**/node_modules/**', '**/test/**', '**/*.test.*', '**/*.spec.*', '**/mock/**', '**/dist/**'],
                    absolute: false
                });

                for (const file of files) {
                    await this.checkFileForMockCode(file, mockPatterns);
                }
            } catch (error) {
                // Skip if path doesn't exist
            }
        }
    }

    private async checkFileForMockCode(filePath: string, patterns: string[]): Promise<void> {
        try {
            const fullPath = path.join(this.config.projectRoot, filePath);
            if (!await fs.pathExists(fullPath)) return;

            const content = await fs.readFile(fullPath, 'utf-8');
            const lines = content.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                for (const pattern of patterns) {
                    if (line.includes(pattern)) {
                        this.addViolation({
                            rule: 'smartabp.no-mock-code-in-production',
                            level: 'P0',
                            file: filePath,
                            line: i + 1,
                            message: '生产代码中禁止使用Mock数据，必须调用真实API',
                            snippet: line.trim(),
                            suggestion: '实现真实的业务逻辑和数据访问'
                        });
                        this.totalViolationsFound++;
                    }
                }
            }
        } catch (error) {
            // Skip files that can't be read
        }
    }

    /**
     * 检查TODO/FIXME标记
     */
    private async checkTodoMarkers(): Promise<void> {
        console.log('    检查TODO/FIXME标记...');

        const searchPaths = [
            'src/SmartAbp.Vue/src/**/*.{ts,vue}',
            'src/SmartAbp.Application/**/*.cs'
        ];

        const todoPattern = /(TODO|FIXME|XXX|HACK):/i;

        for (const searchPath of searchPaths) {
            try {
                const files = await glob(searchPath, {
                    cwd: this.config.projectRoot,
                    ignore: ['**/node_modules/**', '**/test/**', '**/dist/**'],
                    absolute: false
                });

                for (const file of files) {
                    await this.checkFileForPattern(
                        file,
                        todoPattern,
                        'smartabp.no-todo-in-production',
                        'P2',
                        '建议完成TODO标记的工作',
                        '实现TODO中描述的功能或删除过期的TODO'
                    );
                }
            } catch (error) {
                // Skip if path doesn't exist
            }
        }
    }

    /**
     * 检查console.log
     */
    private async checkConsoleLog(): Promise<void> {
        console.log('    检查console.log...');

        const searchPaths = [
            'src/SmartAbp.Vue/src/**/*.{ts,vue}',
            'src/SmartAbp.Vue/packages/**/*.{ts,vue}'
        ];

        const consolePattern = /console\.(log|warn|error|debug)/;

        for (const searchPath of searchPaths) {
            try {
                const files = await glob(searchPath, {
                    cwd: this.config.projectRoot,
                    ignore: ['**/node_modules/**', '**/test/**', '**/dist/**'],
                    absolute: false
                });

                for (const file of files) {
                    await this.checkFileForPattern(
                        file,
                        consolePattern,
                        'eslint.no-console',
                        'P2',
                        '建议使用日志系统代替console.log',
                        '使用 Logger 或移除console调用'
                    );
                }
            } catch (error) {
                // Skip if path doesn't exist
            }
        }
    }

    /**
     * 检查低代码引擎规范
     */
    private async checkLowCodeConventions(): Promise<void> {
        console.log('    检查低代码引擎规范...');

        const searchPath = 'src/SmartAbp.Vue/packages/**/*.ts';

        try {
            const files = await glob(searchPath, {
                cwd: this.config.projectRoot,
                ignore: ['**/node_modules/**', '**/test/**', '**/dist/**'],
                absolute: false
            });

            for (const file of files) {
                await this.checkPackageDependencies(file);
            }
        } catch (error) {
            // Skip if path doesn't exist
        }
    }

    private async checkPackageDependencies(file: string): Promise<void> {
        try {
            const fullPath = path.join(this.config.projectRoot, file);
            if (!await fs.pathExists(fullPath)) return;

            const content = await fs.readFile(fullPath, 'utf-8');
            const lines = content.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // 检查相对路径引用（packages间）
                if (line.includes("from './") && line.includes('/packages/')) {
                    this.addViolation({
                        rule: 'lowcode.no-relative-package-imports',
                        level: 'P0',
                        file: file,
                        line: i + 1,
                        message: 'packages间禁止使用相对路径引用，应使用@smartabp/别名',
                        snippet: line.trim(),
                        suggestion: '使用 @smartabp/lowcode-shared 等别名导入'
                    });
                    this.totalViolationsFound++;
                }

                // 检查主应用引用
                if (line.includes("from '@/") && file.includes('/packages/')) {
                    this.addViolation({
                        rule: 'lowcode.no-main-app-imports',
                        level: 'P0',
                        file: file,
                        line: i + 1,
                        message: 'packages中禁止引用主应用代码',
                        snippet: line.trim(),
                        suggestion: '将共享代码移至lowcode-shared或使用依赖注入'
                    });
                    this.totalViolationsFound++;
                }
            }
        } catch (error) {
            // Skip files that can't be read
        }
    }

    private async checkFileForPattern(
        file: string,
        pattern: RegExp,
        ruleId: string,
        level: 'P0' | 'P1' | 'P2',
        message: string,
        suggestion: string
    ): Promise<void> {
        try {
            const fullPath = path.join(this.config.projectRoot, file);
            if (!await fs.pathExists(fullPath)) return;

            const content = await fs.readFile(fullPath, 'utf-8');
            const lines = content.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (pattern.test(line)) {
                    this.addViolation({
                        rule: ruleId,
                        level: level,
                        file: file,
                        line: i + 1,
                        message: message,
                        snippet: line.trim(),
                        suggestion: suggestion
                    });
                    this.totalViolationsFound++;
                }
                // Reset regex lastIndex
                pattern.lastIndex = 0;
            }
        } catch (error) {
            // Skip files that can't be read
        }
    }
}

