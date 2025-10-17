# Phase 2: 元数据模型彻底重构方案 - 100%后端SSOT

## 📋 方案概述

**目标**: 消除前后端双轨并行，实现100%后端SSOT（Single Source of Truth）

**当前问题诊断**:
```yaml
❌ 问题1: 双轨并行元数据定义
  前端metadata.ts:
    - EntityMetadata（前端元数据建模）
    - ModuleMetadata（前端模块配置）
    - UnifiedModuleMetadata（宽松版兼容）
    - PropertyMetadata、NavigationPropertyMetadata等

  后端api-client.ts:
    - EntityDefinitionDto（后端SSOT）
    - GeneratedModuleDto（后端模块）
    - EntityFieldDto、PropertyUIConfig等

  冲突: 两套平行定义，职责模糊，维护成本高

❌ 问题2: 类型不一致
  前端EntityMetadata.properties: PropertyMetadata[]
  后端EntityDefinitionDto.fields: EntityFieldDto[]

  字段名称、结构、语义完全不同！

❌ 问题3: 前端"元数据建模"伪需求
  metadata.ts声称用于"前端元数据建模"
  实际：前端不应该有独立的元数据建模！
  真相：所有元数据应该来自后端SSOT！
```

---

## 🎯 Phase 2 重构策略

### 策略核心：消除metadata.ts，100%使用api-client.ts

```yaml
重构原则:
  1. ✅ 后端Domain层 = 唯一真实源（SSOT）
  2. ✅ api-client.ts = 后端SSOT的TypeScript映射
  3. ✅ metadata.ts = 彻底废弃（除了Schema版本管理工具函数）
  4. ✅ 前端只使用api-client.ts的DTO类型
  5. ✅ 所有"元数据建模"逻辑移至后端
```

---

## 📊 Phase 2A: 类型映射与废弃清单

### 2A.1 需要废弃的前端类型（metadata.ts）

```typescript
// ❌ 完全废弃，使用api-client.ts替代
EntityMetadata → EntityDefinitionDto (api-client.ts)
PropertyMetadata → EntityFieldDto (api-client.ts)
NavigationPropertyMetadata → ? (待确认后端是否有对应DTO)
ValidationRule → ValidationRuleDto (api-client.ts)

// ❌ 完全废弃，使用后端ModuleDto
ModuleMetadata → ? (后端需要完善ModuleDto)
UnifiedModuleMetadata → ? (后端需要完善ModuleDto)

// ⚠️ 保留但重构：工具类型（非元数据）
RouteMetadata → 保留（前端特有的路由配置，非后端元数据）
StoreMetadata → 保留（前端特有的状态管理，非后端元数据）
MenuConfig → 保留（前端特有的菜单配置，非后端元数据）

// ✅ 保留：Schema版本管理工具
METADATA_SCHEMA_VERSION → 保留
getSchemaVersion() → 保留
isSchemaVersionCompatible() → 保留
```

### 2A.2 后端DTO完善需求

```csharp
// 当前后端已有（api-client.ts已生成）
✅ EntityDefinitionDto - 完整
✅ EntityFieldDto - 完整
✅ ValidationRuleDto - 完整
✅ PropertyUIConfig - 完整
✅ PageConfigDto - 完整

// ❌ 后端缺失或不完善
⚠️ ModuleDto - 缺失！需要创建
⚠️ NavigationPropertyDto - 缺失！需要创建
⚠️ RelationshipDto - 缺失！需要创建
```

---

## 🚀 Phase 2B: 渐进式迁移计划（3步走）

### Step 1: 后端DTO完善（1-2小时）

```csharp
// 1. 创建 SmartAbp.Application.Contracts/LowCode/Dtos/ModuleDto.cs
public class ModuleDto : EntityDto<Guid>
{
    public string Name { get; set; }
    public string DisplayName { get; set; }
    public string Version { get; set; }
    public string Description { get; set; }
    public string Author { get; set; }
    public bool AbpStyle { get; set; }
    public int Order { get; set; }
    public List<string> DependsOn { get; set; }
    public List<EntityDefinitionDto> Entities { get; set; }
    // ... 其他字段
}

// 2. 创建 NavigationPropertyDto
public class NavigationPropertyDto
{
    public string Name { get; set; }
    public string TargetEntity { get; set; }
    public RelationType RelationType { get; set; }
    public string ForeignKey { get; set; }
    public string InverseName { get; set; }
}

// 3. EntityDefinitionDto添加导航属性字段
public class EntityDefinitionDto
{
    // ... 现有字段
    public List<NavigationPropertyDto> NavigationProperties { get; set; }
}
```

**验证**: 重新生成swagger.json → 重新运行NSwag → 验证api-client.ts包含新DTO

---

