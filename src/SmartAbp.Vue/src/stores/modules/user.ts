/*
AI_GENERATED_COMPONENT: true
Generated at: 2025-09-19T02:08:16.758Z
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

import { defineStore } from "pinia"
import { ref } from "vue"
import { userService } from "@/services/userService"
import type { CreateUserDto, UpdateUserDto, UserQueryParams, UserListItem } from "@/types/user"


export const useUserStore = defineStore("user", () => {
  // State
  const list = ref<UserListItem[]>([])
  const total = ref(0)
  const loading = ref(false)

  // Actions
  const fetchList = async (params: UserQueryParams) => {
    loading.value = true
    try {
      const response = await userService.getList(params)
      list.value = response.items
      total.value = response.totalCount
      return response
    } catch (error) {
      console.error("Failed to fetch user list:", error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const create = async (data: CreateUserDto) => {
    try {
      const response = await userService.create(data)
      await fetchList({ pageIndex: 1, pageSize: 10 }) // Refresh list
      return response
    } catch (error) {
      console.error("Failed to create User:", error)
      throw error
    }
  }

  const update = async (id: string, data: UpdateUserDto) => {
    try {
      const response = await userService.update(id, data)
      await fetchList({ pageIndex: 1, pageSize: 10 }) // Refresh list
      return response
    } catch (error) {
      console.error(`Failed to update User ${id}:`, error)
      throw error
    }
  }

  const deleteItem = async (id: string) => {
    try {
      await userService.delete(id)
      await fetchList({ pageIndex: 1, pageSize: 10 }) // Refresh list
    } catch (error) {
      console.error(`Failed to delete User ${id}:`, error)
      throw error
    }
  }

  const deleteMany = async (ids: string[]) => {
    try {
      await userService.batchDelete(ids)
      await fetchList({ pageIndex: 1, pageSize: 10 }) // Refresh list
    } catch (error) {
      console.error(`Failed to delete multiple users:`, error)
      throw error
    }
  }


  return {
    list,
    total,
    loading,
    fetchList,
    create,
    update,
    delete: deleteItem,
    deleteMany,
    createItem: create,  // 别名支持
    updateItem: update,  // 别名支持
    deleteItem,          // 别名支持
  }
})
