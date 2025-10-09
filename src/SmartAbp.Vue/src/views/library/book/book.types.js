/**
 * ⚠️ 【架构铁律违规修复】
 *
 * 本文件违反了架构铁律一：统一类型系统
 * 已将所有类型迁移至：@smartabp/lowcode-shared/types/business
 *
 * 修复日期：2025-10-08
 * 修复原因：主应用不应定义底层可复用类型
 *
 * ✅ 正确用法：
 * import type {
 *   BookDto, CreateBookDto, UpdateBookDto,
 *   BookPagedRequestDto, BookPagedResultDto
 * } from '@smartabp/lowcode-shared'
 */
export {};
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💀 原违规代码（已迁移，保留以备参考）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/*
** 已移至 @smartabp/lowcode-shared/types/business **

export interface BookDto {
  id: string
  title: string
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

export interface CreateBookDto {
  title: string
  isbn: string
  author: string
  publisher?: string
  publishDate?: string
  price: number
  stock: number
  description?: string
}

export interface UpdateBookDto extends Partial<CreateBookDto> {}

export interface BookPagedRequestDto {
  skipCount?: number
  maxResultCount?: number
  sorting?: string
  title?: string
  author?: string
  isbn?: string
}

export interface BookPagedResultDto {
  totalCount: number
  items: BookDto[]
}
*/
