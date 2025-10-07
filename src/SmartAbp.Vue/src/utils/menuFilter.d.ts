/**
 * 菜单权限过滤工具
 * 基于现有 AuthService 实现菜单权限检查和过滤
 * 完全兼容现有认证系统
 */
import type { MenuItem, MenuFilterOptions } from "@/types/menu";
/**
 * 菜单权限过滤器类
 * 扩展现有认证系统，提供菜单级别的权限控制
 */
export declare class MenuPermissionFilter {
    private readonly SUPER_ADMIN_USERS;
    constructor();
    /**
     * 检查用户是否为超级管理员
     */
    private isSuperAdmin;
    /**
     * 检查用户是否可以访问指定菜单项
     * 超级管理员拥有访问所有菜单的权限 (*)
     */
    canAccessMenuItem(menuItem: MenuItem, currentUser: any): boolean;
    /**
     * 过滤菜单列表，只保留用户有权限访问的菜单
     * 递归处理文件夹菜单的子菜单
     */
    filterMenus(menus: MenuItem[], currentUser: any, options?: MenuFilterOptions): MenuItem[];
    /**
     * 获取用户可访问的页面路径列表
     * 用于路由守卫检查
     */
    getAccessiblePaths(menus: MenuItem[], currentUser: any): string[];
    /**
     * 检查用户是否可以访问指定路径
     * 基于菜单权限配置
     */
    canAccessPath(path: string, menus: MenuItem[], currentUser: any): boolean;
    /**
     * 根据用户角色获取默认展开的菜单keys
     * 超级管理员默认展开所有可访问的文件夹菜单
     * 普通管理员展开大部分功能菜单
     * 普通用户只展开基础功能菜单
     */
    getDefaultExpandedMenuKeys(menus: MenuItem[], currentUser: any): string[];
    /**
     * 根据路径查找对应的菜单项
     * 用于路由变化时更新菜单状态
     */
    findMenuByPath(path: string, menus: MenuItem[]): MenuItem | null;
    /**
     * 查找菜单项的父菜单
     * 用于设置菜单激活状态
     */
    findParentMenu(menus: MenuItem[], targetKey: string): MenuItem | null;
    /**
     * 检查当前用户权限状态
     * 返回权限摘要信息，便于调试
     */
    /**
     * 检查当前用户权限状态
     * 返回权限摘要信息，便于调试
     */
    getPermissionSummary(currentUser: any): {
        isAuthenticated: boolean;
        user: any;
        roles: any;
        isSuperAdmin: boolean;
        isAdmin: any;
        isUser: any;
        hasSuperPermission: string;
    };
}
//# sourceMappingURL=menuFilter.d.ts.map
