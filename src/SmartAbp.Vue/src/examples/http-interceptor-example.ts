import axios from "axios"
// HTTP Interceptor Example - Updated to use Pinia Auth Store
import { useAuthStore } from "@/stores"

export function setupHttpInterceptors() {
  const authStore = useAuthStore()

  const getAuthHeader = () => {
    return authStore.token ? `Bearer ${authStore.token}` : ""
  }

  // Example response interceptor for auth errors
  const handleAuthError = async (error: any) => {
    if (error.response?.status === 401) {
      // 检查是否有refreshToken可用
      const hasRefreshToken = authStore.refreshToken && authStore.refreshToken.length > 0
      if (hasRefreshToken) {
        // 这里应该调用实际的token刷新API
        // 临时模拟刷新成功
        const header = getAuthHeader()
        return header
      } else {
        authStore.logout()
        return null
      }
    }
    throw error
  }

  return { getAuthHeader, handleAuthError }
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:44379",
  timeout: 10000,
})

http.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  const header = authStore.token ? `Bearer ${authStore.token}` : ''
  if (header) {
    config.headers = config.headers || {}
    config.headers.Authorization = header
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      // 模拟token刷新逻辑
      const authStore = useAuthStore()
      const hasRefreshToken = authStore.refreshToken && authStore.refreshToken.length > 0
      if (hasRefreshToken) {
        const header = authStore.token ? `Bearer ${authStore.token}` : ''
        original.headers = original.headers || {}
        if (header) {
          original.headers.Authorization = header
        }
        return http(original)
      }
    }
    return Promise.reject(error)
  },
)
