<template>
  <div class="log-dashboard">
    <!-- 仪表板头部 -->
    <div class="dashboard-header">
      <div class="header-left">
        <h2>日志仪表板</h2>
        <el-text type="info" size="small">
          实时监控系统日志和性能指标
        </el-text>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button
            :type="autoRefresh ? 'primary' : 'default'"
            @click="toggleAutoRefresh"
          >
            <el-icon><Timer /></el-icon>
            {{ autoRefresh ? '停止自动刷新' : '开启自动刷新' }}
          </el-button>
          <el-button @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button @click="showExportDialog = true">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon error">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.errorCount }}</div>
            <div class="stat-label">错误</div>
          </div>
        </div>
        <div class="stat-trend" :class="{ increase: stats.errorTrend > 0 }">
          <el-icon><TrendCharts /></el-icon>
          {{ stats.errorTrend > 0 ? '+' : '' }}{{ stats.errorTrend }}%
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon warning">
            <el-icon><WarningFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.warningCount }}</div>
            <div class="stat-label">警告</div>
          </div>
        </div>
        <div class="stat-trend" :class="{ increase: stats.warningTrend > 0 }">
          <el-icon><TrendCharts /></el-icon>
          {{ stats.warningTrend > 0 ? '+' : '' }}{{ stats.warningTrend }}%
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon performance">
            <el-icon><Odometer /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.avgResponseTime }}ms</div>
            <div class="stat-label">平均响应时间</div>
          </div>
        </div>
        <div class="stat-trend" :class="{ increase: stats.performanceTrend > 0 }">
          <el-icon><TrendCharts /></el-icon>
          {{ stats.performanceTrend > 0 ? '+' : '' }}{{ stats.performanceTrend }}%
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon health">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.healthScore }}/100</div>
            <div class="stat-label">健康评分</div>
          </div>
        </div>
        <div class="stat-trend" :class="{ increase: stats.healthTrend > 0 }">
          <el-icon><TrendCharts /></el-icon>
          {{ stats.healthTrend > 0 ? '+' : '' }}{{ stats.healthTrend }}%
        </div>
      </el-card>
    </div>

    <!-- 主要内容区域 -->
    <div class="dashboard-content">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <!-- 日志级别分布图表 -->
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>日志级别分布</span>
              <el-select v-model="chartTimeRange" size="small" @change="updateCharts">
                <el-option label="最近1小时" value="1h" />
                <el-option label="最近24小时" value="24h" />
                <el-option label="最近7天" value="7d" />
              </el-select>
            </div>
          </template>
          <div ref="levelChartRef" class="chart-container"></div>
        </el-card>

        <!-- 时间趋势图表 -->
        <el-card class="chart-card" shadow="never">
          <template #header>
            <span>日志时间趋势</span>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <!-- 搜索和过滤 -->
        <LogSearchFilter
          :logs="allLogs"
          @filtered="handleLogsFiltered"
          @searchChanged="handleSearchChanged"
        />

        <!-- 日志查看器 -->
        <el-card class="log-viewer-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>日志记录 ({{ filteredLogs.length }})</span>
              <div class="header-actions">
                <el-button-group size="small">
                  <el-button
                    :type="viewMode === 'table' ? 'primary' : 'default'"
                    @click="viewMode = 'table'"
                  >
                    <el-icon><Grid /></el-icon>
                    表格
                  </el-button>
                  <el-button
                    :type="viewMode === 'list' ? 'primary' : 'default'"
                    @click="viewMode = 'list'"
                  >
                    <el-icon><List /></el-icon>
                    列表
                  </el-button>
                </el-button-group>
                <el-button size="small" @click="clearAllLogs">
                  <el-icon><Delete /></el-icon>
                  清空
                </el-button>
              </div>
            </div>
          </template>

          <LogViewer
            :logs="filteredLogs"
            :view-mode="viewMode"
            :max-height="400"
            show-search
            show-export
          />
        </el-card>

        <!-- 热点问题 -->
        <el-card class="hotspots-card" shadow="never">
          <template #header>
            <span>热点问题</span>
          </template>
          <div class="hotspots-list">
            <div
              v-for="hotspot in hotspots"
              :key="hotspot.message"
              class="hotspot-item"
              :class="hotspot.type"
            >
              <div class="hotspot-info">
                <div class="hotspot-message">{{ hotspot.message }}</div>
                <div class="hotspot-count">出现 {{ hotspot.count }} 次</div>
              </div>
              <el-tag
                :type="hotspot.type === 'error' ? 'danger' : 'warning'"
                size="small"
              >
                {{ hotspot.type === 'error' ? '错误' : '警告' }}
              </el-tag>
            </div>
            <el-empty v-if="hotspots.length === 0" description="暂无热点问题" />
          </div>
        </el-card>
      </div>
    </div>

    <!-- 导出对话框 -->
    <el-dialog
      v-model="showExportDialog"
      title="导出日志"
      width="600px"
      @close="resetExportForm"
    >
      <el-form :model="exportForm" label-width="120px">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportForm.format">
            <el-radio :label="ExportFormat.JSON">JSON</el-radio>
            <el-radio :label="ExportFormat.CSV">CSV</el-radio>
            <el-radio :label="ExportFormat.HTML">HTML</el-radio>
            <el-radio :label="ExportFormat.TXT">TXT</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="包含内容">
          <el-checkbox-group v-model="exportForm.includes">
            <el-checkbox label="analysis">分析报告</el-checkbox>
            <el-checkbox label="performance">性能数据</el-checkbox>
            <el-checkbox label="errors">错误报告</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="时间范围">
          <el-date-picker
            v-model="exportForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="最大条目数">
          <el-input-number
            v-model="exportForm.maxEntries"
            :min="1"
            :max="10000"
            placeholder="不限制"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showExportDialog = false">取消</el-button>
        <el-button type="primary" @click="handleExport">导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Timer,
  Refresh,
  Download,
  Warning,
  WarningFilled,
  Odometer,
  CircleCheck,
  TrendCharts,
  Grid,
  List,
  Delete
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { logger, LogLevel, type LogEntry } from '@/utils/logger'
import { logAnalyzer, analyzeCurrentLogs } from '@/utils/logAnalyzer'
import { logExporter, ExportFormat, type ExportConfig } from '@/utils/logExporter'
import { logManager } from '@/utils/logManager'
import LogSearchFilter from './LogSearchFilter.vue'
import LogViewer from '@/components/LogViewer.vue'
import dayjs from 'dayjs'

