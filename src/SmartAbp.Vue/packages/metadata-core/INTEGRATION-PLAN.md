# metadata-core 集成实施计划

> **目标**：将metadata-core深度集成到SmartAbp低代码平台，形成完整的元数据驱动体系  
> **开始日期**：2025-10-06  
> **预计完成**：2025-11-06（1个月）

---

## 📋 **总体目标**

### **核心目标**

1. ✅ **统一类型定义**：所有packages从metadata-core导入类型
2. ✅ **前端验证**：在lowcode-core中集成metadata-core验证
3. ✅ **后端支持**：SmartAbp.CodeGenerator支持metadata-core格式
4. ✅ **消除重复**：删除各处重复的类型定义

### **成功标准**

- [ ] 所有packages成功导入metadata-core类型
- [ ] lowcode-core代码生成前自动验证
- [ ] 后端API支持metadata-core格式输入
- [ ] 测试覆盖率≥95%
- [ ] 文档完整且准确
- [ ] 零破坏性变更（向后兼容）

---

## 🗓️ **三阶段实施计划**

### **Phase 1: 紧急修正（已完成）**

**时间**：2025-10-06（1天）

**任务**：
- [x] 修正README.md（删除虚假的代码生成描述）
- [x] 修正package.json（更新description和keywords）
- [x] 创建ARCHITECTURE.md（架构说明文档）
- [x] 创建REAL-CAPABILITIES.md（真实能力清单）
- [x] 创建INTEGRATION-PLAN.md（本文档）

**成果**：
- ✅ 文档准确反映真实能力
- ✅ 避免未来混淆
- ✅ 明确集成路线图

---

### **Phase 2: 深度集成（1周）**

**时间**：2025-10-07 ~ 2025-10-13

#### **Task 2.1: 统一类型定义**（2天）

**目标**：将分散的类型定义迁移到metadata-core

**步骤**：

1. **分析现有类型重复**：
   ```bash
   # 查找重复的Entity类型定义
   grep -r "interface.*Entity" src/SmartAbp.Vue/packages/*/src/types/
   
   # 查找重复的Module类型定义
   grep -r "interface.*Module" src/SmartAbp.Vue/packages/*/src/types/
   ```

2. **迁移计划**：
   ```yaml
   从lowcode-shared迁移:
     - types/entity.ts → metadata-core/types/
     - types/module.ts → metadata-core/types/
   
   从lowcode-core迁移:
     - stores/types.ts中的元数据类型 → metadata-core/types/
   
   删除重复:
     - lowcode-designer中的重复类型定义
   ```

3. **更新导入语句**：
   ```typescript
   // 全局替换
   // 从: import { EntityMetadata } from '@/types/entity'
   // 到: import type { EntityMetadata } from '@smartabp/metadata-core'
   ```

**验收标准**：
- [ ] 所有packages使用metadata-core的类型
- [ ] 无类型重复定义
- [ ] TypeScript编译0错误

#### **Task 2.2: lowcode-core集成验证**（2天）

**目标**：在代码生成前自动验证元数据

**实现**：

```typescript
// lowcode-core/src/stores/codeGeneration.ts

import { validateEntityMetadata, getEntityMetadataErrors } from '@smartabp/metadata-core'

// 修改generateBackendFile函数
const generateBackendFile = async (
  entity: any,
  templateId: string,
  config: CodeGenerationConfig
) => {
  try {
    // 🔥 新增：生成前先验证
    try {
      const validated = validateEntityMetadata(entity)
      // 使用验证后的entity
      entity = validated
    } catch (validationError) {
      const errors = getEntityMetadataErrors(entity)
      logger.error('实体验证失败', { errors })
      throw new Error(`实体验证失败: ${errors.join(', ')}`)
    }
    
    // 原有的代码生成逻辑
    let content = ""
    let filename = ""
    let directory = ""

    switch (templateId) {
      case "entity":
        content = generateEntityClass(entity, config)
        // ...
    }
    
    return { path, content, type, size }
  } catch (err) {
    logger.error(`生成后端文件失败: ${templateId}`, { entity: entity.name })
    return null
  }
}

// 同样修改generateFrontendFile函数
const generateFrontendFile = async (/* ... */) => {
  // 🔥 新增：生成前先验证
  const validated = validateEntityMetadata(entity)
  
  // 原有逻辑...
}
```

