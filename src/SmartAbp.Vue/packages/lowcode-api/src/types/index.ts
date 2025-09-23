export interface GenerationResult {
  success: boolean
  [key: string]: any
}

export interface ModuleGenerationConfig {
  metadata: any
  options: any
  target: any
}

export interface Template {
  id: string
  name: string
  description?: string
  category?: string
  features?: string[]
}

export interface CodeGeneratorApi {
  generateModule: (config: ModuleGenerationConfig) => Promise<GenerationResult>
  getTemplates: () => Promise<Template[]>
  getUiConfig: (moduleName: string, entityName: string) => Promise<any>
}

export const codeGeneratorApi: CodeGeneratorApi = {
  async generateModule(_config) {
    return { success: true }
  },
  async getTemplates() {
    return [
      // 权限管理系统模板
      {
        id: "organization-management",
        name: "组织管理模块",
        description: "企业组织架构管理，支持公司-部门-岗位三级结构",
        category: "permission-system",
        features: ["CRUD操作", "树形结构", "拖拽排序", "权限控制"]
      },
      {
        id: "user-management",
        name: "用户管理模块",
        description: "系统用户管理，包含用户信息、角色分配、状态控制",
        category: "permission-system",
        features: ["用户列表", "角色分配", "密码重置", "状态管理"]
      },
      {
        id: "role-management",
        name: "角色管理模块",
        description: "系统角色定义和管理，支持角色层级和权限分配",
        category: "permission-system",
        features: ["角色CRUD", "权限分配", "角色继承", "批量操作"]
      },
      {
        id: "permission-management",
        name: "权限管理模块",
        description: "系统权限定义和管理，支持功能权限和数据权限",
        category: "permission-system",
        features: ["权限树", "权限矩阵", "资源管控", "动态权限"]
      },
      {
        id: "role-permission-management",
        name: "角色权限管理",
        description: "角色与权限的关联配置，支持批量授权和权限继承",
        category: "permission-system",
        features: ["权限分配", "批量授权", "权限继承", "权限审计"]
      },
      {
        id: "menu-management",
        name: "菜单管理模块",
        description: "系统菜单和界面权限管理，支持动态菜单生成",
        category: "permission-system",
        features: ["菜单树", "权限绑定", "图标管理", "路由配置"]
      },
      // 通用模板
      {
        id: "crud",
        name: "通用CRUD模块",
        description: "标准增删改查功能模块，支持列表、表单、详情页面",
        category: "general",
        features: ["数据列表", "表单编辑", "详情查看", "批量操作"]
      },
      {
        id: "form",
        name: "动态表单组件",
        description: "基于JSON配置的动态表单，支持复杂验证和联动",
        category: "component",
        features: ["动态渲染", "验证规则", "字段联动", "数据绑定"]
      },
      {
        id: "dashboard",
        name: "数据仪表盘",
        description: "数据可视化仪表盘，支持多种图表和实时更新",
        category: "visualization",
        features: ["图表组件", "实时数据", "响应式布局", "导出功能"]
      },
      {
        id: "report",
        name: "报表页面",
        description: "数据报表生成，支持图表展示和数据导出",
        category: "report",
        features: ["数据查询", "图表展示", "Excel导出", "PDF导出"]
      },
      {
        id: "workflow",
        name: "工作流模块",
        description: "业务工作流引擎，支持流程设计和审批管理",
        category: "workflow",
        features: ["流程设计", "任务分配", "审批链", "流程监控"]
      },
      {
        id: "audit-log",
        name: "审计日志模块",
        description: "系统操作审计日志，支持日志查询和分析",
        category: "security",
        features: ["操作记录", "日志查询", "统计分析", "导出功能"]
      },
      {
        id: "notification",
        name: "消息通知模块",
        description: "系统消息通知管理，支持多种通知方式",
        category: "communication",
        features: ["消息推送", "邮件通知", "短信通知", "站内消息"]
      },
      {
        id: "file-management",
        name: "文件管理模块",
        description: "文件上传下载管理，支持多种存储方式",
        category: "storage",
        features: ["文件上传", "预览功能", "权限控制", "批量操作"]
      },
      {
        id: "system-config",
        name: "系统配置模块",
        description: "系统参数配置管理，支持动态配置更新",
        category: "system",
        features: ["参数配置", "配置分组", "动态更新", "配置导入导出"]
      }
    ]
  },
  async getUiConfig(_moduleName, _entityName) {
    return {}
  },
}
