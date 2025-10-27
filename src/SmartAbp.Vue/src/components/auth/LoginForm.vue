<template>
  <div class="login-form-container">
    <!-- 登录表单 -->
    <form class="login-form" @submit.prevent="handleLogin">
      <!-- 租户名称 -->
      <SmartInput v-model="loginForm.tenantName" label="租户名称" placeholder="请输入租户名称（可选）" :disabled="loading"
        help-text="留空使用默认租户">
        <template #iconLeft>
          <SmartIcon icon="carbon:enterprise" :size="18" />
        </template>
      </SmartInput>

      <!-- 用户名 -->
      <SmartInput v-model="loginForm.username" label="用户名" placeholder="请输入用户名或邮箱地址" required :disabled="loading"
        :error="touched.username ? usernameError : ''" @blur="handleUsernameBlur">
        <template #iconLeft>
          <SmartIcon icon="carbon:user" :size="18" />
        </template>
      </SmartInput>

      <!-- 密码 -->
      <SmartInput v-model="loginForm.password" :type="showPassword ? 'text' : 'password'" label="密码"
        placeholder="请输入登录密码" required :disabled="loading" :error="touched.password ? passwordError : ''"
        @blur="handlePasswordBlur">
        <template #iconLeft>
          <SmartIcon icon="carbon:locked" :size="18" />
        </template>
        <template #iconRight>
          <button type="button" class="password-toggle" :disabled="loading" @click="showPassword = !showPassword">
            <SmartIcon :icon="showPassword ? 'carbon:view-off' : 'carbon:view'" :size="18"
              color="var(--color-text-secondary)" />
          </button>
        </template>
      </SmartInput>

      <!-- 密码强度指示器 -->
      <div v-if="loginForm.password && !(touched.password && passwordError)" class="password-strength-wrapper">
        <div class="password-strength-label">密码强度:</div>
        <div class="password-strength-bars">
          <div v-for="i in 5" :key="i" class="strength-bar" :class="{
            active: i <= passwordStrength,
            weak: i <= passwordStrength && passwordStrength <= 2,
            medium: i <= passwordStrength && passwordStrength === 3,
            strong: i <= passwordStrength && passwordStrength >= 4,
          }" />
        </div>
        <div class="password-strength-text">
          {{ passwordStrengthText }}
        </div>
      </div>

      <!-- 记住我 & 忘记密码 -->
      <div class="form-options">
        <label class="remember-me">
          <input v-model="loginForm.rememberMe" type="checkbox" class="checkbox-input" :disabled="loading">
          <span class="checkbox-custom" />
          <span class="checkbox-label">记住登录状态</span>
        </label>
        <a href="#" class="forgot-link">忘记密码？</a>
      </div>

      <!-- 错误提示 -->
      <transition name="slide-down">
        <div v-if="errorMessage" class="error-alert" role="alert">
          <SmartIcon icon="carbon:warning-alt" :size="20" color="var(--color-error-500)" />
          <span>{{ errorMessage }}</span>
        </div>
      </transition>

      <!-- 登录按钮 -->
      <SmartButton type="submit" variant="primary" size="md" block :loading="loading" :disabled="!isFormValid">
        <template #icon>
          <SmartIcon icon="carbon:login" :size="18" />
        </template>
        {{ loading ? '正在登录...' : '企业登录' }}
      </SmartButton>
    </form>

    <!-- 底部信息 -->
    <div class="login-footer">
      <div class="test-accounts">
        admin / 1q2w3E* | admin666 / 1q2w#E*
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SmartButton, SmartIcon, SmartInput } from '@/components/design-system'
import { useAuthStore } from '@/stores'
import { debounce } from 'lodash-es'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 事件定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const emit = defineEmits<{
  'login-success': [data: { username: string; tenantName: string; rememberMe: boolean }]
}>()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 响应式状态
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const router = useRouter()
const authStore = useAuthStore()

const loginForm = ref({
  tenantName: '',
  username: '',
  password: '',
  rememberMe: true,
})

const showPassword = ref(false)
const errorMessage = ref('')
const usernameError = ref('')
const passwordError = ref('')

