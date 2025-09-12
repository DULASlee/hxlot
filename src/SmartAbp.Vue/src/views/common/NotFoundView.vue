<template>
  <div class="not-found-view">
    <div class="not-found-content">
      <div class="error-code">
        404
      </div>
      <h1>页面未找到</h1>
      <p>抱歉，您访问的页面不存在或已被移除。</p>
      <div class="actions">
        <button
          class="btn-primary"
          @click="goHome"
        >
          返回首页
        </button>
        <button
          class="btn-secondary"
          @click="goBack"
        >
          返回上页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: 40px;
  background: transparent;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
  padding: 40px;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
  margin-bottom: 20px;
}

h1 {
  font-size: 32px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

p {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}

.btn-secondary:hover {
  background: var(--color-bg-secondary);
}

@media (width <= 768px) {
  .error-code {
    font-size: 80px;
  }

  h1 {
    font-size: 24px;
  }

  .actions {
    flex-direction: column;
  }
}
</style>
