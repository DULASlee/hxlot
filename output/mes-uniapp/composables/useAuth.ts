// composables/useAuth.ts
/**
 * JWT认证Composable
 * @author SmartAbp DevKit Low-Code Engine
 * @since 2025-10-22
 */

import { ref, computed } from 'vue'
import { post } from '@/utils/request'
import { setStorage, getStorage, removeStorage } from '@/utils/storage'

interface LoginCredentials {
  username: string
  password: string
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

interface UserInfo {
  id: string
  username: string
  email?: string
  roles?: string[]
}

const accessToken = ref<string>(getStorage('access_token') || '')
const refreshToken = ref<string>(getStorage('refresh_token') || '')
const userInfo = ref<UserInfo | null>(getStorage('user_info') || null)

export function useAuth() {
  const isAuthenticated = computed(() => !!accessToken.value)

  /**
   * 登录
   */
  async function login(credentials: LoginCredentials): Promise<boolean> {
    try {
      const response = await post<AuthTokens>('/api/auth/login', credentials)
      
      accessToken.value = response.accessToken
      refreshToken.value = response.refreshToken
      
      // 保存到本地存储
      setStorage('access_token', response.accessToken)
      setStorage('refresh_token', response.refreshToken)
      
      // 获取用户信息
      await fetchUserInfo()
      
      return true
    } catch (error) {
      console.error('登录失败:', error)
      uni.showToast({ title: '登录失败', icon: 'none' })
      return false
    }
  }

  /**
   * 登出
   */
  async function logout(): Promise<void> {
    try {
      await post('/api/auth/logout')
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      // 清空本地状态
      accessToken.value = ''
      refreshToken.value = ''
      userInfo.value = null
      
      // 清空本地存储
      removeStorage('access_token')
      removeStorage('refresh_token')
      removeStorage('user_info')
      
      // 跳转到登录页
      uni.reLaunch({ url: '/pages/login/login' })
    }
  }

  /**
   * 刷新Token
   */
  async function refreshAccessToken(): Promise<boolean> {
    try {
      const response = await post<AuthTokens>('/api/auth/refresh', {
        refreshToken: refreshToken.value
      })
      
      accessToken.value = response.accessToken
      setStorage('access_token', response.accessToken)
      
      return true
    } catch (error) {
      console.error('刷新Token失败:', error)
      await logout()
      return false
    }
  }

  /**
   * 获取用户信息
   */
  async function fetchUserInfo(): Promise<void> {
    try {
      const info = await post<UserInfo>('/api/auth/user-info')
      userInfo.value = info
      setStorage('user_info', info)
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  return {
    accessToken,
    refreshToken,
    userInfo,
    isAuthenticated,
    login,
    logout,
    refreshAccessToken,
    fetchUserInfo
  }
}
