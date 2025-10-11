/**
 * 模块元数据验证器
 * 基于Zod实现类型安全验证
 */

import { z } from 'zod'
import type { ModuleMetadata } from '../types/index.js'
import { formatErrorMessage, moduleErrorMap } from './error-map'

// ========================================
// Zod Schema定义
// ========================================

/**
 * 路由元数据Schema
 * 注意：嵌套路由的子路由path可以是相对路径（如'books'），不强制以'/'开头
 */
const RouteMetadataSchema: z.ZodType<any, any, any> = z.lazy(() => z.object({
    path: z.string().min(1, '路由路径不能为空'),
    name: z.string()
        .min(1, '路由名称不能为空')
        .regex(/^[A-Z][a-zA-Z0-9_]*$/, '路由名称必须是PascalCase格式（首字母大写，可包含下划线）'),
    component: z.string().optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
    children: z.array(RouteMetadataSchema).optional()
}))

/**
 * Store元数据Schema
 */
const StoreMetadataSchema = z.object({
    name: z.string()
        .min(1, 'Store名称不能为空')
        .regex(/^[a-z][a-zA-Z0-9]*$/, 'Store名称必须是camelCase格式（首字母小写）'),
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
        .regex(/^[A-Z][a-zA-Z0-9]*$/, '模块名称必须是PascalCase格式（首字母大写）'),
    displayName: z.string().optional(),
    version: z.string()
        .regex(/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/, '模块版本必须遵循语义化版本格式（如1.0.0）'),
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
}).superRefine((data, ctx) => {
    // ========================================
    // 高级验证：跨字段验证
    // ========================================

    // 1. 检查顶层路由path必须以/开头（嵌套路由可以是相对路径）
    data.routes.forEach((route, index) => {
        if (!route.path.startsWith('/')) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: '顶层路由路径必须以/开头',
                path: ['routes', index, 'path']
            })
        }
    })

    // 2. 检查路由名称重复
    function collectRouteNames(routes: any[], names: string[] = []): string[] {
        routes.forEach(route => {
            names.push(route.name)
            if (route.children) {
                collectRouteNames(route.children, names)
            }
        })
        return names
    }

    const routeNames = collectRouteNames(data.routes)
    const duplicateRoutes = routeNames.filter((name, index) =>
        routeNames.indexOf(name) !== index
    )
    if (duplicateRoutes.length > 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `路由名称不能重复: ${duplicateRoutes[0]}`,
            path: ['routes']
        })
    }

    // 3. 检查顶层路由路径重复（嵌套路由的相对路径在不同父路由下可以相同）
    const topLevelPaths = data.routes.map(r => r.path)
    const duplicateTopPaths = topLevelPaths.filter((path, index) =>
        topLevelPaths.indexOf(path) !== index
    )
    if (duplicateTopPaths.length > 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `路由路径不能重复: ${duplicateTopPaths[0]}`,
            path: ['routes']
        })
    }
    // 注意：仅检查顶层路由路径重复。嵌套路由的相对路径（如'detail'）在不同父路由下是合法的

    // 4. 检查Store名称重复
    const storeNames = data.stores.map(s => s.name)
    const duplicateStores = storeNames.filter((name, index) =>
        storeNames.indexOf(name) !== index
    )
    if (duplicateStores.length > 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Store名称不能重复: ${duplicateStores[0]}`,
            path: ['stores']
        })
    }
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
    const result = ModuleMetadataSchema.safeParse(data, { errorMap: moduleErrorMap })

    if (result.success) {
        return []
    }

    return result.error.issues.map(err => {
        const path = err.path.length > 0 ? err.path.join('.') : ''
        return formatErrorMessage(path, err.message)
    })
}

/**
 * 验证模块元数据（异步，支持复杂验证）
 * @returns true表示验证通过，抛出异常表示验证失败
 */
export async function validateModuleMetadataAsync(
    data: unknown
): Promise<boolean> {
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

    return true
}

