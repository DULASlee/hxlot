# SmartFormBuilder 2.0 详细设计说明书

> **基于form-create的企业级表单设计器集成方案**
>
> **版本**: 2.0.0  
> **日期**: 2025-10-07  
> **作者**: SmartAbp架构团队  
> **状态**: 设计阶段

---

## 📋 目录

- [1. 概述](#1-概述)
- [2. 架构设计](#2-架构设计)
- [3. 技术选型](#3-技术选型)
- [4. 核心功能](#4-核心功能)
- [5. API设计](#5-api设计)
- [6. 实施计划](#6-实施计划)
- [7. 质量保证](#7-质量保证)

---

## 1. 概述

### 1.1 项目背景

**现状问题**：
- 现有SmartFormBuilder功能薄弱（仅131行代码）
- 仅支持7种基础字段类型
- 缺少可视化设计能力
- 无法满足MES/IoT复杂UI定制需求

**战略决策**：
- ❌ 不重复造轮子（自研需要3-6个月）
- ✅ 站在巨人肩膀上（集成成熟开源方案）
- ✅ 专注于业务价值（MES/IoT特定功能）

### 1.2 设计目标

```yaml
功能目标:
  - 支持30+字段类型
  - 可视化拖拽设计器
  - 动态表单与联动规则
  - JSON Schema驱动
  - 完整的验证引擎
  - 表单模板管理

质量目标:
  - 代码质量: ≥95分
  - 性能: 首屏<1s，1000字段<2s
  - 兼容性: 100%向后兼容
  - 测试覆盖率: ≥80%

交付目标:
  - 阶段1 (基础集成): 1周
  - 阶段2 (MES扩展): 1周
  - 阶段3 (可视化设计器): 2周
  - 总计: 4周
```

### 1.3 核心策略

**集成 > 重造**

```
┌─────────────────────────────────────────────┐
│  SmartFormBuilder 2.0 架构                   │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 我们的封装层 (SmartAbp)              │   │
│  ├─────────────────────────────────────┤   │
│  │ • JSON Schema类型定义 (已完成)      │   │
│  │ • MES/IoT自定义组件                 │   │
│  │ • 统一API适配器                     │   │
│  │ • 表单模板管理                      │   │
│  └─────────────────────────────────────┘   │
│           ↓ 集成                            │
│  ┌─────────────────────────────────────┐   │
│  │ form-create 核心引擎 (5.7k stars)   │   │
│  ├─────────────────────────────────────┤   │
│  │ • 可视化设计器                      │   │
│  │ • 30+字段组件                       │   │
│  │ • 动态表单                          │   │
│  │ • 验证引擎                          │   │
│  └─────────────────────────────────────┘   │
│           ↓ 基于                            │
│  ┌─────────────────────────────────────┐   │
│  │ Element Plus (UI组件库)             │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 2. 架构设计

### 2.1 整体架构

```
┌──────────────────────────────────────────────────────────┐
│              SmartFormBuilder 2.0 架构层次                │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ L1: 业务应用层                                            │
├──────────────────────────────────────────────────────────┤
│ • MES工单表单                                             │
│ • IoT设备参数配置                                         │
│ • 质检表单                                               │
│ • 动态报工表单                                            │
└──────────────────────────────────────────────────────────┘
                        ↓ 使用
┌──────────────────────────────────────────────────────────┐
│ L2: SmartAbp封装层 (我们的代码)                          │
├──────────────────────────────────────────────────────────┤
│ ┌────────────────┐  ┌────────────────┐  ┌─────────────┐ │
│ │ SmartFormBuilder│  │ SmartFormDesigner│ │ 模板管理器 │ │
│ │     .vue       │  │     .vue       │  │            │ │
│ └────────────────┘  └────────────────┘  └─────────────┘ │
│ ┌────────────────────────────────────────────────────┐  │
│ │ FormSchemaAdapter (类型转换)                       │  │
│ │ • UnifiedSchema → FormCreateSchema                 │  │
│ │ • FormCreateSchema → UnifiedSchema                 │  │
│ └────────────────────────────────────────────────────┘  │
│ ┌────────────────────────────────────────────────────┐  │
│ │ CustomComponents (MES/IoT自定义组件)               │  │
│ │ • DeviceParameterField                             │  │
│ │ • QualityCheckField                                │  │
│ │ • WorkOrderField                                   │  │
│ │ • BarcodeScanner                                   │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                        ↓ 集成
┌──────────────────────────────────────────────────────────┐
│ L3: form-create 核心引擎 (开源)                           │
├──────────────────────────────────────────────────────────┤
│ ┌────────────────┐  ┌────────────────┐  ┌─────────────┐ │
│ │ FormCreate     │  │ FormDesigner   │  │ 验证引擎    │ │
│ │  (渲染引擎)    │  │  (可视化设计)  │  │            │ │
│ └────────────────┘  └────────────────┘  └─────────────┘ │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 字段组件库 (30+组件)                                │  │
│ │ • Input, Select, DatePicker, Upload...             │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                        ↓ 基于
┌──────────────────────────────────────────────────────────┐
│ L4: Element Plus (UI框架)                                │
├──────────────────────────────────────────────────────────┤
│ • ElForm, ElInput, ElSelect, ElDatePicker...             │
└──────────────────────────────────────────────────────────┘
```

### 2.2 核心模块设计

#### 2.2.1 SmartFormBuilder.vue (主组件)

**职责**：
- 统一的表单渲染入口
- 向后兼容现有API
- 集成form-create引擎
- 提供扩展点

**设计**：
```vue
<template>
  <div class="smart-form-builder">
    <!-- form-create渲染引擎 -->
    <FormCreate
      v-model="formData"
      :rule="formCreateRules"
      :option="formCreateOptions"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import FormCreate from '@form-create/element-ui'
import { FormSchemaAdapter } from '../adapters/FormSchemaAdapter'
import type { FormConfig } from '../types/FormSchema'

interface Props {
  // 兼容旧API
  fields?: FormField[]
  // 新API (优先使用)
  schema?: FormConfig
  // 初始数据
  modelValue?: Record<string, any>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', data: Record<string, any>): void
  (e: 'submit', data: Record<string, any>): void
}>()

// 适配器：将我们的schema转换为form-create schema
const adapter = new FormSchemaAdapter()
const formCreateRules = computed(() => {
  if (props.schema) {
    return adapter.toFormCreate(props.schema)
  } else if (props.fields) {
    // 向后兼容：旧的fields API
    return adapter.fromLegacyFields(props.fields)
  }
  return []
})
</script>
```

#### 2.2.2 FormSchemaAdapter (适配器)

**职责**：
- 双向类型转换
- 保持API兼容性
- 扩展字段映射

**设计**：
```typescript
// src/components/SmartFormBuilder/adapters/FormSchemaAdapter.ts

import type { FormConfig, FormFieldConfig } from '../types/FormSchema'
import type { Rule as FormCreateRule } from '@form-create/element-ui'

/**
 * @class FormSchemaAdapter
 * @description 表单Schema适配器，负责我们的UnifiedSchema与form-create Schema之间的转换
 */
export class FormSchemaAdapter {
  /**
   * 将我们的FormConfig转换为form-create的Rule数组
   */
  toFormCreate(config: FormConfig): FormCreateRule[] {
    return config.fields.map(field => this.convertField(field))
  }

  /**
   * 将单个字段转换为form-create规则
   */
  private convertField(field: FormFieldConfig): FormCreateRule {
    const rule: FormCreateRule = {
      type: this.mapFieldType(field.type),
      field: field.name,
      title: field.label,
      value: field.defaultValue,
      props: {
        placeholder: field.placeholder,
        disabled: field.disabled,
        readonly: field.readonly,
        ...this.buildFieldProps(field)
      }
    }

    // 验证规则
    if (field.rules && field.rules.length > 0) {
      rule.validate = field.rules.map(r => this.convertValidationRule(r))
    }

    // 动态显示/禁用
    if (field.showWhen) {
      rule.hidden = typeof field.showWhen === 'function'
        ? field.showWhen
        : this.parseExpression(field.showWhen)
    }

    // 布局配置
    if (field.span) {
      rule.col = { span: field.span }
    }

    return rule
  }

  /**
   * 字段类型映射表
   */
  private mapFieldType(type: string): string {
    const typeMap: Record<string, string> = {
      'text': 'input',
      'textarea': 'input',
      'password': 'input',
      'email': 'input',
      'number': 'inputNumber',
      'select': 'select',
      'multiselect': 'select',
      'date': 'datePicker',
      'datetime': 'datePicker',
      'switch': 'switch',
      'checkbox': 'checkbox',
      'radio': 'radio',
      'upload': 'upload',
      'slider': 'slider',
      'rate': 'rate',
      'cascader': 'cascader',
      'tree': 'tree',
      'transfer': 'transfer',
      'richtext': 'fcEditor', // form-create富文本组件
      // MES/IoT自定义组件
      'deviceParameter': 'DeviceParameterField',
      'qualityCheck': 'QualityCheckField',
      'workOrder': 'WorkOrderField',
      'barcodeScanner': 'BarcodeScanner'
    }
    return typeMap[type] || 'input'
  }

  /**
   * 构建字段特定的props
   */
  private buildFieldProps(field: FormFieldConfig): Record<string, any> {
    const props: Record<string, any> = {}

    // 文本类型
    if (field.type === 'textarea') {
      props.type = 'textarea'
      props.rows = field.rows || 3
      props.autosize = field.autosize
    }

    // 数字类型
    if (field.type === 'number' || field.type === 'integer' || field.type === 'decimal') {
      props.min = field.min
      props.max = field.max
      props.step = field.step
      props.precision = field.precision
    }

    // 选择类型
    if (field.options) {
      props.options = field.options.map(opt => ({
        label: opt.label,
        value: opt.value,
        disabled: opt.disabled
      }))
    }

    // 日期类型
    if (field.format) {
      props.format = field.format
      props.valueFormat = field.valueFormat
    }

    // 上传类型
    if (field.upload) {
      props.action = field.upload.action
      props.headers = field.upload.headers
      props.data = field.upload.data
      props.limit = field.upload.limit
      props.accept = field.upload.accept
      props.listType = field.upload.listType
    }

    return props
  }

  /**
   * 转换验证规则
   */
  private convertValidationRule(rule: ValidationRule): any {
    const formCreateRule: any = {
      message: rule.message,
      trigger: rule.trigger || 'blur'
    }

    switch (rule.type) {
      case 'required':
        formCreateRule.required = true
        break
      case 'min':
        formCreateRule.min = rule.value
        break
      case 'max':
        formCreateRule.max = rule.value
        break
      case 'pattern':
        formCreateRule.pattern = rule.value
        break
      case 'email':
        formCreateRule.type = 'email'
        break
      case 'url':
        formCreateRule.type = 'url'
        break
      case 'custom':
        formCreateRule.validator = rule.validator
        break
    }

    return formCreateRule
  }

  /**
   * 解析表达式字符串（如 "fieldA === 'value'"）
   */
  private parseExpression(expr: string): (formData: any) => boolean {
    return new Function('formData', `return ${expr}`) as any
  }

  /**
   * 从form-create schema转换回我们的schema (用于设计器保存)
   */
  fromFormCreate(rules: FormCreateRule[]): FormConfig {
    // 反向转换逻辑...
    return {
      id: '',
      name: '',
      layout: 'horizontal',
      fields: rules.map(rule => this.convertFromFormCreateRule(rule))
    }
  }

  /**
   * 向后兼容：从旧的fields API转换
   */
  fromLegacyFields(fields: LegacyFormField[]): FormCreateRule[] {
    return fields.map(field => ({
      type: field.type === 'text' ? 'input' : field.type,
      field: field.name,
      title: field.label,
      value: field.defaultValue,
      props: {
        placeholder: field.placeholder,
        disabled: field.disabled
      },
      validate: field.required ? [{ required: true, message: `${field.label}不能为空` }] : []
    }))
  }
}
```

#### 2.2.3 CustomComponents (MES/IoT自定义组件)

**职责**：
- 扩展form-create组件库
- 提供MES/IoT特定字段
- 保持与form-create一致的API

**示例组件**：

```typescript
// src/components/SmartFormBuilder/custom-components/DeviceParameterField.vue
<template>
  <div class="device-parameter-field">
    <el-input
      v-model="localValue"
      :placeholder="placeholder"
      :disabled="disabled"
    >
      <template #append>
        <el-button @click="showDeviceSelector">
          <el-icon><Setting /></el-icon>
          选择设备参数
        </el-button>
      </template>
    </el-input>

    <!-- 设备参数选择器弹窗 -->
    <DeviceParameterSelector
      v-model:visible="selectorVisible"
      @select="handleSelectParameter"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElInput, ElButton, ElIcon } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import DeviceParameterSelector from './DeviceParameterSelector.vue'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const localValue = ref(props.modelValue || '')
const selectorVisible = ref(false)

watch(() => props.modelValue, (val) => {
  localValue.value = val || ''
})

watch(localValue, (val) => {
  emit('update:modelValue', val)
})

const showDeviceSelector = () => {
  selectorVisible.value = true
}

const handleSelectParameter = (parameter: DeviceParameter) => {
  localValue.value = `${parameter.deviceId}:${parameter.parameterKey}`
  selectorVisible.value = false
}
</script>
```

**注册自定义组件**：

```typescript
// src/components/SmartFormBuilder/register-custom-components.ts
import FormCreate from '@form-create/element-ui'
import DeviceParameterField from './custom-components/DeviceParameterField.vue'
import QualityCheckField from './custom-components/QualityCheckField.vue'
import WorkOrderField from './custom-components/WorkOrderField.vue'
import BarcodeScanner from './custom-components/BarcodeScanner.vue'

/**
 * 注册所有MES/IoT自定义组件
 */
export function registerCustomComponents() {
  // 注册设备参数字段
  FormCreate.component('DeviceParameterField', DeviceParameterField)
  
  // 注册质检字段
  FormCreate.component('QualityCheckField', QualityCheckField)
  
  // 注册工单字段
  FormCreate.component('WorkOrderField', WorkOrderField)
  
  // 注册条码扫描器
  FormCreate.component('BarcodeScanner', BarcodeScanner)
}
```

#### 2.2.4 SmartFormDesigner.vue (可视化设计器)

**职责**：
- 拖拽式表单设计
- 实时预览
- 配置面板
- Schema导入/导出

**设计**：
```vue
<template>
  <div class="smart-form-designer">
    <el-container>
      <!-- 左侧：组件库 -->
      <el-aside width="250px">
        <FieldComponentLibrary @drag-start="handleDragStart" />
      </el-aside>

      <!-- 中间：设计画布 -->
      <el-main>
        <FormDesigner
          v-model="formSchema"
          :custom-components="customComponents"
          @field-click="handleFieldClick"
        />
      </el-main>

      <!-- 右侧：属性配置 -->
      <el-aside width="350px">
        <FieldPropertyEditor
          v-if="selectedField"
          v-model="selectedField"
          @update="handleFieldUpdate"
        />
      </el-aside>
    </el-container>

    <!-- 底部：操作栏 -->
    <el-footer height="60px">
      <el-button @click="handlePreview">预览</el-button>
      <el-button @click="handleExport">导出Schema</el-button>
      <el-button @click="handleSave" type="primary">保存</el-button>
    </el-footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FormDesigner from '@form-create/designer' // form-create设计器
import FieldComponentLibrary from './designer/FieldComponentLibrary.vue'
import FieldPropertyEditor from './designer/FieldPropertyEditor.vue'
import type { FormConfig, FormFieldConfig } from '../types/FormSchema'

const formSchema = ref<FormConfig>({
  id: '',
  name: '',
  layout: 'horizontal',
  fields: []
})

const selectedField = ref<FormFieldConfig | null>(null)

const customComponents = [
  { type: 'DeviceParameterField', label: '设备参数', icon: 'setting' },
  { type: 'QualityCheckField', label: '质检字段', icon: 'check' },
  { type: 'WorkOrderField', label: '工单字段', icon: 'document' },
  { type: 'BarcodeScanner', label: '条码扫描', icon: 'scan' }
]

const handleFieldClick = (field: FormFieldConfig) => {
  selectedField.value = field
}

const handleFieldUpdate = (updatedField: FormFieldConfig) => {
  // 更新字段配置
  const index = formSchema.value.fields.findIndex(f => f.id === updatedField.id)
  if (index !== -1) {
    formSchema.value.fields[index] = updatedField
  }
}

const handlePreview = () => {
  // 打开预览弹窗
}

const handleExport = () => {
  // 导出JSON Schema
  const json = JSON.stringify(formSchema.value, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${formSchema.value.name || 'form'}-schema.json`
  a.click()
}

const handleSave = async () => {
  // 保存到后端
  await api.post('/api/form-templates', formSchema.value)
}
</script>
```

---

## 3. 技术选型

### 3.1 核心依赖

| 依赖 | 版本 | 用途 | Stars | 理由 |
|-----|------|-----|-------|-----|
| **form-create** | ^3.2.0 | 表单核心引擎 | 5.7k | ✅ 社区活跃<br>✅ 功能完整<br>✅ 文档完善 |
| **@form-create/element-ui** | ^3.2.0 | Element Plus集成 | - | ✅ 原生支持<br>✅ 30+组件 |
| **@form-create/designer** | ^3.2.0 | 可视化设计器 | - | ✅ 拖拽设计<br>✅ 实时预览 |
| **Element Plus** | ^2.5.0 | UI组件库 | 23k | ✅ Vue3官方推荐<br>✅ 已有依赖 |
| **Vue 3** | ^3.3.0 | 框架 | 45k | ✅ 项目标准 |

### 3.2 技术对比分析

#### form-create vs 其他方案

| 特性 | form-create | Avue | variant-form | Formily | 自研 |
|-----|-------------|------|--------------|---------|------|
| **社区活跃度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | N/A |
| **学习成本** | 低 | 中 | 中 | 高 | N/A |
| **文档质量** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | N/A |
| **可扩展性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **性能** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **集成难度** | 低 | 中 | 中 | 高 | N/A |
| **开发周期** | 2周 | 3周 | 3周 | 4周 | 3-6个月 |
| **综合评分** | **95分** ✅ | 85分 | 80分 | 90分 | 60分 |

**选择form-create的5大理由**：
1. ✅ **社区最活跃**：5.7k stars，持续更新
2. ✅ **文档最完善**：中文文档，示例丰富
3. ✅ **学习成本最低**：API简洁，上手快
4. ✅ **扩展性最强**：支持自定义组件
5. ✅ **交付周期最短**：2周即可完成基础集成

---

## 4. 核心功能

### 4.1 功能清单

#### 阶段1: 基础集成 (1周)

```yaml
F1.1 - 表单渲染引擎:
  - ✅ 集成form-create核心
  - ✅ 支持30+字段类型
  - ✅ 完整验证引擎
  - ✅ 向后兼容旧API

F1.2 - Schema适配器:
  - ✅ UnifiedSchema → FormCreateSchema
  - ✅ FormCreateSchema → UnifiedSchema
  - ✅ 类型安全转换
  - ✅ 扩展字段映射

F1.3 - 基础组件支持:
  - ✅ 文本类 (8种)
  - ✅ 数字类 (4种)
  - ✅ 日期类 (5种)
  - ✅ 选择类 (7种)
  - ✅ 上传类 (3种)
  - ✅ 富文本类 (2种)
  - ✅ 复杂组件类 (6种)

F1.4 - 单元测试:
  - ✅ 适配器测试
  - ✅ 组件渲染测试
  - ✅ 验证规则测试
  - ✅ 覆盖率 ≥80%
```

#### 阶段2: MES/IoT扩展 (1周)

```yaml
F2.1 - 自定义组件:
  - ✅ DeviceParameterField (设备参数)
  - ✅ QualityCheckField (质检字段)
  - ✅ WorkOrderField (工单字段)
  - ✅ BarcodeScanner (条码扫描)
  - ✅ SensorDataField (传感器数据)
  - ✅ ProductionLineField (生产线)

F2.2 - 动态联动:
  - ✅ 字段显示/隐藏联动
  - ✅ 字段启用/禁用联动
  - ✅ 选项动态加载
  - ✅ 值变化联动

F2.3 - 远程数据源:
  - ✅ API数据源配置
  - ✅ 分页加载
  - ✅ 搜索过滤
  - ✅ 缓存策略

F2.4 - 表单模板:
  - ✅ 模板保存
  - ✅ 模板加载
  - ✅ 模板分类
  - ✅ 模板分享
```

#### 阶段3: 可视化设计器 (2周)

```yaml
F3.1 - 设计器核心:
  - ✅ 拖拽式设计
  - ✅ 实时预览
  - ✅ 撤销/重做
  - ✅ 画布缩放

F3.2 - 组件库:
  - ✅ 基础组件面板
  - ✅ MES/IoT组件面板
  - ✅ 自定义组件面板
  - ✅ 组件搜索

F3.3 - 属性编辑器:
  - ✅ 字段属性配置
  - ✅ 验证规则配置
  - ✅ 样式配置
  - ✅ 事件配置

F3.4 - 导入/导出:
  - ✅ JSON Schema导出
  - ✅ JSON Schema导入
  - ✅ 代码生成
  - ✅ 模板保存
```

### 4.2 字段类型支持矩阵

| 分类 | 字段类型 | form-create | 我们的支持 | 状态 |
|-----|---------|-------------|-----------|------|
| 🔤 文本 | text | ✅ | ✅ | 原生 |
| 🔤 文本 | textarea | ✅ | ✅ | 原生 |
| 🔤 文本 | password | ✅ | ✅ | 原生 |
| 🔤 文本 | email | ✅ | ✅ | 原生 |
| 🔤 文本 | url | ✅ | ✅ | 原生 |
| 🔤 文本 | tel | ✅ | ✅ | 原生 |
| 🔤 文本 | search | ✅ | ✅ | 原生 |
| 🔤 文本 | code | ✅ | ✅ | 原生 |
| 🔢 数字 | number | ✅ | ✅ | 原生 |
| 🔢 数字 | integer | ⭕ | ✅ | 扩展 |
| 🔢 数字 | decimal | ⭕ | ✅ | 扩展 |
| 🔢 数字 | currency | ⭕ | ✅ | 扩展 |
| 📅 日期 | date | ✅ | ✅ | 原生 |
| 📅 日期 | datetime | ✅ | ✅ | 原生 |
| 📅 日期 | time | ✅ | ✅ | 原生 |
| 📅 日期 | daterange | ✅ | ✅ | 原生 |
| 📅 日期 | datetimerange | ✅ | ✅ | 原生 |
| ✅ 选择 | select | ✅ | ✅ | 原生 |
| ✅ 选择 | multiselect | ✅ | ✅ | 原生 |
| ✅ 选择 | radio | ✅ | ✅ | 原生 |
| ✅ 选择 | checkbox | ✅ | ✅ | 原生 |
| ✅ 选择 | switch | ✅ | ✅ | 原生 |
| ✅ 选择 | slider | ✅ | ✅ | 原生 |
| ✅ 选择 | rate | ✅ | ✅ | 原生 |
| 📤 上传 | upload | ✅ | ✅ | 原生 |
| 📤 上传 | image | ✅ | ✅ | 原生 |
| 📤 上传 | file | ✅ | ✅ | 原生 |
| 🎨 富文本 | richtext | ✅ | ✅ | 原生 |
| 🎨 富文本 | markdown | ✅ | ✅ | 原生 |
| 🌳 复杂 | cascader | ✅ | ✅ | 原生 |
| 🌳 复杂 | tree | ✅ | ✅ | 原生 |
| 🌳 复杂 | transfer | ✅ | ✅ | 原生 |
| 🌳 复杂 | color | ✅ | ✅ | 原生 |
| 🌳 复杂 | icon | ⭕ | ✅ | 扩展 |
| 🌳 复杂 | location | ⭕ | ✅ | 扩展 |
| 🏭 MES | deviceParameter | ❌ | ✅ | **自研** |
| 🏭 MES | qualityCheck | ❌ | ✅ | **自研** |
| 🏭 MES | workOrder | ❌ | ✅ | **自研** |
| 🏭 MES | barcodeScanner | ❌ | ✅ | **自研** |
| 📡 IoT | sensorData | ❌ | ✅ | **自研** |
| 📡 IoT | productionLine | ❌ | ✅ | **自研** |

**图例**：
- ✅ 原生支持
- ⭕ 通过配置扩展
- ❌ 需要自研

**总计**：**40种字段类型** (30种原生 + 10种自研)

---

## 5. API设计

### 5.1 组件API

#### SmartFormBuilder.vue

```typescript
interface SmartFormBuilderProps {
  /** 表单Schema配置 (新API，推荐) */
  schema?: FormConfig
  
  /** 字段列表 (旧API，向后兼容) */
  fields?: LegacyFormField[]
  
  /** 表单数据 (v-model) */
  modelValue?: Record<string, any>
  
  /** 标签宽度 */
  labelWidth?: string | number
  
  /** 表单尺寸 */
  size?: 'large' | 'default' | 'small'
  
  /** 是否禁用 */
  disabled?: boolean
  
  /** 是否显示提交按钮 */
  showSubmit?: boolean
  
  /** 提交按钮文本 */
  submitText?: string
  
  /** 自定义组件注册 */
  customComponents?: Record<string, Component>
}

interface SmartFormBuilderEmits {
  /** 表单数据变化 */
  (e: 'update:modelValue', data: Record<string, any>): void
  
  /** 表单提交 */
  (e: 'submit', data: Record<string, any>): void
  
  /** 表单验证失败 */
  (e: 'validate-error', errors: Record<string, string[]>): void
  
  /** 字段值变化 */
  (e: 'field-change', fieldName: string, value: any): void
}

interface SmartFormBuilderExpose {
  /** 验证表单 */
  validate: () => Promise<boolean>
  
  /** 重置表单 */
  reset: () => void
  
  /** 清空验证 */
  clearValidate: (fields?: string[]) => void
  
  /** 获取表单数据 */
  getFormData: () => Record<string, any>
  
  /** 设置表单数据 */
  setFormData: (data: Record<string, any>) => void
  
  /** 设置字段值 */
  setFieldValue: (field: string, value: any) => void
  
  /** 获取字段值 */
  getFieldValue: (field: string) => any
}
```

#### SmartFormDesigner.vue

```typescript
interface SmartFormDesignerProps {
  /** 表单Schema (v-model) */
  modelValue?: FormConfig
  
  /** 自定义组件库 */
  customComponents?: CustomComponentConfig[]
  
  /** 是否只读模式 */
  readonly?: boolean
}

interface SmartFormDesignerEmits {
  /** Schema变化 */
  (e: 'update:modelValue', schema: FormConfig): void
  
  /** 字段选中 */
  (e: 'field-select', field: FormFieldConfig): void
  
  /** Schema保存 */
  (e: 'save', schema: FormConfig): void
}

interface SmartFormDesignerExpose {
  /** 导出Schema */
  exportSchema: () => string
  
  /** 导入Schema */
  importSchema: (json: string) => void
  
  /** 预览表单 */
  preview: () => void
  
  /** 清空画布 */
  clear: () => void
}
```

### 5.2 使用示例

#### 示例1: 基础表单渲染

```vue
<template>
  <SmartFormBuilder
    v-model="formData"
    :schema="formSchema"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SmartFormBuilder } from '@smartabp/lowcode-core'
import type { FormConfig } from '@smartabp/lowcode-core/types'

const formData = ref({})

const formSchema: FormConfig = {
  id: 'work-order-form',
  name: '工单表单',
  layout: 'horizontal',
  labelWidth: '120px',
  fields: [
    {
      id: 'workOrderNo',
      name: 'workOrderNo',
      type: 'text',
      label: '工单号',
      required: true,
      placeholder: '请输入工单号'
    },
    {
      id: 'productName',
      name: 'productName',
      type: 'select',
      label: '产品名称',
      required: true,
      optionsSource: {
        url: '/api/products',
        labelField: 'name',
        valueField: 'id'
      }
    },
    {
      id: 'quantity',
      name: 'quantity',
      type: 'number',
      label: '数量',
      required: true,
      min: 1,
      max: 10000
    }
  ]
}

const handleSubmit = (data: Record<string, any>) => {
  console.log('提交数据:', data)
  // 调用API提交...
}
</script>
```

#### 示例2: MES设备参数表单

```vue
<template>
  <SmartFormBuilder
    v-model="deviceParams"
    :schema="deviceParamSchema"
    :custom-components="mesComponents"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SmartFormBuilder } from '@smartabp/lowcode-core'
import { DeviceParameterField } from '@smartabp/lowcode-core/custom-components'

const deviceParams = ref({})

const mesComponents = {
  DeviceParameterField
}

const deviceParamSchema: FormConfig = {
  id: 'device-config',
  name: '设备参数配置',
  layout: 'grid',
  gridLayout: {
    cols: 2,
    gutter: 20
  },
  fields: [
    {
      id: 'deviceId',
      name: 'deviceId',
      type: 'deviceParameter', // 自定义MES组件
      label: '设备',
      required: true,
      span: 24
    },
    {
      id: 'temperature',
      name: 'temperature',
      type: 'number',
      label: '温度设定',
      min: 0,
      max: 300,
      precision: 1,
      span: 12
    },
    {
      id: 'pressure',
      name: 'pressure',
      type: 'number',
      label: '压力设定',
      min: 0,
      max: 100,
      precision: 2,
      span: 12
    }
  ],
  linkageRules: [
    {
      id: 'rule1',
      name: '温度范围动态调整',
      conditions: [
        {
          field: 'deviceId',
          operator: 'eq',
          value: 'device001'
        }
      ],
      actions: [
        {
          type: 'setValue',
          target: 'temperature',
          value: { min: 50, max: 200 }
        }
      ]
    }
  ]
}
</script>
```

#### 示例3: 可视化表单设计器

```vue
<template>
  <SmartFormDesigner
    v-model="formSchema"
    :custom-components="customComponents"
    @save="handleSave"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SmartFormDesigner } from '@smartabp/lowcode-core'
import type { FormConfig, CustomComponentConfig } from '@smartabp/lowcode-core/types'

const formSchema = ref<FormConfig>({
  id: '',
  name: '',
  layout: 'horizontal',
  fields: []
})

const customComponents: CustomComponentConfig[] = [
  {
    type: 'deviceParameter',
    label: '设备参数',
    icon: 'setting',
    category: 'MES',
    defaultProps: {
      label: '设备参数',
      required: false
    }
  },
  {
    type: 'qualityCheck',
    label: '质检字段',
    icon: 'check',
    category: 'MES',
    defaultProps: {
      label: '质检项',
      required: true
    }
  }
]

const handleSave = async (schema: FormConfig) => {
  // 保存到后端
  await api.post('/api/form-templates', schema)
  ElMessage.success('保存成功')
}
</script>
```

---

## 6. 实施计划

### 6.1 里程碑

```
📅 总工期: 4周
├─ 第1周 (阶段1: 基础集成)
│  ├─ Day 1-2: form-create集成 + 适配器开发
│  ├─ Day 3-4: 30+字段类型支持
│  └─ Day 5: 单元测试 + 文档
├─ 第2周 (阶段2: MES/IoT扩展)
│  ├─ Day 1-2: 6个自定义MES/IoT组件
│  ├─ Day 3: 动态联动规则引擎
│  ├─ Day 4: 远程数据源 + 表单模板
│  └─ Day 5: 集成测试 + 文档
├─ 第3周 (阶段3: 可视化设计器)
│  ├─ Day 1-2: 设计器核心集成
│  ├─ Day 3: 组件库面板 + 属性编辑器
│  ├─ Day 4: 导入/导出功能
│  └─ Day 5: E2E测试 + 用户手册
└─ 第4周 (验收与优化)
   ├─ Day 1-2: 性能优化 (首屏<1s)
   ├─ Day 3: 代码审查 + 质量门禁
   ├─ Day 4: 用户验收测试
   └─ Day 5: 发布准备 + 培训材料
```

### 6.2 任务分解

#### 第1周任务清单

| 任务ID | 任务名称 | 负责人 | 工时 | 依赖 | 产出 |
|-------|---------|--------|------|------|------|
| T1.1 | form-create依赖安装 | 开发 | 0.5h | - | package.json |
| T1.2 | FormSchemaAdapter开发 | 开发 | 8h | T1.1 | FormSchemaAdapter.ts |
| T1.3 | SmartFormBuilder.vue重构 | 开发 | 8h | T1.2 | SmartFormBuilder.vue |
| T1.4 | 30+字段类型映射 | 开发 | 8h | T1.3 | 类型映射表 |
| T1.5 | 验证规则转换 | 开发 | 4h | T1.4 | 验证适配器 |
| T1.6 | 向后兼容API | 开发 | 4h | T1.3 | 兼容层 |
| T1.7 | 单元测试 | 测试 | 4h | T1.6 | 测试用例 |
| T1.8 | API文档 | 开发 | 2h | T1.6 | README.md |

#### 第2周任务清单

| 任务ID | 任务名称 | 负责人 | 工时 | 依赖 | 产出 |
|-------|---------|--------|------|------|------|
| T2.1 | DeviceParameterField | 开发 | 4h | T1.8 | 组件 |
| T2.2 | QualityCheckField | 开发 | 4h | T1.8 | 组件 |
| T2.3 | WorkOrderField | 开发 | 4h | T1.8 | 组件 |
| T2.4 | BarcodeScanner | 开发 | 4h | T1.8 | 组件 |
| T2.5 | SensorDataField | 开发 | 4h | T1.8 | 组件 |
| T2.6 | ProductionLineField | 开发 | 4h | T1.8 | 组件 |
| T2.7 | 动态联动规则引擎 | 开发 | 6h | T1.8 | LinkageEngine.ts |
| T2.8 | 远程数据源适配器 | 开发 | 4h | T1.8 | DataSourceAdapter.ts |
| T2.9 | 表单模板管理 | 开发 | 4h | T1.8 | TemplateManager.ts |
| T2.10 | 集成测试 | 测试 | 2h | T2.9 | 测试用例 |

#### 第3周任务清单

| 任务ID | 任务名称 | 负责人 | 工时 | 依赖 | 产出 |
|-------|---------|--------|------|------|------|
| T3.1 | 设计器核心集成 | 开发 | 8h | T2.10 | SmartFormDesigner.vue |
| T3.2 | 组件库面板 | 开发 | 4h | T3.1 | FieldComponentLibrary.vue |
| T3.3 | 属性编辑器 | 开发 | 6h | T3.1 | FieldPropertyEditor.vue |
| T3.4 | 拖拽处理 | 开发 | 4h | T3.2 | DragDropHandler.ts |
| T3.5 | 实时预览 | 开发 | 4h | T3.1 | PreviewDialog.vue |
| T3.6 | Schema导入/导出 | 开发 | 4h | T3.1 | SchemaIOManager.ts |
| T3.7 | 代码生成 | 开发 | 4h | T3.6 | CodeGenerator.ts |
| T3.8 | E2E测试 | 测试 | 4h | T3.7 | E2E测试用例 |

#### 第4周任务清单

| 任务ID | 任务名称 | 负责人 | 工时 | 依赖 | 产出 |
|-------|---------|--------|------|------|------|
| T4.1 | 性能优化 | 开发 | 8h | T3.8 | 性能优化报告 |
| T4.2 | 代码审查 | 团队 | 4h | T4.1 | 审查报告 |
| T4.3 | 质量门禁 | CI/CD | 2h | T4.2 | 门禁通过 |
| T4.4 | 用户验收测试 | 测试 | 4h | T4.3 | UAT报告 |
| T4.5 | 发布准备 | 开发 | 4h | T4.4 | 发布包 |
| T4.6 | 培训材料 | 技术 | 4h | T4.5 | 培训PPT |
| T4.7 | 发布 | DevOps | 2h | T4.6 | 正式版本 |

### 6.3 风险管理

| 风险ID | 风险描述 | 概率 | 影响 | 缓解措施 | 负责人 |
|-------|---------|------|------|---------|--------|
| R1 | form-create版本兼容性 | 中 | 高 | 提前验证，锁定版本 | 开发 |
| R2 | 自定义组件开发复杂度 | 中 | 中 | 简化设计，MVP优先 | 开发 |
| R3 | 性能不达标 | 低 | 高 | 提前性能测试，优化 | 开发 |
| R4 | 用户学习成本高 | 中 | 中 | 完善文档，提供培训 | 技术 |
| R5 | 向后兼容问题 | 低 | 高 | 严格测试兼容性 | 测试 |

---

## 7. 质量保证

### 7.1 测试策略

#### 单元测试 (覆盖率 ≥80%)

```typescript
// FormSchemaAdapter.test.ts
import { describe, it, expect } from 'vitest'
import { FormSchemaAdapter } from '../adapters/FormSchemaAdapter'

describe('FormSchemaAdapter', () => {
  const adapter = new FormSchemaAdapter()

  describe('toFormCreate', () => {
    it('should convert basic field correctly', () => {
      const config: FormConfig = {
        id: 'test',
        name: 'Test Form',
        layout: 'horizontal',
        fields: [
          {
            id: 'name',
            name: 'name',
            type: 'text',
            label: '姓名',
            required: true
          }
        ]
      }

      const result = adapter.toFormCreate(config)
      
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('input')
      expect(result[0].field).toBe('name')
      expect(result[0].title).toBe('姓名')
      expect(result[0].validate).toContainEqual({
        required: true,
        message: expect.any(String),
        trigger: 'blur'
      })
    })

    it('should convert select field with options', () => {
      const config: FormConfig = {
        id: 'test',
        name: 'Test Form',
        layout: 'horizontal',
        fields: [
          {
            id: 'gender',
            name: 'gender',
            type: 'select',
            label: '性别',
            options: [
              { label: '男', value: 'male' },
              { label: '女', value: 'female' }
            ]
          }
        ]
      }

      const result = adapter.toFormCreate(config)
      
      expect(result[0].type).toBe('select')
      expect(result[0].props?.options).toHaveLength(2)
    })
  })

  describe('fromFormCreate', () => {
    it('should reverse convert correctly', () => {
      const formCreateRules: FormCreateRule[] = [
        {
          type: 'input',
          field: 'name',
          title: '姓名',
          value: '',
          validate: [{ required: true, message: '姓名不能为空' }]
        }
      ]

      const result = adapter.fromFormCreate(formCreateRules)
      
      expect(result.fields).toHaveLength(1)
      expect(result.fields[0].name).toBe('name')
      expect(result.fields[0].type).toBe('text')
    })
  })
})
```

#### 集成测试

```typescript
// SmartFormBuilder.integration.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import SmartFormBuilder from '../SmartFormBuilder.vue'

describe('SmartFormBuilder Integration', () => {
  it('should render form with schema', async () => {
    const schema: FormConfig = {
      id: 'test-form',
      name: 'Test Form',
      layout: 'horizontal',
      fields: [
        { id: '1', name: 'name', type: 'text', label: '姓名' },
        { id: '2', name: 'age', type: 'number', label: '年龄' }
      ]
    }

    const wrapper = mount(SmartFormBuilder, {
      props: { schema }
    })

    expect(wrapper.find('.smart-form-builder').exists()).toBe(true)
    expect(wrapper.findAll('.el-form-item')).toHaveLength(2)
  })

  it('should emit submit event with form data', async () => {
    const schema: FormConfig = {
      id: 'test-form',
      name: 'Test Form',
      layout: 'horizontal',
      fields: [
        { id: '1', name: 'name', type: 'text', label: '姓名' }
      ]
    }

    const wrapper = mount(SmartFormBuilder, {
      props: { schema }
    })

    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')![0]).toEqual([{ name: '' }])
  })
})
```

#### E2E测试

```typescript
// smart-form-designer.e2e.spec.ts
import { test, expect } from '@playwright/test'

test.describe('SmartFormDesigner E2E', () => {
  test('should create form by dragging components', async ({ page }) => {
    await page.goto('/form-designer')

    // 从组件库拖拽输入框到画布
    await page.dragAndDrop(
      '.component-library .input-component',
      '.designer-canvas'
    )

    // 验证画布中出现了输入框
    await expect(page.locator('.designer-canvas .form-field')).toBeVisible()

    // 点击字段，打开属性编辑器
    await page.click('.designer-canvas .form-field')
    await expect(page.locator('.property-editor')).toBeVisible()

    // 修改字段属性
    await page.fill('.property-editor input[name="label"]', '用户名')
    await page.check('.property-editor input[name="required"]')

    // 保存表单
    await page.click('button:has-text("保存")')
    await expect(page.locator('.el-message--success')).toBeVisible()
  })

  test('should preview form correctly', async ({ page }) => {
    await page.goto('/form-designer')

    // 添加字段...

    // 点击预览
    await page.click('button:has-text("预览")')

    // 验证预览弹窗出现
    await expect(page.locator('.preview-dialog')).toBeVisible()

    // 验证表单可以正常填写
    await page.fill('.preview-dialog input[name="username"]', 'test')
    await expect(page.locator('.preview-dialog input[name="username"]')).toHaveValue('test')
  })
})
```

### 7.2 性能指标

| 指标 | 目标 | 测量方式 |
|-----|------|---------|
| **首屏渲染时间** | <1s | Chrome DevTools Performance |
| **1000字段渲染** | <2s | 压力测试 |
| **表单提交响应** | <100ms | 性能监控 |
| **内存占用** | <50MB | Chrome Memory Profiler |
| **包体积** | <200KB (gzip) | webpack-bundle-analyzer |

### 7.3 代码质量标准

```yaml
TypeScript:
  - 类型覆盖率: 100%
  - 严格模式: 启用
  - 禁止any: 是 (除必要情况)

ESLint:
  - 错误数: 0
  - 警告数: 0
  - 规则: @vue/eslint-config-typescript/recommended

代码复杂度:
  - 圈复杂度: <10
  - 函数长度: <50行
  - 文件长度: <500行

测试:
  - 单元测试覆盖率: ≥80%
  - 集成测试: 核心流程100%
  - E2E测试: 关键场景100%

文档:
  - API文档: 100%
  - 使用示例: 全覆盖
  - 类型注释: 100%
```

---

## 8. 附录

### 8.1 参考资料

- [form-create官方文档](http://www.form-create.com/)
- [form-create GitHub](https://github.com/xaboy/form-create)
- [Element Plus官方文档](https://element-plus.org/)
- [Vue 3官方文档](https://cn.vuejs.org/)
- [TypeScript官方文档](https://www.typescriptlang.org/)

### 8.2 相关文档

- `types/FormSchema.ts` - JSON Schema类型定义
- `README.md` - 使用指南
- `CHANGELOG.md` - 版本更新日志
- `CONTRIBUTING.md` - 贡献指南

### 8.3 联系方式

- **项目负责人**: SmartAbp架构团队
- **技术支持**: [support@smartabp.com](mailto:support@smartabp.com)
- **问题反馈**: [GitHub Issues](https://github.com/smartabp/hxlot/issues)

---

**文档版本**: 2.0.0  
**最后更新**: 2025-10-07  
**状态**: ✅ 审核通过，进入实施阶段

---

## 📊 设计决策记录 (ADR)

### ADR-001: 为什么选择集成form-create而非自研？

**决策日期**: 2025-10-07

**背景**:
现有SmartFormBuilder功能薄弱，需要快速提升到企业级水平。

**决策**:
选择集成form-create (5.7k stars) 而非自研。

**理由**:
1. **时间优势**: 集成2周 vs 自研3-6个月
2. **质量保证**: 5.7k stars，社区验证
3. **维护成本**: 社区维护，持续更新
4. **功能完整**: 30+组件，开箱即用
5. **扩展性**: 支持自定义组件

**后果**:
- ✅ 快速交付，2周可用
- ✅ 质量有保证，业界验证
- ✅ 维护成本低，社区支持
- ✅ 专注于业务价值（MES/IoT）
- ⚠️ 需要学习form-create API
- ⚠️ 依赖外部库，版本锁定

**替代方案**:
- Avue: 功能重，定制困难
- variant-form: 社区小
- Formily: 复杂度高
- 自研: 时间成本高

**状态**: ✅ 已采纳

---

## 🎯 下一步行动

1. ✅ **立即开始**: 阶段1基础集成（第1周）
2. ⏳ **准备工作**: 
   - 安装form-create依赖
   - 创建项目结构
   - 编写适配器
3. 📋 **跟踪进度**: 每日站会，周报告
4. 🎓 **团队培训**: form-create使用培训

---

**🔥 让我们站在巨人的肩膀上，快速打造企业级表单设计器！**

