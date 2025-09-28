 
/**
 * 日志传输器 - Transport Pattern 实现
 * 支持多种输出目标：控制台、文件、网络等
 */

export interface LogEntry {
  id: string
  level: LogLevel
  message: string
  timestamp: number
  context?: Record<string, any>
  metadata?: Record<string, any>
  source?: string
  stack?: string
}

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  SUCCESS = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
}

export const LOG_LEVEL_NAMES = {
  [LogLevel.DEBUG]: "DEBUG",
  [LogLevel.INFO]: "INFO",
  [LogLevel.SUCCESS]: "SUCCESS",
  [LogLevel.WARN]: "WARN",
  [LogLevel.ERROR]: "ERROR",
  [LogLevel.FATAL]: "FATAL",
}

export const LOG_LEVEL_COLORS = {
  [LogLevel.DEBUG]: "#909399",
  [LogLevel.INFO]: "#409EFF",
  [LogLevel.SUCCESS]: "#67C23A",
  [LogLevel.WARN]: "#E6A23C",
  [LogLevel.ERROR]: "#F56C6C",
  [LogLevel.FATAL]: "#F56C6C",
}

/**
 * 日志传输器接口
 */
export interface LogTransport {
  name: string
  level: LogLevel
  write(entry: LogEntry): Promise<void>
  flush?(): Promise<void>
  destroy?(): Promise<void>
}

/**
 * 控制台传输器
 */
export class ConsoleTransport implements LogTransport {
  name = "console"
  level: LogLevel
  private enableColors: boolean
  private enableGrouping: boolean

  constructor(
    options: {
      level?: LogLevel
      enableColors?: boolean
      enableGrouping?: boolean
    } = {},
  ) {
    this.level = options.level ?? LogLevel.DEBUG
    this.enableColors = options.enableColors ?? true
    this.enableGrouping = options.enableGrouping ?? false
  }

  async write(entry: LogEntry): Promise<void> {
    if (entry.level < this.level) return

    const message = this.formatMessage(entry)
    const args = this.prepareArgs(entry)

    // 使用分组功能
    if (this.enableGrouping && entry.context?.group) {
      console.group(entry.context.group)
    }

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, ...args)
        break
      case LogLevel.INFO:
        console.info(message, ...args)
        break
      case LogLevel.SUCCESS:
        console.log(message, ...args)
        break
      case LogLevel.WARN:
        console.warn(message, ...args)
        break
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, ...args)
        break
    }

    if (this.enableGrouping && entry.context?.group) {
      console.groupEnd()
    }
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString()
    const level = LOG_LEVEL_NAMES[entry.level].padEnd(7)
    const source = entry.source ? `[${entry.source}]` : ""

    if (this.enableColors && typeof window !== "undefined") {
      return `%c${timestamp} [${level}] ${source} ${entry.message}`
    }

    return `${timestamp} [${level}] ${source} ${entry.message}`
  }

  private prepareArgs(entry: LogEntry): any[] {
    const args: any[] = []

    // 添加颜色样式（浏览器环境）
    if (this.enableColors && typeof window !== "undefined") {
      const color = LOG_LEVEL_COLORS[entry.level]
      args.push(`color: ${color}; font-weight: bold`)
    }

    // 添加上下文和元数据
    if (entry.context && Object.keys(entry.context).length > 0) {
      args.push("\n📋 Context:", entry.context)
    }

    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      args.push("\n📊 Metadata:", entry.metadata)
    }

    // 添加错误堆栈
    if (entry.stack) {
      args.push("\n🔍 Stack:", entry.stack)
    }

    return args
  }
}

/**
 * 文件传输器 - 真正的文件写入实现
 */
export class FileTransport implements LogTransport {
  name = "file"
  level: LogLevel
  private filePath: string
  private maxFileSize: number
  private currentSize = 0
  private writeQueue: LogEntry[] = []
  private isWriting = false
  private batchTimeout?: number

