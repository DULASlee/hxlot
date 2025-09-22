#!/usr/bin/env node

/**
 * Enhanced Simple Template Index Builder (CommonJS) with comprehensive error handling and performance optimization
 * 简化版模板索引构建脚本（CommonJS）- 包含性能监控和缓存机制
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

/**
 * Performance metrics tracking
 */
const PERFORMANCE_METRICS = {
  totalTemplates: 0,
  processedTemplates: 0,
  failedTemplates: 0,
  avgProcessingTime: 0,
  cacheHits: 0,
  cacheMisses: 0,
  memoryUsage: 0,
  errorCount: 0,
  fileOperations: {
    reads: 0,
    writes: 0,
    stats: 0
  }
};

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  enabled: true,
  maxSize: 50,
  ttl: 300000, // 5 minutes
  entries: new Map()
};

/**
 * Memory usage monitor
 */
class MemoryMonitor {
  constructor() {
    this.startMemory = process.memoryUsage();
    this.peakMemory = { ...this.startMemory };
  }
  
  update() {
    const current = process.memoryUsage();
    
    // Update peak memory usage
    Object.keys(current).forEach(key => {
      if (current[key] > this.peakMemory[key]) {
        this.peakMemory[key] = current[key];
      }
    });
    
    return {
      current,
      peak: this.peakMemory,
      delta: {
        heapUsed: current.heapUsed - this.startMemory.heapUsed,
        external: current.external - this.startMemory.external,
        rss: current.rss - this.startMemory.rss
      }
    };
  }
  
  reset() {
    this.startMemory = process.memoryUsage();
    this.peakMemory = { ...this.startMemory };
  }
}

/**
 * Error handling utilities with performance tracking
 */
const logError = (operation, error, context = {}) => {
  PERFORMANCE_METRICS.errorCount++;
  
  console.error(`[SimpleTemplateIndexBuilder] ${operation} failed:`, {
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    context,
    timestamp: new Date().toISOString()
  });
};

const logWarning = (operation, message, context = {}) => {
  console.warn(`[SimpleTemplateIndexBuilder] ${operation}:`, {
    message,
    context,
    timestamp: new Date().toISOString()
  });
};

const logInfo = (operation, message, context = {}) => {
  console.log(`[SimpleTemplateIndexBuilder] ${operation}:`, {
    message,
    context,
    timestamp: new Date().toISOString()
  });
};

/**
 * Cache management functions
 */
function getCacheKey(operation, filePath, content) {
  try {
    const contentHash = content ? Buffer.from(content).toString('base64').slice(0, 16) : '';
    return `${operation}:${filePath}:${contentHash}`;
  } catch (error) {
    logWarning('getCacheKey', 'Failed to generate cache key', { error: error.message });
    return null;
  }
}

function getCacheEntry(key) {
  if (!CACHE_CONFIG.enabled || !key) return null;
  
  const entry = CACHE_CONFIG.entries.get(key);
  if (!entry) {
    PERFORMANCE_METRICS.cacheMisses++;
    return null;
  }
  
  // Check TTL
  if (Date.now() - entry.timestamp > CACHE_CONFIG.ttl) {
    CACHE_CONFIG.entries.delete(key);
    PERFORMANCE_METRICS.cacheMisses++;
    return null;
  }
  
  PERFORMANCE_METRICS.cacheHits++;
  return entry.result;
}

function setCacheEntry(key, result) {
  if (!CACHE_CONFIG.enabled || !key) return;
  
  // Clean up old entries if cache is full
  if (CACHE_CONFIG.entries.size >= CACHE_CONFIG.maxSize) {
    const oldestKey = CACHE_CONFIG.entries.keys().next().value;
    if (oldestKey) {
      CACHE_CONFIG.entries.delete(oldestKey);
    }
  }
  
  CACHE_CONFIG.entries.set(key, {
    result,
    timestamp: Date.now()
  });
}

function clearCache() {
  CACHE_CONFIG.entries.clear();
  PERFORMANCE_METRICS.cacheHits = 0;
  PERFORMANCE_METRICS.cacheMisses = 0;
  logInfo('clearCache', 'Cache cleared');
}

/**
 * Safe file system operations with enhanced error handling
 */
