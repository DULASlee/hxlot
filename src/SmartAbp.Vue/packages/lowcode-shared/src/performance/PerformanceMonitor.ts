/**
 * 性能监控器
 * 
 * 核心功能：
 * 1. 实时性能指标收集
 * 2. 组件加载性能分析
 * 3. 内存使用监控
 * 4. 性能报告生成
 * 
 * @module PerformanceMonitor
 * @author AI首席架构师
 * @since 2.0.0
 */

/**
 * 性能指标
 */
export interface PerformanceMetric {
  /**
   * 指标类型
   */
  type: 'load' | 'cache-hit' | 'cache-miss' | 'preload' | 'error' | 'memory'

  /**
   * 组件名称
   */
  componentName?: string

  /**
   * 持续时间（毫秒）
   */
  duration: number

  /**
   * 时间戳
   */
  timestamp: number

  /**
   * 额外数据
   */
  metadata?: Record<string, any>
}

/**
 * 性能报告
 */
export interface PerformanceReport {
  /**
   * 报告生成时间
   */
  generatedAt: Date

  /**
   * 时间范围（秒）
   */
  timeRange: number

  /**
   * 总加载次数
   */
  totalLoads: number

  /**
   * 缓存命中率
   */
  cacheHitRate: number

  /**
   * 平均加载时间（毫秒）
   */
  avgLoadTime: number

  /**
   * P95加载时间（毫秒）
   */
  p95LoadTime: number

  /**
   * P99加载时间（毫秒）
   */
  p99LoadTime: number

  /**
   * 错误率
   */
  errorRate: number

  /**
   * 内存使用趋势
   */
  memoryTrend: Array<{ timestamp: number; used: number }>

  /**
   * Top 10 慢加载组件
   */
  slowestComponents: Array<{
    name: string
    avgLoadTime: number
    loadCount: number
  }>

  /**
   * Top 10 热门组件
   */
  hottestComponents: Array<{
    name: string
    loadCount: number
    cacheHits: number
  }>

  /**
   * 预加载效果
   */
  preloadEffectiveness: {
    preloadCount: number
    preloadHitCount: number
    hitRate: number
  }
}

/**
 * 监控选项
 */
export interface PerformanceMonitorOptions {
  /**
   * 最大指标数量
   */
  maxMetrics?: number

  /**
   * 采样率（0-1）
   */
  sampleRate?: number

  /**
   * 启用内存监控
   */
  enableMemoryMonitoring?: boolean

  /**
   * 内存采样间隔（毫秒）
   */
  memorySampleInterval?: number
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private preloadedComponents = new Set<string>()
  private memoryTimer?: ReturnType<typeof setInterval>
  private options: Required<PerformanceMonitorOptions>

  constructor(options: PerformanceMonitorOptions = {}) {
    this.options = {
      maxMetrics: options.maxMetrics ?? 1000,
      sampleRate: options.sampleRate ?? 1.0,
      enableMemoryMonitoring: options.enableMemoryMonitoring ?? true,
      memorySampleInterval: options.memorySampleInterval ?? 5000
    }

    if (this.options.enableMemoryMonitoring) {
      this.startMemoryMonitoring()
    }
  }

  /**
   * 记录指标
   */
  record(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    // 采样
    if (Math.random() > this.options.sampleRate) {
      return
    }

    this.metrics.push({
      ...metric,
      timestamp: Date.now()
    })

    // 限制指标数量
    if (this.metrics.length > this.options.maxMetrics) {
      this.metrics.shift()
    }

    // 记录预加载组件
    if (metric.type === 'preload' && metric.componentName) {
      this.preloadedComponents.add(metric.componentName)
    }
  }

  /**
   * 记录组件加载
   */
  recordLoad(componentName: string, duration: number, fromCache: boolean): void {
    this.record({
      type: fromCache ? 'cache-hit' : 'load',
      componentName,
      duration
    })
  }

  /**
   * 记录缓存未命中
   */
  recordCacheMiss(componentName: string): void {
    this.record({
      type: 'cache-miss',
      componentName,
      duration: 0
    })
  }

  /**
   * 记录预加载
   */
  recordPreload(componentName: string, duration: number): void {
    this.record({
      type: 'preload',
      componentName,
      duration
    })
  }

  /**
   * 记录错误
   */
  recordError(componentName: string, error: Error): void {
    this.record({
      type: 'error',
      componentName,
      duration: 0,
      metadata: {
        message: error.message,
        stack: error.stack
      }
    })
  }

