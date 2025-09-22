#!/usr/bin/env node

/**
 * 自动化测试系统主脚本
 * 首席测试架构师设计 - 完整的端到端测试解决方案
 */

import { execSync, spawn } from "child_process"
import fs from "fs"
import path from "path"
import chalk from "chalk"

class TestAutomationSystem {
  constructor() {
    this.testResults = {
      unit: { passed: 0, failed: 0, total: 0 },
      integration: { passed: 0, failed: 0, total: 0 },
      e2e: { passed: 0, failed: 0, total: 0 },
      performance: { passed: 0, failed: 0, total: 0 },
    }
    this.coverageData = {}
    this.performanceMetrics = {}
  }

  /**
   * 运行单元测试
   */
  async runUnitTests() {
    console.log(chalk.blue("🚀 运行单元测试..."))

    try {
      const result = execSync("npm run test:coverage", {
        encoding: "utf8",
        stdio: "pipe",
      })

      this.parseVitestOutput(result)
      console.log(chalk.green("✅ 单元测试完成"))
    } catch (error) {
      console.log(chalk.red("❌ 单元测试失败"))
      this.parseVitestOutput(error.stdout)
    }
  }

  /**
   * 运行集成测试
   */
  async runIntegrationTests() {
    console.log(chalk.blue("🔗 运行集成测试..."))

    try {
      // 这里可以添加特定的集成测试命令
      const result = execSync('npm run test:run -- --testNamePattern="integration"', {
        encoding: "utf8",
        stdio: "pipe",
      })

      this.parseTestOutput(result, "integration")
      console.log(chalk.green("✅ 集成测试完成"))
    } catch (error) {
      console.log(chalk.red("❌ 集成测试失败"))
      this.parseTestOutput(error.stdout, "integration")
    }
  }

  /**
   * 运行端到端测试
   */
  async runE2ETests() {
    console.log(chalk.blue("🌐 运行端到端测试..."))

    try {
      const result = execSync("npm run cypress:run", {
        encoding: "utf8",
        stdio: "pipe",
      })

      this.parseCypressOutput(result)
      console.log(chalk.green("✅ 端到端测试完成"))
    } catch (error) {
      console.log(chalk.red("❌ 端到端测试失败"))
      this.parseCypressOutput(error.stdout)
    }
  }

  /**
   * 运行性能测试
   */
  async runPerformanceTests() {
    console.log(chalk.blue("⚡ 运行性能测试..."))

    try {
      const result = execSync("npm run perf:analyze", {
        encoding: "utf8",
        stdio: "pipe",
      })

      this.parsePerformanceOutput(result)
      console.log(chalk.green("✅ 性能测试完成"))
    } catch (error) {
      console.log(chalk.red("❌ 性能测试失败"))
      this.parsePerformanceOutput(error.stdout)
    }
  }

  /**
   * 解析Vitest输出
   */
  parseVitestOutput(output) {
    const lines = output.split("\n")
    let currentSuite = "unit"

    for (const line of lines) {
      if (line.includes("Tests") && line.includes("passed") && line.includes("failed")) {
        const match = line.match(/(\d+) passed.*?(\d+) failed/)
        if (match) {
          this.testResults[currentSuite].passed = parseInt(match[1])
          this.testResults[currentSuite].failed = parseInt(match[2])
          this.testResults[currentSuite].total =
            this.testResults[currentSuite].passed + this.testResults[currentSuite].failed
        }
      }

      // 解析覆盖率数据
      if (line.includes("Coverage")) {
        const coverageMatch = line.match(/Statements\s+:\s+([\d.]+)%/)
        if (coverageMatch) {
          this.coverageData.statements = parseFloat(coverageMatch[1])
        }
      }
    }
  }

  /**
   * 解析Cypress输出
   */
  parseCypressOutput(output) {
    const lines = output.split("\n")

    for (const line of lines) {
      if (line.includes("Running:") && line.includes("spec")) {
        this.testResults.e2e.total++
      } else if (line.includes("✓") || line.includes("passed")) {
        this.testResults.e2e.passed++
      } else if (line.includes("✗") || line.includes("failed")) {
        this.testResults.e2e.failed++
      }
    }
  }

  /**
   * 解析性能测试输出
   */
  parsePerformanceOutput(output) {
    const lines = output.split("\n")

    for (const line of lines) {
      if (line.includes("First Contentful Paint")) {
        const match = line.match(/(\d+\.?\d*)ms/)
        if (match) {
          this.performanceMetrics.fcp = parseFloat(match[1])
        }
      } else if (line.includes("Largest Contentful Paint")) {
        const match = line.match(/(\d+\.?\d*)ms/)
        if (match) {
          this.performanceMetrics.lcp = parseFloat(match[1])
        }
      }
    }
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: Object.values(this.testResults).reduce((sum, suite) => sum + suite.total, 0),
        passedTests: Object.values(this.testResults).reduce((sum, suite) => sum + suite.passed, 0),
        failedTests: Object.values(this.testResults).reduce((sum, suite) => sum + suite.failed, 0),
        successRate: (
          (Object.values(this.testResults).reduce((sum, suite) => sum + suite.passed, 0) /
            Object.values(this.testResults).reduce((sum, suite) => sum + suite.total, 0)) *
          100
        ).toFixed(2),
      },
      detailed: this.testResults,
      coverage: this.coverageData,
      performance: this.performanceMetrics,
      status: this.testResults.e2e.failed === 0 ? "PASSED" : "FAILED",
    }

    // 保存报告到文件
    const reportDir = path.join(process.cwd(), "test-reports")
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    const reportFile = path.join(
      reportDir,
      `test-report-${new Date().toISOString().replace(/:/g, "-")}.json`,
    )
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))

    // 控制台输出
    console.log("\n" + chalk.yellow("📊 测试报告摘要:"))
    console.log(chalk.cyan(`总测试数: ${report.summary.totalTests}`))
    console.log(chalk.green(`通过: ${report.summary.passedTests}`))
    console.log(chalk.red(`失败: ${report.summary.failedTests}`))
    console.log(chalk.blue(`成功率: ${report.summary.successRate}%`))
    console.log(chalk.magenta(`覆盖率: ${this.coverageData.statements || 0}%`))
    console.log(chalk.cyan(`状态: ${report.status}`))
    console.log(chalk.yellow(`报告文件: ${reportFile}`))

    return report
  }

  /**
   * 发送通知
   */
  async sendNotification(report) {
    // 这里可以集成Slack、Email、Teams等通知
    console.log(chalk.blue("📧 发送测试通知..."))

    if (report.status === "FAILED") {
      console.log(chalk.red("⚠️  测试失败，需要立即关注!"))
    } else {
      console.log(chalk.green("✅ 所有测试通过!"))
    }
  }

  /**
   * 主运行方法
   */
  async run() {
    console.log(chalk.yellow("🎯 启动自动化测试系统..."))
    console.log(chalk.yellow("📋 测试架构: 单元测试 + 集成测试 + E2E测试 + 性能测试"))

    try {
      await this.runUnitTests()
      await this.runIntegrationTests()
      await this.runE2ETests()
      await this.runPerformanceTests()

      const report = this.generateReport()
      await this.sendNotification(report)

      // 根据测试结果退出码
      process.exit(report.status === "PASSED" ? 0 : 1)
    } catch (error) {
      console.log(chalk.red("💥 测试系统执行失败:"), error.message)
      process.exit(1)
    }
  }
}

// 运行测试系统
const testSystem = new TestAutomationSystem()
testSystem.run()

export default TestAutomationSystem
