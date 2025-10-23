<template>
  <span :class="iconClasses" class="smart-icon" :style="iconStyles">
    <!-- 使用Iconify（支持Carbon Design Icons等） -->
    <Icon v-if="icon" :icon="icon" />

    <!-- 或使用插槽自定义图标 -->
    <slot v-else></slot>
  </span>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

/**
 * SmartIcon组件Props
 */
interface Props {
  /** 图标名称（Iconify格式，如 carbon:user） */
  icon?: string
  /** 图标尺寸 */
  size?: string | number
  /** 图标颜色 */
  color?: 'primary' | 'success' | 'warning' | 'error' | 'default' | string
  /** 是否可点击 */
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: '',
  size: '1em',
  color: 'default',
  clickable: false,
})

/**
 * 组件Emits
 */
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

/**
 * 图标类名
 */
const iconClasses = computed(() => ({
  'is-clickable': props.clickable,
  [`smart-icon--${props.color}`]: isPresetColor.value,
}))

/**
 * 图标样式
 */
const iconStyles = computed(() => {
  const styles: Record<string, string> = {}

  // 设置尺寸
  if (props.size) {
    const sizeValue = typeof props.size === 'number' ? `${props.size}px` : props.size
    styles.fontSize = sizeValue
    styles.width = sizeValue
    styles.height = sizeValue
  }

  // 设置自定义颜色
  if (!isPresetColor.value) {
    styles.color = props.color
  }

  return styles
})

/**
 * 是否是预设颜色
 */
const isPresetColor = computed(() => {
  return ['primary', 'success', 'warning', 'error', 'default'].includes(props.color)
})

/**
 * 处理点击事件
 */
function handleClick(event: MouseEvent) {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SmartIcon组件样式
   基于设计令牌系统
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

.smart-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  flex-shrink: 0;
  font-size: 1em;
  width: 1em;
  height: 1em;
  line-height: 1;
}

/* 可点击状态 */
.smart-icon.is-clickable {
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease);
}

.smart-icon.is-clickable:hover {
  opacity: 0.8;
}

.smart-icon.is-clickable:active {
  transform: scale(0.95);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   颜色变体
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

.smart-icon--default {
  color: currentColor;
}

.smart-icon--primary {
  color: var(--color-primary-500);
}

.smart-icon--success {
  color: var(--color-success);
}

.smart-icon--warning {
  color: var(--color-warning);
}

.smart-icon--error {
  color: var(--color-error);
}
</style>
