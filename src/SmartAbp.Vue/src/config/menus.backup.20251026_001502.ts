import type { MenuConfig, MenuItem, PageMenuItem } from "@/types/menu"

/**
 * SmartAbp 完整菜单配置
 * 基于现有路由系统和权限模型
 * 与现有 AuthService 和路由配置完全兼容
 */

// 角色常量定义 (与现有系统保持一致)
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  GUEST: "guest",
} as const

// 完整菜单配置
export const menuConfig: MenuConfig = {
  defaultPath: "/lowcode/welcome",  // ✅ 默认进入低代码工作台（Portal入口）
  loginPath: "/login",
  forbiddenPath: "/403",

  menus: [
    // 工作台 (所有用户可访问)
    {
      key: "dashboard",
      title: "工作台",
      icon: "dashboard", // 🎨 使用图标键名，支持动态切换
      type: "page",
      path: "/dashboard",
      component: "@/views/common/DashboardView.vue",
      order: 1,
      visible: true,
      requiredRoles: [ROLES.USER, ROLES.ADMIN],
      closable: false,
      meta: {
        title: "工作台",
        keepAlive: true,
      },
    },

    // 分割线
    {
      key: "divider-1",
      title: "",
      type: "divider",
      order: 2,
      visible: true,
      requiredRoles: [],
      icon: "",
      description: "业务功能分割线",
    },

    // 项目管理模块
    {
      key: "project-management",
      title: "项目管理",
      icon: "project-diagram",
      type: "folder",
      order: 4,
      visible: true,
      requiredRoles: [ROLES.USER, ROLES.ADMIN],
      defaultExpanded: true,
      description: "项目信息管理、项目分析等功能",
      children: [
        {
          key: "project-list",
          title: "项目列表",
          icon: "tasks",
          type: "page",
          path: "/Project",
          component: "@/views/project/ProjectListView.vue",
          order: 1,
          visible: true,
          requiredRoles: [ROLES.USER, ROLES.ADMIN],
          closable: true,
          meta: {
            title: "项目列表",
            menuKey: "project-list",
          },
        },
        {
          key: "project-analysis",
          title: "项目分析",
          icon: "chart-line",
          type: "page",
          path: "/Project/analysis",
          component: "@/views/project/ProjectAnalysisView.vue",
          order: 2,
          visible: true,
          requiredRoles: [ROLES.ADMIN],
          closable: true,
          meta: {
            title: "项目分析",
            menuKey: "project-analysis",
          },
        },
      ],
    },

    // 日志管理模块
    {
      key: "log-management",
      title: "日志管理",
      icon: "file-alt",
      type: "folder",
      order: 5,
      visible: true,
      requiredRoles: [ROLES.ADMIN],
      defaultExpanded: true,
      description: "系统日志查看、分析和管理",
      children: [
        {
          key: "log-list",
          title: "日志管理",
          icon: "list-ul",
          type: "page",
          path: "/Log",
          component: "@/views/log/LogManagement.vue",
          order: 1,
          visible: true,
          requiredRoles: [ROLES.ADMIN],
          closable: true,
          meta: {
            title: "日志管理",
            menuKey: "log-management",
          },
        },
        {
          key: "log-viewer",
          title: "日志查看器",
          icon: "eye",
          type: "page",
          path: "/Log/viewer",
          component: "@/views/log/AdvancedLogViewer.vue",
          order: 2,
          visible: true,
          requiredRoles: [ROLES.ADMIN],
          closable: true,
          meta: {
            title: "日志查看器",
            menuKey: "log-viewer",
          },
        },
        {
          key: "log-dashboard",
          title: "日志仪表板",
          icon: "chart-bar",
          type: "page",
          path: "/Log/dashboard",
          component: "@/views/log/LogDashboard.vue",
          order: 3,
          visible: true,
          requiredRoles: [ROLES.ADMIN],
          closable: true,
          meta: {
            title: "日志仪表板",
            menuKey: "log-dashboard",
          },
        },
      ],
    },

    // 分割线
    {
      key: "divider-2",
      title: "",
      type: "divider",
      order: 6,
      visible: true,
      requiredRoles: [],
      icon: "",
      description: "系统管理分割线",
    },

    // 系统管理模块 (仅管理员可见)
    {
      key: "system-management",
      title: "系统管理",
      icon: "cog",
      type: "folder",
      order: 7,
      visible: true,
      requiredRoles: [ROLES.ADMIN],
      defaultExpanded: false,
      description: "系统级配置和管理功能",
      children: [
        {
          key: "admin-settings",
          title: "系统设置",
          icon: "cogs",
          type: "page",
          path: "/Admin/settings",
          component: "@/views/common/SettingsView.vue",
          order: 4,
          visible: true,
          requiredRoles: [ROLES.ADMIN],
          closable: true,
          meta: {
            title: "系统设置",
            menuKey: "admin-settings",
          },
        },
        {
          key: "admin-performance",
          title: "性能监控",
          icon: "tachometer-alt",
          type: "page",
          path: "/Admin/performance",
          component: "@/views/system/PerformanceMonitorView.vue",
          order: 5,
          visible: true,
          requiredRoles: [ROLES.ADMIN, ROLES.GUEST],
          closable: true,
          meta: {
            title: "性能监控",
            menuKey: "admin-performance",
          },
        },
      ],
    },

    // 测试功能模块 (开发环境)
    {
      key: "test-features",
      title: "测试功能",
      icon: "vial",
      type: "folder",
      order: 8,
      visible: import.meta.env.DEV, // 仅开发环境显示
      requiredRoles: [ROLES.ADMIN],
      defaultExpanded: false,
      description: "开发和测试相关功能",
      children: [
        {
          key: "test-system",
          title: "系统测试",
          icon: "microscope",
          type: "page",
          path: "/Test",
          component: "@/views/test/TestView.vue",
          order: 1,
          visible: true,
          requiredRoles: [ROLES.ADMIN],
          closable: true,
          meta: {
            title: "系统测试",
            menuKey: "test-system",
          },
        },
        {
          key: "test-login",
          title: "登录测试",
          icon: "sign-in-alt",
          type: "page",
          path: "/Test/login",
          component: "@/views/auth/LoginTest.vue",
          order: 2,
          visible: true,
          requiredRoles: [ROLES.ADMIN],
          closable: true,
          meta: {
            title: "登录测试",
            menuKey: "test-login",
          },
        },
        {
          key: "test-theme",
          title: "主题演示",
          icon: "palette",
          type: "page",
          path: "/Test/theme",
          component: "@/views/test/ThemeDemo.vue",
          order: 3,
          visible: true,
          requiredRoles: [ROLES.ADMIN],
          closable: true,
          meta: {
            title: "主题演示",
            menuKey: "test-theme",
          },
        },
        {
          key: "test-theme-debug",
          title: "主题调试",
          icon: "bug",
          type: "page",
          path: "/Test/theme-debug",
          component: "@/views/test/ThemeDebugView.vue",
          order: 4,
          visible: true,
          requiredRoles: [ROLES.ADMIN],
          closable: true,
          meta: {
            title: "主题调试",
            menuKey: "test-theme-debug",
          },
        },
      ],
    },

    // 🚀 低代码引擎 - 三大用户入口
    {
      key: "lowcode-engine",
      title: "低代码引擎",
      icon: "microchip",
      type: "folder",
      path: "/lowcode",
      order: 3,
      visible: true,
      requiredRoles: [ROLES.ADMIN, ROLES.USER, ROLES.GUEST],
      defaultExpanded: true,
      description: "企业级代码生成引擎 - 三大入口满足不同需求",
      children: [
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 工作台入口
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        {
          key: "lowcode-portal",
          title: "工作台",
          icon: "home",
          type: "page",
          path: "/lowcode/welcome",
          component: "@/views/lowcode/LowCodeStudioWelcome.vue",
          order: 0,
          visible: true,
          requiredRoles: [ROLES.ADMIN, ROLES.USER, ROLES.GUEST],
          closable: true,
          meta: {
            title: "低代码工作台",
            menuKey: "lowcode-portal",
            keepAlive: true,
            description: "代码生成入口 + 最近项目 + 使用统计",
          },
        },

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 三种代码生成模式
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        {
          key: "ultra-simple-mode",
          title: "极简模式",
          icon: "bolt",
          type: "page",
          path: "/lowcode/layer1",
          component: "@/views/lowcode/UltraSimpleStudio.vue",
          order: 1,
          visible: true,
          requiredRoles: [ROLES.ADMIN, ROLES.USER, ROLES.GUEST],
          closable: true,
          meta: {
            title: "极简模式",
            menuKey: "ultra-simple-mode",
            keepAlive: true,
            description: "选择数据表，一键生成代码（3-5分钟）",
          },
        },
        {
          key: "smart-config-mode",
          title: "智能配置模式",
          icon: "cog",
          type: "page",
          path: "/lowcode/layer2",
          component: "@/views/lowcode/SmartStudioLite.vue",
          order: 2,
          visible: true,
          requiredRoles: [ROLES.ADMIN, ROLES.USER, ROLES.GUEST],
          closable: true,
          meta: {
            title: "智能配置模式",
            menuKey: "smart-config-mode",
            keepAlive: true,
            description: "可视化配置字段和关系（10-20分钟）",
          },
        },
        {
          key: "professional-mode",
          title: "专业模式",
          icon: "rocket",
          type: "page",
          path: "/lowcode/layer3",
          component: "@smartabp/lowcode-designer/views/EntityModelingView.vue",
          order: 3,
          visible: true,
          requiredRoles: [ROLES.ADMIN, ROLES.USER],
          closable: true,
          meta: {
            title: "专业模式",
            menuKey: "professional-mode",
            keepAlive: true,
            description: "完整的实体建模和代码生成（30-60分钟）",
          },
        },

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 专项生成器（新增：数字大屏、移动APP）
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        {
          key: "mes-generator",
          title: "数字大屏生成器",
          icon: "chart-bar",
          type: "page",
          path: "/lowcode/mes-generator",
          component: "@/views/lowcode/MESGeneratorView.vue",
          order: 4,
          visible: true,
          requiredRoles: [ROLES.ADMIN, ROLES.USER],
          closable: true,
          meta: {
            title: "MES数字大屏生成器",
            menuKey: "mes-generator",
            keepAlive: true,
            description: "生成MES生产监控数字大屏",
          },
        },
        {
          key: "uniapp-generator",
          title: "移动APP生成器",
          icon: "mobile-alt",
          type: "page",
          path: "/lowcode/uniapp-generator",
          component: "@/views/lowcode/UniAppGeneratorView.vue",
          order: 5,
          visible: true,
          requiredRoles: [ROLES.ADMIN, ROLES.USER],
          closable: true,
          meta: {
            title: "UniApp移动应用生成器",
            menuKey: "uniapp-generator",
            keepAlive: true,
            description: "生成跨平台移动应用（iOS/Android/小程序）",
          },
        },

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 辅助工具（折叠）
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        {
          key: "lowcode-tools",
          title: "🛠️ 辅助工具",
          icon: "tools",
          type: "folder",
          order: 4,
          visible: true,
          requiredRoles: [ROLES.ADMIN, ROLES.USER],
          defaultExpanded: false,
          description: "表单设计器、UI定制、主题定制等",
          children: [
            {
              key: "drag-drop-form",
              title: "表单设计器",
              icon: "mouse-pointer",
              type: "page",
              path: "/CodeGen/form",
              component: "@/views/codegen/DragDropFormView.vue",
              order: 1,
              visible: true,
              requiredRoles: [ROLES.ADMIN, ROLES.USER],
              closable: true,
              meta: {
                title: "拖拽表单开发器",
                menuKey: "drag-drop-form",
              },
            },
            {
              key: "visual-design",
              title: "UI定制",
              icon: "paint-brush",
              type: "page",
              path: "/lowcode/design",
              component: "@/views/lowcode/DesignView.vue",
              order: 2,
              visible: true,
              requiredRoles: [ROLES.ADMIN, ROLES.USER, ROLES.GUEST],
              closable: true,
              meta: {
                title: "UI定制",
                menuKey: "visual-design",
                keepAlive: true,
              },
            },
            {
              key: "theme-customization",
              title: "主题定制",
              icon: "palette",
              type: "page",
              path: "/lowcode/theme",
              component: "@/views/lowcode/ThemeCustomizationView.vue",
              order: 3,
              visible: true,
              requiredRoles: [ROLES.ADMIN, ROLES.USER, ROLES.GUEST],
              closable: true,
              meta: {
                title: "主题定制",
                menuKey: "theme-customization",
                keepAlive: true,
              },
            },
          ],
        },

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 高级功能（折叠，仅开发环境或管理员可见）
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        {
          key: "lowcode-advanced",
          title: "🔧 高级功能",
          icon: "sliders-h",
          type: "folder",
          order: 5,
          visible: import.meta.env.DEV || true, // 开发环境或管理员可见
          requiredRoles: [ROLES.ADMIN],
          defaultExpanded: false,
          description: "Aspire设计器、可观测性、业务规则引擎",
          children: [
            {
              key: "aspire-designer",
              title: ".NET Aspire设计器",
              icon: "network-wired",
              type: "page",
              path: "/lowcode/aspire-designer",
              component: "@smartabp/lowcode-designer/views/codegen/AspireDesignerView.vue",
              order: 1,
              visible: true,
              requiredRoles: [ROLES.ADMIN, ROLES.USER],
              closable: true,
              meta: {
                title: ".NET Aspire设计器",
                menuKey: "aspire-designer",
                keepAlive: true,
                description: "微服务编排与云原生架构设计",
              },
            },
            {
              key: "observability-dashboard",
              title: "可观测性仪表板",
              icon: "chart-line",
              type: "page",
              path: "/lowcode/observability-dashboard",
              component: "@smartabp/lowcode-designer/views/codegen/ObservabilityDashboard.vue",
              order: 2,
              visible: true,
              requiredRoles: [ROLES.ADMIN, ROLES.USER],
              closable: true,
              meta: {
                title: "可观测性仪表板",
                menuKey: "observability-dashboard",
                keepAlive: true,
                description: "黄金指标与RED指标实时监控",
              },
            },
            {
              key: "business-rules-engine",
              title: "业务规则引擎",
              icon: "cogs",
              type: "page",
              path: "/business-rules",
              component: "@/views/business-rules/BusinessRulesEngine.vue",
              order: 3,
              visible: true,
              requiredRoles: [ROLES.ADMIN, ROLES.USER],
              closable: true,
              meta: {
                title: "业务规则引擎",
                menuKey: "business-rules-engine",
                keepAlive: true,
                description: "动态业务规则配置与执行引擎",
              },
            },
          ],
        },
      ],
    },

    // 🔧 运维监控模块（新增）
    {
      key: "ops-monitoring",
      title: "运维监控",
      icon: "tachometer-alt", // 使用监控相关图标
      type: "folder",
      order: 9,
      visible: true,
      requiredRoles: [ROLES.ADMIN], // 仅管理员可见
      defaultExpanded: false,
      description: "系统运维监控、性能分析、日志管理和告警",
      children: [
        {
          key: "ops-apm",
          title: "性能监控",
          icon: "chart-line",
          type: "page",
          path: "/ops-monitoring/apm",
          component: "@/views/ops/ApmDashboard.vue",
          order: 1,
          visible: true,
          requiredRoles: [ROLES.ADMIN],
          closable: true,
          meta: {
            title: "性能监控(APM)",
            menuKey: "ops-apm",
            keepAlive: true,
          },
        },
        {
          key: "ops-logs",
          title: "日志管理",
          icon: "file-alt",
          type: "page",
          path: "/ops-monitoring/logs",
          component: "@/views/ops/LogsDashboard.vue",
          order: 2,
          visible: true,
          requiredRoles: [ROLES.ADMIN],
          closable: true,
          meta: {
            title: "日志管理(ELK)",
            menuKey: "ops-logs",
            keepAlive: true,
          },
        },
        {
          key: "ops-k8s",
          title: "K8s监控",
          icon: "server",
          type: "page",
          path: "/ops-monitoring/k8s",
          component: "@/views/ops/K8sDashboard.vue",
          order: 3,
          visible: true,
          requiredRoles: [ROLES.ADMIN],
          closable: true,
          meta: {
            title: "K8s监控",
            menuKey: "ops-k8s",
            keepAlive: true,
          },
        },
        {
          key: "ops-alerts",
          title: "告警管理",
          icon: "bell",
          type: "page",
          path: "/ops-monitoring/alerts",
          component: "@/views/ops/AlertDashboard.vue",
          order: 4,
          visible: true,
          requiredRoles: [ROLES.ADMIN],
          closable: true,
          meta: {
            title: "告警管理",
            menuKey: "ops-alerts",
            keepAlive: true,
          },
        },
      ],
    },

    // 分割线
    {
      key: "divider-3",
      title: "",
      type: "divider",
      order: 10,
      visible: true,
      requiredRoles: [],
      icon: "",
      description: "个人功能分割线",
    },

    // 个人中心
    {
      key: "profile",
      title: "个人中心",
      icon: "user",
      type: "page",
      path: "/profile",
      component: "@/views/common/ProfileView.vue",
      order: 11,
      visible: true,
      requiredRoles: [ROLES.USER, ROLES.ADMIN],
      closable: true,
      meta: {
        title: "个人中心",
      },
    },

    // 帮助中心
    {
      key: "help",
      title: "帮助中心",
      icon: "question-circle",
      type: "page",
      path: "/help",
      component: "@/views/common/HelpView.vue",
      order: 12,
      visible: true,
      requiredRoles: [ROLES.USER, ROLES.ADMIN],
      closable: true,
      meta: {
        title: "帮助中心",
      },
    },
  ],
}

