<!--
🏢 SmartAbp 企业级图标 - 仪表板
🎯 专业的企业管理系统仪表板图标
🎨 符合企业级视觉规范
-->
<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="enterprise-dashboard-icon"
  >
    <!-- 🏠 主要仪表板框架 -->
    <rect
      x="3"
      y="3"
      width="8"
      height="6"
      rx="2"
      stroke="currentColor"
      stroke-width="2"
      fill="none"
      class="dashboard-panel dashboard-main"
    />
    
    <!-- 📊 统计图表区域 -->
    <rect
      x="13"
      y="3"
      width="8"
      height="4"
      rx="1"
      stroke="currentColor"
      stroke-width="2"
      fill="none"
      class="dashboard-panel dashboard-chart"
    />
    
    <!-- 📈 趋势图区域 -->
    <rect
      x="13"
      y="9"
      width="8"
      height="4"
      rx="1"
      stroke="currentColor"
      stroke-width="2"
      fill="none"
      class="dashboard-panel dashboard-trend"
    />
    
    <!-- 📋 列表信息区域 -->
    <rect
      x="3"
      y="11"
      width="8"
      height="10"
      rx="2"
      stroke="currentColor"
      stroke-width="2"
      fill="none"
      class="dashboard-panel dashboard-list"
    />
    
    <!-- 🔔 通知区域 -->
    <rect
      x="13"
      y="15"
      width="8"
      height="6"
      rx="1"
      stroke="currentColor"
      stroke-width="2"
      fill="none"
      class="dashboard-panel dashboard-notification"
    />
    
    <!-- 📊 数据指示器 -->
    <circle
      cx="7"
      cy="6"
      r="1"
      fill="currentColor"
      class="dashboard-indicator primary"
    />
    
    <circle
      cx="15"
      cy="5"
      r="1"
      fill="currentColor"
      class="dashboard-indicator success"
    />
    
    <circle
      cx="17"
      cy="11"
      r="1"
      fill="currentColor"
      class="dashboard-indicator warning"
    />
    
    <!-- 📈 微型图表线条 -->
    <path
      d="M5 14L6 13L7 15L8 12L9 14"
      stroke="currentColor"
      stroke-width="1.5"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="dashboard-chart-line"
    />
    
    <!-- 📊 微型柱状图 -->
    <g class="dashboard-mini-bars">
      <line
        x1="15"
        y1="11"
        x2="15"
        y2="9"
        stroke="currentColor"
        stroke-width="1"
      />
      <line
        x1="17"
        y1="11"
        x2="17"
        y2="8"
        stroke="currentColor"
        stroke-width="1"
      />
      <line
        x1="19"
        y1="11"
        x2="19"
        y2="10"
        stroke="currentColor"
        stroke-width="1"
      />
    </g>
    
    <!-- 🔔 通知指示器 -->
    <circle
      cx="19"
      cy="17"
      r="2"
      fill="none"
      stroke="currentColor"
      stroke-width="1"
      class="dashboard-notification-badge"
    />
    
    <circle
      cx="19"
      cy="17"
      r="1"
      fill="currentColor"
      class="dashboard-notification-dot"
    />
  </svg>
</template>

<script setup lang="ts">
// 🎯 图标属性接口
interface DashboardIconProps {
  size?: number
  color?: string
  animated?: boolean
}

withDefaults(defineProps<DashboardIconProps>(), {
  size: 24,
  color: 'currentColor',
  animated: false
})
</script>

<style scoped>
/* 🎨 企业级仪表板图标样式 */
.enterprise-dashboard-icon {
  width: 100%;
  height: 100%;
  display: block;
}

/* 📊 仪表板面板样式 */
.dashboard-panel {
  transition: all 0.3s ease;
}

.dashboard-main {
  stroke-dasharray: 0;
}

.dashboard-chart {
  stroke-dasharray: 2, 2;
}

.dashboard-trend {
  stroke-dasharray: 1, 1;
}

.dashboard-list {
  stroke-dasharray: 0;
}

.dashboard-notification {
  stroke-dasharray: 3, 1;
}

/* 🎯 数据指示器样式 */
.dashboard-indicator {
  transition: all 0.3s ease;
}

.dashboard-indicator.primary {
  fill: var(--enterprise-icon-color-primary, #409EFF);
}

.dashboard-indicator.success {
  fill: var(--enterprise-icon-color-success, #67C23A);
}

.dashboard-indicator.warning {
  fill: var(--enterprise-icon-color-warning, #E6A23C);
}

/* 📈 图表线条样式 */
.dashboard-chart-line {
  stroke: var(--enterprise-icon-color-primary, #409EFF);
  stroke-width: 1.5;
}

/* 📊 柱状图样式 */
.dashboard-mini-bars line {
  stroke: var(--enterprise-icon-color-info, #909399);
  transition: stroke 0.3s ease;
}

/* 🔔 通知徽章样式 */
.dashboard-notification-badge {
  stroke: var(--enterprise-icon-color-danger, #F56C6C);
}

.dashboard-notification-dot {
  fill: var(--enterprise-icon-color-danger, #F56C6C);
}

/* 🖱️ 悬停效果 */
.enterprise-dashboard-icon:hover .dashboard-panel {
  stroke-width: 2.5;
}

.enterprise-dashboard-icon:hover .dashboard-indicator {
  r: 1.2;
}

.enterprise-dashboard-icon:hover .dashboard-chart-line {
  stroke-width: 2;
}

/* 🎬 动画效果 */
@keyframes dashboard-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes dashboard-chart-draw {
  0% { stroke-dasharray: 0, 20; }
  100% { stroke-dasharray: 20, 0; }
}

.enterprise-dashboard-icon.animated .dashboard-indicator {
  animation: dashboard-pulse 2s ease-in-out infinite;
}

.enterprise-dashboard-icon.animated .dashboard-chart-line {
  animation: dashboard-chart-draw 3s ease-in-out infinite;
}

/* 🌓 暗色主题支持 */
.dark .enterprise-dashboard-icon {
  filter: brightness(1.1);
}

.dark .dashboard-panel {
  stroke-opacity: 0.8;
}

/* 📱 响应式适配 */
@media (max-width: 768px) {
  .enterprise-dashboard-icon {
    /* 移动端优化 */
  }
}

/* ♿ 无障碍支持 */
.enterprise-dashboard-icon:focus {
  outline: 2px solid var(--enterprise-icon-color-primary, #409EFF);
  outline-offset: 2px;
}

/* 🔧 高对比度模式 */
@media (prefers-contrast: high) {
  .dashboard-panel {
    stroke-width: 3;
  }
  
  .dashboard-indicator {
    r: 1.5;
  }
}

/* 🎨 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .enterprise-dashboard-icon.animated * {
    animation: none !important;
  }
}
</style>
