/**
 * API请求拦截器
 * 用途：统一处理API请求和响应，包括认证、错误处理
 * 符合铁律2：控件完整性（统一的错误处理和认证）
 */

import { useAuthStore } from '@/stores/authStore'
import { handleError, handleAuthError } from './errorHandler'

/**
 * 请求拦截器配置
 */
export interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: any
  header?: any
  timeout?: number
  showLoading?: boolean
  showError?: boolean
}

/**
 * 响应数据接口
 */
export interface ResponseData<T = any> {
  code: number
  data: T
  message?: string
}

/**
 * 创建API请求拦截器
 */
export function createApiInterceptor() {
  const authStore = useAuthStore()

  /**
   * 请求拦截器
   */
  function requestInterceptor(config: RequestConfig): RequestConfig {
    // 添加认证token
    if (authStore.token) {
      config.header = {
        ...config.header,
        'Authorization': `Bearer ${authStore.token}`
      }
    }

    // 添加默认header
    config.header = {
      'Content-Type': 'application/json',
      ...config.header
    }

    // 显示加载中
    if (config.showLoading !== false) {
      uni.showLoading({
        title: '加载中...',
        mask: true
      })
    }

    return config
  }

  /**
   * 响应拦截器
   */
  function responseInterceptor(response: any): any {
    // 隐藏加载中
    uni.hideLoading()

    const { statusCode, data } = response

    // 成功响应
    if (statusCode === 200) {
      return data
    }

    // 401 认证错误
    if (statusCode === 401) {
      handleAuthError()
      throw new Error('登录已过期')
    }

    // 其他HTTP错误
    const error = new Error(data?.error?.message || '请求失败')
    ;(error as any).response = response
    throw error
  }

  /**
   * 错误拦截器
   */
  function errorInterceptor(error: any, showError = true): any {
    // 隐藏加载中
    uni.hideLoading()

    // 处理错误
    if (showError) {
      handleError(error, false)
    }

    throw error
  }

  return {
    requestInterceptor,
    responseInterceptor,
    errorInterceptor
  }
}

/**
 * 封装uni.request
 */
export async function request<T = any>(config: RequestConfig): Promise<T> {
  const { requestInterceptor, responseInterceptor, errorInterceptor } = createApiInterceptor()

  try {
    // 请求拦截
    const interceptedConfig = requestInterceptor(config)

    // 发起请求
    const response = await new Promise<any>((resolve, reject) => {
      uni.request({
        url: interceptedConfig.url,
        method: interceptedConfig.method || 'GET',
        data: interceptedConfig.data,
        header: interceptedConfig.header,
        timeout: interceptedConfig.timeout || 60000,
        success: resolve,
        fail: reject
      })
    })

    // 响应拦截
    return responseInterceptor(response)
  } catch (error) {
    // 错误拦截
    return errorInterceptor(error, config.showError !== false)
  }
}

/**
 * GET请求
 */
export function get<T = any>(url: string, params?: any, config?: Partial<RequestConfig>): Promise<T> {
  const queryString = params ? '?' + Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`).join('&') : ''
  return request<T>({
    url: url + queryString,
    method: 'GET',
    ...config
  })
}

/**
 * POST请求
 */
export function post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({
    url,
    method: 'POST',
    data,
    ...config
  })
}

/**
 * PUT请求
 */
export function put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({
    url,
    method: 'PUT',
    data,
    ...config
  })
}

/**
 * DELETE请求
 */
export function del<T = any>(url: string, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({
    url,
    method: 'DELETE',
    ...config
  })
}

