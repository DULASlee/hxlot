/**
 * 🔥 SmartAbp 统一实体元数据验证器
 *
 * 📦 从 @smartabp/metadata-core 迁移并适配 UnifiedEntityDefinition
 * 🎯 基于Zod实现类型安全验证
 *
 * @version 2.0.0
 * @migrated-from @smartabp/metadata-core/validators/entity-validator
 * @adapted-for UnifiedEntityDefinition (40+ fields)
 */

import { z } from 'zod'
import type { UnifiedEntityDefinition } from '@/api/generated/type-aliases'
import { formatErrorMessage } from './error-map'

// ========================================
// Zod Schema定义 - 适配UnifiedEntityDefinition
// ========================================

/**
 * 字段类型枚举（统一类型系统）
 */
const FieldTypeSchema = z.enum([
    'string', 'text', 'int', 'long', 'decimal', 'double',
    'bool', 'date', 'datetime', 'time', 'guid', 'json',
    'enum', 'file', 'image', 'array', 'object'
])

/**
 * 实体字段Schema（UnifiedEntityField）
 */
const UnifiedEntityFieldSchema = z.object({
    id: z.string().min(1, '字段ID不能为空'),
    name: z.string()
        .min(1, '字段名称不能为空')
        .regex(/^[A-Z][a-zA-Z0-9]*$/, '字段名称必须是PascalCase格式（首字母大写）'),
    displayName: z.string().min(1, '显示名称不能为空'),
    type: FieldTypeSchema,
    description: z.string().default(''),
    helpText: z.string().default(''),
    isRequired: z.boolean().default(false),
    isUnique: z.boolean().default(false),
    isIndexed: z.boolean().default(false),
    isSortable: z.boolean().default(false),
    isFilterable: z.boolean().default(false),
    isSearchable: z.boolean().default(false),
    isReadOnly: z.boolean().default(false),
    isHidden: z.boolean().default(false),
    defaultValue: z.any().optional(),
    minValue: z.any().optional(),
    maxValue: z.any().optional(),
    minLength: z.number().int().nonnegative().optional(),
    maxLength: z.number().int().positive().optional(),
    regexPattern: z.string().optional(),
    enumValues: z.array(z.string()).optional(),
    referenceEntity: z.string().optional(),
    order: z.number().int().default(0)
}).refine(
    data => {
        // 自定义验证：minLength ≤ maxLength
        if (data.minLength !== undefined && data.maxLength !== undefined) {
            return data.minLength <= data.maxLength
        }
        return true
    },
    {
        message: 'minLength不能大于maxLength',
        path: ['minLength']
    }
)

/**
 * 实体关系Schema（UnifiedEntityRelationship）
 */
const UnifiedEntityRelationshipSchema = z.object({
    id: z.string().min(1, '关系ID不能为空'),
    name: z.string()
        .min(1, '关系名称不能为空')
        .regex(/^[A-Z][a-zA-Z0-9]*$/, '关系名称必须是PascalCase格式'),
    displayName: z.string().min(1, '显示名称不能为空'),
    type: z.enum(['OneToOne', 'OneToMany', 'ManyToOne', 'ManyToMany']),
    targetEntity: z.string()
        .min(1, '目标实体不能为空')
        .regex(/^[A-Z][a-zA-Z0-9]*$/, '目标实体必须是PascalCase格式'),
    foreignKey: z.string().optional(),
    inverseName: z.string().optional(),
    cascadeDelete: z.boolean().default(false),
    isRequired: z.boolean().default(false),
    description: z.string().default('')
})

/**
 * UI配置Schema（简化版）
 */
const UIConfigSchema = z.object({
    showInList: z.boolean().default(true),
    showInDetail: z.boolean().default(true),
    showInForm: z.boolean().default(true),
    enableSearch: z.boolean().default(true),
    enablePagination: z.boolean().default(true),
    enableSort: z.boolean().default(true),
    enableFilter: z.boolean().default(true),
    pageSize: z.number().int().positive().default(20),
    icon: z.string().optional(),
    color: z.string().optional()
}).passthrough().default(() => ({
    showInList: true,
    showInDetail: true,
    showInForm: true,
    enableSearch: true,
    enablePagination: true,
    enableSort: true,
    enableFilter: true,
    pageSize: 20
})) // 提供完整默认值的工厂函数

/**
 * 代码生成配置Schema（简化版）
 */
const CodeGenerationConfigSchema = z.object({
    generateEntity: z.boolean().default(true),
    generateDto: z.boolean().default(true),
    generateAppService: z.boolean().default(true),
    generateController: z.boolean().default(true),
    generateRepository: z.boolean().default(true),
    generateFrontend: z.boolean().default(true),
    generateTests: z.boolean().default(false)
}).passthrough().default(() => ({
    generateEntity: true,
    generateDto: true,
    generateAppService: true,
    generateController: true,
    generateRepository: true,
    generateFrontend: true,
    generateTests: false
})) // 提供完整默认值的工厂函数

/**
 * 统一实体定义Schema（UnifiedEntityDefinition）
 *
 * ✅ 验证核心必填字段
 * ✅ 使用passthrough()允许额外字段（向后兼容）
 * ✅ 支持40+字段的完整UnifiedEntityDefinition
 */
