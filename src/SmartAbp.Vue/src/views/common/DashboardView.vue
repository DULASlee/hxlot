<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-text">
          <h1><SmartIcon icon="carbon:dashboard" size="lg" class="header-icon" />{{ t('dashboard.title') }}</h1>
          <p>{{ t('dashboard.welcome') }}</p>
        </div>
        <div class="header-actions">
          <button
            class="header-btn"
            @click="refreshDashboard"
          >
            <SmartIcon icon="carbon:renew" />
            <span>{{ t('dashboard.actions.refresh') }}</span>
          </button>
          <button
            class="header-btn"
            @click="exportReport"
          >
            <SmartIcon icon="carbon:download" />
            <span>{{ t('dashboard.actions.export') }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- 统计卡片 -->
      <div class="stat-cards">
        <div class="stat-card users">
          <div class="stat-icon">
            <SmartIcon icon="carbon:user" />
          </div>
          <div class="stat-content">
            <div class="stat-number">
              1,234
            </div>
            <div class="stat-label">
              {{ t('dashboard.stats.totalUsers') }}
            </div>
            <div class="stat-trend">
              <SmartIcon icon="carbon:trending-up" class="trend-up" />
              <span>+12% {{ t('dashboard.trends.thisMonth') }}</span>
            </div>
          </div>
        </div>

        <div class="stat-card projects">
          <div class="stat-icon">
            <SmartIcon icon="carbon:flow-data" />
          </div>
          <div class="stat-content">
            <div class="stat-number">
              56
            </div>
            <div class="stat-label">
              {{ t('dashboard.stats.totalProjects') }}
            </div>
            <div class="stat-trend">
              <SmartIcon icon="carbon:trending-up" class="trend-up" />
              <span>+3 {{ t('dashboard.trends.thisWeek') }}</span>
            </div>
          </div>
        </div>

        <div class="stat-card health">
          <div class="stat-icon">
            <SmartIcon icon="carbon:chart-line" />
          </div>
          <div class="stat-content">
            <div class="stat-number">
              89%
            </div>
            <div class="stat-label">
              {{ t('dashboard.stats.systemHealth') }}
            </div>
            <div class="stat-trend">
              <SmartIcon icon="carbon:trending-down" class="trend-down" />
              <span>-2% {{ t('dashboard.trends.today') }}</span>
            </div>
          </div>
        </div>

        <div class="stat-card logs">
          <div class="stat-icon">
            <SmartIcon icon="carbon:document" />
          </div>
          <div class="stat-content">
            <div class="stat-number">
              2,456
            </div>
            <div class="stat-label">
              {{ t('dashboard.stats.todayLogs') }}
            </div>
            <div class="stat-trend">
              <SmartIcon icon="carbon:trending-up" class="trend-up" />
              <span>+156 {{ t('dashboard.trends.today') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="quick-actions">
        <h2><SmartIcon icon="carbon:lightning" />{{ t('dashboard.quickActions.title') }}</h2>
        <div class="action-grid">
          <button
            class="action-btn"
            @click="router.push('/Admin/users')"
          >
            <SmartIcon icon="carbon:user" />
            <div class="action-content">
              <span class="action-title">{{ t('dashboard.quickActions.userManagement') }}</span>
              <span class="action-desc">{{ t('dashboard.quickActions.userManagementDesc') }}</span>
            </div>
          </button>

          <button
            class="action-btn"
            @click="router.push('/Project')"
          >
            <SmartIcon icon="carbon:flow-data" />
            <div class="action-content">
              <span class="action-title">{{ t('dashboard.quickActions.projectManagement') }}</span>
              <span class="action-desc">{{ t('dashboard.quickActions.projectManagementDesc') }}</span>
            </div>
          </button>

          <button
            class="action-btn"
            @click="router.push('/Log')"
          >
            <SmartIcon icon="carbon:document" />
            <div class="action-content">
              <span class="action-title">{{ t('dashboard.quickActions.systemLogs') }}</span>
              <span class="action-desc">{{ t('dashboard.quickActions.systemLogsDesc') }}</span>
            </div>
          </button>

          <button
            class="action-btn"
            @click="testTheme"
          >
            <SmartIcon icon="carbon:color-palette" />
            <div class="action-content">
              <span class="action-title">{{ t('dashboard.quickActions.themeTest') }}</span>
              <span class="action-desc">{{ t('dashboard.quickActions.themeTestDesc') }}</span>
            </div>
          </button>

          <button
            class="action-btn"
            @click="router.push('/Admin/settings')"
          >
            <SmartIcon icon="carbon:settings" />
            <div class="action-content">
              <span class="action-title">{{ t('dashboard.quickActions.systemSettings') }}</span>
              <span class="action-desc">{{ t('dashboard.quickActions.systemSettingsDesc') }}</span>
            </div>
          </button>

          <button
            class="action-btn"
            @click="router.push('/Admin/permissions')"
          >
            <SmartIcon icon="carbon:security" />
            <div class="action-content">
              <span class="action-title">{{ t('dashboard.quickActions.permissionManagement') }}</span>
              <span class="action-desc">{{ t('dashboard.quickActions.permissionManagementDesc') }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- 系统状态 -->
      <div class="system-status">
        <h2><SmartIcon icon="carbon:server" />{{ t('dashboard.systemStatus.title') }}</h2>
        <div class="status-list">
          <div class="status-item">
            <div class="status-icon">
              <SmartIcon icon="carbon:data-base" />
            </div>
            <div class="status-info">
              <span class="status-name">{{ t('dashboard.systemStatus.databaseConnection') }}</span>
              <div class="status-indicator success" />
            </div>
            <span class="status-value success">{{ t('dashboard.systemStatus.statusNormal') }}</span>
          </div>
          <div class="status-item">
            <div class="status-icon">
              <SmartIcon icon="carbon:memory" />
            </div>
            <div class="status-info">
              <span class="status-name">{{ t('dashboard.systemStatus.cacheService') }}</span>
              <div class="status-indicator success" />
            </div>
            <span class="status-value success">{{ t('dashboard.systemStatus.statusNormal') }}</span>
          </div>
          <div class="status-item">
            <div class="status-icon">
              <SmartIcon icon="carbon:hard-drive" />
            </div>
            <div class="status-info">
              <span class="status-name">{{ t('dashboard.systemStatus.diskSpace') }}</span>
              <div class="status-indicator warning" />
            </div>
            <span class="status-value warning">75%</span>
          </div>
          <div class="status-item">
            <div class="status-icon">
              <SmartIcon icon="carbon:chip" />
            </div>
            <div class="status-info">
              <span class="status-name">{{ t('dashboard.systemStatus.memoryUsage') }}</span>
              <div class="status-indicator success" />
            </div>
            <span class="status-value success">45%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from "@/stores"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { SmartIcon } from "@/components/design-system"

const themeStore = useThemeStore()
const { t } = useI18n()
const router = useRouter()

const testTheme = () => {
  console.log(t('dashboard.messages.currentTheme'), themeStore.currentTheme)
  console.log(t('dashboard.messages.isDarkMode'), themeStore.isDarkMode)
  console.log(t('dashboard.messages.currentTheme'), themeStore.currentTheme)

  // 测试主题切换
  themeStore.toggleDarkMode()
}

const refreshDashboard = () => {
  console.log(t('dashboard.messages.refreshingData'))
  // 这里可以添加实际的数据刷新逻辑
  alert(t('dashboard.messages.refreshed'))
}

const exportReport = () => {
  console.log(t('dashboard.messages.exportingReport'))
  // 这里可以添加实际的报告导出逻辑
  alert(t('dashboard.messages.exportInProgress'))
}
</script>

<style scoped>
.dashboard-view {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 32px;
  background: var(--theme-bg-component);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--theme-shadow-sm);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.header-text h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--theme-text-primary);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  color: var(--theme-brand-primary);
  font-size: 24px;
}

.header-text p {
  font-size: 16px;
  color: var(--theme-text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--theme-brand-primary);
  color: var(--theme-text-inverse);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-btn:hover {
  background: var(--theme-brand-primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--theme-shadow-md);
}

.header-btn i {
  font-size: 14px;
}

.dashboard-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
}

/* 统计卡片 */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  border-radius: 12px;
  box-shadow: var(--theme-shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  box-shadow: var(--theme-shadow-lg);
  transform: translateY(-4px);
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--theme-brand-primary);
  transition: all 0.3s ease;
}

.stat-card.users::before {
  background: var(--theme-brand-primary);
}
.stat-card.projects::before {
  background: var(--theme-success);
}
.stat-card.health::before {
  background: var(--theme-warning);
}
.stat-card.logs::before {
  background: var(--theme-info);
}

.stat-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--theme-brand-primary-light);
  border-radius: 12px;
  color: var(--theme-brand-primary);
  font-size: 24px;
  flex-shrink: 0;
}

