/**
 * 代码生成历史记录 - 类型定义
 * @description 定义代码生成历史、元数据快照、变更记录等核心类型
 * @version 1.0.0
 * @author AI首席架构师
 * @since Phase 3 - Task 3.2.1
 */

import type { EntityDefinitionDto } from './backend-contracts'

// 类型别名（向后兼容）
type UnifiedEntityDefinition = EntityDefinitionDto

/**
 * 代码生成类型
 */
export enum GenerationType {
  /** 实体类 */
  Entity = 'Entity',
  /** 服务类 */
  AppService = 'AppService',
  /** 控制器 */
  Controller = 'Controller',
  /** DTO */
  DTO = 'DTO',
  /** Vue组件 */
  VueComponent = 'VueComponent',
  /** Pinia Store */
  PiniaStore = 'PiniaStore',
  /** Router配置 */
  RouterConfig = 'RouterConfig',
  /** API Client */
  ApiClient = 'ApiClient',
  /** 完整模块（Full Stack） */
  FullModule = 'FullModule'
}

/**
 * 代码生成状态
 */
export enum GenerationStatus {
  /** 成功 */
  Success = 'Success',
  /** 失败 */
  Failed = 'Failed',
  /** 警告（有非致命问题） */
  Warning = 'Warning',
  /** 运行中 */
  Running = 'Running',
  /** 已回滚 */
  Reverted = 'Reverted'
}

/**
 * 代码文件记录
 */
export interface GeneratedFileRecord {
  /** 文件ID */
  id: string
  /** 文件路径（相对于项目根目录） */
  filePath: string
  /** 文件类型 */
  fileType: 'cs' | 'ts' | 'vue' | 'json' | 'other'
  /** 文件内容 */
  content: string
  /** 文件大小（字节） */
  size: number
  /** 代码行数 */
  lineCount: number
  /** 生成使用的模板ID */
  templateId?: string
  /** 生成时间 */
  generatedAt: Date
}

/**
 * 元数据快照
 */
export interface MetadataSnapshot {
  /** 快照ID */
  id: string
  /** 快照时间 */
  timestamp: Date
  /** 实体定义（完整快照） */
  entityDefinition: UnifiedEntityDefinition
  /** 模块配置 */
  moduleConfig?: Record<string, unknown>
  /** 生成配置 */
  generationConfig?: Record<string, unknown>
  /** 快照描述 */
  description?: string
}

/**
 * 代码变更记录
 */
export interface CodeChangeRecord {
  /** 变更ID */
  id: string
  /** 文件路径 */
  filePath: string
  /** 变更类型 */
  changeType: 'create' | 'update' | 'delete'
  /** 变更前内容 */
  before?: string
  /** 变更后内容 */
  after?: string
  /** 变更行数 */
  linesAdded: number
  /** 删除行数 */
  linesDeleted: number
  /** 变更摘要 */
  summary?: string
}

/**
 * 质量指标
 */
export interface QualityMetrics {
  /** TypeScript错误数 */
  typescriptErrors: number
  /** ESLint错误数 */
  eslintErrors: number
  /** ESLint警告数 */
  eslintWarnings: number
  /** 代码复杂度评分（0-100） */
  complexityScore: number
  /** 代码重复率（0-100） */
  duplicationRate: number
  /** 测试覆盖率（0-100） */
  testCoverage: number
  /** 性能评分（0-100） */
  performanceScore: number
  /** 总体质量评分（0-100） */
  overallScore: number
}

/**
 * 代码生成历史记录
 */
