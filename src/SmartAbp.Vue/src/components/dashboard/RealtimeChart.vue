<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<!-- 实时图表组件（基于ECharts） -->
<!-- 用于数字大屏实时数据可视化 -->
<!-- 创建日期: 2025-10-21 -->
<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

<template>
  <div class="realtime-chart" ref="chartContainerRef">
    <!-- 图表容器 -->
    <div ref="chartRef" :style="{ width: '100%', height: height }" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface TimeSeriesData {
  /** 时间戳 */
  timestamp: Date
  /** 数值 */
  value: number
}

export interface ChartSeries {
  /** 系列名称 */
  name: string
  /** 数据 */
  data: TimeSeriesData[]
  /** 线条颜色 */
  color?: string
  /** 是否平滑曲线 */
  smooth?: boolean
  /** 是否填充区域 */
  areaStyle?: boolean
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Props定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Props {
  /** 图表标题 */
  title?: string
  /** 图表高度 */
  height?: string
  /** 数据系列 */
  series: ChartSeries[]
  /** Y轴单位 */
  yAxisUnit?: string
  /** Y轴最小值 */
  yAxisMin?: number | 'dataMin'
  /** Y轴最大值 */
  yAxisMax?: number | 'dataMax'
  /** 是否显示图例 */
  showLegend?: boolean
  /** 是否显示网格 */
  showGrid?: boolean
  /** 是否显示工具提示 */
  showTooltip?: boolean
  /** 是否自动刷新 */
  autoRefresh?: boolean
  /** 刷新间隔（毫秒） */
  refreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  height: '400px',
  yAxisUnit: '',
  yAxisMin: 'dataMin',
  yAxisMax: 'dataMax',
  showLegend: true,
  showGrid: true,
  showTooltip: true,
  autoRefresh: false,
  refreshInterval: 1000
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 状态管理
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 图表DOM引用 */
const chartRef = ref<HTMLDivElement | null>(null)

/** 容器DOM引用 */
const chartContainerRef = ref<HTMLDivElement | null>(null)

/** ECharts实例 */
let chartInstance: ECharts | null = null

/** 自动刷新定时器 */
let refreshTimer: number | null = null

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 图表配置
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 获取ECharts配置
 */
const getChartOption = (): EChartsOption => {
  // 提取时间轴数据（使用第一个系列的时间戳）
  const xAxisData = props.series[0]?.data.map((item) => 
    new Date(item.timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  ) || []

  // 转换系列数据
  const seriesData = props.series.map((series) => ({
    name: series.name,
    type: 'line' as const, // 使用字面量类型
    smooth: series.smooth !== false,
    data: series.data.map((item) => item.value),
    itemStyle: {
      color: series.color || undefined
    },
    areaStyle: series.areaStyle ? {
      opacity: 0.3
    } : undefined,
    // 线条样式
    lineStyle: {
      width: 2
    },
    // 标记点样式
    symbol: 'circle' as const, // 使用字面量类型
    symbolSize: 6,
    // 高亮样式
    emphasis: {
      focus: 'series' as const, // 使用字面量类型
      itemStyle: {
        borderWidth: 2,
        borderColor: '#fff',
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      }
    }
  }))

  return {
    // 标题
    title: props.title ? {
      text: props.title,
      textStyle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 16,
        fontWeight: 500
      },
      left: 'center',
      top: 10
    } : undefined,

    // 图例
    legend: props.showLegend ? {
      data: props.series.map((s) => s.name),
      top: props.title ? 40 : 10,
      textStyle: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12
      },
      itemWidth: 20,
      itemHeight: 12
    } : undefined,

    // 网格
    grid: {
      left: '60px',
      right: '40px',
      top: props.title ? (props.showLegend ? 80 : 60) : (props.showLegend ? 50 : 30),
      bottom: '60px',
      containLabel: true
    },

    // X轴（时间轴）
    xAxis: {
      type: 'category',
      data: xAxisData,
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 11,
        rotate: 30
      },
      splitLine: props.showGrid ? {
        show: true,
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.05)'
        }
      } : undefined
    },

    // Y轴
    yAxis: {
      type: 'value',
      name: props.yAxisUnit,
      nameTextStyle: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 11
      },
      min: props.yAxisMin,
      max: props.yAxisMax,
      axisLine: {
        show: true,
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 11,
        formatter: (value: number) => {
          // 格式化Y轴标签（添加单位）
          return props.yAxisUnit ? `${value}${props.yAxisUnit}` : String(value)
        }
      },
      splitLine: props.showGrid ? {
        show: true,
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.05)',
          type: 'dashed'
        }
      } : undefined
    },

    // 工具提示
    tooltip: props.showTooltip ? {
      trigger: 'axis',
      backgroundColor: 'rgba(23, 25, 35, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 12
      },
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: 'rgba(23, 25, 35, 0.9)'
        },
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)',
          type: 'dashed'
        }
      },
      formatter: (params: any) => {
        if (!Array.isArray(params)) return ''
        
        let tooltip = `<div style="font-weight: 600; margin-bottom: 8px;">${params[0].axisValueLabel}</div>`
        
        params.forEach((param: any) => {
          const color = param.color
          const value = param.value
          const unit = props.yAxisUnit
          
          tooltip += `
            <div style="margin-bottom: 4px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color}; margin-right: 8px;"></span>
              <span style="color: rgba(255, 255, 255, 0.7);">${param.seriesName}:</span>
              <span style="font-weight: 600; margin-left: 8px;">${value}${unit}</span>
            </div>
          `
        })
        
        return tooltip
      }
    } : undefined,

    // 数据系列
    series: seriesData,

    // 动画配置
    animation: true,
    animationDuration: 300,
    animationEasing: 'cubicOut'
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 图表管理
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 初始化图表
 */
const initChart = () => {
  if (!chartRef.value) return

  // 如果已存在实例，先销毁
  if (chartInstance) {
    chartInstance.dispose()
  }

  // 创建新实例
  chartInstance = echarts.init(chartRef.value, 'dark')
  
  // 设置配置
  updateChart()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

/**
 * 更新图表
 */
const updateChart = () => {
  if (!chartInstance) return

  const option = getChartOption()
  chartInstance.setOption(option, {
    notMerge: true, // 不合并，完全替换
    lazyUpdate: false
  })
}

/**
 * 处理窗口大小变化
 */
const handleResize = () => {
  chartInstance?.resize()
}

/**
 * 销毁图表
 */
const destroyChart = () => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  
  window.removeEventListener('resize', handleResize)
  
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 生命周期
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

onMounted(async () => {
  await nextTick()
  initChart()

  // 启动自动刷新
  if (props.autoRefresh) {
    refreshTimer = window.setInterval(() => {
      updateChart()
    }, props.refreshInterval)
  }
})

onUnmounted(() => {
  destroyChart()
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 监听器
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 监听数据变化，更新图表
watch(() => props.series, () => {
  updateChart()
}, { deep: true })

// 监听标题变化
watch(() => props.title, () => {
  updateChart()
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 对外暴露的方法
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

defineExpose({
  /** 手动刷新图表 */
  refresh: updateChart,
  /** 获取ECharts实例 */
  getChartInstance: () => chartInstance
})
</script>

<style scoped lang="scss">
.realtime-chart {
  width: 100%;
  background: linear-gradient(135deg, rgba(23, 25, 35, 0.95) 0%, rgba(31, 34, 46, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.2);
  }
}
</style>

