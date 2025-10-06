/**
 * 模块元数据验证器
 * 基于Zod实现类型安全验证
 */

import { z } from 'zod'
import type { ModuleMetadata } from '../types'

// ========================================
// Zod Schema定义
// ========================================

/**
 * 路由元数据Schema
 */
const RouteMetadataSchema: z.ZodType<any, any, any> = z.lazy(() => z.object({
    path: z.string().min(1, '路由路径不能为空').startsWith('/', '路由路径必须以/开头'),
    name: z.string().min(1, '路由名称不能为空'),
    component: z.string().optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
    children: z.array(RouteMetadataSchema).optional()
}))

/**
 * Store元数据Schema
 */
const StoreMetadataSchema = z.object({
    name: z.string().min(1, 'Store名称不能为空'),
    type: z.enum(['entity', 'ui', 'global']),
    entityName: z.string().optional()
}).refine(
    data => {
        // 如果是entity类型，必须提供entityName
        if (data.type === 'entity' && !data.entityName) {
            return false
        }
        return true
    },
    {
        message: 'entity类型的Store必须指定entityName',
        path: ['entityName']
    }
)

/**
 * 生命周期元数据Schema
 */
const LifecycleMetadataSchema = z.object({
    onBeforeMount: z.string().optional(),
    onMounted: z.string().optional(),
    onBeforeUnmount: z.string().optional()
}).optional()

/**
 * 功能配置Schema
 */
const FeatureConfigSchema = z.record(z.string(), z.union([z.boolean(), z.string(), z.number()])).optional()

/**
 * 菜单配置Schema
 */
const MenuConfigSchema: z.ZodType<any, any, any> = z.lazy(() => z.object({
    title: z.string().min(1, '菜单标题不能为空'),
    icon: z.string().optional(),
    order: z.number().int().nonnegative().optional(),
    children: z.array(MenuConfigSchema).optional()
})).optional()

/**
 * 模块元数据Schema
 */
export const ModuleMetadataSchema = z.object({
    schemaVersion: z.string().default('1.0.0'),
    name: z.string()
        .min(1, '模块名称不能为空')
        .max(128, '模块名称不能超过128个字符')
        .regex(/^[a-zA-Z][a-zA-Z0-9]*$/, '模块名称必须是有效的标识符'),
    displayName: z.string().optional(),
    version: z.string()
        .regex(/^\d+\.\d+\.\d+$/, '版本号必须符合SemVer格式（如1.0.0）'),
    description: z.string().max(500, '描述不能超过500个字符').optional(),
    author: z.string().optional(),
    abpStyle: z.boolean(),
    order: z.number().int().nonnegative(),
    dependsOn: z.array(z.string()).default([]),
    routes: z.array(RouteMetadataSchema).default([]),
    stores: z.array(StoreMetadataSchema).default([]),
    policies: z.array(z.string()).default([]),
    lifecycle: LifecycleMetadataSchema,
    features: FeatureConfigSchema,
    menuConfig: MenuConfigSchema
})

// ========================================
// 验证函数
// ========================================

/**
 * 验证模块元数据（同步，抛出异常）
 * @throws ZodError 验证失败时抛出
 */
export function validateModuleMetadata(data: unknown): ModuleMetadata {
    return ModuleMetadataSchema.parse(data) as ModuleMetadata
}

/**
 * 安全验证模块元数据（同步，返回结果对象）
 * @returns 验证结果对象
 */
export function safeValidateModuleMetadata(data: unknown) {
    return ModuleMetadataSchema.safeParse(data)
}

/**
 * 获取格式化的验证错误信息
 */
export function getModuleMetadataErrors(data: unknown): string[] {
    const result = safeValidateModuleMetadata(data)

    if (result.success) {
        return []
    }

    return result.error.issues.map(err => {
        const path = err.path.length > 0 ? `${err.path.join('.')}: ` : ''
        return `${path}${err.message}`
    })
}

/**
 * 验证模块元数据（异步，支持复杂验证）
 */
export async function validateModuleMetadataAsync(
    data: unknown
): Promise<ModuleMetadata> {
    // 基础验证
    const result = ModuleMetadataSchema.safeParse(data)

    if (!result.success) {
        throw result.error
    }

    // 可扩展：添加异步验证逻辑
    // 例如：检查依赖的模块是否存在
    // for (const dep of result.data.dependsOn) {
    //   const exists = await checkModuleExists(dep)
    //   if (!exists) throw new Error(`依赖的模块${dep}不存在`)
    // }

    return result.data as ModuleMetadata
}

