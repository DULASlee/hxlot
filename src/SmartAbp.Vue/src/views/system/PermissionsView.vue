<template>
  <div class="permissions-view">
    <div class="page-header">
      <h1>权限管理</h1>
      <p>管理系统权限和角色分配</p>
    </div>

    <div class="permissions-content">
      <!-- 权限统计 -->
      <div class="permissions-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C14.8,12.6 13.9,13.5 12.8,13.5H11.2C10.1,13.5 9.2,12.6 9.2,11.5V10C9.2,8.6 10.6,7 12,7Z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalRoles }}</div>
            <div class="stat-label">角色总数</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zM20.71 4.63l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalPermissions }}</div>
            <div class="stat-label">权限总数</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zM12 14c-3.31 0-6 2.69-6 6v2h12v-2c0-3.31-2.69-6-6-6z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalUsers }}</div>
            <div class="stat-label">用户总数</div>
          </div>
        </div>
      </div>

      <!-- 角色管理 -->
      <div class="roles-section">
        <div class="section-header">
          <h2>角色管理</h2>
          <button class="btn-primary" @click="showAddRole = true">
            <svg viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            添加角色
          </button>
        </div>

        <div class="roles-grid">
          <div v-for="role in roles" :key="role.id" class="role-card">
            <div class="role-header">
              <h3>{{ role.name }}</h3>
              <div class="role-actions">
                <button class="action-btn" @click="editRole(role)">
                  <svg viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </button>
                <button class="action-btn danger" @click="deleteRole(role)">
                  <svg viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            </div>

            <p class="role-description">{{ role.description }}</p>

            <div class="role-stats">
              <div class="role-stat">
                <span class="stat-value">{{ role.userCount }}</span>
                <span class="stat-label">用户</span>
              </div>
              <div class="role-stat">
                <span class="stat-value">{{ role.permissions.length }}</span>
                <span class="stat-label">权限</span>
              </div>
            </div>

            <div class="role-permissions">
              <h4>权限列表</h4>
              <div class="permissions-list">
                <span
                  v-for="permission in role.permissions"
                  :key="permission"
                  class="permission-tag"
                >
                  {{ getPermissionName(permission) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 权限矩阵 -->
      <div class="permissions-matrix-section">
        <h2>权限矩阵</h2>
        <div class="matrix-container">
          <table class="permissions-matrix">
            <thead>
              <tr>
                <th>权限</th>
                <th v-for="role in roles" :key="role.id">{{ role.name }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="permission in allPermissions" :key="permission.id">
                <td class="permission-name">
                  <div class="permission-info">
                    <strong>{{ permission.name }}</strong>
                    <small>{{ permission.description }}</small>
                  </div>
                </td>
                <td v-for="role in roles" :key="role.id" class="permission-cell">
                  <label class="permission-checkbox">
                    <input
                      type="checkbox"
                      :checked="role.permissions.includes(permission.id)"
                      @change="togglePermission(role.id, permission.id)"
                    />
                    <span class="checkmark"></span>
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 添加角色模态框 -->
    <div v-if="showAddRole" class="modal-overlay" @click="showAddRole = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>添加角色</h3>
          <button @click="showAddRole = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>角色名称</label>
            <input type="text" v-model="newRole.name" />
          </div>
          <div class="form-group">
            <label>角色描述</label>
            <textarea v-model="newRole.description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>权限分配</label>
            <div class="permissions-checkboxes">
              <label
                v-for="permission in allPermissions"
                :key="permission.id"
                class="permission-checkbox-item"
              >
                <input
                  type="checkbox"
                  :value="permission.id"
                  v-model="newRole.permissions"
                />
                <span>{{ permission.name }}</span>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAddRole = false">取消</button>
          <button class="btn-primary" @click="addRole">创建</button>
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
  description: string
}

interface Role {
  id: number
  name: string
  description: string
  userCount: number
  permissions: string[]
}

const showAddRole = ref(false)

const allPermissions = ref<Permission[]>([
  { id: 'user.read', name: '查看用户', description: '查看用户列表和详情' },
  { id: 'user.create', name: '创建用户', description: '创建新用户账户' },
  { id: 'user.update', name: '编辑用户', description: '编辑用户信息' },
  { id: 'user.delete', name: '删除用户', description: '删除用户账户' },
  { id: 'role.read', name: '查看角色', description: '查看角色列表和详情' },
  { id: 'role.create', name: '创建角色', description: '创建新角色' },
  { id: 'role.update', name: '编辑角色', description: '编辑角色信息' },
  { id: 'role.delete', name: '删除角色', description: '删除角色' },
  { id: 'project.read', name: '查看项目', description: '查看项目列表和详情' },
  { id: 'project.create', name: '创建项目', description: '创建新项目' },
  { id: 'project.update', name: '编辑项目', description: '编辑项目信息' },
  { id: 'project.delete', name: '删除项目', description: '删除项目' },
  { id: 'system.config', name: '系统配置', description: '修改系统配置' },
  { id: 'system.logs', name: '系统日志', description: '查看系统日志' }
])

const roles = ref<Role[]>([
  {
    id: 1,
    name: '超级管理员',
    description: '拥有系统所有权限的管理员角色',
    userCount: 2,
    permissions: allPermissions.value.map(p => p.id)
  },
  {
    id: 2,
    name: '项目管理员',
    description: '负责项目管理的角色',
    userCount: 5,
    permissions: ['project.read', 'project.create', 'project.update', 'project.delete', 'user.read']
  },
  {
    id: 3,
    name: '普通用户',
    description: '系统普通用户角色',
    userCount: 20,
    permissions: ['user.read', 'project.read']
  }
])

const newRole = ref({
  name: '',
  description: '',
  permissions: [] as string[]
})

// 计算统计数据
const totalRoles = computed(() => roles.value.length)
const totalPermissions = computed(() => allPermissions.value.length)
const totalUsers = computed(() => roles.value.reduce((sum, role) => sum + role.userCount, 0))

const getPermissionName = (permissionId: string) => {
  const permission = allPermissions.value.find(p => p.id === permissionId)
  return permission ? permission.name : permissionId
}

const togglePermission = (roleId: number, permissionId: string) => {
  const role = roles.value.find(r => r.id === roleId)
  if (role) {
    const index = role.permissions.indexOf(permissionId)
    if (index > -1) {
      role.permissions.splice(index, 1)
    } else {
      role.permissions.push(permissionId)
    }
  }
}

const addRole = () => {
  const role: Role = {
    id: Date.now(),
    name: newRole.value.name,
    description: newRole.value.description,
    userCount: 0,
    permissions: [...newRole.value.permissions]
  }
  roles.value.push(role)
  showAddRole.value = false
  newRole.value = { name: '', description: '', permissions: [] }
}

const editRole = (role: Role) => {
  console.log('编辑角色:', role)
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
.permissions-view {
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

.permissions-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 权限统计 */
.permissions-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  border-radius: 8px;
  color: var(--color-primary);
}

.stat-icon svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* 角色管理 */
.roles-section {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  padding: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
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
  fill: currentColor;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.role-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  padding: 20px;
}

.role-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.role-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.role-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.action-btn.danger {
  color: var(--color-error-500);
  border-color: var(--color-error-500);
}

.action-btn.danger:hover {
  background: var(--color-error-50);
}

.action-btn svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.role-description {
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.role-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.role-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-primary);
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.role-permissions h4 {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.permissions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.permission-tag {
  padding: 2px 8px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 4px;
  font-size: 12px;
}

/* 权限矩阵 */
.permissions-matrix-section {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  padding: 24px;
}

.permissions-matrix-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 20px;
}

.matrix-container {
  overflow-x: auto;
}

.permissions-matrix {
  width: 100%;
  border-collapse: collapse;
}

.permissions-matrix th,
.permissions-matrix td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-border-primary);
}

.permissions-matrix th {
  background: var(--color-bg-secondary);
  font-weight: 600;
  color: var(--color-text-primary);
  position: sticky;
  top: 0;
}

.permission-name {
  min-width: 200px;
}

.permission-info strong {
  display: block;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.permission-info small {
  color: var(--color-text-tertiary);
  font-size: 12px;
}

.permission-cell {
  text-align: center;
  width: 80px;
}

.permission-checkbox {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.permission-checkbox input {
  opacity: 0;
  position: absolute;
  cursor: pointer;
}

.checkmark {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 20px;
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border-primary);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.permission-checkbox input:checked + .checkmark {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.permission-checkbox input:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
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
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
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

.permissions-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  padding: 12px;
}

.permission-checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.permission-checkbox-item input {
  width: auto;
  margin: 0;
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
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .roles-grid {
    grid-template-columns: 1fr;
  }

  .role-stats {
    justify-content: space-around;
  }

  .permissions-matrix {
    font-size: 14px;
  }

  .permissions-matrix th,
  .permissions-matrix td {
    padding: 8px;
  }

  .permissions-checkboxes {
    grid-template-columns: 1fr;
  }
}
</style>
