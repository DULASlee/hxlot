// TemplateFile 类型统一从 ../types/designer 导出，避免重复导出冲突
export type { TemplateFile } from '../types/designer'
// 🔥 架构铁律三合规：lowcode-designer核心模块导出
// 统一导出核心功能，保持模块黑盒原则

export * from './TemplateEngine'
