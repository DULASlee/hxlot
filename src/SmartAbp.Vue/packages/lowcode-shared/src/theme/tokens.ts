/**
 * 设计令牌系统 - 与CSS完全同步
 * 
 * 基准文件: src/styles/design-system/themes/theme-base.css
 * 同步日期: 2025-10-27
 * SSOT重构: 阶段5 - TypeScript同步
 * 
 * ⚠️ 重要：修改此文件时必须同步更新CSS文件
 */

/**
 * 设计令牌接口
 */
export interface DesignTokens {
  colors: {
    // 品牌色（科技蓝主题）
    brandPrimary: string
    brandPrimaryHover: string
    brandPrimaryActive: string
    brandPrimaryFocus: string
    brandPrimaryLight: string
    brandPrimaryLighter: string
    
    // 功能色
    success: string
    successHover: string
    successLight: string
    warning: string
    warningHover: string
    warningLight: string
    danger: string
    dangerHover: string
    dangerLight: string
    info: string
    infoHover: string
    infoLight: string
    
    // 背景色
    bgBody: string
    bgBase: string
    bgComponent: string
    bgElevated: string
    bgSunken: string
    bgCard: string
    bgNavbar: string
    bgSidebar: string
    bgHover: string
    bgAccent: string
    
    // 文本色
    textPrimary: string
    textSecondary: string
    textTertiary: string
    textDisabled: string
    textInverse: string
    
    // 边框色
    borderBase: string
    borderLight: string
    borderDark: string
  }
  
  spacing: {
    1: string
    2: string
    3: string
    4: string
    5: string
    6: string
    8: string
    10: string
    12: string
    16: string
    20: string
    24: string
    32: string
  }
  
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

/**
 * 默认主题令牌（科技蓝 - 与theme-base.css完全一致）
 */
export const lightTokens: DesignTokens = {
  colors: {
    // 品牌色 - 科技蓝
    brandPrimary: '#0ea5e9',
    brandPrimaryHover: '#0284c7',
    brandPrimaryActive: '#0369a1',
    brandPrimaryFocus: '#38bdf8',
    brandPrimaryLight: '#e0f2fe',
    brandPrimaryLighter: '#f0f9ff',
    
    // 功能色
    success: '#10b981',
    successHover: '#059669',
    successLight: 'rgba(16, 185, 129, 0.1)',
    warning: '#f59e0b',
    warningHover: '#d97706',
    warningLight: 'rgba(245, 158, 11, 0.1)',
    danger: '#ef4444',
    dangerHover: '#dc2626',
    dangerLight: 'rgba(239, 68, 68, 0.1)',
    info: '#3b82f6',
    infoHover: '#2563eb',
    infoLight: 'rgba(59, 130, 246, 0.1)',
    
    // 背景色 - 清新蓝白
    bgBody: '#f8fafc',
    bgBase: '#f8fafc',
    bgComponent: '#ffffff',
    bgElevated: '#ffffff',
    bgSunken: '#f1f5f9',
    bgCard: '#ffffff',
    bgNavbar: '#ffffff',
    bgSidebar: '#ffffff',
    bgHover: 'rgba(14, 165, 233, 0.08)',
    bgAccent: '#f1f5f9',
    
    // 文本色
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textTertiary: '#64748b',
    textDisabled: '#94a3b8',
    textInverse: '#ffffff',
    
    // 边框色
    borderBase: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderDark: '#cbd5e1'
  },
  
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    32: '128px'
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(14, 165, 233, 0.08)',
    md: '0 4px 6px -1px rgba(14, 165, 233, 0.12), 0 2px 4px -1px rgba(14, 165, 233, 0.08)',
    lg: '0 10px 15px -3px rgba(14, 165, 233, 0.15), 0 4px 6px -2px rgba(14, 165, 233, 0.08)',
    xl: '0 20px 25px -5px rgba(14, 165, 233, 0.15), 0 10px 10px -5px rgba(14, 165, 233, 0.08)'
  }
}

/**
 * 暗色主题令牌（与theme-base.css .theme-dark完全一致）
 */
export const darkTokens: DesignTokens = {
  colors: {
    // 品牌色 - 暗黑蓝
    brandPrimary: '#60a5fa',
    brandPrimaryHover: '#3b82f6',
    brandPrimaryActive: '#2563eb',
    brandPrimaryFocus: '#93c5fd',
    brandPrimaryLight: 'rgba(96, 165, 250, 0.15)',
    brandPrimaryLighter: 'rgba(96, 165, 250, 0.08)',
    
    // 功能色
    success: '#34d399',
    successHover: '#10b981',
    successLight: 'rgba(52, 211, 153, 0.15)',
    warning: '#fbbf24',
    warningHover: '#f59e0b',
    warningLight: 'rgba(251, 191, 36, 0.15)',
    danger: '#f87171',
    dangerHover: '#ef4444',
    dangerLight: 'rgba(248, 113, 113, 0.15)',
    info: '#60a5fa',
    infoHover: '#3b82f6',
    infoLight: 'rgba(96, 165, 250, 0.15)',
    
    // 背景色 - 深色系
    bgBody: '#0f172a',
    bgBase: '#0f172a',
    bgComponent: '#1e293b',
    bgElevated: '#334155',
    bgSunken: '#0f172a',
    bgCard: '#1e293b',
    bgNavbar: '#1e293b',
    bgSidebar: '#1e293b',
    bgHover: 'rgba(96, 165, 250, 0.12)',
    bgAccent: '#334155',
    
    // 文本色
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    textDisabled: '#64748b',
    textInverse: '#0f172a',
    
    // 边框色
    borderBase: '#374151',
    borderLight: '#334155',
    borderDark: '#4b5563'
  },
  
  spacing: lightTokens.spacing,
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)'
  }
}

/**
 * 主题类型
 */
export type ThemeMode = 'light' | 'dark' | 'tech-blue' | 'deep-green' | 'light-purple'

/**
 * 主题配置
 */
export interface ThemeConfig {
  mode: ThemeMode
  tokens: DesignTokens
}

/**
 * 预设主题
 */
export const presetThemes: Record<'light' | 'dark', ThemeConfig> = {
  light: {
    mode: 'light',
    tokens: lightTokens
  },
  dark: {
    mode: 'dark',
    tokens: darkTokens
  }
}

/**
 * 默认导出（向后兼容）
 */
export const DesignTokensDefault = lightTokens

/**
 * 工具函数：将令牌应用到CSS变量
 */
export function applyTokensToCSS(tokens: DesignTokens): void {
  const root = document.documentElement
  
  // 应用颜色
  Object.entries(tokens.colors).forEach(([key, value]) => {
    const cssVarName = `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
    root.style.setProperty(cssVarName, value)
  })
  
  // 应用间距
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value)
  })
  
  // 应用阴影
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value)
  })
}

/**
 * ✅ SSOT验证：此文件已与CSS完全同步
 * 日期: 2025-10-27
 * CSS基准: src/styles/design-system/themes/theme-base.css
 */
