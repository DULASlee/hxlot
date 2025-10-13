/**
 * @smartabp/metadata-core/schema
 * Schema版本管理系统
 * 
 * 功能：
 * - 版本比较和验证
 * - 版本升级路径计算
 * - 向后兼容性检查
 * - 破坏性变更检测
 */

// ========================================
// 版本类型定义
// ========================================

/**
 * 语义化版本
 */
export interface SemanticVersion {
  major: number
  minor: number
  patch: number
  prerelease?: string
  build?: string
}

/**
 * 版本比较结果
 */
export type VersionComparison = -1 | 0 | 1

/**
 * Schema类型
 */
export type SchemaType = 'entity' | 'module' | 'aspire'

/**
 * 支持的Schema版本列表
 */
export const SUPPORTED_SCHEMA_VERSIONS = ['1.0.0'] as const

/**
 * 当前Schema版本
 */
export const CURRENT_SCHEMA_VERSION = '1.0.0'

// ========================================
// 版本解析
// ========================================

/**
 * 解析语义化版本字符串
 * 
 * @example
 * parseVersion('1.2.3') // { major: 1, minor: 2, patch: 3 }
 * parseVersion('1.0.0-alpha') // { major: 1, minor: 0, patch: 0, prerelease: 'alpha' }
 * parseVersion('2.1.0+build.123') // { major: 2, minor: 1, patch: 0, build: 'build.123' }
 */
export function parseVersion(version: string): SemanticVersion {
  const regex = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/
  const match = version.match(regex)
  
  if (!match) {
    throw new Error(`Invalid semantic version: ${version}`)
  }
  
  const [, major, minor, patch, prerelease, build] = match
  
  return {
    major: parseInt(major!, 10),
    minor: parseInt(minor!, 10),
    patch: parseInt(patch!, 10),
    prerelease,
    build
  }
}

/**
 * 格式化版本对象为字符串
 */
export function formatVersion(version: SemanticVersion): string {
  let result = `${version.major}.${version.minor}.${version.patch}`
  
  if (version.prerelease) {
    result += `-${version.prerelease}`
  }
  
  if (version.build) {
    result += `+${version.build}`
  }
  
  return result
}

/**
 * 验证版本字符串是否有效
 */
export function isValidVersion(version: string): boolean {
  try {
    parseVersion(version)
    return true
  } catch {
    return false
  }
}

// ========================================
// 版本比较
// ========================================

/**
 * 比较两个语义化版本
 * 
 * @returns -1: v1 < v2, 0: v1 === v2, 1: v1 > v2
 * 
 * @example
 * compareVersions('1.0.0', '1.0.1') // -1
 * compareVersions('2.0.0', '1.9.9') // 1
 * compareVersions('1.5.0', '1.5.0') // 0
 */
export function compareVersions(v1: string, v2: string): VersionComparison {
  const version1 = parseVersion(v1)
  const version2 = parseVersion(v2)
  
  // 比较major
  if (version1.major !== version2.major) {
    return version1.major > version2.major ? 1 : -1
  }
  
  // 比较minor
  if (version1.minor !== version2.minor) {
    return version1.minor > version2.minor ? 1 : -1
  }
  
  // 比较patch
  if (version1.patch !== version2.patch) {
    return version1.patch > version2.patch ? 1 : -1
  }
  
  // 比较prerelease（有prerelease的版本 < 无prerelease的版本）
  if (version1.prerelease && !version2.prerelease) {
    return -1
  }
  if (!version1.prerelease && version2.prerelease) {
    return 1
  }
  if (version1.prerelease && version2.prerelease) {
    return version1.prerelease > version2.prerelease ? 1 : 
           version1.prerelease < version2.prerelease ? -1 : 0
  }
  
  return 0
}

/**
 * 检查版本是否兼容（向后兼容）
 * 
 * @param targetVersion 目标版本
 * @param currentVersion 当前版本
 * @returns true: 兼容, false: 不兼容
 * 
 * @example
 * isCompatibleVersion('1.5.0', '1.0.0') // true (minor升级，兼容)
 * isCompatibleVersion('2.0.0', '1.9.9') // false (major升级，不兼容)
 */
export function isCompatibleVersion(targetVersion: string, currentVersion: string): boolean {
  const target = parseVersion(targetVersion)
  const current = parseVersion(currentVersion)
  
  // major版本不同，不兼容
  if (target.major !== current.major) {
    return false
  }
  
  // major相同，minor和patch任意，兼容
  return true
}

/**
 * 检查是否为破坏性版本变更
 */
export function isBreakingChange(fromVersion: string, toVersion: string): boolean {
  const from = parseVersion(fromVersion)
  const to = parseVersion(toVersion)
  
  // major版本升级是破坏性变更
  return to.major > from.major
}

