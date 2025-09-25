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
  resizable?: boolean
  minimizable?: boolean
  maximizable?: boolean
  closable?: boolean
  modal?: boolean
  zIndex?: number
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
}

/**
 * 🎭 窗口状态
 */
export type WindowState = 'normal' | 'minimized' | 'maximized' | 'closed'

/**
 * 📱 标签页状态
 */
export type TabState = 'active' | 'inactive' | 'loading' | 'error'
