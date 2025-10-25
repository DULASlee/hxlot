<template>
  <div class="dashboard-container" :style="containerStyle">
    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         页面头部
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">
        <Monitor class="title-icon" />
        {{ store.realtimeData.productionLineName }} - 实时监控大屏
      </h1>
      <div class="dashboard-status">
        <el-tag :type="isConnected ? 'success' : 'danger'" effect="dark" size="large">
          <template #icon>
            <component :is="isConnected ? CircleCheck : CircleClose" />
          </template>
          {{ isConnected ? '实时连接' : '未连接' }}
        </el-tag>
        <div class="update-time">
          更新时间: {{ lastUpdateTime }}
        </div>
      </div>
    </div>

    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         KPI指标卡片区
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <div class="kpi-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <KPICard
            title="总产量"
            :value="store.realtimeData.totalProduction"
            unit="件"
            :trend="kpiTrends.production"
            :icon="DataAnalysis"
            theme="primary"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <KPICard
            title="生产效率"
            :value="store.realtimeData.currentEfficiency"
            unit="%"
            :trend="kpiTrends.efficiency"
            :icon="TrendCharts"
            :precision="1"
            theme="success"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <KPICard
            title="设备利用率"
            :value="store.realtimeData.equipmentUtilization"
            unit="%"
            :trend="kpiTrends.utilization"
            :icon="Monitor"
            :precision="1"
            theme="warning"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <KPICard
            title="合格率"
            :value="store.realtimeData.qualifiedRate"
            unit="%"
            :trend="kpiTrends.qualified"
            :icon="CircleCheck"
            :precision="1"
            theme="info"
          />
        </el-col>
      </el-row>
    </div>

    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         实时数据曲线图区
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :xs="24" :md="8">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <Temperature class="chart-icon" />
                <span>温度趋势</span>
              </div>
            </template>
            <RealtimeChart
              chartId="temperature-chart"
              :chartData="store.temperatureTrendData"
              xAxisName="时间"
              yAxisName="温度 (°C)"
              color="#ff6b6b"
              title=""
            />
          </el-card>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <Odometer class="chart-icon" />
                <span>压力趋势</span>
              </div>
            </template>
            <RealtimeChart
              chartId="pressure-chart"
              :chartData="store.pressureTrendData"
              xAxisName="时间"
              yAxisName="压力 (MPa)"
              color="#4facfe"
              title=""
            />
          </el-card>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <VideoPlay class="chart-icon" />
                <span>振动趋势</span>
              </div>
            </template>
            <RealtimeChart
              chartId="vibration-chart"
              :chartData="store.vibrationTrendData"
              xAxisName="时间"
              yAxisName="振动 (mm/s)"
              color="#ffd89b"
              title=""
            />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         设备状态列表区
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <div class="equipment-section">
      <el-card shadow="hover">
        <template #header>
          <div class="section-header">
            <OfficeBuilding class="section-icon" />
            <span>设备状态</span>
            <div class="equipment-summary">
              <el-tag type="success" size="small">运行: {{ store.equipmentStatusSummary.running }}</el-tag>
              <el-tag type="info" size="small">停止: {{ store.equipmentStatusSummary.stopped }}</el-tag>
              <el-tag type="danger" size="small">故障: {{ store.equipmentStatusSummary.fault }}</el-tag>
            </div>
          </div>
        </template>
        <el-table
          :data="store.realtimeData.equipmentStatuses"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="equipmentName" label="设备名称" width="200" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag
                :type="getStatusType(row.status)"
                effect="dark"
                size="small"
              >
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="温度 (°C)" width="120">
            <template #default="{ row }">
              <span :class="{'danger-value': row.temperature > 85}">
                {{ row.temperature.toFixed(1) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="压力 (MPa)" width="120">
            <template #default="{ row }">
              <span :class="{'danger-value': row.pressure > 7.5}">
                {{ row.pressure.toFixed(1) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="振动 (mm/s)" width="120">
            <template #default="{ row }">
              <span :class="{'danger-value': row.vibration > 6.0}">
                {{ row.vibration.toFixed(1) }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         告警通知（Dialog）
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <el-dialog
      v-model="alarmDialogVisible"
      :title="`🚨 ${currentAlarm?.Level || ''}级别告警`"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentAlarm" class="alarm-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="告警消息">
            <span class="alarm-message">{{ currentAlarm.Message }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="告警级别">
            <el-tag :type="getAlarmLevelType(currentAlarm.Level)" effect="dark">
              {{ currentAlarm.Level }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getAlarmPriorityType(currentAlarm.Priority)">
              {{ currentAlarm.Priority }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="触发值">
            {{ currentAlarm.TriggerValue }}
          </el-descriptions-item>
          <el-descriptions-item label="阈值">
            {{ currentAlarm.ThresholdValue || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="时间">
            {{ formatDateTime(currentAlarm.Timestamp) }}
          </el-descriptions-item>
        </el-descriptions>
        <el-alert
          v-if="currentAlarm.SuggestedAction"
          type="warning"
          :closable="false"
          style="margin-top: 16px"
        >
          <template #title>
            <strong>💡 建议操作</strong>
          </template>
          {{ currentAlarm.SuggestedAction }}
        </el-alert>
      </div>
      <template #footer>
        <el-button @click="alarmDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleAlarmAction">
          执行建议操作
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import {
  Monitor,
  DataAnalysis,
  TrendCharts,
  CircleCheck,
  CircleClose,
  Warning,
  Odometer,
  VideoPlay,
  OfficeBuilding
} from '@element-plus/icons-vue'
import { useWebSocket } from '@/composables/useWebSocket'
import { useProductionLineRealtimeStore } from '@/stores/productionLineRealtimeStore'
import KPICard from '@/components/dashboard/KPICard.vue'
import RealtimeChart from '@/components/dashboard/RealtimeChart.vue'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const store = useProductionLineRealtimeStore()
const isConnected = ref(false)
const lastUpdateTime = ref('--:--:--')
const alarmDialogVisible = ref(false)
const currentAlarm = ref<any>(null)

// KPI趋势（模拟，实际应从后端计算）
const kpiTrends = ref({
  production: 2.5,
  efficiency: 1.2,
  utilization: -0.8,
  qualified: 0.5
})

// SignalR Hub URL
const SIGNALR_HUB_URL = 'http://localhost:5000/hubs/production-line'
const PRODUCTION_LINE_ID = 'production-line-001'

// WebSocket连接
const { connect, disconnect, on, invoke } = useWebSocket({
  url: SIGNALR_HUB_URL,
  onConnected: () => {
    isConnected.value = true
    subscribeProductionLine()
  },
  onDisconnected: () => {
    isConnected.value = false
  },
  onReconnected: () => {
    subscribeProductionLine()
  }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Computed
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const containerStyle = computed(() => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '20px'
}))

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Methods
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 订阅生产线
 */
const subscribeProductionLine = async () => {
  try {
    await invoke('SubscribeProductionLine', PRODUCTION_LINE_ID)
    console.log(`[Dashboard] ✅ 已订阅生产线: ${PRODUCTION_LINE_ID}`)
  } catch (err) {
    console.error('[Dashboard] ❌ 订阅生产线失败:', err)
  }
}

/**
 * 处理接收到的生产线数据
 */
const handleProductionLineData = (data: any) => {
  console.log('[Dashboard] 收到生产线数据:', data)
  store.updateRealtimeData(data)
  lastUpdateTime.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
}

/**
 * 处理接收到的告警
 */
const handleAlertReceived = (alert: any) => {
  console.log('[Dashboard] 🚨 收到告警:', alert)
  
  // 存储到Store
  store.addAlarm(alert)
  
  // 显示通知
  ElNotification({
    title: `🚨 ${alert.Level}级别告警`,
    message: alert.Message,
    type: getAlarmLevelType(alert.Level) as any,
    duration: 0, // 不自动关闭
    position: 'top-right',
    onClick: () => {
      showAlarmDetail(alert)
    }
  })
  
  // 播放告警音效（可选）
  playAlarmSound(alert.Level)
}

/**
 * 显示告警详情
 */
const showAlarmDetail = (alarm: any) => {
  currentAlarm.value = alarm
  alarmDialogVisible.value = true
}

/**
 * 处理告警建议操作
 */
const handleAlarmAction = () => {
  ElMessage.success('已记录操作指令，正在通知相关人员...')
  alarmDialogVisible.value = false
}

/**
 * 播放告警音效
 */
const playAlarmSound = (level: string) => {
  // 根据告警级别播放不同音效
  // 这里可以集成Web Audio API或使用HTML5 Audio
  console.log(`[Dashboard] 播放${level}级别告警音效`)
}

/**
 * 获取设备状态类型
 */
const getStatusType = (status: string) => {
  const statusMap: Record<string, any> = {
    running: 'success',
    stopped: 'info',
    fault: 'danger',
    maintenance: 'warning'
  }
  return statusMap[status] || 'info'
}

/**
 * 获取设备状态文本
 */
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    running: '运行',
    stopped: '停止',
    fault: '故障',
    maintenance: '维护'
  }
  return textMap[status] || status
}

/**
 * 获取告警级别类型
 */
const getAlarmLevelType = (level: string) => {
  const levelMap: Record<string, string> = {
    Info: 'info',
    Warning: 'warning',
    Error: 'danger',
    Critical: 'danger'
  }
  return levelMap[level] || 'info'
}

/**
 * 获取告警优先级类型
 */
const getAlarmPriorityType = (priority: string) => {
  const priorityMap: Record<string, string> = {
    Low: 'info',
    Medium: 'warning',
    High: 'danger',
    Urgent: 'danger'
  }
  return priorityMap[priority] || 'info'
}

/**
 * 格式化日期时间
 */
const formatDateTime = (dateTime: any) => {
  return new Date(dateTime).toLocaleString('zh-CN', { hour12: false })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 生命周期
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

onMounted(async () => {
  console.log('[Dashboard] 页面已挂载，开始连接SignalR...')
  
  // 连接SignalR
  await connect()
  
  // 监听生产线数据
  on('ReceiveProductionLineData', handleProductionLineData)
  
  // 监听告警
  on('ReceiveAlert', handleAlertReceived)
  
  // 监听连接状态
  on('ReceiveConnectionStatus', (status: string) => {
    console.log('[Dashboard] 连接状态:', status)
  })
  
  // 监听错误
  on('ReceiveError', (error: string) => {
    console.error('[Dashboard] 错误:', error)
    ElMessage.error(`错误: ${error}`)
  })
})

onUnmounted(() => {
  console.log('[Dashboard] 页面卸载，断开连接...')
  disconnect()
  store.reset()
})
</script>

<style scoped lang="scss">
.dashboard-container {
  min-height: 100vh;
  padding: 20px;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 页面头部
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.dashboard-title {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;

  .title-icon {
    font-size: 32px;
    margin-right: 12px;
    color: #667eea;
  }
}

.dashboard-status {
  display: flex;
  align-items: center;
  gap: 16px;
}

.update-time {
  font-size: 14px;
  color: #999;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KPI区域
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.kpi-section {
  margin-bottom: 20px;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 图表区域
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.charts-section {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 12px;
}

.chart-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #333;

  .chart-icon {
    font-size: 20px;
    margin-right: 8px;
    color: #667eea;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 设备区域
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.equipment-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #333;

  .section-icon {
    font-size: 20px;
    margin-right: 8px;
    color: #667eea;
  }
}

.equipment-summary {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.danger-value {
  color: #f56c6c;
  font-weight: 600;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 告警对话框
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.alarm-detail {
  .alarm-message {
    font-weight: 600;
    color: #f56c6c;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 响应式设计
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .dashboard-title {
    font-size: 20px;

    .title-icon {
      font-size: 24px;
    }
  }

  .dashboard-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
