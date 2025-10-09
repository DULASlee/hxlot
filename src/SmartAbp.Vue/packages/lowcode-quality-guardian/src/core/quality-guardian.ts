/**
 * SmartAbp Quality Guardian - 质量门禁核心系统
 * 企业级质量门禁，支持P0/P1/P2三级质量标准
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { performance } from 'perf_hooks';
import {
  DEFAULT_CONFIG,
} from '../config/default-config.js';

import type {
  CheckerPlugin,
  QualityConfig,
  QualityReport,
  QualityScore,
  Violation
} from '../types/index.js';

import { ReportGenerator } from '../reporters/report-generator.js';
import { BaselineManager } from '../utils/baseline-manager.js';
import { EnvironmentChecker } from '../utils/environment-checker.js';
import { MemoryManager } from '../utils/memory-manager.js';
import { PerformanceMonitor } from '../utils/performance-config.js';
import { ScoreCalculator } from '../utils/score-calculator.js';
import { TechnicalDebtAnalyzer } from '../utils/technical-debt-analyzer.js';
import { ParallelExecutor } from './parallel-executor.js';

// 导入所有检查器
import { ArchitectureChecker } from '../checkers/architecture-checker.js';
import { ArchitectureDefectChecker } from '../checkers/architecture-defect-checker.js';
import { CodeDefectChecker } from '../checkers/code-defect-checker.js';
import { CodeSmellChecker } from '../checkers/code-smell-checker.js';
import { CodeGenChecker } from '../checkers/codegen-checker.js';
import { DependencyChecker } from '../checkers/dependency-checker.js';
import { LowCodeChecker } from '../checkers/lowcode-checker.js';
import { LowCodePlatformChecker } from '../checkers/lowcode-platform-checker.js';
import { MemoryPerformanceChecker } from '../checkers/memory-performance-checker.js';
import { PerformanceChecker } from '../checkers/performance-checker.js';
import { SecurityChecker } from '../checkers/security-checker.js';
import { SmartAbpArchitectureChecker } from '../checkers/smartabp-architecture-checker.js';
import { SmartAbpChecker } from '../checkers/smartabp-checker.js';
import { SmartAbpProductionChecker } from '../checkers/smartabp-production-checker.js';
import { TypeScriptChecker } from '../checkers/typescript-checker.js';

export class QualityGuardian {
  private config: QualityConfig;
  private checkers: Map<string, CheckerPlugin> = new Map();
  private results: QualityReport;
  private startTime: number = 0;
  private performanceMonitor: PerformanceMonitor;
  private memoryManager: MemoryManager;

  constructor(config: Partial<QualityConfig> = {}) {
    const externalConfig = this.loadExternalConfig(config);
    const mergedConfig = { ...DEFAULT_CONFIG, ...config, ...externalConfig };
    this.config = this.mergeDefaultConfig(mergedConfig);

    this.results = this.initializeResults();
    this.performanceMonitor = new PerformanceMonitor();
    this.memoryManager = new MemoryManager(this.config.performance?.maxMemoryMB);
    this.registerBuiltinCheckers();
  }

  /**
   * 执行完整的质量检查流程
   */
  async run(): Promise<QualityReport> {
    this.startTime = performance.now();
    this.performanceMonitor.start();

    try {
      this.printHeader();

      // 阶段0: 环境检查
      this.performanceMonitor.checkpoint('环境检查');
      await this.checkEnvironment();

      // 阶段1: 执行所有检查器
      this.performanceMonitor.checkpoint('检查器执行');
      await this.runAllCheckers();

      // 阶段2: 计算质量评分
      this.performanceMonitor.checkpoint('评分计算');
      this.calculateScores();

      // 阶段2.5: 技术债务分析（可选）
      if (this.config.enableDebtAnalysis) {
        this.performanceMonitor.checkpoint('债务分析');
        await this.analyzeTechnicalDebt();
      }

      // 阶段2.6: 基线对比（可选）
      if (this.config.enableBaselineComparison) {
        this.performanceMonitor.checkpoint('基线对比');
        await this.compareWithBaseline();
      }

      // 阶段3: 生成报告
      if (this.config.generateReport) {
        this.performanceMonitor.checkpoint('报告生成');
        await this.generateReports();
      }

      // 阶段4: 质量门禁判定
      this.evaluateQualityGate();

      // 阶段5: 打印结果
      this.printResults();

      return this.results;

    } catch (error) {
      console.error(chalk.red('\n💥 质量检查异常:'), error instanceof Error ? error.message : String(error));

      if (this.config.ciMode) {
        process.exit(1);
      }

      throw error;
    } finally {
      const duration = performance.now() - this.startTime;
      this.results.statistics.totalDuration = Math.round(duration);
      this.memoryManager.cleanup();
    }
  }

  /**
   * 注册自定义检查器插件
   */
  registerChecker(checker: CheckerPlugin): void {
    this.checkers.set(checker.name, checker);
  }

  /**
   * 获取质量评分
   */
  getQualityScore(): QualityScore {
    return this.results.scores;
  }

  /**
   * 获取完整报告
   */
  getReport(): QualityReport {
    return this.results;
  }

  // ========== 私有方法 ==========

  private loadExternalConfig(config: Partial<QualityConfig>): Partial<QualityConfig> {
    const configFile = config.configFile || 'quality-guardian.config.json';
    const configPath = path.resolve(config.projectRoot || process.cwd(), configFile);

    if (fs.existsSync(configPath)) {
      try {
        console.log(chalk.blue(`  ℹ️  使用配置文件: ${configFile}`));
        const configContent = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(configContent);
      } catch (error) {
        console.warn(chalk.yellow(`  ⚠️  无法读取或解析配置文件: ${configPath}`));
        return {};
      }
    }
    return {};
  }

  private mergeDefaultConfig(userConfig: Partial<QualityConfig>): QualityConfig {
    const defaultConfig: QualityConfig = {
      projectRoot: process.cwd(),
      mode: 'strict',
      ciMode: false,
      failFast: true,
      generateReport: true,
      reportDir: path.join(process.cwd(), 'reports', 'quality'),
      checkers: ['typescript', 'architecture', 'smartabp', 'lowcode', 'codegen', 'performance', 'security'],
      checkerConfigs: {}
    };

    return { ...defaultConfig, ...userConfig };
  }

  private initializeResults(): QualityReport {
    return {
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      project: {
        name: 'SmartAbp',
        path: this.config.projectRoot,
        version: this.getProjectVersion()
      },
      config: this.config,
      gate: {
        passed: false,
        mode: this.config.mode
      },
      scores: {
        overall: 0,
        dimensions: {
          correctness: 0,
          security: 0,
          maintainability: 0,
          architecture: 0,
          style: 0,
          performance: 0
        },
        breakdown: {
          baseScore: 100,
          deductions: { P0: 0, P1: 0, P2: 0 },
          deductionDetails: []
        }
      },
      checkers: {},
      violations: {
        P0: [],
        P1: [],
        P2: []
      },
      statistics: {
        totalFiles: 0,
        filesChecked: 0,
        totalLines: 0,
        totalDuration: 0
      },
      metadata: {
        generatedBy: '@smartabp/lowcode-quality-guardian v2.0.0',
        nodeVersion: process.version,
        platform: process.platform,
        cwd: process.cwd()
      }
    };
  }

  private registerBuiltinCheckers(): void {
    // 注册内置检查器
    this.checkers.set('typescript', new TypeScriptChecker());
    this.checkers.set('architecture', new ArchitectureChecker());
    this.checkers.set('smartabp', new SmartAbpChecker());
    this.checkers.set('smartabp-production', new SmartAbpProductionChecker());
    this.checkers.set('smartabp-architecture', new SmartAbpArchitectureChecker());
    this.checkers.set('lowcode', new LowCodeChecker());
    this.checkers.set('lowcode-platform', new LowCodePlatformChecker());
    this.checkers.set('code-smell', new CodeSmellChecker());
    this.checkers.set('memory-performance', new MemoryPerformanceChecker());
    this.checkers.set('architecture-defect', new ArchitectureDefectChecker());
    this.checkers.set('code-defect', new CodeDefectChecker());
    this.checkers.set('codegen', new CodeGenChecker());
    this.checkers.set('performance', new PerformanceChecker());
    this.checkers.set('security', new SecurityChecker());
    this.checkers.set('dependencies', new DependencyChecker());
  }

  private printHeader(): void {
    console.log(chalk.blue.bold('\\n🛡️  SmartAbp Quality Guardian v2.0 - 企业级质量门禁\\n'));
    console.log(chalk.gray('='.repeat(80)));
    console.log(chalk.gray(`项目: ${this.results.project.name}`));
    console.log(chalk.gray(`路径: ${this.results.project.path}`));
    console.log(chalk.gray(`模式: ${this.config.mode}模式`));
    console.log(chalk.gray(`CI模式: ${this.config.ciMode ? '是' : '否'}`));
    console.log(chalk.gray(`检查器: ${this.config.checkers.join(', ')}`));
    console.log(chalk.gray('='.repeat(80)));
    console.log('');
  }

  private async checkEnvironment(): Promise<void> {
    console.log(chalk.cyan('📋 阶段0: 环境依赖检查'));

    const envChecker = new EnvironmentChecker();
    const envResult = await envChecker.check();

    if (!envResult.passed) {
      throw new Error('环境检查失败，请安装缺失的依赖');
    }

    console.log(chalk.green('     ✅ 环境检查通过'));
  }

  private async runAllCheckers(): Promise<void> {
    const enableParallel = this.config.performance?.enableParallel !== false;

    if (enableParallel) {
      console.log(chalk.cyan('\\n📋 阶段1: 执行质量检查 (🚀 并发模式)'));
    } else {
      console.log(chalk.cyan('\\n📋 阶段1: 执行质量检查'));
    }
    console.log('');

    if (enableParallel) {
      // 并发执行
      const batchSize = this.config.performance?.parallelBatchSize || 5;
      const results = await ParallelExecutor.executeBatches(
        this.checkers,
        this.config.checkers,
        this.config,
        batchSize
      );

      // 处理结果
      let hasP0 = false;
      results.forEach(({ type, result, duration, success, error }) => {
        this.results.checkers[type] = { ...result, duration };

        if (success) {
          this.mergeViolations(result.violations);
          this.results.statistics.filesChecked += result.filesChecked;

          if (result.passed) {
            console.log(chalk.green(`  ✅ ${result.checker} (${duration}ms, ${result.filesChecked}文件)`));
          } else {
            const p0 = result.violations.filter(v => v.level === 'P0').length;
            const p1 = result.violations.filter(v => v.level === 'P1').length;
            const p2 = result.violations.filter(v => v.level === 'P2').length;
            console.log(chalk.red(`  ❌ ${result.checker} (${duration}ms, P0:${p0} P1:${p1} P2:${p2})`));
            if (p0 > 0) hasP0 = true;
          }
        } else {
          console.log(chalk.red(`  ❌ ${result.checker} 异常: ${error}`));
        }
      });

      if (this.config.failFast && hasP0) {
        throw new Error('发现P0问题');
      }
    } else {
      // 串行执行（保留原逻辑）
      let checkIndex = 1;
      for (const checkerType of this.config.checkers) {
        const checker = this.checkers.get(checkerType);
        if (!checker || !checker.enabled) {
          console.log(chalk.gray(`     ⏭️  跳过 ${checkerType}`));
          continue;
        }

        console.log(chalk.blue(`  🔍 检查器 ${checkIndex++}: ${checker.name}`));
        const checkStartTime = performance.now();

        try {
          const result = await checker.check(this.config);
          const duration = Math.round(performance.now() - checkStartTime);
          this.results.checkers[checkerType] = { ...result, duration };
          this.mergeViolations(result.violations);
          this.results.statistics.filesChecked += result.filesChecked;

          if (result.passed) {
            console.log(chalk.green(`     ✅ 通过 (${duration}ms, ${result.filesChecked} 文件)`));
          } else {
            const p0Count = result.violations.filter(v => v.level === 'P0').length;
            const p1Count = result.violations.filter(v => v.level === 'P1').length;
            const p2Count = result.violations.filter(v => v.level === 'P2').length;
            console.log(chalk.red(`     ❌ 失败 (${duration}ms, P0:${p0Count} P1:${p1Count} P2:${p2Count})`));
            if (this.config.failFast && p0Count > 0) {
              throw new Error(`${checker.name} 检查器发现P0问题，停止后续检查`);
            }
          }
        } catch (error) {
          const duration = Math.round(performance.now() - checkStartTime);
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.log(chalk.red(`     💥 异常 (${duration}ms): ${errorMessage}`));
          this.results.checkers[checkerType] = {
            checker: checker.name,
            passed: false,
            duration,
            filesChecked: 0,
            violations: [],
            error: errorMessage
          };
          if (this.config.failFast) {
            throw error;
          }
        }
      }
    }
  }

  private mergeViolations(violations: Violation[]): void {
    violations.forEach(violation => {
      this.results.violations[violation.level].push(violation);
    });
  }

  private calculateScores(): void {
    console.log(chalk.cyan('\\n📋 阶段2: 计算质量评分'));

    const calculator = new ScoreCalculator();
    this.results.scores = calculator.calculate(this.results.violations);

    console.log(chalk.cyan(`     📊 综合评分: ${this.results.scores.overall}/100`));
  }

  private async generateReports(): Promise<void> {
    console.log(chalk.cyan('\\n📋 阶段3: 生成质量报告'));

    const generator = new ReportGenerator(this.config.reportDir);
    const reportFiles = await generator.generate(this.results, ['json', 'html', 'markdown']);

    reportFiles.forEach(file => {
      console.log(chalk.green(`     📄 ${path.basename(file)}`));
    });
  }

  private evaluateQualityGate(): void {
    const p0Count = this.results.violations.P0.length;
    const p1Count = this.results.violations.P1.length;
    const totalScore = this.results.scores.overall;

    let passed = false;
    let reason = '';

    switch (this.config.mode) {
      case 'strict':
        passed = p0Count === 0 && p1Count === 0;
        reason = passed ? '' : '严格模式要求P0和P1零违规';
        break;

      case 'moderate':
        passed = p0Count === 0;
        reason = passed ? '' : '适中模式要求P0零违规';
        break;

      case 'lenient':
        passed = totalScore >= 85;
        reason = passed ? '' : `宽松模式要求评分≥85分（当前${totalScore}分）`;
        break;
    }

    this.results.gate.passed = passed;
    this.results.gate.reason = reason;
  }

  private printResults(): void {
    console.log('');
    console.log(chalk.gray('='.repeat(80)));
    console.log(chalk.blue.bold('\\n📊 质量检查结果汇总'));
    console.log('');

    // 违规统计
    const p0Count = this.results.violations.P0.length;
    const p1Count = this.results.violations.P1.length;
    const p2Count = this.results.violations.P2.length;
    const totalCount = p0Count + p1Count + p2Count;

    console.log(chalk.white('  📋 违规统计:'));

    if (p0Count === 0) {
      console.log(chalk.green(`    ✅ P0 阻断性问题: 0个`));
    } else {
      console.log(chalk.red.bold(`    ❌ P0 阻断性问题: ${p0Count}个`));
    }

    if (p1Count === 0) {
      console.log(chalk.green(`    ✅ P1 严重问题: 0个`));
    } else {
      console.log(chalk.yellow(`    ⚠️  P1 严重问题: ${p1Count}个`));
    }

    if (p2Count <= 10) {
      console.log(chalk.green(`    ✅ P2 一般问题: ${p2Count}个`));
    } else {
      console.log(chalk.yellow(`    ⚠️  P2 一般问题: ${p2Count}个`));
    }

    console.log(chalk.gray(`\\n    总违规数: ${totalCount}个`));

    // 质量评分
    console.log(chalk.white('\\n  🎯 质量评分:'));
    console.log(chalk.cyan(`    综合评分: ${this.results.scores.overall}/100`));

    Object.entries(this.results.scores.dimensions).forEach(([dim, score]) => {
      const icon = score >= 90 ? '✅' : score >= 80 ? '⚠️' : '❌';
      console.log(chalk.gray(`    ${this.getDimensionName(dim)}: ${icon} ${score}/100`));
    });

    // 统计信息
    console.log(chalk.white('\\n  📈 统计信息:'));
    console.log(chalk.gray(`    检查文件: ${this.results.statistics.filesChecked}个`));
    console.log(chalk.gray(`    检查耗时: ${this.results.statistics.totalDuration}ms`));

    // 质量门禁结果
    console.log('');
    console.log(chalk.gray('='.repeat(80)));
    console.log(chalk.blue.bold('\\n🚦 质量门禁判定'));
    console.log('');

    if (this.results.gate.passed) {
      console.log(chalk.green.bold('  ✅ 质量门禁通过！'));
      console.log(chalk.green('\\n  🎉 代码质量达到企业级标准，可以提交！\\n'));

      if (this.config.ciMode) {
        process.exit(0);
      }
    } else {
      console.log(chalk.red.bold('  ❌ 质量门禁失败！'));
      console.log(chalk.red(`\\n  💡 原因: ${this.results.gate.reason}`));
      console.log(chalk.yellow('\\n  📋 请修复所有问题后重新提交。\\n'));

      // 显示修复建议
      this.printFixSuggestions();

      if (this.config.ciMode) {
        process.exit(1);
      }
    }
  }

  private printFixSuggestions(): void {
    const p0Violations = this.results.violations.P0;

    if (p0Violations.length > 0) {
      console.log(chalk.yellow('  🔧 优先修复建议:'));

      // 按规则分组
      const grouped = this.groupViolationsByRule(p0Violations);

      Object.entries(grouped)
        .sort(([, a], [, b]) => b.length - a.length)
        .slice(0, 5)
        .forEach(([rule, violations]) => {
          console.log(chalk.yellow(`     • ${rule}: ${violations.length}处违规`));

          // 显示第一个具体位置
          const first = violations[0];
          if (first && first.file) {
            console.log(chalk.gray(`       → ${first.file}:${first.line || '?'}`));
          }
        });

      console.log('');
    }
  }

  private groupViolationsByRule(violations: Violation[]): Record<string, Violation[]> {
    const grouped: Record<string, Violation[]> = {};

    violations.forEach(violation => {
      const rule = violation.rule || 'unknown';
      if (!grouped[rule]) {
        grouped[rule] = [];
      }
      grouped[rule].push(violation);
    });

    return grouped;
  }

  private getDimensionName(dim: string): string {
    const names: Record<string, string> = {
      correctness: '正确性',
      security: '安全性',
      maintainability: '可维护性',
      architecture: '架构合规',
      style: '代码风格',
      performance: '性能'
    };

    return names[dim] || dim;
  }

  private getProjectVersion(): string | undefined {
    try {
      const packageJsonPath = path.join(this.config.projectRoot, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = fs.readJsonSync(packageJsonPath);
        return packageJson.version;
      }
    } catch (error) {
      // 忽略错误
    }

    return undefined;
  }

  /**
   * 技术债务分析
   */
  private async analyzeTechnicalDebt(): Promise<void> {
    console.log(chalk.cyan('\n📊 技术债务量化分析'));

    const debtAnalyzer = new TechnicalDebtAnalyzer(
      this.config.debtAnalysisConfig || {}
    );

    const technicalDebt = debtAnalyzer.analyze(this.results);
    this.results.technicalDebt = technicalDebt;

    // 打印债务摘要
    console.log('');
    console.log(chalk.yellow(`     💰 总债务: ${technicalDebt.totalDebt}分`));
    console.log(chalk.yellow(`     ⏱️  修复时间: ${technicalDebt.estimatedHours.toFixed(2)}小时`));
    console.log(chalk.yellow(`     💵 修复成本: ${technicalDebt.estimatedCost.currency} ${technicalDebt.estimatedCost.totalCost.toFixed(0)}元`));
    console.log(chalk.yellow(`     📉 债务密度: ${technicalDebt.density.debtPerKLOC.toFixed(2)}分/千行`));

    // 打印债务分布
    console.log('');
    console.log(chalk.gray('     债务分布:'));
    console.log(chalk.red(`       P0: ${technicalDebt.byLevel.P0.debt}分 (${technicalDebt.byLevel.P0.percentage.toFixed(1)}%)`));
    console.log(chalk.yellow(`       P1: ${technicalDebt.byLevel.P1.debt}分 (${technicalDebt.byLevel.P1.percentage.toFixed(1)}%)`));
    console.log(chalk.gray(`       P2: ${technicalDebt.byLevel.P2.debt}分 (${technicalDebt.byLevel.P2.percentage.toFixed(1)}%)`));

    // 打印Top 5债务文件
    if (technicalDebt.byFile.length > 0) {
      console.log('');
      console.log(chalk.gray('     债务最高的文件 (Top 5):'));
      technicalDebt.byFile.slice(0, 5).forEach((file, index) => {
        console.log(chalk.gray(`       ${index + 1}. ${file.file}`));
        console.log(chalk.gray(`          债务: ${file.debt}分, 违规: ${file.violations}个, 修复: ${file.estimatedHours.toFixed(1)}h`));
      });
    }

    console.log(chalk.green('\n     ✅ 技术债务分析完成'));
  }

  /**
   * 基线对比
   */
  private async compareWithBaseline(): Promise<void> {
    console.log(chalk.cyan('\n📈 基线对比分析'));

    const storageDir = this.config.baselineConfig?.storageDir ||
      path.join(this.config.reportDir, '.baselines');

    const baselineManager = new BaselineManager({
      storageDir,
      autoSave: this.config.baselineConfig?.autoSave ?? true,
      defaultBaselineName: this.config.baselineConfig?.baselineName || 'main',
    });

    // 保存当前报告为新基线
    if (this.config.baselineConfig?.autoSave) {
      await baselineManager.saveBaseline(this.results, {
        name: this.config.baselineConfig?.baselineName,
        description: `Quality report at ${new Date().toLocaleString('zh-CN')}`,
        setAsDefault: true,
      });
      console.log(chalk.green('     ✅ 当前报告已保存为基线'));
    }

    // 对比历史基线
    const baselineName = this.config.baselineConfig?.baselineName || 'main';
    const baselines = await baselineManager.listBaselines(baselineName);

    if (baselines.length >= 2) {
      // 与上一次基线对比
      const previousBaseline = baselines[1]; // 第二个是上一次（第一个是刚保存的）

      if (previousBaseline) {
        const comparison = await baselineManager.compare(
          this.results,
          previousBaseline.id
        );

        if (comparison) {
          this.results.baselineComparison = comparison;

          // 打印对比结果
          console.log('');
          console.log(chalk.gray(`     基线: ${previousBaseline.name} (${new Date(previousBaseline.createdAt).toLocaleString('zh-CN')})`));
          console.log('');

          const overall = comparison.overall;
          if (overall.direction === 'improved') {
            console.log(chalk.green(`     📈 质量评分: ${overall.scoreChange > 0 ? '+' : ''}${overall.scoreChange.toFixed(1)} (${overall.scoreChangePercent.toFixed(1)}%) ✨ 改进`));
          } else if (overall.direction === 'degraded') {
            console.log(chalk.red(`     📉 质量评分: ${overall.scoreChange.toFixed(1)} (${overall.scoreChangePercent.toFixed(1)}%) ⚠️ 下降`));
          } else {
            console.log(chalk.gray(`     ➡️  质量评分: ${overall.scoreChange.toFixed(1)} (${overall.scoreChangePercent.toFixed(1)}%) 稳定`));
          }

          // 打印违规变化
          console.log('');
          console.log(chalk.gray('     违规变化:'));
          console.log(chalk.red(`       P0: ${comparison.violations.P0.change > 0 ? '+' : ''}${comparison.violations.P0.change}`));
          console.log(chalk.yellow(`       P1: ${comparison.violations.P1.change > 0 ? '+' : ''}${comparison.violations.P1.change}`));
          console.log(chalk.gray(`       P2: ${comparison.violations.P2.change > 0 ? '+' : ''}${comparison.violations.P2.change}`));

          // 打印改进建议
          if (comparison.recommendations.length > 0) {
            console.log('');
            console.log(chalk.gray('     改进建议:'));
            comparison.recommendations.slice(0, 3).forEach((rec) => {
              console.log(chalk.gray(`       • ${rec}`));
            });
          }

          console.log(chalk.green('\n     ✅ 基线对比完成'));
        }
      }
    } else {
      console.log(chalk.gray('     ℹ️  基线数据不足，需要至少2个基线进行对比'));
    }
  }
}
