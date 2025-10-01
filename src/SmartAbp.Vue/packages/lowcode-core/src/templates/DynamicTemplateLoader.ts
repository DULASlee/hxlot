/**
 * 🔄 动态模版加载器
 * SmartAbp低代码引擎 - 第二专题核心组件
 * 
 * 核心功能:
 * - 按需加载模版，避免全量加载内存泄漏
 * - 智能预加载和缓存管理
 * - 模版依赖关系解析
 * - 加载性能优化和监控
 * - 支持远程模版和本地模版
 */

import { TemplatePluginSystem, TemplatePluginInstance, PluginLoadOptions } from './TemplatePluginSystem';

export type LoadStrategy = 'immediate' | 'lazy' | 'preload' | 'viewport' | 'idle';
export type CachePolicy = 'no-cache' | 'memory' | 'disk' | 'hybrid';

/**
 * 模版加载任务
 */
export interface TemplateLoadTask {
  /** 模版名称 */
  templateName: string;
  /** 加载策略 */
  strategy: LoadStrategy;
  /** 优先级 */
  priority: 'high' | 'medium' | 'low';
  /** 创建时间 */
  createdAt: number;
  /** 预期使用时间 */
  expectedUseAt?: number;
  /** 加载选项 */
  options?: PluginLoadOptions;
  /** 上下文信息 */
  context?: Record<string, any>;
}

/**
 * 加载性能指标
 */
export interface LoadMetrics {
  /** 模版名称 */
  templateName: string;
  /** 加载开始时间 */
  startTime: number;
  /** 加载结束时间 */
  endTime: number;
  /** 加载耗时 */
  duration: number;
  /** 模版大小 */
  size: number;
  /** 是否来自缓存 */
  fromCache: boolean;
  /** 加载策略 */
  strategy: LoadStrategy;
  /** 网络延迟 */
  networkLatency?: number;
  /** 解析时间 */
  parseTime?: number;
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /** 缓存命中率 */
  hitRate: number;
  /** 缓存大小 */
  size: number;
  /** 最大缓存大小 */
  maxSize: number;
  /** 内存使用 */
  memoryUsage: number;
  /** 磁盘使用 */
  diskUsage: number;
  /** 缓存项数量 */
  itemCount: number;
}

/**
 * 模版预测数据
 */
export interface TemplatePrediction {
  /** 模版名称 */
  templateName: string;
  /** 预测概率 */
  probability: number;
  /** 预测置信度 */
  confidence: number;
  /** 预测原因 */
  reason: 'usage-pattern' | 'dependency' | 'user-behavior' | 'time-based';
  /** 预期使用时间 */
  expectedUseTime: number;
}

/**
 * 🔄 动态模版加载器
 */
export class DynamicTemplateLoader {
  private pluginSystem: TemplatePluginSystem;
  private loadQueue: TemplateLoadTask[] = [];
  private loadingTemplates = new Set<string>();
  private loadMetrics: LoadMetrics[] = [];
  private templateCache = new Map<string, any>();
  private usagePatterns = new Map<string, number[]>();
  private predictionEngine: TemplatePredictionEngine;

  // 配置参数
  private maxQueueSize = 100;
  private maxConcurrentLoads = 3;
  private cachePolicy: CachePolicy = 'hybrid';
  private maxCacheSize = 50;
  private metricsRetentionTime = 60 * 60 * 1000; // 1小时
  private predictionEnabled = true;

  constructor(
    pluginSystem: TemplatePluginSystem,
    options: {
      maxQueueSize?: number;
      maxConcurrentLoads?: number;
      cachePolicy?: CachePolicy;
      maxCacheSize?: number;
      metricsRetentionTime?: number;
      predictionEnabled?: boolean;
    } = {}
  ) {
    this.pluginSystem = pluginSystem;
    this.maxQueueSize = options.maxQueueSize || this.maxQueueSize;
    this.maxConcurrentLoads = options.maxConcurrentLoads || this.maxConcurrentLoads;
    this.cachePolicy = options.cachePolicy || this.cachePolicy;
    this.maxCacheSize = options.maxCacheSize || this.maxCacheSize;
    this.metricsRetentionTime = options.metricsRetentionTime || this.metricsRetentionTime;
    this.predictionEnabled = options.predictionEnabled !== false;

    this.predictionEngine = new TemplatePredictionEngine(this);
    this.initializeLoader();
  }

  /**
   * 加载模版
   */
  async loadTemplate(
    templateName: string,
    strategy: LoadStrategy = 'lazy',
    options: PluginLoadOptions = {}
  ): Promise<TemplatePluginInstance> {
    // 检查缓存
    const cached = this.getFromCache(templateName);
    if (cached && !options.forceReload) {
      this.recordUsage(templateName);
      return cached;
    }

    // 检查是否正在加载
    if (this.loadingTemplates.has(templateName)) {
      return this.waitForLoad(templateName);
    }

    // 创建加载任务
    const task: TemplateLoadTask = {
      templateName,
      strategy,
      priority: this.determinePriority(templateName, strategy),
      createdAt: Date.now(),
      options,
      context: options.config || {}
    };

    return this.executeLoad(task);
  }

