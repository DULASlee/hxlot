<template>
  <div class="apm-dashboard">
    <el-page-header
      content="性能监控"
      @back="goBack"
    >
      <template #extra>
        <el-space>
          <el-select
            v-model="selectedService"
            placeholder="选择服务"
            style="width: 200px"
          >
            <el-option
              v-for="service in services"
              :key="service"
              :label="service"
              :value="service"
            />
          </el-select>
          <el-select
            v-model="timeRange"
            placeholder="时间范围"
            style="width: 150px"
          >
            <el-option
              label="最近1小时"
              value="1h"
            />
            <el-option
              label="最近6小时"
              value="6h"
            />
            <el-option
              label="最近24小时"
              value="24h"
            />
            <el-option
              label="最近7天"
              value="7d"
            />
          </el-select>
          <el-button
            type="primary"
            :icon="Refresh"
            @click="refreshData"
          >
            刷新
          </el-button>
        </el-space>
      </template>
    </el-page-header>

    <el-divider />

    <!-- 实时指标卡片 -->
    <el-row
      :gutter="20"
      class="metrics-cards"
    >
      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>CPU使用率</span>
              <el-icon :size="20">
                <cpu-icon />
              </el-icon>
            </div>
          </template>
          <div class="metric-value">
            {{ currentMetrics.cpuUsage }}%
          </div>
          <el-progress
            :percentage="currentMetrics.cpuUsage"
            :status="getMetricStatus(currentMetrics.cpuUsage, 80)"
            :show-text="false"
          />
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>内存使用率</span>
              <el-icon :size="20">
                <memory-icon />
              </el-icon>
            </div>
          </template>
          <div class="metric-value">
            {{ currentMetrics.memoryUsage }}%
          </div>
          <el-progress
            :percentage="currentMetrics.memoryUsage"
            :status="getMetricStatus(currentMetrics.memoryUsage, 85)"
            :show-text="false"
          />
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>请求数/秒</span>
              <el-icon :size="20">
                <trend-charts />
              </el-icon>
            </div>
          </template>
          <div class="metric-value">
            {{ currentMetrics.requestsPerSecond }}
          </div>
          <div
            class="metric-trend"
            :class="{ increase: currentMetrics.requestsTrend > 0 }"
          >
            <el-icon v-if="currentMetrics.requestsTrend > 0">
              <arrow-up />
            </el-icon>
            <el-icon v-else>
              <arrow-down />
            </el-icon>
            {{ Math.abs(currentMetrics.requestsTrend) }}%
          </div>
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>平均响应时间</span>
              <el-icon :size="20">
                <timer />
              </el-icon>
            </div>
          </template>
          <div class="metric-value">
            {{ currentMetrics.avgResponseTime }}ms
          </div>
          <div
            class="metric-trend"
            :class="{ decrease: currentMetrics.responseTrend < 0 }"
          >
            <el-icon v-if="currentMetrics.responseTrend < 0">
              <arrow-down />
            </el-icon>
            <el-icon v-else>
              <arrow-up />
            </el-icon>
            {{ Math.abs(currentMetrics.responseTrend) }}%
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 性能趋势图表 -->
    <el-row
      :gutter="20"
      class="charts-row"
    >
      <el-col
        :xs="24"
        :lg="12"
      >
        <el-card shadow="hover">
          <template #header>
            <span>CPU & 内存趋势</span>
          </template>
          <div
            ref="cpuMemoryChartRef"
            class="chart-container"
          />
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :lg="12"
      >
        <el-card shadow="hover">
          <template #header>
            <span>请求响应时间趋势</span>
          </template>
          <div
            ref="responseTimeChartRef"
            class="chart-container"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 服务摘要表格 -->
    <el-card
      shadow="hover"
      class="service-summary-card"
    >
      <template #header>
        <span>服务性能摘要</span>
      </template>
      <el-table
        :data="serviceSummary"
        stripe
      >
        <el-table-column
          prop="serviceName"
          label="服务名称"
          width="200"
        />
        <el-table-column
          prop="avgCpu"
          label="平均CPU"
          width="120"
        >
          <template #default="{ row }">
            <el-tag :type="getTagType(row.avgCpu, 80)">
              {{ row.avgCpu }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="avgMemory"
          label="平均内存"
          width="120"
        >
          <template #default="{ row }">
            <el-tag :type="getTagType(row.avgMemory, 85)">
              {{ row.avgMemory }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="totalRequests"
          label="总请求数"
          width="150"
        />
        <el-table-column
          prop="avgResponseTime"
          label="平均响应时间"
          width="150"
        >
          <template #default="{ row }">
            {{ row.avgResponseTime }}ms
          </template>
        </el-table-column>
        <el-table-column
          prop="period"
          label="统计周期"
        />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh, ArrowUp, ArrowDown, TrendCharts, Timer } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

/**
 * APM性能监控面板
 * 提供实时性能指标、趋势图表、服务摘要
 */

const router = useRouter()
const cpuMemoryChartRef = ref<HTMLElement>()
const responseTimeChartRef = ref<HTMLElement>()

let cpuMemoryChart: ECharts | null = null
let responseTimeChart: ECharts | null = null
let refreshTimer: number | null = null

// 数据状态
const selectedService = ref<string>('SmartAbp.Web')
const timeRange = ref<string>('1h')
const services = ref<string[]>(['SmartAbp.Web', 'SmartAbp.CodeGenerator', 'SmartAbp.OpsManagement'])

// 实时指标
const currentMetrics = ref({
  cpuUsage: 45.6,
  memoryUsage: 62.3,
  requestsPerSecond: 1250,
  requestsTrend: 12.5,
  avgResponseTime: 85,
  responseTrend: -5.2,
})

// 服务摘要
const serviceSummary = ref([
  {
    serviceName: 'SmartAbp.Web',
    avgCpu: 45.6,
    avgMemory: 62.3,
    totalRequests: 125000,
    avgResponseTime: 85,
    period: '最近1小时',
  },
  {
    serviceName: 'SmartAbp.CodeGenerator',
    avgCpu: 28.3,
    avgMemory: 48.7,
    totalRequests: 8500,
    avgResponseTime: 120,
    period: '最近1小时',
  },
  {
    serviceName: 'SmartAbp.OpsManagement',
    avgCpu: 15.2,
    avgMemory: 32.1,
    totalRequests: 3200,
    avgResponseTime: 45,
    period: '最近1小时',
  },
])

// 返回上一页
const goBack = () => {
  router.back()
}

// 获取指标状态
const getMetricStatus = (value: number, threshold: number) => {
  if (value >= threshold) return 'exception'
  if (value >= threshold * 0.8) return 'warning'
  return 'success'
}

// 获取标签类型
const getTagType = (value: number, threshold: number) => {
  if (value >= threshold) return 'danger'
  if (value >= threshold * 0.8) return 'warning'
  return 'success'
}

// 初始化CPU&内存趋势图
const initCpuMemoryChart = () => {
  if (!cpuMemoryChartRef.value) return

  cpuMemoryChart = echarts.init(cpuMemoryChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['CPU使用率', '内存使用率'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%',
      },
    },
    series: [
      {
        name: 'CPU使用率',
        type: 'line',
        smooth: true,
        data: Array.from({ length: 24 }, () => Math.random() * 80 + 20),
        itemStyle: { color: '#409EFF' },
        areaStyle: { opacity: 0.3 },
      },
      {
        name: '内存使用率',
        type: 'line',
        smooth: true,
        data: Array.from({ length: 24 }, () => Math.random() * 70 + 30),
        itemStyle: { color: '#67C23A' },
        areaStyle: { opacity: 0.3 },
      },
    ],
  }

  cpuMemoryChart.setOption(option as any)
}

