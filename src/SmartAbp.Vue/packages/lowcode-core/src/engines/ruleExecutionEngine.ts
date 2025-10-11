import type { 
  BusinessRule, 
  RuleContext, 
  RuleExecutionResult, 
  SingleRuleResult,
  RuleExecutionError
} from '../stores/enhancedStateMachine'

// 重新导出类型供外部使用
export type { BusinessRule, RuleContext } from '../stores/enhancedStateMachine'

// 规则条件接口
export interface RuleCondition {
  expression: string
  operator: 'AND' | 'OR' | 'NOT'
  operands?: RuleCondition[]
}
import { ExpressionParser } from '../utils/ruleExpressionParser'
import { ActionExecutor } from './actionExecutor'
import { getGlobalLogger } from '@smartabp/lowcode-shared'

const logger = getGlobalLogger()

/**
 * 🔥 规则执行引擎 - 企业级实现
 * 
 * 功能：
 * 1. 规则优先级排序和执行
 * 2. 条件表达式安全解析
 * 3. 动作执行器调度
 * 4. 错误处理和恢复
 * 5. 执行日志和性能监控
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */
export class RuleExecutionEngine {
  private expressionParser: ExpressionParser
  private actionExecutor: ActionExecutor
  private debugMode: boolean = false
  
  constructor() {
    this.expressionParser = new ExpressionParser()
    this.actionExecutor = new ActionExecutor()
  }
  
  /**
   * 执行多条业务规则
   * 
   * @param rules 业务规则列表
   * @param context 执行上下文
   * @returns 执行结果
   */
  async executeRules(
    rules: BusinessRule[], 
    context: RuleContext
  ): Promise<RuleExecutionResult> {
    const startTime = performance.now()
    
    logger.info('🚀 开始执行业务规则', { 
      ruleCount: rules.length,
      context: this.sanitizeContext(context)
    })
    
    // 1. 过滤启用的规则
    const enabledRules = rules.filter(rule => rule.enabled !== false)
    
    // 2. 按优先级排序（优先级高的先执行）
    const sortedRules = this.sortRulesByPriority(enabledRules)
    
    // 3. 执行规则
    const results: SingleRuleResult[] = []
    const errors: RuleExecutionError[] = []
    let executedCount = 0
    let failedCount = 0
    
    for (const rule of sortedRules) {
      try {
        const result = await this.executeRule(rule, context)
        results.push(result)
        
        if (result.success) {
          executedCount++
          // 更新上下文，传递给下一个规则
          context.previousResult = result.result
        } else {
          failedCount++
        }
      } catch (error) {
        failedCount++
        const ruleError: RuleExecutionError = {
          ruleId: rule.id,
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now(),
          context: this.sanitizeContext(context)
        }
        errors.push(ruleError)
        
        logger.error('❌ 规则执行失败', ruleError)
      }
    }
    
    const duration = performance.now() - startTime
    
    const finalResult: RuleExecutionResult = {
      success: failedCount === 0,
      executedCount,
      failedCount,
      results,
      errors,
      duration
    }
    
    logger.info('✅ 业务规则执行完成', {
      success: finalResult.success,
      executedCount,
      failedCount,
      duration: `${duration.toFixed(2)}ms`
    })
    
    return finalResult
  }
  
  /**
   * 执行单条业务规则
   * 
   * @param rule 业务规则
   * @param context 执行上下文
   * @returns 执行结果
   */
  async executeRule(
    rule: BusinessRule, 
    context: RuleContext
  ): Promise<SingleRuleResult> {
    const startTime = performance.now()
    
    if (this.debugMode) {
      logger.debug('🔍 执行规则', { ruleId: rule.id, rule })
    }
    
    try {
      // 1. 检查条件
      let conditionMet = true
      if (rule.condition) {
        conditionMet = await this.expressionParser.evaluate(
          rule.condition, 
          context
        )
        
        if (this.debugMode) {
          logger.debug('📊 条件判断', { 
            ruleId: rule.id,
            condition: rule.condition,
            result: conditionMet 
          })
        }
      }
      
      // 2. 如果条件满足，执行动作
      let actionExecuted = false
      let result: any = null
      
      if (conditionMet) {
        result = await this.actionExecutor.execute(
          rule.action, 
          context
        )
        actionExecuted = true
        
        if (this.debugMode) {
          logger.debug('⚡ 动作执行', { 
            ruleId: rule.id,
            action: rule.action,
            result 
          })
        }
      }
      
      const duration = performance.now() - startTime
      
      return {
        ruleId: rule.id,
        success: true,
        conditionMet,
        actionExecuted,
        result,
        duration
      }
    } catch (error) {
      const duration = performance.now() - startTime
      
      return {
        ruleId: rule.id,
        success: false,
        conditionMet: false,
        actionExecuted: false,
        error: error instanceof Error ? error.message : String(error),
        duration
      }
    }
  }
  
  /**
   * 按优先级排序规则
   */
  private sortRulesByPriority(rules: BusinessRule[]): BusinessRule[] {
    return [...rules].sort((a, b) => {
      const priorityA = a.priority ?? 0
      const priorityB = b.priority ?? 0
      return priorityB - priorityA // 优先级高的在前
    })
  }
  
  /**
   * 清理上下文敏感数据（用于日志）
   */
  private sanitizeContext(context: RuleContext): any {
    return {
      entity: context.entity ? Object.keys(context.entity) : [],
      environment: context.environment,
      hasUser: !!context.user,
      hasPreviousResult: !!context.previousResult
    }
  }
  
  /**
   * 启用调试模式
   */
  enableDebug(): void {
    this.debugMode = true
    logger.info('🐛 规则执行引擎调试模式已启用')
  }
  
  /**
   * 禁用调试模式
   */
  disableDebug(): void {
    this.debugMode = false
    logger.info('🐛 规则执行引擎调试模式已禁用')
  }
  
  /**
   * 获取动作执行器
   */
  getActionExecutor(): ActionExecutor {
    return this.actionExecutor
  }
  
  /**
   * 获取表达式解析器
   */
  getExpressionParser(): ExpressionParser {
    return this.expressionParser
  }
}
