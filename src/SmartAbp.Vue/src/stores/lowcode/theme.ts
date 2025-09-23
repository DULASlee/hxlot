import { defineStore } from "pinia"
import { ref, watch } from "vue"

export const useThemeStore = defineStore("theme", () => {
  const themeVariables = ref<Record<string, string>>({
    "--el-color-primary": "#409EFF",
  })

  const applyTheme = () => {
    const root = document.documentElement
    for (const [key, value] of Object.entries(themeVariables.value)) {
      root.style.setProperty(key, value)
    }
  }

  const setPrimaryColor = (color: string) => {
    themeVariables.value["--el-color-primary"] = color
  }

  // Apply theme whenever variables change
  watch(themeVariables, applyTheme, { deep: true, immediate: true })

  return {
    themeVariables,
    setPrimaryColor,
    applyTheme,
  }
})
