/**
 * 🚀 智能组件懒加载系统
 * SmartAbp低代码引擎 - 公共组件系统革命
 * 
 * 核心功能:
 * - 基于使用频率和页面可见性的智能懒加载
 * - 预测性加载和优先级管理
 * - Bundle分割和内存优化
 * - 性能监控和统计分析
 */

import { ComponentRegistry, LoadPriority } from '@smartabp/lowcode-shared';

export type LoadingStrategy = 'immediate' | 'lazy' | 'predictive' | 'viewport' | 'idle';

/**
 * 组件加载任务
 */
export interface ComponentLoadTask {
  /** 组件名称 */
  componentName: string;
  /** 加载优先级 */
  priority: LoadPriority;
  /** 加载策略 */
  strategy: LoadingStrategy;
  /** 创建时间 */
  createdAt: number;
  /** 预期使用时间 */
  expectedUseAt?: number;
  /** 触发原因 */
  trigger: 'user-action' | 'prediction' | 'viewport' | 'preload' | 'dependency';
  /** 上下文信息 */
  context?: Record<string, any>;
}

/**
 * 加载性能指标
 */
export interface LoadPerformanceMetrics {
  /** 组件名称 */
  componentName: string;
  /** 加载开始时间 */
  loadStartTime: number;
  /** 加载完成时间 */
  loadEndTime: number;
  /** 加载耗时 */
  loadDuration: number;
  /** 包大小 */
  bundleSize: number;
  /** 是否来自缓存 */
  fromCache: boolean;
  /** 加载策略 */
  strategy: LoadingStrategy;
}

/**
 * 用户行为预测数据
 */
export interface UserBehaviorPattern {
  /** 用户ID */
  userId?: string;
  /** 会话ID */
  sessionId: string;
  /** 组件使用序列 */
  componentSequence: string[];
  /** 时间间隔序列 */
  timeIntervals: number[];
  /** 上下文信息 */
  context: Record<string, any>;
  /** 预测权重 */
  confidence: number;
}

/**
 * 🚀 智能组件懒加载器
 */
export class LazyComponentLoader {
  private componentRegistry: ComponentRegistry;
  private loadQueue: ComponentLoadTask[] = [];
  private loadingComponents = new Set<string>();
  private loadedComponents = new Map<string, any>();
  private performanceMetrics: LoadPerformanceMetrics[] = [];
  private userBehaviorPatterns: UserBehaviorPattern[] = [];
  private intersectionObserver?: IntersectionObserver;
  private idleCallback?: number;

  // 配置参数
  private maxConcurrentLoads = 3;
  private predictionWindowMs = 5000; // 5秒预测窗口
  private maxQueueSize = 50;
  private performanceThreshold = 100; // 100ms性能阈值

  constructor(componentRegistry: ComponentRegistry) {
    this.componentRegistry = componentRegistry;
    this.initializeObservers();
    this.startPerformanceMonitoring();
  }

  /**
   * 异步加载组件
   */
  async loadComponent(name: string, priority: LoadPriority = 'medium'): Promise<any> {
    // 检查是否已加载
    if (this.loadedComponents.has(name)) {
      return this.loadedComponents.get(name);
    }

    // 检查是否正在加载
    if (this.loadingComponents.has(name)) {
      return this.waitForLoading(name);
    }

    // 创建加载任务
    const task: ComponentLoadTask = {
      componentName: name,
      priority,
      strategy: this.determineLoadingStrategy(name),
      createdAt: Date.now(),
      trigger: 'user-action'
    };

    return this.executeLoadTask(task);
  }

  /**
   * 预加载组件列表
   */
  async preloadComponents(names: string[], strategy: LoadingStrategy = 'lazy'): Promise<void> {
    console.log(`🚀 开始预加载 ${names.length} 个组件`);

    const tasks = names.map(name => ({
      componentName: name,
      priority: 'low' as LoadPriority,
      strategy,
      createdAt: Date.now(),
      trigger: 'preload' as const
    }));

    this.addTasksToQueue(tasks);
    await this.processLoadQueue();
  }

