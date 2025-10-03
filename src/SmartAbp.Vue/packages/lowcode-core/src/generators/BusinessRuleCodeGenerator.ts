/**
 * 🔥 业务规则代码生成器
 * 
 * 功能：
 * 1. 将可视化设计的业务规则转换为前端验证代码
 * 2. 生成后端业务逻辑代码（C#）
 * 3. 支持多种规则类型的代码生成
 * 4. 提供代码模板和优化
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import type { BusinessRule } from '../stores/enhancedStateMachine'
import { getGlobalLogger } from '@smartabp/lowcode-shared'

const logger = getGlobalLogger()

export interface CodeGenerationOptions {
  entityName: string
  namespace?: string
  usings?: string[]
  includeComments?: boolean
}

export interface GeneratedCode {
  frontend: {
    validation: string
    types: string
  }
  backend: {
    service: string
    interface: string
  }
}

/**
 * 业务规则代码生成器
 */
export class BusinessRuleCodeGenerator {
  private entityName: string
  private namespace: string
  private includeComments: boolean

  constructor(options: CodeGenerationOptions) {
    this.entityName = options.entityName
    this.namespace = options.namespace || 'SmartAbp'
    this.includeComments = options.includeComments !== false
  }

  /**
   * 生成完整的前后端代码
   */
  generate(rules: BusinessRule[]): GeneratedCode {
    logger.info('🚀 开始生成业务规则代码', {
      entityName: this.entityName,
      ruleCount: rules.length
    })

    const frontend = {
      validation: this.generateFrontendValidation(rules),
      types: this.generateFrontendTypes(rules)
    }

    const backend = {
      service: this.generateBackendService(rules),
      interface: this.generateBackendInterface(rules)
    }

    logger.info('✅ 业务规则代码生成完成')

    return { frontend, backend }
  }

  /**
   * 生成前端验证规则代码
   */
  private generateFrontendValidation(rules: BusinessRule[]): string {
    const validationRules = rules.map(rule => this.generateValidationRule(rule))

    return `// 自动生成的前端验证规则
// 生成时间: ${new Date().toISOString()}
// 实体名称: ${this.entityName}

import type { ${this.entityName}Dto } from './types'

/**
 * 验证结果接口
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
  ruleId: string
}

/**
 * ${this.entityName} 验证规则
 */
export const ${this.entityName}ValidationRules = {
${validationRules.map((r, i) => `  rule${i + 1}: ${r}`).join(',\n')}
}

/**
 * 执行 ${this.entityName} 验证
 */
export function validate${this.entityName}(data: ${this.entityName}Dto): ValidationResult {
  const errors: ValidationError[] = []
  
${rules.map((rule, i) => this.generateValidationExecution(rule, i)).join('\n')}
  
  return {
    isValid: errors.length === 0,
    errors
  }
}`
  }

  /**
   * 生成单个验证规则
   */
  private generateValidationRule(rule: BusinessRule): string {
    const comment = this.includeComments ? `\n    // ${rule.description || rule.id}` : ''
    
    return `{${comment}
    id: '${rule.id}',
    condition: (data: ${this.entityName}Dto) => ${this.convertConditionToTypeScript(rule.condition || '')},
    action: (data: ${this.entityName}Dto, errors: ValidationError[]) => {
      ${this.convertActionToTypeScript(rule.action, 'errors')}
    }
  }`
  }

  /**
   * 生成验证执行代码
   */
  private generateValidationExecution(rule: BusinessRule, index: number): string {
    return `  // 规则: ${rule.description || rule.id}
  const rule${index + 1} = ${this.entityName}ValidationRules.rule${index + 1}
  if (rule${index + 1}.condition(data)) {
    rule${index + 1}.action(data, errors)
  }`
  }

  /**
   * 生成前端类型定义
   */
  private generateFrontendTypes(_rules: BusinessRule[]): string {
    return `// 自动生成的前端类型定义
// 生成时间: ${new Date().toISOString()}

export interface ${this.entityName}Dto {
  id?: string
  // 在此添加实体字段
  [key: string]: any
}

export interface ${this.entityName}RuleContext {
  entity: ${this.entityName}Dto
  user?: {
    id: string
    name: string
    roles: string[]
  }
  environment?: 'dev' | 'prod'
}`
  }

  /**
   * 生成后端业务逻辑服务
   */
  private generateBackendService(rules: BusinessRule[]): string {
    const ruleMethods = rules.map(rule => this.generateBackendRuleMethod(rule))

    return `// 自动生成的后端业务逻辑服务
// 生成时间: ${new Date().toISOString()}

using System;
using System.Threading.Tasks;
using Volo.Abp.Domain.Services;
using ${this.namespace}.Domain;

namespace ${this.namespace}.BusinessRules
{
    /// <summary>
    /// ${this.entityName} 业务规则服务
    /// </summary>
    public class ${this.entityName}BusinessRuleService : DomainService
    {
${ruleMethods.join('\n\n')}

        /// <summary>
        /// 执行所有业务规则
        /// </summary>
        public async Task ExecuteAllRulesAsync(${this.entityName} entity)
        {
${rules.map(rule => `            await Execute${this.sanitizeRuleName(rule.id)}Async(entity);`).join('\\n')}
        }
    }
}`
  }

