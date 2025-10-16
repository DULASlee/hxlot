/**
 * 🔥 SmartAbp 统一错误映射系统
 *
 * 📦 从 @smartabp/metadata-core 迁移
 * 🎯 统一处理中文错误消息
 *
 * ✅ 使用类型安全适配器，完全符合架构铁律（无 any、无 unknown as）
 *
 * @version 2.0.0
 * @migrated-from @smartabp/metadata-core/validators/error-map
 */

import { makeZodErrorMap } from './zod-error-map-compat'

/**
 * 自定义错误映射（Entity上下文）
 * 使用类型安全适配器，完全符合第八条铁律
 */
export const entityErrorMap = makeZodErrorMap((issue, ctx) => {
  // 处理Required错误 (Zod v4 使用字符串 'invalid_type')
  if (issue.code === 'invalid_type' && issue.received === 'undefined') {
    const last = issue.path?.[issue.path.length - 1]

    const fieldMessages: Record<string, string> = {
      name: '实体名称不能为空',
      module: '模块名称不能为空',
      displayName: '显示名称不能为空',
      tableName: '表名不能为空',
      namespace: '命名空间不能为空'
    }

    if (typeof last === 'string' && last in fieldMessages) {
      const msg = fieldMessages[last]
      // 确保 msg 是 string，避免 undefined
      return { message: msg !== undefined ? msg : `${last}不能为空` }
    }

    return { message: `${String(last ?? 'field')}不能为空` }
  }

  return { message: ctx.defaultError }
})

/**
 * 自定义错误映射（Module上下文）
 * 使用类型安全适配器，完全符合第八条铁律
 */
export const moduleErrorMap = makeZodErrorMap((issue, ctx) => {
  // 处理Required错误 (Zod v4 使用字符串 'invalid_type')
  if (issue.code === 'invalid_type' && issue.received === 'undefined') {
    const last = issue.path?.[issue.path.length - 1]

    const fieldMessages: Record<string, string> = {
      name: '模块名称不能为空',
      version: '模块版本不能为空',
      systemName: '系统名称不能为空',
      displayName: '显示名称不能为空',
      namespace: '命名空间不能为空'
    }

    if (typeof last === 'string' && last in fieldMessages) {
      const msg = fieldMessages[last]
      // 确保 msg 是 string，避免 undefined
      return { message: msg !== undefined ? msg : `${last}不能为空` }
    }

    return { message: `${String(last ?? 'field')}不能为空` }
  }

  return { message: ctx.defaultError }
})

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

