#!/usr/bin/env node
/* eslint-disable */

/**
 * Enhanced Simple Template Index Builder with comprehensive error handling
 * 简化版模板索引构建脚本，不依赖外部包，使用原生Node.js API
 */

const fs = require("fs")
const path = require("path")

/**
 * Custom error class for simple template index builder errors
 */
class SimpleTemplateIndexBuilderError extends Error {
  constructor(message, code, operation, retryable = false, details = {}) {
    super(message)
    this.name = "SimpleTemplateIndexBuilderError"
    this.code = code
    this.operation = operation
    this.retryable = retryable
    this.details = details
  }
}

/**
 * Error handling utilities
 */
const logError = (operation, error, context = {}) => {
  console.error(`[SimpleTemplateIndexBuilder] ${operation} failed:`, {
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
    context,
    timestamp: new Date().toISOString(),
  })
}

const logWarning = (operation, message, context = {}) => {
  console.warn(`[SimpleTemplateIndexBuilder] ${operation}:`, {
    message,
    context,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Input validation utilities
 */
const validateString = (value, fieldName, allowEmpty = false) => {
  if (typeof value !== "string") {
    throw new SimpleTemplateIndexBuilderError(
      `${fieldName} must be a string`,
      "VALIDATION_ERROR",
      "validateString",
      false,
      { field: fieldName, value, type: typeof value },
    )
  }

  if (!allowEmpty && value.trim() === "") {
    throw new SimpleTemplateIndexBuilderError(
      `${fieldName} cannot be empty`,
      "VALIDATION_ERROR",
      "validateString",
      false,
      { field: fieldName, value },
    )
  }

  return value
}

const validateObject = (value, fieldName) => {
  if (typeof value !== "object" || value === null) {
    throw new SimpleTemplateIndexBuilderError(
      `${fieldName} must be an object`,
      "VALIDATION_ERROR",
      "validateObject",
      false,
      { field: fieldName, value, type: typeof value },
    )
  }
  return value
}

const validateArray = (value, fieldName) => {
  if (!Array.isArray(value)) {
    throw new SimpleTemplateIndexBuilderError(
      `${fieldName} must be an array`,
      "VALIDATION_ERROR",
      "validateArray",
      false,
      { field: fieldName, value, type: typeof value },
    )
  }
  return value
}

/**
 * Safe file system operations with error handling
 */
const safeFileExists = (filePath, operation) => {
  try {
    return fs.existsSync(filePath)
  } catch (error) {
    logError(`${operation}.fileExists`, error, { filePath })
    return false
  }
}

const safeReadFile = (filePath, encoding = "utf8", operation) => {
  try {
    return fs.readFileSync(filePath, encoding)
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new SimpleTemplateIndexBuilderError(
        `File not found: ${filePath}`,
        "FILE_NOT_FOUND",
        operation,
        false,
        { filePath },
      )
    }
    throw new SimpleTemplateIndexBuilderError(
      `Failed to read file: ${error.message}`,
      "FILE_READ_ERROR",
      operation,
      true,
      { filePath, error: error.message },
    )
  }
}

const safeWriteFile = (filePath, content, encoding = "utf8", operation) => {
  try {
    fs.writeFileSync(filePath, content, encoding)
    return true
  } catch (error) {
    throw new SimpleTemplateIndexBuilderError(
      `Failed to write file: ${error.message}`,
      "FILE_WRITE_ERROR",
      operation,
      true,
      { filePath, error: error.message },
    )
  }
}

const safeStat = (filePath, operation) => {
  try {
    return fs.statSync(filePath)
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new SimpleTemplateIndexBuilderError(
        `File not found: ${filePath}`,
        "FILE_NOT_FOUND",
        operation,
        false,
        { filePath },
      )
    }
    throw new SimpleTemplateIndexBuilderError(
      `Failed to stat file: ${error.message}`,
      "FILE_STAT_ERROR",
      operation,
      true,
      { filePath, error: error.message },
    )
  }
}

const safeReadDir = (dirPath, operation) => {
  try {
    return fs.readdirSync(dirPath)
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new SimpleTemplateIndexBuilderError(
        `Directory not found: ${dirPath}`,
        "DIRECTORY_NOT_FOUND",
        operation,
        false,
        { dirPath },
      )
    }
    throw new SimpleTemplateIndexBuilderError(
      `Failed to read directory: ${error.message}`,
      "DIRECTORY_READ_ERROR",
      operation,
      true,
      { dirPath, error: error.message },
    )
  }
}

