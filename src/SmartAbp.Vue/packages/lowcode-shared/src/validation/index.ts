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
  SchemaValidationError, UnifiedSchemaValidator, ValidateSchema, getUnifiedEntityErrors, getValidationFeatureFlags, setValidationFeatureFlags, unifiedValidator, validateUnifiedEntities, validateUnifiedEntity,
  validateUnifiedModule, type ValidationError as UnifiedValidationError, type UnifiedValidationFeatureFlags, type ValidationPerformance as UnifiedValidationPerformance,
  // 🔥 阶段2：版本管理和兼容性检查
  // Note: checkEntityCompatibility and checkModuleCompatibility 在 unified-validator.ts 中导入但未重新导出
  // 🔥 阶段3：Schema差异对比与变更日志
  // Note: diffEntitySchema, generateChangelog, generateDiffSummary 在 unified-validator.ts 中导入但未重新导出
  // Types
  type UnifiedValidationResult, type ValidationWarning as UnifiedValidationWarning
} from './unified-validator'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 直接从 @smartabp/metadata-core 导出版本管理和差异对比功能
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  CURRENT_SCHEMA_VERSION, checkEntityCompatibility,
  checkModuleCompatibility, compareVersions, diffEntitySchema, filterDiffByPath, generateChangelog,
  generateDiffSummary, findUpgradePath as getUpgradePath,
  isCompatibleVersion as isCompatible,
  parseVersion, type BreakingChange, type CompatibilityResult, type CompatibilityWarning as CompatibilityWarningType,
  type DiffOperation, type DiffSummary, type FieldDiff,
  type SchemaDiff, type SemanticVersion,
  type VersionComparison
} from '@smartabp/metadata-core'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 元数据适配器
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  convertEntityFromMetadataCore, convertEntityToMetadataCore,
  convertModuleToMetadataCore
} from './metadata-adapter'

