/**
 * 铁律3守护者：架构层级强制执行
 * 
 * 核心职责：
 * 1. 检测packages间的依赖关系
 * 2. 阻断逆向依赖
 * 3. 阻断相对路径引用
 * 4. 自动修复导入路径
 */

import * as fs from 'fs'
import { glob as globSync } from 'glob'
import * as path from 'path'

export interface LayerConfig {
  name: string
  level: number
  allowedDependencies: string[]
}

export interface DependencyViolation {
  type: 'RELATIVE_PATH' | 'MAIN_APP_REFERENCE' | 'REVERSE_DEPENDENCY' | 'FORBIDDEN_DEPENDENCY'
  from: string
  to: string
  file: string
  severity: 'error' | 'warning'
  message: string
  autoFixable: boolean
}

/**
 * 依赖层级守护者
 */
export class DependencyLayerGuard {

  private layers: Map<string, LayerConfig> = new Map([
    ['metadata-core', {
      name: 'metadata-core',
      level: -1,
      allowedDependencies: []
    }],
    ['lowcode-shared', {
      name: 'lowcode-shared',
      level: 0,
      allowedDependencies: ['metadata-core']
    }],
    ['lowcode-core', {
      name: 'lowcode-core',
      level: 1,
      allowedDependencies: ['lowcode-shared', 'metadata-core']
    }],
    ['lowcode-api', {
      name: 'lowcode-api',
      level: 1,
      allowedDependencies: ['lowcode-shared']
    }],
    ['lowcode-tools', {
      name: 'lowcode-tools',
      level: 1,
      allowedDependencies: ['lowcode-shared']
    }],
    ['lowcode-designer', {
      name: 'lowcode-designer',
      level: 2,
      allowedDependencies: ['lowcode-core', 'lowcode-shared', 'metadata-core']
    }]
  ])

  /**
   * 检测所有依赖违规
   */
  async detectViolations(): Promise<DependencyViolation[]> {
    const violations: DependencyViolation[] = []

    // 扫描所有packages
    for (const [packageName, config] of this.layers) {
      const packagePath = path.resolve(
        process.cwd(),
        `src/SmartAbp.Vue/packages/${packageName}`
      )

      if (!fs.existsSync(packagePath)) continue

      // 扫描package中的所有源文件
      const pattern = path.join(packagePath, 'src/**/*.{ts,vue}')
      const files = globSync(pattern, {
        ignore: ['**/node_modules/**', '**/dist/**']
      })

      for (const file of files) {
        const fullPath = file
        const content = fs.readFileSync(fullPath, 'utf-8')
        const imports = this.extractImports(content)

        for (const imp of imports) {
          const violation = this.checkImportViolation(
            packageName,
            imp,
            fullPath
          )

          if (violation) {
            violations.push(violation)
          }
        }
      }
    }

    return violations
  }

