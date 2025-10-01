import { ComponentInstance } from '@smartabp/lowcode-shared';

/**
 * 🧠 组件内存管理系统
 * SmartAbp低代码引擎 - 公共组件系统革命
 * 
 * 核心功能:
 * - LRU算法的组件内存管理
 * - 实时内存监控和压力检测
 * - 智能垃圾回收和资源释放
 * - 内存泄漏检测和修复
 * - 性能分析和优化建议
 */

// 添加PerformanceMemory接口定义
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export type MemoryPressureLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * LRU缓存节点
 */
interface LRUNode<K, V> {
  key: K;
  value: V;
  prev?: LRUNode<K, V>;
  next?: LRUNode<K, V>;
  accessTime: number;
  accessCount: number;
}

/**
 * 内存使用报告
 */
export interface MemoryReport {
  /** 总内存使用 (bytes) */
  totalMemoryUsage: number;
  /** 组件数量 */
  componentCount: number;
  /** 活跃组件数量 */
  activeComponentCount: number;
  /** 内存压力级别 */
  pressureLevel: MemoryPressureLevel;
  /** 最大内存使用 */
  maxMemoryUsage: number;
  /** 内存使用率 */
  memoryUsagePercentage: number;
  /** 最近GC时间 */
  lastGCTime: number;
  /** GC次数 */
  gcCount: number;
  /** 内存碎片率 */
  fragmentationRate: number;
  /** 建议操作 */
  recommendations: string[];
}

/**
 * 内存泄漏检测结果
 */
export interface MemoryLeakDetection {
  /** 是否检测到泄漏 */
  hasLeak: boolean;
  /** 可疑组件列表 */
  suspiciousComponents: string[];
  /** 泄漏类型 */
  leakType: 'event-listener' | 'timer' | 'reference' | 'dom' | 'unknown';
  /** 严重程度 */
  severity: 'low' | 'medium' | 'high';
  /** 建议修复方案 */
  fixSuggestions: string[];
}

/**
 * 性能监控指标
 */
export interface PerformanceMonitor {
  /** CPU使用率 */
  cpuUsage: number;
  /** 内存使用率 */
  memoryUsage: number;
  /** 渲染帧率 */
  fps: number;
  /** 响应时间 */
  responseTime: number;
  /** 错误率 */
  errorRate: number;
}

/**
 * 🧠 LRU缓存实现
 */
class LRUCache<K, V> {
  private capacity: number;
  private size: number = 0;
  private cache = new Map<K, LRUNode<K, V>>();
  private head?: LRUNode<K, V>;
  private tail?: LRUNode<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  /**
   * 获取值
   */
  get(key: K): V | undefined {
    const node = this.cache.get(key);
    if (!node) return undefined;

    // 更新访问信息
    node.accessTime = Date.now();
    node.accessCount++;

    // 移动到头部
    this.moveToHead(node);
    return node.value;
  }

  /**
   * 设置值
   */
  set(key: K, value: V): void {
    const existingNode = this.cache.get(key);

    if (existingNode) {
      // 更新现有节点
      existingNode.value = value;
      existingNode.accessTime = Date.now();
      existingNode.accessCount++;
      this.moveToHead(existingNode);
    } else {
      // 创建新节点
      const newNode: LRUNode<K, V> = {
        key,
        value,
        accessTime: Date.now(),
        accessCount: 1
      };

      this.cache.set(key, newNode);
      this.addToHead(newNode);
      this.size++;

      // 检查容量限制
      if (this.size > this.capacity) {
        const tail = this.removeTail();
        if (tail) {
          this.cache.delete(tail.key);
          this.size--;
        }
      }
    }
  }

  /**
   * 删除值
   */
  delete(key: K): boolean {
    const node = this.cache.get(key);
    if (!node) return false;

    this.removeNode(node);
    this.cache.delete(key);
    this.size--;
    return true;
  }

