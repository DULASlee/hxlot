/**
 * 📦 Version Management Module Entry
 * 
 * Schema版本管理系统入口
 * 
 * @module @smartabp/lowcode-shared/version
 */

export {
  SchemaVersionManager,
  type VersionInfo,
  type CompatibilityResult as VersionCompatibilityResult,
} from './SchemaVersionManager'

export {
  useSchemaVersion,
} from './useSchemaVersion'

// 导出metadata-core的版本管理工具
export {
  compareVersions,
  CURRENT_SCHEMA_VERSION,
  findUpgradePath as getUpgradePath,
  isCompatibleVersion as isCompatible,
  parseVersion,
  type SemanticVersion,
  type VersionComparison,
} from '@smartabp/metadata-core'

