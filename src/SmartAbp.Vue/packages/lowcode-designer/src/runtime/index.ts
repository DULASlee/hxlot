// 🔥 架构铁律三合规：lowcode-designer运行时模块导出
// 统一导出运行时功能，保持模块黑盒原则

// 导出运行时组件（通过ComponentRegistry加载）
export const RUNTIME_COMPONENTS = [
  'MetadataDrivenPageRenderer'
] as const

export type RuntimeComponentName = typeof RUNTIME_COMPONENTS[number]