const safeFileExists = (filePath, operation) => {
  try {
    PERFORMANCE_METRICS.fileOperations.stats++;
    return fs.existsSync(filePath);
  } catch (error) {
    logError(`${operation}.fileExists`, error, { filePath });
    return false;
  }
};

const safeReadFile = (filePath, encoding = 'utf8', operation) => {
  try {
    PERFORMANCE_METRICS.fileOperations.reads++;
    return fs.readFileSync(filePath, encoding);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const errorObj = new Error(`File not found: ${filePath}`);
      errorObj.code = 'FILE_NOT_FOUND';
      errorObj.operation = operation;
      throw errorObj;
    }
    const errorObj = new Error(`Failed to read file: ${error.message}`);
    errorObj.code = 'FILE_READ_ERROR';
    errorObj.operation = operation;
    errorObj.retryable = true;
    throw errorObj;
  }
};

const safeWriteFile = (filePath, content, encoding = 'utf8', operation) => {
  try {
    PERFORMANCE_METRICS.fileOperations.writes++;
    fs.writeFileSync(filePath, content, encoding);
    return true;
  } catch (error) {
    const errorObj = new Error(`Failed to write file: ${error.message}`);
    errorObj.code = 'FILE_WRITE_ERROR';
    errorObj.operation = operation;
    errorObj.retryable = true;
    throw errorObj;
  }
};

/**
 * Retry mechanism for operations with enhanced error handling
 */
const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (error.retryable && attempt < maxRetries) {
        logWarning('retryOperation', `Attempt ${attempt} failed, retrying in ${delay}ms`, {
          error: error.message,
          attempt,
          maxRetries
        });
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }
  
  throw lastError;
};

/**
 * Resolve the repository-level templates directory by walking up from current file
 */
function resolveTemplatesDir(startDir) {
  try {
    let currentDir = startDir;
    for (let i = 0; i < 10; i++) {
      const candidate = path.join(currentDir, 'templates');
      try {
        if (safeFileExists(candidate, 'resolveTemplatesDir')) {
          return candidate;
        }
      } catch (e) {
        // ignore and continue walking up
      }
      const parent = path.dirname(currentDir);
      if (parent === currentDir) break;
      currentDir = parent;
    }
    // Fallback to cwd/templates
    return path.resolve(process.cwd(), 'templates');
  } catch (error) {
    logError('resolveTemplatesDir', error, { startDir });
    throw error;
  }
}

/**
 * Enhanced SimpleTemplateIndexBuilder class with comprehensive error handling and performance optimization
 */
class SimpleTemplateIndexBuilder {
  constructor(options = {}) {
    try {
      this.options = {
        enableCache: options.enableCache !== false,
        enablePerformanceMonitoring: options.enablePerformanceMonitoring || false,
        enableMemoryMonitoring: options.enableMemoryMonitoring || false,
        verbose: options.verbose || false,
        maxRetries: options.maxRetries || 3,
        retryDelay: options.retryDelay || 1000,
        ...options
      };
      this.templatesDir = resolveTemplatesDir(__dirname);
      this.outputPath = path.join(this.templatesDir, 'index.json');
      this.templates = [];
      this.processingStats = {
        totalProcessed: 0,
        successful: 0,
        failed: 0,
        startTime: Date.now()
      };
      this.memoryMonitor = this.options.enableMemoryMonitoring ? new MemoryMonitor() : null;
      
      logInfo('constructor', 'SimpleTemplateIndexBuilder initialized', {
        templatesDir: this.templatesDir,
        outputPath: this.outputPath,
        options: this.options
      });
    } catch (error) {
      logError('constructor', error);
      throw error;
    }
  }

