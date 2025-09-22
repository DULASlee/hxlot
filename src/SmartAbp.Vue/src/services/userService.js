/*
AI_GENERATED_COMPONENT: true
Generated at: 2025-09-12T23:25:00.000Z
Template parameters: {"EntityName":"User","entityName":"user","ModuleName":"User","entityDisplayName":"用户管理"}
Based on SmartAbp template library
DO NOT EDIT MANUALLY - Regenerate using module wizard
*/
import { api } from "@/utils/api";
/**
 * 用户服务
 * 基于ABP框架的RESTful API
 */
class UserService {
    constructor() {
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "/api/identity/users"
        });
    }
    /**
     * 获取用户列表
     */
    async getList(params) {
        const response = await api.get(this.baseUrl, {
            params: {
                filter: params.filter,
                sorting: params.sorting,
                skipCount: (params.pageIndex - 1) * params.pageSize,
                maxResultCount: params.pageSize,
                isActive: params.isActive,
            },
        });
        return response;
    }
    /**
     * 根据ID获取用户
     */
    async get(id) {
        const response = await api.get(`${this.baseUrl}/${id}`);
        return response;
    }
    /**
     * 创建用户
     */
    async create(input) {
        const response = await api.post(this.baseUrl, input);
        return response;
    }
    /**
     * 更新用户
     */
    async update(id, input) {
        const response = await api.put(`${this.baseUrl}/${id}`, input);
        return response;
    }
    /**
     * 删除用户
     */
    async delete(id) {
        await api.delete(`${this.baseUrl}/${id}`);
    }
    /**
     * 批量删除用户
     */
    async batchDelete(ids) {
        await api.post(`${this.baseUrl}/batch-delete`, { ids });
    }
    /**
     * 重置密码
     */
    async resetPassword(id, newPassword) {
        await api.post(`${this.baseUrl}/${id}/reset-password`, {
            newPassword,
        });
    }
    /**
     * 锁定用户
     */
    async lock(id) {
        await api.post(`${this.baseUrl}/${id}/lock`);
    }
    /**
     * 解锁用户
     */
    async unlock(id) {
        await api.post(`${this.baseUrl}/${id}/unlock`);
    }
    /**
     * 获取用户统计信息
     */
    async getStatistics() {
        const response = await api.get(`${this.baseUrl}/statistics`);
        return response;
    }
    /**
     * 检查用户名是否可用
     */
    async checkUserNameAvailability(userName, excludeId) {
        const response = await api.get(`${this.baseUrl}/check-username`, {
            params: { userName, excludeId },
        });
        return response.isAvailable;
    }
    /**
     * 检查邮箱是否可用
     */
    async checkEmailAvailability(email, excludeId) {
        const response = await api.get(`${this.baseUrl}/check-email`, {
            params: { email, excludeId },
        });
        return response.isAvailable;
    }
    /**
     * 导出用户数据
     */
    async exportToExcel(params) {
        const response = await api.get(`${this.baseUrl}/export`, {
            params,
            responseType: "blob",
        });
        return response;
    }
    /**
     * 导入用户数据
     */
    async importFromExcel(file) {
        const formData = new FormData();
        formData.append("file", file);
        await api.post(`${this.baseUrl}/import`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }
}
// 导出单例实例
export const userService = new UserService();
export default userService;
