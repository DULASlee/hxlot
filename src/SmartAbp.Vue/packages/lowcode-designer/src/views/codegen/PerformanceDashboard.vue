<!--
  代码生成性能监控仪表板
  展示低代码引擎的性能指标、统计数据和优化建议
-->
<template>
  <div class="performance-dashboard">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-tachometer-alt" />
        性能监控中心
      </h1>
      <p class="page-description">
        低代码引擎性能指标监控与分析
      </p>

      <div class="header-actions">
        <button
          class="refresh-btn"
          :disabled="loading"
          @click="refreshData"
        >
          <i
            class="fas fa-sync-alt"
            :class="{ spinning: loading }"
          />
          刷新数据
        </button>
        <button
          class="export-btn"
          @click="exportReport"
        >
          <i class="fas fa-download" />
          导出报告
        </button>
        <div class="time-range-selector">
          <select
            v-model="timeRange"
            class="time-select"
            @change="onTimeRangeChange"
          >
            <option value="1h">
              最近1小时
            </option>
            <option value="6h">
              最近6小时
            </option>
            <option value="24h">
              最近24小时
            </option>
            <option value="7d">
              最近7天
            </option>
            <option value="30d">
              最近30天
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- 关键指标卡片 -->
      <div class="metrics-cards">
        <div class="metric-card">
          <div class="metric-icon">
            <i
              class="fas fa-bolt"
              :class="getStatusClass(metrics.averageGenerationTime, 200)"
            />
          </div>
          <div class="metric-content">
            <h3 class="metric-title">
              平均生成时间
            </h3>
            <p class="metric-value">
              {{ metrics.averageGenerationTime }}ms
            </p>
            <span
              class="metric-trend"
              :class="getTrendClass(metrics.generationTimeTrend)"
            >
              <i :class="getTrendIcon(metrics.generationTimeTrend)" />
              {{ Math.abs(metrics.generationTimeTrend) }}%
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <i
              class="fas fa-check-circle"
              :class="getStatusClass(metrics.successRate, 95, true)"
            />
          </div>
          <div class="metric-content">
            <h3 class="metric-title">
              成功率
            </h3>
            <p class="metric-value">
              {{ metrics.successRate }}%
            </p>
            <span
              class="metric-trend"
              :class="getTrendClass(metrics.successRateTrend)"
            >
              <i :class="getTrendIcon(metrics.successRateTrend)" />
              {{ Math.abs(metrics.successRateTrend) }}%
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <i
              class="fas fa-code"
              :class="getStatusClass(metrics.throughput, 50, true)"
            />
          </div>
          <div class="metric-content">
            <h3 class="metric-title">
              吞吐量
            </h3>
            <p class="metric-value">
              {{ metrics.throughput }}/min
            </p>
            <span
              class="metric-trend"
              :class="getTrendClass(metrics.throughputTrend)"
            >
              <i :class="getTrendIcon(metrics.throughputTrend)" />
              {{ Math.abs(metrics.throughputTrend) }}%
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <i
              class="fas fa-memory"
              :class="getStatusClass(metrics.memoryUsage, 500)"
            />
          </div>
          <div class="metric-content">
            <h3 class="metric-title">
              内存使用
            </h3>
            <p class="metric-value">
              {{ metrics.memoryUsage }}MB
            </p>
            <span
              class="metric-trend"
              :class="getTrendClass(metrics.memoryUsageTrend)"
            >
              <i :class="getTrendIcon(metrics.memoryUsageTrend)" />
              {{ Math.abs(metrics.memoryUsageTrend) }}%
            </span>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <!-- 性能趋势图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">
              <i class="fas fa-chart-line" />
              性能趋势
            </h3>
            <div class="chart-controls">
              <div class="chart-legend">
                <span class="legend-item">
                  <span
                    class="legend-color"
                    style="background: var(--theme-brand-primary);"
                  />
                  生成时间 (ms)
                </span>
                <span class="legend-item">
                  <span
                    class="legend-color"
                    style="background: var(--theme-success);"
                  />
                  成功率 (%)
                </span>
              </div>
            </div>
          </div>
          <div class="chart-container">
            <div class="chart-placeholder">
              <i class="fas fa-chart-line" />
              <p>性能趋势图</p>
              <div class="mock-chart">
                <!-- 模拟图表数据 -->
                <div class="chart-bars">
                  <div
                    v-for="(point, index) in performanceData"
                    :key="index"
                    class="chart-bar"
                  >
                    <div
                      class="bar-fill"
                      :style="{
                        height: `${(point.generationTime / 300) * 100}%`,
                        background: 'var(--theme-brand-primary)'
                      }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 插件性能分析 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">
              <i class="fas fa-puzzle-piece" />
              插件性能分析
            </h3>
          </div>
          <div class="chart-container">
            <div class="plugin-performance-list">
              <div
                v-for="plugin in pluginPerformance"
                :key="plugin.name"
                class="plugin-item"
              >
                <div class="plugin-info">
                  <div class="plugin-name">
                    {{ plugin.name }}
                  </div>
                  <div class="plugin-stats">
                    <span class="stat">平均时间: {{ plugin.averageTime }}ms</span>
                    <span class="stat">调用次数: {{ plugin.callCount }}</span>
                    <span class="stat">成功率: {{ plugin.successRate }}%</span>
                  </div>
                </div>
                <div class="plugin-performance-bar">
                  <div
                    class="performance-fill"
                    :style="{
                      width: `${(plugin.averageTime / Math.max(...pluginPerformance.map(p => p.averageTime))) * 100}%`,
                      background: getPerformanceColor(plugin.averageTime)
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细统计和错误分析 -->
      <div class="stats-section">
        <!-- Worker池与缓存健康度 -->
        <div class="stats-card">
          <div class="stats-header">
            <h3 class="stats-title">
              <i class="fas fa-industry" />
              Worker池与缓存健康度
            </h3>
            <button
              class="refresh-btn"
              :disabled="loading"
              @click="pullRuntimeHealth"
            >
              刷新
            </button>
          </div>
          <div class="stats-content">
            <div class="health-grid">
              <div class="health-item">
                <div class="health-label">
                  任务提交
                </div>
                <div class="health-value">
                  {{ workerMetrics.submitted }}
                </div>
              </div>
              <div class="health-item">
                <div class="health-label">
                  进行中
                </div>
                <div class="health-value">
                  {{ workerMetrics.inFlight }}
                </div>
              </div>
              <div class="health-item">
                <div class="health-label">
                  完成
                </div>
                <div class="health-value">
                  {{ workerMetrics.completed }}
                </div>
              </div>
              <div class="health-item">
                <div class="health-label">
                  失败
                </div>
                <div class="health-value">
                  {{ workerMetrics.failed }}
                </div>
              </div>
              <div class="health-item">
                <div class="health-label">
                  队列峰值
                </div>
                <div class="health-value">
                  {{ workerMetrics.queueMax }}
                </div>
              </div>
            </div>

            <div class="health-grid">
              <div class="health-item">
                <div class="health-label">
                  缓存条目
                </div>
                <div class="health-value">
                  {{ cacheStats.totalEntries }}
                </div>
              </div>
              <div class="health-item">
                <div class="health-label">
                  缓存大小
                </div>
                <div class="health-value">
                  {{ (cacheStats.totalSizeBytes/1024/1024).toFixed(2) }} MB
                </div>
              </div>
              <div class="health-item">
                <div class="health-label">
                  平均条目大小
                </div>
                <div class="health-value">
                  {{ (cacheStats.averageEntrySize/1024).toFixed(2) }} KB
                </div>
              </div>
              <div class="health-item">
                <div class="health-label">
                  访问计数
                </div>
                <div class="health-value">
                  {{ cacheStats.totalAccessCount }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 错误分析 -->
        <div class="stats-card">
          <div class="stats-header">
            <h3 class="stats-title">
              <i class="fas fa-exclamation-triangle" />
              错误分析
            </h3>
            <div class="error-summary">
              <span
                class="error-count"
                :class="{ 'has-errors': errorStats.totalErrors > 0 }"
              >
                {{ errorStats.totalErrors }} 个错误
              </span>
            </div>
          </div>

          <div class="stats-content">
            <div
              v-if="errorStats.totalErrors === 0"
              class="no-errors"
            >
              <i class="fas fa-check-circle" />
              <p>暂无错误记录</p>
            </div>

            <div
              v-else
              class="error-list"
            >
              <div
                v-for="error in errorStats.errors"
                :key="error.type"
                class="error-item"
              >
                <div class="error-icon">
                  <i :class="getErrorIcon(error.type)" />
                </div>
                <div class="error-details">
                  <div class="error-type">
                    {{ error.type }}
                  </div>
                  <div class="error-count">
                    {{ error.count }} 次
                  </div>
                  <div class="error-description">
                    {{ error.description }}
                  </div>
                </div>
                <div class="error-trend">
                  <span :class="getTrendClass(error.trend)">
                    <i :class="getTrendIcon(error.trend)" />
                    {{ Math.abs(error.trend) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 系统资源 -->
        <div class="stats-card">
          <div class="stats-header">
            <h3 class="stats-title">
              <i class="fas fa-server" />
              系统资源
            </h3>
          </div>

          <div class="stats-content">
            <div class="resource-metrics">
              <div class="resource-item">
                <div class="resource-label">
                  CPU 使用率
                </div>
                <div class="resource-bar">
                  <div
                    class="resource-fill"
                    :style="{
                      width: `${systemResources.cpuUsage}%`,
                      background: getResourceColor(systemResources.cpuUsage)
                    }"
                  />
                </div>
                <div class="resource-value">
                  {{ systemResources.cpuUsage }}%
                </div>
              </div>

              <div class="resource-item">
                <div class="resource-label">
                  内存使用率
                </div>
                <div class="resource-bar">
                  <div
                    class="resource-fill"
                    :style="{
                      width: `${systemResources.memoryUsage}%`,
                      background: getResourceColor(systemResources.memoryUsage)
                    }"
                  />
                </div>
                <div class="resource-value">
                  {{ systemResources.memoryUsage }}%
                </div>
              </div>

              <div class="resource-item">
                <div class="resource-label">
                  缓存命中率
                </div>
                <div class="resource-bar">
                  <div
                    class="resource-fill"
                    :style="{
                      width: `${systemResources.cacheHitRate}%`,
                      background: getResourceColor(systemResources.cacheHitRate, true)
                    }"
                  />
                </div>
                <div class="resource-value">
                  {{ systemResources.cacheHitRate }}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 优化建议 -->
        <div class="stats-card">
          <div class="stats-header">
            <h3 class="stats-title">
              <i class="fas fa-lightbulb" />
              优化建议
            </h3>
          </div>

          <div class="stats-content">
            <div
              v-if="optimizationSuggestions.length === 0"
              class="no-suggestions"
            >
              <i class="fas fa-thumbs-up" />
              <p>系统运行良好，暂无优化建议</p>
            </div>

            <div
              v-else
              class="suggestions-list"
            >
              <div
                v-for="suggestion in optimizationSuggestions"
                :key="suggestion.id"
                class="suggestion-item"
                :class="`priority-${suggestion.priority}`"
              >
                <div class="suggestion-icon">
                  <i :class="getSuggestionIcon(suggestion.priority)" />
                </div>
                <div class="suggestion-content">
                  <div class="suggestion-title">
                    {{ suggestion.title }}
                  </div>
                  <div class="suggestion-description">
                    {{ suggestion.description }}
                  </div>
                  <div class="suggestion-impact">
                    预期提升: {{ suggestion.expectedImprovement }}
                  </div>
                </div>
                <div class="suggestion-actions">
                  <button
                    class="apply-btn"
                    @click="applySuggestion(suggestion.id)"
                  >
                    <i class="fas fa-check" />
                    应用
                  </button>
                  <button
                    class="dismiss-btn"
                    @click="dismissSuggestion(suggestion.id)"
                  >
                    <i class="fas fa-times" />
                    忽略
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 实时日志 -->
      <div class="logs-section">
        <div class="logs-card">
          <div class="logs-header">
            <h3 class="logs-title">
              <i class="fas fa-file-alt" />
              实时性能日志
            </h3>
            <div class="logs-controls">
              <button
                class="logs-btn"
                @click="clearLogs"
              >
                <i class="fas fa-trash" />
                清空
              </button>
              <button
                class="logs-btn"
                :class="{ active: autoScroll }"
                @click="toggleAutoScroll"
              >
                <i class="fas fa-arrow-down" />
                自动滚动
              </button>
              <select
                v-model="logLevel"
                class="log-level-select"
              >
                <option value="all">
                  全部级别
                </option>
                <option value="error">
                  错误
                </option>
                <option value="warn">
                  警告
                </option>
                <option value="info">
                  信息
                </option>
                <option value="debug">
                  调试
                </option>
              </select>
            </div>
          </div>

          <div
            ref="logsContainer"
            class="logs-content"
          >
            <div
              v-for="log in filteredLogs"
              :key="log.id"
              class="log-entry"
              :class="`log-${log.level}`"
            >
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span class="log-level">{{ log.level.toUpperCase() }}</span>
              <span class="log-message">{{ log.message }}</span>
              <span
                v-if="log.duration"
                class="log-duration"
              >{{ log.duration }}ms</span>
              <span
                v-if="log.plugin"
                class="log-plugin"
              >[{{ log.plugin }}]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
