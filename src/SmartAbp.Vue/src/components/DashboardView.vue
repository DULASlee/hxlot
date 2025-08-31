<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">工作台</h2>
      <div class="page-actions">
        <button class="btn btn-primary">刷新数据</button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-value">1,234</div>
          <div class="stat-label">在线用户</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🏗️</div>
        <div class="stat-content">
          <div class="stat-value">56</div>
          <div class="stat-label">活跃项目</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⚠️</div>
        <div class="stat-content">
          <div class="stat-value">12</div>
          <div class="stat-label">待处理告警</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">98.5%</div>
          <div class="stat-label">系统可用性</div>
        </div>
      </div>
    </div>

    <!-- 用户信息卡片 -->
    <div class="info-section">
      <div class="info-card">
        <h3>当前用户信息</h3>
        <div class="user-details">
          <div class="detail-item">
            <span class="label">用户名:</span>
            <span class="value">{{ userInfo?.userName || 'N/A' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">邮箱:</span>
            <span class="value">{{ userInfo?.email || 'N/A' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">角色:</span>
            <span class="value">{{ userInfo?.role || 'N/A' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">登录时间:</span>
            <span class="value">{{ new Date().toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <div class="info-card">
        <h3>系统功能</h3>
        <div class="feature-list">
          <div class="feature-item">✅ JWT Token认证</div>
          <div class="feature-item">✅ 多租户支持</div>
          <div class="feature-item">✅ 企业级UI框架</div>
          <div class="feature-item">✅ 响应式布局</div>
          <div class="feature-item">✅ 权限管理</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
  userInfo: any
}>()
</script>

<style scoped>
/* 完全响应式页面容器 */
.page-container {
  background: white;
  border-radius: clamp(4px, 1vw, 8px);
  padding: clamp(16px, 4vw, 32px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  width: 100%;
  min-height: calc(100vh - 60px - clamp(36px, 4vh, 48px) - clamp(24px, 6vw, 48px));
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(16px, 3vh, 24px);
  padding-bottom: clamp(12px, 2vh, 16px);
  border-bottom: 1px solid #f2f3f5;
  flex-shrink: 0;
}

.page-title {
  font-size: clamp(18px, 4vw, 28px);
  font-weight: 600;
  color: #1f2329;
  margin: 0;
}

.btn {
  padding: clamp(6px, 1.5vh, 10px) clamp(12px, 3vw, 20px);
  border-radius: clamp(3px, 0.8vw, 6px);
  border: none;
  cursor: pointer;
  font-size: clamp(12px, 2vw, 16px);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-primary {
  background: #1e3a5f;
  color: white;
}

.btn-primary:hover {
  background: #2a4d7a;
  transform: translateY(-1px);
}

/* 响应式统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(clamp(200px, 25vw, 300px), 1fr));
  gap: clamp(12px, 3vw, 24px);
  margin-bottom: clamp(16px, 4vh, 32px);
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: clamp(16px, 4vw, 24px);
  border-radius: clamp(6px, 1.5vw, 12px);
  display: flex;
  align-items: center;
  gap: clamp(12px, 3vw, 20px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  min-height: clamp(80px, 12vh, 120px);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: clamp(24px, 5vw, 40px);
  opacity: 0.9;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: clamp(20px, 4vw, 32px);
  font-weight: 600;
  margin-bottom: clamp(2px, 0.5vh, 6px);
  line-height: 1.2;
}

.stat-label {
  font-size: clamp(11px, 2vw, 16px);
  opacity: 0.9;
  line-height: 1.3;
}

/* 响应式信息区域 */
.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(clamp(300px, 40vw, 450px), 1fr));
  gap: clamp(16px, 4vw, 24px);
  flex: 1;
}

.info-card {
  background: #f7f8fa;
  padding: clamp(16px, 4vw, 24px);
  border-radius: clamp(6px, 1.5vw, 12px);
  border: 1px solid #e5e6eb;
  transition: box-shadow 0.3s ease;
  height: fit-content;
}

.info-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.info-card h3 {
  font-size: clamp(16px, 3vw, 20px);
  font-weight: 600;
  color: #1f2329;
  margin-bottom: clamp(12px, 3vh, 20px);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 2vh, 16px);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(6px, 1.5vh, 12px) 0;
  border-bottom: 1px solid #e5e6eb;
  gap: clamp(8px, 2vw, 16px);
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #4e5969;
  font-size: clamp(12px, 2vw, 14px);
  flex-shrink: 0;
}

.value {
  color: #1f2329;
  font-weight: 500;
  font-size: clamp(12px, 2vw, 14px);
  text-align: right;
  word-break: break-word;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 1.5vh, 12px);
}

.feature-item {
  padding: clamp(6px, 1.5vh, 10px) 0;
  color: #4e5969;
  font-size: clamp(12px, 2vw, 14px);
  line-height: 1.4;
}

/* 响应式断点 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .info-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .value {
    text-align: left;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
}

/* 超大屏幕优化 */
@media (min-width: 1920px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .info-section {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
