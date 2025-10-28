<template>
  <div class="user-management-view">
    <el-card>
      <template #header>
        <span>用户管理</span>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane
          label="用户列表"
          name="list"
        >
          <el-table
            v-loading="loading"
            :data="users"
            style="width: 100%"
          >
            <el-table-column
              prop="id"
              label="ID"
              width="80"
            />
            <el-table-column
              prop="userName"
              label="用户名"
            />
            <el-table-column
              prop="email"
              label="邮箱"
            />
            <el-table-column
              prop="roles"
              label="角色"
            >
              <template #default="scope">
                <el-tag
                  v-for="role in scope.row.roles"
                  :key="role"
                  size="small"
                  style="margin-right: 4px"
                >
                  {{ role }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="200"
            >
              <template #default="scope">
                <el-button
                  size="small"
                  @click="handleEditRoles(scope.row)"
                >
                  分配角色
                </el-button>
                <el-button
                  size="small"
                  type="primary"
                  @click="handleEditPermissions(scope.row)"
                >
                  权限
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane
          label="角色管理"
          name="roles"
        >
          <el-button
            type="primary"
            @click="handleAddRole"
          >
            新增角色
          </el-button>
          <el-table
            :data="roles"
            style="width: 100%; margin-top: 20px"
          >
            <el-table-column
              prop="name"
              label="角色名称"
            />
            <el-table-column
              prop="description"
              label="描述"
            />
            <el-table-column
              label="操作"
              width="180"
            >
              <template #default="scope">
                <el-button
                  size="small"
                  @click="handleEditRole(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="handleDeleteRole(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane
          label="权限管理"
          name="permissions"
        >
          <el-tree
            :data="permissionTree"
            show-checkbox
            node-key="id"
            :default-expanded-keys="[]"
            :default-checked-keys="[]"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <span>{{ node.label }}</span>
                <span>{{ data.description }}</span>
              </span>
            </template>
          </el-tree>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'

interface User {
  id: string
  userName: string
  email: string
  roles: string[]
}

interface Role {
  name: string
  description: string
}

interface PermissionNode {
  id: string
  label: string
  description: string
  children?: PermissionNode[]
}

const loading = ref(false)
const activeTab = ref('list')
const users = ref<User[]>([])
const roles = ref<Role[]>([])
const permissionTree = ref<PermissionNode[]>([])

const loadData = async () => {
  loading.value = true
  try {
    // TODO: 调用真实API
    users.value = []
    roles.value = []
    permissionTree.value = []
    ElMessage.info('用户管理API待实现')
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleEditRoles = (row: User) => {
  ElMessage.info(`分配角色: ${row.userName}`)
}

const handleEditPermissions = (row: User) => {
  ElMessage.info(`编辑权限: ${row.userName}`)
}

const handleAddRole = () => {
  ElMessage.info('新增角色功能待实现')
}

const handleEditRole = (row: Role) => {
  ElMessage.info(`编辑角色: ${row.name}`)
}

const handleDeleteRole = (row: Role) => {
  ElMessage.info(`删除角色: ${row.name}`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.user-management-view {
  padding: var(--spacing-5);
}

.custom-tree-node {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding-right: 20px;
}
</style>

