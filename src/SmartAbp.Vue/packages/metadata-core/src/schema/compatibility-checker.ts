/**
 * @smartabp/metadata-core/schema
 * Schema兼容性检查器
 * 
 * 功能：
 * - 向后兼容性验证
 * - 破坏性变更检测
 * - 字段变更分析
 * - 迁移计划生成
 */

import type { 
  EntityMetadata, 
  ModuleMetadata, 
  AspireSolutionMetadata,
  PropertyMetadata
} from '../types'
import { isBreakingChange } from './version-manager'

// ========================================
// 兼容性检查结果
// ========================================

/**
 * 兼容性检查结果
 */
export interface CompatibilityResult {
  isCompatible: boolean
  breakingChanges: BreakingChange[]
  warnings: CompatibilityWarning[]
  suggestions: string[]
}

/**
 * 破坏性变更
 */
export interface BreakingChange {
  type: 'FIELD_REMOVED' | 'FIELD_TYPE_CHANGED' | 'REQUIRED_FIELD_ADDED' | 'VALIDATION_STRICTER'
  field: string
  oldValue?: any
  newValue?: any
  description: string
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
}

/**
 * 兼容性警告
 */
export interface CompatibilityWarning {
  type: 'FIELD_DEPRECATED' | 'FIELD_RENAMED' | 'DEFAULT_VALUE_CHANGED'
  field: string
  message: string
  suggestion?: string
}

// ========================================
// 实体兼容性检查
// ========================================

/**
 * 检查实体Schema的兼容性
 */
export function checkEntityCompatibility(
  oldSchema: EntityMetadata,
  newSchema: EntityMetadata
): CompatibilityResult {
  const breakingChanges: BreakingChange[] = []
  const warnings: CompatibilityWarning[] = []
  const suggestions: string[] = []
  
  // 检查版本
  const oldVersion = oldSchema.schemaVersion || '1.0.0'
  const newVersion = newSchema.schemaVersion || '1.0.0'
  
  if (isBreakingChange(oldVersion, newVersion)) {
    breakingChanges.push({
      type: 'FIELD_TYPE_CHANGED',
      field: 'schemaVersion',
      oldValue: oldVersion,
      newValue: newVersion,
      description: `Schema版本从 ${oldVersion} 升级到 ${newVersion}（major版本变更）`,
      impact: 'HIGH'
    })
  }
  
  // 检查基础字段变更
  if (oldSchema.name !== newSchema.name) {
    breakingChanges.push({
      type: 'FIELD_TYPE_CHANGED',
      field: 'name',
      oldValue: oldSchema.name,
      newValue: newSchema.name,
      description: '实体名称已变更',
      impact: 'HIGH'
    })
  }
  
  if (oldSchema.module !== newSchema.module) {
    breakingChanges.push({
      type: 'FIELD_TYPE_CHANGED',
      field: 'module',
      oldValue: oldSchema.module,
      newValue: newSchema.module,
      description: '模块名称已变更',
      impact: 'HIGH'
    })
  }
  
  if (oldSchema.keyType !== newSchema.keyType) {
    breakingChanges.push({
      type: 'FIELD_TYPE_CHANGED',
      field: 'keyType',
      oldValue: oldSchema.keyType,
      newValue: newSchema.keyType,
      description: '主键类型已变更',
      impact: 'HIGH'
    })
  }
  
  // 检查属性变更
  const propertyChanges = checkPropertyCompatibility(
    oldSchema.properties,
    newSchema.properties
  )
  
  breakingChanges.push(...propertyChanges.breakingChanges)
  warnings.push(...propertyChanges.warnings)
  
  // 生成建议
  if (breakingChanges.length > 0) {
    suggestions.push('建议创建数据迁移脚本处理破坏性变更')
    suggestions.push('建议更新API文档说明变更内容')
  }
  
  if (warnings.length > 0) {
    suggestions.push('建议通知使用方即将废弃的字段')
  }
  
  return {
    isCompatible: breakingChanges.length === 0,
    breakingChanges,
    warnings,
    suggestions
  }
}

/**
 * 检查属性列表的兼容性
 */
