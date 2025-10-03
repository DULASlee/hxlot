/**
 * 🧠 全局内存监控系统
 * SmartAbp低代码引擎 - P0级架构优化
 * 
 * 核心功能:
 * - 实时内存使用监控和告警
 * - 内存泄漏检测和自动修复
 * - 性能指标收集和分析
 * - 内存压力自适应管理
 * - 垃圾回收优化建议
 */

import { getGlobalComponentManager } from '../components/BaseComponent';

export type MemoryPressureLevel = 'low' | 'medium' | 'high' | 'critical';
export type MemoryLeakType = 'component' | 'event-listener' | 'timer' | 'observer' | 'cache' | 'unknown';

/**
 * 内存使用统计
 */
export interface MemoryUsageStats {
  /** 总内存使用 (bytes) */
  totalUsage: number;
  /** 堆内存使用 (bytes) */
  heapUsed: number;
  /** 堆内存总大小 (bytes) */
  heapTotal: number;
  /** 外部内存使用 (bytes) */
  external: number;
  /** 内存使用率 (%) */
  usagePercentage: number;
  /** 采样时间 */
  timestamp: number;
}

/**
 * 内存压力警报
 */
export interface MemoryPressureAlert {
  /** 警报ID */
  id: string;
  /** 压力级别 */
  level: MemoryPressureLevel;
  /** 当前内存使用 */
  currentUsage: number;
  /** 内存使用率 */
  usagePercentage: number;
  /** 触发阈值 */
  threshold: number;
  /** 建议操作 */
  recommendations: string[];
  /** 创建时间 */
  createdAt: number;
}

/**
 * 内存泄漏检测结果
 */
export interface MemoryLeakDetection {
  /** 检测ID */
  id: string;
  /** 泄漏类型 */
  type: MemoryLeakType;
  /** 严重程度 */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** 可疑对象数量 */
  suspiciousObjectCount: number;
  /** 内存增长率 (bytes/second) */
  memoryGrowthRate: number;
  /** 检测描述 */
  description: string;
  /** 修复建议 */
  fixSuggestions: string[];
  /** 检测时间 */
  detectedAt: number;
}

/**
 * 垃圾回收统计
 */
export interface GCStats {
  /** 触发次数 */
  triggerCount: number;
  /** 总回收时间 (ms) */
  totalTime: number;
  /** 平均回收时间 (ms) */
  averageTime: number;
  /** 最后回收时间 */
  lastGCTime: number;
  /** 回收内存总量 (bytes) */
  totalMemoryReclaimed: number;
}

/**
 * 内存监控配置
 */
export interface MemoryMonitorConfig {
  /** 监控间隔 (ms) */
  monitorInterval: number;
  /** 内存压力阈值 */
  pressureThresholds: {
    medium: number; // 60%
    high: number;   // 80%
    critical: number; // 95%
  };
  /** 泄漏检测间隔 (ms) */
  leakDetectionInterval: number;
  /** 自动垃圾回收阈值 */
  autoGCThreshold: number;
  /** 历史数据保留时间 (ms) */
  historyRetentionTime: number;
  /** 是否启用自动修复 */
  enableAutoFix: boolean;
}

/**
 * 🧠 全局内存监控器
 */
export class GlobalMemoryMonitor {
  private static instance: GlobalMemoryMonitor;
  private config: MemoryMonitorConfig;
  private isMonitoring = false;
  private monitorTimer?: ReturnType<typeof setInterval>;
  private leakDetectionTimer?: ReturnType<typeof setInterval>;

  // 数据存储
  private memoryHistory: MemoryUsageStats[] = [];
  private pressureAlerts: MemoryPressureAlert[] = [];
  private leakDetections: MemoryLeakDetection[] = [];
  private gcStats: GCStats = {
    triggerCount: 0,
    totalTime: 0,
    averageTime: 0,
    lastGCTime: 0,
    totalMemoryReclaimed: 0
  };

  // 事件监听器
  private eventListeners = new Map<string, Set<Function>>();

  // 内存基线
  private baselineMemory = 0;

