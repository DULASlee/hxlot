/// <reference types="D:/BAOBAB/Baobab.SmartAbp/src/SmartAbp.Vue/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useAuthStore } from "@/stores";
import { authService } from "@/utils/auth";
import { api } from "@/utils/api";
import dayjs from "dayjs";
// 使用 stores
const authStore = useAuthStore();
// 表单引用
const loginFormRef = ref();
// 登录表单数据
const loginForm = reactive({
    username: "",
    password: "",
});
// 表单验证规则
const loginRules = {
    username: [
        { required: true, message: "请输入用户名", trigger: "blur" },
        { min: 2, max: 50, message: "用户名长度在 2 到 50 个字符", trigger: "blur" },
    ],
    password: [
        { required: true, message: "请输入密码", trigger: "blur" },
        { min: 6, max: 100, message: "密码长度在 6 到 100 个字符", trigger: "blur" },
    ],
};
// 测试状态
const testing = reactive({
    api: false,
    userInfo: false,
});
// API 测试结果
const apiTestResult = ref(null);
// 连接状态
const connectionStatus = computed(() => {
    if (apiTestResult.value === null) {
        return { type: "info", text: "未测试" };
    }
    return apiTestResult.value.success
        ? { type: "success", text: "连接正常" }
        : { type: "danger", text: "连接异常" };
});
// 测试日志
const testLogs = ref([]);
// 添加日志
const addLog = (type, message) => {
    testLogs.value.unshift({
        time: dayjs().format("HH:mm:ss"),
        type,
        message,
    });
    // 限制日志数量
    if (testLogs.value.length > 50) {
        testLogs.value = testLogs.value.slice(0, 50);
    }
};
// 清空日志
const clearLogs = () => {
    testLogs.value = [];
    addLog("info", "日志已清空");
};
// 测试 API 连接
const testApiConnection = async () => {
    testing.api = true;
    addLog("info", "开始测试 API 连接...");
    try {
        // API健康检查
        await api.get("/health-status");
        apiTestResult.value = {
            success: true,
            message: `连接成功！响应时间: ${Date.now() % 1000}ms`,
        };
        addLog("success", "API 连接测试成功");
        ElMessage.success("API 连接正常");
    }
    catch (error) {
        apiTestResult.value = {
            success: false,
            message: `连接失败: ${error.message || "未知错误"}`,
        };
        addLog("error", `API 连接失败: ${error.message}`);
        ElMessage.error("API 连接失败");
    }
    finally {
        testing.api = false;
    }
};
// 填充测试数据
const fillTestData = (type) => {
    const testData = {
        admin: { username: "admin", password: "1q2w3E*" },
        user: { username: "testuser", password: "Test123!" },
        invalid: { username: "invalid", password: "wrongpass" },
    };
    const data = testData[type];
    loginForm.username = data.username;
    loginForm.password = data.password;
    addLog("info", `已填入${type === "admin" ? "管理员" : type === "user" ? "普通用户" : "无效"}测试数据`);
};
// 处理登录
const handleLogin = async () => {
    if (!loginFormRef.value)
        return;
    try {
        const valid = await loginFormRef.value.validate();
        if (!valid)
            return;
        addLog("info", `开始登录测试，用户名: ${loginForm.username}`);
        const success = await authService.login({
            username: loginForm.username,
            password: loginForm.password,
        });
        if (success) {
            addLog("success", "登录成功！");
            ElMessage.success("登录成功！");
            // 自动获取用户信息
            await testUserInfo();
        }
    }
    catch (error) {
        const errorMsg = error.message || "登录失败";
        addLog("error", `登录失败: ${errorMsg}`);
        ElMessage.error(errorMsg);
    }
};
// 测试获取用户信息
const testUserInfo = async () => {
    testing.userInfo = true;
    addLog("info", "开始获取用户信息...");
    try {
        const userInfo = await authService.fetchUserInfo();
        if (userInfo) {
            addLog("success", `用户信息获取成功: ${userInfo.userName}`);
            ElMessage.success("用户信息获取成功");
        }
        else {
            addLog("warning", "用户信息获取失败");
            ElMessage.warning("用户信息获取失败");
        }
    }
    catch (error) {
        addLog("error", `用户信息获取失败: ${error.message}`);
        ElMessage.error("用户信息获取失败");
    }
    finally {
        testing.userInfo = false;
    }
};
// 处理登出
const handleLogout = async () => {
    try {
        await ElMessageBox.confirm("确定要登出吗？", "确认登出", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
        });
        addLog("info", "开始登出测试...");
        await authService.logout();
        addLog("success", "登出成功！");
        ElMessage.success("登出成功！");
    }
    catch (error) {
        if (error !== "cancel") {
            addLog("error", `登出失败: ${error.message}`);
            ElMessage.error("登出失败");
        }
    }
};
// 组件挂载时自动测试 API 连接
onMounted(() => {
    addLog("info", "SmartAbp 登录功能测试页面已加载");
    testApiConnection();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['log-item']} */ ;
/** @type {__VLS_StyleScopedClasses['login-test-container']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-test-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "login-test-container" },
});
const __VLS_0 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
ElCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "login-card" },
    shadow: "hover",
}));
const __VLS_2 = __VLS_1({
    ...{ class: "login-card" },
    shadow: "hover",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_4 } = __VLS_3.slots;
{
    const { header: __VLS_5 } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "card-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
    const __VLS_6 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    ElTag;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
        type: __VLS_ctx.connectionStatus.type,
    }));
    const __VLS_8 = __VLS_7({
        type: __VLS_ctx.connectionStatus.type,
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    const { default: __VLS_10 } = __VLS_9.slots;
    // @ts-ignore
    [connectionStatus,];
    (__VLS_ctx.connectionStatus.text);
    // @ts-ignore
    [connectionStatus,];
    var __VLS_9;
}
const __VLS_11 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
ElDivider;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({
    contentPosition: "left",
}));
const __VLS_13 = __VLS_12({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
const { default: __VLS_15 } = __VLS_14.slots;
var __VLS_14;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-section" },
});
const __VLS_16 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
ElButton;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    loading: (__VLS_ctx.testing.api),
    type: "primary",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    loading: (__VLS_ctx.testing.api),
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
const __VLS_22 = ({ click: {} },
    { onClick: (__VLS_ctx.testApiConnection) });
const { default: __VLS_23 } = __VLS_19.slots;
// @ts-ignore
[testing, testApiConnection,];
var __VLS_19;
if (__VLS_ctx.apiTestResult) {
    // @ts-ignore
    [apiTestResult,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "test-result" },
    });
    const __VLS_24 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    ElAlert;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        title: (__VLS_ctx.apiTestResult.success ? 'API 连接成功' : 'API 连接失败'),
        type: (__VLS_ctx.apiTestResult.success ? 'success' : 'error'),
        description: (__VLS_ctx.apiTestResult.message),
        showIcon: true,
    }));
    const __VLS_26 = __VLS_25({
        title: (__VLS_ctx.apiTestResult.success ? 'API 连接成功' : 'API 连接失败'),
        type: (__VLS_ctx.apiTestResult.success ? 'success' : 'error'),
        description: (__VLS_ctx.apiTestResult.message),
        showIcon: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    // @ts-ignore
    [apiTestResult, apiTestResult, apiTestResult,];
}
const __VLS_29 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
ElDivider;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    contentPosition: "left",
}));
const __VLS_31 = __VLS_30({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
const { default: __VLS_33 } = __VLS_32.slots;
var __VLS_32;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "login-section" },
});
const __VLS_34 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
ElForm;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
    ...{ 'onSubmit': {} },
    ref: "loginFormRef",
    model: (__VLS_ctx.loginForm),
    rules: (__VLS_ctx.loginRules),
    labelWidth: "80px",
}));
const __VLS_36 = __VLS_35({
    ...{ 'onSubmit': {} },
    ref: "loginFormRef",
    model: (__VLS_ctx.loginForm),
    rules: (__VLS_ctx.loginRules),
    labelWidth: "80px",
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
let __VLS_38;
let __VLS_39;
const __VLS_40 = ({ submit: {} },
    { onSubmit: (__VLS_ctx.handleLogin) });
/** @type {typeof __VLS_ctx.loginFormRef} */ ;
var __VLS_41 = {};
const { default: __VLS_43 } = __VLS_37.slots;
// @ts-ignore
[loginForm, loginRules, handleLogin, loginFormRef,];
const __VLS_44 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
ElFormItem;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    label: "用户名",
    prop: "username",
}));
const __VLS_46 = __VLS_45({
    label: "用户名",
    prop: "username",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const { default: __VLS_48 } = __VLS_47.slots;
const __VLS_49 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
ElInput;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
    modelValue: (__VLS_ctx.loginForm.username),
    placeholder: "请输入用户名",
    clearable: true,
}));
const __VLS_51 = __VLS_50({
    modelValue: (__VLS_ctx.loginForm.username),
    placeholder: "请输入用户名",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
// @ts-ignore
[loginForm,];
var __VLS_47;
const __VLS_54 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
ElFormItem;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
    label: "密码",
    prop: "password",
}));
const __VLS_56 = __VLS_55({
    label: "密码",
    prop: "password",
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
const { default: __VLS_58 } = __VLS_57.slots;
const __VLS_59 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
ElInput;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
    modelValue: (__VLS_ctx.loginForm.password),
    type: "password",
    placeholder: "请输入密码",
    showPassword: true,
    clearable: true,
}));
const __VLS_61 = __VLS_60({
    modelValue: (__VLS_ctx.loginForm.password),
    type: "password",
    placeholder: "请输入密码",
    showPassword: true,
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
// @ts-ignore
[loginForm,];
var __VLS_57;
const __VLS_64 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
ElFormItem;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({}));
const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
const { default: __VLS_68 } = __VLS_67.slots;
const __VLS_69 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
ElButton;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.authStore.isLoading),
    ...{ style: {} },
}));
const __VLS_71 = __VLS_70({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.authStore.isLoading),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
let __VLS_73;
let __VLS_74;
const __VLS_75 = ({ click: {} },
    { onClick: (__VLS_ctx.handleLogin) });
const { default: __VLS_76 } = __VLS_72.slots;
// @ts-ignore
[handleLogin, authStore,];
(__VLS_ctx.authStore.isLoading ? "登录中..." : "登录测试");
// @ts-ignore
[authStore,];
var __VLS_72;
var __VLS_67;
var __VLS_37;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "quick-test-buttons" },
});
const __VLS_77 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
ElButton;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
    ...{ 'onClick': {} },
    size: "small",
}));
const __VLS_79 = __VLS_78({
    ...{ 'onClick': {} },
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
let __VLS_81;
let __VLS_82;
const __VLS_83 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.fillTestData('admin');
            // @ts-ignore
            [fillTestData,];
        } });