.stat-card.users .stat-icon {
  background: var(--theme-brand-primary-light);
  color: var(--theme-brand-primary);
}

.stat-card.projects .stat-icon {
  background: var(--theme-success-light);
  color: var(--theme-success);
}

.stat-card.health .stat-icon {
  background: var(--theme-warning-light);
  color: var(--theme-warning);
}

.stat-card.logs .stat-icon {
  background: var(--theme-info-light);
  color: var(--theme-info);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: var(--theme-text-primary);
  margin-bottom: 4px;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: var(--theme-text-secondary);
  font-weight: 500;
  margin-bottom: 8px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.trend-up {
  color: var(--theme-success);
}

.trend-down {
  color: var(--theme-danger);
}

.stat-trend span {
  color: var(--theme-text-tertiary);
}

/* 快速操作 */
.quick-actions {
  background: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--theme-shadow-sm);
}

.quick-actions h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--theme-text-primary);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.quick-actions h2 i {
  color: var(--theme-brand-primary);
  font-size: 18px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--theme-bg-sunken);
  border: 1px solid var(--theme-border-base);
  border-radius: 10px;
  color: var(--theme-text-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  text-align: left;
}

.action-btn:hover {
  background: var(--theme-bg-hover);
  border-color: var(--theme-brand-primary);
  transform: translateY(-2px);
  box-shadow: var(--theme-shadow-md);
}

