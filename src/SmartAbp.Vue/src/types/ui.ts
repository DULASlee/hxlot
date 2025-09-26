// 🎨 SmartAbp UI组件类型定义

/**
 * 🖥️ MDI窗口配置接口
 */
export interface MDIWindowConfig {
  id: string
  title: string
  component: string
  props?: Record<string, any>
  size?: {
    width: number
    height: number
  }
  position?: {
    x: number
    y: number
  }
  bounds?: {
    x: number
    y: number
    width: number
    height: number
  }
  resizable?: boolean
  minimizable?: boolean
  maximizable?: boolean
  closable?: boolean
  modal?: boolean
  zIndex?: number
  icon?: string
  state?: WindowState
  draggable?: boolean
  maximized?: boolean
  minimized?: boolean
  permissions?: string[]
  createdAt?: string
}

/**
 * 📂 标签页配置接口
 */
export interface TabConfig {
  id: string
  title: string
  component: string
  props?: Record<string, any>
  icon?: string
  closable?: boolean
  disabled?: boolean
  cached?: boolean
  meta?: Record<string, any>
  active?: boolean
  pinned?: boolean
  state?: TabState
  loading?: boolean
  hasChanges?: boolean
  path?: string
  permissions?: string[]
}

/**
 * 🎭 窗口状态
 */
export type WindowState = 'normal' | 'minimized' | 'maximized' | 'closed'

/**
 * 📱 标签页状态
 */
export type TabState = 'active' | 'inactive' | 'loading' | 'error'
