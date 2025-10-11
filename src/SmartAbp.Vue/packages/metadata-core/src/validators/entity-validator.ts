/**
 * 实体元数据验证器
 * 基于Zod实现类型安全验证
 */

import { z } from 'zod'
import type { EntityMetadata } from '../types/index.js'
import { entityErrorMap, formatErrorMessage } from './error-map'

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
        .regex(/^[a-z][a-zA-Z0-9]*$/, '属性名称必须是camelCase格式（首字母小写）'),
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
    name: z.string()
        .min(1, '导航属性名称不能为空')
        .regex(/^[a-z][a-zA-Z0-9]*$/, '导航属性名称必须是camelCase格式'),
    targetEntity: z.string()
        .min(1, '目标实体不能为空')
        .regex(/^[A-Z][a-zA-Z0-9]*$/, 'targetEntity必须是PascalCase格式'),
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
        .regex(/^[A-Z][a-zA-Z0-9]*$/, '实体名称必须是PascalCase格式（首字母大写）'),
    module: z.string()
        .min(1, '模块名称不能为空')
        .max(128, '模块名称不能超过128个字符'),
    aggregate: z.string().optional(),
    keyType: z.enum(['Guid', 'int', 'long', 'string']),
    description: z.string().max(10000, '描述不能超过10000个字符').optional(),
    isAggregateRoot: z.boolean(),
    isMultiTenant: z.boolean(),
    isSoftDelete: z.boolean(),
    hasExtraProperties: z.boolean(),
    properties: z.array(PropertyMetadataSchema)
        .min(1, '实体必须至少有一个属性'),
    navigationProperties: z.array(NavigationPropertySchema).optional(),
    xUiConfig: UIConfigSchema,
    xBackendConfig: BackendConfigSchema
}).superRefine((data, ctx) => {
    // ========================================
    // 高级验证：跨字段验证
    // ========================================

    // 1. 检查属性名重复
    const propertyNames = data.properties.map(p => p.name)
    const duplicateProps = propertyNames.filter((name, index) =>
        propertyNames.indexOf(name) !== index
    )
    if (duplicateProps.length > 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `属性名称不能重复: ${duplicateProps[0]}`,
            path: ['properties']
        })
    }

    // 2. 检查导航属性名重复
    if (data.navigationProperties && data.navigationProperties.length > 0) {
        const navPropNames = data.navigationProperties.map(p => p.name)
        const duplicateNavProps = navPropNames.filter((name, index) =>
            navPropNames.indexOf(name) !== index
        )
        if (duplicateNavProps.length > 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `导航属性名称不能重复: ${duplicateNavProps[0]}`,
                path: ['navigationProperties']
            })
        }

        // 3. 检查属性名与导航属性名冲突
        const propNameSet = new Set(propertyNames)
        const conflictNames = navPropNames.filter(name => propNameSet.has(name))
        if (conflictNames.length > 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `属性名称与导航属性名称重复: ${conflictNames[0]}`,
                path: ['navigationProperties']
            })
        }

        // 4. 选择性地检查foreignKey引用的属性是否存在
        // 特殊情况：只有当properties列表只包含单个'id'属性时，才强制检查foreignKey
        // 这是为了捕获明显的错误配置，同时允许ORM框架隐式管理外键的情况
        const isSingleIdProperty = data.properties.length === 1 && data.properties[0]?.name === 'id'

        if (isSingleIdProperty) {
            data.navigationProperties.forEach((navProp, index) => {
                if (navProp.foreignKey && !propNameSet.has(navProp.foreignKey)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `foreignKey引用的属性不存在: ${navProp.foreignKey}`,
                        path: ['navigationProperties', index, 'foreignKey']
                    })
                }
            })
        }
        // 其他情况：允许foreignKey引用不存在的属性（由ORM框架管理）
    }

    // 5. 检查maxLength对string类型的合理性
    data.properties.forEach((prop, index) => {
        if (prop.type === 'string' && prop.maxLength !== undefined) {
            if (prop.maxLength <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'maxLength必须大于0',
                    path: ['properties', index, 'maxLength']
                })
            }
            if (prop.maxLength > 10000) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'maxLength不能超过10000',
                    path: ['properties', index, 'maxLength']
                })
            }
        }
    })
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
    const result = EntityMetadataSchema.safeParse(data, { errorMap: entityErrorMap })

    if (result.success) {
        return []
    }

    return result.error.issues.map(err => {
        const path = err.path.length > 0 ? err.path.join('.') : ''
        return formatErrorMessage(path, err.message)
    })
}

/**
 * 验证实体元数据（异步，支持复杂验证）
 * @returns true表示验证通过，抛出异常表示验证失败
 */
export async function validateEntityMetadataAsync(
    data: unknown
): Promise<boolean> {
    // 基础验证
    const result = EntityMetadataSchema.safeParse(data)

    if (!result.success) {
        throw result.error
    }

    // 可扩展：添加异步验证逻辑（如数据库唯一性检查）
    // 例如：检查实体名称是否已存在
    // const exists = await checkEntityNameExists(result.data.name)
    // if (exists) throw new Error('实体名称已存在')

    return true
}

