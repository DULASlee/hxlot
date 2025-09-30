import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string
  userName: string
  email: string
  roles: string[]
  [key: string]: any
}

/**
 * 登录凭证接口
 */
export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
  tenantName?: string // 租户名称（多租户支持）
}

/**
 * 登录响应接口
 */
export interface LoginResponse {
  success: boolean
  user: UserInfo
  token: string
  message?: string
}

/**
 * 认证Store
 * 负责管理用户认证状态、token和用户信息
 */
export const useAuthStore = defineStore('auth', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 状态定义
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const token = ref<string | null>(
    localStorage.getItem('access_token') || localStorage.getItem('smartabp_token')
  )
  
  const refreshToken = ref<string | null>(
    localStorage.getItem('refresh_token') || localStorage.getItem('smartabp_refresh_token')
  )
  
  const userInfo = ref<UserInfo | null>(null)
  
  const isLoading = ref<boolean>(false)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 私有方法
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 从本地存储初始化用户信息
   */
  const initializeFromStorage = (): void => {
    const storedUser = localStorage.getItem('smartabp_user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        userInfo.value = {
          id: user.id,
          userName: user.userName || user.username,
          email: user.email,
          roles: user.roles || ['user'] // 默认角色
        }
      } catch (error) {
        console.error('解析存储用户信息失败:', error)
      }
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 计算属性
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 是否已认证
   */
  const isAuthenticated = computed<boolean>(() => {
    const hasToken = !!token.value
    const hasStoredToken = !!localStorage.getItem('smartabp_token')
    const hasUserInfo = !!userInfo.value
    return hasToken || (hasStoredToken && hasUserInfo)
  })

  /**
   * 检查用户是否拥有指定角色
   */
  const hasRole = computed(() => {
    return (role: string): boolean => {
      return userInfo.value?.roles?.includes(role) ?? false
    }
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 公共方法
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 设置Token
   */
  const setToken = (accessToken: string, refreshTokenValue?: string): void => {
    token.value = accessToken
    localStorage.setItem('access_token', accessToken)
    
    if (refreshTokenValue) {
      refreshToken.value = refreshTokenValue
      localStorage.setItem('refresh_token', refreshTokenValue)
    }
  }

  /**
   * 设置用户信息
   */
  const setUserInfo = (user: UserInfo): void => {
    userInfo.value = user
    localStorage.setItem('smartabp_user', JSON.stringify(user))
  }

  /**
   * 清除认证信息
   */
  const clearAuth = (): void => {
    token.value = null
    refreshToken.value = null
    userInfo.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('smartabp_user')
  }

  /**
   * 获取认证请求头
   */
  const getAuthHeader = (): Record<string, string> => {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  /**
   * 登录
   */
  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    isLoading.value = true
    
    try {
      // TODO: 替换为真实API调用
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (credentials.username === 'admin' && credentials.password === '1q2w3E*') {
        const mockToken = 'mock-jwt-token-' + Date.now()
        const mockUser: UserInfo = {
          id: '1',
          userName: credentials.username,
          email: 'admin@example.com',
          roles: ['admin']
        }
        
        setToken(mockToken)
        setUserInfo(mockUser)
        
        return {
          success: true,
          user: mockUser,
          token: mockToken
        }
      } else {
        throw new Error('用户名或密码错误')
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 登出
   */
  const logout = (): void => {
    clearAuth()
    
    // 同时清理smartabp认证系统的存储
    localStorage.removeItem('smartabp_token')
    localStorage.removeItem('smartabp_user')
    localStorage.removeItem('smartabp_refresh_token')
  }

  /**
   * 初始化认证状态
   */
  const initialize = (): void => {
    initializeFromStorage()
    
    // 监听localStorage变化，实现多标签页同步
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === 'smartabp_token' || event.key === 'access_token') {
        if (event.newValue) {
          token.value = event.newValue
        } else {
          logout()
        }
      } else if (event.key === 'smartabp_user') {
        if (event.newValue) {
          try {
            const user = JSON.parse(event.newValue)
            userInfo.value = {
              id: user.id,
              userName: user.userName || user.username,
              email: user.email,
              roles: user.roles || ['user']
            }
          } catch (error) {
            console.error('解析用户信息失败:', error)
          }
        }
      }
    })
  }

  /**
   * 从SmartAbp认证系统同步状态
   */
  const syncFromSmartAbp = (): void => {
    const smartabpToken = localStorage.getItem('smartabp_token')
    const smartabpUser = localStorage.getItem('smartabp_user')
    
    if (smartabpToken && smartabpUser) {
      token.value = smartabpToken
      
      try {
        const user = JSON.parse(smartabpUser)
        userInfo.value = {
          id: user.id,
          userName: user.userName || user.username,
          email: user.email,
          roles: user.roles || ['user']
        }
        console.log('✅ 已同步SmartAbp认证状态:', userInfo.value)
      } catch (error) {
        console.error('同步用户信息失败:', error)
      }
    }
  }

  /**
   * 获取用户信息（兼容旧代码）
   * @deprecated 使用 userInfo 状态代替
   */
  const fetchUserInfo = async (): Promise<UserInfo | null> => {
    // 从服务器重新获取用户信息
    syncFromSmartAbp()
    return userInfo.value
  }

  /**
   * 刷新Token（兼容旧代码）
   * @deprecated 将来使用JWT自动刷新机制
   */
  const refreshTokenMethod = async (): Promise<string | null> => {
    const currentRefreshToken = refreshToken.value
    if (currentRefreshToken) {
      // TODO: 实现真实的token刷新逻辑
      console.log('Token刷新功能待实现')
      return token.value
    }
    return null
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 返回Store接口
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
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
    logout,
    initialize,
    syncFromSmartAbp,
    
    // 兼容方法
    fetchUserInfo,
    refreshTokenMethod
  }
})



