// ============================================================================
// Phase 1D: 使用后端SSOT类型（api-client.ts）
// ============================================================================
// 前端元数据类型从 @smartabp/lowcode-shared/types (metadata.ts)
// API DTO类型从 @smartabp/lowcode-shared（后端SSOT统一类型系统）
// ============================================================================

// Phase 2B: 使用后端契约类型别名（31级AlphaGO最优解实施）
import type {
  EntityDefinitionDto as BackendEntityDefinition,
  ModuleDto as BackendModuleDefinition
} from '@smartabp/lowcode-shared'

// 前端工具类型（metadata.ts - 仅保留前端特定类型）
import type {
  EntityMetadata as FrontendEntityMetadata
} from '@smartabp/lowcode-shared/types'

// ============================================================================
// 类型别名（向后兼容 + 语义化）
// ============================================================================

/**
 * API响应统一类型
 * Phase 1D: 简化定义，api-client.ts中有完整的ApiResponse类型
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

/** 查询参数类型 */
export type QueryParams = Record<string, unknown>

/**
 * 实体元数据类型（前端元数据建模）
 * 注意：这与EntityDefinitionDto（API DTO）不同
 */
export type EntityMetadata = FrontendEntityMetadata

/** 页面元数据类型（TODO: 待定义PageMetadata统一Schema） */
export type PageMetadata = any

/**
 * 模块元数据类型（Phase 2B: 使用后端SSOT）
 * 注意：现在直接使用后端ModuleDto，确保前后端类型100%一致
 */
export type ModuleMetadata = BackendModuleDefinition

/** 模块元数据DTO类型（向后兼容） */
export type ModuleMetadataDto = BackendModuleDefinition

// ============================================================================
// 代码生成相关类型
// ============================================================================

/** 代码生成配置 */
export interface CodeGenerationConfig {
  moduleMetadata: ModuleMetadata
  targetPath: string
  overwriteExisting: boolean
  generateTests: boolean
  generateDocs: boolean
  templateIds?: string[]
}

/** 代码生成结果 */
export interface CodeGenerationResult {
  success: boolean
  message: string
  generatedFiles: Array<{
    path: string
    content: string
    type: 'entity' | 'dto' | 'service' | 'controller' | 'vue' | 'test'
  }>
  errors?: string[]
  warnings?: string[]
  /** ✅ 修复: 添加statistics字段 */
  statistics?: {
    totalFiles: number
    totalLines: number
    generationTime: number
  }
}

export interface ColumnSchema {
  name: string
  dataType: string
  isNullable: boolean
  maxLength?: number
  isPrimaryKey: boolean
}

export interface ForeignKeySchema {
  column: string
  referencedSchema: string
  referencedTable: string
  referencedColumn: string
}

export interface TableSchema {
  name: string
  displayName?: string
  columns: ColumnSchema[]
  primaryKeys: string[]
  foreignKeys: ForeignKeySchema[]
}

export type DatabaseSchema = { tables: TableSchema[] }
export type DatabaseIntrospectionRequest = {
  provider: "SqlServer" | "PostgreSql" | "MySql" | "SQLite"
  connectionStringName: string
  schema?: string
}

/** 应用元数据类型（TODO: 待定义ApplicationMetadata统一Schema） */
export type ApplicationMetadata = any

/** UI组件元数据类型（TODO: 待定义UIComponentMetadata统一Schema） */
export type UIComponentMetadata = any

// Phase 2B: 向后兼容导出（使用后端SSOT类型）
// 注意：Unified*类型已废弃，请使用type-aliases.ts的类型
export type {
  BackendEntityDefinition as UnifiedEntityDefinition,
  BackendModuleDefinition as UnifiedModuleMetadata
}

// 兼容旧版接口
export interface GenerationResult extends CodeGenerationResult { }
export interface ModuleGenerationConfig extends CodeGenerationConfig { }
export interface Template {
  id: string
  name: string
  description?: string
  category?: string
  content: string
  language: 'csharp' | 'typescript' | 'vue' | 'sql'
  target: 'entity' | 'service' | 'controller' | 'vue-component' | 'store' | 'dto'
  version?: string
  author?: string
  features?: string[]
  requiredFields?: string[]
  optionalFields?: string[]
  supportedDatabases?: string[]
  metadata?: Record<string, any>
}

export interface CodeGeneratorApi {
  generateModule: (config: ModuleGenerationConfig | ModuleMetadata) => Promise<GenerationResult>
  getTemplates: () => Promise<Template[]>
  getUiConfig: (moduleName: string, entityName: string) => Promise<any>
  introspectDatabase: (req: any) => Promise<any>
  getGenerationStatus: (sessionId: string) => Promise<any>
  exportGeneratedCode: (sessionId: string) => Promise<Blob>
  validateModule: (metadata: ModuleMetadata) => Promise<{
    isValid: boolean
    errors: Array<{ field: string; message: string; severity: 'Error' | 'Warning' }>
    suggestions: Array<{ type: 'Naming' | 'Structure' | 'Performance'; message: string; autoFixAvailable: boolean }>
  }>
  registerModule: (metadata: ModuleMetadata) => Promise<ModuleMetadata>
  testDatabaseConnection: (connection: { provider: string; connectionString: string; schema?: string }) => Promise<{
    success: boolean
    message: string
    serverVersion?: string
    databaseName?: string
    schemaCount?: number
    tableCount?: number
    tables?: string[] // 🔥 关键修复：添加表名列表字段
  }>
}

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
// ABP错误响应类型
// ============================================================================
export type {
  AbpErrorData, AbpErrorResponse, AbpValidationError
} from './error'

export {
  isAbpErrorData, isAbpErrorResponse
} from './error'

// 注意：此文件仅包含类型和接口定义，不包含具体实现
