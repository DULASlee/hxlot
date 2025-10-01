// SmartAbp LowCode Designer - Types Only Export
// 用于TypeScript项目引用的类型和工具导出

export const VERSION = '1.0.0'
export const PACKAGE_NAME = '@smartabp/lowcode-designer'

// 🎯 类型定义导出
export * from './types/designer'
export * from './types/security'
// export * from './types/form' // TODO: 未实现，待补充

// 🛠️ 工具函数导出
export * from './utils/cache-manager'
export * from './utils/data-sync'
export * from './utils/performance-optimizer'
export * from './utils/zod-schemas'

// 🏗️ 设计器核心逻辑导出 (非Vue组件)
export * from './designer/schema/exporter'
// export * from './designer/codeGenerator' // TODO: 未实现，待补充
// export * from './designer/templateEngine' // TODO: 未实现，待补充

// 🔧 核心功能导出
export * from './components/dragDropEngine'
// export * from './runtime/ComponentRegistry' // TODO: 未实现，待补充
// export * from './runtime/PageRenderer' // TODO: 未实现，待补充
