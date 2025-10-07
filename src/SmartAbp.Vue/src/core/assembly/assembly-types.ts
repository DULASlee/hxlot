// 修复类型定义，添加必要的全局类型声明

// 声明全局类型以解决ESLint错误
declare global {
  interface Window {
    // 用于存储适配器
    indexedDB?: IDBFactory
  }

  // NodeJS类型声明（用于setTimeout等）
  namespace NodeJS {
    interface Timeout { }
    interface Immediate { }
  }

  // Fetch API类型声明已由lib.dom.d.ts提供，无需重复声明
}

/**
 * 装配件类型枚举
 */
export enum AssemblyType {
  MODULE = 'module',
  COMPONENT = 'component',
  SERVICE = 'service',
  PLUGIN = 'plugin',
  WIDGET = 'widget'
}

/**
 * 装配件配置接口
 */
export interface AssemblyConfig {
  /** 装配件唯一名称 */
  name: string
  /** 版本号 */
  version: string
  /** 描述信息 */
  description?: string
  /** 显示名称 */
  displayName?: string
  /** 入口文件路径或URL */
  entry: string
  /** 装配件类型 */
  type: AssemblyType | string
  /** 是否启用 */
  enabled: boolean
  /** 加载顺序（数字越小越先加载） */
  loadOrder?: number
  /** 超时时间（毫秒） */
  timeout?: number
  /** 依赖的装配件名称列表 */
  dependencies: string[]
  /** 元数据 */
  metadata: Record<string, any>
  /** 配置选项 */
  config: Record<string, any>
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
  /** 最后加载时间 */
  lastLoaded?: Date
}

/**
 * 装配件实例接口
 */
export interface AssemblyInstance {
  /** 装配件名称 */
  name: string
  /** 装配件版本 */
  version?: string
  /** 装配件配置 */
  config: AssemblyConfig
  /** 加载状态 */
  loaded: boolean
  /** 启用状态 */
  enabled: boolean
  /** 加载错误信息 */
  error?: Error
  /** 实例对象（加载的模块） */
  instance?: any
  /** 加载时间 */
  loadTime?: Date
  /** 卸载时间 */
  unloadTime?: Date
  /** 健康状态 */
  health?: AssemblyHealth
  /** 卸载方法 */
  unload?: () => Promise<void>
  /** 清理方法 */
  cleanup?: () => Promise<void>
  /** 健康检查方法 */
  healthCheck?: () => Promise<AssemblyHealth>
}

/**
 * 装配件事件类型
 */
export type AssemblyEventType =
  | 'loading'            // 开始加载
  | 'loaded'             // 加载完成
  | 'unloading'          // 开始卸载
  | 'unloaded'           // 卸载完成
  | 'enabled'            // 启用
  | 'disabled'           // 禁用
  | 'error'              // 错误
  | 'validated'          // 验证完成
  | 'healthCheck'        // 健康检查
  | 'initialized'        // 已初始化
  | 'registered'         // 已注册
  | 'unregistered'       // 已注销
  | 'updated'            // 已更新
  | 'validation-failed'  // 验证失败
  | 'health-changed'     // 健康状态变化
  | 'disposed'           // 已释放
  | '*'                  // 所有事件

/**
 * 装配件事件接口
 */
export interface AssemblyEvent {
  /** 事件类型 */
  type: AssemblyEventType
  /** 装配件名称 */
  assemblyName: string
  /** 时间戳 */
  timestamp: Date
  /** 错误信息（仅error事件） */
  error?: Error
  /** 事件数据 */
  data?: any
}

/**
 * 装配件健康状态
 */
export interface AssemblyHealth {
  /** 健康状态 */
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
  /** 健康检查时间 */
  timestamp: Date
  /** 最后检查时间 */
  lastCheck?: Date
  /** 详细信息 */
  details?: Record<string, any>
  /** 错误信息 */
  error?: string | Error
  /** 状态消息 */
  message?: string
}

/**
 * 装配件验证结果
 */
export interface AssemblyValidationResult {
  /** 是否有效 */
  isValid: boolean
  /** 验证错误信息 */
  errors: string[]
  /** 警告信息 */
  warnings: string[]
  /** 验证时间 */
  timestamp: Date
  /** 依赖关系 */
  dependencies?: string[]
}

/**
 * 存储适配器接口
 */
