/**
 * 内存泄漏和性能检查器 (Memory Leak & Performance Checker)
 * 
 * 检测常见的内存泄漏和性能问题：
 * - Vue组件内存泄漏 (未清理的watch/timer/listener)
 * - 后端IDisposable对象泄漏
 * - N+1查询问题
 * - 大数组/对象未释放
 * - 事件订阅未取消
 * 
 * @version 1.0.0
 */

import * as fs from 'fs-extra';
import path from 'path';
import { BaseChecker } from './base-checker.js';

export class MemoryPerformanceChecker extends BaseChecker {
    public override readonly name = '内存泄漏和性能检查器';
    public override readonly description = '检测内存泄漏和性能问题，包括Vue组件泄漏、IDisposable泄漏、N+1查询等';
    public override readonly version = '1.0.0';
    public override enabled = true;

    protected override async doCheck(): Promise<void> {
        this.logProgress('开始内存泄漏和性能检查...', 'info');

        // 检查1: Vue组件内存泄漏
        await this.checkVueComponentLeaks();

        // 检查2: 未清理的定时器
        await this.checkUncleanedTimers();

        // 检查3: 事件监听器泄漏
        await this.checkEventListenerLeaks();

        // 检查4: 后端IDisposable泄漏
        await this.checkDisposableLeaks();

        // 检查5: N+1查询问题
        await this.checkNPlusOneQueries();

        this.logProgress('内存泄漏和性能检查完成', 'info');
    }

