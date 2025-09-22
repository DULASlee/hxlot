/**
 * 代码质量检查辅助工具
 * 提供安全扫描、性能分析、代码验证等功能
 */

const fs = require('fs')
const path = require('path')

class CodeQualityHelpers {
  /**
   * 扫描安全漏洞
   */
  scanForSecurityIssues() {
    const issues = []
    const codeDir = path.join(process.cwd(), 'src', 'SmartAbp.CodeGenerator')
    
    // 检查SQL注入风险
    const sqlPatterns = [
      /\.ExecuteSqlRaw\(/,
      /\.ExecuteSqlRawAsync\(/,
      /\.FromSql\(/,
      /\.FromSqlRaw\(/,
      /string\.Format.*SELECT/,
      /\+.*SELECT/
    ]
    
    this.scanDirectory(codeDir, /\.cs$/, (content, filePath) => {
      sqlPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          issues.push({
            type: 'SECURITY',
            severity: 'HIGH',
            message: '潜在的SQL注入风险',
            file: filePath,
            pattern: pattern.toString()
          })
        }
      })
    })

    // 检查硬编码的密钥
    const secretPatterns = [
      /password.*=.*['"].*['"]/i,
      /apiKey.*=.*['"].*['"]/i,
      /secret.*=.*['"].*['"]/i,
      /connectionString.*=.*['"][^'"]*['"]/i
    ]
    
    this.scanDirectory(codeDir, /\.cs$/, (content, filePath) => {
      secretPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          issues.push({
            type: 'SECURITY',
            severity: 'MEDIUM',
            message: '硬编码的敏感信息',
            file: filePath,
            pattern: pattern.toString()
          })
        }
      })
    })

    return issues
  }

  /**
   * 扫描性能问题
   */
  scanForPerformanceIssues() {
    const issues = []
    const codeDir = path.join(process.cwd(), 'src', 'SmartAbp.CodeGenerator')
    
    // 检查N+1查询模式
    const nPlusOnePatterns = [
      /\.FirstOrDefault\(\)\.\w+\.FirstOrDefault\(\)/,
      /\.Find\(\)\.\w+\.FirstOrDefault\(\)/,
      /foreach.*\.Select.*\.FirstOrDefault\(\)/
    ]
    
    this.scanDirectory(codeDir, /\.cs$/, (content, filePath) => {
      nPlusOnePatterns.forEach(pattern => {
        if (pattern.test(content)) {
          issues.push({
            type: 'PERFORMANCE',
            severity: 'MEDIUM',
            message: '潜在的N+1查询问题',
            file: filePath,
            pattern: pattern.toString()
          })
        }
      })
    })

    // 检查内存泄漏模式
    const memoryLeakPatterns = [
      /event.*\+=[^;]*;.*没有-=/
    ]
    
    this.scanDirectory(codeDir, /\.cs$/, (content, filePath) => {
      memoryLeakPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          issues.push({
            type: 'PERFORMANCE',
            severity: 'HIGH',
            message: '潜在的内存泄漏问题',
            file: filePath,
            pattern: pattern.toString()
          })
        }
      })
    })

    return issues
  }

  /**
   * 扫描可维护性问题
   */
  scanForMaintainabilityIssues() {
    const issues = []
    const codeDir = path.join(process.cwd(), 'src', 'SmartAbp.CodeGenerator')
    
    // 检查过长的函数
    this.scanDirectory(codeDir, /\.cs$/, (content, filePath) => {
      const lines = content.split('\n')
      let inFunction = false
      let functionStart = 0
      let functionName = ''

      lines.forEach((line, index) => {
        if (line.match(/^\s*(public|private|protected)\s+.*\(.*\)\s*{/)) {
          inFunction = true
          functionStart = index
          functionName = line.trim()
        }

        if (inFunction && line.includes('}')) {
          const functionLength = index - functionStart
          if (functionLength > 50) {
            issues.push({
              type: 'MAINTAINABILITY',
              severity: 'MEDIUM',
              message: `函数过长: ${functionName} (${functionLength}行)`,
              file: filePath,
              line: functionStart + 1
            })
          }
          inFunction = false
        }
      })
    })

    // 检查复杂的条件判断
    const complexConditionPatterns = [
      /if.*&&.*&&.*&&/,
      /if.*\|\|.*\|\|.*\|\|/,
      /if.*\(.*\(.*\(.*\)/
    ]
    
    this.scanDirectory(codeDir, /\.cs$/, (content, filePath) => {
      complexConditionPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          issues.push({
            type: 'MAINTAINABILITY',
            severity: 'LOW',
            message: '复杂的条件判断',
            file: filePath,
            pattern: pattern.toString()
          })
        }
      })
    })

    return issues
  }

  /**
   * 计算Lint分数
   */
  calculateLintScore(lintResults) {
    if (!lintResults || lintResults.length === 0) return 100
    
    const totalIssues = lintResults.reduce((sum, file) => sum + file.errorCount + file.warningCount, 0)
    const maxScore = 100
    const penaltyPerIssue = 2
    
    return Math.max(0, maxScore - (totalIssues * penaltyPerIssue))
  }

  /**
   * 解析覆盖率结果
   */
  parseCoverage(coverageOutput) {
    const lines = coverageOutput.split('\n')
    let statements = 0
    let belowThreshold = false

    for (const line of lines) {
      if (line.includes('Statements') && line.includes('%')) {
        const match = line.match(/(\d+(\.\d+)?)%/)
        if (match) {
          statements = parseFloat(match[1])
          belowThreshold = statements < 80
        }
      }
    }

    return { statements, belowThreshold }
  }

  /**
   * 查找生成的代码文件
   */
  findGeneratedFiles() {
    const generatedDirs = [
      'src/SmartAbp.Application',
      'src/SmartAbp.Application.Contracts', 
      'src/SmartAbp.Domain',
      'src/SmartAbp.EntityFrameworkCore'
    ]
    
    const generatedFiles = []
    
    generatedDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.scanDirectory(dir, /\.cs$/, (content, filePath) => {
          // 检查是否包含生成代码的标记
          if (content.includes('// Auto-generated') || content.includes('GeneratedCode')) {
            generatedFiles.push(filePath)
          }
        })
      }
    })

    return generatedFiles
  }

  /**
   * 检查代码质量问题
   */
  hasQualityIssues(content) {
    const qualityPatterns = [
      /TODO:/,
      /FIXME:/,
      /console\.log\(/,
      /Debug\.WriteLine\(/,
      /throw new Exception\(/,
      /catch\s*\(\s*Exception\s*\)/
    ]

    return qualityPatterns.some(pattern => pattern.test(content))
  }

  /**
   * 验证代码结构
   */
  validateCodeStructure(content) {
    // 检查基本的代码结构完整性
    const requiredPatterns = [
      /using\s+System/,
      /namespace\s+\w+/,
      /class\s+\w+/,
      /public\s+(class|interface|enum)/
    ]

    return requiredPatterns.every(pattern => pattern.test(content))
  }

  /**
   * 递归扫描目录
   */
  scanDirectory(dir, filePattern, callback) {
    if (!fs.existsSync(dir)) return

    const items = fs.readdirSync(dir)
    
    items.forEach(item => {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        this.scanDirectory(fullPath, filePattern, callback)
      } else if (filePattern.test(item)) {
        const content = fs.readFileSync(fullPath, 'utf8')
        callback(content, fullPath)
      }
    })
  }

  /**
   * 生成质量报告
   */
  generateQualityReport(metrics, stats) {
    const overallScore = Math.round(
      (metrics.codeStyle.score + metrics.security.score + 
       metrics.performance.score + metrics.maintainability.score + 
       metrics.testCoverage.score) / 5
    )

    return {
      timestamp: new Date().toISOString(),
      overallScore,
      metrics,
      generatedCode: stats,
      status: overallScore >= 80 ? 'PASSED' : 'FAILED',
      recommendations: this.generateRecommendations(metrics)
    }
  }

  /**
   * 生成改进建议
   */
  generateRecommendations(metrics) {
    const recommendations = []

    if (metrics.codeStyle.score < 90) {
      recommendations.push('运行 ESLint 自动修复代码风格问题')
    }

    if (metrics.security.score < 100) {
      recommendations.push('修复发现的安全漏洞，避免硬编码敏感信息')
    }

    if (metrics.performance.score < 95) {
      recommendations.push('优化性能敏感代码，避免N+1查询')
    }

    if (metrics.maintainability.score < 90) {
      recommendations.push('重构复杂函数，提高代码可读性')
    }

    if (metrics.testCoverage.score < 80) {
      recommendations.push('增加单元测试覆盖率，目标达到80%以上')
    }

    return recommendations
  }

  /**
   * 保存报告到文件
   */
  saveReport(report, filename = 'code-quality-report.json') {
    const reportDir = path.join(process.cwd(), 'quality-reports')
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    const reportFile = path.join(reportDir, filename)
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
    
    return reportFile
  }
}

module.exports = CodeQualityHelpers