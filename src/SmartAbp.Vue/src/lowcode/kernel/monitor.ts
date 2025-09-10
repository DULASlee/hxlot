/**
 * 性能监控系统
 * 支持指标收集、聚合分析、告警
 */

import type {
  PerformanceMonitor as IPerformanceMonitor,
  PerformanceMetric,
  PerformanceTimer,
  AggregatedMetrics,
  StructuredLogger
} from './types';

// ============= 性能计时器 =============

export class Timer implements PerformanceTimer {
  private startTime: number;
  private endTime?: number;
  private labels: Record<string, string>;

  constructor(
    private name: string,
    private monitor: PerformanceMonitor,
    labels: Record<string, string> = {}
  ) {
    this.startTime = performance.now();
    this.labels = labels;
  }

  end(additionalLabels: Record<string, string> = {}): number {
    this.endTime = performance.now();
    const duration = this.endTime - this.startTime;

    this.monitor.recordDuration(this.name, duration, {
      ...this.labels,
      ...additionalLabels
    });

    return duration;
  }

  getCurrentDuration(): number {
    return performance.now() - this.startTime;
  }
}

// ============= 指标存储 =============

interface MetricEntry {
  metric: PerformanceMetric;
  processed: boolean;
}

export class MetricStorage {
  private metrics: MetricEntry[] = [];
  private maxSize = 10000;
  private retentionPeriod = 24 * 60 * 60 * 1000; // 24小时

  add(metric: PerformanceMetric): void {
    this.metrics.push({ metric, processed: false });

    // 限制存储大小
    if (this.metrics.length > this.maxSize) {
      this.metrics.splice(0, this.metrics.length - this.maxSize);
    }

    // 清理过期数据
    this.cleanup();
  }

  getMetrics(
    name?: string,
    timeRange?: { start: number; end: number }
  ): PerformanceMetric[] {
    let filtered = this.metrics.map(entry => entry.metric);

    if (name) {
      filtered = filtered.filter(metric => metric.name === name);
    }

    if (timeRange) {
      filtered = filtered.filter(
        metric => metric.timestamp >= timeRange.start &&
                  metric.timestamp <= timeRange.end
      );
    }

    return filtered;
  }

  aggregate(
    name: string,
    timeRange: { start: number; end: number }
  ): AggregatedMetrics | null {
    const metrics = this.getMetrics(name, timeRange);

    if (metrics.length === 0) {
      return null;
    }

    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    const sum = values.reduce((acc, val) => acc + val, 0);

    return {
      name,
      count: values.length,
      sum,
      avg: sum / values.length,
      min: values[0],
      max: values[values.length - 1],
      p50: this.percentile(values, 50),
      p95: this.percentile(values, 95),
      p99: this.percentile(values, 99)
    };
  }

  private percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    const index = Math.ceil((p / 100) * values.length) - 1;
    return values[Math.max(0, index)];
  }

  private cleanup(): void {
    const cutoff = Date.now() - this.retentionPeriod;
    this.metrics = this.metrics.filter(
      entry => entry.metric.timestamp > cutoff
    );
  }

  clear(): void {
    this.metrics = [];
  }

  getSize(): number {
    return this.metrics.length;
  }
}

// ============= 告警系统 =============

export interface AlertRule {
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  severity: 'warning' | 'critical';
  enabled: boolean;
  cooldown: number; // 冷却时间（毫秒）
}

export class AlertManager {
  private rules: Map<string, AlertRule> = new Map();
  private lastAlerts: Map<string, number> = new Map();
  private logger?: StructuredLogger;

  constructor(logger?: StructuredLogger) {
    this.logger = logger;
  }

  addRule(rule: AlertRule): void {
    this.rules.set(rule.name, rule);
    this.logger?.info('Alert rule added', { rule: rule.name });
  }

  removeRule(name: string): void {
    this.rules.delete(name);
    this.lastAlerts.delete(name);
    this.logger?.info('Alert rule removed', { rule: name });
  }

  checkMetric(metric: PerformanceMetric): void {
    for (const [ruleName, rule] of this.rules) {
      if (!rule.enabled || rule.metric !== metric.name) {
        continue;
      }

      // 检查冷却时间
      const lastAlert = this.lastAlerts.get(ruleName) || 0;
      if (Date.now() - lastAlert < rule.cooldown) {
        continue;
      }

      if (this.evaluateCondition(metric.value, rule)) {
        this.triggerAlert(rule, metric);
        this.lastAlerts.set(ruleName, Date.now());
      }
    }
  }

  private evaluateCondition(value: number, rule: AlertRule): boolean {
    switch (rule.condition) {
      case 'gt': return value > rule.threshold;
      case 'gte': return value >= rule.threshold;
      case 'lt': return value < rule.threshold;
      case 'lte': return value <= rule.threshold;
      case 'eq': return value === rule.threshold;
      default: return false;
    }
  }

  private triggerAlert(rule: AlertRule, metric: PerformanceMetric): void {
    this.logger?.warn('Performance alert triggered', {
      rule: rule.name,
      metric: metric.name,
      value: metric.value,
      threshold: rule.threshold,
      severity: rule.severity
    });

    // 这里可以添加更多告警处理逻辑，如发送邮件、Webhook等
  }
}

// ============= 性能监控器 =============

export class PerformanceMonitor implements IPerformanceMonitor {
  private storage = new MetricStorage();
  private alertManager = new AlertManager();
  private logger?: StructuredLogger;
  private aggregationInterval = 60000; // 1分钟
  private aggregationTimer?: NodeJS.Timeout;