// 跟踪字段是否已被触摸（用户交互过）
const touched = ref({
  username: false,
  password: false,
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 计算属性
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const loading = computed(() => authStore.isLoading)
const isAuthenticated = computed(() => authStore.isAuthenticated)

const isFormValid = computed(() => {
  return (
    loginForm.value.username.trim() !== ''
    && loginForm.value.password.trim() !== ''
    && !usernameError.value
    && !passwordError.value
  )
})

// 密码强度（0-5）
const passwordStrength = computed(() => {
  const password = loginForm.value.password
  if (!password)
    return 0
  let strength = 0
  if (password.length >= 8)
    strength++
  if (/[A-Z]/.test(password))
    strength++
  if (/[a-z]/.test(password))
    strength++
  if (/[0-9]/.test(password))
    strength++
  if (/[^A-Za-z0-9]/.test(password))
    strength++
  return strength
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 2)
    return '弱'
  if (strength === 3)
    return '中等'
  return '强'
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 表单验证方法
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function validateUsername() {
  const username = loginForm.value.username.trim()
  if (!username) {
    usernameError.value = '请输入用户名'
    return false
  }
  if (username.length < 3) {
    usernameError.value = '用户名长度不能少于3个字符'
    return false
  }
  usernameError.value = ''
  return true
}

function validatePassword() {
  const password = loginForm.value.password
  if (!password) {
    passwordError.value = '请输入密码'
    return false
  }
  if (password.length < 6) {
    passwordError.value = '密码长度不能少于6个字符'
    return false
  }
  passwordError.value = ''
  return true
}

// 失焦处理（标记为已触摸并验证）
function handleUsernameBlur() {
  touched.value.username = true
  validateUsername()
}

function handlePasswordBlur() {
  touched.value.password = true
  validatePassword()
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 登录处理（防抖）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DEBOUNCE_DELAY = 300

const handleLogin = debounce(async (e: Event) => {
  if (e)
    e.preventDefault()
  if (loading.value)
    return

  // 标记所有字段为已触摸（提交时显示所有验证错误）
  touched.value.username = true
  touched.value.password = true

  // 重置错误信息
  errorMessage.value = ''
  usernameError.value = ''
  passwordError.value = ''

  // 表单验证
  const isUsernameValid = validateUsername()
  const isPasswordValid = validatePassword()

  if (!isUsernameValid || !isPasswordValid) {
    const form = document.querySelector('.login-form')
    if (form) {
      form.classList.add('shake')
      setTimeout(() => form.classList.remove('shake'), 500)
    }
    return
  }

  try {
    const success = await authStore.login({
      username: loginForm.value.username.trim(),
      password: loginForm.value.password,
      tenantName: loginForm.value.tenantName.trim() || undefined,
    })

    if (success) {
      // 如果选择了记住我，保存用户名
      if (loginForm.value.rememberMe) {
        localStorage.setItem('remembered_username', loginForm.value.username)
      }
      else {
        localStorage.removeItem('remembered_username')
      }

      // 获取重定向URL
      const redirect = new URLSearchParams(window.location.search).get('redirect') || '/'

      // 发出登录成功事件
      emit('login-success', {
        username: loginForm.value.username,
        tenantName: loginForm.value.tenantName,
        rememberMe: loginForm.value.rememberMe,
      })

      // 使用路由导航
      await router.push(redirect)
    }
  }
  catch (error: any) {
    // 处理不同类型的错误
    if (error.name === 'NetworkError') {
      errorMessage.value = '网络连接失败，请检查网络设置'
    }
    else if (error.message?.includes('用户名或邮箱不存在')) {
      errorMessage.value = '用户名或邮箱不存在'
    }
    else if (error.message?.includes('密码错误')) {
      errorMessage.value = '密码错误'
    }
    else if (error.message?.includes('用户已被禁用')) {
      errorMessage.value = '用户已被禁用，请联系管理员'
    }
    else if (error.message?.includes('邮箱地址未确认')) {
      errorMessage.value = '邮箱地址未确认，请检查邮箱'
    }
    else if (error.message?.includes('未获取到认证token')) {
      errorMessage.value = '登录成功但系统异常，请稍后重试'
    }
    else if (error.message?.includes('网络连接失败')) {
      errorMessage.value = '网络连接失败，请检查网络设置'
    }
    else if (error.message) {
      errorMessage.value = error.message
    }
    else {
      errorMessage.value = '登录失败，请稍后重试'
    }

    console.error('登录错误:', error)

    // 清除密码
    loginForm.value.password = ''

    // 添加震动效果
    const form = document.querySelector('.login-form')
    if (form) {
      form.classList.add('shake')
      setTimeout(() => {
        form.classList.remove('shake')
      }, 500)
    }
  }
}, DEBOUNCE_DELAY)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 生命周期钩子
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

onMounted(() => {
  // 自动填充记住的用户名
  const rememberedUsername = localStorage.getItem('remembered_username')
  if (rememberedUsername) {
    loginForm.value.username = rememberedUsername
    loginForm.value.rememberMe = true
  }

  // 开发环境下自动填充测试账号
  if (import.meta.env.DEV) {
    if (!rememberedUsername) {
      loginForm.value.username = 'admin'
      loginForm.value.password = '1q2w3E*'
      loginForm.value.rememberMe = true
    }
    console.log('开发模式：已自动填充测试账号 admin/1q2w3E*')
  }

  // 检查是否已经登录
  if (isAuthenticated.value) {
    const redirect = new URLSearchParams(window.location.search).get('redirect') || '/'
    router.push(redirect)
  }
})

// 实时验证（输入时）
watchEffect(() => {
  if (loginForm.value.username.trim()) {
    usernameError.value = ''
  }
  if (loginForm.value.password) {
    passwordError.value = ''
  }
})
</script>

<style scoped>
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   登录表单容器（使用设计令牌系统）
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

.login-form-container {
  display: flex;
  flex-direction: column;
  gap: 1.2vh;
}

/* 表单 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.2vh;
}

/* 密码切换按钮 */
.password-toggle {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: opacity var(--duration-base) var(--ease);
}

.password-toggle:hover {
  opacity: 0.7;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* 密码强度指示器 */
.password-strength-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-top: calc(var(--spacing-5) * -1 + var(--spacing-2));
}

.password-strength-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.password-strength-bars {
  display: flex;
  gap: var(--spacing-1);
  flex: 1;
}

.strength-bar {
  height: 5px;
  flex: 1;
  background: var(--color-bg-tertiary);
  border-radius: 3px;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.strength-bar.active.weak {
  background: linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%);
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.3);
  animation: strengthPulse 1.5s ease-in-out infinite;
}

.strength-bar.active.medium {
  background: linear-gradient(90deg, #faad14 0%, #ffc53d 100%);
  box-shadow: 0 2px 8px rgba(250, 173, 20, 0.3);
}

.strength-bar.active.strong {
  background: linear-gradient(90deg, #52c41a 0%, #73d13d 100%);
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.3);
}

.strength-bar.active::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmerStrength 2s infinite;
}

@keyframes shimmerStrength {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

@keyframes strengthPulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.password-strength-text {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.password-strength-wrapper:has(.strength-bar.active.weak) .password-strength-text {
  color: var(--color-error-500);
}

.password-strength-wrapper:has(.strength-bar.active.medium) .password-strength-text {
  color: var(--color-warning-500);
}

.password-strength-wrapper:has(.strength-bar.active.strong) .password-strength-text {
  color: var(--color-success-500);
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5vh 0;
}

/* 记住我复选框 */
.remember-me {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.checkbox-custom {
  position: relative;
  width: 18px;
  height: 18px;
  border: 2px solid var(--theme-border-base);
  border-radius: 4px;
  background: var(--theme-bg-component);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.checkbox-input:checked+.checkbox-custom {
  background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%);
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(0, 102, 255, 0.3);
  transform: scale(1.05);
}

.checkbox-input:checked+.checkbox-custom::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 5px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-input:focus+.checkbox-custom {
  box-shadow: 0 0 0 3px rgb(var(--theme-brand-primary) / 10%);
}

.checkbox-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--theme-text-primary);
}

/* 忘记密码链接 */
.forgot-link {
  font-size: 14px;
  color: var(--theme-brand-primary);
  text-decoration: none;
  font-weight: 600;
  transition: all var(--duration-base) var(--ease);
  position: relative;
}

.forgot-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--theme-brand-primary);
  transition: width var(--duration-base) var(--ease);
}

.forgot-link:hover {
  color: var(--theme-brand-primary-hover);
}

.forgot-link:hover::after {
  width: 100%;
}

/* 错误提示 */
.error-alert {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: var(--color-error-50);
  border: 1px solid var(--color-error-200);
  border-radius: var(--spacing-2);
  color: var(--color-error-700);
  font-size: 14px;
  font-weight: 500;
}

/* 过渡动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--duration-base) var(--ease);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 表单震动效果 */
@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-8px);
  }

  20%,
  40%,
  60%,
  80% {
    transform: translateX(8px);
  }
}

.login-form.shake {
  animation: shake 0.5s var(--ease);
}

/* 底部信息 */
.login-footer {
  text-align: center;
  margin-top: 1vh;
}

.test-accounts {
  font-size: max(10px, 1.3vh);
  color: var(--color-text-tertiary);
  font-family: 'Courier New', monospace;
}

/* 响应式设计 */
@media (width <=640px) {
  .form-options {
    flex-direction: column;
    gap: var(--spacing-4);
    align-items: flex-start;
  }
}
</style>
