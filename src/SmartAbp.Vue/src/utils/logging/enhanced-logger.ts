/**
 * 增强的结构化日志器
 * 支持传输器架构、子日志器、完整的结构化格式
 */

import { ref, computed, type Ref } from "vue"
import {
  LogTransport,
  LogEntry,
  LogLevel,
  LOG_LEVEL_NAMES,
  ConsoleTransport,
  FileTransport,
  MemoryTransport,
} from "./transports"

export interface LoggerOptions {
  level?: LogLevel
  context?: Record<string, any>
  transports?: LogTransport[]
  enableBatching?: boolean
  batchSize?: number
  batchTimeout?: number
}

export interface LogStats {
  total: number
  debug: number
  info: number
  success: number
  warn: number
  error: number
  fatal: number
}

export interface PerformanceTimer {
  name: string
  startTime: number
  context?: Record<string, any>
  end(metadata?: Record<string, any>): number
}

/**
 * 增强的结构化日志器类
 */
export class EnhancedLogger {
  private level: LogLevel
  private context: Record<string, any>
  private transports: LogTransport[] = []
  private logs: Ref<LogEntry[]> = ref([])
  private childLoggers = new Map<string, EnhancedLogger>()
  private subscribers: Array<(logs: LogEntry[]) => void> = []
  private maxLogs = 1000

  // 批量处理配置
  private enableBatching: boolean
  private batchSize: number
  private batchTimeout: number
  private batchQueue: LogEntry[] = []
  private batchTimer?: number

  // 性能追踪
  private activeTimers = new Map<string, PerformanceTimer>()

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? LogLevel.DEBUG
    this.context = { ...options.context }
    this.enableBatching = options.enableBatching ?? true
    this.batchSize = options.batchSize ?? 10
    this.batchTimeout = options.batchTimeout ?? 100

