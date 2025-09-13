import { defineStore } from "pinia"
import { ref, computed } from "vue"

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

export const useAuthStore = defineStore("auth", () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem("access_token") || localStorage.getItem("smartabp_token"))
  const refreshToken = ref<string | null>(localStorage.getItem("refresh_token") || localStorage.getItem("smartabp_refresh_token"))
  const userInfo = ref<UserInfo | null>(null)
  const isLoading = ref(false)

  // 初始化时尝试从本地存储恢复用户信息
  const initializeFromStorage = () => {
    const storedUser = localStorage.getItem("smartabp_user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        userInfo.value = {
          id: user.id,
          username: user.userName || user.username,
          email: user.email,
          roles: user.roles || ["user"] // 默认角色
        }
      } catch (error) {
        console.error("解析存储用户信息失败:", error)
      }
    }
  }

  // 计算属性
  const isAuthenticated = computed(() => {
    // 检查token或从smartabp认证系统获取状态
    const hasToken = !!token.value
    const hasStoredToken = !!localStorage.getItem("smartabp_token")
    const hasUserInfo = !!userInfo.value
    return hasToken || (hasStoredToken && hasUserInfo)
  })
  const hasRole = computed(() => (role: string) => {
    return userInfo.value?.roles?.includes(role) ?? false
  })

  // 方法
  const setToken = (accessToken: string, refreshTokenValue?: string) => {
    token.value = accessToken
    localStorage.setItem("access_token", accessToken)

    if (refreshTokenValue) {
      refreshToken.value = refreshTokenValue
      localStorage.setItem("refresh_token", refreshTokenValue)
    }
  }

  const setUserInfo = (user: UserInfo) => {
    userInfo.value = user
  }

  const clearAuth = () => {
    token.value = null
    refreshToken.value = null
    userInfo.value = null
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  }

  const getAuthHeader = () => {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      isLoading.value = true

      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (credentials.username === "admin" && credentials.password === "1q2w3E*") {
        const mockToken = "mock-jwt-token-" + Date.now()
        const mockUser: UserInfo = {
          id: "1",
          username: credentials.username,
          email: "admin@example.com",
          roles: ["admin"],
        }

        setToken(mockToken)
        setUserInfo(mockUser)

        return { success: true, user: mockUser, token: mockToken }
      } else {
        throw new Error("用户名或密码错误")
      }
    } catch (err) {
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    clearAuth()
    // 同时清理smartabp认证系统的存储
    localStorage.removeItem("smartabp_token")
    localStorage.removeItem("smartabp_user")
    localStorage.removeItem("smartabp_refresh_token")
  }

  // 初始化认证状态
  const initialize = () => {
    initializeFromStorage()

    // 监听localStorage变化，实现多标签页同步
    window.addEventListener("storage", (event) => {
      if (event.key === "smartabp_token" || event.key === "access_token") {
        if (event.newValue) {
          token.value = event.newValue
        } else {
          logout()
        }
      } else if (event.key === "smartabp_user") {
        if (event.newValue) {
          try {
            const user = JSON.parse(event.newValue)
            userInfo.value = {
              id: user.id,
              username: user.userName || user.username,
              email: user.email,
              roles: user.roles || ["user"]
            }
          } catch (error) {
            console.error("解析用户信息失败:", error)
          }
        }
      }
    })
  }

  // 兼容smartabp认证系统的登录方法
  const syncFromSmartAbp = () => {
    const smartabpToken = localStorage.getItem("smartabp_token")
    const smartabpUser = localStorage.getItem("smartabp_user")

    if (smartabpToken && smartabpUser) {
      token.value = smartabpToken
      try {
        const user = JSON.parse(smartabpUser)
        userInfo.value = {
          id: user.id,
          username: user.userName || user.username,
          email: user.email,
          roles: user.roles || ["user"]
        }
        console.log("✅ 已同步SmartAbp认证状态:", userInfo.value)
      } catch (error) {
        console.error("同步用户信息失败:", error)
      }
    }
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
    logout,
    initialize,
    syncFromSmartAbp,
  }
})
