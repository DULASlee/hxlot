/**
 * 🔄 统一缓存管理系统
 * SmartAbp低代码引擎 - P0级架构优化
 * 
 * 核心功能:
 * - 统一管理所有缓存命名空间
 * - LRU算法的智能缓存淘汰
 * - 内存使用限制和自动清理
 * - 缓存性能监控和统计
 * - 支持TTL和条件失效
 */

export type CacheStrategy = 'lru' | 'lfu' | 'fifo' | 'ttl';
export type SerializationMethod = 'json' | 'custom' | 'none';

/**
 * 缓存项接口
 */
export interface CacheItem<T = any> {
  /** 缓存值 */
  value: T;
  /** 创建时间 */
  createdAt: number;
  /** 最后访问时间 */
  lastAccessedAt: number;
  /** 访问次数 */
  accessCount: number;
  /** 过期时间 */
  expiresAt?: number;
  /** 缓存大小（字节） */
  size: number;
  /** 缓存标签 */
  tags: Set<string>;
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 最大缓存项数量 */
  maxItems: number;
  /** 最大内存使用（字节） */
  maxMemory: number;
  /** 缓存策略 */
  strategy: CacheStrategy;
  /** 默认TTL（毫秒） */
  defaultTTL?: number;
  /** 序列化方法 */
  serialization: SerializationMethod;
  /** 是否启用统计 */
  enableStats: boolean;
  /** 清理间隔（毫秒） */
  cleanupInterval: number;
}

/**
 * 缓存统计
 */
export interface CacheStats {
  /** 缓存命中次数 */
  hits: number;
  /** 缓存未命中次数 */
  misses: number;
  /** 命中率 */
  hitRate: number;
  /** 总缓存项数 */
  itemCount: number;
  /** 内存使用（字节） */
  memoryUsage: number;
  /** 清理次数 */
  cleanupCount: number;
  /** 最后清理时间 */
  lastCleanupTime: number;
  /** 缓存操作统计 */
  operations: {
    get: number;
    set: number;
    delete: number;
    clear: number;
  };
}

/**
 * 缓存事件
 */
export interface CacheEvents {
  'item:created': { namespace: string; key: string; size: number };
  'item:accessed': { namespace: string; key: string; accessCount: number };
  'item:updated': { namespace: string; key: string; oldSize: number; newSize: number };
  'item:expired': { namespace: string; key: string; expiredAt: number };
  'item:evicted': { namespace: string; key: string; reason: string };
  'cleanup:completed': { namespace: string; itemsRemoved: number; memoryFreed: number };
  'memory:pressure': { namespace: string; usagePercentage: number };
}

/**
 * 🔄 缓存命名空间
 */
class CacheNamespace<T = any> {
  private items = new Map<string, CacheItem<T>>();
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupTimer?: ReturnType<typeof setInterval>;
  private eventEmitter: (event: string, data: any) => void;

  constructor(
    public readonly name: string,
    config: Partial<CacheConfig>,
    eventEmitter: (event: string, data: any) => void
  ) {
    this.config = {
      maxItems: 100,
      maxMemory: 10 * 1024 * 1024, // 10MB
      strategy: 'lru',
      serialization: 'json',
      enableStats: true,
      cleanupInterval: 60000, // 1分钟
      ...config
    };

    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      itemCount: 0,
      memoryUsage: 0,
      cleanupCount: 0,
      lastCleanupTime: 0,
      operations: {
        get: 0,
        set: 0,
        delete: 0,
        clear: 0
      }
    };

