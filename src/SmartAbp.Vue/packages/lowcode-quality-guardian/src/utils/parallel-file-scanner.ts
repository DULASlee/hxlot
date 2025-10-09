/**
 * 并发文件扫描器
 * 使用 Promise 并发扫描多个文件，提升性能
 */

import glob from 'fast-glob';
import * as fs from 'fs-extra';
import path from 'path';

export interface ScanResult {
    file: string;
    content: string;
    lines: number;
    size: number;
}

export class ParallelFileScanner {
    /**
     * 并发扫描多个文件
     * @param patterns Glob 模式数组
     * @param options 选项
     * @returns 扫描结果数组
     */
    static async scanFiles(
        patterns: string[],
        options: {
            cwd?: string;
            ignore?: string[];
            concurrency?: number;
            maxFileSize?: number; // bytes
        } = {}
    ): Promise<ScanResult[]> {
        const {
            cwd = process.cwd(),
            ignore = ['**/node_modules/**', '**/dist/**', '**/.git/**'],
            concurrency = 10,
            maxFileSize = 5 * 1024 * 1024 // 5MB
        } = options;

        // 1. 查找所有匹配的文件（已经很快）
        const files = await glob(patterns, {
            cwd,
            ignore,
            absolute: false,
            onlyFiles: true
        });

        // 2. 并发读取文件内容
        const results: ScanResult[] = [];

        // 分批并发执行
        for (let i = 0; i < files.length; i += concurrency) {
            const batch = files.slice(i, i + concurrency);

            const batchResults = await Promise.all(
                batch.map(async (file) => {
                    try {
                        const fullPath = path.join(cwd, file);

                        // 检查文件大小
                        const stats = await fs.stat(fullPath);
                        if (stats.size > maxFileSize) {
                            // 跳过过大的文件
                            return null;
                        }

                        const content = await fs.readFile(fullPath, 'utf8');
                        const lines = content.split('\n').length;

                        return {
                            file,
                            content,
                            lines,
                            size: stats.size
                        };
                    } catch (error) {
                        // 读取失败，跳过
                        return null;
                    }
                })
            );

            // 过滤掉失败的结果
            results.push(...batchResults.filter((r): r is ScanResult => r !== null));
        }

        return results;
    }

    /**
     * 并发检查文件是否匹配规则
     * @param files 文件数组
     * @param checkFn 检查函数
     * @param concurrency 并发数
     * @returns 匹配的文件数组
     */
    static async filterFiles<T>(
        files: string[],
        checkFn: (file: string) => Promise<T | null>,
        concurrency: number = 10
    ): Promise<T[]> {
        const results: T[] = [];

        for (let i = 0; i < files.length; i += concurrency) {
            const batch = files.slice(i, i + concurrency);
            const batchResults = await Promise.all(batch.map(checkFn));
            const filtered = batchResults.filter((r): r is Exclude<typeof r, null> => r !== null) as T[];
            results.push(...filtered);
        }

        return results;
    }

    /**
     * 并发处理文件
     * @param files 文件数组
     * @param processFn 处理函数
     * @param concurrency 并发数
     */
    static async processFiles<T>(
        files: string[],
        processFn: (file: string) => Promise<T>,
        concurrency: number = 10
    ): Promise<T[]> {
        const results: T[] = [];

        for (let i = 0; i < files.length; i += concurrency) {
            const batch = files.slice(i, i + concurrency);
            const batchResults = await Promise.all(batch.map(processFn));
            results.push(...batchResults);
        }

        return results;
    }
}

