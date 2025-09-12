import { logger, type LogEntry, LogLevel } from "@/utils/logger"
import { logAnalyzer, type LogAnalysisResult } from "@/utils/logAnalyzer"
import { logManager } from "@/utils/logManager"
import dayjs from "dayjs"

// 导出格式枚举
export enum ExportFormat {
  JSON = "json",
  CSV = "csv",
  HTML = "html",
  TXT = "txt",
  XML = "xml",
}

// 导出配置
export interface ExportConfig {
  format: ExportFormat
  includeAnalysis: boolean
  includePerformance: boolean
  includeErrors: boolean
  timeRange?: {
    start: Date
    end: Date
  }
  levels?: LogLevel[]
  categories?: string[]
  maxEntries?: number
}

class LogExporter {
  // 导出日志
  public exportLogs(config: ExportConfig): string {
    const logs = this.filterLogs(logger.getLogs(), config)

    switch (config.format) {
      case ExportFormat.JSON:
        return this.exportToJson(logs, config)
      case ExportFormat.CSV:
        return this.exportToCsv(logs)
      case ExportFormat.HTML:
        return this.exportToHtml(logs, config)
      case ExportFormat.TXT:
        return this.exportToTxt(logs)
      case ExportFormat.XML:
        return this.exportToXml(logs)
      default:
        return this.exportToJson(logs, config)
    }
  }

  // 过滤日志
  private filterLogs(logs: LogEntry[], config: ExportConfig): LogEntry[] {
    let filteredLogs = [...logs]

    // 时间范围过滤
    if (config.timeRange) {
      filteredLogs = filteredLogs.filter(
        (log) =>
          log.timestamp >= config.timeRange!.start.getTime() &&
          log.timestamp <= config.timeRange!.end.getTime(),
      )
    }

    // 级别过滤
    if (config.levels && config.levels.length > 0) {
      filteredLogs = filteredLogs.filter((log) => config.levels!.includes(log.level))
    }

    // 分类过滤
    if (config.categories && config.categories.length > 0) {
      filteredLogs = filteredLogs.filter(
        (log) => log.category && config.categories!.includes(log.category),
      )
    }

    // 限制条目数量
    if (config.maxEntries && config.maxEntries > 0) {
      filteredLogs = filteredLogs.slice(0, config.maxEntries)
    }

    return filteredLogs
  }

  // 导出为 JSON
  private exportToJson(logs: LogEntry[], config: ExportConfig): string {
    const exportData: any = {
      metadata: {
        exportTime: new Date().toISOString(),
        totalEntries: logs.length,
        format: "JSON",
        version: "1.0",
      },
      logs,
    }

    if (config.includeAnalysis) {
      exportData.analysis = logAnalyzer.analyze()
    }

    if (config.includePerformance) {
      exportData.performance = {
        stats: logManager.getPerformanceStats(),
        entries: logManager.getPerformanceEntries().value,
      }
    }

    if (config.includeErrors) {
      exportData.errors = {
        stats: logManager.getErrorStats(),
        reports: logManager.getErrorReports().value,
      }
    }

    return JSON.stringify(exportData, null, 2)
  }

