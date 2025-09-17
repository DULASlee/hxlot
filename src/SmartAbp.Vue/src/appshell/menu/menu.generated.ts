// AUTO-GENERATED FILE – DO NOT EDIT.
// Generated at: 2025-09-12T23:12:15.484Z

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
  {
    key: "lowcode-engine",
    title: "低代码引擎",
    icon: "⚡",
    type: "folder",
    order: 1,
    visible: true,
    children: [
      {
        key: "module-wizard",
        title: "模块向导",
        icon: "✨",
        type: "page",
        path: "/CodeGen/module-wizard-test",
        component: "@smartabp/lowcode-designer/views/dev/ModuleWizardTestView.vue",
        visible: true,
      },
      {
        key: "ui-customizer",
        title: "UI定制器",
        icon: "🎨",
        type: "page",
        path: "/CodeGen/ui-customizer-test",
        component: "@smartabp/lowcode-designer/views/dev/UICustomizerTestView.vue",
        visible: true,
      },
      {
        key: "page-renderer",
        title: "页面渲染器",
        icon: "🖼️",
        type: "page",
        path: "/CodeGen/page-renderer-test",
        component: "@smartabp/lowcode-designer/views/dev/PageRendererTestView.vue",
        visible: true,
      },
      {
        key: "relationship-designer",
        title: "关系设计器",
        icon: "🔗",
        type: "page",
        path: "/CodeGen/relationship-designer-test",
        component: "@smartabp/lowcode-designer/views/dev/RelationshipDesignerTestView.vue",
        visible: true,
      }
    ]
  }
]