**验收标准**：
- [ ] 所有代码生成前自动验证
- [ ] 验证失败时友好的错误提示
- [ ] 测试覆盖新增的验证逻辑

#### **Task 2.3: 添加后端格式转换**（1天）

**目标**：metadata-core支持输出后端格式

**实现**：

```typescript
// metadata-core/src/converters/to-backend-dto.ts

import type { ModuleMetadata, EntityMetadata } from '../types'

/**
 * 转换为SmartAbp.CodeGenerator需要的格式
 */
export function toModuleMetadataDto(metadata: ModuleMetadata): any {
  return {
    Id: generateId(),
    SystemName: extractSystemName(metadata.name),
    Name: metadata.name,
    DisplayName: metadata.displayName || metadata.name,
    Description: metadata.description || '',
    Version: metadata.version,
    ArchitecturePattern: 'Crud',
    Namespace: `SmartAbp.${metadata.name}`,
    Author: metadata.author || 'SmartAbp Generator',
    DatabaseInfo: {
      ConnectionStringName: 'Default',
      Schema: 'dbo',
      Provider: 'PostgreSQL'
    },
    FeatureManagement: {
      IsEnabled: false,
      DefaultPolicy: ''
    },
    Frontend: {
      ParentId: null,
      RoutePrefix: `/${metadata.name.toLowerCase()}`
    },
    GenerateMobilePages: false,
    Dependencies: metadata.dependsOn || [],
    Entities: [], // 需要转换entities
    MenuConfig: convertMenuConfig(metadata.menuConfig),
    PermissionConfig: {
      Groups: [],
      CustomActions: []
    }
  }
}

export function toEntityMetadataDto(entity: EntityMetadata): any {
  return {
    Id: generateId(),
    Name: entity.name,
    DisplayName: entity.name,
    Description: entity.description || '',
    Module: entity.module,
    Namespace: `SmartAbp.${entity.module}`,
    IsAggregateRoot: entity.isAggregateRoot,
    IsAudited: true,
    IsSoftDelete: entity.isSoftDelete,
    IsMultiTenant: entity.isMultiTenant,
    BaseClass: 'FullAuditedAggregateRoot<Guid>',
    Interfaces: [],
    Properties: entity.properties.map(toPropertyDto),
    Relationships: [],
    TableName: entity.name + 's',
    Schema: 'dbo',
    // ... 其他字段
  }
}

function toPropertyDto(prop: PropertyMetadata): any {
  return {
    Id: generateId(),
    Name: prop.name,
    DisplayName: prop.displayName || prop.name,
    Type: prop.type,
    IsRequired: prop.isRequired,
    IsKey: prop.name === 'Id',
    IsUnique: prop.isUnique,
    MaxLength: prop.maxLength,
    MinLength: prop.minLength,
    MinValue: prop.minValue,
    MaxValue: prop.maxValue,
    DefaultValue: prop.defaultValue,
    Description: prop.description || '',
    // ... 其他字段
  }
}
```

**验收标准**：
- [ ] 转换函数完整实现
- [ ] 100%字段映射
- [ ] 单元测试覆盖

#### **Task 2.4: 更新package依赖**（1天）

**目标**：建立正确的依赖关系

**步骤**：

1. **lowcode-shared添加peer依赖**：
   ```json
   // lowcode-shared/package.json
   {
     "peerDependencies": {
       "@smartabp/metadata-core": "^1.0.0"
     }
   }
   ```

2. **lowcode-core添加依赖**：
   ```json
   // lowcode-core/package.json
   {
     "dependencies": {
       "@smartabp/metadata-core": "workspace:*"
     }
   }
   ```

