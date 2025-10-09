// 🔥 架构铁律三合规：lowcode-designer视图模块导出
// 统一导出视图组件名称，组件通过ComponentRegistry动态加载

// 导出视图组件名称（不直接导出Vue组件，通过ComponentRegistry加载）
export const DESIGNER_VIEWS = [
  'DesignView',
  'EntityModelingView',
  'ThemeCustomizationView',
  'UltraSimpleStudio',
  'VisualDesignerView',
  'EntityDesignerTestView',
  'LowCodeStudioView' // ✅ 新增：低代码工作室主界面
] as const

export const CODEGEN_VIEWS = [
  'AIAssistantPanel',
  'AspireDesignerView',
  'AutoScalingDesigner',
  'CICDPipelineEditor',
  'CostDashboard',
  'DragDropFormView',
  'EnvironmentComparisonView',
  'EnvironmentConfigPanel',
  'LowCodeEngineView',
  'NetworkPolicyDesigner',
  'ObservabilityConfigPanel',
  'ObservabilityDashboard',
  'PerformanceDashboard',
  'RBACEditor',
  'ScalingHistoryChart',
  'SecurityPolicyEditor',
  'SfcCompilerView',
  'TemplateMarketplace'
] as const

export type DesignerViewName = typeof DESIGNER_VIEWS[number]
export type CodegenViewName = typeof CODEGEN_VIEWS[number]
export type ViewName = DesignerViewName | CodegenViewName
