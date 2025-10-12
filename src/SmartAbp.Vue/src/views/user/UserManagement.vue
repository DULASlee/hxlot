<template>
  <div class="user-management-view">
    <el-tabs
      v-model="activeTab"
      type="border-card"
    >
      <!-- 用户管理标签页 -->
      <el-tab-pane
        label="👥 用户管理"
        name="users"
      >
        <user-list-view />
      </el-tab-pane>

      <!-- 角色管理标签页 -->
      <el-tab-pane
        label="🔐 角色管理"
        name="roles"
      >
        <el-card>
          <template #header>
            <div class="card-header">
              <span>角色列表</span>
              <el-button
                type="primary"
                size="small"
              >
                <el-icon><Plus /></el-icon>
                新增角色
              </el-button>
            </div>
          </template>
          <el-table
            :data="roleList"
            border
            style="width: 100%"
          >
            <el-table-column
              prop="name"
              label="角色名称"
              width="150"
            />
            <el-table-column
              prop="description"
              label="描述"
            />
            <el-table-column
              prop="userCount"
              label="用户数量"
              width="120"
            />
            <el-table-column
              label="操作"
              width="200"
            >
              <template #default>
                <el-button
                  type="primary"
                  size="small"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 权限管理标签页 -->
      <el-tab-pane
        label="🔑 权限管理"
        name="permissions"
      >
        <el-card>
          <template #header>
            <span>权限列表</span>
          </template>
          <el-tree
            :data="permissionTree"
            show-checkbox
            node-key="id"
            :props="{ children: 'children', label: 'label' }"
          />
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import UserListView from './UserListView.vue'

const activeTab = ref('users')

// 角色列表（占位数据）
const roleList = ref([
  { id: 1, name: '超级管理员', description: '拥有所有权限', userCount: 2 },
  { id: 2, name: '管理员', description: '系统管理权限', userCount: 5 },
  { id: 3, name: '普通用户', description: '基本使用权限', userCount: 50 },
  { id: 4, name: '访客', description: '只读权限', userCount: 100 }
])

// 权限树（占位数据）
const permissionTree = ref([
  {
    id: 1,
    label: '系统管理',
    children: [
      { id: 11, label: '用户管理' },
      { id: 12, label: '角色管理' },
      { id: 13, label: '权限管理' }
    ]
  },
  {
    id: 2,
    label: '内容管理',
    children: [
      { id: 21, label: '文章管理' },
      { id: 22, label: '分类管理' },
      { id: 23, label: '标签管理' }
    ]
  },
  {
    id: 3,
    label: '数据管理',
    children: [
      { id: 31, label: '数据导入' },
      { id: 32, label: '数据导出' },
      { id: 33, label: '数据备份' }
    ]
  }
])
</script>

<style scoped>
.user-management-view {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-tabs__header) {
  margin: 0;
}

:deep(.el-tabs__content) {
  padding: 0;
}
</style>

