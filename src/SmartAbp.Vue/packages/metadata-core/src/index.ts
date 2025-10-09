/**
 * @smartabp/metadata-core
 *
 * SmartAbp统一元数据模型核心包
 * Schema-First元数据定义，支持前后端类型安全的代码生成
 *
 * @packageDocumentation
 */

// ========== 类型定义 ==========
export * from './types/index.js'

// ========== 验证器 ==========
export * from './validators/index.js'

// ========== Schema工具 ==========
export * from './schema/index.js'

// ========== 转换器 ==========
export * from './converters/index.js'

// ========== 版本信息 ==========
export const VERSION = '1.0.0'
export const SCHEMA_VERSION = '1.0.0'
