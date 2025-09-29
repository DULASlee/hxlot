/**
 * 🏢 SmartAbp 企业级菜单系统 (升级版)
 * 🎯 使用统一的企业级图标系统
 * ❌ 严禁添加AI智能辅助功能
 * ❌ 严禁添加多人协作功能
 * 📦 遵循企业级菜单架构标准
 */

import type { MenuConfig, MenuItem } from "@/types/menu"

// 🏗️ 企业级菜单结构设计
export interface EnterpriseMenuStructure {
  // 🏠 主工作台 (必须)
  workspace: MenuItem[]
  
  // 🏗️ 系统管理 (管理员功能)
  systemManagement: MenuItem[]
  
  // 💼 业务管理 (核心业务功能)
  businessManagement: MenuItem[]
  
  // 📊 基础数据 (主数据管理)
  masterData: MenuItem[]
  
  // 📈 报表分析 (分析统计)
  reports: MenuItem[]
  
  // ⚙️ 工具箱 (开发工具，包括低代码Studio)
  toolbox: MenuItem[]
}

// 🎯 企业级菜单配置 (使用新图标系统)
export const enterpriseMenus: EnterpriseMenuStructure = {
  // 🏠 主工作台区域
  workspace: [
    {
      key: "dashboard",
      title: "工作台概览",
      icon: "dashboard", // 🎯 使用企业级图标
      type: "page",
      path: "/dashboard",
      component: "@/views/common/DashboardView.vue",
      order: 1,
      visible: true,
      requiredRoles: ["user", "admin"],
      closable: false,
      meta: {
        title: "工作台",
        keepAlive: true,
        menuKey: "dashboard"
      }
    },
    {
      key: "quickstart",
      title: "快速开始",
      icon: "quickstart", // 🎯 使用企业级图标
      type: "page", 
      path: "/quickstart",
      component: "@/views/common/QuickStart.vue",
      order: 2,
      visible: true,
      requiredRoles: ["user", "admin"],
      closable: true,
      meta: {
        title: "快速开始",
        keepAlive: false,
        menuKey: "quickstart"
      }
    }
  ],

  // 💼 业务管理区域 (核心业务功能)
  businessManagement: [
    {
      key: "project-management",
      title: "项目管理",
      icon: "project", // 🎯 使用企业级图标
      type: "folder",
      order: 1,
      visible: true,
      requiredRoles: ["admin", "manager"],
      children: [
        {
          key: "project-list",
          title: "项目列表",
          icon: "table", // 🎯 使用企业级图标
          type: "page",
          path: "/business/projects",
          component: "@/views/business/ProjectList.vue",
          order: 1,
          visible: true,
          requiredRoles: ["admin", "manager"],
          closable: true,
          meta: {
            title: "项目列表",
            keepAlive: true,
            menuKey: "project-list"
          }
        },
        {
          key: "project-create",
          title: "新建项目",
          icon: "add", // 🎯 使用企业级图标
          type: "page",
          path: "/business/projects/create",
          component: "@/views/business/ProjectCreate.vue",
          order: 2,
          visible: true,
          requiredRoles: ["admin", "manager"],
          closable: true,
          meta: {
            title: "新建项目",
            keepAlive: false,
            menuKey: "project-create"
          }
        }
      ]
    },
    {
      key: "order-management",
      title: "订单管理",
      icon: "order", // 🎯 使用企业级图标
      type: "page",
      path: "/business/orders",
      component: "@/views/business/OrderManagement.vue",
      order: 2,
      visible: true,
      requiredRoles: ["admin", "manager", "user"],
      closable: true,
      meta: {
        title: "订单管理",
        keepAlive: true,
        menuKey: "order-management"
      }
    },
    {
      key: "customer-management",
      title: "客户管理",
      icon: "customer", // 🎯 使用企业级图标
      type: "page",
      path: "/business/customers",
      component: "@/views/business/CustomerManagement.vue",
      order: 3,
      visible: true,
      requiredRoles: ["admin", "manager", "user"],
      closable: true,
      meta: {
        title: "客户管理",
        keepAlive: true,
        menuKey: "customer-management"
      }
    }
  ],

  // 📊 基础数据区域 (主数据管理)
  masterData: [
    {
      key: "user-management",
      title: "用户管理",
      icon: "users", // 🎯 使用企业级图标
      type: "folder",
      order: 1,
      visible: true,
      requiredRoles: ["admin"],
      children: [
        {
          key: "user-list",
          title: "用户列表",
          icon: "user", // 🎯 使用企业级图标
          type: "page",
          path: "/master/users",
          component: "@/views/user/UserManagement.vue",
          order: 1,
          visible: true,
          requiredRoles: ["admin"],
          closable: true,
          meta: {
            title: "用户列表",
            keepAlive: true,
            menuKey: "user-list"
          }
        },
        {
          key: "role-management",
          title: "角色管理",
          icon: "role", // 🎯 使用企业级图标
          type: "page",
          path: "/master/roles",
          component: "@/views/user/RoleManagement.vue",
          order: 2,
          visible: true,
          requiredRoles: ["admin"],
          closable: true,
          meta: {
            title: "角色管理",
            keepAlive: true,
            menuKey: "role-management"
          }
        },
        {
          key: "permission-management",
          title: "权限管理",
          icon: "permission", // 🎯 使用企业级图标
          type: "page",
          path: "/master/permissions",
          component: "@/views/user/PermissionManagement.vue",
          order: 3,
          visible: true,
          requiredRoles: ["admin"],
          closable: true,
          meta: {
            title: "权限管理",
            keepAlive: true,
            menuKey: "permission-management"
          }
        }
      ]
    },
    {
      key: "data-dictionary",
      title: "数据字典",
      icon: "database", // 🎯 使用企业级图标
      type: "page",
      path: "/master/dictionary",
      component: "@/views/master/DataDictionary.vue",
      order: 2,
      visible: true,
      requiredRoles: ["admin"],
      closable: true,
      meta: {
        title: "数据字典",
        keepAlive: true,
        menuKey: "data-dictionary"
      }
    }
  ],

  // 🏗️ 系统管理区域 (管理员功能)
  systemManagement: [
    {
      key: "system-config",
      title: "系统配置",
      icon: "settings", // 🎯 使用企业级图标
      type: "folder",
      order: 1,
      visible: true,
      requiredRoles: ["admin"],
      children: [
        {
          key: "system-settings",
          title: "系统设置",
          icon: "config", // 🎯 使用企业级图标
          type: "page",
          path: "/system/settings",
          component: "@/views/system/SystemSettings.vue",
          order: 1,
          visible: true,
          requiredRoles: ["admin"],
          closable: true,
          meta: {
            title: "系统设置",
            keepAlive: true,
            menuKey: "system-settings"
          }
        },
        {
          key: "audit-logs",
          title: "审计日志",
          icon: "logs", // 🎯 使用企业级图标
          type: "page",
          path: "/system/audit-logs",
          component: "@/views/system/AuditLogs.vue",
          order: 2,
          visible: true,
          requiredRoles: ["admin"],
          closable: true,
          meta: {
            title: "审计日志",
            keepAlive: true,
            menuKey: "audit-logs"
          }
        },
        {
          key: "system-monitor",
          title: "系统监控",
          icon: "monitor", // 🎯 使用企业级图标
          type: "page",
          path: "/system/monitor",
          component: "@/views/system/SystemMonitor.vue",
          order: 3,
          visible: true,
          requiredRoles: ["admin"],
          closable: true,
          meta: {
            title: "系统监控",
            keepAlive: true,
            menuKey: "system-monitor"
          }
        },
        {
          key: "security-dashboard",
          title: "安全中心",
          icon: "security", // 🎯 使用企业级图标
          type: "page",
          path: "/system/security",
          component: "@/views/system/SecurityDashboard.vue",
          order: 4,
          visible: true,
          requiredRoles: ["admin"],
          closable: true,
          meta: {
            title: "安全中心",
            keepAlive: true,
            menuKey: "security-dashboard"
          }
        }
      ]
    }
  ],

  // 📈 报表分析区域
  reports: [
    {
      key: "business-analytics",
      title: "业务分析",
      icon: "analytics", // 🎯 使用企业级图标
      type: "folder",
      order: 1,
      visible: true,
      requiredRoles: ["admin", "manager"],
      children: [
        {
          key: "sales-report",
          title: "销售报表",
          icon: "chart", // 🎯 使用企业级图标
          type: "page",
          path: "/reports/sales",
          component: "@/views/reports/SalesReport.vue",
          order: 1,
          visible: true,
          requiredRoles: ["admin", "manager"],
          closable: true,
          meta: {
            title: "销售报表",
            keepAlive: true,
            menuKey: "sales-report"
          }
        },
        {
          key: "user-statistics",
          title: "用户统计",
          icon: "users", // 🎯 使用企业级图标
          type: "page",
          path: "/reports/users",
          component: "@/views/reports/UserStatistics.vue",
          order: 2,
          visible: true,
          requiredRoles: ["admin", "manager"],
          closable: true,
          meta: {
            title: "用户统计",
            keepAlive: true,
            menuKey: "user-statistics"
          }
        }
      ]
    }
  ],

  // ⚙️ 工具箱区域 (开发和管理工具)
  toolbox: [
    {
      key: "lowcode-studio",
      title: "代码生成器",
      icon: "lowcode", // 🎯 使用企业级图标
      type: "folder",
      order: 1,
      visible: true,
      requiredRoles: ["admin"],
      children: [
        {
          key: "ultra-simple-studio",
          title: "极简代码生成",
          icon: "generator", // 🎯 使用企业级图标
          type: "page",
          path: "/lowcode/ultra-simple",
          component: "@smartabp/lowcode-designer",
          order: 1,
          visible: true,
          requiredRoles: ["admin"],
          closable: true,
          meta: {
            title: "极简代码生成",
            keepAlive: true,
            menuKey: "ultra-simple-studio"
          }
        },
        {
          key: "expert-studio",
          title: "专家模式",
          icon: "code", // 🎯 使用企业级图标
          type: "page",
          path: "/lowcode/expert",
          component: "@/views/lowcode/LowCodeStudioView.vue",
          order: 2,
          visible: true,
          requiredRoles: ["admin"],
          closable: true,
          meta: {
            title: "专家模式",
            keepAlive: true,
            menuKey: "expert-studio"
          }
        },
        {
          key: "template-manager",
          title: "模板管理",
          icon: "template", // 🎯 使用企业级图标
          type: "page",
          path: "/lowcode/templates",
          component: "@/views/lowcode/TemplateManager.vue",
          order: 3,
          visible: true,
          requiredRoles: ["admin"],
          closable: true,
          meta: {
            title: "模板管理",
            keepAlive: true,
            menuKey: "template-manager"
          }
        },
        {
          key: "api-management",
          title: "API管理",
          icon: "api", // 🎯 使用企业级图标
          type: "page",
          path: "/lowcode/api",
          component: "@/views/lowcode/ApiManagement.vue",
          order: 4,
          visible: true,
          requiredRoles: ["admin"],
          closable: true,
          meta: {
            title: "API管理",
            keepAlive: true,
            menuKey: "api-management"
          }
        }
      ]
    },
    {
      key: "icon-gallery",
      title: "图标库",
      icon: "home", // 🎯 使用企业级图标
      type: "page",
      path: "/tools/icons",
      component: "@/components/icons/IconGallery.vue",
      order: 2,
      visible: true,
      requiredRoles: ["admin"],
      closable: true,
      meta: {
        title: "企业级图标库",
        keepAlive: true,
        menuKey: "icon-gallery"
      }
    }
  ]
}

