/**
 * SmartAbp Quality Guardian - 主导出文件
 * 企业级代码质量保障工具
 */

// 核心类
export { QualityGuardian } from './core/quality-guardian.js';

// 检查器
export { ArchitectureChecker } from './checkers/architecture-checker.js';
export { BaseChecker, FilePatternMatcher, RuleBasedChecker } from './checkers/base-checker.js';
export type { CheckRule } from './checkers/base-checker.js';
export { CodeGenChecker } from './checkers/codegen-checker.js';
export { DependencyChecker } from './checkers/dependency-checker.js';
export { LowCodeChecker } from './checkers/lowcode-checker.js';
export { PerformanceChecker } from './checkers/performance-checker.js';
export { SecurityChecker } from './checkers/security-checker.js';
export { SmartAbpChecker } from './checkers/smartabp-checker.js';
export { SmartAbpProductionChecker } from './checkers/smartabp-production-checker.js';
export { TypeScriptChecker } from './checkers/typescript-checker.js';

// 工具类
export { BaselineManager } from './utils/baseline-manager.js';
export { EnvironmentChecker } from './utils/environment-checker.js';
export { ScoreCalculator } from './utils/score-calculator.js';
export { TechnicalDebtAnalyzer } from './utils/technical-debt-analyzer.js';
export type { DebtAnalyzerConfig } from './utils/technical-debt-analyzer.js';

// 报告生成器
export { ReportGenerator } from './reporters/report-generator.js';

// 类型定义
export type {
    ArchitectureViolation, CheckerPlugin, CheckerType, CheckResult, ComponentRegistration, FilePatternMatcher as IFilePatternMatcher, PerformanceMetrics, ProgressReporter, QualityConfig,
    QualityReport,
    QualityScore, ReportFormat, SecurityFindings, SmartAbpProject, Violation,
    ViolationLevel
} from './types/index.js';

