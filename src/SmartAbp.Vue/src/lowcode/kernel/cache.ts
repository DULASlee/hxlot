/**
 * 智能缓存管理系统
 * 支持LRU、TTL、内存限制、压缩等高级特性
 */

import type {
  CacheManager as ICacheManager,
  CacheEntry,
  CacheOptions,
  CacheStats,
  CacheMemoryInfo,
  CacheStrategy,
  StructuredLogger
} from './types';

// ============= 缓存策略 =============

/**
 * LRU缓存策略
 */
export class LRUStrategy implements CacheStrategy {
  name = 'LRU';

  shouldEvict(entry: CacheEntry, currentTime: number): boolean {
    // TTL检查
    if (entry.ttl && currentTime - entry.timestamp > entry.ttl) {
      return true;
    }
    return false;
  }

  getEvictionCandidates(
    entries: Map<string, CacheEntry>,
    targetSize: number
  ): string[] {
    const candidates = Array.from(entries.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
      .slice(0, targetSize)
      .map(([key]) => key);

    return candidates;
  }
}

/**
 * LFU缓存策略
 */
export class LFUStrategy implements CacheStrategy {
  name = 'LFU';

  shouldEvict(entry: CacheEntry, currentTime: number): boolean {
    if (entry.ttl && currentTime - entry.timestamp > entry.ttl) {
      return true;
    }
    return false;
  }

  getEvictionCandidates(
    entries: Map<string, CacheEntry>,
    targetSize: number
  ): string[] {
    const candidates = Array.from(entries.entries())
      .sort((a, b) => a[1].accessCount - b[1].accessCount)
      .slice(0, targetSize)
      .map(([key]) => key);

    return candidates;
  }
}

// ============= 缓存管理器 =============

export interface CacheManagerOptions {
  maxMemory?: number; // 最大内存使用量(字节)
  maxEntries?: number; // 最大条目数
  strategy?: CacheStrategy;
  defaultTTL?: number;
  enableCompression?: boolean;
  logger?: StructuredLogger;
}

type RequiredCacheManagerOptions = Required<Omit<CacheManagerOptions, 'logger'>> & {
  logger?: StructuredLogger;
};

export class CacheManager implements ICacheManager {
  private cache = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    size: 0,
    memoryUsage: 0,
    evictions: 0
  };

  private readonly options: RequiredCacheManagerOptions;
  private readonly strategy: CacheStrategy;
  private readonly logger?: StructuredLogger;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(options: CacheManagerOptions = {}) {
    this.options = {
      maxMemory: options.maxMemory ?? 100 * 1024 * 1024, // 100MB
      maxEntries: options.maxEntries ?? 10000,
      strategy: options.strategy ?? new LRUStrategy(),
      defaultTTL: options.defaultTTL ?? 3600000, // 1小时
      enableCompression: options.enableCompression ?? false,
      logger: options.logger
    };

    this.strategy = this.options.strategy;
    this.logger = this.options.logger;

    // 启动定期清理
    this.startCleanup();
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      this.logger?.debug('Cache miss', { key });
      return undefined;
    }

    const currentTime = Date.now();

    // 检查TTL
    if (entry.ttl && currentTime - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      this.updateStats();
      this.logger?.debug('Cache expired', { key, ttl: entry.ttl });
      return undefined;
    }

    // 更新访问信息
    entry.lastAccessed = currentTime;
    entry.accessCount++;

    this.stats.hits++;
    this.updateHitRate();
    this.logger?.debug('Cache hit', { key, accessCount: entry.accessCount });

