// 添加DOM类型定义
/// <reference lib="dom" />

/**
 * 🏗️ 基础组件类 - 统一生命周期管理
 * SmartAbp低代码引擎 - P0级架构优化
 * 
 * 核心功能:
 * - 统一组件生命周期管理
 * - 自动资源清理和内存释放
 * - 事件监听器自动管理
 * - 定时器和观察器统一清理
 * - 内存泄漏预防机制
 */

export type ComponentState = 'created' | 'mounted' | 'active' | 'inactive' | 'destroyed';
export type CleanupTask = () => void | Promise<void>;

/**
 * 组件生命周期事件
 */
export interface ComponentLifecycleEvents {
  /** 组件创建完成 */
  'lifecycle:created': { component: BaseComponent; timestamp: number };
  /** 组件挂载完成 */
  'lifecycle:mounted': { component: BaseComponent; timestamp: number };
  /** 组件激活 */
  'lifecycle:activated': { component: BaseComponent; timestamp: number };
  /** 组件失活 */
  'lifecycle:deactivated': { component: BaseComponent; timestamp: number };
  /** 组件销毁 */
  'lifecycle:destroyed': { component: BaseComponent; timestamp: number; cleanupCount: number };
  /** 内存清理 */
  'memory:cleaned': { component: BaseComponent; memoryReleased: number };
}

/**
 * 组件性能指标
 */
export interface ComponentPerformanceMetrics {
  /** 创建时间 */
  createdAt: number;
  /** 挂载时间 */
  mountedAt?: number;
  /** 最后活跃时间 */
  lastActiveAt: number;
  /** 销毁时间 */
  destroyedAt?: number;
  /** 生命周期总时长 */
  totalLifetime: number;
  /** 内存使用峰值 */
  peakMemoryUsage: number;
  /** 清理任务数量 */
  cleanupTaskCount: number;
}

/**
 * 🏗️ 基础组件抽象类
 */
export abstract class BaseComponent {
  /** 组件唯一标识 */
  public readonly id: string;
  /** 组件名称 */
  public readonly name: string;
  /** 组件状态 */
  private _state: ComponentState = 'created';
  /** 清理任务列表 */
  private cleanupTasks: CleanupTask[] = [];
  /** 事件监听器映射 */
  private eventListeners = new Map<string, Set<Function>>();
  /** 定时器列表 */
  private timers = new Set<ReturnType<typeof setTimeout | typeof setInterval>>();
  /** 观察器列表 */
  private observers = new Set<{ disconnect: () => void }>();
  /** 性能指标 */
  private performanceMetrics: ComponentPerformanceMetrics;
  /** WeakRef引用映射（在不支持WeakRef环境下以轻量包装对象代替） */
  private weakRefs = new Set<any>();

  constructor(name: string, id?: string) {
    this.name = name;
    this.id = id || this.generateId();
    this.performanceMetrics = {
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      totalLifetime: 0,
      peakMemoryUsage: 0,
      cleanupTaskCount: 0
    };

    // 注册到全局组件管理器
    GlobalComponentManager.getInstance().register(this);

    console.log(`🏗️ 组件创建: ${this.name} (${this.id})`);
    this.emitLifecycleEvent('lifecycle:created');
  }

  /**
   * 获取组件状态
   */
  get state(): ComponentState {
    return this._state;
  }

  /**
   * 获取性能指标
   */
  get metrics(): ComponentPerformanceMetrics {
    return {
      ...this.performanceMetrics,
      totalLifetime: this.performanceMetrics.destroyedAt
        ? this.performanceMetrics.destroyedAt - this.performanceMetrics.createdAt
        : Date.now() - this.performanceMetrics.createdAt
    };
  }

  /**
   * 组件挂载
   */
  mount(): void {
    if (this._state !== 'created') {
      console.warn(`组件 ${this.name} 状态错误，无法挂载`);
      return;
    }

    this._state = 'mounted';
    this.performanceMetrics.mountedAt = Date.now();
    this.performanceMetrics.lastActiveAt = Date.now();

    this.onMounted();
    console.log(`📌 组件挂载: ${this.name}`);
    this.emitLifecycleEvent('lifecycle:mounted');
  }

