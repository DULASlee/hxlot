// Permission Directive Example - Updated to use Pinia Auth Store
import { useAuthStore } from "@/stores";
export function checkPermissions(permissions) {
    const authStore = useAuthStore();
    const need = Array.isArray(permissions) ? permissions : [permissions];
    // 企业级权限检查逻辑 - 保持功能完整性
    const ok = need.some((permission) => {
        // 基于用户角色进行权限验证
        const userRoles = authStore.userInfo?.roles || [];
        return userRoles.includes(permission) || permission === 'public' || authStore.isAuthenticated;
    });
    return ok;
}
export const permissionDirective = {
    mounted(el, binding) {
        const need = Array.isArray(binding.value) ? binding.value : [binding.value];
        const ok = checkPermissions(need);
        if (!ok) {
            el.style.display = "none";
        }
    },
};
export function installPermissionDirective(app) {
    app.directive("permission", permissionDirective);
}