  private constructor(config?: Partial<MemoryMonitorConfig>) {
    this.config = {
      monitorInterval: 5000, // 5秒
      pressureThresholds: {
        medium: 0.6,  // 60%
        high: 0.8,    // 80%
        critical: 0.95 // 95%
      },
      leakDetectionInterval: 30000, // 30秒
      autoGCThreshold: 0.85, // 85%
      historyRetentionTime: 30 * 60 * 1000, // 30分钟
      enableAutoFix: true,
      ...config
    };

    this.initializeMonitor();
  }

  static getInstance(config?: Partial<MemoryMonitorConfig>): GlobalMemoryMonitor {
    if (!GlobalMemoryMonitor.instance) {
      GlobalMemoryMonitor.instance = new GlobalMemoryMonitor(config);
    }
    return GlobalMemoryMonitor.instance;
  }

  /**
   * 开始监控
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      console.warn('内存监控已在运行');
      return;
    }

    this.isMonitoring = true;
    console.log('🧠 启动全局内存监控系统');

    // 设置基线内存
    this.establishBaseline();

    // 启动监控定时器
    this.monitorTimer = setInterval(() => {
      this.performMemoryCheck();
    }, this.config.monitorInterval);

    // 启动泄漏检测定时器
    this.leakDetectionTimer = setInterval(() => {
      this.performLeakDetection();
    }, this.config.leakDetectionInterval);

    // 启动历史数据清理
    setInterval(() => {
      this.cleanupHistoryData();
    }, 60000); // 每分钟清理一次
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      console.warn('内存监控未在运行');
      return;
    }

    this.isMonitoring = false;
    console.log('🧠 停止全局内存监控系统');

    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
    }
    if (this.leakDetectionTimer) {
      clearInterval(this.leakDetectionTimer);
    }
  }

  /**
   * 获取当前内存使用情况
   */
  getCurrentMemoryUsage(): MemoryUsageStats | null {
    if (typeof performance === 'undefined' || !('memory' in performance)) {
      console.warn('浏览器不支持内存API');
      return null;
    }

    // ✅ 正确：使用类型扩展替代as any
    interface PerformanceWithMemory extends Performance {
      memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    }

    const performance_typed = performance as PerformanceWithMemory;
    const memory = performance_typed.memory;
    if (!memory) {
      console.warn('浏览器不支持内存API');
      return null;
    }

    const totalUsage = memory.usedJSHeapSize;
    const heapTotal = memory.totalJSHeapSize;
    const usagePercentage = (totalUsage / heapTotal) * 100;

    return {
      totalUsage,
      heapUsed: memory.usedJSHeapSize,
      heapTotal: memory.totalJSHeapSize,
      external: 0, // 浏览器环境下难以获取
      usagePercentage,
      timestamp: Date.now()
    };
  }

  /**
   * 获取内存压力级别
   */
  getMemoryPressureLevel(): MemoryPressureLevel {
    const currentUsage = this.getCurrentMemoryUsage();
    if (!currentUsage) return 'low';

    const percentage = currentUsage.usagePercentage / 100;

    if (percentage >= this.config.pressureThresholds.critical) return 'critical';
    if (percentage >= this.config.pressureThresholds.high) return 'high';
    if (percentage >= this.config.pressureThresholds.medium) return 'medium';
    return 'low';
  }

