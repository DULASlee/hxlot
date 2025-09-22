/// <reference types="D:/BAOBAB/Baobab.SmartAbp/src/SmartAbp.Vue/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import { defineComponent, ref, computed, onMounted } from "vue";
// import { useI18n } from 'vue-i18n';
import { storeToRefs } from "pinia";
import { useThemeStore } from "@/stores";
// import type { ThemeType } from '@/composables/useDesignSystem';
// 点击外部指令
const vClickOutside = {
    mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event);
            }
        };
        document.addEventListener("click", el.clickOutsideEvent);
    },
    unmounted(el) {
        document.removeEventListener("click", el.clickOutsideEvent);
    },
};
export default defineComponent({
    name: "ThemeSwitcher",
    directives: {
        "click-outside": vClickOutside,
    },
    setup() {
        const themeStore = useThemeStore();
        const { currentTheme, isDarkMode } = storeToRefs(themeStore);
        const { setTheme, toggleDarkMode, getAvailableThemes } = themeStore;
        const isDropdownOpen = ref(false);
        // 获取可用主题列表
        const availableThemes = computed(() => getAvailableThemes());
        // 当前主题名称
        const currentThemeName = computed(() => {
            const theme = availableThemes.value.find((t) => t.value === currentTheme.value);
            return theme ? theme.name : "科技蓝";
        });
        // 当前主题图标
        const currentThemeIcon = computed(() => {
            const theme = availableThemes.value.find((t) => t.value === currentTheme.value);
            return theme ? theme.icon : "fas fa-microchip";
        });
        // 切换下拉菜单
        const toggleDropdown = () => {
            isDropdownOpen.value = !isDropdownOpen.value;
        };
        // 关闭下拉菜单
        const closeDropdown = () => {
            isDropdownOpen.value = false;
        };
        // 组件挂载时初始化主题
        onMounted(() => {
            // 如果未设置主题，则设置默认主题为科技蓝
            if (!currentTheme.value) {
                setTheme("tech-blue");
            }
        });
        return {
            currentTheme,
            isDarkMode,
            isDropdownOpen,
            availableThemes,
            currentThemeName,
            currentThemeIcon,
            setTheme,
            toggleDarkMode,
            toggleDropdown,
            closeDropdown,
            getAvailableThemes,
        };
    },
});
debugger; /* PartiallyEnd: #3632/script.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
const __VLS_directivesOption = {
    "click-outside": vClickOutside,
};
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['theme-switcher-button']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-switcher-button']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-switcher-button']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-switcher-button']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-dropdown-item']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-dropdown-item']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-dropdown-item']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-dropdown-item']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-dropdown-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-dropdown-item']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-dropdown-item']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-dropdown-item']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-dropdown-item']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-dropdown-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-name']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-switcher-button']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-dropdown-menu']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "theme-switcher" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "theme-switcher-dropdown" },
});
__VLS_asFunctionalDirective(__VLS_directives.vClickOutside)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.closeDropdown) }, null, null);
// @ts-ignore
[vClickOutside, closeDropdown,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.toggleDropdown) },
    ...{ class: "theme-switcher-button" },
    title: "切换主题",
});
// @ts-ignore
[toggleDropdown,];
__VLS_asFunctionalElement(__VLS_elements.i)({
    ...{ class: (__VLS_ctx.currentThemeIcon) },
    ...{ class: "theme-icon" },
});
// @ts-ignore
[currentThemeIcon,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "theme-name" },
});
(__VLS_ctx.currentThemeName);
// @ts-ignore
[currentThemeName,];
__VLS_asFunctionalElement(__VLS_elements.i)({
    ...{ class: "fas fa-chevron-down dropdown-arrow" },
    ...{ class: ({ 'rotate-180': __VLS_ctx.isDropdownOpen }) },
});
// @ts-ignore
[isDropdownOpen,];
if (__VLS_ctx.isDropdownOpen) {
    // @ts-ignore
    [isDropdownOpen,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "theme-dropdown-menu" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "theme-dropdown-item dark-mode-toggle" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "toggle-switch" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        ...{ onChange: (__VLS_ctx.toggleDarkMode) },
        type: "checkbox",
        checked: (__VLS_ctx.isDarkMode),
    });
    // @ts-ignore
    [toggleDarkMode, isDarkMode,];
    __VLS_asFunctionalElement(__VLS_elements.span)({
        ...{ class: "toggle-slider" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div)({
        ...{ class: "theme-dropdown-divider" },
    });
    for (const [theme] of __VLS_getVForSourceType((__VLS_ctx.availableThemes))) {
        // @ts-ignore
        [availableThemes,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isDropdownOpen))
                        return;
                    __VLS_ctx.setTheme(theme.value);
                    // @ts-ignore
                    [setTheme,];
                } },
            key: (theme.value),
            ...{ class: "theme-dropdown-item" },
            ...{ class: ({ active: __VLS_ctx.currentTheme === theme.value }) },
        });
        // @ts-ignore
        [currentTheme,];
        __VLS_asFunctionalElement(__VLS_elements.div)({
            ...{ class: "theme-preview" },
            ...{ style: ({ backgroundColor: theme.color }) },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        (theme.name);
        if (__VLS_ctx.currentTheme === theme.value) {
            // @ts-ignore
            [currentTheme,];
            __VLS_asFunctionalElement(__VLS_elements.i)({
                ...{ class: "fas fa-check" },
            });
        }
    }
}
/** @type {__VLS_StyleScopedClasses['theme-switcher']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-switcher-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-switcher-button']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-name']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-chevron-down']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['rotate-180']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-dropdown-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-dropdown-item']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-dropdown-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-dropdown-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-check']} */ ;
var __VLS_dollars;
let __VLS_self;