  /**
   * 获取所有键
   */
  keys(): K[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 获取所有值
   */
  values(): V[] {
    return Array.from(this.cache.values()).map(node => node.value);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.head = undefined;
    this.tail = undefined;
    this.size = 0;
  }

  /**
   * 获取缓存大小
   */
  getSize(): number {
    return this.size;
  }

  /**
   * 获取最少使用的项
   */
  getLRUItems(count: number): Array<{ key: K; value: V; accessTime: number; accessCount: number }> {
    const items: Array<{ key: K; value: V; accessTime: number; accessCount: number }> = [];
    let current = this.tail;
    
    while (current && items.length < count) {
      items.push({
        key: current.key,
        value: current.value,
        accessTime: current.accessTime,
        accessCount: current.accessCount
      });
      current = current.prev;
    }
    
    return items;
  }

  // 私有方法
  private addToHead(node: LRUNode<K, V>): void {
    node.prev = undefined;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: LRUNode<K, V>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  private moveToHead(node: LRUNode<K, V>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private removeTail(): LRUNode<K, V> | undefined {
    const lastNode = this.tail;
    if (lastNode) {
      this.removeNode(lastNode);
    }
    return lastNode;
  }
}

/**
 * 🧠 组件内存管理器
 */
export class ComponentMemoryManager {
  private lruCache: LRUCache<string, ComponentInstance>;
  private memoryThreshold: number = 100 * 1024 * 1024; // 100MB
  private maxComponents: number = 200;
  private gcInterval: number = 30 * 1000; // 30秒
  private gcTimer?: ReturnType<typeof setInterval>;
  private performanceObserver?: PerformanceObserver;
  // Memory observer functionality to be implemented in future versions
  private leakDetectionEnabled = true;
  private gcCount = 0;
  private lastGCTime = 0;

  // 性能监控
  private performanceMetrics: PerformanceMonitor = {
    cpuUsage: 0,
    memoryUsage: 0,
    fps: 0,
    responseTime: 0,
    errorRate: 0
  };

  constructor(options: {
    memoryThreshold?: number;
    maxComponents?: number;
    gcInterval?: number;
    enableLeakDetection?: boolean;
  } = {}) {
    this.memoryThreshold = options.memoryThreshold || this.memoryThreshold;
    this.maxComponents = options.maxComponents || this.maxComponents;
    this.gcInterval = options.gcInterval || this.gcInterval;
    this.leakDetectionEnabled = options.enableLeakDetection !== false;

    this.lruCache = new LRUCache<string, ComponentInstance>(this.maxComponents);
    this.initializeMonitoring();
    this.startGCScheduler();
  }

  /**
   * 添加组件到内存管理
   */
  addComponent(name: string, component: ComponentInstance): void {
    // 估算组件内存使用
    component.memoryUsage = this.estimateComponentMemory(component);
    
    this.lruCache.set(name, component);
    console.log(`🧠 组件已加入内存管理: ${name} (${component.memoryUsage} bytes)`);

    // 检查内存压力
    this.checkMemoryPressure();
  }

  /**
   * 移除组件
   */
  removeComponent(name: string): void {
    const component = this.lruCache.get(name);
    if (component) {
      this.cleanupComponentResources(component);
      this.lruCache.delete(name);
      console.log(`🗑️ 组件已从内存管理移除: ${name}`);
    }
  }

  /**
   * 获取组件
   */
  getComponent(name: string): ComponentInstance | undefined {
    return this.lruCache.get(name);
  }

  /**
   * 检查内存压力
   */
  checkMemoryPressure(): MemoryPressureLevel {
    const report = this.getMemoryReport();
    const usage = report.memoryUsagePercentage;

    let level: MemoryPressureLevel;
    if (usage > 90) level = 'critical';
    else if (usage > 75) level = 'high';
    else if (usage > 50) level = 'medium';
    else level = 'low';

    if (level === 'critical' || level === 'high') {
      console.warn(`⚠️ 内存压力: ${level} (${usage.toFixed(1)}%)`);
      this.triggerGC();
    }

    return level;
  }

  /**
   * 触发垃圾回收
   */
  async triggerGC(): Promise<void> {
    console.log('🧹 开始垃圾回收...');
    const startTime = Date.now();

    // 获取最少使用的组件
    const lruItems = this.lruCache.getLRUItems(Math.floor(this.maxComponents * 0.3));
    const now = Date.now();
    let cleanedCount = 0;

    for (const item of lruItems) {
      const component = item.value;
      const timeSinceLastAccess = now - item.accessTime;

      // 清理5分钟未使用的非活跃组件
      if (!component.active && timeSinceLastAccess > 5 * 60 * 1000) {
        this.removeComponent(item.key);
        cleanedCount++;
      }
    }

    // 强制浏览器垃圾回收（如果支持）
    if (typeof window !== 'undefined' && 'gc' in window && typeof (window as any).gc === 'function') {
      try {
        (window as any).gc();
      } catch (error) {
        // 忽略错误，gc可能不可用
      }
    }

    this.gcCount++;
    this.lastGCTime = Date.now();
    const duration = this.lastGCTime - startTime;

    console.log(`✅ 垃圾回收完成: 清理了 ${cleanedCount} 个组件 (${duration}ms)`);
  }

  /**
   * 检测内存泄漏
   */
  detectMemoryLeaks(): MemoryLeakDetection {
    if (!this.leakDetectionEnabled) {
      return {
        hasLeak: false,
        suspiciousComponents: [],
        leakType: 'unknown',
        severity: 'low',
        fixSuggestions: []
      };
    }

    const suspiciousComponents: string[] = [];
    const components = this.lruCache.values();
    const now = Date.now();

    // 检测长时间未访问但仍在内存中的组件
    components.forEach(component => {
      const metadata = component.metadata;
      const timeSinceLoad = now - component.loadedAt;
      const timeSinceLastUse = metadata.lastUsed ? now - metadata.lastUsed : timeSinceLoad;

      // 超过30分钟未使用的组件可能存在泄漏
      if (timeSinceLastUse > 30 * 60 * 1000 && component.active) {
        suspiciousComponents.push(metadata.name);
      }
    });

    // 检测内存使用异常增长
    const memoryReport = this.getMemoryReport();
    const hasMemoryGrowth = memoryReport.memoryUsagePercentage > 80;

    const hasLeak = suspiciousComponents.length > 0 || hasMemoryGrowth;
    
    return {
      hasLeak,
      suspiciousComponents,
      leakType: hasMemoryGrowth ? 'reference' : 'unknown',
      severity: hasMemoryGrowth ? 'high' : suspiciousComponents.length > 5 ? 'medium' : 'low',
      fixSuggestions: this.generateLeakFixSuggestions(suspiciousComponents, hasMemoryGrowth)
    };
  }

  /**
   * 获取内存报告
   */
  getMemoryReport(): MemoryReport {
    const components = this.lruCache.values();
    const totalMemoryUsage = components.reduce((sum, comp) => sum + (comp.memoryUsage || 0), 0);
    const activeComponentCount = components.filter(comp => comp.active).length;
    const memoryUsagePercentage = (totalMemoryUsage / this.memoryThreshold) * 100;

    // 计算内存碎片率（简化估算）
    const fragmentationRate = this.calculateFragmentationRate();

    const recommendations = this.generateRecommendations(memoryUsagePercentage, components.length);

    return {
      totalMemoryUsage,
      componentCount: components.length,
      activeComponentCount,
      pressureLevel: this.checkMemoryPressure(),
      maxMemoryUsage: this.memoryThreshold,
      memoryUsagePercentage,
      lastGCTime: this.lastGCTime,
      gcCount: this.gcCount,
      fragmentationRate,
      recommendations
    };
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): PerformanceMonitor {
    this.updatePerformanceMetrics();
    return { ...this.performanceMetrics };
  }

  /**
   * 优化内存使用
   */
  optimizeMemory(): Promise<void> {
    return new Promise((resolve) => {
      console.log('⚡ 开始内存优化...');

      // 1. 清理不活跃组件
      this.triggerGC();

      // 2. 压缩LRU缓存
      this.compressCache();

      // 3. 优化组件实例
      this.optimizeComponentInstances();

      console.log('✅ 内存优化完成');
      resolve();
    });
  }

  /**
   * 销毁内存管理器
   */
  destroy(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
    }
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    // 清理所有组件
    const components = this.lruCache.values();
    components.forEach(component => this.cleanupComponentResources(component));
    
    this.lruCache.clear();
    console.log('🗑️ 内存管理器已销毁');
  }

  // ========== 私有方法 ==========

  /**
   * 初始化监控
   */
  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    // 初始化Performance Observer
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'measure') {
              this.performanceMetrics.responseTime = entry.duration;
            }
          });
        });
        this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (error) {
        console.warn('Performance Observer初始化失败:', error);
      }
    }

    // 监控内存使用（如果支持）
    if ('memory' in performance) {
      setInterval(() => {
        this.updateMemoryMetrics();
      }, 5000);
    }
  }

  /**
   * 启动GC调度器
   */
  private startGCScheduler(): void {
    this.gcTimer = setInterval(() => {
      const pressure = this.checkMemoryPressure();
      if (pressure === 'high' || pressure === 'critical') {
        this.triggerGC();
      }
    }, this.gcInterval);
  }

  /**
   * 估算组件内存使用
   */
  private estimateComponentMemory(component: ComponentInstance): number {
    // 基础内存使用估算
    let memoryUsage = 1024; // 基础1KB

    // 根据组件类型调整
    const category = component.metadata.category;
    const multiplier = {
      basic: 1,
      layout: 2,
      form: 3,
      data: 5,
      chart: 8,
      advanced: 10,
      business: 15
    }[category] || 1;

    memoryUsage *= multiplier;

    // 根据组件复杂度调整
    const estimatedSize = component.metadata.estimatedSize || 0;
    memoryUsage += estimatedSize * 10; // 每KB估算增加10字节内存使用

    return memoryUsage;
  }

  /**
   * 清理组件资源
   */
  private cleanupComponentResources(component: ComponentInstance): void {
    // 清理事件监听器
    if (component.component && typeof component.component.cleanup === 'function') {
      component.component.cleanup();
    }

    // 标记为非活跃
    component.active = false;

    // 清理引用
    component.component = null;
  }

  /**
   * 计算内存碎片率
   */
  private calculateFragmentationRate(): number {
    // 简化的碎片率计算
    const components = this.lruCache.values();
    const totalComponents = components.length;
    const activeComponents = components.filter(comp => comp.active).length;
    
    if (totalComponents === 0) return 0;
    
    const fragmentationRate = ((totalComponents - activeComponents) / totalComponents) * 100;
    return Math.max(0, Math.min(100, fragmentationRate));
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(memoryUsage: number, componentCount: number): string[] {
    const recommendations: string[] = [];

    if (memoryUsage > 80) {
      recommendations.push('内存使用率过高，建议清理不活跃组件');
    }
    if (componentCount > this.maxComponents * 0.8) {
      recommendations.push('组件数量接近上限，建议增加缓存容量或优化组件生命周期');
    }
    if (this.gcCount > 10) {
      recommendations.push('频繁垃圾回收，建议检查是否存在内存泄漏');
    }

    return recommendations;
  }

  /**
   * 生成内存泄漏修复建议
   */
  private generateLeakFixSuggestions(suspiciousComponents: string[], hasMemoryGrowth: boolean): string[] {
    const suggestions: string[] = [];

    if (suspiciousComponents.length > 0) {
      suggestions.push(`检查以下组件的事件监听器清理: ${suspiciousComponents.join(', ')}`);
      suggestions.push('确保组件销毁时正确清理定时器和订阅');
    }

    if (hasMemoryGrowth) {
      suggestions.push('检查是否存在循环引用');
      suggestions.push('使用WeakMap/WeakSet替代强引用');
      suggestions.push('定期执行手动垃圾回收');
    }

    return suggestions;
  }

  /**
   * 更新性能指标
   */
  private updatePerformanceMetrics(): void {
    if (typeof window === 'undefined') return;

    // 更新内存使用率
    if ('memory' in performance) {
      const memory = performance.memory as PerformanceMemory;
      this.performanceMetrics.memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }

    // 更新FPS（简化实现）
    this.performanceMetrics.fps = this.calculateFPS();
  }

  /**
   * 更新内存指标
   */
  private updateMemoryMetrics(): void {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = performance.memory as PerformanceMemory;
      this.performanceMetrics.memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }
  }

  /**
   * 计算FPS
   */
  private calculateFPS(): number {
    // 简化的FPS计算，实际实现会更复杂
    return 60; // 假设60fps
  }

  /**
   * 压缩缓存
   */
  private compressCache(): void {
    const components = this.lruCache.values();
    let compressedCount = 0;

    components.forEach(component => {
      if (!component.active && component.component) {
        // 压缩非活跃组件的数据
        if (typeof component.component.compress === 'function') {
          component.component.compress();
          compressedCount++;
        }
      }
    });

    console.log(`📦 缓存压缩完成: ${compressedCount} 个组件`);
  }

  /**
   * 优化组件实例
   */
  private optimizeComponentInstances(): void {
    const components = this.lruCache.values();
    let optimizedCount = 0;

    components.forEach(component => {
      if (component.component && typeof component.component.optimize === 'function') {
        component.component.optimize();
        optimizedCount++;
      }
    });

    console.log(`⚡ 组件实例优化完成: ${optimizedCount} 个组件`);
  }
}

/**
 * 工厂函数：创建内存管理器
 */
export function createComponentMemoryManager(options?: {
  memoryThreshold?: number;
  maxComponents?: number;
  gcInterval?: number;
  enableLeakDetection?: boolean;
}): ComponentMemoryManager {
  return new ComponentMemoryManager(options);
}

/**
 * 全局内存管理器实例
 */
let globalMemoryManager: ComponentMemoryManager | null = null;

/**
 * 获取全局内存管理器
 */
export function getGlobalMemoryManager(): ComponentMemoryManager {
  if (!globalMemoryManager) {
    globalMemoryManager = new ComponentMemoryManager();
  }
  return globalMemoryManager;
}
