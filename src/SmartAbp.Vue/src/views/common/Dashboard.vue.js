/// <reference types="D:/BAOBAB/Baobab.SmartAbp/src/SmartAbp.Vue/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import { computed } from "vue";
import { useAuthStore } from "@/stores";
import DashboardView from "@/components/common/DashboardView.vue";
const authStore = useAuthStore();
const userInfo = computed(() => authStore.userInfo || {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    roles: ["admin"],
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "dashboard-wrapper" },
});
/** @type {[typeof DashboardView, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(DashboardView, new DashboardView({
    userInfo: (__VLS_ctx.userInfo),
}));
const __VLS_1 = __VLS_0({
    userInfo: (__VLS_ctx.userInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
// @ts-ignore
[userInfo,];
/** @type {__VLS_StyleScopedClasses['dashboard-wrapper']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        DashboardView: DashboardView,
        userInfo: userInfo,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
