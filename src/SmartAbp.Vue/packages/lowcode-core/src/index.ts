// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// @smartabp/lowcode-core - 主入口文件
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// @description 低代码核心引擎包，包含状态管理、代码生成、组件库等核心功能
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ============================================================================
// 🎨 核心组件导出
// ============================================================================

// SmartFormBuilder 2.0 - 企业级表单构建器
export {
  SmartFormBuilder,
  SmartFormDesigner,
  FormSchemaAdapter,
  FormLinkageEngine,
  LinkageRuleBuilder,
  LinkageRuleValidator,
  LINKAGE_TEMPLATES
} from './components/SmartFormBuilder'

export type {
  FormCreateRule,
  FormCreateConfig,
  SmartFieldType,
  SmartFormItem,
  DeviceParameterField,
  QualityInspectionField,
  WorkOrderField,
  MaterialField,
  DictionaryField,
  LinkageRule,
  LinkageCondition,
  LinkageAction,
  LinkageConditionType,
  LinkageActionType,
  CascadeConfig,
  DynamicFieldConfig,
  CalculatedFieldConfig
} from './components/SmartFormBuilder'

// BusinessRuleDesigner - 业务规则可视化设计器
export { default as BusinessRuleDesigner } from './components/BusinessRuleDesigner/BusinessRuleDesigner.vue'

// WorkflowDesigner - 工作流可视化设计器
export { default as WorkflowDesigner } from './components/WorkflowDesigner/WorkflowDesigner.vue'

// ============================================================================
// 📦 Stores导出
// ============================================================================

export * from './stores/codeGeneration'
export * from './stores/enhancedStateMachine'
export * from './stores/entityModeling'
export * from './stores/pageDesign'
export * from './stores/businessRuleStore'
export * from './stores/workspace'

// ============================================================================
// 🔧 Generators导出
// ============================================================================

export * from './generators'

// ============================================================================
// ⚙️ Engines导出
// ============================================================================

export * from './engines'

// ============================================================================
// 🔒 Security导出
// ============================================================================

export * from './security'

// ============================================================================
// 🧪 Testing导出
// ============================================================================

export * from './testing'

// ============================================================================
// 🎨 Composables导出
// ============================================================================

export { useCodeGenerationProgress } from './composables/useCodeGenerationProgress'
export { useDragDrop } from './composables/useDragDrop'
export { useFullscreen } from './composables/useFullscreen'
export { useRealTimeAlerts } from './composables/useRealTimeAlerts'
export { useSecurityDashboard } from './composables/useSecurityDashboard'

// ============================================================================
// 📝 Types导出
// ============================================================================

// Note: EntityDefinition已从stores/entityModeling导出，避免重复
export type { ModuleMetadata, EntityMetadata, PropertyMetadata, ManifestData } from './types/unified-metadata'
export type { EntityModel } from './types/entity-designer'
export type { ModuleManifest } from './types/manifest'

