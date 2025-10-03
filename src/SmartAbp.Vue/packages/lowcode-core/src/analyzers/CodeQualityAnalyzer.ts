/**
 * 🔥 代码质量分析器
 * 
 * 功能：
 * 1. 代码复杂度分析
 * 2. 代码重复检测
 * 3. 代码规范检查
 * 4. 安全漏洞扫描
 * 5. 性能瓶颈检测
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import { getGlobalLogger } from '@smartabp/lowcode-shared'

const logger = getGlobalLogger()

export interface QualityReport {
  score: number
  complexity: ComplexityReport
  duplication: DuplicationReport
  style: StyleReport
  security: SecurityReport
  performance: PerformanceReport
}

export interface ComplexityReport {
  cyclomaticComplexity: number
  cognitiveComplexity: number
  linesOfCode: number
  functions: number
  classes: number
}

export interface DuplicationReport {
  duplicatedBlocks: number
  duplicatedLines: number
  duplicationPercentage: number
}

export interface StyleReport {
  errors: StyleIssue[]
  warnings: StyleIssue[]
}

export interface StyleIssue {
  line: number
  column: number
  message: string
  rule: string
}

export interface SecurityReport {
  vulnerabilities: SecurityVulnerability[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface SecurityVulnerability {
  type: string
  severity: string
  location: string
  description: string
}

export interface PerformanceReport {
  bottlenecks: PerformanceBottleneck[]
  recommendations: string[]
}

export interface PerformanceBottleneck {
  type: string
  location: string
  impact: string
  suggestion: string
}

/**
 * 代码质量分析器
 */
export class CodeQualityAnalyzer {
  /**
   * 分析代码质量
   */
  async analyze(code: string, language: 'typescript' | 'csharp' = 'typescript'): Promise<QualityReport> {
    logger.info('🔍 开始代码质量分析', { language, codeLength: code.length })

    const complexity = this.analyzeComplexity(code)
    const duplication = this.analyzeDuplication(code)
    const style = this.analyzeStyle(code, language)
    const security = this.analyzeSecurity(code, language)
    const performance = this.analyzePerformance(code, language)

    const score = this.calculateQualityScore({
      complexity,
      duplication,
      style,
      security,
      performance
    })

    logger.info('✅ 代码质量分析完成', { score })

    return {
      score,
      complexity,
      duplication,
      style,
      security,
      performance
    }
  }

