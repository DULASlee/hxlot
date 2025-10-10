#!/usr/bin/env tsx

/**
 * 危险模式检测工具
 * 用于检测代码中的危险模式和安全漏洞
 */

import { readFileSync, readdirSync, statSync } from "fs"
import { extname, join } from "path"

interface DangerousPattern {
  pattern: RegExp
  type: string
  severity: "error" | "warning"
  message: string
  suggestion: string
  allowInComments?: boolean
}

interface PatternIssue {
  file: string
  line: number
  column: number
  type: string
  severity: "error" | "warning"
  message: string
  suggestion: string
}

class DangerousPatternDetector {
  private issues: PatternIssue[] = []

  // 危险模式定义
  private dangerousPatterns: DangerousPattern[] = [
    // 动态代码执行
    {
      pattern: /eval\s*\(/gi,
      type: "dynamic-execution",
      severity: "error",
      message: "检测到eval()函数调用 - 可能导致代码注入",
      suggestion: "使用安全的替代方案，如JSON.parse处理数据，或使用预编译的表达式引擎",
    },
    {
      pattern: /new\s+Function\s*\(/gi,
      type: "dynamic-execution",
      severity: "error",
      message: "检测到new Function()构造器 - 可能导致代码注入",
      suggestion: "避免动态代码执行，使用静态函数或策略模式",
    },
    {
      pattern: /setTimeout\s*\(\s*["'][^"']*["']/gi,
      type: "dynamic-execution",
      severity: "error",
      message: "检测到字符串参数setTimeout - 可能导致代码注入",
      suggestion: "使用函数参数而非字符串参数",
    },
    {
      pattern: /setInterval\s*\(\s*["'][^"']*["']/gi,
      type: "dynamic-execution",
      severity: "error",
      message: "检测到字符串参数setInterval - 可能导致代码注入",
      suggestion: "使用函数参数而非字符串参数",
    },

    // HTML注入
    {
      pattern: /innerHTML\s*\+?=/gi,
      type: "html-injection",
      severity: "warning",
      message: "检测到innerHTML赋值 - 可能导致XSS攻击",
      suggestion: "使用textContent或Vue的模板语法，如必须使用innerHTML确保内容已净化",
    },
    {
      pattern: /outerHTML\s*\+?=/gi,
      type: "html-injection",
      severity: "warning",
      message: "检测到outerHTML赋值 - 可能导致XSS攻击",
      suggestion: "使用DOM操作方法或Vue的模板语法",
    },
    {
      pattern: /document\.write/gi,
      type: "html-injection",
      severity: "error",
      message: "检测到document.write - 可能导致XSS攻击",
      suggestion: "使用DOM操作方法或Vue的模板语法",
    },
    {
      pattern: /<script[^>]*>.*?<\/script>/gi,
      type: "html-injection",
      severity: "error",
      message: "检测到Script标签 - 可能导致XSS攻击",
      suggestion: "使用组件化的方式处理脚本逻辑",
    },
    {
      pattern: /javascript:/gi,
      type: "html-injection",
      severity: "error",
      message: "检测到JavaScript协议 - 可能导致XSS攻击",
      suggestion: "使用标准的事件处理或路由导航",
    },

    // 内联事件处理
    {
      pattern: /on\w+\s*=\s*["'][^"']*["']/gi,
      type: "inline-event",
      severity: "warning",
      message: "检测到内联事件处理器 - 可能导致XSS攻击",
      suggestion: "使用Vue的事件绑定语法(v-on或@)或标准的事件监听",
    },

    // 危险的全局访问
    {
      pattern: /window\[.*\]/gi,
      type: "global-access",
      severity: "warning",
      message: "检测到动态全局访问 - 可能导致安全问题",
      suggestion: "使用静态属性访问或配置对象",
    },
    {
      pattern: /document\[.*\]/gi,
      type: "global-access",
      severity: "warning",
      message: "检测到动态文档访问 - 可能导致安全问题",
      suggestion: "使用静态DOM选择器或Vue的ref机制",
    },

    // 不安全的正则表达式
    {
      pattern: /new\s+RegExp\s*\([^)]+\)/gi,
      type: "unsafe-regex",
      severity: "warning",
      message: "检测到动态正则表达式 - 可能导致ReDoS攻击",
      suggestion: "使用静态正则表达式或对输入进行验证",
    },

    // 危险的前缀
    {
      pattern: /\$\{.*\}/gi,
      type: "template-literal",
      severity: "warning",
      message: "检测到模板字符串 - 确保内容安全",
      suggestion: "验证模板字符串中的变量内容，避免直接渲染用户输入",
    },
  ]

  /**
   * 扫描指定目录下的代码文件
   */
  public scanDirectory(dirPath: string): void {
    const files = this.getCodeFiles(dirPath)

    console.log(`🔍 开始扫描危险模式: ${dirPath}`)
    console.log(`📁 发现 ${files.length} 个代码文件`)

    files.forEach((file) => {
      this.scanFile(file)
    })
  }

  /**
   * 获取代码文件列表
   */
  private getCodeFiles(dirPath: string): string[] {
    const files: string[] = []
    const allowedExtensions = [".ts", ".js", ".vue", ".tsx", ".jsx", ".html"]

    const traverse = (currentPath: string) => {
      const entries = readdirSync(currentPath)

      entries.forEach((entry) => {
        const fullPath = join(currentPath, entry)
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
          // 跳过node_modules和构建目录
          if (
            !entry.includes("node_modules") &&
            !entry.includes("dist") &&
            !entry.includes("build") &&
            !entry.includes(".git")
          ) {
            traverse(fullPath)
          }
        } else if (stat.isFile()) {
          const ext = extname(entry)
          if (allowedExtensions.includes(ext)) {
            files.push(fullPath)
          }
        }
      })
    }

    traverse(dirPath)
    return files
  }

  /**
   * 扫描单个文件
   */
  private scanFile(filePath: string): void {
    try {
      const content = readFileSync(filePath, "utf-8")
      const lines = content.split("\n")

      lines.forEach((line, lineIndex) => {
        this.checkLine(filePath, line, lineIndex + 1)
      })
    } catch (error) {
      console.warn(`⚠️  无法读取文件: ${filePath}`, error)
    }
  }

  /**
   * 检查单行代码
   */
  private checkLine(filePath: string, line: string, lineNumber: number): void {
    this.dangerousPatterns.forEach(
      ({ pattern, type, severity, message, suggestion, allowInComments }) => {
        const matches = line.matchAll(pattern)

        for (const match of matches) {
          if (match.index !== undefined) {
            // 检查是否在注释中
            const beforeMatch = line.substring(0, match.index).trim()
            const isInComment =
              beforeMatch.startsWith("//") ||
              beforeMatch.startsWith("*") ||
              beforeMatch.startsWith("/*") ||
              beforeMatch.includes("//")

            if (isInComment && allowInComments !== false) {
              continue // 跳过注释中的匹配
            }

            this.issues.push({
              file: filePath,
              line: lineNumber,
              column: match.index + 1,
              type,
              severity,
              message,
              suggestion,
            })
          }
        }
      },
    )
  }

  /**
   * 生成检测报告
   */
  public generateReport(): void {
    console.log("\n" + "=".repeat(60))
    console.log("🚨 危险模式检测报告")
    console.log("=".repeat(60))

    if (this.issues.length === 0) {
      console.log("✅ 未发现危险模式！")
      console.log("📊 扫描完成，所有代码符合安全规范")
      return
    }

    // 按类型分组
    const groupedIssues = this.groupIssuesByType()

    console.log(`\n📈 总计发现 ${this.issues.length} 个问题\n`)

    // 显示各类问题统计
    Object.entries(groupedIssues).forEach(([type, issues]) => {
      const errors = issues.filter((issue) => issue.severity === "error")
      const warnings = issues.filter((issue) => issue.severity === "warning")

      console.log(`\n🔍 ${this.getTypeDescription(type)}:`)
      console.log(`   ❌ 错误: ${errors.length}个`)
      console.log(`   ⚠️  警告: ${warnings.length}个`)

      // 显示详细问题
      if (issues.length > 0) {
        issues.slice(0, 5).forEach((issue) => {
          console.log(`   📁 ${issue.file}:${issue.line}:${issue.column}`)
          console.log(`      ${issue.message}`)
        })

        if (issues.length > 5) {
          console.log(`   💡 还有 ${issues.length - 5} 个类似问题...`)
        }
      }
    })

    // 显示最严重的错误
    const errors = this.issues.filter((issue) => issue.severity === "error")
    if (errors.length > 0) {
      console.log("\n🔴 严重错误详情:")
      errors.slice(0, 10).forEach((issue) => {
        console.log(`\n📁 ${issue.file}:${issue.line}:${issue.column}`)
        console.log(`   类型: ${issue.type}`)
        console.log(`   问题: ${issue.message}`)
        console.log(`   建议: ${issue.suggestion}`)
      })
    }

    console.log("\n" + "=".repeat(60))
    console.log("💡 修复建议:")
    console.log("1. 优先处理所有错误级别的问题")
    console.log("2. 使用安全的替代方案替换危险代码")
    console.log("3. 启用内容安全策略(CSP)")
    console.log("4. 定期进行安全代码审查")
    console.log("5. 使用自动化安全测试工具")

    // 设置退出码
    process.exit(errors.length > 0 ? 1 : 0)
  }

  /**
   * 按类型分组问题
   */
  private groupIssuesByType(): Record<string, PatternIssue[]> {
    const grouped: Record<string, PatternIssue[]> = {}

    this.issues.forEach((issue) => {
      if (!grouped[issue.type]) {
        grouped[issue.type] = []
      }
      grouped[issue.type]!.push(issue)
    })

    return grouped
  }

  /**
   * 获取类型描述
   */
  private getTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
      "dynamic-execution": "动态代码执行",
      "html-injection": "HTML注入风险",
      "inline-event": "内联事件处理",
      "global-access": "全局访问风险",
      "unsafe-regex": "正则表达式风险",
      "template-literal": "模板字符串风险",
    }

    return descriptions[type] || type
  }
}

/**
 * 主函数
 */
function main(): void {
  console.log("🛡️  SmartAbp 危险模式检测工具 v1.0")
  console.log("=====================================\n")

  // 默认扫描src目录
  const targetDir = process.argv[2] || "src"

  const detector = new DangerousPatternDetector()
  detector.scanDirectory(targetDir)
  detector.generateReport()
}

// 执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
