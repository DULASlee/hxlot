// api/sensor-data-api.ts
/**
 * 传感器数据 API客户端
 * @author SmartAbp DevKit Low-Code Engine
 * @since 2025-10-22
 */

import { request } from '@/utils/request'
import type { 
  SensorDataDto, 
  CreateSensorDataDto, 
  UpdateSensorDataDto,
  GetSensorDataListInput,
  PagedResultDto
} from '@/types/sensor-data.types'

const API_BASE = '/api/app/sensor-data'

export const sensorDataApi = {
  // 获取列表
  getList(params: GetSensorDataListInput) {
    return request<PagedResultDto<SensorDataDto>>(`${API_BASE}`, {
      method: 'GET',
      params
    })
  },

  // 获取详情
  get(id: string) {
    return request<SensorDataDto>(`${API_BASE}/${id}`, {
      method: 'GET'
    })
  },

  // 创建
  create(data: CreateSensorDataDto) {
    return request<SensorDataDto>(`${API_BASE}`, {
      method: 'POST',
      data
    })
  },

  // 更新
  update(id: string, data: UpdateSensorDataDto) {
    return request<SensorDataDto>(`${API_BASE}/${id}`, {
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
