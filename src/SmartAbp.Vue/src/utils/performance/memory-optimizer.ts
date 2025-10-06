/**
 * SmartAbp Enterprise Memory Optimizer
 * Phoenix计划 Week 2 - 内存优化增强
 * 
 * 功能：
 * 1. WeakMap/WeakSet智能缓存
 * 2. 内存泄漏自动检测
 * 3. 定期垃圾回收触发
 * 4. 内存使用监控和告警
 * 5. 对象池（Object Pool）
 */

import { onBeforeUnmount, ref } from 'vue'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface MemoryMetrics {
  /** 已使用内存 (MB) */
  usedMemory: number
  /** 总内存 (MB) */
  totalMemory: number
  /** 内存使用率 (%) */
  usagePercentage: number
  /** 内存增长率 (MB/s) */
  growthRate: number
  /** 是否存在泄漏风险 */
  leakRisk: boolean
}

interface MemoryOptimizerOptions {
  /** 监控间隔 (ms) */
  monitorInterval?: number
  /** 内存告警阈值 (%) */
  warningThreshold?: number
  /** 内存危险阈值 (%) */
  criticalThreshold?: number
  /** 自动GC阈值 (%) */
  autoGCThreshold?: number
  /** 启用泄漏检测 */
  enableLeakDetection?: boolean
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 增强型WeakMap缓存
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 带统计的WeakMap缓存
 */
export class SmartWeakMapCache<K extends object, V> {
  private cache = new WeakMap<K, V>()
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      this.stats.hits++
    } else {
      this.stats.misses++
    }
    return value
  }

  set(key: K, value: V): void {
    this.cache.set(key, value)
    this.stats.sets++
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses
    return {
      ...this.stats,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0
    }
  }

  resetStats() {
    this.stats = { hits: 0, misses: 0, sets: 0 }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 对象池（Object Pool）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 对象池（减少GC压力）
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private factory: () => T
  private reset: (obj: T) => void
  private maxSize: number

  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    maxSize = 100
  ) {
    this.factory = factory
    this.reset = reset
    this.maxSize = maxSize
  }

  /**
   * 获取对象
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.factory()
  }

  /**
   * 释放对象
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj)
      this.pool.push(obj)
    }
  }

  /**
   * 清空池
   */
  clear(): void {
    this.pool = []
  }

  /**
   * 获取池大小
   */
  size(): number {
    return this.pool.length
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 内存优化器
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useMemoryOptimizer(options: MemoryOptimizerOptions = {}) {
  const {
    monitorInterval = 3000,
    warningThreshold = 70,
    criticalThreshold = 90,
    autoGCThreshold = 85,
    enableLeakDetection = true
  } = options

  const metrics = ref<MemoryMetrics>({
    usedMemory: 0,
    totalMemory: 0,
    usagePercentage: 0,
    growthRate: 0,
    leakRisk: false
  })

  let monitorTimer: ReturnType<typeof setInterval> | null = null
  let lastMemory = 0
  let lastCheckTime = 0
  const memoryHistory: number[] = []
  const maxHistorySize = 20

  /**
   * 获取内存信息
   */
  function getMemoryInfo(): MemoryMetrics {
    if (typeof performance === 'undefined' || !performance.memory) {
      return {
        usedMemory: 0,
        totalMemory: 0,
        usagePercentage: 0,
        growthRate: 0,
        leakRisk: false
      }
    }

    const memory = performance.memory
    const usedMemory = memory.usedJSHeapSize / 1048576 // MB
    const totalMemory = memory.totalJSHeapSize / 1048576 // MB
    const usagePercentage = (usedMemory / totalMemory) * 100

    // 计算增长率
    const now = performance.now()
    const timeDelta = (now - lastCheckTime) / 1000 // seconds
    const memoryDelta = usedMemory - lastMemory
    const growthRate = timeDelta > 0 ? memoryDelta / timeDelta : 0

    lastMemory = usedMemory
    lastCheckTime = now

    // 内存泄漏检测
    const leakRisk = detectMemoryLeak(usedMemory)

    return {
      usedMemory: Math.round(usedMemory * 100) / 100,
      totalMemory: Math.round(totalMemory * 100) / 100,
      usagePercentage: Math.round(usagePercentage * 100) / 100,
      growthRate: Math.round(growthRate * 1000) / 1000,
      leakRisk
    }
  }

  /**
   * 检测内存泄漏
   */
  function detectMemoryLeak(currentMemory: number): boolean {
    if (!enableLeakDetection) return false

    memoryHistory.push(currentMemory)
    if (memoryHistory.length > maxHistorySize) {
      memoryHistory.shift()
    }

    if (memoryHistory.length < maxHistorySize) {
      return false
    }

    // 分析趋势：如果内存持续增长，可能存在泄漏
    let consecutiveGrowth = 0
    for (let i = 1; i < memoryHistory.length; i++) {
      if (memoryHistory[i] > memoryHistory[i - 1]) {
        consecutiveGrowth++
      } else {
        consecutiveGrowth = 0
      }
    }

    // 如果连续增长超过15次，标记为泄漏风险
    return consecutiveGrowth >= 15
  }

  /**
   * 触发垃圾回收（仅Chrome DevTools可用）
   */
  function triggerGC(): boolean {
    if (typeof window.gc === 'function') {
      console.log('[Memory Optimizer] 🗑️ 触发手动GC')
      window.gc()
      return true
    }

    console.warn('[Memory Optimizer] ⚠️ Manual GC not available. Enable --js-flags="--expose-gc" in Chrome')
    return false
  }

  /**
   * 启动监控
   */
  function startMonitoring() {
    if (monitorTimer) return

    console.log('[Memory Optimizer] 🚀 启动内存监控')

    monitorTimer = setInterval(() => {
      metrics.value = getMemoryInfo()

      // 内存告警
      if (metrics.value.usagePercentage >= criticalThreshold) {
        console.error(
          `[Memory Optimizer] 🔴 内存严重不足: ${metrics.value.usagePercentage.toFixed(2)}%`
        )
      } else if (metrics.value.usagePercentage >= warningThreshold) {
        console.warn(
          `[Memory Optimizer] 🟡 内存使用警告: ${metrics.value.usagePercentage.toFixed(2)}%`
        )
      }

      // 泄漏检测告警
      if (metrics.value.leakRisk) {
        console.warn(
          `[Memory Optimizer] 🚨 检测到内存泄漏风险! 增长率: ${metrics.value.growthRate.toFixed(3)} MB/s`
        )
      }

      // 自动GC
      if (metrics.value.usagePercentage >= autoGCThreshold) {
        console.log('[Memory Optimizer] 🤖 触发自动GC')
        triggerGC()
      }
    }, monitorInterval)
  }

  /**
   * 停止监控
   */
  function stopMonitoring() {
    if (monitorTimer) {
      clearInterval(monitorTimer)
      monitorTimer = null
      console.log('[Memory Optimizer] ⏸️ 停止内存监控')
    }
  }

  /**
   * 内存快照
   */
  function takeSnapshot(): MemoryMetrics {
    return getMemoryInfo()
  }

  /**
   * 清理建议
   */
  function getCleanupSuggestions(): string[] {
    const suggestions: string[] = []
    const current = getMemoryInfo()

    if (current.usagePercentage > 80) {
      suggestions.push('考虑清理不必要的缓存')
      suggestions.push('检查是否存在未释放的事件监听器')
    }

    if (current.leakRisk) {
      suggestions.push('⚠️ 检测到内存泄漏风险，建议使用Chrome DevTools Memory Profiler分析')
      suggestions.push('检查是否存在循环引用')
      suggestions.push('检查是否有未清理的定时器')
    }

    if (current.growthRate > 1) {
      suggestions.push('内存增长过快，检查数据缓存策略')
    }

    return suggestions
  }

  // 自动启动监控
  startMonitoring()

  // 组件卸载时清理
  onBeforeUnmount(() => {
    stopMonitoring()
  })

  return {
    metrics,
    startMonitoring,
    stopMonitoring,
    triggerGC,
    takeSnapshot,
    getCleanupSuggestions
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LRU缓存（带内存限制）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class LRUNode<K, V> {
  constructor(
    public key: K,
    public value: V,
    public prev: LRUNode<K, V> | null = null,
    public next: LRUNode<K, V> | null = null
  ) { }
}

/**
 * LRU缓存（最近最少使用）
 */
export class LRUCache<K, V> {
  private capacity: number
  private cache = new Map<K, LRUNode<K, V>>()
  private head: LRUNode<K, V> | null = null
  private tail: LRUNode<K, V> | null = null

  constructor(capacity: number) {
    this.capacity = capacity
  }

  /**
   * 获取值
   */
  get(key: K): V | undefined {
    const node = this.cache.get(key)
    if (!node) return undefined

    this.moveToFront(node)
    return node.value
  }

  /**
   * 设置值
   */
  set(key: K, value: V): void {
    const existingNode = this.cache.get(key)

    if (existingNode) {
      existingNode.value = value
      this.moveToFront(existingNode)
      return
    }

    const newNode = new LRUNode(key, value)
    this.cache.set(key, newNode)
    this.addToFront(newNode)

    if (this.cache.size > this.capacity) {
      this.removeLRU()
    }
  }

  /**
   * 移动到队首
   */
  private moveToFront(node: LRUNode<K, V>): void {
    this.removeNode(node)
    this.addToFront(node)
  }

  /**
   * 添加到队首
   */
  private addToFront(node: LRUNode<K, V>): void {
    node.next = this.head
    node.prev = null

    if (this.head) {
      this.head.prev = node
    }

    this.head = node

    if (!this.tail) {
      this.tail = node
    }
  }

  /**
   * 移除节点
   */
  private removeNode(node: LRUNode<K, V>): void {
    if (node.prev) {
      node.prev.next = node.next
    } else {
      this.head = node.next
    }

    if (node.next) {
      node.next.prev = node.prev
    } else {
      this.tail = node.prev
    }
  }

  /**
   * 移除最近最少使用
   */
  private removeLRU(): void {
    if (!this.tail) return

    this.cache.delete(this.tail.key)
    this.removeNode(this.tail)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.head = null
    this.tail = null
  }

  /**
   * 获取大小
   */
  size(): number {
    return this.cache.size
  }
}
