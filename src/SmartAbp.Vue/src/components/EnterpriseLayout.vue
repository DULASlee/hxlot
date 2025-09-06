<template>
  <div class="admin-layout">
    <!-- 顶部导航栏 -->
    <header class="admin-header">
      <div class="header-left">
        <button class="toggle-sidebar-btn" @click="toggleSidebar">
          <el-icon><Menu /></el-icon>
        </button>
        <div class="logo">
          <img src="../assets/logo.png" alt="Logo" />
          <span v-if="!sidebarCollapsed">SmartAbp</span>
        </div>
      </div>
      <div class="header-center">
        <div class="breadcrumb">
          <span>{{ activeSubMenuTitle }}</span>
        </div>
      </div>
      <div class="header-right">
        <div class="header-actions">
          <!-- 主题切换按钮 -->
          <button class="theme-toggle" @click="quickToggleDark">
            <el-icon v-if="themeStore.isDarkMode"><Moon /></el-icon>
            <el-icon v-else><Sunny /></el-icon>
          </button>

          <!-- 用户信息 -->
          <div class="user-dropdown" ref="userDropdown">
            <div class="user-info" @click="showUserMenu = !showUserMenu">
              <img :src="userInfo.avatar || '../assets/avatar.png'" alt="Avatar" class="user-avatar" />
              <span class="user-name">{{ userInfo.name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <div v-if="showUserMenu" class="dropdown-menu">
              <div class="dropdown-item" @click="router.push('/profile')">
                <el-icon><User /></el-icon>
                <span>个人中心</span>
              </div>
              <div class="dropdown-item" @click="router.push('/settings')">
                <el-icon><Setting /></el-icon>
                <span>系统设置</span>
              </div>
              <div class="dropdown-item logout" @click="logout">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="admin-body">
      <!-- 左侧主菜单 -->
      <aside :class="['admin-sidebar', { collapsed: sidebarCollapsed }]">
        <el-menu :collapse="sidebarCollapsed" :default-active="activeMenu" class="main-menu">
          <el-menu-item index="dashboard" @click="router.push('/dashboard')">
            <el-icon><HomeFilled /></el-icon>
            <template #title>控制台</template>
          </el-menu-item>

          <el-menu-item
            index="system"
            @click="toggleSubmenu('system')">
            <el-icon><Setting /></el-icon>
            <template #title>系统管理</template>
          </el-menu-item>

          <el-menu-item
            index="project"
            @click="toggleSubmenu('project')">
            <el-icon><Folder /></el-icon>
            <template #title>项目管理</template>
          </el-menu-item>
        </el-menu>
      </aside>

      <!-- 副菜单 -->
      <aside v-if="!sidebarCollapsed" :class="['admin-submenu', { show: showSubmenu }]">
        <div class="submenu-header">
          <h3>{{ submenuTitle }}</h3>
          <button class="close-submenu" @click="closeSubmenu">
            <el-icon><Close /></el-icon>
          </button>
        </div>

        <div class="submenu-content">
          <template v-if="activeMenu === 'system'">
            <div class="submenu-item" @click="router.push('/system/users')">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </div>
            <div class="submenu-item" @click="router.push('/system/roles')">
              <el-icon><Lock /></el-icon>
              <span>角色管理</span>
            </div>
            <div class="submenu-item" @click="router.push('/system/permissions')">
              <el-icon><Key /></el-icon>
              <span>权限管理</span>
            </div>
          </template>

          <template v-else-if="activeMenu === 'project'">
            <div class="submenu-item" @click="router.push('/projects/list')">
              <el-icon><List /></el-icon>
              <span>项目列表</span>
            </div>
            <div class="submenu-item" @click="router.push('/projects/analysis')">
              <el-icon><DataAnalysis /></el-icon>
              <span>项目分析</span>
            </div>
          </template>
        </div>
      </aside>

      <!-- 主内容区 -->
      <div class="admin-content">
        <!-- 标签页导航 -->
        <div class="tabs-container">
          <div class="tabs-actions-left">
            <button class="tab-action-btn" @click="toggleSidebar">
              <el-icon><Fold /></el-icon>
              <span>{{ sidebarCollapsed ? '展开侧栏' : '折叠侧栏' }}</span>
            </button>
            <button class="tab-action-btn" @click="toggleSubmenu(activeMenu)">
              <el-icon><Operation /></el-icon>
              <span>{{ showSubmenu ? '隐藏副菜单' : '显示副菜单' }}</span>
            </button>
          </div>

          <div class="tabs-list">
            <!-- 标签页列表 -->
            <div
              v-for="tab in tabs"
              :key="tab.path"
              :class="['tab-item', { active: activeTab === tab.path }]"
              @click="switchTab(tab.path)"
            >
              <el-icon v-if="tab.icon" class="tab-icon"><component :is="tab.icon" /></el-icon>
              <span>{{ tab.title }}</span>
              <button
                v-if="tab.closable"
                class="tab-close-btn"
                @click.stop="closeTab(tab.path)"
              >
                <el-icon><Close /></el-icon>
              </button>
            </div>
          </div>

          <div class="tabs-actions-right">
            <el-dropdown trigger="click">
              <button class="tab-action-btn">
                <el-icon><More /></el-icon>
              </button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="refreshCurrentTab">
                    <el-icon><Refresh /></el-icon>刷新当前页面
                  </el-dropdown-item>
                  <el-dropdown-item @click="closeOtherTabs">
                    <el-icon><CircleClose /></el-icon>关闭其他标签
                  </el-dropdown-item>
                  <el-dropdown-item @click="closeAllTabs">
                    <el-icon><Remove /></el-icon>关闭所有标签
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="content-container">
          <!-- 测试控制面板 -->
          <div class="test-panel">
            <h3>菜单测试控制面板</h3>
            <div class="test-buttons">
              <button @click="toggleSidebar">
                {{ sidebarCollapsed ? '展开侧栏' : '折叠侧栏' }}
              </button>
              <button @click="toggleSubmenu('system')">
                系统管理菜单
              </button>
              <button @click="toggleSubmenu('project')">
                项目管理菜单
              </button>
              <button @click="closeSubmenu">
                关闭副菜单
              </button>
              <button @click="quickToggleDark">
                切换主题
              </button>
              <button @click="testMenuStatus">
                输出菜单状态
              </button>
            </div>
            <div class="test-status">
              <p>当前状态:</p>
              <ul>
                <li>主题: {{ themeStore.currentTheme }}</li>
                <li>侧边栏: {{ sidebarCollapsed ? '已折叠' : '已展开' }}</li>
                <li>副菜单: {{ showSubmenu ? '显示' : '隐藏' }}</li>
                <li>当前菜单: {{ activeMenu }}</li>
                <li>当前标签页: {{ activeTab }}</li>
              </ul>
            </div>
          </div>

          <router-view />
        </div>
      </div>
    </div>

    <!-- 移动端菜单遮罩层 -->
    <div
      class="menu-overlay"
      :class="{ show: showMobileMenu }"
      @click="closeMobileMenu"
    ></div>

    <!-- 移动端菜单触发按钮 -->
    <button class="mobile-menu-toggle" @click="toggleMobileMenu">
      <el-icon><Menu /></el-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import { authService } from '../utils/auth'

// 路由
const router = useRouter()
const route = useRoute()

// 主题
const themeStore = useThemeStore()

// 状态
const sidebarCollapsed = ref(false)
const showSubmenu = ref(false)
const activeMenu = ref('')
const activeTab = ref('/dashboard')
const userInfo = ref({
  name: '用户',
  avatar: ''
})
const showUserMenu = ref(false)
// 移动端菜单状态
const showMobileMenu = ref(false)

// 标签页系统
interface TabItem {
  title: string;
  path: string;
  icon?: any;
  closable: boolean;
}

const tabs = ref<TabItem[]>([
  { title: '控制台', path: '/dashboard', icon: 'HomeFilled', closable: false }
])

// 菜单项
const menuItems = [
  {
    id: 'system',
    title: '系统管理',
    icon: 'Setting',
    children: [
      { title: '用户管理', path: '/system/users', icon: 'User' },
      { title: '角色管理', path: '/system/roles', icon: 'Lock' },
      { title: '权限管理', path: '/system/permissions', icon: 'Key' }
    ]
  },
  {
    id: 'project',
    title: '项目管理',
    icon: 'Folder',
    children: [
      { title: '项目列表', path: '/projects/list', icon: 'List' },
      { title: '项目分析', path: '/projects/analysis', icon: 'DataAnalysis' }
    ]
  }
]

// 计算属性
const submenuTitle = computed(() => {
  const menu = menuItems.find(item => item.id === activeMenu.value)
  return menu ? menu.title : ''
})

const activeSubMenuTitle = computed(() => {
  return showSubmenu.value ? submenuTitle.value : ''
})

// 方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  if (window.innerWidth <= 992) {
    showMobileMenu.value = !sidebarCollapsed.value
  }
  console.log(`[菜单测试] 侧边栏状态: ${sidebarCollapsed.value ? '已折叠' : '已展开'}`)
}

