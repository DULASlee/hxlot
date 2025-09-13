# 第一阶段：可视化实体设计器增强 - 详细技术设计

## 概述

第一阶段专注于增强现有的EntityDesigner.vue组件，实现从简单实体建模到复杂关系建模的升级，并优化代码生成能力。

## 技术架构设计

### 1. 核心数据模型 (Single Source of Truth)

> **[重要架构决策]**
> 
> 为确保整个项目的一致性和可维护性，所有与实体相关的类型定义都已统一。
> 
> **唯一事实来源**: `src/SmartAbp.Vue/packages/lowcode-designer/src/types/entity.ts`
> 
> **执行要求**: 任何与实体、属性、关系、验证规则相关的前端开发，都 **必须** 导入并使用此文件中的类型。本文档后续章节中出现的任何旧的或简化的模型定义均已 **废弃**，仅作历史参考。请以 `entity.ts` 文件中的 `EnhancedEntityModel` 接口为准。

<details>
<summary>已废弃的旧模型定义 (点击展开)</summary>

```typescript
// src/types/enhanced-entity.ts
export interface EntityRelationship {
  id: string
  sourceEntityId: string
  targetEntityId: string
  type: 'OneToOne' | 'OneToMany' | 'ManyToMany'
  sourceProperty: string
  targetProperty: string
  sourceNavigationProperty?: string
  targetNavigationProperty?: string
  cascadeDelete: boolean
  isRequired: boolean
  foreignKeyProperty?: string
  joinTableName?: string // For ManyToMany
  onDeleteAction: 'Cascade' | 'SetNull' | 'Restrict'
}

export interface ValidationRule {
  id: string
  type: 'Required' | 'StringLength' | 'Range' | 'RegularExpression' | 'Custom'
  parameters: Record<string, any>
  errorMessage?: string
}

export interface BusinessRule {
  id: string
  name: string
  description: string
  trigger: 'BeforeCreate' | 'AfterCreate' | 'BeforeUpdate' | 'AfterUpdate' | 'BeforeDelete'
  condition?: string
  action: string
}

export interface EnhancedEntityProperty extends EntityProperty {
  validationRules: ValidationRule[]
  displayName?: string
  helpText?: string
  isSearchable: boolean
  isSortable: boolean
  displayOrder: number
  groupName?: string
}

export interface EnhancedEntityModel extends EntityModel {
  relationships: EntityRelationship[]
  baseEntity?: string
  interfaces: string[]
  customValidations: ValidationRule[]
  businessRules: BusinessRule[]
  properties: EnhancedEntityProperty[]
  displaySettings: {
    listViewColumns: string[]
    detailViewSections: string[]
    searchableFields: string[]
    sortableFields: string[]
  }
  permissions: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
    customPermissions: string[]
  }
}
```

</details>

### 2. 关系建模可视化组件

```vue
<!-- src/components/CodeGenerator/RelationshipDesigner.vue -->
<template>
  <div class="relationship-designer">
    <div class="designer-canvas" ref="canvasRef">
      <!-- 实体节点 -->
      <div
        v-for="entity in entities"
        :key="entity.id"
        class="entity-node"
        :style="getEntityPosition(entity.id)"
        @mousedown="startDragEntity($event, entity.id)"
      >
        <div class="entity-header">
          <h4>{{ entity.name }}</h4>
          <div class="entity-actions">
            <el-button @click="editEntity(entity)" size="small" type="primary" text>
              <el-icon><Edit /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="entity-properties">
          <div
            v-for="prop in entity.properties.slice(0, 5)"
            :key="prop.id"
            class="property-item"
          >
            <span class="property-name">{{ prop.name }}</span>
            <span class="property-type">{{ prop.type }}</span>
          </div>
          <div v-if="entity.properties.length > 5" class="more-properties">
            +{{ entity.properties.length - 5 }} more...
          </div>
        </div>
        <!-- 连接点 -->
        <div class="connection-points">
          <div
            class="connection-point left"
            @mousedown="startConnection($event, entity.id, 'left')"
          ></div>
          <div
            class="connection-point right"
            @mousedown="startConnection($event, entity.id, 'right')"
          ></div>
          <div
            class="connection-point top"
            @mousedown="startConnection($event, entity.id, 'top')"
          ></div>
          <div
            class="connection-point bottom"
            @mousedown="startConnection($event, entity.id, 'bottom')
          ></div>
        </div>
      </div>

      <!-- 关系连线 -->
      <svg class="relationships-layer" :width="canvasWidth" :height="canvasHeight">
        <g v-for="relationship in relationships" :key="relationship.id">
          <path
            :d="getRelationshipPath(relationship)"
            :class="`relationship-line ${relationship.type.toLowerCase()}`"
            @click="selectRelationship(relationship.id)"
          />
          <text
            :x="getRelationshipLabelPosition(relationship).x"
            :y="getRelationshipLabelPosition(relationship).y"
            class="relationship-label"
          >
            {{ getRelationshipLabel(relationship) }}
          </text>
        </g>
      </svg>

      <!-- 临时连线 -->
      <svg v-if="isConnecting" class="temp-connection" :width="canvasWidth" :height="canvasHeight">
        <path :d="tempConnectionPath" class="temp-line" />
      </svg>
    </div>

    <!-- 关系配置面板 -->
    <div v-if="selectedRelationship" class="relationship-config">
      <el-card>
        <template #header>
          <span>关系配置</span>
        </template>
        <RelationshipConfigForm
          :relationship="selectedRelationship"
          :entities="entities"
          @update="updateRelationship"
          @delete="deleteRelationship"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRelationshipDesigner } from '@/composables/useRelationshipDesigner'
import RelationshipConfigForm from './RelationshipConfigForm.vue'
import type { EnhancedEntityModel, EntityRelationship } from '@/types/enhanced-entity'

const props = defineProps<{
  entities: EnhancedEntityModel[]
  relationships: EntityRelationship[]
}>()

const emit = defineEmits<{
  updateRelationship: [relationship: EntityRelationship]
  deleteRelationship: [relationshipId: string]
  createRelationship: [relationship: Omit<EntityRelationship, 'id'>]
}>()

const {
  canvasRef,
  canvasWidth,
  canvasHeight,
  selectedRelationship,
  isConnecting,
  tempConnectionPath,
  getEntityPosition,
  getRelationshipPath,
  getRelationshipLabelPosition,
  getRelationshipLabel,
  startDragEntity,
  startConnection,
  selectRelationship,
  updateRelationship,
  deleteRelationship
} = useRelationshipDesigner(props.entities, props.relationships, emit)

onMounted(() => {
  // 初始化画布
})
</script>
```

