/**
 * 性能优化模块导出
 * 
 * @module performance
 * @author AI首席架构师
 * @since 2.0.0
 */

// 性能优化器
export {
  PerformanceOptimizer,
  createPerformanceOptimizer
} from './PerformanceOptimizer'
export type {
  ComponentUsageStats,
  PerformanceOptimizerOptions,
  MemoryInfo,
  PredictionResult
} from './PerformanceOptimizer'

// 性能监控器
export {
  PerformanceMonitor,
  createPerformanceMonitor,
  globalPerformanceMonitor
} from './PerformanceMonitor'
export type {
  PerformanceMetric,
  PerformanceReport,
  PerformanceMonitorOptions
} from './PerformanceMonitor'

// 性能监控Dashboard
// export { default as PerformanceDashboard } from './PerformanceDashboard.vue'

// 导出空对象以保持模块有效
export const __performance_placeholder__ = true

