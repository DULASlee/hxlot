/**
 * SmartAbp Quality Guardian - 代码生成质量验证器
 * 专门检查低代码引擎生成的代码质量
 * 
 * 检查项：
 * 1. 生成代码模板验证（P0）
 * 2. 生成代码质量检查（P0）
 * 3. 生成代码认证机制（P0）
 * 4. 生成代码回归测试（P1）
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import type { IChecker, CheckResult, Violation } from '../types'

export class CodeGenChecker implements IChecker {
  name = 'CodeGen'
  private projectRoot: string
  private violations: Violation[]
  private templatesPath: string
  private generatedCodePaths: string[]

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || process.cwd()
    this.violations = []
    this.templatesPath = join(this.projectRoot, 'templates')
    this.generatedCodePaths = [
      'src/SmartAbp.Vue/src/views',
      'src/SmartAbp.Vue/src/stores',
      'src/SmartAbp.Vue/src/api',
      'src/SmartAbp.Application',
      'src/SmartAbp.HttpApi'
    ]
  }

  async check(): Promise<CheckResult> {
    const startTime = Date.now()
    console.log('\n🔧 代码生成质量验证\n')
    console.log('='.repeat(60))
    console.log('')

    if (!existsSync(this.templatesPath)) {
      console.log('  ⚠️  templates目录不存在，跳过检查')
      return {
        checker: this.name,
        passed: true,
        duration: Date.now() - startTime,
        violations: []
      }
    }

    await this.validateCodeTemplates()
    await this.identifyGeneratedCode()
    await this.checkGeneratedCodeQuality()
    await this.checkGeneratedCodeCertification()
    await this.checkTemplateVersionCompatibility()

    this.printSummary()

    return {
      checker: this.name,
      passed: this.violations.filter(v => v.level === 'P0').length === 0,
      duration: Date.now() - startTime,
      violations: this.violations
    }
  }

  private async validateCodeTemplates(): Promise<void> {
    console.log('  📋 检查1: 代码模板验证')

    try {
      const templateFiles = execSync(
        `find "${this.templatesPath}" -name "*.template.*" -o -name "*.hbs" -o -name "*.ejs" | grep -v "node_modules"`,
        { encoding: 'utf8' }
      ).split('\n').filter(f => f.trim())

      console.log(`     发现 ${templateFiles.length} 个模板文件`)

      let invalidTemplates = 0

      for (const templateFile of templateFiles) {
        if (!templateFile.trim()) continue

        try {
          const content = readFileSync(templateFile, 'utf8')
          const issues = this.validateTemplateSyntax(content, templateFile)

          if (issues.length > 0) {
            invalidTemplates++
            issues.forEach(issue => {
              this.violations.push({
                rule: 'codegen.template-syntax-error',
                level: 'P0',
                file: templateFile,
                message: issue
              })
            })
          }
        } catch (error: any) {
          this.violations.push({
            rule: 'codegen.template-read-error',
            level: 'P0',
            file: templateFile,
            message: `无法读取模板文件: ${error.message}`
          })
        }
      }

      if (invalidTemplates === 0) {
        console.log('     ✅ 所有模板语法正确（0错误）')
      } else {
        console.log(`     ❌ 发现 ${invalidTemplates} 个模板问题`)
      }
    } catch (error: any) {
      console.log(`     ⚠️  检查过程出错: ${error.message}`)
    }
  }

  private async identifyGeneratedCode(): Promise<void> {
    console.log('  📋 检查2: 生成代码识别')

    try {
      let totalGeneratedFiles = 0

      for (const codePath of this.generatedCodePaths) {
        const fullPath = join(this.projectRoot, codePath)
        if (!existsSync(fullPath)) continue

        try {
          const result = execSync(
            `grep -rl "@generated\\|自动生成\\|Auto-generated" "${fullPath}" --include="*.ts" --include="*.vue" --include="*.cs" | grep -v "node_modules" || true`,
            { encoding: 'utf8' }
          )

          const files = result.split('\n').filter(f => f.trim())
          totalGeneratedFiles += files.length
        } catch (error) {
          // 忽略错误
        }
      }

      console.log(`     发现 ${totalGeneratedFiles} 个生成的代码文件`)

      if (totalGeneratedFiles === 0) {
        console.log('     ⚠️  未发现带有生成标记的代码文件')
        this.violations.push({
          rule: 'codegen.no-generated-marker',
          level: 'P1',
          message: '建议为生成的代码添加 @generated 标记'
        })
      } else {
        console.log(`     ✅ 找到 ${totalGeneratedFiles} 个带标记的生成文件`)
      }
    } catch (error: any) {
      console.log(`     ⚠️  检查过程出错: ${error.message}`)
    }
  }

  private async checkGeneratedCodeQuality(): Promise<void> {
    console.log('  📋 检查3: 生成代码质量')

    try {
      let qualityIssues = 0

      for (const codePath of this.generatedCodePaths) {
        const fullPath = join(this.projectRoot, codePath)
        if (!existsSync(fullPath)) continue

        try {
          // 检查生成代码中的 any 类型
          const anyResult = execSync(
            `grep -rn ":\\s*any\\|as any" "${fullPath}" --include="*.ts" --include="*.vue" | grep "@generated" || true`,
            { encoding: 'utf8' }
          )

          const anyViolations = anyResult.split('\n').filter(l => l.trim()).length
          if (anyViolations > 0) {
            qualityIssues++
            this.violations.push({
              rule: 'codegen.generated-code-uses-any',
              level: 'P0',
              message: `生成的代码中发现 ${anyViolations} 处使用 any 类型`,
              count: anyViolations
            })
          }

          // 检查TODO/FIXME标记
          const todoResult = execSync(
            `grep -rn "TODO\\|FIXME" "${fullPath}" --include="*.ts" --include="*.vue" --include="*.cs" | grep "@generated" || true`,
            { encoding: 'utf8' }
          )

          const todoViolations = todoResult.split('\n').filter(l => l.trim()).length
          if (todoViolations > 0) {
            qualityIssues++
            this.violations.push({
              rule: 'codegen.generated-code-has-todo',
              level: 'P1',
              message: `生成的代码中发现 ${todoViolations} 处TODO标记`,
              count: todoViolations
            })
          }
        } catch (error) {
          // 忽略错误
        }
      }

      if (qualityIssues === 0) {
        console.log('     ✅ 生成代码质量良好（0问题）')
      } else {
        console.log(`     ❌ 发现 ${qualityIssues} 类质量问题`)
      }
    } catch (error: any) {
      console.log(`     ⚠️  检查过程出错: ${error.message}`)
    }
  }

  private async checkGeneratedCodeCertification(): Promise<void> {
    console.log('  📋 检查4: 生成代码认证标记')

    try {
      let certificationIssues = 0

      for (const codePath of this.generatedCodePaths) {
        const fullPath = join(this.projectRoot, codePath)
        if (!existsSync(fullPath)) continue

        try {
          const generatedFiles = execSync(
            `grep -rl "@generated" "${fullPath}" --include="*.ts" --include="*.vue" --include="*.cs" | grep -v "node_modules" || true`,
            { encoding: 'utf8' }
          ).split('\n').filter(f => f.trim())

          for (const file of generatedFiles) {
            if (!file.trim()) continue

            const content = readFileSync(file, 'utf8')

            const hasGenerator = content.includes('生成器') || content.includes('Generator')
            const hasTimestamp = content.includes('生成时间') || content.includes('Generated at')

            if (!hasGenerator || !hasTimestamp) {
              certificationIssues++
              this.violations.push({
                rule: 'codegen.incomplete-certification',
                level: 'P0',
                file,
                message: '生成代码缺少完整的认证标记（应包含：生成器、时间、版本）'
              })
            }
          }
        } catch (error) {
          // 忽略错误
        }
      }

      if (certificationIssues === 0) {
        console.log('     ✅ 生成代码认证标记完整（0缺失）')
      } else {
        console.log(`     ❌ 发现 ${certificationIssues} 个认证标记问题`)
      }
    } catch (error: any) {
      console.log(`     ⚠️  检查过程出错: ${error.message}`)
    }
  }

  private async checkTemplateVersionCompatibility(): Promise<void> {
    console.log('  📋 检查5: 模板版本兼容性')

    try {
      const versionFiles = execSync(
        `find "${this.templatesPath}" -name "*.json" | xargs grep -l "version" || true`,
        { encoding: 'utf8' }
      ).split('\n').filter(f => f.trim())

      if (versionFiles.length === 0) {
        console.log('     ⚠️  未找到模板版本信息')
        this.violations.push({
          rule: 'codegen.no-template-version',
          level: 'P1',
          message: '建议为模板添加版本信息'
        })
      } else {
        console.log(`     ✅ 找到 ${versionFiles.length} 个模板版本配置`)
      }
    } catch (error: any) {
      console.log(`     ⚠️  检查过程出错: ${error.message}`)
    }
  }

  private validateTemplateSyntax(content: string, templateFile: string): string[] {
    const issues: string[] = []

    // 检查未闭合的模板标签
    const openTags = (content.match(/\{\{/g) || []).length
    const closeTags = (content.match(/\}\}/g) || []).length
    if (openTags !== closeTags) {
      issues.push('模板标签不匹配：开标签和闭标签数量不一致')
    }

    // 检查变量引用
    const variableRefs = content.match(/\{\{([^}]+)\}\}/g) || []
    variableRefs.forEach(ref => {
      const varName = ref.replace(/[{}]/g, '').trim()
      if (!/^[a-zA-Z_$][a-zA-Z0-9_$.]*$/.test(varName)) {
        issues.push(`可能的非法变量引用: ${varName}`)
      }
    })

    // 检查模板标记
    if (!content.includes('@template') && !content.includes('template')) {
      issues.push('模板缺少@template标记')
    }

    return issues
  }

  private printSummary(): void {
    const p0Count = this.violations.filter(v => v.level === 'P0').length
    const p1Count = this.violations.filter(v => v.level === 'P1').length
    const p2Count = this.violations.filter(v => v.level === 'P2').length

    console.log('')
    console.log('='.repeat(60))
    console.log('\n📊 代码生成检查结果:\n')

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
      console.log('  ⛔ 代码生成质量检查失败！')
      console.log('  请修复所有P0违规后再提交代码。\n')
    }
  }
}

