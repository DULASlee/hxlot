/**
 * AI_TEMPLATE_INFO:
 * 模板类型: Pinia状态管理Store
 * 适用场景: 实体数据的状态管理，包含CRUD操作
 * 依赖项: Pinia, API服务
 * 功能特性: 缓存策略、错误处理、加载状态管理
 * 生成规则:
 *   - EntityName: 实体名称（PascalCase）
 *   - entityName: 实体名称（camelCase）
 *   - ModuleName: 模块名称
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  {{EntityName}}Dto, 
  Create{{EntityName}}Dto, 
  Update{{EntityName}}Dto,
  Get{{EntityName}}ListDto,
  PagedResultDto 
} from '@/types/{{entityName}}'
import { {{entityName}}Service } from '@/services/{{entityName}}Service'
import { ElMessage } from 'element-plus'

export const use{{EntityName}}Store = defineStore('{{entityName}}', () => {
  // 状态定义
  const items = ref<{{EntityName}}Dto[]>([])
  const currentItem = ref<{{EntityName}}Dto | null>(null)
  const loading = ref(false)
  const submitting = ref(false)
  const total = ref(0)
  
  // 缓存相关
  const cache = ref(new Map<string, { data: any; timestamp: number }>())
  const CACHE_TTL = 5 * 60 * 1000 // 5分钟缓存

  // 计算属性
  const isLoading = computed(() => loading.value)
  const isSubmitting = computed(() => submitting.value)
  const hasItems = computed(() => items.value.length > 0)
  const enabledItems = computed(() => items.value.filter(item => item.isEnabled))

  // 获取列表数据
  const fetchList = async (params?: Get{{EntityName}}ListDto): Promise<PagedResultDto<{{EntityName}}Dto>> => {
    try {
      loading.value = true
      
      const result = await {{entityName}}Service.getList(params)
      
      // 更新状态
      items.value = result.items
      total.value = result.totalCount
      
      return result
    } catch (error) {
      console.error('获取{{EntityName}}列表失败:', error)
      ElMessage.error('获取数据失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 创建新实体
  const create = async (data: Create{{EntityName}}Dto): Promise<{{EntityName}}Dto> => {
    try {
      submitting.value = true
      
      const result = await {{entityName}}Service.create(data)
      
      // 更新本地状态
      items.value.unshift(result)
      total.value += 1
      
      return result
    } catch (error) {
      console.error('创建{{EntityName}}失败:', error)
      ElMessage.error('创建失败')
      throw error
    } finally {
      submitting.value = false
    }
  }

  // 更新实体
  const update = async (id: string, data: Update{{EntityName}}Dto): Promise<{{EntityName}}Dto> => {
    try {
      submitting.value = true
      
      const result = await {{entityName}}Service.update(id, data)
      
      // 更新本地状态
      const index = items.value.findIndex(item => item.id === id)
      if (index !== -1) {
        items.value[index] = result
      }
      
      return result
    } catch (error) {
      console.error('更新{{EntityName}}失败:', error)
      ElMessage.error('更新失败')
      throw error
    } finally {
      submitting.value = false
    }
  }

  // 删除实体
  const remove = async (id: string): Promise<void> => {
    try {
      submitting.value = true
      
      await {{entityName}}Service.delete(id)
      
      // 更新本地状态
      const index = items.value.findIndex(item => item.id === id)
      if (index !== -1) {
        items.value.splice(index, 1)
        total.value -= 1
      }
      
    } catch (error) {
      console.error('删除{{EntityName}}失败:', error)
      ElMessage.error('删除失败')
      throw error
    } finally {
      submitting.value = false
    }
  }

  // 批量删除
  const deleteMany = async (ids: string[]): Promise<void> => {
    try {
      submitting.value = true
      
      await {{entityName}}Service.deleteMany(ids)
      
      // 更新本地状态
      items.value = items.value.filter(item => !ids.includes(item.id))
      total.value -= ids.length
      
    } catch (error) {
      console.error('批量删除{{EntityName}}失败:', error)
      ElMessage.error('批量删除失败')
      throw error
    } finally {
      submitting.value = false
    }
  }

  // 导出方法和状态
  return {
    // 状态
    items,
    currentItem,
    loading,
    submitting,
    total,
    
    // 计算属性
    isLoading,
    isSubmitting,
    hasItems,
    enabledItems,
    
    // 方法
    fetchList,
    create,
    update,
    delete: remove,
    deleteMany
  }
})

// 类型导出
export type {{EntityName}}Store = ReturnType<typeof use{{EntityName}}Store>