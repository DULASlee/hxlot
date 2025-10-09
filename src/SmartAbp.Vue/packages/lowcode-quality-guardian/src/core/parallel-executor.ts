/**
 * 并发执行器 - 提升质量检查性能
 * 使用 Promise.all 实现检查器并发执行
 */

import type { CheckerPlugin, CheckResult, QualityConfig } from '@smartabp/lowcode-shared/types/index.js';
import { ErrorHandler } from '@smartabp/lowcode-shared/utils/error-handler.js';
import { MemoryManager } from '@smartabp/lowcode-shared/utils/memory-manager.js';
import { RetryHandler } from '@smartabp/lowcode-shared/utils/retry-handler.js';

export interface ParallelCheckResult {
    type: string;
    checker: CheckerPlugin;
    result: CheckResult;
    duration: number;
    success: boolean;
    error: string | null;
}

export class ParallelExecutor {
    /**
     * 并发执行多个检查器
     * @param checkers 检查器Map
     * @param checkerTypes 要执行的检查器类型列表
     * @param config 配置
     * @returns 执行结果数组
     */
    static async executeCheckers(
        checkers: Map<string, CheckerPlugin>,
        checkerTypes: string[],
        config: QualityConfig
    ): Promise<ParallelCheckResult[]> {
        // 获取启用的检查器
        const enabledCheckers = checkerTypes
            .map(type => ({ type, checker: checkers.get(type) }))
            .filter(({ checker }) => checker && checker.enabled);

        if (enabledCheckers.length === 0) {
            return [];
        }

        // 初始化内存管理器和错误处理器
        const memoryManager = new MemoryManager(config.performance?.maxMemoryMB || 1024);
        const errorHandler = new ErrorHandler(true);

        // 并发执行所有检查器
        const checkPromises = enabledCheckers.map(async ({ type, checker }) => {
            const checkStartTime = performance.now();

            try {
                // 内存检查
                if (memoryManager.isMemoryExceeded()) {
                    memoryManager.forceGC();
                    await this.sleep(100);
                }

                // 重试执行检查器（带错误恢复）
                const result = await RetryHandler.retry(
                    async () => {
                        try {
                            return await checker!.check(config);
                        } catch (err) {
                            const error = err instanceof Error ? err : new Error(String(err));
                            const severity = ErrorHandler.classifyError(error);
                            const recoverable = ErrorHandler.isRecoverable(error);

                            // 记录错误
                            errorHandler.handle({
                                operation: `检查器执行: ${checker!.name}`,
                                checker: checker!.name,
                                originalError: error,
                                severity,
                                recoverable
                            });

                            // 如果不可恢复，抛出错误
                            if (!recoverable) {
                                throw error;
                            }

                            // 可恢复错误，返回空结果继续执行
                            return {
                                checker: checker!.name,
                                passed: false,
                                violations: [],
                                filesChecked: 0,
                                duration: 0
                            };
                        }
                    },
                    { maxRetries: 2, retryDelay: 500 }
                );

                const duration = Math.round(performance.now() - checkStartTime);

                return {
                    type,
                    checker: checker!,
                    result,
                    duration,
                    success: true,
                    error: null
                };
            } catch (error) {
                const duration = Math.round(performance.now() - checkStartTime);
                const err = error instanceof Error ? error : new Error(String(error));
                const friendlyMessage = ErrorHandler.getFriendlyMessage(err);

                return {
                    type,
                    checker: checker!,
                    result: {
                        checker: checker!.name,
                        passed: false,
                        violations: [],
                        filesChecked: 0,
                        duration: 0
                    },
                    duration,
                    success: false,
                    error: friendlyMessage
                };
            }
        });

        // 等待所有检查器完成（并发执行）
        const results = await Promise.all(checkPromises);

        // 清理内存
        memoryManager.cleanup();

        return results;
    }

    private static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 批量并发执行（分批执行，避免资源耗尽）
     * @param checkers 检查器Map
     * @param checkerTypes 要执行的检查器类型列表
     * @param config 配置
     * @param batchSize 每批数量（默认5）
     * @returns 执行结果数组
     */
    static async executeBatches(
        checkers: Map<string, CheckerPlugin>,
        checkerTypes: string[],
        config: QualityConfig,
        batchSize: number = 5
    ): Promise<ParallelCheckResult[]> {
        const enabledCheckers = checkerTypes
            .map(type => ({ type, checker: checkers.get(type) }))
            .filter(({ checker }) => checker && checker.enabled);

        const results: ParallelCheckResult[] = [];

        // 分批执行
        for (let i = 0; i < enabledCheckers.length; i += batchSize) {
            const batch = enabledCheckers.slice(i, i + batchSize);
            const batchTypes = batch.map(b => b.type);

            const batchResults = await this.executeCheckers(checkers, batchTypes, config);
            results.push(...batchResults);
        }

        return results;
    }
}

