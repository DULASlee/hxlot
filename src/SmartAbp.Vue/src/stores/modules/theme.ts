import { defineStore } from 'pinia'
import { computed, type ComputedRef, type WritableComputedRef } from 'vue'
import useDesignSystem, { THEMES, type ThemeType, type ThemeConfig } from '@/composables/useDesignSystem'
import { getIconStyleForTheme } from '@/config/theme-icon.config'
import { useIconStyleStore } from './iconStyle'

// 类型别名
export type Theme = ThemeType
export type ThemeMode = 'light' | 'dark' | 'auto'

/**
 * 主题Store
 * 负责管理应用主题和暗黑模式
 * 
 * 配置驱动设计：
 * - 主题切换时自动联动图标风格
 * - 联动关系由配置中心管理
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
    get: () => theme.value as Theme,
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
   * ✅ 配置驱动：自动联动对应的图标风格
   */
  const setTheme = (newTheme: Theme): void => {
    setThemeImpl(newTheme)
    
    // 🔗 主题-图标联动（配置驱动）
    try {
      const iconStore = useIconStyleStore()
      // ✅ 使用配置函数获取对应的图标风格（消除硬编码）
      const targetIconStyle = getIconStyleForTheme(newTheme)
      iconStore.setIconStyle(targetIconStyle)
      console.log(`🔗 主题联动: ${newTheme} → 图标风格: ${targetIconStyle}`)
    } catch (error) {
      // ⚠️ 图标切换失败不影响主题切换
      console.warn('⚠️ 图标风格联动失败，不影响主题切换:', error)
    }
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