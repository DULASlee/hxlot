/**
 * 智能推荐引擎
 * 基于规则的智能模板推荐和代码优化建议
 */

import { getGlobalLogger, type ILogger } from '@smartabp/lowcode-shared'

const logger: ILogger = getGlobalLogger()

// 推荐类型
export interface Recommendation {
  id: string
  type: 'template' | 'optimization' | 'bestPractice'
  title: string
  description: string
  reason: string
  confidence: number // 0-1
  priority: number // 1-5
  actionable: boolean
  action?: {
    type: 'apply' | 'view' | 'learn'
    payload: any
  }
}

// 项目特征
export interface ProjectFeatures {
  entityCount: number
  hasWorkflow: boolean
  hasComplexRules: boolean
  hasAuth: boolean
  uiFramework: string
  backendFramework: string
  complexity: 'simple' | 'medium' | 'complex'
}

/**
 * 智能推荐引擎
 */
export class IntelligentRecommendationEngine {
  private __logger: ILogger

  constructor() {
    this.__logger = logger
    void this.__logger // 保留用于未来日志记录
  }

  /**
   * 基于项目特征推荐模板
   */
  recommendTemplates(features: ProjectFeatures): Recommendation[] {
    const recommendations: Recommendation[] = []

    // 规则1: 基础CRUD推荐
    if (features.entityCount > 0 && features.complexity === 'simple') {
      recommendations.push({
        id: 'rec-crud-basic',
        type: 'template',
        title: 'CRUD基础模板',
        description: '适合您的项目的标准CRUD操作模板',
        reason: '您的项目有实体定义，推荐使用CRUD模板快速生成',
        confidence: 0.9,
        priority: 5,
        actionable: true,
        action: {
          type: 'apply',
          payload: { templateId: 'crud-basic' }
        }
      })
    }

    // 规则2: 工作流模板推荐
    if (features.hasWorkflow) {
      recommendations.push({
        id: 'rec-workflow',
        type: 'template',
        title: '审批工作流模板',
        description: '包含完整审批流程的工作流模板',
        reason: '检测到您的项目需要工作流功能',
        confidence: 0.85,
        priority: 4,
        actionable: true,
        action: {
          type: 'apply',
          payload: { templateId: 'workflow-approval' }
        }
      })
    }

    // 规则3: 复杂业务场景推荐
    if (features.hasComplexRules && features.complexity === 'complex') {
      recommendations.push({
        id: 'rec-ddd',
        type: 'template',
        title: 'DDD领域驱动设计模板',
        description: '适合复杂业务场景的DDD架构模板',
        reason: '您的项目包含复杂业务规则，推荐使用DDD模式',
        confidence: 0.8,
        priority: 4,
        actionable: true,
        action: {
          type: 'view',
          payload: { templateId: 'ddd-advanced' }
        }
      })
    }

    return recommendations.sort((a, b) => 
      b.priority - a.priority || b.confidence - a.confidence
    )
  }

  /**
   * 代码优化建议
   */
  suggestOptimizations(code: string, fileType: string): Recommendation[] {
    const recommendations: Recommendation[] = []

    // 规则1: 性能优化 - 检测大列表
    if (code.includes('v-for') && code.includes('.length >')) {
      const hasVirtualScroll = code.includes('virtual-list') || code.includes('virtual-scroll')
      if (!hasVirtualScroll) {
        recommendations.push({
          id: 'opt-virtual-scroll',
          type: 'optimization',
          title: '使用虚拟滚动优化大列表性能',
          description: '检测到大列表渲染，建议使用虚拟滚动',
          reason: '大列表可能导致性能问题',
          confidence: 0.75,
          priority: 3,
          actionable: true,
          action: {
            type: 'apply',
            payload: { optimizationType: 'virtual-scroll' }
          }
        })
      }
    }

    // 规则2: 安全性 - 检测SQL注入风险
    if (code.includes('ExecuteSql') && code.includes('+')) {
      recommendations.push({
        id: 'sec-sql-injection',
        type: 'optimization',
        title: '修复SQL注入风险',
        description: '检测到字符串拼接SQL，存在注入风险',
        reason: '应使用参数化查询',
        confidence: 0.95,
        priority: 5,
        actionable: true,
        action: {
          type: 'apply',
          payload: { fixType: 'sql-injection' }
        }
      })
    }

    // 规则3: 类型安全 - 检测any使用
    if (fileType === 'typescript' && code.match(/:\s*any/g)) {
      const anyCount = (code.match(/:\s*any/g) || []).length
      if (anyCount > 3) {
        recommendations.push({
          id: 'type-safety',
          type: 'optimization',
          title: '改善类型安全',
          description: `检测到${anyCount}处使用any类型`,
          reason: '建议使用具体类型替代any',
          confidence: 0.8,
          priority: 3,
          actionable: true,
          action: {
            type: 'learn',
            payload: { topic: 'typescript-best-practices' }
          }
        })
      }
    }

    return recommendations.sort((a, b) => 
      b.priority - a.priority || b.confidence - a.confidence
    )
  }

  /**
   * 最佳实践建议
   */
  suggestBestPractices(context: {
    fileName: string
    fileType: string
    codeLines: number
  }): Recommendation[] {
    const recommendations: Recommendation[] = []

    // 规则1: 文件过大
    if (context.codeLines > 500) {
      recommendations.push({
        id: 'bp-file-size',
        type: 'bestPractice',
        title: '考虑拆分大文件',
        description: `文件有${context.codeLines}行，建议拆分`,
        reason: '保持文件在300行以内更易维护',
        confidence: 0.7,
        priority: 2,
        actionable: false
      })
    }

    // 规则2: 命名规范
    if (context.fileName.includes('_') && context.fileType === 'typescript') {
      recommendations.push({
        id: 'bp-naming',
        type: 'bestPractice',
        title: '使用PascalCase命名',
        description: '建议使用PascalCase而非snake_case',
        reason: 'TypeScript约定使用PascalCase',
        confidence: 0.85,
        priority: 2,
        actionable: true,
        action: {
          type: 'apply',
          payload: { fixType: 'rename-file' }
        }
      })
    }

    return recommendations
  }

  /**
   * 获取综合推荐
   */
  getRecommendations(params: {
    projectFeatures?: ProjectFeatures
    code?: string
    fileType?: string
    fileName?: string
    codeLines?: number
  }): Recommendation[] {
    const allRecommendations: Recommendation[] = []

    // 项目特征推荐
    if (params.projectFeatures) {
      allRecommendations.push(...this.recommendTemplates(params.projectFeatures))
    }

    // 代码优化推荐
    if (params.code && params.fileType) {
      allRecommendations.push(...this.suggestOptimizations(params.code, params.fileType))
    }

    // 最佳实践推荐
    if (params.fileName && params.fileType && params.codeLines) {
      allRecommendations.push(...this.suggestBestPractices({
        fileName: params.fileName,
        fileType: params.fileType,
        codeLines: params.codeLines
      }))
    }

    // 去重和排序
    const uniqueRecs = this.deduplicateRecommendations(allRecommendations)
    return uniqueRecs.sort((a, b) => 
      b.priority - a.priority || b.confidence - a.confidence
    ).slice(0, 10) // 最多返回10条
  }

  /**
   * 去重推荐
   */
  private deduplicateRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const seen = new Set<string>()
    return recommendations.filter(rec => {
      if (seen.has(rec.id)) {
        return false
      }
      seen.add(rec.id)
      return true
    })
  }
}