// 运行时内容缓存与日志改为可选注入，避免构建期硬依赖
const globalContentCache: any = (globalThis as any).__lowcodeRuntime?.contentCache || { getStats: () => ({ totalEntries: 0, totalSizeBytes: 0, totalAccessCount: 0, averageEntrySize: 0 }) }
const logger: any = (globalThis as any).__lowcodeRuntime?.logger || console
// Worker池实例位于SfcCompilerEngine内部，无法直接注入，这里通过全局暴露的窗口变量进行读取
// 在实际项目中，建议提供显式的服务暴露接口
const workerMetrics = ref({ submitted: 0, completed: 0, failed: 0, inFlight: 0, queueMax: 0 })
const cacheStats = ref({ totalEntries: 0, totalSizeBytes: 0, totalAccessCount: 0, averageEntrySize: 0 })
// logger 已从统一入口导入

// 组件日志器
const componentLogger = logger.child({ component: 'PerformanceDashboard' })

// 响应式状态
const loading = ref(false)
const timeRange = ref('24h')
const autoScroll = ref(true)
const logLevel = ref('all')

// 性能指标
const metrics = ref({
  averageGenerationTime: 156,
  generationTimeTrend: -12.5,
  successRate: 98.7,
  successRateTrend: 2.1,
  throughput: 85,
  throughputTrend: 8.3,
  memoryUsage: 342,
  memoryUsageTrend: -5.2
})

