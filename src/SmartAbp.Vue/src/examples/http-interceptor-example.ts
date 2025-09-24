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
      const ok = await authStore.refreshToken()
      if (ok) {
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
  const header = authService.getAuthHeader()
  if (header.Authorization) {
    config.headers = config.headers || {}
    config.headers.Authorization = header.Authorization
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const ok = await authService.refreshToken()
      if (ok) {
        const header = authService.getAuthHeader()
        original.headers = original.headers || {}
        if (header.Authorization) {
          original.headers.Authorization = header.Authorization
        }
        return http(original)
      }
    }
    return Promise.reject(error)
  },
)
