<template>
  <div class="auth-example">
    <h2>认证状态示例</h2>

    <!-- 未登录状态 -->
    <div
      v-if="!authStore.isAuthenticated"
      class="login-section"
    >
      <h3>用户登录</h3>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>用户名:</label>
          <input
            v-model="loginForm.username"
            type="text"
            required
            placeholder="请输入用户名"
          >
        </div>
        <div class="form-group">
          <label>密码:</label>
          <input
            v-model="loginForm.password"
            type="password"
            required
            placeholder="请输入密码"
          >
        </div>
        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="login-btn"
        >
          {{ authStore.isLoading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>

    <!-- 已登录状态 -->
    <div
      v-else
      class="user-section"
    >
      <h3>用户信息</h3>
      <div
        v-if="authStore.userInfo"
        class="user-info"
      >
        <p><strong>用户ID:</strong> {{ authStore.userInfo.id }}</p>
        <p><strong>用户名:</strong> {{ authStore.userInfo.username }}</p>
        <p><strong>邮箱:</strong> {{ authStore.userInfo.email }}</p>
        <p><strong>角色:</strong> {{ authStore.userInfo.roles.join(', ') }}</p>
      </div>
      <button
        class="logout-btn"
        @click="handleLogout"
      >
        登出
      </button>
    </div>

    <!-- 主题切换 -->
    <div class="theme-section">
      <h3>主题设置</h3>
      <div class="theme-controls">
        <label>
          <input
            v-model="themeStore.currentTheme"
            type="radio"
            value="light"
            @change="handleThemeChange"
          >
          浅色主题
        </label>
        <label>
          <input
            v-model="themeStore.currentTheme"
            type="radio"
            value="dark"
            @change="handleThemeChange"
          >
          深色主题
        </label>
        <label>
          <input
            v-model="themeStore.currentTheme"
            type="radio"
            value="auto"
            @change="handleThemeChange"
          >
          跟随系统
        </label>
      </div>
      <p>当前主题: {{ themeStore.currentTheme }}</p>
    </div>

    <!-- API测试 -->
    <div class="api-section">
      <h3>API测试</h3>
      <button
        :disabled="isTestingApi"
        @click="testApi"
      >
        {{ isTestingApi ? '测试中...' : '测试API连接' }}
      </button>
      <div
        v-if="apiResult"
        class="api-result"
      >
        <pre>{{ apiResult }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore, useThemeStore } from '@/stores'
import { authService } from '@/utils/auth'
import { api } from '@/utils/api'

// 使用stores
const authStore = useAuthStore()
const themeStore = useThemeStore()

// 登录表单
const loginForm = ref({
  username: '',
  password: ''
})

// API测试状态
const isTestingApi = ref(false)
const apiResult = ref('')

// 处理登录
const handleLogin = async () => {
  try {
    await authService.login(loginForm.value)
    // 登录成功后清空表单
    loginForm.value = { username: '', password: '' }
  } catch (error) {
    console.error('登录失败:', error)
    alert('登录失败，请检查用户名和密码')
  }
}

// 处理登出
const handleLogout = async () => {
  try {
    await authService.logout()
  } catch (error) {
    console.error('登出失败:', error)
  }
}

// 处理主题变更
const handleThemeChange = () => {
  themeStore.setTheme(themeStore.currentTheme)
}

// 测试API
const testApi = async () => {
  isTestingApi.value = true
  try {
    const result = await api.get('/health-status')
    apiResult.value = JSON.stringify(result, null, 2)
  } catch (error) {
    apiResult.value = `API测试失败: ${error}`
  } finally {
    isTestingApi.value = false
  }
}
</script>

<style scoped>
.auth-example {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: var(--theme-bg-base);
  color: var(--theme-text-primary);
}

.login-section,
.user-section,
.theme-section,
.api-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid var(--theme-border-base);
  border-radius: 8px;
  background: var(--theme-bg-component);
  box-shadow: var(--theme-shadow-sm);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-section:hover,
.user-section:hover,
.theme-section:hover,
.api-section:hover {
  box-shadow: var(--theme-shadow-md);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: var(--theme-text-primary);
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--theme-border-base);
  border-radius: 6px;
  background: var(--theme-bg-component);
  color: var(--theme-text-primary);
  font-size: 14px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-group input:focus {
  outline: none;
  border-color: var(--theme-brand-primary);
  box-shadow: 0 0 0 3px var(--theme-brand-primary-light);
}

.form-group input::placeholder {
  color: var(--theme-text-tertiary);
}

.login-btn,
.logout-btn {
  background: var(--theme-brand-primary);
  color: var(--theme-text-inverse);
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-btn:hover,
.logout-btn:hover {
  background: var(--theme-brand-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--theme-shadow-md);
}

.login-btn:disabled {
  background: var(--theme-text-disabled);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.logout-btn {
  background: var(--theme-danger);
}

.logout-btn:hover {
  background: var(--theme-danger-hover);
}

.theme-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.theme-controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--theme-border-base);
  border-radius: 6px;
  background: var(--theme-bg-sunken);
  color: var(--theme-text-primary);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-controls label:hover {
  background: var(--theme-bg-hover);
  border-color: var(--theme-brand-primary);
}

.theme-controls input[type="radio"] {
  accent-color: var(--theme-brand-primary);
}

.api-result {
  margin-top: 15px;
  padding: 16px;
  background: var(--theme-bg-sunken);
  border: 1px solid var(--theme-border-base);
  border-radius: 6px;
  font-family: 'Fira Code', Monaco, Consolas, monospace;
  font-size: 12px;
  color: var(--theme-text-secondary);
  overflow-x: auto;
}

.user-info {
  background: var(--theme-bg-sunken);
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.user-info p {
  margin: 8px 0;
  color: var(--theme-text-secondary);
}

.user-info strong {
  color: var(--theme-text-primary);
  font-weight: 600;
}

h2 {
  color: var(--theme-text-primary);
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
}

h3 {
  color: var(--theme-text-primary);
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
}

/* 响应式设计 */
@media (width <= 768px) {
  .auth-example {
    padding: 16px;
    margin: 0 16px;
  }

  .theme-controls {
    flex-direction: column;
  }

  .theme-controls label {
    width: 100%;
  }
}
</style>
