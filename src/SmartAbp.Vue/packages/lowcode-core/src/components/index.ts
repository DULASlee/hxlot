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

// Business Rule Designer Components
export { default as LcBusinessRuleDesigner } from './BusinessRuleDesigner/BusinessRuleDesigner.vue'
export { default as LcPropertyPanel } from './BusinessRuleDesigner/PropertyPanel.vue'
export { default as LcRuleToolbox } from './BusinessRuleDesigner/RuleToolbox.vue'

// Business Rule Nodes
export { default as LcActionNode } from './BusinessRuleDesigner/nodes/ActionNode.vue'
export { default as LcConditionNode } from './BusinessRuleDesigner/nodes/ConditionNode.vue'
export { default as LcDecisionNode } from './BusinessRuleDesigner/nodes/DecisionNode.vue'
export { default as LcEndNode } from './BusinessRuleDesigner/nodes/EndNode.vue'
export { default as LcStartNode } from './BusinessRuleDesigner/nodes/StartNode.vue'

// Page Builder Components
export { default as LcPageBuilder } from './PageBuilder/PageBuilder.vue'

// Smart Data Table Components
export { default as LcSmartDataTable } from './SmartDataTable/SmartDataTable.vue'

// Smart Form Builder Components
export { default as LcSmartFormBuilder } from './SmartFormBuilder/SmartFormBuilder.vue'
export { default as LcSmartFormDesigner } from './SmartFormBuilder/SmartFormDesigner.vue'

// Form Builder Adapters
export { default as LcFormSchemaAdapter } from './SmartFormBuilder/adapters/FormSchemaAdapter'

// Form Builder Engine
export { FormLinkageEngine as LcFormLinkageEngine } from './SmartFormBuilder/engine/FormLinkageEngine'

// Workflow Designer Components
export { default as LcWorkflowDesigner } from './WorkflowDesigner/WorkflowDesigner.vue'

// Workflow Nodes
export { default as LcWorkflowEndNode } from './WorkflowDesigner/nodes/EndNode.vue'
export { default as LcWorkflowGatewayNode } from './WorkflowDesigner/nodes/GatewayNode.vue'
export { default as LcWorkflowStartNode } from './WorkflowDesigner/nodes/StartNode.vue'
export { default as LcWorkflowTaskNode } from './WorkflowDesigner/nodes/TaskNode.vue'

// Utility Components
export { default as LcErrorBoundary } from './ErrorBoundary.vue'
export { default as LcGlobalLoadingOverlay } from './GlobalLoadingOverlay.vue'
export { default as LcWorkspaceContainer } from './WorkspaceContainer.vue'

// Re-export full SmartFormBuilder API (组件 + 类型 + 引擎工具)
export * from './SmartFormBuilder'

// Types exports
export * from './BusinessRuleDesigner/types'

/**
 * Auto-register all components for global usage
 * 
 * @description
 * This enables components to be used without explicit import in templates
 */
export function autoRegisterComponents(app: any): void {
  const components = import.meta.glob('./**/*.vue', { eager: true })

  Object.entries(components).forEach(([path, module]: [string, any]) => {
    const componentName = path
      .split('/')
      .pop()
      ?.replace('.vue', '')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase()

    if (componentName && module.default) {
      app.component(`Lc${componentName}`, module.default)
    }
  })
}

export default {
  autoRegisterComponents
}