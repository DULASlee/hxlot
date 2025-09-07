<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <div>
        <button class="btn btn-primary" @click="addUser">
          <span>➕</span>
          <span>新增用户</span>
        </button>
        <button class="btn btn-default" @click="exportUsers">
          <span>↓</span>
          <span>导出</span>
        </button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-item">
        <label class="search-label">用户名：</label>
        <input v-model="searchForm.username" type="text" placeholder="请输入用户名" class="search-input">
      </div>
      <div class="search-item">
        <label class="search-label">手机号：</label>
        <input v-model="searchForm.phone" type="text" placeholder="请输入手机号" class="search-input">
      </div>
      <div class="search-item">
        <label class="search-label">状态：</label>
        <select v-model="searchForm.status" class="search-select">
          <option value="">全部</option>
          <option value="1">正常</option>
          <option value="0">禁用</option>
        </select>
      </div>
      <button class="btn btn-primary" @click="searchUsers">查询</button>
      <button class="btn btn-default" @click="resetSearch">重置</button>
    </div>

    <!-- 数据表格 -->
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 50px;">
            <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
          </th>
          <th>用户名</th>
          <th>姓名</th>
          <th>部门</th>
          <th>角色</th>
          <th>手机号</th>
          <th>状态</th>
          <th>创建时间</th>
          <th style="width: 180px;">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td><input type="checkbox" v-model="selectedUsers" :value="user.id"></td>
          <td>{{ user.username }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.department }}</td>
          <td>
            <span class="tag" :class="getRoleTagClass(user.role)">{{ user.role }}</span>
          </td>
          <td>{{ user.phone }}</td>
          <td>
            <span class="tag" :class="getStatusTagClass(user.status)">{{ getStatusText(user.status) }}</span>
          </td>
          <td>{{ formatDate(user.createTime) }}</td>
          <td>
            <button class="btn btn-primary" style="padding: 4px 8px; font-size: 12px;" @click="editUser(user)">编辑</button>
            <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" @click="deleteUser(user)">删除</button>
            <button class="btn btn-default" style="padding: 4px 8px; font-size: 12px;" @click="resetPassword(user)">重置密码</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 分页 -->
    <div class="pagination" style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
      <div style="color: var(--text-secondary);">
        共 {{ total }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-default" :disabled="currentPage <= 1" @click="prevPage">上一页</button>
        <button class="btn btn-default" :disabled="currentPage >= totalPages" @click="nextPage">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 搜索表单
const searchForm = ref({
  username: '',
  phone: '',
  status: ''
})

// 用户数据
const users = ref([
  {
    id: 1,
    username: 'admin',
    name: '系统管理员',
    department: '技术部',
    role: '超级管理员',
    phone: '138****8888',
    status: 1,
    createTime: '2024-01-01 09:00:00'
  },
  {
    id: 2,
    username: 'zhangsan',
    name: '张三',
    department: '工程部',
    role: '项目经理',
    phone: '139****9999',
    status: 1,
    createTime: '2024-01-02 10:30:00'
  },
  {
    id: 3,
    username: 'lisi',
    name: '李四',
    department: '安全部',
    role: '安全员',
    phone: '137****7777',
    status: 0,
    createTime: '2024-01-03 14:20:00'
  },
  {
    id: 4,
    username: 'wangwu',
    name: '王五',
    department: '质检部',
    role: '质检员',
    phone: '136****6666',
    status: 1,
    createTime: '2024-01-04 16:45:00'
  },
  {
    id: 5,
    username: 'zhaoliu',
    name: '赵六',
    department: '材料部',
    role: '材料员',
    phone: '135****5555',
    status: 1,
    createTime: '2024-01-05 08:15:00'
  },
  {
    id: 6,
    username: 'sunqi',
    name: '孙七',
    department: '财务部',
    role: '会计',
    phone: '134****4444',
    status: 0,
    createTime: '2024-01-06 11:30:00'
  },
  {
    id: 7,
    username: 'zhouba',
    name: '周八',
    department: '人事部',
    role: '人事专员',
    phone: '133****3333',
    status: 1,
    createTime: '2024-01-07 13:20:00'
  },
  {
    id: 8,
    username: 'wujiu',
    name: '吴九',
    department: '工程部',
    role: '施工员',
    phone: '132****2222',
    status: 1,
    createTime: '2024-01-08 15:10:00'
  }
])

// 选择相关
const selectAll = ref(false)
const selectedUsers = ref<number[]>([])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(8)

// 计算属性
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 方法
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedUsers.value = users.value.map(user => user.id)
  } else {
    selectedUsers.value = []
  }
}

const getRoleTagClass = (role: string) => {
  const roleMap: Record<string, string> = {
    '超级管理员': 'tag-success',
    '项目经理': 'tag-warning',
    '安全员': 'tag-info'
  }
  return roleMap[role] || 'tag-default'
}

const getStatusTagClass = (status: number) => {
  return status === 1 ? 'tag-success' : 'tag-danger'
}

const getStatusText = (status: number) => {
  return status === 1 ? '正常' : '禁用'
}

const formatDate = (dateStr: string) => {
  return dateStr
}

const searchUsers = () => {
  console.log('搜索用户:', searchForm.value)

  // 模拟搜索逻辑
  let filteredUsers = [...users.value]

  if (searchForm.value.username) {
    filteredUsers = filteredUsers.filter(user =>
      user.username.includes(searchForm.value.username) ||
      user.name.includes(searchForm.value.username)
    )
  }

  if (searchForm.value.phone) {
    filteredUsers = filteredUsers.filter(user =>
      user.phone.includes(searchForm.value.phone)
    )
  }

  if (searchForm.value.status !== '') {
    filteredUsers = filteredUsers.filter(user =>
      user.status.toString() === searchForm.value.status
    )
  }

  // 更新显示的用户列表（这里简化处理，实际应该分页）
  console.log('筛选后的用户:', filteredUsers)
  total.value = filteredUsers.length
}

const resetSearch = () => {
  searchForm.value = {
    username: '',
    phone: '',
    status: ''
  }
  searchUsers()
}

const addUser = () => {
  console.log('新增用户')
  // 这里实现新增用户逻辑
}

const editUser = (user: any) => {
  console.log('编辑用户:', user)
  // 这里实现编辑用户逻辑
}

const deleteUser = (user: any) => {
  if (confirm(`确定要删除用户 ${user.name} 吗？`)) {
    console.log('删除用户:', user)
    // 这里实现删除用户逻辑
  }
}

const resetPassword = (user: any) => {
  if (confirm(`确定要重置用户 ${user.name} 的密码吗？`)) {
    console.log('重置密码:', user)
    // 这里实现重置密码逻辑
  }
}

const exportUsers = () => {
  console.log('导出用户')
  // 这里实现导出逻辑
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    searchUsers()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    searchUsers()
  }
}

// 生命周期
onMounted(() => {
  searchUsers()
})
</script>

<style scoped>
.search-input, .search-select {
  padding: 6px 12px;
  border: 1px solid var(--border-base);
  border-radius: 4px;
  font-size: 14px;
}

.search-input:focus, .search-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.tag-info {
  background: #e6f7ff;
  color: var(--info-color);
  border: 1px solid #91d5ff;
}

.tag-default {
  background: #f5f5f5;
  color: var(--text-regular);
  border: 1px solid var(--border-base);
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