/**
 * Retry mechanism for operations
 */
const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (error.retryable && attempt < maxRetries) {
        logWarning("retryOperation", `Attempt ${attempt} failed, retrying in ${delay}ms`, {
          error: error.message,
          attempt,
          maxRetries,
        })
        await new Promise((resolve) => setTimeout(resolve, delay))
        delay *= 2 // Exponential backoff
      } else {
        throw error
      }
    }
  }

  throw lastError
}

/**
 * Enhanced templates directory resolution with error handling
 */
function resolveTemplatesDir(startDir) {
  let currentDir = startDir

  try {
    for (let i = 0; i < 10; i++) {
      const candidate = path.join(currentDir, "templates")

      try {
        if (safeFileExists(candidate, "resolveTemplatesDir")) {
          const stat = safeStat(candidate, "resolveTemplatesDir")
          if (stat.isDirectory()) {
            logWarning("resolveTemplatesDir", `Found templates directory at: ${candidate}`)
            return candidate
          }
        }
      } catch (error) {
        logWarning("resolveTemplatesDir", `Failed to check candidate directory: ${candidate}`, {
          error: error.message,
        })
      }

      const parent = path.dirname(currentDir)
      if (parent === currentDir) break
      currentDir = parent
    }
  } catch (error) {
    logError("resolveTemplatesDir", error, { startDir })
  }

  // Fallback to cwd/templates
  const fallback = path.resolve(process.cwd(), "templates")
  logWarning("resolveTemplatesDir", `Using fallback templates directory: ${fallback}`)
  return fallback
}

/**
 * Enhanced SimpleTemplateIndexBuilder class with comprehensive error handling
 */
class SimpleTemplateIndexBuilder {
  constructor(options = {}) {
    try {
      this.options = {
        maxRetries: options.maxRetries || 3,
        retryDelay: options.retryDelay || 1000,
        validateTemplates: options.validateTemplates !== false,
        generateStats: options.generateStats !== false,
        backupExisting: options.backupExisting !== false,
        ...options,
      }

      this.templatesDir = resolveTemplatesDir(__dirname)
      this.outputPath = path.join(this.templatesDir, "index.json")
      this.templates = []
      this.stats = {
        templatesProcessed: 0,
        templatesSuccessful: 0,
        templatesFailed: 0,
        filesScanned: 0,
        startTime: Date.now(),
      }
      this.errors = []

      logWarning("constructor", "SimpleTemplateIndexBuilder initialized", {
        templatesDir: this.templatesDir,
        options: this.options,
      })
    } catch (error) {
      logError("constructor", error)
      throw new SimpleTemplateIndexBuilderError(
        "Failed to initialize SimpleTemplateIndexBuilder",
        "INITIALIZATION_ERROR",
        "constructor",
        false,
        { error: error.message },
      )
    }
  }

