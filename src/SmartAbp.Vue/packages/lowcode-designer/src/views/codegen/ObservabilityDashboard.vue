<template>
  <div class="observability-dashboard">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span>可观测性仪表板</span>
          <div class="actions">
            <el-select
              v-model="selectedService"
              placeholder="选择服务"
              style="width: 200px; margin-right: 12px"
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
              style="width: 150px; margin-right: 12px"
            >
              <el-option
                label="最近5分钟"
                value="5m"
              />
              <el-option
                label="最近15分钟"
                value="15m"
              />
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
            </el-select>
            <el-button
              :icon="RefreshRight"
              @click="refreshData"
            >
              刷新
            </el-button>
          </div>
        </div>
      </template>
    </el-card>

    <!-- 黄金指标卡片 -->
    <el-row
      :gutter="16"
      class="metrics-row"
    >
      <el-col :span="6">
        <el-card class="metric-card latency-card">
          <div class="metric-icon">
            <el-icon :size="32">
              <Timer />
            </el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-label">
              延迟 (P99)
            </div>
            <div class="metric-value">
              {{ goldenSignals.latency.value }}ms
            </div>
            <div
              class="metric-trend"
              :class="getTrendClass(goldenSignals.latency.trend)"
            >
              <el-icon><CaretTop v-if="goldenSignals.latency.trend > 0" /><CaretBottom v-else /></el-icon>
              {{ Math.abs(goldenSignals.latency.trend) }}%
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="metric-card traffic-card">
          <div class="metric-icon">
            <el-icon :size="32">
              <TrendCharts />
            </el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-label">
              流量 (RPS)
            </div>
            <div class="metric-value">
              {{ goldenSignals.traffic.value }}
            </div>
            <div
              class="metric-trend"
              :class="getTrendClass(goldenSignals.traffic.trend)"
            >
              <el-icon><CaretTop v-if="goldenSignals.traffic.trend > 0" /><CaretBottom v-else /></el-icon>
              {{ Math.abs(goldenSignals.traffic.trend) }}%
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="metric-card errors-card">
          <div class="metric-icon">
            <el-icon :size="32">
              <Warning />
            </el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-label">
              错误率
            </div>
            <div class="metric-value">
              {{ goldenSignals.errors.value }}%
            </div>
            <div
              class="metric-trend"
              :class="getTrendClass(-goldenSignals.errors.trend)"
            >
              <el-icon><CaretTop v-if="goldenSignals.errors.trend > 0" /><CaretBottom v-else /></el-icon>
              {{ Math.abs(goldenSignals.errors.trend) }}%
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="metric-card saturation-card">
          <div class="metric-icon">
            <el-icon :size="32">
              <Odometer />
            </el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-label">
              饱和度 (CPU)
            </div>
            <div class="metric-value">
              {{ goldenSignals.saturation.value }}%
            </div>
            <div
              class="metric-trend"
              :class="getTrendClass(-goldenSignals.saturation.trend)"
            >
              <el-icon><CaretTop v-if="goldenSignals.saturation.trend > 0" /><CaretBottom v-else /></el-icon>
              {{ Math.abs(goldenSignals.saturation.trend) }}%
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- RED指标图表 -->
    <el-row
      :gutter="16"
      class="charts-row"
    >
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>请求速率 (Rate)</span>
          </template>
          <div
            ref="rateChartRef"
            class="chart-container"
          />
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <span>错误率 (Errors)</span>
          </template>
          <div
            ref="errorsChartRef"
            class="chart-container"
          />
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <span>响应时间 (Duration)</span>
          </template>
          <div
            ref="durationChartRef"
            class="chart-container"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 告警规则 -->
    <el-card class="alerts-card">
      <template #header>
        <span>活跃告警</span>
      </template>
      <el-table
        :data="activeAlerts"
        style="width: 100%"
      >
        <el-table-column
          prop="name"
          label="告警名称"
          width="200"
        />
        <el-table-column
          prop="severity"
          label="严重程度"
          width="120"
        >
          <template #default="{ row }">
            <el-tag :type="getSeverityType(row.severity)">
              {{ row.severity }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="message"
          label="消息"
        />
        <el-table-column
          prop="triggeredAt"
          label="触发时间"
          width="180"
        >
          <template #default="{ row }">
            {{ formatDate(row.triggeredAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="120"
        >
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              @click="acknowledgeAlert(row.id)"
            >
              确认
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RefreshRight, Timer, TrendCharts, Warning, Odometer, CaretTop, CaretBottom } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

interface MetricData {
  value: number
  trend: number
}

interface GoldenSignalsData {
  latency: MetricData
  traffic: MetricData
  errors: MetricData
  saturation: MetricData
}

interface Alert {
  id: string
  name: string
  severity: string
  message: string
  triggeredAt: string
}

const selectedService = ref('user-service')
const services = ref(['user-service', 'order-service', 'payment-service'])
const timeRange = ref('1h')

const goldenSignals = ref<GoldenSignalsData>({
  latency: { value: 125, trend: -5.2 },
  traffic: { value: 1250, trend: 12.3 },
  errors: { value: 0.15, trend: -2.1 },
  saturation: { value: 45, trend: 3.5 }
})

const activeAlerts = ref<Alert[]>([
  {
    id: '1',
    name: 'HighErrorRate',
    severity: 'critical',
    message: '错误率超过阈值',
    triggeredAt: '2025-10-04T10:30:00Z'
  }
])

const rateChartRef = ref<HTMLDivElement>()
const errorsChartRef = ref<HTMLDivElement>()
const durationChartRef = ref<HTMLDivElement>()

let rateChart: ECharts | null = null
let errorsChart: ECharts | null = null
let durationChart: ECharts | null = null
let refreshTimer: number | null = null

const getTrendClass = (trend: number) => {
  return trend >= 0 ? 'trend-up' : 'trend-down'
}

const getSeverityType = (severity: string) => {
  const types: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    info: 'info',
    warning: 'warning',
    critical: 'danger'
  }
  return types[severity] || 'info'
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const refreshData = () => {
  // 模拟数据刷新
  console.log('刷新数据...')
}

const acknowledgeAlert = (id: string) => {
  activeAlerts.value = activeAlerts.value.filter(alert => alert.id !== id)
}

const initCharts = () => {
  if (rateChartRef.value) {
    rateChart = echarts.init(rateChartRef.value)
    rateChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['10:00', '10:15', '10:30', '10:45', '11:00'] },
      yAxis: { type: 'value' },
      series: [{ data: [1200, 1300, 1250, 1280, 1250], type: 'line', smooth: true }]
    })
  }

  if (errorsChartRef.value) {
    errorsChart = echarts.init(errorsChartRef.value)
    errorsChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['10:00', '10:15', '10:30', '10:45', '11:00'] },
      yAxis: { type: 'value' },
      series: [{ data: [0.2, 0.15, 0.18, 0.12, 0.15], type: 'line', smooth: true, itemStyle: { color: '#f56c6c' } }]
    })
  }

  if (durationChartRef.value) {
    durationChart = echarts.init(durationChartRef.value)
    durationChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['10:00', '10:15', '10:30', '10:45', '11:00'] },
      yAxis: { type: 'value' },
      series: [{ data: [120, 130, 125, 128, 125], type: 'line', smooth: true, itemStyle: { color: '#67c23a' } }]
    })
  }
}

