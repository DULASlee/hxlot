/**
 * 📦 Version Management Module Entry
 *
 * Schema版本管理系统入口
 *
 * @module @smartabp/lowcode-shared/version
 */

export {
  SchemaVersionManager, type CompatibilityResult as VersionCompatibilityResult, type VersionInfo
} from './SchemaVersionManager'

export {
  useSchemaVersion
} from './useSchemaVersion'

// 导出版本管理工具（已从metadata-core迁移）
export {
  CURRENT_SCHEMA_VERSION, compareVersions, findUpgradePath as getUpgradePath,
  isCompatibleVersion as isCompatible,
  parseVersion,
  type SemanticVersion,
  type VersionComparison
} from './version-manager'