const toggleSubmenu = (menuId: string) => {
  if (activeMenu.value === menuId && showSubmenu.value) {
    // 如果点击的是当前激活的菜单，则关闭副菜单
    showSubmenu.value = false
    console.log(`[菜单测试] 副菜单已关闭 (同菜单切换)`)
  } else {
    // 否则，激活该菜单并显示副菜单
    activeMenu.value = menuId
    showSubmenu.value = true
    console.log(`[菜单测试] 副菜单已打开: ${menuId}`)
  }
}

const closeSubmenu = () => {
  showSubmenu.value = false
  console.log(`[菜单测试] 副菜单已关闭 (手动关闭)`)
}

const logout = () => {
  authService.logout()
  router.push('/login')
  console.log(`[菜单测试] 用户已登出`)
}

const quickToggleDark = () => {
  themeStore.toggleDarkMode()
  console.log(`[菜单测试] 主题已切换: ${themeStore.currentTheme}`)
}

// 切换移动端菜单
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  if (showMobileMenu.value) {
    sidebarCollapsed.value = false
  }
}

// 关闭移动端菜单
const closeMobileMenu = () => {
  showMobileMenu.value = false
  showSubmenu.value = false
}

// 标签页相关方法
const addTab = (path: string, title: string, icon?: any) => {
  // 检查标签是否已存在
  if (!tabs.value.some(tab => tab.path === path)) {
    tabs.value.push({
      title,
      path,
      icon,
      closable: path !== '/dashboard' // 控制台标签不可关闭
    })
  }
  activeTab.value = path
}

