/**
 * API错误处理Composable
 * 整合lowcode-shared的全局错误处理器和Element Plus消息提示
 */

import { ElMessage, ElNotification } from 'element-plus';
import { getMessageFromErrorCode, getTitleFromErrorCode, mergeOptions } from '@smartabp/lowcode-shared';
import type { ApiError } from '../http-client.js';

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
 * import { useApiError } from '../http-client.js'
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
    const displayOptions = mergeOptions(DEFAULT_DISPLAY_OPTIONS, options)

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

    // BAD_REQUEST 特殊处理：显示验证错误
    if (apiError.code === 'BAD_REQUEST' && apiError.validationErrors && apiError.validationErrors.length > 0) {
      const firstError = apiError.validationErrors[0]
      return `参数验证失败：${firstError?.message || '未知错误'}`
    }

    // 使用统一的错误代码映射
    return getMessageFromErrorCode(apiError.code || '', undefined, apiError.message || '操作失败，请稍后重试')
  }

  /**
   * 获取错误标题
   */
  const getErrorTitle = (apiError: ApiError): string => {
    return getTitleFromErrorCode(apiError.code || '', undefined, '操作失败')
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
  const clearErrorHistory = (olderThan?: Date) => {
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

