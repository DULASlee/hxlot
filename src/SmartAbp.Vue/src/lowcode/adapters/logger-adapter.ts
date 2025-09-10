/**
 * LoggerAdapter - 适配低代码内核的 StructuredLogger 到现有前端日志系统
 * 复用 utils/logging 下的 EnhancedLogger 与 utils/logManager 的性能追踪
 */

/**
 * 低代码独立构建：通过全局注入的运行时对象获取日志能力，避免编译期依赖 src/utils
 * 宿主需在 globalThis.__lowcodeRuntime 注入：
 * {
 *   getEnhancedLoggerFactory?: (opts) => { logger: EnhancedLoggerLike },
 *   logManager?: { startPerformanceTracking?: Function; endPerformanceTracking?: Function },
 *   trackPerformance?: <T>(name: string, fn: () => Promise<T> | T) => Promise<T>
 * }
 */
const __lowcodeRuntime = (globalThis as any).__lowcodeRuntime ?? {}
type LogTransport = {
  name: string
  write?: (entry: unknown) => void
}

const logManager = __lowcodeRuntime.logManager as { startPerformanceTracking?: Function; endPerformanceTracking?: Function } | undefined

// trackPerformance 类型声明：在运行时动态获取，避免编译期依赖
import type { StructuredLogger as KernelLogger, LogLevel as KernelLogLevel, LogEntry as KernelLogEntry } from '../kernel/types'

/**
 * 映射 lowcode 的 LogLevel 到前端日志系统 LogLevel
 */
function mapLevelToFrontend(level: KernelLogLevel): number {
  // 保持与宿主日志系统级别的数值一致
  return (level as unknown) as number
}


type EnhancedLoggerLike = {
  debug: (message: string, context?: Record<string, any>) => void
  info: (message: string, context?: Record<string, any>) => void
  warn: (message: string, context?: Record<string, any>) => void
  error: (message: string, error?: Error, context?: Record<string, any>) => void
  success?: (message: string, context?: Record<string, any>) => void
  fatal?: (message: string, error?: Error, context?: Record<string, any>) => void
  child: (context: Record<string, any>) => EnhancedLoggerLike
  addTransport?: (t: LogTransport) => void
  removeTransport?: (name: string) => void
  getTransports?: () => LogTransport[]
  setLevel?: (level: number) => void
  getLevel?: () => number
  clear?: () => void
  getLogs?: () => any[]
  getStats?: () => any
}
type EnhancedLoggerFactory = (opts: { level?: number; context?: Record<string, any>; transports?: LogTransport[] }) => { logger: EnhancedLoggerLike }
const getEnhancedLoggerFactory = __lowcodeRuntime.getEnhancedLoggerFactory as EnhancedLoggerFactory | undefined

export class LoggerAdapter implements KernelLogger {
  private base: EnhancedLoggerLike

  constructor(options?: { level?: KernelLogLevel; context?: Record<string, any>; transports?: LogTransport[] }) {
    const transports = (options?.transports ?? []) as LogTransport[]
    const factory = getEnhancedLoggerFactory
    if (factory) {
      const { logger } = factory({
        level: options?.level !== undefined ? mapLevelToFrontend(options.level) : undefined,
        context: options?.context,
        transports
      })
      this.base = logger
    } else {
      // 回退：使用 console 保证最小可用
      this.base = {
        debug: console.debug.bind(console),
        info: console.info.bind(console),
        warn: console.warn.bind(console),
        error: (msg: string, _err?: Error, ctx?: Record<string, any>) => console.error(msg, ctx),
        success: console.info.bind(console),
        fatal: (msg: string, _err?: Error, ctx?: Record<string, any>) => console.error(msg, ctx),
        child: (_ctx: Record<string, any>) => this.base,
        addTransport: (_t: LogTransport) => {},
        removeTransport: (_n: string) => {},
        getTransports: () => [],
        setLevel: (_: number) => {},
        getLevel: () => 1
      }
    }
  }

  // 基础输出
  debug(message: string, context?: Record<string, any>): void {
    this.base.debug(message, context)
  }
  info(message: string, context?: Record<string, any>): void {
    this.base.info(message, context)
  }
  warn(message: string, context?: Record<string, any>): void {
    this.base.warn(message, context)
  }
  error(message: string, context?: Record<string, any>): void {
    // 调用增强日志器的三参数签名：error(message, error?, metadata?)
    this.base.error(message, undefined, context)
  }
  success(message: string, context?: Record<string, any>): void {
    // 增强日志器的 success 可能不存在，做存在性保护
    if (this.base.success) {
      this.base.success(message, context)
    } else {
      this.base.info(message, context)
    }
  }
  fatal(message: string, context?: Record<string, any>): void {
    // 增强日志器的 fatal 可能不存在，做存在性保护
    if (this.base.fatal) {
      this.base.fatal(message, undefined, context)
    } else {
      this.base.error(message, undefined, context)
    }
  }