  /**
   * Enhanced build with comprehensive error handling
   */
  async build() {
    try {
      console.log("🔨 开始构建模板索引...\n")

      // Validate templates directory
      if (!safeFileExists(this.templatesDir, "build")) {
        throw new SimpleTemplateIndexBuilderError(
          `Templates directory does not exist: ${this.templatesDir}`,
          "TEMPLATES_DIR_NOT_FOUND",
          "build",
          false,
          { templatesDir: this.templatesDir },
        )
      }

      // Backup existing index if requested
      if (this.options.backupExisting && safeFileExists(this.outputPath, "build")) {
        await this.backupExistingIndex()
      }

      // Scan template files
      await this.scanTemplates()

      // Generate index file
      await this.generateIndex()

      // Generate summary report
      this.generateSummaryReport()

      console.log(`✅ 模板索引构建完成！`)
      console.log(`📁 输出文件: ${this.outputPath}`)
      console.log(`📊 共发现 ${this.templates.length} 个模板`)

      if (this.stats.templatesFailed > 0) {
        console.log(`⚠️  ${this.stats.templatesFailed} 个模板处理失败`)
      }
    } catch (error) {
      if (error instanceof SimpleTemplateIndexBuilderError) {
        console.error("❌", error.message)
        if (error.details) {
          console.error("📋 错误详情:", JSON.stringify(error.details, null, 2))
        }
      } else {
        logError("build", error)
        console.error("❌ 构建索引时发生错误:", error.message)
      }
      process.exit(1)
    }
  }

  /**
   * Backup existing index file
   */
  async backupExistingIndex() {
    try {
      const backupPath = `${this.outputPath}.${Date.now()}.backup`
      const content = safeReadFile(this.outputPath, "utf8", "backupExistingIndex")
      safeWriteFile(backupPath, content, "utf8", "backupExistingIndex")
      logWarning("backupExistingIndex", `Existing index backed up to: ${backupPath}`)
    } catch (error) {
      logWarning("backupExistingIndex", "Failed to backup existing index", {
        error: error.message,
      })
    }
  }

  /**
   * Enhanced template scanning with comprehensive error handling
   */
  async scanTemplates() {
    try {
      console.log("🔍 开始扫描模板文件...")

      const templateFiles = await this.findTemplateFiles(this.templatesDir)
      this.stats.filesScanned = templateFiles.length

      console.log(`📋 扫描到 ${templateFiles.length} 个模板文件`)

      // Process templates with concurrency control
      const batchSize = 10
      for (let i = 0; i < templateFiles.length; i += batchSize) {
        const batch = templateFiles.slice(i, i + batchSize)
        await Promise.all(batch.map((filePath) => this.processTemplateWithErrorHandling(filePath)))
      }

      console.log(
        `✅ 模板扫描完成: ${this.stats.templatesSuccessful} 成功, ${this.stats.templatesFailed} 失败`,
      )
    } catch (error) {
      logError("scanTemplates", error)
      throw new SimpleTemplateIndexBuilderError(
        `Failed to scan templates: ${error.message}`,
        "SCAN_TEMPLATES_ERROR",
        "scanTemplates",
        true,
        { error: error.message },
      )
    }
  }

  /**
   * Process template with error handling wrapper
   */
  async processTemplateWithErrorHandling(filePath) {
    try {
      this.stats.templatesProcessed++

      const template = await this.processTemplate(filePath)
      if (template) {
        this.templates.push(template)
        this.stats.templatesSuccessful++
      }
    } catch (error) {
      this.stats.templatesFailed++
      this.errors.push({
        file: filePath,
        error: error.message,
        timestamp: new Date().toISOString(),
      })

      logWarning("processTemplateWithErrorHandling", "Failed to process template file", {
        filePath,
        error: error.message,
      })
    }
  }

  /**
   * Enhanced find template files with comprehensive error handling
   */
  async findTemplateFiles(dir) {
    try {
      validateString(dir, "directory path")

      const files = []

      const scan = async (currentDir) => {
        try {
          validateString(currentDir, "current directory")

          if (!safeFileExists(currentDir, "findTemplateFiles.scan")) {
            logWarning("findTemplateFiles.scan", "Directory does not exist, skipping", {
              currentDir,
            })
            return
          }

          const items = safeReadDir(currentDir, "findTemplateFiles.scan")

          for (const item of items) {
            try {
              validateString(item, "directory item")

              const fullPath = path.join(currentDir, item)
              const stat = safeStat(fullPath, "findTemplateFiles.scan.stat")

              if (stat.isDirectory()) {
                await scan(fullPath)
              } else if (item.includes(".template.") && !item.includes(".meta.")) {
                files.push(fullPath)
              }
            } catch (itemError) {
              logWarning("findTemplateFiles.scan.item", "Failed to process directory item", {
                item,
                currentDir,
                error: itemError.message,
              })
            }
          }
        } catch (scanError) {
          logWarning("findTemplateFiles.scan", "Failed to scan directory", {
            currentDir,
            error: scanError.message,
          })
        }
      }

      await scan(dir)
      return files
    } catch (error) {
      logError("findTemplateFiles", error, { dir })
      throw new SimpleTemplateIndexBuilderError(
        `Failed to find template files: ${error.message}`,
        "FIND_TEMPLATE_FILES_ERROR",
        "findTemplateFiles",
        true,
        { dir, error: error.message },
      )
    }
  }

