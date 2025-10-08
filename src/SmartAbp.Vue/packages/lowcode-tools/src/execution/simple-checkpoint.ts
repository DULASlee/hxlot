/**
 * AI编程铁律执行引擎 v7.0 - MVP极简断点续传
 * 
 * @file simple-checkpoint.ts
 * @description 极简的断点续传实现，只记录当前阶段，简单实用
 * @author 世界顶级低代码引擎架构师
 * @date 2025-10-04
 * @version 1.0.0-mvp
 */

import * as fs from 'fs'
import * as path from 'path'

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
 * 极简检查点 - MVP方案
 * 
 * 只保存当前执行阶段到文本文件，简单高效
 * 
 * @example
 * ```typescript
 * const checkpoint = new SimpleCheckpoint()
 * 
 * // 保存当前阶段
 * checkpoint.save(ExecutionStage.STAGE3_INCREMENTAL_CODING)
 * 
 * // 恢复上次阶段
 * const lastStage = checkpoint.restore()
 * if (lastStage) {
 *   console.log(`从${lastStage}继续执行...`)
 * }
 * 
 * // 清除检查点
 * checkpoint.clear()
 * ```
 */
export class SimpleCheckpoint {
  private readonly CHECKPOINT_DIR = '.ai-engine'
  private readonly CHECKPOINT_FILE = 'last-stage.txt'
  
  /**
   * 获取检查点文件路径
   */
  private getCheckpointPath(): string {
    return path.join(process.cwd(), this.CHECKPOINT_DIR, this.CHECKPOINT_FILE)
  }
  
  /**
   * 确保检查点目录存在
   */
  private ensureDir(): void {
    const dir = path.join(process.cwd(), this.CHECKPOINT_DIR)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }
  
  /**
   * 保存当前执行阶段
   * 
   * @param stage 执行阶段
   * 
   * @example
   * ```typescript
   * checkpoint.save(ExecutionStage.STAGE4_QUALITY_GATES)
   * console.log('✅ 已保存检查点')
   * ```
   */
  public save(stage: ExecutionStage | string): void {
    try {
      this.ensureDir()
      const filePath = this.getCheckpointPath()
      const timestamp = new Date().toISOString()
      const content = `${stage}\n${timestamp}`
      
      fs.writeFileSync(filePath, content, 'utf-8')
      console.log(`✅ 检查点已保存: ${stage}`)
    } catch (error) {
      console.warn('⚠️ 保存检查点失败:', error)
    }
  }
  
  /**
   * 恢复上次执行阶段
   * 
   * @returns 上次执行阶段，如果没有则返回null
   * 
   * @example
   * ```typescript
   * const lastStage = checkpoint.restore()
   * if (lastStage) {
   *   console.log(`🔄 从${lastStage}继续执行`)
   * } else {
   *   console.log('🆕 开始新的执行')
   * }
   * ```
   */
  public restore(): string | null {
    try {
      const filePath = this.getCheckpointPath()
      
      if (!fs.existsSync(filePath)) {
        return null
      }
      
      const content = fs.readFileSync(filePath, 'utf-8')
      const [stage, timestamp] = content.split('\n')
      
      console.log(`🔄 恢复检查点: ${stage} (${timestamp})`)
      return stage ?? null
    } catch (error) {
      console.warn('⚠️ 恢复检查点失败:', error)
      return null
    }
  }
  
  /**
   * 清除检查点
   * 
   * @example
   * ```typescript
   * checkpoint.clear()
   * console.log('🗑️ 检查点已清除')
   * ```
   */
  public clear(): void {
    try {
      const filePath = this.getCheckpointPath()
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log('🗑️ 检查点已清除')
      }
    } catch (error) {
      console.warn('⚠️ 清除检查点失败:', error)
    }
  }
  
  /**
   * 检查是否有检查点
   * 
   * @returns 是否存在检查点
   */
  public hasCheckpoint(): boolean {
    const filePath = this.getCheckpointPath()
    return fs.existsSync(filePath)
  }
}

/**
 * 单例实例
 */
export const simpleCheckpoint = new SimpleCheckpoint()