// 性能数据
const performanceData = ref([
  { timestamp: Date.now() - 3600000, generationTime: 180, successRate: 95 },
  { timestamp: Date.now() - 3000000, generationTime: 165, successRate: 97 },
  { timestamp: Date.now() - 2400000, generationTime: 145, successRate: 98 },
  { timestamp: Date.now() - 1800000, generationTime: 138, successRate: 99 },
  { timestamp: Date.now() - 1200000, generationTime: 152, successRate: 97 },
  { timestamp: Date.now() - 600000, generationTime: 148, successRate: 98 },
  { timestamp: Date.now(), generationTime: 156, successRate: 99 }
])

// 插件性能
const pluginPerformance = ref([
  {
    name: 'Vue3Generator',
    averageTime: 89,
    callCount: 1250,
    successRate: 99.2
  },
  {
    name: 'SfcCompiler',
    averageTime: 67,
    callCount: 890,
    successRate: 98.8
  },
  {
    name: 'SchemaValidator',
    averageTime: 23,
    callCount: 1450,
    successRate: 100
  },
  {
    name: 'CodeOptimizer',
    averageTime: 45,
    callCount: 780,
    successRate: 97.5
  }
])

// 错误统计
const errorStats = ref({
  totalErrors: 3,
  errors: [
    {
      type: '编译错误',
      count: 2,
      description: 'TypeScript编译失败',
      trend: -25
    },
    {
      type: 'Schema验证',
      count: 1,
      description: 'Schema格式不正确',
      trend: 0
    }
  ]
})

