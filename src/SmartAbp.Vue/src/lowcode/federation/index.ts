/**
 * SmartAbp Module Federation 统一导出
 *
 * 提供完整的联邦模块加载能力，支持ESM和Script混合方案
 *
 * @author SmartAbp Team
 * @version 1.0.0
 */

// 导出核心类和接口
export { FederatedPluginLoader } from "./loader"
export {
  ContentAddressableCache,
  IncrementalCompilationCache,
  globalContentCache,
  globalCompilationCache,
  computeContentHash,
  cacheCompiledCode,
  getCachedCompilation,
} from "./content-cache"
export {
  CachedPluginWrapper,
  CachedFederationLoader,
  CacheManager,
  precompileCommonComponents,
  enableCacheDebug,
} from "./content-cache-integration"
export { runContentCacheExamples } from "./content-cache-usage-example"

// 导出所有类型定义
export type {
  RemoteSpec,
  LoaderOptions,
  LoadResult,
  CacheEntry,
  IFederatedLoader,
  PerformanceMetrics,
  SecurityValidation,
  LoaderEvents,
  FederatedPlugin,
  RemoteModuleMetadata,
} from "./types"

// 导出枚举和错误类（实际值导出，不是类型导出）
export { LoadingState, FederationErrorType, FederationError } from "./types"

// 便捷函数：创建联邦加载器实例
export async function createFederatedLoader(
  options?: import("./types").LoaderOptions,
  eventBus?: EventBus,
): Promise<import("./loader").FederatedPluginLoader> {
  const { FederatedPluginLoader } = await import("./loader")
  return new FederatedPluginLoader(options, eventBus)
}

// 便捷函数：快速加载单个远程模块（您提供的原始API风格）
export async function loadFederated<T>(spec: import("./types").RemoteSpec): Promise<T> {
  const { FederatedPluginLoader } = await import("./loader")
  const loader = new FederatedPluginLoader({
    enableCache: true,
    verbose: false,
  })

  const result = await loader.load<T>(spec)

  if (result.error) {
    throw result.error
  }

  return result.module!
}

// 便捷函数：批量预加载
export async function preloadModules(specs: import("./types").RemoteSpec[]): Promise<void> {
  const { FederatedPluginLoader } = await import("./loader")
  const loader = new FederatedPluginLoader({
    maxConcurrentLoads: 10,
  })

  const preloadPromises = specs.map((spec) => loader.preload(spec))
  await Promise.allSettled(preloadPromises)
}

// 便捷函数：验证远程规格
export function validateRemoteSpec(spec: import("./types").RemoteSpec): string[] {
  const errors: string[] = []

  if (!spec.scope?.trim()) {
    errors.push("scope 是必需的")
  }

  if (!spec.url?.trim()) {
    errors.push("url 是必需的")
  } else {
    try {
      new URL(spec.url)
    } catch {
      errors.push("url 格式无效")
    }
  }

  if (!spec.module?.trim()) {
    errors.push("module 是必需的")
  }

  if (spec.timeoutMs !== undefined && spec.timeoutMs <= 0) {
    errors.push("timeoutMs 必须大于0")
  }

  return errors
}

// 默认配置常量
export const DEFAULT_LOADER_OPTIONS: Required<import("./types").LoaderOptions> = {
  enableCache: true,
  cacheExpiration: 60 * 60 * 1000, // 1小时
  maxConcurrentLoads: 5,
  enableSecurity: true,
  allowedOrigins: [],
  verbose: false,
}

// 重新导入EventBus类型以避免循环依赖
import type { EventBus } from "../kernel/types"