export interface AssemblyStorage {
  /** 存储类型 */
  type?: string
  /** 保存配置 */
  saveConfig(config: AssemblyConfig): Promise<void>
  /** 加载配置 */
  loadConfig(name: string): Promise<AssemblyConfig | null>
  /** 加载所有配置 */
  loadAllConfigs(): Promise<AssemblyConfig[]>
  /** 删除配置 */
  deleteConfig(name: string): Promise<void>
  /** 检查配置是否存在 */
  configExists(name: string): Promise<boolean>
}

/**
 * 依赖关系图节点
 */
export interface DependencyNode {
  /** 节点名称 */
  name: string
  /** 节点版本 */
  version?: string
  /** 依赖的节点名称列表 */
  dependencies: string[]
  /** 被哪些节点依赖 */
  dependents: string[]
  /** 节点深度 */
  depth: number
}

/**
 * 依赖关系图
 */
export interface DependencyGraph {
  /** 所有节点 */
  nodes: Map<string, DependencyNode>
  /** 根节点（没有依赖的节点） */
  roots: string[]
  /** 是否有循环依赖 */
  hasCycles: boolean
  /** 拓扑排序结果 */
  topologicalOrder: string[]
}

/**
 * 装配件管理器接口
 */
export interface IAssemblyManager {
  /** 注册装配件配置（返回验证结果） */
  registerAssembly(config: AssemblyConfig): Promise<AssemblyValidationResult>
  /** 加载装配件 */
  loadAssembly(name: string): Promise<AssemblyInstance>
  /** 卸载装配件 */
  unloadAssembly(name: string): Promise<void>
  /** 重新加载装配件 */
  reloadAssembly(name: string): Promise<AssemblyInstance>
  /** 启用装配件 */
  enableAssembly(name: string): Promise<void>
  /** 禁用装配件 */
  disableAssembly(name: string): Promise<void>
  /** 获取装配件实例（允许返回null） */
  getAssembly(name: string): AssemblyInstance | null | undefined
  /** 获取所有装配件配置 */
  getAllAssemblyConfigs(): AssemblyConfig[]
  /** 获取所有装配件实例 */
  getAllAssemblyInstances(): AssemblyInstance[]
  /** 验证装配件配置 */
  validateAssembly(config: AssemblyConfig): AssemblyValidationResult
  /** 检查装配件健康状态 */
  checkAssemblyHealth(name: string): Promise<AssemblyHealth>
  /** 构建依赖关系图 */
  buildDependencyGraph(): DependencyGraph
  /** 事件监听 */
  on(event: AssemblyEventType | '*', callback: (event: AssemblyEvent) => void): void
  /** 移除事件监听 */
  off(event: AssemblyEventType | '*', callback: (event: AssemblyEvent) => void): void
  /** 清理资源（可选） */
  dispose?(): Promise<void>
}

/**
 * 装配件加载器接口
 */
export interface IAssemblyLoader {
  /** 加载装配件 */
  load(entry: string, config?: Record<string, any>): Promise<any>
  /** 卸载装配件 */
  unload(instance: any): Promise<void>
  /** 验证装配件 */
  validate(entry: string): Promise<AssemblyValidationResult>
}

/**
 * 装配件事件回调函数类型
 */
export type AssemblyEventHandler = (event: AssemblyEvent) => void

/**
 * 装配件管理器选项
 */
export interface AssemblyManagerOptions {
  /** 存储适配器 */
  storage?: AssemblyStorage
  /** 自动加载配置 */
  autoLoad?: boolean
  /** 启用调试模式 */
  debug?: boolean
  /** 默认配置 */
  defaultConfig?: Partial<AssemblyConfig>
  /** 加载器选项 */
  loaderOptions?: AssemblyLoaderOptions
  /** 启用健康检查 */
  enableHealthChecks?: boolean
  /** 健康检查间隔（毫秒） */
  healthCheckInterval?: number
}

/**
 * 装配件加载器选项
 */
export interface AssemblyLoaderOptions {
  /** 超时时间（毫秒） */
  timeout?: number
  /** 重试次数 */
  retries?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
  /** 启用缓存 */
  cache?: boolean
  /** 验证选项 */
  validation?: {
    /** 启用验证 */
    enabled: boolean
    /** 验证规则 */
    rules: string[]
  }
}

// 所有类型已在上方使用 export 关键字导出，无需重复导出