export interface GenerationHistory {
  /** 历史记录ID */
  id: string
  /** 生成类型 */
  generationType: GenerationType
  /** 生成状态 */
  status: GenerationStatus
  /** 实体ID（关联到UnifiedEntityDefinition） */
  entityId: string
  /** 实体名称 */
  entityName: string
  /** 模块名称 */
  moduleName?: string
  /** 生成文件列表 */
  generatedFiles: GeneratedFileRecord[]
  /** 元数据快照 */
  metadataSnapshot: MetadataSnapshot
  /** 代码变更记录 */
  codeChanges: CodeChangeRecord[]
  /** 质量指标 */
  qualityMetrics?: QualityMetrics
  /** 错误信息 */
  errorMessage?: string
  /** 警告信息 */
  warnings?: string[]
  /** 生成耗时（毫秒） */
  duration: number
  /** 生成人 */
  generatedBy: string
  /** 生成时间 */
  generatedAt: Date
  /** 是否已回滚 */
  isReverted: boolean
  /** 回滚时间 */
  revertedAt?: Date
  /** 回滚人 */
  revertedBy?: string
  /** 备注 */
  notes?: string
  /** 标签 */
  tags?: string[]
}

/**
 * 历史记录筛选器
 */
export interface GenerationHistoryFilter {
  /** 关键词搜索 */
  keyword?: string
  /** 生成类型 */
  generationType?: GenerationType
  /** 生成状态 */
  status?: GenerationStatus
  /** 实体ID */
  entityId?: string
  /** 模块名称 */
  moduleName?: string
  /** 生成人 */
  generatedBy?: string
  /** 开始时间 */
  startDate?: Date
  /** 结束时间 */
  endDate?: Date
  /** 是否已回滚 */
  isReverted?: boolean
  /** 最小质量评分 */
  minQualityScore?: number
  /** 标签 */
  tags?: string[]
  /** 排序字段 */
  sortBy?: 'generatedAt' | 'duration' | 'overallScore'
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
  /** 页码 */
  page?: number
  /** 每页数量 */
  pageSize?: number
}

/**
 * 历史记录统计
 */
export interface GenerationHistoryStatistics {
  /** 总生成次数 */
  totalGenerations: number
  /** 成功次数 */
  successCount: number
  /** 失败次数 */
  failedCount: number
  /** 警告次数 */
  warningCount: number
  /** 成功率（0-100） */
  successRate: number
  /** 平均耗时（毫秒） */
  averageDuration: number
  /** 平均质量评分 */
  averageQualityScore: number
  /** 总代码行数 */
  totalLinesGenerated: number
  /** 按类型统计 */
  byType: Record<GenerationType, number>
  /** 按日期统计 */
  byDate: Array<{ date: string; count: number }>
  /** 按模块统计 */
  byModule: Record<string, number>
}

/**
 * 历史记录对比结果
 */
export interface HistoryComparisonResult {
  /** 对比ID */
  id: string
  /** 左侧历史记录 */
  leftHistory: GenerationHistory
  /** 右侧历史记录 */
  rightHistory: GenerationHistory
  /** 文件变更列表 */
  fileChanges: Array<{
    filePath: string
    changeType: 'created' | 'modified' | 'deleted' | 'unchanged'
    leftContent?: string
    rightContent?: string
    diff?: string
  }>
  /** 质量指标对比 */
  qualityComparison?: {
    left: QualityMetrics
    right: QualityMetrics
    improvements: string[]
    regressions: string[]
  }
  /** 对比时间 */
  comparedAt: Date
}

/**
 * 回滚选项
 */
export interface RevertOptions {
  /** 是否创建备份 */
  createBackup?: boolean
  /** 备份描述 */
  backupDescription?: string
  /** 是否强制回滚（忽略冲突） */
  force?: boolean
  /** 回滚后是否重新编译 */
  recompile?: boolean
  /** 回滚原因 */
  reason?: string
}

/**
 * 回滚结果
 */
export interface RevertResult {
  /** 是否成功 */
  success: boolean
  /** 回滚的历史记录 */
  history: GenerationHistory
  /** 受影响的文件 */
  affectedFiles: string[]
  /** 备份ID（如果创建） */
  backupId?: string
  /** 错误信息 */
  errorMessage?: string
  /** 冲突文件 */
  conflictFiles?: string[]
  /** 回滚时间 */
  revertedAt: Date
}

