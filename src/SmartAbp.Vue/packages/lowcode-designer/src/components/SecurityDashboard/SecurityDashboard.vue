<template>
  <div class="security-dashboard" role="main" aria-label="Security Analysis Dashboard">
    <!-- Security Overview Section -->
    <el-row class="security-overview" :gutter="20">
      <el-col :span="6" v-for="(metric, index) in metricCards" :key="index">
        <SecurityMetricCard
          :data-testid="metric.testId"
          :title="metric.title"
          :value="metric.value"
          :trend="metric.trend"
          :icon="metric.icon"
          :color="metric.color"
        />
      </el-col>
    </el-row>

    <!-- Risk Alerts Card -->
    <el-row class="alerts-row" :gutter="20">
      <el-col :span="12">
        <el-card class="risk-alerts-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><Warning /></el-icon>
              <span>实时风险警报</span>
              <el-badge :value="activeAlerts.length" class="alert-badge" type="danger" />
            </div>
          </template>
          <div class="alerts-list">
            <div
              v-for="alert in activeAlerts"
              :key="alert.id"
              class="alert-item"
              :class="`alert-${(alert.severity || 'info').toLowerCase()}`"
              tabindex="0"
              role="button"
              @click="handleAlertClick(alert)"
              @keydown.enter="handleAlertClick(alert)"
            >
              <div class="alert-content">
                <el-tag :type="getSeverityType(alert.severity || 'info')" size="small">
                  {{ alert.severity }}
                </el-tag>
                <span class="alert-description">{{ alert.description || alert.message }}</span>
                <span class="alert-time">{{ formatTime(alert.timestamp) }}</span>
              </div>
              <div class="alert-actions">
                <el-button size="small" type="primary" @click.stop="acknowledgeAlert(alert)">
                  确认
                </el-button>
                <el-button size="small" @click.stop="investigateAlert(alert)">
                  调查
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="compliance-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><DocumentChecked /></el-icon>
              <span>合规状态监控</span>
            </div>
          </template>
          <ComplianceStatusMonitor
            :compliance-data="complianceIssues"
            @compliance-issue="handleComplianceIssue"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts Section -->
    <el-row class="charts-row" :gutter="20">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>权限访问趋势</span>
          </template>
          <PermissionAccessTrendChart :data="[...permissionTrendData]" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>风险等级分布</span>
          </template>
          <RiskLevelDistributionChart :data="[...riskDistributionData]" />
        </el-card>
      </el-col>
    </el-row>

    <!-- User Behavior Analysis -->
    <el-card class="behavior-card" shadow="never">
      <template #header>
        <span>异常用户行为分析</span>
      </template>
      <AbnormalUserBehaviorTable
        :data="[...abnormalBehaviors]"
        @user-click="handleUserClick"
        @behavior-click="handleBehaviorClick"
      />
    </el-card>

    <!-- Accessibility: Screen reader announcements -->
    <div class="sr-only" aria-live="polite" v-if="newAlerts.length > 0">
      {{ newAlerts.length }} 个新警报已更新
    </div>

    <!-- Error State -->
        <div v-if="error" class="dashboard-error">
          <el-alert
            title="数据加载失败"
            :description="typeof error === 'string' ? error : (error?.message || '未知错误')"
            type="error"
            show-icon
            :closable="false"
          />
        </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { ElRow, ElCol, ElCard, ElButton, ElBadge, ElTag, ElIcon, ElAlert } from 'element-plus'
import { Warning, DocumentChecked } from '@element-plus/icons-vue'
import { useSecurityDashboard } from '@smartabp/lowcode-core'
import { useRealTimeAlerts } from '@smartabp/lowcode-core'
// 🛡️ 架构整洁铁律：已移除对主应用的依赖，遵循packages黑盒原则
import SecurityMetricCard from './SecurityMetricCard.vue'
import PermissionAccessTrendChart from './PermissionAccessTrendChart.vue'
import RiskLevelDistributionChart from './RiskLevelDistributionChart.vue'
import AbnormalUserBehaviorTable from './AbnormalUserBehaviorTable.vue'
import ComplianceStatusMonitor from './ComplianceStatusMonitor.vue'

const {
  securityMetrics,
  permissionTrendData,
  riskDistributionData,
  abnormalBehaviors,
  complianceData,
  loadDashboardData,
  refreshMetrics,
  error
} = useSecurityDashboard()

// 🔧 类型适配器：将ComplianceData转换为ComplianceIssue
const complianceIssues = computed(() => {
  return complianceData.value.map((data, index) => ({
    id: `compliance-${index}`,
    type: data.framework,
    severity: data.status === 'non-compliant' ? 'high' : 'low',
    description: `${data.framework} 合规检查：${data.status === 'compliant' ? '符合' : data.status === 'non-compliant' ? '不符合' : '检查中'}`,
    affectedUsers: Math.floor(Math.random() * 100), // 模拟数据
    detectedAt: data.lastCheck,
    status: data.status
  }))
})

