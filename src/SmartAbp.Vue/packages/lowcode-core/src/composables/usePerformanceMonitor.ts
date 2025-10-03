/**
 * 性能监控 Composable
 * 提供性能指标收集和监控功能
 */

import { ref, onMounted, onUnmounted } from 'vue'

export interface PerformanceMetrics {
  fps: number // 帧率
  memory: {
    used: number
    total: number
    limit: number
  } | null
  renderTime: number // 渲染时间
  apiLatency: number[] // API延迟列表
}

export interface PerformanceThresholds {
  minFPS?: number // 最小可接受FPS
  maxRenderTime?: number // 最大渲染时间（ms）
  maxMemoryUsage?: number // 最大内存使用（MB）
  maxAPILatency?: number // 最大API延迟（ms）
}

/**
 * 性能监控Hook
 */
export function usePerformanceMonitor(options: {
  enabled?: boolean
  thresholds?: PerformanceThresholds
  onWarning?: (metric: string, value: number, threshold: number) => void
} = {}) {
  const enabled = options.enabled !== false
  const thresholds = options.thresholds || {}
  
  const metrics = ref<PerformanceMetrics>({
    fps: 60,
    memory: null,
    renderTime: 0,
    apiLatency: []
  })

  const warnings = ref<Array<{ metric: string; value: number; threshold: number; timestamp: number }>>([])

  let frameCount = 0
  let lastTime = performance.now()
  let animationId: number | null = null

  /**
   * 测量FPS
   */
  const measureFPS = () => {
    frameCount++
    const currentTime = performance.now()
    
    if (currentTime >= lastTime + 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
      metrics.value.fps = fps
      
      // 检查阈值
      if (thresholds.minFPS && fps < thresholds.minFPS) {
        addWarning('fps', fps, thresholds.minFPS)
      }
      
      frameCount = 0
      lastTime = currentTime
    }
    
    if (enabled) {
      animationId = requestAnimationFrame(measureFPS)
    }
  }

  /**
   * 测量内存使用
   */
  const measureMemory = () => {
    if ((performance as any).memory) {
      const memory = (performance as any).memory
      metrics.value.memory = {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      }
      
      // 检查阈值
      if (thresholds.maxMemoryUsage && metrics.value.memory.used > thresholds.maxMemoryUsage) {
        addWarning('memory', metrics.value.memory.used, thresholds.maxMemoryUsage)
      }
    }
  }

  /**
   * 测量渲染时间
   */
  const measureRenderTime = (callback: () => void) => {
    const startTime = performance.now()
    
    callback()
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    metrics.value.renderTime = renderTime
    
    // 检查阈值
    if (thresholds.maxRenderTime && renderTime > thresholds.maxRenderTime) {
      addWarning('renderTime', renderTime, thresholds.maxRenderTime)
    }
    
    return renderTime
  }

  /**
   * 测量API延迟
   */
  const measureAPILatency = async <T>(
    apiCall: () => Promise<T>
  ): Promise<{ data: T; latency: number }> => {
    const startTime = performance.now()
    
    const data = await apiCall()
    
    const endTime = performance.now()
    const latency = endTime - startTime
    
    // 记录延迟
    metrics.value.apiLatency.push(latency)
    
    // 只保留最近100个记录
    if (metrics.value.apiLatency.length > 100) {
      metrics.value.apiLatency.shift()
    }
    
    // 检查阈值
    if (thresholds.maxAPILatency && latency > thresholds.maxAPILatency) {
      addWarning('apiLatency', latency, thresholds.maxAPILatency)
    }
    
    return { data, latency }
  }

  /**
   * 添加警告
   */
  const addWarning = (metric: string, value: number, threshold: number) => {
    const warning = {
      metric,
      value,
      threshold,
      timestamp: Date.now()
    }
    
    warnings.value.push(warning)
    
    // 只保留最近50个警告
    if (warnings.value.length > 50) {
      warnings.value.shift()
    }
    
    // 触发回调
    if (options.onWarning) {
      options.onWarning(metric, value, threshold)
    }
  }

  /**
   * 获取性能报告
   */
  const getPerformanceReport = () => {
    const avgAPILatency = metrics.value.apiLatency.length > 0
      ? metrics.value.apiLatency.reduce((sum, val) => sum + val, 0) / metrics.value.apiLatency.length
      : 0

    return {
      fps: {
        current: metrics.value.fps,
        status: !thresholds.minFPS || metrics.value.fps >= thresholds.minFPS ? 'good' : 'warning'
      },
      memory: metrics.value.memory ? {
        used: metrics.value.memory.used,
        total: metrics.value.memory.total,
        percentage: Math.round((metrics.value.memory.used / metrics.value.memory.total) * 100),
        status: !thresholds.maxMemoryUsage || metrics.value.memory.used <= thresholds.maxMemoryUsage ? 'good' : 'warning'
      } : null,
      renderTime: {
        current: metrics.value.renderTime,
        status: !thresholds.maxRenderTime || metrics.value.renderTime <= thresholds.maxRenderTime ? 'good' : 'warning'
      },
      apiLatency: {
        average: Math.round(avgAPILatency),
        min: metrics.value.apiLatency.length > 0 ? Math.min(...metrics.value.apiLatency) : 0,
        max: metrics.value.apiLatency.length > 0 ? Math.max(...metrics.value.apiLatency) : 0,
        status: !thresholds.maxAPILatency || avgAPILatency <= thresholds.maxAPILatency ? 'good' : 'warning'
      },
      warnings: warnings.value
    }
  }

  /**
   * 清空警告
   */
  const clearWarnings = () => {
    warnings.value = []
  }

  // 生命周期管理
  onMounted(() => {
    if (enabled) {
      measureFPS()
      
      // 定期测量内存
      const memoryInterval = setInterval(measureMemory, 5000)
      
      onUnmounted(() => {
        if (animationId !== null) {
          cancelAnimationFrame(animationId)
        }
        clearInterval(memoryInterval)
      })
    }
  })

  return {
    metrics,
    warnings,
    measureRenderTime,
    measureAPILatency,
    getPerformanceReport,
    clearWarnings
  }
}
