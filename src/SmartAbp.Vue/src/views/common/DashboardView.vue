<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-text">
          <h1><i class="fas fa-tachometer-alt header-icon"></i>SmartAbp 工作台</h1>
          <p>欢迎使用 SmartAbp 企业管理系统</p>
        </div>
        <div class="header-actions">
          <button class="header-btn" @click="refreshDashboard">
            <i class="fas fa-sync-alt"></i>
            <span>刷新数据</span>
          </button>
          <button class="header-btn" @click="exportReport">
            <i class="fas fa-download"></i>
            <span>导出报告</span>
          </button>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- 统计卡片 -->
      <div class="stat-cards">
        <div class="stat-card users">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">1,234</div>
            <div class="stat-label">用户总数</div>
            <div class="stat-trend">
              <i class="fas fa-arrow-up trend-up"></i>
              <span>+12% 本月</span>
            </div>
          </div>
        </div>

        <div class="stat-card projects">
          <div class="stat-icon">
            <i class="fas fa-project-diagram"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">56</div>
            <div class="stat-label">项目数量</div>
            <div class="stat-trend">
              <i class="fas fa-arrow-up trend-up"></i>
              <span>+3 本周</span>
            </div>
          </div>
        </div>

        <div class="stat-card health">
          <div class="stat-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">89%</div>
            <div class="stat-label">系统健康度</div>
            <div class="stat-trend">
              <i class="fas fa-arrow-down trend-down"></i>
              <span>-2% 今日</span>
            </div>
          </div>
        </div>

        <div class="stat-card logs">
          <div class="stat-icon">
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">2,456</div>
            <div class="stat-label">今日日志</div>
            <div class="stat-trend">
              <i class="fas fa-arrow-up trend-up"></i>
              <span>+156 今日</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="quick-actions">
        <h2><i class="fas fa-bolt"></i>快速操作</h2>
        <div class="action-grid">
          <button class="action-btn" @click="$router.push('/Admin/users')">
            <i class="fas fa-users"></i>
            <div class="action-content">
              <span class="action-title">用户管理</span>
              <span class="action-desc">管理系统用户</span>
            </div>
          </button>

          <button class="action-btn" @click="$router.push('/Project')">
            <i class="fas fa-project-diagram"></i>
            <div class="action-content">
              <span class="action-title">项目管理</span>
              <span class="action-desc">查看项目列表</span>
            </div>
          </button>

          <button class="action-btn" @click="$router.push('/Log')">
            <i class="fas fa-file-alt"></i>
            <div class="action-content">
              <span class="action-title">系统日志</span>
              <span class="action-desc">查看系统日志</span>
            </div>
          </button>

          <button class="action-btn" @click="testTheme">
            <i class="fas fa-palette"></i>
            <div class="action-content">
              <span class="action-title">主题测试</span>
              <span class="action-desc">测试主题切换</span>
            </div>
          </button>

          <button class="action-btn" @click="$router.push('/Admin/settings')">
            <i class="fas fa-cog"></i>
            <div class="action-content">
              <span class="action-title">系统设置</span>
              <span class="action-desc">配置系统参数</span>
            </div>
          </button>

          <button class="action-btn" @click="$router.push('/Admin/permissions')">
            <i class="fas fa-shield-alt"></i>
            <div class="action-content">
              <span class="action-title">权限管理</span>
              <span class="action-desc">管理用户权限</span>
            </div>
          </button>
        </div>
      </div>

      <!-- 系统状态 -->
      <div class="system-status">
        <h2><i class="fas fa-server"></i>系统状态</h2>
        <div class="status-list">
          <div class="status-item">
            <div class="status-icon">
              <i class="fas fa-database"></i>
            </div>
            <div class="status-info">
              <span class="status-name">数据库连接</span>
              <div class="status-indicator success"></div>
            </div>
            <span class="status-value success">正常</span>
          </div>
          <div class="status-item">
            <div class="status-icon">
              <i class="fas fa-memory"></i>
            </div>
            <div class="status-info">
              <span class="status-name">缓存服务</span>
              <div class="status-indicator success"></div>
            </div>
            <span class="status-value success">正常</span>
          </div>
          <div class="status-item">
            <div class="status-icon">
              <i class="fas fa-hdd"></i>
            </div>
            <div class="status-info">
              <span class="status-name">磁盘空间</span>
              <div class="status-indicator warning"></div>
            </div>
            <span class="status-value warning">75%</span>
          </div>
          <div class="status-item">
            <div class="status-icon">
              <i class="fas fa-microchip"></i>
            </div>
            <div class="status-info">
              <span class="status-name">内存使用</span>
              <div class="status-indicator success"></div>
            </div>
            <span class="status-value success">45%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores'

const themeStore = useThemeStore()

const testTheme = () => {
  console.log('当前主题:', themeStore.currentTheme)
  console.log('是否暗黑模式:', themeStore.isDarkMode)
  console.log('主题类名:', themeStore.currentTheme)

  // 测试主题切换
  themeStore.toggleDarkMode()
}

const refreshDashboard = () => {
  console.log('刷新仪表板数据...')
  // 这里可以添加实际的数据刷新逻辑
  alert('仪表板数据已刷新！')
}

const exportReport = () => {
  console.log('导出报告...')
  // 这里可以添加实际的报告导出逻辑
  alert('报告导出功能开发中...')
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
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--theme-brand-primary);
  transition: all 0.3s ease;
}

.stat-card.users::before { background: var(--theme-brand-primary); }
.stat-card.projects::before { background: var(--theme-success); }
.stat-card.health::before { background: var(--theme-warning); }
.stat-card.logs::before { background: var(--theme-info); }

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
@media (max-width: 768px) {
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
