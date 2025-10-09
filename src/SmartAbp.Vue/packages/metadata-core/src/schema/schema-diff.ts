/**
 * @smartabp/metadata-core/schema
 * Schema差异对比工具
 * 
 * 功能：
 * - 计算两个Schema的差异
 * - 生成变更日志
 * - 支持Schema合并
 * - 生成补丁(Patch)
 */

import type { EntityMetadata } from '@smartabp/lowcode-shared'

// ========================================
// 差异类型定义
// ========================================

/**
 * 差异操作类型
 */
export type DiffOperation = 'ADD' | 'REMOVE' | 'MODIFY' | 'UNCHANGED'

/**
 * 字段差异
 */
export interface FieldDiff {
  operation: DiffOperation
  path: string
  oldValue?: any
  newValue?: any
  description: string
}

/**
 * Schema差异结果
 */
export interface SchemaDiff {
  hasChanges: boolean
  additions: FieldDiff[]
  removals: FieldDiff[]
  modifications: FieldDiff[]
  unchanged: number
  summary: DiffSummary
}

/**
 * 差异摘要
 */
export interface DiffSummary {
  totalChanges: number
  addedFields: number
  removedFields: number
  modifiedFields: number
  unchangedFields: number
}

// ========================================
// 实体差异对比
// ========================================

/**
 * 对比两个实体Schema
 */
export function diffEntitySchema(
  oldSchema: EntityMetadata,
  newSchema: EntityMetadata
): SchemaDiff {
  const additions: FieldDiff[] = []
  const removals: FieldDiff[] = []
  const modifications: FieldDiff[] = []
  let unchangedCount = 0
  
  // 对比基础字段
  const baseFields: Array<keyof EntityMetadata> = [
    'name', 'module', 'keyType', 'description', 'aggregate',
    'isAggregateRoot', 'isMultiTenant', 'isSoftDelete', 'hasExtraProperties'
  ]
  
  for (const field of baseFields) {
    const oldValue = oldSchema[field]
    const newValue = newSchema[field]
    
    if (oldValue === undefined && newValue !== undefined) {
      additions.push({
        operation: 'ADD',
        path: field,
        newValue,
        description: `新增字段 '${field}'`
      })
    } else if (oldValue !== undefined && newValue === undefined) {
      removals.push({
        operation: 'REMOVE',
        path: field,
        oldValue,
        description: `删除字段 '${field}'`
      })
    } else if (oldValue !== newValue) {
      modifications.push({
        operation: 'MODIFY',
        path: field,
        oldValue,
        newValue,
        description: `修改字段 '${field}'`
      })
    } else if (oldValue !== undefined) {
      unchangedCount++
    }
  }
  
  // 对比属性列表
  const propertyDiffs = diffPropertyList(oldSchema.properties, newSchema.properties)
  additions.push(...propertyDiffs.additions)
  removals.push(...propertyDiffs.removals)
  modifications.push(...propertyDiffs.modifications)
  unchangedCount += propertyDiffs.unchangedCount
  
  return {
    hasChanges: additions.length > 0 || removals.length > 0 || modifications.length > 0,
    additions,
    removals,
    modifications,
    unchanged: unchangedCount,
    summary: {
      totalChanges: additions.length + removals.length + modifications.length,
      addedFields: additions.length,
      removedFields: removals.length,
      modifiedFields: modifications.length,
      unchangedFields: unchangedCount
    }
  }
}

/**
 * 对比属性列表
 */
function diffPropertyList(
  oldProperties: any[],
  newProperties: any[]
): { 
  additions: FieldDiff[], 
  removals: FieldDiff[], 
  modifications: FieldDiff[],
  unchangedCount: number 
} {
  const additions: FieldDiff[] = []
  const removals: FieldDiff[] = []
  const modifications: FieldDiff[] = []
  let unchangedCount = 0
  
  const oldPropMap = new Map(oldProperties.map(p => [p.name, p]))
  const newPropMap = new Map(newProperties.map(p => [p.name, p]))
  
  // 检查删除的属性
  for (const [name, oldProp] of oldPropMap) {
    if (!newPropMap.has(name)) {
      removals.push({
        operation: 'REMOVE',
        path: `properties.${name}`,
        oldValue: oldProp,
        description: `删除属性 '${name}'`
      })
    }
  }
  
  // 检查新增的属性
  for (const [name, newProp] of newPropMap) {
    if (!oldPropMap.has(name)) {
      additions.push({
        operation: 'ADD',
        path: `properties.${name}`,
        newValue: newProp,
        description: `新增属性 '${name}'`
      })
    }
  }
  
  // 检查修改的属性
  for (const [name, oldProp] of oldPropMap) {
    const newProp = newPropMap.get(name)
    if (!newProp) continue
    
    const propDiffs = diffObject(oldProp, newProp, `properties.${name}`)
    modifications.push(...propDiffs.modifications)
    unchangedCount += propDiffs.unchangedCount
  }
  
  return { additions, removals, modifications, unchangedCount }
}

