/**
 * Design Tokens 组合函数
 * 提供设计令牌的访问和管理
 */

import { computed, ref, watch } from 'vue'
import { lightTokens, darkTokens, type DesignTokens } from '@/styles/tokens'

/**
 * 主题模式
 */
export type ThemeMode = 'light' | 'dark' | 'auto'

/**
 * 当前主题模式
 */
const currentMode = ref<ThemeMode>('light')

/**
 * 是否跟随系统
 */
const followSystem = computed(() => currentMode.value === 'auto')

/**
 * 实际生效的主题模式
 */
const effectiveMode = computed<'light' | 'dark'>(() => {
  if (currentMode.value === 'auto') {
    // 检测系统主题
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return currentMode.value
})

/**
 * 当前主题的设计令牌
 */
const currentTokens = computed<DesignTokens>(() => {
  return effectiveMode.value === 'dark' ? darkTokens : lightTokens
})

/**
 * 应用CSS变量到document
 */
function applyCSSVariables(tokens: DesignTokens): void {
  const root = document.documentElement
  
  // 应用颜色
  Object.entries(tokens.colors).forEach(([category, values]) => {
    if (typeof values === 'object' && values !== null) {
      Object.entries(values).forEach(([key, value]) => {
        root.style.setProperty(`--color-${category}-${key}`, String(value))
      })
    }
  })
  
  // 应用间距
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value)
  })
  
  // 应用字体
  root.style.setProperty('--font-family-base', tokens.typography.fontFamily.base)
  root.style.setProperty('--font-family-mono', tokens.typography.fontFamily.mono)
  
  Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
    root.style.setProperty(`--font-size-${key}`, value)
  })
  
  Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
    root.style.setProperty(`--font-weight-${key}`, String(value))
  })
  
  Object.entries(tokens.typography.lineHeight).forEach(([key, value]) => {
    root.style.setProperty(`--line-height-${key}`, String(value))
  })
  
  // 应用圆角
  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--border-radius-${key}`, value)
  })
  
  // 应用阴影
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value)
  })
  
  // 应用过渡
  Object.entries(tokens.transitions.duration).forEach(([key, value]) => {
    root.style.setProperty(`--transition-duration-${key}`, value)
  })
  
  Object.entries(tokens.transitions.timing).forEach(([key, value]) => {
    root.style.setProperty(`--transition-timing-${key}`, value)
  })
  
  // 应用z-index
  Object.entries(tokens.zIndex).forEach(([key, value]) => {
    root.style.setProperty(`--z-index-${key}`, String(value))
  })
}

/**
 * 监听主题变化
 */
watch(currentTokens, (tokens) => {
  applyCSSVariables(tokens)
  // 更新body的data-theme属性
  document.body.setAttribute('data-theme', effectiveMode.value)
}, { immediate: true })

/**
 * 监听系统主题变化
 */
if (window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    if (followSystem.value) {
      applyCSSVariables(currentTokens.value)
      document.body.setAttribute('data-theme', effectiveMode.value)
    }
  })
}

/**
 * useDesignTokens - 设计令牌组合函数
 */
export function useDesignTokens() {
  /**
   * 设置主题模式
   */
  const setMode = (mode: ThemeMode) => {
    currentMode.value = mode
    // 保存到localStorage
    localStorage.setItem('theme-mode', mode)
  }
  
  /**
   * 切换主题模式
   */
  const toggleMode = () => {
    const newMode = effectiveMode.value === 'light' ? 'dark' : 'light'
    setMode(newMode)
  }
  
  /**
   * 获取CSS变量值
   */
  const getCSSVariable = (name: string): string => {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  }
  
  /**
   * 设置CSS变量值
   */
  const setCSSVariable = (name: string, value: string): void => {
    document.documentElement.style.setProperty(name, value)
  }
  
  /**
   * 从localStorage恢复主题
   */
  const restoreTheme = () => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode | null
    if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
      currentMode.value = savedMode
    }
  }
  
  // 初始化时恢复主题
  restoreTheme()
  
  return {
    // 状态
    mode: currentMode,
    effectiveMode,
    tokens: currentTokens,
    followSystem,
    
    // 方法
    setMode,
    toggleMode,
    getCSSVariable,
    setCSSVariable,
    restoreTheme
  }
}
