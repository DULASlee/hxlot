/// <reference types="D:/BAOBAB/Baobab.SmartAbp/src/SmartAbp.Vue/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
function isThemeKey(value) {
    return value === "classic" || value === "tech" || value === "elegant" || value === "dark";
}
export default (await import('vue')).defineComponent({
    name: "SimpleThemeSwitcher",
    data() {
        return {
            showDropdown: false,
            currentTheme: "classic",
            themes: [
                { key: "classic", name: "经典蓝", color: "#2563eb" },
                { key: "tech", name: "科技绿", color: "#059669" },
                { key: "elegant", name: "优雅紫", color: "#7c3aed" },
                { key: "dark", name: "暗黑", color: "#1f2937" },
            ],
        };
    },
    mounted() {
        // 从localStorage加载保存的主题
        const savedTheme = localStorage.getItem("selectedTheme");
        const themeToApply = isThemeKey(savedTheme) ? savedTheme : "classic";
        this.currentTheme = themeToApply;
        this.applyTheme(themeToApply);
        // 点击外部关闭下拉菜单
        document.addEventListener("click", this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener("click", this.handleClickOutside);
    },
    methods: {
        toggleDropdown() {
            this.showDropdown = !this.showDropdown;
        },
        selectTheme(themeKey) {
            this.currentTheme = themeKey;
            this.applyTheme(themeKey);
            this.showDropdown = false;
        },
        applyTheme(theme) {
            const root = document.documentElement;
            // 直接设置CSS变量到根元素
            const themeVars = this.getThemeVariables(theme);
            // 清除之前的CSS变量
            Object.keys(themeVars).forEach((key) => {
                root.style.removeProperty(key);
            });
            // 设置新的CSS变量
            Object.entries(themeVars).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
            // 保存到localStorage
            localStorage.setItem("selectedTheme", theme);
            console.log(`主题已切换到: ${theme}`, themeVars);
        },
        getThemeVariables(theme) {
            const themes = {
                classic: {
                    "--primary-color": "#2563eb",
                    "--primary-hover": "#1d4ed8",
                    "--bg-color": "#ffffff",
                    "--text-color": "#1f2937",
                    "--border-color": "#e5e7eb",
                    "--card-bg": "#ffffff",
                    "--hover-bg": "#f3f4f6",
                    "--sidebar-bg": "#001529",
                    "--sidebar-text": "rgba(255, 255, 255, 0.85)",
                    "--sidebar-text-hover": "#ffffff",
                    "--sidebar-hover": "rgba(255, 255, 255, 0.1)",
                    "--content-bg": "#f5f5f5",
                    "--submenu-bg": "#ffffff",
                    "--header-bg": "#ffffff",
                    "--tab-bg": "#ffffff",
                    "--tab-active-bg": "#2563eb",
                    "--tab-inactive-bg": "#f8fafc",
                    "--tab-hover-bg": "#f1f5f9",
                },
                tech: {
                    "--primary-color": "#059669",
                    "--primary-hover": "#047857",
                    "--bg-color": "#ffffff",
                    "--text-color": "#1f2937",
                    "--border-color": "#d1d5db",
                    "--card-bg": "#ffffff",
                    "--hover-bg": "#f0fdf4",
                    "--sidebar-bg": "#002329",
                    "--sidebar-text": "rgba(255, 255, 255, 0.85)",
                    "--sidebar-text-hover": "#ffffff",
                    "--sidebar-hover": "rgba(255, 255, 255, 0.1)",
                    "--content-bg": "#f6ffed",
                    "--submenu-bg": "#ffffff",
                    "--header-bg": "#ffffff",
                    "--tab-bg": "#ffffff",
                    "--tab-active-bg": "#059669",
                    "--tab-inactive-bg": "#f0fdf4",
                    "--tab-hover-bg": "#ecfdf5",
                },
                elegant: {
                    "--primary-color": "#7c3aed",
                    "--primary-hover": "#6d28d9",
                    "--bg-color": "#ffffff",
                    "--text-color": "#1f2937",
                    "--border-color": "#e5e7eb",
                    "--card-bg": "#ffffff",
                    "--hover-bg": "#faf5ff",
                    "--sidebar-bg": "#2d1b69",
                    "--sidebar-text": "rgba(255, 255, 255, 0.85)",
                    "--sidebar-text-hover": "#ffffff",
                    "--sidebar-hover": "rgba(255, 255, 255, 0.1)",
                    "--content-bg": "#faf5ff",
                    "--submenu-bg": "#ffffff",
                    "--header-bg": "#ffffff",
                    "--tab-bg": "#ffffff",
                    "--tab-active-bg": "#7c3aed",
                    "--tab-inactive-bg": "#faf5ff",
                    "--tab-hover-bg": "#f3e8ff",
                },
                dark: {
                    "--primary-color": "#3b82f6",
                    "--primary-hover": "#2563eb",
                    "--bg-color": "#1a1a2e",
                    "--text-color": "#e5e7eb",
                    "--border-color": "#374151",
                    "--card-bg": "#16213e",
                    "--hover-bg": "#1f2937",
                    "--sidebar-bg": "#0f1419",
                    "--sidebar-text": "rgba(255, 255, 255, 0.85)",
                    "--sidebar-text-hover": "#ffffff",
                    "--sidebar-hover": "rgba(255, 255, 255, 0.1)",
                    "--content-bg": "#1a1a2e",
                    "--submenu-bg": "#16213e",
                    "--header-bg": "#16213e",
                    "--tab-bg": "#16213e",
                    "--tab-active-bg": "#3b82f6",
                    "--tab-inactive-bg": "#1f2937",
                    "--tab-hover-bg": "#374151",
                },
            };
            return themes[theme] || themes.classic;
        },
        handleClickOutside(event) {
            if (event.target && !this.$el.contains(event.target)) {
                this.showDropdown = false;
            }
        },
    },
});
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['theme-button']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-option']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-option']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "theme-switcher" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.toggleDropdown) },
    ...{ class: "theme-button" },
});
// @ts-ignore
[toggleDropdown,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "theme-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "theme-text" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "dropdown-arrow" },
    ...{ class: ({ open: __VLS_ctx.showDropdown }) },
});
// @ts-ignore
[showDropdown,];
if (__VLS_ctx.showDropdown) {
    // @ts-ignore
    [showDropdown,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "theme-dropdown" },
    });
    for (const [theme] of __VLS_getVForSourceType((__VLS_ctx.themes))) {
        // @ts-ignore
        [themes,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showDropdown))
                        return;
                    __VLS_ctx.selectTheme(theme.key);
                    // @ts-ignore
                    [selectTheme,];
                } },
            key: (theme.key),
            ...{ class: "theme-option" },
            ...{ class: ({ active: __VLS_ctx.currentTheme === theme.key }) },
        });
        // @ts-ignore
        [currentTheme,];
        __VLS_asFunctionalElement(__VLS_elements.span)({
            ...{ class: "theme-color" },
            ...{ style: ({ backgroundColor: theme.color }) },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "theme-name" },
        });
        (theme.name);
        if (__VLS_ctx.currentTheme === theme.key) {
            // @ts-ignore
            [currentTheme,];
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "check-mark" },
            });
        }
    }
}
/** @type {__VLS_StyleScopedClasses['theme-switcher']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-button']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-text']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['open']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-option']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-color']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-name']} */ ;
/** @type {__VLS_StyleScopedClasses['check-mark']} */ ;
var __VLS_dollars;
let __VLS_self;
