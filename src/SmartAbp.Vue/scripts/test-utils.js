/**
 * 测试工具库 - 提供丰富的测试辅助功能
 * 首席测试架构师设计
 */

const fs = require("fs")
const path = require("path")
const chalk = require("chalk")

class TestUtils {
  /**
   * 生成测试数据
   */
  static generateTestData(schema, count = 1) {
    const results = []
    for (let i = 0; i < count; i++) {
      const data = {}

      switch (schema) {
        case "property":
          data.name = `testProperty${i}`
          data.type = "String"
          data.displayName = `测试属性 ${i}`
          data.description = `这是第 ${i} 个测试属性`
          break

        case "entity":
          data.name = `TestEntity${i}`
          data.displayName = `测试实体 ${i}`
          data.properties = [
            {
              name: "id",
              type: "Guid",
              isPrimaryKey: true,
            },
            {
              name: "name",
              type: "String",
              required: true,
            },
          ]
          break

        case "module":
          data.systemName = "SmartAbp"
          data.name = `TestModule${i}`
          data.displayName = `测试模块 ${i}`
          data.entities = [
            {
              name: "User",
              displayName: "用户",
              properties: [
                {
                  name: "id",
                  type: "Guid",
                  isPrimaryKey: true,
                },
              ],
            },
          ]
          break

        default:
          throw new Error(`Unknown schema: ${schema}`)
      }

      results.push(data)
    }

    return count === 1 ? results[0] : results
  }

  /**
   * 性能测试工具
   */
  static async measurePerformance(fn, iterations = 1000) {
    const start = process.hrtime.bigint()

    for (let i = 0; i < iterations; i++) {
      await fn()
    }

    const end = process.hrtime.bigint()
    const duration = Number(end - start) / 1000000 // 转换为毫秒
    const avgDuration = duration / iterations

    return {
      totalDuration: duration,
      avgDuration,
      iterations,
      opsPerSecond: (iterations / (duration / 1000)).toFixed(2),
    }
  }

  /**
   * 内存使用分析
   */
  static measureMemoryUsage() {
    const memoryUsage = process.memoryUsage()
    return {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
    }
  }

  /**
   * 测试覆盖率分析
   */
  static analyzeCoverage(coverageData) {
    const summary = {
      statements: { covered: 0, total: 0, percentage: 0 },
      branches: { covered: 0, total: 0, percentage: 0 },
      functions: { covered: 0, total: 0, percentage: 0 },
      lines: { covered: 0, total: 0, percentage: 0 },
    }

    // 这里可以添加具体的覆盖率分析逻辑
    return summary
  }

  /**
   * 测试报告生成器
   */
  static generateTestReport(results, options = {}) {
    const { outputFile = "test-report.html", title = "测试报告", theme = "light" } = options

    const report = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .test-suite { margin: 20px 0; }
        .passed { color: green; }
        .failed { color: red; }
        .coverage { background: #e8f4f8; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="summary">
        <h2>测试摘要</h2>
        <p>总测试数: ${results.summary.totalTests}</p>
        <p class="passed">通过: ${results.summary.passedTests}</p>
        <p class="failed">失败: ${results.summary.failedTests}</p>
        <p>成功率: ${results.summary.successRate}%</p>
    </div>
    
    ${Object.entries(results.detailed)
      .map(
        ([suite, data]) => `
        <div class="test-suite">
            <h3>${suite.toUpperCase()} 测试</h3>
            <p>通过: ${data.passed} | 失败: ${data.failed} | 总数: ${data.total}</p>
        </div>
    `,
      )
      .join("")}
    
    <div class="coverage">
        <h3>代码覆盖率</h3>
        <p>语句覆盖率: ${results.coverage.statements || 0}%</p>
    </div>
</body>
</html>
    `

    fs.writeFileSync(outputFile, report)
    return outputFile
  }

  /**
   * 测试数据验证器
   */
  static validateTestData(data, schema) {
    const errors = []

    // 这里可以根据不同的schema添加验证逻辑
    switch (schema) {
      case "property":
        if (!data.name || typeof data.name !== "string") {
          errors.push("属性名称必须为字符串")
        }
        if (!data.type) {
          errors.push("属性类型必须指定")
        }
        break

      case "entity":
        if (!data.name) {
          errors.push("实体名称必须指定")
        }
        if (!data.properties || !Array.isArray(data.properties)) {
          errors.push("实体必须包含属性数组")
        }
        break

      default:
        errors.push("未知的schema类型")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * 随机测试数据生成
   */
  static generateRandomTestData(template, count = 10) {
    const results = []

    for (let i = 0; i < count; i++) {
      const data = { ...template }

      // 为每个字段生成随机值
      Object.keys(data).forEach((key) => {
        if (typeof data[key] === "string" && data[key].includes("{{random}}")) {
          data[key] = data[key].replace("{{random}}", Math.random().toString(36).substring(2, 8))
        }
      })

      results.push(data)
    }

    return results
  }

  /**
   * 测试环境检查
   */
  static checkTestEnvironment() {
    const checks = {
      nodeVersion: process.version,
      npmVersion: "", // 可以通过execSync获取
      testFiles: 0,
      coverageEnabled: true,
    }

    // 检查测试文件数量
    const testDir = path.join(process.cwd(), "src")
    if (fs.existsSync(testDir)) {
      const files = this.findFiles(testDir, /\.test\.(js|ts|tsx)$/)
      checks.testFiles = files.length
    }

    return checks
  }

  /**
   * 递归查找文件
   */
  static findFiles(dir, pattern) {
    let results = []
    const files = fs.readdirSync(dir)

    files.forEach((file) => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        results = results.concat(this.findFiles(filePath, pattern))
      } else if (pattern.test(file)) {
        results.push(filePath)
      }
    })

    return results
  }

  /**
   * 测试结果比较
   */
  static compareTestResults(current, previous) {
    const changes = {
      totalTests: current.summary.totalTests - previous.summary.totalTests,
      passedTests: current.summary.passedTests - previous.summary.passedTests,
      failedTests: current.summary.failedTests - previous.summary.failedTests,
      successRate: current.summary.successRate - previous.summary.successRate,
      coverage: current.coverage.statements - previous.coverage.statements,
    }

    return changes
  }
}

module.exports = TestUtils
