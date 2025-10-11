/**
 * @smartabp/quality-guardian 核心类型定义
 */

/**
 * 违规级别
 */
export type ViolationLevel = 'P0' | 'P1' | 'P2' | 'WARNING'

/**
 * 检查模式
 */
export type CheckMode = 'quick' | 'full' | 'expert'

/**
 * 报告格式
 */
export type ReportFormat = 'console' | 'json' | 'html' | 'markdown'

/**
 * 违规记录
 */
export interface Violation {
  /** 规则ID */
  rule: string
  /** 违规级别 */
  level: ViolationLevel
  /** 文件路径（可选，全局性警告可不指定） */
  file?: string
  /** 行号 */
  line?: number
  /** 列号 */
  column?: number
  /** 错误消息 */
  message: string
  /** 代码片段 */
  snippet?: string
  /** 修复建议 */
  fix?: string
  /** 详细信息 */
  details?: string
  /** 违规数量（用于汇总统计） */
  count?: number
  /** 示例列表（展示前几个违规示例） */
  samples?: string[]
  /** 函数名（用于函数相关的违规） */
  functionName?: string
  /** 行数统计 */
  lineCount?: number
  /** 大小（KB） */
  sizeKB?: number
  /** 循环依赖路径 */
  cycle?: string[]
}

/**
 * 检查结果
 */
export interface CheckResult {
  /** 检查器名称 */
  checker: string
  /** 是否通过 */
  passed: boolean
  /** 耗时（毫秒） */
  duration: number
  /** 违规列表 */
  violations: Violation[]
  /** 统计信息 */
  stats?: Record<string, number>
}

/**
 * 质量阈值配置
 */
export interface QualityThresholds {
  /** 整体质量评分阈值（0-100） */
  overall?: number
  /** 架构合规阈值 */
  architecture?: number
  /** 类型安全阈值 */
  typescript?: number
  /** 安全性阈值 */
  security?: number
  /** 性能阈值 */
  performance?: number
  /** 代码复杂度阈值 */
  complexity?: number
}

/**
 * 质量检查配置
 */
export interface QualityConfig {
  /** 项目根目录 */
  projectRoot?: string
  /** 检查模式 */
  mode?: CheckMode
  /** 启用的检查器列表 */
  checkers?: string[]
  /** 质量阈值 */
  thresholds?: QualityThresholds
  /** 报告格式 */
  reportFormat?: ReportFormat
  /** 输出目录 */
  outputDir?: string
  /** 是否自动修复 */
  autoFix?: boolean
  /** 是否跳过Git同步 */
  skipGitSync?: boolean
  /** 详细输出 */
  verbose?: boolean
}

/**
 * 质量评分
 */
export interface QualityScore {
  /** 总分（0-100） */
  overall: number
  /** 各维度评分 */
  dimensions: {
    architecture: number
    typescript: number
    security: number
    performance: number
    codeSmell: number
    complexity: number
  }
}

/**
 * 质量报告
 */
export interface QualityReport {
  /** 生成时间 */
  timestamp: string
  /** 项目名称 */
  projectName: string
  /** 检查模式 */
  mode: CheckMode
  /** 是否通过质量门禁 */
  passed: boolean
  /** 质量评分 */
  score: QualityScore
  /** 各检查器结果 */
  results: CheckResult[]
  /** 总违规统计 */
  summary: {
    P0: number
    P1: number
    P2: number
    WARNING: number
    total: number
  }
  /** 总耗时（毫秒） */
  totalDuration: number
}

/**
 * 检查器接口
 */
export interface IChecker {
  /** 检查器名称 */
  name: string
  /** 执行检查 */
  check(): Promise<CheckResult>
}

