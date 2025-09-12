/**
 * 内容寻址缓存集成示例
 *
 * 展示如何在SmartAbp低代码引擎中使用增量编译缓存
 *
 * @author SmartAbp Team
 * @version 1.0.0
 */

import {
  globalCompilationCache,
  computeContentHash,
  cacheCompiledCode,
  getCachedCompilation,
} from "./content-cache"
import type { CodegenPlugin, GeneratedCode, PluginContext } from "../kernel/types"
import type { RemoteSpec } from "./types"

/**
 * 增强的插件包装器，集成内容寻址缓存
 */
export class CachedPluginWrapper {
  constructor(
    private plugin: CodegenPlugin,
    private enableIncrementalCache: boolean = true,
  ) {}

  /**
   * 带缓存的代码生成
   */
  async generate<TSchema extends import("../kernel/types").Schema = any>(
    schema: TSchema,
    config: any,
    context: PluginContext,
  ): Promise<GeneratedCode> {
    if (!this.enableIncrementalCache) {
      return await this.plugin.generate(schema, config, context)
    }

    // 生成缓存键：schemaHash + pluginVersion + config
    const pluginVersion = this.plugin.metadata.version
    const compilationOptions = {
      config,
      target: this.plugin.metadata.target,
      capabilities: this.plugin.metadata.capabilities,
    }

    // 检查增量缓存
    const cached = await getCachedCompilation(schema, pluginVersion, compilationOptions)
    if (cached) {
      context.logger?.info(`使用缓存的编译结果: ${cached.cacheKey}`)

      // 从缓存恢复完整的GeneratedCode
      return {
        code: cached.code,
        dependencies: cached.metadata.dependencies || [],
        metadata: {
          ...cached.metadata.codeMetadata,
          generatedAt: cached.compiledAt,
          fromCache: true,
          cacheKey: cached.cacheKey,
        },
      }
    }

    // 缓存未命中，执行实际编译
    context.logger?.info(`执行实际编译，插件: ${this.plugin.metadata.name}`)
    const startTime = Date.now()

    const result = await this.plugin.generate(schema, config, context)
    const compilationTime = Date.now() - startTime

    // 缓存编译结果
    const cacheKey = await cacheCompiledCode(
      schema,
      pluginVersion,
      result.code,
      {
        dependencies: result.dependencies,
        codeMetadata: result.metadata,
        compilationTime,
        pluginName: this.plugin.metadata.name,
      },
      compilationOptions,
    )

    context.logger?.info(`编译完成并缓存: ${cacheKey} (${compilationTime}ms)`)

    // 添加缓存信息到元数据
    result.metadata = {
      ...result.metadata,
      // fromCache: false, // 不直接添加到CodeMetadata，而是通过扩展处理
      generatedAt: Date.now(),
    }

    // 添加额外的缓存元数据
    ;(result as any).cacheInfo = {
      fromCache: false,
      cacheKey,
      compilationTime,
    }

    return result
  }

  /**
   * 计算schema的内容哈希
   */
  async getSchemaHash(schema: any): Promise<string> {
    const schemaJson = JSON.stringify(schema, Object.keys(schema).sort())
    return await computeContentHash(schemaJson)
  }

  /**
   * 预热缓存 - 预编译常用schema
   */
  async warmupCache(schemas: any[], config: any, context: PluginContext): Promise<void> {
    context.logger?.info(`开始缓存预热，schema数量: ${schemas.length}`)

    const warmupPromises = schemas.map(async (schema) => {
      try {
        await this.generate(schema, config, context)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        context.logger?.warn(`预热失败: ${errorMessage}`)
      }
    })

    await Promise.allSettled(warmupPromises)
    context.logger?.info(`缓存预热完成`)
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return globalCompilationCache.getStats()
  }
}

/**
 * Federation加载器缓存集成
 */
