/* eslint-disable */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"
import { appConfig } from "@/config"
import { useAuthStore } from "@/stores"
import { logger } from "./logger"

// API基础配置（统一从强类型配置读取）
const API_BASE_URL = appConfig.apiBaseUrl || "https://localhost:44397"

/**
 * HTTP请求工具类
 */
export class ApiService {
  private axiosInstance: AxiosInstance

  constructor(baseURL: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    })

    this.setupInterceptors()
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors() {
    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const authStore = useAuthStore()
        const authHeader = authStore.getAuthHeader()

        if (authHeader.Authorization) {
          config.headers.Authorization = authHeader.Authorization
        }
        const startedAt = Date.now()
        ;(config as any).metadata = { startedAt }
        try {
          const url = `${config.baseURL || ''}${config.url || ''}`
          const headers = { ...config.headers }
          if (headers && 'Authorization' in headers) headers.Authorization = '***'
          logger.getEnhancedLogger().child({ type: 'api-request' }).info('API Request', {
            method: config.method,
            url,
            headers,
          })
        } catch {}
        return config
      },
      (error) => {
        try {
          logger.getEnhancedLogger().child({ type: 'api-request-error' }).error('API Request Error', error)
        } catch {}
        return Promise.reject(error)
      },
    )

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        try {
          const startedAt = (response.config as any).metadata?.startedAt || Date.now()
          const duration = Date.now() - startedAt
          const url = `${response.config.baseURL || ''}${response.config.url || ''}`
          logger.getEnhancedLogger().child({ type: 'api-response' }).info('API Response', {
            method: response.config.method,
            url,
            status: response.status,
            duration,
          })
        } catch {}
        return response
      },
      async (error) => {
        const originalRequest = error.config

        // 处理401未授权错误
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          const authStore = useAuthStore()

          try {
            // 尝试刷新Token
            const refreshSuccess = await this.refreshToken()
            if (refreshSuccess) {
              // 重新发送原始请求
              const authHeader = authStore.getAuthHeader()
              if (authHeader.Authorization) {
                originalRequest.headers.Authorization = authHeader.Authorization
              }
              return this.axiosInstance(originalRequest)
            }
          } catch (refreshError) {
            // 刷新失败，清除认证信息
            authStore.clearAuth()
            // 可以在这里添加跳转到登录页的逻辑
            throw new Error("认证失败，请重新登录")
          }
        }

        try {
          const url = `${error.config?.baseURL || ''}${error.config?.url || ''}`
          logger.getEnhancedLogger().child({ type: 'api-error' }).error('API Error', error, {
            method: error.config?.method,
            url,
            status: error.response?.status,
          })
        } catch {}
        return Promise.reject(error)
      },
    )
  }

  /**
   * 刷新Token
   */
  private async refreshToken(): Promise<boolean> {
    try {
      const authStore = useAuthStore()
      const refreshToken = authStore.refreshToken

      if (!refreshToken) {
        return false
      }

      const response = await axios.post(`${API_BASE_URL}/connect/token`, {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      })

      const { access_token, refresh_token: newRefreshToken } = response.data
      authStore.setToken(access_token, newRefreshToken)

      return true
    } catch (error) {
      logger.error("刷新Token失败:", { error })
      return false
    }
  }

  /**
   * GET请求
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config)
    return response.data
  }

  /**
   * POST请求
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config)
    return response.data
  }

  /**
   * PUT请求
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config)
    return response.data
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config)
    return response.data
  }

  /**
   * 上传文件
   */
  async upload<T = any>(url: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData()
    formData.append("file", file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    const response = await this.axiosInstance.post<T>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  }

  /**
   * 获取axios实例（用于更复杂的请求）
   */
  getInstance(): AxiosInstance {
    return this.axiosInstance
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
  getInstance: apiService.getInstance.bind(apiService),
}
