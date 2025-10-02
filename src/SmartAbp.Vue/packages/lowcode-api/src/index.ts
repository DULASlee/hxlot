// SmartAbp LowCode API Package Entry Point

// 导出真实的HTTP客户端实现
export { codeGeneratorApi } from './http-client'

// 导出所有类型定义
export type * from './types/index'

// Re-export commonly used types for convenience
export type { 
  Template, 
  CodeGeneratorApi, 
  ModuleMetadataDto,
  GeneratedModuleDto,
  GenerationResult,
  ValidationReport,
  DryRunResult,
  DatabaseIntrospectionRequest,
  DatabaseSchema,
  MenuItemDto,
  SchemaVersionManifest,
  EntityUIConfig
} from './types/index'

// Package version and metadata
export const VERSION = '2.0.0'  // 升级为2.0，标记为真实API实现
export const PACKAGE_NAME = '@smartabp/lowcode-api'

// Default export for convenience
export default {
  VERSION,
  PACKAGE_NAME,
  codeGeneratorApi: () => import('./http-client').then(m => m.codeGeneratorApi)
}