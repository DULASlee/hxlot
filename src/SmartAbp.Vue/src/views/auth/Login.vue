<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="login-bg-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-wrapper">
      <div class="login-card">
        <!-- Logo和标题区 -->
        <div class="login-header">
          <div class="logo">
            <h1 class="system-title">SmartAbp 企业管理系统</h1>
          </div>
          <p class="login-subtitle">欢迎登录系统</p>
        </div>

        <!-- 登录表单 -->
        <LoginForm />

        <!-- 页脚 -->
        <div class="login-footer">
          <p class="copyright">&copy; 2024 SmartAbp 企业管理系统. 保留所有权利.</p>
          <div class="footer-links">
            <a href="#" class="footer-link">使用条款</a>
            <span class="separator">·</span>
            <a href="#" class="footer-link">隐私政策</a>
            <span class="separator">·</span>
            <a href="#" class="footer-link">帮助中心</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '@/components/auth/LoginForm.vue';
</script>

<style scoped>
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   登录页容器（使用设计令牌系统）
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

.login-container {
  position: relative;
  display: flex;
  height: 100vh;
  width: 100vw;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg,
      #0066ff 0%,
      #0052cc 50%,
      #003d99 100%);
  padding: 2vh 2vw;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {

  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

.login-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 70% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}

/* 背景装饰圆圈 */
.login-bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.05));
  filter: blur(40px);
  animation: float 20s ease-in-out infinite;
}

.circle-1 {
  top: 5%;
  left: 5%;
  width: 400px;
  height: 400px;
  animation-delay: 0s;
}

.circle-2 {
  top: 50%;
  right: 5%;
  width: 350px;
  height: 350px;
  animation-delay: 7s;
}

.circle-3 {
  bottom: 5%;
  left: 40%;
  width: 300px;
  height: 300px;
  animation-delay: 14s;
}

@keyframes float {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.6;
  }

  33% {
    transform: translate(30px, -30px) scale(1.1);
    opacity: 0.8;
  }

  66% {
    transform: translate(-20px, 20px) scale(0.95);
    opacity: 0.7;
  }
}

/* 登录卡片容器 */
.login-wrapper {
  position: relative;
  z-index: 1;
  width: 90vw;
  max-width: 420px;
  max-height: 96vh;
}

/* 登录卡片 */
.login-card {
  padding: 3vh 4vw;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.3),
    0 10px 30px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px) saturate(180%);
  animation: slideIn var(--duration-slow) var(--ease-out);
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Logo和标题区 */
.login-header {
  margin-bottom: 2vh;
  text-align: center;
}

.logo {
  margin-bottom: 1.5vh;
}

.system-title {
  margin: 0;
  font-size: max(22px, 3vh);
  font-weight: 700;
  line-height: 1.2;
  background: linear-gradient(135deg, #0066ff 0%, #0052cc 50%, #003d99 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(0, 102, 255, 0.1);
  animation: titleGlow 3s ease-in-out infinite;
}

@keyframes titleGlow {

  0%,
  100% {
    filter: brightness(1);
  }

  50% {
    filter: brightness(1.2);
  }
}

.login-subtitle {
  margin: 0;
  font-size: max(14px, 1.8vh);
  line-height: 1.5;
  color: var(--color-text-secondary);
}

/* 页脚 */
.login-footer {
  margin-top: 1.5vh;
  padding-top: 1.2vh;
  border-top: 1px solid var(--color-border-secondary);
  text-align: center;
}

.copyright {
  margin: 0 0 0.8vh;
  font-size: max(11px, 1.4vh);
  color: var(--color-text-tertiary);
}

.footer-links {
  display: flex;
  gap: 1.2vw;
  align-items: center;
  justify-content: center;
  font-size: max(10px, 1.3vh);
}

.footer-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--duration-base) var(--ease);
}

.footer-link:hover {
  color: var(--color-primary-500);
}

.separator {
  color: var(--color-text-tertiary);
}

/* 响应式设计 */
@media (width <=640px) {
  .decoration-circle {
    display: none;
  }

  .login-card {
    padding: 2.5vh 3vw;
  }
}

@media (height <=600px) {
  .login-card {
    padding: 2vh 3vw;
  }

  .login-header {
    margin-bottom: 1vh;
  }

  .login-footer {
    margin-top: 1vh;
    padding-top: 1vh;
  }
}

/* 暗色模式支持 */
[data-theme='dark'] .login-card {
  background: rgba(31, 41, 55, 0.95);
  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.5),
    0 10px 30px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

[data-theme='dark'] .system-title {
  background: linear-gradient(135deg, #4096ff 0%, #69b1ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
