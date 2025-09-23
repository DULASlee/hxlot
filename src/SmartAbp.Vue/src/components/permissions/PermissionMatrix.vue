<template>
  <div class="permission-matrix">
    <!-- 🚀 企业级权限矩阵UI组件 - 基于现有OptimizedPermissionInheritanceEngine -->
    <div class="matrix-header">
      <div class="header-left">
        <h3>权限矩阵管理</h3>
        <el-tag type="info" size="small">
          基于OptimizedPermissionInheritanceEngine
        </el-tag>
      </div>

      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索权限或角色..."
          :prefix-icon="SearchIcon"
          style="width: 300px"
          clearable
          @input="handleSearch"
        />

        <el-select v-model="selectedModule" placeholder="选择模块" clearable @change="handleModuleChange">
          <el-option label="全部模块" value="" />
          <el-option
            v-for="module in availableModules"
            :key="module"
            :label="module"
            :value="module"
          />
        </el-select>

        <el-button type="primary" @click="showBulkOperationDialog = true">
          批量操作
        </el-button>

        <el-button @click="refreshMatrix">
          <i class="el-icon-refresh" />
          刷新
        </el-button>
      </div>
    </div>

    <!-- 权限继承优先级说明 -->
    <el-alert
      title="权限继承优先级"
      type="info"
      :closable="false"
      style="margin-bottom: 16px"
    >
      <template #default>
        <div class="priority-legend">
          <span class="priority-item direct">Direct (直接权限)</span>
          <span class="priority-separator">></span>
          <span class="priority-item role">Role (角色权限)</span>
          <span class="priority-separator">></span>
          <span class="priority-item inheritance">Inheritance (继承权限)</span>
          <span class="priority-separator">></span>
          <span class="priority-item organization">Organization (组织权限)</span>
        </div>
      </template>
    </el-alert>

    <!-- 权限矩阵表格 -->
    <div class="matrix-container" v-loading="loading">
      <el-table
        ref="matrixTableRef"
        :data="filteredMatrixData"
        stripe
        border
        :height="600"
        @selection-change="handleSelectionChange"
        @cell-click="handleCellClick"
      >
        <!-- 选择列 -->
        <el-table-column type="selection" width="50" fixed="left" />

        <!-- 权限名称列 -->
        <el-table-column prop="permissionName" label="权限名称" width="200" fixed="left">
          <template #default="{ row }">
            <div class="permission-info">
              <div class="permission-name">{{ row.permissionName }}</div>
              <div class="permission-module">{{ row.module }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- 权限描述列 -->
        <el-table-column prop="description" label="描述" width="150" />

        <!-- 动态角色权限列 -->
        <el-table-column
          v-for="role in displayRoles"
          :key="role.id"
          :label="role.name"
          :width="120"
          align="center"
        >
          <template #header>
            <div class="role-header">
              <div class="role-name">{{ role.name }}</div>
              <div class="role-users">{{ role.userCount }}用户</div>
            </div>
          </template>

          <template #default="{ row }">
            <div class="permission-cell">
              <!-- 权限状态指示器 -->
              <el-tooltip
                :content="getPermissionTooltip(row.permissionName, role.id)"
                placement="top"
              >
                <div
                  :class="[
                    'permission-indicator',
                    getPermissionClass(row.permissionName, role.id)
                  ]"
                  @click="togglePermission(row.permissionName, role.id)"
                >
                  <i :class="getPermissionIcon(row.permissionName, role.id)" />
                </div>
              </el-tooltip>

              <!-- 继承来源标识 -->
              <div
                v-if="hasInheritance(row.permissionName, role.id)"
                class="inheritance-indicator"
                :title="getInheritanceSource(row.permissionName, role.id)"
              >
                <i class="el-icon-share" />
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editPermission(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="viewAuditLog(row)">日志</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="totalCount"
      :page-sizes="[20, 50, 100, 200]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handlePageSizeChange"
      @current-change="handleCurrentPageChange"
      style="margin-top: 16px; justify-content: center"
    />

    <!-- 批量操作对话框 -->
    <el-dialog
      v-model="showBulkOperationDialog"
      title="批量权限操作"
      width="600px"
      :destroy-on-close="true"
    >
      <div class="bulk-operation-content">
        <el-form :model="bulkOperationForm" label-width="100px">
          <el-form-item label="操作类型">
            <el-radio-group v-model="bulkOperationForm.operationType">
              <el-radio value="grant">批量授权</el-radio>
              <el-radio value="revoke">批量撤销</el-radio>
              <el-radio value="copy">复制权限</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="目标角色">
            <el-select
              v-model="bulkOperationForm.targetRoles"
              placeholder="选择目标角色"
              multiple
              style="width: 100%"
            >
              <el-option
                v-for="role in availableRoles"
                :key="role.id"
                :label="role.name"
                :value="role.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item v-if="bulkOperationForm.operationType === 'copy'" label="源角色">
            <el-select
              v-model="bulkOperationForm.sourceRole"
              placeholder="选择源角色"
              style="width: 100%"
            >
              <el-option
                v-for="role in availableRoles"
                :key="role.id"
                :label="role.name"
                :value="role.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="权限范围">
            <el-checkbox-group v-model="bulkOperationForm.permissionScopes">
              <el-checkbox value="selected">仅选中的权限</el-checkbox>
              <el-checkbox value="module">整个模块</el-checkbox>
              <el-checkbox value="all">全部权限</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>

        <div class="operation-preview">
          <h4>操作预览</h4>
          <div class="preview-stats">
            <el-tag>将影响 {{ bulkOperationPreview.affectedRoles }} 个角色</el-tag>
            <el-tag type="warning">涉及 {{ bulkOperationPreview.affectedPermissions }} 个权限</el-tag>
            <el-tag type="info">预计影响 {{ bulkOperationPreview.affectedUsers }} 个用户</el-tag>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showBulkOperationDialog = false">取消</el-button>
        <el-button @click="previewBulkOperation">预览</el-button>
        <el-button type="primary" :loading="executingBulkOperation" @click="executeBulkOperation">
          执行操作
        </el-button>
      </template>
    </el-dialog>

    <!-- 权限详情对话框 -->
    <el-dialog
      v-model="showPermissionDetailDialog"
      :title="`权限详情: ${selectedPermissionDetail?.permissionName}`"
      width="800px"
    >
      <div v-if="selectedPermissionDetail" class="permission-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="权限名称">
            {{ selectedPermissionDetail.permissionName }}
          </el-descriptions-item>
          <el-descriptions-item label="所属模块">
            {{ selectedPermissionDetail.module }}
          </el-descriptions-item>
          <el-descriptions-item label="权限描述" :span="2">
            {{ selectedPermissionDetail.description }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="permission-inheritance-tree">
          <h4>权限继承关系</h4>
          <el-tree
            :data="permissionInheritanceTree"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            :expand-on-click-node="false"
          >
            <template #default="{ node: _node, data }">
              <div class="inheritance-node">
                <i :class="data.icon" />
                <span>{{ data.name }}</span>
                <el-tag :type="data.status === 'granted' ? 'success' : 'danger'" size="small">
                  {{ data.status === 'granted' ? '已授权' : '已拒绝' }}
                </el-tag>
              </div>
            </template>
          </el-tree>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type ElTable } from 'element-plus'
import { Search as SearchIcon } from '@element-plus/icons-vue'

// 🚀 基于现有OptimizedPermissionInheritanceEngine的权限矩阵实现
interface PermissionMatrixItem {
  permissionName: string
  module: string
  description: string
  roles: Record<string, {
    granted: boolean
    source: 'Direct' | 'Role' | 'Inheritance' | 'Organization'
    priority: number
    inheritedFrom?: string
  }>
}

interface Role {
  id: string
  name: string
  userCount: number
  permissions: string[]
}

interface BulkOperationForm {
  operationType: 'grant' | 'revoke' | 'copy'
  targetRoles: string[]
  sourceRole: string
  permissionScopes: string[]
}

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const selectedModule = ref('')
const currentPage = ref(1)
const pageSize = ref(50)
const totalCount = ref(0)

// 权限矩阵数据
const matrixData = ref<PermissionMatrixItem[]>([])
const availableRoles = ref<Role[]>([])
const selectedPermissions = ref<PermissionMatrixItem[]>([])

// 对话框状态
const showBulkOperationDialog = ref(false)
const showPermissionDetailDialog = ref(false)
const selectedPermissionDetail = ref<PermissionMatrixItem | null>(null)
const executingBulkOperation = ref(false)

// 批量操作表单
const bulkOperationForm = ref<BulkOperationForm>({
  operationType: 'grant',
  targetRoles: [],
  sourceRole: '',
  permissionScopes: ['selected']
})

// 表格引用
const matrixTableRef = ref<InstanceType<typeof ElTable>>()

// 计算属性
const availableModules = computed(() => {
  const modules = new Set<string>()
  matrixData.value.forEach(item => {
    modules.add(item.module)
  })
  return Array.from(modules).sort()
})

const displayRoles = computed(() => {
  return availableRoles.value.slice(0, 8) // 限制显示的角色数量，避免表格过宽
})

const filteredMatrixData = computed(() => {
  let result = matrixData.value

  // 应用搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item =>
      item.permissionName.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      item.module.toLowerCase().includes(keyword)
    )
  }

  // 应用模块过滤
  if (selectedModule.value) {
    result = result.filter(item => item.module === selectedModule.value)
  }

  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  totalCount.value = result.length

  return result.slice(start, end)
})

