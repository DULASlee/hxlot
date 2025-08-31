<template>
  <div id="app">
    <!-- 登录界面 -->
    <div v-if="!isAuthenticated" class="login-container">
      <LoginForm @login-success="handleLoginSuccess" />
    </div>

    <!-- 企业级管理系统主框架 -->
    <div v-else class="admin-container">
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
          <div class="header-nav-item" @click="showUserMenu = !showUserMenu">
            <div class="user-avatar">{{ (currentUser?.userName || 'U').charAt(0).toUpperCase() }}</div>
            <span>{{ currentUser?.userName || '用户' }}</span>
            <span class="dropdown-arrow">▼</span>

            <!-- 用户下拉菜单 -->
            <div v-if="showUserMenu" class="user-dropdown">
              <div class="dropdown-item" @click="viewProfile">
                <span>👤</span>
                <span>个人资料</span>
              </div>
              <div class="dropdown-item" @click="changePassword">
                <span>🔑</span>
                <span>修改密码</span>
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item" @click="handleLogout">
                <span>🚪</span>
                <span>退出登录</span>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <!-- 主体 -->
      <div class="admin-body">
        <!-- 主菜单栏 -->
        <aside class="admin-sidebar" :class="{ collapsed: sidebarCollapsed }">
          <!-- 收起/展开按钮 -->
          <div class="sidebar-toggle">
            <button class="toggle-btn" @click="sidebarCollapsed = !sidebarCollapsed">
              <span v-if="sidebarCollapsed">☰</span>
              <span v-else>◀</span>
            </button>
          </div>

          <nav class="sidebar-menu">
            <!-- 工作台 -->
            <div class="menu-item-level1">
              <div
                class="menu-item-header"
                :class="{ active: currentView === 'dashboard' && !activeMainMenu }"
                @click="switchView('dashboard')"
              >
                <span class="menu-icon">📊</span>
                <span class="menu-text">工作台</span>
              </div>
            </div>

            <!-- 系统管理 -->
            <div class="menu-item-level1">
              <div
                class="menu-item-header"
                :class="{ active: activeMainMenu === 'system' }"
                @click="setActiveMainMenu('system')"
              >
                <span class="menu-icon">⚙️</span>
                <span class="menu-text">系统管理</span>
                <span class="menu-arrow">▶</span>
              </div>
            </div>

            <!-- 项目管理 -->
            <div class="menu-item-level1">
              <div
                class="menu-item-header"
                :class="{ active: activeMainMenu === 'project' }"
                @click="setActiveMainMenu('project')"
              >
                <span class="menu-icon">🏗️</span>
                <span class="menu-text">项目管理</span>
                <span class="menu-arrow">▶</span>
              </div>
            </div>

            <!-- 考勤管理 -->
            <div class="menu-item-level1">
              <div
                class="menu-item-header"
                :class="{ active: activeMainMenu === 'attendance' }"
                @click="setActiveMainMenu('attendance')"
              >
                <span class="menu-icon">👥</span>
                <span class="menu-text">考勤管理</span>
                <span class="menu-arrow">▶</span>
              </div>
            </div>

            <!-- 设备管理 -->
            <div class="menu-item-level1">
              <div
                class="menu-item-header"
                :class="{ active: activeMainMenu === 'equipment' }"
                @click="setActiveMainMenu('equipment')"
              >
                <span class="menu-icon">🔧</span>
                <span class="menu-text">设备管理</span>
                <span class="menu-arrow">▶</span>
              </div>
            </div>
          </nav>
        </aside>

        <!-- 副菜单栏 -->
        <aside v-if="activeMainMenu && !sidebarCollapsed" class="admin-submenu">
          <div class="submenu-header">
            <h3>{{ getMainMenuTitle(activeMainMenu) }}</h3>
          </div>
          <nav class="submenu-nav">
            <!-- 系统管理副菜单 -->
            <template v-if="activeMainMenu === 'system'">
              <a
                class="submenu-item"
                :class="{ active: currentView === 'users' }"
                @click="switchView('users')"
              >
                <span class="submenu-icon">👤</span>
                <span>用户管理</span>
              </a>
              <a
                class="submenu-item"
                :class="{ active: currentView === 'roles' }"
                @click="switchView('roles')"
              >
                <span class="submenu-icon">🔐</span>
                <span>角色管理</span>
              </a>
              <a class="submenu-item">
                <span class="submenu-icon">📋</span>
                <span>菜单管理</span>
              </a>
              <a class="submenu-item">
                <span class="submenu-icon">📚</span>
                <span>字典管理</span>
              </a>
            </template>

            <!-- 项目管理副菜单 -->
            <template v-if="activeMainMenu === 'project'">
              <a class="submenu-item" @click="switchView('project-list')">
                <span class="submenu-icon">📝</span>
                <span>项目列表</span>
              </a>
              <a class="submenu-item" @click="switchView('project-progress')">
                <span class="submenu-icon">📊</span>
                <span>项目进度</span>
              </a>
              <a class="submenu-item" @click="switchView('project-team')">
                <span class="submenu-icon">👥</span>
                <span>项目团队</span>
              </a>
            </template>

            <!-- 考勤管理副菜单 -->
            <template v-if="activeMainMenu === 'attendance'">
              <a class="submenu-item" @click="switchView('attendance-realtime')">
                <span class="submenu-icon">⏰</span>
                <span>实时考勤</span>
              </a>
              <a class="submenu-item" @click="switchView('attendance-records')">
                <span class="submenu-icon">📋</span>
                <span>考勤记录</span>
              </a>
              <a class="submenu-item" @click="switchView('attendance-stats')">
                <span class="submenu-icon">📈</span>
                <span>考勤统计</span>
              </a>
            </template>

            <!-- 设备管理副菜单 -->
            <template v-if="activeMainMenu === 'equipment'">
              <a class="submenu-item" @click="switchView('equipment-tower')">
                <span class="submenu-icon">🏗️</span>
                <span>塔吊监控</span>
              </a>
              <a class="submenu-item" @click="switchView('equipment-elevator')">
                <span class="submenu-icon">🏢</span>
                <span>升降机监控</span>
              </a>
              <a class="submenu-item" @click="switchView('equipment-maintenance')">
                <span class="submenu-icon">🔧</span>
                <span>设备维护</span>
              </a>
              <a class="submenu-item" @click="switchView('equipment-alerts')">
                <span class="submenu-icon">⚠️</span>
                <span>报警记录</span>
              </a>
            </template>
          </nav>
        </aside>

        <!-- 主内容区 -->
        <main class="admin-main">
          <!-- Tab栏 -->
          <div class="admin-tabs">
            <!-- 收起按钮移到Tab栏最左侧 -->
            <div class="tabs-actions-left">
              <button class="tab-action-btn" @click="sidebarCollapsed = !sidebarCollapsed">
                <span v-if="sidebarCollapsed">☰</span>
                <span v-else>◀</span>
              </button>
            </div>

            <div class="tabs-container">
              <div
                v-for="tab in openTabs"
                :key="tab.id"
                class="tab-item"
                :class="{ active: tab.id === currentView }"
                @click="switchView(tab.id)"
              >
                <span>{{ tab.title }}</span>
                <span v-if="tab.closable" class="tab-close" @click.stop="closeTab(tab.id)">×</span>
              </div>
            </div>
          </div>

          <!-- 内容区 -->
          <div class="admin-content">
            <!-- 工作台 -->
            <DashboardView v-if="currentView === 'dashboard'" :user-info="currentUser" />

            <!-- 用户管理 -->
            <UserListView v-else-if="currentView === 'users'" :user-info="currentUser" />

            <!-- 角色管理 -->
            <UserRolesView v-else-if="currentView === 'roles'" :user-info="currentUser" />

            <!-- 默认页面 -->
            <div v-else class="page-container">
              <div class="page-header">
                <h2 class="page-title">页面开发中</h2>
              </div>
              <div class="empty-state">
                <div class="empty-icon">🚧</div>
                <h3>功能开发中</h3>
                <p>该功能正在开发中，敬请期待...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import LoginForm from './components/LoginForm.vue'