function checkPropertyCompatibility(
  oldProperties: PropertyMetadata[],
  newProperties: PropertyMetadata[]
): { breakingChanges: BreakingChange[], warnings: CompatibilityWarning[] } {
  const breakingChanges: BreakingChange[] = []
  const warnings: CompatibilityWarning[] = []
  
  const oldPropMap = new Map(oldProperties.map(p => [p.name, p]))
  const newPropMap = new Map(newProperties.map(p => [p.name, p]))
  
  // 检查删除的属性
  for (const [name, oldProp] of oldPropMap) {
    if (!newPropMap.has(name)) {
      breakingChanges.push({
        type: 'FIELD_REMOVED',
        field: `properties.${name}`,
        oldValue: oldProp,
        description: `属性 '${name}' 已被删除`,
        impact: 'HIGH'
      })
    }
  }
  
  // 检查新增的必需属性
  for (const [name, newProp] of newPropMap) {
    if (!oldPropMap.has(name) && newProp.isRequired) {
      breakingChanges.push({
        type: 'REQUIRED_FIELD_ADDED',
        field: `properties.${name}`,
        newValue: newProp,
        description: `新增必需属性 '${name}'`,
        impact: 'HIGH'
      })
    }
  }
  
  // 检查属性类型变更
  for (const [name, oldProp] of oldPropMap) {
    const newProp = newPropMap.get(name)
    if (!newProp) continue
    
    // 类型变更
    if (oldProp.type !== newProp.type) {
      breakingChanges.push({
        type: 'FIELD_TYPE_CHANGED',
        field: `properties.${name}.type`,
        oldValue: oldProp.type,
        newValue: newProp.type,
        description: `属性 '${name}' 的类型从 ${oldProp.type} 变更为 ${newProp.type}`,
        impact: 'HIGH'
      })
    }
    
    // 必需性变更（可选→必需）
    if (!oldProp.isRequired && newProp.isRequired) {
      breakingChanges.push({
        type: 'VALIDATION_STRICTER',
        field: `properties.${name}.isRequired`,
        oldValue: false,
        newValue: true,
        description: `属性 '${name}' 从可选变为必需`,
        impact: 'HIGH'
      })
    }
    
    // 最大长度变更（变小）
    if (oldProp.maxLength && newProp.maxLength && newProp.maxLength < oldProp.maxLength) {
      breakingChanges.push({
        type: 'VALIDATION_STRICTER',
        field: `properties.${name}.maxLength`,
        oldValue: oldProp.maxLength,
        newValue: newProp.maxLength,
        description: `属性 '${name}' 的最大长度从 ${oldProp.maxLength} 减小到 ${newProp.maxLength}`,
        impact: 'MEDIUM'
      })
    }
    
    // 默认值变更（警告）
    if (oldProp.defaultValue !== newProp.defaultValue) {
      warnings.push({
        type: 'DEFAULT_VALUE_CHANGED',
        field: `properties.${name}.defaultValue`,
        message: `属性 '${name}' 的默认值已变更`,
        suggestion: '确保现有数据与新默认值兼容'
      })
    }
  }
  
  return { breakingChanges, warnings }
}

// ========================================
// 模块兼容性检查
// ========================================

/**
 * 检查模块Schema的兼容性
 */
export function checkModuleCompatibility(
  oldSchema: ModuleMetadata,
  newSchema: ModuleMetadata
): CompatibilityResult {
  const breakingChanges: BreakingChange[] = []
  const warnings: CompatibilityWarning[] = []
  const suggestions: string[] = []
  
  // 检查版本
  const oldVersion = oldSchema.version
  const newVersion = newSchema.version
  
  if (isBreakingChange(oldVersion, newVersion)) {
    breakingChanges.push({
      type: 'FIELD_TYPE_CHANGED',
      field: 'version',
      oldValue: oldVersion,
      newValue: newVersion,
      description: `模块版本从 ${oldVersion} 升级到 ${newVersion}（major版本变更）`,
      impact: 'HIGH'
    })
  }
  
  // 检查路由变更
  const routeChanges = checkRouteCompatibility(oldSchema.routes, newSchema.routes)
  breakingChanges.push(...routeChanges.breakingChanges)
  warnings.push(...routeChanges.warnings)
  
  // 检查依赖变更
  const newDeps = newSchema.dependsOn.filter(d => !oldSchema.dependsOn.includes(d))
  if (newDeps.length > 0) {
    warnings.push({
      type: 'DEFAULT_VALUE_CHANGED',
      field: 'dependsOn',
      message: `新增依赖: ${newDeps.join(', ')}`,
      suggestion: '确保新依赖已安装'
    })
  }
  
  // 生成建议
  if (breakingChanges.length > 0) {
    suggestions.push('建议发布为新的major版本')
    suggestions.push('建议更新模块使用文档')
  }
  
  return {
    isCompatible: breakingChanges.length === 0,
    breakingChanges,
    warnings,
    suggestions
  }
}