.action-btn i {
  font-size: 20px;
  color: var(--theme-brand-primary);
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.action-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.action-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--theme-text-primary);
}

.action-desc {
  font-size: 12px;
  color: var(--theme-text-tertiary);
}

/* 系统状态 */
.system-status {
  background: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--theme-shadow-sm);
}

.system-status h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--theme-text-primary);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.system-status h2 i {
  color: var(--theme-brand-primary);
  font-size: 18px;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--theme-bg-sunken);
  border: 1px solid var(--theme-border-light);
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-item:hover {
  background: var(--theme-bg-hover);
  border-color: var(--theme-border-base);
}

.status-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--theme-brand-primary-light);
  border-radius: 8px;
  color: var(--theme-brand-primary);
  font-size: 16px;
  flex-shrink: 0;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.status-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--theme-text-primary);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator.success {
  background: var(--theme-success);
}

.status-indicator.warning {
  background: var(--theme-warning);
}

.status-indicator.error {
  background: var(--theme-danger);
}

.status-value {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.status-value.success {
  color: var(--theme-success);
  background: var(--theme-success-light);
}

.status-value.warning {
  color: var(--theme-warning);
  background: var(--theme-warning-light);
}

.status-value.error {
  color: var(--theme-danger);
  background: var(--theme-danger-light);
}

/* 响应式设计 */
@media (width <= 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-text h1 {
    font-size: 24px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .stat-cards {
    grid-template-columns: 1fr;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }

  .action-btn {
    padding: 16px;
  }

  .status-item {
    padding: 12px;
  }

  .stat-card {
    padding: 20px;
  }
}
</style>
