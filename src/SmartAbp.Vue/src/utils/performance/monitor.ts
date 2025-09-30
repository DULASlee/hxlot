/**
 * 性能监控服务
 * 基于 Performance API 实现前端性能监控
 */

interface PerformanceMetrics {
  // 首屏加载指标
  firstContentfulPaint?: number // FCP - 首次内容绘制
  largestContentfulPaint?: number // LCP - 最大内容绘制
  firstInputDelay?: number // FID - 首次输入延迟
  cumulativeLayoutShift?: number // CLS - 累积布局偏移
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

  /**
   * 初始化性能监控
   */
  init() {
    if (typeof window === 'undefined' || !window.performance) {
      console.warn('[Performance Monitor] Performance API not supported')
      return
    }

    this.observeNavigationTiming()
    this.observePaintTiming()
    this.observeLayoutShift()
    this.observeFirstInputDelay()
    this.observeLargestContentfulPaint()
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
   * 观察绘制时间（FCP）
   */
  private observePaintTiming() {
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.firstContentfulPaint = entry.startTime
              console.log(`[Performance Monitor] FCP: ${entry.startTime.toFixed(2)}ms`)
            }
          }
        })
        paintObserver.observe({ entryTypes: ['paint'] })
      } catch (error) {
        console.warn('[Performance Monitor] Paint timing not supported')
      }
    }
  }

  /**
   * 观察累积布局偏移（CLS）
   */
  private observeLayoutShift() {
    if ('PerformanceObserver' in window) {
      try {
        let clsValue = 0
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
              this.metrics.cumulativeLayoutShift = clsValue
            }
          }
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (error) {
        console.warn('[Performance Monitor] Layout shift not supported')
      }
    }
  }

  /**
   * 观察首次输入延迟（FID）
   */
  private observeFirstInputDelay() {
    if ('PerformanceObserver' in window) {
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            // 使用类型断言处理FID entry
            const firstInput = entry as any
            this.metrics.firstInputDelay = firstInput.processingStart - firstInput.startTime
            console.log(`[Performance Monitor] FID: ${this.metrics.firstInputDelay.toFixed(2)}ms`)
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (error) {
        console.warn('[Performance Monitor] First input delay not supported')
      }
    }
  }

  /**
   * 观察最大内容绘制（LCP）
   */
  private observeLargestContentfulPaint() {
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          this.metrics.largestContentfulPaint = lastEntry.startTime
          console.log(`[Performance Monitor] LCP: ${lastEntry.startTime.toFixed(2)}ms`)
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (error) {
        console.warn('[Performance Monitor] Largest contentful paint not supported')
      }
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
   * 清理监听器
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}

// 导出单例
export const performanceMonitor = new PerformanceMonitor()
