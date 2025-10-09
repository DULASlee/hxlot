/**
 * SmartAbp Quality Guardian - Core Type Definitions
 * 完整的TypeScript类型系统，支持企业级质量检查
 */

export interface QualityConfig {
  /** 项目根目录 */
  projectRoot: string;
  /** 工作模式：strict=严格模式，moderate=适中模式，lenient=宽松模式 */
  mode: 'strict' | 'moderate' | 'lenient';
  /** 是否为CI模式 */
  ciMode: boolean;
  /** 是否启用快速失败（遇到P0问题立即停止） */
  failFast: boolean;
  /** 是否生成报告 */
  generateReport: boolean;
  /** 报告输出目录 */
  reportDir: string;
  /** 要执行的检查器列表 */
  checkers: CheckerType[];
  /** 检查器配置 */
  checkerConfigs: Record<string, any>;
  /** 是否启用技术债务分析 */
  enableDebtAnalysis?: boolean;
  /** 技术债务分析配置 */
  debtAnalysisConfig?: {
    hourlyRate?: number;
    currency?: string;
    estimationRules?: {
      P0: number;
      P1: number;
      P2: number;
    };
  };
  /** 是否启用基线对比 */
  enableBaselineComparison?: boolean;
  /** 基线对比配置 */
  baselineConfig?: {
    baselineName?: string;
    autoSave?: boolean;
    storageDir?: string;
  };
}

export type CheckerType =
  | 'typescript'
  | 'architecture'
  | 'smartabp'
  | 'lowcode'
  | 'codegen'
  | 'performance'
  | 'security'
  | 'dependencies';

export type ViolationLevel = 'P0' | 'P1' | 'P2';

export interface Violation {
  /** 违规规则ID */
  rule: string;
  /** 违规级别 */
  level: ViolationLevel;
  /** 违规文件路径 */
  file?: string;
  /** 违规行号 */
  line?: number;
  /** 违规列号 */
  column?: number;
  /** 违规消息 */
  message: string;
  /** 代码片段 */
  snippet?: string;
  /** 修复建议 */
  suggestion?: string;
  /** 相关链接（文档、规范等） */
  links?: string[];
}

export interface CheckResult {
  /** 检查器名称 */
  checker: string;
  /** 是否通过检查 */
  passed: boolean;
  /** 执行时间（毫秒） */
  duration: number;
  /** 检查的文件数量 */
  filesChecked: number;
  /** 违规列表 */
  violations: Violation[];
  /** 检查器特定的详细信息 */
  details?: Record<string, any>;
  /** 错误信息（如果检查器异常） */
  error?: string;
}

export interface QualityScore {
  /** 总体评分 (0-100) */
  overall: number;
  /** 各维度评分 */
  dimensions: {
    /** 正确性（编译、类型安全）*/
    correctness: number;
    /** 安全性（漏洞、敏感信息）*/
    security: number;
    /** 可维护性（复杂度、重复度）*/
    maintainability: number;
    /** 架构合规性 */
    architecture: number;
    /** 代码风格 */
    style: number;
    /** 性能 */
    performance: number;
  };
  /** 评分计算详情 */
  breakdown: {
    /** 基础分 */
    baseScore: number;
    /** 各级别违规扣分 */
    deductions: Record<ViolationLevel, number>;
    /** 扣分明细 */
    deductionDetails: Array<{
      rule: string;
      level: ViolationLevel;
      count: number;
      points: number;
    }>;
  };
}

export interface QualityReport {
  /** 报告版本 */
  version: string;
  /** 生成时间戳 */
  timestamp: string;
  /** 项目信息 */
  project: {
    name: string;
    path: string;
    version?: string;
  };
  /** 配置信息 */
  config: QualityConfig;
  /** 质量门禁结果 */
  gate: {
    /** 是否通过门禁 */
    passed: boolean;
    /** 门禁模式 */
    mode: QualityConfig['mode'];
    /** 失败原因 */
    reason?: string;
  };
  /** 质量评分 */
  scores: QualityScore;
  /** 检查器结果 */
  checkers: Record<string, CheckResult>;
  /** 违规汇总 */
  violations: {
    P0: Violation[];
    P1: Violation[];
    P2: Violation[];
  };
  /** 技术债务统计（可选，需要手动启用） */
  technicalDebt?: TechnicalDebt;
  /** 基线对比结果（可选） */
  baselineComparison?: BaselineComparison;
  /** 统计信息 */
  statistics: {
    /** 总文件数 */
    totalFiles: number;
    /** 已检查文件数 */
    filesChecked: number;
    /** 总代码行数 */
    totalLines: number;
    /** 检查耗时（毫秒） */
    totalDuration: number;
  };
  /** 元数据 */
  metadata: {
    generatedBy: string;
    nodeVersion: string;
    platform: string;
    cwd: string;
  };
}

