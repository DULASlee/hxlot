<template>
  <!-- 全屏登录背景 -->
  <div class="enterprise-login-container">
    <!-- 背景装饰 -->
    <div class="login-background">
      <div class="bg-pattern" />
      <div class="bg-overlay" />
    </div>

    <!-- 居中登录框 -->
    <div class="login-wrapper">
      <div class="login-card">
        <!-- 企业Logo和标题 -->
        <div class="login-header">
          <div class="company-logo">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
            >
              <rect
                width="48"
                height="48"
                rx="8"
                fill="#1e3a5f"
              />
              <path
                d="M12 24L18 18L24 24L30 18L36 24"
                stroke="white"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <circle
                cx="24"
                cy="32"
                r="3"
                fill="white"
              />
              <rect
                x="20"
                y="12"
                width="8"
                height="4"
                fill="white"
                opacity="0.8"
              />
            </svg>
          </div>
          <h1 class="system-title">
            SmartAbp 企业管理系统
          </h1>
          <p class="system-subtitle">
            Enterprise Management Platform
          </p>
        </div>

        <!-- 登录表单 -->
        <form
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <!-- 租户输入 -->
          <div class="form-group">
            <label class="form-label">租户名称</label>
            <div class="input-wrapper">
              <input
                v-model="loginForm.tenantName"
                type="text"
                class="form-input"
                placeholder="请输入租户名称（可选）"
                :disabled="loading"
              >
              <div class="input-icon">
                <svg
                  width="18"
                  height="18"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <span class="form-hint">留空使用默认租户</span>
          </div>

          <!-- 用户名输入 -->
          <div class="form-group">
            <label class="form-label">用户名 <span class="required">*</span></label>
            <div class="input-wrapper">
              <input
                v-model="loginForm.username"
                type="text"
                class="form-input"
                :class="{ 'error': usernameError }"
                placeholder="请输入用户名或邮箱地址"
                required
                :disabled="loading"
              >
              <div
                v-if="usernameError"
                class="input-error"
              >
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  />
                </svg>
                <span>{{ usernameError }}</span>
              </div>
              <div class="input-icon">
                <svg
                  width="18"
                  height="18"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- 密码输入 -->
          <div class="form-group">
            <label class="form-label">密码 <span class="required">*</span></label>
            <div class="input-wrapper">
              <input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'error': passwordError }"
                placeholder="请输入登录密码"
                required
                :disabled="loading"
              >
              <div
                v-if="passwordError"
                class="input-error"
              >
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  />
                </svg>
                <span>{{ passwordError }}</span>
              </div>
              <!-- 密码强度指示器 -->
              <div
                v-if="loginForm.password && !passwordError"
                class="password-strength"
              >
                <div
                  class="password-strength-bar"
                  :class="'strength-' + passwordStrength"
                />
              </div>
              <button
                type="button"
                class="password-toggle"
                :disabled="loading"
                @click="showPassword = !showPassword"
              >
                <svg
                  v-if="!showPassword"
                  width="18"
                  height="18"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fill-rule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <svg
                  v-else
                  width="18"
                  height="18"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                  />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 记住我选项 -->
          <div class="form-options">
            <label class="checkbox-wrapper">
              <input
                v-model="loginForm.rememberMe"
                type="checkbox"
                class="checkbox-input"
                :disabled="loading"
              >
              <span class="checkbox-custom" />
              <span class="checkbox-label">记住登录状态</span>
            </label>
            <a
              href="#"
              class="forgot-link"
            >忘记密码？</a>
          </div>

          <!-- 错误提示 -->
          <div
            v-if="errorMessage"
            class="error-alert"
          >
            <svg
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            class="login-submit-btn"
            :disabled="loading || !isFormValid"
          >
            <span
              v-if="loading"
              class="loading-spinner"
            />
            <svg
              v-else
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
              />
            </svg>
            <span>{{ loading ? '正在登录...' : '企业登录' }}</span>
          </button>
        </form>

        <!-- 底部信息 -->
        <div class="login-footer">
          <div class="security-info">
            <svg
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              />
            </svg>
            <span>企业级安全认证</span>
          </div>
          <div class="copyright">
            © 2024 SmartAbp 企业管理系统 | 企业版
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useAuth } from '@/utils/auth'
import { useRouter } from 'vue-router'
import { debounce } from 'lodash-es'

// 响应式数据
const loginForm = ref({
  tenantName: '',
  username: '',
  password: '',
  rememberMe: true
})

const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const router = useRouter()

// 使用认证服务的isAuthenticated状态
const { isAuthenticated, authService } = useAuth()

// 输入验证
const usernameError = ref('')
const passwordError = ref('')

// 自动填充记住的用户名和开发测试账号
onMounted(() => {
  const rememberedUsername = localStorage.getItem('remembered_username')
  if (rememberedUsername) {
    loginForm.value.username = rememberedUsername
    loginForm.value.rememberMe = true
  }

  // 开发环境下自动填充测试账号
  if (import.meta.env.DEV) {
    // 如果没有记住的用户名，则填充测试账号
    if (!rememberedUsername) {
      loginForm.value.username = 'admin'
      loginForm.value.password = '1q2w3E*'
      loginForm.value.rememberMe = true
    }

    // 添加开发提示
    console.log('开发模式：已自动填充测试账号 admin/1q2w3E*')
  }

  // 检查是否已经登录
  if (isAuthenticated.value) {
    const redirect = new URLSearchParams(window.location.search).get('redirect') || '/'
    router.push(redirect)
  }

  // 添加输入验证
  watchEffect(() => {
    usernameError.value = loginForm.value.username.trim() ? '' : '用户名不能为空'
    passwordError.value = loginForm.value.password ? '' : '密码不能为空'
  })
})

