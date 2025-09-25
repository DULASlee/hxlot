// 🎯 低代码引擎画布组件类型定义 - 企业级类型安全

/**
 * 🏗️ 画布组件接口
 */
export interface CanvasComponent {
  id: string
  type: string
  name: string
  props: Record<string, any>
  style: CanvasComponentStyle
  children: CanvasComponent[]
}

/**
 * 🎨 组件样式接口
 */
export interface CanvasComponentStyle {
  position: 'absolute' | 'relative' | 'fixed'
  left: string
  top: string
  width: string
  height: string
  zIndex?: number
  transform?: string
  transformOrigin?: string
  [key: string]: any
}

/**
 * 📏 辅助线接口
 */
export interface GuideLine {
  id: string
  type: 'vertical' | 'horizontal'
  style: {
    left?: string
    top?: string
    width?: string
    height?: string
  }
}

/**
 * 📊 历史记录接口
 */
export interface CanvasHistory {
  timestamp: number
  components: CanvasComponent[]
}

/**
 * 🎯 组件模板接口
 */
export interface ComponentTemplate {
  tag: string
  name: string
  props: Record<string, any>
  icon?: string
  category?: string
}

/**
 * 📱 设备类型
 */
export type DeviceType = 'desktop' | 'tablet' | 'mobile'

/**
 * 🎨 画布模式
 */
export type CanvasMode = 'design' | 'preview'

/**
 * 📍 位置接口
 */
export interface Position {
  x: number
  y: number
}

/**
 * 📐 尺寸接口
 */
export interface Size {
  width: number
  height: number
}

/**
 * 🎯 组件类型映射
 */
export type ComponentType = 'el-button' | 'el-input' | 'el-select' | 'el-table' | 'el-card' | 'el-image' | 'el-text' | 'el-divider'

/**
 * 📏 拖拽方向
 */
export type ResizeDirection = 'se' | 'sw' | 'ne' | 'nw'

/**
 * 🎨 移动方向
 */
export type MoveDirection = 'up' | 'down'

/**
 * 🔧 画布属性接口
 */
export interface CanvasProps {
  components?: CanvasComponent[]
  selectedComponentId?: string | null
  hoverComponentId?: string | null
  canvasMode?: CanvasMode
  previewDevice?: DeviceType
  zoomLevel?: number
  showGrid?: boolean
  gridSize?: number
  showRulers?: boolean
  showMinimap?: boolean
}
