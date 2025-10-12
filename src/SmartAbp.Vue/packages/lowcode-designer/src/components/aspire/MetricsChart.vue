<template>
  <div
    ref="chartRef"
    class="metrics-chart"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'

interface ChartData {
  timestamps: string[]
  values: number[]
}

interface Props {
  title?: string
  type?: 'line' | 'bar' | 'pie'
  data: ChartData
  color?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  type: 'line',
  color: '#409eff',
  height: '300px'
})

const chartRef = ref<HTMLDivElement>()
let chart: ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value)

  const option: EChartsOption = {
    title: props.title ? { text: props.title, left: 'center' } : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.data.timestamps,
      boundaryGap: props.type === 'bar'
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: props.title,
        type: props.type,
        data: props.data.values,
        smooth: props.type === 'line',
        itemStyle: {
          color: props.color
        },
        areaStyle: props.type === 'line' ? {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: props.color + '80' },
              { offset: 1, color: props.color + '10' }
            ]
          }
        } : undefined
      }
    ]
  }

  // ECharts类型系统过于严格，使用类型断言以避免复杂的渐变色类型定义问题
  chart.setOption(option as any)
}

const updateChart = () => {
  if (!chart) return

  chart.setOption({
    xAxis: {
      data: props.data.timestamps
    },
    series: [
      {
        data: props.data.values
      }
    ]
  })
}

const handleResize = () => {
  chart?.resize()
}

watch(() => props.data, () => {
  updateChart()
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})
</script>

<style scoped lang="scss">
.metrics-chart {
  width: 100%;
  height: v-bind(height);
}
</style>

