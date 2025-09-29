<!--
🏢 SmartAbp 企业级图标 - 用户
👥 专业的用户管理图标
🎨 符合企业级视觉规范
-->
<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="enterprise-user-icon"
  >
    <!-- 👤 用户头像轮廓 -->
    <circle
      cx="12"
      cy="8"
      r="4"
      stroke="currentColor"
      stroke-width="2"
      fill="none"
      class="user-avatar"
    />
    
    <!-- 👥 用户身体轮廓 -->
    <path
      d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
      class="user-body"
    />
    
    <!-- 🎯 企业级用户标识 -->
    <g class="user-enterprise-badge">
      <!-- 💼 企业标识背景 -->
      <circle
        cx="18"
        cy="6"
        r="3"
        fill="var(--enterprise-icon-color-primary, #409EFF)"
        class="badge-background"
      />
      
      <!-- 🏢 企业图标 -->
      <rect
        x="16.5"
        y="4.5"
        width="3"
        height="3"
        rx="0.5"
        fill="white"
        class="badge-icon"
      />
      
      <!-- 🏢 企业建筑细节 -->
      <line
        x1="17"
        y1="5"
        x2="17"
        y2="7"
        stroke="var(--enterprise-icon-color-primary, #409EFF)"
        stroke-width="0.5"
        class="badge-detail"
      />
      
      <line
        x1="18.5"
        y1="5"
        x2="18.5"
        y2="7"
        stroke="var(--enterprise-icon-color-primary, #409EFF)"
        stroke-width="0.5"
        class="badge-detail"
      />
    </g>
    
    <!-- ⚡ 活跃状态指示器 -->
    <circle
      cx="16"
      cy="16"
      r="2"
      fill="var(--enterprise-icon-color-success, #67C23A)"
      class="user-status-indicator online"
    />
    
    <!-- 📊 用户权限等级指示 -->
    <g class="user-permission-level">
      <rect
        x="4"
        y="4"
        width="4"
        height="1"
        fill="var(--enterprise-icon-color-warning, #E6A23C)"
        rx="0.5"
        class="permission-bar level-1"
      />
      <rect
        x="4"
        y="5.5"
        width="3"
        height="1"
        fill="var(--enterprise-icon-color-warning, #E6A23C)"
        rx="0.5"
        class="permission-bar level-2"
      />
      <rect
        x="4"
        y="7"
        width="2"
        height="1"
        fill="var(--enterprise-icon-color-warning, #E6A23C)"
        rx="0.5"
        class="permission-bar level-3"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
// 🎯 用户图标属性接口
interface UserIconProps {
  size?: number
  status?: 'online' | 'offline' | 'busy' | 'away'
  level?: 'admin' | 'manager' | 'user' | 'guest'
  enterprise?: boolean
  animated?: boolean
}

withDefaults(defineProps<UserIconProps>(), {
  size: 24,
  status: 'online',
  level: 'user',
  enterprise: true,
  animated: false
})
</script>

<style scoped>
/* 🎨 企业级用户图标样式 */
.enterprise-user-icon {
  width: 100%;
  height: 100%;
  display: block;
}

/* 👤 用户头像样式 */
.user-avatar {
  transition: all 0.3s ease;
  stroke-width: 2;
}

/* 👥 用户身体样式 */
.user-body {
  transition: all 0.3s ease;
  stroke-width: 2;
}

/* 🏢 企业标识样式 */
.user-enterprise-badge {
  transition: all 0.3s ease;
}

.badge-background {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.badge-icon {
  transition: all 0.3s ease;
}

.badge-detail {
  transition: all 0.3s ease;
}

/* ⚡ 状态指示器样式 */
.user-status-indicator {
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 4px rgba(103, 194, 58, 0.5));
}

