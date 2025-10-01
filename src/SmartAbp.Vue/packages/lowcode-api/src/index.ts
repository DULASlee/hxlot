// SmartAbp LowCode API Package Entry Point
export * from './types/index'
export { codeGeneratorApi } from './types/index'

// Re-export commonly used types
export type { 
  Template, 
  CodeGeneratorApi, 
  ModuleGenerationConfig, 
  GenerationResult 
} from './types/index'

// Package version and metadata
export const VERSION = '1.0.0'
export const PACKAGE_NAME = '@smartabp/lowcode-api'

// Default export for convenience
export default {
  VERSION,
  PACKAGE_NAME,
  codeGeneratorApi: () => import('./types/index').then(m => m.codeGeneratorApi)
}