/// <reference types="D:/BAOBAB/Baobab.SmartAbp/src/SmartAbp.Vue/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import { ref, computed } from "vue";
const searchQuery = ref("");
const statusFilter = ref("");
const showAddProject = ref(false);
const newProject = ref({
    name: "",
    description: "",
    status: "active",
});
const projects = ref([
    {
        id: 1,
        name: "SmartAbp 核心开发",
        description: "开发 SmartAbp 框架的核心功能模块，包括用户管理、权限控制等基础功能。",
        status: "active",
        members: 5,
        tasks: 24,
        progress: 75,
        createdAt: "2024-01-15",
    },
    {
        id: 2,
        name: "前端界面优化",
        description: "优化用户界面设计，提升用户体验，实现响应式布局。",
        status: "active",
        members: 3,
        tasks: 18,
        progress: 60,
        createdAt: "2024-02-01",
    },
    {
        id: 3,
        name: "数据库迁移",
        description: "将现有数据库迁移到新的架构，优化查询性能。",
        status: "completed",
        members: 2,
        tasks: 12,
        progress: 100,
        createdAt: "2024-01-01",
    },
    {
        id: 4,
        name: "API 文档编写",
        description: "编写完整的 API 文档，包括接口说明和使用示例。",
        status: "paused",
        members: 1,
        tasks: 8,
        progress: 30,
        createdAt: "2024-02-10",
    },
]);
const filteredProjects = computed(() => {
    let filtered = projects.value;
    if (statusFilter.value) {
        filtered = filtered.filter((project) => project.status === statusFilter.value);
    }
    if (searchQuery.value) {
        filtered = filtered.filter((project) => project.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.value.toLowerCase()));
    }
    return filtered;
});
const getStatusText = (status) => {
    const statusMap = {
        active: "进行中",
        completed: "已完成",
        paused: "已暂停",
    };
    return statusMap[status] || status;
};
const addProject = () => {
    const project = {
        id: Date.now(),
        name: newProject.value.name,
        description: newProject.value.description,
        status: newProject.value.status,
        members: 1,
        tasks: 0,
        progress: 0,
        createdAt: new Date().toISOString().split("T")[0],
    };
    projects.value.push(project);
    showAddProject.value = false;
    newProject.value = { name: "", description: "", status: "active" };
};
const viewProject = (project) => {
    console.log("查看项目:", project);
};
const editProject = (project) => {
    console.log("编辑项目:", project);
};
const deleteProject = (project) => {
    if (confirm(`确定要删除项目 ${project.name} 吗？`)) {
        const index = projects.value.findIndex((p) => p.id === project.id);
        if (index > -1) {
            projects.value.splice(index, 1);
        }
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['project-card']} */ ;
/** @type {__VLS_StyleScopedClasses['project-header']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['filters']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['projects-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "projects-view" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "page-content" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "toolbar" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "filters" },
});
__VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
    value: (__VLS_ctx.statusFilter),
    ...{ class: "filter-select" },
});
// @ts-ignore
[statusFilter,];
__VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
    value: "",
});
__VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
    value: "active",
});
__VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
    value: "completed",
});
__VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
    value: "paused",
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    value: (__VLS_ctx.searchQuery),
    type: "text",
    placeholder: "搜索项目...",
    ...{ class: "search-input" },
});
// @ts-ignore
[searchQuery,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showAddProject = true;
            // @ts-ignore
            [showAddProject,];
        } },
    ...{ class: "btn-primary" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "projects-grid" },
});
for (const [project] of __VLS_getVForSourceType((__VLS_ctx.filteredProjects))) {
    // @ts-ignore
    [filteredProjects,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.viewProject(project);
                // @ts-ignore
                [viewProject,];
            } },
        key: (project.id),
        ...{ class: "project-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "project-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    (project.name);
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "status-badge" },
        ...{ class: (project.status) },
    });
    (__VLS_ctx.getStatusText(project.status));
    // @ts-ignore
    [getStatusText,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "project-description" },
    });
    (project.description);
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "project-meta" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "meta-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zM12 14c-3.31 0-6 2.69-6 6v2h12v-2c0-3.31-2.69-6-6-6z",
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (project.members);
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "meta-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zM4 4v2h16V4H4zm0 16h16v2H4v-2z",
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (project.tasks);
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "project-progress" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "progress-bar" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div)({
        ...{ class: "progress-fill" },
        ...{ style: ({ width: project.progress + '%' }) },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "progress-text" },
    });
    (project.progress);
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "project-footer" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "project-date" },
    });
    (project.createdAt);
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "project-actions" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.editProject(project);
                // @ts-ignore
                [editProject,];
            } },
        ...{ class: "action-btn" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.deleteProject(project);
                // @ts-ignore
                [deleteProject,];
            } },
        ...{ class: "action-btn danger" },
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
    });
}
if (__VLS_ctx.showAddProject) {
    // @ts-ignore
    [showAddProject,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showAddProject))
                    return;
                __VLS_ctx.showAddProject = false;
                // @ts-ignore
                [showAddProject,];
            } },
        ...{ class: "modal-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showAddProject))
                    return;
                __VLS_ctx.showAddProject = false;
                // @ts-ignore
                [showAddProject,];
            } },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-body" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.input)({
        value: (__VLS_ctx.newProject.name),
        type: "text",
    });
    // @ts-ignore
    [newProject,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.textarea)({
        value: (__VLS_ctx.newProject.description),
        rows: "3",
    });
    // @ts-ignore
    [newProject,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
        value: (__VLS_ctx.newProject.status),
    });
    // @ts-ignore
    [newProject,];
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "active",
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "paused",
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "completed",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-footer" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showAddProject))
                    return;
                __VLS_ctx.showAddProject = false;
                // @ts-ignore
                [showAddProject,];
            } },
        ...{ class: "btn-secondary" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.addProject) },
        ...{ class: "btn-primary" },
    });
    // @ts-ignore
    [addProject,];
}
/** @type {__VLS_StyleScopedClasses['projects-view']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-content']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['filters']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-select']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['projects-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['project-card']} */ ;
/** @type {__VLS_StyleScopedClasses['project-header']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['project-description']} */ ;
/** @type {__VLS_StyleScopedClasses['project-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['project-progress']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-text']} */ ;
/** @type {__VLS_StyleScopedClasses['project-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['project-date']} */ ;
/** @type {__VLS_StyleScopedClasses['project-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        searchQuery: searchQuery,
        statusFilter: statusFilter,
        showAddProject: showAddProject,
        newProject: newProject,
        filteredProjects: filteredProjects,
        getStatusText: getStatusText,
        addProject: addProject,
        viewProject: viewProject,
        editProject: editProject,
        deleteProject: deleteProject,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
