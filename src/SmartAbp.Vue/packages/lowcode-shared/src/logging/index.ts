/**
 * 📋 Logging System Module Entry
 * 
 * 日志系统入口
 * 
 * @module @smartabp/lowcode-shared/logging
 */

export { ErrorLogIntegration } from './ErrorLogIntegration'
export { LogPolicyManager } from './LogPolicyManager'

// 从types导出logger相关函数（用于向后兼容）
export { createComponentLogger, getGlobalLogger } from '../types/logger.js'

