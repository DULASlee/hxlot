/**
 * 性能监控服务
 * Phoenix计划增强版 - 集成 Web Vitals 库
 * 基于 Performance API + web-vitals 实现前端性能监控
 */

import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'

interface PerformanceMetrics {
  // Core Web Vitals（使用 web-vitals 库）
  firstContentfulPaint?: number // FCP - 首次内容绘制
  largestContentfulPaint?: number // LCP - 最大内容绘制
  firstInputDelay?: number // FID - 首次输入延迟
  interactionToNextPaint?: number // INP - 交互到下一次绘制
  cumulativeLayoutShift?: number // CLS - 累积布局偏移
  timeToFirstByte?: number // TTFB - 首字节时间
  timeToInteractive?: number // TTI - 可交互时间

  // 导航时间指标
  dnsLookup?: number // DNS查询时间
  tcpConnection?: number // TCP连接时间
  tlsHandshake?: number // TLS握手时间
  requestTime?: number // 请求响应时间
  domContentLoaded?: number // DOM内容加载时间
  loadComplete?: number // 页面完全加载时间

  // 资源加载指标
  resourceLoadTime?: number // 资源加载总时间
  resourceCount?: number // 资源数量

  // Phoenix增强：内存和长任务
  memoryUsed?: number // 已使用内存 (MB)
  memoryTotal?: number // 总内存 (MB)
  longTasksCount?: number // 长任务数量 (>50ms)
  totalBlockingTime?: number // 总阻塞时间
}

interface RoutePerformance {
  routePath: string
  duration: number
  timestamp: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {}
  private routePerformances: RoutePerformance[] = []
  private observer: PerformanceObserver | null = null
  private longTaskObserver: PerformanceObserver | null = null
  private memoryMonitorInterval: ReturnType<typeof setInterval> | null = null

  /**
   * 初始化性能监控（Phoenix增强版）
   */
  init() {
    if (typeof window === 'undefined' || !window.performance) {
      console.warn('[Performance Monitor] Performance API not supported')
      return
    }

    console.log('[Performance Monitor] 🚀 Phoenix增强版启动中...')

    // 使用 web-vitals 库监控 Core Web Vitals
    this.initWebVitals()

    // 保留原有的监控
    this.observeNavigationTiming()

    // Phoenix增强：长任务监控
    this.observeLongTasks()

    // Phoenix增强：内存监控
    this.observeMemoryUsage()

    console.log('[Performance Monitor] ✅ 性能监控已启动')
  }

  /**
   * 初始化 Web Vitals 监控（Phoenix增强）
   */
  private initWebVitals() {
    // First Contentful Paint
    onFCP((metric: Metric) => {
      this.metrics.firstContentfulPaint = metric.value
      console.log(`[Performance Monitor] 📊 FCP: ${metric.value.toFixed(2)}ms ${this.rateMetric('FCP', metric.value)}`)
    })

    // Largest Contentful Paint
    onLCP((metric: Metric) => {
      this.metrics.largestContentfulPaint = metric.value
      console.log(`[Performance Monitor] 📊 LCP: ${metric.value.toFixed(2)}ms ${this.rateMetric('LCP', metric.value)}`)
    })

    // First Input Delay
    onFID((metric: Metric) => {
      this.metrics.firstInputDelay = metric.value
      console.log(`[Performance Monitor] 📊 FID: ${metric.value.toFixed(2)}ms ${this.rateMetric('FID', metric.value)}`)
    })

    // Interaction to Next Paint
    onINP((metric: Metric) => {
      this.metrics.interactionToNextPaint = metric.value
      console.log(`[Performance Monitor] 📊 INP: ${metric.value.toFixed(2)}ms ${this.rateMetric('INP', metric.value)}`)
    })

    // Cumulative Layout Shift
    onCLS((metric: Metric) => {
      this.metrics.cumulativeLayoutShift = metric.value
      console.log(`[Performance Monitor] 📊 CLS: ${metric.value.toFixed(3)} ${this.rateMetric('CLS', metric.value)}`)
    })

    // Time to First Byte
    onTTFB((metric: Metric) => {
      this.metrics.timeToFirstByte = metric.value
      console.log(`[Performance Monitor] 📊 TTFB: ${metric.value.toFixed(2)}ms ${this.rateMetric('TTFB', metric.value)}`)
    })
  }

