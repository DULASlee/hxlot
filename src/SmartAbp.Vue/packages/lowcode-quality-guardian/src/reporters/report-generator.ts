/**
 * SmartAbp Quality Guardian - 报告生成器 v2.0
 * 生成多格式质量报告（JSON、HTML、Markdown、SARIF）
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import type { QualityReport, ReportFormat } from '../types/index.js';

export class ReportGenerator {
  private reportDir: string;

  constructor(reportDir: string) {
    this.reportDir = reportDir;
  }

  /**
   * 生成报告
   */
  async generate(
    report: QualityReport,
    formats: Array<ReportFormat['name']> = ['json', 'html', 'markdown']
  ): Promise<string[]> {
    // 确保报告目录存在
    await fs.ensureDir(this.reportDir);

    const generatedFiles: string[] = [];

    for (const format of formats) {
      try {
        const filePath = await this.generateFormat(report, format);
        generatedFiles.push(filePath);
      } catch (error) {
        console.error(chalk.red(`生成${format}报告失败:`), error);
      }
    }

    return generatedFiles;
  }

  /**
   * 生成指定格式的报告
   */
  private async generateFormat(report: QualityReport, format: ReportFormat['name']): Promise<string> {
    switch (format) {
      case 'json':
        return await this.generateJSON(report);
      case 'html':
        return await this.generateHTML(report);
      case 'markdown':
        return await this.generateMarkdown(report);
      case 'sarif':
        return await this.generateSARIF(report);
      default:
        throw new Error(`不支持的报告格式: ${format}`);
    }
  }

  /**
   * 生成JSON报告
   */
  private async generateJSON(report: QualityReport): Promise<string> {
    const timestamp = this.getTimestampString();
    const fileName = `quality-report-${timestamp}.json`;
    const filePath = path.join(this.reportDir, fileName);

    await fs.writeJson(filePath, report, { spaces: 2 });

    // 同时生成latest版本
    const latestPath = path.join(this.reportDir, 'quality-report-latest.json');
    await fs.writeJson(latestPath, report, { spaces: 2 });

    return filePath;
  }

  /**
   * 生成HTML报告
   */
  private async generateHTML(report: QualityReport): Promise<string> {
    const timestamp = this.getTimestampString();
    const fileName = `quality-report-${timestamp}.html`;
    const filePath = path.join(this.reportDir, fileName);

    const html = this.buildHTMLContent(report);
    await fs.writeFile(filePath, html, 'utf8');

    return filePath;
  }

  private buildHTMLContent(report: QualityReport): string {
    const scoreColor = report.scores.overall >= 90 ? '#28a745' :
      report.scores.overall >= 80 ? '#ffc107' : '#dc3545';

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.project.name} - 代码质量报告</title>
  <style>
    ${this.getHTMLStyles()}
  </style>
</head>
<body>
  <div class="container">
    ${this.buildHeader(report)}
    ${this.buildScoreSection(report, scoreColor)}
    ${this.buildDimensionsSection(report)}
    ${this.buildViolationsSection(report)}
    ${this.buildCheckersSection(report)}
    ${this.buildFooter(report)}
  </div>
  <script>
    ${this.getHTMLScripts()}
  </script>