  constructor(options: { level?: LogLevel; filePath: string; maxFileSize?: number }) {
    this.level = options.level ?? LogLevel.INFO
    this.filePath = options.filePath
    this.maxFileSize = options.maxFileSize ?? 10 * 1024 * 1024 // 10MB

    this.ensureLogDirectory()
  }

  async write(entry: LogEntry): Promise<void> {
    if (entry.level < this.level) return

    // 加入写入队列
    this.writeQueue.push(entry)

    // 批量写入优化
    if (!this.batchTimeout) {
      this.batchTimeout = window.setTimeout(() => {
        this.flushQueue()
        this.batchTimeout = undefined
      }, 100)
    }
  }

  private async flushQueue(): Promise<void> {
    if (this.isWriting || this.writeQueue.length === 0) return

    this.isWriting = true
    const entries = [...this.writeQueue]
    this.writeQueue = []

    try {
      await this.writeEntries(entries)
    } catch (error) {
      console.error("FileTransport write failed:", error)
      // 重新加入队列
      this.writeQueue.unshift(...entries)
    } finally {
      this.isWriting = false
    }
  }

  private async writeEntries(entries: LogEntry[]): Promise<void> {
    const logLines = entries.map((entry) => this.formatEntry(entry)).join("\n") + "\n"

    // 检查文件大小
    if (this.currentSize + logLines.length > this.maxFileSize) {
      await this.rotateFile()
    }

    // 在浏览器环境中使用不同的写入方式
    if (typeof window !== "undefined") {
      await this.writeToIndexedDB(logLines)
    } else {
      // Node.js环境 (for SSR)
      await this.writeToFileSystem(logLines)
    }

    this.currentSize += logLines.length
  }

  private async writeToIndexedDB(content: string): Promise<void> {
    // 使用 IndexedDB 存储日志（浏览器环境）
    try {
      const request = indexedDB.open("SmartAbpLogs", 1)

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains("logs")) {
          const store = db.createObjectStore("logs", { keyPath: "id", autoIncrement: true })
          store.createIndex("timestamp", "timestamp", { unique: false })
          store.createIndex("level", "level", { unique: false })
        }
      }

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const db = request.result
          const transaction = db.transaction(["logs"], "readwrite")
          const store = transaction.objectStore("logs")

          store.add({
            timestamp: Date.now(),
            content,
            size: content.length,
          })

