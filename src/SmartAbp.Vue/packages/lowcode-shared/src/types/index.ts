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
