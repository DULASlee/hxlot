<!-- 
/**
 * 企业后台权限管理系统 - 用户管理模板
 * 
 * 基于SmartAbp框架的企业级用户管理界面
 * 支持用户CRUD、角色分配、权限控制、批量操作
 * 
 * @template UserManagement
 * @domain 权限管理系统
 * @version 1.0.0
 * @author SmartAbp Template Generator
 */
-->

<template>
  <div class="user-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="el-icon-user" />
          用户管理
        </h1>
        <p class="page-description">管理系统用户信息、角色权限和状态</p>
      </div>
      <div class="header-actions">
        <el-button-group>
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="handleCreate"
            v-if="hasPermission('{{EntityName}}.Create')"
          >
            新增用户
          </el-button>
          <el-button
            type="success"
            icon="el-icon-upload"
            @click="handleBatchImport"
            v-if="hasPermission('{{EntityName}}.BatchImport')"
          >
            批量导入
          </el-button>
          <el-button
            type="warning"
            icon="el-icon-download"
            @click="handleExport"
            v-if="hasPermission('{{EntityName}}.Export')"
          >
            导出数据
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="never">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        :inline="true"
        class="search-form"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input
            v-model="searchForm.userName"
            placeholder="输入用户名搜索"
            clearable
            @keyup.enter="handleSearch"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="searchForm.email"
            placeholder="输入邮箱搜索"
            clearable
            @keyup.enter="handleSearch"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select
            v-model="searchForm.roleId"
            placeholder="选择角色"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.displayName"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="isActive">
          <el-select
            v-model="searchForm.isActive"
            placeholder="选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="handleSearch"
          >
            搜索
          </el-button>
          <el-button
            icon="el-icon-refresh"
            @click="handleReset"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="table-header">
          <div class="table-title">
            <span>用户列表</span>
            <el-tag type="info" size="small">
              共 {{ pagination.total }} 条记录
            </el-tag>
          </div>
          <div class="table-tools">
            <el-button
              size="small"
              icon="el-icon-refresh"
              @click="handleRefresh"
            >
              刷新
            </el-button>
            <el-dropdown @command="handleBatchAction" v-if="selectedUsers.length > 0">
              <el-button size="small" type="primary">
                批量操作 ({{ selectedUsers.length }})
                <i class="el-icon-arrow-down" />
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="enable" v-if="hasPermission('{{EntityName}}.Update')">
                    <i class="el-icon-check" /> 启用选中用户
                  </el-dropdown-item>
                  <el-dropdown-item command="disable" v-if="hasPermission('{{EntityName}}.Update')">
                    <i class="el-icon-close" /> 禁用选中用户
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided v-if="hasPermission('{{EntityName}}.Delete')">
                    <i class="el-icon-delete" /> 删除选中用户
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>

      <el-table
        ref="tableRef"
        :data="tableData"
        :loading="loading"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column
          prop="userName"
          label="用户名"
          width="150"
          sortable="custom"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar
                :size="32"
                :src="row.avatar"
                :alt="row.userName"
              >
                {{ row.userName.charAt(0).toUpperCase() }}
              </el-avatar>
              <span class="user-name">{{ row.userName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="email"
          label="邮箱"
          width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="phoneNumber"
          label="手机号"
          width="130"
        />
        <el-table-column
          prop="roles"
          label="角色"
          width="200"
        >
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role.id"
              size="small"
              :type="getRoleTagType(role.name)"
              class="role-tag"
            >
              {{ role.displayName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="isActive"
          label="状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-switch
              v-model="row.isActive"
              :disabled="!hasPermission('{{EntityName}}.Update')"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="lastLoginTime"
          label="最后登录"
          width="150"
          sortable="custom"
        >
          <template #default="{ row }">
            <span v-if="row.lastLoginTime" class="last-login">
              {{ formatDateTime(row.lastLoginTime) }}
            </span>
            <el-tag v-else size="small" type="info">未登录</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="creationTime"
          label="创建时间"
          width="150"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ formatDateTime(row.creationTime) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="180"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button-group>
              <el-button
                size="mini"
                icon="el-icon-view"
                @click="handleView(row)"
                v-if="hasPermission('{{EntityName}}.Detail')"
              >
                查看
              </el-button>
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                @click="handleEdit(row)"
                v-if="hasPermission('{{EntityName}}.Update')"
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                type="warning"
                icon="el-icon-key"
                @click="handleAssignRoles(row)"
                v-if="hasPermission('{{EntityName}}.ManageRoles')"
              >
                角色
              </el-button>
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="handleDelete(row)"
                v-if="hasPermission('{{EntityName}}.Delete')"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户表单对话框 -->
    <UserFormDialog
      v-model="showFormDialog"
      :user="editingUser"
      :roles="roles"
      @saved="handleUserSaved"
    />

    <!-- 用户详情对话框 -->
    <UserDetailDialog
      v-model="showDetailDialog"
      :user="viewingUser"
    />

    <!-- 角色分配对话框 -->
    <RoleAssignmentDialog
      v-model="showRoleDialog"
      :user="assigningUser"
      :roles="roles"
      @assigned="handleRolesAssigned"
    />

    <!-- 批量导入对话框 -->
    <BatchImportDialog
      v-model="showImportDialog"
      @imported="handleImported"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import UserFormDialog from './UserFormDialog.vue'
import UserDetailDialog from './UserDetailDialog.vue'  
import RoleAssignmentDialog from './RoleAssignmentDialog.vue'
import BatchImportDialog from './BatchImportDialog.vue'
import { usePermission } from '@/composables/usePermission'
import { useUserService } from '@/services/userService'
import { useRoleService } from '@/services/roleService'

// 权限检查
const { hasPermission } = usePermission()

// 服务
const userService = useUserService()
const roleService = useRoleService()

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const selectedUsers = ref([])
const roles = ref([])

// 搜索表单
const searchForm = reactive({
  userName: '',
  email: '',
  roleId: '',
  isActive: null
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 对话框状态
const showFormDialog = ref(false)
const showDetailDialog = ref(false)
const showRoleDialog = ref(false)
const showImportDialog = ref(false)

// 编辑状态
const editingUser = ref(null)
const viewingUser = ref(null)
const assigningUser = ref(null)

// 计算属性
const tableRef = ref()
const searchFormRef = ref()

// 方法
const loadUsers = async () => {
  try {
    loading.value = true
    const params = {
      ...searchForm,
      skipCount: (pagination.currentPage - 1) * pagination.pageSize,
      maxResultCount: pagination.pageSize
    }
    
    const result = await userService.getList(params)
    tableData.value = result.items
    pagination.total = result.totalCount
    
  } catch (error) {
    ElMessage.error('加载用户列表失败：' + error.message)
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  try {
    const result = await roleService.getList({ maxResultCount: 1000 })
    roles.value = result.items
  } catch (error) {
    console.error('加载角色列表失败：', error)
  }
}

const handleCreate = () => {
  editingUser.value = null
  showFormDialog.value = true
}

const handleEdit = (user) => {
  editingUser.value = { ...user }
  showFormDialog.value = true
}

const handleView = (user) => {
  viewingUser.value = user
  showDetailDialog.value = true
}

const handleDelete = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户"${user.userName}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await userService.delete(user.id)
    ElMessage.success('用户删除成功')
    await loadUsers()
    
  } catch {
    // 用户取消删除
  }
}

const handleAssignRoles = (user) => {
  assigningUser.value = user
  showRoleDialog.value = true
}

const handleStatusChange = async (user) => {
  try {
    await userService.updateStatus(user.id, user.isActive)
    ElMessage.success(`用户${user.isActive ? '启用' : '禁用'}成功`)
  } catch (error) {
    // 恢复原状态
    user.isActive = !user.isActive
    ElMessage.error('状态更新失败：' + error.message)
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadUsers()
}

const handleReset = () => {
  searchFormRef.value?.resetFields()
  pagination.currentPage = 1
  loadUsers()
}

const handleRefresh = () => {
  loadUsers()
}

const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

const handleSortChange = ({ prop, order }) => {
  // 处理排序逻辑
  searchForm.sorting = order ? `${prop} ${order === 'ascending' ? 'asc' : 'desc'}` : ''
  loadUsers()
}

const handleCurrentChange = () => {
  loadUsers()
}

const handleSizeChange = () => {
  pagination.currentPage = 1
  loadUsers()
}

const handleBatchAction = async (command) => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择要操作的用户')
    return
  }

  try {
    const userIds = selectedUsers.value.map(u => u.id)
    
    switch (command) {
      case 'enable':
        await userService.batchUpdateStatus(userIds, true)
        ElMessage.success(`已启用 ${userIds.length} 个用户`)
        break
      case 'disable':
        await userService.batchUpdateStatus(userIds, false)
        ElMessage.success(`已禁用 ${userIds.length} 个用户`)
        break
      case 'delete':
        await ElMessageBox.confirm(
          `确定要删除选中的 ${userIds.length} 个用户吗？`,
          '确认批量删除',
          { type: 'warning' }
        )
        await userService.batchDelete(userIds)
        ElMessage.success(`已删除 ${userIds.length} 个用户`)
        break
    }
    
    await loadUsers()
    selectedUsers.value = []
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量操作失败：' + error.message)
    }
  }
}

const handleBatchImport = () => {
  showImportDialog.value = true
}

const handleExport = async () => {
  try {
    const result = await userService.export(searchForm)
    const url = window.URL.createObjectURL(new Blob([result]))
    const link = document.createElement('a')
    link.href = url
    link.download = `users_${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    ElMessage.error('数据导出失败：' + error.message)
  }
}

const handleUserSaved = () => {
  showFormDialog.value = false
  loadUsers()
}

const handleRolesAssigned = () => {
  showRoleDialog.value = false
  loadUsers()
}

const handleImported = (result) => {
  showImportDialog.value = false
  ElMessage.success(`成功导入 ${result.successCount} 个用户`)
  loadUsers()
}

const getRoleTagType = (roleName) => {
  const typeMap = {
    'Admin': 'danger',
    'Manager': 'warning', 
    'User': 'success',
    'Guest': 'info'
  }
  return typeMap[roleName] || 'default'
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  return new Date(dateTime).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  loadUsers()
  loadRoles()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
  background: var(--el-bg-color-page);
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-description {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

/* 搜索卡片样式 */
.search-card {
  margin-bottom: 16px;
}

.search-form {
  margin: 0;
}

/* 表格卡片样式 */
.table-card {
  margin-bottom: 16px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.table-tools {
  display: flex;
  gap: 8px;
}

/* 表格内容样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-weight: 500;
}

.role-tag {
  margin-right: 4px;
  margin-bottom: 2px;
}

.last-login {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

/* 分页样式 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .search-form .el-form-item {
    margin-right: 0;
    margin-bottom: 8px;
  }
  
  .table-header {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
