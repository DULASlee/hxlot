import { ref, computed, type ComputedRef } from 'vue'
import { logger } from '@/utils/logger'

// 类型定义
export interface TokenInfo {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  expires_at: number
}

export interface UserInfo {
  id: string
  userName: string
  email?: string
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

export interface LoginCredentials {
  username: string
  password: string
  tenantName?: string
}

export interface TokenClaims {
  sub?: string
  preferred_username?: string
  email?: string
  name?: string
  tenant_id?: string
  tenant_name?: string
  tenant_display_name?: string
  display_name?: string
  avatar?: string
  department?: string
  position?: string
  role?: string | string[]
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
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://localhost:44379')

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || 'SmartAbp_App'
const SCOPE = import.meta.env.VITE_SCOPE || 'SmartAbp'

/**
 * 认证服务类
 */
export class AuthService {
  private static instance: AuthService | null = null
  private refreshTimer: number | null = null

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  /**
   * 登录（支持对象参数或分离参数）
   */
  async login(
    usernameOrCredentials: string | LoginCredentials,
    password?: string,
    tenantName?: string
  ): Promise<boolean> {
    let username: string
    let pwd: string
    let tenant: string | undefined

    // 检查是否传入了凭据对象
    if (typeof usernameOrCredentials === 'object') {
      username = usernameOrCredentials.username
      pwd = usernameOrCredentials.password
      tenant = usernameOrCredentials.tenantName
    } else {
      username = usernameOrCredentials
      pwd = password || ''
      tenant = tenantName
    }

    try {
      if (!username || !pwd) {
        throw new Error('用户名或密码不能为空')
      }

      const loginData = new URLSearchParams()
      loginData.append('grant_type', 'password')
      loginData.append('username', username)
      loginData.append('password', pwd)
      loginData.append('client_id', CLIENT_ID)
      loginData.append('scope', SCOPE)

      const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded'
      }

      if (tenant) {
        headers['__tenant'] = tenant
      }

      const response = await fetch(`${API_BASE_URL}/connect/token`, {
        method: 'POST',
        headers,
        body: loginData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message =
          (errorData && (errorData.error_description || errorData.error)) || '登录失败'
        throw new Error(message)
      }

      const tokenData = await response.json()

      const token: TokenInfo = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type || 'Bearer',
        expires_in: tokenData.expires_in,
        expires_at: Date.now() + tokenData.expires_in * 1000
      }

      await this.setTokenInfo(token)
      await this.fetchUserInfo()
      this.startTokenRefresh()

      return true
    } catch (error) {
      logger.error('登录失败:', { error })
      throw error
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    try {
      this.stopTokenRefresh()

      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)

      isAuthenticated.value = false
      currentUser.value = null
      tokenInfo.value = null

      logger.info('用户已登出')
    } catch (error) {
      logger.error('登出失败:', { error })
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
        client_id: CLIENT_ID
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
        expires_at: Date.now() + tokenData.expires_in * 1000
      }

      await this.setTokenInfo(newToken)
      logger.info('Token刷新成功')

      return true
    } catch (error) {
      logger.error('刷新Token失败:', { error })
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
          Authorization: `${token.token_type} ${token.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('获取用户信息失败')
      }

      const userData = await response.json()
      const claims = this.parseTokenClaims(token.access_token)

      const user: UserInfo = {
        id: userData.id || claims.sub || '',
        userName: userData.userName || claims.preferred_username || '',
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
      localStorage.setItem(USER_KEY, JSON.stringify(user))

      return user
    } catch (error) {
      logger.error('获取用户信息失败:', { error })
      return null
    }
  }

  /**
   * 解析JWT Token中的Claims
   */
  private parseTokenClaims(token: string): TokenClaims {
    try {
      const payload = token.split('.')[1]
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(decoded)
    } catch (error) {
      logger.error('解析Token失败:', { error })
      return {}
    }
  }

  /**
   * 设置Token信息
   */
  async setTokenInfo(token: TokenInfo): Promise<void> {
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
        const parsed: TokenInfo = JSON.parse(stored)
        tokenInfo.value = parsed
        return parsed
      } catch (error) {
        logger.error('解析存储的Token失败:', { error })
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

    const now = Date.now()
    const expiresAt = token.expires_at - 5 * 60 * 1000 // 提前5分钟判断为过期
    return now < expiresAt
  }

  /**
   * 启动自动刷新Token
   */
  startTokenRefresh(): void {
    this.stopTokenRefresh()

    const token = this.getTokenInfo()
    if (!token) {
      return
    }

    const refreshTime = token.expires_at - Date.now() - 5 * 60 * 1000
    if (refreshTime > 0) {
      this.refreshTimer = window.setTimeout(async () => {
        const success = await this.refreshToken()
        if (success) {
          this.startTokenRefresh()
        }
      }, refreshTime)

      logger.debug(`Token将在 ${Math.round(refreshTime / 1000)} 秒后自动刷新`)
    }
  }

  /**
   * 停止自动刷新Token
   */
  stopTokenRefresh(): void {
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
      const storedUser = localStorage.getItem(USER_KEY)
      if (storedUser) {
        currentUser.value = JSON.parse(storedUser)
      }

      if (this.isTokenValid()) {
        isAuthenticated.value = true
        this.startTokenRefresh()
        await this.fetchUserInfo()
      } else {
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
      logger.error('初始化认证状态失败:', { error })
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
        Authorization: `${token.token_type} ${token.access_token}`
      }
    }
    return {}
  }

  /**
   * 获取当前用户
   */
  getCurrentUser(): UserInfo | null {
    return currentUser.value
  }

  /**
   * 检查用户是否有指定权限
   */
  hasPermission(_permission: string): boolean {
    const user = currentUser.value
    if (!user || !isAuthenticated.value) {
      return false
    }
    // 这里可以根据实际权限系统实现
    return true
  }

  /**
   * 检查用户是否有指定角色
   */
  hasRole(role: string): boolean {
    const user = currentUser.value
    if (!user || !isAuthenticated.value) {
      return false
    }
    return user.roles.includes(role)
  }

  /**
   * 验证token有效性
   */
  async validateToken(): Promise<boolean> {
    if (!this.isTokenValid()) {
      return false
    }

    try {
      await this.fetchUserInfo()
      return true
    } catch {
      return false
    }
  }
}

// 创建全局认证服务实例
export const authService = AuthService.getInstance()

// 导出响应式状态和composable
export interface UseAuthReturn {
  isAuthenticated: ComputedRef<boolean>
  currentUser: ComputedRef<UserInfo | null>
  tokenInfo: ComputedRef<TokenInfo | null>
  authService: AuthService
}

export const useAuth = (): UseAuthReturn => {
  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    currentUser: computed(() => currentUser.value),
    tokenInfo: computed(() => tokenInfo.value),
    authService
  }
}
