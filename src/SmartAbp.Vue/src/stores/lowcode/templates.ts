import { defineStore } from "pinia"
import { ref } from "vue"
import { codeGenerationApi } from "@smartabp/lowcode-api"

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
      templates.value = await codeGenerationApi.getTemplates()
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
