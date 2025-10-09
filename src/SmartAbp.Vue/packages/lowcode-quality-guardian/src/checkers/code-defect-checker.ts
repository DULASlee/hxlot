import * as fs from 'fs-extra';
import path from 'path';
import { BaseChecker } from './base-checker.js';

export class CodeDefectChecker extends BaseChecker {
    public override readonly name = '代码缺陷和改进建议检查器';
    public override readonly description = '检测代码中的常见缺陷和潜在问题，提供改进建议';
    public override readonly version = '1.0.0';
    public override enabled = true;

    protected override async doCheck(): Promise<void> {
        this.logProgress('开始代码缺陷检查...', 'info');

        const sourceFiles = await this.findFiles([
            '**/*.ts', '**/*.js', '**/*.vue', '**/*.cs'
        ]);

        for (const file of sourceFiles) {
            const fullPath = path.join(this.config.projectRoot, file);
            if (!(await fs.pathExists(fullPath))) continue;

            const content = await fs.readFile(fullPath, 'utf8');
            this.filesChecked++;

            // 检查1: 魔法数字（Magic Numbers）
            await this.checkMagicNumbers(file, content);

            // 检查2: 深层嵌套（Deep Nesting）
            await this.checkDeepNesting(file, content);

            // 检查3: 硬编码字符串（Hard-coded Strings）
            await this.checkHardcodedStrings(file, content);

            // 检查4: 空catch块（Empty Catch Blocks）
            await this.checkEmptyCatchBlocks(file, content);

            // 检查5: 过度使用注释（Over-commenting）
            await this.checkOverCommenting(file, content);

            // 检查6: 不必要的类型转换（Unnecessary Type Casting）
            await this.checkUnnecessaryTypeCasting(file, content);

            // 检查7: 未使用的变量/导入
            await this.checkUnusedCode(file, content);

            // 检查8: 不安全的类型断言
            await this.checkUnsafeTypeAssertions(file, content);

            // 检查9: 缺少防御性编程
            await this.checkDefensiveProgramming(file, content);

            // 检查10: 代码格式不一致
            await this.checkCodeFormatting(file, content);
        }

        this.logProgress('代码缺陷检查完成', 'info');
    }

    /**
     * 检查魔法数字
     * 规则：
     * - 直接在代码中使用的数字常量（除0,1,-1外）
     * - 应该提取为命名常量
     */
    private async checkMagicNumbers(file: string, content: string): Promise<void> {
        const lines = content.split('\n');
        const magicNumberPattern = /\b(\d{2,})\b/g; // 匹配两位及以上的数字

        lines.forEach((line, index) => {
            // 跳过注释行和const定义行
            if (line.trim().startsWith('//') ||
                line.trim().startsWith('/*') ||
                line.trim().startsWith('*') ||
                line.includes('const ')) {
                return;
            }

            let match;
            while ((match = magicNumberPattern.exec(line)) !== null) {
                const number = match[1];
                if (number && parseInt(number, 10) > 1) { // 忽略0和1
                    this.addViolation({
                        rule: 'code-defect.magic-number',
                        level: 'P2',
                        file,
                        line: index + 1,
                        message: `使用了魔法数字 "${number}"`,
                        snippet: line.trim(),
                        suggestion: '将数字提取为命名常量，如：const MAX_RETRY_COUNT = 3'
                    });
                }
            }
        });
    }

    /**
     * 检查深层嵌套
     * 规则：
     * - 嵌套层数>4层
     */
    private async checkDeepNesting(file: string, content: string): Promise<void> {
        const lines = content.split('\n');
        let nestingLevel = 0;
        const maxNestingLevel = 4;

        lines.forEach((line, index) => {
            const openBraces = (line.match(/{/g) || []).length;
            const closeBraces = (line.match(/}/g) || []).length;

            nestingLevel += openBraces;

            if (nestingLevel > maxNestingLevel) {
                this.addViolation({
                    rule: 'code-defect.deep-nesting',
                    level: 'P1',
                    file,
                    line: index + 1,
                    message: `嵌套层数过深（${nestingLevel}层），超过${maxNestingLevel}层阈值`,
                    snippet: line.trim(),
                    suggestion: '提取子函数，降低嵌套深度，提高代码可读性'
                });
            }

            nestingLevel -= closeBraces;
            if (nestingLevel < 0) nestingLevel = 0; // 防止负数
        });
    }

