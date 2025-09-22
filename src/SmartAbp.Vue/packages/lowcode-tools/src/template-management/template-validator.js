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
  constructor(
    message,
    code,
    operation,
    retryable = false,
    details = {}
  ) {
    super(message)
    this.name = 'TemplateValidationError'
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
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    context,
    timestamp: new Date().toISOString()
  })
}

const logWarning = (operation, message, context = {}) => {
  console.warn(`[TemplateValidator] ${operation}:`, {
    message,
    context,
    timestamp: new Date().toISOString()
  })
}

/**
 * Input validation utilities
 */
const validateString = (value, fieldName, allowEmpty = false) => {
  if (typeof value !== 'string') {
    throw new TemplateValidationError(
      `${fieldName} must be a string`,
      'VALIDATION_ERROR',
      'validateString',
      false,
      { field: fieldName, value, type: typeof value }
    )
  }
  
  if (!allowEmpty && value.trim() === '') {
    throw new TemplateValidationError(
      `${fieldName} cannot be empty`,
      'VALIDATION_ERROR',
      'validateString',
      false,
      { field: fieldName, value }
    )
  }
  
  return value
}

const validateObject = (value, fieldName) => {
  if (typeof value !== 'object' || value === null) {
    throw new TemplateValidationError(
      `${fieldName} must be an object`,
      'VALIDATION_ERROR',
      'validateObject',
      false,
      { field: fieldName, value, type: typeof value }
    )
  }
  return value
}

