/**
 * 缓存管理器 - 性能优化
 * 提供LRU缓存、结果缓存和智能缓存策略
 */

export interface CacheOptions {
  maxSize?: number
  ttl?: number // 缓存生存时间（毫秒）
  onEvict?: (key: string, value: any) => void
}

export interface CacheEntry<T> {
  value: T
  timestamp: number
  accessCount: number
}

/**
 * LRU (Least Recently Used) 缓存实现
 */
export class LRUCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>()
  private maxSize: number
  private ttl: number
  private onEvict?: (key: string, value: T) => void

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100
    this.ttl = options.ttl || 5 * 60 * 1000 // 默认5分钟
    this.onEvict = options.onEvict
  }

  /**
   * 获取缓存值
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return undefined
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.ttl) {
      this.delete(key)
      return undefined
    }

    // 更新访问计数
    entry.accessCount++
    
    // 移到最后（LRU策略）
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.value
  }

  /**
   * 设置缓存值
   */
  set(key: string, value: T): void {
    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      const firstEntry = this.cache.get(firstKey)
      
      if (this.onEvict && firstEntry) {
        this.onEvict(firstKey, firstEntry.value)
      }
      
      this.cache.delete(firstKey)
    }

    // 添加新项
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 0
    })
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (entry && this.onEvict) {
      this.onEvict(key, entry.value)
    }
    
    return this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    if (this.onEvict) {
      this.cache.forEach((entry, key) => {
        this.onEvict!(key, entry.value)
      })
    }
    
    this.cache.clear()
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    let totalAccess = 0
    let oldestTimestamp = Date.now()
    let newestTimestamp = 0

    this.cache.forEach(entry => {
      totalAccess += entry.accessCount
      oldestTimestamp = Math.min(oldestTimestamp, entry.timestamp)
      newestTimestamp = Math.max(newestTimestamp, entry.timestamp)
    })

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalAccess,
      averageAccess: this.cache.size > 0 ? totalAccess / this.cache.size : 0,
      oldestAge: Date.now() - oldestTimestamp,
      newestAge: Date.now() - newestTimestamp
    }
  }
}

/**
 * 函数结果缓存装饰器
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: CacheOptions = {}
): T {
  const cache = new LRUCache<ReturnType<T>>(options)

  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args)
    
    let result = cache.get(key)
    
    if (result === undefined) {
      result = fn.apply(this, args)
      cache.set(key, result)
    }

    return result
  } as T
}

/**
 * 异步函数结果缓存
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: CacheOptions = {}
): T {
  const cache = new LRUCache<Promise<ReturnType<T>>>(options)
  const pending = new Map<string, Promise<ReturnType<T>>>()

  return async function (this: any, ...args: Parameters<T>): Promise<ReturnType<T>> {
    const key = JSON.stringify(args)
    
    // 检查缓存
    let result = cache.get(key)
    if (result !== undefined) {
      return result
    }

    // 检查是否正在执行
    if (pending.has(key)) {
      return pending.get(key)!
    }

    // 执行函数
    const promise = fn.apply(this, args)
    pending.set(key, promise)

    try {
      const value = await promise
      cache.set(key, Promise.resolve(value))
      return value
    } finally {
      pending.delete(key)
    }
  } as T
}

/**
 * 创建全局缓存管理器实例
 */
export const createCacheManager = () => {
  const caches = new Map<string, LRUCache>()

  return {
    /**
     * 获取或创建缓存
     */
    getCache<T = any>(name: string, options?: CacheOptions): LRUCache<T> {
      if (!caches.has(name)) {
        caches.set(name, new LRUCache<T>(options))
      }
      return caches.get(name) as LRUCache<T>
    },

    /**
     * 删除缓存
     */
    deleteCache(name: string): boolean {
      const cache = caches.get(name)
      if (cache) {
        cache.clear()
        return caches.delete(name)
      }
      return false
    },

    /**
     * 清空所有缓存
     */
    clearAll(): void {
      caches.forEach(cache => cache.clear())
      caches.clear()
    },

    /**
     * 获取所有缓存统计信息
     */
    getAllStats() {
      const stats: Record<string, any> = {}
      caches.forEach((cache, name) => {
        stats[name] = cache.getStats()
      })
      return stats
    }
  }
}

// 导出全局缓存管理器单例
export const globalCacheManager = createCacheManager()