  /**
   * 激活组件
   */
  activate(): void {
    if (this._state === 'destroyed') {
      console.warn(`组件 ${this.name} 已销毁，无法激活`);
      return;
    }

    this._state = 'active';
    this.performanceMetrics.lastActiveAt = Date.now();

    this.onActivated();
    console.log(`⚡ 组件激活: ${this.name}`);
    this.emitLifecycleEvent('lifecycle:activated');
  }

  /**
   * 失活组件
   */
  deactivate(): void {
    if (this._state === 'destroyed') {
      console.warn(`组件 ${this.name} 已销毁，无法失活`);
      return;
    }

    this._state = 'inactive';
    this.onDeactivated();
    console.log(`😴 组件失活: ${this.name}`);
    this.emitLifecycleEvent('lifecycle:deactivated');
  }

  /**
   * 销毁组件
   */
  async destroy(): Promise<void> {
    if (this._state === 'destroyed') {
      console.warn(`组件 ${this.name} 已销毁`);
      return;
    }

    console.log(`🗑️ 开始销毁组件: ${this.name}`);
    const startTime = Date.now();

    // 设置状态为已销毁
    this._state = 'destroyed';
    this.performanceMetrics.destroyedAt = Date.now();

    // 调用子类销毁逻辑
    await this.onDestroy();

    // 执行所有清理任务
    await this.executeCleanupTasks();

    // 清理事件监听器
    this.clearEventListeners();

    // 清理定时器
    this.clearTimers();

    // 清理观察器
    this.clearObservers();

    // 清理WeakRef引用
    this.clearWeakRefs();

    // 从全局管理器注销
    GlobalComponentManager.getInstance().unregister(this.id);

    const cleanupTime = Date.now() - startTime;
    console.log(`✅ 组件销毁完成: ${this.name} (清理耗时: ${cleanupTime}ms)`);

    this.emitLifecycleEvent('lifecycle:destroyed', {
      cleanupCount: this.performanceMetrics.cleanupTaskCount
    });
  }

  /**
   * 添加清理任务
   */
  protected addCleanupTask(task: CleanupTask): void {
    this.cleanupTasks.push(task);
    this.performanceMetrics.cleanupTaskCount++;
  }

  /**
   * 安全添加事件监听器
   */
  protected addEventListener<T extends keyof ComponentLifecycleEvents>(
    element: EventTarget | BaseComponent,
    event: string | T,
    listener: Function,
    options?: { passive?: boolean; capture?: boolean; once?: boolean }
  ): void {
    if (element instanceof BaseComponent) {
      // 组件间事件监听
      element.on(event as string, listener);
    } else {
      // DOM事件监听
      const boundListener = listener.bind(this);
      element.addEventListener(event as string, boundListener as (event: Event) => void, options);

      // 添加清理任务
      this.addCleanupTask(() => {
        element.removeEventListener(event as string, boundListener as (event: Event) => void, options);
      });
    }

    // 记录事件监听器
    if (!this.eventListeners.has(event as string)) {
      this.eventListeners.set(event as string, new Set());
    }
    this.eventListeners.get(event as string)!.add(listener);
  }

  /**
   * 安全创建定时器
   */
  protected createTimer(callback: () => void, delay: number, repeat = false): number | ReturnType<typeof setInterval> {
    const timer = repeat
      ? setInterval(callback, delay)
      : setTimeout(callback, delay);

    this.timers.add(timer);

    // 添加清理任务
    this.addCleanupTask(() => {
      if (repeat) {
        clearInterval(timer as ReturnType<typeof setInterval>);
      } else {
        clearTimeout(timer as ReturnType<typeof setTimeout>);
      }
      this.timers.delete(timer);
    });

    return timer;
  }

  /**
   * 安全创建观察器
   */
  protected createObserver<T extends { disconnect: () => void }>(observer: T): T {
    this.observers.add(observer);

    // 添加清理任务
    this.addCleanupTask(() => {
      observer.disconnect();
      this.observers.delete(observer);
    });

    return observer;
  }