// 🔗 动态菜单注册器 (使用新图标系统)
export class EnterpriseMenuManager {
  private static instance: EnterpriseMenuManager
  
  static getInstance(): EnterpriseMenuManager {
    if (!this.instance) {
      this.instance = new EnterpriseMenuManager()
    }
    return this.instance
  }
  
  /**
   * 🚀 注册新生成的业务模块菜单
   */
  registerBusinessModule(config: {
    systemName: string
    moduleName: string
    displayName: string
    routePrefix: string
    parentCategory: 'business' | 'master-data' | 'reports'
    permissions?: string[]
  }): void {
    const menuItem: MenuItem = {
      key: `${config.systemName.toLowerCase()}-${config.moduleName.toLowerCase()}`,
      title: config.displayName,
      icon: this.getIconByCategory(config.parentCategory), // 🎯 使用企业级图标
      type: "page",
      path: config.routePrefix,
      component: `@/views${config.routePrefix}/Index.vue`,
      order: this.getNextOrder(config.parentCategory),
      visible: true,
      requiredRoles: ["admin", "user"],
      closable: true,
      meta: {
        title: config.displayName,
        keepAlive: true,
        menuKey: `${config.systemName.toLowerCase()}-${config.moduleName.toLowerCase()}`
      }
    }
    
    // 根据类别插入到对应菜单组
    switch (config.parentCategory) {
      case 'business':
        enterpriseMenus.businessManagement.push(menuItem)
        break
      case 'master-data':
        enterpriseMenus.masterData.push(menuItem)
        break
      case 'reports':
        enterpriseMenus.reports.push(menuItem)
        break
    }
    
    console.log(`🔗 已注册企业级菜单: ${config.displayName}`)
  }
  
