/// <reference types="D:/BAOBAB/Baobab.SmartAbp/src/SmartAbp.Vue/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useThemeStore } from "@/stores";
import { useAuthStore } from "@/stores/modules/auth";
import { useMenu } from "@/composables/useMenu";
import { i18n, setLocale } from "@/plugins/i18n";
import { storeToRefs } from "pinia";
const router = useRouter();
const themeStore = useThemeStore();
const { isDarkMode } = storeToRefs(themeStore);
const authStore = useAuthStore();
// 侧边栏显示
const sidebarCollapsed = ref(false);
const showUserDropdown = ref(false);
// 动态菜单系统
const { menuState, filteredMenus, submenuTitle, currentSubmenuItems, shouldShowSubmenu, handleMenuClick, handleSubMenuClick, closeSubmenu, switchTab, closeTab, } = useMenu();
const expandedMenus = computed(() => menuState.value.expandedMenuKeys);
const openTabs = computed(() => menuState.value.openTabs);
const activeTab = computed(() => menuState.value.activeTab);
// 用户信息
const userInfo = ref({
    name: "管理员",
    email: "admin@smartabp.com",
});
// 方法
const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
};
const toggleUserDropdown = () => {
    showUserDropdown.value = !showUserDropdown.value;
};
const closeAllDropdowns = () => {
    showUserDropdown.value = false;
};
const navigateToExternal = (name) => {
    console.log(`导航到外部系统: ${name}`);
};
const openSettings = () => {
    router.push("/Admin/settings");
};
const goToProfile = () => {
    router.push("/profile");
    showUserDropdown.value = false;
};
const logout = () => {
    localStorage.removeItem("smartabp_token");
    localStorage.removeItem("smartabp_user");
    router.push("/login");
};
const currentLocale = computed(() => i18n.global.locale.value);
const toggleLocale = () => {
    setLocale(currentLocale.value === "zh-CN" ? "en-US" : "zh-CN");
};
onMounted(() => {
    themeStore.init();
    // 初始化认证状态
    authStore.initialize();
    // 同步SmartAbp认证系统状态
    authStore.syncFromSmartAbp();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-option']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-option']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['user-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['user-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['user-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['expand-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-item']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-close']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-center']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['content-area']} */ ;
/** @type {__VLS_StyleScopedClasses['submenu-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['page-content']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['submenu-content']} */ ;
/** @type {__VLS_StyleScopedClasses['page-content']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['submenu-content']} */ ;
/** @type {__VLS_StyleScopedClasses['page-content']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['submenu-content']} */ ;
/** @type {__VLS_StyleScopedClasses['page-content']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-item']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['submenu-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['submenu-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['show']} */ ;
/** @type {__VLS_StyleScopedClasses['submenu-header']} */ ;
/** @type {__VLS_StyleScopedClasses['submenu-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-submenu']} */ ;
/** @type {__VLS_StyleScopedClasses['close-submenu']} */ ;
/** @type {__VLS_StyleScopedClasses['submenu-content']} */ ;
/** @type {__VLS_StyleScopedClasses['submenu-item']} */ ;
/** @type {__VLS_StyleScopedClasses['submenu-item']} */ ;
/** @type {__VLS_StyleScopedClasses['submenu-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['submenu-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['submenu-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "smart-abp-layout" },
});
__VLS_asFunctionalElement(__VLS_elements.header, __VLS_elements.header)({
    ...{ class: "top-navbar" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "navbar-left" },
});
__VLS_asFunctionalElement(__VLS_elements.img)({
    src: "/logo.svg",
    alt: "SmartAbp",
    ...{ class: "logo" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "brand-name" },
});
__VLS_asFunctionalElement(__VLS_elements.nav, __VLS_elements.nav)({
    ...{ class: "navbar-center" },
});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigateToExternal('智慧工地');
            // @ts-ignore
            [navigateToExternal,];
        } },
    href: "#",
    ...{ class: "nav-link" },
});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigateToExternal('MES');
            // @ts-ignore
            [navigateToExternal,];
        } },
    href: "#",
    ...{ class: "nav-link" },
});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigateToExternal('系统配置');
            // @ts-ignore
            [navigateToExternal,];
        } },
    href: "#",
    ...{ class: "nav-link" },
});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigateToExternal('APP');
            // @ts-ignore
            [navigateToExternal,];
        } },
    href: "#",
    ...{ class: "nav-link" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "navbar-right" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.toggleLocale) },
    ...{ class: "icon-btn" },
    title: "Language",
});
// @ts-ignore
[toggleLocale,];
__VLS_asFunctionalElement(__VLS_elements.i)({
    ...{ class: (__VLS_ctx.currentLocale === 'zh-CN' ? 'fas fa-language' : 'fas fa-globe') },
});
// @ts-ignore
[currentLocale,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.themeStore.toggleDarkMode();
            // @ts-ignore
            [themeStore,];
        } },
    ...{ class: "icon-btn" },
    title: "Theme",
});
__VLS_asFunctionalElement(__VLS_elements.i)({
    ...{ class: (__VLS_ctx.isDarkMode ? 'fas fa-sun' : 'fas fa-moon') },
});
// @ts-ignore
[isDarkMode,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.openSettings) },
    ...{ class: "icon-btn" },
    title: "设置",
});
// @ts-ignore
[openSettings,];
__VLS_asFunctionalElement(__VLS_elements.i)({
    ...{ class: "fas fa-cog" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ onClick: (__VLS_ctx.toggleUserDropdown) },
    ...{ class: "user-menu" },
});
// @ts-ignore
[toggleUserDropdown,];
__VLS_asFunctionalElement(__VLS_elements.img)({
    src: "/logo.svg",
    alt: "用户头像",
    ...{ class: "user-avatar" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "username" },
});
(__VLS_ctx.userInfo.name || "用户");
// @ts-ignore
[userInfo,];
__VLS_asFunctionalElement(__VLS_elements.i)({
    ...{ class: "fas fa-chevron-down dropdown-icon" },
});
if (__VLS_ctx.showUserDropdown) {
    // @ts-ignore
    [showUserDropdown,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "user-dropdown" },
    });
    __VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
        ...{ onClick: (__VLS_ctx.goToProfile) },
        href: "#",
    });
    // @ts-ignore
    [goToProfile,];
    __VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
        ...{ onClick: (__VLS_ctx.logout) },
        href: "#",
    });
    // @ts-ignore
    [logout,];
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "main-container" },
});
__VLS_asFunctionalElement(__VLS_elements.aside, __VLS_elements.aside)({
    ...{ class: "sidebar" },
    ...{ class: ({ collapsed: __VLS_ctx.sidebarCollapsed }) },
});
// @ts-ignore
[sidebarCollapsed,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "sidebar-header" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.toggleSidebar) },
    ...{ class: "collapse-btn" },
});
// @ts-ignore
[toggleSidebar,];
__VLS_asFunctionalElement(__VLS_elements.i)({
    ...{ class: (__VLS_ctx.sidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left') },
});
// @ts-ignore
[sidebarCollapsed,];
__VLS_asFunctionalElement(__VLS_elements.nav, __VLS_elements.nav)({
    ...{ class: "sidebar-nav" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.filteredMenus))) {
    // @ts-ignore
    [filteredMenus,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        key: (item.key),
        ...{ class: "nav-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.handleMenuClick(item);
                // @ts-ignore
                [handleMenuClick,];
            } },
        ...{ class: "nav-link" },
        ...{ class: ({
                active: __VLS_ctx.menuState.activeMenuKey === item.key,
                'has-children': item.type === 'folder' && item.children,
            }) },
    });
    // @ts-ignore
    [menuState,];
    __VLS_asFunctionalElement(__VLS_elements.i)({
        ...{ class: (item.icon) },
    });
    if (!__VLS_ctx.sidebarCollapsed) {
        // @ts-ignore
        [sidebarCollapsed,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "nav-text" },
        });
        (item.title);
    }
    if (item.type === 'folder' && item.children && !__VLS_ctx.sidebarCollapsed) {
        // @ts-ignore
        [sidebarCollapsed,];
        __VLS_asFunctionalElement(__VLS_elements.i)({
            ...{ class: ([
                    'fas fa-chevron-down',
                    'expand-icon',
                    { expanded: __VLS_ctx.expandedMenus.includes(item.key) },
                ]) },
        });
        // @ts-ignore
        [expandedMenus,];
    }
    if (item.type === 'folder' && item.children) {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "sub-menu" },
            ...{ class: ({ collapsed: __VLS_ctx.sidebarCollapsed }) },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.expandedMenus.includes(item.key)) }, null, null);
        // @ts-ignore
        [sidebarCollapsed, expandedMenus,];
        for (const [child] of __VLS_getVForSourceType((item.children))) {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!(item.type === 'folder' && item.children))
                            return;
                        __VLS_ctx.handleSubMenuClick(child);
                        // @ts-ignore
                        [handleSubMenuClick,];
                    } },
                key: (child.key),
                ...{ class: "sub-nav-link" },
                ...{ class: ({ active: __VLS_ctx.menuState.activeSubMenuKey === child.key }) },
            });
            // @ts-ignore
            [menuState,];
            __VLS_asFunctionalElement(__VLS_elements.i)({
                ...{ class: (child.icon) },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "nav-text" },
            });
            (child.title);
        }
    }
}
if (!__VLS_ctx.sidebarCollapsed) {
    // @ts-ignore
    [sidebarCollapsed,];
    __VLS_asFunctionalElement(__VLS_elements.aside, __VLS_elements.aside)({
        ...{ class: "submenu-panel" },
        ...{ class: ({ show: __VLS_ctx.shouldShowSubmenu }) },
    });
    // @ts-ignore
    [shouldShowSubmenu,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "submenu-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    (__VLS_ctx.submenuTitle);
    // @ts-ignore
    [submenuTitle,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.closeSubmenu) },
        ...{ class: "close-submenu" },
    });
    // @ts-ignore
    [closeSubmenu,];
    __VLS_asFunctionalElement(__VLS_elements.i)({
        ...{ class: "fas fa-times" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "submenu-content" },
    });
    for (const [sub] of __VLS_getVForSourceType((__VLS_ctx.currentSubmenuItems))) {
        // @ts-ignore
        [currentSubmenuItems,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.sidebarCollapsed))
                        return;
                    __VLS_ctx.handleSubMenuClick(sub);
                    // @ts-ignore
                    [handleSubMenuClick,];
                } },
            key: (sub.key),
            ...{ class: "submenu-item" },
        });
        __VLS_asFunctionalElement(__VLS_elements.i)({
            ...{ class: (sub.icon) },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        (sub.title);
    }
}
__VLS_asFunctionalElement(__VLS_elements.main, __VLS_elements.main)({
    ...{ class: "content-area" },
});
if (__VLS_ctx.openTabs.length > 0) {
    // @ts-ignore
    [openTabs,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "tab-navigation" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "tabs-container" },
    });
    for (const [tab] of __VLS_getVForSourceType((__VLS_ctx.openTabs))) {
        // @ts-ignore
        [openTabs,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.openTabs.length > 0))
                        return;
                    __VLS_ctx.switchTab(tab.key);
                    // @ts-ignore
                    [switchTab,];
                } },
            key: (tab.key),
            ...{ class: "tab-item" },
            ...{ class: ({ active: __VLS_ctx.activeTab === tab.key }) },
        });
        // @ts-ignore
        [activeTab,];
        __VLS_asFunctionalElement(__VLS_elements.i)({
            ...{ class: (tab.icon) },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "tab-title" },
        });
        (tab.title);
        if (tab.closable !== false) {
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.openTabs.length > 0))
                            return;
                        if (!(tab.closable !== false))
                            return;
                        __VLS_ctx.closeTab(tab.key);
                        // @ts-ignore
                        [closeTab,];
                    } },
                ...{ class: "tab-close" },
            });
            __VLS_asFunctionalElement(__VLS_elements.i)({
                ...{ class: "fas fa-times" },
            });
        }
    }
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "page-content" },
});
const __VLS_0 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
// @ts-ignore
RouterView;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
if (__VLS_ctx.showUserDropdown) {
    // @ts-ignore
    [showUserDropdown,];
    __VLS_asFunctionalElement(__VLS_elements.div)({
        ...{ onClick: (__VLS_ctx.closeAllDropdowns) },
        ...{ class: "overlay" },
    });
    // @ts-ignore
    [closeAllDropdowns,];
}
/** @type {__VLS_StyleScopedClasses['smart-abp-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['top-navbar']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-left']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-name']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-center']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-right']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-cog']} */ ;
/** @type {__VLS_StyleScopedClasses['user-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['username']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-chevron-down']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['user-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['main-container']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-header']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-item']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['has-children']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-text']} */ ;
/** @type {__VLS_StyleScopedClasses['expanded']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-chevron-down']} */ ;
/** @type {__VLS_StyleScopedClasses['expand-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-text']} */ ;
/** @type {__VLS_StyleScopedClasses['submenu-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['show']} */ ;
/** @type {__VLS_StyleScopedClasses['submenu-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-submenu']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-times']} */ ;
/** @type {__VLS_StyleScopedClasses['submenu-content']} */ ;
/** @type {__VLS_StyleScopedClasses['submenu-item']} */ ;
/** @type {__VLS_StyleScopedClasses['content-area']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-navigation']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs-container']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-close']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-times']} */ ;
/** @type {__VLS_StyleScopedClasses['page-content']} */ ;
/** @type {__VLS_StyleScopedClasses['overlay']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        themeStore: themeStore,
        isDarkMode: isDarkMode,
        sidebarCollapsed: sidebarCollapsed,
        showUserDropdown: showUserDropdown,
        menuState: menuState,
        filteredMenus: filteredMenus,
        submenuTitle: submenuTitle,
        currentSubmenuItems: currentSubmenuItems,
        shouldShowSubmenu: shouldShowSubmenu,
        handleMenuClick: handleMenuClick,
        handleSubMenuClick: handleSubMenuClick,
        closeSubmenu: closeSubmenu,
        switchTab: switchTab,
        closeTab: closeTab,
        expandedMenus: expandedMenus,
        openTabs: openTabs,
        activeTab: activeTab,
        userInfo: userInfo,
        toggleSidebar: toggleSidebar,
        toggleUserDropdown: toggleUserDropdown,
        closeAllDropdowns: closeAllDropdowns,
        navigateToExternal: navigateToExternal,
        openSettings: openSettings,
        goToProfile: goToProfile,
        logout: logout,
        currentLocale: currentLocale,
        toggleLocale: toggleLocale,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