3. **更新tsconfig.json**：
   ```json
   // lowcode-core/tsconfig.json
   {
     "compilerOptions": {
       "paths": {
         "@smartabp/metadata-core": ["../metadata-core/src"]
       }
     }
   }
   ```

**验收标准**：
- [ ] npm run build成功
- [ ] TypeScript编译0错误
- [ ] packages依赖关系正确

---

### **Phase 3: 能力增强（2-3周）**

**时间**：2025-10-14 ~ 2025-11-06

#### **Task 3.1: Schema注册中心**（1周）

**目标**：运行时管理所有Schema

**实现**：

```typescript
// metadata-core/src/schema/schema-registry.ts（已存在，需增强）

export class SchemaRegistry {
  private entities = new Map<string, EntityMetadata>()
  private modules = new Map<string, ModuleMetadata>()
  
  // 新增：批量注册
  registerBatch(schemas: Array<EntityMetadata | ModuleMetadata>) {
    for (const schema of schemas) {
      if ('properties' in schema) {
        this.registerEntity(schema)
      } else if ('routes' in schema) {
        this.registerModule(schema)
      }
    }
  }
  
  // 新增：查询所有
  getAllEntities(): EntityMetadata[] {
    return Array.from(this.entities.values())
  }
  
  // 新增：按模块查询
  getEntitiesByModule(moduleName: string): EntityMetadata[] {
    return this.getAllEntities()
      .filter(e => e.module === moduleName)
  }
  
  // 新增：统计信息
  getStats() {
    return {
      totalEntities: this.entities.size,
      totalModules: this.modules.size,
      moduleBreakdown: this.getModuleBreakdown()
    }
  }
}
```

**应用场景**：
```typescript
// 应用启动时注册所有Schema
import { getRegistry } from '@smartabp/metadata-core'

function initializeSchemas() {
  const registry = getRegistry()
  
  // 批量注册
  registry.registerBatch([
    bookEntity,
    authorEntity,
    orderEntity,
    libraryModule,
    storeModule
  ])
  
  console.log('已注册Schema:', registry.getStats())
}
```

#### **Task 3.2: 增量更新检测**（1周）

**目标**：基于Schema diff判断是否需要重新生成代码

**实现**：

```typescript
// metadata-core/src/schema/incremental-detector.ts（新建）

import { diffEntitySchema } from './schema-diff'
import type { EntityMetadata } from '../types'

export interface IncrementalDetectionResult {
  needsRegeneration: boolean
  reason?: string
  affectedFiles?: string[]
  recommendedAction?: 'full' | 'partial' | 'skip'
}

/**
 * 检测是否需要重新生成代码
 */
export function detectRegenerationNeed(
  oldSchema: EntityMetadata,
  newSchema: EntityMetadata
): IncrementalDetectionResult {
  // 计算差异
  const diff = diffEntitySchema(oldSchema, newSchema)
  
  // 无变化，跳过
  if (diff.added.length === 0 && 
      diff.modified.length === 0 && 
      diff.removed.length === 0) {
    return {
      needsRegeneration: false,
      reason: 'Schema无变化',
      recommendedAction: 'skip'
    }
  }
  
  // 只有UI配置变化，只需重新生成前端
  if (isOnlyUIConfigChange(diff)) {
    return {
      needsRegeneration: true,
      reason: 'UI配置变化',
      affectedFiles: ['frontend'],
      recommendedAction: 'partial'
    }
  }
  
  // 属性变化，需要全量重新生成
  if (diff.modified.some(m => m.path.includes('properties'))) {
    return {
      needsRegeneration: true,
      reason: '实体属性变化',
      affectedFiles: ['entity', 'dto', 'frontend', 'migration'],
      recommendedAction: 'full'
    }
  }
  
  return {
    needsRegeneration: true,
    recommendedAction: 'full'
  }
}
```