    /**
     * 检查Vue组件内存泄漏
     * 规则：
     * - watch未在onUnmounted中停止
     * - 大组件未进行性能优化
     */
    private async checkVueComponentLeaks(): Promise<void> {
        const vueFiles = await this.findFiles(['**/*.vue'], {
            ignore: ['**/node_modules/**', '**/dist/**']
        });

        for (const file of vueFiles) {
            const fullPath = path.join(this.config.projectRoot, file);
            if (!(await fs.pathExists(fullPath))) continue;

            const content = await fs.readFile(fullPath, 'utf8');
            const lines = content.split('\n');

            // 检查watch但无onUnmounted
            const hasWatch = /\bwatch\s*\(/.test(content);
            const hasWatchEffect = /\bwatchEffect\s*\(/.test(content);
            const hasOnUnmounted = /\bonUnmounted\s*\(/.test(content);
            const hasOnBeforeUnmount = /\bonBeforeUnmount\s*\(/.test(content);

            if ((hasWatch || hasWatchEffect) && !hasOnUnmounted && !hasOnBeforeUnmount) {
                // 查找watch的行号
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line && /\bwatch(Effect)?\s*\(/.test(line)) {
                        this.addViolation({
                            rule: 'memory.vue-watch-no-cleanup',
                            level: 'P1',
                            file,
                            line: i + 1,
                            message: 'Vue watch/watchEffect可能未清理，建议在组件卸载时停止',
                            snippet: line.trim(),
                            suggestion: 'const stopWatch = watch(...); onUnmounted(() => stopWatch()); 或使用watchEffect自动清理'
                        });
                        break; // 只报告第一个
                    }
                }
            }

            // 检查大数组未使用虚拟滚动
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (!line) continue;

                // 检查v-for但无虚拟滚动
                if (/v-for\s*=\s*["']/.test(line) && !content.includes('virtual')) {
                    // 简单启发式：如果v-for后面跟着".slice("可能是手动分页
                    if (!content.includes('.slice(')) {
                        this.addViolation({
                            rule: 'memory.vue-large-list-no-virtual-scroll',
                            level: 'P2',
                            file,
                            line: i + 1,
                            message: 'v-for渲染列表未使用虚拟滚动，大数据量时可能导致性能问题',
                            snippet: line.trim(),
                            suggestion: '对于大列表(>100项)，使用vue-virtual-scroller或el-virtual-list组件'
                        });
                    }
                }
            }
        }
    }

    /**
     * 检查未清理的定时器
     */
    private async checkUncleanedTimers(): Promise<void> {
        const vueFiles = await this.findFiles(['**/*.vue', '**/*.ts', '**/*.js'], {
            ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts']
        });

        for (const file of vueFiles) {
            const fullPath = path.join(this.config.projectRoot, file);
            if (!(await fs.pathExists(fullPath))) continue;

            const content = await fs.readFile(fullPath, 'utf8');
            const lines = content.split('\n');

            // 统计setTimeout/setInterval
            const setTimeoutCount = (content.match(/setTimeout\s*\(/g) || []).length;
            const setIntervalCount = (content.match(/setInterval\s*\(/g) || []).length;
            const clearTimeoutCount = (content.match(/clearTimeout\s*\(/g) || []).length;
            const clearIntervalCount = (content.match(/clearInterval\s*\(/g) || []).length;

            // 检查setTimeout但无clearTimeout (Vue文件)
            if (file.endsWith('.vue') && setTimeoutCount > 0 && clearTimeoutCount === 0) {
                // 查找setTimeout的行号
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line && /setTimeout\s*\(/.test(line)) {
                        this.addViolation({
                            rule: 'memory.vue-timer-no-cleanup',
                            level: 'P1',
                            file,
                            line: i + 1,
                            message: 'setTimeout未清理，可能导致内存泄漏',
                            snippet: line.trim(),
                            suggestion: 'const timerId = setTimeout(...); onUnmounted(() => clearTimeout(timerId))'
                        });
                        break; // 只报告第一个
                    }
                }
            }

            // 检查setInterval但无clearInterval (更严重)
            if (setIntervalCount > 0 && clearIntervalCount < setIntervalCount) {
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line && /setInterval\s*\(/.test(line)) {
                        this.addViolation({
                            rule: 'memory.interval-no-cleanup',
                            level: 'P0', // setInterval泄漏更严重
                            file,
                            line: i + 1,
                            message: 'setInterval未清理，会持续运行导致严重内存泄漏',
                            snippet: line.trim(),
                            suggestion: 'const intervalId = setInterval(...); onUnmounted(() => clearInterval(intervalId))'
                        });
                        break;
                    }
                }
            }
        }
    }

    /**
     * 检查事件监听器泄漏
     */
    private async checkEventListenerLeaks(): Promise<void> {
        const files = await this.findFiles(['**/*.ts', '**/*.js', '**/*.vue'], {
            ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts']
        });

        for (const file of files) {
            const fullPath = path.join(this.config.projectRoot, file);
            if (!(await fs.pathExists(fullPath))) continue;

            const content = await fs.readFile(fullPath, 'utf8');
            const lines = content.split('\n');

            // 检查addEventListener但无removeEventListener
            const addEventCount = (content.match(/addEventListener\s*\(/g) || []).length;
            const removeEventCount = (content.match(/removeEventListener\s*\(/g) || []).length;

            if (addEventCount > 0 && removeEventCount < addEventCount) {
                // 查找addEventListener的行号
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line && /addEventListener\s*\(/.test(line)) {
                        this.addViolation({
                            rule: 'memory.event-listener-no-cleanup',
                            level: 'P1',
                            file,
                            line: i + 1,
                            message: 'addEventListener未移除，可能导致内存泄漏',
                            snippet: line.trim(),
                            suggestion: '在组件卸载时调用removeEventListener，或使用Vue的@事件绑定'
                        });
                        break; // 只报告第一个
                    }
                }
            }
        }
    }

    /**
     * 检查后端IDisposable泄漏
     * 规则：
     * - IDisposable对象必须使用using或手动Dispose
     * - 避免在静态字段中持有IDisposable
     */
    private async checkDisposableLeaks(): Promise<void> {
        const csFiles = await this.findFiles(['src/**/*.cs'], {
            ignore: ['**/obj/**', '**/bin/**']
        });

        for (const file of csFiles) {
            const fullPath = path.join(this.config.projectRoot, file);
            if (!(await fs.pathExists(fullPath))) continue;

            const content = await fs.readFile(fullPath, 'utf8');
            const lines = content.split('\n');

            // 检查常见的IDisposable对象
            const disposablePatterns = [
                { pattern: /new\s+HttpClient\s*\(/, name: 'HttpClient' },
                { pattern: /new\s+SqlConnection\s*\(/, name: 'SqlConnection' },
                { pattern: /new\s+StreamReader\s*\(/, name: 'StreamReader' },
                { pattern: /new\s+StreamWriter\s*\(/, name: 'StreamWriter' },
                { pattern: /new\s+FileStream\s*\(/, name: 'FileStream' },
                { pattern: /new\s+MemoryStream\s*\(/, name: 'MemoryStream' }
            ];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (!line) continue;

                for (const { pattern, name } of disposablePatterns) {
                    if (pattern.test(line)) {
                        // 检查是否在using语句中
                        const prevLine = lines[i - 1];
                        const isInUsing = /\busing\s*\(/.test(line) ||
                            (prevLine && /\busing\s*\(/.test(prevLine)) ||
                            /\busing\s+var\s+/.test(line) ||
                            /\busing\s+\w+\s+\w+\s*=/.test(line);

                        if (!isInUsing) {
                            this.addViolation({
                                rule: 'memory.disposable-no-using',
                                level: 'P0',
                                file,
                                line: i + 1,
                                message: `IDisposable对象"${name}"未使用using，可能导致资源泄漏`,
                                snippet: line.trim(),
                                suggestion: 'using var client = new HttpClient(); 或 using (var client = new HttpClient()) { ... }'
                            });
                        }
                        break; // 一行只报告一个
                    }
                }
            }
        }
    }

    /**
     * 检查N+1查询问题
     * 规则：
     * - 避免在循环中执行数据库查询
     * - 应使用Include预加载或批量查询
     */
    private async checkNPlusOneQueries(): Promise<void> {
        const sourceFiles = await this.findFiles([
            '**/*.cs',
            '**/*.ts',
            '**/*.js'
        ], {
            ignore: ['**/node_modules/**', '**/dist/**', '**/obj/**', '**/bin/**', '**/*.d.ts']
        });

        for (const file of sourceFiles) {
            const fullPath = path.join(this.config.projectRoot, file);
            if (!(await fs.pathExists(fullPath))) continue;

            const content = await fs.readFile(fullPath, 'utf8');
            const lines = content.split('\n');

            let inLoop = false;
            let braceDepth = 0;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (!line) continue;

                // 检测循环开始
                if (/\b(for|foreach|while|ForEach)\s*\(/.test(line)) {
                    inLoop = true;
                    braceDepth = 0;
                }

                if (inLoop) {
                    // 统计花括号深度
                    braceDepth += (line.match(/{/g) || []).length;
                    braceDepth -= (line.match(/}/g) || []).length;

                    // 检测数据库查询
                    const hasDatabaseQuery =
                        /\bawait\s+.*Repository\./.test(line) ||
                        /\bawait\s+.*DbContext\./.test(line) ||
                        /\.GetAsync\s*\(/.test(line) ||
                        /\.FindAsync\s*\(/.test(line) ||
                        /\.FirstOrDefaultAsync\s*\(/.test(line) ||
                        /\.ToListAsync\s*\(/.test(line) ||
                        /\.ExecuteQuery/.test(line) ||
                        /\.Query</.test(line);

                    if (hasDatabaseQuery) {
                        this.addViolation({
                            rule: 'performance.n-plus-1-query',
                            level: 'P1',
                            file,
                            line: i + 1,
                            message: '循环中执行数据库查询，可能导致N+1问题',
                            snippet: line.trim(),
                            suggestion: 'C#: 使用Include()预加载关联数据或批量查询; TS: 使用Promise.all()批量请求'
                        });
                    }

                    // 循环结束
                    if (braceDepth <= 0 && line.includes('}')) {
                        inLoop = false;
                    }
                }
            }
        }
    }
}

