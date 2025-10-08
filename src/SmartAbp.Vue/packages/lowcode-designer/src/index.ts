/**
 * SmartAbp Low-Code Designer - Main Export
 * 
 * Centralized export for all designer functionality
 * 
 * @author SmartAbp Team
 * @version 1.0.0
 * @license MIT
 */

// Export components
export * from './components'

// Export core functionality
export * from './core'

// Export designer functionality
export * from './designer'

// Export runtime
export * from './runtime'

// Export types
export * from './types'

// Export utils
export * from './utils'

// Export views
export * from './views'

/**
 * 注册所有设计器组件到 ComponentRegistry
 * @遵循架构铁律二：强制使用组件注册系统
 */
import { registerComponent } from '@smartabp/lowcode-shared'

export function registerDesignerComponents(): void {
  // 核心设计器组件批量注册
  const coreDesignerComponents = [
    { name: 'CodeGenerationWizard', displayName: '代码生成向导', category: 'codegen', priority: 'high' as const },
    { name: 'TemplateManager', displayName: '模板管理器', category: 'template', priority: 'high' as const },
    { name: 'BusinessRulesEngine', displayName: '业务规则引擎', category: 'business', priority: 'high' as const },
    { name: 'RuleConditionBuilder', displayName: '规则条件构建器', category: 'business', priority: 'medium' as const },
    { name: 'RuleActionBuilder', displayName: '规则动作构建器', category: 'business', priority: 'medium' as const },
    { name: 'ExecutionMonitor', displayName: '执行监控器', category: 'monitor', priority: 'medium' as const },
    { name: 'TabsContainer', displayName: 'Tabs容器', category: 'layout', priority: 'medium' as const },
    { name: 'MDIContainer', displayName: 'MDI容器', category: 'layout', priority: 'medium' as const },
    { name: 'SandboxPreview', displayName: '沙箱预览', category: 'preview', priority: 'medium' as const },
    { name: 'PropertyInspector', displayName: '属性检查器', category: 'inspector', priority: 'medium' as const },
    { name: 'ServiceTopologyCanvas', displayName: '服务拓扑画布', category: 'aspire', priority: 'medium' as const },
    { name: 'ServiceConfigPanel', displayName: '服务配置面板', category: 'aspire', priority: 'medium' as const },
    { name: 'SecurityDashboard', displayName: '安全仪表板', category: 'security', priority: 'low' as const },
    { name: 'TemplateSelector', displayName: '模板选择器', category: 'template', priority: 'low' as const },
    { name: 'GenerationProgressMonitor', displayName: '生成进度监控', category: 'monitor', priority: 'low' as const }
  ]

  coreDesignerComponents.forEach(comp => {
    registerComponent({
      name: comp.name,
      displayName: comp.displayName,
      category: comp.category,
      priority: comp.priority,
      dependencies: ['BaseComponent'],
      bundle: '@smartabp/lowcode-designer',
      lazy: comp.priority === 'low',
      preload: comp.priority === 'high',
      version: '1.0.0',
      tags: [comp.category, 'designer']
    })
  })

  console.log('[SmartAbp] ✅ lowcode-designer 设计器组件已全部注册')
}

/**
 * Designer platform initialization
 */
export function initializeDesigner(): void {
  registerDesignerComponents()
  console.log('[SmartAbp] Designer initialized')
}

// Default export for plugin usage
export default {
  initializeDesigner,
  registerDesignerComponents
}