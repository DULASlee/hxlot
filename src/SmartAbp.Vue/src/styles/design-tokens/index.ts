/**
 * 🎨 设计令牌系统入口
 * 
 * 统一导出所有设计令牌
 * 提供类型定义和工具函数
 */

export * from './colors'
export * from './spacing'
export * from './motion'

import { generateColorVariables } from './colors'
import { generateSpacingVariables } from './spacing'
import { generateMotionVariables } from './motion'

/**
 * 生成完整的CSS变量
 */
export function generateDesignTokens(theme: 'light' | 'dark' = 'light'): string {
  return `
:root {
  ${generateColorVariables(theme)}
  ${generateSpacingVariables()}
  ${generateMotionVariables()}
}

/* 暗黑模式 */
[data-theme="dark"] {
  ${generateColorVariables('dark')}
}
  `.trim()
}

/**
 * 设计令牌工具函数
 */
export const designTokenUtils = {
  /**
   * 获取CSS变量值
   */
  getCSSVariable(variable: string): string {
    if (typeof window === 'undefined') return ''
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
  },
  
  /**
   * 设置CSS变量值
   */
  setCSSVariable(variable: string, value: string): void {
    if (typeof window === 'undefined') return
    document.documentElement.style.setProperty(variable, value)
  },
  
  /**
   * 切换主题
   */
  toggleTheme(theme: 'light' | 'dark'): void {
    if (typeof window === 'undefined') return
    document.documentElement.setAttribute('data-theme', theme)
  },
  
  /**
   * 获取当前主题
   */
  getCurrentTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light'
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  },
}

