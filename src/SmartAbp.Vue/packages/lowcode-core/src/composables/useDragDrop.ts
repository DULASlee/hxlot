import { ref, reactive, computed, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

export interface DragData {
  /** 拖拽项类型 */
  type: string
  /** 拖拽项数据 */
  data: any
  /** 拖拽项ID */
  id: string
  /** 拖拽项名称 */
  name: string
  /** 拖拽项图标 */
  icon?: string
  /** 拖拽项描述 */
  description?: string
}

/**
 * 放置区域配置接口
 */
export interface DropZoneConfig {
  /** 放置区域ID */
  id: string
  /** 放置区域名称 */
  name: string
  /** 接受的拖拽类型 */
  acceptedTypes: string[]
  /** 放置区域元素 */
  element: HTMLElement
  /** 是否允许多个放置 */
  allowMultiple?: boolean
  /** 最大放置数量 */
  maxItems?: number
  /** 放置回调函数 */
  onDrop?: (data: DragData, zone: DropZoneConfig) => void
  /** 进入放置区域回调 */
  onEnter?: (data: DragData, zone: DropZoneConfig) => void
  /** 离开放置区域回调 */
  onLeave?: (data: DragData, zone: DropZoneConfig) => void
}

/**
 * 拖拽状态接口
 */
export interface DragState {
  /** 是否正在拖拽 */
  isDragging: boolean
  /** 当前拖拽的数据 */
  dragData: DragData | null
  /** 当前拖拽的元素 */
  dragElement: HTMLElement | null
  /** 拖拽开始位置 */
  startPosition: { x: number; y: number }
  /** 当前拖拽位置 */
  currentPosition: { x: number; y: number }
  /** 拖拽偏移量 */
  offset: { x: number; y: number }
  /** 有效的放置区域 */
  validDropZones: DropZoneConfig[]
  /** 当前悬停的放置区域 */
  currentDropZone: DropZoneConfig | null
  /** 拖拽预览元素 */
  dragPreview: HTMLElement | null
}

/**
 * 拖拽功能组合式函数
 */
export function useDragDrop() {
  // 拖拽状态
  const dragState = reactive<DragState>({
    isDragging: false,
    dragData: null,
    dragElement: null,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    validDropZones: [],
    currentDropZone: null,
    dragPreview: null,
  })
  
  // 放置区域映射表
  const dropZones = ref<Map<string, DropZoneConfig>>(new Map())
  
  // 是否正在拖拽
  const isDragging = computed(() => dragState.isDragging)
  
  // 当前拖拽的数据
  const currentDragData = computed(() => dragState.dragData)
  
  // 当前悬停的放置区域
  const currentDropZone = computed(() => dragState.currentDropZone)
  
  // 拖拽预览样式
  const dragPreviewStyle = computed(() => {
    if (!dragState.isDragging || !dragState.dragPreview) return {}
    
    return {
      position: 'fixed' as const,
      left: `${dragState.currentPosition.x + dragState.offset.x}px`,
      top: `${dragState.currentPosition.y + dragState.offset.y}px`,
      zIndex: 9999,
      pointerEvents: 'none' as const,
      transform: 'translate(-50%, -50%)',
      opacity: 0.8,
    }
  })
  
  /**
   * 开始拖拽
   */
  const startDrag = (event: DragEvent, data: DragData, element?: HTMLElement): void => {
    try {
      // 验证参数
      if (!event) {
        throw new Error('Drag event is required')
      }

      if (!data || typeof data !== 'object') {
        throw new Error('Drag data must be a valid object')
      }

      if (!data.type?.trim()) {
        throw new Error('Drag data type is required')
      }

      if (!data.id?.trim()) {
        throw new Error('Drag data ID is required')
      }

      if (!data.name?.trim()) {
        throw new Error('Drag data name is required')
      }

      // 设置拖拽数据
      dragState.isDragging = true
      dragState.dragData = data
      dragState.dragElement = element || (event.target as HTMLElement)
      
      // 记录起始位置
      dragState.startPosition = { x: event.clientX, y: event.clientY }
      dragState.currentPosition = { x: event.clientX, y: event.clientY }
      
      // 计算偏移量（相对于元素中心）
      if (dragState.dragElement) {
        const rect = dragState.dragElement.getBoundingClientRect()
        dragState.offset = {
          x: rect.width / 2,
          y: rect.height / 2
        }
      }
      
      // 设置拖拽效果
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', JSON.stringify(data))
        
        // 创建拖拽预览
        createDragPreview(data)
        if (dragState.dragPreview && event.dataTransfer.setDragImage) {
          event.dataTransfer.setDragImage(dragState.dragPreview, dragState.offset.x, dragState.offset.y)
        }
      }
      
      // 查找有效的放置区域
      updateValidDropZones(data)
      
      // 添加全局事件监听器
      document.addEventListener('dragover', handleDragOver)
      document.addEventListener('drop', handleDrop)
      document.addEventListener('dragend', endDrag)
      
      console.log(`🖱️ Started dragging: ${data.name} (${data.type})`)
      
      ElMessage.info({
        message: `Dragging: ${data.name}`,
        duration: 2000,
      })
    } catch (error) {
      console.error(`[startDrag] 开始拖拽失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to start drag: ${errorMessage}`,
        duration: 3000,
      })

      // 清理拖拽状态
      cleanupDragState()

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to start drag: ${errorMessage}`)
    }
  }
  
  /**
   * 结束拖拽
   */
  const endDrag = (event?: DragEvent): void => {
    try {
      if (!dragState.isDragging) {
        return
      }
      
      console.log(`🖱️ Ended dragging: ${dragState.dragData?.name}`)
      
      // 移除全局事件监听器
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
      document.removeEventListener('dragend', endDrag)
      
      // 清理拖拽状态
      cleanupDragState()
      
      ElMessage.success({
        message: 'Drag operation completed',
        duration: 2000,
      })
    } catch (error) {
      console.error(`[endDrag] 结束拖拽失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to end drag: ${errorMessage}`,
        duration: 3000,
      })

      // 确保清理拖拽状态
      cleanupDragState()

      // 不抛出错误，避免影响主流程
    }
  }
  
  /**
   * 处理拖拽悬停
   */
  const handleDragOver = (event: DragEvent): void => {
    try {
      if (!dragState.isDragging || !dragState.dragData) {
        return
      }
      
      // 阻止默认行为
      event.preventDefault()
      
      // 更新当前位置
      dragState.currentPosition = { x: event.clientX, y: event.clientY }
      
      // 查找当前悬停的放置区域
      const dropZone = findDropZoneAtPosition(event.clientX, event.clientY)
      
      // 更新当前放置区域
      if (dropZone !== dragState.currentDropZone) {
        // 离开之前的放置区域
        if (dragState.currentDropZone && dragState.currentDropZone.onLeave) {
          try {
            dragState.currentDropZone.onLeave(dragState.dragData, dragState.currentDropZone)
          } catch (callbackError) {
            console.error(`[handleDragOver] 调用onLeave回调失败:`, callbackError)
          }
        }
        
        // 进入新的放置区域
        if (dropZone && dropZone.onEnter) {
          try {
            dropZone.onEnter(dragState.dragData, dropZone)
          } catch (callbackError) {
            console.error(`[handleDragOver] 调用onEnter回调失败:`, callbackError)
          }
        }
        
        dragState.currentDropZone = dropZone
      }
      
      // 设置拖拽效果
      if (event.dataTransfer) {
        if (dropZone) {
          event.dataTransfer.dropEffect = 'move'
        } else {
          event.dataTransfer.dropEffect = 'none'
        }
      }
    } catch (error) {
      console.error(`[handleDragOver] 处理拖拽悬停失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to handle drag over: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响拖拽流程
    }
  }
  
  /**
   * 处理放置
   */
  const handleDrop = (event: DragEvent): void => {
    try {
      if (!dragState.isDragging || !dragState.dragData) {
        return
      }
      
      // 阻止默认行为
      event.preventDefault()
      
      // 查找放置区域
      const dropZone = findDropZoneAtPosition(event.clientX, event.clientY)
      
      if (dropZone && dropZone.onDrop) {
        // 验证放置
        if (validateDrop(dragState.dragData, dropZone)) {
          try {
            // 执行放置操作
            dropZone.onDrop(dragState.dragData, dropZone)
            
            console.log(`📦 Dropped ${dragState.dragData.name} into ${dropZone.name}`)
            
            ElMessage.success({
              message: `Dropped ${dragState.dragData.name} into ${dropZone.name}`,
              duration: 3000,
            })
          } catch (dropError) {
            console.error(`[handleDrop] 放置操作失败:`, dropError)
            
            const errorMessage = dropError instanceof Error ? dropError.message : String(dropError)
            
            ElMessage.error({
              message: `Drop operation failed: ${errorMessage}`,
              duration: 4000,
            })
          }
        } else {
          console.warn(`🚫 Invalid drop: ${dragState.dragData.name} into ${dropZone.name}`)
          
          ElMessage.warning({
            message: `Cannot drop ${dragState.dragData.name} here`,
            duration: 3000,
          })
        }
      }
      
      // 结束拖拽
      endDrag(event)
    } catch (error) {
      console.error(`[handleDrop] 处理放置失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to handle drop: ${errorMessage}`,
        duration: 3000,
      })

      // 确保结束拖拽
      endDrag(event)

      // 不抛出错误，避免影响主流程
    }
  }
  
  /**
   * 注册放置区域
   */
  const registerDropZone = (config: DropZoneConfig): void => {
    try {
      // 验证参数
      if (!config || typeof config !== 'object') {
        throw new Error('Drop zone config must be a valid object')
      }

      if (!config.id?.trim()) {
        throw new Error('Drop zone ID is required')
      }

      if (!config.name?.trim()) {
        throw new Error('Drop zone name is required')
      }

      if (!config.element) {
        throw new Error('Drop zone element is required')
      }

      if (!Array.isArray(config.acceptedTypes)) {
        throw new Error('Accepted types must be an array')
      }

      if (config.acceptedTypes.length === 0) {
        throw new Error('Accepted types array cannot be empty')
      }

      // 验证元素是否有效
      if (!document.body.contains(config.element)) {
        throw new Error('Drop zone element must be attached to DOM')
      }

      // 注册放置区域
      dropZones.value.set(config.id, config)
      
      // 添加放置区域事件监听器
      config.element.addEventListener('dragover', handleDragOver)
      config.element.addEventListener('drop', handleDrop)
      config.element.addEventListener('dragleave', handleDragLeave)
      
      console.log(`📍 Registered drop zone: ${config.name} (${config.id})`)
      
      ElMessage.success({
        message: `Drop zone registered: ${config.name}`,
        duration: 2000,
      })
    } catch (error) {
      console.error(`[registerDropZone] 注册放置区域失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to register drop zone: ${errorMessage}`,
        duration: 4000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to register drop zone: ${errorMessage}`)
    }
  }
  
  /**
   * 注销放置区域
   */
  const unregisterDropZone = (zoneId: string): void => {
    try {
      // 验证参数
      if (!zoneId?.trim()) {
        throw new Error('Drop zone ID is required')
      }

      const config = dropZones.value.get(zoneId)
      if (!config) {
        console.warn(`Drop zone not found: ${zoneId}`)
        return
      }
      
      // 移除事件监听器
      config.element.removeEventListener('dragover', handleDragOver)
      config.element.removeEventListener('drop', handleDrop)
      config.element.removeEventListener('dragleave', handleDragLeave)
      
      // 从映射表中删除
      dropZones.value.delete(zoneId)
      
      // 如果当前悬停在这个放置区域，清除它
      if (dragState.currentDropZone?.id === zoneId) {
        dragState.currentDropZone = null
      }
      
      console.log(`🗑️ Unregistered drop zone: ${config.name} (${zoneId})`)
      
      ElMessage.info({
        message: `Drop zone unregistered: ${config.name}`,
        duration: 2000,
      })
    } catch (error) {
      console.error(`[unregisterDropZone] 注销放置区域失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to unregister drop zone: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响主流程
    }
  }
  
  /**
   * 创建拖拽预览
   */
  const createDragPreview = (data: DragData): void => {
    try {
      // 验证参数
      if (!data || typeof data !== 'object') {
        throw new Error('Drag data must be a valid object')
      }

      // 清理之前的预览
      if (dragState.dragPreview) {
        document.body.removeChild(dragState.dragPreview)
        dragState.dragPreview = null
      }
      
      // 创建预览元素
      const preview = document.createElement('div')
      preview.className = 'drag-preview'
      preview.style.cssText = `
        position: fixed;
        top: -1000px;
        left: -1000px;
        background: #409EFF;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        pointer-events: none;
        z-index: 9999;
      `
      
      // 设置预览内容
      const icon = data.icon ? `<i class="${data.icon}"></i> ` : ''
      const description = data.description ? `<br><small>${data.description}</small>` : ''
      preview.innerHTML = `${icon}<strong>${data.name}</strong>${description}`
      
      // 添加到DOM
      document.body.appendChild(preview)
      dragState.dragPreview = preview
      
      console.log(`🎨 Created drag preview for: ${data.name}`)
    } catch (error) {
      console.error(`[createDragPreview] 创建拖拽预览失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to create drag preview: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响拖拽流程
    }
  }
  
  /**
   * 验证放置
   */
  const validateDrop = (data: DragData, zone: DropZoneConfig): boolean => {
    try {
      // 验证参数
      if (!data || typeof data !== 'object') {
        console.warn('Invalid drag data for validation')
        return false
      }

      if (!zone || typeof zone !== 'object') {
        console.warn('Invalid drop zone for validation')
        return false
      }

      // 检查类型是否匹配
      if (!zone.acceptedTypes.includes(data.type)) {
        console.warn(`Type mismatch: ${data.type} not in ${zone.acceptedTypes.join(', ')}`)
        return false
      }
      
      // 检查数量限制
      if (zone.maxItems !== undefined && zone.maxItems > 0) {
        // 这里需要具体的实现来计算当前放置的项目数量
        console.log(`Checking max items limit: ${zone.maxItems}`)
      }
      
      return true
    } catch (error) {
      console.error(`[validateDrop] 验证放置失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to validate drop: ${errorMessage}`,
        duration: 3000,
      })

      // 回退到false，拒绝放置
      return false
    }
  }
  
  /**
   * 获取放置区域
   */
  const getDropZones = (): DropZoneConfig[] => {
    try {
      return Array.from(dropZones.value.values())
    } catch (error) {
      console.error(`[getDropZones] 获取放置区域失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to get drop zones: ${errorMessage}`,
        duration: 3000,
      })

      // 回退到空数组
      return []
    }
  }
  
  /**
   * 查找位置处的放置区域
   */
  const findDropZoneAtPosition = (x: number, y: number): DropZoneConfig | null => {
    try {
      // 验证参数
      if (typeof x !== 'number' || typeof y !== 'number') {
        console.warn('Invalid coordinates for drop zone detection')
        return null
      }

      for (const zone of dropZones.value.values()) {
        const rect = zone.element.getBoundingClientRect()
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          return zone
        }
      }
      return null
    } catch (error) {
      console.error(`[findDropZoneAtPosition] 查找放置区域失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to find drop zone at position: ${errorMessage}`,
        duration: 3000,
      })

      // 回退到null
      return null
    }
  }
  
  /**
   * 更新有效放置区域
   */
  const updateValidDropZones = (data: DragData): void => {
    try {
      // 验证参数
      if (!data || typeof data !== 'object') {
        throw new Error('Drag data must be a valid object')
      }

      if (!data.type?.trim()) {
        throw new Error('Drag data type is required')
      }

      dragState.validDropZones = Array.from(dropZones.value.values()).filter(zone => {
        try {
          return validateDrop(data, zone)
        } catch (validationError) {
          console.error(`[updateValidDropZones] 验证放置区域失败:`, validationError)
          return false
        }
      })
      
      console.log(`🎯 Found ${dragState.validDropZones.length} valid drop zones for type: ${data.type}`)
    } catch (error) {
      console.error(`[updateValidDropZones] 更新有效放置区域失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to update valid drop zones: ${errorMessage}`,
        duration: 3000,
      })

      // 回退到空数组
      dragState.validDropZones = []
    }
  }
  
  /**
   * 更新放置区域位置
   */
  const updateDropZonePosition = (zoneId: string): void => {
    try {
      // 验证参数
      if (!zoneId?.trim()) {
        throw new Error('Drop zone ID is required')
      }

      const zone = dropZones.value.get(zoneId)
      if (!zone) {
        console.warn(`Drop zone not found: ${zoneId}`)
        return
      }
      
      // 更新位置信息（主要用于调试和日志）
      const rect = zone.element.getBoundingClientRect()
      console.log(`📍 Updated position for drop zone ${zone.name}: (${rect.left}, ${rect.top}) - (${rect.right}, ${rect.bottom})`)
    } catch (error) {
      console.error(`[updateDropZonePosition] 更新放置区域位置失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to update drop zone position: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响主流程
    }
  }
  
  /**
   * 处理拖拽离开
   */
  const handleDragLeave = (event: DragEvent): void => {
    try {
      if (!dragState.isDragging) {
        return
      }
      
      // 检查是否真的离开了放置区域
      const dropZone = findDropZoneAtPosition(event.clientX, event.clientY)
      if (!dropZone && dragState.currentDropZone) {
        // 离开放置区域
        if (dragState.currentDropZone.onLeave && dragState.dragData) {
          try {
            dragState.currentDropZone.onLeave(dragState.dragData, dragState.currentDropZone)
          } catch (callbackError) {
            console.error(`[handleDragLeave] 调用onLeave回调失败:`, callbackError)
          }
        }
        
        dragState.currentDropZone = null
        
        console.log(`🚪 Left drop zone`)
      }
    } catch (error) {
      console.error(`[handleDragLeave] 处理拖拽离开失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to handle drag leave: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响拖拽流程
    }
  }
  
  /**
   * 清理拖拽状态
   */
  const cleanupDragState = (): void => {
    try {
      dragState.isDragging = false
      dragState.dragData = null
      dragState.dragElement = null
      dragState.currentDropZone = null
      dragState.validDropZones = []
      
      // 清理拖拽预览
      if (dragState.dragPreview) {
        document.body.removeChild(dragState.dragPreview)
        dragState.dragPreview = null
      }
      
      console.log(`🧹 Cleaned up drag state`)
    } catch (error) {
      console.error(`[cleanupDragState] 清理拖拽状态失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to cleanup drag state: ${errorMessage}`,
        duration: 3000,
      })

      // 强制重置状态
      dragState.isDragging = false
      dragState.dragData = null
      dragState.dragElement = null
      dragState.currentDropZone = null
      dragState.validDropZones = []
      dragState.dragPreview = null

      // 不抛出错误，避免影响清理流程
    }
  }
  
  /**
   * 清理所有资源
   */
  const cleanup = (): void => {
    try {
      console.log(`🧹 Cleaning up useDragDrop`)
      
      // 结束当前拖拽
      if (dragState.isDragging) {
        endDrag()
      }
      
      // 注销所有放置区域
      const zoneIds = Array.from(dropZones.value.keys())
      for (const zoneId of zoneIds) {
        unregisterDropZone(zoneId)
      }
      
      // 清理拖拽状态
      cleanupDragState()
      
      ElMessage.info({
        message: 'Drag and drop system cleaned up',
        duration: 2000,
      })
    } catch (error) {
      console.error(`[cleanup] 清理资源失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to cleanup drag and drop system: ${errorMessage}`,
        duration: 3000,
      })

      // 强制清理
      dragState.isDragging = false
      dragState.dragData = null
      dragState.dragElement = null
      dragState.currentDropZone = null
      dragState.validDropZones = []
      dragState.dragPreview = null
      dropZones.value.clear()

      // 不抛出错误，避免影响清理流程
    }
  }
  
  /**
   * 组件卸载时清理资源
   */
  onUnmounted(() => {
    try {
      cleanup()
    } catch (error) {
      console.error(`[onUnmounted] 清理资源失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to cleanup resources: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响卸载流程
    }
  })
  
  return {
    // 状态
    dragState,
    isDragging,
    currentDragData,
    currentDropZone,
    dragPreviewStyle,
    dropZones,
    
    // 方法
    startDrag,
    endDrag,
    registerDropZone,
    unregisterDropZone,
    validateDrop,
    getDropZones,
    updateDropZonePosition,
    cleanup,
  }
}
