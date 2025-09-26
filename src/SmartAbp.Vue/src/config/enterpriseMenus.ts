/**
 * 🏢 SmartAbp 企业级菜单系统
 * 🎯 低代码引擎核心功能 - 专注基础实现
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

// 🎯 企业级菜单配置
export const enterpriseMenus: EnterpriseMenuStructure = {
  // 🏠 主工作台区域
  workspace: [
    {
      key: "dashboard",
      title: "工作台概览",
      icon: "fas fa-tachometer-alt",
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
      icon: "fas fa-rocket",
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
    // 🏗️ 动态生成的业务菜单将插入到这里
    // 例如: 项目管理、订单管理、客户管理等
  ],

  // 📊 基础数据区域 (主数据管理)
  masterData: [
    // 🗃️ 动态生成的主数据菜单将插入到这里
    // 例如: 用户管理、角色管理、权限管理等
  ],

  // 🏗️ 系统管理区域 (管理员功能)
  systemManagement: [
    {
      key: "system-config",
      title: "系统配置",
      icon: "fas fa-cogs",
      type: "folder",
      order: 1,
      visible: true,
      requiredRoles: ["admin"],
      children: [
        {
          key: "system-settings",
          title: "系统设置",
          icon: "fas fa-sliders-h",
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
          icon: "fas fa-history", 
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
        }
      ]
    }
  ],

  // 📈 报表分析区域
  reports: [
    // 📊 动态生成的报表菜单将插入到这里
  ],

  // ⚙️ 工具箱区域 (开发和管理工具)
  toolbox: [
    {
      key: "lowcode-studio",
      title: "代码生成器",
      icon: "fas fa-code",
      type: "folder",
      order: 1,
      visible: true,
      requiredRoles: ["admin"],
      children: [
        {
          key: "ultra-simple-studio",
          title: "极简代码生成",
          icon: "fas fa-magic",
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
          icon: "fas fa-cog",
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
        }
      ]
    }
  ]
}

// 🔗 动态菜单注册器 (支持代码生成后自动添加菜单)
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
      icon: this.getIconByCategory(config.parentCategory),
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
    const iconMap: Record<string, string> = {
      'business': 'fas fa-briefcase',
      'master-data': 'fas fa-database',
      'reports': 'fas fa-chart-bar'
    }
    return iconMap[category] || 'fas fa-circle'
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
      icon: "fas fa-briefcase"
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
      icon: "fas fa-database"
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
      icon: "fas fa-chart-bar"
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
      icon: "fas fa-cogs"
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
      icon: "fas fa-toolbox"
    },
    
    // ⚙️ 工具箱菜单
    ...enterpriseMenus.toolbox
  ]
}

// 🎯 菜单使用说明
/*
企业级菜单结构说明:

🏠 主工作台 (order: 1-99)
├── 工作台概览 - 系统总览和快捷操作
└── 快速开始 - 新用户引导

💼 业务管理 (order: 100-199) 
├── [动态生成的业务模块菜单]
├── 项目管理、订单管理、客户管理等
└── 根据代码生成自动添加

📊 基础数据 (order: 200-299)
├── [动态生成的主数据菜单] 
├── 用户管理、角色管理、权限管理等
└── 系统基础配置数据

📈 报表分析 (order: 300-399)
├── [动态生成的报表菜单]
├── 业务统计、数据分析、图表展示等
└── 商业智能相关功能

🏗️ 系统管理 (order: 400-499, 管理员专用)
├── 系统配置 - 系统参数设置
├── 审计日志 - 操作日志查看
└── 权限管理 - 系统权限配置

⚙️ 开发工具 (order: 500-599, 管理员专用)
├── 极简代码生成 - 新的UltraSimpleStudio
├── 专家模式 - 完整的低代码Studio
└── 代码生成历史 - 生成记录管理

这样的结构清晰、有层次，符合企业级应用的标准！
*/
