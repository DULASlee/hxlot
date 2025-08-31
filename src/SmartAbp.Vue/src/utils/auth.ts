import { ref, computed } from 'vue'

// 认证状态管理
export interface UserInfo {
  id: string
  userName: string
  email: string
  name?: string
  tenantId?: string
  tenantName?: string
  tenantDisplayName?: string
  displayName?: string
  avatar?: string
  department?: string
  position?: string
  roles: string[]
}

export interface TokenInfo {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  expires_at: number
}

// 响应式状态
const isAuthenticated = ref<boolean>(false)
const currentUser = ref<UserInfo | null>(null)
const tokenInfo = ref<TokenInfo | null>(null)

// 存储键名
const TOKEN_KEY = 'smartabp_token'
const USER_KEY = 'smartabp_user'
const REFRESH_TOKEN_KEY = 'smartabp_refresh_token'

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:44397'

/**
 * 认证服务类
 */
export class AuthService {
  private refreshTimer: number | null = null

  /**
   * 登录
   */
  async login(username: string, password: string, tenantName?: string): Promise<boolean> {
    try {
      const loginData = new URLSearchParams({
        grant_type: 'password',
        username: username,
        password: password,
        client_id: 'SmartAbp_App',
        scope: 'SmartAbp'
      })

      // 如果提供了租户名，添加到请求头
      const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded'
      }

      if (tenantName) {
        headers['__tenant'] = tenantName
      }

      const response = await fetch(`${API_BASE_URL}/connect/token`, {
        method: 'POST',
        headers: headers,
        body: loginData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error_description || '登录失败')
      }

      const tokenData = await response.json()

      // 保存Token信息
      const token: TokenInfo = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type || 'Bearer',
        expires_in: tokenData.expires_in,
        expires_at: Date.now() + (tokenData.expires_in * 1000)
      }

      await this.setTokenInfo(token)

      // 获取用户信息
      await this.fetchUserInfo()

      // 启动自动刷新
      this.startTokenRefresh()

      return true
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    try {
      // 停止自动刷新
      this.stopTokenRefresh()

      // 清除本地存储
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)

      // 重置状态
      isAuthenticated.value = false
      currentUser.value = null
      tokenInfo.value = null

