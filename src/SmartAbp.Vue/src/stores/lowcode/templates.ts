import { defineStore } from "pinia"
import { ref } from "vue"
// import { databaseApi } from "@smartabp/lowcode-api" // TODO: databaseApi不存在，暂时注释

// Type definition
interface Template {
  id: string
  name: string
  description: string
}

export const useTemplatesStore = defineStore("templates", () => {
  const templates = ref<Template[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const fetchTemplates = async () => {
    isLoading.value = true
    error.value = null
    try {
      // TODO: 使用正确的API替换databaseApi
      templates.value = [] // await databaseApi.getTemplates()
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
