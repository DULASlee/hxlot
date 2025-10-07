/**
 * 🔥 压力测试报告生成器
 * 
 * 功能：
 * 1. 整合所有测试结果
 * 2. 生成综合报告
 * 3. 支持多种格式导出
 * 4. 集成图表和统计
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import { getGlobalLogger } from '@smartabp/lowcode-shared'
import { ChartBuilder } from './ChartBuilder'
import { HtmlReportExporter, type ReportSection } from './HtmlReportExporter'
import type { LoadTestResult } from './LoadTestEngine'
import type { ConcurrencyTestResult } from './ConcurrencyTestEngine'
import type { BenchmarkResult } from './BenchmarkEngine'
// import type { RegressionReport } from './RegressionDetector'

const logger = getGlobalLogger()

/**
 * 综合测试报告
 */
export interface ComprehensiveTestReport {
  /** 报告ID */
  id: string
  /** 报告标题 */
  title: string
  /** 生成时间 */
  generatedAt: Date
  /** 负载测试结果 */
  loadTestResults?: LoadTestResult[]
  /** 并发测试结果 */
  concurrencyTestResults?: ConcurrencyTestResult[]
  /** 基准测试结果 */
  benchmarkResults?: BenchmarkResult[]
  /** 总体统计 */
  summary: {
    totalTests: number
    totalRequests: number
    averageResponseTime: number
    overallSuccessRate: number
    criticalIssuesFound: number
  }
}

/**
 * 报告格式
 */
export type ReportFormat = 'html' | 'json' | 'markdown'

/**
 * 报告生成选项
 */
export interface ReportGenerationOptions {
  /** 报告格式 */
  format: ReportFormat
  /** 包含图表 */
  includeCharts?: boolean
  /** 包含详细数据 */
  includeDetailedData?: boolean
  /** 自定义模板 */
  customTemplate?: string
}

/**
 * 压力测试报告生成器
 */
export class TestReportGenerator {
  private chartBuilder: ChartBuilder
  private htmlExporter: HtmlReportExporter

  constructor() {
    this.chartBuilder = new ChartBuilder()
    this.htmlExporter = new HtmlReportExporter()
  }

  /**
   * 生成综合报告
   */
  generateComprehensiveReport(
    loadTestResults?: LoadTestResult[],
    concurrencyTestResults?: ConcurrencyTestResult[],
    benchmarkResults?: BenchmarkResult[]
  ): ComprehensiveTestReport {
    logger.info('🔧 开始生成综合测试报告')

    const id = `report-${Date.now()}`
    const generatedAt = new Date()

    // 计算总体统计
    const summary = this.calculateSummary(
      loadTestResults,
      concurrencyTestResults,
      benchmarkResults
    )

    const report: ComprehensiveTestReport = {
      id,
      title: 'SmartAbp 压力测试综合报告',
      generatedAt,
      loadTestResults,
      concurrencyTestResults,
      benchmarkResults,
      summary
    }

    logger.info('✅ 综合测试报告生成完成', {
      id,
      totalTests: summary.totalTests
    })

    return report
  }

  /**
   * 导出报告
   */
  exportReport(
    report: ComprehensiveTestReport,
    options: ReportGenerationOptions
  ): string {
    logger.info('📤 导出测试报告', { format: options.format })

    switch (options.format) {
      case 'html':
        return this.exportAsHtml(report, options)
      case 'json':
        return this.exportAsJson(report, options)
      case 'markdown':
        return this.exportAsMarkdown(report, options)
      default:
        throw new Error(`不支持的报告格式: ${options.format}`)
    }
  }

  /**
   * 导出为HTML
   */
  private exportAsHtml(
    report: ComprehensiveTestReport,
    options: ReportGenerationOptions
  ): string {
    const sections: ReportSection[] = []

    // 概览部分
    sections.push(this.generateSummarySection(report))

    // 负载测试部分
    if (report.loadTestResults && report.loadTestResults.length > 0) {
      sections.push(this.generateLoadTestSection(report.loadTestResults, options.includeCharts))
    }

    // 并发测试部分
    if (report.concurrencyTestResults && report.concurrencyTestResults.length > 0) {
      sections.push(this.generateConcurrencyTestSection(report.concurrencyTestResults, options.includeCharts))
    }

    // 基准测试部分
    if (report.benchmarkResults && report.benchmarkResults.length > 0) {
      sections.push(this.generateBenchmarkSection(report.benchmarkResults, options.includeCharts))
    }

    // 建议部分
    sections.push(this.generateRecommendationsSection(report))

    return this.htmlExporter.generateHtmlReport({
      title: report.title,
      subtitle: `报告ID: ${report.id}`,
      author: 'SmartAbp Test Engine',
      generatedAt: report.generatedAt,
      sections,
      includeCss: true,
      includeChartJs: options.includeCharts !== false
    })
  }