// 系统资源
const systemResources = ref({
  cpuUsage: 23,
  memoryUsage: 67,
  cacheHitRate: 94
})

// 优化建议
const optimizationSuggestions = ref([
  {
    id: 1,
    title: '启用代码缓存',
    description: '对频繁生成的组件启用缓存可以显著提升性能',
    expectedImprovement: '减少30%生成时间',
    priority: 'high'
  },
  {
    id: 2,
    title: '优化Schema验证',
    description: '简化Schema验证规则可以减少验证时间',
    expectedImprovement: '减少15%验证时间',
    priority: 'medium'
  }
])

// 日志数据
const performanceLogs = ref<Array<{
  id: string
  level: string
  message: string
  timestamp: number
  duration?: number
  plugin?: string
}>>([
  {
    id: 'log1',
    level: 'info',
    message: '开始生成Vue组件',
    timestamp: Date.now() - 300000,
    plugin: 'Vue3Generator'
  },
  {
    id: 'log2',
    level: 'debug',
    message: '编译模板完成',
    timestamp: Date.now() - 250000,
    duration: 45,
    plugin: 'SfcCompiler'
  },
  {
    id: 'log3',
    level: 'warn',
    message: '检测到未使用的导入',
    timestamp: Date.now() - 200000,
    plugin: 'CodeOptimizer'
  },
  {
    id: 'log4',
    level: 'info',
    message: '代码生成完成',
    timestamp: Date.now() - 150000,
    duration: 156,
    plugin: 'Vue3Generator'
  },
  {
    id: 'log5',
    level: 'error',
    message: 'TypeScript类型检查失败',
    timestamp: Date.now() - 100000,
    plugin: 'TypeChecker'
  }
])

