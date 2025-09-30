# SmartAbp 统一组件接口系统

## 📋 概述

本目录定义了SmartAbp企业级低代码平台的统一组件接口体系，确保所有组件都遵循一致的设计规范和API标准。

## 🎯 设计目标

1. **一致性** - 所有组件使用统一的Props接口
2. **可复用性** - 通过继承和组合实现接口复用
3. **类型安全** - 100% TypeScript类型支持
4. **可扩展性** - 支持自定义扩展
5. **无障碍访问** - 内置ARIA支持

## 📦 核心接口

### BaseComponentProps

**所有组件的基础接口**，提供通用属性支持。

```typescript
export interface BaseComponentProps {
  id?: string                    // 组件唯一标识
  className?: string              // CSS类名
  testId?: string                 // 测试ID
  disabled?: boolean              // 是否禁用
  loading?: boolean               // 是否加载中
  variant?: ComponentVariant      // 组件样式变体
  size?: ComponentSize            // 组件尺寸
  ariaLabel?: string              // ARIA标签
  role?: string                   // ARIA角色
  style?: Record<string, any>     // 自定义样式
  dataAttrs?: Record<string, any> // 自定义数据属性
}
```

**使用示例**:

```vue
<script setup lang="ts">
import type { BaseComponentProps } from '@smartabp/lowcode-shared/types'

interface Props extends BaseComponentProps {
  title: string
  content?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  disabled: false,
  loading: false
})
</script>

<template>
  <div
    :id="props.id"
    :class="props.className"
    :data-testid="props.testId"
    :aria-label="props.ariaLabel"
    :role="props.role"
    :style="props.style"
    v-bind="props.dataAttrs"
  >
    <h3>{{ props.title }}</h3>
    <p v-if="props.content">{{ props.content }}</p>
  </div>
</template>
```

---

### ValidatableComponentProps

**可验证组件接口**，继承自BaseComponentProps，增加表单验证支持。

```typescript
export interface ValidatableComponentProps extends BaseComponentProps {
  required?: boolean              // 是否必填
  rules?: ValidationRule[]        // 验证规则
  errorMessage?: string           // 错误提示信息
  showValidation?: boolean        // 是否显示验证状态
}
```

**使用场景**: 表单输入、数据录入组件

**使用示例**:

```vue
<script setup lang="ts">
import type { ValidatableComponentProps } from '@smartabp/lowcode-shared/types'
import { ref, computed } from 'vue'

interface Props extends ValidatableComponentProps {
  modelValue: string
  label: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isValid = computed(() => {
  if (!props.required) return true
  return !!props.modelValue
})
</script>

<template>
  <div :class="{ 'has-error': !isValid && props.showValidation }">
    <label>{{ props.label }}</label>
    <input
      :value="props.modelValue"
      @input="emit('update:modelValue', $event.target.value)"
      :required="props.required"
      :disabled="props.disabled"
    />
    <span v-if="!isValid && props.showValidation" class="error">
      {{ props.errorMessage || '此字段为必填项' }}
    </span>
  </div>
</template>
```

---

### FormComponentProps

**表单组件接口**，继承自ValidatableComponentProps，专为表单控件设计。

```typescript
export interface FormComponentProps extends ValidatableComponentProps {
  name?: string                   // 字段名称
  value?: unknown                 // 字段值
  placeholder?: string            // 占位符
  readonly?: boolean              // 是否只读
  autofocus?: boolean             // 自动聚焦
}
```

**使用场景**: Input、Select、Textarea等表单控件

**最佳实践**:

```vue
<script setup lang="ts">
import type { FormComponentProps } from '@smartabp/lowcode-shared/types'

interface Props extends FormComponentProps {
  type?: 'text' | 'email' | 'password'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  readonly: false,
  autofocus: false
})
</script>

<template>
  <input
    :type="props.type"
    :name="props.name"
    :value="props.value"
    :placeholder="props.placeholder"
    :readonly="props.readonly"
    :autofocus="props.autofocus"
    :disabled="props.disabled"
  />
</template>
```

---

### ContainerComponentProps

**容器组件接口**，用于布局容器组件。

```typescript
export interface ContainerComponentProps extends BaseComponentProps {
  tag?: string                    // 容器标签名
  padding?: ComponentSize | string // 内边距
  margin?: ComponentSize | string  // 外边距
  fluid?: boolean                  // 是否流式布局
}
```

**使用场景**: Card、Panel、Section等容器组件

**使用示例**:

```vue
<script setup lang="ts">
import type { ContainerComponentProps } from '@smartabp/lowcode-shared/types'

const props = withDefaults(defineProps<ContainerComponentProps>(), {
  tag: 'div',
  padding: 'md',
  fluid: false
})
</script>

<template>
  <component
    :is="props.tag"
    :class="[
      'container',
      `padding-${props.padding}`,
      `margin-${props.margin}`,
      { 'container-fluid': props.fluid }
    ]"
  >
    <slot />
  </component>
</template>
```

---

### InteractiveComponentProps

**交互组件接口**，用于需要用户交互的组件。