// 响应式数据
const autoRefresh = ref(false)
const refreshInterval = ref<number | null>(null)
const chartTimeRange = ref('24h')
const viewMode = ref<'table' | 'list'>('table')
const showExportDialog = ref(false)
const allLogs = ref<LogEntry[]>([])
const filteredLogs = ref<LogEntry[]>([])

// 图表引用
const levelChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()
let levelChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null

// 导出表单
const exportForm = ref({
  format: ExportFormat.HTML,
  includes: ['analysis'],
  timeRange: null as [string, string] | null,
  maxEntries: 1000
})

// 统计数据
const stats = ref({
  errorCount: 0,
  warningCount: 0,
  avgResponseTime: 0,
  healthScore: 100,
  errorTrend: 0,
  warningTrend: 0,
  performanceTrend: 0,
  healthTrend: 0
})

// 计算属性
const hotspots = computed(() => {
  analyzeCurrentLogs()
  return logAnalyzer.getHotspots(filteredLogs.value).slice(0, 5)
})

// 方法
const loadData = () => {
  allLogs.value = logger.getLogs()
  updateStats()
  updateCharts()
}

const updateStats = () => {
  const analysis = analyzeCurrentLogs()
  const performanceStats = logManager.getPerformanceStats()

  stats.value = {
    errorCount: analysis.summary.levelDistribution[LogLevel.ERROR],
    warningCount: analysis.summary.levelDistribution[LogLevel.WARN],
    avgResponseTime: Math.round(performanceStats.average || 0),
    healthScore: analysis.insights.healthScore,
    errorTrend: Math.floor(Math.random() * 20 - 10), // 模拟趋势数据
    warningTrend: Math.floor(Math.random() * 20 - 10),
    performanceTrend: Math.floor(Math.random() * 20 - 10),
    healthTrend: Math.floor(Math.random() * 10 - 5)
  }
}

const updateCharts = async () => {
  await nextTick()
  updateLevelChart()
  updateTrendChart()
}