  constructor(logger?: StructuredLogger) {
    this.logger = logger;
    this.alertManager = new AlertManager(logger);
    this.startAggregation();
  }

  recordMetric(metric: PerformanceMetric): void {
    this.storage.add(metric);
    this.alertManager.checkMetric(metric);

    this.logger?.debug('Metric recorded', {
      name: metric.name,
      value: metric.value,
      unit: metric.unit,
      labels: metric.labels
    });
  }

  startTimer(name: string, labels: Record<string, string> = {}): PerformanceTimer {
    return new Timer(name, this, labels);
  }

  recordDuration(
    name: string,
    duration: number,
    labels: Record<string, string> = {}
  ): void {
    this.recordMetric({
      name,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      labels: { type: 'duration', ...labels }
    });
  }

  recordCount(
    name: string,
    count: number,
    labels: Record<string, string> = {}
  ): void {
    this.recordMetric({
      name,
      value: count,
      unit: 'count',
      timestamp: Date.now(),
      labels: { type: 'counter', ...labels }
    });
  }

  recordGauge(
    name: string,
    value: number,
    labels: Record<string, string> = {}
  ): void {
    this.recordMetric({
      name,
      value,
      unit: 'value',
      timestamp: Date.now(),
      labels: { type: 'gauge', ...labels }
    });
  }

  getMetrics(name?: string): PerformanceMetric[] {
    return this.storage.getMetrics(name);
  }

  getAggregatedMetrics(
    name: string,
    timeRange: { start: number; end: number }
  ): AggregatedMetrics {
    const result = this.storage.aggregate(name, timeRange);
    if (!result) {
      return {
        name,
        count: 0,
        sum: 0,
        avg: 0,
        min: 0,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0
      };
    }
    return result;
  }

  // ============= 告警管理 =============

  addAlertRule(rule: AlertRule): void {
    this.alertManager.addRule(rule);
  }

  removeAlertRule(name: string): void {
    this.alertManager.removeRule(name);
  }

  // ============= 预定义指标 =============

  /**
   * 记录代码生成性能
   */
  recordGenerationMetrics(
    schemaId: string,
    pluginName: string,
    duration: number,
    codeSize: number
  ): void {
    const labels = { schemaId, pluginName };

    this.recordDuration('generation.duration', duration, labels);
    this.recordGauge('generation.code_size', codeSize, labels);
    this.recordCount('generation.total', 1, labels);
  }

  /**
   * 记录缓存性能
   */
  recordCacheMetrics(operation: 'hit' | 'miss' | 'set', key: string): void {
    this.recordCount(`cache.${operation}`, 1, { key });
  }

  /**
   * 记录内存使用情况
   */
  recordMemoryUsage(): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memory = process.memoryUsage();

      this.recordGauge('memory.rss', memory.rss, {});
      this.recordGauge('memory.heap_used', memory.heapUsed, {});
      this.recordGauge('memory.heap_total', memory.heapTotal, {});
      this.recordGauge('memory.external', memory.external, {});
    }
  }

  /**
   * 记录事件总线性能
   */
  recordEventMetrics(event: string, listenerCount: number, duration: number): void {
    const labels = { event };
    this.recordDuration('events.processing_time', duration, labels);
    this.recordGauge('events.listener_count', listenerCount, labels);
    this.recordCount('events.emitted', 1, labels);
  }

  // ============= 系统健康检查 =============

  private calculateHealthScore(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 100;

    // 简单的健康评分算法
    let score = 100;

    // 检查是否有错误指标
    const errorMetrics = metrics.filter(m =>
      m.name.includes('error') || m.name.includes('failed')
    );

    if (errorMetrics.length > 0) {
      score -= (errorMetrics.length / metrics.length) * 50;
    }

    // 检查性能指标
    const slowOperations = metrics.filter(m =>
      m.name.includes('duration') && m.value > 1000 // > 1秒
    );

    if (slowOperations.length > 0) {
      score -= (slowOperations.length / metrics.length) * 30;
    }

    return Math.max(0, Math.min(100, score));
  }

  // ============= 定期聚合 =============

  private startAggregation(): void {
    this.aggregationTimer = setInterval(() => {
      this.performAggregation();
    }, this.aggregationInterval);
  }

  private performAggregation(): void {
    const now = Date.now();
    // const oneMinuteAgo = now - this.aggregationInterval;

    // 记录系统指标
    this.recordMemoryUsage();

    // 可以在这里添加更多的定期聚合逻辑
    this.logger?.debug('Performance aggregation completed', {
      storageSize: this.storage.getSize(),
      timestamp: now
    });
  }

  /**
   * 获取健康指标
   */
  getHealthMetrics(): Record<string, any> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    const recentMetrics = this.storage.getMetrics(undefined, {
      start: oneMinuteAgo,
      end: now
    });

    const generationMetrics = recentMetrics.filter(m =>
      m.name.startsWith('generation.')
    );

    const cacheMetrics = recentMetrics.filter(m =>
      m.name.startsWith('cache.')
    );

    return {
      timestamp: now,
      metrics: {
        total_metrics: recentMetrics.length,
        generation_operations: generationMetrics.length,
        cache_operations: cacheMetrics.length,
        storage_size: this.storage.getSize()
      },
      health: this.calculateHealthScore(recentMetrics)
    };
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    if (this.aggregationTimer) {
      clearInterval(this.aggregationTimer);
    }

    this.storage.clear();
    this.logger?.info('Performance monitor destroyed');
  }
}
