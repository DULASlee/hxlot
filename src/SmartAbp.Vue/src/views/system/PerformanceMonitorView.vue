<template>
  <div class="performance-monitor-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <i class="fas fa-tachometer-alt" />
        {{ $t('menu.performanceMonitor') }}
      </h1>
      <p class="page-description">
        实时监控系统性能指标，分析Core Web Vitals和路由性能
      </p>
    </div>

    <!-- 性能评级卡片 -->
    <el-card
      class="rating-card"
      shadow="hover"
    >
      <template #header>
        <div class="card-header">
          <i class="fas fa-star" />
          <span>整体性能评级</span>
        </div>
      </template>
      
      <div class="rating-content">
        <div
          class="rating-badge"
          :class="`rating-${coreWebVitals.rating}`"
        >
          <div class="rating-icon">
            <i
              v-if="coreWebVitals.rating === 'good'"
              class="fas fa-check-circle"
            />
            <i
              v-else-if="coreWebVitals.rating === 'needs-improvement'"
              class="fas fa-exclamation-triangle"
            />
            <i
              v-else
              class="fas fa-times-circle"
            />
          </div>
          <div class="rating-text">
            <span class="rating-label">{{ getRatingText(coreWebVitals.rating) }}</span>
            <span class="rating-desc">{{ getRatingDescription(coreWebVitals.rating) }}</span>
          </div>
        </div>

        <div class="quick-stats">
          <div class="stat-item">
            <i class="fas fa-rocket" />
            <span class="stat-value">{{ metrics.firstContentfulPaint?.toFixed(0) || '-' }}</span>
            <span class="stat-label">FCP (ms)</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-image" />
            <span class="stat-value">{{ metrics.largestContentfulPaint?.toFixed(0) || '-' }}</span>
            <span class="stat-label">LCP (ms)</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-hand-pointer" />
            <span class="stat-value">{{ metrics.firstInputDelay?.toFixed(0) || '-' }}</span>
            <span class="stat-label">FID (ms)</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-th" />
            <span class="stat-value">{{ metrics.cumulativeLayoutShift?.toFixed(3) || '-' }}</span>
            <span class="stat-label">CLS</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 标签页 -->
    <el-tabs
      v-model="activeTab"
      class="monitor-tabs"
    >
      <!-- Core Web Vitals详情 -->
      <el-tab-pane
        label="Core Web Vitals"
        name="cwv"
      >
        <CoreWebVitalsPanel
          :metrics="metrics"
          :cwv="coreWebVitals"
        />
      </el-tab-pane>

      <!-- 导航时间分析 -->
      <el-tab-pane
        label="导航时间"
        name="navigation"
      >
        <NavigationTimingPanel :metrics="metrics" />
      </el-tab-pane>

      <!-- 路由性能分析 -->
      <el-tab-pane
        label="路由性能"
        name="route"
      >
        <RoutePerformancePanel 
          :performances="routePerformances" 
          :average="averageRouteDuration" 
        />
      </el-tab-pane>

      <!-- 实时监控 -->
      <el-tab-pane
        label="实时监控"
        name="realtime"
      >
        <RealTimeMonitorPanel />
      </el-tab-pane>
    </el-tabs>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <el-button
        type="primary"
        :loading="refreshing"
        @click="refreshMetrics"
      >
        <i class="fas fa-sync-alt" />
        刷新数据
      </el-button>
      <el-button @click="exportReport">
        <i class="fas fa-download" />
        导出报告
      </el-button>
      <el-button @click="clearHistory">
        <i class="fas fa-trash" />
        清空历史
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { performanceMonitor } from '@/utils/performance/monitor'
import CoreWebVitalsPanel from './performance/CoreWebVitalsPanel.vue'
import NavigationTimingPanel from './performance/NavigationTimingPanel.vue'
import RoutePerformancePanel from './performance/RoutePerformancePanel.vue'
import RealTimeMonitorPanel from './performance/RealTimeMonitorPanel.vue'

// 响应式数据
const activeTab = ref('cwv')
const refreshing = ref(false)
const metrics = ref(performanceMonitor.getMetrics())
const coreWebVitals = ref(performanceMonitor.getCoreWebVitals())
const routePerformances = ref(performanceMonitor.getRoutePerformances())
const averageRouteDuration = ref(performanceMonitor.getAverageRouteDuration())

// 定时刷新
let refreshInterval: number | null = null

// 刷新数据
const refreshMetrics = () => {
  refreshing.value = true
  
  setTimeout(() => {
    metrics.value = performanceMonitor.getMetrics()
    coreWebVitals.value = performanceMonitor.getCoreWebVitals()
    routePerformances.value = performanceMonitor.getRoutePerformances()
    averageRouteDuration.value = performanceMonitor.getAverageRouteDuration()
    
    refreshing.value = false
    ElMessage.success('性能数据已刷新')
  }, 500)
}

// 获取评级文本
const getRatingText = (rating: string) => {
  const map: Record<string, string> = {
    'good': '优秀',
    'needs-improvement': '需要改进',
    'poor': '较差'
  }
  return map[rating] || '未知'
}

// 获取评级描述
const getRatingDescription = (rating: string) => {
  const map: Record<string, string> = {
    'good': '性能表现优异，用户体验极佳',
    'needs-improvement': '性能有待优化，建议改进',
    'poor': '性能较差，严重影响用户体验'
  }
  return map[rating] || ''
}

// 导出报告
const exportReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    metrics: metrics.value,
    coreWebVitals: coreWebVitals.value,
    routePerformances: routePerformances.value,
    averageRouteDuration: averageRouteDuration.value
  }

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-report-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('性能报告已导出')
}

// 清空历史
const clearHistory = () => {
  routePerformances.value = []
  ElMessage.success('历史记录已清空')
}

// 生命周期
onMounted(() => {
  // 每5秒自动刷新数据
  refreshInterval = window.setInterval(() => {
    refreshMetrics()
  }, 5000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped lang="scss">
.performance-monitor-view {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 120px);

  .page-header {
    margin-bottom: 24px;

    h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 28px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;

      i {
        color: #409EFF;
      }
    }

    .page-description {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }

  .rating-card {
    margin-bottom: 24px;

    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 500;

      i {
        color: #E6A23C;
      }
    }

    .rating-content {
      .rating-badge {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 24px;

        &.rating-good {
          background: linear-gradient(135deg, #67C23A 0%, #85CE61 100%);
          color: white;
        }

        &.rating-needs-improvement {
          background: linear-gradient(135deg, #E6A23C 0%, #EEBE77 100%);
          color: white;
        }

        &.rating-poor {
          background: linear-gradient(135deg, #F56C6C 0%, #F78989 100%);
          color: white;
        }

        .rating-icon {
          font-size: 48px;
          opacity: 0.9;
        }

        .rating-text {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .rating-label {
            font-size: 24px;
            font-weight: 600;
          }

          .rating-desc {
            font-size: 14px;
            opacity: 0.9;
          }
        }
      }

      .quick-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          background: #f5f7fa;
          border-radius: 8px;
          transition: all 0.3s;

          &:hover {
            background: #ecf5ff;
            transform: translateY(-2px);
          }

          i {
            font-size: 32px;
            color: #409EFF;
            margin-bottom: 12px;
          }

          .stat-value {
            font-size: 28px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 12px;
            color: #909399;
            text-transform: uppercase;
          }
        }
      }
    }
  }

  .monitor-tabs {
    background: white;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;
  }

  .action-bar {
    display: flex;
    gap: 12px;
    justify-content: flex-end;

    .el-button {
      i {
        margin-right: 4px;
      }
    }
  }
}
</style>
