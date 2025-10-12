<template>
  <div class="user-list-view">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">👥 用户管理列表</span>
          <el-button
            type="primary"
            @click="handleCreate"
          >
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form
        :inline="true"
        :model="searchForm"
        class="search-form"
      >
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input
            v-model="searchForm.email"
            placeholder="请输入邮箱"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleSearch"
          >
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 用户列表表格 -->
      <el-table 
        v-loading="loading" 
        :data="userList" 
        style="width: 100%"
        border
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          prop="username"
          label="用户名"
          width="150"
        />
        <el-table-column
          prop="email"
          label="邮箱"
          width="200"
        />
        <el-table-column
          prop="phone"
          label="手机号"
          width="150"
        />
        <el-table-column
          prop="role"
          label="角色"
          width="120"
        >
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">
              {{ row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="180"
        />
        <el-table-column
          label="操作"
          fixed="right"
          width="200"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 用户编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="currentUser"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item
          label="用户名"
          prop="username"
        >
          <el-input
            v-model="currentUser.username"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item
          label="邮箱"
          prop="email"
        >
          <el-input
            v-model="currentUser.email"
            placeholder="请输入邮箱"
          />
        </el-form-item>
        <el-form-item
          label="手机号"
          prop="phone"
        >
          <el-input
            v-model="currentUser.phone"
            placeholder="请输入手机号"
          />
        </el-form-item>
        <el-form-item
          label="角色"
          prop="role"
        >
          <el-select
            v-model="currentUser.role"
            placeholder="请选择角色"
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
          </el-select>
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-radio-group v-model="currentUser.status">
            <el-radio value="active">
              启用
            </el-radio>
            <el-radio value="inactive">
              禁用
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  username: '',
  email: ''
})

// 用户列表数据
const userList = ref<any[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const formRef = ref()
const currentUser = reactive({
  id: '',
  username: '',
  email: '',
  phone: '',
  role: 'user',
  status: 'active'
})

// 表单验证规则
const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    // ✅ 真实实现：调用后端API获取用户列表
    // const response = await userApi.getUserList({
    //   ...searchForm,
    //   page: pagination.currentPage,
    //   pageSize: pagination.pageSize
    // })
    // userList.value = response.items
    // pagination.total = response.total

    // 🟡 临时占位：使用模拟数据（待后端API实现后替换）
    setTimeout(() => {
      const mockData = Array.from({ length: pagination.pageSize }, (_, i) => ({
        id: `${(pagination.currentPage - 1) * pagination.pageSize + i + 1}`,
        username: `user${(pagination.currentPage - 1) * pagination.pageSize + i + 1}`,
        email: `user${(pagination.currentPage - 1) * pagination.pageSize + i + 1}@example.com`,
        phone: `13800138${String((pagination.currentPage - 1) * pagination.pageSize + i + 1).padStart(3, '0')}`,
        role: i % 3 === 0 ? 'admin' : i % 3 === 1 ? 'user' : 'guest',
        status: i % 5 === 0 ? 'inactive' : 'active',
        createdAt: new Date(Date.now() - i * 86400000).toLocaleString('zh-CN')
      }))
      userList.value = mockData
      pagination.total = 100
      loading.value = false
    }, 500)
  } catch (error) {
    ElMessage.error('加载用户列表失败')
    console.error(error)
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadUserList()
}

// 重置
const handleReset = () => {
  searchForm.username = ''
  searchForm.email = ''
  pagination.currentPage = 1
  loadUserList()
}

// 新增用户
const handleCreate = () => {
  dialogTitle.value = '新增用户'
  Object.assign(currentUser, {
    id: '',
    username: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active'
  })
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑用户'
  Object.assign(currentUser, row)
  dialogVisible.value = true
}

// 删除用户
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.username}" 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // ✅ 真实实现：调用后端API删除用户
    // await userApi.deleteUser(row.id)
    ElMessage.success('删除成功')
    loadUserList()
  } catch {
    // 用户取消删除
  }
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    // ✅ 真实实现：调用后端API创建或更新用户
    // if (currentUser.id) {
    //   await userApi.updateUser(currentUser.id, currentUser)
    // } else {
    //   await userApi.createUser(currentUser)
    // }
    ElMessage.success(currentUser.id ? '更新成功' : '创建成功')
    dialogVisible.value = false
    loadUserList()
  } catch (error) {
    ElMessage.error('操作失败')
    console.error(error)
  }
}

// 分页切换
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadUserList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadUserList()
}

// 角色标签类型
const getRoleType = (role: string) => {
  const typeMap: Record<string, string> = {
    admin: 'danger',
    user: 'primary',
    guest: 'info'
  }
  return typeMap[role] || 'info'
}

// 组件挂载时加载数据
onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.user-list-view {
  padding: 20px;
}

.box-card {
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 500;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table__header th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
}
</style>

