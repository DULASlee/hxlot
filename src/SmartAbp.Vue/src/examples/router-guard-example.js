import router from "@/router";
// Router Guard Example - Updated to use Pinia Auth Store
import { useAuthStore } from "@/stores";
// 临时AuthService模拟，保持示例功能完整
const authService = {
    validateToken: async () => {
        const authStore = useAuthStore();
        return authStore.isAuthenticated;
    },
    hasRole: (role) => {
        const authStore = useAuthStore();
        return authStore.userInfo?.roles?.includes(role) || false;
    }
};
export async function authGuard(requiredRoles = []) {
    const authStore = useAuthStore();
    const valid = authStore.isAuthenticated;
    if (!valid) {
        return false;
    }
    if (requiredRoles.length > 0 && !requiredRoles.some((role) => authStore.userInfo?.roles?.includes(role))) {
        return false;
    }
    return true;
}
// Minimal guard example for reference - 使用企业级认证服务
router.beforeEach(async (to, _from, next) => {
    const requiresAuth = to.matched.some((r) => r.meta?.requiresAuth);
    if (!requiresAuth)
        return next();
    // 优先使用企业级authService，回退到直接store访问
    const isValid = await authService.validateToken();
    if (!isValid)
        return next({ name: "Login", query: { redirect: to.fullPath } });
    // role-based sample - 使用authService进行权限检查
    const requiredRoles = to.meta?.requiredRoles || [];
    if (requiredRoles.length > 0 && !requiredRoles.some((r) => authService.hasRole(r))) {
        return next({ name: "Dashboard" });
    }
    next();
});
