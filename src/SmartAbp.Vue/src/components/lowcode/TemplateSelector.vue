<template>
  <div class="template-selector">
    <div v-if="store.isLoading">Loading templates...</div>
    <div v-if="store.error" class="error">
      Failed to load templates: {{ store.error.message }}
    </div>
    <div v-if="!store.isLoading && !store.error" class="template-list">
      <el-card
        v-for="template in store.templates"
        :key="template.id"
        shadow="hover"
        class="template-card"
        @click="selectTemplate(template)"
      >
        <template #header>
          <div class="card-header">
            <span>{{ template.name }}</span>
          </div>
        </template>
        <p>{{ template.description }}</p>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { useTemplatesStore } from "@/stores/lowcode/templates"
import { ElCard } from "element-plus"
import type { TemplateDefinition } from "@smartabp/lowcode-api/types"

const emit = defineEmits<{
  (e: "select", template: TemplateDefinition): void
}>()

const store = useTemplatesStore()

onMounted(() => {
  if (store.templates.length === 0) {
    store.fetchTemplates()
  }
})

const selectTemplate = (template: TemplateDefinition) => {
  emit("select", template)
}
</script>

<style scoped>
.template-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}
.template-card {
  cursor: pointer;
}
.error {
  color: #f56c6c;
}
</style>
