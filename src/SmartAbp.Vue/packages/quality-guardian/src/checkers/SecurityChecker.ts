/**
 * SmartAbp Quality Guardian - 安全质量检查器
 * 
 * 检查项：
 * 1. XSS漏洞检测（P1）
 * 2. SQL注入检测（P1）
 * 3. 敏感信息泄漏检测（P1）
 * 4. CSRF防护检查（P2）
 * 5. 不安全的代码模式（P1）
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import type { IChecker, CheckResult, Violation } from '../types'

export class SecurityChecker implements IChecker {
  name = 'Security'
  private projectRoot: string
  private violations: Map<string, Violation[]>
  private frontendPaths: string[]
  private backendPaths: string[]

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || process.cwd()
    this.violations = new Map([
      ['P0', []],
      ['P1', []],
      ['P2', []],
      ['WARNING', []]
    ])

    this.frontendPaths = [
      'src/SmartAbp.Vue/src',
      'src/SmartAbp.Vue/packages'
    ]

    this.backendPaths = [
      'src/SmartAbp.Application',
      'src/SmartAbp.HttpApi'
    ]
  }

  async check(): Promise<CheckResult> {
    const startTime = Date.now()
    console.log('\n🛡️  安全质量检查\n')
    console.log('='.repeat(60))
    console.log('')

    await this.checkXSSVulnerabilities()
    await this.checkSQLInjection()
    await this.checkSensitiveDataLeaks()
    await this.checkCSRFProtection()
    await this.checkUnsafePatterns()

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
        P2: (this.violations.get('P2') || []).length
      }
    }
  }

  /**
   * 检查1: XSS漏洞检测
   */
  private async checkXSSVulnerabilities(): Promise<void> {
    console.log('  📋 检查1: XSS漏洞检测')

    try {
      let xssIssueCount = 0

      for (const frontendPath of this.frontendPaths) {
        const fullPath = join(this.projectRoot, frontendPath)
        if (!existsSync(fullPath)) continue

        // 检查innerHTML使用
        const innerHTMLResult = execSync(
          `grep -rn "innerHTML\\s*=" --include="*.ts" --include="*.vue" "${fullPath}" | grep -v "node_modules" | grep -v "/dist/" || true`,
          { encoding: 'utf8' }
        )

        const innerHTMLLines = innerHTMLResult.split('\n').filter(l => l.trim())
        if (innerHTMLLines.length > 0) {
          xssIssueCount++
          this.violations.get('P1')!.push({
            rule: 'security.xss-innerhtml',
            level: 'P1',
            file: frontendPath,
            message: `发现 ${innerHTMLLines.length} 处使用innerHTML（可能导致XSS，建议使用textContent）`,
            snippet: innerHTMLLines.slice(0, 3).join('\n')
          })
        }

        // 检查v-html使用
        const vHtmlResult = execSync(
          `grep -rn "v-html" --include="*.vue" "${fullPath}" | grep -v "node_modules" | grep -v "/dist/" || true`,
          { encoding: 'utf8' }
        )

        const vHtmlLines = vHtmlResult.split('\n').filter(l => l.trim())
        if (vHtmlLines.length > 0) {
          xssIssueCount++
          this.violations.get('P1')!.push({
            rule: 'security.xss-v-html',
            level: 'P1',
            file: frontendPath,
            message: `发现 ${vHtmlLines.length} 处使用v-html（可能导致XSS，确保数据已消毒）`,
            snippet: vHtmlLines.slice(0, 3).join('\n')
          })
        }

        // 检查dangerouslySetInnerHTML（React模式）
        const dangerousResult = execSync(
          `grep -rn "dangerouslySetInnerHTML" --include="*.tsx" --include="*.jsx" "${fullPath}" | grep -v "node_modules" || true`,
          { encoding: 'utf8' }
        )

        const dangerousLines = dangerousResult.split('\n').filter(l => l.trim())
        if (dangerousLines.length > 0) {
          xssIssueCount++
          this.violations.get('P1')!.push({
            rule: 'security.xss-dangerous-html',
            level: 'P1',
            file: frontendPath,
            message: `发现 ${dangerousLines.length} 处使用dangerouslySetInnerHTML`
          })
        }
      }

      if (xssIssueCount === 0) {
        console.log('     ✅ 无XSS风险代码')
      } else {
        console.log(`     ⚠️  发现 ${xssIssueCount} 类XSS风险`)
      }
    } catch (error: any) {
      console.log(`     ⚠️  检查过程出错: ${error.message}`)
    }
  }

  /**
   * 检查2: SQL注入检测
   */
  private async checkSQLInjection(): Promise<void> {
    console.log('  📋 检查2: SQL注入检测')

    try {
      let sqlInjectionCount = 0

      for (const backendPath of this.backendPaths) {
        const fullPath = join(this.projectRoot, backendPath)
        if (!existsSync(fullPath)) continue

        // 检查字符串拼接SQL
        const sqlConcatResult = execSync(
          `grep -rn "\\$\\".*SELECT\\|SELECT.*\\+.*\\$\\"" --include="*.cs" "${fullPath}" | grep -v "node_modules" || true`,
          { encoding: 'utf8' }
        )

        const sqlConcatLines = sqlConcatResult.split('\n').filter(l => l.trim())
        if (sqlConcatLines.length > 0) {
          sqlInjectionCount++
          this.violations.get('P1')!.push({
            rule: 'security.sql-injection',
            level: 'P1',
            file: backendPath,
            message: `发现 ${sqlConcatLines.length} 处SQL字符串拼接（可能导致注入，使用参数化查询）`,
            snippet: sqlConcatLines.slice(0, 3).join('\n')
          })
        }

        // 检查FromSqlRaw使用
        const rawSqlResult = execSync(
          `grep -rn "FromSqlRaw\\|ExecuteSqlRaw" --include="*.cs" "${fullPath}" | grep -v "node_modules" || true`,
          { encoding: 'utf8' }
        )

        const rawSqlLines = rawSqlResult.split('\n').filter(l => l.trim())
        if (rawSqlLines.length > 0) {
          this.violations.get('P2')!.push({
            rule: 'security.raw-sql',
            level: 'P2',
            file: backendPath,
            message: `发现 ${rawSqlLines.length} 处使用原始SQL（确保使用参数化）`
          })
        }
      }

      if (sqlInjectionCount === 0) {
        console.log('     ✅ 无SQL注入风险')
      } else {
        console.log(`     ⚠️  发现 ${sqlInjectionCount} 个SQL注入风险`)
      }
    } catch (error: any) {
      console.log(`     ⚠️  检查过程出错: ${error.message}`)
    }
  }

  /**
   * 检查3: 敏感信息泄漏检测
   */
  private async checkSensitiveDataLeaks(): Promise<void> {
    console.log('  📋 检查3: 敏感信息泄漏检测')

    try {
      let sensitiveDataCount = 0
      const allPaths = [...this.frontendPaths, ...this.backendPaths]

      for (const codePath of allPaths) {
        const fullPath = join(this.projectRoot, codePath)
        if (!existsSync(fullPath)) continue

        // 检查硬编码密码
        const passwordResult = execSync(
          `grep -rni "password.*=.*['"]\\|apikey.*=.*['"]\\|secret.*=.*['"]" --include="*.ts" --include="*.cs" --include="*.vue" "${fullPath}" | grep -v "node_modules" | grep -v "/dist/" | grep -v "password.*=.*process.env" | grep -v "Password.*Type" | grep -v "// password" || true`,
          { encoding: 'utf8' }
        )

        const passwordLines = passwordResult
          .split('\n')
          .filter(l => l.trim() && !l.includes('PasswordType') && !l.includes('PasswordHash'))

        if (passwordLines.length > 0) {
          sensitiveDataCount++
          this.violations.get('P1')!.push({
            rule: 'security.hardcoded-credentials',
            level: 'P1',
            file: codePath,
            message: `发现 ${passwordLines.length} 处可能的硬编码密钥（应使用环境变量）`,
            snippet: passwordLines.slice(0, 3).map(l => l.substring(0, 100)).join('\n')
          })
        }

        // 检查JWT密钥
        const jwtResult = execSync(
          `grep -rni "jwt.*secret\\|signing.*key" --include="*.ts" --include="*.cs" "${fullPath}" | grep -v "node_modules" | grep -v "/dist/" | grep -v "from.*environment" || true`,
          { encoding: 'utf8' }
        )

        const jwtLines = jwtResult.split('\n').filter(l => l.trim())
        if (jwtLines.length > 0) {
          this.violations.get('P2')!.push({
            rule: 'security.jwt-key-usage',
            level: 'P2',
            file: codePath,
            message: `发现 ${jwtLines.length} 处JWT密钥使用（确保从环境变量读取）`
          })
        }
      }

      if (sensitiveDataCount === 0) {
        console.log('     ✅ 无敏感信息泄漏')
      } else {
        console.log(`     ⚠️  发现 ${sensitiveDataCount} 处敏感信息风险`)
      }
    } catch (error: any) {
      console.log(`     ⚠️  检查过程出错: ${error.message}`)
    }
  }

  /**
   * 检查4: CSRF防护检查
   */
  private async checkCSRFProtection(): Promise<void> {
    console.log('  📋 检查4: CSRF防护检查')

    try {
      const startupPath = join(this.projectRoot, 'src/SmartAbp.Web/Startup.cs')

      if (existsSync(startupPath)) {
        const content = readFileSync(startupPath, 'utf8')
        const hasAntiforgery = content.includes('AddAntiforgery') || content.includes('ValidateAntiForgeryToken')

        if (!hasAntiforgery) {
          this.violations.get('P2')!.push({
            rule: 'security.no-csrf-protection',
            level: 'P2',
            file: 'src/SmartAbp.Web/Startup.cs',
            message: 'Startup.cs未配置CSRF防护（建议添加Antiforgery）'
          })
          console.log('     ⚠️  未检测到CSRF防护配置')
        } else {
          console.log('     ✅ CSRF防护已配置')
        }
      } else {
        console.log('     ℹ️  未找到Startup.cs，跳过检查')
      }
    } catch (error: any) {
      console.log(`     ⚠️  检查过程出错: ${error.message}`)
    }
  }

  /**
   * 检查5: 不安全的代码模式
   */
  private async checkUnsafePatterns(): Promise<void> {
    console.log('  📋 检查5: 不安全的代码模式')

    try {
      let unsafePatternCount = 0

      for (const frontendPath of this.frontendPaths) {
        const fullPath = join(this.projectRoot, frontendPath)
        if (!existsSync(fullPath)) continue

        // 检查eval使用
        const evalResult = execSync(
          `grep -rn "\\beval\\s*(" --include="*.ts" --include="*.js" "${fullPath}" | grep -v "node_modules" | grep -v "/dist/" || true`,
          { encoding: 'utf8' }
        )

        const evalLines = evalResult.split('\n').filter(l => l.trim())
        if (evalLines.length > 0) {
          unsafePatternCount++
          this.violations.get('P1')!.push({
            rule: 'security.unsafe-eval',
            level: 'P1',
            file: frontendPath,
            message: `发现 ${evalLines.length} 处使用eval（严重安全风险）`,
            snippet: evalLines.slice(0, 3).join('\n')
          })
        }

        // 检查Function构造器
        const functionResult = execSync(
          `grep -rn "new Function\\s*(" --include="*.ts" --include="*.js" "${fullPath}" | grep -v "node_modules" | grep -v "/dist/" || true`,
          { encoding: 'utf8' }
        )

        const functionLines = functionResult.split('\n').filter(l => l.trim())
        if (functionLines.length > 0) {
          unsafePatternCount++
          this.violations.get('P1')!.push({
            rule: 'security.unsafe-function-constructor',
            level: 'P1',
            file: frontendPath,
            message: `发现 ${functionLines.length} 处使用Function构造器（安全风险）`
          })
        }
      }

      if (unsafePatternCount === 0) {
        console.log('     ✅ 无不安全代码模式')
      } else {
        console.log(`     ⚠️  发现 ${unsafePatternCount} 个不安全模式`)
      }
    } catch (error: any) {
      console.log(`     ⚠️  检查过程出错: ${error.message}`)
    }
  }

  private printSummary(): void {
    console.log('')
    console.log('='.repeat(60))
    console.log('\n📊 安全检查结果:\n')

    const p0Violations = this.violations.get('P0') || []
    const p1Violations = this.violations.get('P1') || []
    const p2Violations = this.violations.get('P2') || []
    const totalViolations = p0Violations.length + p1Violations.length + p2Violations.length

    if (p0Violations.length === 0) {
      console.log('  ✅ P0检查全部通过！')
    } else {
      console.log(`  ❌ P0违规: ${p0Violations.length}个`)
    }

    if (p1Violations.length > 0) {
      console.log(`  ⚠️  P1警告: ${p1Violations.length}个`)
    }

    if (p2Violations.length > 0) {
      console.log(`  ℹ️  P2建议: ${p2Violations.length}个`)
    }

    console.log(`\n  总问题数: ${totalViolations}`)
    console.log('')

    if (p1Violations.length > 0) {
      console.log('  🔒 安全加固建议:')
      console.log('     • 避免使用innerHTML和v-html')
      console.log('     • 使用参数化SQL查询')
      console.log('     • 敏感信息使用环境变量')
      console.log('     • 禁用eval和Function构造器\n')
    }
  }
}
