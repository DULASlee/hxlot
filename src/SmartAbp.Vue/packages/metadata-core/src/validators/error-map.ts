/**
 * 自定义Zod错误映射
 * 统一处理中文错误消息
 */

import { z } from 'zod'

/**
 * 自定义错误映射（Entity上下文）
 */
export const entityErrorMap: z.ZodErrorMap = (issue, ctx) => {
    // 处理Required错误
    if (issue.code === z.ZodIssueCode.invalid_type) {
        if (issue.received === 'undefined') {
            const path = issue.path[issue.path.length - 1]
            
            const fieldMessages: Record<string, string> = {
                name: '实体名称不能为空',
                module: '模块名称不能为空',
            }
            
            if (typeof path === 'string' && path in fieldMessages) {
                return { message: fieldMessages[path] }
            }
            
            return { message: `${path}不能为空` }
        }
    }
    
    return { message: ctx.defaultError }
}

/**
 * 自定义错误映射（Module上下文）
 */
export const moduleErrorMap: z.ZodErrorMap = (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.invalid_type) {
        if (issue.received === 'undefined') {
            const path = issue.path[issue.path.length - 1]
            
            const fieldMessages: Record<string, string> = {
                name: '模块名称不能为空',
                version: '模块版本不能为空',
            }
            
            if (typeof path === 'string' && path in fieldMessages) {
                return { message: fieldMessages[path] }
            }
            
            return { message: `${path}不能为空` }
        }
    }
    
    return { message: ctx.defaultError }
}

/**
 * 自定义错误映射（Aspire上下文）
 */
export const aspireErrorMap: z.ZodErrorMap = (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.invalid_type) {
        if (issue.received === 'undefined') {
            const path = issue.path[issue.path.length - 1]
            
            const fieldMessages: Record<string, string> = {
                solutionName: '解决方案名称不能为空',
                rootNamespace: '根命名空间不能为空',
            }
            
            if (typeof path === 'string' && path in fieldMessages) {
                return { message: fieldMessages[path] }
            }
            
            return { message: `${path}不能为空` }
        }
    }
    
    return { message: ctx.defaultError }
}

/**
 * 通用错误映射（向后兼容）
 */
export const customErrorMap = entityErrorMap

/**
 * 格式化错误消息
 * 如果错误消息已经是完整的中文消息，则不添加路径前缀
 */
export function formatErrorMessage(path: string, message: string): string {
    // 检查是否已经是完整的中文消息（包含"不能为空"、"必须"等关键词）
    const isFullMessage = message.includes('不能为空') || 
                         message.includes('必须') || 
                         message.includes('不能重复') ||
                         message.includes('不能超过') ||
                         message.includes('至少')
    
    if (isFullMessage) {
        return message
    }
    
    // 否则添加路径前缀
    return path ? `${path}: ${message}` : message
}

