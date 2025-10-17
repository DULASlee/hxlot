/**
 * 🔥 SmartAbp LowCode Engine - 前端元数据类型定义
 *
 * 这是前端特有的元数据类型定义（Frontend-Specific Metadata Types）
 *
 * 说明：
 * - 这些类型用于前端元数据建模、验证器、工具函数
 * - 后端API DTO类型请使用 @/api/generated/api-client.ts
 * - 废弃原因：从unified-schema.ts分离，职责更清晰
 *
 * @version 2.0.0
 * @author SmartAbp架构团队
 * @date 2025-10-17
 */

// ============================================================================
// Schema版本管理
// ============================================================================

/**
 * 元数据Schema版本号
 * 遵循语义化版本规范: MAJOR.MINOR.PATCH
 */
export const METADATA_SCHEMA_VERSION = '2.0.0'

/**
 * 支持的Schema版本列表
 */
export const SUPPORTED_METADATA_VERSIONS = ['2.0.0', '1.0.0'] as const

/**
 * Schema版本信息
 */
export interface SchemaVersion {
    current: string
    supported: readonly string[]
    deprecated: string[]
    breaking: string[]
}

/**
 * 获取Schema版本信息
 */
export function getSchemaVersion(): SchemaVersion {
    return {
        current: METADATA_SCHEMA_VERSION,
        supported: SUPPORTED_METADATA_VERSIONS,
        deprecated: ['1.0.0'],
        breaking: ['2.0.0']
    }
}

/**
 * 检查Schema版本兼容性
 */
export function isSchemaVersionCompatible(version: string): boolean {
    return SUPPORTED_METADATA_VERSIONS.includes(version as typeof SUPPORTED_METADATA_VERSIONS[number])
}

// ============================================================================
// 元数据建模核心类型
// ============================================================================

/**
 * 实体元数据（前端元数据建模）
 * 说明：用于前端元数据建模，不同于后端的EntityDefinitionDto
 */
export interface EntityMetadata {
    schemaVersion?: string
    name: string
    displayName?: string
    apiPath?: string
    module: string
    aggregate?: string
    keyType: 'Guid' | 'int' | 'long' | 'string'
    description?: string
    isAggregateRoot: boolean
    isMultiTenant: boolean
    isSoftDelete: boolean
    hasExtraProperties: boolean
    properties: PropertyMetadata[]
    navigationProperties?: NavigationPropertyMetadata[]
    xUiConfig?: UIConfig
    xBackendConfig?: BackendConfig
}

/**
 * 属性元数据
 */
export interface PropertyMetadata {
    name: string
    type: string
    isRequired?: boolean
    isReadOnly?: boolean
    isUnique?: boolean
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
 * 验证规则（前端元数据 - 简化版）
 */
export interface ValidationRule {
    name: string
    condition: string
    errorMessage: string
}

/**
 * 统一验证规则（前端扩展 - 详细版）
 * 对应后端: ValidationRuleDto (Dtos.cs)
 */
export interface UnifiedValidationRule {
    /** 规则唯一标识 */
    id?: string

    /** 字段名称 */
    fieldName: string

    /** 规则类型 */
    ruleType: 'required' | 'length' | 'range' | 'regex' | 'email' | 'url' | 'unique' | 'custom'

    /** 规则值（根据ruleType解释） */
    ruleValue: string | number | object

    /** 错误提示信息 */
    errorMessage: string

    /** 触发时机 */
    trigger?: 'blur' | 'change' | 'submit'
}

/**
 * UI配置（前端元数据）
 */
export interface UIConfig {
    listColumns?: string[]
    formFields?: string[]
    searchFields?: string[]
    defaultSort?: string
    pageSize?: number
}

/**
 * 后端配置（前端元数据）
 */
export interface BackendConfig {
    generateRepository?: boolean
    generateAppService?: boolean
    generateController?: boolean
    generateDto?: boolean
}

// ============================================================================
// 模块元数据
// ============================================================================

/**
 * 模块元数据（前端模块配置 - 严格版）
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
 * 统一模块元数据（前端扩展 - 宽松版，向后兼容）
 * Phase 1D: 用于替代旧的UnifiedModuleMetadata
 */
export interface UnifiedModuleMetadata {
    id?: string
    schemaVersion?: string
    systemName?: string
    name: string
    displayName?: string
    version: string
    description?: string
    author?: string
    abpStyle?: boolean
    order?: number
    dependsOn?: string[]
    routes?: RouteMetadata[]
    stores?: StoreMetadata[]
    policies?: string[]
    lifecycle?: LifecycleMetadata
    features?: FeatureConfig
    menuConfig?: MenuConfig
    architecturePattern?: string
    namespace?: string
    databaseInfo?: any
    uiFramework?: string
    includeTests?: boolean
    createdAt?: Date
    updatedAt?: Date
    [key: string]: any // 允许额外字段
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

// ============================================================================
// Aspire微服务元数据
// ============================================================================

/**
 * Aspire解决方案元数据
 */
export interface AspireSolutionMetadata {
    solutionName: string
    version: string
    description?: string
    services: MicroserviceMetadata[]
    sharedLibraries?: string[]
}

/**
 * 微服务元数据
 */
export interface MicroserviceMetadata {
    name: string
    displayName?: string
    description?: string
    type: 'api' | 'gateway' | 'service'
    port: number
    endpoints: EndpointMetadata[]
}

/**
 * 端点元数据
 */
export interface EndpointMetadata {
    path: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    summary?: string
    requestType?: string
    responseType?: string
}

// ============================================================================
// 前端扩展配置类型（可选保留）
// ============================================================================

/**
 * 统一实体索引（前端扩展）
 */
export interface UnifiedEntityIndex {
    id: string
    name: string
    columns: string[]
    isUnique: boolean
    isClustered: boolean
}

/**
 * 统一实体约束（前端扩展）
 */
export interface UnifiedEntityConstraint {
    id: string
    name: string
    type: string
    definition: string
}

/**
 * 统一实体权限（前端扩展）
 */
export interface UnifiedEntityPermission {
    id: string
    name: string
    displayName: string
    description: string
    isGranted: boolean
}

/**
 * 统一数据库配置（前端扩展）
 */
export interface UnifiedDatabaseConfig {
    /** 连接字符串名称 */
    connectionStringName: string