/**
 * 检查路由兼容性
 */
function checkRouteCompatibility(
  oldRoutes: any[],
  newRoutes: any[]
): { breakingChanges: BreakingChange[], warnings: CompatibilityWarning[] } {
  const breakingChanges: BreakingChange[] = []
  const warnings: CompatibilityWarning[] = []
  
  const oldRoutePaths = new Set(oldRoutes.map(r => r.path))
  const newRoutePaths = new Set(newRoutes.map(r => r.path))
  
  // 检查删除的路由
  for (const path of oldRoutePaths) {
    if (!newRoutePaths.has(path)) {
      breakingChanges.push({
        type: 'FIELD_REMOVED',
        field: `routes.${path}`,
        description: `路由 '${path}' 已被删除`,
        impact: 'HIGH'
      })
    }
  }
  
  // 检查新增路由（仅警告）
  for (const path of newRoutePaths) {
    if (!oldRoutePaths.has(path)) {
      warnings.push({
        type: 'DEFAULT_VALUE_CHANGED',
        field: `routes.${path}`,
        message: `新增路由 '${path}'`,
        suggestion: '更新路由文档'
      })
    }
  }
  
  return { breakingChanges, warnings }
}

// ========================================
// Aspire方案兼容性检查
// ========================================

/**
 * 检查Aspire方案Schema的兼容性
 */
export function checkAspireCompatibility(
  oldSchema: AspireSolutionMetadata,
  newSchema: AspireSolutionMetadata
): CompatibilityResult {
  const breakingChanges: BreakingChange[] = []
  const warnings: CompatibilityWarning[] = []
  const suggestions: string[] = []
  
  // 检查方案名称
  if (oldSchema.solutionName !== newSchema.solutionName) {
    breakingChanges.push({
      type: 'FIELD_TYPE_CHANGED',
      field: 'solutionName',
      oldValue: oldSchema.solutionName,
      newValue: newSchema.solutionName,
      description: '解决方案名称已变更',
      impact: 'HIGH'
    })
  }
  
  // 检查命名空间
  if (oldSchema.rootNamespace !== newSchema.rootNamespace) {
    breakingChanges.push({
      type: 'FIELD_TYPE_CHANGED',
      field: 'rootNamespace',
      oldValue: oldSchema.rootNamespace,
      newValue: newSchema.rootNamespace,
      description: '根命名空间已变更',
      impact: 'HIGH'
    })
  }
  
  // 检查微服务变更
  const serviceChanges = checkMicroserviceCompatibility(
    oldSchema.microservices,
    newSchema.microservices
  )
  
  breakingChanges.push(...serviceChanges.breakingChanges)
  warnings.push(...serviceChanges.warnings)
  
  // 生成建议
  if (breakingChanges.length > 0) {
    suggestions.push('建议创建新的Aspire方案而非升级')
    suggestions.push('建议更新部署文档')
    suggestions.push('建议通知运维团队')
  }
  
  return {
    isCompatible: breakingChanges.length === 0,
    breakingChanges,
    warnings,
    suggestions
  }
}

/**
 * 检查微服务兼容性
 */
