import type { RuleContext } from '../stores/enhancedStateMachine'
import { getGlobalLogger } from '@smartabp/lowcode-shared'

const logger = getGlobalLogger()

/**
 * 动作执行器接口
 */
export interface IActionExecutor {
  /**
   * 执行器名称
   */
  readonly name: string
  
  /**
   * 执行器优先级
   */
  readonly priority: number
  
  /**
   * 执行动作
   */
  execute(params: any, context: RuleContext): Promise<any>
}

/**
 * 动作执行结果
 */
export interface ActionExecutionResult {
  success: boolean
  result?: any
  error?: string
}

/**
 * 🔥 动作执行器框架 - 企业级实现
 * 
 * 功能：
 * 1. 内置动作执行器（SetFieldValue, ShowMessage, CallAPI等）
 * 2. 动态注册自定义执行器
 * 3. 执行器优先级管理
 * 4. 执行结果处理和错误恢复
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */
export class ActionExecutor {
  private executors: Map<string, IActionExecutor> = new Map()
  
  constructor() {
    // 注册内置执行器
    this.registerBuiltInExecutors()
  }
  
  /**
   * 执行动作
   * 
   * @param action 动作表达式（格式：executorName(params)）
   * @param context 执行上下文
   * @returns 执行结果
   */
  async execute(action: string, context: RuleContext): Promise<any> {
    try {
      // 1. 解析动作表达式
      const { executorName, params } = this.parseAction(action)
      
      // 2. 获取执行器
      const executor = this.executors.get(executorName)
      if (!executor) {
        throw new ActionExecutorNotFoundError(
          `未找到动作执行器: ${executorName}`,
          executorName
        )
      }
      
      // 3. 执行动作
      logger.debug('⚡ 执行动作', { 
        executorName, 
        params,
        context: this.sanitizeContext(context)
      })
      
      const result = await executor.execute(params, context)
      
      logger.debug('✅ 动作执行成功', { executorName, result })
      
      return result
    } catch (error) {
      logger.error('❌ 动作执行失败', { action, error })
      throw error
    }
  }
  
  /**
   * 注册自定义执行器
   * 
   * @param executor 执行器实例
   */
  register(executor: IActionExecutor): void {
    if (this.executors.has(executor.name)) {
      logger.warn(`⚠️ 覆盖已存在的执行器: ${executor.name}`)
    }
    
    this.executors.set(executor.name, executor)
    logger.info(`✅ 注册执行器: ${executor.name}`)
  }
  
  /**
   * 注销执行器
   * 
   * @param executorName 执行器名称
   */
  unregister(executorName: string): void {
    if (this.executors.delete(executorName)) {
      logger.info(`✅ 注销执行器: ${executorName}`)
    }
  }
  
  /**
   * 获取所有已注册的执行器
   */
  getExecutors(): string[] {
    return Array.from(this.executors.keys())
  }
  
  /**
   * 解析动作表达式
   * 
   * @param action 动作表达式
   * @returns 执行器名称和参数
   */
  private parseAction(action: string): { executorName: string; params: any } {
    // 简单解析：executorName(params)
    // 例如：SetFieldValue({field: 'status', value: 'approved'})
    
    const match = action.match(/^(\w+)\((.*)\)$/)
    if (!match) {
      // 如果没有参数，就是简单的执行器名称
      return {
        executorName: action,
        params: {}
      }
    }
    
    const executorName = match[1]
    const paramsStr = match[2].trim()
    
    // 解析参数（JSON格式）
    let params: any = {}
    if (paramsStr) {
      try {
        // 安全地解析JSON参数
        params = JSON.parse(paramsStr)
      } catch (error) {
        logger.warn('⚠️ 参数解析失败，使用默认值', { paramsStr, error })
      }
    }
    
    return { executorName, params }
  }
  
  /**
   * 清理上下文敏感数据（用于日志）
   */
  private sanitizeContext(context: RuleContext): any {
    return {
      entity: context.entity ? Object.keys(context.entity) : [],
      environment: context.environment,
      hasUser: !!context.user
    }
  }
  
