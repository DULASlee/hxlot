
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
    // 🗄️ 持久化由pinia-plugin-persistedstate自动处理

    if (refreshTokenValue) {
      refreshToken.value = refreshTokenValue
      // 🗄️ 持久化由pinia-plugin-persistedstate自动处理
    }
  }

  const setUserInfo = (user: UserInfo) => {
      // 确保用户有基本角色
      if (!user.roles || user.roles.length === 0) {
        user.roles = user.userName === "admin" ? ["admin", "user"] : ["user"]
      }

    userInfo.value = user
    // 🗄️ 持久化由pinia-plugin-persistedstate自动处理
  }

  const clearAuth = () => {
    token.value = null
    refreshToken.value = null
    userInfo.value = null
    // 🗄️ 清除由pinia-plugin-persistedstate自动处理
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

  const logout = async () => {
    try {
      // 如果有token，尝试通知后端吊销token
      if (token.value) {
        try {
          await apiService.post("/api/account/logout", {}, {
            headers: getAuthHeader()
          })
          logger.info("已通知后端退出登录")
        } catch (error) {
          // 即使后端调用失败，也要继续清除本地状态
          logger.warn("通知后端退出登录失败，但继续清除本地状态", error)
        }
      }
    } catch (error) {
      logger.error("退出登录过程中发生错误", error)
    } finally {
      // 无论如何都要清除本地认证状态
      clearAuth()
      logger.info("用户已退出登录，本地认证状态已清除")
    }
  }

  const initialize = () => {
      const storedToken = localStorage.getItem("smartabp_token")
      const storedRefreshToken = localStorage.getItem("smartabp_refresh_token")
      const storedUser = localStorage.getItem("smartabp_user")

      if (storedToken && storedUser) {
        token.value = storedToken
        refreshToken.value = storedRefreshToken
        try {
          const user = JSON.parse(storedUser)
          // 确保恢复的用户有基本角色
          if (!user.roles || user.roles.length === 0) {
            user.roles = user.userName === "admin" ? ["admin", "user"] : ["user"]
          }
          userInfo.value = user
        } catch (e) {
          logger.error("解析存储的用户信息失败", e)
          clearAuth()
        }
      }
    }

    // SmartAbp系统同步方法 - 企业级认证状态同步
    const syncFromSmartAbp = async () => {
      try {
        // 检查是否存在有效的认证状态
        if (!token.value) {
          logger.debug("无有效token，跳过SmartAbp同步")
          return
        }

        // 验证当前token是否仍然有效
        try {
          await fetchUserInfo()
          logger.debug("SmartAbp认证状态同步成功")
        } catch (error) {
          // Token可能已过期，尝试刷新
          if (refreshToken.value) {
            try {
              await refreshTokenMethod()
              logger.info("SmartAbp认证状态已通过refresh token恢复")
            } catch (refreshError) {
              logger.warn("SmartAbp认证状态同步失败，清除过期认证", refreshError)
              clearAuth()
            }
          } else {
            logger.warn("SmartAbp认证状态同步失败，无refresh token可用", error)
            clearAuth()
          }
        }
      } catch (error) {
        logger.error("SmartAbp认证状态同步异常", error)
      }
    }

    // Refresh Token方法 - 企业级令牌刷新
    const refreshTokenMethod = async () => {
      if (!refreshToken.value) {
        throw new Error("No refresh token available")
      }

      try {
        isLoading.value = true
        const response = await apiService.getInstance().post("/connect/token", {
          grant_type: "refresh_token",
          refresh_token: refreshToken.value,
          client_id: "SmartAbp_App",
        }, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          }
        })

        if (response.status === 200) {
          const tokenData = response.data
          setToken(tokenData.access_token, tokenData.refresh_token)
          await fetchUserInfo()
          return true
        } else {
          throw new Error("Refresh token failed")
        }
      } catch (error) {
        clearAuth()
        throw error
      } finally {
        isLoading.value = false
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
    syncFromSmartAbp,
      refreshTokenMethod,
    }
  },
  {
    // 🗄️ 持久化配置
    // @ts-ignore - pinia-plugin-persistedstate的persist选项类型扩展
    persist: {
      key: 'smartabp-auth',
      storage: localStorage
      // paths参数在当前类型定义中不支持，由插件自动处理所有状态
    }
  },
)