const { default: __VLS_84 } = __VLS_80.slots;
var __VLS_80;
const __VLS_85 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
ElButton;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
    ...{ 'onClick': {} },
    size: "small",
}));
const __VLS_87 = __VLS_86({
    ...{ 'onClick': {} },
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
let __VLS_89;
let __VLS_90;
const __VLS_91 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.fillTestData('user');
            // @ts-ignore
            [fillTestData,];
        } });
const { default: __VLS_92 } = __VLS_88.slots;
var __VLS_88;
const __VLS_93 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
ElButton;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
    ...{ 'onClick': {} },
    size: "small",
    type: "warning",
}));
const __VLS_95 = __VLS_94({
    ...{ 'onClick': {} },
    size: "small",
    type: "warning",
}, ...__VLS_functionalComponentArgsRest(__VLS_94));
let __VLS_97;
let __VLS_98;
const __VLS_99 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.fillTestData('invalid');
            // @ts-ignore
            [fillTestData,];
        } });
const { default: __VLS_100 } = __VLS_96.slots;
var __VLS_96;
const __VLS_101 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
ElDivider;
// @ts-ignore
const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
    contentPosition: "left",
}));
const __VLS_103 = __VLS_102({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_102));
const { default: __VLS_105 } = __VLS_104.slots;
var __VLS_104;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "auth-status" },
});
const __VLS_106 = {}.ElDescriptions;
/** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
// @ts-ignore
ElDescriptions;
// @ts-ignore
const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
    column: (2),
    border: true,
}));
const __VLS_108 = __VLS_107({
    column: (2),
    border: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_107));
const { default: __VLS_110 } = __VLS_109.slots;
const __VLS_111 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
ElDescriptionsItem;
// @ts-ignore
const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({
    label: "认证状态",
}));
const __VLS_113 = __VLS_112({
    label: "认证状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_112));
const { default: __VLS_115 } = __VLS_114.slots;
const __VLS_116 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
ElTag;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    type: (__VLS_ctx.authStore.isAuthenticated ? 'success' : 'danger'),
}));
const __VLS_118 = __VLS_117({
    type: (__VLS_ctx.authStore.isAuthenticated ? 'success' : 'danger'),
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
const { default: __VLS_120 } = __VLS_119.slots;
// @ts-ignore
[authStore,];
(__VLS_ctx.authStore.isAuthenticated ? "已认证" : "未认证");
// @ts-ignore
[authStore,];
var __VLS_119;
var __VLS_114;
const __VLS_121 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
ElDescriptionsItem;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
    label: "Token",
}));
const __VLS_123 = __VLS_122({
    label: "Token",
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
const { default: __VLS_125 } = __VLS_124.slots;
const __VLS_126 = {}.ElText;
/** @type {[typeof __VLS_components.ElText, typeof __VLS_components.elText, typeof __VLS_components.ElText, typeof __VLS_components.elText, ]} */ ;
// @ts-ignore
ElText;
// @ts-ignore
const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
    ...{ class: "token-display" },
    truncated: true,
}));
const __VLS_128 = __VLS_127({
    ...{ class: "token-display" },
    truncated: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_127));
