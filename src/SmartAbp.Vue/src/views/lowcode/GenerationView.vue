<template>
  <div class="generation-view">
    <h2>Code Generation</h2>
    <TemplateSelector @select="onTemplateSelect" />
    <div v-if="selectedTemplate" class="generation-controls">
      <h3>Selected Template: {{ selectedTemplate.name }}</h3>
      <el-button type="primary" @click="generateCode">Generate Code</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { ElButton, ElMessage } from "element-plus"
import TemplateSelector from "@/components/lowcode/TemplateSelector.vue"
import type { TemplateDefinition } from "@smartabp/lowcode-api/types"

const selectedTemplate = ref<TemplateDefinition | null>(null)

const onTemplateSelect = (template: TemplateDefinition) => {
  selectedTemplate.value = template
}

const generateCode = () => {
  if (selectedTemplate.value) {
    ElMessage.info(`Generating code with template: ${selectedTemplate.value.name}`)
    // TODO: Connect to workspace store and code generation API
  }
}
</script>

<style scoped>
.generation-view {
  padding: 24px;
}
.generation-controls {
  margin-top: 24px;
}
</style>
