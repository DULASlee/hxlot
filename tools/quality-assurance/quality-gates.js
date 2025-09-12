/**
 * AI代码质量门禁检查工具
 * 确保AI生成的代码符合设计模式和业界标准
 */

const fs = require('fs');
const path = require('path');

class QualityGateChecker {
  constructor() {
    this.designPatterns = this.loadConfig('design-patterns-checklist.json');
    this.industryStandards = this.loadConfig('industry-standards.json');
    this.completenessRules = this.loadConfig('completeness-checklist.json');
  }

  loadConfig(filename) {
    try {
      const configPath = path.join(__dirname, filename);
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.warn(`配置文件加载失败: ${filename}`, error.message);
      return {};
    }
  }

  /**
   * 检查代码是否符合设计模式
   */
  checkDesignPatterns(code, fileType) {
    const results = {
      passed: [],
      failed: [],
      warnings: []
    };

    if (fileType === 'vue') {
      this.mergeResults(results, this.checkVuePatterns(code));
    } else if (fileType === 'cs') {
      this.mergeResults(results, this.checkCSharpPatterns(code));
    } else if (fileType === 'ts') {
      this.mergeResults(results, this.checkTypeScriptPatterns(code));
    }

    return results;
  }

  /**
   * 检查Vue组件设计模式
   */
  checkVuePatterns(code) {
    const results = { passed: [], failed: [], warnings: [] };
    
    // 检查Composition API使用
    if (code.includes('<script setup>') || code.includes('setup()')) {
      results.passed.push('✅ 使用Composition API');
      
      // 检查响应式API使用
      if (code.includes('ref(') || code.includes('reactive(')) {
        results.passed.push('✅ 正确使用响应式API');
      } else {
        results.failed.push('❌ 缺少响应式状态管理');
      }
      
      // 检查生命周期钩子
      if (code.includes('onMounted') || code.includes('onUnmounted')) {
        results.passed.push('✅ 使用生命周期钩子');
      }
      
      // 检查组合式函数
      if (code.includes('use') && code.includes('composables')) {
        results.passed.push('✅ 使用组合式函数');
      }
    } else {
      results.warnings.push('⚠️ 建议使用Composition API');
    }

    // 检查Props定义
    if (code.includes('defineProps') || code.includes('props:')) {
      results.passed.push('✅ 定义了Props');
      
      // 检查Props类型验证
      if (code.includes('PropType') || code.includes('type:')) {
        results.passed.push('✅ Props类型验证');
      } else {
        results.failed.push('❌ 缺少Props类型验证');
      }
    }

    // 检查事件定义
    if (code.includes('defineEmits') || code.includes('$emit')) {
      results.passed.push('✅ 定义了自定义事件');
    }

    // 检查样式隔离
    if (code.includes('scoped') || code.includes('module')) {
      results.passed.push('✅ 使用样式隔离');
    } else {
      results.warnings.push('⚠️ 建议使用scoped CSS');
    }

    return results;
  }

  /**
   * 检查C#代码设计模式
   */
  checkCSharpPatterns(code) {
    const results = { passed: [], failed: [], warnings: [] };

    // 检查ABP应用服务模式
    if (code.includes('ApplicationService') || code.includes('IApplicationService')) {
      results.passed.push('✅ 使用ABP应用服务模式');
      
      // 检查异步方法
      if (code.includes('async Task') || code.includes('async ValueTask')) {
        results.passed.push('✅ 使用异步编程');
      } else {
        results.failed.push('❌ 缺少异步方法实现');
      }
      
      // 检查权限验证
      if (code.includes('[Authorize') || code.includes('RequirePermissions')) {
        results.passed.push('✅ 实现权限验证');
      } else {
        results.warnings.push('⚠️ 建议添加权限验证');
      }
    }

    // 检查仓储模式
    if (code.includes('IRepository') || code.includes('Repository')) {
      results.passed.push('✅ 使用仓储模式');
    }

    // 检查依赖注入
    if (code.includes('ITransientDependency') || code.includes('ISingletonDependency')) {
      results.passed.push('✅ 使用依赖注入');
    }

    // 检查异常处理
    if (code.includes('try') && code.includes('catch')) {
      results.passed.push('✅ 实现异常处理');
    } else {
      results.failed.push('❌ 缺少异常处理');
    }

    return results;
  }

  /**
   * 检查TypeScript代码设计模式
   */
  checkTypeScriptPatterns(code) {
    const results = { passed: [], failed: [], warnings: [] };

    // 组合式与Pinia（前端TS常见）
    if (code.includes('defineStore(')) {
      results.passed.push('✅ 使用Pinia状态管理');
    }

    // 类型使用与any规避
    if (/\bany\b/.test(code)) {
      results.warnings.push('⚠️ 存在 any 类型，建议收紧类型');
    } else {
      results.passed.push('✅ 无 any 类型');
    }

    // 基础异常处理
    if (code.includes('try') && code.includes('catch')) {
      results.passed.push('✅ 存在异常处理');
    } else {
      results.warnings.push('⚠️ 建议添加必要的异常处理');
    }

    return results;
  }

