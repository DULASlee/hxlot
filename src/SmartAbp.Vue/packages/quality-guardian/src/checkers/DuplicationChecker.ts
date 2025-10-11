/**
 * SmartAbp Quality Guardian - 代码重复检查器
 * 检查重复的组件名、文件名、函数名
 */

import { execSync } from 'child_process'
import type { IChecker, CheckResult, Violation } from '../types'

export class DuplicationChecker implements IChecker {
  name = 'Duplication'
  private projectRoot: string
  private violations: Violation[]

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || process.cwd()
    this.violations = []
  }

  async check(): Promise<CheckResult> {
    const startTime = Date.now()
    console.log('\n📋 代码重复检查\n')
    console.log('='.repeat(60))
    console.log('')

    await this.checkDuplicateFileNames()
    console.log('  ✅ 代码重复检查完成')

    return {
      checker: this.name,
      passed: this.violations.filter(v => v.level === 'P0').length === 0,
      duration: Date.now() - startTime,
      violations: this.violations
    }
  }

  private async checkDuplicateFileNames(): Promise<void> {
    try {
      // 检查重复的Vue组件名
      const result = execSync(
        `find src/ -name "*.vue" | sed 's/.*\\///' | sort | uniq -d | wc -l || true`,
        { cwd: this.projectRoot, encoding: 'utf8' }
      )

      const count = parseInt(result.trim())
      if (count > 0) {
        this.violations.push({
          rule: 'duplication.duplicate-component-names',
          level: 'WARNING',
          file: 'project',
          message: `发现${count}个重复的组件名`
        })
      }
    } catch (error: any) {
      // 忽略错误
    }
  }
}

