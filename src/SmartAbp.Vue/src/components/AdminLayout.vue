<template>
  <!-- 企业级管理系统主框架 -->
  <div class="admin-container">
    <!-- 顶部导航栏 -->
    <header class="admin-header">
      <div class="header-logo">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="white" opacity="0.9"/>
          <path d="M8 16L12 12L16 16L20 12L24 16" stroke="#1e3a5f" stroke-width="2" stroke-linecap="round"/>
          <circle cx="16" cy="22" r="2" fill="#1e3a5f"/>
        </svg>
        <span>SmartAbp 企业管理系统</span>
      </div>

      <nav class="header-nav">
        <div class="header-nav-item">
          <span>🔔</span>
          <span>消息</span>
        </div>
        <div class="header-nav-item">
          <span>📊</span>
          <span>工作台</span>
        </div>
        <div class="header-nav-item" @click="handleLogout">
          <div class="user-avatar">{{ currentUser?.userName?.charAt(0) || 'U' }}</div>
          <span>{{ currentUser?.userName || '用户' }}</span>
        </div>
      </nav>
    </header>

    <!-- 主体布局 -->
    <div class="admin-body">
      <!-- 侧边栏 -->
      <aside class="admin-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <nav class="sidebar-menu">
          <!-- 工作台 -->
          <div class="menu-item-level1">
            <div class="menu-item-header" :class="{ active: activeMenu === 'dashboard' }" @click="switchMenu('dashboard')">
              <span class="menu-icon">📊</span>
              <span class="menu-text">工作台</span>
            </div>
          </div>

          <!-- 用户管理 -->
          <div class="menu-item-level1">
            <div class="menu-item-header" :class="{ active: activeMenu === 'users' }" @click="toggleSubmenu('users')">
              <span class="menu-icon">👥</span>
              <span class="menu-text">用户管理</span>
              <span class="menu-arrow" :class="{ expanded: expandedMenus.includes('users') }">▶</span>
            </div>
            <div class="menu-submenu" :class="{ expanded: expandedMenus.includes('users') }">
              <a class="menu-item-level2" :class="{ active: activeSubMenu === 'user-list' }" @click="switchSubMenu('user-list')">用户列表</a>
              <a class="menu-item-level2" :class="{ active: activeSubMenu === 'user-roles' }" @click="switchSubMenu('user-roles')">角色管理</a>
              <a class="menu-item-level2" :class="{ active: activeSubMenu === 'user-permissions' }" @click="switchSubMenu('user-permissions')">权限管理</a>
            </div>
          </div>

          <!-- 系统管理 -->
          <div class="menu-item-level1">
            <div class="menu-item-header" :class="{ active: activeMenu === 'system' }" @click="toggleSubmenu('system')">
              <span class="menu-icon">⚙️</span>
              <span class="menu-text">系统管理</span>
              <span class="menu-arrow" :class="{ expanded: expandedMenus.includes('system') }">▶</span>
            </div>
            <div class="menu-submenu" :class="{ expanded: expandedMenus.includes('system') }">
              <a class="menu-item-level2" :class="{ active: activeSubMenu === 'system-config' }" @click="switchSubMenu('system-config')">系统配置</a>
              <a class="menu-item-level2" :class="{ active: activeSubMenu === 'system-logs' }" @click="switchSubMenu('system-logs')">操作日志</a>
              <a class="menu-item-level2" :class="{ active: activeSubMenu === 'system-monitor' }" @click="switchSubMenu('system-monitor')">系统监控</a>
            </div>
          </div>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="admin-main">
        <!-- Tab栏 -->
        <div class="admin-tabs">
          <div class="tabs-container">
            <div v-for="tab in tabs" :key="tab.id" class="tab-item" :class="{ active: tab.active }" @click="switchTab(tab)">
              <span>{{ tab.title }}</span>
              <span v-if="tab.closable" class="tab-close" @click.stop="closeTab(tab)">×</span>
            </div>
          </div>
        </div>

        <!-- 内容区 -->
        <div class="admin-content">
          <!-- 动态内容区域 -->
          <component :is="currentComponent" :user-info="currentUser" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardView from './DashboardView.vue'
import UserListView from './UserListView.vue'
import UserRolesView from './UserRolesView.vue'

// 响应式数据
const sidebarCollapsed = ref(false)
const activeMenu = ref('dashboard')
const activeSubMenu = ref('')
const expandedMenus = ref(['users', 'system'])

// Tab管理
const tabs = ref([
  { id: 1, title: '工作台', component: 'DashboardView', closable: false, active: true },
  { id: 2, title: '用户列表', component: 'UserListView', closable: true, active: false },
  { id: 3, title: '角色管理', component: 'UserRolesView', closable: true, active: false }
])

// 当前用户信息
const currentUser = ref({
  userName: 'admin',
  email: 'admin@smartabp.com',
  role: '超级管理员'
})

