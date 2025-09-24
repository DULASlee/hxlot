
import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { apiService } from "@/utils/api" // 引入apiService
import { logger } from "@/utils/logger" // 引入logger

export interface UserInfo {
  id: string
  userName: string
  email: string
  roles: string[]
}

export interface LoginCredentials {
  username: string
  password: string
  tenantName?: string
}

export const useAuthStore = defineStore(
  "auth",
  () => {
    // 状态
    const token = ref<string | null>(null)
    const refreshToken = ref<string | null>(null)
    const userInfo = ref<UserInfo | null>(null)
    const isLoading = ref(false)

    // 计算属性
    const isAuthenticated = computed(() => !!token.value && !!userInfo.value)
    const hasRole = computed(() => (role: string) => {
      return userInfo.value?.roles?.includes(role) ?? false
    })

    // 方法
    const setToken = (accessToken: string, refreshTokenValue?: string) => {
      token.value = accessToken
      localStorage.setItem("smartabp_token", accessToken)

      if (refreshTokenValue) {
        refreshToken.value = refreshTokenValue
        localStorage.setItem("smartabp_refresh_token", refreshTokenValue)
      }
    }

    const setUserInfo = (user: UserInfo) => {
      userInfo.value = user
      localStorage.setItem("smartabp_user", JSON.stringify(user))
    }

    const clearAuth = () => {
      token.value = null
      refreshToken.value = null
      userInfo.value = null
      localStorage.removeItem("smartabp_token")
      localStorage.removeItem("smartabp_refresh_token")
      localStorage.removeItem("smartabp_user")
    }

    const getAuthHeader = () => {
      return token.value ? { Authorization: `Bearer ${token.value}` } : {}
    }

    const fetchUserInfo = async (): Promise<UserInfo | null> => {
      if (!token.value) return null
      try {
        const user = await apiService.get<UserInfo>("/api/account/my-profile")
        setUserInfo(user)
        return user
      } catch (error) {
        logger.error("获取用户信息失败:", { error })
        clearAuth()
        return null
      }
    }

    const login = async (credentials: LoginCredentials) => {
      isLoading.value = true
      try {
        const loginData = new URLSearchParams()
        loginData.append("grant_type", "password")
        loginData.append("username", credentials.username)
        loginData.append("password", credentials.password)
        loginData.append("client_id", "SmartAbp_App")
        loginData.append("scope", "SmartAbp")

        const headers: Record<string, string> = {
          "Content-Type": "application/x-www-form-urlencoded",
        }
        if (credentials.tenantName) {
          headers["__tenant"] = credentials.tenantName
        }

        const response = await apiService.getInstance().post("/connect/token", loginData, {
          headers,
        })

        if (response.status === 200) {
          const tokenData = response.data
          setToken(tokenData.access_token, tokenData.refresh_token)
          await fetchUserInfo()
          return true
        } else {
          const errorData = response.data || {}
          const message =
            (errorData && (errorData.error_description || errorData.error)) || "登录失败"
          throw new Error(message)
        }
      } catch (err: any) {
        clearAuth()
        logger.error("登录失败:", { error: err })
        throw err
      } finally {
        isLoading.value = false
      }
    }

    const logout = () => {
      clearAuth()
      // 可选：通知后端吊销token
    }

    const initialize = () => {
      const storedToken = localStorage.getItem("smartabp_token")
      const storedRefreshToken = localStorage.getItem("smartabp_refresh_token")
      const storedUser = localStorage.getItem("smartabp_user")

      if (storedToken && storedUser) {
        token.value = storedToken
        refreshToken.value = storedRefreshToken
        try {
          userInfo.value = JSON.parse(storedUser)
        } catch (e) {
          logger.error("解析存储的用户信息失败", e)
          clearAuth()
        }
      }
    }

    initialize() // 初始化状态

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
      fetchUserInfo,
      initialize,
    }
  },
  {
    // Pinia 纯组合式不支持 persist 选项；保持手动持久化
  },
)
