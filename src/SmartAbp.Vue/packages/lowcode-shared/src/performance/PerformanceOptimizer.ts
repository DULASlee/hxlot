/**
 * 性能优化器
 * 
 * 核心功能：
 * 1. 高级LRU缓存策略
 * 2. 预测性组件加载
 * 3. 内存管理与自动清理
 * 4. 资源使用监控
 * 
 * 工作原理：
 * - 基于用户行为预测组件需求
 * - 智能预加载高频组件
 * - 自动清理低频组件
 * - 内存阈值管理
 * 
 * @module PerformanceOptimizer
 * @author AI首席架构师
 * @since 2.0.0
 */

import type { Component } from 'vue'
import type { ComponentMetadata } from '../components/ComponentRegistry'

/**
 * 组件使用统计
 */
export interface ComponentUsageStats {
  /**
   * 组件名称
   */
  name: string

  /**
   * 访问次数
   */
  accessCount: number

  /**
   * 最后访问时间
   */
  lastAccessTime: number

  /**
   * 平均加载时间（毫秒）
   */
  avgLoadTime: number

  /**
   * 加载失败次数
   */
  failureCount: number

  /**
   * 预测分数（0-1）
   */
  predictionScore: number
}

/**
 * 性能优化器选项
 */
export interface PerformanceOptimizerOptions {
  /**
   * 缓存容量
   */
  cacheCapacity?: number

  /**
   * 预加载阈值（访问次数）
   */
  preloadThreshold?: number

  /**
   * 内存阈值（MB）
   */
  memoryThreshold?: number

  /**
   * 预测窗口大小（历史记录数）
   */
  predictionWindow?: number

  /**
   * 自动清理间隔（毫秒）
   */
  cleanupInterval?: number

  /**
   * 启用预测性加载
   */
  enablePredictive?: boolean

  /**
   * 启用性能监控
   */
  enableMonitoring?: boolean

  /**
   * 调试模式
   */
  debug?: boolean
}

/**
 * 内存使用信息
 */
export interface MemoryInfo {
  /**
   * 已用内存（字节）
   */
  used: number

  /**
   * 总内存（字节）
   */
  total: number

  /**
   * 使用率（0-1）
   */
  usage: number

  /**
   * 是否超过阈值
   */
  isOverThreshold: boolean
}

/**
 * 预测结果
 */
export interface PredictionResult {
  /**
   * 推荐预加载的组件
   */
  recommendations: string[]

  /**
   * 置信度（0-1）
   */
  confidence: number

  /**
   * 预测基于的因素
   */
  factors: string[]
}

/**
 * 高级LRU缓存节点
 */
class CacheNode<T> {
  constructor(
    public key: string,
    public value: T,
    public frequency: number = 1,
    public lastAccess: number = Date.now()
  ) { }
}

/**
 * LFU-LRU混合缓存（Least Frequently Used + Least Recently Used）
 */
class HybridCache<T> {
  private cache = new Map<string, CacheNode<T>>()
  private accessHistory: string[] = []

  constructor(private capacity: number) { }

  get(key: string): T | undefined {
    const node = this.cache.get(key)
    if (!node) return undefined

    // 更新访问信息
    node.frequency++
    node.lastAccess = Date.now()
    this.accessHistory.push(key)

    return node.value
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      const node = this.cache.get(key)!
      node.value = value
      node.frequency++
      node.lastAccess = Date.now()
      return
    }

    if (this.cache.size >= this.capacity) {
      this.evict()
    }

    this.cache.set(key, new CacheNode(key, value))
    this.accessHistory.push(key)
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.accessHistory = []
  }

  size(): number {
    return this.cache.size
  }

  /**
   * 智能驱逐策略：优先驱逐低频且久未访问的项
   */
  private evict(): void {
    let minScore = Infinity
    let victimKey: string | null = null

    for (const [key, node] of this.cache) {
      // 综合分数：频率权重0.6 + 时间权重0.4
      const timeFactor = (Date.now() - node.lastAccess) / 1000 / 60 // 分钟
      const score = node.frequency * 0.6 - timeFactor * 0.4

      if (score < minScore) {
        minScore = score
        victimKey = key
      }
    }

    if (victimKey) {
      this.cache.delete(victimKey)
    }
  }

  /**
   * 获取所有缓存项的统计
   */
  getStats(): Array<{ key: string; frequency: number; lastAccess: number }> {
    return Array.from(this.cache.values()).map(node => ({
      key: node.key,
      frequency: node.frequency,
      lastAccess: node.lastAccess
    }))
  }
}

/**
 * 性能优化器
 */
export class PerformanceOptimizer {
  private cache: HybridCache<Component>
  private usageStats = new Map<string, ComponentUsageStats>()
  private loadingQueue: Set<string> = new Set()
  private cleanupTimer?: ReturnType<typeof setInterval>
  private options: Required<PerformanceOptimizerOptions>

