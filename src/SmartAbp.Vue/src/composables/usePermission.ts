/**
 * 🔐 权限管理 Composable
 *
 * 简化版权限检查工具，用于代码生成器生成的页面
 */

import { useAuthStore } from '@/stores'
import { computed } from 'vue'

export interface PermissionOptions {
    /**
     * 所需权限列表（任一满足即可）
     */
    permissions?: string[]

    /**
     * 所需角色列表（任一满足即可）
     */
    roles?: string[]

    /**
     * 是否要求全部权限/角色
     */
    requireAll?: boolean
}

export function usePermission() {
    const authStore = useAuthStore()

    /**
     * 检查是否有指定权限
     */
    const hasPermission = (permission: string): boolean => {
        if (!authStore.isAuthenticated) {
            return false
        }

        // 管理员拥有所有权限
        if (authStore.userInfo?.roles?.includes('admin')) {
            return true
        }

        // 检查用户权限
        return authStore.userInfo?.permissions?.includes(permission) ?? false
    }

    /**
     * 检查是否有指定角色
     */
    const hasRole = (role: string): boolean => {
        if (!authStore.isAuthenticated) {
            return false
        }

        return authStore.userInfo?.roles?.includes(role) ?? false
    }

    /**
     * 检查是否有任一权限
     */
    const hasAnyPermission = (permissions: string[]): boolean => {
        if (!permissions || permissions.length === 0) {
            return true
        }

        return permissions.some(permission => hasPermission(permission))
    }

    /**
     * 检查是否有所有权限
     */
    const hasAllPermissions = (permissions: string[]): boolean => {
        if (!permissions || permissions.length === 0) {
            return true
        }

        return permissions.every(permission => hasPermission(permission))
    }

    /**
     * 检查是否有任一角色
     */
    const hasAnyRole = (roles: string[]): boolean => {
        if (!roles || roles.length === 0) {
            return true
        }

        return roles.some(role => hasRole(role))
    }

    /**
     * 检查是否有所有角色
     */
    const hasAllRoles = (roles: string[]): boolean => {
        if (!roles || roles.length === 0) {
            return true
        }

        return roles.every(role => hasRole(role))
    }

    /**
     * 通用权限检查
     */
    const can = (options: PermissionOptions): boolean => {
        const { permissions, roles, requireAll = false } = options

        // 检查权限
        if (permissions && permissions.length > 0) {
            const permissionCheck = requireAll
                ? hasAllPermissions(permissions)
                : hasAnyPermission(permissions)

            if (!permissionCheck) {
                return false
            }
        }

        // 检查角色
        if (roles && roles.length > 0) {
            const roleCheck = requireAll
                ? hasAllRoles(roles)
                : hasAnyRole(roles)

            if (!roleCheck) {
                return false
            }
        }

        return true
    }

    /**
     * 是否是管理员
     */
    const isAdmin = computed(() => {
        return authStore.userInfo?.roles?.includes('admin') ?? false
    })

    /**
     * 是否已认证
     */
    const isAuthenticated = computed(() => {
        return authStore.isAuthenticated
    })

    return {
        // 单一检查
        hasPermission,
        hasRole,

        // 批量检查
        hasAnyPermission,
        hasAllPermissions,
        hasAnyRole,
        hasAllRoles,

        // 通用检查
        can,

        // 状态
        isAdmin,
        isAuthenticated,
    }
}

