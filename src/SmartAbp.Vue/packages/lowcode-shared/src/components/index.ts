// 🏗️ Component System Exports

// 从 ComponentRegistry 导出（排除与types重复的类型）
export {
  ComponentRegistry, getComponentMetadata, globalComponentRegistry, loadComponent, registerComponent, type ComponentBundle, type ComponentCategory, type ComponentMetadata, type ComponentPriority
} from './ComponentRegistry.js'
export type {
  ComponentCategory, ComponentInstance,
  ComponentLoadStats, LoadPriority
} from './ComponentRegistry.js'

// 从 BaseComponent 导出（排除与types重复的类型）
export { default as BaseComponent } from './BaseComponent.js'

// 从 hocs 导出（排除与validators重复的类型）
export * from './hocs/index.js'

// 🌟 虚拟程序集导出（微AI 2.0核心）
export {
  createVirtualAssembly, VirtualAssembly
} from './VirtualAssembly.js'
export type {
  ComponentProxy,
  VirtualAssemblyOptions
} from './VirtualAssembly.js'

// 🎯 TypeScript类型生成器导出（微AI 2.0 - 阶段2）
export {
  TypeDefinitionGenerator,
  createTypeGenerator,
  generateTypes
} from './TypeDefinitionGenerator'
export type {
  TypeGeneratorOptions,
  GeneratedTypeDefinition
} from './TypeDefinitionGenerator'

