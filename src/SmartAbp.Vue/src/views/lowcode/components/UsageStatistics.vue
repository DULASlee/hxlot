<template>
  <el-card class="usage-statistics" shadow="never">
    <template #header>
      <span class="title">📊 使用统计</span>
    </template>

    <div v-if="stats" class="stats-content">
      <!-- 数据卡片 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalModules ?? 0 }}</div>
          <div class="stat-label">总模块数</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ stats.activeModules ?? 0 }}</div>
          <div class="stat-label">活跃模块</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ stats.todayNewModules ?? 0 }}</div>
          <div class="stat-label">今日新增</div>
        </div>
      </div>

      <!-- 饼图 -->
      <div class="chart-wrapper">
        <div ref="chartRef" class="chart"></div>
      </div>
    </div>

    <el-empty v-else description="暂无统计数据" :image-size="80" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import type { EChartsOption } from 'echarts'

// 按需引入ECharts（性能优化）
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { LabelLayout } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必需组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout
])

interface UserChoiceStatsDto {
  totalModules?: number
  activeModules?: number
  todayNewModules?: number
  layer1Percentage?: number
  layer2Percentage?: number
  layer3Percentage?: number
}

interface Props {
  stats: UserChoiceStatsDto | null
}

const props = defineProps<Props>()

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

/**
 * 初始化图表
 */
const initChart = () => {
  if (!chartRef.value || !props.stats) return

  // 销毁旧实例
  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartRef.value)

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}% ({d}%)',
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: '#333',
      borderWidth: 0,
      textStyle: {
        color: '#fff',
        fontSize: 14
      }
    },
    legend: {
      bottom: 0,
      left: 'center',
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 12,
        color: '#606266'
      }
    },
    series: [
      {
        name: '入口使用统计',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data: [
          {
            value: props.stats.layer1Percentage ?? 0,
            name: 'Layer1',
            itemStyle: { color: '#67C23A' }
          },
          {
            value: props.stats.layer2Percentage ?? 0,
            name: 'Layer2',
            itemStyle: { color: '#409EFF' }
          },
          {
            value: props.stats.layer3Percentage ?? 0,
            name: 'Layer3',
            itemStyle: { color: '#E6A23C' }
          }
        ]
      }
    ]
  }

  chartInstance.setOption(option)
}

onMounted(() => {
  initChart()

  // 监听窗口大小变化，自适应图表
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  // 清理资源
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
})

watch(
  () => props.stats,
  () => {
    initChart()
  },
  { deep: true }
)

/**
 * 处理窗口大小变化
 */
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}
</script>

<style scoped lang="scss">
.usage-statistics {
  height: 100%;

  .title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .stats-content {
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 24px;

      .stat-card {
        text-align: center;
        padding: var(--spacing-4);
        background: linear-gradient(135deg, #f5f7fa 0%, #e8edf3 100%);
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #409eff;
          margin-bottom: 4px;
          font-family: 'Helvetica Neue', Arial, sans-serif;
        }

        .stat-label {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .chart-wrapper {
      margin-top: 16px;

      .chart {
        width: 100%;
        height: 240px;
      }
    }
  }

  :deep(.el-empty) {
    padding: 40px 0;
  }
}
</style>