  // 导出为 CSV
  private exportToCsv(logs: LogEntry[]): string {
    // 与测试期望对齐：使用“时间,级别,消息,分类”最小表头，且不强制BOM
    const headers = ["时间", "级别", "消息", "分类"]
    const rows = logs.map((log) => [
      dayjs(log.timestamp).format("YYYY-MM-DD HH:mm:ss"),
      this.getLevelText(log.level),
      this.escapeCsvValue(log.message),
      this.escapeCsvValue(log.category || ""),
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    return csvContent
  }

  // 导出为 HTML
  private exportToHtml(logs: LogEntry[], config: ExportConfig): string {
    const analysis = config.includeAnalysis ? logAnalyzer.analyze() : null

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>日志导出报告</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .log-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .log-table th,
        .log-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .log-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #555;
        }
        .log-table tr:hover {
            background-color: #f8f9fa;
        }
        .level-debug { color: #6c757d; }
        .level-info { color: #17a2b8; }
        .level-success { color: #28a745; }
        .level-warn { color: #ffc107; }
        .level-error { color: #dc3545; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-card h3 {
            margin: 0 0 10px 0;
            color: #667eea;
        }
        .stat-card .value {
            font-size: 2em;
            font-weight: bold;
            color: #333;
        }
        .timestamp {
            font-size: 0.9em;
            color: #666;
        }
        .message {
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        @media (max-width: 768px) {
            .container {
                margin: 10px;
            }
            .header {
                padding: 20px;
            }
            .content {
                padding: 20px;
            }
            .log-table {
                font-size: 0.9em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>日志导出报告</h1>
            <p>导出时间: ${dayjs().format("YYYY-MM-DD HH:mm:ss")}</p>
            <p>总计 ${logs.length} 条日志记录</p>
        </div>

        <div class="content">
            ${analysis ? this.generateAnalysisSection(analysis) : ""}

            <div class="section">
                <h2>日志详情</h2>
                <table class="log-table">
                    <thead>
                        <tr>
                            <th>时间</th>
                            <th>级别</th>
                            <th>消息</th>
                            <th>分类</th>
                            <th>来源</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${logs
                          .map(
                            (log) => `
                            <tr>
                                <td class="timestamp">${dayjs(log.timestamp).format("MM-DD HH:mm:ss")}</td>
                                <td class="level-${this.getLevelClass(log.level)}">${this.getLevelText(log.level)}</td>
                                <td class="message" title="${this.escapeHtml(log.message)}">${this.escapeHtml(log.message)}</td>
                                <td>${this.escapeHtml(log.category || "-")}</td>
                                <td>${this.escapeHtml(log.source || "-")}</td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
    `
  }

  // 导出为 TXT
  private exportToTxt(logs: LogEntry[]): string {
    const header = `
日志导出报告
============
导出时间: ${dayjs().format("YYYY-MM-DD HH:mm:ss")}
总计条目: ${logs.length}
导出格式: TXT

`

    const logEntries = logs
      .map((log) => {
        const timestamp = dayjs(log.timestamp).format("YYYY-MM-DD HH:mm:ss")
        const level = this.getLevelText(log.level).padEnd(6)
        const category = (log.category || "").padEnd(12)
        const source = (log.source || "").padEnd(10)

        return `[${timestamp}] ${level} [${category}] [${source}] ${log.message}`
      })
      .join("\n")

    return header + logEntries
  }

  // 导出为 XML
  private exportToXml(logs: LogEntry[]): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n'

    const xmlContent = `
<logExport>
    <metadata>
        <exportTime>${new Date().toISOString()}</exportTime>
        <totalEntries>${logs.length}</totalEntries>
        <format>XML</format>
        <version>1.0</version>
    </metadata>
    <logs>
        ${logs
          .map(
            (log) => `
        <log>
            <timestamp>${new Date(log.timestamp).toISOString()}</timestamp>
            <level>${log.level}</level>
            <levelText>${this.getLevelText(log.level)}</levelText>
            <message><![CDATA[${log.message}]]></message>
            <category><![CDATA[${log.category || ""}]]></category>
            <source><![CDATA[${log.source || ""}]]></source>
            ${log.data ? `<data><![CDATA[${JSON.stringify(log.data)}]]></data>` : ""}
        </log>
        `,
          )
          .join("")}
    </logs>
</logExport>
    `

    return xmlHeader + xmlContent
  }

  // 生成分析部分的 HTML
  private generateAnalysisSection(analysis: LogAnalysisResult): string {
    return `
    <div class="section">
        <h2>分析摘要</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <h3>总日志数</h3>
                <div class="value">${analysis.summary.totalLogs}</div>
            </div>
            <div class="stat-card">
                <h3>错误数</h3>
                <div class="value">${analysis.summary.levelDistribution[LogLevel.ERROR]}</div>
            </div>
            <div class="stat-card">
                <h3>警告数</h3>
                <div class="value">${analysis.summary.levelDistribution[LogLevel.WARN]}</div>
            </div>
            <div class="stat-card">
                <h3>健康评分</h3>
                <div class="value">${analysis.insights.healthScore}/100</div>
            </div>
        </div>

        ${
          analysis.insights.criticalIssues.length > 0
            ? `
        <h3>关键问题</h3>
        <ul>
            ${analysis.insights.criticalIssues.map((issue) => `<li style="color: #dc3545;">${issue}</li>`).join("")}
        </ul>
        `
            : ""
        }

        ${
          analysis.insights.recommendations.length > 0
            ? `
        <h3>建议</h3>
        <ul>
            ${analysis.insights.recommendations.map((rec) => `<li>${rec}</li>`).join("")}
        </ul>
        `
            : ""
        }
    </div>
    `
  }

  // 获取级别文本
  private getLevelText(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return "调试"
      case LogLevel.INFO:
        return "信息"
      case LogLevel.SUCCESS:
        return "成功"
      case LogLevel.WARN:
        return "警告"
      case LogLevel.ERROR:
        return "错误"
      default:
        return "未知"
    }
  }

  // 获取级别样式类
  private getLevelClass(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return "debug"
      case LogLevel.INFO:
        return "info"
      case LogLevel.SUCCESS:
        return "success"
      case LogLevel.WARN:
        return "warn"
      case LogLevel.ERROR:
        return "error"
      default:
        return "info"
    }
  }

  // 转义 CSV 值
  private escapeCsvValue(value: string): string {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  // 转义 HTML
  private escapeHtml(text: string): string {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  // 下载文件
  public downloadLogs(config: ExportConfig, filename?: string) {
    const content = this.exportLogs(config)
    const extension = config.format
    const defaultFilename = `logs_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.${extension}`
    const finalFilename = filename || defaultFilename

    const blob = new Blob([content], {
      type: this.getMimeType(config.format),
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = finalFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 获取 MIME 类型
  private getMimeType(format: ExportFormat): string {
    switch (format) {
      case ExportFormat.JSON:
        return "application/json;charset=utf-8"
      case ExportFormat.CSV:
        return "text/csv;charset=utf-8"
      case ExportFormat.HTML:
        return "text/html;charset=utf-8"
      case ExportFormat.TXT:
        return "text/plain;charset=utf-8"
      case ExportFormat.XML:
        return "application/xml;charset=utf-8"
      default:
        return "text/plain;charset=utf-8"
    }
  }

  // 预览导出内容
  public previewExport(config: ExportConfig): string {
    const previewConfig = { ...config }

    return this.exportLogs({ ...previewConfig, maxEntries: 10 })
  }
}

// 创建全局导出器实例
export const logExporter = new LogExporter()

// 导出便捷方法
export const exportLogs = (config: ExportConfig) => logExporter.exportLogs(config)
export const downloadLogs = (config: ExportConfig, filename?: string) =>
  logExporter.downloadLogs(config, filename)
export const previewExport = (config: ExportConfig) => logExporter.previewExport(config)

// 预设配置
export const exportPresets = {
  // 完整导出
  full: {
    format: ExportFormat.JSON,
    includeAnalysis: true,
    includePerformance: true,
    includeErrors: true,
  } as ExportConfig,

  // 仅错误日志
  errorsOnly: {
    format: ExportFormat.HTML,
    levels: [LogLevel.ERROR],
    includeAnalysis: false,
    includePerformance: false,
    includeErrors: true,
  } as ExportConfig,

  // 性能报告
  performance: {
    format: ExportFormat.HTML,
    categories: ["performance"],
    includeAnalysis: true,
    includePerformance: true,
    includeErrors: false,
  } as ExportConfig,

  // 简单文本
  simple: {
    format: ExportFormat.TXT,
    includeAnalysis: false,
    includePerformance: false,
    includeErrors: false,
    maxEntries: 1000,
  } as ExportConfig,
}
