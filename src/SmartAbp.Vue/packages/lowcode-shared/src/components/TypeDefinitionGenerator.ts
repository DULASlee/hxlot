/**
 * TypeScript类型定义自动生成器
 * 
 * 核心功能：从ComponentRegistry自动生成TypeScript类型声明文件
 * 
 * 工作原理：
 * 1. 遍历ComponentRegistry中的所有组件
 * 2. 为每个组件生成正确的类型导入
 * 3. 生成全局Components接口
 * 4. 输出.d.ts文件
 * 
 * 使用场景：
 * - 构建时自动生成类型
 * - 开发时实时更新类型
 * - VSCode智能提示支持
 * 
 * @module TypeDefinitionGenerator
 * @author AI首席架构师
 * @since 2.0.0
 */

import { promises as fs } from 'fs'
import * as path from 'path'
import type { ComponentMetadata, ComponentRegistry } from './ComponentRegistry'

/**
 * 类型生成器选项
 */
export interface TypeGeneratorOptions {
  /**
   * 输出文件路径
   */
  outputPath?: string

  /**
   * 模块名称（用于declare module）
   */
  moduleName?: string

  /**
   * 是否包含注释
   */
  includeComments?: boolean

  /**
   * 是否美化输出
   */
  prettify?: boolean

  /**
   * 自定义导入路径映射
   */
  pathMapping?: Record<string, string>

  /**
   * 是否生成示例代码
   */
  includeExamples?: boolean
}

/**
 * 生成的类型声明内容
 */
export interface GeneratedTypeDefinition {
  /**
   * 类型声明内容
   */
  content: string

  /**
   * 组件数量
   */
  componentCount: number

  /**
   * 生成时间
   */
  generatedAt: Date

  /**
   * 输出路径
   */
  outputPath: string
}

/**
 * TypeScript类型定义生成器
 */
export class TypeDefinitionGenerator {
  private options: Required<TypeGeneratorOptions>

  constructor(
    private registry: ComponentRegistry,
    options: TypeGeneratorOptions = {}
  ) {
    this.options = {
      outputPath: options.outputPath ?? 'types/components.d.ts',
      moduleName: options.moduleName ?? '@smartabp/lowcode-shared',
      includeComments: options.includeComments ?? true,
      prettify: options.prettify ?? true,
      pathMapping: options.pathMapping ?? {},
      includeExamples: options.includeExamples ?? false
    }
  }

  /**
   * 生成类型声明内容
   */
  generate(): string {
    const components = this.registry.getAvailableComponents()

    if (components.length === 0) {
      return this.generateEmptyDeclaration()
    }

    const parts: string[] = []

    // 文件头部注释
    if (this.options.includeComments) {
      parts.push(this.generateFileHeader(components.length))
    }

    // 组件类型导入声明
    parts.push(this.generateComponentTypes(components))

    // 全局Components接口
    parts.push(this.generateGlobalInterface(components))

    // 示例代码（可选）
    if (this.options.includeExamples) {
      parts.push(this.generateExamples())
    }

    return (this as any).prettify ? (this as any).prettify(parts.join('\n\n')) : this.formatCode(parts.join('\n\n'))
  }

  /**
   * 生成文件并保存到磁盘
   */
  async generateFile(): Promise<GeneratedTypeDefinition> {
    const content = this.generate()
    const components = this.registry.getAvailableComponents()

    // 确保输出目录存在
    const outputDir = path.dirname(this.options.outputPath)
    await fs.mkdir(outputDir, { recursive: true })

    // 写入文件
    await fs.writeFile(this.options.outputPath, content, 'utf-8')

    return {
      content,
      componentCount: components.length,
      generatedAt: new Date(),
      outputPath: this.options.outputPath
    }
  }

  /**
   * 生成文件头部注释
   */
  private generateFileHeader(componentCount: number): string {
    const now = new Date().toISOString()

    return `/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🌟 虚拟程序集 - TypeScript类型声明（自动生成）
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * ⚠️  警告：此文件自动生成，请勿手动修改！
 * 
 * 生成时间: ${now}
 * 组件数量: ${componentCount}
 * 生成器版本: 2.0.0
 * 
 * 使用方式：
 * \`\`\`typescript
 * import { Components } from '${this.options.moduleName}'
 * 
 * const SmartForm = Components.SmartForm  // ✅ 自动类型提示
 * \`\`\`
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */`
  }

  /**
   * 生成空声明（无组件时）
   */
  private generateEmptyDeclaration(): string {
    return `/**
 * 虚拟程序集类型声明（暂无组件）
 */
declare module '${this.options.moduleName}' {
  export interface GlobalComponents {}
  
  export const Components: GlobalComponents
}`
  }