import DashboardView from './components/DashboardView.vue'
import UserListView from './components/UserListView.vue'
import UserRolesView from './components/UserRolesView.vue'
import { getStoredAuth, clearAuth } from './utils/auth'

// 响应式数据
const isAuthenticated = ref(false)
const currentUser = ref(null)
const loginTime = ref('')
const showUserMenu = ref(false)
const sidebarCollapsed = ref(false)
const currentView = ref('dashboard')
const activeMainMenu = ref('')

// Tab管理
const openTabs = ref([
  { id: 'dashboard', title: '工作台', closable: false }
])

// 方法
const handleLoginSuccess = (authData) => {
  isAuthenticated.value = true
  currentUser.value = authData.user
  loginTime.value = new Date().toLocaleString()

  console.log('登录成功:', authData)
}

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    clearAuth()
    isAuthenticated.value = false
    currentUser.value = null
    showUserMenu.value = false
    currentView.value = 'dashboard'
    activeMainMenu.value = ''
    openTabs.value = [{ id: 'dashboard', title: '工作台', closable: false }]
  }
}

const viewProfile = () => {
  showUserMenu.value = false
  alert('个人资料功能开发中...')
}

const changePassword = () => {
  showUserMenu.value = false
  alert('修改密码功能开发中...')
}

