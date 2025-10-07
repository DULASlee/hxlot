/**
 * 🔥 性能基准测试引擎
 * 
 * 功能：
 * 1. 执行性能基准测试
 * 2. 集成PerformanceOptimizer
 * 3. 管理基线和回归检测
 * 4. 生成详细报告
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import { getGlobalLogger } from '@smartabp/lowcode-shared'
import { PerformanceOptimizer } from '../analyzers/PerformanceOptimizer'
import {
  LocalStorageBaselineStorage,
  MemoryBaselineStorage,
  PerformanceBaselineManager,
  type BaselineScenario,
  type PerformanceBaseline,
  type PerformanceMetrics
} from './PerformanceBaseline'
import {
  DEFAULT_REGRESSION_CONFIG,
  RegressionDetector,
  type RegressionReport
} from './RegressionDetector'

const logger = getGlobalLogger()

/**
 * 基准测试场景配置
 */
export interface BenchmarkScenarioConfig {
  /** 场景ID */
  id: string
  /** 场景名称 */
  name: string
  /** 场景描述 */
  description?: string
  /** 测试函数 */
  testFn: () => Promise<any>
  /** 预热次数 */
  warmupIterations?: number
  /** 测试迭代次数 */
  iterations?: number
  /** 超时时间（毫秒） */
  timeout?: number
}

/**
 * 基准测试配置
 */
export interface BenchmarkConfig {
  /** 基准名称 */
  name: string
  /** 版本号 */
  version: string
  /** 场景列表 */
  scenarios: BenchmarkScenarioConfig[]
  /** 是否启用性能优化器 */
  enableOptimizer?: boolean
  /** 是否启用回归检测 */
  enableRegressionDetection?: boolean
  /** 基线ID（用于回归检测） */
  baselineId?: string
  /** 是否保存为新基线 */
  saveAsBaseline?: boolean
}

/**
 * 场景执行结果
 */
export interface ScenarioBenchmarkResult {
  /** 场景ID */
  scenarioId: string
  /** 场景名称 */
  scenarioName: string
  /** 性能指标 */
  metrics: PerformanceMetrics
  /** 执行次数 */
  iterations: number
  /** 总执行时间（毫秒） */
  totalDuration: number
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: string
}

/**
 * 基准测试结果
 */
export interface BenchmarkResult {
  /** 基准名称 */
  name: string
  /** 版本号 */
  version: string
  /** 执行时间 */
  executedAt: Date
  /** 场景结果列表 */
  scenarioResults: ScenarioBenchmarkResult[]
  /** 性能优化报告（如果启用） */
  optimizationReport?: any
  /** 回归检测报告（如果启用） */
  regressionReport?: RegressionReport
  /** 是否保存为基线 */
  savedAsBaseline: boolean
  /** 基线ID */
  baselineId?: string
}

/**
 * 性能基准测试引擎
 */
export class BenchmarkEngine {
  private baselineManager: PerformanceBaselineManager
  private regressionDetector: RegressionDetector
  private performanceOptimizer: PerformanceOptimizer

  constructor(useLocalStorage: boolean = false) {
    const storage = useLocalStorage
      ? new LocalStorageBaselineStorage()
      : new MemoryBaselineStorage()

    this.baselineManager = new PerformanceBaselineManager(storage)
    this.regressionDetector = new RegressionDetector(DEFAULT_REGRESSION_CONFIG)
    this.performanceOptimizer = new PerformanceOptimizer()
  }

