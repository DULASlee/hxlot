/**
 * SmartAbp Quality Guardian - 性能质量检查器
 * 检查代码性能问题和性能优化机会
 * 
 * 检查项：
 * 1. 组件加载性能检查（P1）
 * 2. 代码包大小分析（P1）
 * 3. 大文件检测（P1）
 * 4. 复杂函数检测（P1）
 * 5. 性能优化建议（P2）
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import type { IChecker, CheckResult, Violation } from '../types'

export class PerformanceChecker implements IChecker {
  name = 'Performance'
  private projectRoot: string
  private violations: Violation[]
  private config: {
    maxFileSize: number
    maxFunctionLines: number
    maxBundleSize: number
    maxComponentSize: number
  }
  private frontendPaths: string[]

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || process.cwd()
    this.violations = []
    this.config = {
      maxFileSize: 500,
      maxFunctionLines: 100,
      maxBundleSize: 500,
      maxComponentSize: 300
    }
    this.frontendPaths = ['src/SmartAbp.Vue/src', 'src/SmartAbp.Vue/packages']
  }

  async check(): Promise<CheckResult> {
    const startTime = Date.now()
    console.log('\n⚡ 性能质量检查\n')
    console.log('='.repeat(60))
    console.log('')

    await this.checkLargeFiles()
    await this.checkComplexFunctions()
    await this.checkComponentSize()
    await this.checkBundleSize()
    await this.checkLazyLoading()

    this.printSummary()

    return {
      checker: this.name,
      passed: this.violations.filter(v => v.level === 'P0').length === 0,
      duration: Date.now() - startTime,
      violations: this.violations
    }
  }

  private async checkLargeFiles(): Promise<void> {
    console.log('  📋 检查1: 大文件检测')

    try {
      let largeFileCount = 0

      for (const frontendPath of this.frontendPaths) {
        const fullPath = join(this.projectRoot, frontendPath)
        if (!existsSync(fullPath)) continue

        const result = execSync(
          `find "${fullPath}" -name "*.ts" -o -name "*.vue" | grep -v "node_modules" | grep -v "/dist/" | xargs wc -l | sort -rn | head -20`,
          { encoding: 'utf8' }
        )

        const lines = result.split('\n').filter(l => l.trim())

        for (const line of lines) {
          const match = line.trim().match(/^\s*(\d+)\s+(.+)$/)
          if (match) {
            const lineCount = parseInt(match[1])
            const filePath = match[2]

            if (lineCount > this.config.maxFileSize && !filePath.includes('total')) {
              largeFileCount++

              const level = lineCount > 1000 ? 'P1' : 'P2'
              this.violations.push({
                rule: 'performance.large-file',
                level: level as any,
                file: filePath,
                message: `文件过大: ${lineCount}行 (建议<${this.config.maxFileSize}行)`,
                lineCount
              })
            }
          }
        }
      }

      if (largeFileCount === 0) {
        console.log('     ✅ 无大文件（0个超过500行）')
      } else {
        console.log(`     ⚠️  发现 ${largeFileCount} 个大文件`)
      }
    } catch (error: any) {
      console.log(`     ⚠️  检查过程出错: ${error.message}`)
    }
  }

  private async checkComplexFunctions(): Promise<void> {
    console.log('  📋 检查2: 复杂函数检测')

    try {
      let complexFunctionCount = 0

      for (const frontendPath of this.frontendPaths) {
        const fullPath = join(this.projectRoot, frontendPath)
        if (!existsSync(fullPath)) continue

        const files = execSync(
          `find "${fullPath}" -name "*.ts" -o -name "*.vue" | grep -v "node_modules" | grep -v "/dist/"`,
          { encoding: 'utf8' }
        )
          .split('\n')
          .filter(f => f.trim())

        for (const file of files.slice(0, 50)) {
          if (!file.trim()) continue

          try {
            const content = readFileSync(file, 'utf8')
            const functions = this.extractFunctions(content)

            for (const func of functions) {
              if (func.lines > this.config.maxFunctionLines) {
                complexFunctionCount++

                const level = func.lines > 200 ? 'P1' : 'P2'
                this.violations.push({
                  rule: 'performance.complex-function',
                  level: level as any,
                  file,
                  message: `函数过长: ${func.name} (${func.lines}行，建议<${this.config.maxFunctionLines}行)`,
                  functionName: func.name,
                  lineCount: func.lines
                })
              }
            }
          } catch (error) {
            // 忽略读取错误
          }
        }
      }

      if (complexFunctionCount === 0) {
        console.log('     ✅ 无复杂函数（0个超过100行）')
      } else {
        console.log(`     ⚠️  发现 ${complexFunctionCount} 个复杂函数`)
      }
    } catch (error: any) {
      console.log(`     ⚠️  检查过程出错: ${error.message}`)
    }
  }

  private async checkComponentSize(): Promise<void> {
    console.log('  📋 检查3: 组件大小检查')

    try {
      let largeComponentCount = 0

      for (const frontendPath of this.frontendPaths) {
        const fullPath = join(this.projectRoot, frontendPath)
        if (!existsSync(fullPath)) continue

        const result = execSync(
          `find "${fullPath}" -name "*.vue" | grep -v "node_modules" | grep -v "/dist/" | xargs wc -l | sort -rn | head -15`,
          { encoding: 'utf8' }
        )

        const lines = result.split('\n').filter(l => l.trim())

        for (const line of lines) {
          const match = line.trim().match(/^\s*(\d+)\s+(.+)$/)
          if (match) {
            const lineCount = parseInt(match[1])
            const filePath = match[2]

            if (lineCount > this.config.maxComponentSize && !filePath.includes('total')) {
              largeComponentCount++

              this.violations.push({
                rule: 'performance.large-component',
                level: 'P2',
                file: filePath,
                message: `组件过大: ${lineCount}行 (建议<${this.config.maxComponentSize}行，考虑拆分)`,
                lineCount
              })
            }
          }
        }
      }

      if (largeComponentCount === 0) {
        console.log('     ✅ 组件大小合理（0个超过300行）')
      } else {
        console.log(`     ⚠️  发现 ${largeComponentCount} 个大组件（建议拆分）`)
      }
    } catch (error: any) {
      console.log(`     ⚠️  检查过程出错: ${error.message}`)
    }
  }

  private async checkBundleSize(): Promise<void> {
    console.log('  📋 检查4: Bundle大小分析')

    try {
      const distPath = join(this.projectRoot, 'src/SmartAbp.Vue/dist')

      if (!existsSync(distPath)) {
        console.log('     ℹ️  未找到dist目录，跳过检查')
        return
      }

      const result = execSync(
        `find "${distPath}" -name "*.js" -type f -exec du -k {} + | sort -rn | head -10`,
        { encoding: 'utf8' }
      )

      const lines = result.split('\n').filter(l => l.trim())
      let largeBundleCount = 0

      for (const line of lines) {
        const match = line.trim().match(/^(\d+)\s+(.+)$/)
        if (match) {
          const sizeKB = parseInt(match[1])
          const filePath = match[2]

          if (sizeKB > this.config.maxBundleSize) {
            largeBundleCount++

            this.violations.push({
              rule: 'performance.large-bundle',
              level: 'P1',
              file: filePath,
              message: `Bundle过大: ${sizeKB}KB (建议<${this.config.maxBundleSize}KB，考虑代码分割)`,
              sizeKB
            })
          }
        }
      }

      if (largeBundleCount === 0) {
        console.log('     ✅ Bundle大小合理')
      } else {
        console.log(`     ⚠️  发现 ${largeBundleCount} 个大Bundle`)
      }
    } catch (error) {
      console.log('     ℹ️  未找到dist目录，跳过检查')
    }
  }

  private async checkLazyLoading(): Promise<void> {
    console.log('  📋 检查5: 懒加载检查')

    try {
      const routerPath = join(this.projectRoot, 'src/SmartAbp.Vue/src/router')

      if (!existsSync(routerPath)) {
        console.log('     ℹ️  未找到router目录，跳过检查')
        return
      }

      const routeFiles = execSync(`find "${routerPath}" -name "*.ts" | grep -v "node_modules"`, {
        encoding: 'utf8'
      })
        .split('\n')
        .filter(f => f.trim())

      let noLazyLoadCount = 0

      for (const file of routeFiles) {
        if (!file.trim()) continue

        const content = readFileSync(file, 'utf8')

        const hasLazyLoad = content.includes('() => import(') || content.includes('import(')
        const hasDirectImport = content.match(/import\s+\w+\s+from\s+['"].*\.vue['"]/)

        if (hasDirectImport && !hasLazyLoad) {
          noLazyLoadCount++

          this.violations.push({
            rule: 'performance.no-lazy-loading',
            level: 'P2',
            file,
            message: '路由未使用懒加载（建议使用 () => import() 语法）'
          })
        }
      }

      if (noLazyLoadCount === 0) {
        console.log('     ✅ 路由已使用懒加载')
      } else {
        console.log(`     ⚠️  发现 ${noLazyLoadCount} 个路由未懒加载`)
      }
    } catch (error) {
      console.log('     ℹ️  未找到router目录，跳过检查')
    }
  }

  private extractFunctions(content: string): Array<{ name: string; lines: number; start: number }> {
    const functions: Array<{ name: string; lines: number; start: number }> = []
    const lines = content.split('\n')
    let inFunction = false
    let functionStart = 0
    let functionName = 'anonymous'
    let braceCount = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (!inFunction) {
        const funcMatch = line.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=.*(?:function|=>)|async\s+(\w+))/)
        if (funcMatch) {
          inFunction = true
          functionStart = i
          functionName = funcMatch[1] || funcMatch[2] || funcMatch[3] || 'anonymous'
          braceCount = 0
        }
      }

      if (inFunction) {
        braceCount += (line.match(/{/g) || []).length
        braceCount -= (line.match(/}/g) || []).length

        if (braceCount === 0 && line.includes('}')) {
          const functionLines = i - functionStart + 1
          functions.push({
            name: functionName,
            lines: functionLines,
            start: functionStart
          })
          inFunction = false
        }
      }
    }

    return functions
  }

  private printSummary(): void {
    const p0Count = this.violations.filter(v => v.level === 'P0').length
    const p1Count = this.violations.filter(v => v.level === 'P1').length
    const p2Count = this.violations.filter(v => v.level === 'P2').length

    console.log('')
    console.log('='.repeat(60))
    console.log('\n📊 性能检查结果:\n')

    if (p0Count === 0 && p1Count === 0) {
      console.log('  ✅ 性能检查通过！')
    } else {
      console.log(`  ⚠️  发现 ${p0Count + p1Count + p2Count} 个性能问题`)
    }

    if (p0Count > 0) {
      console.log(`  ❌ P0违规: ${p0Count}个`)
    }
    if (p1Count > 0) {
      console.log(`  ⚠️  P1警告: ${p1Count}个`)
    }
    if (p2Count > 0) {
      console.log(`  ℹ️  P2建议: ${p2Count}个`)
    }

    console.log(`\n  总问题数: ${p0Count + p1Count + p2Count}`)
    console.log('')

    if (p1Count > 0) {
      console.log('  💡 性能优化建议:')
      console.log('     • 拆分大文件和大组件')
      console.log('     • 使用代码分割减小Bundle')
      console.log('     • 重构复杂函数\n')
    }
  }
}
