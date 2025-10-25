<!--
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SmartCard 企业级卡片组件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-->

<template>
    <div :class="cardClasses" @click="handleClick">
        <!-- 卡片头部 -->
        <header v-if="$slots.header || title" class="smart-card__header">
            <slot name="header">
                <div class="smart-card__title-wrapper">
                    <!-- 图标 -->
                    <component v-if="icon" :is="icon" class="smart-card__icon" />

                    <!-- 标题 -->
                    <h3 v-if="title" class="smart-card__title">{{ title }}</h3>

                    <!-- 子标题 -->
                    <p v-if="subtitle" class="smart-card__subtitle">{{ subtitle }}</p>
                </div>

                <!-- 操作区域 -->
                <div v-if="$slots.actions" class="smart-card__actions">
                    <slot name="actions" />
                </div>
            </slot>
        </header>

        <!-- 卡片内容 -->
        <main v-if="$slots.default" class="smart-card__content">
            <slot />
        </main>

        <!-- 卡片底部 */
    <footer v-if="$slots.footer" class="smart-card__footer">
      <slot name="footer" />
    </footer>

    <!-- 加载状态遮罩 */
    <div v-if="loading" class="smart-card__loading">
      <div class="smart-card__spinner">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="31.416" stroke-dashoffset="31.416">
            <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Props 接口定义
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

export interface SmartCardProps {
  /**
   * 卡片标题
   */
  title?: string

  /**
   * 卡片子标题
   */
  subtitle?: string

  /**
   * 标题图标
   */
  icon?: any

  /**
   * 卡片大小
   * - sm: 小号卡片
   * - md: 中等卡片（默认）
   * - lg: 大号卡片
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * 卡片变体
   * - elevated: 浮起效果（默认）
   * - outlined: 边框效果
   * - flat: 平铺效果
   */
  variant?: 'elevated' | 'outlined' | 'flat'

  /**
   * 是否可点击
   */
  clickable?: boolean

  /**
   * 是否禁用
   */
  disabled?: boolean

  /**
   * 是否加载中
   */
  loading?: boolean

  /**
   * 是否选中（用于选择模式）
   */
  selected?: boolean

  /**
   * 卡片颜色主题
   */
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const props = withDefaults(defineProps<SmartCardProps>(), {
  size: 'md',
  variant: 'elevated',
  clickable: false,
  disabled: false,
  loading: false,
  selected: false,
  color: 'default'
})

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Events 定义
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

export interface SmartCardEmits {
  click: [event: MouseEvent]
}

const emit = defineEmits<SmartCardEmits>()

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 计算属性
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

// 卡片CSS类名
const cardClasses = computed(() => {
  return [
    'smart-card',
    `smart-card--${props.size}`,
    `smart-card--${props.variant}`,
    `smart-card--${props.color}`,
    {
      'smart-card--clickable': props.clickable && !props.disabled,
      'smart-card--disabled': props.disabled,
      'smart-card--loading': props.loading,
      'smart-card--selected': props.selected
    }
  ]
})

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 事件处理
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

// 点击事件处理
const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading || !props.clickable) {
    return
  }
  emit('click', event)
}
</script>

<style scoped>
/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SmartCard 样式系统 - 基于主题令牌
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

.smart-card {
  /* 基础样式 */
  position: relative;
  display: flex;
  flex-direction: column;

  /* 背景和边框 */
  background-color: var(--theme-content-bg);
  border: var(--border-width-1) solid transparent;
  border-radius: var(--radius-lg);

  /* 溢出处理 */
  overflow: hidden;

  /* 过渡动效 */
  transition: all var(--duration-base) var(--timing-ease-out);

  /* 焦点样式 */
  &:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }
}

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 卡片变体样式（Variant Styles）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

