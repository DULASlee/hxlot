/**
 * 模板管理系统 - 类型定义
 * @description 定义模板、模板变量、模板分类等核心类型
 * @version 1.0.0
 */

import type { EntityDefinitionDto } from './backend-contracts'
import { TemplateEngine, TemplateType } from './enums'

// 类型别名（向后兼容）
type UnifiedEntityDefinition = EntityDefinitionDto

// 重新导出枚举，方便使用
export { TemplateEngine, TemplateType }

/**
 * 模板变量类型
 */
export interface TemplateVariable {
  /** 变量名 */
  name: string
  /** 变量类型 */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  /** 描述 */
  description?: string
  /** 默认值 */
  defaultValue?: unknown
  /** 是否必填 */
  required?: boolean
  /** 示例值 */
  example?: unknown
  /** 验证规则 */
  validation?: {
    /** 最小值（number）或最小长度（string/array） */
    min?: number
    /** 最大值（number）或最大长度（string/array） */
    max?: number
    /** 正则表达式（string） */
    pattern?: string
    /** 自定义验证函数 */
    custom?: (value: unknown) => boolean | string
  }
}

/**
 * 模板分类
 */
export interface TemplateCategory {
  /** 分类ID */
  id: string
  /** 分类名称 */
  name: string
  /** 分类描述 */
  description?: string
  /** 父分类ID */
  parentId?: string
  /** 图标 */
  icon?: string
  /** 排序 */
  order?: number
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
}

/**
 * 模板定义
 */
export interface Template {
  /** 模板ID */
  id: string
  /** 模板名称 */
  name: string
  /** 模板显示名称 */
  displayName: string
  /** 模板描述 */
  description?: string
  /** 模板类型 */
  type: TemplateType
  /** 模板引擎 */
  engine: TemplateEngine
  /** 模板内容（Handlebars/Mustache语法） */
  content: string
  /** 模板变量 */
  variables: TemplateVariable[]
  /** 模板分类ID */
  categoryId?: string
  /** 模板标签 */
  tags?: string[]
  /** 是否公开（模板市场） */
  isPublic: boolean
  /** 是否内置模板 */
  isBuiltIn: boolean
  /** 作者 */
  author?: string
  /** 版本号 */
  version: string
  /** 使用次数 */
  usageCount: number
  /** 评分（1-5星） */
  rating?: number
  /** 评论数 */
  reviewCount?: number
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
  /** 最后使用时间 */
  lastUsedAt?: Date
}

/**
 * 模板版本
 */
export interface TemplateVersion {
  /** 版本ID */
  id: string
  /** 模板ID */
  templateId: string
  /** 版本号 */
  version: string
  /** 模板内容快照 */
  content: string
  /** 变更描述 */
  changeLog?: string
  /** 创建人 */
  createdBy: string
  /** 创建时间 */
  createdAt: Date
  /** 是否当前版本 */
  isCurrent: boolean
}

/**
 * 模板使用记录
 */
export interface TemplateUsage {
  /** 记录ID */
  id: string
  /** 模板ID */
  templateId: string
  /** 使用人 */
  userId: string
  /** 使用时间 */
  usedAt: Date
  /** 生成结果（成功/失败） */
  success: boolean
  /** 错误信息 */
  errorMessage?: string
  /** 生成耗时（毫秒） */
  duration?: number
  /** 输入数据（用于测试和回滚） */
  inputData?: Record<string, unknown>
}

/**
 * 模板测试用例
 */
export interface TemplateTestCase {
  /** 测试用例ID */
  id: string
  /** 模板ID */
  templateId: string
  /** 测试名称 */
  name: string
  /** 测试描述 */
  description?: string
  /** 输入数据 */
  inputData: Record<string, unknown>
  /** 期望输出 */
  expectedOutput?: string
  /** 实际输出 */
  actualOutput?: string
  /** 测试状态 */
  status: 'pending' | 'passed' | 'failed'
  /** 错误信息 */
  errorMessage?: string
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
}

/**
 * 模板编译选项
 */
export interface TemplateCompileOptions {
  /** 是否严格模式 */
  strict?: boolean
  /** 是否允许原型访问 */
  allowProtoAccess?: boolean
  /** 是否允许原型属性 */
  allowProtoProperties?: boolean
  /** 自定义Helper */
  helpers?: Record<string, (...args: unknown[]) => unknown>
  /** 自定义Partial */
  partials?: Record<string, string>
  /** 数据上下文 */
  data?: Record<string, unknown>
}

/**
 * 模板执行结果
 */
export interface TemplateExecutionResult {
  /** 是否成功 */
  success: boolean
  /** 生成的代码 */
  output?: string
  /** 错误信息 */
  error?: {
    /** 错误类型 */
    type: 'syntax' | 'runtime' | 'validation' | 'security'
    /** 错误消息 */
    message: string
    /** 错误行号 */
    line?: number
    /** 错误列号 */
    column?: number
    /** 错误堆栈 */
    stack?: string
  }
  /** 执行耗时（毫秒） */
  duration: number
  /** 警告信息 */
  warnings?: string[]
  /** 性能指标 */
  metrics?: {
    /** 编译时间 */
    compileTime: number
    /** 执行时间 */
    executeTime: number
    /** 内存占用（字节） */
    memoryUsage: number
  }
}

/**
 * 模板预览配置
 */
export interface TemplatePreviewConfig {
  /** 是否自动刷新 */
  autoRefresh: boolean
  /** 刷新延迟（毫秒） */
  refreshDelay: number
  /** 是否显示行号 */
  showLineNumbers: boolean
  /** 是否启用语法高亮 */
  enableSyntaxHighlight: boolean
  /** 主题 */
  theme: 'vs' | 'vs-dark' | 'hc-black'
}

/**
 * 模板市场筛选条件
 */
export interface TemplateMarketFilter {
  /** 关键词搜索 */
  keyword?: string
  /** 模板类型 */
  type?: TemplateType
  /** 分类ID */
  categoryId?: string
  /** 标签 */
  tags?: string[]
  /** 最低评分 */
  minRating?: number
  /** 排序方式 */
  sortBy?: 'rating' | 'usageCount' | 'createdAt' | 'updatedAt'
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
  /** 是否只看公开模板 */
  publicOnly?: boolean
  /** 是否只看内置模板 */
  builtInOnly?: boolean
}

/**
 * 模板导入导出格式
 */
export interface TemplateExportData {
  /** 模板信息 */
  template: Template
  /** 版本历史 */
  versions?: TemplateVersion[]
  /** 测试用例 */
  testCases?: TemplateTestCase[]
  /** 导出时间 */
  exportedAt: Date
  /** 导出人 */
  exportedBy: string
  /** 格式版本 */
  formatVersion: string
}

