<template>
  <div :id="chartId" class="realtime-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Props定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const props = withDefaults(
  defineProps<{
    chartId: string             // 图表DOM ID（必须唯一）
    chartData: {                // 图表数据
      xAxis: string[]           // X轴数据（时间）
      series: number[]          // Y轴数据（数值）
    }
    chartType?: 'line' | 'bar' | 'pie'  // 图表类型
    title?: string              // 图表标题
    xAxisName?: string          // X轴名称
    yAxisName?: string          // Y轴名称
    color?: string              // 线条颜色
    smooth?: boolean            // 是否平滑曲线
    showArea?: boolean          // 是否显示面积图
  }>(),
  {
    chartType: 'line',
    title: '',
    xAxisName: '',
    yAxisName: '',
    color: '#667eea',
    smooth: true,
    showArea: true
  }
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const chartInstance = ref<ECharts | null>(null)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 方法
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 初始化ECharts图表
 */
const initChart = () => {
  const chartDom = document.getElementById(props.chartId)
  if (!chartDom) {
    console.error(`[RealtimeChart] 未找到图表DOM元素: ${props.chartId}`)
    return
  }

  // 如果已存在实例，先销毁
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }

  // 创建新实例
  chartInstance.value = echarts.init(chartDom)

  // 设置配置项
  updateChartOptions()

  // 窗口大小变化时自适应
  window.addEventListener('resize', handleResize)
}

/**
 * 更新图表配置
 */
const updateChartOptions = () => {
  if (!chartInstance.value) {
    return
  }

  const option: EChartsOption = {
    title: {
      text: props.title,
      left: 'center',
      textStyle: {
        color: '#333',
        fontSize: 16,
        fontWeight: 600
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: props.title ? '15%' : '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.chartData.xAxis,
      name: props.xAxisName,
      nameTextStyle: {
        color: '#999',
        fontSize: 12
      },
      axisLabel: {
        color: '#666',
        fontSize: 11,
        rotate: 45
      },
      axisLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: props.yAxisName,
      nameTextStyle: {
        color: '#999',
        fontSize: 12
      },
      axisLabel: {
        color: '#666',
        fontSize: 11
      },
      axisLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: props.yAxisName || '数值',
        type: props.chartType,
        smooth: props.smooth,
        data: props.chartData.series,
        lineStyle: {
          color: props.color,
          width: 3
        },
        itemStyle: {
          color: props.color
        },
        areaStyle: props.showArea ? {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${props.color}88` },
            { offset: 1, color: `${props.color}11` }
          ])
        } : undefined,
        emphasis: {
          focus: 'series'
        },
        animation: true,
        animationDuration: 300,
        animationEasing: 'cubicOut'
      }
    ]
  }

  chartInstance.value.setOption(option, true)
}

/**
 * 窗口大小变化处理
 */
const handleResize = () => {
  chartInstance.value?.resize()
}

/**
 * 销毁图表
 */
const destroyChart = () => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
  window.removeEventListener('resize', handleResize)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Watchers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 监听数据变化，实时更新图表
watch(
  () => props.chartData,
  () => {
    if (chartInstance.value) {
      updateChartOptions()
    }
  },
  { deep: true }
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 生命周期
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

onUnmounted(() => {
  destroyChart()
})
</script>

<style scoped lang="scss">
.realtime-chart {
  width: 100%;
  height: 300px;
  min-height: 250px;
}

@media (max-width: 768px) {
  .realtime-chart {
    height: 250px;
  }
}
</style>
