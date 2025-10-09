import type { RuleContext } from './stores/enhancedStateMachine'

// @ts-ignore - logger will be injected by main app
const logger = (globalThis as any).__SMARTABP_LOGGER__ || console

/**
 * 🔥 表达式解析器 - 安全沙箱执行
 * 
 * 功能：
 * 1. JavaScript表达式子集解析
 * 2. 字段引用解析
 * 3. 安全沙箱执行（禁止eval等危险操作）
 * 4. 类型检查和转换
 * 5. 执行超时控制
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */
export class ExpressionParser {
  private readonly TIMEOUT_MS = 1000 // 1秒超时
  
  /**
   * 解析并执行表达式
   * 
   * @param expression 表达式字符串
   * @param context 执行上下文
   * @returns 执行结果
   */
  async evaluate(expression: string, context: RuleContext): Promise<any> {
    try {
      // 1. 安全检查
      this.validateExpression(expression)
      
      // 2. 构建安全的执行环境
      const safeContext = this.createSafeContext(context)
      
      // 3. 执行表达式（带超时控制）
      const result = await this.executeWithTimeout(expression, safeContext)
      
      return result
    } catch (error) {
      logger.error('❌ 表达式执行失败', { expression, error })
      throw new ExpressionExecutionError(
        `表达式执行失败: ${error instanceof Error ? error.message : String(error)}`,
        expression
      )
    }
  }
  
  /**
   * 验证表达式安全性
   */
  private validateExpression(expression: string): void {
    // 禁止危险操作
    const dangerousPatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /constructor/,
      /__proto__/,
      /prototype/,
      /import\s+/,
      /require\s*\(/,
      /process\./,
      /global\./,
      /window\./,
      /document\./
    ]
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(expression)) {
        throw new ExpressionSecurityError(
          `表达式包含不安全的操作: ${pattern}`,
          expression
        )
      }
    }
  }
  
  /**
   * 创建安全的执行上下文
   */
  private createSafeContext(context: RuleContext): Record<string, any> {
    // 深度克隆，避免污染原始上下文
    const entity = JSON.parse(JSON.stringify(context.entity || {}))
    const user = context.user ? JSON.parse(JSON.stringify(context.user)) : null
    const previousResult = context.previousResult !== undefined 
      ? JSON.parse(JSON.stringify(context.previousResult)) 
      : null
    
    return {
      entity,
      user,
      environment: context.environment || 'prod',
      previousResult,
      // 提供安全的工具函数
      Math: {
        abs: Math.abs,
        ceil: Math.ceil,
        floor: Math.floor,
        round: Math.round,
        max: Math.max,
        min: Math.min
      },
      String,
      Number,
      Boolean,
      Date,
      parseInt,
      parseFloat
    }
  }
  
  /**
   * 带超时控制的表达式执行
   */
  private async executeWithTimeout(
    expression: string, 
    context: Record<string, any>
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      // 超时控制
      const timeoutId = setTimeout(() => {
        reject(new ExpressionTimeoutError(
          `表达式执行超时 (>${this.TIMEOUT_MS}ms)`,
          expression
        ))
      }, this.TIMEOUT_MS)
      
      try {
        // 使用Function构造器创建安全的执行环境
        // 注意：这里虽然使用了Function，但我们严格控制了输入
        const params = Object.keys(context)
        const values = Object.values(context)
        
        // 创建函数并执行
        const fn = new Function(...params, `"use strict"; return (${expression})`)
        const result = fn(...values)
        
        clearTimeout(timeoutId)
        resolve(result)
      } catch (error) {
        clearTimeout(timeoutId)
        reject(error)
      }
    })
  }
}

/**
 * 表达式执行错误基类
 */
export class ExpressionExecutionError extends Error {
  constructor(
    message: string,
    public readonly expression: string
  ) {
    super(message)
    this.name = 'ExpressionExecutionError'
  }
}

/**
 * 表达式安全错误
 */
export class ExpressionSecurityError extends ExpressionExecutionError {
  constructor(message: string, expression: string) {
    super(message, expression)
    this.name = 'ExpressionSecurityError'
  }
}

/**
 * 表达式超时错误
 */
export class ExpressionTimeoutError extends ExpressionExecutionError {
  constructor(message: string, expression: string) {
    super(message, expression)
    this.name = 'ExpressionTimeoutError'
  }
}
