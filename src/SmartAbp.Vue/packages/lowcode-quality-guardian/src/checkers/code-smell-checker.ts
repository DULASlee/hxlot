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

import * as fs from 'fs-extra';
import path from 'path';
import { BaseChecker } from './base-checker.js';

/**
 * 方法信息
 */
interface MethodInfo {
    name: string;
    startLine: number;
    endLine: number;
    body: string;
    parameterCount: number;
}

/**
 * 类信息
 */
interface ClassInfo {
    name: string;
    startLine: number;
    endLine: number;
    lineCount: number;
    methodCount: number;
}

/**
 * 代码片段指纹
 */
interface CodeSnippet {
    file: string;
    line: number;
    hash: string;
    content: string;
}

export class CodeSmellChecker extends BaseChecker {
    public override readonly name = '代码异味检查器';
    public override readonly description = '检测代码异味和不良实践，包括长方法、大类、重复代码等';
    public override readonly version = '1.0.0';
    public override enabled = true;

    // 配置阈值（可通过config覆盖）
    private methodLengthThreshold = 50;
    private complexityThreshold = 10;
    private classLengthThreshold = 500;
    private parameterCountThreshold = 5;
    private duplicateLineThreshold = 6;

    protected override async doCheck(): Promise<void> {
        this.logProgress('开始代码异味检查...', 'info');

        // 加载配置阈值
        this.loadThresholds();

        // 检查1: 长方法和高圈复杂度
        await this.checkLongMethodsAndComplexity();

        // 检查2: 大类
        await this.checkLargeClasses();

        // 检查3: 过长参数列表
        await this.checkLongParameterLists();

        // 检查4: 重复代码
        await this.checkDuplicatedCode();

        this.logProgress('代码异味检查完成', 'info');
    }

    /**
     * 加载配置阈值
     */
    private loadThresholds(): void {
        const config = (this.config as any).checkerConfigs?.['code-smell'];
        if (config) {
            this.methodLengthThreshold = config.methodLengthThreshold ?? this.methodLengthThreshold;
            this.complexityThreshold = config.complexityThreshold ?? this.complexityThreshold;
            this.classLengthThreshold = config.classLengthThreshold ?? this.classLengthThreshold;
            this.parameterCountThreshold = config.parameterCountThreshold ?? this.parameterCountThreshold;
            this.duplicateLineThreshold = config.duplicateCodeThreshold ?? this.duplicateLineThreshold;
        }
    }

    /**
     * 检查长方法和圈复杂度
     */
    private async checkLongMethodsAndComplexity(): Promise<void> {
        const sourceFiles = await this.findFiles([
            '**/*.ts',
            '**/*.js',
            '**/*.vue',
            '**/*.cs'
        ], {
            ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts']
        });

        for (const file of sourceFiles) {
            const fullPath = path.join(this.config.projectRoot, file);
            if (!(await fs.pathExists(fullPath))) continue;

            const content = await fs.readFile(fullPath, 'utf8');

            const methods = this.extractMethods(content, file);

            for (const method of methods) {
                const lineCount = method.endLine - method.startLine + 1;

                // 检查方法长度
                if (lineCount > this.methodLengthThreshold) {
                    this.addViolation({
                        rule: 'code-smell.long-method',
                        level: 'P2',
                        file,
                        line: method.startLine,
                        message: `方法"${method.name}"过长(${lineCount}行，阈值${this.methodLengthThreshold}行)`,
                        snippet: this.getSnippet(content, method.startLine, 3),
                        suggestion: '将方法拆分为更小的方法，每个方法专注于单一职责。参考单一职责原则(SRP)。'
                    });
                }

                // 检查圈复杂度
                const complexity = this.calculateCyclomaticComplexity(method.body);
                if (complexity > this.complexityThreshold) {
                    this.addViolation({
                        rule: 'code-smell.high-complexity',
                        level: 'P1',
                        file,
                        line: method.startLine,
                        message: `方法"${method.name}"圈复杂度过高(${complexity}，阈值${this.complexityThreshold})`,
                        snippet: this.getSnippet(content, method.startLine, 3),
                        suggestion: '简化条件逻辑，提取子方法，或使用策略模式/表驱动方法降低复杂度。'
                    });
                }
            }
        }
    }

