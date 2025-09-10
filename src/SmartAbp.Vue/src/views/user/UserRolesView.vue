<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">
        角色权限管理
      </h2>
      <div class="page-actions">
        <button class="btn btn-primary">
          新增角色
        </button>
      </div>
    </div>

    <div class="roles-layout">
      <!-- 角色列表 -->
      <div class="roles-panel">
        <h3 class="panel-title">
          角色列表
        </h3>
        <div class="roles-list">
          <div
            v-for="role in roleList"
            :key="role.id"
            class="role-item"
            :class="{ active: selectedRole?.id === role.id }"
            @click="selectRole(role)"
          >
            <div class="role-info">
              <div class="role-name">
                {{ role.name }}
              </div>
              <div class="role-desc">
                {{ role.description }}
              </div>
            </div>
            <div class="role-actions">
              <button
                class="btn btn-sm btn-primary"
                @click.stop="editRole(role)"
              >
                编辑
              </button>
              <button
                class="btn btn-sm btn-danger"
                @click.stop="deleteRole(role)"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 权限配置 -->
      <div class="permissions-panel">
        <h3 class="panel-title">
          权限配置
          <span
            v-if="selectedRole"
            class="selected-role"
          >- {{ selectedRole.name }}</span>
        </h3>

        <div
          v-if="selectedRole"
          class="permissions-content"
        >
          <!-- 权限树 -->
          <div class="permission-tree">
            <div
              v-for="menu in menuTree"
              :key="menu.id"
              class="tree-node"
            >
              <!-- 一级菜单 -->
              <div
                class="tree-node-content"
                @click="toggleNode(menu)"
              >
                <span
                  class="tree-expand-icon"
                  :class="{ expanded: menu.expanded }"
                >▶</span>
                <input
                  type="checkbox"
                  class="tree-checkbox"
                  :checked="isMenuChecked(menu)"
                  @change="handleMenuCheck(menu, $event)"
                >
                <span class="tree-label">{{ menu.name }}</span>
              </div>

              <!-- 二级菜单 -->
              <div
                v-if="menu.expanded && menu.children"
                class="tree-children"
              >
                <div
                  v-for="submenu in menu.children"
                  :key="submenu.id"
                  class="tree-node"
                >
                  <div
                    class="tree-node-content"
                    @click="toggleNode(submenu)"
                  >
                    <span class="tree-indent" />
                    <span
                      class="tree-expand-icon"
                      :class="{ expanded: submenu.expanded }"
                    >▶</span>
                    <input
                      type="checkbox"
                      class="tree-checkbox"
                      :checked="isMenuChecked(submenu)"
                      @change="handleMenuCheck(submenu, $event)"
                    >
                    <span class="tree-label">{{ submenu.name }}</span>
                  </div>

                  <!-- 按钮权限 -->
                  <div
                    v-if="submenu.expanded && submenu.buttons"
                    class="tree-children"
                  >
                    <div
                      v-for="button in submenu.buttons"
                      :key="button.id"
                      class="tree-node"
                    >
                      <div class="tree-node-content">
                        <span class="tree-indent" />
                        <span class="tree-indent" />
                        <input
                          type="checkbox"
                          class="tree-checkbox"
                          :checked="isButtonChecked(button)"
                          @change="handleButtonCheck(button, $event)"
                        >
                        <span class="tree-label">{{ button.name }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 保存按钮 -->
          <div class="permissions-actions">
            <button
              class="btn btn-primary"
              @click="savePermissions"
            >
              保存权限
            </button>
            <button
              class="btn btn-default"
              @click="resetPermissions"
            >
              重置
            </button>
          </div>
        </div>

        <div
          v-else
          class="empty-state"
        >
          <div class="empty-icon">
            🔑
          </div>
          <p>请选择一个角色来配置权限</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Props definition (currently unused but may be needed for future enhancements)
// const props = defineProps<{
//   userInfo: any
// }>()

interface Role {
  id: number
  name: string
  description?: string
  permissions: number[]
}

interface ButtonItem {
  id: number
  name: string
}

interface MenuNode {
  id: number
  name: string
  expanded?: boolean
  children?: MenuNode[]
  buttons?: ButtonItem[]
}

// 角色列表
const roleList = ref<Role[]>([
  {
    id: 1,
    name: '超级管理员',
    description: '拥有系统所有权限',
    permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  {
    id: 2,
    name: '项目经理',
    description: '项目管理相关权限',
    permissions: [1, 2, 3, 7, 8, 9]
  },
  {
    id: 3,
    name: '安全员',
    description: '安全管理相关权限',
    permissions: [1, 4, 5, 6]
  }
])

// 菜单权限树
const menuTree = ref<MenuNode[]>([
  {
    id: 1,
    name: '系统管理',
    expanded: true,
    children: [
      {
        id: 2,
        name: '用户管理',
        expanded: true,
        buttons: [
          { id: 7, name: '新增' },
          { id: 8, name: '编辑' },
          { id: 9, name: '删除' }
        ]
      },
      {
        id: 3,
        name: '角色管理',
        expanded: false,
        buttons: [
          { id: 10, name: '新增' },
          { id: 11, name: '编辑' },
          { id: 12, name: '删除' }
        ]
      }
    ]
  },
  {
    id: 4,
    name: '项目管理',
    expanded: false,
    children: [
      {
        id: 5,
        name: '项目列表',
        expanded: false,
        buttons: []
      }
    ]
  },
  {
    id: 6,
    name: '考勤管理',
    expanded: false,
    children: []
  }
])

 // 选中的角色
 const selectedRole = ref<Role | null>(null)

// 方法
const selectRole = (role: Role) => {
  selectedRole.value = role
}

const editRole = (role: Role) => {
  alert(`编辑角色: ${role.name}`)
}

const deleteRole = (role: Role) => {
  if (confirm(`确定要删除角色 ${role.name} 吗？`)) {
    console.log('删除角色:', role)
  }
}

const toggleNode = (node: MenuNode) => {
  node.expanded = !node.expanded
}

const isMenuChecked = (menu: MenuNode): boolean => {
  if (!selectedRole.value) return false
  const sr = selectedRole.value as Role
  return sr.permissions.includes(menu.id)
}

const isButtonChecked = (button: ButtonItem): boolean => {
  if (!selectedRole.value) return false
  const sr = selectedRole.value as Role
  return sr.permissions.includes(button.id)
}

const handleMenuCheck = (menu: MenuNode, event: Event) => {
  if (!selectedRole.value) return

  const checked = (event.target as HTMLInputElement).checked
  const sr = selectedRole.value as Role
  if (checked) {
    if (!sr.permissions.includes(menu.id)) {
      sr.permissions.push(menu.id)
    }
  } else {
    const index = sr.permissions.indexOf(menu.id)
    if (index > -1) {
      sr.permissions.splice(index, 1)
    }
  }
}

const handleButtonCheck = (button: ButtonItem, event: Event) => {
  if (!selectedRole.value) return

  const checked = (event.target as HTMLInputElement).checked
  const sr = selectedRole.value as Role
  if (checked) {
    if (!sr.permissions.includes(button.id)) {
      sr.permissions.push(button.id)
    }
  } else {
    const index = sr.permissions.indexOf(button.id)
    if (index > -1) {
      sr.permissions.splice(index, 1)
    }
  }
}

const savePermissions = () => {
  if (!selectedRole.value) return

  console.log('保存权限:', selectedRole.value)
  alert('权限保存成功！')
}

const resetPermissions = () => {
  if (!selectedRole.value) return

  if (confirm('确定要重置权限配置吗？')) {
    // 重置逻辑
    console.log('重置权限')
  }
}

onMounted(() => {
  // 默认选中第一个角色
  if (roleList.value.length > 0) {
    selectedRole.value = roleList.value[0] as Role
  }
})
</script>

<style scoped>
.page-container {
  background: white;
  border-radius: clamp(4px, 1vw, 8px);
  padding: clamp(16px, 4vw, 32px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  width: 100%;
  /* 使用弹性伸缩，避免固定高度导致被父容器居中约束 */
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  /* 内容区内部滚动，避免整个页面出现额外空白或被限制为小盒子 */
  overflow: auto;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(16px, 3vh, 24px);
  padding-bottom: clamp(12px, 2vh, 16px);
  border-bottom: 1px solid #f2f3f5;
  flex-shrink: 0;
}

.page-title {
  font-size: clamp(18px, 4vw, 28px);
  font-weight: 600;
  color: #1f2329;
  margin: 0;
}

.roles-layout {
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(400px, 2fr);
  gap: clamp(16px, 3vw, 32px);
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.roles-panel, .permissions-panel {
  background: #f7f8fa;
  border-radius: clamp(4px, 1vw, 8px);
  padding: clamp(16px, 3vw, 24px);
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2329;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.selected-role {
  color: #1e3a5f;
  font-weight: 500;
}

.roles-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-item {
  background: white;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.role-item:hover {
  border-color: #1e3a5f;
  box-shadow: 0 2px 8px rgba(30, 58, 95, 0.1);
}

.role-item.active {
  border-color: #1e3a5f;
  background: #e6f7ff;
}

.role-info {
  margin-bottom: 12px;
}

.role-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2329;
  margin-bottom: 4px;
}

.role-desc {
  font-size: 14px;
  color: #4e5969;
}

.role-actions {
  display: flex;
  gap: 8px;
}

.permissions-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.permission-tree {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
}

.tree-node {
  margin-bottom: 4px;
}

.tree-node-content {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.3s;
}

.tree-node-content:hover {
  background: rgba(30, 58, 95, 0.05);
}

.tree-expand-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  transition: transform 0.3s;
  font-size: 12px;
  color: #4e5969;
}

.tree-expand-icon.expanded {
  transform: rotate(90deg);
}

.tree-checkbox {
  margin-right: 8px;
}

.tree-label {
  flex: 1;
  color: #1f2329;
  font-size: 14px;
}

.tree-indent {
  width: 24px;
}

.tree-children {
  margin-left: 16px;
}

.permissions-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e5e6eb;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #86909c;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
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

@media (max-width: 768px) {
  .roles-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .role-actions {
    flex-direction: column;
  }

  .permissions-actions {
    flex-direction: column;
  }
}
</style>
