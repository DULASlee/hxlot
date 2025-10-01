/**
 * 🔧 SmartAbp 低代码工具模块
 * 
 * 📦 包名: @smartabp/lowcode-tools
 * 🎯 定位: **桥接层** - 连接主应用与packages
 * 🌉 角色: 作为唯一允许使用@/别名的package
 * 
 * ⚡ 核心职责:
 * - 封装主应用工具函数供packages使用
 * - 提供日志、事件、性能等通用工具
 * - 桥接主应用API服务
 * 
 * 🚨 架构约束:
 * - ✅ 允许使用 @/ 别名（唯一白名单）
 * - ✅ 可以依赖 @smartabp/lowcode-shared
 * - ❌ 严禁相对路径引用
 * - ❌ 严禁导出Node.js专用工具到浏览器环境
 */

// ===== 日志工具导出 =====
/**
 * 📝 日志系统
 * - logger: 全局日志实例
 * - createComponentLogger: 组件专用日志创建器
 */
export { logger } from '@/utils/logger'
export { createComponentLogger } from '@/utils/logging'

// ===== 事件总线导出 =====
/**
 * 📡 事件总线系统
 * - eventBus: 全局事件总线实例
 * - LowCodeEvents: 低代码事件类型定义
 */
export { eventBus } from '@/utils/eventBus'
export type { LowCodeEvents } from '@/utils/eventBus'

// ===== 性能优化工具 =====
/**
 * ⚡ 性能优化工具集
 * - 内存优化工具
 * - 虚拟滚动优化
 */
export * from '@/utils/performance/memoryOptimization'
export * from '@/utils/performance/virtualScrolling'

// ===== API服务 =====
/**
 * 🔌 API服务桥接
 * - apiService: 主应用HTTP服务实例
 */
export { apiService } from '@/utils/api'

// ===== 包信息导出 =====
export const LOWCODE_TOOLS_VERSION = '1.0.0'

export const PACKAGE_INFO = {
  name: '@smartabp/lowcode-tools',
  version: LOWCODE_TOOLS_VERSION,
  description: 'SmartAbp LowCode Engine Tools - Bridge Layer between Main App and Packages',
  role: 'bridge-layer',
  permissions: ['@/-alias-allowed'],
  author: 'SmartAbp Team'
} as const

// 默认导出（保持向后兼容）
export default PACKAGE_INFO
