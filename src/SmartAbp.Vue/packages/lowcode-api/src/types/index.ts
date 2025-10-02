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
} from '@smartabp/lowcode-core'

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

// ============================================================================
// 后端DTO类型映射（与C# Dtos.cs保持一致）
// ============================================================================

/**
 * 模块元数据DTO（对应后端ModuleMetadataDto）
 */
export interface ModuleMetadataDto {
  id?: string
  systemName: string // e.g., 'SmartConstruction', 'MES'
  name: string // ModuleName, e.g., 'ProjectManagement', 'Device'
  displayName: string
  description?: string
  version?: string
  architecturePattern?: 'Crud' | 'DDD' | 'CQRS'
  namespace?: string
  author?: string
  databaseInfo: {
    connectionStringName?: string
    schema?: string
    provider?: 'SqlServer' | 'PostgreSql' | 'MySql' | 'Oracle'
  }
  featureManagement?: {
    isEnabled: boolean
    defaultPolicy?: string
  }
  frontend?: {
    parentId?: string
    routePrefix?: string
  }
  generateMobilePages?: boolean
  dependencies?: string[]
  entities?: any[]
  menuConfig?: any[]
  permissionConfig?: any
}

/**
 * 生成结果DTO（对应后端GeneratedModuleDto）
 */
export interface GeneratedModuleDto {
  moduleName: string
  generatedFiles: string[]
  generationReport: string
}

// 兼容旧版接口
export interface GenerationResult {
  success: boolean
  generatedFiles: Array<{ path: string; content?: string }>
  statistics: {
    totalFiles: number
    totalLines: number
    generationTime: number
  }
  errors: string[]
  report?: string
  generatedAt?: string
}

export interface ModuleGenerationConfig extends CodeGenerationConfig {}
export interface Template {
  id: string
  name: string
  description?: string
  category?: string
  features?: string[]
}

// 已在后面有完整定义，删除此重复定义

// ============================================================================
// 后端API额外类型定义（从C#后端映射）
// ============================================================================

/**
 * 验证报告
 */
export interface ValidationReport {
  isValid: boolean
  errors: Array<{ field: string; message: string }>
  warnings: Array<{ field: string; message: string }>
}

/**
 * 模拟运行结果
 */
export interface DryRunResult {
  success: boolean
  files: Array<{ path: string; size: number; preview: string }>
  statistics: {
    totalFiles: number
    totalLines: number
    estimatedTime: number
  }
}

/**
 * 数据库反查请求
 */
export interface DatabaseIntrospectionRequest {
  connectionString: string
  schema?: string
  tableName?: string
}

/**
 * 数据库Schema
 */
export interface DatabaseSchema {
  tables: Array<{
    name: string
    schema: string
    columns: Array<{
      name: string
      type: string
      nullable: boolean
      isPrimaryKey: boolean
    }>
  }>
}

/**
 * 菜单项DTO
 */
export interface MenuItemDto {
  id: string
  name: string
  displayName: string
  icon?: string
  url?: string
  parentId?: string
  order: number
  children?: MenuItemDto[]
}

/**
 * Schema版本清单
 */
export interface SchemaVersionManifest {
  version: string
  supportedVersions: string[]
  deprecatedVersions: string[]
}

/**
 * 实体UI配置
 */
export interface EntityUIConfig {
  displayName: string
  fields: Array<{
    name: string
    displayName: string
    editable: boolean
    visible: boolean
    required: boolean
    controlType: 'input' | 'select' | 'date' | 'number' | 'textarea'
  }>
}

/**
 * 代码生成器API扩展接口
 * 包含所有后端API端点
 */
export interface CodeGeneratorApi {
  // 核心生成方法
  generateModule: (config: ModuleMetadataDto) => Promise<GenerationResult>
  generateFromUnified?: (schema: any) => Promise<GenerationResult>
  
  // 验证方法
  validateModule?: (config: ModuleMetadataDto) => Promise<ValidationReport>
  validateUnified?: (schema: any) => Promise<ValidationReport>
  
  // 模拟运行方法
  dryRun?: (config: ModuleMetadataDto) => Promise<DryRunResult>
  dryRunUnified?: (schema: any) => Promise<DryRunResult>
  
  // 模板管理
  getTemplates: () => Promise<Template[]>
  
  // UI配置
  getUiConfig: (moduleName: string, entityName: string) => Promise<EntityUIConfig>
  saveUiConfig?: (moduleName: string, entityName: string, config: EntityUIConfig) => Promise<void>
  
  // 数据库反查
  getConnectionStrings?: () => Promise<string[]>
  introspectDatabase?: (request: DatabaseIntrospectionRequest) => Promise<DatabaseSchema>
  
  // 菜单管理
  getMenuTree?: () => Promise<MenuItemDto[]>
  
  // Schema版本
  getSchemaVersionManifest?: () => Promise<SchemaVersionManifest>
}

// 🔥 真实API将从 http-client.ts 导入
// 这里不再提供mock实现，强制使用真实API
export { codeGeneratorApi } from '../http-client'
