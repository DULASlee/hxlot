<template>
  <div class="permission-system">
    <!-- 🛡️ 权限系统头部 -->
    <div class="permission-header">
      <div class="header-left">
        <h3>
          <el-icon><Lock /></el-icon>
          企业级权限控制系统
        </h3>
        <div class="permission-stats">
          <el-tag type="primary">
            角色总数: {{ allRoles.length }}
          </el-tag>
          <el-tag type="success">
            权限总数: {{ allPermissions.length }}
          </el-tag>
          <el-tag type="info">
            用户总数: {{ allUsers.length }}
          </el-tag>
        </div>
      </div>
      <div class="header-actions">
        <el-button
          type="primary"
          @click="createNewRole"
        >
          <el-icon><Plus /></el-icon>
          新建角色
        </el-button>
        <el-button @click="createNewPermission">
          <el-icon><Key /></el-icon>
          新建权限
        </el-button>
        <el-button @click="importPermissions">
          <el-icon><Upload /></el-icon>
          导入配置
        </el-button>
      </div>
    </div>

    <!-- 🎨 权限管理主体 -->
    <div class="permission-body">
      <el-tabs
        v-model="activeTab"
        class="permission-tabs"
      >
        <!-- 角色管理 -->
        <el-tab-pane
          label="角色管理"
          name="roles"
        >
          <div class="roles-management">
            <div class="roles-toolbar">
              <el-input
                v-model="roleSearchKeyword"
                placeholder="搜索角色..."
                clearable
                style="width: 300px"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-select
                v-model="roleFilter"
                placeholder="筛选"
                style="width: 120px"
              >
                <el-option
                  label="全部"
                  value="all"
                />
                <el-option
                  label="系统角色"
                  value="system"
                />
                <el-option
                  label="自定义角色"
                  value="custom"
                />
                <el-option
                  label="已禁用"
                  value="disabled"
                />
              </el-select>
            </div>

            <div class="roles-content">
              <!-- 角色列表 -->
              <div class="roles-list">
                <el-table
                  :data="filteredRoles"
                  highlight-current-row
                  height="500"
                  @row-click="selectRole"
                >
                  <el-table-column
                    type="selection"
                    width="55"
                  />
                  <el-table-column
                    prop="name"
                    label="角色名称"
                    min-width="150"
                  >
                    <template #default="scope">
                      <div class="role-name">
                        <el-icon :class="getRoleIcon(scope.row.type)" />
                        <span>{{ scope.row.name }}</span>
                        <el-tag
                          v-if="scope.row.isSystem"
                          type="info"
                          size="small"
                        >
                          系统
                        </el-tag>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="description"
                    label="描述"
                    min-width="200"
                  />
                  <el-table-column
                    prop="userCount"
                    label="用户数"
                    width="80"
                    align="center"
                  >
                    <template #default="scope">
                      <el-tag
                        type="primary"
                        size="small"
                      >
                        {{ getUserCountByRole(scope.row.id) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="permissionCount"
                    label="权限数"
                    width="80"
                    align="center"
                  >
                    <template #default="scope">
                      <el-tag
                        type="success"
                        size="small"
                      >
                        {{ scope.row.permissions.length }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="enabled"
                    label="状态"
                    width="100"
                  >
                    <template #default="scope">
                      <el-switch
                        v-model="scope.row.enabled"
                        :disabled="scope.row.isSystem"
                        @change="toggleRoleStatus(scope.row)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="操作"
                    width="200"
                  >
                    <template #default="scope">
                      <el-button-group size="small">
                        <el-button @click="editRole(scope.row)">
                          <el-icon><Edit /></el-icon>
                          编辑
                        </el-button>
                        <el-button @click="assignPermissions(scope.row)">
                          <el-icon><Key /></el-icon>
                          分配权限
                        </el-button>
                        <el-button
                          v-if="!scope.row.isSystem"
                          type="danger"
                          @click="deleteRole(scope.row)"
                        >
                          <el-icon><Delete /></el-icon>
                          删除
                        </el-button>
                      </el-button-group>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 角色详情 -->
              <div
                v-if="selectedRole"
                class="role-detail"
              >
                <div class="detail-header">
                  <h4>角色详情</h4>
                  <el-button-group size="small">
                    <el-button
                      :loading="saving"
                      @click="saveRole"
                    >
                      <el-icon><Check /></el-icon>
                      保存
                    </el-button>
                    <el-button @click="resetRole">
                      <el-icon><RefreshLeft /></el-icon>
                      重置
                    </el-button>
                  </el-button-group>
                </div>

                <el-form
                  :model="selectedRole"
                  label-width="100px"
                >
                  <el-form-item label="角色名称">
                    <el-input
                      v-model="selectedRole.name"
                      :disabled="selectedRole.isSystem"
                    />
                  </el-form-item>
                  <el-form-item label="角色描述">
                    <el-input
                      v-model="selectedRole.description"
                      type="textarea"
                      :rows="3"
                    />
                  </el-form-item>
                  <el-form-item label="角色类型">
                    <el-select
                      v-model="selectedRole.type"
                      :disabled="selectedRole.isSystem"
                    >
                      <el-option
                        label="管理员"
                        value="admin"
                      />
                      <el-option
                        label="普通用户"
                        value="user"
                      />
                      <el-option
                        label="访客"
                        value="guest"
                      />
                      <el-option
                        label="审核员"
                        value="auditor"
                      />
                      <el-option
                        label="操作员"
                        value="operator"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="数据权限">
                    <el-checkbox-group v-model="selectedRole.dataScopes">
                      <el-checkbox label="all">
                        全部数据
                      </el-checkbox>
                      <el-checkbox label="department">
                        本部门数据
                      </el-checkbox>
                      <el-checkbox label="self">
                        仅本人数据
                      </el-checkbox>
                      <el-checkbox label="custom">
                        自定义数据范围
                      </el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </el-form>

                <!-- 权限分配 -->
                <div class="permission-assignment">
                  <h5>权限分配</h5>
                  <el-tree
                    ref="permissionTreeRef"
                    :data="permissionTree"
                    :props="treeProps"
                    node-key="id"
                    show-checkbox
                    :default-checked-keys="selectedRole.permissions"
                    class="permission-tree"
                    @check="handlePermissionCheck"
                  >
                    <template #default="{ data }">
                      <div class="tree-node">
                        <el-icon :class="getPermissionIcon(data.type)" />
                        <span class="node-label">{{ data.name }}</span>
                        <el-tag
                          v-if="data.level"
                          :type="getLevelColor(data.level)"
                          size="small"
                        >
                          {{ data.level }}
                        </el-tag>
                      </div>
                    </template>
                  </el-tree>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 权限管理 -->
        <el-tab-pane
          label="权限管理"
          name="permissions"
        >
          <div class="permissions-management">
            <div class="permissions-toolbar">
              <el-input
                v-model="permissionSearchKeyword"
                placeholder="搜索权限..."
                clearable
                style="width: 300px"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-select
                v-model="permissionCategoryFilter"
                placeholder="分类"
                style="width: 150px"
              >
                <el-option
                  label="全部"
                  value="all"
                />
                <el-option
                  label="页面权限"
                  value="page"
                />
                <el-option
                  label="功能权限"
                  value="function"
                />
                <el-option
                  label="数据权限"
                  value="data"
                />
                <el-option
                  label="API权限"
                  value="api"
                />
              </el-select>
            </div>

            <el-table
              :data="filteredPermissions"
              height="600"
            >
              <el-table-column
                type="selection"
                width="55"
              />
              <el-table-column
                prop="code"
                label="权限代码"
                width="200"
              >
                <template #default="scope">
                  <code class="permission-code">{{ scope.row.code }}</code>
                </template>
              </el-table-column>
              <el-table-column
                prop="name"
                label="权限名称"
                min-width="150"
              />
              <el-table-column
                prop="category"
                label="分类"
                width="100"
              >
                <template #default="scope">
                  <el-tag
                    :type="getCategoryColor(scope.row.category)"
                    size="small"
                  >
                    {{ getCategoryText(scope.row.category) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="level"
                label="级别"
                width="80"
              >
                <template #default="scope">
                  <el-tag
                    :type="getLevelColor(scope.row.level)"
                    size="small"
                  >
                    {{ scope.row.level }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="resource"
                label="资源"
                min-width="120"
              />
              <el-table-column
                prop="action"
                label="操作"
                width="100"
              />
              <el-table-column
                label="使用情况"
                width="100"
              >
                <template #default="scope">
                  <el-tooltip
                    :content="`被 ${getRoleCountByPermission(scope.row.id)} 个角色使用`"
                    placement="top"
                  >
                    <el-tag
                      type="info"
                      size="small"
                    >
                      {{ getRoleCountByPermission(scope.row.id) }}个角色
                    </el-tag>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                width="150"
              >
                <template #default="scope">
                  <el-button-group size="small">
                    <el-button @click="editPermission(scope.row)">
                      <el-icon><Edit /></el-icon>
                      编辑
                    </el-button>
                    <el-button
                      type="danger"
                      :disabled="getRoleCountByPermission(scope.row.id) > 0"
                      @click="deletePermission(scope.row)"
                    >
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 用户权限 -->
        <el-tab-pane
          label="用户权限"
          name="users"
        >
          <div class="users-permission">
            <div class="users-toolbar">
              <el-input
                v-model="userSearchKeyword"
                placeholder="搜索用户..."
                clearable
                style="width: 300px"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-select
                v-model="userRoleFilter"
                placeholder="角色筛选"
                style="width: 150px"
              >
                <el-option
                  label="全部角色"
                  value="all"
                />
                <el-option
                  v-for="role in allRoles"
                  :key="role.id"
                  :label="role.name"
                  :value="role.id"
                />
              </el-select>
            </div>

            <el-table
              :data="filteredUsers"
              height="600"
            >
              <el-table-column
                type="selection"
                width="55"
              />
              <el-table-column
                prop="username"
                label="用户名"
                width="120"
              />
              <el-table-column
                prop="displayName"
                label="显示名称"
                min-width="120"
              />
              <el-table-column
                prop="email"
                label="邮箱"
                min-width="180"
              />
              <el-table-column
                label="角色"
                min-width="200"
              >
                <template #default="scope">
                  <div class="user-roles">
                    <el-tag
                      v-for="roleId in scope.row.roles"
                      :key="roleId"
                      size="small"
                      style="margin-right: 4px"
                    >
                      {{ getRoleName(roleId) }}
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="lastLogin"
                label="最后登录"
                width="160"
              >
                <template #default="scope">
                  {{ formatDate(scope.row.lastLogin) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="enabled"
                label="状态"
                width="80"
              >
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.enabled"
                    @change="toggleUserStatus(scope.row)"
                  />
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                width="180"
              >
                <template #default="scope">
                  <el-button-group size="small">
                    <el-button @click="editUserRoles(scope.row)">
                      <el-icon><UserFilled /></el-icon>
                      分配角色
                    </el-button>
                    <el-button @click="viewUserPermissions(scope.row)">
                      <el-icon><View /></el-icon>
                      查看权限
                    </el-button>
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 权限审计 -->
        <el-tab-pane
          label="权限审计"
          name="audit"
        >
          <div class="permission-audit">
            <div class="audit-toolbar">
              <el-date-picker
                v-model="auditDateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                style="width: 350px"
              />
              <el-select
                v-model="auditActionFilter"
                placeholder="操作类型"
                style="width: 120px"
              >
                <el-option
                  label="全部"
                  value="all"
                />
                <el-option
                  label="登录"
                  value="login"
                />
                <el-option
                  label="权限变更"
                  value="permission_change"
                />
                <el-option
                  label="角色分配"
                  value="role_assign"
                />
                <el-option
                  label="数据访问"
                  value="data_access"
                />
              </el-select>
              <el-button
                type="primary"
                @click="generateAuditReport"
              >
                <el-icon><Document /></el-icon>
                生成报告
              </el-button>
            </div>

            <el-table
              :data="auditLogs"
              height="500"
            >
              <el-table-column
                prop="timestamp"
                label="时间"
                width="160"
              >
                <template #default="scope">
                  {{ formatDateTime(scope.row.timestamp) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="user"
                label="用户"
                width="120"
              />
              <el-table-column
                prop="action"
                label="操作"
                width="120"
              >
                <template #default="scope">
                  <el-tag
                    :type="getActionColor(scope.row.action)"
                    size="small"
                  >
                    {{ getActionText(scope.row.action) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="resource"
                label="资源"
                min-width="150"
              />
              <el-table-column
                prop="result"
                label="结果"
                width="80"
              >
                <template #default="scope">
                  <el-tag
                    :type="scope.row.success ? 'success' : 'danger'"
                    size="small"
                  >
                    {{ scope.row.success ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="ip"
                label="IP地址"
                width="120"
              />
              <el-table-column
                prop="userAgent"
                label="用户代理"
                min-width="200"
                show-overflow-tooltip
              />
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 权限矩阵 -->
        <el-tab-pane
          label="权限矩阵"
          name="matrix"
        >
          <div class="permission-matrix">
            <div class="matrix-toolbar">
              <el-button @click="exportMatrix">
                <el-icon><Download /></el-icon>
                导出矩阵
              </el-button>
              <el-button @click="refreshMatrix">
                <el-icon><Refresh /></el-icon>
                刷新数据
              </el-button>
            </div>

            <!-- 🎯 权限矩阵表格 -->
            <div class="matrix-table">
              <el-table
                :data="matrixData"
                border
                height="600"
                class="permission-matrix-table"
              >
                <el-table-column
                  prop="resource"
                  label="资源/权限"
                  width="200"
                  fixed="left"
                >
                  <template #default="scope">
                    <div class="resource-cell">
                      <el-icon :class="getResourceIcon(scope.row.type)" />
                      <span>{{ scope.row.resource }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  v-for="role in allRoles.filter(r => r.enabled)"
                  :key="role.id"
                  :label="role.name"
                  width="100"
                  align="center"
                >
                  <template #default="scope">
                    <el-checkbox
                      :model-value="hasPermission(role.id, scope.row.id)"
                      :disabled="role.isSystem"
                      @change="(val: any) => togglePermissionMatrix(role.id, scope.row.id, Boolean(val))"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 🔍 权限策略编辑器 -->
    <el-dialog
      v-model="showPolicyEditor"
      title="权限策略编辑器"
      width="900px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="policy-editor">
        <el-tabs v-model="policyTab">
          <el-tab-pane
            label="可视化编辑"
            name="visual"
          >
            <div class="visual-policy-editor">
              <div class="policy-conditions">
                <h4>权限条件</h4>
                <div class="condition-builder">
                  <!-- 条件构建器 -->
                  <div
                    v-for="(condition, index) in editingPolicy.conditions"
                    :key="condition.id"
                    class="condition-row"
                  >
                    <el-select
                      v-model="condition.field"
                      placeholder="字段"
                    >
                      <el-option
                        label="用户ID"
                        value="userId"
                      />
                      <el-option
                        label="部门ID"
                        value="departmentId"
                      />
                      <el-option
                        label="角色"
                        value="role"
                      />
                      <el-option
                        label="时间"
                        value="time"
                      />
                      <el-option
                        label="IP地址"
                        value="ip"
                      />
                    </el-select>
                    <el-select
                      v-model="condition.operator"
                      placeholder="操作符"
                    >
                      <el-option
                        label="等于"
                        value="eq"
                      />
                      <el-option
                        label="不等于"
                        value="ne"
                      />
                      <el-option
                        label="包含"
                        value="in"
                      />
                      <el-option
                        label="不包含"
                        value="not_in"
                      />
                      <el-option
                        label="匹配"
                        value="match"
                      />
                    </el-select>
                    <el-input
                      v-model="condition.value"
                      placeholder="值"
                    />
                    <el-button
                      type="danger"
                      text
                      @click="removePolicyCondition(index)"
                    >
                      <el-icon><Close /></el-icon>
                    </el-button>
                  </div>
                  <el-button
                    type="primary"
                    text
                    @click="addPolicyCondition"
                  >
                    <el-icon><Plus /></el-icon>
                    添加条件
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane
            label="策略代码"
            name="code"
          >
            <div class="policy-code-editor">
              <pre class="policy-code">{{ generatePolicyCode() }}</pre>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <el-button @click="showPolicyEditor = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="savePolicyChanges"
        >
          保存策略
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
    Check,
    Close,
    Delete,
    Document,
    Download,
    Edit,
    Key,
    Lock, Plus,
    Refresh,
    RefreshLeft,
    Search,
    Upload,
    UserFilled, View
} from '@element-plus/icons-vue'
import { eventBus } from '@smartabp/lowcode-tools'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, ref } from 'vue'

// 🛡️ 权限系统接口定义
export interface Role {
  id: string
  name: string
  description: string
  type: 'admin' | 'user' | 'guest' | 'auditor' | 'operator'
  permissions: string[]
  dataScopes: string[]
  enabled: boolean
  isSystem: boolean
  createdAt: Date
  lastModified: Date
}

export interface Permission {
  id: string
  code: string
  name: string
  description: string
  category: 'page' | 'function' | 'data' | 'api'
  level: 'read' | 'write' | 'delete' | 'admin'
  resource: string
  action: string
  conditions?: string[]
}

export interface User {
  id: string
  username: string
  displayName: string
  email: string
  roles: string[]
  enabled: boolean
  lastLogin: Date
  createdAt: Date
}

export interface AuditLog {
  id: string
  timestamp: Date
  user: string
  action: string
  resource: string
  success: boolean
  ip: string
  userAgent: string
  details?: Record<string, any>
}

export interface PermissionPolicy {
  id: string
  name: string
  conditions: PolicyCondition[]
  effect: 'allow' | 'deny'
}

export interface PolicyCondition {
  id: string
  field: string
  operator: 'eq' | 'ne' | 'in' | 'not_in' | 'match'
  value: any
}

// 响应式数据
const activeTab = ref('roles')
const roleSearchKeyword = ref('')
const roleFilter = ref('all')
const permissionSearchKeyword = ref('')
const permissionCategoryFilter = ref('all')
const userSearchKeyword = ref('')
const userRoleFilter = ref('all')
const selectedRole = ref<Role | null>(null)
const saving = ref(false)
const auditDateRange = ref<[Date, Date] | null>(null)
const auditActionFilter = ref('all')
const showPolicyEditor = ref(false)
const policyTab = ref('visual')
const editingPolicy = ref<PermissionPolicy>({
  id: '',
  name: '',
  conditions: [],
  effect: 'allow'
})

// 权限树配置
const treeProps = {
  children: 'children',
  label: 'name'
}

// 模拟数据
const allRoles = ref<Role[]>([
  {
    id: 'admin',
    name: '系统管理员',
    description: '拥有系统所有权限',
    type: 'admin',
    permissions: ['user.create', 'user.read', 'user.update', 'user.delete', 'system.config'],
    dataScopes: ['all'],
    enabled: true,
    isSystem: true,
    createdAt: new Date(),
    lastModified: new Date()
  },
  {
    id: 'user',
    name: '普通用户',
    description: '基础用户权限',
    type: 'user',
    permissions: ['user.read', 'profile.update'],
    dataScopes: ['self'],
    enabled: true,
    isSystem: true,
    createdAt: new Date(),
    lastModified: new Date()
  }
])

const allPermissions = ref<Permission[]>([
  {
    id: 'user.create',
    code: 'USER_CREATE',
    name: '创建用户',
    description: '创建新用户的权限',
    category: 'function',
    level: 'write',
    resource: 'User',
    action: 'Create'
  },
  {
    id: 'user.read',
    code: 'USER_READ',
    name: '查看用户',
    description: '查看用户信息的权限',
    category: 'function',
    level: 'read',
    resource: 'User',
    action: 'Read'
  }
])

const allUsers = ref<User[]>([
  {
    id: 'user-1',
    username: 'admin',
    displayName: '管理员',
    email: 'admin@smartabp.com',
    roles: ['admin'],
    enabled: true,
    lastLogin: new Date(),
    createdAt: new Date()
  }
])

const auditLogs = ref<AuditLog[]>([
  {
    id: 'audit-1',
    timestamp: new Date(),
    user: 'admin',
    action: 'login',
    resource: 'system',
    success: true,
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0...'
  }
])

// 计算属性
const filteredRoles = computed(() => {
  let filtered = allRoles.value

  if (roleSearchKeyword.value) {
    const keyword = roleSearchKeyword.value.toLowerCase()
    filtered = filtered.filter(role =>
      role.name.toLowerCase().includes(keyword) ||
      role.description.toLowerCase().includes(keyword)
    )
  }

  if (roleFilter.value !== 'all') {
    filtered = filtered.filter(role => {
      switch (roleFilter.value) {
        case 'system': return role.isSystem
        case 'custom': return !role.isSystem
        case 'disabled': return !role.enabled
        default: return true
      }
    })
  }

  return filtered
})

const filteredPermissions = computed(() => {
  let filtered = allPermissions.value

  if (permissionSearchKeyword.value) {
    const keyword = permissionSearchKeyword.value.toLowerCase()
    filtered = filtered.filter(permission =>
      permission.name.toLowerCase().includes(keyword) ||
      permission.code.toLowerCase().includes(keyword)
    )
  }

  if (permissionCategoryFilter.value !== 'all') {
    filtered = filtered.filter(permission => permission.category === permissionCategoryFilter.value)
  }

  return filtered
})

const filteredUsers = computed(() => {
  let filtered = allUsers.value

  if (userSearchKeyword.value) {
    const keyword = userSearchKeyword.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.username.toLowerCase().includes(keyword) ||
      user.displayName.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword)
    )
  }

  if (userRoleFilter.value !== 'all') {
    filtered = filtered.filter(user => user.roles.includes(userRoleFilter.value))
  }

  return filtered
})

const permissionTree = computed(() => {
  // 构建权限树结构
  // const tree: any[] = [] // 暂时注释
  const categories = new Map()

  allPermissions.value.forEach(permission => {
    if (!categories.has(permission.category)) {
      categories.set(permission.category, {
        id: permission.category,
        name: getCategoryText(permission.category),
        type: 'category',
        children: []
      })
    }

    categories.get(permission.category).children.push({
      id: permission.id,
      name: permission.name,
      type: 'permission',
      level: permission.level
    })
  })

  return Array.from(categories.values())
})

const matrixData = computed(() => {
  return allPermissions.value.map(permission => ({
    id: permission.id,
    resource: permission.name,
    type: permission.category
  }))
})

// 方法
const selectRole = (role: Role) => {
  selectedRole.value = { ...role }
}

const createNewRole = () => {
  const newRole: Role = {
    id: `role-${Date.now()}`,
    name: '',
    description: '',
    type: 'user',
    permissions: [],
    dataScopes: ['self'],
    enabled: true,
    isSystem: false,
    createdAt: new Date(),
    lastModified: new Date()
  }

  allRoles.value.push(newRole)
  selectedRole.value = newRole
}

const createNewPermission = () => {
  const newPermission: Permission = {
    id: `permission-${Date.now()}`,
    code: '',
    name: '',
    description: '',
    category: 'function',
    level: 'read',
    resource: '',
    action: ''
  }

  allPermissions.value.push(newPermission)
  ElMessage.success('新权限创建成功')
}

const toggleRoleStatus = (role: Role) => {
  role.lastModified = new Date()
  ElMessage.success(`角色"${role.name}"已${role.enabled ? '启用' : '禁用'}`)

  eventBus.emit('permission:role-status-changed', {
    roleId: role.id,
    isActive: role.enabled,
    enabled: role.enabled,
    updatedBy: 'system'
  })
}

const saveRole = async () => {
  if (!selectedRole.value) return

  saving.value = true
  try {
    selectedRole.value.lastModified = new Date()
    ElMessage.success('角色保存成功')

    eventBus.emit('permission:role-saved', {
      role: selectedRole.value,
      isNew: false
    })
  } finally {
    saving.value = false
  }
}

const getUserCountByRole = (roleId: string) => {
  return allUsers.value.filter(user => user.roles.includes(roleId)).length
}

const getRoleCountByPermission = (permissionId: string) => {
  return allRoles.value.filter(role => role.permissions.includes(permissionId)).length
}

const getRoleName = (roleId: string) => {
  const role = allRoles.value.find(r => r.id === roleId)
  return role?.name || roleId
}

const hasPermission = (roleId: string, permissionId: string) => {
  const role = allRoles.value.find(r => r.id === roleId)
  return role?.permissions.includes(permissionId) || false
}

const togglePermissionMatrix = (roleId: string, permissionId: string, hasAccess: boolean) => {
  const role = allRoles.value.find(r => r.id === roleId)
  if (!role || role.isSystem) return

  if (hasAccess) {
    if (!role.permissions.includes(permissionId)) {
      role.permissions.push(permissionId)
    }
  } else {
    const index = role.permissions.indexOf(permissionId)
    if (index > -1) {
      role.permissions.splice(index, 1)
    }
  }

  role.lastModified = new Date()
}

const handlePermissionCheck = (_data: any, checked: any) => {
  if (!selectedRole.value) return

  // 更新角色权限
  if (checked.checkedKeys) {
    selectedRole.value.permissions = checked.checkedKeys.filter((key: string) =>
      allPermissions.value.some(p => p.id === key)
    )
  }
}

const getRoleIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    admin: 'crown',
    user: 'user',
    guest: 'user-filled',
    auditor: 'view',
    operator: 'tools'
  }
  return iconMap[type] || 'user'
}

const getPermissionIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    page: 'document',
    function: 'setting',
    data: 'database',
    api: 'connection',
    category: 'folder'
  }
  return iconMap[type] || 'key'
}

const getResourceIcon = (type: string) => {
  return getPermissionIcon(type)
}

const getCategoryColor = (category: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' => {
  const colorMap: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger'> = {
    page: 'primary',
    function: 'success',
    data: 'warning',
    api: 'info'
  }
  return colorMap[category] || 'primary'
}

const getCategoryText = (category: string) => {
  const textMap: Record<string, string> = {
    page: '页面',
    function: '功能',
    data: '数据',
    api: 'API'
  }
  return textMap[category] || category
}

const getLevelColor = (level: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' => {
  const colorMap: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger'> = {
    read: 'info',
    write: 'warning',
    delete: 'danger',
    admin: 'primary'
  }
  return colorMap[level] || 'primary'
}

const getActionColor = (action: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' => {
  const colorMap: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger'> = {
    login: 'success',
    permission_change: 'warning',
    role_assign: 'primary',
    data_access: 'info'
  }
  return colorMap[action] || 'primary'
}

const getActionText = (action: string) => {
  const textMap: Record<string, string> = {
    login: '登录',
    permission_change: '权限变更',
    role_assign: '角色分配',
    data_access: '数据访问'
  }
  return textMap[action] || action
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date))
}

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const editRole = (role: Role) => {
  selectedRole.value = { ...role }
}

const assignPermissions = (role: Role) => {
  selectedRole.value = role
  // 自动滚动到权限分配区域
}

const deleteRole = async (role: Role) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色"${role.name}"吗？`,
      '确认删除',
      { type: 'warning' }
    )

    const index = allRoles.value.findIndex(r => r.id === role.id)
    if (index > -1) {
      allRoles.value.splice(index, 1)
      ElMessage.success('角色删除成功')
    }
  } catch {
    // 用户取消
  }
}

const resetRole = () => {
  if (!selectedRole.value) return

  const original = allRoles.value.find(r => r.id === selectedRole.value!.id)
  if (original) {
    selectedRole.value = { ...original }
  }
}

const editPermission = (_permission: Permission) => {
  ElMessage.info('权限编辑功能正在开发中')
}

const deletePermission = async (permission: Permission) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除权限"${permission.name}"吗？`,
      '确认删除',
      { type: 'warning' }
    )

    const index = allPermissions.value.findIndex(p => p.id === permission.id)
    if (index > -1) {
      allPermissions.value.splice(index, 1)

      // 从所有角色中移除此权限
      allRoles.value.forEach(role => {
        const permIndex = role.permissions.indexOf(permission.id)
        if (permIndex > -1) {
          role.permissions.splice(permIndex, 1)
        }
      })

      ElMessage.success('权限删除成功')
    }
  } catch {
    // 用户取消
  }
}

