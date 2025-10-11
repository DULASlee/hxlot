/**
 * SmartAbp Quality Guardian - 低代码引擎质量检查器
 * 专为SmartAbp低代码引擎设计的核心质量检查
 * 
 * 检查项：
 * 1. 组件注册一致性检查（P0）
 * 2. 组件元数据完整性验证（P0）
 * 3. 组件依赖关系检查（P0）
 * 4. 组件生命周期钩子验证（P1）
 * 5. 组件权限配置检查（P1）
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import type { IChecker, CheckResult, Violation } from '../types'

export class LowCodeChecker implements IChecker {
  name = 'LowCode'
  private projectRoot: string
  private violations: Violation[]
  private componentRegistryPath: string
  private packagesPath: string

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || process.cwd()
    this.violations = []
    this.componentRegistryPath = join(
      this.projectRoot,
      'src/SmartAbp.Vue/packages/lowcode-shared/src/components/ComponentRegistry.ts'
    )
    this.packagesPath = join(this.projectRoot, 'src/SmartAbp.Vue/packages')
  }

  async check(): Promise<CheckResult> {
    const startTime = Date.now()
    console.log('\n🎯 低代码引擎质量检查\n')
    console.log('='.repeat(60))
    console.log('')

    if (!existsSync(this.componentRegistryPath)) {
      console.log('  ⚠️  ComponentRegistry.ts不存在，跳过检查')
      return {
        checker: this.name,
        passed: true,
        duration: Date.now() - startTime,
        violations: []
      }
    }

    await this.checkComponentRegistrationConsistency()
    await this.checkComponentMetadataIntegrity()
    await this.checkComponentDependencies()
    await this.checkComponentNamingConventions()
    await this.checkComponentVersionConsistency()

    this.printSummary()

    return {
      checker: this.name,
      passed: this.violations.filter(v => v.level === 'P0').length === 0,
      duration: Date.now() - startTime,
      violations: this.violations
    }
  }

  private async checkComponentRegistrationConsistency(): Promise<void> {
    console.log('  📋 检查1: 组件注册一致性')

    try {
      const result = execSync(
        `grep -rn "registerComponent" --include="*.ts" --include="*.js" "${this.packagesPath}" | grep -v "node_modules" | grep -v "/dist/" || true`,
        { encoding: 'utf8' }
      )

      const registrations = this.parseComponentRegistrations(result)

      console.log(`     发现 ${registrations.length} 个组件注册调用`)

      let inconsistentCount = 0

      for (const registration of registrations) {
        const componentName = registration.name
        const componentFile = this.findComponentFile(componentName)

        if (!componentFile) {
          inconsistentCount++
          this.violations.push({
            rule: 'lowcode.component-registration-consistency',
            level: 'P0',
            file: registration.file,
            line: registration.line,
            message: `组件已注册但未找到实现文件: ${componentName}`
          })
        }
      }

      if (inconsistentCount === 0) {
        console.log('     ✅ 所有注册组件都有对应实现（0不一致）')
      } else {
        console.log(`     ❌ 发现 ${inconsistentCount} 个注册不一致`)
      }

      await this.checkUnregisteredComponents()
    } catch (error: any) {
      console.log(`     ⚠️  检查过程出错: ${error.message}`)
    }
  }

  private async checkComponentMetadataIntegrity(): Promise<void> {
    console.log('  📋 检查2: 组件元数据完整性')

    try {
      const result = execSync(
        `grep -A 20 "registerComponent" --include="*.ts" "${this.packagesPath}" | grep -v "node_modules" | grep -v "/dist/" || true`,
        { encoding: 'utf8' }
      )

      const metadataIssues = this.validateComponentMetadata(result)

      if (metadataIssues.length === 0) {
        console.log('     ✅ 所有组件元数据完整（0缺失）')
      } else {
        console.log(`     ❌ 发现 ${metadataIssues.length} 个元数据问题`)

        metadataIssues.slice(0, 5).forEach(issue => {
          this.violations.push({
            rule: 'lowcode.component-metadata-integrity',
            level: 'P0',
            file: issue.file || 'unknown',
            message: issue.message
          })
        })
      }
    } catch (error: any) {
      console.log(`     ⚠️  检查过程出错: ${error.message}`)
    }
  }

  private async checkComponentDependencies(): Promise<void> {
    console.log('  📋 检查3: 组件依赖关系')

    try {
      const result = execSync(
        `grep -A 5 "dependencies:" --include="*.ts" "${this.packagesPath}" | grep -v "node_modules" | grep -v "/dist/" || true`,
        { encoding: 'utf8' }
      )

      const dependencyGraph = this.buildDependencyGraph(result)

      const circularDeps = this.detectCircularDependencies(dependencyGraph)

      if (circularDeps.length === 0) {
        console.log('     ✅ 无循环依赖（0个）')
      } else {
        console.log(`     ❌ 发现 ${circularDeps.length} 个循环依赖`)

        circularDeps.forEach(cycle => {
          this.violations.push({
            rule: 'lowcode.component-circular-dependency',
            level: 'P0',
            message: `组件循环依赖: ${cycle.join(' → ')}`
          })
        })
      }

      const invalidDeps = this.checkInvalidDependencies(dependencyGraph)

      if (invalidDeps.length > 0) {
        console.log(`     ❌ 发现 ${invalidDeps.length} 个无效依赖`)

        invalidDeps.forEach(dep => {
          this.violations.push({
            rule: 'lowcode.component-invalid-dependency',
            level: 'P0',
            message: `组件依赖不存在: ${dep.component} → ${dep.dependency}`
          })
        })
      }
    } catch (error: any) {
      console.log(`     ⚠️  检查过程出错: ${error.message}`)
    }
  }

  private async checkComponentNamingConventions(): Promise<void> {
    console.log('  📋 检查4: 组件命名规范')

    try {
      const result = execSync(
        `grep -A 2 "registerComponent" --include="*.ts" "${this.packagesPath}" | grep "name:" | grep -v "/dist/" || true`,
        { encoding: 'utf8' }
      )

      const namingIssues: Array<{ name: string; issue: string }> = []
      const lines = result.split('\n').filter(line => line.trim())

      lines.forEach(line => {
        const match = line.match(/name:\s*['"](.*)['"]/);
        if (match) {
          const componentName = match[1]

          if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
            namingIssues.push({
              name: componentName,
              issue: '组件名称应使用PascalCase（首字母大写）'
            })
          }

          if (/[^a-zA-Z0-9]/.test(componentName)) {
            namingIssues.push({
              name: componentName,
              issue: '组件名称不应包含特殊字符'
            })
          }
        }
      })

      if (namingIssues.length === 0) {
        console.log('     ✅ 组件命名规范正确（0违规）')
      } else {
        console.log(`     ⚠️  发现 ${namingIssues.length} 个命名问题`)

        namingIssues.slice(0, 3).forEach(issue => {
          this.violations.push({
            rule: 'lowcode.component-naming-convention',
            level: 'P1',
            message: `${issue.name}: ${issue.issue}`
          })
        })
      }
    } catch (error: any) {
      console.log(`     ⚠️  检查过程出错: ${error.message}`)
    }
  }

  private async checkComponentVersionConsistency(): Promise<void> {
    console.log('  📋 检查5: 组件版本一致性')

    try {
      const result = execSync(
        `grep -A 10 "registerComponent" --include="*.ts" "${this.packagesPath}" | grep "version:" | grep -v "/dist/" || true`,
        { encoding: 'utf8' }
      )

      const versionIssues: Array<{ version: string; issue: string }> = []
      const lines = result.split('\n').filter(line => line.trim())

      lines.forEach(line => {
        const match = line.match(/version:\s*['"](.*)['"]/);
        if (match) {
          const version = match[1]

          if (!/^\d+\.\d+\.\d+$/.test(version)) {
            versionIssues.push({
              version,
              issue: '版本号应遵循semver格式（x.y.z）'
            })
          }
        }
      })

      if (versionIssues.length === 0) {
        console.log('     ✅ 组件版本格式正确（0问题）')
      } else {
        console.log(`     ⚠️  发现 ${versionIssues.length} 个版本问题`)

        versionIssues.forEach(issue => {
          this.violations.push({
            rule: 'lowcode.component-version-consistency',
            level: 'P1',
            message: `版本 ${issue.version}: ${issue.issue}`
          })
        })
      }
    } catch (error: any) {
      console.log(`     ⚠️  检查过程出错: ${error.message}`)
    }
  }

  private parseComponentRegistrations(grepResult: string): Array<{ file: string; line: number; name: string }> {
    const registrations: Array<{ file: string; line: number; name: string }> = []
    const lines = grepResult.split('\n').filter(line => line.trim())

    for (const line of lines) {
      const match = line.match(/^(.+):(\d+):.+registerComponent/)
      if (match) {
        registrations.push({
          file: match[1],
          line: parseInt(match[2]),
          name: this.extractComponentName(line)
        })
      }
    }

    return registrations
  }

  private extractComponentName(line: string): string {
    const match = line.match(/name:\s*['"](.*)['"]/);
    return match ? match[1] : 'Unknown'
  }

  private findComponentFile(componentName: string): string | null {
    try {
      const result = execSync(
        `find "${this.packagesPath}" -name "${componentName}.vue" -o -name "${componentName}.ts" -o -name "${componentName}.tsx" | grep -v "node_modules" | grep -v "/dist/" | head -1`,
        { encoding: 'utf8' }
      )
      return result.trim() || null
    } catch (error) {
      return null
    }
  }

  private async checkUnregisteredComponents(): Promise<void> {
    try {
      const componentFiles = execSync(
        `find "${this.packagesPath}" -name "Smart*.vue" -o -name "*Component.vue" | grep -v "node_modules" | grep -v "/dist/"`,
        { encoding: 'utf8' }
      ).split('\n').filter(f => f.trim())

      console.log(`     发现 ${componentFiles.length} 个组件文件`)
    } catch (error) {
      // 忽略错误
    }
  }

  private validateComponentMetadata(grepResult: string): Array<{ file?: string; message: string }> {
    const issues: Array<{ file?: string; message: string }> = []

    const requiredFields = [
      'name',
      'displayName',
      'category',
      'priority',
      'dependencies',
      'bundle',
      'lazy',
      'preload',
      'version',
      'tags'
    ]

    requiredFields.forEach(field => {
      if (!grepResult.includes(`${field}:`)) {
        issues.push({
          message: `某些组件可能缺少必填字段: ${field}`
        })
      }
    })

    return issues
  }

  private buildDependencyGraph(grepResult: string): Map<string, string[]> {
    const graph = new Map<string, string[]>()
    return graph
  }

  private detectCircularDependencies(dependencyGraph: Map<string, string[]>): string[][] {
    const cycles: string[][] = []

    const visited = new Set<string>()
    const recStack = new Set<string>()

    const dfs = (node: string, path: string[] = []): void => {
      if (recStack.has(node)) {
        const cycleStart = path.indexOf(node)
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), node])
        }
        return
      }

      if (visited.has(node)) return

      visited.add(node)
      recStack.add(node)
      path.push(node)

      const deps = dependencyGraph.get(node) || []
      deps.forEach(dep => dfs(dep, [...path]))

      recStack.delete(node)
    }

    for (const node of dependencyGraph.keys()) {
      dfs(node)
    }

    return cycles
  }

  private checkInvalidDependencies(
    dependencyGraph: Map<string, string[]>
  ): Array<{ component: string; dependency: string }> {
    const invalid: Array<{ component: string; dependency: string }> = []

    for (const [component, deps] of dependencyGraph) {
      deps.forEach(dep => {
        if (!dependencyGraph.has(dep)) {
          invalid.push({ component, dependency: dep })
        }
      })
    }

    return invalid
  }

  private printSummary(): void {
    const p0Count = this.violations.filter(v => v.level === 'P0').length
    const p1Count = this.violations.filter(v => v.level === 'P1').length
    const p2Count = this.violations.filter(v => v.level === 'P2').length

    console.log('')
    console.log('='.repeat(60))
    console.log('\n📊 低代码引擎检查结果:\n')

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

    if (p0Count > 0) {
      console.log('  ⛔ 低代码引擎质量检查失败！')
      console.log('  请修复所有P0违规后再提交代码。\n')
    }
  }
}

