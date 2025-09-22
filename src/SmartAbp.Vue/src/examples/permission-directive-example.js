import { authService } from "@/utils/auth";
export const permissionDirective = {
    mounted(el, binding) {
        const need = Array.isArray(binding.value) ? binding.value : [binding.value];
        const ok = need.some((p) => authService.hasPermission(p));
        if (!ok) {
            el.style.display = "none";
        }
    },
};
export function installPermissionDirective(app) {
    app.directive("permission", permissionDirective);
}
