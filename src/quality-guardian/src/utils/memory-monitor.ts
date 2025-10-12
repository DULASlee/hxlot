/**
 * 内存监控和清理工具
 * 用于监控代码质量检查器的内存使用情况并主动清理
 */

import { ASTManager } from './ast-manager.js';

export class MemoryMonitor {
    private static instance: MemoryMonitor;
    private readonly warningThreshold = 0.7; // 70%内存使用率警告
    private readonly criticalThreshold = 0.85; // 85%内存使用率强制清理

    private constructor() {}

    public static getInstance(): MemoryMonitor {
        if (!MemoryMonitor.instance) {
            MemoryMonitor.instance = new MemoryMonitor();
        }
        return MemoryMonitor.instance;
    }

    /**
     * 获取当前内存使用情况
     */
    public getMemoryUsage(): {
        heapUsed: number;
        heapTotal: number;
        external: number;
        usagePercent: number;
        usageMB: number;
        totalMB: number;
    } {
        const memUsage = process.memoryUsage();
        const heapUsed = memUsage.heapUsed;
        const heapTotal = memUsage.heapTotal;
        const usagePercent = heapUsed / heapTotal;
        
        return {
            heapUsed,
            heapTotal,
            external: memUsage.external,
            usagePercent,
            usageMB: Math.round(heapUsed / 1024 / 1024),
            totalMB: Math.round(heapTotal / 1024 / 1024)
        };
    }

    /**
     * 检查内存使用并在必要时清理
     * @returns true if memory was cleared
     */
    public checkAndClear(): boolean {
        const usage = this.getMemoryUsage();
        
        if (usage.usagePercent >= this.criticalThreshold) {
            console.warn(`⚠️  内存使用率达到 ${(usage.usagePercent * 100).toFixed(1)}%（${usage.usageMB}MB/${usage.totalMB}MB），强制清理缓存...`);
            this.forceCleanup();
            
            // 触发垃圾回收（如果可用）
            if (global.gc) {
                global.gc();
            }
            
            const afterUsage = this.getMemoryUsage();
            console.log(`✅ 清理完成，当前内存使用: ${afterUsage.usageMB}MB/${afterUsage.totalMB}MB (${(afterUsage.usagePercent * 100).toFixed(1)}%)`);
            return true;
        } else if (usage.usagePercent >= this.warningThreshold) {
            console.warn(`⚠️  内存使用率达到 ${(usage.usagePercent * 100).toFixed(1)}%（${usage.usageMB}MB/${usage.totalMB}MB）`);
        }
        
        return false;
    }

    /**
     * 强制清理所有缓存
     */
    public forceCleanup(): void {
        // 清理AST缓存
        const astManager = ASTManager.getInstance();
        astManager.clearCache();
        
        // 可以添加更多清理逻辑
    }

    /**
     * 打印内存统计信息
     */
    public printStats(): void {
        const usage = this.getMemoryUsage();
        const astStats = ASTManager.getInstance().getCacheStats();
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 内存统计');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`内存使用: ${usage.usageMB}MB / ${usage.totalMB}MB (${(usage.usagePercent * 100).toFixed(1)}%)`);
        console.log(`External: ${Math.round(usage.external / 1024 / 1024)}MB`);
        console.log(`AST缓存: ${astStats.size}/${astStats.maxSize} (命中率: ${astStats.hitRate.toFixed(1)}%)`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    /**
     * 定期检查内存（推荐在长时间运行的任务中使用）
     */
    public startPeriodicCheck(intervalMs: number = 30000): NodeJS.Timeout {
        return setInterval(() => {
            this.checkAndClear();
        }, intervalMs);
    }
}

/**
 * 便捷函数：检查并清理内存
 */
export function checkMemory(): boolean {
    return MemoryMonitor.getInstance().checkAndClear();
}

/**
 * 便捷函数：打印内存统计
 */
export function printMemoryStats(): void {
    MemoryMonitor.getInstance().printStats();
}

/**
 * 便捷函数：强制清理内存
 */
export function forceCleanMemory(): void {
    MemoryMonitor.getInstance().forceCleanup();
}

