<template>
  <div class="system-health-dashboard">
    <!-- 标题栏 -->
    <div class="dashboard-header">
      <div class="header-left">
        <h2 class="dashboard-title">
          <el-icon><Monitor /></el-icon>
          系统健康监控台
        </h2>
        <div class="health-indicator">
          <el-tag
            :type="healthStatusType"
            size="large"
            effect="dark"
          >
            <el-icon>{{ healthStatusIcon }}</el-icon>
            {{ healthStatusText }}
          </el-tag>
        </div>
      </div>
      <div class="header-right">
        <div class="overall-score">
          <span class="score-label">综合评分</span>
          <div
            class="score-value"
            :class="scoreClass"
          >
            {{ healthReport?.overallScore || 0 }}
          </div>
        </div>
        <el-button-group>
          <el-button 
            :icon="isAutoHealingEnabled ? 'CircleCheck' : 'CircleClose'" 
            :type="isAutoHealingEnabled ? 'success' : 'danger'"
            size="small"
            @click="toggleAutoHealing"
          >
            自动修复: {{ isAutoHealingEnabled ? '开启' : '关闭' }}
          </el-button>
          <el-button
            icon="Refresh"
            size="small"
            @click="refreshData"
          >
            刷新
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 警告栏 -->
    <div
      v-if="hasWarnings"
      class="warnings-section"
    >
      <el-alert
        v-for="warning in healthReport?.warnings"
        :key="`${warning.type}-${warning.timestamp}`"
        :title="warning.message"
        :type="warning.severity === 'critical' ? 'error' : 'warning'"
        :closable="false"
        show-icon
        class="warning-item"
      >
        <template #default>
          <div class="warning-details">
            <span>当前值: {{ warning.currentValue }}</span>
            <span>阈值: {{ warning.threshold }}</span>
            <span
              v-if="warning.autoResolution"
              class="auto-resolution"
            >
              自动修复: {{ warning.autoResolution }}
            </span>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 主要指标卡片 -->
    <el-row
      :gutter="20"
      class="metrics-cards"
    >
      <!-- UI响应时间 -->
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-header">
            <el-icon class="metric-icon">
              <Clock />
            </el-icon>
            <span class="metric-title">UI响应时间</span>
          </div>
          <div class="metric-content">
            <div
              class="metric-value"
              :class="getMetricStatusClass('ui-response')"
            >
              {{ healthReport?.uiResponse?.current?.toFixed(0) || 0 }}ms
            </div>
            <div class="metric-details">
              <div class="detail-row">
                <span>平均: {{ healthReport?.uiResponse?.average?.toFixed(0) || 0 }}ms</span>
                <span>峰值: {{ healthReport?.uiResponse?.peak?.toFixed(0) || 0 }}ms</span>
              </div>
              <div
                class="metric-trend"
                :class="healthReport?.uiResponse?.trend"
              >
                <el-icon v-if="healthReport?.uiResponse?.trend === 'improving'">
                  <ArrowUp />
                </el-icon>
                <el-icon v-else-if="healthReport?.uiResponse?.trend === 'degrading'">
                  <ArrowDown />
                </el-icon>
                <el-icon v-else>
                  <Minus />
                </el-icon>
                {{ getTrendText(healthReport?.uiResponse?.trend) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 内存使用率 -->
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-header">
            <el-icon class="metric-icon">
              <MemoryStick />
            </el-icon>
            <span class="metric-title">内存使用率</span>
          </div>
          <div class="metric-content">
            <div
              class="metric-value"
              :class="getMetricStatusClass('memory')"
            >
              {{ healthReport?.memoryUsage?.percentage?.toFixed(1) || 0 }}%
            </div>
            <div class="metric-details">
              <div class="detail-row">
                <span>已用: {{ formatBytes(healthReport?.memoryUsage?.used || 0) }}</span>
                <span>可用: {{ formatBytes(healthReport?.memoryUsage?.available || 0) }}</span>
              </div>
              <div
                v-if="healthReport?.memoryUsage?.leakDetected"
                class="memory-leak-warning"
              >
                <el-icon><Warning /></el-icon>
                检测到内存泄漏
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 错误率 -->
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-header">
            <el-icon class="metric-icon">
              <WarningFilled />
            </el-icon>
            <span class="metric-title">错误率</span>
          </div>
          <div class="metric-content">
            <div
              class="metric-value"
              :class="getMetricStatusClass('error')"
            >
              {{ ((healthReport?.errorRate || 0) * 100).toFixed(2) }}%
            </div>
            <div class="metric-details">
              <div class="detail-row">
                <span>总错误: {{ healthReport?.componentErrors?.count || 0 }}</span>
                <span>严重: {{ healthReport?.componentErrors?.criticalErrors || 0 }}</span>
              </div>
              <div class="error-trend">
                最近错误数: {{ healthReport?.componentErrors?.topErrors?.length || 0 }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- API响应时间 -->
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-header">
            <el-icon class="metric-icon">
              <Connection />
            </el-icon>
            <span class="metric-title">API响应</span>
          </div>
          <div class="metric-content">
            <div
              class="metric-value"
              :class="getMetricStatusClass('api')"
            >
              {{ healthReport?.apiResponse?.averageResponseTime?.toFixed(0) || 0 }}ms
            </div>
            <div class="metric-details">
              <div class="detail-row">
                <span>成功率: {{ (healthReport?.apiResponse?.successRate || 0).toFixed(1) }}%</span>
                <span>失败: {{ healthReport?.apiResponse?.failedRequests || 0 }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细监控图表区域 -->
    <el-row
      :gutter="20"
      class="charts-section"
    >
      <!-- 性能趋势图表 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>性能趋势监控</span>
              <el-select
                v-model="selectedMetric"
                size="small"
                style="width: 120px;"
              >
                <el-option
                  label="UI响应"
                  value="ui-response"
                />
                <el-option
                  label="内存使用"
                  value="memory"
                />
                <el-option
                  label="API响应"
                  value="api"
                />
              </el-select>
            </div>
          </template>
          <div
            ref="performanceChart"
            class="chart-container"
          />
        </el-card>
      </el-col>

      <!-- 系统资源使用 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>系统资源监控</span>
          </template>
          <div class="resource-monitors">
            <!-- CPU使用率 (模拟) -->
            <div class="resource-item">
              <div class="resource-header">
                <span>CPU使用率</span>
                <span class="resource-value">{{ cpuUsage.toFixed(1) }}%</span>
              </div>
              <el-progress 
                :percentage="cpuUsage" 
                :color="getProgressColor(cpuUsage, 80)"
                :show-text="false"
              />
            </div>

            <!-- 数据库连接池 -->
            <div class="resource-item">
              <div class="resource-header">
                <span>数据库连接池</span>
                <span class="resource-value">
                  {{ healthReport?.databasePerformance?.connectionPoolUtilization || 0 }}%
                </span>
              </div>
              <el-progress 
                :percentage="healthReport?.databasePerformance?.connectionPoolUtilization || 0" 
                :color="getProgressColor(healthReport?.databasePerformance?.connectionPoolUtilization || 0, 90)"
                :show-text="false"
              />
            </div>

            <!-- 代码生成队列 -->
            <div class="resource-item">
              <div class="resource-header">
                <span>代码生成队列</span>
                <span class="resource-value">{{ healthReport?.codeGenerationSpeed?.queueLength || 0 }} 任务</span>
              </div>
              <el-progress 
                :percentage="Math.min(100, (healthReport?.codeGenerationSpeed?.queueLength || 0) * 10)" 
                :color="getProgressColor((healthReport?.codeGenerationSpeed?.queueLength || 0) * 10, 70)"
                :show-text="false"
              />
            </div>

            <!-- 模板缓存命中率 -->
            <div class="resource-item">
              <div class="resource-header">
                <span>模板缓存命中率</span>
                <span class="resource-value">{{ healthReport?.codeGenerationSpeed?.templateCacheHitRate || 0 }}%</span>
              </div>
              <el-progress 
                :percentage="healthReport?.codeGenerationSpeed?.templateCacheHitRate || 0" 
                :color="getProgressColor(healthReport?.codeGenerationSpeed?.templateCacheHitRate || 0, 50, true)"
                :show-text="false"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 错误详情和建议 -->
    <el-row
      :gutter="20"
      class="bottom-section"
    >
      <!-- 最近错误 -->
      <el-col :span="12">
        <el-card class="errors-card">
          <template #header>
            <div class="card-header">
              <span>最近错误</span>
              <el-badge
                :value="healthReport?.componentErrors?.count || 0"
                type="danger"
              />
            </div>
          </template>
          <div class="errors-list">
            <div 
              v-for="error in healthReport?.componentErrors?.topErrors?.slice(0, 5)"
              :key="error.message"
              class="error-item"
            >
              <div class="error-main">
                <el-tag
                  :type="getErrorTagType(error.severity)"
                  size="small"
                >
                  {{ error.severity.toUpperCase() }}
                </el-tag>
                <span class="error-message">{{ error.message }}</span>
                <span class="error-count">{{ error.count }}次</span>
              </div>
              <div class="error-time">
                {{ formatTime(error.lastOccurrence) }}
              </div>
            </div>
            <div
              v-if="!healthReport?.componentErrors?.topErrors?.length"
              class="no-errors"
            >
              <el-icon><CircleCheck /></el-icon>
              <span>暂无错误记录</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 性能建议 -->
      <el-col :span="12">
        <el-card class="recommendations-card">
          <template #header>
            <div class="card-header">
              <span>性能优化建议</span>
              <el-badge
                :value="healthReport?.recommendations?.length || 0"
                type="primary"
              />
            </div>
          </template>
          <div class="recommendations-list">
            <div 
              v-for="(recommendation, index) in healthReport?.recommendations"
              :key="index"
              class="recommendation-item"
            >
              <div class="recommendation-header">
                <el-tag
                  :type="getPriorityTagType(recommendation.priority)"
                  size="small"
                >
                  {{ recommendation.priority.toUpperCase() }}
                </el-tag>
                <span class="recommendation-title">{{ recommendation.title }}</span>
              </div>
              <div class="recommendation-description">
                {{ recommendation.description }}
              </div>
              <div class="recommendation-meta">
                <span class="impact">影响: {{ recommendation.impact }}</span>
                <span class="effort">工作量: {{ recommendation.effort }}</span>
              </div>
            </div>
            <div
              v-if="!healthReport?.recommendations?.length"
              class="no-recommendations"
            >
              <el-icon><CircleCheck /></el-icon>
              <span>系统运行良好，暂无优化建议</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据刷新时间 -->
    <div class="dashboard-footer">
      <span class="update-time">
        最后更新: {{ healthReport?.timestamp ? formatTime(healthReport.timestamp) : '未知' }}
      </span>
      <span class="auto-refresh">
        <el-icon><Refresh /></el-icon>
        自动刷新: {{ refreshInterval / 1000 }}秒
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { performanceMonitor } from './PerformanceMonitor'
import type { SystemHealthReport } from './PerformanceMonitor'
import * as echarts from 'echarts'
import {
  Monitor,
  CircleCheck,
  Warning,
  CircleClose,
  Check,
  Clock,
  WarningFilled,
  Connection,
  ArrowUp,
  ArrowDown,
  Minus,
  Refresh
} from '@element-plus/icons-vue'

// 响应式数据
const healthReport = ref<SystemHealthReport>()
const isAutoHealingEnabled = ref(true)
const selectedMetric = ref('ui-response')
const cpuUsage = ref(0)
const refreshInterval = ref(5000) // 5秒刷新间隔

// 图表相关
const performanceChart = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null
let refreshTimer: number | null = null

// 计算属性
const healthStatusType = computed(() => {
  const status = healthReport.value?.healthStatus
  switch (status) {
    case 'excellent': return 'success'
    case 'good': return 'primary'
    case 'warning': return 'warning'
    case 'critical': return 'danger'
    default: return 'info'
  }
})

const healthStatusText = computed(() => {
  const status = healthReport.value?.healthStatus
  switch (status) {
    case 'excellent': return '优秀'
    case 'good': return '良好'
    case 'warning': return '警告'
    case 'critical': return '严重'
    default: return '未知'
  }
})

const healthStatusIcon = computed(() => {
  const status = healthReport.value?.healthStatus
  switch (status) {
    case 'excellent': return CircleCheck
    case 'good': return Check
    case 'warning': return Warning
    case 'critical': return CircleClose
    default: return Check
  }
})

const scoreClass = computed(() => {
  const score = healthReport.value?.overallScore || 0
  if (score >= 90) return 'score-excellent'
  if (score >= 75) return 'score-good'
  if (score >= 50) return 'score-warning'
  return 'score-critical'
})

const hasWarnings = computed(() => {
  return healthReport.value?.warnings && healthReport.value.warnings.length > 0
})

// 方法
const refreshData = async () => {
  try {
    healthReport.value = await performanceMonitor.monitorSystemHealth()
    // 模拟CPU使用率变化
    cpuUsage.value = Math.random() * 100
    
    // 更新图表
    updateChart()
  } catch (error) {
    console.error('刷新数据失败:', error)
  }
}

const toggleAutoHealing = () => {
  isAutoHealingEnabled.value = !isAutoHealingEnabled.value
  if (isAutoHealingEnabled.value) {
    performanceMonitor.enableAutoHealing()
  } else {
    performanceMonitor.disableAutoHealing()
  }
}

const getMetricStatusClass = (metricType: string) => {
  const report = healthReport.value
  if (!report) return 'metric-normal'

  switch (metricType) {
    case 'ui-response':
      return report.uiResponse.status === 'critical' ? 'metric-critical' :
             report.uiResponse.status === 'warning' ? 'metric-warning' : 'metric-normal'
    case 'memory':
      return report.memoryUsage.percentage > 90 ? 'metric-critical' :
             report.memoryUsage.percentage > 80 ? 'metric-warning' : 'metric-normal'
    case 'error':
      return report.errorRate > 0.05 ? 'metric-critical' :
             report.errorRate > 0.01 ? 'metric-warning' : 'metric-normal'
    case 'api':
      return report.apiResponse.averageResponseTime > 1000 ? 'metric-critical' :
             report.apiResponse.averageResponseTime > 500 ? 'metric-warning' : 'metric-normal'
    default:
      return 'metric-normal'
  }
}

const getTrendText = (trend?: string) => {
  switch (trend) {
    case 'improving': return '改善中'
    case 'degrading': return '恶化中'
    default: return '稳定'
  }
}

const getProgressColor = (value: number, threshold: number, reverse = false) => {
  if (reverse) {
    // 对于缓存命中率等指标，值越高越好
    if (value >= threshold) return '#67C23A' // 绿色
    if (value >= threshold * 0.7) return '#E6A23C' // 橙色
    return '#F56C6C' // 红色
  } else {
    // 对于使用率等指标，值越低越好
    if (value >= threshold) return '#F56C6C' // 红色
    if (value >= threshold * 0.8) return '#E6A23C' // 橙色
    return '#67C23A' // 绿色
  }
}

const getErrorTagType = (severity: string) => {
  switch (severity) {
    case 'critical': return 'danger'
    case 'high': return 'danger'
    case 'medium': return 'warning'
    default: return 'info'
  }
}

const getPriorityTagType = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'danger'
    case 'high': return 'warning'
    case 'medium': return 'primary'
    default: return 'info'
  }
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(date))
}

const initChart = () => {
  if (!performanceChart.value) return

  chartInstance = echarts.init(performanceChart.value)
  
  const option = {
    title: {
      text: '性能趋势',
      left: 'center',
      textStyle: {
        fontSize: 14,
        color: '#606266'
      }
    },
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
      boundaryGap: false,
      data: Array.from({ length: 20 }, (_, i) => {
        const time = new Date(Date.now() - (19 - i) * 30000)
        return time.toLocaleTimeString()
      })
    },
    yAxis: {
      type: 'value',
      name: '响应时间(ms)',
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: 'UI响应时间',
        type: 'line',
        smooth: true,
        data: Array.from({ length: 20 }, () => Math.random() * 200 + 50),
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64, 158, 255, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(64, 158, 255, 0.1)'
            }
          ])
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