    /**
     * 检查大类
     */
    private async checkLargeClasses(): Promise<void> {
        const sourceFiles = await this.findFiles([
            '**/*.ts',
            '**/*.js',
            '**/*.cs'
        ], {
            ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts']
        });

        for (const file of sourceFiles) {
            const fullPath = path.join(this.config.projectRoot, file);
            if (!(await fs.pathExists(fullPath))) continue;

            const content = await fs.readFile(fullPath, 'utf8');
            const classes = this.extractClasses(content, file);

            for (const cls of classes) {
                if (cls.lineCount > this.classLengthThreshold) {
                    this.addViolation({
                        rule: 'code-smell.large-class',
                        level: 'P2',
                        file,
                        line: cls.startLine,
                        message: `类"${cls.name}"过大(${cls.lineCount}行，${cls.methodCount}个方法，阈值${this.classLengthThreshold}行)`,
                        snippet: this.getSnippet(content, cls.startLine, 3),
                        suggestion: '将类拆分为多个职责单一的类，或提取部分功能到辅助类。'
                    });
                }
            }
        }
    }

    /**
     * 检查过长参数列表
     */
    private async checkLongParameterLists(): Promise<void> {
        const sourceFiles = await this.findFiles([
            '**/*.ts',
            '**/*.js',
            '**/*.cs'
        ], {
            ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts']
        });

        for (const file of sourceFiles) {
            const fullPath = path.join(this.config.projectRoot, file);
            if (!(await fs.pathExists(fullPath))) continue;

            const content = await fs.readFile(fullPath, 'utf8');
            const methods = this.extractMethods(content, file);

            for (const method of methods) {
                if (method.parameterCount > this.parameterCountThreshold) {
                    this.addViolation({
                        rule: 'code-smell.long-parameter-list',
                        level: 'P2',
                        file,
                        line: method.startLine,
                        message: `方法"${method.name}"参数过多(${method.parameterCount}个，阈值${this.parameterCountThreshold}个)`,
                        snippet: this.getSnippet(content, method.startLine, 2),
                        suggestion: '使用参数对象模式(Parameter Object)或建造者模式(Builder Pattern)减少参数数量。'
                    });
                }
            }
        }
    }

    /**
     * 检查重复代码
     * 使用滑动窗口 + 哈希指纹算法
     */
    private async checkDuplicatedCode(): Promise<void> {
        const sourceFiles = await this.findFiles([
            '**/*.ts',
            '**/*.js',
            '**/*.vue',
            '**/*.cs'
        ], {
            ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts']
        });

        // 构建代码片段指纹表
        const snippetMap = new Map<string, CodeSnippet[]>();

        for (const file of sourceFiles) {
            const fullPath = path.join(this.config.projectRoot, file);
            if (!(await fs.pathExists(fullPath))) continue;

            const content = await fs.readFile(fullPath, 'utf8');
            const lines = content.split('\n');

            // 滑动窗口提取代码片段
            for (let i = 0; i <= lines.length - this.duplicateLineThreshold; i++) {
                const windowLines = lines.slice(i, i + this.duplicateLineThreshold);

                // 过滤空行和注释
                const meaningfulLines = windowLines
                    .map((line: string) => line.trim())
                    .filter((line: string) =>
                        line.length > 0 &&
                        !line.startsWith('//') &&
                        !line.startsWith('/*') &&
                        !line.startsWith('*') &&
                        !line.startsWith('#')
                    );

                if (meaningfulLines.length < this.duplicateLineThreshold - 2) {
                    continue; // 跳过空白过多的片段
                }

                const snippet = meaningfulLines.join('\n');
                if (snippet.length < 80) {
                    continue; // 跳过过短的片段
                }

                const hash = this.hashCode(snippet);

                if (!snippetMap.has(hash)) {
                    snippetMap.set(hash, []);
                }

                snippetMap.get(hash)!.push({
                    file,
                    line: i + 1,
                    hash,
                    content: windowLines.join('\n')
                });
            }
        }

        // 报告重复代码
        snippetMap.forEach((locations) => {
            if (locations.length > 1) {
                // 只报告第一次出现的位置
                const primary = locations[0];
                if (!primary) return; // 安全检查

                const otherLocations = locations.slice(1)
                    .map(loc => `${loc.file}:${loc.line}`)
                    .join(', ');

                this.addViolation({
                    rule: 'code-smell.duplicated-code',
                    level: 'P2',
                    file: primary.file,
                    line: primary.line,
                    message: `发现重复代码，在${locations.length}个位置出现`,
                    snippet: primary.content.split('\n').slice(0, 5).join('\n') + '\n...',
                    suggestion: `提取为公共方法或组件。其他位置：${otherLocations}`
                });
            }
        });
    }

    /**
     * 提取方法信息
     */
    private extractMethods(content: string, _file: string): MethodInfo[] {
        const methods: MethodInfo[] = [];
        const lines = content.split('\n');

        // 简单的方法匹配模式（支持TS/JS/C#）
        const methodPatterns = [
            // TypeScript/JavaScript: function name() / async function name() / name() / async name()
            /(?:async\s+)?(?:function\s+)?(\w+)\s*\(([^)]*)\)\s*[:{]/,
            // C#: public/private/protected ... Type MethodName(params)
            /(?:public|private|protected|internal)\s+(?:async\s+)?(?:static\s+)?[\w<>]+\s+(\w+)\s*\(([^)]*)\)/,
        ];