export class CachedFederationLoader {
  /**
   * 基于内容哈希的远程插件加载
   */
  static async loadPluginWithContentCache(
    spec: RemoteSpec,
    expectedContentHash?: string,
  ): Promise<CodegenPlugin> {
    // 如果提供了预期的内容哈希，先检查缓存
    if (expectedContentHash) {
      const cachedContent = globalCompilationCache.contentCache.get(expectedContentHash)
      if (cachedContent) {
        try {
          const pluginCode = new TextDecoder().decode(cachedContent)
          // 动态执行插件代码（安全沙箱环境）
          const plugin = await this.executePluginCode(pluginCode)
          console.log(`从内容缓存加载插件: ${spec.scope}/${spec.module}`)
          return plugin
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          console.warn(`缓存插件执行失败，回退到网络加载: ${errorMessage}`)
        }
      }
    }

    // 回退到正常的federation加载
    const { loadFederated } = await import("./index")
    const plugin = await loadFederated<CodegenPlugin>(spec)

    // 计算并缓存插件内容
    if (plugin) {
      const pluginJson = JSON.stringify(plugin.metadata)
      const contentHash = await computeContentHash(pluginJson)
      console.log(`插件内容哈希: ${contentHash}`)
    }

    return plugin
  }

  private static async executePluginCode(code: string): Promise<CodegenPlugin> {
    // 安全的代码执行环境
    // 实际实现中需要更严格的沙箱
    const module = { exports: {} }
    const func = new Function("module", "exports", code)
    func(module, module.exports)
    return (module as any).exports.default || module.exports
  }
}

/**
 * 缓存管理工具
 */
export class CacheManager {
  /**
   * 清理所有过期缓存
   */
  static async cleanup(): Promise<CacheCleanupStats> {
    const before = globalCompilationCache.getStats()

    // 清理24小时以前的编译缓存
    const removedCompilations = globalCompilationCache.cleanup(24 * 60 * 60 * 1000)

    // 清理内容缓存（限制100MB）
    const removedContent = globalCompilationCache.contentCache.cleanup(100 * 1024 * 1024)

    const after = globalCompilationCache.getStats()

    return {
      removedCompilations,
      removedContent,
      memoryFreed: before.memoryUsageBytes - after.memoryUsageBytes,
      timestamp: Date.now(),
    }
  }

  /**
   * 获取缓存健康度报告
   */
  static getHealthReport(): CacheHealthReport {
    const stats = globalCompilationCache.getStats()
    const contentStats = stats.contentCacheStats

    return {
      totalEntries: stats.compilationEntries + contentStats.totalEntries,
      memoryUsage: {
        current: stats.memoryUsageBytes,
        limit: 100 * 1024 * 1024, // 100MB
        utilization: stats.memoryUsageBytes / (100 * 1024 * 1024),
      },
      performance: {
        hitRatio: stats.hitRatio,
        averageEntrySize: contentStats.averageEntrySize,
        totalAccessCount: contentStats.totalAccessCount,
      },
      recommendations: this.generateRecommendations(stats),
    }
  }

  private static generateRecommendations(stats: any): string[] {
    const recommendations: string[] = []

    if (stats.hitRatio < 0.5) {
      recommendations.push("缓存命中率较低，建议检查缓存策略")
    }

    if (stats.memoryUsageBytes > 80 * 1024 * 1024) {
      recommendations.push("内存使用较高，建议执行缓存清理")
    }

    if (stats.compilationEntries > 1000) {
      recommendations.push("编译缓存条目过多，建议清理过期缓存")
    }

    return recommendations
  }
}

// ============= 工具函数 =============

/**
 * 批量预编译常用组件
 */
export async function precompileCommonComponents(
  schemas: any[],
  plugins: CodegenPlugin[],
  context: PluginContext,
): Promise<void> {
  console.log(`开始预编译 ${schemas.length} 个schema，使用 ${plugins.length} 个插件`)

  for (const plugin of plugins) {
    const cachedPlugin = new CachedPluginWrapper(plugin)
    await cachedPlugin.warmupCache(schemas, {}, context)
  }

  console.log("预编译完成")
}

/**
 * 开发模式缓存调试
 */
export function enableCacheDebug(): void {
  if (process.env.NODE_ENV === "development") {
    // 添加全局缓存统计到window对象
    ;(globalThis as any).__smartabp_cache__ = {
      getStats: () => globalCompilationCache.getStats(),
      cleanup: () => CacheManager.cleanup(),
      healthReport: () => CacheManager.getHealthReport(),
    }

    console.log("缓存调试已启用，使用 window.__smartabp_cache__ 访问缓存工具")
  }
}

// ============= 类型定义 =============

interface CacheCleanupStats {
  removedCompilations: number
  removedContent: number
  memoryFreed: number
  timestamp: number
}

interface CacheHealthReport {
  totalEntries: number
  memoryUsage: {
    current: number
    limit: number
    utilization: number
  }
  performance: {
    hitRatio: number
    averageEntrySize: number
    totalAccessCount: number
  }
  recommendations: string[]
}
