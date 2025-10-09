/**
 * API错误处理Composable
 * 整合lowcode-shared的全局错误处理器和Element Plus消息提示
 */

import { ElMessage, ElNotification } from 'element-plus';
// import { getGlobalErrorHandler, type StandardError, type ErrorContext } from '@smartabp/lowcode-shared'
import type { ApiError } from '@smartabp/lowcode-api';

// 临时本地类型定义（待lowcode-shared完善后移除）
type StandardError = Error & { code?: string; statusCode?: number }
type ErrorContext = { operation?: string; params?: any; metadata?: any }

/** 全局错误处理器接口 */
interface GlobalErrorHandler {
  handleError?: (error: Error, context: ErrorContext) => Promise<StandardError>
  registerRecoveryHandler?: (handler: unknown) => void
  getErrorStats?: () => { total: number; byLevel: Record<string, number>; byCategory: Record<string, number> }
  clearErrors?: (olderThan?: Date) => void
}

const getGlobalErrorHandler = (): GlobalErrorHandler | undefined => undefined

/**
 * API错误显示选项
 */
export interface ApiErrorDisplayOptions {
  /** 是否显示消息提示 */
  showMessage?: boolean
  /** 是否显示通知 */
  showNotification?: boolean
  /** 消息类型 */
  messageType?: 'error' | 'warning' | 'info'
  /** 消息持续时间 */
  duration?: number
  /** 是否可关闭 */
  closable?: boolean
  /** 自定义消息内容 */
  customMessage?: string
}

/**
 * 默认显示选项
 */
const DEFAULT_DISPLAY_OPTIONS: ApiErrorDisplayOptions = {
  showMessage: true,
  showNotification: false,
  messageType: 'error',
  duration: 3000,
  closable: true
}

/**
 * API错误处理Composable
 * 
 * @example
 * ```typescript
 * import { useApiError } from '@smartabp/lowcode-api'
 * 
 * const { handleApiError, registerCustomHandler } = useApiError()
 * 
 * try {
 *   await codeGeneratorApi.generateModule(config)
 * } catch (error) {
 *   await handleApiError(error as ApiError, {
 *     showMessage: true,
 *     customMessage: '代码生成失败'
 *   })
 * }
 * ```
 */
export function useApiError() {
  const errorHandler = getGlobalErrorHandler()

  /**
   * 处理API错误
   * @param apiError API错误对象
   * @param options 显示选项
   * @param context 额外的错误上下文
   */
  const handleApiError = async (
    apiError: ApiError,
    options: ApiErrorDisplayOptions = {},
    context: Partial<ErrorContext> = {}
  ): Promise<StandardError> => {
    const displayOptions = { ...DEFAULT_DISPLAY_OPTIONS, ...options }

    // 转换为标准错误
    const error = new Error(apiError.message)
    Object.assign(error, { code: apiError.code, details: apiError.details })

    // 添加API错误专属上下文
    const fullContext: Partial<ErrorContext> = {
      ...context,
      operation: 'api_call',
      metadata: {
        ...context.metadata,
        errorCode: apiError.code,
        validationErrors: apiError.validationErrors
      }
    }

    // 使用全局错误处理器处理（如果存在）
    let standardError = error as StandardError
    if (errorHandler?.handleError) {
      standardError = await errorHandler.handleError(error, fullContext)
    }

    // 显示用户友好的错误提示
    if (displayOptions.showMessage) {
      showErrorMessage(apiError, displayOptions)
    }

    if (displayOptions.showNotification) {
      showErrorNotification(apiError, displayOptions)
    }

    return standardError
  }

  /**
   * 显示错误消息
   */
  const showErrorMessage = (apiError: ApiError, options: ApiErrorDisplayOptions) => {
    const message = options.customMessage || getUserFriendlyMessage(apiError)

    ElMessage({
      message,
      type: options.messageType || 'error',
      duration: options.duration || 3000,
      showClose: options.closable !== false
    })
  }

  /**
   * 显示错误通知
   */
  const showErrorNotification = (apiError: ApiError, options: ApiErrorDisplayOptions) => {
    const title = getErrorTitle(apiError)
    const message = options.customMessage || getUserFriendlyMessage(apiError)

    ElNotification({
      title,
      message,
      type: options.messageType || 'error',
      duration: options.duration || 5000,
      position: 'top-right'
    })
  }

  /**
   * 获取用户友好的错误消息
   */
  const getUserFriendlyMessage = (apiError: ApiError): string => {
    // 优先使用自定义消息
    if (apiError.message && apiError.message !== '请求失败') {
      return apiError.message
    }

    // 根据错误代码返回友好消息
    switch (apiError.code) {
      case 'UNAUTHORIZED':
        return '您的登录已过期，请重新登录'
      case 'FORBIDDEN':
        return '您没有权限执行此操作'
      case 'NOT_FOUND':
        return '请求的资源不存在'
      case 'BAD_REQUEST':
        if (apiError.validationErrors && apiError.validationErrors.length > 0) {
          const firstError = apiError.validationErrors[0]
          return `参数验证失败：${firstError?.message || '未知错误'}`
        }
        return '请求参数错误，请检查输入'
      case 'INTERNAL_ERROR':
        return '服务器内部错误，请稍后重试'
      case 'NETWORK_ERROR':
        return '网络连接失败，请检查网络'
      case 'TIMEOUT':
        return '请求超时，请稍后重试'
      default:
        return apiError.message || '操作失败，请稍后重试'
    }
  }

  /**
   * 获取错误标题
   */
  const getErrorTitle = (apiError: ApiError): string => {
    switch (apiError.code) {
      case 'UNAUTHORIZED':
        return '未授权'
      case 'FORBIDDEN':
        return '权限不足'
      case 'NOT_FOUND':
        return '资源不存在'
      case 'BAD_REQUEST':
        return '请求错误'
      case 'INTERNAL_ERROR':
        return '服务器错误'
      case 'NETWORK_ERROR':
        return '网络错误'
      default:
        return '操作失败'
    }
  }

  /**
   * 注册自定义错误处理器
   * @param handler 错误处理函数
   */
  const registerCustomHandler = (
    handler: (apiError: ApiError, context?: Partial<ErrorContext>) => Promise<void> | void
  ) => {
    if (!errorHandler?.registerRecoveryHandler) {
      console.warn('全局错误处理器未初始化，自定义处理器注册失败')
      return
    }
    return errorHandler.registerRecoveryHandler({
      name: 'custom-api-handler',
      priority: 10,
      canHandle: (error: any) => error.category === 'network',
      recover: async (error: any) => {
        try {
          const apiError: ApiError = {
            message: error.message,
            code: error.code
          }
          await handler(apiError, error.context)
          return true
        } catch {
          return false
        }
      }
    })
  }

  /**
   * 获取错误统计
   */
  const getErrorStats = () => {
    if (!errorHandler?.getErrorStats) {
      return { total: 0, byLevel: {}, byCategory: {} }
    }
    return errorHandler.getErrorStats()
  }

  /**
   * 清理错误历史
   */
  const clearErrorHistory = (olderThan?: number) => {
    if (errorHandler?.clearErrors) {
      errorHandler.clearErrors(olderThan)
    }
  }

  return {
    handleApiError,
    showErrorMessage,
    showErrorNotification,
    getUserFriendlyMessage,
    registerCustomHandler,
    getErrorStats,
    clearErrorHistory
  }
}

