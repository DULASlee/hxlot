import { defineStore } from "pinia"
import { ref } from "vue"
import { codeGeneratorApi } from "@smartabp/lowcode-api"
import type { TemplateDefinition } from "@smartabp/lowcode-api/types"

export const useTemplatesStore = defineStore("templates", () => {
  const templates = ref<TemplateDefinition[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const fetchTemplates = async () => {
    isLoading.value = true
    error.value = null
    try {
      templates.value = await codeGeneratorApi.getTemplates()
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
