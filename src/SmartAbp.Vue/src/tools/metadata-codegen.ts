/**
 * 元数据驱动的代码生成CLI工具
 * 基于 @smartabp/metadata-core 实现 Schema First 开发模式
 *
 * @author SmartAbp Team
 * @version 1.0.0
 */

import chalk from 'chalk'
import { promises as fs } from 'fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
// 从lowcode-shared导入统一类型定义（已从metadata-core迁移）
import type { EntityMetadata, ModuleMetadata } from '@smartabp/lowcode-shared'
import { validateEntityMetadataAsync } from '@smartabp/lowcode-shared'
import { BackendCodeGenerator } from './generators/backend-generator'
import { FrontendCodeGenerator } from './generators/frontend-generator'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../..')
const METADATA_DIR = path.join(ROOT_DIR, '../../metadata')

/**
 * CLI参数
 */
interface CliOptions {
  entity?: string
  module?: string
  type: 'frontend' | 'backend' | 'all'
  output?: string
  dryRun?: boolean
  verbose?: boolean
}

/**
 * 解析CLI参数
 */
function parseArgs(): CliOptions {
  const args = process.argv.slice(2)
  const options: CliOptions = {
    type: 'all'
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === 'frontend' || arg === 'backend' || arg === 'all') {
      options.type = arg
      continue
    }

    if (arg === '--entity' || arg === '-e') {
      options.entity = args[++i]
    } else if (arg === '--module' || arg === '-m') {
      options.module = args[++i]
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i]
    } else if (arg === '--dry-run' || arg === '-d') {
      options.dryRun = true
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true
    }
  }

  return options
}

/**
 * 加载实体元数据
 */
async function loadEntityMetadata(entityName: string): Promise<EntityMetadata> {
  // 尝试多个可能的路径
  const possiblePaths = [
    path.join(METADATA_DIR, 'entities', `${entityName.toLowerCase()}.metadata.ts`),
    path.join(METADATA_DIR, 'entities', entityName, `${entityName.toLowerCase()}.metadata.ts`),
  ]

  // 递归搜索所有子目录
  const searchDir = path.join(METADATA_DIR, 'entities')
  try {
    const files = await findMetadataFiles(searchDir, entityName)
    possiblePaths.push(...files)
  } catch (err) {
    // 目录可能不存在
  }

  for (const metadataPath of possiblePaths) {
    try {
      // 动态导入元数据模块（使用file://协议）
      const fileUrl = `file://${metadataPath.replace(/\\/g, '/')}`
      const module = await import(fileUrl)
      const metadata = module[`${entityName}Metadata`] || module.default

      if (metadata) {
        return metadata as EntityMetadata
      }
    } catch (err) {
      // 继续尝试下一个路径
      if (err instanceof Error && !err.message.includes('Cannot find module')) {
        console.error(chalk.yellow(`  尝试加载失败: ${metadataPath}`))
        console.error(chalk.gray(`  错误: ${err.message}`))
      }
      continue
    }
  }

  throw new Error(`找不到实体元数据: ${entityName}\n已尝试路径:\n${possiblePaths.join('\n')}`)
}

/**
 * 递归搜索元数据文件
 */
async function findMetadataFiles(dir: string, entityName: string): Promise<string[]> {
  const files: string[] = []

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        const subFiles = await findMetadataFiles(fullPath, entityName)
        files.push(...subFiles)
      } else if (entry.name.toLowerCase().includes(entityName.toLowerCase()) &&
        entry.name.endsWith('.metadata.ts')) {
        files.push(fullPath)
      }
    }
  } catch (err) {
    // 忽略访问错误
  }

  return files
}

/**
 * 加载模块元数据
 */
async function loadModuleMetadata(moduleName: string): Promise<ModuleMetadata> {
  const possiblePaths = [
    path.join(METADATA_DIR, 'modules', `${moduleName.toLowerCase()}.module.metadata.ts`),
    path.join(METADATA_DIR, 'modules', moduleName, `${moduleName.toLowerCase()}.module.metadata.ts`),
  ]

  for (const metadataPath of possiblePaths) {
    try {
      const module = await import(metadataPath)
      const metadata = module[`${moduleName}ModuleMetadata`] || module.default

      if (metadata) {
        return metadata as ModuleMetadata
      }
    } catch (err) {
      continue
    }
  }

  throw new Error(`找不到模块元数据: ${moduleName}`)
}

/**
 * 生成前端代码
 */
