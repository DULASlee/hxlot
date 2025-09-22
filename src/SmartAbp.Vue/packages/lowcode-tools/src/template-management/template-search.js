#!/usr/bin/env node
/* eslint-disable */

/**
 * Enhanced Template Search Script with comprehensive error handling
 * 提供命令行接口搜索和应用模板
 */

const fs = require("fs")
const path = require("path")

/**
 * Custom error class for template search errors
 */
class TemplateSearchError extends Error {
  constructor(message, code, operation, retryable = false, details = {}) {
    super(message)
    this.name = 'TemplateSearchError'
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
  console.error(`[TemplateSearcher] ${operation} failed:`, {
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
  console.warn(`[TemplateSearcher] ${operation}:`, {
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
    throw new TemplateSearchError(
      `${fieldName} must be a string`,
      'VALIDATION_ERROR',
      'validateString',
      false,
      { field: fieldName, value, type: typeof value }
    )
  }
  
  if (!allowEmpty && value.trim() === '') {
    throw new TemplateSearchError(
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
    throw new TemplateSearchError(
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
    throw new TemplateSearchError(
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
      throw new TemplateSearchError(
        `File not found: ${filePath}`,
        'FILE_NOT_FOUND',
        operation,
        false,
        { filePath }
      )
    }
    throw new TemplateSearchError(
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
    throw new TemplateSearchError(
      `Invalid JSON in ${filePath}: ${error.message}`,
      'JSON_PARSE_ERROR',
      operation,
      false,
      { filePath, error: error.message }
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
        logWarning('retryOperation', `Attempt ${attempt} failed, retrying in ${delay}ms`, {
          error: error.message,
          attempt,
          maxRetries
        })
        await new Promise(resolve => setTimeout(resolve, delay))
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
        if (safeFileExists(candidate, 'resolveTemplatesDir')) {
          const stat = fs.statSync(candidate)
          if (stat.isDirectory()) {
            logWarning('resolveTemplatesDir', `Found templates directory at: ${candidate}`)
            return candidate
          }
        }
      } catch (error) {
        logWarning('resolveTemplatesDir', `Failed to check candidate directory: ${candidate}`, {
          error: error.message
        })
      }
      
      const parent = path.dirname(currentDir)
      if (parent === currentDir) break
      currentDir = parent
    }
  } catch (error) {
    logError('resolveTemplatesDir', error, { startDir })
  }
  
  // Fallback to cwd/templates
  const fallback = path.resolve(process.cwd(), "templates")
  logWarning('resolveTemplatesDir', `Using fallback templates directory: ${fallback}`)
  return fallback
}

/**
 * Enhanced TemplateSearcher class with comprehensive error handling
 */
class TemplateSearcher {
  constructor(options = {}) {
    try {
      this.options = {
        maxRetries: options.maxRetries || 3,
        retryDelay: options.retryDelay || 1000,
        fuzzySearch: options.fuzzySearch || false,
        caseSensitive: options.caseSensitive || false,
        maxResults: options.maxResults || 50,
        ...options
      }
      
      this.templatesDir = resolveTemplatesDir(__dirname)
      this.indexPath = path.join(this.templatesDir, "index.json")
      this.index = null
      this.stats = {
        searchesPerformed: 0,
        resultsReturned: 0,
        avgSearchTime: 0,
        startTime: Date.now()
      }
      this.searchHistory = []
      
      logWarning('constructor', 'TemplateSearcher initialized', {
        templatesDir: this.templatesDir,
        options: this.options
      })
    } catch (error) {
      logError('constructor', error)
      throw new TemplateSearchError(
        'Failed to initialize TemplateSearcher',
        'INITIALIZATION_ERROR',
        'constructor',
        false,
        { error: error.message }
      )
    }
  }

  /**
   * Enhanced initialization with comprehensive error handling
   */
  async init() {
    try {
      // Validate index file exists
      if (!safeFileExists(this.indexPath, 'init')) {
        throw new TemplateSearchError(
          `Template index file does not exist: ${this.indexPath}. Please run: npm run template:index`,
          'INDEX_FILE_NOT_FOUND',
          'init',
          false,
          { indexPath: this.indexPath }
        )
      }

      // Read and parse index file with retry
      const content = await retryOperation(
        () => safeReadFile(this.indexPath, 'utf8', 'init'),
        this.options.maxRetries,
        this.options.retryDelay
      )
      
      this.index = safeParseJSON(content, this.indexPath, 'init')
      
      // Validate index structure
      validateObject(this.index, 'index')
      validateArray(this.index.templates, 'index.templates')
      
      if (this.index.categories) {
        validateObject(this.index.categories, 'index.categories')
      }
      
      if (this.index.statistics) {
        validateObject(this.index.statistics, 'index.statistics')
      }
      
      logWarning('init', 'Template index loaded successfully', {
        templatesCount: this.index.templates.length,
        categoriesCount: Object.keys(this.index.categories || {}).length
      })
      
    } catch (error) {
      if (error instanceof TemplateSearchError) {
        console.error("❌", error.message)
        if (error.details) {
          console.error("📋 错误详情:", JSON.stringify(error.details, null, 2))
        }
        process.exit(1)
      } else {
        logError('init', error)
        console.error("❌ 初始化模板搜索器失败:", error.message)
        process.exit(1)
      }
    }
  }

  /**
   * Enhanced search with comprehensive error handling
   */
  search(query, options = {}) {
    try {
      const startTime = Date.now()
      
      if (!this.index) {
        throw new TemplateSearchError(
          'Template index not initialized',
          'INDEX_NOT_INITIALIZED',
          'search',
          false
        )
      }

      // Validate inputs
      if (query !== null && query !== undefined) {
        validateString(String(query), 'query', true)
      }
      
      validateObject(options, 'options')

      const searchOptions = {
        category: options.category,
        type: options.type,
        tags: options.tags,
        maxResults: options.maxResults || this.options.maxResults,
        caseSensitive: options.caseSensitive || this.options.caseSensitive,
        fuzzySearch: options.fuzzySearch || this.options.fuzzySearch
      }

      const results = this.index.templates.filter((template) => {
        try {
          validateObject(template, 'template')
          
          // Filter by category
          if (searchOptions.category && template.category) {
            const categoryMatch = searchOptions.caseSensitive 
              ? template.category.includes(searchOptions.category)
              : template.category.toLowerCase().includes(searchOptions.category.toLowerCase())
            
            if (!categoryMatch) return false
          }

          // Filter by type
          if (searchOptions.type && template.type) {
            const typeMatch = searchOptions.caseSensitive
              ? template.type === searchOptions.type
              : template.type.toLowerCase() === searchOptions.type.toLowerCase()
            
            if (!typeMatch) return false
          }

          // Filter by tags
          if (searchOptions.tags && searchOptions.tags.length > 0) {
            validateArray(template.tags, 'template.tags')
            
            const hasTag = searchOptions.tags.some((tag) => {
              validateString(tag, 'search tag')
              
              return template.tags.some((templateTag) => {
                validateString(templateTag, 'template tag')
                
                const searchTag = searchOptions.caseSensitive ? tag : tag.toLowerCase()
                const templateTagText = searchOptions.caseSensitive ? templateTag : templateTag.toLowerCase()
                
                return templateTagText.includes(searchTag)
              })
            })
            
            if (!hasTag) return false
          }

          // Text search
          if (query && query.trim() !== '') {
            const searchText = searchOptions.caseSensitive ? query : query.toLowerCase()
            
            // Search in name
            if (template.name) {
              const nameText = searchOptions.caseSensitive ? template.name : template.name.toLowerCase()
              if (nameText.includes(searchText)) return true
            }
            
            // Search in ID
            if (template.id) {
              const idText = searchOptions.caseSensitive ? template.id : template.id.toLowerCase()
              if (idText.includes(searchText)) return true
            }
            
            // Search in tags
            if (template.tags && Array.isArray(template.tags)) {
              const hasTagMatch = template.tags.some((tag) => {
                const tagText = searchOptions.caseSensitive ? tag : tag.toLowerCase()
                return tagText.includes(searchText)
              })
              if (hasTagMatch) return true
            }
            
            // Search in AI triggers
            if (template.ai_triggers && Array.isArray(template.ai_triggers)) {
              const hasTriggerMatch = template.ai_triggers.some((trigger) => {
                const triggerText = searchOptions.caseSensitive ? trigger : trigger.toLowerCase()
                return triggerText.includes(searchText)
              })
              if (hasTriggerMatch) return true
            }
            
            // Search in scenarios
            if (template.scenarios && Array.isArray(template.scenarios)) {
              const hasScenarioMatch = template.scenarios.some((scenario) => {
                const scenarioText = searchOptions.caseSensitive ? scenario : scenario.toLowerCase()
                return scenarioText.includes(searchText)
              })
              if (hasScenarioMatch) return true
            }
            
            return false
          }

          return true
        } catch (templateError) {
          logWarning('search.filter', 'Failed to process template during search', {
            templateId: template.id,
            error: templateError.message
          })
          return false
        }
      })

      // Limit results
      const limitedResults = results.slice(0, searchOptions.maxResults)
      
      // Update statistics
      const searchTime = Date.now() - startTime
      this.updateStats(limitedResults.length, searchTime)
      
      // Record search history
      this.recordSearch(query, searchOptions, limitedResults.length, searchTime)
      
      logWarning('search', 'Search completed', {
        query: query || 'all',
        resultsCount: limitedResults.length,
        searchTime: `${searchTime}ms`
      })
      
      return limitedResults
      
    } catch (error) {
      logError('search', error, { query, options })
      if (error instanceof TemplateSearchError) {
        throw error
      } else {
        throw new TemplateSearchError(
          `Search operation failed: ${error.message}`,
          'SEARCH_OPERATION_ERROR',
          'search',
          true,
          { query, options, error: error.message }
        )
      }
    }
  }

  /**
   * Enhanced AI trigger search with comprehensive error handling
   */
  searchByTrigger(trigger) {
    try {
      const startTime = Date.now()
      
      if (!this.index) {
        throw new TemplateSearchError(
          'Template index not initialized',
          'INDEX_NOT_INITIALIZED',
          'searchByTrigger',
          false
        )
      }

      validateString(trigger, 'trigger')
      
      const triggerLower = this.options.caseSensitive ? trigger : trigger.toLowerCase()
      
      const results = this.index.templates
        .filter((template) => {
          try {
            validateObject(template, 'template')
            
            if (!template.ai_triggers || !Array.isArray(template.ai_triggers)) {
              return false
            }
            
            return template.ai_triggers.some((t) => {
              validateString(t, 'AI trigger')
              const triggerText = this.options.caseSensitive ? t : t.toLowerCase()
              return triggerText.includes(triggerLower)
            })
          } catch (templateError) {
            logWarning('searchByTrigger.filter', 'Failed to process template during trigger search', {
              templateId: template.id,
              error: templateError.message
            })
            return false
          }
        })
        .sort((a, b) => {
          try {
            // Calculate match scores with error handling
            const aScore = this.calculateMatchScore(a, triggerLower)
            const bScore = this.calculateMatchScore(b, triggerLower)
            return bScore - aScore
          } catch (sortError) {
            logWarning('searchByTrigger.sort', 'Failed to sort templates by score', {
              error: sortError.message
            })
            return 0
          }
        })
      
      // Update statistics
      const searchTime = Date.now() - startTime
      this.updateStats(results.length, searchTime)
      
      logWarning('searchByTrigger', 'Trigger search completed', {
        trigger,
        resultsCount: results.length,
        searchTime: `${searchTime}ms`
      })
      
      return results
      
    } catch (error) {
      logError('searchByTrigger', error, { trigger })
      if (error instanceof TemplateSearchError) {
        throw error
      } else {
        throw new TemplateSearchError(
          `Trigger search failed: ${error.message}`,
          'TRIGGER_SEARCH_ERROR',
          'searchByTrigger',
          true,
          { trigger, error: error.message }
        )
      }
    }
  }

  /**
   * Enhanced match score calculation with error handling
   */
  calculateMatchScore(template, trigger) {
    try {
      validateObject(template, 'template')
      validateString(trigger, 'trigger')
      
      let score = 0

      // Exact match scores higher
      if (template.ai_triggers && Array.isArray(template.ai_triggers)) {
        template.ai_triggers.forEach((t) => {
          validateString(t, 'AI trigger')
          const triggerText = this.options.caseSensitive ? t : t.toLowerCase()
          
          if (triggerText === trigger) {
            score += 10
          } else if (triggerText.includes(trigger)) {
            score += 5
          }
        })
      }

      // Tag match
      if (template.tags && Array.isArray(template.tags)) {
        template.tags.forEach((tag) => {
          validateString(tag, 'tag')
          const tagText = this.options.caseSensitive ? tag : tag.toLowerCase()
          
          if (tagText.includes(trigger)) {
            score += 3
          }
        })
      }

      // Name match
      if (template.name) {
        validateString(template.name, 'template name')
        const nameText = this.options.caseSensitive ? template.name : template.name.toLowerCase()
        
        if (nameText.includes(trigger)) {
          score += 2
        }
      }

      return score
      
    } catch (error) {
      logWarning('calculateMatchScore', 'Failed to calculate match score', {
        templateId: template.id,
        trigger,
        error: error.message
      })
      return 0
    }
  }

  /**
   * Enhanced recommendations with comprehensive error handling
   */
  getRecommendations(context = {}) {
    try {
      const startTime = Date.now()
      
      if (!this.index) {
        throw new TemplateSearchError(
          'Template index not initialized',
          'INDEX_NOT_INITIALIZED',
          'getRecommendations',
          false
        )
      }

      validateObject(context, 'context')
      
      const { entityType, operation, framework } = context
      let candidates = [...this.index.templates]

      // Filter by context with error handling
      if (entityType) {
        validateString(entityType, 'entityType')
        candidates = candidates.filter((t) => {
          try {
            validateObject(t, 'template')
            
            const hasScenario = t.scenarios && Array.isArray(t.scenarios) && 
              t.scenarios.some((s) => {
                validateString(s, 'scenario')
                const scenarioText = this.options.caseSensitive ? s : s.toLowerCase()
                const entityTypeText = this.options.caseSensitive ? entityType : entityType.toLowerCase()
                return scenarioText.includes(entityTypeText)
              })
            
            const hasTrigger = t.ai_triggers && Array.isArray(t.ai_triggers) &&
              t.ai_triggers.some((trigger) => {
                validateString(trigger, 'AI trigger')
                const triggerText = this.options.caseSensitive ? trigger : trigger.toLowerCase()
                const entityTypeText = this.options.caseSensitive ? entityType : entityType.toLowerCase()
                return triggerText.includes(entityTypeText)
              })
            
            return hasScenario || hasTrigger
          } catch (filterError) {
            logWarning('getRecommendations.entityType', 'Failed to filter template by entity type', {
              templateId: t.id,
              error: filterError.message
            })
            return false
          }
        })
      }

      if (operation) {
        validateString(operation, 'operation')
        candidates = candidates.filter((t) => {
          try {
            validateObject(t, 'template')
            
            const hasTrigger = t.ai_triggers && Array.isArray(t.ai_triggers) &&
              t.ai_triggers.some((trigger) => {
                validateString(trigger, 'AI trigger')
                const triggerText = this.options.caseSensitive ? trigger : trigger.toLowerCase()
                const operationText = this.options.caseSensitive ? operation : operation.toLowerCase()
                return triggerText.includes(operationText)
              })
            
            const hasTag = t.tags && Array.isArray(t.tags) &&
              t.tags.some((tag) => {
                validateString(tag, 'tag')
                const tagText = this.options.caseSensitive ? tag : tag.toLowerCase()
                const operationText = this.options.caseSensitive ? operation : operation.toLowerCase()
                return tagText.includes(operationText)
              })
            
            return hasTrigger || hasTag
          } catch (filterError) {
            logWarning('getRecommendations.operation', 'Failed to filter template by operation', {
              templateId: t.id,
              error: filterError.message
            })
            return false
          }
        })
      }

      if (framework) {
        validateString(framework, 'framework')
        candidates = candidates.filter((t) => {
          try {
            validateObject(t, 'template')
            
            const hasDependency = t.dependencies && Array.isArray(t.dependencies) &&
              t.dependencies.some((dep) => {
                validateString(dep, 'dependency')
                const depText = this.options.caseSensitive ? dep : dep.toLowerCase()
                const frameworkText = this.options.caseSensitive ? framework : framework.toLowerCase()
                return depText.includes(frameworkText)
              })
            
            const hasCategory = t.category && 
              (this.options.caseSensitive ? t.category : t.category.toLowerCase()).includes(
                this.options.caseSensitive ? framework : framework.toLowerCase()
              )
            
            return hasDependency || hasCategory
          } catch (filterError) {
            logWarning('getRecommendations.framework', 'Failed to filter template by framework', {
              templateId: t.id,
              error: filterError.message
            })
            return false
          }
        })
      }

      // Sort by usage frequency and quality (simplified to dependency count)
      const sortedCandidates = candidates
        .sort((a, b) => {
          try {
            const aScore = (a.dependencies ? a.dependencies.length : 0) + 
                          (a.ai_triggers ? a.ai_triggers.length : 0)
            const bScore = (b.dependencies ? b.dependencies.length : 0) + 
                          (b.ai_triggers ? b.ai_triggers.length : 0)
            return bScore - aScore
          } catch (sortError) {
            logWarning('getRecommendations.sort', 'Failed to sort templates by score', {
              error: sortError.message
            })
            return 0
          }
        })
        .slice(0, 5)
      
      // Update statistics
      const searchTime = Date.now() - startTime
      this.updateStats(sortedCandidates.length, searchTime)
      
      logWarning('getRecommendations', 'Recommendations generated', {
        context,
        resultsCount: sortedCandidates.length,
        searchTime: `${searchTime}ms`
      })
      
      return sortedCandidates
      
    } catch (error) {
      logError('getRecommendations', error, { context })
      if (error instanceof TemplateSearchError) {
        throw error
      } else {
        throw new TemplateSearchError(
          `Failed to get recommendations: ${error.message}`,
          'RECOMMENDATIONS_ERROR',
          'getRecommendations',
          true,
          { context, error: error.message }
        )
      }
    }
  }

  /**
   * Enhanced template details display with error handling
   */
  showTemplate(templateId) {
    try {
      if (!this.index) {
        throw new TemplateSearchError(
          'Template index not initialized',
          'INDEX_NOT_INITIALIZED',
          'showTemplate',
          false
        )
      }

      validateString(templateId, 'templateId')
      
      const template = this.index.templates.find((t) => {
        try {
          validateObject(t, 'template')
          return t.id === templateId
        } catch (findError) {
          logWarning('showTemplate.find', 'Failed to check template ID', {
            error: findError.message
          })
          return false
        }
      })
      
      if (!template) {
        console.log(`❌ 未找到模板: ${templateId}`)
        return
      }

      // Display template details with error handling
      console.log(`\n📋 模板详情: ${template.name || 'Unknown'}`)
      console.log(`🆔 ID: ${template.id || 'N/A'}`)
      console.log(`📁 分类: ${template.category || 'N/A'}`)
      console.log(`🏷️  类型: ${template.type || 'N/A'}`)
      console.log(`📄 路径: ${template.path || 'N/A'}`)

      if (template.tags && Array.isArray(template.tags) && template.tags.length > 0) {
        console.log(`🏷️  标签: ${template.tags.join(", ")}`)
      }

      if (template.ai_triggers && Array.isArray(template.ai_triggers) && template.ai_triggers.length > 0) {
        console.log(`🎯 AI触发词: ${template.ai_triggers.join(", ")}`)
      }

      if (template.scenarios && Array.isArray(template.scenarios) && template.scenarios.length > 0) {
        console.log(`💡 适用场景: ${template.scenarios.join(", ")}`)
      }

      if (template.dependencies && Array.isArray(template.dependencies) && template.dependencies.length > 0) {
        console.log(`📦 依赖项: ${template.dependencies.join(", ")}`)
      }

      console.log(`🔐 需要权限: ${template.permissions_required ? "是" : "否"}`)

      if (template.parameters && Array.isArray(template.parameters) && template.parameters.length > 0) {
        console.log(`\n⚙️  参数:`)
        template.parameters.forEach((param, index) => {
          try {
            validateObject(param, 'parameter')
            console.log(`  ${index + 1}. ${param.name || 'Unknown'} (${param.type || 'unknown'}): ${param.description || 'No description'}`)
            if (param.example) {
              console.log(`     示例: ${param.example}`)
            }
          } catch (paramError) {
            logWarning('showTemplate.parameters', 'Failed to display parameter', {
              parameterIndex: index,
              error: paramError.message
            })
          }
        })
      }
      
      // Update statistics
      this.stats.searchesPerformed++
      
    } catch (error) {
      logError('showTemplate', error, { templateId })
      if (error instanceof TemplateSearchError) {
        throw error
      } else {
        throw new TemplateSearchError(
          `Failed to show template details: ${error.message}`,
          'SHOW_TEMPLATE_ERROR',
          'showTemplate',
          false,
          { templateId, error: error.message }
        )
      }
    }
  }

  /**
   * Enhanced categories listing with error handling
   */
  listCategories() {
    try {
      if (!this.index) {
        throw new TemplateSearchError(
          'Template index not initialized',
          'INDEX_NOT_INITIALIZED',
          'listCategories',
          false
        )
      }

      console.log("\n📂 模板分类:")
      
      if (!this.index.categories || typeof this.index.categories !== 'object') {
        console.log("⚠️  暂无分类信息")
        return
      }

      Object.entries(this.index.categories).forEach(([main, subs]) => {
        try {
          validateString(main, 'main category')
          console.log(`\n${main}:`)
          
          if (typeof subs === "object" && subs !== null) {
            Object.entries(subs).forEach(([sub, desc]) => {
              try {
                validateString(sub, 'sub category')
                validateString(desc, 'category description', true)
                
                const count = this.index.templates.filter((t) => {
                  try {
                    validateObject(t, 'template')
                    return t.category === `${main}/${sub}`
                  } catch (countError) {
                    logWarning('listCategories.count', 'Failed to count templates in category', {
                      category: `${main}/${sub}`,
                      error: countError.message
                    })
                    return false
                  }
                }).length
                
                console.log(`  - ${sub}: ${desc} (${count} 个模板)`)
              } catch (subError) {
                logWarning('listCategories.sub', 'Failed to process subcategory', {
                  main,
                  sub,
                  error: subError.message
                })
              }
            })
          } else {
            console.log(`  - ${subs}`)
          }
        } catch (mainError) {
          logWarning('listCategories.main', 'Failed to process main category', {
            main,
            error: mainError.message
          })
        }
      })
      
    } catch (error) {
      logError('listCategories', error)
      if (error instanceof TemplateSearchError) {
        throw error
      } else {
        throw new TemplateSearchError(
          `Failed to list categories: ${error.message}`,
          'LIST_CATEGORIES_ERROR',
          'listCategories',
          false,
          { error: error.message }
        )
      }
    }
  }

  /**
   * Enhanced statistics display with error handling
   */
  showStats() {
    try {
      if (!this.index) {
        throw new TemplateSearchError(
          'Template index not initialized',
          'INDEX_NOT_INITIALIZED',
          'showStats',
          false
        )
      }

      const stats = this.index.statistics || {}
      const runtimeStats = this.getStats()

      console.log("\n📊 模板库统计:")
      console.log(`📋 总模板数: ${stats.total_templates || 0}`)
      console.log(`📂 分类数: ${stats.categories_count || 0}`)
      console.log(`🔧 后端模板: ${stats.backend_templates || 0}`)
      console.log(`🎨 前端模板: ${stats.frontend_templates || 0}`)
      console.log(`📅 最后更新: ${this.index.lastUpdated || "未知"}`)
      
      console.log(`\n🔍 搜索统计:`)
      console.log(`📈 搜索次数: ${runtimeStats.searchesPerformed}`)
      console.log(`📊 平均结果数: ${runtimeStats.avgResultsCount}`)
      console.log(`⏱️  平均搜索时间: ${runtimeStats.avgSearchTime}ms`)
      console.log(`📋 搜索历史记录: ${this.searchHistory.length} 条`)
      
    } catch (error) {
      logError('showStats', error)
      if (error instanceof TemplateSearchError) {
        throw error
      } else {
        throw new TemplateSearchError(
          `Failed to show statistics: ${error.message}`,
          'SHOW_STATS_ERROR',
          'showStats',
          false,
          { error: error.message }
        )
      }
    }
  }

  /**
   * Update search statistics
   */
  updateStats(resultsCount, searchTime) {
    try {
      this.stats.searchesPerformed++
      this.stats.resultsReturned += resultsCount
      
      // Calculate running average
      const totalTime = this.stats.avgSearchTime * (this.stats.searchesPerformed - 1) + searchTime
      this.stats.avgSearchTime = Math.round(totalTime / this.stats.searchesPerformed)
      
    } catch (error) {
      logWarning('updateStats', 'Failed to update statistics', {
        error: error.message
      })
    }
  }

  /**
   * Record search history
   */
  recordSearch(query, options, resultsCount, searchTime) {
    try {
      this.searchHistory.push({
        timestamp: new Date().toISOString(),
        query: query || 'all',
        options,
        resultsCount,
        searchTime,
        success: resultsCount > 0
      })
      
      // Keep only last 100 searches
      if (this.searchHistory.length > 100) {
        this.searchHistory = this.searchHistory.slice(-100)
      }
      
    } catch (error) {
      logWarning('recordSearch', 'Failed to record search history', {
        error: error.message
      })
    }
  }

  /**
   * Get current statistics
   */
  getStats() {
    const avgResultsCount = this.stats.searchesPerformed > 0 
      ? Math.round(this.stats.resultsReturned / this.stats.searchesPerformed)
      : 0
      
    return {
      ...this.stats,
      avgResultsCount,
      uptime: Date.now() - this.stats.startTime
    }
  }

  /**
   * Get search history
   */
  getSearchHistory(limit = 10) {
    return this.searchHistory.slice(-limit)
  }

  /**
   * Clear search history
   */
  clearSearchHistory() {
    this.searchHistory = []
    logWarning('clearSearchHistory', 'Search history cleared')
  }
}

/**
 * Enhanced CLI execution with comprehensive error handling
 */
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!command) {
    console.log(`
🔍 SmartAbp 模板搜索工具

用法:
  npm run template:search search <关键词>     # 搜索模板
  npm run template:search trigger <触发词>   # 按AI触发词搜索
  npm run template:search show <模板ID>      # 显示模板详情
  npm run template:search categories        # 列出所有分类
  npm run template:search stats            # 显示统计信息
  npm run template:search recommend [类型] [操作] [框架] # 获取推荐

示例:
  npm run template:search search crud
  npm run template:search trigger "管理页面"
  npm run template:search show backend-application-crudappservice-template
  npm run template:search recommend 用户 CRUD vue
    `)
    return
  }

  try {
    const searcher = new TemplateSearcher()
    await searcher.init()

    switch (command) {
      case "search":
        const query = args[1]
        const searchResults = searcher.search(query)

        console.log(`\n🔍 搜索结果 (${searchResults.length} 个):`)
        searchResults.forEach((template, index) => {
          try {
            console.log(`\n${index + 1}. 📋 ${template.name || 'Unknown'} (${template.id || 'unknown'})`)
            console.log(`   📁 ${template.category || 'N/A'} | 🏷️ ${template.type || 'N/A'}`)
            if (template.ai_triggers && Array.isArray(template.ai_triggers) && template.ai_triggers.length > 0) {
              console.log(`   🎯 ${template.ai_triggers.slice(0, 3).join(", ")}`)
            }
          } catch (displayError) {
            logWarning('main.search.display', 'Failed to display search result', {
              templateIndex: index,
              error: displayError.message
            })
          }
        })
        break

      case "trigger":
        const trigger = args[1]
        if (!trigger) {
          throw new TemplateSearchError(
            'Please provide a trigger word',
            'MISSING_TRIGGER',
            'main.trigger',
            false
          )
        }

        const triggerResults = searcher.searchByTrigger(trigger)
        console.log(`\n🎯 触发词 "${trigger}" 的匹配结果 (${triggerResults.length} 个):`)
        triggerResults.forEach((template, index) => {
          try {
            console.log(`\n${index + 1}. 📋 ${template.name || 'Unknown'} (${template.id || 'unknown'})`)
            console.log(`   📁 ${template.category || 'N/A'} | 🏷️ ${template.type || 'N/A'}`)
            if (template.scenarios && Array.isArray(template.scenarios) && template.scenarios.length > 0) {
              console.log(`   💡 ${template.scenarios.slice(0, 2).join(", ")}`)
            }
          } catch (displayError) {
            logWarning('main.trigger.display', 'Failed to display trigger search result', {
              templateIndex: index,
              error: displayError.message
            })
          }
        })
        break

      case "show":
        const templateId = args[1]
        if (!templateId) {
          throw new TemplateSearchError(
            'Please provide a template ID',
            'MISSING_TEMPLATE_ID',
            'main.show',
            false
          )
        }
        searcher.showTemplate(templateId)
        break

      case "categories":
        searcher.listCategories()
        break

      case "stats":
        searcher.showStats()
        break

      case "recommend":
        const context = {
          entityType: args[1],
          operation: args[2],
          framework: args[3],
        }

        const recommendations = searcher.getRecommendations(context)
        console.log(`\n💡 推荐模板 (${recommendations.length} 个):`)
        recommendations.forEach((template, index) => {
          try {
            console.log(`\n${index + 1}. 📋 ${template.name || 'Unknown'} (${template.id || 'unknown'})`)
            console.log(`   📁 ${template.category || 'N/A'} | 🏷️ ${template.type || 'N/A'}`)
            if (template.ai_triggers && Array.isArray(template.ai_triggers) && template.ai_triggers.length > 0) {
              console.log(`   🎯 ${template.ai_triggers.slice(0, 3).join(", ")}`)
            }
          } catch (displayError) {
            logWarning('main.recommend.display', 'Failed to display recommendation', {
              templateIndex: index,
              error: displayError.message
            })
          }
        })
        break

      default:
        throw new TemplateSearchError(
          `Unknown command: ${command}`,
          'UNKNOWN_COMMAND',
          'main',
          false,
          { command }
        )
    }

    // Show search statistics
    const stats = searcher.getStats()
    console.log(`\n📊 搜索统计 - 总搜索次数: ${stats.searchesPerformed}, 平均搜索时间: ${stats.avgSearchTime}ms`)
    
  } catch (error) {
    if (error instanceof TemplateSearchError) {
      console.error(`\n❌ ${error.message}`)
      if (error.details) {
        console.error("📋 错误详情:", JSON.stringify(error.details, null, 2))
      }
    } else {
      logError('main', error)
      console.error("\n❌ 执行失败:", error.message)
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
  TemplateSearcher,
  TemplateSearchError
}
