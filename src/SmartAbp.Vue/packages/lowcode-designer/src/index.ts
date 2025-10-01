// SmartAbp LowCode Designer Package Entry Point
export const VERSION = '1.0.0'
export const PACKAGE_NAME = '@smartabp/lowcode-designer'

// 🚀 主要设计器视图
export { default as UltraSimpleStudio } from './views/UltraSimpleStudio.vue'
export { default as VisualDesignerView } from './views/VisualDesignerView.vue'
export { default as DesignView } from './views/DesignView.vue'
export { default as EntityModelingView } from './views/EntityModelingView.vue'
export { default as ThemeCustomizationView } from './views/ThemeCustomizationView.vue'

// 🔧 代码生成视图
export { default as LowCodeEngineView } from './views/codegen/LowCodeEngineView.vue'
export { default as SfcCompilerView } from './views/codegen/SfcCompilerView.vue'
export { default as DragDropFormView } from './views/codegen/DragDropFormView.vue'
export { default as PerformanceDashboard } from './views/codegen/PerformanceDashboard.vue'

// 🧩 设计器组件 
export { default as PropertyInspector } from './components/PropertyInspector.vue'
export { default as DraggableComponent } from './components/DraggableComponent.vue'

// 🎨 运行时渲染器
export { default as MetadataDrivenPageRenderer } from './runtime/MetadataDrivenPageRenderer.vue'

// 模板选择器组件
export const TemplateSelector = {
  name: 'TemplateSelector',
  emits: ['select'],
  template: `
    <div class="template-selector">
      <h4>📋 选择代码模板</h4>
      <div class="template-grid">
        <div class="template-item" @click="$emit('select', { name: 'CRUD模板', type: 'crud' })">
          <h5>CRUD模板</h5>
          <p>基础增删改查功能</p>
        </div>
        <div class="template-item" @click="$emit('select', { name: 'DDD模板', type: 'ddd' })">
          <h5>DDD模板</h5>
          <p>领域驱动设计模板</p>
        </div>
      </div>
    </div>
  `,
  style: `
    .template-selector { padding: 16px; }
    .template-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .template-item { padding: 12px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; }
    .template-item:hover { background: #f0f8ff; border-color: #409eff; }
    .template-item h5 { margin: 0 0 8px 0; }
    .template-item p { margin: 0; font-size: 12px; color: #666; }
  `
}

// 代码预览沙盒组件
export const SandboxPreview = {
  name: 'SandboxPreview',
  props: ['code'],
  template: `
    <div class="sandbox-preview">
      <h4>🔍 代码预览</h4>
      <div class="code-container">
        <pre><code>{{ code || '// 生成的代码将在此处显示\\nconsole.log("Hello, SmartAbp!");' }}</code></pre>
      </div>
    </div>
  `,
  style: `
    .sandbox-preview { padding: 16px; }
    .code-container { background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 6px; padding: 16px; }
    .code-container pre { margin: 0; font-family: 'Courier New', monospace; font-size: 13px; }
  `
}

// 🧩 缺失的组件导出 (预留实现)
export const AdvancedEntityRelationshipDesigner = () => null
export const AdvancedFieldTypeDesigner = () => null
export const BusinessRulesEngine = () => null
export const VisualDesignCanvas = () => null
export const EnhancedThemeEditor = () => null
export const StateMachineEditor = () => null

// Designer components (to be implemented)
export interface DesignerAPI {
  createDesigner: (config: any) => any
  renderPreview: (schema: any) => any
}

// Placeholder for designer API
export const designerAPI: DesignerAPI = {
  createDesigner: (config: any) => {
    console.log('Creating designer with config:', config)
    return null
  },
  renderPreview: (schema: any) => {
    console.log('Rendering preview for schema:', schema)
    return null
  }
}

export default {
  VERSION,
  PACKAGE_NAME,
  designerAPI
}