  /**
   * 执行基准测试
   */
  async runBenchmark(config: BenchmarkConfig): Promise<BenchmarkResult> {
    logger.info('🚀 开始性能基准测试', {
      name: config.name,
      version: config.version,
      scenarios: config.scenarios.length
    })

    const executedAt = new Date()
    const scenarioResults: ScenarioBenchmarkResult[] = []

    // 执行所有场景
    for (const scenarioConfig of config.scenarios) {
      const result = await this.runScenario(scenarioConfig)
      scenarioResults.push(result)
    }

    // 准备结果
    const result: BenchmarkResult = {
      name: config.name,
      version: config.version,
      executedAt,
      scenarioResults,
      savedAsBaseline: false
    }

    // 性能优化分析（如果启用）
    if (config.enableOptimizer) {
      try {
        // 使用示例代码进行优化分析
        // TODO: 未来版本将传递sampleCode到analyze方法
        // const sampleCode = this.generateSampleCode(scenarioResults)
        result.optimizationReport = await this.performanceOptimizer.analyze()
        logger.info('✅ 性能优化分析完成')
      } catch (error) {
        logger.error('❌ 性能优化分析失败', error)
      }
    }

    // 回归检测（如果启用且有基线）
    if (config.enableRegressionDetection && config.baselineId) {
      try {
        const baseline = await this.baselineManager.getBaseline(config.baselineId)
        if (baseline) {
          const currentScenarios = this.convertToBaselineScenarios(scenarioResults)
          result.regressionReport = this.regressionDetector.detectRegression(
            baseline,
            currentScenarios,
            config.version
          )
          logger.info('✅ 回归检测完成')
        } else {
          logger.warn('⚠️ 未找到基线', { baselineId: config.baselineId })
        }
      } catch (error) {
        logger.error('❌ 回归检测失败', error)
      }
    }

    // 保存为新基线（如果启用）
    if (config.saveAsBaseline) {
      try {
        const baseline = await this.saveAsBaseline(
          config.name,
          config.version,
          scenarioResults
        )
        result.savedAsBaseline = true
        result.baselineId = baseline.id
        logger.info('✅ 已保存为新基线', { baselineId: baseline.id })
      } catch (error) {
        logger.error('❌ 保存基线失败', error)
      }
    }

    logger.info('✅ 性能基准测试完成', {
      name: config.name,
      scenarios: scenarioResults.length,
      hasRegression: result.regressionReport?.hasRegression
    })

    return result
  }