  // 上下文管理
  child(context: Record<string, any>): KernelLogger {
    const child = this.base.child(context)
    const adapter = new LoggerAdapter()
    ;(adapter as any).base = child
    return adapter
  }
  withContext(context: Record<string, any>): KernelLogger {
    // EnhancedLogger 无 withContext，使用 child + 复制 transports 实现
    const child = this.base.child(context)
    const adapter = new LoggerAdapter()
    ;(adapter as any).base = child
    // 复制传输器（若必要）
    const transports = this.base.getTransports?.() ?? []
    transports.forEach(t => adapter.addTransport(t))
    return adapter
  }

  // 批量
  batch(entries: KernelLogEntry[]): void {
    for (const e of entries) {
      const level = mapLevelToFrontend(e.level as KernelLogLevel)
      const ctx = e.context ?? {}
      if (level === 0) {
        this.base.debug(e.message, ctx)
      } else if (level === 1) {
        this.base.info(e.message, ctx)
      } else if (level === 2) {
        if ((this.base as any).success) (this.base as any).success(e.message, ctx)
        else this.base.info(e.message, ctx)
      } else if (level === 3) {
        this.base.warn(e.message, ctx)
      } else {
        (this.base as any).error(e.message, undefined, ctx)
      }
    }
  }

  // 级别
  setLevel(level: KernelLogLevel): void {
    if ((this.base as any).setLevel) {
      (this.base as any).setLevel(mapLevelToFrontend(level))
    } else {
      // 退化处理：创建一个新 logger 并替换内部引用
      const currentCtx = (this.base as any).context ?? {}
      const transports = this.base.getTransports?.() ?? []
      // 若宿主提供工厂，则重建；否则保持原 logger，仅记录级别变更
      const factory = getEnhancedLoggerFactory
      if (factory) {
        const { logger } = factory({
          level: mapLevelToFrontend(level),
          context: currentCtx,
          transports: transports as LogTransport[]
        })
        this.base = logger
      } else {
        // 后备：记录无法切换级别
        this.base.warn?.('logger factory not available; level not changed', { targetLevel: level })
      }
    }
  }
  getLevel(): KernelLogLevel {
    if ((this.base as any).getLevel) {
      const lvUnknown = (this.base as any).getLevel() as unknown
      const lvNum = (lvUnknown as number) ?? 1
      return (lvNum as unknown) as KernelLogLevel
    }
    // 无 getLevel 时，返回 INFO 作为保守默认
    return (1 as unknown) as KernelLogLevel
  }

  // 传输器
  addTransport(_transport: LogTransport): void {
    // 在低代码独立构建中跳过具体 transport 接线，交由运行时注入的 logger 决定
    if (typeof (this.base as any).addTransport === 'function') {
      (this.base as any).addTransport(_transport)
    }
  }
  removeTransport(name: string): void {
    this.base.removeTransport?.(name)
  }
  getTransports(): LogTransport[] {
    return this.base.getTransports ? this.base.getTransports() : []
  }



  // 扩展：导出、清理、统计（如果 EnhancedLogger 支持）
  clear(): void {
    ;(this.base as any).clear?.()
  }
  getLogs(): any[] {
    return (this.base as any).getLogs?.() ?? []
  }
  getStats(): any {
    return (this.base as any).getStats?.() ?? {}
  }

  // 性能追踪：映射到 logManager
  startTimer(name: string, context?: Record<string, any>): { stop: () => void; id: string } | undefined {
    try {
      if (!logManager?.startPerformanceTracking || !logManager?.endPerformanceTracking) return undefined
      const tracker = (logManager.startPerformanceTracking as any)(name, context?.category || 'lowcode')
      return {
        id: tracker.id,
        stop: () => (logManager.endPerformanceTracking as any)(tracker.id),
      }
    } catch {
      return undefined
    }
  }

  // 操作跟踪：使用 trackPerformance 函数
  async trackOperation<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    // 动态读取全局注入，避免模块初始化时快照造成的失效
    const rt = (globalThis as unknown as { __lowcodeRuntime?: { trackPerformance?: <R>(n: string, f: () => Promise<R> | R) => Promise<R> } }).__lowcodeRuntime
    const tpf = rt?.trackPerformance
    if (typeof tpf === 'function') {
      return await tpf(name, fn)
    }
    return await Promise.resolve().then(fn)
  }
}

// 工厂：创建内核/插件日志器
export function createLowCodeLogger(context?: Record<string, any>, level?: KernelLogLevel): KernelLogger {
  return new LoggerAdapter({ context, level })
}
export function createPluginLogger(pluginName: string, extra?: Record<string, any>): KernelLogger {
  const ctx = { plugin: pluginName, ...extra }
  return new LoggerAdapter({ context: ctx })
}
