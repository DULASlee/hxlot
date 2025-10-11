/**
 * SmartAbp Quality Guardian - 报告生成器
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import type { QualityReport, ReportFormat } from '../types'

export { ReportFormat } from '../types'

export class ReportGenerator {
  generate(report: QualityReport, format: ReportFormat = 'console'): void {
    switch (format) {
      case 'console':
        this.generateConsoleReport(report)
        break
      case 'json':
        this.generateJsonReport(report)
        break
      case 'html':
        this.generateHtmlReport(report)
        break
      case 'markdown':
        this.generateMarkdownReport(report)
        break
    }
  }

  private generateConsoleReport(report: QualityReport): void {
    console.log('\n' + '━'.repeat(60))
    console.log('📊 质量检查报告')
    console.log('━'.repeat(60))
    console.log(`\n项目: ${report.projectName}`)
    console.log(`时间: ${new Date(report.timestamp).toLocaleString('zh-CN')}`)
    console.log(`模式: ${report.mode}`)
    console.log(`耗时: ${report.totalDuration}ms`)

    console.log('\n质量评分:')
    console.log(`  总分: ${report.score.overall}/100`)
    console.log(`  架构: ${report.score.dimensions.architecture}/100`)
    console.log(`  类型: ${report.score.dimensions.typescript}/100`)
    console.log(`  安全: ${report.score.dimensions.security}/100`)
    console.log(`  性能: ${report.score.dimensions.performance}/100`)

    console.log('\n违规统计:')
    console.log(`  P0 (阻断): ${report.summary.P0}`)
    console.log(`  P1 (警告): ${report.summary.P1}`)
    console.log(`  P2 (建议): ${report.summary.P2}`)
    console.log(`  WARNING: ${report.summary.WARNING}`)
    console.log(`  总计: ${report.summary.total}`)

    console.log('\n检查器结果:')
    report.results.forEach(result => {
      const status = result.passed ? '✅' : '❌'
      console.log(`  ${status} ${result.checker}: ${result.violations.length}个违规`)
    })

    if (report.passed) {
      console.log('\n✅ 质量检查通过！')
    } else {
      console.log('\n❌ 质量检查失败！')
      console.log('请修复所有P0违规项。')
    }

    console.log('━'.repeat(60))
  }

  private generateJsonReport(report: QualityReport): void {
    const outputPath = join(process.cwd(), 'reports/quality/quality-report.json')
    mkdirSync(dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8')
    console.log(`\n📄 JSON报告已生成: ${outputPath}`)
  }

  private generateHtmlReport(report: QualityReport): void {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Quality Report - ${report.projectName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { background: #007bff; color: white; padding: 20px; }
    .score { font-size: 48px; font-weight: bold; }
    .result { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
    .passed { background: #d4edda; }
    .failed { background: #f8d7da; }
  </style>
</head>
<body>
  <div class="header">
    <h1>质量检查报告</h1>
    <div class="score">${report.score.overall}/100</div>
  </div>
  <div class="content">
    <h2>项目信息</h2>
    <p>项目: ${report.projectName}</p>
    <p>时间: ${report.timestamp}</p>
    <h2>检查结果</h2>
    ${report.results.map(r => `
      <div class="result ${r.passed ? 'passed' : 'failed'}">
        <strong>${r.checker}</strong>: ${r.violations.length}个违规
      </div>
    `).join('')}
  </div>
</body>
</html>
    `

    const outputPath = join(process.cwd(), 'reports/quality/quality-report.html')
    mkdirSync(dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, html, 'utf8')
    console.log(`\n📄 HTML报告已生成: ${outputPath}`)
  }

  private generateMarkdownReport(report: QualityReport): void {
    const md = `
# 质量检查报告

## 项目信息
- 项目: ${report.projectName}
- 时间: ${report.timestamp}
- 模式: ${report.mode}

## 质量评分

总分: **${report.score.overall}/100**

| 维度 | 评分 |
|-----|-----|
| 架构 | ${report.score.dimensions.architecture}/100 |
| 类型 | ${report.score.dimensions.typescript}/100 |
| 安全 | ${report.score.dimensions.security}/100 |
| 性能 | ${report.score.dimensions.performance}/100 |

## 违规统计

- P0 (阻断): ${report.summary.P0}
- P1 (警告): ${report.summary.P1}
- P2 (建议): ${report.summary.P2}
- WARNING: ${report.summary.WARNING}
- 总计: ${report.summary.total}

## 检查器结果

${report.results.map(r => `### ${r.checker}\n\n${r.passed ? '✅ 通过' : '❌ 失败'} - ${r.violations.length}个违规\n`).join('\n')}
    `

    const outputPath = join(process.cwd(), 'reports/quality/quality-report.md')
    mkdirSync(dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, md, 'utf8')
    console.log(`\n📄 Markdown报告已生成: ${outputPath}`)
  }
}

