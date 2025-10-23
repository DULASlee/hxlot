<template>
  <div class="smart-input-wrapper" :class="wrapperClasses">
    <!-- 标签 -->
    <label v-if="label" :for="inputId" class="smart-input-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>

    <!-- 输入框容器 -->
    <div class="smart-input" :class="inputClasses">
      <!-- 左侧图标 -->
      <div v-if="$slots.iconLeft" class="input-icon-left">
        <slot name="iconLeft"></slot>
      </div>

      <!-- 输入框 -->
      <input
        :id="inputId"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :autocomplete="autocomplete"
        class="input-element"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keyup.enter="handleEnter"
      />

      <!-- 右侧图标 -->
      <div v-if="$slots.iconRight" class="input-icon-right">
        <slot name="iconRight"></slot>
      </div>

      <!-- 清空按钮 -->
      <div
        v-if="clearable && modelValue && !disabled && !readonly"
        class="input-clear"
        @click="handleClear"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M7 0C3.13 0 0 3.13 0 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm3.5 9.09L9.09 10.5 7 8.41 4.91 10.5 3.5 9.09 5.59 7 3.5 4.91 4.91 3.5 7 5.59 9.09 3.5l1.41 1.41L8.41 7l2.09 2.09z"/>
        </svg>
      </div>

      <!-- Loading图标 -->
      <div v-if="loading" class="input-loading">
        <svg class="spinner" width="14" height="14" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round">
            <animate attributeName="stroke-dasharray" values="1,200;89,200;89,200" dur="1.5s" repeatCount="indefinite"/>
            <animate attributeName="stroke-dashoffset" values="0;-35;-124" dur="1.5s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
    </div>

    <!-- 帮助文本/错误提示 -->
    <transition name="slide-down">
      <div v-if="showMessage" class="input-message" :class="messageClass">
        <svg v-if="error" class="message-icon" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M7 0C3.13 0 0 3.13 0 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm1 10H6V6h2v4zm0-5H6V3h2v2z"/>
        </svg>
        <span class="message-text">{{ currentMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useSlots, watch } from 'vue'

/**
 * SmartInput组件Props
 */
interface Props {
  /** v-model绑定值 */
  modelValue?: string | number
  /** 输入框类型 */
  type?: 'text' | 'password' | 'email' | 'tel' | 'url' | 'number'
  /** 标签 */
  label?: string
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否必填 */
  required?: boolean
  /** 是否可清空 */
  clearable?: boolean
  /** 加载状态 */
  loading?: boolean
  /** 错误提示 */
  error?: string
  /** 帮助文本 */
  hint?: string
  /** 最大长度 */
  maxlength?: number
  /** 自动完成 */
  autocomplete?: string
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  label: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  required: false,
  clearable: false,
  loading: false,
  error: '',
  hint: '',
  autocomplete: 'off',
  size: 'md',
})

/**
 * 组件Emits
 */
const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
  'clear': []
  'enter': []
}>()

const slots = useSlots()
const inputRef = ref<HTMLInputElement>()
const isFocused = ref(false)
const showError = ref(false)

/**
 * 生成唯一ID
 */
const inputId = computed(() => {
  return `smart-input-${Math.random().toString(36).substr(2, 9)}`
})

/**
 * 容器类名
 */
const wrapperClasses = computed(() => ({
  [`smart-input--${props.size}`]: true,
  'smart-input--disabled': props.disabled,
  'smart-input--readonly': props.readonly,
}))

/**
 * 输入框类名
 */
const inputClasses = computed(() => ({
  'is-focused': isFocused.value,
  'is-error': !!props.error && showError.value,
  'is-disabled': props.disabled,
  'is-readonly': props.readonly,
  'has-icon-left': !!slots.iconLeft,
  'has-icon-right': !!slots.iconRight || props.clearable || props.loading,
}))

/**
 * 当前显示的消息
 */
const currentMessage = computed(() => {
  if (props.error && showError.value) return props.error
  if (props.hint && !isFocused.value) return props.hint
  return ''
})

/**
 * 是否显示消息
 */
const showMessage = computed(() => !!currentMessage.value)

/**
 * 消息类名
 */
const messageClass = computed(() => ({
  'is-error': !!props.error && showError.value,
  'is-hint': !!props.hint && !props.error,
}))

