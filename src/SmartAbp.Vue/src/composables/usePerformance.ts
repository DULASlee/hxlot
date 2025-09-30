/**
 * 性能监控与优化 Composable
 * 提供性能指标收集、组件懒加载、资源预加载等功能
 */

import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  /** 首屏加载时间 (ms) */
  firstPaint: number
  /** 首次内容绘制时间 (ms) */
  firstContentfulPaint: number
  /** 最大内容绘制时间 (ms) */
  largestContentfulPaint: number
  /** 首次输入延迟 (ms) */
  firstInputDelay: number
  /** 累积布局偏移 */
  cumulativeLayoutShift: number
  /** 页面总加载时间 (ms) */
  loadTime: number
  /** 内存使用 (MB) */
  memoryUsage: number
}

/**
 * 资源加载优先级
 */
export type LoadPriority = 'high' | 'low' | 'auto'

/**
 * 性能监控 Composable
 */
export function usePerformance() {
  // 性能指标
  const metrics = ref<Partial<PerformanceMetrics>>({})
  const isMonitoring = ref(false)
  
  /**
   * 获取性能指标
   */
  const collectMetrics = (): Partial<PerformanceMetrics> => {
    if (!performance || !performance.getEntriesByType) {
      return {}
    }
    
    const result: Partial<PerformanceMetrics> = {}
    
    // Navigation Timing API
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      result.loadTime = navigation.loadEventEnd - navigation.fetchStart
    }
    
    // Paint Timing API
    const paintEntries = performance.getEntriesByType('paint')
    paintEntries.forEach((entry) => {
      if (entry.name === 'first-paint') {
        result.firstPaint = entry.startTime
      } else if (entry.name === 'first-contentful-paint') {
        result.firstContentfulPaint = entry.startTime
      }
    })
    
    // Performance Memory API (Chrome only)
    if ('memory' in performance) {
      const memory = (performance as Performance & { memory: { usedJSHeapSize: number } }).memory
      result.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024)
    }
    
    return result
  }
  
  /**
   * 开始性能监控
   */
  const startMonitoring = () => {
    if (isMonitoring.value) return
    
    isMonitoring.value = true
    
    // 立即收集一次指标
    metrics.value = collectMetrics()
    
    // 监听 LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number }
          if (lastEntry) {
            metrics.value.largestContentfulPaint = lastEntry.renderTime || lastEntry.startTime
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        
        // 监听 FID (First Input Delay)
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          entries.forEach((entry) => {
            const fidEntry = entry as PerformanceEntry & { processingStart?: number }
            if (fidEntry.processingStart) {
              metrics.value.firstInputDelay = fidEntry.processingStart - entry.startTime
            }
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        
        // 监听 CLS (Cumulative Layout Shift)
        const clsObserver = new PerformanceObserver((entryList) => {
          let clsValue = metrics.value.cumulativeLayoutShift || 0
          entryList.getEntries().forEach((entry) => {
            const clsEntry = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean }
            if (!clsEntry.hadRecentInput) {
              clsValue += clsEntry.value || 0
            }
          })
          metrics.value.cumulativeLayoutShift = clsValue
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        console.warn('Performance Observer not supported:', e)
      }
    }
  }
  
  /**
   * 停止性能监控
   */
  const stopMonitoring = () => {
    isMonitoring.value = false
  }
  
  /**
   * 获取性能评分 (0-100)
   */
  const getPerformanceScore = (): number => {
    const m = metrics.value
    let score = 100
    
    // FCP评分 (< 1.8s = 100, > 3s = 0)
    if (m.firstContentfulPaint) {
      if (m.firstContentfulPaint > 3000) score -= 20
      else if (m.firstContentfulPaint > 1800) score -= 10
    }
    
    // LCP评分 (< 2.5s = 100, > 4s = 0)
    if (m.largestContentfulPaint) {
      if (m.largestContentfulPaint > 4000) score -= 20
      else if (m.largestContentfulPaint > 2500) score -= 10
    }
    
    // FID评分 (< 100ms = 100, > 300ms = 0)
    if (m.firstInputDelay) {
      if (m.firstInputDelay > 300) score -= 20
      else if (m.firstInputDelay > 100) score -= 10
    }
    
    // CLS评分 (< 0.1 = 100, > 0.25 = 0)
    if (m.cumulativeLayoutShift) {
      if (m.cumulativeLayoutShift > 0.25) score -= 20
      else if (m.cumulativeLayoutShift > 0.1) score -= 10
    }
    
    return Math.max(0, score)
  }
  
  /**
   * 资源预加载
   */
  const preloadResource = (url: string, type: 'script' | 'style' | 'image' | 'font' = 'script') => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    link.as = type
    
    if (type === 'font') {
      link.crossOrigin = 'anonymous'
    }
    
    document.head.appendChild(link)
  }
  
  /**
   * 资源预连接
   */
  const preconnect = (origin: string) => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = origin
    document.head.appendChild(link)
  }
  
  /**
   * DNS预解析
   */
  const dnsPrefetch = (origin: string) => {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = origin
    document.head.appendChild(link)
  }
  
  // 生命周期
  onMounted(() => {
    // 页面加载完成后开始监控
    if (document.readyState === 'complete') {
      startMonitoring()
    } else {
      window.addEventListener('load', startMonitoring)
    }
  })
  
  onUnmounted(() => {
    stopMonitoring()
  })
  
  return {
    // 状态
    metrics,
    isMonitoring,
    
    // 方法
    startMonitoring,
    stopMonitoring,
    collectMetrics,
    getPerformanceScore,
    
    // 资源优化
    preloadResource,
    preconnect,
    dnsPrefetch
  }
}

/**
 * 图片懒加载 Composable
 */
export function useLazyImage() {
  const observer = ref<IntersectionObserver | null>(null)
  
  /**
   * 初始化图片懒加载
   */
  const initLazyLoad = (options?: IntersectionObserverInit) => {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported')
      return
    }
    
    observer.value = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const dataSrc = img.dataset.src
          
          if (dataSrc) {
            img.src = dataSrc
            img.removeAttribute('data-src')
            observer.value?.unobserve(img)
          }
        }
      })
    }, {
      rootMargin: '50px',
      ...options
    })
  }
  
  /**
   * 观察图片元素
   */
  const observe = (el: HTMLImageElement) => {
    if (!observer.value) {
      initLazyLoad()
    }
    observer.value?.observe(el)
  }
  
  /**
   * 取消观察
   */
  const unobserve = (el: HTMLImageElement) => {
    observer.value?.unobserve(el)
  }
  
  /**
   * 清理
   */
  const disconnect = () => {
    observer.value?.disconnect()
    observer.value = null
  }
  
  onUnmounted(() => {
    disconnect()
  })
  
  return {
    initLazyLoad,
    observe,
    unobserve,
    disconnect
  }
}
