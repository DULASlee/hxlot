<template>
  <div class="scaling-history-chart">
    <el-card>
      <template #header>
        <span>📈 伸缩历史趋势图</span>
      </template>
      <div
        ref="chartRef"
        class="chart-container"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

interface Props {
  history: {
    serviceName: string
    events: Array<{
      timestamp: Date
      eventType: string
      oldReplicas: number
      newReplicas: number
      metric: string
      currentValue: number
      targetValue: number
      reason: string
    }>
    statistics: {
      totalScaleUpEvents: number
      totalScaleDownEvents: number
      averageReplicas: number
      maxReplicas: number
      minReplicas: number
      totalScalingDuration: number
    }
  }
}

const props = defineProps<Props>()

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

onMounted(() => {
  initChart()
})

watch(() => props.history, () => {
  updateChart()
}, { deep: true })

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const option: echarts.EChartsOption = {
    title: {
      text: `${props.history.serviceName} 伸缩历史`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const event = params[0]
        const dataIndex = event.dataIndex
        const historyEvent = props.history.events[dataIndex]
        
        return `
          <div style="text-align: left;">
            <strong>${event.name}</strong><br/>
            类型: ${historyEvent.eventType === 'ScaleUp' ? '扩容' : '缩容'}<br/>
            副本数: ${historyEvent.oldReplicas} → ${historyEvent.newReplicas}<br/>
            指标: ${historyEvent.metric}<br/>
            当前值: ${historyEvent.currentValue}%<br/>
            目标值: ${historyEvent.targetValue}%<br/>
            原因: ${historyEvent.reason}
          </div>
        `
      }
    },
    legend: {
      data: ['副本数', '扩容事件', '缩容事件'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.history.events.map(e => formatTime(e.timestamp))
    },
    yAxis: {
      type: 'value',
      name: '副本数',
      minInterval: 1
    },
    series: [
      {
        name: '副本数',
        type: 'line',
        data: props.history.events.map(e => e.newReplicas),
        smooth: true,
        lineStyle: {
          color: '#409EFF',
          width: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        },
        markPoint: {
          data: [
            {
              name: '最大值',
              type: 'max',
              itemStyle: { color: '#67c23a' }
            },
            {
              name: '最小值',
              type: 'min',
              itemStyle: { color: '#e6a23c' }
            }
          ]
        },
        markLine: {
          data: [
            {
              name: '平均值',
              type: 'average',
              lineStyle: { color: '#909399', type: 'dashed' }
            }
          ]
        }
      },
      {
        name: '扩容事件',
        type: 'scatter',
        data: props.history.events
          .map((e, index) => e.eventType === 'ScaleUp' ? [index, e.newReplicas] : null)
          .filter(Boolean),
        symbolSize: 12,
        itemStyle: {
          color: '#67c23a'
        }
      },
      {
        name: '缩容事件',
        type: 'scatter',
        data: props.history.events
          .map((e, index) => e.eventType === 'ScaleDown' ? [index, e.newReplicas] : null)
          .filter(Boolean),
        symbolSize: 12,
        itemStyle: {
          color: '#e6a23c'
        }
      }
    ]
  }

  // @ts-expect-error: ECharts散点图类型定义过于严格
  chartInstance.setOption(option)

  // 响应式调整
  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
}

const updateChart = () => {
  if (!chartInstance) {
    initChart()
  } else {
    // @ts-expect-error: ECharts动态更新类型定义过于严格
    chartInstance.setOption({
      xAxis: {
        data: props.history.events.map(e => formatTime(e.timestamp))
      },
      series: [
        {
          data: props.history.events.map(e => e.newReplicas)
        },
        {
          data: props.history.events
            .map((e, index) => e.eventType === 'ScaleUp' ? [index, e.newReplicas] : null)
            .filter(Boolean)
        },
        {
          data: props.history.events
            .map((e, index) => e.eventType === 'ScaleDown' ? [index, e.newReplicas] : null)
            .filter(Boolean)
        }
      ]
    })
  }
}

const formatTime = (timestamp: Date) => {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped lang="scss">
.scaling-history-chart {
  .chart-container {
    height: 400px;
    width: 100%;
  }
}
</style>

