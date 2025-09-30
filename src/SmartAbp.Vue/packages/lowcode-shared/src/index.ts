/**
 * 🏗️ SmartAbp LowCode Shared Library
 * 
 * 📦 包含所有低代码引擎包共享的工具函数、类型定义、常量等
 * 🎯 遵循packages黑盒原则，提供统一的API导出
 * 🛡️ 专注于内存安全和性能优化
 */

// 🎯 类型定义导出
export * from './types'

// 🔧 工具函数导出
export * from './utils'

// 📋 常量导出
export * from './constants'

// ✅ 验证器导出
export * from './validators'

// 🛡️ 安全事件监听器 - 防止内存泄露
export {
  useSafeEventListener,
  useSafeEventBusListener,
  useSafeTimer
} from './composables/useSafeEventListener'

// 🏗️ 企业级组件注册中心 - 公共组件系统革命
export {
  ComponentRegistry,
  globalComponentRegistry,
  createComponentRegistry,
  registerComponent,
  loadComponent,
  getComponentMetadata
} from './components/ComponentRegistry'

export type {
  ComponentMetadata as ComponentRegistryMetadata,
  ComponentInstance,
  ComponentLoadStats,
  ComponentCategory,
  LoadPriority
} from './components/ComponentRegistry'

// 🔥 错误处理导出
export * from './error'

// 📋 导出版本信息
export const LOWCODE_SHARED_VERSION = '1.0.0'

// 🎯 导出包信息
export const PACKAGE_INFO = {
  name: '@smartabp/lowcode-shared',
  version: LOWCODE_SHARED_VERSION,
  description: 'SmartAbp LowCode Engine Shared Library - Memory Safe Utilities',
  author: 'SmartAbp Team'
} as const
