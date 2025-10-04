/**
 * lowcode-api Composables统一导出
 * 提供API调用、错误处理、Loading管理的完整解决方案
 */

// 错误处理
export * from './useApiError'
export { useApiError } from './useApiError'

// Loading管理
export * from './useApiLoading'
export { useApiLoading, createLoadingWrapper } from './useApiLoading'

// 统一API调用
export * from './useApiCall'
export { 
  useApiCall, 
  createApiCall, 
  createCodeGenApiCall 
} from './useApiCall'

// Aspire代码生成
export * from './useAspireCodeGen'
export { useAspireCodeGen } from './useAspireCodeGen'

// 环境配置管理
export * from './useEnvironmentConfig'
export { useEnvironmentConfig } from './useEnvironmentConfig'
