import { defineStore } from "pinia"
import { computed } from "vue"
import useDesignSystem, { ThemeType, THEMES } from "@/composables/useDesignSystem"

export type ThemeMode = ThemeType

export const useThemeStore = defineStore("theme", () => {
  // 使用设计系统 composable
  const {
    theme,
    isDarkMode,
    isCurrentThemeDark,
    setTheme: setThemeImpl,
    toggleDarkMode: toggleDarkModeImpl,
    getAvailableThemes,
    getThemeToken,
    setThemeToken,
    applyTheme,
    watchSystemTheme,
    initTheme,
  } = useDesignSystem()

  // 当前主题
  const currentTheme = computed({
    get: () => theme.value,
    set: (value: ThemeType) => setTheme(value),
  })

  // 设置主题
  const setTheme = (newTheme: ThemeType) => {
    setThemeImpl(newTheme)
  }

  // 切换暗黑模式
  const toggleDarkMode = () => {
    toggleDarkModeImpl()
  }

  // 获取主题配置
  const getThemeConfig = (themeValue: ThemeType) => {
    return THEMES.find((t) => t.value === themeValue) || THEMES[0]
  }

  // 当前主题配置
  const currentThemeConfig = computed(() => {
    return getThemeConfig(currentTheme.value)
  })

  // 初始化主题
  const init = () => {
    const cleanup = initTheme()
    return cleanup
  }

  return {
    // 状态
    currentTheme,
    isDarkMode,
    isCurrentThemeDark,
    currentThemeConfig,

    // 方法
    setTheme,
    toggleDarkMode,
    getAvailableThemes,
    getThemeToken,
    setThemeToken,
    applyTheme,
    watchSystemTheme,
    init,
    getThemeConfig,
  }
})

export default useThemeStore
