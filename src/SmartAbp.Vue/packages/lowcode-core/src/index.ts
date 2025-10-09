/**
 * SmartAbp Low-Code Core - Main Export
 * 
 * Centralized export for all core low-code functionality
 * 
 * @author SmartAbp Team
 * @version 1.0.0
 * @license MIT
 */

// Export components
export * from './components/index.js'

// Export selected types for consumers
export type { TabConfig } from './stores/entityModeling.js'

// Backward-compatible type exports for consumers expecting these from root
export type {
  BarcodeScannerField, CalculatedFieldConfig, CascadeConfig, DeviceParameterField, DictionaryField, DynamicFieldConfig, FormCreateConfig,
  FormCreateRule, LinkageAction, LinkageActionType, LinkageCondition, LinkageConditionType, LinkageRule, MaterialField, ProductionLineField, QualityInspectionField, SensorDataField, SmartFieldType,
  SmartFormItem, WorkOrderField
} from './components/SmartFormBuilder/types.js'

// Note: utilities/composables/services are internal; re-exports removed to avoid path index issues

// Export runtime
export * from './runtime/index.js'

/**
 * 注册所有核心组件到 ComponentRegistry
 * @遵循架构铁律二：强制使用组件注册系统
 */
import { registerComponent } from '@smartabp/lowcode-shared'

export function registerCoreComponents(): void {
  // 1. 智能表单构建器（高优先级）
  registerComponent({
    name: 'SmartFormBuilder',
    displayName: '智能表单构建器',
    category: 'form',
    priority: 'high',
    dependencies: ['BaseComponent'],
    bundle: '@smartabp/lowcode-core',
    lazy: false,
    preload: true,
    version: '1.0.0',
    tags: ['form', 'builder', 'smart']
  })

  // 2. 智能表单设计器（高优先级）
  registerComponent({
    name: 'SmartFormDesigner',
    displayName: '智能表单设计器',
    category: 'form',
    priority: 'high',
    dependencies: ['BaseComponent', 'SmartFormBuilder'],
    bundle: '@smartabp/lowcode-core',
    lazy: false,
    preload: true,
    version: '1.0.0',
    tags: ['form', 'designer', 'smart']
  })

  // 3. 业务规则设计器（高优先级）
  registerComponent({
    name: 'BusinessRuleDesigner',
    displayName: '业务规则设计器',
    category: 'business',
    priority: 'high',
    dependencies: ['BaseComponent'],
    bundle: '@smartabp/lowcode-core',
    lazy: false,
    preload: true,
    version: '1.0.0',
    tags: ['business', 'rule', 'designer']
  })

  // 4. 工作流设计器（高优先级）
  registerComponent({
    name: 'WorkflowDesigner',
    displayName: '工作流设计器',
    category: 'workflow',
    priority: 'high',
    dependencies: ['BaseComponent'],
    bundle: '@smartabp/lowcode-core',
    lazy: false,
    preload: true,
    version: '1.0.0',
    tags: ['workflow', 'designer']
  })

  // 5. 智能数据表格（中优先级）
  registerComponent({
    name: 'SmartDataTable',
    displayName: '智能数据表格',
    category: 'data',
    priority: 'medium',
    dependencies: ['BaseComponent'],
    bundle: '@smartabp/lowcode-core',
    lazy: true,
    preload: false,
    version: '1.0.0',
    tags: ['data', 'table', 'smart']
  })

  // 6. 页面构建器（中优先级）
  registerComponent({
    name: 'PageBuilder',
    displayName: '页面构建器',
    category: 'layout',
    priority: 'medium',
    dependencies: ['BaseComponent'],
    bundle: '@smartabp/lowcode-core',
    lazy: true,
    preload: false,
    version: '1.0.0',
    tags: ['page', 'builder', 'layout']
  })

  // 7. 工作空间容器（中优先级）
  registerComponent({
    name: 'WorkspaceContainer',
    displayName: '工作空间容器',
    category: 'layout',
    priority: 'medium',
    dependencies: ['BaseComponent'],
    bundle: '@smartabp/lowcode-core',
    lazy: true,
    preload: false,
    version: '1.0.0',
    tags: ['workspace', 'container', 'layout']
  })

  // 8. 错误边界（中优先级）
  registerComponent({
    name: 'ErrorBoundary',
    displayName: '错误边界',
    category: 'utility',
    priority: 'medium',
    dependencies: ['BaseComponent'],
    bundle: '@smartabp/lowcode-core',
    lazy: false,
    preload: true,
    version: '1.0.0',
    tags: ['error', 'boundary', 'utility']
  })

  // 💀 【铁律二违规修复】新增缺失的组件注册
  // 9. 全局加载覆盖层（中优先级）
  registerComponent({
    name: 'GlobalLoadingOverlay',
    displayName: '全局加载覆盖层',
    category: 'utility',
    priority: 'medium',
    dependencies: ['BaseComponent'],
    bundle: '@smartabp/lowcode-core',
    lazy: false,
    preload: true,
    version: '1.0.0',
    tags: ['loading', 'overlay', 'utility']
  })

  // 10-15. 业务规则节点组件（中优先级）
  const ruleNodes = [
    { name: 'RuleStartNode', displayName: '规则开始节点' },
    { name: 'RuleEndNode', displayName: '规则结束节点' },
    { name: 'ActionNode', displayName: '动作节点' },
    { name: 'DecisionNode', displayName: '决策节点' },
    { name: 'ConditionNode', displayName: '条件节点' }
  ]

  ruleNodes.forEach(node => {
    registerComponent({
      name: node.name,
      displayName: node.displayName,
      category: 'business',
      priority: 'medium',
      dependencies: ['BaseComponent', 'BusinessRuleDesigner'],
      bundle: '@smartabp/lowcode-core',
      lazy: true,
      preload: false,
      version: '1.0.0',
      tags: ['business', 'rule', 'node']
    })
  })

  // 16-19. 工作流节点组件（中优先级）
  const workflowNodes = [
    { name: 'WorkflowStartNode', displayName: '工作流开始节点' },
    { name: 'WorkflowEndNode', displayName: '工作流结束节点' },
    { name: 'TaskNode', displayName: '任务节点' },
    { name: 'GatewayNode', displayName: '网关节点' }
  ]

  workflowNodes.forEach(node => {
    registerComponent({
      name: node.name,
      displayName: node.displayName,
      category: 'workflow',
      priority: 'medium',
      dependencies: ['BaseComponent', 'WorkflowDesigner'],
      bundle: '@smartabp/lowcode-core',
      lazy: true,
      preload: false,
      version: '1.0.0',
      tags: ['workflow', 'node']
    })
  })

  console.log('[SmartAbp] ✅ lowcode-core 核心组件已全部注册')
}

/**
 * Core low-code platform initialization
 */
export function initializeLowCodeCore(): void {
  registerCoreComponents()
  console.log('[SmartAbp] Low-Code Core initialized')
}

// Default export for plugin usage
export default {
  initializeLowCodeCore,
  registerCoreComponents
}