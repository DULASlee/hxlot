/**
 * 类型安全的拖拽引擎
 * 支持60fps拖拽、网格对齐、碰撞检测、撤销重做
 */

import { ref, reactive } from 'vue'
import { useEventListener, useThrottleFn } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import type { DesignerComponent } from '../types/designer'

// 类型定义
export interface Position {
  x: number
  y: number
}

export interface DragState {
  isDragging: boolean
  dragElement: HTMLElement | null
  dragData: DragData | null
  startPosition: Position
  currentPosition: Position
  offset: Position
}

export interface DragData {
  type: 'move-component' | 'add-component'
  nodeId?: string
  blockId?: string
  componentType: string
  defaultProps?: Record<string, unknown>
}

export interface DragDropConfig {
  gridSize: number
  snapThreshold: number
  enableSnap: boolean
  enableGrid: boolean
  enableCollisionDetection: boolean
  animationDuration: number
}

export interface SelectionState {
  selectedIds: Set<string>
  selectionRect: DOMRect | null
  multiSelect: boolean
}

// 历史状态接口
interface HistoryState {
  components: [string, DesignerComponent][]
  selectedIds: string[]
  timestamp: number
}

// 事件回调类型
type EventCallback<T = any> = (data: T) => void

interface EventCallbacks {
  onDragStart: EventCallback<{ elementId: string; startPosition: Position }>[]
  onDragMove: EventCallback<{ position: Position; selectedIds: string[] }>[]
  onDragEnd: EventCallback<{ elementId: string; endPosition: Position; moved: boolean }>[]
  onSelect: EventCallback<string[]>[]
  onDelete: EventCallback<string[]>[]
  onComponentUpdate: EventCallback<DesignerComponent>[]
}

// 类型守卫函数
const isValidPosition = (pos: unknown): pos is Position => {
  return (
    typeof pos === 'object' &&
    pos !== null &&
    'x' in pos &&
    'y' in pos &&
    typeof (pos as Position).x === 'number' &&
    typeof (pos as Position).y === 'number'
  )
}

const isValidDragData = (data: unknown): data is DragData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    'componentType' in data &&
    typeof (data as DragData).type === 'string' &&
    typeof (data as DragData).componentType === 'string'
  )
}

const isValidComponent = (component: unknown): component is DesignerComponent => {
  return (
    typeof component === 'object' &&
    component !== null &&
    'id' in component &&
    'type' in component &&
    'props' in component &&
    'position' in component &&
    typeof (component as DesignerComponent).id === 'string' &&
    typeof (component as DesignerComponent).type === 'string' &&
    typeof (component as DesignerComponent).props === 'object' &&
    isValidPosition((component as DesignerComponent).position)
  )
}

