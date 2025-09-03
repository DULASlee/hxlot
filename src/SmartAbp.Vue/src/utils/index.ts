// 导入需要在函数中使用的模块
import { logger, LogLevel } from './logger'
import { logManager } from './logManager'
import { analyzeCurrentLogs } from './logAnalyzer'
import { logExporter } from './logExporter'

// 导出日志系统核心功能
export { logger, LogLevel, LOG_LEVEL_NAMES } from './logger'
export { logManager, trackPerformance } from './logManager'
export { logAnalyzer, analyzeCurrentLogs } from './logAnalyzer'
export { logExporter, ExportFormat } from './logExporter'

// 导出类型
export type { LogEntry, LogStats } from './logger'
export type { PerformanceTracker, PerformanceStats, ErrorStats } from './logManager'
export type { ExportConfig } from './logExporter'

// 便捷的日志记录函数
export const createLogger = () => logger
export const getLogAnalysis = () => analyzeCurrentLogs()
export const exportLogs = (config?: any) => logExporter.downloadLogs(config)

// 快速日志记录
export const logInfo = (message: string, data?: any) => {
  logger.info(message, data)
}
export const logSuccess = (message: string, data?: any) => {
  logger.success(message, data)
}
export const logWarn = (message: string, data?: any) => {
  logger.warn(message, data)
}
export const logError = (message: string, data?: any) => {
  logger.error(message, data)
}
export const logDebug = (message: string, data?: any) => {
  logger.debug(message, data)
}

// 性能追踪
export const startTracking = (name: string, category?: string) => {
  return logManager.startPerformanceTracking(name, category)
}
export const endTracking = (trackingId: string) => {
  return logManager.endPerformanceTracking(trackingId)
}

// 批量日志记录
export const logBatch = (entries: Array<{
  level: any
  message: string
  category?: string
  data?: any
}>) => logManager.logBatch(entries)

// 清理日志
export const clearLogs = () => {
  logger.clear()
  logManager.cleanup()
}

// 获取日志统计
export const getLogStats = () => {
  const logs = logger.getLogs()
  return {
    total: logs.length,
    info: logs.filter((log: any) => log.level === LogLevel.INFO).length,
    success: logs.filter((log: any) => log.level === LogLevel.SUCCESS).length,
    warn: logs.filter((log: any) => log.level === LogLevel.WARN).length,
    error: logs.filter((log: any) => log.level === LogLevel.ERROR).length,
    debug: logs.filter((log: any) => log.level === LogLevel.DEBUG).length
  }
}

// 导出认证相关
export { authService } from './auth'
export { useAuth } from './useAuth'
