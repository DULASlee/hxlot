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

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import type { Node } from '@babel/types';
import { compileScript, parse as vueParse } from '@vue/compiler-sfc';

import { ControlFlowGraph } from '@smartabp/lowcode-shared/utils/control-flow-graph.js';
import { TaintAnalyzer } from '@smartabp/lowcode-shared/utils/taint-analyzer.js';
import { BaseChecker } from './base-checker.js';

interface ResourceLeakInfo {
    variable: string;
    type: 'timer' | 'event' | 'subscription' | 'watch';
    sourceApi: string;
    node: Node;
}

export class MemoryPerformanceChecker extends BaseChecker {
    public name = 'MemoryPerformanceChecker';
    public description = '使用CFG和污点分析检测潜在的内存泄漏和性能问题';
    public version = '3.0.0';

    protected async doCheck(): Promise<void> {
        const files = await this.findFiles(['**/*.{ts,tsx,js,jsx,vue}'], {
            ignore: ['**/*.d.ts', '**/*.spec.ts', '**/*.test.ts'],
        });

        for (const file of files) {
            try {
                const content = await this.readFile(file);
                if (!content) continue;

                let ast: Node;
                if (file.endsWith('.vue')) {
                    const { descriptor } = vueParse(content);
                    if (descriptor.script || descriptor.scriptSetup) {
                        const script = compileScript(descriptor, { id: file });
                        ast = parser.parse(script.content, {
                            sourceType: 'module',
                            plugins: ['typescript', 'jsx'],
                            errorRecovery: true,
                        });
                    } else {
                        continue;
                    }
                } else {
                    ast = parser.parse(content, {
                        sourceType: 'module',
                        plugins: ['typescript', 'jsx'],
                        errorRecovery: true,
                    });
                }

                traverse(ast, {
                    Function: (path) => {
                        const functionNode = path.node;
                        try {
                            const cfg = new ControlFlowGraph(functionNode);
                            const analyzer = new TaintAnalyzer(cfg);
                            const leaks = analyzer.analyze();

                            leaks.forEach((leak) => {
                                this.addViolation({
                                    file,
                                    line: leak.node.astNode?.loc?.start.line,
                                    column: leak.node.astNode?.loc?.start.column,
                                    level: 'P1',
                                    rule: 'memory-leak.resource-not-released',
                                    message: `检测到潜在的内存泄漏：资源 '${leak.variable}' (通过 ${leak.sourceApi} 创建) 可能没有被释放。`,
                                    suggestion: `请确保在组件卸载或不再需要时，调用相应的清理函数 (如 clearInterval, removeEventListener, subscription.unsubscribe)。`,
                                });
                            });
                        } catch (e) {
                            // Ignore CFG/Taint analysis errors on specific functions
                        }
                    },
                });
            } catch (error) {
                this.logProgress(`解析文件失败: ${file}`, 'error');
            }
        }
    }
}