**应用场景**：
```typescript
// lowcode-designer中使用
import { detectRegenerationNeed } from '@smartabp/metadata-core'

const handleEntitySave = async (entity: EntityMetadata) => {
  const oldSchema = loadOldSchema(entity.name)
  const detection = detectRegenerationNeed(oldSchema, entity)
  
  if (!detection.needsRegeneration) {
    message.info('Schema无变化，无需重新生成代码')
    return
  }
  
  if (detection.recommendedAction === 'partial') {
    message.info('仅需重新生成前端代码')
    await regenerateFrontend(entity)
  } else {
    message.info('需要全量重新生成代码')
    await regenerateFull(entity)
  }
}
```

#### **Task 3.3: 可视化Schema编辑器**（1周）

**目标**：基于metadata-core构建实时验证的Schema编辑器

**组件设计**：

```vue
<!-- lowcode-designer/src/components/SchemaEditor.vue -->
<template>
  <div class="schema-editor">
    <!-- 实体名称 -->
    <el-form-item label="实体名称">
      <el-input 
        v-model="entity.name"
        @blur="validateField('name')"
      />
      <div v-if="errors.name" class="error">{{ errors.name }}</div>
    </el-form-item>
    
    <!-- 属性列表 -->
    <el-form-item label="属性">
      <property-editor 
        v-model="entity.properties"
        @change="validateField('properties')"
      />
      <div v-if="errors.properties" class="error">{{ errors.properties }}</div>
    </el-form-item>
    
    <!-- 实时验证状态 -->
    <div class="validation-status">
      <el-tag v-if="isValid" type="success">✅ 验证通过</el-tag>
      <el-tag v-else type="danger">❌ 验证失败</el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  validateEntityMetadata, 
  getEntityMetadataErrors 
} from '@smartabp/metadata-core'
import type { EntityMetadata } from '@smartabp/metadata-core'

const entity = ref<EntityMetadata>({
  name: '',
  module: '',
  keyType: 'Guid',
  isAggregateRoot: true,
  isMultiTenant: true,
  isSoftDelete: true,
  hasExtraProperties: true,
  properties: []
})

const errors = ref<Record<string, string>>({})

// 实时验证
const isValid = computed(() => {
  try {
    validateEntityMetadata(entity.value)
    return true
  } catch {
    return false
  }
})

// 字段级验证
const validateField = (fieldName: string) => {
  try {
    validateEntityMetadata(entity.value)
    errors.value[fieldName] = ''
  } catch (error) {
    const allErrors = getEntityMetadataErrors(entity.value)
    const fieldErrors = allErrors.filter(e => e.includes(fieldName))
    errors.value[fieldName] = fieldErrors.join(', ')
  }
}
</script>
```

**验收标准**：
- [ ] 实时验证和错误提示
- [ ] 友好的用户体验
- [ ] 与现有设计器集成

---

## 🔗 **集成清单**

### **集成1：lowcode-shared**

```typescript
// lowcode-shared/src/types/index.ts

// ✅ 从metadata-core导入
export type { 
  EntityMetadata, 
  ModuleMetadata,
  PropertyMetadata,
  NavigationPropertyMetadata,
  AspireSolutionMetadata
} from '@smartabp/metadata-core'

// ✅ 重新导出（保持API兼容）
export {
  validateEntityMetadata,
  validateModuleMetadata
} from '@smartabp/metadata-core'

// ❌ 删除重复的类型定义
// interface EntityConfig { ... } // 删除
```

**文件清单**：
- [x] lowcode-shared/package.json（添加peerDependencies）
- [ ] lowcode-shared/src/types/index.ts（重新导出）
- [ ] lowcode-shared/README.md（更新文档）

### **集成2：lowcode-core**

```typescript
// lowcode-core/src/stores/codeGeneration.ts

import { validateEntityMetadata } from '@smartabp/metadata-core'

// 在所有代码生成函数中添加验证
const generateBackendFile = async (entity: any, templateId: string, config: any) => {
  // 🔥 验证元数据
  const validated = validateEntityMetadata(entity)
  
  // 使用验证后的数据生成代码
  return generateCode(validated, templateId, config)
}
```

