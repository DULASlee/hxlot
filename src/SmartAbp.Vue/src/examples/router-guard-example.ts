import router from "@/router"
// Router Guard Example - Updated to use Pinia Auth Store
import { useAuthStore } from "@/stores"

// 临时AuthService模拟，保持示例功能完整
const authService = {
  validateToken: async () => {
    const authStore = useAuthStore()
    return authStore.isAuthenticated
  },
  hasRole: (role: string) => {
    const authStore = useAuthStore()
    return authStore.userInfo?.roles?.includes(role) || false
  }
}

export async function authGuard(requiredRoles: string[] = []) {
  const authStore = useAuthStore()

  const valid = authStore.isAuthenticated
  if (!valid) {
    return false
  }

  if (requiredRoles.length > 0 && !requiredRoles.some((_r) => authStore.isAuthenticated)) {
    return false
  }

  return true
}

// Minimal guard example for reference
router.beforeEach(async (to, _from, next) => {
  const requiresAuth = to.matched.some((r) => r.meta?.requiresAuth)
  if (!requiresAuth) return next()

  const valid = await authService.validateToken()
  if (!valid) return next({ name: "Login", query: { redirect: to.fullPath } })

  // role-based sample
  const requiredRoles = (to.meta?.requiredRoles as string[] | undefined) || []
  if (requiredRoles.length > 0 && !requiredRoles.some((r) => authService.hasRole(r))) {
    return next({ name: "Dashboard" })
  }
  next()
})
