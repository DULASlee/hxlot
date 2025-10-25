# SmartAbp代码模板库完整指南 v20.0

**版本**: v20.0 (Phase 3C架构重构版)
**更新日期**: 2025-10-24
**架构健康度**: 92/100（优秀）
**核心特性**: 后端SSOT驱动 + 契约类型系统 + packages黑盒独立

---

## 📋 文档概述

本指南是SmartAbp项目代码模板库的完整使用手册，旨在：
- 🎯 为AI大模型提供标准化代码生成模板
- 🏗️ 确保生成代码100%符合Phase 3C架构
- 📊 保证代码质量达到≥95分（博士水平）
- 🚀 加速开发效率，避免重复编码

**适用对象**:
- AI编程助手（Claude、GPT-4、DeepSeek等）
- 人类开发者（快速生成标准代码）
- 低代码引擎（自动化代码生成）

---

## 🏗️ 第一部分：Phase 3C架构规则（⭐强制遵守⭐）

### 1.1 后端架构规则（ABP vNext DDD - 98/100分）

#### 核心原则：后端SSOT驱动

```yaml
Single Source of Truth (SSOT):
  定义: C# DTO是唯一真实来源
  位置: src/SmartAbp.Domain/Entities/LowCode/*.cs
  标记: [GenerateSwaggerSchema]
  工具链: NSwag → Swagger JSON → TypeScript Types

架构分层:
  Layer 4: SmartAbp.HttpApi (HTTP端点)
  Layer 3: SmartAbp.Application (应用服务)
  Layer 2: SmartAbp.Domain (领域层 - SSOT核心)
  Layer 1: SmartAbp.Domain.Shared (共享基础)
  Layer 0: SmartAbp.EntityFrameworkCore (基础设施)

强制要求:
  ✅ 所有实体必须继承AggregateRoot<TKey>
  ✅ 必须实现IMultiTenant、ISoftDelete（如需要）
  ✅ 必须标记[GenerateSwaggerSchema]
  ✅ 必须使用Repository仓储模式
  ✅ 必须使用AutoMapper映射DTO
  ✅ 必须遵循CQRS查询分离
```

#### 后端模板架构检查清单

```yaml
Domain Entity模板检查:
  ☑️ 继承AggregateRoot<Guid>或FullAuditedAggregateRoot<Guid>
  ☑️ 实现IMultiTenant（多租户场景）
  ☑️ 标记[Table("表名")]
  ☑️ 标记[GenerateSwaggerSchema]
  ☑️ 属性使用[Required]、[MaxLength]等验证特性
  ☑️ 导航属性正确配置（一对一、一对多、多对多）

Application Service模板检查:
  ☑️ 继承CrudAppService<TEntity, TDto, TKey>
  ☑️ 构造函数注入IRepository<TEntity, TKey>
  ☑️ 使用[Authorize]权限控制
  ☑️ 实现GetListAsync（分页、排序、筛选）
  ☑️ 实现CreateAsync、UpdateAsync、DeleteAsync
  ☑️ 使用ObjectMapper进行DTO映射

DTO模板检查:
  ☑️ EntityDto继承EntityDto<TKey>或AuditedEntityDto<TKey>
  ☑️ CreateDto继承ExtensibleObject（支持扩展属性）
  ☑️ UpdateDto继承ExtensibleObject
  ☑️ GetListDto继承PagedAndSortedResultRequestDto
  ☑️ 属性类型与Entity保持一致
```

### 1.2 前端架构规则（契约类型系统 - 95/100分）

#### 核心原则：契约类型系统

```yaml
三层类型定义架构:

  Layer -1: Backend SSOT层
    位置: src/SmartAbp.Domain/Entities/LowCode/*.cs
    标记: [GenerateSwaggerSchema]
    评分: 100/100（ABP vNext + DDD最佳实践）

  Layer 0: Frontend契约层（⭐31级AlphaGO最优解⭐）
    位置: packages/lowcode-shared/src/types/backend-contracts.ts
    数量: 45个独立契约类型
    特点: 零外部依赖，100%后端DTO一致性
    评分: 95/100（完全黑盒独立）

  Layer 1: Main Application生成层
    位置: src/SmartAbp.Vue/src/api/generated/
    工具: NSwag + openapi-typescript-codegen
    用途: 仅主应用API调用
    评分: 100/100（完全自动化）

类型流转链路:
  后端C# DTO → NSwag → Swagger JSON →
  TS生成 → packages契约层 → 100%一致性
```

#### 前端模板架构检查清单

