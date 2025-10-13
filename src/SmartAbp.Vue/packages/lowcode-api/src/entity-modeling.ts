/**
 * 🔥 实体建模API
 * 对应后端: EntityModelingController
 * 对应Store: entityModeling.ts
 * 功能: 打通前后端通信，替代localStorage伪实现
 */

import { createHttpClient } from './http-client'

// 🔥 使用lowcode-api的HTTP客户端
// 注意: baseURL应该由外部配置,这里提供默认值
const __env = (import.meta as unknown as { env?: Record<string, string> }).env || {}
const BASE = __env['VITE_API_BASE_URL'] || '/api'
const httpClient = createHttpClient({
    baseURL: BASE || 'http://localhost:44375'
})

/**
 * 实体定义（对应后端EntityDefinitionDto）
 */
export interface EntityDefinition {
    id?: string
    name: string
    tableName: string
    displayName: string
    description?: string
    entityType: string
    baseType: string
    namespace: string
    fields?: EntityField[]
    validationRules?: ValidationRule[]
    category?: string
    module?: string
    enableSoftDelete?: boolean
    enableAudit?: boolean
    enableMultiTenant?: boolean
    isCompleted?: boolean
}

/**
 * 实体字段（对应后端EntityFieldDto）
 */
export interface EntityField {
    id?: string
    entityDefinitionId?: string
    name: string
    displayName: string
    type: string
    length?: number
    isRequired: boolean
    isPrimaryKey: boolean
    isUnique?: boolean
    isIndexed?: boolean
    defaultValue?: string
    description?: string
    comment?: string
    order?: number
}

/**
 * 实体关系（对应后端EntityRelationDto）
 */
export interface EntityRelation {
    id?: string
    fromEntity: string
    toEntity: string
    relationType: string
    foreignKey: string
    navigationProperty?: string
    joinTable?: string
    description?: string
    cascadeDelete?: boolean
}

/**
 * 验证规则（对应后端ValidationRuleDto）
 */
export interface ValidationRule {
    id?: string
    entityDefinitionId?: string
    fieldName: string
    ruleType: string
    ruleValue: string
    errorMessage: string
    priority?: number
}

/**
 * 创建/更新实体定义DTO
 */
export interface CreateOrUpdateEntityDefinitionDto {
    name: string
    tableName: string
    displayName: string
    description?: string
    entityType: string
    baseType: string
    namespace: string
}

/**
 * 创建/更新字段DTO
 */
export interface CreateOrUpdateEntityFieldDto {
    entityDefinitionId: string
    name: string
    displayName: string
    type: string
    length?: number
    isRequired: boolean
    isPrimaryKey: boolean
    isUnique?: boolean
    isIndexed?: boolean
    defaultValue?: string
    description?: string
    comment?: string
    order?: number
}

/**
 * 创建/更新关系DTO
 */
export interface CreateOrUpdateEntityRelationDto {
    fromEntity: string
    toEntity: string
    relationType: string
    foreignKey: string
    navigationProperty?: string
    joinTable?: string
    description?: string
    cascadeDelete?: boolean
}

/**
 * 架构验证结果
 */
export interface SchemaValidationResult {
    isValid: boolean
    errors: string[]
    warnings: string[]
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 实体定义管理
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 获取所有实体定义
 */
export function getAllEntities() {
    return httpClient.get<EntityDefinition[]>('/api/lowcode/entity-modeling/entities')
}

/**
 * 根据ID获取实体定义
 */
export function getEntityById(id: string) {
    return httpClient.get<EntityDefinition>(`/api/lowcode/entity-modeling/entities/${id}`)
}

/**
 * 根据名称获取实体定义
 */
export function getEntityByName(name: string) {
    return httpClient.get<EntityDefinition>(
        `/api/lowcode/entity-modeling/entities/by-name/${encodeURIComponent(name)}`
    )
}

/**
 * 创建实体定义
 */
export function createEntity(data: CreateOrUpdateEntityDefinitionDto) {
    return httpClient.post<EntityDefinition>('/api/lowcode/entity-modeling/entities', data)
}

/**
 * 更新实体定义
 */
export function updateEntity(id: string, data: CreateOrUpdateEntityDefinitionDto) {
    return httpClient.put<EntityDefinition>(`/api/lowcode/entity-modeling/entities/${id}`, data)
}

/**
 * 删除实体定义
 */
export function deleteEntity(id: string) {
    return httpClient.delete<void>(`/api/lowcode/entity-modeling/entities/${id}`)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 字段管理
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 添加字段
 */
export function addField(data: CreateOrUpdateEntityFieldDto) {
    return httpClient.post<EntityField>('/api/lowcode/entity-modeling/fields', data)
}

/**
 * 更新字段
 */
export function updateField(id: string, data: CreateOrUpdateEntityFieldDto) {
    return httpClient.put<EntityField>(`/api/lowcode/entity-modeling/fields/${id}`, data)
}

/**
 * 删除字段
 */
export function deleteField(id: string) {
    return httpClient.delete<void>(`/api/lowcode/entity-modeling/fields/${id}`)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 关系管理
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 获取所有关系
 */
export function getAllRelations() {
    return httpClient.get<EntityRelation[]>('/api/lowcode/entity-modeling/relations')
}

/**
 * 创建关系
 */
export function createRelation(data: CreateOrUpdateEntityRelationDto) {
    return httpClient.post<EntityRelation>('/api/lowcode/entity-modeling/relations', data)
}

/**
 * 更新关系
 */
export function updateRelation(id: string, data: CreateOrUpdateEntityRelationDto) {
    return httpClient.put<EntityRelation>(`/api/lowcode/entity-modeling/relations/${id}`, data)
}

/**
 * 删除关系
 */
export function deleteRelation(id: string) {
    return httpClient.delete<void>(`/api/lowcode/entity-modeling/relations/${id}`)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 架构验证
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 验证实体架构
 */
export function validateSchema() {
    return httpClient.post<SchemaValidationResult>('/api/lowcode/entity-modeling/validate-schema')
}

