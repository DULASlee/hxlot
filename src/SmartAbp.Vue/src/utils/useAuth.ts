import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authService, type LoginCredentials } from './auth'

export function useAuth() {
  const authStore = useAuthStore()

  // 计算属性
  const isAuthenticated = computed(() => !!authStore.token)
  const isLoading = computed(() => authStore.isLoading)
  const user = computed(() => authStore.userInfo)
  const token = computed(() => authStore.token)

  // 登录方法
  const login = async (credentials: LoginCredentials) => {
    return await authService.login(credentials)
  }

  // 登出方法
  const logout = () => {
    authService.logout()
  }

  // 获取当前用户
  const getCurrentUser = () => {
    return authService.getCurrentUser()
  }

  // 检查权限
  const hasPermission = (permission: string) => {
    return authService.hasPermission(permission)
  }

  // 检查角色
  const hasRole = (role: string) => {
    return authService.hasRole(role)
  }

  // 获取认证头
  const getAuthHeader = () => {
    return authService.getAuthHeader()
  }

  // 刷新token
  const refreshToken = async () => {
    return await authService.refreshToken()
  }

  // 验证token
  const validateToken = async () => {
    return await authService.validateToken()
  }

  return {
    // 状态
    isAuthenticated,
    isLoading,
    user,
    token,

    // 方法
    login,
    logout,
    getCurrentUser,
    hasPermission,
    hasRole,
    getAuthHeader,
    refreshToken,
    validateToken
  }
}

export default useAuth
