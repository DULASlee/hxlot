<template>
  <div class="smart-abp-layout">
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
        <!-- 集成新的主题切换器 -->
        <ThemeSwitcher />
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
                 :class="{ collapsed: sidebarCollapsed }"
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

      <!-- 副菜单 -->
      <aside v-if="!sidebarCollapsed" class="submenu-panel" :class="{ show: showSubmenu }">
        <div class="submenu-header">
          <h3>{{ submenuTitle }}</h3>
          <button class="close-submenu" @click="closeSubmenu">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="submenu-content">
          <template v-if="activeMenu === 'system'">
            <div class="submenu-item" @click="router.push('/Admin/users')">
              <i class="fas fa-users"></i>
              <span>用户管理</span>
            </div>
            <div class="submenu-item" @click="router.push('/Admin/roles')">
              <i class="fas fa-user-shield"></i>
              <span>角色管理</span>
            </div>
            <div class="submenu-item" @click="router.push('/Admin/permissions')">
              <i class="fas fa-key"></i>
              <span>权限管理</span>
            </div>
            <div class="submenu-item" @click="router.push('/Admin/settings')">
              <i class="fas fa-cogs"></i>
              <span>系统设置</span>
            </div>
          </template>

          <template v-else-if="activeMenu === 'projects'">
            <div class="submenu-item" @click="router.push('/Project')">
              <i class="fas fa-tasks"></i>
              <span>项目列表</span>
            </div>
            <div class="submenu-item" @click="router.push('/Project/analysis')">
              <i class="fas fa-chart-line"></i>
              <span>项目分析</span>
            </div>
          </template>

          <template v-else-if="activeMenu === 'logs'">
            <div class="submenu-item" @click="router.push('/Log')">
              <i class="fas fa-list"></i>
              <span>日志管理</span>
            </div>
            <div class="submenu-item" @click="router.push('/Log/viewer')">
              <i class="fas fa-eye"></i>
              <span>日志查看器</span>
            </div>
            <div class="submenu-item" @click="router.push('/Log/dashboard')">
              <i class="fas fa-chart-bar"></i>
              <span>日志仪表板</span>
            </div>
          </template>
        </div>
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
    <div v-if="showUserDropdown" class="overlay" @click="closeAllDropdowns"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore } from '@/stores'
import ThemeSwitcher from '@/components/theme/ThemeSwitcher.vue'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

// 响应式数据
const sidebarCollapsed = ref(false)
const showUserDropdown = ref(false)
const activeMenu = ref('dashboard')
const activeSubMenu = ref('')
const expandedMenus = ref<string[]>(['system', 'projects', 'logs'])
const openTabs = ref([
  { key: 'dashboard', title: '工作台', icon: 'fas fa-tachometer-alt', path: '/dashboard', closable: false }
])
const activeTab = ref('dashboard')

// 副菜单状态
const showSubmenu = ref(false)

// 用户信息
const userInfo = ref({
  name: '管理员',
  email: 'admin@smartabp.com'
})

// 计算属性
// const currentTheme = computed(() => themeStore.currentTheme)

// 副菜单标题
const submenuTitle = computed(() => {
  const menu = menuItems.value.find((item: any) => item.key === activeMenu.value)
  return menu ? menu.title : ''
})

// 菜单配置
const menuItems = ref([
  {
    key: 'dashboard',
    title: '工作台',
    icon: 'fas fa-chart-pie',
    path: '/dashboard'
  },
  {
    key: 'system',
    title: '系统管理',
    icon: 'fas fa-cog',
    children: [
      { key: 'system-users', title: '用户管理', icon: 'fas fa-users', path: '/Admin/users' },
      { key: 'system-roles', title: '角色管理', icon: 'fas fa-user-shield', path: '/Admin/roles' },
      { key: 'system-permissions', title: '权限管理', icon: 'fas fa-key', path: '/Admin/permissions' },
      { key: 'system-settings', title: '系统设置', icon: 'fas fa-cogs', path: '/Admin/settings' }
    ]
  },
  {
    key: 'user-management',
    title: '用户管理',
    icon: 'fas fa-users',
    children: [
      { key: 'user-list', title: '用户列表', icon: 'fas fa-list-ul', path: '/User' },
      { key: 'user-management', title: '用户管理', icon: 'fas fa-user-circle', path: '/User/management' },
      { key: 'user-roles', title: '用户角色', icon: 'fas fa-users-cog', path: '/User/roles' }
    ]
  },
  {
    key: 'projects',
    title: '项目管理',
    icon: 'fas fa-project-diagram',
    children: [
      { key: 'project-list', title: '项目列表', icon: 'fas fa-tasks', path: '/Project' },
      { key: 'project-analysis', title: '项目分析', icon: 'fas fa-chart-line', path: '/Project/analysis' }
    ]
  },
  {
    key: 'logs',
    title: '日志管理',
    icon: 'fas fa-file-alt',
    children: [
      { key: 'log-management', title: '日志管理', icon: 'fas fa-list', path: '/Log' },
      { key: 'log-viewer', title: '日志查看器', icon: 'fas fa-eye', path: '/Log/viewer' },
      { key: 'log-dashboard', title: '日志仪表板', icon: 'fas fa-chart-bar', path: '/Log/dashboard' }
    ]
  }
])

