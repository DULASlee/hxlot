/**
 * BenchmarkEngine 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BenchmarkEngine } from './BenchmarkEngine'
import type { BenchmarkConfig } from './BenchmarkEngine'

describe('BenchmarkEngine', () => {
  let engine: BenchmarkEngine

  beforeEach(() => {
    engine = new BenchmarkEngine(false) // 使用内存存储
  })

  describe('基本功能测试', () => {
    it('应该成功创建引擎实例', () => {
      expect(engine).toBeInstanceOf(BenchmarkEngine)
      expect(engine.getBaselineManager()).toBeDefined()
      expect(engine.getRegressionDetector()).toBeDefined()
      expect(engine.getPerformanceOptimizer()).toBeDefined()
    })

    it('应该获取基线管理器', () => {
      const manager = engine.getBaselineManager()
      expect(manager).toBeDefined()
    })

    it('应该获取回归检测器', () => {
      const detector = engine.getRegressionDetector()
      expect(detector).toBeDefined()
    })
  })

  describe('基准测试执行', () => {
    it('应该执行简单的基准测试', async () => {
      const config: BenchmarkConfig = {
        name: '简单测试',
        version: '1.0.0',
        scenarios: [
          {
            id: 'test-1',
            name: '快速操作',
            testFn: async () => {
              await new Promise(resolve => setTimeout(resolve, 10))
              return 'done'
            },
            warmupIterations: 2,
            iterations: 5
          }
        ]
      }

      const result = await engine.runBenchmark(config)

      expect(result).toBeDefined()
      expect(result.name).toBe('简单测试')
      expect(result.version).toBe('1.0.0')
      expect(result.scenarioResults).toHaveLength(1)
      expect(result.scenarioResults[0].success).toBe(true)
      expect(result.scenarioResults[0].metrics.averageResponseTime).toBeGreaterThan(0)
    }, 10000)

    it('应该保存基准为基线', async () => {
      const config: BenchmarkConfig = {
        name: '基线测试',
        version: '1.0.0',
        saveAsBaseline: true,
        scenarios: [
          {
            id: 'baseline-test',
            name: '基线场景',
            testFn: async () => {
              await new Promise(resolve => setTimeout(resolve, 5))
            },
            iterations: 3
          }
        ]
      }

      const result = await engine.runBenchmark(config)

      expect(result.savedAsBaseline).toBe(true)
      expect(result.baselineId).toBeDefined()

      // 验证基线已保存
      const baseline = await engine.getBaselineManager().getBaseline(result.baselineId!)
      expect(baseline).toBeDefined()
      expect(baseline!.name).toBe('基线测试')
    }, 10000)
  })

  describe('回归检测', () => {
    it('应该检测性能回归', async () => {
      // 第一步：创建基线
      const baselineConfig: BenchmarkConfig = {
        name: '回归测试',
        version: '1.0.0',
        saveAsBaseline: true,
        scenarios: [
          {
            id: 'perf-test',
            name: '性能场景',
            testFn: async () => {
              await new Promise(resolve => setTimeout(resolve, 10))
            },
            iterations: 5
          }
        ]
      }

      const baselineResult = await engine.runBenchmark(baselineConfig)
      expect(baselineResult.savedAsBaseline).toBe(true)

      // 第二步：运行回归测试（故意慢一些）
      const regressionConfig: BenchmarkConfig = {
        name: '回归测试',
        version: '2.0.0',
        enableRegressionDetection: true,
        baselineId: baselineResult.baselineId,
        scenarios: [
          {
            id: 'perf-test',
            name: '性能场景',
            testFn: async () => {
              // 故意慢50%
              await new Promise(resolve => setTimeout(resolve, 15))
            },
            iterations: 5
          }
        ]
      }

      const regressionResult = await engine.runBenchmark(regressionConfig)

      expect(regressionResult.regressionReport).toBeDefined()
      expect(regressionResult.regressionReport!.scenarioResults).toHaveLength(1)
    }, 15000)
  })

  describe('性能优化器集成', () => {
    it('应该集成性能优化器', async () => {
      const config: BenchmarkConfig = {
        name: '优化测试',
        version: '1.0.0',
        enableOptimizer: true,
        scenarios: [
          {
            id: 'opt-test',
            name: '优化场景',
            testFn: async () => {
              const arr = Array.from({ length: 1000 }, (_, i) => i)
              return arr.reduce((sum, val) => sum + val, 0)
            },
            iterations: 3
          }
        ]
      }

      const result = await engine.runBenchmark(config)

      expect(result.optimizationReport).toBeDefined()
    }, 10000)
  })

  describe('错误处理', () => {
    it('应该正确处理场景失败', async () => {
      const config: BenchmarkConfig = {
        name: '错误测试',
        version: '1.0.0',
        scenarios: [
          {
            id: 'fail-test',
            name: '失败场景',
            testFn: async () => {
              throw new Error('测试错误')
            },
            iterations: 3
          }
        ]
      }

      const result = await engine.runBenchmark(config)

      expect(result.scenarioResults).toHaveLength(1)
      expect(result.scenarioResults[0].success).toBe(false)
      expect(result.scenarioResults[0].error).toBeDefined()
    }, 10000)

    it('应该正确处理超时', async () => {
      const config: BenchmarkConfig = {
        name: '超时测试',
        version: '1.0.0',
        scenarios: [
          {
            id: 'timeout-test',
            name: '超时场景',
            testFn: async () => {
              await new Promise(resolve => setTimeout(resolve, 2000))
            },
            iterations: 2,
            timeout: 100
          }
        ]
      }

      const result = await engine.runBenchmark(config)

      expect(result.scenarioResults).toHaveLength(1)
      expect(result.scenarioResults[0].success).toBe(false)
    }, 10000)
  })
})