  /**
   * Enhanced process template with comprehensive error handling
   */
  async processTemplate(filePath) {
    try {
      validateString(filePath, "file path")

      const relativePath = path.relative(this.templatesDir, filePath)

      // Validate file exists
      if (!safeFileExists(filePath, "processTemplate")) {
        throw new SimpleTemplateIndexBuilderError(
          `Template file does not exist: ${filePath}`,
          "TEMPLATE_FILE_NOT_FOUND",
          "processTemplate",
          false,
          { filePath },
        )
      }

      // Read template content with retry
      const content = await retryOperation(
        () => safeReadFile(filePath, "utf8", "processTemplate"),
        this.options.maxRetries,
        this.options.retryDelay,
      )

      // Extract AI template info
      const aiInfo = this.extractAITemplateInfo(content)

      // Generate template ID
      const templateId = this.generateTemplateId(relativePath)
      validateString(templateId, "template ID")

      // Parse category
      const category = this.parseCategory(relativePath)
      validateString(category, "category")

      // Extract type
      const type = this.extractType(relativePath)
      validateString(type, "type")

      // Build template object with validation
      const template = {
        id: templateId,
        name: aiInfo.name || path.basename(filePath, path.extname(filePath)),
        path: `templates/${relativePath.split("\\").join("/")}`,
        category: category,
        type: type,
        tags: validateArray(aiInfo.tags || [], "tags"),
        scenarios: validateArray(aiInfo.scenarios || [], "scenarios"),
        ai_triggers: validateArray(aiInfo.ai_triggers || [], "ai_triggers"),
        dependencies: validateArray(aiInfo.dependencies || [], "dependencies"),
        permissions_required: aiInfo.permissions_required || false,
      }

      logWarning("processTemplate", "Template processed successfully", {
        templateId,
        filePath,
        category,
        type,
      })

      return template
    } catch (error) {
      logError("processTemplate", error, { filePath })
      if (error instanceof SimpleTemplateIndexBuilderError) {
        throw error
      } else {
        throw new SimpleTemplateIndexBuilderError(
          `Failed to process template: ${error.message}`,
          "PROCESS_TEMPLATE_ERROR",
          "processTemplate",
          true,
          { filePath, error: error.message },
        )
      }
    }
  }

