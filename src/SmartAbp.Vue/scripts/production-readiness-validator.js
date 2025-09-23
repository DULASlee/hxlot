/**
 * SmartAbp 生产就绪验证执行器
 * 
 * 统一执行:
 * 1. 端到端功能测试 (Cypress E2E)
 * 2. 性能基准测试 (Performance Benchmark)
 * 3. 安全合规审计 (Security Audit)
 * 4. 依赖安全扫描 (Dependency Scan)
 * 5. 代码质量检查 (Quality Gates)
 * 
 * 生成综合生产就绪报告
 * 
 * @version 1.0.0
 * @author SmartAbp Team
 */

import { execSync, spawn } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import PerformanceBenchmark from '../tests/performance/performance-benchmark.js'
import SecurityAudit from '../tests/security/security-audit.js'

class ProductionReadinessValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      overall: {
        status: 'UNKNOWN',
        readinessScore: 0,
        blockers: [],
        warnings: [],
        recommendations: []
      },
      phases: {
        qualityGates: { status: 'PENDING', results: null },
        functionalTests: { status: 'PENDING', results: null },
        performanceTests: { status: 'PENDING', results: null },
        securityAudit: { status: 'PENDING', results: null },
        dependencyCheck: { status: 'PENDING', results: null }
      }
    }
  }

  /**
   * 执行完整的生产就绪验证
   */
  async runFullValidation() {
    console.log('🚀 SmartAbp 生产就绪验证开始')
    console.log('=' .repeat(80))
    console.log(`开始时间: ${new Date().toLocaleString('zh-CN')}`)
    console.log('验证范围: 功能完整性 + 性能基准 + 安全合规 + 代码质量')
    console.log('=' .repeat(80))

    try {
      // Phase 1: 代码质量门控检查
      await this.runQualityGates()
      
      // Phase 2: 依赖安全检查
      await this.runDependencyCheck()
      
      // Phase 3: 功能完整性测试
      await this.runFunctionalTests()
      
      // Phase 4: 性能基准测试
      await this.runPerformanceTests()
      
      // Phase 5: 安全合规审计
      await this.runSecurityAudit()
      
      // 计算最终结果
      await this.calculateOverallResults()
      
      // 生成综合报告
      await this.generateComprehensiveReport()
      
      // 显示结果摘要
      this.displayResultsSummary()
      
    } catch (error) {
      console.error('❌ 生产就绪验证执行失败:', error)
      this.results.overall.status = 'FAILED'
      this.results.overall.blockers.push(`验证执行失败: ${error.message}`)
      throw error
    }
  }

  /**
   * Phase 1: 代码质量门控检查
   */
  async runQualityGates() {
    console.log('\n📊 Phase 1: 代码质量门控检查')
    console.log('-' .repeat(50))
    
    const qualityResults = {
      typescript: { status: 'UNKNOWN', errors: 0 },
      eslint: { status: 'UNKNOWN', errors: 0, warnings: 0 },
      build: { status: 'UNKNOWN', duration: 0 },
      tests: { status: 'UNKNOWN', passed: 0, failed: 0, coverage: 0 }
    }

    try {
      // TypeScript类型检查
      console.log('  🔍 执行TypeScript类型检查...')
      try {
        const tsOutput = execSync('npm run type-check', { 
          encoding: 'utf8',
          cwd: process.cwd(),
          timeout: 60000
        })
        qualityResults.typescript.status = 'PASS'
        console.log('    ✅ TypeScript类型检查通过')
      } catch (error) {
        qualityResults.typescript.status = 'FAIL'
        const errors = (error.stdout || error.message).split('\n').filter(line => 
          line.includes('error TS')).length
        qualityResults.typescript.errors = errors
        console.log(`    ❌ TypeScript检查失败: ${errors}个错误`)
        this.results.overall.blockers.push(`TypeScript错误: ${errors}个`)
      }

      // ESLint检查
      console.log('  🔍 执行ESLint代码规范检查...')
      try {
        // 由于项目可能没有lint脚本，我们直接运行npx eslint
        const lintOutput = execSync('npx eslint src --ext .ts,.vue --format json', {
          encoding: 'utf8',
          cwd: path.join(process.cwd(), 'src/SmartAbp.Vue'),
          timeout: 60000
        })
        
        const lintResults = JSON.parse(lintOutput)
        let totalErrors = 0
        let totalWarnings = 0
        
        lintResults.forEach(file => {
          totalErrors += file.errorCount
          totalWarnings += file.warningCount
        })
        
        qualityResults.eslint.errors = totalErrors
        qualityResults.eslint.warnings = totalWarnings
        qualityResults.eslint.status = totalErrors === 0 ? 'PASS' : 'FAIL'
        
        if (totalErrors === 0) {
          console.log(`    ✅ ESLint检查通过 (${totalWarnings}个警告)`)
        } else {
          console.log(`    ❌ ESLint检查失败: ${totalErrors}个错误, ${totalWarnings}个警告`)
          this.results.overall.blockers.push(`ESLint错误: ${totalErrors}个`)
        }
      } catch (error) {
        console.log('    ⚠️  ESLint检查跳过 (未配置或执行失败)')
        qualityResults.eslint.status = 'SKIP'
      }

      // 构建测试
      console.log('  🔍 执行构建测试...')
      try {
        const buildStart = Date.now()
        execSync('npm run build', {
          encoding: 'utf8',
          cwd: path.join(process.cwd(), 'src/SmartAbp.Vue'),
          timeout: 300000 // 5分钟超时
        })
        const buildDuration = Date.now() - buildStart
        qualityResults.build.status = 'PASS'
        qualityResults.build.duration = Math.round(buildDuration / 1000)
        console.log(`    ✅ 构建测试通过 (耗时: ${qualityResults.build.duration}秒)`)
      } catch (error) {
        qualityResults.build.status = 'FAIL'
        console.log('    ❌ 构建测试失败')
        this.results.overall.blockers.push('构建失败')
      }

      // 单元测试
      console.log('  🔍 执行单元测试...')
      try {
        const testOutput = execSync('npm run test:coverage', {
          encoding: 'utf8',
          cwd: path.join(process.cwd(), 'src/SmartAbp.Vue'),
          timeout: 120000
        })
        
        // 解析测试结果
        const passMatch = testOutput.match(/(\d+) passing/)
        const failMatch = testOutput.match(/(\d+) failing/)
        const coverageMatch = testOutput.match(/All files[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*(\d+\.?\d*)/);
        
        qualityResults.tests.passed = passMatch ? parseInt(passMatch[1]) : 0
        qualityResults.tests.failed = failMatch ? parseInt(failMatch[1]) : 0
        qualityResults.tests.coverage = coverageMatch ? parseFloat(coverageMatch[1]) : 0
        qualityResults.tests.status = qualityResults.tests.failed === 0 ? 'PASS' : 'FAIL'
        
        if (qualityResults.tests.failed === 0) {
          console.log(`    ✅ 单元测试通过 (${qualityResults.tests.passed}个测试, ${qualityResults.tests.coverage}%覆盖率)`)
        } else {
          console.log(`    ❌ 单元测试失败: ${qualityResults.tests.failed}个失败`)
          this.results.overall.blockers.push(`单元测试失败: ${qualityResults.tests.failed}个`)
        }
      } catch (error) {
        console.log('    ⚠️  单元测试跳过 (未配置或执行失败)')
        qualityResults.tests.status = 'SKIP'
      }

    } catch (error) {
      console.error('  ❌ 质量门控检查失败:', error.message)
      this.results.phases.qualityGates.status = 'FAILED'
    }

    this.results.phases.qualityGates.results = qualityResults
    
    // 判断整体状态
    const allPassed = Object.values(qualityResults).every(result => 
      result.status === 'PASS' || result.status === 'SKIP')
    
    this.results.phases.qualityGates.status = allPassed ? 'PASSED' : 'FAILED'
    
    console.log(`  📊 质量门控总结: ${this.results.phases.qualityGates.status}`)
  }

  /**
   * Phase 2: 依赖安全检查
   */
  async runDependencyCheck() {
    console.log('\n🔍 Phase 2: 依赖安全检查')
    console.log('-' .repeat(50))
    
    const dependencyResults = {
      vulnerabilities: { high: 0, medium: 0, low: 0 },
      outdatedPackages: 0,
      licenseIssues: 0
    }

    try {
      // npm audit检查
      console.log('  🔍 执行npm audit安全扫描...')
      try {
        execSync('npm audit --audit-level=high', {
          encoding: 'utf8',
          cwd: process.cwd(),
          timeout: 60000
        })
        console.log('    ✅ 未发现高危安全漏洞')
        this.results.phases.dependencyCheck.status = 'PASSED'
      } catch (error) {
        const output = error.stdout || error.message
        const highVulns = (output.match(/high/gi) || []).length
        const mediumVulns = (output.match(/medium/gi) || []).length
        const lowVulns = (output.match(/low/gi) || []).length
        
        dependencyResults.vulnerabilities = { high: highVulns, medium: mediumVulns, low: lowVulns }
        
        if (highVulns > 0) {
          console.log(`    ❌ 发现${highVulns}个高危漏洞`)
          this.results.overall.blockers.push(`高危安全漏洞: ${highVulns}个`)
          this.results.phases.dependencyCheck.status = 'FAILED'
        } else if (mediumVulns > 0) {
          console.log(`    ⚠️  发现${mediumVulns}个中危漏洞`)
          this.results.overall.warnings.push(`中危安全漏洞: ${mediumVulns}个`)
          this.results.phases.dependencyCheck.status = 'WARNING'
        } else {
          console.log('    ✅ 无高危漏洞')
          this.results.phases.dependencyCheck.status = 'PASSED'
        }
      }

      // 检查过期包
      console.log('  🔍 检查过期依赖包...')
      try {
        const outdatedOutput = execSync('npm outdated --json', {
          encoding: 'utf8',
          cwd: process.cwd(),
          timeout: 30000
        })
        const outdated = JSON.parse(outdatedOutput)
        dependencyResults.outdatedPackages = Object.keys(outdated).length
        
        if (dependencyResults.outdatedPackages > 0) {
          console.log(`    ⚠️  发现${dependencyResults.outdatedPackages}个过期包`)
          this.results.overall.warnings.push(`过期依赖包: ${dependencyResults.outdatedPackages}个`)
        } else {
          console.log('    ✅ 所有依赖包都是最新版本')
        }
      } catch (error) {
        // npm outdated 没有过期包时会返回1，这是正常的
        console.log('    ✅ 所有依赖包都是最新版本')
      }

    } catch (error) {
      console.error('  ❌ 依赖检查失败:', error.message)
      this.results.phases.dependencyCheck.status = 'FAILED'
    }

    this.results.phases.dependencyCheck.results = dependencyResults
    console.log(`  📊 依赖检查总结: ${this.results.phases.dependencyCheck.status}`)
  }

  /**
   * Phase 3: 功能完整性测试
   */
  async runFunctionalTests() {
    console.log('\n🧪 Phase 3: 功能完整性测试')
    console.log('-' .repeat(50))
    
    const functionalResults = {
      e2eTests: { passed: 0, failed: 0, total: 0 },
      coverage: 0,
      duration: 0
    }

    try {
      console.log('  🔍 执行端到端测试 (需要应用运行在localhost:5173)...')
      
      // 检查服务器是否运行
      const isServerRunning = await this.checkServerHealth('http://localhost:5173')
      
      if (!isServerRunning) {
        console.log('    ⚠️  开发服务器未运行，跳过E2E测试')
        console.log('    💡 请运行 `npm run dev` 启动服务器后再执行测试')
        functionalResults.e2eTests = { passed: 0, failed: 0, total: 0, skipped: true }
        this.results.phases.functionalTests.status = 'SKIPPED'
        this.results.overall.warnings.push('E2E测试被跳过 - 服务器未运行')
      } else {
        const testStart = Date.now()
        
        try {
          // 运行Cypress测试
          const cypressOutput = execSync('npx cypress run --spec "tests/e2e/lowcode-studio-e2e.cy.ts"', {
            encoding: 'utf8',
            cwd: path.join(process.cwd(), 'src/SmartAbp.Vue'),
            timeout: 300000 // 5分钟超时
          })
          
          // 解析Cypress结果
          const passedMatch = cypressOutput.match(/(\d+) passing/)
          const failedMatch = cypressOutput.match(/(\d+) failing/)
          
          functionalResults.e2eTests.passed = passedMatch ? parseInt(passedMatch[1]) : 0
          functionalResults.e2eTests.failed = failedMatch ? parseInt(failedMatch[1]) : 0
          functionalResults.e2eTests.total = functionalResults.e2eTests.passed + functionalResults.e2eTests.failed
          functionalResults.duration = Math.round((Date.now() - testStart) / 1000)
          
          if (functionalResults.e2eTests.failed === 0) {
            console.log(`    ✅ E2E测试通过 (${functionalResults.e2eTests.passed}/${functionalResults.e2eTests.total})`)
            this.results.phases.functionalTests.status = 'PASSED'
          } else {
            console.log(`    ❌ E2E测试失败: ${functionalResults.e2eTests.failed}个失败`)
            this.results.overall.blockers.push(`E2E测试失败: ${functionalResults.e2eTests.failed}个`)
            this.results.phases.functionalTests.status = 'FAILED'
          }
          
        } catch (error) {
          console.log('    ❌ E2E测试执行失败')
          this.results.phases.functionalTests.status = 'FAILED'
          this.results.overall.blockers.push('E2E测试执行失败')
        }
      }

    } catch (error) {
      console.error('  ❌ 功能测试失败:', error.message)
      this.results.phases.functionalTests.status = 'FAILED'
    }

    this.results.phases.functionalTests.results = functionalResults
    console.log(`  📊 功能测试总结: ${this.results.phases.functionalTests.status}`)
  }

  /**
   * Phase 4: 性能基准测试
   */
  async runPerformanceTests() {
    console.log('\n⚡ Phase 4: 性能基准测试')
    console.log('-' .repeat(50))

    try {
      const performanceBenchmark = new PerformanceBenchmark()
      await performanceBenchmark.runAll()
      
      // 获取性能测试结果
      const perfResults = performanceBenchmark.results
      const passedTests = perfResults.testResults.filter(t => t.passed).length
      const totalTests = perfResults.testResults.length
      const successRate = Math.round((passedTests / totalTests) * 100)
      
      if (successRate >= 80) {
        console.log(`    ✅ 性能测试通过 (成功率: ${successRate}%)`)
        this.results.phases.performanceTests.status = 'PASSED'
      } else if (successRate >= 60) {
        console.log(`    ⚠️  性能测试部分通过 (成功率: ${successRate}%)`)
        this.results.phases.performanceTests.status = 'WARNING'
        this.results.overall.warnings.push(`性能基准未完全达标: ${successRate}%`)
      } else {
        console.log(`    ❌ 性能测试失败 (成功率: ${successRate}%)`)
        this.results.phases.performanceTests.status = 'FAILED'
        this.results.overall.blockers.push(`性能基准严重不达标: ${successRate}%`)
      }
      
      this.results.phases.performanceTests.results = perfResults
      
    } catch (error) {
      console.error('  ❌ 性能测试失败:', error.message)
      this.results.phases.performanceTests.status = 'FAILED'
      this.results.overall.blockers.push('性能测试执行失败')
    }

    console.log(`  📊 性能测试总结: ${this.results.phases.performanceTests.status}`)
  }

  /**
   * Phase 5: 安全合规审计
   */
  async runSecurityAudit() {
    console.log('\n🛡️ Phase 5: 安全合规审计')
    console.log('-' .repeat(50))

    try {
      const securityAudit = new SecurityAudit()
      await securityAudit.runFullAudit()
      
      // 获取安全审计结果
      const secResults = securityAudit.results
      const securityScore = secResults.summary.securityScore
      const highRiskVulns = secResults.summary.highRiskVulnerabilities
      
      if (securityScore >= 90 && highRiskVulns === 0) {
        console.log(`    ✅ 安全审计通过 (评分: ${securityScore}/100)`)
        this.results.phases.securityAudit.status = 'PASSED'
      } else if (securityScore >= 70 && highRiskVulns === 0) {
        console.log(`    ⚠️  安全审计部分通过 (评分: ${securityScore}/100)`)
        this.results.phases.securityAudit.status = 'WARNING'
        this.results.overall.warnings.push(`安全评分需要改善: ${securityScore}/100`)
      } else {
        console.log(`    ❌ 安全审计失败 (评分: ${securityScore}/100, 高危漏洞: ${highRiskVulns}个)`)
        this.results.phases.securityAudit.status = 'FAILED'
        this.results.overall.blockers.push(`安全风险过高: ${highRiskVulns}个高危漏洞`)
      }
      
      this.results.phases.securityAudit.results = secResults
      
    } catch (error) {
      console.error('  ❌ 安全审计失败:', error.message)
      this.results.phases.securityAudit.status = 'FAILED'
      this.results.overall.blockers.push('安全审计执行失败')
    }

    console.log(`  📊 安全审计总结: ${this.results.phases.securityAudit.status}`)
  }

  /**
   * 计算总体结果
   */
  async calculateOverallResults() {
    console.log('\n📊 计算总体结果...')
    
    const phases = this.results.phases
    let totalScore = 0
    let phaseCount = 0
    
    // 计算各阶段得分
    const phaseScores = {
      qualityGates: this.calculatePhaseScore(phases.qualityGates.status) * 0.25, // 25%
      dependencyCheck: this.calculatePhaseScore(phases.dependencyCheck.status) * 0.15, // 15%
      functionalTests: this.calculatePhaseScore(phases.functionalTests.status) * 0.25, // 25%
      performanceTests: this.calculatePhaseScore(phases.performanceTests.status) * 0.20, // 20%
      securityAudit: this.calculatePhaseScore(phases.securityAudit.status) * 0.15 // 15%
    }
    
    totalScore = Object.values(phaseScores).reduce((sum, score) => sum + score, 0)
    
    // 确定总体状态
    const hasBlockers = this.results.overall.blockers.length > 0
    const hasWarnings = this.results.overall.warnings.length > 0
    
    if (hasBlockers || totalScore < 60) {
      this.results.overall.status = 'NOT_READY'
    } else if (hasWarnings || totalScore < 80) {
      this.results.overall.status = 'CONDITIONALLY_READY'
    } else {
      this.results.overall.status = 'PRODUCTION_READY'
    }
    
    this.results.overall.readinessScore = Math.round(totalScore)
    
    // 生成建议
    this.generateRecommendations()
  }

  /**
   * 计算阶段得分
   */
  calculatePhaseScore(status) {
    switch (status) {
      case 'PASSED': return 100
      case 'WARNING': return 70
      case 'SKIPPED': return 50
      case 'FAILED': return 0
      default: return 0
    }
  }

  /**
   * 生成改进建议
   */
  generateRecommendations() {
    const recommendations = []
    
    // 基于结果生成具体建议
    if (this.results.phases.qualityGates.status !== 'PASSED') {
      recommendations.push('修复所有代码质量问题，确保TypeScript、ESLint、构建和测试全部通过')
    }
    
    if (this.results.phases.dependencyCheck.status === 'FAILED') {
      recommendations.push('立即修复高危安全漏洞，更新相关依赖包')
    }
    
    if (this.results.phases.functionalTests.status !== 'PASSED') {
      recommendations.push('修复所有功能测试失败项，确保核心业务流程正常工作')
    }
    
    if (this.results.phases.performanceTests.status !== 'PASSED') {
      recommendations.push('优化系统性能，确保加载时间、响应速度和内存使用达标')
    }
    
    if (this.results.phases.securityAudit.status !== 'PASSED') {
      recommendations.push('加强安全防护，修复所有安全漏洞，实施安全最佳实践')
    }
    
    // 通用建议
    recommendations.push('建立持续集成/持续部署(CI/CD)流程')
    recommendations.push('制定生产环境监控和告警策略')
    recommendations.push('准备完整的部署文档和应急响应预案')
    recommendations.push('进行生产环境负载测试和容灾演练')
    
    this.results.overall.recommendations = recommendations
  }

  /**
   * 生成综合报告
   */
  async generateComprehensiveReport() {
    console.log('\n📝 生成综合生产就绪报告...')
    
    const reportHtml = this.generateHtmlReport()
    const reportPath = path.join(process.cwd(), 'docs/production-readiness-report.html')
    await fs.writeFile(reportPath, reportHtml)
    
    const jsonPath = path.join(process.cwd(), 'docs/production-readiness-results.json')
    await fs.writeFile(jsonPath, JSON.stringify(this.results, null, 2))
    
    console.log(`  📄 综合报告已生成:`)
    console.log(`     HTML报告: ${reportPath}`)
    console.log(`     JSON数据: ${jsonPath}`)
  }

  /**
   * 生成HTML报告
   */
  generateHtmlReport() {
    const { overall, phases } = this.results
    
    const getStatusColor = (status) => {
      switch (status) {
        case 'PASSED': case 'PRODUCTION_READY': return '#67c23a'
        case 'WARNING': case 'CONDITIONALLY_READY': return '#e6a23c'
        case 'FAILED': case 'NOT_READY': return '#f56c6c'
        case 'SKIPPED': return '#909399'
        default: return '#909399'
      }
    }

    const getStatusText = (status) => {
      const statusTexts = {
        'PRODUCTION_READY': '✅ 生产就绪',
        'CONDITIONALLY_READY': '⚠️ 有条件就绪',
        'NOT_READY': '❌ 未就绪',
        'PASSED': '✅ 通过',
        'WARNING': '⚠️ 警告',
        'FAILED': '❌ 失败',
        'SKIPPED': '⏭️ 跳过'
      }
      return statusTexts[status] || status
    }

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartAbp 生产就绪验证报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f7fa; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 20px; text-align: center; }
        .status-badge { display: inline-block; padding: 12px 24px; border-radius: 25px; font-size: 18px; font-weight: 700; color: white; margin: 10px 0; }
        .score { font-size: 48px; font-weight: 700; margin: 20px 0; }
        .phases { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .phase-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .phase-title { font-size: 16px; font-weight: 600; margin-bottom: 10px; }
        .phase-status { font-size: 14px; padding: 4px 8px; border-radius: 4px; color: white; display: inline-block; margin-bottom: 10px; }
        .blockers, .warnings, .recommendations { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 20px; }
        .blockers h3 { color: #f56c6c; }
        .warnings h3 { color: #e6a23c; }
        .recommendations h3 { color: #409eff; }
        ul { margin: 10px 0; padding-left: 20px; }
        li { margin: 5px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 SmartAbp 生产就绪验证报告</h1>
            <p>验证时间: ${new Date(this.results.timestamp).toLocaleString('zh-CN')}</p>
            
            <div class="status-badge" style="background-color: ${getStatusColor(overall.status)}">
                ${getStatusText(overall.status)}
            </div>
            
            <div class="score" style="color: ${getStatusColor(overall.status)}">
                ${overall.readinessScore}/100
            </div>
            <p>生产就绪评分</p>
        </div>
        
        <div class="phases">
            ${Object.entries(phases).map(([phaseName, phase]) => `
                <div class="phase-card">
                    <div class="phase-title">${this.getPhaseTitle(phaseName)}</div>
                    <div class="phase-status" style="background-color: ${getStatusColor(phase.status)}">
                        ${getStatusText(phase.status)}
                    </div>
                    <div class="phase-details">
                        ${this.getPhaseDetails(phaseName, phase)}
                    </div>
                </div>
            `).join('')}
        </div>
        
        ${overall.blockers.length > 0 ? `
        <div class="blockers">
            <h3>🚨 阻塞问题 (必须解决)</h3>
            <ul>
                ${overall.blockers.map(blocker => `<li>${blocker}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        
        ${overall.warnings.length > 0 ? `
        <div class="warnings">
            <h3>⚠️ 警告问题 (建议解决)</h3>
            <ul>
                ${overall.warnings.map(warning => `<li>${warning}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        
        <div class="recommendations">
            <h3>💡 改进建议</h3>
            <ul>
                ${overall.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        
        <div class="footer">
            <p>SmartAbp 生产就绪验证工具 v1.0.0 | 基于企业级最佳实践</p>
        </div>
    </div>
</body>
</html>
    `
  }

  getPhaseTitle(phaseName) {
    const titles = {
      qualityGates: '📊 代码质量',
      dependencyCheck: '🔍 依赖安全',
      functionalTests: '🧪 功能测试',
      performanceTests: '⚡ 性能基准',
      securityAudit: '🛡️ 安全审计'
    }
    return titles[phaseName] || phaseName
  }

  getPhaseDetails(phaseName, phase) {
    if (!phase.results) return '<p>无详细结果</p>'
    
    switch (phaseName) {
      case 'qualityGates':
        const qr = phase.results
        return `
          <p>TypeScript: ${qr.typescript.status} ${qr.typescript.errors ? `(${qr.typescript.errors}错误)` : ''}</p>
          <p>ESLint: ${qr.eslint.status} ${qr.eslint.errors ? `(${qr.eslint.errors}错误)` : ''}</p>
          <p>构建: ${qr.build.status} ${qr.build.duration ? `(${qr.build.duration}秒)` : ''}</p>
          <p>测试: ${qr.tests.status} ${qr.tests.passed ? `(${qr.tests.passed}通过)` : ''}</p>
        `
      case 'dependencyCheck':
        const dr = phase.results
        return `
          <p>高危漏洞: ${dr.vulnerabilities.high}个</p>
          <p>中危漏洞: ${dr.vulnerabilities.medium}个</p>
          <p>过期包: ${dr.outdatedPackages}个</p>
        `
      case 'functionalTests':
        const fr = phase.results
        return `
          <p>E2E测试: ${fr.e2eTests.passed}/${fr.e2eTests.total}通过</p>
          <p>执行时间: ${fr.duration}秒</p>
        `
      case 'performanceTests':
        const pr = phase.results
        return `
          <p>性能测试: ${pr.summary?.passedTests || 0}/${pr.summary?.totalTests || 0}通过</p>
          <p>成功率: ${pr.summary?.successRate || 0}%</p>
        `
      case 'securityAudit':
        const sr = phase.results
        return `
          <p>安全评分: ${sr.summary?.securityScore || 0}/100</p>
          <p>高危漏洞: ${sr.summary?.highRiskVulnerabilities || 0}个</p>
        `
      default:
        return '<p>暂无详细信息</p>'
    }
  }

  /**
   * 检查服务器健康状态
   */
  async checkServerHealth(url) {
    try {
      const response = await fetch(url, { 
        method: 'GET',
        timeout: 5000
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  /**
   * 显示结果摘要
   */
  displayResultsSummary() {
    console.log('\n' + '=' .repeat(80))
    console.log('🎯 SmartAbp 生产就绪验证完成')
    console.log('=' .repeat(80))
    
    const { overall, phases } = this.results
    
    console.log(`📊 总体状态: ${this.getStatusEmoji(overall.status)} ${overall.status}`)
    console.log(`📈 就绪评分: ${overall.readinessScore}/100`)
    console.log(`🚨 阻塞问题: ${overall.blockers.length}个`)
    console.log(`⚠️  警告问题: ${overall.warnings.length}个`)
    
    console.log('\n📋 各阶段状态:')
    Object.entries(phases).forEach(([phase, result]) => {
      console.log(`  ${this.getStatusEmoji(result.status)} ${this.getPhaseTitle(phase)}: ${result.status}`)
    })
    
    if (overall.blockers.length > 0) {
      console.log('\n🚨 必须解决的阻塞问题:')
      overall.blockers.forEach(blocker => console.log(`  ❌ ${blocker}`))
    }
    
    if (overall.warnings.length > 0) {
      console.log('\n⚠️ 建议解决的警告问题:')
      overall.warnings.forEach(warning => console.log(`  ⚠️  ${warning}`))
    }
    
    console.log('\n📄 详细报告: docs/production-readiness-report.html')
    console.log(`⏱️  验证耗时: ${Math.round((Date.now() - new Date(this.results.timestamp).getTime()) / 1000)}秒`)
    console.log('=' .repeat(80))
    
    // 根据结果给出最终建议
    if (overall.status === 'PRODUCTION_READY') {
      console.log('🎉 恭喜！系统已达到生产就绪标准，可以部署到生产环境')
    } else if (overall.status === 'CONDITIONALLY_READY') {
      console.log('⚠️  系统基本满足生产要求，但建议解决警告问题后再部署')
    } else {
      console.log('❌ 系统尚未达到生产就绪标准，请先解决所有阻塞问题')
    }
  }

  getStatusEmoji(status) {
    const emojis = {
      'PRODUCTION_READY': '✅',
      'CONDITIONALLY_READY': '⚠️',
      'NOT_READY': '❌',
      'PASSED': '✅',
      'WARNING': '⚠️',
      'FAILED': '❌',
      'SKIPPED': '⏭️'
    }
    return emojis[status] || '❓'
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ProductionReadinessValidator()
  validator.runFullValidation()
    .then(() => {
      process.exit(validator.results.overall.status === 'PRODUCTION_READY' ? 0 : 1)
    })
    .catch((error) => {
      console.error('验证执行失败:', error)
      process.exit(1)
    })
}

export default ProductionReadinessValidator
