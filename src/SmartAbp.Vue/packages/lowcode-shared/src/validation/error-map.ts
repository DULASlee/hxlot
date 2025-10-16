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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// D4优化：统一错误映射接口
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 错误映射上下文类型
 */
export type ErrorMapContext = 'entity' | 'module' | 'custom'

/**
 * 错误映射配置接口
 */
export interface ErrorMapConfig {
    /** 上下文类型 */
    context: ErrorMapContext
    /** 自定义字段消息映射（可选） */
    customMessages?: Record<string, string>
}

/**
 * 统一的错误映射集合（D4优化）
 */
export const ErrorMaps = {
    /** 实体上下文错误映射 */
    entity: entityErrorMap,
    
    /** 模块上下文错误映射 */
    module: moduleErrorMap,
    
    /** 自定义/通用错误映射 */
    custom: customErrorMap,
    
    /**
     * 根据上下文获取错误映射（D4统一接口）
     * @param context - 上下文类型
     * @returns 对应的错误映射函数
     */
    getForContext: (context: ErrorMapContext) => {
        switch (context) {
            case 'entity':
                return entityErrorMap
            case 'module':
                return moduleErrorMap
            case 'custom':
            default:
                return customErrorMap
        }
    },
    
    /**
     * 创建带配置的错误映射（D4扩展接口）
     * @param config - 错误映射配置
     * @returns 配置后的错误映射函数
     */
    create: (config: ErrorMapConfig) => {
        // 当前版本：简单返回对应上下文的错误映射
        // 未来可扩展：支持 customMessages 覆盖默认消息
        return ErrorMaps.getForContext(config.context)
    }
}

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