const bulkOperationPreview = computed(() => {
  const targetRoles = bulkOperationForm.value.targetRoles.length
  const selectedCount = selectedPermissions.value.length
  const affectedUsers = availableRoles.value
    .filter(role => bulkOperationForm.value.targetRoles.includes(role.id))
    .reduce((sum, role) => sum + role.userCount, 0)

  return {
    affectedRoles: targetRoles,
    affectedPermissions: selectedCount,
    affectedUsers
  }
})

const permissionInheritanceTree = ref<any[]>([])

// 🎯 权限状态判断方法 - 基于OptimizedPermissionInheritanceEngine逻辑
const getPermissionClass = (permissionName: string, roleId: string) => {
  const permission = matrixData.value.find(p => p.permissionName === permissionName)
  const rolePermission = permission?.roles[roleId]

  if (!rolePermission) return 'permission-none'

  const classes = ['permission-cell']

  if (rolePermission.granted) {
    classes.push('permission-granted')
  } else {
    classes.push('permission-denied')
  }

  // 根据权限来源添加优先级样式
  switch (rolePermission.source) {
    case 'Direct':
      classes.push('priority-direct')
      break
    case 'Role':
      classes.push('priority-role')
      break
    case 'Inheritance':
      classes.push('priority-inheritance')
      break
    case 'Organization':
      classes.push('priority-organization')
      break
  }

  return classes.join(' ')
}

