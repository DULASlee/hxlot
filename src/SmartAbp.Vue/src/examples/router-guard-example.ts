import router from "@/router"
// Router Guard Example - Updated to use Pinia Auth Store
import { useAuthStore } from "@/stores"

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

  const authStore = useAuthStore()
  const isValid = authStore.isAuthenticated
  if (!isValid) return next({ name: "Login", query: { redirect: to.fullPath } })

  // role-based sample
  const requiredRoles = (to.meta?.requiredRoles as string[] | undefined) || []
  if (requiredRoles.length > 0 && !requiredRoles.some((r) => authStore.hasRole(r))) {
    return next({ name: "Dashboard" })
  }
  next()
})