// 导出菜单配置
export default menuConfig

// 工具函数：根据key查找菜单项
export const findMenuItemByKey = (
  key: string,
  menus: MenuItem[] = menuConfig.menus,
): MenuItem | null => {
  for (const menu of menus) {
    if (menu.key === key) {
      return menu
    }
    if (menu.type === "folder" && menu.children) {
      const found = findMenuItemByKey(key, menu.children)
      if (found) return found
    }
  }
  return null
}

// 工具函数：根据路径查找菜单项
export const findMenuItemByPath = (
  path: string,
  menus: MenuItem[] = menuConfig.menus,
): MenuItem | null => {
  for (const menu of menus) {
    if (menu.type === "page" && menu.path === path) {
      return menu
    }
    if (menu.type === "folder" && menu.children) {
      const found = findMenuItemByPath(path, menu.children)
      if (found) return found
    }
  }
  return null
}

// 工具函数：获取扁平化的所有页面菜单
export const getFlatPageMenus = (menus: MenuItem[] = menuConfig.menus): PageMenuItem[] => {
  const pageMenus: PageMenuItem[] = []

  const collectPageMenus = (items: MenuItem[]) => {
    items.forEach((item) => {
      if (item.type === "page") {
        pageMenus.push(item)
      } else if (item.type === "folder" && item.children) {
        collectPageMenus(item.children)
      }
    })
  }

  collectPageMenus(menus)
  return pageMenus
}
