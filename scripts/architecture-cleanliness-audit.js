#!/usr/bin/env node
// 🏗️ SmartAbp 低代码引擎架构整洁度检查 - 企业级专业脚本
// 基于项目实际情况的智能化架构审计

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 🎯 SmartAbp 架构整洁度审计器
 * 针对低代码引擎前端项目的专业架构检查
 */
class SmartAbpArchitectureAudit {
  constructor(projectRoot = path.join(__dirname, '../src/SmartAbp.Vue')) {
    this.projectRoot = projectRoot;
    this.issues = [];
    this.metrics = {
      totalFiles: 0,
      duplicateComponents: 0,
      duplicateStores: 0,
      pathViolations: 0,
      typeIssues: 0,
      configDuplicates: 0
    };
  }

  /**
   * 🔍 1. packages目录黑盒原则检查 (最高优先级)
   */
  checkPackagesBlackBoxPrinciple() {
    console.log('🔍 检查packages目录黑盒原则违规...');
    
    const packagesDir = path.join(this.projectRoot, 'packages');
    if (!fs.existsSync(packagesDir)) {
      this.issues.push({
        type: 'PACKAGES_MISSING',
        severity: 'CRITICAL',
        description: 'packages目录不存在，违反低代码引擎架构要求'
      });
      return;
    }

    // 检查相对路径违规
    const relativePathViolations = this.checkRelativePathViolations(packagesDir);
    this.metrics.pathViolations = relativePathViolations.length;
    this.issues.push(...relativePathViolations);

    // 检查@/路径违规  
    const aliasPathViolations = this.checkAliasPathViolations(packagesDir);
    this.issues.push(...aliasPathViolations);

    // 检查独立配置文件违规
    const configViolations = this.checkIndependentConfigViolations(packagesDir);
    this.issues.push(...configViolations);
  }

  /**
   * 🔄 2. 代码重复度检查 (基于实际项目结构)
   */
  checkCodeDuplication() {
    console.log('🔍 检查代码重复度...');
    
    // 检查Vue组件重复
    this.checkVueComponentDuplication();
    
    // 检查Store重复
    this.checkStoreStateDuplication();
    
    // 检查工具函数重复
    this.checkUtilityFunctionDuplication();
    
    // 检查类型定义重复
    this.checkTypeDefinitionDuplication();
  }