  async build() {
    const startTime = performance.now();
    
    console.log('🔨 开始构建模板索引...\n');
    try {
      await this.scanTemplates();
      await this.generateIndex();
      
      const duration = performance.now() - startTime;
      
      // Update memory usage
      if (this.memoryMonitor) {
        const memoryInfo = this.memoryMonitor.update();
        PERFORMANCE_METRICS.memoryUsage = memoryInfo.current.heapUsed;
      }
      
      console.log(`✅ 模板索引构建完成！`);
      console.log(`📁 输出文件: ${this.outputPath}`);
      console.log(`📊 共发现 ${this.templates.length} 个模板`);
      
      if (this.options.enablePerformanceMonitoring) {
        console.log(`\n📈 性能指标:`);
        console.log(`  成功处理: ${this.processingStats.successful}`);
        console.log(`  失败处理: ${this.processingStats.failed}`);
        console.log(`  平均处理时间: ${PERFORMANCE_METRICS.avgProcessingTime.toFixed(2)}ms`);
        console.log(`  缓存命中率: ${((PERFORMANCE_METRICS.cacheHits / (PERFORMANCE_METRICS.cacheHits + PERFORMANCE_METRICS.cacheMisses)) * 100).toFixed(2)}%`);
        console.log(`  文件操作: ${PERFORMANCE_METRICS.fileOperations.reads} 读, ${PERFORMANCE_METRICS.fileOperations.writes} 写`);
      }
      
      if (this.memoryMonitor) {
        const memoryInfo = this.memoryMonitor.update();
        console.log(`\n💾 内存使用:`);
        console.log(`  当前堆内存: ${(memoryInfo.current.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  峰值堆内存: ${(memoryInfo.peak.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  内存增量: ${(memoryInfo.delta.heapUsed / 1024 / 1024).toFixed(2)} MB`);
      }
      
    } catch (error) {
      logError('build', error);
      console.error('❌ 构建索引时发生错误:', error.message);
      if (error.details) {
        console.error('📋 错误详情:', JSON.stringify(error.details, null, 2));
      }
      process.exit(1);
    }
  }

