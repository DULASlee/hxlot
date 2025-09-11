import type { App, DirectiveBinding } from 'vue'
import { authService } from '@/utils/auth'

export const permissionDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const need = Array.isArray(binding.value) ? binding.value : [binding.value]
    const ok = need.some(p => authService.hasPermission(p))
    if (!ok) {
      el.style.display = 'none'
    }
  }
}

export function installPermissionDirective(app: App) {
  app.directive('permission', permissionDirective)
}
