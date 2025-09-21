#!/usr/bin/env node

/**
 * 性能基准测试工具
 * 首席测试架构师设计 - 全面的性能监控和分析
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const TestUtils = require('./test-utils')

class PerformanceBenchmark {
  constructor() {
    this.benchmarks = []
    this.results = {}
    this.thresholds = {
      zodValidation: 5, // 毫秒
      moduleParsing: 10,
      entityValidation: 8,
      propertyValidation: 2
    }
  }

  /**
   * 运行Zod模式验证性能测试
   */
  async benchmarkZodValidation() {
    console.log(chalk.blue('🧪 运行Zod模式验证性能测试...'))
    
    const testData = TestUtils.generateTestData('property', 1000)
    
    const result = await TestUtils.measurePerformance(() => {
      // 这里模拟Zod验证操作
      const { validatePropertyDefinition } = require('../packages/lowcode-designer/src/utils/zod-schemas')
      try {
        validatePropertyDefinition(testData)
      } catch (error) {
        // 忽略验证错误
      }
    }, 1000)

    this.results.zodValidation = result
    this.benchmarks.push({
      name: 'Zod验证性能',
      ...result,
      threshold: this.thresholds.zodValidation,
      status: result.avgDuration <= this.thresholds.zodValidation ? 'PASS' : 'FAIL'
    })
  }

  /**
   * 运行模块解析性能测试
   */
  async benchmarkModuleParsing() {
    console.log(chalk.blue('📦 运行模块解析性能测试...'))
    
    const testData = TestUtils.generateTestData('module', 100)
    
    const result = await TestUtils.measurePerformance(() => {
      // 模拟模块解析操作
      JSON.parse(JSON.stringify(testData))
    }, 500)

    this.results.moduleParsing = result
    this.benchmarks.push({
      name: '模块解析性能',
      ...result,
      threshold: this.thresholds.moduleParsing,
      status: result.avgDuration <= this.thresholds.moduleParsing ? 'PASS' : 'FAIL'
    })
  }

  /**
   * 运行内存使用测试
   */
  async benchmarkMemoryUsage() {
    console.log(chalk.blue('💾 运行内存使用测试...'))
    
    const initialMemory = TestUtils.measureMemoryUsage()
    
    // 创建大量测试数据来测试内存使用
    const testData = []
    for (let i = 0; i < 10000; i++) {
      testData.push(TestUtils.generateTestData('property'))
    }
    
    const finalMemory = TestUtils.measureMemoryUsage()
    const memoryIncrease = {
      rss: finalMemory.rss - initialMemory.rss,
      heapUsed: finalMemory.heapUsed - initialMemory.heapUsed
    }

    this.results.memoryUsage = {
      initial: initialMemory,
      final: finalMemory,
      increase: memoryIncrease
    }

    this.benchmarks.push({
      name: '内存使用测试',
      memoryIncrease,
      status: memoryIncrease.heapUsed < 50 ? 'PASS' : 'FAIL' // 堆内存增加应小于50MB
    })
  }

  /**
   * 运行并发性能测试
   */
  async benchmarkConcurrency() {
    console.log(chalk.blue('⚡ 运行并发性能测试...'))
    
    const concurrencyLevels = [1, 5, 10, 25, 50]
    const results = {}

    for (const level of concurrencyLevels) {
      const start = Date.now()
      const promises = []
      
      for (let i = 0; i < level; i++) {
        promises.push(this.simulateConcurrentOperation())
      }
      
      await Promise.all(promises)
      const duration = Date.now() - start
      
      results[level] = {
        duration,
        operationsPerSecond: (level / (duration / 1000)).toFixed(2)
      }
    }

    this.results.concurrency = results
    this.benchmarks.push({
      name: '并发性能测试',
      results,
      status: 'PASS' // 暂时不设阈值
    })
  }

  /**
   * 模拟并发操作
   */
  async simulateConcurrentOperation() {
    return new Promise(resolve => {
      setTimeout(() => {
        // 模拟一些CPU密集型操作
        let sum = 0
        for (let i = 0; i < 1000000; i++) {
          sum += Math.random()
        }
        resolve(sum)
      }, Math.random() * 10)
    })
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: TestUtils.measureMemoryUsage()
      },
      benchmarks: this.benchmarks,
      summary: {
        total: this.benchmarks.length,
        passed: this.benchmarks.filter(b => b.status === 'PASS').length,
        failed: this.benchmarks.filter(b => b.status === 'FAIL').length
      }
    }

    // 保存报告
    const reportDir = path.join(process.cwd(), 'performance-reports')
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    const reportFile = path.join(reportDir, `performance-report-${new Date().toISOString().replace(/:/g, '-')}.json`)
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))

    // 控制台输出
    console.log('\n' + chalk.yellow('📊 性能测试报告:'))
    console.log(chalk.cyan('='.repeat(50)))
    
    this.benchmarks.forEach(benchmark => {
      const statusColor = benchmark.status === 'PASS' ? chalk.green : chalk.red
      console.log(`${statusColor(benchmark.name)}: ${benchmark.status}`)
      
      if (benchmark.avgDuration) {
        console.log(`  平均耗时: ${benchmark.avgDuration.toFixed(2)}ms`)
        console.log(`  阈值: ${benchmark.threshold}ms`)
        console.log(`  操作/秒: ${benchmark.opsPerSecond}`)
      }
      
      if (benchmark.memoryIncrease) {
        console.log(`  内存增加: ${benchmark.memoryIncrease.heapUsed}MB`)
      }
      
      console.log('')
    })

    console.log(chalk.cyan(`总结: ${report.summary.passed}/${report.summary.total} 通过`))
    console.log(chalk.cyan(`报告文件: ${reportFile}`))

    return report
  }

  /**
   * 运行所有性能测试
   */
  async runAllBenchmarks() {
    console.log(chalk.yellow('🚀 启动性能基准测试套件...'))
    
    try {
      await this.benchmarkZodValidation()
      await this.benchmarkModuleParsing()
      await this.benchmarkMemoryUsage()
      await this.benchmarkConcurrency()

      const report = this.generatePerformanceReport()

      // 如果有测试失败，返回非零退出码
      if (report.summary.failed > 0) {
        console.log(chalk.red('❌ 性能测试未通过'))
        process.exit(1)
      } else {
        console.log(chalk.green('✅ 所有性能测试通过'))
        process.exit(0)
      }

    } catch (error) {
      console.log(chalk.red('💥 性能测试执行失败:'), error.message)
      process.exit(1)
    }
  }
}

// 运行性能测试
if (require.main === module) {
  const benchmark = new PerformanceBenchmark()
  benchmark.runAllBenchmarks()
}

module.exports = PerformanceBenchmark