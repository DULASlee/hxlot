import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  id: string
  username: string
  email: string
  roles: string[]
}

export interface LoginCredentials {
  username: string
  password: string
  tenantName?: string
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))
  const userInfo = ref<UserInfo | null>(null)
  const isLoading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)
  const hasRole = computed(() => (role: string) => {
    return userInfo.value?.roles?.includes(role) ?? false
  })

  // 方法
  const setToken = (accessToken: string, refreshTokenValue?: string) => {
    token.value = accessToken
    localStorage.setItem('access_token', accessToken)

    if (refreshTokenValue) {
      refreshToken.value = refreshTokenValue
      localStorage.setItem('refresh_token', refreshTokenValue)
    }
  }

  const setUserInfo = (user: UserInfo) => {
    userInfo.value = user
  }

  const clearAuth = () => {
    token.value = null
    refreshToken.value = null
    userInfo.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  const getAuthHeader = () => {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      isLoading.value = true

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (credentials.username === 'admin' && credentials.password === '1q2w3E*') {
        const mockToken = 'mock-jwt-token-' + Date.now()
        const mockUser: UserInfo = {
          id: '1',
          username: credentials.username,
          email: 'admin@example.com',
          roles: ['admin']
        }

        setToken(mockToken)
        setUserInfo(mockUser)

        return { success: true, user: mockUser, token: mockToken }
      } else {
        throw new Error('用户名或密码错误')
      }
    } catch (err) {
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    clearAuth()
  }

  return {
    // 状态
    token,
    refreshToken,
    userInfo,
    isLoading,
    // 计算属性
    isAuthenticated,
    hasRole,
    // 方法
    setToken,
    setUserInfo,
    clearAuth,
    getAuthHeader,
    login,
    logout
  }
})
