/**
 * 🔥 SmartAbp LowCode Engine - 前端元数据工具类型
 *
 * Phase 2B瘦身版：只保留前端特有的工具类型，后端SSOT类型请使用 @/api/generated/api-client.ts
 *
 * 保留内容：
 * - Schema版本管理
 * - 前端元数据建模类型（EntityMetadata, ModuleMetadata）
 * - 前端路由和Store配置
 * - 类型守卫函数
 *
 * 已删除内容（使用后端SSOT）：
 * - 所有Unified*Config类型（后端DTO已有）
 * - Aspire微服务元数据（不是核心功能）
 * - UI配置类型（后端PropertyUIConfig已有）
 *
 * @version 2.1.0 (Phase 2B瘦身版)
 * @author SmartAbp架构团队
 * @date 2025-10-17
 */

// ============================================================================
// Schema版本管理
// ============================================================================

export const METADATA_SCHEMA_VERSION = '2.1.0'
export const SUPPORTED_METADATA_VERSIONS = ['2.1.0', '2.0.0', '1.0.0'] as const

export interface SchemaVersion {
    current: string
    supported: readonly string[]
    deprecated: string[]
    breaking: string[]
}

export function getSchemaVersion(): SchemaVersion {
    return {
        current: METADATA_SCHEMA_VERSION,
        supported: SUPPORTED_METADATA_VERSIONS,
        deprecated: ['1.0.0'],
        breaking: ['2.0.0']
    }
}

export function isSchemaVersionCompatible(version: string): boolean {
    return SUPPORTED_METADATA_VERSIONS.includes(version as typeof SUPPORTED_METADATA_VERSIONS[number])
}

// ============================================================================
// 前端元数据建模核心类型
// ============================================================================

/**
 * 实体元数据（前端元数据建模专用）
 * 说明：用于前端元数据建模，与后端EntityDefinitionDto区别
 */
export interface EntityMetadata {
    schemaVersion?: string
    name: string
    displayName?: string
    apiPath?: string
    module: string
    keyType: 'Guid' | 'int' | 'long' | 'string'
    description?: string
    isAggregateRoot: boolean
    isMultiTenant: boolean
    isSoftDelete: boolean
    hasExtraProperties: boolean
    properties: PropertyMetadata[]
    navigationProperties?: NavigationPropertyMetadata[]
    xUiConfig?: Record<string, any> // 前端UI配置扩展
    xBackendConfig?: Record<string, any> // 前端后端配置扩展
}

export interface PropertyMetadata {
    name: string
    type: string
    isRequired?: boolean
    isReadOnly?: boolean
    maxLength?: number
    defaultValue?: string
    description?: string
    displayName?: string
}

export interface NavigationPropertyMetadata {
    name: string
    targetEntity: string
    relationType: 'OneToOne' | 'OneToMany' | 'ManyToOne' | 'ManyToMany'
    foreignKey?: string
}

export interface ValidationRule {
    name: string
    condition: string
    errorMessage: string
}

/** @deprecated 使用 ValidationRule 替代 (Phase 2B) */
export type UnifiedValidationRule = ValidationRule

// ============================================================================
// 前端模块配置类型
// ============================================================================

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
}

export interface RouteMetadata {
    path: string
    name: string
    component?: string
    meta?: Record<string, unknown>
    children?: RouteMetadata[]
}

export interface StoreMetadata {
    name: string
    type: 'entity' | 'ui' | 'global'
    entityName?: string
}

// ============================================================================
// 类型守卫函数
// ============================================================================

export function isEntityMetadata(obj: unknown): obj is EntityMetadata {
    if (!obj || typeof obj !== 'object') return false
    const metadata = obj as Partial<EntityMetadata>
    return !!(metadata.name && metadata.module && metadata.properties && Array.isArray(metadata.properties))
}

export function isModuleMetadata(obj: unknown): obj is ModuleMetadata {
    if (!obj || typeof obj !== 'object') return false
    const metadata = obj as Partial<ModuleMetadata>
    return !!(metadata.name && metadata.version && metadata.routes && Array.isArray(metadata.routes))
}

// ============================================================================
// 向后兼容导出（废弃警告）
// ============================================================================

/** @deprecated 使用 METADATA_SCHEMA_VERSION 替代 */
export const UNIFIED_SCHEMA_VERSION = METADATA_SCHEMA_VERSION

/** @deprecated 使用 SUPPORTED_METADATA_VERSIONS 替代 */
export const SUPPORTED_SCHEMA_VERSIONS = SUPPORTED_METADATA_VERSIONS
