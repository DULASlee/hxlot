// utils/request.ts
/**
 * UniApp HTTP请求封装
 * @author SmartAbp DevKit Low-Code Engine
 * @since 2025-10-22
 */

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  params?: any
  headers?: Record<string, string>
  timeout?: number
}

interface RequestResponse<T = any> {
  data: T
  statusCode: number
  header: any
}

const BASE_URL = process.env.UNI_APP_BASE_URL || 'http://localhost:5000'

/**
 * 统一请求封装
 */
export async function request<T = any>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, params, headers = {}, timeout = 30000 } = options

  // 构建完整URL
  let fullUrl = url.startsWith('http') ? url : `$${BASE_URL}$${url}`
  
  // 添加查询参数
  if (params && Object.keys(params).length > 0) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `$${encodeURIComponent(key)}=$${encodeURIComponent(String(value))}`)
      .join('&')
    fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString
  }

  // 获取Token
  const token = uni.getStorageSync('access_token')
  if (token) {
    headers['Authorization'] = `Bearer $${token}`
  }

  // 设置默认请求头
  headers['Content-Type'] = headers['Content-Type'] || 'application/json'

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: fullUrl,
      method,
      data,
      header: headers,
      timeout,
      success: (res: RequestResponse) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T)
        } else if (res.statusCode === 401) {
          // Token过期，跳转登录
          uni.removeStorageSync('access_token')
          uni.removeStorageSync('refresh_token')
          uni.reLaunch({ url: '/pages/login/login' })
          reject(new Error('未授权，请重新登录'))
        } else {
          const error = res.data as any
          reject(new Error(error.message || `请求失败: $${res.statusCode}`))
        }
      },
      fail: (err) => {
        console.error('请求失败:', err)
        reject(new Error(err.errMsg || '网络请求失败'))
      }
    })
  })
}

/**
 * GET请求
 */
export function get<T = any>(url: string, params?: any, options?: Partial<RequestOptions>): Promise<T> {
  return request<T>({ url, method: 'GET', params, ...options })
}

/**
 * POST请求
 */
export function post<T = any>(url: string, data?: any, options?: Partial<RequestOptions>): Promise<T> {
  return request<T>({ url, method: 'POST', data, ...options })
}

/**
 * PUT请求
 */
export function put<T = any>(url: string, data?: any, options?: Partial<RequestOptions>): Promise<T> {
  return request<T>({ url, method: 'PUT', data, ...options })
}

/**
 * DELETE请求
 */
export function del<T = any>(url: string, params?: any, options?: Partial<RequestOptions>): Promise<T> {
  return request<T>({ url, method: 'DELETE', params, ...options })
}

export default request
