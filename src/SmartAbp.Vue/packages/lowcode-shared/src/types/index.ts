/**
 * 📋 Types Module Entry
 *
 * 类型定义集合入口
 *
 * @module @smartabp/lowcode-shared/types
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 统一元数据类型系统 (从metadata-core迁移至unified-schema)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type {
  AspireSolutionMetadata, BackendConfig, EndpointMetadata, EntityMetadata, FeatureConfig, LifecycleMetadata, MenuConfig, MicroserviceMetadata, ModuleMetadata, NavigationPropertyMetadata, PropertyMetadata, RouteMetadata,
  StoreMetadata, UIConfig, ValidationRule
} from './unified-schema.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔄 向后兼容：统一Schema类型系统 (逐步弃用)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type {
  UnifiedCodeGenerationConfig, UnifiedEntityDefinition,
  UnifiedEntityField,
  UnifiedEntityRelationship, UnifiedEntityUIConfig, UnifiedFrontendConfig, UnifiedMenuConfig, UnifiedModuleMetadata, UnifiedPermissionConfig, UnifiedValidationRule, UnifiedValidationRuleType
} from './unified-schema.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏗️ 组件基础类型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type {
  BaseComponentProps, ComponentSize, ComponentState, ComponentVariant
} from './component-base.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧩 组件统一类型系统 (v1.0.0) - 统一 ComponentCategory 定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type { ComponentBaseMetadata, ComponentCategory, ComponentStatus, LoadPriority, LoadStrategy } from './component.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 日志类型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { createComponentLogger, getGlobalLogger } from './logger.js'
export type { ILogger } from './logger.js'

// UI 配置类型（供上层包重用）
export type { MDIWindowConfig, TabConfig } from './ui.js'

// 通用DTO类型（供API层重用）
export type { AuditedEntityDto, EntityDto, ListResultDto, PagedResultDto } from './dtos.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 装配件系统类型（Assembly System Types）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type { AssemblyConfig, AssemblyEvent, AssemblyPlugin, AssemblyValidationResult, DependencyEdge, DependencyGraph, DependencyNode, GeneratedCode, IAssemblyManager, ValidationError, ValidationWarning } from './assembly.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💼 业务类型（从主应用迁移至统一类型系统）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type {
  BaseEntityDto, BasePagedRequestDto, BasePagedResultDto, BookDto, BookPagedRequestDto, BookPagedResultDto, CreateBookDto, UpdateBookDto
} from './business.js'

