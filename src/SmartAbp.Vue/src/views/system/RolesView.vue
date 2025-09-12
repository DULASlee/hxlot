<template>
  <div class="roles-view">
    <div class="page-header">
      <h1>角色管理</h1>
      <p>管理系统角色和权限分配</p>
    </div>

    <div class="page-content">
      <div class="toolbar">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索角色..."
            class="search-input"
          >
        </div>
        <button
          class="btn-primary"
          @click="showAddRole = true"
        >
          <svg viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          添加角色
        </button>
      </div>

      <div class="roles-table">
        <table>
          <thead>
            <tr>
              <th>角色名称</th>
              <th>描述</th>
              <th>用户数量</th>
              <th>权限数量</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="role in filteredRoles"
              :key="role.id"
            >
              <td>
                <div class="role-info">
                  <div class="role-icon">
                    {{ role.name.charAt(0) }}
                  </div>
                  <span>{{ role.name }}</span>
                </div>
              </td>
              <td>{{ role.description }}</td>
              <td>
                <span class="user-count">{{ role.userCount }}</span>
              </td>
              <td>
                <span class="permission-count">{{ role.permissions.length }}</span>
              </td>
              <td>{{ role.createdAt }}</td>
              <td>
                <div class="actions">
                  <button
                    class="btn-sm"
                    @click="editRole(role)"
                  >
                    编辑
                  </button>
                  <button
                    class="btn-sm"
                    @click="viewPermissions(role)"
                  >
                    权限
                  </button>
                  <button
                    class="btn-sm danger"
                    @click="deleteRole(role)"
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

    <!-- 添加角色模态框 -->
    <div
      v-if="showAddRole"
      class="modal-overlay"
      @click="showAddRole = false"
    >
      <div
        class="modal"
        @click.stop
      >
        <div class="modal-header">
          <h3>添加角色</h3>
          <button @click="showAddRole = false">
            ×
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>角色名称</label>
            <input
              v-model="newRole.name"
              type="text"
            >
          </div>
          <div class="form-group">
            <label>角色描述</label>
            <textarea
              v-model="newRole.description"
              rows="3"
            />
          </div>
          <div class="form-group">
            <label>权限分配</label>
            <div class="permissions-grid">
              <label
                v-for="permission in availablePermissions"
                :key="permission.id"
                class="permission-item"
              >
                <input
                  v-model="newRole.permissions"
                  type="checkbox"
                  :value="permission.id"
                >
                <span>{{ permission.name }}</span>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            class="btn-secondary"
            @click="showAddRole = false"
          >
            取消
          </button>
          <button
            class="btn-primary"
            @click="addRole"
          >
            确定
          </button>
        </div>
      </div>
    </div>

    <!-- 权限详情模态框 -->
    <div
      v-if="showPermissions"
      class="modal-overlay"
      @click="showPermissions = false"
    >
      <div
        class="modal"
        @click.stop
      >
        <div class="modal-header">
          <h3>{{ selectedRole?.name }} - 权限详情</h3>
          <button @click="showPermissions = false">
            ×
          </button>
        </div>
        <div class="modal-body">
          <div class="permissions-list">
            <div
              v-for="permission in selectedRole?.permissions"
              :key="permission"
              class="permission-badge"
            >
              {{ getPermissionName(permission) }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            class="btn-primary"
            @click="showPermissions = false"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Permission {
  id: string
  name: string
}

interface Role {
  id: number
  name: string
  description: string
  userCount: number
  permissions: string[]
  createdAt: string
}

const searchQuery = ref('')
const showAddRole = ref(false)
const showPermissions = ref(false)
const selectedRole = ref<Role | null>(null)

const newRole = ref({
  name: '',
  description: '',
  permissions: [] as string[]
})

const availablePermissions = ref<Permission[]>([
  { id: 'user.read', name: '查看用户' },
  { id: 'user.create', name: '创建用户' },
  { id: 'user.update', name: '编辑用户' },
  { id: 'user.delete', name: '删除用户' },
  { id: 'role.read', name: '查看角色' },
  { id: 'role.create', name: '创建角色' },
  { id: 'role.update', name: '编辑角色' },
  { id: 'role.delete', name: '删除角色' },
  { id: 'project.read', name: '查看项目' },
  { id: 'project.create', name: '创建项目' },
  { id: 'project.update', name: '编辑项目' },
  { id: 'project.delete', name: '删除项目' },
  { id: 'system.config', name: '系统配置' },
  { id: 'system.logs', name: '系统日志' }
])

const roles = ref<Role[]>([
  {
    id: 1,
    name: '超级管理员',
    description: '拥有系统所有权限的管理员角色',
    userCount: 2,
    permissions: availablePermissions.value.map(p => p.id),
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    name: '项目管理员',
    description: '负责项目管理的角色',
    userCount: 5,
    permissions: ['project.read', 'project.create', 'project.update', 'project.delete', 'user.read'],
    createdAt: '2024-01-15'
  },
  {
    id: 3,
    name: '普通用户',
    description: '系统普通用户角色',
    userCount: 20,
    permissions: ['user.read', 'project.read'],
    createdAt: '2024-02-01'
  }
])

const filteredRoles = computed(() => {
  if (!searchQuery.value) return roles.value
  return roles.value.filter(role =>
    role.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const getPermissionName = (permissionId: string) => {
  const permission = availablePermissions.value.find(p => p.id === permissionId)
  return permission ? permission.name : permissionId
}

const addRole = () => {
  const role: Role = {
    id: Date.now(),
    name: newRole.value.name,
    description: newRole.value.description,
    userCount: 0,
    permissions: [...newRole.value.permissions],
    createdAt: new Date().toISOString().split('T')[0]
  }
  roles.value.push(role)
  showAddRole.value = false
  newRole.value = { name: '', description: '', permissions: [] }
}

const editRole = (role: Role) => {
  console.log('编辑角色:', role)
}

const viewPermissions = (role: Role) => {
  selectedRole.value = role
  showPermissions.value = true
}

const deleteRole = (role: Role) => {
  if (confirm(`确定要删除角色 ${role.name} 吗？`)) {
    const index = roles.value.findIndex(r => r.id === role.id)
    if (index > -1) {
      roles.value.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.roles-view {
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

.roles-table {
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

.role-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-icon {
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

.user-count, .permission-count {
  padding: 4px 8px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
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
  max-width: 600px;
  background: var(--color-bg-primary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgb(0 0 0 / 20%);
  max-height: 80vh;
  overflow-y: auto;
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
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  resize: vertical;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  padding: 12px;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.permission-item input {
  width: auto;
  margin: 0;
}

.permissions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-badge {
  padding: 6px 12px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 4px;
  font-size: 14px;
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

  .roles-table {
    font-size: 14px;
  }

  th, td {
    padding: 8px 12px;
  }

  .permissions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
