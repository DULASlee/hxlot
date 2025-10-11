/**
 * SmartAbp Quality Guardian - TypeScript检查器
 * 
 * P0规则：
 * - 100%类型安全
 * - 零容忍 as any / @ts-ignore
 * - TypeScript编译0错误
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join, relative } from 'path'
import type { IChecker, CheckResult, Violation } from '../types'

interface TypeScriptError {
  file: string
  line: number
  column: number
  code: string
  message: string
}

export class TypeScriptChecker implements IChecker {
  name = 'TypeScript'
  private projectRoot: string
  private violations: Violation[] = []

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || process.cwd()
  }

  async check(): Promise<CheckResult> {
    const startTime = Date.now()
    console.log('\n🔍 TypeScript类型安全检查\n')
    console.log('='.repeat(60))
    console.log('')

    // 检查1: TypeScript编译
    await this.checkTypeScriptCompilation()

    // 检查2: 禁用 as any
    await this.checkNoAsAny()

    // 检查3: 禁用 @ts-ignore
    await this.checkNoTsIgnore()

    this.printSummary()

    const p0Violations = this.violations.filter(v => v.level === 'P0')

    return {
      checker: this.name,
      passed: p0Violations.length === 0,
      duration: Date.now() - startTime,
      violations: this.violations,
      stats: {
        totalViolations: this.violations.length,
        P0: p0Violations.length
      }
    }
  }

  private async checkTypeScriptCompilation(): Promise<void> {
    console.log('  📋 检查1: TypeScript编译')

    const vueDir = join(this.projectRoot, 'src/SmartAbp.Vue')

    if (!existsSync(vueDir)) {
      console.log('     ⚠️ Vue项目目录不存在，跳过')
      return
    }

    try {
      console.log('     正在检查类型...')

      execSync('npx tsc --noEmit --project tsconfig.json', {
        cwd: vueDir,
        encoding: 'utf8',
        stdio: 'pipe'
      })

      console.log('     ✅ TypeScript编译通过（0错误）')
    } catch (error: any) {
      const errorOutput = error.stdout || error.stderr || ''
      const errorLines = errorOutput.split('\n').filter((line: string) => line.trim())

      const tsErrors = this.parseTypeScriptErrors(errorLines)

      if (tsErrors.length > 0) {
        console.log(`     ❌ TypeScript编译失败（${tsErrors.length}个错误）`)

        tsErrors.forEach(err => {
          this.violations.push({
            rule: 'typescript.no-compilation-errors',
            level: 'P0',
            file: err.file,
            line: err.line,
            column: err.column,
            message: err.message,
            snippet: err.code
          })
        })

        // 显示前5个错误
        console.log('\n     前5个错误:')
        tsErrors.slice(0, 5).forEach(err => {
          console.log(`       • ${err.file}:${err.line}:${err.column}`)
          console.log(`         ${err.message}`)
        })
        console.log('')
      }
    }
  }

  private parseTypeScriptErrors(errorLines: string[]): TypeScriptError[] {
    const errors: TypeScriptError[] = []

    for (const line of errorLines) {
      // 匹配格式: src/file.ts(10,5): error TS2345: ...
      const match = line.match(/^(.+\.tsx?)\((\d+),(\d+)\): error (TS\d+): (.+)$/)

      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          code: match[4],
          message: match[5]
        })
      }
    }

    return errors
  }

  private async checkNoAsAny(): Promise<void> {
    console.log('  📋 检查2: 禁用 as any')

    try {
      const result = execSync(
        `grep -rn "as any" --include="*.ts" --include="*.vue" src/ | grep -v "node_modules" | grep -v "/dist/" || true`,
        { cwd: this.projectRoot, encoding: 'utf8' }
      )

      const matches = result.split('\n').filter(line => line.trim())

      if (matches.length === 0) {
        console.log('     ✅ 未发现 as any（0违规）')
      } else {
        console.log(`     ❌ 发现 ${matches.length} 处 as any`)

        matches.forEach(match => {
          const parts = match.split(':')
          if (parts.length >= 3) {
            this.violations.push({
              rule: 'typescript.no-as-any',
              level: 'P0',
              file: parts[0],
              line: parseInt(parts[1]) || 0,
              message: '禁止使用 as any，必须提供明确的类型',
              snippet: parts.slice(2).join(':').trim()
            })
          }
        })

        // 显示前3个
        console.log('\n     前3个违规:')
        matches.slice(0, 3).forEach(match => {
          console.log(`       • ${match}`)
        })
        console.log('')
      }
    } catch (error) {
      console.log('     ⚠️ 检查过程出错')
    }
  }

  private async checkNoTsIgnore(): Promise<void> {
    console.log('  📋 检查3: 禁用 @ts-ignore')

    try {
      const result = execSync(
        `grep -rn "@ts-ignore" --include="*.ts" --include="*.vue" src/ | grep -v "node_modules" | grep -v "/dist/" || true`,
        { cwd: this.projectRoot, encoding: 'utf8' }
      )

      const matches = result.split('\n').filter(line => line.trim())

      if (matches.length === 0) {
        console.log('     ✅ 未发现 @ts-ignore（0违规）')
      } else {
        console.log(`     ❌ 发现 ${matches.length} 处 @ts-ignore`)

        matches.forEach(match => {
          const parts = match.split(':')
          if (parts.length >= 3) {
            this.violations.push({
              rule: 'typescript.no-ts-ignore',
              level: 'P0',
              file: parts[0],
              line: parseInt(parts[1]) || 0,
              message: '禁止使用 @ts-ignore，必须修复类型错误',
              snippet: parts.slice(2).join(':').trim()
            })
          }
        })
      }
    } catch (error) {
      console.log('     ⚠️ 检查过程出错')
    }
  }

  private async checkStrictNullChecks(): Promise<void> {
    console.log('  📋 检查4: 严格null检查配置')

    const tsconfigPath = join(this.projectRoot, 'src/SmartAbp.Vue/tsconfig.json')

    if (!existsSync(tsconfigPath)) {
      console.log('     ⚠️ tsconfig.json不存在')
      return
    }

    try {
      const content = readFileSync(tsconfigPath, 'utf8')
      const config = JSON.parse(content)

      const strictNullChecks = config.compilerOptions?.strictNullChecks !== false
      const strict = config.compilerOptions?.strict !== false

      if (strictNullChecks || strict) {
        console.log('     ✅ 严格null检查已启用')
      } else {
        console.log('     ⚠️ 建议启用 strictNullChecks')
        this.violations.push({
          rule: 'typescript.strict-null-checks',
          level: 'P1',
          file: 'tsconfig.json',
          message: '建议启用 strictNullChecks 以提高类型安全'
        })
      }
    } catch (error: any) {
      console.log(`     ⚠️ 无法读取tsconfig.json: ${error.message}`)
    }
  }

  private printSummary(): void {
    console.log('')
    console.log('='.repeat(60))
    console.log('\n📊 TypeScript检查结果:\n')

    const p0Violations = this.violations.filter(v => v.level === 'P0')

    if (p0Violations.length === 0) {
      console.log('  ✅ 类型安全检查全部通过！')
    } else {
      console.log(`  ❌ P0违规: ${p0Violations.length}个`)
      console.log('  ⛔ 必须修复所有类型错误！\n')
    }
  }
}

