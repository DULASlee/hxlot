/**
 * 📦 SmartAbp 通用DTO类型定义
 * 
 * 遵循ABP Framework标准DTO结构
 * 供所有packages共享使用
 * 
 * @module @smartabp/lowcode-shared/types/dtos
 */

/**
 * 实体DTO基类
 */
export interface EntityDto<TKey = string> {
    id: TKey
}

/**
 * 审计实体DTO基类
 * 包含创建、修改时间和用户信息
 */
export interface AuditedEntityDto<TKey = string> extends EntityDto<TKey> {
    creationTime: string
    creatorId?: string
    lastModificationTime?: string
    lastModifierId?: string
}

/**
 * 完整审计实体DTO（含删除审计）
 */
export interface FullAuditedEntityDto<TKey = string> extends AuditedEntityDto<TKey> {
    isDeleted: boolean
    deletionTime?: string
    deleterId?: string
}

/**
 * 分页结果DTO
 */
export interface PagedResultDto<T> {
    items: T[]
    totalCount: number
}

/**
 * 列表结果DTO
 */
export interface ListResultDto<T> {
    items: T[]
}

/**
 * 分页请求输入DTO
 */
export interface PagedAndSortedResultRequestDto {
    skipCount?: number
    maxResultCount?: number
    sorting?: string
}

/**
 * 通用查询输入DTO
 */
export interface GetListInput extends PagedAndSortedResultRequestDto {
    filter?: string
    searchKeyword?: string
}

