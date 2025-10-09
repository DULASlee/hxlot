/**
 * 性能监控集成
 * 整合usePerformance与实际监控服务
 */
import { onMounted } from 'vue';
import { usePerformance } from './usePerformance';
/**
 * 性能监控服务集成
 */
export function usePerformanceMonitor() {
    const { metrics, startMonitoring, getPerformanceScore } = usePerformance();
    /**
     * 上报性能数据到监控服务
     */
    const reportMetrics = () => {
        const score = getPerformanceScore();
        const data = {
            ...metrics.value,
            score,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        // TODO: 集成实际监控服务 (Sentry, DataDog, etc.)
        console.log('[Performance Monitor]', data);
        // 示例：发送到API
        // fetch('/api/performance/report', {
        //   method: 'POST',
        //   body: JSON.stringify(data)
        // })
    };
    onMounted(() => {
        startMonitoring();
        // 页面加载完成后上报
        setTimeout(reportMetrics, 3000);
    });
    return {
        metrics,
        reportMetrics
    };
}