function checkMicroserviceCompatibility(
  oldServices: any[],
  newServices: any[]
): { breakingChanges: BreakingChange[], warnings: CompatibilityWarning[] } {
  const breakingChanges: BreakingChange[] = []
  const warnings: CompatibilityWarning[] = []
  
  const oldServiceMap = new Map(oldServices.map(s => [s.name, s]))
  const newServiceMap = new Map(newServices.map(s => [s.name, s]))
  
  // 检查删除的微服务
  for (const [name, oldService] of oldServiceMap) {
    if (!newServiceMap.has(name)) {
      breakingChanges.push({
        type: 'FIELD_REMOVED',
        field: `microservices.${name}`,
        oldValue: oldService,
        description: `微服务 '${name}' 已被删除`,
        impact: 'HIGH'
      })
    }
  }
  
  // 检查端口变更
  for (const [name, oldService] of oldServiceMap) {
    const newService = newServiceMap.get(name)
    if (!newService) continue
    
    if (oldService.port !== newService.port) {
      breakingChanges.push({
        type: 'FIELD_TYPE_CHANGED',
        field: `microservices.${name}.port`,
        oldValue: oldService.port,
        newValue: newService.port,
        description: `微服务 '${name}' 的端口从 ${oldService.port} 变更为 ${newService.port}`,
        impact: 'HIGH'
      })
    }
    
    if (oldService.type !== newService.type) {
      breakingChanges.push({
        type: 'FIELD_TYPE_CHANGED',
        field: `microservices.${name}.type`,
        oldValue: oldService.type,
        newValue: newService.type,
        description: `微服务 '${name}' 的类型从 ${oldService.type} 变更为 ${newService.type}`,
        impact: 'HIGH'
      })
    }
  }
  
  return { breakingChanges, warnings }
}

// ========================================
// 通用兼容性检查
// ========================================

/**
 * 快速兼容性检查（仅返回是否兼容）
 */
export function isBackwardCompatible(
  oldSchema: EntityMetadata | ModuleMetadata | AspireSolutionMetadata,
  newSchema: EntityMetadata | ModuleMetadata | AspireSolutionMetadata
): boolean {
  let result: CompatibilityResult
  
  if ('properties' in oldSchema && 'properties' in newSchema) {
    result = checkEntityCompatibility(oldSchema, newSchema)
  } else if ('routes' in oldSchema && 'routes' in newSchema) {
    result = checkModuleCompatibility(oldSchema, newSchema)
  } else if ('microservices' in oldSchema && 'microservices' in newSchema) {
    result = checkAspireCompatibility(oldSchema, newSchema)
  } else {
    throw new Error('Unknown schema type')
  }
  
  return result.isCompatible
}

/**
 * 生成兼容性报告
 */
export function generateCompatibilityReport(result: CompatibilityResult): string {
  const lines: string[] = []
  
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  lines.push('📊 Schema兼容性检查报告')
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  lines.push('')
  
  // 总体结果
  if (result.isCompatible) {
    lines.push('✅ 向后兼容: 是')
  } else {
    lines.push('❌ 向后兼容: 否')
  }
  
  lines.push(`🔴 破坏性变更: ${result.breakingChanges.length}个`)
  lines.push(`🟡 警告: ${result.warnings.length}个`)
  lines.push('')
  
  // 破坏性变更
  if (result.breakingChanges.length > 0) {
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('🔴 破坏性变更详情')
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    result.breakingChanges.forEach((change, index) => {
      lines.push(`${index + 1}. [${change.impact}] ${change.description}`)
      lines.push(`   字段: ${change.field}`)
      if (change.oldValue !== undefined) {
        lines.push(`   旧值: ${JSON.stringify(change.oldValue)}`)
      }
      if (change.newValue !== undefined) {
        lines.push(`   新值: ${JSON.stringify(change.newValue)}`)
      }
      lines.push('')
    })
  }
  
  // 警告
  if (result.warnings.length > 0) {
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('🟡 兼容性警告')
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    result.warnings.forEach((warning, index) => {
      lines.push(`${index + 1}. ${warning.message}`)
      lines.push(`   字段: ${warning.field}`)
      if (warning.suggestion) {
        lines.push(`   建议: ${warning.suggestion}`)
      }
      lines.push('')
    })
  }
  
  // 建议
  if (result.suggestions.length > 0) {
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('💡 行动建议')
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    result.suggestions.forEach((suggestion, index) => {
      lines.push(`${index + 1}. ${suggestion}`)
    })
    lines.push('')
  }
  
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  return lines.join('\n')
}

/**
 * 检查破坏性变更的影响级别
 */
export function assessBreakingChangeImpact(changes: BreakingChange[]): {
  high: number
  medium: number
  low: number
  total: number
} {
  return {
    high: changes.filter(c => c.impact === 'HIGH').length,
    medium: changes.filter(c => c.impact === 'MEDIUM').length,
    low: changes.filter(c => c.impact === 'LOW').length,
    total: changes.length
  }
}

