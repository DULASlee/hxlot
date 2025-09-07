import { describe, it, expect, beforeEach } from 'vitest'
import { logger, LogLevel } from '@/utils/logger'
import { logManager } from '@/utils/logManager'
import { analyzeCurrentLogs } from '@/utils/logAnalyzer'
import { logExporter, ExportFormat } from '@/utils/logExporter'

describe('日志系统集成测试', () => {
  beforeEach(() => {
    // 清理日志
    logger.clear()
    logManager.cleanup()
  })

  describe('Logger 基础功能', () => {
    it('应该能够记录不同级别的日志', () => {
      logger.info('信息日志', { category: 'test' })
      logger.success('成功日志', { category: 'test' })
      logger.warn('警告日志', { category: 'test' })
      logger.error('错误日志', { category: 'test' })
      logger.debug('调试日志', { category: 'test' })

      const logs = logger.getLogs()
      expect(logs).toHaveLength(5)
      expect(logs[4].level).toBe(LogLevel.INFO)
      expect(logs[3].level).toBe(LogLevel.SUCCESS)
      expect(logs[2].level).toBe(LogLevel.WARN)
      expect(logs[1].level).toBe(LogLevel.ERROR)
      expect(logs[0].level).toBe(LogLevel.DEBUG)
    })

    it('应该能够按级别过滤日志', () => {
      logger.info('信息日志', { category: 'test' })
      logger.error('错误日志', { category: 'test' })
      logger.warn('警告日志', { category: 'test' })

      const logs = logger.getLogs()
      const errorLogs = logs.filter(log => log.level === LogLevel.ERROR)
      expect(errorLogs).toHaveLength(1)
      expect(errorLogs[0].message).toBe('错误日志')
    })

    it('应该能够按分类过滤日志', () => {
      logger.info('API日志', { category: 'api' })
      logger.info('用户日志', { category: 'user' })
      logger.info('系统日志', { category: 'system' })

      const logs = logger.getLogs()
      const apiLogs = logs.filter(log => log.category === 'api')
      expect(apiLogs).toHaveLength(1)
      expect(apiLogs[0].message).toBe('API日志')
    })

    it('应该能够清空日志', () => {
      logger.info('测试日志', { category: 'test' })
      expect(logger.getLogs()).toHaveLength(1)

      logger.clear()
      expect(logger.getLogs()).toHaveLength(0)
    })
  })

  describe('LogManager 性能跟踪', () => {
    it('应该能够跟踪性能', async () => {
      const trackingId = logManager.startPerformanceTracking('测试操作', 'test')

      // 模拟一些操作时间
      await new Promise(resolve => setTimeout(resolve, 100))

      logManager.endPerformanceTracking(trackingId.id)

      const stats = logManager.getPerformanceStats()
      expect(stats.count).toBe(1)
      expect(stats.average).toBeGreaterThan(90)
    })

    it('应该能够批量记录日志', () => {
      const entries = [
        { level: LogLevel.INFO, message: '批量日志1', category: 'batch' },
        { level: LogLevel.WARN, message: '批量日志2', category: 'batch' },
        { level: LogLevel.ERROR, message: '批量日志3', category: 'batch' }
      ]

      logManager.logBatch(entries)

      const logs = logger.getLogs()
      expect(logs).toHaveLength(3)
      expect(logs.every(log => log.category === 'batch')).toBe(true)
    })
  })

  describe('LogAnalyzer 分析功能', () => {
    it('应该能够分析日志统计', () => {
      // 生成测试数据
      logger.info('信息1', 'test')
      logger.info('信息2', 'test')
      logger.warn('警告1', 'test')
      logger.error('错误1', 'test')

      const analysis = analyzeCurrentLogs()

      expect(analysis.summary.totalLogs).toBe(4)
      expect(analysis.summary.levelDistribution[LogLevel.INFO]).toBe(2)
      expect(analysis.summary.levelDistribution[LogLevel.WARN]).toBe(1)
      expect(analysis.summary.levelDistribution[LogLevel.ERROR]).toBe(1)
    })

    it('应该能够计算健康评分', () => {
      // 只有信息日志，健康评分应该很高
      logger.info('正常操作1', 'test')
      logger.info('正常操作2', 'test')
      logger.success('成功操作', 'test')

      const analysis = analyzeCurrentLogs()
      expect(analysis.insights.healthScore).toBeGreaterThan(90)

      // 添加错误日志，健康评分应该下降
      logger.error('严重错误', 'test')
      logger.error('另一个错误', 'test')

      const analysis2 = analyzeCurrentLogs()
      expect(analysis2.insights.healthScore).toBeLessThan(analysis.insights.healthScore)
    })
  })

  describe('LogExporter 导出功能', () => {
    it('应该能够导出为JSON格式', () => {
      logger.info('测试日志1', { data: 'value1', category: 'test' })
      logger.warn('测试日志2', { data: 'value2', category: 'test' })

      const exported = logExporter.exportLogs({
        format: ExportFormat.JSON,
        includeAnalysis: false,
        includePerformance: false,
        includeErrors: false,
        maxEntries: 10
      })

      expect(exported).toContain('测试日志1')
      expect(exported).toContain('测试日志2')
      expect(exported).toContain('value1')
      expect(exported).toContain('value2')
    })

    it('应该能够导出为CSV格式', () => {
      logger.info('CSV测试', { category: 'test' })
      logger.error('CSV错误', { category: 'test' })

      const exported = logExporter.exportLogs({
        format: ExportFormat.CSV,
        includeAnalysis: false,
        includePerformance: false,
        includeErrors: false,
        maxEntries: 10
      })

      expect(exported).toContain('时间,级别,消息,分类')
      expect(exported).toContain('CSV测试')
      expect(exported).toContain('CSV错误')
    })

    it('应该能够按级别过滤导出', () => {
      logger.info('信息日志', { category: 'test' })
      logger.warn('警告日志', { category: 'test' })
      logger.error('错误日志', { category: 'test' })

      const exported = logExporter.exportLogs({
        format: ExportFormat.JSON,
        includeAnalysis: false,
        includePerformance: false,
        includeErrors: false,
        levels: [LogLevel.ERROR, LogLevel.WARN]
      })

      expect(exported).toContain('警告日志')
      expect(exported).toContain('错误日志')
      expect(exported).not.toContain('信息日志')
    })
  })

  describe('集成测试', () => {
    it('应该能够完整的日志记录和分析流程', async () => {
      // 模拟一个完整的业务流程
      logger.info('开始用户登录流程', { category: 'auth' })

      const trackingId = logManager.startPerformanceTracking('用户认证', 'auth')

      // 模拟认证过程
      await new Promise(resolve => setTimeout(resolve, 50))

      if (Math.random() > 0.5) {
        logger.success('用户登录成功', { userId: 123, category: 'auth' })
      } else {
        logger.error('用户登录失败', { error: new Error('密码错误'), category: 'auth' })
      }

      logManager.endPerformanceTracking(trackingId.id)

      logger.info('登录流程结束', { category: 'auth' })

      // 分析结果
      const analysis = analyzeCurrentLogs()
      expect(analysis.summary.totalLogs).toBeGreaterThan(2)
      expect(analysis.summary.categoryDistribution.get('auth')).toBeGreaterThan(0)

      // 性能统计
      const perfStats = logManager.getPerformanceStats()
      expect(perfStats.count).toBe(1)
      expect(perfStats.average).toBeGreaterThan(0)

      // 导出测试
      const exported = logExporter.exportLogs({
        format: ExportFormat.JSON,
        includeAnalysis: true,
        includePerformance: false,
        includeErrors: false
      })
      expect(exported).toContain('用户登录')
      expect(exported).toContain('analysis')
    })

    it('应该能够处理大量日志', () => {
      // 生成大量日志
      for (let i = 0; i < 1000; i++) {
        const level = i % 4 === 0 ? 'error' : i % 3 === 0 ? 'warn' : 'info'
        logger[level as 'error' | 'warn' | 'info'](`大量日志测试 ${i}`, 'performance')
      }

      const logs = logger.getLogs()
      expect(logs).toHaveLength(1000)

      // 分析性能
      const startTime = performance.now()
      const analysis = analyzeCurrentLogs()
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(1000) // 分析应该在1秒内完成
      expect(analysis.summary.totalLogs).toBe(1000)
    })
  })

  describe('错误处理', () => {
    it('应该能够处理无效的日志级别', () => {
      expect(() => {
        // @ts-ignore - 故意传入无效级别进行测试
        logger.log('invalid' as any, '测试消息', 'test')
      }).not.toThrow()
    })

    it('应该能够处理空的日志数据', () => {
      const analysis = analyzeCurrentLogs()
      expect(analysis.summary.totalLogs).toBe(0)
      expect(analysis.insights.healthScore).toBe(100)
    })

    it('应该能够处理导出错误', () => {
      expect(() => {
        logExporter.exportLogs({
          format: 'invalid' as any,
          includeAnalysis: false,
          includePerformance: false,
          includeErrors: false
        })
      }).not.toThrow()
    })
  })
})
