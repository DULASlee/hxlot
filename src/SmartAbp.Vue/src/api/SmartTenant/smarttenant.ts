// 🔥 自动生成的API服务 - Vue3 + TypeScript + Axios
// 支持完整的CRUD操作和业务逻辑扩展

import type { CreateSmartTenantDto, GetSmartTenantListDto, UpdateSmartTenantDto } from '@/types/smarttenant/smarttenant'
import { api } from '@/utils/api'

const API_BASE = '/api/smarttenant/smarttenant'

export const smarttenantApi = {
  // 📋 获取列表
  getList: (params?: GetSmartTenantListDto) => api.get(`${API_BASE}`, { params }),

  // 🔍 获取详情
  getById: (id: string) => api.get(`${API_BASE}/${id}`),

  // ➕ 创建
  create: (data: CreateSmartTenantDto) => api.post(API_BASE, data),

  // ✏️ 更新
  update: (id: string, data: UpdateSmartTenantDto) => api.put(`${API_BASE}/${id}`, data),

  // 🗑️ 删除
  delete: (id: string) => api.delete(`${API_BASE}/${id}`),

  // 🔍 批量操作（企业级扩展点）
  batchDelete: (ids: string[]) => api.post(`${API_BASE}/batch-delete`, { ids }),
  export: (params?: any) => api.get(`${API_BASE}/export`, { params, responseType: 'blob' }),
  import: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`${API_BASE}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export default smarttenantApi
