/**
 * 🔥 SmartAbp LowCode Engine - 统一元数据Schema v1.0.0
 *
 * 这是前后端统一的单一事实来源（Single Source of Truth）
 *
 * 规则:
 * 1. 所有前端packages必须使用此Schema
 * 2. 后端DTO通过AutoMapper映射此Schema
 * 3. 严禁在其他地方重复定义相同类型
 * 4. 新增字段必须同步更新前后端
 *
 * @version 1.0.0
 * @author SmartAbp架构团队
 * @date 2025-10-05
 */

// ============================================================================
// Schema版本管理
// ============================================================================

/**
 * 统一Schema版本号
 * 遵循语义化版本规范: MAJOR.MINOR.PATCH
 */
export const UNIFIED_SCHEMA_VERSION = '1.0.0'

/**
 * 支持的Schema版本列表
 */
export const SUPPORTED_SCHEMA_VERSIONS = ['1.0.0'] as const

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
        current: UNIFIED_SCHEMA_VERSION,
        supported: SUPPORTED_SCHEMA_VERSIONS,
        deprecated: [],
        breaking: []
    }
}

// ============================================================================
// metadata-core兼容类型（从metadata-core迁移）
// ============================================================================

/**
 * 实体元数据（metadata-core兼容）
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

/**
 * 模块元数据（metadata-core兼容）
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
// 核心元数据类型
// ============================================================================

/**
 * 统一模块元数据
 *
 * 对应后端: ModuleMetadataDto (Dtos.cs)
 * 用途: 描述一个完整的业务模块（如ProjectManagement, Device）
 */
export interface UnifiedModuleMetadata {
    // ────────────────────────────────────────────────────────
    // 核心标识（必填）
    // ────────────────────────────────────────────────────────

    /** 唯一标识 (GUID) */
    id: string

    /** 系统名称（如 SmartConstruction, MES） */
    systemName: string

    /** 模块名称（如 ProjectManagement, Device） */
    name: string

    /** 显示名称（如 项目管理, 设备管理） */
    displayName: string

    /** 模块描述 */
    description: string

    /** 模块版本号（如 1.0.0） */
    version: string

    /** 命名空间（如 SmartAbp.ProjectManagement） */
    namespace: string

    // ────────────────────────────────────────────────────────
    // 架构配置
    // ────────────────────────────────────────────────────────

    /** 架构模式: CRUD | DDD | CQRS */
    architecturePattern: 'Crud' | 'DDD' | 'CQRS'

    /** 代码生成作者信息 */
    author: string

    // ────────────────────────────────────────────────────────
    // 数据库配置
    // ────────────────────────────────────────────────────────

    /** 数据库配置 */
    databaseInfo: UnifiedDatabaseConfig

    // ────────────────────────────────────────────────────────
    // 前端配置
    // ────────────────────────────────────────────────────────

    /** 前端配置 */
    frontend: UnifiedFrontendConfig

    /** 是否生成移动端页面 */
    generateMobilePages: boolean

    // ────────────────────────────────────────────────────────
    // 功能特性
    // ────────────────────────────────────────────────────────

    /** 特性管理配置 */
    featureManagement: UnifiedFeatureManagement

    // ────────────────────────────────────────────────────────
    // 业务数据
    // ────────────────────────────────────────────────────────

    /** 实体列表 */
    entities: UnifiedEntityDefinition[]

    /** 菜单配置 */
    menuConfig: UnifiedMenuConfig[]

    /** 权限配置 */
    permissionConfig: UnifiedPermissionConfig

    /** 依赖的其他模块 */
    dependencies: string[]

    // ────────────────────────────────────────────────────────
    // 元数据管理
    // ────────────────────────────────────────────────────────

    /** Schema版本号 */
    schemaVersion: string

    /** 创建时间 */
    createdAt: Date

    /** 更新时间 */
    updatedAt: Date
}

/**
 * 统一实体定义
 *
 * 对应后端: EnhancedEntityModelDto (Dtos.cs)
 * 用途: 描述一个业务实体（如Project, Device）
 */
