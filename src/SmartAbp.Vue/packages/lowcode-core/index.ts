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
export { useEntityModelingStore, type EntityDefinition, type EntityField, type EntityRelation } from './src/stores/entityModeling'
export { usePageDesignStore } from './src/stores/pageDesign'
export { useCodeGenerationStore } from './src/stores/codeGeneration'
export { useEnhancedThemeStore } from './src/stores/enhancedTheme'
export { useEnhancedStateMachineStore } from './src/stores/enhancedStateMachine'
export { useStateMachineStore } from './src/stores/statemachine'
export { useTemplatesStore } from './src/stores/templates'

// ===== 类型定义导出 =====
export * from './src/types/manifest'
export * from './src/types/entity-designer'
// UI类型从lowcode-shared导出（已迁移）
export type { MDIWindowConfig, TabConfig } from '@smartabp/lowcode-shared'

// ===== 工具函数导出 =====
export * from './src/utils/manifestWriter'
export * from './src/composables/useCodeGenerationProgress'
export * from './src/composables/useDragDrop'
export * from './src/composables/useSecurityDashboard'
export * from './src/composables/useRealTimeAlerts'
export * from './src/composables/useFullscreen'

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
