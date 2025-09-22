/// <reference types="D:/BAOBAB/Baobab.SmartAbp/src/SmartAbp.Vue/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useThemeStore } from "@/stores";
const router = useRouter();
const themeStore = useThemeStore();
// 测试数据
const testData = ref("");
const storageResult = ref("");
const windowWidth = ref(window.innerWidth);
const testLogs = ref([]);
// 模拟布局状态（实际应该从父组件获取）
const sidebarCollapsed = ref(false);
const showSubmenu = ref(false);
const activeMenu = ref("dashboard");
const activeTab = ref("/dashboard");
const tabs = ref([{ title: "工作台", path: "/dashboard", closable: false }]);
// 主题配置 - 使用统一的主题系统
const themes = [
    { label: "科技蓝", value: "tech-blue" },
    { label: "深绿色", value: "deep-green" },
    { label: "淡紫色", value: "light-purple" },
    { label: "暗黑模式", value: "dark" },
];
// 计算属性
const deviceType = computed(() => {
    if (windowWidth.value < 768)
        return "移动设备";
    if (windowWidth.value < 1024)
        return "平板设备";
    return "桌面设备";
});
// 方法
const addLog = (message, type = "info") => {
    testLogs.value.unshift({
        time: new Date().toLocaleTimeString(),
        message,
        type,
    });
    // 限制日志数量
    if (testLogs.value.length > 50) {
        testLogs.value = testLogs.value.slice(0, 50);
    }
};
const switchTheme = (theme) => {
    themeStore.setTheme(theme);
    addLog(`主题已切换到: ${theme}`, "success");
};
const toggleDark = () => {
    themeStore.toggleDarkMode();
    addLog(`一键暗黑切换: ${themeStore.isDarkMode ? "暗黑模式" : "浅色模式"}`, "success");
};
const testSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
    addLog(`侧边栏${sidebarCollapsed.value ? "已收起" : "已展开"}`, "info");
};
const testSubmenu = () => {
    showSubmenu.value = !showSubmenu.value;
    addLog(`副菜单${showSubmenu.value ? "已显示" : "已隐藏"}`, "info");
};
const addTestTab = () => {
    const testTab = {
        title: `测试标签 ${tabs.value.length}`,
        path: `/test/${Date.now()}`,
        closable: true,
    };
    tabs.value.push(testTab);
    addLog(`添加了测试标签: ${testTab.title}`, "info");
};
const closeAllTabs = () => {
    const closableCount = tabs.value.filter((tab) => tab.closable).length;
    tabs.value = tabs.value.filter((tab) => !tab.closable);
    addLog(`关闭了 ${closableCount} 个标签页`, "info");
};
const navigateTo = (path) => {
    router.push(path);
    addLog(`导航到: ${path}`, "info");
};
const saveToStorage = () => {
    if (!testData.value) {
        storageResult.value = "请输入测试数据";
        addLog("保存失败: 数据为空", "error");
        return;
    }
    localStorage.setItem("smartabp_test_data", testData.value);
    storageResult.value = "数据已保存到本地存储";
    addLog(`保存数据到本地存储: ${testData.value}`, "success");
};
const loadFromStorage = () => {
    const data = localStorage.getItem("smartabp_test_data");
    if (data) {
        testData.value = data;
        storageResult.value = "数据已从本地存储加载";
        addLog(`从本地存储加载数据: ${data}`, "success");
    }
    else {
        storageResult.value = "本地存储中没有数据";
        addLog("本地存储中没有找到数据", "warning");
    }
};
const clearStorage = () => {
    localStorage.removeItem("smartabp_test_data");
    testData.value = "";
    storageResult.value = "本地存储数据已清除";
    addLog("本地存储数据已清除", "info");
};
const testResponsive = () => {
    addLog(`当前窗口宽度: ${windowWidth.value}px, 设备类型: ${deviceType.value}`, "info");
};
const clearLogs = () => {
    testLogs.value = [];
    addLog("测试日志已清除", "info");
};
// 窗口大小变化监听
const handleResize = () => {
    windowWidth.value = window.innerWidth;
};
// 生命周期
onMounted(() => {
    window.addEventListener("resize", handleResize);
    addLog("SmartAbp 系统测试页面已加载", "success");
    addLog(`当前主题: ${themeStore.currentTheme}`, "info");
    addLog(`当前路由: ${router.currentRoute.value.path}`, "info");
});
onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['test-section']} */ ;
/** @type {__VLS_StyleScopedClasses['test-card']} */ ;
/** @type {__VLS_StyleScopedClasses['status-info']} */ ;
/** @type {__VLS_StyleScopedClasses['status-info']} */ ;
/** @type {__VLS_StyleScopedClasses['layout-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['storage-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-toggle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['layout-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['storage-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-toggle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-toggle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['responsive-test']} */ ;
/** @type {__VLS_StyleScopedClasses['responsive-test']} */ ;
/** @type {__VLS_StyleScopedClasses['responsive-test']} */ ;
/** @type {__VLS_StyleScopedClasses['log-item']} */ ;
/** @type {__VLS_StyleScopedClasses['log-item']} */ ;
/** @type {__VLS_StyleScopedClasses['log-message']} */ ;
/** @type {__VLS_StyleScopedClasses['log-item']} */ ;
/** @type {__VLS_StyleScopedClasses['log-message']} */ ;
/** @type {__VLS_StyleScopedClasses['log-item']} */ ;
/** @type {__VLS_StyleScopedClasses['log-message']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-logs-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['test-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['layout-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['storage-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['layout-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['storage-buttons']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-view" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-content" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-grid" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-card" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "status-info" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
(__VLS_ctx.themeStore.currentTheme);
// @ts-ignore
[themeStore,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
(__VLS_ctx.themeStore.isDarkMode ? "是" : "否");
// @ts-ignore
[themeStore,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
(__VLS_ctx.themeStore.currentTheme);
// @ts-ignore
[themeStore,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-card" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "theme-buttons" },
});
for (const [theme] of __VLS_getVForSourceType((__VLS_ctx.themes))) {
    // @ts-ignore
    [themes,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.switchTheme(theme.value);
                // @ts-ignore
                [switchTheme,];
            } },
        key: (theme.value),
        ...{ class: (['theme-btn', { active: __VLS_ctx.themeStore.currentTheme === theme.value }]) },
    });
    // @ts-ignore
    [themeStore,];
    (theme.label);
}
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.toggleDark) },
    ...{ class: "dark-toggle-btn" },
});
// @ts-ignore
[toggleDark,];
(__VLS_ctx.themeStore.isDarkMode ? "切换到浅色" : "切换到深色");
// @ts-ignore
[themeStore,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-grid" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-card" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "status-info" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
(__VLS_ctx.sidebarCollapsed ? "已收起" : "已展开");
// @ts-ignore
[sidebarCollapsed,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
(__VLS_ctx.showSubmenu ? "显示" : "隐藏");
// @ts-ignore
[showSubmenu,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
(__VLS_ctx.activeMenu);
// @ts-ignore
[activeMenu,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "layout-buttons" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.testSidebar) },
});
// @ts-ignore
[testSidebar,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.testSubmenu) },
});
// @ts-ignore
[testSubmenu,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-card" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "status-info" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
(__VLS_ctx.activeTab);
// @ts-ignore
[activeTab,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
(__VLS_ctx.tabs.length);
// @ts-ignore
[tabs,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "tab-buttons" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.addTestTab) },
});
// @ts-ignore
[addTestTab,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.closeAllTabs) },
});
// @ts-ignore
[closeAllTabs,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-grid" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-card" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "nav-buttons" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigateTo('/Admin/users');
            // @ts-ignore
            [navigateTo,];
        } },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigateTo('/Admin/roles');
            // @ts-ignore
            [navigateTo,];
        } },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigateTo('/Admin/permissions');
            // @ts-ignore
            [navigateTo,];
        } },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-card" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "nav-buttons" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigateTo('/Project');
            // @ts-ignore
            [navigateTo,];
        } },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigateTo('/Project/analysis');
            // @ts-ignore
            [navigateTo,];
        } },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-card" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "nav-buttons" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigateTo('/profile');
            // @ts-ignore
            [navigateTo,];
        } },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigateTo('/Admin/settings');
            // @ts-ignore
            [navigateTo,];
        } },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigateTo('/dashboard');
            // @ts-ignore
            [navigateTo,];
        } },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-grid" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-card" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "storage-test" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    value: (__VLS_ctx.testData),
    type: "text",
    placeholder: "输入测试数据",
    ...{ class: "test-input" },
});
// @ts-ignore
[testData,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "storage-buttons" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.saveToStorage) },
});
// @ts-ignore
[saveToStorage,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.loadFromStorage) },
});
// @ts-ignore
[loadFromStorage,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.clearStorage) },
});
// @ts-ignore
[clearStorage,];
if (__VLS_ctx.storageResult) {
    // @ts-ignore
    [storageResult,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "storage-result" },
    });
    (__VLS_ctx.storageResult);
    // @ts-ignore
    [storageResult,];
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-card" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "responsive-test" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
(__VLS_ctx.windowWidth);
// @ts-ignore
[windowWidth,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
(__VLS_ctx.deviceType);
// @ts-ignore
[deviceType,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.testResponsive) },
});
// @ts-ignore
[testResponsive,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "test-logs" },
});
for (const [log, index] of __VLS_getVForSourceType((__VLS_ctx.testLogs))) {
    // @ts-ignore
    [testLogs,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        key: (index),
        ...{ class: (['log-item', log.type]) },
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
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.clearLogs) },
    ...{ class: "clear-logs-btn" },
});
// @ts-ignore
[clearLogs,];
/** @type {__VLS_StyleScopedClasses['test-view']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['test-content']} */ ;
/** @type {__VLS_StyleScopedClasses['test-section']} */ ;
/** @type {__VLS_StyleScopedClasses['test-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['test-card']} */ ;
/** @type {__VLS_StyleScopedClasses['status-info']} */ ;
/** @type {__VLS_StyleScopedClasses['test-card']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-toggle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['test-section']} */ ;
/** @type {__VLS_StyleScopedClasses['test-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['test-card']} */ ;
/** @type {__VLS_StyleScopedClasses['status-info']} */ ;
/** @type {__VLS_StyleScopedClasses['layout-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['test-card']} */ ;
/** @type {__VLS_StyleScopedClasses['status-info']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['test-section']} */ ;
/** @type {__VLS_StyleScopedClasses['test-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['test-card']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['test-card']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['test-card']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['test-section']} */ ;
/** @type {__VLS_StyleScopedClasses['test-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['test-card']} */ ;
/** @type {__VLS_StyleScopedClasses['storage-test']} */ ;
/** @type {__VLS_StyleScopedClasses['test-input']} */ ;
/** @type {__VLS_StyleScopedClasses['storage-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['storage-result']} */ ;
/** @type {__VLS_StyleScopedClasses['test-card']} */ ;
/** @type {__VLS_StyleScopedClasses['responsive-test']} */ ;
/** @type {__VLS_StyleScopedClasses['test-section']} */ ;
/** @type {__VLS_StyleScopedClasses['test-logs']} */ ;
/** @type {__VLS_StyleScopedClasses['log-item']} */ ;
/** @type {__VLS_StyleScopedClasses['log-time']} */ ;
/** @type {__VLS_StyleScopedClasses['log-message']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-logs-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        themeStore: themeStore,
        testData: testData,
        storageResult: storageResult,
        windowWidth: windowWidth,
        testLogs: testLogs,
        sidebarCollapsed: sidebarCollapsed,
        showSubmenu: showSubmenu,
        activeMenu: activeMenu,
        activeTab: activeTab,
        tabs: tabs,
        themes: themes,
        deviceType: deviceType,
        switchTheme: switchTheme,
        toggleDark: toggleDark,
        testSidebar: testSidebar,
        testSubmenu: testSubmenu,
        addTestTab: addTestTab,
        closeAllTabs: closeAllTabs,
        navigateTo: navigateTo,
        saveToStorage: saveToStorage,
        loadFromStorage: loadFromStorage,
        clearStorage: clearStorage,
        testResponsive: testResponsive,
        clearLogs: clearLogs,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