const getPermissionIcon = (permissionName: string, roleId: string) => {
  const permission = matrixData.value.find(p => p.permissionName === permissionName)
  const rolePermission = permission?.roles[roleId]

  if (!rolePermission) return 'el-icon-minus'

  if (rolePermission.granted) {
    return 'el-icon-check'
  } else {
    return 'el-icon-close'
  }
}

const getPermissionTooltip = (permissionName: string, roleId: string) => {
  const permission = matrixData.value.find(p => p.permissionName === permissionName)
  const rolePermission = permission?.roles[roleId]
  const role = availableRoles.value.find(r => r.id === roleId)

  if (!rolePermission || !role) return '无权限信息'

  const status = rolePermission.granted ? '已授权' : '已拒绝'
  const source = rolePermission.source
  const priority = rolePermission.priority

  let tooltip = `角色: ${role.name}\n权限: ${permissionName}\n状态: ${status}\n来源: ${source}\n优先级: ${priority}`

  if (rolePermission.inheritedFrom) {
    tooltip += `\n继承自: ${rolePermission.inheritedFrom}`
  }

  return tooltip
}

const hasInheritance = (permissionName: string, roleId: string) => {
  const permission = matrixData.value.find(p => p.permissionName === permissionName)
  const rolePermission = permission?.roles[roleId]
  return rolePermission?.source === 'Inheritance' || rolePermission?.inheritedFrom
}

const getInheritanceSource = (permissionName: string, roleId: string) => {
  const permission = matrixData.value.find(p => p.permissionName === permissionName)
  const rolePermission = permission?.roles[roleId]
  return rolePermission?.inheritedFrom || '继承权限'
}

// 事件处理方法
const handleSearch = () => {
  currentPage.value = 1 // 搜索时重置到第一页
}

const handleModuleChange = () => {
  currentPage.value = 1
}

