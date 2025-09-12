#!/usr/bin/env node

/**
 * 模板库验证脚本
 * 用于验证模板文件的完整性和正确性
 */

const fs = require("fs")
const path = require("path")
const yaml = require("js-yaml")

// Resolve the repository-level templates directory by walking up from current file
function resolveTemplatesDir(startDir) {
  let currentDir = startDir
  for (let i = 0; i < 10; i++) {
    const candidate = path.join(currentDir, "templates")
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        return candidate
      }
    } catch (e) {
      // ignore and continue walking up
    }
    const parent = path.dirname(currentDir)
    if (parent === currentDir) break
    currentDir = parent
  }
  // Fallback to cwd/templates
  return path.resolve(process.cwd(), "templates")
}

class TemplateValidator {
  constructor() {
    this.templatesDir = resolveTemplatesDir(__dirname)
    this.errors = []
    this.warnings = []
  }

  /**
   * 验证所有模板
   */
  async validateAll() {
    console.log("🔍 开始验证模板库...\n")

    try {
      // 验证索引文件
      await this.validateIndex()

      // 验证模板文件
      await this.validateTemplates()

      // 输出结果
      this.outputResults()

      return this.errors.length === 0
    } catch (error) {
      console.error("❌ 验证过程中发生错误:", error.message)
      return false
    }
  }

  /**
   * 验证索引文件
   */
  async validateIndex() {
    const indexPath = path.join(this.templatesDir, "index.json")

    if (!fs.existsSync(indexPath)) {
      this.errors.push("缺少模板索引文件: templates/index.json")
      return
    }

    try {
      const indexContent = JSON.parse(fs.readFileSync(indexPath, "utf8"))

      // 验证索引结构
      if (!indexContent.templates || !Array.isArray(indexContent.templates)) {
        this.errors.push("索引文件格式错误: 缺少templates数组")
        return
      }

      // 验证每个模板条目
      for (const template of indexContent.templates) {
        await this.validateTemplateEntry(template)
      }

      console.log("✅ 索引文件验证通过")
    } catch (error) {
      this.errors.push(`索引文件解析错误: ${error.message}`)
    }
  }

