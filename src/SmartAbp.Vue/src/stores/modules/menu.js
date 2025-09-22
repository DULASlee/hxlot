/**
 * 菜单状态管理 Store
 * 基于现有 Pinia 模式，与 AuthStore 完全集成
 */
import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { menuConfig } from "@/config/menus";
import { MenuPermissionFilter } from "@/utils/menuFilter";
import { useAuthStore } from "./auth";
import { logger } from "@/utils/logger";
const menuFilter = new MenuPermissionFilter();
export const useMenuStore = defineStore("menu", () => {
    // ===========================================
    // 依赖注入现有的认证store
    // ===========================================
    const authStore = useAuthStore();
    // ===========================================
    // 响应式状态
    // ===========================================
    // 菜单渲染状态
    const menuState = ref({
        activeMenuKey: "dashboard",
        activeSubMenuKey: "",
        expandedMenuKeys: [],
        showSubmenu: false,
        openTabs: [
            {
                key: "dashboard",
                title: "工作台",
                icon: "fas fa-chart-pie",
                path: "/dashboard",
                closable: false,
            },
        ],
        activeTab: "dashboard",
        singleTabMode: false,
    });
    // 菜单加载状态
    const loading = ref(false);
    // 错误状态
    const error = ref(null);
    // ===========================================
    // 计算属性
    // ===========================================
    // 过滤后的菜单列表（基于用户权限）
    const filteredMenus = computed(() => {
        logger.debug("🍖 计算filteredMenus:", {
            isAuthenticated: authStore.isAuthenticated,
            userInfo: authStore.userInfo,
            token: !!authStore.token,
        });
        // 未认证时以访客身份展示带有 GUEST 权限的菜单（仍需路由鉴权）
        if (!authStore.isAuthenticated) {
            const guestUser = { roles: ["guest"] };
            const filtered = menuFilter.filterMenus(menuConfig.menus, guestUser, {
                filterHidden: true,
                filterPermissions: true,
            });
            return filtered;
        }
        // 使用权限过滤器过滤菜单 - 传入用户信息
        const filtered = menuFilter.filterMenus(menuConfig.menus, authStore.userInfo, {
            filterHidden: true,
            filterPermissions: true,
        });
        logger.debug("✅ 过滤后的菜单数量:", {
            count: filtered.length,
            titles: filtered.map((m) => m.title),
        });
        return filtered;
    });
    // 扁平化的菜单映射（方便查找）
    const menuMap = computed(() => {
        const map = new Map();
        const collectMenus = (menus) => {
            menus.forEach((menu) => {
                map.set(menu.key, menu);
                if (menu.type === "folder" && menu.children) {
                    collectMenus(menu.children);
                }
            });
        };
        collectMenus(filteredMenus.value);
        return map;
    });
    // 当前激活菜单的信息
    const activeMenu = computed(() => {
        return menuMap.value.get(menuState.value.activeMenuKey) || null;
    });
    // 当前激活子菜单的信息
    const activeSubMenu = computed(() => {
        return menuMap.value.get(menuState.value.activeSubMenuKey) || null;
    });
    // 副菜单标题
    const submenuTitle = computed(() => {
        return activeMenu.value?.title || "";
    });
    // 当前激活菜单的子菜单列表
    const currentSubmenuItems = computed(() => {
        if (!activeMenu.value || activeMenu.value.type !== "folder") {
            return [];
        }
        return activeMenu.value.children || [];
    });
    // 是否应该显示副菜单
    const shouldShowSubmenu = computed(() => {
        return (menuState.value.showSubmenu &&
            currentSubmenuItems.value.length > 0 &&
            activeMenu.value?.type === "folder");
    });
    // 权限摘要信息（便于调试）
    const permissionSummary = computed(() => {
        return menuFilter.getPermissionSummary(authStore.userInfo);
    });
    // ===========================================
    // Actions (状态修改方法)
    // ===========================================
    /**
     * 初始化菜单系统
     */
    const initializeMenu = async () => {
        try {
            loading.value = true;
            error.value = null;
            // 等待认证完成
            if (authStore.isLoading) {
                // 如果认证还在加载中，等待完成
                const unwatch = watch(() => authStore.isLoading, (newLoading) => {
                    if (!newLoading) {
                        unwatch();
                        setupDefaultMenuState();
                    }
                });
            }
            else {
                setupDefaultMenuState();
            }
        }
        catch (err) {
            error.value = err instanceof Error ? err.message : "初始化菜单失败";
            logger.error("初始化菜单失败:", err);
        }
        finally {
            loading.value = false;
        }
    };
    /**
     * 设置默认菜单状态
     */
    const setupDefaultMenuState = () => {
        // 设置默认展开的菜单 - 传入用户信息
        const defaultExpanded = menuFilter.getDefaultExpandedMenuKeys(filteredMenus.value, authStore.userInfo);
        menuState.value.expandedMenuKeys = defaultExpanded;
        logger.debug("菜单初始化完成:", {
            filteredMenusCount: filteredMenus.value.length,
            expandedMenus: defaultExpanded,
            permissionSummary: permissionSummary.value,
        });
    };
    /**
     * 切换菜单展开状态
     */
    const toggleMenuExpansion = (menuKey) => {
        const index = menuState.value.expandedMenuKeys.indexOf(menuKey);
        if (index > -1) {
            menuState.value.expandedMenuKeys.splice(index, 1);
        }
        else {
            menuState.value.expandedMenuKeys.push(menuKey);
        }
    };
    /**
     * 切换副菜单显示状态
     */
    const toggleSubmenu = (menuKey) => {
        if (menuKey && menuKey === menuState.value.activeMenuKey && menuState.value.showSubmenu) {
            // 如果点击的是当前激活菜单且副菜单已显示，则关闭副菜单
            menuState.value.showSubmenu = false;
        }
        else if (menuKey) {
            // 否则激活菜单并显示副菜单
            menuState.value.activeMenuKey = menuKey;
            menuState.value.showSubmenu = true;
        }
        else {
            // 仅切换显示状态
            menuState.value.showSubmenu = !menuState.value.showSubmenu;
        }
    };
    /**
     * 关闭副菜单
     */
    const closeSubmenu = () => {
        menuState.value.showSubmenu = false;
    };
    /**
     * 设置激活的菜单
     */
    const setActiveMenu = (menuKey, subMenuKey) => {
        menuState.value.activeMenuKey = menuKey;
        menuState.value.activeSubMenuKey = subMenuKey || "";
    };
    /**
     * 添加标签页
     */
    const addTab = (page) => {
        if (page.type !== "page") {
            return;
        }
        const tab = {
            key: page.key,
            title: page.title,
            icon: page.icon,
            path: page.path,
            closable: !menuState.value.singleTabMode,
        };
        if (menuState.value.singleTabMode) {
            menuState.value.openTabs = [tab];
        }
        else {
            const exists = menuState.value.openTabs.find((t) => t.key === page.key);
            if (!exists) {
                menuState.value.openTabs.push(tab);
            }
        }
        menuState.value.activeTab = page.key;
    };
    /**
     * 切换标签页
     */
    const switchTab = (tabKey) => {
        const tab = menuState.value.openTabs.find((t) => t.key === tabKey);
        if (tab) {
            menuState.value.activeTab = tabKey;
            return tab.path;
        }
        return null;
    };
    /**
     * 关闭标签页
     */
    const closeTab = (tabKey) => {
        const index = menuState.value.openTabs.findIndex((tab) => tab.key === tabKey);
        if (index > -1) {
            menuState.value.openTabs.splice(index, 1);
            // 如果关闭的是当前活动标签，切换到其他标签
            if (menuState.value.activeTab === tabKey) {
                const newActiveTab = menuState.value.openTabs[Math.max(0, index - 1)];
                if (newActiveTab) {
                    menuState.value.activeTab = newActiveTab.key;
                    return newActiveTab.path;
                }
            }
        }
        return null;
    };
    /**
     * 根据路径更新菜单状态
     */
    const updateMenuStateByPath = (path) => {
        const menuItem = menuFilter.findMenuByPath(path, filteredMenus.value);
        if (!menuItem) {
            return false;
        }
        // 查找父菜单
        const parentMenu = menuFilter.findParentMenu(filteredMenus.value, menuItem.key);
        if (parentMenu) {
            // 有父菜单的情况
            setActiveMenu(parentMenu.key, menuItem.key);
            // 确保父菜单展开
            if (!menuState.value.expandedMenuKeys.includes(parentMenu.key)) {
                menuState.value.expandedMenuKeys.push(parentMenu.key);
            }
        }
        else {
            // 顶级菜单的情况
            setActiveMenu(menuItem.key);
        }
        // 添加到标签页
        addTab(menuItem);
        return true;
    };
    /**
     * 重置菜单状态
     */
    const resetMenuState = () => {
        menuState.value = {
            activeMenuKey: "dashboard",
            activeSubMenuKey: "",
            expandedMenuKeys: [],
            showSubmenu: false,
            openTabs: [
                {
                    key: "dashboard",
                    title: "工作台",
                    icon: "fas fa-chart-pie",
                    path: "/dashboard",
                    closable: false,
                },
            ],
            activeTab: "dashboard",
            singleTabMode: false,
        };
    };
    /**
     * 切换单标签模式
     */
    const toggleSingleTabMode = () => {
        menuState.value.singleTabMode = !menuState.value.singleTabMode;
        if (menuState.value.singleTabMode) {
            // 切换到单标签模式时，只保留当前活动标签
            menuState.value.openTabs = [
                menuState.value.openTabs.find((t) => t.key === menuState.value.activeTab) || {
                    key: "dashboard",
                    title: "工作台",
                    icon: "fas fa-chart-pie",
                    path: "/dashboard",
                    closable: false,
                },
            ];
        }
        else {
            // 切换回多标签模式时，恢复所有标签
            menuState.value.openTabs = [
                {
                    key: "dashboard",
                    title: "工作台",
                    icon: "fas fa-chart-pie",
                    path: "/dashboard",
                    closable: false,
                },
            ];
        }
    };
    /**
     * 监听认证状态变化，自动重新初始化菜单
     */
    watch(() => authStore.isAuthenticated, (newAuth, oldAuth) => {
        logger.debug("🔄 认证状态变化:", {
            oldAuth,
            newAuth,
            userInfo: authStore.userInfo,
            token: !!authStore.token,
        });
        if (newAuth) {
            // 用户登录，重新初始化菜单
            logger.debug("✅ 用户已认证，重新初始化菜单");
            setupDefaultMenuState();
        }
        else {
            // 用户登出，重置菜单状态
            logger.debug("❌ 用户未认证，重置菜单状态");
            resetMenuState();
        }
    }, { immediate: true });
    // 监听用户信息变化，自动刷新菜单
    watch(() => authStore.userInfo, (newUserInfo) => {
        if (newUserInfo) {
            logger.debug("👤 用户信息更新，刷新菜单:", newUserInfo);
            setupDefaultMenuState();
        }
    }, { deep: true });
    // ===========================================
    // 返回公共API
    // ===========================================
    return {
        // 状态
        menuState,
        loading,
        error,
        // 计算属性
        filteredMenus,
        menuMap,
        activeMenu,
        activeSubMenu,
        submenuTitle,
        currentSubmenuItems,
        shouldShowSubmenu,
        permissionSummary,
        // 方法
        initializeMenu,
        setupDefaultMenuState,
        toggleMenuExpansion,
        toggleSubmenu,
        closeSubmenu,
        setActiveMenu,
        addTab,
        switchTab,
        closeTab,
        updateMenuStateByPath,
        resetMenuState,
        // 切换单标签模式
        toggleSingleTabMode,
    };
});
