# SmartAbp LowCode Engine - Packages统一元数据模型修复计划 v1.0

**文档版本**: 1.0  
**创建日期**: 2025-10-05  
**负责团队**: SmartAbp架构团队  
**审查专家**: 世界顶级微服务企业通用低代码生成器平台专家  
**优先级**: P0（关键阻塞项）  

---

## 📋 目录

1. [问题总结](#问题总结)
2. [修复策略](#修复策略)
3. [Phase 1: 统一Schema类型库](#phase-1-统一schema类型库)
4. [Phase 2: 前端Packages重构](#phase-2-前端packages重构)
5. [Phase 3: 后端映射优化](#phase-3-后端映射优化)
6. [Phase 4: 版本管理机制](#phase-4-版本管理机制)
7. [Phase 5: 编译验证](#phase-5-编译验证)
8. [Phase 6: 文档与培训](#phase-6-文档与培训)
9. [风险管理](#风险管理)
10. [验收标准](#验收标准)

---

## 问题总结

### 🚨 核心问题

**1. 前端类型定义严重重复（5处EntityDefinition，4处ModuleMetadata）**
- **位置**: 
  - `lowcode-core/src/stores/entityModeling.ts`
  - `lowcode-api/src/types.ts`
  - `lowcode-core/src/utils/manifestWriter.ts`
  - `lowcode-core/src/types/entity-designer.ts`
  - `lowcode-designer/src/utils/uiConfigMapper.ts`
- **影响**: 类型冲突、维护困难、编译错误
- **严重性**: P0（阻塞NPM独立编译）

**2. lowcode-api完全失去类型安全**
- **代码**: `export type ModuleMetadata = any`
- **影响**: 失去TypeScript保护，运行时错误风险高
- **严重性**: P0（架构安全隐患）

**3. 前后端元数据字段不一致**
- **后端有**: `SystemName`, `ArchitecturePattern`, `DatabaseInfo` (43字段)
- **前端无**: 大部分扩展字段未定义或不匹配
- **影响**: 数据传输丢失、功能不完整
- **严重性**: P0（功能缺陷）

**4. 缺乏Schema版本管理**
- **现状**: 仅有包版本号（1.0.0），无元数据Schema版本
- **影响**: 无法实现向后兼容、升级困难
- **严重性**: P1（技术债务）

**5. 173个TODO标记未处理**
- **分布**: 46个文件
- **关键**: 6个HTTP客户端TODO（错误处理、重试逻辑）
- **严重性**: P1（功能不完整）

---

## 修复策略

### 🎯 总体原则

```yaml
1. 渐进式重构:
   - 不破坏现有功能
   - 增量替换，而非推倒重来
   - 每个Phase独立可验证

2. 类型安全优先:
   - 100% TypeScript类型覆盖
   - 严禁使用any类型
   - 运行时类型验证（Zod）

3. 前后端统一:
   - 单一事实来源（Single Source of Truth）
   - 前端TypeScript ← 自动生成 ← 后端C# DTO
   - AutoMapper双向映射

4. 版本管理:
   - Schema版本号（UNIFIED_SCHEMA_VERSION）
   - 向后兼容策略
   - 自动迁移工具
```

### 📅 总体时间线

```
Phase 1: 统一Schema类型库     [3天]  → 2025-10-08
Phase 2: 前端Packages重构     [5天]  → 2025-10-15
Phase 3: 后端映射优化         [2天]  → 2025-10-17
Phase 4: 版本管理机制         [3天]  → 2025-10-22
Phase 5: 编译验证             [2天]  → 2025-10-24
Phase 6: 文档与培训           [1天]  → 2025-10-25

总计: 16个工作日（约3周）
```

---

## Phase 1: 统一Schema类型库

**目标**: 创建前后端统一的元数据类型定义，作为单一事实来源

**时间**: 3天  
**负责人**: 前端架构师 + 后端架构师  
**优先级**: P0  

### Task 1.1: 创建统一Schema定义（1天）

**文件**: `src/SmartAbp.Vue/packages/lowcode-shared/src/types/unified-schema.ts`

```typescript
/**
 * 🔥 SmartAbp LowCode Engine - 统一元数据Schema v1.0.0
 * 
 * 这是前后端统一的单一事实来源（Single Source of Truth）
 * 
 * 规则:
 * 1. 所有前端packages必须使用此Schema
 * 2. 后端DTO通过AutoMapper映射此Schema
 * 3. 严禁在其他地方重复定义相同类型
 * 4. 新增字段必须同步更新前后端
 * 
 * @version 1.0.0
 * @author SmartAbp架构团队
 * @date 2025-10-05
 */

// ============================================================================
// Schema版本管理
// ============================================================================

/**
 * 统一Schema版本号
 * 遵循语义化版本规范: MAJOR.MINOR.PATCH
 */
export const UNIFIED_SCHEMA_VERSION = '1.0.0'

/**
 * 支持的Schema版本列表
 */
export const SUPPORTED_SCHEMA_VERSIONS = ['1.0.0']

/**
 * Schema版本信息
 */
export interface SchemaVersion {
  current: string
  supported: string[]
  deprecated: string[]
  breaking: string[]
}

// ============================================================================
// 核心元数据类型
// ============================================================================

/**
 * 统一模块元数据
 * 
 * 对应后端: ModuleMetadataDto (Dtos.cs)
 * 用途: 描述一个完整的业务模块（如ProjectManagement, Device）
 */
export interface UnifiedModuleMetadata {
  // ────────────────────────────────────────────────────────
  // 核心标识（必填）
  // ────────────────────────────────────────────────────────
  
  /** 唯一标识 (GUID) */
  id: string
  
  /** 系统名称（如 SmartConstruction, MES） */
  systemName: string
  
  /** 模块名称（如 ProjectManagement, Device） */
  name: string
  
  /** 显示名称（如 项目管理, 设备管理） */
  displayName: string
  
  /** 模块描述 */
  description: string
  
  /** 模块版本号（如 1.0.0） */
  version: string
  
  /** 命名空间（如 SmartAbp.ProjectManagement） */
  namespace: string
  
  // ────────────────────────────────────────────────────────
  // 架构配置
  // ────────────────────────────────────────────────────────
  
  /** 架构模式: CRUD | DDD | CQRS */
  architecturePattern: 'Crud' | 'DDD' | 'CQRS'
  
  /** 代码生成作者信息 */
  author: string
  
  // ────────────────────────────────────────────────────────
  // 数据库配置
  // ────────────────────────────────────────────────────────
  
  /** 数据库配置 */
  databaseInfo: UnifiedDatabaseConfig
  
  // ────────────────────────────────────────────────────────
  // 前端配置
  // ────────────────────────────────────────────────────────
  
  /** 前端配置 */
  frontend: UnifiedFrontendConfig
  
  /** 是否生成移动端页面 */
  generateMobilePages: boolean
  
  // ────────────────────────────────────────────────────────
  // 功能特性
  // ────────────────────────────────────────────────────────
  
  /** 特性管理配置 */
  featureManagement: UnifiedFeatureManagement
  
  // ────────────────────────────────────────────────────────
  // 业务数据
  // ────────────────────────────────────────────────────────
  
  /** 实体列表 */
  entities: UnifiedEntityDefinition[]
  
  /** 菜单配置 */
  menuConfig: UnifiedMenuConfig[]
  
  /** 权限配置 */
  permissionConfig: UnifiedPermissionConfig
  
  /** 依赖的其他模块 */
  dependencies: string[]
  
  // ────────────────────────────────────────────────────────
  // 元数据管理
  // ────────────────────────────────────────────────────────
  
  /** Schema版本号 */
  schemaVersion: string
  
  /** 创建时间 */
  createdAt: Date
  
  /** 更新时间 */
  updatedAt: Date
}

/**
 * 统一实体定义
 * 
 * 对应后端: EnhancedEntityModelDto (Dtos.cs)
 * 用途: 描述一个业务实体（如Project, Device）
 */
export interface UnifiedEntityDefinition {
  // ────────────────────────────────────────────────────────
  // 核心标识（必填）
  // ────────────────────────────────────────────────────────
  
  /** 唯一标识 */
  id: string
  
  /** 实体名称（PascalCase，如 Project） */
  name: string
  
  /** 显示名称（如 项目） */
  displayName: string
  
  /** 表名（如 Projects） */
  tableName: string
  
  /** 所属模块 */
  module: string
  
  /** 命名空间 */
  namespace: string
  
  /** 实体描述 */
  description: string
  
  /** 数据库Schema（如 dbo） */
  schema: string
  
  // ────────────────────────────────────────────────────────
  // DDD配置
  // ────────────────────────────────────────────────────────
  
  /** 是否聚合根 */
  isAggregateRoot: boolean
  
  /** 基类（如 FullAuditedAggregateRoot<Guid>） */
  baseClass: string
  
  /** 实现的接口 */
  interfaces: string[]
  
  // ────────────────────────────────────────────────────────
  // ABP特性
  // ────────────────────────────────────────────────────────
  
  /** 是否启用审计 */
  isAudited: boolean
  
  /** 是否软删除 */
  isSoftDelete: boolean
  
  /** 是否多租户 */
  isMultiTenant: boolean
  
  // ────────────────────────────────────────────────────────
  // 字段和关系
  // ────────────────────────────────────────────────────────
  
  /** 字段列表 */
  fields: UnifiedEntityField[]
  
  /** 关系列表 */
  relationships: UnifiedEntityRelationship[]
  
  /** 验证规则 */
  validationRules: UnifiedValidationRule[]
  
  /** 业务规则 */
  businessRules: UnifiedBusinessRule[]
  
  /** 索引配置 */
  indexes: UnifiedEntityIndex[]
  
  /** 约束配置 */
  constraints: UnifiedEntityConstraint[]
  
  // ────────────────────────────────────────────────────────
  // 权限和UI配置
  // ────────────────────────────────────────────────────────
  
  /** 权限配置 */
  permissions: UnifiedEntityPermission[]
  
  /** UI配置 */
  uiConfig: UnifiedEntityUIConfig
  
  /** 代码生成配置 */
  codeGeneration: UnifiedCodeGenerationConfig
  
  // ────────────────────────────────────────────────────────
  // 状态管理
  // ────────────────────────────────────────────────────────
  
  /** 是否完成定义 */
  isCompleted: boolean
  
  /** 标签 */
  tags: string[]
  
  // ────────────────────────────────────────────────────────
  // 元数据管理
  // ────────────────────────────────────────────────────────
  
  /** Schema版本号 */
  schemaVersion: string
  
  /** 实体版本号 */
  version: string
  
  /** 创建时间 */
  createdAt: Date
  
  /** 更新时间 */
  updatedAt: Date
}

/**
 * 统一实体字段
 * 
 * 对应后端: EntityPropertyDto (Dtos.cs)
 */
export interface UnifiedEntityField {
  /** 唯一标识 */
  id: string
  
  /** 字段名称（PascalCase，如 ProjectName） */
  name: string
  
  /** 显示名称（如 项目名称） */
  displayName: string
  
  /** 字段类型（统一类型系统） */
  type: UnifiedFieldType
  
  /** 字段描述 */
  description: string
  
  /** 帮助文本 */
  helpText: string
  
  // ────────────────────────────────────────────────────────
  // 约束
  // ────────────────────────────────────────────────────────
  
  /** 是否必填 */
  isRequired: boolean
  
  /** 是否主键 */
  isPrimaryKey: boolean
  
  /** 是否唯一 */
  isUnique: boolean
  
  /** 是否索引 */
  isIndexed: boolean
  
  /** 默认值 */
  defaultValue?: unknown
  
  /** 最大长度 */
  maxLength?: number
  
  /** 最小长度 */
  minLength?: number
  
  /** 正则模式 */
  pattern?: string
  
  /** 精度（decimal类型） */
  precision?: number
  
  /** 小数位数（decimal类型） */
  scale?: number
  
  /** 最小值（数值类型） */
  minValue?: number
  
  /** 最大值（数值类型） */
  maxValue?: number
  
  // ────────────────────────────────────────────────────────
  // 枚举配置
  // ────────────────────────────────────────────────────────
  
  /** 枚举值（如果是枚举类型） */
  enumValues: UnifiedEnumValue[]
  
  // ────────────────────────────────────────────────────────
  // 验证规则
  // ────────────────────────────────────────────────────────
  
  /** 验证规则 */
  validationRules: UnifiedValidationRule[]
  
  // ────────────────────────────────────────────────────────
  // UI配置
  // ────────────────────────────────────────────────────────
  
  /** 显示顺序 */
  displayOrder: number
  
  /** 分组名称 */
  groupName: string
  
  /** 是否可见 */
  isVisible: boolean
  
  /** 是否只读 */
  isReadonly: boolean
  
  /** 列表页是否可见 */
  listVisible: boolean
  
  /** 详情页是否可见 */
  detailVisible: boolean
  
  /** 表单页是否可见 */
  formVisible: boolean
  
  /** 是否可搜索 */
  searchable: boolean
  
  /** 是否可排序 */
  sortable: boolean
  
  /** 是否可筛选 */
  filterable: boolean
  
  /** 是否禁用 */
  disabled: boolean
  
  // ────────────────────────────────────────────────────────
  // 数据库映射
  // ────────────────────────────────────────────────────────
  
  /** 数据库列名 */
  columnName: string
  
  /** 数据库列类型 */
  columnType: string
  
  /** 是否审计字段 */
  isAuditField: boolean
  
  /** 是否软删除字段 */
  isSoftDeleteField: boolean
  
  /** 是否租户字段 */
  isTenantField: boolean
}

/**
 * 统一字段类型
 * 
 * 跨平台类型映射:
 * - C#: string → TypeScript: string → PostgreSQL: varchar
 * - C#: int → TypeScript: number → PostgreSQL: integer
 * - C#: Guid → TypeScript: string → PostgreSQL: uuid
 */
export type UnifiedFieldType = 
  // 字符串类型
  | 'string'      // C#: string, TS: string, SQL: varchar/nvarchar
  | 'text'        // C#: string, TS: string, SQL: text
  
  // 数值类型
  | 'int'         // C#: int, TS: number, SQL: integer
  | 'long'        // C#: long, TS: number, SQL: bigint
  | 'decimal'     // C#: decimal, TS: number, SQL: decimal
  | 'double'      // C#: double, TS: number, SQL: double precision
  
  // 布尔类型
  | 'bool'        // C#: bool, TS: boolean, SQL: boolean
  
  // 日期时间
  | 'DateTime'    // C#: DateTime, TS: Date, SQL: timestamp
  | 'DateOnly'    // C#: DateOnly, TS: Date, SQL: date
  | 'TimeOnly'    // C#: TimeOnly, TS: Date, SQL: time
  
  // 唯一标识
  | 'Guid'        // C#: Guid, TS: string, SQL: uuid
  
  // 枚举
  | 'enum'        // C#: enum, TS: string | number, SQL: integer
  
  // JSON
  | 'json'        // C#: object, TS: object, SQL: jsonb
  
  // 二进制
  | 'binary'      // C#: byte[], TS: Blob, SQL: bytea

/**
 * 统一验证规则
 * 
 * 对应后端: ValidationRuleDto (Dtos.cs)
 */
export interface UnifiedValidationRule {
  /** 规则唯一标识 */
  id?: string
  
  /** 字段名称 */
  fieldName: string
  
  /** 规则类型 */
  ruleType: UnifiedValidationRuleType
  
  /** 规则值（根据ruleType解释） */
  ruleValue: string
  
  /** 错误提示信息 */
  errorMessage: string
  
  /** 触发时机 */
  trigger?: 'blur' | 'change' | 'submit'
}

/**
 * 统一验证规则类型
 */
export type UnifiedValidationRuleType = 
  | 'required'    // 必填
  | 'length'      // 长度限制
  | 'range'       // 范围限制
  | 'regex'       // 正则表达式
  | 'email'       // 邮箱格式
  | 'url'         // URL格式
  | 'unique'      // 唯一性
  | 'custom'      // 自定义规则

/**
 * 统一实体关系
 */
export interface UnifiedEntityRelationship {
  id: string
  name: string
  displayName: string
  sourceEntityId: string
  targetEntityId: string
  targetEntity: string
  type: 'OneToOne' | 'OneToMany' | 'ManyToMany'
  sourceProperty: string
  targetProperty: string
  sourceNavigationProperty: string
  targetNavigationProperty: string
  description: string
}

/**
 * 统一业务规则
 */
export interface UnifiedBusinessRule {
  id: string
  name: string
  displayName: string
  description: string
  ruleType: string
  condition: string
  action: string
  priority: number
  isActive: boolean
}

/**
 * 统一枚举值
 */
export interface UnifiedEnumValue {
  name: string
  value: number | string
  displayName: string
  description?: string
}

/**
 * 统一实体索引
 */
export interface UnifiedEntityIndex {
  id: string
  name: string
  columns: string[]
  isUnique: boolean
  isClustered: boolean
}

/**
 * 统一实体约束
 */
export interface UnifiedEntityConstraint {
  id: string
  name: string
  type: string
  definition: string
}

/**
 * 统一实体权限
 */
export interface UnifiedEntityPermission {
  id: string
  name: string
  displayName: string
  description: string
  isGranted: boolean
}

/**
 * 统一实体UI配置
 */
export interface UnifiedEntityUIConfig {
  listPage: {
    pageSize: number
    sortField: string
    sortOrder: 'asc' | 'desc'
    searchFields: string[]
    displayFields: string[]
  }
  formPage: {
    layout: 'horizontal' | 'vertical' | 'inline'
    labelWidth: number
    fieldGroups: Array<{
      name: string
      displayName: string
      fields: string[]
    }>
  }
  detailPage: {
    layout: 'card' | 'tabs'
    displayFields: string[]
  }
}

/**
 * 统一代码生成配置
 */
export interface UnifiedCodeGenerationConfig {
  generateEntity: boolean
  generateDto: boolean
  generateAppService: boolean
  generateController: boolean
  generateRepository: boolean
  generateFrontend: boolean
  generateTests: boolean
}

/**
 * 统一数据库配置
 */
export interface UnifiedDatabaseConfig {
  /** 连接字符串名称 */
  connectionStringName: string
  
  /** 数据库Schema */
  schema: string
  
  /** 数据库提供程序 */
  provider: 'SqlServer' | 'PostgreSql' | 'MySql' | 'Oracle' | 'SQLite'
}

/**
 * 统一前端配置
 */
export interface UnifiedFrontendConfig {
  /** 父级菜单ID */
  parentId: string
  
  /** 路由前缀 */
  routePrefix: string
}

/**
 * 统一特性管理
 */
export interface UnifiedFeatureManagement {
  /** 是否启用 */
  isEnabled: boolean
  
  /** 默认策略 */
  defaultPolicy: string
}

/**
 * 统一菜单配置
 */
export interface UnifiedMenuConfig {
  id: string
  label: string
  icon?: string
  route?: string
  children: UnifiedMenuConfig[]
}

/**
 * 统一权限配置
 */
export interface UnifiedPermissionConfig {
  groupName: string
  permissions: Array<{
    name: string
    displayName: string
    description: string
    isGrantedByDefault: boolean
  }>
}

// ============================================================================
// 导出工具类型
// ============================================================================

/**
 * 统一API响应
 */
export interface UnifiedApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

/**
 * 统一分页请求
 */
export interface UnifiedPagedRequest {
  skipCount: number
  maxResultCount: number
  sorting?: string
  filter?: string
}

/**
 * 统一分页响应
 */
export interface UnifiedPagedResponse<T = unknown> {
  items: T[]
  totalCount: number
}

// ============================================================================
// 导出所有类型
// ============================================================================

export type {
  UnifiedModuleMetadata,
  UnifiedEntityDefinition,
  UnifiedEntityField,
  UnifiedFieldType,
  UnifiedValidationRule,
  UnifiedValidationRuleType,
  UnifiedEntityRelationship,
  UnifiedBusinessRule,
  UnifiedEnumValue,
  UnifiedEntityIndex,
  UnifiedEntityConstraint,
  UnifiedEntityPermission,
  UnifiedEntityUIConfig,
  UnifiedCodeGenerationConfig,
  UnifiedDatabaseConfig,
  UnifiedFrontendConfig,
  UnifiedFeatureManagement,
  UnifiedMenuConfig,
  UnifiedPermissionConfig,
}
```

**验收标准**:
- ✅ 文件创建成功
- ✅ TypeScript编译无错误
- ✅ JSDoc注释完整
- ✅ 所有字段对应后端DTO

### Task 1.2: 创建类型转换工具（1天）

**文件**: `src/SmartAbp.Vue/packages/lowcode-shared/src/utils/schema-converter.ts`

```typescript
/**
 * Schema类型转换工具
 * 
 * 用于前后端类型的双向转换
 */

import type {
  UnifiedModuleMetadata,
  UnifiedEntityDefinition,
  UnifiedEntityField,
  UnifiedValidationRule,
} from '../types/unified-schema'

/**
 * 后端DTO → 前端统一Schema
 */
export class SchemaConverter {
  
  /**
   * 转换ModuleMetadataDto → UnifiedModuleMetadata
   */
  static fromBackendModuleDto(dto: any): UnifiedModuleMetadata {
    return {
      id: dto.id,
      systemName: dto.systemName,
      name: dto.name,
      displayName: dto.displayName,
      description: dto.description,
      version: dto.version || '1.0.0',
      namespace: dto.namespace,
      architecturePattern: dto.architecturePattern || 'Crud',
      author: dto.author || 'SmartAbp Generator',
      databaseInfo: {
        connectionStringName: dto.databaseInfo?.connectionStringName || 'Default',
        schema: dto.databaseInfo?.schema || 'dbo',
        provider: dto.databaseInfo?.provider || 'SqlServer',
      },
      frontend: {
        parentId: dto.frontend?.parentId || '',
        routePrefix: dto.frontend?.routePrefix || '',
      },
      generateMobilePages: dto.generateMobilePages || false,
      featureManagement: {
        isEnabled: dto.featureManagement?.isEnabled || false,
        defaultPolicy: dto.featureManagement?.defaultPolicy || '',
      },
      entities: (dto.entities || []).map((e: any) => 
        SchemaConverter.fromBackendEntityDto(e)
      ),
      menuConfig: dto.menuConfig || [],
      permissionConfig: dto.permissionConfig || { groupName: '', permissions: [] },
      dependencies: dto.dependencies || [],
      schemaVersion: '1.0.0',
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
    }
  }
  
  /**
   * 转换EnhancedEntityModelDto → UnifiedEntityDefinition
   */
  static fromBackendEntityDto(dto: any): UnifiedEntityDefinition {
    return {
      id: dto.id,
      name: dto.name,
      displayName: dto.displayName,
      tableName: dto.tableName,
      module: dto.module,
      namespace: dto.namespace,
      description: dto.description || '',
      schema: dto.schema || 'dbo',
      isAggregateRoot: dto.isAggregateRoot || false,
      baseClass: dto.baseClass || 'Entity<Guid>',
      interfaces: dto.interfaces || [],
      isAudited: dto.isAudited || false,
      isSoftDelete: dto.isSoftDelete || false,
      isMultiTenant: dto.isMultiTenant || false,
      fields: (dto.properties || []).map((p: any) => 
        SchemaConverter.fromBackendPropertyDto(p)
      ),
      relationships: dto.relationships || [],
      validationRules: (dto.properties || [])
        .flatMap((p: any) => (p.validationRules || []).map((r: any) => 
          SchemaConverter.fromBackendValidationRuleDto(r, p.name)
        )),
      businessRules: dto.businessRules || [],
      indexes: dto.indexes || [],
      constraints: dto.constraints || [],
      permissions: dto.permissions || [],
      uiConfig: dto.uiConfig || {
        listPage: { pageSize: 10, sortField: 'id', sortOrder: 'desc', searchFields: [], displayFields: [] },
        formPage: { layout: 'horizontal', labelWidth: 120, fieldGroups: [] },
        detailPage: { layout: 'card', displayFields: [] },
      },
      codeGeneration: dto.codeGeneration || {
        generateEntity: true,
        generateDto: true,
        generateAppService: true,
        generateController: true,
        generateRepository: true,
        generateFrontend: true,
        generateTests: true,
      },
      isCompleted: dto.isCompleted || false,
      tags: dto.tags || [],
      schemaVersion: '1.0.0',
      version: dto.version || '1.0.0',
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
    }
  }
  
  /**
   * 转换EntityPropertyDto → UnifiedEntityField
   */
  static fromBackendPropertyDto(dto: any): UnifiedEntityField {
    return {
      id: dto.id,
      name: dto.name,
      displayName: dto.displayName,
      type: dto.type,
      description: dto.description || '',
      helpText: dto.helpText || '',
      isRequired: dto.isRequired || false,
      isPrimaryKey: dto.isKey || false,
      isUnique: dto.isUnique || false,
      isIndexed: dto.isIndexed || false,
      defaultValue: dto.defaultValue,
      maxLength: dto.maxLength,
      minLength: dto.minLength,
      pattern: dto.pattern,
      precision: dto.precision,
      scale: dto.scale,
      minValue: dto.minValue,
      maxValue: dto.maxValue,
      enumValues: dto.enumValues || [],
      validationRules: (dto.validationRules || []).map((r: any) => 
        SchemaConverter.fromBackendValidationRuleDto(r, dto.name)
      ),
      displayOrder: dto.displayOrder || 0,
      groupName: dto.groupName || '',
      isVisible: dto.isVisible !== false,
      isReadonly: dto.isReadonly || false,
      listVisible: dto.listVisible !== false,
      detailVisible: dto.detailVisible !== false,
      formVisible: dto.formVisible !== false,
      searchable: dto.searchable || false,
      sortable: dto.sortable || false,
      filterable: dto.filterable || false,
      disabled: dto.disabled || false,
      columnName: dto.columnName || dto.name,
      columnType: dto.columnType || '',
      isAuditField: dto.isAuditField || false,
      isSoftDeleteField: dto.isSoftDeleteField || false,
      isTenantField: dto.isTenantField || false,
    }
  }
  
  /**
   * 转换ValidationRuleDto → UnifiedValidationRule
   */
  static fromBackendValidationRuleDto(dto: any, fieldName: string): UnifiedValidationRule {
    return {
      id: dto.id,
      fieldName: fieldName,
      ruleType: dto.ruleType || dto.type || 'required',
      ruleValue: dto.ruleValue || dto.value?.toString() || '',
      errorMessage: dto.errorMessage || dto.message || '',
      trigger: dto.trigger || 'blur',
    }
  }
  
  /**
   * 前端统一Schema → 后端DTO
   */
  static toBackendModuleDto(schema: UnifiedModuleMetadata): any {
    return {
      id: schema.id,
      systemName: schema.systemName,
      name: schema.name,
      displayName: schema.displayName,
      description: schema.description,
      version: schema.version,
      architecturePattern: schema.architecturePattern,
      namespace: schema.namespace,
      author: schema.author,
      databaseInfo: {
        connectionStringName: schema.databaseInfo.connectionStringName,
        schema: schema.databaseInfo.schema,
        provider: schema.databaseInfo.provider,
      },
      frontend: {
        parentId: schema.frontend.parentId,
        routePrefix: schema.frontend.routePrefix,
      },
      generateMobilePages: schema.generateMobilePages,
      featureManagement: {
        isEnabled: schema.featureManagement.isEnabled,
        defaultPolicy: schema.featureManagement.defaultPolicy,
      },
      entities: schema.entities.map(e => SchemaConverter.toBackendEntityDto(e)),
      menuConfig: schema.menuConfig,
      permissionConfig: schema.permissionConfig,
      dependencies: schema.dependencies,
    }
  }
  
  /**
   * UnifiedEntityDefinition → EnhancedEntityModelDto
   */
  static toBackendEntityDto(schema: UnifiedEntityDefinition): any {
    return {
      id: schema.id,
      name: schema.name,
      displayName: schema.displayName,
      description: schema.description,
      module: schema.module,
      namespace: schema.namespace,
      isAggregateRoot: schema.isAggregateRoot,
      isAudited: schema.isAudited,
      isSoftDelete: schema.isSoftDelete,
      isMultiTenant: schema.isMultiTenant,
      baseClass: schema.baseClass,
      interfaces: schema.interfaces,
      properties: schema.fields.map(f => SchemaConverter.toBackendPropertyDto(f)),
      relationships: schema.relationships,
      tableName: schema.tableName,
      schema: schema.schema,
      indexes: schema.indexes,
      constraints: schema.constraints,
      businessRules: schema.businessRules,
      permissions: schema.permissions,
      codeGeneration: schema.codeGeneration,
      uiConfig: schema.uiConfig,
      version: schema.version,
      tags: schema.tags,
    }
  }
  
  /**
   * UnifiedEntityField → EntityPropertyDto
   */
  static toBackendPropertyDto(field: UnifiedEntityField): any {
    return {
      id: field.id,
      name: field.name,
      displayName: field.displayName,
      type: field.type,
      isRequired: field.isRequired,
      isKey: field.isPrimaryKey,
      isUnique: field.isUnique,
      isIndexed: field.isIndexed,
      defaultValue: field.defaultValue,
      description: field.description,
      helpText: field.helpText,
      maxLength: field.maxLength,
      minLength: field.minLength,
      pattern: field.pattern,
      precision: field.precision,
      scale: field.scale,
      minValue: field.minValue,
      maxValue: field.maxValue,
      enumValues: field.enumValues,
      validationRules: field.validationRules.map(r => 
        SchemaConverter.toBackendValidationRuleDto(r)
      ),
      displayOrder: field.displayOrder,
      groupName: field.groupName,
      isVisible: field.isVisible,
      isReadonly: field.isReadonly,
      listVisible: field.listVisible,
      detailVisible: field.detailVisible,
      formVisible: field.formVisible,
      searchable: field.searchable,
      sortable: field.sortable,
      filterable: field.filterable,
      disabled: field.disabled,
      columnName: field.columnName,
      columnType: field.columnType,
      isAuditField: field.isAuditField,
      isSoftDeleteField: field.isSoftDeleteField,
      isTenantField: field.isTenantField,
    }
  }
  
  /**
   * UnifiedValidationRule → ValidationRuleDto
   */
  static toBackendValidationRuleDto(rule: UnifiedValidationRule): any {
    return {
      id: rule.id,
      ruleType: rule.ruleType,
      ruleValue: rule.ruleValue,
      errorMessage: rule.errorMessage,
    }
  }
}
```

**验收标准**:
- ✅ 双向转换函数完整
- ✅ 类型安全（无any类型）
- ✅ 单元测试覆盖率100%

### Task 1.3: 更新lowcode-shared导出（0.5天）

**文件**: `src/SmartAbp.Vue/packages/lowcode-shared/src/index.ts`

```typescript
// 添加到现有导出
export * from './types/unified-schema'
export * from './utils/schema-converter'

// 更新PACKAGE_INFO
export const PACKAGE_INFO = {
  name: '@smartabp/lowcode-shared',
  version: '1.0.0',
  description: 'SmartAbp LowCode Engine Shared Library - Unified Schema v1.0.0',
  author: 'SmartAbp Team'
} as const
```

### Task 1.4: 编译验证（0.5天）

```bash
# 编译lowcode-shared
cd src/SmartAbp.Vue/packages/lowcode-shared
npm run build

# 验证类型导出
npm run type-check

# 验证无错误
echo $? # 应该输出0
```

**验收标准**:
- ✅ lowcode-shared编译成功
- ✅ 生成dist/types/unified-schema.d.ts
- ✅ 其他packages可导入类型

---

## Phase 2: 前端Packages重构

**目标**: 删除所有重复定义，统一使用lowcode-shared的类型

**时间**: 5天  
**负责人**: 前端团队  
**优先级**: P0  

### Task 2.1: lowcode-core重构（2天）

#### Step 1: 更新entityModeling.ts

**文件**: `src/SmartAbp.Vue/packages/lowcode-core/src/stores/entityModeling.ts`

```typescript
import { defineStore } from "pinia"
import { ref } from "vue"
import { getGlobalLogger, type ILogger } from "@smartabp/lowcode-shared"

// ✅ 使用统一Schema
import type {
  UnifiedEntityDefinition,
  UnifiedEntityField,
  UnifiedValidationRule,
  UnifiedEntityRelationship,
} from "@smartabp/lowcode-shared"

// ❌ 删除旧的重复定义
// export interface EntityField { ... }
// export interface ValidationRule { ... }
// export interface EntityDefinition { ... }
// export interface EntityRelation { ... }

// ✅ 创建类型别名（保持向后兼容）
export type EntityField = UnifiedEntityField
export type ValidationRule = UnifiedValidationRule
export type EntityDefinition = UnifiedEntityDefinition
export type EntityRelation = UnifiedEntityRelationship

const logger: ILogger = getGlobalLogger()

// MDI窗口配置（保留，不在统一Schema中）
export interface MDIWindowConfig {
  // ... 保持原有定义
}

// 标签页配置（保留）
export interface TabConfig {
  // ... 保持原有定义
}

// UI组件元数据（保留）
export interface UIComponentMetadata {
  // ... 保持原有定义
}

// Store实现保持不变，只是类型来自统一Schema
export const useEntityModelingStore = defineStore("entityModeling", () => {
  // ... 保持原有实现
})
```

#### Step 2: 删除entity-designer.ts中的重复定义

**文件**: `src/SmartAbp.Vue/packages/lowcode-core/src/types/entity-designer.ts`

```typescript
// ❌ 删除整个文件或重写为：

// ✅ 重新导出统一Schema
export type {
  UnifiedEntityDefinition as EntityDefinition,
  UnifiedEntityField as EntityField,
  UnifiedValidationRule as ValidationRule,
} from '@smartabp/lowcode-shared'

// 仅保留entity-designer特有的类型
export interface EntityDesignerConfig {
  // ... 特有配置
}
```

#### Step 3: 更新manifestWriter.ts

**文件**: `src/SmartAbp.Vue/packages/lowcode-core/src/utils/manifestWriter.ts`

```typescript
import type {
  UnifiedModuleMetadata,
  UnifiedEntityDefinition,
} from '@smartabp/lowcode-shared'

// ❌ 删除重复定义
// interface ModuleMetadata extends BaseModuleMetadata { ... }
// interface EntityDefinition { ... }

// ✅ 使用统一Schema或创建扩展类型
interface ManifestModuleMetadata extends UnifiedModuleMetadata {
  icon?: string
  sort?: number
}

// ... 其余实现
```

#### Step 4: 更新codeGeneration.ts

**文件**: `src/SmartAbp.Vue/packages/lowcode-core/src/stores/codeGeneration.ts`

```typescript
import { defineStore } from "pinia"
import { ref } from "vue"
import { getGlobalLogger, type ILogger } from "@smartabp/lowcode-shared"
import type { UnifiedEntityDefinition } from "@smartabp/lowcode-shared"

// Store实现中使用统一类型
export const useCodeGenerationStore = defineStore("codeGeneration", () => {
  // 将entity: any 改为 entity: UnifiedEntityDefinition
  const generateBackendFile = async (
    entity: UnifiedEntityDefinition,  // ✅ 使用统一类型
    templateId: string,
    config: CodeGenerationConfig
  ) => {
    // ... 实现
  }
  
  // ... 其余实现
})
```

**验收标准**:
- ✅ 删除所有重复的EntityDefinition定义
- ✅ 导入@smartabp/lowcode-shared类型
- ✅ npm run build成功
- ✅ npm run type-check无错误

### Task 2.2: lowcode-api重构（1天）

#### Step 1: 修复types/index.ts的any类型

**文件**: `src/SmartAbp.Vue/packages/lowcode-api/src/types/index.ts`

```typescript
// ❌ 删除所有any类型定义
// @ts-ignore - types are for documentation only
// type ApiResponse<T = any> = { data: T; success: boolean; message?: string }
// type EntityMetadata = any
// type PageMetadata = any
// export type ModuleMetadata = any

// ✅ 导入统一Schema
import type {
  UnifiedModuleMetadata,
  UnifiedEntityDefinition,
  UnifiedApiResponse,
  UnifiedPagedRequest,
  UnifiedPagedResponse,
} from '@smartabp/lowcode-shared'

// ✅ 重新导出统一类型
export type ModuleMetadata = UnifiedModuleMetadata
export type ModuleMetadataDto = UnifiedModuleMetadata
export type EntityMetadata = UnifiedEntityDefinition
export type ApiResponse<T = unknown> = UnifiedApiResponse<T>
export type QueryParams = Record<string, unknown>
export type PageMetadata = any // TODO: 待定义PageMetadata统一Schema

// ... 保留其他特有类型（DatabaseSchema等）
```

#### Step 2: 更新code-generator.ts

**文件**: `src/SmartAbp.Vue/packages/lowcode-api/src/code-generator.ts`

```typescript
import type {
  ModuleMetadata,  // 现在是UnifiedModuleMetadata
  Template,
  // ... 其他导入
} from "./types/index"
import { http } from './http-client'

// API实现自动获得类型安全保护
export const codeGeneratorApi: CodeGeneratorApi = {
  async generateModule(config: ModuleGenerationConfig): Promise<GenerationResult> {
    return await http.post<GenerationResult>('/api/code-generator/generate', config)
  },
  
  async validateModule(metadata: ModuleMetadata): Promise<{  // ✅ 现在有完整类型
    isValid: boolean
    errors: Array<{ field: string; message: string; severity: 'Error' | 'Warning' }>
    suggestions: Array<{ type: 'Naming' | 'Structure' | 'Performance'; message: string; autoFixAvailable: boolean }>
  }> {
    return http.post('/api/code-generator/validate', metadata)
  },
  
  // ... 其他方法
}
```

**验收标准**:
- ✅ 无any类型
- ✅ 所有API方法有完整类型签名
- ✅ npm run type-check通过

### Task 2.3: lowcode-designer重构（1天）

#### Step 1: 更新uiConfigMapper.ts

**文件**: `src/SmartAbp.Vue/packages/lowcode-designer/src/utils/uiConfigMapper.ts`

```typescript
// ❌ 删除重复定义
// interface ModuleMetadata { ... }

// ✅ 导入统一Schema
import type { UnifiedModuleMetadata } from '@smartabp/lowcode-shared'

// ✅ 使用统一类型
export function mapModuleToUiConfig(module: UnifiedModuleMetadata) {
  return {
    name: module.name,
    displayName: module.displayName,
    // ... 映射逻辑
  }
}
```

#### Step 2: 更新PropertyInspector.vue

**文件**: `src/SmartAbp.Vue/packages/lowcode-designer/src/components/PropertyInspector.vue`

```vue
<script setup lang="ts">
// ❌ 删除重复定义
// interface ValidationRule { ... }

// ✅ 导入统一Schema
import type { UnifiedValidationRule } from '@smartabp/lowcode-shared'

type ValidationRule = UnifiedValidationRule

// ... 组件实现
</script>
```

**验收标准**:
- ✅ 删除所有重复ModuleMetadata定义
- ✅ 删除所有重复ValidationRule定义
- ✅ npm run build成功

### Task 2.4: 单元测试更新（1天）

**更新所有测试文件的类型导入**:

```typescript
// ❌ 旧的
import type { EntityDefinition } from '../stores/entityModeling'

// ✅ 新的
import type { UnifiedEntityDefinition } from '@smartabp/lowcode-shared'
```

**验收标准**:
- ✅ 所有测试通过
- ✅ 测试覆盖率不降低

---

## Phase 3: 后端映射优化

**目标**: 实现后端DTO与前端统一Schema的自动映射

**时间**: 2天  
**负责人**: 后端团队  
**优先级**: P1  

### Task 3.1: 添加AutoMapper配置（1天）

**文件**: `src/SmartAbp.CodeGenerator/SmartAbpCodeGeneratorAutoMapperProfile.cs`

```csharp
using AutoMapper;
using SmartAbp.CodeGenerator.Services;

namespace SmartAbp.CodeGenerator
{
    /// <summary>
    /// 统一Schema AutoMapper配置
    /// 
    /// 实现前后端元数据模型的双向映射
    /// </summary>
    public partial class SmartAbpCodeGeneratorAutoMapperProfile : Profile
    {
        partial void ConfigureUnifiedSchemaMapping()
        {
            // ════════════════════════════════════════════════════════════
            // ModuleMetadataDto ↔ 前端UnifiedModuleMetadata
            // ════════════════════════════════════════════════════════════
            
            CreateMap<ModuleMetadataDto, ModuleMetadataDto>()
                .ForMember(dest => dest.SchemaVersion, opt => opt.MapFrom(src => "1.0.0"))
                .ReverseMap();
            
            // ════════════════════════════════════════════════════════════
            // EnhancedEntityModelDto ↔ 前端UnifiedEntityDefinition
            // ════════════════════════════════════════════════════════════
            
            CreateMap<EnhancedEntityModelDto, EnhancedEntityModelDto>()
                .ForMember(dest => dest.SchemaVersion, opt => opt.MapFrom(src => "1.0.0"))
                .ReverseMap();
            
            // ════════════════════════════════════════════════════════════
            // EntityPropertyDto ↔ 前端UnifiedEntityField
            // ════════════════════════════════════════════════════════════
            
            CreateMap<EntityPropertyDto, EntityPropertyDto>()
                // 字段名映射：properties → fields
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ReverseMap();
            
            // ════════════════════════════════════════════════════════════
            // ValidationRuleDto ↔ 前端UnifiedValidationRule
            // ════════════════════════════════════════════════════════════
            
            CreateMap<ValidationRuleDto, ValidationRuleDto>()
                .ReverseMap();
        }
    }
}
```

### Task 3.2: 添加Schema版本验证（0.5天）

**文件**: `src/SmartAbp.CodeGenerator/Services/SchemaVersionValidator.cs`

```csharp
using System;
using System.Collections.Generic;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// Schema版本验证器
    /// </summary>
    public class SchemaVersionValidator : ITransientDependency
    {
        private const string CURRENT_SCHEMA_VERSION = "1.0.0";
        private static readonly HashSet<string> SUPPORTED_VERSIONS = new() { "1.0.0" };
        
        /// <summary>
        /// 检查Schema版本兼容性
        /// </summary>
        public bool IsCompatible(string version)
        {
            return SUPPORTED_VERSIONS.Contains(version);
        }
        
        /// <summary>
        /// 获取当前Schema版本
        /// </summary>
        public string GetCurrentVersion()
        {
            return CURRENT_SCHEMA_VERSION;
        }
        
        /// <summary>
        /// 获取支持的Schema版本列表
        /// </summary>
        public IEnumerable<string> GetSupportedVersions()
        {
            return SUPPORTED_VERSIONS;
        }
        
        /// <summary>
        /// 验证元数据Schema版本
        /// </summary>
        public void ValidateModuleMetadata(ModuleMetadataDto metadata)
        {
            if (string.IsNullOrEmpty(metadata.Version))
            {
                throw new ArgumentException("Module metadata version is required");
            }
            
            if (!IsCompatible(metadata.Version))
            {
                throw new NotSupportedException(
                    $"Schema version {metadata.Version} is not supported. " +
                    $"Current version: {CURRENT_SCHEMA_VERSION}"
                );
            }
        }
    }
}
```

### Task 3.3: 更新API端点（0.5天）

**文件**: `src/SmartAbp.CodeGenerator/Services/CodeGenerationAppService.cs`

在现有`CodeGenerationAppService`中添加：

```csharp
private readonly SchemaVersionValidator _schemaVersionValidator;

public CodeGenerationAppService(
    // ... 现有依赖
    SchemaVersionValidator schemaVersionValidator)
{
    // ... 现有初始化
    _schemaVersionValidator = schemaVersionValidator;
}

// 新增API端点
[HttpGet("schema-version")]
public Task<SchemaVersionInfoDto> GetSchemaVersionAsync()
{
    return Task.FromResult(new SchemaVersionInfoDto
    {
        Current = _schemaVersionValidator.GetCurrentVersion(),
        Supported = _schemaVersionValidator.GetSupportedVersions().ToArray(),
        Deprecated = Array.Empty<string>()
    });
}

// 在GenerateModuleAsync开头添加版本验证
public async Task<GeneratedModuleDto> GenerateModuleAsync(ModuleMetadataDto input)
{
    // ✅ 添加Schema版本验证
    _schemaVersionValidator.ValidateModuleMetadata(input);
    
    // ... 原有实现
}
```

**验收标准**:
- ✅ AutoMapper配置编译成功
- ✅ Schema版本验证功能正常
- ✅ API端点正常返回版本信息

---

## Phase 4: 版本管理机制

**目标**: 实现完整的Schema版本控制和迁移机制

**时间**: 3天  
**负责人**: 前端架构师 + 后端架构师  
**优先级**: P1  

### Task 4.1: 前端版本管理工具（1.5天）

**文件**: `src/SmartAbp.Vue/packages/lowcode-shared/src/utils/schema-version-manager.ts`

```typescript
/**
 * Schema版本管理器
 * 
 * 功能:
 * 1. 版本兼容性检查
 * 2. 元数据版本迁移
 * 3. 运行时Schema验证
 */

import type {
  UnifiedModuleMetadata,
  UnifiedEntityDefinition,
  UNIFIED_SCHEMA_VERSION,
  SUPPORTED_SCHEMA_VERSIONS,
} from '../types/unified-schema'

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export class SchemaVersionManager {
  
  /**
   * 当前Schema版本
   */
  static readonly CURRENT_VERSION = '1.0.0'
  
  /**
   * 支持的Schema版本列表
   */
  static readonly SUPPORTED_VERSIONS = ['1.0.0']
  
  /**
   * 已废弃的Schema版本
   */
  static readonly DEPRECATED_VERSIONS: string[] = []
  
  /**
   * 检查Schema版本兼容性
   */
  static isCompatible(version: string): boolean {
    return this.SUPPORTED_VERSIONS.includes(version)
  }
  
  /**
   * 检查版本是否已废弃
   */
  static isDeprecated(version: string): boolean {
    return this.DEPRECATED_VERSIONS.includes(version)
  }
  
  /**
   * 获取版本信息
   */
  static getVersionInfo(): {
    current: string
    supported: string[]
    deprecated: string[]
  } {
    return {
      current: this.CURRENT_VERSION,
      supported: [...this.SUPPORTED_VERSIONS],
      deprecated: [...this.DEPRECATED_VERSIONS],
    }
  }
  
  /**
   * 迁移元数据到当前版本
   * 
   * @param metadata 原始元数据
   * @param fromVersion 源版本号
   * @returns 迁移后的元数据
   */
  static migrateModuleMetadata(
    metadata: any,
    fromVersion: string
  ): UnifiedModuleMetadata {
    // 如果已经是当前版本，直接返回
    if (fromVersion === this.CURRENT_VERSION) {
      return metadata as UnifiedModuleMetadata
    }
    
    // 实现版本迁移链
    let migrated = metadata
    
    // 未来版本迁移示例:
    // if (fromVersion === '0.9.0') {
    //   migrated = this.migrateFrom_0_9_0_to_1_0_0(migrated)
    // }
    
    // 设置当前Schema版本
    migrated.schemaVersion = this.CURRENT_VERSION
    
    return migrated
  }
  
  /**
   * 迁移实体定义到当前版本
   */
  static migrateEntityDefinition(
    entity: any,
    fromVersion: string
  ): UnifiedEntityDefinition {
    if (fromVersion === this.CURRENT_VERSION) {
      return entity as UnifiedEntityDefinition
    }
    
    let migrated = entity
    
    // 版本迁移逻辑
    
    migrated.schemaVersion = this.CURRENT_VERSION
    
    return migrated
  }
  
  /**
   * 验证模块元数据Schema
   * 
   * 使用Zod进行运行时类型验证
   */
  static validateModuleMetadata(
    metadata: UnifiedModuleMetadata
  ): ValidationResult {
    const errors: ValidationError[] = []
    
    // 必填字段验证
    if (!metadata.id) {
      errors.push({
        field: 'id',
        message: '模块ID不能为空',
        severity: 'error',
      })
    }
    
    if (!metadata.name) {
      errors.push({
        field: 'name',
        message: '模块名称不能为空',
        severity: 'error',
      })
    }
    
    if (!metadata.displayName) {
      errors.push({
        field: 'displayName',
        message: '显示名称不能为空',
        severity: 'error',
      })
    }
    
    // Schema版本验证
    if (!metadata.schemaVersion) {
      errors.push({
        field: 'schemaVersion',
        message: 'Schema版本号不能为空',
        severity: 'error',
      })
    } else if (!this.isCompatible(metadata.schemaVersion)) {
      errors.push({
        field: 'schemaVersion',
        message: `不支持的Schema版本: ${metadata.schemaVersion}，当前版本: ${this.CURRENT_VERSION}`,
        severity: 'error',
      })
    } else if (this.isDeprecated(metadata.schemaVersion)) {
      errors.push({
        field: 'schemaVersion',
        message: `Schema版本 ${metadata.schemaVersion} 已废弃，请升级到 ${this.CURRENT_VERSION}`,
        severity: 'warning',
      })
    }
    
    // 实体验证
    if (!metadata.entities || metadata.entities.length === 0) {
      errors.push({
        field: 'entities',
        message: '至少需要定义一个实体',
        severity: 'warning',
      })
    } else {
      metadata.entities.forEach((entity, index) => {
        const entityErrors = this.validateEntityDefinition(entity)
        errors.push(...entityErrors.errors.map(e => ({
          ...e,
          field: `entities[${index}].${e.field}`,
        })))
      })
    }
    
    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
    }
  }
  
  /**
   * 验证实体定义Schema
   */
  static validateEntityDefinition(
    entity: UnifiedEntityDefinition
  ): ValidationResult {
    const errors: ValidationError[] = []
    
    // 必填字段验证
    if (!entity.name) {
      errors.push({
        field: 'name',
        message: '实体名称不能为空',
        severity: 'error',
      })
    }
    
    if (!entity.tableName) {
      errors.push({
        field: 'tableName',
        message: '表名不能为空',
        severity: 'error',
      })
    }
    
    // 字段验证
    if (!entity.fields || entity.fields.length === 0) {
      errors.push({
        field: 'fields',
        message: '至少需要定义一个字段',
        severity: 'error',
      })
    } else {
      // 检查主键
      const primaryKeys = entity.fields.filter(f => f.isPrimaryKey)
      if (primaryKeys.length === 0) {
        errors.push({
          field: 'fields',
          message: '实体必须有主键',
          severity: 'error',
        })
      } else if (primaryKeys.length > 1) {
        errors.push({
          field: 'fields',
          message: '实体只能有一个主键',
          severity: 'warning',
        })
      }
      
      // 检查字段名重复
      const fieldNames = entity.fields.map(f => f.name)
      const duplicates = fieldNames.filter((name, index) => 
        fieldNames.indexOf(name) !== index
      )
      if (duplicates.length > 0) {
        errors.push({
          field: 'fields',
          message: `存在重复的字段名: ${duplicates.join(', ')}`,
          severity: 'error',
        })
      }
    }
    
    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
    }
  }
  
  /**
   * 添加Schema版本号到元数据
   */
  static stampVersion(metadata: UnifiedModuleMetadata): UnifiedModuleMetadata {
    return {
      ...metadata,
      schemaVersion: this.CURRENT_VERSION,
      updatedAt: new Date(),
    }
  }
}
```

### Task 4.2: 后端版本历史追踪（1天）

**文件**: `src/SmartAbp.CodeGenerator/Domain/MetadataHistory.cs`

```csharp
using System;
using Volo.Abp.Domain.Entities;

namespace SmartAbp.CodeGenerator.Domain
{
    /// <summary>
    /// 元数据版本历史
    /// 
    /// 用于追踪元数据的所有历史版本
    /// </summary>
    public class MetadataHistory : Entity<Guid>
    {
        /// <summary>
        /// 关联的MetadataStore ID
        /// </summary>
        public Guid MetadataStoreId { get; protected set; }
        
        /// <summary>
        /// 版本号
        /// </summary>
        public int Version { get; protected set; }
        
        /// <summary>
        /// Schema版本号（如 1.0.0）
        /// </summary>
        public string SchemaVersion { get; protected set; } = default!;
        
        /// <summary>
        /// 元数据JSON
        /// </summary>
        public string MetadataJson { get; protected set; } = default!;
        
        /// <summary>
        /// 变更描述
        /// </summary>
        public string ChangeDescription { get; protected set; } = default!;
        
        /// <summary>
        /// 创建时间
        /// </summary>
        public DateTime CreatedAt { get; protected set; }
        
        /// <summary>
        /// 创建人
        /// </summary>
        public string CreatedBy { get; protected set; } = default!;
        
        protected MetadataHistory()
        {
        }
        
        public MetadataHistory(
            Guid id,
            Guid metadataStoreId,
            int version,
            string schemaVersion,
            string metadataJson,
            string changeDescription,
            string createdBy) : base(id)
        {
            MetadataStoreId = metadataStoreId;
            Version = version;
            SchemaVersion = schemaVersion;
            MetadataJson = metadataJson;
            ChangeDescription = changeDescription;
            CreatedBy = createdBy;
            CreatedAt = DateTime.UtcNow;
        }
    }
}
```

**更新MetadataStore.cs**:

```csharp
public class MetadataStore : AggregateRoot<Guid>
{
    // 现有字段
    public string ModuleName { get; protected set; } = default!;
    public string MetadataJson { get; protected set; } = default!;
    public int Version { get; protected set; }
    
    // ✅ 新增字段
    public string SchemaVersion { get; protected set; } = "1.0.0";
    
    public void SetMetadataJson(string metadataJson, string changeDescription, string userId)
    {
        MetadataJson = metadataJson;
        IncrementVersion();
        
        // 创建历史记录
        AddDistributedEvent(new MetadataUpdatedEvent(
            Id,
            Version,
            SchemaVersion,
            metadataJson,
            changeDescription,
            userId
        ));
    }
    
    public void SetSchemaVersion(string schemaVersion)
    {
        SchemaVersion = schemaVersion;
    }
}
```

### Task 4.3: 集成测试（0.5天）

**测试场景**:
1. 前端发送不同Schema版本的请求
2. 后端验证版本并返回错误或成功
3. 前端自动迁移旧版本元数据
4. 后端正确存储版本历史

**验收标准**:
- ✅ 版本验证功能正常
- ✅ 版本迁移功能正常
- ✅ 版本历史记录正确

---

## Phase 5: 编译验证

**目标**: 确保所有packages独立编译成功

**时间**: 2天  
**负责人**: DevOps + 架构师  
**优先级**: P0  

### Task 5.1: Packages编译验证（1天）

```bash
#!/bin/bash
# 文件: scripts/verify-packages-build.sh

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 SmartAbp Packages编译验证"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd src/SmartAbp.Vue

# 验证lowcode-shared
echo ""
echo "📦 验证 lowcode-shared..."
cd packages/lowcode-shared
npm run build
npm run type-check
echo "✅ lowcode-shared 编译成功"
cd ../..

# 验证lowcode-core
echo ""
echo "📦 验证 lowcode-core..."
cd packages/lowcode-core
npm run build
npm run type-check
echo "✅ lowcode-core 编译成功"
cd ../..

# 验证lowcode-api
echo ""
echo "📦 验证 lowcode-api..."
cd packages/lowcode-api
npm run build
npm run type-check
echo "✅ lowcode-api 编译成功"
cd ../..

# 验证lowcode-designer
echo ""
echo "📦 验证 lowcode-designer..."
cd packages/lowcode-designer
npm run build
npm run type-check
echo "✅ lowcode-designer 编译成功"
cd ../..

# 验证lowcode-tools
echo ""
echo "📦 验证 lowcode-tools..."
cd packages/lowcode-tools
npm run build
npm run type-check
echo "✅ lowcode-tools 编译成功"
cd ../..

# 验证所有packages（使用TypeScript Project References）
echo ""
echo "📦 验证 所有packages（Project References）..."
npx tsc --build tsconfig.references.json --force
echo "✅ 所有packages编译成功"

# 架构检查
echo ""
echo "🏗️ 执行架构检查..."
cd packages/lowcode-tools
npm run check:arch
echo "✅ 架构检查通过"
cd ../..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 所有packages编译验证成功！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

### Task 5.2: 单元测试验证（0.5天）

```bash
#!/bin/bash
# 文件: scripts/verify-packages-tests.sh

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 SmartAbp Packages单元测试验证"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd src/SmartAbp.Vue/packages

# 运行所有测试
for package in lowcode-shared lowcode-core lowcode-api lowcode-designer lowcode-tools; do
  echo ""
  echo "🧪 测试 $package..."
  cd $package
  npm run test
  echo "✅ $package 测试通过"
  cd ..
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 所有单元测试验证成功！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

### Task 5.3: 端到端集成测试（0.5天）

**测试场景**:
1. 前端创建实体 → 发送到后端 → 后端生成代码 → 返回前端
2. 验证前后端元数据一致性
3. 验证类型转换正确性
4. 验证Schema版本管理

**验收标准**:
- ✅ 所有packages独立编译成功
- ✅ 所有单元测试通过（覆盖率≥80%）
- ✅ 端到端集成测试通过
- ✅ 无TypeScript类型错误

---

## Phase 6: 文档与培训

**目标**: 提供完整的文档和团队培训

**时间**: 1天  
**负责人**: 架构师 + Tech Writer  
**优先级**: P2  

### Task 6.1: 创建统一Schema文档（0.5天）

**文件**: `docs/架构文档/统一元数据Schema规范v1.0.md`

内容包括:
- Schema设计原则
- 所有类型定义说明
- 字段约束和验证规则
- 前后端类型映射表
- 版本升级指南
- 最佳实践

### Task 6.2: 创建迁移指南（0.25天）

**文件**: `docs/开发指南/从旧类型迁移到统一Schema.md`

内容包括:
- 为什么要迁移
- 迁移步骤详解
- 常见问题FAQ
- 代码示例对比

### Task 6.3: 团队培训（0.25天）

- 举办技术分享会
- 演示统一Schema的使用
- 答疑解惑

---

## 风险管理

### 🔴 高风险

**Risk #1: 重构过程中破坏现有功能**
- **概率**: 60%
- **影响**: 严重
- **缓解策略**:
  - ✅ 完整的单元测试覆盖
  - ✅ 分支开发，PR审查
  - ✅ 渐进式迁移，保持向后兼容

**Risk #2: 前后端类型映射错误导致数据丢失**
- **概率**: 40%
- **影响**: 严重
- **缓解策略**:
  - ✅ AutoMapper单元测试
  - ✅ 端到端集成测试
  - ✅ 生产环境部署前充分测试

### 🟡 中风险

**Risk #3: 时间超期**
- **概率**: 50%
- **影响**: 中
- **缓解策略**:
  - ✅ 每日站会跟踪进度
  - ✅ 提前识别阻塞点
  - ✅ 必要时调整优先级

**Risk #4: 团队学习曲线**
- **概率**: 40%
- **影响**: 中
- **缓解策略**:
  - ✅ 详细文档
  - ✅ 代码示例
  - ✅ 团队培训

---

## 验收标准

### 总体验收标准

**功能验收** ✅:
- [ ] 前端所有packages使用统一Schema
- [ ] 后端DTO与前端Schema自动映射
- [ ] 删除所有重复类型定义
- [ ] Schema版本管理机制完整

**质量验收** ✅:
- [ ] 所有packages独立编译成功（0错误）
- [ ] TypeScript类型检查100%通过
- [ ] 单元测试覆盖率≥80%
- [ ] 架构检查无违规

**性能验收** ✅:
- [ ] 编译时间无明显增加
- [ ] 运行时性能无回退
- [ ] 包体积无明显增加

**文档验收** ✅:
- [ ] 统一Schema文档完整
- [ ] 迁移指南清晰可操作
- [ ] 团队培训完成

### 分阶段验收标准

**Phase 1验收**:
- [ ] unified-schema.ts创建完成
- [ ] SchemaConverter工具完整
- [ ] lowcode-shared编译成功

**Phase 2验收**:
- [ ] lowcode-core无重复定义
- [ ] lowcode-api无any类型
- [ ] lowcode-designer无重复定义
- [ ] 所有测试通过

**Phase 3验收**:
- [ ] AutoMapper配置正确
- [ ] Schema版本验证正常
- [ ] API端点正常工作

**Phase 4验收**:
- [ ] 前端版本管理工具完整
- [ ] 后端版本历史追踪正常
- [ ] 集成测试通过

**Phase 5验收**:
- [ ] 所有packages独立编译
- [ ] 所有单元测试通过
- [ ] 端到端测试通过

**Phase 6验收**:
- [ ] 文档完整
- [ ] 团队培训完成

---

## 项目监控与报告

### 每日站会议题

1. 昨天完成了什么？
2. 今天计划做什么？
3. 有什么阻塞？
4. 风险评估变化？

### 周报内容

- 本周完成的Phase和Task
- 下周计划
- 风险和问题
- 需要的支持

### 里程碑

- **Week 1结束**: Phase 1完成
- **Week 2结束**: Phase 2+3完成
- **Week 3结束**: Phase 4+5完成，进入验收

---

## 附录

### A. 关键文件清单

**新增文件**:
1. `lowcode-shared/src/types/unified-schema.ts`
2. `lowcode-shared/src/utils/schema-converter.ts`
3. `lowcode-shared/src/utils/schema-version-manager.ts`
4. `SmartAbp.CodeGenerator/Services/SchemaVersionValidator.cs`
5. `SmartAbp.CodeGenerator/Domain/MetadataHistory.cs`

**修改文件**:
1. `lowcode-core/src/stores/entityModeling.ts`
2. `lowcode-api/src/types/index.ts`
3. `lowcode-designer/src/utils/uiConfigMapper.ts`
4. `SmartAbp.CodeGenerator/SmartAbpCodeGeneratorAutoMapperProfile.cs`
5. `SmartAbp.CodeGenerator/Services/CodeGenerationAppService.cs`

**删除文件**:
1. `lowcode-core/src/types/entity-designer.ts` (可选，或改为重新导出)

### B. 参考资源

- TypeScript官方文档: https://www.typescriptlang.org/docs/
- AutoMapper文档: https://docs.automapper.org/
- Semantic Versioning: https://semver.org/
- ABP Framework文档: https://docs.abp.io/

---

**文档结束**

**下次审查**: Phase 1完成后（预计2025-10-08）  
**问题反馈**: 提交到架构团队邮箱或Slack #architecture频道