.user-status-indicator.online {
  fill: var(--enterprise-icon-color-success, #67C23A);
}

.user-status-indicator.offline {
  fill: var(--enterprise-icon-color-info, #909399);
}

.user-status-indicator.busy {
  fill: var(--enterprise-icon-color-danger, #F56C6C);
}

.user-status-indicator.away {
  fill: var(--enterprise-icon-color-warning, #E6A23C);
}

/* 📊 权限等级指示器 */
.user-permission-level {
  transition: all 0.3s ease;
}

.permission-bar {
  transition: all 0.3s ease;
  opacity: 0.8;
}

.permission-bar.level-1 {
  animation-delay: 0s;
}

.permission-bar.level-2 {
  animation-delay: 0.1s;
}

.permission-bar.level-3 {
  animation-delay: 0.2s;
}

/* 🖱️ 悬停效果 */
.enterprise-user-icon:hover .user-avatar {
  stroke-width: 2.5;
  stroke: var(--enterprise-icon-color-primary, #409EFF);
}

.enterprise-user-icon:hover .user-body {
  stroke-width: 2.5;
  stroke: var(--enterprise-icon-color-primary, #409EFF);
}

.enterprise-user-icon:hover .badge-background {
  r: 3.5;
}

.enterprise-user-icon:hover .user-status-indicator {
  r: 2.5;
}

.enterprise-user-icon:hover .permission-bar {
  opacity: 1;
  height: 1.5;
}

/* 🎬 动画效果 */
@keyframes user-pulse {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.7; 
    transform: scale(1.05);
  }
}

@keyframes status-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes permission-loading {
  0% { opacity: 0.3; transform: scaleX(0); }
  50% { opacity: 0.8; transform: scaleX(0.5); }
  100% { opacity: 1; transform: scaleX(1); }
}

.enterprise-user-icon.animated .user-avatar {
  animation: user-pulse 2s ease-in-out infinite;
}

.enterprise-user-icon.animated .user-status-indicator {
  animation: status-blink 1.5s ease-in-out infinite;
}

.enterprise-user-icon.animated .permission-bar {
  animation: permission-loading 1s ease-in-out infinite;
  transform-origin: left center;
}

/* 🌓 暗色主题支持 */
.dark .enterprise-user-icon {
  filter: brightness(1.1);
}

.dark .user-avatar,
.dark .user-body {
  stroke-opacity: 0.9;
}

.dark .badge-background {
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
}

/* 📱 响应式适配 */
@media (max-width: 768px) {
  .enterprise-user-icon {
    /* 移动端优化 */
  }
  
  .user-enterprise-badge {
    transform: scale(0.8);
  }
  
  .user-permission-level {
    transform: scale(0.9);
  }
}

/* ♿ 无障碍支持 */
.enterprise-user-icon:focus {
  outline: 2px solid var(--enterprise-icon-color-primary, #409EFF);
  outline-offset: 2px;
  border-radius: 4px;
}

/* 🔧 高对比度模式 */
@media (prefers-contrast: high) {
  .user-avatar,
  .user-body {
    stroke-width: 3;
  }
  
  .badge-background {
    stroke: currentColor;
    stroke-width: 1;
  }
  
  .user-status-indicator {
    stroke: currentColor;
    stroke-width: 1;
  }
}

/* 🎨 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .enterprise-user-icon.animated * {
    animation: none !important;
    transition: none !important;
  }
}

/* 📊 权限等级变体 */
.enterprise-user-icon[data-level="admin"] .permission-bar {
  fill: var(--enterprise-icon-color-danger, #F56C6C);
}

.enterprise-user-icon[data-level="manager"] .permission-bar {
  fill: var(--enterprise-icon-color-warning, #E6A23C);
}

.enterprise-user-icon[data-level="user"] .permission-bar {
  fill: var(--enterprise-icon-color-info, #909399);
}

.enterprise-user-icon[data-level="guest"] .permission-bar {
  fill: var(--enterprise-icon-color-info, #909399);
  opacity: 0.5;
}
</style>