const updateChart = () => {
  if (!chartInstance) return

  // 模拟数据更新
  const option = chartInstance.getOption() as any
  const now = new Date()
  
  // 更新x轴时间
  option.xAxis[0].data.shift()
  option.xAxis[0].data.push(now.toLocaleTimeString())
  
  // 更新数据
  const newValue = selectedMetric.value === 'ui-response' 
    ? (healthReport.value?.uiResponse?.current || 0)
    : selectedMetric.value === 'memory'
    ? (healthReport.value?.memoryUsage?.percentage || 0)
    : (healthReport.value?.apiResponse?.averageResponseTime || 0)
  
  option.series[0].data.shift()
  option.series[0].data.push(newValue)
  
  chartInstance.setOption(option)
}

const startAutoRefresh = () => {
  refreshTimer = window.setInterval(refreshData, refreshInterval.value)
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 生命周期
onMounted(async () => {
  await refreshData()
  await nextTick()
  initChart()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
  if (chartInstance) {
    chartInstance.dispose()
  }
})
</script>

<style scoped lang="scss">
.system-health-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;

      .dashboard-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }

      .health-indicator {
        :deep(.el-tag) {
          font-size: 14px;
          padding: 8px 16px;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 20px;

      .overall-score {
        text-align: center;

        .score-label {
          display: block;
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
        }

        .score-value {
          font-size: 28px;
          font-weight: bold;

          &.score-excellent {
            color: #67C23A;
          }

          &.score-good {
            color: #409EFF;
          }

          &.score-warning {
            color: #E6A23C;
          }

          &.score-critical {
            color: #F56C6C;
          }
        }
      }
    }
  }

  .warnings-section {
    margin-bottom: 20px;

    .warning-item {
      margin-bottom: 10px;

      .warning-details {
        display: flex;
        gap: 20px;
        margin-top: 8px;
        font-size: 12px;
        color: #909399;

        .auto-resolution {
          color: #67C23A;
          font-weight: 500;
        }
      }
    }
  }

  .metrics-cards {
    margin-bottom: 20px;

    .metric-card {
      .metric-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;

        .metric-icon {
          font-size: 18px;
          color: #409EFF;
        }

        .metric-title {
          font-size: 14px;
          font-weight: 500;
          color: #606266;
        }
      }

      .metric-content {
        .metric-value {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 12px;

          &.metric-normal {
            color: #67C23A;
          }

          &.metric-warning {
            color: #E6A23C;
          }

          &.metric-critical {
            color: #F56C6C;
          }
        }

        .metric-details {
          .detail-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #909399;
            margin-bottom: 8px;
          }

          .metric-trend {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            font-weight: 500;

            &.improving {
              color: #67C23A;
            }

            &.degrading {
              color: #F56C6C;
            }

            &.stable {
              color: #909399;
            }
          }

          .memory-leak-warning {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #F56C6C;
            font-size: 12px;
            margin-top: 8px;
          }
        }
      }
    }
  }

  .charts-section {
    margin-bottom: 20px;

    .chart-card {
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .chart-container {
        height: 300px;
        width: 100%;
      }

      .resource-monitors {
        .resource-item {
          margin-bottom: 20px;

          .resource-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 14px;

            .resource-value {
              font-weight: 600;
              color: #409EFF;
            }
          }
        }
      }
    }
  }

  .bottom-section {
    .errors-card,
    .recommendations-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .errors-list,
      .recommendations-list {
        max-height: 400px;
        overflow-y: auto;
      }

      .error-item {
        padding: 12px 0;
        border-bottom: 1px solid #EBEEF5;

        &:last-child {
          border-bottom: none;
        }

        .error-main {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;

          .error-message {
            flex: 1;
            font-size: 14px;
            color: #303133;
          }

          .error-count {
            font-size: 12px;
            color: #909399;
            background: #F5F7FA;
            padding: 2px 8px;
            border-radius: 4px;
          }
        }

        .error-time {
          font-size: 12px;
          color: #C0C4CC;
        }
      }

      .recommendation-item {
        padding: 12px 0;
        border-bottom: 1px solid #EBEEF5;

        &:last-child {
          border-bottom: none;
        }

        .recommendation-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;

          .recommendation-title {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
          }
        }

        .recommendation-description {
          font-size: 13px;
          color: #606266;
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .recommendation-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #909399;
        }
      }

      .no-errors,
      .no-recommendations {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 40px 20px;
        color: #67C23A;
        font-size: 14px;
      }
    }
  }

  .dashboard-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding: 16px 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    font-size: 12px;
    color: #909399;

    .auto-refresh {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .system-health-dashboard {
    .metrics-cards {
      :deep(.el-col) {
        &:nth-child(n+3) {
          margin-top: 20px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .system-health-dashboard {
    padding: 10px;

    .dashboard-header {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;

      .header-right {
        width: 100%;
        justify-content: space-between;
      }
    }

    .metrics-cards {
      :deep(.el-col) {
        margin-bottom: 20px;
      }
    }
  }
}
</style>
