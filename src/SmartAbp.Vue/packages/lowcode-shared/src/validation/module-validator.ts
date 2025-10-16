/**
 * 🔥 SmartAbp 统一模块元数据验证器
 *
 * 📦 从 @smartabp/metadata-core 迁移并适配 UnifiedModuleMetadata
 * 🎯 基于Zod实现类型安全验证
 *
 * @version 2.0.0
 * @migrated-from @smartabp/metadata-core/validators/module-validator
 * @adapted-for UnifiedModuleMetadata (40+ fields)
 */

import { z } from 'zod'
import type { UnifiedModuleMetadata } from '../types/unified-schema'
import { formatErrorMessage } from './error-map'

// ========================================
// Zod Schema定义 - 适配UnifiedModuleMetadata
// ========================================

/**
 * 数据库配置Schema（简化版）
 */
const DatabaseConfigSchema = z.object({
    provider: z.enum(['SqlServer', 'PostgreSQL', 'MySQL', 'Oracle', 'SQLite']).default('SqlServer'),
    connectionString: z.string().optional(),
    schemaName: z.string().default('dbo')
}).passthrough().default(() => ({
    provider: 'SqlServer' as const,
    schemaName: 'dbo'
}))

/**
 * 前端配置Schema（简化版）
 */
const FrontendConfigSchema = z.object({
    framework: z.enum(['Vue3', 'React', 'Angular']).default('Vue3'),
    uiLibrary: z.enum(['ElementPlus', 'AntDesign', 'Vuetify']).default('ElementPlus'),
    routePrefix: z.string().optional()
}).passthrough().default(() => ({
    framework: 'Vue3' as const,
    uiLibrary: 'ElementPlus' as const
}))

/**
 * 特性管理配置Schema（简化版）
 */
const FeatureManagementSchema = z.object({
    enableFeatures: z.boolean().default(false),
    features: z.array(z.string()).default([])
}).passthrough().default(() => ({
    enableFeatures: false,
    features: []
}))

/**
 * 菜单配置Schema（递归）
 */
const MenuConfigSchema: z.ZodType<any, any, any> = z.lazy(() => z.object({
    title: z.string().min(1, '菜单标题不能为空'),
    icon: z.string().optional(),
    path: z.string().optional(),
    order: z.number().int().nonnegative().default(0),
    children: z.array(MenuConfigSchema).optional()
}).passthrough())

/**
 * 权限配置Schema（简化版）
 */
const PermissionConfigSchema = z.object({
    enablePermissions: z.boolean().default(true),
    permissions: z.array(z.string()).default([])
}).passthrough().default(() => ({
    enablePermissions: true,
    permissions: []
}))

/**
 * 统一模块元数据Schema（UnifiedModuleMetadata）
 *
 * ✅ 验证核心必填字段
 * ✅ 使用passthrough()允许额外字段（向后兼容）
 * ✅ 支持40+字段的完整UnifiedModuleMetadata
 */
