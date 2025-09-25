import mitt from 'mitt'
import { logger } from './logger'

/**
 * 🚀 全局事件总线类型定义
 * 统一管理LowCode Studio中的组件间通信
 */
export type LowCodeEvents = {
  // ===== 工作区事件 =====
  'workspace:module-change': {
    from: string
    to: string
    timestamp: number
  }

  'workspace:layout-change': {
    layout: 'default' | 'full' | 'sidebar' | 'properties'
    reason: string
  }

  'workspace:settings-update': {
    settings: Record<string, any>
    source: 'user' | 'system' | 'auto'
  }

  // ===== 实体建模事件 =====
  'entity:created': {
    entity: {
      id: string
      name: string
      displayName: string
      [key: string]: any
    }
    source: 'user' | 'import' | 'template'
  }

  'entity:updated': {
    entityId: string
    changes: Record<string, any>
    previous: Record<string, any>
  }

  'entity:deleted': {
    entityId: string
    entityName: string
    cascade: boolean
  }

  'entity:field-added': {
    entityId: string
    field: {
      name: string
      type: string
      [key: string]: any
    }
  }

  'entity:relationship-created': {
    fromEntity: string
    toEntity: string
    type: 'one-to-one' | 'one-to-many' | 'many-to-many'
    relationshipId: string
  }

  // ===== 页面设计事件 =====
  'page:created': {
    page: {
      id: string
      name: string
      type: string
      [key: string]: any
    }
    template?: string
  }

  'page:updated': {
    pageId: string
    changes: Record<string, any>
    version: number
  }

  'page:component-added': {
    pageId: string
    component: {
      id: string
      type: string
      [key: string]: any
    }
    position: { x: number; y: number }
  }

  'page:component-updated': {
    pageId: string
    componentId: string
    changes: Record<string, any>
  }

  'page:component-deleted': {
    pageId: string
    componentId: string
    componentType: string
  }

  // ===== 主题定制事件 =====
  'theme:changed': {
    themeId: string
    themeName: string
    changes: Record<string, any>
  }

  'theme:token-updated': {
    token: string
    value: any
    previous: any
  }

  'theme:preset-applied': {
    presetId: string
    presetName: string
    tokens: Record<string, any>
  }

  // ===== 代码生成事件 =====
  'codegen:started': {
    taskId: string
    type: 'frontend' | 'backend' | 'fullstack'
    entities: string[]
    options: Record<string, any>
  }

  'codegen:progress': {
    taskId: string
    progress: number
    currentStep: string
    message: string
  }

  'codegen:completed': {
    taskId: string
    success: boolean
    files: Array<{
      path: string
      content: string
      size: number
    }>
    duration: number
  }

  'codegen:error': {
    taskId: string
    error: {
      message: string
      code?: string
      details?: any
    }
    step: string
  }

  // ===== 工作流事件 =====
  'workflow:state-changed': {
    workflowId: string
    fromState: string
    toState: string
    trigger: string
    data?: any
  }

  'workflow:action-executed': {
    workflowId: string
    actionId: string
    actionType: string
    result: any
  }

  // ===== 系统事件 =====
  'system:error': {
    error: Error
    component?: string
    level: 'error' | 'warning' | 'info'
    context?: Record<string, any>
  }

  'system:notification': {
    type: 'success' | 'warning' | 'error' | 'info'
    title: string
    message: string
    duration?: number
    actions?: Array<{
      label: string
      action: () => void
    }>
  }

  'system:loading': {
    module: string
    isLoading: boolean
    operation?: string
  }

  // ===== UI交互事件 =====
  'ui:modal-open': {
    modalId: string
    modalType: string
    data?: any
  }

  'ui:modal-close': {
    modalId: string
    result?: any
  }

  'ui:sidebar-toggle': {
    collapsed: boolean
    source: 'user' | 'auto'
  }

  'ui:focus-change': {
    element: string
    elementType: 'entity' | 'page' | 'component' | 'property'
    elementId: string
  }

  // ===== 数据同步事件 =====
  'sync:save-request': {
    type: 'entity' | 'page' | 'theme' | 'workspace'
    id: string
    data: any
  }

  'sync:save-completed': {
    type: 'entity' | 'page' | 'theme' | 'workspace'
    id: string
    success: boolean
    timestamp: number
  }

  'sync:conflict-detected': {
    type: 'entity' | 'page' | 'theme' | 'workspace'
    id: string
    localVersion: number
    remoteVersion: number
    conflicts: Array<{
      field: string
      localValue: any
      remoteValue: any
    }>
  }
}

