import { defineStore } from "pinia"
import { ref } from "vue"
import { codeGeneratorApi } from "../../../packages/lowcode-api/index"
import type { Template } from "../../../packages/lowcode-api/src/types/index"

export const useTemplatesStore = defineStore("templates", () => {
  const templates = ref<Template[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const fetchTemplates = async () => {
    isLoading.value = true
    error.value = null
    try {
      templates.value = await (codeGeneratorApi as any).getTemplates?.() ?? []
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
