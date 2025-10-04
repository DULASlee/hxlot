/**
 * 安全审计模块导出
 */

// 数据结构
export type {
  VulnerabilityType,
  SeverityLevel,
  SecurityIssue,
  IssueLocation,
  RemediationSuggestion,
  ScanResult,
  SecurityIssueUtils
} from './SecurityIssue'

// 检测器
export type { SqlInjectionDetector } from './SqlInjectionDetector'
export type { XssDetector } from './XssDetector'

// 扫描引擎
export { VulnerabilityScannerEngine, type ScanConfig, type ScanProgressCallback } from './VulnerabilityScannerEngine'
