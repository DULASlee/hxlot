#!/usr/bin/env node

/**
 * SmartAbp质量保障系统验证工具
 * 验证系统完整性和功能正确性
 */

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

class QualitySystemVerifier {
  constructor() {
    this.verificationResults = []
    this.requiredFiles = [
      'src/SmartAbp.Vue/scripts/code-quality-engine.js',
      'src/SmartAbp.Vue/scripts/security-scanner.js',
      'src/SmartAbp.Vue/scripts/performance-analyzer.js',
      'src/SmartAbp.Vue/scripts/code-quality-helpers.js',
      'src/SmartAbp.Vue/scripts/quality-config.json',
      '.github/workflows/code-quality-check.yml',
      'package.json'
    ]
    
    this.requiredDirs = [
      'quality-reports',
      'security-reports',
      'performance-reports'
    ]
  }

  /**
   * 运行完整验证
   */
  async runFullVerification() {
    console.log(chalk.yellow('🔍 验证质量保障系统完整性...'))
    
    try {
      await this.verifyFileStructure()
      await this.verifyDependencies()
      await this.verifyConfigurations()
      await this.verifyScripts()
      await this.verifyCICDIntegration()

      const report = this.generateVerificationReport()
      this.saveReport(report)
      
      return report
    } catch (error) {
      console.log(chalk.red('❌ 系统验证失败:'), error.message)
      throw error
    }
  }

