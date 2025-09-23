<template>
  <div class="log-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">📋</span>
          日志管理
        </h1>
        <p class="page-description">
          系统日志的统一管理、查看、分析和导出平台
        </p>
      </div>
      <div class="header-actions">
        <button
          class="btn btn-primary"
          @click="refreshLogs"
        >
          <span class="btn-icon">🔄</span>
          刷新日志
        </button>
        <button
          class="btn btn-secondary"
          @click="exportLogs"
        >
          <span class="btn-icon">📤</span>
          导出日志
        </button>
      </div>
    </div>

    <!-- 功能导航卡片 -->
    <div class="feature-cards">
      <div class="card-grid">
        <div
          class="feature-card"
          @click="navigateTo('/Log/dashboard')"
        >
          <div class="card-icon">
            📊
          </div>
          <div class="card-content">
            <h3>日志仪表板</h3>
            <p>实时监控系统日志状态和统计信息</p>
            <div class="card-stats">
              <span class="stat-item">
                <span class="stat-label">今日日志:</span>
                <span class="stat-value">{{ todayLogsCount }}</span>
              </span>
              <span class="stat-item">
                <span class="stat-label">错误数:</span>
                <span class="stat-value error">{{ errorLogsCount }}</span>
              </span>
            </div>
          </div>
          <div class="card-arrow">
            →
          </div>
        </div>

        <div
          class="feature-card"
          @click="navigateTo('/Log/viewer')"
        >
          <div class="card-icon">
            👁️
          </div>
          <div class="card-content">
            <h3>日志查看器</h3>
            <p>高级日志搜索、过滤和详细查看</p>
            <div class="card-stats">
              <span class="stat-item">
                <span class="stat-label">总日志:</span>
                <span class="stat-value">{{ totalLogsCount }}</span>
              </span>
              <span class="stat-item">
                <span class="stat-label">在线用户:</span>
                <span class="stat-value">{{ onlineUsersCount }}</span>
              </span>
            </div>
          </div>
          <div class="card-arrow">
            →
          </div>
        </div>

        <div
          class="feature-card"
          @click="showAnalytics = true"
        >
          <div class="card-icon">
            📈
          </div>
          <div class="card-content">
            <h3>性能分析</h3>
            <p>系统性能指标和趋势分析</p>
            <div class="card-stats">
              <span class="stat-item">
                <span class="stat-label">平均响应:</span>
                <span class="stat-value">{{ avgResponseTime }}ms</span>
              </span>
              <span class="stat-item">
                <span class="stat-label">成功率:</span>
                <span class="stat-value success">{{ successRate }}%</span>
              </span>
            </div>
          </div>
          <div class="card-arrow">
            →
          </div>
        </div>

        <div
          class="feature-card"
          @click="showSettings = true"
        >
          <div class="card-icon">
            ⚙️
          </div>
          <div class="card-content">
            <h3>日志配置</h3>
            <p>日志级别、存储和清理策略配置</p>
            <div class="card-stats">
              <span class="stat-item">
                <span class="stat-label">存储大小:</span>
                <span class="stat-value">{{ storageSize }}</span>
              </span>
              <span class="stat-item">
                <span class="stat-label">保留天数:</span>
                <span class="stat-value">{{ retentionDays }}天</span>
              </span>
            </div>
          </div>
          <div class="card-arrow">
            →
          </div>
        </div>
      </div>
    </div>

    <!-- 快速概览 -->
    <div class="quick-overview">
      <div class="overview-section">
        <h2 class="section-title">
          实时日志流
        </h2>
        <div class="log-stream">
          <LogViewer
            :max-height="300"
            :show-controls="false"
          />
        </div>
      </div>

      <div class="overview-section">
        <h2 class="section-title">
          系统状态
        </h2>
        <div class="system-status">
          <div class="status-grid">
            <div class="status-item">
              <div class="status-icon healthy">
                ✅
              </div>
              <div class="status-info">
                <div class="status-label">
                  系统状态
                </div>
                <div class="status-value">
                  正常运行
                </div>
              </div>
            </div>
            <div class="status-item">
              <div class="status-icon warning">
                ⚠️
              </div>
              <div class="status-info">
                <div class="status-label">
                  内存使用
                </div>
                <div class="status-value">
                  {{ memoryUsage }}%
                </div>
              </div>
            </div>
            <div class="status-item">
              <div class="status-icon info">
                ℹ️
              </div>
              <div class="status-info">
                <div class="status-label">
                  磁盘空间
                </div>
                <div class="status-value">
                  {{ diskUsage }}%
                </div>
              </div>
            </div>
            <div class="status-item">
              <div class="status-icon success">
                🚀
              </div>
              <div class="status-info">
                <div class="status-label">
                  运行时间
                </div>
                <div class="status-value">
                  {{ uptime }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能分析弹窗 -->
    <div
      v-if="showAnalytics"
      class="modal-overlay"
      @click="showAnalytics = false"
    >
      <div
        class="modal-content"
        @click.stop
      >
        <div class="modal-header">
          <h3>性能分析</h3>
          <button
            class="close-btn"
            @click="showAnalytics = false"
          >
            ×
          </button>
        </div>
        <div class="modal-body">
          <LogDashboard />
        </div>
      </div>
    </div>

    <!-- 设置弹窗 -->
    <div
      v-if="showSettings"
      class="modal-overlay"
      @click="showSettings = false"
    >
      <div
        class="modal-content"
        @click.stop
      >
        <div class="modal-header">
          <h3>日志配置</h3>
          <button
            class="close-btn"
            @click="showSettings = false"
          >
            ×
          </button>
        </div>
        <div class="modal-body">
          <div class="settings-form">
            <div class="form-group">
              <label>日志级别</label>
              <select
                v-model="logLevel"
                class="form-control"
              >
                <option value="debug">
                  Debug
                </option>
                <option value="info">
                  Info
                </option>
                <option value="warn">
                  Warning
                </option>
                <option value="error">
                  Error
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>保留天数</label>
              <input
                v-model="retentionDays"
                type="number"
                class="form-control"
                min="1"
                max="365"
              />
            </div>
            <div class="form-group">
              <label>自动清理</label>
              <input
                v-model="autoCleanup"
                type="checkbox"
                class="form-checkbox"
              />
              <span class="checkbox-label">启用自动清理过期日志</span>
            </div>
            <div class="form-actions">
              <button
                class="btn btn-primary"
                @click="saveSettings"
              >
                保存设置
              </button>
              <button
                class="btn btn-secondary"
                @click="showSettings = false"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { logger } from "@/utils/logger"
import LogViewer from "./LogViewer.vue"
import LogDashboard from "@/views/log/LogDashboard.vue"

const router = useRouter()

// 响应式数据
const showAnalytics = ref(false)
const showSettings = ref(false)
const logLevel = ref("info")
const retentionDays = ref(30)
const autoCleanup = ref(true)

// 统计数据
const todayLogsCount = ref(0)
const errorLogsCount = ref(0)
const totalLogsCount = ref(0)
const onlineUsersCount = ref(0)
const avgResponseTime = ref(0)
const successRate = ref(0)
const storageSize = ref("0MB")
const memoryUsage = ref(0)
const diskUsage = ref(0)
const uptime = ref("0天")

// 导航方法
const navigateTo = (path: string) => {
  router.push(path)
}

// 刷新日志
const refreshLogs = () => {
  logger.info("用户刷新日志数据", {
    component: "LogManagement",
    action: "refresh_logs",
    timestamp: new Date().toISOString(),
  })
  loadStatistics()
}

// 导出日志
const exportLogs = () => {
  logger.info("用户导出日志数据", {
    component: "LogManagement",
    action: "export_logs",
    timestamp: new Date().toISOString(),
  })
  // 这里可以调用日志导出功能
}

// 保存设置
const saveSettings = () => {
  logger.info("用户保存日志配置", {
    component: "LogManagement",
    action: "save_settings",
    settings: {
      logLevel: logLevel.value,
      retentionDays: retentionDays.value,
      autoCleanup: autoCleanup.value,
    },
  })
  showSettings.value = false
}

// 加载统计数据
const loadStatistics = () => {
  // 模拟数据加载
  todayLogsCount.value = Math.floor(Math.random() * 1000) + 500
  errorLogsCount.value = Math.floor(Math.random() * 50) + 10
  totalLogsCount.value = Math.floor(Math.random() * 10000) + 5000
  onlineUsersCount.value = Math.floor(Math.random() * 100) + 20
  avgResponseTime.value = Math.floor(Math.random() * 200) + 50
  successRate.value = Math.floor(Math.random() * 10) + 90
  storageSize.value = `${(Math.random() * 500 + 100).toFixed(1)}MB`
  memoryUsage.value = Math.floor(Math.random() * 30) + 60
  diskUsage.value = Math.floor(Math.random() * 20) + 40

  // 计算运行时间
  const days = Math.floor(Math.random() * 30) + 1
  uptime.value = `${days}天`
}

// 组件挂载时加载数据
onMounted(() => {
  logger.info("日志管理页面加载", {
    component: "LogManagement",
    action: "page_load",
    timestamp: new Date().toISOString(),
  })
  loadStatistics()
})
</script>

<style scoped>
.log-management {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.header-content .page-title {
  display: flex;
  align-items: center;
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
}

.title-icon {
  margin-right: 12px;
  font-size: 32px;
}

.page-description {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-icon {
  margin-right: 8px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.feature-cards {
  margin-bottom: 32px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
  display: flex;
  align-items: center;
  gap: 16px;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgb(0 0 0 / 15%);
}

.card-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.card-content p {
  margin: 0 0 12px;
  color: #666;
  font-size: 14px;
}

.card-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.stat-value.error {
  color: #dc3545;
}

.stat-value.success {
  color: #28a745;
}

.card-arrow {
  font-size: 24px;
  color: #007bff;
  flex-shrink: 0;
}

.quick-overview {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.overview-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.section-title {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.log-stream {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.system-status {
  height: 300px;
  overflow-y: auto;
}

.status-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.status-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.status-info {
  flex: 1;
}

.status-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.status-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f0f0f0;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-control {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgb(0 123 255 / 25%);
}

.form-checkbox {
  margin-right: 8px;
}

.checkbox-label {
  font-size: 14px;
  color: #333;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (width <= 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .quick-overview {
    grid-template-columns: 1fr;
  }

  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