  /**
   * 生成概览部分
   */
  private generateSummarySection(report: ComprehensiveTestReport): ReportSection {
    const { summary } = report

    const content = `
<div class="summary-grid">
  <div class="metric-card">
    <h3>总测试数</h3>
    <p class="metric-value">${summary.totalTests}</p>
  </div>
  <div class="metric-card">
    <h3>总请求数</h3>
    <p class="metric-value">${summary.totalRequests.toLocaleString()}</p>
  </div>
  <div class="metric-card">
    <h3>平均响应时间</h3>
    <p class="metric-value ${this.getResponseTimeClass(summary.averageResponseTime)}">${summary.averageResponseTime.toFixed(2)}ms</p>
  </div>
  <div class="metric-card">
    <h3>总体成功率</h3>
    <p class="metric-value ${this.getSuccessRateClass(summary.overallSuccessRate)}">${summary.overallSuccessRate.toFixed(2)}%</p>
  </div>
  <div class="metric-card">
    <h3>发现的严重问题</h3>
    <p class="metric-value ${summary.criticalIssuesFound > 0 ? 'danger' : 'success'}">${summary.criticalIssuesFound}</p>
  </div>
</div>

<style>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.metric-card {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  text-align: center;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.metric-card h3 {
  font-size: 0.9rem;
  margin-bottom: 10px;
  opacity: 0.9;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.metric-value.success {
  color: #4CAF50;
}

.metric-value.warning {
  color: #FF9800;
}

.metric-value.danger {
  color: #F44336;
}
</style>
    `.trim()

    return {
      title: '📊 测试概览',
      content
    }
  }

  /**
   * 生成负载测试部分
   */
  private generateLoadTestSection(
    results: LoadTestResult[],
    includeCharts: boolean = true
  ): ReportSection {
    const latestResult = results[results.length - 1]

    let content = `
<table>
  <thead>
    <tr>
      <th>场景名称</th>
      <th>总请求数</th>
      <th>成功率</th>
      <th>平均响应时间</th>
      <th>P95响应时间</th>
      <th>吞吐量</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>${latestResult.scenarioName}</td>
      <td>${latestResult.overallStats.totalRequests}</td>
      <td>${latestResult.overallStats.successRate.toFixed(2)}%</td>
      <td>${latestResult.overallStats.averageResponseTime.toFixed(2)}ms</td>
      <td>${latestResult.overallStats.p95ResponseTime.toFixed(2)}ms</td>
      <td>${latestResult.overallStats.requestsPerSecond.toFixed(2)} req/s</td>
    </tr>
  </tbody>
</table>
    `.trim()

    const charts = []

    if (includeCharts) {
      // 成功率饼图
      charts.push({
        id: 'load-test-success-rate',
        config: this.chartBuilder.buildSuccessRatePieChart(
          latestResult.overallStats.successfulRequests,
          latestResult.overallStats.failedRequests
        )
      })

      // 响应时间趋势图
      charts.push({
        id: 'load-test-response-time',
        config: this.chartBuilder.buildResponseTimeTrendChart(
          ['场景1'],
          [latestResult.overallStats.averageResponseTime],
          [latestResult.overallStats.p95ResponseTime],
          [latestResult.overallStats.p99ResponseTime]
        )
      })
    }

    return {
      title: '🚀 负载测试结果',
      content,
      charts: charts.length > 0 ? charts : undefined
    }
  }

