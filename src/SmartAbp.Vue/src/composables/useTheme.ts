/**
 * 主题管理系统 - 与SSOT设计令牌系统完全同步
 * 
 * 基准: src/styles/design-system/themes/theme-base.css
 * 令牌: packages/lowcode-shared/src/theme/tokens.ts
 * 更新日期: 2025-10-27
 * 
 * ⚠️ 重要：此文件使用SSOT设计令牌系统的主题配置
 */

import { lightTokens, darkTokens, type DesignTokens } from '@smartabp/lowcode-shared/theme'
import { computed, ref, watch } from 'vue'

/**
 * 主题枚举（与SSOT系统对齐）
 */
export const THEMES = {
  TECH_BLUE: 'theme-tech-blue',    // 科技蓝（默认）
  DEEP_GREEN: 'theme-deep-green',  // 深绿色
  LIGHT_PURPLE: 'theme-light-purple', // 浅紫色
  DARK: 'theme-dark',              // 暗黑模式
} as const

type ThemeKey = typeof THEMES[keyof typeof THEMES]

/**
 * 主题配置项
 */
type ThemeConfigItem = {
  name: string
  icon: string
  className: string
  tokens: DesignTokens
}

/**
 * SSOT主题配置（与theme-base.css和tokens.ts完全同步）
 */
const themeConfig: Record<string, ThemeConfigItem> = {
  [THEMES.TECH_BLUE]: {
    name: '科技蓝',
    icon: '💙',
    className: 'theme-tech-blue',
    tokens: lightTokens, // 使用SSOT系统的lightTokens
  },
  [THEMES.DEEP_GREEN]: {
    name: '深绿色',
    icon: '🌿',
    className: 'theme-deep-green',
    tokens: lightTokens, // 深绿色主题使用lightTokens作为基础
  },
  [THEMES.LIGHT_PURPLE]: {
    name: '浅紫色',
    icon: '💜',
    className: 'theme-light-purple',
    tokens: lightTokens, // 浅紫色主题使用lightTokens作为基础
  },
  [THEMES.DARK]: {
    name: '暗黑模式',
    icon: '🌙',
    className: 'theme-dark',
    tokens: darkTokens, // 使用SSOT系统的darkTokens
  },
}

const currentTheme = ref<ThemeKey>(
  (localStorage.getItem('app-theme') as ThemeKey) || THEMES.TECH_BLUE
)

export function useTheme() {
  const theme = computed<ThemeConfigItem>(() => {
    const config = themeConfig[currentTheme.value]
    if (config) return config
    return themeConfig[THEMES.TECH_BLUE]!
  })

  const isDark = computed(() => currentTheme.value === THEMES.DARK)

  /**
   * 应用主题（切换HTML的className，使用CSS系统的主题）
   * 
   * 原理：通过切换HTML元素的className，自动应用theme-base.css中定义的主题
   */
  const applyTheme = (themeName: ThemeKey) => {
    const config = themeConfig[themeName] || themeConfig[THEMES.TECH_BLUE]
    const root = document.documentElement

    // 添加过渡效果
    root.classList.add('theme-transitioning')

    requestAnimationFrame(() => {
      // 移除所有主题类名
      Object.values(THEMES).forEach(t => {
        root.classList.remove(t)
      })

      // 添加新主题类名（这会自动应用theme-base.css中的CSS变量）
      if (config) {
        root.classList.add(config.className)
      }

      // 更新meta标签（PWA支持）
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor && config?.tokens.colors.brandPrimary) {
        metaThemeColor.setAttribute('content', config.tokens.colors.brandPrimary)
      }

      // 300ms后移除过渡类
      setTimeout(() => {
        root.classList.remove('theme-transitioning')

        // 触发主题变更事件
        if (config) {
          window.dispatchEvent(
            new CustomEvent('theme-changed', {
              detail: {
                theme: themeName,
                className: config.className,
                tokens: config.tokens,
              },
            })
          )
        }
      }, 300)
    })
  }

  /**
   * 设置主题
   */
  const setTheme = (themeName: ThemeKey) => {
    if (themeConfig[themeName]) {
      currentTheme.value = themeName
      localStorage.setItem('app-theme', themeName)
      applyTheme(themeName)
    }
  }

  /**
   * 切换亮/暗模式
   */
  const toggleDark = () => {
    const newTheme = isDark.value ? THEMES.TECH_BLUE : THEMES.DARK
    setTheme(newTheme)
  }

  /**
   * 获取可用主题列表
   */
  const getAvailableThemes = () => {
    return Object.entries(themeConfig).map(([key, cfg]) => ({
      key,
      name: cfg.name,
      icon: cfg.icon,
      className: cfg.className,
      current: key === currentTheme.value,
    }))
  }

  /**
   * 监听当前主题变化
   */
  watch(
    currentTheme,
    (newVal) => {
      applyTheme(newVal)
    },
    { immediate: true }
  )

  /**
   * 监听系统主题偏好
   */
  const watchSystemTheme = (): (() => void) | undefined => {
    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('app-theme')) {
          setTheme(e.matches ? THEMES.DARK : THEMES.TECH_BLUE)
        }
      }
      mq.addEventListener('change', handler)
      
      // 初始化时检查系统偏好
      if (!localStorage.getItem('app-theme')) {
        setTheme(mq.matches ? THEMES.DARK : THEMES.TECH_BLUE)
      }
      
      return () => mq.removeEventListener('change', handler)
    }
    return undefined
  }

  return {
    currentTheme: computed(() => currentTheme.value),
    theme,
    isDark,
    setTheme,
    toggleDark,
    getAvailableThemes,
    watchSystemTheme,
    THEMES,
  }
}

/**
 * 主题工具函数
 */
export const themeUtils = {
  /**
   * 获取当前主题的某个颜色令牌
   */
  getThemeColor: (colorKey: keyof DesignTokens['colors']): string | undefined => {
    const config = themeConfig[currentTheme.value]
    if (config && config.tokens.colors[colorKey]) {
      return config.tokens.colors[colorKey]
    }
    return undefined
  },

  /**
   * 生成渐变（使用设计令牌）
   */
  generateGradient: (color1: string, color2: string, direction = 'to right') => {
    return `linear-gradient(${direction}, ${color1}, ${color2})`
  },

  /**
   * 调整透明度
   */
  adjustOpacity: (color: string, opacity: number) => {
    if (color.startsWith('#')) {
      const hex = color.slice(1)
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }
    return color
  },
}

/**
 * ✅ SSOT同步验证
 * 
 * 此文件已与SSOT设计令牌系统完全同步：
 * - CSS主题: src/styles/design-system/themes/theme-base.css
 * - TS令牌: packages/lowcode-shared/src/theme/tokens.ts
 * - 更新日期: 2025-10-27
 */
