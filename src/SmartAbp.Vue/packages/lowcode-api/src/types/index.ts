// 导入统一元数据结构
import type {
  ApiResponse,
  QueryParams,
  EntityMetadata,
  PageMetadata,
  ModuleMetadata,
  ApplicationMetadata,
  UIComponentMetadata,
  CodeGenerationConfig,
  CodeGenerationResult
} from '../../../lowcode-core/src/types/unified-metadata'

// ============================================================================
// 前后端统一API接口定义
// ============================================================================

/**
 * 实体管理API
 */
export interface EntityApi {
  /** 获取实体列表 */
  getEntities: (params?: QueryParams) => Promise<ApiResponse<EntityMetadata[]>>
  /** 根据ID获取实体 */
  getEntityById: (id: string) => Promise<ApiResponse<EntityMetadata>>
  /** 创建实体 */
  createEntity: (entity: Partial<EntityMetadata>) => Promise<ApiResponse<EntityMetadata>>
  /** 更新实体 */
  updateEntity: (id: string, entity: Partial<EntityMetadata>) => Promise<ApiResponse<EntityMetadata>>
  /** 删除实体 */
  deleteEntity: (id: string) => Promise<ApiResponse<void>>
  /** 验证实体 */
  validateEntity: (entity: EntityMetadata) => Promise<ApiResponse<{ isValid: boolean; errors: string[] }>>
  /** 导出实体架构 */
  exportEntitySchema: (ids: string[]) => Promise<ApiResponse<string>>
  /** 导入实体架构 */
  importEntitySchema: (schema: string) => Promise<ApiResponse<EntityMetadata[]>>
}

/**
 * 页面管理API
 */
export interface PageApi {
  /** 获取页面列表 */
  getPages: (params?: QueryParams) => Promise<ApiResponse<PageMetadata[]>>
  /** 根据ID获取页面 */
  getPageById: (id: string) => Promise<ApiResponse<PageMetadata>>
  /** 创建页面 */
  createPage: (page: Partial<PageMetadata>) => Promise<ApiResponse<PageMetadata>>
  /** 更新页面 */
  updatePage: (id: string, page: Partial<PageMetadata>) => Promise<ApiResponse<PageMetadata>>
  /** 删除页面 */
  deletePage: (id: string) => Promise<ApiResponse<void>>
  /** 复制页面 */
  clonePage: (id: string, newName: string) => Promise<ApiResponse<PageMetadata>>
  /** 预览页面 */
  previewPage: (page: PageMetadata) => Promise<ApiResponse<{ html: string; css: string; js: string }>>
  /** 发布页面 */
  publishPage: (id: string) => Promise<ApiResponse<void>>
}

/**
 * UI组件管理API
 */
export interface UIComponentApi {
  /** 获取组件列表 */
  getComponents: (params?: QueryParams) => Promise<ApiResponse<UIComponentMetadata[]>>
  /** 根据ID获取组件 */
  getComponentById: (id: string) => Promise<ApiResponse<UIComponentMetadata>>
  /** 创建组件 */
  createComponent: (component: Partial<UIComponentMetadata>) => Promise<ApiResponse<UIComponentMetadata>>
  /** 更新组件 */
  updateComponent: (id: string, component: Partial<UIComponentMetadata>) => Promise<ApiResponse<UIComponentMetadata>>
  /** 删除组件 */
  deleteComponent: (id: string) => Promise<ApiResponse<void>>
  /** 获取组件预览 */
  getComponentPreview: (component: UIComponentMetadata) => Promise<ApiResponse<{ preview: string }>>
  /** 获取可用组件类型 */
  getComponentTypes: () => Promise<ApiResponse<Array<{ type: string; name: string; icon: string; category: string }>>>
}

/**
 * 模块管理API
 */
export interface ModuleApi {
  /** 获取模块列表 */
  getModules: (params?: QueryParams) => Promise<ApiResponse<ModuleMetadata[]>>
  /** 根据ID获取模块 */
  getModuleById: (id: string) => Promise<ApiResponse<ModuleMetadata>>
  /** 创建模块 */
  createModule: (module: Partial<ModuleMetadata>) => Promise<ApiResponse<ModuleMetadata>>
  /** 更新模块 */
  updateModule: (id: string, module: Partial<ModuleMetadata>) => Promise<ApiResponse<ModuleMetadata>>
  /** 删除模块 */
  deleteModule: (id: string) => Promise<ApiResponse<void>>
  /** 启用/禁用模块 */
  toggleModule: (id: string, enabled: boolean) => Promise<ApiResponse<void>>
  /** 导出模块 */
  exportModule: (id: string) => Promise<ApiResponse<{ content: string; filename: string }>>
  /** 导入模块 */
  importModule: (file: File) => Promise<ApiResponse<ModuleMetadata>>
}