  /**
   * 注册内置执行器
   */
  private registerBuiltInExecutors(): void {
    // 1. SetFieldValue - 设置字段值
    this.register(new SetFieldValueExecutor())
    
    // 2. ShowMessage - 显示消息
    this.register(new ShowMessageExecutor())
    
    // 3. CallAPI - 调用API（占位实现）
    this.register(new CallAPIExecutor())
    
    // 4. ValidateField - 验证字段
    this.register(new ValidateFieldExecutor())
    
    logger.info('✅ 内置动作执行器注册完成')
  }
}

/**
 * SetFieldValue 执行器 - 设置字段值
 */
class SetFieldValueExecutor implements IActionExecutor {
  readonly name = 'SetFieldValue'
  readonly priority = 100
  
  async execute(params: { field: string; value: any }, context: RuleContext): Promise<any> {
    if (!params.field) {
      throw new Error('缺少必需参数: field')
    }
    
    // 设置字段值
    context.entity[params.field] = params.value
    
    logger.debug(`✅ 设置字段值: ${params.field} = ${params.value}`)
    
    return {
      field: params.field,
      value: params.value,
      success: true
    }
  }
}

/**
 * ShowMessage 执行器 - 显示消息
 */
class ShowMessageExecutor implements IActionExecutor {
  readonly name = 'ShowMessage'
  readonly priority = 50
  
  async execute(params: { message: string; type?: 'info' | 'success' | 'warning' | 'error' }, _context: RuleContext): Promise<any> {
    if (!params.message) {
      throw new Error('缺少必需参数: message')
    }
    
    const type = params.type || 'info'
    
    // 记录消息（实际应用中可能会显示UI通知）
    if (type === 'error') {
      logger.error(`📢 ${params.message}`)
    } else if (type === 'warning') {
      logger.warn(`📢 ${params.message}`)
    } else {
      logger.info(`📢 ${params.message}`)
    }
    
    return {
      message: params.message,
      type,
      success: true
    }
  }
}

/**
 * CallAPI 执行器 - 调用API
 */
class CallAPIExecutor implements IActionExecutor {
  readonly name = 'CallAPI'
  readonly priority = 80
  
  async execute(params: { url: string; method?: string; data?: any }, _context: RuleContext): Promise<any> {
    if (!params.url) {
      throw new Error('缺少必需参数: url')
    }
    
    const method = params.method || 'GET'
    
    logger.debug(`🌐 调用API: ${method} ${params.url}`)
    
    // TODO: 实际的API调用实现
    // 这里返回一个占位结果
    return {
      url: params.url,
      method,
      status: 'pending',
      message: 'API调用功能待实现'
    }
  }
}

/**
 * ValidateField 执行器 - 验证字段
 */
class ValidateFieldExecutor implements IActionExecutor {
  readonly name = 'ValidateField'
  readonly priority = 90
  
  async execute(params: { field: string; rules: string[] }, context: RuleContext): Promise<any> {
    if (!params.field) {
      throw new Error('缺少必需参数: field')
    }
    
    const fieldValue = context.entity[params.field]
    const rules = params.rules || []
    const errors: string[] = []
    
    // 执行验证规则
    for (const rule of rules) {
      if (rule === 'required' && !fieldValue) {
        errors.push(`${params.field}不能为空`)
      }
      
      if (rule === 'email' && fieldValue && !this.isValidEmail(fieldValue)) {
        errors.push(`${params.field}不是有效的邮箱地址`)
      }
      
      if (rule.startsWith('min:')) {
        const minLength = parseInt(rule.split(':')[1])
        if (fieldValue && fieldValue.length < minLength) {
          errors.push(`${params.field}长度不能小于${minLength}`)
        }
      }
      
      if (rule.startsWith('max:')) {
        const maxLength = parseInt(rule.split(':')[1])
        if (fieldValue && fieldValue.length > maxLength) {
          errors.push(`${params.field}长度不能大于${maxLength}`)
        }
      }
    }
    
    const isValid = errors.length === 0
    
    if (!isValid) {
      logger.warn(`⚠️ 字段验证失败: ${params.field}`, { errors })
    }
    
    return {
      field: params.field,
      isValid,
      errors,
      success: true
    }
  }
  
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

/**
 * 动作执行器未找到错误
 */
export class ActionExecutorNotFoundError extends Error {
  constructor(
    message: string,
    public readonly executorName: string
  ) {
    super(message)
    this.name = 'ActionExecutorNotFoundError'
  }
}
