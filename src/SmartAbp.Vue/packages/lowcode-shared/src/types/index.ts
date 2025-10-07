/**
 * 📋 Types Module Entry
 * 
 * 类型定义集合入口
 * 
 * @module @smartabp/lowcode-shared/types
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 统一Schema类型系统
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type {
  UnifiedModuleMetadata,
  UnifiedEntityDefinition,
  UnifiedEntityField,
  UnifiedEntityRelationship,
  UnifiedValidationRule,
  UnifiedFrontendConfig,
  UnifiedCodeGenerationConfig,
  UnifiedEntityUIConfig,
  UnifiedPermissionConfig,
  UnifiedMenuConfig,
  UnifiedValidationRuleType,
} from './unified-schema'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏗️ 组件基础类型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type {
  BaseComponentProps,
  ComponentState,
  ComponentSize,
  ComponentVariant,
} from './component-base'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 日志类型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type { ILogger } from './logger'
export { getGlobalLogger, createComponentLogger } from './logger'

// UI 配置类型（供上层包重用）
export type { MDIWindowConfig, TabConfig } from './ui'

// 通用DTO类型（供API层重用）
export type { EntityDto, AuditedEntityDto, ListResultDto, PagedResultDto } from './dtos'
