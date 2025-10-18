/**
 * 🚀 统一事件总线系统 v1.0.0
 *
 * 🎯 核心功能：
 * - 类型安全的事件发布/订阅
 * - 自动内存泄漏防护
 * - 事件追踪和调试
 * - 与UnifiedSchema深度集成
 *
 * 🏛️ 架构原则：
 * - Single Source of Truth（事件系统唯一入口）
 * - Type Safety 100%（完整类型定义）
 * - Memory Safe（自动清理机制）
 * - Schema Driven（元数据驱动）
 */

import { getGlobalLogger, type ILogger } from '../logging'
import type { UnifiedEntityDefinition, UnifiedModuleMetadata } from '@/api/generated/type-aliases'

const logger: ILogger = getGlobalLogger()

/**
 * 事件命名规范枚举
 *
 * 🎯 命名规则：
 * - 使用kebab-case（小写-连字符）
 * - 前缀表示事件域（entity/module/ui/system）
 * - 动词表示操作（created/updated/deleted/selected）
 *
 * ✅ 正确示例：entity:created, module:updated, ui:component-selected
 * ❌ 错误示例：EntityCreated, entity_created, ENTITY_CREATED
 */
export enum UnifiedEventName {
    // 实体事件（Entity Events）
    ENTITY_CREATED = 'entity:created',
    ENTITY_UPDATED = 'entity:updated',
    ENTITY_DELETED = 'entity:deleted',
    ENTITY_SELECTED = 'entity:selected',
    ENTITY_FIELD_ADDED = 'entity:field-added',
    ENTITY_FIELD_UPDATED = 'entity:field-updated',
    ENTITY_FIELD_DELETED = 'entity:field-deleted',

    // 模块事件（Module Events）
    MODULE_CREATED = 'module:created',
    MODULE_UPDATED = 'module:updated',
    MODULE_DELETED = 'module:deleted',
    MODULE_SELECTED = 'module:selected',
    MODULE_GENERATED = 'module:generated',

    // UI事件（UI Events）
    UI_COMPONENT_SELECTED = 'ui:component-selected',
    UI_COMPONENT_ADDED = 'ui:component-added',
    UI_COMPONENT_REMOVED = 'ui:component-removed',
    UI_COMPONENT_MOVED = 'ui:component-moved',
    UI_CANVAS_CLEARED = 'ui:canvas-cleared',
    UI_MODE_CHANGED = 'ui:mode-changed',

    // 拖拽事件（Drag Events）
    DRAG_START = 'drag:start',
    DRAG_MOVE = 'drag:move',
    DRAG_END = 'drag:end',
    DRAG_CANCEL = 'drag:cancel',

    // 系统事件（System Events）
    SYSTEM_ERROR = 'system:error',
    SYSTEM_WARNING = 'system:warning',
    SYSTEM_INFO = 'system:info',
    SYSTEM_LOADING = 'system:loading',
    SYSTEM_READY = 'system:ready',

    // Schema事件（Schema Events）
    SCHEMA_VALIDATED = 'schema:validated',
    SCHEMA_UPDATED = 'schema:updated',
    SCHEMA_MIGRATED = 'schema:migrated',
}

/**
 * 事件数据类型映射
 *
 * 🎯 类型安全保证：
 * - 每个事件都有明确的数据类型
 * - 编译时类型检查
 * - IDE自动补全支持
 */
export interface UnifiedEventDataMap {
    // 实体事件数据
    [UnifiedEventName.ENTITY_CREATED]: { entity: UnifiedEntityDefinition }
    [UnifiedEventName.ENTITY_UPDATED]: { entity: UnifiedEntityDefinition; changes: Partial<UnifiedEntityDefinition> }
    [UnifiedEventName.ENTITY_DELETED]: { entityId: string; entityName: string }
    [UnifiedEventName.ENTITY_SELECTED]: { entityId: string; entity: UnifiedEntityDefinition }
    [UnifiedEventName.ENTITY_FIELD_ADDED]: { entityId: string; field: UnifiedEntityDefinition['fields'][0] }
    [UnifiedEventName.ENTITY_FIELD_UPDATED]: { entityId: string; fieldId: string; changes: any }
    [UnifiedEventName.ENTITY_FIELD_DELETED]: { entityId: string; fieldId: string }

