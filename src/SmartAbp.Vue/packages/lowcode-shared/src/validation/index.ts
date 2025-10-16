/**
 * 🔍 Validation Module Entry
 *
 * 统一验证系统入口，支持按需加载
 *
 * @module @smartabp/lowcode-shared/validation
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 核心验证器
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  SchemaValidationError, UnifiedSchemaValidator, ValidateSchema, getUnifiedEntityErrors, getValidationFeatureFlags, setValidationFeatureFlags, validateUnifiedEntities, validateUnifiedEntity,
  validateUnifiedModule, type ValidationError as UnifiedValidationError, type UnifiedValidationFeatureFlags, type ValidationPerformance as UnifiedValidationPerformance,
  // 🔥 阶段2：版本管理和兼容性检查
  // Note: checkEntityCompatibility and checkModuleCompatibility 在 unified-validator.ts 中导入但未重新导出
  // 🔥 阶段3：Schema差异对比与变更日志
  // Note: diffEntitySchema, generateChangelog, generateDiffSummary 在 unified-validator.ts 中导入但未重新导出
  // Types
  type UnifiedValidationResult, type ValidationWarning as UnifiedValidationWarning
} from './unified-validator'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 版本管理功能（已从metadata-core迁移至lowcode-shared）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  CURRENT_SCHEMA_VERSION, compareVersions, findUpgradePath as getUpgradePath,
  isCompatibleVersion as isCompatible,
  parseVersion, type CompatibilityResult,
  type SemanticVersion,
  type VersionComparison
} from '../version/version-manager'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 Schema差异对比功能（已从metadata-core迁移至lowcode-shared）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  diffEntitySchema, filterDiffByPath, generateChangelog,
  generateDiffSummary, type DiffOperation, type DiffSummary, type FieldDiff,
  type SchemaDiff
} from '../version/schema-diff'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 元数据适配器（已从metadata-core迁移至lowcode-shared）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 适配器已弃用：不再导出转换相关API，统一直接使用统一Schema

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌐 国际化错误消息（阶段三新增）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  ErrorMessageContext,
  defaultFieldNameMap,
  en_US,
  formatValidationError,
  getCurrentLocale,
  getErrorMessage,
  getErrorMessages,
  getFieldDisplayName,
  setCurrentLocale,
  zh_CN,
  type ErrorMessageKey,
  type ErrorMessageTemplate,
  type FieldNameMap,
  type LocaleMessages,
  type SupportedLocale
} from './error-messages'

