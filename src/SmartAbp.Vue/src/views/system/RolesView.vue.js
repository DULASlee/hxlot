/// <reference types="D:/BAOBAB/Baobab.SmartAbp/src/SmartAbp.Vue/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import { ref, computed } from "vue";
const searchQuery = ref("");
const showAddRole = ref(false);
const showPermissions = ref(false);
const selectedRole = ref(null);
const newRole = ref({
    name: "",
    description: "",
    permissions: [],
});
const availablePermissions = ref([
    { id: "user.read", name: "查看用户" },
    { id: "user.create", name: "创建用户" },
    { id: "user.update", name: "编辑用户" },
    { id: "user.delete", name: "删除用户" },
    { id: "role.read", name: "查看角色" },
    { id: "role.create", name: "创建角色" },
    { id: "role.update", name: "编辑角色" },
    { id: "role.delete", name: "删除角色" },
    { id: "project.read", name: "查看项目" },
    { id: "project.create", name: "创建项目" },
    { id: "project.update", name: "编辑项目" },
    { id: "project.delete", name: "删除项目" },
    { id: "system.config", name: "系统配置" },
    { id: "system.logs", name: "系统日志" },
]);
const roles = ref([
    {
        id: 1,
        name: "超级管理员",
        description: "拥有系统所有权限的管理员角色",
        userCount: 2,
        permissions: availablePermissions.value.map((p) => p.id),
        createdAt: "2024-01-01",
    },
    {
        id: 2,
        name: "项目管理员",
        description: "负责项目管理的角色",
        userCount: 5,
        permissions: [
            "project.read",
            "project.create",
            "project.update",
            "project.delete",
            "user.read",
        ],
        createdAt: "2024-01-15",
    },
    {
        id: 3,
        name: "普通用户",
        description: "系统普通用户角色",
        userCount: 20,
        permissions: ["user.read", "project.read"],
        createdAt: "2024-02-01",
    },
]);
const filteredRoles = computed(() => {
    if (!searchQuery.value)
        return roles.value;
    return roles.value.filter((role) => role.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.value.toLowerCase()));
});
const getPermissionName = (permissionId) => {
    const permission = availablePermissions.value.find((p) => p.id === permissionId);
    return permission ? permission.name : permissionId;
};
const addRole = () => {
    const role = {
        id: Date.now(),
        name: newRole.value.name,
        description: newRole.value.description,
        userCount: 0,
        permissions: [...newRole.value.permissions],
        createdAt: new Date().toISOString().split("T")[0],
    };
    roles.value.push(role);
    showAddRole.value = false;
    newRole.value = { name: "", description: "", permissions: [] };
};
const editRole = (role) => {
    console.log("编辑角色:", role);
};
const viewPermissions = (role) => {
    selectedRole.value = role;
    showPermissions.value = true;
};
const deleteRole = (role) => {
    if (confirm(`确定要删除角色 ${role.name} 吗？`)) {
        const index = roles.value.findIndex((r) => r.id === role.id);
        if (index > -1) {
            roles.value.splice(index, 1);
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
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-item']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['search-box']} */ ;
/** @type {__VLS_StyleScopedClasses['roles-table']} */ ;
/** @type {__VLS_StyleScopedClasses['permissions-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "roles-view" },
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
    ...{ class: "search-box" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    value: (__VLS_ctx.searchQuery),
    type: "text",
    placeholder: "搜索角色...",
    ...{ class: "search-input" },
});
// @ts-ignore
[searchQuery,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showAddRole = true;
            // @ts-ignore
            [showAddRole,];
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
    ...{ class: "roles-table" },
});
__VLS_asFunctionalElement(__VLS_elements.table, __VLS_elements.table)({});
__VLS_asFunctionalElement(__VLS_elements.thead, __VLS_elements.thead)({});
__VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({});
__VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
__VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
__VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
__VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
__VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
__VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
__VLS_asFunctionalElement(__VLS_elements.tbody, __VLS_elements.tbody)({});
for (const [role] of __VLS_getVForSourceType((__VLS_ctx.filteredRoles))) {
    // @ts-ignore
    [filteredRoles,];
    __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({
        key: (role.id),
    });
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "role-info" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "role-icon" },
    });
    (role.name.charAt(0));
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (role.name);
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    (role.description);
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "user-count" },
    });
    (role.userCount);
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "permission-count" },
    });
    (role.permissions.length);
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    (role.createdAt);
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "actions" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.editRole(role);
                // @ts-ignore
                [editRole,];
            } },
        ...{ class: "btn-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.viewPermissions(role);
                // @ts-ignore
                [viewPermissions,];
            } },
        ...{ class: "btn-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.deleteRole(role);
                // @ts-ignore
                [deleteRole,];
            } },
        ...{ class: "btn-sm danger" },
    });
}
if (__VLS_ctx.showAddRole) {
    // @ts-ignore
    [showAddRole,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showAddRole))
                    return;
                __VLS_ctx.showAddRole = false;
                // @ts-ignore
                [showAddRole,];
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
                if (!(__VLS_ctx.showAddRole))
                    return;
                __VLS_ctx.showAddRole = false;
                // @ts-ignore
                [showAddRole,];
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
        value: (__VLS_ctx.newRole.name),
        type: "text",
    });
    // @ts-ignore
    [newRole,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.textarea)({
        value: (__VLS_ctx.newRole.description),
        rows: "3",
    });
    // @ts-ignore
    [newRole,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "permissions-grid" },
    });
    for (const [permission] of __VLS_getVForSourceType((__VLS_ctx.availablePermissions))) {
        // @ts-ignore
        [availablePermissions,];
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            key: (permission.id),
            ...{ class: "permission-item" },
        });
        __VLS_asFunctionalElement(__VLS_elements.input)({
            type: "checkbox",
            value: (permission.id),
        });
        (__VLS_ctx.newRole.permissions);
        // @ts-ignore
        [newRole,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        (permission.name);
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-footer" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showAddRole))
                    return;
                __VLS_ctx.showAddRole = false;
                // @ts-ignore
                [showAddRole,];
            } },
        ...{ class: "btn-secondary" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.addRole) },
        ...{ class: "btn-primary" },
    });
    // @ts-ignore
    [addRole,];
}
if (__VLS_ctx.showPermissions) {
    // @ts-ignore
    [showPermissions,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showPermissions))
                    return;
                __VLS_ctx.showPermissions = false;
                // @ts-ignore
                [showPermissions,];
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
    (__VLS_ctx.selectedRole?.name);
    // @ts-ignore
    [selectedRole,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showPermissions))
                    return;
                __VLS_ctx.showPermissions = false;
                // @ts-ignore
                [showPermissions,];
            } },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-body" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "permissions-list" },
    });
    for (const [permission] of __VLS_getVForSourceType((__VLS_ctx.selectedRole?.permissions))) {
        // @ts-ignore
        [selectedRole,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (permission),
            ...{ class: "permission-badge" },
        });
        (__VLS_ctx.getPermissionName(permission));
        // @ts-ignore
        [getPermissionName,];
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-footer" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showPermissions))
                    return;
                __VLS_ctx.showPermissions = false;
                // @ts-ignore
                [showPermissions,];
            } },
        ...{ class: "btn-primary" },
    });
}
/** @type {__VLS_StyleScopedClasses['roles-view']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-content']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['search-box']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['roles-table']} */ ;
/** @type {__VLS_StyleScopedClasses['role-info']} */ ;
/** @type {__VLS_StyleScopedClasses['role-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['user-count']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-count']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['permissions-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-item']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['permissions-list']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        searchQuery: searchQuery,
        showAddRole: showAddRole,
        showPermissions: showPermissions,
        selectedRole: selectedRole,
        newRole: newRole,
        availablePermissions: availablePermissions,
        filteredRoles: filteredRoles,
        getPermissionName: getPermissionName,
        addRole: addRole,
        editRole: editRole,
        viewPermissions: viewPermissions,
        deleteRole: deleteRole,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
