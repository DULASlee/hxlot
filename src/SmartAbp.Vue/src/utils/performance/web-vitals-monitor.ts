/**
 * Web Vitals 性能监控工具
 * Phoenix计划 - 小组2：前端性能极致优化
 * 
 * 集成Core Web Vitals + 自定义性能指标
 * 基于业界最佳实践：Google Web Vitals
 */

import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'

/**
 * 性能指标类型
 */
export interface PerformanceMetrics {
  // Core Web Vitals
  FCP: number | null // First Contentful Paint - 首次内容绘制
  LCP: number | null // Largest Contentful Paint - 最大内容绘制
  FID: number | null // First Input Delay - 首次输入延迟
  INP: number | null // Interaction to Next Paint - 交互到下一次绘制
  CLS: number | null // Cumulative Layout Shift - 累积布局偏移
  TTFB: number | null // Time to First Byte - 首字节时间
  
  // 自定义指标
  TTI: number | null // Time to Interactive - 可交互时间
  TBT: number | null // Total Blocking Time - 总阻塞时间
  FMP: number | null // First Meaningful Paint - 首次有意义绘制
  
  // 资源加载
  resourceLoadTime: number | null // 资源加载时间
  domReadyTime: number | null // DOM就绪时间
  windowLoadTime: number | null // 窗口加载时间
  
  // 内存
  memoryUsed: number | null // 已使用内存 (MB)
  memoryTotal: number | null // 总内存 (MB)
  memoryLimit: number | null // 内存限制 (MB)
  
  // 长任务
  longTasksCount: number // 长任务数量 (>50ms)
  totalBlockingTime: number // 总阻塞时间
}

/**
 * 性能评分标准（基于Google Lighthouse）
 */
export interface PerformanceRating {
  metric: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  threshold: {
    good: number
    needsImprovement: number
  }
}

/**
 * 性能监控配置
 */
export interface PerformanceMonitorConfig {
  reportCallback?: (metrics: PerformanceMetrics) => void
  enableLongTaskDetection?: boolean
  enableMemoryMonitoring?: boolean
  reportInterval?: number // 报告间隔（毫秒）
}

/**
 * Web Vitals 性能监控器
 */
export class WebVitalsMonitor {
  private metrics: PerformanceMetrics = {
    FCP: null,
    LCP: null,
    FID: null,
    INP: null,
    CLS: null,
    TTFB: null,
    TTI: null,
    TBT: null,
    FMP: null,
    resourceLoadTime: null,
    domReadyTime: null,
    windowLoadTime: null,
    memoryUsed: null,
    memoryTotal: null,
    memoryLimit: null,
    longTasksCount: 0,
    totalBlockingTime: 0,
  }

  private config: PerformanceMonitorConfig
  private longTaskObserver: PerformanceObserver | null = null
  private memoryMonitorInterval: ReturnType<typeof setInterval> | null = null
  private reportInterval: ReturnType<typeof setInterval> | null = null

  constructor(config: PerformanceMonitorConfig = {}) {
    this.config = {
      enableLongTaskDetection: true,
      enableMemoryMonitoring: true,
      reportInterval: 30000, // 默认30秒报告一次
      ...config,
    }

    this.initialize()
  }

  /**
   * 初始化监控
   */
  private initialize(): void {
    // 监控 Core Web Vitals
    this.observeCoreWebVitals()

    // 监控自定义指标
    this.observeCustomMetrics()

    // 监控长任务
    if (this.config.enableLongTaskDetection) {
      this.observeLongTasks()
    }

    // 监控内存使用
    if (this.config.enableMemoryMonitoring) {
      this.observeMemoryUsage()
    }

    // 定期报告
    if (this.config.reportCallback && this.config.reportInterval) {
      this.startPeriodicReporting()
    }
  }

  /**
   * 监控 Core Web Vitals
   */
  private observeCoreWebVitals(): void {
    // First Contentful Paint
    onFCP((metric: Metric) => {
      this.metrics.FCP = metric.value
      this.reportMetric('FCP', metric.value)
    })

    // Largest Contentful Paint
    onLCP((metric: Metric) => {
      this.metrics.LCP = metric.value
      this.reportMetric('LCP', metric.value)
    })

    // First Input Delay
    onFID((metric: Metric) => {
      this.metrics.FID = metric.value
      this.reportMetric('FID', metric.value)
    })

    // Interaction to Next Paint
    onINP((metric: Metric) => {
      this.metrics.INP = metric.value
      this.reportMetric('INP', metric.value)
    })

    // Cumulative Layout Shift
    onCLS((metric: Metric) => {
      this.metrics.CLS = metric.value
      this.reportMetric('CLS', metric.value)
    })

    // Time to First Byte
    onTTFB((metric: Metric) => {
      this.metrics.TTFB = metric.value
      this.reportMetric('TTFB', metric.value)
    })
  }

