/**
 * 微AI 2.0 - 三大铁律智能执行引擎
 * 架构守护者：统一的守护入口
 */

import { TypeSystemGuard, type TypeViolation } from './TypeSystemGuard'
import { ComponentRegistryGuard } from './ComponentRegistryGuard'
import { DependencyLayerGuard, type DependencyViolation } from './DependencyLayerGuard'

export interface GuardianReport {
  timestamp: Date
  totalViolations: number
  autoFixed: number
  manualFixRequired: number
  byType: {
    typeSystem: number
    componentRegistry: number
    dependencyLayer: number
  }
  details: {
    typeViolations: TypeViolation[]
    dependencyViolations: DependencyViolation[]
  }
}

/**
 * 架构守护者
 * 统一管理三大铁律的检测和执行
 */
export class ArchitectureGuardian {
  private typeSystemGuard: TypeSystemGuard
  private componentRegistryGuard: ComponentRegistryGuard
  private dependencyLayerGuard: DependencyLayerGuard
  
  constructor() {
    this.typeSystemGuard = new TypeSystemGuard()
    this.componentRegistryGuard = new ComponentRegistryGuard()
    this.dependencyLayerGuard = new DependencyLayerGuard()
    
    // 启用组件注册守护（运行时拦截）
    this.componentRegistryGuard.enhanceVirtualAssembly()
  }
  
  /**
   * 执行完整的架构检查
   */
  async checkAll(): Promise<GuardianReport> {
    console.log('🛡️ 开始三大铁律架构检查...\n')
    
    const startTime = Date.now()
    
    // 并行检测
    const [typeViolations, dependencyViolations] = await Promise.all([
      this.typeSystemGuard.detectViolations(),
      this.dependencyLayerGuard.detectViolations()
    ])
    
    const totalViolations = typeViolations.length + dependencyViolations.length
    
    console.log(`📊 检测完成 (耗时: ${Date.now() - startTime}ms)`)
    console.log(`   铁律1（类型系统）违规: ${typeViolations.length}个`)
    console.log(`   铁律2（组件注册）: 运行时拦截 ✅`)
    console.log(`   铁律3（依赖层级）违规: ${dependencyViolations.length}个`)
    console.log(`   总违规数: ${totalViolations}个\n`)
    
    return {
      timestamp: new Date(),
      totalViolations,
      autoFixed: 0,
      manualFixRequired: 0,
      byType: {
        typeSystem: typeViolations.length,
        componentRegistry: 0, // 运行时拦截
        dependencyLayer: dependencyViolations.length
      },
      details: {
        typeViolations,
        dependencyViolations
      }
    }
  }
  
  /**
   * 自动修复所有可修复的违规
   */
  async autoFixAll(): Promise<GuardianReport> {
    const report = await this.checkAll()
    
    if (report.totalViolations === 0) {
      console.log('✅ 无违规项，架构完全合规！\n')
      return report
    }
    
    console.log('🔧 开始自动修复...\n')
    
    let autoFixed = 0
    let manualFixRequired = 0
    
    // 修复铁律1违规
    for (const violation of report.details.typeViolations) {
      if (violation.autoFixable) {
        try {
          const fixed = await this.typeSystemGuard.autoFix(violation)
          if (fixed) {
            autoFixed++
            console.log(`✅ 自动修复: ${violation.file}:${violation.line}`)
          }
        } catch (error) {
          console.error(`❌ 修复失败: ${violation.file}:${violation.line}`, error)
          manualFixRequired++
        }
      } else {
        manualFixRequired++
        console.log(`⚠️  需要手动修复: ${violation.file}:${violation.line}`)
        console.log(`   ${violation.suggestion}`)
      }
    }
    
    // 修复铁律3违规
    for (const violation of report.details.dependencyViolations) {
      if (violation.autoFixable) {
        try {
          const fixed = await this.dependencyLayerGuard.autoFixRelativePath(violation)
          if (fixed) {
            autoFixed++
            console.log(`✅ 自动修复: ${violation.file}`)
          }
        } catch (error) {
          console.error(`❌ 修复失败: ${violation.file}`, error)
          manualFixRequired++
        }
      } else {
        manualFixRequired++
        console.log(`⚠️  需要手动修复: ${violation.file}`)
        console.log(`   ${violation.message}`)
      }
    }
    
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📊 修复完成`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`✅ 自动修复: ${autoFixed}个`)
    console.log(`⚠️  需要手动: ${manualFixRequired}个`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
    
    report.autoFixed = autoFixed
    report.manualFixRequired = manualFixRequired
    
    return report
  }
  
  /**
   * 生成合规性报告
   */
  generateComplianceReport(report: GuardianReport): string {
    const complianceRate = report.totalViolations === 0 
      ? 100 
      : Math.max(0, 100 - (report.totalViolations * 2))
    
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️  三大铁律合规性报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 时间: ${report.timestamp.toLocaleString()}

📊 总体合规率: ${complianceRate.toFixed(1)}%
${complianceRate >= 95 ? '✅' : complianceRate >= 80 ? '⚠️' : '❌'} ${
  complianceRate >= 95 ? '优秀' : 
  complianceRate >= 80 ? '良好' : 
  '需要改进'
}

📋 违规统计:
   - 铁律1（类型系统）: ${report.byType.typeSystem}个
   - 铁律2（组件注册）: 运行时强制拦截 ✅
   - 铁律3（依赖层级）: ${report.byType.dependencyLayer}个
   - 总违规数: ${report.totalViolations}个

🔧 修复情况:
   - 自动修复: ${report.autoFixed}个
   - 需要手动: ${report.manualFixRequired}个

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${report.totalViolations === 0 ? 
  '🎉 恭喜！架构完全合规，三大铁律执行完美！' :
  '💡 建议：运行 npm run arch:fix 自动修复可修复的违规项'
}
    `.trim()
  }
}

// 导出全局单例
export const globalArchitectureGuardian = new ArchitectureGuardian()