          transaction.oncomplete = () => resolve()
          transaction.onerror = () => reject(transaction.error)
        }

        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      // 降级到 localStorage
      await this.writeToLocalStorage(content)
    }
  }

  private async writeToLocalStorage(content: string): Promise<void> {
    try {
      const key = `smartabp_log_${Date.now()}`
      localStorage.setItem(key, content)

      // 清理旧日志 (保留最近100条)
      const keys = Object.keys(localStorage)
        .filter((k) => k.startsWith("smartabp_log_"))
        .sort()

      if (keys.length > 100) {
        keys.slice(0, keys.length - 100).forEach((k) => localStorage.removeItem(k))
      }
    } catch (error) {
      console.warn("无法写入本地存储:", error)
    }
  }

  private async writeToFileSystem(content: string): Promise<void> {
    // Node.js 文件系统写入 (SSR环境)
    if (typeof require !== "undefined") {
      const fs = require("fs")
      // path 模块将在 ensureLogDirectory 方法中使用

      await fs.promises.appendFile(this.filePath, content, "utf8")
    }
  }

  private formatEntry(entry: LogEntry): string {
    const formatted = {
      timestamp: new Date(entry.timestamp).toISOString(),
      level: LOG_LEVEL_NAMES[entry.level],
      message: entry.message,
      source: entry.source,
      context: entry.context,
      metadata: entry.metadata,
      stack: entry.stack,
    }

    return JSON.stringify(formatted)
  }

  private async rotateFile(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const backupPath = `${this.filePath}.${timestamp}`

    try {
      if (typeof window !== "undefined") {
        // 浏览器环境：导出当前日志到新的存储
        const currentLogs = await this.exportLogs()
        console.info(`日志文件已轮转，导出 ${currentLogs.length} 条记录`)
      } else if (typeof require !== "undefined") {
        // Node.js环境：重命名文件
        const fs = require("fs")
        await fs.promises.rename(this.filePath, backupPath)
      }
    } catch (error) {
      console.error("日志文件轮转失败:", error)
    }

    this.currentSize = 0
  }

  private ensureLogDirectory(): void {
    if (typeof require !== "undefined") {
      const fs = require("fs")
      const path = require("path")
      const dir = path.dirname(this.filePath)

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    }
  }

  async flush(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = undefined
    }
    await this.flushQueue()
  }

  async destroy(): Promise<void> {
    await this.flush()
  }

  // 导出日志功能
  async exportLogs(): Promise<LogEntry[]> {
    if (typeof window === "undefined") return []

    try {
      // 从 IndexedDB 导出
      const request = indexedDB.open("SmartAbpLogs", 1)

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const db = request.result
          const transaction = db.transaction(["logs"], "readonly")
          const store = transaction.objectStore("logs")
          const getAll = store.getAll()

          getAll.onsuccess = () => {
            const logs = getAll.result.map((item) => JSON.parse(item.content))
            resolve(logs)
          }

          getAll.onerror = () => reject(getAll.error)
        }

        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      // 降级到 localStorage
      const keys = Object.keys(localStorage)
        .filter((k) => k.startsWith("smartabp_log_"))
        .sort()

      return keys.map((key) => JSON.parse(localStorage.getItem(key) || "{}"))
    }
  }
}

/**
 * 内存传输器 - 用于测试和调试
 */
export class MemoryTransport implements LogTransport {
  name = "memory"
  level: LogLevel
  private entries: LogEntry[] = []
  private maxEntries: number

  constructor(
    options: {
      level?: LogLevel
      maxEntries?: number
    } = {},
  ) {
    this.level = options.level ?? LogLevel.DEBUG
    this.maxEntries = options.maxEntries ?? 1000
  }

  async write(entry: LogEntry): Promise<void> {
    if (entry.level < this.level) return

    this.entries.push({ ...entry })

    // 限制内存使用
    if (this.entries.length > this.maxEntries) {
      this.entries.shift()
    }
  }

  getEntries(): LogEntry[] {
    return [...this.entries]
  }

  clear(): void {
    this.entries = []
  }

  async destroy(): Promise<void> {
    this.clear()
  }
}

/**
 * 网络传输器 - 发送日志到远程服务器
 */
export class NetworkTransport implements LogTransport {
  name = "network"
  level: LogLevel
  private endpoint: string
  private batchSize: number
  private flushInterval: number
  private queue: LogEntry[] = []
  private timer?: number

  constructor(options: {
    level?: LogLevel
    endpoint: string
    batchSize?: number
    flushInterval?: number
  }) {
    this.level = options.level ?? LogLevel.WARN
    this.endpoint = options.endpoint
    this.batchSize = options.batchSize ?? 50
    this.flushInterval = options.flushInterval ?? 5000

    // 定期发送日志
    this.timer = window.setInterval(() => {
      this.flush()
    }, this.flushInterval)
  }

  async write(entry: LogEntry): Promise<void> {
    if (entry.level < this.level) return

    this.queue.push(entry)

    // 达到批次大小时立即发送
    if (this.queue.length >= this.batchSize) {
      await this.flush()
    }
  }

  async flush(): Promise<void> {
    if (this.queue.length === 0) return

    const batch = this.queue.splice(0, this.batchSize)

    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logs: batch, timestamp: Date.now() }),
      })
    } catch (error) {
      console.error("NetworkTransport send failed:", error)
      // 重新加入队列头部
      this.queue.unshift(...batch)
    }
  }

  async destroy(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer)
    }
    await this.flush()
  }
}
