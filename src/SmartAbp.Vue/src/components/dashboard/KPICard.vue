<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<!-- KPI卡片组件（数字大屏通用组件） -->
<!-- 用于展示关键性能指标 -->
<!-- 创建日期: 2025-10-21 -->
<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

<template>
  <div 
    class="kpi-card" 
    :class="[
      `kpi-card--${type}`,
      { 'kpi-card--animated': animated }
    ]"
  >
    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <!-- 卡片头部 -->
    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <div class="kpi-card__header">
      <div class="kpi-card__icon">
        <el-icon :size="iconSize">
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="kpi-card__title">{{ title }}</div>
    </div>

    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <!-- 卡片内容 -->
    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <div class="kpi-card__content">
      <!-- 主要数值 -->
      <div class="kpi-card__value">
        <span class="kpi-card__value-number">{{ formattedValue }}</span>
        <span v-if="unit" class="kpi-card__value-unit">{{ unit }}</span>
      </div>

      <!-- 趋势指示器 -->
      <div v-if="trend !== null" class="kpi-card__trend" :class="`kpi-card__trend--${trendDirection}`">
        <el-icon :size="16">
          <ArrowUp v-if="trendDirection === 'up'" />
          <ArrowDown v-if="trendDirection === 'down'" />
          <Minus v-if="trendDirection === 'stable'" />
        </el-icon>
        <span class="kpi-card__trend-value">{{ Math.abs(trend).toFixed(1) }}%</span>
      </div>

      <!-- 附加说明 -->
      <div v-if="description" class="kpi-card__description">
        {{ description }}
      </div>
    </div>

    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <!-- 卡片底部（可选） -->
    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <div v-if="$slots.footer" class="kpi-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Props定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Props {
  /** 卡片标题 */
  title: string
  /** 数值 */
  value: number
  /** 单位（可选） */
  unit?: string
  /** 图标 */
  icon: any
  /** 图标大小 */
  iconSize?: number
  /** 卡片类型（影响颜色主题） */
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** 趋势值（百分比，正数表示上升，负数表示下降） */
  trend?: number | null
  /** 附加说明文本 */
  description?: string
  /** 数值格式化函数（可选） */
  formatter?: (value: number) => string
  /** 是否启用动画效果 */
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  iconSize: 32,
  type: 'primary',
  trend: null,
  description: '',
  formatter: undefined,
  animated: true
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 计算属性
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 格式化后的数值
 */
const formattedValue = computed(() => {
  if (props.formatter) {
    return props.formatter(props.value)
  }
  
  // 默认格式化：添加千位分隔符
  return props.value.toLocaleString('zh-CN', {
    maximumFractionDigits: 2
  })
})

/**
 * 趋势方向
 */
const trendDirection = computed(() => {
  if (props.trend === null || props.trend === 0) return 'stable'
  return props.trend > 0 ? 'up' : 'down'
})
</script>

<style scoped lang="scss">
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KPI卡片样式
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.kpi-card {
  background: linear-gradient(135deg, rgba(23, 25, 35, 0.95) 0%, rgba(31, 34, 46, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  // 悬停效果
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.2);
  }

  // 背景装饰渐变
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--kpi-color-primary), var(--kpi-color-secondary));
    opacity: 0.8;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 头部
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--kpi-color-primary), var(--kpi-color-secondary));
    color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &__title {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 0.5px;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 内容
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  &__content {
    padding: 8px 0;
  }

  &__value {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__value-number {
    font-size: 32px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  &__value-unit {
    font-size: 16px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
  }

  &__trend {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 8px;

    &--up {
      background: rgba(103, 194, 58, 0.15);
      color: #67c23a;
      border: 1px solid rgba(103, 194, 58, 0.3);
    }

    &--down {
      background: rgba(245, 108, 108, 0.15);
      color: #f56c6c;
      border: 1px solid rgba(245, 108, 108, 0.3);
    }

    &--stable {
      background: rgba(144, 147, 153, 0.15);
      color: #909399;
      border: 1px solid rgba(144, 147, 153, 0.3);
    }
  }

  &__trend-value {
    font-variant-numeric: tabular-nums;
  }

  &__description {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.5;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 底部
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  &__footer {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 类型变体（颜色主题）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  &--primary {
    --kpi-color-primary: #409eff;
    --kpi-color-secondary: #66b1ff;
  }

  &--success {
    --kpi-color-primary: #67c23a;
    --kpi-color-secondary: #85ce61;
  }

  &--warning {
    --kpi-color-primary: #e6a23c;
    --kpi-color-secondary: #ebb563;
  }

  &--danger {
    --kpi-color-primary: #f56c6c;
    --kpi-color-secondary: #f78989;
  }

  &--info {
    --kpi-color-primary: #909399;
    --kpi-color-secondary: #a6a9ad;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 动画效果
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  &--animated {
    .kpi-card__value-number {
      animation: countUp 1s ease-out;
    }
  }
}

// 数值递增动画
@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