    this.eventEmitter = eventEmitter;
    this.startCleanupTimer();
  }

  /**
   * 获取缓存项
   */
  get(key: string): T | undefined {
    this.stats.operations.get++;

    const item = this.items.get(key);
    if (!item) {
      this.stats.misses++;
      this.updateHitRate();
      return undefined;
    }

    // 检查过期
    if (this.isExpired(item)) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      this.eventEmitter('item:expired', { 
        namespace: this.name, 
        key, 
        expiredAt: item.expiresAt! 
      });
      return undefined;
    }

    // 更新访问信息
    item.lastAccessedAt = Date.now();
    item.accessCount++;

    this.stats.hits++;
    this.updateHitRate();

    this.eventEmitter('item:accessed', { 
      namespace: this.name, 
      key, 
      accessCount: item.accessCount 
    });

    return item.value;
  }

  /**
   * 设置缓存项
   */
  set(key: string, value: T, ttl?: number, tags?: string[]): void {
    this.stats.operations.set++;

    const size = this.calculateSize(value);
    const now = Date.now();
    const expiresAt = ttl ? now + ttl : 
      (this.config.defaultTTL ? now + this.config.defaultTTL : undefined);

    const newItem: CacheItem<T> = {
      value,
      createdAt: now,
      lastAccessedAt: now,
      accessCount: 1,
      expiresAt,
      size,
      tags: new Set(tags || [])
    };

    const existingItem = this.items.get(key);
    
    // 检查内存限制
    const additionalMemory = size - (existingItem?.size || 0);
    if (this.stats.memoryUsage + additionalMemory > this.config.maxMemory) {
      this.evictItems(additionalMemory);
    }

    // 检查项数限制
    if (!existingItem && this.items.size >= this.config.maxItems) {
      this.evictItems(0, 1);
    }

    // 设置新项
    this.items.set(key, newItem);
    
    // 更新统计
    if (existingItem) {
      this.stats.memoryUsage += additionalMemory;
      this.eventEmitter('item:updated', { 
        namespace: this.name, 
        key, 
        oldSize: existingItem.size, 
        newSize: size 
      });
    } else {
      this.stats.itemCount++;
      this.stats.memoryUsage += size;
      this.eventEmitter('item:created', { 
        namespace: this.name, 
        key, 
        size 
      });
    }
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    this.stats.operations.delete++;

    const item = this.items.get(key);
    if (!item) return false;

    this.items.delete(key);
    this.stats.itemCount--;
    this.stats.memoryUsage -= item.size;

    return true;
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.stats.operations.clear++;

    const itemCount = this.items.size;
    const memoryUsage = this.stats.memoryUsage;

    this.items.clear();
    this.stats.itemCount = 0;
    this.stats.memoryUsage = 0;

    console.log(`🗑️ 清空缓存命名空间: ${this.name} (${itemCount}项, ${(memoryUsage / 1024 / 1024).toFixed(2)}MB)`);
  }

  /**
   * 检查缓存项是否存在
   */
  has(key: string): boolean {
    const item = this.items.get(key);
    if (!item) return false;
    
    if (this.isExpired(item)) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    this.cleanupExpired();
    return Array.from(this.items.keys());
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    this.cleanupExpired();
    return this.items.size;
  }

  /**
   * 根据标签删除
   */
  deleteByTag(tag: string): number {
    let deletedCount = 0;
    
    for (const [key, item] of this.items) {
      if (item.tags.has(tag)) {
        this.delete(key);
        deletedCount++;
      }
    }

    console.log(`🏷️ 根据标签删除缓存: ${tag} (${deletedCount}项)`);
    return deletedCount;
  }

  /**
   * 根据条件删除
   */
  deleteWhere(predicate: (key: string, item: CacheItem<T>) => boolean): number {
    let deletedCount = 0;
    
    for (const [key, item] of this.items) {
      if (predicate(key, item)) {
        this.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * 获取统计信息
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 获取配置
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 如果内存限制降低，触发清理
    if (newConfig.maxMemory && this.stats.memoryUsage > newConfig.maxMemory) {
      this.evictItems(this.stats.memoryUsage - newConfig.maxMemory);
    }
    
    // 如果项数限制降低，触发清理
    if (newConfig.maxItems && this.stats.itemCount > newConfig.maxItems) {
      this.evictItems(0, this.stats.itemCount - newConfig.maxItems);
    }
  }

  /**
   * 清理命名空间
   */
  cleanup(): void {
    const beforeCount = this.items.size;
    const beforeMemory = this.stats.memoryUsage;

    this.cleanupExpired();
    
    const afterCount = this.items.size;
    const afterMemory = this.stats.memoryUsage;
    
    const itemsRemoved = beforeCount - afterCount;
    const memoryFreed = beforeMemory - afterMemory;

    this.stats.cleanupCount++;
    this.stats.lastCleanupTime = Date.now();

    if (itemsRemoved > 0) {
      console.log(`🧹 清理命名空间 ${this.name}: 移除 ${itemsRemoved} 项, 释放 ${(memoryFreed / 1024).toFixed(2)}KB`);
      
      this.eventEmitter('cleanup:completed', { 
        namespace: this.name, 
        itemsRemoved, 
        memoryFreed 
      });
    }
  }

  /**
   * 销毁命名空间
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
    console.log(`🗑️ 销毁缓存命名空间: ${this.name}`);
  }

  // ========== 私有方法 ==========

  /**
   * 检查项是否过期
   */
  private isExpired(item: CacheItem<T>): boolean {
    if (!item.expiresAt) return false;
    return Date.now() > item.expiresAt;
  }

  /**
   * 清理过期项
   */
  private cleanupExpired(): void {
    const expiredKeys: string[] = [];
    
    for (const [key, item] of this.items) {
      if (this.isExpired(item)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.delete(key);
      this.eventEmitter('item:expired', { 
        namespace: this.name, 
        key, 
        expiredAt: Date.now() 
      });
    });
  }

  /**
   * 驱逐缓存项
   */
  private evictItems(memoryToFree: number, itemsToRemove = 0): void {
    const itemsArray = Array.from(this.items.entries());
    
    // 根据策略排序
    switch (this.config.strategy) {
      case 'lru':
        itemsArray.sort(([, a], [, b]) => a.lastAccessedAt - b.lastAccessedAt);
        break;
      case 'lfu':
        itemsArray.sort(([, a], [, b]) => a.accessCount - b.accessCount);
        break;
      case 'fifo':
        itemsArray.sort(([, a], [, b]) => a.createdAt - b.createdAt);
        break;
      case 'ttl':
        itemsArray.sort(([, a], [, b]) => {
          const aExpires = a.expiresAt || Infinity;
          const bExpires = b.expiresAt || Infinity;
          return aExpires - bExpires;
        });
        break;
    }

    let memoryFreed = 0;
    let itemsRemoved = 0;

    for (const [key, item] of itemsArray) {
      if ((memoryToFree > 0 && memoryFreed < memoryToFree) || 
          (itemsToRemove > 0 && itemsRemoved < itemsToRemove)) {
        
        this.items.delete(key);
        this.stats.itemCount--;
        this.stats.memoryUsage -= item.size;
        
        memoryFreed += item.size;
        itemsRemoved++;

        this.eventEmitter('item:evicted', { 
          namespace: this.name, 
          key, 
          reason: this.config.strategy 
        });
      } else {
        break;
      }
    }

    if (itemsRemoved > 0) {
      console.log(`⚡ 驱逐缓存项: ${itemsRemoved}项, 释放 ${(memoryFreed / 1024).toFixed(2)}KB`);
    }
  }

  /**
   * 计算缓存项大小
   */
  private calculateSize(value: T): number {
    try {
      switch (this.config.serialization) {
        case 'json':
          return new Blob([JSON.stringify(value)]).size;
        case 'none':
          // 简单估算
          if (typeof value === 'string') return value.length * 2;
          if (typeof value === 'number') return 8;
          if (typeof value === 'boolean') return 4;
          if (Array.isArray(value)) return value.length * 8;
          return 100; // 对象默认估算
        case 'custom':
          // 自定义序列化，这里简化处理
          return JSON.stringify(value).length * 2;
        default:
          return 100;
      }
    } catch {
      return 100; // 默认大小
    }
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const totalRequests = this.stats.hits + this.stats.misses;
    this.stats.hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
      
      // 检查内存压力
      const usagePercentage = (this.stats.memoryUsage / this.config.maxMemory) * 100;
      if (usagePercentage > 80) {
        this.eventEmitter('memory:pressure', { 
          namespace: this.name, 
          usagePercentage 
        });
      }
    }, this.config.cleanupInterval);
  }
}

