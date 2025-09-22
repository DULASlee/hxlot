/// <reference types="D:/BAOBAB/Baobab.SmartAbp/src/SmartAbp.Vue/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
// 导入低代码引擎 (暂时注释，等待迁移完成)
// import { LowCodeKernel, Vue3Plugin } from '@/lowcode'
// 表单数据
const form = reactive({
    componentName: "MyComponent",
    componentType: "component",
    features: ["props", "style"],
});
// 状态管理
const generating = ref(false);
const generatedCode = ref("");
const generationCount = ref(0);
const pluginCount = ref(0);
const generationInfo = ref(null);
// 内核状态
const kernelStatus = computed(() => {
    if (pluginCount.value > 0) {
        return { type: "success", text: "就绪" };
    }
    return { type: "info", text: "未初始化" };
});
// 当前Schema
const currentSchema = computed(() => {
    return {
        id: `${form.componentName.toLowerCase()}-001`,
        version: "1.0.0",
        type: form.componentType,
        metadata: {
            name: form.componentName,
            description: `自动生成的${form.componentName}组件`,
        },
        template: {
            type: "template",
            content: {
                tag: "div",
                props: {
                    class: form.componentName.toLowerCase(),
                },
                children: [`Hello from ${form.componentName}!`],
            },
        },
        props: form.features.includes("props")
            ? [
                {
                    name: "title",
                    type: "string",
                    required: false,
                    default: "Default Title",
                },
            ]
            : undefined,
        emits: form.features.includes("emits")
            ? [
                {
                    name: "click",
                    payload: "MouseEvent",
                },
            ]
            : undefined,
        script: {
            lang: "ts",
            setup: true,
            computed: form.features.includes("computed")
                ? [
                    {
                        name: "displayTitle",
                        get: 'title || "No Title"',
                        type: "string",
                    },
                ]
                : undefined,
            methods: form.features.includes("methods")
                ? [
                    {
                        name: "handleClick",
                        params: [{ name: "event", type: "MouseEvent" }],
                        returnType: "void",
                        body: 'emit("click", event);',
                    },
                ]
                : undefined,
            lifecycle: form.features.includes("lifecycle")
                ? [
                    {
                        hook: "onMounted",
                        body: 'console.log("Component mounted");',
                    },
                ]
                : undefined,
        },
        style: form.features.includes("style")
            ? {
                lang: "css",
                scoped: true,
                content: {
                    [`.${form.componentName.toLowerCase()}`]: {
                        padding: "16px",
                        "border-radius": "8px",
                        background: "#f5f5f5",
                    },
                },
            }
            : undefined,
    };
});
// 生成代码
const generateCode = async () => {
    generating.value = true;
    generationInfo.value = null;
    try {
        // 模拟低代码引擎（迁移完成后使用真实的引擎）
        await simulateCodeGeneration();
        generationCount.value++;
        ElMessage.success("代码生成成功！");
    }
    catch (error) {
        console.error("代码生成失败：", error);
        ElMessage.error("代码生成失败，请检查配置");
    }
    finally {
        generating.value = false;
    }
};
// 模拟代码生成（迁移完成后替换为真实实现）
const simulateCodeGeneration = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const startTime = Date.now();
            // 生成模拟的Vue代码
            const template = generateTemplate();
            const script = generateScript();
            const style = generateStyle();
            // 构建最终代码
            const scriptTag = "<" + 'script setup lang="ts">';
            const scriptEndTag = "</" + "script>";
            const styleTag = "<" + "style scoped>";
            const styleEndTag = "</" + "style>";
            const parts = ["<template>", template, "</template>", "", scriptTag, script, scriptEndTag];
            if (style) {
                parts.push("", styleTag, style, styleEndTag);
            }
            generatedCode.value = parts.join("\n");
            const endTime = Date.now();
            generationInfo.value = {
                duration: endTime - startTime,
                size: generatedCode.value.length,
                plugin: "Vue3Plugin",
            };
            resolve(true);
        }, 1000);
    });
};
// 生成模板
const generateTemplate = () => {
    return `  <div class="${form.componentName.toLowerCase()}">
    <h3 v-if="title">{{ displayTitle || title }}</h3>
    <p>Hello from ${form.componentName}!</p>
    <el-button v-if="handleClick" @click="handleClick">Click Me</el-button>
  </div>`;
};
// 生成脚本
const generateScript = () => {
    const parts = [];
    const imports = [];
    if (form.features.includes("computed"))
        imports.push("computed");
    if (form.features.includes("lifecycle"))
        imports.push("onMounted");
    if (imports.length > 0) {
        parts.push(`import { ${imports.join(", ")} } from 'vue'`);
    }
    if (form.features.includes("props")) {
        parts.push(`
interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Default Title'
})`);
    }
    if (form.features.includes("emits")) {
        parts.push(`
interface Emits {
  click: [event: MouseEvent]
}

const emit = defineEmits<Emits>()`);
    }
    if (form.features.includes("computed")) {
        parts.push(`
const displayTitle = computed(() => props.title || 'No Title')`);
    }
    if (form.features.includes("methods")) {
        parts.push(`
const handleClick = (event: MouseEvent) => {
  emit('click', event)
}`);
    }
    if (form.features.includes("lifecycle")) {
        parts.push(`
onMounted(() => {
  console.log('` +
            form.componentName +
            ` mounted')
})`);
    }
    return parts.join("\n");
};
// 生成样式
const generateStyle = () => {
    if (!form.features.includes("style"))
        return "";
    return `.${form.componentName.toLowerCase()} {
  padding: 16px;
  border-radius: 8px;
  background: #f5f5f5;
}

.${form.componentName.toLowerCase()} h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.${form.componentName.toLowerCase()} p {
  margin: 0 0 16px 0;
  color: #666;
}`;
};
// 复制代码
const copyCode = async () => {
    try {
        await navigator.clipboard.writeText(generatedCode.value);
        ElMessage.success("代码已复制到剪贴板");
    }
    catch (error) {
        ElMessage.error("复制失败");
    }
};
// 下载代码
const downloadCode = () => {
    const blob = new Blob([generatedCode.value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.componentName}.vue`;
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success("代码已下载");
};
// 重置表单
const resetForm = () => {
    form.componentName = "MyComponent";
    form.componentType = "component";
    form.features = ["props", "style"];
    generatedCode.value = "";
    generationInfo.value = null;
};
// 初始化
onMounted(() => {
    pluginCount.value = 1; // 模拟插件数量
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['code-container']} */ ;
/** @type {__VLS_StyleScopedClasses['code-container']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "lowcode-quick-start" },
});
const __VLS_0 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
ElCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "header-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "header-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_4 } = __VLS_3.slots;
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
var __VLS_3;
const __VLS_5 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
ElRow;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    gutter: (20),
}));
const __VLS_7 = __VLS_6({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const { default: __VLS_9 } = __VLS_8.slots;
const __VLS_10 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
ElCol;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    span: (8),
}));
const __VLS_12 = __VLS_11({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
const { default: __VLS_14 } = __VLS_13.slots;
const __VLS_15 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
ElCard;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    title: "控制面板",
}));
const __VLS_17 = __VLS_16({
    title: "控制面板",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
const { default: __VLS_19 } = __VLS_18.slots;
const __VLS_20 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
ElForm;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    model: (__VLS_ctx.form),
    labelWidth: "120px",
}));
const __VLS_22 = __VLS_21({
    model: (__VLS_ctx.form),
    labelWidth: "120px",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const { default: __VLS_24 } = __VLS_23.slots;
// @ts-ignore
[form,];
const __VLS_25 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
ElFormItem;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    label: "组件名称",
}));
const __VLS_27 = __VLS_26({
    label: "组件名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
const { default: __VLS_29 } = __VLS_28.slots;
const __VLS_30 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
ElInput;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
    modelValue: (__VLS_ctx.form.componentName),
    placeholder: "请输入组件名称",
}));
const __VLS_32 = __VLS_31({
    modelValue: (__VLS_ctx.form.componentName),
    placeholder: "请输入组件名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
// @ts-ignore
[form,];
var __VLS_28;
const __VLS_35 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
ElFormItem;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
    label: "组件类型",
}));
const __VLS_37 = __VLS_36({
    label: "组件类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
const { default: __VLS_39 } = __VLS_38.slots;
const __VLS_40 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
ElSelect;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.form.componentType),
    placeholder: "选择组件类型",
}));
const __VLS_42 = __VLS_41({
    modelValue: (__VLS_ctx.form.componentType),
    placeholder: "选择组件类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const { default: __VLS_44 } = __VLS_43.slots;
// @ts-ignore
[form,];
const __VLS_45 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
ElOption;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    label: "基础组件",
    value: "component",
}));
const __VLS_47 = __VLS_46({
    label: "基础组件",
    value: "component",
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
const __VLS_50 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
ElOption;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
    label: "页面组件",
    value: "page",
}));
const __VLS_52 = __VLS_51({
    label: "页面组件",
    value: "page",
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
const __VLS_55 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
ElOption;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
    label: "布局组件",
    value: "layout",
}));
const __VLS_57 = __VLS_56({
    label: "布局组件",
    value: "layout",
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
var __VLS_43;
var __VLS_38;
const __VLS_60 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
ElFormItem;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    label: "包含功能",
}));
const __VLS_62 = __VLS_61({
    label: "包含功能",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
const { default: __VLS_64 } = __VLS_63.slots;
const __VLS_65 = {}.ElCheckboxGroup;
/** @type {[typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, ]} */ ;
// @ts-ignore
ElCheckboxGroup;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
    modelValue: (__VLS_ctx.form.features),
}));
const __VLS_67 = __VLS_66({
    modelValue: (__VLS_ctx.form.features),
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
const { default: __VLS_69 } = __VLS_68.slots;
// @ts-ignore
[form,];
const __VLS_70 = {}.ElCheckbox;
/** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
// @ts-ignore
ElCheckbox;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
    label: "props",
}));
const __VLS_72 = __VLS_71({
    label: "props",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
const { default: __VLS_74 } = __VLS_73.slots;
var __VLS_73;
const __VLS_75 = {}.ElCheckbox;
/** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
// @ts-ignore
ElCheckbox;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
    label: "emits",
}));
const __VLS_77 = __VLS_76({
    label: "emits",
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
const { default: __VLS_79 } = __VLS_78.slots;
var __VLS_78;
const __VLS_80 = {}.ElCheckbox;
/** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
// @ts-ignore
ElCheckbox;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    label: "computed",
}));
const __VLS_82 = __VLS_81({
    label: "computed",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
const { default: __VLS_84 } = __VLS_83.slots;
var __VLS_83;
const __VLS_85 = {}.ElCheckbox;
/** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
// @ts-ignore
ElCheckbox;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
    label: "methods",
}));
const __VLS_87 = __VLS_86({
    label: "methods",
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
const { default: __VLS_89 } = __VLS_88.slots;
var __VLS_88;
const __VLS_90 = {}.ElCheckbox;
/** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
// @ts-ignore
ElCheckbox;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
    label: "lifecycle",
}));
const __VLS_92 = __VLS_91({
    label: "lifecycle",
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
const { default: __VLS_94 } = __VLS_93.slots;
var __VLS_93;
const __VLS_95 = {}.ElCheckbox;
/** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
// @ts-ignore
ElCheckbox;
// @ts-ignore
const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({
    label: "style",
}));
const __VLS_97 = __VLS_96({
    label: "style",
}, ...__VLS_functionalComponentArgsRest(__VLS_96));
const { default: __VLS_99 } = __VLS_98.slots;
var __VLS_98;
var __VLS_68;
var __VLS_63;
const __VLS_100 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
ElFormItem;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({}));
const __VLS_102 = __VLS_101({}, ...__VLS_functionalComponentArgsRest(__VLS_101));
const { default: __VLS_104 } = __VLS_103.slots;
const __VLS_105 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
ElButton;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.generating),
    disabled: (!__VLS_ctx.form.componentName),
}));
const __VLS_107 = __VLS_106({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.generating),
    disabled: (!__VLS_ctx.form.componentName),
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
let __VLS_109;
let __VLS_110;
const __VLS_111 = ({ click: {} },
    { onClick: (__VLS_ctx.generateCode) });
const { default: __VLS_112 } = __VLS_108.slots;
// @ts-ignore
[form, generating, generateCode,];
__VLS_asFunctionalElement(__VLS_elements.i)({
    ...{ class: "el-icon-magic-stick" },
});
var __VLS_108;
const __VLS_113 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
ElButton;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
    ...{ 'onClick': {} },
}));
const __VLS_115 = __VLS_114({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
let __VLS_117;
let __VLS_118;
const __VLS_119 = ({ click: {} },
    { onClick: (__VLS_ctx.resetForm) });
const { default: __VLS_120 } = __VLS_116.slots;
// @ts-ignore
[resetForm,];
__VLS_asFunctionalElement(__VLS_elements.i)({
    ...{ class: "el-icon-refresh" },
});
var __VLS_116;
var __VLS_103;
var __VLS_23;
const __VLS_121 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
ElDivider;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({}));
const __VLS_123 = __VLS_122({}, ...__VLS_functionalComponentArgsRest(__VLS_122));
const { default: __VLS_125 } = __VLS_124.slots;
var __VLS_124;
const __VLS_126 = {}.ElDescriptions;
/** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
// @ts-ignore
ElDescriptions;
// @ts-ignore
const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
    column: (1),
    size: "small",
}));
const __VLS_128 = __VLS_127({
    column: (1),
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_127));
const { default: __VLS_130 } = __VLS_129.slots;
const __VLS_131 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
ElDescriptionsItem;
// @ts-ignore
const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({
    label: "内核状态",
}));
const __VLS_133 = __VLS_132({
    label: "内核状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_132));
const { default: __VLS_135 } = __VLS_134.slots;
const __VLS_136 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
ElTag;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    type: __VLS_ctx.kernelStatus.type,
}));
const __VLS_138 = __VLS_137({
    type: __VLS_ctx.kernelStatus.type,
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
const { default: __VLS_140 } = __VLS_139.slots;
// @ts-ignore
[kernelStatus,];
(__VLS_ctx.kernelStatus.text);
// @ts-ignore
[kernelStatus,];
var __VLS_139;
var __VLS_134;
const __VLS_141 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
ElDescriptionsItem;
// @ts-ignore
const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
    label: "插件数量",
}));
const __VLS_143 = __VLS_142({
    label: "插件数量",
}, ...__VLS_functionalComponentArgsRest(__VLS_142));
const { default: __VLS_145 } = __VLS_144.slots;
(__VLS_ctx.pluginCount);
// @ts-ignore
[pluginCount,];
var __VLS_144;
const __VLS_146 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
ElDescriptionsItem;
// @ts-ignore
const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
    label: "生成次数",
}));
const __VLS_148 = __VLS_147({
    label: "生成次数",
}, ...__VLS_functionalComponentArgsRest(__VLS_147));
const { default: __VLS_150 } = __VLS_149.slots;
(__VLS_ctx.generationCount);
// @ts-ignore
[generationCount,];
var __VLS_149;
var __VLS_129;
var __VLS_18;
var __VLS_13;
const __VLS_151 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
ElCol;
// @ts-ignore
const __VLS_152 = __VLS_asFunctionalComponent(__VLS_151, new __VLS_151({
    span: (16),
}));
const __VLS_153 = __VLS_152({
    span: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_152));
const { default: __VLS_155 } = __VLS_154.slots;
const __VLS_156 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
ElCard;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    title: "生成的代码",
}));
const __VLS_158 = __VLS_157({
    title: "生成的代码",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
const { default: __VLS_160 } = __VLS_159.slots;
{
    const { header: __VLS_161 } = __VLS_159.slots;
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "card-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    const __VLS_162 = {}.ElButtonGroup;
    /** @type {[typeof __VLS_components.ElButtonGroup, typeof __VLS_components.elButtonGroup, typeof __VLS_components.ElButtonGroup, typeof __VLS_components.elButtonGroup, ]} */ ;
    // @ts-ignore
    ElButtonGroup;
    // @ts-ignore
    const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({}));
    const __VLS_164 = __VLS_163({}, ...__VLS_functionalComponentArgsRest(__VLS_163));
    const { default: __VLS_166 } = __VLS_165.slots;
    const __VLS_167 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    ElButton;
    // @ts-ignore
    const __VLS_168 = __VLS_asFunctionalComponent(__VLS_167, new __VLS_167({
        ...{ 'onClick': {} },
        size: "small",
        disabled: (!__VLS_ctx.generatedCode),
    }));
    const __VLS_169 = __VLS_168({
        ...{ 'onClick': {} },
        size: "small",
        disabled: (!__VLS_ctx.generatedCode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_168));
    let __VLS_171;
    let __VLS_172;
    const __VLS_173 = ({ click: {} },
        { onClick: (__VLS_ctx.copyCode) });
    const { default: __VLS_174 } = __VLS_170.slots;
    // @ts-ignore
    [generatedCode, copyCode,];
    __VLS_asFunctionalElement(__VLS_elements.i)({
        ...{ class: "el-icon-copy-document" },
    });
    var __VLS_170;
    const __VLS_175 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    ElButton;
    // @ts-ignore
    const __VLS_176 = __VLS_asFunctionalComponent(__VLS_175, new __VLS_175({
        ...{ 'onClick': {} },
        size: "small",
        disabled: (!__VLS_ctx.generatedCode),
    }));
    const __VLS_177 = __VLS_176({
        ...{ 'onClick': {} },
        size: "small",
        disabled: (!__VLS_ctx.generatedCode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_176));
    let __VLS_179;
    let __VLS_180;
    const __VLS_181 = ({ click: {} },
        { onClick: (__VLS_ctx.downloadCode) });
    const { default: __VLS_182 } = __VLS_178.slots;
    // @ts-ignore
    [generatedCode, downloadCode,];
    __VLS_asFunctionalElement(__VLS_elements.i)({
        ...{ class: "el-icon-download" },
    });
    var __VLS_178;
    var __VLS_165;
}
if (__VLS_ctx.generating) {
    // @ts-ignore
    [generating,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "loading-container" },
    });
    const __VLS_183 = {}.ElSkeleton;
    /** @type {[typeof __VLS_components.ElSkeleton, typeof __VLS_components.elSkeleton, ]} */ ;
    // @ts-ignore
    ElSkeleton;
    // @ts-ignore
    const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({
        rows: (10),
        animated: true,
    }));
    const __VLS_185 = __VLS_184({
        rows: (10),
        animated: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_184));
}
else if (__VLS_ctx.generatedCode) {
    // @ts-ignore
    [generatedCode,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "code-container" },
    });
    __VLS_asFunctionalElement(__VLS_elements.pre, __VLS_elements.pre)({});
    __VLS_asFunctionalElement(__VLS_elements.code, __VLS_elements.code)({
        ...{ class: "language-vue" },
    });
    (__VLS_ctx.generatedCode);
    // @ts-ignore
    [generatedCode,];
}
else {
    const __VLS_188 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    ElEmpty;
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
        description: "点击生成代码按钮开始",
    }));
    const __VLS_190 = __VLS_189({
        description: "点击生成代码按钮开始",
    }, ...__VLS_functionalComponentArgsRest(__VLS_189));
}
if (__VLS_ctx.generationInfo) {
    // @ts-ignore
    [generationInfo,];
    const __VLS_193 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    ElDivider;
    // @ts-ignore
    const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({}));
    const __VLS_195 = __VLS_194({}, ...__VLS_functionalComponentArgsRest(__VLS_194));
    const { default: __VLS_197 } = __VLS_196.slots;
    var __VLS_196;
}
if (__VLS_ctx.generationInfo) {
    // @ts-ignore
    [generationInfo,];
    const __VLS_198 = {}.ElDescriptions;
    /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
    // @ts-ignore
    ElDescriptions;
    // @ts-ignore
    const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({
        column: (3),
        size: "small",
    }));
    const __VLS_200 = __VLS_199({
        column: (3),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_199));
    const { default: __VLS_202 } = __VLS_201.slots;
    const __VLS_203 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    ElDescriptionsItem;
    // @ts-ignore
    const __VLS_204 = __VLS_asFunctionalComponent(__VLS_203, new __VLS_203({
        label: "生成时间",
    }));
    const __VLS_205 = __VLS_204({
        label: "生成时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_204));
    const { default: __VLS_207 } = __VLS_206.slots;
    (__VLS_ctx.generationInfo.duration);
    // @ts-ignore
    [generationInfo,];
    var __VLS_206;
    const __VLS_208 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    ElDescriptionsItem;
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
        label: "代码大小",
    }));
    const __VLS_210 = __VLS_209({
        label: "代码大小",
    }, ...__VLS_functionalComponentArgsRest(__VLS_209));
    const { default: __VLS_212 } = __VLS_211.slots;
    (__VLS_ctx.generationInfo.size);
    // @ts-ignore
    [generationInfo,];
    var __VLS_211;
    const __VLS_213 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    ElDescriptionsItem;
    // @ts-ignore
    const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({
        label: "使用插件",
    }));
    const __VLS_215 = __VLS_214({
        label: "使用插件",
    }, ...__VLS_functionalComponentArgsRest(__VLS_214));
    const { default: __VLS_217 } = __VLS_216.slots;
    (__VLS_ctx.generationInfo.plugin);
    // @ts-ignore
    [generationInfo,];
    var __VLS_216;
    var __VLS_201;
}
var __VLS_159;
var __VLS_154;
var __VLS_8;
const __VLS_218 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
ElCard;
// @ts-ignore
const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({
    ...{ class: "mt-4" },
}));
const __VLS_220 = __VLS_219({
    ...{ class: "mt-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_219));
const { default: __VLS_222 } = __VLS_221.slots;
{
    const { header: __VLS_223 } = __VLS_221.slots;
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
}
const __VLS_224 = {}.ElCollapse;
/** @type {[typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, ]} */ ;
// @ts-ignore
ElCollapse;
// @ts-ignore
const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({}));
const __VLS_226 = __VLS_225({}, ...__VLS_functionalComponentArgsRest(__VLS_225));
const { default: __VLS_228 } = __VLS_227.slots;
const __VLS_229 = {}.ElCollapseItem;
/** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
// @ts-ignore
ElCollapseItem;
// @ts-ignore
const __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229({
    title: "查看当前Schema配置",
    name: "schema",
}));
const __VLS_231 = __VLS_230({
    title: "查看当前Schema配置",
    name: "schema",
}, ...__VLS_functionalComponentArgsRest(__VLS_230));
const { default: __VLS_233 } = __VLS_232.slots;
__VLS_asFunctionalElement(__VLS_elements.pre, __VLS_elements.pre)({});
__VLS_asFunctionalElement(__VLS_elements.code, __VLS_elements.code)({
    ...{ class: "language-json" },
});
(JSON.stringify(__VLS_ctx.currentSchema, null, 2));
// @ts-ignore
[currentSchema,];
var __VLS_232;
var __VLS_227;
var __VLS_221;
/** @type {__VLS_StyleScopedClasses['lowcode-quick-start']} */ ;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['el-icon-magic-stick']} */ ;
/** @type {__VLS_StyleScopedClasses['el-icon-refresh']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['el-icon-copy-document']} */ ;
/** @type {__VLS_StyleScopedClasses['el-icon-download']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-container']} */ ;
/** @type {__VLS_StyleScopedClasses['code-container']} */ ;
/** @type {__VLS_StyleScopedClasses['language-vue']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['language-json']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        form: form,
        generating: generating,
        generatedCode: generatedCode,
        generationCount: generationCount,
        pluginCount: pluginCount,
        generationInfo: generationInfo,
        kernelStatus: kernelStatus,
        currentSchema: currentSchema,
        generateCode: generateCode,
        copyCode: copyCode,
        downloadCode: downloadCode,
        resetForm: resetForm,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
