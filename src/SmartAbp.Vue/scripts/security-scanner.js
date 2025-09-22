#!/usr/bin/env node

/**
 * 低代码引擎安全扫描工具
 * 首席测试架构师设计 - 企业级安全检测
 */

const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const { execSync } = require("child_process")

class SecurityScanner {
  constructor() {
    this.securityIssues = []
    this.scanConfig = {
      directories: [
        "src/SmartAbp.CodeGenerator",
        "src/SmartAbp.Application",
        "src/SmartAbp.Application.Contracts",
        "src/SmartAbp.Domain",
        "src/SmartAbp.EntityFrameworkCore",
      ],
      filePatterns: [/.cs$/, /.ts$/, /.js$/],
      excludedPatterns: ["**/bin/**", "**/obj/**", "**/node_modules/**", "**/TestResults/**"],
    }
  }

  /**
   * 运行完整安全扫描
   */
  async runFullSecurityScan() {
    console.log(chalk.yellow("🔒 启动安全扫描..."))

    try {
      await this.scanForSqlInjection()
      await this.scanForHardcodedSecrets()
      await this.scanForXssVulnerabilities()
      await this.scanForInsecureDeserialization()
      await this.scanForAuthenticationIssues()

      const report = this.generateSecurityReport()
      this.saveReport(report)

      return report
    } catch (error) {
      console.log(chalk.red("❌ 安全扫描失败:"), error.message)
      throw error
    }
  }

