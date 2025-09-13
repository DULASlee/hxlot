/*
AI_GENERATED_COMPONENT: true
Generated at: 2025-09-12T23:12:15.490Z
Template parameters: {"EntityName":"User","entityName":"user","ModuleName":"User","entityDisplayName":"用户管理","kebab-case-name":"user"}
Based on SmartAbp template library
DO NOT EDIT MANUALLY - Regenerate using module wizard
*/

/**
 * AI_TEMPLATE_INFO:
 * 模板类型: Pinia状态管理Store
 * 适用场景: 实体数据的状态管理，包含CRUD操作
 * 依赖项: Pinia, API服务
 * 功能特性: 缓存策略、错误处理、加载状态管理
 * 生成规则:
 *   - User: 实体名称（PascalCase）
 *   - user: 实体名称（camelCase）
 *   - User: 模块名称
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  GetUserListDto,
  PagedResultDto,
  UserListItem,
  UserQueryParams
} from '@/types/user'
import { userService } from '@/services/userService'

// 重新导出类型供其他模块使用
export type { User } from '@/types/user'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // 状态定义
  const items = ref<UserListItem[]>([])
  const currentItem = ref<User | null>(null)
  const loading = ref(false)
  const submitting = ref(false)
  const total = ref(0)

  // 缓存相关（暂时未使用，保留供将来扩展）
  // const cache = ref(new Map<string, { data: any; timestamp: number }>())
  // const CACHE_TTL = 5 * 60 * 1000 // 5分钟缓存

  // 计算属性
  const isLoading = computed(() => loading.value)
  const isSubmitting = computed(() => submitting.value)
  const hasItems = computed(() => items.value.length > 0)
  const enabledItems = computed(() => items.value.filter(item => item.isActive))

  // 获取列表数据
  const fetchList = async (params?: GetUserListDto): Promise<PagedResultDto<UserListItem>> => {
    try {
      loading.value = true

      const queryParams: UserQueryParams = params ? {
        pageIndex: Math.floor((params.skipCount || 0) / (params.maxResultCount || 20)) + 1,
        pageSize: params.maxResultCount || 20,
        filter: params.filter,
        sorting: params.sorting
      } : { pageIndex: 1, pageSize: 20 }
      
      const result = await userService.getList(queryParams)

      // 更新状态
      items.value = result.items
      total.value = result.totalCount

      return result
    } catch (error) {
      console.error('获取User列表失败:', error)
      ElMessage.error('获取数据失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 创建新实体
  const create = async (data: CreateUserDto): Promise<User> => {
    try {
      submitting.value = true

      const result = await userService.create(data)

      // 更新本地状态 (转换为UserListItem格式)
      items.value.unshift(result as UserListItem)
      total.value += 1

      return result
    } catch (error) {
      console.error('创建User失败:', error)
      ElMessage.error('创建失败')
      throw error
    } finally {
      submitting.value = false
    }
  }

  // 更新实体
  const update = async (id: string, data: UpdateUserDto): Promise<User> => {
    try {
      submitting.value = true

      const result = await userService.update(id, data)

      // 更新本地状态 (转换为UserListItem格式)
      const index = items.value.findIndex(item => item.id === id)
      if (index !== -1) {
        items.value[index] = result as UserListItem
      }

      return result
    } catch (error) {
      console.error('更新User失败:', error)
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

      await userService.delete(id)

      // 更新本地状态
      const index = items.value.findIndex(item => item.id === id)
      if (index !== -1) {
        items.value.splice(index, 1)
        total.value -= 1
      }

    } catch (error) {
      console.error('删除User失败:', error)
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

      await userService.batchDelete(ids)

      // 更新本地状态
      items.value = items.value.filter(item => !ids.includes(item.id))
      total.value -= ids.length

    } catch (error) {
      console.error('批量删除User失败:', error)
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
export type UserStore = ReturnType<typeof useUserStore>