  /**
   * 创建WeakRef引用（在不支持WeakRef的环境下使用轻量包装对象）
   */
  protected createWeakRef<T extends object>(target: T): any {
    const WeakRefCtor: any = (globalThis as any).WeakRef
    const weakRef: any = WeakRefCtor ? new WeakRefCtor(target) : { deref: () => target }
    this.weakRefs.add(weakRef);

    // 添加清理任务
    this.addCleanupTask(() => {
      this.weakRefs.delete(weakRef);
    });

    return weakRef;
  }

  /**
   * 更新性能指标
   */
  protected updateMemoryUsage(usage: number): void {
    this.performanceMetrics.peakMemoryUsage = Math.max(
      this.performanceMetrics.peakMemoryUsage,
      usage
    );
  }

  /**
   * 触发生命周期事件
   */
  private emitLifecycleEvent<T extends keyof ComponentLifecycleEvents>(
    event: T,
    additionalData?: Partial<ComponentLifecycleEvents[T]>
  ): void {
    const eventData = {
      component: this,
      timestamp: Date.now(),
      ...additionalData
    } as ComponentLifecycleEvents[T];

    // 通知全局管理器
    GlobalComponentManager.getInstance().emitEvent(event, eventData);
  }

  /**
   * 执行清理任务
   */
  private async executeCleanupTasks(): Promise<void> {
    const tasks = [...this.cleanupTasks];
    this.cleanupTasks = [];

    console.log(`🧹 执行 ${tasks.length} 个清理任务...`);

    for (const task of tasks) {
      try {
        await task();
      } catch (error) {
        console.error(`清理任务执行失败:`, error);
      }
    }
  }

  /**
   * 清理事件监听器
   */
  private clearEventListeners(): void {
    this.eventListeners.clear();
  }

  /**
   * 清理定时器
   */
  private clearTimers(): void {
    this.timers.forEach(timer => {
      if (typeof timer === 'number') {
        clearTimeout(timer);
      } else {
        clearInterval(timer);
      }
    });
    this.timers.clear();
  }

