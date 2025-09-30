import { defineStore } from 'pinia'
import { computed, type ComputedRef, type WritableComputedRef } from 'vue'
import useDesignSystem, { THEMES, type ThemeType, type ThemeConfig } from '@/composables/useDesignSystem'

// 类型别名
export type Theme = ThemeType
export type ThemeMode = 'light' | 'dark' | 'auto'

/**
 * 主题Store
 * 负责管理应用主题和暗黑模式
 */
export const useThemeStore = defineStore('theme', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 设计系统集成
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
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
    initTheme
  } = useDesignSystem()

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 计算属性
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 当前主题（可读写）
   */
  const currentTheme: WritableComputedRef<Theme> = computed({
    get: () => theme.value,
    set: (value: Theme) => setTheme(value)
  })

  /**
   * 当前主题配置
   */
  const currentThemeConfig: ComputedRef<ThemeConfig> = computed(() => {
    return getThemeConfig(currentTheme.value)
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 公共方法
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 设置主题
   */
  const setTheme = (newTheme: Theme): void => {
    setThemeImpl(newTheme)
  }

  /**
   * 切换暗黑模式
   */
  const toggleDarkMode = (): void => {
    toggleDarkModeImpl()
  }

  /**
   * 获取主题配置
   */
  const getThemeConfig = (themeValue: Theme): ThemeConfig => {
    return THEMES.find(t => t.value === themeValue) || THEMES[0]
  }

  /**
   * 初始化主题
   */
  const init = (): (() => void) => {
    const cleanup = initTheme()
    return cleanup
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 返回Store接口
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
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
    getThemeConfig
  }
})

export default useThemeStore