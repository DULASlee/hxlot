/**
 * 统一API调用Composable
 * 整合错误处理和Loading管理，提供一站式API调用解决方案
 */

import type { ApiError } from '@smartabp/lowcode-api'
import { ref, type Ref } from 'vue'
import { useApiError, type ApiErrorDisplayOptions } from './useApiError'
import { useApiLoading, type LoadingOptions } from './useApiLoading'

/**
 * API调用选项
 */
export interface ApiCallOptions {
  /** Loading选项 */
  loading?: LoadingOptions
  /** 错误显示选项 */
  error?: ApiErrorDisplayOptions
  /** 是否自动处理错误 */
  autoHandleError?: boolean
  /** 是否显示Loading */
  showLoading?: boolean
  /** API调用描述（用于调试） */
  description?: string
  /** 成功回调 */
  onSuccess?: (data: any) => void
  /** 错误回调 */
  onError?: (error: ApiError) => void
  /** 完成回调（无论成功失败） */
  onFinally?: () => void
}

/**
 * 默认API调用选项
 */
const DEFAULT_API_CALL_OPTIONS: ApiCallOptions = {
  autoHandleError: true,
  showLoading: false,
  loading: {
    showGlobal: false,
    text: '处理中...'
  },
  error: {
    showMessage: true,
    showNotification: false
  }
}

/**
 * API调用状态
 */
export interface ApiCallState<T> {
  /** 是否正在加载 */
  isLoading: Ref<boolean>
  /** 请求数据 */
  data: Ref<T | null>
  /** 错误信息 */
  error: Ref<ApiError | null>
  /** 是否成功 */
  isSuccess: Ref<boolean>
  /** 是否失败 */
  isError: Ref<boolean>
}

/**
 * 统一API调用Composable
 * 
 * @example
 * ```typescript
 * import { useApiCall } from '@smartabp/lowcode-api'
 * 
 * const { execute, isLoading, data, error } = useApiCall()
 * 
 * const result = await execute(
 *   () => codeGeneratorApi.generateModule(config),
 *   {
 *     showLoading: true,
 *     loading: { text: '正在生成代码...', showGlobal: true },
 *     error: { customMessage: '代码生成失败，请检查配置' },
 *     onSuccess: (data) => console.log('生成成功', data)
 *   }
 * )
 * ```
 */