### 3. 增强的代码生成模板

```csharp
// Templates/Entity/EnhancedEntityTemplate.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;
{{#each interfaces}}
using {{this}};
{{/each}}

namespace {{namespace}}
{
    /// <summary>
    /// {{description}}
    /// </summary>
    {{#if isAggregateRoot}}
    public class {{name}} : FullAuditedAggregateRoot<Guid>{{#if isMultiTenant}}, IMultiTenant{{/if}}{{#each interfaces}}, {{this}}{{/each}}
    {{else}}
    public class {{name}} : FullAuditedEntity<Guid>{{#if isMultiTenant}}, IMultiTenant{{/if}}{{#each interfaces}}, {{this}}{{/each}}
    {{/if}}
    {
        {{#each properties}}
        /// <summary>
        /// {{description}}
        /// {{#if helpText}}/// {{helpText}}{{/if}}
        /// </summary>
        {{#each validationRules}}
        {{#if (eq type 'Required')}}
        [Required(ErrorMessage = "{{errorMessage}}")]
        {{/if}}
        {{#if (eq type 'StringLength')}}
        [StringLength({{parameters.maxLength}}{{#if parameters.minLength}}, MinimumLength = {{parameters.minLength}}{{/if}}{{#if errorMessage}}, ErrorMessage = "{{errorMessage}}"{{/if}})]
        {{/if}}
        {{#if (eq type 'Range')}}
        [Range({{parameters.minimum}}, {{parameters.maximum}}{{#if errorMessage}}, ErrorMessage = "{{errorMessage}}"{{/if}})]
        {{/if}}
        {{#if (eq type 'RegularExpression')}}
        [RegularExpression(@"{{parameters.pattern}}"{{#if errorMessage}}, ErrorMessage = "{{errorMessage}}"{{/if}})]
        {{/if}}
        {{/each}}
        {{#if displayName}}
        [Display(Name = "{{displayName}}")]
        {{/if}}
        public virtual {{type}}{{#unless isRequired}}?{{/unless}} {{name}} { get; set; }
        
        {{/each}}
        
        {{#each relationships}}
        {{#if (eq type 'OneToMany')}}
        /// <summary>
        /// {{description}}
        /// </summary>
        public virtual ICollection<{{targetEntity}}> {{targetNavigationProperty}} { get; set; } = new List<{{targetEntity}}>();
        {{/if}}
        {{#if (eq type 'ManyToOne')}}
        /// <summary>
        /// {{description}}
        /// </summary>
        {{#if foreignKeyProperty}}
        public virtual {{foreignKeyType}} {{foreignKeyProperty}} { get; set; }
        {{/if}}
        public virtual {{targetEntity}} {{targetNavigationProperty}} { get; set; }
        {{/if}}
        {{#if (eq type 'ManyToMany')}}
        /// <summary>
        /// {{description}}
        /// </summary>
        public virtual ICollection<{{targetEntity}}> {{targetNavigationProperty}} { get; set; } = new List<{{targetEntity}}>();
        {{/if}}
        {{/each}}
        
        {{#if isMultiTenant}}
        public virtual Guid? TenantId { get; set; }
        {{/if}}
        
        {{#each businessRules}}
        {{#if (eq trigger 'BeforeCreate')}}
        /// <summary>
        /// {{description}}
        /// </summary>
        public virtual void {{name}}()
        {
            {{action}}
        }
        {{/if}}
        {{/each}}
    }
}
```