  /**
   * 监控自定义指标
   */
  private observeCustomMetrics(): void {
    if (typeof window === 'undefined') return

    // 使用 PerformanceObserver 监控导航时间
    if ('PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming
              
              // DOM就绪时间
              this.metrics.domReadyTime = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart
              
              // 窗口加载时间
              this.metrics.windowLoadTime = navEntry.loadEventEnd - navEntry.loadEventStart
              
              // 资源加载时间
              this.metrics.resourceLoadTime = navEntry.responseEnd - navEntry.requestStart
              
              // Time to Interactive (简化估算)
              this.metrics.TTI = navEntry.domInteractive - navEntry.fetchStart
            }
          }
        })

        navigationObserver.observe({ entryTypes: ['navigation'] })
      } catch (error) {
        console.warn('PerformanceObserver navigation monitoring failed:', error)
      }
    }

    // 使用 Performance API 获取资源时间
    if ('performance' in window && 'getEntriesByType' in window.performance) {
      window.addEventListener('load', () => {
        const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navigation) {
          // First Meaningful Paint (简化：使用 domContentLoadedEventEnd)
          this.metrics.FMP = navigation.domContentLoadedEventEnd - navigation.fetchStart
          
          // Total Blocking Time (需要通过 Long Tasks 计算)
          this.metrics.TBT = this.metrics.totalBlockingTime
        }
      })
    }
  }

  /**
   * 监控长任务（>50ms）
   */
  private observeLongTasks(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    try {
      this.longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const taskDuration = entry.duration
          
          // 长任务定义：执行时间 > 50ms
          if (taskDuration > 50) {
            this.metrics.longTasksCount++
            
            // 计算阻塞时间（超过50ms的部分）
            const blockingTime = taskDuration - 50
            this.metrics.totalBlockingTime += blockingTime
            
            // 报告长任务
            console.warn(`⚠️ Long Task Detected: ${taskDuration.toFixed(2)}ms`, {
              name: entry.name,
              startTime: entry.startTime,
              duration: entry.duration,
            })
          }
        }
      })

      this.longTaskObserver.observe({ entryTypes: ['longtask'] })
    } catch (error) {
      console.warn('Long Task monitoring not supported:', error)
    }
  }

  /**
   * 监控内存使用
   */
  private observeMemoryUsage(): void {
    if (typeof window === 'undefined') return

    // 检查是否支持 Performance Memory API (Chrome)
    const performance = window.performance as Performance & {
      memory?: {
        usedJSHeapSize: number
        totalJSHeapSize: number
        jsHeapSizeLimit: number
      }
    }

    if (performance.memory) {
      // 定期检查内存使用
      this.memoryMonitorInterval = setInterval(() => {
        if (performance.memory) {
          this.metrics.memoryUsed = performance.memory.usedJSHeapSize / (1024 * 1024) // MB
          this.metrics.memoryTotal = performance.memory.totalJSHeapSize / (1024 * 1024) // MB
          this.metrics.memoryLimit = performance.memory.jsHeapSizeLimit / (1024 * 1024) // MB

          // 内存使用率检查
          const memoryUsagePercent = (this.metrics.memoryUsed / this.metrics.memoryLimit) * 100
          
          if (memoryUsagePercent > 90) {
            console.error('🚨 Memory Usage Critical: ' + memoryUsagePercent.toFixed(2) + '%')
          } else if (memoryUsagePercent > 75) {
            console.warn('⚠️ Memory Usage High: ' + memoryUsagePercent.toFixed(2) + '%')
          }
        }
      }, 5000) // 每5秒检查一次
    } else {
      console.warn('Performance Memory API not supported in this browser')
    }
  }

  /**
   * 报告单个指标
   */
  private reportMetric(name: string, value: number): void {
    console.log(`📊 Performance Metric - ${name}: ${value.toFixed(2)}ms`)
  }

  /**
   * 开始定期报告
   */
  private startPeriodicReporting(): void {
    if (!this.config.reportCallback || !this.config.reportInterval) return

    this.reportInterval = setInterval(() => {
      this.config.reportCallback?.(this.getMetrics())
    }, this.config.reportInterval)
  }

  /**
   * 获取所有指标
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 获取性能评分
   */
  public getRatings(): PerformanceRating[] {
    const ratings: PerformanceRating[] = []

    // FCP 评分
    if (this.metrics.FCP !== null) {
      ratings.push(this.rateMetric('FCP', this.metrics.FCP, 1800, 3000))
    }

    // LCP 评分
    if (this.metrics.LCP !== null) {
      ratings.push(this.rateMetric('LCP', this.metrics.LCP, 2500, 4000))
    }

    // FID 评分
    if (this.metrics.FID !== null) {
      ratings.push(this.rateMetric('FID', this.metrics.FID, 100, 300))
    }

    // INP 评分
    if (this.metrics.INP !== null) {
      ratings.push(this.rateMetric('INP', this.metrics.INP, 200, 500))
    }

    // CLS 评分（特殊：越小越好）
    if (this.metrics.CLS !== null) {
      ratings.push(this.rateMetric('CLS', this.metrics.CLS, 0.1, 0.25))
    }

    // TTFB 评分
    if (this.metrics.TTFB !== null) {
      ratings.push(this.rateMetric('TTFB', this.metrics.TTFB, 800, 1800))
    }

    return ratings
  }

  /**
   * 评估单个指标
   */
  private rateMetric(
    metric: string,
    value: number,
    goodThreshold: number,
    needsImprovementThreshold: number,
  ): PerformanceRating {
    let rating: 'good' | 'needs-improvement' | 'poor'

    if (value <= goodThreshold) {
      rating = 'good'
    } else if (value <= needsImprovementThreshold) {
      rating = 'needs-improvement'
    } else {
      rating = 'poor'
    }

    return {
      metric,
      value,
      rating,
      threshold: {
        good: goodThreshold,
        needsImprovement: needsImprovementThreshold,
      },
    }
  }

  /**
   * 获取性能综合评分（0-100）
   */
  public getOverallScore(): number {
    const ratings = this.getRatings()
    if (ratings.length === 0) return 0

    const goodCount = ratings.filter((r) => r.rating === 'good').length
    const needsImprovementCount = ratings.filter((r) => r.rating === 'needs-improvement').length

    // 计算加权得分
    const goodScore = (goodCount / ratings.length) * 100
    const needsImprovementScore = (needsImprovementCount / ratings.length) * 50

    return Math.round(goodScore + needsImprovementScore)
  }

  /**
   * 生成性能报告
   */
  public generateReport(): string {
    const metrics = this.getMetrics()
    const ratings = this.getRatings()
    const overallScore = this.getOverallScore()

    let report = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
    report += '📊 Web Vitals 性能报告\n'
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n'

    report += `🎯 综合评分: ${overallScore}/100\n\n`

    report += '📈 Core Web Vitals:\n'
    ratings.forEach((rating) => {
      const emoji = rating.rating === 'good' ? '✅' : rating.rating === 'needs-improvement' ? '⚠️' : '❌'
      report += `  ${emoji} ${rating.metric}: ${rating.value.toFixed(2)}ms (${rating.rating})\n`
    })

    report += '\n📊 自定义指标:\n'
    if (metrics.TTI !== null) report += `  • TTI: ${metrics.TTI.toFixed(2)}ms\n`
    if (metrics.TBT !== null) report += `  • TBT: ${metrics.TBT.toFixed(2)}ms\n`
    if (metrics.FMP !== null) report += `  • FMP: ${metrics.FMP.toFixed(2)}ms\n`

    report += '\n🔧 资源加载:\n'
    if (metrics.resourceLoadTime !== null)
      report += `  • 资源加载时间: ${metrics.resourceLoadTime.toFixed(2)}ms\n`
    if (metrics.domReadyTime !== null) report += `  • DOM就绪时间: ${metrics.domReadyTime.toFixed(2)}ms\n`
    if (metrics.windowLoadTime !== null)
      report += `  • 窗口加载时间: ${metrics.windowLoadTime.toFixed(2)}ms\n`

    report += '\n💾 内存使用:\n'
    if (metrics.memoryUsed !== null && metrics.memoryLimit !== null) {
      const memoryPercent = (metrics.memoryUsed / metrics.memoryLimit) * 100
      report += `  • 已使用: ${metrics.memoryUsed.toFixed(2)} MB / ${metrics.memoryLimit.toFixed(2)} MB (${memoryPercent.toFixed(1)}%)\n`
    }

    report += '\n⏱️ 长任务:\n'
    report += `  • 长任务数量: ${metrics.longTasksCount}\n`
    report += `  • 总阻塞时间: ${metrics.totalBlockingTime.toFixed(2)}ms\n`

    report += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'

    return report
  }

  /**
   * 清理监控器
   */
  public destroy(): void {
    if (this.longTaskObserver) {
      this.longTaskObserver.disconnect()
      this.longTaskObserver = null
    }

    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval)
      this.memoryMonitorInterval = null
    }

    if (this.reportInterval) {
      clearInterval(this.reportInterval)
      this.reportInterval = null
    }
  }
}

/**
 * 创建并启动性能监控器（单例）
 */
let monitorInstance: WebVitalsMonitor | null = null

export function initializePerformanceMonitoring(config?: PerformanceMonitorConfig): WebVitalsMonitor {
  if (monitorInstance) {
    return monitorInstance
  }

  monitorInstance = new WebVitalsMonitor(config)
  
  // 在开发环境下，5分钟后自动生成报告
  if (import.meta.env.DEV) {
    setTimeout(() => {
      console.log(monitorInstance?.generateReport())
    }, 300000) // 5分钟
  }

  return monitorInstance
}

export function getPerformanceMonitor(): WebVitalsMonitor | null {
  return monitorInstance
}
