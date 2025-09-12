<template>
  <div class="profile-view">
    <div class="page-header">
      <h1>个人中心</h1>
      <p>管理您的个人信息和账户设置</p>
    </div>

    <div class="profile-content">
      <div class="profile-card">
        <div class="profile-avatar">
          <div class="avatar-circle">
            <span>{{ userInfo.name?.charAt(0) || 'U' }}</span>
          </div>
          <button class="change-avatar-btn">
            更换头像
          </button>
        </div>

        <div class="profile-info">
          <h2>{{ userInfo.name || '用户' }}</h2>
          <p>{{ userInfo.email || 'user@example.com' }}</p>
          <span class="role-badge">{{ userInfo.role || '普通用户' }}</span>
        </div>
      </div>

      <div class="profile-form">
        <h3>基本信息</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>用户名</label>
            <input
              v-model="editForm.name"
              type="text"
            >
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input
              v-model="editForm.email"
              type="email"
            >
          </div>
          <div class="form-group">
            <label>手机号</label>
            <input
              v-model="editForm.phone"
              type="tel"
            >
          </div>
          <div class="form-group">
            <label>部门</label>
            <input
              v-model="editForm.department"
              type="text"
            >
          </div>
        </div>

        <div class="form-actions">
          <button
            class="btn-primary"
            @click="saveProfile"
          >
            保存更改
          </button>
          <button
            class="btn-secondary"
            @click="resetForm"
          >
            重置
          </button>
        </div>
      </div>

      <div class="security-section">
        <h3>安全设置</h3>
        <div class="security-items">
          <div class="security-item">
            <div class="security-info">
              <h4>修改密码</h4>
              <p>定期更换密码以保护账户安全</p>
            </div>
            <button
              class="btn-outline"
              @click="showChangePassword = true"
            >
              修改密码
            </button>
          </div>

          <div class="security-item">
            <div class="security-info">
              <h4>两步验证</h4>
              <p>启用两步验证增强账户安全性</p>
            </div>
            <button class="btn-outline">
              启用
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码模态框 -->
    <div
      v-if="showChangePassword"
      class="modal-overlay"
      @click="showChangePassword = false"
    >
      <div
        class="modal"
        @click.stop
      >
        <div class="modal-header">
          <h3>修改密码</h3>
          <button @click="showChangePassword = false">
            ×
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>当前密码</label>
            <input
              v-model="passwordForm.current"
              type="password"
            >
          </div>
          <div class="form-group">
            <label>新密码</label>
            <input
              v-model="passwordForm.new"
              type="password"
            >
          </div>
          <div class="form-group">
            <label>确认新密码</label>
            <input
              v-model="passwordForm.confirm"
              type="password"
            >
          </div>
        </div>
        <div class="modal-footer">
          <button
            class="btn-secondary"
            @click="showChangePassword = false"
          >
            取消
          </button>
          <button
            class="btn-primary"
            @click="changePassword"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showChangePassword = ref(false)

const userInfo = ref({
  name: '管理员',
  email: 'admin@smartabp.com',
  phone: '138****8888',
  department: '技术部',
  role: '系统管理员'
})

const editForm = ref({
  name: '',
  email: '',
  phone: '',
  department: ''
})

const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
})

const saveProfile = () => {
  // 保存用户信息
  userInfo.value = { ...userInfo.value, ...editForm.value }
  console.log('保存用户信息:', userInfo.value)
  alert('个人信息已保存')
}

const resetForm = () => {
  editForm.value = {
    name: userInfo.value.name,
    email: userInfo.value.email,
    phone: userInfo.value.phone,
    department: userInfo.value.department
  }
}

const changePassword = () => {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    alert('新密码和确认密码不匹配')
    return
  }

  console.log('修改密码')
  showChangePassword.value = false
  passwordForm.value = { current: '', new: '', confirm: '' }
  alert('密码修改成功')
}

onMounted(() => {
  resetForm()
})
</script>

<style scoped>
.profile-view {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.page-header p {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin: 0;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
}

.profile-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
}

.change-avatar-btn {
  padding: 6px 12px;
  font-size: 12px;
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.change-avatar-btn:hover {
  background: var(--color-primary-light);
}

.profile-info h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.profile-info p {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.role-badge {
  padding: 4px 12px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.profile-form,
.security-section {
  padding: 24px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
}

.profile-form h3,
.security-section h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.form-group input {
  padding: 8px 12px;
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.form-actions {
  display: flex;
  gap: 12px;
}

.btn-primary,
.btn-secondary,
.btn-outline {
  padding: 8px 16px;
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

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-outline:hover {
  background: var(--color-primary-light);
}

.security-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--color-bg-secondary);
  border-radius: 6px;
}

.security-info h4 {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.security-info p {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 400px;
  background: var(--color-bg-primary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgb(0 0 0 / 20%);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--color-border-primary);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.modal-header button {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 20px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.modal-header button:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid var(--color-border-primary);
}

/* 响应式设计 */
@media (width <= 768px) {
  .profile-card {
    flex-direction: column;
    text-align: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .security-item {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>
