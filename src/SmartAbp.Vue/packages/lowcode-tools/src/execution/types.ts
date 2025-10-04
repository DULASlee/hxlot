/**
 * AI编程铁律执行引擎 v7.0 - 核心类型定义
 * 
 * @file types.ts
 * @description 执行引擎的核心类型定义，包括检查点、恢复策略、性能指标等
 * @author 世界顶级低代码引擎架构师
 * @date 2025-10-04
 * @version 1.0.0
 */

/**
 * 执行阶段枚举
 */
export enum ExecutionStage {
  STAGE0_INDEPENDENT_JUDGMENT = 'stage0_independent_judgment',
  STAGE1_TRIGGER_DETECTION = 'stage1_trigger_detection',
  STAGE2_PRE_LEARNING = 'stage2_pre_learning',
  STAGE3_INCREMENTAL_CODING = 'stage3_incremental_coding',
  STAGE4_QUALITY_GATES = 'stage4_quality_gates',
  STAGE5_GIT_SYNC = 'stage5_git_sync',
  STAGE6_AUTO_CONTINUE = 'stage6_auto_continue'
}

/**
 * 检查点状态枚举
 */
export enum CheckpointStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

/**
 * 错误严重程度枚举
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * 错误详情
 */
export interface ErrorDetails {
  type: string                      // 错误类型
  code: string                      // 错误代码
  message: string                   // 错误信息
  stack?: string                    // 堆栈信息
  recoverable: boolean              // 是否可恢复
  severity: ErrorSeverity           // 严重程度
  timestamp: Date                   // 发生时间
  context?: Record<string, any>     // 错误上下文
}

/**
 * 执行上下文
 */
export interface ExecutionContext {
  completedSteps: string[]          // 已完成步骤
  currentStep?: string              // 当前步骤
  failedStep?: string               // 失败步骤
  errorDetails?: ErrorDetails       // 错误详情
  variables?: Record<string, any>   // 上下文变量
}

/**
 * 代码指标
 */
export interface CodeMetrics {
  linesAdded: number                // 新增代码行数
  linesDeleted: number              // 删除代码行数
  linesModified: number             // 修改代码行数
  filesCreated: number              // 创建文件数
  filesModified: number             // 修改文件数
  filesDeleted: number              // 删除文件数
  totalLines: number                // 总代码行数
}

/**
 * 工作成果
 */
export interface ExecutionArtifacts {
  modifiedFiles: string[]           // 修改的文件列表
  generatedCode: number             // 生成代码行数
  qualityScore?: number             // 质量评分
  metrics?: CodeMetrics             // 代码指标
  timestamp: Date                   // 生成时间
}

/**
 * 恢复策略
 */
export interface RecoveryStrategy {
  rollbackPoint?: string            // 回滚点ID
  retryable: boolean                // 是否可重试
  autoFixAvailable: boolean         // 是否可自动修复
  maxRetries?: number               // 最大重试次数
  retryDelay?: number               // 重试延迟（ms）
}

/**
 * 执行检查点
 * 
 * @description 执行引擎的核心数据结构，记录执行状态和上下文，支持失败恢复
 */
export interface ExecutionCheckpoint {
  // 基本信息
  id: string                        // 检查点ID（UUID）
  stage: ExecutionStage             // 执行阶段
  timestamp: Date                   // 创建时间
  status: CheckpointStatus          // 状态
  
  // 执行上下文
  context: ExecutionContext         // 执行上下文
  
  // 工作成果
  artifacts: ExecutionArtifacts     // 工作成果
  
  // 恢复策略
  recovery: RecoveryStrategy        // 恢复策略
  
  // 元数据
  metadata?: {
    version: string                 // 引擎版本
    mode?: string                   // 执行模式
    userId?: string                 // 用户ID
    sessionId?: string              // 会话ID
    [key: string]: any              // 其他元数据
  }
}

/**
 * 检查点过滤器
 */
export interface CheckpointFilter {
  stage?: ExecutionStage            // 按阶段过滤
  status?: CheckpointStatus         // 按状态过滤
  startDate?: Date                  // 开始日期
  endDate?: Date                    // 结束日期
  limit?: number                    // 限制数量
  offset?: number                   // 偏移量
}

/**
 * 检查点查询结果
 */
export interface CheckpointQueryResult {
  checkpoints: ExecutionCheckpoint[]  // 检查点列表
  total: number                       // 总数
  hasMore: boolean                    // 是否有更多
}

/**
 * 检查点统计
 */
export interface CheckpointStatistics {
  total: number                       // 总数
  byStatus: Record<CheckpointStatus, number>  // 按状态统计
  byStage: Record<ExecutionStage, number>     // 按阶段统计
  oldestTimestamp?: Date              // 最早时间
  latestTimestamp?: Date              // 最新时间
}

/**
 * 恢复结果
 */
export interface RecoveryResult {
  success: boolean                    // 是否成功
  checkpoint: ExecutionCheckpoint     // 恢复的检查点
  message: string                     // 结果消息
  restoredContext: ExecutionContext   // 恢复的上下文
  error?: Error                       // 错误信息
}

