/**
 * 📋 Types Module Entry
 *
 * 类型定义集合入口
 *
 * @module @smartabp/lowcode-shared/types
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 前端元数据类型系统 (Phase 1D: 从unified-schema分离至metadata)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type {
  AspireSolutionMetadata,
  BackendConfig,
  EndpointMetadata,
  EntityMetadata,
  FeatureConfig,
  LifecycleMetadata,
  MenuConfig,
  MicroserviceMetadata,
  ModuleMetadata, NavigationPropertyMetadata,
  PropertyMetadata,
  RouteMetadata, SchemaVersion, StoreMetadata,
  UIConfig, UnifiedCodeGenerationConfig, UnifiedDatabaseConfig, UnifiedEntityConstraint, UnifiedEntityIndex, UnifiedEntityPermission, UnifiedEntityUIConfig, UnifiedFeatureManagement, UnifiedFrontendConfig, UnifiedMenuConfig, UnifiedModuleMetadata, UnifiedPermissionConfig, UnifiedValidationRule, ValidationRule
} from './metadata.js'

export {
  METADATA_SCHEMA_VERSION,
  SUPPORTED_METADATA_VERSIONS, SUPPORTED_SCHEMA_VERSIONS,
  // 向后兼容导出
  UNIFIED_SCHEMA_VERSION, getSchemaVersion, isEntityMetadata,
  isModuleMetadata, isSchemaVersionCompatible
} from './metadata.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️ 已废弃：统一Schema类型 (Phase 1D: 请使用api-client.ts)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// API DTO类型请使用: import { EntityDefinitionDto } from '@/api/generated/api-client'
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// export type {
//   UnifiedEntityDefinition,    // 替换为: EntityDefinitionDto
//   UnifiedEntityField,          // 替换为: EntityFieldDto
//   UnifiedEntityRelationship,   // 替换为: EntityRelationDto
//   UnifiedValidationRuleType,   // 替换为: ValidationType(enum)
// } from './unified-schema.js' ← 已废弃

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 模板管理系统类型（Template Management System Types）- v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { TemplateEngine, TemplateType } from './template.js'
export type {
  Template,
  TemplateCategory,
  TemplateCompileOptions,
  TemplateExecutionResult,
  TemplateExportData,
  TemplateMarketFilter,
  TemplatePreviewConfig,
  TemplateTestCase,
  TemplateUsage,
  TemplateVariable,
  TemplateVersion
} from './template.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📚 代码生成历史类型（Generation History Types）- v1.0.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { GenerationStatus, GenerationType } from './generation-history.js'
export type {
  CodeChangeRecord, GeneratedFileRecord, GenerationHistory,
  GenerationHistoryFilter,
  GenerationHistoryStatistics, HistoryComparisonResult, MetadataSnapshot, QualityMetrics, RevertOptions,
  RevertResult
} from './generation-history.js'

