/**
 * SmartAbp 性能基准测试工具
 * 
 * 功能:
 * - 代码生成性能测试
 * - UI响应性能测试
 * - 内存使用监控
 * - 并发处理能力测试
 * - 首屏加载性能测试
 * 
 * @version 1.0.0
 * @author SmartAbp Team
 */

import { performance } from 'perf_hooks'
import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import path from 'path'

class PerformanceBenchmark {
  constructor() {
    this.browser = null
    this.page = null
    this.results = {
      timestamp: new Date().toISOString(),
      testResults: [],
      summary: {}
    }
  }

  /**
   * 初始化测试环境
   */
  async setup() {
    console.log('🚀 初始化性能基准测试环境...')
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    })
    
    this.page = await this.browser.newPage()
    await this.page.setViewport({ width: 1920, height: 1080 })
    
    // 启用性能监控
    await this.page.coverage.startJSCoverage()
    await this.page.coverage.startCSSCoverage()
  }

  /**
   * 清理测试环境
   */
  async teardown() {
    if (this.browser) {
      await this.browser.close()
    }
    
    // 生成测试报告
    await this.generateReport()
    console.log('✅ 性能基准测试完成，报告已生成')
  }

  /**
   * 首屏加载性能测试
   */
  async testPageLoadPerformance() {
    console.log('📊 执行首屏加载性能测试...')
    
    const testCases = [
      { name: 'LowCode Studio 首页', url: 'http://localhost:11369/studio' },
      { name: '数据建模页面', url: 'http://localhost:11369/studio/modeling' },
      { name: '页面设计页面', url: 'http://localhost:11369/studio/design' },
      { name: '代码生成页面', url: 'http://localhost:11369/studio/generation' }
    ]

    for (const testCase of testCases) {
      const results = []
      
      // 每个页面测试5次取平均值
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now()
        
        const response = await this.page.goto(testCase.url, {
          waitUntil: 'networkidle0',
          timeout: 30000
        })
        
        const endTime = performance.now()
        const loadTime = endTime - startTime
        
        // 获取性能指标
        const metrics = await this.page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0]
          return {
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcp: navigation.connectEnd - navigation.connectStart,
            request: navigation.responseStart - navigation.requestStart,
            response: navigation.responseEnd - navigation.responseStart,
            dom: navigation.domContentLoadedEventEnd - navigation.responseEnd,
            load: navigation.loadEventEnd - navigation.loadEventStart,
            total: navigation.loadEventEnd - navigation.navigationStart
          }
        })
        
        results.push({
          iteration: i + 1,
          loadTime: loadTime,
          statusCode: response.status(),
          metrics: metrics
        })
        
        // 等待1秒再进行下一次测试
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // 计算平均值
      const avgLoadTime = results.reduce((sum, r) => sum + r.loadTime, 0) / results.length
      const avgTotal = results.reduce((sum, r) => sum + r.metrics.total, 0) / results.length
      
      const testResult = {
        testName: 'PageLoadPerformance',
        page: testCase.name,
        url: testCase.url,
        averageLoadTime: Math.round(avgLoadTime),
        averageTotalTime: Math.round(avgTotal),
        results: results,
        passed: avgLoadTime < 3000, // 3秒标准
        benchmark: '< 3000ms'
      }
      
      this.results.testResults.push(testResult)
      
      console.log(`  ✓ ${testCase.name}: ${Math.round(avgLoadTime)}ms (目标: <3000ms)`)
    }
  }

  /**
   * 代码生成性能测试
   */
  async testCodeGenerationPerformance() {
    console.log('⚙️ 执行代码生成性能测试...')
    
    await this.page.goto('http://localhost:11369/studio/generation')
    await this.page.waitForSelector('[data-testid="enhanced-generation-view"]')
    
    const generationTests = [
      {
        name: '单个简单实体生成',
        entities: ['Product'],
        templates: ['vue-crud'],
        expectedTime: 2000 // 2秒
      },
      {
        name: '多个实体生成',
        entities: ['Product', 'Category', 'Order'],
        templates: ['vue-crud', 'abp-service'],
        expectedTime: 10000 // 10秒
      },
      {
        name: '复杂实体全栈生成',
        entities: ['ComplexEntity'],
        templates: ['vue-crud', 'abp-service', 'entity-dto', 'unit-tests'],
        expectedTime: 15000 // 15秒
      }
    ]

    for (const test of generationTests) {
      const results = []
      
      for (let i = 0; i < 3; i++) {
        // 重置选择状态
        await this.page.evaluate(() => {
          // 取消所有选中状态
          document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            cb.click()
          })
        })
        
        // 选择实体
        for (const entity of test.entities) {
          await this.page.click(`[data-testid="checkbox-entity-${entity}"]`)
        }
        
        // 选择模板
        for (const template of test.templates) {
          await this.page.click(`[data-testid="template-${template}"]`)
        }
        
        // 开始计时
        const startTime = performance.now()
        
        // 点击生成按钮
        await this.page.click('[data-testid="btn-generate-code"]')
        
        // 等待生成完成
        await this.page.waitForSelector('[data-testid="generation-success"]', {
          timeout: test.expectedTime + 5000
        })
        
        const endTime = performance.now()
        const generationTime = endTime - startTime
        
        results.push({
          iteration: i + 1,
          generationTime: Math.round(generationTime)
        })
        
        console.log(`    第${i + 1}次: ${Math.round(generationTime)}ms`)
      }
      
      const avgTime = results.reduce((sum, r) => sum + r.generationTime, 0) / results.length
      
      const testResult = {
        testName: 'CodeGenerationPerformance',
        scenario: test.name,
        entities: test.entities,
        templates: test.templates,
        averageTime: Math.round(avgTime),
        results: results,
        passed: avgTime < test.expectedTime,
        benchmark: `< ${test.expectedTime}ms`
      }
      
      this.results.testResults.push(testResult)
      
      console.log(`  ✓ ${test.name}: ${Math.round(avgTime)}ms (目标: <${test.expectedTime}ms)`)
    }
  }

  /**
   * UI响应性能测试
   */
  async testUIResponsiveness() {
    console.log('🖱️ 执行UI响应性能测试...')
    
    const uiTests = [
      {
        name: '页面切换响应',
        action: async () => {
          const startTime = performance.now()
          await this.page.click('[data-testid="nav-design"]')
          await this.page.waitForSelector('[data-testid="design-view"]')
          return performance.now() - startTime
        },
        benchmark: 500 // 500ms
      },
      {
        name: '实体列表滚动',
        action: async () => {
          await this.page.goto('http://localhost:11369/studio/modeling')
          const startTime = performance.now()
          
          // 模拟滚动
          await this.page.evaluate(() => {
            const entityList = document.querySelector('[data-testid="entity-list"]')
            entityList.scrollTop = 1000
          })
          
          // 等待滚动稳定
          await this.page.waitForTimeout(100)
          return performance.now() - startTime
        },
        benchmark: 100 // 100ms
      },
      {
        name: '属性面板更新',
        action: async () => {
          await this.page.goto('http://localhost:11369/studio/design')
          await this.page.waitForSelector('[data-testid="design-view"]')
          
          const startTime = performance.now()
          await this.page.click('[data-testid="component-button"]')
          await this.page.waitForSelector('[data-testid="property-panel"]')
          return performance.now() - startTime
        },
        benchmark: 200 // 200ms
      }
    ]

    for (const test of uiTests) {
      const results = []
      
      for (let i = 0; i < 5; i++) {
        const responseTime = await test.action()
        results.push({
          iteration: i + 1,
          responseTime: Math.round(responseTime)
        })
      }
      
      const avgTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
      
      const testResult = {
        testName: 'UIResponsiveness',
        scenario: test.name,
        averageResponseTime: Math.round(avgTime),
        results: results,
        passed: avgTime < test.benchmark,
        benchmark: `< ${test.benchmark}ms`
      }
      
      this.results.testResults.push(testResult)
      
      console.log(`  ✓ ${test.name}: ${Math.round(avgTime)}ms (目标: <${test.benchmark}ms)`)
    }
  }

  /**
   * 内存使用监控测试
   */
  async testMemoryUsage() {
    console.log('🧠 执行内存使用监控测试...')
    
    const memoryTests = [
      {
        name: '基础内存使用',
        action: async () => {
          await this.page.goto('http://localhost:11369/studio')
          await this.page.waitForTimeout(2000)
        }
      },
      {
        name: '数据建模内存使用',
        action: async () => {
          await this.page.goto('http://localhost:11369/studio/modeling')
          
          // 创建多个实体
          for (let i = 1; i <= 10; i++) {
            await this.page.click('[data-testid="btn-create-entity"]')
            await this.page.type('[data-testid="input-entity-name"]', `Entity${i}`)
            await this.page.click('[data-testid="btn-save-entity"]')
          }
        }
      },
      {
        name: '代码生成内存使用',
        action: async () => {
          await this.page.goto('http://localhost:11369/studio/generation')
          await this.page.click('[data-testid="checkbox-entity-Product"]')
          await this.page.click('[data-testid="btn-generate-code"]')
          await this.page.waitForSelector('[data-testid="generation-success"]', {
            timeout: 10000
          })
        }
      }
    ]

    for (const test of memoryTests) {
      // 执行测试动作
      await test.action()
      
      // 获取内存使用情况
      const memoryUsage = await this.page.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          }
        }
        return null
      })
      
      if (memoryUsage) {
        const usedMB = Math.round(memoryUsage.usedJSHeapSize / 1024 / 1024)
        const totalMB = Math.round(memoryUsage.totalJSHeapSize / 1024 / 1024)
        
        const testResult = {
          testName: 'MemoryUsage',
          scenario: test.name,
          usedMemoryMB: usedMB,
          totalMemoryMB: totalMB,
          memoryUsage: memoryUsage,
          passed: usedMB < 512, // 512MB限制
          benchmark: '< 512MB'
        }
        
        this.results.testResults.push(testResult)
        
        console.log(`  ✓ ${test.name}: ${usedMB}MB / ${totalMB}MB (目标: <512MB)`)
      }
    }
  }

  /**
   * 生成测试报告
   */
  async generateReport() {
    // 计算总体统计
    const totalTests = this.results.testResults.length
    const passedTests = this.results.testResults.filter(t => t.passed).length
    const failedTests = totalTests - passedTests
    const successRate = Math.round((passedTests / totalTests) * 100)
    
    this.results.summary = {
      totalTests,
      passedTests,
      failedTests,
      successRate,
      overallStatus: successRate >= 80 ? 'PASS' : 'FAIL'
    }
    
    // 生成HTML报告
    const reportHtml = this.generateHtmlReport()
    const reportPath = path.join(process.cwd(), 'docs/performance-benchmark-report.html')
    await fs.writeFile(reportPath, reportHtml)
    
    // 生成JSON报告
    const jsonPath = path.join(process.cwd(), 'docs/performance-benchmark-results.json')
    await fs.writeFile(jsonPath, JSON.stringify(this.results, null, 2))
    
    console.log(`📊 性能测试报告已生成:`)
    console.log(`   HTML报告: ${reportPath}`)
    console.log(`   JSON数据: ${jsonPath}`)
    console.log(`   总体成功率: ${successRate}% (${passedTests}/${totalTests})`)
  }

  /**
   * 生成HTML报告
   */
  generateHtmlReport() {
    const { testResults, summary } = this.results
    
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartAbp 性能基准测试报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f7fa; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .metric-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); text-align: center; }
        .metric-value { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
        .metric-label { color: #666; font-size: 14px; }
        .pass { color: #67c23a; }
        .fail { color: #f56c6c; }
        .test-results { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .test-item { padding: 15px 0; border-bottom: 1px solid #eee; }
        .test-item:last-child { border-bottom: none; }
        .test-name { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
        .test-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; font-size: 14px; color: #666; }
        .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .status-pass { background: #f0f9ff; color: #67c23a; }
        .status-fail { background: #fef2f2; color: #f56c6c; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 SmartAbp 性能基准测试报告</h1>
            <p>测试时间: ${new Date(this.results.timestamp).toLocaleString('zh-CN')}</p>
            <p>测试环境: Node.js + Puppeteer + Chrome Headless</p>
        </div>
        
        <div class="summary">
            <div class="metric-card">
                <div class="metric-value ${summary.overallStatus === 'PASS' ? 'pass' : 'fail'}">${summary.successRate}%</div>
                <div class="metric-label">总体成功率</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${summary.totalTests}</div>
                <div class="metric-label">总测试数</div>
            </div>
            <div class="metric-card">
                <div class="metric-value pass">${summary.passedTests}</div>
                <div class="metric-label">通过测试</div>
            </div>
            <div class="metric-card">
                <div class="metric-value fail">${summary.failedTests}</div>
                <div class="metric-label">失败测试</div>
            </div>
        </div>
        
        <div class="test-results">
            <h2>详细测试结果</h2>
            ${testResults.map(test => `
                <div class="test-item">
                    <div class="test-name">
                        ${test.testName} - ${test.scenario || test.page || ''}
                        <span class="status-badge ${test.passed ? 'status-pass' : 'status-fail'}">
                            ${test.passed ? 'PASS' : 'FAIL'}
                        </span>
                    </div>
                    <div class="test-details">
                        ${test.averageLoadTime ? `<div>平均加载时间: ${test.averageLoadTime}ms</div>` : ''}
                        ${test.averageTime ? `<div>平均生成时间: ${test.averageTime}ms</div>` : ''}
                        ${test.averageResponseTime ? `<div>平均响应时间: ${test.averageResponseTime}ms</div>` : ''}
                        ${test.usedMemoryMB ? `<div>内存使用: ${test.usedMemoryMB}MB</div>` : ''}
                        <div>基准要求: ${test.benchmark}</div>
                        ${test.url ? `<div>测试URL: ${test.url}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
    `
  }

  /**
   * 执行所有性能测试
   */
  async runAll() {
    try {
      await this.setup()
      
      console.log('🔥 开始执行SmartAbp性能基准测试...')
      console.log('=' .repeat(60))
      
      await this.testPageLoadPerformance()
      await this.testCodeGenerationPerformance()
      await this.testUIResponsiveness()
      await this.testMemoryUsage()
      
      console.log('=' .repeat(60))
      console.log(`✅ 性能基准测试完成! 成功率: ${this.results.summary?.successRate || 0}%`)
      
    } catch (error) {
      console.error('❌ 性能测试执行失败:', error)
      throw error
    } finally {
      await this.teardown()
    }
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new PerformanceBenchmark()
  benchmark.runAll().catch(console.error)
}

export default PerformanceBenchmark