  /**
   * 合并检测结果
   */
  mergeResults(target, source) {
    if (!source) return target;
    target.passed.push(...(source.passed || []));
    target.failed.push(...(source.failed || []));
    target.warnings.push(...(source.warnings || []));
    return target;
  }

  /**
   * 检查功能完整性
   */
  checkCompleteness(code, componentType) {
    const results = { passed: [], failed: [], warnings: [] };
    
    if (componentType === 'crud') {
      return this.checkCrudCompleteness(code);
    } else if (componentType === 'form') {
      return this.checkFormCompleteness(code);
    } else if (componentType === 'api') {
      return this.checkApiCompleteness(code);
    }

    return results;
  }

  /**
   * 检查CRUD功能完整性
   */
  checkCrudCompleteness(code) {
    const results = { passed: [], failed: [], warnings: [] };
    const requiredOperations = ['Create', 'Read', 'Update', 'Delete'];
    
    requiredOperations.forEach(operation => {
      if (code.toLowerCase().includes(operation.toLowerCase())) {
        results.passed.push(`✅ 实现${operation}操作`);
      } else {
        results.failed.push(`❌ 缺少${operation}操作`);
      }
    });

    // 检查分页
    if (code.includes('PagedResult') || code.includes('pagination')) {
      results.passed.push('✅ 实现分页功能');
    } else {
      results.failed.push('❌ 缺少分页功能');
    }

    // 检查搜索过滤
    if (code.includes('filter') || code.includes('search')) {
      results.passed.push('✅ 实现搜索过滤');
    } else {
      results.warnings.push('⚠️ 建议添加搜索功能');
    }

    // 检查排序
    if (code.includes('sort') || code.includes('order')) {
      results.passed.push('✅ 实现排序功能');
    } else {
      results.warnings.push('⚠️ 建议添加排序功能');
    }

    return results;
  }

  /**
   * 检查表单完整性
   */
  checkFormCompleteness(code) {
    const results = { passed: [], failed: [], warnings: [] };

    // 检查表单验证
    if (code.includes('rules') || code.includes('validate')) {
      results.passed.push('✅ 实现表单验证');
    } else {
      results.failed.push('❌ 缺少表单验证');
    }

    // 检查提交处理
    if (code.includes('submit') || code.includes('onSubmit')) {
      results.passed.push('✅ 实现表单提交');
    } else {
      results.failed.push('❌ 缺少表单提交处理');
    }

    // 检查重置功能
    if (code.includes('reset') || code.includes('clear')) {
      results.passed.push('✅ 实现表单重置');
    } else {
      results.warnings.push('⚠️ 建议添加表单重置功能');
    }

    // 检查加载状态
    if (code.includes('loading') || code.includes('submitting')) {
      results.passed.push('✅ 实现加载状态');
    } else {
      results.failed.push('❌ 缺少加载状态处理');
    }

    return results;
  }

  /**
   * 生成质量报告
   */
  generateQualityReport(checkResults) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalChecks: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      },
      details: checkResults,
      recommendations: []
    };

    // 统计结果
    checkResults.forEach(result => {
      report.summary.totalChecks += result.passed.length + result.failed.length + result.warnings.length;
      report.summary.passed += result.passed.length;
      report.summary.failed += result.failed.length;
      report.summary.warnings += result.warnings.length;
    });

    // 计算质量分数
    const totalItems = report.summary.passed + report.summary.failed;
    report.qualityScore = totalItems > 0 ? Math.round((report.summary.passed / totalItems) * 100) : 0;

    // 生成建议
    if (report.qualityScore < 60) {
      report.recommendations.push('🚨 代码质量较低，需要重构');
    } else if (report.qualityScore < 80) {
      report.recommendations.push('⚠️ 代码质量一般，建议优化');
    } else {
      report.recommendations.push('✅ 代码质量良好');
    }

    return report;
  }

  /**
   * 主检查方法
   */
  async checkCodeQuality(filePath, code, options = {}) {
    const fileExtension = path.extname(filePath).slice(1);
    const componentType = options.componentType || 'general';
    
    const results = [];

    // 设计模式检查
    const patternResults = this.checkDesignPatterns(code, fileExtension);
    results.push({
      category: '设计模式检查',
      ...patternResults
    });

    // 功能完整性检查
    const completenessResults = this.checkCompleteness(code, componentType);
    results.push({
      category: '功能完整性检查',
      ...completenessResults
    });

    // 生成报告
    const report = this.generateQualityReport(results);
    
    return report;
  }
}

module.exports = QualityGateChecker;