  private getIconByCategory(category: string): string {
    // 🎯 使用新的企业级图标系统
    const iconMap: Record<string, string> = {
      'business': 'business',
      'master-data': 'database',
      'reports': 'chart'
    }
    return iconMap[category] || 'folder'
  }
  
  private getNextOrder(category: string): number {
    const menus = enterpriseMenus[category as keyof EnterpriseMenuStructure] as MenuItem[]
    return menus.length + 1
  }
}

// 🏢 企业级菜单统一配置 (扁平化供路由使用)
export const enterpriseMenuConfig: MenuConfig = {
  defaultPath: "/dashboard",
  loginPath: "/login", 
  forbiddenPath: "/403",
  
  menus: [
    // 🏠 主工作台
    ...enterpriseMenus.workspace,
    
    // 📋 分组分隔符
    {
      key: "divider-business",
      title: "业务管理",
      type: "divider",
      order: 100,
      visible: true,
      requiredRoles: [],
      icon: "business" // 🎯 使用企业级图标
    },
    
    // 💼 业务管理菜单 (动态生成)
    ...enterpriseMenus.businessManagement,
    
    // 📋 分组分隔符
    {
      key: "divider-master",
      title: "基础数据",
      type: "divider", 
      order: 200,
      visible: true,
      requiredRoles: [],
      icon: "database" // 🎯 使用企业级图标
    },
    
    // 📊 基础数据菜单 (动态生成)
    ...enterpriseMenus.masterData,
    
    // 📋 分组分隔符
    {
      key: "divider-reports",
      title: "报表分析",
      type: "divider",
      order: 300, 
      visible: true,
      requiredRoles: [],
      icon: "chart" // 🎯 使用企业级图标
    },
    
    // 📈 报表分析菜单 (动态生成)
    ...enterpriseMenus.reports,
    
    // 📋 分组分隔符
    {
      key: "divider-system",
      title: "系统管理",
      type: "divider",
      order: 400,
      visible: true,
      requiredRoles: ["admin"],
      icon: "settings" // 🎯 使用企业级图标
    },
    
    // 🏗️ 系统管理菜单
    ...enterpriseMenus.systemManagement,
    
    // 📋 分组分隔符
    {
      key: "divider-tools",
      title: "开发工具",
      type: "divider",
      order: 500,
      visible: true,
      requiredRoles: ["admin"],
      icon: "code" // 🎯 使用企业级图标
    },
    
    // ⚙️ 工具箱菜单
    ...enterpriseMenus.toolbox
  ]
}

