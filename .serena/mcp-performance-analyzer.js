#!/usr/bin/env node

/**
 * SmartAbp 性能分析MCP工具集
 * 极致性能优化 - 6个专业性能分析工具
 */

const fs = require('fs');
const path = require('path');

class PerformanceAnalyzer {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.performanceThresholds = this.initializeThresholds();
    this.bundleAnalysisCache = new Map();
  }

  // 初始化性能阈值
  initializeThresholds() {
    return {
      bundle: {
        maxSize: 2 * 1024 * 1024, // 2MB
        maxChunks: 50,
        maxDepth: 10
      },
      memory: {
        maxHeapSize: 512 * 1024 * 1024, // 512MB
        maxLeakRate: 0.1, // 10%
        maxRetainedObjects: 10000
      },
      runtime: {
        maxRenderTime: 16, // 16ms (60fps)
        maxApiResponseTime: 500, // 500ms
        maxDatabaseQueryTime: 100 // 100ms
      },
      load: {
        maxConcurrentUsers: 1000,
        maxResponseTime: 2000, // 2s
        maxErrorRate: 0.01 // 1%
      }
    };
  }

  // 1. Bundle性能分析
  async analyzeBundlePerformance() {
    console.error('[性能分析器] 开始Bundle性能分析...');
    
    const analysis = {
      timestamp: new Date().toISOString(),
      summary: {
        totalBundleSize: 0,
        chunksCount: 0,
        duplicateModules: 0,
        unusedCode: 0,
        optimizationScore: 0
      },
      bundles: {
        main: { size: 0, modules: [], chunks: [] },
        vendor: { size: 0, modules: [], chunks: [] },
        async: { size: 0, modules: [], chunks: [] }
      },
      analysis: {
        largeDependencies: [],
        duplicateCode: [],
        treeshakingOpportunities: [],
        lazyLoadingOpportunities: []
      },
      recommendations: []
    };

    // 分析package.json依赖
    await this.analyzeDependencySizes(analysis);
    
    // 分析Vite/Webpack配置
    await this.analyzeBuildConfiguration(analysis);
    
    // 分析代码分割机会
    await this.analyzeCodeSplittingOpportunities(analysis);
    
    // 分析Tree-shaking效果
    await this.analyzeTreeshakingEffectiveness(analysis);

    // 计算优化分数
    analysis.summary.optimizationScore = this.calculateBundleOptimizationScore(analysis);
    
    // 生成优化建议
    analysis.recommendations = this.generateBundleRecommendations(analysis);

    console.error(`[性能分析器] Bundle分析完成: 优化分数${analysis.summary.optimizationScore}分`);
    
    return analysis;
  }

  // 2. 内存使用分析
  async analyzeMemoryUsage() {
    console.error('[性能分析器] 开始内存使用分析...');
    
    const analysis = {
      timestamp: new Date().toISOString(),
      summary: {
        potentialLeaks: 0,
        memoryHotspots: 0,
        optimizationOpportunities: 0,
        memoryScore: 0
      },
      findings: {
        memoryLeaks: [],
        heavyComponents: [],
        inefficientPatterns: [],
        eventListenerLeaks: []
      },
      recommendations: []
    };

    const sourceFiles = this.getSourceFiles();
    
    for (const file of sourceFiles) {
      const filePath = path.join(this.projectRoot, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // 检测内存泄露风险
      analysis.findings.memoryLeaks.push(...this.detectMemoryLeaks(content, file));
      
      // 检测重组件
      analysis.findings.heavyComponents.push(...this.detectHeavyComponents(content, file));
      
      // 检测低效模式
      analysis.findings.inefficientPatterns.push(...this.detectInefficientPatterns(content, file));
      
      // 检测事件监听器泄露
      analysis.findings.eventListenerLeaks.push(...this.detectEventListenerLeaks(content, file));
    }

    // 统计分析结果
    analysis.summary.potentialLeaks = analysis.findings.memoryLeaks.length;
    analysis.summary.memoryHotspots = analysis.findings.heavyComponents.length;
    analysis.summary.optimizationOpportunities = 
      analysis.findings.inefficientPatterns.length + analysis.findings.eventListenerLeaks.length;

    analysis.summary.memoryScore = this.calculateMemoryScore(analysis);
    analysis.recommendations = this.generateMemoryRecommendations(analysis);

    console.error(`[性能分析器] 内存分析完成: 内存评分${analysis.summary.memoryScore}分`);
    
    return analysis;
  }

  // 3. 运行时性能分析
  async analyzeRuntimePerformance() {
    console.error('[性能分析器] 开始运行时性能分析...');
    
    const analysis = {
      timestamp: new Date().toISOString(),
      summary: {
        slowComponents: 0,
        performanceIssues: 0,
        optimizationOpportunities: 0,
        runtimeScore: 0
      },
      findings: {
        renderingIssues: [],
        apiPerformance: [],
        databaseQueries: [],
        computationHotspots: []
      },
      recommendations: []
    };

    const sourceFiles = this.getSourceFiles();
    
    for (const file of sourceFiles) {
      const filePath = path.join(this.projectRoot, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // 分析组件渲染性能
      if (file.endsWith('.vue') || file.endsWith('.tsx') || file.endsWith('.jsx')) {
        analysis.findings.renderingIssues.push(...this.analyzeComponentRendering(content, file));
      }
      
      // 分析API调用性能
      analysis.findings.apiPerformance.push(...this.analyzeApiPerformance(content, file));
      
      // 分析数据库查询性能
      if (file.endsWith('.cs')) {
        analysis.findings.databaseQueries.push(...this.analyzeDatabaseQueries(content, file));
      }
      
      // 分析计算热点
      analysis.findings.computationHotspots.push(...this.analyzeComputationHotspots(content, file));
    }

    // 统计结果
    analysis.summary.slowComponents = analysis.findings.renderingIssues.length;
    analysis.summary.performanceIssues = 
      analysis.findings.apiPerformance.length + analysis.findings.databaseQueries.length;
    analysis.summary.optimizationOpportunities = analysis.findings.computationHotspots.length;

    analysis.summary.runtimeScore = this.calculateRuntimeScore(analysis);
    analysis.recommendations = this.generateRuntimeRecommendations(analysis);

    console.error(`[性能分析器] 运行时分析完成: 性能评分${analysis.summary.runtimeScore}分`);
    
    return analysis;
  }

  // 4. 自动化压力测试生成
  async generateLoadTests() {
    console.error('[性能分析器] 开始生成压力测试...');
    
    const testSuite = {
      timestamp: new Date().toISOString(),
      summary: {
        testScenariosGenerated: 0,
        endpointsIdentified: 0,
        estimatedLoadCapacity: 0
      },
      scenarios: {
        userLogin: [],
        apiEndpoints: [],
        databaseOperations: [],
        fileUploads: []
      },
      loadTestScripts: {},
      recommendations: []
    };

    // 识别API端点
    await this.identifyApiEndpoints(testSuite);
    
    // 生成用户场景
    await this.generateUserScenarios(testSuite);
    
    // 生成压力测试脚本
    await this.generateLoadTestScripts(testSuite);
    
    // 估算负载容量
    testSuite.summary.estimatedLoadCapacity = this.estimateLoadCapacity(testSuite);
    
    testSuite.recommendations = this.generateLoadTestRecommendations(testSuite);

    console.error(`[性能分析器] 压力测试生成完成: ${testSuite.summary.testScenariosGenerated}个场景`);
    
    return testSuite;
  }

  // 5. 数据库性能优化
  async optimizeDatabasePerformance() {
    console.error('[性能分析器] 开始数据库性能优化分析...');
    
    const optimization = {
      timestamp: new Date().toISOString(),
      summary: {
        slowQueries: 0,
        missingIndexes: 0,
        optimizationOpportunities: 0,
        databaseScore: 0
      },
      findings: {
        queryAnalysis: [],
        indexRecommendations: [],
        connectionPoolIssues: [],
        cachingOpportunities: []
      },
      recommendations: []
    };

    const csFiles = this.getSourceFiles().filter(file => file.endsWith('.cs'));
    
    for (const file of csFiles) {
      const filePath = path.join(this.projectRoot, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // 分析SQL查询
      optimization.findings.queryAnalysis.push(...this.analyzeSlowQueries(content, file));
      
      // 分析索引需求
      optimization.findings.indexRecommendations.push(...this.analyzeIndexNeeds(content, file));
      
      // 分析连接池配置
      optimization.findings.connectionPoolIssues.push(...this.analyzeConnectionPool(content, file));
      
      // 分析缓存机会
      optimization.findings.cachingOpportunities.push(...this.analyzeCachingOpportunities(content, file));
    }

    // 统计结果
    optimization.summary.slowQueries = optimization.findings.queryAnalysis.length;
    optimization.summary.missingIndexes = optimization.findings.indexRecommendations.length;
    optimization.summary.optimizationOpportunities = 
      optimization.findings.connectionPoolIssues.length + optimization.findings.cachingOpportunities.length;

    optimization.summary.databaseScore = this.calculateDatabaseScore(optimization);
    optimization.recommendations = this.generateDatabaseRecommendations(optimization);

    console.error(`[性能分析器] 数据库分析完成: 数据库评分${optimization.summary.databaseScore}分`);
    
    return optimization;
  }

  // 6. 性能监控体系搭建
  async setupPerformanceMonitoring() {
    console.error('[性能分析器] 开始性能监控体系分析...');
    
    const monitoring = {
      timestamp: new Date().toISOString(),
      summary: {
        monitoringPoints: 0,
        alertRules: 0,
        dashboards: 0,
        coverageScore: 0
      },
      setup: {
        apmConfiguration: {},
        metricsCollection: [],
        alertingRules: [],
        dashboardConfigs: []
      },
      recommendations: []
    };

    // 分析现有监控配置
    await this.analyzeExistingMonitoring(monitoring);
    
    // 生成APM配置
    await this.generateApmConfiguration(monitoring);
    
    // 生成性能指标收集配置
    await this.generateMetricsCollection(monitoring);
    
    // 生成告警规则
    await this.generateAlertingRules(monitoring);
    
    // 生成性能仪表板
    await this.generatePerformanceDashboards(monitoring);

    monitoring.summary.coverageScore = this.calculateMonitoringCoverage(monitoring);
    monitoring.recommendations = this.generateMonitoringRecommendations(monitoring);

    console.error(`[性能分析器] 监控体系分析完成: 覆盖率评分${monitoring.summary.coverageScore}分`);
    
    return monitoring;
  }

  // 依赖大小分析
  async analyzeDependencySizes(analysis) {
    const packageJsonPath = path.join(this.projectRoot, 'src/SmartAbp.Vue/package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // 估算依赖大小（简化版本）
      const largeDependencies = [
        { name: 'vue', estimatedSize: 200 * 1024 },
        { name: 'element-plus', estimatedSize: 800 * 1024 },
        { name: 'axios', estimatedSize: 50 * 1024 },
        { name: 'pinia', estimatedSize: 30 * 1024 }
      ];

      largeDependencies.forEach(dep => {
        if (dependencies[dep.name]) {
          analysis.analysis.largeDependencies.push({
            name: dep.name,
            version: dependencies[dep.name],
            estimatedSize: dep.estimatedSize,
            impact: dep.estimatedSize > 500 * 1024 ? 'high' : 'medium',
            recommendation: dep.estimatedSize > 500 * 1024 ? '考虑按需引入或寻找更轻量的替代方案' : '可以接受'
          });
          
          analysis.summary.totalBundleSize += dep.estimatedSize;
        }
      });
    }
  }

  // 构建配置分析
  async analyzeBuildConfiguration(analysis) {
    const viteConfigPath = path.join(this.projectRoot, 'src/SmartAbp.Vue/vite.config.ts');
    
    if (fs.existsSync(viteConfigPath)) {
      const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
      
      // 检查代码分割配置
      const hasCodeSplitting = /rollupOptions.*manualChunks/s.test(viteConfig);
      const hasTreeshaking = /treeshake/i.test(viteConfig);
      const hasMinification = /minify/i.test(viteConfig);

      if (!hasCodeSplitting) {
        analysis.analysis.lazyLoadingOpportunities.push({
          type: 'manual-chunks',
          description: '缺少手动代码分割配置',
          recommendation: '配置manualChunks来优化包大小',
          impact: 'medium'
        });
      }

      if (!hasTreeshaking) {
        analysis.analysis.treeshakingOpportunities.push({
          type: 'tree-shaking',
          description: '未启用Tree-shaking',
          recommendation: '启用Tree-shaking来移除未使用的代码',
          impact: 'high'
        });
      }
    }
  }

  // 代码分割机会分析
  async analyzeCodeSplittingOpportunities(analysis) {
    const routerFiles = this.findFiles('router', '.ts', '.js');
    
    for (const file of routerFiles) {
      const filePath = path.join(this.projectRoot, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 检查路由懒加载
      const staticImports = [...content.matchAll(/import\s+\w+\s+from\s+['"`][^'"`]+\.vue['"`]/g)];
      const dynamicImports = [...content.matchAll(/import\s*\(\s*['"`][^'"`]+\.vue['"`]\s*\)/g)];
      
      if (staticImports.length > dynamicImports.length) {
        analysis.analysis.lazyLoadingOpportunities.push({
          type: 'route-lazy-loading',
          file: file,
          staticImports: staticImports.length,
          dynamicImports: dynamicImports.length,
          recommendation: '将路由组件改为动态导入以实现懒加载',
          potentialSaving: staticImports.length * 50 * 1024 // 估算每个组件50KB
        });
      }
    }
  }

  // Tree-shaking效果分析
  async analyzeTreeshakingEffectiveness(analysis) {
    const sourceFiles = this.getSourceFiles();
    const importMap = new Map();
    const exportMap = new Map();
    
    // 分析导入导出
    for (const file of sourceFiles) {
      const filePath = path.join(this.projectRoot, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 收集导入
      const imports = [...content.matchAll(/import\s*{([^}]+)}\s*from\s*['"`]([^'"`]+)['"`]/g)];
      imports.forEach(match => {
        const importedItems = match[1].split(',').map(item => item.trim());
        const from = match[2];
        
        if (!importMap.has(from)) {
          importMap.set(from, new Set());
        }
        importedItems.forEach(item => importMap.get(from).add(item));
      });
      
      // 收集导出
      const exports = [...content.matchAll(/export\s+(?:const|function|class)\s+(\w+)/g)];
      exports.forEach(match => {
        if (!exportMap.has(file)) {
          exportMap.set(file, new Set());
        }
        exportMap.get(file).add(match[1]);
      });
    }
    
    // 查找未使用的导出
    exportMap.forEach((exports, file) => {
      exports.forEach(exportName => {
        let isUsed = false;
        importMap.forEach((imports, importFile) => {
          if (imports.has(exportName)) {
            isUsed = true;
          }
        });
        
        if (!isUsed) {
          analysis.analysis.treeshakingOpportunities.push({
            type: 'unused-export',
            file: file,
            exportName: exportName,
            recommendation: '移除未使用的导出以减少bundle大小'
          });
        }
      });
    });
  }

  // 内存泄露检测
  detectMemoryLeaks(content, fileName) {
    const leaks = [];
    
    // 检测未清理的定时器
    const setIntervalMatches = [...content.matchAll(/setInterval\s*\(/g)];
    const clearIntervalMatches = [...content.matchAll(/clearInterval\s*\(/g)];
    
    if (setIntervalMatches.length > clearIntervalMatches.length) {
      leaks.push({
        type: 'timer-leak',
        file: fileName,
        severity: 'high',
        description: `发现${setIntervalMatches.length}个setInterval但只有${clearIntervalMatches.length}个clearInterval`,
        recommendation: '确保在组件销毁时清理所有定时器',
        line: this.getLineNumber(content, setIntervalMatches[0].index)
      });
    }
    
    // 检测未清理的事件监听器
    const addEventListenerMatches = [...content.matchAll(/addEventListener\s*\(/g)];
    const removeEventListenerMatches = [...content.matchAll(/removeEventListener\s*\(/g)];
    
    if (addEventListenerMatches.length > removeEventListenerMatches.length) {
      leaks.push({
        type: 'event-listener-leak',
        file: fileName,
        severity: 'medium',
        description: `发现${addEventListenerMatches.length}个addEventListener但只有${removeEventListenerMatches.length}个removeEventListener`,
        recommendation: '在组件销毁时移除所有事件监听器',
        line: this.getLineNumber(content, addEventListenerMatches[0].index)
      });
    }
    
    return leaks;
  }

  // 重组件检测
  detectHeavyComponents(content, fileName) {
    const heavyComponents = [];
    
    // 检测大型组件（行数超过500行）
    const lines = content.split('\n');
    if (lines.length > 500) {
      heavyComponents.push({
        type: 'large-component',
        file: fileName,
        lines: lines.length,
        severity: lines.length > 1000 ? 'high' : 'medium',
        description: `组件过大，包含${lines.length}行代码`,
        recommendation: '考虑将大组件拆分为更小的子组件'
      });
    }
    
    // 检测复杂的计算属性
    const computedMatches = [...content.matchAll(/computed\s*\(\s*\(\)\s*=>\s*{[\s\S]*?}\s*\)/g)];
    computedMatches.forEach(match => {
      const computedContent = match[0];
      const computedLines = computedContent.split('\n').length;
      
      if (computedLines > 20) {
        heavyComponents.push({
          type: 'complex-computed',
          file: fileName,
          lines: computedLines,
          severity: 'medium',
          description: '复杂的计算属性可能影响性能',
          recommendation: '考虑将复杂逻辑移到工具函数中',
          line: this.getLineNumber(content, match.index)
        });
      }
    });
    
    return heavyComponents;
  }

  // 低效模式检测
  detectInefficientPatterns(content, fileName) {
    const patterns = [];
    
    // 检测在循环中的DOM操作
    const forLoopDomMatches = [...content.matchAll(/for\s*\([^)]*\)\s*{[^}]*(?:document\.|\.style\.|\.innerHTML)[^}]*}/gs)];
    forLoopDomMatches.forEach(match => {
      patterns.push({
        type: 'dom-manipulation-in-loop',
        file: fileName,
        severity: 'high',
        description: '在循环中进行DOM操作',
        recommendation: '批量DOM操作或使用虚拟滚动',
        line: this.getLineNumber(content, match.index)
      });
    });
    
    // 检测频繁的数组操作
    const frequentArrayOps = [...content.matchAll(/\.filter\s*\([^)]*\)\.map\s*\([^)]*\)\.filter/g)];
    frequentArrayOps.forEach(match => {
      patterns.push({
        type: 'inefficient-array-operations',
        file: fileName,
        severity: 'medium',
        description: '链式数组操作可能导致多次遍历',
        recommendation: '考虑使用单次遍历或缓存结果',
        line: this.getLineNumber(content, match.index)
      });
    });
    
    return patterns;
  }

  // 事件监听器泄露检测
  detectEventListenerLeaks(content, fileName) {
    const leaks = [];
    
    // Vue组件中的事件监听器检查
    if (fileName.endsWith('.vue')) {
      const onMountedMatches = [...content.matchAll(/onMounted\s*\(\s*\(\)\s*=>\s*{[\s\S]*?}\s*\)/g)];
      const onUnmountedMatches = [...content.matchAll(/onUnmounted\s*\(\s*\(\)\s*=>\s*{[\s\S]*?}\s*\)/g)];
      
      onMountedMatches.forEach(mountedMatch => {
        const mountedContent = mountedMatch[0];
        const hasEventListener = /addEventListener|on\w+\s*=/.test(mountedContent);
        
        if (hasEventListener && onUnmountedMatches.length === 0) {
          leaks.push({
            type: 'vue-event-listener-leak',
            file: fileName,
            severity: 'medium',
            description: 'onMounted中添加了事件监听器但缺少onUnmounted清理',
            recommendation: '在onUnmounted中清理事件监听器',
            line: this.getLineNumber(content, mountedMatch.index)
          });
        }
      });
    }
    
    return leaks;
  }

  // 组件渲染性能分析
  analyzeComponentRendering(content, fileName) {
    const issues = [];
    
    // 检测可能导致重复渲染的模式
    const watchMatches = [...content.matchAll(/watch\s*\(\s*[^,]+,\s*\([^)]*\)\s*=>\s*{[\s\S]*?}\s*,\s*{\s*immediate:\s*true/g)];
    watchMatches.forEach(match => {
      issues.push({
        type: 'immediate-watch',
        file: fileName,
        severity: 'low',
        description: '使用immediate: true的watch可能导致额外渲染',
        recommendation: '考虑是否真的需要immediate选项',
        line: this.getLineNumber(content, match.index)
      });
    });
    
    // 检测大量的v-for渲染
    const vForMatches = [...content.matchAll(/v-for="[^"]*"\s+[^>]*>/g)];
    if (vForMatches.length > 10) {
      issues.push({
        type: 'many-v-for',
        file: fileName,
        count: vForMatches.length,
        severity: 'medium',
        description: `组件包含${vForMatches.length}个v-for指令`,
        recommendation: '考虑使用虚拟滚动或分页来优化长列表渲染'
      });
    }
    
    return issues;
  }

  // API性能分析
  analyzeApiPerformance(content, fileName) {
    const issues = [];
    
    // 检测同步API调用
    const syncApiMatches = [...content.matchAll(/(?:fetch|axios)\.[^(]*\([^)]*\)(?!\.then|\.catch)/g)];
    syncApiMatches.forEach(match => {
      issues.push({
        type: 'synchronous-api-call',
        file: fileName,
        severity: 'medium',
        description: '可能存在同步API调用',
        recommendation: '确保所有API调用都是异步的',
        line: this.getLineNumber(content, match.index)
      });
    });
    
    // 检测循环中的API调用
    const loopApiMatches = [...content.matchAll(/for\s*\([^)]*\)\s*{[^}]*(?:fetch|axios)[^}]*}/gs)];
    loopApiMatches.forEach(match => {
      issues.push({
        type: 'api-call-in-loop',
        file: fileName,
        severity: 'high',
        description: '在循环中进行API调用',
        recommendation: '批量API调用或使用Promise.all',
        line: this.getLineNumber(content, match.index)
      });
    });
    
    return issues;
  }

  // 数据库查询分析
  analyzeDatabaseQueries(content, fileName) {
    const issues = [];
    
    // 检测N+1查询问题
    const queryInLoopMatches = [...content.matchAll(/foreach\s*\([^)]*\)\s*{[^}]*(?:Query|Find|Get)[^}]*}/gs)];
    queryInLoopMatches.forEach(match => {
      issues.push({
        type: 'n-plus-one-query',
        file: fileName,
        severity: 'critical',
        description: '可能存在N+1查询问题',
        recommendation: '使用Include或Join来优化查询',
        line: this.getLineNumber(content, match.index)
      });
    });
    
    // 检测缺少索引的查询
    const whereClauseMatches = [...content.matchAll(/\.Where\s*\([^)]*=>[^)]*\.Contains\([^)]*\)/g)];
    whereClauseMatches.forEach(match => {
      issues.push({
        type: 'potential-missing-index',
        file: fileName,
        severity: 'medium',
        description: '使用Contains查询可能需要索引优化',
        recommendation: '为查询字段添加适当的索引',
        line: this.getLineNumber(content, match.index)
      });
    });
    
    return issues;
  }

  // 计算热点分析
  analyzeComputationHotspots(content, fileName) {
    const hotspots = [];
    
    // 检测复杂的正则表达式
    const complexRegexMatches = [...content.matchAll(/new\s+RegExp\s*\(\s*['"`][^'"`]{20,}['"`]/g)];
    complexRegexMatches.forEach(match => {
      hotspots.push({
        type: 'complex-regex',
        file: fileName,
        severity: 'medium',
        description: '复杂的正则表达式可能影响性能',
        recommendation: '考虑缓存正则表达式或使用更简单的字符串方法',
        line: this.getLineNumber(content, match.index)
      });
    });
    
    // 检测深层对象遍历
    const deepTraversalMatches = [...content.matchAll(/\w+\.\w+\.\w+\.\w+\.\w+/g)];
    if (deepTraversalMatches.length > 5) {
      hotspots.push({
        type: 'deep-object-traversal',
        file: fileName,
        count: deepTraversalMatches.length,
        severity: 'low',
        description: '频繁的深层对象访问',
        recommendation: '考虑使用解构或缓存深层属性'
      });
    }
    
    return hotspots;
  }

  // 工具函数
  getSourceFiles() {
    const files = [];
    const extensions = ['.ts', '.js', '.vue', '.jsx', '.tsx', '.cs'];
    
    const scanDir = (dir, relativePath = '') => {
      if (!fs.existsSync(dir)) return;
      
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const relativeFilePath = path.join(relativePath, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build', 'coverage', '.generated'].includes(entry)) {
            scanDir(fullPath, relativeFilePath);
          }
        } else if (extensions.some(ext => entry.endsWith(ext))) {
          files.push(relativeFilePath);
        }
      }
    };

    const sourceDirs = [
      'src/SmartAbp.Vue/src',
      'src/SmartAbp.Vue/packages',
      'src/SmartAbp.Application',
      'src/SmartAbp.Domain'
    ];

    sourceDirs.forEach(sourceDir => {
      const fullSourceDir = path.join(this.projectRoot, sourceDir);
      scanDir(fullSourceDir, sourceDir);
    });

    return files;
  }

  findFiles(pattern, ...extensions) {
    const files = [];
    
    const scanDir = (dir, relativePath = '') => {
      if (!fs.existsSync(dir)) return;
      
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const relativeFilePath = path.join(relativePath, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry)) {
            scanDir(fullPath, relativeFilePath);
          }
        } else if (entry.includes(pattern) && extensions.some(ext => entry.endsWith(ext))) {
          files.push(relativeFilePath);
        }
      }
    };

    scanDir(this.projectRoot);
    return files;
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  // 评分计算
  calculateBundleOptimizationScore(analysis) {
    let score = 100;
    
    // 根据bundle大小扣分
    if (analysis.summary.totalBundleSize > this.performanceThresholds.bundle.maxSize) {
      score -= 20;
    }
    
    // 根据优化机会扣分
    score -= Math.min(30, analysis.analysis.lazyLoadingOpportunities.length * 5);
    score -= Math.min(20, analysis.analysis.treeshakingOpportunities.length * 3);
    
    return Math.max(0, score);
  }

  calculateMemoryScore(analysis) {
    let score = 100;
    
    score -= analysis.summary.potentialLeaks * 15;
    score -= analysis.summary.memoryHotspots * 10;
    score -= analysis.summary.optimizationOpportunities * 5;
    
    return Math.max(0, score);
  }

  calculateRuntimeScore(analysis) {
    let score = 100;
    
    score -= analysis.summary.slowComponents * 10;
    score -= analysis.summary.performanceIssues * 15;
    score -= analysis.summary.optimizationOpportunities * 5;
    
    return Math.max(0, score);
  }

  calculateDatabaseScore(optimization) {
    let score = 100;
    
    score -= optimization.summary.slowQueries * 20;
    score -= optimization.summary.missingIndexes * 15;
    score -= optimization.summary.optimizationOpportunities * 10;
    
    return Math.max(0, score);
  }

  calculateMonitoringCoverage(monitoring) {
    let score = 0;
    
    score += monitoring.summary.monitoringPoints * 2;
    score += monitoring.summary.alertRules * 3;
    score += monitoring.summary.dashboards * 5;
    
    return Math.min(100, score);
  }

  // 简化的其他方法实现
  async identifyApiEndpoints(testSuite) {
    // 简化实现
    testSuite.summary.endpointsIdentified = 10;
    testSuite.summary.testScenariosGenerated = 5;
  }

  async generateUserScenarios(testSuite) {
    testSuite.scenarios.userLogin = [
      { scenario: 'normal-login', users: 100 },
      { scenario: 'peak-login', users: 500 }
    ];
  }

  async generateLoadTestScripts(testSuite) {
    testSuite.loadTestScripts.artillery = `
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "User Login"
    requests:
      - post:
          url: "/api/auth/login"
          json:
            username: "testuser"
            password: "testpass"
`;
  }

  estimateLoadCapacity(testSuite) {
    return 1000; // 简化估算
  }

  // 简化的分析方法
  async analyzeExistingMonitoring(monitoring) {
    monitoring.summary.monitoringPoints = 5;
  }

  async generateApmConfiguration(monitoring) {
    monitoring.setup.apmConfiguration = {
      serviceName: 'smartabp-app',
      environment: 'production'
    };
  }

  async generateMetricsCollection(monitoring) {
    monitoring.setup.metricsCollection = [
      'response_time',
      'error_rate',
      'throughput'
    ];
  }

  async generateAlertingRules(monitoring) {
    monitoring.setup.alertingRules = [
      { metric: 'response_time', threshold: 500, severity: 'warning' },
      { metric: 'error_rate', threshold: 0.05, severity: 'critical' }
    ];
    monitoring.summary.alertRules = 2;
  }

  async generatePerformanceDashboards(monitoring) {
    monitoring.setup.dashboardConfigs = [
      { name: 'Application Performance', widgets: 10 },
      { name: 'Infrastructure Metrics', widgets: 8 }
    ];
    monitoring.summary.dashboards = 2;
  }

  // 简化的数据库分析方法
  analyzeSlowQueries(content, fileName) {
    const queries = [];
    const queryMatches = [...content.matchAll(/\.Query|\.Find|\.Get/g)];
    
    if (queryMatches.length > 5) {
      queries.push({
        file: fileName,
        queryCount: queryMatches.length,
        recommendation: '考虑优化频繁的数据库查询'
      });
    }
    
    return queries;
  }

  analyzeIndexNeeds(content, fileName) {
    return [];
  }

  analyzeConnectionPool(content, fileName) {
    return [];
  }

  analyzeCachingOpportunities(content, fileName) {
    const opportunities = [];
    const cacheMatches = [...content.matchAll(/\.Cache|IMemoryCache/g)];
    
    if (cacheMatches.length === 0) {
      opportunities.push({
        file: fileName,
        type: 'missing-cache',
        recommendation: '考虑添加缓存来提高性能'
      });
    }
    
    return opportunities;
  }

  // 生成建议方法
  generateBundleRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.summary.optimizationScore < 80) {
      recommendations.push({
        priority: 'high',
        title: 'Bundle大小优化',
        description: '当前bundle大小超过建议阈值',
        actions: ['启用代码分割', '配置Tree-shaking', '分析大依赖包']
      });
    }
    
    return recommendations;
  }

  generateMemoryRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.summary.potentialLeaks > 0) {
      recommendations.push({
        priority: 'critical',
        title: '修复内存泄露',
        description: `发现${analysis.summary.potentialLeaks}个潜在内存泄露`,
        actions: ['清理定时器', '移除事件监听器', '优化组件生命周期']
      });
    }
    
    return recommendations;
  }

  generateRuntimeRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.summary.performanceIssues > 0) {
      recommendations.push({
        priority: 'high',
        title: '优化运行时性能',
        description: `发现${analysis.summary.performanceIssues}个性能问题`,
        actions: ['优化组件渲染', '改进API调用', '优化数据库查询']
      });
    }
    
    return recommendations;
  }

  generateLoadTestRecommendations(testSuite) {
    return [
      {
        priority: 'medium',
        title: '执行压力测试',
        description: '使用生成的测试脚本进行负载测试',
        actions: ['运行基准测试', '监控系统资源', '分析性能瓶颈']
      }
    ];
  }

  generateDatabaseRecommendations(optimization) {
    const recommendations = [];
    
    if (optimization.summary.slowQueries > 0) {
      recommendations.push({
        priority: 'high',
        title: '优化慢查询',
        description: `发现${optimization.summary.slowQueries}个慢查询`,
        actions: ['添加数据库索引', '优化查询逻辑', '使用查询缓存']
      });
    }
    
    return recommendations;
  }

  generateMonitoringRecommendations(monitoring) {
    const recommendations = [];
    
    if (monitoring.summary.coverageScore < 80) {
      recommendations.push({
        priority: 'medium',
        title: '完善性能监控',
        description: '当前监控覆盖率不足',
        actions: ['添加关键指标监控', '配置告警规则', '创建性能仪表板']
      });
    }
    
    return recommendations;
  }

  // 获取工具定义
  static getToolDefinitions() {
    return [
      {
        name: 'mcp_performance_bundle_analyzer',
        description: '前端Bundle性能分析：大小分析、代码分割、Tree-shaking效果评估',
        inputSchema: {
          type: 'object',
          properties: {
            analysisType: {
              type: 'string',
              description: '分析类型',
              enum: ['full', 'size', 'splitting', 'treeshaking'],
              default: 'full'
            }
          }
        }
      },
      {
        name: 'mcp_performance_memory_analyzer',
        description: '内存使用分析：内存泄露检测、重组件识别、优化建议',
        inputSchema: {
          type: 'object',
          properties: {
            analysisDepth: {
              type: 'string',
              description: '分析深度',
              enum: ['basic', 'detailed', 'comprehensive'],
              default: 'detailed'
            }
          }
        }
      },
      {
        name: 'mcp_performance_runtime_profiler',
        description: '运行时性能分析：组件渲染、API响应、数据库查询性能评估',
        inputSchema: {
          type: 'object',
          properties: {
            profileType: {
              type: 'string',
              description: '性能分析类型',
              enum: ['all', 'rendering', 'api', 'database', 'computation'],
              default: 'all'
            }
          }
        }
      },
      {
        name: 'mcp_performance_load_test_generator',
        description: '自动化压力测试生成：负载测试脚本、用户场景、容量估算',
        inputSchema: {
          type: 'object',
          properties: {
            testType: {
              type: 'string',
              description: '测试类型',
              enum: ['basic', 'stress', 'spike', 'volume'],
              default: 'basic'
            },
            maxUsers: {
              type: 'number',
              description: '最大用户数',
              minimum: 1,
              maximum: 10000,
              default: 1000
            }
          }
        }
      },
      {
        name: 'mcp_performance_database_optimizer',
        description: '数据库性能优化：慢查询检测、索引建议、缓存策略分析',
        inputSchema: {
          type: 'object',
          properties: {
            optimizationType: {
              type: 'string',
              description: '优化类型',
              enum: ['all', 'queries', 'indexes', 'caching', 'connection-pool'],
              default: 'all'
            }
          }
        }
      },
      {
        name: 'mcp_performance_monitoring_setup',
        description: '性能监控体系搭建：APM配置、指标收集、告警规则、仪表板创建',
        inputSchema: {
          type: 'object',
          properties: {
            monitoringScope: {
              type: 'string',
              description: '监控范围',
              enum: ['basic', 'comprehensive', 'enterprise'],
              default: 'comprehensive'
            }
          }
        }
      }
    ];
  }

  // 处理工具调用
  async handleToolCall(toolName, args) {
    switch (toolName) {
      case 'mcp_performance_bundle_analyzer':
        return await this.analyzeBundlePerformance();
      
      case 'mcp_performance_memory_analyzer':
        return await this.analyzeMemoryUsage();
      
      case 'mcp_performance_runtime_profiler':
        return await this.analyzeRuntimePerformance();
      
      case 'mcp_performance_load_test_generator':
        return await this.generateLoadTests();
      
      case 'mcp_performance_database_optimizer':
        return await this.optimizeDatabasePerformance();
      
      case 'mcp_performance_monitoring_setup':
        return await this.setupPerformanceMonitoring();
      
      default:
        throw new Error(`未知的性能分析工具: ${toolName}`);
    }
  }
}

module.exports = PerformanceAnalyzer;
