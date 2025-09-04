<template>
  <div class="smart-abp-layout" :class="themeStore.themeClass">
    <!-- 顶部导航栏 -->
    <header class="top-navbar">
      <div class="navbar-left">
        <img src="/logo.svg" alt="SmartAbp" class="logo" />
        <span class="brand-name">SmartAbp</span>
      </div>

      <nav class="navbar-center">
        <a href="#" class="nav-link" @click="navigateToExternal('智慧工地')">智慧工地</a>
        <a href="#" class="nav-link" @click="navigateToExternal('MES')">MES</a>
        <a href="#" class="nav-link" @click="navigateToExternal('系统配置')">系统配置</a>
        <a href="#" class="nav-link" @click="navigateToExternal('APP')">APP</a>
      </nav>

      <div class="navbar-right">
        <div class="theme-selector">
          <button class="theme-btn" @click="toggleThemeMenu" title="主题选择">
            <span class="theme-icon">{{ themeStore.isDark ? '🌙' : '☀️' }}</span>
          </button>
          <div v-if="showThemeMenu" class="theme-dropdown">
            <div class="theme-option" @click="quickToggleDark" :class="{ active: false }">
              <span class="theme-icon">{{ themeStore.isDark ? '☀️' : '🌙' }}</span>
              <span>{{ themeStore.isDark ? '切换到浅色' : '切换到深色' }}</span>
            </div>
            <div class="theme-divider"></div>
            <div class="theme-option" @click="setTheme('light')" :class="{ active: themeStore.themeClass === 'light' }">
              <span class="theme-icon">☀️</span>
              <span>浅色主题</span>
            </div>
            <div class="theme-option" @click="setTheme('dark')" :class="{ active: themeStore.themeClass === 'dark' }">
              <span class="theme-icon">🌙</span>
              <span>深色主题</span>
            </div>
            <div class="theme-option" @click="setTheme('tech')" :class="{ active: themeStore.themeClass === 'tech' }">
              <span class="theme-icon">🚀</span>
              <span>科技蓝</span>
            </div>
            <div class="theme-option" @click="setTheme('auto')" :class="{ active: themeStore.currentTheme === 'auto' }">
              <span class="theme-icon">💻</span>
              <span>跟随系统</span>
            </div>
          </div>
        </div>
        <button class="icon-btn" @click="openSettings" title="设置">
          <i class="fas fa-cog"></i>
        </button>
        <div class="user-menu" @click="toggleUserDropdown">
          <img src="/logo.svg" alt="用户头像" class="user-avatar" />
          <span class="username">{{ userInfo.name || '用户' }}</span>
          <i class="fas fa-chevron-down dropdown-icon"></i>

          <div v-if="showUserDropdown" class="user-dropdown">
            <a href="#" @click="goToProfile">个人信息</a>
            <a href="#" @click="logout">退出登录</a>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <div class="main-container">
      <!-- 侧边栏 -->
      <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <button class="collapse-btn" @click="toggleSidebar">
            <i :class="sidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
          </button>
        </div>

        <nav class="sidebar-nav">
          <div v-for="item in menuItems" :key="item.key" class="nav-item">
            <div
              class="nav-link"
              :class="{ active: activeMenu === item.key, 'has-children': item.children }"
              @click="toggleMenu(item)"
            >
              <i :class="item.icon"></i>
              <span v-if="!sidebarCollapsed" class="nav-text">{{ item.title }}</span>
              <i v-if="item.children && !sidebarCollapsed"
                 :class="['fas fa-chevron-down', 'expand-icon', { expanded: expandedMenus.includes(item.key) }]">
              </i>
            </div>

            <div v-if="item.children"
                 class="sub-menu"
                 :class="{ 
                   expanded: expandedMenus.includes(item.key), 
                   collapsed: sidebarCollapsed 
                 }"
                 v-show="expandedMenus.includes(item.key)">
              <div v-for="child in item.children" :key="child.key"
                   class="sub-nav-link"
                   :class="{ active: activeSubMenu === child.key }"
                   @click="selectSubMenu(child)">
                <i :class="child.icon"></i>
                <span class="nav-text">{{ child.title }}</span>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      <!-- 内容区域 -->
      <main class="content-area">
        <!-- 标签页导航 -->
        <div class="tab-navigation" v-if="openTabs.length > 0">
          <div class="tabs-container">
            <div v-for="tab in openTabs" :key="tab.key"
                 class="tab-item"
                 :class="{ active: activeTab === tab.key }"
                 @click="switchTab(tab.key)">
              <i :class="tab.icon"></i>
              <span class="tab-title">{{ tab.title }}</span>
              <button v-if="tab.closable !== false"
                      class="tab-close"
                      @click.stop="closeTab(tab.key)">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 页面内容 -->
        <div class="page-content">
          <router-view />
        </div>
      </main>
    </div>

    <!-- 遮罩层 -->
    <div v-if="showThemeMenu || showUserDropdown" class="overlay" @click="closeAllDropdowns"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

