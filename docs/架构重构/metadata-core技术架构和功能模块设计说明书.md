# @smartabp/metadata-core 技术架构和功能模块设计说明书

## 📋 文档信息

**文档版本**: v1.0.0  
**创建日期**: 2025-01-27  
**文档类型**: 技术架构设计说明书  
**审核状态**: 待技术委员会审核  
**设计负责人**: AI架构团队  
**技术栈**: TypeScript 5.3+ / Zod 3.22+ / Node.js 18+

---

## 🎯 一、项目定位与目标

### 1.1 核心定位

`@smartabp/metadata-core` 是 SmartAbp 低代码平台的**元数据模型基础包**，定位为：

- 📦 **完全独立的 NPM 包**：可被任何项目单独引用
- 🎯 **纯元数据模型**：仅包含类型定义、验证器、Schema工具
- 📏 **极简设计**：代码量严格控制在 2000 行以内
- 🔗 **零依赖**：仅依赖 `zod` 和 `nanoid`，无其他外部依赖
- 🏗️ **L-1 层架构**：作为所有 packages 的最底层基础

### 1.2 设计目标

| 目标维度 | 指标 | 衡量标准 |
|---------|------|----------|
| **代码规模** | < 2000 行 | 包含所有源码和测试 |
| **包体积** | < 50KB | 压缩后的 NPM 包大小 |
| **依赖数量** | 2 个 | 仅 zod + nanoid |
| **TypeScript 严格模式** | 100% | 无 any 类型 |
| **测试覆盖率** | ≥ 90% | 单元测试覆盖 |
| **构建时间** | < 3 秒 | 完整构建时间 |
| **启动时间** | < 100ms | 包加载时间 |

### 1.3 非目标（明确不做什么）

- ❌ **不包含任何业务逻辑**：纯元数据定义
- ❌ **不包含 UI 组件**：UI 相关在 lowcode-designer
- ❌ **不包含 API 调用**：API 相关在 lowcode-api
- ❌ **不包含工具函数**：工具函数在 lowcode-shared
- ❌ **不包含状态管理**：状态管理在 lowcode-core

---

## 🏗️ 二、架构设计

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                @smartabp/metadata-core (L-1层)                   │
│                    零依赖基础元数据包                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
            ┌───────▼────────┐     ┌───────▼────────┐
            │  自动生成类型   │     │  手工验证器    │
            │  ────────────  │     │  ────────────  │
            │  quicktype     │     │  Zod Schema    │
            │  ↓             │     │  ↓             │
            │  entity.ts     │     │  validator.ts  │
            │  module.ts     │     │  ↓             │
            │  aspire.ts     │     │  实时验证      │
            └────────────────┘     └────────────────┘
                    │                       │
                    └───────────┬───────────┘
                                ▼
                    ┌───────────────────────┐
                    │   Schema工具层        │
                    │   ──────────────      │
                    │   - 版本管理          │
                    │   - 类型转换          │
                    │   - 兼容性检查        │
                    └───────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
        ┌───────────────────┐   ┌───────────────────┐
        │ @smartabp/        │   │ @smartabp/        │
        │ lowcode-shared    │   │ lowcode-api       │
        │ (L0层)            │   │ (L2层)            │
        └───────────────────┘   └───────────────────┘
```

### 2.2 分层架构

```typescript
metadata-core/
├── Layer 1: 类型定义层（自动生成）
│   - EntityMetadata
│   - ModuleMetadata
│   - AspireSolutionMetadata
│
├── Layer 2: 验证层（Zod）
│   - entityValidator
│   - moduleValidator
│   - aspireValidator
│
├── Layer 3: Schema工具层
│   - SchemaVersionManager（版本管理）
│   - TypeConverters（类型转换）
│   - CompatibilityChecker（兼容性检查）
│
└── Layer 4: 统一导出层
    - 类型、验证器、工具的统一导出
```

### 2.3 依赖关系

```
metadata-core (L-1)
    ├── zod@3.22.4         (Schema验证)
    └── nanoid@5.0.7       (ID生成)

依赖它的包：
    ├── lowcode-shared (L0) - peerDependency
    ├── lowcode-core (L1)   - dependency
    ├── lowcode-api (L2)    - dependency
    └── lowcode-designer (L2) - dependency
