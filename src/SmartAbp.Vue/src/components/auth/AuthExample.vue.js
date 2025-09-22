/// <reference types="D:/BAOBAB/Baobab.SmartAbp/src/SmartAbp.Vue/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import { ref } from "vue";
import { useAuthStore, useThemeStore } from "@/stores";
import { authService } from "@/utils/auth";
import { api } from "@/utils/api";
// 使用stores
const authStore = useAuthStore();
const themeStore = useThemeStore();
// 登录表单
const loginForm = ref({
    username: "",
    password: "",
});
// API测试状态
const isTestingApi = ref(false);
const apiResult = ref("");
// 处理登录
const handleLogin = async () => {
    try {
        await authService.login(loginForm.value);
        // 登录成功后清空表单
        loginForm.value = { username: "", password: "" };
    }
    catch (error) {
        console.error("登录失败:", error);
        alert("登录失败，请检查用户名和密码");
    }
};
// 处理登出
const handleLogout = async () => {
    try {
        await authService.logout();
    }
    catch (error) {
        console.error("登出失败:", error);
    }
};
// 处理主题变更
const handleThemeChange = () => {
    themeStore.setTheme(themeStore.currentTheme);
};
// 测试API
const testApi = async () => {
    isTestingApi.value = true;
    try {
        const result = await api.get("/health-status");
        apiResult.value = JSON.stringify(result, null, 2);
    }
    catch (error) {
        apiResult.value = `API测试失败: ${error}`;
    }
    finally {
        isTestingApi.value = false;
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['login-section']} */ ;
/** @type {__VLS_StyleScopedClasses['user-section']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-section']} */ ;
/** @type {__VLS_StyleScopedClasses['api-section']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['login-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['logout-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['login-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['logout-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['logout-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-example']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-controls']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "auth-example" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
if (!__VLS_ctx.authStore.isAuthenticated) {
    // @ts-ignore
    [authStore,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "login-section" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.form, __VLS_elements.form)({
        ...{ onSubmit: (__VLS_ctx.handleLogin) },
    });
    // @ts-ignore
    [handleLogin,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.input)({
        value: (__VLS_ctx.loginForm.username),
        type: "text",
        required: true,
        placeholder: "请输入用户名",
    });
    // @ts-ignore
    [loginForm,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "password",
        required: true,
        placeholder: "请输入密码",
    });
    (__VLS_ctx.loginForm.password);
    // @ts-ignore
    [loginForm,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        type: "submit",
        disabled: (__VLS_ctx.authStore.isLoading),
        ...{ class: "login-btn" },
    });
    // @ts-ignore
    [authStore,];
    (__VLS_ctx.authStore.isLoading ? "登录中..." : "登录");
    // @ts-ignore
    [authStore,];
}
else {
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "user-section" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    if (__VLS_ctx.authStore.userInfo) {
        // @ts-ignore
        [authStore,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "user-info" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
        __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
        (__VLS_ctx.authStore.userInfo.id);
        // @ts-ignore
        [authStore,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
        __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
        (__VLS_ctx.authStore.userInfo.username);
        // @ts-ignore
        [authStore,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
        __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
        (__VLS_ctx.authStore.userInfo.email);
        // @ts-ignore
        [authStore,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
        __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
        (__VLS_ctx.authStore.userInfo.roles.join(", "));
        // @ts-ignore
        [authStore,];
    }
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.handleLogout) },
        ...{ class: "logout-btn" },
    });
    // @ts-ignore
    [handleLogout,];
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "theme-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "theme-controls" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
__VLS_asFunctionalElement(__VLS_elements.input)({
    ...{ onChange: (__VLS_ctx.handleThemeChange) },
    type: "radio",
    value: "light",
});
(__VLS_ctx.themeStore.currentTheme);
// @ts-ignore
[handleThemeChange, themeStore,];
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
__VLS_asFunctionalElement(__VLS_elements.input)({
    ...{ onChange: (__VLS_ctx.handleThemeChange) },
    type: "radio",
    value: "dark",
});
(__VLS_ctx.themeStore.currentTheme);
// @ts-ignore
[handleThemeChange, themeStore,];
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
__VLS_asFunctionalElement(__VLS_elements.input)({
    ...{ onChange: (__VLS_ctx.handleThemeChange) },
    type: "radio",
    value: "auto",
});
(__VLS_ctx.themeStore.currentTheme);
// @ts-ignore
[handleThemeChange, themeStore,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
(__VLS_ctx.themeStore.currentTheme);
// @ts-ignore
[themeStore,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "api-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.testApi) },
    disabled: (__VLS_ctx.isTestingApi),
});
// @ts-ignore
[testApi, isTestingApi,];
(__VLS_ctx.isTestingApi ? "测试中..." : "测试API连接");
// @ts-ignore
[isTestingApi,];
if (__VLS_ctx.apiResult) {
    // @ts-ignore
    [apiResult,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "api-result" },
    });
    __VLS_asFunctionalElement(__VLS_elements.pre, __VLS_elements.pre)({});
    (__VLS_ctx.apiResult);
    // @ts-ignore
    [apiResult,];
}
/** @type {__VLS_StyleScopedClasses['auth-example']} */ ;
/** @type {__VLS_StyleScopedClasses['login-section']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['login-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['user-section']} */ ;
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
/** @type {__VLS_StyleScopedClasses['logout-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-section']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['api-section']} */ ;
/** @type {__VLS_StyleScopedClasses['api-result']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        authStore: authStore,
        themeStore: themeStore,
        loginForm: loginForm,
        isTestingApi: isTestingApi,
        apiResult: apiResult,
        handleLogin: handleLogin,
        handleLogout: handleLogout,
        handleThemeChange: handleThemeChange,
        testApi: testApi,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