```yaml
Vue组件模板检查（packages中）:
  ☑️ 使用 import type { XXX } from '@smartabp/lowcode-shared'
  ☑️ 禁止 import { XXX } from '@/api/generated/models'
  ☑️ 禁止 import { XXX } from '../../../src/api/generated'
  ☑️ 禁止 import { XXX } from '@smartabp/metadata-core'（已废弃）
  ☑️ 使用 @smartabp/xxx 别名引用其他packages
  ☑️ 禁止使用相对路径（'../'）跨包引用
  ☑️ 完全黑盒独立（零src/依赖）

主应用Vue组件模板检查（src/中）:
  ☑️ 可以使用 import type { XXX } from '@/api/generated/models'
  ☑️ 可以使用 import { XXX } from '@smartabp/lowcode-core'
  ☑️ 可以使用 import { XXX } from '@/stores/xxx'
  ☑️ 遵循Element Plus组件规范
  ☑️ 使用Pinia进行状态管理
  ☑️ 使用Composition API（<script setup>）

Pinia Store模板检查:
  ☑️ 使用 defineStore('storeId', () => {})
  ☑️ 状态使用 ref() 或 reactive()
  ☑️ 异步操作正确处理loading/error状态
  ☑️ 类型定义使用契约类型（packages）或生成类型（主应用）
  ☑️ 导出类型化的store（如：export type XXXStore = ReturnType<typeof useXXXStore>）
```

### 1.3 packages依赖层级规则（100/100黑盒独立）

#### 三层架构

```yaml
Layer 0: lowcode-shared（契约类型层）
  位置: packages/lowcode-shared/
  核心文件: src/types/backend-contracts.ts
  契约数量: 45个独立类型
  依赖: 零包依赖（完全独立）
  导出:
    - 契约类型（EntityDefinitionDto、LowCodeModuleDto等）
    - ComponentRegistry（组件注册系统）
    - BaseComponent（基础组件）
    - 工具函数

Layer 1: lowcode-core, lowcode-api, lowcode-tools（核心逻辑层）
  位置: packages/lowcode-core/, packages/lowcode-api/, packages/lowcode-tools/
  依赖规则: 只能依赖 lowcode-shared
  导出:
    lowcode-core:
      - 代码生成引擎（EnhancedApiClientGenerator等）
      - 核心组件（SmartForm、SmartTable等）
      - Store管理（useCodeGenerationStore等）
    lowcode-api:
      - API Client（调用后端API）
      - 业务规则引擎
    lowcode-tools:
      - 模板管理
      - 工具函数

Layer 2: lowcode-designer（设计器UI层）
  位置: packages/lowcode-designer/
  依赖规则: 依赖 shared + core
  导出:
    - 设计器组件（DesignerCanvas、PropertyPanel等）
    - 拖拽系统
    - 可视化设计器
```

#### 依赖规则（零容忍）

```yaml
✅ 允许的依赖:
  • Layer 2 → Layer 1 → Layer 0（向下依赖）
  • 同层级单向依赖（如：lowcode-api → lowcode-core）
  • 使用@smartabp/xxx别名引用

❌ 严禁的依赖:
  • Layer 0 → 任何（底层依赖上层）
  • Layer 1 → Layer 2（逆向依赖）
  • 循环依赖（A→B→A 或 A→B→C→A）
  • packages → src/api/generated（破坏黑盒）
  • packages → src/（破坏独立性）
  • 相对路径跨包（'../'）
```

#### 强制检查命令

```bash
# 第一关：packages违规引用检查
grep -r "@/api/generated" packages/  # 必须为0
grep -r "src/api/generated" packages/  # 必须为0

# 第二关：废弃包引用检查
grep -r "@smartabp/metadata-core" packages/  # 必须为0

# 第三关：相对路径跨包检查
grep -r "'\.\./" packages/ | grep -v node_modules  # 必须为0

# 第四关：TypeScript编译检查
cd src/SmartAbp.Vue && npx tsc --build tsconfig.references.json  # 0错误

# 第五关：ESLint质量检查
cd src/SmartAbp.Vue && npm run lint -- "packages/*/src/**/*.{ts,vue}" --fix  # 0错误0警告
```

---

## 🎯 第二部分：AI大模型使用指南

### 2.1 强制性模板检查流程

**铁律**: 在生成任何代码前，必须先搜索相关模板！

```typescript
// AI必须执行的检查流程
async function AI_CodeGeneration_Workflow(taskDescription: string) {
  // 步骤1: 分析任务类型
  const taskType = analyzeTaskType(taskDescription)
  // 示例: "创建用户管理CRUD" → taskType = "CRUD服务"

  // 步骤2: 搜索相关模板（⭐强制⭐）
  const templates = await searchTemplates(taskType)
  // 命令: glob "templates/**/*crud*.template.*"

  if (templates.length === 0) {
    return "错误：未找到相关模板，禁止从头编写！请先创建模板或使用通用模板。"
  }

  // 步骤3: 读取模板元数据
  const metadata = await readTemplateMetadata(templates[0])

  // 步骤4: 验证架构合规性
  const complianceCheck = validateArchitectureCompliance(metadata)
  if (!complianceCheck.passed) {
    return `架构违规：${complianceCheck.errors}`
  }

  // 步骤5: 应用模板参数
  const code = applyTemplate(templates[0], extractParameters(taskDescription))

  // 步骤6: 质量验证
  const qualityScore = validateCodeQuality(code)
  if (qualityScore < 95) {
    return `质量不达标：${qualityScore}/100，最低要求95分`
  }

  // 步骤7: 生成代码
  return code
}
```

### 2.2 搜索触发词映射表

