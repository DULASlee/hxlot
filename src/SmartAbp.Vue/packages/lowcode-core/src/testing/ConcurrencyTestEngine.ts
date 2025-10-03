/**
 * 🔥 并发测试引擎
 * 
 * 功能：
 * 1. 执行并发测试
 * 2. 管理并发操作
 * 3. 检测并发问题
 * 4. 生成测试报告
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import { getGlobalLogger } from '@smartabp/lowcode-shared'
import { ConcurrencyTestScenario, type ConcurrentOperation } from './ConcurrencyScenario'
import { RaceConditionDetector, type RaceDetectionResult } from './RaceConditionDetector'

const logger = getGlobalLogger()

/**
 * 操作执行结果
 */
export interface OperationResult {
  /** 操作ID */
  operationId: string
  /** 线程/任务ID */
  threadId: string
  /** 执行时间戳 */
  timestamp: number
  /** 执行时间（毫秒） */
  duration: number
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: string
  /** 返回值 */
  result?: any
}

/**
 * 并发测试结果
 */
export interface ConcurrencyTestResult {
  /** 测试场景ID */
  scenarioId: string
  /** 测试场景名称 */
  scenarioName: string
  /** 开始时间 */
  startTime: Date
  /** 结束时间 */
  endTime: Date
  /** 测试持续时间（秒） */
  duration: number
  /** 操作执行统计 */
  operationStats: {
    totalOperations: number
    successfulOperations: number
    failedOperations: number
    averageDuration: number
    minDuration: number
    maxDuration: number
  }
  /** 并发统计 */
  concurrencyStats: {
    maxConcurrentOperations: number
    averageConcurrency: number
    concurrencyLevel: number
  }
  /** 竞态条件检测结果 */
  raceDetection?: RaceDetectionResult
  /** 操作结果列表 */
  operationResults: OperationResult[]
}

/**
 * 并发测试引擎
 */
export class ConcurrencyTestEngine {
  private scenario: ConcurrencyTestScenario | null = null
  private raceDetector: RaceConditionDetector
  private isRunning: boolean = false
  private startTime: Date | null = null
  private operationResults: OperationResult[] = []
  private activeTasks: Set<Promise<any>> = new Set()
  private taskIdCounter: number = 0

  constructor() {
    this.raceDetector = new RaceConditionDetector()
  }

  /**
   * 执行并发测试
   */
  async testConcurrency(scenario: ConcurrencyTestScenario): Promise<ConcurrencyTestResult> {
    logger.info('🚀 开始并发测试', { scenario: scenario.getSummary() })

    this.scenario = scenario
    this.isRunning = true
    this.startTime = new Date()
    this.operationResults = []
    this.activeTasks.clear()
    this.raceDetector.clear()

    try {
      // 执行并发测试
      await this.runConcurrentOperations()

      // 生成测试结果
      const result = this.generateResult()

      logger.info('✅ 并发测试完成', {
        totalOperations: result.operationStats.totalOperations,
        maxConcurrency: result.concurrencyStats.maxConcurrentOperations
      })

      return result

    } catch (error) {
      logger.error('❌ 并发测试失败', error)
      throw error
    } finally {
      this.stop()
    }
  }

  /**
   * 运行并发操作
   */
  private async runConcurrentOperations(): Promise<void> {
    if (!this.scenario) return

    const startTime = Date.now()
    const duration = this.scenario.getTestDuration() * 1000
    const concurrencyLevel = this.scenario.getConcurrencyLevel()

    while (this.isRunning && Date.now() - startTime < duration) {
      // 保持并发级别
      while (this.activeTasks.size < concurrencyLevel && this.isRunning) {
        const operation = this.scenario.selectOperation()
        const task = this.executeOperation(operation)
        this.activeTasks.add(task)

        // 任务完成后从活跃列表移除
        task.finally(() => {
          this.activeTasks.delete(task)
        })
      }

      // 短暂等待以避免忙等待
      await this.sleep(10)
    }

    // 等待所有任务完成
    await Promise.all(Array.from(this.activeTasks))
  }

