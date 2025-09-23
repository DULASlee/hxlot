// SmartAbp Enterprise Memory Optimization & Cache Management
import { ref, onBeforeUnmount } from 'vue'

/**
 * 内存监控Hook
 */
export interface MemoryInfo {
  /** 已使用内存（MB） */
  usedMemory: number
  /** 总内存（MB） */
  totalMemory: number
  /** 内存使用率（%） */
  memoryUsage: number
  /** 垃圾回收信息 */
  gcInfo?: {
    collections: number
    duration: number
  }
}

export function useMemoryMonitor() {
  const memoryInfo = ref<MemoryInfo>({
    usedMemory: 0,
    totalMemory: 0,
    memoryUsage: 0
  })
  
  const isSupported = ref(false)
  const updateInterval = ref<number | null>(null)

  const updateMemoryInfo = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const used = Math.round(memory.usedJSHeapSize / 1024 / 1024)
      const total = Math.round(memory.totalJSHeapSize / 1024 / 1024)
      
      memoryInfo.value = {
        usedMemory: used,
        totalMemory: total,
        memoryUsage: total > 0 ? Math.round((used / total) * 100) : 0
      }

      // 内存警告
      if (memoryInfo.value.memoryUsage > 80) {
        console.warn(`[Memory Warning] High memory usage: ${memoryInfo.value.memoryUsage}%`)
      }
    }
  }

  const startMonitoring = (interval = 5000) => {
    if ('memory' in performance) {
      isSupported.value = true
      updateMemoryInfo()
      updateInterval.value = window.setInterval(updateMemoryInfo, interval)
    }
  }

  const stopMonitoring = () => {
    if (updateInterval.value) {
      clearInterval(updateInterval.value)
      updateInterval.value = null
    }
  }

  const triggerGC = () => {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc()
      console.log('[Memory] Manual garbage collection triggered')
    } else {
      console.warn('[Memory] Manual GC not available')
    }
  }

  onBeforeUnmount(() => {
    stopMonitoring()
  })

  return {
    memoryInfo,
    isSupported,
    startMonitoring,
    stopMonitoring,
    triggerGC,
    updateMemoryInfo
  }
}

/**
 * 企业级LRU缓存实现
 */
export class LRUCache<K, V> {
  private capacity: number
  private cache = new Map<K, V>()
  private accessOrder = new Set<K>()

  constructor(capacity: number = 1000) {
    this.capacity = capacity
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      // 更新访问顺序
      this.accessOrder.delete(key)
      this.accessOrder.add(key)
      return this.cache.get(key)
    }
    return undefined
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // 更新现有键
      this.cache.set(key, value)
      this.accessOrder.delete(key)
      this.accessOrder.add(key)
    } else {
      // 添加新键
      if (this.cache.size >= this.capacity) {
        // 移除最久未使用的项
        const oldestKey = this.accessOrder.values().next().value
        if (oldestKey !== undefined) {
          this.accessOrder.delete(oldestKey)
          this.cache.delete(oldestKey)
        }
      }
      
      this.cache.set(key, value)
      this.accessOrder.add(key)
    }
  }

  delete(key: K): boolean {
    if (this.cache.has(key)) {
      this.cache.delete(key)
      this.accessOrder.delete(key)
      return true
    }
    return false
  }

  clear(): void {
    this.cache.clear()
    this.accessOrder.clear()
  }

  size(): number {
    return this.cache.size
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  keys(): IterableIterator<K> {
    return this.accessOrder.values()
  }

  values(): IterableIterator<V> {
    return this.cache.values()
  }

  // 获取缓存统计信息
  getStats() {
    return {
      size: this.cache.size,
      capacity: this.capacity,
      utilization: Math.round((this.cache.size / this.capacity) * 100)
    }
  }
}

/**
 * 智能缓存管理Hook
 */
export interface CacheOptions<T> {
  /** 缓存容量 */
  capacity?: number
  /** 缓存过期时间（毫秒） */
  ttl?: number
  /** 存储到localStorage */
  persistent?: boolean
  /** 序列化函数 */
  serialize?: (value: T) => string
  /** 反序列化函数 */
  deserialize?: (value: string) => T
}

interface CacheItem<T> {
  value: T
  timestamp: number
  accessCount: number
}

