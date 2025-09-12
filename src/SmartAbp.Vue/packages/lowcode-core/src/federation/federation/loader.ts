/**
 * SmartAbp 联邦插件加载器
 *
 * 实现ESM和Script标签的混合加载方案，支持缓存、超时控制和安全验证
 *
 * @author SmartAbp Team
 * @version 1.0.0
 */

import type { EventBus } from "../kernel/types"
import type {
  RemoteSpec,
  LoaderOptions,
  LoadResult,
  CacheEntry,
  IFederatedLoader,
  PerformanceMetrics,
  SecurityValidation,
} from "./types"
import { LoadingState, FederationError, FederationErrorType } from "./types"

/**
 * 联邦插件加载器实现
 */
export class FederatedPluginLoader implements IFederatedLoader {
  private cache = new Map<string, CacheEntry>()
  private loadingPromises = new Map<string, Promise<LoadResult>>()
  private options: Required<LoaderOptions>
  private eventBus?: EventBus
  private metrics: PerformanceMetrics
  private concurrentLoads = new Set<string>()

  constructor(options: LoaderOptions = {}, eventBus?: EventBus) {
    // 设置默认选项
    this.options = {
      enableCache: options.enableCache ?? true,
      cacheExpiration: options.cacheExpiration ?? 60 * 60 * 1000, // 1小时
      maxConcurrentLoads: options.maxConcurrentLoads ?? 5,
      enableSecurity: options.enableSecurity ?? true,
      allowedOrigins: options.allowedOrigins ?? [],
      verbose: options.verbose ?? false,
    }

    this.eventBus = eventBus

    // 初始化性能指标
    this.metrics = {
      totalLoads: 0,
      successfulLoads: 0,
      failedLoads: 0,
      averageLoadTime: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      loadMethodStats: {
        esm: 0,
        script: 0,
      },
    }

    // 定期清理过期缓存
    this.startCacheCleanup()
  }

  /**
   * 加载远程模块的主入口方法
   */
  async load<T = any>(spec: RemoteSpec): Promise<LoadResult<T>> {
    const cacheKey = this.generateCacheKey(spec)
    const startTime = Date.now()

    try {
      this.log(`开始加载远程模块: ${spec.scope}/${spec.module}`)
      this.eventBus?.emit("load:start", {
        scope: spec.scope,
        module: spec.module,
        url: spec.url,
        timestamp: Date.now(),
      })

      // 验证并发加载限制
      if (this.concurrentLoads.size >= this.options.maxConcurrentLoads) {
        throw new FederationError(
          FederationErrorType.VALIDATION_ERROR,
          `超过最大并发加载限制: ${this.options.maxConcurrentLoads}`,
          spec,
        )
      }

      // 检查缓存
      if (this.options.enableCache) {
        const cached = this.checkCache<T>(cacheKey)
        if (cached) {
          this.eventBus?.emit("cache:hit", {
            key: cacheKey,
            size: JSON.stringify(cached.module).length,
            timestamp: Date.now(),
          })
          this.log(`缓存命中: ${spec.scope}/${spec.module}`)
          return cached
        }
        this.eventBus?.emit("cache:miss", {
          key: cacheKey,
          timestamp: Date.now(),
        })
      }

      // 检查是否已在加载中
      if (this.loadingPromises.has(cacheKey)) {
        this.log(`等待现有加载完成: ${spec.scope}/${spec.module}`)
        return await this.loadingPromises.get(cacheKey)!
      }

      // 开始加载
      const loadPromise = this.performLoad<T>(spec, startTime)
      this.loadingPromises.set(cacheKey, loadPromise)
      this.concurrentLoads.add(cacheKey)

      try {
        const result = await loadPromise

        // 缓存成功加载的模块
        if (result.state === LoadingState.LOADED && this.options.enableCache) {
          this.updateCache(cacheKey, spec, result.module!)
        }

        return result
      } finally {
        this.loadingPromises.delete(cacheKey)
        this.concurrentLoads.delete(cacheKey)
      }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      const federationError =
        error instanceof FederationError
          ? error
          : new FederationError(
              FederationErrorType.UNKNOWN_ERROR,
              errorInstance.message,
              spec,
              errorInstance,
            )

      this.metrics.failedLoads++
      this.eventBus?.emit("load:error", {
        scope: spec.scope,
        module: spec.module,
        error: federationError,
        errorType: federationError.type,
        timestamp: Date.now(),
      })
      this.log(`加载失败: ${federationError.toString()}`, "error")

      return {
        state: LoadingState.ERROR,
        error: federationError,
        loadTime: Date.now() - startTime,
        fromCache: false,
      }
    }
  }

