#!/usr/bin/env node

/**
 * 低代码引擎代码质量检查系统
 * 首席测试架构师设计 - 企业级代码质量保障
 */

const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const { execSync } = require("child_process")
const CodeQualityHelpers = require("./code-quality-helpers")

class CodeQualityEngine {
  constructor() {
    this.helpers = new CodeQualityHelpers()
    this.qualityMetrics = {
      codeStyle: { score: 0, issues: [] },
      security: { score: 0, issues: [] },
      performance: { score: 0, issues: [] },
      maintainability: { score: 0, issues: [] },
      testCoverage: { score: 0, issues: [] },
    }
    this.generatedCodeStats = {
      totalFiles: 0,
      totalLines: 0,
      validationErrors: 0,
      qualityIssues: 0,
    }
  }

  /**
   * 运行完整的代码质量检查
   */
  async runFullQualityCheck() {
    console.log(chalk.yellow("🔍 启动低代码引擎代码质量检查..."))

    try {
      await this.checkCodeStyle()
      await this.checkSecurity()
      await this.checkPerformancePatterns()
      await this.checkMaintainability()
      await this.checkTestCoverage()
      await this.validateGeneratedCode()

      const report = this.generateQualityReport()
      this.saveReport(report)

      return report
    } catch (error) {
      console.log(chalk.red("❌ 质量检查失败:"), error.message)
      throw error
    }
  }

  /**
   * 代码风格检查
   */
  async checkCodeStyle() {
    console.log(chalk.blue("🎨 检查代码风格..."))

    try {
      const result = execSync("npx eslint src/SmartAbp.CodeGenerator --format json", {
        encoding: "utf8",
        stdio: "pipe",
      })

      const lintResults = JSON.parse(result)
      this.qualityMetrics.codeStyle.issues = lintResults
      this.qualityMetrics.codeStyle.score = this.helpers.calculateLintScore(lintResults)

      console.log(
        chalk.green(`✅ 代码风格检查完成 - 得分: ${this.qualityMetrics.codeStyle.score}/100`),
      )
    } catch (error) {
      console.log(chalk.red("❌ 代码风格检查失败"))
      this.qualityMetrics.codeStyle.score = 0
    }
  }

  /**
   * 安全漏洞检查
   */
  async checkSecurity() {
    console.log(chalk.blue("🔒 检查安全漏洞..."))

    try {
      const securityIssues = this.helpers.scanForSecurityIssues()
      this.qualityMetrics.security.issues = securityIssues
      this.qualityMetrics.security.score =
        securityIssues.length === 0 ? 100 : 80 - securityIssues.length * 10

      console.log(chalk.green(`✅ 安全检查完成 - 得分: ${this.qualityMetrics.security.score}/100`))
    } catch (error) {
      console.log(chalk.red("❌ 安全检查失败"))
      this.qualityMetrics.security.score = 0
    }
  }

  /**
   * 性能模式检查
   */
  async checkPerformancePatterns() {
    console.log(chalk.blue("⚡ 检查性能模式..."))

    try {
      const performanceIssues = this.helpers.scanForPerformanceIssues()
      this.qualityMetrics.performance.issues = performanceIssues
      this.qualityMetrics.performance.score =
        performanceIssues.length === 0 ? 100 : 85 - performanceIssues.length * 5

      console.log(
        chalk.green(`✅ 性能检查完成 - 得分: ${this.qualityMetrics.performance.score}/100`),
      )
    } catch (error) {
      console.log(chalk.red("❌ 性能检查失败"))
      this.qualityMetrics.performance.score = 0
    }
  }

  /**
   * 可维护性检查
   */
  async checkMaintainability() {
    console.log(chalk.blue("🛠️  检查可维护性..."))

    try {
      const maintainabilityIssues = this.helpers.scanForMaintainabilityIssues()
      this.qualityMetrics.maintainability.issues = maintainabilityIssues
      this.qualityMetrics.maintainability.score =
        maintainabilityIssues.length === 0 ? 100 : 90 - maintainabilityIssues.length * 2

      console.log(
        chalk.green(`✅ 可维护性检查完成 - 得分: ${this.qualityMetrics.maintainability.score}/100`),
      )
    } catch (error) {
      console.log(chalk.red("❌ 可维护性检查失败"))
      this.qualityMetrics.maintainability.score = 0
    }
  }

  /**
   * 测试覆盖率检查
   */
  async checkTestCoverage() {
    console.log(chalk.blue("📊 检查测试覆盖率..."))

    try {
      const coverageResult = execSync('npm run test:coverage -- --testNamePattern="zod-schemas"', {
        encoding: "utf8",
        stdio: "pipe",
      })

      const coverage = this.helpers.parseCoverage(coverageResult)
      this.qualityMetrics.testCoverage.score = coverage.statements
      this.qualityMetrics.testCoverage.issues = coverage.belowThreshold
        ? ["测试覆盖率低于阈值"]
        : []

      console.log(
        chalk.green(`✅ 测试覆盖率检查完成 - 得分: ${this.qualityMetrics.testCoverage.score}/100`),
      )
    } catch (error) {
      console.log(chalk.red("❌ 测试覆盖率检查失败"))
      this.qualityMetrics.testCoverage.score = 0
    }
  }

  /**
   * 验证生成的代码
   */
  async validateGeneratedCode() {
    console.log(chalk.blue("🔬 验证生成的代码质量..."))

    try {
      const generatedFiles = this.helpers.findGeneratedFiles()
      this.generatedCodeStats.totalFiles = generatedFiles.length

      let totalLines = 0
      let validationErrors = 0
      let qualityIssues = 0

      for (const file of generatedFiles) {
        const content = fs.readFileSync(file, "utf8")
        const lines = content.split("\n").length
        totalLines += lines

        if (this.helpers.hasQualityIssues(content)) {
          qualityIssues++
        }

        if (!this.helpers.validateCodeStructure(content)) {
          validationErrors++
        }
      }

      this.generatedCodeStats.totalLines = totalLines
      this.generatedCodeStats.validationErrors = validationErrors
      this.generatedCodeStats.qualityIssues = qualityIssues

      console.log(
        chalk.green(`✅ 生成代码验证完成 - 文件: ${generatedFiles.length}, 行数: ${totalLines}`),
      )
    } catch (error) {
      console.log(chalk.red("❌ 生成代码验证失败"))
    }
  }

  /**
   * 生成质量报告
   */
  generateQualityReport() {
    return this.helpers.generateQualityReport(this.qualityMetrics, this.generatedCodeStats)
  }

  /**
   * 保存报告到文件
   */
  saveReport(report) {
    const reportFile = this.helpers.saveReport(report)
    console.log(chalk.green(`📊 质量报告已保存: ${reportFile}`))
    return reportFile
  }
}

// 运行质量检查
const qualityEngine = new CodeQualityEngine()
qualityEngine.runFullQualityCheck()

module.exports = CodeQualityEngine