const {
  activeAlerts,
  connectAlertStream,
  disconnectAlertStream,
  acknowledgeAlert: _acknowledgeAlert,
  investigateAlert: _investigateAlert
} = useRealTimeAlerts()

// const { isMobile, isTablet, isDesktop } = useBreakpoints()

// Computed properties for metrics display
const metricCards = computed(() => [
  {
    testId: 'risk-events-card',
    title: '今日风险事件',
    value: securityMetrics.value?.todayRiskEvents || 0,
    trend: securityMetrics.value?.riskEventsTrend || 0,
    icon: 'warning',
    color: 'danger'
  },
  {
    testId: 'permission-changes-card',
    title: '权限变更',
    value: securityMetrics.value?.permissionChanges || 0,
    trend: securityMetrics.value?.permissionChangesTrend || 0,
    icon: 'setting',
    color: 'warning'
  },
  {
    testId: 'abnormal-logins-card',
    title: '异常登录',
    value: securityMetrics.value?.abnormalLogins || 0,
    trend: securityMetrics.value?.abnormalLoginsTrend || 0,
    icon: 'user',
    color: 'info'
  },
  {
    testId: 'compliance-score-card',
    title: '合规分数',
    value: `${securityMetrics.value?.complianceScore || 0}%`,
    trend: securityMetrics.value?.complianceScoreTrend || 0,
    icon: 'check-circle',
    color: 'success'
  }
])

// Auto-refresh timer
let refreshTimer: NodeJS.Timeout | null = null

// New alerts for screen reader announcements
const newAlerts = ref([])

// Methods
const formatTime = (timestamp: number | Date) => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}

const getSeverityType = (severity: string): 'success' | 'warning' | 'danger' | 'info' => {
  const types: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    'Low': 'info',
    'Medium': 'warning',
    'High': 'danger',
    'Critical': 'danger'
  }
  return types[severity] || 'info'
}

const handleAlertClick = (alert: any) => {
  investigateAlert(alert.id)
}

const handleUserClick = (userId: string) => {
  // Navigate to user details
  console.log('Navigate to user:', userId)
}

const handleBehaviorClick = (behavior: any) => {
  // Show behavior details
  console.log('Show behavior details:', behavior)
}

const handleComplianceIssue = (issue: any) => {
  // Handle compliance issue
  console.log('Handle compliance issue:', issue)
}

const acknowledgeAlert = (alert: any) => {
  // Acknowledge the alert
  console.log('Acknowledge alert:', alert)
}

const investigateAlert = (alert: any) => {
  // Investigate the alert
  console.log('Investigate alert:', alert)
}

// Lifecycle
onMounted(async () => {
  await loadDashboardData()
  connectAlertStream()

  // Set up auto-refresh every 30 seconds
  refreshTimer = setInterval(() => {
    refreshMetrics()
  }, 30000)
})

onUnmounted(() => {
  disconnectAlertStream()
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})

// Watch for new alerts
watch(activeAlerts, (newAlerts, oldAlerts) => {
  if (newAlerts && oldAlerts && newAlerts.length > oldAlerts.length) {
    // New alerts arrived
    // const diff = newAlerts.length - oldAlerts.length
    // Add new alerts to announcement array
    // This would trigger screen reader announcement
  }
}, { deep: true })
</script>

<style scoped lang="scss">
.security-dashboard {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;

  &.mobile-layout {
    padding: 10px;
  }

  &.tablet-layout {
    padding: 15px;
  }
}

.security-overview {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;

  .alert-badge {
    margin-left: auto;
  }
}

.alerts-list {
  max-height: 300px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }

  &:focus {
    outline: 2px solid #409eff;
    outline-offset: 2px;
  }

  &.alert-high {
    border-left: 4px solid #e6a23c;
  }

  &.alert-critical {
    border-left: 4px solid #f56c6c;
  }
}

.alert-content {
  flex: 1;

  .alert-description {
    margin-left: 8px;
    color: #606266;
  }

  .alert-time {
    display: block;
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }
}

.alert-actions {
  display: flex;
  gap: 8px;
}

.charts-row {
  margin-bottom: 20px;
}

.behavior-card {
  margin-top: 20px;
}

.dashboard-error {
  margin-top: 20px;
}

// Screen reader only content
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// Responsive design
@media (max-width: 768px) {
  .security-dashboard {
    padding: 10px;
  }

  .alert-item {
    flex-direction: column;
    align-items: flex-start;

    .alert-actions {
      margin-top: 8px;
      width: 100%;

      .el-button {
        flex: 1;
      }
    }
  }
}
</style>