export interface CheckerPlugin {
  /** 检查器名称 */
  name: string;
  /** 检查器描述 */
  description: string;
  /** 检查器版本 */
  version: string;
  /** 是否启用 */
  enabled: boolean;
  /** 检查器配置schema（可选） */
  configSchema?: any;
  /** 执行检查 */
  check(config: QualityConfig): Promise<CheckResult>;
}

export interface ReportFormat {
  /** 格式名称 */
  name: 'json' | 'html' | 'markdown' | 'xml' | 'sarif';
  /** 文件扩展名 */
  extension: string;
  /** MIME类型 */
  mimeType?: string;
  /** 生成器函数 */
  generate(report: QualityReport): Promise<string>;
}

// === SmartAbp特定类型 ===

export interface SmartAbpProject {
  /** 是否为SmartAbp项目 */
  isSmartAbp: boolean;
  /** 项目类型 */
  type: 'web' | 'api' | 'fullstack';
  /** 前端框架信息 */
  frontend?: {
    framework: 'vue' | 'react' | 'angular';
    version: string;
    hasTypeScript: boolean;
    hasLowCode: boolean;
  };
  /** 后端框架信息 */
  backend?: {
    framework: 'abp' | 'aspnetcore';
    version: string;
    hasDdd: boolean;
  };
  /** 低代码引擎信息 */
  lowcode?: {
    enabled: boolean;
    packages: string[];
    components: number;
    generators: number;
  };
}

export interface ComponentRegistration {
  /** 组件名称 */
  name: string;
  /** 显示名称 */
  displayName: string;
  /** 分类 */
  category: string;
  /** 优先级 */
  priority: 'low' | 'medium' | 'high';
  /** 依赖项 */
  dependencies: string[];
  /** 包名 */
  bundle: string;
  /** 是否懒加载 */
  lazy: boolean;
  /** 是否预加载 */
  preload: boolean;
  /** 版本 */
  version: string;
  /** 标签 */
  tags: string[];
  /** 文件路径 */
  filePath?: string;
}

export interface ArchitectureViolation extends Violation {
  /** 违规类型 */
  violationType: 'relative-path' | 'main-app-reference' | 'reverse-dependency' | 'circular-dependency';
  /** 相关文件（用于循环依赖） */
  relatedFiles?: string[];
  /** 依赖链（用于循环依赖） */
  dependencyChain?: string[];
}

export interface PerformanceMetrics {
  /** 大文件统计 */
  largeFiles: Array<{
    file: string;
    lines: number;
    threshold: number;
  }>;
  /** 复杂函数统计 */
  complexFunctions: Array<{
    file: string;
    function: string;
    complexity: number;
    threshold: number;
  }>;
  /** Bundle大小分析 */
  bundleAnalysis?: {
    totalSize: number;
    chunks: Array<{
      name: string;
      size: number;
    }>;
  };
  /** TODO标记统计 */
  todoMarkers: Array<{
    file: string;
    line: number;
    type: 'TODO' | 'FIXME' | 'XXX' | 'HACK';
    content: string;
  }>;
}

export interface SecurityFindings {
  /** 敏感信息泄露 */
  sensitiveData: Array<{
    file: string;
    line: number;
    type: 'password' | 'api-key' | 'secret' | 'token';
    pattern: string;
  }>;
  /** 潜在SQL注入 */
  sqlInjection: Array<{
    file: string;
    line: number;
    pattern: string;
    confidence: 'low' | 'medium' | 'high';
  }>;
  /** 其他安全问题 */
  other: Array<{
    file: string;
    line: number;
    type: string;
    description: string;
    severity: 'info' | 'warning' | 'error';
  }>;
}

// === 工具函数类型 ===

export interface FilePatternMatcher {
  /** 匹配模式 */
  includes: string[];
  /** 排除模式 */
  excludes: string[];
  /** 匹配文件 */
  match(filePath: string): boolean;
}

export interface ProgressReporter {
  /** 开始进度 */
  start(total: number): void;
  /** 更新进度 */
  update(current: number, message?: string): void;
  /** 结束进度 */
  finish(message?: string): void;
}

// === 技术债务量化类型 ===

/**
 * 技术债务统计
 */
export interface TechnicalDebt {
  /** 总债务量（扣分） */
  totalDebt: number;
  /** 预估修复时间（小时） */
  estimatedHours: number;
  /** 预估修复成本（按小时工资计算） */
  estimatedCost: {
    hours: number;
    hourlyRate: number;
    totalCost: number;
    currency: string;
  };
  /** 按级别分类 */
  byLevel: {
    P0: DebtCategory;
    P1: DebtCategory;
    P2: DebtCategory;
  };
  /** 按检查器分类 */
  byChecker: Record<string, DebtCategory>;
  /** 按文件分类（Top 10） */
  byFile: Array<{
    file: string;
    debt: number;
    violations: number;
    estimatedHours: number;
  }>;
  /** 按规则分类（Top 20） */
  byRule: Array<{
    rule: string;
    count: number;
    debt: number;
    estimatedHours: number;
    avgTimePerFix: number;
  }>;
  /** 债务密度（每千行代码的债务量） */
  density: {
    debtPerKLOC: number;
    violationsPerKLOC: number;
    totalLinesOfCode: number;
  };
  /** 债务趋势（如果有历史数据） */
  trend?: {
    direction: 'improving' | 'stable' | 'worsening';
    changePercent: number;
    changeSinceLastCheck: number;
  };
}