export interface UnifiedEntityDefinition {
    // ────────────────────────────────────────────────────────
    // 核心标识（必填）
    // ────────────────────────────────────────────────────────

    /** 唯一标识 */
    id: string

    /** 实体名称（PascalCase，如 Project） */
    name: string

    /** 显示名称（如 项目） */
    displayName: string

    /** 表名（如 Projects） */
    tableName: string

    /** 所属模块 */
    module: string

    /** 命名空间 */
    namespace: string

    /** 实体描述 */
    description: string

    /** 数据库Schema（如 dbo） */
    schema: string

    // ────────────────────────────────────────────────────────
    // DDD配置
    // ────────────────────────────────────────────────────────

    /** 是否聚合根 */
    isAggregateRoot: boolean

    /** 基类（如 FullAuditedAggregateRoot<Guid>） */
    baseClass: string

    /** 实现的接口 */
    interfaces: string[]

    // ────────────────────────────────────────────────────────
    // ABP特性
    // ────────────────────────────────────────────────────────

    /** 是否启用审计 */
    isAudited: boolean

    /** 是否软删除 */
    isSoftDelete: boolean

    /** 是否多租户 */
    isMultiTenant: boolean

    // ────────────────────────────────────────────────────────
    // 字段和关系
    // ────────────────────────────────────────────────────────

    /** 字段列表 */
    fields: UnifiedEntityField[]

    /** 关系列表 */
    relationships: UnifiedEntityRelationship[]

    /** 验证规则 */
    validationRules: UnifiedValidationRule[]

    /** 业务规则 */
    businessRules: UnifiedBusinessRule[]

    /** 索引配置 */
    indexes: UnifiedEntityIndex[]

    /** 约束配置 */
    constraints: UnifiedEntityConstraint[]

    // ────────────────────────────────────────────────────────
    // 权限和UI配置
    // ────────────────────────────────────────────────────────

    /** 权限配置 */
    permissions: UnifiedEntityPermission[]

    /** UI配置 */
    uiConfig: UnifiedEntityUIConfig

    /** 代码生成配置 */
    codeGeneration: UnifiedCodeGenerationConfig

    // ────────────────────────────────────────────────────────
    // 状态管理
    // ────────────────────────────────────────────────────────

    /** 是否完成定义 */
    isCompleted: boolean

    /** 标签 */
    tags: string[]

    // ────────────────────────────────────────────────────────
    // 元数据管理
    // ────────────────────────────────────────────────────────

    /** Schema版本号 */
    schemaVersion: string

    /** 实体版本号 */
    version: string

    /** 创建时间 */
    createdAt: Date

    /** 更新时间 */
    updatedAt: Date
}

/**
 * 统一实体字段
 *
 * 对应后端: EntityPropertyDto (Dtos.cs)
 */
export interface UnifiedEntityField {
    /** 唯一标识 */
    id: string

    /** 字段名称（PascalCase，如 ProjectName） */
    name: string

    /** 显示名称（如 项目名称） */
    displayName: string

    /** 字段类型（统一类型系统） */
    type: UnifiedFieldType

    /** 字段描述 */
    description: string

    /** 帮助文本 */
    helpText: string

    // ────────────────────────────────────────────────────────
    // 约束
    // ────────────────────────────────────────────────────────

    /** 是否必填 */
    isRequired: boolean

    /** 是否主键 */
    isPrimaryKey: boolean

    /** 是否唯一 */
    isUnique: boolean

    /** 是否索引 */
    isIndexed: boolean

    /** 默认值 */
    defaultValue?: unknown

    /** 最大长度 */
    maxLength?: number

    /** 最小长度 */
    minLength?: number

    /** 正则模式 */
    pattern?: string

    /** 精度（decimal类型） */
    precision?: number

    /** 小数位数（decimal类型） */
    scale?: number

    /** 最小值（数值类型） */
    minValue?: number

