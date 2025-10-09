/**
 * 性能监控服务
 * Phoenix计划增强版 - 集成 Web Vitals 库
 * 基于 Performance API + web-vitals 实现前端性能监控
 */
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
class PerformanceMonitor {
    constructor() {
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "routePerformances", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "observer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "longTaskObserver", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "memoryMonitorInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
    }
    /**
     * 初始化性能监控（Phoenix增强版）
     */
    init() {
        if (typeof window === 'undefined' || !window.performance) {
            console.warn('[Performance Monitor] Performance API not supported');
            return;
        }
        console.log('[Performance Monitor] 🚀 Phoenix增强版启动中...');
        // 使用 web-vitals 库监控 Core Web Vitals
        this.initWebVitals();
        // 保留原有的监控
        this.observeNavigationTiming();
        // Phoenix增强：长任务监控
        this.observeLongTasks();
        // Phoenix增强：内存监控
        this.observeMemoryUsage();
        console.log('[Performance Monitor] ✅ 性能监控已启动');
    }
    /**
     * 初始化 Web Vitals 监控（Phoenix增强）
     */
    initWebVitals() {
        // First Contentful Paint
        onFCP((metric) => {
            this.metrics.firstContentfulPaint = metric.value;
            console.log(`[Performance Monitor] 📊 FCP: ${metric.value.toFixed(2)}ms ${this.rateMetric('FCP', metric.value)}`);
        });
        // Largest Contentful Paint
        onLCP((metric) => {
            this.metrics.largestContentfulPaint = metric.value;
            console.log(`[Performance Monitor] 📊 LCP: ${metric.value.toFixed(2)}ms ${this.rateMetric('LCP', metric.value)}`);
        });
        // Interaction to Next Paint (替代已废弃的FID)
        onINP((metric) => {
            this.metrics.interactionToNextPaint = metric.value;
            console.log(`[Performance Monitor] 📊 INP: ${metric.value.toFixed(2)}ms ${this.rateMetric('INP', metric.value)}`);
        });
        // Cumulative Layout Shift
        onCLS((metric) => {
            this.metrics.cumulativeLayoutShift = metric.value;
            console.log(`[Performance Monitor] 📊 CLS: ${metric.value.toFixed(3)} ${this.rateMetric('CLS', metric.value)}`);
        });
        // Time to First Byte
        onTTFB((metric) => {
            this.metrics.timeToFirstByte = metric.value;
            console.log(`[Performance Monitor] 📊 TTFB: ${metric.value.toFixed(2)}ms ${this.rateMetric('TTFB', metric.value)}`);
        });
    }
    /**
     * 监控长任务（Phoenix增强）
     */
    observeLongTasks() {
        if (typeof window === 'undefined' || !('PerformanceObserver' in window))
            return;
        try {
            this.metrics.longTasksCount = 0;
            this.metrics.totalBlockingTime = 0;
            this.longTaskObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    const taskDuration = entry.duration;
                    // 长任务定义：执行时间 > 50ms
                    if (taskDuration > 50) {
                        this.metrics.longTasksCount = (this.metrics.longTasksCount || 0) + 1;
                        // 计算阻塞时间（超过50ms的部分）
                        const blockingTime = taskDuration - 50;
                        this.metrics.totalBlockingTime = (this.metrics.totalBlockingTime || 0) + blockingTime;
                        // 仅在开发环境警告
                        if (import.meta.env.DEV) {
                            console.warn(`[Performance Monitor] ⚠️ Long Task: ${taskDuration.toFixed(2)}ms`, {
                                name: entry.name,
                                startTime: entry.startTime,
                            });
                        }
                    }
                }
            });
            this.longTaskObserver.observe({ entryTypes: ['longtask'] });
        }
        catch (error) {
            console.warn('[Performance Monitor] Long Task monitoring not supported');
        }
    }
    /**
     * 监控内存使用（Phoenix增强）
     */
    observeMemoryUsage() {
        if (typeof window === 'undefined')
            return;
        // 检查是否支持 Performance Memory API (Chrome)
        const performance = window.performance;
        if (performance.memory) {
            // 定期检查内存使用
            this.memoryMonitorInterval = setInterval(() => {
                if (performance.memory) {
                    this.metrics.memoryUsed = performance.memory.usedJSHeapSize / (1024 * 1024); // MB
                    this.metrics.memoryTotal = performance.memory.totalJSHeapSize / (1024 * 1024); // MB
                    // 仅在开发环境监控内存
                    if (import.meta.env.DEV) {
                        const memoryLimit = performance.memory.jsHeapSizeLimit / (1024 * 1024);
                        const memoryUsagePercent = (this.metrics.memoryUsed / memoryLimit) * 100;
                        if (memoryUsagePercent > 90) {
                            console.error(`[Performance Monitor] 🚨 Memory Critical: ${memoryUsagePercent.toFixed(1)}% (${this.metrics.memoryUsed.toFixed(2)} MB)`);
                        }
                    }
                }
            }, 10000); // 每10秒检查一次
        }
    }
    /**
     * 评估单个指标（Phoenix增强）
     */
    rateMetric(metric, value) {
        let rating;
        let emoji;
        switch (metric) {
            case 'FCP':
                rating = value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
                break;
            case 'LCP':
                rating = value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
                break;
            case 'INP':
                rating = value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
                break;
            case 'CLS':
                rating = value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
                break;
            case 'TTFB':
                rating = value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
                break;
            default:
                return '';
        }
        emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
        return `${emoji} (${rating})`;
    }
    /**
     * 观察导航时间
     */
    observeNavigationTiming() {
        if (window.performance.timing) {
            const timing = window.performance.timing;
            const navigationStart = timing.navigationStart;
            // DNS查询时间
            this.metrics.dnsLookup = timing.domainLookupEnd - timing.domainLookupStart;
            // TCP连接时间
            this.metrics.tcpConnection = timing.connectEnd - timing.connectStart;
            // TLS握手时间
            if (timing.secureConnectionStart) {
                this.metrics.tlsHandshake = timing.connectEnd - timing.secureConnectionStart;
            }
            // 请求响应时间
            this.metrics.requestTime = timing.responseEnd - timing.requestStart;
            // DOM内容加载时间
            this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - navigationStart;
            // 页面完全加载时间
            this.metrics.loadComplete = timing.loadEventEnd - navigationStart;
            console.log('[Performance Monitor] Navigation Timing:', {
                dnsLookup: `${this.metrics.dnsLookup}ms`,
                tcpConnection: `${this.metrics.tcpConnection}ms`,
                tlsHandshake: `${this.metrics.tlsHandshake || 0}ms`,
                requestTime: `${this.metrics.requestTime}ms`,
                domContentLoaded: `${this.metrics.domContentLoaded}ms`,
                loadComplete: `${this.metrics.loadComplete}ms`
            });
        }
    }
    /**
     * 记录路由切换性能
     */
    recordRoutePerformance(routePath, duration) {
        const record = {
            routePath,
            duration,
            timestamp: Date.now()
        };
        this.routePerformances.push(record);
        // 只保留最近100条记录
        if (this.routePerformances.length > 100) {
            this.routePerformances.shift();
        }
        console.log(`[Performance Monitor] Route: ${routePath} - ${duration.toFixed(2)}ms`);
    }
    /**
     * 获取性能指标
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * 获取路由性能记录
     */
    getRoutePerformances() {
        return [...this.routePerformances];
    }
    /**
     * 获取平均路由切换时间
     */
    getAverageRouteDuration() {
        if (this.routePerformances.length === 0)
            return 0;
        const total = this.routePerformances.reduce((sum, record) => sum + record.duration, 0);
        return total / this.routePerformances.length;
    }
    /**
     * 获取Core Web Vitals评分
     */
    getCoreWebVitals() {
        return {
            fcp: this.metrics.firstContentfulPaint,
            lcp: this.metrics.largestContentfulPaint,
            inp: this.metrics.interactionToNextPaint, // 使用 INP 替代废弃的 FID
            cls: this.metrics.cumulativeLayoutShift,
            rating: this.getRating()
        };
    }
    /**
     * 获取性能评级
     */
    getRating() {
        const { firstContentfulPaint, largestContentfulPaint, interactionToNextPaint, cumulativeLayoutShift } = this.metrics;
        let score = 0;
        let count = 0;
        // FCP 评分 (< 1.8s good, < 3s needs-improvement, >= 3s poor)
        if (firstContentfulPaint !== undefined) {
            if (firstContentfulPaint < 1800)
                score += 2;
            else if (firstContentfulPaint < 3000)
                score += 1;
            count++;
        }
        // LCP 评分 (< 2.5s good, < 4s needs-improvement, >= 4s poor)
        if (largestContentfulPaint !== undefined) {
            if (largestContentfulPaint < 2500)
                score += 2;
            else if (largestContentfulPaint < 4000)
                score += 1;
            count++;
        }
        // INP 评分 (< 200ms good, < 500ms needs-improvement, >= 500ms poor) - 替代废弃的 FID
        if (interactionToNextPaint !== undefined) {
            if (interactionToNextPaint < 200)
                score += 2;
            else if (interactionToNextPaint < 500)
                score += 1;
            count++;
        }
        // CLS 评分 (< 0.1 good, < 0.25 needs-improvement, >= 0.25 poor)
        if (cumulativeLayoutShift !== undefined) {
            if (cumulativeLayoutShift < 0.1)
                score += 2;
            else if (cumulativeLayoutShift < 0.25)
                score += 1;
            count++;
        }
        if (count === 0)
            return 'needs-improvement';
        const avgScore = score / count;
        if (avgScore >= 1.5)
            return 'good';
        if (avgScore >= 0.5)
            return 'needs-improvement';
        return 'poor';
    }
    /**
     * 清理监听器（Phoenix增强）
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        if (this.longTaskObserver) {
            this.longTaskObserver.disconnect();
            this.longTaskObserver = null;
        }
        if (this.memoryMonitorInterval) {
            clearInterval(this.memoryMonitorInterval);
            this.memoryMonitorInterval = null;
        }
        console.log('[Performance Monitor] 已清理所有监听器');
    }
}
// 导出单例
export const performanceMonitor = new PerformanceMonitor();