  /**
   * 执行单个操作
   */
  private async executeOperation(operation: ConcurrentOperation): Promise<void> {
    const threadId = `thread-${++this.taskIdCounter}`
    const timestamp = Date.now()

    try {
      // 记录资源访问（用于竞态检测）
      if (this.scenario?.shouldDetectRaceConditions() && operation.sharedResources) {
        for (const resourceId of operation.sharedResources) {
          this.raceDetector.recordAccess({
            resourceId,
            operationId: operation.id,
            accessType: operation.type === 'read' ? 'read' : 'write',
            timestamp,
            threadId
          })

          // 记录等待（用于死锁检测）
          if (this.scenario.shouldDetectDeadlocks()) {
            this.raceDetector.recordWait(operation.id, resourceId)
          }
        }
      }

      // 执行操作
      const startTime = performance.now()
      const result = await Promise.race([
        operation.action(),
        this.timeout(operation.timeout)
      ])
      const duration = performance.now() - startTime

      // 记录成功结果
      this.operationResults.push({
        operationId: operation.id,
        threadId,
        timestamp,
        duration,
        success: true,
        result
      })

    } catch (error) {
      const duration = performance.now() - timestamp

      // 记录失败结果
      this.operationResults.push({
        operationId: operation.id,
        threadId,
        timestamp,
        duration,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })

      if (this.scenario?.isVerboseLogging()) {
        logger.error(`操作[${operation.id}]执行失败`, error)
      }
    }
  }

  /**
   * 超时Promise
   */
  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`操作超时: ${ms}ms`)), ms)
    })
  }

  /**
   * 检测竞态条件
   */
  detectRaceConditions(): RaceDetectionResult {
    return this.raceDetector.getDetectionResult()
  }

  /**
   * 检测死锁
   */
  detectDeadlocks(): RaceDetectionResult['deadlocks'] {
    return this.raceDetector.getDetectionResult().deadlocks
  }

  /**
   * 生成测试结果
   */
  private generateResult(): ConcurrencyTestResult {
    if (!this.scenario || !this.startTime) {
      throw new Error('测试未运行')
    }

    const endTime = new Date()
    const duration = (endTime.getTime() - this.startTime.getTime()) / 1000

    // 操作统计
    const successfulOps = this.operationResults.filter(r => r.success)
    const failedOps = this.operationResults.filter(r => !r.success)
    const durations = this.operationResults.map(r => r.duration)

    const operationStats = {
      totalOperations: this.operationResults.length,
      successfulOperations: successfulOps.length,
      failedOperations: failedOps.length,
      averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length || 0,
      minDuration: Math.min(...durations, 0),
      maxDuration: Math.max(...durations, 0)
    }

    // 并发统计
    const concurrencyStats = this.calculateConcurrencyStats()

    // 竞态条件检测
    let raceDetection: RaceDetectionResult | undefined
    if (this.scenario.shouldDetectRaceConditions() || this.scenario.shouldDetectDeadlocks()) {
      raceDetection = this.raceDetector.getDetectionResult()
    }

    return {
      scenarioId: this.scenario.getId(),
      scenarioName: this.scenario.getName(),
      startTime: this.startTime,
      endTime,
      duration,
      operationStats,
      concurrencyStats,
      raceDetection,
      operationResults: this.operationResults
    }
  }

  /**
   * 计算并发统计
   */
  private calculateConcurrencyStats(): ConcurrencyTestResult['concurrencyStats'] {
    if (!this.scenario) {
      return {
        maxConcurrentOperations: 0,
        averageConcurrency: 0,
        concurrencyLevel: 0
      }
    }

    // 按时间排序
    const sortedResults = [...this.operationResults].sort((a, b) => a.timestamp - b.timestamp)

    let maxConcurrent = 0
    let totalConcurrency = 0
    let sampleCount = 0

    // 使用滑动窗口计算并发数
    for (let i = 0; i < sortedResults.length; i++) {
      const currentTime = sortedResults[i].timestamp
      const windowEnd = currentTime + sortedResults[i].duration

      // 计算在当前时间窗口内有多少操作在执行
      let concurrent = 0
      for (const result of sortedResults) {
        const opStart = result.timestamp
        const opEnd = result.timestamp + result.duration
        
        // 检查时间窗口是否重叠
        if (opStart < windowEnd && opEnd > currentTime) {
          concurrent++
        }
      }

      maxConcurrent = Math.max(maxConcurrent, concurrent)
      totalConcurrency += concurrent
      sampleCount++
    }

    return {
      maxConcurrentOperations: maxConcurrent,
      averageConcurrency: sampleCount > 0 ? totalConcurrency / sampleCount : 0,
      concurrencyLevel: this.scenario.getConcurrencyLevel()
    }
  }

  /**
   * 停止测试
   */
  stop(): void {
    this.isRunning = false
    this.activeTasks.clear()
    this.scenario = null
  }

  /**
   * 是否正在运行
   */
  isTestRunning(): boolean {
    return this.isRunning
  }

  /**
   * 获取竞态条件检测器
   */
  getRaceDetector(): RaceConditionDetector {
    return this.raceDetector
  }

  /**
   * 睡眠
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