  /**
   * Enhanced extract AI template info with comprehensive error handling
   */
  extractAITemplateInfo(content) {
    try {
      validateString(content, "template content")

      const info = {
        tags: [],
        scenarios: [],
        ai_triggers: [],
        dependencies: [],
        permissions_required: false,
      }

      // Extract AI_TEMPLATE_INFO comment block
      const aiInfoMatch = content.match(/AI_TEMPLATE_INFO[:\s]*\n([\s\S]*?)(?=\*\/|-->|###)/)
      if (aiInfoMatch) {
        const infoText = aiInfoMatch[1]

        // Parse various information
        info.name = this.extractInfoField(infoText, "模板类型")
        info.description = this.extractInfoField(infoText, "适用场景")

        // Infer information based on content
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

      logWarning("extractAITemplateInfo", "AI template info extracted", {
        hasInfo: !!aiInfoMatch,
        name: info.name,
        tagsCount: info.tags.length,
      })

      return info
    } catch (error) {
      logError("extractAITemplateInfo", error)
      if (error instanceof SimpleTemplateIndexBuilderError) {
        throw error
      } else {
        throw new SimpleTemplateIndexBuilderError(
          `Failed to extract AI template info: ${error.message}`,
          "EXTRACT_AI_INFO_ERROR",
          "extractAITemplateInfo",
          false,
          { error: error.message },
        )
      }
    }
  }

  /**
   * Extract information field
   */
  extractInfoField(text, fieldName) {
    try {
      validateString(text, "text content")
      validateString(fieldName, "field name")

      const regex = new RegExp(`${fieldName}[：:][\\s]*([^\\n]+)`, "i")
      const match = text.match(regex)
      const result = match ? match[1].trim() : null

      if (result) {
        validateString(result, "extracted field", true)
      }

      return result
    } catch (error) {
      logError("extractInfoField", error, { fieldName })
      return null
    }
  }

  /**
   * Generate template ID
   */
  generateTemplateId(relativePath) {
    try {
      validateString(relativePath, "relative path")

      return relativePath
        .split("\\")
        .join("-")
        .split("/")
        .join("-")
        .replace(/\.template\.[^.]+$/, "")
        .toLowerCase()
    } catch (error) {
      logError("generateTemplateId", error, { relativePath })
      return "unknown-template"
    }
  }

  /**
   * Parse category from relative path
   */
  parseCategory(relativePath) {
    try {
      validateString(relativePath, "relative path")

      const parts = relativePath.split(/[\\/]/)
      if (parts.length >= 2) {
        return `${parts[0]}/${parts[1]}`
      }
      return parts[0] || "general"
    } catch (error) {
      logError("parseCategory", error, { relativePath })
      return "general"
    }
  }

  /**
   * Extract type from relative path
   */
  extractType(relativePath) {
    try {
      validateString(relativePath, "relative path")

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
    } catch (error) {
      logError("extractType", error, { relativePath })
      return "unknown"
    }
  }

  /**
   * Enhanced generate index with comprehensive error handling
   */
  async generateIndex() {
    try {
      console.log("📝 开始生成索引文件...")

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
          lowcode: {
            plugins: "插件开发",
            generators: "代码生成器",
            runtime: "运行时",
          },
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
          permissions: {
            group: "{ModuleName}",
            actions: ["Default", "Create", "Edit", "Delete"],
          },
        },
        statistics: {
          total_templates: this.templates.length,
          backend_templates: this.templates.filter((t) => t.category.startsWith("backend")).length,
          frontend_templates: this.templates.filter((t) => t.category.startsWith("frontend"))
            .length,
          processing_stats: {
            total_processed: this.stats.templatesProcessed,
            successful: this.stats.templatesSuccessful,
            failed: this.stats.templatesFailed,
            success_rate:
              this.stats.templatesProcessed > 0
                ? Math.round((this.stats.templatesSuccessful / this.stats.templatesProcessed) * 100)
                : 0,
          },
        },
        build_info: {
          builder_version: "1.0.0",
          build_time: new Date().toISOString(),
          options: this.options,
        },
      }

      // Validate index structure
      validateObject(index, "index")
      validateArray(index.templates, "templates")

      // Write index file with retry
      await retryOperation(
        () => {
          const content = JSON.stringify(index, null, 2)
          return safeWriteFile(this.outputPath, content, "utf8", "generateIndex")
        },
        this.options.maxRetries,
        this.options.retryDelay,
      )

      logWarning("generateIndex", "Index file generated successfully", {
        templatesCount: this.templates.length,
        outputPath: this.outputPath,
      })
    } catch (error) {
      logError("generateIndex", error)
      throw new SimpleTemplateIndexBuilderError(
        `Failed to generate index: ${error.message}`,
        "GENERATE_INDEX_ERROR",
        "generateIndex",
        true,
        { error: error.message },
      )
    }
  }

  /**
   * Generate summary report
   */
  generateSummaryReport() {
    try {
      const duration = Date.now() - this.stats.startTime

      console.log("\n📊 构建摘要报告:")
      console.log(`⏱️  总耗时: ${duration}ms`)
      console.log(`📁 扫描文件数: ${this.stats.filesScanned}`)
      console.log(`📋 处理模板数: ${this.stats.templatesProcessed}`)
      console.log(`✅ 成功模板数: ${this.stats.templatesSuccessful}`)
      console.log(`❌ 失败模板数: ${this.stats.templatesFailed}`)
      console.log(
        `📈 成功率: ${this.stats.templatesProcessed > 0 ? Math.round((this.stats.templatesSuccessful / this.stats.templatesProcessed) * 100) : 0}%`,
      )

      if (this.errors.length > 0) {
        console.log(`\n⚠️  错误详情 (${this.errors.length} 个):`)
        this.errors.slice(0, 10).forEach((error, index) => {
          console.log(`  ${index + 1}. ${error.file}: ${error.error}`)
        })

        if (this.errors.length > 10) {
          console.log(`  ... 还有 ${this.errors.length - 10} 个错误`)
        }
      }

      // Log category distribution
      const categoryStats = {}
      this.templates.forEach((template) => {
        const mainCategory = template.category.split("/")[0]
        categoryStats[mainCategory] = (categoryStats[mainCategory] || 0) + 1
      })

      console.log(`\n📂 分类分布:`)
      Object.entries(categoryStats).forEach(([category, count]) => {
        console.log(`  - ${category}: ${count} 个模板`)
      })
    } catch (error) {
      logError("generateSummaryReport", error)
    }
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      ...this.stats,
      duration: Date.now() - this.stats.startTime,
      errorsCount: this.errors.length,
    }
  }

