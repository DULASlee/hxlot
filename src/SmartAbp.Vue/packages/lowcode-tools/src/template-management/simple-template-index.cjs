#!/usr/bin/env node

/**
 * 简化版模板索引构建脚本（CommonJS）
 */

const fs = require("fs")
const path = require("path")

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

class SimpleTemplateIndexBuilder {
  constructor() {
    this.templatesDir = resolveTemplatesDir(__dirname)
    this.outputPath = path.join(this.templatesDir, "index.json")
    this.templates = []
  }

  async build() {
    console.log("🔨 开始构建模板索引...\n")
    try {
      await this.scanTemplates()
      await this.generateIndex()
      console.log(`✅ 模板索引构建完成！`)
      console.log(`📁 输出文件: ${this.outputPath}`)
      console.log(`📊 共发现 ${this.templates.length} 个模板`)
    } catch (error) {
      console.error("❌ 构建索引时发生错误:", error.message)
      process.exit(1)
    }
  }

  async scanTemplates() {
    const templateFiles = this.findTemplateFiles(this.templatesDir)
    for (const filePath of templateFiles) {
      try {
        const template = await this.processTemplate(filePath)
        if (template) this.templates.push(template)
      } catch (error) {
        console.warn(`⚠️  处理模板文件失败: ${filePath} - ${error.message}`)
      }
    }
    console.log(`📋 扫描到 ${templateFiles.length} 个模板文件`)
  }

  findTemplateFiles(dir) {
    const files = []
    const scan = (currentDir) => {
      if (!fs.existsSync(currentDir)) return
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

  async processTemplate(filePath) {
    const relativePath = path.relative(this.templatesDir, filePath)
    const content = fs.readFileSync(filePath, "utf8")
    const aiInfo = this.extractAITemplateInfo(content)
    const templateId = this.generateTemplateId(relativePath)
    const category = this.parseCategory(relativePath)
    return {
      id: templateId,
      name: aiInfo.name || path.basename(filePath, path.extname(filePath)),
      path: `templates/${relativePath.replace(/\\/g, "/")}`,
      category: category,
      type: this.extractType(relativePath),
      tags: aiInfo.tags || [],
      scenarios: aiInfo.scenarios || [],
      ai_triggers: aiInfo.ai_triggers || [],
      dependencies: aiInfo.dependencies || [],
      permissions_required: aiInfo.permissions_required || false,
    }
  }

  extractAITemplateInfo(content) {
    const info = {
      tags: [],
      scenarios: [],
      ai_triggers: [],
      dependencies: [],
      permissions_required: false,
    }
    const aiInfoMatch = content.match(/AI_TEMPLATE_INFO[:\s]*\n([\s\S]*?)(?=\*\/|-->|###)/)
    if (aiInfoMatch) {
      const infoText = aiInfoMatch[1]
      info.name = this.extractInfoField(infoText, "模板类型")
      info.description = this.extractInfoField(infoText, "适用场景")
      if (infoText.includes("CRUD")) {
        info.tags.push("crud")
        info.ai_triggers.push("CRUD操作", "数据管理")
      }
      if (infoText.includes("Vue")) {
        info.tags.push("vue")
        info.dependencies.push("Vue 3")
      }
      if (infoText.includes("ABP")) {
        info.tags.push("abp")
        info.dependencies.push("ABP Framework")
      }
      if (infoText.includes("应用服务")) {
        info.ai_triggers.push("创建应用服务", "业务服务")
      }
      if (infoText.includes("管理")) {
        info.ai_triggers.push("管理页面", "管理组件")
      }
      if (infoText.includes("状态管理")) {
        info.ai_triggers.push("状态管理", "Pinia Store")
      }
      if (infoText.includes("权限") || infoText.includes("permission")) {
        info.permissions_required = true
      }
    }
    return info
  }

  extractInfoField(text, fieldName) {
    const regex = new RegExp(`${fieldName}[：:][\\s]*([^\\n]+)`, "i")
    const match = text.match(regex)
    return match ? match[1].trim() : null
  }

  generateTemplateId(relativePath) {
    return relativePath
      .replace(/\\/g, "-")
      .replace(/\//g, "-")
      .replace(/\.template\.[^.]+$/, "")
      .toLowerCase()
  }

  parseCategory(relativePath) {
    const parts = relativePath.split(/[\/\\]/)
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`
    return parts[0] || "general"
  }

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

  async generateIndex() {
    const index = {
      version: "1.0.0",
      description: "SmartAbp项目代码模板库索引",
      lastUpdated: new Date().toISOString(),
      templates: this.templates,
      categories: {
        backend: {
          application: "应用服务层",
          contracts: "契约层",
          domain: "领域层",
          httpapi: "HTTP API层",
          entityframework: "数据访问层",
        },
        frontend: {
          components: "Vue组件",
          views: "页面视图",
          stores: "状态管理",
          services: "API服务",
          composables: "组合式函数",
        },
        lowcode: { plugins: "插件开发", generators: "代码生成器", runtime: "运行时" },
      },
      ai_search_patterns: {
        crud_service: "templates/**/*crud*service*.template.*",
        management_page: "templates/**/components/*management*.template.vue",
        entity_store: "templates/**/stores/*store*.template.ts",
        dto_objects: "templates/**/contracts/*dto*.template.cs",
        vue_components: "templates/frontend/components/*.template.vue",
        abp_services: "templates/backend/application/*.template.cs",
      },
      naming_conventions: {
        backend: {
          appService: "{EntityName}AppService",
          dto: "{EntityName}Dto",
          createDto: "Create{EntityName}Dto",
          updateDto: "Update{EntityName}Dto",
          interface: "I{EntityName}AppService",
        },
        frontend: {
          component: "{EntityName}Management.vue",
          store: "use{EntityName}Store",
          service: "{entityName}Service",
          types: "{entityName}.ts",
        },
        permissions: { group: "{ModuleName}", actions: ["Default", "Create", "Edit", "Delete"] },
      },
      statistics: {
        total_templates: this.templates.length,
        backend_templates: this.templates.filter((t) => t.category.startsWith("backend")).length,
        frontend_templates: this.templates.filter((t) => t.category.startsWith("frontend")).length,
      },
    }
    fs.writeFileSync(this.outputPath, JSON.stringify(index, null, 2), "utf8")
  }
}

if (require.main === module) {
  const builder = new SimpleTemplateIndexBuilder()
  builder.build().catch((error) => {
    console.error("构建失败:", error)
    process.exit(1)
  })
}

module.exports = SimpleTemplateIndexBuilder
