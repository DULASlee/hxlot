<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="nativeType"
    @click="handleClick"
  >
    <span
      v-if="loading"
      class="base-button__loading"
    >
      <i class="el-icon-loading" />
    </span>
    <span
      v-if="icon && !loading"
      :class="`base-button__icon ${icon}`"
    />
    <span
      v-if="$slots.default"
      class="base-button__text"
    >
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * BaseButton - 基础按钮组件
 * 统一的按钮样式和交互
 */

interface Props {
  /**
   * 按钮类型
   */
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
  
  /**
   * 按钮尺寸
   */
  size?: 'large' | 'default' | 'small'
  
  /**
   * 是否禁用
   */
  disabled?: boolean
  
  /**
   * 是否加载中
   */
  loading?: boolean
  
  /**
   * 图标类名
   */
  icon?: string | null
  
  /**
   * 是否圆角
   */
  round?: boolean
  
  /**
   * 是否圆形
   */
  circle?: boolean
  
  /**
   * 原生type属性
   */
  nativeType?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'default',
  disabled: false,
  loading: false,
  round: false,
  circle: false,
  nativeType: 'button'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  return [
    'base-button',
    `base-button--${props.type}`,
    `base-button--${props.size}`,
    {
      'is-disabled': props.disabled,
      'is-loading': props.loading,
      'is-round': props.round,
      'is-circle': props.circle
    }
  ]
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  user-select: none;
}

.base-button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

/* 类型样式 */
.base-button--primary {
  color: #fff;
  background-color: #409eff;
  border-color: #409eff;
}

.base-button--primary:hover:not(.is-disabled) {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.base-button--success {
  color: #fff;
  background-color: #67c23a;
  border-color: #67c23a;
}

.base-button--success:hover:not(.is-disabled) {
  background-color: #85ce61;
  border-color: #85ce61;
}

.base-button--warning {
  color: #fff;
  background-color: #e6a23c;
  border-color: #e6a23c;
}

.base-button--warning:hover:not(.is-disabled) {
  background-color: #ebb563;
  border-color: #ebb563;
}

.base-button--danger {
  color: #fff;
  background-color: #f56c6c;
  border-color: #f56c6c;
}

.base-button--danger:hover:not(.is-disabled) {
  background-color: #f78989;
  border-color: #f78989;
}

.base-button--info {
  color: #fff;
  background-color: #909399;
  border-color: #909399;
}

.base-button--info:hover:not(.is-disabled) {
  background-color: #a6a9ad;
  border-color: #a6a9ad;
}

.base-button--text {
  color: #409eff;
  background-color: transparent;
  border-color: transparent;
  padding: 4px 8px;
}

.base-button--text:hover:not(.is-disabled) {
  color: #66b1ff;
  background-color: rgba(64, 158, 255, 0.1);
}

/* 尺寸样式 */
.base-button--large {
  padding: 12px 20px;
  font-size: 16px;
}

.base-button--small {
  padding: 6px 12px;
  font-size: 12px;
}

/* 状态样式 */
.base-button.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-button.is-loading {
  pointer-events: none;
}

.base-button.is-round {
  border-radius: 20px;
}

.base-button.is-circle {
  border-radius: 50%;
  padding: 8px;
}

.base-button__loading {
  display: inline-flex;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.base-button__icon {
  display: inline-flex;
  font-size: 1.2em;
}

.base-button__text {
  display: inline-flex;
}
</style>