  async scanTemplates() {
    try {
      const startTime = performance.now();
      
      const templateFiles = this.findTemplateFiles(this.templatesDir);
      PERFORMANCE_METRICS.totalTemplates = templateFiles.length;
      
      console.log(`📋 扫描到 ${templateFiles.length} 个模板文件`);
      
      // Process templates with progress tracking
      const processingPromises = templateFiles.map((filePath, index) => 
        this.processTemplateWithProgress(filePath, index, templateFiles.length)
      );
      
      const results = await Promise.allSettled(processingPromises);
      
      // Handle results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          this.processingStats.successful++;
          if (result.value) {
            this.templates.push(result.value);
          }
        } else {
          this.processingStats.failed++;
          logWarning('scanTemplates', 'Failed to process template', {
            filePath: templateFiles[index],
            error: result.reason.message
          });
        }
      });
      
      const duration = performance.now() - startTime;
      logInfo('scanTemplates', 'Templates scan completed', {
        totalFiles: templateFiles.length,
        successful: this.processingStats.successful,
        failed: this.processingStats.failed,
        duration: `${duration.toFixed(2)}ms`
      });
      
    } catch (error) {
      logError('scanTemplates', error);
      throw error;
    }
  }

  /**
   * Process template with progress tracking and error handling
   */
  async processTemplateWithProgress(filePath, index, total) {
    try {
      const startTime = performance.now();
      
      if (this.options.verbose) {
        console.log(`  📋 处理模板 ${index + 1}/${total}: ${path.relative(this.templatesDir, filePath)}`);
      }
      
      const template = await this.processTemplate(filePath);
      
      const duration = performance.now() - startTime;
      
      // Update average processing time
      if (this.options.enablePerformanceMonitoring) {
        PERFORMANCE_METRICS.avgProcessingTime = 
          (PERFORMANCE_METRICS.avgProcessingTime * this.processingStats.totalProcessed + duration) 
          / (this.processingStats.totalProcessed + 1);
      }
      
      this.processingStats.totalProcessed++;
      
      if (this.options.verbose && template) {
        console.log(`    ✅ 完成: ${template.name} (${duration.toFixed(2)}ms)`);
      }
      
      return template;
      
    } catch (error) {
      this.processingStats.failed++;
      logError('processTemplateWithProgress', error, { filePath });
      throw error;
    }
  }

  findTemplateFiles(dir) {
    try {
      const files = [];
      
      const scan = (currentDir, depth = 0) => {
        try {
          if (depth > 5) {
            logWarning('findTemplateFiles', 'Maximum directory depth reached', {
              dir: currentDir,
              depth
            });
            return;
          }
          
          if (!safeFileExists(currentDir, 'findTemplateFiles')) return;
          
          const items = fs.readdirSync(currentDir);
          
          items.forEach(item => {
            try {
              const fullPath = path.join(currentDir, item);
              const stat = fs.statSync(fullPath);
              
              if (stat.isDirectory()) {
                // Skip common directories that don't contain templates
                const skipDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', '.cache'];
                if (skipDirs.includes(item)) {
                  return;
                }
                scan(fullPath, depth + 1);
              } else if (item.includes('.template.') && !item.includes('.meta.')) {
                files.push(fullPath);
              }
            } catch (itemError) {
              logWarning('findTemplateFiles.item', 'Failed to process directory item', {
                item: item.name,
                dir: currentDir,
                error: itemError.message
              });
            }
          });
        } catch (dirError) {
          logWarning('findTemplateFiles.directory', 'Failed to scan directory', {
            dir: currentDir,
            error: dirError.message
          });
        }
      };
      
      scan(dir);
      
      logInfo('findTemplateFiles', 'Template files found', {
        count: files.length
      });
      
      return files;
      
    } catch (error) {
      logError('findTemplateFiles', error, { dir });
      throw error;
    }
  }

  async processTemplate(filePath) {
    try {
      const startTime = performance.now();
      
      // Check cache
      const cacheKey = this.options.enableCache ? getCacheKey('processTemplate', filePath, null) : null;
      const cachedResult = cacheKey ? getCacheEntry(cacheKey) : null;
      
      if (cachedResult) {
        const duration = performance.now() - startTime;
        logInfo('processTemplate', 'Template processed (cached)', {
          filePath,
          duration: `${duration.toFixed(2)}ms`
        });
        return cachedResult;
      }
      
      const relativePath = path.relative(this.templatesDir, filePath);
      
      // Read template content with retry
      const content = await retryOperation(
        () => safeReadFile(filePath, 'utf8', 'processTemplate'),
        this.options.maxRetries,
        this.options.retryDelay
      );
      
      const aiInfo = this.extractAITemplateInfo(content);
      const templateId = this.generateTemplateId(relativePath);
      const category = this.parseCategory(relativePath);
      
      const template = {
        id: templateId,
        name: aiInfo.name || path.basename(filePath, path.extname(filePath)),
        path: `templates/${relativePath.replace(/\\/g, '/')}`,
        category: category,
        type: this.extractType(relativePath),
        tags: aiInfo.tags || [],
        scenarios: aiInfo.scenarios || [],
        ai_triggers: aiInfo.ai_triggers || [],
        dependencies: aiInfo.dependencies || [],
        permissions_required: aiInfo.permissions_required || false
      };
      
      // Cache the result
      if (cacheKey) {
        setCacheEntry(cacheKey, template);
      }
      
      const duration = performance.now() - startTime;
      logInfo('processTemplate', 'Template processed successfully', {
        filePath,
        templateId: template.id,
        name: template.name,
        duration: `${duration.toFixed(2)}ms`
      });
      
      return template;
      
    } catch (error) {
      logError('processTemplate', error, { filePath });
      throw error;
    }
  }

  extractAITemplateInfo(content) {
    try {
      const info = { 
        tags: [], 
        scenarios: [], 
        ai_triggers: [], 
        dependencies: [], 
        permissions_required: false 
      };
      
      const aiInfoMatch = content.match(/AI_TEMPLATE_INFO[:\s]*\n([\s\S]*?)(?=\*\/|-->|###)/);
      if (aiInfoMatch) {
        const infoText = aiInfoMatch[1];
        info.name = this.extractInfoField(infoText, '模板类型');
        info.description = this.extractInfoField(infoText, '适用场景');
        
        if (infoText.includes('CRUD')) { 
          info.tags.push('crud'); 
          info.ai_triggers.push('CRUD操作', '数据管理'); 
        }
        if (infoText.includes('Vue')) { 
          info.tags.push('vue'); 
          info.dependencies.push('Vue 3'); 
        }
        if (infoText.includes('ABP')) { 
          info.tags.push('abp'); 
          info.dependencies.push('ABP Framework'); 
        }
        if (infoText.includes('应用服务')) { 
          info.ai_triggers.push('创建应用服务', '业务服务'); 
        }
        if (infoText.includes('管理')) { 
          info.ai_triggers.push('管理页面', '管理组件'); 
        }
        if (infoText.includes('状态管理')) { 
          info.ai_triggers.push('状态管理', 'Pinia Store'); 
        }
        if (infoText.includes('权限') || infoText.includes('permission')) { 
          info.permissions_required = true; 
        }
      }
      
      return info;
      
    } catch (error) {
      logWarning('extractAITemplateInfo', 'Failed to extract AI template info', {
        error: error.message
      });
      return { 
        tags: [], 
        scenarios: [], 
        ai_triggers: [], 
        dependencies: [], 
        permissions_required: false 
      };
    }
  }

  extractInfoField(text, fieldName) {
    try {
      const regex = new RegExp(`${fieldName}[：:][\\s]*([^\n]+)`, 'i');
      const match = text.match(regex);
      return match ? match[1].trim() : null;
    } catch (error) {
      logWarning('extractInfoField', 'Failed to extract info field', {
        fieldName,
        error: error.message
      });
      return null;
    }
  }

  generateTemplateId(relativePath) {
    try {
      return relativePath
        .replace(/\\/g, '-')
        .replace(/\//g, '-')
        .replace(/\.template\.[^.]+$/, '')
        .toLowerCase();
    } catch (error) {
      logWarning('generateTemplateId', 'Failed to generate template ID', {
        relativePath,
        error: error.message
      });
      return relativePath.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    }
  }

  parseCategory(relativePath) {
    try {
      const parts = relativePath.split(/[\/\\]/);
      if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
      return parts[0] || 'general';
    } catch (error) {
      logWarning('parseCategory', 'Failed to parse category', {
        relativePath,
        error: error.message
      });
      return 'general';
    }
  }

  extractType(relativePath) {
    try {
      const filename = path.basename(relativePath);
      
      if (filename.includes('Service')) return 'service';
      if (filename.includes('Component') || filename.includes('Management')) return 'component';
      if (filename.includes('Store')) return 'store';
      if (filename.includes('Dto')) return 'dto';
      if (filename.includes('Interface')) return 'interface';
      
      const ext = path.extname(filename);
      if (ext === '.vue') return 'component';
      if (ext === '.ts') return 'typescript';
      if (ext === '.cs') return 'csharp';
      
      return 'unknown';
    } catch (error) {
      logWarning('extractType', 'Failed to extract type', {
        relativePath,
        error: error.message
      });
      return 'unknown';
    }
  }

  async generateIndex() {
    try {
      const startTime = performance.now();
      
      const index = {
        version: '2.0.0',
        description: 'SmartAbp项目代码模板库索引 - 简化版增强',
        lastUpdated: new Date().toISOString(),
        buildInfo: {
          timestamp: new Date().toISOString(),
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch
        },
        templates: this.templates,
        categories: {
          backend: { 
            application: '应用服务层', 
            contracts: '契约层', 
            domain: '领域层', 
            httpapi: 'HTTP API层', 
            entityframework: '数据访问层' 
          },
          frontend: { 
            components: 'Vue组件', 
            views: '页面视图', 
            stores: '状态管理', 
            services: 'API服务', 
            composables: '组合式函数' 
          },
          lowcode: { 
            plugins: '插件开发', 
            generators: '代码生成器', 
            runtime: '运行时' 
          }
        },
        ai_search_patterns: {
          crud_service: 'templates/**/*crud*service*.template.*',
          management_page: 'templates/**/components/*management*.template.vue',
          entity_store: 'templates/**/stores/*store*.template.ts',
          dto_objects: 'templates/**/contracts/*dto*.template.cs',
          vue_components: 'templates/frontend/components/*.template.vue',
          abp_services: 'templates/backend/application/*.template.cs'
        },
        naming_conventions: {
          backend: { 
            appService: '{EntityName}AppService', 
            dto: '{EntityName}Dto', 
            createDto: 'Create{EntityName}Dto', 
            updateDto: 'Update{EntityName}Dto', 
            interface: 'I{EntityName}AppService' 
          },
          frontend: { 
            component: '{EntityName}Management.vue', 
            store: 'use{EntityName}Store', 
            service: '{entityName}Service', 
            types: '{entityName}.ts' 
          },
          permissions: { 
            group: '{ModuleName}', 
            actions: ['Default', 'Create', 'Edit', 'Delete'] 
          }
        },
        statistics: {
          total_templates: this.templates.length,
          backend_templates: this.templates.filter(t => t.category && t.category.startsWith('backend')).length,
          frontend_templates: this.templates.filter(t => t.category && t.category.startsWith('frontend')).length,
          by_type: this.generateTypeStatistics(),
          build_metrics: this.options.enablePerformanceMonitoring ? {
            processing_time: performance.now() - this.processingStats.startTime,
            successful: this.processingStats.successful,
            failed: this.processingStats.failed,
            cache_hits: PERFORMANCE_METRICS.cacheHits,
            cache_misses: PERFORMANCE_METRICS.cacheMisses,
            file_operations: PERFORMANCE_METRICS.fileOperations
          } : null
        }
      };
      
      // Write index with retry
      await retryOperation(
        () => safeWriteFile(this.outputPath, JSON.stringify(index, null, 2), 'utf8', 'generateIndex'),
        this.options.maxRetries,
        this.options.retryDelay
      );
      
      const duration = performance.now() - startTime;
      logInfo('generateIndex', 'Index generated successfully', {
        templatesCount: this.templates.length,
        duration: `${duration.toFixed(2)}ms`
      });
      
    } catch (error) {
      logError('generateIndex', error);
      throw error;
    }
  }

  /**
   * Generate type statistics
   */
  generateTypeStatistics() {
    try {
      const stats = {};
      
      this.templates.forEach(template => {
        if (template.type) {
          stats[template.type] = (stats[template.type] || 0) + 1;
        }
      });
      
      return stats;
    } catch (error) {
      logWarning('generateTypeStatistics', 'Failed to generate type statistics', {
        error: error.message
      });
      return {};
    }
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      ...this.processingStats,
      uptime: Date.now() - this.processingStats.startTime
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return { ...PERFORMANCE_METRICS };
  }

  /**
   * Clear cache
   */
  clearCache() {
    clearCache();
  }

  /**
   * Reset all statistics and metrics
   */
  reset() {
    this.templates = [];
    clearCache();
    
    // Reset performance metrics
    Object.keys(PERFORMANCE_METRICS).forEach(key => {
      if (typeof PERFORMANCE_METRICS[key] === 'number') {
        PERFORMANCE_METRICS[key] = 0;
      } else if (typeof PERFORMANCE_METRICS[key] === 'object') {
        Object.keys(PERFORMANCE_METRICS[key]).forEach(subKey => {
          PERFORMANCE_METRICS[key][subKey] = 0;
        });
      }
    });
    
    // Reset memory monitor
    if (this.memoryMonitor) {
      this.memoryMonitor.reset();
    }
    
    // Reset processing stats
    this.processingStats = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      startTime: Date.now()
    };
    
    logInfo('reset', 'SimpleTemplateIndexBuilder reset completed');
  }
}

/**
 * Enhanced CLI execution with comprehensive error handling and performance monitoring
 */
async function main() {
  const args = process.argv.slice(2);
  const templatesDir = args[0] || null;
  
  // Parse options
  const options = {
    enablePerformanceMonitoring: args.includes('--performance'),
    enableMemoryMonitoring: args.includes('--memory-monitoring'),
    enableCache: !args.includes('--no-cache'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    maxRetries: parseInt(args.find(arg => arg.startsWith('--retries='))?.split('=')[1]) || 3,
    retryDelay: parseInt(args.find(arg => arg.startsWith('--delay='))?.split('=')[1]) || 1000
  };
  
  try {
    console.log(`🔍 开始构建模板索引...`);
    if (templatesDir) {
      console.log(`📁 模板目录: ${templatesDir}`);
    }
    
    const builder = new SimpleTemplateIndexBuilder(options);
    
    // Override templates directory if provided
    if (templatesDir) {
      builder.templatesDir = path.resolve(templatesDir);
      builder.outputPath = path.join(builder.templatesDir, 'index.json');
    }
    
    await builder.build();
    
    console.log('\n✅ 模板索引构建完成！');
    
  } catch (error) {
    if (error.code) {
      console.error(`\n❌ ${error.message}`);
      if (error.details) {
        console.error('📋 错误详情:', JSON.stringify(error.details, null, 2));
      }
    } else {
      logError('main', error);
      console.error('\n❌ 构建失败:', error.message);
    }
    process.exit(1);
  }
}

// Module exports
module.exports = {
  SimpleTemplateIndexBuilder,
  PERFORMANCE_METRICS,
  CACHE_CONFIG,
  MemoryMonitor
};

// Execute main function if run directly
if (require.main === module) {
  main().catch((error) => {
    console.error('\n💥 未处理的错误:', error);
    if (error.stack) {
      console.error('📋 错误堆栈:', error.stack);
    }
    process.exit(1);
  });
}