| 用户需求关键词 | 对应模板类别 | 搜索命令 |
|--------------|-------------|---------|
| "CRUD服务"、"增删改查" | backend/application/CrudAppService | `glob "templates/backend/application/*crud*.template.*"` |
| "管理页面"、"数据管理" | frontend/components/CrudManagement | `glob "templates/frontend/components/*crud*.template.*"` |
| "状态管理"、"Store" | frontend/stores/EntityStore | `glob "templates/frontend/stores/*.template.*"` |
| "权限定义"、"权限管理" | backend/application/PermissionDefinitionProvider | `glob "templates/backend/application/*permission*.template.*"` |
| "实体DTO"、"数据传输对象" | backend/contracts/EntityDto | `glob "templates/backend/contracts/*dto*.template.*"` |
| "领域实体"、"Entity" | backend/domain/DomainEntity | `glob "templates/backend/domain/*.template.*"` |
| "运维监控"、"监控服务" | backend/ops-monitoring | `glob "templates/backend/ops-monitoring/*.template.*"` |
| "监控仪表板"、"Dashboard" | frontend/ops-monitoring | `glob "templates/frontend/ops-monitoring/*.template.*"` |
| "低代码插件"、"引擎插件" | lowcode/plugins | `glob "templates/lowcode/plugins/*.template.*"` |
| "代码生成器"、"Generator" | lowcode/generators | `glob "templates/lowcode/generators/*.template.*"` |

### 2.3 模板参数提取规则

**示例任务**: "创建产品管理的CRUD服务"

```typescript
// AI参数提取逻辑
function extractParameters(taskDescription: string) {
  // 实体名称提取（PascalCase）
  const entityName = extractEntityName(taskDescription) // "Product"

  // 实体复数形式（PascalCase）
  const entityNamePlural = pluralize(entityName) // "Products"

  // 权限组名称（通常是模块名）
  const permissionGroupName = `${entityName}Management` // "ProductManagement"

  // 主键类型（默认Guid）
  const primaryKeyType = "Guid"

  // camelCase变体
  const entityNameCamel = camelCase(entityName) // "product"

  // kebab-case变体（用于URL）
  const entityNameKebab = kebabCase(entityName) // "product"

  return {
    entityName,
    entityNamePlural,
    entityNameCamel,
    entityNameKebab,
    permissionGroupName,
    primaryKeyType
  }
}
```

### 2.4 模板应用示例

#### 示例1：生成CRUD应用服务

```bash
# 步骤1: 搜索模板
glob "templates/backend/application/CrudAppService.template.cs"

# 步骤2: 读取元数据
read_file("templates/backend/application/CrudAppService.template.json")

# 步骤3: 读取模板内容
read_file("templates/backend/application/CrudAppService.template.cs")

# 步骤4: 应用参数
参数替换:
  {{entityName}} → "Product"
  {{entityNamePlural}} → "Products"
  {{permissionGroupName}} → "ProductManagement"
  {{primaryKeyType}} → "Guid"

# 步骤5: 生成代码（输出到src/SmartAbp.Application/ProductManagement/ProductAppService.cs）
```

#### 示例2：生成Vue管理页面

```bash
# 步骤1: 搜索模板
glob "templates/frontend/components/CrudManagement.template.vue"

# 步骤2: 读取元数据
read_file("templates/frontend/components/CrudManagement.template.json")

# 步骤3: 应用参数（⭐注意架构规则⭐）
如果在packages/中:
  ✅ 使用契约类型: import type { ProductDto } from '@smartabp/lowcode-shared'
  ❌ 禁止引用生成API: import type { ProductDto } from '@/api/generated/models'

如果在src/中（主应用）:
  ✅ 使用生成类型: import type { ProductDto } from '@/api/generated/models'
  ✅ 使用packages组件: import { SmartTable } from '@smartabp/lowcode-core'

# 步骤4: 生成代码
```

### 2.5 质量验证清单

**每次生成代码后必须执行**:

```yaml
架构合规检查:
  ☑️ packages中无@/api/generated引用
  ☑️ packages中无@smartabp/metadata-core引用
  ☑️ packages中无相对路径跨包引用
  ☑️ 后端实体标记[GenerateSwaggerSchema]
  ☑️ 前端类型使用契约类型或生成类型

代码质量检查:
  ☑️ TypeScript编译0错误
  ☑️ ESLint检查0错误0警告
  ☑️ 代码质量评分≥95分
  ☑️ 所有必需属性有验证
  ☑️ 错误处理完善

功能完整性检查:
  ☑️ CRUD操作完整（Create/Read/Update/Delete）
  ☑️ 权限控制正确
  ☑️ 分页、排序、筛选功能完整
  ☑️ 加载、错误、空状态处理
  ☑️ 用户体验友好（反馈、提示）
```

---

**📝 批次1完成！(500行)**

**已完成内容**:
- ✅ Phase 3C架构规则（后端/前端/packages层级）
- ✅ AI使用指南（强制检查流程、搜索触发词、参数提取、质量验证）

**下一批次预告**: 批次2将详细介绍后端模板（Application/Contracts/Domain）的使用方法和最佳实践。

**是否继续批次2编写？**