const switchTab = (path: string) => {
  activeTab.value = path
  router.push(path)
}

const closeTab = (path: string) => {
  // 找到要关闭的标签索引
  const index = tabs.value.findIndex(tab => tab.path === path)
  if (index === -1) return

  // 如果关闭的是当前标签，需要切换到其他标签
  if (activeTab.value === path) {
    // 优先切换到左侧标签，如果没有则切换到右侧标签
    const nextActiveIndex = index > 0 ? index - 1 : index + 1
    if (tabs.value[nextActiveIndex]) {
      activeTab.value = tabs.value[nextActiveIndex].path
      router.push(activeTab.value)
    }
  }

  // 移除标签
  tabs.value.splice(index, 1)

  // 如果没有标签了，默认回到控制台
  if (tabs.value.length === 0) {
    addTab('/dashboard', '控制台', 'HomeFilled')
    router.push('/dashboard')
  }
}

const closeOtherTabs = () => {
  // 保留当前标签和不可关闭的标签
  tabs.value = tabs.value.filter(tab => tab.path === activeTab.value || !tab.closable)
}

const closeAllTabs = () => {
  // 只保留不可关闭的标签
  tabs.value = tabs.value.filter(tab => !tab.closable)

  // 如果当前标签被关闭，切换到第一个标签
  if (!tabs.value.some(tab => tab.path === activeTab.value) && tabs.value.length > 0) {
    activeTab.value = tabs.value[0].path
    router.push(activeTab.value)
  }
}

const refreshCurrentTab = () => {
  // 在实际应用中，这里可以重新加载当前页面的数据
  console.log(`刷新标签页: ${activeTab.value}`)
}

// 根据路由添加标签页
const addTabFromRoute = (routePath: string) => {
  // 查找菜单项
  for (const menu of menuItems) {
    for (const submenu of menu.children) {
      if (submenu.path === routePath) {
        addTab(submenu.path, submenu.title, submenu.icon)
        return
      }
    }
  }

  // 如果没找到匹配的菜单项，使用路由路径作为标题
  if (routePath !== '/dashboard') {
    addTab(routePath, routePath.split('/').pop() || '未知页面')
  }
}

