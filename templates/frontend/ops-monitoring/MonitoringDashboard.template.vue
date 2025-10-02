<template>
  <div class="{{kebab-case entityName}}-monitoring-dashboard">
    <!-- 头部工具栏 -->
    <el-card class="header-card" shadow="never">
      <div class="dashboard-header">
        <div class="title-section">
          <h2>{{ title }}</h2>
          <el-tag :type="healthStatusType">{{ healthStatusText }}</el-tag>
        </div>
        <div class="actions-section">
          <el-select v-model="timeRange" @change="handleTimeRangeChange" style="width: 150px">
            <el-option label="最近1小时" value="1h" />
            <el-option label="最近6小时" value="6h" />
            <el-option label="最近24小时" value="24h" />
            <el-option label="最近7天" value="7d" />
          </el-select>
          <el-button type="primary" :icon="Refresh" @click="handleRefresh">刷新</el-button>
          <el-button :icon="Setting" @click="showSettings = true">设置</el-button>
        </div>
      </div>
    </el-card>

    <!-- 关键指标卡片 -->
    <el-row :gutter="16" class="metrics-row">
      <el-col :span="6">
        <metric-card
          title="CPU使用率"
          :value="metrics.cpuUsage"
          unit="%"
          :trend="metrics.cpuTrend"
          :threshold="70"
          :icon="Monitor"
        />
      </el-col>
      <el-col :span="6">
        <metric-card
          title="内存使用率"
          :value="metrics.memoryUsage"
          unit="%"
          :trend="metrics.memoryTrend"
          :threshold="70"
          :icon="Monitor"
        />
      </el-col>
      <el-col :span="6">
        <metric-card
          title="活跃告警"
          :value="metrics.activeAlerts"
          :trend="metrics.alertsTrend"
          :threshold="5"
          :icon="Bell"
        />
      </el-col>
      <el-col :span="6">
        <metric-card
          title="请求速率"
          :value="metrics.requestRate"
          unit="req/s"
          :trend="metrics.requestTrend"
          :icon="TrendCharts"
        />
      </el-col>
    </el-row>

    <!-- 主要图表区域 -->
    <el-row :gutter="16" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>性能趋势</span>
              <el-radio-group v-model="performanceMetric" size="small">
                <el-radio-button label="cpu">CPU</el-radio-button>
                <el-radio-button label="memory">内存</el-radio-button>
                <el-radio-button label="disk">磁盘</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="performanceChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <span>请求统计</span>
          </template>
          <div ref="requestChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 告警列表 -->
    <el-card class="alerts-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>活跃告警</span>
          <el-badge :value="activeAlertsCount" :max="99" class="badge">
            <el-button size="small" @click="showAllAlerts">查看全部</el-button>
          </el-badge>
        </div>
      </template>
      <el-table :data="alerts" style="width: 100%" max-height="300">
        <el-table-column prop="severity" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getAlertType(row.severity)">{{ row.severity }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="告警信息" show-overflow-tooltip />
        <el-table-column prop="source" label="来源" width="150" />
        <el-table-column prop="createdTime" label="触发时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleAcknowledge(row)">确认</el-button>
            <el-button link type="danger" @click="handleResolve(row)">解决</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 设置对话框 -->
    <el-dialog v-model="showSettings" title="仪表板设置" width="600px">
      <el-form :model="settings" label-width="120px">
        <el-form-item label="自动刷新">
          <el-switch v-model="settings.autoRefresh" />
        </el-form-item>
        <el-form-item label="刷新间隔">
          <el-select v-model="settings.refreshInterval" :disabled="!settings.autoRefresh">
            <el-option label="30秒" :value="30000" />
            <el-option label="1分钟" :value="60000" />
            <el-option label="5分钟" :value="300000" />
          </el-select>
        </el-form-item>
        <el-form-item label="告警声音">
          <el-switch v-model="settings.alertSound" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSettings = false">取消</el-button>
        <el-button type="primary" @click="handleSaveSettings">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Setting, Monitor, Bell, TrendCharts } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { use{{PascalCase entityName}}MonitoringStore } from '@/stores/{{camelCase entityName}}Monitoring'
import { formatTime } from '@/utils/date'
import MetricCard from './components/MetricCard.vue'

const props = defineProps<{
  title?: string
  refreshInterval?: number
}>()

const store = use{{PascalCase entityName}}MonitoringStore()

// 响应式数据
const timeRange = ref('1h')
const performanceMetric = ref('cpu')
const showSettings = ref(false)
const performanceChartRef = ref<HTMLElement>()
const requestChartRef = ref<HTMLElement>()

const settings = reactive({
  autoRefresh: true,
  refreshInterval: 60000,
  alertSound: true
})

const metrics = reactive({
  cpuUsage: 0,
  cpuTrend: 0,
  memoryUsage: 0,
  memoryTrend: 0,
  activeAlerts: 0,
  alertsTrend: 0,
  requestRate: 0,
  requestTrend: 0
})

