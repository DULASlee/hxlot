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
export type { AuditedEntityDto, EntityDto, ListResultDto, PagedResultDto } from './dtos.js'
export * from './types/index.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 HTTP客户端 (HTTP Client)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { API_BASE_URL, request } from './api.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 统一Schema系统 (Unified Schema System) - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './types/unified-schema.js'
export * from './utils/schema-converter.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 版本管理系统 (Version Management System) - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './version/SchemaVersionManager.js'
export * from './version/useSchemaVersion.js'
// Vue组件通过全局注册或直接导入使用
// export { default as VersionWarningBanner } from './version/VersionWarningBanner.vue'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏗️ 装配件类型系统 (Assembly Type System) - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './types/assembly.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 验证系统 (Validation System) - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './validation/metadata-adapter.js'
export {
  getUnifiedEntityErrors, getValidationFeatureFlags, SchemaValidationError, setValidationFeatureFlags, UnifiedSchemaValidator, ValidateSchema, validateUnifiedEntities, validateUnifiedEntity,
  validateUnifiedModule, type ValidationError as UnifiedValidationError, type UnifiedValidationFeatureFlags, type ValidationPerformance as UnifiedValidationPerformance, type UnifiedValidationResult, type ValidationWarning as UnifiedValidationWarning
} from './validation/unified-validator.js'

// 🔥 阶段2：版本管理和兼容性检查 (Version Management & Compatibility Check) - v1.0.0
export {
  compareVersions, CURRENT_SCHEMA_VERSION, findUpgradePath as getUpgradePath, isCompatibleVersion as isCompatible, parseVersion, type SemanticVersion,
  type VersionComparison
} from '@smartabp/metadata-core'

export {
  checkEntityCompatibility,
  checkModuleCompatibility, type BreakingChange, type CompatibilityResult, type CompatibilityWarning as CompatibilityWarningType
} from '@smartabp/metadata-core'

// 🔥 阶段3：Schema差异对比与变更日志 (Schema Diff & Changelog) - v1.0.0
export {
  diffEntitySchema, filterDiffByPath, generateChangelog,
  generateDiffSummary, type DiffOperation, type DiffSummary, type FieldDiff,
  type SchemaDiff
} from '@smartabp/metadata-core'

// 🔥 阶段4：国际化错误信息 (Validation I18n) - v1.0.0
export {
  extractZodErrorParams, getMessageKeyFromZodError, getValidationI18nConfig, setValidationI18nConfig, translateValidationMessage, ValidationMessageKey,
  ZOD_ERROR_TO_MESSAGE_KEY,
  ZOD_STRING_VALIDATION_TO_KEY, type ValidationI18nConfig, type ValidationMessageParams
} from './i18n/index.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 组合式API (Composables) - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  DEFAULT_VALIDATION_OPTIONS, useValidation, type ValidationOptions, type ValidationState
} from './composables/useValidation.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏗️ 组件系统 (Component System)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './components/index.js'

// 🔥 组件统一注册 (Component Registration)
// @遵循架构铁律二：强制使用组件注册系统
export { registerSharedComponents } from './components/register.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎣 Composables (Composition API)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './composables/index.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 工具函数 (Utilities)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './utils/index.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 常量 (Constants)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './constants/index.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ 验证器 (Validators)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './validators/index.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 错误处理 (Error Handling)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './error/index.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 主题系统 (Theme System)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './theme/index.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💾 缓存管理 (Cache Management)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './cache/index.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧠 内存管理 (Memory Management)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './memory/index.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 日志系统 (Logging System)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './logging/index.js'
export { getGlobalLogger } from './logging/index.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 统一事件系统 (Unified Event System) - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './events/index.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧠 ComponentGenie - 超微AI组件智能识别系统 - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  analyzeBatch, analyzeComponent, ComponentGenie, componentGenie, getAIStatistics, predictCategory, type ComponentAnalysis,
  type ComponentCategory, type ComponentDNA, type OptimizationSuggestion
} from './ai/ComponentGenie.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 全自动组件发现系统 - v1.0.0 (半自动→全自动的重大突破)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  AutoComponentDiscoveryEngine,
  autoDiscovery, getDiscoveryStats,
  handleComponentFileChange, rescanComponents, startAutoDiscovery,
  stopAutoDiscovery, type AutoDiscoveryConfig,
  type DiscoveredComponent
} from './ai/AutoComponentDiscovery.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚡ 毫秒级高性能并行分析引擎 - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  analyzeBatchTurbo,
  getTurboStats, TurboAnalysisEngine,
  turboEngine, type IncrementalAnalysisResult, type TurboFileMetadata
} from './ai/TurboAnalysisEngine.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 Vite开发环境集成插件 - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  defaultAutoDiscoveryPlugin, viteAutoDiscoveryPlugin, type ViteAutoDiscoveryOptions
} from './ai/ViteAutoDiscoveryPlugin.js'

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌟🌟🌟 微AI 2.0：虚拟程序集（全局组件命名空间）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 全局组件虚拟程序集
 *
 * 核心创新：通过Proxy实现"全局组件可见性"，类似C#程序集
 *
 * 使用方式：
 * ```typescript
 * import { Components } from '@smartabp/lowcode-shared'
 *
 * // ✅ 自动加载，无需手动import
 * const SmartForm = Components.SmartForm
 * const DataTable = Components.DataTable
 * ```
 *
 * 工作原理：
 * 1. 访问 Components.SmartForm
 * 2. Proxy拦截get操作
 * 3. 从Registry查找组件元数据
 * 4. 动态import加载组件
 * 5. 创建Vue3异步组件
 * 6. LRU缓存，提升性能
 *
 * @since 2.0.0
 * @public
 */
import { globalComponentRegistry } from './components/ComponentRegistry.js'
import { VirtualAssembly } from './components/VirtualAssembly.js'

export const Components = new VirtualAssembly(
  globalComponentRegistry,
  {
    debug: import.meta.env.DEV,
    enablePerformanceMonitoring: true
  }
).createProxy()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 性能优化与监控模块（微AI 2.0 - 阶段3）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export * from './performance'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧩 插件系统（微AI 2.0 - 阶段4）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export * from './plugins/index.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛠️ 开发者工具（微AI 2.0 - 阶段4）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export * from './devtools'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ 三大铁律智能执行引擎（微AI 2.0 - 阶段5）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export * from './guards'
