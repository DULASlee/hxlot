/**
 * Book 类型定义
 * 由元数据自动生成，请勿手动修改
 * @generated
 */



/**
 * Book DTO
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
export interface UpdateBookDto extends Partial<CreateBookDto> {}

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
