<template>
  <div class="theme-editor">
    <div class="theme-option">
      <label for="primary-color">Primary Color</label>
      <input
        id="primary-color"
        type="color"
        :value="primaryColor"
        @input="onColorChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useThemeStore } from "@/stores/lowcode/theme"

const themeStore = useThemeStore()

const primaryColor = computed(() => {
  // 安全访问，防止 themeVariables 未初始化
  return themeStore.themeVariables?.["--el-color-primary"] || "#409EFF"
})

const onColorChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  themeStore.setPrimaryColor(target.value)
}
</script>

<style scoped>
.theme-editor {
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.theme-option {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
