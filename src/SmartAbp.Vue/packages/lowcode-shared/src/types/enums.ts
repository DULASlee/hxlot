/**
 * 🔥 SmartAbp LowCode Engine - 统一枚举类型定义
 *
 * 集中管理所有枚举类型，提供类型安全和IntelliSense支持
 *
 * @version 1.0.0
 * @author SmartAbp架构团队
 * @date 2025-10-16
 */

// ============================================================================
// 数据库相关枚举
// ============================================================================

/**
 * 支持的数据库类型
 */
export enum DatabaseType {
    /** PostgreSQL数据库 */
    PostgreSQL = 'PostgreSQL',
    /** MySQL数据库 */
    MySQL = 'MySQL',
    /** SQL Server数据库 */
    SQLServer = 'SQLServer',
    /** SQLite数据库（开发/测试） */
    SQLite = 'SQLite',
    /** Oracle数据库（企业级） */
    Oracle = 'Oracle'
}

/**
 * 数据库索引类型
 */
export enum IndexType {
    /** 普通索引 */
    Normal = 'Normal',
    /** 唯一索引 */
    Unique = 'Unique',
    /** 全文索引 */
    FullText = 'FullText',
    /** 空间索引 */
    Spatial = 'Spatial',
    /** 聚簇索引 */
    Clustered = 'Clustered'
}

/**
 * 数据库约束类型
 */
export enum ConstraintType {
    /** 主键约束 */
    PrimaryKey = 'PrimaryKey',
    /** 外键约束 */
    ForeignKey = 'ForeignKey',
    /** 唯一约束 */
    Unique = 'Unique',
    /** 检查约束 */
    Check = 'Check',
    /** 默认值约束 */
    Default = 'Default'
}

// ============================================================================
// 实体关系枚举
// ============================================================================

/**
 * 实体关系类型
 */
export enum RelationType {
    /** 一对一关系 */
    OneToOne = 'OneToOne',
    /** 一对多关系 */
    OneToMany = 'OneToMany',
    /** 多对一关系 */
    ManyToOne = 'ManyToOne',
    /** 多对多关系 */
    ManyToMany = 'ManyToMany'
}

/**
 * 级联操作类型
 */
export enum CascadeAction {
    /** 无操作 */
    NoAction = 'NoAction',
    /** 级联删除 */
    Cascade = 'Cascade',
    /** 设置为NULL */
    SetNull = 'SetNull',
    /** 设置为默认值 */
    SetDefault = 'SetDefault',
    /** 限制（禁止删除） */
    Restrict = 'Restrict'
}

// ============================================================================
// UI相关枚举
// ============================================================================

/**
 * UI布局类型
 */
export enum LayoutType {
    /** 水平布局 */
    Horizontal = 'horizontal',
    /** 垂直布局 */
    Vertical = 'vertical',
    /** 行内布局 */
    Inline = 'inline'
}

/**
 * 表单控件类型
 */
export enum FormControlType {
    /** 文本输入框 */
    Text = 'text',
    /** 数字输入框 */
    Number = 'number',
    /** 文本域 */
    Textarea = 'textarea',
    /** 日期选择器 */
    Date = 'date',
    /** 日期时间选择器 */
    DateTime = 'datetime',
    /** 时间选择器 */
    Time = 'time',
    /** 下拉选择 */
    Select = 'select',
    /** 多选框 */
    Checkbox = 'checkbox',
    /** 单选框 */
    Radio = 'radio',
    /** 开关 */
    Switch = 'switch',
    /** 文件上传 */
    Upload = 'upload',
    /** 富文本编辑器 */
    RichText = 'richtext',
    /** 代码编辑器 */
    CodeEditor = 'codeeditor'
}

/**
 * 排序方向
 */
export enum SortDirection {
    /** 升序 */
    Ascending = 'asc',
    /** 降序 */
    Descending = 'desc'
}

/**
 * 页面大小选项
 */
export const PageSizeOptions = [10, 20, 50, 100, 200] as const
export type PageSize = typeof PageSizeOptions[number]

// ============================================================================
// 代码生成相关枚举
// ============================================================================

/**
 * 前端框架类型
 */
export enum FrontendFramework {
    /** Vue 3框架 */
    Vue3 = 'Vue3',
    /** React框架 */
    React = 'React',
    /** Angular框架 */
    Angular = 'Angular'
}

/**
 * UI组件库类型
 */
export enum UILibrary {
    /** Element Plus */
    ElementPlus = 'ElementPlus',
    /** Ant Design Vue */
    AntDesignVue = 'AntDesignVue',
    /** Naive UI */
    NaiveUI = 'NaiveUI',
    /** Vuetify */
    Vuetify = 'Vuetify'
}

/**
 * 代码生成模板类型
 */
/**
 * 模板类型枚举（Phase 3 扩展）
 */
export enum TemplateType {
    /** 实体模板 */
    Entity = 'Entity',
    /** 服务模板 */
    Service = 'Service',
    /** 控制器模板 */
    Controller = 'Controller',
    /** DTO模板 */
    DTO = 'DTO',
    /** Vue组件模板 */
    VueComponent = 'VueComponent',
    /** Pinia Store模板 */
    PiniaStore = 'PiniaStore',
    /** Router配置模板 */
    RouterConfig = 'RouterConfig',
    /** API Client模板 */
    ApiClient = 'ApiClient',
    /** 单元测试模板 */
    UnitTest = 'UnitTest',
    /** 集成测试模板 */
    IntegrationTest = 'IntegrationTest',
    /** 自定义模板 */
    Custom = 'Custom'
}