// 方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}


const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

const closeAllDropdowns = () => {
  showUserDropdown.value = false
}

// 副菜单控制函数
const toggleSubmenu = (menuId: string) => {
  if (activeMenu.value === menuId && showSubmenu.value) {
    // 如果点击的是当前激活的菜单，则关闭副菜单
    showSubmenu.value = false
  } else {
    // 否则，激活该菜单并显示副菜单
    activeMenu.value = menuId
    showSubmenu.value = true
  }
}

const closeSubmenu = () => {
  showSubmenu.value = false
}


const toggleMenu = (item: any) => {
  console.log('点击菜单项:', item)

  if (item.children) {
    // 如果侧边栏收缩，先展开侧边栏
    if (sidebarCollapsed.value) {
      sidebarCollapsed.value = false
    }

    // 同时展开主菜单二级菜单和显示副菜单
    const index = expandedMenus.value.indexOf(item.key)
    if (index > -1) {
      expandedMenus.value.splice(index, 1)
      // 如果收起主菜单二级菜单，也关闭副菜单
      showSubmenu.value = false
    } else {
      expandedMenus.value.push(item.key)
      // 展开主菜单二级菜单时，同时显示副菜单
      toggleSubmenu(item.key)
    }
    console.log('更新后的展开菜单:', expandedMenus.value)
  } else {
    // 如果是叶子菜单项，直接导航
    activeMenu.value = item.key
    activeSubMenu.value = ''
    addTab(item)
    router.push(item.path)
    // 关闭副菜单
    showSubmenu.value = false
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
  const tab = openTabs.value.find((t: any) => t.key === tabKey)
  if (tab) {
    activeTab.value = tabKey
    router.push(tab.path)
  }
}

const closeTab = (tabKey: string) => {
  const index = openTabs.value.findIndex((tab: any) => tab.key === tabKey)
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
  router.push('/Admin/settings')
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
watch(route, (newRoute: any) => {
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
  const defaultExpanded = ['system', 'projects', 'logs']
  defaultExpanded.forEach(key => {
    if (!expandedMenus.value.includes(key)) {
      expandedMenus.value.push(key)
    }
  })

  // 更新活动标签
  const activeTabItem = openTabs.value.find((tab: any) => tab.path === path)
  if (activeTabItem) {
    activeTab.value = activeTabItem.key
  }
}, { immediate: true })

onMounted(() => {
  // 初始化主题
  themeStore.init()

  // 确保副菜单默认展开
  expandedMenus.value = ['system', 'projects', 'logs']

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
  background-color: var(--theme-bg-body);
  color: var(--theme-text-primary);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 顶部导航栏 */
.top-navbar {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 24px;
  background: var(--theme-header-bg);
  border-bottom: 1px solid var(--theme-header-border);
  box-shadow: var(--theme-header-shadow);
  backdrop-filter: blur(8px);
  z-index: 1000;
  position: relative;
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
  font-size: 22px;
  font-weight: 700;
  color: var(--theme-brand-primary);
  letter-spacing: -0.02em;
}

.nav-link {
  padding: 10px 16px;
  margin: 0 4px;
  color: var(--theme-header-text);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.nav-link:hover {
  background-color: var(--theme-bg-hover);
  color: var(--theme-brand-primary);
  transform: translateY(-1px);
}

.nav-link:active {
  transform: translateY(0);
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
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background-color: transparent;
  color: var(--theme-text-secondary);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.icon-btn:hover {
  background-color: var(--theme-bg-hover);
  color: var(--theme-brand-primary);
  transform: scale(1.05);
}

.icon-btn:active {
  transform: scale(0.95);
}

/* 用户菜单 */
.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--theme-bg-component);
  border: 1px solid var(--theme-border-light);
}

.user-menu:hover {
  background-color: var(--theme-bg-hover);
  border-color: var(--theme-border-base);
  transform: translateY(-1px);
  box-shadow: var(--theme-shadow-sm);
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
  background-color: var(--theme-bg-elevated);
  border: 1px solid var(--theme-border-base);
  border-radius: 12px;
  box-shadow: var(--theme-shadow-lg);
  min-width: 180px;
  z-index: 1001;
  backdrop-filter: blur(12px);
}

.user-dropdown a {
  display: block;
  padding: 10px 14px;
  color: var(--theme-text-primary);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
}

.user-dropdown a:hover {
  background-color: var(--theme-bg-hover);
  color: var(--theme-brand-primary);
  transform: translateX(4px);
}

/* 主容器 */
.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 侧边栏 */
.sidebar {
  width: 260px;
  background: var(--theme-sidebar-bg);
  border-right: 1px solid var(--theme-sidebar-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  backdrop-filter: blur(8px);
  position: relative;
}

.sidebar.collapsed {
  width: 72px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 56px;
  padding: 0 20px;
  border-bottom: 1px solid var(--theme-sidebar-border);
  background: var(--theme-bg-component);
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background-color: transparent;
  color: var(--theme-sidebar-text);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.collapse-btn:hover {
  background-color: var(--theme-sidebar-hover-bg);
  color: var(--theme-brand-primary);
  transform: scale(1.1);
}

/* 侧边栏导航 */
.sidebar-nav {
  padding: 20px 12px;
}

.nav-item {
  margin-bottom: 6px;
}

.sidebar-nav .nav-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--theme-sidebar-text);
  font-weight: 500;
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}

.sidebar-nav .nav-link:hover {
  background-color: var(--theme-sidebar-hover-bg);
  color: var(--theme-text-primary);
  border-color: var(--theme-border-light);
  transform: translateX(2px);
}

.sidebar-nav .nav-link.active {
  background: var(--theme-sidebar-active-bg);
  color: var(--theme-sidebar-active-text);
  border-color: var(--theme-brand-primary);
  font-weight: 600;
  box-shadow: var(--theme-shadow-sm);
}

.sidebar-nav .nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  background: var(--theme-brand-primary);
  border-radius: 0 2px 2px 0;
}

.sidebar-nav .nav-link i {
  width: 20px;
  text-align: center;
  font-size: 18px;
  flex-shrink: 0;
}

.nav-text {
  font-size: 14px;
  font-weight: inherit;
  white-space: nowrap;
  flex: 1;
}

.expand-icon {
  margin-left: auto;
  font-size: 12px;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.expand-icon.expanded {
  transform: rotate(180deg);
  color: var(--theme-brand-primary);
}

/* 子菜单 */
.sub-menu {
  margin-top: 6px;
  padding-left: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 1000px;
  overflow: hidden;
  border-left: 2px solid var(--theme-border-light);
  margin-left: 10px;
}

/* 侧边栏收缩时的子菜单样式 */
.sub-menu.collapsed {
  display: none;
  max-height: 0;
  padding-left: 0;
  border-left: none;
}

.sub-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--theme-text-tertiary);
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 2px;
  position: relative;
}

.sub-nav-link:hover {
  background-color: var(--theme-sidebar-hover-bg);
  color: var(--theme-text-primary);
  transform: translateX(4px);
}

.sub-nav-link.active {
  background-color: var(--theme-sidebar-active-bg);
  color: var(--theme-sidebar-active-text);
  font-weight: 600;
}

.sub-nav-link.active::before {
  content: '';
  position: absolute;
  left: -24px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 16px;
  background: var(--theme-brand-primary);
  border-radius: 1px;
}

.sub-nav-link i {
  width: 16px;
  text-align: center;
  font-size: 14px;
  flex-shrink: 0;
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
  background: var(--theme-bg-component);
  border-bottom: 1px solid var(--theme-border-base);
  backdrop-filter: blur(8px);
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
  padding: 14px 18px;
  border-radius: 8px 8px 0 0;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  color: var(--theme-text-tertiary);
  background-color: transparent;
  margin: 4px 2px 0 0;
  flex-shrink: 0;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.tab-item:hover {
  color: var(--theme-text-primary);
  background-color: var(--theme-bg-hover);
  transform: translateY(-1px);
}

.tab-item.active {
  color: var(--theme-brand-primary);
  background-color: var(--theme-bg-component);
  border-bottom-color: var(--theme-brand-primary);
  box-shadow: var(--theme-shadow-sm);
  font-weight: 600;
}

.tab-item.active::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--theme-brand-primary), var(--theme-brand-primary-hover));
  border-radius: 2px 2px 0 0;
}

