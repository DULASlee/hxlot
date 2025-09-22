import { ref, reactive, computed, onUnmounted, nextTick } from 'vue'
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
 * 错误信息接口
 */
interface DragDropError {
  code: string
  message: string
  details?: any
  timestamp: number
}

/**
 * 配置选项接口
 */
interface DragDropConfig {
  enableDebounce?: boolean
  debounceDelay?: number
  enableMemoryProtection?: boolean
  maxRetries?: number
  enablePerformanceMonitoring?: boolean
}

/**
 * 性能监控数据
 */
interface PerformanceMetrics {
  dragOperations: number
  dropOperations: number
  validationFailures: number
  averageDragDuration: number
  lastOperationTime: number
}

/**
 * 拖拽功能组合式函数
 */
export function useDragDrop(config: DragDropConfig = {}) {
  // 配置选项
  const options = {
    enableDebounce: config.enableDebounce ?? true,
    debounceDelay: config.debounceDelay ?? 16, // ~60fps
    enableMemoryProtection: config.enableMemoryProtection ?? true,
    maxRetries: config.maxRetries ?? 3,
    enablePerformanceMonitoring: config.enablePerformanceMonitoring ?? false
  }

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
  
  // 错误日志
  const errorLog = ref<DragDropError[]>([])
  
  // 性能监控
  const performanceMetrics = reactive<PerformanceMetrics>({
    dragOperations: 0,
    dropOperations: 0,
    validationFailures: 0,
    averageDragDuration: 0,
    lastOperationTime: 0
  })
  
  // 防抖定时器
  let debounceTimer: number | null = null
  let dragStartTime: number = 0
  
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
   * 记录错误信息
   */
  const logError = (code: string, message: string, details?: any): void => {
    const error: DragDropError = {
      code,
      message,
      details,
      timestamp: Date.now()
    }
    
    errorLog.value.push(error)
    
    // 限制错误日志数量，防止内存泄漏
    if (options.enableMemoryProtection && errorLog.value.length > 100) {
      errorLog.value = errorLog.value.slice(-50)
    }
    
    console.error(`[useDragDrop] ${code}: ${message}`, details)
  }

  /**
   * 防抖函数
   */
  const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): T => {
    return ((...args: Parameters<T>) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      
      debounceTimer = window.setTimeout(() => {
        func(...args)
      }, delay)
    }) as T
  }

  /**
   * 验证拖拽数据
   */
  const validateDragData = (data: DragData): void => {
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
  }

  /**
   * 开始拖拽
   */
  const startDrag = (event: DragEvent, data: DragData, element?: HTMLElement): void => {
    try {
      // 验证参数
      if (!event) {
        throw new Error('Drag event is required')
      }

      validateDragData(data)

      // 性能监控
      if (options.enablePerformanceMonitoring) {
        dragStartTime = Date.now()
        performanceMetrics.dragOperations++
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
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('START_DRAG_ERROR', 'Failed to start drag', { error: errorMessage, data })
      
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
      
      // 性能监控
      if (options.enablePerformanceMonitoring && dragStartTime > 0) {
        const duration = Date.now() - dragStartTime
        performanceMetrics.lastOperationTime = duration
        performanceMetrics.averageDragDuration = 
          (performanceMetrics.averageDragDuration * (performanceMetrics.dragOperations - 1) + duration) 
          / performanceMetrics.dragOperations
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
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('END_DRAG_ERROR', 'Failed to end drag', { error: errorMessage })
      
      ElMessage.error({
        message: `Failed to end drag: ${errorMessage}`,
        duration: 3000,
      })

      // 确保清理拖拽状态
      cleanupDragState()
    }
  }

  /**
   * 防抖处理拖拽悬停
   */
  const debouncedDragOver = options.enableDebounce 
    ? debounce(handleDragOver, options.debounceDelay)
    : handleDragOver
  
  /**
   * 处理拖拽悬停
   */
  function handleDragOver(event: DragEvent): void {
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
            logError('ON_LEAVE_CALLBACK_ERROR', 'onLeave callback failed', { 
              error: callbackError instanceof Error ? callbackError.message : String(callbackError),
              zone: dragState.currentDropZone.id 
            })
          }
        }
        
        // 进入新的放置区域
        if (dropZone && dropZone.onEnter) {
          try {
            dropZone.onEnter(dragState.dragData, dropZone)
          } catch (callbackError) {
            logError('ON_ENTER_CALLBACK_ERROR', 'onEnter callback failed', { 
              error: callbackError instanceof Error ? callbackError.message : String(callbackError),
              zone: dropZone.id 
            })
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
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('DRAG_OVER_ERROR', 'Failed to handle drag over', { error: errorMessage })
      
      ElMessage.error({
        message: `Failed to handle drag over: ${errorMessage}`,
        duration: 3000,
      })
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
      
      // 性能监控
      if (options.enablePerformanceMonitoring) {
        performanceMetrics.dropOperations++
      }
      
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
            const errorMessage = dropError instanceof Error ? dropError.message : String(dropError)
            logError('DROP_OPERATION_ERROR', 'Drop operation failed', { 
              error: errorMessage,
              data: dragState.dragData.name,
              zone: dropZone.name 
            })
            
            ElMessage.error({
              message: `Drop operation failed: ${errorMessage}`,
              duration: 4000,
            })
          }
        } else {
          logError('INVALID_DROP_ERROR', 'Invalid drop attempt', { 
            data: dragState.dragData.name,
            zone: dropZone.name 
          })
          
          ElMessage.warning({
            message: `Cannot drop ${dragState.dragData.name} here`,
            duration: 3000,
          })
        }
      }
      
      // 结束拖拽
      endDrag(event)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('HANDLE_DROP_ERROR', 'Failed to handle drop', { error: errorMessage })
      
      ElMessage.error({
        message: `Failed to handle drop: ${errorMessage}`,
        duration: 3000,
      })

      // 确保结束拖拽
      endDrag(event)
    }
  }
  
  /**
   * 注册放置区域
   */
  const registerDropZone = (config: DropZoneConfig): void => {
    try {
      // 参数验证
      if (!config) {
        throw new Error('Drop zone config is required')
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
      
      if (!Array.isArray(config.acceptedTypes) || config.acceptedTypes.length === 0) {
        throw new Error('Accepted types must be a non-empty array')
      }
      
      // 验证元素是否有效
      if (!document.body.contains(config.element)) {
        throw new Error('Drop zone element must be attached to DOM')
      }
      
      // 检查ID是否已存在
      if (dropZones.value.has(config.id)) {
        throw new Error(`Drop zone with ID '${config.id}' already exists`)
      }
      
      // 注册放置区域
      dropZones.value.set(config.id, config)
      
      console.log(`📋 Registered drop zone: ${config.name} (${config.id})`)
      
      ElMessage.success({
        message: `Registered drop zone: ${config.name}`,
        duration: 2000,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('REGISTER_DROP_ZONE_ERROR', 'Failed to register drop zone', { 
        error: errorMessage,
        config 
      })
      
      ElMessage.error({
        message: `Failed to register drop zone: ${errorMessage}`,
        duration: 3000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to register drop zone: ${errorMessage}`)
    }
  }
  
  /**
   * 注销放置区域
   */
  const unregisterDropZone = (id: string): void => {
    try {
      // 参数验证
      if (!id?.trim()) {
        throw new Error('Drop zone ID is required')
      }
      
      // 检查是否存在
      const config = dropZones.value.get(id)
      if (!config) {
        throw new Error(`Drop zone with ID '${id}' not found`)
      }
      
      // 从映射表中移除
      dropZones.value.delete(id)
      
      // 如果当前拖拽悬停在这个区域，清空当前区域
      if (dragState.currentDropZone?.id === id) {
        dragState.currentDropZone = null
      }
      
      // 更新有效放置区域列表
      if (dragState.dragData) {
        updateValidDropZones(dragState.dragData)
      }
      
      console.log(`📋 Unregistered drop zone: ${config.name} (${id})`)
      
      ElMessage.info({
        message: `Unregistered drop zone: ${config.name}`,
        duration: 2000,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('UNREGISTER_DROP_ZONE_ERROR', 'Failed to unregister drop zone', { 
        error: errorMessage,
        id 
      })
      
      ElMessage.error({
        message: `Failed to unregister drop zone: ${errorMessage}`,
        duration: 3000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to unregister drop zone: ${errorMessage}`)
    }
  }
  
  /**
   * 创建拖拽预览
   */
  const createDragPreview = (data: DragData): void => {
    try {
      // 参数验证
      if (!data) {
        throw new Error('Drag data is required')
      }
      
      // 清理之前的预览
      if (dragState.dragPreview) {
        cleanupDragPreview()
      }
      
      // 创建预览元素
      const preview = document.createElement('div')
      preview.className = 'drag-preview'
      preview.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        background: #409EFF;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        border: 1px solid #3a8ee6;
        white-space: nowrap;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
      `
      
      // 设置预览内容
      const icon = data.icon ? `<i class="${data.icon}" style="margin-right: 4px;"></i>` : ''
      const description = data.description ? `<div style="font-size: 12px; opacity: 0.8; margin-top: 2px;">${data.description}</div>` : ''
      
      preview.innerHTML = `
        ${icon}
        <span>${data.name}</span>
        ${description}
      `
      
      // 添加到文档
      document.body.appendChild(preview)
      
      // 更新拖拽状态
      dragState.dragPreview = preview
      
      console.log(`🎨 Created drag preview for: ${data.name}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('CREATE_DRAG_PREVIEW_ERROR', 'Failed to create drag preview', { 
        error: errorMessage,
        data 
      })
      
      // 不显示错误消息，避免影响拖拽体验
      console.warn(`Failed to create drag preview: ${errorMessage}`)
    }
  }
  
  /**
   * 清理拖拽预览
   */
  const cleanupDragPreview = (): void => {
    try {
      if (dragState.dragPreview && document.body.contains(dragState.dragPreview)) {
        document.body.removeChild(dragState.dragPreview)
        console.log('🎨 Cleaned up drag preview')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('CLEANUP_DRAG_PREVIEW_ERROR', 'Failed to cleanup drag preview', { error: errorMessage })
      
      // 静默处理，不影响主流程
    } finally {
      dragState.dragPreview = null
    }
  }
  
  /**
   * 验证放置
   */
  const validateDrop = (data: DragData, dropZone: DropZoneConfig): boolean => {
    try {
      // 参数验证
      if (!data) {
        logError('VALIDATION_ERROR', 'Drag data is required for validation')
        return false
      }
      
      if (!dropZone) {
        logError('VALIDATION_ERROR', 'Drop zone is required for validation')
        return false
      }
      
      // 检查类型是否匹配
      if (!dropZone.acceptedTypes.includes(data.type)) {
        logError('TYPE_MISMATCH_ERROR', 'Drag data type not accepted by drop zone', {
          dataType: data.type,
          acceptedTypes: dropZone.acceptedTypes
        })
        return false
      }
      
      // 检查数量限制
      if (dropZone.maxItems !== undefined && dropZone.maxItems > 0) {
        // 这里需要业务逻辑来统计当前放置区域中的项目数量
        // 暂时假设业务逻辑会处理这个验证
        console.log(`📊 Validating max items limit: ${dropZone.maxItems}`)
      }
      
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('VALIDATE_DROP_ERROR', 'Failed to validate drop', { 
        error: errorMessage,
        data: data?.name,
        zone: dropZone?.name 
      })
      
      return false
    }
  }
  
  /**
   * 获取所有放置区域
   */
  const getDropZones = (): DropZoneConfig[] => {
    try {
      return Array.from(dropZones.value.values())
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('GET_DROP_ZONES_ERROR', 'Failed to get drop zones', { error: errorMessage })
      return []
    }
  }
  
  /**
   * 查找指定位置的放置区域
   */
  const findDropZoneAtPosition = (x: number, y: number): DropZoneConfig | null => {
    try {
      // 参数验证
      if (typeof x !== 'number' || typeof y !== 'number') {
        throw new Error('Coordinates must be numbers')
      }
      
      if (x < 0 || y < 0) {
        throw new Error('Coordinates must be non-negative')
      }
      
      // 获取所有放置区域
      const zones = getDropZones()
      
      // 查找包含指定位置的放置区域
      for (const zone of zones) {
        if (!zone.element || !document.body.contains(zone.element)) {
          continue
        }
        
        const rect = zone.element.getBoundingClientRect()
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          return zone
        }
      }
      
      return null
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('FIND_DROP_ZONE_ERROR', 'Failed to find drop zone at position', { 
        error: errorMessage,
        x,
        y 
      })
      
      return null
    }
  }
  
  /**
   * 更新有效放置区域
   */
  const updateValidDropZones = (data: DragData): void => {
    try {
      // 参数验证
      if (!data) {
        throw new Error('Drag data is required')
      }
      
      // 获取所有放置区域
      const zones = getDropZones()
      
      // 过滤有效的放置区域
      dragState.validDropZones = zones.filter(zone => validateDrop(data, zone))
      
      console.log(`📊 Updated valid drop zones: ${dragState.validDropZones.length}/${zones.length}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('UPDATE_VALID_ZONES_ERROR', 'Failed to update valid drop zones', { 
        error: errorMessage,
        data: data?.name 
      })
      
      // 清空有效放置区域列表
      dragState.validDropZones = []
    }
  }
  
  /**
   * 更新放置区域位置
   */
  const updateDropZonePosition = (id: string, element: HTMLElement): void => {
    try {
      // 参数验证
      if (!id?.trim()) {
        throw new Error('Drop zone ID is required')
      }
      
      if (!element) {
        throw new Error('Element is required')
      }
      
      // 查找放置区域
      const zone = dropZones.value.get(id)
      if (!zone) {
        throw new Error(`Drop zone with ID '${id}' not found`)
      }
      
      // 更新元素
      zone.element = element
      
      console.log(`📋 Updated drop zone position: ${zone.name} (${id})`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('UPDATE_ZONE_POSITION_ERROR', 'Failed to update drop zone position', { 
        error: errorMessage,
        id 
      })
      
      ElMessage.error({
        message: `Failed to update drop zone position: ${errorMessage}`,
        duration: 3000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to update drop zone position: ${errorMessage}`)
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
      
      // 检查是否离开了所有放置区域
      const dropZone = findDropZoneAtPosition(event.clientX, event.clientY)
      
      if (!dropZone && dragState.currentDropZone) {
        // 离开当前放置区域
        if (dragState.currentDropZone.onLeave) {
          try {
            dragState.currentDropZone.onLeave(dragState.dragData!, dragState.currentDropZone)
          } catch (callbackError) {
            logError('ON_LEAVE_CALLBACK_ERROR', 'onLeave callback failed', { 
              error: callbackError instanceof Error ? callbackError.message : String(callbackError),
              zone: dragState.currentDropZone.id 
            })
          }
        }
        
        dragState.currentDropZone = null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('DRAG_LEAVE_ERROR', 'Failed to handle drag leave', { error: errorMessage })
      
      // 静默处理，不影响拖拽体验
    }
  }
  
  /**
   * 清理拖拽状态
   */
  const cleanupDragState = (): void => {
    try {
      // 清理拖拽预览
      cleanupDragPreview()
      
      // 重置拖拽状态
      dragState.isDragging = false
      dragState.dragData = null
      dragState.dragElement = null
      dragState.startPosition = { x: 0, y: 0 }
      dragState.currentPosition = { x: 0, y: 0 }
      dragState.offset = { x: 0, y: 0 }
      dragState.validDropZones = []
      dragState.currentDropZone = null
      
      // 清理防抖定时器
      if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
      }
      
      console.log('🧹 Cleaned up drag state')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('CLEANUP_DRAG_STATE_ERROR', 'Failed to cleanup drag state', { error: errorMessage })
      
      // 静默处理，确保状态清理
    }
  }
  
  /**
   * 获取错误日志
   */
  const getErrorLog = (): DragDropError[] => {
    return [...errorLog.value]
  }
  
  /**
   * 获取性能指标
   */
  const getPerformanceMetrics = (): PerformanceMetrics => {
    return { ...performanceMetrics }
  }
  
  /**
   * 清理所有资源
   */
  const cleanup = (): void => {
    try {
      console.log('🧹 Cleaning up drag drop resources...')
      
      // 结束当前拖拽
      if (dragState.isDragging) {
        endDrag()
      }
      
      // 清理所有放置区域
      dropZones.value.clear()
      
      // 清理错误日志
      errorLog.value = []
      
      // 重置性能指标
      Object.assign(performanceMetrics, {
        dragOperations: 0,
        dropOperations: 0,
        validationFailures: 0,
        averageDragDuration: 0,
        lastOperationTime: 0
      })
      
      // 清理防抖定时器
      if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
      }
      
      console.log('✅ Drag drop resources cleaned up')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('CLEANUP_ERROR', 'Failed to cleanup resources', { error: errorMessage })
      
      // 静默处理，确保资源清理
    }
  }
  
  // 组件卸载时清理资源
  onUnmounted(() => {
    cleanup()
  })
  
  // 返回公开的方法和状态
  return {
    // 状态
    dragState: readonly(dragState),
    isDragging,
    currentDragData,
    currentDropZone,
    dragPreviewStyle,
    
    // 方法
    startDrag,
    endDrag,
    registerDropZone,
    unregisterDropZone,
    updateDropZonePosition,
    handleDragLeave,
    validateDrop,
    getDropZones,
    findDropZoneAtPosition,
    updateValidDropZones,
    cleanupDragState,
    cleanup,
    
    // 调试和监控
    getErrorLog,
    getPerformanceMetrics,
    
    // 事件处理（防抖版本）
    handleDragOver: debouncedDragOver,
    handleDrop,
  }
}