  /**
   * 强制垃圾回收
   */
  async forceGarbageCollection(): Promise<boolean> {
    const startTime = Date.now();
    const beforeMemory = this.getCurrentMemoryUsage();

    console.log('🧹 触发强制垃圾回收...');

    try {
      // 清理全局组件
      const componentManager = getGlobalComponentManager();
      await componentManager.forceCleanupAll();

      // 浏览器垃圾回收 (如果支持)
      if (typeof window !== 'undefined' && 'gc' in window) {
        // ✅ 正确：使用类型扩展替代as any
        interface WindowWithGC extends Window {
          gc?: () => void;
        }
        const window_typed = window as WindowWithGC;
        window_typed.gc?.();
      }

      // 手动清理
      this.performManualCleanup();

      const afterMemory = this.getCurrentMemoryUsage();
      const endTime = Date.now();
      const gcTime = endTime - startTime;

      if (beforeMemory && afterMemory) {
        const reclaimedMemory = beforeMemory.totalUsage - afterMemory.totalUsage;
        
        // 更新GC统计
        this.gcStats.triggerCount++;
        this.gcStats.totalTime += gcTime;
        this.gcStats.averageTime = this.gcStats.totalTime / this.gcStats.triggerCount;
        this.gcStats.lastGCTime = endTime;
        this.gcStats.totalMemoryReclaimed += Math.max(0, reclaimedMemory);

        console.log(`✅ 垃圾回收完成: 回收 ${(reclaimedMemory / 1024 / 1024).toFixed(2)}MB 内存, 耗时 ${gcTime}ms`);
        
        this.emitEvent('gc:completed', {
          reclaimedMemory,
          gcTime,
          beforeUsage: beforeMemory.usagePercentage,
          afterUsage: afterMemory.usagePercentage
        });

        return true;
      }
    } catch (error) {
      console.error('垃圾回收失败:', error);
      this.emitEvent('gc:failed', { error });
    }

    return false;
  }

  /**
   * 获取内存历史数据
   */
  getMemoryHistory(minutes = 10): MemoryUsageStats[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.memoryHistory.filter(stat => stat.timestamp > cutoff);
  }

  /**
   * 获取压力警报
   */
  getPressureAlerts(limit = 10): MemoryPressureAlert[] {
    return this.pressureAlerts.slice(-limit);
  }

  /**
   * 获取泄漏检测结果
   */
  getLeakDetections(limit = 10): MemoryLeakDetection[] {
    return this.leakDetections.slice(-limit);
  }

  /**
   * 获取GC统计
   */
  getGCStats(): GCStats {
    return { ...this.gcStats };
  }

  /**
   * 获取内存监控报告
   */
  generateMemoryReport(): {
    currentUsage: MemoryUsageStats | null;
    pressureLevel: MemoryPressureLevel;
    recentAlerts: MemoryPressureAlert[];
    recentLeaks: MemoryLeakDetection[];
    gcStats: GCStats;
    recommendations: string[];
  } {
    const currentUsage = this.getCurrentMemoryUsage();
    const pressureLevel = this.getMemoryPressureLevel();
    const recentAlerts = this.getPressureAlerts(5);
    const recentLeaks = this.getLeakDetections(5);
    const recommendations = this.generateRecommendations(pressureLevel, recentLeaks);

    return {
      currentUsage,
      pressureLevel,
      recentAlerts,
      recentLeaks,
      gcStats: this.gcStats,
      recommendations
    };
  }

