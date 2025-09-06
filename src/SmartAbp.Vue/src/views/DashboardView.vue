<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <h1>SmartAbp 工作台</h1>
      <p>欢迎使用 SmartAbp 企业管理系统</p>
    </div>

    <div class="dashboard-grid">
      <!-- 统计卡片 -->
      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zM12 14c-3.31 0-6 2.69-6 6v2h12v-2c0-3.31-2.69-6-6-6z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">1,234</div>
            <div class="stat-label">用户总数</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">56</div>
            <div class="stat-label">项目数量</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">89%</div>
            <div class="stat-label">系统健康度</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">2,456</div>
            <div class="stat-label">今日日志</div>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="quick-actions">
        <h2>快速操作</h2>
        <div class="action-grid">
          <button class="action-btn" @click="$router.push('/system/users')">
            <svg viewBox="0 0 24 24">
              <path d="M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zM12 14c-3.31 0-6 2.69-6 6v2h12v-2c0-3.31-2.69-6-6-6z"/>
            </svg>
            <span>用户管理</span>
          </button>

          <button class="action-btn" @click="$router.push('/projects/list')">
            <svg viewBox="0 0 24 24">
              <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
            </svg>
            <span>项目管理</span>
          </button>

          <button class="action-btn" @click="$router.push('/system/logs')">
            <svg viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            <span>系统日志</span>
          </button>

          <button class="action-btn" @click="testTheme">
            <svg viewBox="0 0 24 24">
              <path d="M12 18c-.89 0-1.74-.19-2.5-.54C11.56 16.5 13 14.42 13 12s-1.44-4.5-3.5-5.46C10.26 6.19 11.11 6 12 6a6 6 0 0 1 0 12z"/>
            </svg>
            <span>主题测试</span>
          </button>
        </div>
      </div>

      <!-- 系统状态 -->
      <div class="system-status">
        <h2>系统状态</h2>
        <div class="status-list">
          <div class="status-item">
            <div class="status-indicator success"></div>
            <span>数据库连接</span>
            <span class="status-value">正常</span>
          </div>
          <div class="status-item">
            <div class="status-indicator success"></div>
            <span>缓存服务</span>
            <span class="status-value">正常</span>
          </div>
          <div class="status-item">
            <div class="status-indicator warning"></div>
            <span>磁盘空间</span>
            <span class="status-value">75%</span>
          </div>
          <div class="status-item">
            <div class="status-indicator success"></div>
            <span>内存使用</span>
            <span class="status-value">45%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()

const testTheme = () => {
  console.log('当前主题:', themeStore.currentTheme)
  console.log('是否暗黑模式:', themeStore.isDarkMode)
  console.log('主题类名:', themeStore.currentTheme)

  // 测试主题切换
  themeStore.toggleDarkMode()
}
</script>

<style scoped>
.dashboard-view {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 32px;
}

.dashboard-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.dashboard-header p {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin: 0;
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
  gap: 16px;
  padding: 24px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  border-radius: 8px;
  color: var(--color-primary);
}

.stat-icon svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* 快速操作 */
.quick-actions {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  padding: 24px;
}

.quick-actions h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  color: var(--color-text-primary);
  transition: all 0.3s ease;
  cursor: pointer;
}

.action-btn:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.action-btn svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.action-btn span {
  font-size: 14px;
  font-weight: 500;
}

/* 系统状态 */
.system-status {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  padding: 24px;
}

.system-status h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--color-bg-secondary);
  border-radius: 6px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.success {
  background: var(--color-success-500);
}

.status-indicator.warning {
  background: var(--color-warning-500);
}

.status-indicator.error {
  background: var(--color-error-500);
}

.status-item span:first-of-type {
  flex: 1;
  font-size: 14px;
  color: var(--color-text-primary);
}

.status-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-header h1 {
    font-size: 24px;
  }

  .stat-cards {
    grid-template-columns: 1fr;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>
