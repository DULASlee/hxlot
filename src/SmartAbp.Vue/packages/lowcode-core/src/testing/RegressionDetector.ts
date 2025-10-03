/**
 * 🔥 性能回归检测器
 * 
 * 功能：
 * 1. 检测性能回归
 * 2. 计算性能差异
 * 3. 生成回归报告
 * 4. 阈值验证
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import { getGlobalLogger } from '@smartabp/lowcode-shared'
import type { PerformanceMetrics, PerformanceBaseline, BaselineScenario } from './PerformanceBaseline'

const logger = getGlobalLogger()

/**
 * 回归检测配置
 */
export interface RegressionDetectionConfig {
  /** 平均响应时间阈值（%） */
  averageResponseTimeThreshold: number
  /** P95响应时间阈值（%） */
  p95ResponseTimeThreshold: number
  /** P99响应时间阈值（%） */
  p99ResponseTimeThreshold: number
  /** 吞吐量阈值（%） */
  throughputThreshold: number
  /** 成功率阈值（%） */
  successRateThreshold: number
  /** 错误率阈值（%） */
  errorRateThreshold: number
  /** 内存使用阈值（%） */
  memoryUsageThreshold: number
}

/**
 * 默认回归检测配置
 */
export const DEFAULT_REGRESSION_CONFIG: RegressionDetectionConfig = {
  averageResponseTimeThreshold: 10, // 平均响应时间增加超过10%为回归
  p95ResponseTimeThreshold: 15, // P95响应时间增加超过15%为回归
  p99ResponseTimeThreshold: 20, // P99响应时间增加超过20%为回归
  throughputThreshold: -10, // 吞吐量下降超过10%为回归
  successRateThreshold: -5, // 成功率下降超过5%为回归
  errorRateThreshold: 5, // 错误率增加超过5%为回归
  memoryUsageThreshold: 20 // 内存使用增加超过20%为回归
}

/**
 * 性能差异
 */
export interface PerformanceDifference {
  /** 指标名称 */
  metricName: string
  /** 基线值 */
  baselineValue: number
  /** 当前值 */
  currentValue: number
  /** 差异（%） */
  differencePercentage: number
  /** 绝对差异 */
  absoluteDifference: number
  /** 是否回归 */
  isRegression: boolean
  /** 严重程度 */
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical'
}

/**
 * 场景回归结果
 */
export interface ScenarioRegressionResult {
  /** 场景ID */
  scenarioId: string
  /** 场景名称 */
  scenarioName: string
  /** 是否有回归 */
  hasRegression: boolean
  /** 性能差异列表 */
  differences: PerformanceDifference[]
  /** 回归数量 */
  regressionCount: number
}

/**
 * 回归检测报告
 */
export interface RegressionReport {
  /** 检测时间 */
  detectedAt: Date
  /** 基线信息 */
  baseline: {
    id: string
    name: string
    version: string
  }
  /** 当前版本 */
  currentVersion: string
  /** 是否有回归 */
  hasRegression: boolean
  /** 场景结果列表 */
  scenarioResults: ScenarioRegressionResult[]
  /** 总回归数量 */
  totalRegressions: number
  /** 总体严重程度 */
  overallSeverity: 'none' | 'low' | 'medium' | 'high' | 'critical'
  /** 建议 */
  recommendations: string[]
}

/**
 * 性能回归检测器
 */
export class RegressionDetector {
  private config: RegressionDetectionConfig

  constructor(config?: Partial<RegressionDetectionConfig>) {
    this.config = {
      ...DEFAULT_REGRESSION_CONFIG,
      ...config
    }
  }