    /** 数据库Schema */
    schema: string

    /** 数据库提供程序 */
    provider: 'SqlServer' | 'PostgreSql' | 'MySql' | 'Oracle' | 'SQLite'
}

/**
 * 统一前端配置（前端扩展）
 */
export interface UnifiedFrontendConfig {
    /** 父级菜单ID */
    parentId: string

    /** 路由前缀 */
    routePrefix: string
}

/**
 * 统一特性管理（前端扩展）
 */
export interface UnifiedFeatureManagement {
    /** 是否启用 */
    isEnabled: boolean

    /** 默认策略 */
    defaultPolicy: string
}

/**
 * 统一菜单配置（前端扩展）
 */
export interface UnifiedMenuConfig {
    id: string
    label: string
    icon?: string
    route?: string
    children: UnifiedMenuConfig[]
}

/**
 * 统一权限配置（前端扩展）
 */
export interface UnifiedPermissionConfig {
    groupName?: string
    groups?: Array<{
        name: string
        displayName: string
        permissions: Array<{
            name: string
            displayName: string
            description: string
            isGrantedByDefault: boolean
        }>
    }>
    permissions?: Array<{
        name: string
        displayName: string
        description: string
        isGrantedByDefault: boolean
    }>
    customActions?: Array<{
        name: string
        displayName: string
        description: string
    }>
}

/**
 * 统一代码生成配置（前端扩展）
 */
export interface UnifiedCodeGenerationConfig {
    generateEntity: boolean
    generateDto: boolean
    generateAppService: boolean
    generateController: boolean
    generateRepository: boolean
    generateFrontend: boolean
    generateTests: boolean
}

/**
 * 统一实体UI配置（前端扩展）
 */
export interface UnifiedEntityUIConfig {
    listPage: {
        pageSize: number
        sortField: string
        sortOrder: 'asc' | 'desc'
        searchFields: string[]
        displayFields: string[]
    }
    formPage: {
        layout: 'horizontal' | 'vertical' | 'inline'
        labelWidth: number
        fieldGroups: Array<{
            name: string
            displayName: string
            fields: string[]
        }>
    }
    detailPage: {
        layout: 'card' | 'tabs'
        displayFields: string[]
    }
}

// ============================================================================
// 类型守卫函数
// ============================================================================

/**
 * 检查是否为有效的实体元数据
 */
export function isEntityMetadata(obj: unknown): obj is EntityMetadata {
    if (!obj || typeof obj !== 'object') return false

    const metadata = obj as Partial<EntityMetadata>

    return !!(
        metadata.name &&
        metadata.module &&
        metadata.properties &&
        Array.isArray(metadata.properties)
    )
}

/**
 * 检查是否为有效的模块元数据
 */
export function isModuleMetadata(obj: unknown): obj is ModuleMetadata {
    if (!obj || typeof obj !== 'object') return false

    const metadata = obj as Partial<ModuleMetadata>

    return !!(
        metadata.name &&
        metadata.version &&
        metadata.routes &&
        Array.isArray(metadata.routes)
    )
}

// ============================================================================
// 向后兼容导出（废弃警告）
// ============================================================================

/**
 * @deprecated 使用 METADATA_SCHEMA_VERSION 替代
 */
export const UNIFIED_SCHEMA_VERSION = METADATA_SCHEMA_VERSION

/**
 * @deprecated 使用 SUPPORTED_METADATA_VERSIONS 替代
 */
export const SUPPORTED_SCHEMA_VERSIONS = SUPPORTED_METADATA_VERSIONS