/**
 * 处理输入事件
 */
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value

  // 如果是number类型，转换为数字
  if (props.type === 'number' && value !== '') {
    value = parseFloat(value)
    if (isNaN(value)) value = ''
  }

  emit('update:modelValue', value)

  // 输入时隐藏错误提示（实时验证）
  if (showError.value) {
    showError.value = false
  }
}

/**
 * 处理聚焦事件
 */
function handleFocus(event: FocusEvent) {
  isFocused.value = true
  showError.value = false
  emit('focus', event)
}

/**
 * 处理失焦事件
 */
function handleBlur(event: FocusEvent) {
  isFocused.value = false

  // 失焦时显示错误（如果有）
  if (props.error) {
    showError.value = true
  }

  emit('blur', event)
}

/**
 * 处理回车事件
 */
function handleEnter() {
  emit('enter')
}

/**
 * 处理清空事件
 */
function handleClear() {
  emit('update:modelValue', '')
  emit('clear')

  // 聚焦到输入框
  inputRef.value?.focus()
}

/**
 * 暴露方法
 */
defineExpose({
  /** 聚焦输入框 */
  focus: () => inputRef.value?.focus(),
  /** 失焦输入框 */
  blur: () => inputRef.value?.blur(),
  /** 选中文本 */
  select: () => inputRef.value?.select(),
})

/**
 * 监听error变化，自动显示错误
 */
watch(() => props.error, (newError) => {
  if (newError && !isFocused.value) {
    showError.value = true
  }
})
</script>

<style scoped>
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SmartInput组件样式
   基于设计令牌系统
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

.smart-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

/* 标签 */
.smart-input-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.required-mark {
  color: var(--color-error);
  margin-left: var(--spacing-1);
}

/* 输入框容器 */
.smart-input {
  position: relative;
  display: flex;
  align-items: center;
  border: var(--border-width-base) solid var(--color-border-base);
  border-radius: var(--border-radius-md);
  background: var(--color-bg-elevated);
  transition: all var(--duration-fast) var(--ease);
}

/* 尺寸变体 */
.smart-input--sm .smart-input {
  height: 32px;
}

.smart-input--md .smart-input {
  height: 40px;
}

.smart-input--lg .smart-input {
  height: 48px;
}

/* 悬停状态 */
.smart-input:hover:not(.is-disabled):not(.is-readonly) {
  border-color: var(--color-border-hover);
}

/* 聚焦状态 */
.smart-input.is-focused {
  border-width: var(--border-width-thick);
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

/* 错误状态 */
.smart-input.is-error {
  border-color: var(--color-error);
  background: rgba(255, 77, 79, 0.04);
}

.smart-input.is-error.is-focused {
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.1);
}

/* 禁用状态 */
.smart-input.is-disabled {
  border-color: var(--color-border-base);
  background: var(--color-gray-100);
  cursor: not-allowed;
}

/* 只读状态 */
.smart-input.is-readonly {
  border-color: var(--color-border-base);
  background: var(--color-bg-secondary);
}

/* 输入框元素 */
.input-element {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 0 var(--spacing-4);
  font-size: var(--font-size-sm);
  font-family: inherit;
  color: var(--color-text-primary);
  line-height: var(--line-height-normal);
}

.smart-input.has-icon-left .input-element {
  padding-left: 0;
}

.smart-input.has-icon-right .input-element {
  padding-right: 0;
}

.input-element::placeholder {
  color: var(--color-text-tertiary);
}

.input-element:disabled {
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

/* 图标容器 */
.input-icon-left,
.input-icon-right,
.input-clear,
.input-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--spacing-3);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.input-icon-left {
  padding-left: var(--spacing-4);
}

.input-icon-right {
  padding-right: var(--spacing-4);
}

/* 清空按钮 */
.input-clear {
  cursor: pointer;
  color: var(--color-text-tertiary);
  transition: color var(--duration-fast) var(--ease);
  padding-right: var(--spacing-4);
}

.input-clear:hover {
  color: var(--color-text-secondary);
}

/* Loading动画 */
.input-loading {
  padding-right: var(--spacing-4);
}

.spinner {
  animation: spin 1.5s linear infinite;
  color: var(--color-primary-500);
}

/* 消息文本 */
.input-message {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-tight);
  padding-top: var(--spacing-1);
}

.input-message.is-error {
  color: var(--color-error);
}

.input-message.is-hint {
  color: var(--color-text-secondary);
}

.message-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.message-text {
  flex: 1;
}

/* 动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--duration-fast) var(--ease-out);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
