import type { MenuItem } from '@/types/menu';
/**
 * 标签页接口
 */
export interface TabItem {
    key: string;
    title: string;
    icon: string;
    path: string;
    closable: boolean;
}
/**
 * 菜单状态接口
 */
export interface MenuState {
    activeMenuKey: string;
    activeSubMenuKey: string;
    expandedMenuKeys: string[];
    showSubmenu: boolean;
    openTabs: TabItem[];
    activeTab: string;
    singleTabMode: boolean;
}
/**
 * 权限摘要接口
 */
export interface PermissionSummary {
    isAuthenticated: boolean;
    user: any;
    roles: any;
    isSuperAdmin: boolean;
    isAdmin: any;
    isUser: any;
    hasSuperPermission: string;
}
/**
 * 菜单Store
 * 负责管理菜单状态、权限过滤、标签页管理等
 */
export declare const useMenuStore: import("pinia").StoreDefinition<"menu", Pick<{
    menuState: import("vue").Ref<{
        activeMenuKey: string;
        activeSubMenuKey: string;
        expandedMenuKeys: string[];
        showSubmenu: boolean;
        openTabs: {
            key: string;
            title: string;
            icon: string;
            path: string;
            closable: boolean;
        }[];
        activeTab: string;
        singleTabMode: boolean;
    }, MenuState | {
        activeMenuKey: string;
        activeSubMenuKey: string;
        expandedMenuKeys: string[];
        showSubmenu: boolean;
        openTabs: {
            key: string;
            title: string;
            icon: string;
            path: string;
            closable: boolean;
        }[];
        activeTab: string;
        singleTabMode: boolean;
    }>;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    filteredMenus: import("vue").ComputedRef<MenuItem[]>;
    menuMap: import("vue").ComputedRef<Map<string, MenuItem>>;
    activeMenu: import("vue").ComputedRef<MenuItem | null>;
    activeSubMenu: import("vue").ComputedRef<MenuItem | null>;
    submenuTitle: import("vue").ComputedRef<string>;
    currentSubmenuItems: import("vue").ComputedRef<MenuItem[]>;
    shouldShowSubmenu: import("vue").ComputedRef<boolean>;
    permissionSummary: import("vue").ComputedRef<PermissionSummary>;
    initializeMenu: () => Promise<void>;
    setupDefaultMenuState: () => void;
    toggleMenuExpansion: (menuKey: string) => void;
    toggleSubmenu: (menuKey?: string) => void;
    closeSubmenu: () => void;
    setActiveMenu: (menuKey: string, subMenuKey?: string) => void;
    addTab: (page: MenuItem) => void;
    switchTab: (tabKey: string) => string | null;
    closeTab: (tabKey: string) => string | null;
    updateMenuStateByPath: (path: string) => boolean;
    resetMenuState: () => void;
    toggleSingleTabMode: () => void;
}, "error" | "menuState" | "loading">, Pick<{
    menuState: import("vue").Ref<{
        activeMenuKey: string;
        activeSubMenuKey: string;
        expandedMenuKeys: string[];
        showSubmenu: boolean;
        openTabs: {
            key: string;
            title: string;
            icon: string;
            path: string;
            closable: boolean;
        }[];
        activeTab: string;
        singleTabMode: boolean;
    }, MenuState | {
        activeMenuKey: string;
        activeSubMenuKey: string;
        expandedMenuKeys: string[];
        showSubmenu: boolean;
        openTabs: {
            key: string;
            title: string;
            icon: string;
            path: string;
            closable: boolean;
        }[];
        activeTab: string;
        singleTabMode: boolean;
    }>;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    filteredMenus: import("vue").ComputedRef<MenuItem[]>;
    menuMap: import("vue").ComputedRef<Map<string, MenuItem>>;
    activeMenu: import("vue").ComputedRef<MenuItem | null>;
    activeSubMenu: import("vue").ComputedRef<MenuItem | null>;
    submenuTitle: import("vue").ComputedRef<string>;
    currentSubmenuItems: import("vue").ComputedRef<MenuItem[]>;
    shouldShowSubmenu: import("vue").ComputedRef<boolean>;
    permissionSummary: import("vue").ComputedRef<PermissionSummary>;
    initializeMenu: () => Promise<void>;
    setupDefaultMenuState: () => void;
    toggleMenuExpansion: (menuKey: string) => void;
    toggleSubmenu: (menuKey?: string) => void;
    closeSubmenu: () => void;
    setActiveMenu: (menuKey: string, subMenuKey?: string) => void;
    addTab: (page: MenuItem) => void;
    switchTab: (tabKey: string) => string | null;
    closeTab: (tabKey: string) => string | null;
    updateMenuStateByPath: (path: string) => boolean;
    resetMenuState: () => void;
    toggleSingleTabMode: () => void;
}, "filteredMenus" | "menuMap" | "activeMenu" | "activeSubMenu" | "submenuTitle" | "currentSubmenuItems" | "shouldShowSubmenu" | "permissionSummary">, Pick<{
    menuState: import("vue").Ref<{
        activeMenuKey: string;
        activeSubMenuKey: string;
        expandedMenuKeys: string[];
        showSubmenu: boolean;
        openTabs: {
            key: string;
            title: string;
            icon: string;
            path: string;
            closable: boolean;
        }[];
        activeTab: string;
        singleTabMode: boolean;
    }, MenuState | {
        activeMenuKey: string;
        activeSubMenuKey: string;
        expandedMenuKeys: string[];
        showSubmenu: boolean;
        openTabs: {
            key: string;
            title: string;
            icon: string;
            path: string;
            closable: boolean;
        }[];
        activeTab: string;
        singleTabMode: boolean;
    }>;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    filteredMenus: import("vue").ComputedRef<MenuItem[]>;
    menuMap: import("vue").ComputedRef<Map<string, MenuItem>>;
    activeMenu: import("vue").ComputedRef<MenuItem | null>;
    activeSubMenu: import("vue").ComputedRef<MenuItem | null>;
    submenuTitle: import("vue").ComputedRef<string>;
    currentSubmenuItems: import("vue").ComputedRef<MenuItem[]>;
    shouldShowSubmenu: import("vue").ComputedRef<boolean>;
    permissionSummary: import("vue").ComputedRef<PermissionSummary>;
    initializeMenu: () => Promise<void>;
    setupDefaultMenuState: () => void;
    toggleMenuExpansion: (menuKey: string) => void;
    toggleSubmenu: (menuKey?: string) => void;
    closeSubmenu: () => void;
    setActiveMenu: (menuKey: string, subMenuKey?: string) => void;
    addTab: (page: MenuItem) => void;
    switchTab: (tabKey: string) => string | null;
    closeTab: (tabKey: string) => string | null;
    updateMenuStateByPath: (path: string) => boolean;
    resetMenuState: () => void;
    toggleSingleTabMode: () => void;
}, "initializeMenu" | "setupDefaultMenuState" | "toggleMenuExpansion" | "toggleSubmenu" | "closeSubmenu" | "setActiveMenu" | "addTab" | "switchTab" | "closeTab" | "updateMenuStateByPath" | "resetMenuState" | "toggleSingleTabMode">>;
//# sourceMappingURL=menu.d.ts.map