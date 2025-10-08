/**
 * 业务相关类型定义
 * 符合架构铁律一：统一类型系统
 * 
 * @package @smartabp/lowcode-shared
 * @author SmartAbp Team  
 * @version 1.0.0
 */

/**
 * Book 相关类型定义
 * 从主应用迁移至统一类型系统
 */
export interface BookDto {
    id: string
    /** 图书标题 */
    title: string
    /** 国际标准书号 */
    isbn: string
    author: string
    publisher?: string
    publishDate?: string
    price: number
    stock: number
    description?: string
    isDeleted?: boolean
    creationTime?: string
    creatorId?: string
}

/**
 * 创建/更新 Book DTO
 */
export interface CreateBookDto {
    /** 图书标题 */
    title: string
    /** 国际标准书号 */
    isbn: string
    author: string
    publisher?: string
    publishDate?: string
    price: number
    stock: number
    description?: string
}

/**
 * 更新 Book DTO
 */
export interface UpdateBookDto extends Partial<CreateBookDto> { }

/**
 * Book 分页查询DTO
 */
export interface BookPagedRequestDto {
    skipCount?: number
    maxResultCount?: number
    sorting?: string
    title?: string
    author?: string
    isbn?: string
}

/**
 * Book 分页结果DTO
 */
export interface BookPagedResultDto {
    totalCount: number
    items: BookDto[]
}

/**
 * 通用业务实体DTO基接口
 */
export interface BaseEntityDto {
    id: string
    isDeleted?: boolean
    creationTime?: string
    creatorId?: string
    lastModificationTime?: string
    lastModifierId?: string
}

/**
 * 通用分页请求DTO
 */
export interface BasePagedRequestDto {
    skipCount?: number
    maxResultCount?: number
    sorting?: string
}

/**
 * 通用分页结果DTO
 */
export interface BasePagedResultDto<T> {
    totalCount: number
    items: T[]
}