/**
 * 对比两个对象
 */
function diffObject(
  oldObj: Record<string, any>,
  newObj: Record<string, any>,
  basePath: string
): { modifications: FieldDiff[], unchangedCount: number } {
  const modifications: FieldDiff[] = []
  let unchangedCount = 0
  
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)])
  
  for (const key of allKeys) {
    const oldValue = oldObj[key]
    const newValue = newObj[key]
    const path = `${basePath}.${key}`
    
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      modifications.push({
        operation: 'MODIFY',
        path,
        oldValue,
        newValue,
        description: `修改 '${path}'`
      })
    } else if (oldValue !== undefined) {
      unchangedCount++
    }
  }
  
  return { modifications, unchangedCount }
}

// ========================================
// 变更日志生成
// ========================================

/**
 * 生成变更日志（Changelog）
 */
export function generateChangelog(diff: SchemaDiff, version: string): string {
  const lines: string[] = []
  
  lines.push(`## [${version}] - ${new Date().toISOString().split('T')[0]}`)
  lines.push('')
  
  if (diff.additions.length > 0) {
    lines.push('### 新增 (Added)')
    lines.push('')
    diff.additions.forEach(add => {
      lines.push(`- ${add.description}`)
    })
    lines.push('')
  }
  
  if (diff.modifications.length > 0) {
    lines.push('### 变更 (Changed)')
    lines.push('')
    diff.modifications.forEach(mod => {
      lines.push(`- ${mod.description}`)
    })
    lines.push('')
  }
  
  if (diff.removals.length > 0) {
    lines.push('### 删除 (Removed)')
    lines.push('')
    diff.removals.forEach(rem => {
      lines.push(`- ${rem.description}`)
    })
    lines.push('')
  }
  
  return lines.join('\n')
}

// ========================================
// Schema合并
// ========================================

/**
 * 合并选项
 */
export interface MergeOptions {
  strategy: 'ours' | 'theirs' | 'merge'
  conflictResolution?: (field: string, ours: any, theirs: any) => any
}

/**
 * 合并两个Schema（简单版本）
 */
export function mergeSchemas<T extends Record<string, any>>(
  base: T,
  incoming: T,
  options: MergeOptions = { strategy: 'merge' }
): T {
  const result = { ...base }
  
  for (const key in incoming) {
    const baseValue = base[key]
    const incomingValue = incoming[key]
    
    // 如果base没有该字段，直接添加
    if (baseValue === undefined) {
      result[key] = incomingValue
      continue
    }
    
    // 如果incoming没有该字段，保留base
    if (incomingValue === undefined) {
      continue
    }
    
    // 如果值相同，无需合并
    if (JSON.stringify(baseValue) === JSON.stringify(incomingValue)) {
      continue
    }
    
    // 根据策略合并
    switch (options.strategy) {
      case 'ours':
        // 保留base的值
        break
      case 'theirs':
        // 使用incoming的值
        result[key] = incomingValue
        break
      case 'merge':
        // 使用自定义冲突解决函数
        if (options.conflictResolution) {
          result[key] = options.conflictResolution(key, baseValue, incomingValue)
        } else {
          // 默认使用incoming
          result[key] = incomingValue
        }
        break
    }
  }
  
  return result
}

// ========================================
// 工具函数
// ========================================

/**
 * 生成差异摘要文本
 */
export function generateDiffSummary(diff: SchemaDiff): string {
  if (!diff.hasChanges) {
    return '✅ 无变更'
  }
  
  const parts: string[] = []
  
  if (diff.additions.length > 0) {
    parts.push(`+${diff.additions.length}新增`)
  }
  if (diff.modifications.length > 0) {
    parts.push(`~${diff.modifications.length}修改`)
  }
  if (diff.removals.length > 0) {
    parts.push(`-${diff.removals.length}删除`)
  }
  
  return parts.join(', ')
}

/**
 * 按路径过滤差异
 */
export function filterDiffByPath(diff: SchemaDiff, pathPrefix: string): SchemaDiff {
  const filterFn = (d: FieldDiff) => d.path.startsWith(pathPrefix)
  
  return {
    hasChanges: diff.hasChanges,
    additions: diff.additions.filter(filterFn),
    removals: diff.removals.filter(filterFn),
    modifications: diff.modifications.filter(filterFn),
    unchanged: diff.unchanged,
    summary: diff.summary
  }
}

