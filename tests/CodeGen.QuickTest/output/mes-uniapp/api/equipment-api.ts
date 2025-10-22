// api/equipment-api.ts
/**
 * 设备 API客户端
 * @author SmartAbp DevKit Low-Code Engine
 * @since 2025-10-22
 */

import { request } from '@/utils/request'
import type { 
  EquipmentDto, 
  CreateEquipmentDto, 
  UpdateEquipmentDto,
  GetEquipmentListInput,
  PagedResultDto
} from '@/types/equipment.types'

const API_BASE = '/api/app/equipment'

export const equipmentApi = {
  // 获取列表
  getList(params: GetEquipmentListInput) {
    return request<PagedResultDto<EquipmentDto>>(`${API_BASE}`, {
      method: 'GET',
      params
    })
  },

  // 获取详情
  get(id: string) {
    return request<EquipmentDto>(`${API_BASE}/${id}`, {
      method: 'GET'
    })
  },

  // 创建
  create(data: CreateEquipmentDto) {
    return request<EquipmentDto>(`${API_BASE}`, {
      method: 'POST',
      data
    })
  },

  // 更新
  update(id: string, data: UpdateEquipmentDto) {
    return request<EquipmentDto>(`${API_BASE}/${id}`, {
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
