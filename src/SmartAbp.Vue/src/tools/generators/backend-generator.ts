/**
 * 后端代码生成器
 * 基于元数据生成 C# 实体、DTO、AppService、Controller等
 * 
 * 注意：此为占位符实现，实际生成逻辑需要调用后端 CodeGenerationAppService API
 */

import type { EntityMetadata } from '../../../packages/metadata-core/dist/index.js'

export interface GeneratorOptions {
  dryRun?: boolean
  verbose?: boolean
  outputDir?: string
}

export interface GenerationResult {
  files: string[]
  errors: string[]
}

export class BackendCodeGenerator {
  constructor(private options: GeneratorOptions = {}) {}

  /**
   * 生成后端代码
   * 
   * 实现方式：
   * 1. 将元数据转换为后端API需要的格式
   * 2. 调用 /api/code-generation/generate-module API
   * 3. 后端生成代码并返回文件列表
   */
  async generate(metadata: EntityMetadata): Promise<GenerationResult> {
    const files: string[] = []
    const errors: string[]= []

    try {
      if (this.options.dryRun) {
        // Dry-run模式：仅列出将要生成的文件
        files.push(
          `src/SmartAbp.Domain/${metadata.module}/${metadata.name}.cs`,
          `src/SmartAbp.Domain/${metadata.module}/I${metadata.name}Repository.cs`,
          `src/SmartAbp.Application/${metadata.module}/${metadata.name}AppService.cs`,
          `src/SmartAbp.Application.Contracts/${metadata.module}/${metadata.name}Dto.cs`,
          `src/SmartAbp.Application.Contracts/${metadata.module}/Create${metadata.name}Dto.cs`,
          `src/SmartAbp.Application.Contracts/${metadata.module}/Update${metadata.name}Dto.cs`,
          `src/SmartAbp.HttpApi/${metadata.module}/${metadata.name}Controller.cs`,
          `src/SmartAbp.EntityFrameworkCore/${metadata.module}/${metadata.name}Configuration.cs`
        )
        
        if (this.options.verbose) {
          console.log('[Dry-run] 后端代码生成计划:')
          files.forEach(file => console.log(`  - ${file}`))
        }
      } else {
        // 实际生成：调用后端API
        // TODO: 实现实际的API调用逻辑
        // const result = await callBackendCodeGenAPI(metadata)
        // files.push(...result.generatedFiles)
        
        errors.push('后端代码生成功能尚未实现，需要集成后端 CodeGenerationAppService API')
        errors.push('当前可以使用 dry-run 模式预览将要生成的文件')
      }
    } catch (err) {
      errors.push(`Backend generation failed: ${err}`)
    }

    return { files, errors }
  }
}

/**
 * 调用后端代码生成API（待实现）
 */
async function callBackendCodeGenAPI(metadata: EntityMetadata): Promise<{ generatedFiles: string[] }> {
  // TODO: 实现HTTP请求
  // 1. 将 EntityMetadata 转换为后端需要的格式
  // 2. POST /api/code-generation/generate-module
  // 3. 等待生成完成
  // 4. 返回生成的文件列表
  
  throw new Error('Not implemented yet')
}