```

**依赖原则**：
- ✅ metadata-core 不依赖任何 SmartAbp 包
- ✅ 其他包可选择性依赖 metadata-core
- ✅ 严格单向依赖，无循环引用

---

## 📦 三、功能模块设计

### 3.1 模块总览

| 模块 | 职责 | 文件数 | 代码量 | 优先级 |
|------|------|--------|--------|--------|
| **types/generated** | 自动生成的TS类型 | 4 | ~600行 | P0 |
| **validators** | Zod验证器 | 4 | ~800行 | P0 |
| **schema** | Schema工具 | 3 | ~400行 | P1 |
| **converters** | 类型转换 | 2 | ~200行 | P2 |
| **总计** | | **13** | **~2000行** | |

### 3.2 目录结构设计

```
src/SmartAbp.Vue/packages/metadata-core/
├── src/
│   ├── types/
│   │   ├── generated/              ⬅️ 自动生成的类型（不手动编辑）
│   │   │   ├── entity-metadata.ts
│   │   │   ├── module-metadata.ts
│   │   │   ├── aspire-solution-metadata.ts
│   │   │   ├── common.ts           (共享类型)
│   │   │   └── index.ts
│   │   └── index.ts                (重新导出)
│   │
│   ├── validators/                  ⬅️ Zod验证器
│   │   ├── entity-validator.ts
│   │   ├── module-validator.ts
│   │   ├── aspire-validator.ts
│   │   └── index.ts
│   │
│   ├── schema/                      ⬅️ Schema工具
│   │   ├── version-manager.ts
│   │   ├── compatibility-checker.ts
│   │   └── index.ts
│   │
│   ├── converters/                  ⬅️ 类型转换（可选）
│   │   ├── legacy-converter.ts     (旧格式转换)
│   │   └── index.ts
│   │
│   ├── constants.ts                 ⬅️ 常量定义
│   ├── version.ts                   ⬅️ 版本信息
│   └── index.ts                     ⬅️ 统一导出
│
├── scripts/
│   └── generate-types.js            ⬅️ 类型生成脚本
│
├── __tests__/                       ⬅️ 测试（TDD）
│   ├── validators/
│   │   ├── entity-validator.spec.ts
│   │   ├── module-validator.spec.ts
│   │   └── aspire-validator.spec.ts
│   ├── schema/
│   │   ├── version-manager.spec.ts
│   │   └── compatibility-checker.spec.ts
│   └── converters/
│       └── legacy-converter.spec.ts
│
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── README.md
└── LICENSE
```

---

## 🔧 四、核心模块详细设计

### 4.1 类型定义层（types/generated）

**设计原则**：
- 100% 自动生成，不手动编辑
- 来源：后端 JSON Schema 文件
- 工具：quicktype

**EntityMetadata 类型结构**：

```typescript
/**
 * 实体元数据
 * @generated 自动生成，请勿手动修改
 */
export interface EntityMetadata {
  /** Schema版本 */
  schemaVersion?: string
  
  /** 实体名称（PascalCase） */
  name: string
  
  /** 所属模块 */
  module: string
  
  /** 聚合根名称（可选） */
  aggregate?: string
  
  /** 主键类型 */
  keyType: 'Guid' | 'int' | 'long' | 'string'
  
  /** 实体描述 */
  description?: string
  
  /** 是否为聚合根 */
  isAggregateRoot: boolean
  
  /** 是否支持多租户 */
  isMultiTenant: boolean
  
  /** 是否软删除 */
  isSoftDelete: boolean
  
  /** 是否支持扩展属性 */
  hasExtraProperties: boolean
  
  /** 属性列表 */
  properties: PropertyMetadata[]
  
  /** 导航属性列表 */
  navigationProperties?: NavigationPropertyMetadata[]
  
  /** 前端UI配置（可选） */
  xUiConfig?: UIConfig
  
  /** 后端代码生成配置（可选） */
  xBackendConfig?: BackendConfig
}

/**
 * 属性元数据
 */
export interface PropertyMetadata {
  name: string
  type: string
  isRequired: boolean
  isReadOnly: boolean
  isUnique: boolean
  maxLength?: number
  minLength?: number
  minValue?: number
  maxValue?: number
  defaultValue?: string
  description?: string
  displayName?: string
  validationRules?: ValidationRule[]
}

// ... 其他类型定义
```

**ModuleMetadata 类型结构**：

```typescript
/**
 * 模块元数据
 * @generated 自动生成，请勿手动修改
 */
export interface ModuleMetadata {
  schemaVersion?: string
  name: string
  displayName?: string
  version: string
  description?: string
  author?: string
  abpStyle: boolean
  order: number
  dependsOn: string[]
  routes: RouteMetadata[]
  stores: StoreMetadata[]
  policies: string[]
  lifecycle?: LifecycleMetadata
  features?: FeatureConfig
  menuConfig?: MenuConfig
}

// ... 子类型定义
```

**AspireSolutionMetadata 类型结构**：

```typescript
/**
 * Aspire微服务方案元数据
 * @generated 自动生成，请勿手动修改
 */
export interface AspireSolutionMetadata {
  schemaVersion?: string
  solutionName: string
  rootNamespace: string
  description?: string
  microservices: MicroserviceMetadata[]
  includeApiGateway: boolean
  infrastructure: InfrastructureConfig
  observability: ObservabilityConfig
  security?: SecurityConfig
}

