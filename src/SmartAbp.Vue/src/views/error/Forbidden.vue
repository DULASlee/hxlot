<template>
  <div class="forbidden-container">
    <!-- 装饰背景 -->
    <div class="bg-decoration">
      <div
        v-for="i in 6"
        :key="i"
        class="decoration-circle"
        :style="{ animationDelay: `${i * 0.5}s` }"
      />
    </div>

    <div class="error-content">
      <!-- 顶部装饰线 -->
      <div class="top-decoration" />
      
      <!-- 图标区域 -->
      <div class="icon-wrapper">
        <div class="icon-circle">
          <el-icon
            :size="64"
            class="lock-icon"
          >
            <Lock />
          </el-icon>
        </div>
        <div class="icon-shadow" />
      </div>
      
      <!-- 错误代码 -->
      <div class="error-code-wrapper">
        <h1 class="error-code">
          <span
            v-for="(digit, index) in '403'"
            :key="index"
            class="digit"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            {{ digit }}
          </span>
        </h1>
      </div>

      <!-- 标题和描述 -->
      <h2 class="error-title">
        权限不足
      </h2>
      <p class="error-message">
        抱歉，您的权限不足，无法访问此页面
      </p>
      
      <!-- 角色信息卡片 -->
      <div
        v-if="userRoles.length > 0"
        class="role-card"
      >
        <div class="role-item">
          <div class="role-label">
            <el-icon class="label-icon">
              <User />
            </el-icon>
            <span>您的角色</span>
          </div>
          <div class="role-tags">
            <el-tag
              v-for="role in userRoles"
              :key="role"
              :type="getRoleTagType(role)"
              effect="dark"
              round
              class="role-tag"
            >
              {{ getRoleDisplayName(role) }}
            </el-tag>
          </div>
        </div>
        
        <div
          v-if="requiredRoles.length > 0"
          class="role-divider"
        />
        
        <div
          v-if="requiredRoles.length > 0"
          class="role-item"
        >
          <div class="role-label">
            <el-icon class="label-icon">
              <Key />
            </el-icon>
            <span>所需角色</span>
          </div>
          <div class="role-tags">
            <el-tag
              v-for="role in requiredRoles"
              :key="role"
              type="warning"
              effect="dark"
              round
              class="role-tag"
            >
              {{ getRoleDisplayName(role) }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          class="action-btn primary-btn"
          size="large"
          @click="goBack"
        >
          <el-icon><Back /></el-icon>
          <span>返回上一页</span>
        </el-button>
        <el-button
          class="action-btn"
          size="large"
          @click="goHome"
        >
          <el-icon><HomeFilled /></el-icon>
          <span>返回首页</span>
        </el-button>
        <el-button
          class="action-btn"
          size="large"
          @click="contactAdmin"
        >
          <el-icon><Service /></el-icon>
          <span>联系管理员</span>
        </el-button>
      </div>

      <!-- 底部装饰线 -->
      <div class="bottom-decoration" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore, useThemeStore } from '@/stores'
import { ElMessage } from 'element-plus'
import { Lock, User, Key, Back, HomeFilled, Service } from '@element-plus/icons-vue'
import { getRoleDisplayName } from '@/utils/roleHierarchy'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()

// 🎨 确保主题在403页面正确应用
onMounted(() => {
  // 强制重新应用主题，确保CSS变量正确加载
  themeStore.applyTheme()
  console.log('🎨 403页面：主题已应用', {
    isDarkMode: themeStore.isDarkMode,
    currentTheme: themeStore.currentTheme
  })
})

// 🧹 清理工作
onUnmounted(() => {
  // 页面卸载时无需特殊处理，主题状态由store统一管理
  console.log('👋 403页面：组件卸载')
})

// 用户角色
const userRoles = computed(() => authStore.userInfo?.roles || [])

// 所需角色（从路由 meta 中获取）
const requiredRoles = computed(() => {
  const fromQuery = route.query.requiredRoles
  if (Array.isArray(fromQuery)) {
    return fromQuery as string[]
  } else if (typeof fromQuery === 'string') {
    return fromQuery.split(',')
  }
  return []
})

// 获取角色标签类型
const getRoleTagType = (role: string): 'success' | 'info' | 'warning' | 'danger' => {
  const roleTypeMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    admin: 'danger',
    manager: 'warning',
    user: 'success',
    guest: 'info'
  }
  return roleTypeMap[role.toLowerCase()] || 'info'
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 返回首页
const goHome = () => {
  router.push({ name: 'Dashboard' })
}

// 联系管理员
const contactAdmin = () => {
  ElMessage.info({
    message: '请联系系统管理员申请相应权限',
    duration: 3000,
    showClose: true
  })
}
</script>

<style scoped lang="scss">
// 🎨 现代企业级403页面设计 - 使用系统统一主题令牌
.forbidden-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  // ✅ 使用系统主题令牌：--theme-brand-primary
  background: linear-gradient(
    135deg,
    var(--theme-brand-primary) 0%,
    var(--theme-brand-primary-hover) 100%
  );
  padding: var(--spacing-5);
  position: relative;
  overflow: hidden;
  transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

// 背景装饰圆圈
.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  overflow: hidden;
}