const { default: __VLS_130 } = __VLS_129.slots;
(__VLS_ctx.authStore.token || "无");
// @ts-ignore
[authStore,];
var __VLS_129;
var __VLS_124;
const __VLS_131 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
ElDescriptionsItem;
// @ts-ignore
const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({
    label: "用户ID",
}));
const __VLS_133 = __VLS_132({
    label: "用户ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_132));
const { default: __VLS_135 } = __VLS_134.slots;
(__VLS_ctx.authStore.userInfo?.id || "无");
// @ts-ignore
[authStore,];
var __VLS_134;
const __VLS_136 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
ElDescriptionsItem;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    label: "用户名",
}));
const __VLS_138 = __VLS_137({
    label: "用户名",
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
const { default: __VLS_140 } = __VLS_139.slots;
(__VLS_ctx.authStore.userInfo?.username || "无");
// @ts-ignore
[authStore,];
var __VLS_139;
const __VLS_141 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
ElDescriptionsItem;
// @ts-ignore
const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
    label: "邮箱",
}));
const __VLS_143 = __VLS_142({
    label: "邮箱",
}, ...__VLS_functionalComponentArgsRest(__VLS_142));
const { default: __VLS_145 } = __VLS_144.slots;
(__VLS_ctx.authStore.userInfo?.email || "无");
// @ts-ignore
[authStore,];
var __VLS_144;
const __VLS_146 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
ElDescriptionsItem;
// @ts-ignore
const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
    label: "角色",
}));
const __VLS_148 = __VLS_147({
    label: "角色",
}, ...__VLS_functionalComponentArgsRest(__VLS_147));
const { default: __VLS_150 } = __VLS_149.slots;
for (const [role] of __VLS_getVForSourceType((__VLS_ctx.authStore.userInfo?.roles || []))) {
    // @ts-ignore
    [authStore,];
    const __VLS_151 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    ElTag;
    // @ts-ignore
    const __VLS_152 = __VLS_asFunctionalComponent(__VLS_151, new __VLS_151({
        key: (role),
        size: "small",
        ...{ style: {} },
    }));
    const __VLS_153 = __VLS_152({
        key: (role),
        size: "small",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_152));
    const { default: __VLS_155 } = __VLS_154.slots;
    (role);
    var __VLS_154;
}
if (!__VLS_ctx.authStore.userInfo?.roles?.length) {
    // @ts-ignore
    [authStore,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
}
var __VLS_149;
var __VLS_109;
if (__VLS_ctx.authStore.isAuthenticated) {
    // @ts-ignore
    [authStore,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "auth-actions" },
    });
    const __VLS_156 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    ElButton;
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.testing.userInfo),
        type: "info",
    }));
    const __VLS_158 = __VLS_157({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.testing.userInfo),
        type: "info",
    }, ...__VLS_functionalComponentArgsRest(__VLS_157));
    let __VLS_160;
    let __VLS_161;
    const __VLS_162 = ({ click: {} },
        { onClick: (__VLS_ctx.testUserInfo) });
    const { default: __VLS_163 } = __VLS_159.slots;
    // @ts-ignore
    [testing, testUserInfo,];
    var __VLS_159;
    const __VLS_164 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    ElButton;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
        ...{ 'onClick': {} },
        type: "danger",
    }));
    const __VLS_166 = __VLS_165({
        ...{ 'onClick': {} },
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    let __VLS_168;
    let __VLS_169;
    const __VLS_170 = ({ click: {} },
        { onClick: (__VLS_ctx.handleLogout) });
    const { default: __VLS_171 } = __VLS_167.slots;
    // @ts-ignore
    [handleLogout,];
    var __VLS_167;
}
const __VLS_172 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
ElDivider;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    contentPosition: "left",
}));
const __VLS_174 = __VLS_173({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
const { default: __VLS_176 } = __VLS_175.slots;
var __VLS_175;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-logs" },
});
const __VLS_177 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
ElButton;
// @ts-ignore
const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({
    ...{ 'onClick': {} },
    size: "small",
    type: "warning",
}));
const __VLS_179 = __VLS_178({
    ...{ 'onClick': {} },
    size: "small",
    type: "warning",
}, ...__VLS_functionalComponentArgsRest(__VLS_178));
let __VLS_181;
let __VLS_182;
const __VLS_183 = ({ click: {} },
    { onClick: (__VLS_ctx.clearLogs) });
