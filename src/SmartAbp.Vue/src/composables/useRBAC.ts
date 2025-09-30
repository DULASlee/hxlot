/**
 * RBAC权限组合函数
 * 提供基于角色的访问控制功能
 */

import { computed } from 'vue'
import { useAuthStore } from '@/stores'
import { rbacService, type RBACUser, type Permission } from '@/auth/rbac'

export function useRBAC() {
  const authStore = useAuthStore()

  /**
   * 将AuthStore的用户信息转换为RBACUser
   */
  const rbacUser = computed<RBACUser | null>(() => {
    const userInfo = authStore.userInfo
    if (!userInfo) return null

    // 将简单的角色字符串数组转换为完整的Role对象
    const roles = (userInfo.roles || []).map(roleCode => ({
      id: roleCode,
      name: roleCode,
      code: roleCode,
      permissions: [] // 实际项目中应该从后端获取
    }))

    return {
      id: userInfo.id || '',
      username: userInfo.userName || '', // AuthStore使用userName而不是username
      roles
    }
  })

  /**
   * 检查用户是否有指定权限
   */
  const hasPermission = (permissionCode: string): boolean => {
    if (!rbacUser.value) return false
    return rbacService.hasPermission(rbacUser.value, permissionCode)
  }

  /**
   * 检查用户是否有指定角色
   */
  const hasRole = (roleCode: string): boolean => {
    if (!rbacUser.value) return false
    return rbacService.hasRole(rbacUser.value, roleCode)
  }

  /**
   * 检查用户是否有任一指定权限
   */
  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    if (!rbacUser.value) return false
    return rbacService.hasAnyPermission(rbacUser.value, permissionCodes)
  }

  /**
   * 检查用户是否有所有指定权限
   */
  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    if (!rbacUser.value) return false
    return rbacService.hasAllPermissions(rbacUser.value, permissionCodes)
  }

  /**
   * 检查用户是否有任一指定角色
   */
  const hasAnyRole = (roleCodes: string[]): boolean => {
    if (!rbacUser.value) return false
    return rbacService.hasAnyRole(rbacUser.value, roleCodes)
  }

  /**
   * 检查用户是否有所有指定角色
   */
  const hasAllRoles = (roleCodes: string[]): boolean => {
    if (!rbacUser.value) return false
    return rbacService.hasAllRoles(rbacUser.value, roleCodes)
  }

  /**
   * 检查用户是否有访问资源的权限
   */
  const canAccessResource = (resource: string, action: string = 'read'): boolean => {
    if (!rbacUser.value) return false
    return rbacService.canAccessResource(rbacUser.value, resource, action)
  }

  /**
   * 获取用户的所有权限
   */
  const userPermissions = computed<Permission[]>(() => {
    if (!rbacUser.value) return []
    return rbacService.getUserPermissions(rbacUser.value)
  })

  /**
   * 获取用户的所有权限编码
   */
  const userPermissionCodes = computed<string[]>(() => {
    if (!rbacUser.value) return []
    return rbacService.getUserPermissionCodes(rbacUser.value)
  })

  /**
   * 获取用户的所有角色编码
   */
  const userRoleCodes = computed<string[]>(() => {
    if (!rbacUser.value) return []
    return rbacService.getUserRoleCodes(rbacUser.value)
  })

  /**
   * 检查用户是否是管理员
   */
  const isAdmin = computed(() => {
    if (!rbacUser.value) return false
    return rbacService.isAdmin(rbacUser.value)
  })

  /**
   * 检查用户是否是超级管理员
   */
  const isSuperAdmin = computed(() => {
    if (!rbacUser.value) return false
    return rbacService.isSuperAdmin(rbacUser.value)
  })

  /**
   * 过滤有权限的项目列表
   */
  const filterByPermission = <T extends { requiredPermission?: string }>(
    items: T[]
  ): T[] => {
    if (!rbacUser.value) return []
    return rbacService.filterByPermission(items, rbacUser.value)
  }

  /**
   * 过滤有角色的项目列表
   */
  const filterByRole = <T extends { requiredRole?: string }>(
    items: T[]
  ): T[] => {
    if (!rbacUser.value) return []
    return rbacService.filterByRole(items, rbacUser.value)
  }

  return {
    // 用户信息
    rbacUser,
    userPermissions,
    userPermissionCodes,
    userRoleCodes,
    
    // 权限检查
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // 角色检查
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // 资源访问
    canAccessResource,
    
    // 管理员检查
    isAdmin,
    isSuperAdmin,
    
    // 过滤函数
    filterByPermission,
    filterByRole
  }
}
