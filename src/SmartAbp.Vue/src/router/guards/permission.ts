/**
 * 权限路由守卫
 * 基于角色和菜单权限的路由访问控制
 */

import type { RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores'
import { useMenuPermission } from '@/composables/useMenuPermission'
import { logger } from '@/utils/logger'
import { ElMessage } from 'element-plus'
import { i18n } from '@/plugins/i18n'

/**
 * 权限守卫 - 检查用户是否有权限访问路由
 */
export const permissionGuard = async (to: RouteLocationNormalized) => {
  const authStore = useAuthStore()
  const menuPermission = useMenuPermission()

  // 1. 检查登录状态
  if (!authStore.isAuthenticated) {
    logger.debug('[权限守卫] 用户未登录，重定向到登录页')
    return { 
      name: 'Login', 
      query: { redirect: to.fullPath } 
    }
  }

  // 2. 检查路由元信息中的角色权限（支持角色层级继承）
  const requiredRoles = to.meta.requiredRoles as string[] | undefined
  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = authStore.userInfo?.roles || []
    
    // 🏛️ 使用角色层级系统检查权限（admin > manager > user > guest）
    const { hasRolePermission, getHighestRole } = await import('@/utils/roleHierarchy')
    const hasPermission = hasRolePermission(userRoles, requiredRoles)
    
    if (!hasPermission) {
      const highestRole = getHighestRole(userRoles)
      logger.warn(
        `[权限守卫] 用户权限不足 - 需要角色: ${requiredRoles.join(', ')}, 用户最高角色: ${highestRole}, 所有角色: ${userRoles.join(', ')}`
      )
      
      ElMessage.warning({
        message: i18n.global.t('permission.noAccess') || '您的权限不足，无法访问此页面',
        duration: 3000,
        showClose: true
      })
      
      // 权限不足时重定向到403页面，避免重定向循环
      return { name: 'Forbidden' }
    }
    
    logger.debug(`[权限守卫] 角色权限检查通过 - 用户角色: ${userRoles.join(', ')}, 需要角色: ${requiredRoles.join(', ')}`)
  }

  // 3. 检查菜单权限（如果路由关联了菜单）
  const menuKey = to.meta.menuKey as string | undefined
  if (menuKey) {
    const hasMenuAccess = menuPermission.hasMenuPermission(menuKey)
    
    if (!hasMenuAccess) {
      logger.warn(`[权限守卫] 菜单权限不足 - 菜单key: ${menuKey}`)
      
      ElMessage.warning({
        message: '您没有权限访问此功能',
        duration: 3000,
        showClose: true
      })
      
      return { name: 'Dashboard' }
    }
    
    logger.debug(`[权限守卫] 菜单权限检查通过 - 菜单key: ${menuKey}`)
  }

  // 4. 检查路径权限
  const hasPathAccess = menuPermission.hasPathPermission(to.path)
  if (!hasPathAccess) {
    logger.warn(`[权限守卫] 路径权限不足 - 路径: ${to.path}`)
    
    ElMessage.warning({
      message: '您没有权限访问此页面',
      duration: 3000,
      showClose: true
    })
    
    return { name: 'Dashboard' }
  }

  // 所有权限检查通过
  logger.debug(`[权限守卫] 权限检查通过 - 允许访问: ${to.path}`)
  return true
}

/**
 * 角色守卫 - 简化的角色检查（支持角色层级继承）
 */
export const roleGuard = (requiredRoles: string[]) => {
  return async (_to: RouteLocationNormalized) => {
    const authStore = useAuthStore()
    const userRoles = authStore.userInfo?.roles || []
    
    // 🏛️ 使用角色层级系统检查权限
    const { hasRolePermission, getHighestRole } = await import('@/utils/roleHierarchy')
    const hasPermission = hasRolePermission(userRoles, requiredRoles)
    
    if (!hasPermission) {
      const highestRole = getHighestRole(userRoles)
      logger.warn(
        `[角色守卫] 权限不足 - 需要: ${requiredRoles.join(', ')}, 用户最高角色: ${highestRole}`
      )
      return { name: 'Forbidden' }
    }
    
    return true
  }
}

/**
 * 管理员守卫 - 仅管理员可访问（admin 或 manager）
 */
export const adminGuard = async (_to: RouteLocationNormalized) => {
  const authStore = useAuthStore()
  const userRoles = authStore.userInfo?.roles || []
  
  // 🏛️ 使用角色层级系统检查管理员权限
  const { isAdmin, getHighestRole } = await import('@/utils/roleHierarchy')
  
  if (!isAdmin(userRoles)) {
    const highestRole = getHighestRole(userRoles)
    logger.warn(
      `[管理员守卫] 非管理员尝试访问管理页面 - 用户最高角色: ${highestRole}`
    )
    
    ElMessage.warning({
      message: '仅管理员可访问此页面',
      duration: 3000,
      showClose: true
    })
    
    return { name: 'Forbidden' }
  }
  
  return true
}
