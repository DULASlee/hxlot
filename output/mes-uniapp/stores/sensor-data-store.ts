// stores/sensor-data-store.ts
/**
 * 传感器数据 Pinia Store
 * @author SmartAbp DevKit Low-Code Engine
 * @since 2025-10-22
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { sensorDataApi } from '@/api/sensor-data-api'
import type { 
  SensorDataDto, 
  CreateSensorDataDto, 
  UpdateSensorDataDto,
  GetSensorDataListInput,
  PagedResultDto
} from '@/types/sensor-data.types'

export const useSensorDataStore = defineStore('sensorData', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 状态
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const list = ref<SensorDataDto[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentEntity = ref<SensorDataDto | null>(null)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 操作
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 获取列表
   */
  async function getList(params?: GetSensorDataListInput) {
    loading.value = true
    try {
      const result = await sensorDataApi.getList(params || {})
      list.value = result.items
      total.value = result.totalCount
      return result
    } catch (error) {
      console.error('获取传感器数据列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据ID获取详情
   */
  async function getById(id: string) {
    loading.value = true
    try {
      const entity = await sensorDataApi.get(id)
      currentEntity.value = entity
      return entity
    } catch (error) {
      console.error('获取传感器数据详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建
   */
  async function create(data: CreateSensorDataDto) {
    loading.value = true
    try {
      const entity = await sensorDataApi.create(data)
      // 添加到列表
      list.value.unshift(entity)
      total.value++
      return entity
    } catch (error) {
      console.error('创建传感器数据失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新
   */
  async function update(id: string, data: UpdateSensorDataDto) {
    loading.value = true
    try {
      const entity = await sensorDataApi.update(id, data)
      // 更新列表中的数据
      const index = list.value.findIndex(item => item.id === id)
      if (index !== -1) {
        list.value[index] = entity
      }
      // 更新当前实体
      if (currentEntity.value?.id === id) {
        currentEntity.value = entity
      }
      return entity
    } catch (error) {
      console.error('更新传感器数据失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除
   */
  async function deleteEntity(id: string) {
    loading.value = true
    try {
      await sensorDataApi.delete(id)
      // 从列表中移除
      const index = list.value.findIndex(item => item.id === id)
      if (index !== -1) {
        list.value.splice(index, 1)
        total.value--
      }
      // 清除当前实体
      if (currentEntity.value?.id === id) {
        currentEntity.value = null
      }
    } catch (error) {
      console.error('删除传感器数据失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 清空状态
   */
  function reset() {
    list.value = []
    total.value = 0
    loading.value = false
    currentEntity.value = null
  }

  return {
    // 状态
    list,
    total,
    loading,
    currentEntity,
    // 操作
    getList,
    getById,
    create,
    update,
    delete: deleteEntity,
    reset
  }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 导出类型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type SensorDataStoreType = ReturnType<typeof useSensorDataStore>