  /**
   * 生成后端单个规则方法
   */
  private generateBackendRuleMethod(rule: BusinessRule): string {
    const methodName = this.sanitizeRuleName(rule.id)
    const comment = this.includeComments ? `        /// <summary>\n        /// ${rule.description || rule.id}\n        /// </summary>` : ''

    return `${comment}
        public async Task<bool> Execute${methodName}Async(${this.entityName} entity)
        {
            // 条件判断
            if (${this.convertConditionToCSharp(rule.condition || '')})
            {
                // 执行动作
                ${this.convertActionToCSharp(rule.action)}
                return true;
            }
            return false;
        }`
  }

  /**
   * 生成后端接口
   */
  private generateBackendInterface(rules: BusinessRule[]): string {
    return `// 自动生成的后端业务规则接口
// 生成时间: ${new Date().toISOString()}

using System.Threading.Tasks;
using ${this.namespace}.Domain;

namespace ${this.namespace}.BusinessRules
{
    /// <summary>
    /// ${this.entityName} 业务规则服务接口
    /// </summary>
    public interface I${this.entityName}BusinessRuleService
    {
${rules.map(rule => `        /// <summary>\n        /// ${rule.description || rule.id}\n        /// </summary>\n        Task<bool> Execute${this.sanitizeRuleName(rule.id)}Async(${this.entityName} entity);`).join('\n\n')}

        /// <summary>
        /// 执行所有业务规则
        /// </summary>
        Task ExecuteAllRulesAsync(${this.entityName} entity);
    }
}`
  }

  /**
   * 将条件表达式转换为TypeScript
   */
  private convertConditionToTypeScript(condition: string): string {
    if (!condition) return 'true'
    // 将entity.xxx替换为data.xxx
    return condition.replace(/entity\./g, 'data.')
  }

  /**
   * 将动作转换为TypeScript
   */
  private convertActionToTypeScript(action: string, errorsVar: string = 'errors'): string {
    if (!action) return '// 无动作'

    // 解析动作字符串，例如: "SetFieldValue(field='status', value='approved')"
    const match = action.match(/^(\w+)\((.*)\)$/)
    if (!match) return `// 未知动作: ${action}`

    const actionType = match[1]
    const params = this.parseActionParams(match[2])

    switch (actionType) {
      case 'SetFieldValue':
        return `data.${params.field} = ${this.formatValue(params.value)}`
      case 'ShowMessage':
        return `${errorsVar}.push({ field: 'global', message: '${params.message}', ruleId: this.id })`
      case 'ValidateField':
        return `if (!data.${params.field}) { ${errorsVar}.push({ field: '${params.field}', message: '${params.field} is required', ruleId: this.id }) }`
      default:
        return `// 动作类型未实现: ${actionType}`
    }
  }

  /**
   * 将条件表达式转换为C#
   */
  private convertConditionToCSharp(condition: string): string {
    if (!condition) return 'true'
    // 基本转换，实际可能需要更复杂的语法解析
    return condition
      .replace(/==/g, '==')
      .replace(/entity\./g, 'entity.')
      .replace(/&&/g, '&&')
      .replace(/\|\|/g, '||')
  }

  /**
   * 将动作转换为C#
   */
  private convertActionToCSharp(action: string): string {
    if (!action) return '// 无动作'

    const match = action.match(/^(\w+)\((.*)\)$/)
    if (!match) return `// 未知动作: ${action}`

    const actionType = match[1]
    const params = this.parseActionParams(match[2])

    switch (actionType) {
      case 'SetFieldValue':
        return `entity.${params.field} = ${this.formatValueCSharp(params.value)};`
      case 'ShowMessage':
        return `Logger.LogInformation("${params.message}");`
      case 'ValidateField':
        return `if (string.IsNullOrEmpty(entity.${params.field})) throw new BusinessException("${params.field} is required");`
      default:
        return `// 动作类型未实现: ${actionType}`
    }
  }

  /**
   * 解析动作参数
   */
  private parseActionParams(paramsStr: string): Record<string, any> {
    const params: Record<string, any> = {}
    const pairs = paramsStr.split(',')

    for (const pair of pairs) {
      const match = pair.trim().match(/^(\w+)\s*=\s*(?:'([^']*)'|(\d+\.?\d*)|(true|false))$/)
      if (match) {
        const key = match[1]
        if (match[2] !== undefined) { // 字符串
          params[key] = match[2]
        } else if (match[3] !== undefined) { // 数字
          params[key] = parseFloat(match[3])
        } else if (match[4] !== undefined) { // 布尔值
          params[key] = match[4] === 'true'
        }
      }
    }

    return params
  }

  /**
   * 格式化值为TypeScript
   */
  private formatValue(value: any): string {
    if (typeof value === 'string') return `'${value}'`
    if (typeof value === 'number') return value.toString()
    if (typeof value === 'boolean') return value.toString()
    return 'null'
  }

  /**
   * 格式化值为C#
   */
  private formatValueCSharp(value: any): string {
    if (typeof value === 'string') return `"${value}"`
    if (typeof value === 'number') return value.toString()
    if (typeof value === 'boolean') return value ? 'true' : 'false'
    return 'null'
  }

  /**
   * 清理规则名称为合法的方法名
   */
  private sanitizeRuleName(ruleName: string): string {
    return ruleName
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/^(\d)/, '_$1')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
  }
}
