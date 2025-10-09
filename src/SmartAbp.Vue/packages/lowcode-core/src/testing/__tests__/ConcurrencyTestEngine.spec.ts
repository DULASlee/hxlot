/**
 * ConcurrencyTestEngine 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ConcurrencyTestEngine } from './ConcurrencyTestEngine'
import { ConcurrencyTestScenarioBuilder } from './ConcurrencyScenario'

describe('ConcurrencyTestEngine', () => {
  let engine: ConcurrencyTestEngine

  beforeEach(() => {
    engine = new ConcurrencyTestEngine()
  })

  describe('基本功能测试', () => {
    it('应该成功创建引擎实例', () => {
      expect(engine).toBeInstanceOf(ConcurrencyTestEngine)
      expect(engine.isTestRunning()).toBe(false)
    })

    it('应该成功获取竞态检测器', () => {
      const detector = engine.getRaceDetector()
      expect(detector).toBeDefined()
      expect(detector.getRaceConditionCount()).toBe(0)
      expect(detector.getDeadlockCount()).toBe(0)
    })
  })

  describe('并发测试执行', () => {
    it('应该执行简单的并发测试场景', async () => {
      let counter = 0

      const scenario = new ConcurrencyTestScenarioBuilder()
        .withId('test-scenario-1')
        .withName('简单并发测试')
        .withConcurrencyLevel(10)
        .withTestDuration(2)
        .addSharedResource({
          id: 'counter',
          name: '计数器',
          type: 'data',
          initialValue: 0
        })
        .addOperation({
          id: 'increment',
          name: '增加计数',
          type: 'write',
          action: async () => {
            counter++
            await new Promise(resolve => setTimeout(resolve, 10))
            return counter
          },
          expectedBehavior: 'atomic',
          timeout: 1000,
          sharedResources: ['counter']
        })
        .build()

      const result = await engine.testConcurrency(scenario)

      expect(result).toBeDefined()
      expect(result.scenarioId).toBe('test-scenario-1')
      expect(result.operationStats.totalOperations).toBeGreaterThan(0)
      expect(result.concurrencyStats.maxConcurrentOperations).toBeGreaterThan(0)
      expect(result.concurrencyStats.maxConcurrentOperations).toBeLessThanOrEqual(10)
    }, 10000)

    it('应该检测到竞态条件', async () => {
      let sharedValue = 0

      const scenario = new ConcurrencyTestScenarioBuilder()
        .withId('race-test')
        .withName('竞态条件测试')
        .withConcurrencyLevel(5)
        .withTestDuration(1)
        .addSharedResource({
          id: 'shared-value',
          name: '共享值',
          type: 'data'
        })
        .addOperation({
          id: 'write-op',
          name: '写操作',
          type: 'write',
          action: async () => {
            const temp = sharedValue
            await new Promise(resolve => setTimeout(resolve, 1))
            sharedValue = temp + 1
          },
          expectedBehavior: 'atomic',
          timeout: 500,
          sharedResources: ['shared-value'],
          weight: 1
        })
        .withRaceConditionDetection(true)
        .build()

      const result = await engine.testConcurrency(scenario)

      expect(result.raceDetection).toBeDefined()
      expect(result.raceDetection!.raceConditions.length).toBeGreaterThan(0)
    }, 10000)
  })

  describe('并发统计', () => {
    it('应该正确统计并发操作数', async () => {
      const scenario = new ConcurrencyTestScenarioBuilder()
        .withId('stats-test')
        .withName('统计测试')
        .withConcurrencyLevel(20)
        .withTestDuration(1)
        .addOperation({
          id: 'task',
          name: '任务',
          type: 'custom',
          action: async () => {
            await new Promise(resolve => setTimeout(resolve, 50))
          },
          expectedBehavior: 'isolated',
          timeout: 1000
        })
        .build()

      const result = await engine.testConcurrency(scenario)

      expect(result.concurrencyStats.maxConcurrentOperations).toBeGreaterThan(0)
      expect(result.concurrencyStats.maxConcurrentOperations).toBeLessThanOrEqual(20)
      expect(result.concurrencyStats.averageConcurrency).toBeGreaterThan(0)
    }, 10000)
  })

  describe('错误处理', () => {
    it('应该正确处理操作失败', async () => {
      const scenario = new ConcurrencyTestScenarioBuilder()
        .withId('error-test')
        .withName('错误测试')
        .withConcurrencyLevel(5)
        .withTestDuration(1)
        .addOperation({
          id: 'failing-op',
          name: '失败操作',
          type: 'custom',
          action: async () => {
            throw new Error('操作失败')
          },
          expectedBehavior: 'isolated',
          timeout: 1000
        })
        .build()

      const result = await engine.testConcurrency(scenario)

      expect(result.operationStats.failedOperations).toBeGreaterThan(0)
      expect(result.operationStats.totalOperations).toBeGreaterThan(0)
    }, 10000)

    it('应该正确处理操作超时', async () => {
      const scenario = new ConcurrencyTestScenarioBuilder()
        .withId('timeout-test')
        .withName('超时测试')
        .withConcurrencyLevel(2)
        .withTestDuration(1)
        .addOperation({
          id: 'timeout-op',
          name: '超时操作',
          type: 'custom',
          action: async () => {
            await new Promise(resolve => setTimeout(resolve, 2000))
          },
          expectedBehavior: 'isolated',
          timeout: 100 // 很短的超时
        })
        .build()

      const result = await engine.testConcurrency(scenario)

      expect(result.operationStats.failedOperations).toBeGreaterThan(0)
    }, 10000)
  })
})