const handleSelectionChange = (selection: PermissionMatrixItem[]) => {
  selectedPermissions.value = selection
}

const handleCellClick = (row: PermissionMatrixItem, column: any) => {
  // 如果点击的是权限列，显示权限详情
  if (column.property && availableRoles.value.some(role => role.name === column.label)) {
    selectedPermissionDetail.value = row
    loadPermissionInheritanceTree(row.permissionName)
    showPermissionDetailDialog.value = true
  }
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentPageChange = (page: number) => {
  currentPage.value = page
}

const togglePermission = async (permissionName: string, roleId: string) => {
  try {
    const permission = matrixData.value.find(p => p.permissionName === permissionName)
    const rolePermission = permission?.roles[roleId]

    if (!permission || !rolePermission) return

    const newStatus = !rolePermission.granted
    const action = newStatus ? '授权' : '撤销'

    await ElMessageBox.confirm(
      `确定要${action}角色的 "${permissionName}" 权限吗？`,
      '权限变更确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 🎯 调用后端API更新权限（基于现有权限引擎）
    await updateRolePermission(roleId, permissionName, newStatus)

    // 更新本地数据
    rolePermission.granted = newStatus
    rolePermission.source = 'Direct' // 直接操作的权限来源为Direct
    rolePermission.priority = 1 // 最高优先级

    ElMessage.success(`${action}成功`)

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('权限更新失败')
    }
  }
}

const editPermission = (permission: PermissionMatrixItem) => {
  selectedPermissionDetail.value = permission
  loadPermissionInheritanceTree(permission.permissionName)
  showPermissionDetailDialog.value = true
}

const viewAuditLog = (permission: PermissionMatrixItem) => {
  ElMessage.info(`查看 ${permission.permissionName} 的审计日志功能开发中...`)
}

const refreshMatrix = async () => {
  loading.value = true
  try {
    await loadPermissionMatrix()
    ElMessage.success('权限矩阵已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    loading.value = false
  }
}

const previewBulkOperation = () => {
  ElMessage.info('批量操作预览功能开发中...')
}

const executeBulkOperation = async () => {
  if (bulkOperationForm.value.targetRoles.length === 0) {
    ElMessage.warning('请选择目标角色')
    return
  }

  if (bulkOperationForm.value.permissionScopes.includes('selected') && selectedPermissions.value.length === 0) {
    ElMessage.warning('请选择要操作的权限')
    return
  }

  try {
    executingBulkOperation.value = true

    // 🎯 执行批量权限操作（基于现有权限引擎）
    await performBulkPermissionOperation(bulkOperationForm.value)

    ElMessage.success('批量操作执行成功')
    showBulkOperationDialog.value = false

    // 刷新数据
    await loadPermissionMatrix()

  } catch (error) {
    ElMessage.error('批量操作执行失败')
  } finally {
    executingBulkOperation.value = false
  }
}

// 🎯 API调用方法 - 基于现有权限引擎
const loadPermissionMatrix = async () => {
  try {
    loading.value = true

    // 模拟API调用，实际应该调用后端的OptimizedPermissionInheritanceEngine
    const mockData: PermissionMatrixItem[] = [
      {
        permissionName: 'Users.Create',
        module: 'UserManagement',
        description: '创建用户',
        roles: {
          'admin': { granted: true, source: 'Direct', priority: 1 },
          'manager': { granted: true, source: 'Role', priority: 2 },
          'user': { granted: false, source: 'Role', priority: 2 }
        }
      },
      {
        permissionName: 'Users.Edit',
        module: 'UserManagement',
        description: '编辑用户',
        roles: {
          'admin': { granted: true, source: 'Direct', priority: 1 },
          'manager': { granted: true, source: 'Inheritance', priority: 3, inheritedFrom: 'ParentRole' },
          'user': { granted: false, source: 'Role', priority: 2 }
        }
      },
      {
        permissionName: 'Products.View',
        module: 'ProductManagement',
        description: '查看产品',
        roles: {
          'admin': { granted: true, source: 'Direct', priority: 1 },
          'manager': { granted: true, source: 'Role', priority: 2 },
          'user': { granted: true, source: 'Organization', priority: 4 }
        }
      }
    ]

    const mockRoles: Role[] = [
      { id: 'admin', name: '管理员', userCount: 5, permissions: ['Users.Create', 'Users.Edit', 'Products.View'] },
      { id: 'manager', name: '经理', userCount: 15, permissions: ['Users.Edit', 'Products.View'] },
      { id: 'user', name: '普通用户', userCount: 100, permissions: ['Products.View'] }
    ]

    matrixData.value = mockData
    availableRoles.value = mockRoles

  } catch (error) {
    ElMessage.error('加载权限矩阵失败')
  } finally {
    loading.value = false
  }
}

const updateRolePermission = async (_roleId: string, _permissionName: string, _granted: boolean) => {
  // 模拟API调用
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true)
    }, 500)
  })
}

