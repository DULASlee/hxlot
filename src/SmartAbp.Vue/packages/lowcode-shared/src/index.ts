/**
 * 🏗️ SmartAbp LowCode Shared Library - Barrel Export
 * 
 * 📦 包含所有低代码引擎包共享的工具函数、类型定义、常量等
 * 🎯 遵循packages黑盒原则，提供统一的API导出
 * 🛡️ 专注于内存安全和性能优化
 * 
 * @packageDocumentation
 * @module @smartabp/lowcode-shared
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 类型系统 (Type System)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type { AuditedEntityDto, EntityDto, ListResultDto, PagedResultDto } from './dtos'
export * from './types'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 HTTP客户端 (HTTP Client)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { API_BASE_URL, request } from './api'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 统一Schema系统 (Unified Schema System) - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './types/unified-schema'
export * from './utils/schema-converter'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 版本管理系统 (Version Management System) - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './version/SchemaVersionManager'
export * from './version/useSchemaVersion'
// Vue组件通过全局注册或直接导入使用
// export { default as VersionWarningBanner } from './version/VersionWarningBanner.vue'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 验证系统 (Validation System) - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './validation/metadata-adapter'
export {
  SchemaValidationError, UnifiedSchemaValidator, ValidateSchema, getUnifiedEntityErrors, getValidationFeatureFlags, setValidationFeatureFlags, validateUnifiedEntities, validateUnifiedEntity,
  validateUnifiedModule, type ValidationError as UnifiedValidationError, type UnifiedValidationFeatureFlags, type ValidationPerformance as UnifiedValidationPerformance, type ValidationResult as UnifiedValidationResult, type ValidationWarning as UnifiedValidationWarning
} from './validation/unified-validator'

// 🔥 阶段2：版本管理和兼容性检查 (Version Management & Compatibility Check) - v1.0.0
export {
  CURRENT_SCHEMA_VERSION, compareVersions, findUpgradePath as getUpgradePath, isCompatibleVersion as isCompatible, parseVersion, type SemanticVersion,
  type VersionComparison
} from '@smartabp/metadata-core/schema'

export {
  checkEntityCompatibility,
  checkModuleCompatibility, type BreakingChange, type CompatibilityResult, type CompatibilityWarning as CompatibilityWarningType
} from '@smartabp/metadata-core/schema'

// 🔥 阶段3：Schema差异对比与变更日志 (Schema Diff & Changelog) - v1.0.0
export {
  diffEntitySchema, filterDiffByPath, generateChangelog,
  generateDiffSummary, type DiffOperation, type DiffSummary, type FieldDiff,
  type SchemaDiff
} from '@smartabp/metadata-core/schema'

// 🔥 阶段4：国际化错误信息 (Validation I18n) - v1.0.0
export {
  ValidationMessageKey,
  ZOD_ERROR_TO_MESSAGE_KEY,
  ZOD_STRING_VALIDATION_TO_KEY, extractZodErrorParams, getMessageKeyFromZodError, getValidationI18nConfig, setValidationI18nConfig, translateValidationMessage, type ValidationI18nConfig, type ValidationMessageParams
} from './i18n'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 组合式API (Composables) - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  DEFAULT_VALIDATION_OPTIONS, useValidation, type ValidationOptions, type ValidationState
} from './composables/useValidation'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏗️ 组件系统 (Component System)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './components'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎣 Composables (Composition API)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './composables'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 工具函数 (Utilities)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './utils'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 常量 (Constants)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './constants'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ 验证器 (Validators)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './validators'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 错误处理 (Error Handling)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './error'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 主题系统 (Theme System)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './theme'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💾 缓存管理 (Cache Management)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './cache'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧠 内存管理 (Memory Management)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './memory'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 日志系统 (Logging System)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './logging'
export { getGlobalLogger } from './logging'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 统一事件系统 (Unified Event System) - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './events'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 包信息 (Package Metadata)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 包版本号
 * @public
 */
export const LOWCODE_SHARED_VERSION = '1.0.0'

/**
 * 包完整信息
 * @public
 */
export const PACKAGE_INFO = {
  name: '@smartabp/lowcode-shared',
  version: LOWCODE_SHARED_VERSION,
  description: 'SmartAbp LowCode Engine Shared Library - Memory Safe Utilities',
  author: 'SmartAbp Team'
} as const
