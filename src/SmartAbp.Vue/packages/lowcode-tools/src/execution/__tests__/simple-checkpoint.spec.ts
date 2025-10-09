/**
 * AI编程铁律执行引擎 v7.0 - 单元测试
 * 
 * @file simple-checkpoint.spec.ts
 * @description 性能监控和AI学习管理器的单元测试
 * @author 世界顶级低代码引擎架构师
 * @date 2025-10-04
 * @version 1.0.0-mvp
 */

import { PerformanceMonitor, PERFORMANCE_BASELINE, performanceMonitor, SimpleLearningManager, learningManager, ExecutionStage } from './simple-checkpoint'

describe('PerformanceMonitor 性能监控', () => {
  let monitor: PerformanceMonitor

  beforeEach(() => {
    monitor = new PerformanceMonitor()
  })

  test('应该正确启动和结束性能监控', () => {
    const stage = ExecutionStage.STAGE1_TRIGGER_DETECTION
    const baseline = PERFORMANCE_BASELINE[stage]
    
    monitor.start(stage, baseline)
    const result = monitor.end(stage)
    
    expect(result).not.toBeNull()
    expect(result!.stage).toBe(stage)
    expect(result!.baseline).toBe(baseline)
    expect(result!.duration).toBeGreaterThan(0)
    expect(result!.deviation).toBeDefined()
    expect(['NORMAL', 'SLOW', 'CRITICAL']).toContain(result!.status)
  })

  test('应该检测执行缓慢状态', () => {
    const stage = ExecutionStage.STAGE1_TRIGGER_DETECTION
    const baseline = 100 // 设置一个小的基准值
    
    monitor.start(stage, baseline)
    
    // 模拟延迟执行
    const startTime = Date.now()
    while (Date.now() - startTime < 200) {
      // 等待200ms，超过基准值
    }
    
    const result = monitor.end(stage)
    
    expect(result!.status).toBe('CRITICAL')
    expect(result!.deviation).toBeGreaterThan(100) // 超过100%
  })

  test('应该生成性能报告', () => {
    const stages = [
      ExecutionStage.STAGE1_TRIGGER_DETECTION,
      ExecutionStage.STAGE2_PRE_LEARNING
    ]
    
    stages.forEach(stage => {
      monitor.start(stage, PERFORMANCE_BASELINE[stage])
      monitor.end(stage)
    })
    
    const report = monitor.getReport()
    
    expect(report.length).toBe(2)
    expect(report[0].stage).toBe(stages[0])
    expect(report[1].stage).toBe(stages[1])
  })
})

describe('SimpleLearningManager AI学习管理器', () => {
  let manager: SimpleLearningManager

  beforeEach(() => {
    manager = new SimpleLearningManager()
  })

  test('应该正确记录错误和成功', () => {
    manager.recordError('TEST_ERROR', 'context1')
    manager.recordSuccess('TEST_ERROR', 'context1')
    manager.recordError('TEST_ERROR', 'context2')
    
    const errorReport = manager.getErrorReport()
    const successRate = manager.getSuccessRate()
    
    expect(errorReport.length).toBe(2) // 两个不同的上下文
    expect(successRate['TEST_ERROR']).toBe(50) // 成功率50%
  })

  test('应该生成高频错误警告', () => {
    // 记录3次相同错误
    manager.recordError('FREQUENT_ERROR')
    manager.recordError('FREQUENT_ERROR') 
    manager.recordError('FREQUENT_ERROR')
    
    const errorReport = manager.getErrorReport()
    
    expect(errorReport.length).toBe(1)
    expect(errorReport[0][1]).toBe(3) // 发生3次
  })

  test('应该生成学习建议', () => {
    // 记录足够多的错误来触发建议
    for (let i = 0; i < 3; i++) {
      manager.recordError('SUGGESTION_ERROR')
    }
    
    const suggestions = manager.generateSuggestions()
    
    expect(suggestions.length).toBe(1)
    expect(suggestions[0]).toContain('SUGGESTION_ERROR')
    expect(suggestions[0]).toContain('3次')
  })

  test('应该清空学习记录', () => {
    manager.recordError('TEST_ERROR')
    manager.recordSuccess('TEST_ERROR')
    
    manager.clear()
    
    const errorReport = manager.getErrorReport()
    const successRate = manager.getSuccessRate()
    
    expect(errorReport.length).toBe(0)
    expect(Object.keys(successRate).length).toBe(0)
  })
})

describe('全局实例', () => {
  test('performanceMonitor 应该是 PerformanceMonitor 实例', () => {
    expect(performanceMonitor).toBeInstanceOf(PerformanceMonitor)
  })

  test('learningManager 应该是 SimpleLearningManager 实例', () => {
    expect(learningManager).toBeInstanceOf(SimpleLearningManager)
  })

  test('PERFORMANCE_BASELINE 应该包含所有执行阶段', () => {
    const stages = Object.values(ExecutionStage)
    
    stages.forEach(stage => {
      expect(PERFORMANCE_BASELINE[stage]).toBeDefined()
      expect(PERFORMANCE_BASELINE[stage]).toBeGreaterThan(0)
    })
  })
})
