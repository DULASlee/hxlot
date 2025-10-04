/**
 * 🔥 安全问题数据结构
 * 
 * 功能：
 * 1. 定义安全问题类型
 * 2. 定义严重程度级别
 * 3. 定义问题位置信息
 * 4. 定义修复建议
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

/**
 * 漏洞类型
 */
export enum VulnerabilityType {
  /** SQL注入 */
  SQL_INJECTION = 'sql-injection',
  /** XSS跨站脚本 */
  XSS = 'xss',
  /** CSRF跨站请求伪造 */
  CSRF = 'csrf',
  /** 路径遍历 */
  PATH_TRAVERSAL = 'path-traversal',
  /** 命令注入 */
  COMMAND_INJECTION = 'command-injection',
  /** 不安全的反序列化 */
  INSECURE_DESERIALIZATION = 'insecure-deserialization',
  /** 敏感信息泄露 */
  SENSITIVE_DATA_EXPOSURE = 'sensitive-data-exposure',
  /** 不安全的身份验证 */
  BROKEN_AUTHENTICATION = 'broken-authentication',
  /** 不安全的授权 */
  BROKEN_ACCESS_CONTROL = 'broken-access-control',
  /** 安全配置错误 */
  SECURITY_MISCONFIGURATION = 'security-misconfiguration',
  /** 使用已知漏洞组件 */
  VULNERABLE_COMPONENTS = 'vulnerable-components',
  /** 不足的日志和监控 */
  INSUFFICIENT_LOGGING = 'insufficient-logging'
}

/**
 * 严重程度级别
 */
export enum SeverityLevel {
  /** 危急 - 需要立即修复 */
  CRITICAL = 'critical',
  /** 高危 - 需要尽快修复 */
  HIGH = 'high',
  /** 中危 - 需要修复 */
  MEDIUM = 'medium',
  /** 低危 - 建议修复 */
  LOW = 'low',
  /** 信息 - 仅供参考 */
  INFO = 'info'
}

/**
 * 问题位置信息
 */
export interface IssueLocation {
  /** 文件路径 */
  filePath: string
  /** 起始行号 */
  startLine: number
  /** 结束行号 */
  endLine: number
  /** 代码片段 */
  codeSnippet: string
  /** 函数名称（可选） */
  functionName?: string
  /** 类名称（可选） */
  className?: string
}

/**
 * 修复建议
 */
export interface RemediationSuggestion {
  /** 建议描述 */
  description: string
  /** 修复步骤 */
  steps: string[]
  /** 参考链接 */
  references: string[]
  /** 示例代码（可选） */
  exampleCode?: string
}

/**
 * 安全问题
 */
export interface SecurityIssue {
  /** 问题ID */
  id: string
  /** 漏洞类型 */
  type: VulnerabilityType
  /** 严重程度 */
  severity: SeverityLevel
  /** 问题标题 */
  title: string
  /** 问题描述 */
  description: string
  /** 问题位置 */
  location: IssueLocation
  /** 修复建议 */
  remediation: RemediationSuggestion
  /** 发现时间 */
  discoveredAt: Date
  /** OWASP Top 10分类（可选） */
  owaspCategory?: string
  /** CWE编号（可选） */
  cweId?: number
  /** CVE编号（可选，用于已知漏洞） */
  cveId?: string
  /** 可信度评分 (0-1) */
  confidence: number
}

/**
 * 扫描结果
 */
export interface ScanResult {
  /** 扫描ID */
  scanId: string
  /** 扫描开始时间 */
  startTime: Date
  /** 扫描结束时间 */
  endTime: Date
  /** 扫描的文件列表 */
  scannedFiles: string[]
  /** 发现的问题列表 */
  issues: SecurityIssue[]
  /** 问题统计 */
  statistics: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    info: number
    byType: Record<VulnerabilityType, number>
  }
}

/**
 * 安全问题工具类
 */