const logsContainer = ref<HTMLElement>()

// 计算属性
const filteredLogs = computed(() => {
  if (logLevel.value === 'all') {
    return performanceLogs.value
  }
  return performanceLogs.value.filter(log => log.level === logLevel.value)
})

// 方法定义
const getStatusClass = (value: number, threshold: number, higher: boolean = false) => {
  if (higher) {
    return value >= threshold ? 'status-good' : 'status-warning'
  }
  return value <= threshold ? 'status-good' : 'status-warning'
}

const getTrendClass = (trend: number) => {
  if (trend > 0) return 'trend-up'
  if (trend < 0) return 'trend-down'
  return 'trend-neutral'
}

const getTrendIcon = (trend: number) => {
  if (trend > 0) return 'fas fa-arrow-up'
  if (trend < 0) return 'fas fa-arrow-down'
  return 'fas fa-minus'
}

const getPerformanceColor = (time: number) => {
  if (time <= 50) return 'var(--theme-success)'
  if (time <= 100) return 'var(--theme-warning)'
  return 'var(--theme-error)'
}

const getResourceColor = (usage: number, inverse: boolean = false) => {
  if (inverse) {
    if (usage >= 90) return 'var(--theme-success)'
    if (usage >= 70) return 'var(--theme-warning)'
    return 'var(--theme-error)'
  } else {
    if (usage <= 50) return 'var(--theme-success)'
    if (usage <= 80) return 'var(--theme-warning)'
    return 'var(--theme-error)'
  }
}

const getErrorIcon = (type: string) => {
  switch (type) {
    case '编译错误': return 'fas fa-code'
    case 'Schema验证': return 'fas fa-check-circle'
    case '网络错误': return 'fas fa-wifi'
    default: return 'fas fa-exclamation-triangle'
  }
}