  /**
   * 分析代码复杂度
   */
  private analyzeComplexity(code: string): ComplexityReport {
    const lines = code.split('\n')
    const linesOfCode = lines.filter(l => l.trim() && !l.trim().startsWith('//')).length

    // 简化的复杂度计算
    const functions = (code.match(/function\s+\w+|=>\s*{/g) || []).length
    const classes = (code.match(/class\s+\w+/g) || []).length
    const conditionals = (code.match(/if\s*\(|else\s+if\s*\(|switch\s*\(/g) || []).length
    const loops = (code.match(/for\s*\(|while\s*\(|do\s*{/g) || []).length

    const cyclomaticComplexity = 1 + conditionals + loops
    const cognitiveComplexity = conditionals * 2 + loops * 3

    return {
      cyclomaticComplexity,
      cognitiveComplexity,
      linesOfCode,
      functions,
      classes
    }
  }

  /**
   * 分析代码重复
   */
  private analyzeDuplication(code: string): DuplicationReport {
    const lines = code.split('\n')
    const codeLines = lines.filter(l => l.trim() && !l.trim().startsWith('//'))
    
    // 简化的重复检测
    const lineMap = new Map<string, number>()
    let duplicatedLines = 0

    codeLines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed.length > 10) { // 忽略太短的行
        lineMap.set(trimmed, (lineMap.get(trimmed) || 0) + 1)
      }
    })

    lineMap.forEach(count => {
      if (count > 1) {
        duplicatedLines += count - 1
      }
    })

    return {
      duplicatedBlocks: lineMap.size,
      duplicatedLines,
      duplicationPercentage: (duplicatedLines / codeLines.length) * 100
    }
  }

  /**
   * 分析代码风格
   */
  private analyzeStyle(code: string, language: string): StyleReport {
    const errors: StyleIssue[] = []
    const warnings: StyleIssue[] = []
    const lines = code.split('\n')

    lines.forEach((line, index) => {
      // 检查行长度
      if (line.length > 120) {
        warnings.push({
          line: index + 1,
          column: 121,
          message: '行长度超过120字符',
          rule: 'max-line-length'
        })
      }

      // 检查尾部空格
      if (line.endsWith(' ')) {
        warnings.push({
          line: index + 1,
          column: line.length,
          message: '行尾有多余空格',
          rule: 'no-trailing-spaces'
        })
      }

      // TypeScript特定检查
      if (language === 'typescript') {
        if (line.includes('any') && !line.includes('//')) {
          warnings.push({
            line: index + 1,
            column: line.indexOf('any'),
            message: '使用了any类型',
            rule: 'no-any'
          })
        }
      }
    })

    return { errors, warnings }
  }

  /**
   * 分析安全问题
   */
  private analyzeSecurity(code: string, _language: string): SecurityReport {
    const vulnerabilities: SecurityVulnerability[] = []

    // SQL注入检测
    if (code.includes('ExecuteSql') || code.includes('execute(') && code.includes('+')) {
      vulnerabilities.push({
        type: 'SQL Injection',
        severity: 'high',
        location: 'SQL execution',
        description: '可能存在SQL注入风险，建议使用参数化查询'
      })
    }

    // XSS检测
    if (code.includes('innerHTML') || code.includes('dangerouslySetInnerHTML')) {
      vulnerabilities.push({
        type: 'XSS',
        severity: 'medium',
        location: 'DOM manipulation',
        description: '直接设置HTML可能导致XSS攻击'
      })
    }

    // 硬编码密钥检测
    if (code.match(/password\s*=\s*["'][^"']+["']/i)) {
      vulnerabilities.push({
        type: 'Hardcoded Credentials',
        severity: 'critical',
        location: 'Credential storage',
        description: '检测到硬编码密码，应使用配置文件或环境变量'
      })
    }

    const riskLevel = vulnerabilities.some(v => v.severity === 'critical')
      ? 'critical'
      : vulnerabilities.some(v => v.severity === 'high')
      ? 'high'
      : vulnerabilities.some(v => v.severity === 'medium')
      ? 'medium'
      : 'low'

    return { vulnerabilities, riskLevel }
  }

  /**
   * 分析性能问题
   */
  private analyzePerformance(code: string, _language: string): PerformanceReport {
    const bottlenecks: PerformanceBottleneck[] = []
    const recommendations: string[] = []

    // N+1查询检测
    if (code.includes('for') && code.includes('await') && code.includes('GetAsync')) {
      bottlenecks.push({
        type: 'N+1 Query Problem',
        location: 'Database access in loop',
        impact: 'High',
        suggestion: '使用批量查询或Include预加载相关数据'
      })
    }

    // 大量同步操作
    if ((code.match(/await/g) || []).length > 10 && !code.includes('Promise.all')) {
      bottlenecks.push({
        type: 'Sequential Async Operations',
        location: 'Multiple await calls',
        impact: 'Medium',
        suggestion: '考虑使用Promise.all并行执行独立的异步操作'
      })
    }

    // 性能建议
    if (bottlenecks.length > 0) {
      recommendations.push('优化数据库查询，减少往返次数')
      recommendations.push('使用缓存减少重复计算')
      recommendations.push('考虑使用分页加载大量数据')
    }

    return { bottlenecks, recommendations }
  }

  /**
   * 计算质量评分
   */
  private calculateQualityScore(report: Omit<QualityReport, 'score'>): number {
    let score = 100

    // 复杂度扣分
    if (report.complexity.cyclomaticComplexity > 10) score -= 5
    if (report.complexity.cyclomaticComplexity > 20) score -= 10
    if (report.complexity.cognitiveComplexity > 15) score -= 5

    // 重复度扣分
    if (report.duplication.duplicationPercentage > 5) score -= 10
    if (report.duplication.duplicationPercentage > 10) score -= 15

    // 风格问题扣分
    score -= Math.min(report.style.errors.length * 2, 20)
    score -= Math.min(report.style.warnings.length * 0.5, 10)

    // 安全问题扣分
    score -= report.security.vulnerabilities.filter(v => v.severity === 'critical').length * 20
    score -= report.security.vulnerabilities.filter(v => v.severity === 'high').length * 10
    score -= report.security.vulnerabilities.filter(v => v.severity === 'medium').length * 5

    // 性能问题扣分
    score -= report.performance.bottlenecks.length * 5

    return Math.max(0, Math.min(100, score))
  }
}