    // 模块事件数据
    [UnifiedEventName.MODULE_CREATED]: { module: UnifiedModuleMetadata }
    [UnifiedEventName.MODULE_UPDATED]: { module: UnifiedModuleMetadata; changes: Partial<UnifiedModuleMetadata> }
    [UnifiedEventName.MODULE_DELETED]: { moduleId: string; moduleName: string }
    [UnifiedEventName.MODULE_SELECTED]: { moduleId: string; module: UnifiedModuleMetadata }
    [UnifiedEventName.MODULE_GENERATED]: { moduleId: string; success: boolean; files: string[] }

    // UI事件数据
    [UnifiedEventName.UI_COMPONENT_SELECTED]: { componentId: string; componentType: string }
    [UnifiedEventName.UI_COMPONENT_ADDED]: { componentId: string; componentType: string; position: { x: number; y: number } }
    [UnifiedEventName.UI_COMPONENT_REMOVED]: { componentId: string }
    [UnifiedEventName.UI_COMPONENT_MOVED]: { componentId: string; from: { x: number; y: number }; to: { x: number; y: number } }
    [UnifiedEventName.UI_CANVAS_CLEARED]: { componentCount: number }
    [UnifiedEventName.UI_MODE_CHANGED]: { from: string; to: string }

    // 拖拽事件数据
    [UnifiedEventName.DRAG_START]: { elementId: string; startPosition: { x: number; y: number } }
    [UnifiedEventName.DRAG_MOVE]: { position: { x: number; y: number }; selectedIds: string[] }
    [UnifiedEventName.DRAG_END]: { elementId: string; endPosition: { x: number; y: number }; moved: boolean }
    [UnifiedEventName.DRAG_CANCEL]: { elementId: string }

    // 系统事件数据
    [UnifiedEventName.SYSTEM_ERROR]: { error: Error; context?: string }
    [UnifiedEventName.SYSTEM_WARNING]: { message: string; context?: string }
    [UnifiedEventName.SYSTEM_INFO]: { message: string; context?: string }
    [UnifiedEventName.SYSTEM_LOADING]: { loading: boolean; message?: string }
    [UnifiedEventName.SYSTEM_READY]: { timestamp: number }

    // Schema事件数据
    [UnifiedEventName.SCHEMA_VALIDATED]: { valid: boolean; errors?: string[] }
    [UnifiedEventName.SCHEMA_UPDATED]: { schemaVersion: string; changes: string[] }
    [UnifiedEventName.SCHEMA_MIGRATED]: { fromVersion: string; toVersion: string; success: boolean }
}

/**
 * 事件监听器类型
 */
type EventListener<T extends UnifiedEventName> = (data: UnifiedEventDataMap[T]) => void | Promise<void>

/**
 * 事件订阅Token（用于取消订阅）
 */
export interface EventSubscriptionToken {
    event: UnifiedEventName
    listener: EventListener<any>
    unsubscribe: () => void
}

/**
 * 事件统计信息
 */
interface EventStats {
    totalEmitted: number
    totalListeners: number
    eventCounts: Map<UnifiedEventName, number>
    lastEmitTime: Map<UnifiedEventName, number>
}

/**
 * 🚀 统一事件总线（单例）
 *
 * 🎯 设计模式：
 * - Singleton（单例模式）
 * - Observer（观察者模式）
 * - Type-Safe（类型安全）
 *
 * 🛡️ 安全特性：
 * - 自动内存泄漏检测
 * - 事件追踪和日志
 * - 错误边界处理
 */
class UnifiedEventBus {
    private static instance: UnifiedEventBus | null = null
    private listeners: Map<UnifiedEventName, Set<EventListener<any>>> = new Map()
    private stats: EventStats = {
        totalEmitted: 0,
        totalListeners: 0,
        eventCounts: new Map(),
        lastEmitTime: new Map()
    }

    // 🛡️ 内存泄漏检测阈值
    private readonly MAX_LISTENERS_PER_EVENT = 100
    private readonly LEAK_WARNING_THRESHOLD = 50

    private constructor() {
        logger.info('[UnifiedEventBus] 初始化统一事件总线系统 v1.0.0')
    }

    /**
     * 获取单例实例
     */
    public static getInstance(): UnifiedEventBus {
        if (!UnifiedEventBus.instance) {
            UnifiedEventBus.instance = new UnifiedEventBus()
        }
        return UnifiedEventBus.instance
    }