/**
 * 债务分类统计
 */
export interface DebtCategory {
  /** 债务量（扣分） */
  debt: number;
  /** 违规数量 */
  count: number;
  /** 预估修复时间（小时） */
  estimatedHours: number;
  /** 占总债务的百分比 */
  percentage: number;
}

// === 性能基线对比类型 ===

/**
 * 质量基线
 */
export interface QualityBaseline {
  /** 基线ID */
  id: string;
  /** 基线名称（如：develop, main, release-v1.0） */
  name: string;
  /** 基线描述 */
  description?: string;
  /** 创建时间 */
  createdAt: string;
  /** Git提交哈希（可选） */
  gitCommit?: string;
  /** Git分支（可选） */
  gitBranch?: string;
  /** 基线数据 */
  data: QualityReport;
}

/**
 * 基线对比结果
 */
export interface BaselineComparison {
  /** 基线信息 */
  baseline: {
    id: string;
    name: string;
    createdAt: string;
  };
  /** 当前报告时间 */
  currentTimestamp: string;
  /** 总体对比 */
  overall: {
    /** 评分变化 */
    scoreChange: number;
    /** 评分变化百分比 */
    scoreChangePercent: number;
    /** 变化方向 */
    direction: 'improved' | 'stable' | 'degraded';
    /** 是否显著变化（变化超过阈值） */
    significant: boolean;
  };
  /** 违规数量对比 */
  violations: {
    P0: ComparisonMetric;
    P1: ComparisonMetric;
    P2: ComparisonMetric;
    total: ComparisonMetric;
  };
  /** 维度评分对比 */
  dimensions: {
    correctness: ComparisonMetric;
    security: ComparisonMetric;
    maintainability: ComparisonMetric;
    architecture: ComparisonMetric;
    style: ComparisonMetric;
    performance: ComparisonMetric;
  };
  /** 技术债务对比 */
  technicalDebt: {
    totalDebt: ComparisonMetric;
    estimatedHours: ComparisonMetric;
    density: ComparisonMetric;
  };
  /** 新增问题 */
  newIssues: Violation[];
  /** 已修复问题 */
  fixedIssues: Violation[];
  /** 持续存在的问题 */
  persistentIssues: Violation[];
  /** 文件变化统计 */
  fileChanges: {
    added: number;
    modified: number;
    deleted: number;
    totalFiles: number;
  };
  /** 改进建议 */
  recommendations: string[];
}

/**
 * 对比指标
 */
export interface ComparisonMetric {
  /** 基线值 */
  baseline: number;
  /** 当前值 */
  current: number;
  /** 变化量（current - baseline） */
  change: number;
  /** 变化百分比 */
  changePercent: number;
  /** 变化方向 */
  direction: 'improved' | 'stable' | 'degraded';
}

/**
 * 质量趋势（多个基线的历史数据）
 */
export interface QualityTrend {
  /** 时间序列数据点 */
  dataPoints: Array<{
    timestamp: string;
    score: number;
    violations: {
      P0: number;
      P1: number;
      P2: number;
    };
    technicalDebt: number;
    filesChecked: number;
    gitCommit?: string;
  }>;
  /** 趋势分析 */
  analysis: {
    /** 整体趋势 */
    overallTrend: 'improving' | 'stable' | 'declining';
    /** 平均评分 */
    averageScore: number;
    /** 最高评分 */
    highestScore: number;
    /** 最低评分 */
    lowestScore: number;
    /** 标准差 */
    standardDeviation: number;
    /** 预测下次评分（基于趋势） */
    predictedNextScore?: number;
  };
  /** 可视化数据（用于图表） */
  chartData: {
    labels: string[];
    scores: number[];
    p0Counts: number[];
    p1Counts: number[];
    p2Counts: number[];
    debtValues: number[];
  };
}

/**
 * 基线管理器配置
 */
export interface BaselineManagerConfig {
  /** 基线存储目录 */
  storageDir: string;
  /** 默认基线名称 */
  defaultBaselineName?: string;
  /** 是否自动保存基线 */
  autoSave?: boolean;
  /** 保留的历史基线数量（0表示保留全部） */
  maxHistoryCount?: number;
  /** 显著变化阈值（百分比） */
  significantChangeThreshold?: number;
}

// === 导出所有类型 ===
// fs-extra types are already available via node_modules/@types/fs-extra
