#!/usr/bin/env tsx

/**
 * 输入验证工具
 * 用于验证系统输入是否符合安全规范
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { z } from 'zod'

interface ValidationIssue {
  file: string
  line: number
  column: number
  type: 'naming-convention' | 'validation-missing' | 'schema-error' | 'unsafe-input'
  severity: 'error' | 'warning'
  message: string
  suggestion: string
}

// Zod验证模式
const SystemNameSchema = z.string()
  .min(2, '系统名称至少需要2个字符')
  .max(50, '系统名称不能超过50个字符')
  .regex(/^[A-Z][a-zA-Z0-9]*$/, '系统名称必须使用PascalCase格式，以字母开头')

const RouteNameSchema = z.string()
  .min(1, '路由名称不能为空')
  .max(100, '路由名称不能超过100个字符')
  .regex(/^[a-z][a-z0-9-]*$/, '路由名称必须使用kebab-case格式')

const PermissionSchema = z.string()
  .min(1, '权限名称不能为空')
  .max(50, '权限名称不能超过50个字符')
  .regex(/^[A-Z][a-zA-Z0-9]*\.[A-Z][a-zA-Z0-9]*$/, '权限名称必须使用Module.Permission格式')

class InputValidator {
  private issues: ValidationIssue[] = []
  
  /**
   * 扫描指定目录下的代码文件
   */
  public scanDirectory(dirPath: string): void {
    const files = this.getCodeFiles(dirPath)
    
    console.log(`🔍 开始验证输入: ${dirPath}`)
    console.log(`📁 发现 ${files.length} 个代码文件`)
    
    files.forEach(file => {
      this.validateFile(file)
    })
  }

  /**
   * 获取代码文件列表
   */
  private getCodeFiles(dirPath: string): string[] {
    const files: string[] = []
    const allowedExtensions = ['.ts', '.js', '.vue', '.tsx', '.jsx']
    
    const traverse = (currentPath: string) => {
      const entries = readdirSync(currentPath)
      
      entries.forEach(entry => {
        const fullPath = join(currentPath, entry)
        const stat = statSync(fullPath)
        
        if (stat.isDirectory()) {
          // 跳过node_modules和构建目录
          if (!entry.includes('node_modules') && 
              !entry.includes('dist') && 
              !entry.includes('build') &&
              !entry.includes('.git')) {
            traverse(fullPath)
          }
        } else if (stat.isFile()) {
          const ext = extname(entry)
          if (allowedExtensions.includes(ext)) {
            files.push(fullPath)
          }
        }
      })
    }
    
    traverse(dirPath)
    return files
  }

  /**
   * 验证单个文件
   */
  private validateFile(filePath: string): void {
    try {
      const content = readFileSync(filePath, 'utf-8')
      
      // 根据文件类型进行不同的验证
      if (filePath.endsWith('.vue')) {
        this.validateVueFile(filePath, content)
      } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        this.validateTypeScriptFile(filePath, content)
      } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        this.validateJavaScriptFile(filePath, content)
      }
    } catch (error) {
      console.warn(`⚠️  无法读取文件: ${filePath}`, error)
    }
  }

  /**
   * 验证Vue文件
   */
  private validateVueFile(filePath: string, content: string): void {
    const lines = content.split('\n')
    
    lines.forEach((line, lineIndex) => {
      // 检查系统名称
      this.checkSystemName(filePath, line, lineIndex + 1)
      
      // 检查路由名称
      this.checkRouteName(filePath, line, lineIndex + 1)
      
      // 检查权限名称
      this.checkPermissionName(filePath, line, lineIndex + 1)
      
      // 检查输入验证
      this.checkInputValidation(filePath, line, lineIndex + 1)
    })
  }

  /**
   * 验证TypeScript文件
   */
  private validateTypeScriptFile(filePath: string, content: string): void {
    const lines = content.split('\n')
    
    lines.forEach((line, lineIndex) => {
      this.checkSystemName(filePath, line, lineIndex + 1)
      this.checkRouteName(filePath, line, lineIndex + 1)
      this.checkPermissionName(filePath, line, lineIndex + 1)
      this.checkInputValidation(filePath, line, lineIndex + 1)
      this.checkZodSchemas(filePath, line, lineIndex + 1)
    })
  }

  /**
   * 验证JavaScript文件
   */
  private validateJavaScriptFile(filePath: string, content: string): void {
    const lines = content.split('\n')
    
    lines.forEach((line, lineIndex) => {
      this.checkInputValidation(filePath, line, lineIndex + 1)
      this.checkDangerousInputs(filePath, line, lineIndex + 1)
    })
  }

  /**
   * 检查系统名称格式
   */
  private checkSystemName(filePath: string, line: string, lineNumber: number): void {
    // 查找系统名称定义
    const systemNamePatterns = [
      /systemName\s*:\s*["']([^"']+)["']/gi,
      /name\s*:\s*["']([^"']+)["'].*system/gi,
      /title\s*:\s*["']([^"']+)["'].*系统/gi
    ]
    
    systemNamePatterns.forEach(pattern => {
      const matches = line.matchAll(pattern)
      for (const match of matches) {
        if (match[1]) {
          try {
            SystemNameSchema.parse(match[1])
          } catch (error) {
            this.issues.push({
              file: filePath,
              line: lineNumber,
              column: match.index || 0,
              type: 'naming-convention',
              severity: 'error',
              message: `系统名称格式错误: ${match[1]}`,
              suggestion: '系统名称必须使用PascalCase格式，如: SmartAbp, UserManager'
            })
          }
        }
      }
    })
  }

  /**
   * 检查路由名称格式
   */
  private checkRouteName(filePath: string, line: string, lineNumber: number): void {
    const routePatterns = [
      /path\s*:\s*["']([^"']+)["']/gi,
      /route\s*:\s*["']([^"']+)["']/gi
    ]
    
    routePatterns.forEach(pattern => {
      const matches = line.matchAll(pattern)
      for (const match of matches) {
        if (match[1] && !match[1].startsWith('/') && match[1].length > 1) {
          try {
            RouteNameSchema.parse(match[1])
          } catch (error) {
            this.issues.push({
              file: filePath,
              line: lineNumber,
              column: match.index || 0,
              type: 'naming-convention',
              severity: 'error',
              message: `路由名称格式错误: ${match[1]}`,
              suggestion: '路由名称必须使用kebab-case格式，如: user-management, system-config'
            })
          }
        }
      }
    })
  }

  /**
   * 检查权限名称格式
   */
  private checkPermissionName(filePath: string, line: string, lineNumber: number): void {
    const permissionPatterns = [
      /permission\s*:\s*["']([^"']+)["']/gi,
      /authority\s*:\s*["']([^"']+)["']/gi
    ]
    
    permissionPatterns.forEach(pattern => {
      const matches = line.matchAll(pattern)
      for (const match of matches) {
        if (match[1]) {
          try {
            PermissionSchema.parse(match[1])
          } catch (error) {
            this.issues.push({
              file: filePath,
              line: lineNumber,
              column: match.index || 0,
              type: 'naming-convention',
              severity: 'error',
              message: `权限名称格式错误: ${match[1]}`,
              suggestion: '权限名称必须使用Module.Permission格式，如: UserManager.Create, SystemConfig.Read'
            })
          }
        }
      }
    })
  }

  /**
   * 检查输入验证
   */
  private checkInputValidation(filePath: string, line: string, lineNumber: number): void {
    // 检查是否有直接的用户输入处理
    const inputPatterns = [
      /req\.body/gi,
      /req\.query/gi,
      /req\.params/gi,
      /localStorage\.getItem/gi,
      /sessionStorage\.getItem/gi
    ]
    
    inputPatterns.forEach(pattern => {
      const matches = line.matchAll(pattern)
      for (const match of matches) {
        // 检查是否有验证
        if (!line.includes('validate') && !line.includes('schema') && !line.includes('z.')) {
          this.issues.push({
            file: filePath,
            line: lineNumber,
            column: match.index || 0,
            type: 'validation-missing',
            severity: 'warning',
            message: '检测到用户输入未验证',
            suggestion: '使用Zod或其他验证库对输入进行验证'
          })
        }
      }
    })
  }

  /**
   * 检查Zod模式定义
   */
  private checkZodSchemas(filePath: string, line: string, lineNumber: number): void {
    // 检查Zod模式定义是否正确
    const zodPatterns = [
      /z\.string\(\)\.min\(/gi,
      /z\.string\(\)\.max\(/gi,
      /z\.string\(\)\.regex\(/gi,
      /z\.number\(\)\.min\(/gi,
      /z\.number\(\)\.max\(/gi
    ]
    
    zodPatterns.forEach(pattern => {
      const matches = line.matchAll(pattern)
      for (const match of matches) {
        // 检查是否有错误处理
        if (!line.includes('safeParse') && !line.includes('parse')) {
          this.issues.push({
            file: filePath,
            line: lineNumber,
            column: match.index || 0,
            type: 'schema-error',
            severity: 'warning',
            message: 'Zod模式定义可能缺少错误处理',
            suggestion: '使用safeParse方法并处理验证错误'
          })
        }
      }
    })
  }

  /**
   * 检查危险输入
   */
  private checkDangerousInputs(filePath: string, line: string, lineNumber: number): void {
    const dangerousPatterns = [
      /window\[.*\]/gi,
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /setTimeout\s*\(\s*["'].*["']/gi,
      /setInterval\s*\(\s*["'].*["']/gi
    ]
    
    dangerousPatterns.forEach(pattern => {
      const matches = line.matchAll(pattern)
      for (const match of matches) {
        this.issues.push({
          file: filePath,
          line: lineNumber,
          column: match.index || 0,
          type: 'unsafe-input',
          severity: 'error',
          message: '检测到危险输入模式',
          suggestion: '避免使用动态代码执行，使用静态代码替代'
        })
      }
    })
  }

  /**
   * 生成验证报告
   */
  public generateReport(): void {
    console.log('\n' + '='.repeat(60))
    console.log('🔍 输入验证报告')
    console.log('='.repeat(60))
    
    if (this.issues.length === 0) {
      console.log('✅ 未发现输入验证问题！')
      console.log('📊 所有输入验证符合安全规范')
      return
    }
    
    // 按严重程度分组
    const errors = this.issues.filter(issue => issue.severity === 'error')
    const warnings = this.issues.filter(issue => issue.severity === 'warning')
    
    console.log(`\n❌ 发现 ${errors.length} 个错误`)
    console.log(`⚠️  发现 ${warnings.length} 个警告`)
    console.log(`📋 总计 ${this.issues.length} 个问题\n`)
    
    // 显示错误详情
    if (errors.length > 0) {
      console.log('🔴 错误详情:')
      errors.forEach(issue => {
        console.log(`\n📁 ${issue.file}:${issue.line}:${issue.column}`)
        console.log(`   类型: ${issue.type}`)
        console.log(`   问题: ${issue.message}`)
        console.log(`   建议: ${issue.suggestion}`)
      })
    }
    
    // 显示警告详情
    if (warnings.length > 0) {
      console.log('\n🟡 警告详情:')
      warnings.forEach(issue => {
        console.log(`\n📁 ${issue.file}:${issue.line}:${issue.column}`)
        console.log(`   类型: ${issue.type}`)
        console.log(`   问题: ${issue.message}`)
        console.log(`   建议: ${issue.suggestion}`)
      })
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('💡 修复建议:')
    console.log('1. 使用Zod模式验证所有用户输入')
    console.log('2. 确保系统名称使用PascalCase格式')
    console.log('3. 确保路由名称使用kebab-case格式')
    console.log('4. 确保权限名称使用Module.Permission格式')
    console.log('5. 添加适当的错误处理和验证逻辑')
    
    // 设置退出码
    process.exit(errors.length > 0 ? 1 : 0)
  }
}

/**
 * 主函数
 */
function main(): void {
  console.log('🔐 SmartAbp 输入验证工具 v1.0')
  console.log('=====================================\n')
  
  // 默认扫描src目录
  const targetDir = process.argv[2] || 'src'
  
  const validator = new InputValidator()
  validator.scanDirectory(targetDir)
  validator.generateReport()
}

// 执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}