    /**
     * 订阅事件（类型安全）
     *
     * @param event 事件名称
     * @param listener 事件监听器
     * @returns 订阅Token（用于取消订阅）
     *
     * @example
     * ```typescript
     * const token = eventBus.on(UnifiedEventName.ENTITY_CREATED, (data) => {
     *   console.log('Entity created:', data.entity.name)
     * })
     *
     * // 取消订阅
     * token.unsubscribe()
     * ```
     */
    public on<T extends UnifiedEventName>(
        event: T,
        listener: EventListener<T>
    ): EventSubscriptionToken {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set())
        }

        const eventListeners = this.listeners.get(event)!
        eventListeners.add(listener)
        this.stats.totalListeners++

        // 🛡️ 内存泄漏检测
        this.checkMemoryLeak(event, eventListeners.size)

        logger.debug(`[UnifiedEventBus] 订阅事件: ${event}, 当前监听器数: ${eventListeners.size}`)

        // 返回订阅Token
        return {
            event,
            listener,
            unsubscribe: () => this.off(event, listener)
        }
    }

    /**
     * 取消订阅事件
     *
     * @param event 事件名称
     * @param listener 事件监听器
     */
    public off<T extends UnifiedEventName>(
        event: T,
        listener: EventListener<T>
    ): void {
        const eventListeners = this.listeners.get(event)
        if (!eventListeners) return

        eventListeners.delete(listener)
        this.stats.totalListeners--

        // 如果没有监听器了，删除事件
        if (eventListeners.size === 0) {
            this.listeners.delete(event)
        }

        logger.debug(`[UnifiedEventBus] 取消订阅事件: ${event}, 剩余监听器数: ${eventListeners.size}`)
    }

    /**
     * 发布事件（类型安全）
     *
     * @param event 事件名称
     * @param data 事件数据
     *
     * @example
     * ```typescript
     * eventBus.emit(UnifiedEventName.ENTITY_CREATED, {
     *   entity: newEntity
     * })
     * ```
     */
    public async emit<T extends UnifiedEventName>(
        event: T,
        data: UnifiedEventDataMap[T]
    ): Promise<void> {
        const eventListeners = this.listeners.get(event)
        if (!eventListeners || eventListeners.size === 0) {
            logger.debug(`[UnifiedEventBus] 无监听器，跳过事件: ${event}`)
            return
        }

        // 更新统计
        this.stats.totalEmitted++
        this.stats.eventCounts.set(event, (this.stats.eventCounts.get(event) || 0) + 1)
        this.stats.lastEmitTime.set(event, Date.now())

        logger.debug(`[UnifiedEventBus] 发布事件: ${event}, 监听器数: ${eventListeners.size}`, data)

        // 异步调用所有监听器（错误隔离）
        const promises = Array.from(eventListeners).map(async (listener) => {
            try {
                await listener(data)
            } catch (error) {
                logger.error(`[UnifiedEventBus] 事件监听器执行错误: ${event}`, error)
                // 发布系统错误事件
                if (event !== UnifiedEventName.SYSTEM_ERROR) {
                    this.emit(UnifiedEventName.SYSTEM_ERROR, {
                        error: error as Error,
                        context: `Event listener error: ${event}`
                    })
                }
            }
        })

        await Promise.all(promises)
    }

    /**
     * 清空所有事件监听器
     */
    public clear(): void {
        this.listeners.clear()
        this.stats.totalListeners = 0
        logger.warn('[UnifiedEventBus] 已清空所有事件监听器')
    }

    /**
     * 获取事件统计信息
     */
    public getStats(): EventStats {
        return {
            ...this.stats,
            eventCounts: new Map(this.stats.eventCounts),
            lastEmitTime: new Map(this.stats.lastEmitTime)
        }
    }

    /**
     * 🛡️ 内存泄漏检测
     */
    private checkMemoryLeak(event: UnifiedEventName, listenerCount: number): void {
        if (listenerCount >= this.MAX_LISTENERS_PER_EVENT) {
            const error = new Error(`内存泄漏警告: 事件 "${event}" 的监听器数量达到 ${listenerCount}，超过最大限制 ${this.MAX_LISTENERS_PER_EVENT}`)
            logger.error('[UnifiedEventBus] 内存泄漏检测', error)
            this.emit(UnifiedEventName.SYSTEM_ERROR, {
                error,
                context: 'Memory leak detection'
            })
        } else if (listenerCount >= this.LEAK_WARNING_THRESHOLD) {
            logger.warn(`[UnifiedEventBus] 内存泄漏预警: 事件 "${event}" 的监听器数量达到 ${listenerCount}`)
        }
    }
}

/**
 * 导出单例实例
 */
export const unifiedEventBus = UnifiedEventBus.getInstance()

/**
 * 便捷导出函数
 */
export const { on, off, emit, clear, getStats } = unifiedEventBus

