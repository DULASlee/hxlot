#!/usr/bin/env tsx

/**
 * 安全检查工具
 * 用于验证项目代码是否符合安全规范
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

interface SecurityIssue {
  file: string
  line: number
  column: number
  type: 'dangerous-pattern' | 'dynamic-exec' | 'unsafe-html' | 'weak-validation'
  severity: 'error' | 'warning'
  message: string
  suggestion: string
}

class SecurityChecker {
  private issues: SecurityIssue[] = []
  
  // 危险模式正则表达式
  private dangerousPatterns = [
    {
      pattern: /eval\s*\(/gi,
      type: 'dynamic-exec' as const,
      message: '检测到eval()函数调用',
      suggestion: '使用安全的替代方案，如Function构造器或预编译表达式'
    },
    {
      pattern: /new\s+Function/gi,
      type: 'dynamic-exec' as const,
      message: '检测到new Function()构造器',
      suggestion: '避免动态代码执行，使用静态代码或预编译方案'
    },
    {
      pattern: /<script[^>]*>.*?<\/script>/gi,
      type: 'dangerous-pattern' as const,
      message: '检测到Script标签',
      suggestion: '使用安全的模板渲染或组件化方案'
    },
    {
      pattern: /javascript:/gi,
      type: 'dangerous-pattern' as const,
      message: '检测到JavaScript协议',
      suggestion: '使用标准的事件处理或路由导航'
    },
    {
      pattern: /on\w+\s*=/gi,
      type: 'dangerous-pattern' as const,
      message: '检测到内联事件处理器',
      suggestion: '使用Vue的事件绑定语法或标准事件监听'
    },
    {
      pattern: /innerHTML\s*=|outerHTML\s*=/gi,
      type: 'unsafe-html' as const,
      message: '检测到直接HTML操作',
      suggestion: '使用Vue的v-html指令（需确保内容安全）或文本渲染'
    },
    {
      pattern: /document\.write/gi,
      type: 'unsafe-html' as const,
      message: '检测到document.write调用',
      suggestion: '使用DOM操作或Vue模板渲染'
    }
  ]

  /**
   * 扫描指定目录下的代码文件
   */
  public scanDirectory(dirPath: string): void {
    const files = this.getCodeFiles(dirPath)
    
    console.log(`🔍 开始扫描目录: ${dirPath}`)
    console.log(`📁 发现 ${files.length} 个代码文件`)
    
    files.forEach(file => {
      this.scanFile(file)
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
   * 扫描单个文件
   */
  private scanFile(filePath: string): void {
    try {
      const content = readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')
      
      lines.forEach((line, lineIndex) => {
        this.checkLine(filePath, line, lineIndex + 1)
      })
    } catch (error) {
      console.warn(`⚠️  无法读取文件: ${filePath}`, error)
    }
  }

  /**
   * 检查单行代码
   */
  private checkLine(filePath: string, line: string, lineNumber: number): void {
    this.dangerousPatterns.forEach(({ pattern, type, message, suggestion }) => {
      const matches = line.matchAll(pattern)
      
      for (const match of matches) {
        if (match.index !== undefined) {
          // 检查是否在注释中（简单判断）
          const beforeMatch = line.substring(0, match.index).trim()
          if (beforeMatch.startsWith('//') || beforeMatch.startsWith('*') || beforeMatch.startsWith('/*')) {
            continue // 跳过注释中的匹配
          }
          
          this.issues.push({
            file: filePath,
            line: lineNumber,
            column: match.index + 1,
            type,
            severity: type === 'dynamic-exec' ? 'error' : 'warning',
            message,
            suggestion
          })
        }
      }
    })
  }

  /**
   * 生成检查报告
   */
  public generateReport(): void {
    console.log('\n' + '='.repeat(60))
    console.log('🔒 安全检查报告')
    console.log('='.repeat(60))
    
    if (this.issues.length === 0) {
      console.log('✅ 未发现安全问题！')
      console.log('📊 扫描完成，所有代码符合安全规范')
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
    console.log('1. 优先处理所有错误级别的问题')
    console.log('2. 使用安全的替代方案替换危险代码')
    console.log('3. 启用Vue模板编译时的安全检查')
    console.log('4. 定期进行安全代码审查')
    
    // 设置退出码
    process.exit(errors.length > 0 ? 1 : 0)
  }
}

/**
 * 主函数
 */
function main(): void {
  console.log('🔐 SmartAbp 安全检查工具 v1.0')
  console.log('=====================================\n')
  
  // 默认扫描src目录
  const targetDir = process.argv[2] || 'src'
  
  const checker = new SecurityChecker()
  checker.scanDirectory(targetDir)
  checker.generateReport()
}

// 执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}