  constructor(options: PerformanceOptimizerOptions = {}) {
    this.options = {
      cacheCapacity: options.cacheCapacity ?? 100,
      preloadThreshold: options.preloadThreshold ?? 3,
      memoryThreshold: options.memoryThreshold ?? 50, // 50MB
      predictionWindow: options.predictionWindow ?? 50,
      cleanupInterval: options.cleanupInterval ?? 60000, // 1分钟
      enablePredictive: options.enablePredictive ?? true,
      enableMonitoring: options.enableMonitoring ?? true,
      debug: options.debug ?? false
    }

    this.cache = new HybridCache<Component>(this.options.cacheCapacity)

    // 启动自动清理
    if (this.options.enableMonitoring) {
      this.startAutoCleanup()
    }
  }

  /**
   * 获取组件（带性能监控）
   */
  async get(name: string, loader: () => Promise<Component>): Promise<Component> {
    const startTime = performance.now()

    // 检查缓存
    const cached = this.cache.get(name)
    if (cached) {
      this.recordAccess(name, performance.now() - startTime, true)
      return cached
    }

    // 防止重复加载
    if (this.loadingQueue.has(name)) {
      await this.waitForLoading(name)
      return this.cache.get(name)!
    }

    // 加载组件
    this.loadingQueue.add(name)
    try {
      const component = await loader()
      const loadTime = performance.now() - startTime

      this.cache.set(name, component)
      this.recordAccess(name, loadTime, false)

      this.loadingQueue.delete(name)
      return component
    } catch (error) {
      this.loadingQueue.delete(name)
      this.recordFailure(name)
      throw error
    }
  }

  /**
   * 预加载组件
   */
  async preload(
    name: string,
    loader: () => Promise<Component>
  ): Promise<void> {
    if (this.cache.has(name) || this.loadingQueue.has(name)) {
      return
    }

    if (this.options.debug) {
      console.log(`[PerformanceOptimizer] 预加载: ${name}`)
    }

    try {
      const component = await loader()
      this.cache.set(name, component)
      this.recordAccess(name, 0, true, true)
    } catch (error) {
      console.error(`[PerformanceOptimizer] 预加载失败: ${name}`, error)
    }
  }

  /**
   * 预测性预加载
   */
  async predictivePreload(
    currentComponent: string,
    allComponents: ComponentMetadata[],
    loader: (name: string) => Promise<Component>
  ): Promise<PredictionResult> {
    if (!this.options.enablePredictive) {
      return { recommendations: [], confidence: 0, factors: [] }
    }

    const prediction = this.predict(currentComponent, allComponents)

    // 执行预加载
    const preloadPromises = prediction.recommendations
      .slice(0, 3) // 最多预加载3个
      .map(name => this.preload(name, () => loader(name)))

    await Promise.all(preloadPromises)

    return prediction
  }

  /**
   * 预测下一步可能需要的组件
   */
  private predict(
    currentComponent: string,
    allComponents: ComponentMetadata[]
  ): PredictionResult {
    const factors: string[] = []
    const scores = new Map<string, number>()

    // 因素1: 历史共现模式（30%权重）
    const cooccurrence = this.analyzeCooccurrence(currentComponent)
    for (const [name, score] of cooccurrence) {
      scores.set(name, (scores.get(name) || 0) + score * 0.3)
    }
    if (cooccurrence.size > 0) {
      factors.push('历史共现模式')
    }

    // 因素2: 依赖关系（25%权重）
    const current = allComponents.find(c => c.name === currentComponent)
    if (current?.dependencies) {
      for (const dep of current.dependencies) {
        scores.set(dep, (scores.get(dep) || 0) + 0.25)
      }
      factors.push('组件依赖关系')
    }

    // 因素3: 同类别组件（20%权重）
    if (current?.category) {
      const sameCategory = allComponents.filter(
        c => c.category === current.category && c.name !== currentComponent
      )
      for (const comp of sameCategory) {
        scores.set(comp.name, (scores.get(comp.name) || 0) + 0.2)
      }
      if (sameCategory.length > 0) {
        factors.push('同类别组件')
      }
    }

    // 因素4: 访问频率（15%权重）
    for (const [name, stats] of this.usageStats) {
      if (name !== currentComponent && stats.accessCount > this.options.preloadThreshold) {
        const frequencyScore = Math.min(stats.accessCount / 10, 1)
        scores.set(name, (scores.get(name) || 0) + frequencyScore * 0.15)
      }
    }
    factors.push('访问频率')

    // 因素5: 优先级（10%权重）
    for (const comp of allComponents) {
      if (comp.priority === 'high') {
        scores.set(comp.name, (scores.get(comp.name) || 0) + 0.1)
      }
    }
    factors.push('组件优先级')

    // 排序并取top N
    const recommendations = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .filter(([, score]) => score > 0.3) // 置信度阈值
      .map(([name]) => String(name ?? ''))

    const confidence = recommendations.length > 0 && recommendations[0]
      ? (scores.get(recommendations[0]) ?? 0) / 1.0
      : 0

    return {
      recommendations,
      confidence: Math.min(confidence, 1),
      factors
    }
  }