// ... 子类型定义
```

**文件清单**：
- `entity-metadata.ts` (~200行)
- `module-metadata.ts` (~200行)
- `aspire-solution-metadata.ts` (~150行)
- `common.ts` (~50行，共享类型)
- `index.ts` (~10行，导出)

---

### 4.2 验证器层（validators）

**设计原则**：
- 基于 Zod 实现类型安全验证
- 提供同步验证和异步验证
- 详细的错误提示信息
- 支持自定义验证规则

**EntityValidator 实现**：

```typescript
import { z } from 'zod'
import type { EntityMetadata } from '../types/generated'

/**
 * 验证规则 Schema
 */
const ValidationRuleSchema = z.object({
  name: z.string().min(1),
  condition: z.string().min(1),
  errorMessage: z.string().min(1)
})

/**
 * 属性元数据 Schema
 */
const PropertyMetadataSchema = z.object({
  name: z.string()
    .min(1, '属性名称不能为空')
    .regex(/^[a-zA-Z][a-zA-Z0-9]*$/, '属性名称必须是有效的标识符'),
  type: z.string().min(1, '属性类型不能为空'),
  isRequired: z.boolean().default(false),
  isReadOnly: z.boolean().default(false),
  isUnique: z.boolean().default(false),
  maxLength: z.number().int().positive().optional(),
  minLength: z.number().int().nonnegative().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  defaultValue: z.string().optional(),
  description: z.string().optional(),
  displayName: z.string().optional(),
  validationRules: z.array(ValidationRuleSchema).default([])
}).refine(
  data => {
    // 自定义验证：minLength ≤ maxLength
    if (data.minLength !== undefined && data.maxLength !== undefined) {
      return data.minLength <= data.maxLength
    }
    return true
  },
  {
    message: 'minLength不能大于maxLength',
    path: ['minLength']
  }
).refine(
  data => {
    // 自定义验证：minValue ≤ maxValue
    if (data.minValue !== undefined && data.maxValue !== undefined) {
      return data.minValue <= data.maxValue
    }
    return true
  },
  {
    message: 'minValue不能大于maxValue',
    path: ['minValue']
  }
)

/**
 * 实体元数据 Schema
 */
export const EntityMetadataSchema = z.object({
  schemaVersion: z.string().default('1.0.0'),
  name: z.string()
    .min(1, '实体名称不能为空')
    .max(128, '实体名称不能超过128个字符')
    .regex(/^[A-Z][a-zA-Z0-9]*$/, '实体名称必须是PascalCase格式'),
  module: z.string()
    .min(1, '模块名称不能为空')
    .max(128, '模块名称不能超过128个字符'),
  aggregate: z.string().optional(),
  keyType: z.enum(['Guid', 'int', 'long', 'string']).default('Guid'),
  description: z.string().max(500).optional(),
  isAggregateRoot: z.boolean().default(true),
  isMultiTenant: z.boolean().default(true),
  isSoftDelete: z.boolean().default(true),
  hasExtraProperties: z.boolean().default(true),
  properties: z.array(PropertyMetadataSchema)
    .default([])
    .refine(
      props => {
        // 自定义验证：属性名称不能重复
        const names = props.map(p => p.name)
        return new Set(names).size === names.length
      },
      {
        message: '属性名称不能重复',
        path: ['properties']
      }
    ),
  navigationProperties: z.array(z.any()).optional(),
  xUiConfig: z.any().optional(),
  xBackendConfig: z.any().optional()
})

/**
 * 验证实体元数据（同步）
 * @throws ZodError 验证失败时抛出
 */
export function validateEntityMetadata(data: unknown): EntityMetadata {
  return EntityMetadataSchema.parse(data)
}

/**
 * 安全验证实体元数据
 * @returns 验证结果对象
 */
export function safeValidateEntityMetadata(data: unknown) {
  return EntityMetadataSchema.safeParse(data)
}

/**
 * 获取格式化的验证错误信息
 */
export function getEntityMetadataErrors(data: unknown): string[] {
  const result = safeValidateEntityMetadata(data)
  
  if (result.success) {
    return []
  }
  
  return result.error.errors.map(err => {
    const path = err.path.length > 0 ? `${err.path.join('.')}: ` : ''
    return `${path}${err.message}`
  })
}

/**
 * 验证实体元数据（异步，支持复杂验证）
 */
export async function validateEntityMetadataAsync(
  data: unknown
): Promise<EntityMetadata> {
  // 基础验证
  const result = EntityMetadataSchema.safeParse(data)
  
  if (!result.success) {
    throw result.error
  }
  
  // 可扩展：添加异步验证逻辑（如数据库唯一性检查）
  // ...
  
  return result.data
}
```

**ModuleValidator 实现**（类似结构）：

```typescript
export const ModuleMetadataSchema = z.object({
  // ... 完整定义
})

