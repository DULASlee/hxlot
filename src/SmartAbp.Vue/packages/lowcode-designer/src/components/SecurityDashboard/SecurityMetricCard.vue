<template>
  <el-card class="security-metric-card" shadow="hover" :data-testid="props.dataTestid">
    <div class="metric-content">
      <div class="metric-icon">
        <el-icon :size="32">
          <component :is="iconComponent" />
        </el-icon>
      </div>
      <div class="metric-info">
        <div class="metric-title">{{ title }}</div>
        <div class="metric-value" :class="color">{{ value }}</div>
        <div class="metric-trend" :class="trendClass">
          <el-icon :size="14">
            <component :is="trendIcon" />
          </el-icon>
          <span>{{ Math.abs(trend) }}%</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElCard, ElIcon } from 'element-plus'
import { Warning, Setting, User, Check, ArrowUp, ArrowDown } from '@element-plus/icons-vue'

interface Props {
  dataTestid?: string
  title: string
  value: string | number
  trend: number
  icon: string
  color: string
}

const props = withDefaults(defineProps<Props>(), {
  dataTestid: ''
})

const iconComponent = computed(() => {
  const icons: Record<string, any> = {
    warning: Warning,
    setting: Setting,
    user: User,
    'check-circle': Check
  }
  return icons[props.icon] || Check
})

const trendIcon = computed(() => {
  return props.trend >= 0 ? ArrowUp : ArrowDown
})

const trendClass = computed(() => {
  return props.trend >= 0 ? 'positive' : 'negative'
})
</script>

<style scoped lang="scss">
.security-metric-card {
  height: 100%;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

.metric-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.metric-icon {
  flex-shrink: 0;
}

.metric-info {
  flex: 1;
  min-width: 0;
}

.metric-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;

  &.danger {
    color: #f56c6c;
  }

  &.warning {
    color: #e6a23c;
  }

  &.info {
    color: #909399;
  }

  &.success {
    color: #67c23a;
  }
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;

  &.positive {
    color: #f56c6c;
  }

  &.negative {
    color: #67c23a;
  }
}
</style>
