/// <reference types="D:/BAOBAB/Baobab.SmartAbp/src/SmartAbp.Vue/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import { ref, computed } from "vue";
const searchQuery = ref("");
const showAddUser = ref(false);
const newUser = ref({
    name: "",
    email: "",
    role: "user",
});
const users = ref([
    {
        id: 1,
        name: "管理员",
        email: "admin@smartabp.com",
        role: "admin",
        status: "active",
        createdAt: "2024-01-01",
    },
    {
        id: 2,
        name: "张三",
        email: "zhangsan@example.com",
        role: "user",
        status: "active",
        createdAt: "2024-01-15",
    },
    {
        id: 3,
        name: "李四",
        email: "lisi@example.com",
        role: "user",
        status: "inactive",
        createdAt: "2024-02-01",
    },
]);
const filteredUsers = computed(() => {
    if (!searchQuery.value)
        return users.value;
    return users.value.filter((user) => user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.value.toLowerCase()));
});
const addUser = () => {
    const user = {
        id: Date.now(),
        name: newUser.value.name,
        email: newUser.value.email,
        role: newUser.value.role,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
    };
    users.value.push(user);
    showAddUser.value = false;
    newUser.value = { name: "", email: "", role: "user" };
};
const editUser = (user) => {
    console.log("编辑用户:", user);
};
const deleteUser = (user) => {
    if (confirm(`确定要删除用户 ${user.name} 吗？`)) {
        const index = users.value.findIndex((u) => u.id === user.id);
        if (index > -1) {
            users.value.splice(index, 1);
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
/** @type {__VLS_StyleScopedClasses['role-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['role-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['role-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['status-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['status-tag']} */ ;
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
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['search-box']} */ ;
/** @type {__VLS_StyleScopedClasses['users-table']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "users-view" },
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
    placeholder: "搜索用户...",
    ...{ class: "search-input" },
});
// @ts-ignore
[searchQuery,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showAddUser = true;
            // @ts-ignore
            [showAddUser,];
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
    ...{ class: "users-table" },
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
for (const [user] of __VLS_getVForSourceType((__VLS_ctx.filteredUsers))) {
    // @ts-ignore
    [filteredUsers,];
    __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({
        key: (user.id),
    });
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "user-info" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "user-avatar" },
    });
    (user.name.charAt(0));
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
    (user.name);
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    (user.email);
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "role-tag" },
        ...{ class: (user.role) },
    });
    (user.role);
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "status-tag" },
        ...{ class: (user.status) },
    });
    (user.status === "active" ? "活跃" : "禁用");
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    (user.createdAt);
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "actions" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.editUser(user);
                // @ts-ignore
                [editUser,];
            } },
        ...{ class: "btn-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.deleteUser(user);
                // @ts-ignore
                [deleteUser,];
            } },
        ...{ class: "btn-sm danger" },
    });
}
if (__VLS_ctx.showAddUser) {
    // @ts-ignore
    [showAddUser,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showAddUser))
                    return;
                __VLS_ctx.showAddUser = false;
                // @ts-ignore
                [showAddUser,];
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
                if (!(__VLS_ctx.showAddUser))
                    return;
                __VLS_ctx.showAddUser = false;
                // @ts-ignore
                [showAddUser,];
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
        value: (__VLS_ctx.newUser.name),
        type: "text",
    });
    // @ts-ignore
    [newUser,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "email",
    });
    (__VLS_ctx.newUser.email);
    // @ts-ignore
    [newUser,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
        value: (__VLS_ctx.newUser.role),
    });
    // @ts-ignore
    [newUser,];
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "admin",
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "user",
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "guest",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-footer" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showAddUser))
                    return;
                __VLS_ctx.showAddUser = false;
                // @ts-ignore
                [showAddUser,];
            } },
        ...{ class: "btn-secondary" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.addUser) },
        ...{ class: "btn-primary" },
    });
    // @ts-ignore
    [addUser,];
}
/** @type {__VLS_StyleScopedClasses['users-view']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-content']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['search-box']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['users-table']} */ ;
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['role-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['status-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
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
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        searchQuery: searchQuery,
        showAddUser: showAddUser,
        newUser: newUser,
        filteredUsers: filteredUsers,
        addUser: addUser,
        editUser: editUser,
        deleteUser: deleteUser,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
