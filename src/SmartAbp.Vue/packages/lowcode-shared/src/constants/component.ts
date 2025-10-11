/**
 * 组件相关常量
 */

import type { ComponentSize, ComponentVariant } from '../types/index.js'

/**
 * 默认组件尺寸
 */
export const DEFAULT_COMPONENT_SIZE: ComponentSize = 'md'

/**
 * 默认组件变体
 */
export const DEFAULT_COMPONENT_VARIANT: ComponentVariant = 'default'

/**
 * 组件尺寸映射（像素值）
 */
export const COMPONENT_SIZE_MAP: Record<ComponentSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56
}

/**
 * 组件变体颜色映射
 */
export const COMPONENT_VARIANT_COLOR_MAP: Record<ComponentVariant, string> = {
  primary: '#409EFF',
  secondary: '#909399',
  danger: '#F56C6C',
  success: '#67C23A',
  warning: '#E6A23C',
  info: '#909399',
  default: '#606266'
}

/**
 * Z-index层级
 */
export const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 2000,
  POPOVER: 3000,
  TOOLTIP: 4000,
  NOTIFICATION: 5000
} as const

/**
 * 动画持续时间（毫秒）
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
} as const

/**
 * 断点尺寸（响应式）
 */
export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1600
} as const

/**
 * 组件前缀
 */
export const COMPONENT_PREFIX = 'SmartAbp'

/**
 * CSS类名前缀
 */
export const CSS_PREFIX = 'sa-'

/**
 * 数据属性前缀
 */
export const DATA_ATTR_PREFIX = 'data-sa-'