const editUserRoles = (_user: User) => {
  ElMessage.info('用户角色编辑功能正在开发中')
}

const viewUserPermissions = (_user: User) => {
  ElMessage.info('用户权限查看功能正在开发中')
}

const toggleUserStatus = (user: User) => {
  ElMessage.success(`用户"${user.displayName}"已${user.enabled ? '启用' : '禁用'}`)
}

const generateAuditReport = () => {
  ElMessage.success('审计报告生成中...')
}

const exportMatrix = () => {
  ElMessage.success('权限矩阵导出成功')
}

const refreshMatrix = () => {
  ElMessage.success('权限矩阵数据已刷新')
}

const addPolicyCondition = () => {
  editingPolicy.value.conditions.push({
    id: `condition-${Date.now()}`,
    field: '',
    operator: 'eq',
    value: ''
  })
}

const removePolicyCondition = (index: number) => {
  editingPolicy.value.conditions.splice(index, 1)
}

const generatePolicyCode = () => {
  const policy = editingPolicy.value
  return `// 权限策略: ${policy.name}
function evaluatePermission(context) {
  const conditions = [
    ${policy.conditions.map(c =>
      `context.${c.field} ${c.operator} ${JSON.stringify(c.value)}`
    ).join(',\n    ')}
  ]

  const result = conditions.every(condition => condition)
  return {
    effect: '${policy.effect}',
    allowed: result
  }
}`
}

