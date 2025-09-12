/**
 * 低代码引擎微内核核心
 * 企业级架构 - 2025年标准
 */

import type {
  Schema,
  GeneratedCode,
  CodegenPlugin,
  PluginContext,
  CacheManager,
  StructuredLogger,
  PerformanceMonitor,
} from "./types"

import { EventBus } from "./events"
import { CacheManager as CacheManagerImpl } from "./cache"
import { createLowCodeLogger } from "../adapters/logger-adapter"
import { PerformanceMonitor as PerformanceMonitorImpl } from "./monitor"
import { PluginManager, PluginContextImpl } from "./plugins"

// ============= 内核配置 =============

export interface LowCodeKernelConfig {
  // 缓存配置
  cache?: {
    maxMemory?: number
    maxEntries?: number
    defaultTTL?: number
    enableCompression?: boolean
  }

  // 日志配置
  logging?: {
    level?: "debug" | "info" | "warn" | "error" | "fatal"
    enableConsole?: boolean
    enableFile?: boolean
    filePath?: string
    enableStructured?: boolean
  }

  // 性能监控配置
  monitoring?: {
    enabled?: boolean
    aggregationInterval?: number
    retentionPeriod?: number
  }

  // 插件配置
  plugins?: {
    autoInitialize?: boolean
    concurrentInit?: boolean
    maxInitTime?: number
  }

  // 安全配置
  security?: {
    enableSandbox?: boolean
    maxExecutionTime?: number
    memoryLimit?: number
  }
}

// ============= 生成选项 =============

export interface GenerationOptions {
  skipValidation?: boolean
  useCache?: boolean
  timeout?: number
  priority?: number
  context?: Record<string, any>
}

// ============= 生成结果 =============

export interface GenerationResult<T = GeneratedCode> {
  success: boolean
  result?: T
  error?: Error
  metadata: {
    pluginName: string
    duration: number
    cacheHit: boolean
    validationPassed: boolean
    timestamp: number
  }
}

// ============= 内核状态 =============

export type KernelStatus = "initializing" | "ready" | "error" | "shutdown"

export interface KernelHealthInfo {
  status: KernelStatus
  uptime: number
  pluginsCount: number
  readyPluginsCount: number
  cacheStats: any
  performanceMetrics: any
  lastError?: Error
}

// ============= 主内核类 =============

export class LowCodeKernel {
  private readonly config: Required<LowCodeKernelConfig>
  private readonly eventBus: EventBus
  private readonly cache: CacheManager
  private readonly logger: StructuredLogger
  private readonly monitor: PerformanceMonitor
  private readonly pluginManager: PluginManager

  private status: KernelStatus = "initializing"
  private startTime = Date.now()
  private shutdownPromise?: Promise<void>
  private healthCheckInterval?: number | ReturnType<typeof setTimeout>

  constructor(config: LowCodeKernelConfig = {}) {
    // 合并默认配置
    this.config = this.mergeConfig(config)

    // 初始化核心组件 - 使用前端日志系统
    this.logger = createLowCodeLogger({
      module: "kernel",
      config: this.config.logging,
    })
    this.monitor = new PerformanceMonitorImpl(this.logger)
    this.eventBus = new EventBus(this.logger)
    this.cache = new CacheManagerImpl({
      ...this.config.cache,
      logger: this.logger,
    })

    this.pluginManager = new PluginManager(
      this.eventBus,
      this.cache,
      this.logger,
      this.monitor,
      this.config,
    )

    this.setupEventHandlers()
    this.setupHealthChecks()

    this.logger.info("LowCode Kernel created", { config: this.config })
  }

  // ============= 初始化方法 =============

  /**
   * 初始化内核
   */
  async initialize(): Promise<void> {
    const timer = this.monitor.startTimer("kernel.initialization")

    try {
      this.logger.info("Initializing LowCode Kernel...")

      // 初始化插件（如果启用自动初始化）
      if (this.config.plugins.autoInitialize) {
        await this.pluginManager.initializeAll()
      }

      this.status = "ready"
      const initTime = timer.end({ status: "success" })

      this.logger.info("LowCode Kernel ready", { initTime })

      this.eventBus.emitSync("system:ready", {
        pluginsLoaded: this.pluginManager.getStats().ready,
        initTime,
        timestamp: Date.now(),
      })
    } catch (error) {
      this.status = "error"
      timer.end({ status: "error" })

      this.logger.fatal("Kernel initialization failed", error as Error)

      this.eventBus.emitSync("system:error", {
        error: error as Error,
        context: "kernel.initialization",
        timestamp: Date.now(),
      })

      throw error
    }
  }

