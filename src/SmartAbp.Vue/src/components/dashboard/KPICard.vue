<template>
  <el-card :class="['kpi-card', `kpi-card--${theme}`]" shadow="hover">
    <div class="kpi-card__header">
      <div class="kpi-card__icon">
        <component :is="icon" />
      </div>
      <div class="kpi-card__title">{{ title }}</div>
    </div>
    <div class="kpi-card__content">
      <div class="kpi-card__value">
        {{ formattedValue }}
        <span class="kpi-card__unit">{{ unit }}</span>
      </div>
      <div v-if="trend !== 0" class="kpi-card__trend" :class="trendClass">
        <component :is="trendIcon" class="trend-icon" />
        <span>{{ Math.abs(trend).toFixed(1) }}%</span>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Props定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const props = withDefaults(
  defineProps<{
    title: string           // KPI标题
    value: number           // KPI数值
    unit: string            // 单位
    trend?: number          // 趋势百分比（正数=上升，负数=下降）
    icon: any               // 图标组件
    theme?: 'primary' | 'success' | 'warning' | 'danger' | 'info'  // 主题色
    precision?: number      // 小数位数
  }>(),
  {
    trend: 0,
    theme: 'info',
    precision: 0
  }
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Computed
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 格式化显示的数值
 */
const formattedValue = computed(() => {
  return props.value.toFixed(props.precision)
})

/**
 * 趋势图标
 */
const trendIcon = computed(() => {
  if (props.trend > 0) return ArrowUp
  if (props.trend < 0) return ArrowDown
  return Minus
})

/**
 * 趋势CSS类名
 */
const trendClass = computed(() => {
  if (props.trend > 0) return 'trend-up'
  if (props.trend < 0) return 'trend-down'
  return 'trend-neutral'
})
</script>

<style scoped lang="scss">
.kpi-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: default;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 主题色
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  &--primary {
    .kpi-card__header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  }

  &--success {
    .kpi-card__header {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
  }

  &--warning {
    .kpi-card__header {
      background: linear-gradient(135deg, #ffd89b 0%, #ff6b6b 100%);
    }
  }

  &--danger {
    .kpi-card__header {
      background: linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%);
    }
  }

  &--info {
    .kpi-card__header {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 卡片头部
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  &__header {
    display: flex;
    align-items: center;
    padding: var(--spacing-4);
    border-radius: 8px 8px 0 0;
    color: white;
    margin: -20px -20px 16px -20px;
  }

  &__icon {
    font-size: 28px;
    margin-right: 12px;
    display: flex;
    align-items: center;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    flex: 1;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 卡片内容
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  &__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-2) 0;
  }

  &__value {
    font-size: 32px;
    font-weight: bold;
    color: #333;
    line-height: 1;
  }

  &__unit {
    font-size: 16px;
    font-weight: normal;
    color: #999;
    margin-left: 4px;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 趋势指示器
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  &__trend {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    padding: var(--spacing-1) 12px;
    border-radius: 20px;

    .trend-icon {
      margin-right: 4px;
      font-size: 16px;
    }

    &.trend-up {
      background: #e7f5ff;
      color: #1864ab;
    }

    &.trend-down {
      background: #ffe8e8;
      color: #c92a2a;
    }

    &.trend-neutral {
      background: #f8f9fa;
      color: #868e96;
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 响应式设计
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@media (max-width: 768px) {
  .kpi-card {
    &__value {
      font-size: 24px;
    }

    &__unit {
      font-size: 14px;
    }

    &__trend {
      font-size: 12px;
      padding: 3px 8px;

      .trend-icon {
        font-size: 14px;
      }
    }
  }
}
</style>
