/**
 * SmartAbp Quality Guardian - 质量检查核心引擎
 */

import {
  ArchitectureChecker,
  TypeScriptChecker,
  SecurityChecker,
  PerformanceChecker,
  CodeSmellChecker,
  DuplicationChecker,
  ComplexityChecker,
  CodeGenChecker,
  LowCodeChecker,
  SmartAbpChecker
} from '../checkers'
import { ReportGenerator } from '../reporters/ReportGenerator'
import type { QualityConfig, QualityReport, IChecker, CheckResult, QualityScore } from '../types'

export class QualityEngine {
  private config: Required<QualityConfig>
  private checkers: IChecker[]

  constructor(config?: Partial<QualityConfig>) {
    // 默认配置
    this.config = {
      projectRoot: config?.projectRoot || process.cwd(),
      mode: config?.mode || 'full',
      checkers: config?.checkers || ['all'],
      thresholds: {
        overall: 80,
        ...config?.thresholds
      },
      reportFormat: config?.reportFormat || 'console',
      outputDir: config?.outputDir || 'reports/quality',
      autoFix: config?.autoFix || false,
      skipGitSync: config?.skipGitSync || false,
      verbose: config?.verbose || false
    }

    // 初始化检查器
    this.checkers = this.initializeCheckers()
  }

  private initializeCheckers(): IChecker[] {
    const { projectRoot, checkers } = this.config
    const allCheckers = [
      new ArchitectureChecker(projectRoot),
      new TypeScriptChecker(projectRoot),
      new SecurityChecker(projectRoot),
      new PerformanceChecker(),
      new CodeSmellChecker(),
      new DuplicationChecker(),
      new ComplexityChecker(),
      new CodeGenChecker(projectRoot),
      new LowCodeChecker(projectRoot),
      new SmartAbpChecker(projectRoot)
    ]

    if (checkers.includes('all')) {
      return allCheckers
    }

    // 根据配置筛选检查器
    return allCheckers.filter(checker =>
      checkers.includes(checker.name.toLowerCase())
    )
  }

  async run(): Promise<QualityReport> {
    const startTime = Date.now()

    console.log('\n🔥 SmartAbp Quality Guardian v1.0')
    console.log('='.repeat(60))
    console.log(`📂 项目目录: ${this.config.projectRoot}`)
    console.log(`📊 检查模式: ${this.config.mode}`)
    console.log(`🔍 启用检查器: ${this.checkers.length}个`)
    console.log('='.repeat(60))

    // 执行所有检查器
    const results: CheckResult[] = []
    for (const checker of this.checkers) {
      try {
        const result = await checker.check()
        results.push(result)
      } catch (error: any) {
        console.error(`\n❌ ${checker.name} 检查器执行失败:`, error.message)
        results.push({
          checker: checker.name,
          passed: false,
          duration: 0,
          violations: [
            {
              rule: `${checker.name.toLowerCase()}.execution-error`,
              level: 'P0',
              file: 'unknown',
              message: `检查器执行失败: ${error.message}`
            }
          ]
        })
      }
    }

    // 生成质量评分
    const score = this.calculateScore(results)

    // 计算总违规数
    const summary = {
      P0: 0,
      P1: 0,
      P2: 0,
      WARNING: 0,
      total: 0
    }

    results.forEach(result => {
      result.violations.forEach(v => {
        if (v.level === 'P0') summary.P0++
        else if (v.level === 'P1') summary.P1++
        else if (v.level === 'P2') summary.P2++
        else if (v.level === 'WARNING') summary.WARNING++
        summary.total++
      })
    })

    // 生成报告
    const report: QualityReport = {
      timestamp: new Date().toISOString(),
      projectName: this.getProjectName(),
      mode: this.config.mode,
      passed: summary.P0 === 0 && score.overall >= (this.config.thresholds.overall || 80),
      score,
      results,
      summary,
      totalDuration: Date.now() - startTime
    }

    // 输出报告
    const reporter = new ReportGenerator()
    reporter.generate(report, this.config.reportFormat)

    return report
  }

  private calculateScore(results: CheckResult[]): QualityScore {
    // 简化的评分算法
    const dimensions = {
      architecture: 100,
      typescript: 100,
      security: 100,
      performance: 100,
      codeSmell: 100,
      complexity: 100
    }

    // 根据违规数量扣分
    results.forEach(result => {
      const checkerName = result.checker.toLowerCase()
      const p0Count = result.violations.filter(v => v.level === 'P0').length

      if (checkerName === 'architecture') {
        dimensions.architecture = Math.max(0, 100 - p0Count * 10)
      } else if (checkerName === 'typescript') {
        dimensions.typescript = Math.max(0, 100 - p0Count * 10)
      } else if (checkerName === 'security') {
        dimensions.security = Math.max(0, 100 - p0Count * 10)
      }
      // 其他维度同理
    })

    // 计算总分（加权平均）
    const overall = Math.round(
      (dimensions.architecture * 0.3 +
        dimensions.typescript * 0.3 +
        dimensions.security * 0.2 +
        dimensions.performance * 0.1 +
        dimensions.codeSmell * 0.05 +
        dimensions.complexity * 0.05)
    )

    return {
      overall,
      dimensions
    }
  }

  private getProjectName(): string {
    try {
      const packageJson = require(`${this.config.projectRoot}/package.json`)
      return packageJson.name || 'unknown'
    } catch {
      return 'unknown'
    }
  }
}

