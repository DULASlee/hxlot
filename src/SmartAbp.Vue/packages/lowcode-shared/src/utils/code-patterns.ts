/**
 * 代码模式工具 - 消除常见代码重复
 * 提供可复用的代码模式和工具函数
 */

import type { Ref } from 'vue'
import { ref } from 'vue'

/**
 * 错误代码映射配置
 */
export interface ErrorCodeMapping {
  code: string
  title: string
  message: string
}

/**
 * 创建错误代码映射表
 */
export function createErrorCodeMap(mappings: ErrorCodeMapping[]): Map<string, Omit<ErrorCodeMapping, 'code'>> {
  const map = new Map<string, Omit<ErrorCodeMapping, 'code'>>()
  mappings.forEach(({ code, title, message }) => {
    map.set(code, { title, message })
  })
  return map
}

/**
 * 默认错误代码映射
 */
export const DEFAULT_ERROR_CODE_MAP = createErrorCodeMap([
  { code: 'UNAUTHORIZED', title: '未授权', message: '您的登录已过期，请重新登录' },
  { code: 'FORBIDDEN', title: '权限不足', message: '您没有权限执行此操作' },
  { code: 'NOT_FOUND', title: '资源不存在', message: '请求的资源不存在' },
  { code: 'BAD_REQUEST', title: '请求错误', message: '请求参数错误，请检查输入' },
  { code: 'INTERNAL_ERROR', title: '服务器错误', message: '服务器内部错误，请稍后重试' },
  { code: 'NETWORK_ERROR', title: '网络错误', message: '网络连接失败，请检查网络' },
  { code: 'TIMEOUT', title: '请求超时', message: '请求超时，请稍后重试' }
])

/**
 * 从错误代码获取友好消息
 */
export function getMessageFromErrorCode(
  code: string,
  customMap?: Map<string, Omit<ErrorCodeMapping, 'code'>>,
  defaultMessage = '操作失败，请稍后重试'
): string {
  const map = customMap || DEFAULT_ERROR_CODE_MAP
  return map.get(code)?.message || defaultMessage
}

/**
 * 从错误代码获取标题
 */
export function getTitleFromErrorCode(
  code: string,
  customMap?: Map<string, Omit<ErrorCodeMapping, 'code'>>,
  defaultTitle = '操作失败'
): string {
  const map = customMap || DEFAULT_ERROR_CODE_MAP
  return map.get(code)?.title || defaultTitle
}

/**
 * 创建状态管理对象
 */
export interface StateRefs<T> {
  isLoading: Ref<boolean>
  data: Ref<T | null>
  error: Ref<Error | null>
  isSuccess: Ref<boolean>
  isError: Ref<boolean>
}

/**
 * 创建标准的状态 refs
 */
export function createStateRefs<T>(): StateRefs<T> {
  return {
    isLoading: ref(false),
    data: ref(null) as Ref<T | null>,
    error: ref<Error | null>(null),
    isSuccess: ref(false),
    isError: ref(false)
  }
}

/**
 * 重置状态 refs
 */
export function resetStateRefs<T>(state: StateRefs<T>): void {
  state.isLoading.value = false
  state.data.value = null
  state.error.value = null
  state.isSuccess.value = false
  state.isError.value = false
}

/**
 * 更新成功状态
 */
export function setSuccessState<T>(state: StateRefs<T>, data: T): void {
  state.data.value = data
  state.isSuccess.value = true
  state.isError.value = false
  state.isLoading.value = false
}

/**
 * 更新失败状态
 */
export function setErrorState<T>(state: StateRefs<T>, error: Error): void {
  state.error.value = error
  state.isSuccess.value = false
  state.isError.value = true
  state.isLoading.value = false
}

/**
 * 异步操作执行器配置
 */
export interface AsyncExecutorOptions<T> {
  onBefore?: () => void | Promise<void>
  onSuccess?: (data: T) => void | Promise<void>
  onError?: (error: Error) => void | Promise<void>
  onFinally?: () => void | Promise<void>
  shouldCatch?: boolean
}

/**
 * 标准的异步操作执行器
 * 消除 try-catch-finally 重复模式
 */
export async function executeAsync<T>(
  fn: () => Promise<T>,
  state: StateRefs<T>,
  options: AsyncExecutorOptions<T> = {}
): Promise<T | null> {
  const {
    onBefore,
    onSuccess,
    onError,
    onFinally,
    shouldCatch = true
  } = options

  resetStateRefs(state)
  state.isLoading.value = true

  try {
    // 执行前回调
    if (onBefore) {
      await onBefore()
    }

    // 执行主逻辑
    const result = await fn()

    // 更新成功状态
    setSuccessState(state, result)

    // 成功回调
    if (onSuccess) {
      await onSuccess(result)
    }

    return result
  } catch (error) {
    const err = error as Error

    // 更新失败状态
    setErrorState(state, err)

    // 错误回调
    if (onError) {
      await onError(err)
    }

    // 如果不捕获错误，则抛出
    if (!shouldCatch) {
      throw error
    }

    return null
  } finally {
    state.isLoading.value = false

    // 完成回调
    if (onFinally) {
      await onFinally()
    }
  }
}

/**
 * 并行执行多个异步操作
 */
export async function executeParallel<T>(
  fns: Array<() => Promise<T>>,
  options: { continueOnError?: boolean } = {}
): Promise<Array<T | null>> {
  const results = await Promise.allSettled(fns.map(fn => fn()))

  return results.map(result => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      if (!options.continueOnError) {
        console.warn('并行操作失败:', result.reason)
      }
      return null
    }
  })
}

/**
 * 串行执行多个异步操作
 */
export async function executeSequential<T>(
  fns: Array<() => Promise<T>>,
  options: { stopOnError?: boolean } = {}
): Promise<Array<T | null>> {
  const results: Array<T | null> = []

  for (const fn of fns) {
    try {
      const result = await fn()
      results.push(result)
    } catch (error) {
      console.warn('串行操作失败:', error)
      results.push(null)

      if (options.stopOnError) {
        break
      }
    }
  }

  return results
}

/**
 * 创建带重试的执行器
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    retryDelay?: number
    shouldRetry?: (error: Error, attempt: number) => boolean
  } = {}
): Promise<T> {
  const { maxRetries = 3, retryDelay = 1000, shouldRetry = () => true } = options

  let lastError: Error | null = null
  let attempt = 0

  while (attempt < maxRetries) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      attempt++

      if (attempt < maxRetries && shouldRetry(lastError, attempt)) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
      } else {
        break
      }
    }
  }

  throw lastError || new Error('执行失败')
}

/**
 * 条件选项合并
 * 消除 { ...DEFAULT_OPTIONS, ...options } 重复模式
 */
export function mergeOptions<T extends Record<string, any>>(
  defaults: T,
  ...overrides: Array<Partial<T> | undefined>
): T {
  return Object.assign({}, defaults, ...overrides.filter(Boolean))
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