export function validateModuleMetadata(data: unknown): ModuleMetadata
export function safeValidateModuleMetadata(data: unknown)
export function getModuleMetadataErrors(data: unknown): string[]
```

**AspireValidator 实现**（类似结构）：

```typescript
export const AspireSolutionMetadataSchema = z.object({
  // ... 完整定义
})

export function validateAspireSolutionMetadata(data: unknown): AspireSolutionMetadata
export function safeValidateAspireSolutionMetadata(data: unknown)
export function getAspireSolutionMetadataErrors(data: unknown): string[]
```

**文件清单**：
- `entity-validator.ts` (~300行)
- `module-validator.ts` (~300行)
- `aspire-validator.ts` (~200行)
- `index.ts` (~20行)

---

### 4.3 Schema工具层（schema）

**4.3.1 版本管理器（version-manager.ts）**

```typescript
/**
 * Schema版本信息
 */
export interface SchemaVersion {
  version: string
  releaseDate: string
  status: 'current' | 'deprecated' | 'archived'
  description: string
  schemas: {
    entity: string
    module: string
    aspire: string
  }
  compatibleWith: string[]
  breakingChanges: boolean
}

/**
 * Schema版本注册表数据
 */
export interface SchemaRegistryData {
  currentVersion: string
  schemaVersions: SchemaVersion[]
}

/**
 * Schema版本管理器
 */
export class SchemaVersionManager {
  private registry: SchemaRegistryData | null = null
  
  /**
   * 加载版本注册表（内置）
   */
  loadRegistry(): SchemaRegistryData {
    if (this.registry) {
      return this.registry
    }
    
    // 内置版本注册表
    this.registry = {
      currentVersion: '1.0.0',
      schemaVersions: [
        {
          version: '1.0.0',
          releaseDate: '2025-01-27',
          status: 'current',
          description: '初始版本，统一前后端元数据模型',
          schemas: {
            entity: 'EntityMetadataSchema v1.0',
            module: 'ModuleMetadataSchema v1.0',
            aspire: 'AspireSolutionSchema v1.0'
          },
          compatibleWith: [],
          breakingChanges: false
        }
      ]
    }
    
    return this.registry
  }
  
  /**
   * 获取当前Schema版本
   */
  getCurrentVersion(): SchemaVersion {
    const registry = this.loadRegistry()
    const current = registry.schemaVersions.find(v => v.status === 'current')
    
    if (!current) {
      throw new Error('未找到当前Schema版本')
    }
    
    return current
  }
  
  /**
   * 检查版本兼容性
   */
  isCompatible(fromVersion: string, toVersion: string): boolean {
    const registry = this.loadRegistry()
    const targetVersion = registry.schemaVersions.find(v => v.version === toVersion)
    
    if (!targetVersion) {
      return false
    }
    
    // 同版本总是兼容
    if (fromVersion === toVersion) {
      return true
    }
    
    // 检查兼容性列表
    return targetVersion.compatibleWith.includes(fromVersion)
  }
  
  /**
   * 获取所有版本
   */
  getAllVersions(): SchemaVersion[] {
    const registry = this.loadRegistry()
    return registry.schemaVersions
  }
  
  /**
   * 验证版本格式（SemVer）
   */
  validateVersionFormat(version: string): boolean {
    const semverRegex = /^\d+\.\d+\.\d+$/
    return semverRegex.test(version)
  }
}

// 导出单例
export const schemaVersionManager = new SchemaVersionManager()
```

**4.3.2 兼容性检查器（compatibility-checker.ts）**

```typescript
import type { EntityMetadata, ModuleMetadata } from '../types/generated'
import { schemaVersionManager } from './version-manager'

/**
 * 兼容性检查结果
 */
export interface CompatibilityCheckResult {
  compatible: boolean
  warnings: string[]
  errors: string[]
  suggestions: string[]
}

/**
 * Schema兼容性检查器
 */
export class CompatibilityChecker {
  /**
   * 检查实体元数据兼容性
   */
  checkEntityCompatibility(
    metadata: EntityMetadata,
    targetVersion?: string
  ): CompatibilityCheckResult {
    const result: CompatibilityCheckResult = {
      compatible: true,
      warnings: [],
      errors: [],
      suggestions: []
    }
    
    // 1. 检查Schema版本
    const currentVersion = schemaVersionManager.getCurrentVersion().version
    const metadataVersion = metadata.schemaVersion || '1.0.0'
    
    if (targetVersion && !schemaVersionManager.isCompatible(metadataVersion, targetVersion)) {
      result.compatible = false
      result.errors.push(
        `元数据版本${metadataVersion}不兼容目标版本${targetVersion}`
      )
    }
    
    // 2. 检查必填字段
    if (!metadata.name) {
      result.errors.push('实体名称不能为空')
      result.compatible = false
    }
    
    if (!metadata.module) {
      result.errors.push('模块名称不能为空')
      result.compatible = false
    }
    
    // 3. 检查属性名称冲突
    const propertyNames = metadata.properties.map(p => p.name)
    const duplicates = propertyNames.filter(
      (name, index) => propertyNames.indexOf(name) !== index
    )
    
    if (duplicates.length > 0) {
      result.errors.push(`属性名称重复: ${duplicates.join(', ')}`)
      result.compatible = false
    }
    
    // 4. 提供优化建议
    if (metadata.properties.length === 0) {
      result.warnings.push('实体没有定义任何属性')
      result.suggestions.push('建议至少定义一个属性')
    }
    
    if (!metadata.description) {
      result.warnings.push('建议添加实体描述以提高可维护性')
    }
    
    return result
  }
  