/**
 * 代码生成API
 */
export interface CodeGenerationApi {
  /** 生成代码 */
  generateCode: (config: CodeGenerationConfig) => Promise<ApiResponse<CodeGenerationResult>>
  /** 获取可用模板 */
  getTemplates: (category?: string) => Promise<ApiResponse<Array<{
    id: string
    name: string
    description: string
    category: string
    features: string[]
    preview: string
  }>>>
  /** 预览生成的代码 */
  previewGeneration: (config: CodeGenerationConfig) => Promise<ApiResponse<{ preview: string }>>
  /** 获取生成历史 */
  getGenerationHistory: (params?: QueryParams) => Promise<ApiResponse<CodeGenerationResult[]>>
  /** 下载生成的代码 */
  downloadGeneratedCode: (resultId: string) => Promise<ApiResponse<{ downloadUrl: string }>>
}

/**
 * 应用管理API
 */
export interface ApplicationApi {
  /** 获取应用列表 */
  getApplications: (params?: QueryParams) => Promise<ApiResponse<ApplicationMetadata[]>>
  /** 根据ID获取应用 */
  getApplicationById: (id: string) => Promise<ApiResponse<ApplicationMetadata>>
  /** 创建应用 */
  createApplication: (app: Partial<ApplicationMetadata>) => Promise<ApiResponse<ApplicationMetadata>>
  /** 更新应用 */
  updateApplication: (id: string, app: Partial<ApplicationMetadata>) => Promise<ApiResponse<ApplicationMetadata>>
  /** 删除应用 */
  deleteApplication: (id: string) => Promise<ApiResponse<void>>
  /** 部署应用 */
  deployApplication: (id: string, environment: string) => Promise<ApiResponse<{ deploymentId: string; status: string }>>
  /** 获取应用统计 */
  getApplicationStats: (id: string) => Promise<ApiResponse<{
    entities: number
    pages: number
    components: number
    modules: number
  }>>
}

/**
 * MDI窗口管理API
 */
export interface MDIApi {
  /** 获取窗口列表 */
  getWindows: () => Promise<ApiResponse<any[]>>
  /** 创建窗口 */
  createWindow: (config: any) => Promise<ApiResponse<any>>
  /** 更新窗口 */
  updateWindow: (id: string, config: any) => Promise<ApiResponse<any>>
  /** 关闭窗口 */
  closeWindow: (id: string) => Promise<ApiResponse<void>>
  /** 最大化窗口 */
  maximizeWindow: (id: string) => Promise<ApiResponse<void>>
  /** 最小化窗口 */
  minimizeWindow: (id: string) => Promise<ApiResponse<void>>
  /** 恢复窗口 */
  restoreWindow: (id: string) => Promise<ApiResponse<void>>
}

/**
 * 统一的低代码引擎API
 */
export interface LowCodeEngineApi extends 
  EntityApi,
  PageApi,
  UIComponentApi,
  ModuleApi,
  CodeGenerationApi,
  ApplicationApi,
  MDIApi {
  
  /** 健康检查 */
  healthCheck: () => Promise<ApiResponse<{ status: "healthy" | "unhealthy"; timestamp: string }>>
  
  /** 获取引擎信息 */
  getEngineInfo: () => Promise<ApiResponse<{
    version: string
    capabilities: string[]
    supportedLanguages: string[]
    maxEntitiesPerModule: number
    maxComponentsPerPage: number
  }>>
  
  /** 全文搜索 */
  search: (query: string, type?: "entity" | "page" | "component" | "module") => Promise<ApiResponse<any[]>>
  
  /** 获取最近使用的项目 */
  getRecentProjects: () => Promise<ApiResponse<any[]>>
  
  /** 获取用户偏好设置 */
  getUserPreferences: () => Promise<ApiResponse<any>>
  
  /** 更新用户偏好设置 */
  updateUserPreferences: (preferences: any) => Promise<ApiResponse<void>>
}

// 兼容旧版接口
export interface GenerationResult extends CodeGenerationResult {}
export interface ModuleGenerationConfig extends CodeGenerationConfig {}
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