  /**
   * 启动内存监控
   */
  private startMemoryMonitoring(): void {
    const perf = performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit?: number } }
    if (!perf.memory) {
      return
    }

    this.memoryTimer = setInterval(() => {
      // performance.memory在某些浏览器中可能不可用
      if (perf.memory) {
        this.record({
          type: 'memory',
          duration: 0,
          metadata: {
            used: perf.memory.usedJSHeapSize,
            total: perf.memory.totalJSHeapSize,
            limit: perf.memory.jsHeapSizeLimit
          }
        })
      }
    }, this.options.memorySampleInterval)
  }

  /**
   * 生成性能报告
   */
  generateReport(timeRangeSeconds: number = 60): PerformanceReport {
    const now = Date.now()
    const cutoff = now - timeRangeSeconds * 1000

    // 过滤时间范围内的指标
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoff)

    // 统计
    const loadMetrics = recentMetrics.filter(m => m.type === 'load')
    const cacheHits = recentMetrics.filter(m => m.type === 'cache-hit')
    const errors = recentMetrics.filter(m => m.type === 'error')
    const preloads = recentMetrics.filter(m => m.type === 'preload')

    const totalLoads = loadMetrics.length + cacheHits.length
    const cacheHitRate = totalLoads > 0 ? cacheHits.length / totalLoads : 0

    // 加载时间统计
    const loadTimes = loadMetrics.map(m => m.duration).sort((a, b) => a - b)
    const avgLoadTime = loadTimes.length > 0
      ? loadTimes.reduce((sum, t) => sum + t, 0) / loadTimes.length
      : 0

    const p95Index = Math.floor(loadTimes.length * 0.95)
    const p99Index = Math.floor(loadTimes.length * 0.99)
    const p95LoadTime = loadTimes[p95Index] || 0
    const p99LoadTime = loadTimes[p99Index] || 0

    // 错误率
    const errorRate = totalLoads > 0 ? errors.length / totalLoads : 0

    // 内存趋势
    const memoryMetrics = recentMetrics.filter(m => m.type === 'memory')
    const memoryTrend = memoryMetrics.map(m => ({
      timestamp: m.timestamp,
      used: m.metadata?.used || 0
    }))

    // 慢加载组件
    const componentLoadTimes = new Map<string, { total: number; count: number }>()
    for (const metric of loadMetrics) {
      if (!metric.componentName) continue

      const stats = componentLoadTimes.get(metric.componentName) || { total: 0, count: 0 }
      stats.total += metric.duration
      stats.count++
      componentLoadTimes.set(metric.componentName, stats)
    }

    const slowestComponents = Array.from(componentLoadTimes.entries())
      .map(([name, stats]) => ({
        name,
        avgLoadTime: stats.total / stats.count,
        loadCount: stats.count
      }))
      .sort((a, b) => b.avgLoadTime - a.avgLoadTime)
      .slice(0, 10)

    // 热门组件
    const componentAccess = new Map<string, { loads: number; cacheHits: number }>()
    for (const metric of [...loadMetrics, ...cacheHits]) {
      if (!metric.componentName) continue

      const stats = componentAccess.get(metric.componentName) || { loads: 0, cacheHits: 0 }
      if (metric.type === 'load') {
        stats.loads++
      } else {
        stats.cacheHits++
      }
      componentAccess.set(metric.componentName, stats)
    }

    const hottestComponents = Array.from(componentAccess.entries())
      .map(([name, stats]) => ({
        name,
        loadCount: stats.loads + stats.cacheHits,
        cacheHits: stats.cacheHits
      }))
      .sort((a, b) => b.loadCount - a.loadCount)
      .slice(0, 10)

    // 预加载效果
    let preloadHitCount = 0
    for (const metric of [...loadMetrics, ...cacheHits]) {
      if (metric.componentName && this.preloadedComponents.has(metric.componentName)) {
        preloadHitCount++
      }
    }

    const preloadEffectiveness = {
      preloadCount: preloads.length,
      preloadHitCount,
      hitRate: preloads.length > 0 ? preloadHitCount / preloads.length : 0
    }

    return {
      generatedAt: new Date(),
      timeRange: timeRangeSeconds,
      totalLoads,
      cacheHitRate,
      avgLoadTime,
      p95LoadTime,
      p99LoadTime,
      errorRate,
      memoryTrend,
      slowestComponents,
      hottestComponents,
      preloadEffectiveness
    }
  }

  /**
   * 获取实时指标
   */
  getRealtimeMetrics(limit: number = 100): PerformanceMetric[] {
    return this.metrics.slice(-limit)
  }

  /**
   * 清除指标
   */
  clear(): void {
    this.metrics = []
    this.preloadedComponents.clear()
  }

  /**
   * 销毁
   */
  destroy(): void {
    if (this.memoryTimer) {
      clearInterval(this.memoryTimer)
    }
    this.clear()
  }

  /**
   * 导出数据（用于分析）
   */
  export(): {
    metrics: PerformanceMetric[]
    preloadedComponents: string[]
  } {
    return {
      metrics: [...this.metrics],
      preloadedComponents: Array.from(this.preloadedComponents)
    }
  }
}

/**
 * 创建性能监控器
 */
export function createPerformanceMonitor(
  options?: PerformanceMonitorOptions
): PerformanceMonitor {
  return new PerformanceMonitor(options)
}

/**
 * 全局性能监控器实例
 */
export const globalPerformanceMonitor = new PerformanceMonitor({
  maxMetrics: 2000,
  sampleRate: 1.0,
  enableMemoryMonitoring: true
})

