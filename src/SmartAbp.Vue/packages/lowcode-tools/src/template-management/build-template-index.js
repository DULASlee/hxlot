#!/usr/bin/env node

/**
 * 构建模板索引脚本
 * 自动扫描templates目录，生成index.json文件
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

class TemplateIndexBuilder {
  constructor() {
    this.templatesDir = resolveTemplatesDir(__dirname)
    this.outputPath = path.join(this.templatesDir, "index.json")
    this.templates = []
    this.categories = {}
  }

  /**
   * 构建索引
   */
  async build() {
    console.log("🔨 开始构建模板索引...\n")

    try {
      // 扫描模板文件
      await this.scanTemplates()

      // 生成索引文件
      await this.generateIndex()

      console.log(`✅ 模板索引构建完成！`)
      console.log(`📁 输出文件: ${this.outputPath}`)
      console.log(`📊 共发现 ${this.templates.length} 个模板`)
    } catch (error) {
      console.error("❌ 构建索引时发生错误:", error.message)
      process.exit(1)
    }
  }

  /**
   * 扫描模板文件
   */
  async scanTemplates() {
    const templateFiles = this.findTemplateFiles(this.templatesDir)

    for (const filePath of templateFiles) {
      try {
        const template = await this.processTemplate(filePath)
        if (template) {
          this.templates.push(template)
        }
      } catch (error) {
        console.warn(`⚠️  处理模板文件失败: ${filePath} - ${error.message}`)
      }
    }

    console.log(`📋 扫描到 ${templateFiles.length} 个模板文件`)
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
        } else if (item.includes(".template.") && !item.includes(".meta.")) {
          files.push(fullPath)
        }
      }
    }

    scan(dir)
    return files
  }

  /**
   * 处理单个模板文件
   */
  async processTemplate(filePath) {
    const relativePath = path.relative(this.templatesDir, filePath)
    const metadataPath = this.getMetadataPath(filePath)

    // 读取模板内容
    const content = fs.readFileSync(filePath, "utf8")

    // 提取AI模板信息
    const aiInfo = this.extractAITemplateInfo(content)

    // 读取元数据
    let metadata = {}
    if (fs.existsSync(metadataPath)) {
      try {
        const metadataContent = fs.readFileSync(metadataPath, "utf8")
        metadata = yaml.load(metadataContent) || {}
      } catch (error) {
        console.warn(`⚠️  读取元数据失败: ${metadataPath}`)
      }
    }

    // 生成模板ID
    const templateId = this.generateTemplateId(relativePath)

    // 解析分类
    const category = this.parseCategory(relativePath)

    // 构建模板对象
    const template = {
      id: templateId,
      name: metadata.name || aiInfo.name || path.basename(filePath, path.extname(filePath)),
      path: `templates/${relativePath.split("\\").join("/")}`,
      metadata: fs.existsSync(metadataPath)
        ? `templates/${path.relative(this.templatesDir, metadataPath).split("\\").join("/")}`
        : null,
      category: category,
      type: this.extractType(relativePath),
      tags: metadata.tags || aiInfo.tags || [],
      scenarios: metadata.scenarios || aiInfo.scenarios || [],
      ai_triggers: metadata.ai_triggers || aiInfo.ai_triggers || [],
      dependencies: metadata.dependencies || aiInfo.dependencies || [],
      permissions_required: metadata.permissions_required || aiInfo.permissions_required || false,
      parameters: metadata.parameters || aiInfo.parameters || [],
    }

    // 更新分类信息
    this.updateCategories(category, metadata.description || aiInfo.description)

    return template
  }

  /**
   * 获取元数据文件路径
   */
  getMetadataPath(templatePath) {
    const dir = path.dirname(templatePath)
    const basename = path.basename(templatePath)
    const nameWithoutExt = basename.replace(/\.template\.[^.]+$/, "")
    return path.join(dir, `${nameWithoutExt}.template.meta.yml`)
  }

  /**
   * 提取AI模板信息
   */
  extractAITemplateInfo(content) {
    const info = {}

    // 提取AI_TEMPLATE_INFO注释块
    const aiInfoMatch = content.match(/AI_TEMPLATE_INFO[:\s]*\n([\s\S]*?)(?=\*\/|-->|###)/)
    if (aiInfoMatch) {
      const infoText = aiInfoMatch[1]

      // 解析各种信息
      info.name = this.extractInfoField(infoText, "模板类型")
      info.description = this.extractInfoField(infoText, "适用场景")
      info.dependencies = this.extractInfoArray(infoText, "依赖项")
      info.tags = this.extractInfoArray(infoText, "标签")
      info.permissions_required = infoText.includes("权限") || infoText.includes("permission")
    }

    return info
  }

  /**
   * 提取信息字段
   */
  extractInfoField(text, fieldName) {
    const regex = new RegExp(`${fieldName}[：:][\\s]*([^\\n]+)`, "i")
    const match = text.match(regex)
    return match ? match[1].trim() : null
  }

  /**
   * 提取信息数组
   */
  extractInfoArray(text, fieldName) {
    const field = this.extractInfoField(text, fieldName)
    if (!field) return []

    return field
      .split(/[ ,，、]/)
      .map((item) => item.trim())
      .filter((item) => item)
  }

  /**
   * 生成模板ID
   */
  generateTemplateId(relativePath) {
    return relativePath
      .split("\\")
      .join("-")
      .split("/")
      .join("-")
      .replace(/\.template\.[^.]+$/, "")
      .toLowerCase()
  }

  /**
   * 解析分类
   */
  parseCategory(relativePath) {
    const parts = relativePath.split(/[\\/]/)
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`
    }
    return parts[0] || "general"
  }

  /**
   * 提取类型
   */
  extractType(relativePath) {
    const filename = path.basename(relativePath)

    if (filename.includes("Service")) return "service"
    if (filename.includes("Component") || filename.includes("Management")) return "component"
    if (filename.includes("Store")) return "store"
    if (filename.includes("Dto")) return "dto"
    if (filename.includes("Interface")) return "interface"

    const ext = path.extname(filename)
    if (ext === ".vue") return "component"
    if (ext === ".ts") return "typescript"
    if (ext === ".cs") return "csharp"

    return "unknown"
  }

  /**
   * 更新分类信息
   */
  updateCategories(category, description) {
    const [main, sub] = category.split("/")

    if (!this.categories[main]) {
      this.categories[main] = {}
    }

    if (sub && !this.categories[main][sub]) {
      this.categories[main][sub] = description || sub
    }
  }

  /**
   * 生成索引文件
   */
  async generateIndex() {
    const index = {
      version: "1.0.0",
      description: "SmartAbp项目代码模板库索引",
      lastUpdated: new Date().toISOString(),
      templates: this.templates,
      categories: this.categories,
      ai_search_patterns: this.generateSearchPatterns(),
      naming_conventions: this.generateNamingConventions(),
      statistics: {
        total_templates: this.templates.length,
        categories_count: Object.keys(this.categories).length,
        backend_templates: this.templates.filter((t) => t.category.startsWith("backend")).length,
        frontend_templates: this.templates.filter((t) => t.category.startsWith("frontend")).length,
      },
    }

    // 写入文件
    fs.writeFileSync(this.outputPath, JSON.stringify(index, null, 2), "utf8")
  }

  /**
   * 生成搜索模式
   */
  generateSearchPatterns() {
    return {
      crud_service: "templates/**/*crud*service*.template.*",
      management_page: "templates/**/components/*management*.template.vue",
      entity_store: "templates/**/stores/*store*.template.ts",
      dto_objects: "templates/**/contracts/*dto*.template.cs",
      vue_components: "templates/frontend/components/*.template.vue",
      abp_services: "templates/backend/application/*.template.cs",
      interfaces: "templates/backend/contracts/*Interface*.template.cs",
    }
  }

  /**
   * 生成命名约定
   */
  generateNamingConventions() {
    return {
      backend: {
        appService: "{EntityName}AppService",
        dto: "{EntityName}Dto",
        createDto: "Create{EntityName}Dto",
        updateDto: "Update{EntityName}Dto",
        interface: "I{EntityName}AppService",
        getListDto: "Get{EntityName}ListDto",
      },
      frontend: {
        component: "{EntityName}Management.vue",
        store: "use{EntityName}Store",
        service: "{entityName}Service",
        types: "{entityName}.ts",
      },
      permissions: {
        group: "{ModuleName}",
        actions: ["Default", "Create", "Edit", "Delete"],
      },
    }
  }
}

// 运行构建
if (require.main === module) {
  const builder = new TemplateIndexBuilder()
  builder.build().catch((error) => {
    console.error("构建失败:", error)
    process.exit(1)
  })
}

module.exports = TemplateIndexBuilder