**文件清单**：
- [ ] lowcode-core/package.json（添加依赖）
- [ ] lowcode-core/src/stores/codeGeneration.ts（集成验证）
- [ ] lowcode-core/src/stores/entityModeling.ts（使用metadata-core类型）
- [ ] lowcode-core/README.md（更新文档）

### **集成3：lowcode-designer**

```typescript
// lowcode-designer/src/views/EntityDesigner.vue

import type { EntityMetadata } from '@smartabp/metadata-core'
import { validateEntityMetadata, getEntityMetadataErrors } from '@smartabp/metadata-core'

// 使用metadata-core进行实时验证
const validateAndSave = async () => {
  try {
    const validated = validateEntityMetadata(currentEntity.value)
    await saveEntity(validated)
    message.success('保存成功')
  } catch (error) {
    const errors = getEntityMetadataErrors(currentEntity.value)
    message.error(`验证失败: ${errors.join(', ')}`)
  }
}
```

**文件清单**：
- [ ] lowcode-designer/package.json（添加依赖）
- [ ] lowcode-designer/src/views/EntityDesigner.vue（集成验证）
- [ ] lowcode-designer/src/components/SchemaEditor.vue（新建）

### **集成4：SmartAbp.CodeGenerator（后端）**

```csharp
// SmartAbp.CodeGenerator/Services/MetadataCoreAdapter.cs（新建）

using System.Text.Json;
using SmartAbp.CodeGenerator.Services.V9;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// metadata-core格式适配器
    /// </summary>
    public class MetadataCoreAdapter
    {
        /// <summary>
        /// 转换metadata-core格式到内部格式
        /// </summary>
        public ModuleMetadataDto ConvertToModuleDto(string metadataCoreJson)
        {
            // 解析JSON
            var metadataCore = JsonSerializer.Deserialize<MetadataCoreFormat>(metadataCoreJson);
            
            // 转换为内部格式
            return new ModuleMetadataDto
            {
                Name = metadataCore.Name,
                DisplayName = metadataCore.DisplayName,
                Version = metadataCore.Version,
                Description = metadataCore.Description,
                // ... 完整映射
            };
        }
    }
    
    // metadata-core格式定义
    public class MetadataCoreFormat
    {
        public string SchemaVersion { get; set; }
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Version { get; set; }
        // ... 其他字段
    }
}
```

**文件清单**：
- [ ] SmartAbp.CodeGenerator/Services/MetadataCoreAdapter.cs（新建）
- [ ] SmartAbp.CodeGenerator/Services/CodeGenerationAppService.cs（添加新API）

---

## 🧪 **测试计划**

### **单元测试（Phase 2）**

```yaml
测试文件:
  - converters/to-backend-dto.test.ts（新建）
  - integration/lowcode-core.test.ts（新建）

覆盖率目标: ≥95%

测试场景:
  1. 类型转换正确性
  2. 验证集成正确性
  3. 错误处理完整性
  4. 边界条件覆盖
```

### **集成测试（Phase 3）**

```yaml
测试场景:
  1. 端到端测试:
     - 前端定义Schema
     - metadata-core验证
     - 调用后端生成代码
     - 验证生成结果
  
  2. 性能测试:
     - 大量实体验证性能
     - 批量转换性能
     - 内存占用监控
  
  3. 兼容性测试:
     - 旧格式迁移测试
     - 版本升级测试
     - 破坏性变更检测
```

---

## 📊 **成功指标**

### **Phase 2完成标准**

- [ ] README.md准确无误（无虚假宣传）
- [ ] package.json正确描述定位
- [ ] 架构文档完整
- [ ] lowcode-core成功集成验证
- [ ] 后端转换函数实现
- [ ] TypeScript编译0错误
- [ ] 测试覆盖率≥95%

### **Phase 3完成标准**