  // ============= 插件管理 =============

  /**
   * 注册插件
   */
  async registerPlugin(plugin: CodegenPlugin): Promise<void> {
    this.ensureReady()
    await this.pluginManager.register(plugin)
  }

  /**
   * 获取插件
   */
  getPlugin<T extends CodegenPlugin>(name: string): T | undefined {
    return this.pluginManager.getPlugin<T>(name)
  }

  /**
   * 卸载插件
   */
  async unregisterPlugin(name: string): Promise<void> {
    this.ensureReady()
    await this.pluginManager.unregister(name)
  }

  // ============= 代码生成 =============

  /**
   * 生成代码
   */
  async generate<T = GeneratedCode>(
    schema: Schema,
    options: GenerationOptions = {},
  ): Promise<GenerationResult<T>> {
    this.ensureReady()

    const schemaId = this.getSchemaId(schema)
    const timer = this.monitor.startTimer("generation.total", { schemaId })

    const metadata = {
      pluginName: "",
      duration: 0,
      cacheHit: false,
      validationPassed: true,
      timestamp: Date.now(),
    }

    try {
      this.logger.info("Starting code generation", {
        schemaId,
        type: schema.type,
        options,
      })

      this.eventBus.emitSync("generation:start", {
        schemaId,
        pluginName: "",
        timestamp: Date.now(),
      })

      // 1. 检查缓存
      let result: T | undefined
      if (options.useCache !== false) {
        const cacheKey = this.getCacheKey(schema, options)
        result = this.cache.get<T>(cacheKey)

        if (result) {
          metadata.cacheHit = true
          metadata.duration = timer.end({ status: "cache_hit" })

          this.logger.info("Cache hit for code generation", { schemaId })

          return {
            success: true,
            result,
            metadata,
          }
        }
      }

      // 2. 查找合适的插件
      const plugin = await this.pluginManager.findPlugin(schema)
      if (!plugin) {
        throw new Error(`No plugin found to handle schema type: ${schema.type}`)
      }

      metadata.pluginName = plugin.metadata.name

      // 3. 验证schema（如果需要）
      if (!options.skipValidation && plugin.validate) {
        const validation = await plugin.validate(schema)
        if (!validation.valid) {
          metadata.validationPassed = false
          const errors = validation.errors.map((e) => e.message).join(", ")
          throw new Error(`Schema validation failed: ${errors}`)
        }
      }

      // 4. 生成代码
      const context = this.createPluginContext(schema, options)
      result = (await this.executeWithTimeout(
        () => plugin.generate(schema, options.context || {}, context),
        options.timeout || 30000,
      )) as T

      // 5. 缓存结果
      if (options.useCache !== false && result) {
        const cacheKey = this.getCacheKey(schema, options)
        this.cache.set(cacheKey, result, {
          ttl: 3600000, // 1小时
          tags: [schema.type, plugin.metadata.name],
        })
      }

      metadata.duration = timer.end({
        status: "success",
        plugin: plugin.metadata.name,
      })

      this.logger.info("Code generation completed", {
        schemaId,
        plugin: plugin.metadata.name,
        duration: metadata.duration,
      })

      this.eventBus.emitSync("generation:end", {
        schemaId,
        pluginName: plugin.metadata.name,
        duration: metadata.duration,
        codeSize: this.getResultSize(result),
        timestamp: Date.now(),
      })

      return {
        success: true,
        result,
        metadata,
      }
    } catch (error) {
      metadata.duration = timer.end({ status: "error" })

      this.logger.error("Code generation failed", error as Error, {
        schemaId,
        plugin: metadata.pluginName,
      })

      this.eventBus.emitSync("generation:error", {
        schemaId,
        pluginName: metadata.pluginName,
        error: error as Error,
        timestamp: Date.now(),
      })

      return {
        success: false,
        error: error as Error,
        metadata,
      }
    }
  }

  // ============= 批量生成 =============

