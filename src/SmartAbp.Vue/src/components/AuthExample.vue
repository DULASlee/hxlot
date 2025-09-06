<template>
  <div class="auth-example">
    <h2>认证状态示例</h2>

    <!-- 未登录状态 -->
    <div v-if="!authStore.isAuthenticated" class="login-section">
      <h3>用户登录</h3>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>用户名:</label>
          <input
            v-model="loginForm.username"
            type="text"
            required
            placeholder="请输入用户名"
          />
        </div>
        <div class="form-group">
          <label>密码:</label>
          <input
            v-model="loginForm.password"
            type="password"
            required
            placeholder="请输入密码"
          />
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
    <div v-else class="user-section">
      <h3>用户信息</h3>
      <div v-if="authStore.userInfo" class="user-info">
        <p><strong>用户ID:</strong> {{ authStore.userInfo.id }}</p>
        <p><strong>用户名:</strong> {{ authStore.userInfo.username }}</p>
        <p><strong>邮箱:</strong> {{ authStore.userInfo.email }}</p>
        <p><strong>角色:</strong> {{ authStore.userInfo.roles.join(', ') }}</p>
      </div>
      <button @click="handleLogout" class="logout-btn">
        登出
      </button>
    </div>

    <!-- 主题切换 -->
    <div class="theme-section">
      <h3>主题设置</h3>
      <div class="theme-controls">
        <label>
          <input
            type="radio"
            value="light"
            v-model="themeStore.currentTheme"
            @change="handleThemeChange"
          />
          浅色主题
        </label>
        <label>
          <input
            type="radio"
            value="dark"
            v-model="themeStore.currentTheme"
            @change="handleThemeChange"
          />
          深色主题
        </label>
        <label>
          <input
            type="radio"
            value="auto"
            v-model="themeStore.currentTheme"
            @change="handleThemeChange"
          />
          跟随系统
        </label>
      </div>
      <p>当前主题: {{ themeStore.currentTheme }}</p>
    </div>

    <!-- API测试 -->
    <div class="api-section">
      <h3>API测试</h3>
      <button @click="testApi" :disabled="isTestingApi">
        {{ isTestingApi ? '测试中...' : '测试API连接' }}
      </button>
      <div v-if="apiResult" class="api-result">
        <pre>{{ apiResult }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore, useThemeStore } from '../stores'
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
}

.login-section,
.user-section,
.theme-section,
.api-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.login-btn,
.logout-btn {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.login-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.logout-btn {
  background-color: #dc3545;
}

.theme-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.theme-controls label {
  display: flex;
  align-items: center;
  gap: 5px;
}

.api-result {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}

.user-info p {
  margin: 5px 0;
}

/* 深色主题样式 */
:global(.dark) .auth-example {
  color: #fff;
}

:global(.dark) .login-section,
:global(.dark) .user-section,
:global(.dark) .theme-section,
:global(.dark) .api-section {
  border-color: #555;
  background-color: #2d2d2d;
}

:global(.dark) .form-group input {
  background-color: #444;
  border-color: #555;
  color: #fff;
}

:global(.dark) .api-result {
  background-color: #444;
  color: #fff;
}
</style>
