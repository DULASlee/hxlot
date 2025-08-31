import { authService } from './auth'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:44397'

/**
 * HTTP请求工具类
 */
export class ApiService {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  /**
   * 发送HTTP请求
   */
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    // 合并默认配置
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      // 处理401未授权错误
      if (response.status === 401) {
        // 尝试刷新Token
        const refreshSuccess = await authService.refreshToken()
        if (refreshSuccess) {
          // 重新发送请求
          config.headers = {
            ...config.headers,
            ...authService.getAuthHeader(),
          }
          const retryResponse = await fetch(url, config)
          if (!retryResponse.ok) {
            throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`)
          }
          return await this.parseResponse(retryResponse)
        } else {
          // 刷新失败，跳转到登录页
          await authService.logout()
          throw new Error('认证失败，请重新登录')
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await this.parseResponse(response)
    } catch (error) {
      console.error('API请求失败:', error)
      throw error
    }
  }

  /**
   * 解析响应数据
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }

    return (await response.text()) as unknown as T
  }

  /**
   * GET请求
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint

    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      url += `?${searchParams.toString()}`
    }

    return this.request<T>(url, { method: 'GET' })
  }

  /**
   * POST请求
   */
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT请求
   */
  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  /**
   * 上传文件
   */
  async upload<T = any>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // 不设置Content-Type，让浏览器自动设置multipart/form-data边界
        ...authService.getAuthHeader(),
      },
    })
  }
}

// 创建全局API服务实例
export const apiService = new ApiService()

// 导出常用的API方法
export const api = {
  get: apiService.get.bind(apiService),
  post: apiService.post.bind(apiService),
  put: apiService.put.bind(apiService),
  delete: apiService.delete.bind(apiService),
  upload: apiService.upload.bind(apiService),
}