// 计算当前组件
const currentComponent = computed(() => {
  const activeTab = tabs.value.find(tab => tab.active)
  return activeTab ? activeTab.component : 'DashboardView'
})

// 方法
const toggleSubmenu = (menuKey) => {
  const index = expandedMenus.value.indexOf(menuKey)
  if (index > -1) {
    expandedMenus.value.splice(index, 1)
  } else {
    expandedMenus.value.push(menuKey)
  }
}

const switchMenu = (menuKey) => {
  activeMenu.value = menuKey
  activeSubMenu.value = ''
}

const switchSubMenu = (subMenuKey) => {
  activeSubMenu.value = subMenuKey
}

const switchTab = (tab) => {
  tabs.value.forEach(t => t.active = false)
  tab.active = true
}

const closeTab = (tab) => {
  const index = tabs.value.findIndex(t => t.id === tab.id)
  if (index > -1) {
    tabs.value.splice(index, 1)
    // 如果关闭的是当前激活的tab，激活第一个tab
    if (tab.active && tabs.value.length > 0) {
      tabs.value[0].active = true
    }
  }
}

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_info')
    window.location.reload()
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  const userInfo = localStorage.getItem('user_info')
  if (userInfo) {
    try {
      currentUser.value = JSON.parse(userInfo)
    } catch (e) {
      console.error('解析用户信息失败:', e)
    }
  }
})
</script>

<style scoped>
/* 企业级配色方案 */
:root {
  --primary-color: #1e3a5f;
  --primary-light: #2a4d7a;
  --primary-lighter: #3d6195;
  --primary-dark: #152841;

  --success-color: #52c41a;
  --warning-color: #faad14;
  --danger-color: #f5222d;
  --info-color: #1890ff;

  --text-primary: #1f2329;
  --text-regular: #4e5969;
  --text-secondary: #86909c;
  --text-placeholder: #c9cdd4;

  --bg-color: #f7f8fa;
  --bg-white: #ffffff;
  --bg-header: linear-gradient(135deg, #1e3a5f 0%, #2a4d7a 100%);
  --bg-sidebar: #001529;
  --bg-sidebar-light: #002140;

  --border-base: #e5e6eb;
  --border-light: #f2f3f5;

  --shadow-base: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-light: 0 1px 4px rgba(0, 0, 0, 0.04);
  --shadow-dark: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* 布局框架 */
.admin-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部导航栏 */
.admin-header {
  height: 60px;
  background: var(--bg-header);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: var(--shadow-base);
  position: relative;
  z-index: 1000;
}

.header-logo {
  display: flex;
  align-items: center;
  color: white;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
}

.header-logo svg {
  margin-right: 12px;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-nav-item {
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
}

.header-nav-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--info-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

/* 主体布局 */
.admin-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 侧边栏 */
.admin-sidebar {
  width: 240px;
  background: var(--bg-sidebar);
  overflow-y: auto;
  transition: width 0.3s;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.admin-sidebar.collapsed {
  width: 64px;
}

.sidebar-menu {
  padding: 16px 0;
}

/* 菜单项 */
.menu-item-level1 {
  position: relative;
}

.menu-item-header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.menu-item-header:hover {
  color: white;
  background: var(--bg-sidebar-light);
}

.menu-item-header.active {
  color: white;
  background: var(--primary-color);
}

.menu-item-header.active::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--info-color);
}

.menu-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.menu-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-arrow {
  transition: transform 0.3s;
  font-size: 12px;
}

.menu-arrow.expanded {
  transform: rotate(90deg);
}

/* 二级菜单 */
.menu-submenu {
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: max-height 0.3s;
  max-height: 0;
}

.menu-submenu.expanded {
  max-height: 500px;
}

.menu-item-level2 {
  padding: 10px 20px 10px 52px;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  transition: all 0.3s;
  display: block;
  text-decoration: none;
}

.menu-item-level2:hover {
  color: white;
  background: var(--bg-sidebar-light);
}

.menu-item-level2.active {
  color: var(--info-color);
  background: var(--bg-sidebar-light);
}

/* 主内容区 */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Tab栏 */
.admin-tabs {
  height: 40px;
  background: white;
  border-bottom: 1px solid var(--border-base);
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-shadow: var(--shadow-light);
}

.tabs-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
}

.tab-item {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: var(--bg-color);
  border: 1px solid var(--border-base);
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;
  font-size: 13px;
  color: var(--text-regular);
}

.tab-item:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.tab-item.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.tab-close {
  margin-left: 8px;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s;
  font-size: 12px;
}

.tab-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.tab-item.active .tab-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 内容区 */
.admin-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: var(--bg-color);
}

/* 响应式 */
@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    left: -240px;
    top: 60px;
    bottom: 0;
    z-index: 999;
    transition: left 0.3s;
  }

  .admin-sidebar.show {
    left: 0;
  }

  .admin-tabs {
    display: none;
  }

  .header-nav {
    gap: 12px;
  }

  .header-nav-item span:last-child {
    display: none;
  }
}
</style>