### 4. 智能验证规则配置

```vue
<!-- src/components/CodeGenerator/ValidationRuleDesigner.vue -->
<template>
  <div class="validation-rule-designer">
    <div class="rule-list">
      <div
        v-for="rule in validationRules"
        :key="rule.id"
        class="rule-item"
        :class="{ active: selectedRule?.id === rule.id }"
        @click="selectRule(rule)"
      >
        <div class="rule-header">
          <el-icon class="rule-icon">
            <component :is="getRuleIcon(rule.type)" />
          </el-icon>
          <span class="rule-name">{{ getRuleName(rule.type) }}</span>
          <el-button @click="removeRule(rule.id)" size="small" type="danger" text>
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
        <div class="rule-summary">{{ getRuleSummary(rule) }}</div>
      </div>
    </div>

    <div class="rule-toolbox">
      <h4>添加验证规则</h4>
      <div class="rule-types">
        <div
          v-for="ruleType in availableRuleTypes"
          :key="ruleType.type"
          class="rule-type-item"
          @click="addRule(ruleType.type)"
        >
          <el-icon><component :is="ruleType.icon" /></el-icon>
          <span>{{ ruleType.name }}</span>
        </div>
      </div>
    </div>

    <div v-if="selectedRule" class="rule-config">
      <el-card>
        <template #header>
          <span>规则配置 - {{ getRuleName(selectedRule.type) }}</span>
        </template>
        
        <component
          :is="getRuleConfigComponent(selectedRule.type)"
          :rule="selectedRule"
          @update="updateRule"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import RequiredRuleConfig from './rules/RequiredRuleConfig.vue'
import StringLengthRuleConfig from './rules/StringLengthRuleConfig.vue'
import RangeRuleConfig from './rules/RangeRuleConfig.vue'
import RegexRuleConfig from './rules/RegexRuleConfig.vue'
import CustomRuleConfig from './rules/CustomRuleConfig.vue'
import type { ValidationRule } from '@/types/enhanced-entity'

const props = defineProps<{
  validationRules: ValidationRule[]
  propertyType: string
}>()

const emit = defineEmits<{
  updateRules: [rules: ValidationRule[]]
}>()

const selectedRule = ref<ValidationRule | null>(null)

const availableRuleTypes = computed(() => {
  const baseTypes = [
    { type: 'Required', name: '必填', icon: 'Warning' },
    { type: 'Custom', name: '自定义', icon: 'Setting' }
  ]
  
  if (props.propertyType === 'string') {
    baseTypes.splice(1, 0, 
      { type: 'StringLength', name: '字符长度', icon: 'Document' },
      { type: 'RegularExpression', name: '正则表达式', icon: 'Search' }
    )
  }
  
  if (['int', 'decimal', 'double', 'float'].includes(props.propertyType)) {
    baseTypes.splice(1, 0, { type: 'Range', name: '数值范围', icon: 'Sort' })
  }
  
  return baseTypes
})

const getRuleConfigComponent = (type: string) => {
  const components = {
    'Required': RequiredRuleConfig,
    'StringLength': StringLengthRuleConfig,
    'Range': RangeRuleConfig,
    'RegularExpression': RegexRuleConfig,
    'Custom': CustomRuleConfig
  }
  return components[type] || CustomRuleConfig
}

const addRule = (type: string) => {
  const newRule: ValidationRule = {
    id: `rule_${Date.now()}`,
    type: type as any,
    parameters: {},
    errorMessage: ''
  }
  
  const updatedRules = [...props.validationRules, newRule]
  emit('updateRules', updatedRules)
  selectedRule.value = newRule
}

const removeRule = (ruleId: string) => {
  const updatedRules = props.validationRules.filter(r => r.id !== ruleId)
  emit('updateRules', updatedRules)
  if (selectedRule.value?.id === ruleId) {
    selectedRule.value = null
  }
}

const updateRule = (updatedRule: ValidationRule) => {
  const updatedRules = props.validationRules.map(r => 
    r.id === updatedRule.id ? updatedRule : r
  )
  emit('updateRules', updatedRules)
}
</script>
```

### 5. 实时代码预览增强