      console.log('用户已登出')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  /**
   * 刷新Token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const currentToken = this.getTokenInfo()
      if (!currentToken?.refresh_token) {
        throw new Error('没有刷新Token')
      }

      const refreshData = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: currentToken.refresh_token,
        client_id: 'SmartAbp_App'
      })

      const response = await fetch(`${API_BASE_URL}/connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: refreshData
      })

      if (!response.ok) {
        throw new Error('刷新Token失败')
      }

      const tokenData = await response.json()

      const newToken: TokenInfo = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || currentToken.refresh_token,
        token_type: tokenData.token_type || 'Bearer',
        expires_in: tokenData.expires_in,
        expires_at: Date.now() + (tokenData.expires_in * 1000)
      }

      await this.setTokenInfo(newToken)

      console.log('Token刷新成功')
      return true
    } catch (error) {
      console.error('刷新Token失败:', error)
      await this.logout()
      return false
    }
  }

  /**
   * 获取用户信息
   */
  async fetchUserInfo(): Promise<UserInfo | null> {
    try {
      const token = this.getTokenInfo()
      if (!token) {
        throw new Error('没有访问Token')
      }

      const response = await fetch(`${API_BASE_URL}/api/account/my-profile`, {
        headers: {
          'Authorization': `${token.token_type} ${token.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('获取用户信息失败')
      }

      const userData = await response.json()

      // 解析Token中的Claims
      const claims = this.parseTokenClaims(token.access_token)

      const user: UserInfo = {
        id: userData.id || claims.sub,
        userName: userData.userName || claims.preferred_username,
        email: userData.email || claims.email,
        name: userData.name || claims.name,
        tenantId: claims.tenant_id,
        tenantName: claims.tenant_name,
        tenantDisplayName: claims.tenant_display_name,
        displayName: claims.display_name || userData.name,
        avatar: claims.avatar,
        department: claims.department,
        position: claims.position,
        roles: claims.role ? (Array.isArray(claims.role) ? claims.role : [claims.role]) : []
      }

      currentUser.value = user
      isAuthenticated.value = true

      // 保存到本地存储
      localStorage.setItem(USER_KEY, JSON.stringify(user))

      return user
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  /**
   * 解析JWT Token中的Claims
   */
  private parseTokenClaims(token: string): any {
    try {
      const payload = token.split('.')[1]
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(decoded)
    } catch (error) {
      console.error('解析Token失败:', error)
      return {}
    }
  }

  /**
   * 设置Token信息
   */
  private async setTokenInfo(token: TokenInfo): Promise<void> {
    tokenInfo.value = token
    localStorage.setItem(TOKEN_KEY, JSON.stringify(token))
  }

  /**
   * 获取Token信息
   */
  getTokenInfo(): TokenInfo | null {
    if (tokenInfo.value) {
      return tokenInfo.value
    }

    const stored = localStorage.getItem(TOKEN_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        tokenInfo.value = parsed
        return parsed
      } catch (error) {
        console.error('解析存储的Token失败:', error)
        localStorage.removeItem(TOKEN_KEY)
      }
    }

    return null
  }

  /**
   * 检查Token是否有效
   */
  isTokenValid(): boolean {
    const token = this.getTokenInfo()
    if (!token) {
      return false
    }

    // 检查是否过期（提前5分钟判断为过期）
    const now = Date.now()
    const expiresAt = token.expires_at - (5 * 60 * 1000) // 提前5分钟

    return now < expiresAt
  }

  /**
   * 启动自动刷新Token
   */
  private startTokenRefresh(): void {
    this.stopTokenRefresh()

    const token = this.getTokenInfo()
    if (!token) {
      return
    }

    // 计算刷新时间（过期前5分钟）
    const refreshTime = token.expires_at - Date.now() - (5 * 60 * 1000)

    if (refreshTime > 0) {
      this.refreshTimer = window.setTimeout(async () => {
        const success = await this.refreshToken()
        if (success) {
          this.startTokenRefresh() // 递归设置下次刷新
        }
      }, refreshTime)

      console.log(`Token将在 ${Math.round(refreshTime / 1000)} 秒后自动刷新`)
    }
  }

  /**
   * 停止自动刷新Token
   */
  private stopTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  /**
   * 初始化认证状态
   */
  async initialize(): Promise<void> {
    try {
      // 从本地存储恢复用户信息
      const storedUser = localStorage.getItem(USER_KEY)
      if (storedUser) {
        currentUser.value = JSON.parse(storedUser)
      }

      // 检查Token有效性
      if (this.isTokenValid()) {
        isAuthenticated.value = true
        this.startTokenRefresh()

        // 尝试刷新用户信息
        await this.fetchUserInfo()
      } else {
        // Token无效，尝试刷新
        const token = this.getTokenInfo()
        if (token?.refresh_token) {
          const success = await this.refreshToken()
          if (success) {
            await this.fetchUserInfo()
          }
        } else {
          await this.logout()
        }
      }
    } catch (error) {
      console.error('初始化认证状态失败:', error)
      await this.logout()
    }
  }

  /**
   * 获取认证头
   */
  getAuthHeader(): Record<string, string> {
    const token = this.getTokenInfo()
    if (token && this.isTokenValid()) {
      return {
        'Authorization': `${token.token_type} ${token.access_token}`
      }
    }
    return {}
  }
}

// 创建全局认证服务实例
export const authService = new AuthService()

// 导出响应式状态
export const useAuth = () => {
  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    currentUser: computed(() => currentUser.value),
    tokenInfo: computed(() => tokenInfo.value),
    authService
  }
}

// 兼容性导出函数
export const getStoredAuth = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  const userInfo = localStorage.getItem(USER_KEY)

  if (token && userInfo) {
    return {
      token: JSON.parse(token),
      userInfo: JSON.parse(userInfo)
    }
  }

  return null
}

export const clearAuth = async () => {
  await authService.logout()
}

// 自动初始化
authService.initialize()
