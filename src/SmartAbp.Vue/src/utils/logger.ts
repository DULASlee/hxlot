import { ref, type Ref } from 'vue'

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

// 日志记录器类
class Logger {
  private logs: Ref<LogEntry[]> = ref([])
  private subscribers: LogSubscriber[] = []
  private maxLogs = 1000

  // 添加日志条目
  private addLog(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      timestamp: Date.now(),
      data
    }

    this.logs.value.push(entry)

    // 限制日志数量
    if (this.logs.value.length > this.maxLogs) {
      this.logs.value.shift()
    }

    this.notifySubscribers()
  }

  // 通知订阅者
  private notifySubscribers() {
    this.subscribers.forEach(subscriber => {
      subscriber(this.logs.value)
    })
  }

  // 调试日志
  debug(message: string, data?: any) {
    this.addLog(LogLevel.DEBUG, message, data)
    console.debug(`[DEBUG] ${message}`, data)
  }

  // 信息日志
  info(message: string, data?: any) {
    this.addLog(LogLevel.INFO, message, data)
    console.info(`[INFO] ${message}`, data)
  }

  // 成功日志
  success(message: string, data?: any) {
    this.addLog(LogLevel.SUCCESS, message, data)
    console.log(`[SUCCESS] ${message}`, data)
  }

  // 警告日志
  warn(message: string, data?: any) {
    this.addLog(LogLevel.WARN, message, data)
    console.warn(`[WARN] ${message}`, data)
  }

  // 错误日志
  error(message: string, data?: any) {
    this.addLog(LogLevel.ERROR, message, data)
    console.error(`[ERROR] ${message}`, data)
  }

  // 获取所有日志
  getLogs() {
    return this.logs.value
  }

  // 获取日志的响应式引用
  getLogsRef() {
    return this.logs
  }

  // 获取日志统计
  getStats(): LogStats {
    const logs = this.logs.value
    return {
      total: logs.length,
      debug: logs.filter(log => log.level === LogLevel.DEBUG).length,
      info: logs.filter(log => log.level === LogLevel.INFO).length,
      success: logs.filter(log => log.level === LogLevel.SUCCESS).length,
      warn: logs.filter(log => log.level === LogLevel.WARN).length,
      error: logs.filter(log => log.level === LogLevel.ERROR).length
    }
  }

  // 导出日志
  export(format: 'json' | 'csv' | 'txt' = 'json'): string {
    const logs = this.logs.value

    switch (format) {
      case 'json':
        return JSON.stringify(logs, null, 2)
      case 'csv':
        const headers = ['时间', '级别', '消息', '分类', '数据']
        const rows = logs.map(log => [
          new Date(log.timestamp).toLocaleString(),
          LOG_LEVEL_NAMES[log.level],
          log.message,
          log.category || '',
          log.data ? JSON.stringify(log.data) : ''
        ])
        return [headers, ...rows].map(row => row.join(',')).join('\n')
      case 'txt':
        return logs.map(log =>
          `[${new Date(log.timestamp).toLocaleString()}] ${LOG_LEVEL_NAMES[log.level]}: ${log.message}`
        ).join('\n')
      default:
        return JSON.stringify(logs, null, 2)
    }
  }

  // 清空日志
  clear() {
    this.logs.value.splice(0, this.logs.value.length)
    this.notifySubscribers()
  }

  // 订阅日志变化
  subscribe(callback: LogSubscriber) {
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
    this.maxLogs = max
    if (this.logs.value.length > max) {
      this.logs.value.splice(0, this.logs.value.length - max)
      this.notifySubscribers()
    }
  }
}

// 创建全局日志实例
export const logger = new Logger()