// 测试方法
const testMenuStatus = () => {
  console.log(`[菜单测试] 当前状态:`)
  console.log(`- 主题: ${themeStore.currentTheme}`)
  console.log(`- 侧边栏: ${sidebarCollapsed.value ? '已折叠' : '已展开'}`)
  console.log(`- 副菜单: ${showSubmenu.value ? '显示' : '隐藏'}`)
  console.log(`- 当前菜单: ${activeMenu.value}`)
  console.log(`- 当前标签页: ${activeTab.value}`)
  console.log(`- 移动菜单: ${showMobileMenu.value ? '显示' : '隐藏'}`)
}

// 定义窗口大小变化处理函数
const handleResize = () => {
  if (window.innerWidth > 992) {
    showMobileMenu.value = false
  }
}

// 生命周期
onMounted(() => {
  // 获取用户信息
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user && user.name) {
      userInfo.value = user
    }
  } catch (e) {
    console.error('Failed to parse user info', e)
  }

  // 根据当前路由添加初始标签页
  if (route.path !== '/dashboard') {
    addTabFromRoute(route.path)
  }

  // 输出初始状态
  console.log(`[菜单测试] 初始化完成:`)
  console.log(`- 主题: ${themeStore.currentTheme}`)
  console.log(`- 侧边栏: ${sidebarCollapsed.value ? '已折叠' : '已展开'}`)
  console.log(`- 副菜单: ${showSubmenu.value ? '显示' : '隐藏'}`)

  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)
})

// 组件卸载时的清理
onUnmounted(() => {
  // 移除窗口大小变化监听
  window.removeEventListener('resize', handleResize)
})

// 监听路由变化，自动添加标签页
watch(() => route.path, (newPath) => {
  addTabFromRoute(newPath)
  activeTab.value = newPath
})

// 监听主题变化
watch(() => themeStore.currentTheme, (newTheme) => {
  console.log(`[菜单测试] 主题变化: ${newTheme}`)
})

// 监听副菜单状态变化
watch(showSubmenu, (visible) => {
  console.log(`[菜单测试] 副菜单可见性: ${visible ? '显示' : '隐藏'}`)
})
</script>

<style scoped>
/* 管理后台布局 */
.admin-layout {
  width: 100%;
  height: 100vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-tertiary);
}

/* 顶部导航栏 */
.admin-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border-primary);
  color: var(--color-text-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 10;
  flex-shrink: 0;
  position: relative;
}

.header-left, .header-right, .header-center {
  display: flex;
  align-items: center;
}

.header-center {
  flex: 1;
  justify-content: center;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  margin-left: 10px;
}

.logo img {
  height: 30px;
  margin-right: 10px;
}

.toggle-sidebar-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--color-textPrimary);
  padding: 5px;
  margin-right: 10px;
}

.breadcrumb {
  font-size: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.header-actions button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--color-textPrimary);
  padding: 5px 10px;
  margin-left: 10px;
}

.user-dropdown {
  position: relative;
  margin-left: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
}

.user-info:hover {
  background: var(--color-bgSecondary);
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-name {
  margin-right: 5px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 150px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
}

.dropdown-item:hover {
  background: var(--color-bgSecondary);
}

.dropdown-item i {
  margin-right: 10px;
}

.logout {
  border-top: 1px solid var(--color-border-primary);
  color: var(--color-error-500);
}

/* 主体区域 */
.admin-body {
  display: flex;
  height: calc(100vh - 60px);
  overflow: auto;
  flex: 1;
}

/* 左侧菜单 */
.admin-sidebar {
  width: 220px;
  height: 100%;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--color-border-primary);
  transition: all 0.3s;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
  position: relative;
  z-index: 5;
}

.admin-sidebar.collapsed {
  width: 64px;
}

.main-menu {
  height: 100%;
  border-right: none;
}

/* 副菜单 */
.admin-submenu {
  width: 250px; /* 副菜单宽度 */
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border-primary);
  position: relative;
  height: 100%;
  transition: all 0.3s;
  overflow-y: auto;
  flex-shrink: 0;
  z-index: 4;
}

