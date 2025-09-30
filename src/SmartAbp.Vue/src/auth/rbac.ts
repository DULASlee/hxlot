/**
 * RBAC (Role-Based Access Control) 权限系统
 * 基于角色的访问控制模型
 */

/**
 * 权限类型
 */
export type PermissionType = 'menu' | 'button' | 'api' | 'data'

/**
 * 权限接口
 */
export interface Permission {
  /**
   * 权限ID
   */
  id: string

  /**
   * 权限名称
   */
  name: string

  /**
   * 权限编码
   */
  code: string

  /**
   * 权限类型
   */
  type: PermissionType

  /**
   * 资源标识
   */
  resource: string

  /**
   * 操作动作 (如: read, write, delete)
   */
  action?: string

  /**
   * 描述
   */
  description?: string
}

/**
 * 角色接口
 */
export interface Role {
  /**
   * 角色ID
   */
  id: string

  /**
   * 角色名称
   */
  name: string

  /**
   * 角色编码
   */
  code: string

  /**
   * 角色权限列表
   */
  permissions: Permission[]

  /**
   * 描述
   */
  description?: string

  /**
   * 是否内置角色
   */
  builtin?: boolean
}

/**
 * 用户接口（RBAC视角）
 */
export interface RBACUser {
  /**
   * 用户ID
   */
  id: string

  /**
   * 用户名
   */
  username: string

  /**
   * 用户角色列表
   */
  roles: Role[]
}

/**
 * RBAC服务类
 */
export class RBACService {
  /**
   * 检查用户是否有指定权限
   */
  hasPermission(user: RBACUser, permissionCode: string): boolean {
    return user.roles.some(role =>
      role.permissions.some(p => p.code === permissionCode)
    )
  }

  /**
   * 检查用户是否有指定角色
   */
  hasRole(user: RBACUser, roleCode: string): boolean {
    return user.roles.some(role => role.code === roleCode)
  }

  /**
   * 检查用户是否有任一指定权限
   */
  hasAnyPermission(user: RBACUser, permissionCodes: string[]): boolean {
    return permissionCodes.some(code => this.hasPermission(user, code))
  }

  /**
   * 检查用户是否有所有指定权限
   */
  hasAllPermissions(user: RBACUser, permissionCodes: string[]): boolean {
    return permissionCodes.every(code => this.hasPermission(user, code))
  }

  /**
   * 检查用户是否有任一指定角色
   */
  hasAnyRole(user: RBACUser, roleCodes: string[]): boolean {
    return roleCodes.some(code => this.hasRole(user, code))
  }

  /**
   * 检查用户是否有所有指定角色
   */
  hasAllRoles(user: RBACUser, roleCodes: string[]): boolean {
    return roleCodes.every(code => this.hasRole(user, code))
  }

  /**
   * 获取用户的所有权限
   */
  getUserPermissions(user: RBACUser): Permission[] {
    const permissions: Permission[] = []
    const seen = new Set<string>()

    user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        if (!seen.has(permission.code)) {
          permissions.push(permission)
          seen.add(permission.code)
        }
      })
    })

    return permissions
  }

  /**
   * 获取用户的所有权限编码
   */
  getUserPermissionCodes(user: RBACUser): string[] {
    return this.getUserPermissions(user).map(p => p.code)
  }

  /**
   * 获取用户的所有角色编码
   */
  getUserRoleCodes(user: RBACUser): string[] {
    return user.roles.map(r => r.code)
  }

  /**
   * 检查用户是否有访问资源的权限
   */
  canAccessResource(
    user: RBACUser,
    resource: string,
    action: string = 'read'
  ): boolean {
    return user.roles.some(role =>
      role.permissions.some(
        p => p.resource === resource && 
        (p.action === action || p.action === '*')
      )
    )
  }

  /**
   * 检查用户是否是管理员
   */
  isAdmin(user: RBACUser): boolean {
    return this.hasRole(user, 'admin')
  }

  /**
   * 检查用户是否是超级管理员
   */
  isSuperAdmin(user: RBACUser): boolean {
    return this.hasRole(user, 'superadmin')
  }

  /**
   * 过滤用户有权限的项目列表
   */
  filterByPermission<T extends { requiredPermission?: string }>(
    items: T[],
    user: RBACUser
  ): T[] {
    return items.filter(item => {
      if (!item.requiredPermission) return true
      return this.hasPermission(user, item.requiredPermission)
    })
  }

  /**
   * 过滤用户有角色的项目列表
   */
  filterByRole<T extends { requiredRole?: string }>(
    items: T[],
    user: RBACUser
  ): T[] {
    return items.filter(item => {
      if (!item.requiredRole) return true
      return this.hasRole(user, item.requiredRole)
    })
  }
}

// 导出单例
export const rbacService = new RBACService()

/**
 * 权限检查装饰器（用于方法）
 */
export function RequirePermission(permissionCode: string) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const user = (this as any).user as RBACUser
      if (!rbacService.hasPermission(user, permissionCode)) {
        throw new Error(`Permission denied: ${permissionCode}`)
      }
      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

/**
 * 角色检查装饰器（用于方法）
 */
export function RequireRole(roleCode: string) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const user = (this as any).user as RBACUser
      if (!rbacService.hasRole(user, roleCode)) {
        throw new Error(`Role required: ${roleCode}`)
      }
      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}