  /**
   * Get error details
   */
  getErrors() {
    return [...this.errors]
  }

  /**
   * Reset builder state
   */
  reset() {
    this.templates = []
    this.stats = {
      templatesProcessed: 0,
      templatesSuccessful: 0,
      templatesFailed: 0,
      filesScanned: 0,
      startTime: Date.now(),
    }
    this.errors = []

    logWarning("reset", "SimpleTemplateIndexBuilder state reset")
  }
}

/**
 * Enhanced CLI execution with comprehensive error handling
 */
async function main() {
  const args = process.argv.slice(2)
  const options = {}

  // Parse command line options
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === "--backup" || arg === "-b") {
      options.backupExisting = true
    } else if (arg === "--validate" || arg === "-v") {
      options.validateTemplates = true
    } else if (arg === "--no-stats") {
      options.generateStats = false
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
🔨 SmartAbp 简化版模板索引构建工具

用法:
  node simple-template-index.js [选项]

选项:
  --backup, -b     备份现有索引文件
  --validate, -v   验证模板文件
  --no-stats       不生成统计信息
  --help, -h       显示帮助信息

示例:
  node simple-template-index.js --backup --validate
      `)
      return
    }
  }

  try {
    const builder = new SimpleTemplateIndexBuilder(options)
    await builder.build()

    // Show final statistics
    const stats = builder.getStats()
    console.log(`\n🎯 构建完成!`)
    console.log(
      `📊 统计信息: 成功 ${stats.templatesSuccessful}, 失败 ${stats.templatesFailed}, 总计 ${stats.templatesProcessed}`,
    )
  } catch (error) {
    if (error instanceof SimpleTemplateIndexBuilderError) {
      console.error(`\n❌ ${error.message}`)
      if (error.details) {
        console.error("📋 错误详情:", JSON.stringify(error.details, null, 2))
      }
    } else {
      logError("main", error)
      console.error(`\n💥 未处理的错误:`, error.message)
      if (error.stack) {
        console.error("📋 错误堆栈:", error.stack)
      }
    }
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("\n💥 未处理的错误:", error)
    if (error.stack) {
      console.error("📋 错误堆栈:", error.stack)
    }
    process.exit(1)
  })
}

module.exports = {
  SimpleTemplateIndexBuilder,
  SimpleTemplateIndexBuilderError,
}
