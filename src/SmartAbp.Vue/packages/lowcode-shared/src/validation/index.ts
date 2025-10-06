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
  UnifiedSchemaValidator,
  validateUnifiedEntity,
  validateUnifiedModule,
  validateUnifiedEntities,
  getUnifiedEntityErrors,
  ValidateSchema,
  SchemaValidationError,
  setValidationFeatureFlags,
  getValidationFeatureFlags,
  
  // 🔥 阶段2：版本管理和兼容性检查
  // Note: checkEntityCompatibility and checkModuleCompatibility 在 unified-validator.ts 中导入但未重新导出
  
  // 🔥 阶段3：Schema差异对比与变更日志
  // Note: diffEntitySchema, generateChangelog, generateDiffSummary 在 unified-validator.ts 中导入但未重新导出
  
  // Types
  type ValidationResult as UnifiedValidationResult,
  type ValidationError as UnifiedValidationError,
  type ValidationWarning as UnifiedValidationWarning,
  type ValidationPerformance as UnifiedValidationPerformance,
  type UnifiedValidationFeatureFlags,
  
  // Version Management Types
  // Note: These types are imported from @smartabp/metadata-core in unified-validator.ts but not re-exported
  
  // Schema Diff Types
  // Note: These types are imported from @smartabp/metadata-core in unified-validator.ts but not re-exported
} from './unified-validator'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 直接从 @smartabp/metadata-core 导出版本管理和差异对比功能
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  compareVersions,
  CURRENT_SCHEMA_VERSION,
  findUpgradePath as getUpgradePath,
  isCompatibleVersion as isCompatible,
  parseVersion,
  checkEntityCompatibility,
  checkModuleCompatibility,
  diffEntitySchema,
  generateChangelog,
  generateDiffSummary,
  filterDiffByPath,
  type SemanticVersion,
  type VersionComparison,
  type CompatibilityResult,
  type BreakingChange,
  type CompatibilityWarning as CompatibilityWarningType,
  type DiffOperation,
  type FieldDiff,
  type SchemaDiff,
  type DiffSummary,
} from '@smartabp/metadata-core/schema'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 元数据适配器
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  convertEntityToMetadataCore,
  convertModuleToMetadataCore,
  convertEntityFromMetadataCore,
} from './metadata-adapter'

