<template>
  <div class="performance-dashboard">
    <div class="dashboard-header">
      <h2>⚡ 性能监控Dashboard</h2>
      <div class="header-actions">
        <button
          :disabled="isRefreshing"
          @click="refresh"
        >
          {{ isRefreshing ? '刷新中...' : '刷新数据' }}
        </button>
        <button @click="clearData">
          清除数据
        </button>
        <button @click="exportData">
          导出数据
        </button>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- 关键指标卡片 -->
      <div class="metric-card">
        <div class="card-icon">
          📊
        </div>
        <div class="card-content">
          <div class="card-label">
            总加载次数
          </div>
          <div class="card-value">
            {{ report?.totalLoads || 0 }}
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="card-icon">
          ⚡
        </div>
        <div class="card-content">
          <div class="card-label">
            缓存命中率
          </div>
          <div class="card-value">
            {{ formatPercent(report?.cacheHitRate || 0) }}
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="card-icon">
          ⏱️
        </div>
        <div class="card-content">
          <div class="card-label">
            平均加载时间
          </div>
          <div class="card-value">
            {{ formatMs(report?.avgLoadTime || 0) }}
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="card-icon">
          🎯
        </div>
        <div class="card-content">
          <div class="card-label">
            P95加载时间
          </div>
          <div class="card-value">
            {{ formatMs(report?.p95LoadTime || 0) }}
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="card-icon">
          ❌
        </div>
        <div class="card-content">
          <div class="card-label">
            错误率
          </div>
          <div
            class="card-value"
            :class="{ 'error-high': (report?.errorRate || 0) > 0.05 }"
          >
            {{ formatPercent(report?.errorRate || 0) }}
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="card-icon">
          🔮
        </div>
        <div class="card-content">
          <div class="card-label">
            预加载命中率
          </div>
          <div class="card-value">
            {{ formatPercent(report?.preloadEffectiveness?.hitRate || 0) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 内存趋势图 -->
    <div class="chart-section">
      <h3>📈 内存使用趋势</h3>
      <div class="memory-chart">
        <canvas ref="memoryChartCanvas" />
      </div>
    </div>

    <!-- Top 10 慢加载组件 -->
    <div class="table-section">
      <h3>🐌 Top 10 慢加载组件</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>组件名称</th>
            <th>平均加载时间</th>
            <th>加载次数</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(comp, index) in report?.slowestComponents || []"
            :key="comp.name"
          >
            <td>{{ index + 1 }}</td>
            <td>
              <code>{{ comp.name }}</code>
            </td>
            <td>
              <span
                class="load-time"
                :class="getLoadTimeClass(comp.avgLoadTime)"
              >
                {{ formatMs(comp.avgLoadTime) }}
              </span>
            </td>
            <td>{{ comp.loadCount }}</td>
            <td>
              <span
                class="status-badge"
                :class="getStatusClass(comp.avgLoadTime)"
              >
                {{ getStatusText(comp.avgLoadTime) }}
              </span>
            </td>
          </tr>
          <tr v-if="!report?.slowestComponents?.length">
            <td
              colspan="5"
              class="empty-message"
            >
              暂无数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Top 10 热门组件 -->
    <div class="table-section">
      <h3>🔥 Top 10 热门组件</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>组件名称</th>
            <th>总访问次数</th>
            <th>缓存命中</th>
            <th>命中率</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(comp, index) in report?.hottestComponents || []"
            :key="comp.name"
          >
            <td>{{ index + 1 }}</td>
            <td>
              <code>{{ comp.name }}</code>
            </td>
            <td>{{ comp.loadCount }}</td>
            <td>{{ comp.cacheHits }}</td>
            <td>
              <span class="hit-rate">
                {{ formatPercent(comp.cacheHits / comp.loadCount) }}
              </span>
            </td>
          </tr>
          <tr v-if="!report?.hottestComponents?.length">
            <td
              colspan="5"
              class="empty-message"
            >
              暂无数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 预加载效果 -->
    <div class="preload-section">
      <h3>🔮 预加载效果分析</h3>
      <div class="preload-stats">
        <div class="preload-item">
          <span class="label">预加载次数:</span>
          <span class="value">{{ report?.preloadEffectiveness?.preloadCount || 0 }}</span>
        </div>
        <div class="preload-item">
          <span class="label">实际命中:</span>
          <span class="value">{{ report?.preloadEffectiveness?.preloadHitCount || 0 }}</span>
        </div>
        <div class="preload-item">
          <span class="label">命中率:</span>
          <span class="value highlight">
            {{ formatPercent(report?.preloadEffectiveness?.hitRate || 0) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { globalPerformanceMonitor, type PerformanceReport } from './PerformanceMonitor'

// 状态
const report = ref<PerformanceReport | null>(null)
const isRefreshing = ref(false)
const memoryChartCanvas = ref<HTMLCanvasElement>()
let refreshTimer: ReturnType<typeof setInterval> | null = null
let chartContext: CanvasRenderingContext2D | null = null

// 刷新数据
const refresh = async () => {
  isRefreshing.value = true
  
  try {
    report.value = globalPerformanceMonitor.generateReport(60)
    await nextTick()
    drawMemoryChart()
  } finally {
    isRefreshing.value = false
  }
}

// 清除数据
const clearData = () => {
  if (confirm('确定要清除所有性能数据吗？')) {
    globalPerformanceMonitor.clear()
    report.value = null
  }
}

// 导出数据
const exportData = () => {
  const data = globalPerformanceMonitor.export()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-data-${new Date().toISOString()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 绘制内存趋势图
const drawMemoryChart = () => {
  if (!memoryChartCanvas.value || !report.value?.memoryTrend) {
    return
  }

  const canvas = memoryChartCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  chartContext = ctx

  // 设置画布尺寸
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  const width = rect.width
  const height = rect.height
  const padding = 40

  // 清空画布
  ctx.clearRect(0, 0, width, height)

  const trend = report.value.memoryTrend
  if (trend.length === 0) return

  // 计算范围
  const maxMemory = Math.max(...trend.map(t => t.used))
  const minMemory = Math.min(...trend.map(t => t.used))
  const memoryRange = maxMemory - minMemory || 1

  // 绘制网格线
  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 1
  for (let i = 0; i <= 5; i++) {
    const y = padding + (height - 2 * padding) * (i / 5)
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()

    // Y轴标签
    const value = maxMemory - (memoryRange * i / 5)
    const mb = (value / 1024 / 1024).toFixed(1)
    ctx.fillStyle = '#666'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`${mb}MB`, padding - 5, y + 4)
  }

  // 绘制趋势线
  ctx.strokeStyle = '#4CAF50'
  ctx.lineWidth = 2
  ctx.beginPath()

  trend.forEach((point, index) => {
    const x = padding + (width - 2 * padding) * (index / (trend.length - 1))
    const y = padding + (height - 2 * padding) * (1 - (point.used - minMemory) / memoryRange)

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()

  // 绘制数据点
  trend.forEach((point, index) => {
    const x = padding + (width - 2 * padding) * (index / (trend.length - 1))
    const y = padding + (height - 2 * padding) * (1 - (point.used - minMemory) / memoryRange)

    ctx.fillStyle = '#4CAF50'
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
  })

  // X轴标签
  ctx.fillStyle = '#666'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  const now = Date.now()
  for (let i = 0; i <= 5; i++) {
    const x = padding + (width - 2 * padding) * (i / 5)
    const secondsAgo = ((5 - i) / 5) * 60
    ctx.fillText(`-${secondsAgo.toFixed(0)}s`, x, height - 10)
  }
}

// 格式化函数
const formatPercent = (value: number) => {
  return `${(value * 100).toFixed(1)}%`
}

const formatMs = (value: number) => {
  return `${value.toFixed(1)}ms`
}

const getLoadTimeClass = (time: number) => {
  if (time < 100) return 'fast'
  if (time < 500) return 'medium'
  return 'slow'
}

const getStatusClass = (time: number) => {
  if (time < 100) return 'success'
  if (time < 500) return 'warning'
  return 'danger'
}

const getStatusText = (time: number) => {
  if (time < 100) return '优秀'
  if (time < 500) return '良好'
  return '需优化'
}

// 生命周期
onMounted(() => {
  refresh()
  
  // 每5秒自动刷新
  refreshTimer = setInterval(refresh, 5000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.performance-dashboard {
  padding: 1.5rem;
  background: #f5f5f5;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h2 {
  font-size: 1.75rem;
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.header-actions button {
  padding: 0.5rem 1rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.header-actions button:hover:not(:disabled) {
  background: #f0f0f0;
}

.header-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: #fff;
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 2rem;
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 0.75rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.error-high {
  color: #e74c3c;
}

.chart-section,
.table-section,
.preload-section {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-section h3,
.table-section h3,
.preload-section h3 {
  font-size: 1.25rem;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.memory-chart {
  height: 200px;
  position: relative;
}

.memory-chart canvas {
  width: 100%;
  height: 100%;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f8f9fa;
}

.data-table th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.875rem;
  border-bottom: 2px solid #e0e0e0;
}

.data-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.875rem;
}

.data-table code {
  background: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 0.8rem;
}

.load-time {
  font-weight: 600;
}

.load-time.fast {
  color: #27ae60;
}

.load-time.medium {
  color: #f39c12;
}

.load-time.slow {
  color: #e74c3c;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.success {
  background: #d4edda;
  color: #155724;
}

.status-badge.warning {
  background: #fff3cd;
  color: #856404;
}

.status-badge.danger {
  background: #f8d7da;
  color: #721c24;
}

.hit-rate {
  font-weight: 600;
  color: #3498db;
}

.empty-message {
  text-align: center;
  color: #95a5a6;
  padding: 2rem !important;
}

.preload-stats {
  display: flex;
  gap: 2rem;
}

.preload-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preload-item .label {
  font-size: 0.875rem;
  color: #7f8c8d;
}

.preload-item .value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.preload-item .value.highlight {
  color: #3498db;
}
</style>

