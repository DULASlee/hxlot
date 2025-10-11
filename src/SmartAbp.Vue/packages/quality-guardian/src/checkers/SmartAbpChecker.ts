/**
 * SmartAbp Quality Guardian - SmartAbp特定规则检查器
 * 检查SmartAbp项目特有的代码质量规则
 * 
 * 检查项：
 * 1. 硬编码常量检测（P1）
 * 2. 空实现检测（P1）
 * 3. Mock代码检测（P0）
 * 4. TODO标记检测（P2）
 * 5. console.log检测（P2）
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import type { IChecker, CheckResult, Violation } from '../types'

export class SmartAbpChecker implements IChecker {
  name = 'SmartAbp'
  private projectRoot: string
  private violations: Violation[]

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || process.cwd()
    this.violations = []
  }

  async check(): Promise<CheckResult> {
    const startTime = Date.now()
    console.log('\n🎯 SmartAbp特定规则检查\n')
    console.log('='.repeat(60))
    console.log('')

    await this.checkHardcodedConstants()
    await this.checkEmptyImplementations()
    await this.checkMockCode()
    await this.checkTodoMarkers()
    await this.checkConsoleLog()

    this.printSummary()

    return {
      checker: this.name,
      passed: this.violations.filter(v => v.level === 'P0').length === 0,
      duration: Date.now() - startTime,
      violations: this.violations
    }
  }

  private async checkHardcodedConstants(): Promise<void> {
    console.log('  📋 检查1: 硬编码常量')

    const patterns = [
      {
        name: '硬编码URL',
        pattern: 'http://|https://',
        excludePatterns: ['i18n/', 'locales/', '__tests__/', 'test/', '.spec.', '.test.'],
        level: 'P1' as const
      },
      {
        name: '硬编码密码/密钥',
        pattern: 'password.*=.*["\']|apiKey.*=.*["\']|secret.*=.*["\']',
        excludePatterns: ['__tests__/', 'test/', '.spec.', '.test.'],
        level: 'P0' as const
      },
      {
        name: '魔法数字',
        pattern: '\\b(1000|2000|3000|5000|10000)\\b',
        excludePatterns: ['__tests__/', 'test/', '.spec.', '.test.', 'constants.ts', 'config.ts'],
        level: 'P2' as const
      }
    ]

    for (const pattern of patterns) {
      await this.checkPattern(
        pattern.name,
        pattern.pattern,
        pattern.excludePatterns,
        pattern.level,
        'smartabp.no-hardcoded-constants'
      )
    }
  }

  private async checkEmptyImplementations(): Promise<void> {
    console.log('  📋 检查2: 空实现检测')

    const searchDirs = [
      'src/SmartAbp.Vue/src',
      'src/SmartAbp.Vue/packages',
      'src/SmartAbp.Application/*/AppServices'
    ]

    let totalViolations = 0

    for (const dir of searchDirs) {
      const fullPath = join(this.projectRoot, dir)
      if (!existsSync(fullPath)) continue

      try {
        const result = execSync(
          `grep -rn "\\(\\)\\s*{\\s*}" --include="*.ts" --include="*.vue" --include="*.cs" "${fullPath}" | grep -v "__tests__" | grep -v "/dist/" || true`,
          { encoding: 'utf8' }
        )

        const violations = this.parseGrepResults(result)
        totalViolations += violations.length

        violations.forEach(v => {
          this.violations.push({
            rule: 'smartabp.no-empty-implementations',
            level: 'P1',
            file: v.file,
            line: v.line,
            message: '发现空实现，应该提供真实的业务逻辑',
            snippet: v.content
          })
        })
      } catch (error) {
        // 正常
      }
    }

    if (totalViolations === 0) {
      console.log('     ✅ 未发现空实现（0违规）')
    } else {
      console.log(`     ⚠️  发现 ${totalViolations} 处空实现`)
    }
  }

  private async checkMockCode(): Promise<void> {
    console.log('  📋 检查3: Mock代码检测')

    const searchDirs = ['src/SmartAbp.Vue/src', 'src/SmartAbp.Application']

    let totalViolations = 0

    for (const dir of searchDirs) {
      const fullPath = join(this.projectRoot, dir)
      if (!existsSync(fullPath)) continue

      try {
        const result = execSync(
          `grep -rn "\\bmock\\b|\\bMock\\b|Promise\\.resolve({" --include="*.ts" --include="*.cs" "${fullPath}" | grep -v "__tests__" | grep -v "/test/" | grep -v ".spec." | grep -v ".test." | grep -v "/dist/" || true`,
          { encoding: 'utf8' }
        )

        const violations = this.parseGrepResults(result)
        totalViolations += violations.length

        violations.forEach(v => {
          this.violations.push({
            rule: 'smartabp.no-mock-code-in-production',
            level: 'P0',
            file: v.file,
            line: v.line,
            message: '生产代码中禁止使用Mock数据，必须调用真实API',
            snippet: v.content
          })
        })
      } catch (error) {
        // 正常
      }
    }

    if (totalViolations === 0) {
      console.log('     ✅ 未发现Mock代码（0违规）')
    } else {
      console.log(`     ❌ 发现 ${totalViolations} 处Mock代码`)
    }
  }

  private async checkTodoMarkers(): Promise<void> {
    console.log('  📋 检查4: TODO标记检测')

    const searchDirs = [
      'src/SmartAbp.Vue/src',
      'src/SmartAbp.Vue/packages',
      'src/SmartAbp.Application'
    ]

    let totalViolations = 0

    for (const dir of searchDirs) {
      const fullPath = join(this.projectRoot, dir)
      if (!existsSync(fullPath)) continue

      try {
        const result = execSync(
          `grep -rn "TODO\\|FIXME\\|XXX\\|HACK" --include="*.ts" --include="*.vue" --include="*.cs" "${fullPath}" | grep -v "__tests__" | grep -v "/dist/" || true`,
          { encoding: 'utf8' }
        )

        const violations = this.parseGrepResults(result)
        totalViolations += violations.length

        violations.forEach(v => {
          this.violations.push({
            rule: 'smartabp.no-todo-in-production',
            level: 'P2',
            file: v.file,
            line: v.line,
            message: '建议完成TODO标记的工作',
            snippet: v.content
          })
        })
      } catch (error) {
        // 正常
      }
    }

    if (totalViolations === 0) {
      console.log('     ✅ 未发现TODO标记（0个）')
    } else if (totalViolations <= 10) {
      console.log(`     ✅ TODO标记: ${totalViolations}个（可接受）`)
    } else {
      console.log(`     ⚠️  TODO标记: ${totalViolations}个（建议减少）`)
    }
  }

  private async checkConsoleLog(): Promise<void> {
    console.log('  📋 检查5: console.log检测')

    const searchDirs = ['src/SmartAbp.Vue/src', 'src/SmartAbp.Vue/packages']

    let totalViolations = 0

    for (const dir of searchDirs) {
      const fullPath = join(this.projectRoot, dir)
      if (!existsSync(fullPath)) continue

      try {
        const result = execSync(
          `grep -rn "console\\.log\\|console\\.warn\\|console\\.error" --include="*.ts" --include="*.vue" "${fullPath}" | grep -v "__tests__" | grep -v "/dist/" || true`,
          { encoding: 'utf8' }
        )

        const violations = this.parseGrepResults(result)
        totalViolations += violations.length

        violations.forEach(v => {
          this.violations.push({
            rule: 'eslint.no-console',
            level: 'P2',
            file: v.file,
            line: v.line,
            message: '建议使用日志系统代替console.log',
            snippet: v.content
          })
        })
      } catch (error) {
        // 正常
      }
    }

    if (totalViolations === 0) {
      console.log('     ✅ 未发现console.log（0个）')
    } else if (totalViolations <= 20) {
      console.log(`     ✅ console.log: ${totalViolations}个（可接受）`)
    } else {
      console.log(`     ⚠️  console.log: ${totalViolations}个（建议使用日志系统）`)
    }
  }

  private async checkPattern(
    name: string,
    pattern: string,
    excludePatterns: string[],
    level: 'P0' | 'P1' | 'P2',
    rule: string
  ): Promise<number> {
    const searchDirs = ['src/SmartAbp.Vue/src', 'src/SmartAbp.Vue/packages']

    let totalViolations = 0

    for (const dir of searchDirs) {
      const fullPath = join(this.projectRoot, dir)
      if (!existsSync(fullPath)) continue

      try {
        let grepCmd = `grep -rn "${pattern}" --include="*.ts" --include="*.vue" "${fullPath}"`

        for (const exclude of excludePatterns) {
          grepCmd += ` | grep -v "${exclude}"`
        }

        grepCmd += ` | grep -v "/dist/" || true`

        const result = execSync(grepCmd, { encoding: 'utf8' })
        const violations = this.parseGrepResults(result)
        totalViolations += violations.length

        violations.forEach(v => {
          this.violations.push({
            rule,
            level,
            file: v.file,
            line: v.line,
            message: `${name}`,
            snippet: v.content
          })
        })
      } catch (error) {
        // 正常
      }
    }

    if (totalViolations === 0) {
      console.log(`     ✅ ${name}: 0违规`)
    } else if (level === 'P0') {
      console.log(`     ❌ ${name}: ${totalViolations}处`)
    } else if (level === 'P1') {
      console.log(`     ⚠️  ${name}: ${totalViolations}处`)
    } else {
      console.log(`     ℹ️  ${name}: ${totalViolations}处`)
    }

    return totalViolations
  }

  private parseGrepResults(output: string): Array<{ file: string; line: number; content: string }> {
    if (!output || !output.trim()) return []

    const violations: Array<{ file: string; line: number; content: string }> = []
    const lines = output.split('\n').filter(line => line.trim())

    for (const line of lines) {
      const match = line.match(/^(.+):(\d+):(.+)$/)
      if (match) {
        violations.push({
          file: match[1],
          line: parseInt(match[2]),
          content: match[3].trim()
        })
      }
    }

    return violations
  }

  private printSummary(): void {
    const p0Count = this.violations.filter(v => v.level === 'P0').length
    const p1Count = this.violations.filter(v => v.level === 'P1').length
    const p2Count = this.violations.filter(v => v.level === 'P2').length

    console.log('')
    console.log('='.repeat(60))
    console.log('\n📊 SmartAbp规则检查结果:\n')

    if (p0Count === 0) {
      console.log('  ✅ P0检查全部通过！')
    } else {
      console.log(`  ❌ P0违规: ${p0Count}个`)
    }

    if (p1Count > 0) {
      console.log(`  ⚠️  P1警告: ${p1Count}个`)
    }

    if (p2Count > 0) {
      console.log(`  ℹ️  P2建议: ${p2Count}个`)
    }

    console.log(`\n  总违规数: ${p0Count + p1Count + p2Count}`)
    console.log('')
  }
}

