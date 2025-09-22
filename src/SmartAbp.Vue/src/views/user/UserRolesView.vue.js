/// <reference types="D:/BAOBAB/Baobab.SmartAbp/src/SmartAbp.Vue/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import { ref, onMounted } from "vue";
// 角色列表
const roleList = ref([
    {
        id: 1,
        name: "超级管理员",
        description: "拥有系统所有权限",
        permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
    {
        id: 2,
        name: "项目经理",
        description: "项目管理相关权限",
        permissions: [1, 2, 3, 7, 8, 9],
    },
    {
        id: 3,
        name: "安全员",
        description: "安全管理相关权限",
        permissions: [1, 4, 5, 6],
    },
]);
// 菜单权限树
const menuTree = ref([
    {
        id: 1,
        name: "系统管理",
        expanded: true,
        children: [
            {
                id: 2,
                name: "用户管理",
                expanded: true,
                buttons: [
                    { id: 7, name: "新增" },
                    { id: 8, name: "编辑" },
                    { id: 9, name: "删除" },
                ],
            },
            {
                id: 3,
                name: "角色管理",
                expanded: false,
                buttons: [
                    { id: 10, name: "新增" },
                    { id: 11, name: "编辑" },
                    { id: 12, name: "删除" },
                ],
            },
        ],
    },
    {
        id: 4,
        name: "项目管理",
        expanded: false,
        children: [
            {
                id: 5,
                name: "项目列表",
                expanded: false,
                buttons: [],
            },
        ],
    },
    {
        id: 6,
        name: "考勤管理",
        expanded: false,
        children: [],
    },
]);
// 选中的角色
const selectedRole = ref(null);
// 方法
const selectRole = (role) => {
    selectedRole.value = role;
};
const editRole = (role) => {
    alert(`编辑角色: ${role.name}`);
};
const deleteRole = (role) => {
    if (confirm(`确定要删除角色 ${role.name} 吗？`)) {
        console.log("删除角色:", role);
    }
};
const toggleNode = (node) => {
    node.expanded = !node.expanded;
};
const isMenuChecked = (menu) => {
    if (!selectedRole.value)
        return false;
    const sr = selectedRole.value;
    return sr.permissions.includes(menu.id);
};
const isButtonChecked = (button) => {
    if (!selectedRole.value)
        return false;
    const sr = selectedRole.value;
    return sr.permissions.includes(button.id);
};
const handleMenuCheck = (menu, event) => {
    if (!selectedRole.value)
        return;
    const checked = event.target.checked;
    const sr = selectedRole.value;
    if (checked) {
        if (!sr.permissions.includes(menu.id)) {
            sr.permissions.push(menu.id);
        }
    }
    else {
        const index = sr.permissions.indexOf(menu.id);
        if (index > -1) {
            sr.permissions.splice(index, 1);
        }
    }
};
const handleButtonCheck = (button, event) => {
    if (!selectedRole.value)
        return;
    const checked = event.target.checked;
    const sr = selectedRole.value;
    if (checked) {
        if (!sr.permissions.includes(button.id)) {
            sr.permissions.push(button.id);
        }
    }
    else {
        const index = sr.permissions.indexOf(button.id);
        if (index > -1) {
            sr.permissions.splice(index, 1);
        }
    }
};
const savePermissions = () => {
    if (!selectedRole.value)
        return;
    console.log("保存权限:", selectedRole.value);
    alert("权限保存成功！");
};
const resetPermissions = () => {
    if (!selectedRole.value)
        return;
    if (confirm("确定要重置权限配置吗？")) {
        // 重置逻辑
        console.log("重置权限");
    }
};
onMounted(() => {
    // 默认选中第一个角色
    if (roleList.value.length > 0) {
        selectedRole.value = roleList.value[0];
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['role-item']} */ ;
/** @type {__VLS_StyleScopedClasses['role-item']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-node-content']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-expand-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-default']} */ ;
/** @type {__VLS_StyleScopedClasses['roles-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['role-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['permissions-actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "page-container" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "page-actions" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ class: "btn btn-primary" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "roles-layout" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "roles-panel" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
    ...{ class: "panel-title" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "roles-list" },
});
for (const [role] of __VLS_getVForSourceType((__VLS_ctx.roleList))) {
    // @ts-ignore
    [roleList,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectRole(role);
                // @ts-ignore
                [selectRole,];
            } },
        key: (role.id),
        ...{ class: "role-item" },
        ...{ class: ({ active: __VLS_ctx.selectedRole?.id === role.id }) },
    });
    // @ts-ignore
    [selectedRole,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "role-info" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "role-name" },
    });
    (role.name);
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "role-desc" },
    });
    (role.description);
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "role-actions" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.editRole(role);
                // @ts-ignore
                [editRole,];
            } },
        ...{ class: "btn btn-sm btn-primary" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.deleteRole(role);
                // @ts-ignore
                [deleteRole,];
            } },
        ...{ class: "btn btn-sm btn-danger" },
    });
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "permissions-panel" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
    ...{ class: "panel-title" },
});
if (__VLS_ctx.selectedRole) {
    // @ts-ignore
    [selectedRole,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "selected-role" },
    });
    (__VLS_ctx.selectedRole.name);
    // @ts-ignore
    [selectedRole,];
}
if (__VLS_ctx.selectedRole) {
    // @ts-ignore
    [selectedRole,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "permissions-content" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "permission-tree" },
    });
    for (const [menu] of __VLS_getVForSourceType((__VLS_ctx.menuTree))) {
        // @ts-ignore
        [menuTree,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (menu.id),
            ...{ class: "tree-node" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.selectedRole))
                        return;
                    __VLS_ctx.toggleNode(menu);
                    // @ts-ignore
                    [toggleNode,];
                } },
            ...{ class: "tree-node-content" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "tree-expand-icon" },
            ...{ class: ({ expanded: menu.expanded }) },
        });
        __VLS_asFunctionalElement(__VLS_elements.input)({
            ...{ onChange: (...[$event]) => {
                    if (!(__VLS_ctx.selectedRole))
                        return;
                    __VLS_ctx.handleMenuCheck(menu, $event);
                    // @ts-ignore
                    [handleMenuCheck,];
                } },
            type: "checkbox",
            ...{ class: "tree-checkbox" },
            checked: (__VLS_ctx.isMenuChecked(menu)),
        });
        // @ts-ignore
        [isMenuChecked,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "tree-label" },
        });
        (menu.name);
        if (menu.expanded && menu.children) {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "tree-children" },
            });
            for (const [submenu] of __VLS_getVForSourceType((menu.children))) {
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    key: (submenu.id),
                    ...{ class: "tree-node" },
                });
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.selectedRole))
                                return;
                            if (!(menu.expanded && menu.children))
                                return;
                            __VLS_ctx.toggleNode(submenu);
                            // @ts-ignore
                            [toggleNode,];
                        } },
                    ...{ class: "tree-node-content" },
                });
                __VLS_asFunctionalElement(__VLS_elements.span)({
                    ...{ class: "tree-indent" },
                });
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "tree-expand-icon" },
                    ...{ class: ({ expanded: submenu.expanded }) },
                });
                __VLS_asFunctionalElement(__VLS_elements.input)({
                    ...{ onChange: (...[$event]) => {
                            if (!(__VLS_ctx.selectedRole))
                                return;
                            if (!(menu.expanded && menu.children))
                                return;
                            __VLS_ctx.handleMenuCheck(submenu, $event);
                            // @ts-ignore
                            [handleMenuCheck,];
                        } },
                    type: "checkbox",
                    ...{ class: "tree-checkbox" },
                    checked: (__VLS_ctx.isMenuChecked(submenu)),
                });
                // @ts-ignore
                [isMenuChecked,];
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "tree-label" },
                });
                (submenu.name);
                if (submenu.expanded && submenu.buttons) {
                    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                        ...{ class: "tree-children" },
                    });
                    for (const [button] of __VLS_getVForSourceType((submenu.buttons))) {
                        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                            key: (button.id),
                            ...{ class: "tree-node" },
                        });
                        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                            ...{ class: "tree-node-content" },
                        });
                        __VLS_asFunctionalElement(__VLS_elements.span)({
                            ...{ class: "tree-indent" },
                        });
                        __VLS_asFunctionalElement(__VLS_elements.span)({
                            ...{ class: "tree-indent" },
                        });
                        __VLS_asFunctionalElement(__VLS_elements.input)({
                            ...{ onChange: (...[$event]) => {
                                    if (!(__VLS_ctx.selectedRole))
                                        return;
                                    if (!(menu.expanded && menu.children))
                                        return;
                                    if (!(submenu.expanded && submenu.buttons))
                                        return;
                                    __VLS_ctx.handleButtonCheck(button, $event);
                                    // @ts-ignore
                                    [handleButtonCheck,];
                                } },
                            type: "checkbox",
                            ...{ class: "tree-checkbox" },
                            checked: (__VLS_ctx.isButtonChecked(button)),
                        });
                        // @ts-ignore
                        [isButtonChecked,];
                        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                            ...{ class: "tree-label" },
                        });
                        (button.name);
                    }
                }
            }
        }
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "permissions-actions" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.savePermissions) },
        ...{ class: "btn btn-primary" },
    });
    // @ts-ignore
    [savePermissions,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.resetPermissions) },
        ...{ class: "btn btn-default" },
    });
    // @ts-ignore
    [resetPermissions,];
}
else {
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "empty-state" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "empty-icon" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
}
/** @type {__VLS_StyleScopedClasses['page-container']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['roles-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['roles-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-title']} */ ;
/** @type {__VLS_StyleScopedClasses['roles-list']} */ ;
/** @type {__VLS_StyleScopedClasses['role-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['role-info']} */ ;
/** @type {__VLS_StyleScopedClasses['role-name']} */ ;
/** @type {__VLS_StyleScopedClasses['role-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['role-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['permissions-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-title']} */ ;
/** @type {__VLS_StyleScopedClasses['selected-role']} */ ;
/** @type {__VLS_StyleScopedClasses['permissions-content']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-tree']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-node']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-node-content']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-expand-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['expanded']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-label']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-children']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-node']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-node-content']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-indent']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-expand-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['expanded']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-label']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-children']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-node']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-node-content']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-indent']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-indent']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-label']} */ ;
/** @type {__VLS_StyleScopedClasses['permissions-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-default']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        roleList: roleList,
        menuTree: menuTree,
        selectedRole: selectedRole,
        selectRole: selectRole,
        editRole: editRole,
        deleteRole: deleteRole,
        toggleNode: toggleNode,
        isMenuChecked: isMenuChecked,
        isButtonChecked: isButtonChecked,
        handleMenuCheck: handleMenuCheck,
        handleButtonCheck: handleButtonCheck,
        savePermissions: savePermissions,
        resetPermissions: resetPermissions,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