/**
 * 获取版本范围内的所有版本
 */
export function getVersionsInRange(
  fromVersion: string, 
  toVersion: string, 
  allVersions: string[]
): string[] {
  return allVersions.filter(v => {
    const cmp1 = compareVersions(v, fromVersion)
    const cmp2 = compareVersions(v, toVersion)
    return cmp1 >= 0 && cmp2 <= 0
  }).sort(compareVersions)
}

// ========================================
// Schema版本管理
// ========================================

/**
 * 获取Schema的当前版本
 */
export function getCurrentSchemaVersion<T extends { schemaVersion?: string }>(
  schema: T
): string {
  return schema.schemaVersion || CURRENT_SCHEMA_VERSION
}

/**
 * 设置Schema版本
 */
export function setSchemaVersion<T extends { schemaVersion?: string }>(
  schema: T,
  version: string
): T {
  if (!isValidVersion(version)) {
    throw new Error(`Invalid schema version: ${version}`)
  }
  
  return {
    ...schema,
    schemaVersion: version
  }
}

/**
 * 检查Schema版本是否支持
 */
export function isSupportedSchemaVersion(version: string): boolean {
  return (SUPPORTED_SCHEMA_VERSIONS as readonly string[]).includes(version)
}

/**
 * 验证Schema版本兼容性
 */
export function validateSchemaVersion<T extends { schemaVersion?: string }>(
  schema: T,
  requiredVersion?: string
): boolean {
  const schemaVersion = getCurrentSchemaVersion(schema)
  
  // 如果没有指定required版本，检查是否在支持列表中
  if (!requiredVersion) {
    return isSupportedSchemaVersion(schemaVersion)
  }
  
  // 检查兼容性
  return isCompatibleVersion(schemaVersion, requiredVersion)
}

// ========================================
// Schema升级路径
// ========================================

/**
 * 升级路径定义
 */
export interface UpgradePath {
  from: string
  to: string
  isBreaking: boolean
  migrationRequired: boolean
  description: string
}

/**
 * 所有支持的升级路径
 */
export const UPGRADE_PATHS: UpgradePath[] = [
  // 未来版本升级路径将在这里定义
  // 例如：
  // {
  //   from: '1.0.0',
  //   to: '1.1.0',
  //   isBreaking: false,
  //   migrationRequired: false,
  //   description: '添加新的可选字段'
  // }
]

/**
 * 查找从fromVersion到toVersion的升级路径
 */
export function findUpgradePath(fromVersion: string, toVersion: string): UpgradePath[] {
  // 如果版本相同，无需升级
  if (compareVersions(fromVersion, toVersion) === 0) {
    return []
  }
  
  // 查找所有可能的升级路径
  const paths = UPGRADE_PATHS.filter(path => {
    const pathFrom = parseVersion(path.from)
    const pathTo = parseVersion(path.to)
    
    return compareVersions(formatVersion(pathFrom), fromVersion) >= 0 &&
           compareVersions(formatVersion(pathTo), toVersion) <= 0
  })
  
  return paths.sort((a, b) => compareVersions(a.from, b.from))
}

/**
 * 检查升级路径是否包含破坏性变更
 */
export function hasBreakingChanges(fromVersion: string, toVersion: string): boolean {
  const paths = findUpgradePath(fromVersion, toVersion)
  return paths.some(p => p.isBreaking)
}

/**
 * 检查升级是否需要数据迁移
 */
export function requiresMigration(fromVersion: string, toVersion: string): boolean {
  const paths = findUpgradePath(fromVersion, toVersion)
  return paths.some(p => p.migrationRequired)
}

// ========================================
// 工具函数
// ========================================

/**
 * 获取版本信息摘要
 */
export function getVersionInfo(version: string) {
  const parsed = parseVersion(version)
  
  return {
    version,
    parsed,
    isSupported: isSupportedSchemaVersion(version),
    isStable: !parsed.prerelease,
    formatted: formatVersion(parsed)
  }
}

/**
 * 批量比较版本
 */
export function sortVersions(versions: string[], descending = false): string[] {
  const sorted = [...versions].sort(compareVersions)
  return descending ? sorted.reverse() : sorted
}

/**
 * 获取最新版本
 */
export function getLatestVersion(versions: string[]): string | undefined {
  if (versions.length === 0) return undefined
  return sortVersions(versions, true)[0]
}

/**
 * 获取最旧版本
 */
export function getOldestVersion(versions: string[]): string | undefined {
  if (versions.length === 0) return undefined
  return sortVersions(versions, false)[0]
}

