import { computed } from "vue"
import { useAuthStore } from "@/stores/modules/auth"

export interface LoginCredentials {
  username: string
  password: string
  tenantName?: string
}

export function useAuth() {
  const store = useAuthStore()

  const isAuthenticated = computed(() => store.isAuthenticated)
  const isLoading = computed(() => store.isLoading)
  const user = computed(() => store.userInfo)
  const token = computed(() => store.token)

  const login = async (credentials: LoginCredentials) => {
    return await store.login(credentials)
  }

  const logout = () => {
    store.logout()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const hasPermission = (_permission: string): boolean => {
    // Placeholder: integrate when permission store is available
    return true
  }

  const hasRole = (role: string) => {
    return store.hasRole(role)
  }

  const getAuthHeader = () => {
    return store.getAuthHeader()
  }

  const refreshToken = async () => {
    // Delegated to ApiService interceptor; return true for API compatibility
    return true
  }

  const validateToken = async () => {
    // Optionally call a ping endpoint; assume valid if token exists
    return !!token.value
  }

  return {
    isAuthenticated,
    isLoading,
    user,
    token,
    login,
    logout,
    hasPermission,
    hasRole,
    getAuthHeader,
    refreshToken,
    validateToken,
  }
}

export default useAuth
