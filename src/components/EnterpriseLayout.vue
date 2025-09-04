<template>
  <div class="admin-layout">
    <div class="admin-container">
      <!-- 顶部导航 -->
      <header class="admin-header">
        <div class="header-left">
          <button class="sidebar-toggle" @click="toggleSidebar">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
            </svg>
          </button>
          <div class="header-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="currentColor"/>
              <path d="M8 16L12 12L16 16L20 12L24 16" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <circle cx="16" cy="22" r="2" fill="white"/>
            </svg>
            <span class="logo-text">智慧工地管理系统</span>
          </div>
        </div>
        <nav class="header-nav">
          <div class="header-nav-item" @click="toggleTheme">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
            </svg>
          </div>
          <div class="header-nav-item">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
            </svg>
            <span class="badge">3</span>
          </div>
          <div class="header-nav-item" @click="toggleUserMenu">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0110 0c0 1.61-.592 3.09-1.591 4.243A5.002 5.002 0 0010 11z" clip-rule="evenodd"/>
            </svg>
            <span>管理员</span>
          </div>
        </nav>
        
        <!-- 用户菜单下拉 -->
        <div v-if="userMenuOpen" class="user-menu">
          <div class="user-menu-header">
            <div class="menu-user-name">管理员</div>
            <div class="menu-user-role">超级管理员</div>
          </div>
          <div class="user-menu-divider"></div>
          <div class="user-menu-item" @click="navigateTo('UserProfile')">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
            </svg>
            <span>个人资料</span>
          </div>
          <div class="user-menu-item" @click="navigateTo('Settings')">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
            </svg>
            <span>设置</span>
          </div>
          <div class="user-menu-divider"></div>
          <div class="user-menu-item" @click="logout">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/>
            </svg>
            <span>退出登录</span>
          </div>
        </div>
      </header>

      <div class="admin-content">
        <!-- 侧边栏 -->
        <aside class="admin-sidebar" :class="{ collapsed: sidebarCollapsed }">
          <div class="sidebar-inner">
            <div class="menu-search" v-if="!sidebarCollapsed">
              <div class="search-input-wrapper">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
                </svg>
                <input type="text" placeholder="搜索菜单..." class="search-input">
              </div>
            </div>

            <nav class="sidebar-menu">
              <!-- 工作台 -->
              <div class="menu-item-level1">
                <div class="menu-item-header" :class="{ active: activeMenu === 'dashboard' }" @click="navigateTo('Dashboard')">
                  <span class="menu-icon">📊</span>
                  <span class="menu-text">工作台</span>
                </div>
              </div>

              <!-- 项目管理 -->
              <div class="menu-item-level1">
                <div class="menu-item-header" @click="toggleMenu('project')">
                  <span class="menu-icon">🏗️</span>
                  <span class="menu-text">项目管理</span>
                  <span class="menu-arrow" :class="{ expanded: expandedMenus.project }">▶</span>
                </div>
                <div class="menu-submenu" :class="{ expanded: expandedMenus.project }">
                  <a class="menu-item-level2" @click="navigateTo('ProjectList')">
                    <span class="submenu-icon">•</span>
                    <span class="submenu-text">项目列表</span>
                  </a>
                  <a class="menu-item-level2" @click="navigateTo('ProjectCreate')">
                    <span class="submenu-icon">•</span>
                    <span class="submenu-text">新建项目</span>
                  </a>
                  <a class="menu-item-level2" @click="navigateTo('ProjectProgress')">
                    <span class="submenu-icon">•</span>
                    <span class="submenu-text">项目进度</span>
                  </a>
                </div>
              </div>

              <!-- 考勤管理 -->
              <div class="menu-item-level1">
                <div class="menu-item-header" @click="toggleMenu('attendance')">
                  <span class="menu-icon">⏰</span>
                  <span class="menu-text">考勤管理</span>
                  <span class="menu-arrow" :class="{ expanded: expandedMenus.attendance }">▶</span>
                </div>
                <div class="menu-submenu" :class="{ expanded: expandedMenus.attendance }">
                  <a class="menu-item-level2" @click="navigateTo('AttendanceRecord')">
                    <span class="submenu-icon">•</span>
                    <span class="submenu-text">考勤记录</span>
                  </a>
                  <a class="menu-item-level2" @click="navigateTo('AttendanceReport')">
                    <span class="submenu-icon">•</span>
                    <span class="submenu-text">考勤报表</span>
                  </a>
                  <a class="menu-item-level2" @click="navigateTo('AttendanceSetting')">
                    <span class="submenu-icon">•</span>
                    <span class="submenu-text">考勤设置</span>
                  </a>
                </div>
              </div>

              <!-- 设备管理 -->
              <div class="menu-item-level1">
                <div class="menu-item-header" @click="toggleMenu('equipment')">
                  <span class="menu-icon">🔧</span>
                  <span class="menu-text">设备管理</span>
                  <span class="menu-arrow" :class="{ expanded: expandedMenus.equipment }">▶</span>
                </div>
                <div class="menu-submenu" :class="{ expanded: expandedMenus.equipment }">
                  <a class="menu-item-level2" @click="navigateTo('EquipmentList')">
                    <span class="submenu-icon">•</span>
                    <span class="submenu-text">设备列表</span>
                  </a>
                  <a class="menu-item-level2" @click="navigateTo('EquipmentCrane')">
                    <span class="submenu-icon">•</span>
                    <span class="submenu-text">塔吊监控</span>
                  </a>
                  <a class="menu-item-level2" @click="navigateTo('EquipmentElevator')">
                    <span class="submenu-icon">•</span>
                    <span class="submenu-text">升降机监控</span>
                  </a>
                  <a class="menu-item-level2" @click="navigateTo('EquipmentMaintenance')">
                    <span class="submenu-icon">•</span>
                    <span class="submenu-text">设备维护</span>
                  </a>
                  <a class="menu-item-level2" @click="navigateTo('EquipmentAlarm')">
                    <span class="submenu-icon">•</span>
                    <span class="submenu-text">报警记录</span>
                  </a>
                </div>
              </div>

              <!-- 系统管理 -->
              <div class="menu-item-level1">
                <div class="menu-item-header" :class="{ active: activeMenu === 'system' }" @click="toggleMenu('system')">
                  <span class="menu-icon">⚡</span>
                  <span class="menu-text">系统管理</span>
                  <span class="menu-arrow" :class="{ expanded: expandedMenus.system }">▶</span>
                </div>
                <div class="menu-submenu" :class="{ expanded: expandedMenus.system }">
                  <a class="menu-item-level2" @click="navigateTo('UserManagement')">
                    <span class="submenu-icon">•</span>
                    <span class="submenu-text">用户管理</span>
                  </a>
                  <a class="menu-item-level2" @click="navigateTo('RoleManagement')">
                    <span class="submenu-icon">•</span>
                    <span class="submenu-text">角色管理</span>
                  </a>
                  <a class="menu-item-level2" @click="navigateTo('PermissionManagement')">
                    <span class="submenu-icon">•</span>
                    <span class="submenu-text">权限管理</span>
                  </a>
                  <a class="menu-item-level2" @click="navigateTo('SystemSetting')">
                    <span class="submenu-icon">•</span>
                    <span class="submenu-text">系统设置</span>
                  </a>
                </div>
              </div>
            </nav>
          </div>
        </aside>

        <!-- 主内容区域 -->
        <main class="admin-main">
          <div class="main-content">
            <router-view />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EnterpriseLayout',
  data() {
    return {
      sidebarCollapsed: false,
      userMenuOpen: false,
      activeMenu: 'dashboard',
      expandedMenus: {
        project: false,
        attendance: false,
        equipment: false,
        system: false
      }
    }
  },
  methods: {
    navigateTo(routeName: string) {
      this.$router.push({ name: routeName })
    },
    navigateToPath(path: string) {
      this.$router.push(path)
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen
    },
    toggleMenu(menuKey) {
      this.expandedMenus[menuKey] = !this.expandedMenus[menuKey]
    },
    logout() {
      localStorage.removeItem('access_token')
      this.$router.push('/login')
    }
  },
  mounted() {
    // 关闭用户菜单当点击其他地方时
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header-nav-item')) {
        this.userMenuOpen = false
      }
    })
  }
}
</script>