const savePolicyChanges = () => {
  showPolicyEditor.value = false
  ElMessage.success('权限策略保存成功')
}

const importPermissions = () => {
  ElMessage.info('权限配置导入功能正在开发中')
}

// 生命周期
onMounted(() => {
  // 初始化第一个角色
  if (allRoles.value.length > 0) {
    selectedRole.value = allRoles.value[0] || null
  } else {
    selectedRole.value = null
  }
})
</script>

<style scoped>
.permission-system {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.permission-header {
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
}

.permission-stats {
  display: flex;
  gap: 8px;
}

.permission-body {
  flex: 1;
  background: white;
  overflow: hidden;
}

.permission-tabs {
  height: 100%;
}

.permission-tabs :deep(.el-tabs__content) {
  height: calc(100% - 55px);
  overflow: hidden;
}

.roles-management,
.permissions-management,
.users-permission,
.permission-audit,
.permission-matrix {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.roles-toolbar,
.permissions-toolbar,
.users-toolbar,
.audit-toolbar,
.matrix-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
}

.roles-content {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow: hidden;
}

.roles-list {
  flex: 2;
  overflow: hidden;
}

.role-detail {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.detail-header h4 {
  margin: 0;
  color: #303133;
}

.role-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.permission-assignment {
  margin-top: 16px;
}

.permission-assignment h5 {
  margin: 0 0 12px 0;
  color: #303133;
}

.permission-tree {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-label {
  flex: 1;
}

.permission-code {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  color: #e74c3c;
}

.matrix-table {
  flex: 1;
  overflow: hidden;
}

.permission-matrix-table {
  font-size: 12px;
}

.resource-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.policy-editor {
  min-height: 400px;
}

.visual-policy-editor {
  padding: 16px;
}

.policy-conditions h4 {
  margin: 0 0 16px 0;
  color: #303133;
}

.condition-builder {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
}

.condition-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.policy-code-editor {
  padding: 16px;
}

.policy-code {
  background: #2d3748;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .roles-content {
    flex-direction: column;
  }

  .role-detail {
    flex: none;
    height: 400px;
  }
}

@media (max-width: 768px) {
  .permission-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .roles-toolbar,
  .permissions-toolbar,
  .users-toolbar,
  .audit-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
