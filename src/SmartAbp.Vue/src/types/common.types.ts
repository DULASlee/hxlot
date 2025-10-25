/**
 * ABP框架通用类型定义
 * 这些类型在ABP后端API中广泛使用
 */

// 基础分页请求DTO
export interface PagedAndSortedResultRequestDto {
    /** 当前页码（从1开始） */
    skipCount?: number
    /** 每页大小 */
    maxResultCount?: number
    /** 排序字段 */
    sorting?: string
}

// 基础分页响应DTO
export interface PagedResultDto<T> {
    /** 数据项 */
    items?: T[] | null
    /** 总数 */
    totalCount?: number
}

// 列表响应DTO
export interface ListResultDto<T> {
    /** 数据项 */
    items?: T[] | null
}

// ABP通用响应格式
export interface AbpResponse<T = any> {
    /** 响应数据 */
    result?: T
    /** 目标URL（如果有重定向） */
    targetUrl?: string | null
    /** 是否成功 */
    success?: boolean
    /** 错误信息 */
    error?: {
        code?: number
        message?: string
        details?: string
        validationErrors?: Array<{
            field?: string
            message?: string
        }>
    } | null
    /** 是否未修改（HTTP 304） */
    unAuthorizedRequest?: boolean
}

// 实体DTO基类
export interface EntityDto<T = string> {
    /** 实体ID */
    id: T
}

// 可审计实体DTO基类
export interface AuditedEntityDto<T = string> extends EntityDto<T> {
    /** 创建时间 */
    creationTime?: string
    /** 创建者ID */
    creatorId?: T | null
    /** 最后修改时间 */
    lastModificationTime?: string | null
    /** 最后修改者ID */
    lastModifierId?: T | null
}

// 软删除实体DTO基类
export interface SoftDeleteEntityDto<T = string> extends AuditedEntityDto<T> {
    /** 是否已删除 */
    isDeleted?: boolean
    /** 删除者ID */
    deleterId?: T | null
    /** 删除时间 */
    deletionTime?: string | null
}
