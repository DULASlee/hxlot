/**
 * 内存管理器
 */

export class MemoryManager {
    private maxMemoryMB: number;
    private checkInterval: NodeJS.Timeout | null = null;

    constructor(maxMemoryMB: number = 1024) {
        this.maxMemoryMB = maxMemoryMB;
    }

    /**
     * 获取当前内存使用（MB）
     */
    getCurrentMemoryMB(): number {
        const usage = process.memoryUsage();
        return Math.round(usage.heapUsed / 1024 / 1024);
    }

    /**
     * 检查内存是否超限
     */
    isMemoryExceeded(): boolean {
        return this.getCurrentMemoryMB() > this.maxMemoryMB;
    }

    /**
     * 强制垃圾回收（如果可用）
     */
    forceGC(): void {
        if (global.gc) {
            global.gc();
        }
    }

    /**
     * 启动内存监控
     */
    startMonitoring(callback: (memoryMB: number) => void): void {
        this.checkInterval = setInterval(() => {
            const memoryMB = this.getCurrentMemoryMB();
            if (memoryMB > this.maxMemoryMB * 0.9) {
                this.forceGC();
            }
            callback(memoryMB);
        }, 5000);
    }

    /**
     * 停止内存监控
     */
    stopMonitoring(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    /**
     * 清理资源
     */
    cleanup(): void {
        this.stopMonitoring();
        this.forceGC();
    }
}