onMounted(() => {
  initCharts()
  refreshTimer = window.setInterval(refreshData, 30000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  rateChart?.dispose()
  errorsChart?.dispose()
  durationChart?.dispose()
})
</script>

<style scoped lang="scss">
.observability-dashboard {
  padding: 20px;

  .header-card {
    margin-bottom: 16px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .actions {
        display: flex;
        align-items: center;
      }
    }
  }

  .metrics-row {
    margin-bottom: 16px;

    .metric-card {
      display: flex;
      align-items: center;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .metric-icon {
        margin-right: 16px;
        padding: 12px;
        border-radius: 8px;
      }

      .metric-content {
        flex: 1;

        .metric-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .metric-value {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .metric-trend {
          font-size: 12px;
          display: flex;
          align-items: center;

          &.trend-up {
            color: #67c23a;
          }

          &.trend-down {
            color: #f56c6c;
          }
        }
      }
    }

    .latency-card .metric-icon {
      background: #ecf5ff;
      color: #409eff;
    }

    .traffic-card .metric-icon {
      background: #f0f9ff;
      color: #409eff;
    }

    .errors-card .metric-icon {
      background: #fef0f0;
      color: #f56c6c;
    }

    .saturation-card .metric-icon {
      background: #f5f7fa;
      color: #909399;
    }
  }

  .charts-row {
    margin-bottom: 16px;

    .chart-container {
      width: 100%;
      height: 300px;
    }
  }

  .alerts-card {
    margin-bottom: 16px;
  }
}
</style>

