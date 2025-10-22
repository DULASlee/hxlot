// stores/equipment-store.ts
/**
 * 设备 Pinia Store
 * @author SmartAbp DevKit Low-Code Engine
 * @since 2025-10-22
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { equipmentApi } from '@/api/equipment-api'
import type { 
  EquipmentDto, 
  CreateEquipmentDto, 
  UpdateEquipmentDto,
  GetEquipmentListInput,
  PagedResultDto
} from '@/types/equipment.types'

export const useEquipmentStore = defineStore('equipment', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 状态
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const list = ref<EquipmentDto[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentEntity = ref<EquipmentDto | null>(null)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 操作
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 获取列表
   */
  async function getList(params?: GetEquipmentListInput) {
    loading.value = true
    try {
      const result = await equipmentApi.getList(params || {})
      list.value = result.items
      total.value = result.totalCount
      return result
    } catch (error) {
      console.error('获取设备列表失败:', error)
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
      const entity = await equipmentApi.get(id)
      currentEntity.value = entity
      return entity
    } catch (error) {
      console.error('获取设备详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建
   */
  async function create(data: CreateEquipmentDto) {
    loading.value = true
    try {
      const entity = await equipmentApi.create(data)
      // 添加到列表
      list.value.unshift(entity)
      total.value++
      return entity
    } catch (error) {
      console.error('创建设备失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新
   */
  async function update(id: string, data: UpdateEquipmentDto) {
    loading.value = true
    try {
      const entity = await equipmentApi.update(id, data)
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
      console.error('更新设备失败:', error)
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
      await equipmentApi.delete(id)
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
      console.error('删除设备失败:', error)
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

export type EquipmentStoreType = ReturnType<typeof useEquipmentStore>