  /**
   * 批量生成代码
   */
  async generateBatch<T = GeneratedCode>(
    schemas: Schema[],
    options: GenerationOptions = {},
  ): Promise<Array<GenerationResult<T>>> {
    this.ensureReady()

    const timer = this.monitor.startTimer("generation.batch", {
      count: schemas.length.toString(),
    })

    try {
      this.logger.info("Starting batch code generation", {
        count: schemas.length,
        options,
      })

      // 并发生成（可配置并发数，默认5；失败不中断）
      const defaultConcurrency = 5
      const configuredConcurrency =
        (options as any).concurrency ??
        (this as any).config?.plugins?.concurrentGenerate ??
        defaultConcurrency

      const concurrency = Math.max(
        1,
        Math.min(schemas.length, Number(configuredConcurrency) || defaultConcurrency),
      )

      const results: Array<GenerationResult<T>> = []

      // 简易并发限制器
      let index = 0
      const workers: Promise<void>[] = []

      const runWorker = async () => {
        while (index < schemas.length) {
          const current = index++
          const schema = schemas[current]

          try {
            const res = await this.generate<T>(schema, options)
            results[current] = res
          } catch (err) {
            // 捕获异常，不中断整体
            results[current] = {
              success: false,
              error: err as Error,
              metadata: {
                pluginName: "",
                duration: 0,
                cacheHit: false,
                validationPassed: false,
                timestamp: Date.now(),
              },
            } as GenerationResult<T>
          }
        }
      }

      for (let i = 0; i < concurrency; i++) {
        workers.push(runWorker())
      }

      await Promise.allSettled(workers)

      const successful = results.filter((r) => r?.success).length
      const duration = timer.end({
        status: "success",
        successful: successful.toString(),
        failed: (results.length - successful).toString(),
      })

      this.logger.info("Batch code generation completed", {
        total: results.length,
        successful,
        failed: results.length - successful,
        duration,
      })

      return results
    } catch (error) {
      timer.end({ status: "error" })
      this.logger.error("Batch code generation failed", error as Error)
      throw error
    }
  }

  // ============= 健康检查 =============

  /**
   * 获取内核健康信息
   */
  getHealthInfo(): KernelHealthInfo {
    const pluginStats = this.pluginManager.getStats()

    return {
      status: this.status,
      uptime: Date.now() - this.startTime,
      pluginsCount: pluginStats.total,
      readyPluginsCount: pluginStats.ready,
      cacheStats: this.cache.getStats(),
      performanceMetrics: this.monitor.getHealthMetrics(),
      lastError: undefined, // TODO: 实现错误跟踪
    }
  }

  /**
   * 检查是否健康
   */
  isHealthy(): boolean {
    if (this.status !== "ready") return false

    const health = this.getHealthInfo()
    const cacheStats = health.cacheStats

    // 简单的健康检查逻辑
    return (
      health.pluginsCount > 0 &&
      health.readyPluginsCount === health.pluginsCount &&
      cacheStats.hitRate > 50 // 缓存命中率 > 50% (CacheManager返回0-100的百分比)
    )
  }

  // ============= 关闭方法 =============

  /**
   * 优雅关闭内核
   */
  async shutdown(force = false): Promise<void> {
    if (this.shutdownPromise) {
      return this.shutdownPromise
    }

    this.shutdownPromise = this.performShutdown(force)
    return this.shutdownPromise
  }

  // ============= 事件访问 =============

  /**
   * 获取事件总线（只读）
   */
  get events() {
    return {
      on: this.eventBus.on.bind(this.eventBus),
      once: this.eventBus.once.bind(this.eventBus),
      off: this.eventBus.off.bind(this.eventBus),
    }
  }

  // ============= 缓存访问 =============

  /**
   * 获取缓存管理器（只读）
   */
  get cacheManager() {
    return {
      get: this.cache.get.bind(this.cache),
      has: this.cache.has.bind(this.cache),
      getStats: this.cache.getStats.bind(this.cache),
      getMemoryUsage: this.cache.getMemoryUsage.bind(this.cache),
    }
  }

  // ============= 内部方法 =============