const getSuggestionIcon = (priority: string) => {
  switch (priority) {
    case 'high': return 'fas fa-exclamation-triangle'
    case 'medium': return 'fas fa-info-circle'
    case 'low': return 'fas fa-lightbulb'
    default: return 'fas fa-info-circle'
  }
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const refreshData = async () => {
  loading.value = true

  try {
    // 模拟数据刷新
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新性能指标
    metrics.value = {
      averageGenerationTime: 120 + Math.random() * 80,
      generationTimeTrend: (Math.random() - 0.5) * 30,
      successRate: 95 + Math.random() * 5,
      successRateTrend: (Math.random() - 0.5) * 10,
      throughput: 60 + Math.random() * 40,
      throughputTrend: (Math.random() - 0.5) * 20,
      memoryUsage: 300 + Math.random() * 200,
      memoryUsageTrend: (Math.random() - 0.5) * 15
    }

    componentLogger.info('性能数据刷新完成')
  } catch (error) {
    componentLogger.error('刷新数据失败', error as Error)
  } finally {
    loading.value = false
  }
}

const onTimeRangeChange = () => {
  componentLogger.info('时间范围改变', { timeRange: timeRange.value })
  refreshData()
}

const exportReport = () => {
  try {
    const report = {
      timestamp: new Date().toISOString(),
      timeRange: timeRange.value,
      metrics: metrics.value,
      performanceData: performanceData.value,
      pluginPerformance: pluginPerformance.value,
      errorStats: errorStats.value,
      systemResources: systemResources.value,
      optimizationSuggestions: optimizationSuggestions.value
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-report-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    componentLogger.info('性能报告导出成功')
  } catch (error) {
    componentLogger.error('导出报告失败', error as Error)
  }
}

const applySuggestion = (id: number) => {
  const suggestionIndex = optimizationSuggestions.value.findIndex(s => s.id === id)
  if (suggestionIndex > -1) {
    optimizationSuggestions.value.splice(suggestionIndex, 1)
    componentLogger.info('应用优化建议', { suggestionId: id })
  }
}

const dismissSuggestion = (id: number) => {
  const suggestionIndex = optimizationSuggestions.value.findIndex(s => s.id === id)
  if (suggestionIndex > -1) {
    optimizationSuggestions.value.splice(suggestionIndex, 1)
    componentLogger.info('忽略优化建议', { suggestionId: id })
  }
}

const clearLogs = () => {
  performanceLogs.value = []
  componentLogger.info('清空性能日志')
}

const toggleAutoScroll = () => {
  autoScroll.value = !autoScroll.value
  componentLogger.info(`自动滚动${autoScroll.value ? '启用' : '禁用'}`)
}

const pullRuntimeHealth = () => {
  try {
    const anyWin = globalThis as any
    if (anyWin.__sfcWorkerPool && typeof anyWin.__sfcWorkerPool.getMetrics === 'function') {
      const m = anyWin.__sfcWorkerPool.getMetrics()
      workerMetrics.value = { submitted: m.submitted, completed: m.completed, failed: m.failed, inFlight: m.inFlight, queueMax: m.queueMax }
    }
  } catch {}
  try {
    const stats = globalContentCache.getStats()
    cacheStats.value = stats
  } catch {}
}

// 模拟实时日志
const generateRealtimeLog = () => {
  const levels = ['debug', 'info', 'warn', 'error']
  const messages = [
    '开始代码生成',
    '编译模板',
    '优化代码',
    '类型检查',
    '生成完成'
  ]
  const plugins = ['Vue3Generator', 'SfcCompiler', 'CodeOptimizer', 'TypeChecker']

  const log = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    level: levels[Math.floor(Math.random() * levels.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    timestamp: Date.now(),
    duration: Math.random() > 0.5 ? Math.floor(Math.random() * 200) : undefined,
    plugin: plugins[Math.floor(Math.random() * plugins.length)]
  }

  performanceLogs.value.push(log)

  // 限制日志数量
  if (performanceLogs.value.length > 100) {
    performanceLogs.value.shift()
  }

  // 自动滚动
  if (autoScroll.value) {
    nextTick(() => {
      if (logsContainer.value) {
        logsContainer.value.scrollTop = logsContainer.value.scrollHeight
      }
    })
  }
}

// 生命周期
onMounted(() => {
  componentLogger.info('性能监控中心加载完成')

  // 确保所有函数被正确引用（避免TypeScript未使用警告）
  void getErrorIcon // 显式引用函数

  // 定时刷新数据
  setInterval(() => {
    if (!loading.value) {
      refreshData()
    }
  }, 30000) // 30秒刷新一次

  // 模拟实时日志
  setInterval(generateRealtimeLog, 2000) // 2秒生成一条日志
  // 轮询健康信息
  setInterval(pullRuntimeHealth, 3000)
  // 订阅元数据处理事件
  try {
    addEventListener('lowcode:metadata:processed', (e: any) => {
      const k = '__meta_durations__'
      const win = (globalThis as any)
      if (!win[k]) win[k] = [] as number[]
      const arr: number[] = win[k]
      arr.push(e.detail?.duration || 0)
      if (arr.length > 200) arr.shift()
    })
  } catch {}
})
</script>

<style scoped>
.performance-dashboard {
  padding: var(--spacing-6);
  background: var(--theme-bg-base);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-8);
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--theme-text-primary);
  margin: 0 0 var(--spacing-2) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.page-title i {
  color: var(--theme-brand-primary);
}

.page-description {
  color: var(--theme-text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.refresh-btn, .export-btn {
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-md);
  background: var(--theme-bg-component);
  color: var(--theme-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-weight: var(--font-weight-medium);
  transition: all 0.2s ease;
}

.refresh-btn:hover, .export-btn:hover {
  background: var(--theme-bg-hover);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.time-select {
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-md);
  background: var(--theme-bg-component);
  color: var(--theme-text-primary);
}

/* 指标卡片 */
.metrics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-8);
}

.metric-card {
  background: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  transition: all 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
}

.metric-icon {
  font-size: var(--font-size-2xl);
  padding: var(--spacing-3);
  border-radius: var(--radius-lg);
  background: var(--theme-bg-base);
}

.metric-icon.status-good {
  color: var(--theme-success);
}

.metric-icon.status-warning {
  color: var(--theme-warning);
}

.metric-content {
  flex: 1;
}

.metric-title {
  font-size: var(--font-size-sm);
  color: var(--theme-text-secondary);
  margin: 0 0 var(--spacing-1) 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--theme-text-primary);
  margin: 0 0 var(--spacing-2) 0;
}

.metric-trend {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.trend-up {
  color: var(--theme-success);
}

.trend-down {
  color: var(--theme-error);
}

.trend-neutral {
  color: var(--theme-text-secondary);
}

/* 图表区域 */
.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-8);
}

