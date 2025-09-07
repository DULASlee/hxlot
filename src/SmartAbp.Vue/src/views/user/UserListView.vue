<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <div class="page-actions">
        <button class="btn btn-primary">新增用户</button>
        <button class="btn btn-default">导出数据</button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-item">
        <label class="search-label">用户名:</label>
        <input v-model="searchForm.username" type="text" placeholder="请输入用户名" class="search-input">
      </div>
      <div class="search-item">
        <label class="search-label">手机号:</label>
        <input v-model="searchForm.phone" type="text" placeholder="请输入手机号" class="search-input">
      </div>
      <div class="search-item">
        <label class="search-label">状态:</label>
        <select v-model="searchForm.status" class="search-select">
          <option value="">全部</option>
          <option value="active">正常</option>
          <option value="disabled">禁用</option>
        </select>
      </div>
      <button class="btn btn-primary" @click="handleSearch">查询</button>
      <button class="btn btn-default" @click="handleReset">重置</button>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 50px;">
              <input type="checkbox" v-model="selectAll" @change="handleSelectAll">
            </th>
            <th>用户名</th>
            <th>姓名</th>
            <th>部门</th>
            <th>角色</th>
            <th>手机号</th>
            <th>状态</th>
            <th>创建时间</th>
            <th style="width: 200px;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in userList" :key="user.id">
            <td>
              <input type="checkbox" v-model="selectedUsers" :value="user.id">
            </td>
            <td>{{ user.username }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.department }}</td>
            <td>
              <span class="tag" :class="getRoleTagClass(user.role)">{{ user.role }}</span>
            </td>
            <td>{{ user.phone }}</td>
            <td>
              <span class="tag" :class="getStatusTagClass(user.status)">
                {{ user.status === 'active' ? '正常' : '禁用' }}
              </span>
            </td>
            <td>{{ user.createTime }}</td>
            <td>
              <button class="btn btn-sm btn-primary" @click="handleEdit(user)">编辑</button>
              <button class="btn btn-sm btn-danger" @click="handleDelete(user)">删除</button>
              <button class="btn btn-sm btn-default" @click="handleResetPassword(user)">重置密码</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <span class="pagination-info">共 {{ total }} 条记录</span>
      <div class="pagination-controls">
        <button class="btn btn-sm" :disabled="currentPage === 1" @click="handlePageChange(currentPage - 1)">上一页</button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button class="btn btn-sm" :disabled="currentPage === totalPages" @click="handlePageChange(currentPage + 1)">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

interface User {
  id: number
  username: string
  name: string
  department?: string
  role?: string
  phone?: string
  status?: string
  createTime?: string
}

defineProps<{
  userInfo: any
}>()

// 搜索表单
const searchForm = reactive({
  username: '',
  phone: '',
  status: ''
})

// 表格数据
const userList = ref<User[]>([
  {
    id: 1,
    username: 'admin',
    name: '系统管理员',
    department: '技术部',
    role: '超级管理员',
    phone: '138****8888',
    status: 'active',
    createTime: '2024-01-01 09:00:00'
  },
  {
    id: 2,
    username: 'zhangsan',
    name: '张三',
    department: '工程部',
    role: '项目经理',
    phone: '139****9999',
    status: 'active',
    createTime: '2024-01-02 10:30:00'
  },
  {
    id: 3,
    username: 'lisi',
    name: '李四',
    department: '安全部',
    role: '安全员',
    phone: '137****7777',
    status: 'disabled',
    createTime: '2024-01-03 14:20:00'
  }
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(3)

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 选择
const selectAll = ref(false)
const selectedUsers = ref<number[]>([])

// 方法
const handleSearch = () => {
  console.log('搜索:', searchForm)
}

const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    phone: '',
    status: ''
  })
}

const handleSelectAll = () => {
  if (selectAll.value) {
    selectedUsers.value = userList.value.map(user => user.id)
  } else {
    selectedUsers.value = []
  }
}

const handleEdit = (user: User) => {
  alert(`编辑用户: ${user.name}`)
}

const handleDelete = (user: User) => {
  if (confirm(`确定要删除用户 ${user.name} 吗？`)) {
    console.log('删除用户:', user)
  }
}

const handleResetPassword = (user: User) => {
  if (confirm(`确定要重置用户 ${user.name} 的密码吗？`)) {
    console.log('重置密码:', user)
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const getRoleTagClass = (role?: string): string => {
  const roleMap: Record<string, string> = {
    '超级管理员': 'tag-danger',
    '项目经理': 'tag-warning',
    '安全员': 'tag-info'
  }
  if (!role) return 'tag-default'
  return roleMap[role] ?? 'tag-default'
}

const getStatusTagClass = (status?: string): string => {
  return status === 'active' ? 'tag-success' : 'tag-danger'
}

onMounted(() => {
  console.log('用户管理页面加载完成')
})
</script>

<style scoped>
.page-container {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f2f3f5;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2329;
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 8px;
}

.search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-label {
  color: #4e5969;
  white-space: nowrap;
  font-size: 14px;
}

.search-input, .search-select {
  padding: 6px 12px;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  font-size: 14px;
  min-width: 120px;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th {
  background: #f7f8fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #1f2329;
  border-bottom: 2px solid #e5e6eb;
  white-space: nowrap;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #f2f3f5;
  color: #4e5969;
}

.data-table tr:hover {
  background: #f7f8fa;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn-primary {
  background: #1e3a5f;
  color: white;
}

.btn-primary:hover {
  background: #2a4d7a;
}

.btn-danger {
  background: #f5222d;
  color: white;
}

.btn-danger:hover {
  background: #ff4d4f;
}

.btn-default {
  background: white;
  color: #4e5969;
  border: 1px solid #e5e6eb;
}

.btn-default:hover {
  color: #1e3a5f;
  border-color: #1e3a5f;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.tag-success {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.tag-warning {
  background: #fffbe6;
  color: #faad14;
  border: 1px solid #ffe58f;
}

.tag-danger {
  background: #fff1f0;
  color: #f5222d;
  border: 1px solid #ffccc7;
}

.tag-info {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.tag-default {
  background: #f7f8fa;
  color: #4e5969;
  border: 1px solid #e5e6eb;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f2f3f5;
}

.pagination-info {
  color: #4e5969;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-info {
  color: #4e5969;
  font-size: 14px;
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    gap: 12px;
  }

  .search-item {
    width: 100%;
  }

  .search-input, .search-select {
    flex: 1;
  }

  .page-actions {
    flex-direction: column;
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