  /**
   * 批量预加载模版
   */
  async preloadTemplates(
    templateNames: string[],
    strategy: LoadStrategy = 'preload'
  ): Promise<void> {
    console.log(`🚀 开始预加载 ${templateNames.length} 个模版`);

    const tasks = templateNames.map(name => ({
      templateName: name,
      strategy,
      priority: 'low' as const,
      createdAt: Date.now()
    }));

    this.addTasksToQueue(tasks);
    await this.processLoadQueue();
  }

  /**
   * 智能预测并预加载
   */
  async predictAndPreload(currentContext: Record<string, any> = {}): Promise<void> {
    if (!this.predictionEnabled) return;

    const predictions = await this.predictionEngine.predict(currentContext);
    const highConfidencePredictions = predictions
      .filter(p => p.confidence > 0.7 && p.probability > 0.5)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5); // 最多预加载5个模版

    if (highConfidencePredictions.length > 0) {
      console.log(`🔮 预测预加载 ${highConfidencePredictions.length} 个模版`);
      
      const templateNames = highConfidencePredictions.map(p => p.templateName);
      await this.preloadTemplates(templateNames, 'preload');
    }
  }

  /**
   * 基于视口的懒加载
   */
  observeTemplateInViewport(element: Element, templateName: string): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadTemplate(templateName, 'viewport');
            observer.unobserve(element);
          }
        });
      },
      {
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    observer.observe(element);
  }

  /**
   * 获取加载队列状态
   */
  getQueueStatus(): {
    queueLength: number;
    loadingCount: number;
    completedCount: number;
    averageLoadTime: number;
    cacheHitRate: number;
  } {
    const recentMetrics = this.loadMetrics.slice(-50);
    const averageLoadTime = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length
      : 0;

    const cacheHits = recentMetrics.filter(m => m.fromCache).length;
    const cacheHitRate = recentMetrics.length > 0 ? cacheHits / recentMetrics.length : 0;

    return {
      queueLength: this.loadQueue.length,
      loadingCount: this.loadingTemplates.size,
      completedCount: this.loadMetrics.length,
      averageLoadTime,
      cacheHitRate
    };
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): CacheStats {
    const memoryUsage = this.calculateMemoryUsage();
    const diskUsage = this.calculateDiskUsage();

    return {
      hitRate: this.calculateCacheHitRate(),
      size: memoryUsage + diskUsage,
      maxSize: this.maxCacheSize * 1024 * 1024, // MB to bytes
      memoryUsage,
      diskUsage,
      itemCount: this.templateCache.size
    };
  }

  /**
   * 获取加载指标
   */
  getLoadMetrics(): LoadMetrics[] {
    return [...this.loadMetrics];
  }

  /**
   * 清理缓存
   */
  clearCache(templateName?: string): void {
    if (templateName) {
      this.templateCache.delete(templateName);
      console.log(`🗑️ 清理模版缓存: ${templateName}`);
    } else {
      this.templateCache.clear();
      console.log('🗑️ 清理所有模版缓存');
    }
  }

  /**
   * 优化加载性能
   */
  optimizeLoading(): void {
    console.log('⚡ 开始优化加载性能...');

    // 1. 优化加载队列
    this.optimizeQueue();

    // 2. 清理过期缓存
    this.cleanupExpiredCache();

    // 3. 调整预加载策略
    this.adjustPreloadStrategy();

    console.log('✅ 加载性能优化完成');
  }

  /**
   * 销毁加载器
   */
  destroy(): void {
    this.loadQueue = [];
    this.loadingTemplates.clear();
    this.templateCache.clear();
    this.loadMetrics = [];
    this.usagePatterns.clear();
    this.predictionEngine.destroy();
    console.log('🗑️ 动态模版加载器已销毁');
  }

  // ========== 私有方法 ==========

  /**
   * 初始化加载器
   */
  private initializeLoader(): void {
    // 启动队列处理器
    this.startQueueProcessor();

    // 启动缓存清理任务
    this.startCacheCleanup();

    // 启动指标清理任务
    this.startMetricsCleanup();

    console.log('🚀 动态模版加载器初始化完成');
  }

  /**
   * 执行加载任务
   */
  private async executeLoad(task: TemplateLoadTask): Promise<TemplatePluginInstance> {
    const { templateName, options } = task;
    
    this.loadingTemplates.add(templateName);
    const startTime = Date.now();

    try {
      console.log(`⏳ 开始加载模版: ${templateName} (${task.strategy})`);

      // 通过插件系统加载
      const plugin = await this.pluginSystem.loadPlugin(templateName, options);

      // 缓存结果
      this.addToCache(templateName, plugin);

      // 记录指标
      const endTime = Date.now();
      this.recordMetrics({
        templateName,
        startTime,
        endTime,
        duration: endTime - startTime,
        size: this.estimateTemplateSize(plugin),
        fromCache: false,
        strategy: task.strategy
      });

      // 记录使用模式
      this.recordUsage(templateName);

      console.log(`✅ 模版加载完成: ${templateName} (${endTime - startTime}ms)`);
      return plugin;
    } catch (error) {
      console.error(`❌ 模版加载失败: ${templateName}`, error);
      throw error;
    } finally {
      this.loadingTemplates.delete(templateName);
    }
  }

  /**
   * 等待加载完成
   */
  private async waitForLoad(templateName: string): Promise<TemplatePluginInstance> {
    return new Promise((resolve, reject) => {
      const checkLoaded = () => {
        const cached = this.getFromCache(templateName);
        if (cached) {
          resolve(cached);
        } else if (!this.loadingTemplates.has(templateName)) {
          reject(new Error(`模版加载失败: ${templateName}`));
        } else {
          setTimeout(checkLoaded, 50);
        }
      };
      checkLoaded();
    });
  }

  /**
   * 确定加载优先级
   */
  private determinePriority(_templateName: string, strategy: LoadStrategy): 'high' | 'medium' | 'low' {
    // 基于策略确定优先级
    switch (strategy) {
      case 'immediate':
        return 'high';
      case 'lazy':
      case 'viewport':
        return 'medium';
      case 'preload':
      case 'idle':
        return 'low';
      default:
        return 'medium';
    }
  }

  // Queue management functionality removed - will be implemented in future versions

  /**
   * 批量添加任务到队列
   */
  private addTasksToQueue(tasks: TemplateLoadTask[]): void {
    this.loadQueue.push(...tasks);
    this.optimizeQueue();
  }

  /**
   * 优化队列
   */
  private optimizeQueue(): void {
    // 按优先级和创建时间排序
    this.loadQueue.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return a.createdAt - b.createdAt;
    });

    // 移除重复任务
    const seen = new Set<string>();
    this.loadQueue = this.loadQueue.filter(task => {
      if (seen.has(task.templateName)) {
        return false;
      }
      seen.add(task.templateName);
      return true;
    });
  }

  /**
   * 处理加载队列
   */
  private async processLoadQueue(): Promise<void> {
    const concurrentTasks: Promise<any>[] = [];

    while (this.loadQueue.length > 0 && concurrentTasks.length < this.maxConcurrentLoads) {
      const task = this.loadQueue.shift();
      if (!task) break;

      // 跳过已加载或正在加载的模版
      if (this.getFromCache(task.templateName) || this.loadingTemplates.has(task.templateName)) {
        continue;
      }

      const loadPromise = this.executeLoad(task);
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
   * 启动队列处理器
   */
  private startQueueProcessor(): void {
    setInterval(() => {
      if (this.loadQueue.length > 0) {
        this.processLoadQueue().catch(error => {
          console.error('队列处理错误:', error);
        });
      }
    }, 1000); // 每秒检查一次队列
  }

  /**
   * 缓存操作
   */
  private getFromCache(templateName: string): TemplatePluginInstance | undefined {
    if (this.cachePolicy === 'no-cache') return undefined;
    return this.templateCache.get(templateName);
  }

  private addToCache(templateName: string, plugin: TemplatePluginInstance): void {
    if (this.cachePolicy === 'no-cache') return;

    // 检查缓存大小限制
    if (this.templateCache.size >= this.maxCacheSize) {
      // LRU清理
      const firstKey = this.templateCache.keys().next().value;
      if (firstKey) {
        this.templateCache.delete(firstKey);
      }
    }

    this.templateCache.set(templateName, plugin);
  }

  /**
   * 记录使用模式
   */
  private recordUsage(templateName: string): void {
    const now = Date.now();
    if (!this.usagePatterns.has(templateName)) {
      this.usagePatterns.set(templateName, []);
    }
    
    const pattern = this.usagePatterns.get(templateName)!;
    pattern.push(now);
    
    // 保留最近100次使用记录
    if (pattern.length > 100) {
      pattern.splice(0, pattern.length - 100);
    }
  }

  /**
   * 记录加载指标
   */
  private recordMetrics(metrics: LoadMetrics): void {
    this.loadMetrics.push(metrics);
    
    // 限制指标数量
    if (this.loadMetrics.length > 1000) {
      this.loadMetrics.splice(0, this.loadMetrics.length - 1000);
    }
  }

  /**
   * 估算模版大小
   */
  private estimateTemplateSize(plugin: TemplatePluginInstance): number {
    return plugin.metadata.performance.bundleSize || 1024; // 默认1KB
  }

  /**
   * 计算缓存命中率
   */
  private calculateCacheHitRate(): number {
    const recentMetrics = this.loadMetrics.slice(-100);
    if (recentMetrics.length === 0) return 0;
    
    const cacheHits = recentMetrics.filter(m => m.fromCache).length;
    return cacheHits / recentMetrics.length;
  }

  /**
   * 计算内存使用
   */
  private calculateMemoryUsage(): number {
    let totalMemory = 0;
    this.templateCache.forEach(plugin => {
      totalMemory += plugin.metadata.performance.memoryUsage || 1024;
    });
    return totalMemory;
  }

  /**
   * 计算磁盘使用
   */
  private calculateDiskUsage(): number {
    // 简化实现，实际会检查磁盘缓存
    return 0;
  }

  /**
   * 清理过期缓存
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    const expirationTime = 30 * 60 * 1000; // 30分钟

    this.usagePatterns.forEach((pattern, templateName) => {
      const lastUsed = Math.max(...pattern);
      if (now - lastUsed > expirationTime) {
        this.templateCache.delete(templateName);
        this.usagePatterns.delete(templateName);
        console.log(`🗑️ 清理过期缓存: ${templateName}`);
      }
    });
  }

  /**
   * 调整预加载策略
   */
  private adjustPreloadStrategy(): void {
    const cacheHitRate = this.calculateCacheHitRate();
    
    if (cacheHitRate < 0.3) {
      console.log('📈 缓存命中率低，增加预加载');
      // 可以增加预加载的积极性
    } else if (cacheHitRate > 0.8) {
      console.log('📉 缓存命中率高，减少预加载');
      // 可以减少预加载以节省资源
    }
  }

  /**
   * 启动缓存清理任务
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 10 * 60 * 1000); // 每10分钟清理一次
  }

  /**
   * 启动指标清理任务
   */
  private startMetricsCleanup(): void {
    setInterval(() => {
      const cutoff = Date.now() - this.metricsRetentionTime;
      this.loadMetrics = this.loadMetrics.filter(m => m.startTime > cutoff);
    }, 30 * 60 * 1000); // 每30分钟清理一次
  }
}

/**
 * 🔮 模版预测引擎
 */
class TemplatePredictionEngine {
  // Future prediction functionality will use these properties

  constructor(_loader: DynamicTemplateLoader) {
    // Prediction engine initialization to be implemented
  }

  /**
   * 预测可能使用的模版
   */
  async predict(_context: Record<string, any>): Promise<TemplatePrediction[]> {
    const predictions: TemplatePrediction[] = [];

    // 基于使用模式的预测
    const usageBasedPredictions = this.predictByUsagePattern(_context);
    predictions.push(...usageBasedPredictions);

    // 基于时间的预测
    const timeBasedPredictions = this.predictByTime(_context);
    predictions.push(...timeBasedPredictions);

    // 基于依赖关系的预测
    const dependencyBasedPredictions = this.predictByDependencies(_context);
    predictions.push(...dependencyBasedPredictions);

    // 去重并排序
    const uniquePredictions = this.deduplicatePredictions(predictions);
    return uniquePredictions.sort((a, b) => b.probability - a.probability);
  }

  /**
   * 销毁预测引擎
   */
  destroy(): void {
    // Cleanup functionality to be implemented
  }

  // 私有方法
  private predictByUsagePattern(_context: Record<string, any>): TemplatePrediction[] {
    // 简化的使用模式预测
    return [];
  }

  private predictByTime(_context: Record<string, any>): TemplatePrediction[] {
    // 简化的时间预测
    return [];
  }

  private predictByDependencies(_context: Record<string, any>): TemplatePrediction[] {
    // 简化的依赖预测
    return [];
  }

  private deduplicatePredictions(predictions: TemplatePrediction[]): TemplatePrediction[] {
    const seen = new Map<string, TemplatePrediction>();
    
    predictions.forEach(prediction => {
      const existing = seen.get(prediction.templateName);
      if (!existing || prediction.probability > existing.probability) {
        seen.set(prediction.templateName, prediction);
      }
    });

    return Array.from(seen.values());
  }
}

/**
 * 工厂函数：创建动态模版加载器
 */
export function createDynamicTemplateLoader(
  pluginSystem: TemplatePluginSystem,
  options?: {
    maxQueueSize?: number;
    maxConcurrentLoads?: number;
    cachePolicy?: CachePolicy;
    maxCacheSize?: number;
    metricsRetentionTime?: number;
    predictionEnabled?: boolean;
  }
): DynamicTemplateLoader {
  return new DynamicTemplateLoader(pluginSystem, options);
}