<style scoped>
/* 布局样式 */
.admin-layout {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.admin-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.admin-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 顶部导航栏 */
.admin-header {
  height: 64px;
  background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  position: relative;
}

.header-nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 9999px;
  min-width: 18px;
  text-align: center;
  font-weight: 500;
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  padding: 8px 0;
  margin-top: 8px;
  z-index: 1000;
  border: 1px solid #e5e7eb;
}

.user-menu-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.menu-user-name {
  font-weight: 600;
  color: #374151;
  margin-bottom: 2px;
}

.menu-user-role {
  font-size: 12px;
  color: #6b7280;
}

.user-menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 8px 0;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  color: #374151;
}

.user-menu-item:hover {
  background: #f9fafb;
  color: #111827;
}

/* 侧边栏 */
.admin-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e5e7eb;
  transition: width 0.3s;
  overflow: hidden;
  flex-shrink: 0;
}

.admin-sidebar.collapsed {
  width: 64px;
}

.sidebar-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.menu-search {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-wrapper svg {
  position: absolute;
  left: 12px;
  color: #6b7280;
}

.search-input {
  width: 100%;
  padding: 8px 8px 8px 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background-color: #f9fafb;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.menu-item-level1 {
  margin-bottom: 4px;
}

.menu-item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  color: #374151;
  border-radius: 6px;
  margin: 0 8px;
}

.menu-item-header:hover {
  background: #f3f4f6;
  color: #111827;
}

.menu-item-header.active {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.menu-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.menu-text {
  flex: 1;
  font-weight: 500;
}

.menu-arrow {
  font-size: 12px;
  transition: transform 0.2s;
}

.menu-arrow.expanded {
  transform: rotate(90deg);
}

.menu-submenu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s;
}

.menu-submenu.expanded {
  max-height: 300px;
}

.menu-item-level2 {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px 10px 48px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
  text-decoration: none;
}

.menu-item-level2:hover {
  color: #374151;
  background: #f9fafb;
}

.submenu-icon {
  font-size: 12px;
  width: 16px;
  text-align: center;
}

.submenu-text {
  flex: 1;
  font-size: 14px;
}

/* 主内容区域 */
.admin-main {
  flex: 1;
  overflow: hidden;
  background: #f8fafc;
}

.main-content {
  height: 100%;
  overflow: auto;
  padding: 24px;
}
</style>