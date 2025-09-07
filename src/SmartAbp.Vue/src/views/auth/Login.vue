<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <img src="/logo.svg" alt="SmartAbp Logo" class="logo-img" />
            <h1 class="system-title">SmartAbp 企业管理系统</h1>
          </div>
          <p class="login-subtitle">欢迎登录系统</p>
        </div>

        <LoginForm />

        <div class="login-footer">
          <p>&copy; 2024 SmartAbp 企业管理系统. 保留所有权利.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '@/components/auth/LoginForm.vue'
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-wrapper {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  text-align: center;
}

.login-header {
  margin-bottom: 30px;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.logo-img {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.system-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.login-subtitle {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}

.login-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.login-footer p {
  color: #9ca3af;
  font-size: 14px;
  margin: 0;
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }

  .system-title {
    font-size: 20px;
  }
}
</style>