/**
 * 🌐 全局事件总线实例
 */
export const eventBus = mitt<LowCodeEvents>()

/**
 * 🛡️ 事件总线工具类
 * 提供类型安全的事件发布订阅机制
 */
export class EventBusManager {
  private static instance: EventBusManager
  private listeners: Map<string, number> = new Map()

  static getInstance(): EventBusManager {
    if (!EventBusManager.instance) {
      EventBusManager.instance = new EventBusManager()
    }
    return EventBusManager.instance
  }

  /**
   * 发布事件（带日志记录）
   */
  emit<T extends keyof LowCodeEvents>(
    type: T,
    data: LowCodeEvents[T],
    source?: string
  ): void {
    try {
      eventBus.emit(type, data)

      logger?.debug('EventBus: 事件发布', {
        type,
        data,
        source: source || 'unknown',
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      logger?.error('EventBus: 事件发布失败', {
        type,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  /**
   * 订阅事件（带自动清理）
   */
  on<T extends keyof LowCodeEvents>(
    type: T,
    handler: (data: LowCodeEvents[T]) => void,
    options?: {
      once?: boolean
      immediate?: boolean
      componentName?: string
    }
  ): () => void {
    const wrappedHandler = (data: LowCodeEvents[T]) => {
      try {
        handler(data)

        logger?.debug('EventBus: 事件处理', {
          type,
          component: options?.componentName || 'unknown',
          timestamp: new Date().toISOString()
        })

      } catch (error) {
        logger?.error('EventBus: 事件处理失败', {
          type,
          component: options?.componentName,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    // 注册监听器
    // mitt库暂不支持once方法，使用on代替
    eventBus.on(type, wrappedHandler)

    // 统计监听器数量
    const currentCount = this.listeners.get(type) || 0
    this.listeners.set(type, currentCount + 1)

    // 返回清理函数
    return () => {
      eventBus.off(type, wrappedHandler)
      const count = this.listeners.get(type) || 0
      if (count > 0) {
        this.listeners.set(type, count - 1)
      }
    }
  }

  /**
   * 批量发布事件
   */
  emitBatch(events: Array<{
    type: keyof LowCodeEvents
    data: any
  }>): void {
    events.forEach(({ type, data }) => {
      this.emit(type, data, 'batch')
    })
  }

  /**
   * 获取监听器统计
   */
  getListenerStats(): Record<string, number> {
    return Object.fromEntries(this.listeners.entries())
  }

  /**
   * 清理所有监听器
   */
  clearAll(): void {
    eventBus.all.clear()
    this.listeners.clear()
    logger?.info('EventBus: 所有监听器已清理')
  }
}

/**
 * 🎯 便捷的事件总线实例
 */
export const eventManager = EventBusManager.getInstance()

/**
 * 🔧 Vue组合式函数：事件总线
 */
export function useEventBus() {
  return {
    emit: eventManager.emit.bind(eventManager),
    on: eventManager.on.bind(eventManager),
    emitBatch: eventManager.emitBatch.bind(eventManager),
    getStats: eventManager.getListenerStats.bind(eventManager)
  }
}

/**
 * 🎭 Vue组合式函数：事件订阅（自动清理）
 */
export function useEventSubscription(componentName?: string) {
  const unsubscribeFunctions: Array<() => void> = []

  const subscribe = <T extends keyof LowCodeEvents>(
    type: T,
    handler: (data: LowCodeEvents[T]) => void,
    options?: { once?: boolean }
  ) => {
    const unsubscribe = eventManager.on(type, handler, {
      ...options,
      componentName
    })
    unsubscribeFunctions.push(unsubscribe)
    return unsubscribe
  }

  const cleanup = () => {
    unsubscribeFunctions.forEach(fn => fn())
    unsubscribeFunctions.length = 0
  }

  return {
    subscribe,
    cleanup,
    emit: eventManager.emit.bind(eventManager)
  }
}

// 默认导出
export default eventBus