    /** 最大值（数值类型） */
    maxValue?: number

    // ────────────────────────────────────────────────────────
    // 枚举配置
    // ────────────────────────────────────────────────────────

    /** 枚举值（如果是枚举类型） */
    enumValues: UnifiedEnumValue[]

    // ────────────────────────────────────────────────────────
    // 验证规则
    // ────────────────────────────────────────────────────────

    /** 验证规则 */
    validationRules: UnifiedValidationRule[]

    // ────────────────────────────────────────────────────────
    // UI配置
    // ────────────────────────────────────────────────────────

    /** 显示顺序 */
    displayOrder: number

    /** 分组名称 */
    groupName: string

    /** 是否可见 */
    isVisible: boolean

    /** 是否只读 */
    isReadonly: boolean

    /** 列表页是否可见 */
    listVisible: boolean

    /** 详情页是否可见 */
    detailVisible: boolean

    /** 表单页是否可见 */
    formVisible: boolean

    /** 是否可搜索 */
    searchable: boolean

    /** 是否可排序 */
    sortable: boolean

    /** 是否可筛选 */
    filterable: boolean

    /** 是否禁用 */
    disabled: boolean

    // ────────────────────────────────────────────────────────
    // 数据库映射
    // ────────────────────────────────────────────────────────

    /** 数据库列名 */
    columnName: string

    /** 数据库列类型 */
    columnType: string

    /** 是否审计字段 */
    isAuditField: boolean

    /** 是否软删除字段 */
    isSoftDeleteField: boolean

    /** 是否租户字段 */
    isTenantField: boolean
}

/**
 * 统一字段类型
 *
 * 跨平台类型映射:
 * - C#: string → TypeScript: string → PostgreSQL: varchar
 * - C#: int → TypeScript: number → PostgreSQL: integer
 * - C#: Guid → TypeScript: string → PostgreSQL: uuid
 */
export type UnifiedFieldType =
    // 字符串类型
    | 'string'      // C#: string, TS: string, SQL: varchar/nvarchar
    | 'text'        // C#: string, TS: string, SQL: text

    // 数值类型
    | 'int'         // C#: int, TS: number, SQL: integer
    | 'long'        // C#: long, TS: number, SQL: bigint
    | 'decimal'     // C#: decimal, TS: number, SQL: decimal
    | 'double'      // C#: double, TS: number, SQL: double precision

    // 布尔类型
    | 'bool'        // C#: bool, TS: boolean, SQL: boolean

    // 日期时间
    | 'DateTime'    // C#: DateTime, TS: Date, SQL: timestamp
    | 'DateOnly'    // C#: DateOnly, TS: Date, SQL: date
    | 'TimeOnly'    // C#: TimeOnly, TS: Date, SQL: time

    // 唯一标识
    | 'Guid'        // C#: Guid, TS: string, SQL: uuid

    // 枚举
    | 'enum'        // C#: enum, TS: string | number, SQL: integer

    // JSON
    | 'json'        // C#: object, TS: object, SQL: jsonb

    // 二进制
    | 'binary'      // C#: byte[], TS: Blob, SQL: bytea

/**
 * 统一验证规则
 *
 * 对应后端: ValidationRuleDto (Dtos.cs)
 */
export interface UnifiedValidationRule {
    /** 规则唯一标识 */
    id?: string

    /** 字段名称 */
    fieldName: string

    /** 规则类型 */
    ruleType: UnifiedValidationRuleType

    /** 规则值（根据ruleType解释） */
    ruleValue: string

    /** 错误提示信息 */
    errorMessage: string

    /** 触发时机 */
    trigger?: 'blur' | 'change' | 'submit'
}

/**
 * 统一验证规则类型
 */
export type UnifiedValidationRuleType =
    | 'required'    // 必填
    | 'length'      // 长度限制
    | 'range'       // 范围限制
    | 'regex'       // 正则表达式
    | 'email'       // 邮箱格式
    | 'url'         // URL格式
    | 'unique'      // 唯一性
    | 'custom'      // 自定义规则