const updateLevelChart = () => {
  if (!levelChartRef.value) return

  if (!levelChart) {
    levelChart = echarts.init(levelChartRef.value)
  }

  const analysis = analyzeCurrentLogs()
  const levelData = [
    { name: '调试', value: analysis.summary.levelDistribution[LogLevel.DEBUG], color: '#909399' },
    { name: '信息', value: analysis.summary.levelDistribution[LogLevel.INFO], color: '#409EFF' },
    { name: '成功', value: analysis.summary.levelDistribution[LogLevel.SUCCESS], color: '#67C23A' },
    { name: '警告', value: analysis.summary.levelDistribution[LogLevel.WARN], color: '#E6A23C' },
    { name: '错误', value: analysis.summary.levelDistribution[LogLevel.ERROR], color: '#F56C6C' }
  ].filter(item => item.value > 0)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '日志级别',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: levelData.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color }
        }))
      }
    ]
  }

  levelChart.setOption(option)
}

const updateTrendChart = () => {
  if (!trendChartRef.value) return

  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }

  const analysis = analyzeCurrentLogs()
  const trendData = analysis.trends.errorTrends.slice(-24) // 最近24小时

  const times = trendData.map(item => dayjs(item.time).format('HH:mm'))
  const values = trendData.map(item => item.count)

  const option = {
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
      data: times,
      axisLabel: {
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10
      }
    },
    series: [
      {
        name: '错误数量',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 2
        },
        areaStyle: {
          opacity: 0.3
        },
        itemStyle: {
          color: '#F56C6C'
        },
        data: values
      }
    ]
  }

  trendChart.setOption(option)
}

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value

  if (autoRefresh.value) {
    refreshInterval.value = window.setInterval(() => {
      loadData()
    }, 30000) // 30秒刷新一次
    ElMessage.success('已开启自动刷新')
  } else {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
    ElMessage.info('已停止自动刷新')
  }
}

const refreshData = () => {
  loadData()
  ElMessage.success('数据已刷新')
}

const handleLogsFiltered = (logs: LogEntry[]) => {
  filteredLogs.value = logs
}

const handleSearchChanged = () => {
  // 搜索变化处理
}

const clearAllLogs = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有日志吗？此操作不可恢复。', '确认清空', {
      confirmButtonText: '清空',
      cancelButtonText: '取消',
      type: 'warning'
    })

    logger.clear()
    logManager.cleanup()
    loadData()
    ElMessage.success('日志已清空')
  } catch {
    // 用户取消
  }
}

const handleExport = () => {
  const config: ExportConfig = {
    format: exportForm.value.format,
    includeAnalysis: exportForm.value.includes.includes('analysis'),
    includePerformance: exportForm.value.includes.includes('performance'),
    includeErrors: exportForm.value.includes.includes('errors'),
    timeRange: exportForm.value.timeRange ? {
      start: new Date(exportForm.value.timeRange[0]),
      end: new Date(exportForm.value.timeRange[1])
    } : undefined,
    maxEntries: exportForm.value.maxEntries
  }

  logExporter.downloadLogs(config)
  showExportDialog.value = false
  ElMessage.success('导出成功')
}

const resetExportForm = () => {
  exportForm.value = {
    format: ExportFormat.HTML,
    includes: ['analysis'],
    timeRange: null,
    maxEntries: 1000
  }
}

// 生命周期
onMounted(() => {
  loadData()

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    levelChart?.resize()
    trendChart?.resize()
  })
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }

  levelChart?.dispose()
  trendChart?.dispose()

  window.removeEventListener('resize', () => {
    levelChart?.resize()
    trendChart?.resize()
  })
})
</script>

<style scoped>
.log-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left h2 {
  margin: 0 0 5px 0;
  color: #303133;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.error {
  background: linear-gradient(135deg, #f56c6c, #f78989);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
}

.stat-icon.performance {
  background: linear-gradient(135deg, #409eff, #66b1ff);
}

.stat-icon.health {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.stat-trend {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 12px;
  color: #67c23a;
  display: flex;
  align-items: center;
  gap: 2px;
}

.stat-trend.increase {
  color: #f56c6c;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-card,
.log-viewer-card,
.hotspots-card {
  background: white;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.hotspots-list {
  max-height: 300px;
  overflow-y: auto;
}

.hotspot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.hotspot-item:last-child {
  border-bottom: none;
}

.hotspot-info {
  flex: 1;
}

.hotspot-message {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.hotspot-count {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 1200px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .log-dashboard {
    padding: 10px;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .stats-cards {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .stat-value {
    font-size: 24px;
  }

  .chart-container {
    height: 250px;
  }
}
</style>
