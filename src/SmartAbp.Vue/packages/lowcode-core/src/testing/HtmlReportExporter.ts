/**
 * 🔥 HTML报告导出器
 * 
 * 功能：
 * 1. 生成HTML格式测试报告
 * 2. 嵌入图表和样式
 * 3. 支持报告模板
 * 4. 支持导出文件
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import { getGlobalLogger } from '@smartabp/lowcode-shared'
import { ChartBuilder, type ChartConfig } from './ChartBuilder'

const logger = getGlobalLogger()

/**
 * 报告部分
 */
export interface ReportSection {
  title: string
  content: string
  charts?: Array<{ id: string; config: ChartConfig }>
}

/**
 * HTML报告配置
 */
export interface HtmlReportConfig {
  title: string
  subtitle?: string
  author?: string
  generatedAt: Date
  sections: ReportSection[]
  includeCss?: boolean
  includeChartJs?: boolean
}

/**
 * HTML报告导出器
 */
export class HtmlReportExporter {
  private chartBuilder: ChartBuilder

  constructor() {
    this.chartBuilder = new ChartBuilder()
  }

  /**
   * 生成HTML报告
   */
  generateHtmlReport(config: HtmlReportConfig): string {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(config.title)}</title>
  ${config.includeCss !== false ? this.getDefaultCss() : ''}
  ${config.includeChartJs !== false ? this.getChartJsScript() : ''}
</head>
<body>
  <div class="container">
    ${this.generateHeader(config)}
    ${this.generateSections(config.sections)}
    ${this.generateFooter(config)}
  </div>
  ${config.includeChartJs !== false ? this.generateChartScripts(config.sections) : ''}
</body>
</html>
    `.trim()

    return html
  }

  /**
   * 生成报告头部
   */
  private generateHeader(config: HtmlReportConfig): string {
    return `
<header class="report-header">
  <h1>${this.escapeHtml(config.title)}</h1>
  ${config.subtitle ? `<p class="subtitle">${this.escapeHtml(config.subtitle)}</p>` : ''}
  <div class="metadata">
    ${config.author ? `<span class="author">作者: ${this.escapeHtml(config.author)}</span>` : ''}
    <span class="generated-at">生成时间: ${this.formatDate(config.generatedAt)}</span>
  </div>
</header>
    `.trim()
  }

  /**
   * 生成报告章节
   */
  private generateSections(sections: ReportSection[]): string {
    return sections.map((section, index) => `
<section class="report-section" id="section-${index}">
  <h2>${this.escapeHtml(section.title)}</h2>
  <div class="section-content">
    ${section.content}
  </div>
  ${section.charts ? this.generateChartsHtml(section.charts) : ''}
</section>
    `.trim()).join('\n')
  }

  /**
   * 生成图表HTML
   */
  private generateChartsHtml(charts: Array<{ id: string; config: ChartConfig }>): string {
    return charts.map(chart => `
<div class="chart-container">
  <canvas id="${chart.id}"></canvas>
</div>
    `.trim()).join('\n')
  }

  /**
   * 生成图表脚本
   */
  private generateChartScripts(sections: ReportSection[]): string {
    const allCharts = sections
      .filter(s => s.charts)
      .flatMap(s => s.charts!)

    if (allCharts.length === 0) {
      return ''
    }

    const scripts = allCharts.map(chart => `
  new Chart(document.getElementById('${chart.id}'), ${this.chartBuilder.toJson(chart.config)});
    `.trim()).join('\n')

    return `
<script>
  window.addEventListener('DOMContentLoaded', function() {
    ${scripts}
  });
</script>
    `.trim()
  }

  /**
   * 生成报告尾部
   */
  private generateFooter(_config: HtmlReportConfig): string {
    return `
<footer class="report-footer">
  <p>SmartAbp 低代码生成器 - 压力测试报告</p>
  <p>© ${new Date().getFullYear()} SmartAbp Team. All rights reserved.</p>
</footer>
    `.trim()
  }

  /**
   * 获取默认CSS样式
   */
  private getDefaultCss(): string {
    return `
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f5f5f5;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .report-header {
    text-align: center;
    padding: 40px 20px;
    border-bottom: 2px solid #4CAF50;
    margin-bottom: 40px;
  }

  .report-header h1 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 10px;
  }

  .report-header .subtitle {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 20px;
  }

  .report-header .metadata {
    display: flex;
    justify-content: center;
    gap: 20px;
    font-size: 0.9rem;
    color: #888;
  }

  .report-section {
    margin-bottom: 40px;
    padding: 20px;
    border-radius: 8px;
    background-color: #f9f9f9;
  }

  .report-section h2 {
    font-size: 1.8rem;
    color: #34495e;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ddd;
  }

  .section-content {
    margin-bottom: 20px;
  }

  .chart-container {
    margin: 20px 0;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }

  table th,
  table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  table th {
    background-color: #4CAF50;
    color: white;
    font-weight: 600;
  }

  table tr:hover {
    background-color: #f5f5f5;
  }

  .metric {
    display: inline-block;
    padding: 8px 16px;
    margin: 5px;
    border-radius: 4px;
    background-color: #e3f2fd;
    color: #1976d2;
    font-weight: 500;
  }

  .metric.success {
    background-color: #e8f5e9;
    color: #388e3c;
  }

  .metric.warning {
    background-color: #fff3e0;
    color: #f57c00;
  }

  .metric.danger {
    background-color: #ffebee;
    color: #d32f2f;
  }

  .report-footer {
    text-align: center;
    padding: 20px;
    margin-top: 40px;
    border-top: 1px solid #ddd;
    color: #888;
    font-size: 0.9rem;
  }

  @media print {
    body {
      background-color: #fff;
    }

    .container {
      box-shadow: none;
    }

    .report-section {
      page-break-inside: avoid;
    }
  }
</style>
    `.trim()
  }

  /**
   * 获取Chart.js脚本标签
   */
  private getChartJsScript(): string {
    return `
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    `.trim()
  }

  /**
   * 转义HTML特殊字符
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, m => map[m] || m)
  }

  /**
   * 格式化日期
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date)
  }

  /**
   * 导出为文件
   */
  exportToFile(html: string, filename: string = 'test-report.html'): void {
    if (typeof window === 'undefined') {
      logger.warn('⚠️ 导出文件功能仅在浏览器环境中可用')
      return
    }

    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)

      logger.info('✅ 报告已导出', { filename })
    } catch (error) {
      logger.error('❌ 导出报告失败', error)
      throw error
    }
  }

  /**
   * 在新窗口中预览报告
   */
  preview(html: string): void {
    if (typeof window === 'undefined') {
      logger.warn('⚠️ 预览功能仅在浏览器环境中可用')
      return
    }

    try {
      const previewWindow = window.open('', '_blank')
      if (previewWindow) {
        previewWindow.document.write(html)
        previewWindow.document.close()
        logger.info('✅ 报告预览已打开')
      } else {
        logger.warn('⚠️ 无法打开预览窗口，可能被浏览器拦截')
      }
    } catch (error) {
      logger.error('❌ 预览报告失败', error)
      throw error
    }
  }
}