  /**
   * 检查单个导入是否违规
   */
  private checkImportViolation(
    fromPackage: string,
    importPath: string,
    file: string
  ): DependencyViolation | null {

    // 1. 检查相对路径违规（跨package）
    if (importPath.startsWith('../')) {
      // 检查是否跨package引用
      const segments = importPath.split('/')
      const upLevels = segments.filter(s => s === '..').length

      // 如果超过src目录，就是跨package了
      if (upLevels >= 2) {
        return {
          type: 'RELATIVE_PATH',
          from: fromPackage,
          to: importPath,
          file,
          severity: 'error',
          message: `禁止使用相对路径跨package引用: "${importPath}"，请使用 @smartabp/ 别名`,
          autoFixable: true
        }
      }
    }

    // 2. 检查主应用引用违规
    if (importPath.startsWith('@/')) {
      return {
        type: 'MAIN_APP_REFERENCE',
        from: fromPackage,
        to: importPath,
        file,
        severity: 'error',
        message: `packages中禁止引用主应用: "${importPath}"`,
        autoFixable: false
      }
    }

    // 3. 检查@smartabp别名的依赖关系
    if (importPath.startsWith('@smartabp/')) {
      const targetPackage = importPath.split('/')[1] || '' // @smartabp/lowcode-core -> lowcode-core

      const fromConfig = this.layers.get(fromPackage)
      const toConfig = targetPackage ? this.layers.get(targetPackage) : undefined

      if (!fromConfig || !toConfig) return null

      // 检查逆向依赖（低层级依赖高层级）
      if (toConfig.level > fromConfig.level) {
        return {
          type: 'REVERSE_DEPENDENCY',
          from: fromPackage,
          to: targetPackage,
          file,
          severity: 'error',
          message: `逆向依赖违规！Layer ${fromConfig.level} (${fromPackage}) 不能依赖 Layer ${toConfig.level} (${targetPackage})`,
          autoFixable: false
        }
      }

      // 检查是否在允许列表中
      if (!fromConfig.allowedDependencies.includes(targetPackage)) {
        return {
          type: 'FORBIDDEN_DEPENDENCY',
          from: fromPackage,
          to: targetPackage,
          file,
          severity: 'error',
          message: `禁止的依赖关系：${fromPackage} 不允许依赖 ${targetPackage}`,
          autoFixable: false
        }
      }
    }

    return null
  }

  /**
   * 提取文件中的所有import语句
   */
  private extractImports(content: string): string[] {
    const imports: string[] = []

    // 匹配 import ... from '...'
    const importRegex = /from\s+['"]([^'"]+)['"]/g

    let match
    while ((match = importRegex.exec(content)) !== null) {
      if (match[1]) {
        imports.push(match[1])
      }
    }

    return imports
  }

  /**
   * 自动修复相对路径
   */
  async autoFixRelativePath(violation: DependencyViolation): Promise<boolean> {
    if (violation.type !== 'RELATIVE_PATH') return false

    try {
      const content = fs.readFileSync(violation.file, 'utf-8')

      // 尝试推断目标package
      const targetPackage = this.inferTargetPackage(String(violation.to))

      if (!targetPackage) {
        console.log(`⚠️  无法推断目标package: ${violation.to}`)
        return false
      }

      // 替换相对路径为@smartabp别名
      const newContent = content.replace(
        new RegExp(`from\\s+['"]${this.escapeRegExp(String(violation.to))}['"]`, 'g'),
        `from '@smartabp/${targetPackage}'`
      )

      if (content !== newContent) {
        fs.writeFileSync(violation.file, newContent)
        return true
      }

      return false
    } catch (error) {
      console.error(`修复失败: ${violation.file}`, error)
      return false
    }
  }

  /**
   * 从相对路径推断目标package
   */
  private inferTargetPackage(relativePath: string): string | null {
    // ../../../lowcode-shared/src/xxx -> lowcode-shared
    // ../../lowcode-core/src/xxx -> lowcode-core

    const match = relativePath.match(/\.\.\/(lowcode-\w+|metadata-core)/)
    return match && match[1] ? match[1] : null
  }

  /**
   * 转义正则表达式特殊字符
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * 生成依赖关系图
   */
  generateDependencyGraph(): string {
    let graph = '🏛️ 架构层级依赖关系:\n\n'

    // 按层级排序
    const sortedLayers = Array.from(this.layers.values()).sort((a, b) => b.level - a.level)

    for (const layer of sortedLayers) {
      graph += `Layer ${layer.level}: ${layer.name}\n`

      if (layer.allowedDependencies.length > 0) {
        graph += `  ↓ 允许依赖:\n`
        layer.allowedDependencies.forEach(dep => {
          const depLayer = this.layers.get(dep)
          graph += `  - ${dep} (Layer ${depLayer?.level})\n`
        })
      } else {
        graph += `  ↓ 零依赖\n`
      }

      graph += '\n'
    }

    return graph
  }
}

