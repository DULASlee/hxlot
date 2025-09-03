import { logger, LogLevel, type LogEntry } from './logger'
import { logManager } from './logManager'
import dayjs from 'dayjs'

// 分析结果接口
export interface LogAnalysisResult {
  summary: {
    totalLogs: number
    timeRange: {
      start: Date
      end: Date
      duration: number
    }
    levelDistribution: Record<LogLevel, number>
    categoryDistribution: Map<string, number>
    sourceDistribution: Map<string, number>
  }
  trends: {
    hourlyDistribution: Map<number, number>
    dailyDistribution: Map<string, number>
    errorTrends: Array<{
      time: Date
      count: number
    }>
  }
  performance: {
    slowOperations: Array<{
      name: string
      duration: number
      category: string
      timestamp: Date
    }>
    averageResponseTime: number
    performanceScore: number
  }
  insights: {
    criticalIssues: string[]
    recommendations: string[]
    healthScore: number
  }
}

// 时间范围枚举
export enum TimeRange {
  LAST_HOUR = 'last_hour',
  LAST_DAY = 'last_day',
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
  CUSTOM = 'custom'
}

// 分析配置
export interface AnalysisConfig {
  timeRange: TimeRange
  customStart?: Date
  customEnd?: Date
  includeDebug: boolean
  minSeverity: LogLevel
  categories?: string[]
  sources?: string[]
}

class LogAnalyzer {
  private config: AnalysisConfig = {
    timeRange: TimeRange.LAST_DAY,
    includeDebug: false,
    minSeverity: LogLevel.INFO
  }

  // 设置分析配置
  setConfig(config: Partial<AnalysisConfig>) {
    this.config = { ...this.config, ...config }
  }

  // 获取时间范围
  private getTimeRange(): { start: Date; end: Date } {
    const now = new Date()
    let start: Date
    let end: Date = now

    switch (this.config.timeRange) {
      case TimeRange.LAST_HOUR:
        start = dayjs(now).subtract(1, 'hour').toDate()
        break
      case TimeRange.LAST_DAY:
        start = dayjs(now).subtract(1, 'day').toDate()
        break
      case TimeRange.LAST_WEEK:
        start = dayjs(now).subtract(1, 'week').toDate()
        break
      case TimeRange.LAST_MONTH:
        start = dayjs(now).subtract(1, 'month').toDate()
        break
      case TimeRange.CUSTOM:
        start = this.config.customStart || dayjs(now).subtract(1, 'day').toDate()
        end = this.config.customEnd || now
        break
      default:
        start = dayjs(now).subtract(1, 'day').toDate()
    }

    return { start, end }
  }

  // 过滤日志
  private filterLogs(logs: LogEntry[]): LogEntry[] {
    const { start, end } = this.getTimeRange()

    return logs.filter(log => {
      // 时间范围过滤
      if (log.timestamp < start.getTime() || log.timestamp > end.getTime()) {
        return false
      }

      // 级别过滤
      if (log.level < this.config.minSeverity) {
        return false
      }

      // 调试日志过滤
      if (!this.config.includeDebug && log.level === LogLevel.DEBUG) {
        return false
      }

      // 分类过滤
      if (this.config.categories && this.config.categories.length > 0) {
        if (!log.category || !this.config.categories.includes(log.category)) {
          return false
        }
      }

      // 来源过滤
      if (this.config.sources && this.config.sources.length > 0) {
        if (!log.source || !this.config.sources.includes(log.source)) {
          return false
        }
      }

      return true
    })
  }

  // 分析日志
  analyze(): LogAnalysisResult {
    const logs = this.filterLogs(logger.getLogs())
    const performanceEntries = logManager.getPerformanceEntries().value

    return {
      summary: this.analyzeSummary(logs),
      trends: this.analyzeTrends(logs),
      performance: this.analyzePerformance(performanceEntries),
      insights: this.generateInsights(logs, performanceEntries)
    }
  }

  // 分析摘要
  private analyzeSummary(logs: LogEntry[]) {
    const { start, end } = this.getTimeRange()

    // 级别分布
    const levelDistribution: Record<LogLevel, number> = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0,
      [LogLevel.SUCCESS]: 0
    }

    // 分类分布
    const categoryDistribution = new Map<string, number>()

    // 来源分布
    const sourceDistribution = new Map<string, number>()

    logs.forEach(log => {
      // 统计级别
      levelDistribution[log.level]++

      // 统计分类
      if (log.category) {
        const count = categoryDistribution.get(log.category) || 0
        categoryDistribution.set(log.category, count + 1)
      }

      // 统计来源
      if (log.source) {
        const count = sourceDistribution.get(log.source) || 0
        sourceDistribution.set(log.source, count + 1)
      }
    })