```typescript
export interface InteractiveComponentProps extends BaseComponentProps {
  clickable?: boolean             // 是否可点击
  draggable?: boolean             // 是否可拖拽
  selectable?: boolean            // 是否可选择
  focused?: boolean               // 是否聚焦
  tooltip?: string                // 悬停提示
}
```

**使用场景**: Button、Card、ListItem等交互组件

**使用示例**:

```vue
<script setup lang="ts">
import type { InteractiveComponentProps } from '@smartabp/lowcode-shared/types'
import { ref } from 'vue'

interface Props extends InteractiveComponentProps {
  label: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()

const isFocused = ref(props.focused || false)
</script>

<template>
  <button
    :class="{ 
      'is-clickable': props.clickable,
      'is-focused': isFocused 
    }"
    :draggable="props.draggable"
    :disabled="props.disabled"
    :title="props.tooltip"
    @click="emit('click')"
    @focus="isFocused = true"
    @blur="isFocused = false"
  >
    {{ props.label }}
  </button>
</template>
```

---

## 🎨 组件类型枚举

### ComponentSize

组件尺寸标准化枚举：

```typescript
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
```

**映射表**:
- `xs`: 超小尺寸 (20px)
- `sm`: 小尺寸 (28px)
- `md`: 中等尺寸 (36px) - 默认
- `lg`: 大尺寸 (44px)
- `xl`: 超大尺寸 (52px)

### ComponentVariant

组件样式变体：

```typescript
export type ComponentVariant = 
  | 'primary'    // 主要样式
  | 'secondary'  // 次要样式
  | 'danger'     // 危险操作
  | 'success'    // 成功状态
  | 'warning'    // 警告状态
  | 'info'       // 信息提示
  | 'default'    // 默认样式
```

### ComponentState

组件状态：

```typescript
export type ComponentState = 
  | 'idle'       // 空闲
  | 'loading'    // 加载中
  | 'success'    // 成功
  | 'error'      // 错误
  | 'disabled'   // 禁用
```

---

## 🔧 验证规则系统

### ValidationRule

```typescript
export interface ValidationRule {
  type: 'required' | 'email' | 'url' | 'pattern' | 'custom'
  message: string
  pattern?: RegExp
  validator?: (value: unknown) => boolean | Promise<boolean>
  trigger?: 'blur' | 'change' | 'submit'
}
```

**使用示例**:

```typescript
const emailRules: ValidationRule[] = [
  {
    type: 'required',
    message: '邮箱地址为必填项',
    trigger: 'blur'
  },
  {
    type: 'email',
    message: '请输入有效的邮箱地址',
    trigger: 'change'
  }
]

const customRule: ValidationRule = {
  type: 'custom',
  message: '密码强度不足',
  validator: (value: unknown) => {
    const password = value as string
    return password.length >= 8 && /[A-Z]/.test(password)
  },
  trigger: 'change'
}
```

---

## 📦 组件元数据

### ComponentMetadata

用于组件注册和文档生成：

```typescript
export interface ComponentMetadata {
  name: string                    // 组件名称
  version: string                 // 组件版本
  description?: string            // 组件描述
  author?: string                 // 组件作者
  tags?: string[]                 // 组件标签
  icon?: string                   // 组件图标
  deprecated?: boolean            // 是否已废弃
  deprecationReason?: string      // 废弃原因
  replacement?: string            // 替代组件
}
```

**使用示例**:

```typescript
export const metadata: ComponentMetadata = {
  name: 'SmartButton',
  version: '1.0.0',
  description: '企业级按钮组件',
  author: 'SmartAbp Team',
  tags: ['button', 'interactive', 'form'],
  icon: 'mdi-button-cursor'
}
```

---

## 🎯 最佳实践

### 1. 接口继承链

推荐的接口继承层次：

```
BaseComponentProps
  ├─ ValidatableComponentProps
  │    └─ FormComponentProps
  ├─ ContainerComponentProps
  └─ InteractiveComponentProps
```

### 2. Props默认值

始终为Props提供合理的默认值：

```typescript
const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  disabled: false,
  loading: false,
  required: false
})
```

### 3. 类型扩展

自定义组件时，通过继承扩展接口：

```typescript
interface CustomButtonProps extends InteractiveComponentProps {
  icon?: string
  iconPosition?: 'left' | 'right'
  block?: boolean
}
```

### 4. 避免重复

不要在组件中重新定义已有的基础属性：

❌ **错误示例**:
```typescript
interface MyComponentProps {
  id: string        // ❌ 已在BaseComponentProps中定义
  disabled: boolean // ❌ 已在BaseComponentProps中定义
  customProp: string
}
```

✅ **正确示例**:
```typescript
interface MyComponentProps extends BaseComponentProps {
  customProp: string // ✅ 只定义自定义属性
}
```

---

## 📚 相关资源

- **类型定义**: `./component-base.ts`
- **验证器**: `../validators/common.ts`
- **常量定义**: `../constants/component.ts`
- **基础组件**: `../components/BaseComponent.ts`

---

## 🔄 版本历史

- **v1.0.0** (2025-09-30): 初始版本，定义核心接口体系

---

**维护者**: SmartAbp Architecture Team  
**最后更新**: 2025-09-30
