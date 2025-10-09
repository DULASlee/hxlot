// 🏗️ Component System Exports

// 从 ComponentRegistry 导出（排除与types重复的类型）
export {
  ComponentRegistry,
  createComponentRegistry,
  registerComponent,
  loadComponent,
  getComponentMetadata,
  globalComponentRegistry
} from './ComponentRegistry'
export type {
  ComponentCategory,
  LoadPriority,
  ComponentInstance,
  ComponentLoadStats
} from './ComponentRegistry'

// 从 BaseComponent 导出（排除与types重复的类型）
export {
  BaseComponent
} from './BaseComponent'

// 从 hocs 导出（排除与validators重复的类型）
export * from './hocs'

// 🌟 虚拟程序集导出（微AI 2.0核心）
export {
  VirtualAssembly,
  createVirtualAssembly
} from './VirtualAssembly'
export type {
  ComponentProxy,
  VirtualAssemblyOptions
} from './VirtualAssembly'

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

