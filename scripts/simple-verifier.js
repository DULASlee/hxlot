#!/usr/bin/env node

/**
 * 简化版质量保障系统验证工具
 * 验证系统核心功能，不依赖外部包
 */

const fs = require('fs')
const path = require('path')

class SimpleQualityVerifier {
  constructor() {
    this.results = []
    this.coreFiles = [
      'src/SmartAbp.Vue/scripts/code-quality-engine.js',
      'src/SmartAbp.Vue/scripts/quality-config.json'
    ]
  }

  async runVerification() {
    console.log('🔍 验证质量保障系统核心文件...')
    
    try {
      await this.verifyCoreFiles()
      await this.verifyConfigStructure()
      
      this.displayResults()
      return true
    } catch (error) {
      console.log('❌ 验证失败:', error.message)
      return false
    }
  }

  async verifyCoreFiles() {
    console.log('📁 验证核心文件...')
    
    this.coreFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file)
        this.results.push({
          file: file,
          exists: true,
          size: stats.size,
          message: '文件存在且可访问'
        })
      } else {
        this.results.push({
          file: file,
          exists: false,
          message: '文件不存在'
        })
      }
    })
  }

  async verifyConfigStructure() {
    console.log('⚙️  验证配置文件结构...')
    
    const configPath = 'src/SmartAbp.Vue/scripts/quality-config.json'
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        const hasQualityRules = config.qualityStandards && Object.keys(config.qualityStandards).length > 0
        const hasSecurityRules = config.securityRules && Object.keys(config.securityRules).length > 0
        
        this.results.push({
          check: '配置文件结构',
          valid: hasQualityRules && hasSecurityRules,
          message: hasQualityRules && hasSecurityRules ? 
            '配置文件结构完整' : '配置文件结构不完整'
        })
      } catch (error) {
        this.results.push({
          check: '配置文件解析',
          valid: false,
          message: '配置文件解析失败: ' + error.message
        })
      }
    }
  }

  displayResults() {
    console.log('\n📋 验证结果:')
    console.log('=' .repeat(50))
    
    let allPassed = true
    
    this.results.forEach(result => {
      const status = result.exists !== undefined ? 
        (result.exists ? '✅' : '❌') :
        (result.valid ? '✅' : '❌')
      
      const message = result.exists !== undefined ? 
        `${status} ${result.file}: ${result.message} (${result.size || 0} bytes)` :
        `${status} ${result.check}: ${result.message}`
      
      console.log(message)
      
      if (result.exists === false || result.valid === false) {
        allPassed = false
      }
    })
    
    console.log('\n' + '=' .repeat(50))
    console.log(allPassed ? '🎉 所有核心验证通过!' : '⚠️  发现一些问题需要修复')
    console.log('运行完整验证: node scripts/verify-quality-system.js')
  }
}

// 运行验证
const verifier = new SimpleQualityVerifier()
verifier.runVerification().then(success => {
  process.exit(success ? 0 : 1)
})