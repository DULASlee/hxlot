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

// 这是一个示意性的API服务，实际生成时需要替换为真实的服务
// import { UserService } from "@/api/User/user"
// import type { UserDto, CreateUserDto, UpdateUserDto } from "@/api/User/types"

// 模拟 API 服务和类型
const UserService = {
  getList: async (params: any) => {
    console.log("Fetching list with params:", params)
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      items: [{ id: "1", name: `Mock User 1` }, { id: "2", name: `Mock User 2` }],
      totalCount: 2,
    }
  },
  create: async (data: any) => {
    console.log("Creating User:", data)
    await new Promise(resolve => setTimeout(resolve, 500))
    return { id: "3", ...data }
  },
  update: async (id: string, data: any) => {
    console.log(`Updating User ${id}:`, data)
    await new Promise(resolve => setTimeout(resolve, 500))
    return { id, ...data }
  },
  delete: async (id: string) => {
    console.log(`Deleting User ${id}`)
    await new Promise(resolve => setTimeout(resolve, 500))
  },
}
type UserDto = { id: string; name: string; [key: string]: any }
type CreateUserDto = Omit<UserDto, "id">
type UpdateUserDto = Partial<CreateUserDto>


export const useUserStore = defineStore("user", () => {
  // State
  const list = ref<UserDto[]>([])
  const total = ref(0)
  const loading = ref(false)

  // Actions
  const fetchList = async (params: any) => {
    loading.value = true
    try {
      const response = await UserService.getList(params)
      list.value = response.items
      total.value = response.totalCount
    } catch (error) {
      console.error("Failed to fetch {{UserPlural}} list:", error)
    } finally {
      loading.value = false
    }
  }

  const createItem = async (data: CreateUserDto) => {
    try {
      await UserService.create(data)
    } catch (error) {
      console.error("Failed to create User:", error)
    }
  }

  const updateItem = async (id: string, data: UpdateUserDto) => {
    try {
      await UserService.update(id, data)
    } catch (error) {
      console.error(`Failed to update User ${id}:`, error)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      await UserService.delete(id)
    } catch (error) {
      console.error(`Failed to delete User ${id}:`, error)
    }
  }

  return {
    list,
    total,
    loading,
    fetchList,
    createItem,
    updateItem,
    deleteItem,
  }
})