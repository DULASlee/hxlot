/**
 * AI_GENERATED_COMPONENT: true
 * Generated at: 2025-09-19T02:08:16.758Z
 * Template parameters: {"EntityName":"User","entityName":"user","ModuleName":"User","entityDisplayName":"用户管理","kebab-case-name":"user"}
 * Based on SmartAbp template library
 * DO NOT EDIT MANUALLY - Regenerate using module wizard
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
import { ref, type Ref } from 'vue'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 用户DTO接口
 */
export interface UserDto {
  id: string
  name: string
  [key: string]: any
}

/**
 * 创建用户DTO接口
 */
export interface CreateUserDto {
  name: string
  [key: string]: any
}

/**
 * 更新用户DTO接口
 */
export interface UpdateUserDto {
  name?: string
  [key: string]: any
}

/**
 * 列表查询参数接口
 */
export interface ListQueryParams {
  skipCount?: number
  maxResultCount?: number
  sorting?: string
  filter?: string
  [key: string]: any
}

/**
 * 列表响应接口
 */
export interface ListResponse<T> {
  items: T[]
  totalCount: number
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 模拟API服务
// TODO: 替换为真实的API服务
// import { UserService } from "@/api/User/user"
// import type { UserDto, CreateUserDto, UpdateUserDto } from "@/api/User/types"
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const UserService = {
  getList: async (params?: ListQueryParams): Promise<ListResponse<UserDto>> => {
    console.log('Fetching list with params:', params)
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      items: [
        { id: '1', name: 'Mock User 1' },
        { id: '2', name: 'Mock User 2' }
      ],
      totalCount: 2
    }
  },
  
  create: async (data: CreateUserDto): Promise<UserDto> => {
    console.log('Creating User:', data)
    await new Promise(resolve => setTimeout(resolve, 500))
    return { id: '3', ...data }
  },
  
  update: async (id: string, data: UpdateUserDto): Promise<UserDto> => {
    console.log(`Updating User ${id}:`, data)
    await new Promise(resolve => setTimeout(resolve, 500))
    return { id, name: data.name || 'Updated User', ...data }
  },
  
  delete: async (id: string): Promise<void> => {
    console.log(`Deleting User ${id}`)
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

/**
 * 用户Store
 * 负责管理用户实体的CRUD操作和状态
 */
export const useUserStore = defineStore('user', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 状态定义
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const list: Ref<UserDto[]> = ref([])
  const total: Ref<number> = ref(0)
  const loading: Ref<boolean> = ref(false)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Actions
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 获取用户列表
   */
  const fetchList = async (params?: ListQueryParams): Promise<void> => {
    loading.value = true
    try {
      const response = await UserService.getList(params)
      list.value = response.items
      total.value = response.totalCount
    } catch (error) {
      console.error('Failed to fetch user list:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建用户
   */
  const createItem = async (data: CreateUserDto): Promise<UserDto> => {
    try {
      const result = await UserService.create(data)
      return result
    } catch (error) {
      console.error('Failed to create User:', error)
      throw error
    }
  }

  /**
   * 更新用户
   */
  const updateItem = async (id: string, data: UpdateUserDto): Promise<UserDto> => {
    try {
      const result = await UserService.update(id, data)
      return result
    } catch (error) {
      console.error(`Failed to update User ${id}:`, error)
      throw error
    }
  }

  /**
   * 删除用户
   */
  const deleteItem = async (id: string): Promise<void> => {
    try {
      await UserService.delete(id)
    } catch (error) {
      console.error(`Failed to delete User ${id}:`, error)
      throw error
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 返回Store接口
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  return {
    // 状态
    list,
    total,
    loading,
    
    // 方法
    fetchList,
    createItem,
    updateItem,
    deleteItem
  }
})