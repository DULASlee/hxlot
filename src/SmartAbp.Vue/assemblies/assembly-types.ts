/**
 * 装配件类型定义
 */

export interface AssemblyConfig {
  assemblies: {
    [key: string]: AssemblyDefinitionConfig
  }
  dependencyGraph: {
    [assembly: string]: string[]
  }
}

export interface AssemblyDefinitionConfig {
  name: string
  displayName: string
  version: string
  enabled: boolean
  type: 'frontend' | 'backend'
  category: string
  description: string
  dependencies?: string[]
  exports?: {
    [key: string]: string
  }
  services?: string[]
  config?: any
}

export interface AssemblyDefinition<T = any> {
  name: string
  version: string
  config: AssemblyDefinitionConfig
  exports: T
  loaded: boolean
  loadTime: Date
}

export interface AssemblyMetadata {
  name: string
  version: string
  description: string
  author?: string
  license?: string
  repository?: string
  keywords?: string[]
}

export interface AssemblyDependency {
  name: string
  version: string
  type: 'peer' | 'runtime' | 'dev'
}

export interface AssemblyExport {
  name: string
  type: 'component' | 'service' | 'util' | 'hook'
  path: string
  description?: string
}

// 装配件生命周期钩子
export interface AssemblyLifecycle {
  beforeLoad?(): Promise<void>
  afterLoad?(): Promise<void>
  beforeUnload?(): Promise<void>
  afterUnload?(): Promise<void>
}

// 装配件事件类型
export type AssemblyEvent = 
  | 'load' 
  | 'unload' 
  | 'error' 
  | 'config-update'

export interface AssemblyEventData {
  assembly: string
  event: AssemblyEvent
  timestamp: Date
  data?: any
}

// 装配件加载器配置
export interface AssemblyLoaderConfig {
  basePath?: string
  cacheEnabled?: boolean
  preload?: boolean
  timeout?: number
  retryCount?: number
}

// 装配件注册表
export interface AssemblyRegistry {
  register(assembly: AssemblyDefinition): void
  unregister(name: string): void
  get(name: string): AssemblyDefinition | undefined
  getAll(): AssemblyDefinition[]
  has(name: string): boolean
}

// 装配件验证结果
export interface AssemblyValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// 装配件依赖解析结果
export interface DependencyResolution {
  resolved: boolean
  dependencies: AssemblyDependency[]
  conflicts: string[]
  missing: string[]
}