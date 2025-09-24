import type { App, DirectiveBinding } from "vue"
// Permission Directive Example - Updated to use Pinia Auth Store
import { useAuthStore } from "@/stores"

export function checkPermissions(permissions: string[]) {
  const authStore = useAuthStore()
  const need = Array.isArray(permissions) ? permissions : [permissions]

  // Placeholder: integrate with actual permission system when available
  const ok = need.some((_p) => authStore.isAuthenticated)
  return ok
}

export const permissionDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const need = Array.isArray(binding.value) ? binding.value : [binding.value]
    const ok = checkPermissions(need)
    if (!ok) {
      el.style.display = "none"
    }
  },
}

export function installPermissionDirective(app: App) {
  app.directive("permission", permissionDirective)
}