```vue
<!-- src/components/CodeGenerator/EnhancedCodePreview.vue -->
<template>
  <div class="enhanced-code-preview">
    <div class="preview-tabs">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="Entity" name="entity">
          <CodeEditor
            :code="generatedCode.entity"
            language="csharp"
            :readonly="true"
            :show-line-numbers="true"
          />
        </el-tab-pane>
        <el-tab-pane label="Repository" name="repository">
          <CodeEditor
            :code="generatedCode.repository"
            language="csharp"
            :readonly="true"
          />
        </el-tab-pane>
        <el-tab-pane label="AppService" name="appservice">
          <CodeEditor
            :code="generatedCode.appService"
            language="csharp"
            :readonly="true"
          />
        </el-tab-pane>
        <el-tab-pane label="DTO" name="dto">
          <CodeEditor
            :code="generatedCode.dto"
            language="csharp"
            :readonly="true"
          />
        </el-tab-pane>
        <el-tab-pane label="Tests" name="tests">
          <CodeEditor
            :code="generatedCode.tests"
            language="csharp"
            :readonly="true"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="preview-actions">
      <el-button @click="validateCode" :loading="isValidating">
        <el-icon><Check /></el-icon>
        验证代码
      </el-button>
      <el-button @click="downloadCode">
        <el-icon><Download /></el-icon>
        下载代码
      </el-button>
      <el-button @click="copyToClipboard">
        <el-icon><CopyDocument /></el-icon>
        复制代码
      </el-button>
    </div>

    <div v-if="validationResults.length > 0" class="validation-results">
      <el-alert
        v-for="result in validationResults"
        :key="result.id"
        :title="result.message"
        :type="result.type"
        :closable="false"
        show-icon
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Download, CopyDocument } from '@element-plus/icons-vue'
import CodeEditor from '@/components/common/CodeEditor.vue'
import { useCodeGeneration } from '@/composables/useCodeGeneration'
import type { EnhancedEntityModel } from '@/types/enhanced-entity'

const props = defineProps<{
  entity: EnhancedEntityModel
  entities: EnhancedEntityModel[] // For relationship context
}>()

const activeTab = ref('entity')
const isValidating = ref(false)
const validationResults = ref<any[]>([])

const { generateAllCode, validateGeneratedCode } = useCodeGeneration()

const generatedCode = computed(() => {
  return generateAllCode(props.entity, props.entities)
})

const validateCode = async () => {
  isValidating.value = true
  try {
    const results = await validateGeneratedCode(generatedCode.value)
    validationResults.value = results
    
    if (results.every(r => r.type === 'success')) {
      ElMessage.success('代码验证通过')
    } else {
      ElMessage.warning('代码验证发现问题，请检查')
    }
  } catch (error) {
    ElMessage.error('代码验证失败')
  } finally {
    isValidating.value = false
  }
}

const downloadCode = () => {
  // 实现代码下载逻辑
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value[activeTab.value])
    ElMessage.success('代码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 监听实体变化，自动重新生成代码
watch(() => props.entity, () => {
  validationResults.value = []
}, { deep: true })
</script>
```

## 实施步骤

### Week 1-2: 关系建模功能
1. 创建增强的实体模型类型定义
2. 开发RelationshipDesigner组件
3. 实现拖拽连线功能
4. 添加关系配置界面

### Week 3-4: 验证规则系统
1. 开发ValidationRuleDesigner组件
2. 实现各种验证规则配置组件
3. 集成到EntityDesigner中
4. 添加业务规则配置

### Week 5-6: 代码生成优化
1. 更新代码生成模板
2. 增强CodePreview组件
3. 实现代码验证功能
4. 添加单元测试生成

## 测试策略

### 单元测试
- 实体模型验证测试
- 关系建模逻辑测试
- 代码生成模板测试
- 验证规则测试

### 集成测试
- 完整的实体设计流程测试
- 代码生成和编译测试
- 性能测试

### 用户验收测试
- 可用性测试
- 功能完整性测试
- 性能基准测试

## 交付标准

1. **功能完整性**
   - [ ] 支持一对一、一对多、多对多关系建模
   - [ ] 支持实体继承和接口实现
   - [ ] 支持复杂验证规则配置
   - [ ] 支持业务规则定义

2. **代码质量**
   - [ ] TypeScript类型安全
   - [ ] 单元测试覆盖率 > 80%
   - [ ] ESLint和Prettier规范检查通过
   - [ ] 性能测试通过

3. **用户体验**
   - [ ] 响应时间 < 200ms
   - [ ] 支持撤销/重做操作
   - [ ] 提供完整的错误提示
   - [ ] 支持键盘快捷键

4. **文档完整性**
   - [ ] API文档
   - [ ] 用户使用指南
   - [ ] 开发者文档
   - [ ] 测试报告