  /**
   * 检查模块元数据兼容性
   */
  checkModuleCompatibility(
    metadata: ModuleMetadata,
    targetVersion?: string
  ): CompatibilityCheckResult {
    const result: CompatibilityCheckResult = {
      compatible: true,
      warnings: [],
      errors: [],
      suggestions: []
    }
    
    // 类似的检查逻辑
    // ...
    
    return result
  }
}

// 导出单例
export const compatibilityChecker = new CompatibilityChecker()
```

**文件清单**：
- `version-manager.ts` (~150行)
- `compatibility-checker.ts` (~200行)
- `index.ts` (~10行)

---

### 4.4 类型转换器层（converters）

**设计目的**：支持旧格式到新格式的平滑迁移

```typescript
import type { EntityMetadata, ModuleMetadata } from '../types/generated'

/**
 * 旧实体格式（向后兼容）
 */
export interface LegacyEntityFormat {
  name: string
  moduleName: string
  properties: Array<{
    name: string
    type: string
    required?: boolean
    maxLength?: number
  }>
}

/**
 * 旧格式转新格式
 */
export function convertLegacyEntity(legacy: LegacyEntityFormat): EntityMetadata {
  return {
    schemaVersion: '1.0.0',
    name: legacy.name,
    module: legacy.moduleName,
    keyType: 'Guid',
    isAggregateRoot: true,
    isMultiTenant: true,
    isSoftDelete: true,
    hasExtraProperties: true,
    properties: legacy.properties.map(prop => ({
      name: prop.name,
      type: prop.type,
      isRequired: prop.required ?? false,
      isReadOnly: false,
      isUnique: false,
      maxLength: prop.maxLength,
      validationRules: []
    }))
  }
}

/**
 * 批量转换
 */
export function convertLegacyEntities(
  legacyEntities: LegacyEntityFormat[]
): EntityMetadata[] {
  return legacyEntities.map(convertLegacyEntity)
}

// 类似的模块转换器
export function convertLegacyModule(legacy: any): ModuleMetadata {
  // ...
}
```

**文件清单**：
- `legacy-converter.ts` (~150行)
- `index.ts` (~10行)

---

### 4.5 常量与版本信息

**constants.ts**：

```typescript
/**
 * Schema版本常量
 */
export const SCHEMA_VERSION = '1.0.0' as const

/**
 * 包版本
 */
export const PACKAGE_VERSION = '1.0.0' as const

/**
 * 支持的实体主键类型
 */
export const KEY_TYPES = ['Guid', 'int', 'long', 'string'] as const

/**
 * 支持的属性类型
 */
export const PROPERTY_TYPES = [
  'string',
  'int',
  'long',
  'decimal',
  'double',
  'bool',
  'DateTime',
  'Guid',
  'byte[]',
  'TimeSpan',
  'DateOnly',
  'TimeOnly'
] as const

/**
 * 默认配置
 */
export const DEFAULT_ENTITY_CONFIG = {
  keyType: 'Guid',
  isAggregateRoot: true,
  isMultiTenant: true,
  isSoftDelete: true,
  hasExtraProperties: true
} as const
```

**version.ts**：

```typescript
export const VERSION = '1.0.0'
export const SCHEMA_VERSION = '1.0.0'
export const BUILD_DATE = '2025-01-27'
```

---

## 🧪 五、测试设计（TDD）

### 5.1 测试策略

| 测试类型 | 覆盖率目标 | 工具 | 优先级 |
|---------|-----------|------|--------|
| 单元测试 | ≥ 90% | Vitest | P0 |
| 集成测试 | ≥ 80% | Vitest | P1 |
| 类型测试 | 100% | tsc --noEmit | P0 |
| 性能测试 | 基准测试 | Vitest Bench | P2 |

### 5.2 测试用例设计

**EntityValidator 测试用例**：

```typescript
// __tests__/validators/entity-validator.spec.ts
import { describe, it, expect } from 'vitest'
import {
  validateEntityMetadata,
  safeValidateEntityMetadata,
  getEntityMetadataErrors
} from '../../src/validators/entity-validator'