const setActiveMainMenu = (menuKey) => {
  if (activeMainMenu.value === menuKey) {
    activeMainMenu.value = ''
  } else {
    activeMainMenu.value = menuKey
  }
}

const getMainMenuTitle = (menuKey) => {
  const titles = {
    'system': '系统管理',
    'project': '项目管理',
    'attendance': '考勤管理',
    'equipment': '设备管理'
  }
  return titles[menuKey] || '菜单'
}

const switchView = (viewId) => {
  currentView.value = viewId
  showUserMenu.value = false

  // 如果切换到工作台，清除主菜单选择
  if (viewId === 'dashboard') {
    activeMainMenu.value = ''
  }

  // 添加到Tab栏
  const tabExists = openTabs.value.find(tab => tab.id === viewId)
  if (!tabExists) {
    const tabTitles = {
      'dashboard': '工作台',
      'users': '用户管理',
      'roles': '角色管理',
      'project-list': '项目列表',
      'project-progress': '项目进度',
      'project-team': '项目团队',
      'attendance-realtime': '实时考勤',
      'attendance-records': '考勤记录',
      'attendance-stats': '考勤统计',
      'equipment-tower': '塔吊监控',
      'equipment-elevator': '升降机监控',
      'equipment-maintenance': '设备维护',
      'equipment-alerts': '报警记录'
    }

    openTabs.value.push({
      id: viewId,
      title: tabTitles[viewId] || '未知页面',
      closable: viewId !== 'dashboard'
    })
  }
}

const closeTab = (tabId) => {
  const index = openTabs.value.findIndex(tab => tab.id === tabId)
  if (index > -1) {
    openTabs.value.splice(index, 1)

    // 如果关闭的是当前Tab，切换到工作台
    if (currentView.value === tabId) {
      currentView.value = 'dashboard'
      activeMainMenu.value = ''
    }
  }
}

// 初始化
onMounted(() => {
  const storedAuth = getStoredAuth()
  if (storedAuth && storedAuth.token) {
    isAuthenticated.value = true
    currentUser.value = storedAuth.user
    loginTime.value = storedAuth.loginTime || new Date().toLocaleString()
  }

  // 点击外部关闭用户菜单
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-nav-item')) {
      showUserMenu.value = false
    }
  })
})
</script>

<style scoped>
@import './styles/submenu.css';

/* 全局重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
             'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue',
             Helvetica, Arial, sans-serif;
  font-size: 14px;
  color: #1f2329;
  background: #f7f8fa;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
}

/* 登录容器 */
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: fixed;
  top: 0;
  left: 0;
}

/* 企业级管理框架 - 真正的全屏响应式 */
.admin-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
}

