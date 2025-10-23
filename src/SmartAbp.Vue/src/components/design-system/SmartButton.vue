<template>
  <button
    :type="nativeType"
    :disabled="disabled || loading"
    :class="buttonClasses"
    class="smart-button"
    @click="handleClick"
  >
    <!-- Loading图标 -->
    <span v-if="loading" class="button-loading">
      <svg class="spinner" width="14" height="14" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round">
          <animate attributeName="stroke-dasharray" values="1,200;89,200;89,200" dur="1.5s" repeatCount="indefinite"/>
          <animate attributeName="stroke-dashoffset" values="0;-35;-124" dur="1.5s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </span>

    <!-- 按钮内容 -->
    <span :class="['button-content', { 'is-hidden': loading }]">
      <!-- 默认插槽 -->
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * SmartButton组件Props
 */
interface Props {
  /** 按钮变体 */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'text'
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否禁用 */
  disabled?: boolean
  /** 加载状态 */
  loading?: boolean
  /** 是否占满宽度 */
  block?: boolean
  /** 原生类型 */
  nativeType?: 'button' | 'submit' | 'reset'
  /** 是否圆形 */
  circle?: boolean
  /** 是否图标按钮 */
  icon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
  nativeType: 'button',
  circle: false,
  icon: false,
})

/**
 * 组件Emits
 */
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

/**
 * 按钮类名
 */
const buttonClasses = computed(() => {
  return {
    [`smart-button--${props.variant}`]: true,
    [`smart-button--${props.size}`]: true,
    'is-disabled': props.disabled,
    'is-loading': props.loading,
    'is-block': props.block,
    'is-circle': props.circle,
    'is-icon': props.icon,
  }
})

/**
 * 处理点击事件
 */
function handleClick(event: MouseEvent) {
  if (props.disabled || props.loading) {
    return
  }
  emit('click', event)
}
</script>

<style scoped>
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SmartButton组件样式
   基于设计令牌系统
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

.smart-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  border: var(--border-width-base) solid transparent;
  border-radius: var(--border-radius-md);
  font-family: inherit;
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
  cursor: pointer;
  user-select: none;
  transition: all var(--duration-fast) var(--ease);
  white-space: nowrap;
  outline: none;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   尺寸变体
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

.smart-button--sm {
  height: 32px;
  padding: 0 var(--spacing-3);
  font-size: var(--font-size-sm);
}

.smart-button--sm.is-icon {
  width: 32px;
  padding: 0;
}

.smart-button--md {
  height: 40px;
  padding: 0 var(--spacing-4);
  font-size: var(--font-size-sm);
}

.smart-button--md.is-icon {
  width: 40px;
  padding: 0;
}

.smart-button--lg {
  height: 48px;
  padding: 0 var(--spacing-6);
  font-size: var(--font-size-base);
}

.smart-button--lg.is-icon {
  width: 48px;
  padding: 0;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Primary变体（主要按钮）
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

.smart-button--primary {
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
  color: var(--color-text-inverse);
}

.smart-button--primary:hover:not(.is-disabled):not(.is-loading) {
  background: var(--color-primary-600);
  border-color: var(--color-primary-600);
}

.smart-button--primary:active:not(.is-disabled):not(.is-loading) {
  background: var(--color-primary-700);
  border-color: var(--color-primary-700);
}

.smart-button--primary:focus-visible {
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Secondary变体（次要按钮）
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

.smart-button--secondary {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-base);
  color: var(--color-text-primary);
}

.smart-button--secondary:hover:not(.is-disabled):not(.is-loading) {
  border-color: var(--color-primary-500);
  color: var(--color-primary-500);
}

.smart-button--secondary:active:not(.is-disabled):not(.is-loading) {
  background: var(--color-primary-50);
  border-color: var(--color-primary-600);
  color: var(--color-primary-600);
}

.smart-button--secondary:focus-visible {
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Success变体（成功按钮）
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

.smart-button--success {
  background: var(--color-success);
  border-color: var(--color-success);
  color: var(--color-text-inverse);
}

.smart-button--success:hover:not(.is-disabled):not(.is-loading) {
  background: #389E0D;
  border-color: #389E0D;
}

.smart-button--success:active:not(.is-disabled):not(.is-loading) {
  background: #237804;
  border-color: #237804;
}

.smart-button--success:focus-visible {
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Warning变体（警告按钮）
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

.smart-button--warning {
  background: var(--color-warning);
  border-color: var(--color-warning);
  color: var(--color-text-inverse);
}

.smart-button--warning:hover:not(.is-disabled):not(.is-loading) {
  background: #D48806;
  border-color: #D48806;
}

.smart-button--warning:active:not(.is-disabled):not(.is-loading) {
  background: #AD6800;
  border-color: #AD6800;
}

.smart-button--warning:focus-visible {
  box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.2);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Danger变体（危险按钮）
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

.smart-button--danger {
  background: var(--color-error);
  border-color: var(--color-error);
  color: var(--color-text-inverse);
}

.smart-button--danger:hover:not(.is-disabled):not(.is-loading) {
  background: #CF1322;
  border-color: #CF1322;
}

.smart-button--danger:active:not(.is-disabled):not(.is-loading) {
  background: #A8071A;
  border-color: #A8071A;
}

.smart-button--danger:focus-visible {
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Ghost变体（幽灵按钮）
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

.smart-button--ghost {
  background: transparent;
  border-color: var(--color-primary-500);
  color: var(--color-primary-500);
}

.smart-button--ghost:hover:not(.is-disabled):not(.is-loading) {
  background: var(--color-primary-50);
  border-color: var(--color-primary-600);
  color: var(--color-primary-600);
}

.smart-button--ghost:active:not(.is-disabled):not(.is-loading) {
  background: var(--color-primary-100);
  border-color: var(--color-primary-700);
  color: var(--color-primary-700);
}

.smart-button--ghost:focus-visible {
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Text变体（文本按钮）
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

.smart-button--text {
  background: transparent;
  border-color: transparent;
  color: var(--color-primary-500);
}

.smart-button--text:hover:not(.is-disabled):not(.is-loading) {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
}

.smart-button--text:active:not(.is-disabled):not(.is-loading) {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}

.smart-button--text:focus-visible {
  background: var(--color-primary-50);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   状态变体
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* 禁用状态 */
.smart-button.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading状态 */
.smart-button.is-loading {
  cursor: wait;
}

/* 块级按钮 */
.smart-button.is-block {
  display: flex;
  width: 100%;
}

/* 圆形按钮 */
.smart-button.is-circle {
  border-radius: var(--border-radius-full);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   按钮内容
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

.button-content {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  transition: opacity var(--duration-fast) var(--ease);
}

.button-content.is-hidden {
  opacity: 0;
}

/* Loading图标 */
.button-loading {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  animation: spin 1.5s linear infinite;
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