.decoration-circle {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  animation: float 20s ease-in-out infinite;
  
  &:nth-child(1) { top: -10%; left: -10%; width: 400px; height: 400px; }
  &:nth-child(2) { top: 20%; right: -15%; width: 350px; height: 350px; }
  &:nth-child(3) { bottom: -20%; left: 10%; width: 500px; height: 500px; }
  &:nth-child(4) { top: 40%; left: 30%; width: 200px; height: 200px; }
  &:nth-child(5) { bottom: 30%; right: 20%; width: 250px; height: 250px; }
  &:nth-child(6) { top: 60%; left: 50%; width: 180px; height: 180px; }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  25% {
    transform: translate(30px, -30px) scale(1.1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-20px, 40px) scale(0.9);
    opacity: 0.4;
  }
  75% {
    transform: translate(40px, 20px) scale(1.05);
    opacity: 0.6;
  }
}

// 主内容卡片
.error-content {
  position: relative;
  text-align: center;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  max-width: 560px;
  width: 100%;
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// 顶部装饰线
.top-decoration {
  width: 60px;
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--theme-brand-primary),
    var(--theme-brand-primary-hover)
  );
  border-radius: 2px;
  margin: 0 auto 32px;
  animation: slideIn 0.8s ease-out 0.3s backwards;
  transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from {
    width: 0;
    opacity: 0;
  }
  to {
    width: 60px;
    opacity: 1;
  }
}

// 图标区域
.icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
}

.icon-circle {
  position: relative;
  width: 120px;
  height: 120px;
  background: linear-gradient(
    135deg,
    var(--theme-danger),
    var(--theme-danger-hover)
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
  animation: iconPulse 2s ease-in-out infinite, iconAppear 0.8s ease-out 0.2s backwards;
  z-index: 1;
  transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.lock-icon {
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.icon-shadow {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 20px;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.2), transparent);
  filter: blur(8px);
  animation: shadowPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.05) rotate(5deg);
  }
}

@keyframes shadowPulse {
  0%, 100% {
    transform: translateX(-50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateX(-50%) scale(1.1);
    opacity: 0.5;
  }
}

@keyframes iconAppear {
  from {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

// 错误代码
.error-code-wrapper {
  margin: var(--spacing-6) 0;
}

.error-code {
  font-size: 96px;
  font-weight: 800;
  margin: 0;
  line-height: 1;
  background: linear-gradient(
    135deg,
    var(--theme-danger),
    var(--theme-danger-hover)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 4px 8px rgba(239, 68, 68, 0.2));
  letter-spacing: 8px;
  transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.digit {
  display: inline-block;
  animation: digitBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) backwards;
}

@keyframes digitBounce {
  0% {
    transform: translateY(-100px) scale(0);
    opacity: 0;
  }
  50% {
    transform: translateY(10px) scale(1.1);
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

// 标题和描述
.error-title {
  font-size: 28px;
  color: var(--theme-text-inverse);
  margin: var(--spacing-4) 0;
  font-weight: 700;
  letter-spacing: 0.5px;
  animation: fadeIn 0.8s ease-out 0.4s backwards;
}

.error-message {
  font-size: 15px;
  color: var(--theme-text-inverse);
  margin: 0 0 32px;
  line-height: 1.8;
  opacity: 0.9;
  animation: fadeIn 0.8s ease-out 0.5s backwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 角色信息卡片
.role-card {
  background: var(--theme-bg-component);
  border-radius: 16px;
  padding: var(--spacing-6);
  margin-bottom: 32px;
  border: 1px solid var(--theme-border-light);
  box-shadow: var(--theme-shadow-md);
  animation: fadeIn 0.8s ease-out 0.6s backwards;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.role-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
  }
}

.role-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--theme-text-primary);
  flex-shrink: 0;
}

.label-icon {
  font-size: 18px;
  color: var(--theme-brand-primary);
}

.role-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
  
  @media (max-width: 576px) {
    justify-content: flex-start;
  }
}

.role-tag {
  font-weight: 600;
  font-size: 13px;
  padding: 6px 16px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.role-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
  margin: var(--spacing-4) 0;
}

// 操作按钮
.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeIn 0.8s ease-out 0.7s backwards;
}

.action-btn {
  min-width: 140px;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  
  :deep(.el-icon) {
    font-size: 18px;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  &.primary-btn {
    background: linear-gradient(
      135deg,
      var(--theme-brand-primary),
      var(--theme-brand-primary-hover)
    );
    color: var(--theme-text-inverse);
    border: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      background: linear-gradient(
        135deg,
        var(--theme-brand-primary-hover),
        var(--theme-brand-primary-active)
      );
      box-shadow: var(--theme-shadow-lg);
    }
  }
}

// 底部装饰线
.bottom-decoration {
  width: 60px;
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--theme-brand-primary),
    var(--theme-brand-primary-hover)
  );
  border-radius: 2px;
  margin: var(--spacing-8) auto 0;
  animation: slideIn 0.8s ease-out 0.8s backwards;
  transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

// 响应式设计
@media (max-width: 768px) {
  .error-content {
    padding: 36px 24px;
    border-radius: 20px;
  }
  
  .icon-circle {
    width: 100px;
    height: 100px;
  }
  
  .lock-icon {
    font-size: 48px;
  }
  
  .error-code {
    font-size: 72px;
    letter-spacing: 4px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-message {
    font-size: 14px;
  }
  
  .role-card {
    padding: var(--spacing-5);
  }
  
  .action-buttons {
    flex-direction: column;
    
    .action-btn {
      width: 100%;
      min-width: unset;
    }
  }
}

@media (max-width: 480px) {
  .forbidden-container {
    padding: var(--spacing-3);
  }
  
  .error-content {
    padding: 28px 20px;
  }
  
  .icon-circle {
    width: 80px;
    height: 80px;
  }
  
  .lock-icon {
    font-size: 40px;
  }
  
  .error-code {
    font-size: 56px;
  }
  
  .error-title {
    font-size: 20px;
  }
}
</style>

