import axios from 'axios'
import { authService } from '@/utils/auth'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:44379',
  timeout: 10000
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
  res => res,
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
  }
)