/* 顶部导航栏 */
.admin-header {
  height: 60px;
  background: linear-gradient(135deg, #1e3a5f 0%, #2a4d7a 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  position: relative;
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
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.dropdown-arrow {
  font-size: 10px;
  transition: transform 0.3s;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  padding: 8px 0;
  z-index: 1001;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: #1f2329;
  cursor: pointer;
  transition: background 0.3s;
}

.dropdown-item:hover {
  background: #f7f8fa;
}

.dropdown-divider {
  height: 1px;
  background: #e5e6eb;
  margin: 4px 0;
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
  background: #001529;
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
  background: #002140;
}

.menu-item-header.active {
  color: white;
  background: #1e3a5f;
}

.menu-item-header.active::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #1890ff;
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
  background: #002140;
}

.menu-item-level2.active {
  color: #1890ff;
  background: #002140;
}

/* 主内容区 - 完全响应式 */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0; /* 重要：允许flex子项收缩 */
  width: calc(100vw - clamp(200px, 15vw, 280px)); /* 减去侧边栏宽度 */
}

.admin-sidebar.collapsed + .admin-main {
  width: calc(100vw - 64px); /* 侧边栏收起时的宽度 */
}

/* Tab栏 - 响应式高度 */
.admin-tabs {
  height: clamp(36px, 4vh, 48px); /* 响应式高度：最小36px，最大48px */
  background: white;
  border-bottom: 1px solid #e5e6eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(8px, 2vw, 20px); /* 响应式内边距 */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}

.tabs-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: clamp(4px, 1vw, 12px); /* 响应式间距 */
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE */
}

.tabs-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}

.tab-item {
  display: flex;
  align-items: center;
  padding: clamp(4px, 1vh, 8px) clamp(8px, 2vw, 16px); /* 响应式内边距 */
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  font-size: clamp(11px, 1.5vw, 14px); /* 响应式字体 */
  color: #4e5969;
  min-width: fit-content;
}

.tab-item:hover {
  color: #1e3a5f;
  border-color: #1e3a5f;
  transform: translateY(-1px);
}

.tab-item.active {
  background: #1e3a5f;
  color: white;
  border-color: #1e3a5f;
}

.tab-close {
  margin-left: clamp(4px, 1vw, 8px);
  width: clamp(12px, 2vw, 16px);
  height: clamp(12px, 2vw, 16px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
  font-size: clamp(10px, 1.2vw, 12px);
}

.tab-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.tab-item.active .tab-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.tabs-actions {
  display: flex;
  gap: clamp(4px, 1vw, 8px);
  flex-shrink: 0;
}

.tab-action-btn {
  padding: clamp(2px, 0.5vh, 6px) clamp(6px, 1.5vw, 12px);
  background: none;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  cursor: pointer;
  font-size: clamp(10px, 1.2vw, 12px);
  color: #4e5969;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-action-btn:hover {
  color: #1e3a5f;
  border-color: #1e3a5f;
  transform: translateY(-1px);
}

/* 内容区 - 完全自适应 */
.admin-content {
  flex: 1;
  padding: clamp(12px, 3vw, 24px); /* 响应式内边距 */
  overflow-y: auto;
  overflow-x: hidden;
  background: #f7f8fa;
  height: calc(100vh - 60px - clamp(36px, 4vh, 48px)); /* 减去顶部导航和Tab栏高度 */
  min-height: 0; /* 重要：允许滚动 */
}

/* 页面容器 - 完全响应式 */
.page-container {
  background: white;
  border-radius: clamp(4px, 1vw, 8px);
  padding: clamp(16px, 4vw, 32px); /* 响应式内边距 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  min-height: calc(100vh - 60px - clamp(36px, 4vh, 48px) - clamp(24px, 6vw, 48px)); /* 自适应最小高度 */
  width: 100%;
  max-width: 100%;
  overflow: hidden;
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

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #86909c;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  margin-bottom: 8px;
  color: #4e5969;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
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

  .header-nav {
    gap: 12px;
  }

  .header-nav-item span:not(.dropdown-arrow) {
    display: none;
  }

  .admin-tabs {
    padding: 0 8px;
  }

  .admin-content {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .header-logo span {
    display: none;
  }

  .tabs-container {
    gap: 4px;
  }

  .tab-item {
    padding: 4px 8px;
    font-size: 12px;
  }
}
</style>