        let currentMethod: { name: string; startLine: number; params: string } | null = null;
        let braceDepth = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue; // 跳过undefined行

            if (!currentMethod) {
                // 查找方法开始
                for (const pattern of methodPatterns) {
                    const match = line.match(pattern);
                    if (match && match.length >= 2) {
                        const methodName = match[1];
                        const params = match[2] || '';

                        // 跳过一些特殊情况
                        if (methodName &&
                            !['if', 'for', 'while', 'switch', 'catch'].includes(methodName)) {
                            currentMethod = {
                                name: methodName,
                                startLine: i + 1,
                                params
                            };
                            braceDepth = 0;
                            break;
                        }
                    }
                }
            }

            if (currentMethod && line) {
                // 统计花括号深度
                braceDepth += (line.match(/{/g) || []).length;
                braceDepth -= (line.match(/}/g) || []).length;

                if (braceDepth <= 0 && line.includes('}')) {
                    // 方法结束
                    const endLine = i + 1;
                    const methodBody = lines.slice(currentMethod.startLine - 1, endLine).join('\n');

                    methods.push({
                        name: currentMethod.name,
                        startLine: currentMethod.startLine,
                        endLine,
                        body: methodBody,
                        parameterCount: this.countParameters(currentMethod.params)
                    });

                    currentMethod = null;
                    braceDepth = 0;
                }
            }
        }

        return methods;
    }

    /**
     * 提取类信息
     */
    private extractClasses(content: string, _file: string): ClassInfo[] {
        const classes: ClassInfo[] = [];
        const lines = content.split('\n');

        // 类匹配模式
        const classPatterns = [
            // TypeScript/JavaScript: class Name / export class Name
            /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/,
            // C#: public/private/protected class Name
            /(?:public|private|protected|internal)\s+(?:abstract\s+)?(?:partial\s+)?class\s+(\w+)/,
        ];

        let currentClass: { name: string; startLine: number } | null = null;
        let braceDepth = 0;
        let methodCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue; // 跳过undefined行

            if (!currentClass) {
                // 查找类开始
                for (const pattern of classPatterns) {
                    const match = line.match(pattern);
                    if (match && match[1]) {
                        currentClass = {
                            name: match[1],
                            startLine: i + 1
                        };
                        braceDepth = 0;
                        methodCount = 0;
                        break;
                    }
                }
            }

            if (currentClass && line) {
                // 统计方法数量
                if (/(?:function|public|private|protected)\s+\w+\s*\(/.test(line)) {
                    methodCount++;
                }

                // 统计花括号深度
                braceDepth += (line.match(/{/g) || []).length;
                braceDepth -= (line.match(/}/g) || []).length;

                if (braceDepth <= 0 && line.includes('}')) {
                    // 类结束
                    const endLine = i + 1;
                    const lineCount = endLine - currentClass.startLine + 1;

                    classes.push({
                        name: currentClass.name,
                        startLine: currentClass.startLine,
                        endLine,
                        lineCount,
                        methodCount
                    });

                    currentClass = null;
                    braceDepth = 0;
                    methodCount = 0;
                }
            }
        }

        return classes;
    }

    /**
     * 计算圈复杂度 (Cyclomatic Complexity)
     * 算法：基础复杂度1 + 每个决策点+1
     */
    private calculateCyclomaticComplexity(code: string): number {
        let complexity = 1; // 基础复杂度

        // 决策关键字
        const decisionPatterns = [
            /\bif\b/g,           // if语句
            /\belse\s+if\b/g,    // else if
            /\bwhile\b/g,        // while循环
            /\bfor\b/g,          // for循环
            /\bcase\b/g,         // case分支
            /\bcatch\b/g,        // catch异常
            /\?\s*[^:]+:/g,      // 三元运算符
            /&&/g,               // 逻辑与
            /\|\|/g              // 逻辑或
        ];

        for (const pattern of decisionPatterns) {
            const matches = code.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        }

        return complexity;
    }

    /**
     * 统计参数数量
     */
    private countParameters(paramsString: string): number {
        if (!paramsString || paramsString.trim() === '') {
            return 0;
        }

        // 简单分割，不处理复杂泛型
        const params = paramsString.split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0);

        return params.length;
    }

    /**
     * 计算字符串哈希码
     */
    private hashCode(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }

    /**
     * 获取代码片段
     */
    private getSnippet(content: string, line: number, contextLines: number = 2): string {
        const lines = content.split('\n');
        const start = Math.max(0, line - 1 - contextLines);
        const end = Math.min(lines.length, line + contextLines);
        return lines.slice(start, end).join('\n');
    }
}

