<template>
  <div :class="cardClasses">
    <div
      v-if="hasHeader"
      class="base-card__header"
    >
      <slot name="header">
        <h3
          v-if="title"
          class="base-card__title"
        >
          {{ title }}
        </h3>
      </slot>
      <div
        v-if="hasExtra"
        class="base-card__extra"
      >
        <slot name="extra" />
      </div>
    </div>
    
    <div class="base-card__body">
      <slot />
    </div>
    
    <div
      v-if="hasFooter"
      class="base-card__footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

/**
 * BaseCard - 基础卡片组件
 * 统一的卡片样式和布局
 */

interface Props {
  /**
   * 卡片标题
   */
  title?: string | null
  
  /**
   * 是否显示阴影
   */
  shadow?: 'always' | 'hover' | 'never'
  
  /**
   * 卡片内边距
   */
  bodyPadding?: string
  
  /**
   * 是否可悬浮
   */
  hoverable?: boolean
  
  /**
   * 是否显示边框
   */
  bordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  shadow: 'hover',
  bodyPadding: '20px',
  hoverable: false,
  bordered: true,
  title: undefined
})

const slots = useSlots()

const hasHeader = computed(() => {
  return !!props.title || !!slots.header
})

const hasExtra = computed(() => {
  return !!slots.extra
})

const hasFooter = computed(() => {
  return !!slots.footer
})

const cardClasses = computed(() => {
  return [
    'base-card',
    `base-card--shadow-${props.shadow}`,
    {
      'is-hoverable': props.hoverable,
      'is-bordered': props.bordered
    }
  ]
})
</script>

<style scoped>
.base-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.base-card.is-bordered {
  border: 1px solid #e4e7ed;
}

.base-card--shadow-always {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.base-card--shadow-hover {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

.base-card--shadow-hover:hover {
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
}

.base-card.is-hoverable:hover {
  transform: translateY(-2px);
}

.base-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.base-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.base-card__extra {
  display: flex;
  align-items: center;
  gap: 8px;
}

.base-card__body {
  padding: v-bind(bodyPadding);
}

.base-card__footer {
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
  background-color: #fafafa;
}
</style>
