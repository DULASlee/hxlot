/**
 * AI编程铁律执行引擎 v7.0 - 守护检查机制
 * 
 * @file guardian-check.ts
 * @description 执行引擎的自我守护检查，确保所有代码编写都在铁律下进行
 * @author 世界顶级低代码引擎架构师
 * @date 2025-10-04
 * @version 1.0.0-mvp
 */

import { simpleLogger, LogLevel, log,emergencyStop } from './simple-logger';
import { performanceMonitor, ExecutionStage } from './simple-checkpoint';
import { selfLearningManager } from './self-learning';
import { dynamicModeManager } from './dynamic-mode';

/**
 * 执行引擎守护检查器
 * 
 * 确保AI编程铁律100%执行，零容忍、零跳过
 */
export class ExecutionGuardian {
  private currentStage: ExecutionStage | null = null
  private codeLines: number = 0
  private filesModified: Set<string> = new Set()
  private ironRulesViolated: Set<string> = new Set()

  /**
   * 开始执行阶段
   */
  startStage(stage: ExecutionStage): void {
    this.currentStage = stage
    this.codeLines = 0
    this.filesModified.clear()
    this.ironRulesViolated.clear()
    
    simpleLogger.startStage(ExecutionStage[stage])
    simpleLogger.info(`🚀 开始执行阶段: ${ExecutionStage[stage]}`)
  }

  /**
   * 结束执行阶段
   */
  endStage(): void {
    if (!this.currentStage) return
    
    const stageName = ExecutionStage[this.currentStage]
    
    // 记录阶段完成
    simpleLogger.success(`✅ 完成阶段: ${stageName}`)
    
    // 检查铁律违规
    this.checkIronRulesViolation()
    
    this.currentStage = null
  }

  /**
   * 记录代码编写
   */
  recordCodeWrite(filePath: string, code: string): void {
    const lines = code.split('\n').length
    this.codeLines += lines
    this.filesModified.add(filePath)
    
    // 300行强制检查
    if (this.codeLines >= 300) {
      this.triggerForceStop('已达到300行代码限制')
    } else if (this.codeLines >= 280) {
      simpleLogger.warning(`⚠️ 警告：已编写${this.codeLines}行，接近300行限制`)
    }
  }

  /**
   * 检查铁律违规
   */
  private checkIronRulesViolation(): void {
    const violations = Array.from(this.ironRulesViolated)
    
    if (violations.length > 0) {
      simpleLogger.error('🚨 检测到铁律违规！', {
        violations: violations,
        stage: this.currentStage ? ExecutionStage[this.currentStage] : 'unknown'
      })
      
      // 记录学习
      violations.forEach(violation => {
        selfLearningManager.recordError('IRON_RULE_VIOLATION', violation)
      })
      
      this.triggerForceStop('铁律违规检测')
    }
  }

  /**
   * 记录铁律违规
   */
  recordViolation(rule: string, details?: string): void {
    const violation = details ? `${rule}: ${details}` : rule
    this.ironRulesViolated.add(violation)
    
    simpleLogger.warning(`⚠️ 铁律违规记录: ${violation}`)
  }

  /**
   * 强制停止执行
   */
  private triggerForceStop(reason: string): void {
    simpleLogger.error(`🚨 强制停止执行: ${reason}`)
    
    // 记录强制停止
    selfLearningManager.recordError('FORCE_STOP', reason)
    
    // 抛出错误强制停止
    throw new Error(`AI编程铁律强制停止: ${reason}`)
  }

  /**
   * 检查架构合规性
   */
  checkArchitectureCompliance(filePath: string, code: string): void {
    // 检查相对路径违规
    if (filePath.includes('/packages/') && code.includes("'../'")) {
      this.recordViolation('ARCHITECTURE_VIOLATION', 'packages中使用相对路径 ../')
    }

    // 检查主应用引用违规
    if (filePath.includes('/packages/') && code.includes("'@/'")) {
      this.recordViolation('ARCHITECTURE_VIOLATION', 'packages中引用主应用 @/')
    }

    // 检查类型安全绕过
    if (code.includes('as any') || code.includes('@ts-ignore')) {
      this.recordViolation('TYPE_SAFETY_VIOLATION', '使用 as any 或 @ts-ignore')
    }
  }

  /**
   * 获取当前状态报告
   */
  getStatusReport(): {
    currentStage: string | null
    codeLines: number
    filesModified: string[]
    violations: string[]
  } {
    return {
      currentStage: this.currentStage ? ExecutionStage[this.currentStage] : null,
      codeLines: this.codeLines,
      filesModified: Array.from(this.filesModified),
      violations: Array.from(this.ironRulesViolated)
    }
  }

  /**
   * 重置守护状态
   */
  reset(): void {
    this.currentStage = null
    this.codeLines = 0
    this.filesModified.clear()
    this.ironRulesViolated.clear()
  }
}

/**
 * 全局守护实例
 */
export const executionGuardian = new ExecutionGuardian()

/**
 * 守护检查装饰器
 * 
 * 用于包装函数执行，确保在铁律守护下运行
 */
export function withGuardian<T extends any[]>(fn: (...args: T) => any) {
  return function (...args: T) {
    try {
      // 开始守护
      executionGuardian.startStage(ExecutionStage.STAGE3_INCREMENTAL_CODING)
      
      const result = fn(...args)
      
      // 结束守护
      executionGuardian.endStage()
      
      return result
    } catch (error) {
      // 记录错误并重新抛出
      selfLearningManager.recordError('GUARDIAN_EXECUTION_ERROR', error.message)
      throw error
    }
  }
}

/**
 * 铁律检查函数
 */
export function enforceIronRules(): void {
  // 检查执行引擎是否已启动
  if (!executionGuardian.getStatusReport().currentStage) {
    executionGuardian.recordViolation('ENGINE_NOT_STARTED', '未启动AI编程铁律执行引擎')
  }

  // 检查编程前学习是否完成
  if (dynamicModeManager.isEmergencyMode()) {
    log(LogLevel.WARN, '🚨 Emergency mode is active. Skipping pre-programming learning.');
    return;
  }
  performanceMonitor.startStage(ExecutionStage.STAGE1_PRE_PROGRAMMING_LEARNING);
  log(LogLevel.INFO, '🧠 Stage 1: Pre-programming learning started...');
  // Add learning logic here
  performanceMonitor.endStage(ExecutionStage.STAGE1_PRE_PROGRAMMING_LEARNING);
  // 这里可以添加更多的铁律检查...
}

// 导出铁律检查
// 在每次代码编写前调用此函数
export const checkIronRulesBeforeCoding = enforceIronRules
