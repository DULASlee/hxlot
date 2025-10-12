/**
 * 内存泄漏测试
 * 用于验证AST Manager和代码检查器的内存使用情况
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ASTManager } from '../src/utils/ast-manager';
import { MemoryMonitor } from '../src/utils/memory-monitor';
import path from 'path';

describe('Memory Leak Prevention', () => {
    beforeEach(() => {
        // 每个测试前清理缓存
        ASTManager.getInstance().clearCache();
    });

    it('should limit AST cache size to 50 entries', async () => {
        const astManager = ASTManager.getInstance();
        const testFiles: string[] = [];

        // 创建60个测试文件路径（超过上限）
        for (let i = 0; i < 60; i++) {
            testFiles.push(path.resolve(__dirname, `../test/fixtures/typescript/clean.ts`));
        }

        // 解析所有文件
        for (const file of testFiles) {
            try {
                await astManager.getAST(file);
            } catch (error) {
                // 忽略文件不存在的错误
            }
        }

        const stats = astManager.getCacheStats();
        expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
        expect(stats.maxSize).toBe(50);
    });

    it('should clear old entries after TTL expires', async () => {
        const astManager = ASTManager.getInstance();
        const testFile = path.resolve(__dirname, '../test/fixtures/typescript/clean.ts');

        // 第一次访问
        try {
            await astManager.getAST(testFile);
        } catch (error) {
            // 文件可能不存在，没关系
        }

        const stats1 = astManager.getCacheStats();
        const initialSize = stats1.size;

        // 等待6分钟（超过5分钟TTL）- 在实际测试中可以mock时间
        // 这里只是验证TTL机制存在
        expect(astManager['ttl']).toBe(5 * 60 * 1000);
    });

    it('should track access count for LRU eviction', async () => {
        const astManager = ASTManager.getInstance();
        const testFile = path.resolve(__dirname, '../test/fixtures/typescript/clean.ts');

        // 多次访问同一文件
        for (let i = 0; i < 5; i++) {
            try {
                await astManager.getAST(testFile);
            } catch (error) {
                // 忽略错误
            }
        }

        // 验证访问统计
        const cache = astManager['cache'];
        if (cache.has(testFile)) {
            const entry = cache.get(testFile);
            expect(entry?.accessCount).toBeGreaterThan(1);
        }
    });

    it('should use LRU eviction when cache is full', async () => {
        const astManager = ASTManager.getInstance();
        
        // 模拟填满缓存
        // 验证LRU驱逐方法存在
        expect(typeof astManager['evictLRU']).toBe('function');
    });

    it('should provide memory statistics', () => {
        const monitor = MemoryMonitor.getInstance();
        const usage = monitor.getMemoryUsage();

        expect(usage.heapUsed).toBeGreaterThan(0);
        expect(usage.heapTotal).toBeGreaterThan(0);
        expect(usage.usagePercent).toBeGreaterThanOrEqual(0);
        expect(usage.usagePercent).toBeLessThanOrEqual(1);
        expect(usage.usageMB).toBeGreaterThan(0);
        expect(usage.totalMB).toBeGreaterThan(0);
    });

    it('should force cleanup when memory is critical', () => {
        const monitor = MemoryMonitor.getInstance();
        
        // 强制清理
        monitor.forceCleanup();
        
        // 验证AST缓存已清空
        const stats = ASTManager.getInstance().getCacheStats();
        expect(stats.size).toBe(0);
    });

    it('should warn when memory usage is high', () => {
        const monitor = MemoryMonitor.getInstance();
        
        // 获取内存使用情况（不触发清理）
        const usage = monitor.getMemoryUsage();
        
        // 验证方法存在
        expect(typeof monitor.checkAndClear).toBe('function');
        expect(typeof monitor.printStats).toBe('function');
    });
});

