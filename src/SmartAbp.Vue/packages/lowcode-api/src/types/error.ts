/**
 * ABP框架错误响应类型定义
 * 
 * 用于消除http-client.ts中的as any使用
 */

/**
 * ABP验证错误项
 */
export interface AbpValidationError {
  message: string
  members: string[]
}

/**
 * ABP错误响应（通用）
 */
export interface AbpErrorResponse {
  error: {
    /** 错误码 */
    code?: string
    /** 错误消息 */
    message: string
    /** 错误详情 */
    details?: string
    /** 验证错误列表 */
    validationErrors?: AbpValidationError[]
    /** 其他数据 */
    data?: Record<string, unknown>
  }
}

/**
 * ABP错误数据（简化格式）
 * 
 * 某些情况下服务器直接返回error对象
 */
export interface AbpErrorData {
  /** 错误码 */
  code?: string
  /** 错误消息 */
  message?: string
  /** 错误详情 */
  details?: string
  /** 验证错误列表 */
  validationErrors?: AbpValidationError[]
  /** 其他数据 */
  [key: string]: unknown
}

/**
 * 类型守卫：判断是否为ABP错误响应
 */
export function isAbpErrorResponse(data: unknown): data is AbpErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as AbpErrorResponse).error === 'object' &&
    'message' in (data as AbpErrorResponse).error
  )
}

/**
 * 类型守卫：判断是否为ABP错误数据
 */
export function isAbpErrorData(data: unknown): data is AbpErrorData {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('message' in data || 'details' in data || 'validationErrors' in data)
  )
}