  /**
   * 检测回归
   */
  detectRegression(
    baseline: PerformanceBaseline,
    currentScenarios: BaselineScenario[],
    currentVersion: string
  ): RegressionReport {
    logger.info('🔍 开始性能回归检测', {
      baseline: baseline.name,
      baselineVersion: baseline.version,
      currentVersion
    })

    const scenarioResults: ScenarioRegressionResult[] = []

    for (const currentScenario of currentScenarios) {
      const baselineScenario = baseline.scenarios.find(s => s.id === currentScenario.id)
      
      if (!baselineScenario) {
        logger.warn('⚠️ 基线中未找到场景', { scenarioId: currentScenario.id })
        continue
      }

      const result = this.compareScenarios(baselineScenario, currentScenario)
      scenarioResults.push(result)
    }

    const hasRegression = scenarioResults.some(r => r.hasRegression)
    const totalRegressions = scenarioResults.reduce((sum, r) => sum + r.regressionCount, 0)
    const overallSeverity = this.calculateOverallSeverity(scenarioResults)
    const recommendations = this.generateRecommendations(scenarioResults)

    const report: RegressionReport = {
      detectedAt: new Date(),
      baseline: {
        id: baseline.id,
        name: baseline.name,
        version: baseline.version
      },
      currentVersion,
      hasRegression,
      scenarioResults,
      totalRegressions,
      overallSeverity,
      recommendations
    }

    if (hasRegression) {
      logger.warn('⚠️ 检测到性能回归', {
        totalRegressions,
        severity: overallSeverity
      })
    } else {
      logger.info('✅ 未检测到性能回归')
    }

    return report
  }

  /**
   * 对比两个场景
   */
  private compareScenarios(
    baseline: BaselineScenario,
    current: BaselineScenario
  ): ScenarioRegressionResult {
    const differences: PerformanceDifference[] = []

    // 对比平均响应时间
    differences.push(this.compareMetric(
      'averageResponseTime',
      '平均响应时间',
      baseline.metrics.averageResponseTime,
      current.metrics.averageResponseTime,
      this.config.averageResponseTimeThreshold,
      true // 越小越好
    ))

    // 对比P95响应时间
    differences.push(this.compareMetric(
      'p95ResponseTime',
      'P95响应时间',
      baseline.metrics.p95ResponseTime,
      current.metrics.p95ResponseTime,
      this.config.p95ResponseTimeThreshold,
      true
    ))

    // 对比P99响应时间
    differences.push(this.compareMetric(
      'p99ResponseTime',
      'P99响应时间',
      baseline.metrics.p99ResponseTime,
      current.metrics.p99ResponseTime,
      this.config.p99ResponseTimeThreshold,
      true
    ))

    // 对比吞吐量
    differences.push(this.compareMetric(
      'throughput',
      '吞吐量',
      baseline.metrics.throughput,
      current.metrics.throughput,
      Math.abs(this.config.throughputThreshold),
      false // 越大越好
    ))

    // 对比成功率
    differences.push(this.compareMetric(
      'successRate',
      '成功率',
      baseline.metrics.successRate,
      current.metrics.successRate,
      Math.abs(this.config.successRateThreshold),
      false // 越大越好
    ))

    // 对比错误率
    differences.push(this.compareMetric(
      'errorRate',
      '错误率',
      baseline.metrics.errorRate,
      current.metrics.errorRate,
      this.config.errorRateThreshold,
      true // 越小越好
    ))

    // 对比内存使用（如果有）
    if (baseline.metrics.memoryUsage !== undefined && current.metrics.memoryUsage !== undefined) {
      differences.push(this.compareMetric(
        'memoryUsage',
        '内存使用',
        baseline.metrics.memoryUsage,
        current.metrics.memoryUsage,
        this.config.memoryUsageThreshold,
        true // 越小越好
      ))
    }

    const hasRegression = differences.some(d => d.isRegression)
    const regressionCount = differences.filter(d => d.isRegression).length

    return {
      scenarioId: current.id,
      scenarioName: current.name,
      hasRegression,
      differences,
      regressionCount
    }
  }