  /**
   * 🧩 3. 组件设计模式一致性检查
   */
  checkComponentPatterns() {
    console.log('🔍 检查组件设计模式一致性...');
    
    const vueFiles = this.findVueFiles();
    this.metrics.totalFiles = vueFiles.length;

    vueFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // 检查Composition API vs Options API混用
      this.checkApiConsistency(file, content);
      
      // 检查组件结构顺序
      this.checkComponentStructure(file, content);
      
      // 检查Props类型定义
      this.checkPropsTypeDefinition(file, content);
      
      // 检查事件定义规范
      this.checkEventDefinition(file, content);
    });
  }

  /**
   * 🏪 4. Store架构验证 (针对Pinia)
   */
  checkStoreArchitecture() {
    console.log('🔍 检查Pinia Store架构...');
    
    const storeFiles = [
      ...this.findFilesInDir('src/stores'),
      ...this.findFilesInDir('packages/lowcode-core/src/stores')
    ];

    storeFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // 检查Store命名规范
      this.checkStoreNaming(file, content);
      
      // 检查Store结构规范
      this.checkStoreStructure(file, content);
      
      // 检查状态管理边界
      this.checkStateBoundaries(file, content);
    });
  }

  /**
   * 📦 5. 依赖和包管理检查
   */
  checkDependencyManagement() {
    console.log('🔍 检查依赖包管理...');
    
    try {
      // 检查重复依赖
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));
      
      // 检查包版本一致性
      this.checkPackageVersionConsistency(packageJson);
      
      // 检查未使用的依赖
      this.checkUnusedDependencies();
      
      // 检查安全漏洞
      this.checkSecurityVulnerabilities();
      
    } catch (error) {
      this.issues.push({
        type: 'PACKAGE_JSON_ERROR',
        severity: 'HIGH',
        description: `package.json读取失败: ${error.message}`
      });
    }
  }

  /**
   * 🎨 6. 低代码引擎特定检查
   */
  checkLowCodeEngineSpecifics() {
    console.log('🔍 检查低代码引擎特定架构...');
    
    // 检查packages目录结构完整性
    this.checkPackagesStructureCompleteness();
    
    // 检查组件导出一致性
    this.checkComponentExportConsistency();
    
    // 检查事件总线使用规范
    this.checkEventBusUsage();
    
    // 检查错误边界实现
    this.checkErrorBoundaryImplementation();
  }

  // ===== 具体检查方法实现 =====

  checkRelativePathViolations(packagesDir) {
    const violations = [];
    const files = this.findFilesInDirRecursive(packagesDir, ['.ts', '.vue', '.js']);
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.includes("'../") && line.includes('import')) {
          // 检查是否跨越packages目录
          const importPath = line.match(/['"]([^'"]+)['"]/)?.[1];
          if (importPath && importPath.includes('../') && !importPath.startsWith('../packages/')) {
            violations.push({
              type: 'RELATIVE_PATH_VIOLATION',
              severity: 'CRITICAL',
              file: path.relative(this.projectRoot, file),
              line: index + 1,
              content: line.trim(),
              description: `违反黑盒原则：packages内使用相对路径跨越到外部 "${importPath}"`
            });
          }
        }
      });
    });
    
    return violations;
  }

  checkAliasPathViolations(packagesDir) {
    const violations = [];
    const files = this.findFilesInDirRecursive(packagesDir, ['.ts', '.vue', '.js']);
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.includes('@/') && line.includes('import') && !line.includes('@smartabp/')) {
          const importPath = line.match(/['"]([^'"]+)['"]/)?.[1];
          violations.push({
            type: 'ALIAS_PATH_VIOLATION',
            severity: 'HIGH',
            file: path.relative(this.projectRoot, file),
            line: index + 1,
            content: line.trim(),
            description: `违反黑盒原则：packages内使用@/引用主应用 "${importPath}"`
          });
        }
      });
    });
    
    return violations;
  }

  checkVueComponentDuplication() {
    const componentMap = new Map();
    const vueFiles = this.findVueFiles();
    
    vueFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const componentName = this.extractComponentName(file, content);
      
      if (componentName) {
        if (componentMap.has(componentName)) {
          this.issues.push({
            type: 'COMPONENT_DUPLICATION',
            severity: 'HIGH',
            file: path.relative(this.projectRoot, file),
            duplicateFile: path.relative(this.projectRoot, componentMap.get(componentName)),
            description: `重复的组件名: ${componentName}`
          });
          this.metrics.duplicateComponents++;
        } else {
          componentMap.set(componentName, file);
        }
      }
    });
  }

  checkStoreStateDuplication() {
    const storeMap = new Map();
    const storeFiles = [
      ...this.findFilesInDir('src/stores'),
      ...this.findFilesInDir('packages/lowcode-core/src/stores')
    ];
    
    storeFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // 提取Store名称
      const storeNameMatch = content.match(/defineStore\(['"]([^'"]+)['"]/);
      if (storeNameMatch) {
        const storeName = storeNameMatch[1];
        if (storeMap.has(storeName)) {
          this.issues.push({
            type: 'STORE_DUPLICATION',
            severity: 'HIGH',
            file: path.relative(this.projectRoot, file),
            duplicateFile: path.relative(this.projectRoot, storeMap.get(storeName)),
            description: `重复的Store定义: ${storeName}`
          });
          this.metrics.duplicateStores++;
        } else {
          storeMap.set(storeName, file);
        }
      }
    });
  }

  checkPackagesStructureCompleteness() {
    const requiredPackages = [
      'lowcode-core',
      'lowcode-designer', 
      'lowcode-codegen',
      'lowcode-api',
      'lowcode-tools',
      'lowcode-ui-vue'
    ];
    
    const packagesDir = path.join(this.projectRoot, 'packages');
    
    requiredPackages.forEach(packageName => {
      const packageDir = path.join(packagesDir, packageName);
      if (!fs.existsSync(packageDir)) {
        this.issues.push({
          type: 'MISSING_REQUIRED_PACKAGE',
          severity: 'HIGH',
          description: `缺少必需的包目录: ${packageName}`
        });
      } else {
        // 检查index.ts导出文件
        const indexFile = path.join(packageDir, 'index.ts');
        if (!fs.existsSync(indexFile)) {
          this.issues.push({
            type: 'MISSING_PACKAGE_INDEX',
            severity: 'MEDIUM',
            file: `packages/${packageName}/index.ts`,
            description: `包缺少导出文件: ${packageName}/index.ts`
          });
        }
      }
    });
  }

  checkComponentExportConsistency() {
    const designerIndexFile = path.join(this.projectRoot, 'packages/lowcode-designer/index.ts');
    
    if (fs.existsSync(designerIndexFile)) {
      const content = fs.readFileSync(designerIndexFile, 'utf8');
      const componentsDir = path.join(this.projectRoot, 'packages/lowcode-designer/src/components');
      
      if (fs.existsSync(componentsDir)) {
        const componentFiles = fs.readdirSync(componentsDir)
          .filter(file => file.endsWith('.vue'))
          .map(file => path.basename(file, '.vue'));
        
        componentFiles.forEach(componentName => {
          if (!content.includes(componentName)) {
            this.issues.push({
              type: 'MISSING_COMPONENT_EXPORT',
              severity: 'MEDIUM',
              file: 'packages/lowcode-designer/index.ts',
              description: `组件 ${componentName} 未在index.ts中导出`
            });
          }
        });
      }
    }
  }

  checkApiConsistency(file, content) {
    // 检查Composition API vs Options API混用
    const hasSetupScript = content.includes('<script setup');
    const hasSetupFunction = content.includes('setup()');
    const hasOptionsApi = content.includes('data()') || content.includes('methods:') || content.includes('computed:');
    
    if ((hasSetupScript || hasSetupFunction) && hasOptionsApi) {
      this.issues.push({
        type: 'MIXED_API_USAGE',
        severity: 'MEDIUM',
        file: path.relative(this.projectRoot, file),
        description: '混合使用Options API和Composition API，建议统一使用Composition API'
      });
    }
  }

  checkStoreNaming(file, content) {
    // 检查Store命名是否符合use*Store规范
    const storeNameMatch = content.match(/export\s+const\s+(use\w+Store)/);
    if (storeNameMatch) {
      const storeName = storeNameMatch[1];
      const fileName = path.basename(file, path.extname(file));
      
      // Store名称应该与文件名对应
      const expectedName = `use${fileName.charAt(0).toUpperCase() + fileName.slice(1)}Store`;
      if (storeName !== expectedName) {
        this.issues.push({
          type: 'STORE_NAMING_INCONSISTENCY',
          severity: 'LOW',
          file: path.relative(this.projectRoot, file),
          description: `Store命名不一致: ${storeName} vs 期望的 ${expectedName}`
        });
      }
    }
  }

  checkEventBusUsage() {
    const eventBusFiles = this.findFilesContaining('eventBus', ['.ts', '.vue', '.js']);
    const eventBusImports = new Set();
    
    eventBusFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // 检查eventBus导入路径
      const importMatches = content.match(/import.*eventBus.*from\s+['"]([^'"]+)['"]/g);
      if (importMatches) {
        importMatches.forEach(match => {
          const importPath = match.match(/from\s+['"]([^'"]+)['"]/)?.[1];
          if (importPath) {
            eventBusImports.add(importPath);
          }
        });
      }
    });
    
    // 检查是否有多个eventBus导入路径（应该统一使用@smartabp/lowcode-tools）
    if (eventBusImports.size > 1) {
      this.issues.push({
        type: 'INCONSISTENT_EVENTBUS_IMPORT',
        severity: 'MEDIUM',
        description: `EventBus导入路径不一致: ${Array.from(eventBusImports).join(', ')}`
      });
    }
  }

  /**
   * 🏗️ 7. 架构模式验证
   */
  checkArchitecturePatterns() {
    console.log('🔍 检查架构模式...');
    
    // 检查DDD模式
    this.checkDDDPatterns();
    
    // 检查CQRS模式
    this.checkCQRSPatterns();
    
    // 检查事件驱动模式
    this.checkEventDrivenPatterns();
  }

  checkDDDPatterns() {
    const entityFiles = this.findFilesContaining('entity', ['.ts', '.vue']);
    
    entityFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // 检查实体定义是否包含必要的字段
      if (content.includes('interface') && content.includes('Entity')) {
        const hasId = content.includes('id:');
        const hasCreatedAt = content.includes('createdAt') || content.includes('created_at');
        const hasUpdatedAt = content.includes('updatedAt') || content.includes('updated_at');
        
        if (!hasId || !hasCreatedAt || !hasUpdatedAt) {
          this.issues.push({
            type: 'INCOMPLETE_ENTITY_DEFINITION',
            severity: 'MEDIUM',
            file: path.relative(this.projectRoot, file),
            description: '实体定义缺少基础字段 (id, createdAt, updatedAt)'
          });
        }
      }
    });
  }

  /**
   * 🔧 8. 自动修复建议生成
   */
  generateFixSuggestions() {
    const fixes = [];
    
    this.issues.forEach(issue => {
      const fix = this.generateFixForIssue(issue);
      if (fix) fixes.push(fix);
    });
    
    return fixes;
  }

  generateFixForIssue(issue) {
    switch (issue.type) {
      case 'RELATIVE_PATH_VIOLATION':
        return {
          issue: issue.description,
          suggestion: `将 ${issue.content} 修改为使用 @smartabp/* 别名`,
          action: 'REPLACE_WITH_ALIAS',
          priority: 'CRITICAL',
          command: `sed -i "s|${issue.content}|// 修复为@smartabp别名|g" ${issue.file}`
        };
        
      case 'ALIAS_PATH_VIOLATION':
        return {
          issue: issue.description,
          suggestion: `将 @/ 路径修改为 @smartabp/* 别名`,
          action: 'FIX_ALIAS_PATH',
          priority: 'HIGH',
          file: issue.file,
          line: issue.line
        };
        
      case 'COMPONENT_DUPLICATION':
        return {
          issue: issue.description,
          suggestion: `合并重复组件 ${issue.file} 和 ${issue.duplicateFile}`,
          action: 'MERGE_COMPONENTS',
          priority: 'HIGH'
        };
        
      case 'STORE_DUPLICATION':
        return {
          issue: issue.description,
          suggestion: `统一重复的Store定义到一个文件中`,
          action: 'CONSOLIDATE_STORES',
          priority: 'HIGH'
        };
        
      default:
        return null;
    }
  }

  /**
   * 📊 生成详细报告
   */
  generateDetailedReport() {
    const report = {
      metadata: {
        timestamp: new Date().toISOString(),
        project: 'SmartAbp 低代码引擎',
        version: '2.0.0',
        auditVersion: '1.0.0'
      },
      summary: {
        totalIssues: this.issues.length,
        criticalIssues: this.issues.filter(i => i.severity === 'CRITICAL').length,
        highIssues: this.issues.filter(i => i.severity === 'HIGH').length,
        mediumIssues: this.issues.filter(i => i.severity === 'MEDIUM').length,
        lowIssues: this.issues.filter(i => i.severity === 'LOW').length,
        overallScore: this.calculateOverallScore()
      },
      metrics: this.metrics,
      issuesByType: this.groupIssuesByType(),
      detailedIssues: this.issues,
      fixSuggestions: this.generateFixSuggestions(),
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  calculateOverallScore() {
    const weights = { CRITICAL: 10, HIGH: 5, MEDIUM: 2, LOW: 1 };
    const totalPenalty = this.issues.reduce((sum, issue) => sum + weights[issue.severity], 0);
    const maxScore = 100;
    const score = Math.max(0, maxScore - totalPenalty);
    return score;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.metrics.pathViolations > 0) {
      recommendations.push('🚨 紧急：修复packages目录内的路径违规，确保黑盒原则');
    }
    
    if (this.metrics.duplicateComponents > 5) {
      recommendations.push('🔄 建议：合并重复组件，提高代码复用性');
    }
    
    if (this.metrics.duplicateStores > 0) {
      recommendations.push('🏪 建议：统一Store管理，避免状态管理碎片化');
    }
    
    if (this.issues.some(i => i.type === 'MIXED_API_USAGE')) {
      recommendations.push('⚡ 建议：统一使用Composition API，提高代码一致性');
    }
    
    return recommendations;
  }

  // ===== 工具方法 =====

  findVueFiles() {
    return this.findFilesInDirRecursive(this.projectRoot, ['.vue']);
  }

  findFilesInDir(dirName) {
    const dirPath = path.join(this.projectRoot, dirName);
    if (!fs.existsSync(dirPath)) return [];
    
    return this.findFilesInDirRecursive(dirPath, ['.ts', '.js', '.vue']);
  }

  findFilesInDirRecursive(dir, extensions) {
    const files = [];
    
    const search = (currentDir) => {
      try {
        const items = fs.readdirSync(currentDir);
        
        items.forEach(item => {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
            search(fullPath);
          } else if (extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        });
      } catch (error) {
        // 忽略权限错误
      }
    };
    
    search(dir);
    return files;
  }

  findFilesContaining(pattern, extensions) {
    const files = this.findFilesInDirRecursive(this.projectRoot, extensions);
    return files.filter(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        return content.includes(pattern);
      } catch {
        return false;
      }
    });
  }

  extractComponentName(file, content) {
    // 从文件名提取组件名
    const fileName = path.basename(file, '.vue');
    
    // 检查是否有显式的name定义
    const nameMatch = content.match(/name:\s*['"]([^'"]+)['"]/);
    if (nameMatch) {
      return nameMatch[1];
    }
    
    // 使用文件名作为组件名
    return fileName;
  }

  groupIssuesByType() {
    return this.issues.reduce((acc, issue) => {
      acc[issue.type] = acc[issue.type] || [];
      acc[issue.type].push(issue);
      return acc;
    }, {});
  }

  // 占位方法 - 简化实现
  checkIndependentConfigViolations() { return []; }
  checkUtilityFunctionDuplication() {}
  checkTypeDefinitionDuplication() {}
  checkComponentStructure() {}
  checkPropsTypeDefinition() {}
  checkEventDefinition() {}
  checkStoreStructure() {}
  checkStateBoundaries() {}
  checkPackageVersionConsistency() {}
  checkUnusedDependencies() {}
  checkSecurityVulnerabilities() {}
  checkErrorBoundaryImplementation() {}
  checkCQRSPatterns() {}
  checkEventDrivenPatterns() {}

  /**
   * 🚀 执行完整架构审计
   */
  async runFullAudit() {
    console.log('🚀 开始SmartAbp低代码引擎架构整洁度全面检查...\n');
    console.log(`📁 项目路径: ${this.projectRoot}\n`);
    
    // 执行所有检查
    this.checkPackagesBlackBoxPrinciple();    // 最高优先级
    this.checkCodeDuplication();
    this.checkComponentPatterns();
    this.checkStoreArchitecture();
    this.checkDependencyManagement();
    this.checkLowCodeEngineSpecifics();
    this.checkArchitecturePatterns();
    
    // 生成报告
    const report = this.generateDetailedReport();
    
    // 保存报告
    this.saveReport(report);
    
    // 输出摘要
    this.printSummary(report);
    
    return report;
  }

  saveReport(report) {
    const reportsDir = path.join(this.projectRoot, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportFile = path.join(reportsDir, 'architecture-cleanliness-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 详细报告已保存至: ${reportFile}`);
  }

  printSummary(report) {
    console.log('\n🎯 === SmartAbp 架构整洁度检查报告 ===');
    console.log(`📊 总体评分: ${report.summary.overallScore}/100`);
    console.log(`⚠️  发现问题: ${report.summary.totalIssues}个`);
    console.log(`   🚨 严重: ${report.summary.criticalIssues}个`);
    console.log(`   🔴 高级: ${report.summary.highIssues}个`);
    console.log(`   🟡 中级: ${report.summary.mediumIssues}个`);
    console.log(`   🔵 低级: ${report.summary.lowIssues}个`);
    
    console.log('\n📋 问题分类:');
    Object.entries(report.issuesByType).forEach(([type, issues]) => {
      console.log(`   ${type}: ${issues.length}个`);
    });
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 主要建议:');
      report.recommendations.forEach(rec => console.log(`   ${rec}`));
    }
    
    if (report.summary.overallScore >= 85) {
      console.log('\n✅ 架构质量优秀！');
    } else if (report.summary.overallScore >= 70) {
      console.log('\n⚠️  架构质量良好，建议优化');
    } else {
      console.log('\n❌ 架构质量需要改进');
    }
  }
}

