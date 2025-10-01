/**
 * 监控系统模块导出
 * 奔驰级系统稳定性工程组件
 */

// 性能监控核心组件
import { PerformanceMonitor as PerfMonitor } from './PerformanceMonitor'
export { PerformanceMonitor } from './PerformanceMonitor'
export type { 
  SystemHealthReport,
  PerformanceMetric,
  MemoryMetric,
  ErrorMetric,
  ApiMetric,
  DatabaseMetric,
  GenerationMetric,
  ErrorInfo,
  EndpointMetric,
  PerformanceWarning,
  PerformanceRecommendation
} from './PerformanceMonitor'

// 系统健康状态仪表板 (注释掉Vue组件导出，避免TypeScript项目引用问题)
// export { default as SystemHealthDashboard } from './SystemHealthDashboard.vue'

// 监控工具函数
export const createPerformanceMonitor = () => new PerfMonitor()

// 监控常量
export const MONITORING_CONSTANTS = {
  // 性能阈值
  THRESHOLDS: {
    UI_RESPONSE_TIME: 100, // 100ms
    MEMORY_USAGE: 80, // 80%
    ERROR_RATE: 0.01, // 1%
    API_RESPONSE_TIME: 500, // 500ms
    AVAILABILITY: 99.9, // 99.9%
    RECOVERY_TIME: 10000 // 10秒
  },
  
  // 监控间隔
  INTERVALS: {
    HEALTH_CHECK: 5000, // 5秒
    METRIC_COLLECTION: 1000, // 1秒
    AUTO_HEALING: 10000, // 10秒
    DASHBOARD_REFRESH: 5000 // 5秒
  },
  
  // 系统状态
  HEALTH_STATUS: {
    EXCELLENT: 'excellent',
    GOOD: 'good',
    WARNING: 'warning',
    CRITICAL: 'critical'
  } as const
}

export type HealthStatus = typeof MONITORING_CONSTANTS.HEALTH_STATUS[keyof typeof MONITORING_CONSTANTS.HEALTH_STATUS]

// 性能监控单例实例
export const performanceMonitor = createPerformanceMonitor()

// 默认导出
export default {
  PerformanceMonitor: PerfMonitor,
  performanceMonitor,
  createPerformanceMonitor,
  MONITORING_CONSTANTS
}
