/**
 * 安全审计模块导出
 */

// 数据结构
export {
  VulnerabilityType,
  SeverityLevel,
  SecurityIssue,
  IssueLocation,
  RemediationSuggestion,
  ScanResult,
  SecurityIssueUtils
} from './SecurityIssue'

// 检测器
export { SqlInjectionDetector } from './SqlInjectionDetector'
export { XssDetector } from './XssDetector'

// 扫描引擎
export { VulnerabilityScannerEngine, type ScanConfig, type ScanProgressCallback } from './VulnerabilityScannerEngine'
