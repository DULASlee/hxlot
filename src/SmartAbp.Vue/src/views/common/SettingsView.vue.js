/// <reference types="D:/BAOBAB/Baobab.SmartAbp/src/SmartAbp.Vue/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import { ref } from "vue";
import { useThemeStore } from "@/stores";
const themeStore = useThemeStore();
// 主题配置 - 使用统一的主题系统
const themes = [
    { label: "科技蓝", value: "tech-blue", color: "#0ea5e9" },
    { label: "深绿色", value: "deep-green", color: "#059669" },
    { label: "淡紫色", value: "light-purple", color: "#8b5cf6" },
    { label: "暗黑模式", value: "dark", color: "#1e293b" },
];
// 系统设置
const systemSettings = ref({
    name: "SmartAbp 企业管理系统",
    language: "zh-CN",
    timezone: "Asia/Shanghai",
});
// 安全设置
const securitySettings = ref({
    sessionTimeout: 30,
    passwordComplexity: true,
    loginLog: true,
});
// 通知设置
const notificationSettings = ref({
    email: true,
    sms: false,
    browser: true,
});
// 方法
const selectTheme = (theme) => {
    themeStore.setTheme(theme);
    console.log(`主题已切换: ${theme}`);
};
const quickToggleDark = () => {
    themeStore.toggleDarkMode();
    console.log(`快速切换主题: ${themeStore.currentTheme}`);
};
const saveSettings = () => {
    // 保存设置到后端或本地存储
    const settings = {
        system: systemSettings.value,
        security: securitySettings.value,
        notification: notificationSettings.value,
        theme: themeStore.currentTheme,
    };
    localStorage.setItem("smartabp_settings", JSON.stringify(settings));
    console.log("设置已保存:", settings);
    alert("设置保存成功！");
};
const resetSettings = () => {
    if (confirm("确定要重置所有设置为默认值吗？")) {
        systemSettings.value = {
            name: "SmartAbp 企业管理系统",
            language: "zh-CN",
            timezone: "Asia/Shanghai",
        };
        securitySettings.value = {
            sessionTimeout: 30,
            passwordComplexity: true,
            loginLog: true,
        };
        notificationSettings.value = {
            email: true,
            sms: false,
            browser: true,
        };
        themeStore.setTheme("tech-blue");
        console.log("设置已重置为默认值");
        alert("设置已重置为默认值！");
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-option']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-option']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-option']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['switch']} */ ;
/** @type {__VLS_StyleScopedClasses['slider']} */ ;
/** @type {__VLS_StyleScopedClasses['slider']} */ ;
/** @type {__VLS_StyleScopedClasses['slider']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-input']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-select']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-options']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-option']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "settings-view" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({});
__VLS_asFunctionalElement(__VLS_elements.i)({
    ...{ class: "fas fa-cog header-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "settings-content" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "settings-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.i)({
    ...{ class: "fas fa-palette section-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "theme-options" },
});
for (const [theme] of __VLS_getVForSourceType((__VLS_ctx.themes))) {
    // @ts-ignore
    [themes,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectTheme(theme.value);
                // @ts-ignore
                [selectTheme,];
            } },
        key: (theme.value),
        ...{ class: (['theme-option', { active: __VLS_ctx.themeStore.currentTheme === theme.value }]) },
    });
    // @ts-ignore
    [themeStore,];
    __VLS_asFunctionalElement(__VLS_elements.div)({
        ...{ class: "theme-preview" },
        ...{ style: ({ background: theme.color }) },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (theme.label);
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.quickToggleDark) },
    ...{ class: "toggle-btn" },
});
// @ts-ignore
[quickToggleDark,];
if (__VLS_ctx.themeStore.isDarkMode) {
    // @ts-ignore
    [themeStore,];
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z",
    });
}
else {
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z",
    });
}
(__VLS_ctx.themeStore.isDarkMode ? "切换到浅色" : "切换到深色");
// @ts-ignore
[themeStore,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "settings-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.i)({
    ...{ class: "fas fa-server section-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.input)({
    value: (__VLS_ctx.systemSettings.name),
    type: "text",
    ...{ class: "setting-input" },
});
// @ts-ignore
[systemSettings,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
    value: (__VLS_ctx.systemSettings.language),
    ...{ class: "setting-select" },
});
// @ts-ignore
[systemSettings,];
__VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
    value: "zh-CN",
});
__VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
    value: "en-US",
});
__VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
    value: "ja-JP",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
    value: (__VLS_ctx.systemSettings.timezone),
    ...{ class: "setting-select" },
});
// @ts-ignore
[systemSettings,];
__VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
    value: "Asia/Shanghai",
});
__VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
    value: "America/New_York",
});
__VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
    value: "Europe/London",
});
__VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
    value: "Asia/Tokyo",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "settings-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.i)({
    ...{ class: "fas fa-shield-alt section-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.input)({
    type: "number",
    ...{ class: "setting-input" },
    min: "5",
    max: "1440",
});
(__VLS_ctx.securitySettings.sessionTimeout);
// @ts-ignore
[securitySettings,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "switch" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    type: "checkbox",
});
(__VLS_ctx.securitySettings.passwordComplexity);
// @ts-ignore
[securitySettings,];
__VLS_asFunctionalElement(__VLS_elements.span)({
    ...{ class: "slider" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "switch" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    type: "checkbox",
});
(__VLS_ctx.securitySettings.loginLog);
// @ts-ignore
[securitySettings,];
__VLS_asFunctionalElement(__VLS_elements.span)({
    ...{ class: "slider" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "settings-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.i)({
    ...{ class: "fas fa-bell section-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "switch" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    type: "checkbox",
});
(__VLS_ctx.notificationSettings.email);
// @ts-ignore
[notificationSettings,];
__VLS_asFunctionalElement(__VLS_elements.span)({
    ...{ class: "slider" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "switch" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    type: "checkbox",
});
(__VLS_ctx.notificationSettings.sms);
// @ts-ignore
[notificationSettings,];
__VLS_asFunctionalElement(__VLS_elements.span)({
    ...{ class: "slider" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "setting-info" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "switch" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    type: "checkbox",
});
(__VLS_ctx.notificationSettings.browser);
// @ts-ignore
[notificationSettings,];
__VLS_asFunctionalElement(__VLS_elements.span)({
    ...{ class: "slider" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "settings-actions" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.saveSettings) },
    ...{ class: "btn-primary" },
});
// @ts-ignore
[saveSettings,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.resetSettings) },
    ...{ class: "btn-secondary" },
});
// @ts-ignore
[resetSettings,];
/** @type {__VLS_StyleScopedClasses['settings-view']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-cog']} */ ;
/** @type {__VLS_StyleScopedClasses['header-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-content']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-palette']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-options']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-option']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-server']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-input']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-select']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-select']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-shield-alt']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-input']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['switch']} */ ;
/** @type {__VLS_StyleScopedClasses['slider']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['switch']} */ ;
/** @type {__VLS_StyleScopedClasses['slider']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-bell']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['switch']} */ ;
/** @type {__VLS_StyleScopedClasses['slider']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['switch']} */ ;
/** @type {__VLS_StyleScopedClasses['slider']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-info']} */ ;
/** @type {__VLS_StyleScopedClasses['switch']} */ ;
/** @type {__VLS_StyleScopedClasses['slider']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        themeStore: themeStore,
        themes: themes,
        systemSettings: systemSettings,
        securitySettings: securitySettings,
        notificationSettings: notificationSettings,
        selectTheme: selectTheme,
        quickToggleDark: quickToggleDark,
        saveSettings: saveSettings,
        resetSettings: resetSettings,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
