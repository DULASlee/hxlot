/**
 * 主题管理器
 * Theme Manager - 动态主题切换和CSS变量管理
 */

import { ref, computed } from 'vue'
import type { DesignTokens, ThemeMode } from './tokens'
import { lightTokens, darkTokens } from './tokens'
import { SESSION_STORAGE_KEYS } from '../constants/common'

/**
 * 主题管理器类
 */
export class ThemeManager {
  private currentMode = ref<ThemeMode>('light')
  private currentTokens = ref<DesignTokens>(lightTokens)

  constructor() {
    // 从存储中恢复主题
    this.restoreTheme()
    
    // 监听系统主题变化
    this.watchSystemTheme()
  }

  /**
   * 获取当前主题模式
   */
  get mode() {
    return computed(() => this.currentMode.value)
  }

  /**
   * 获取当前设计令牌
   */
  get tokens() {
    return computed(() => this.currentTokens.value)
  }

  /**
   * 设置主题
   */
  setTheme(mode: ThemeMode) {
    this.currentMode.value = mode
    
    // 根据模式选择令牌
    if (mode === 'auto') {
      // 自动模式，根据系统主题选择
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      this.currentTokens.value = prefersDark ? darkTokens : lightTokens
    } else {
      this.currentTokens.value = mode === 'dark' ? darkTokens : lightTokens
    }

    // 应用CSS变量
    this.applyCSSVariables()
    
    // 保存到存储
    this.saveTheme()
  }

  /**
   * 切换主题
   */
  toggleTheme() {
    const newMode = this.currentMode.value === 'light' ? 'dark' : 'light'
    this.setTheme(newMode)
  }

  /**
   * 应用CSS变量到DOM
   */
  private applyCSSVariables() {
    const root = document.documentElement
    const tokens = this.currentTokens.value

    // 应用颜色变量
    Object.entries(tokens.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${this.kebabCase(key)}`, value)
    })

    // 应用间距变量
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value)
    })

    // 应用字体变量
    root.style.setProperty('--font-family-base', tokens.typography.fontFamily.base)
    root.style.setProperty('--font-family-mono', tokens.typography.fontFamily.mono)
    
    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value)
    })
    
    Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value.toString())
    })
    
    Object.entries(tokens.typography.lineHeight).forEach(([key, value]) => {
      root.style.setProperty(`--line-height-${key}`, value.toString())
    })

    // 应用圆角变量
    Object.entries(tokens.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value)
    })

    // 应用阴影变量
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value)
    })

    // 应用过渡变量
    Object.entries(tokens.transitions.duration).forEach(([key, value]) => {
      root.style.setProperty(`--duration-${key}`, value)
    })
    
    Object.entries(tokens.transitions.timing).forEach(([key, value]) => {
      root.style.setProperty(`--timing-${key}`, value)
    })

    // 应用z-index变量
    Object.entries(tokens.zIndex).forEach(([key, value]) => {
      root.style.setProperty(`--z-${this.kebabCase(key)}`, value.toString())
    })

    this.cssVariablesApplied = true
  }

  /**
   * 从存储恢复主题
   */
  private restoreTheme() {
    const savedMode = sessionStorage.getItem(SESSION_STORAGE_KEYS.THEME) as ThemeMode
    if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
      this.setTheme(savedMode)
    } else {
      // 默认使用auto模式
      this.setTheme('auto')
    }
  }

  /**
   * 保存主题到存储
   */
  private saveTheme() {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.THEME, this.currentMode.value)
  }

  /**
   * 监听系统主题变化
   */
  private watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    mediaQuery.addEventListener('change', (e) => {
      if (this.currentMode.value === 'auto') {
        this.currentTokens.value = e.matches ? darkTokens : lightTokens
        this.applyCSSVariables()
      }
    })
  }

  /**
   * 转换为kebab-case
   */
  private kebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  }

  /**
   * 获取CSS变量值
   */
  getCSSVariable(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  }

  /**
   * 设置自定义CSS变量
   */
  setCSSVariable(name: string, value: string) {
    document.documentElement.style.setProperty(name, value)
  }
}

/**
 * 全局主题管理器实例
 */
let themeManagerInstance: ThemeManager | null = null

/**
 * 获取主题管理器单例
 */
export function getThemeManager(): ThemeManager {
  if (!themeManagerInstance) {
    themeManagerInstance = new ThemeManager()
  }
  return themeManagerInstance
}

/**
 * 主题管理组合式函数
 * 
 * @example
 * ```typescript
 * import { useTheme } from '@smartabp/lowcode-shared/theme'
 * 
 * const { mode, tokens, setTheme, toggleTheme } = useTheme()
 * 
 * // 切换主题
 * toggleTheme()
 * 
 * // 设置为暗色主题
 * setTheme('dark')
 * 
 * // 使用设计令牌
 * const primaryColor = tokens.value.colors.primary
 * ```
 */
export function useTheme() {
  const manager = getThemeManager()

  return {
    mode: manager.mode,
    tokens: manager.tokens,
    setTheme: (mode: ThemeMode) => manager.setTheme(mode),
    toggleTheme: () => manager.toggleTheme(),
    getCSSVariable: (name: string) => manager.getCSSVariable(name),
    setCSSVariable: (name: string, value: string) => manager.setCSSVariable(name, value)
  }
}