// 🎯 菜单图标配置 (企业级图标映射)
export const MENU_ICON_CONFIG = {
  // 🏠 工作台图标
  workspace: {
    dashboard: "dashboard",
    quickstart: "quickstart",
    overview: "overview"
  },
  
  // 💼 业务管理图标
  business: {
    project: "project",
    order: "order",
    customer: "customer",
    contract: "contract",
    invoice: "invoice"
  },
  
  // 📊 数据管理图标
  data: {
    users: "users",
    user: "user",
    role: "role",
    permission: "permission",
    database: "database",
    table: "table"
  },
  
  // ⚙️ 系统管理图标
  system: {
    settings: "settings",
    config: "config",
    logs: "logs",
    monitor: "monitor",
    security: "security",
    backup: "backup"
  },
  
  // 📈 报表分析图标
  reports: {
    chart: "chart",
    analytics: "analytics",
    report: "report"
  },
  
  // 🛠️ 开发工具图标
  tools: {
    lowcode: "lowcode",
    code: "code",
    generator: "generator",
    template: "template",
    api: "api"
  },
  
  // 📋 操作动作图标
  actions: {
    add: "add",
    edit: "edit",
    delete: "delete",
    search: "search",
    filter: "filter",
    refresh: "refresh",
    save: "save",
    cancel: "cancel",
    confirm: "confirm"
  },
  
  // 📁 导航控制图标
  navigation: {
    menu: "menu",
    close: "close",
    expand: "expand",
    collapse: "collapse",
    next: "next",
    prev: "prev"
  },
  
  // 🔔 状态提示图标
  status: {
    success: "success",
    warning: "warning",
    error: "error",
    info: "info",
    loading: "loading"
  },
  
  // 📱 通用图标
  common: {
    home: "home",
    folder: "folder",
    file: "file",
    link: "link",
    calendar: "calendar",
    clock: "clock",
    bell: "bell",
    email: "email",
    phone: "phone",
    location: "location"
  }
}