    // 初始化默认传输器
    if (options.transports) {
      this.transports = [...options.transports]
    } else {
      this.addDefaultTransports()
    }
  }

  // ============= 基础日志方法 =============

  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata)
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata)
  }

  success(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.SUCCESS, message, metadata)
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata)
  }

  error(message: string, error?: Error | string, metadata?: Record<string, any>): void {
    const enhancedMetadata = { ...metadata }

    if (error) {
      if (error instanceof Error) {
        enhancedMetadata.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      } else {
        enhancedMetadata.errorMessage = error
      }
    }

    this.log(LogLevel.ERROR, message, enhancedMetadata)
  }

  fatal(message: string, error?: Error | string, metadata?: Record<string, any>): void {
    const enhancedMetadata = { ...metadata }

    if (error) {
      if (error instanceof Error) {
        enhancedMetadata.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      } else {
        enhancedMetadata.errorMessage = error
      }
    }

    this.log(LogLevel.FATAL, message, enhancedMetadata)
  }

  // ============= 核心日志方法 =============

  private log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    if (level < this.level) return

    const entry: LogEntry = {
      id: this.generateId(),
      level,
      message,
      timestamp: Date.now(),
      context: { ...this.context },
      metadata: metadata || {},
      source: this.context.source || "unknown",
    }

    // 添加到内存日志
    this.addToLogs(entry)

    // 分发到传输器
    if (this.enableBatching) {
      this.addToBatch(entry)
    } else {
      this.writeToTransports(entry)
    }

    // 通知订阅者
    this.notifySubscribers()
  }

  // ============= 子日志器支持 =============

  child(context: Record<string, any>, options?: Partial<LoggerOptions>): EnhancedLogger {
    const contextKey = JSON.stringify(context)

    if (this.childLoggers.has(contextKey)) {
      return this.childLoggers.get(contextKey)!
    }

    const mergedContext = { ...this.context, ...context }
    const childLogger = new EnhancedLogger({
      level: options?.level ?? this.level,
      context: mergedContext,
      transports: options?.transports ?? this.transports,
      enableBatching: options?.enableBatching ?? this.enableBatching,
      batchSize: options?.batchSize ?? this.batchSize,
      batchTimeout: options?.batchTimeout ?? this.batchTimeout,
    })

    // 子日志器的日志也会同步到父日志器
    childLogger.subscribe((logs) => {
      logs.forEach((entry) => {
        if (!this.logs.value.find((existing) => existing.id === entry.id)) {
          this.addToLogs(entry)
          this.notifySubscribers()
        }
      })
    })

    this.childLoggers.set(contextKey, childLogger)
    return childLogger
  }

  // ============= 性能追踪 =============

  startTimer(name: string, context?: Record<string, any>): PerformanceTimer {
    const timer: PerformanceTimer = {
      name,
      startTime: performance.now(),
      context: { ...this.context, ...context },
      end: (metadata?: Record<string, any>) => {
        const duration = performance.now() - timer.startTime

        this.debug(`Timer completed: ${name}`, {
          duration: Math.round(duration * 100) / 100,
          ...timer.context,
          ...metadata,
        })

        this.activeTimers.delete(name)
        return duration
      },
    }

    this.activeTimers.set(name, timer)

    this.debug(`Timer started: ${name}`, timer.context)
    return timer
  }

  async trackAsync<T>(
    name: string,
    operation: () => Promise<T>,
    context?: Record<string, any>,
  ): Promise<T> {
    const timer = this.startTimer(name, context)

    try {
      const result = await operation()
      timer.end({ success: true })
      return result
    } catch (error) {
      timer.end({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  trackSync<T>(name: string, operation: () => T, context?: Record<string, any>): T {
    const timer = this.startTimer(name, context)

    try {
      const result = operation()
      timer.end({ success: true })
      return result
    } catch (error) {
      timer.end({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  // ============= 传输器管理 =============

  addTransport(transport: LogTransport): void {
    this.transports.push(transport)
  }

  removeTransport(name: string): boolean {
    const index = this.transports.findIndex((t) => t.name === name)
    if (index >= 0) {
      this.transports.splice(index, 1)
      return true
    }
    return false
  }

  getTransports(): LogTransport[] {
    return [...this.transports]
  }

  private addDefaultTransports(): void {
    // 添加控制台传输器
    this.transports.push(
      new ConsoleTransport({
        level: LogLevel.DEBUG,
        enableColors: true,
        enableGrouping: true,
      }),
    )

    // 在生产环境添加文件传输器
    if (process.env.NODE_ENV === "production") {
      this.transports.push(
        new FileTransport({
          level: LogLevel.WARN,
          filePath: "logs/smartabp.log",
        }),
      )
    }

    // 开发环境添加内存传输器用于调试
    if (process.env.NODE_ENV === "development") {
      this.transports.push(
        new MemoryTransport({
          level: LogLevel.DEBUG,
          maxEntries: 500,
        }),
      )
    }
  }

  // ============= 批量处理 =============

  private addToBatch(entry: LogEntry): void {
    this.batchQueue.push(entry)

    if (this.batchQueue.length >= this.batchSize) {
      this.flushBatch()
    } else if (!this.batchTimer) {
      this.batchTimer = window.setTimeout(() => {
        this.flushBatch()
      }, this.batchTimeout)
    }
  }

  private flushBatch(): void {
    if (this.batchQueue.length === 0) return

    const batch = [...this.batchQueue]
    this.batchQueue = []

    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = undefined
    }

    batch.forEach((entry) => this.writeToTransports(entry))
  }

  private async writeToTransports(entry: LogEntry): Promise<void> {
    const promises = this.transports.map(async (transport) => {
      try {
        await transport.write(entry)
      } catch (error) {
        console.error(`Transport ${transport.name} failed:`, error)
      }
    })

    await Promise.allSettled(promises)
  }

  // ============= 内存日志管理 =============

  private addToLogs(entry: LogEntry): void {
    this.logs.value.push(entry)

    // 限制内存使用
    if (this.logs.value.length > this.maxLogs) {
      this.logs.value.shift()
    }
  }

  // ============= 统计和分析 =============

  getStats(): LogStats {
    const logs = this.logs.value
    return {
      total: logs.length,
      debug: logs.filter((log) => log.level === LogLevel.DEBUG).length,
      info: logs.filter((log) => log.level === LogLevel.INFO).length,
      success: logs.filter((log) => log.level === LogLevel.SUCCESS).length,
      warn: logs.filter((log) => log.level === LogLevel.WARN).length,
      error: logs.filter((log) => log.level === LogLevel.ERROR).length,
      fatal: logs.filter((log) => log.level === LogLevel.FATAL).length,
    }
  }

  getStatsRef() {
    return computed(() => this.getStats())
  }

  // ============= 数据访问 =============

  getLogs(): LogEntry[] {
    return [...this.logs.value]
  }

  getLogsRef(): Ref<LogEntry[]> {
    return this.logs
  }

  // ============= 订阅机制 =============

  subscribe(callback: (logs: LogEntry[]) => void): () => void {
    this.subscribers.push(callback)
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index >= 0) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(this.logs.value)
      } catch (error) {
        console.error("Logger subscriber error:", error)
      }
    })
  }

  // ============= 导出功能 =============

  export(format: "json" | "csv" | "txt" = "json"): string {
    const logs = this.logs.value

    switch (format) {
      case "json":
        return JSON.stringify(logs, null, 2)

      case "csv":
        const headers = ["时间", "级别", "消息", "来源", "上下文", "元数据"]
        const rows = logs.map((log) => [
          new Date(log.timestamp).toLocaleString(),
          LOG_LEVEL_NAMES[log.level],
          log.message,
          log.source || "",
          JSON.stringify(log.context || {}),
          JSON.stringify(log.metadata || {}),
        ])
        return [headers, ...rows].map((row) => row.join(",")).join("\n")

      case "txt":
        return logs
          .map((log) => {
            const time = new Date(log.timestamp).toLocaleString()
            const level = LOG_LEVEL_NAMES[log.level]
            const source = log.source ? `[${log.source}]` : ""
            return `[${time}] ${level} ${source}: ${log.message}`
          })
          .join("\n")

      default:
        return JSON.stringify(logs, null, 2)
    }
  }

  exportDiagnosticReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      logger: {
        level: LOG_LEVEL_NAMES[this.level],
        context: this.context,
        transports: this.transports.map((t) => ({ name: t.name, level: LOG_LEVEL_NAMES[t.level] })),
        stats: this.getStats(),
        activeTimers: Array.from(this.activeTimers.keys()),
        childLoggers: this.childLoggers.size,
      },
      system: {
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "N/A",
        url: typeof window !== "undefined" ? window.location.href : "N/A",
        timestamp: Date.now(),
        memory:
          typeof performance !== "undefined" && (performance as any).memory
            ? {
                usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
                totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
                jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
              }
            : null,
      },
      recentLogs: this.logs.value.slice(-50), // 最近50条日志
    }

    return JSON.stringify(report, null, 2)
  }

  // ============= 管理方法 =============

  setLevel(level: LogLevel): void {
    this.level = level
    this.info("Logger level changed", { newLevel: LOG_LEVEL_NAMES[level] })
  }

  setMaxLogs(max: number): void {
    this.maxLogs = max
    if (this.logs.value.length > max) {
      const removed = this.logs.value.splice(0, this.logs.value.length - max)
      this.info("Log buffer trimmed", {
        removedCount: removed.length,
        newSize: this.logs.value.length,
      })
    }
  }

  clear(): void {
    const count = this.logs.value.length
    this.logs.value.splice(0)
    this.info("Logs cleared", { clearedCount: count })
    this.notifySubscribers()
  }

  async flush(): Promise<void> {
    this.flushBatch()

    // 刷新所有传输器
    const promises = this.transports.map(async (transport) => {
      if (transport.flush) {
        try {
          await transport.flush()
        } catch (error) {
          console.error(`Transport ${transport.name} flush failed:`, error)
        }
      }
    })

    await Promise.allSettled(promises)
  }

  async destroy(): Promise<void> {
    this.info("Logger shutting down")

    await this.flush()

    // 销毁所有传输器
    const promises = this.transports.map(async (transport) => {
      if (transport.destroy) {
        try {
          await transport.destroy()
        } catch (error) {
          console.error(`Transport ${transport.name} destroy failed:`, error)
        }
      }
    })

    await Promise.allSettled(promises)

    // 清理资源
    this.subscribers = []
    this.childLoggers.clear()
    this.activeTimers.clear()
    this.transports = []

    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
    }
  }

  // ============= 私有工具方法 =============

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * 创建增强日志器的便捷函数
 */
export function createLogger(options?: LoggerOptions): EnhancedLogger {
  return new EnhancedLogger(options)
}

/**
 * 为特定模块创建日志器
 */
export function createModuleLogger(moduleName: string, options?: LoggerOptions): EnhancedLogger {
  return new EnhancedLogger({
    ...options,
    context: {
      module: moduleName,
      ...options?.context,
    },
  })
}