// 响应式数据
const sidebarCollapsed = ref(false)
const showThemeMenu = ref(false)
const showUserDropdown = ref(false)
const activeMenu = ref('dashboard')
const activeSubMenu = ref('')
const expandedMenus = ref<string[]>(['system', 'projects'])
const openTabs = ref([
  { key: 'dashboard', title: '工作台', icon: 'fas fa-tachometer-alt', path: '/dashboard', closable: false }
])
const activeTab = ref('dashboard')

// 用户信息
const userInfo = ref({
  name: '管理员',
  email: 'admin@smartabp.com'
})

// 计算属性
// const currentTheme = computed(() => themeStore.currentTheme)

// 菜单配置
const menuItems = ref([
  {
    key: 'dashboard',
    title: '工作台',
    icon: 'fas fa-tachometer-alt',
    path: '/dashboard'
  },
  {
    key: 'system',
    title: '系统管理',
    icon: 'fas fa-cogs',
    children: [
      { key: 'users', title: '用户管理', icon: 'fas fa-users', path: '/dashboard/system/users' },
      { key: 'roles', title: '角色管理', icon: 'fas fa-user-shield', path: '/dashboard/system/roles' },
      { key: 'permissions', title: '权限管理', icon: 'fas fa-key', path: '/dashboard/system/permissions' }
    ]
  },
  {
    key: 'projects',
    title: '项目管理',
    icon: 'fas fa-project-diagram',
    children: [
      { key: 'project-list', title: '项目列表', icon: 'fas fa-list', path: '/dashboard/projects/list' },
      { key: 'project-analysis', title: '项目分析', icon: 'fas fa-chart-bar', path: '/dashboard/projects/analysis' }
    ]
  }
])

// 方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleThemeMenu = () => {
  showThemeMenu.value = !showThemeMenu.value
  showUserDropdown.value = false
}

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
  showThemeMenu.value = false
}

const closeAllDropdowns = () => {
  showThemeMenu.value = false
  showUserDropdown.value = false
}

const setTheme = (theme: 'light' | 'dark' | 'tech' | 'auto') => {
  themeStore.setTheme(theme)
  showThemeMenu.value = false
}

const quickToggleDark = () => {
  themeStore.toggleTheme()
}

const toggleMenu = (item: any) => {
  console.log('点击菜单项:', item)
  
  if (item.children) {
    // 如果侧边栏收缩，先展开侧边栏
    if (sidebarCollapsed.value) {
      sidebarCollapsed.value = false
    }
    
    const index = expandedMenus.value.indexOf(item.key)
    if (index > -1) {
      expandedMenus.value.splice(index, 1)
    } else {
      expandedMenus.value.push(item.key)
    }
    console.log('更新后的展开菜单:', expandedMenus.value)
  } else {
    activeMenu.value = item.key
    activeSubMenu.value = ''
    addTab(item)
    router.push(item.path)
  }
}

const selectSubMenu = (child: any) => {
  console.log('点击子菜单项:', child)
  activeSubMenu.value = child.key
  addTab(child)
  router.push(child.path)
}

const addTab = (item: any) => {
  const existingTab = openTabs.value.find(tab => tab.key === item.key)
  if (!existingTab) {
    openTabs.value.push({
      key: item.key,
      title: item.title,
      icon: item.icon,
      path: item.path,
      closable: item.key !== 'dashboard'
    })
  }
  activeTab.value = item.key
}

const switchTab = (tabKey: string) => {
  const tab = openTabs.value.find(t => t.key === tabKey)
  if (tab) {
    activeTab.value = tabKey
    router.push(tab.path)
  }
}

