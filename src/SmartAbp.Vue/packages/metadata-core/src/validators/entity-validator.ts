/**
 * 实体元数据验证器
 * 基于Zod实现类型安全验证
 */

import { z } from 'zod'
import type { EntityMetadata } from '../types'

// ========================================
// Zod Schema定义
// ========================================

/**
 * 验证规则Schema
 */
const ValidationRuleSchema = z.object({
    name: z.string().min(1, '验证规则名称不能为空'),
    condition: z.string().min(1, '验证条件不能为空'),
    errorMessage: z.string().min(1, '错误信息不能为空')
})

/**
 * 属性元数据Schema
 */
const PropertyMetadataSchema = z.object({
    name: z.string()
        .min(1, '属性名称不能为空')
        .regex(/^[a-zA-Z][a-zA-Z0-9]*$/, '属性名称必须是有效的标识符'),
    type: z.string().min(1, '属性类型不能为空'),
    isRequired: z.boolean(),
    isReadOnly: z.boolean(),
    isUnique: z.boolean(),
    maxLength: z.number().int().positive().optional(),
    minLength: z.number().int().nonnegative().optional(),
    minValue: z.number().optional(),
    maxValue: z.number().optional(),
    defaultValue: z.string().optional(),
    description: z.string().optional(),
    displayName: z.string().optional(),
    validationRules: z.array(ValidationRuleSchema).default([])
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
).refine(
    data => {
        // 自定义验证：minValue ≤ maxValue
        if (data.minValue !== undefined && data.maxValue !== undefined) {
            return data.minValue <= data.maxValue
        }
        return true
    },
    {
        message: 'minValue不能大于maxValue',
        path: ['minValue']
    }
)

/**
 * 导航属性Schema
 */
const NavigationPropertySchema = z.object({
    name: z.string().min(1, '导航属性名称不能为空'),
    targetEntity: z.string().min(1, '目标实体不能为空'),
    relationType: z.enum(['OneToOne', 'OneToMany', 'ManyToOne', 'ManyToMany']),
    foreignKey: z.string().optional(),
    inverseName: z.string().optional()
})

/**
 * UI配置Schema
 */
const UIConfigSchema = z.object({
    listColumns: z.array(z.string()).optional(),
    formFields: z.array(z.string()).optional(),
    searchFields: z.array(z.string()).optional(),
    defaultSort: z.string().optional(),
    pageSize: z.number().int().positive().optional()
}).optional()

/**
 * 后端配置Schema
 */
const BackendConfigSchema = z.object({
    generateRepository: z.boolean().optional(),
    generateAppService: z.boolean().optional(),
    generateController: z.boolean().optional(),
    generateDto: z.boolean().optional()
}).optional()

/**
 * 实体元数据Schema
 */
export const EntityMetadataSchema = z.object({
    schemaVersion: z.string().default('1.0.0'),
    name: z.string()
        .min(1, '实体名称不能为空')
        .max(128, '实体名称不能超过128个字符')
        .regex(/^[A-Z][a-zA-Z0-9]*$/, '实体名称必须是PascalCase格式'),
    module: z.string()
        .min(1, '模块名称不能为空')
        .max(128, '模块名称不能超过128个字符'),
    aggregate: z.string().optional(),
    keyType: z.enum(['Guid', 'int', 'long', 'string']),
    description: z.string().max(500, '描述不能超过500个字符').optional(),
    isAggregateRoot: z.boolean(),
    isMultiTenant: z.boolean(),
    isSoftDelete: z.boolean(),
    hasExtraProperties: z.boolean(),
    properties: z.array(PropertyMetadataSchema)
        .min(1, '实体至少需要一个属性')
        .refine(
            props => {
                // 自定义验证：属性名称不能重复
                const names = props.map(p => p.name)
                return new Set(names).size === names.length
            },
            {
                message: '属性名称不能重复',
                path: ['properties']
            }
        ),
    navigationProperties: z.array(NavigationPropertySchema).optional(),
    xUiConfig: UIConfigSchema,
    xBackendConfig: BackendConfigSchema
})

// ========================================
// 验证函数
// ========================================

/**
 * 验证实体元数据（同步，抛出异常）
 * @throws ZodError 验证失败时抛出
 */
export function validateEntityMetadata(data: unknown): EntityMetadata {
    return EntityMetadataSchema.parse(data) as EntityMetadata
}

/**
 * 安全验证实体元数据（同步，返回结果对象）
 * @returns 验证结果对象
 */
export function safeValidateEntityMetadata(data: unknown) {
    return EntityMetadataSchema.safeParse(data)
}

/**
 * 获取格式化的验证错误信息
 */
export function getEntityMetadataErrors(data: unknown): string[] {
    const result = safeValidateEntityMetadata(data)

    if (result.success) {
        return []
    }

    return result.error.issues.map(err => {
        const path = err.path.length > 0 ? `${err.path.join('.')}: ` : ''
        return `${path}${err.message}`
    })
}

/**
 * 验证实体元数据（异步，支持复杂验证）
 */
export async function validateEntityMetadataAsync(
    data: unknown
): Promise<EntityMetadata> {
    // 基础验证
    const result = EntityMetadataSchema.safeParse(data)

    if (!result.success) {
        throw result.error
    }

    // 可扩展：添加异步验证逻辑（如数据库唯一性检查）
    // 例如：检查实体名称是否已存在
    // const exists = await checkEntityNameExists(result.data.name)
    // if (exists) throw new Error('实体名称已存在')

    return result.data as EntityMetadata
}