const { default: __VLS_184 } = __VLS_180.slots;
// @ts-ignore
[clearLogs,];
var __VLS_180;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "logs-container" },
});
for (const [log, index] of __VLS_getVForSourceType((__VLS_ctx.testLogs))) {
    // @ts-ignore
    [testLogs,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        key: (index),
        ...{ class: (['log-item', `log-${log.type}`]) },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "log-time" },
    });
    (log.time);
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "log-message" },
    });
    (log.message);
}
if (__VLS_ctx.testLogs.length === 0) {
    // @ts-ignore
    [testLogs,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "no-logs" },
    });
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['login-test-container']} */ ;
/** @type {__VLS_StyleScopedClasses['login-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['test-section']} */ ;
/** @type {__VLS_StyleScopedClasses['test-result']} */ ;
/** @type {__VLS_StyleScopedClasses['login-section']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-test-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-status']} */ ;
/** @type {__VLS_StyleScopedClasses['token-display']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['test-logs']} */ ;
/** @type {__VLS_StyleScopedClasses['logs-container']} */ ;
/** @type {__VLS_StyleScopedClasses['log-item']} */ ;
/** @type {__VLS_StyleScopedClasses['log-time']} */ ;
/** @type {__VLS_StyleScopedClasses['log-message']} */ ;
/** @type {__VLS_StyleScopedClasses['no-logs']} */ ;
// @ts-ignore
var __VLS_42 = __VLS_41;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        authStore: authStore,
        loginFormRef: loginFormRef,
        loginForm: loginForm,
        loginRules: loginRules,
        testing: testing,
        apiTestResult: apiTestResult,
        connectionStatus: connectionStatus,
        testLogs: testLogs,
        clearLogs: clearLogs,
        testApiConnection: testApiConnection,
        fillTestData: fillTestData,
        handleLogin: handleLogin,
        testUserInfo: testUserInfo,
        handleLogout: handleLogout,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
