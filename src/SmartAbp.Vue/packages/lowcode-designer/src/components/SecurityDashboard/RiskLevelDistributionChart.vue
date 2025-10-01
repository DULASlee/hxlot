<template>
  <div class="distribution-chart">
    <div class="chart-bars">
      <div
        v-for="(item, index) in props.data"
        :key="index"
        class="chart-bar"
        :style="{ height: item.percentage + '%' }"
      >
        <div class="bar-fill" :class="getBarClass(item.level)"></div>
        <div class="bar-label">{{ item.percentage }}%</div>
      </div>
    </div>
    <div class="chart-legend">
      <div
        v-for="(item, index) in props.data"
        :key="index"
        class="legend-item"
      >
        <div class="legend-color" :class="getBarClass(item.level)"></div>
        <span class="legend-text">{{ item.level }} ({{ item.count }})</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DistributionData {
  level: string
  count: number
  percentage: number
}

interface Props {
  data: DistributionData[]
}

const props = defineProps<Props>()

const getBarClass = (level: string) => {
  const classes: Record<string, string> = {
    'Low': 'low-risk',
    'Medium': 'medium-risk',
    'High': 'high-risk',
    'Critical': 'critical-risk'
  }
  return classes[level] || 'low-risk'
}
</script>

<style scoped lang="scss">
.distribution-chart {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 200px;
  margin-bottom: 20px;
  gap: 16px;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.bar-fill {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  position: relative;

  &.low-risk {
    background: linear-gradient(to top, #67c23a, #85ce61);
  }

  &.medium-risk {
    background: linear-gradient(to top, #e6a23c, #ebb563);
  }

  &.high-risk {
    background: linear-gradient(to top, #f56c6c, #f78989);
  }

  &.critical-risk {
    background: linear-gradient(to top, #d81e06, #e64545);
  }
}

.bar-label {
  position: absolute;
  bottom: -25px;
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;

  &.low-risk {
    background-color: #67c23a;
  }

  &.medium-risk {
    background-color: #e6a23c;
  }

  &.high-risk {
    background-color: #f56c6c;
  }

  &.critical-risk {
    background-color: #d81e06;
  }
}

.legend-text {
  font-size: 12px;
  color: #606266;
}
</style>
