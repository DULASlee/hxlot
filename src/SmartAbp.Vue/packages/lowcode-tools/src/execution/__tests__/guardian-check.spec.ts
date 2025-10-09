/**
 * AI编程铁律执行引擎 v7.0 - 单元测试
 * 
 * @file guardian-check.spec.ts
 * @description 执行引擎守护检查机制的单元测试
 * @author 世界顶级低代码引擎架构师
 * @date 2025-10-04
 * @version 1.0.0-mvp
 */

import { ExecutionGuardian, executionGuardian, enforceIronRules, withGuardian } from './guardian-check'
import { learningManager, ExecutionStage } from './simple-checkpoint'

describe('ExecutionGuardian 执行引擎守护', () => {
  let guardian: ExecutionGuardian

  beforeEach(() => {
    guardian = new ExecutionGuardian()
    learningManager.clear()
  })

  test('应该正确开始和结束执行阶段', () => {
    guardian.startStage(ExecutionStage.STAGE3_INCREMENTAL_CODING)
    
    const status = guardian.getStatusReport()
    expect(status.currentStage).toBe('STAGE3_INCREMENTAL_CODING')
    expect(status.codeLines).toBe(0)
    expect(status.violations.length).toBe(0)
    
    guardian.endStage()
    
    const finalStatus = guardian.getStatusReport()
    expect(finalStatus.currentStage).toBeNull()
  })

  test('应该正确记录代码编写行数', () => {
    guardian.startStage(ExecutionStage.STAGE3_INCREMENTAL_CODING)
    
    guardian.recordCodeWrite('test.ts', 'line1\nline2\nline3')
    guardian.recordCodeWrite('test2.ts', 'line1\nline2')
    
    const status = guardian.getStatusReport()
    expect(status.codeLines).toBe(5)
    expect(status.filesModified).toEqual(['test.ts', 'test2.ts'])
  })

  test('应该在280行时发出警告', () => {
    guardian.startStage(ExecutionStage.STAGE3_INCREMENTAL_CODING)
    
    // 模拟280行代码
    const largeCode = Array(280).fill('console.log("test")').join('\n')
    guardian.recordCodeWrite('large-file.ts', largeCode)
    
    const status = guardian.getStatusReport()
    expect(status.codeLines).toBe(280)
    // 警告会在控制台输出，这里主要测试行数计数正确
  })

  test('应该在300行时强制停止', () => {
    guardian.startStage(ExecutionStage.STAGE3_INCREMENTAL_CODING)
    
    // 模拟300行代码
    const largeCode = Array(300).fill('console.log("test")').join('\n')
    
    expect(() => {
      guardian.recordCodeWrite('large-file.ts', largeCode)
    }).toThrow('AI编程铁律强制停止: 已达到300行代码限制')
  })

  test('应该检测架构违规', () => {
    guardian.startStage(ExecutionStage.STAGE3_INCREMENTAL_CODING)
    
    // 测试相对路径违规
    guardian.checkArchitectureCompliance(
      'packages/lowcode-core/test.ts', 
      'import something from "../other"'
    )
    
    // 测试主应用引用违规
    guardian.checkArchitectureCompliance(
      'packages/lowcode-core/test.ts', 
      'import something from "@/utils"'
    )
    
    // 测试类型安全绕过
    guardian.checkArchitectureCompliance(
      'packages/lowcode-core/test.ts', 
      'const data = response as any'
    )
    
    const status = guardian.getStatusReport()
    expect(status.violations.length).toBe(3)
    expect(status.violations).toContain('ARCHITECTURE_VIOLATION: packages中使用相对路径 ../')
    expect(status.violations).toContain('ARCHITECTURE_VIOLATION: packages中引用主应用 @/')
    expect(status.violations).toContain('TYPE_SAFETY_VIOLATION: 使用 as any 或 @ts-ignore')
  })

  test('应该在阶段结束时检查违规并强制停止', () => {
    guardian.startStage(ExecutionStage.STAGE3_INCREMENTAL_CODING)
    
    // 记录违规
    guardian.recordViolation('TEST_VIOLATION', '测试违规')
    
    expect(() => {
      guardian.endStage()
    }).toThrow('AI编程铁律强制停止: 铁律违规检测')
  })

  test('应该记录学习信息', () => {
    guardian.startStage(ExecutionStage.STAGE3_INCREMENTAL_CODING)
    
    // 记录违规
    guardian.recordViolation('TEST_VIOLATION', '测试违规')
    
    try {
      guardian.endStage()
    } catch (error) {
      // 预期会抛出错误
    }
    
    // 检查学习记录
    const errorReport = learningManager.getErrorReport()
    expect(errorReport.length).toBe(1)
    expect(errorReport[0][0]).toBe('IRON_RULE_VIOLATION:TEST_VIOLATION: 测试违规')
  })
})

describe('withGuardian 装饰器', () => {
  test('应该正确包装函数执行', () => {
    const testFn = jest.fn().mockReturnValue('test-result')
    const guardedFn = withGuardian(testFn)
    
    const result = guardedFn('arg1', 'arg2')
    
    expect(testFn).toHaveBeenCalledWith('arg1', 'arg2')
    expect(result).toBe('test-result')
  })

  test('应该在函数抛出错误时记录学习', () => {
    const errorFn = jest.fn().mockImplementation(() => {
      throw new Error('test error')
    })
    
    const guardedFn = withGuardian(errorFn)
    
    expect(() => {
      guardedFn()
    }).toThrow('test error')
    
    // 检查学习记录
    const errorReport = learningManager.getErrorReport()
    expect(errorReport.length).toBe(1)
    expect(errorReport[0][0]).toContain('GUARDIAN_EXECUTION_ERROR')
  })
})

describe('enforceIronRules 铁律检查', () => {
  test('应该检查执行引擎未启动违规', () => {
    const guardian = new ExecutionGuardian()
    
    // 重置状态确保未启动
    guardian.reset()
    
    // 直接调用铁律检查
    enforceIronRules.call({ executionGuardian: guardian })
    
    const status = guardian.getStatusReport()
    expect(status.violations).toContain('ENGINE_NOT_STARTED: 未启动AI编程铁律执行引擎')
  })
})

describe('全局实例', () => {
  test('executionGuardian 应该是 ExecutionGuardian 实例', () => {
    expect(executionGuardian).toBeInstanceOf(ExecutionGuardian)
  })
})