### Step 2: 前端引用替换（2-3小时）

```typescript
// 文件: src/SmartAbp.Vue/packages/lowcode-shared/src/types/metadata.ts
// Phase 2B: 逐步废弃，只保留前端特有工具类型

// ✅ 保留：Schema版本管理
export const METADATA_SCHEMA_VERSION = '2.0.0'
export function getSchemaVersion() { ... }
export function isSchemaVersionCompatible() { ... }

// ✅ 保留：前端特有配置类型（非后端元数据）
export interface RouteMetadata { ... }  // 前端路由配置
export interface StoreMetadata { ... }  // 前端状态管理
export interface MenuConfig { ... }     // 前端菜单配置

// ❌ 废弃：所有元数据类型移至api-client.ts
// export interface EntityMetadata { ... }  ← 删除
// export interface PropertyMetadata { ... }  ← 删除
// export interface ModuleMetadata { ... }  ← 删除
// ... 所有元数据类型全部删除
```

**替换清单**（14个文件需要更新）:
```typescript
// 示例：entity-modeling.ts
// ❌ 旧代码
import type { EntityMetadata } from '@smartabp/lowcode-shared/types'

// ✅ 新代码
import type { EntityDefinitionDto } from '@/api/generated/api-client'

// ❌ 旧类型
const entity: EntityMetadata = { ... }

// ✅ 新类型
const entity: EntityDefinitionDto = { ... }
```

**需要更新的文件**（根据之前的分析）:
1. `src/SmartAbp.Vue/packages/lowcode-shared/src/composables/useValidation.ts`
2. `src/SmartAbp.Vue/packages/lowcode-shared/src/events/UnifiedEventBus.ts`
3. `src/SmartAbp.Vue/packages/lowcode-shared/src/types/generation-history.ts`
4. `src/SmartAbp.Vue/packages/lowcode-shared/src/types/template.ts`
5. `src/SmartAbp.Vue/packages/lowcode-shared/src/utils/schema-converter.ts`
6. `src/SmartAbp.Vue/packages/lowcode-shared/src/validation/entity-validator.ts`
7. `src/SmartAbp.Vue/packages/lowcode-shared/src/validation/metadata-adapter.ts`
8. `src/SmartAbp.Vue/packages/lowcode-shared/src/validation/module-validator.ts`
9. `src/SmartAbp.Vue/packages/lowcode-shared/src/validation/unified-validator.ts`
10. `src/SmartAbp.Vue/src/api/lowcode/entity-modeling.ts`
11. `src/SmartAbp.Vue/src/views/lowcode/GenerationView.vue`
12. `src/SmartAbp.Vue/src/views/lowcode/QuickStart.vue`
13. `src/SmartAbp.Vue/packages/lowcode-designer/src/views/UltraSimpleStudio.vue`
14. `src/SmartAbp.Vue/packages/lowcode-api/src/types/index.ts`

---

### Step 3: metadata.ts彻底瘦身（30分钟）

```typescript
// 文件: src/SmartAbp.Vue/packages/lowcode-shared/src/types/metadata.ts
// Phase 2 最终版：只保留前端工具类型和Schema版本管理

/**
 * 🔥 SmartAbp LowCode Engine - 前端工具类型定义
 *
 * Phase 2: 元数据类型已迁移至后端SSOT（api-client.ts）
 * 本文件只保留：
 * 1. Schema版本管理工具
 * 2. 前端特有配置类型（路由、状态、菜单）
 *
 * @version 3.0.0 (Phase 2)
 * @author SmartAbp架构团队
 */

// ============================================================================
// Schema版本管理（保留）
// ============================================================================
export const METADATA_SCHEMA_VERSION = '3.0.0'
export const SUPPORTED_METADATA_VERSIONS = ['3.0.0', '2.0.0'] as const

export interface SchemaVersion {
    current: string
    supported: readonly string[]
}

export function getSchemaVersion(): SchemaVersion {
    return {
        current: METADATA_SCHEMA_VERSION,
        supported: SUPPORTED_METADATA_VERSIONS
    }
}

export function isSchemaVersionCompatible(version: string): boolean {
    return SUPPORTED_METADATA_VERSIONS.includes(version as any)
}

// ============================================================================
// 前端特有配置类型（非后端元数据）
// ============================================================================

/**
 * 路由元数据（前端特有）
 * 说明：前端路由配置，不是后端元数据
 */
export interface RouteMetadata {
    path: string
    name: string
    component?: string
    meta?: Record<string, unknown>
    children?: RouteMetadata[]
}

/**
 * Store元数据（前端特有）
 * 说明：前端Pinia状态管理配置，不是后端元数据
 */
export interface StoreMetadata {
    name: string
    type: 'entity' | 'ui' | 'global'
    entityName?: string
}

/**
 * 菜单配置（前端特有）
 * 说明：前端Element Plus菜单配置，不是后端元数据
 */
export interface MenuConfig {
    title: string
    icon?: string
    order?: number
    route?: string
    children?: MenuConfig[]
}

// ============================================================================
// ⚠️ 后端元数据类型请使用api-client.ts
// ============================================================================
/**
 * @deprecated Phase 2: 所有元数据类型已迁移至后端SSOT
 *
 * 请使用：
 * - EntityDefinitionDto (from '@/api/generated/api-client')
 * - EntityFieldDto (from '@/api/generated/api-client')
 * - ModuleDto (from '@/api/generated/api-client')
 * - ValidationRuleDto (from '@/api/generated/api-client')
 * - PropertyUIConfig (from '@/api/generated/api-client')
 * - PageConfigDto (from '@/api/generated/api-client')
 */
```