    return this.deserialize<T>(entry.value);
  }

  set(key: string, value: any, options: CacheOptions = {}): void {
    const currentTime = Date.now();
    const serializedValue = this.serialize(value);
    const size = this.calculateSize(serializedValue);

    const entry: CacheEntry = {
      value: serializedValue,
      timestamp: currentTime,
      lastAccessed: currentTime,
      accessCount: 1,
      ttl: options.ttl || this.options.defaultTTL,
      size,
      metadata: options.metadata || {}
    };

    // 检查是否需要驱逐
    this.ensureCapacity(size);

    this.cache.set(key, entry);
    this.updateStats();

    this.logger?.debug('Cache set', {
      key,
      size,
      ttl: entry.ttl,
      compress: options.compress
    });
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // 检查TTL
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.updateStats();
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const existed = this.cache.delete(key);
    if (existed) {
      this.updateStats();
      this.logger?.debug('Cache delete', { key });
    }
    return existed;
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.updateStats();
    this.logger?.info('Cache cleared', { clearedEntries: size });
  }

  // ============= 高级功能 =============

  mget(keys: string[]): Array<{ key: string; value: any }> {
    const results: Array<{ key: string; value: any }> = [];

    for (const key of keys) {
      const value = this.get(key);
      if (value !== undefined) {
        results.push({ key, value });
      }
    }

    return results;
  }

  mset(entries: Array<{ key: string; value: any; options?: CacheOptions }>): void {
    for (const entry of entries) {
      this.set(entry.key, entry.value, entry.options);
    }
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    let value = this.get<T>(key);

    if (value !== undefined) {
      return value;
    }

    // 防止缓存击穿 - 同一个key的并发请求
    const lockKey = `__lock_${key}`;
    if (this.has(lockKey)) {
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 10));
      value = this.get<T>(key);
      if (value !== undefined) {
        return value;
      }
    }

    try {
      // 设置锁
      this.set(lockKey, true, { ttl: 5000 }); // 5秒锁

      value = await factory();
      this.set(key, value, options);

      return value;
    } finally {
      // 释放锁
      this.delete(lockKey);
    }
  }

  // ============= 标签支持 =============

  /**
   * 根据标签清理缓存
   */
  clearByTags(tags: string[]): number {
    let cleared = 0;
    const tagSet = new Set(tags);

    for (const [key, entry] of this.cache) {
      const entryTags = entry.metadata.tags || [];
      if (entryTags.some((tag: string) => tagSet.has(tag))) {
        this.cache.delete(key);
        cleared++;
      }
    }

    this.updateStats();
    this.logger?.info('Cache cleared by tags', { tags, clearedEntries: cleared });

    return cleared;
  }

  // ============= 统计信息 =============

  getStats(): CacheStats {
    return { ...this.stats };
  }

  getMemoryUsage(): CacheMemoryInfo {
    const used = Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.size, 0);

    return {
      used,
      limit: this.options.maxMemory,
      usage: (used / this.options.maxMemory) * 100,
      entries: this.cache.size
    };
  }

  /**
   * 获取热点数据
   */
  getHotKeys(limit: number = 10): Array<{ key: string; accessCount: number }> {
    return Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, accessCount: entry.accessCount }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);
  }

  // ============= 内部方法 =============

  private ensureCapacity(newEntrySize: number): void {
    const memoryInfo = this.getMemoryUsage();

    // 检查内存限制
    if (memoryInfo.used + newEntrySize > this.options.maxMemory) {
      this.evictByMemory(newEntrySize);
    }

    // 检查条目数限制
    if (this.cache.size >= this.options.maxEntries) {
      this.evictByCount(1);
    }
  }

  private evictByMemory(requiredSpace: number): void {
    const currentTime = Date.now();
    let freedSpace = 0;
    let evicted = 0;

    // 首先清理过期条目
    for (const [key, entry] of this.cache) {
      if (this.strategy.shouldEvict(entry, currentTime)) {
        freedSpace += entry.size;
        this.cache.delete(key);
        evicted++;
      }
    }

    // 如果还不够，使用策略驱逐
    if (freedSpace < requiredSpace) {
      const targetEvictions = Math.ceil(this.cache.size * 0.1); // 驱逐10%
      const candidates = this.strategy.getEvictionCandidates(
        this.cache,
        targetEvictions
      );

      for (const key of candidates) {
        const entry = this.cache.get(key);
        if (entry) {
          freedSpace += entry.size;
          this.cache.delete(key);
          evicted++;

          if (freedSpace >= requiredSpace) break;
        }
      }
    }

    this.stats.evictions += evicted;
    this.logger?.debug('Cache eviction by memory', {
      evicted,
      freedSpace,
      requiredSpace
    });
  }

  private evictByCount(targetEvictions: number): void {
    const candidates = this.strategy.getEvictionCandidates(
      this.cache,
      targetEvictions
    );

    for (const key of candidates) {
      this.cache.delete(key);
    }

    this.stats.evictions += candidates.length;
    this.logger?.debug('Cache eviction by count', {
      evicted: candidates.length
    });
  }

  private updateStats(): void {
    this.stats.size = this.cache.size;
    this.stats.memoryUsage = this.getMemoryUsage().used;
    this.updateHitRate();
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  private serialize(value: any): any {
    if (this.options.enableCompression && typeof value === 'object') {
      // 简单的JSON压缩，实际项目中可以使用更好的压缩算法
      return JSON.stringify(value);
    }
    return value;
  }

  private deserialize<T>(value: any): T {
    if (this.options.enableCompression && typeof value === 'string') {
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    }
    return value as T;
  }

  private calculateSize(value: any): number {
    if (typeof value === 'string') {
      return value.length * 2; // UTF-16
    }
    if (typeof value === 'object') {
      return JSON.stringify(value).length * 2;
    }
    return 8; // 基本类型默认8字节
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 60000); // 每分钟清理一次
  }

  private cleanup(): void {
    const currentTime = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache) {
      if (this.strategy.shouldEvict(entry, currentTime)) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.stats.evictions += cleaned;
      this.updateStats();
      this.logger?.debug('Periodic cleanup', { cleaned });
    }
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
    this.logger?.info('Cache manager destroyed');
  }
}
