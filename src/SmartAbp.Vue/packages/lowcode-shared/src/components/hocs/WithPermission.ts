/**
 * WithPermission 高阶组件
 * 为任何组件添加权限控制功能
 */

import { defineComponent, h, computed, type Component } from 'vue'
import type { BaseComponentProps } from '../../types/component-base'

/**
 * WithPermission Props扩展
 */
export interface WithPermissionProps extends BaseComponentProps {
  /**
   * 需要的权限（单个或多个）
   */
  permission?: string | string[]

  /**
   * 权限匹配模式
   * - 'any': 满足任一权限即可（OR）
   * - 'all': 必须满足所有权限（AND）
   */
  permissionMode?: 'any' | 'all'

  /**
   * 无权限时的行为
   * - 'hide': 隐藏组件
   * - 'disable': 禁用组件
   * - 'placeholder': 显示占位符
   */
  unauthorizedBehavior?: 'hide' | 'disable' | 'placeholder'

  /**
   * 无权限时的占位符组件
   */
  placeholderComponent?: Component

  /**
   * 无权限提示文本
   */
  unauthorizedMessage?: string

  /**
   * 权限检查函数（可自定义）
   */
  permissionChecker?: (permissions: string[]) => boolean
}

/**
 * 默认无权限占位符组件
 */
const DefaultPlaceholder = defineComponent({
  name: 'DefaultPlaceholder',
  props: {
    message: {
      type: String,
      default: '您没有访问权限'
    }
  },
  setup(props) {
    return () => h('div', { class: 'permission-placeholder' }, [
      h('i', { class: 'permission-icon' }, '🔒'),
      h('span', { class: 'permission-message' }, props.message)
    ])
  }
})

/**
 * WithPermission 高阶组件工厂函数
 * 
 * @param WrappedComponent 被包装的组件
 * @returns 增强后的组件
 * 
 * @example
 * ```typescript
 * import { WithPermission } from '@smartabp/lowcode-shared/components/hocs'
 * import AdminPanel from './AdminPanel.vue'
 * 
 * const SecureAdminPanel = WithPermission(AdminPanel)
 * ```
 * 
 * @example
 * ```vue
 * <template>
 *   <SecureAdminPanel
 *     :permission="['admin', 'superuser']"
 *     permission-mode="any"
 *     unauthorized-behavior="placeholder"
 *     unauthorized-message="仅管理员可访问"
 *   />
 * </template>
 * ```
 */
export function WithPermission<P extends BaseComponentProps>(
  WrappedComponent: Component
) {
  return defineComponent({
    name: `WithPermission(${(WrappedComponent as any).name || 'Component'})`,
    
    props: {
      permission: {
        type: [String, Array] as any,
        default: undefined
      },
      permissionMode: {
        type: String as () => 'any' | 'all',
        default: 'any'
      },
      unauthorizedBehavior: {
        type: String as () => 'hide' | 'disable' | 'placeholder',
        default: 'hide'
      },
      placeholderComponent: {
        type: Object as () => Component,
        default: undefined
      },
      unauthorizedMessage: {
        type: String,
        default: '您没有访问权限'
      },
      permissionChecker: {
        type: Function as unknown as () => (permissions: string[]) => boolean,
        default: undefined
      }
    },

    setup(props, { attrs, slots }) {
      /**
       * 检查是否有权限
       */
      const hasPermission = computed(() => {
        // 如果没有指定权限，默认允许访问
        if (!props.permission) {
          return true
        }

        const requiredPermissions = Array.isArray(props.permission) 
          ? props.permission 
          : [props.permission]

        // 使用自定义权限检查函数
        if (props.permissionChecker) {
          return props.permissionChecker(requiredPermissions)
        }

        // 默认权限检查逻辑（需要从外部注入实际的权限检查）
        // 这里只是示例，实际应该从 Pinia store 或其他状态管理中获取用户权限
        return defaultPermissionCheck(requiredPermissions, props.permissionMode)
      })

      return () => {
        // 如果有权限，正常渲染
        if (hasPermission.value) {
          return h(WrappedComponent, { ...attrs }, slots)
        }

        // 无权限时的处理
        switch (props.unauthorizedBehavior) {
          case 'hide':
            // 隐藏组件
            return null

          case 'disable':
            // 禁用组件
            return h(WrappedComponent, {
              ...attrs,
              disabled: true,
              title: props.unauthorizedMessage
            }, slots)

          case 'placeholder':
            // 显示占位符
            const PlaceholderComp = props.placeholderComponent || DefaultPlaceholder
            return h(PlaceholderComp, {
              message: props.unauthorizedMessage
            })

          default:
            return null
        }
      }
    }
  })
}

/**
 * 默认权限检查函数（示例）
 * 实际项目中应该替换为真实的权限检查逻辑
 */
function defaultPermissionCheck(requiredPermissions: string[], mode: 'any' | 'all'): boolean {
  // 这里应该从实际的用户权限存储中获取
  // 例如：const userPermissions = useAuthStore().permissions
  const userPermissions: string[] = []

  if (mode === 'any') {
    // 满足任一权限即可
    return requiredPermissions.some(perm => userPermissions.includes(perm))
  } else {
    // 必须满足所有权限
    return requiredPermissions.every(perm => userPermissions.includes(perm))
  }
}

/**
 * 权限管理组合式函数
 * 
 * @example
 * ```typescript
 * import { usePermission } from '@smartabp/lowcode-shared/components/hocs'
 * 
 * const { 
 *   hasPermission, 
 *   hasAnyPermission, 
 *   hasAllPermissions,
 *   checkPermission 
 * } = usePermission()
 * 
 * // 检查单个权限
 * if (hasPermission('admin')) {
 *   // 执行管理员操作
 * }
 * 
 * // 检查多个权限（任一）
 * if (hasAnyPermission(['admin', 'editor'])) {
 *   // 执行操作
 * }
 * ```
 */
export function usePermission() {
  /**
   * 获取用户权限列表
   * 这里应该从实际的权限存储中获取
   */
  const getUserPermissions = (): string[] => {
    // 实际项目中应该从 Pinia store 获取
    // 例如：return useAuthStore().permissions
    return []
  }

  /**
   * 检查单个权限
   */
  const hasPermission = (permission: string): boolean => {
    const userPermissions = getUserPermissions()
    return userPermissions.includes(permission)
  }

  /**
   * 检查是否有任一权限
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    const userPermissions = getUserPermissions()
    return permissions.some(perm => userPermissions.includes(perm))
  }

  /**
   * 检查是否有所有权限
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    const userPermissions = getUserPermissions()
    return permissions.every(perm => userPermissions.includes(perm))
  }

  /**
   * 通用权限检查
   */
  const checkPermission = (
    permissions: string | string[],
    mode: 'any' | 'all' = 'any'
  ): boolean => {
    const perms = Array.isArray(permissions) ? permissions : [permissions]
    return mode === 'any' 
      ? hasAnyPermission(perms) 
      : hasAllPermissions(perms)
  }

  /**
   * 权限指令（用于v-permission）
   */
  const permissionDirective = {
    mounted(el: HTMLElement, binding: any) {
      const { value, modifiers } = binding
      const permissions = Array.isArray(value) ? value : [value]
      const mode = modifiers.all ? 'all' : 'any'

      if (!checkPermission(permissions, mode)) {
        el.parentNode?.removeChild(el)
      }
    }
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkPermission,
    permissionDirective
  }
}