describe('EntityValidator', () => {
  describe('基础验证', () => {
    it('应该验证通过有效的实体元数据', () => {
      const validMetadata = {
        name: 'Book',
        module: 'Library',
        keyType: 'Guid',
        isAggregateRoot: true,
        isMultiTenant: true,
        isSoftDelete: true,
        hasExtraProperties: true,
        properties: [
          {
            name: 'title',
            type: 'string',
            isRequired: true,
            isReadOnly: false,
            isUnique: false,
            maxLength: 200
          }
        ]
      }
      
      expect(() => validateEntityMetadata(validMetadata)).not.toThrow()
    })
    
    it('应该拒绝无效的实体名称（非PascalCase）', () => {
      const invalidMetadata = {
        name: 'book',  // 应该是'Book'
        module: 'Library'
      }
      
      const result = safeValidateEntityMetadata(invalidMetadata)
      expect(result.success).toBe(false)
      
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('PascalCase')
      }
    })
    
    it('应该拒绝空的实体名称', () => {
      const invalidMetadata = {
        name: '',
        module: 'Library'
      }
      
      const errors = getEntityMetadataErrors(invalidMetadata)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('实体名称不能为空')
    })
  })
  
  describe('属性验证', () => {
    it('应该拒绝重复的属性名称', () => {
      const invalidMetadata = {
        name: 'Book',
        module: 'Library',
        properties: [
          { name: 'title', type: 'string', isRequired: false, isReadOnly: false, isUnique: false },
          { name: 'title', type: 'string', isRequired: false, isReadOnly: false, isUnique: false }  // 重复
        ]
      }
      
      const errors = getEntityMetadataErrors(invalidMetadata)
      expect(errors.some(e => e.includes('属性名称不能重复'))).toBe(true)
    })
    
    it('应该验证minLength不大于maxLength', () => {
      const invalidMetadata = {
        name: 'Book',
        module: 'Library',
        properties: [
          {
            name: 'title',
            type: 'string',
            isRequired: false,
            isReadOnly: false,
            isUnique: false,
            minLength: 100,
            maxLength: 50  // minLength > maxLength
          }
        ]
      }
      
      const errors = getEntityMetadataErrors(invalidMetadata)
      expect(errors.some(e => e.includes('minLength不能大于maxLength'))).toBe(true)
    })
    
    it('应该验证属性名称格式', () => {
      const invalidMetadata = {
        name: 'Book',
        module: 'Library',
        properties: [
          {
            name: '123invalid',  // 不能以数字开头
            type: 'string',
            isRequired: false,
            isReadOnly: false,
            isUnique: false
          }
        ]
      }
      
      const errors = getEntityMetadataErrors(invalidMetadata)
      expect(errors.some(e => e.includes('有效的标识符'))).toBe(true)
    })
  })
  
  describe('类型兼容性', () => {
    it('验证结果应该符合EntityMetadata类型', () => {
      const metadata = {
        name: 'Book',
        module: 'Library',
        properties: []
      }
      
      const result = validateEntityMetadata(metadata)
      
      // TypeScript类型检查应该通过
      expect(result.name).toBe('Book')
      expect(result.module).toBe('Library')
      expect(result.keyType).toBe('Guid')  // 默认值
    })
  })
  
  describe('边界条件', () => {
    it('应该处理空属性数组', () => {
      const metadata = {
        name: 'Book',
        module: 'Library',
        properties: []
      }
      
      expect(() => validateEntityMetadata(metadata)).not.toThrow()
    })
    
    it('应该处理大量属性', () => {
      const metadata = {
        name: 'Book',
        module: 'Library',
        properties: Array.from({ length: 100 }, (_, i) => ({
          name: `property${i}`,
          type: 'string',
          isRequired: false,
          isReadOnly: false,
          isUnique: false
        }))
      }
      
      expect(() => validateEntityMetadata(metadata)).not.toThrow()
    })
    
    it('应该拒绝超长的实体名称', () => {
      const metadata = {
        name: 'A'.repeat(129),  // 超过128个字符
        module: 'Library'
      }
      
      const errors = getEntityMetadataErrors(metadata)
      expect(errors.some(e => e.includes('不能超过128个字符'))).toBe(true)
    })
  })
})
```

**测试覆盖目标**：

```
validators/
├── entity-validator.spec.ts     (30个测试用例)
├── module-validator.spec.ts     (25个测试用例)
└── aspire-validator.spec.ts     (20个测试用例)

schema/
├── version-manager.spec.ts      (15个测试用例)
└── compatibility-checker.spec.ts (20个测试用例)

converters/
└── legacy-converter.spec.ts     (10个测试用例)

