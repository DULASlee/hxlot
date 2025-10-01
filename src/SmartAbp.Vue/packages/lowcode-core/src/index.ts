/**
 * SmartAbp LowCode Core Package
 * 低代码引擎核心包 - 统一导出
 * 包含奔驰级系统稳定性工程组件
 */

// 核心引擎导出 (保持现有导出)
export * from './engines/ZeroConfigGenerationEngine'
export * from './generators/RelationshipTemplateSelector'
export * from './analyzers/SimpleRelationshipDetector'
export * from './types'

// 🔥 新增：奔驰级监控系统导出
export * from './monitoring'

// 🔥 新增：Stores导出（修复lowcode-designer导入错误）
export { useEntityModelingStore } from './stores/entityModeling'
export { usePageDesignStore } from './stores/pageDesign'
export { useEnhancedThemeStore } from './stores/enhancedTheme'
export { useWorkspaceStore } from './stores/workspace'
export { useCodeGenerationStore } from './stores/codeGeneration'
export { useTemplatesStore } from './stores/templates'

// 默认导出
import { ZeroConfigGenerationEngine } from './engines/ZeroConfigGenerationEngine'
import { RelationshipTemplateSelector } from './generators/RelationshipTemplateSelector'
import { SimpleRelationshipDetector } from './analyzers/SimpleRelationshipDetector'
import { performanceMonitor } from './monitoring'

export default {
  // 核心引擎
  ZeroConfigGenerationEngine,
  RelationshipTemplateSelector,
  SimpleRelationshipDetector,
  
  // 监控系统
  performanceMonitor
}