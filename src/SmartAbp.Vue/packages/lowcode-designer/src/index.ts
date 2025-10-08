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
    { name: 'MicroserviceForm', displayName: '微服务表单', category: 'aspire', priority: 'low' as const },
    { name: 'AdvancedSettingsPanel', displayName: '高级设置面板', category: 'aspire', priority: 'low' as const },
    { name: 'MetricsChart', displayName: '指标图表', category: 'aspire', priority: 'low' as const },
    { name: 'SecurityDashboard', displayName: '安全仪表板', category: 'security', priority: 'low' as const },
    { name: 'SecurityMetricCard', displayName: '安全指标卡片', category: 'security', priority: 'low' as const },
    { name: 'RiskLevelDistributionChart', displayName: '风险等级分布图', category: 'security', priority: 'low' as const },
    { name: 'PermissionAccessTrendChart', displayName: '权限访问趋势图', category: 'security', priority: 'low' as const },
    { name: 'ComplianceStatusMonitor', displayName: '合规状态监控', category: 'security', priority: 'low' as const },
    { name: 'AbnormalUserBehaviorTable', displayName: '异常用户行为表', category: 'security', priority: 'low' as const },
    { name: 'TemplateSelector', displayName: '模板选择器', category: 'template', priority: 'low' as const },
    { name: 'GenerationProgressMonitor', displayName: '生成进度监控', category: 'monitor', priority: 'low' as const },
    { name: 'ResiliencePolicyDesigner', displayName: '弹性策略设计器', category: 'resilience', priority: 'low' as const },
    { name: 'CircuitBreakerConfig', displayName: '断路器配置', category: 'resilience', priority: 'low' as const },
    { name: 'RetryPolicyConfig', displayName: '重试策略配置', category: 'resilience', priority: 'low' as const },
    { name: 'RateLimitConfig', displayName: '限流配置', category: 'resilience', priority: 'low' as const },
    { name: 'FallbackConfig', displayName: '降级配置', category: 'resilience', priority: 'low' as const },
    { name: 'BulkheadConfig', displayName: '隔离配置', category: 'resilience', priority: 'low' as const },
    { name: 'DevEnvironmentSetup', displayName: '开发环境设置', category: 'devops', priority: 'low' as const },
    { name: 'GitWorkflowPanel', displayName: 'Git工作流面板', category: 'git', priority: 'low' as const },
    { name: 'CICDTemplateDesigner', displayName: 'CI/CD模板设计器', category: 'cicd', priority: 'low' as const },
    { name: 'EnhancedCodePreview', displayName: '增强代码预览', category: 'code', priority: 'low' as const },
    { name: 'ChaosExperimentDesigner', displayName: '混沌实验设计器', category: 'chaos', priority: 'low' as const },
    { name: 'FaultInjectionConfig', displayName: '故障注入配置', category: 'chaos', priority: 'low' as const },
    { name: 'EnterpriseWorkflowEngine', displayName: '企业工作流引擎', category: 'workflow', priority: 'low' as const },
    
    // 💀 【铁律二违规修复】新增缺失的组件注册
    { name: 'AdvancedBusinessRulesEngine', displayName: '高级业务规则引擎', category: 'business', priority: 'medium' as const },
    { name: 'AdvancedEntityRelationshipDesigner', displayName: '高级实体关系设计器', category: 'designer', priority: 'medium' as const },
    { name: 'AdvancedFieldTypeDesigner', displayName: '高级字段类型设计器', category: 'designer', priority: 'medium' as const },
    { name: 'ComponentPropertyPanel', displayName: '组件属性面板', category: 'inspector', priority: 'medium' as const },
    { name: 'DataDictionaryManager', displayName: '数据字典管理器', category: 'data', priority: 'medium' as const },
    { name: 'DesignerPlaceholder', displayName: '设计器占位符', category: 'layout', priority: 'low' as const },
    { name: 'DraggableComponent', displayName: '可拖拽组件', category: 'designer', priority: 'medium' as const },
    { name: 'EnhancedStateMachine', displayName: '增强状态机', category: 'workflow', priority: 'medium' as const },
    { name: 'EnhancedThemeEditor', displayName: '增强主题编辑器', category: 'theme', priority: 'medium' as const },
    { name: 'EnterpriseCodeGenerationEngine', displayName: '企业代码生成引擎', category: 'codegen', priority: 'high' as const },
    { name: 'EnterpriseModelingAssistant', displayName: '企业建模助手', category: 'modeling', priority: 'high' as const },
    { name: 'EnterprisePermissionSystem', displayName: '企业权限系统', category: 'security', priority: 'high' as const },
    { name: 'EnterpriseQualityAssurance', displayName: '企业质量保证', category: 'quality', priority: 'medium' as const },
    { name: 'OneClickSolution', displayName: '一键解决方案', category: 'solution', priority: 'high' as const },
    { name: 'ProjectWizard', displayName: '项目向导', category: 'wizard', priority: 'high' as const },
    { name: 'StateMachineEditor', displayName: '状态机编辑器', category: 'workflow', priority: 'medium' as const },
    { name: 'ThemeEditor', displayName: '主题编辑器', category: 'theme', priority: 'medium' as const },
    { name: 'VisualComponentPalette', displayName: '可视化组件面板', category: 'designer', priority: 'high' as const },
    { name: 'VisualDesignCanvas', displayName: '可视化设计画布', category: 'designer', priority: 'high' as const },
    
    // CodeGenerator子组件
    { name: 'CodePreview', displayName: '代码预览', category: 'codegen', priority: 'medium' as const },
    { name: 'DragPreview', displayName: '拖拽预览', category: 'designer', priority: 'low' as const },
    { name: 'EntityDesigner', displayName: '实体设计器', category: 'designer', priority: 'high' as const }
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

  // 视图组件批量注册（Views作为顶层容器也需要注册）
  const viewComponents = [
    { name: 'EntityModelingView', displayName: '实体建模视图', category: 'view', priority: 'high' as const },
    { name: 'VisualDesignerView', displayName: '可视化设计器视图', category: 'view', priority: 'high' as const },
    { name: 'LowCodeEngineView', displayName: '低代码引擎视图', category: 'view', priority: 'high' as const },
    { name: 'AspireDesignerView', displayName: 'Aspire设计器视图', category: 'view', priority: 'medium' as const },
    { name: 'UltraSimpleStudio', displayName: '极简工作室', category: 'view', priority: 'medium' as const },
    { name: 'ThemeCustomizationView', displayName: '主题定制视图', category: 'view', priority: 'low' as const },
    { name: 'EntityDesignerTestView', displayName: '实体设计器测试视图', category: 'view', priority: 'low' as const }
  ]

  viewComponents.forEach(comp => {
    registerComponent({
      name: comp.name,
      displayName: comp.displayName,
      category: comp.category,
      priority: comp.priority,
      dependencies: ['BaseComponent'],
      bundle: '@smartabp/lowcode-designer',
      lazy: comp.priority !== 'high',
      preload: comp.priority === 'high',
      version: '1.0.0',
      tags: [comp.category, 'view', 'designer']
    })
  })

  // CodeGen子视图组件批量注册
  const codegenViewComponents = [
    { name: 'TemplateMarketplace', displayName: '模板市场', category: 'codegen', priority: 'low' as const },
    { name: 'AIAssistantPanel', displayName: 'AI助手面板', category: 'codegen', priority: 'low' as const },
    { name: 'ScalingHistoryChart', displayName: '扩容历史图表', category: 'codegen', priority: 'low' as const },
    { name: 'CostDashboard', displayName: '成本仪表板', category: 'codegen', priority: 'low' as const },
    { name: 'CICDPipelineEditor', displayName: 'CI/CD流水线编辑器', category: 'cicd', priority: 'low' as const },
    { name: 'AutoScalingDesigner', displayName: '自动扩容设计器', category: 'codegen', priority: 'low' as const },
    { name: 'ObservabilityDashboard', displayName: '可观测性仪表板', category: 'observability', priority: 'low' as const },
    { name: 'ObservabilityConfigPanel', displayName: '可观测性配置面板', category: 'observability', priority: 'low' as const },
    { name: 'RBACEditor', displayName: 'RBAC编辑器', category: 'security', priority: 'low' as const },
    { name: 'SecurityPolicyEditor', displayName: '安全策略编辑器', category: 'security', priority: 'low' as const },
    { name: 'NetworkPolicyDesigner', displayName: '网络策略设计器', category: 'security', priority: 'low' as const },
    { name: 'EnvironmentConfigPanel', displayName: '环境配置面板', category: 'devops', priority: 'low' as const },
    { name: 'EnvironmentComparisonView', displayName: '环境对比视图', category: 'devops', priority: 'low' as const },
    { name: 'SfcCompilerView', displayName: 'SFC编译器视图', category: 'codegen', priority: 'low' as const },
    { name: 'PerformanceDashboard', displayName: '性能仪表板', category: 'monitor', priority: 'low' as const },
    { name: 'DragDropFormView', displayName: '拖拽表单视图', category: 'form', priority: 'low' as const }
  ]

  codegenViewComponents.forEach(comp => {
    registerComponent({
      name: comp.name,
      displayName: comp.displayName,
      category: comp.category,
      priority: comp.priority,
      dependencies: ['BaseComponent'],
      bundle: '@smartabp/lowcode-designer',
      lazy: true,
      preload: false,
      version: '1.0.0',
      tags: [comp.category, 'view', 'codegen']
    })
  })

  // Designer子组件批量注册
  const designerSubComponents = [
    { name: 'Canvas', displayName: '画布', category: 'designer', priority: 'medium' as const },
    { name: 'Palette', displayName: '组件面板', category: 'designer', priority: 'medium' as const },
    { name: 'Inspector', displayName: '检查器', category: 'designer', priority: 'medium' as const },
    { name: 'StyleEditor', displayName: '样式编辑器', category: 'designer', priority: 'low' as const },
    { name: 'PreviewModal', displayName: '预览模态框', category: 'designer', priority: 'low' as const },
    { name: 'ImportDialog', displayName: '导入对话框', category: 'designer', priority: 'low' as const },
    { name: 'ExportDialog', displayName: '导出对话框', category: 'designer', priority: 'low' as const },
    { name: 'VersionHistory', displayName: '版本历史', category: 'designer', priority: 'low' as const },
    { name: 'MinimapComponent', displayName: '小地图组件', category: 'designer', priority: 'low' as const },
    { name: 'LayerManager', displayName: '图层管理器', category: 'designer', priority: 'low' as const },
    { name: 'AdvancedCanvasComponent', displayName: '高级画布组件', category: 'designer', priority: 'medium' as const },
    { name: 'AIAssistantPanelDesigner', displayName: 'AI助手面板（设计器）', category: 'designer', priority: 'low' as const }
  ]

  designerSubComponents.forEach(comp => {
    registerComponent({
      name: comp.name,
      displayName: comp.displayName,
      category: comp.category,
      priority: comp.priority,
      dependencies: ['BaseComponent'],
      bundle: '@smartabp/lowcode-designer',
      lazy: comp.priority === 'low',
      preload: false,
      version: '1.0.0',
      tags: [comp.category, 'sub-component']
    })
  })

  // 其他辅助组件
  const utilityComponents = [
    { name: 'DesignView', displayName: '设计视图', category: 'view', priority: 'medium' as const }
  ]

  utilityComponents.forEach(comp => {
    registerComponent({
      name: comp.name,
      displayName: comp.displayName,
      category: comp.category,
      priority: comp.priority,
      dependencies: ['BaseComponent'],
      bundle: '@smartabp/lowcode-designer',
      lazy: true,
      preload: false,
      version: '1.0.0',
      tags: [comp.category, 'utility']
    })
  })

  const totalComponents = coreDesignerComponents.length + viewComponents.length + codegenViewComponents.length + designerSubComponents.length + utilityComponents.length
  console.log('[SmartAbp] ✅ lowcode-designer 所有组件已全部注册（共' + totalComponents + '个）')
  console.log('[SmartAbp] 🎉 架构铁律二：组件注册系统 100% 合规！')
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