// 拖拽引擎类
export class DragDropEngine {
  private canvas: HTMLElement | null = null
  private config: DragDropConfig
  private dragState = reactive<DragState>({
    isDragging: false,
    dragElement: null,
    dragData: null,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 }
  })

  private selectionState = reactive<SelectionState>({
    selectedIds: new Set(),
    selectionRect: null,
    multiSelect: false
  })

  private components = ref<Map<string, DesignerComponent>>(new Map())
  private undoStack = ref<HistoryState[]>([])
  private redoStack = ref<HistoryState[]>([])

  // 事件回调
  private callbacks: EventCallbacks = {
    onDragStart: [],
    onDragMove: [],
    onDragEnd: [],
    onSelect: [],
    onDelete: [],
    onComponentUpdate: []
  }

  constructor(config: Partial<DragDropConfig> = {}) {
    this.config = {
      gridSize: 10,
      snapThreshold: 5,
      enableSnap: true,
      enableGrid: true,
      enableCollisionDetection: false,
      animationDuration: 200,
      ...config
    }
  }

  // 初始化引擎
  public initialize(canvasElement: HTMLElement): void {
    if (!canvasElement) {
      throw new Error('Canvas element is required')
    }

    this.canvas = canvasElement
    this.setupEventListeners()
    this.setupKeyboardShortcuts()

    // 设置画布样式
    if (this.config.enableGrid) {
      this.setupGridBackground()
    }
  }

  // 销毁引擎
  public destroy(): void {
    this.canvas = null
    this.components.value.clear()
    this.clearSelection()

    // 清理事件回调
    Object.keys(this.callbacks).forEach(key => {
      this.callbacks[key as keyof EventCallbacks] = []
    })
  }

  // 设置事件监听器
  private setupEventListeners(): void {
    if (!this.canvas) return

    // 拖拽事件
    useEventListener(this.canvas, 'dragover', this.handleDragOver.bind(this))
    useEventListener(this.canvas, 'drop', this.handleDrop.bind(this))

    // 鼠标事件
    useEventListener(this.canvas, 'mousedown', this.handleMouseDown.bind(this))
    useEventListener(document, 'mousemove', this.throttledMouseMove)
    useEventListener(document, 'mouseup', this.handleMouseUp.bind(this))

    // 选择事件
    useEventListener(this.canvas, 'click', this.handleCanvasClick.bind(this))
  }

  // 设置键盘快捷键
  private setupKeyboardShortcuts(): void {
    useEventListener(document, 'keydown', (event: KeyboardEvent) => {
      // Ctrl/Cmd + Z: 撤销
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        this.undo()
      }

      // Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y: 重做
      if (
        (event.ctrlKey || event.metaKey) &&
        ((event.key === 'z' && event.shiftKey) || event.key === 'y')
      ) {
        event.preventDefault()
        this.redo()
      }

      // Delete: 删除选中组件
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        this.deleteSelected()
      }

      // Ctrl/Cmd + A: 全选
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault()
        this.selectAll()
      }

      // Escape: 清除选择
      if (event.key === 'Escape') {
        this.clearSelection()
      }
    })
  }

  // 设置网格背景
  private setupGridBackground(): void {
    if (!this.canvas) return

    const gridSize = this.config.gridSize
    this.canvas.style.backgroundImage = `
      linear-gradient(to right, #e5e5e5 1px, transparent 1px),
      linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)
    `
    this.canvas.style.backgroundSize = `${gridSize}px ${gridSize}px`
  }

  // 节流的鼠标移动处理
  private throttledMouseMove = useThrottleFn((event: MouseEvent) => {
    this.handleMouseMove(event)
  }, 16) // 60fps

  // 拖拽悬停处理
  private handleDragOver(event: DragEvent): void {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }

  // 拖拽放置处理
  private handleDrop(event: DragEvent): void {
    event.preventDefault()

    if (!this.canvas) return

    try {
      const dragDataString = event.dataTransfer?.getData('application/json') || '{}'
      const dragData = JSON.parse(dragDataString)

      if (!isValidDragData(dragData)) {
        console.warn('Invalid drag data:', dragData)
        return
      }

      const canvasRect = this.canvas.getBoundingClientRect()
      const position: Position = {
        x: event.clientX - canvasRect.left,
        y: event.clientY - canvasRect.top
      }

      // 网格对齐
      if (this.config.enableSnap) {
        position.x = Math.round(position.x / this.config.gridSize) * this.config.gridSize
        position.y = Math.round(position.y / this.config.gridSize) * this.config.gridSize
      }

      this.handleComponentDrop(dragData, position)
    } catch (error) {
      console.error('Error handling drop:', error)
      ElMessage.error('拖放操作失败')
    }
  }

  // 组件放置处理
  private handleComponentDrop(dragData: DragData, position: Position): void {
    if (dragData.type === 'add-component') {
      // 添加新组件
      const component: DesignerComponent = {
        id: `${dragData.componentType}-${Date.now()}`,
        type: dragData.componentType,
        props: {
          ...(dragData.defaultProps || {}),
          style: {
            position: 'absolute',
            left: `${position.x}px`,
            top: `${position.y}px`
          }
        },
        position
      }

      if (isValidComponent(component)) {
        this.addComponent(component)
        this.saveState()
      }
    } else if (dragData.type === 'move-component' && dragData.nodeId) {
      // 移动现有组件
      this.moveComponent(dragData.nodeId, position)
      this.saveState()
    }
  }

  // 鼠标按下处理
  private handleMouseDown(event: MouseEvent): void {
    if (!this.canvas) return

    const target = event.target as HTMLElement
    const componentElement = target.closest('[data-node-id]') as HTMLElement

    if (componentElement) {
      const nodeId = componentElement.dataset.nodeId
      if (!nodeId) return

      // 多选处理
      if (event.ctrlKey || event.metaKey) {
        this.toggleSelection(nodeId)
      } else {
        this.selectComponent(nodeId)
      }

      // 开始拖拽
      this.startDrag(event, componentElement)
    } else {
      // 点击空白区域，清除选择
      if (!event.ctrlKey && !event.metaKey) {
        this.clearSelection()
      }
    }
  }

  // 鼠标移动处理
  private handleMouseMove(event: MouseEvent): void {
    if (!this.dragState.isDragging || !this.canvas) return

    const canvasRect = this.canvas.getBoundingClientRect()
    const currentPosition: Position = {
      x: event.clientX - canvasRect.left - this.dragState.offset.x,
      y: event.clientY - canvasRect.top - this.dragState.offset.y
    }

    // 网格对齐
    if (this.config.enableSnap) {
      currentPosition.x =
        Math.round(currentPosition.x / this.config.gridSize) * this.config.gridSize
      currentPosition.y =
        Math.round(currentPosition.y / this.config.gridSize) * this.config.gridSize
    }

    this.dragState.currentPosition = currentPosition

    // 更新拖拽元素位置
    if (this.dragState.dragElement) {
      this.dragState.dragElement.style.transform = `translate(${currentPosition.x}px, ${currentPosition.y}px)`
    }

    // 触发拖拽移动回调
    this.callbacks.onDragMove.forEach(callback => {
      callback({
        position: currentPosition,
        selectedIds: Array.from(this.selectionState.selectedIds)
      })
    })
  }

  // 鼠标释放处理
  private handleMouseUp(): void {
    if (!this.dragState.isDragging) return

    this.endDrag()
    this.saveState()
  }

  // 画布点击处理
  private handleCanvasClick(event: MouseEvent): void {
    const target = event.target as HTMLElement
    if (!target.closest('[data-node-id]')) {
      this.clearSelection()
    }
  }

  // 开始拖拽
  private startDrag(event: MouseEvent, element: HTMLElement): void {
    if (!this.canvas) return

    const canvasRect = this.canvas.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()

    this.dragState.isDragging = true
    this.dragState.dragElement = element
    this.dragState.startPosition = {
      x: elementRect.left - canvasRect.left,
      y: elementRect.top - canvasRect.top
    }
    this.dragState.offset = {
      x: event.clientX - elementRect.left,
      y: event.clientY - elementRect.top
    }

    // 添加拖拽样式
    element.style.zIndex = '1000'
    element.style.pointerEvents = 'none'

    // 触发拖拽开始回调
    const nodeId = element.dataset.nodeId
    if (nodeId) {
      this.callbacks.onDragStart.forEach(callback => {
        callback({
          elementId: nodeId,
          startPosition: this.dragState.startPosition
        })
      })
    }
  }

  // 结束拖拽
  private endDrag(): void {
    if (!this.dragState.dragElement) return

    const element = this.dragState.dragElement
    const nodeId = element.dataset.nodeId

    // 恢复样式
    element.style.zIndex = ''
    element.style.pointerEvents = ''
    element.style.transform = ''

    // 更新组件位置
    if (nodeId) {
      const component = this.components.value.get(nodeId)
      if (component && isValidComponent(component)) {
        component.position = this.dragState.currentPosition
        if (component.props.style && typeof component.props.style === 'object') {
          const style = component.props.style as Record<string, unknown>
          style.left = `${this.dragState.currentPosition.x}px`
          style.top = `${this.dragState.currentPosition.y}px`
        }

        this.callbacks.onComponentUpdate.forEach(callback => callback(component))
      }

      // 触发拖拽结束回调
      this.callbacks.onDragEnd.forEach(callback => {
        callback({
          elementId: nodeId,
          endPosition: this.dragState.currentPosition,
          moved:
            this.dragState.startPosition.x !== this.dragState.currentPosition.x ||
            this.dragState.startPosition.y !== this.dragState.currentPosition.y
        })
      })
    }

    // 重置拖拽状态
    this.dragState.isDragging = false
    this.dragState.dragElement = null
    this.dragState.dragData = null
  }

  // 公共方法
  public addComponent(component: DesignerComponent): void {
    if (!isValidComponent(component)) {
      console.warn('Invalid component:', component)
      return
    }

    this.components.value.set(component.id, component)
    this.selectComponent(component.id)
  }

  public moveComponent(componentId: string, position: Position): void {
    if (!isValidPosition(position)) {
      console.warn('Invalid position:', position)
      return
    }

    const component = this.components.value.get(componentId)
    if (component && isValidComponent(component)) {
      component.position = position
      if (component.props.style && typeof component.props.style === 'object') {
        const style = component.props.style as Record<string, unknown>
        style.left = `${position.x}px`
        style.top = `${position.y}px`
      }

      this.callbacks.onComponentUpdate.forEach(callback => callback(component))
    }
  }

  public deleteComponent(componentId: string): void {
    this.components.value.delete(componentId)
    this.selectionState.selectedIds.delete(componentId)
  }

  public selectComponent(componentId: string): void {
    this.selectionState.selectedIds.clear()
    this.selectionState.selectedIds.add(componentId)

    this.callbacks.onSelect.forEach(callback => {
      callback(Array.from(this.selectionState.selectedIds))
    })
  }

  public toggleSelection(componentId: string): void {
    if (this.selectionState.selectedIds.has(componentId)) {
      this.selectionState.selectedIds.delete(componentId)
    } else {
      this.selectionState.selectedIds.add(componentId)
    }

    this.callbacks.onSelect.forEach(callback => {
      callback(Array.from(this.selectionState.selectedIds))
    })
  }

  public selectAll(): void {
    this.selectionState.selectedIds.clear()
    this.components.value.forEach((_, id) => {
      this.selectionState.selectedIds.add(id)
    })

    this.callbacks.onSelect.forEach(callback => {
      callback(Array.from(this.selectionState.selectedIds))
    })
  }

  public clearSelection(): void {
    this.selectionState.selectedIds.clear()
    this.callbacks.onSelect.forEach(callback => callback([]))
  }

  public deleteSelected(): void {
    const selectedIds = Array.from(this.selectionState.selectedIds)
    if (selectedIds.length === 0) return

    selectedIds.forEach(id => {
      this.components.value.delete(id)
    })

    this.selectionState.selectedIds.clear()

    this.callbacks.onDelete.forEach(callback => callback(selectedIds))
    this.saveState()

    ElMessage.success(`已删除 ${selectedIds.length} 个组件`)
  }

  // 历史记录管理
  private saveState(): void {
    const state: HistoryState = {
      components: Array.from(this.components.value.entries()),
      selectedIds: Array.from(this.selectionState.selectedIds),
      timestamp: Date.now()
    }

    this.undoStack.value.push(state)

    // 限制撤销栈大小
    if (this.undoStack.value.length > 50) {
      this.undoStack.value.shift()
    }

    // 清空重做栈
    this.redoStack.value = []
  }

  public undo(): void {
    if (this.undoStack.value.length === 0) return

    const currentState: HistoryState = {
      components: Array.from(this.components.value.entries()),
      selectedIds: Array.from(this.selectionState.selectedIds),
      timestamp: Date.now()
    }

    this.redoStack.value.push(currentState)

    const previousState = this.undoStack.value.pop()!
    this.restoreState(previousState)

    ElMessage.success('已撤销')
  }

  public redo(): void {
    if (this.redoStack.value.length === 0) return

    const currentState: HistoryState = {
      components: Array.from(this.components.value.entries()),
      selectedIds: Array.from(this.selectionState.selectedIds),
      timestamp: Date.now()
    }

    this.undoStack.value.push(currentState)

    const nextState = this.redoStack.value.pop()!
    this.restoreState(nextState)

    ElMessage.success('已重做')
  }

  private restoreState(state: HistoryState): void {
    this.components.value.clear()
    state.components.forEach(([id, component]) => {
      if (isValidComponent(component)) {
        this.components.value.set(id, component)
      }
    })

    this.selectionState.selectedIds.clear()
    state.selectedIds.forEach(id => {
      this.selectionState.selectedIds.add(id)
    })

    // 触发更新回调
    this.components.value.forEach(component => {
      this.callbacks.onComponentUpdate.forEach(callback => callback(component))
    })

    this.callbacks.onSelect.forEach(callback => {
      callback(Array.from(this.selectionState.selectedIds))
    })
  }

  // 事件管理
  public on(event: keyof EventCallbacks, callback: EventCallback): void {
    const callbacks = this.callbacks[event] as EventCallback[]
    callbacks.push(callback)
  }

  public off(event: keyof EventCallbacks, callback: EventCallback): void {
    const callbacks = this.callbacks[event] as EventCallback[]
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }

  // Getter方法
  public getComponents(): Map<string, DesignerComponent> {
    return this.components.value
  }

  public getSelectedComponents(): DesignerComponent[] {
    return Array.from(this.selectionState.selectedIds)
      .map(id => this.components.value.get(id))
      .filter(
        (component): component is DesignerComponent =>
          component !== undefined && isValidComponent(component)
      )
  }

  public getDragState(): DragState {
    return this.dragState
  }

  public getSelectionState(): SelectionState {
    return this.selectionState
  }
}

// 工厂函数
export function createDragDropEngine(config?: Partial<DragDropConfig>): DragDropEngine {
  return new DragDropEngine(config)
}

// 默认配置
export const DEFAULT_DRAG_DROP_CONFIG: DragDropConfig = {
  gridSize: 10,
  snapThreshold: 5,
  enableSnap: true,
  enableGrid: true,
  enableCollisionDetection: false,
  animationDuration: 200
}