    return {
      totalLogs: logs.length,
      timeRange: {
        start,
        end,
        duration: end.getTime() - start.getTime()
      },
      levelDistribution,
      categoryDistribution,
      sourceDistribution
    }
  }

  // 分析趋势
  private analyzeTrends(logs: LogEntry[]) {
    // 按小时分布
    const hourlyDistribution = new Map<number, number>()
    for (let i = 0; i < 24; i++) {
      hourlyDistribution.set(i, 0)
    }

    // 按日分布
    const dailyDistribution = new Map<string, number>()

    // 错误趋势
    const errorTrends: Array<{ time: Date; count: number }> = []
    const errorsByHour = new Map<string, number>()

    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours()
      const day = dayjs(log.timestamp).format('YYYY-MM-DD')
      const hourKey = dayjs(log.timestamp).format('YYYY-MM-DD HH:00')

      // 小时分布
      const hourCount = hourlyDistribution.get(hour) || 0
      hourlyDistribution.set(hour, hourCount + 1)

      // 日分布
      const dayCount = dailyDistribution.get(day) || 0
      dailyDistribution.set(day, dayCount + 1)

      // 错误趋势
      if (log.level === LogLevel.ERROR) {
        const errorCount = errorsByHour.get(hourKey) || 0
        errorsByHour.set(hourKey, errorCount + 1)
      }
    })

    // 转换错误趋势数据
    errorsByHour.forEach((count, timeKey) => {
      errorTrends.push({
        time: dayjs(timeKey).toDate(),
        count
      })
    })

    errorTrends.sort((a, b) => a.time.getTime() - b.time.getTime())

    return {
      hourlyDistribution,
      dailyDistribution,
      errorTrends
    }
  }

  // 分析性能
  private analyzePerformance(performanceEntries: any[]) {
    const completedEntries = performanceEntries.filter(e => e.duration !== undefined)

    if (completedEntries.length === 0) {
      return {
        slowOperations: [],
        averageResponseTime: 0,
        performanceScore: 100
      }
    }

    // 慢操作（超过1秒）
    const slowOperations = completedEntries
      .filter(e => e.duration > 1000)
      .map(e => ({
        name: e.name,
        duration: e.duration,
        category: e.category,
        timestamp: new Date(e.startTime)
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)

    // 平均响应时间
    const totalDuration = completedEntries.reduce((sum, e) => sum + e.duration, 0)
    const averageResponseTime = totalDuration / completedEntries.length

    // 性能评分（基于平均响应时间和慢操作数量）
    let performanceScore = 100
    if (averageResponseTime > 500) performanceScore -= 20
    if (averageResponseTime > 1000) performanceScore -= 30
    if (slowOperations.length > 5) performanceScore -= 20
    if (slowOperations.length > 10) performanceScore -= 30

    performanceScore = Math.max(0, performanceScore)

    return {
      slowOperations,
      averageResponseTime,
      performanceScore
    }
  }

  // 生成洞察
  private generateInsights(logs: LogEntry[], performanceEntries: any[]) {
    const criticalIssues: string[] = []
    const recommendations: string[] = []

    // 分析错误
    const errors = logs.filter(log => log.level === LogLevel.ERROR)
    const warnings = logs.filter(log => log.level === LogLevel.WARN)

    if (errors.length > 10) {
      criticalIssues.push(`检测到 ${errors.length} 个错误，需要立即关注`)
    }

    if (warnings.length > 20) {
      criticalIssues.push(`检测到 ${warnings.length} 个警告，建议及时处理`)
    }

    // 分析性能
    const slowOps = performanceEntries.filter(e => e.duration && e.duration > 1000)
    if (slowOps.length > 5) {
      criticalIssues.push(`检测到 ${slowOps.length} 个慢操作，影响用户体验`)
    }

    // 生成建议
    if (errors.length > 0) {
      recommendations.push('优先处理错误日志，提高系统稳定性')
    }

    if (warnings.length > 10) {
      recommendations.push('关注警告信息，预防潜在问题')
    }

    if (slowOps.length > 0) {
      recommendations.push('优化慢操作，提升系统性能')
    }

    const errorRate = logs.length > 0 ? (errors.length / logs.length) * 100 : 0
    if (errorRate > 5) {
      recommendations.push('错误率过高，建议进行系统健康检查')
    }

    // 计算健康评分
    let healthScore = 100
    if (errorRate > 1) healthScore -= errorRate * 5
    if (warnings.length > 10) healthScore -= 10
    if (slowOps.length > 3) healthScore -= 15

    healthScore = Math.max(0, Math.min(100, healthScore))

    return {
      criticalIssues,
      recommendations,
      healthScore
    }
  }

  // 获取热点问题
  getHotspots(logs: LogEntry[]) {
    const errorMessages = new Map<string, number>()
    const warningMessages = new Map<string, number>()

    logs.forEach(log => {
      if (log.level === LogLevel.ERROR) {
        const count = errorMessages.get(log.message) || 0
        errorMessages.set(log.message, count + 1)
      } else if (log.level === LogLevel.WARN) {
        const count = warningMessages.get(log.message) || 0
        warningMessages.set(log.message, count + 1)
      }
    })

    const topErrors = Array.from(errorMessages.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([message, count]) => ({ message, count, type: 'error' }))

    const topWarnings = Array.from(warningMessages.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([message, count]) => ({ message, count, type: 'warning' }))

    return [...topErrors, ...topWarnings]
  }

  // 导出分析报告
  exportReport(format: 'json' | 'html' | 'csv' = 'json'): string {
    const analysis = this.analyze()

    switch (format) {
      case 'json':
        return JSON.stringify(analysis, null, 2)
      case 'html':
        return this.generateHtmlReport(analysis)
      case 'csv':
        return this.generateCsvReport(analysis)
      default:
        return JSON.stringify(analysis, null, 2)
    }
  }

  // 生成 HTML 报告
  private generateHtmlReport(analysis: LogAnalysisResult): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>日志分析报告</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; }
        .metric { display: inline-block; margin: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .critical { color: #f56c6c; }
        .warning { color: #e6a23c; }
        .success { color: #67c23a; }
    </style>
</head>
<body>
    <div class="header">
        <h1>日志分析报告</h1>
        <p>生成时间: ${new Date().toLocaleString()}</p>
        <p>分析时间范围: ${analysis.summary.timeRange.start.toLocaleString()} - ${analysis.summary.timeRange.end.toLocaleString()}</p>
    </div>

    <div class="section">
        <h2>摘要</h2>
        <div class="metric">总日志数: ${analysis.summary.totalLogs}</div>
        <div class="metric">错误数: ${analysis.summary.levelDistribution[LogLevel.ERROR]}</div>
        <div class="metric">警告数: ${analysis.summary.levelDistribution[LogLevel.WARN]}</div>
        <div class="metric">健康评分: ${analysis.insights.healthScore}/100</div>
    </div>

    <div class="section">
        <h2>关键问题</h2>
        ${analysis.insights.criticalIssues.map(issue => `<p class="critical">• ${issue}</p>`).join('')}
    </div>

    <div class="section">
        <h2>建议</h2>
        ${analysis.insights.recommendations.map(rec => `<p>• ${rec}</p>`).join('')}
    </div>

    <div class="section">
        <h2>性能分析</h2>
        <div class="metric">平均响应时间: ${analysis.performance.averageResponseTime.toFixed(2)}ms</div>
        <div class="metric">性能评分: ${analysis.performance.performanceScore}/100</div>
        <div class="metric">慢操作数: ${analysis.performance.slowOperations.length}</div>
    </div>
</body>
</html>
    `
  }

  // 生成 CSV 报告
  private generateCsvReport(analysis: LogAnalysisResult): string {
    const headers = ['指标', '数值', '说明']
    const rows = [
      ['总日志数', analysis.summary.totalLogs.toString(), '分析时间范围内的总日志条数'],
      ['错误数', analysis.summary.levelDistribution[LogLevel.ERROR].toString(), '错误级别日志数量'],
      ['警告数', analysis.summary.levelDistribution[LogLevel.WARN].toString(), '警告级别日志数量'],
      ['健康评分', analysis.insights.healthScore.toString(), '系统健康评分(0-100)'],
      ['性能评分', analysis.performance.performanceScore.toString(), '性能评分(0-100)'],
      ['平均响应时间', analysis.performance.averageResponseTime.toFixed(2), '毫秒'],
      ['慢操作数', analysis.performance.slowOperations.length.toString(), '响应时间超过1秒的操作数']
    ]

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  }
}

// 创建全局分析器实例
export const logAnalyzer = new LogAnalyzer()

// 导出便捷方法
export const analyzeCurrentLogs = () => logAnalyzer.analyze()
export const setAnalysisConfig = (config: Partial<AnalysisConfig>) => logAnalyzer.setConfig(config)
export const exportAnalysisReport = (format: 'json' | 'html' | 'csv' = 'json') => logAnalyzer.exportReport(format)
