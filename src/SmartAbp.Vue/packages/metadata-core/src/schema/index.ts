/**
 * @smartabp/metadata-core/schema
 * 
 * Schema工具集
 * - 版本管理
 * - 兼容性检查
 * - 差异对比
 * - Schema注册表
 */

// 版本管理
export {
  parseVersion,
  formatVersion,
  isValidVersion,
  compareVersions,
  isCompatibleVersion,
  isBreakingChange,
  getVersionsInRange,
  getCurrentSchemaVersion,
  setSchemaVersion,
  isSupportedSchemaVersion,
  validateSchemaVersion,
  findUpgradePath,
  hasBreakingChanges,
  requiresMigration,
  getVersionInfo,
  sortVersions,
  getLatestVersion,
  getOldestVersion,
  SUPPORTED_SCHEMA_VERSIONS,
  CURRENT_SCHEMA_VERSION,
  UPGRADE_PATHS
} from './version-manager.js'

export type {
  SemanticVersion,
  VersionComparison,
  SchemaType,
  UpgradePath
} from './version-manager.js'

// 兼容性检查
export {
  checkEntityCompatibility,
  checkModuleCompatibility,
  checkAspireCompatibility,
  isBackwardCompatible,
  generateCompatibilityReport,
  assessBreakingChangeImpact
} from './compatibility-checker.js'

export type {
  CompatibilityResult,
  BreakingChange,
  CompatibilityWarning
} from './compatibility-checker.js'

// 差异对比
export {
  diffEntitySchema,
  generateChangelog,
  mergeSchemas,
  generateDiffSummary,
  filterDiffByPath
} from './schema-diff.js'

export type {
  DiffOperation,
  FieldDiff,
  SchemaDiff,
  DiffSummary,
  MergeOptions
} from './schema-diff.js'

// Schema注册表
export {
  SchemaRegistry,
  getRegistry,
  registerEntity,
  lookupEntity,
  registerModule,
  lookupModule,
  registerAspireSolution,
  lookupAspireSolution
} from './schema-registry.js'

export type {
  SchemaMetadata,
  RegisterOptions,
  LookupOptions
} from './schema-registry.js'