/**
 * 🔄 统一缓存管理器
 */
export class UnifiedCacheManager {
  private static instance: UnifiedCacheManager;
  private namespaces = new Map<string, CacheNamespace>();
  private eventListeners = new Map<string, Set<Function>>();
  private globalStats = {
    totalNamespaces: 0,
    totalItems: 0,
    totalMemoryUsage: 0,
    globalHitRate: 0
  };

  private constructor() {
    // 注册全局清理
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.destroy();
      });
    }
  }

  static getInstance(): UnifiedCacheManager {
    if (!UnifiedCacheManager.instance) {
      UnifiedCacheManager.instance = new UnifiedCacheManager();
    }
    return UnifiedCacheManager.instance;
  }

  /**
   * 获取缓存命名空间
   */
  getCache<T = any>(namespace: string, config?: Partial<CacheConfig>): CacheNamespace<T> {
    if (!this.namespaces.has(namespace)) {
      const cache = new CacheNamespace<T>(
        namespace, 
        config || {}, 
        (event, data) => this.emitEvent(event, data)
      );
      
      this.namespaces.set(namespace, cache);
      this.globalStats.totalNamespaces++;
      
      console.log(`📦 创建缓存命名空间: ${namespace}`);
    }

    return this.namespaces.get(namespace) as CacheNamespace<T>;
  }

  /**
   * 删除缓存命名空间
   */
  deleteCache(namespace: string): boolean {
    const cache = this.namespaces.get(namespace);
    if (!cache) return false;

    cache.destroy();
    this.namespaces.delete(namespace);
    this.globalStats.totalNamespaces--;
    
    console.log(`🗑️ 删除缓存命名空间: ${namespace}`);
    return true;
  }

  /**
   * 获取所有命名空间
   */
  getNamespaces(): string[] {
    return Array.from(this.namespaces.keys());
  }

  /**
   * 全局清理
   */
  globalCleanup(): void {
    console.log('🧹 执行全局缓存清理...');
    
    let totalItemsRemoved = 0;
    let totalMemoryFreed = 0;

    this.namespaces.forEach(cache => {
      const beforeStats = cache.getStats();
      cache.cleanup();
      const afterStats = cache.getStats();
      
      totalItemsRemoved += beforeStats.itemCount - afterStats.itemCount;
      totalMemoryFreed += beforeStats.memoryUsage - afterStats.memoryUsage;
    });

    this.updateGlobalStats();
    
    console.log(`✅ 全局清理完成: 移除 ${totalItemsRemoved} 项, 释放 ${(totalMemoryFreed / 1024 / 1024).toFixed(2)}MB`);
  }

  /**
   * 获取全局统计
   */
  getGlobalStats(): typeof UnifiedCacheManager.prototype.globalStats {
    this.updateGlobalStats();
    return { ...this.globalStats };
  }

  /**
   * 获取详细报告
   */
  getDetailedReport(): {
    globalStats: typeof UnifiedCacheManager.prototype.globalStats;
    namespaces: { name: string; stats: CacheStats; config: CacheConfig }[];
  } {
    const namespaces = Array.from(this.namespaces.entries()).map(([name, cache]) => ({
      name,
      stats: cache.getStats(),
      config: cache.getConfig()
    }));

    return {
      globalStats: this.getGlobalStats(),
      namespaces
    };
  }

  /**
   * 内存压力释放
   */
  releaseMemoryPressure(targetPercentage = 50): void {
    console.log(`🆘 释放内存压力，目标: ${targetPercentage}%`);
    
    const sortedCaches = Array.from(this.namespaces.entries())
      .map(([name, cache]) => ({ name, cache, stats: cache.getStats() }))
      .sort((a, b) => b.stats.memoryUsage - a.stats.memoryUsage);

    for (const { name, cache, stats } of sortedCaches) {
      const currentUsage = (stats.memoryUsage / cache.getConfig().maxMemory) * 100;
      
      if (currentUsage > targetPercentage) {
        // 计算需要删除的项目数量
        Math.ceil(stats.itemCount * (currentUsage - targetPercentage) / 100);
        cache.deleteWhere(() => true); // 简化实现，实际应该根据策略删除
        
        console.log(`🗑️ 命名空间 ${name}: 释放内存压力`);
      }
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    console.log('🗑️ 销毁统一缓存管理器...');
    
    this.namespaces.forEach((cache) => {
      cache.destroy();
    });
    
    this.namespaces.clear();
    this.eventListeners.clear();
    
    this.globalStats = {
      totalNamespaces: 0,
      totalItems: 0,
      totalMemoryUsage: 0,
      globalHitRate: 0
    };

    console.log('✅ 统一缓存管理器已销毁');
  }

  // ========== 事件系统 ==========

  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`缓存事件处理器错误 [${event}]:`, error);
        }
      });
    }
  }

  // ========== 私有方法 ==========

  /**
   * 更新全局统计
   */
  private updateGlobalStats(): void {
    let totalItems = 0;
    let totalMemoryUsage = 0;
    let totalHits = 0;
    let totalMisses = 0;

    this.namespaces.forEach(cache => {
      const stats = cache.getStats();
      totalItems += stats.itemCount;
      totalMemoryUsage += stats.memoryUsage;
      totalHits += stats.hits;
      totalMisses += stats.misses;
    });

    this.globalStats = {
      totalNamespaces: this.namespaces.size,
      totalItems,
      totalMemoryUsage,
      globalHitRate: totalHits + totalMisses > 0 ? totalHits / (totalHits + totalMisses) : 0
    };
  }
}

/**
 * 工厂函数：获取统一缓存管理器
 */
export function getUnifiedCacheManager(): UnifiedCacheManager {
  return UnifiedCacheManager.getInstance();
}

/**
 * 快捷函数：获取缓存
 */
export function getCache<T = any>(namespace: string, config?: Partial<CacheConfig>): CacheNamespace<T> {
  return getUnifiedCacheManager().getCache<T>(namespace, config);
}

/**
 * 快捷函数：全局缓存清理
 */
export function globalCacheCleanup(): void {
  getUnifiedCacheManager().globalCleanup();
}

/**
 * 快捷函数：获取缓存报告
 */
export function getCacheReport(): ReturnType<UnifiedCacheManager['getDetailedReport']> {
  return getUnifiedCacheManager().getDetailedReport();
}
