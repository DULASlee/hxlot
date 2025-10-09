/**
 * Web Vitals 性能监控工具
 * Phoenix计划 - 小组2：前端性能极致优化
 *
 * 集成Core Web Vitals + 自定义性能指标
 * 基于业界最佳实践：Google Web Vitals
 */
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
/**
 * Web Vitals 性能监控器
 */
export class WebVitalsMonitor {
    constructor(config = {}) {
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                FCP: null,
                LCP: null,
                FID: null,
                INP: null,
                CLS: null,
                TTFB: null,
                TTI: null,
                TBT: null,
                FMP: null,
                resourceLoadTime: null,
                domReadyTime: null,
                windowLoadTime: null,
                memoryUsed: null,
                memoryTotal: null,
                memoryLimit: null,
                longTasksCount: 0,
                totalBlockingTime: 0,
            }
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
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
        Object.defineProperty(this, "reportInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.config = {
            enableLongTaskDetection: true,
            enableMemoryMonitoring: true,
            reportInterval: 30000, // 默认30秒报告一次
            ...config,
        };
        this.initialize();
    }
    /**
     * 初始化监控
     */
    initialize() {
        // 监控 Core Web Vitals
        this.observeCoreWebVitals();
        // 监控自定义指标
        this.observeCustomMetrics();
        // 监控长任务
        if (this.config.enableLongTaskDetection) {
            this.observeLongTasks();
        }
        // 监控内存使用
        if (this.config.enableMemoryMonitoring) {
            this.observeMemoryUsage();
        }
        // 定期报告
        if (this.config.reportCallback && this.config.reportInterval) {
            this.startPeriodicReporting();
        }
    }
    /**
     * 监控 Core Web Vitals
     */
    observeCoreWebVitals() {
        // First Contentful Paint
        onFCP((metric) => {
            this.metrics.FCP = metric.value;
            this.reportMetric('FCP', metric.value);
        });
        // Largest Contentful Paint
        onLCP((metric) => {
            this.metrics.LCP = metric.value;
            this.reportMetric('LCP', metric.value);
        });
        // Interaction to Next Paint (替代已废弃的FID)
        onINP((metric) => {
            this.metrics.INP = metric.value;
            this.reportMetric('INP', metric.value);
        });
        // Cumulative Layout Shift
        onCLS((metric) => {
            this.metrics.CLS = metric.value;
            this.reportMetric('CLS', metric.value);
        });
        // Time to First Byte
        onTTFB((metric) => {
            this.metrics.TTFB = metric.value;
            this.reportMetric('TTFB', metric.value);
        });
    }
    /**
     * 监控自定义指标
     */
    observeCustomMetrics() {
        if (typeof window === 'undefined')
            return;
        // 使用 PerformanceObserver 监控导航时间
        if ('PerformanceObserver' in window) {
            try {
                const navigationObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'navigation') {
                            const navEntry = entry;
                            // DOM就绪时间
                            this.metrics.domReadyTime = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart;
                            // 窗口加载时间
                            this.metrics.windowLoadTime = navEntry.loadEventEnd - navEntry.loadEventStart;
                            // 资源加载时间
                            this.metrics.resourceLoadTime = navEntry.responseEnd - navEntry.requestStart;
                            // Time to Interactive (简化估算)
                            this.metrics.TTI = navEntry.domInteractive - navEntry.fetchStart;
                        }
                    }
                });
                navigationObserver.observe({ entryTypes: ['navigation'] });
            }
            catch (error) {
                console.warn('PerformanceObserver navigation monitoring failed:', error);
            }
        }
        // 使用 Performance API 获取资源时间
        if ('performance' in window && 'getEntriesByType' in window.performance) {
            window.addEventListener('load', () => {
                const navigation = window.performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    // First Meaningful Paint (简化：使用 domContentLoadedEventEnd)
                    this.metrics.FMP = navigation.domContentLoadedEventEnd - navigation.fetchStart;
                    // Total Blocking Time (需要通过 Long Tasks 计算)
                    this.metrics.TBT = this.metrics.totalBlockingTime;
                }
            });
        }
    }
    /**
     * 监控长任务（>50ms）
     */
    observeLongTasks() {
        if (typeof window === 'undefined' || !('PerformanceObserver' in window))
            return;
        try {
            this.longTaskObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    const taskDuration = entry.duration;
                    // 长任务定义：执行时间 > 50ms
                    if (taskDuration > 50) {
                        this.metrics.longTasksCount++;
                        // 计算阻塞时间（超过50ms的部分）
                        const blockingTime = taskDuration - 50;
                        this.metrics.totalBlockingTime += blockingTime;
                        // 报告长任务
                        console.warn(`⚠️ Long Task Detected: ${taskDuration.toFixed(2)}ms`, {
                            name: entry.name,
                            startTime: entry.startTime,
                            duration: entry.duration,
                        });
                    }
                }
            });
            this.longTaskObserver.observe({ entryTypes: ['longtask'] });
        }
        catch (error) {
            console.warn('Long Task monitoring not supported:', error);
        }
    }
    /**
     * 监控内存使用
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
                    this.metrics.memoryLimit = performance.memory.jsHeapSizeLimit / (1024 * 1024); // MB
                    // 内存使用率检查
                    const memoryUsagePercent = (this.metrics.memoryUsed / this.metrics.memoryLimit) * 100;
                    if (memoryUsagePercent > 90) {
                        console.error('🚨 Memory Usage Critical: ' + memoryUsagePercent.toFixed(2) + '%');
                    }
                    else if (memoryUsagePercent > 75) {
                        console.warn('⚠️ Memory Usage High: ' + memoryUsagePercent.toFixed(2) + '%');
                    }
                }
            }, 5000); // 每5秒检查一次
        }
        else {
            console.warn('Performance Memory API not supported in this browser');
        }
    }
    /**
     * 报告单个指标
     */
    reportMetric(name, value) {
        console.log(`📊 Performance Metric - ${name}: ${value.toFixed(2)}ms`);
    }
    /**
     * 开始定期报告
     */
    startPeriodicReporting() {
        if (!this.config.reportCallback || !this.config.reportInterval)
            return;
        this.reportInterval = setInterval(() => {
            this.config.reportCallback?.(this.getMetrics());
        }, this.config.reportInterval);
    }
    /**
     * 获取所有指标
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * 获取性能评分
     */
    getRatings() {
        const ratings = [];
        // FCP 评分
        if (this.metrics.FCP !== null) {
            ratings.push(this.rateMetric('FCP', this.metrics.FCP, 1800, 3000));
        }
        // LCP 评分
        if (this.metrics.LCP !== null) {
            ratings.push(this.rateMetric('LCP', this.metrics.LCP, 2500, 4000));
        }
        // INP 评分 (替代废弃的FID)
        if (this.metrics.INP !== null) {
            ratings.push(this.rateMetric('INP', this.metrics.INP, 200, 500));
        }
        // CLS 评分（特殊：越小越好）
        if (this.metrics.CLS !== null) {
            ratings.push(this.rateMetric('CLS', this.metrics.CLS, 0.1, 0.25));
        }
        // TTFB 评分
        if (this.metrics.TTFB !== null) {
            ratings.push(this.rateMetric('TTFB', this.metrics.TTFB, 800, 1800));
        }
        return ratings;
    }
    /**
     * 评估单个指标
     */
    rateMetric(metric, value, goodThreshold, needsImprovementThreshold) {
        let rating;
        if (value <= goodThreshold) {
            rating = 'good';
        }
        else if (value <= needsImprovementThreshold) {
            rating = 'needs-improvement';
        }
        else {
            rating = 'poor';
        }
        return {
            metric,
            value,
            rating,
            threshold: {
                good: goodThreshold,
                needsImprovement: needsImprovementThreshold,
            },
        };
    }
    /**
     * 获取性能综合评分（0-100）
     */
    getOverallScore() {
        const ratings = this.getRatings();
        if (ratings.length === 0)
            return 0;
        const goodCount = ratings.filter((r) => r.rating === 'good').length;
        const needsImprovementCount = ratings.filter((r) => r.rating === 'needs-improvement').length;
        // 计算加权得分
        const goodScore = (goodCount / ratings.length) * 100;
        const needsImprovementScore = (needsImprovementCount / ratings.length) * 50;
        return Math.round(goodScore + needsImprovementScore);
    }
    /**
     * 生成性能报告
     */
    generateReport() {
        const metrics = this.getMetrics();
        const ratings = this.getRatings();
        const overallScore = this.getOverallScore();
        let report = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        report += '📊 Web Vitals 性能报告\n';
        report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
        report += `🎯 综合评分: ${overallScore}/100\n\n`;
        report += '📈 Core Web Vitals:\n';
        ratings.forEach((rating) => {
            const emoji = rating.rating === 'good' ? '✅' : rating.rating === 'needs-improvement' ? '⚠️' : '❌';
            report += `  ${emoji} ${rating.metric}: ${rating.value.toFixed(2)}ms (${rating.rating})\n`;
        });
        report += '\n📊 自定义指标:\n';
        if (metrics.TTI !== null)
            report += `  • TTI: ${metrics.TTI.toFixed(2)}ms\n`;
        if (metrics.TBT !== null)
            report += `  • TBT: ${metrics.TBT.toFixed(2)}ms\n`;
        if (metrics.FMP !== null)
            report += `  • FMP: ${metrics.FMP.toFixed(2)}ms\n`;
        report += '\n🔧 资源加载:\n';
        if (metrics.resourceLoadTime !== null)
            report += `  • 资源加载时间: ${metrics.resourceLoadTime.toFixed(2)}ms\n`;
        if (metrics.domReadyTime !== null)
            report += `  • DOM就绪时间: ${metrics.domReadyTime.toFixed(2)}ms\n`;
        if (metrics.windowLoadTime !== null)
            report += `  • 窗口加载时间: ${metrics.windowLoadTime.toFixed(2)}ms\n`;
        report += '\n💾 内存使用:\n';
        if (metrics.memoryUsed !== null && metrics.memoryLimit !== null) {
            const memoryPercent = (metrics.memoryUsed / metrics.memoryLimit) * 100;
            report += `  • 已使用: ${metrics.memoryUsed.toFixed(2)} MB / ${metrics.memoryLimit.toFixed(2)} MB (${memoryPercent.toFixed(1)}%)\n`;
        }
        report += '\n⏱️ 长任务:\n';
        report += `  • 长任务数量: ${metrics.longTasksCount}\n`;
        report += `  • 总阻塞时间: ${metrics.totalBlockingTime.toFixed(2)}ms\n`;
        report += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        return report;
    }
    /**
     * 清理监控器
     */
    destroy() {
        if (this.longTaskObserver) {
            this.longTaskObserver.disconnect();
            this.longTaskObserver = null;
        }
        if (this.memoryMonitorInterval) {
            clearInterval(this.memoryMonitorInterval);
            this.memoryMonitorInterval = null;
        }
        if (this.reportInterval) {
            clearInterval(this.reportInterval);
            this.reportInterval = null;
        }
    }
}
/**
 * 创建并启动性能监控器（单例）
 */
let monitorInstance = null;
export function initializePerformanceMonitoring(config) {
    if (monitorInstance) {
        return monitorInstance;
    }
    monitorInstance = new WebVitalsMonitor(config);
    // 在开发环境下，5分钟后自动生成报告
    if (import.meta.env.DEV) {
        setTimeout(() => {
            console.log(monitorInstance?.generateReport());
        }, 300000); // 5分钟
    }
    return monitorInstance;
}
export function getPerformanceMonitor() {
    return monitorInstance;
}