.chart-card {
  background: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.chart-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.chart-legend {
  display: flex;
  gap: var(--spacing-4);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--theme-text-secondary);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: var(--theme-text-tertiary);
  width: 100%;
}

.chart-placeholder i {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-4);
  display: block;
}

.mock-chart {
  margin-top: var(--spacing-6);
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 200px;
  gap: var(--spacing-2);
}

.chart-bar {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: end;
}

.bar-fill {
  width: 100%;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  min-height: 4px;
}

/* 插件性能 */
.plugin-performance-list {
  display: grid;
  gap: var(--spacing-4);
}

.plugin-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--theme-bg-base);
  border-radius: var(--radius-md);
}

.plugin-info {
  flex: 1;
}

.plugin-name {
  font-weight: var(--font-weight-semibold);
  color: var(--theme-text-primary);
  margin-bottom: var(--spacing-1);
}

.plugin-stats {
  display: flex;
  gap: var(--spacing-3);
  font-size: var(--font-size-xs);
  color: var(--theme-text-secondary);
}

.plugin-performance-bar {
  width: 100px;
  height: 8px;
  background: var(--theme-bg-component);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.performance-fill {
  height: 100%;
  border-radius: var(--radius-sm);
}

/* 统计区域 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-8);
}

.health-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(100px, 1fr));
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
}

.health-item {
  background: var(--theme-bg-base);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
}

.health-label {
  font-size: var(--font-size-xs);
  color: var(--theme-text-secondary);
}

.health-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-text-primary);
}

.stats-card {
  background: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.stats-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.error-summary {
  display: flex;
  align-items: center;
}

.error-count {
  font-size: var(--font-size-sm);
  color: var(--theme-text-secondary);
}

.error-count.has-errors {
  color: var(--theme-error);
  font-weight: var(--font-weight-semibold);
}

.no-errors, .no-suggestions {
  text-align: center;
  padding: var(--spacing-8);
  color: var(--theme-text-secondary);
}

.no-errors i, .no-suggestions i {
  font-size: var(--font-size-2xl);
  color: var(--theme-success);
  margin-bottom: var(--spacing-3);
  display: block;
}

.error-list, .suggestions-list {
  display: grid;
  gap: var(--spacing-3);
}

.error-item, .suggestion-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--theme-bg-base);
  border-radius: var(--radius-md);
}

.error-icon, .suggestion-icon {
  font-size: var(--font-size-lg);
  width: 40px;
  text-align: center;
}

.error-details, .suggestion-content {
  flex: 1;
}

.error-type, .suggestion-title {
  font-weight: var(--font-weight-semibold);
  color: var(--theme-text-primary);
  margin-bottom: var(--spacing-1);
}

.error-count, .suggestion-description {
  font-size: var(--font-size-sm);
  color: var(--theme-text-secondary);
  margin-bottom: var(--spacing-1);
}

.error-description, .suggestion-impact {
  font-size: var(--font-size-xs);
  color: var(--theme-text-tertiary);
}

.suggestion-item.priority-high {
  border-left: 4px solid var(--theme-error);
}

.suggestion-item.priority-medium {
  border-left: 4px solid var(--theme-warning);
}

.suggestion-item.priority-low {
  border-left: 4px solid var(--theme-info);
}

.suggestion-actions {
  display: flex;
  gap: var(--spacing-2);
}

.apply-btn, .dismiss-btn {
  padding: var(--spacing-2) var(--spacing-3);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-size-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.apply-btn {
  background: var(--theme-success);
  color: var(--theme-text-inverse);
}

.dismiss-btn {
  background: var(--theme-bg-component);
  color: var(--theme-text-secondary);
  border: 1px solid var(--theme-border-base);
}

/* 资源指标 */
.resource-metrics {
  display: grid;
  gap: var(--spacing-4);
}

.resource-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.resource-label {
  min-width: 100px;
  font-size: var(--font-size-sm);
  color: var(--theme-text-primary);
}

.resource-bar {
  flex: 1;
  height: 8px;
  background: var(--theme-bg-base);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.resource-fill {
  height: 100%;
  border-radius: var(--radius-sm);
  transition: width 0.3s ease;
}

.resource-value {
  min-width: 50px;
  text-align: right;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-text-primary);
}

/* 日志区域 */
.logs-section {
  margin-bottom: var(--spacing-6);
}

.logs-card {
  background: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.logs-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.logs-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.logs-btn {
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--theme-bg-base);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--theme-text-secondary);
}

