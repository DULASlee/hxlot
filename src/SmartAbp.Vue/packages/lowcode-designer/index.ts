// 🏗️ SmartAbp 低代码设计器模块 - 企业级2025标准

// ===== 核心视图组件 =====
export { default as LowCodeEngineView } from "./src/views/codegen/LowCodeEngineView.vue"
export { default as VisualDesignerView } from "./src/views/VisualDesignerView.vue"
export { default as DesignView } from "./src/views/DesignView.vue"
export { default as EntityModelingView } from "./src/views/EntityModelingView.vue"
export { default as ThemeCustomizationView } from "./src/views/ThemeCustomizationView.vue"

// ===== 核心设计组件 =====
export { default as EntityDesigner } from "./src/components/CodeGenerator/EntityDesigner.vue"
export { default as PropertyInspector } from "./src/components/PropertyInspector.vue"

// ===== 迁移的专门组件 =====
export { default as AdvancedEntityRelationshipDesigner } from "./src/components/AdvancedEntityRelationshipDesigner.vue"
export { default as AdvancedFieldTypeDesigner } from "./src/components/AdvancedFieldTypeDesigner.vue"
export { default as BusinessRulesEngine } from "./src/components/BusinessRulesEngine.vue"
export { default as ComponentPropertyPanel } from "./src/components/ComponentPropertyPanel.vue"
export { default as DataDictionaryManager } from "./src/components/DataDictionaryManager.vue"
export { default as EnhancedStateMachine } from "./src/components/EnhancedStateMachine.vue"
export { default as EnhancedThemeEditor } from "./src/components/EnhancedThemeEditor.vue"
export { default as EnterpriseCodeGenerationEngine } from "./src/components/EnterpriseCodeGenerationEngine.vue"
export { default as EnterpriseModelingAssistant } from "./src/components/EnterpriseModelingAssistant.vue"
export { default as EnterpriseQualityAssurance } from "./src/components/EnterpriseQualityAssurance.vue"
export { default as OneClickSolution } from "./src/components/OneClickSolution.vue"
export { default as ProjectWizard } from "./src/components/ProjectWizard.vue"
export { default as SandboxPreview } from "./src/components/SandboxPreview.vue"
export { default as SecurityDashboard } from "./src/components/SecurityDashboard/SecurityDashboard.vue"
export { default as StateMachineEditor } from "./src/components/StateMachineEditor.vue"
export { default as TemplateSelector } from "./src/components/TemplateSelector.vue"
export { default as ThemeEditor } from "./src/components/ThemeEditor.vue"
export { default as VisualComponentPalette } from "./src/components/VisualComponentPalette.vue"
export { default as VisualDesignCanvas } from "./src/components/VisualDesignCanvas.vue"

// 🚀 企业级2025标准组件
export { default as AdvancedBusinessRulesEngine } from "./src/components/AdvancedBusinessRulesEngine.vue"
export { default as EnterpriseWorkflowEngine } from "./src/components/EnterpriseWorkflowEngine.vue"
export { default as EnterprisePermissionSystem } from "./src/components/EnterprisePermissionSystem.vue"

// ===== 类型定义导出 =====
export * from "./src/types/security"
export * from "./src/types/designer"

// ===== 工具函数导出 =====
export { uiConfigToPageSchema } from "./src/utils/uiConfigMapper"
export { useResponsive } from "./src/utils/responsive-design"
export { usePerformanceMonitor } from "./src/utils/performance-optimizer"
export { useErrorRecovery, CrashRecovery } from "./src/utils/error-recovery"
