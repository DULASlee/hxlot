/**
 * 菜单权限过滤工具
 * 基于现有 AuthService 实现菜单权限检查和过滤
 * 完全兼容现有认证系统
 */

import type { MenuItem, MenuFilterOptions } from "@/types/menu"

/**
 * 菜单权限过滤器类
 * 扩展现有认证系统，提供菜单级别的权限控制
 */
export class MenuPermissionFilter {
  // 超级管理员用户名列表
  private readonly SUPER_ADMIN_USERS = ["admin", "admin666"]

  constructor() {
    // 不再依赖AuthService，直接使用authStore
  }

  /**
   * 检查用户是否为超级管理员
   */
  private isSuperAdmin(currentUser: any): boolean {
    if (!currentUser) {
      return false
    }

    const username = currentUser?.userName || ""
    return this.SUPER_ADMIN_USERS.includes(username)
  }

  /**
   * 检查用户是否可以访问指定菜单项
   * 超级管理员拥有访问所有菜单的权限 (*)
   */
  canAccessMenuItem(menuItem: MenuItem, currentUser: any): boolean {
    // 超级管理员拥有所有权限 (*)
    if (this.isSuperAdmin(currentUser)) {
      // 超级管理员只需要菜单可见即可
      return menuItem.visible
    }

    // 检查菜单是否可见
    if (!menuItem.visible) {
      return false
    }

    // 如果没有角色要求，默认允许访问
    if (!menuItem.requiredRoles || menuItem.requiredRoles.length === 0) {
      return true
    }

    // 检查用户是否拥有所需角色中的任意一个
    const userRoles = currentUser?.roles || []
    return menuItem.requiredRoles.some((role) => userRoles.includes(role))
  }

  /**
   * 过滤菜单列表，只保留用户有权限访问的菜单
   * 递归处理文件夹菜单的子菜单
   */
  filterMenus(menus: MenuItem[], currentUser: any, options: MenuFilterOptions = {}): MenuItem[] {
    const { filterHidden = true, filterPermissions = true, customFilter } = options

    return (
      menus
        .filter((menu) => {
          // 应用自定义过滤器
          if (customFilter && !customFilter(menu)) {
            return false
          }

          // 过滤隐藏菜单
          if (filterHidden && !menu.visible) {
            return false
          }

          // 过滤权限
          if (filterPermissions && !this.canAccessMenuItem(menu, currentUser)) {
            return false
          }

          return true
        })
        .map((menu) => {
          // 递归过滤子菜单
          if (menu.type === "folder" && menu.children) {
            const filteredChildren = this.filterMenus(menu.children, currentUser, options)
            return {
              ...menu,
              children: filteredChildren,
            }
          }
          return menu
        })
        .filter((menu) => {
          // 如果文件夹菜单没有可访问的子菜单，则过滤掉该文件夹
          if (menu.type === "folder" && menu.children) {
            return menu.children.length > 0
          }
          return true
        })
        // 按order排序
        .sort((a, b) => a.order - b.order)
    )
  }

  /**
   * 获取用户可访问的页面路径列表
   * 用于路由守卫检查
   */
  getAccessiblePaths(menus: MenuItem[], currentUser: any): string[] {
    const paths: string[] = []

    const extractPaths = (menuItems: MenuItem[]) => {
      menuItems.forEach((menu) => {
        if (this.canAccessMenuItem(menu, currentUser)) {
          if (menu.type === "page") {
            paths.push(menu.path)
          } else if (menu.type === "folder" && menu.children) {
            extractPaths(menu.children)
          }
        }
      })
    }

    extractPaths(menus)
    return paths
  }

  /**
   * 检查用户是否可以访问指定路径
   * 基于菜单权限配置
   */
  canAccessPath(path: string, menus: MenuItem[], currentUser: any): boolean {
    const accessiblePaths = this.getAccessiblePaths(menus, currentUser)
    return accessiblePaths.includes(path)
  }

  /**
   * 根据用户角色获取默认展开的菜单keys
   * 超级管理员默认展开所有可访问的文件夹菜单
   * 普通管理员展开大部分功能菜单
   * 普通用户只展开基础功能菜单
   */
  getDefaultExpandedMenuKeys(menus: MenuItem[], currentUser: any): string[] {
    const expandedKeys: string[] = []
    const isSuperAdmin = this.isSuperAdmin(currentUser)
    const userRoles = currentUser?.roles || []
    const isAdmin = userRoles.includes("admin")

    const collectExpandedKeys = (menuItems: MenuItem[]) => {
      menuItems.forEach((menu) => {
        if (menu.type === "folder" && this.canAccessMenuItem(menu, currentUser)) {
          // 超级管理员展开所有可访问的文件夹
          if (isSuperAdmin) {
            expandedKeys.push(menu.key)
          }
          // 普通管理员展开所有可访问的文件夹
          else if (isAdmin) {
            expandedKeys.push(menu.key)
          }
          // 普通用户只展开明确标记为默认展开的文件夹
          else if (menu.defaultExpanded) {
            expandedKeys.push(menu.key)
          }

          if (menu.children) {
            collectExpandedKeys(menu.children)
          }
        }
      })
    }

    collectExpandedKeys(menus)
    return expandedKeys
  }

  /**
   * 根据路径查找对应的菜单项
   * 用于路由变化时更新菜单状态
   */
  findMenuByPath(path: string, menus: MenuItem[]): MenuItem | null {
    const findInMenus = (menuItems: MenuItem[]): MenuItem | null => {
      for (const menu of menuItems) {
        if (menu.type === "page" && menu.path === path) {
          return menu
        }
        if (menu.type === "folder" && menu.children) {
          const found = findInMenus(menu.children)
          if (found) return found
        }
      }
      return null
    }

    return findInMenus(menus)
  }

  /**
   * 查找菜单项的父菜单
   * 用于设置菜单激活状态
   */
  findParentMenu(menus: MenuItem[], targetKey: string): MenuItem | null {
    for (const menu of menus) {
      if (menu.type === "folder" && menu.children) {
        const found = menu.children.find((child) => child.key === targetKey)
        if (found) {
          return menu
        }
        const parentFound = this.findParentMenu(menu.children, targetKey)
        if (parentFound) return parentFound
      }
    }
    return null
  }

  /**
   * 检查当前用户权限状态
   * 返回权限摘要信息，便于调试
   */
  /**
   * 检查当前用户权限状态
   * 返回权限摘要信息，便于调试
   */
  getPermissionSummary(currentUser: any) {
    const isAuthenticated = !!currentUser
    const isSuperAdmin = this.isSuperAdmin(currentUser)

    return {
      isAuthenticated,
      user: currentUser,
      roles: currentUser?.roles || [],
      isSuperAdmin,
      isAdmin: currentUser ? (currentUser.roles || []).includes("admin") : false,
      isUser: currentUser ? (currentUser.roles || []).includes("user") : false,
      hasSuperPermission: isSuperAdmin ? "*" : "limited", // * 表示所有权限
    }
  }
}
