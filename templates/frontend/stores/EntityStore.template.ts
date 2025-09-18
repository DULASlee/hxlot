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

import { defineStore } from "pinia"
import { ref } from "vue"

// 这是一个示意性的API服务，实际生成时需要替换为真实的服务
// import { {{EntityName}}Service } from "@/api/{{ModuleName}}/{{entityName}}"
// import type { {{EntityName}}Dto, Create{{EntityName}}Dto, Update{{EntityName}}Dto } from "@/api/{{ModuleName}}/types"

// 模拟 API 服务和类型
const {{EntityName}}Service = {
  getList: async (params: any) => {
    console.log("Fetching list with params:", params)
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      items: [{ id: "1", name: `Mock {{EntityName}} 1` }, { id: "2", name: `Mock {{EntityName}} 2` }],
      totalCount: 2,
    }
  },
  create: async (data: any) => {
    console.log("Creating {{EntityName}}:", data)
    await new Promise(resolve => setTimeout(resolve, 500))
    return { id: "3", ...data }
  },
  update: async (id: string, data: any) => {
    console.log(`Updating {{EntityName}} ${id}:`, data)
    await new Promise(resolve => setTimeout(resolve, 500))
    return { id, ...data }
  },
  delete: async (id: string) => {
    console.log(`Deleting {{EntityName}} ${id}`)
    await new Promise(resolve => setTimeout(resolve, 500))
  },
}
type {{EntityName}}Dto = { id: string; name: string; [key: string]: any }
type Create{{EntityName}}Dto = Omit<{{EntityName}}Dto, "id">
type Update{{EntityName}}Dto = Partial<Create{{EntityName}}Dto>


export const use{{EntityName}}Store = defineStore("{{entityName}}", () => {
  // State
  const list = ref<{{EntityName}}Dto[]>([])
  const total = ref(0)
  const loading = ref(false)

  // Actions
  const fetchList = async (params: any) => {
    loading.value = true
    try {
      const response = await {{EntityName}}Service.getList(params)
      list.value = response.items
      total.value = response.totalCount
    } catch (error) {
      console.error("Failed to fetch {{EntityNamePlural}} list:", error)
    } finally {
      loading.value = false
    }
  }

  const createItem = async (data: Create{{EntityName}}Dto) => {
    try {
      await {{EntityName}}Service.create(data)
    } catch (error) {
      console.error("Failed to create {{EntityName}}:", error)
    }
  }

  const updateItem = async (id: string, data: Update{{EntityName}}Dto) => {
    try {
      await {{EntityName}}Service.update(id, data)
    } catch (error) {
      console.error(`Failed to update {{EntityName}} ${id}:`, error)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      await {{EntityName}}Service.delete(id)
    } catch (error) {
      console.error(`Failed to delete {{EntityName}} ${id}:`, error)
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