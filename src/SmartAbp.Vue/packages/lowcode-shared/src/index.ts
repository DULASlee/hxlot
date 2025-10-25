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
// 🔥 后端契约类型系统 - 31级AlphaGO分析最优解实施
// 架构三大铁律完全合规：packages独立契约类型，零外部依赖
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './types/backend-contracts';
export * from './types/index';
// 显式导出常量（确保Vite HMR正确识别）
export { METADATA_SCHEMA_VERSION, UNIFIED_SCHEMA_VERSION } from './types/metadata';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 HTTP客户端 (HTTP Client)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { API_BASE_URL, request } from './api';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 统一Schema系统 (Unified Schema System) - v1.0.0
// Phase 1D: unified-schema已废弃，类型从metadata导出
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './types/enums';
// Phase 1D: 前端元数据类型（从unified-schema迁移至metadata）
// export * from './types/metadata'; // 已在 types/index.ts 导出
// API DTO类型请使用: import { EntityDefinitionDto, ModuleDto } from '@smartabp/lowcode-shared'
// 🟡 Phase 3B: schema-converter已废弃，不再导出
// export * from './utils/schema-converter';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 版本管理系统 (Version Management System) - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './version/SchemaVersionManager';
export * from './version/useSchemaVersion';
// Vue组件通过全局注册或直接导入使用
// export { default as VersionWarningBanner } from './version/VersionWarningBanner.vue'
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏗️ 装配件类型系统 (Assembly Type System) - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './types/assembly';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 验证系统 (Validation System) - v2.0.0
// 📦 从 @smartabp/metadata-core 迁移，适配 UnifiedEntityDefinition
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🟡 Phase 3B: metadata-adapter已删除（使用后端SSOT类型，无需适配器）
export { getUnifiedEntityErrors, getValidationFeatureFlags, SchemaValidationError, setValidationFeatureFlags, UnifiedSchemaValidator, ValidateSchema, validateUnifiedEntities, validateUnifiedEntity, validateUnifiedModule } from './validation/unified-validator';

// 🔥 阶段1：元数据验证功能 (Metadata Validation) - v2.0.0
export {
  getEntityMetadataErrors, safeValidateEntityMetadata, UnifiedEntityDefinitionSchema,
  // Entity验证
  validateEntityMetadata, validateEntityMetadataAsync
} from './validation/entity-validator';
export {
  // 错误映射（传统接口）
  entityErrorMap,
  // D4优化：统一错误映射接口
  ErrorMaps, formatErrorMessage, moduleErrorMap, type ErrorMapConfig, type ErrorMapContext
} from './validation/error-map';
export {
  getModuleMetadataErrors, safeValidateModuleMetadata, UnifiedModuleMetadataSchema,
  // Module验证
  validateModuleMetadata, validateModuleMetadataAsync
} from './validation/module-validator';

// 🔥 阶段2：版本管理和兼容性检查 (Version Management & Compatibility Check) - v2.0.0
export {
  // 版本比较
  compareVersions,
  // 常量
  CURRENT_SCHEMA_VERSION,
  // 升级路径
  findUpgradePath, formatVersion,
  // Schema版本管理
  getCurrentSchemaVersion, getLatestVersion,
  getOldestVersion,
  // 工具函数
  getVersionInfo, getVersionsInRange, hasBreakingChanges, isBreakingChange, isCompatibleVersion, isSupportedSchemaVersion, isValidVersion,
  // 版本解析
  parseVersion, requiresMigration, setSchemaVersion, sortVersions, SUPPORTED_SCHEMA_VERSIONS,
  UPGRADE_PATHS, validateSchemaVersion, type SchemaType,
  // 类型
  type SemanticVersion, type UpgradePath, type VersionComparison
} from './version/version-manager';

// 🔥 阶段3：Schema差异对比与变更日志 (Schema Diff & Changelog) - v2.0.0
export {
  // 差异对比
  diffEntitySchema, filterDiffByPath, generateChangelog,
  // 工具函数
  generateDiffSummary, mergeSchemas,
  // 类型
  type DiffOperation, type DiffSummary, type FieldDiff, type MergeOptions, type SchemaDiff
} from './version/schema-diff';

