import { defineStore } from "pinia"
import { ref } from "vue"
// 暂时注释避免编译错误
// import { codeGeneratorApi } from "@smartabp/lowcode-api"
// import type { Template } from "@smartabp/lowcode-api"

// 临时类型定义
interface Template {
  id: string
  name: string
  description: string
}

// 临时API替代
const codeGeneratorApi = {
  getTemplates: () => Promise.resolve([]),
  getTemplate: (_id: string) => Promise.resolve(null)
}

export const useTemplatesStore = defineStore("templates", () => {
  const templates = ref<Template[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const fetchTemplates = async () => {
    isLoading.value = true
    error.value = null
    try {
      // 类型安全的API调用 - 使用已定义的临时API
      templates.value = await codeGeneratorApi.getTemplates() ?? []
    } catch (e: any) {
      error.value = e
    } finally {
      isLoading.value = false
    }
  }

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
  }
})