/**
 * 🎯 快速检查入口
 */
async function quickArchitectureCheck() {
  const auditor = new SmartAbpArchitectureAudit();
  
  console.log('⚡ 执行快速架构检查...');
  
  // 只执行关键检查
  auditor.checkPackagesBlackBoxPrinciple();
  auditor.checkCodeDuplication();
  
  const summary = {
    score: auditor.calculateOverallScore(),
    critical: auditor.issues.filter(i => i.severity === 'CRITICAL').length,
    pathViolations: auditor.metrics.pathViolations,
    duplicates: auditor.metrics.duplicateComponents + auditor.metrics.duplicateStores
  };
  
  console.log(`\n⚡ 快速检查结果:`);
  console.log(`   评分: ${summary.score}/100`);
  console.log(`   关键问题: ${summary.critical}个`);
  console.log(`   路径违规: ${summary.pathViolations}个`);
  console.log(`   重复代码: ${summary.duplicates}个`);
  
  return summary;
}

// 执行检查
if (require.main === module) {
  const auditor = new SmartAbpArchitectureAudit();
  
  // 检查命令行参数
  const args = process.argv.slice(2);
  const isQuickCheck = args.includes('--quick');
  
  if (isQuickCheck) {
    quickArchitectureCheck().catch(error => {
      console.error('❌ 快速检查失败:', error);
      process.exit(1);
    });
  } else {
    auditor.runFullAudit().then(report => {
      console.log('\n✅ 架构整洁度检查完成!');
      
      if (report.summary.criticalIssues > 0) {
        console.log('\n🚨 发现严重架构问题，建议立即修复！');
        process.exit(1);
      }
    }).catch(error => {
      console.error('❌ 检查失败:', error);
      process.exit(1);
    });
  }
}

module.exports = { SmartAbpArchitectureAudit, quickArchitectureCheck };