  /**
   * 生成并发测试部分
   */
  private generateConcurrencyTestSection(
    results: ConcurrencyTestResult[],
    _includeCharts: boolean = true
  ): ReportSection {
    const latestResult = results[results.length - 1]

    let content = `
<table>
  <thead>
    <tr>
      <th>场景名称</th>
      <th>并发级别</th>
      <th>最大并发数</th>
      <th>总操作数</th>
      <th>成功操作</th>
      <th>失败操作</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>${latestResult.scenarioName}</td>
      <td>${latestResult.concurrencyStats.concurrencyLevel}</td>
      <td>${latestResult.concurrencyStats.maxConcurrentOperations}</td>
      <td>${latestResult.operationStats.totalOperations}</td>
      <td>${latestResult.operationStats.successfulOperations}</td>
      <td>${latestResult.operationStats.failedOperations}</td>
    </tr>
  </tbody>
</table>
    `.trim()

    // 回归检测结果
    if (latestResult.raceDetection) {
      content += `
<div class="race-detection">
  <h3>🔍 并发问题检测</h3>
  <p><strong>竞态条件:</strong> ${latestResult.raceDetection.raceConditions.length}个</p>
  <p><strong>死锁:</strong> ${latestResult.raceDetection.deadlocks.length}个</p>
  <p><strong>锁竞争:</strong> ${latestResult.raceDetection.lockContentions.length}个</p>
  <p><strong>风险级别:</strong> <span class="risk-${latestResult.raceDetection.overallRisk}">${latestResult.raceDetection.overallRisk}</span></p>
</div>
      `.trim()
    }

    return {
      title: '🔄 并发测试结果',
      content
    }
  }

  /**
   * 生成基准测试部分
   */
  private generateBenchmarkSection(
    results: BenchmarkResult[],
    _includeCharts: boolean = true
  ): ReportSection {
    const latestResult = results[results.length - 1]

    let content = `
<table>
  <thead>
    <tr>
      <th>场景名称</th>
      <th>迭代次数</th>
      <th>平均响应时间</th>
      <th>P50</th>
      <th>P95</th>
      <th>P99</th>
      <th>吞吐量</th>
    </tr>
  </thead>
  <tbody>
    ${latestResult.scenarioResults.map(sr => `
    <tr>
      <td>${sr.scenarioName}</td>
      <td>${sr.iterations}</td>
      <td>${sr.metrics.averageResponseTime.toFixed(2)}ms</td>
      <td>${sr.metrics.p50ResponseTime.toFixed(2)}ms</td>
      <td>${sr.metrics.p95ResponseTime.toFixed(2)}ms</td>
      <td>${sr.metrics.p99ResponseTime.toFixed(2)}ms</td>
      <td>${sr.metrics.throughput.toFixed(2)} req/s</td>
    </tr>
    `).join('')}
  </tbody>
</table>
    `.trim()

    // 回归检测结果
    if (latestResult.regressionReport) {
      const { regressionReport } = latestResult
      content += `
<div class="regression-report">
  <h3>📈 性能回归检测</h3>
  <p><strong>基线版本:</strong> ${regressionReport.baseline.version}</p>
  <p><strong>当前版本:</strong> ${regressionReport.currentVersion}</p>
  <p><strong>是否回归:</strong> <span class="${regressionReport.hasRegression ? 'danger' : 'success'}">${regressionReport.hasRegression ? '是' : '否'}</span></p>
  <p><strong>总回归数:</strong> ${regressionReport.totalRegressions}</p>
  <p><strong>严重程度:</strong> <span class="severity-${regressionReport.overallSeverity}">${regressionReport.overallSeverity}</span></p>
  
  ${regressionReport.recommendations.length > 0 ? `
  <div class="recommendations">
    <h4>💡 优化建议</h4>
    <ul>
      ${regressionReport.recommendations.map(rec => `<li>${rec}</li>`).join('')}
    </ul>
  </div>
  ` : ''}
</div>
      `.trim()
    }

    return {
      title: '⚡ 基准测试结果',
      content
    }
  }

