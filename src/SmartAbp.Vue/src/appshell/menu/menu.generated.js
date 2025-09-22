// AUTO-GENERATED FILE – DO NOT EDIT.
// Generated at: 2025-09-19T02:08:16.752Z
export const generatedMenus = [
    {
        key: "user-management",
        title: "用户管理",
        icon: "👥",
        type: "folder",
        order: 100,
        visible: true,
        requiredRoles: ["admin", "admin666"],
        children: [
            {
                key: "user-list",
                title: "用户管理列表",
                icon: "👥",
                type: "page",
                path: "/User",
                component: "@/views/user/UserListView.vue",
                order: 0,
                visible: true,
                requiredRoles: ["admin", "admin666"],
                meta: {
                    title: "用户管理列表",
                    icon: "👥",
                    requiredRoles: ["admin", "admin666"],
                    menuKey: "user-list",
                    showInMenu: true,
                },
            },
            {
                key: "user-management",
                title: "用户管理管理",
                icon: "👥",
                type: "page",
                path: "/User/management",
                component: "@/views/user/UserManagement.vue",
                order: 1,
                visible: true,
                requiredRoles: ["admin", "admin666"],
                meta: {
                    title: "用户管理管理",
                    icon: "👥",
                    requiredRoles: ["admin", "admin666"],
                    menuKey: "user-management",
                    showInMenu: true,
                },
            },
        ],
    },
];
