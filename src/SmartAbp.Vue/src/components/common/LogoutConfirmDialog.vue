<template>
  <div
    v-if="visible"
    class="logout-dialog-overlay"
    @click="handleOverlayClick"
  >
    <div
      class="logout-dialog"
      @click.stop
    >
      <div class="dialog-header">
        <i class="fas fa-sign-out-alt dialog-icon" />
        <h3 class="dialog-title">
          确认退出
        </h3>
      </div>

      <div class="dialog-content">
        <p class="dialog-message">
          您确定要退出登录吗？退出后需要重新登录才能访问系统。
        </p>

        <div class="user-info">
          <img
            :src="userAvatar"
            alt="用户头像"
            class="user-avatar"
          >
          <div class="user-details">
            <div class="username">
              {{ userName }}
            </div>
            <div class="user-email">
              {{ userEmail }}
            </div>
          </div>
        </div>
      </div>

      <div class="dialog-actions">
        <button
          class="btn btn-cancel"
          @click="handleCancel"
        >
          <i class="fas fa-times" />
          取消
        </button>
        <button
          class="btn btn-confirm"
          :disabled="isLoading"
          @click="handleConfirm"
        >
          <i
            :class="isLoading ? 'fas fa-spinner fa-spin' : 'fas fa-sign-out-alt'"
          />
          {{ isLoading ? '退出中...' : '确认退出' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores'

interface Props {
  visible: boolean
  isLoading?: boolean
}

interface Emits {
  confirm: []
  cancel: []
  'update:visible': [value: boolean]
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

const emit = defineEmits<Emits>()

const authStore = useAuthStore()

// 计算用户信息
const userName = computed(() => authStore.userInfo?.userName || '用户')
const userEmail = computed(() => authStore.userInfo?.email || '')
const userAvatar = computed(() => '/logo.svg') // 可以根据实际情况修改

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

const handleOverlayClick = () => {
  if (!props.isLoading) {
    handleCancel()
  }
}
</script>

<style scoped>
.logout-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

.logout-dialog {
  background: var(--theme-bg-elevated);
  border-radius: 16px;
  box-shadow: var(--theme-shadow-lg);
  border: 1px solid var(--theme-border-base);
  width: 90%;
  max-width: 420px;
  overflow: hidden;
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--theme-border-light);
}

.dialog-icon {
  font-size: 24px;
  color: var(--theme-warning);
}

.dialog-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--theme-text-primary);
}

.dialog-content {
  padding: 20px 24px;
}

.dialog-message {
  margin: 0 0 20px;
  color: var(--theme-text-secondary);
  line-height: 1.6;
  font-size: 14px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--theme-bg-component);
  border-radius: 12px;
  border: 1px solid var(--theme-border-light);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--theme-border-base);
}

.user-details {
  flex: 1;
}

.username {
  font-weight: 600;
  color: var(--theme-text-primary);
  font-size: 16px;
  margin-bottom: 4px;
}

.user-email {
  color: var(--theme-text-tertiary);
  font-size: 13px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
  justify-content: flex-end;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 100px;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: var(--theme-bg-component);
  color: var(--theme-text-secondary);
  border: 1px solid var(--theme-border-base);
}

.btn-cancel:hover:not(:disabled) {
  background: var(--theme-bg-hover);
  color: var(--theme-text-primary);
  border-color: var(--theme-border-base);
}

.btn-confirm {
  background: var(--theme-danger);
  color: white;
  border: 1px solid var(--theme-danger);
}

.btn-confirm:hover:not(:disabled) {
  background: var(--theme-danger-hover);
  border-color: var(--theme-danger-hover);
  transform: translateY(-1px);
  box-shadow: var(--theme-shadow-sm);
}

.btn-confirm:active:not(:disabled) {
  transform: translateY(0);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .logout-dialog {
    width: 95%;
    margin: 20px;
  }

  .dialog-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
