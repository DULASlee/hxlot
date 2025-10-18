/**
 * 🔥 SmartAbp 统一Schema差异对比工具
 *
 * 📦 从 @smartabp/metadata-core 迁移并适配 UnifiedEntityDefinition
 * 🎯 功能：
 *   - 计算两个Schema的差异
 *   - 生成变更日志
 *   - 支持Schema合并
 *   - 生成补丁(Patch)
 *
 * @version 3.0.0 - D2优化：支持 EntityMetadata 和 UnifiedEntityDefinition 重载
 * @migrated-from @smartabp/metadata-core/schema/schema-diff
 * @adapted-for UnifiedEntityDefinition
 */

// Phase 2B: 使用后端SSOT类型别名
import type { UnifiedEntityDefinition } from '@/api/generated/type-aliases'

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
// 实体差异对比（D2重载支持）
// ========================================

/**
 * 对比两个实体Schema（统一Schema）
 */
export function diffEntitySchema(
    oldSchema: UnifiedEntityDefinition,
    newSchema: UnifiedEntityDefinition
): SchemaDiff {
    return diffEntitySchemaInternal(oldSchema, newSchema)
}

/**
 * 内部实现：对比两个UnifiedEntityDefinition
 */
function diffEntitySchemaInternal(
    oldSchema: UnifiedEntityDefinition,
    newSchema: UnifiedEntityDefinition
): SchemaDiff {
    const additions: FieldDiff[] = []
    const removals: FieldDiff[] = []
    const modifications: FieldDiff[] = []
    let unchangedCount = 0

    // 对比基础字段 (Phase 2B: 适配后端EntityDefinitionDto字段)
    const baseFields: Array<keyof UnifiedEntityDefinition> = [
        'name', 'displayName', 'tableName', 'namespace',
        'schema', 'isAggregateRoot', 'baseClass', 'isAudited', 'isSoftDelete',
        'isMultiTenant'
    ]

    for (const field of baseFields) {
        const oldValue = oldSchema[field]
        const newValue = newSchema[field]

        if (oldValue === undefined && newValue !== undefined) {
            additions.push({
                operation: 'ADD',
                path: String(field),
                newValue,
                description: `新增字段 '${String(field)}'`
            })
        } else if (oldValue !== undefined && newValue === undefined) {
            removals.push({
                operation: 'REMOVE',
                path: String(field),
                oldValue,
                description: `删除字段 '${String(field)}'`
            })
        } else if (oldValue !== newValue) {
            modifications.push({
                operation: 'MODIFY',
                path: String(field),
                oldValue,
                newValue,
                description: `修改字段 '${String(field)}'`
            })
        } else if (oldValue !== undefined) {
            unchangedCount++
        }
    }

    // 对比字段列表（fields）- Phase 2B: 添加空值检查
    const fieldDiffs = diffFieldList(oldSchema.fields || [], newSchema.fields || [])
    additions.push(...fieldDiffs.additions)
    removals.push(...fieldDiffs.removals)
    modifications.push(...fieldDiffs.modifications)
    unchangedCount += fieldDiffs.unchangedCount

    // 对比关系列表（relationships）- Phase 2B: 添加空值检查
    const relationshipDiffs = diffRelationshipList(oldSchema.relationships || [], newSchema.relationships || [])
    additions.push(...relationshipDiffs.additions)
    removals.push(...relationshipDiffs.removals)
    modifications.push(...relationshipDiffs.modifications)
    unchangedCount += relationshipDiffs.unchangedCount

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
 * 对比字段列表（UnifiedEntityField[]）
 */
function diffFieldList(
    oldFields: any[],
    newFields: any[]
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

    const oldFieldMap = new Map(oldFields.map(f => [f.name, f]))
    const newFieldMap = new Map(newFields.map(f => [f.name, f]))

    // 检查删除的字段
    for (const [name, oldField] of oldFieldMap) {
        if (!newFieldMap.has(name)) {
            removals.push({
                operation: 'REMOVE',
                path: `fields.${name}`,
                oldValue: oldField,
                description: `删除字段 '${name}'`
            })
        }
    }

    // 检查新增的字段
    for (const [name, newField] of newFieldMap) {
        if (!oldFieldMap.has(name)) {
            additions.push({
                operation: 'ADD',
                path: `fields.${name}`,
                newValue: newField,
                description: `新增字段 '${name}'`
            })
        }
    }

    // 检查修改的字段
    for (const [name, oldField] of oldFieldMap) {
        const newField = newFieldMap.get(name)
        if (!newField) continue

        const fieldDiffs = diffObject(oldField, newField, `fields.${name}`)
        modifications.push(...fieldDiffs.modifications)
        unchangedCount += fieldDiffs.unchangedCount
    }

    return { additions, removals, modifications, unchangedCount }
}

/**
 * 对比关系列表（UnifiedEntityRelationship[]）
 */
function diffRelationshipList(
    oldRelationships: any[],
    newRelationships: any[]
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

    const oldRelMap = new Map(oldRelationships.map(r => [r.name, r]))
    const newRelMap = new Map(newRelationships.map(r => [r.name, r]))

    // 检查删除的关系
    for (const [name, oldRel] of oldRelMap) {
        if (!newRelMap.has(name)) {
            removals.push({
                operation: 'REMOVE',
                path: `relationships.${name}`,
                oldValue: oldRel,
                description: `删除关系 '${name}'`
            })
        }
    }

    // 检查新增的关系
    for (const [name, newRel] of newRelMap) {
        if (!oldRelMap.has(name)) {
            additions.push({
                operation: 'ADD',
                path: `relationships.${name}`,
                newValue: newRel,
                description: `新增关系 '${name}'`
            })
        }
    }

    // 检查修改的关系
    for (const [name, oldRel] of oldRelMap) {
        const newRel = newRelMap.get(name)
        if (!newRel) continue

        const relDiffs = diffObject(oldRel, newRel, `relationships.${name}`)
        modifications.push(...relDiffs.modifications)
        unchangedCount += relDiffs.unchangedCount
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

// ========================================
// 向后兼容导出（metadata-core接口）
// ========================================

/**
 * @deprecated 请使用 diffEntitySchema
 */
export { diffEntitySchema as diffEntity }

/**
 * @deprecated 请使用 generateChangelog
 */
export { generateChangelog as generateChangeLog }

