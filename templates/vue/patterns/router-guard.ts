import router from '@/router'
import { authService } from '@/utils/auth'

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(r => r.meta?.requiresAuth)
  if (!requiresAuth) return next()

  const valid = await authService.validateToken()
  if (!valid) return next({ name: 'Login', query: { redirect: to.fullPath } })

  const requiredRoles = (to.meta?.requiredRoles as string[] | undefined) || []
  if (requiredRoles.length > 0 && !requiredRoles.some(r => authService.hasRole(r))) {
    return next({ name: 'Dashboard' })
  }
  next()
})
