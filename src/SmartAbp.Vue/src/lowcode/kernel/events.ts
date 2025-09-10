/**
 * 企业级事件总线系统
 * 支持优先级、异步处理、错误恢复
 */

import type {
  EventBus as IEventBus,
  LowCodeEventMap,
  EventHandler,
  EventUnsubscriber,
  EventListenerOptions,
  StructuredLogger
} from './types';

interface ListenerRegistry<T> {
  handler: EventHandler<T>;
  options: Required<EventListenerOptions>;
  id: string;
}

export class EventBus implements IEventBus {
  private listeners = new Map<keyof LowCodeEventMap, Set<ListenerRegistry<any>>>();
  private eventHistory = new Map<string, any[]>();
  private isProcessing = new Set<keyof LowCodeEventMap>();
  private maxHistorySize = 1000;
  private logger?: StructuredLogger;

  constructor(logger?: StructuredLogger) {
    this.logger = logger;
  }

  on<K extends keyof LowCodeEventMap>(
    event: K,
    handler: EventHandler<LowCodeEventMap[K]>,
    options: EventListenerOptions = {}
  ): EventUnsubscriber {
    const registry: ListenerRegistry<LowCodeEventMap[K]> = {
      handler,
      options: {
        priority: options.priority ?? 50,
        once: options.once ?? false,
        capture: options.capture ?? false
      },
      id: this.generateId()
    };

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(registry);

    // 按优先级排序
    this.sortListeners(event);

    this.logger?.debug('Event listener registered', {
      event,
      listenerId: registry.id,
      priority: registry.options.priority
    });

    return () => this.off(event, handler);
  }

  once<K extends keyof LowCodeEventMap>(
    event: K,
    handler: EventHandler<LowCodeEventMap[K]>
  ): EventUnsubscriber {
    return this.on(event, handler, { once: true });
  }

  off<K extends keyof LowCodeEventMap>(
    event: K,
    handler: EventHandler<LowCodeEventMap[K]>
  ): void {
    const listeners = this.listeners.get(event);
    if (!listeners) return;

    for (const registry of listeners) {
      if (registry.handler === handler) {
        listeners.delete(registry);
        this.logger?.debug('Event listener removed', {
          event,
          listenerId: registry.id
        });
        break;
      }
    }

    if (listeners.size === 0) {
      this.listeners.delete(event);
    }
  }

  async emit<K extends keyof LowCodeEventMap>(
    event: K,
    data: LowCodeEventMap[K]
  ): Promise<void> {
    // 防止重入
    if (this.isProcessing.has(event)) {
      this.logger?.warn('Event emission skipped due to re-entrance', { event });
      return;
    }

    this.isProcessing.add(event);

    try {
      // 记录事件历史
      this.recordEvent(event, data);

      const listeners = this.listeners.get(event);
      if (!listeners || listeners.size === 0) {
        return;
      }

      const promises: Promise<void>[] = [];

      for (const registry of listeners) {
        const promise = this.executeHandler(event, registry, data);
        promises.push(promise);

        // 如果是一次性监听器，执行后移除
        if (registry.options.once) {
          listeners.delete(registry);
        }
      }

      // 等待所有处理器完成
      await Promise.allSettled(promises);

    } finally {
      this.isProcessing.delete(event);
    }
  }

  emitSync<K extends keyof LowCodeEventMap>(
    event: K,
    data: LowCodeEventMap[K]
  ): void {
    this.recordEvent(event, data);

    const listeners = this.listeners.get(event);
    if (!listeners || listeners.size === 0) {
      return;
    }

    for (const registry of listeners) {
      try {
        const result = registry.handler(data);
        
        // 如果返回Promise，记录警告（同步模式不应该返回Promise）
        if (result instanceof Promise) {
          this.logger?.warn('Async handler in sync emit', { event });
        }

        if (registry.options.once) {
          listeners.delete(registry);
        }
      } catch (error) {
        this.logger?.error('Sync event handler error', error as Error, {
          event,
          listenerId: registry.id
        });
      }
    }
  }

  /**
   * 获取事件历史
   */
  getEventHistory<K extends keyof LowCodeEventMap>(
    event?: K,
    limit?: number
  ): Array<{ event: string; data: any; timestamp: number }> {
    if (event) {
      const history = this.eventHistory.get(event as string) || [];
      return history.slice(-(limit || 100));
    }

    const allHistory: Array<{ event: string; data: any; timestamp: number }> = [];
    
    for (const [eventName, events] of this.eventHistory) {
      allHistory.push(...events.map(data => ({ event: eventName, data, timestamp: data.timestamp })));
    }

    return allHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit || 100);
  }

  /**
   * 清理事件历史
   */
  clearHistory(event?: keyof LowCodeEventMap): void {
    if (event) {
      this.eventHistory.delete(event as string);
    } else {
      this.eventHistory.clear();
    }
  }

  /**
   * 获取监听器统计
   */
  getListenerStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    for (const [event, listeners] of this.listeners) {
      stats[event as string] = listeners.size;
    }
    
    return stats;
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(event?: keyof LowCodeEventMap): void {
    if (event) {
      this.listeners.delete(event);
      this.logger?.info('All listeners removed for event', { event });
    } else {
      this.listeners.clear();
      this.logger?.info('All listeners removed');
    }
  }

  private async executeHandler<K extends keyof LowCodeEventMap>(
    event: K,
    registry: ListenerRegistry<LowCodeEventMap[K]>,
    data: LowCodeEventMap[K]
  ): Promise<void> {
    try {
      const result = registry.handler(data);
      
      // 如果是Promise，等待完成
      if (result instanceof Promise) {
        await result;
      }

      this.logger?.debug('Event handler executed successfully', {
        event,
        listenerId: registry.id
      });

    } catch (error) {
      this.logger?.error('Event handler error', error as Error, {
        event,
        listenerId: registry.id,
        data
      });

      // 发出错误事件（如果不是错误事件本身）
      if (event !== 'system:error') {
        this.emitSync('system:error', {
          error: error as Error,
          context: `Event handler for ${event as string}`,
          timestamp: Date.now()
        });
      }
    }
  }

  private sortListeners<K extends keyof LowCodeEventMap>(event: K): void {
    const listeners = this.listeners.get(event);
    if (!listeners) return;

    const sortedArray = Array.from(listeners).sort(
      (a, b) => b.options.priority - a.options.priority
    );

    this.listeners.set(event, new Set(sortedArray));
  }

  private recordEvent<K extends keyof LowCodeEventMap>(
    event: K,
    data: LowCodeEventMap[K]
  ): void {
    const eventKey = event as string;
    
    if (!this.eventHistory.has(eventKey)) {
      this.eventHistory.set(eventKey, []);
    }

    const history = this.eventHistory.get(eventKey)!;
    history.push({ ...data, timestamp: Date.now() });

    // 限制历史大小
    if (history.length > this.maxHistorySize) {
      history.splice(0, history.length - this.maxHistorySize);
    }
  }

  private generateId(): string {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
