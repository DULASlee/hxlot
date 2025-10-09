/**
 * Book API
 * 由元数据自动生成，请勿手动修改
 * @generated
 */
import http from '@/utils/http';
const BASE_URL = '/api/library/book';
/**
 * 获取Book列表
 */
export function getBookList(params) {
    return http.get(BASE_URL, { params });
}
/**
 * 获取Book详情
 */
export function getBookById(id) {
    return http.get(`${BASE_URL}/${id}`);
}
/**
 * 创建Book
 */
export function createBook(data) {
    return http.post(BASE_URL, data);
}
/**
 * 更新Book
 */
export function updateBook(id, data) {
    return http.put(`${BASE_URL}/${id}`, data);
}
/**
 * 删除Book
 */
export function deleteBook(id) {
    return http.delete(`${BASE_URL}/${id}`);
}
/**
 * 批量删除Book
 */
export function deleteBookBatch(ids) {
    return http.delete(BASE_URL, { data: { ids } });
}