/**
 * 模板引擎类型（Phase 3 新增）
 */
export enum TemplateEngine {
    /** Handlebars（推荐）*/
    Handlebars = 'Handlebars',
    /** Mustache（兼容）*/
    Mustache = 'Mustache',
    /** EJS */
    EJS = 'EJS',
    /** 纯JavaScript */
    JavaScript = 'JavaScript'
}

// ============================================================================
// 验证规则枚举
// ============================================================================

/**
 * 验证规则严重程度
 */
export enum ValidationSeverity {
    /** 错误（阻止提交） */
    Error = 'Error',
    /** 警告（可提交） */
    Warning = 'Warning',
    /** 信息（仅提示） */
    Info = 'Info'
}

// ============================================================================
// 权限相关枚举
// ============================================================================

/**
 * 权限操作类型
 */
export enum PermissionAction {
    /** 查看 */
    View = 'View',
    /** 创建 */
    Create = 'Create',
    /** 编辑 */
    Edit = 'Edit',
    /** 删除 */
    Delete = 'Delete',
    /** 导出 */
    Export = 'Export',
    /** 导入 */
    Import = 'Import',
    /** 审批 */
    Approve = 'Approve',
    /** 自定义操作 */
    Custom = 'Custom'
}

// ============================================================================
// HTTP相关枚举
// ============================================================================

/**
 * HTTP方法
 */
export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH',
    HEAD = 'HEAD',
    OPTIONS = 'OPTIONS'
}

/**
 * HTTP状态码分类
 */
export enum HttpStatusCategory {
    /** 成功 (2xx) */
    Success = 'Success',
    /** 重定向 (3xx) */
    Redirection = 'Redirection',
    /** 客户端错误 (4xx) */
    ClientError = 'ClientError',
    /** 服务器错误 (5xx) */
    ServerError = 'ServerError'
}

// ============================================================================
// 微服务相关枚举
// ============================================================================

/**
 * 微服务类型
 */
export enum MicroserviceType {
    /** API网关 */
    Gateway = 'gateway',
    /** 业务服务 */
    Service = 'service',
    /** 认证服务 */
    Auth = 'auth',
    /** 文件服务 */
    File = 'file',
    /** 消息服务 */
    Message = 'message'
}

/**
 * 服务健康状态
 */
export enum HealthStatus {
    /** 健康 */
    Healthy = 'Healthy',
    /** 不健康 */
    Unhealthy = 'Unhealthy',
    /** 降级 */
    Degraded = 'Degraded',
    /** 未知 */
    Unknown = 'Unknown'
}

// ============================================================================
// 工作流相关枚举
// ============================================================================

/**
 * 工作流状态
 */
export enum WorkflowStatus {
    /** 草稿 */
    Draft = 'Draft',
    /** 运行中 */
    Running = 'Running',
    /** 已完成 */
    Completed = 'Completed',
    /** 已取消 */
    Cancelled = 'Cancelled',
    /** 失败 */
    Failed = 'Failed',
    /** 暂停 */
    Paused = 'Paused'
}

// ============================================================================
// 数据同步相关枚举
// ============================================================================

/**
 * 同步状态
 */
export enum SyncStatus {
    /** 未同步 */
    NotSynced = 'NotSynced',
    /** 同步中 */
    Syncing = 'Syncing',
    /** 已同步 */
    Synced = 'Synced',
    /** 同步失败 */
    Failed = 'Failed',
    /** 冲突 */
    Conflict = 'Conflict'
}

// ============================================================================
// 日志相关枚举
// ============================================================================

/**
 * 日志级别
 */
export enum LogLevel {
    /** 调试 */
    Debug = 'Debug',
    /** 信息 */
    Info = 'Info',
    /** 警告 */
    Warning = 'Warning',
    /** 错误 */
    Error = 'Error',
    /** 严重错误 */
    Fatal = 'Fatal'
}

// ============================================================================
// 辅助类型
// ============================================================================

/**
 * 将枚举转换为联合类型
 */
export type EnumValues<T extends Record<string, string | number>> = T[keyof T]

/**
 * 获取枚举的所有key
 */
export type EnumKeys<T extends Record<string, string | number>> = keyof T

/**
 * 枚举选项（用于UI选择器）
 */
export interface EnumOption<T = string> {
    /** 枚举值 */
    value: T
    /** 显示标签 */
    label: string
    /** 图标（可选） */
    icon?: string
    /** 颜色（可选） */
    color?: string
    /** 描述（可选） */
    description?: string
    /** 是否禁用 */
    disabled?: boolean
}

/**
 * 将枚举转换为选项数组
 * @param enumObj 枚举对象
 * @param labelMap 标签映射
 * @returns 选项数组
 */
export function enumToOptions<T extends Record<string, string>>(
    enumObj: T,
    labelMap?: Partial<Record<string, string>>
): EnumOption<string>[] {
    return Object.values(enumObj).map(value => ({
        value: value as string,
        label: (labelMap?.[value as string] ?? value) as string
    }))
}

/**
 * 检查值是否在枚举中
 * @param enumObj 枚举对象
 * @param value 要检查的值
 * @returns 是否在枚举中
 */
export function isValidEnumValue<T extends Record<string, string | number>>(
    enumObj: T,
    value: unknown
): value is T[keyof T] {
    return Object.values(enumObj).includes(value as T[keyof T])
}