// 🔥 阶段4：国际化错误信息 (Validation I18n) - v1.0.0
export { extractZodErrorParams, getMessageKeyFromZodError, getValidationI18nConfig, setValidationI18nConfig, translateValidationMessage, ValidationMessageKey, ZOD_ERROR_TO_MESSAGE_KEY, ZOD_STRING_VALIDATION_TO_KEY } from './i18n/index';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 组合式API (Composables) - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { useSafeEventListener, useSafeTimer } from './composables/useSafeEventListener';
export {
  DEFAULT_VALIDATION_OPTIONS, useValidation, type ValidationOptions, type ValidationState
} from './composables/useValidation';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏗️ 组件系统 (Component System)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './components/index';
// 🔥 组件统一注册 (Component Registration)
// @遵循架构铁律二：强制使用组件注册系统
export { registerSharedComponents } from './components/register';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 工具函数 (Utilities)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './utils/index';
export * from './utils/type-mapping';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 常量 (Constants)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './constants/index';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ 验证器 (Validators)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './validators/index';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 错误处理 (Error Handling)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './error/index';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 主题系统 (Theme System)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './theme/index';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💾 缓存管理 (Cache Management)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './cache/index';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧠 内存管理 (Memory Management)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './memory/index';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 日志系统 (Logging System)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './logging/index';
export { getGlobalLogger } from './logging/index';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 统一事件系统 (Unified Event System) - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './events/index';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧠 ComponentGenie - 超微AI组件智能识别系统 - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { analyzeBatch, analyzeComponent, ComponentGenie, componentGenie, getAIStatistics, predictCategory } from './ai/ComponentGenie';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 全自动组件发现系统 - v1.0.0 (半自动→全自动的重大突破)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { AutoComponentDiscoveryEngine, autoDiscovery, getDiscoveryStats, handleComponentFileChange, rescanComponents, startAutoDiscovery, stopAutoDiscovery } from './ai/AutoComponentDiscovery';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚡ 毫秒级高性能并行分析引擎 - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { analyzeBatchTurbo, getTurboStats, TurboAnalysisEngine, turboEngine } from './ai/TurboAnalysisEngine';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 Vite开发环境集成插件 - v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { defaultAutoDiscoveryPlugin, viteAutoDiscoveryPlugin } from './ai/ViteAutoDiscoveryPlugin';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 包信息 (Package Metadata)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * 包版本号
 * @public
 */
export const LOWCODE_SHARED_VERSION = '1.0.0';
/**
 * 包完整信息
 * @public
 */
export const PACKAGE_INFO = {
  name: '@smartabp/lowcode-shared',
  version: LOWCODE_SHARED_VERSION,
  description: 'SmartAbp LowCode Engine Shared Library - Memory Safe Utilities',
  author: 'SmartAbp Team'
};
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
import { globalComponentRegistry } from './components/ComponentRegistry';
import { VirtualAssembly } from './components/VirtualAssembly';
export const Components = new VirtualAssembly(globalComponentRegistry, {
  debug: import.meta.env.DEV,
  enablePerformanceMonitoring: true
}).createProxy();
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 性能优化与监控模块（微AI 2.0 - 阶段3）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './performance';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧩 插件系统（微AI 2.0 - 阶段4）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './plugins/index';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛠️ 开发者工具（微AI 2.0 - 阶段4）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export * from './devtools';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ 三大铁律智能执行引擎（微AI 2.0 - 阶段5）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Guards rely on Node APIs (fs/path/glob) and are meant for CLI/dev-time usage.
// Exporting them from the browser-facing entry would force bundlers to include Node polyfills.
// To comply with the architecture iron rules and avoid browser build failures, we do not re-export here.
// If needed in tooling, import from '@smartabp/lowcode-shared/src/guards' in Node-only scripts.