总计：120个测试用例，覆盖率 ≥ 90%
```

---

## 📦 六、构建与发布

### 6.1 构建配置

**tsup.config.ts**：

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  // 入口文件
  entry: {
    index: 'src/index.ts',
    'types/index': 'src/types/index.ts',
    'validators/index': 'src/validators/index.ts',
    'schema/index': 'src/schema/index.ts'
  },
  
  // 输出格式
  format: ['cjs', 'esm'],
  
  // 生成类型声明
  dts: true,
  
  // 代码分割
  splitting: false,
  
  // 源码映射
  sourcemap: true,
  
  // 清理输出目录
  clean: true,
  
  // Tree Shaking
  treeshake: true,
  
  // 不压缩（保持可读性）
  minify: false,
  
  // 输出目录
  outDir: 'dist',
  
  // 外部依赖
  external: [],
  
  // 打包依赖
  noExternal: ['zod', 'nanoid'],
  
  // 目标平台
  platform: 'neutral',
  
  // 目标版本
  target: 'es2020'
})
```

### 6.2 package.json 配置

```json
{
  "name": "@smartabp/metadata-core",
  "version": "1.0.0",
  "description": "SmartAbp统一元数据模型核心包 - 纯类型定义和验证（零业务逻辑）",
  "keywords": [
    "smartabp",
    "metadata",
    "schema",
    "validation",
    "typescript",
    "zod",
    "code-generation",
    "low-code"
  ],
  "author": "SmartAbp Team <team@smartabp.io>",
  "homepage": "https://github.com/smartabp/smartabp",
  "license": "MIT",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./types": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/types/index.mjs",
      "require": "./dist/types/index.js"
    },
    "./validators": {
      "types": "./dist/validators/index.d.ts",
      "import": "./dist/validators/index.mjs",
      "require": "./dist/validators/index.js"
    },
    "./schema": {
      "types": "./dist/schema/index.d.ts",
      "import": "./dist/schema/index.mjs",
      "require": "./dist/schema/index.js"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/smartabp/smartabp.git",
    "directory": "src/SmartAbp.Vue/packages/metadata-core"
  },
  "bugs": {
    "url": "https://github.com/smartabp/smartabp/issues"
  },
  "scripts": {
    "build": "tsup",
    "build:watch": "tsup --watch",
    "dev": "tsup --watch",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "generate:types": "node scripts/generate-types.js",
    "prepublishOnly": "npm run type-check && npm run lint && npm run test && npm run build"
  },
  "dependencies": {
    "zod": "^3.22.4",
    "nanoid": "^5.0.7"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "typescript": "^5.3.3",
    "tsup": "^8.0.1",
    "vitest": "^1.2.0",
    "@vitest/ui": "^1.2.0",
    "@vitest/coverage-v8": "^1.2.0",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0"
  },
  "peerDependencies": {},
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 6.3 发布检查清单

```
发布前检查（prepublishOnly自动执行）：
✅ TypeScript类型检查通过
✅ ESLint检查通过
✅ 单元测试通过（覆盖率≥90%）
✅ 构建成功
✅ 包大小检查（<50KB）
✅ README文档完整
✅ LICENSE文件存在
✅ 版本号符合SemVer
✅ CHANGELOG更新
```

---

## 📊 七、性能指标

### 7.1 性能目标

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| 包加载时间 | < 100ms | `time node -e "require('@smartabp/metadata-core')"` |
| 验证性能 | < 1ms/次 | Vitest Bench |
| 包大小(gzip) | < 20KB | `npm pack && gzip -c *.tgz | wc -c` |
| 内存占用 | < 5MB | `process.memoryUsage()` |
| 构建时间 | < 3s | `time npm run build` |

### 7.2 性能测试

```typescript
// __tests__/performance/validation.bench.ts
import { bench, describe } from 'vitest'
import { validateEntityMetadata } from '../../src/validators/entity-validator'

const sampleEntity = {
  name: 'Book',
  module: 'Library',
  properties: Array.from({ length: 50 }, (_, i) => ({
    name: `property${i}`,
    type: 'string',
    isRequired: false,
    isReadOnly: false,
    isUnique: false
  }))
}

describe('Validation Performance', () => {
  bench('validateEntityMetadata (50 properties)', () => {
    validateEntityMetadata(sampleEntity)
  })
  
  bench('validateEntityMetadata (empty)', () => {
    validateEntityMetadata({ name: 'Book', module: 'Library', properties: [] })
  })
})
```

---

## 🛡️ 八、质量保证

### 8.1 代码质量标准

| 标准 | 要求 | 工具 |
|------|------|------|
| TypeScript严格模式 | 100% | tsconfig strict: true |
| 无any类型 | 0个 | ESLint noImplicitAny |
| 测试覆盖率 | ≥90% | Vitest Coverage |
| ESLint错误 | 0个 | ESLint |
| 循环复杂度 | ≤10 | ESLint complexity |
| 函数长度 | ≤50行 | ESLint max-lines-per-function |

### 8.2 持续集成

```yaml
# .github/workflows/metadata-core-ci.yml
name: metadata-core CI

