/**
 * AI编程铁律执行引擎 v7.0 - 执行模块导出
 * 
 * @file index.ts
 * @description 执行引擎模块的统一导出入口
 * @author 世界顶级低代码引擎架构师
 * @date 2025-10-04
 * @version 1.0.0
 */

// 导出类型
export * from './types'

// 导出检查点管理器
export { CheckpointManager, checkpointManager } from './checkpoint-manager'
export type { CheckpointManagerConfig } from './checkpoint-manager'