  /**
   * 分析组件共现模式
   */
  private analyzeCooccurrence(currentComponent: string): Map<string, number> {
    const cooccurrence = new Map<string, number>()
    const window = this.options.predictionWindow

    // 简化实现：基于访问历史分析
    // 生产环境应使用更复杂的序列模式挖掘算法
    for (const [name, stats] of this.usageStats) {
      if (name === currentComponent) continue

      // 计算时间接近度
      const timeDiff = Math.abs(stats.lastAccessTime - Date.now())
      if (timeDiff < window * 1000) {
        const score = 1 - (timeDiff / (window * 1000))
        cooccurrence.set(name, score)
      }
    }

    return cooccurrence
  }

  /**
   * 记录组件访问
   */
  private recordAccess(
    name: string,
    loadTime: number,
    fromCache: boolean,
    isPreload: boolean = false
  ): void {
    let stats = this.usageStats.get(name)

    if (!stats) {
      stats = {
        name,
        accessCount: 0,
        lastAccessTime: Date.now(),
        avgLoadTime: 0,
        failureCount: 0,
        predictionScore: 0
      }
      this.usageStats.set(name, stats)
    }

    stats.accessCount++
    stats.lastAccessTime = Date.now()

    if (!fromCache && !isPreload) {
      // 更新平均加载时间
      stats.avgLoadTime = (stats.avgLoadTime * (stats.accessCount - 1) + loadTime) / stats.accessCount
    }

    if (this.options.debug) {
      console.log(`[PerformanceOptimizer] 访问记录: ${name}`, {
        fromCache,
        loadTime: loadTime.toFixed(2) + 'ms',
        accessCount: stats.accessCount
      })
    }
  }

  /**
   * 记录加载失败
   */
  private recordFailure(name: string): void {
    const stats = this.usageStats.get(name)
    if (stats) {
      stats.failureCount++
    }
  }

  /**
   * 等待加载完成
   */
  private async waitForLoading(name: string): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (!this.loadingQueue.has(name)) {
          resolve()
        } else {
          setTimeout(check, 50)
        }
      }
      check()
    })
  }

  /**
   * 获取内存使用情况
   */
  getMemoryInfo(): MemoryInfo {
    const perf = performance as unknown as { memory?: { usedJSHeapSize?: number; totalJSHeapSize?: number } }
    if (!perf.memory) {
      return {
        used: 0,
        total: 0,
        usage: 0,
        isOverThreshold: false
      }
    }

    const mem = perf.memory
    const used = mem?.usedJSHeapSize || 0
    const total = mem?.totalJSHeapSize || 0
    const usage = used / total
    const thresholdBytes = this.options.memoryThreshold * 1024 * 1024

    return {
      used,
      total,
      usage,
      isOverThreshold: used > thresholdBytes
    }
  }

  /**
   * 自动清理
   */
  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const memInfo = this.getMemoryInfo()

      if (memInfo.isOverThreshold) {
        this.performCleanup()
      }
    }, this.options.cleanupInterval)
  }

  /**
   * 执行清理
   */
  private performCleanup(): void {
    const stats = this.cache.getStats()
    const now = Date.now()

    // 清理超过5分钟未访问的低频组件
    for (const { key, frequency, lastAccess } of stats) {
      const minutesSinceAccess = (now - lastAccess) / 1000 / 60

      if (minutesSinceAccess > 5 && frequency < 3) {
        this.cache.delete(key)
        if (this.options.debug) {
          console.log(`[PerformanceOptimizer] 清理组件: ${key}`)
        }
      }
    }
  }

  /**
   * 获取使用统计
   */
  getUsageStats(): ComponentUsageStats[] {
    return Array.from(this.usageStats.values())
      .sort((a, b) => b.accessCount - a.accessCount)
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return {
      size: this.cache.size(),
      capacity: this.options.cacheCapacity,
      usage: this.cache.size() / this.options.cacheCapacity,
      items: this.cache.getStats()
    }
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.usageStats.clear()
    this.loadingQueue.clear()
  }

  /**
   * 销毁
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.clear()
  }
}

/**
 * 创建性能优化器
 */
export function createPerformanceOptimizer(
  options?: PerformanceOptimizerOptions
): PerformanceOptimizer {
  return new PerformanceOptimizer(options)
}

