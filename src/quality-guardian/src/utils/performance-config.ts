/**
 * 性能优化配置
 */

export interface PerformanceConfig {
    /**
     * 是否启用并发执行
     * @default true
     */
    enableParallel?: boolean;

    /**
     * 并发批次大小（避免资源耗尽）
     * @default 5 - 每次并发执行5个检查器
     */
    parallelBatchSize?: number;

    /**
     * 文件扫描并发数
     * @default 10 - 同时扫描10个文件
     */
    fileScanConcurrency?: number;

    /**
     * 是否启用文件缓存
     * @default true
     */
    enableFileCache?: boolean;

    /**
     * 最大内存使用限制（MB）
     * @default 1024 - 1GB
     */
    maxMemoryMB?: number;
}

export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
    enableParallel: true,
    parallelBatchSize: 5,
    fileScanConcurrency: 10,
    enableFileCache: true,
    maxMemoryMB: 1024
};

/**
 * 性能监控器
 */
export class PerformanceMonitor {
    private startTime: number = 0;
    private checkpoints: Map<string, number> = new Map();

    start(): void {
        this.startTime = performance.now();
    }

    checkpoint(name: string): void {
        this.checkpoints.set(name, performance.now() - this.startTime);
    }

    getDuration(name?: string): number {
        if (name) {
            return this.checkpoints.get(name) || 0;
        }
        return performance.now() - this.startTime;
    }

    getReport(): Record<string, number> {
        const report: Record<string, number> = {};
        this.checkpoints.forEach((duration, name) => {
            report[name] = Math.round(duration);
        });
        report.total = Math.round(this.getDuration());
        return report;
    }

    /**
     * 获取内存使用情况（MB）
     */
    static getMemoryUsage(): {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
    } {
        const mem = process.memoryUsage();
        return {
            rss: Math.round(mem.rss / 1024 / 1024),
            heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
            heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
            external: Math.round(mem.external / 1024 / 1024)
        };
    }
}