const alerts = ref([])
let performanceChart: echarts.ECharts | null = null
let requestChart: echarts.ECharts | null = null
let refreshTimer: number | null = null

// 计算属性
const activeAlertsCount = computed(() => alerts.value.length)

const healthStatusType = computed(() => {
  if (metrics.cpuUsage > 90 || metrics.memoryUsage > 90 || metrics.activeAlerts > 10) {
    return 'danger'
  }
  if (metrics.cpuUsage > 70 || metrics.memoryUsage > 70 || metrics.activeAlerts > 5) {
    return 'warning'
  }
  return 'success'
})

const healthStatusText = computed(() => {
  const type = healthStatusType.value
  return type === 'danger' ? '严重' : type === 'warning' ? '警告' : '健康'
})

// 方法
const handleTimeRangeChange = () => {
  loadData()
}

const handleRefresh = async () => {
  await loadData()
  ElMessage.success('数据已刷新')
}

const showAllAlerts = () => {
  // 导航到告警详情页面
  router.push('/ops/alerts')
}

const handleAcknowledge = async (row: any) => {
  await store.acknowledgeAlert(row.id)
  ElMessage.success('告警已确认')
  await loadAlerts()
}

const handleResolve = async (row: any) => {
  await store.resolveAlert(row.id)
  ElMessage.success('告警已解决')
  await loadAlerts()
}

const handleSaveSettings = () => {
  localStorage.setItem('monitoring-settings', JSON.stringify(settings))
  showSettings.value = false
  ElMessage.success('设置已保存')
  
  if (settings.autoRefresh) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const getAlertType = (severity: string) => {
  const types = {
    critical: 'danger',
    warning: 'warning',
    info: 'info'
  }
  return types[severity] || 'info'
}

// 加载数据
const loadData = async () => {
  try {
    // 加载系统健康状态
    const health = await store.getSystemHealth()
    metrics.cpuUsage = health.cpuUsage
    metrics.memoryUsage = health.memoryUsage
    metrics.activeAlerts = health.activeAlerts

    // 加载性能数据
    await loadPerformanceData()
    
    // 加载请求统计
    await loadRequestData()
    
    // 加载告警列表
    await loadAlerts()
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error(error)
  }
}

const loadPerformanceData = async () => {
  const data = await store.getPerformanceMetrics(performanceMetric.value, timeRange.value)
  updatePerformanceChart(data)
}

const loadRequestData = async () => {
  const data = await store.getRequestMetrics(timeRange.value)
  updateRequestChart(data)
}

const loadAlerts = async () => {
  alerts.value = await store.getActiveAlerts()
}

// 图表更新
const updatePerformanceChart = (data: any[]) => {
  if (!performanceChart) return

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '使用率(%)',
      max: 100
    },
    series: [
      {
        name: performanceMetric.value.toUpperCase(),
        type: 'line',
        data: data.map(item => [item.timestamp, item.value]),
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
            ]
          }
        }
      }
    ]
  }

  performanceChart.setOption(option)
}

const updateRequestChart = (data: any[]) => {
  if (!requestChart) return

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['成功', '失败']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'time'
    },
    yAxis: {
      type: 'value',
      name: '请求数'
    },
    series: [
      {
        name: '成功',
        type: 'bar',
        data: data.map(item => [item.timestamp, item.success]),
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '失败',
        type: 'bar',
        data: data.map(item => [item.timestamp, item.error]),
        itemStyle: { color: '#F56C6C' }
      }
    ]
  }

  requestChart.setOption(option)
}

// 自动刷新
const startAutoRefresh = () => {
  stopAutoRefresh()
  refreshTimer = window.setInterval(() => {
    loadData()
  }, settings.refreshInterval)
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 生命周期
onMounted(async () => {
  // 加载设置
  const savedSettings = localStorage.getItem('monitoring-settings')
  if (savedSettings) {
    Object.assign(settings, JSON.parse(savedSettings))
  }

  // 初始化图表
  if (performanceChartRef.value) {
    performanceChart = echarts.init(performanceChartRef.value)
  }
  if (requestChartRef.value) {
    requestChart = echarts.init(requestChartRef.value)
  }

  // 加载数据
  await loadData()

  // 启动自动刷新
  if (settings.autoRefresh) {
    startAutoRefresh()
  }

  // 窗口大小变化时重绘图表
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  stopAutoRefresh()
  performanceChart?.dispose()
  requestChart?.dispose()
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  performanceChart?.resize()
  requestChart?.resize()
}
</script>

<style scoped lang="scss">
.{{kebab-case entityName}}-monitoring-dashboard {
  padding: 20px;

  .header-card {
    margin-bottom: 16px;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-section {
      display: flex;
      align-items: center;
      gap: 12px;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }
    }

    .actions-section {
      display: flex;
      gap: 12px;
    }
  }

  .metrics-row {
    margin-bottom: 16px;
  }

  .charts-row {
    margin-bottom: 16px;
  }

  .chart-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-container {
      width: 100%;
      height: 300px;
    }
  }

  .alerts-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>

