<template>
  <div class="visual-design-canvas">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue"

interface PageData {
  [key: string]: unknown
}

interface EntityData {
  [key: string]: unknown
}

defineProps<{
  pageData?: PageData
  entityData?: EntityData
}>()

defineEmits<{
  (e: "component-added", payload: unknown): void
  (e: "component-selected", payload: unknown): void
  (e: "component-updated", payload: unknown): void
  (e: "component-deleted", payload: unknown): void
  (e: "preview-generated", payload: unknown): void
}>()
</script>

<style scoped>
.visual-design-canvas {
  min-height: 200px;
  border: 1px dashed var(--el-border-color, #dcdfe6);
  border-radius: 4px;
  background: var(--el-color-white, #fff);
}
</style>


