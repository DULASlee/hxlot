/**
 * @smartabp/metadata-core/types
 * 
 * 统一元数据类型定义
 * 保持与后端C#模型一致
 */

// ========================================
// 实体元数据类型
// ========================================

/**
 * 实体元数据
 */
export interface EntityMetadata {
  /** Schema版本 */
  schemaVersion?: string
  
  /** 实体名称（PascalCase） */
  name: string
  
  /** 所属模块 */
  module: string
  
  /** 聚合根名称（可选） */
  aggregate?: string
  
  /** 主键类型 */
  keyType: 'Guid' | 'int' | 'long' | 'string'
  
  /** 实体描述 */
  description?: string
  
  /** 是否为聚合根 */
  isAggregateRoot: boolean
  
  /** 是否支持多租户 */
  isMultiTenant: boolean
  
  /** 是否软删除 */
  isSoftDelete: boolean
  
  /** 是否支持扩展属性 */
  hasExtraProperties: boolean
  
  /** 属性列表 */
  properties: PropertyMetadata[]
  
  /** 导航属性列表 */
  navigationProperties?: NavigationPropertyMetadata[]
  
  /** 前端UI配置（可选） */
  xUiConfig?: UIConfig
  
  /** 后端代码生成配置（可选） */
  xBackendConfig?: BackendConfig
}

/**
 * 属性元数据
 */
export interface PropertyMetadata {
  name: string
  type: string
  isRequired: boolean
  isReadOnly: boolean
  isUnique: boolean
  maxLength?: number
  minLength?: number
  minValue?: number
  maxValue?: number
  defaultValue?: string
  description?: string
  displayName?: string
  validationRules?: ValidationRule[]
}

/**
 * 导航属性元数据
 */
export interface NavigationPropertyMetadata {
  name: string
  targetEntity: string
  relationType: 'OneToOne' | 'OneToMany' | 'ManyToOne' | 'ManyToMany'
  foreignKey?: string
  inverseName?: string
}

/**
 * 验证规则
 */
export interface ValidationRule {
  name: string
  condition: string
  errorMessage: string
}

/**
 * UI配置
 */
export interface UIConfig {
  listColumns?: string[]
  formFields?: string[]
  searchFields?: string[]
  defaultSort?: string
  pageSize?: number
}

/**
 * 后端配置
 */
export interface BackendConfig {
  generateRepository?: boolean
  generateAppService?: boolean
  generateController?: boolean
  generateDto?: boolean
}

// ========================================
// 模块元数据类型
// ========================================

/**
 * 模块元数据
 */
export interface ModuleMetadata {
  schemaVersion?: string
  name: string
  displayName?: string
  version: string
  description?: string
  author?: string
  abpStyle: boolean
  order: number
  dependsOn: string[]
  routes: RouteMetadata[]
  stores: StoreMetadata[]
  policies: string[]
  lifecycle?: LifecycleMetadata
  features?: FeatureConfig
  menuConfig?: MenuConfig
}

/**
 * 路由元数据
 */
export interface RouteMetadata {
  path: string
  name: string
  component?: string
  meta?: Record<string, unknown>
  children?: RouteMetadata[]
}

/**
 * Store元数据
 */
export interface StoreMetadata {
  name: string
  type: 'entity' | 'ui' | 'global'
  entityName?: string
}

/**
 * 生命周期元数据
 */
export interface LifecycleMetadata {
  onBeforeMount?: string
  onMounted?: string
  onBeforeUnmount?: string
}

/**
 * 功能配置
 */
export interface FeatureConfig {
  [featureName: string]: boolean | string | number
}

/**
 * 菜单配置
 */
export interface MenuConfig {
  title: string
  icon?: string
  order?: number
  children?: MenuConfig[]
}

// ========================================
// Aspire微服务方案元数据类型
// ========================================

/**
 * Aspire微服务方案元数据
 */
export interface AspireSolutionMetadata {
  schemaVersion?: string
  solutionName: string
  rootNamespace: string
  description?: string
  microservices: MicroserviceMetadata[]
  includeApiGateway: boolean
  infrastructure: InfrastructureConfig
  observability: ObservabilityConfig
  security?: SecurityConfig
}

/**
 * 微服务元数据
 */
export interface MicroserviceMetadata {
  name: string
  displayName?: string
  port: number
  type: 'WebApi' | 'gRPC' | 'Worker' | 'Gateway'
  description?: string
  dependencies: string[]
  endpoints?: EndpointMetadata[]
}

/**
 * 端点元数据
 */
export interface EndpointMetadata {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  description?: string
}

/**
 * 基础设施配置
 */
export interface InfrastructureConfig {
  database?: DatabaseConfig
  cache?: CacheConfig
  messageQueue?: MessageQueueConfig
}

/**
 * 数据库配置
 */
export interface DatabaseConfig {
  type: 'PostgreSQL' | 'MySQL' | 'SqlServer' | 'MongoDB'
  connectionString?: string
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  type: 'Redis' | 'MemoryCache'
  connectionString?: string
}

/**
 * 消息队列配置
 */
export interface MessageQueueConfig {
  type: 'RabbitMQ' | 'Kafka' | 'AzureServiceBus'
  connectionString?: string
}

/**
 * 可观测性配置
 */
export interface ObservabilityConfig {
  enableLogging: boolean
  enableMetrics: boolean
  enableTracing: boolean
  loggingProvider?: 'Serilog' | 'NLog'
  metricsProvider?: 'Prometheus' | 'AppInsights'
  tracingProvider?: 'OpenTelemetry' | 'AppInsights'
}

/**
 * 安全配置
 */
export interface SecurityConfig {
  enableAuthentication: boolean
  enableAuthorization: boolean
  authProvider?: 'IdentityServer' | 'AzureAD' | 'JWT'
}

// ========================================
// 常量定义
// ========================================

/**
 * Schema版本
 */
export const SCHEMA_VERSION = '1.0.0' as const

/**
 * 支持的实体主键类型
 */
export const KEY_TYPES = ['Guid', 'int', 'long', 'string'] as const

/**
 * 支持的属性类型
 */
export const PROPERTY_TYPES = [
  'string',
  'int',
  'long',
  'decimal',
  'double',
  'bool',
  'DateTime',
  'Guid',
  'byte[]',
  'TimeSpan',
  'DateOnly',
  'TimeOnly'
] as const

/**
 * 默认实体配置
 */
export const DEFAULT_ENTITY_CONFIG = {
  keyType: 'Guid',
  isAggregateRoot: true,
  isMultiTenant: true,
  isSoftDelete: true,
  hasExtraProperties: true
} as const

