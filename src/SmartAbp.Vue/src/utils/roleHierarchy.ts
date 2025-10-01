/**
 * 🏛️ 企业级角色层级系统
 * 
 * 角色继承关系：
 * admin (超级管理员) > manager (管理员) > user (普通用户) > guest (游客)
 * 
 * 规则：高级角色自动继承所有低级角色的权限
 * 
 * 🚨 开发阶段特殊处理：
 * 超级用户白名单（admin、admin666）在权限系统未完善前拥有所有权限
 */

/**
 * 🔑 超级用户白名单（开发/测试阶段）
 * 
 * ⚠️ 注意：这是临时开发措施，用于在权限系统未完善时方便开发和测试
 * 
 * TODO: 在权限系统完善后，应该移除此白名单机制，改用正常的权限验证
 */
const SUPER_USER_WHITELIST = ['admin', 'admin666']

/**
 * 角色定义
 */
export enum Role {
  /** 超级管理员 - 拥有所有权限 */
  ADMIN = 'admin',
  /** 管理员 - 拥有管理权限 */
  MANAGER = 'manager',
  /** 普通用户 - 基础业务权限 */
  USER = 'user',
  /** 游客 - 只读权限 */
  GUEST = 'guest'
}

/**
 * 角色层级权重（数值越大，权限越高）
 */
const ROLE_HIERARCHY: Record<string, number> = {
  [Role.ADMIN]: 100,
  [Role.MANAGER]: 50,
  [Role.USER]: 10,
  [Role.GUEST]: 0
}

/**
 * 获取角色权重
 */
function getRoleWeight(role: string): number {
  return ROLE_HIERARCHY[role.toLowerCase()] ?? -1
}

/**
 * 🔑 检查是否是超级用户（开发/测试阶段白名单）
 * 
 * @param username - 用户名
 * @returns 是否是超级用户
 * 
 * @example
 * isSuperUser('admin') // true
 * isSuperUser('admin666') // true
 * isSuperUser('normalUser') // false
 */
export function isSuperUser(username: string | undefined): boolean {
  if (!username) {
    return false
  }
  return SUPER_USER_WHITELIST.includes(username.toLowerCase())
}

/**
 * 🎯 检查用户是否拥有所需权限（支持角色继承）
 * 
 * @param userRoles - 用户拥有的角色列表
 * @param requiredRoles - 所需的角色列表（满足任一即可）
 * @returns 是否有权限
 * 
 * @example
 * // admin 访问需要 user 权限的页面
 * hasRolePermission(['admin'], ['user']) // true
 * 
 * // user 访问需要 admin 权限的页面
 * hasRolePermission(['user'], ['admin']) // false
 * 
 * // admin 和 manager 都可以访问
 * hasRolePermission(['manager'], ['admin', 'manager']) // true
 */
export function hasRolePermission(
  userRoles: string[],
  requiredRoles: string[]
): boolean {
  // 没有角色限制，直接通过
  if (!requiredRoles || requiredRoles.length === 0) {
    return true
  }

  // 没有用户角色，拒绝访问
  if (!userRoles || userRoles.length === 0) {
    return false
  }

  // 计算用户的最高角色权重
  const userMaxWeight = Math.max(
    ...userRoles.map(role => getRoleWeight(role))
  )

  // 计算所需的最低角色权重
  const requiredMinWeight = Math.min(
    ...requiredRoles.map(role => getRoleWeight(role))
  )

  // 用户最高权重 >= 所需最低权重，则通过
  return userMaxWeight >= requiredMinWeight
}

/**
 * 🔍 检查用户是否拥有指定角色（精确匹配）
 */
export function hasExactRole(userRoles: string[], role: string): boolean {
  return userRoles.some(r => r.toLowerCase() === role.toLowerCase())
}

/**
 * 🏆 检查用户是否是管理员（admin 或 manager）
 */
export function isAdmin(userRoles: string[]): boolean {
  return hasExactRole(userRoles, Role.ADMIN) || 
         hasExactRole(userRoles, Role.MANAGER)
}

/**
 * 👑 检查用户是否是超级管理员
 */
export function isSuperAdmin(userRoles: string[]): boolean {
  return hasExactRole(userRoles, Role.ADMIN)
}

/**
 * 📊 获取用户的最高角色
 */
export function getHighestRole(userRoles: string[]): string | null {
  if (!userRoles || userRoles.length === 0) {
    return null
  }

  return userRoles.reduce((highest, current) => {
    return getRoleWeight(current) > getRoleWeight(highest) ? current : highest
  })
}

/**
 * 🎯 获取角色显示名称
 */
export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    [Role.ADMIN]: '超级管理员',
    [Role.MANAGER]: '管理员',
    [Role.USER]: '普通用户',
    [Role.GUEST]: '游客'
  }
  
  return roleNames[role.toLowerCase()] || role
}

