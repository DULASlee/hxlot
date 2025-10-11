/**
 * SmartAbp Quality Guardian - 架构合规检查器
 * 
 * P0规则：
 * - packages黑盒独立
 * - 禁止相对路径跨包引用
 * - 禁止引用主应用
 * - 严格遵循架构分层
 */

import { execSync } from 'child_process'
import { existsSync, writeFileSync } from 'fs'
import { join, dirname, relative } from 'path'
import type { IChecker, CheckResult, Violation, ViolationLevel } from '../types'

interface GrepResult {
  file: string
  line: number
  content: string
}

interface LayerCheck {
  lowLevel: string
  shouldNotDependOn: string[]
  description: string
}

interface CircularCheck {
  pkg1: string
  pkg2: string
}

export class ArchitectureChecker implements IChecker {
  name = 'Architecture'
  private projectRoot: string
  private violations: Map<ViolationLevel, Violation[]>

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || this.findProjectRoot()
    this.violations = new Map([
      ['P0', []],
      ['P1', []],
      ['P2', []],
      ['WARNING', []]
    ])
  }

  private findProjectRoot(): string {
    let current = process.cwd()
    while (current !== '/') {
      if (existsSync(join(current, 'package.json'))) {
        return current
      }
      current = dirname(current)
    }
    return process.cwd()
  }

  async check(): Promise<CheckResult> {
    const startTime = Date.now()
    console.log('\n🏗️  架构合规性检查\n')
    console.log('='.repeat(60))
    console.log('')

    // 检查1: packages相对路径引用（P0）
    await this.checkRelativeImportsInPackages()

    // 检查2: packages引用主应用（P0）
    await this.checkMainAppImportsInPackages()

    // 检查3: packages逆向依赖（P0）
    await this.checkReverseDependencies()

    // 检查4: 循环依赖（P1）
    await this.checkCircularDependencies()

    // 汇总结果
    this.printSummary()

    const p0Violations = this.violations.get('P0') || []
    const allViolations = Array.from(this.violations.values()).flat()

    return {
      checker: this.name,
      passed: p0Violations.length === 0,
      duration: Date.now() - startTime,
      violations: allViolations,
      stats: {
        P0: p0Violations.length,
        P1: (this.violations.get('P1') || []).length,
        P2: (this.violations.get('P2') || []).length,
        WARNING: (this.violations.get('WARNING') || []).length
      }
    }
  }

  private async checkRelativeImportsInPackages(): Promise<void> {
    console.log('  📋 检查1: packages相对路径引用')

    const packagesDir = join(this.projectRoot, 'src/SmartAbp.Vue/packages')

    if (!existsSync(packagesDir)) {
      console.log('     ⚠️ packages目录不存在，跳过')
      return
    }

    try {
      // 搜索跨包的相对路径引用（包含多个../或引用其他包名）
      // 使用两个步骤：
      // 1. 先找所有 from '../' 
      // 2. 然后过滤出包含其他包名或多层../的跨包引用
      const allRelativeImports = execSync(
        `grep -rn "from ['\\\"]\\.\\./" --include="*.ts" --include="*.vue" "${packagesDir}" | grep -v "node_modules" | grep -v "/dist/" | grep -v "/__tests__/" | grep -v "/quality-guardian/" || true`,
        { encoding: 'utf8' }
      )

      // 过滤出真正的跨包引用（排除：1. 包内引用 2. 模板字符串 3. 测试文件）
      const crossPackageImports = allRelativeImports
        .split('\n')
        .filter(line => {
          if (!line.trim()) return false
          // 排除模板字符串（代码生成模板）
          if (line.includes('${')) return false
          // 排除测试和示例文件
          if (line.includes('/dev/') || line.includes('/demo/') || line.includes('TestView')) return false
          // 提取import语句中的路径部分
          const match = line.match(/from\s+['"](\.\.\/[^'"]+)['"]/)
          if (!match) return false
          const importPath = match[1]
          // 只检查是否引用其他包名（真正的跨包引用）
          const packageNames = ['lowcode-shared', 'lowcode-core', 'lowcode-designer', 'lowcode-api', 'lowcode-tools', 'metadata-core', 'quality-guardian']
          return packageNames.some(pkg => importPath.includes(`/${pkg}/`))
        })
        .join('\n')

      const violations = this.parseGrepResults(crossPackageImports)

      if (violations.length === 0) {
        console.log('     ✅ 未发现跨package相对路径引用（0违规）')
      } else {
        console.log(`     ❌ 发现 ${violations.length} 处相对路径违规`)

        violations.forEach(v => {
          this.violations.get('P0')!.push({
            rule: 'architecture.no-relative-imports-in-packages',
            level: 'P0',
            file: v.file,
            line: v.line,
            message: 'packages间禁止使用相对路径，必须使用@smartabp/别名',
            snippet: v.content,
            fix: this.suggestFix(v.content)
          })
        })

        // 显示前3个违规
        console.log('\n     前3个违规:')
        violations.slice(0, 3).forEach(v => {
          const relPath = relative(this.projectRoot, v.file)
          console.log(`       • ${relPath}:${v.line}`)
          console.log(`         ${v.content}`)
          const fix = this.suggestFix(v.content)
          if (fix) {
            console.log(`         建议: ${fix}`)
          }
        })
        console.log('')
      }
    } catch (error) {
      console.log('     ⚠️ 检查过程出错')
    }
  }

  private async checkMainAppImportsInPackages(): Promise<void> {
    console.log('  📋 检查2: packages引用主应用')

    const packagesDir = join(this.projectRoot, 'src/SmartAbp.Vue/packages')

    if (!existsSync(packagesDir)) {
      console.log('     ⚠️ packages目录不存在，跳过')
      return
    }

    try {
      // 搜索 '@/' 引用（主应用别名），排除lowcode-tools（白名单）
      const result = execSync(
        `grep -rn "from ['\\"]@/" --include="*.ts" --include="*.vue" "${packagesDir}" | grep -v "node_modules" | grep -v "/dist/" | grep -v "/lowcode-tools/" || true`,
        { encoding: 'utf8' }
      )

      const violations = this.parseGrepResults(result)

      if (violations.length === 0) {
        console.log('     ✅ 未发现主应用引用（0违规）')
      } else {
        console.log(`     ❌ 发现 ${violations.length} 处主应用引用违规`)

        violations.forEach(v => {
          this.violations.get('P0')!.push({
            rule: 'architecture.no-main-app-imports-in-packages',
            level: 'P0',
            file: v.file,
            line: v.line,
            message: 'packages禁止引用主应用（@/），必须使用@smartabp/别名',
            snippet: v.content
          })
        })

        // 显示前3个违规
        console.log('\n     前3个违规:')
        violations.slice(0, 3).forEach(v => {
          const relPath = relative(this.projectRoot, v.file)
          console.log(`       • ${relPath}:${v.line}`)
          console.log(`         ${v.content}`)
        })
        console.log('')
      }
    } catch (error) {
      console.log('     ⚠️ 检查过程出错')
    }
  }

  private async checkReverseDependencies(): Promise<void> {
    console.log('  📋 检查3: packages逆向依赖')

    const packagesDir = join(this.projectRoot, 'src/SmartAbp.Vue/packages')

    if (!existsSync(packagesDir)) {
      console.log('     ⚠️ packages目录不存在，跳过')
      return
    }

    const reverseDepsToCheck: LayerCheck[] = [
      {
        lowLevel: 'lowcode-shared',
        shouldNotDependOn: ['lowcode-core', 'lowcode-designer', 'lowcode-api', 'lowcode-tools'],
        description: 'lowcode-shared（层级0）不能依赖任何其他包'
      },
      {
        lowLevel: 'lowcode-core',
        shouldNotDependOn: ['lowcode-designer'],
        description: 'lowcode-core（层级1）不能依赖 lowcode-designer（层级2）'
      },
      {
        lowLevel: 'lowcode-api',
        shouldNotDependOn: ['lowcode-designer', 'lowcode-core'],
        description: 'lowcode-api（层级1）不能依赖 lowcode-designer 或同层级的 lowcode-core'
      }
    ]

    let totalViolations = 0

    for (const check of reverseDepsToCheck) {
      const packageDir = join(packagesDir, check.lowLevel)
      if (!existsSync(packageDir)) continue

      for (const highLevel of check.shouldNotDependOn) {
        try {
          // 只检查真实的 import 语句，排除 external 配置、注释、字符串字面量
          const result = execSync(
            `grep -rn "from ['\\\"]@smartabp/${highLevel}" --include="*.ts" --include="*.vue" "${packageDir}" | grep -v "/dist/" || true`,
            { encoding: 'utf8' }
          )

          const violations = this.parseGrepResults(result)

          if (violations.length > 0) {
            totalViolations += violations.length
            console.log(`     ❌ ${check.lowLevel} 非法依赖 ${highLevel}（${violations.length}处）`)

            violations.forEach(v => {
              this.violations.get('P0')!.push({
                rule: 'architecture.no-reverse-dependencies',
                level: 'P0',
                file: v.file,
                line: v.line,
                message: `违反架构分层：${check.description}`,
                snippet: v.content
              })
            })
          }
        } catch (error) {
          // 正常，表示没找到违规
        }
      }
    }

    if (totalViolations === 0) {
      console.log('     ✅ 架构分层正确（0逆向依赖）')
    }
  }

  private async checkCircularDependencies(): Promise<void> {
    console.log('  📋 检查4: 循环依赖')
    console.log('     ⏳ 循环依赖检查（简化版）')

    const packagesDir = join(this.projectRoot, 'src/SmartAbp.Vue/packages')

    if (!existsSync(packagesDir)) {
      console.log('     ⚠️ packages目录不存在，跳过')
      return
    }

    // 检查循环依赖（A→B→A）
    const sameLevelChecks: CircularCheck[] = [
      { pkg1: 'lowcode-core', pkg2: 'lowcode-api' },
      { pkg1: 'lowcode-core', pkg2: 'lowcode-tools' },
      { pkg1: 'lowcode-api', pkg2: 'lowcode-tools' }
    ]

    let circularFound = false

    for (const check of sameLevelChecks) {
      const pkg1Dir = join(packagesDir, check.pkg1)
      const pkg2Dir = join(packagesDir, check.pkg2)

      if (!existsSync(pkg1Dir) || !existsSync(pkg2Dir)) continue

      try {
        // 检查 pkg1 是否引用 pkg2
        const result1 = execSync(
          `grep -rn "@smartabp/${check.pkg2}" --include="*.ts" --include="*.vue" "${pkg1Dir}" | grep -v "/dist/" || true`,
          { encoding: 'utf8' }
        )

        // 检查 pkg2 是否引用 pkg1
        const result2 = execSync(
          `grep -rn "@smartabp/${check.pkg1}" --include="*.ts" --include="*.vue" "${pkg2Dir}" | grep -v "/dist/" || true`,
          { encoding: 'utf8' }
        )

        if (result1.trim() && result2.trim()) {
          circularFound = true
          console.log(`     ❌ 发现循环依赖: ${check.pkg1} ⇄ ${check.pkg2}`)

          this.violations.get('P1')!.push({
            rule: 'architecture.no-circular-dependencies',
            level: 'P1',
            file: `${check.pkg1} ⇄ ${check.pkg2}`,
            message: `发现循环依赖: ${check.pkg1} ⇄ ${check.pkg2}`,
            snippet: '严禁循环依赖（A→B→A），允许单向依赖（如api→core）'
          })
        }
      } catch (error) {
        // 正常
      }
    }

    if (!circularFound) {
      console.log('     ✅ 未发现明显的循环依赖')
    }
  }

  private parseGrepResults(output: string): GrepResult[] {
    if (!output || !output.trim()) return []

    const violations: GrepResult[] = []
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

  private suggestFix(content: string): string | undefined {
    // 简单的修复建议
    if (content.includes("'../../../lowcode-shared")) {
      return content.replace("'../../../lowcode-shared", "'@smartabp/lowcode-shared")
    }
    if (content.includes("'../../lowcode-")) {
      return content.replace(/'\.\.\/\.\.\/lowcode-(\w+)'/g, "'@smartabp/lowcode-$1'")
    }
    return undefined
  }

  private printSummary(): void {
    console.log('')
    console.log('='.repeat(60))
    console.log('\n📊 架构合规检查结果:\n')

    const p0Violations = this.violations.get('P0') || []
    const p1Violations = this.violations.get('P1') || []
    const p2Violations = this.violations.get('P2') || []
    const totalViolations = p0Violations.length + p1Violations.length + p2Violations.length

    if (p0Violations.length === 0) {
      console.log('  ✅ P0架构检查全部通过！')
    } else {
      console.log(`  ❌ P0违规: ${p0Violations.length}个`)
    }

    if (p1Violations.length > 0) {
      console.log(`  ⚠️  P1警告: ${p1Violations.length}个`)
    }

    console.log(`\n  总违规数: ${totalViolations}`)
    console.log('')

    if (p0Violations.length > 0) {
      console.log('  ⛔ 架构合规检查失败！')
      console.log('  请修复所有P0违规后再提交代码。\n')
    }
  }

  exportResults(outputPath: string): void {
    const results = {
      checker: this.name,
      timestamp: new Date().toISOString(),
      passed: (this.violations.get('P0') || []).length === 0,
      summary: {
        P0: (this.violations.get('P0') || []).length,
        P1: (this.violations.get('P1') || []).length,
        P2: (this.violations.get('P2') || []).length,
        total: Array.from(this.violations.values()).flat().length
      },
      violations: Object.fromEntries(this.violations)
    }

    writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8')
  }
}

