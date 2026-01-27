import type { Volo_Abp_Account_Web_Areas_Account_Controllers_Models_AbpLoginResult, Volo_Abp_Account_Web_Areas_Account_Controllers_Models_UserLoginInfo } from '@/api/generated'
import { LoginService } from '@/api/generated'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

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
 * 🔐 启用持久化：防止页面刷新后权限丢失
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
    // 优先从ABP认证系统获取用户信息
    const abpToken = localStorage.getItem('_abp_auth_token') ||
      localStorage.getItem('Abp.AuthToken') ||
      localStorage.getItem('access_token')

    if (abpToken) {
      console.log('🔐 [Auth] 检测到ABP认证token，尝试获取应用配置...')

      // 如果有ABP token，尝试获取应用配置
      syncFromABPConfig()
    } else {
      // 后备：从旧的SmartAbp存储获取
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
          console.log('🔐 [Auth] 从本地存储恢复用户信息:', userInfo.value)
        } catch (error) {
          console.error('解析存储用户信息失败:', error)
        }
      }
    }
  }

  /**
   * 从ABP应用配置同步用户信息
   */
  const syncFromABPConfig = async (): Promise<void> => {
    try {
      const { AbpApplicationConfigurationService } = await import('@/api/generated')
      const appConfig = await AbpApplicationConfigurationService.getApiAbpApplicationConfiguration({
        includeLocalizationResources: false
      })

      if (appConfig.currentUser && appConfig.currentUser.id) {
        userInfo.value = {
          id: appConfig.currentUser.id,
          userName: appConfig.currentUser.userName || 'unknown',
          email: appConfig.currentUser.email || `${appConfig.currentUser.userName}@example.com`,
          roles: appConfig.currentUser.roles || ['user']
        }

        // 获取ABP token
        const abpToken = localStorage.getItem('_abp_auth_token') ||
          localStorage.getItem('Abp.AuthToken') ||
          localStorage.getItem('access_token')

        if (abpToken) {
          token.value = abpToken
          console.log('🔐 [Auth] 从ABP配置同步用户信息成功:', userInfo.value)
        }
      }
    } catch (error: any) {
      console.warn('🔐 [Auth] 从ABP配置同步用户信息失败:', error.message)
      // 如果ABP同步失败，尝试从旧存储恢复
      initializeFromStorage()
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
      console.log('🔐 [Auth] 开始登录:', credentials.username)

      // 构建ABP认证API请求参数
      const loginRequest: Volo_Abp_Account_Web_Areas_Account_Controllers_Models_UserLoginInfo = {
        userNameOrEmailAddress: credentials.username,
        password: credentials.password,
        rememberMe: credentials.rememberMe || false
      }

      // 调用后端认证API
      const loginResult: Volo_Abp_Account_Web_Areas_Account_Controllers_Models_AbpLoginResult =
        await LoginService.postApiAccountLogin({ requestBody: loginRequest })

      console.log('🔐 [Auth] 登录API响应:', loginResult)

      // 根据ABP登录结果处理
      if (loginResult.result === 1) { // Success
        // 登录成功，凭据验证通过
        console.log('🔐 [Auth] 凭据验证成功，正在获取JWT Token...')

        // 🔥 关键修复：通过 OAuth2 Password Grant 获取 JWT Token
        const tokenForm = new URLSearchParams()
        tokenForm.append('grant_type', 'password')
        tokenForm.append('username', credentials.username)
        tokenForm.append('password', credentials.password)
        tokenForm.append('client_id', 'SmartAbp_App')
        tokenForm.append('scope', 'SmartAbp')

        // 开发环境直接调用后端，生产环境使用相对路径
        const tokenUrl = import.meta.env.DEV 
          ? 'https://localhost:9002/connect/token' 
          : '/connect/token'
        console.log('🔐 [Auth] Token请求URL:', tokenUrl)

        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: tokenForm
        })

        console.log('🔐 [Auth] Token响应状态:', tokenResponse.status, tokenResponse.ok)

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json().catch(() => ({}))
          console.error('🔐 [Auth] Token获取失败:', errorData)
          throw new Error(errorData?.error_description || 'Token获取失败')
        }

        const tokenData = await tokenResponse.json()
        console.log('🔐 [Auth] JWT Token获取成功:', { hasAccessToken: !!tokenData.access_token })

        // 保存 token
        setToken(tokenData.access_token, tokenData.refresh_token)

        // 使用 token 获取用户信息
        console.log('🔐 [Auth] 正在获取用户信息...')
        const configResponse = await fetch('/api/abp/application-configuration?IncludeLocalizationResources=false', {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        })
        const appConfig = await configResponse.json()

        console.log('🔐 [Auth] 用户配置响应:', {
          hasCurrentUser: !!appConfig.currentUser,
          userId: appConfig.currentUser?.id,
          userName: appConfig.currentUser?.userName,
          isAuthenticated: appConfig.currentUser?.isAuthenticated
        })

        if (appConfig.currentUser && appConfig.currentUser.id) {
          const user: UserInfo = {
            id: appConfig.currentUser.id,
            userName: appConfig.currentUser.userName || credentials.username,
            email: appConfig.currentUser.email || `${credentials.username}@example.com`,
            roles: appConfig.currentUser.roles || ['user']
          }

          setUserInfo(user)

          console.log('🔐 [Auth] 用户信息设置完成:', user)

          return {
            success: true,
            user: user,
            token: tokenData.access_token
          }
        } else {
          throw new Error('登录成功但未获取到用户信息')
        }
      } else {
        // 登录失败，根据result值给出不同错误信息
        let errorMessage = '用户名或密码错误'
        switch (loginResult.result) {
          case 2: // InvalidUserNameOrEmailAddress
            errorMessage = '用户名或邮箱不存在'
            break
          case 3: // InvalidPassword
            errorMessage = '密码错误'
            break
          case 4: // UserIsNotActive
            errorMessage = '用户已被禁用，请联系管理员'
            break
          case 5: // EmailAddressNotConfirmed
            errorMessage = '邮箱地址未确认，请检查邮箱'
            break
          default:
            errorMessage = loginResult.description || '登录失败'
        }
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      console.error('🔐 [Auth] 登录失败:', error)

      // 如果是API错误，提取ABP错误信息
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message)
      } else if (error.message) {
        throw error
      } else {
        throw new Error('网络连接失败，请检查网络设置')
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 登出
   */
  const logout = async (): Promise<void> => {
    try {
      console.log('🔐 [Auth] 开始登出...')

      // 调用后端登出API
      await LoginService.getApiAccountLogout()
      console.log('🔐 [Auth] 后端登出API调用成功')
    } catch (error: any) {
      console.warn('🔐 [Auth] 后端登出API失败，但继续执行本地清理:', error.message)
    } finally {
      // 无论后端API是否成功，都要清理本地认证状态
      clearAuth()

      // 清理ABP相关的认证存储
      localStorage.removeItem('_abp_auth_token')
      localStorage.removeItem('Abp.AuthToken')
      localStorage.removeItem('Abp.AuthRefreshToken')
      localStorage.removeItem('smartabp_token')
      localStorage.removeItem('smartabp_user')
      localStorage.removeItem('smartabp_refresh_token')

      console.log('🔐 [Auth] 本地认证状态清理完成')
    }
  }

  /**
   * 初始化认证状态
   */
  const initialize = async (): Promise<void> => {
    await initializeFromStorage()

    // 监听localStorage变化，实现多标签页同步
    window.addEventListener('storage', async (event: StorageEvent) => {
      if (event.key === '_abp_auth_token' || event.key === 'Abp.AuthToken' || event.key === 'access_token') {
        if (event.newValue) {
          token.value = event.newValue
          // 重新同步用户信息
          await syncFromABPConfig()
        } else {
          await logout()
        }
      }
    })

    console.log('🔐 [Auth] 认证系统初始化完成')
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
}, {
  // 🔐 持久化配置：确保刷新页面后认证状态不丢失
  persist: {
    key: 'smartabp-auth',
    storage: localStorage
  }
})



