#!/usr/bin/env node

/**
 * SmartAbp 代码质量检查MCP工具
 * 企业级代码质量分析和95分质量标准验证
 */

const fs = require('fs');
const path = require('path');

class CodeQualityChecker {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.qualityThreshold = 95; // 95分质量标准
    this.metrics = {
      complexity: {},
      duplication: {},
      naming: {},
      comments: {},
      typeSafety: {}
    };
  }

  // 全面代码质量分析
  async analyzeCodeQuality() {
    console.error('[代码质量检查器] 开始全面代码质量分析...');
    
    const analysis = {
      timestamp: new Date().toISOString(),
      overallScore: 0,
      metrics: {
        complexity: await this.analyzeComplexity(),
        duplication: await this.analyzeDuplication(), 
        naming: await this.analyzeNaming(),
        comments: await this.analyzeComments(),
        typeSafety: await this.analyzeTypeSafety()
      },
      violations: [],
      recommendations: [],
      summary: {}
    };

    // 计算综合评分
    analysis.overallScore = this.calculateOverallScore(analysis.metrics);
    
    // 收集所有违规
    analysis.violations = this.collectViolations(analysis.metrics);
    
    // 生成改进建议
    analysis.recommendations = this.generateRecommendations(analysis);
    
    // 生成摘要
    analysis.summary = this.generateSummary(analysis);

    console.error(`[代码质量检查器] 分析完成: 综合评分${analysis.overallScore}分`);
    
    return analysis;
  }

  // 复杂度分析
  async analyzeComplexity() {
    console.error('[代码质量检查器] 分析代码复杂度...');
    
    const complexity = {
      cyclomaticComplexity: {},
      cognitiveComplexity: {},
      fileComplexity: {},
      violations: [],
      averageComplexity: 0,
      score: 0
    };

    const sourceFiles = this.getSourceFiles();
    let totalComplexity = 0;
    let fileCount = 0;

    for (const file of sourceFiles) {
      const filePath = path.join(this.projectRoot, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const fileComplexity = this.calculateFileComplexity(content, file);
      complexity.fileComplexity[file] = fileComplexity;
      
      totalComplexity += fileComplexity.cyclomatic;
      fileCount++;

      // 检查复杂度违规
      if (fileComplexity.cyclomatic > 10) {
        complexity.violations.push({
          type: 'high-complexity',
          file: file,
          complexity: fileComplexity.cyclomatic,
          severity: fileComplexity.cyclomatic > 20 ? 'error' : 'warning',
          message: `文件复杂度过高: ${fileComplexity.cyclomatic}`,
          recommendation: '建议重构为更小的函数或类'
        });
      }
    }

    complexity.averageComplexity = fileCount > 0 ? totalComplexity / fileCount : 0;
    complexity.score = this.calculateComplexityScore(complexity);

    return complexity;
  }

  // 计算单个文件复杂度
  calculateFileComplexity(content, fileName) {
    const complexity = {
      cyclomatic: 1, // 基础复杂度
      cognitive: 0,
      functions: [],
      classes: []
    };

    const lines = content.split('\n');
    let currentFunction = null;
    let braceDepth = 0;
    let functionComplexity = 1;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // 检测函数/方法开始
      const functionMatch = trimmedLine.match(/(?:function\s+(\w+)|(\w+)\s*\(.*\)\s*{|(\w+):\s*(?:async\s+)?function)/);
      if (functionMatch) {
        if (currentFunction) {
          complexity.functions.push({
            name: currentFunction,
            complexity: functionComplexity,
            line: index + 1
          });
        }
        currentFunction = functionMatch[1] || functionMatch[2] || functionMatch[3];
        functionComplexity = 1;
      }

      // 计算圈复杂度（控制流语句）
      const complexityKeywords = ['if', 'else if', 'while', 'for', 'switch', 'case', 'catch', '&&', '||', '?'];
      complexityKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        const matches = trimmedLine.match(regex);
        if (matches) {
          complexity.cyclomatic += matches.length;
          functionComplexity += matches.length;
        }
      });

      // 跟踪大括号深度（认知复杂度）
      const openBraces = (trimmedLine.match(/{/g) || []).length;
      const closeBraces = (trimmedLine.match(/}/g) || []).length;
      braceDepth += openBraces - closeBraces;
      
      if (braceDepth > 0) {
        complexity.cognitive += braceDepth;
      }
    });

    // 添加最后一个函数
    if (currentFunction) {
      complexity.functions.push({
        name: currentFunction,
        complexity: functionComplexity,
        line: lines.length
      });
    }

    return complexity;
  }

  // 重复代码分析
  async analyzeDuplication() {
    console.error('[代码质量检查器] 分析代码重复度...');
    
    const duplication = {
      duplicateBlocks: [],
      duplicateFunctions: [],
      duplicateComponents: [],
      violations: [],
      duplicationRatio: 0,
      score: 0
    };

    const sourceFiles = this.getSourceFiles();
    const codeBlocks = new Map(); // 存储代码块哈希
    const functionNames = new Map(); // 存储函数名
    const componentNames = new Map(); // 存储组件名

    for (const file of sourceFiles) {
      const filePath = path.join(this.projectRoot, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 检测重复代码块
      this.findDuplicateBlocks(content, file, codeBlocks, duplication);
      
      // 检测重复函数名
      this.findDuplicateFunctions(content, file, functionNames, duplication);
      
      // 检测重复组件名（Vue文件）
      if (file.endsWith('.vue')) {
        this.findDuplicateComponents(content, file, componentNames, duplication);
      }
    }

    duplication.duplicationRatio = this.calculateDuplicationRatio(duplication);
    duplication.score = this.calculateDuplicationScore(duplication);

    return duplication;
  }

  // 查找重复代码块
  findDuplicateBlocks(content, fileName, codeBlocks, duplication) {
    const lines = content.split('\n');
    const minBlockSize = 5; // 最小重复块大小

    for (let i = 0; i <= lines.length - minBlockSize; i++) {
      const block = lines.slice(i, i + minBlockSize)
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//') && !line.startsWith('*'))
        .join('\n');
      
      if (block.length > 50) { // 忽略太短的块
        const blockHash = this.hashCode(block);
        
        if (codeBlocks.has(blockHash)) {
          const existing = codeBlocks.get(blockHash);
          duplication.duplicateBlocks.push({
            hash: blockHash,
            files: [existing.file, fileName],
            lines: [existing.startLine, i + 1],
            block: block.substring(0, 100) + '...'
          });
          
          duplication.violations.push({
            type: 'duplicate-code-block',
            files: [existing.file, fileName],
            severity: 'warning',
            message: '发现重复代码块',
            recommendation: '提取为共同函数或工具类'
          });
        } else {
          codeBlocks.set(blockHash, {
            file: fileName,
            startLine: i + 1,
            block: block
          });
        }
      }
    }
  }

  // 查找重复函数名
  findDuplicateFunctions(content, fileName, functionNames, duplication) {
    const functionMatches = content.matchAll(/(?:function\s+(\w+)|const\s+(\w+)\s*=|(\w+):\s*(?:async\s+)?function)/g);
    
    for (const match of functionMatches) {
      const functionName = match[1] || match[2] || match[3];
      if (functionName && functionName.length > 3) { // 忽略太短的名称
        if (functionNames.has(functionName)) {
          const existing = functionNames.get(functionName);
          duplication.duplicateFunctions.push({
            name: functionName,
            files: [existing, fileName]
          });
          
          duplication.violations.push({
            type: 'duplicate-function-name',
            functionName: functionName,
            files: [existing, fileName],
            severity: 'error',
            message: `重复的函数名: ${functionName}`,
            recommendation: '重命名函数或合并重复实现'
          });
        } else {
          functionNames.set(functionName, fileName);
        }
      }
    }
  }

  // 查找重复组件名
  findDuplicateComponents(content, fileName, componentNames, duplication) {
    const componentName = path.basename(fileName, '.vue');
    
    if (componentNames.has(componentName)) {
      const existing = componentNames.get(componentName);
      duplication.duplicateComponents.push({
        name: componentName,
        files: [existing, fileName]
      });
      
      duplication.violations.push({
        type: 'duplicate-component-name',
        componentName: componentName,
        files: [existing, fileName],
        severity: 'error',
        message: `重复的组件名: ${componentName}`,
        recommendation: '重命名组件或合并重复组件'
      });
    } else {
      componentNames.set(componentName, fileName);
    }
  }

  // 命名规范分析
  async analyzeNaming() {
    console.error('[代码质量检查器] 分析命名规范...');
    
    const naming = {
      camelCaseViolations: [],
      pascalCaseViolations: [],
      kebabCaseViolations: [],
      constantCaseViolations: [],
      violations: [],
      score: 0
    };

    const sourceFiles = this.getSourceFiles();

    for (const file of sourceFiles) {
      const filePath = path.join(this.projectRoot, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      this.checkNamingConventions(content, file, naming);
    }

    naming.score = this.calculateNamingScore(naming);
    return naming;
  }

  // 检查命名约定
  checkNamingConventions(content, fileName, naming) {
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // 检查变量命名（应该是camelCase）
      const variableMatches = trimmedLine.matchAll(/(?:let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
      for (const match of variableMatches) {
        const varName = match[1];
        if (!this.isCamelCase(varName) && !this.isConstantCase(varName)) {
          naming.camelCaseViolations.push({
            name: varName,
            file: fileName,
            line: index + 1,
            expected: 'camelCase'
          });
          
          naming.violations.push({
            type: 'naming-convention',
            name: varName,
            file: fileName,
            line: index + 1,
            severity: 'warning',
            message: `变量名不符合camelCase规范: ${varName}`,
            recommendation: `建议改为: ${this.toCamelCase(varName)}`
          });
        }
      }

      // 检查类名（应该是PascalCase）
      const classMatches = trimmedLine.matchAll(/class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
      for (const match of classMatches) {
        const className = match[1];
        if (!this.isPascalCase(className)) {
          naming.pascalCaseViolations.push({
            name: className,
            file: fileName,
            line: index + 1,
            expected: 'PascalCase'
          });
          
          naming.violations.push({
            type: 'naming-convention',
            name: className,
            file: fileName,
            line: index + 1,
            severity: 'warning',
            message: `类名不符合PascalCase规范: ${className}`,
            recommendation: `建议改为: ${this.toPascalCase(className)}`
          });
        }
      }
    });

    // 检查Vue文件名（应该是PascalCase）
    if (fileName.endsWith('.vue')) {
      const componentName = path.basename(fileName, '.vue');
      if (!this.isPascalCase(componentName)) {
        naming.violations.push({
          type: 'file-naming-convention',
          name: componentName,
          file: fileName,
          severity: 'warning',
          message: `Vue组件文件名不符合PascalCase规范: ${componentName}`,
          recommendation: `建议改为: ${this.toPascalCase(componentName)}.vue`
        });
      }
    }
  }

  // 注释分析
  async analyzeComments() {
    console.error('[代码质量检查器] 分析注释覆盖率...');
    
    const comments = {
      totalLines: 0,
      commentLines: 0,
      codeLines: 0,
      coverage: 0,
      violations: [],
      score: 0
    };

    const sourceFiles = this.getSourceFiles();

    for (const file of sourceFiles) {
      const filePath = path.join(this.projectRoot, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const fileStats = this.analyzeFileComments(content, file);
      comments.totalLines += fileStats.totalLines;
      comments.commentLines += fileStats.commentLines;
      comments.codeLines += fileStats.codeLines;
      
      // 检查注释不足的文件
      if (fileStats.codeLines > 50 && fileStats.coverage < 0.1) {
        comments.violations.push({
          type: 'insufficient-comments',
          file: file,
          coverage: fileStats.coverage,
          severity: 'warning',
          message: `注释覆盖率过低: ${(fileStats.coverage * 100).toFixed(1)}%`,
          recommendation: '添加必要的函数和类注释'
        });
      }
    }

    comments.coverage = comments.codeLines > 0 ? comments.commentLines / comments.codeLines : 0;
    comments.score = this.calculateCommentsScore(comments);
    
    return comments;
  }

  // 分析单个文件的注释
  analyzeFileComments(content, fileName) {
    const lines = content.split('\n');
    let commentLines = 0;
    let codeLines = 0;
    let inBlockComment = false;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) return; // 跳过空行
      
      // 检查块注释
      if (trimmedLine.includes('/*')) inBlockComment = true;
      if (trimmedLine.includes('*/')) {
        inBlockComment = false;
        if (trimmedLine.startsWith('/*') || trimmedLine === '*/') {
          commentLines++;
          return;
        }
      }
      
      if (inBlockComment) {
        commentLines++;
      } else if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*')) {
        commentLines++;
      } else {
        codeLines++;
      }
    });

    return {
      totalLines: lines.length,
      commentLines,
      codeLines,
      coverage: codeLines > 0 ? commentLines / codeLines : 0
    };
  }

  // 类型安全分析
  async analyzeTypeSafety() {
    console.error('[代码质量检查器] 分析TypeScript类型安全...');
    
    const typeSafety = {
      asAnyUsage: [],
      tsIgnoreUsage: [],
      implicitAnyUsage: [],
      violations: [],
      score: 0
    };

    const tsFiles = this.getSourceFiles().filter(file => file.endsWith('.ts') || file.endsWith('.vue'));

    for (const file of tsFiles) {
      const filePath = path.join(this.projectRoot, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      this.checkTypeSafety(content, file, typeSafety);
    }

    typeSafety.score = this.calculateTypeSafetyScore(typeSafety);
    return typeSafety;
  }

  // 检查类型安全
  checkTypeSafety(content, fileName, typeSafety) {
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // 检查 as any 使用
      if (trimmedLine.includes('as any')) {
        typeSafety.asAnyUsage.push({
          file: fileName,
          line: index + 1,
          code: trimmedLine
        });
        
        typeSafety.violations.push({
          type: 'type-safety-violation',
          subtype: 'as-any',
          file: fileName,
          line: index + 1,
          severity: 'error',
          message: '使用了 "as any" 绕过类型检查',
          code: trimmedLine,
          recommendation: '定义具体的类型接口替代any'
        });
      }
      
      // 检查 @ts-ignore 使用
      if (trimmedLine.includes('@ts-ignore')) {
        typeSafety.tsIgnoreUsage.push({
          file: fileName,
          line: index + 1,
          code: trimmedLine
        });
        
        typeSafety.violations.push({
          type: 'type-safety-violation',
          subtype: 'ts-ignore',
          file: fileName,
          line: index + 1,
          severity: 'warning',
          message: '使用了 @ts-ignore 忽略类型错误',
          code: trimmedLine,
          recommendation: '修复类型错误而不是忽略'
        });
      }
      
      // 检查隐式any（简化检测）
      const implicitAnyPatterns = [
        /:\s*any\b/,
        /=\s*{}\s*[;,]/,
        /function\s+\w+\([^)]*\)\s*{/
      ];
      
      implicitAnyPatterns.forEach(pattern => {
        if (pattern.test(trimmedLine)) {
          typeSafety.implicitAnyUsage.push({
            file: fileName,
            line: index + 1,
            code: trimmedLine
          });
        }
      });
    });
  }

  // 获取源代码文件列表
  getSourceFiles() {
    const files = [];
    const extensions = ['.ts', '.js', '.vue', '.jsx', '.tsx'];
    
    const scanDir = (dir, relativePath = '') => {
      if (!fs.existsSync(dir)) return;
      
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const relativeFilePath = path.join(relativePath, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(entry)) {
            scanDir(fullPath, relativeFilePath);
          }
        } else if (extensions.some(ext => entry.endsWith(ext))) {
          files.push(relativeFilePath);
        }
      }
    };

    // 扫描主要源代码目录
    const sourceDirs = [
      'src/SmartAbp.Vue/src',
      'src/SmartAbp.Vue/packages'
    ];

    sourceDirs.forEach(sourceDir => {
      const fullSourceDir = path.join(this.projectRoot, sourceDir);
      scanDir(fullSourceDir, sourceDir);
    });

    return files;
  }

  // 工具函数
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  isCamelCase(str) {
    return /^[a-z][a-zA-Z0-9]*$/.test(str);
  }

  isPascalCase(str) {
    return /^[A-Z][a-zA-Z0-9]*$/.test(str);
  }

  isConstantCase(str) {
    return /^[A-Z][A-Z0-9_]*$/.test(str);
  }

  toCamelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  toPascalCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // 评分计算
  calculateComplexityScore(complexity) {
    const avgComplexity = complexity.averageComplexity;
    if (avgComplexity <= 5) return 100;
    if (avgComplexity <= 10) return 80;
    if (avgComplexity <= 15) return 60;
    return 40;
  }

  calculateDuplicationScore(duplication) {
    const violationCount = duplication.violations.length;
    if (violationCount === 0) return 100;
    if (violationCount <= 5) return 80;
    if (violationCount <= 10) return 60;
    return 40;
  }

  calculateNamingScore(naming) {
    const violationCount = naming.violations.length;
    if (violationCount === 0) return 100;
    if (violationCount <= 10) return 80;
    if (violationCount <= 20) return 60;
    return 40;
  }

  calculateCommentsScore(comments) {
    const coverage = comments.coverage;
    if (coverage >= 0.3) return 100;
    if (coverage >= 0.2) return 80;
    if (coverage >= 0.1) return 60;
    return 40;
  }

  calculateTypeSafetyScore(typeSafety) {
    const errorCount = typeSafety.violations.filter(v => v.severity === 'error').length;
    if (errorCount === 0) return 100;
    if (errorCount <= 3) return 80;
    if (errorCount <= 10) return 60;
    return 40;
  }

  calculateDuplicationRatio(duplication) {
    const totalViolations = duplication.violations.length;
    const totalFiles = this.getSourceFiles().length;
    return totalFiles > 0 ? totalViolations / totalFiles : 0;
  }

  // 计算综合评分
  calculateOverallScore(metrics) {
    const weights = {
      complexity: 0.25,
      duplication: 0.25,
      naming: 0.15,
      comments: 0.15,
      typeSafety: 0.20
    };

    let totalScore = 0;
    totalScore += metrics.complexity.score * weights.complexity;
    totalScore += metrics.duplication.score * weights.duplication;
    totalScore += metrics.naming.score * weights.naming;
    totalScore += metrics.comments.score * weights.comments;
    totalScore += metrics.typeSafety.score * weights.typeSafety;

    return Math.round(totalScore);
  }

  // 收集所有违规
  collectViolations(metrics) {
    const violations = [];
    
    Object.values(metrics).forEach(metric => {
      if (metric.violations) {
        violations.push(...metric.violations);
      }
    });

    return violations.sort((a, b) => {
      const severityOrder = { error: 3, warning: 2, info: 1 };
      return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    });
  }

  // 生成改进建议
  generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.overallScore < this.qualityThreshold) {
      recommendations.push({
        type: 'overall',
        priority: 'critical',
        title: `代码质量需要提升到95分标准`,
        description: `当前评分${analysis.overallScore}分，距离95分标准还有差距`,
        impact: '提升代码质量和可维护性',
        effort: 'high'
      });
    }

    // 基于各项指标生成具体建议
    if (analysis.metrics.complexity.score < 80) {
      recommendations.push({
        type: 'complexity',
        priority: 'high',
        title: '降低代码复杂度',
        description: '部分函数或文件的复杂度过高，建议重构',
        impact: '提升代码可读性和可维护性',
        effort: 'medium'
      });
    }

    if (analysis.metrics.duplication.score < 80) {
      recommendations.push({
        type: 'duplication',
        priority: 'high',
        title: '消除重复代码',
        description: '发现重复的代码块、函数或组件名',
        impact: '减少维护成本，提高代码一致性',
        effort: 'medium'
      });
    }

    if (analysis.metrics.typeSafety.score < 90) {
      recommendations.push({
        type: 'type-safety',
        priority: 'critical',
        title: '加强类型安全',
        description: '减少as any和@ts-ignore的使用',
        impact: '提高代码可靠性，减少运行时错误',
        effort: 'medium'
      });
    }

    return recommendations;
  }

  // 生成摘要
  generateSummary(analysis) {
    const errorCount = analysis.violations.filter(v => v.severity === 'error').length;
    const warningCount = analysis.violations.filter(v => v.severity === 'warning').length;
    
    return {
      overallScore: analysis.overallScore,
      qualityLevel: this.getQualityLevel(analysis.overallScore),
      totalViolations: analysis.violations.length,
      errorCount,
      warningCount,
      meetsStandard: analysis.overallScore >= this.qualityThreshold,
      topIssues: analysis.violations.slice(0, 5).map(v => ({
        type: v.type,
        severity: v.severity,
        message: v.message,
        file: v.file
      }))
    };
  }

  getQualityLevel(score) {
    if (score >= 95) return 'Excellent';
    if (score >= 85) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 50) return 'Poor';
    return 'Critical';
  }

  // 获取工具定义
  static getToolDefinitions() {
    return [
      {
        name: 'mcp_code_quality_analyze_full',
        description: '全面分析代码质量，包括复杂度、重复度、命名规范、注释覆盖率和类型安全',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false
        }
      },
      {
        name: 'mcp_code_quality_check_specific',
        description: '检查特定的代码质量问题',
        inputSchema: {
          type: 'object',
          properties: {
            checkType: {
              type: 'string',
              description: '检查类型',
              enum: ['complexity', 'duplication', 'naming', 'comments', 'type-safety', 'all']
            },
            threshold: {
              type: 'number',
              description: '质量阈值（0-100）',
              minimum: 0,
              maximum: 100,
              default: 95
            }
          }
        }
      },
      {
        name: 'mcp_code_quality_get_score',
        description: '获取代码质量综合评分',
        inputSchema: {
          type: 'object',
          properties: {
            detailed: {
              type: 'boolean',
              description: '是否返回详细的分项评分',
              default: false
            }
          }
        }
      }
    ];
  }

  // 处理工具调用
  async handleToolCall(toolName, args) {
    switch (toolName) {
      case 'mcp_code_quality_analyze_full':
        return await this.analyzeCodeQuality();
      
      case 'mcp_code_quality_check_specific':
        return await this.checkSpecificQuality(args.checkType || 'all', args.threshold || 95);
      
      case 'mcp_code_quality_get_score':
        return await this.getQualityScore(args.detailed || false);
      
      default:
        throw new Error(`未知的工具: ${toolName}`);
    }
  }

  // 检查特定质量问题
  async checkSpecificQuality(checkType, threshold) {
    console.error(`[代码质量检查器] 检查${checkType}质量问题...`);
    
    const result = {
      checkType,
      threshold,
      timestamp: new Date().toISOString(),
      passed: false,
      score: 0,
      violations: [],
      recommendations: []
    };

    switch (checkType) {
      case 'complexity':
        const complexity = await this.analyzeComplexity();
        result.score = complexity.score;
        result.violations = complexity.violations;
        break;
      
      case 'duplication':
        const duplication = await this.analyzeDuplication();
        result.score = duplication.score;
        result.violations = duplication.violations;
        break;
      
      case 'type-safety':
        const typeSafety = await this.analyzeTypeSafety();
        result.score = typeSafety.score;
        result.violations = typeSafety.violations;
        break;
      
      default:
        const fullAnalysis = await this.analyzeCodeQuality();
        result.score = fullAnalysis.overallScore;
        result.violations = fullAnalysis.violations;
        result.recommendations = fullAnalysis.recommendations;
    }

    result.passed = result.score >= threshold;
    
    return result;
  }

  // 获取质量评分
  async getQualityScore(detailed) {
    const analysis = await this.analyzeCodeQuality();
    
    if (detailed) {
      return {
        overallScore: analysis.overallScore,
        breakdown: {
          complexity: analysis.metrics.complexity.score,
          duplication: analysis.metrics.duplication.score,
          naming: analysis.metrics.naming.score,
          comments: analysis.metrics.comments.score,
          typeSafety: analysis.metrics.typeSafety.score
        },
        summary: analysis.summary
      };
    } else {
      return {
        overallScore: analysis.overallScore,
        qualityLevel: this.getQualityLevel(analysis.overallScore),
        meetsStandard: analysis.overallScore >= this.qualityThreshold
      };
    }
  }
}

module.exports = CodeQualityChecker;
