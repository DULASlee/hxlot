/**
 * SmartAbp 统一日志系统
 * 整合传输器架构、结构化日志、子日志器、Vue响应式等功能
 */

// 核心导出
export { EnhancedLogger, createLogger, createModuleLogger } from "./enhanced-logger"
export type { LogTransport, LogEntry } from "./transports"
export {
  LogLevel,
  LOG_LEVEL_NAMES,
  LOG_LEVEL_COLORS,
  ConsoleTransport,
  FileTransport,
  MemoryTransport,
  NetworkTransport,
} from "./transports"

// 性能追踪集成
export { logManager, trackPerformance, type PerformanceTracker } from "../logManager"

import { createLogger } from "./enhanced-logger"
import { ConsoleTransport, FileTransport, LogLevel } from "./transports"

/**
 * 全局日志器实例 - 向后兼容
 */
export const logger = createLogger({
  level: LogLevel.DEBUG,
  context: {
    source: "smartabp",
    version: "1.0.0",
  },
  transports: [
    new ConsoleTransport({
      level: LogLevel.DEBUG,
      enableColors: true,
      enableGrouping: true,
    }),
    ...(process.env.NODE_ENV === "production"
      ? [
          new FileTransport({
            level: LogLevel.WARN,
            filePath: "logs/smartabp-app.log",
          }),
        ]
      : []),
  ],
  enableBatching: true,
  batchSize: 10,
  batchTimeout: 100,
})

/**
 * 低代码引擎专用日志器
 */
export const lowcodeLogger = logger.child(
  {
    module: "lowcode-engine",
    source: "lowcode",
  },
  {
    transports: [
      new ConsoleTransport({
        level: LogLevel.DEBUG,
        enableColors: true,
        enableGrouping: true,
      }),
      new FileTransport({
        level: LogLevel.INFO,
        filePath: "logs/lowcode-engine.log",
      }),
    ],
  },
)

/**
 * 创建应用程序日志器
 */
export function createAppLogger(appName: string) {
  return logger.child({
    app: appName,
    source: "application",
  })
}

/**
 * 创建组件日志器
 */
export function createComponentLogger(componentName: string) {
  return logger.child({
    component: componentName,
    source: "component",
  })
}

/**
 * 创建服务日志器
 */
export function createServiceLogger(serviceName: string) {
  return logger.child({
    service: serviceName,
    source: "service",
  })
}

/**
 * 创建插件日志器
 */
export function createPluginLogger(pluginName: string) {
  return logger.child({
    plugin: pluginName,
    source: "plugin",
  })
}

/**
 * 便捷的日志方法 - 向后兼容老的 API
 */
export const log = {
  debug: (message: string, data?: any) => logger.debug(message, data),
  info: (message: string, data?: any) => logger.info(message, data),
  success: (message: string, data?: any) => logger.success(message, data),
  warn: (message: string, data?: any) => logger.warn(message, data),
  error: (message: string, error?: Error | string, data?: any) =>
    logger.error(message, error, data),
  fatal: (message: string, error?: Error | string, data?: any) =>
    logger.fatal(message, error, data),
}

/**
 * 性能追踪的便捷方法
 */
export const perf = {
  start: (name: string, context?: Record<string, any>) => logger.startTimer(name, context),
  trackAsync: <T>(name: string, operation: () => Promise<T>, context?: Record<string, any>) =>
    logger.trackAsync(name, operation, context),
  trackSync: <T>(name: string, operation: () => T, context?: Record<string, any>) =>
    logger.trackSync(name, operation, context),
}

/**
 * 系统级日志方法
 */
export const system = {
  startup: (details: Record<string, any>) => {
    const systemLogger = logger.child({ type: "system-event" })
    systemLogger.info("System startup", details)
  },

  shutdown: (details: Record<string, any>) => {
    const systemLogger = logger.child({ type: "system-event" })
    systemLogger.info("System shutdown", details)
  },

  error: (message: string, error: Error, context?: Record<string, any>) => {
    const systemLogger = logger.child({ type: "system-error" })
    systemLogger.error(`System Error: ${message}`, error, context)
  },

  security: (event: string, details: Record<string, any>) => {
    const securityLogger = logger.child({ type: "security-event" })
    securityLogger.warn(`Security Event: ${event}`, details)
  },
}

/**
 * 用户操作日志
 */
export const userActivity = {
  login: (userId: string, details: Record<string, any>) => {
    const activityLogger = logger.child({ type: "user-activity", userId })
    activityLogger.info("User login", details)
  },

  logout: (userId: string, details: Record<string, any>) => {
    const activityLogger = logger.child({ type: "user-activity", userId })
    activityLogger.info("User logout", details)
  },

  action: (userId: string, action: string, details: Record<string, any>) => {
    const activityLogger = logger.child({ type: "user-activity", userId })
    activityLogger.info(`User action: ${action}`, details)
  },
}

/**
 * API请求日志
 */
