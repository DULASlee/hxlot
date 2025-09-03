import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { logger, LogLevel } from '@/utils/logger'

export const useLogStore = defineStore('logs', () => {
  // 状态
  const isLogViewerVisible = ref(false)
  const logFilters = ref({
    level: null as LogLevel | null,
    category: '',
    search: ''
  })

  // 计算属性
  const logs = computed(() => logger.getLogs())
  const logStats = computed(() => logger.getStats())

  const filteredLogs = computed(() => {
    let result = logs.value

    if (logFilters.value.level !== null) {
      result = result.filter(log => log.level === logFilters.value.level)
    }

    if (logFilters.value.category) {
      result = result.filter(log => log.category === logFilters.value.category)
    }

    if (logFilters.value.search) {
      const query = logFilters.value.search.toLowerCase()
      result = result.filter(log =>
        log.message.toLowerCase().includes(query) ||
        log.category?.toLowerCase().includes(query) ||
        log.source?.toLowerCase().includes(query)
      )
    }

    return result
  })

  const errorCount = computed(() =>
    logs.value.filter(log => log.level === LogLevel.ERROR).length
  )

  const warningCount = computed(() =>
    logs.value.filter(log => log.level === LogLevel.WARN).length
  )

  const hasErrors = computed(() => errorCount.value > 0)
  const hasWarnings = computed(() => warningCount.value > 0)

  // 方法
  const showLogViewer = () => {
    isLogViewerVisible.value = true
  }

  const hideLogViewer = () => {
    isLogViewerVisible.value = false
  }

  const toggleLogViewer = () => {
    isLogViewerVisible.value = !isLogViewerVisible.value
  }

  const setLogFilter = (filters: Partial<typeof logFilters.value>) => {
    Object.assign(logFilters.value, filters)
  }

  const clearLogFilters = () => {
    logFilters.value = {
      level: null,
      category: '',
      search: ''
    }
  }

  const clearAllLogs = () => {
    logger.clear()
  }

  // 便捷的日志记录方法
  const logDebug = (message: string, data?: any) => {
    logger.debug(message, data)
  }

  const logInfo = (message: string, data?: any) => {
    logger.info(message, data)
  }

  const logWarn = (message: string, data?: any) => {
    logger.warn(message, data)
  }

  const logError = (message: string, data?: any) => {
    logger.error(message, data)
  }

  const logSuccess = (message: string, data?: any) => {
    logger.success(message, data)
  }

  // API 请求日志记录
  const logApiRequest = (method: string, url: string, data?: any) => {
    logInfo(`${method.toUpperCase()} ${url}`, { ...data, category: 'api', source: 'http-client' })
  }

  const logApiResponse = (method: string, url: string, status: number, data?: any) => {
    const level = status >= 400 ? LogLevel.ERROR : status >= 300 ? LogLevel.WARN : LogLevel.SUCCESS
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

  // 用户操作日志记录
  const logUserAction = (action: string, details?: any) => {
    logInfo(`用户操作: ${action}`, { ...details, category: 'user', source: 'ui' })
  }

  // 系统事件日志记录
  const logSystemEvent = (event: string, details?: any) => {
    logInfo(`系统事件: ${event}`, { ...details, category: 'system', source: 'system' })
  }

  // 性能日志记录
  const logPerformance = (operation: string, duration: number, details?: any) => {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.INFO
    const message = `性能: ${operation} 耗时 ${duration}ms`
    const logData = { ...details, category: 'performance', source: 'performance' }

    if (level === LogLevel.WARN) {
      logWarn(message, logData)
    } else {
      logInfo(message, logData)
    }
  }

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

    // 方法
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