.logs-btn:hover {
  background: var(--theme-bg-hover);
}

.logs-btn.active {
  background: var(--theme-brand-primary);
  color: var(--theme-text-inverse);
  border-color: var(--theme-brand-primary);
}

.log-level-select {
  padding: var(--spacing-2);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-sm);
  background: var(--theme-bg-base);
  color: var(--theme-text-primary);
  font-size: var(--font-size-sm);
}

.logs-content {
  height: 300px;
  overflow-y: auto;
  background: var(--theme-bg-base);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
}

.log-entry {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2) 0;
  border-bottom: 1px solid var(--theme-border-light);
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
}

.log-time {
  color: var(--theme-text-tertiary);
  min-width: 80px;
}

.log-level {
  min-width: 60px;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
}

.log-entry.log-debug .log-level {
  color: var(--theme-text-secondary);
}

.log-entry.log-info .log-level {
  color: var(--theme-info);
}

.log-entry.log-warn .log-level {
  color: var(--theme-warning);
}

.log-entry.log-error .log-level {
  color: var(--theme-error);
}

.log-message {
  flex: 1;
  color: var(--theme-text-primary);
}

.log-duration {
  color: var(--theme-brand-primary);
  font-weight: var(--font-weight-semibold);
  min-width: 50px;
  text-align: right;
}

.log-plugin {
  color: var(--theme-text-secondary);
  font-size: var(--font-size-xs);
  min-width: 100px;
  text-align: right;
}

@media (width <= 1200px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (width <= 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .metrics-cards {
    grid-template-columns: 1fr;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }
}
</style>