const closeTab = (tabKey: string) => {
  const index = openTabs.value.findIndex(tab => tab.key === tabKey)
  if (index > -1) {
    openTabs.value.splice(index, 1)

    // 如果关闭的是当前活动标签，切换到其他标签
    if (activeTab.value === tabKey) {
      const newActiveTab = openTabs.value[Math.max(0, index - 1)]
      if (newActiveTab) {
        switchTab(newActiveTab.key)
      }
    }
  }
}

const navigateToExternal = (name: string) => {
  console.log(`导航到外部系统: ${name}`)
  // 这里可以实现跳转到外部系统的逻辑
}

const openSettings = () => {
  router.push('/settings')
}

const goToProfile = () => {
  router.push('/profile')
  showUserDropdown.value = false
}

const logout = () => {
  // 清除认证信息
  localStorage.removeItem('smartabp_token')
  localStorage.removeItem('smartabp_user')

  // 跳转到登录页
  router.push('/login')
}

// 监听路由变化，更新活动状态
watch(route, (newRoute) => {
  const path = newRoute.path

  // 更新活动菜单
  for (const item of menuItems.value) {
    if (item.path === path) {
      activeMenu.value = item.key
      activeSubMenu.value = ''
      break
    }

    if (item.children) {
      for (const child of item.children) {
        if (child.path === path) {
          activeMenu.value = item.key
          activeSubMenu.value = child.key
          // 确保父菜单在展开列表中，但不覆盖现有的展开状态
          if (!expandedMenus.value.includes(item.key)) {
            expandedMenus.value.push(item.key)
          }
          break
        }
      }
    }
  }

  // 确保系统管理和项目管理菜单始终展开
  const defaultExpanded = ['system', 'projects']
  defaultExpanded.forEach(key => {
    if (!expandedMenus.value.includes(key)) {
      expandedMenus.value.push(key)
    }
  })

  // 更新活动标签
  const activeTabItem = openTabs.value.find(tab => tab.path === path)
  if (activeTabItem) {
    activeTab.value = activeTabItem.key
  }
}, { immediate: true })

onMounted(() => {
  // 初始化主题
  themeStore.initTheme()
  
  // 确保副菜单默认展开
  expandedMenus.value = ['system', 'projects']
  
  // 调试日志
  console.log('组件挂载完成:', {
    sidebarCollapsed: sidebarCollapsed.value,
    expandedMenus: expandedMenus.value,
    menuItems: menuItems.value
  })
})
</script>

<style scoped>
/* 基础布局 */
.smart-abp-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: all 0.3s ease;
}

/* 顶部导航栏 */
.top-navbar {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 24px;
  background-color: var(--navbar-bg);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar-center {
  display: flex;
  align-items: center;
  margin-left: 24px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.logo {
  width: 32px;
  height: 32px;
}

.brand-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-color);
}

.nav-link {
  padding: 8px 16px;
  margin: 0 4px;
  color: var(--text-color);
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-link:hover {
  background-color: var(--hover-bg);
  color: var(--primary-color);
}

/* 主题选择器 */
.theme-selector {
  position: relative;
}

.theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background-color: transparent;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-btn:hover {
  background-color: var(--hover-bg);
  color: var(--primary-color);
}

.theme-icon {
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  padding: 8px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  z-index: 1001;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-option:hover {
  background-color: var(--hover-bg);
}

.theme-option.active {
  background-color: var(--primary-color);
  color: white;
}

.theme-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 4px 0;
}

/* 图标按钮 */
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background-color: transparent;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background-color: var(--hover-bg);
  color: var(--primary-color);
}

/* 用户菜单 */
.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-menu:hover {
  background-color: var(--hover-bg);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  font-size: 14px;
  font-weight: 500;
}

.dropdown-icon {
  font-size: 12px;
  transition: transform 0.2s ease;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  padding: 8px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  z-index: 1001;
}

.user-dropdown a {
  display: block;
  padding: 8px 12px;
  color: var(--text-color);
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.user-dropdown a:hover {
  background-color: var(--hover-bg);
  color: var(--primary-color);
}

/* 主容器 */
.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 侧边栏 */
.sidebar {
  width: 240px;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background-color: transparent;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background-color: var(--hover-bg);
}

/* 侧边栏导航 */
.sidebar-nav {
  padding: 16px 8px;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-color);
}

.nav-link:hover {
  background-color: var(--hover-bg);
}

.nav-link.active {
  background-color: var(--primary-color);
  color: white;
}