/**
 * 统一实体关系
 */
export interface UnifiedEntityRelationship {
    id: string
    name: string
    displayName: string
    sourceEntityId: string
    targetEntityId: string
    targetEntity: string
    type: 'OneToOne' | 'OneToMany' | 'ManyToMany'
    sourceProperty: string
    targetProperty: string
    sourceNavigationProperty: string
    targetNavigationProperty: string
    description: string
}

/**
 * 统一业务规则
 */
export interface UnifiedBusinessRule {
    id: string
    name: string
    displayName: string
    description: string
    ruleType: string
    condition: string
    action: string
    priority: number
    isActive: boolean
}

/**
 * 统一枚举值
 */
export interface UnifiedEnumValue {
    name: string
    value: number | string
    displayName: string
    description?: string
}

/**
 * 统一实体索引
 */
export interface UnifiedEntityIndex {
    id: string
    name: string
    columns: string[]
    isUnique: boolean
    isClustered: boolean
}

/**
 * 统一实体约束
 */
export interface UnifiedEntityConstraint {
    id: string
    name: string
    type: string
    definition: string
}

/**
 * 统一实体权限
 */
export interface UnifiedEntityPermission {
    id: string
    name: string
    displayName: string
    description: string
    isGranted: boolean
}

/**
 * 统一实体UI配置
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

/**
 * 统一代码生成配置
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
 * 统一数据库配置
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
 * 统一前端配置
 */
export interface UnifiedFrontendConfig {
    /** 父级菜单ID */
    parentId: string

    /** 路由前缀 */
    routePrefix: string
}

/**
 * 统一特性管理
 */
export interface UnifiedFeatureManagement {
    /** 是否启用 */
    isEnabled: boolean

    /** 默认策略 */
    defaultPolicy: string
}

/**
 * 统一菜单配置
 */
export interface UnifiedMenuConfig {
    id: string
    label: string
    icon?: string
    route?: string
    children: UnifiedMenuConfig[]
}

/**
 * 统一权限配置
 * 🔥 这是前端的唯一真理源，后端 PermissionConfigDto 必须与此保持一致
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

// ============================================================================
// 导出工具类型
// ============================================================================

/**
 * 统一API响应
 */
export interface UnifiedApiResponse<T = unknown> {
    success: boolean
    data: T
    message?: string
    errors?: string[]
}

/**
 * 统一分页请求
 */
export interface UnifiedPagedRequest {
    skipCount: number
    maxResultCount: number
    sorting?: string
    filter?: string
}

/**
 * 统一分页响应
 */
export interface UnifiedPagedResponse<T = unknown> {
    items: T[]
    totalCount: number
}

// ============================================================================
// 类型守卫函数
// ============================================================================

/**
 * 检查是否为有效的统一模块元数据
 */
export function isUnifiedModuleMetadata(obj: unknown): obj is UnifiedModuleMetadata {
    if (!obj || typeof obj !== 'object') return false

    const metadata = obj as Partial<UnifiedModuleMetadata>

    return !!(
        metadata.id &&
        metadata.name &&
        metadata.displayName &&
        metadata.namespace &&
        metadata.entities &&
        Array.isArray(metadata.entities)
    )
}

/**
 * 检查是否为有效的统一实体定义
 */
export function isUnifiedEntityDefinition(obj: unknown): obj is UnifiedEntityDefinition {
    if (!obj || typeof obj !== 'object') return false

    const entity = obj as Partial<UnifiedEntityDefinition>

    return !!(
        entity.id &&
        entity.name &&
        entity.tableName &&
        entity.fields &&
        Array.isArray(entity.fields)
    )
}

/**
 * 检查Schema版本兼容性
 */
export function isSchemaVersionCompatible(version: string): boolean {
    return SUPPORTED_SCHEMA_VERSIONS.includes(version as typeof SUPPORTED_SCHEMA_VERSIONS[number])
}