  /**
   * 执行单个场景
   */
  private async runScenario(config: BenchmarkScenarioConfig): Promise<ScenarioBenchmarkResult> {
    logger.info(`🔧 执行场景: ${config.name}`)

    const warmupIterations = config.warmupIterations ?? 3
    const iterations = config.iterations ?? 10
    const timeout = config.timeout ?? 30000

    try {
      // 预热
      logger.info(`🔥 预热中... (${warmupIterations}次)`)
      for (let i = 0; i < warmupIterations; i++) {
        await Promise.race([
          config.testFn(),
          this.timeout(timeout)
        ])
      }

      // 正式测试
      logger.info(`📊 测试中... (${iterations}次)`)
      const startTime = performance.now()
      const responseTimes: number[] = []
      let successCount = 0
      let errorCount = 0

      for (let i = 0; i < iterations; i++) {
        const iterStartTime = performance.now()
        try {
          await Promise.race([
            config.testFn(),
            this.timeout(timeout)
          ])
          const iterEndTime = performance.now()
          responseTimes.push(iterEndTime - iterStartTime)
          successCount++
        } catch (error) {
          errorCount++
          logger.warn(`迭代 ${i + 1} 失败`, error)
        }
      }

      const endTime = performance.now()
      const totalDuration = endTime - startTime

      // 计算性能指标
      const metrics = this.calculateMetrics(responseTimes, successCount, errorCount, iterations)

      return {
        scenarioId: config.id,
        scenarioName: config.name,
        metrics,
        iterations,
        totalDuration,
        success: successCount > 0
      }

    } catch (error) {
      logger.error(`❌ 场景执行失败: ${config.name}`, error)
      return {
        scenarioId: config.id,
        scenarioName: config.name,
        metrics: this.getEmptyMetrics(),
        iterations: 0,
        totalDuration: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * 计算性能指标
   */
  private calculateMetrics(
    responseTimes: number[],
    successCount: number,
    errorCount: number,
    totalIterations: number
  ): PerformanceMetrics {
    if (responseTimes.length === 0) {
      return this.getEmptyMetrics()
    }

    const sorted = [...responseTimes].sort((a, b) => a - b)
    const sum = responseTimes.reduce((acc, val) => acc + val, 0)
    const average = sum / responseTimes.length
    const min = sorted[0]
    const max = sorted[sorted.length - 1]

    const p50 = this.getPercentile(sorted, 50)
    const p95 = this.getPercentile(sorted, 95)
    const p99 = this.getPercentile(sorted, 99)

    const successRate = (successCount / totalIterations) * 100
    const errorRate = (errorCount / totalIterations) * 100
    const throughput = totalIterations > 0 ? (1000 / average) : 0

    // 内存使用（如果可用）
    let memoryUsage: number | undefined
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      memoryUsage = (performance as any).memory.usedJSHeapSize / 1048576 // 转换为MB
    }

    return {
      averageResponseTime: parseFloat(average.toFixed(2)),
      minResponseTime: parseFloat(min.toFixed(2)),
      maxResponseTime: parseFloat(max.toFixed(2)),
      p50ResponseTime: parseFloat(p50.toFixed(2)),
      p95ResponseTime: parseFloat(p95.toFixed(2)),
      p99ResponseTime: parseFloat(p99.toFixed(2)),
      throughput: parseFloat(throughput.toFixed(2)),
      successRate: parseFloat(successRate.toFixed(2)),
      errorRate: parseFloat(errorRate.toFixed(2)),
      memoryUsage: memoryUsage ? parseFloat(memoryUsage.toFixed(2)) : undefined
    }
  }

  /**
   * 获取百分位数
   */
  private getPercentile(sortedData: number[], percentile: number): number {
    if (sortedData.length === 0) return 0
    const index = (percentile / 100) * (sortedData.length - 1)
    if (index % 1 === 0) {
      return sortedData[index]
    }
    const lower = sortedData[Math.floor(index)]
    const upper = sortedData[Math.ceil(index)]
    return lower + (upper - lower) * (index % 1)
  }

  /**
   * 获取空指标
   */
  private getEmptyMetrics(): PerformanceMetrics {
    return {
      averageResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      p50ResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      throughput: 0,
      successRate: 0,
      errorRate: 100
    }
  }

  /**
   * 保存为基线
   */
  private async saveAsBaseline(
    name: string,
    version: string,
    scenarioResults: ScenarioBenchmarkResult[]
  ): Promise<PerformanceBaseline> {
    const scenarios: BaselineScenario[] = scenarioResults.map(result => ({
      id: result.scenarioId,
      name: result.scenarioName,
      metrics: result.metrics
    }))

    return await this.baselineManager.createBaseline({
      id: `${name}-${version}-${Date.now()}`,
      name,
      version,
      scenarios
    })
  }

  /**
   * 转换为基线场景
   */
  private convertToBaselineScenarios(results: ScenarioBenchmarkResult[]): BaselineScenario[] {
    return results.map(result => ({
      id: result.scenarioId,
      name: result.scenarioName,
      metrics: result.metrics
    }))
  }

  /**
   * 生成示例代码（用于优化器）
   * TODO: 暂时注释，保留用于未来代码优化器集成
   */
  // private _generateSampleCode(_results: ScenarioBenchmarkResult[]): string {
  //   void _results // 保留用于未来代码优化器集成
  //   // 生成一个包含性能指标的代码示例
  //   return `
  // // 性能基准测试结果
  // // 场景数量: ${_results.length}
  // // 平均响应时间: ${_results.reduce((sum, r) => sum + r.metrics.averageResponseTime, 0) / _results.length}ms
  //     `.trim()
  // }

  /**
   * 超时Promise
   */
  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout: ${ms}ms`)), ms)
    })
  }

  /**
   * 获取基线管理器
   */
  getBaselineManager(): PerformanceBaselineManager {
    return this.baselineManager
  }

  /**
   * 获取回归检测器
   */
  getRegressionDetector(): RegressionDetector {
    return this.regressionDetector
  }

  /**
   * 获取性能优化器
   */
  getPerformanceOptimizer(): PerformanceOptimizer {
    return this.performanceOptimizer
  }
}