  /**
   * 执行实际的模块加载
   */
  private async performLoad<T>(spec: RemoteSpec, startTime: number): Promise<LoadResult<T>> {
    // 安全验证
    if (this.options.enableSecurity) {
      const validation = await this.validateSecurity(spec)
      if (!validation.isValid) {
        throw new FederationError(
          FederationErrorType.SECURITY_ERROR,
          `安全验证失败: ${validation.errors.join(", ")}`,
          spec,
        )
      }
    }

    let lastError: Error | undefined
    const expectedType = spec.expectedType || "auto"

    // 尝试ESM加载（优先）
    if (expectedType === "esm" || expectedType === "auto") {
      try {
        this.log(`尝试ESM加载: ${spec.scope}/${spec.module}`)
        const module = await this.loadViaESM<T>(spec)
        const loadTime = Date.now() - startTime

        this.metrics.totalLoads++
        this.metrics.successfulLoads++
        this.metrics.loadMethodStats.esm++
        this.updateAverageLoadTime(loadTime)

        const result: LoadResult<T> = {
          state: LoadingState.LOADED,
          module,
          loadTime,
          loadMethod: "esm",
          fromCache: false,
        }

        this.eventBus?.emit("load:success", {
          scope: spec.scope,
          module: spec.module,
          loadTime: result.loadTime || 0,
          loadMethod: result.loadMethod || "esm",
          fromCache: result.fromCache || false,
          timestamp: Date.now(),
        })
        this.log(`ESM加载成功: ${spec.scope}/${spec.module} (${loadTime}ms)`)
        return result
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error))
        lastError = errorInstance
        this.log(`ESM加载失败: ${errorInstance.message}`, "warn")
      }
    }

    // 回退到Script标签加载
    if (expectedType === "umd" || expectedType === "iife" || expectedType === "auto") {
      try {
        this.log(`尝试Script标签加载: ${spec.scope}/${spec.module}`)
        const module = await this.loadViaScript<T>(spec)
        const loadTime = Date.now() - startTime

        this.metrics.totalLoads++
        this.metrics.successfulLoads++
        this.metrics.loadMethodStats.script++
        this.updateAverageLoadTime(loadTime)

        const result: LoadResult<T> = {
          state: LoadingState.LOADED,
          module,
          loadTime,
          loadMethod: "script",
          fromCache: false,
        }

        this.eventBus?.emit("load:success", {
          scope: spec.scope,
          module: spec.module,
          loadTime: result.loadTime || 0,
          loadMethod: result.loadMethod || "script",
          fromCache: result.fromCache || false,
          timestamp: Date.now(),
        })
        this.log(`Script加载成功: ${spec.scope}/${spec.module} (${loadTime}ms)`)
        return result
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error))
        lastError = errorInstance
        this.log(`Script加载失败: ${errorInstance.message}`, "warn")
      }
    }

    // 所有加载方式都失败
    throw new FederationError(
      FederationErrorType.NETWORK_ERROR,
      `所有加载方式都失败。ESM错误: ${lastError?.message || "未尝试"}`,
      spec,
      lastError,
    )
  }

  /**
   * ESM动态导入加载方法
   */
  private async loadViaESM<T>(spec: RemoteSpec): Promise<T> {
    const timeoutMs = spec.timeoutMs || 10000

    // 创建超时Promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(
          new FederationError(
            FederationErrorType.TIMEOUT_ERROR,
            `ESM加载超时: ${timeoutMs}ms`,
            spec,
          ),
        )
      }, timeoutMs)
    })

    // 创建加载Promise
    const loadPromise = (async (): Promise<T> => {
      try {
        // 构建模块URL
        let moduleUrl: string
        if (spec.url.startsWith("http")) {
          // 绝对URL
          moduleUrl = new URL(spec.module, spec.url).href
        } else {
          // 相对URL
          moduleUrl = `${spec.url}/${spec.module}`
        }

        this.log(`ESM导入URL: ${moduleUrl}`)

        // 使用动态导入加载模块
        // @ts-ignore: Vite支持动态导入字符串URL
        const moduleExports = await import(/* @vite-ignore */ moduleUrl)

        // 返回默认导出或整个模块
        return moduleExports.default || moduleExports
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error))
        throw new FederationError(
          FederationErrorType.PARSE_ERROR,
          `ESM解析失败: ${errorInstance.message}`,
          spec,
          errorInstance,
        )
      }
    })()

    // 竞争：加载 vs 超时
    return await Promise.race([loadPromise, timeoutPromise])
  }

  /**
   * Script标签回退加载方法
   */
  private async loadViaScript<T>(spec: RemoteSpec): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutMs = spec.timeoutMs || 10000
      const script = document.createElement("script")

      script.src = spec.url
      script.async = true
      script.crossOrigin = "anonymous" // 启用CORS

      // 设置超时
      const timeout = setTimeout(() => {
        script.remove()
        reject(
          new FederationError(
            FederationErrorType.TIMEOUT_ERROR,
            `Script加载超时: ${timeoutMs}ms`,
            spec,
          ),
        )
      }, timeoutMs)

      // 加载成功处理
      script.onload = () => {
        clearTimeout(timeout)

        try {
          // 检查全局容器是否存在
          const container = (window as any)[spec.scope]
          if (!container) {
            throw new Error(`容器未找到: ${spec.scope}`)
          }

          // 获取模块
          let module: T
          if (typeof container.get === "function") {
            // Module Federation 标准容器
            module = container.get(spec.module)
          } else if (container[spec.module]) {
            // 简单对象容器
            module = container[spec.module]
          } else {
            // 回退到容器本身
            module = container
          }

          if (!module) {
            throw new Error(`模块未找到: ${spec.module}`)
          }

          this.log(`Script容器获取成功: ${spec.scope}.${spec.module}`)
          resolve(module)
        } catch (error) {
          const errorInstance = error instanceof Error ? error : new Error(String(error))
          reject(
            new FederationError(
              FederationErrorType.PARSE_ERROR,
              `Script解析失败: ${errorInstance.message}`,
              spec,
              errorInstance,
            ),
          )
        }
      }

      // 加载失败处理
      script.onerror = () => {
        clearTimeout(timeout)
        script.remove()
        reject(
          new FederationError(
            FederationErrorType.NETWORK_ERROR,
            `Script资源加载失败: ${spec.url}`,
            spec,
          ),
        )
      }

      // 添加到DOM
      document.head.appendChild(script)
    })
  }

  /**
   * 预加载远程模块（不阻塞）
   */
  async preload(spec: RemoteSpec): Promise<void> {
    this.log(`预加载远程模块: ${spec.scope}/${spec.module}`)
    try {
      await this.load(spec)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`预加载失败: ${errorMessage}`, "warn")
      // 预加载失败不抛出错误
    }
  }

  /**
   * 卸载模块（清理资源）
   */
  async unload(spec: RemoteSpec): Promise<void> {
    const cacheKey = this.generateCacheKey(spec)

    // 从缓存中移除
    if (this.cache.has(cacheKey)) {
      this.cache.delete(cacheKey)
      this.log(`模块已卸载: ${spec.scope}/${spec.module}`)
    }

    // 清理DOM中的script标签（如果存在）
    const scripts = document.querySelectorAll(`script[src="${spec.url}"]`)
    scripts.forEach((script) => script.remove())
  }

  /**
   * 清理缓存
   */
  async clearCache(filter?: (entry: CacheEntry) => boolean): Promise<number> {
    let removedCount = 0

    if (filter) {
      // 条件清理
      for (const [key, entry] of this.cache.entries()) {
        if (filter(entry)) {
          this.cache.delete(key)
          removedCount++
        }
      }
    } else {
      // 全部清理
      removedCount = this.cache.size
      this.cache.clear()
    }

    this.eventBus?.emit("cache:cleanup", {
      removedCount,
      timestamp: Date.now(),
    })
    this.log(`缓存已清理，移除 ${removedCount} 个条目`)

    return removedCount
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    // 计算缓存命中率
    const totalRequests = this.metrics.totalLoads + this.getCacheHits()
    this.metrics.cacheHitRate = totalRequests > 0 ? this.getCacheHits() / totalRequests : 0

    // 计算内存使用量（近似）
    this.metrics.memoryUsage = this.calculateMemoryUsage()

    return { ...this.metrics }
  }

  /**
   * 验证远程模块安全性
   */
  async validateSecurity(spec: RemoteSpec): Promise<SecurityValidation> {
    const errors: string[] = []
    const warnings: string[] = []
    let securityScore = 100

    // 检查URL协议
    try {
      const url = new URL(spec.url)
      if (url.protocol !== "https:" && url.hostname !== "localhost") {
        errors.push("非HTTPS协议的远程URL存在安全风险")
        securityScore -= 30
      }

      // 检查域名白名单
      if (this.options.allowedOrigins.length > 0) {
        const origin = url.origin
        if (!this.options.allowedOrigins.includes(origin)) {
          errors.push(`域名不在白名单中: ${origin}`)
          securityScore -= 50
        }
      }

      // 检查可疑路径
      if (spec.module.includes("..") || spec.module.includes("<script>")) {
        errors.push("模块路径包含可疑字符")
        securityScore -= 40
      }
    } catch (error) {
      errors.push(`无效的URL格式: ${spec.url}`)
      securityScore -= 60
    }

    // 检查超时设置
    if (!spec.timeoutMs || spec.timeoutMs > 30000) {
      warnings.push("建议设置适当的超时时间（小于30秒）")
      securityScore -= 5
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      securityScore: Math.max(0, securityScore),
    }
  }

  // === 私有辅助方法 ===

  private generateCacheKey(spec: RemoteSpec): string {
    return `${spec.scope}/${spec.module}@${spec.version || "latest"}`
  }

  private checkCache<T>(cacheKey: string): LoadResult<T> | null {
    const entry = this.cache.get(cacheKey)
    if (!entry) return null

    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(cacheKey)
      return null
    }

    return {
      state: LoadingState.CACHED,
      module: entry.module,
      fromCache: true,
      loadTime: 0,
    }
  }

  private updateCache<T>(cacheKey: string, spec: RemoteSpec, module: T): void {
    const now = Date.now()
    const entry: CacheEntry<T> = {
      module,
      timestamp: now,
      expiresAt: now + this.options.cacheExpiration,
      spec,
    }

    this.cache.set(cacheKey, entry)
    this.log(`模块已缓存: ${cacheKey}`)
  }

  private startCacheCleanup(): void {
    // 每30分钟清理一次过期缓存
    setInterval(
      () => {
        this.clearCache((entry) => Date.now() > entry.expiresAt)
      },
      30 * 60 * 1000,
    )
  }

  private updateAverageLoadTime(loadTime: number): void {
    const totalTime = this.metrics.averageLoadTime * (this.metrics.successfulLoads - 1) + loadTime
    this.metrics.averageLoadTime = totalTime / this.metrics.successfulLoads
  }

  private getCacheHits(): number {
    // 简单实现：假设缓存命中次数等于缓存条目数
    return this.cache.size
  }

  private calculateMemoryUsage(): number {
    // 简化的内存计算：每个缓存条目估算100KB
    return this.cache.size * 100 * 1024
  }

  private log(message: string, level: "info" | "warn" | "error" = "info"): void {
    if (!this.options.verbose && level === "info") return

    const prefix = "[FederatedLoader]"
    switch (level) {
      case "info":
        console.log(`${prefix} ${message}`)
        break
      case "warn":
        console.warn(`${prefix} ${message}`)
        break
      case "error":
        console.error(`${prefix} ${message}`)
        break
    }
  }
}