// 密码强度检查
const passwordStrength = computed(() => {
  const password = loginForm.value.password
  if (!password) return 0
  let strength = 0
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  return strength
})

// 计算属性
const isFormValid = computed(() => {
  return loginForm.value.username.trim() !== '' && loginForm.value.password.trim() !== ''
})

// 创建防抖配置
const DEBOUNCE_DELAY = 300; // 300ms 延迟

// 登录方法
// 创建防抖的登录处理函数
const handleLogin = debounce(async (e: Event) => {
  if (e) e.preventDefault();
  if (loading.value) return;

  // 重置错误信息
  errorMessage.value = '';
  usernameError.value = '';
  passwordError.value = '';

  // 表单验证
  let hasError = false;

  if (!loginForm.value.username.trim()) {
    usernameError.value = '请输入用户名';
    hasError = true;
  } else if (loginForm.value.username.length < 3) {
    usernameError.value = '用户名长度不能少于3个字符';
    hasError = true;
  }

  if (!loginForm.value.password) {
    passwordError.value = '请输入密码';
    hasError = true;
  } else if (loginForm.value.password.length < 6) {
    passwordError.value = '密码长度不能少于6个字符';
    hasError = true;
  }

  if (hasError) {
    const form = document.querySelector('.login-form');
    if (form) {
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 500);
    }
    return;
  }

  loading.value = true;

  try {
    // 创建登录参数
    const username = loginForm.value.username.trim();
    const password = loginForm.value.password;
    const tenantName = loginForm.value.tenantName.trim() || undefined;

    const success = await authService.login(username, password, tenantName);

    if (success) {
      // 如果选择了记住我，保存用户名
      if (loginForm.value.rememberMe) {
        localStorage.setItem('remembered_username', username);
      } else {
        localStorage.removeItem('remembered_username');
      }

      // 获取重定向URL
      const redirect = new URLSearchParams(window.location.search).get('redirect') || '/';

      // 发出登录成功事件
      emit('login-success', {
        username: loginForm.value.username,
        tenantName: loginForm.value.tenantName,
        rememberMe: loginForm.value.rememberMe
      });

      // 使用路由导航
      await router.push(redirect);
    }
  } catch (error: any) {
    // 处理不同类型的错误
    if (error.name === 'NetworkError') {
      errorMessage.value = '网络连接失败，请检查网络设置';
    } else if (error.status === 401) {
      errorMessage.value = '用户名或密码错误';
    } else if (error.status === 403) {
      errorMessage.value = '账户已被锁定，请联系管理员';
    } else if (error.message?.includes('tenant')) {
      errorMessage.value = '租户信息无效';
    } else {
      errorMessage.value = '登录失败，请稍后重试';
    }

    console.error('登录错误:', error);

    // 清除密码
    loginForm.value.password = '';

    // 添加震动效果
    const form = document.querySelector('.login-form');
    if (form) {
      form.classList.add('shake');
      setTimeout(() => {
        form.classList.remove('shake');
      }, 500);
    }
  } finally {
    loading.value = false;
  }
}, DEBOUNCE_DELAY);

// 事件
const emit = defineEmits<{
  (e: 'login-success', data: { username: string; tenantName: string; rememberMe: boolean }): void;
}>();

// 生命周期
onMounted(() => {
  if (isAuthenticated.value) {
    emit('login-success', {
      username: loginForm.value.username,
      tenantName: loginForm.value.tenantName,
      rememberMe: loginForm.value.rememberMe
    })
  }
})
</script>

<style scoped>
/* 全屏登录容器 */
.enterprise-login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 背景设计 */
.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f1419 0%, #1e3a5f 25%, #2a4d7a 50%, #1e3a5f 75%, #152841 100%);
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
    linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.02) 50%, transparent 60%);
  background-size: 400px 400px, 300px 300px, 200px 200px;
  animation: backgroundMove 20s ease-in-out infinite;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
}

@keyframes backgroundMove {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(-20px, -20px) rotate(1deg); }
  66% { transform: translate(20px, -10px) rotate(-1deg); }
}

/* 登录框容器 */
.login-wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 480px;
  padding: 20px;
}

/* 登录卡片 */
.login-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  padding: 48px 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.company-logo {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

.system-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.system-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 表单样式 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: #dc2626;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 16px 48px 16px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
  background: #ffffff;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #1e3a5f;
  box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
}

.form-input:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.input-icon {
  position: absolute;
  right: 16px;
  color: #9ca3af;
  pointer-events: none;
}

.password-toggle {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.password-toggle:hover {
  color: #1e3a5f;
  background: #f3f4f6;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.form-hint {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background: #1e3a5f;
  border-color: #1e3a5f;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 6px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.forgot-link {
  font-size: 14px;
  color: #1e3a5f;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: #2a4d7a;
}

/* 错误提示 */
.error-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
}

/* 登录按钮 */
.login-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 18px 24px;
  background: linear-gradient(135deg, #1e3a5f 0%, #2a4d7a 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(30, 58, 95, 0.3);
}

.login-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(30, 58, 95, 0.4);
  background: linear-gradient(135deg, #2a4d7a 0%, #3d6195 100%);
}

.login-submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 12px rgba(30, 58, 95, 0.2);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 底部信息 */
.login-footer {
  margin-top: 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.security-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: #059669;
  font-weight: 600;
}

.copyright {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .login-wrapper {
    padding: 16px;
  }

  .login-card {
    padding: 32px 24px;
  }

  .system-title {
    font-size: 24px;
  }

  .form-options {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px 20px;
  }

  .system-title {
    font-size: 22px;
  }
}
</style>
