#!/usr/bin/env ts-node
/**
 * TypeScript类型声明生成脚本
 * 
 * 功能：手动触发类型声明生成
 * 
 * 使用方式：
 * ```bash
 * # 生成类型声明
 * npm run type-gen
 * 
 * # 或直接运行
 * npx ts-node scripts/generate-types.ts
 * ```
 * 
 * @author AI首席架构师
 * @since 2.0.0
 */

import { 
  TypeDefinitionGenerator, 
  globalComponentRegistry 
} from '../packages/lowcode-shared/src'
import * as path from 'path'

/**
 * 主函数
 */
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎯 TypeScript类型声明生成器')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    // 创建类型生成器
    const generator = new TypeDefinitionGenerator(globalComponentRegistry, {
      outputPath: path.resolve(process.cwd(), 'types/components.d.ts'),
      moduleName: '@smartabp/lowcode-shared',
      includeComments: true,
      includeExamples: true,
      prettify: true
    })

    console.log('📊 扫描组件注册表...')
    const components = globalComponentRegistry.getAvailableComponents()
    console.log(`   发现 ${components.length} 个组件\n`)

    if (components.length > 0) {
      console.log('📋 组件清单:')
      components.slice(0, 10).forEach((comp, i) => {
        console.log(`   ${i + 1}. ${comp.name} (${comp.category})`)
      })
      
      if (components.length > 10) {
        console.log(`   ... 还有 ${components.length - 10} 个组件`)
      }
      console.log()
    }

    console.log('🔨 生成类型声明文件...')
    const result = await generator.generateFile()

    console.log('\n✅ 类型声明生成成功!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📁 输出路径: ${result.outputPath}`)
    console.log(`📊 组件数量: ${result.componentCount}`)
    console.log(`⏰ 生成时间: ${result.generatedAt.toLocaleString()}`)
    console.log(`📝 文件大小: ${(result.content.length / 1024).toFixed(2)} KB`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('💡 提示:')
    console.log('   1. 重启TypeScript服务器以应用新类型')
    console.log('      VSCode: Cmd+Shift+P → "TypeScript: Restart TS Server"')
    console.log('   2. 智能提示现已支持所有注册组件')
    console.log('   3. 类型文件会自动随组件注册更新\n')

  } catch (error) {
    console.error('\n❌ 类型生成失败:')
    console.error(error)
    process.exit(1)
  }
}

// 执行
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