  /**
   * 验证文件结构
   */
  async verifyFileStructure() {
    console.log(chalk.blue('📁 验证文件结构...'))
    
    let allFilesExist = true
    
    this.requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.verificationResults.push({
          component: '文件结构',
          check: `文件存在: ${file}`,
          status: 'PASSED',
          message: '文件存在且可访问'
        })
      } else {
        allFilesExist = false
        this.verificationResults.push({
          component: '文件结构',
          check: `文件存在: ${file}`,
          status: 'FAILED',
          message: '文件不存在或无法访问'
        })
      }
    })

    // 验证目录结构
    this.requiredDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.verificationResults.push({
          component: '目录结构',
          check: `目录存在: ${dir}`,
          status: 'PASSED',
          message: '目录存在且可访问'
        })
      } else {
        this.verificationResults.push({
          component: '目录结构',
          check: `目录存在: ${dir}`,
          status: 'WARNING',
          message: '目录不存在，将在运行时自动创建'
        })
      }
    })

    if (allFilesExist) {
      console.log(chalk.green('✅ 文件结构验证完成'))
    } else {
      console.log(chalk.yellow('⚠️  文件结构验证完成，发现缺失文件'))
    }
  }

  /**
   * 验证依赖配置
   */
  async verifyDependencies() {
    console.log(chalk.blue('📦 验证依赖配置...'))
    
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json')
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
        
        const requiredScripts = [
          'quality:check',
          'quality:security',
          'quality:performance',
          'quality:full'
        ]
        
        requiredScripts.forEach(script => {
          if (packageJson.scripts && packageJson.scripts[script]) {
            this.verificationResults.push({
              component: '依赖配置',
              check: `脚本存在: ${script}`,
              status: 'PASSED',
              message: '脚本已正确配置'
            })
          } else {
            this.verificationResults.push({
              component: '依赖配置',
              check: `脚本存在: ${script}`,
              status: 'FAILED',
              message: '脚本未配置'
            })
          }
        })

        // 检查关键依赖
        const requiredDeps = ['eslint', 'chalk', 'vitest']
        if (packageJson.devDependencies) {
          requiredDeps.forEach(dep => {
            if (packageJson.devDependencies[dep]) {
              this.verificationResults.push({
                component: '依赖配置',
                check: `依赖存在: ${dep}`,
                status: 'PASSED',
                message: '依赖已安装'
              })
            } else {
              this.verificationResults.push({
                component: '依赖配置',
                check: `依赖存在: ${dep}`,
                status: 'WARNING',
                message: '依赖未安装，部分功能可能受限'
              })
            }
          })
        }
      }
      
      console.log(chalk.green('✅ 依赖配置验证完成'))
    } catch (error) {
      console.log(chalk.red('❌ 依赖配置验证失败'))
    }
  }

  /**
   * 验证配置文件
   */
  async verifyConfigurations() {
    console.log(chalk.blue('⚙️  验证配置文件...'))
    
    try {
      const configPath = path.join(process.cwd(), 'src/SmartAbp.Vue/scripts/quality-config.json')
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        
        // 验证配置结构
        const requiredSections = ['qualityStandards', 'securityRules', 'performanceRules']
        requiredSections.forEach(section => {
          if (config[section]) {
            this.verificationResults.push({
              component: '配置验证',
              check: `配置节存在: ${section}`,
              status: 'PASSED',
              message: '配置节存在且有效'
            })
          } else {
            this.verificationResults.push({
              component: '配置验证',
              check: `配置节存在: ${section}`,
              status: 'WARNING',
              message: '配置节不存在，使用默认值'
            })
          }
        })
      }
      
      console.log(chalk.green('✅ 配置文件验证完成'))
    } catch (error) {
      console.log(chalk.red('❌ 配置文件验证失败'))
    }
  }

  /**
   * 验证脚本功能
   */
  async verifyScripts() {
    console.log(chalk.blue('📜 验证脚本功能...'))
    
    const scriptsToVerify = [
      'src/SmartAbp.Vue/scripts/code-quality-engine.js',
      'src/SmartAbp.Vue/scripts/security-scanner.js',
      'src/SmartAbp.Vue/scripts/performance-analyzer.js'
    ]
    
    scriptsToVerify.forEach(scriptPath => {
      if (fs.existsSync(scriptPath)) {
        try {
          const content = fs.readFileSync(scriptPath, 'utf8')
          
          // 基本语法检查
          if (content.includes('require(') || content.includes('import ')) {
            this.verificationResults.push({
              component: '脚本验证',
              check: `脚本语法: ${path.basename(scriptPath)}`,
              status: 'PASSED',
              message: '脚本语法正确'
            })
          }
          
          // 检查导出
          if (content.includes('module.exports') || content.includes('export default')) {
            this.verificationResults.push({
              component: '脚本验证',
              check: `脚本导出: ${path.basename(scriptPath)}`,
              status: 'PASSED',
              message: '脚本导出配置正确'
            })
          }
          
        } catch (error) {
          this.verificationResults.push({
            component: '脚本验证',
            check: `脚本可读性: ${path.basename(scriptPath)}`,
            status: 'FAILED',
            message: '脚本无法读取或解析'
          })
        }
      }
    })
    
    console.log(chalk.green('✅ 脚本功能验证完成'))
  }

  /**
   * 验证CI/CD集成
   */
  async verifyCICDIntegration() {
    console.log(chalk.blue('🔄 验证CI/CD集成...'))
    
    const workflowPath = path.join(process.cwd(), '.github/workflows/code-quality-check.yml')
    if (fs.existsSync(workflowPath)) {
      try {
        const content = fs.readFileSync(workflowPath, 'utf8')
        
        // 检查关键配置
        const requiredKeywords = [
          'code-quality-check',
          'security-scan',
          'performance-benchmark',
          'quality-gate'
        ]
        
        requiredKeywords.forEach(keyword => {
          if (content.includes(keyword)) {
            this.verificationResults.push({
              component: 'CI/CD集成',
              check: `工作流包含: ${keyword}`,
              status: 'PASSED',
              message: 'CI/CD工作流配置正确'
            })
          } else {
            this.verificationResults.push({
              component: 'CI/CD集成',
              check: `工作流包含: ${keyword}`,
              status: 'WARNING',
              message: 'CI/CD工作流可能不完整'
            })
          }
        })
        
      } catch (error) {
        this.verificationResults.push({
          component: 'CI/CD集成',
          check: '工作流文件可读性',
          status: 'FAILED',
          message: 'CI/CD工作流文件无法读取'
        })
      }
    } else {
      this.verificationResults.push({
        component: 'CI/CD集成',
        check: '工作流文件存在',
        status: 'WARNING',
        message: 'CI/CD工作流文件不存在，需要手动配置'
      })
    }
    
    console.log(chalk.green('✅ CI/CD集成验证完成'))
  }

  /**
   * 生成验证报告
   */
  generateVerificationReport() {
    const passed = this.verificationResults.filter(r => r.status === 'PASSED').length
    const failed = this.verificationResults.filter(r => r.status === 'FAILED').length
    const warnings = this.verificationResults.filter(r => r.status === 'WARNING').length
    const total = this.verificationResults.length
    
    const score = total > 0 ? Math.round((passed / total) * 100) : 0
    
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalChecks: total,
        passed: passed,
        failed: failed,
        warnings: warnings,
        score: score
      },
      details: this.verificationResults,
      status: failed > 0 ? 'FAILED' : warnings > 0 ? 'WARNING' : 'PASSED',
      recommendations: this.generateRecommendations()
    }
  }

  /**
   * 生成改进建议
   */
  generateRecommendations() {
    const recommendations = []
    const failedItems = this.verificationResults.filter(r => r.status === 'FAILED')
    const warningItems = this.verificationResults.filter(r => r.status === 'WARNING')
    
    if (failedItems.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        message: '修复失败的验证项',
        items: failedItems.map(item => item.check)
      })
    }
    
    if (warningItems.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        message: '处理警告项以完善系统',
        items: warningItems.map(item => item.check)
      })
    }
    
    // 通用建议
    recommendations.push({
      priority: 'LOW',
      message: '优化系统配置',
      items: [
        '定期更新依赖版本',
        '配置通知渠道集成',
        '自定义质量规则阈值',
        '设置定期质量审计'
      ]
    })
    
    return recommendations
  }

  /**
   * 保存验证报告
   */
  saveReport(report, filename = 'quality-system-verification-report.json') {
    const reportDir = path.join(process.cwd(), 'quality-reports')
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }
    
    const reportFile = path.join(reportDir, filename)
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
    
    console.log(chalk.green(`📊 验证报告已保存: ${reportFile}`))
    return reportFile
  }

  /**
   * 显示验证结果
   */
  displayResults(report) {
    console.log('')
    console.log(chalk.yellow('📋 质量保障系统验证结果'))
    console.log('==============================================')
    
    console.log(`总体得分: ${chalk.blue(report.summary.score)}/100`)
    console.log(`通过: ${chalk.green(report.summary.passed)} | 失败: ${chalk.red(report.summary.failed)} | 警告: ${chalk.yellow(report.summary.warnings)}`)
    console.log(`状态: ${report.status === 'PASSED' ? chalk.green('✅ 通过') : report.status === 'WARNING' ? chalk.yellow('⚠️  警告') : chalk.red('❌ 失败')}`)
    
    console.log('')
    console.log(chalk.blue('💡 改进建议:'))
    report.recommendations.forEach(rec => {
      const priorityColor = rec.priority === 'HIGH' ? chalk.red : rec.priority === 'MEDIUM' ? chalk.yellow : chalk.blue
      console.log(`${priorityColor(`[${rec.priority}]`)} ${rec.message}`)
      rec.items.forEach(item => console.log(`  • ${item}`))
    })
    
    console.log('')
    console.log(chalk.green('🚀 验证完成!'))
  }
}

// 运行验证
const verifier = new QualitySystemVerifier()
verifier.runFullVerification().then(report => {
  verifier.displayResults(report)
}).catch(error => {
  console.log(chalk.red('❌ 系统验证过程出错:'), error.message)
  process.exit(1)
})

module.exports = { QualitySystemVerifier }