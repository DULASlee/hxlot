import { defineStore } from "pinia"
import { ref } from "vue"
import type { EntityModel } from "@smartabp/lowcode-core"

export const useDesignerStore = defineStore("lowcodeDesigner", () => {
  const currentSchema = ref<EntityModel | null>(null)
  const history = ref<EntityModel[]>([])

  const setSchema = (schema: EntityModel) => {
    currentSchema.value = schema
  }

  const updateSchema = (partialSchema: Partial<EntityModel>) => {
    if (currentSchema.value) {
      currentSchema.value = { ...currentSchema.value, ...partialSchema }
    }
  }

  return {
    currentSchema,
    history,
    setSchema,
    updateSchema,
  }
})
