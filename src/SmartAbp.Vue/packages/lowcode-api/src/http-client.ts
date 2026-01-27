/**
 * HTTP客户端 - lowcode-api独立封装
 * 符合packages黑盒原则，不依赖主应用
 */

import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
// import { setupMockInterceptor } from './__tests__/mocks/mock-server' // ⚠️ 已禁用Mock服务器
import type { AbpErrorData } from './types/error'

/**
 * HTTP响应统一格式
 */
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  code?: string
  timestamp?: number
}

/**
 * HTTP错误响应
 */
export interface ApiError {
  message: string
  code?: string
  details?: string
  validationErrors?: Array<{
    field: string
    message: string
  }>
}

/**
 * HTTP客户端配置
 */
export interface HttpClientConfig {
  baseURL?: string
  timeout?: number
  getToken?: () => string | null
  onUnauthorized?: () => void
  onError?: (error: ApiError) => void
}

/**
 * 自定义HTTP客户端类型 - 响应已自动解包data
 */
export interface HttpClient {
  get<T = any>(url: string, config?: any): Promise<T>
  post<T = any>(url: string, data?: any, config?: any): Promise<T>
  put<T = any>(url: string, data?: any, config?: any): Promise<T>
  delete<T = any>(url: string, config?: any): Promise<T>
  patch<T = any>(url: string, data?: any, config?: any): Promise<T>
  request<T = any>(config: any): Promise<T>
}

/**
 * 创建HTTP客户端实例
 */
export function createHttpClient(config?: HttpClientConfig): HttpClient {
  const {
    baseURL = ((import.meta as unknown as { env?: Record<string, string> }).env?.['VITE_API_BASE_URL']) || '',
    timeout = 30000, // 代码生成可能耗时较长，设置30秒超时
    getToken,
    onUnauthorized,
    onError
  } = config || {}

  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json'
    },
    // 🔥 修复：显式指定请求体转换，确保 Content-Length 正确计算
    transformRequest: [
      (data, headers) => {
        if (data && typeof data === 'object') {
          // 确保 Content-Type 正确设置
          if (headers) {
            headers['Content-Type'] = 'application/json'
          }
          return JSON.stringify(data)
        }
        return data
      }
    ]
  })

  // ✅ Mock服务器已彻底禁用，所有请求必须连接真实后端
  // setupMockInterceptor(instance) // 已移除，生产环境严禁使用Mock数据

  // 请求拦截器 - 添加认证token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (getToken) {
        const token = getToken()
        if (token) {
          config.headers = config.headers || {}
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    },
    (error: AxiosError) => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器 - 统一错误处理
  instance.interceptors.response.use(
    <T = unknown>(response: AxiosResponse<T>): T => {
      // 直接返回data，类型由调用方泛型决定
      return response.data
    },
    (error: AxiosError) => {
      const apiError: ApiError = {
        message: '请求失败',
        code: 'UNKNOWN_ERROR'
      }

      if (error.response) {
        // 服务器返回错误
        const { status, data } = error.response

        switch (status) {
          case 400: // Bad Request
            apiError.message = '请求参数错误'
            apiError.code = 'BAD_REQUEST'
            if (data && typeof data === 'object') {
              const errorData = data as AbpErrorData
              apiError.message = errorData.message || apiError.message
              const normalized: Array<{ field: string; message: string }> = []
              if (Array.isArray(errorData.validationErrors)) {
                for (const ve of errorData.validationErrors) {
                  const members = (ve as { members?: string[] }).members
                  const field = Array.isArray(members) && members.length > 0 ? members[0] : ''
                  normalized.push({ field: field || '', message: ve.message })
                }
              }
              apiError.validationErrors = normalized
            }
            break

          case 401: // Unauthorized
            apiError.message = '未授权，请先登录'
            apiError.code = 'UNAUTHORIZED'
            if (onUnauthorized) {
              onUnauthorized()
            }
            break

          case 403: // Forbidden
            apiError.message = '无权限访问'
            apiError.code = 'FORBIDDEN'
            break

          case 404: // Not Found
            apiError.message = '请求的资源不存在'
            apiError.code = 'NOT_FOUND'
            break

          case 500: // Internal Server Error
            apiError.message = '服务器内部错误'
            apiError.code = 'INTERNAL_ERROR'
            if (data && typeof data === 'object') {
              const errorData = data as AbpErrorData
              apiError.message = errorData.message || apiError.message
              apiError.details = errorData.details
            }
            break

          default:
            apiError.message = `请求失败 (${status})`
            apiError.code = `HTTP_${status}`
        }
      } else if (error.request) {
        // 请求已发送但没有收到响应
        apiError.message = '网络连接失败，请检查网络'
        apiError.code = 'NETWORK_ERROR'
      } else {
        // 请求配置错误
        apiError.message = error.message || '请求配置错误'
        apiError.code = 'REQUEST_ERROR'
      }

      // 调用错误回调
      if (onError) {
        onError(apiError)
      }

      return Promise.reject(apiError)
    }
  )

  return instance as HttpClient
}

/**
 * 默认HTTP客户端实例（用于简单场景）
 */
export const http = createHttpClient()

/**
 * 便捷方法：GET请求
 */
export async function get<T = any>(url: string, params?: any): Promise<T> {
  return http.get(url, { params })
}

/**
 * 便捷方法：POST请求
 */
export async function post<T = any>(url: string, data?: any): Promise<T> {
  return http.post(url, data)
}

/**
 * 便捷方法：PUT请求
 */
export async function put<T = any>(url: string, data?: any): Promise<T> {
  return http.put(url, data)
}

/**
 * 便捷方法：DELETE请求
 */
export async function del<T = any>(url: string, params?: any): Promise<T> {
  return http.delete(url, { params })
}

/**
 * 便捷方法：PATCH请求
 */
export async function patch<T = any>(url: string, data?: any): Promise<T> {
  return http.patch(url, data)
}