    /**
     * 检查硬编码字符串
     * 规则：
     * - 硬编码的URL、文件路径、错误消息等
     */
    private async checkHardcodedStrings(file: string, content: string): Promise<void> {
        const lines = content.split('\n');

        // 检测硬编码URL
        const urlPattern = /(https?:\/\/[^\s"']+)/g;
        // 检测硬编码文件路径
        const pathPattern = /["'](\/[^"'\s]+|[A-Z]:\\[^"'\s]+)["']/g;

        lines.forEach((line, index) => {
            // 跳过注释和import语句
            if (line.trim().startsWith('//') ||
                line.trim().startsWith('/*') ||
                line.trim().startsWith('*') ||
                line.trim().startsWith('import ')) {
                return;
            }

            if (urlPattern.test(line)) {
                this.addViolation({
                    rule: 'code-defect.hardcoded-url',
                    level: 'P1',
                    file,
                    line: index + 1,
                    message: '硬编码URL，应该使用配置文件',
                    snippet: line.trim(),
                    suggestion: '将URL移到配置文件或环境变量中'
                });
            }

            if (pathPattern.test(line) && !line.includes('import') && !line.includes('require')) {
                this.addViolation({
                    rule: 'code-defect.hardcoded-path',
                    level: 'P1',
                    file,
                    line: index + 1,
                    message: '硬编码文件路径，应该使用配置或相对路径',
                    snippet: line.trim(),
                    suggestion: '使用配置文件或path.join()构建路径'
                });
            }
        });
    }

    /**
     * 检查空catch块
     * 规则：
     * - catch块中没有任何代码或只有注释
     */
    private async checkEmptyCatchBlocks(file: string, content: string): Promise<void> {
        const lines = content.split('\n');
        let inCatch = false;
        let catchStartLine = 0;
        let catchContent = '';

        lines.forEach((line, index) => {
            if (/catch\s*\(/.test(line)) {
                inCatch = true;
                catchStartLine = index + 1;
                catchContent = '';
            }

            if (inCatch) {
                catchContent += line + '\n';

                // 检测catch块结束
                if (line.includes('}') && catchContent.split('{').length === catchContent.split('}').length) {
                    // 移除空白和注释
                    const cleanContent = catchContent
                        .replace(/\/\/.*/g, '')
                        .replace(/\/\*[\s\S]*?\*\//g, '')
                        .replace(/\s/g, '');

                    // 如果只剩下{}，则是空catch块
                    if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(cleanContent)) {
                        this.addViolation({
                            rule: 'code-defect.empty-catch',
                            level: 'P0',
                            file,
                            line: catchStartLine,
                            message: '空catch块，会吞掉异常信息',
                            snippet: catchContent.trim(),
                            suggestion: '至少记录错误日志，或者重新抛出异常'
                        });
                    }

                    inCatch = false;
                }
            }
        });
    }

    /**
     * 检查过度注释
     * 规则：
     * - 注释行数>代码行数
     * - 显而易见的代码却有详细注释
     */
    private async checkOverCommenting(file: string, content: string): Promise<void> {
        const lines = content.split('\n');
        let commentLines = 0;
        let codeLines = 0;

        lines.forEach((line) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
                commentLines++;
            } else if (trimmed.length > 0 && !trimmed.startsWith('}') && !trimmed.startsWith('{')) {
                codeLines++;
            }
        });

        if (commentLines > codeLines && codeLines > 0) {
            this.addViolation({
                rule: 'code-defect.over-commenting',
                level: 'P2',
                file,
                message: `注释行数(${commentLines})大于代码行数(${codeLines})，可能过度注释`,
                suggestion: '代码应该自解释，注释应该解释"为什么"而不是"做什么"'
            });
        }
    }

    /**
     * 检查不必要的类型转换
     * 规则：
     * - 例如：const x = Number(5)（5本身就是number）
     */
    private async checkUnnecessaryTypeCasting(file: string, content: string): Promise<void> {
        const lines = content.split('\n');

        // 简单模式：Number(数字字面量), String("字符串"), Boolean(true/false)
        const patterns = [
            { pattern: /Number\s*\(\s*\d+\s*\)/g, type: 'Number' },
            { pattern: /String\s*\(\s*["'`][^"'`]*["'`]\s*\)/g, type: 'String' },
            { pattern: /Boolean\s*\(\s*(true|false)\s*\)/g, type: 'Boolean' }
        ];

        lines.forEach((line, index) => {
            patterns.forEach(({ pattern, type }) => {
                if (pattern.test(line)) {
                    this.addViolation({
                        rule: 'code-defect.unnecessary-casting',
                        level: 'P2',
                        file,
                        line: index + 1,
                        message: `不必要的${type}类型转换`,
                        snippet: line.trim(),
                        suggestion: '移除不必要的类型转换'
                    });
                }
            });
        });
    }

    /**
     * 检查未使用的代码
     * 规则：
     * - 声明但未使用的变量
     * - 未使用的导入
     */
    private async checkUnusedCode(file: string, content: string): Promise<void> {
        // 这个检查更适合由TypeScript编译器或ESLint完成
        // 这里只做简单的import检查
        const lines = content.split('\n');
        const imports: { name: string; line: number }[] = [];

        lines.forEach((line, index) => {
            const importMatch = line.match(/import\s+(?:\{([^}]+)\}|(\w+))\s+from/);
            if (importMatch) {
                const names = (importMatch[1] || importMatch[2] || '').split(',').map((s: string) => s.trim());
                names.forEach((name: string) => {
                    if (name) {
                        imports.push({ name, line: index + 1 });
                    }
                });
            }
        });

        // 检查每个import是否在代码中被使用
        imports.forEach(({ name, line }) => {
            // 简单检查：是否在import行之后的代码中出现
            const codeAfterImport = lines.slice(line).join('\n');
            const usagePattern = new RegExp(`\\b${name}\\b`, 'g');
            const matches = codeAfterImport.match(usagePattern);

            if (!matches || matches.length <= 1) { // 只出现一次（即import语句本身）
                this.addViolation({
                    rule: 'code-defect.unused-import',
                    level: 'P2',
                    file,
                    line: line,
                    message: `导入"${name}"未使用`,
                    suggestion: '移除未使用的导入'
                });
            }
        });
    }

    /**
     * 检查不安全的类型断言
     * 规则：
     * - 使用as any、as unknown、non-null断言(!)等
     */
    private async checkUnsafeTypeAssertions(file: string, content: string): Promise<void> {
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            if (/\bas\s+any\b/.test(line)) {
                this.addViolation({
                    rule: 'code-defect.unsafe-as-any',
                    level: 'P0',
                    file,
                    line: index + 1,
                    message: '使用了"as any"，绕过了类型检查',
                    snippet: line.trim(),
                    suggestion: '使用具体类型或类型守卫'
                });
            }

            if (/\bas\s+unknown\b/.test(line)) {
                this.addViolation({
                    rule: 'code-defect.as-unknown',
                    level: 'P1',
                    file,
                    line: index + 1,
                    message: '使用了"as unknown"，可能存在类型不匹配',
                    snippet: line.trim(),
                    suggestion: '明确目标类型，或使用类型守卫'
                });
            }

            // Non-null断言
            if (/!\./.test(line) || /!\)/.test(line)) {
                this.addViolation({
                    rule: 'code-defect.non-null-assertion',
                    level: 'P1',
                    file,
                    line: index + 1,
                    message: '使用了非空断言(!)，可能导致运行时错误',
                    snippet: line.trim(),
                    suggestion: '添加null/undefined检查，或使用可选链(?.)操作符'
                });
            }
        });
    }

    /**
     * 检查防御性编程
     * 规则：
     * - 函数参数未检查null/undefined
     * - 数组访问前未检查length
     * - 对象属性访问前未检查存在性
     */
    private async checkDefensiveProgramming(file: string, content: string): Promise<void> {
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            // 检查直接访问数组元素（arr[0]），但前面没有length检查
            if (/\w+\[\d+\]/.test(line)) {
                const prevLines = lines.slice(Math.max(0, index - 3), index).join('\n');
                if (!prevLines.includes('.length')) {
                    this.addViolation({
                        rule: 'code-defect.missing-array-check',
                        level: 'P1',
                        file,
                        line: index + 1,
                        message: '直接访问数组元素，未检查数组长度',
                        snippet: line.trim(),
                        suggestion: '添加数组长度检查，或使用可选链'
                    });
                }
            }
        });
    }

    /**
     * 检查代码格式
     * 规则：
     * - 行尾有多余空格
     * - 函数调用缺少空格
     * - 多个连续空行
     */
    private async checkCodeFormatting(file: string, content: string): Promise<void> {
        const lines = content.split('\n');
        let consecutiveEmptyLines = 0;

        lines.forEach((line, index) => {
            // 检查行尾空格
            if (line.endsWith(' ') || line.endsWith('\t')) {
                this.addViolation({
                    rule: 'code-defect.trailing-whitespace',
                    level: 'P2',
                    file,
                    line: index + 1,
                    message: '行尾有多余的空格或制表符',
                    suggestion: '移除行尾空格（IDE可自动处理）'
                });
            }

            // 检查连续空行
            if (line.trim() === '') {
                consecutiveEmptyLines++;
                if (consecutiveEmptyLines > 2) {
                    this.addViolation({
                        rule: 'code-defect.multiple-empty-lines',
                        level: 'P2',
                        file,
                        line: index + 1,
                        message: '超过2行连续空行',
                        suggestion: '保持代码紧凑，最多1-2行空行'
                    });
                }
            } else {
                consecutiveEmptyLines = 0;
            }
        });
    }
}