export function useApiCall<T = any>() {
  const { handleApiError } = useApiError()
  const { withLoading, isLoading: globalIsLoading } = useApiLoading()

  // API调用状态
  const isLoading = ref(false)
  const data = ref<T | null>(null)
  const error = ref<ApiError | null>(null)
  const isSuccess = ref(false)
  const isError = ref(false)

  /**
   * 重置状态
   */
  const resetState = () => {
    isLoading.value = false
    data.value = null
    error.value = null
    isSuccess.value = false
    isError.value = false
  }

  /**
   * 执行API调用
   * @param apiFn API调用函数
   * @param options 调用选项
   * @returns API调用结果
   */
  const execute = async (
    apiFn: () => Promise<T>,
    options: ApiCallOptions = {}
  ): Promise<T | null> => {
    const opts = { ...DEFAULT_API_CALL_OPTIONS, ...options }

    // 重置状态
    resetState()
    isLoading.value = true

    try {
      // 执行API调用（带Loading）
      let result: T

      if (opts.showLoading) {
        result = await withLoading(
          apiFn,
          opts.loading,
          opts.description || 'API Call'
        )
      } else {
        result = await apiFn()
      }

      // 成功状态
      data.value = result
      isSuccess.value = true
      isError.value = false

      // 成功回调
      if (opts.onSuccess) {
        opts.onSuccess(result)
      }

      return result

    } catch (err) {
      // 失败状态
      const apiError = err as ApiError
      error.value = apiError
      isSuccess.value = false
      isError.value = true

      // 自动错误处理
      if (opts.autoHandleError) {
        await handleApiError(apiError, opts.error)
      }

      // 错误回调
      if (opts.onError) {
        opts.onError(apiError)
      }

      return null

    } finally {
      isLoading.value = false

      // 完成回调
      if (opts.onFinally) {
        opts.onFinally()
      }
    }
  }

  /**
   * 执行多个API调用（并行）
   * @param apiFns API调用函数数组
   * @param options 调用选项
   * @returns 所有API调用结果
   */
  const executeAll = async <R = any>(
    apiFns: Array<() => Promise<R>>,
    options: ApiCallOptions = {}
  ): Promise<Array<R | null>> => {
    const results = await Promise.allSettled(
      apiFns.map(fn => execute(fn as any, options) as Promise<R | null>)
    )

    // 处理每个请求的结果，失败时返回null作为降级值
    return results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        // 记录错误但不阻塞其他请求
        console.warn('API调用失败:', result.reason)
        return null
      }
    })
  }

  /**
   * 执行多个API调用（串行）
   * @param apiFns API调用函数数组
   * @param options 调用选项
   * @returns 所有API调用结果
   */
  const executeSequential = async <R = any>(
    apiFns: Array<() => Promise<R>>,
    options: ApiCallOptions = {}
  ): Promise<Array<R | null>> => {
    const results: Array<R | null> = []

    for (const fn of apiFns) {
      const result = await execute(fn as any, options) as R | null
      results.push(result)

      // 如果有错误且需要停止，则中断执行
      if (result === null && options.error?.showMessage) {
        break
      }
    }

    return results
  }

  /**
   * 执行多个API调用（并行，使用Promise.allSettled）
   * 即使部分请求失败，也不会阻塞其他请求，适合非关键数据加载
   * @param apiFns API调用函数数组
   * @param options 调用选项
   * @returns 所有API调用结果和状态信息
   */
  const executeAllSettled = async <R = any>(
    apiFns: Array<() => Promise<R>>,
    options: ApiCallOptions = {}
  ): Promise<Array<{ data: R | null; status: 'fulfilled' | 'rejected'; error?: any }>> => {
    const results = await Promise.allSettled(
      apiFns.map(fn => execute(fn as any, options) as Promise<R | null>)
    )

    // 返回详细的结果信息，包括状态和错误信息
    return results.map(result => {
      if (result.status === 'fulfilled') {
        return {
          data: result.value,
          status: 'fulfilled'
        }
      } else {
        // 记录错误但不阻塞其他请求
        console.warn('API调用失败:', result.reason)
        return {
          data: null,
          status: 'rejected',
          error: result.reason
        }
      }
    })
  }

  return {
    // 状态
    isLoading,
    data,
    error,
    isSuccess,
    isError,
    globalIsLoading,

    // 方法
    execute,
    executeAll,
    executeAllSettled,
    executeSequential,
    resetState
  }
}

/**
 * 创建预配置的API调用函数
 * 
 * @example
 * ```typescript
 * import { createApiCall } from '@smartabp/lowcode-api'
 * 
 * // 创建带默认Loading的API调用
 * const callWithLoading = createApiCall({
 *   showLoading: true,
 *   loading: { text: '处理中...', showGlobal: true }
 * })
 * 
 * // 使用
 * const result = await callWithLoading(
 *   () => codeGeneratorApi.generateModule(config)
 * )
 * ```
 */
export function createApiCall(defaultOptions: ApiCallOptions = {}) {
  const { execute } = useApiCall()

  return async <T>(
    apiFn: () => Promise<T>,
    options?: ApiCallOptions
  ): Promise<T | null> => {
    return execute(apiFn, { ...defaultOptions, ...options })
  }
}

/**
 * 为代码生成器API创建专用调用包装器
 * 
 * @example
 * ```typescript
 * import { createCodeGenApiCall } from '@smartabp/lowcode-api'
 * 
 * const callCodeGenApi = createCodeGenApiCall()
 * 
 * const result = await callCodeGenApi(
 *   () => codeGeneratorApi.generateModule(config),
 *   { customMessage: '代码生成失败' }
 * )
 * ```
 */
export function createCodeGenApiCall() {
  return createApiCall({
    showLoading: true,
    loading: {
      text: '正在生成代码...',
      showGlobal: true,
      fullscreen: true,
      lock: true
    },
    error: {
      showMessage: true,
      showNotification: true,
      messageType: 'error'
    },
    description: 'Code Generation'
  })
}

