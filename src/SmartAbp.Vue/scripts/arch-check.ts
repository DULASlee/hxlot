#!/usr/bin/env tsx

/**
 * 三大铁律架构检查 CLI
 * 
 * 使用方法:
 *   npm run arch:check  # 检查架构违规
 *   npm run arch:fix    # 自动修复违规
 *   npm run arch:report # 生成合规性报告
 */

import { globalArchitectureGuardian } from '../packages/lowcode-shared/src/guards'

async function main() {
  const command = process.argv[2] || 'check'
  
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️  微AI 2.0 - 三大铁律智能执行引擎
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `)
  
  try {
    switch (command) {
      case 'check': {
        const report = await globalArchitectureGuardian.checkAll()
        
        if (report.totalViolations === 0) {
          console.log('✅ 架构检查通过！三大铁律完全合规！\n')
          process.exit(0)
        } else {
          console.log(`❌ 发现 ${report.totalViolations} 个违规项\n`)
          
          // 显示违规详情
          if (report.details.typeViolations.length > 0) {
            console.log('📋 铁律1（类型系统）违规:')
            report.details.typeViolations.forEach(v => {
              console.log(`   ${v.file}:${v.line}`)
              console.log(`   ${v.message}`)
              console.log(`   💡 ${v.suggestion}\n`)
            })
          }
          
          if (report.details.dependencyViolations.length > 0) {
            console.log('📋 铁律3（依赖层级）违规:')
            report.details.dependencyViolations.forEach(v => {
              console.log(`   ${v.file}`)
              console.log(`   ${v.message}\n`)
            })
          }
          
          console.log('💡 运行 npm run arch:fix 自动修复可修复的违规项\n')
          process.exit(1)
        }
        break
      }
      
      case 'fix': {
        const report = await globalArchitectureGuardian.autoFixAll()
        
        if (report.autoFixed > 0) {
          console.log(`✅ 成功自动修复 ${report.autoFixed} 个违规项！\n`)
        }
        
        if (report.manualFixRequired > 0) {
          console.log(`⚠️  还有 ${report.manualFixRequired} 个违规项需要手动修复\n`)
          process.exit(1)
        } else {
          console.log('🎉 所有违规项已修复！架构完全合规！\n')
          process.exit(0)
        }
        break
      }
      
      case 'report': {
        const report = await globalArchitectureGuardian.checkAll()
        const complianceReport = globalArchitectureGuardian.generateComplianceReport(report)
        
        console.log(complianceReport)
        console.log('')
        
        process.exit(report.totalViolations > 0 ? 1 : 0)
        break
      }
      
      default:
        console.log(`未知命令: ${command}`)
        console.log(`
可用命令:
  check  - 检查架构违规
  fix    - 自动修复违规
  report - 生成合规性报告
        `)
        process.exit(1)
    }
  } catch (error) {
    console.error('❌ 执行失败:', error)
    process.exit(1)
  }
}

main()