async function generateFrontend(
  metadata: EntityMetadata,
  options: CliOptions
): Promise<void> {
  console.log(chalk.blue(`\n🎨 生成前端代码: ${metadata.name}\n`))

  const generator = new FrontendCodeGenerator(ROOT_DIR, {
    dryRun: options.dryRun,
    verbose: options.verbose,
    outputDir: options.output
  })

  try {
    const result = await generator.generate(metadata)

    console.log(chalk.green('\n✅ 前端代码生成完成:\n'))
    result.files.forEach(file => {
      const icon = options.dryRun ? '🔍' : '✓'
      console.log(chalk.gray(`  ${icon} ${file}`))
    })

    if (options.dryRun) {
      console.log(chalk.yellow('\n⚠️  Dry-run模式，未实际写入文件'))
    }
  } catch (err) {
    console.error(chalk.red('\n❌ 前端代码生成失败:'), err)
    throw err
  }
}

/**
 * 生成后端代码
 */
async function generateBackend(
  metadata: EntityMetadata,
  options: CliOptions
): Promise<void> {
  console.log(chalk.blue(`\n🔧 生成后端代码: ${metadata.name}\n`))

  const generator = new BackendCodeGenerator({
    dryRun: options.dryRun,
    verbose: options.verbose,
    outputDir: options.output
  })

  try {
    const result = await generator.generate(metadata)

    console.log(chalk.green('\n✅ 后端代码生成完成:\n'))
    result.files.forEach(file => {
      const icon = options.dryRun ? '🔍' : '✓'
      console.log(chalk.gray(`  ${icon} ${file}`))
    })

    if (options.dryRun) {
      console.log(chalk.yellow('\n⚠️  Dry-run模式，未实际写入文件'))
    }
  } catch (err) {
    console.error(chalk.red('\n❌ 后端代码生成失败:'), err)
    throw err
  }
}

/**
 * 主函数
 */
async function main() {
  console.log(chalk.bold.blue('\n🚀 SmartAbp 元数据驱动代码生成器 v1.0.0\n'))

  const options = parseArgs()

  // 参数验证
  if (!options.entity && !options.module) {
    console.error(chalk.red('❌ 错误: 必须指定 --entity 或 --module'))
    console.log(chalk.yellow('\n用法示例:'))
    console.log(chalk.gray('  npm run codegen:entity -- --entity=Book'))
    console.log(chalk.gray('  npm run codegen:frontend -- --entity=Book'))
    console.log(chalk.gray('  npm run codegen:backend -- --entity=Book'))
    console.log(chalk.gray('  npm run codegen:all -- --entity=Book'))
    console.log(chalk.gray('  npm run codegen:entity -- --entity=Book --dry-run'))
    process.exit(1)
  }

  try {
    // 加载元数据
    let entityMetadata: EntityMetadata | null = null

    if (options.entity) {
      console.log(chalk.gray(`📂 加载实体元数据: ${options.entity}...`))
      entityMetadata = await loadEntityMetadata(options.entity)
      console.log(chalk.green(`✓ 元数据加载成功`))

      // 验证元数据
      console.log(chalk.gray(`🔍 验证元数据...`))
      const isValid = await validateEntityMetadataAsync(entityMetadata)

      if (!isValid) {
        throw new Error('元数据验证失败')
      }

      console.log(chalk.green(`✓ 元数据验证通过`))

      if (options.verbose) {
        console.log(chalk.gray(`\n元数据详情:`))
        console.log(chalk.gray(`  名称: ${entityMetadata.name}`))
        console.log(chalk.gray(`  模块: ${entityMetadata.module}`))
        console.log(chalk.gray(`  属性数: ${entityMetadata.properties.length}`))
        console.log(chalk.gray(`  导航属性数: ${entityMetadata.navigationProperties?.length || 0}`))
      }
    }

    // 生成代码
    if (entityMetadata) {
      if (options.type === 'frontend' || options.type === 'all') {
        await generateFrontend(entityMetadata, options)
      }

      if (options.type === 'backend' || options.type === 'all') {
        await generateBackend(entityMetadata, options)
      }
    }

    console.log(chalk.bold.green('\n🎉 代码生成完成！\n'))

    if (!options.dryRun) {
      console.log(chalk.gray('💡 提示: 运行以下命令进行测试:'))
      console.log(chalk.gray('  npm run type-check'))
      console.log(chalk.gray('  npm run test'))
    }

  } catch (err) {
    console.error(chalk.red('\n💥 代码生成失败:\n'))
    console.error(err)
    process.exit(1)
  }
}

// 运行CLI
main()

