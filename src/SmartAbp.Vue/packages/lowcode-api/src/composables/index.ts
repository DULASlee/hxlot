/**
 * lowcode-api Composables统一导出
 * 提供API调用、错误处理、Loading管理的完整解决方案
 */

// 错误处理
export * from './useApiError.js'
export { useApiError } from './useApiError.js'

// Loading管理
export * from './useApiLoading.js'
export { useApiLoading, createLoadingWrapper } from './useApiLoading.js'

// 统一API调用
export * from './useApiCall.js'
export { 
  useApiCall, 
  createApiCall, 
  createCodeGenApiCall 
} from './useApiCall.js'

// Aspire代码生成
export * from './useAspireCodeGen.js'
export { useAspireCodeGen } from './useAspireCodeGen.js'

// 环境配置管理
export * from './useEnvironmentConfig.js'
export { useEnvironmentConfig } from './useEnvironmentConfig.js'

// 安全策略管理
export * from './useSecurityPolicy.js'
export { useSecurityPolicy } from './useSecurityPolicy.js'

// 可观测性管理
export * from './useObservability.js'
export { useObservability } from './useObservability.js'

// 弹性策略管理
export * from './useResiliencePolicy.js'
export { useResiliencePolicy } from './useResiliencePolicy.js'

// Git工作流管理
export * from './useGitWorkflow.js'
export { useGitWorkflow } from './useGitWorkflow.js'

// CI/CD模板管理
export * from './useCICDTemplate.js'
export { useCICDTemplate } from './useCICDTemplate.js'

// 开发环境配置管理
export * from './useDevEnvironment.js'
export { useDevEnvironment } from './useDevEnvironment.js'
