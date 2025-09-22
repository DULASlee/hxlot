// AUTO-GENERATED FILE – DO NOT EDIT.
// Generated at: 2025-09-19T02:08:16.751Z
export const generatedRoutes = [
    {
        name: "UserList",
        path: "/User",
        component: () => import("@/views/user/UserListView.vue"),
        meta: {
            title: "用户管理列表",
            icon: "👥",
            requiredRoles: ["admin", "admin666"],
            menuKey: "user-list",
            showInMenu: true,
        },
    },
    {
        name: "UserManagement",
        path: "/User/management",
        component: () => import("@/views/user/UserManagement.vue"),
        meta: {
            title: "用户管理管理",
            icon: "👥",
            requiredRoles: ["admin", "admin666"],
            menuKey: "user-management",
            showInMenu: true,
        },
    },
];
