/**
 * @smartabp/quality-guardian
 * 
 * SmartAbp企业级代码质量检测工具
 * 提供完整的通用代码质量检查和SmartAbp专用规则检查
 * 
 * @packageDocumentation
 */

import { QualityEngine } from './core/QualityEngine'
import type { CheckResult, QualityConfig, QualityReport, QualityScore, Violation } from './types'

// 重新导出
export { QualityEngine }
export type { CheckResult, QualityConfig, QualityReport, QualityScore, Violation }

// 检查器导出
export {
  ArchitectureChecker, CodeGenChecker, CodeSmellChecker,
  ComplexityChecker,
  DuplicationChecker, LowCodeChecker, PerformanceChecker,
  SecurityChecker, SmartAbpChecker, TypeScriptChecker
} from './checkers'

// 报告生成器导出
export { ReportFormat, ReportGenerator } from './reporters/ReportGenerator'

/**
 * 快速启动质量检查
 * 
 * @example
 * ```typescript
 * import { runQualityCheck } from '@smartabp/quality-guardian'
 * 
 * const report = await runQualityCheck({
 *   projectRoot: '/path/to/project',
 *   mode: 'full', // 'quick' | 'full' | 'expert'
 *   thresholds: {
 *     overall: 80,
 *     security: 90
 *   }
 * })
 * 
 * console.log(`质量评分: ${report.score.overall}/100`)
 * if (report.passed) {
 *   console.log('✅ 质量检查通过！')
 * else {
 *   console.log('❌ 质量检查失败！')
 *   process.exit(1)
 * }
 * ```
 */
export async function runQualityCheck(config?: Partial<QualityConfig>): Promise<QualityReport> {
  const engine = new QualityEngine(config)
  return await engine.run()
}

/**
 * 用于低代码引擎生成代码后的质量检查
 * 
 * @example
 * ```typescript
 * import { checkGeneratedCode } from '@smartabp/quality-guardian'
 * 
 * // 生成代码后立即检查
 * const result = await checkGeneratedCode({
 *   generatedFiles: ['src/generated/User.ts', 'src/generated/Product.ts'],
 *   strict: true // 严格模式，P0违规立即终止
 * })
 * 
 * if (!result.passed) {
 *   throw new Error('生成的代码不符合质量标准')
 * }
 * ```
 */
export async function checkGeneratedCode(options: {
  generatedFiles?: string[]
  strict?: boolean
}): Promise<QualityReport> {
  const engine = new QualityEngine({
    mode: 'full',
    checkers: ['architecture', 'typescript', 'security'],
    thresholds: {
      overall: options.strict ? 95 : 80
    }
  })

  const report = await engine.run()

  // 严格模式下，P0违规立即失败
  if (options.strict && report.summary.P0 > 0) {
    throw new Error(`生成的代码存在${report.summary.P0}个P0违规项，无法通过质量检查`)
  }

  return report
}