.nav-link i {
  width: 20px;
  text-align: center;
  font-size: 16px;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.expand-icon {
  margin-left: auto;
  font-size: 12px;
  transition: transform 0.2s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

/* 子菜单 */
.sub-menu {
  margin-top: 4px;
  padding-left: 20px;
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

/* 侧边栏收缩时的子菜单样式 */
.sub-menu.collapsed {
  display: none;
  max-height: 0;
  padding-left: 0;
}

.sub-menu.expanded {
  display: block;
}

.sub-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
  font-size: 13px;
}

.sub-nav-link:hover {
  background-color: var(--hover-bg);
  color: var(--text-color);
}

.sub-nav-link.active {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.sub-nav-link i {
  width: 16px;
  text-align: center;
  font-size: 14px;
}

/* 内容区域 */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 标签页导航 */
.tab-navigation {
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.tabs-container {
  display: flex;
  align-items: center;
  padding: 0 16px;
  overflow-x: auto;
  justify-content: flex-start;
  gap: 0;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 6px 6px 0 0;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  color: var(--text-secondary);
  background-color: transparent;
  margin: 4px 2px 0 0;
  flex-shrink: 0;
}

.tab-item:hover {
  color: var(--text-color);
  background-color: var(--hover-bg);
}

.tab-item.active {
  color: var(--primary-color);
  background-color: var(--card-bg);
  border-bottom-color: var(--primary-color);
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}

.tab-title {
  font-size: 14px;
  font-weight: 500;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background-color: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 4px;
  font-size: 12px;
}

.tab-close:hover {
  background-color: var(--error-light);
  color: var(--error-color);
}

/* 页面内容 */
.page-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: var(--bg-color);
}

/* 遮罩层 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-center {
    display: none;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 60px;
    height: calc(100vh - 60px);
    z-index: 998;
    transform: translateX(-100%);
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }

  .content-area {
    margin-left: 0;
  }
}

/* 主题特定样式 */
.smart-abp-layout.light {
  --bg-color: var(--color-bgTertiary, #f5f5f5);
  --card-bg: var(--color-bgPrimary, #ffffff);
  --navbar-bg: var(--color-bgPrimary, #ffffff);
  --sidebar-bg: var(--color-bgPrimary, #ffffff);
  --text-color: var(--color-textPrimary, #333333);
  --text-secondary: var(--color-textSecondary, #666666);
  --border-color: var(--color-borderPrimary, #e0e0e0);
  --hover-bg: var(--color-bgSecondary, #f0f0f0);
  --primary-color: var(--color-primary, #1890ff);
  --primary-light: var(--color-primary-light, #e6f7ff);
  --danger-color: var(--color-error, #ff4d4f);
  --error-light: var(--color-error-50, #fff2f0);
  --error-color: var(--color-error, #ff4d4f);
}

.smart-abp-layout.dark {
  --bg-color: var(--color-bgTertiary, #141414);
  --card-bg: var(--color-bgPrimary, #1f1f1f);
  --navbar-bg: var(--color-bgPrimary, #1f1f1f);
  --sidebar-bg: var(--color-bgPrimary, #1f1f1f);
  --text-color: var(--color-textPrimary, #ffffff);
  --text-secondary: var(--color-textSecondary, #a0a0a0);
  --border-color: var(--color-borderPrimary, #303030);
  --hover-bg: var(--color-bgSecondary, #262626);
  --primary-color: var(--color-primary, #4a90e2);
  --primary-light: var(--color-primary-light, #111b26);
  --danger-color: var(--color-error, #ff7875);
  --error-light: var(--color-error-50, #2a1618);
  --error-color: var(--color-error, #ff7875);
}

.smart-abp-layout.tech {
  --bg-color: var(--color-bgTertiary, #d6ebff);
  --card-bg: var(--color-bgPrimary, #f0f8ff);
  --navbar-bg: var(--color-bgPrimary, #f0f8ff);
  --sidebar-bg: var(--color-bgPrimary, #f0f8ff);
  --text-color: var(--color-textPrimary, #002766);
  --text-secondary: var(--color-textSecondary, #003d99);
  --border-color: var(--color-borderPrimary, #b3d9ff);
  --hover-bg: var(--color-bgSecondary, #e6f4ff);
  --primary-color: var(--color-primary, #0066cc);
  --primary-light: var(--color-primary-light, #e6f4ff);
  --danger-color: var(--color-error, #ff4d4f);
  --error-light: var(--color-error-50, #fff2f0);
  --error-color: var(--color-error, #ff4d4f);
}
</style>
