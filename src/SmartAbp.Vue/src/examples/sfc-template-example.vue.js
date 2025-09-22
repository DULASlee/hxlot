/// <reference types="D:/BAOBAB/Baobab.SmartAbp/src/SmartAbp.Vue/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import { ref } from "vue";
const title = "SFC Template Example";
const count = ref(0);
const inc = () => {
    count.value++;
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
    ...{ class: "example-card" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
(__VLS_ctx.title);
// @ts-ignore
[title,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.inc) },
    ...{ class: "btn" },
});
// @ts-ignore
[inc,];
(__VLS_ctx.count);
// @ts-ignore
[count,];
var __VLS_0 = {};
/** @type {__VLS_StyleScopedClasses['example-card']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
// @ts-ignore
var __VLS_1 = __VLS_0;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        title: title,
        count: count,
        inc: inc,
    }),
});
const __VLS_component = (await import('vue')).defineComponent({});
export default {};
; /* PartiallyEnd: #4569/main.vue */
