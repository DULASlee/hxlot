#!/usr/bin/env node

/**
 * SmartAbp 依赖分析MCP工具
 * 企业级依赖关系分析和架构违规检测
 */

const fs = require('fs');
const path = require('path');

class DependencyAnalyzer {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.packagesDirs = [
      'src/SmartAbp.Vue/packages/lowcode-core',
      'src/SmartAbp.Vue/packages/lowcode-designer', 
      'src/SmartAbp.Vue/packages/lowcode-api',
      'src/SmartAbp.Vue/packages/lowcode-tools',
      'src/SmartAbp.Vue/packages/lowcode-shared'
    ];
    this.dependencyGraph = new Map();
    this.violations = [];
  }

  // 分析所有包的依赖关系
  async analyzeDependencies() {
    console.error('[依赖分析器] 开始分析项目依赖关系...');
    
    const analysis = {
      timestamp: new Date().toISOString(),
      packages: [],
      dependencies: [],
      violations: [],
      metrics: {},
      recommendations: []
    };

    // 1. 扫描所有包
    for (const packageDir of this.packagesDirs) {
      const packagePath = path.join(this.projectRoot, packageDir);
      if (fs.existsSync(packagePath)) {
        const packageInfo = await this.analyzePackage(packagePath, packageDir);
        analysis.packages.push(packageInfo);
      }
    }

    // 2. 分析主应用依赖
    const mainAppInfo = await this.analyzeMainApplication();
    analysis.packages.push(mainAppInfo);

    // 3. 构建依赖图
    this.buildDependencyGraph(analysis.packages);
    analysis.dependencies = this.extractDependencyRelations();

    // 4. 检测违规
    analysis.violations = await this.detectViolations();

    // 5. 计算指标
    analysis.metrics = this.calculateMetrics(analysis);

    // 6. 生成建议
    analysis.recommendations = this.generateRecommendations(analysis);

    console.error(`[依赖分析器] 分析完成: ${analysis.packages.length}个包, ${analysis.violations.length}个违规`);
    
    return analysis;
  }

  // 分析单个包的依赖
  async analyzePackage(packagePath, packageDir) {
    const packageInfo = {
      name: path.basename(packageDir),
      path: packageDir,
      type: 'package',
      imports: [],
      exports: [],
      internalDependencies: [],
      externalDependencies: [],
      violations: []
    };

    // 扫描包内所有TypeScript和Vue文件
    const files = this.scanFiles(packagePath, ['.ts', '.vue', '.js']);
    
    for (const file of files) {
      const filePath = path.join(packagePath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 分析import语句
      const imports = this.extractImports(content, file);
      packageInfo.imports.push(...imports);

      // 分析export语句
      const exports = this.extractExports(content, file);
      packageInfo.exports.push(...exports);
    }

    // 分类依赖
    this.categorizeDependencies(packageInfo);

    return packageInfo;
  }

  // 分析主应用依赖
  async analyzeMainApplication() {
    const mainAppPath = path.join(this.projectRoot, 'src/SmartAbp.Vue/src');
    
    const appInfo = {
      name: 'main-application',
      path: 'src/SmartAbp.Vue/src',
      type: 'application',
      imports: [],
      exports: [],
      internalDependencies: [],
      externalDependencies: [],
      violations: []
    };

    if (fs.existsSync(mainAppPath)) {
      const files = this.scanFiles(mainAppPath, ['.ts', '.vue', '.js']);
      
      for (const file of files) {
        const filePath = path.join(mainAppPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const imports = this.extractImports(content, file);
        appInfo.imports.push(...imports);

        const exports = this.extractExports(content, file);
        appInfo.exports.push(...exports);
      }

      this.categorizeDependencies(appInfo);
    }

    return appInfo;
  }

  // 扫描文件
  scanFiles(dirPath, extensions, files = [], currentPath = '') {
    if (!fs.existsSync(dirPath)) return files;

    const entries = fs.readdirSync(dirPath);
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      const relativePath = path.join(currentPath, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // 跳过node_modules等目录
        if (!['node_modules', '.git', 'dist', 'build'].includes(entry)) {
          this.scanFiles(fullPath, extensions, files, relativePath);
        }
      } else if (extensions.some(ext => entry.endsWith(ext))) {
        files.push(relativePath);
      }
    }

    return files;
  }

  // 提取import语句
  extractImports(content, fileName) {
    const imports = [];
    
    // 匹配各种import格式
    const importPatterns = [
      /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"`]([^'"`]+)['"`]/g,
      /import\s+['"`]([^'"`]+)['"`]/g,
      /const\s+\w+\s*=\s*require\(['"`]([^'"`]+)['"`]\)/g
    ];

    for (const pattern of importPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const importPath = match[1];
        imports.push({
          source: importPath,
          file: fileName,
          type: this.classifyImport(importPath),
          line: content.substring(0, match.index).split('\n').length
        });
      }
    }

    return imports;
  }

  // 提取export语句
  extractExports(content, fileName) {
    const exports = [];
    
    const exportPatterns = [
      /export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type)\s+(\w+)/g,
      /export\s+{\s*([^}]+)\s*}/g,
      /export\s+\*\s+from\s+['"`]([^'"`]+)['"`]/g
    ];

    for (const pattern of exportPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        exports.push({
          name: match[1],
          file: fileName,
          line: content.substring(0, match.index).split('\n').length
        });
      }
    }

    return exports;
  }

  // 分类import类型
  classifyImport(importPath) {
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      return 'relative';
    } else if (importPath.startsWith('@/')) {
      return 'alias-main';
    } else if (importPath.startsWith('@smartabp/')) {
      return 'alias-package';
    } else if (importPath.startsWith('@')) {
      return 'scoped-external';
    } else if (!importPath.includes('/')) {
      return 'npm-package';
    } else {
      return 'external';
    }
  }

  // 分类依赖关系
  categorizeDependencies(packageInfo) {
    for (const imp of packageInfo.imports) {
      if (imp.type === 'relative') {
        // 内部依赖
        packageInfo.internalDependencies.push(imp);
      } else if (imp.type === 'alias-package') {
        // 包间依赖
        packageInfo.internalDependencies.push(imp);
      } else {
        // 外部依赖
        packageInfo.externalDependencies.push(imp);
      }
    }
  }

  // 构建依赖图
  buildDependencyGraph(packages) {
    this.dependencyGraph.clear();

    for (const pkg of packages) {
      const dependencies = new Set();
      
      for (const imp of pkg.imports) {
        if (imp.type === 'alias-package') {
          // 提取包名
          const packageName = imp.source.split('/')[1]; // @smartabp/package-name
          if (packageName) {
            dependencies.add(packageName);
          }
        }
      }

      this.dependencyGraph.set(pkg.name, dependencies);
    }
  }

  // 提取依赖关系
  extractDependencyRelations() {
    const relations = [];

    for (const [packageName, dependencies] of this.dependencyGraph) {
      for (const dep of dependencies) {
        relations.push({
          from: packageName,
          to: dep,
          type: 'depends-on'
        });
      }
    }

    return relations;
  }

  // 检测违规
  async detectViolations() {
    const violations = [];

    // 1. 检测相对路径违规
    violations.push(...this.detectRelativePathViolations());

    // 2. 检测循环依赖
    violations.push(...this.detectCircularDependencies());

    // 3. 检测架构层级违规
    violations.push(...this.detectArchitectureViolations());

    // 4. 检测@/别名违规
    violations.push(...this.detectMainAliasViolations());

    return violations;
  }

  // 检测相对路径违规
  detectRelativePathViolations() {
    const violations = [];

    for (const [packageName, _] of this.dependencyGraph) {
      // 在packages目录中搜索相对路径违规
      const packagePath = path.join(this.projectRoot, 'src/SmartAbp.Vue/packages', packageName);
      if (fs.existsSync(packagePath)) {
        const files = this.scanFiles(packagePath, ['.ts', '.vue', '.js']);
        
        for (const file of files) {
          const filePath = path.join(packagePath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          
          // 检查是否有'../'跨越packages边界
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (line.includes("'../") && line.includes('packages/')) {
              violations.push({
                type: 'relative-path-violation',
                severity: 'error',
                package: packageName,
                file: file,
                line: index + 1,
                message: '禁止使用相对路径跨越packages边界',
                code: line.trim(),
                fix: '使用@smartabp/*别名替代相对路径'
              });
            }
          });
        }
      }
    }

    return violations;
  }

  // 检测循环依赖
  detectCircularDependencies() {
    const violations = [];
    const visited = new Set();
    const recursionStack = new Set();

    const detectCycle = (packageName, path = []) => {
      if (recursionStack.has(packageName)) {
        // 发现循环依赖
        const cyclePath = [...path, packageName];
        const cycleStart = cyclePath.indexOf(packageName);
        const cycle = cyclePath.slice(cycleStart);
        
        violations.push({
          type: 'circular-dependency',
          severity: 'error',
          cycle: cycle,
          message: `检测到循环依赖: ${cycle.join(' → ')}`,
          impact: 'high',
          fix: '重构包结构，提取共享依赖到基础包'
        });
        return;
      }

      if (visited.has(packageName)) return;

      visited.add(packageName);
      recursionStack.add(packageName);

      const dependencies = this.dependencyGraph.get(packageName) || new Set();
      for (const dep of dependencies) {
        detectCycle(dep, [...path, packageName]);
      }

      recursionStack.delete(packageName);
    };

    for (const packageName of this.dependencyGraph.keys()) {
      if (!visited.has(packageName)) {
        detectCycle(packageName);
      }
    }

    return violations;
  }

  // 检测架构层级违规
  detectArchitectureViolations() {
    const violations = [];

    // 定义架构层级（从低到高）
    const architectureLayers = {
      'lowcode-shared': 0,    // 基础层
      'lowcode-core': 1,      // 核心层
      'lowcode-api': 1,       // 核心层
      'lowcode-tools': 1,     // 核心层
      'lowcode-designer': 2,  // 表现层
      'main-application': 3   // 应用层
    };

    for (const [packageName, dependencies] of this.dependencyGraph) {
      const packageLayer = architectureLayers[packageName];
      if (packageLayer === undefined) continue;

      for (const dep of dependencies) {
        const depLayer = architectureLayers[dep];
        if (depLayer === undefined) continue;

        // 检查是否违反层级依赖原则（高层依赖低层）
        if (packageLayer < depLayer) {
          violations.push({
            type: 'architecture-layer-violation',
            severity: 'error',
            package: packageName,
            dependency: dep,
            message: `架构层级违规: ${packageName}(层级${packageLayer})不能依赖${dep}(层级${depLayer})`,
            impact: 'high',
            fix: '重构依赖关系，确保高层依赖低层'
          });
        }
      }
    }

    return violations;
  }

  // 检测@/别名违规
  detectMainAliasViolations() {
    const violations = [];

    // 检查packages目录中是否有@/引用
    for (const packageDir of this.packagesDirs) {
      const packagePath = path.join(this.projectRoot, packageDir);
      if (fs.existsSync(packagePath)) {
        const files = this.scanFiles(packagePath, ['.ts', '.vue', '.js']);
        
        for (const file of files) {
          const filePath = path.join(packagePath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (line.includes('@/') && (line.includes('import') || line.includes('require'))) {
              violations.push({
                type: 'main-alias-violation',
                severity: 'error',
                package: path.basename(packageDir),
                file: file,
                line: index + 1,
                message: '禁止在packages中使用@/别名引用主应用',
                code: line.trim(),
                fix: '使用@smartabp/*别名或将代码移到共享包中'
              });
            }
          });
        }
      }
    }

    return violations;
  }

  // 计算指标
  calculateMetrics(analysis) {
    const metrics = {
      totalPackages: analysis.packages.length,
      totalViolations: analysis.violations.length,
      violationsByType: {},
      violationsBySeverity: {},
      dependencyDepth: 0,
      couplingIndex: 0,
      architectureHealth: 0
    };

    // 违规类型统计
    analysis.violations.forEach(violation => {
      metrics.violationsByType[violation.type] = (metrics.violationsByType[violation.type] || 0) + 1;
      metrics.violationsBySeverity[violation.severity] = (metrics.violationsBySeverity[violation.severity] || 0) + 1;
    });

    // 依赖深度计算
    metrics.dependencyDepth = this.calculateDependencyDepth();

    // 耦合度计算
    metrics.couplingIndex = this.calculateCouplingIndex(analysis);

    // 架构健康度计算（0-100分）
    metrics.architectureHealth = this.calculateArchitectureHealth(metrics);

    return metrics;
  }

  // 计算依赖深度
  calculateDependencyDepth() {
    let maxDepth = 0;

    const calculateDepth = (packageName, visited = new Set()) => {
      if (visited.has(packageName)) return 0; // 避免循环
      
      visited.add(packageName);
      const dependencies = this.dependencyGraph.get(packageName) || new Set();
      
      let depth = 0;
      for (const dep of dependencies) {
        depth = Math.max(depth, calculateDepth(dep, new Set(visited)) + 1);
      }
      
      return depth;
    };

    for (const packageName of this.dependencyGraph.keys()) {
      maxDepth = Math.max(maxDepth, calculateDepth(packageName));
    }

    return maxDepth;
  }

  // 计算耦合度
  calculateCouplingIndex(analysis) {
    const totalRelations = analysis.dependencies.length;
    const totalPackages = analysis.packages.length;
    
    if (totalPackages <= 1) return 0;
    
    // 最大可能的依赖关系数（完全图）
    const maxPossibleRelations = totalPackages * (totalPackages - 1);
    
    return totalRelations / maxPossibleRelations;
  }

  // 计算架构健康度
  calculateArchitectureHealth(metrics) {
    let score = 100;

    // 违规扣分
    score -= metrics.violationsBySeverity.error * 10 || 0;
    score -= metrics.violationsBySeverity.warning * 5 || 0;

    // 耦合度扣分
    score -= metrics.couplingIndex * 20;

    // 依赖深度扣分
    if (metrics.dependencyDepth > 5) {
      score -= (metrics.dependencyDepth - 5) * 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  // 生成建议
  generateRecommendations(analysis) {
    const recommendations = [];

    // 基于违规生成建议
    const violationTypes = Object.keys(analysis.metrics.violationsByType);
    
    if (violationTypes.includes('relative-path-violation')) {
      recommendations.push({
        type: 'architecture',
        priority: 'high',
        title: '修复相对路径违规',
        description: '将所有相对路径引用替换为@smartabp/*别名',
        impact: '提升架构清晰度和可维护性',
        effort: 'medium'
      });
    }

    if (violationTypes.includes('circular-dependency')) {
      recommendations.push({
        type: 'refactoring',
        priority: 'critical',
        title: '解决循环依赖',
        description: '重构包结构，提取共享依赖到基础包',
        impact: '防止架构腐化，提升代码质量',
        effort: 'high'
      });
    }

    if (analysis.metrics.couplingIndex > 0.3) {
      recommendations.push({
        type: 'design',
        priority: 'medium',
        title: '降低包间耦合度',
        description: '当前耦合度较高，建议重新设计包边界',
        impact: '提升系统可扩展性和可维护性',
        effort: 'high'
      });
    }

    if (analysis.metrics.architectureHealth < 80) {
      recommendations.push({
        type: 'quality',
        priority: 'high',
        title: '提升架构健康度',
        description: `当前架构健康度${analysis.metrics.architectureHealth}分，需要重点关注`,
        impact: '全面提升代码质量和系统稳定性',
        effort: 'high'
      });
    }

    return recommendations;
  }

  // 获取工具定义
  static getToolDefinitions() {
    return [
      {
        name: 'mcp_dependency_analyze_full',
        description: '全面分析项目依赖关系，检测违规和生成优化建议',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false
        }
      },
      {
        name: 'mcp_dependency_check_violations',
        description: '快速检查依赖违规（相对路径、循环依赖、架构层级）',
        inputSchema: {
          type: 'object',
          properties: {
            violationType: {
              type: 'string',
              description: '检查的违规类型',
              enum: ['all', 'relative-path', 'circular', 'architecture', 'main-alias']
            }
          }
        }
      },
      {
        name: 'mcp_dependency_graph',
        description: '生成项目依赖关系图',
        inputSchema: {
          type: 'object',
          properties: {
            format: {
              type: 'string',
              description: '输出格式',
              enum: ['json', 'mermaid', 'dot'],
              default: 'json'
            }
          }
        }
      }
    ];
  }

  // 处理工具调用
  async handleToolCall(toolName, args) {
    switch (toolName) {
      case 'mcp_dependency_analyze_full':
        return await this.analyzeDependencies();
      
      case 'mcp_dependency_check_violations':
        return await this.checkViolations(args.violationType || 'all');
      
      case 'mcp_dependency_graph':
        return await this.generateDependencyGraph(args.format || 'json');
      
      default:
        throw new Error(`未知的工具: ${toolName}`);
    }
  }

  // 快速检查违规
  async checkViolations(violationType) {
    console.error(`[依赖分析器] 检查${violationType}违规...`);
    
    let violations = [];
    
    if (violationType === 'all' || violationType === 'relative-path') {
      violations.push(...this.detectRelativePathViolations());
    }
    
    if (violationType === 'all' || violationType === 'circular') {
      // 需要先构建依赖图
      const analysis = await this.analyzeDependencies();
      violations.push(...this.detectCircularDependencies());
    }
    
    if (violationType === 'all' || violationType === 'architecture') {
      const analysis = await this.analyzeDependencies();
      violations.push(...this.detectArchitectureViolations());
    }
    
    if (violationType === 'all' || violationType === 'main-alias') {
      violations.push(...this.detectMainAliasViolations());
    }

    return {
      violationType,
      violationCount: violations.length,
      violations: violations,
      summary: this.summarizeViolations(violations)
    };
  }

  // 生成依赖图
  async generateDependencyGraph(format) {
    const analysis = await this.analyzeDependencies();
    
    switch (format) {
      case 'mermaid':
        return this.generateMermaidGraph(analysis);
      case 'dot':
        return this.generateDotGraph(analysis);
      default:
        return {
          packages: analysis.packages.map(pkg => ({
            name: pkg.name,
            type: pkg.type,
            dependencyCount: pkg.internalDependencies.length
          })),
          dependencies: analysis.dependencies
        };
    }
  }

  // 生成Mermaid图
  generateMermaidGraph(analysis) {
    let mermaid = 'graph TD\n';
    
    // 添加节点
    analysis.packages.forEach(pkg => {
      mermaid += `    ${pkg.name}[${pkg.name}]\n`;
    });
    
    // 添加依赖关系
    analysis.dependencies.forEach(dep => {
      mermaid += `    ${dep.from} --> ${dep.to}\n`;
    });

    return {
      format: 'mermaid',
      content: mermaid
    };
  }

  // 汇总违规
  summarizeViolations(violations) {
    const summary = {
      total: violations.length,
      byType: {},
      bySeverity: {},
      topIssues: []
    };

    violations.forEach(violation => {
      summary.byType[violation.type] = (summary.byType[violation.type] || 0) + 1;
      summary.bySeverity[violation.severity] = (summary.bySeverity[violation.severity] || 0) + 1;
    });

    // 提取主要问题
    summary.topIssues = violations
      .filter(v => v.severity === 'error')
      .slice(0, 5)
      .map(v => ({
        type: v.type,
        message: v.message,
        location: v.package ? `${v.package}/${v.file}:${v.line}` : 'global'
      }));

    return summary;
  }
}

module.exports = DependencyAnalyzer;