- [ ] Schema注册中心完整实现
- [ ] 增量更新检测可用
- [ ] 可视化编辑器上线
- [ ] 后端API支持metadata-core格式
- [ ] 端到端测试通过
- [ ] 性能达标（验证<3ms）

### **总体成功标准**

```yaml
技术指标:
  - 类型重复: 0个
  - 验证准确率: ≥95%
  - 测试覆盖率: ≥95%
  - 包体积: <150KB
  - 验证性能: <3ms/实体

业务指标:
  - 无效API请求: 减少80%
  - 开发体验: IDE智能提示100%
  - 代码生成错误率: 降低50%
  - 文档准确性: 100%
```

---

## ⚠️ **风险与应对**

### **风险1：集成破坏现有功能**

**概率**：中  
**影响**：高

**缓解措施**：
1. ✅ 渐进式集成（不破坏现有代码）
2. ✅ 完整的单元测试和集成测试
3. ✅ 保持向后兼容
4. ✅ 功能开关控制（可回滚）

### **风险2：性能下降**

**概率**：低  
**影响**：中

**缓解措施**：
1. ✅ 性能基准测试（验证<3ms）
2. ✅ 懒加载Schema Registry
3. ✅ 缓存验证结果
4. ✅ 持续性能监控

### **风险3：学习成本**

**概率**：中  
**影响**：低

**缓解措施**：
1. ✅ 完整的文档和示例
2. ✅ 清晰的架构说明
3. ✅ 培训和分享会
4. ✅ FAQ文档

---

## 📅 **时间表**

```yaml
2025-10-06 (Day 1) - Phase 1完成:
  ✅ 修正文档
  ✅ 创建架构说明
  ✅ 创建能力清单
  ✅ 制定集成计划

2025-10-07-08 (Day 2-3) - 统一类型定义:
  - 分析类型重复
  - 迁移类型到metadata-core
  - 更新导入语句
  - 测试编译

2025-10-09-10 (Day 4-5) - lowcode-core集成:
  - 添加验证逻辑
  - 更新代码生成函数
  - 编写集成测试
  - 文档更新

2025-10-11 (Day 6) - 后端格式转换:
  - 实现toModuleMetadataDto
  - 实现toEntityMetadataDto
  - 单元测试
  - 文档

2025-10-12-13 (Day 7-8) - 依赖更新和测试:
  - 更新package.json
  - 更新tsconfig.json
  - 完整回归测试
  - 性能测试
  - 文档review

2025-10-14-20 (Week 2) - Schema注册中心:
  - 增强registry功能
  - 批量注册API
  - 查询和统计API
  - 测试

2025-10-21-27 (Week 3) - 增量检测:
  - 实现detectRegenerationNeed
  - 智能判断逻辑
  - 集成到UI
  - 测试

2025-10-28-11-03 (Week 4) - 可视化编辑器:
  - SchemaEditor组件
  - 实时验证UI
  - 错误提示优化
  - 集成测试

2025-11-04-06 (最后3天) - 收尾:
  - 完整测试
  - 文档完善
  - 性能优化
  - 代码review
  - 发布准备
```

---

## 🎯 **下一步行动**

**立即可执行**（今天）：
1. [x] 修正README.md
2. [x] 修正package.json
3. [x] 创建架构文档
4. [x] 创建能力清单
5. [x] 制定集成计划

**本周任务**：
- [ ] Task 2.1: 统一类型定义（2天）
- [ ] Task 2.2: lowcode-core集成验证（2天）
- [ ] Task 2.3: 后端格式转换（1天）
- [ ] Task 2.4: 更新依赖关系（1天）

**需要决策**：
- Phase 3是否继续推进（Schema注册中心、增量检测、可视化编辑器）？
- 是否需要调整优先级？
- 是否需要额外资源支持？

---

**项目负责人**: 首席架构师  
**技术负责人**: AI Programming Assistant  
**开始日期**: 2025-10-06  
**预计完成**: 2025-11-06

