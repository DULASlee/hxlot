/**
 * LoadTestEngine 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LoadTestEngine } from './LoadTestEngine'
import { LoadTestScenarioBuilder } from './LoadTestScenario'
import { PerformanceOptimizer } from './../analyzers/PerformanceOptimizer'

describe('LoadTestEngine', () => {
  let engine: LoadTestEngine
  let mockOptimizer: PerformanceOptimizer

  beforeEach(() => {
    mockOptimizer = new PerformanceOptimizer()
    engine = new LoadTestEngine(mockOptimizer)
  })

  describe('基本功能测试', () => {
    it('应该成功创建引擎实例', () => {
      expect(engine).toBeInstanceOf(LoadTestEngine)
      expect(engine.isTestRunning()).toBe(false)
    })

    it('应该正确获取初始进度', () => {
      const progress = engine.getProgress()
      
      expect(progress.phase).toBe('preparing')
      expect(progress.activeUsers).toBe(0)
      expect(progress.completedRequests).toBe(0)
      expect(progress.progressPercent).toBe(0)
    })
  })

  describe('负载测试执行', () => {
    it('应该执行简单的负载测试场景', async () => {
      // 构建测试场景
      const scenario = new LoadTestScenarioBuilder()
        .withId('test-scenario-1')
        .withName('测试场景1')
        .withVirtualUsers(2)
        .withDuration(3)
        .withRampUpTime(1)
        .addEndpoint({
          url: 'https://jsonplaceholder.typicode.com/posts/1',
          method: 'GET',
          weight: 1
        })
        .build()

      // 执行测试（使用mock避免真实网络请求）
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-length': '100' })
      } as Response)

      const result = await engine.executeLoadTest(scenario)

      expect(result).toBeDefined()
      expect(result.scenarioId).toBe('test-scenario-1')
      expect(result.overallStats.totalRequests).toBeGreaterThan(0)
      expect(result.duration).toBeGreaterThanOrEqual(3)
      expect(result.userStats).toHaveLength(2)
    }, 10000) // 增加超时时间

    it('应该正确处理测试失败', async () => {
      const scenario = new LoadTestScenarioBuilder()
        .withId('test-scenario-fail')
        .withName('失败测试场景')
        .withVirtualUsers(1)
        .withDuration(1)
        .withRampUpTime(0)
        .addEndpoint({
          url: 'https://invalid-url-that-does-not-exist.com',
          method: 'GET',
          weight: 1
        })
        .build()

      // Mock网络错误
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))

      const result = await engine.executeLoadTest(scenario)

      expect(result).toBeDefined()
      expect(result.overallStats.failedRequests).toBeGreaterThan(0)
      expect(result.overallStats.successRate).toBe(0)
      expect(result.errorStats.length).toBeGreaterThan(0)
    }, 10000)
  })

  describe('进度跟踪', () => {
    it('应该正确报告测试进度', async () => {
      const scenario = new LoadTestScenarioBuilder()
        .withId('progress-test')
        .withName('进度测试')
        .withVirtualUsers(2)
        .withDuration(2)
        .withRampUpTime(1)
        .addEndpoint({
          url: 'https://jsonplaceholder.typicode.com/posts/1',
          method: 'GET',
          weight: 1
        })
        .build()

      // Mock fetch
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-length': '100' })
      } as Response)

      // 启动测试（不等待完成）
      const testPromise = engine.executeLoadTest(scenario)

      // 等待一下让测试开始
      await new Promise(resolve => setTimeout(resolve, 500))

      // 检查进度
      const progress = engine.getProgress()
      expect(progress.phase).toMatch(/ramping-up|steady-state/)
      expect(progress.activeUsers).toBeGreaterThan(0)
      expect(progress.totalUsers).toBe(2)

      // 等待测试完成
      await testPromise

      // 检查最终进度
      const finalProgress = engine.getProgress()
      expect(finalProgress.phase).toBe('completed')
    }, 10000)
  })

  describe('停止测试', () => {
    it('应该能够手动停止测试', async () => {
      const scenario = new LoadTestScenarioBuilder()
        .withId('stop-test')
        .withName('停止测试')
        .withVirtualUsers(5)
        .withDuration(10) // 较长的测试时间
        .withRampUpTime(0)
        .addEndpoint({
          url: 'https://jsonplaceholder.typicode.com/posts/1',
          method: 'GET',
          weight: 1
        })
        .build()

      // Mock fetch
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-length': '100' })
      } as Response)

      // 启动测试
      const testPromise = engine.executeLoadTest(scenario)

      // 等待测试开始
      await new Promise(resolve => setTimeout(resolve, 500))

      expect(engine.isTestRunning()).toBe(true)

      // 停止测试
      await engine.stopTest()

      expect(engine.isTestRunning()).toBe(false)

      // 等待测试Promise完成（应该会快速完成）
      await testPromise.catch(() => {}) // 可能会抛出错误，忽略
    }, 15000)
  })

  describe('性能优化器集成', () => {
    it('应该集成PerformanceOptimizer进行分析', async () => {
      const scenario = new LoadTestScenarioBuilder()
        .withId('perf-test')
        .withName('性能测试')
        .withVirtualUsers(1)
        .withDuration(1)
        .withRampUpTime(0)
        .addEndpoint({
          url: 'https://jsonplaceholder.typicode.com/posts/1',
          method: 'GET',
          weight: 1
        })
        .build()

      // Mock fetch
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-length': '100' })
      } as Response)

      const result = await engine.executeLoadTest(scenario)

      // 检查是否有性能报告
      expect(result.performanceReport).toBeDefined()
      expect(result.performanceReport).toHaveProperty('metrics')
      expect(result.performanceReport).toHaveProperty('score')
    }, 10000)
  })
})