const validateArray = (value, fieldName) => {
  if (!Array.isArray(value)) {
    throw new TemplateValidationError(
      `${fieldName} must be an array`,
      'VALIDATION_ERROR',
      'validateArray',
      false,
      { field: fieldName, value, type: typeof value }
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

const safeReadFile = (filePath, encoding = 'utf8', operation) => {
  try {
    return fs.readFileSync(filePath, encoding)
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new TemplateValidationError(
        `File not found: ${filePath}`,
        'FILE_NOT_FOUND',
        operation,
        false,
        { filePath }
      )
    }
    throw new TemplateValidationError(
      `Failed to read file: ${error.message}`,
      'FILE_READ_ERROR',
      operation,
      true,
      { filePath, error: error.message }
    )
  }
}

const safeParseJSON = (content, filePath, operation) => {
  try {
    return JSON.parse(content)
  } catch (error) {
    throw new TemplateValidationError(
      `Invalid JSON in ${filePath}: ${error.message}`,
      'JSON_PARSE_ERROR',
      operation,
      false,
      { filePath, error: error.message }
    )
  }
}

const safeParseYAML = (content, filePath, operation) => {
  try {
    return yaml.load(content)
  } catch (error) {
    throw new TemplateValidationError(
      `Invalid YAML in ${filePath}: ${error.message}`,
      'YAML_PARSE_ERROR',
      operation,
      false,
      { filePath, error: error.message }
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
 * 重试操作（带指数退避）
 */
async function retryOperation(operation, maxRetries = 3, initialDelay = 1000) {
  let lastError
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        break
      }
      
      const delay = initialDelay * Math.pow(2, attempt)
      logWarning(`Operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms`, {
        error: error.message
      })
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw new TemplateValidationError(`Operation failed after ${maxRetries + 1} attempts`, {
    lastError: lastError.message,
    attempts: maxRetries + 1
  })
}

/**
 * 获取缓存键
 */
function getCacheKey(filePath, content) {
  const stats = safeStat(filePath)
  if (!stats) return null
  
  return `${filePath}:${stats.mtime.getTime()}:${content.length}`
}

/**
 * 获取缓存条目
 */
function getCacheEntry(key) {
  if (!VALIDATION_CACHE.enabled || !key) return null
  
  const entry = VALIDATION_CACHE.entries.get(key)
  if (!entry) {
    PERFORMANCE_METRICS.cacheMisses++
    return null
  }
  
  // 检查TTL
  if (Date.now() - entry.timestamp > VALIDATION_CACHE.ttl) {
    VALIDATION_CACHE.entries.delete(key)
    PERFORMANCE_METRICS.cacheMisses++
    return null
  }
  
  PERFORMANCE_METRICS.cacheHits++
  return entry.result
}

/**
 * 设置缓存条目
 */
function setCacheEntry(key, result) {
  if (!VALIDATION_CACHE.enabled || !key) return
  
  // 清理过期条目
  if (VALIDATION_CACHE.entries.size >= VALIDATION_CACHE.maxSize) {
    const oldestKey = VALIDATION_CACHE.entries.keys().next().value
    if (oldestKey) {
      VALIDATION_CACHE.entries.delete(oldestKey)
    }
  }
  
  VALIDATION_CACHE.entries.set(key, {
    result,
    timestamp: Date.now()
  })
}

/**
 * 清理验证缓存
 */
function clearValidationCache() {
  VALIDATION_CACHE.entries.clear()
  PERFORMANCE_METRICS.cacheHits = 0
  PERFORMANCE_METRICS.cacheMisses = 0
  logWarning('Validation cache cleared')
}

/**
 * 解析模板目录
 */
function resolveTemplatesDir(templatesDir) {
  try {
    const resolvedPath = path.resolve(templatesDir)
    
    if (!safeFileExists(resolvedPath)) {
      throw new TemplateValidationError(`Templates directory does not exist: ${templatesDir}`, {
        templatesDir,
        resolvedPath
      })
    }
    
    const stats = safeStat(resolvedPath)
    if (!stats || !stats.isDirectory()) {
      throw new TemplateValidationError(`Templates path is not a directory: ${templatesDir}`, {
        templatesDir,
        resolvedPath
      })
    }
    
    return resolvedPath
  } catch (error) {
    if (error instanceof TemplateValidationError) {
      throw error
    }
    throw new TemplateValidationError(`Failed to resolve templates directory: ${error.message}`, {
      templatesDir,
      error: error.message
    })
  }
}

/**
 * 获取文件类型配置
 */
function getFileTypeConfig(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  
  for (const [type, config] of Object.entries(FILE_TYPE_CONFIG)) {
    if (config.extensions.includes(ext)) {
      return config
    }
  }
  
  return null
}

/**
 * 验证C#语法
 */
function validateCSharpSyntax(content, filePath) {
  const errors = []
  const warnings = []
  
  try {
    // 基本语法检查
    const openBraces = (content.match(/{/g) || []).length
    const closeBraces = (content.match(/}/g) || []).length
    
    if (openBraces !== closeBraces) {
      errors.push(`Mismatched braces: ${openBraces} open, ${closeBraces} close`)
    }
    
    // 命名空间检查
    const namespaceMatch = content.match(/namespace\s+(\w+(?:\.\w+)*)/)
    if (!namespaceMatch) {
      warnings.push('Missing namespace declaration')
    }
    
    // 类定义检查
    const classMatches = content.match(/class\s+(\w+)/g) || []
    if (classMatches.length === 0) {
      warnings.push('No class definitions found')
    }
    
    // 使用语句检查
    const usingMatches = content.match(/using\s+(\w+(?:\.\w+)*);/g) || []
    const systemUsings = usingMatches.filter(u => u.includes('System')).length
    
    if (systemUsings === 0) {
      warnings.push('No System using statements found')
    }
    
    // 方法定义检查
    const methodMatches = content.match(/(public|private|protected|internal)\s+(\w+)\s+(\w+)\s*\([^)]*\)\s*\{/g) || []
    if (methodMatches.length === 0) {
      warnings.push('No method definitions found')
    }
    
  } catch (error) {
    errors.push(`Syntax validation error: ${error.message}`)
  }
  
  return { errors, warnings }
}

/**
 * 验证Vue语法
 */
function validateVueSyntax(content, filePath) {
  const errors = []
  const warnings = []
  
  try {
    // 基本结构检查
    if (!content.includes('<template>')) {
      errors.push('Missing <template> section')
    }
    
    if (!content.includes('<script>')) {
      errors.push('Missing <script> section')
    }
    
    // 模板语法检查
    const templateMatch = content.match(/<template>[\s\S]*?<\/template>/)
    if (templateMatch) {
      const templateContent = templateMatch[0]
      
      // 检查未闭合的标签
      const openTags = templateContent.match(/<(\w+)[^>]*>/g) || []
      const closeTags = templateContent.match(/<\/(\w+)>/g) || []
      
      if (openTags.length !== closeTags.length) {
        warnings.push('Potential unclosed tags in template')
      }
      
      // 检查Vue指令
      const vueDirectives = templateContent.match(/v-\w+/g) || []
      if (vueDirectives.length === 0) {
        warnings.push('No Vue directives found in template')
      }
    }
    
    // Script语法检查
    const scriptMatch = content.match(/<script[^>]*>[\s\S]*?<\/script>/)
    if (scriptMatch) {
      const scriptContent = scriptMatch[0]
      
      // 检查export default
      if (!scriptContent.includes('export default')) {
        warnings.push('Missing export default in script section')
      }
      
      // 检查组件注册
      if (scriptContent.includes('components:')) {
        const componentsMatch = scriptContent.match(/components:\s*\{([^}]+)\}/)
        if (!componentsMatch) {
          errors.push('Invalid components registration syntax')
        }
      }
    }
    
    // Style部分检查（可选）
    if (!content.includes('<style')) {
      warnings.push('Missing <style> section')
    }
    
  } catch (error) {
    errors.push(`Syntax validation error: ${error.message}`)
  }
  
  return { errors, warnings }
}

/**
 * 验证TypeScript语法
 */
function validateTypeScriptSyntax(content, filePath) {
  const errors = []
  const warnings = []
  
  try {
    // 导入语句检查
    const importMatches = content.match(/import\s+.*\s+from\s+['"][^'"]+['"];?/g) || []
    const exportMatches = content.match(/export\s+(default\s+)?(interface|class|function|const|let|var)/g) || []
    
    if (importMatches.length === 0) {
      warnings.push('No import statements found')
    }
    
    if (exportMatches.length === 0) {
      warnings.push('No export statements found')
    }
    
    // 类型定义检查
    const interfaceMatches = content.match(/interface\s+(\w+)/g) || []
    const typeMatches = content.match(/type\s+(\w+)/g) || []
    
    if (interfaceMatches.length === 0 && typeMatches.length === 0) {
      warnings.push('No TypeScript type definitions found')
    }
    
    // 装饰器检查（Vue相关）
    if (content.includes('@Component')) {
      if (!content.includes('vue-property-decorator') && !content.includes('vue-class-component')) {
        warnings.push('Using @Component decorator but missing required imports')
      }
    }
    
    // Pinia状态管理检查
    if (content.includes('defineStore')) {
      if (!content.includes('pinia')) {
        warnings.push('Using defineStore but missing pinia import')
      }
      
      // 检查store定义格式
      const storeMatch = content.match(/defineStore\s*\(\s*['"](\w+)['"]\s*,\s*\{/)
      if (!storeMatch) {
        errors.push('Invalid defineStore syntax')
      }
    }
    
    // 括号匹配检查
    const openBraces = (content.match(/{/g) || []).length
    const closeBraces = (content.match(/}/g) || []).length
    
    if (openBraces !== closeBraces) {
      errors.push(`Mismatched braces: ${openBraces} open, ${closeBraces} close`)
    }
    
  } catch (error) {
    errors.push(`Syntax validation error: ${error.message}`)
  }
  
  return { errors, warnings }
}

/**
 * 验证JavaScript语法
 */
function validateJavaScriptSyntax(content, filePath) {
  const errors = []
  const warnings = []
  
  try {
    // 模块系统检查
    const hasImports = content.includes('import') || content.includes('require')
    const hasExports = content.includes('export') || content.includes('module.exports')
    
    if (!hasImports && !hasExports) {
      warnings.push('No module imports or exports found')
    }
    
    // ES6+语法检查
    const arrowFunctions = content.match(/=>/g) || []
    const constDeclarations = content.match(/const\s+/g) || []
    const letDeclarations = content.match(/let\s+/g) || []
    
    if (arrowFunctions.length === 0 && constDeclarations.length === 0 && letDeclarations.length === 0) {
      warnings.push('No modern JavaScript syntax found (arrow functions, const, let)')
    }
    
    // 异步代码检查
    const asyncKeywords = content.match(/async/g) || []
    const awaitKeywords = content.match(/await/g) || []
    
    if (asyncKeywords.length > 0 && awaitKeywords.length === 0) {
      warnings.push('Using async but no await keywords found')
    }
    
    // Pinia状态管理检查
    if (content.includes('defineStore')) {
      if (!content.includes('pinia')) {
        warnings.push('Using defineStore but missing pinia import')
      }
      
      // 检查store定义格式
      const storeMatch = content.match(/defineStore\s*\(\s*['"](\w+)['"]\s*,\s*\{/)
      if (!storeMatch) {
        errors.push('Invalid defineStore syntax')
      }
    }
    
    // 严格模式检查
    if (!content.includes('use strict')) {
      warnings.push('Missing "use strict" declaration')
    }
    
    // 括号匹配检查
    const openBraces = (content.match(/{/g) || []).length
    const closeBraces = (content.match(/}/g) || []).length
    
    if (openBraces !== closeBraces) {
      errors.push(`Mismatched braces: ${openBraces} open, ${closeBraces} close`)
    }
    
  } catch (error) {
    errors.push(`Syntax validation error: ${error.message}`)
  }
  
  return { errors, warnings }
}

/**
 * 模板验证器类
 */
class TemplateValidator {
  constructor(options = {}) {
    this.options = {
      templatesDir: options.templatesDir || './templates',
      enableCache: options.enableCache !== false,
      enablePerformanceMonitoring: options.enablePerformanceMonitoring || false,
      maxFileSize: options.maxFileSize || 1024 * 1024, // 1MB
      allowedFileTypes: options.allowedFileTypes || ['.cs', '.vue', '.ts', '.js', '.json', '.yaml', '.yml'],
      ...options
    }
    
    this.templatesDir = resolveTemplatesDir(this.options.templatesDir)
    this.validationResults = new Map()
    this.errorLog = []
    
    logWarning(`TemplateValidator initialized with directory: ${this.templatesDir}`)
  }
  
  /**
   * 记录错误
   */
  logError(code, message, details = {}) {
    const error = {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      templatesDir: this.templatesDir
    }
    
    this.errorLog.push(error)
    PERFORMANCE_METRICS.errorCount++
    
    // 限制错误日志大小
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-50)
    }
    
    logError(message, details)
    return error
  }
  
  /**
   * 验证所有模板
   */
  async validateAll() {
    const startTime = Date.now()
    const results = {
      total: 0,
      valid: 0,
      invalid: 0,
      errors: [],
      warnings: [],
      details: new Map()
    }
    
    try {
      logWarning('Starting template validation...')
      
      // 验证索引文件
      const indexResult = await this.validateIndex()
      results.details.set('index', indexResult)
      
      if (!indexResult.valid) {
        results.errors.push(...indexResult.errors)
        results.invalid++
      }
      
      // 查找所有模板文件
      const templateFiles = await this.findTemplateFiles()
      results.total = templateFiles.length
      
      // 验证每个模板文件
      for (const filePath of templateFiles) {
        try {
          const fileResult = await this.validateTemplateFile(filePath)
          results.details.set(filePath, fileResult)
          
          if (fileResult.valid) {
            results.valid++
          } else {
            results.invalid++
            results.errors.push(...fileResult.errors)
          }
          
          results.warnings.push(...fileResult.warnings)
          
        } catch (error) {
          results.invalid++
          const errorMessage = error instanceof Error ? error.message : String(error)
          results.errors.push(`Failed to validate ${filePath}: ${errorMessage}`)
          this.logError('VALIDATE_FILE_ERROR', 'Failed to validate template file', { 
            filePath, 
            error: errorMessage 
          })
        }
      }
      
      const duration = Date.now() - startTime
      
      // 更新性能指标
      if (this.options.enablePerformanceMonitoring) {
        PERFORMANCE_METRICS.totalValidations++
        PERFORMANCE_METRICS.successfulValidations += results.valid
        PERFORMANCE_METRICS.failedValidations += results.invalid
        PERFORMANCE_METRICS.averageValidationTime = 
          (PERFORMANCE_METRICS.averageValidationTime * (PERFORMANCE_METRICS.totalValidations - 1) + duration) 
          / PERFORMANCE_METRICS.totalValidations
      }
      
      logWarning(`Template validation completed in ${duration}ms: ${results.valid}/${results.total} valid`)
      
      return {
        ...results,
        duration,
        success: results.invalid === 0,
        performance: this.getPerformanceMetrics()
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logError('VALIDATE_ALL_ERROR', 'Failed to validate all templates', { error: errorMessage })
      
      return {
        ...results,
        success: false,
        errors: [...results.errors, `Validation failed: ${errorMessage}`]
      }
    }
  }
  
  /**
   * 验证索引文件
   */
  async validateIndex() {
    try {
      const indexPath = path.join(this.templatesDir, 'index.json')
      
      if (!safeFileExists(indexPath)) {
        throw new TemplateValidationError('Index file not found', { 
          expectedPath: indexPath,
          templatesDir: this.templatesDir 
        })
      }
      
      const content = safeReadFile(indexPath)
      const indexData = safeParseJSON(content, 'index file')
      
      // 验证索引文件结构
      validateObject(indexData, 'index data')
      
      if (!indexData.templates || !Array.isArray(indexData.templates)) {
        throw new TemplateValidationError('Invalid index file: templates must be an array', {
          templates: indexData.templates,
          templatesDir: this.templatesDir
        })
      }
      
      if (indexData.templates.length === 0) {
        logWarning('Index file contains no templates', { templatesDir: this.templatesDir })
      }
      
      // 验证每个模板条目
      const validationPromises = indexData.templates.map(async (template, index) => {
        try {
          return await this.validateTemplateEntry(template, index)
        } catch (error) {
          this.logError('VALIDATE_TEMPLATE_ENTRY_ERROR', 'Failed to validate template entry', {
            template,
            index,
            error: error.message
          })
          throw error
        }
      })
      
      const results = await Promise.allSettled(validationPromises)
      const errors = []
      const warnings = []
      
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          errors.push(`Template entry ${index}: ${result.reason.message}`)
        }
      })
      
      logWarning(`Index file validation completed: ${indexData.templates.length} templates, ${errors.length} errors`)
      
      return {
        valid: errors.length === 0,
        errors,
        warnings,
        templateCount: indexData.templates.length
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logError('VALIDATE_INDEX_ERROR', 'Failed to validate index file', { error: errorMessage })
      
      return {
        valid: false,
        errors: [errorMessage],
        warnings: []
      }
    }
  }
  
  /**
   * 验证模板条目
   */
  async validateTemplateEntry(template, index) {
    try {
      // 验证必填字段
      const requiredFields = ['name', 'description', 'file', 'metadata']
      const missingFields = requiredFields.filter(field => !template[field])
      
      if (missingFields.length > 0) {
        throw new TemplateValidationError(`Missing required fields: ${missingFields.join(', ')}`, {
          template,
          missingFields,
          index
        })
      }
      
      // 验证名称
      const name = validateString(template.name, 'template name')
      if (name.length === 0) {
        throw new TemplateValidationError('Template name cannot be empty', { template, index })
      }
      
      // 验证描述
      const description = validateString(template.description, 'template description')
      if (description.length === 0) {
        throw new TemplateValidationError('Template description cannot be empty', { template, index })
      }
      
      // 验证文件路径
      const filePath = validateString(template.file, 'template file')
      const fullPath = path.join(this.templatesDir, filePath)
      
      if (!safeFileExists(fullPath)) {
        throw new TemplateValidationError(`Template file not found: ${filePath}`, {
          template,
          filePath,
          fullPath,
          index
        })
      }
      
      // 验证文件类型
      const ext = path.extname(fullPath).toLowerCase()
      if (!this.options.allowedFileTypes.includes(ext)) {
        throw new TemplateValidationError(`Unsupported file type: ${ext}`, {
          template,
          filePath,
          allowedTypes: this.options.allowedFileTypes,
          index
        })
      }
      
      // 验证文件大小
      const stats = safeStat(fullPath)
      if (stats && stats.size > this.options.maxFileSize) {
        throw new TemplateValidationError(`Template file too large: ${stats.size} bytes (max: ${this.options.maxFileSize})`, {
          template,
          filePath,
          size: stats.size,
          maxSize: this.options.maxFileSize,
          index
        })
      }
      
      // 验证元数据
      const metadata = validateObject(template.metadata, 'template metadata')
      await this.validateMetadata(metadata, filePath, index)
      
      // 验证元数据文件
      const metadataPath = validateString(template.metadata, 'metadata file')
      const fullMetadataPath = path.join(this.templatesDir, metadataPath)
      
      if (!safeFileExists(fullMetadataPath)) {
        throw new TemplateValidationError(`Metadata file not found: ${metadataPath}`, {
          template,
          metadataPath,
          fullMetadataPath,
          index
        })
      }
      
      logWarning(`Template entry validation completed: ${name} (${filePath})`)
      
      return {
        valid: true,
        name,
        filePath,
        metadataPath
      }
      
    } catch (error) {
      if (error instanceof TemplateValidationError) {
        throw error
      }
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new TemplateValidationError(`Failed to validate template entry: ${errorMessage}`, {
        template,
        index,
        error: errorMessage
      })
    }
  }
  
  /**
   * 验证元数据
   */
  async validateMetadata(metadata, templateFile, index) {
    try {
      const metadataObj = validateObject(metadata, 'metadata')
      
      // 验证推荐字段
      const recommendedFields = ['author', 'version', 'tags', 'parameters']
      const missingRecommended = recommendedFields.filter(field => !metadataObj[field])
      
      if (missingRecommended.length > 0) {
        logWarning(`Missing recommended metadata fields: ${missingRecommended.join(', ')}`, {
          templateFile,
          index,
          missingFields: missingRecommended
        })
      }
      
      // 验证参数定义
      if (metadataObj.parameters && Array.isArray(metadataObj.parameters)) {
        const parameterErrors = []
        
        metadataObj.parameters.forEach((param, paramIndex) => {
          try {
            if (!param.name) {
              parameterErrors.push(`Parameter ${paramIndex}: missing name`)
            }
            
            if (!param.type) {
              parameterErrors.push(`Parameter ${paramIndex}: missing type`)
            }
            
            if (param.required && param.default === undefined) {
              logWarning(`Required parameter without default value: ${param.name}`, {
                templateFile,
                index,
                parameter: param
              })
            }
            
            // 验证参数类型
            const validTypes = ['string', 'number', 'boolean', 'array', 'object', 'file', 'select']
            if (param.type && !validTypes.includes(param.type)) {
              parameterErrors.push(`Parameter ${paramIndex}: invalid type '${param.type}'. Valid types: ${validTypes.join(', ')}`)
            }
            
            // 验证选择类型参数
            if (param.type === 'select' && (!param.options || !Array.isArray(param.options))) {
              parameterErrors.push(`Parameter ${paramIndex}: select type requires options array`)
            }
            
          } catch (paramError) {
            parameterErrors.push(`Parameter ${paramIndex}: validation error - ${paramError.message}`)
          }
        })
        
        if (parameterErrors.length > 0) {
          throw new TemplateValidationError(`Parameter validation failed: ${parameterErrors.join('; ')}`, {
            templateFile,
            index,
            parameterErrors
          })
        }
      }
      
      logWarning(`Metadata validation completed for: ${templateFile}`)
      
      return {
        valid: true,
        warnings: missingRecommended.length > 0 ? [`Missing recommended fields: ${missingRecommended.join(', ')}`] : []
      }
      
    } catch (error) {
      if (error instanceof TemplateValidationError) {
        throw error
      }
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new TemplateValidationError(`Failed to validate metadata: ${errorMessage}`, {
        templateFile,
        index,
        error: errorMessage
      })
    }
  }
  
  /**
   * 验证模板文件
   */
  async validateTemplateFile(filePath) {
    try {
      const fullPath = path.join(this.templatesDir, filePath)
      
      // 检查缓存
      if (this.options.enableCache) {
        const content = safeReadFile(fullPath)
        const cacheKey = getCacheKey(fullPath, content)
        const cachedResult = getCacheEntry(cacheKey)
        
        if (cachedResult) {
          logWarning(`Using cached validation result for: ${filePath}`)
          return cachedResult
        }
      }
      
      const startTime = Date.now()
      
      // 读取文件内容
      const content = safeReadFile(fullPath)
      
      // 验证文件大小
      const stats = safeStat(fullPath)
      if (stats && stats.size > this.options.maxFileSize) {
        throw new TemplateValidationError(`Template file too large: ${stats.size} bytes (max: ${this.options.maxFileSize})`, {
          filePath,
          size: stats.size,
          maxSize: this.options.maxFileSize
        })
      }
      
      // 验证AI模板信息
      const aiTemplateInfo = this.validateTemplateInfo(content, filePath)
      
      // 验证参数占位符
      const parameterValidation = this.validateParameterPlaceholders(content, filePath)
      
      // 文件类型特定验证
      const syntaxValidation = await this.validateTemplateSyntax(content, filePath)
      
      const duration = Date.now() - startTime
      
      const result = {
        valid: aiTemplateInfo.valid && parameterValidation.valid && syntaxValidation.valid,
        errors: [
          ...aiTemplateInfo.errors,
          ...parameterValidation.errors,
          ...syntaxValidation.errors
        ],
        warnings: [
          ...aiTemplateInfo.warnings,
          ...parameterValidation.warnings,
          ...syntaxValidation.warnings
        ],
        filePath,
        duration,
        size: stats ? stats.size : 0
      }
      
      // 缓存结果
      if (this.options.enableCache) {
        const cacheKey = getCacheKey(fullPath, content)
        setCacheEntry(cacheKey, result)
      }
      
      logWarning(`Template file validation completed: ${filePath} (${duration}ms)`)
      
      return result
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logError('VALIDATE_TEMPLATE_FILE_ERROR', 'Failed to validate template file', { 
        filePath, 
        error: errorMessage 
      })
      
      return {
        valid: false,
        errors: [errorMessage],
        warnings: [],
        filePath,
        duration: 0,
        size: 0
      }
    }
  }
  
  /**
   * 验证模板信息
   */
  validateTemplateInfo(content, filePath) {
    try {
      const errors = []
      const warnings = []
      
      // 检查AI模板信息注释
      const aiTemplateInfoMatch = content.match(/\/\*\s*AI_TEMPLATE_INFO\s*([\s\S]*?)\s*\*\//)
      if (!aiTemplateInfoMatch) {
        warnings.push('Missing AI_TEMPLATE_INFO comment block')
      } else {
        try {
          const infoContent = aiTemplateInfoMatch[1]
          const infoLines = infoContent.split('\n').filter(line => line.trim())
          
          // 解析信息
          const info = {}
          infoLines.forEach(line => {
            const match = line.match(/^\s*\*?\s*(\w+):\s*(.+)$/)
            if (match) {
              info[match[1].trim()] = match[2].trim()
            }
          })
          
          // 验证必需字段
          const requiredFields = ['name', 'description', 'version']
          const missingFields = requiredFields.filter(field => !info[field])
          
          if (missingFields.length > 0) {
            errors.push(`Missing required AI template info fields: ${missingFields.join(', ')}`)
          }
          
          // 验证版本格式
          if (info.version && !/^\d+\.\d+\.\d+/.test(info.version)) {
            warnings.push(`Invalid version format: ${info.version}`)
          }
          
        } catch (parseError) {
          errors.push(`Failed to parse AI template info: ${parseError.message}`)
        }
      }
      
      return {
        valid: errors.length === 0,
        errors,
        warnings
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logError('VALIDATE_TEMPLATE_INFO_ERROR', 'Failed to validate template info', { 
        filePath, 
        error: errorMessage 
      })
      
      return {
        valid: false,
        errors: [errorMessage],
        warnings: []
      }
    }
  }
  
  /**
   * 验证参数占位符
   */
  validateParameterPlaceholders(content, filePath) {
    try {
      const errors = []
      const warnings = []
      
      // 查找参数占位符
      const placeholderMatches = content.match(/\{\{(\w+)\}\}/g) || []
      
      if (placeholderMatches.length === 0) {
        warnings.push('No parameter placeholders found')
      } else {
        // 提取参数名称
        const parameters = placeholderMatches.map(match => {
          const paramMatch = match.match(/\{\{(\w+)\}\}/)
          return paramMatch ? paramMatch[1] : null
        }).filter(Boolean)
        
        // 检查参数命名规范
        const invalidParameters = parameters.filter(param => !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(param))
        
        if (invalidParameters.length > 0) {
          errors.push(`Invalid parameter names: ${invalidParameters.join(', ')}`)
        }
        
        // 检查重复参数
        const uniqueParameters = new Set(parameters)
        if (parameters.length !== uniqueParameters.size) {
          warnings.push('Duplicate parameter placeholders found')
        }
        
        // 检查参数使用情况
        const parameterCounts = {}
        parameters.forEach(param => {
          parameterCounts[param] = (parameterCounts[param] || 0) + 1
        })
        
        const unusedParameters = Object.keys(parameterCounts).filter(param => parameterCounts[param] === 1)
        if (unusedParameters.length > 0) {
          warnings.push(`Potentially unused parameters: ${unusedParameters.join(', ')}`)
        }
      }
      
      return {
        valid: errors.length === 0,
        errors,
        warnings
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logError('VALIDATE_PARAMETER_PLACEHOLDERS_ERROR', 'Failed to validate parameter placeholders', { 
        filePath, 
        error: errorMessage 
      })
      
      return {
        valid: false,
        errors: [errorMessage],
        warnings: []
      }
    }
  }
  
  /**
   * 验证模板语法
   */
  async validateTemplateSyntax(content, filePath) {
    try {
      const ext = path.extname(filePath).toLowerCase()
      const fileTypeConfig = getFileTypeConfig(filePath)
      
      if (!fileTypeConfig) {
        logWarning(`Unknown file type for syntax validation: ${filePath}`)
        return { valid: true, errors: [], warnings: [] }
      }
      
      const errors = []
      const warnings = []
      
      // 执行语法验证器
      for (const validatorName of fileTypeConfig.syntaxValidators) {
        try {
          const validator = this[validatorName]
          if (typeof validator === 'function') {
            const result = validator(content, filePath)
            errors.push(...result.errors)
            warnings.push(...result.warnings)
          }
        } catch (validatorError) {
          errors.push(`Syntax validator error (${validatorName}): ${validatorError.message}`)
        }
      }
      
      // 检查必需模式
      if (fileTypeConfig.requiredPatterns) {
        for (const pattern of fileTypeConfig.requiredPatterns) {
          if (!pattern.test(content)) {
            errors.push(`Missing required pattern: ${pattern.source}`)
          }
        }
      }
      
      // 检查可选模式
      if (fileTypeConfig.optionalPatterns) {
        for (const pattern of fileTypeConfig.optionalPatterns) {
          if (!pattern.test(content)) {
            warnings.push(`Missing optional pattern: ${pattern.source}`)
          }
        }
      }
      
      logWarning(`Template syntax validation completed: ${filePath} (${fileTypeConfig.name})`)
      
      return {
        valid: errors.length === 0,
        errors,
        warnings
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logError('VALIDATE_TEMPLATE_SYNTAX_ERROR', 'Failed to validate template syntax', { 
        filePath, 
        error: errorMessage 
      })
      
      return {
        valid: false,
        errors: [errorMessage],
        warnings: []
      }
    }
  }
  
  /**
   * 查找模板文件
   */
  async findTemplateFiles() {
    try {
      const files = []
      const stack = [this.templatesDir]
      
      while (stack.length > 0) {
        const currentDir = stack.pop()
        
        try {
          const entries = fs.readdirSync(currentDir, { withFileTypes: true })
          
          for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name)
            
            if (entry.isDirectory()) {
              // 跳过隐藏目录和node_modules
              if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                stack.push(fullPath)
              }
            } else if (entry.isFile()) {
              const ext = path.extname(entry.name).toLowerCase()
              
              // 检查文件类型
              if (this.options.allowedFileTypes.includes(ext)) {
                // 跳过隐藏文件和测试文件
                if (!entry.name.startsWith('.') && !entry.name.includes('.test.')) {
                  const relativePath = path.relative(this.templatesDir, fullPath)
                  files.push(relativePath)
                }
              }
            }
          }
        } catch (dirError) {
          logWarning(`Failed to read directory: ${currentDir}`, { error: dirError.message })
        }
      }
      
      logWarning(`Found ${files.length} template files in ${this.templatesDir}`)
      
      return files.sort()
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logError('FIND_TEMPLATE_FILES_ERROR', 'Failed to find template files', { 
        templatesDir: this.templatesDir,
        error: errorMessage 
      })
      
      return []
    }
  }
  
  /**
   * 获取验证结果
   */
  getValidationResults() {
    return new Map(this.validationResults)
  }
  
  /**
   * 获取错误日志
   */
  getErrorLog() {
    return [...this.errorLog]
  }
  
  /**
   * 获取性能指标
   */
  getPerformanceMetrics() {
    return { ...PERFORMANCE_METRICS }
  }
  
  /**
   * 获取统计信息
   */
  getStats() {
    const totalFiles = this.validationResults.size
    const validFiles = Array.from(this.validationResults.values()).filter(r => r.valid).length
    const invalidFiles = totalFiles - validFiles
    
    return {
      totalFiles,
      validFiles,
      invalidFiles,
      validationRate: totalFiles > 0 ? (validFiles / totalFiles * 100).toFixed(2) + '%' : '0%',
      cacheStats: {
        hits: PERFORMANCE_METRICS.cacheHits,
        misses: PERFORMANCE_METRICS.cacheMisses,
        hitRate: (PERFORMANCE_METRICS.cacheHits + PERFORMANCE_METRICS.cacheMisses) > 0 
          ? (PERFORMANCE_METRICS.cacheHits / (PERFORMANCE_METRICS.cacheHits + PERFORMANCE_METRICS.cacheMisses) * 100).toFixed(2) + '%'
          : '0%'
      },
      performance: this.getPerformanceMetrics()
    }
  }
  
  /**
   * 重置验证器状态
   */
  reset() {
    this.validationResults.clear()
    this.errorLog = []
    clearValidationCache()
    
    // 重置性能指标
    Object.keys(PERFORMANCE_METRICS).forEach(key => {
      PERFORMANCE_METRICS[key] = 0
    })
    
    logWarning('TemplateValidator reset completed')
  }
  
  /**
   * 输出验证结果
   */
  outputResults(results) {
    try {
      console.log('\n📋 Template Validation Results:')
      console.log('=====================================')
      console.log(`Total Files: ${results.total}`)
      console.log(`Valid: ${results.valid} ✅`)
      console.log(`Invalid: ${results.invalid} ❌`)
      console.log(`Success Rate: ${results.total > 0 ? ((results.valid / results.total) * 100).toFixed(2) : 0}%`)
      console.log(`Duration: ${results.duration}ms`)
      
      if (results.errors.length > 0) {
        console.log('\n❌ Errors:')
        results.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`)
        })
      }
      
      if (results.warnings.length > 0) {
        console.log('\n⚠️  Warnings:')
        results.warnings.forEach((warning, index) => {
          console.log(`  ${index + 1}. ${warning}`)
        })
      }
      
      if (results.performance) {
        console.log('\n📊 Performance Metrics:')
        console.log(`  Total Validations: ${results.performance.totalValidations}`)
        console.log(`  Cache Hit Rate: ${results.performance.cacheHits + results.performance.cacheMisses > 0 
          ? (results.performance.cacheHits / (results.performance.cacheHits + results.performance.cacheMisses) * 100).toFixed(2) 
          : 0}%`)
        console.log(`  Error Count: ${results.performance.errorCount}`)
      }
      
      console.log('\n✨ Validation completed!')
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logError('OUTPUT_RESULTS_ERROR', 'Failed to output validation results', { error: errorMessage })
    }
  }
}

/**
 * 主函数（CLI执行入口）
 */
async function main() {
  try {
    const args = process.argv.slice(2)
    const templatesDir = args[0] || './templates'
    const enableCache = !args.includes('--no-cache')
    const enablePerformanceMonitoring = args.includes('--performance')
    const verbose = args.includes('--verbose') || args.includes('-v')
    
    console.log(`🔍 Starting template validation for: ${templatesDir}`)
    
    const validator = new TemplateValidator({
      templatesDir,
      enableCache,
      enablePerformanceMonitoring,
      maxFileSize: 2 * 1024 * 1024 // 2MB
    })
    
    const results = await validator.validateAll()
    
    // 输出结果
    validator.outputResults(results)
    
    // 详细输出（如果启用）
    if (verbose) {
      console.log('\n📄 Detailed Results:')
      console.log('====================')
      
      for (const [key, result] of results.details) {
        console.log(`\n${key}:`)
        console.log(`  Valid: ${result.valid ? '✅' : '❌'}`)
        
        if (result.errors.length > 0) {
          console.log('  Errors:')
          result.errors.forEach(error => console.log(`    - ${error}`))
        }
        
        if (result.warnings.length > 0) {
          console.log('  Warnings:')
          result.warnings.forEach(warning => console.log(`    - ${warning}`))
        }
        
        if (result.duration) {
          console.log(`  Duration: ${result.duration}ms`)
        }
      }
      
      // 输出错误日志
      const errorLog = validator.getErrorLog()
      if (errorLog.length > 0) {
        console.log('\n📋 Error Log:')
        errorLog.forEach((error, index) => {
          console.log(`  ${index + 1}. [${error.code}] ${error.message}`)
          if (error.details && Object.keys(error.details).length > 0) {
            console.log(`     Details:`, JSON.stringify(error.details, null, 2))
          }
        })
      }
      
      // 输出性能指标
      if (enablePerformanceMonitoring) {
        const metrics = validator.getPerformanceMetrics()
        console.log('\n📊 Performance Metrics:')
        console.log(JSON.stringify(metrics, null, 2))
      }
    }
    
    // 退出码
    process.exit(results.success ? 0 : 1)
    
  } catch (error) {
    console.error('❌ Template validation failed:', error.message)
    
    if (error.details) {
      console.error('Details:', JSON.stringify(error.details, null, 2))
    }
    
    process.exit(1)
  }
}

// 模块导出
module.exports = {
  TemplateValidator,
  TemplateValidationError,
  validateString,
  validateObject,
  validateArray,
  safeFileExists,
  safeReadFile,
  safeParseJSON,
  safeParseYAML,
  safeStat,
  retryOperation,
  resolveTemplatesDir,
  getFileTypeConfig,
  validateCSharpSyntax,
  validateVueSyntax,
  validateTypeScriptSyntax,
  validateJavaScriptSyntax,
  clearValidationCache,
  PERFORMANCE_METRICS,
  FILE_TYPE_CONFIG,
  main
}

// 如果是直接执行，运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
}