export const UnifiedEntityDefinitionSchema = z.object({
    // ────────────────────────────────────────────────────────
    // 核心标识（必填）
    // ────────────────────────────────────────────────────────
    id: z.string().min(1, '实体ID不能为空'),
    name: z.string()
        .min(1, '实体名称不能为空')
        .max(128, '实体名称不能超过128个字符')
        .regex(/^[A-Z][a-zA-Z0-9]*$/, '实体名称必须是PascalCase格式（首字母大写）'),
    displayName: z.string().min(1, '显示名称不能为空'),
    tableName: z.string().min(1, '表名不能为空'),
    module: z.string().min(1, '模块名称不能为空'),
    namespace: z.string().min(1, '命名空间不能为空'),
    description: z.string().default(''),
    schema: z.string().default('dbo'),

    // ────────────────────────────────────────────────────────
    // DDD配置
    // ────────────────────────────────────────────────────────
    isAggregateRoot: z.boolean().default(true),
    baseClass: z.string().default('FullAuditedAggregateRoot<Guid>'),
    interfaces: z.array(z.string()).default([]),

    // ────────────────────────────────────────────────────────
    // ABP特性
    // ────────────────────────────────────────────────────────
    isAudited: z.boolean().default(true),
    isSoftDelete: z.boolean().default(true),
    isMultiTenant: z.boolean().default(false),

    // ────────────────────────────────────────────────────────
    // 字段和关系
    // ────────────────────────────────────────────────────────
    fields: z.array(UnifiedEntityFieldSchema)
        .min(1, '实体必须至少有一个字段'),
    relationships: z.array(UnifiedEntityRelationshipSchema).default([]),
    validationRules: z.array(z.any()).default([]),
    businessRules: z.array(z.any()).default([]),
    indexes: z.array(z.any()).default([]),
    constraints: z.array(z.any()).default([]),

    // ────────────────────────────────────────────────────────
    // 权限和UI配置
    // ────────────────────────────────────────────────────────
    permissions: z.array(z.any()).default([]),
    uiConfig: UIConfigSchema,
    codeGeneration: CodeGenerationConfigSchema,

    // ────────────────────────────────────────────────────────
    // 状态管理
    // ────────────────────────────────────────────────────────
    isCompleted: z.boolean().default(false),
    tags: z.array(z.string()).default([]),

    // ────────────────────────────────────────────────────────
    // 元数据管理
    // ────────────────────────────────────────────────────────
    schemaVersion: z.string().default('1.0.0'),
    version: z.string().default('1.0.0'),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date())
}).passthrough() // ✅ 允许额外字段（支持40+字段的完整结构）
    .superRefine((data, ctx) => {
        // ========================================
        // 高级验证：跨字段验证
        // ========================================

        // 1. 检查字段名重复
        const fieldNames = data.fields.map(f => f.name)
        const duplicateFields = fieldNames.filter((name, index) =>
            fieldNames.indexOf(name) !== index
        )
        if (duplicateFields.length > 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `字段名称不能重复: ${duplicateFields[0]}`,
                path: ['fields']
            })
        }

        // 2. 检查关系名重复
        if (data.relationships && data.relationships.length > 0) {
            const relationshipNames = data.relationships.map(r => r.name)
            const duplicateRelationships = relationshipNames.filter((name, index) =>
                relationshipNames.indexOf(name) !== index
            )
            if (duplicateRelationships.length > 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `关系名称不能重复: ${duplicateRelationships[0]}`,
                    path: ['relationships']
                })
            }

            // 3. 检查字段名与关系名冲突
            const fieldNameSet = new Set(fieldNames)
            const conflictNames = relationshipNames.filter(name => fieldNameSet.has(name))
            if (conflictNames.length > 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `字段名称与关系名称重复: ${conflictNames[0]}`,
                    path: ['relationships']
                })
            }
        }
    })

// ========================================
// 验证函数
// ========================================

/**
 * 验证统一实体定义（同步，抛出异常）
 * @throws ZodError 验证失败时抛出
 */
export function validateEntityMetadata(data: unknown): UnifiedEntityDefinition {
    return UnifiedEntityDefinitionSchema.parse(data) as unknown as UnifiedEntityDefinition
}

/**
 * 安全验证统一实体定义（同步，返回结果对象）
 * @returns 验证结果对象
 */
export function safeValidateEntityMetadata(data: unknown) {
    return UnifiedEntityDefinitionSchema.safeParse(data)
}

/**
 * 获取格式化的验证错误信息
 */
export function getEntityMetadataErrors(data: unknown): string[] {
    const result = UnifiedEntityDefinitionSchema.safeParse(data)

    if (result.success) {
        return []
    }

    return result.error.issues.map(err => {
        const path = err.path.length > 0 ? err.path.join('.') : ''
        return formatErrorMessage(path, err.message)
    })
}

/**
 * 验证统一实体定义（异步，支持复杂验证）
 * @returns true表示验证通过，抛出异常表示验证失败
 */
export async function validateEntityMetadataAsync(
    data: unknown
): Promise<boolean> {
    // 基础验证
    const result = UnifiedEntityDefinitionSchema.safeParse(data)

    if (!result.success) {
        throw result.error
    }

    // 可扩展：添加异步验证逻辑（如数据库唯一性检查）
    // 例如：检查实体名称是否已存在
    // const exists = await checkEntityNameExists(result.data.name)
    // if (exists) throw new Error('实体名称已存在')

    return true
}

// ========================================
// 向后兼容导出（metadata-core接口）
// ========================================

/**
 * @deprecated 请使用 validateEntityMetadata
 */
export { validateEntityMetadata as validateEntity }

/**
 * @deprecated 请使用 safeValidateEntityMetadata
 */
export { safeValidateEntityMetadata as safeValidateEntity }