  /**
   * 对比单个指标
   */
  private compareMetric(
    metricKey: string,
    metricName: string,
    baselineValue: number,
    currentValue: number,
    threshold: number,
    lowerIsBetter: boolean
  ): PerformanceDifference {
    const absoluteDifference = currentValue - baselineValue
    const differencePercentage = baselineValue !== 0 
      ? (absoluteDifference / baselineValue) * 100 
      : 0

    let isRegression = false
    
    if (lowerIsBetter) {
      // 越小越好的指标（如响应时间、错误率）
      isRegression = differencePercentage > threshold
    } else {
      // 越大越好的指标（如吞吐量、成功率）
      isRegression = differencePercentage < -threshold
    }

    const severity = this.calculateSeverity(Math.abs(differencePercentage), threshold, isRegression)

    return {
      metricName,
      baselineValue,
      currentValue,
      differencePercentage: parseFloat(differencePercentage.toFixed(2)),
      absoluteDifference: parseFloat(absoluteDifference.toFixed(2)),
      isRegression,
      severity
    }
  }

  /**
   * 计算严重程度
   */
  private calculateSeverity(
    diffPercentage: number,
    threshold: number,
    isRegression: boolean
  ): PerformanceDifference['severity'] {
    if (!isRegression) return 'none'
    
    if (diffPercentage > threshold * 3) return 'critical'
    if (diffPercentage > threshold * 2) return 'high'
    if (diffPercentage > threshold * 1.5) return 'medium'
    return 'low'
  }

  /**
   * 计算总体严重程度
   */
  private calculateOverallSeverity(results: ScenarioRegressionResult[]): RegressionReport['overallSeverity'] {
    const severities: PerformanceDifference['severity'][] = []
    
    for (const result of results) {
      for (const diff of result.differences) {
        if (diff.isRegression) {
          severities.push(diff.severity)
        }
      }
    }

    if (severities.includes('critical')) return 'critical'
    if (severities.includes('high')) return 'high'
    if (severities.includes('medium')) return 'medium'
    if (severities.includes('low')) return 'low'
    return 'none'
  }

  /**
   * 生成建议
   */
  private generateRecommendations(results: ScenarioRegressionResult[]): string[] {
    const recommendations: string[] = []
    const regressedMetrics = new Map<string, number>()

    // 收集所有回归的指标
    for (const result of results) {
      for (const diff of result.differences) {
        if (diff.isRegression) {
          const count = regressedMetrics.get(diff.metricName) || 0
          regressedMetrics.set(diff.metricName, count + 1)
        }
      }
    }

    // 根据回归指标生成建议
    if (regressedMetrics.has('平均响应时间') || regressedMetrics.has('P95响应时间')) {
      recommendations.push('响应时间回归！建议：')
      recommendations.push('- 检查是否引入了低效算法或同步阻塞操作')
      recommendations.push('- 使用性能分析工具定位瓶颈')
      recommendations.push('- 优化数据库查询和网络请求')
    }

    if (regressedMetrics.has('吞吐量')) {
      recommendations.push('吞吐量下降！建议：')
      recommendations.push('- 检查并发控制和资源竞争')
      recommendations.push('- 优化关键路径上的处理逻辑')
      recommendations.push('- 考虑使用缓存减少重复计算')
    }

    if (regressedMetrics.has('成功率') || regressedMetrics.has('错误率')) {
      recommendations.push('可靠性下降！建议：')
      recommendations.push('- 检查最近的代码变更')
      recommendations.push('- 增加错误处理和重试机制')
      recommendations.push('- 审查日志查找错误根因')
    }

    if (regressedMetrics.has('内存使用')) {
      recommendations.push('内存使用增加！建议：')
      recommendations.push('- 检查是否存在内存泄漏')
      recommendations.push('- 优化大对象和数组的使用')
      recommendations.push('- 及时清理不再使用的资源')
    }

    if (recommendations.length === 0) {
      recommendations.push('未检测到性能回归，表现良好！')
    }

    return recommendations
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<RegressionDetectionConfig>): void {
    this.config = {
      ...this.config,
      ...config
    }
    logger.info('✅ 回归检测配置已更新', this.config)
  }

  /**
   * 获取当前配置
   */
  getConfig(): Readonly<RegressionDetectionConfig> {
    return { ...this.config }
  }
}