/**
 * 性能监控器 - 优化2: 执行性能监控与时间预估
 */
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map()
  
  /**
   * 开始监控执行阶段
   */
  start(stage: ExecutionStage, baselineMs: number) {
    const metric: PerformanceMetric = {
      stage,
      startTime: Date.now(),
      baseline: baselineMs,
      duration: 0,
      deviation: 0,
      status: 'NORMAL'
    }
    this.metrics.set(stage, metric)
    console.log(`⏱️ [${stage}] 开始执行 (基准: ${baselineMs}ms)`)
  }
  
  /**
   * 结束监控并报告结果
   */
  end(stage: ExecutionStage): PerformanceMetric | null {
    const metric = this.metrics.get(stage)
    if (!metric) return null
    
    metric.duration = Date.now() - metric.startTime
    metric.deviation = ((metric.duration - metric.baseline) / metric.baseline) * 100
    
    // 判断性能状态
    if (metric.duration > metric.baseline * 1.5) {
      metric.status = 'CRITICAL'
      console.warn(`🔴 [${stage}] 执行缓慢: ${metric.duration}ms (基准: ${metric.baseline}ms, 超出 ${metric.deviation.toFixed(1)}%)`)
    } else if (metric.duration > metric.baseline) {
      metric.status = 'SLOW'
      console.warn(`🟡 [${stage}] 执行偏慢: ${metric.duration}ms (基准: ${metric.baseline}ms, 超出 ${metric.deviation.toFixed(1)}%)`)
    } else {
      metric.status = 'NORMAL'
      console.log(`🟢 [${stage}] 执行完成: ${metric.duration}ms`)
    }
    
    return metric
  }
  
  /**
   * 获取性能报告
   */
  getReport(): PerformanceMetric[] {
    return Array.from(this.metrics.values())
  }
}

/**
 * 性能指标接口
 */
export interface PerformanceMetric {
  stage: ExecutionStage
  startTime: number
  duration: number
  baseline: number
  deviation: number
  status: 'NORMAL' | 'SLOW' | 'CRITICAL'
}

/**
 * 性能基准配置
 */
export const PERFORMANCE_BASELINE: Record<ExecutionStage, number> = {
  [ExecutionStage.STAGE0_INDEPENDENT_JUDGMENT]: 100,    // <100ms
  [ExecutionStage.STAGE1_TRIGGER_DETECTION]: 200,        // <200ms
  [ExecutionStage.STAGE2_PRE_LEARNING]: 5000,            // <5s
  [ExecutionStage.STAGE3_INCREMENTAL_CODING]: 0,         // 不定
  [ExecutionStage.STAGE4_QUALITY_GATES]: 30000,          // <30s
  [ExecutionStage.STAGE5_GIT_SYNC]: 15000,               // <15s
  [ExecutionStage.STAGE6_AUTO_CONTINUE]: 500             // <500ms
}

// 导出性能监控器实例
export const performanceMonitor = new PerformanceMonitor()

/**
 * AI自我学习管理器 - 优化3: AI自我学习与质量改进循环
 */
export class SimpleLearningManager {
  private errorCounts: Map<string, number> = new Map()
  private successCounts: Map<string, number> = new Map()
  
  /**
   * 记录错误
   */
  recordError(errorType: string, context?: string) {
    const key = context ? `${errorType}:${context}` : errorType
    const count = (this.errorCounts.get(key) || 0) + 1
    this.errorCounts.set(key, count)
    
    // 高频错误警告
    if (count >= 3) {
      console.log(`🧠 AI学习: "${key}" 已发生 ${count} 次，建议加强检查`)
    }
  }
  
  /**
   * 记录成功
   */
  recordSuccess(successType: string, context?: string) {
    const key = context ? `${successType}:${context}` : successType
    const count = (this.successCounts.get(key) || 0) + 1
    this.successCounts.set(key, count)
  }
  
  /**
   * 获取错误报告（仅显示TOP5）
   */
  getErrorReport(): [string, number][] {
    return Array.from(this.errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }
  
  /**
   * 获取成功率报告
   */
  getSuccessRate(): Record<string, number> {
    const result: Record<string, number> = {}
    
    // 计算每个错误类型的成功率
    for (const [errorKey, errorCount] of this.errorCounts.entries()) {
      const baseKey = errorKey.split(':')[0] // 去掉上下文
      if (!baseKey) continue
      const successCount = this.successCounts.get(baseKey) || 0
      const total = errorCount + successCount
      result[baseKey] = total > 0 ? (successCount / total) * 100 : 100
    }
    
    return result
  }
  
  /**
   * 生成学习建议
   */
  generateSuggestions(): string[] {
    const suggestions: string[] = []
    const errorReport = this.getErrorReport()
    
    for (const [errorKey, count] of errorReport) {
      if (count >= 3) {
        suggestions.push(`高频错误 "${errorKey}" (${count}次): 建议增加前置检查或优化处理逻辑`)
      }
    }
    
    return suggestions
  }
  
  /**
   * 清空学习记录
   */
  clear() {
    this.errorCounts.clear()
    this.successCounts.clear()
  }
}

// 导出AI学习管理器实例
export const learningManager = new SimpleLearningManager()

