/**
 * 菜单权限组合函数
 * 提供菜单权限检查和访问控制功能
 */
import { computed } from 'vue';
import { useAuthStore } from '@/stores';
import { MenuRegistry } from '@/utils/menuRegistry';
export function useMenuPermission() {
    const authStore = useAuthStore();
    const menuRegistry = MenuRegistry.getInstance();
    /**
     * 获取用户可访问的菜单（根据角色过滤）
     */
    const accessibleMenus = computed(() => {
        const roles = authStore.userInfo?.roles || [];
        return menuRegistry.filterByRoles(roles);
    });
    /**
     * 获取扁平的所有可访问菜单
     */
    const flatAccessibleMenus = computed(() => {
        const roles = authStore.userInfo?.roles || [];
        const allMenus = menuRegistry.getAll();
        return allMenus.filter(menu => {
            // 检查可见性
            if (!menu.visible)
                return false;
            // 检查角色权限
            if (!menu.requiredRoles || menu.requiredRoles.length === 0) {
                return true;
            }
            return menu.requiredRoles.some(role => roles.includes(role));
        });
    });
    /**
     * 检查用户是否有访问指定菜单的权限
     */
    const hasMenuPermission = (menuKey) => {
        const menu = menuRegistry.get(menuKey);
        if (!menu)
            return false;
        // 检查可见性
        if (!menu.visible)
            return false;
        // 检查角色权限
        const roles = authStore.userInfo?.roles || [];
        if (!menu.requiredRoles || menu.requiredRoles.length === 0) {
            return true;
        }
        return menu.requiredRoles.some(role => roles.includes(role));
    };
    /**
     * 检查用户是否有访问指定路径的权限
     */
    const hasPathPermission = (path) => {
        const menu = menuRegistry.findByPath(path);
        if (!menu)
            return true; // 没有配置菜单的路径默认允许访问
        return hasMenuPermission(menu.key);
    };
    /**
     * 获取用户有权限访问的所有页面路径
     */
    const accessiblePaths = computed(() => {
        return flatAccessibleMenus.value
            .filter((menu) => menu.type === 'page')
            .map(menu => menu.path);
    });
    /**
     * 搜索可访问的菜单
     */
    const searchAccessibleMenus = (keyword) => {
        const roles = authStore.userInfo?.roles || [];
        const searchResults = menuRegistry.search(keyword);
        return searchResults.filter(menu => {
            if (!menu.visible)
                return false;
            if (!menu.requiredRoles || menu.requiredRoles.length === 0)
                return true;
            return menu.requiredRoles.some(role => roles.includes(role));
        });
    };
    /**
     * 获取菜单树结构（仅包含有权限的菜单）
     */
    const menuTree = computed(() => {
        return accessibleMenus.value;
    });
    /**
     * 获取菜单统计信息
     */
    const menuStats = computed(() => {
        const stats = menuRegistry.getStats();
        const accessibleCount = flatAccessibleMenus.value.length;
        return {
            ...stats,
            accessible: accessibleCount,
            accessRate: stats.total > 0 ? Math.round((accessibleCount / stats.total) * 100) : 0
        };
    });
    /**
     * 检查用户是否是管理员
     */
    const isAdmin = computed(() => {
        const roles = authStore.userInfo?.roles || [];
        return roles.includes('admin');
    });
    /**
     * 检查用户是否有指定角色
     */
    const hasRole = (role) => {
        const roles = authStore.userInfo?.roles || [];
        return roles.includes(role);
    };
    /**
     * 检查用户是否有任一指定角色
     */
    const hasAnyRole = (roles) => {
        const userRoles = authStore.userInfo?.roles || [];
        return roles.some(role => userRoles.includes(role));
    };
    /**
     * 检查用户是否有所有指定角色
     */
    const hasAllRoles = (roles) => {
        const userRoles = authStore.userInfo?.roles || [];
        return roles.every(role => userRoles.includes(role));
    };
    return {
        // 菜单数据
        accessibleMenus,
        flatAccessibleMenus,
        menuTree,
        accessiblePaths,
        menuStats,
        // 权限检查
        hasMenuPermission,
        hasPathPermission,
        searchAccessibleMenus,
        // 角色检查
        isAdmin,
        hasRole,
        hasAnyRole,
        hasAllRoles
    };
}
