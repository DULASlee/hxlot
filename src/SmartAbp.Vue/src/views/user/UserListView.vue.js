/// <reference types="D:/BAOBAB/Baobab.SmartAbp/src/SmartAbp.Vue/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
// 模板占位符说明：
// User - 实体名称（PascalCase）
// user - 实体名称（camelCase）
// 用户管理 - 实体显示名称
import { ref, reactive, onMounted, computed } from "vue";
import MetadataDrivenPageRenderer from "@smartabp/lowcode-designer/runtime/MetadataDrivenPageRenderer.vue";
import { uiConfigToPageSchema } from "@smartabp/lowcode-designer/utils/uiConfigMapper";
import { codeGeneratorApi } from "@smartabp/lowcode-api";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Search, Refresh, Delete } from "@element-plus/icons-vue";
// 响应式数据
const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const selectedRows = ref([]);
// 元数据驱动页面 Schema（若有 UI 配置，则优先使用该渲染路径）
const schema = ref(null);
// 表单引用
const searchFormRef = ref();
const formRef = ref();
const tableRef = ref();
// 搜索表单
const searchForm = reactive({
    filter: "",
    isEnabled: undefined,
});
// 分页数据
const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
});
// 排序数据
const sorting = ref("");
// 表格数据
const tableData = ref([]);
// 对话框数据
const dialogTitle = computed(() => (formData.id ? "编辑用户管理" : "新增用户管理"));
const formData = reactive({
    id: undefined,
    name: "",
    displayName: "",
    description: "",
    sort: 0,
    isEnabled: true,
});
// 表单验证规则
const formRules = {
    name: [
        { required: true, message: "请输入用户管理名称", trigger: "blur" },
        { min: 2, max: 50, message: "名称长度在 2 到 50 个字符", trigger: "blur" },
    ],
};
// 方法实现
const fetchData = async () => {
    try {
        loading.value = true;
        const params = {
            filter: searchForm.filter || undefined,
            isEnabled: searchForm.isEnabled,
            skipCount: (pagination.current - 1) * pagination.pageSize,
            maxResultCount: pagination.pageSize,
            sorting: sorting.value || undefined,
        };
        // 避免TS未使用变量错误
        void params;
        // TODO: 调用实际的API服务
        // const result = await userStore.fetchList(params)
        // tableData.value = result.items
        // pagination.total = result.totalCount
    }
    catch {
        ElMessage.error("获取数据失败");
    }
    finally {
        // 修复未使用变量错误，移除catch块中的error参数，符合ESLint规范
        loading.value = false;
    }
};
const handleSearch = () => {
    pagination.current = 1;
    fetchData();
};
const handleReset = () => {
    searchForm.filter = "";
    searchForm.isEnabled = undefined;
    handleSearch();
};
const handleCreate = () => {
    Object.assign(formData, {
        id: undefined,
        name: "",
        displayName: "",
        description: "",
        sort: 0,
        isEnabled: true,
    });
    dialogVisible.value = true;
};
const handleEdit = (row) => {
    Object.assign(formData, row);
    dialogVisible.value = true;
};
const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm(`确定要删除 "${row.name}" 吗？`, "确认删除", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
        });
        // TODO: 调用删除API
        // await userStore.delete(row.id)
        ElMessage.success("删除成功");
        fetchData();
    }
    catch {
        // 用户取消删除
    }
};
const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0)
        return;
    try {
        await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 项吗？`, "确认批量删除", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
        });
        const ids = selectedRows.value.map((row) => row.id);
        // 避免TS未使用变量错误
        void ids;
        // TODO: 调用批量删除API
        // await userStore.deleteMany(ids)
        ElMessage.success("批量删除成功");
        fetchData();
    }
    catch (error) {
        // 用户取消删除
    }
};
const handleSubmit = async () => {
    try {
        await formRef.value?.validate();
        submitting.value = true;
        if (formData.id) {
            // TODO: 更新操作
            // await userStore.update(formData.id, formData)
            ElMessage.success("更新成功");
        }
        else {
            // TODO: 创建操作
            // await userStore.create(formData)
            ElMessage.success("创建成功");
        }
        dialogVisible.value = false;
        fetchData();
    }
    catch {
        ElMessage.error("操作失败");
    }
    finally {
        submitting.value = false;
    }
};
const handleDialogClose = () => {
    formRef.value?.resetFields();
};
const handleSelectionChange = (selection) => {
    selectedRows.value = selection;
};
const handleSortChange = ({ prop, order }) => {
    if (order) {
        sorting.value = `${prop} ${order === "ascending" ? "asc" : "desc"}`;
    }
    else {
        sorting.value = "";
    }
    fetchData();
};
const handlePageSizeChange = (size) => {
    pagination.pageSize = size;
    pagination.current = 1;
    fetchData();
};
const handleCurrentChange = (current) => {
    pagination.current = current;
    fetchData();
};
// 工具函数占位符
const formatDateTime = (date) => {
    // TODO: 实现日期格式化
    return date;
};
// 生命周期
onMounted(async () => {
    try {
        // 优先从本地 appshell/ui-config 目录加载（构建产物 / HMR 兼容）
        const modules = import.meta.glob("@/appshell/ui-config/*.ui.json", { eager: true });
        const expectedKey = "/src/appshell/ui-config/User.User.ui.json";
        const mod = modules[expectedKey];
        let cfg = mod?.default ?? mod;
        // 若本地未命中，则回退到后端接口加载（保证运行时可定制）
        if (!cfg) {
            cfg = await codeGeneratorApi.getUiConfig("User", "User");
        }
        if (cfg) {
            schema.value = uiConfigToPageSchema(cfg);
        }
    }
    catch (_) {
        // 忽略错误，走静态模板渲染
    }
    finally {
        // 无论是否存在UI配置，均进行一次数据加载（静态模板所需）
        fetchData();
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "entity-management" },
});
if (__VLS_ctx.schema) {
    // @ts-ignore
    [schema,];
    /** @type {[typeof MetadataDrivenPageRenderer, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(MetadataDrivenPageRenderer, new MetadataDrivenPageRenderer({
        schema: (__VLS_ctx.schema),
    }));
    const __VLS_1 = __VLS_0({
        schema: (__VLS_ctx.schema),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    // @ts-ignore
    [schema,];
}
else {
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "page-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "page-title" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "page-description" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "page-actions" },
    });
    const __VLS_4 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    ElButton;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        ...{ 'onClick': {} },
        type: "primary",
        icon: (__VLS_ctx.Plus),
    }));
    const __VLS_6 = __VLS_5({
        ...{ 'onClick': {} },
        type: "primary",
        icon: (__VLS_ctx.Plus),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    let __VLS_8;
    let __VLS_9;
    const __VLS_10 = ({ click: {} },
        { onClick: (__VLS_ctx.handleCreate) });
    __VLS_asFunctionalDirective(__VLS_directives.vPermission)(null, { ...__VLS_directiveBindingRestFields, value: ('User.Create') }, null, null);
    const { default: __VLS_11 } = __VLS_7.slots;
    // @ts-ignore
    [Plus, handleCreate, vPermission,];
    var __VLS_7;
    const __VLS_12 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    ElCard;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ class: "search-card" },
        shadow: "never",
    }));
    const __VLS_14 = __VLS_13({
        ...{ class: "search-card" },
        shadow: "never",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    const { default: __VLS_16 } = __VLS_15.slots;
    const __VLS_17 = {}.ElForm;
    /** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
    // @ts-ignore
    ElForm;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
        ref: "searchFormRef",
        model: (__VLS_ctx.searchForm),
        inline: (true),
        ...{ class: "search-form" },
    }));
    const __VLS_19 = __VLS_18({
        ref: "searchFormRef",
        model: (__VLS_ctx.searchForm),
        inline: (true),
        ...{ class: "search-form" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    /** @type {typeof __VLS_ctx.searchFormRef} */ ;
    var __VLS_21 = {};
    const { default: __VLS_23 } = __VLS_20.slots;
    // @ts-ignore
    [searchForm, searchFormRef,];
    const __VLS_24 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    ElFormItem;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        label: "名称",
        prop: "filter",
    }));
    const __VLS_26 = __VLS_25({
        label: "名称",
        prop: "filter",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    const { default: __VLS_28 } = __VLS_27.slots;
    const __VLS_29 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    ElInput;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.searchForm.filter),
        placeholder: "请输入用户管理名称",
        clearable: true,
        ...{ style: {} },
    }));
    const __VLS_31 = __VLS_30({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.searchForm.filter),
        placeholder: "请输入用户管理名称",
        clearable: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    let __VLS_33;
    let __VLS_34;
    const __VLS_35 = ({ keyup: {} },
        { onKeyup: (__VLS_ctx.handleSearch) });
    // @ts-ignore
    [searchForm, handleSearch,];
    var __VLS_32;
    var __VLS_27;
    const __VLS_37 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    ElFormItem;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
        label: "状态",
        prop: "isEnabled",
    }));
    const __VLS_39 = __VLS_38({
        label: "状态",
        prop: "isEnabled",
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    const { default: __VLS_41 } = __VLS_40.slots;
    const __VLS_42 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    ElSelect;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
        modelValue: (__VLS_ctx.searchForm.isEnabled),
        placeholder: "请选择状态",
        clearable: true,
        ...{ style: {} },
    }));
    const __VLS_44 = __VLS_43({
        modelValue: (__VLS_ctx.searchForm.isEnabled),
        placeholder: "请选择状态",
        clearable: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    const { default: __VLS_46 } = __VLS_45.slots;
    // @ts-ignore
    [searchForm,];
    const __VLS_47 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    ElOption;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
        label: "启用",
        value: (true),
    }));
    const __VLS_49 = __VLS_48({
        label: "启用",
        value: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    const __VLS_52 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    ElOption;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        label: "禁用",
        value: (false),
    }));
    const __VLS_54 = __VLS_53({
        label: "禁用",
        value: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    var __VLS_45;
    var __VLS_40;
    const __VLS_57 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    ElFormItem;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({}));
    const __VLS_59 = __VLS_58({}, ...__VLS_functionalComponentArgsRest(__VLS_58));
    const { default: __VLS_61 } = __VLS_60.slots;
    const __VLS_62 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    ElButton;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
        ...{ 'onClick': {} },
        type: "primary",
        icon: (__VLS_ctx.Search),
    }));
    const __VLS_64 = __VLS_63({
        ...{ 'onClick': {} },
        type: "primary",
        icon: (__VLS_ctx.Search),
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    let __VLS_66;
    let __VLS_67;
    const __VLS_68 = ({ click: {} },
        { onClick: (__VLS_ctx.handleSearch) });
    const { default: __VLS_69 } = __VLS_65.slots;
    // @ts-ignore
    [handleSearch, Search,];
    var __VLS_65;
    const __VLS_70 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    ElButton;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.Refresh),
    }));
    const __VLS_72 = __VLS_71({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.Refresh),
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    let __VLS_74;
    let __VLS_75;
    const __VLS_76 = ({ click: {} },
        { onClick: (__VLS_ctx.handleReset) });
    const { default: __VLS_77 } = __VLS_73.slots;
    // @ts-ignore
    [Refresh, handleReset,];
    var __VLS_73;
    var __VLS_60;
    var __VLS_20;
    var __VLS_15;
    const __VLS_78 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    ElCard;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
        ...{ class: "table-card" },
        shadow: "never",
    }));
    const __VLS_80 = __VLS_79({
        ...{ class: "table-card" },
        shadow: "never",
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    const { default: __VLS_82 } = __VLS_81.slots;
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "table-toolbar" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "toolbar-left" },
    });
    const __VLS_83 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    ElButton;
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
        ...{ 'onClick': {} },
        type: "danger",
        icon: (__VLS_ctx.Delete),
        disabled: (!__VLS_ctx.selectedRows.length),
    }));
    const __VLS_85 = __VLS_84({
        ...{ 'onClick': {} },
        type: "danger",
        icon: (__VLS_ctx.Delete),
        disabled: (!__VLS_ctx.selectedRows.length),
    }, ...__VLS_functionalComponentArgsRest(__VLS_84));
    let __VLS_87;
    let __VLS_88;
    const __VLS_89 = ({ click: {} },
        { onClick: (__VLS_ctx.handleBatchDelete) });
    __VLS_asFunctionalDirective(__VLS_directives.vPermission)(null, { ...__VLS_directiveBindingRestFields, value: ('User.Delete') }, null, null);
    const { default: __VLS_90 } = __VLS_86.slots;
    // @ts-ignore
    [vPermission, Delete, selectedRows, handleBatchDelete,];
    (__VLS_ctx.selectedRows.length);
    // @ts-ignore
    [selectedRows,];
    var __VLS_86;
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "toolbar-right" },
    });
    const __VLS_91 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    ElTooltip;
    // @ts-ignore
    const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
        content: "刷新数据",
    }));
    const __VLS_93 = __VLS_92({
        content: "刷新数据",
    }, ...__VLS_functionalComponentArgsRest(__VLS_92));
    const { default: __VLS_95 } = __VLS_94.slots;
    const __VLS_96 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    ElButton;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.Refresh),
        circle: true,
    }));
    const __VLS_98 = __VLS_97({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.Refresh),
        circle: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    let __VLS_100;
    let __VLS_101;
    const __VLS_102 = ({ click: {} },
        { onClick: (__VLS_ctx.fetchData) });
    // @ts-ignore
    [Refresh, fetchData,];
    var __VLS_99;
    var __VLS_94;
    const __VLS_104 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    ElTable;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        ...{ 'onSelectionChange': {} },
        ...{ 'onSortChange': {} },
        ref: "tableRef",
        data: (__VLS_ctx.tableData),
        rowKey: "id",
    }));
    const __VLS_106 = __VLS_105({
        ...{ 'onSelectionChange': {} },
        ...{ 'onSortChange': {} },
        ref: "tableRef",
        data: (__VLS_ctx.tableData),
        rowKey: "id",
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    let __VLS_108;
    let __VLS_109;
    const __VLS_110 = ({ selectionChange: {} },
        { onSelectionChange: (__VLS_ctx.handleSelectionChange) });
    const __VLS_111 = ({ sortChange: {} },
        { onSortChange: (__VLS_ctx.handleSortChange) });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
    /** @type {typeof __VLS_ctx.tableRef} */ ;
    var __VLS_112 = {};
    const { default: __VLS_114 } = __VLS_107.slots;
    // @ts-ignore
    [tableData, handleSelectionChange, handleSortChange, vLoading, loading, tableRef,];
    const __VLS_115 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    ElTableColumn;
    // @ts-ignore
    const __VLS_116 = __VLS_asFunctionalComponent(__VLS_115, new __VLS_115({
        type: "selection",
        width: "50",
    }));
    const __VLS_117 = __VLS_116({
        type: "selection",
        width: "50",
    }, ...__VLS_functionalComponentArgsRest(__VLS_116));
    const __VLS_120 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    ElTableColumn;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        prop: "name",
        label: "名称",
        sortable: "custom",
        minWidth: "150",
    }));
    const __VLS_122 = __VLS_121({
        prop: "name",
        label: "名称",
        sortable: "custom",
        minWidth: "150",
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    const { default: __VLS_124 } = __VLS_123.slots;
    {
        const { default: __VLS_125 } = __VLS_123.slots;
        const [{ row }] = __VLS_getSlotParameters(__VLS_125);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "name-cell" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "name-text" },
        });
        (row.name);
        if (!row.isEnabled) {
            const __VLS_126 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            ElTag;
            // @ts-ignore
            const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
                type: "info",
                size: "small",
            }));
            const __VLS_128 = __VLS_127({
                type: "info",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_127));
            const { default: __VLS_130 } = __VLS_129.slots;
            var __VLS_129;
        }
    }
    var __VLS_123;
    const __VLS_131 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    ElTableColumn;
    // @ts-ignore
    const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({
        prop: "displayName",
        label: "显示名称",
        minWidth: "150",
        showOverflowTooltip: true,
    }));
    const __VLS_133 = __VLS_132({
        prop: "displayName",
        label: "显示名称",
        minWidth: "150",
        showOverflowTooltip: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_132));
    const __VLS_136 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    ElTableColumn;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
        prop: "description",
        label: "描述",
        minWidth: "200",
        showOverflowTooltip: true,
    }));
    const __VLS_138 = __VLS_137({
        prop: "description",
        label: "描述",
        minWidth: "200",
        showOverflowTooltip: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    const __VLS_141 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    ElTableColumn;
    // @ts-ignore
    const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
        prop: "sort",
        label: "排序",
        width: "80",
        sortable: "custom",
    }));
    const __VLS_143 = __VLS_142({
        prop: "sort",
        label: "排序",
        width: "80",
        sortable: "custom",
    }, ...__VLS_functionalComponentArgsRest(__VLS_142));
    const __VLS_146 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    ElTableColumn;
    // @ts-ignore
    const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
        prop: "creationTime",
        label: "创建时间",
        width: "160",
        sortable: "custom",
    }));
    const __VLS_148 = __VLS_147({
        prop: "creationTime",
        label: "创建时间",
        width: "160",
        sortable: "custom",
    }, ...__VLS_functionalComponentArgsRest(__VLS_147));
    const { default: __VLS_150 } = __VLS_149.slots;
    {
        const { default: __VLS_151 } = __VLS_149.slots;
        const [{ row }] = __VLS_getSlotParameters(__VLS_151);
        (__VLS_ctx.formatDateTime(row.creationTime));
        // @ts-ignore
        [formatDateTime,];
    }
    var __VLS_149;
    const __VLS_152 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    ElTableColumn;
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
        label: "操作",
        width: "180",
        fixed: "right",
    }));
    const __VLS_154 = __VLS_153({
        label: "操作",
        width: "180",
        fixed: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    const { default: __VLS_156 } = __VLS_155.slots;
    {
        const { default: __VLS_157 } = __VLS_155.slots;
        const [{ row }] = __VLS_getSlotParameters(__VLS_157);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "action-buttons" },
        });
        const __VLS_158 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        ElButton;
        // @ts-ignore
        const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
            text: true,
        }));
        const __VLS_160 = __VLS_159({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
            text: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_159));
        let __VLS_162;
        let __VLS_163;
        const __VLS_164 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.schema))
                        return;
                    __VLS_ctx.handleEdit(row);
                    // @ts-ignore
                    [handleEdit,];
                } });
        __VLS_asFunctionalDirective(__VLS_directives.vPermission)(null, { ...__VLS_directiveBindingRestFields, value: ('User.Edit') }, null, null);
        const { default: __VLS_165 } = __VLS_161.slots;
        // @ts-ignore
        [vPermission,];
        var __VLS_161;
        const __VLS_166 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        ElButton;
        // @ts-ignore
        const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({
            ...{ 'onClick': {} },
            type: "danger",
            size: "small",
            text: true,
        }));
        const __VLS_168 = __VLS_167({
            ...{ 'onClick': {} },
            type: "danger",
            size: "small",
            text: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_167));
        let __VLS_170;
        let __VLS_171;
        const __VLS_172 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.schema))
                        return;
                    __VLS_ctx.handleDelete(row);
                    // @ts-ignore
                    [handleDelete,];
                } });
        __VLS_asFunctionalDirective(__VLS_directives.vPermission)(null, { ...__VLS_directiveBindingRestFields, value: ('User.Delete') }, null, null);
        const { default: __VLS_173 } = __VLS_169.slots;
        // @ts-ignore
        [vPermission,];
        var __VLS_169;
    }
    var __VLS_155;
    var __VLS_107;
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "pagination-wrapper" },
    });
    const __VLS_174 = {}.ElPagination;
    /** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
    // @ts-ignore
    ElPagination;
    // @ts-ignore
    const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.pagination.current),
        pageSize: (__VLS_ctx.pagination.pageSize),
        total: (__VLS_ctx.pagination.total),
        pageSizes: ([10, 20, 50, 100]),
        layout: "total, sizes, prev, pager, next, jumper",
    }));
    const __VLS_176 = __VLS_175({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.pagination.current),
        pageSize: (__VLS_ctx.pagination.pageSize),
        total: (__VLS_ctx.pagination.total),
        pageSizes: ([10, 20, 50, 100]),
        layout: "total, sizes, prev, pager, next, jumper",
    }, ...__VLS_functionalComponentArgsRest(__VLS_175));
    let __VLS_178;
    let __VLS_179;
    const __VLS_180 = ({ sizeChange: {} },
        { onSizeChange: (__VLS_ctx.handlePageSizeChange) });
    const __VLS_181 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.handleCurrentChange) });
    // @ts-ignore
    [pagination, pagination, pagination, handlePageSizeChange, handleCurrentChange,];
    var __VLS_177;
    var __VLS_81;
    const __VLS_183 = {}.ElDialog;
    /** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
    // @ts-ignore
    ElDialog;
    // @ts-ignore
    const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({
        ...{ 'onClose': {} },
        modelValue: (__VLS_ctx.dialogVisible),
        title: (__VLS_ctx.dialogTitle),
        width: "600px",
        closeOnClickModal: (false),
    }));
    const __VLS_185 = __VLS_184({
        ...{ 'onClose': {} },
        modelValue: (__VLS_ctx.dialogVisible),
        title: (__VLS_ctx.dialogTitle),
        width: "600px",
        closeOnClickModal: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_184));
    let __VLS_187;
    let __VLS_188;
    const __VLS_189 = ({ close: {} },
        { onClose: (__VLS_ctx.handleDialogClose) });
    const { default: __VLS_190 } = __VLS_186.slots;
    // @ts-ignore
    [dialogVisible, dialogTitle, handleDialogClose,];
    const __VLS_191 = {}.ElForm;
    /** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
    // @ts-ignore
    ElForm;
    // @ts-ignore
    const __VLS_192 = __VLS_asFunctionalComponent(__VLS_191, new __VLS_191({
        ref: "formRef",
        model: (__VLS_ctx.formData),
        rules: (__VLS_ctx.formRules),
        labelWidth: "100px",
        ...{ class: "edit-form" },
    }));
    const __VLS_193 = __VLS_192({
        ref: "formRef",
        model: (__VLS_ctx.formData),
        rules: (__VLS_ctx.formRules),
        labelWidth: "100px",
        ...{ class: "edit-form" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_192));
    /** @type {typeof __VLS_ctx.formRef} */ ;
    var __VLS_195 = {};
    const { default: __VLS_197 } = __VLS_194.slots;
    // @ts-ignore
    [formData, formRules, formRef,];
    const __VLS_198 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    ElFormItem;
    // @ts-ignore
    const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({
        label: "名称",
        prop: "name",
    }));
    const __VLS_200 = __VLS_199({
        label: "名称",
        prop: "name",
    }, ...__VLS_functionalComponentArgsRest(__VLS_199));
    const { default: __VLS_202 } = __VLS_201.slots;
    const __VLS_203 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    ElInput;
    // @ts-ignore
    const __VLS_204 = __VLS_asFunctionalComponent(__VLS_203, new __VLS_203({
        modelValue: (__VLS_ctx.formData.name),
        placeholder: "请输入用户管理名称",
        maxlength: "50",
        showWordLimit: true,
    }));
    const __VLS_205 = __VLS_204({
        modelValue: (__VLS_ctx.formData.name),
        placeholder: "请输入用户管理名称",
        maxlength: "50",
        showWordLimit: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_204));
    // @ts-ignore
    [formData,];
    var __VLS_201;
    const __VLS_208 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    ElFormItem;
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
        label: "显示名称",
        prop: "displayName",
    }));
    const __VLS_210 = __VLS_209({
        label: "显示名称",
        prop: "displayName",
    }, ...__VLS_functionalComponentArgsRest(__VLS_209));
    const { default: __VLS_212 } = __VLS_211.slots;
    const __VLS_213 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    ElInput;
    // @ts-ignore
    const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({
        modelValue: (__VLS_ctx.formData.displayName),
        placeholder: "请输入显示名称",
        maxlength: "100",
        showWordLimit: true,
    }));
    const __VLS_215 = __VLS_214({
        modelValue: (__VLS_ctx.formData.displayName),
        placeholder: "请输入显示名称",
        maxlength: "100",
        showWordLimit: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_214));
    // @ts-ignore
    [formData,];
    var __VLS_211;
    const __VLS_218 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    ElFormItem;
    // @ts-ignore
    const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({
        label: "描述",
        prop: "description",
    }));
    const __VLS_220 = __VLS_219({
        label: "描述",
        prop: "description",
    }, ...__VLS_functionalComponentArgsRest(__VLS_219));
    const { default: __VLS_222 } = __VLS_221.slots;
    const __VLS_223 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    ElInput;
    // @ts-ignore
    const __VLS_224 = __VLS_asFunctionalComponent(__VLS_223, new __VLS_223({
        modelValue: (__VLS_ctx.formData.description),
        type: "textarea",
        rows: (3),
        placeholder: "请输入描述信息",
        maxlength: "500",
        showWordLimit: true,
    }));
    const __VLS_225 = __VLS_224({
        modelValue: (__VLS_ctx.formData.description),
        type: "textarea",
        rows: (3),
        placeholder: "请输入描述信息",
        maxlength: "500",
        showWordLimit: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_224));
    // @ts-ignore
    [formData,];
    var __VLS_221;
    const __VLS_228 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    ElFormItem;
    // @ts-ignore
    const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
        label: "排序号",
        prop: "sort",
    }));
    const __VLS_230 = __VLS_229({
        label: "排序号",
        prop: "sort",
    }, ...__VLS_functionalComponentArgsRest(__VLS_229));
    const { default: __VLS_232 } = __VLS_231.slots;
    const __VLS_233 = {}.ElInputNumber;
    /** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
    // @ts-ignore
    ElInputNumber;
    // @ts-ignore
    const __VLS_234 = __VLS_asFunctionalComponent(__VLS_233, new __VLS_233({
        modelValue: (__VLS_ctx.formData.sort),
        min: (0),
        max: (999999),
        controlsPosition: "right",
        ...{ style: {} },
    }));
    const __VLS_235 = __VLS_234({
        modelValue: (__VLS_ctx.formData.sort),
        min: (0),
        max: (999999),
        controlsPosition: "right",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_234));
    // @ts-ignore
    [formData,];
    var __VLS_231;
    const __VLS_238 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    ElFormItem;
    // @ts-ignore
    const __VLS_239 = __VLS_asFunctionalComponent(__VLS_238, new __VLS_238({
        label: "状态",
        prop: "isEnabled",
    }));
    const __VLS_240 = __VLS_239({
        label: "状态",
        prop: "isEnabled",
    }, ...__VLS_functionalComponentArgsRest(__VLS_239));
    const { default: __VLS_242 } = __VLS_241.slots;
    const __VLS_243 = {}.ElSwitch;
    /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
    // @ts-ignore
    ElSwitch;
    // @ts-ignore
    const __VLS_244 = __VLS_asFunctionalComponent(__VLS_243, new __VLS_243({
        modelValue: (__VLS_ctx.formData.isEnabled),
        activeText: "启用",
        inactiveText: "禁用",
    }));
    const __VLS_245 = __VLS_244({
        modelValue: (__VLS_ctx.formData.isEnabled),
        activeText: "启用",
        inactiveText: "禁用",
    }, ...__VLS_functionalComponentArgsRest(__VLS_244));
    // @ts-ignore
    [formData,];
    var __VLS_241;
    var __VLS_194;
    {
        const { footer: __VLS_248 } = __VLS_186.slots;
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "dialog-footer" },
        });
        const __VLS_249 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        ElButton;
        // @ts-ignore
        const __VLS_250 = __VLS_asFunctionalComponent(__VLS_249, new __VLS_249({
            ...{ 'onClick': {} },
        }));
        const __VLS_251 = __VLS_250({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_250));
        let __VLS_253;
        let __VLS_254;
        const __VLS_255 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.schema))
                        return;
                    __VLS_ctx.dialogVisible = false;
                    // @ts-ignore
                    [dialogVisible,];
                } });
        const { default: __VLS_256 } = __VLS_252.slots;
        var __VLS_252;
        const __VLS_257 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        ElButton;
        // @ts-ignore
        const __VLS_258 = __VLS_asFunctionalComponent(__VLS_257, new __VLS_257({
            ...{ 'onClick': {} },
            type: "primary",
            loading: (__VLS_ctx.submitting),
        }));
        const __VLS_259 = __VLS_258({
            ...{ 'onClick': {} },
            type: "primary",
            loading: (__VLS_ctx.submitting),
        }, ...__VLS_functionalComponentArgsRest(__VLS_258));
        let __VLS_261;
        let __VLS_262;
        const __VLS_263 = ({ click: {} },
            { onClick: (__VLS_ctx.handleSubmit) });
        const { default: __VLS_264 } = __VLS_260.slots;
        // @ts-ignore
        [submitting, handleSubmit,];
        var __VLS_260;
    }
    var __VLS_186;
}
/** @type {__VLS_StyleScopedClasses['entity-management']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['page-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['search-card']} */ ;
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
/** @type {__VLS_StyleScopedClasses['table-card']} */ ;
/** @type {__VLS_StyleScopedClasses['table-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-left']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-right']} */ ;
/** @type {__VLS_StyleScopedClasses['name-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['name-text']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-form']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
// @ts-ignore
var __VLS_22 = __VLS_21, __VLS_113 = __VLS_112, __VLS_196 = __VLS_195;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        MetadataDrivenPageRenderer: MetadataDrivenPageRenderer,
        Plus: Plus,
        Search: Search,
        Refresh: Refresh,
        Delete: Delete,
        loading: loading,
        submitting: submitting,
        dialogVisible: dialogVisible,
        selectedRows: selectedRows,
        schema: schema,
        searchFormRef: searchFormRef,
        formRef: formRef,
        tableRef: tableRef,
        searchForm: searchForm,
        pagination: pagination,
        tableData: tableData,
        dialogTitle: dialogTitle,
        formData: formData,
        formRules: formRules,
        fetchData: fetchData,
        handleSearch: handleSearch,
        handleReset: handleReset,
        handleCreate: handleCreate,
        handleEdit: handleEdit,
        handleDelete: handleDelete,
        handleBatchDelete: handleBatchDelete,
        handleSubmit: handleSubmit,
        handleDialogClose: handleDialogClose,
        handleSelectionChange: handleSelectionChange,
        handleSortChange: handleSortChange,
        handlePageSizeChange: handlePageSizeChange,
        handleCurrentChange: handleCurrentChange,
        formatDateTime: formatDateTime,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