const performBulkPermissionOperation = async (_operation: BulkOperationForm) => {
  // 模拟批量操作API调用
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true)
    }, 1000)
  })
}

const loadPermissionInheritanceTree = (_permissionName: string) => {
  // 模拟权限继承树数据
  permissionInheritanceTree.value = [
    {
      id: '1',
      name: 'Direct Assignment',
      icon: 'el-icon-user',
      status: 'granted',
      children: [
        {
          id: '1-1',
          name: 'Admin Role',
          icon: 'el-icon-s-custom',
          status: 'granted'
        }
      ]
    },
    {
      id: '2',
      name: 'Role Inheritance',
      icon: 'el-icon-share',
      status: 'granted',
      children: [
        {
          id: '2-1',
          name: 'Manager Role',
          icon: 'el-icon-s-custom',
          status: 'granted'
        }
      ]
    }
  ]
}

// 生命周期
onMounted(async () => {
  await loadPermissionMatrix()
})
</script>

<style scoped>
.permission-matrix {
  padding: 20px;
  background: var(--el-bg-color, #ffffff);
}

.matrix-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h3 {
  margin: 0;
  color: var(--el-text-color-primary, #303133);
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 优先级图例样式 */
.priority-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.priority-item {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.priority-item.direct {
  background: #f56c6c;
  color: white;
}

.priority-item.role {
  background: #e6a23c;
  color: white;
}

.priority-item.inheritance {
  background: #409eff;
  color: white;
}

.priority-item.organization {
  background: #67c23a;
  color: white;
}

.priority-separator {
  font-weight: bold;
  color: var(--el-text-color-secondary, #909399);
}

/* 矩阵表格样式 */
.matrix-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.permission-info {
  text-align: left;
}

.permission-name {
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
  margin-bottom: 4px;
}

.permission-module {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
}

.role-header {
  text-align: center;
}

.role-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.role-users {
  font-size: 11px;
  color: var(--el-text-color-secondary, #909399);
}

/* 权限单元格样式 */
.permission-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  position: relative;
}

.permission-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.permission-indicator:hover {
  transform: scale(1.1);
}

/* 权限状态样式 */
.permission-granted .permission-indicator {
  background: #67c23a;
  color: white;
}

.permission-denied .permission-indicator {
  background: #f56c6c;
  color: white;
}

.permission-none .permission-indicator {
  background: #e4e7ed;
  color: #909399;
}

/* 优先级样式 */
.priority-direct .permission-indicator {
  border: 2px solid #f56c6c;
}

.priority-role .permission-indicator {
  border: 2px solid #e6a23c;
}

.priority-inheritance .permission-indicator {
  border: 2px solid #409eff;
}

.priority-organization .permission-indicator {
  border: 2px solid #67c23a;
}

.inheritance-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
}

/* 批量操作对话框样式 */
.bulk-operation-content {
  max-height: 500px;
  overflow-y: auto;
}

.operation-preview {
  margin-top: 20px;
  padding: 16px;
  background: var(--el-fill-color-lighter, #fafcff);
  border-radius: 6px;
}

.operation-preview h4 {
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary, #303133);
}

.preview-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 权限详情样式 */
.permission-detail {
  max-height: 600px;
  overflow-y: auto;
}

.permission-inheritance-tree {
  margin-top: 20px;
}

.permission-inheritance-tree h4 {
  margin-bottom: 12px;
  color: var(--el-text-color-primary, #303133);
}

.inheritance-node {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-actions {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .header-actions .el-input,
  .header-actions .el-select {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .matrix-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .priority-legend {
    flex-direction: column;
    gap: 4px;
  }

  .preview-stats {
    flex-direction: column;
  }
}
</style>
