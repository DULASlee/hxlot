<template>
  <div class="users-view">
    <div class="page-header">
      <h1>用户管理</h1>
      <p>管理系统用户账户和权限</p>
    </div>

    <div class="page-content">
      <div class="toolbar">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索用户..."
            class="search-input"
          >
        </div>
        <button
          class="btn-primary"
          @click="showAddUser = true"
        >
          <svg viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          添加用户
        </button>
      </div>

      <div class="users-table">
        <table>
          <thead>
            <tr>
              <th>用户名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
            >
              <td>
                <div class="user-info">
                  <div class="user-avatar">
                    {{ user.name.charAt(0) }}
                  </div>
                  <span>{{ user.name }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span
                  class="role-tag"
                  :class="user.role"
                >{{ user.role }}</span>
              </td>
              <td>
                <span
                  class="status-tag"
                  :class="user.status"
                >
                  {{ user.status === 'active' ? '活跃' : '禁用' }}
                </span>
              </td>
              <td>{{ user.createdAt }}</td>
              <td>
                <div class="actions">
                  <button
                    class="btn-sm"
                    @click="editUser(user)"
                  >
                    编辑
                  </button>
                  <button
                    class="btn-sm danger"
                    @click="deleteUser(user)"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 添加用户模态框 -->
    <div
      v-if="showAddUser"
      class="modal-overlay"
      @click="showAddUser = false"
    >
      <div
        class="modal"
        @click.stop
      >
        <div class="modal-header">
          <h3>添加用户</h3>
          <button @click="showAddUser = false">
            ×
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>用户名</label>
            <input
              v-model="newUser.name"
              type="text"
            >
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input
              v-model="newUser.email"
              type="email"
            >
          </div>
          <div class="form-group">
            <label>角色</label>
            <select v-model="newUser.role">
              <option value="admin">
                管理员
              </option>
              <option value="user">
                普通用户
              </option>
              <option value="guest">
                访客
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button
            class="btn-secondary"
            @click="showAddUser = false"
          >
            取消
          </button>
          <button
            class="btn-primary"
            @click="addUser"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

const searchQuery = ref('')
const showAddUser = ref(false)
const newUser = ref({
  name: '',
  email: '',
  role: 'user'
})

const users = ref<User[]>([
  {
    id: 1,
    name: '管理员',
    email: 'admin@smartabp.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-15'
  },
  {
    id: 3,
    name: '李四',
    email: 'lisi@example.com',
    role: 'user',
    status: 'inactive',
    createdAt: '2024-02-01'
  }
])

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  return users.value.filter(user =>
    user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const addUser = () => {
  const user: User = {
    id: Date.now(),
    name: newUser.value.name,
    email: newUser.value.email,
    role: newUser.value.role,
    status: 'active',
    createdAt: new Date().toISOString().split('T')[0]
  }
  users.value.push(user)
  showAddUser.value = false
  newUser.value = { name: '', email: '', role: 'user' }
}

const editUser = (user: User) => {
  console.log('编辑用户:', user)
}

const deleteUser = (user: User) => {
  if (confirm(`确定要删除用户 ${user.name} 吗？`)) {
    const index = users.value.findIndex(u => u.id === user.id)
    if (index > -1) {
      users.value.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.users-view {
  max-width: 1200px;
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

.page-content {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--color-border-primary);
}

.search-box {
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-primary svg {
  width: 16px;
  height: 16px;
  fill: currentcolor;
}

.users-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 20px;
  text-align: left;
  border-bottom: 1px solid var(--color-border-primary);
}

th {
  background: var(--color-bg-secondary);
  font-weight: 600;
  color: var(--color-text-primary);
}

td {
  color: var(--color-text-secondary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.role-tag, .status-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.role-tag.admin {
  background: var(--color-error-50);
  color: var(--color-error-500);
}

.role-tag.user {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.role-tag.guest {
  background: var(--color-gray-100);
  color: var(--color-gray-600);
}

.status-tag.active {
  background: var(--color-success-50);
  color: var(--color-success-500);
}

.status-tag.inactive {
  background: var(--color-gray-100);
  color: var(--color-gray-600);
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-sm:hover {
  background: var(--color-bg-secondary);
}

.btn-sm.danger {
  color: var(--color-error-500);
  border-color: var(--color-error-500);
}

.btn-sm.danger:hover {
  background: var(--color-error-50);
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
  max-width: 500px;
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

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid var(--color-border-primary);
}

.btn-secondary {
  padding: 8px 16px;
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--color-bg-secondary);
}

/* 响应式设计 */
@media (width <= 768px) {
  .toolbar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .users-table {
    font-size: 14px;
  }

  th, td {
    padding: 8px 12px;
  }
}
</style>
