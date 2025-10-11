/**
 * 并行文件扫描器
 * 提供高效的文件扫描和过滤功能
 */

import glob from 'fast-glob';

export interface ScanResult {
    file: string;
    content: string;
    lines: number;
    size: number;
}

/**
 * 并行文件扫描器
 * 提供高效的文件扫描和过滤功能
 */
export class ParallelFileScanner {
    /**
     * 扫描文件系统，返回匹配glob模式的文件列表
     */
    static async scan(
        patterns: string | string[],
        cwd: string,
        ignore: string[] = []
    ): Promise<string[]> {
        const defaultIgnore = [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/.git/**',
            '**/coverage/**',
            '**/.cache/**',
        ];

        try {
            const files = await glob(patterns, {
                cwd,
                ignore: [...defaultIgnore, ...ignore],
                absolute: false,
                onlyFiles: true,
                dot: false,
            });
            return files;
        } catch (error) {
            console.error(`[ParallelFileScanner] 文件扫描失败: ${error}`);
            return [];
        }
    }

    /**
     * 并行过滤文件列表
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
            const filtered = batchResults.filter((r): r is Exclude<typeof r, null> => r !== null);
            results.push(...(filtered as T[]));
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

