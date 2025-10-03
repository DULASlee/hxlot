/**
 * 🎨 SmartAbp 低代码设计器模块
 * 
 * 📦 包名: @smartabp/lowcode-designer
 * 🎯 定位: **应用层** (层级2) - 提供完整的可视化设计器UI
 * 
 * ⚡ 核心职责:
 * - 可视化组件设计器
 * - 实体关系建模器
 * - 页面设计器
 * - 主题定制器
 * - 代码生成引擎UI
 * 
 * 🚨 架构约束:
 * - ✅ 可以依赖 @smartabp/lowcode-core (层级1)
 * - ✅ 可以依赖 @smartabp/lowcode-shared (层级0)
 * - ❌ 严禁使用 @/ 引用主应用
 * - ❌ 严禁被 lowcode-core 或 lowcode-shared 依赖
 */

// ===== 视图组件导出 =====
export { default as LowCodeEngineView } from './src/views/codegen/LowCodeEngineView.vue'
export { default as VisualDesignerView } from './src/views/VisualDesignerView.vue'
export { default as DesignView } from './src/views/DesignView.vue'
export { default as EntityModelingView } from './src/views/EntityModelingView.vue'
export { default as ThemeCustomizationView } from './src/views/ThemeCustomizationView.vue'
export { default as UltraSimpleStudio } from './src/views/UltraSimpleStudio.vue'

// ===== 设计器组件导出 =====
export { default as EntityDesigner } from './src/components/CodeGenerator/EntityDesigner.vue'
export { default as PropertyInspector } from './src/components/PropertyInspector.vue'
export { default as AdvancedEntityRelationshipDesigner } from './src/components/AdvancedEntityRelationshipDesigner.vue'
export { default as AdvancedFieldTypeDesigner } from './src/components/AdvancedFieldTypeDesigner.vue'
export { default as BusinessRulesEngine } from './src/components/BusinessRulesEngine.vue'
export { default as ComponentPropertyPanel } from './src/components/ComponentPropertyPanel.vue'
export { default as DataDictionaryManager } from './src/components/DataDictionaryManager.vue'
export { default as EnhancedStateMachine } from './src/components/EnhancedStateMachine.vue'
export { default as EnhancedThemeEditor } from './src/components/EnhancedThemeEditor.vue'
export { default as EnterpriseCodeGenerationEngine } from './src/components/EnterpriseCodeGenerationEngine.vue'
export { default as EnterpriseModelingAssistant } from './src/components/EnterpriseModelingAssistant.vue'
export { default as EnterpriseQualityAssurance } from './src/components/EnterpriseQualityAssurance.vue'
export { default as OneClickSolution } from './src/components/OneClickSolution.vue'
export { default as ProjectWizard } from './src/components/ProjectWizard.vue'
export { default as SandboxPreview } from './src/components/SandboxPreview.vue'
export { default as SecurityDashboard } from './src/components/SecurityDashboard/SecurityDashboard.vue'
export { default as StateMachineEditor } from './src/components/StateMachineEditor.vue'
export { default as TemplateSelector } from './src/components/TemplateSelector.vue'
export { default as ThemeEditor } from './src/components/ThemeEditor.vue'
export { default as VisualComponentPalette } from './src/components/VisualComponentPalette.vue'
export { default as VisualDesignCanvas } from './src/components/VisualDesignCanvas.vue'
export { default as AdvancedBusinessRulesEngine } from './src/components/AdvancedBusinessRulesEngine.vue'
export { default as EnterpriseWorkflowEngine } from './src/components/EnterpriseWorkflowEngine.vue'
export { default as EnterprisePermissionSystem } from './src/components/EnterprisePermissionSystem.vue'

// ===== 新增：代码生成向导和进度监控组件导出 =====
export { default as CodeGenerationWizard } from './src/components/CodeGenerationWizard.vue'
export { default as GenerationProgressMonitor } from './src/components/GenerationProgressMonitor.vue'
export type { GenerationStage, GenerationLog, GenerationStatistics } from './src/components/GenerationProgressMonitor.vue'

// ===== 类型定义导出 =====
export * from './src/types/security'
export * from './src/types/designer'

// ===== 工具函数导出 =====
export { uiConfigToPageSchema } from './src/utils/uiConfigMapper'
export { useResponsive } from './src/utils/responsive-design'
export { usePerformanceMonitor } from './src/utils/performance-optimizer'
export { useErrorRecovery, CrashRecovery } from './src/utils/error-recovery'

// ===== 包信息导出 =====
export const LOWCODE_DESIGNER_VERSION = '1.0.0'
export const PACKAGE_INFO = {
  name: '@smartabp/lowcode-designer',
  version: LOWCODE_DESIGNER_VERSION,
  description: 'SmartAbp LowCode Engine - Visual Designer Layer',
  layer: 2,
  dependencies: ['@smartabp/lowcode-core', '@smartabp/lowcode-shared'],
  author: 'SmartAbp Team'
}

