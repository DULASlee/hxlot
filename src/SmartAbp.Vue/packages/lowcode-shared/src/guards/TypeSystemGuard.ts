/**
 * 铁律1守护者：统一类型系统强制执行
 * 
 * 核心职责：
 * 1. 检测主应用中定义的可复用类型
 * 2. 检测相对路径导入types的行为
 * 3. 自动将类型迁移到lowcode-shared/types
 * 4. 自动修复导入路径
 */

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

export interface TypeViolation {
  file: string
  line: number
  type: 'REUSABLE_TYPE_IN_MAIN_APP' | 'RELATIVE_TYPE_IMPORT'
  severity: 'error' | 'warning'
  message: string
  suggestion: string
  autoFixable: boolean
  typeName?: string
  importPath?: string
}

/**
 * 类型系统守护者
 */
export class TypeSystemGuard {
  
  /**
   * 检测所有类型系统违规
   */
  async detectViolations(): Promise<TypeViolation[]> {
    const violations: TypeViolation[] = []
    
    // 1. 检测主应用中的类型定义
    const mainAppTypeViolations = await this.detectMainAppTypes()
    violations.push(...mainAppTypeViolations)
    
    // 2. 检测相对路径导入
    const relativeImportViolations = await this.detectRelativeTypeImports()
    violations.push(...relativeImportViolations)
    
    return violations
  }
  
  /**
   * 检测主应用中的类型定义
   */
  private async detectMainAppTypes(): Promise<TypeViolation[]> {
    const violations: TypeViolation[] = []
    
    // 扫描主应用中的类型文件（排除合法的types目录）
    const typeFiles = await glob('src/**/*types.{ts,d.ts}', {
      cwd: path.resolve(process.cwd(), 'src/SmartAbp.Vue'),
      ignore: ['**/types/**', '**/node_modules/**', '**/dist/**']
    })
    
    for (const file of typeFiles) {
      const fullPath = path.resolve(process.cwd(), 'src/SmartAbp.Vue', file)
      const content = fs.readFileSync(fullPath, 'utf-8')
      const lines = content.split('\n')
      
      lines.forEach((line, index) => {
        // 检测可复用的type/interface定义
        const match = line.match(/export\s+(interface|type)\s+(\w+)/)
        
        if (match) {
          const [, kind, typeName] = match
          
          // 排除组件内部类型
          if (
            !typeName.endsWith('Props') &&
            !typeName.endsWith('Emits') &&
            !typeName.endsWith('State') &&
            !typeName.endsWith('Methods')
          ) {
            violations.push({
              file: fullPath,
              line: index + 1,
              type: 'REUSABLE_TYPE_IN_MAIN_APP',
              severity: 'error',
              message: `可复用类型 "${typeName}" 定义在主应用中，违反铁律1`,
              suggestion: `将此类型移至 @smartabp/lowcode-shared/types/${typeName}.ts`,
              autoFixable: true,
              typeName
            })
          }
        }
      })
    }
    
    return violations
  }
  