  private mergeConfig(config: LowCodeKernelConfig): Required<LowCodeKernelConfig> {
    return {
      cache: {
        maxMemory: 100 * 1024 * 1024, // 100MB
        maxEntries: 10000,
        defaultTTL: 3600000, // 1小时
        enableCompression: false,
        ...config.cache,
      },
      logging: {
        level: "info",
        enableConsole: true,
        enableFile: false,
        filePath: "./lowcode.log",
        enableStructured: true,
        ...config.logging,
      },
      monitoring: {
        enabled: true,
        aggregationInterval: 60000, // 1分钟
        retentionPeriod: 24 * 60 * 60 * 1000, // 24小时
        ...config.monitoring,
      },
      plugins: {
        autoInitialize: true,
        concurrentInit: false,
        maxInitTime: 30000, // 30秒
        ...config.plugins,
      },
      security: {
        enableSandbox: true,
        maxExecutionTime: 30000, // 30秒
        memoryLimit: 512 * 1024 * 1024, // 512MB
        ...config.security,
      },
    }
  }

  private setupEventHandlers(): void {
    // 监听系统错误
    this.eventBus.on("system:error", (event) => {
      this.logger.error("System error occurred", event.error, {
        context: event.context,
      })
    })

    // 监听插件错误
    this.eventBus.on("plugin:error", (event) => {
      this.logger.error("Plugin error occurred", event.error, {
        plugin: event.pluginName,
        context: event.context,
      })
    })

    // 监听生成错误
    this.eventBus.on("generation:error", (event) => {
      this.monitor.recordCount("generation.errors", 1, {
        plugin: event.pluginName,
      })
    })
  }

  private setupHealthChecks(): void {
    // 定期健康检查
    this.healthCheckInterval = setInterval(() => {
      const health = this.getHealthInfo()

      this.monitor.recordGauge("kernel.uptime", health.uptime)
      this.monitor.recordGauge("kernel.plugins_ready", health.readyPluginsCount)
      this.monitor.recordGauge("kernel.cache_hit_rate", health.cacheStats.hitRate)
    }, 30000) // 每30秒检查一次
  }

  private createPluginContext(schema: Schema, _options: GenerationOptions): PluginContext {
    return new PluginContextImpl(
      this.eventBus,
      this.cache,
      this.logger.child({ schema: schema.id }),
      this.monitor,
      this.config,
      this.pluginManager,
    )
  }

  private async executeWithTimeout<T>(fn: () => Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timed out after ${timeout}ms`))
        }, timeout)
      }),
    ])
  }

  private getSchemaId(schema: Schema): string {
    return schema.id || this.generateSchemaId(schema)
  }

  private generateSchemaId(schema: Schema): string {
    const content = JSON.stringify(schema)
    return `schema_${content.length}_${Date.now()}`
  }

  private getCacheKey(schema: Schema, options: GenerationOptions): string {
    const key = {
      schemaId: this.getSchemaId(schema),
      type: schema.type,
      version: schema.version,
      context: options.context || {},
    }
    return `gen:${JSON.stringify(key)}`
  }

  private getResultSize(result: any): number {
    if (typeof result === "string") {
      return result.length
    }
    if (typeof result === "object") {
      return JSON.stringify(result).length
    }
    return 0
  }

  private ensureReady(): void {
    if (this.status !== "ready") {
      throw new Error(`Kernel is not ready. Current status: ${this.status}`)
    }
  }

  private async performShutdown(force: boolean): Promise<void> {
    this.logger.info("Starting kernel shutdown", { force })

    this.status = "shutdown"

    this.eventBus.emitSync("system:shutdown", {
      reason: force ? "forced" : "graceful",
      timestamp: Date.now(),
    })

    try {
      // 关闭插件管理器
      await this.pluginManager.destroy()

      // 清理健康检查interval
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval)
        this.healthCheckInterval = undefined
      }

      // 尝试移除所有事件监听器，避免泄漏
      ;(this.eventBus as any).removeAllListeners?.()

      // 销毁监控器
      this.monitor.destroy()

      // 销毁缓存
      ;(this.cache as any).destroy?.()

      // 销毁日志器
      ;(this.logger as any).destroy?.()

      this.logger.info("Kernel shutdown completed")
    } catch (error) {
      this.logger.error("Error during kernel shutdown", error as Error)
      if (!force) {
        throw error
      }
    }
  }
}