export const UnifiedModuleMetadataSchema = z.object({
    // ────────────────────────────────────────────────────────
    // 核心标识（必填）
    // ────────────────────────────────────────────────────────
    id: z.string().min(1, '模块ID不能为空'),
    systemName: z.string().min(1, '系统名称不能为空'),
    name: z.string()
        .min(1, '模块名称不能为空')
        .max(128, '模块名称不能超过128个字符')
        .regex(/^[A-Z][a-zA-Z0-9]*$/, '模块名称必须是PascalCase格式（首字母大写）'),
    displayName: z.string().min(1, '显示名称不能为空'),
    description: z.string().default(''),
    version: z.string()
        .regex(/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/, '模块版本必须遵循语义化版本格式（如1.0.0）'),
    namespace: z.string().min(1, '命名空间不能为空'),

    // ────────────────────────────────────────────────────────
    // 架构配置
    // ────────────────────────────────────────────────────────
    architecturePattern: z.enum(['Crud', 'DDD', 'CQRS']).default('DDD'),
    author: z.string().default('SmartAbp Team'),

    // ────────────────────────────────────────────────────────
    // 数据库配置
    // ────────────────────────────────────────────────────────
    databaseInfo: DatabaseConfigSchema,

    // ────────────────────────────────────────────────────────
    // 前端配置
    // ────────────────────────────────────────────────────────
    frontend: FrontendConfigSchema,
    generateMobilePages: z.boolean().default(false),

    // ────────────────────────────────────────────────────────
    // 功能特性
    // ────────────────────────────────────────────────────────
    featureManagement: FeatureManagementSchema,

    // ────────────────────────────────────────────────────────
    // 业务数据
    // ────────────────────────────────────────────────────────
    entities: z.array(z.any()).default([]), // 使用any避免循环依赖
    menuConfig: z.array(MenuConfigSchema).default([]),
    permissionConfig: PermissionConfigSchema,
    dependencies: z.array(z.string()).default([]),

    // ────────────────────────────────────────────────────────
    // 元数据管理
    // ────────────────────────────────────────────────────────
    schemaVersion: z.string().default('1.0.0'),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date())
}).passthrough() // ✅ 允许额外字段（支持40+字段的完整结构）
    .superRefine((data, ctx) => {
        // ========================================
        // 高级验证：跨字段验证
        // ========================================

        // 1. 检查模块名重复（暂时跳过，需要全局检查）

        // 2. 检查依赖循环
        if (data.dependencies.includes(data.name)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `模块不能依赖自身: ${data.name}`,
                path: ['dependencies']
            })
        }

        // 3. 检查菜单配置有效性（简化版）
        if (data.menuConfig && data.menuConfig.length > 0) {
            const menuTitles = data.menuConfig.map((m: any) => m.title)
            const duplicateMenus = menuTitles.filter((title: string, index: number) =>
                menuTitles.indexOf(title) !== index
            )
            if (duplicateMenus.length > 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `菜单标题不能重复: ${duplicateMenus[0]}`,
                    path: ['menuConfig']
                })
            }
        }
    })

// ========================================
// 验证函数
// ========================================

/**
 * 验证统一模块元数据（同步，抛出异常）
 * @throws ZodError 验证失败时抛出
 */
export function validateModuleMetadata(data: unknown): UnifiedModuleMetadata {
    return UnifiedModuleMetadataSchema.parse(data) as unknown as UnifiedModuleMetadata
}

/**
 * 安全验证统一模块元数据（同步，返回结果对象）
 * @returns 验证结果对象
 */
export function safeValidateModuleMetadata(data: unknown) {
    return UnifiedModuleMetadataSchema.safeParse(data)
}

/**
 * 获取格式化的验证错误信息
 */
export function getModuleMetadataErrors(data: unknown): string[] {
    const result = UnifiedModuleMetadataSchema.safeParse(data)

    if (result.success) {
        return []
    }

    return result.error.issues.map(err => {
        const path = err.path.length > 0 ? err.path.join('.') : ''
        return formatErrorMessage(path, err.message)
    })
}

/**
 * 验证统一模块元数据（异步，支持复杂验证）
 * @returns true表示验证通过，抛出异常表示验证失败
 */
export async function validateModuleMetadataAsync(
    data: unknown
): Promise<boolean> {
    // 基础验证
    const result = UnifiedModuleMetadataSchema.safeParse(data)

    if (!result.success) {
        throw result.error
    }

    // 可扩展：添加异步验证逻辑
    // 例如：检查依赖的模块是否存在
    // for (const dep of result.data.dependencies) {
    //   const exists = await checkModuleExists(dep)
    //   if (!exists) throw new Error(`依赖的模块${dep}不存在`)
    // }

    return true
}

// ========================================
// 向后兼容导出（metadata-core接口）
// ========================================

/**
 * @deprecated 请使用 validateModuleMetadata
 */
export { validateModuleMetadata as validateModule }

/**
 * @deprecated 请使用 safeValidateModuleMetadata
 */
export { safeValidateModuleMetadata as safeValidateModule }