/* 🏔️ Elevated - 浮起效果 */
.smart-card--elevated {
  box-shadow: var(--shadow-sm);

  &:hover:not(.smart-card--disabled) {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
}

/* 📋 Outlined - 边框效果 */
.smart-card--outlined {
  border-color: var(--color-border-base);
  box-shadow: none;

  &:hover:not(.smart-card--disabled) {
    border-color: var(--color-border-strong);
    box-shadow: var(--shadow-sm);
  }
}

/* 📄 Flat - 平铺效果 */
.smart-card--flat {
  box-shadow: none;
  background-color: var(--color-bg-secondary);

  &:hover:not(.smart-card--disabled) {
    background-color: var(--color-bg-tertiary);
  }
}

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 卡片尺寸样式（Size Styles）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

.smart-card--sm {
  .smart-card__header {
    padding: var(--spacing-3) var(--spacing-4);
  }

  .smart-card__content {
    padding: var(--spacing-3) var(--spacing-4);
  }

  .smart-card__footer {
    padding: var(--spacing-3) var(--spacing-4);
  }

  .smart-card__title {
    font-size: var(--font-size-base);
  }

  .smart-card__subtitle {
    font-size: var(--font-size-xs);
  }
}

.smart-card--md {
  .smart-card__header {
    padding: var(--spacing-4) var(--spacing-6);
  }

  .smart-card__content {
    padding: var(--spacing-4) var(--spacing-6);
  }

  .smart-card__footer {
    padding: var(--spacing-4) var(--spacing-6);
  }

  .smart-card__title {
    font-size: var(--font-size-lg);
  }

  .smart-card__subtitle {
    font-size: var(--font-size-sm);
  }
}

.smart-card--lg {
  .smart-card__header {
    padding: var(--spacing-6) var(--spacing-8);
  }

  .smart-card__content {
    padding: var(--spacing-6) var(--spacing-8);
  }

  .smart-card__footer {
    padding: var(--spacing-6) var(--spacing-8);
  }

  .smart-card__title {
    font-size: var(--font-size-xl);
  }

  .smart-card__subtitle {
    font-size: var(--font-size-base);
  }
}

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 颜色主题样式（Color Styles）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

.smart-card--primary {
  border-left: 4px solid var(--color-primary-500);

  .smart-card__title {
    color: var(--color-primary-700);
  }
}

.smart-card--success {
  border-left: 4px solid var(--color-success-500);

  .smart-card__title {
    color: var(--color-success-700);
  }
}

.smart-card--warning {
  border-left: 4px solid var(--color-warning-500);

  .smart-card__title {
    color: var(--color-warning-700);
  }
}

.smart-card--danger {
  border-left: 4px solid var(--color-danger-500);

  .smart-card__title {
    color: var(--color-danger-700);
  }
}

.smart-card--info {
  border-left: 4px solid var(--color-info-500);

  .smart-card__title {
    color: var(--color-info-700);
  }
}

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 交互状态样式（Interactive States）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

.smart-card--clickable {
  cursor: pointer;

  &:active {
    transform: translateY(1px);
  }
}

.smart-card--disabled {
  opacity: 0.5;
  cursor: not-allowed;

  &:hover {
    transform: none !important;
    box-shadow: var(--shadow-sm) !important;
  }
}

.smart-card--selected {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px var(--color-primary-100);

  &.smart-card--outlined {
    border-color: var(--color-primary-500);
    background-color: var(--color-primary-50);
  }
}

.smart-card--loading {
  pointer-events: none;
}

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 内部布局样式（Internal Layout）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

.smart-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: var(--border-width-1) solid var(--color-border-subtle);

  &:last-child {
    border-bottom: none;
  }
}

.smart-card__title-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  flex: 1;
  min-width: 0; /* 防止文字溢出 */
}

.smart-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5em;
  height: 1.5em;
  color: var(--color-primary-600);
  margin-bottom: var(--spacing-1);
}

.smart-card__title {
  margin: 0;
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  color: var(--color-text-primary);

  /* 处理长文本溢出 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.smart-card__subtitle {
  margin: 0;
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: var(--color-text-secondary);

  /* 处理长文本溢出 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.smart-card__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-left: var(--spacing-4);
}

.smart-card__content {
  flex: 1;
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);

  /* 清除内容区域的上下边距 */
  :first-child {
    margin-top: 0;
  }

  :last-child {
    margin-bottom: 0;
  }
}

.smart-card__footer {
  border-top: var(--border-width-1) solid var(--color-border-subtle);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 加载状态样式（Loading State）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

.smart-card__loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: var(--color-bg-overlay);
  backdrop-filter: blur(2px);
}

.smart-card__spinner {
  width: 32px;
  height: 32px;
  color: var(--color-primary-500);
}
</style>