export function useCache<T>(
  key: string,
  options: CacheOptions<T> = {}
) {
  const {
    capacity = 100,
    ttl = 60 * 60 * 1000, // 1小时
    persistent = false,
    // serialize = JSON.stringify, // 暂时注释未使用变量
    // deserialize = JSON.parse // 暂时注释未使用变量
  } = options

  const cache = new LRUCache<string, CacheItem<T>>(capacity)
  const hitRate = ref(0)
  const totalRequests = ref(0)
  const cacheHits = ref(0)

  // 从localStorage恢复缓存
  const restoreFromStorage = () => {
    if (persistent && typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(`cache_${key}`)
        if (stored) {
          const data = JSON.parse(stored)
          Object.entries(data).forEach(([k, v]: [string, any]) => {
            cache.set(k, v)
          })
        }
      } catch (error) {
        console.error('[Cache] Failed to restore from storage:', error)
      }
    }
  }

  // 保存到localStorage
  const saveToStorage = () => {
    if (persistent && typeof localStorage !== 'undefined') {
      try {
        const data: Record<string, CacheItem<T>> = {}
        for (const [k] of cache.keys()) {
          const item = cache.get(k)
          if (item) {
            data[k] = item
          }
        }
        localStorage.setItem(`cache_${key}`, JSON.stringify(data))
      } catch (error) {
        console.error('[Cache] Failed to save to storage:', error)
      }
    }
  }

  const get = (cacheKey: string): T | null => {
    totalRequests.value++
    
    const item = cache.get(cacheKey)
    if (item) {
      // 检查是否过期
      if (Date.now() - item.timestamp < ttl) {
        item.accessCount++
        cacheHits.value++
        hitRate.value = Math.round((cacheHits.value / totalRequests.value) * 100)
        return item.value
      } else {
        // 过期，删除
        cache.delete(cacheKey)
      }
    }
    
    hitRate.value = Math.round((cacheHits.value / totalRequests.value) * 100)
    return null
  }

  const set = (cacheKey: string, value: T): void => {
    const item: CacheItem<T> = {
      value,
      timestamp: Date.now(),
      accessCount: 1
    }
    
    cache.set(cacheKey, item)
    saveToStorage()
  }

  const remove = (cacheKey: string): boolean => {
    const result = cache.delete(cacheKey)
    if (result) {
      saveToStorage()
    }
    return result
  }

  const clear = (): void => {
    cache.clear()
    cacheHits.value = 0
    totalRequests.value = 0
    hitRate.value = 0
    
    if (persistent && typeof localStorage !== 'undefined') {
      localStorage.removeItem(`cache_${key}`)
    }
  }

  // 缓存统计
  const getStats = () => ({
    ...cache.getStats(),
    hitRate: hitRate.value,
    totalRequests: totalRequests.value,
    cacheHits: cacheHits.value
  })

  // 清理过期缓存
  const cleanup = (): void => {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    for (const cacheKey of cache.keys()) {
      const item = cache.get(cacheKey)
      if (item && now - item.timestamp >= ttl) {
        keysToDelete.push(cacheKey)
      }
    }
    
    keysToDelete.forEach(cacheKey => cache.delete(cacheKey))
    
    if (keysToDelete.length > 0) {
      saveToStorage()
      console.log(`[Cache] Cleaned up ${keysToDelete.length} expired items`)
    }
  }

  // 初始化
  restoreFromStorage()

  // 定期清理
  const cleanupInterval = setInterval(cleanup, 5 * 60 * 1000) // 5分钟

  onBeforeUnmount(() => {
    clearInterval(cleanupInterval)
    saveToStorage()
  })

  return {
    get,
    set,
    remove,
    clear,
    getStats,
    cleanup,
    hitRate,
    totalRequests,
    cacheHits
  }
}

/**
 * 防抖Hook
 */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): [T, () => void] {
  let timer: number | null = null

  const debouncedFn = ((...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer)
    }
    
    timer = window.setTimeout(() => {
      fn.apply(null, args)
      timer = null
    }, delay)
  }) as T

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  onBeforeUnmount(() => {
    cancel()
  })

  return [debouncedFn, cancel]
}

/**
 * 节流Hook
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): [T, () => void] {
  let timer: number | null = null
  let lastArgs: Parameters<T> | null = null

  const throttledFn = ((...args: Parameters<T>) => {
    lastArgs = args
    
    if (timer) return

    timer = window.setTimeout(() => {
      if (lastArgs) {
        fn.apply(null, lastArgs)
        lastArgs = null
      }
      timer = null
    }, delay)
  }) as T

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    lastArgs = null
  }

  onBeforeUnmount(() => {
    cancel()
  })

  return [throttledFn, cancel]
}

/**
 * 对象池管理
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private createFn: () => T
  private resetFn?: (obj: T) => void
  private maxSize: number

  constructor(
    createFn: () => T,
    resetFn?: (obj: T) => void,
    maxSize: number = 50
  ) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.maxSize = maxSize
  }

  get(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.createFn()
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      if (this.resetFn) {
        this.resetFn(obj)
      }
      this.pool.push(obj)
    }
  }

  clear(): void {
    this.pool.length = 0
  }

  size(): number {
    return this.pool.length
  }
}
