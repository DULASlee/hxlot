/**
 * 🔥 实体建模API
 * 对应后端: EntityModelingController
 * 对应Store: entityModeling.ts
 * 功能: 打通前后端通信，替代localStorage伪实现
 */
import { createHttpClient } from '@smartabp/lowcode-api';
// 🔥 使用lowcode-api的HTTP客户端（packages黑盒原则）
const httpClient = createHttpClient({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:44375'
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 实体定义管理
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * 获取所有实体定义
 */
export function getAllEntities() {
    return httpClient.get('/api/lowcode/entity-modeling/entities');
}
/**
 * 根据ID获取实体定义
 */
export function getEntityById(id) {
    return httpClient.get(`/api/lowcode/entity-modeling/entities/${id}`);
}
/**
 * 根据名称获取实体定义
 */
export function getEntityByName(name) {
    return httpClient.get(`/api/lowcode/entity-modeling/entities/by-name/${encodeURIComponent(name)}`);
}
/**
 * 创建实体定义
 */
export function createEntity(data) {
    return httpClient.post('/api/lowcode/entity-modeling/entities', data);
}
/**
 * 更新实体定义
 */
export function updateEntity(id, data) {
    return httpClient.put(`/api/lowcode/entity-modeling/entities/${id}`, data);
}
/**
 * 删除实体定义
 */
export function deleteEntity(id) {
    return httpClient.delete(`/api/lowcode/entity-modeling/entities/${id}`);
}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 字段管理
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * 添加字段
 */
export function addField(data) {
    return httpClient.post('/api/lowcode/entity-modeling/fields', data);
}
/**
 * 更新字段
 */
export function updateField(id, data) {
    return httpClient.put(`/api/lowcode/entity-modeling/fields/${id}`, data);
}
/**
 * 删除字段
 */
export function deleteField(id) {
    return httpClient.delete(`/api/lowcode/entity-modeling/fields/${id}`);
}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 关系管理
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * 获取所有关系
 */
export function getAllRelations() {
    return httpClient.get('/api/lowcode/entity-modeling/relations');
}
/**
 * 创建关系
 */
export function createRelation(data) {
    return httpClient.post('/api/lowcode/entity-modeling/relations', data);
}
/**
 * 更新关系
 */
export function updateRelation(id, data) {
    return httpClient.put(`/api/lowcode/entity-modeling/relations/${id}`, data);
}
/**
 * 删除关系
 */
export function deleteRelation(id) {
    return httpClient.delete(`/api/lowcode/entity-modeling/relations/${id}`);
}
/**
 * 验证实体架构
 */
export function validateSchema() {
    return httpClient.post('/api/lowcode/entity-modeling/validate-schema');
}
