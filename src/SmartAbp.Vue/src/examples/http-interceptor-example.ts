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
      try {
        const ok = await authStore.refreshTokenMethod()
        if (ok) {
          const header = getAuthHeader()
          return header
        } else {
          authStore.logout()
          return null
        }
      } catch (refreshError) {
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

// Example usage with interceptors
http.interceptors.request.use((config) => {
  const { getAuthHeader } = setupHttpInterceptors()
  const authHeader = getAuthHeader()
  if (authHeader) {
    config.headers = config.headers || {}
    config.headers.Authorization = authHeader
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { handleAuthError } = setupHttpInterceptors()
    try {
      return await handleAuthError(error)
    } catch (err) {
      return Promise.reject(err)
    }
  },
)