/* 隐藏时完全不占位 */
.admin-submenu:not(.show) {
  display: none;
}

.submenu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid var(--color-borderPrimary);
}

.submenu-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-submenu {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-textSecondary);
}

.submenu-content {
  padding: 10px 0;
}

.submenu-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
}

.submenu-item:hover {
  background: var(--color-bgPrimary);
}

/* 主内容区 */
.admin-content {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  background: var(--color-bg-tertiary);
  display: flex;
  flex-direction: column;
}

/* 标签页导航 */
.tabs-container {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  background: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border-primary);
}

.tabs-list {
  flex: 1;
  overflow-x: auto;
  display: flex;
  align-items: center;
  padding: 0 5px;
  scrollbar-width: thin;
  scrollbar-color: var(--color-borderPrimary) transparent;
}

.tabs-list::-webkit-scrollbar {
  height: 4px;
}

.tabs-list::-webkit-scrollbar-track {
  background: transparent;
}

.tabs-list::-webkit-scrollbar-thumb {
  background-color: var(--color-border-primary);
  border-radius: 4px;
}

.tabs-actions-left, .tabs-actions-right {
  display: flex;
  align-items: center;
}

.tab-action-btn {
  background: none;
  border: none;
  padding: 5px 8px;
  margin: 0 2px;
  cursor: pointer;
  color: var(--color-textSecondary);
  display: flex;
  align-items: center;
  border-radius: 3px;
}

.tab-action-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.tab-action-btn i {
  margin-right: 5px;
}

/* 标签页样式 */
.tab-item {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  margin: 0 3px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid var(--color-border-primary);
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  transition: all 0.2s;
}

.tab-item:hover {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.tab-item.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.tab-icon {
  margin-right: 5px;
  font-size: 14px;
}

.tab-close-btn {
  margin-left: 5px;
  border: none;
  background: none;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  color: var(--color-textSecondary);
}

.tab-close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--color-error-500);
}

.content-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  min-height: 0;
  min-width: 0;
}

/* 移动端菜单触发按钮 */
.mobile-menu-toggle {
  display: none;
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  border: none;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  z-index: 100;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}

/* 菜单遮罩层 - 移动端使用 */
.menu-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .admin-sidebar:not(.collapsed) {
    width: 180px;
  }

  .admin-submenu {
    width: 220px;
  }
}

@media (max-width: 992px) {
  .header-center {
    display: none;
  }

  .tab-action-btn span {
    display: none;
  }

  .admin-sidebar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 15;
    transform: translateX(-100%);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  }

  .admin-sidebar:not(.collapsed) {
    transform: translateX(0);
  }

  .admin-submenu {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 14;
    transform: translateX(-100%);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  }

  .admin-submenu.show {
    transform: translateX(0);
    left: 220px;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .menu-overlay.show {
    display: block;
  }
}

@media (max-width: 768px) {
  .admin-header {
    padding: 0 10px;
  }

  .logo span {
    display: none;
  }

  .user-name {
    display: none;
  }

  .tab-item span {
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .admin-submenu.show {
    left: 0;
    width: 100%;
  }
}

@media (max-width: 576px) {
  .tabs-actions-left {
    display: none;
  }

  .tabs-list {
    padding-left: 5px;
  }

  .tab-item {
    padding: 3px 8px;
  }

  .tab-icon {
    margin-right: 0;
  }

  .tab-item span {
    display: none;
  }

  .tab-close-btn {
    margin-left: 2px;
  }
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 测试控制面板样式 */
.test-panel {
  background: var(--color-bgSecondary);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-base);
}

.test-panel h3 {
  margin-top: 0;
  color: var(--color-textPrimary);
  border-bottom: 1px solid var(--color-borderPrimary);
  padding-bottom: 10px;
}

.test-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.test-buttons button {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.3s;
}

.test-buttons button:hover {
  background: var(--color-primaryDark);
}

.test-status {
  background: var(--color-bgBase);
  border-radius: 4px;
  padding: 10px 15px;
}

.test-status p {
  font-weight: bold;
  margin-top: 0;
}

.test-status ul {
  padding-left: 20px;
}
</style>