on:
  push:
    paths:
      - 'src/SmartAbp.Vue/packages/metadata-core/**'
  pull_request:
    paths:
      - 'src/SmartAbp.Vue/packages/metadata-core/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: |
          cd src/SmartAbp.Vue/packages/metadata-core
          npm install
      
      - name: Type Check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm run test:coverage
      
      - name: Build
        run: npm run build
      
      - name: Size Check
        run: |
          SIZE=$(npm pack --dry-run 2>&1 | grep "Unpacked size" | awk '{print $3}')
          echo "Package size: $SIZE"
          # 检查是否超过50KB
```

---

## 📝 九、文档规范

### 9.1 README.md 结构

```markdown
# @smartabp/metadata-core

SmartAbp统一元数据模型核心包

## 特性

- ✅ 纯TypeScript类型定义
- ✅ Zod验证器支持
- ✅ Schema版本管理
- ✅ 零业务逻辑
- ✅ < 50KB包大小

## 安装

```bash
npm install @smartabp/metadata-core
```

## 使用

### 基础使用

```typescript
import { 
  type EntityMetadata,
  validateEntityMetadata 
} from '@smartabp/metadata-core'

const entity: EntityMetadata = {
  name: 'Book',
  module: 'Library',
  properties: [...]
}

// 验证
validateEntityMetadata(entity)
```

### 子路径导入

```typescript
// 仅导入类型
import type { EntityMetadata } from '@smartabp/metadata-core/types'

// 仅导入验证器
import { validateEntityMetadata } from '@smartabp/metadata-core/validators'

// 仅导入Schema工具
import { schemaVersionManager } from '@smartabp/metadata-core/schema'
```

## API文档

[完整API文档链接]

## License

MIT
```

### 9.2 API文档生成

使用TypeDoc自动生成API文档：

```bash
npm install -D typedoc
npx typedoc --out docs src/index.ts
```

---

## ✅ 十、审核清单

### 10.1 技术审核

- [ ] 架构设计符合L-1层定位
- [ ] 职责边界清晰（纯元数据，无业务逻辑）
- [ ] 代码量控制在2000行以内
- [ ] 仅依赖zod和nanoid
- [ ] 导出设计合理（支持子路径）
- [ ] TypeScript类型定义完整
- [ ] 性能指标达标

### 10.2 质量审核

- [ ] 测试覆盖率≥90%
- [ ] TDD流程完整（先测试后实现）
- [ ] 无TypeScript错误
- [ ] 无ESLint错误
- [ ] 代码质量标准达标
- [ ] 文档完整

### 10.3 集成审核

- [ ] 与lowcode-shared兼容
- [ ] 与lowcode-api兼容
- [ ] 与lowcode-core兼容
- [ ] 不破坏现有依赖关系
- [ ] 支持渐进式迁移

---

## 📈 十一、后续计划

### 11.1 版本演进

| 版本 | 功能 | 计划时间 |
|------|------|----------|
| 1.0.0 | 基础功能（本次） | 2025-Q1 |
| 1.1.0 | 增强验证规则 | 2025-Q2 |
| 1.2.0 | 支持更多元数据类型 | 2025-Q3 |
| 2.0.0 | 破坏性变更（如需要） | 2026-Q1 |

### 11.2 功能扩展

- 支持JSON Schema到Zod的自动转换
- 支持自定义验证规则插件
- 支持元数据序列化/反序列化
- 支持元数据Diff工具

---

## 🎯 十二、总结

### 12.1 核心价值

1. **极简设计**：< 2000行代码，职责清晰
2. **零依赖**：仅依赖zod和nanoid，无其他外部依赖
3. **类型安全**：100% TypeScript严格模式
4. **高性能**：< 100ms加载时间，< 1ms验证时间
5. **易用性**：支持子路径导入，API简洁

### 12.2 技术亮点

- ✨ L-1层架构定位，所有包的基础
- ✨ 自动生成类型 + 手工验证器
- ✨ Schema版本管理机制
- ✨ 完整的TDD测试覆盖
- ✨ 企业级质量标准

### 12.3 风险控制

- ✅ 独立包不污染现有代码
- ✅ 零依赖避免版本冲突
- ✅ 完整测试保证质量
- ✅ 渐进式迁移降低风险

---

**审核人签名**：_______________  
**审核日期**：_______________  
**审核结果**：[ ] 通过  [ ] 需修改  [ ] 不通过  
**修改意见**：

---

**版本**: v1.0.0  
**最后更新**: 2025-01-27  
**文档状态**: 待审核  
**下一步**: 技术委员会审核通过后，编写单元测试

