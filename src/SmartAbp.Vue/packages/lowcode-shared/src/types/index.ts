/**
 * 📋 Types Module Entry
 * 
 * 类型定义集合入口
 * 
 * @module @smartabp/lowcode-shared/types
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 统一元数据类型系统 (从metadata-core导入)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type {
  AspireSolutionMetadata, BackendConfig, EndpointMetadata, EntityMetadata, FeatureConfig, LifecycleMetadata, MenuConfig, MicroserviceMetadata, ModuleMetadata, NavigationPropertyMetadata, PropertyMetadata, RouteMetadata,
  StoreMetadata, UIConfig, ValidationRule
} from '@smartabp/metadata-core'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔄 向后兼容：统一Schema类型系统 (逐步弃用)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type {
  UnifiedCodeGenerationConfig, UnifiedEntityDefinition,
  UnifiedEntityField,
  UnifiedEntityRelationship, UnifiedEntityUIConfig, UnifiedFrontendConfig, UnifiedMenuConfig, UnifiedModuleMetadata, UnifiedPermissionConfig, UnifiedValidationRule, UnifiedValidationRuleType
} from './unified-schema'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏗️ 组件基础类型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type {
  BaseComponentProps, ComponentSize, ComponentState, ComponentVariant
} from './component-base'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 日志类型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { createComponentLogger, getGlobalLogger } from './logger'
export type { ILogger } from './logger'

// UI 配置类型（供上层包重用）
export type { MDIWindowConfig, TabConfig } from './ui'

// 通用DTO类型（供API层重用）
export type { AuditedEntityDto, EntityDto, ListResultDto, PagedResultDto } from './dtos'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💼 业务类型（从主应用迁移至统一类型系统）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type {
  BookDto, CreateBookDto, UpdateBookDto, BookPagedRequestDto, BookPagedResultDto,
  BaseEntityDto, BasePagedRequestDto, BasePagedResultDto
} from './business'

