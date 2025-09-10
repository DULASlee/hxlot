/**
 * 向后兼容的日志器 - 现在基于增强的日志系统
 * @deprecated 建议使用 @/utils/logging 中的新日志系统
 */

import { ref, type Ref } from 'vue'
import { logger as enhancedLogger, LogLevel as EnhancedLogLevel } from './logging'

// 日志级别枚举
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  SUCCESS = 2,
  WARN = 3,
  ERROR = 4
}

// 日志级别名称映射
export const LOG_LEVEL_NAMES = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.SUCCESS]: 'SUCCESS',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR'
}

// 日志级别颜色映射
export const LOG_LEVEL_COLORS = {
  [LogLevel.DEBUG]: '#909399',
  [LogLevel.INFO]: '#409EFF',
  [LogLevel.SUCCESS]: '#67C23A',
  [LogLevel.WARN]: '#E6A23C',
  [LogLevel.ERROR]: '#F56C6C'
}

// 日志条目接口
export interface LogEntry {
  id: string
  level: LogLevel
  message: string
  timestamp: number
  category?: string
  data?: any
  source?: string
  stack?: string
}

// 日志统计接口
export interface LogStats {
  total: number
  debug: number
  info: number
  success: number
  warn: number
  error: number
}

// 日志订阅者类型
type LogSubscriber = (logs: LogEntry[]) => void

// 兼容性日志记录器类 - 包装增强日志系统
class Logger {
  private compatLogger = enhancedLogger.child({ source: 'legacy-logger' })
  private subscribers: LogSubscriber[] = []

  // 调试日志
  debug(message: string, data?: any) {
    this.compatLogger.debug(message, data)
    this.notifySubscribers()
  }

  // 信息日志
  info(message: string, data?: any) {
    this.compatLogger.info(message, data)
    this.notifySubscribers()
  }

  // 成功日志
  success(message: string, data?: any) {
    this.compatLogger.success(message, data)
    this.notifySubscribers()
  }

  // 警告日志
  warn(message: string, data?: any) {
    this.compatLogger.warn(message, data)
    this.notifySubscribers()
  }

  // 错误日志
  error(message: string, data?: any) {
    this.compatLogger.error(message, data)
    this.notifySubscribers()
  }

  // 通知订阅者
  private notifySubscribers() {
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(this.getLogs())
      } catch (error) {
        console.error('Logger subscriber error:', error)
      }
    })
  }

  // 获取所有日志 - 转换格式以保持兼容性
  getLogs(): LogEntry[] {
    const enhancedLogs = this.compatLogger.getLogs()
    return enhancedLogs.map(log => ({
      id: log.id,
      level: this.mapEnhancedLogLevel(log.level),
      message: log.message,
      timestamp: log.timestamp,
      category: log.context?.category || log.context?.module || log.source,
      data: log.metadata,
      source: log.source,
      stack: log.metadata?.error?.stack
    }))
  }

  // 获取日志的响应式引用
  getLogsRef(): Ref<LogEntry[]> {
    // 创建响应式引用，实时转换增强日志格式
    return ref(this.getLogs())
  }

  // 获取日志统计
  getStats(): LogStats {
    const logs = this.getLogs()
    return {
      total: logs.length,
      debug: logs.filter(log => log.level === LogLevel.DEBUG).length,
      info: logs.filter(log => log.level === LogLevel.INFO).length,
      success: logs.filter(log => log.level === LogLevel.SUCCESS).length,
      warn: logs.filter(log => log.level === LogLevel.WARN).length,
      error: logs.filter(log => log.level === LogLevel.ERROR).length
    }
  }

  // 映射增强日志级别到旧格式
  private mapEnhancedLogLevel(level: number): LogLevel {
    switch (level) {
      case EnhancedLogLevel.DEBUG: return LogLevel.DEBUG
      case EnhancedLogLevel.INFO: return LogLevel.INFO
      case EnhancedLogLevel.SUCCESS: return LogLevel.SUCCESS
      case EnhancedLogLevel.WARN: return LogLevel.WARN
      case EnhancedLogLevel.ERROR:
      case EnhancedLogLevel.FATAL:
        return LogLevel.ERROR
      default: return LogLevel.INFO
    }
  }

  // 导出日志 - 委托给增强日志系统
  export(format: 'json' | 'csv' | 'txt' = 'json'): string {
    return this.compatLogger.export(format)
  }

  // 清空日志
  clear() {
    this.compatLogger.clear()
    this.notifySubscribers()
  }

  // 订阅日志变化
  subscribe(callback: LogSubscriber): () => void {
    this.subscribers.push(callback)
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  // 设置最大日志数量
  setMaxLogs(max: number) {
    this.compatLogger.setMaxLogs(max)
    this.notifySubscribers()
  }

  // 新增：访问增强日志系统的方法
  getEnhancedLogger() {
    return this.compatLogger
  }
}

// 创建全局日志实例 - 向后兼容
export const logger = new Logger()

// ============= 迁移提示和新API推荐 =============

/**
 * @deprecated 建议迁移到新的增强日志系统
 *
 * 旧API：
 * import { logger } from '@/utils/logger'
 * logger.info('消息', data)
 *
 * 新API：
 * import { logger, createComponentLogger } from '@/utils/logging'
 * const componentLogger = createComponentLogger('MyComponent')
 * componentLogger.info('消息', data)
 *
 * 新API优势：
 * - 传输器架构 (ConsoleTransport, FileTransport, NetworkTransport)
 * - 结构化日志格式
 * - 子日志器支持 logger.child({ component: 'Name' })
 * - 性能追踪 logger.trackAsync()
 * - 真正的文件写入
 * - 批量处理优化
 */

// 便捷的迁移方法 - 直接暴露增强日志系统的功能
export const enhanced = {
  // 获取增强日志器
  getLogger: () => enhancedLogger,

  // 创建子日志器
  child: (context: Record<string, any>) => enhancedLogger.child(context),

  // 性能追踪
  trackAsync: <T>(name: string, operation: () => Promise<T>, context?: Record<string, any>) =>
    enhancedLogger.trackAsync(name, operation, context),

  trackSync: <T>(name: string, operation: () => T, context?: Record<string, any>) =>
    enhancedLogger.trackSync(name, operation, context),

  // 导出诊断报告
  exportDiagnostic: () => enhancedLogger.exportDiagnosticReport()
}

/**
 * 快速迁移示例：
 *
 * // 旧方式
 * logger.info('用户操作', { userId: 123, action: 'login' })
 *
 * // 新方式 (推荐)
 * import { createComponentLogger } from '@/utils/logging'
 * const userLogger = createComponentLogger('UserComponent')
 * userLogger.info('用户操作', { userId: 123, action: 'login' })
 *
 * // 或者使用增强功能
 * import { enhanced } from '@/utils/logger'
 * const userLogger = enhanced.child({ component: 'UserComponent' })
 * userLogger.info('用户操作', { userId: 123, action: 'login' })
 */