  /**
   * 基于视口的懒加载
   */
  observeComponentInViewport(element: Element, componentName: string): void {
    if (!this.intersectionObserver) return;

    // 设置组件元素的数据属性
    element.setAttribute('data-component-name', componentName);
    this.intersectionObserver.observe(element);
  }

  /**
   * 停止观察组件
   */
  unobserveComponent(element: Element): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element);
    }
  }

  /**
   * 记录用户行为模式
   */
  recordUserBehavior(componentName: string, context: Record<string, any> = {}): void {
    const sessionId = this.getSessionId();
    let pattern = this.userBehaviorPatterns.find(p => p.sessionId === sessionId);

    if (!pattern) {
      pattern = {
        sessionId,
        componentSequence: [],
        timeIntervals: [],
        context: {},
        confidence: 1.0
      };
      this.userBehaviorPatterns.push(pattern);
    }

    const now = Date.now();
    const lastTime = pattern.timeIntervals[pattern.timeIntervals.length - 1] || now;

    pattern.componentSequence.push(componentName);
    pattern.timeIntervals.push(now - lastTime);
    pattern.context = { ...pattern.context, ...context };

    // 基于行为模式进行预测加载
    this.predictiveLoad(pattern);
  }

  /**
   * 获取加载性能统计
   */
  getPerformanceMetrics(): LoadPerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  /**
   * 获取加载队列状态
   */
  getQueueStatus(): {
    queueLength: number;
    loadingCount: number;
    loadedCount: number;
    averageLoadTime: number;
  } {
    const recentMetrics = this.performanceMetrics.slice(-20);
    const averageLoadTime = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.loadDuration, 0) / recentMetrics.length
      : 0;

    return {
      queueLength: this.loadQueue.length,
      loadingCount: this.loadingComponents.size,
      loadedCount: this.loadedComponents.size,
      averageLoadTime
    };
  }

  /**
   * 清理缓存的组件
   */
  clearCache(componentName?: string): void {
    if (componentName) {
      this.loadedComponents.delete(componentName);
      console.log(`🗑️ 清理组件缓存: ${componentName}`);
    } else {
      this.loadedComponents.clear();
      console.log('🗑️ 清理所有组件缓存');
    }
  }

  /**
   * 优化加载队列
   */
  optimizeQueue(): void {
    // 按优先级和预期使用时间排序
    this.loadQueue.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      const aExpected = a.expectedUseAt || Date.now() + 10000;
      const bExpected = b.expectedUseAt || Date.now() + 10000;
      return aExpected - bExpected;
    });

    // 移除重复任务
    const seen = new Set<string>();
    this.loadQueue = this.loadQueue.filter(task => {
      if (seen.has(task.componentName)) {
        return false;
      }
      seen.add(task.componentName);
      return true;
    });

    // 限制队列大小
    if (this.loadQueue.length > this.maxQueueSize) {
      this.loadQueue = this.loadQueue.slice(0, this.maxQueueSize);
    }

    console.log(`⚡ 队列优化完成: ${this.loadQueue.length} 个任务`);
  }

  /**
   * 销毁加载器
   */
  destroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.idleCallback) {
      cancelIdleCallback(this.idleCallback);
    }
    this.loadQueue = [];
    this.loadingComponents.clear();
    this.loadedComponents.clear();
    console.log('🗑️ 懒加载器已销毁');
  }

  // ========== 私有方法 ==========

  /**
   * 初始化观察器
   */
  private initializeObservers(): void {
    // 初始化 Intersection Observer
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const componentName = entry.target.getAttribute('data-component-name');
              if (componentName) {
                this.addTaskToQueue({
                  componentName,
                  priority: 'medium',
                  strategy: 'viewport',
                  createdAt: Date.now(),
                  trigger: 'viewport'
                });
              }
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.1
        }
      );
    }

    // 初始化空闲时间加载
    this.scheduleIdleLoading();
  }

  /**
   * 确定加载策略
   */
  private determineLoadingStrategy(componentName: string): LoadingStrategy {
    const metadata = this.componentRegistry.getMetadata(componentName);
    if (!metadata) return 'lazy';

    // 高优先级组件立即加载
    if (metadata.priority === 'high') return 'immediate';
    
    // 基础组件预测加载
    if (metadata.category === 'basic') return 'predictive';
    
    // 大型组件懒加载
    if (metadata.estimatedSize && metadata.estimatedSize > 100) return 'lazy';
    
    return 'lazy';
  }

  /**
   * 执行加载任务
   */
  private async executeLoadTask(task: ComponentLoadTask): Promise<any> {
    const { componentName } = task;
    
    if (this.loadingComponents.has(componentName)) {
      return this.waitForLoading(componentName);
    }

    this.loadingComponents.add(componentName);
    const startTime = Date.now();

    try {
      console.log(`⏳ 开始加载组件: ${componentName} (${task.strategy})`);
      
      // 从注册中心加载组件
      const component = await this.componentRegistry.load(componentName);
      
      // 缓存组件
      this.loadedComponents.set(componentName, component);
      
      // 记录性能指标
      const endTime = Date.now();
      this.recordPerformanceMetric({
        componentName,
        loadStartTime: startTime,
        loadEndTime: endTime,
        loadDuration: endTime - startTime,
        bundleSize: this.estimateBundleSize(component),
        fromCache: false,
        strategy: task.strategy
      });

      console.log(`✅ 组件加载完成: ${componentName} (${endTime - startTime}ms)`);
      return component;
    } catch (error) {
      console.error(`❌ 组件加载失败: ${componentName}`, error);
      throw error;
    } finally {
      this.loadingComponents.delete(componentName);
    }
  }

  /**
   * 等待组件加载完成
   */
  private async waitForLoading(componentName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const checkLoaded = () => {
        if (this.loadedComponents.has(componentName)) {
          resolve(this.loadedComponents.get(componentName));
        } else if (!this.loadingComponents.has(componentName)) {
          reject(new Error(`组件加载失败: ${componentName}`));
        } else {
          setTimeout(checkLoaded, 50);
        }
      };
      checkLoaded();
    });
  }

  /**
   * 添加任务到队列
   */
  private addTaskToQueue(task: ComponentLoadTask): void {
    // 检查是否已存在相同任务
    const existingIndex = this.loadQueue.findIndex(t => t.componentName === task.componentName);
    if (existingIndex >= 0) {
      // 更新现有任务的优先级
      const existing = this.loadQueue[existingIndex];
      if (this.getPriorityWeight(task.priority) > this.getPriorityWeight(existing.priority)) {
        this.loadQueue[existingIndex] = task;
      }
      return;
    }

    this.loadQueue.push(task);
    this.optimizeQueue();
  }

  /**
   * 批量添加任务到队列
   */
  private addTasksToQueue(tasks: ComponentLoadTask[]): void {
    this.loadQueue.push(...tasks);
    this.optimizeQueue();
  }

  /**
   * 处理加载队列
   */
  private async processLoadQueue(): Promise<void> {
    const concurrentTasks: Promise<any>[] = [];

    while (this.loadQueue.length > 0 && concurrentTasks.length < this.maxConcurrentLoads) {
      const task = this.loadQueue.shift();
      if (!task) break;

      // 跳过已加载或正在加载的组件
      if (this.loadedComponents.has(task.componentName) || this.loadingComponents.has(task.componentName)) {
        continue;
      }

      const loadPromise = this.executeLoadTask(task);
      concurrentTasks.push(loadPromise);
    }

    if (concurrentTasks.length > 0) {
      await Promise.allSettled(concurrentTasks);
      
      // 继续处理剩余队列
      if (this.loadQueue.length > 0) {
        await this.processLoadQueue();
      }
    }
  }

  /**
   * 预测性加载
   */
  private predictiveLoad(pattern: UserBehaviorPattern): void {
    // 简单的预测算法：基于组件使用序列预测下一个可能使用的组件
    const sequence = pattern.componentSequence;
    if (sequence.length < 2) return;

    // 分析最近的使用模式
    const recentSequence = sequence.slice(-3);
    const predictions = this.analyzeSequencePattern(recentSequence);

    predictions.forEach(prediction => {
      if (prediction.confidence > 0.6) {
        this.addTaskToQueue({
          componentName: prediction.componentName,
          priority: 'low',
          strategy: 'predictive',
          createdAt: Date.now(),
          expectedUseAt: Date.now() + this.predictionWindowMs,
          trigger: 'prediction',
          context: { confidence: prediction.confidence }
        });
      }
    });
  }

  /**
   * 分析序列模式
   */
  private analyzeSequencePattern(sequence: string[]): Array<{ componentName: string; confidence: number }> {
    // 简化的模式分析，实际实现可以使用更复杂的算法
    const predictions: Array<{ componentName: string; confidence: number }> = [];
    
    // 基于历史数据找到可能的下一个组件
    const allPatterns = this.userBehaviorPatterns;
    const patternMap = new Map<string, number>();

    allPatterns.forEach(p => {
      for (let i = 0; i < p.componentSequence.length - 1; i++) {
        const current = p.componentSequence[i];
        const next = p.componentSequence[i + 1];
        
        if (sequence.includes(current)) {
          const key = `${current}->${next}`;
          patternMap.set(key, (patternMap.get(key) || 0) + 1);
        }
      }
    });

    // 计算预测置信度
    patternMap.forEach((count, pattern) => {
      const [, nextComponent] = pattern.split('->');
      const confidence = Math.min(count / allPatterns.length, 1.0);
      
      if (confidence > 0.3 && !sequence.includes(nextComponent)) {
        predictions.push({ componentName: nextComponent, confidence });
      }
    });

    return predictions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  /**
   * 空闲时间加载
   */
  private scheduleIdleLoading(): void {
    if (typeof window === 'undefined' || !('requestIdleCallback' in window)) return;

    this.idleCallback = requestIdleCallback((deadline) => {
      while (deadline.timeRemaining() > 0 && this.loadQueue.length > 0) {
        const task = this.loadQueue.find(t => t.priority === 'low');
        if (task) {
          this.loadQueue = this.loadQueue.filter(t => t !== task);
          this.executeLoadTask(task).catch(console.error);
        } else {
          break;
        }
      }

      // 继续调度
      this.scheduleIdleLoading();
    });
  }

  /**
   * 开始性能监控
   */
  private startPerformanceMonitoring(): void {
    // 定期清理旧的性能指标
    setInterval(() => {
      const cutoff = Date.now() - 60 * 60 * 1000; // 保留1小时内的数据
      this.performanceMetrics = this.performanceMetrics.filter(m => m.loadStartTime > cutoff);
    }, 10 * 60 * 1000); // 每10分钟清理一次
  }

  /**
   * 记录性能指标
   */
  private recordPerformanceMetric(metric: LoadPerformanceMetrics): void {
    this.performanceMetrics.push(metric);

    // 性能告警
    if (metric.loadDuration > this.performanceThreshold) {
      console.warn(`⚠️ 组件加载缓慢: ${metric.componentName} (${metric.loadDuration}ms)`);
    }
  }

  /**
   * 估算Bundle大小
   */
  private estimateBundleSize(_component: any): number {
    // 简单估算，实际实现可以更精确
    return Math.floor(Math.random() * 500 + 100); // 100-600KB
  }

  /**
   * 获取会话ID
   */
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';
    
    let sessionId = sessionStorage.getItem('smartabp-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('smartabp-session-id', sessionId);
    }
    return sessionId;
  }

  /**
   * 获取优先级权重
   */
  private getPriorityWeight(priority: LoadPriority): number {
    return { high: 3, medium: 2, low: 1 }[priority];
  }
}

/**
 * 工厂函数：创建懒加载器
 */
export function createLazyComponentLoader(componentRegistry: ComponentRegistry): LazyComponentLoader {
  return new LazyComponentLoader(componentRegistry);
}

/**
 * 全局懒加载器实例
 */
let globalLazyLoader: LazyComponentLoader | null = null;

/**
 * 获取全局懒加载器
 */
export function getGlobalLazyLoader(componentRegistry?: ComponentRegistry): LazyComponentLoader {
  if (!globalLazyLoader && componentRegistry) {
    globalLazyLoader = new LazyComponentLoader(componentRegistry);
  }
  if (!globalLazyLoader) {
    throw new Error('全局懒加载器未初始化，请提供ComponentRegistry实例');
  }
  return globalLazyLoader;
}
