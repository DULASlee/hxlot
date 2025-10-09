/**
 * 🌐 SmartAbp HTTP请求封装
 * 
 * 为packages提供统一的HTTP客户端
 * 基于axios，自动处理token、错误、响应解包
 * 
 * @module @smartabp/lowcode-shared/api
 */

import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

/**
 * API基础URL（从环境变量读取）
 */
export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'https://localhost:44379'

/**
 * HTTP请求封装类
 */
class RequestClient {
    private instance: AxiosInstance

    constructor() {
        this.instance = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        })

        // 请求拦截器
        this.instance.interceptors.request.use(
            (config) => {
                // 从localStorage获取token（packages层不依赖主应用的store）
                const token = this.getToken()
                if (token) {
                    config.headers = config.headers || {}
                    config.headers.Authorization = `Bearer ${token}`
                }
                return config
            },
            (error) => Promise.reject(error)
        )

        // 响应拦截器
        this.instance.interceptors.response.use(
            (response) => {
                // ABP返回的数据可能在response.data或response.data.result中
                if (response.data && typeof response.data === 'object') {
                    // 如果有result字段，返回result
                    if ('result' in response.data) {
                        return response.data.result
                    }
                    // 否则返回整个data
                    return response.data
                }
                return response.data
            },
            (error) => {
                // 统一错误处理
                const errorMessage = error.response?.data?.error?.message
                    || error.message
                    || '请求失败'

                // 401未授权，跳转登录（通过事件通知主应用）
                if (error.response?.status === 401) {
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
                    }
                }

                return Promise.reject(new Error(errorMessage))
            }
        )
    }

    /**
     * 获取认证token
     * 优先从globalThis获取（由主应用注入），否则从localStorage
     */
    private getToken(): string | null {
        const globalWithToken = globalThis as typeof globalThis & {
            __SMARTABP_TOKEN__?: string
        }

        if (globalWithToken.__SMARTABP_TOKEN__) {
            return globalWithToken.__SMARTABP_TOKEN__
        }

        if (typeof window !== 'undefined') {
            return localStorage.getItem('token')
        }

        return null
    }

    /**
     * GET请求
     */
    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.get(url, config)
    }

    /**
     * POST请求
     */
    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.post(url, data, config)
    }

    /**
     * PUT请求
     */
    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.put(url, data, config)
    }

    /**
     * DELETE请求
     */
    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.delete(url, config)
    }

    /**
     * PATCH请求
     */
    async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.patch(url, data, config)
    }
}

/**
 * 导出统一的request实例
 */
export const request = new RequestClient()

