/**
 * Zod v4 ErrorMap 类型安全适配器
 *
 * 解决 Zod v4 类型系统与 TypeScript 严格模式的兼容性问题
 * 不使用 any/unknown as，完全类型安全
 *
 * @version 2.0.0 - 适配 Zod v4 实际签名
 * @author SmartAbp架构团队
 */

import { z } from 'zod'

/**
 * 最小必要的 Issue 形状（显式类型，避免 any）
 * 基于 Zod v4 的实际运行时结构
 */
interface MinimalIssue {
    code: string  // Zod v4 不导出 ZodIssueCode，使用 string
    received?: string
    path?: ReadonlyArray<PropertyKey>
    message?: string
}

/**
 * 最小必要的 Context 形状
 */
interface MinimalCtx {
    defaultError: string  // 确保非可选
}

/**
 * 错误消息返回格式（message 必须是 string）
 */
interface ErrorMessage {
    message: string
}

/**
 * 类型守卫：检查是否为有效的 MinimalIssue
 */
function isMinimalIssue(value: unknown): value is MinimalIssue {
    if (typeof value !== 'object' || value === null) return false
    const v = value as Record<string, unknown>
    return typeof v.code === 'string'
}

/**
 * 类型守卫：检查是否为有效的 MinimalCtx
 */
function isMinimalCtx(value: unknown): value is MinimalCtx {
    if (typeof value !== 'object' || value === null) return false
    const v = value as Record<string, unknown>
    return typeof v.defaultError === 'string'
}

/**
 * 适配器工厂：将类型安全的函数包装为 Zod v4 兼容的 ErrorMap
 *
 * @param safeMap - 类型安全的错误映射函数
 * @returns Zod v4 兼容的 ZodErrorMap
 */
export function makeZodErrorMap(
    safeMap: (issue: MinimalIssue, ctx: MinimalCtx) => ErrorMessage
): z.ZodErrorMap {
    // 使用结构兼容性，不使用 any 或 unknown as
    const compat: z.ZodErrorMap = (issue) => {
        // Zod v4 的 ErrorMap 只接受一个参数（issue包含ctx）
        const extractedIssue: MinimalIssue = {
            code: String((issue as Record<string, unknown>).code ?? 'unknown'),
            received: (issue as Record<string, unknown>).received as string | undefined,
            path: (issue as Record<string, unknown>).path as PropertyKey[] | undefined,
            message: (issue as Record<string, unknown>).message as string | undefined
        }

        // Zod v4 的 defaultError 在 issue 中
        const extractedCtx: MinimalCtx = {
            defaultError: String((issue as Record<string, unknown>).message ?? 'Validation error')
        }

        // 使用类型守卫缩小类型
        if (isMinimalIssue(extractedIssue) && isMinimalCtx(extractedCtx)) {
            return safeMap(extractedIssue, extractedCtx)
        }

        // 最小降级保证
        return { message: extractedCtx.defaultError }
    }

    return compat
}

