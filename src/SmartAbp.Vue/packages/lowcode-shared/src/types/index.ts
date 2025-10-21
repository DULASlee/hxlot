/**
 * 📋 Types Module Entry
 *
 * 类型定义集合入口
 *
 * @module @smartabp/lowcode-shared/types
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 前端元数据类型系统 (Phase 2B瘦身版)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type {
  EntityMetadata, // 向后兼容
  ModuleMetadata, NavigationPropertyMetadata, PropertyMetadata, RouteMetadata,
  SchemaVersion,
  StoreMetadata, UnifiedValidationRule, ValidationRule
} from './metadata'

export {
  getSchemaVersion,
  isEntityMetadata,
  isModuleMetadata,
  isSchemaVersionCompatible, METADATA_SCHEMA_VERSION,
  SUPPORTED_METADATA_VERSIONS,
  SUPPORTED_SCHEMA_VERSIONS,
  UNIFIED_SCHEMA_VERSION
} from './metadata'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🟡 已废弃：统一Schema类型（Phase 1D → Phase 3B完成后端SSOT迁移）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// 废弃日期: 2025-10-18
// 废弃原因: 已完成后端SSOT（Single Source of Truth）迁移
// 替代方案: 直接使用统一类型系统 core-types.ts 中的后端SSOT类型
//
// 📋 迁移映射表（完整）:
//   UnifiedModuleMetadata      → ModuleDto
//   UnifiedEntityDefinition    → EntityDefinitionDto
//   UnifiedEntityField         → EntityFieldDto
//   UnifiedEntityRelationship  → EntityRelationDto
//   UnifiedValidationRule      → ValidationRuleDto
//   UnifiedValidationRuleType  → ValidationType (enum)
//   UnifiedFieldType           → FieldType (enum)
//   UnifiedDatabaseConfig      → DatabaseConfig
//   UnifiedFrontendConfig      → FrontendConfig
//   UnifiedFeatureManagement   → FeatureManagement
//   UnifiedMenuConfig          → MenuConfig
//   UnifiedPermissionConfig    → PermissionConfig
//
// ✅ 正确用法:
//   import { ModuleDto, EntityDefinitionDto } from '../types/core-types'
//   const module: ModuleDto = await moduleApi.getModule(id)
//
// ❌ 错误用法（已废弃）:
//   import { UnifiedModuleMetadata } from '@smartabp/lowcode-shared'
//   import { SchemaConverter } from '@smartabp/lowcode-shared'
//
// 📖 参考文档:
//   - docs/架构设计/低代码引擎v2.0进阶版/Phase1-快速止血方案v1.1-后端SSOT修正版.md
//   - docs/架构设计/低代码引擎v2.0进阶版/Phase3-后端SSOT完整性补强报告.md
//
// ⚠️ 重要: unified-schema.ts 和 schema-converter.ts 已原地注释存档，
//          请勿删除文件（保留历史），但禁止使用！
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// export type {
//   UnifiedEntityDefinition,    // 替换为: EntityDefinitionDto
//   UnifiedEntityField,          // 替换为: EntityFieldDto
//   UnifiedEntityRelationship,   // 替换为: EntityRelationDto
//   UnifiedValidationRuleType,   // 替换为: ValidationType(enum)
// } from './unified-schema.js' ← 已废弃，文件已存档

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

