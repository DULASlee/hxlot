/// <reference types="D:/BAOBAB/Baobab.SmartAbp/src/SmartAbp.Vue/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import { logger } from "@/utils/logger";
import { logManager } from "@/utils/logManager";
import LogViewer from "@/views/log/LogViewer.vue";
// 基础日志记录示例
const logInfo = () => {
    logger.info("用户操作：点击了信息按钮", {
        component: "QuickStart",
        action: "click_info_button",
        timestamp: new Date().toISOString(),
        userId: "demo-user-123",
    });
};
const logWarning = () => {
    logger.warn("系统警告：检测到潜在问题", {
        component: "QuickStart",
        issue: "内存使用率较高",
        threshold: "85%",
        current: "92%",
    });
};
const logError = () => {
    logger.error("系统错误：操作失败", {
        component: "QuickStart",
        error: "网络连接超时",
        code: "NETWORK_TIMEOUT",
        details: "请求超过30秒未响应",
    });
};
// 性能追踪示例
const trackPerformance = async () => {
    const tracker = logManager.startPerformanceTracking("user-interaction");
    // 模拟一些处理时间
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 500));
    tracker.end({
        operation: "用户交互处理",
        success: true,
        itemsProcessed: Math.floor(Math.random() * 100) + 1,
    });
};
const simulateApiCall = async () => {
    const tracker = logManager.startPerformanceTracking("api-request");
    try {
        // 模拟API调用
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                Math.random() > 0.2 ? resolve("success") : reject(new Error("API错误"));
            }, Math.random() * 3000 + 1000);
        });
        tracker.end({
            endpoint: "/api/users",
            method: "GET",
            status: 200,
            dataSize: "2.5KB",
        });
        logger.info("API调用成功", {
            endpoint: "/api/users",
            responseTime: tracker.duration + "ms",
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        tracker.end({
            endpoint: "/api/users",
            method: "GET",
            status: 500,
            error: errorMessage,
        });
        logger.error("API调用失败", {
            endpoint: "/api/users",
            error: errorMessage,
        });
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['demo-section']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-info']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-warning']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-error']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "quick-start" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "demo-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "button-group" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.logInfo) },
    ...{ class: "btn-info" },
});
// @ts-ignore
[logInfo,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.logWarning) },
    ...{ class: "btn-warning" },
});
// @ts-ignore
[logWarning,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.logError) },
    ...{ class: "btn-error" },
});
// @ts-ignore
[logError,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "demo-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "button-group" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.trackPerformance) },
    ...{ class: "btn-primary" },
});
// @ts-ignore
[trackPerformance,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.simulateApiCall) },
    ...{ class: "btn-secondary" },
});
// @ts-ignore
[simulateApiCall,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "demo-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
/** @type {[typeof LogViewer, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(LogViewer, new LogViewer({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
/** @type {__VLS_StyleScopedClasses['quick-start']} */ ;
/** @type {__VLS_StyleScopedClasses['demo-section']} */ ;
/** @type {__VLS_StyleScopedClasses['button-group']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-info']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-warning']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-error']} */ ;
/** @type {__VLS_StyleScopedClasses['demo-section']} */ ;
/** @type {__VLS_StyleScopedClasses['button-group']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['demo-section']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        LogViewer: LogViewer,
        logInfo: logInfo,
        logWarning: logWarning,
        logError: logError,
        trackPerformance: trackPerformance,
        simulateApiCall: simulateApiCall,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