export class SecurityIssueUtils {
  /**
   * 生成唯一的问题ID
   */
  static generateIssueId(): string {
    return `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取严重程度的数值权重（用于排序）
   */
  static getSeverityWeight(severity: SeverityLevel): number {
    const weights: Record<SeverityLevel, number> = {
      [SeverityLevel.CRITICAL]: 5,
      [SeverityLevel.HIGH]: 4,
      [SeverityLevel.MEDIUM]: 3,
      [SeverityLevel.LOW]: 2,
      [SeverityLevel.INFO]: 1
    }
    return weights[severity] || 0
  }

  /**
   * 按严重程度排序问题列表
   */
  static sortBySeverity(issues: SecurityIssue[]): SecurityIssue[] {
    return [...issues].sort((a, b) => {
      const weightDiff = this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity)
      if (weightDiff !== 0) return weightDiff
      // 如果严重程度相同，按可信度排序
      return b.confidence - a.confidence
    })
  }

  /**
   * 按类型分组问题
   */
  static groupByType(issues: SecurityIssue[]): Map<VulnerabilityType, SecurityIssue[]> {
    const groups = new Map<VulnerabilityType, SecurityIssue[]>()
    
    for (const issue of issues) {
      if (!groups.has(issue.type)) {
        groups.set(issue.type, [])
      }
      groups.get(issue.type)!.push(issue)
    }
    
    return groups
  }

  /**
   * 按严重程度分组问题
   */
  static groupBySeverity(issues: SecurityIssue[]): Map<SeverityLevel, SecurityIssue[]> {
    const groups = new Map<SeverityLevel, SecurityIssue[]>()
    
    for (const issue of issues) {
      if (!groups.has(issue.severity)) {
        groups.set(issue.severity, [])
      }
      groups.get(issue.severity)!.push(issue)
    }
    
    return groups
  }

  /**
   * 计算问题统计信息
   */
  static calculateStatistics(issues: SecurityIssue[]): ScanResult['statistics'] {
    const stats: ScanResult['statistics'] = {
      total: issues.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
      byType: {} as Record<VulnerabilityType, number>
    }

    // 初始化类型计数
    for (const type of Object.values(VulnerabilityType)) {
      stats.byType[type] = 0
    }

    // 统计
    for (const issue of issues) {
      // 按严重程度统计
      switch (issue.severity) {
        case SeverityLevel.CRITICAL:
          stats.critical++
          break
        case SeverityLevel.HIGH:
          stats.high++
          break
        case SeverityLevel.MEDIUM:
          stats.medium++
          break
        case SeverityLevel.LOW:
          stats.low++
          break
        case SeverityLevel.INFO:
          stats.info++
          break
      }

      // 按类型统计
      stats.byType[issue.type]++
    }

    return stats
  }

  /**
   * 获取严重程度的显示名称
   */
  static getSeverityDisplayName(severity: SeverityLevel): string {
    const names: Record<SeverityLevel, string> = {
      [SeverityLevel.CRITICAL]: '危急',
      [SeverityLevel.HIGH]: '高危',
      [SeverityLevel.MEDIUM]: '中危',
      [SeverityLevel.LOW]: '低危',
      [SeverityLevel.INFO]: '信息'
    }
    return names[severity] || '未知'
  }

  /**
   * 获取漏洞类型的显示名称
   */
  static getVulnerabilityTypeDisplayName(type: VulnerabilityType): string {
    const names: Record<VulnerabilityType, string> = {
      [VulnerabilityType.SQL_INJECTION]: 'SQL注入',
      [VulnerabilityType.XSS]: 'XSS跨站脚本',
      [VulnerabilityType.CSRF]: 'CSRF跨站请求伪造',
      [VulnerabilityType.PATH_TRAVERSAL]: '路径遍历',
      [VulnerabilityType.COMMAND_INJECTION]: '命令注入',
      [VulnerabilityType.INSECURE_DESERIALIZATION]: '不安全的反序列化',
      [VulnerabilityType.SENSITIVE_DATA_EXPOSURE]: '敏感信息泄露',
      [VulnerabilityType.BROKEN_AUTHENTICATION]: '不安全的身份验证',
      [VulnerabilityType.BROKEN_ACCESS_CONTROL]: '不安全的授权',
      [VulnerabilityType.SECURITY_MISCONFIGURATION]: '安全配置错误',
      [VulnerabilityType.VULNERABLE_COMPONENTS]: '使用已知漏洞组件',
      [VulnerabilityType.INSUFFICIENT_LOGGING]: '不足的日志和监控'
    }
    return names[type] || '未知'
  }

  /**
   * 获取严重程度的颜色代码
   */
  static getSeverityColor(severity: SeverityLevel): string {
    const colors: Record<SeverityLevel, string> = {
      [SeverityLevel.CRITICAL]: '#8B0000',
      [SeverityLevel.HIGH]: '#FF0000',
      [SeverityLevel.MEDIUM]: '#FFA500',
      [SeverityLevel.LOW]: '#FFD700',
      [SeverityLevel.INFO]: '#4169E1'
    }
    return colors[severity] || '#808080'
  }
}