  // ========== 事件系统 ==========

  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  private emitEvent(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`内存监控事件处理器错误 [${event}]:`, error);
        }
      });
    }
  }

  // ========== 私有方法 ==========

  /**
   * 初始化监控器
   */
  private initializeMonitor(): void {
    if (typeof window !== 'undefined') {
      // 监听页面卸载事件
      window.addEventListener('beforeunload', () => {
        this.stopMonitoring();
      });

      // 监听内存压力事件 (如果支持)
      if ('memory' in navigator) {
        // ✅ 正确：使用类型扩展替代as any
        interface NavigatorWithMemory extends Navigator {
          memory?: {
            addEventListener?: (event: string, handler: (event: Event) => void) => void;
          };
        }
        const navigator_typed = navigator as NavigatorWithMemory;
        const memoryInfo = navigator_typed.memory;
        if (memoryInfo && 'addEventListener' in memoryInfo && memoryInfo.addEventListener) {
          memoryInfo.addEventListener('memorypressure', (event: Event) => {
            this.handleMemoryPressureEvent(event);
          });
        }
      }
    }
  }

  /**
   * 建立内存基线
   */
  private establishBaseline(): void {
    const currentUsage = this.getCurrentMemoryUsage();
    if (currentUsage) {
      this.baselineMemory = currentUsage.totalUsage;
      console.log(`📊 内存基线建立: ${(this.baselineMemory / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  /**
   * 执行内存检查
   */
  private performMemoryCheck(): void {
    const currentUsage = this.getCurrentMemoryUsage();
    if (!currentUsage) return;

    // 添加到历史记录
    this.memoryHistory.push(currentUsage);

    // 检查内存压力
    this.checkMemoryPressure(currentUsage);

    // 检查是否需要自动垃圾回收
    if (this.config.enableAutoFix && 
        currentUsage.usagePercentage / 100 >= this.config.autoGCThreshold) {
      console.log('🤖 触发自动垃圾回收...');
      this.forceGarbageCollection();
    }
  }

  /**
   * 检查内存压力
   */
  private checkMemoryPressure(usage: MemoryUsageStats): void {
    const percentage = usage.usagePercentage / 100;
    let level: MemoryPressureLevel = 'low';
    let threshold = 0;

    if (percentage >= this.config.pressureThresholds.critical) {
      level = 'critical';
      threshold = this.config.pressureThresholds.critical;
    } else if (percentage >= this.config.pressureThresholds.high) {
      level = 'high';
      threshold = this.config.pressureThresholds.high;
    } else if (percentage >= this.config.pressureThresholds.medium) {
      level = 'medium';
      threshold = this.config.pressureThresholds.medium;
    }

    if (level !== 'low') {
      const alert: MemoryPressureAlert = {
        id: `alert-${Date.now()}`,
        level,
        currentUsage: usage.totalUsage,
        usagePercentage: usage.usagePercentage,
        threshold: threshold * 100,
        recommendations: this.generatePressureRecommendations(level),
        createdAt: Date.now()
      };

      this.pressureAlerts.push(alert);
      
      console.warn(`⚠️ 内存压力警报: ${level} (${usage.usagePercentage.toFixed(1)}%)`);
      this.emitEvent('memory:pressure', alert);
    }
  }

  /**
   * 执行泄漏检测
   */
  private performLeakDetection(): void {
    const recentHistory = this.getMemoryHistory(5); // 最近5分钟
    if (recentHistory.length < 10) return; // 数据不足

    // 计算内存增长率
    const oldestUsage = recentHistory[0].totalUsage;
    const newestUsage = recentHistory[recentHistory.length - 1].totalUsage;
    const timeSpan = recentHistory[recentHistory.length - 1].timestamp - recentHistory[0].timestamp;
    const growthRate = (newestUsage - oldestUsage) / (timeSpan / 1000); // bytes/second

    // 检测异常增长
    if (growthRate > 1024 * 1024) { // 超过1MB/秒增长
      const detection: MemoryLeakDetection = {
        id: `leak-${Date.now()}`,
        type: 'unknown',
        severity: this.determineSeverity(growthRate),
        suspiciousObjectCount: 0,
        memoryGrowthRate: growthRate,
        description: `检测到异常内存增长: ${(growthRate / 1024 / 1024).toFixed(2)} MB/秒`,
        fixSuggestions: this.generateLeakFixSuggestions(growthRate),
        detectedAt: Date.now()
      };

      this.leakDetections.push(detection);
      
      console.warn(`🔍 内存泄漏检测: ${detection.description}`);
      this.emitEvent('memory:leak-detected', detection);

      // 自动修复尝试
      if (this.config.enableAutoFix && detection.severity === 'high') {
        this.attemptAutoFix(detection);
      }
    }
  }

  /**
   * 处理内存压力事件
   */
  private handleMemoryPressureEvent(event: Event): void {
    console.warn('🆘 系统内存压力事件:', event);
    this.forceGarbageCollection();
  }

  /**
   * 执行手动清理
   */
  private performManualCleanup(): void {
    // 清理历史数据
    this.cleanupHistoryData();

    // 清理事件监听器中的无效引用
    this.eventListeners.forEach((listeners, event) => {
      const validListeners = new Set<Function>();
      listeners.forEach(listener => {
        // 简单检查函数是否仍然有效
        if (typeof listener === 'function') {
          validListeners.add(listener);
        }
      });
      this.eventListeners.set(event, validListeners);
    });
  }

  /**
   * 清理历史数据
   */
  private cleanupHistoryData(): void {
    const cutoff = Date.now() - this.config.historyRetentionTime;
    
    this.memoryHistory = this.memoryHistory.filter(stat => stat.timestamp > cutoff);
    this.pressureAlerts = this.pressureAlerts.filter(alert => alert.createdAt > cutoff);
    this.leakDetections = this.leakDetections.filter(detection => detection.detectedAt > cutoff);
  }

  /**
   * 生成压力建议
   */
  private generatePressureRecommendations(level: MemoryPressureLevel): string[] {
    const recommendations: string[] = [];

    switch (level) {
      case 'critical':
        recommendations.push('立即执行垃圾回收');
        recommendations.push('关闭非必要功能');
        recommendations.push('清理大型缓存');
        recommendations.push('减少组件实例');
        break;
      case 'high':
        recommendations.push('执行垃圾回收');
        recommendations.push('清理不活跃组件');
        recommendations.push('优化缓存策略');
        break;
      case 'medium':
        recommendations.push('监控内存增长');
        recommendations.push('检查可能的内存泄漏');
        break;
    }

    return recommendations;
  }

  /**
   * 生成泄漏修复建议
   */
  private generateLeakFixSuggestions(growthRate: number): string[] {
    const suggestions: string[] = [];
    const mbPerSecond = growthRate / 1024 / 1024;

    if (mbPerSecond > 10) {
      suggestions.push('检查是否有大量对象未释放');
      suggestions.push('检查事件监听器是否正确清理');
      suggestions.push('检查定时器是否正确清除');
    } else if (mbPerSecond > 5) {
      suggestions.push('检查组件销毁逻辑');
      suggestions.push('检查缓存是否有内存泄漏');
    } else {
      suggestions.push('监控内存使用模式');
      suggestions.push('分析内存分配热点');
    }

    return suggestions;
  }

  /**
   * 确定泄漏严重程度
   */
  private determineSeverity(growthRate: number): 'low' | 'medium' | 'high' | 'critical' {
    const mbPerSecond = growthRate / 1024 / 1024;
    
    if (mbPerSecond > 10) return 'critical';
    if (mbPerSecond > 5) return 'high';
    if (mbPerSecond > 2) return 'medium';
    return 'low';
  }

  /**
   * 生成总体建议
   */
  private generateRecommendations(pressureLevel: MemoryPressureLevel, recentLeaks: MemoryLeakDetection[]): string[] {
    const recommendations = new Set<string>();

    // 基于压力级别的建议
    if (pressureLevel !== 'low') {
      this.generatePressureRecommendations(pressureLevel).forEach(rec => 
        recommendations.add(rec)
      );
    }

    // 基于泄漏检测的建议
    recentLeaks.forEach(leak => {
      leak.fixSuggestions.forEach(suggestion => 
        recommendations.add(suggestion)
      );
    });

    // 通用建议
    if (recommendations.size === 0) {
      recommendations.add('内存使用正常，继续监控');
    }

    return Array.from(recommendations);
  }

  /**
   * 尝试自动修复
   */
  private async attemptAutoFix(detection: MemoryLeakDetection): Promise<void> {
    console.log(`🤖 尝试自动修复内存泄漏: ${detection.type}`);
    
    try {
      await this.forceGarbageCollection();
      console.log('✅ 自动修复完成');
    } catch (error) {
      console.error('❌ 自动修复失败:', error);
    }
  }
}

/**
 * 工厂函数：获取全局内存监控器
 */
export function getGlobalMemoryMonitor(config?: Partial<MemoryMonitorConfig>): GlobalMemoryMonitor {
  return GlobalMemoryMonitor.getInstance(config);
}

/**
 * 工具函数：启动内存监控
 */
export function startMemoryMonitoring(config?: Partial<MemoryMonitorConfig>): GlobalMemoryMonitor {
  const monitor = getGlobalMemoryMonitor(config);
  monitor.startMonitoring();
  return monitor;
}

/**
 * 工具函数：获取内存使用报告
 */
export function getMemoryReport(): ReturnType<GlobalMemoryMonitor['generateMemoryReport']> {
  return getGlobalMemoryMonitor().generateMemoryReport();
}