.tab-title {
  font-size: 14px;
  font-weight: 500;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background-color: transparent;
  color: var(--theme-text-tertiary);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: 6px;
  font-size: 12px;
}

.tab-close:hover {
  background-color: var(--theme-danger-light);
  color: var(--theme-danger);
  transform: scale(1.1);
}

/* 页面内容 */
.page-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  background: var(--theme-bg-base);
  border-radius: 16px 0 0 0;
  margin-top: 1px;
}

/* 遮罩层 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 999;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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

  /* 移动端副菜单样式 */
  .submenu-panel {
    position: fixed;
    left: 0;
    top: 60px;
    height: calc(100vh - 60px);
    z-index: 999;
    transform: translateX(-100%);
  }

  .submenu-panel.show {
    transform: translateX(0);
  }
}

/* 滚动条样式 */
.sidebar-nav::-webkit-scrollbar,
.submenu-content::-webkit-scrollbar,
.page-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track,
.submenu-content::-webkit-scrollbar-track,
.page-content::-webkit-scrollbar-track {
  background: var(--theme-scrollbar-track);
}

.sidebar-nav::-webkit-scrollbar-thumb,
.submenu-content::-webkit-scrollbar-thumb,
.page-content::-webkit-scrollbar-thumb {
  background: var(--theme-scrollbar-thumb);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover,
.submenu-content::-webkit-scrollbar-thumb:hover,
.page-content::-webkit-scrollbar-thumb:hover {
  background: var(--theme-scrollbar-thumb-hover);
}

/* 动画优化 */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}