  /**
   * 清理观察器
   */
  private clearObservers(): void {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.error('观察器清理失败:', error);
      }
    });
    this.observers.clear();
  }

  /**
   * 清理WeakRef引用
   */
  private clearWeakRefs(): void {
    this.weakRefs.clear();
  }

  /**
   * 生成组件ID
   */
  private generateId(): string {
    return `${this.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ========== 生命周期钩子 ==========

  /**
   * 组件挂载钩子
   */
  protected abstract onMounted(): void;

  /**
   * 组件激活钩子
   */
  protected abstract onActivated(): void;

  /**
   * 组件失活钩子
   */
  protected abstract onDeactivated(): void;

  /**
   * 组件销毁钩子
   */
  protected abstract onDestroy(): Promise<void>;

  // ========== 事件系统 ==========

  private lifecycleEventListeners = new Map<string, Set<Function>>();

  /**
   * 监听事件
   */
  on(event: string, listener: Function): void {
    if (!this.lifecycleEventListeners.has(event)) {
      this.lifecycleEventListeners.set(event, new Set());
    }
    this.lifecycleEventListeners.get(event)!.add(listener);
  }

  /**
   * 移除事件监听
   */
  off(event: string, listener: Function): void {
    const listeners = this.lifecycleEventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 触发事件
   */
  protected emit(event: string, data?: any): void {
    const listeners = this.lifecycleEventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`事件处理器错误 [${event}]:`, error);
        }
      });
    }
  }
}

/**
 * 🌐 全局组件管理器
 */
class GlobalComponentManager {
  private static instance: GlobalComponentManager;
  private components = new Map<string, any>();
  private eventListeners = new Map<string, Set<Function>>();
  private performanceStats = {
    totalCreated: 0,
    totalDestroyed: 0,
    averageLifetime: 0,
    peakConcurrentComponents: 0
  };

  private constructor() {
    // 定期清理无效的WeakRef
    setInterval(() => {
      this.cleanupWeakRefs();
    }, 30000); // 每30秒清理一次
  }

  static getInstance(): GlobalComponentManager {
    if (!GlobalComponentManager.instance) {
      GlobalComponentManager.instance = new GlobalComponentManager();
    }
    return GlobalComponentManager.instance;
  }

  /**
   * 注册组件
   */
  register(component: BaseComponent): void {
    const WeakRefCtor: any = (globalThis as any).WeakRef
    const weakRef: any = WeakRefCtor ? new WeakRefCtor(component) : { deref: () => component }
    this.components.set(component.id, weakRef);
    this.performanceStats.totalCreated++;
    this.updatePeakConcurrentComponents();
  }

  /**
   * 注销组件
   */
  unregister(componentId: string): void {
    this.components.delete(componentId);
    this.performanceStats.totalDestroyed++;
  }

  /**
   * 获取活跃组件数量
   */
  getActiveComponentCount(): number {
    let count = 0;
    this.components.forEach(weakRef => {
      const component = weakRef && typeof weakRef.deref === 'function' ? weakRef.deref() : undefined;
      if (component && component.state !== 'destroyed') {
        count++;
      }
    });
    return count;
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats(): typeof GlobalComponentManager.prototype.performanceStats {
    return { ...this.performanceStats };
  }

  /**
   * 强制清理所有组件
   */
  async forceCleanupAll(): Promise<void> {
    console.log('🧹 强制清理所有组件...');
    const cleanupPromises: Promise<void>[] = [];

    this.components.forEach(weakRef => {
      const component = weakRef && typeof weakRef.deref === 'function' ? weakRef.deref() : undefined;
      if (component && component.state !== 'destroyed') {
        cleanupPromises.push(component.destroy());
      }
    });

    await Promise.allSettled(cleanupPromises);
    this.components.clear();
    console.log('✅ 全局组件清理完成');
  }

  /**
   * 触发全局事件
   */
  emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`全局事件处理器错误 [${event}]:`, error);
        }
      });
    }
  }

  /**
   * 监听全局事件
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * 清理无效的WeakRef
   */
  private cleanupWeakRefs(): void {
    const toDelete: string[] = [];
    this.components.forEach((weakRef, id) => {
      if (!(weakRef && typeof weakRef.deref === 'function' && weakRef.deref())) {
        toDelete.push(id);
      }
    });

    toDelete.forEach(id => {
      this.components.delete(id);
    });

    if (toDelete.length > 0) {
      console.log(`🧹 清理了 ${toDelete.length} 个无效的组件引用`);
    }
  }

  /**
   * 更新峰值并发组件数
   */
  private updatePeakConcurrentComponents(): void {
    const current = this.getActiveComponentCount();
    this.performanceStats.peakConcurrentComponents = Math.max(
      this.performanceStats.peakConcurrentComponents,
      current
    );
  }
}

/**
 * 工厂函数：获取全局组件管理器
 */
export function getGlobalComponentManager(): GlobalComponentManager {
  return GlobalComponentManager.getInstance();
}

/**
 * 工具函数：创建组件性能监控
 */
export function createComponentPerformanceMonitor() {
  const manager = getGlobalComponentManager();

  // 监听生命周期事件
  manager.on('lifecycle:created', (data: ComponentLifecycleEvents['lifecycle:created']) => {
    console.log(`📊 组件创建: ${data.component.name}`);
  });

  manager.on('lifecycle:destroyed', (data: ComponentLifecycleEvents['lifecycle:destroyed']) => {
    const metrics = data.component.metrics;
    console.log(`📊 组件销毁: ${data.component.name}, 生命周期: ${metrics.totalLifetime}ms, 清理任务: ${data.cleanupCount}`);
  });

  return {
    getStats: () => manager.getPerformanceStats(),
    getActiveCount: () => manager.getActiveComponentCount(),
    forceCleanup: () => manager.forceCleanupAll()
  };
}
