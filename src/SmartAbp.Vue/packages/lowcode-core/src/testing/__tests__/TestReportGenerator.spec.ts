/**
 * TestReportGenerator 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { TestReportGenerator } from './TestReportGenerator'
import type { LoadTestResult } from './LoadTestEngine'
import type { ConcurrencyTestResult } from './ConcurrencyTestEngine'
import type { BenchmarkResult } from './BenchmarkEngine'

describe('TestReportGenerator', () => {
  let generator: TestReportGenerator

  beforeEach(() => {
    generator = new TestReportGenerator()
  })

  describe('基本功能测试', () => {
    it('应该成功创建报告生成器实例', () => {
      expect(generator).toBeInstanceOf(TestReportGenerator)
      expect(generator.getHtmlExporter()).toBeDefined()
      expect(generator.getChartBuilder()).toBeDefined()
    })

    it('应该获取HTML导出器', () => {
      const exporter = generator.getHtmlExporter()
      expect(exporter).toBeDefined()
    })

    it('应该获取图表构建器', () => {
      const chartBuilder = generator.getChartBuilder()
      expect(chartBuilder).toBeDefined()
    })
  })

  describe('综合报告生成', () => {
    it('应该生成空的综合报告', () => {
      const report = generator.generateComprehensiveReport()

      expect(report).toBeDefined()
      expect(report.id).toContain('report-')
      expect(report.title).toBe('SmartAbp 压力测试综合报告')
      expect(report.summary).toBeDefined()
      expect(report.summary.totalTests).toBe(0)
    })

    it('应该生成包含负载测试的报告', () => {
      const loadTestResult: LoadTestResult = {
        scenario: {
          id: 'test-1',
          name: '负载测试场景',
          virtualUsers: 10,
          duration: 60,
          rampUpTime: 10,
          endpoints: [],
          thinkTime: 1,
          maxRetries: 3,
          retryDelayMs: 1000
        },
        overallStats: {
          totalRequests: 1000,
          successfulRequests: 950,
          failedRequests: 50,
          successRate: 95,
          averageResponseTime: 150,
          minResponseTime: 50,
          maxResponseTime: 500,
          p50ResponseTime: 140,
          p95ResponseTime: 300,
          p99ResponseTime: 450,
          requestsPerSecond: 16.67,
          totalDataTransferredBytes: 1000000,
          errorDistribution: {},
          statusCodeDistribution: { '200': 950, '500': 50 }
        },
        userStats: {},
        startTime: Date.now(),
        endTime: Date.now() + 60000,
        durationSeconds: 60
      }

      const report = generator.generateComprehensiveReport([loadTestResult])

      expect(report.loadTestResults).toHaveLength(1)
      expect(report.summary.totalTests).toBe(1)
      expect(report.summary.totalRequests).toBe(1000)
      expect(report.summary.overallSuccessRate).toBe(95)
    })

    it('应该生成包含并发测试的报告', () => {
      const concurrencyResult: ConcurrencyTestResult = {
        scenarioId: 'conc-1',
        scenarioName: '并发测试场景',
        startTime: new Date(),
        endTime: new Date(),
        duration: 30,
        operationStats: {
          totalOperations: 500,
          successfulOperations: 480,
          failedOperations: 20,
          averageDuration: 100,
          minDuration: 50,
          maxDuration: 300
        },
        concurrencyStats: {
          maxConcurrentOperations: 100,
          averageConcurrency: 80,
          concurrencyLevel: 100
        },
        operationResults: []
      }

      const report = generator.generateComprehensiveReport(undefined, [concurrencyResult])

      expect(report.concurrencyTestResults).toHaveLength(1)
      expect(report.summary.totalTests).toBe(1)
      expect(report.summary.totalRequests).toBe(500)
    })

    it('应该生成包含基准测试的报告', () => {
      const benchmarkResult: BenchmarkResult = {
        name: '基准测试',
        version: '1.0.0',
        executedAt: new Date(),
        scenarioResults: [
          {
            scenarioId: 'bench-1',
            scenarioName: '基准场景',
            metrics: {
              averageResponseTime: 120,
              minResponseTime: 80,
              maxResponseTime: 200,
              p50ResponseTime: 115,
              p95ResponseTime: 180,
              p99ResponseTime: 195,
              throughput: 8.33,
              successRate: 100,
              errorRate: 0
            },
            iterations: 10,
            totalDuration: 1200,
            success: true
          }
        ],
        savedAsBaseline: false
      }

      const report = generator.generateComprehensiveReport(undefined, undefined, [benchmarkResult])

      expect(report.benchmarkResults).toHaveLength(1)
      expect(report.summary.totalTests).toBe(1)
    })
  })

  describe('报告导出', () => {
    it('应该导出HTML格式报告', () => {
      const report = generator.generateComprehensiveReport()
      const html = generator.exportReport(report, { format: 'html' })

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain(report.title)
      expect(html).toContain('测试概览')
    })

    it('应该导出JSON格式报告', () => {
      const report = generator.generateComprehensiveReport()
      const json = generator.exportReport(report, { format: 'json' })

      expect(json).toBeTruthy()
      const parsed = JSON.parse(json)
      expect(parsed.id).toBe(report.id)
      expect(parsed.title).toBe(report.title)
    })

    it('应该导出Markdown格式报告', () => {
      const report = generator.generateComprehensiveReport()
      const markdown = generator.exportReport(report, { format: 'markdown' })

      expect(markdown).toContain(`# ${report.title}`)
      expect(markdown).toContain('## 📊 测试概览')
      expect(markdown).toContain('总测试数')
    })

    it('应该在导出时包含图表', () => {
      const loadTestResult: LoadTestResult = {
        scenario: {
          id: 'test-1',
          name: '负载测试',
          virtualUsers: 10,
          duration: 60,
          rampUpTime: 10,
          endpoints: [],
          thinkTime: 1,
          maxRetries: 3,
          retryDelayMs: 1000
        },
        overallStats: {
          totalRequests: 100,
          successfulRequests: 95,
          failedRequests: 5,
          successRate: 95,
          averageResponseTime: 150,
          minResponseTime: 50,
          maxResponseTime: 500,
          p50ResponseTime: 140,
          p95ResponseTime: 300,
          p99ResponseTime: 450,
          requestsPerSecond: 1.67,
          totalDataTransferredBytes: 10000,
          errorDistribution: {},
          statusCodeDistribution: {}
        },
        userStats: {},
        startTime: Date.now(),
        endTime: Date.now() + 60000,
        durationSeconds: 60
      }

      const report = generator.generateComprehensiveReport([loadTestResult])
      const html = generator.exportReport(report, { 
        format: 'html', 
        includeCharts: true 
      })

      expect(html).toContain('chart.js')
      expect(html).toContain('canvas')
    })
  })

  describe('错误处理', () => {
    it('应该处理不支持的报告格式', () => {
      const report = generator.generateComprehensiveReport()
      
      expect(() => {
        generator.exportReport(report, { format: 'xml' as any })
      }).toThrow('不支持的报告格式')
    })
  })
})