  /**
   * 生成建议部分
   */
  private generateRecommendationsSection(report: ComprehensiveTestReport): ReportSection {
    const recommendations: string[] = []

    // 基于成功率的建议
    if (report.summary.overallSuccessRate < 95) {
      recommendations.push('⚠️ 总体成功率低于95%，建议检查错误日志并优化错误处理')
    }

    // 基于响应时间的建议
    if (report.summary.averageResponseTime > 500) {
      recommendations.push('⚠️ 平均响应时间超过500ms，建议进行性能优化')
    }

    // 基于严重问题的建议
    if (report.summary.criticalIssuesFound > 0) {
      recommendations.push('🚨 发现严重问题，建议优先解决')
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ 所有测试指标表现良好！')
    }

    const content = `
<ul class="recommendations-list">
  ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
</ul>

<style>
.recommendations-list {
  list-style: none;
  padding: 0;
}

.recommendations-list li {
  padding: 15px;
  margin: 10px 0;
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 4px;
}
</style>
    `.trim()

    return {
      title: '💡 优化建议',
      content
    }
  }

  /**
   * 导出为JSON
   */
  private exportAsJson(
    report: ComprehensiveTestReport,
    _options: ReportGenerationOptions
  ): string {
    return JSON.stringify(report, null, 2)
  }

  /**
   * 导出为Markdown
   */
  private exportAsMarkdown(
    report: ComprehensiveTestReport,
    _options: ReportGenerationOptions
  ): string {
    let markdown = `# ${report.title}\n\n`
    markdown += `**报告ID:** ${report.id}\n`
    markdown += `**生成时间:** ${report.generatedAt.toLocaleString()}\n\n`

    markdown += `## 📊 测试概览\n\n`
    markdown += `- 总测试数: ${report.summary.totalTests}\n`
    markdown += `- 总请求数: ${report.summary.totalRequests}\n`
    markdown += `- 平均响应时间: ${report.summary.averageResponseTime.toFixed(2)}ms\n`
    markdown += `- 总体成功率: ${report.summary.overallSuccessRate.toFixed(2)}%\n`
    markdown += `- 发现的严重问题: ${report.summary.criticalIssuesFound}\n\n`

    return markdown
  }

  /**
   * 计算总体统计
   */
  private calculateSummary(
    loadTestResults?: LoadTestResult[],
    concurrencyTestResults?: ConcurrencyTestResult[],
    benchmarkResults?: BenchmarkResult[]
  ): ComprehensiveTestReport['summary'] {
    let totalTests = 0
    let totalRequests = 0
    let totalResponseTime = 0
    let totalSuccessRate = 0
    let criticalIssuesFound = 0

    if (loadTestResults) {
      totalTests += loadTestResults.length
      loadTestResults.forEach(result => {
        totalRequests += result.overallStats.totalRequests
        totalResponseTime += result.overallStats.averageResponseTime
        totalSuccessRate += result.overallStats.successRate
      })
    }

    if (concurrencyTestResults) {
      totalTests += concurrencyTestResults.length
      concurrencyTestResults.forEach(result => {
        totalRequests += result.operationStats.totalOperations
        if (result.raceDetection) {
          criticalIssuesFound += result.raceDetection.deadlocks.length
          criticalIssuesFound += result.raceDetection.raceConditions.filter(
            rc => rc.severity === 'critical'
          ).length
        }
      })
    }

    if (benchmarkResults) {
      totalTests += benchmarkResults.length
      benchmarkResults.forEach(result => {
        result.scenarioResults.forEach(sr => {
          totalRequests += sr.iterations
          totalResponseTime += sr.metrics.averageResponseTime
          totalSuccessRate += sr.metrics.successRate
        })
        if (result.regressionReport?.hasRegression) {
          criticalIssuesFound += result.regressionReport.totalRegressions
        }
      })
    }

    return {
      totalTests,
      totalRequests,
      averageResponseTime: totalTests > 0 ? totalResponseTime / totalTests : 0,
      overallSuccessRate: totalTests > 0 ? totalSuccessRate / totalTests : 0,
      criticalIssuesFound
    }
  }

  /**
   * 获取响应时间类别
   */
  private getResponseTimeClass(time: number): string {
    if (time < 200) return 'success'
    if (time < 500) return 'warning'
    return 'danger'
  }

  /**
   * 获取成功率类别
   */
  private getSuccessRateClass(rate: number): string {
    if (rate >= 99) return 'success'
    if (rate >= 95) return 'warning'
    return 'danger'
  }

  /**
   * 获取HTML导出器
   */
  getHtmlExporter(): HtmlReportExporter {
    return this.htmlExporter
  }

  /**
   * 获取图表构建器
   */
  getChartBuilder(): ChartBuilder {
    return this.chartBuilder
  }
}