</body>
</html>`;
  }

  private getHTMLStyles(): string {
    return `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        min-height: 100vh;
      }
      .container { 
        max-width: 1400px; 
        margin: 0 auto; 
      }
      .header {
        background: white;
        padding: 40px;
        border-radius: 12px 12px 0 0;
        box-shadow: 0 2px 20px rgba(0,0,0,0.1);
      }
      .header h1 {
        color: #333;
        font-size: 32px;
        margin-bottom: 10px;
      }
      .header .meta {
        color: #666;
        font-size: 14px;
      }
      .section {
        background: white;
        padding: 30px 40px;
        margin-top: 2px;
        box-shadow: 0 2px 20px rgba(0,0,0,0.1);
      }
      .section h2 {
        color: #333;
        font-size: 24px;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid #667eea;
      }
      .score-display {
        text-align: center;
        padding: 40px;
      }
      .score-number {
        font-size: 96px;
        font-weight: bold;
        line-height: 1;
      }
      .score-label {
        font-size: 24px;
        color: #666;
        margin-top: 10px;
      }
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }
      .metric-card {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #667eea;
        transition: transform 0.2s;
      }
      .metric-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      .metric-label {
        color: #666;
        font-size: 14px;
        margin-bottom: 8px;
      }
      .metric-value {
        font-size: 36px;
        font-weight: bold;
        color: #333;
      }
      .violation-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin: 20px 0;
      }
      .violation-card {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
      }
      .violation-card.p0 { border-left: 4px solid #dc3545; }
      .violation-card.p1 { border-left: 4px solid #ffc107; }
      .violation-card.p2 { border-left: 4px solid #17a2b8; }
      .violation-count {
        font-size: 48px;
        font-weight: bold;
        margin: 10px 0;
      }
      .violation-count.p0 { color: #dc3545; }
      .violation-count.p1 { color: #ffc107; }
      .violation-count.p2 { color: #17a2b8; }
      .table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      .table th,
      .table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }
      .table th {
        background: #f8f9fa;
        font-weight: 600;
        color: #333;
      }
      .table tr:hover {
        background: #f8f9fa;
      }
      .badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
      }
      .badge-success { background: #d4edda; color: #155724; }
      .badge-warning { background: #fff3cd; color: #856404; }
      .badge-danger { background: #f8d7da; color: #721c24; }
      .footer {
        background: white;
        padding: 30px 40px;
        margin-top: 2px;
        border-radius: 0 0 12px 12px;
        text-align: center;
        color: #666;
        font-size: 14px;
        box-shadow: 0 2px 20px rgba(0,0,0,0.1);
      }
      .progress-bar {
        width: 100%;
        height: 24px;
        background: #e9ecef;
        border-radius: 12px;
        overflow: hidden;
        margin: 8px 0;
      }
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        transition: width 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 8px;
        color: white;
        font-size: 12px;
        font-weight: bold;
      }
    `;
  }

  private buildHeader(report: QualityReport): string {
    return `
      <div class="header">
        <h1>🛡️ ${report.project.name} - 代码质量报告</h1>
        <div class="meta">
          <span>📅 生成时间: ${new Date(report.timestamp).toLocaleString('zh-CN')}</span>
          <span style="margin-left: 20px;">📁 项目路径: ${report.project.path}</span>
          ${report.project.version ? `<span style="margin-left: 20px;">📦 版本: ${report.project.version}</span>` : ''}
        </div>
      </div>
    `;
  }

  private buildScoreSection(report: QualityReport, color: string): string {
    const gateStatus = report.gate.passed ?
      '<span style="color: #28a745;">✅ 通过</span>' :
      '<span style="color: #dc3545;">❌ 失败</span>';

    return `
      <div class="section">
        <div class="score-display">
          <div class="score-number" style="color: ${color};">${report.scores.overall}</div>
          <div class="score-label">综合质量评分 / 100</div>
          <div style="margin-top: 20px; font-size: 18px;">
            质量门禁: ${gateStatus} (${report.gate.mode}模式)
          </div>
        </div>
      </div>
    `;
  }

  private buildDimensionsSection(report: QualityReport): string {
    const dimensions = [
      { name: '正确性', key: 'correctness', icon: '✓' },
      { name: '安全性', key: 'security', icon: '🔒' },
      { name: '可维护性', key: 'maintainability', icon: '🔧' },
      { name: '架构合规', key: 'architecture', icon: '🏗️' },
      { name: '代码风格', key: 'style', icon: '🎨' },
      { name: '性能', key: 'performance', icon: '⚡' }
    ];

    const cards = dimensions.map(dim => {
      const score = report.scores.dimensions[dim.key as keyof typeof report.scores.dimensions];
      const color = score >= 90 ? '#28a745' : score >= 80 ? '#ffc107' : '#dc3545';

      return `
        <div class="metric-card">
          <div class="metric-label">${dim.icon} ${dim.name}</div>
          <div class="metric-value" style="color: ${color};">${score}</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${score}%;">${score}%</div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="section">
        <h2>📊 质量维度评分</h2>
        <div class="metrics-grid">
          ${cards}
        </div>
      </div>
    `;
  }

  private buildViolationsSection(report: QualityReport): string {
    const p0 = report.violations.P0.length;
    const p1 = report.violations.P1.length;
    const p2 = report.violations.P2.length;

    return `
      <div class="section">
        <h2>🚨 违规问题统计</h2>
        <div class="violation-stats">
          <div class="violation-card p0">
            <div class="metric-label">P0 阻断性问题</div>
            <div class="violation-count p0">${p0}</div>
            <div>${p0 === 0 ? '✅ 无问题' : '❌ 需立即修复'}</div>
          </div>
          <div class="violation-card p1">
            <div class="metric-label">P1 严重问题</div>
            <div class="violation-count p1">${p1}</div>
            <div>${p1 === 0 ? '✅ 无问题' : '⚠️ 建议修复'}</div>
          </div>
          <div class="violation-card p2">
            <div class="metric-label">P2 一般问题</div>
            <div class="violation-count p2">${p2}</div>
            <div>${p2 <= 10 ? '✅ 可接受' : '⚠️ 较多'}</div>
          </div>
        </div>
        ${this.buildTopViolationsTable(report)}
      </div>
    `;
  }

  private buildTopViolationsTable(report: QualityReport): string {
    const topViolations = report.scores.breakdown.deductionDetails.slice(0, 10);

    if (topViolations.length === 0) {
      return '<p style="text-align: center; color: #28a745; margin-top: 20px;">🎉 太棒了！没有发现任何质量问题！</p>';
    }

    const rows = topViolations.map(detail => `
      <tr>
        <td><code>${detail.rule}</code></td>
        <td><span class="badge badge-${detail.level === 'P0' ? 'danger' : detail.level === 'P1' ? 'warning' : 'info'}">${detail.level}</span></td>
        <td style="text-align: center;">${detail.count}</td>
        <td style="text-align: center;">${detail.points}</td>
      </tr>
    `).join('');

    return `
      <h3 style="margin-top: 30px; color: #333;">📋 问题排行榜 (Top 10)</h3>
      <table class="table">
        <thead>
          <tr>
            <th>规则</th>
            <th>级别</th>
            <th style="text-align: center;">数量</th>
            <th style="text-align: center;">扣分</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  private buildCheckersSection(report: QualityReport): string {
    const checkerRows = Object.entries(report.checkers).map(([_name, result]) => {
      const status = result.passed ?
        '<span class="badge badge-success">✅ 通过</span>' :
        '<span class="badge badge-danger">❌ 失败</span>';

      const violations = result.violations.length;

      return `
        <tr>
          <td>${result.checker}</td>
          <td>${status}</td>
          <td style="text-align: center;">${result.filesChecked}</td>
          <td style="text-align: center;">${violations}</td>
          <td style="text-align: center;">${result.duration}ms</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="section">
        <h2>🔍 检查器执行情况</h2>
        <table class="table">
          <thead>
            <tr>
              <th>检查器</th>
              <th>状态</th>
              <th style="text-align: center;">检查文件数</th>
              <th style="text-align: center;">发现问题数</th>
              <th style="text-align: center;">耗时</th>
            </tr>
          </thead>
          <tbody>
            ${checkerRows}
          </tbody>
        </table>
      </div>
    `;
  }

  private buildFooter(report: QualityReport): string {
    return `
      <div class="footer">
        <p><strong>${report.metadata.generatedBy}</strong></p>
        <p style="margin-top: 10px;">
          Node.js ${report.metadata.nodeVersion} | ${report.metadata.platform}
        </p>
        <p style="margin-top: 10px; font-size: 12px; color: #999;">
          报告生成时间: ${new Date(report.timestamp).toLocaleString('zh-CN')} | 
          总耗时: ${report.statistics.totalDuration}ms
        </p>
      </div>
    `;
  }

  private getHTMLScripts(): string {
    return `
      // 可以添加交互功能，如展开/折叠详情等
      console.log('Quality Report loaded successfully');
    `;
  }

  /**
   * 生成Markdown报告
   */
  private async generateMarkdown(report: QualityReport): Promise<string> {
    const timestamp = this.getTimestampString();
    const fileName = `quality-report-${timestamp}.md`;
    const filePath = path.join(this.reportDir, fileName);

    const markdown = this.buildMarkdownContent(report);
    await fs.writeFile(filePath, markdown, 'utf8');

    return filePath;
  }

  private buildMarkdownContent(report: QualityReport): string {
    const gateStatus = report.gate.passed ? '✅ 通过' : '❌ 失败';
    const scoreGrade = this.getScoreGrade(report.scores.overall);

    let md = `# ${report.project.name} - 代码质量报告\n\n`;
    md += `**生成时间**: ${new Date(report.timestamp).toLocaleString('zh-CN')}\n\n`;
    md += `**项目路径**: ${report.project.path}\n\n`;
    if (report.project.version) {
      md += `**项目版本**: ${report.project.version}\n\n`;
    }
    md += `---\n\n`;

    // 质量评分
    md += `## 📊 质量评分\n\n`;
    md += `- **综合评分**: ${report.scores.overall}/100 (${scoreGrade})\n`;
    md += `- **质量门禁**: ${gateStatus} (${report.gate.mode}模式)\n`;
    if (!report.gate.passed && report.gate.reason) {
      md += `- **失败原因**: ${report.gate.reason}\n`;
    }
    md += `\n`;

    // 维度评分
    md += `## 🎯 维度评分\n\n`;
    md += `| 维度 | 评分 | 状态 |\n`;
    md += `|------|------|------|\n`;

    const dimensions = [
      { name: '正确性', key: 'correctness' },
      { name: '安全性', key: 'security' },
      { name: '可维护性', key: 'maintainability' },
      { name: '架构合规', key: 'architecture' },
      { name: '代码风格', key: 'style' },
      { name: '性能', key: 'performance' }
    ];

    dimensions.forEach(dim => {
      const score = report.scores.dimensions[dim.key as keyof typeof report.scores.dimensions];
      const status = score >= 90 ? '✅ 优秀' : score >= 80 ? '⚠️ 良好' : '❌ 需改进';
      md += `| ${dim.name} | ${score}/100 | ${status} |\n`;
    });
    md += `\n`;

    // 违规统计
    md += `## 🚨 问题统计\n\n`;
    md += `- **P0 阻断性问题**: ${report.violations.P0.length}个\n`;
    md += `- **P1 严重问题**: ${report.violations.P1.length}个\n`;
    md += `- **P2 一般问题**: ${report.violations.P2.length}个\n\n`;

    // Top问题
    if (report.scores.breakdown.deductionDetails.length > 0) {
      md += `### 📋 问题排行榜\n\n`;
      md += `| 规则 | 级别 | 数量 | 扣分 |\n`;
      md += `|------|------|------|------|\n`;

      report.scores.breakdown.deductionDetails.slice(0, 10).forEach(detail => {
        md += `| \`${detail.rule}\` | ${detail.level} | ${detail.count} | ${detail.points} |\n`;
      });
      md += `\n`;
    }

    // 检查器执行情况
    md += `## 🔍 检查器执行情况\n\n`;
    md += `| 检查器 | 状态 | 文件数 | 问题数 | 耗时 |\n`;
    md += `|--------|------|--------|--------|------|\n`;

    Object.entries(report.checkers).forEach(([_name, result]) => {
      const status = result.passed ? '✅' : '❌';
      md += `| ${result.checker} | ${status} | ${result.filesChecked} | ${result.violations.length} | ${result.duration}ms |\n`;
    });
    md += `\n`;

    // 统计信息
    md += `## 📈 统计信息\n\n`;
    md += `- 检查文件数: ${report.statistics.filesChecked}个\n`;
    md += `- 总耗时: ${report.statistics.totalDuration}ms\n\n`;

    // Footer
    md += `---\n\n`;
    md += `*报告由 ${report.metadata.generatedBy} 自动生成*\n`;

    return md;
  }

  /**
   * 生成SARIF报告（Static Analysis Results Interchange Format）
   */
  private async generateSARIF(report: QualityReport): Promise<string> {
    const timestamp = this.getTimestampString();
    const fileName = `quality-report-${timestamp}.sarif`;
    const filePath = path.join(this.reportDir, fileName);

    const sarif = this.buildSARIFContent(report);
    await fs.writeJson(filePath, sarif, { spaces: 2 });

    return filePath;
  }

  private buildSARIFContent(report: QualityReport): any {
    const allViolations = [
      ...report.violations.P0,
      ...report.violations.P1,
      ...report.violations.P2
    ];

    const results = allViolations.map(v => ({
      ruleId: v.rule,
      level: v.level === 'P0' ? 'error' : v.level === 'P1' ? 'warning' : 'note',
      message: {
        text: v.message
      },
      locations: v.file ? [{
        physicalLocation: {
          artifactLocation: {
            uri: v.file
          },
          region: {
            startLine: v.line || 1,
            startColumn: v.column || 1
          }
        }
      }] : []
    }));

    return {
      version: '2.1.0',
      $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      runs: [{
        tool: {
          driver: {
            name: 'SmartAbp Quality Guardian',
            version: '2.0.0',
            informationUri: 'https://github.com/SmartAbp/quality-guardian'
          }
        },
        results
      }]
    };
  }

  private getTimestampString(): string {
    return new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] || 'unknown';
  }

  private getScoreGrade(score: number): string {
    if (score >= 95) return '🏆 优秀';
    if (score >= 90) return '✅ 良好';
    if (score >= 85) return '⚠️ 可接受';
    if (score >= 80) return '⚠️ 需改进';
    return '❌ 较差';
  }
}

