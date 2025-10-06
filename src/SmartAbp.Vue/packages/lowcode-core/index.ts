// 🏗️ SmartAbp 低代码引擎核心模块 - 企业级架构
// 统一状态管理、错误边界、事件总线、布局系统

// ===== 核心接口导出 =====
export interface LowCodeEngine {
  version: string
  initialize(): Promise<void>
  destroy(): void
}

export interface LowCodePlugin {
  name: string
  version: string
  install(engine: LowCodeEngine): void
}

// ===== 核心组件导出 =====
export { default as ErrorBoundary } from './src/components/ErrorBoundary.vue'
export { default as WorkspaceContainer } from './src/components/WorkspaceContainer.vue'
export { default as GlobalLoadingOverlay } from './src/components/GlobalLoadingOverlay.vue'

// ===== 核心Store导出 =====
export { useWorkspaceStore } from './src/stores/workspace'
export { useEntityModelingStore } from './src/stores/entityModeling'
export { usePageDesignStore } from './src/stores/pageDesign'
export { useCodeGenerationStore } from './src/stores/codeGeneration'
export { useEnhancedThemeStore } from './src/stores/enhancedTheme'
export { useEnhancedStateMachineStore } from './src/stores/enhancedStateMachine'
export { useStateMachineStore } from './src/stores/statemachine'
export { useTemplatesStore } from './src/stores/templates'

// ===== 类型定义导出 =====
export * from './src/types/manifest'
export * from './src/types/entity-designer'
// Entity Modeling类型单独导出
export type { EntityDefinition, EntityField, EntityRelation } from './src/stores/entityModeling'
// UI类型从lowcode-shared导出（已迁移）
export type { MDIWindowConfig, TabConfig } from '@smartabp/lowcode-shared'

// ===== 工具函数导出 =====
export * from './src/utils/manifestWriter'
export * from './src/composables/useCodeGenerationProgress'
export * from './src/composables/useDragDrop'
export * from './src/composables/useSecurityDashboard'
export * from './src/composables/useRealTimeAlerts'
export * from './src/composables/useFullscreen'

// ===== 代码生成器导出 =====
export { CqrsCodeGenerator } from './src/generators/CqrsCodeGenerator'
export type { CqrsCommandConfig, CqrsQueryConfig } from './src/generators/CqrsCodeGenerator'

export { DddCodeGenerator } from './src/generators/DddCodeGenerator'
export type { EntityConfig, PropertyConfig, MethodConfig } from './src/generators/DddCodeGenerator'

export { DddDomainEventGenerator } from './src/generators/DddDomainEventGenerator'
export type { DomainEventConfig, EventHandlerConfig } from './src/generators/DddDomainEventGenerator'

export { MicroserviceGenerator } from './src/generators/MicroserviceGenerator'
export type { MicroserviceConfig } from './src/generators/MicroserviceGenerator'

export { BusinessRuleCodeGenerator } from './src/generators/BusinessRuleCodeGenerator'
export { RelationshipUIGenerator } from './src/generators/RelationshipUIGenerator'
export { WorkflowCodeGenerator } from './src/generators/WorkflowCodeGenerator'

// ===== 引擎导出 =====
export { RuleExecutionEngine } from './src/engines/ruleExecutionEngine'
export type { BusinessRule, RuleCondition } from './src/engines/ruleExecutionEngine'

export { WorkflowEngine } from './src/engines/WorkflowEngine'
export type { WorkflowDefinition, WorkflowNode, WorkflowTransition } from './src/engines/WorkflowEngine'

export { IntelligentRecommendationEngine } from './src/engines/IntelligentRecommendationEngine'
export { ActionExecutor, ActionExecutorRegistry } from './src/engines/actionExecutor'
export type { IActionExecutor, ActionExecutorContext, RuleContext } from './src/engines/actionExecutor'

// ===== 安全工具导出 =====
export { VulnerabilityScannerEngine } from './src/security/VulnerabilityScannerEngine'
export { SqlInjectionDetector } from './src/security/SqlInjectionDetector'
export { XssDetector } from './src/security/XssDetector'
export type { SecurityIssue, SecurityScanResult } from './src/security/SecurityIssue'

// ===== 测试工具导出（可选，按需使用） =====
export { LoadTestEngine } from './src/testing/LoadTestEngine'
export { PerformanceBaseline } from './src/testing/PerformanceBaseline'
export { BenchmarkEngine } from './src/testing/BenchmarkEngine'
export type { LoadTestScenario } from './src/testing/LoadTestScenario'

// ===== 核心引擎工厂 =====
export const createLowCodeEngine = (): LowCodeEngine => {
  return {
    version: "2.0.0",
    async initialize() {
      console.log("🚀 SmartAbp LowCode Engine v2.0 - 企业级架构已初始化")
    },
    destroy() {
      console.log("🛡️ SmartAbp LowCode Engine - 资源已安全清理")
    },
  }
}

export default createLowCodeEngine
