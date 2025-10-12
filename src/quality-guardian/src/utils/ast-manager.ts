import { TSESTree } from '@typescript-eslint/typescript-estree';
import fs from 'fs/promises';
import { parse } from '@typescript-eslint/typescript-estree';

interface CacheEntry {
    content: string;
    ast: TSESTree.Program;
    timestamp: number;
    accessCount: number;
    lastAccess: number;
}

/**
 * ASTManager - 内存优化的AST缓存管理器
 * 
 * 优化策略：
 * 1. LRU驱逐策略 - 保留最近使用的条目
 * 2. 缓存上限控制 - 最多缓存50个AST（约50-100MB）
 * 3. 短TTL - 5分钟缓存时间，避免长时间占用内存
 * 4. 主动清理 - 每次操作后检查内存使用
 */
export class ASTManager {
    private static instance: ASTManager;
    private readonly cache: Map<string, CacheEntry> = new Map();
    private readonly ttl: number = 5 * 60 * 1000; // 5 minutes (降低到5分钟)
    private readonly maxCacheSize: number = 50; // 最多缓存50个AST（约50-100MB）

    private constructor() {}

    public static getInstance(): ASTManager {
        if (!ASTManager.instance) {
            ASTManager.instance = new ASTManager();
        }
        return ASTManager.instance;
    }

    public async getAST(filePath: string): Promise<{ content: string; ast: TSESTree.Program }> {
        const stats = await fs.stat(filePath).catch(() => null);
        if (!stats) {
            throw new Error(`File not found: ${filePath}`);
        }

        const cached = this.cache.get(filePath);
        if (cached && cached.timestamp >= stats.mtimeMs) {
            // 更新访问统计（LRU）
            cached.accessCount++;
            cached.lastAccess = Date.now();
            return { content: cached.content, ast: cached.ast };
        }

        const content = await fs.readFile(filePath, 'utf8');
        const ast = parse(content, {
            loc: true,
            comment: true,
            errorOnUnknownASTType: false,
            useJSXTextNode: true,
        });

        // 缓存前先检查是否超过上限
        if (this.cache.size >= this.maxCacheSize) {
            this.evictLRU();
        }

        this.cache.set(filePath, { 
            content, 
            ast, 
            timestamp: stats.mtimeMs,
            accessCount: 1,
            lastAccess: Date.now()
        });

        // 每10次操作清理一次过期条目
        if (this.cache.size % 10 === 0) {
            this.pruneCache();
        }

        return { content, ast };
    }

    /**
     * LRU驱逐策略 - 驱逐最少使用的条目
     */
    private evictLRU(): void {
        let oldestKey: string | null = null;
        let oldestAccess = Date.now();

        for (const [key, value] of this.cache.entries()) {
            if (value.lastAccess < oldestAccess) {
                oldestAccess = value.lastAccess;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }

    /**
     * 清理过期条目
     */
    private pruneCache(): void {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.lastAccess > this.ttl) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * 清空所有缓存（用于测试或内存紧张时）
     */
    public clearCache(): void {
        this.cache.clear();
    }

    /**
     * 获取缓存统计信息（用于调试）
     */
    public getCacheStats(): { size: number; maxSize: number; hitRate: number } {
        let totalAccess = 0;
        for (const entry of this.cache.values()) {
            totalAccess += entry.accessCount;
        }
        const avgAccessCount = this.cache.size > 0 ? totalAccess / this.cache.size : 0;
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            hitRate: avgAccessCount > 1 ? ((avgAccessCount - 1) / avgAccessCount) * 100 : 0
        };
    }
}