  /**
   * 扫描SQL注入漏洞
   */
  async scanForSqlInjection() {
    console.log(chalk.blue("🛡️  扫描SQL注入漏洞..."))

    const patterns = [
      /\.ExecuteSqlRaw\(/,
      /\.ExecuteSqlRawAsync\(/,
      /\.FromSql\(/,
      /\.FromSqlRaw\(/,
      /string\.Format.*SELECT/,
      /\+.*SELECT/,
      /SqlParameter.*AddWithValue/,
      /SqlCommand.*Parameters\.Add/,
    ]

    this.scanFiles((content, filePath) => {
      patterns.forEach((pattern) => {
        if (pattern.test(content)) {
          this.securityIssues.push({
            type: "SQL_INJECTION",
            severity: "HIGH",
            message: "潜在的SQL注入风险",
            file: filePath,
            pattern: pattern.toString(),
            recommendation: "使用参数化查询或Entity Framework Core的安全方法",
          })
        }
      })
    })

    console.log(
      chalk.green(
        `✅ SQL注入扫描完成 - 发现 ${this.getIssuesByType("SQL_INJECTION").length} 个问题`,
      ),
    )
  }

  /**
   * 扫描硬编码的敏感信息
   */
  async scanForHardcodedSecrets() {
    console.log(chalk.blue("🔑 扫描硬编码的敏感信息..."))

    const patterns = [
      /password.*=.*['"].*['"]/i,
      /apiKey.*=.*['"].*['"]/i,
      /secret.*=.*['"].*['"]/i,
      /connectionString.*=.*['"][^'"]*['"]/i,
      /token.*=.*['"].*['"]/i,
      /credential.*=.*['"].*['"]/i,
    ]

    this.scanFiles((content, filePath) => {
      patterns.forEach((pattern) => {
        if (pattern.test(content)) {
          this.securityIssues.push({
            type: "HARDCODED_SECRET",
            severity: "HIGH",
            message: "硬编码的敏感信息",
            file: filePath,
            pattern: pattern.toString(),
            recommendation: "使用配置管理或密钥管理服务存储敏感信息",
          })
        }
      })
    })

    console.log(
      chalk.green(
        `✅ 敏感信息扫描完成 - 发现 ${this.getIssuesByType("HARDCODED_SECRET").length} 个问题`,
      ),
    )
  }

  /**
   * 扫描XSS漏洞
   */
  async scanForXssVulnerabilities() {
    console.log(chalk.blue("🛡️  扫描XSS漏洞..."))

    const patterns = [
      /Response\.Write\(.*Request\./,
      /<%=.*Request\./,
      /innerHTML.*=.*location\./,
      /document\.write\(.*location\./,
      /eval\(.*Request\./,
    ]

    this.scanFiles((content, filePath) => {
      patterns.forEach((pattern) => {
        if (pattern.test(content)) {
          this.securityIssues.push({
            type: "XSS_VULNERABILITY",
            severity: "HIGH",
            message: "潜在的XSS漏洞",
            file: filePath,
            pattern: pattern.toString(),
            recommendation: "对用户输入进行编码验证，使用安全的输出方法",
          })
        }
      })
    })

    console.log(
      chalk.green(
        `✅ XSS漏洞扫描完成 - 发现 ${this.getIssuesByType("XSS_VULNERABILITY").length} 个问题`,
      ),
    )
  }

  /**
   * 扫描不安全的反序列化
   */
  async scanForInsecureDeserialization() {
    console.log(chalk.blue("🛡️  扫描不安全的反序列化..."))

    const patterns = [
      /JavaScriptSerializer\(\)\.Deserialize/,
      /BinaryFormatter\(\)\.Deserialize/,
      /SoapFormatter\(\)\.Deserialize/,
      /XmlSerializer\(\)\.Deserialize/,
      /DataContractSerializer\(\)\.ReadObject/,
    ]

    this.scanFiles((content, filePath) => {
      patterns.forEach((pattern) => {
        if (pattern.test(content)) {
          this.securityIssues.push({
            type: "INSECURE_DESERIALIZATION",
            severity: "CRITICAL",
            message: "不安全的反序列化操作",
            file: filePath,
            pattern: pattern.toString(),
            recommendation: "使用安全的序列化库，验证输入数据",
          })
        }
      })
    })

    console.log(
      chalk.green(
        `✅ 反序列化扫描完成 - 发现 ${this.getIssuesByType("INSECURE_DESERIALIZATION").length} 个问题`,
      ),
    )
  }

  /**
   * 扫描认证授权问题
   */
  async scanForAuthenticationIssues() {
    console.log(chalk.blue("🔐 扫描认证授权问题..."))

    const patterns = [
      /\[AllowAnonymous\].*HttpPost/,
      /\[Authorize\].*AllowAnonymous/,
      /ValidateAntiForgeryToken.*Skip/,
      /Authorize.*Roles.*=.*["']\s*["']/,
    ]

    this.scanFiles((content, filePath) => {
      patterns.forEach((pattern) => {
        if (pattern.test(content)) {
          this.securityIssues.push({
            type: "AUTHENTICATION_ISSUE",
            severity: "MEDIUM",
            message: "认证授权配置问题",
            file: filePath,
            pattern: pattern.toString(),
            recommendation: "检查权限配置，确保适当的访问控制",
          })
        }
      })
    })

    console.log(
      chalk.green(
        `✅ 认证授权扫描完成 - 发现 ${this.getIssuesByType("AUTHENTICATION_ISSUE").length} 个问题`,
      ),
    )
  }

  /**
   * 扫描文件内容
   */
  scanFiles(callback) {
    this.scanConfig.directories.forEach((dir) => {
      if (fs.existsSync(dir)) {
        this.scanDirectory(dir, callback)
      }
    })
  }

  /**
   * 递归扫描目录
   */
  scanDirectory(dir, callback) {
    const items = fs.readdirSync(dir)

    items.forEach((item) => {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        // 检查是否在排除列表中
        const shouldExclude = this.scanConfig.excludedPatterns.some((pattern) =>
          fullPath.includes(pattern.replace("**/", "")),
        )

        if (!shouldExclude) {
          this.scanDirectory(fullPath, callback)
        }
      } else {
        // 检查文件模式
        const shouldScan = this.scanConfig.filePatterns.some((pattern) => pattern.test(item))

        if (shouldScan) {
          const content = fs.readFileSync(fullPath, "utf8")
          callback(content, fullPath)
        }
      }
    })
  }

  /**
   * 按类型获取问题
   */
  getIssuesByType(type) {
    return this.securityIssues.filter((issue) => issue.type === type)
  }

  /**
   * 生成安全报告
   */
  generateSecurityReport() {
    const criticalIssues = this.securityIssues.filter((i) => i.severity === "CRITICAL")
    const highIssues = this.securityIssues.filter((i) => i.severity === "HIGH")
    const mediumIssues = this.securityIssues.filter((i) => i.severity === "MEDIUM")
    const lowIssues = this.securityIssues.filter((i) => i.severity === "LOW")

    const securityScore = this.calculateSecurityScore()

    return {
      timestamp: new Date().toISOString(),
      securityScore,
      summary: {
        totalIssues: this.securityIssues.length,
        critical: criticalIssues.length,
        high: highIssues.length,
        medium: mediumIssues.length,
        low: lowIssues.length,
      },
      issuesByType: {
        SQL_INJECTION: this.getIssuesByType("SQL_INJECTION"),
        HARDCODED_SECRET: this.getIssuesByType("HARDCODED_SECRET"),
        XSS_VULNERABILITY: this.getIssuesByType("XSS_VULNERABILITY"),
        INSECURE_DESERIALIZATION: this.getIssuesByType("INSECURE_DESERIALIZATION"),
        AUTHENTICATION_ISSUE: this.getIssuesByType("AUTHENTICATION_ISSUE"),
      },
      status:
        criticalIssues.length > 0
          ? "CRITICAL"
          : highIssues.length > 0
            ? "HIGH"
            : this.securityIssues.length > 0
              ? "MEDIUM"
              : "PASSED",
    }
  }

  /**
   * 计算安全分数
   */
  calculateSecurityScore() {
    if (this.securityIssues.length === 0) return 100

    const criticalCount = this.securityIssues.filter((i) => i.severity === "CRITICAL").length
    const highCount = this.securityIssues.filter((i) => i.severity === "HIGH").length
    const mediumCount = this.securityIssues.filter((i) => i.severity === "MEDIUM").length
    const lowCount = this.securityIssues.filter((i) => i.severity === "LOW").length

    // 权重计算
    const penalty = criticalCount * 20 + highCount * 10 + mediumCount * 5 + lowCount * 2
    return Math.max(0, 100 - penalty)
  }

  /**
   * 保存报告
   */
  saveReport(report, filename = "security-scan-report.json") {
    const reportDir = path.join(process.cwd(), "security-reports")
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    const reportFile = path.join(reportDir, filename)
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))

    console.log(chalk.green(`📊 安全报告已保存: ${reportFile}`))
    return reportFile
  }

  /**
   * 发送安全警报
   */
  async sendSecurityAlert(report) {
    if (report.status === "CRITICAL" || report.status === "HIGH") {
      console.log(chalk.red("🚨 发现严重安全漏洞，需要立即处理!"))

      // 这里可以集成Slack、Email等通知渠道
      if (process.env.SLACK_WEBHOOK_URL) {
        await this.sendSlackAlert(report)
      }
    }
  }
}

// 运行安全扫描
const securityScanner = new SecurityScanner()
securityScanner.runFullSecurityScan()

module.exports = SecurityScanner
