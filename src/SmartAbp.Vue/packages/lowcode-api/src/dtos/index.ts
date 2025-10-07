/**
 * 📋 低代码系统DTO类型定义
 * 
 * 所有API相关的数据传输对象
 * 
 * @module @smartabp/lowcode-api/dtos
 */

/**
 * 用户配置DTO
 */
export interface UserProfileDto {
    id: string
    userName: string
    email: string
    lastUsedMode?: 'simple' | 'industry' | 'pro'
    preferences?: Record<string, any>
}

/**
 * 更新用户配置输入DTO
 */
export interface UpdateUserProfileInput {
    lastUsedMode?: 'simple' | 'industry' | 'pro'
    preferences?: Record<string, any>
}

/**
 * 代码生成历史DTO
 */
export interface GenerationHistoryDto {
    id: string
    projectName: string
    generationType: string
    timestamp: string
    status: 'success' | 'failed' | 'pending'
    metadata?: Record<string, any>
}

/**
 * DDD领域定义DTO
 */
export interface DddDefinitionDto {
    aggregates: AggregateDefinitionDto[]
    valueObjects: ValueObjectDefinitionDto[]
    domainEvents: DomainEventDefinitionDto[]
    domainServices?: DomainServiceDefinitionDto[]
}

/**
 * 聚合根定义DTO
 */
export interface AggregateDefinitionDto {
    name: string
    displayName?: string
    description?: string
    properties: PropertyDefinitionDto[]
    methods?: MethodDefinitionDto[]
}

/**
 * 值对象定义DTO
 */
export interface ValueObjectDefinitionDto {
    name: string
    displayName?: string
    description?: string
    properties: PropertyDefinitionDto[]
}

/**
 * 领域事件定义DTO
 */
export interface DomainEventDefinitionDto {
    name: string
    displayName?: string
    description?: string
    properties: PropertyDefinitionDto[]
}

/**
 * 领域服务定义DTO
 */
export interface DomainServiceDefinitionDto {
    name: string
    displayName?: string
    description?: string
    methods: MethodDefinitionDto[]
}

/**
 * 属性定义DTO
 */
export interface PropertyDefinitionDto {
    name: string
    type: string
    displayName?: string
    description?: string
    isRequired?: boolean
    defaultValue?: any
}

/**
 * 方法定义DTO
 */
export interface MethodDefinitionDto {
    name: string
    displayName?: string
    description?: string
    parameters: PropertyDefinitionDto[]
    returnType: string
}

/**
 * DDD代码生成输入DTO
 */
export interface GenerateDddDomainInput {
    namespace: string
    outputPath?: string
    definition: DddDefinitionDto
}

/**
 * 代码生成结果DTO
 */
export interface GenerationResultDto {
    success: boolean
    message?: string
    files?: GeneratedFileDto[]
    errors?: string[]
}

/**
 * 生成的文件DTO
 */
export interface GeneratedFileDto {
    path: string
    content: string
    language: 'csharp' | 'typescript' | 'vue' | 'other'
}

