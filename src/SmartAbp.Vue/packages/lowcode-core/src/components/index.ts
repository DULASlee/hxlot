/**
 * SmartAbp Low-Code Core - Components Export
 * 
 * Centralized export for all core low-code components
 * Follows naming convention: Lc{ComponentName}
 * 
 * @author SmartAbp Team
 * @version 1.0.0
 * @license MIT
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 Vue组件导出说明（企业级架构设计）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Vue组件通过ComponentRegistry统一管理和注册（遵循架构铁律二）
// - 组件注册：见 register.ts
// - 组件加载：使用 loadComponent() 或全局注册
// - 运行时处理：由 Vite 在开发/构建时处理 .vue 文件
// - TypeScript编译：tsc --build 只处理 .ts/.tsx 文件
//
// 注意：.vue 文件的导出已移除，因为 tsc 无法处理它们
// 主应用通过 Vite 的别名（@smartabp/lowcode-core）访问这些组件
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Business Rule Designer Components
// export { default as LcBusinessRuleDesigner } from './BusinessRuleDesigner/BusinessRuleDesigner.vue'
// export { default as LcPropertyPanel } from './BusinessRuleDesigner/PropertyPanel.vue'
// export { default as LcRuleToolbox } from './BusinessRuleDesigner/RuleToolbox.vue'

// Business Rule Nodes
// export { default as LcActionNode } from './BusinessRuleDesigner/nodes/ActionNode.vue'
// export { default as LcConditionNode } from './BusinessRuleDesigner/nodes/ConditionNode.vue'
// export { default as LcDecisionNode } from './BusinessRuleDesigner/nodes/DecisionNode.vue'
// export { default as LcEndNode } from './BusinessRuleDesigner/nodes/RuleEndNode.vue'
// export { default as LcStartNode } from './BusinessRuleDesigner/nodes/RuleStartNode.vue'

// Page Builder Components
// export { default as LcPageBuilder } from './PageBuilder/PageBuilder.vue'

// Smart Data Table Components
// export { default as LcSmartDataTable } from './SmartDataTable/SmartDataTable.vue'

// Smart Form Builder Components
// export { default as LcSmartFormBuilder } from './SmartFormBuilder/SmartFormBuilder.vue'
// export { default as LcSmartFormDesigner } from './SmartFormBuilder/SmartFormDesigner.vue'

// Form Builder Adapters
export { default as LcFormSchemaAdapter } from './SmartFormBuilder/adapters/FormSchemaAdapter.js'

// Form Builder Engine
export { FormLinkageEngine as LcFormLinkageEngine } from './SmartFormBuilder/engine/FormLinkageEngine.js'

// Workflow Designer Components
// export { default as LcWorkflowDesigner } from './WorkflowDesigner/WorkflowDesigner.vue'

// Workflow Nodes
// export { default as LcWorkflowGatewayNode } from './WorkflowDesigner/nodes/GatewayNode.vue'
// export { default as LcWorkflowTaskNode } from './WorkflowDesigner/nodes/TaskNode.vue'
// export { default as LcWorkflowEndNode } from './WorkflowDesigner/nodes/WorkflowEndNode.vue'
// export { default as LcWorkflowStartNode } from './WorkflowDesigner/nodes/WorkflowStartNode.vue'

// Utility Components
// export { default as LcErrorBoundary } from './ErrorBoundary.vue'
// export { default as LcGlobalLoadingOverlay } from './GlobalLoadingOverlay.vue'
// export { default as LcWorkspaceContainer } from './WorkspaceContainer.vue'

// Re-export full SmartFormBuilder API (组件 + 类型 + 引擎工具)
export * from './SmartFormBuilder/index.js'

// Types exports
export * from './BusinessRuleDesigner/types.js'

/**
 * ❌ 已废弃：app.component注册方式
 * ✅ 请使用：registerCoreComponents() - 企业级ComponentRegistry
 * 
 * @deprecated 违反架构铁律二，已在v1.0中移除
 * @see registerCoreComponents in src/index.ts
 */