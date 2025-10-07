import { defineStore } from 'pinia'
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { logger, LogLevel, type LogEntry, type LogStats } from '@/utils/logger'

/**
 * 日志过滤器接口
 */
export interface LogFilters {
  level: LogLevel | null
  category: string
  search: string
}

/**
 * 日志Store
 * 负责管理日志查看器和日志记录
 */
export const useLogStore = defineStore('logs', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 状态定义
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const isLogViewerVisible: Ref<boolean> = ref(false)
  const logFilters: Ref<LogFilters> = ref({
    level: null,
    category: '',
    search: ''
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 计算属性
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 所有日志
   */
  const logs: ComputedRef<LogEntry[]> = computed(() => logger.getLogs())

  /**
   * 日志统计信息
   */
  const logStats: ComputedRef<LogStats> = computed(() => logger.getStats())

  /**
   * 过滤后的日志
   */
  const filteredLogs: ComputedRef<LogEntry[]> = computed(() => {
    let result = logs.value

    if (logFilters.value.level !== null) {
      result = result.filter(log => log.level === logFilters.value.level)
    }

    if (logFilters.value.category) {
      result = result.filter(log => log.category === logFilters.value.category)
    }

    if (logFilters.value.search) {
      const query = logFilters.value.search.toLowerCase()
      result = result.filter(
        log =>
          log.message.toLowerCase().includes(query) ||
          log.category?.toLowerCase().includes(query) ||
          log.source?.toLowerCase().includes(query)
      )
    }

    return result
  })

  /**
   * 错误数量
   */
  const errorCount: ComputedRef<number> = computed(
    () => logs.value.filter(log => log.level === LogLevel.ERROR).length
  )

  /**
   * 警告数量
   */
  const warningCount: ComputedRef<number> = computed(
    () => logs.value.filter(log => log.level === LogLevel.WARN).length
  )

  /**
   * 是否有错误
   */
  const hasErrors: ComputedRef<boolean> = computed(() => errorCount.value > 0)

  /**
   * 是否有警告
   */
  const hasWarnings: ComputedRef<boolean> = computed(() => warningCount.value > 0)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 日志查看器方法
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 显示日志查看器
   */
  const showLogViewer = (): void => {
    isLogViewerVisible.value = true
  }

  /**
   * 隐藏日志查看器
   */
  const hideLogViewer = (): void => {
    isLogViewerVisible.value = false
  }

  /**
   * 切换日志查看器
   */
  const toggleLogViewer = (): void => {
    isLogViewerVisible.value = !isLogViewerVisible.value
  }

  /**
   * 设置日志过滤器
   */
  const setLogFilter = (filters: Partial<LogFilters>): void => {
    Object.assign(logFilters.value, filters)
  }

  /**
   * 清除日志过滤器
   */
  const clearLogFilters = (): void => {
    logFilters.value = {
      level: null,
      category: '',
      search: ''
    }
  }

  /**
   * 清除所有日志
   */
  const clearAllLogs = (): void => {
    logger.clear()
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 便捷的日志记录方法
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const logDebug = (message: string, data?: any): void => {
    logger.debug(message, data)
  }

  const logInfo = (message: string, data?: any): void => {
    logger.info(message, data)
  }

  const logWarn = (message: string, data?: any): void => {
    logger.warn(message, data)
  }

  const logError = (message: string, data?: any): void => {
    logger.error(message, data)
  }

  const logSuccess = (message: string, data?: any): void => {
    logger.success(message, data)
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 专用日志记录方法
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * API请求日志
   */
  const logApiRequest = (method: string, url: string, data?: any): void => {
    logInfo(`${method.toUpperCase()} ${url}`, {
      ...data,
      category: 'api',
      source: 'http-client'
    })
  }

  /**
   * API响应日志
   */
  const logApiResponse = (method: string, url: string, status: number, data?: any): void => {
    const level =
      status >= 400 ? LogLevel.ERROR : status >= 300 ? LogLevel.WARN : LogLevel.SUCCESS
    const message = `${method.toUpperCase()} ${url} - ${status}`
    const logData = { ...data, category: 'api', source: 'http-client' }

    if (level === LogLevel.ERROR) {
      logError(message, logData)
    } else if (level === LogLevel.WARN) {
      logWarn(message, logData)
    } else {
      logSuccess(message, logData)
    }
  }

  /**
   * 用户操作日志
   */
  const logUserAction = (action: string, details?: any): void => {
    logInfo(`用户操作: ${action}`, {
      ...details,
      category: 'user',
      source: 'ui'
    })
  }

  /**
   * 系统事件日志
   */
  const logSystemEvent = (event: string, details?: any): void => {
    logInfo(`系统事件: ${event}`, {
      ...details,
      category: 'system',
      source: 'system'
    })
  }

  /**
   * 性能日志
   */
  const logPerformance = (operation: string, duration: number, details?: any): void => {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.INFO
    const message = `性能: ${operation} 耗时 ${duration}ms`
    const logData = { ...details, category: 'performance', source: 'performance' }

    if (level === LogLevel.WARN) {
      logWarn(message, logData)
    } else {
      logInfo(message, logData)
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 返回Store接口
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  return {
    // 状态
    isLogViewerVisible,
    logFilters,

    // 计算属性
    logs,
    logStats,
    filteredLogs,
    errorCount,
    warningCount,
    hasErrors,
    hasWarnings,

    // 日志查看器方法
    showLogViewer,
    hideLogViewer,
    toggleLogViewer,
    setLogFilter,
    clearLogFilters,
    clearAllLogs,

    // 日志记录方法
    logDebug,
    logInfo,
    logWarn,
    logError,
    logSuccess,

    // 专用日志记录方法
    logApiRequest,
    logApiResponse,
    logUserAction,
    logSystemEvent,
    logPerformance
  }
})