  /**
   * 验证模板条目
   */
  async validateTemplateEntry(template) {
    const required = ["id", "name", "path", "category", "type"]

    for (const field of required) {
      if (!template[field]) {
        this.errors.push(`模板 ${template.id || "unknown"} 缺少必需字段: ${field}`)
      }
    }

    // 验证模板文件存在
    if (template.path) {
      const templatePath = path.join(this.templatesDir, template.path.replace(/^templates\//, ""))
      if (!fs.existsSync(templatePath)) {
        this.errors.push(`模板文件不存在: ${template.path}`)
      }
    }

    // 验证元数据文件存在（如果声明）
    if (template.metadata) {
      const metadataPath = path.join(
        this.templatesDir,
        template.metadata.replace(/^templates\//, ""),
      )
      if (!fs.existsSync(metadataPath)) {
        this.errors.push(`元数据文件不存在: ${template.metadata}`)
      } else {
        await this.validateMetadata(metadataPath, template.id)
      }
    }
  }

  /**
   * 验证元数据文件
   */
  async validateMetadata(metadataPath, templateId) {
    try {
      const content = fs.readFileSync(metadataPath, "utf8")
      const metadata = yaml.load(content)

      const recommended = ["name", "category", "description", "parameters"]

      for (const field of recommended) {
        if (!metadata[field]) {
          this.warnings.push(`模板 ${templateId} 的元数据缺少推荐字段: ${field}`)
        }
      }

      // 验证参数定义
      if (metadata.parameters && Array.isArray(metadata.parameters)) {
        for (const param of metadata.parameters) {
          if (!param.name || !param.type) {
            this.errors.push(`模板 ${templateId} 的参数定义不完整`)
          }
        }
      }
    } catch (error) {
      this.errors.push(`元数据文件解析错误 ${metadataPath}: ${error.message}`)
    }
  }

  /**
   * 验证模板文件
   */
  async validateTemplates() {
    const templateFiles = this.findTemplateFiles(this.templatesDir)

    for (const filePath of templateFiles) {
      await this.validateTemplateFile(filePath)
    }

    console.log(`✅ 验证了 ${templateFiles.length} 个模板文件`)
  }

  /**
   * 查找所有模板文件
   */
  findTemplateFiles(dir) {
    const files = []

    const scan = (currentDir) => {
      const items = fs.readdirSync(currentDir)

      for (const item of items) {
        const fullPath = path.join(currentDir, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          scan(fullPath)
        } else if (item.includes(".template.")) {
          files.push(fullPath)
        }
      }
    }

    scan(dir)
    return files
  }

  /**
   * 验证单个模板文件
   */
  async validateTemplateFile(filePath) {
    const content = fs.readFileSync(filePath, "utf8")
    const relativePath = path.relative(this.templatesDir, filePath)

    // 检查AI模板信息
    if (!content.includes("AI_TEMPLATE_INFO")) {
      this.warnings.push(`模板 ${relativePath} 缺少 AI_TEMPLATE_INFO 注释`)
    }

    // 检查参数占位符
    const placeholders = content.match(/\{\{[^}]+\}\}/g) || []
    if (placeholders.length === 0) {
      this.warnings.push(`模板 ${relativePath} 没有参数占位符`)
    }

    // 检查语法（基础检查）
    if (filePath.endsWith(".cs")) {
      await this.validateCSharpSyntax(content, relativePath)
    } else if (filePath.endsWith(".vue")) {
      await this.validateVueSyntax(content, relativePath)
    } else if (filePath.endsWith(".ts")) {
      await this.validateTypeScriptSyntax(content, relativePath)
    }
  }

  /**
   * 验证C#语法
   */
  async validateCSharpSyntax(content, filePath) {
    // 基础语法检查
    const braces = (content.match(/\{/g) || []).length - (content.match(/\}/g) || []).length
    if (braces !== 0) {
      this.errors.push(`C#模板 ${filePath} 大括号不匹配`)
    }

    // 检查必要的using语句
    if (
      content.includes("ApplicationService") &&
      !content.includes("using Volo.Abp.Application.Services")
    ) {
      this.warnings.push(`C#模板 ${filePath} 可能缺少必要的using语句`)
    }
  }

  /**
   * 验证Vue语法
   */
  async validateVueSyntax(content, filePath) {
    // 检查Vue SFC结构
    const hasTemplate = content.includes("<template>")
    const hasScript = content.includes("<script")
    const hasStyle = content.includes("<style")

    if (!hasTemplate) {
      this.errors.push(`Vue模板 ${filePath} 缺少 <template> 部分`)
    }

    if (!hasScript) {
      this.warnings.push(`Vue模板 ${filePath} 缺少 <script> 部分`)
    }
  }

  /**
   * 验证TypeScript语法
   */
  async validateTypeScriptSyntax(content, filePath) {
    // 基础语法检查
    const braces = (content.match(/\{/g) || []).length - (content.match(/\}/g) || []).length
    if (braces !== 0) {
      this.errors.push(`TypeScript模板 ${filePath} 大括号不匹配`)
    }

    // 检查导入语句
    if (content.includes("defineStore") && !content.includes("from 'pinia'")) {
      this.warnings.push(`TypeScript模板 ${filePath} 可能缺少Pinia导入`)
    }
  }

  /**
   * 输出验证结果
   */
  outputResults() {
    console.log("\n📊 验证结果:")
    console.log(`✅ 成功: ${this.errors.length === 0 ? "通过" : "失败"}`)
    console.log(`❌ 错误: ${this.errors.length} 个`)
    console.log(`⚠️  警告: ${this.warnings.length} 个\n`)

    if (this.errors.length > 0) {
      console.log("❌ 错误详情:")
      this.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`)
      })
      console.log()
    }

    if (this.warnings.length > 0) {
      console.log("⚠️  警告详情:")
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`)
      })
      console.log()
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log("🎉 所有模板验证通过！")
    }
  }
}

// 运行验证
if (require.main === module) {
  const validator = new TemplateValidator()
  validator.validateAll().then((success) => {
    process.exit(success ? 0 : 1)
  })
}

module.exports = TemplateValidator
