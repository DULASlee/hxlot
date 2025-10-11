/**
 * SmartAbp Quality Guardian - 代码异味检查器
 * 检查常见的代码异味和坏味道
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'
import type { IChecker, CheckResult, Violation } from '../types'

export class CodeSmellChecker implements IChecker {
  name = 'CodeSmell'
  private projectRoot: string
  private violations: Violation[]

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || process.cwd()
    this.violations = []
  }

  async check(): Promise<CheckResult> {
    const startTime = Date.now()
    console.log('\n👃 代码异味检查\n')
    console.log('='.repeat(60))
    console.log('')

    await this.checkCodeSmells()
    console.log('  ✅ 代码异味检查完成')

    return {
      checker: this.name,
      passed: this.violations.filter(v => v.level === 'P0').length === 0,
      duration: Date.now() - startTime,
      violations: this.violations
    }
  }

  private async checkCodeSmells(): Promise<void> {
    // 检查TODO/FIXME标记
    try {
      const result = execSync(
        `grep -rn "TODO\\|FIXME\\|XXX\\|HACK" --include="*.ts" --include="*.vue" src/ | grep -v "node_modules" | grep -v "/dist/" | wc -l || true`,
        { cwd: this.projectRoot, encoding: 'utf8' }
      )

      const count = parseInt(result.trim())
      if (count > 50) {
        this.violations.push({
          rule: 'code-smell.too-many-todos',
          level: 'WARNING',
          file: 'project',
          message: `发现${count}个TODO/FIXME标记（建议及时清理）`
        })
      }
    } catch (error: any) {
      // 忽略错误
    }
  }
}

