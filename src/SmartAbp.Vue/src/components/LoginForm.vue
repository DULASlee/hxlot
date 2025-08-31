<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-header">
        <h2>SmartAbp 企业登录</h2>
        <p>请输入您的登录凭据</p>
      </div>

      <form @submit.prevent="handleLogin" class="form">
        <!-- 租户选择 -->
        <div class="form-group">
          <label for="tenantName">租户</label>
          <input
            id="tenantName"
            v-model="loginForm.tenantName"
            type="text"
            placeholder="请输入租户名称（可选）"
            :disabled="loading"
          />
          <small class="form-hint">留空表示使用主机租户</small>
        </div>

        <!-- 用户名 -->
        <div class="form-group">
          <label for="username">用户名 *</label>
          <input
            id="username"
            v-model="loginForm.username"
            type="text"
            placeholder="请输入用户名或邮箱"
            required
            :disabled="loading"
          />
        </div>

        <!-- 密码 -->
        <div class="form-group">
          <label for="password">密码 *</label>
          <div class="password-input">
            <input
              id="password"
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              required
              :disabled="loading"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :disabled="loading"
            >
              {{ showPassword ? '隐藏' : '显示' }}
            </button>
          </div>
        </div>

        <!-- 记住我 -->
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input
              v-model="loginForm.rememberMe"
              type="checkbox"
              :disabled="loading"
            />
            <span class="checkmark"></span>
            记住我
          </label>
        </div>

        <!-- 错误信息 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- 登录按钮 -->
        <button
          type="submit"
          class="login-button"
          :disabled="loading || !isFormValid"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <!-- 其他选项 -->
      <div class="login-footer">
        <a href="#" class="forgot-password">忘记密码？</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../utils/auth'

// 响应式数据
const loginForm = ref({
  tenantName: '',
  username: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

// 使用认证服务
const { authService, isAuthenticated } = useAuth()

// 计算属性
const isFormValid = computed(() => {
  return loginForm.value.username.trim() !== '' && loginForm.value.password.trim() !== ''
})

// 方法
const handleLogin = async () => {
  if (!isFormValid.value || loading.value) {
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const success = await authService.login(
      loginForm.value.username.trim(),
      loginForm.value.password,
      loginForm.value.tenantName.trim() || undefined
    )

    if (success) {
      // 登录成功，触发事件
      emit('loginSuccess')
    }
  } catch (error: any) {
    errorMessage.value = error.message || '登录失败，请检查您的凭据'
    console.error('登录错误:', error)
  } finally {
    loading.value = false
  }
}

const clearError = () => {
  errorMessage.value = ''
}

// 事件
const emit = defineEmits<{
  loginSuccess: []
}>()

// 生命周期
onMounted(() => {
  // 如果已经登录，触发成功事件
  if (isAuthenticated.value) {
    emit('loginSuccess')
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  width: 100%;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
  min-width: 320px;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .login-card {
    max-width: 500px;
    padding: 50px;
  }
}

@media (min-width: 1200px) {
  .login-card {
    max-width: 550px;
    padding: 60px;
  }
}

@media (min-width: 1600px) {
  .login-card {
    max-width: 600px;
    padding: 70px;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #333;
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.login-header p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 6px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-group input[type="text"],
.form-group input[type="password"] {
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input[type="text"]:focus,
.form-group input[type="password"]:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-hint {
  margin-top: 4px;
  color: #888;
  font-size: 12px;
}

.password-input {
  position: relative;
  display: flex;
}

.password-input input {
  flex: 1;
  padding-right: 60px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
}

.password-toggle:hover {
  color: #5a6fd8;
}

.password-toggle:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #fcc;
  font-size: 14px;
  text-align: center;
}

.login-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.login-footer {
  text-align: center;
  margin-top: 20px;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
}

.forgot-password:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 10px;
  }

  .login-form {
    padding: 30px 20px;
  }

  .login-header h2 {
    font-size: 24px;
  }
}
</style>
