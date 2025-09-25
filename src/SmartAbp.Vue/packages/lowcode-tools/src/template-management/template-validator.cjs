#!/usr/bin/env node
/* eslint-disable */

/**
 * Enhanced Template Validator with comprehensive error handling
 * 用于验证模板文件的完整性和正确性
 */

const fs = require("fs")
const path = require("path")
const yaml = require("js-yaml")

/**
 * Custom error class for template validation errors
 */
class TemplateValidationError extends Error {
  constructor(message, code, operation, retryable = false, details = {}) {
    super(message)
    this.name = "TemplateValidationError"
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
  console.error(`[TemplateValidator] ${operation} failed:`, {
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
  console.warn(`[TemplateValidator] ${operation}:`, {
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
    throw new TemplateValidationError(
      `${fieldName} must be a string`,
      "VALIDATION_ERROR",
      "validateString",
      false,
      { field: fieldName, value, type: typeof value },
    )
  }

  if (!allowEmpty && value.trim() === "") {
    throw new TemplateValidationError(
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
    throw new TemplateValidationError(
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
    throw new TemplateValidationError(
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
      throw new TemplateValidationError(
        `File not found: ${filePath}`,
        "FILE_NOT_FOUND",
        operation,
        false,
        { filePath },
      )
    }
    throw new TemplateValidationError(
      `Failed to read file: ${error.message}`,
      "FILE_READ_ERROR",
      operation,
      true,
      { filePath, error: error.message },
    )
  }
}

const safeParseJSON = (content, filePath, operation) => {
  try {
    return JSON.parse(content)
  } catch (error) {
    throw new TemplateValidationError(
      `Invalid JSON in ${filePath}: ${error.message}`,
      "JSON_PARSE_ERROR",
      operation,
      false,
      { filePath, error: error.message },
    )
  }
}

const safeParseYAML = (content, filePath, operation) => {
  try {
    return yaml.load(content)
  } catch (error) {
    throw new TemplateValidationError(
      `Invalid YAML in ${filePath}: ${error.message}`,
      "YAML_PARSE_ERROR",
      operation,
      false,
      { filePath, error: error.message },
    )
  }
}

const safeStat = (filePath, operation) => {
  try {
    return fs.statSync(filePath)
  } catch (error) {
    logError(`${operation}.stat`, error, { filePath })
    return null
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
          if (stat && stat.isDirectory()) {
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
 * Enhanced TemplateValidator class with comprehensive error handling
 */
class TemplateValidator {
  constructor(options = {}) {
    try {
      this.options = {
        maxRetries: options.maxRetries || 3,
        retryDelay: options.retryDelay || 1000,
        strictMode: options.strictMode || false,
        skipSyntaxValidation: options.skipSyntaxValidation || false,
        ...options,
      }

      this.templatesDir = resolveTemplatesDir(__dirname)
      this.errors = []
      this.warnings = []
      this.stats = {
        templatesProcessed: 0,
        filesProcessed: 0,
        syntaxChecks: 0,
        startTime: Date.now(),
      }

      logWarning("constructor", "TemplateValidator initialized", {
        templatesDir: this.templatesDir,
        options: this.options,
      })
    } catch (error) {
      logError("constructor", error)
      throw new TemplateValidationError(
        "Failed to initialize TemplateValidator",
        "INITIALIZATION_ERROR",
        "constructor",
        false,
        { error: error.message },
      )
    }
  }

  /**
   * Enhanced validation with retry mechanism and comprehensive error handling
   */
  async validateAll() {
    console.log("🔍 开始验证模板库...")
    console.log(`📁 模板目录: ${this.templatesDir}`)
    console.log(`⚙️  配置: ${JSON.stringify(this.options, null, 2)}\n`)

    try {
      // Validate templates directory exists
      if (!safeFileExists(this.templatesDir, "validateAll")) {
        throw new TemplateValidationError(
          `Templates directory does not exist: ${this.templatesDir}`,
          "DIRECTORY_NOT_FOUND",
          "validateAll",
          false,
          { templatesDir: this.templatesDir },
        )
      }

      // Validate index file with retry
      await retryOperation(
        async () => this.validateIndex(),
        this.options.maxRetries,
        this.options.retryDelay,
      )

      // Validate template files with retry
      await retryOperation(
        async () => this.validateTemplates(),
        this.options.maxRetries,
        this.options.retryDelay,
      )

      // Output comprehensive results
      this.outputResults()

      return this.errors.length === 0
    } catch (error) {
      logError("validateAll", error)
      console.error("❌ 验证过程中发生错误:", error.message)

      if (error.details) {
        console.error("📋 错误详情:", JSON.stringify(error.details, null, 2))
      }

      return false
    }
  }

  /**
   * Enhanced index validation with comprehensive error handling
   */
  async validateIndex() {
    const indexPath = path.join(this.templatesDir, "index.json")

    try {
      validateString(indexPath, "indexPath")

      if (!safeFileExists(indexPath, "validateIndex")) {
        throw new TemplateValidationError(
          `Missing template index file: templates/index.json`,
          "INDEX_FILE_NOT_FOUND",
          "validateIndex",
          false,
          { indexPath },
        )
      }

      const indexContent = safeReadFile(indexPath, "utf8", "validateIndex")
      const indexData = safeParseJSON(indexContent, indexPath, "validateIndex")

      validateObject(indexData, "indexData")
      validateArray(indexData.templates, "indexData.templates")

      // Validate each template entry
      for (let i = 0; i < indexData.templates.length; i++) {
        const template = indexData.templates[i]
        try {
          await this.validateTemplateEntry(template, i)
        } catch (error) {
          logError("validateTemplateEntry", error, { templateIndex: i, template })
          this.errors.push(`Template entry ${i}: ${error.message}`)
        }
      }

      this.stats.templatesProcessed = indexData.templates.length
      console.log("✅ 索引文件验证通过")
    } catch (error) {
      if (error instanceof TemplateValidationError) {
        this.errors.push(error.message)
      } else {
        this.errors.push(`索引文件验证错误: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Enhanced template entry validation with comprehensive error handling
   */
  async validateTemplateEntry(template, index) {
    try {
      validateObject(template, "template")

      const required = ["id", "name", "path", "category", "type"]

      for (const field of required) {
        if (!template[field]) {
          throw new TemplateValidationError(
            `Template ${template.id || `index_${index}`} missing required field: ${field}`,
            "MISSING_REQUIRED_FIELD",
            "validateTemplateEntry",
            false,
            { template, missingField: field },
          )
        }
      }

      // Validate template file exists
      if (template.path) {
        const templatePath = path.join(this.templatesDir, template.path.replace(/^templates\//, ""))

        if (!safeFileExists(templatePath, "validateTemplateEntry")) {
          throw new TemplateValidationError(
            `Template file does not exist: ${template.path}`,
            "TEMPLATE_FILE_NOT_FOUND",
            "validateTemplateEntry",
            false,
            { templatePath, templatePath: template.path },
          )
        }
      }

      // Validate metadata file exists and is valid (if declared)
      if (template.metadata) {
        const metadataPath = path.join(
          this.templatesDir,
          template.metadata.replace(/^templates\//, ""),
        )

        if (!safeFileExists(metadataPath, "validateTemplateEntry")) {
          throw new TemplateValidationError(
            `Metadata file does not exist: ${template.metadata}`,
            "METADATA_FILE_NOT_FOUND",
            "validateTemplateEntry",
            false,
            { metadataPath, metadataPath: template.metadata },
          )
        }

        await this.validateMetadata(metadataPath, template.id)
      }
    } catch (error) {
      if (error instanceof TemplateValidationError) {
        throw error
      } else {
        throw new TemplateValidationError(
          `Template entry validation failed: ${error.message}`,
          "TEMPLATE_ENTRY_VALIDATION_ERROR",
          "validateTemplateEntry",
          false,
          { template, index, error: error.message },
        )
      }
    }
  }

  /**
   * Enhanced metadata validation with comprehensive error handling
   */
  async validateMetadata(metadataPath, templateId) {
    try {
      validateString(metadataPath, "metadataPath")
      validateString(templateId, "templateId")

      const content = safeReadFile(metadataPath, "utf8", "validateMetadata")
      const metadata = safeParseYAML(content, metadataPath, "validateMetadata")

      validateObject(metadata, "metadata")

      const recommended = ["name", "category", "description", "parameters"]

      for (const field of recommended) {
        if (!metadata[field]) {
          this.warnings.push(`Template ${templateId} metadata missing recommended field: ${field}`)
        }
      }

      // Validate parameters definition
      if (metadata.parameters) {
        validateArray(metadata.parameters, "metadata.parameters")

        for (let i = 0; i < metadata.parameters.length; i++) {
          const param = metadata.parameters[i]

          if (!param.name || !param.type) {
            throw new TemplateValidationError(
              `Template ${templateId} parameter definition incomplete at index ${i}`,
              "INCOMPLETE_PARAMETER_DEFINITION",
              "validateMetadata",
              false,
              { templateId, parameterIndex: i, parameter: param },
            )
          }
        }
      }
    } catch (error) {
      if (error instanceof TemplateValidationError) {
        throw error
      } else {
        throw new TemplateValidationError(
          `Metadata validation failed for ${metadataPath}: ${error.message}`,
          "METADATA_VALIDATION_ERROR",
          "validateMetadata",
          false,
          { metadataPath, templateId, error: error.message },
        )
      }
    }
  }

  /**
   * Enhanced template files validation with comprehensive error handling
   */
  async validateTemplates() {
    try {
      const templateFiles = this.findTemplateFiles(this.templatesDir)

      if (templateFiles.length === 0) {
        logWarning("validateTemplates", "No template files found")
        return
      }

      console.log(`🔍 找到 ${templateFiles.length} 个模板文件`)

      for (let i = 0; i < templateFiles.length; i++) {
        const filePath = templateFiles[i]
        try {
          await this.validateTemplateFile(filePath)
          this.stats.filesProcessed++

          // Progress indicator
          if ((i + 1) % 10 === 0) {
            console.log(`📈 进度: ${i + 1}/${templateFiles.length}`)
          }
        } catch (error) {
          logError("validateTemplateFile", error, { filePath, fileIndex: i })
          this.errors.push(`Template file ${filePath}: ${error.message}`)
        }
      }

      console.log(`✅ 验证了 ${this.stats.filesProcessed} 个模板文件`)
    } catch (error) {
      throw new TemplateValidationError(
        `Template files validation failed: ${error.message}`,
        "TEMPLATE_FILES_VALIDATION_ERROR",
        "validateTemplates",
        false,
        { error: error.message },
      )
    }
  }

  /**
   * Enhanced template file discovery with error handling
   */
  findTemplateFiles(dir) {
    const files = []

    try {
      validateString(dir, "dir")

      const scan = (currentDir) => {
        try {
          const items = fs.readdirSync(currentDir)

          for (const item of items) {
            const fullPath = path.join(currentDir, item)

            try {
              const stat = safeStat(fullPath, "findTemplateFiles")
              if (!stat) continue

              if (stat.isDirectory()) {
                scan(fullPath)
              } else if (item.includes(".template.")) {
                files.push(fullPath)
              }
            } catch (itemError) {
              logWarning("findTemplateFiles", `Failed to process item: ${item}`, {
                error: itemError.message,
                fullPath,
              })
            }
          }
        } catch (scanError) {
          logWarning("findTemplateFiles", `Failed to scan directory: ${currentDir}`, {
            error: scanError.message,
          })
        }
      }

      scan(dir)
    } catch (error) {
      throw new TemplateValidationError(
        `Failed to find template files: ${error.message}`,
        "FIND_TEMPLATE_FILES_ERROR",
        "findTemplateFiles",
        false,
        { dir, error: error.message },
      )
    }

    return files
  }

  /**
   * Enhanced individual template file validation with comprehensive error handling
   */
  async validateTemplateFile(filePath) {
    try {
      validateString(filePath, "filePath")

      const content = safeReadFile(filePath, "utf8", "validateTemplateFile")
      const relativePath = path.relative(this.templatesDir, filePath)

      validateString(relativePath, "relativePath")

      // Check for AI template info
      if (!content.includes("AI_TEMPLATE_INFO")) {
        this.warnings.push(`Template ${relativePath} missing AI_TEMPLATE_INFO comment`)
      }

      // Check for parameter placeholders
      const placeholders = content.match(/\{\{[^}]+\}\}/g) || []
      if (placeholders.length === 0) {
        this.warnings.push(`Template ${relativePath} has no parameter placeholders`)
      }

      // Syntax validation (if enabled)
      if (!this.options.skipSyntaxValidation) {
        await this.validateTemplateSyntax(content, filePath, relativePath)
      }
    } catch (error) {
      if (error instanceof TemplateValidationError) {
        throw error
      } else {
        throw new TemplateValidationError(
          `Template file validation failed: ${error.message}`,
          "TEMPLATE_FILE_VALIDATION_ERROR",
          "validateTemplateFile",
          false,
          { filePath, error: error.message },
        )
      }
    }
  }

  /**
   * Enhanced template syntax validation with error handling
   */
  async validateTemplateSyntax(content, filePath, relativePath) {
    try {
      validateString(content, "content")
      validateString(filePath, "filePath")
      validateString(relativePath, "relativePath")

      this.stats.syntaxChecks++

      // Validate syntax based on file type
      if (filePath.endsWith(".cs")) {
        await this.validateCSharpSyntax(content, relativePath)
      } else if (filePath.endsWith(".vue")) {
        await this.validateVueSyntax(content, relativePath)
      } else if (filePath.endsWith(".ts")) {
        await this.validateTypeScriptSyntax(content, relativePath)
      } else if (filePath.endsWith(".js")) {
        await this.validateJavaScriptSyntax(content, relativePath)
      }
    } catch (error) {
      logError("validateTemplateSyntax", error, { filePath, relativePath })
      if (this.options.strictMode) {
        throw error
      } else {
        logWarning(
          "validateTemplateSyntax",
          "Syntax validation failed, continuing in non-strict mode",
          {
            filePath,
            error: error.message,
          },
        )
      }
    }
  }

  /**
   * Enhanced C# syntax validation with error handling
   */
  async validateCSharpSyntax(content, filePath) {
    try {
      validateString(content, "content")
      validateString(filePath, "filePath")

      // Basic brace matching
      const openBraces = (content.match(/\{/g) || []).length
      const closeBraces = (content.match(/\}/g) || []).length

      if (openBraces !== closeBraces) {
        throw new TemplateValidationError(
          `C# template ${filePath} has mismatched braces: ${openBraces} open, ${closeBraces} close`,
          "SYNTAX_ERROR",
          "validateCSharpSyntax",
          false,
          { filePath, openBraces, closeBraces },
        )
      }

      // Check for required using statements
      if (
        content.includes("ApplicationService") &&
        !content.includes("using Volo.Abp.Application.Services")
      ) {
        this.warnings.push(`C# template ${filePath} may be missing required using statements`)
      }
    } catch (error) {
      if (error instanceof TemplateValidationError) {
        throw error
      } else {
        throw new TemplateValidationError(
          `C# syntax validation failed for ${filePath}: ${error.message}`,
          "CSHARP_SYNTAX_ERROR",
          "validateCSharpSyntax",
          false,
          { filePath, error: error.message },
        )
      }
    }
  }

  /**
   * Enhanced Vue syntax validation with error handling
   */
  async validateVueSyntax(content, filePath) {
    try {
      validateString(content, "content")
      validateString(filePath, "filePath")

      // Check Vue SFC structure
      const hasTemplate = content.includes("<template>")
      const hasScript = content.includes("<script")
      const hasStyle = content.includes("<style")

      if (!hasTemplate) {
        throw new TemplateValidationError(
          `Vue template ${filePath} missing <template> section`,
          "SYNTAX_ERROR",
          "validateVueSyntax",
          false,
          { filePath },
        )
      }

      if (!hasScript) {
        this.warnings.push(`Vue template ${filePath} missing <script> section`)
      }
    } catch (error) {
      if (error instanceof TemplateValidationError) {
        throw error
      } else {
        throw new TemplateValidationError(
          `Vue syntax validation failed for ${filePath}: ${error.message}`,
          "VUE_SYNTAX_ERROR",
          "validateVueSyntax",
          false,
          { filePath, error: error.message },
        )
      }
    }
  }

  /**
   * Enhanced TypeScript syntax validation with error handling
   */
  async validateTypeScriptSyntax(content, filePath) {
    try {
      validateString(content, "content")
      validateString(filePath, "filePath")

      // Basic brace matching
      const openBraces = (content.match(/\{/g) || []).length
      const closeBraces = (content.match(/\}/g) || []).length

      if (openBraces !== closeBraces) {
        throw new TemplateValidationError(
          `TypeScript template ${filePath} has mismatched braces: ${openBraces} open, ${closeBraces} close`,
          "SYNTAX_ERROR",
          "validateTypeScriptSyntax",
          false,
          { filePath, openBraces, closeBraces },
        )
      }

      // Check for Pinia imports
      if (content.includes("defineStore") && !content.includes("from 'pinia'")) {
        this.warnings.push(`TypeScript template ${filePath} may be missing Pinia import`)
      }
    } catch (error) {
      if (error instanceof TemplateValidationError) {
        throw error
      } else {
        throw new TemplateValidationError(
          `TypeScript syntax validation failed for ${filePath}: ${error.message}`,
          "TYPESCRIPT_SYNTAX_ERROR",
          "validateTypeScriptSyntax",
          false,
          { filePath, error: error.message },
        )
      }
    }
  }

  /**
   * Enhanced JavaScript syntax validation with error handling
   */
  async validateJavaScriptSyntax(content, filePath) {
    try {
      validateString(content, "content")
      validateString(filePath, "filePath")

      // Basic brace matching
      const openBraces = (content.match(/\{/g) || []).length
      const closeBraces = (content.match(/\}/g) || []).length

      if (openBraces !== closeBraces) {
        throw new TemplateValidationError(
          `JavaScript template ${filePath} has mismatched braces: ${openBraces} open, ${closeBraces} close`,
          "SYNTAX_ERROR",
          "validateJavaScriptSyntax",
          false,
          { filePath, openBraces, closeBraces },
        )
      }
    } catch (error) {
      if (error instanceof TemplateValidationError) {
        throw error
      } else {
        throw new TemplateValidationError(
          `JavaScript syntax validation failed for ${filePath}: ${error.message}`,
          "JAVASCRIPT_SYNTAX_ERROR",
          "validateJavaScriptSyntax",
          false,
          { filePath, error: error.message },
        )
      }
    }
  }

  /**
   * Enhanced results output with comprehensive statistics
   */
  outputResults() {
    const duration = Date.now() - this.stats.startTime

    console.log("\n📊 验证结果:")
    console.log(`⏱️  耗时: ${duration}ms`)
    console.log(`📁 模板目录: ${this.templatesDir}`)
    console.log(`📋 处理的模板: ${this.stats.templatesProcessed}`)
    console.log(`📄 处理的文件: ${this.stats.filesProcessed}`)
    console.log(`🔍 语法检查: ${this.stats.syntaxChecks}`)
    console.log(`✅ 状态: ${this.errors.length === 0 ? "通过" : "失败"}`)
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
    } else if (this.errors.length === 0) {
      console.log("⚠️  模板验证完成，存在警告")
    } else {
      console.log("❌ 模板验证失败")
    }

    // Summary statistics
    console.log(`\n📈 统计摘要:`)
    console.log(
      `   成功率: ${this.errors.length === 0 ? "100%" : Math.round((1 - this.errors.length / Math.max(this.stats.filesProcessed, 1)) * 100) + "%"}`,
    )
    console.log(
      `   错误率: ${Math.round((this.errors.length / Math.max(this.stats.filesProcessed, 1)) * 100) || 0}%`,
    )
    console.log(
      `   警告率: ${Math.round((this.warnings.length / Math.max(this.stats.filesProcessed, 1)) * 100) || 0}%`,
    )
  }

  /**
   * Get validation statistics
   */
  getStats() {
    return {
      ...this.stats,
      errors: this.errors.length,
      warnings: this.warnings.length,
      success: this.errors.length === 0,
      duration: Date.now() - this.stats.startTime,
    }
  }

  /**
   * Reset validator state
   */
  reset() {
    this.errors = []
    this.warnings = []
    this.stats = {
      templatesProcessed: 0,
      filesProcessed: 0,
      syntaxChecks: 0,
      startTime: Date.now(),
    }
  }
}

/**
 * Enhanced CLI execution with error handling
 */
async function main() {
  const args = process.argv.slice(2)
  const options = {
    strictMode: args.includes("--strict"),
    skipSyntaxValidation: args.includes("--skip-syntax"),
    maxRetries: parseInt(args.find((arg) => arg.startsWith("--retries="))?.split("=")[1]) || 3,
    retryDelay: parseInt(args.find((arg) => arg.startsWith("--delay="))?.split("=")[1]) || 1000,
  }

  console.log("🔧 Template Validator")
  console.log(`📋 参数: ${JSON.stringify(options, null, 2)}\n`)

  try {
    const validator = new TemplateValidator(options)
    const success = await validator.validateAll()

    if (success) {
      console.log("\n🎉 模板验证成功完成！")
      process.exit(0)
    } else {
      console.log("\n❌ 模板验证失败")
      process.exit(1)
    }
  } catch (error) {
    console.error("\n💥 致命错误:", error.message)

    if (error.details) {
      console.error("📋 错误详情:", JSON.stringify(error.details, null, 2))
    }

    process.exit(1)
  }
}

// Enhanced module execution
if (require.main === module) {
  main().catch((error) => {
    console.error("\n💥 未处理的错误:", error)
    process.exit(1)
  })
}

module.exports = {
  TemplateValidator,
  TemplateValidationError,
  resolveTemplatesDir,
}
