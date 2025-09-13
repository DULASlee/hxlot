import { ref, computed } from "vue"
import { logger, LogLevel } from "@/utils/logger"

// 性能追踪器接口
export interface PerformanceTracker {
  id: string
  name: string
  category?: string
  startTime: number
  endTime: number
  duration: number
  metadata: Record<string, any>
  end: (metadata?: Record<string, any>) => PerformanceTracker | null
}

// 性能统计接口
export interface PerformanceStats {
  averageTime: number
  totalOperations: number
  slowestOperation: number
  fastestOperation: number
  count: number
  total: number
  average: number
  min: number
  max: number
}

// 错误统计接口
export interface ErrorStats {
  total: number
  byCategory: Record<string, number>
  recent: number
  contexts: Record<string, number>
}

// 日志管理器类
class LogManager {
  private performanceEntries = ref<PerformanceTracker[]>([])
  private activeTrackers = new Map<string, PerformanceTracker>()
  private errorReports = ref<any[]>([])

  // 开始性能追踪
  startPerformanceTracking(name: string, category?: string): PerformanceTracker {
    const tracker: PerformanceTracker = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      category,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      metadata: {},
      end: (metadata?: Record<string, any>) => {
        return this.endPerformanceTracking(tracker.id, metadata)
      },
    }

    this.activeTrackers.set(tracker.id, tracker)
    return tracker
  }

  // 结束性能追踪
  endPerformanceTracking(
    trackingId: string,
    metadata?: Record<string, any>,
  ): PerformanceTracker | null {
    const tracker = this.activeTrackers.get(trackingId)
    if (!tracker) {
      logger.warn(`性能追踪器未找到: ${trackingId}`)
      return null
    }

    tracker.endTime = performance.now()
    tracker.duration = tracker.endTime - tracker.startTime
    if (metadata) {
      tracker.metadata = { ...tracker.metadata, ...metadata }
    }

    this.performanceEntries.value.push(tracker)
    this.activeTrackers.delete(trackingId)

    // 记录性能日志
    if (tracker.duration > 1000) {
      logger.warn(`性能警告: ${tracker.name} 执行时间过长`, {
        duration: tracker.duration,
        category: tracker.category,
      })
    } else {
      logger.debug(`性能追踪: ${tracker.name} 完成`, {
        duration: tracker.duration,
        category: tracker.category,
      })
    }

    return tracker
  }

  // 获取性能统计
  getPerformanceStats(): PerformanceStats {
    const entries = this.performanceEntries.value
    const avgTime =
      entries.length > 0
        ? entries.reduce((sum, entry) => sum + entry.duration, 0) / entries.length
        : 0
    const maxTime = entries.length > 0 ? Math.max(...entries.map((entry) => entry.duration)) : 0
    const minTime = entries.length > 0 ? Math.min(...entries.map((entry) => entry.duration)) : 0

    return {
      averageTime: avgTime,
      totalOperations: entries.length,
      slowestOperation: maxTime,
      fastestOperation: minTime,
      count: entries.length,
      total: entries.length,
      average: avgTime,
      min: minTime,
      max: maxTime,
    }
  }

  // 获取性能条目
  getPerformanceEntries() {
    return this.performanceEntries
  }

  // 获取错误统计
  getErrorStats(): ErrorStats {
    const logs = logger.getLogs()
    const errorLogs = logs.filter((log) => log.level === LogLevel.ERROR)

    const byCategory: Record<string, number> = {}
    const contexts: Record<string, number> = {}

    errorLogs.forEach((log) => {
      const category = log.category || "unknown"
      byCategory[category] = (byCategory[category] || 0) + 1

      // 使用category作为context
      contexts[category] = (contexts[category] || 0) + 1
    })

    const recent = errorLogs.filter(
      (log) => Date.now() - log.timestamp < 24 * 60 * 60 * 1000, // 最近24小时
    ).length

    return {
      total: errorLogs.length,
      byCategory,
      recent,
      contexts,
    }
  }

  // 获取错误报告
  getErrorReports() {
    return this.errorReports
  }

  // 批量记录日志
  logBatch(
    entries: Array<{
      level: LogLevel
      message: string
      category?: string
      data?: any
    }>,
  ) {
    for (const e of entries) {
      const options = { ...(e.data || {}), category: e.category }
      switch (e.level) {
        case LogLevel.DEBUG:
          logger.debug(e.message, options)
          break
        case LogLevel.INFO:
          logger.info(e.message, options)
          break
        case LogLevel.SUCCESS:
          logger.success(e.message, options)
          break
        case LogLevel.WARN:
          logger.warn(e.message, options)
          break
        case LogLevel.ERROR:
          logger.error(e.message, options)
          break
        default:
          logger.info(e.message, options)
      }
    }
  }

  // 导出诊断报告
  exportDiagnosticReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      performance: this.getPerformanceStats(),
      errors: this.getErrorStats(),
      logs: logger.getLogs().slice(-100), // 最近100条日志
      system: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
      },
    }

    return JSON.stringify(report, null, 2)
  }

  // 清理数据
  cleanup() {
    this.performanceEntries.value.splice(0)
    this.errorReports.value.splice(0)
    this.activeTrackers.clear()
  }

  // 获取活跃的追踪器
  getActiveTrackers() {
    return Array.from(this.activeTrackers.values())
  }

  // 性能统计的响应式属性
  get performanceStats() {
    return computed(() => this.getPerformanceStats())
  }

  // 错误统计的响应式属性
  get errorStats() {
    return computed(() => this.getErrorStats())
  }
}

// 创建全局日志管理器实例
export const logManager = new LogManager()

// 便捷的性能追踪函数
export function trackPerformance<T>(
  name: string,
  fn: () => T | Promise<T>,
  category?: string,
): T | Promise<T> {
  const tracker = logManager.startPerformanceTracking(name, category)

  try {
    const result = fn()

    if (result instanceof Promise) {
      return result.finally(() => {
        tracker.end()
      }) as T
    } else {
      tracker.end()
      return result
    }
  } catch (error) {
    tracker.end({ error: error instanceof Error ? error.message : String(error) })
    throw error
  }
}