**瘦身效果**:
- 从420行 → 约100行（减少76%）
- 删除所有重复的元数据类型
- 只保留前端特有工具类型
- 100%强制使用api-client.ts

---

## 📈 Phase 2C: 类型安全增强

### 2C.1 创建类型别名（向后兼容）

```typescript
// 文件: src/SmartAbp.Vue/packages/lowcode-shared/src/types/index.ts

// Phase 2: 类型别名（向后兼容，避免大规模breaking change）
import type {
    EntityDefinitionDto,
    EntityFieldDto,
    ValidationRuleDto,
    PropertyUIConfig,
    PageConfigDto
} from '@/api/generated/api-client'

/**
 * @deprecated Phase 2: 请直接使用 EntityDefinitionDto
 */
export type EntityMetadata = EntityDefinitionDto

/**
 * @deprecated Phase 2: 请直接使用 EntityFieldDto
 */
export type PropertyMetadata = EntityFieldDto

/**
 * @deprecated Phase 2: 请直接使用 ValidationRuleDto
 */
export type ValidationRule = ValidationRuleDto

// 导出后端SSOT类型
export type {
    EntityDefinitionDto,
    EntityFieldDto,
    ValidationRuleDto,
    PropertyUIConfig,
    PageConfigDto
} from '@/api/generated/api-client'

// 前端特有类型
export type {
    RouteMetadata,
    StoreMetadata,
    MenuConfig,
    SchemaVersion
} from './metadata'

export {
    METADATA_SCHEMA_VERSION,
    getSchemaVersion,
    isSchemaVersionCompatible
} from './metadata'
```

---

## ✅ Phase 2 验收标准

```yaml
架构验证:
  ✅ metadata.ts只包含前端工具类型（<100行）
  ✅ 0个元数据类型在metadata.ts中定义
  ✅ 100%元数据类型来自api-client.ts（后端SSOT）
  ✅ 后端ModuleDto、NavigationPropertyDto已创建

编译验证:
  ✅ TypeScript编译: 0错误
  ✅ ESLint: 0错误0警告
  ✅ 所有引用已更新为api-client.ts类型

功能验证:
  ✅ 实体建模功能正常
  ✅ 代码生成功能正常
  ✅ 页面配置功能正常
  ✅ 验证器功能正常

文档验证:
  ✅ ADR文档更新：后端100% SSOT
  ✅ 类型映射表完整
  ✅ 迁移指南清晰
```

---

## 🎯 执行时间线

```yaml
Phase 2A: 后端DTO完善
  时间: 1-2小时
  责任: 后端开发
  产出: ModuleDto, NavigationPropertyDto, 更新的swagger.json

Phase 2B: 前端类型替换
  时间: 2-3小时
  责任: 前端开发
  产出: 14个文件更新，100%使用api-client.ts

Phase 2C: metadata.ts瘦身
  时间: 30分钟
  责任: 架构师
  产出: metadata.ts瘦身至<100行

总计: 4-6小时
```

---

## 🚨 风险与缓解

```yaml
风险1: 后端ModuleDto字段不完整
  缓解: 先分析现有前端ModuleMetadata使用场景，确保ModuleDto包含所有必需字段

风险2: 大规模类型替换导致编译错误
  缓解: 渐进式替换，先创建类型别名，再逐步废弃旧类型

风险3: api-client.ts类型不够前端友好
  缓解: 在前端创建Adapter层，但类型定义100%来自api-client.ts
```

---

## 🎉 Phase 2 成功标志

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 100%后端SSOT架构成功！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

后端Domain层（唯一真实源）
    ↓
Swagger生成swagger.json
    ↓
NSwag生成api-client.ts
    ↓
前端100%使用api-client.ts类型
    ↓
0个元数据类型在前端定义
    ↓
100%类型安全，100%同步，0维护成本！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

**准备开始Phase 2A：后端DTO完善！**

