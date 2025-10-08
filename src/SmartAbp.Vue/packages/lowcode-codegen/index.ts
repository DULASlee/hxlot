// 🚀 SmartAbp 低代码代码生成模块 - 企业级代码生成器

export interface CodeTemplate {
  name: string
  language: string
  template: string
  variables: Record<string, any>
}

export interface CodeGenerator {
  generate(template: CodeTemplate): string
  validate(code: string): boolean
}

// ===== 代码生成视图组件导出 =====
// export { default as EnhancedGenerationView } from './EnhancedGenerationView.vue' // 文件已迁移到GenerationView.vue

/**
 * 注册代码生成组件到 ComponentRegistry
 * @遵循架构铁律二：强制使用组件注册系统
 */
import { registerComponent } from '@smartabp/lowcode-shared'

export function registerCodegenComponents(): void {
  registerComponent({
    name: 'EnhancedGenerationView',
    displayName: '增强代码生成视图',
    category: 'codegen',
    priority: 'high',
    dependencies: ['BaseComponent'],
    bundle: '@smartabp/lowcode-codegen',
    lazy: false,
    preload: true,
    version: '1.0.0',
    tags: ['codegen', 'generation', 'view']
  })

  console.log('[SmartAbp] ✅ lowcode-codegen 代码生成组件已注册')
}

// ===== 代码生成器工厂 =====
export const createCodeGenerator = (): CodeGenerator => {
  return {
    generate(template: CodeTemplate): string {
      return `// 🏗️ SmartAbp Generated Code - ${template.name}\n// Language: ${template.language}\n// Generated at: ${new Date().toISOString()}`
    },
    validate(code: string): boolean {
      return code.length > 0 && !code.includes('undefined')
    },
  }
}

export default createCodeGenerator
