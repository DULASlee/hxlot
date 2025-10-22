// api/production-line-api.ts
/**
 * 生产线 API客户端
 * @author SmartAbp DevKit Low-Code Engine
 * @since 2025-10-22
 */

import { request } from '@/utils/request'
import type { 
  ProductionLineDto, 
  CreateProductionLineDto, 
  UpdateProductionLineDto,
  GetProductionLineListInput,
  PagedResultDto
} from '@/types/production-line.types'

const API_BASE = '/api/app/production-line'

export const productionLineApi = {
  // 获取列表
  getList(params: GetProductionLineListInput) {
    return request<PagedResultDto<ProductionLineDto>>(`${API_BASE}`, {
      method: 'GET',
      params
    })
  },

  // 获取详情
  get(id: string) {
    return request<ProductionLineDto>(`${API_BASE}/${id}`, {
      method: 'GET'
    })
  },

  // 创建
  create(data: CreateProductionLineDto) {
    return request<ProductionLineDto>(`${API_BASE}`, {
      method: 'POST',
      data
    })
  },

  // 更新
  update(id: string, data: UpdateProductionLineDto) {
    return request<ProductionLineDto>(`${API_BASE}/${id}`, {
      method: 'PUT',
      data
    })
  },

  // 删除
  delete(id: string) {
    return request<void>(`${API_BASE}/${id}`, {
      method: 'DELETE'
    })
  }
}