// 🎯 菜单使用说明
/*
企业级菜单结构说明 (使用新图标系统):

🏠 主工作台 (order: 1-99)
├── 工作台概览 - dashboard 图标
└── 快速开始 - quickstart 图标

💼 业务管理 (order: 100-199) 
├── 项目管理 - project 图标
├── 订单管理 - order 图标
└── 客户管理 - customer 图标

📊 基础数据 (order: 200-299)
├── 用户管理 - users 图标
├── 角色管理 - role 图标
└── 权限管理 - permission 图标

📈 报表分析 (order: 300-399)
├── 业务分析 - analytics 图标
└── 销售报表 - chart 图标

🏗️ 系统管理 (order: 400-499, 管理员专用)
├── 系统配置 - settings 图标
├── 审计日志 - logs 图标
├── 系统监控 - monitor 图标
└── 安全中心 - security 图标

⚙️ 开发工具 (order: 500-599, 管理员专用)
├── 极简代码生成 - generator 图标
├── 专家模式 - code 图标
├── 模板管理 - template 图标
├── API管理 - api 图标
└── 图标库 - home 图标

🎯 图标使用规范:
- 所有图标使用企业级图标系统
- 图标名称统一使用英文小写
- 支持动画和主题切换
- 遵循无障碍设计标准
- 自动适配暗色主题

这样的图标系统专业、统一、美观，完全符合企业级应用标准！
*/
