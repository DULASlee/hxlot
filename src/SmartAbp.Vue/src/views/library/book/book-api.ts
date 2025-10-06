/**
 * Book API
 * 由元数据自动生成，请勿手动修改
 * @generated
 */

import http from '@/utils/http'
import type {
  BookDto,
  CreateBookDto,
  UpdateBookDto,
  BookPagedRequestDto,
  BookPagedResultDto
} from './book.types'

const BASE_URL = '/api/library/book'

/**
 * 获取Book列表
 */
export function getBookList(params?: BookPagedRequestDto) {
  return http.get<BookPagedResultDto>(BASE_URL, { params })
}

/**
 * 获取Book详情
 */
export function getBookById(id: string) {
  return http.get<BookDto>(`${BASE_URL}/${id}`)
}

/**
 * 创建Book
 */
export function createBook(data: CreateBookDto) {
  return http.post<BookDto>(BASE_URL, data)
}

/**
 * 更新Book
 */
export function updateBook(id: string, data: UpdateBookDto) {
  return http.put<BookDto>(`${BASE_URL}/${id}`, data)
}

/**
 * 删除Book
 */
export function deleteBook(id: string) {
  return http.delete(`${BASE_URL}/${id}`)
}

/**
 * 批量删除Book
 */
export function deleteBookBatch(ids: string[]) {
  return http.delete(BASE_URL, { data: { ids } })
}