  /**
   * 监控长任务（Phoenix增强）
   */
  private observeLongTasks() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    try {
      this.metrics.longTasksCount = 0
      this.metrics.totalBlockingTime = 0

      this.longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const taskDuration = entry.duration

          // 长任务定义：执行时间 > 50ms
          if (taskDuration > 50) {
            this.metrics.longTasksCount = (this.metrics.longTasksCount || 0) + 1

            // 计算阻塞时间（超过50ms的部分）
            const blockingTime = taskDuration - 50
            this.metrics.totalBlockingTime = (this.metrics.totalBlockingTime || 0) + blockingTime

            // 仅在开发环境警告
            if (import.meta.env.DEV) {
              console.warn(`[Performance Monitor] ⚠️ Long Task: ${taskDuration.toFixed(2)}ms`, {
                name: entry.name,
                startTime: entry.startTime,
              })
            }
          }
        }
      })

      this.longTaskObserver.observe({ entryTypes: ['longtask'] })
    } catch (error) {
      console.warn('[Performance Monitor] Long Task monitoring not supported')
    }
  }

  /**
   * 监控内存使用（Phoenix增强）
   */
  private observeMemoryUsage() {
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

          // 仅在开发环境监控内存
          if (import.meta.env.DEV) {
            const memoryLimit = performance.memory.jsHeapSizeLimit / (1024 * 1024)
            const memoryUsagePercent = (this.metrics.memoryUsed / memoryLimit) * 100

            if (memoryUsagePercent > 90) {
              console.error(`[Performance Monitor] 🚨 Memory Critical: ${memoryUsagePercent.toFixed(1)}% (${this.metrics.memoryUsed.toFixed(2)} MB)`)
            }
          }
        }
      }, 10000) // 每10秒检查一次
    }
  }

  /**
   * 评估单个指标（Phoenix增强）
   */
  private rateMetric(metric: string, value: number): string {
    let rating: 'good' | 'needs-improvement' | 'poor'
    let emoji: string

    switch (metric) {
      case 'FCP':
        rating = value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor'
        break
      case 'LCP':
        rating = value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor'
        break
      case 'FID':
        rating = value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor'
        break
      case 'INP':
        rating = value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor'
        break
      case 'CLS':
        rating = value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor'
        break
      case 'TTFB':
        rating = value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor'
        break
      default:
        return ''
    }

    emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌'
    return `${emoji} (${rating})`
  }

  /**
   * 观察导航时间
   */
  private observeNavigationTiming() {
    if (window.performance.timing) {
      const timing = window.performance.timing
      const navigationStart = timing.navigationStart

      // DNS查询时间
      this.metrics.dnsLookup = timing.domainLookupEnd - timing.domainLookupStart

      // TCP连接时间
      this.metrics.tcpConnection = timing.connectEnd - timing.connectStart

      // TLS握手时间
      if (timing.secureConnectionStart) {
        this.metrics.tlsHandshake = timing.connectEnd - timing.secureConnectionStart
      }

      // 请求响应时间
      this.metrics.requestTime = timing.responseEnd - timing.requestStart

      // DOM内容加载时间
      this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - navigationStart

      // 页面完全加载时间
      this.metrics.loadComplete = timing.loadEventEnd - navigationStart

      console.log('[Performance Monitor] Navigation Timing:', {
        dnsLookup: `${this.metrics.dnsLookup}ms`,
        tcpConnection: `${this.metrics.tcpConnection}ms`,
        tlsHandshake: `${this.metrics.tlsHandshake || 0}ms`,
        requestTime: `${this.metrics.requestTime}ms`,
        domContentLoaded: `${this.metrics.domContentLoaded}ms`,
        loadComplete: `${this.metrics.loadComplete}ms`
      })
    }
  }


  /**
   * 记录路由切换性能
   */
  recordRoutePerformance(routePath: string, duration: number) {
    const record: RoutePerformance = {
      routePath,
      duration,
      timestamp: Date.now()
    }

    this.routePerformances.push(record)

    // 只保留最近100条记录
    if (this.routePerformances.length > 100) {
      this.routePerformances.shift()
    }

    console.log(`[Performance Monitor] Route: ${routePath} - ${duration.toFixed(2)}ms`)
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 获取路由性能记录
   */
  getRoutePerformances(): RoutePerformance[] {
    return [...this.routePerformances]
  }

  /**
   * 获取平均路由切换时间
   */
  getAverageRouteDuration(): number {
    if (this.routePerformances.length === 0) return 0
    const total = this.routePerformances.reduce((sum, record) => sum + record.duration, 0)
    return total / this.routePerformances.length
  }

  /**
   * 获取Core Web Vitals评分
   */
  getCoreWebVitals() {
    return {
      fcp: this.metrics.firstContentfulPaint,
      lcp: this.metrics.largestContentfulPaint,
      fid: this.metrics.firstInputDelay,
      cls: this.metrics.cumulativeLayoutShift,
      rating: this.getRating()
    }
  }

  /**
   * 获取性能评级
   */
  private getRating(): 'good' | 'needs-improvement' | 'poor' {
    const { firstContentfulPaint, largestContentfulPaint, firstInputDelay, cumulativeLayoutShift } = this.metrics

    let score = 0
    let count = 0

    // FCP 评分 (< 1.8s good, < 3s needs-improvement, >= 3s poor)
    if (firstContentfulPaint !== undefined) {
      if (firstContentfulPaint < 1800) score += 2
      else if (firstContentfulPaint < 3000) score += 1
      count++
    }

    // LCP 评分 (< 2.5s good, < 4s needs-improvement, >= 4s poor)
    if (largestContentfulPaint !== undefined) {
      if (largestContentfulPaint < 2500) score += 2
      else if (largestContentfulPaint < 4000) score += 1
      count++
    }

    // FID 评分 (< 100ms good, < 300ms needs-improvement, >= 300ms poor)
    if (firstInputDelay !== undefined) {
      if (firstInputDelay < 100) score += 2
      else if (firstInputDelay < 300) score += 1
      count++
    }

    // CLS 评分 (< 0.1 good, < 0.25 needs-improvement, >= 0.25 poor)
    if (cumulativeLayoutShift !== undefined) {
      if (cumulativeLayoutShift < 0.1) score += 2
      else if (cumulativeLayoutShift < 0.25) score += 1
      count++
    }

    if (count === 0) return 'needs-improvement'

    const avgScore = score / count
    if (avgScore >= 1.5) return 'good'
    if (avgScore >= 0.5) return 'needs-improvement'
    return 'poor'
  }

  /**
   * 清理监听器（Phoenix增强）
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }

    if (this.longTaskObserver) {
      this.longTaskObserver.disconnect()
      this.longTaskObserver = null
    }

    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval)
      this.memoryMonitorInterval = null
    }

    console.log('[Performance Monitor] 已清理所有监听器')
  }
}

// 导出单例
export const performanceMonitor = new PerformanceMonitor()
