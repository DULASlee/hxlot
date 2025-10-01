import type { ThemeType, IconStyleType } from '@/types/theme'

/**
 * {{EntityName}}主题图标配置中心
 * 配置驱动设计 - 遵循开闭原则，零硬编码
 * 
 * @module theme-icon.config
 * @date {{Date}}
 * @author SmartAbp Team
 */

// ==================== 存储键名配置 ====================
/**
 * LocalStorage存储键名配置（消除硬编码）
 */
export const STORAGE_KEYS = {
  /** 主题存储键 */
  THEME: 'app-theme',
  /** 主题备份存储键 */
  THEME_BACKUP: 'app-theme-backup',
  /** 图标风格存储键 */
  ICON_STYLE: '{{projectPrefix}}-icon-style',
  /** 图标风格备份存储键 */
  ICON_STYLE_BACKUP: '{{projectPrefix}}-icon-style-backup',
} as const

// ==================== 默认值配置 ====================
/**
 * 系统默认值配置
 */
export const DEFAULT_VALUES = {
  /** 默认主题 */
  THEME: 'tech-blue' as ThemeType,
  /** 默认图标风格 (Element Plus作为企业级推荐) */
  ICON_STYLE: 'element-plus' as IconStyleType,
} as const

// ==================== 主题-图标绑定配置 ====================
/**
 * 主题与图标风格绑定关系配置（配置驱动核心）
 * 
 * 扩展说明：
 * 1. 添加新主题只需在此配置新的映射关系
 * 2. 业务代码通过 getIconStyleForTheme() 函数访问，无需修改
 * 3. 完全遵循开闭原则：对扩展开放，对修改关闭
 * 
 * @example
 * // 添加新主题 "business-red" 使用 "antd" 图标
 * export const THEME_ICON_BINDING: Record<ThemeType, IconStyleType> = {
 *   ...
 *   'business-red': 'antd'  // ✅ 新增配置，业务代码零修改
 * }
 */
export const THEME_ICON_BINDING: Record<ThemeType, IconStyleType> = {
  /** 科技蓝主题 → Element Plus图标 */
  'tech-blue': 'element-plus',
  /** 深绿色主题 → Element Plus图标 */
  'deep-green': 'element-plus',
  /** 浅紫色主题 → Element Plus图标 */
  'light-purple': 'element-plus',
  /** 暗黑模式 → Element Plus图标 */
  'dark': 'element-plus',
  // 扩展示例（已注释）：
  // 'business-red': 'antd',
  // 'modern-blue': 'fontawesome'
} as const

// ==================== 主题配置 ====================
/**
 * 主题详细配置
 */
export interface ThemeConfig {
  /** 主题唯一标识 */
  id: ThemeType
  /** 主题显示名称 */
  name: string
  /** 主题描述 */
  description?: string
  /** 主题图标 */
  icon?: string
  /** 主题颜色（用于预览） */
  primaryColor: string
  /** 是否为暗色主题 */
  isDark: boolean
  /** 绑定的图标风格 */
  iconStyle: IconStyleType
}

/**
 * 预设主题配置列表
 */
export const PRESET_THEMES: ThemeConfig[] = [
  {
    id: 'tech-blue',
    name: '科技蓝',
    description: '现代科技感主题，适合企业级应用',
    icon: 'Monitor',
    primaryColor: '#409EFF',
    isDark: false,
    iconStyle: 'element-plus'
  },
  {
    id: 'deep-green',
    name: '深绿色',
    description: '沉稳商务主题，适合专业环境',
    icon: 'Briefcase',
    primaryColor: '#67C23A',
    isDark: false,
    iconStyle: 'element-plus'
  },
  {
    id: 'light-purple',
    name: '浅紫色',
    description: '优雅时尚主题，适合创意应用',
    icon: 'Star',
    primaryColor: '#9C27B0',
    isDark: false,
    iconStyle: 'element-plus'
  },
  {
    id: 'dark',
    name: '暗黑模式',
    description: '深色护眼主题，适合长时间使用',
    icon: 'Moon',
    primaryColor: '#409EFF',
    isDark: true,
    iconStyle: 'element-plus'
  }
]

// ==================== 配置访问函数 ====================
/**
 * 根据主题获取对应的图标风格（开闭原则实践）
 * 
 * @param theme - 主题类型
 * @returns 图标风格类型
 * 
 * @example
 * const iconStyle = getIconStyleForTheme('tech-blue') // 'element-plus'
 */
export function getIconStyleForTheme(theme: ThemeType): IconStyleType {
  return THEME_ICON_BINDING[theme] || DEFAULT_VALUES.ICON_STYLE
}

/**
 * 根据主题ID获取主题配置
 * 
 * @param themeId - 主题ID
 * @returns 主题配置对象，不存在则返回undefined
 */
export function getThemeConfig(themeId: ThemeType): ThemeConfig | undefined {
  return PRESET_THEMES.find(theme => theme.id === themeId)
}

/**
 * 获取所有可用主题列表
 * 
 * @returns 主题配置数组
 */
export function getAllThemes(): ThemeConfig[] {
  return PRESET_THEMES
}

/**
 * 检查主题是否存在
 * 
 * @param themeId - 主题ID
 * @returns 主题是否存在
 */
export function themeExists(themeId: string): boolean {
  return PRESET_THEMES.some(theme => theme.id === themeId)
}

// ==================== 存储工具函数 ====================
/**
 * 安全地保存配置到LocalStorage（含备份）
 * 
 * @param key - 存储键名
 * @param value - 存储值
 */
export function safeStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
    // 同时保存到备份键
    const backupKey = `${key}-backup`
    localStorage.setItem(backupKey, value)
  } catch (error) {
    console.error(`Failed to save to localStorage: ${key}`, error)
  }
}

/**
 * 安全地从LocalStorage读取配置（含备份恢复）
 * 
 * @param key - 存储键名
 * @param defaultValue - 默认值
 * @returns 存储的值或默认值
 */
export function safeStorageGet(key: string, defaultValue: string): string {
  try {
    // 尝试主存储
    const value = localStorage.getItem(key)
    if (value) return value

    // 尝试备份存储
    const backupKey = `${key}-backup`
    const backupValue = localStorage.getItem(backupKey)
    if (backupValue) {
      // 恢复主存储
      localStorage.setItem(key, backupValue)
      return backupValue
    }

    return defaultValue
  } catch (error) {
    console.error(`Failed to read from localStorage: ${key}`, error)
    return defaultValue
  }
}

// ==================== 类型导出 ====================
export type {
  ThemeType,
  IconStyleType
}