export const api = {
  request: (url: string, method: string, details?: Record<string, any>) => {
    const apiLogger = logger.child({ type: "api-request" })
    apiLogger.info(`API Request: ${method} ${url}`, details)
  },

  response: (
    url: string,
    method: string,
    status: number,
    duration: number,
    details?: Record<string, any>,
  ) => {
    const apiLogger = logger.child({ type: "api-response" })
    const metadata = {
      status,
      duration,
      ...details,
    }

    if (status >= 400) {
      apiLogger.error(`API Response: ${method} ${url}`, undefined, metadata)
    } else if (status >= 300) {
      apiLogger.warn(`API Response: ${method} ${url}`, metadata)
    } else {
      apiLogger.info(`API Response: ${method} ${url}`, metadata)
    }
  },

  error: (url: string, method: string, error: Error, details?: Record<string, any>) => {
    const apiLogger = logger.child({ type: "api-error" })
    apiLogger.error(`API Error: ${method} ${url}`, error, details)
  },
}

/**
 * 数据库操作日志
 */
export const database = {
  query: (sql: string, duration: number, details?: Record<string, any>) => {
    const dbLogger = logger.child({ type: "database-query" })
    dbLogger.debug("Database query executed", {
      sql: sql.substring(0, 200), // 限制SQL长度
      duration,
      ...details,
    })
  },

  slowQuery: (sql: string, duration: number, threshold = 1000, details?: Record<string, any>) => {
    if (duration > threshold) {
      const dbLogger = logger.child({ type: "database-slow-query" })
      dbLogger.warn("Slow database query detected", {
        sql: sql.substring(0, 200),
        duration,
        threshold,
        ...details,
      })
    }
  },

  error: (sql: string, error: Error, details?: Record<string, any>) => {
    const dbLogger = logger.child({ type: "database-error" })
    dbLogger.error("Database query failed", error, {
      sql: sql.substring(0, 200),
      ...details,
    })
  },
}

/**
 * 初始化日志系统
 */
export function initLogging(config?: {
  level?: LogLevel
  enableFileLogging?: boolean
  enableNetworkLogging?: boolean
  networkEndpoint?: string
  logDirectory?: string
}) {
  logger.info("Initializing SmartAbp logging system", config)

  // 在生产环境启用网络日志传输
  if (config?.enableNetworkLogging && config.networkEndpoint) {
    const { NetworkTransport } = require("./transports")
    logger.addTransport(
      new NetworkTransport({
        level: LogLevel.ERROR,
        endpoint: config.networkEndpoint,
        batchSize: 20,
        flushInterval: 10000, // 10秒
      }),
    )
  }

  // 设置全局错误处理
  if (typeof window !== "undefined") {
    window.addEventListener("error", (event) => {
      system.error("Uncaught Error", new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    })

    window.addEventListener("unhandledrejection", (event) => {
      system.error("Unhandled Promise Rejection", new Error(event.reason), {
        type: "unhandled-rejection",
      })
    })
  }

  logger.info("SmartAbp logging system initialized successfully")
}

/**
 * 清理日志系统资源
 */
export async function cleanupLogging() {
  logger.info("Cleaning up logging system")
  await logger.flush()
  await logger.destroy()
}

// ============= Vue 组合式API支持 =============

/**
 * Vue组合式函数：使用日志器
 */
export function useLogger(context?: Record<string, any>) {
  const componentLogger = context ? logger.child(context) : logger

  return {
    logger: componentLogger,
    logs: componentLogger.getLogsRef(),
    stats: componentLogger.getStatsRef(),
    debug: componentLogger.debug.bind(componentLogger),
    info: componentLogger.info.bind(componentLogger),
    success: componentLogger.success.bind(componentLogger),
    warn: componentLogger.warn.bind(componentLogger),
    error: componentLogger.error.bind(componentLogger),
    fatal: componentLogger.fatal.bind(componentLogger),
    startTimer: componentLogger.startTimer.bind(componentLogger),
    trackAsync: componentLogger.trackAsync.bind(componentLogger),
    trackSync: componentLogger.trackSync.bind(componentLogger),
  }
}

/**
 * Vue组合式函数：使用性能追踪
 */
export function usePerformanceTracking(context?: Record<string, any>) {
  const perfLogger = context ? logger.child(context) : logger

  return {
    startTimer: (name: string) => perfLogger.startTimer(name, context),
    trackAsync: <T>(name: string, operation: () => Promise<T>) =>
      perfLogger.trackAsync(name, operation, context),
    trackSync: <T>(name: string, operation: () => T) =>
      perfLogger.trackSync(name, operation, context),
  }
}

// ============= 默认初始化 =============

// 在模块加载时进行基本初始化
if (typeof window !== "undefined") {
  // 浏览器环境
  initLogging({
    level: process.env.NODE_ENV === "development" ? LogLevel.DEBUG : LogLevel.INFO,
    enableFileLogging: true,
    logDirectory: "logs",
  })
} else {
  // Node.js 环境
  logger.info("Logging system loaded in Node.js environment")
}
