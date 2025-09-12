/**
 * SmartAbp 低代码引擎 Module Federation 类型定义
 *
 * 支持ESM和Script标签的混合加载方案，确保最大兼容性
 *
 * @author SmartAbp Team
 * @version 1.0.0
 */

import type { CodegenPlugin } from "../kernel/types"

/**
 * 远程模块规格定义
 */
export interface RemoteSpec {
  /** 容器名称（scope），显式传入，不从URL猜测 */
  scope: string
  /** 远程模块URL地址 */
  url: string
  /** 模块名称/路径 */
  module: string
  /** 加载超时时间（毫秒），默认10秒 */
  timeoutMs?: number
  /** 模块版本（用于缓存和兼容性检查） */
  version?: string
  /** 预期的模块类型 */
  expectedType?: "esm" | "umd" | "iife" | "auto"
}

/**
 * 联邦插件加载选项
 */
export interface LoaderOptions {
  /** 是否启用缓存，默认true */
  enableCache?: boolean
  /** 缓存过期时间（毫秒），默认1小时 */
  cacheExpiration?: number
  /** 最大并发加载数，默认5 */
  maxConcurrentLoads?: number
  /** 是否启用安全验证 */
  enableSecurity?: boolean
  /** 允许的远程来源域名白名单 */
  allowedOrigins?: string[]
  /** 是否启用详细日志 */
  verbose?: boolean
}

/**
 * 加载状态枚举
 */
export enum LoadingState {
  PENDING = "pending",
  LOADING = "loading",
  LOADED = "loaded",
  ERROR = "error",
  CACHED = "cached",
}

/**
 * 加载结果接口
 */
export interface LoadResult<T = any> {
  /** 加载状态 */
  state: LoadingState
  /** 加载的模块实例 */
  module?: T
  /** 错误信息（如果加载失败） */
  error?: Error
  /** 加载耗时（毫秒） */
  loadTime?: number
  /** 加载方式 */
  loadMethod?: "esm" | "script"
  /** 是否来自缓存 */
  fromCache?: boolean
  /** 模块元数据 */
  metadata?: RemoteModuleMetadata
}

/**
 * 远程模块元数据
 */
export interface RemoteModuleMetadata {
  /** 模块大小（字节） */
  size?: number
  /** 最后修改时间 */
  lastModified?: number
  /** 内容哈希（用于缓存验证） */
  contentHash?: string
  /** 依赖列表 */
  dependencies?: string[]
  /** 模块导出信息 */
  exports?: string[]
}

/**
 * 联邦插件接口（扩展标准插件接口）
 */
export interface FederatedPlugin extends CodegenPlugin {
  /** 远程规格信息 */
  remoteSpec?: RemoteSpec
  /** 是否为远程加载的插件 */
  isRemote?: boolean
  /** 加载时间戳 */
  loadedAt?: number
}

/**
 * 缓存条目接口
 */
export interface CacheEntry<T = any> {
  /** 缓存的模块实例 */
  module: T
  /** 缓存时间戳 */
  timestamp: number
  /** 过期时间戳 */
  expiresAt: number
  /** 远程规格 */
  spec: RemoteSpec
  /** 加载元数据 */
  metadata?: RemoteModuleMetadata
}

/**
 * 加载器事件类型
 */
export interface LoaderEvents {
  /** 开始加载事件 */
  "load:start": { spec: RemoteSpec }
  /** 加载成功事件 */
  "load:success": { spec: RemoteSpec; result: LoadResult }
  /** 加载失败事件 */
  "load:error": { spec: RemoteSpec; error: Error }
  /** 缓存命中事件 */
  "cache:hit": { spec: RemoteSpec }
  /** 缓存失效事件 */
  "cache:miss": { spec: RemoteSpec }
  /** 缓存清理事件 */
  "cache:cleanup": { removedCount: number }
}

/**
 * 安全验证结果
 */
export interface SecurityValidation {
  /** 验证是否通过 */
  isValid: boolean
  /** 验证错误信息 */
  errors: string[]
  /** 警告信息 */
  warnings: string[]
  /** 安全等级评分 (0-100) */
  securityScore: number
}

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  /** 总加载次数 */
  totalLoads: number
  /** 成功加载次数 */
  successfulLoads: number
  /** 失败加载次数 */
  failedLoads: number
  /** 平均加载时间（毫秒） */
  averageLoadTime: number
  /** 缓存命中率 */
  cacheHitRate: number
  /** 内存使用量（字节） */
  memoryUsage: number
  /** ESM vs Script 加载统计 */
  loadMethodStats: {
    esm: number
    script: number
  }
}

/**
 * 联邦加载器接口
 */
export interface IFederatedLoader {
  /**
   * 加载远程模块
   */
  load<T = CodegenPlugin>(spec: RemoteSpec): Promise<LoadResult<T>>

  /**
   * 预加载远程模块（不阻塞）
   */
  preload(spec: RemoteSpec): Promise<void>

  /**
   * 卸载模块（清理资源）
   */
  unload(spec: RemoteSpec): Promise<void>

  /**
   * 清理缓存
   */
  clearCache(filter?: (entry: CacheEntry) => boolean): Promise<number>

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics

  /**
   * 验证远程模块安全性
   */
  validateSecurity(spec: RemoteSpec): Promise<SecurityValidation>
}

/**
 * 错误类型枚举
 */
export enum FederationErrorType {
  NETWORK_ERROR = "network_error",
  TIMEOUT_ERROR = "timeout_error",
  PARSE_ERROR = "parse_error",
  SECURITY_ERROR = "security_error",
  VALIDATION_ERROR = "validation_error",
  DEPENDENCY_ERROR = "dependency_error",
  UNKNOWN_ERROR = "unknown_error",
}

/**
 * Federation专用错误类
 */
export class FederationError extends Error {
  public readonly type: FederationErrorType
  public readonly spec?: RemoteSpec
  public readonly originalError?: Error
  public readonly timestamp: number

  constructor(
    type: FederationErrorType,
    message: string,
    spec?: RemoteSpec,
    originalError?: Error,
  ) {
    super(message)
    this.name = "FederationError"
    this.type = type
    this.spec = spec
    this.originalError = originalError
    this.timestamp = Date.now()
  }

  toString(): string {
    return `${this.name}[${this.type}]: ${this.message} ${this.spec ? `(${this.spec.scope}/${this.spec.module})` : ""}`
  }
}