/* 焦点样式 */
.nav-link:focus,
.sub-nav-link:focus,
.submenu-item:focus,
.tab-item:focus,
.icon-btn:focus,
.collapse-btn:focus,
.close-submenu:focus {
  outline: 2px solid var(--theme-brand-primary);
  outline-offset: 2px;
  border-radius: 8px;
}

/* 副菜单样式 */
.submenu-panel {
  width: 260px;
  background: var(--theme-bg-component);
  border-right: 1px solid var(--theme-border-base);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  backdrop-filter: blur(8px);
  box-shadow: var(--theme-shadow-sm);
}

.submenu-panel:not(.show) {
  display: none;
}

.submenu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--theme-border-base);
  background: var(--theme-header-bg);
  position: relative;
}

.submenu-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(90deg, var(--theme-brand-primary), transparent);
}

.submenu-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--theme-text-primary);
  letter-spacing: -0.02em;
}

.close-submenu {
  background: none;
  border: none;
  color: var(--theme-text-tertiary);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-submenu:hover {
  background: var(--theme-bg-hover);
  color: var(--theme-text-primary);
  transform: scale(1.1);
}

.submenu-content {
  padding: 16px 0;
  flex: 1;
  overflow-y: auto;
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  cursor: pointer;
  color: var(--theme-text-secondary);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  border-radius: 0 12px 12px 0;
  margin: 2px 12px 2px 0;
  position: relative;
}

.submenu-item:hover {
  background: var(--theme-bg-hover);
  color: var(--theme-text-primary);
  transform: translateX(4px);
}

.submenu-item.active {
  background: var(--theme-sidebar-active-bg);
  color: var(--theme-sidebar-active-text);
  font-weight: 600;
}

.submenu-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  background: var(--theme-brand-primary);
  border-radius: 0 2px 2px 0;
}

.submenu-item i {
  width: 18px;
  text-align: center;
  font-size: 16px;
  flex-shrink: 0;
}
</style>
