/**
 * AI编程铁律执行引擎 v7.0 - MVP极简版
 * 
 * @file index.ts
 * @description 极简实用，直接使用项目现有工具
 * @author 世界顶级低代码引擎架构师
 * @date 2025-10-04
 * @version 1.0.0-mvp
 */

// 类型定义
export * from './types'

// 简单断点续传
export { SimpleCheckpoint, ExecutionStage as SimpleExecutionStage, simpleCheckpoint } from './simple-checkpoint'

// Git同步（使用项目成熟脚本）
export { gitSync, checkGitStatus, type GitSyncResult } from './git-sync'

// 智能检查（增量）
export { smartCheck, type CheckResult } from './smart-check'

// 简单日志
export { SimpleLogger, LogLevel, simpleLogger } from './simple-logger'

// 性能监控（优化2）
export { PerformanceMonitor, performanceMonitor, PERFORMANCE_BASELINE, type PerformanceMetric } from './simple-checkpoint'

// AI自我学习（优化3）
export { SimpleLearningManager, learningManager } from './simple-checkpoint'
