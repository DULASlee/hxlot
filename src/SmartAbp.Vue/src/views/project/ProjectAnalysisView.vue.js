/// <reference types="D:/BAOBAB/Baobab.SmartAbp/src/SmartAbp.Vue/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import { ref, computed } from "vue";
const projectDetails = ref([
    {
        id: 1,
        name: "SmartAbp 核心开发",
        description: "开发框架核心功能",
        status: "active",
        progress: 75,
        members: 5,
        startDate: "2024-01-15",
        endDate: "2024-06-30",
    },
    {
        id: 2,
        name: "前端界面优化",
        description: "优化用户界面设计",
        status: "active",
        progress: 60,
        members: 3,
        startDate: "2024-02-01",
        endDate: "2024-05-15",
    },
    {
        id: 3,
        name: "数据库迁移",
        description: "数据库架构升级",
        status: "completed",
        progress: 100,
        members: 2,
        startDate: "2024-01-01",
        endDate: "2024-03-31",
    },
    {
        id: 4,
        name: "API 文档编写",
        description: "编写完整的API文档",
        status: "paused",
        progress: 30,
        members: 1,
        startDate: "2024-02-10",
        endDate: "2024-04-30",
    },
]);
const progressData = ref([
    { name: "1月", progress: 20 },
    { name: "2月", progress: 35 },
    { name: "3月", progress: 50 },
    { name: "4月", progress: 65 },
    { name: "5月", progress: 75 },
    { name: "6月", progress: 85 },
]);
// 计算统计数据
const totalProjects = computed(() => projectDetails.value.length);
const activeProjects = computed(() => projectDetails.value.filter((p) => p.status === "active").length);
const completedProjects = computed(() => projectDetails.value.filter((p) => p.status === "completed").length);
const pausedProjects = computed(() => projectDetails.value.filter((p) => p.status === "paused").length);
const getStatusText = (status) => {
    const statusMap = {
        active: "进行中",
        completed: "已完成",
        paused: "已暂停",
    };
    return statusMap[status] || status;
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-color']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-color']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-color']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['projects-table-section']} */ ;
/** @type {__VLS_StyleScopedClasses['projects-table']} */ ;
/** @type {__VLS_StyleScopedClasses['projects-table']} */ ;
/** @type {__VLS_StyleScopedClasses['projects-table']} */ ;
/** @type {__VLS_StyleScopedClasses['projects-table']} */ ;
/** @type {__VLS_StyleScopedClasses['project-name']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['completed']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['paused']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['charts-section']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['projects-table']} */ ;
/** @type {__VLS_StyleScopedClasses['projects-table']} */ ;
/** @type {__VLS_StyleScopedClasses['projects-table']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "project-analysis-view" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "analysis-content" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stats-overview" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-content" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-number" },
});
(__VLS_ctx.totalProjects);
// @ts-ignore
[totalProjects,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-content" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-number" },
});
(__VLS_ctx.completedProjects);
// @ts-ignore
[completedProjects,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-content" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-number" },
});
(__VLS_ctx.activeProjects);
// @ts-ignore
[activeProjects,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-icon" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    viewBox: "0 0 24 24",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-content" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-number" },
});
(__VLS_ctx.pausedProjects);
// @ts-ignore
[pausedProjects,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "charts-section" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "chart-card" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "chart-container" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "pie-chart" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "chart-legend" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "legend-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div)({
    ...{ class: "legend-color active" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
(__VLS_ctx.activeProjects);
// @ts-ignore
[activeProjects,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "legend-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div)({
    ...{ class: "legend-color completed" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
(__VLS_ctx.completedProjects);
// @ts-ignore
[completedProjects,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "legend-item" },
});
__VLS_asFunctionalElement(__VLS_elements.div)({
    ...{ class: "legend-color paused" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
(__VLS_ctx.pausedProjects);
// @ts-ignore
[pausedProjects,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "chart-card" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "chart-container" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "progress-chart" },
});
for (const [month] of __VLS_getVForSourceType((__VLS_ctx.progressData))) {
    // @ts-ignore
    [progressData,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        key: (month.name),
        ...{ class: "progress-bar-item" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "month-label" },
    });
    (month.name);
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "progress-bar" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div)({
        ...{ class: "progress-fill" },
        ...{ style: ({ width: month.progress + '%' }) },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "progress-value" },
    });
    (month.progress);
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "projects-table-section" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "table-container" },
});
__VLS_asFunctionalElement(__VLS_elements.table, __VLS_elements.table)({
    ...{ class: "projects-table" },
});
__VLS_asFunctionalElement(__VLS_elements.thead, __VLS_elements.thead)({});
__VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({});
__VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
__VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
__VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
__VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
__VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
__VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
__VLS_asFunctionalElement(__VLS_elements.tbody, __VLS_elements.tbody)({});
for (const [project] of __VLS_getVForSourceType((__VLS_ctx.projectDetails))) {
    // @ts-ignore
    [projectDetails,];
    __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({
        key: (project.id),
    });
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "project-name" },
    });
    __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
    (project.name);
    __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
    (project.description);
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "status-badge" },
        ...{ class: (project.status) },
    });
    (__VLS_ctx.getStatusText(project.status));
    // @ts-ignore
    [getStatusText,];
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "progress-cell" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "progress-bar small" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div)({
        ...{ class: "progress-fill" },
        ...{ style: ({ width: project.progress + '%' }) },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (project.progress);
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    (project.members);
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    (project.startDate);
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    (project.endDate);
}
/** @type {__VLS_StyleScopedClasses['project-analysis-view']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['charts-section']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['pie-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-legend']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-item']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-color']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-item']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-color']} */ ;
/** @type {__VLS_StyleScopedClasses['completed']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-item']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-color']} */ ;
/** @type {__VLS_StyleScopedClasses['paused']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-bar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['month-label']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-value']} */ ;
/** @type {__VLS_StyleScopedClasses['projects-table-section']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['projects-table']} */ ;
/** @type {__VLS_StyleScopedClasses['project-name']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['small']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-fill']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        projectDetails: projectDetails,
        progressData: progressData,
        totalProjects: totalProjects,
        activeProjects: activeProjects,
        completedProjects: completedProjects,
        pausedProjects: pausedProjects,
        getStatusText: getStatusText,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