  /**
   * 检测相对路径导入types
   */
  private async detectRelativeTypeImports(): Promise<TypeViolation[]> {
    const violations: TypeViolation[] = []
    
    // 扫描所有TS/Vue文件
    const files = await glob('src/**/*.{ts,vue}', {
      cwd: path.resolve(process.cwd(), 'src/SmartAbp.Vue'),
      ignore: ['**/node_modules/**', '**/dist/**']
    })
    
    for (const file of files) {
      const fullPath = path.resolve(process.cwd(), 'src/SmartAbp.Vue', file)
      const content = fs.readFileSync(fullPath, 'utf-8')
      const lines = content.split('\n')
      
      lines.forEach((line, index) => {
        // 检测相对路径导入types
        const match = line.match(/from\s+['"](\.\.[^'"]*types[^'"]*)['"]/i)
        
        if (match) {
          const importPath = match[1]
          
          violations.push({
            file: fullPath,
            line: index + 1,
            type: 'RELATIVE_TYPE_IMPORT',
            severity: 'error',
            message: `使用相对路径导入types：${importPath}，违反铁律1`,
            suggestion: `使用 @smartabp/lowcode-shared 别名导入`,
            autoFixable: true,
            importPath
          })
        }
      })
    }
    
    return violations
  }
  
  /**
   * 自动修复违规
   */
  async autoFix(violation: TypeViolation): Promise<boolean> {
    try {
      switch (violation.type) {
        case 'REUSABLE_TYPE_IN_MAIN_APP':
          return await this.moveTypeToShared(violation)
        
        case 'RELATIVE_TYPE_IMPORT':
          return await this.fixImportPath(violation)
        
        default:
          return false
      }
    } catch (error) {
      console.error(`修复失败: ${violation.file}:${violation.line}`, error)
      return false
    }
  }
  
  /**
   * 将类型移至lowcode-shared/types
   */
  private async moveTypeToShared(violation: TypeViolation): Promise<boolean> {
    if (!violation.typeName) return false
    
    const sourceFile = violation.file
    const content = fs.readFileSync(sourceFile, 'utf-8')
    const lines = content.split('\n')
    
    // 提取完整的类型定义
    const typeDefinition = this.extractTypeDefinition(lines, violation.line - 1)
    
    if (!typeDefinition) return false
    
    // 目标文件路径
    const targetDir = path.resolve(
      process.cwd(),
      'src/SmartAbp.Vue/packages/lowcode-shared/src/types'
    )
    
    // 确保目录存在
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }
    
    const targetFile = path.join(targetDir, `${violation.typeName}.ts`)
    
    // 如果文件已存在，跳过
    if (fs.existsSync(targetFile)) {
      console.log(`⚠️  类型文件已存在，跳过: ${targetFile}`)
      return false
    }
    
    // 写入目标文件
    fs.writeFileSync(targetFile, typeDefinition.trim() + '\n')
    
    // 更新原文件：删除定义，添加导入
    const newContent = content.replace(
      typeDefinition,
      `import type { ${violation.typeName} } from '@smartabp/lowcode-shared'\n`
    )
    
    fs.writeFileSync(sourceFile, newContent)
    
    // 更新index.ts导出
    this.updateTypesIndex(violation.typeName)
    
    return true
  }
  
  /**
   * 修复导入路径
   */
  private async fixImportPath(violation: TypeViolation): Promise<boolean> {
    if (!violation.importPath) return false
    
    const file = violation.file
    const content = fs.readFileSync(file, 'utf-8')
    
    // 替换相对路径为@smartabp别名
    const newContent = content.replace(
      new RegExp(`from\\s+['"]${this.escapeRegExp(violation.importPath)}['"]`, 'g'),
      `from '@smartabp/lowcode-shared'`
    )
    
    if (content !== newContent) {
      fs.writeFileSync(file, newContent)
      return true
    }
    
    return false
  }
  
  /**
   * 提取完整的类型定义
   */
  private extractTypeDefinition(lines: string[], startLine: number): string | null {
    let definition = lines[startLine]
    let braceCount = 0
    let i = startLine
    
    // 计算大括号
    const countBraces = (line: string) => {
      braceCount += (line.match(/{/g) || []).length
      braceCount -= (line.match(/}/g) || []).length
    }
    
    countBraces(definition)
    
    // 如果是简单类型定义（无大括号），直接返回
    if (braceCount === 0 && definition.includes('=')) {
      return definition
    }
    
    // 提取到所有大括号匹配
    i++
    while (i < lines.length && braceCount > 0) {
      definition += '\n' + lines[i]
      countBraces(lines[i])
      i++
    }
    
    return definition || null
  }
  
  /**
   * 更新types/index.ts导出
   */
  private updateTypesIndex(typeName: string) {
    const indexFile = path.resolve(
      process.cwd(),
      'src/SmartAbp.Vue/packages/lowcode-shared/src/types/index.ts'
    )
    
    let content = ''
    
    if (fs.existsSync(indexFile)) {
      content = fs.readFileSync(indexFile, 'utf-8')
    }
    
    // 如果已经导出，跳过
    if (content.includes(`export * from './${typeName}'`)) {
      return
    }
    
    // 添加导出
    content += `export * from './${typeName}'\n`
    
    fs.writeFileSync(indexFile, content)
  }
  
  /**
   * 转义正则表达式特殊字符
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}

