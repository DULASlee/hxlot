/**
 * 🔥 实体建模API
 * 对应后端: EntityModelingController
 * 对应Store: entityModeling.ts
 * 功能: 打通前后端通信，替代localStorage伪实现
 */

import { createHttpClient } from '@smartabp/lowcode-api'

// 🔥 使用lowcode-api的HTTP客户端（packages黑盒原则）
const httpClient = createHttpClient({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:44375'
})

// 🔥 修复：添加CreateOrUpdateEntityDefinitionDto类型定义（后端一致性）
export interface CreateOrUpdateEntityDefinitionDto {
    name: string
    tableName: string
    displayName: string
    description?: string
    entityType: string
    baseType: string
    namespace: string
    fields?: CreateOrUpdateEntityFieldDto[]
}

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
    isUnique: boolean
    isIndexed: boolean
    isPrimaryKey: boolean
    defaultValue?: string
    comment?: string
    order: number
}

/**
 * 实体关系（对应后端EntityRelationDto）
 */
export interface EntityRelation {
    id?: string
    fromEntity: string
    toEntity: string
    relationType: 'one-to-one' | 'one-to-many' | 'many-to-many'
    foreignKey: string
    navigationProperty: string
    joinTable?: string
    description?: string
    cascadeDelete: boolean
}

/**
 * 创建或更新实体字段DTO
 */
export type CreateOrUpdateEntityFieldDto = Omit<EntityField, 'id'>

/**
 * 创建或更新实体关系DTO
 */
export type CreateOrUpdateEntityRelationDto = Omit<EntityRelation, 'id'>

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
 * 架构验证结果
 */
export interface SchemaValidationResult {
    isValid: boolean
    errors: string[]
    warnings: string[]
}

/**
 * 验证实体架构
 */
export function validateSchema() {
    return httpClient.post<SchemaValidationResult>('/api/lowcode/entity-modeling/validate-schema')
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 API桥接注入逻辑（修复花瓶式实现）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 🔥 API桥接类型定义（对应Store中的EntityModelingApiBridge）
 */
export interface EntityModelingApiBridge {
    createEntity: (data: CreateOrUpdateEntityDefinitionDto) => Promise<EntityDefinition>
    deleteEntity: (id: string) => Promise<void>
    updateEntity: (id: string, data: CreateOrUpdateEntityDefinitionDto) => Promise<EntityDefinition>
    getAllEntities: () => Promise<EntityDefinition[]>
    getAllRelations: () => Promise<EntityRelation[]>
    getEntityById: (id: string) => Promise<EntityDefinition>
    getEntityByName: (name: string) => Promise<EntityDefinition>
    addField: (data: CreateOrUpdateEntityFieldDto) => Promise<EntityField>
    updateField: (id: string, data: CreateOrUpdateEntityFieldDto) => Promise<EntityField>
    deleteField: (id: string) => Promise<void>
    createRelation: (data: CreateOrUpdateEntityRelationDto) => Promise<EntityRelation>
    updateRelation: (id: string, data: CreateOrUpdateEntityRelationDto) => Promise<EntityRelation>
    deleteRelation: (id: string) => Promise<void>
    validateSchema: () => Promise<SchemaValidationResult>
}

/**
 * 🔥 创建API桥接实例（真实的HTTP调用）
 */
export function createEntityModelingApiBridge(): EntityModelingApiBridge {
    return {
        createEntity: async (data: CreateOrUpdateEntityDefinitionDto) => {
            const response = await createEntity(data)
            return response
        },
        deleteEntity: async (id: string) => {
            await deleteEntity(id)
        },
        updateEntity: async (id: string, data: CreateOrUpdateEntityDefinitionDto) => {
            const response = await updateEntity(id, data)
            return response
        },
        getAllEntities: async () => {
            const response = await getAllEntities()
            return response
        },
        getAllRelations: async () => {
            const response = await getAllRelations()
            return response
        },
        getEntityById: async (id: string) => {
            const response = await getEntityById(id)
            return response
        },
        getEntityByName: async (name: string) => {
            const response = await getEntityByName(name)
            return response
        },
        addField: async (data: CreateOrUpdateEntityFieldDto) => {
            const response = await addField(data)
            return response
        },
        updateField: async (id: string, data: CreateOrUpdateEntityFieldDto) => {
            const response = await updateField(id, data)
            return response
        },
        deleteField: async (id: string) => {
            await deleteField(id)
        },
        createRelation: async (data: CreateOrUpdateEntityRelationDto) => {
            const response = await createRelation(data)
            return response
        },
        updateRelation: async (id: string, data: CreateOrUpdateEntityRelationDto) => {
            const response = await updateRelation(id, data)
            return response
        },
        deleteRelation: async (id: string) => {
            await deleteRelation(id)
        },
        validateSchema: async () => {
            const response = await validateSchema()
            return response
        }
    }
}