// 初始化响应时间趋势图
const initResponseTimeChart = () => {
  if (!responseTimeChartRef.value) return

  responseTimeChart = echarts.init(responseTimeChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['平均响应时间', 'P95响应时间', 'P99响应时间'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}ms',
      },
    },
    series: [
      {
        name: '平均响应时间',
        type: 'line',
        data: Array.from({ length: 24 }, () => Math.random() * 50 + 50),
        itemStyle: { color: '#409EFF' },
      },
      {
        name: 'P95响应时间',
        type: 'line',
        data: Array.from({ length: 24 }, () => Math.random() * 100 + 100),
        itemStyle: { color: '#E6A23C' },
      },
      {
        name: 'P99响应时间',
        type: 'line',
        data: Array.from({ length: 24 }, () => Math.random() * 150 + 150),
        itemStyle: { color: '#F56C6C' },
      },
    ],
  }

  responseTimeChart.setOption(option as any)
}

// 刷新数据
const refreshData = () => {
  // TODO: 调用后端API获取实时数据
  console.log('刷新性能监控数据')
}

// 自动刷新
const startAutoRefresh = () => {
  refreshTimer = window.setInterval(() => {
    refreshData()
  }, 30000) // 每30秒刷新一次
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

onMounted(() => {
  initCpuMemoryChart()
  initResponseTimeChart()
  startAutoRefresh()

  // 响应式调整
  window.addEventListener('resize', () => {
    cpuMemoryChart?.resize()
    responseTimeChart?.resize()
  })
})

onUnmounted(() => {
  stopAutoRefresh()
  cpuMemoryChart?.dispose()
  responseTimeChart?.dispose()
})
</script>

<style scoped>
.apm-dashboard {
  width: 100%;
}

.metrics-cards {
  margin: var(--spacing-5) 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.metric-value {
  font-size: 32px;
  font-weight: bold;
  margin: 10px 0;
  color: var(--el-color-primary);
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--el-color-danger);
  margin-top: 8px;
}

.metric-trend.increase {
  color: var(--el-color-success);
}

.metric-trend.decrease {
  color: var(--el-color-danger);
}

.charts-row {
  margin: var(--spacing-5) 0;
}

.chart-container {
  width: 100%;
  height: 350px;
}

.service-summary-card {
  margin-top: 20px;
}
</style>