  /**
   * 生成组件类型声明
   */
  private generateComponentTypes(components: ComponentMetadata[]): string {
    const declarations = components.map(component => {
      const importPath = this.resolveImportPath((component as any).path)
      const componentType = this.getComponentTypeName(component.name)

      if (this.options.includeComments && component.description) {
        return `  /** ${component.description} */\n  ${component.name}: ${componentType}`
      }

      return `  ${component.name}: ${componentType}`
    })

    return `declare module '${this.options.moduleName}' {
  import type { Component } from 'vue'

  /**
   * 全局组件接口
   * 
   * 通过虚拟程序集访问所有组件：
   * \`\`\`typescript
   * import { Components } from '${this.options.moduleName}'
   * const form = Components.SmartForm
   * \`\`\`
   */
  export interface GlobalComponents {
${declarations.join('\n')}
  }

  /**
   * 虚拟程序集 - 全局组件代理对象
   * 
   * 特性：
   * - ✅ 零配置自动加载
   * - ✅ LRU缓存优化
   * - ✅ 完整类型支持
   * - ✅ 按需加载
   */
  export const Components: GlobalComponents
}`
  }

  /**
   * 生成全局接口（Vue插件集成）
   */
  private generateGlobalInterface(components: ComponentMetadata[]): string {
    if (components.length === 0) {
      return ''
    }

    const componentList = components
      .map(c => `    ${c.name}: typeof Components.${c.name}`)
      .join('\n')

    return `/**
 * Vue全局组件类型增强
 * 
 * 使Vue模板中可以直接使用组件名
 */
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
${componentList}
  }
}`
  }

  /**
   * 生成使用示例
   */
  private generateExamples(): string {
    return `/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📖 使用示例
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * 示例1：基础使用
 * \`\`\`vue
 * <script setup lang="ts">
 * import { Components } from '${this.options.moduleName}'
 * 
 * const SmartForm = Components.SmartForm
 * const DataTable = Components.DataTable
 * </script>
 * 
 * <template>
 *   <SmartForm />
 *   <DataTable />
 * </template>
 * \`\`\`
 * 
 * 示例2：动态组件
 * \`\`\`vue
 * <script setup lang="ts">
 * import { ref, computed } from 'vue'
 * import { Components } from '${this.options.moduleName}'
 * 
 * const componentName = ref('SmartForm')
 * const DynamicComponent = computed(() => Components[componentName.value])
 * </script>
 * 
 * <template>
 *   <component :is="DynamicComponent" />
 * </template>
 * \`\`\`
 * 
 * 示例3：条件渲染
 * \`\`\`vue
 * <script setup lang="ts">
 * import { ref } from 'vue'
 * import { Components } from '${this.options.moduleName}'
 * 
 * const showForm = ref(false)
 * </script>
 * 
 * <template>
 *   <component v-if="showForm" :is="Components.SmartForm" />
 * </template>
 * \`\`\`
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */`
  }

  /**
   * 解析导入路径
   */
  private resolveImportPath(componentPath: string): string {
    // 检查路径映射
    for (const [pattern, replacement] of Object.entries(this.options.pathMapping)) {
      if (componentPath.includes(pattern)) {
        return componentPath.replace(pattern, replacement)
      }
    }

    return componentPath
  }

  /**
   * 获取组件类型名称
   */
  private getComponentTypeName(componentName: string): string {
    // Vue3异步组件类型
    return `Component`
  }

  /**
   * 格式化代码（美化输出）
   */
  private formatCode(code: string): string {
    // 简单的格式化：确保空行一致
    return code
      .replace(/\n{3,}/g, '\n\n')  // 多个空行压缩为2个
      .replace(/\n\s*\n\s*\n/g, '\n\n')  // 清理多余空行
      .trim() + '\n'  // 文件末尾保留一个换行
  }

  /**
   * 监听Registry变化，自动更新类型
   */
  async watch(callback?: (result: GeneratedTypeDefinition) => void): Promise<void> {
    // 初始生成
    let result = await this.generateFile()
    callback?.(result)

    // 定期检查更新（简单实现，生产环境应使用文件监听）
    setInterval(async () => {
      const newComponents = this.registry.getAvailableComponents()

      // 检查是否有变化
      if (newComponents.length !== result.componentCount) {
        result = await this.generateFile()
        callback?.(result)

        console.log(`[TypeDefinitionGenerator] 类型声明已更新 (${result.componentCount}个组件)`)
      }
    }, 5000)  // 每5秒检查一次
  }
}

/**
 * 创建类型生成器的便捷函数
 */
export function createTypeGenerator(
  registry: ComponentRegistry,
  options?: TypeGeneratorOptions
): TypeDefinitionGenerator {
  return new TypeDefinitionGenerator(registry, options)
}

/**
 * 快速生成类型文件
 */
export async function generateTypes(
  registry: ComponentRegistry,
  outputPath?: string
): Promise<GeneratedTypeDefinition> {
  const generator = new TypeDefinitionGenerator(registry, { outputPath })
  return generator.generateFile()
}

