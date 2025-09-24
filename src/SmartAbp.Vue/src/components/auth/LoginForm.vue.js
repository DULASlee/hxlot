/// <reference types="D:/BAOBAB/Baobab.SmartAbp/src/SmartAbp.Vue/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import { ref, computed, onMounted, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { debounce } from "lodash-es";
const emit = defineEmits();
// 响应式数据
const loginForm = ref({
    tenantName: "",
    username: "",
    password: "",
    rememberMe: true,
});
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const router = useRouter();
// 使用认证服务的isAuthenticated状态
const { isAuthenticated, authService } = useAuth();
// 输入验证
const usernameError = ref("");
const passwordError = ref("");
// 自动填充记住的用户名和开发测试账号
onMounted(() => {
    const rememberedUsername = localStorage.getItem("remembered_username");
    if (rememberedUsername) {
        loginForm.value.username = rememberedUsername;
        loginForm.value.rememberMe = true;
    }
    // 开发环境下自动填充测试账号
    if (import.meta.env.DEV) {
        // 如果没有记住的用户名，则填充测试账号
        if (!rememberedUsername) {
            loginForm.value.username = "admin";
            loginForm.value.password = "1q2w3E*";
            loginForm.value.rememberMe = true;
        }
        // 添加开发提示
        console.log("开发模式：已自动填充测试账号 admin/1q2w3E*");
    }
    // 检查是否已经登录
    if (isAuthenticated.value) {
        const redirect = new URLSearchParams(window.location.search).get("redirect") || "/";
        router.push(redirect);
    }
    // 添加输入验证
    watchEffect(() => {
        usernameError.value = loginForm.value.username.trim() ? "" : "用户名不能为空";
        passwordError.value = loginForm.value.password ? "" : "密码不能为空";
    });
});
// 密码强度检查
const passwordStrength = computed(() => {
    const password = loginForm.value.password;
    if (!password)
        return 0;
    let strength = 0;
    if (password.length >= 8)
        strength++;
    if (/[A-Z]/.test(password))
        strength++;
    if (/[a-z]/.test(password))
        strength++;
    if (/[0-9]/.test(password))
        strength++;
    if (/[^A-Za-z0-9]/.test(password))
        strength++;
    return strength;
});
// 计算属性
const isFormValid = computed(() => {
    return loginForm.value.username.trim() !== "" && loginForm.value.password.trim() !== "";
});
// 创建防抖配置
const DEBOUNCE_DELAY = 300; // 300ms 延迟
// 登录方法
// 创建防抖的登录处理函数
const handleLogin = debounce(async (e) => {
    if (e)
        e.preventDefault();
    if (loading.value)
        return;
    // 重置错误信息
    errorMessage.value = "";
    usernameError.value = "";
    passwordError.value = "";
    // 表单验证
    let hasError = false;
    if (!loginForm.value.username.trim()) {
        usernameError.value = "请输入用户名";
        hasError = true;
    }
    else if (loginForm.value.username.length < 3) {
        usernameError.value = "用户名长度不能少于3个字符";
        hasError = true;
    }
    if (!loginForm.value.password) {
        passwordError.value = "请输入密码";
        hasError = true;
    }
    else if (loginForm.value.password.length < 6) {
        passwordError.value = "密码长度不能少于6个字符";
        hasError = true;
    }
    if (hasError) {
        const form = document.querySelector(".login-form");
        if (form) {
            form.classList.add("shake");
            setTimeout(() => form.classList.remove("shake"), 500);
        }
        return;
    }
    loading.value = true;
    try {
        // 创建登录参数
        const username = loginForm.value.username.trim();
        const password = loginForm.value.password;
        const tenantName = loginForm.value.tenantName.trim() || undefined;
        const success = await authService.login(username, password, tenantName);
        if (success) {
            // 如果选择了记住我，保存用户名
            if (loginForm.value.rememberMe) {
                localStorage.setItem("remembered_username", username);
            }
            else {
                localStorage.removeItem("remembered_username");
            }
            // 获取重定向URL
            const redirect = new URLSearchParams(window.location.search).get("redirect") || "/";
            // 发出登录成功事件
            emit("login-success", {
                username: loginForm.value.username,
                tenantName: loginForm.value.tenantName,
                rememberMe: loginForm.value.rememberMe,
            });
            // 使用路由导航
            await router.push(redirect);
        }
    }
    catch (error) {
        // 处理不同类型的错误
        if (error.name === "NetworkError") {
            errorMessage.value = "网络连接失败，请检查网络设置";
        }
        else if (error.status === 401) {
            errorMessage.value = "用户名或密码错误";
        }
        else if (error.status === 403) {
            errorMessage.value = "账户已被锁定，请联系管理员";
        }
        else if (error.message?.includes("tenant")) {
            errorMessage.value = "租户信息无效";
        }
        else {
            errorMessage.value = "登录失败，请稍后重试";
        }
        console.error("登录错误:", error);
        // 清除密码
        loginForm.value.password = "";
        // 添加震动效果
        const form = document.querySelector(".login-form");
        if (form) {
            form.classList.add("shake");
            setTimeout(() => {
                form.classList.remove("shake");
            }, 500);
        }
    }
    finally {
        loading.value = false;
    }
}, DEBOUNCE_DELAY);
// 生命周期
onMounted(() => {
    if (isAuthenticated.value) {
        emit("login-success", {
            username: loginForm.value.username,
            tenantName: loginForm.value.tenantName,
            rememberMe: loginForm.value.rememberMe,
        });
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['password-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['password-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-input']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-custom']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-input']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-custom']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-link']} */ ;
/** @type {__VLS_StyleScopedClasses['login-submit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['login-submit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['login-submit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['login-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['login-card']} */ ;
/** @type {__VLS_StyleScopedClasses['system-title']} */ ;
/** @type {__VLS_StyleScopedClasses['form-options']} */ ;
/** @type {__VLS_StyleScopedClasses['login-card']} */ ;
/** @type {__VLS_StyleScopedClasses['system-title']} */ ;
// CSS variable injection
// CSS variable injection end
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "enterprise-login-container" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "login-background" },
});
__VLS_asFunctionalElement(__VLS_elements.div)({
    ...{ class: "bg-pattern" },
});
__VLS_asFunctionalElement(__VLS_elements.div)({
    ...{ class: "bg-overlay" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "login-wrapper" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "login-card" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "login-header" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "company-logo" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    width: "48",
    height: "48",
    viewBox: "0 0 48 48",
    fill: "none",
});
__VLS_asFunctionalElement(__VLS_elements.rect)({
    width: "48",
    height: "48",
    rx: "8",
    fill: "#1e3a5f",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M12 24L18 18L24 24L30 18L36 24",
    stroke: "white",
    'stroke-width': "2.5",
    'stroke-linecap': "round",
});
__VLS_asFunctionalElement(__VLS_elements.circle)({
    cx: "24",
    cy: "32",
    r: "3",
    fill: "white",
});
__VLS_asFunctionalElement(__VLS_elements.rect)({
    x: "20",
    y: "12",
    width: "8",
    height: "4",
    fill: "white",
    opacity: "0.8",
});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({
    ...{ class: "system-title" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "system-subtitle" },
});
__VLS_asFunctionalElement(__VLS_elements.form, __VLS_elements.form)({
    ...{ onSubmit: (__VLS_ctx.handleLogin) },
    ...{ class: "login-form" },
});
// @ts-ignore
[handleLogin,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "input-wrapper" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    value: (__VLS_ctx.loginForm.tenantName),
    type: "text",
    ...{ class: "form-input" },
    placeholder: "请输入租户名称（可选）",
    disabled: (__VLS_ctx.loading),
});
// @ts-ignore
[loginForm, loading,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "input-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    width: "18",
    height: "18",
    fill: "currentColor",
    viewBox: "0 0 20 20",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "form-hint" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "required" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "input-wrapper" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    value: (__VLS_ctx.loginForm.username),
    type: "text",
    ...{ class: "form-input" },
    ...{ class: ({ error: __VLS_ctx.usernameError }) },
    placeholder: "请输入用户名或邮箱地址",
    required: true,
    disabled: (__VLS_ctx.loading),
});
// @ts-ignore
[loginForm, loading, usernameError,];
if (__VLS_ctx.usernameError) {
    // @ts-ignore
    [usernameError,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "input-error" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        width: "16",
        height: "16",
        fill: "currentColor",
        viewBox: "0 0 20 20",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'fill-rule': "evenodd",
        d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z",
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (__VLS_ctx.usernameError);
    // @ts-ignore
    [usernameError,];
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "input-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    width: "18",
    height: "18",
    fill: "currentColor",
    viewBox: "0 0 20 20",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "required" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "input-wrapper" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    type: (__VLS_ctx.showPassword ? 'text' : 'password'),
    ...{ class: "form-input" },
    ...{ class: ({ error: __VLS_ctx.passwordError }) },
    placeholder: "请输入登录密码",
    required: true,
    disabled: (__VLS_ctx.loading),
});
(__VLS_ctx.loginForm.password);
// @ts-ignore
[loginForm, loading, showPassword, passwordError,];
if (__VLS_ctx.passwordError) {
    // @ts-ignore
    [passwordError,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "input-error" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        width: "16",
        height: "16",
        fill: "currentColor",
        viewBox: "0 0 20 20",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'fill-rule': "evenodd",
        d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z",
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (__VLS_ctx.passwordError);
    // @ts-ignore
    [passwordError,];
}
if (__VLS_ctx.loginForm.password && !__VLS_ctx.passwordError) {
    // @ts-ignore
    [loginForm, passwordError,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "password-strength" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div)({
        ...{ class: "password-strength-bar" },
        ...{ class: ('strength-' + __VLS_ctx.passwordStrength) },
    });
    // @ts-ignore
    [passwordStrength,];
}
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showPassword = !__VLS_ctx.showPassword;
            // @ts-ignore
            [showPassword, showPassword,];
        } },
    type: "button",
    ...{ class: "password-toggle" },
    disabled: (__VLS_ctx.loading),
});
// @ts-ignore
[loading,];
if (!__VLS_ctx.showPassword) {
    // @ts-ignore
    [showPassword,];
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        width: "18",
        height: "18",
        fill: "currentColor",
        viewBox: "0 0 20 20",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M10 12a2 2 0 100-4 2 2 0 000 4z",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'fill-rule': "evenodd",
        d: "M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z",
    });
}
else {
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        width: "18",
        height: "18",
        fill: "currentColor",
        viewBox: "0 0 20 20",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'fill-rule': "evenodd",
        d: "M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z",
    });
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "form-options" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "checkbox-wrapper" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    type: "checkbox",
    ...{ class: "checkbox-input" },
    disabled: (__VLS_ctx.loading),
});
(__VLS_ctx.loginForm.rememberMe);
// @ts-ignore
[loginForm, loading,];
__VLS_asFunctionalElement(__VLS_elements.span)({
    ...{ class: "checkbox-custom" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "checkbox-label" },
});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    href: "#",
    ...{ class: "forgot-link" },
});
if (__VLS_ctx.errorMessage) {
    // @ts-ignore
    [errorMessage,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "error-alert" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        width: "20",
        height: "20",
        fill: "currentColor",
        viewBox: "0 0 20 20",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'fill-rule': "evenodd",
        d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z",
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (__VLS_ctx.errorMessage);
    // @ts-ignore
    [errorMessage,];
}
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    type: "submit",
    ...{ class: "login-submit-btn" },
    disabled: (__VLS_ctx.loading || !__VLS_ctx.isFormValid),
});
// @ts-ignore
[loading, isFormValid,];
if (__VLS_ctx.loading) {
    // @ts-ignore
    [loading,];
    __VLS_asFunctionalElement(__VLS_elements.span)({
        ...{ class: "loading-spinner" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        width: "20",
        height: "20",
        fill: "currentColor",
        viewBox: "0 0 20 20",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'fill-rule': "evenodd",
        d: "M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z",
    });
}
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
(__VLS_ctx.loading ? "正在登录..." : "企业登录");
// @ts-ignore
[loading,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "login-footer" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "security-info" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    width: "16",
    height: "16",
    fill: "currentColor",
    viewBox: "0 0 20 20",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    'fill-rule': "evenodd",
    d: "M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z",
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "copyright" },
});
/** @type {__VLS_StyleScopedClasses['enterprise-login-container']} */ ;
/** @type {__VLS_StyleScopedClasses['login-background']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-pattern']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['login-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['login-card']} */ ;
/** @type {__VLS_StyleScopedClasses['login-header']} */ ;
/** @type {__VLS_StyleScopedClasses['company-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['system-title']} */ ;
/** @type {__VLS_StyleScopedClasses['system-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['login-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['form-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['required']} */ ;
/** @type {__VLS_StyleScopedClasses['input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['input-error']} */ ;
/** @type {__VLS_StyleScopedClasses['input-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['required']} */ ;
/** @type {__VLS_StyleScopedClasses['input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['input-error']} */ ;
/** @type {__VLS_StyleScopedClasses['password-strength']} */ ;
/** @type {__VLS_StyleScopedClasses['password-strength-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['password-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['form-options']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-input']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-custom']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-label']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-link']} */ ;
/** @type {__VLS_StyleScopedClasses['error-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['login-submit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['login-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['security-info']} */ ;
/** @type {__VLS_StyleScopedClasses['copyright']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        loginForm: loginForm,
        showPassword: showPassword,
        loading: loading,
        errorMessage: errorMessage,
        usernameError: usernameError,
        passwordError: passwordError,
        passwordStrength: passwordStrength,
        isFormValid: isFormValid,
        handleLogin: handleLogin,
    }),
    __typeEmits: {},
});
export default (await import('vue')).defineComponent({
    __typeEmits: {},
});
; /* PartiallyEnd: #4569/main.vue */
