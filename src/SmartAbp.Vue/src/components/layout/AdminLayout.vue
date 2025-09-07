<template>
  <div class="admin-layout" :class="[
    `admin-layout--${currentTheme}`,
    { 'admin-layout--dark': isCurrentThemeDark },
    { 'admin-layout--sidebar-collapsed': isSidebarCollapsed }
  ]">
    <!-- 顶部导航栏 -->
    <header class="admin-header">
      <div class="header-left">
        <!-- Logo 和应用名 -->
        <div class="logo-container">
          <button
            class="sidebar-toggle"
            @click="toggleSidebar"
            :title="isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
          >
            <i class="fas fa-bars"></i>
          </button>
          <router-link to="/" class="logo-link">
            <img src="@/assets/logo.svg" alt="Logo" class="logo-image" />
            <span class="logo-text" v-if="!isSidebarCollapsed">SmartAbp</span>
          </router-link>
        </div>

        <!-- 面包屑导航 -->
        <nav class="breadcrumb-nav" v-if="breadcrumbs.length > 0">
          <ol class="breadcrumb">
            <li
              v-for="(item, index) in breadcrumbs"
              :key="index"
              class="breadcrumb-item"
              :class="{ active: index === breadcrumbs.length - 1 }"
            >
              <router-link
                v-if="item.path && index < breadcrumbs.length - 1"
                :to="item.path"
                class="breadcrumb-link"
              >
                {{ item.label }}
              </router-link>
              <span v-else class="breadcrumb-text">{{ item.label }}</span>
              <i
                v-if="index < breadcrumbs.length - 1"
                class="fas fa-chevron-right breadcrumb-separator"
              ></i>
            </li>
          </ol>
        </nav>
      </div>

      <div class="header-right">
        <!-- 搜索框 -->
        <div class="search-container">
          <input
            type="text"
            class="search-input"
            placeholder="搜索功能..."
            v-model="searchQuery"
            @keyup.enter="handleSearch"
          />
          <i class="fas fa-search search-icon"></i>
        </div>

        <!-- 用户操作区域 -->
        <div class="user-actions">
          <!-- 消息通知 -->
          <div class="notification-container">
            <button class="notification-button" @click="showNotifications = !showNotifications">
              <i class="fas fa-bell"></i>
              <span class="notification-badge" v-if="unreadNotifications > 0">
                {{ unreadNotifications }}
              </span>
            </button>
          </div>

          <!-- 主题切换器 -->
          <ThemeSwitcher />

          <!-- 用户菜单 -->
          <div class="user-menu" v-click-outside="closeUserMenu">
            <button class="user-menu-button" @click="showUserMenu = !showUserMenu">
              <div class="user-avatar">
                <img :src="userAvatar" :alt="currentUser.name" />
              </div>
              <span class="user-name">{{ currentUser.name }}</span>
              <i class="fas fa-chevron-down" :class="{ 'rotate-180': showUserMenu }"></i>
            </button>

            <div class="user-dropdown" v-if="showUserMenu">
              <div class="user-info">
                <div class="user-avatar-large">
                  <img :src="userAvatar" :alt="currentUser.name" />
                </div>
                <div class="user-details">
                  <div class="user-name-large">{{ currentUser.name }}</div>
                  <div class="user-role">{{ currentUser.role }}</div>
                </div>
              </div>
              <hr class="dropdown-divider" />
              <router-link to="/profile" class="dropdown-item">
                <i class="fas fa-user"></i>
                个人资料
              </router-link>
              <router-link to="/settings" class="dropdown-item">
                <i class="fas fa-cog"></i>
                系统设置
              </router-link>
              <hr class="dropdown-divider" />
              <button class="dropdown-item logout-button" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i>
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <div class="admin-main">
      <!-- 侧边栏 -->
      <aside class="admin-sidebar" :class="{ collapsed: isSidebarCollapsed }">
        <nav class="sidebar-nav">
          <!-- 主菜单 -->
          <div class="nav-section">
            <ul class="nav-menu main-menu">
              <li
                v-for="item in mainMenuItems"
                :key="item.id"
                class="nav-item"
                :class="{
                  active: isMenuActive(item),
                  'has-submenu': item.children && item.children.length > 0
                }"
              >
                <router-link
                  v-if="!item.children || item.children.length === 0"
                  :to="item.path"
                  class="nav-link"
                  :title="isSidebarCollapsed ? item.label : ''"
                >
                  <i :class="item.icon" class="nav-icon"></i>
                  <span class="nav-text" v-if="!isSidebarCollapsed">{{ item.label }}</span>
                </router-link>

                <button
                  v-else
                  class="nav-link submenu-toggle"
                  @click="toggleSubmenu(item.id)"
                  :title="isSidebarCollapsed ? item.label : ''"
                >
                  <i :class="item.icon" class="nav-icon"></i>
                  <span class="nav-text" v-if="!isSidebarCollapsed">{{ item.label }}</span>
                  <i
                    class="fas fa-chevron-down submenu-arrow"
                    :class="{ 'rotate-180': expandedMenus.includes(item.id) }"
                    v-if="!isSidebarCollapsed"
                  ></i>
                </button>

                <!-- 子菜单 -->
                <ul
                  v-if="item.children && item.children.length > 0"
                  class="submenu"
                  :class="{ expanded: expandedMenus.includes(item.id) || isSidebarCollapsed }"
                >
                  <li
                    v-for="subItem in item.children"
                    :key="subItem.id"
                    class="submenu-item"
                    :class="{ active: isMenuActive(subItem) }"
                  >
                    <router-link
                      :to="subItem.path"
                      class="submenu-link"
                      :title="isSidebarCollapsed ? subItem.label : ''"
                    >
                      <i :class="subItem.icon" class="submenu-icon"></i>
                      <span class="submenu-text" v-if="!isSidebarCollapsed">{{ subItem.label }}</span>
                    </router-link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>

          <!-- 独立副菜单区域 -->
          <div class="nav-section secondary-menu" v-if="secondaryMenuItems.length > 0">
            <div class="nav-section-title" v-if="!isSidebarCollapsed">
              <span>工具与设置</span>
            </div>
            <ul class="nav-menu">
              <li
                v-for="item in secondaryMenuItems"
                :key="item.id"
                class="nav-item"
                :class="{ active: isMenuActive(item) }"
              >
                <router-link
                  :to="item.path"
                  class="nav-link"
                  :title="isSidebarCollapsed ? item.label : ''"
                >
                  <i :class="item.icon" class="nav-icon"></i>
                  <span class="nav-text" v-if="!isSidebarCollapsed">{{ item.label }}</span>
                </router-link>
              </li>
            </ul>
          </div>
        </nav>

        <!-- 侧边栏底部 -->
        <div class="sidebar-footer" v-if="!isSidebarCollapsed">
          <div class="sidebar-version">
            <span>版本 v{{ appVersion }}</span>
          </div>
        </div>
      </aside>

      <!-- 内容区域 -->
      <main class="admin-content">
        <div class="content-container">
          <router-view v-slot="{ Component, route }">
            <transition name="page-fade" mode="out-in">
              <component :is="Component" :key="route.path" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>

    <!-- 通知面板 -->
    <div v-if="showNotifications" class="notification-panel" v-click-outside="closeNotifications">
      <div class="notification-header">
        <h3>通知消息</h3>
        <button class="notification-close" @click="showNotifications = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="notification-content">
        <div v-if="notifications.length === 0" class="no-notifications">
          暂无新通知
        </div>
        <div
          v-else
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.read }"
        >
          <div class="notification-icon">
            <i :class="getNotificationIcon(notification.type)"></i>
          </div>
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ formatTime(notification.time) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useThemeStore } from '@/stores';
import ThemeSwitcher from '@/components/theme/ThemeSwitcher.vue';

// 菜单项接口
interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  children?: MenuItem[];
  permission?: string;
}

// 通知接口
interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

// 面包屑接口
interface BreadcrumbItem {
  label: string;
  path?: string;
}

// 点击外部指令
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el: any) {
    document.removeEventListener('click', el.clickOutsideEvent);
  },
};

export default defineComponent({
  name: 'AdminLayout',
  components: {
    ThemeSwitcher,
  },
  directives: {
    'click-outside': vClickOutside,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const themeStore = useThemeStore();
    const { currentTheme, isCurrentThemeDark } = storeToRefs(themeStore);

    // 布局状态
    const isSidebarCollapsed = ref(false);
    const showUserMenu = ref(false);
    const showNotifications = ref(false);
    const expandedMenus = ref<string[]>([]);
    const searchQuery = ref('');

    // 用户信息
    const currentUser = ref({
      name: '管理员',
      role: '系统管理员',
      avatar: '',
    });

    // 应用版本
    const appVersion = ref('1.0.0');

    // 通知数据
    const notifications = ref<Notification[]>([
      {
        id: '1',
        type: 'info',
        title: '系统更新',
        message: '系统将在今晚12点进行维护更新',
        time: new Date(),
        read: false,
      },
      {
        id: '2',
        type: 'warning',
        title: '存储空间警告',
        message: '系统存储空间使用率已达到85%',
        time: new Date(Date.now() - 3600000),
        read: false,
      },
    ]);

    // 未读通知数量
    const unreadNotifications = computed(() => {
      return notifications.value.filter((n: Notification) => !n.read).length;
    });

    // 用户头像
    const userAvatar = computed(() => {
      return currentUser.value.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.value.name)}&background=random`;
    });

    // 主菜单配置
    const mainMenuItems = ref<MenuItem[]>([
      {
        id: 'dashboard',
        label: '仪表盘',
        icon: 'fas fa-tachometer-alt',
        path: '/admin/dashboard',
      },
      {
        id: 'users',
        label: '用户管理',
        icon: 'fas fa-users',
        path: '/admin/users',
        children: [
          {
            id: 'user-list',
            label: '用户列表',
            icon: 'fas fa-list',
            path: '/admin/users/list',
          },
          {
            id: 'user-roles',
            label: '角色管理',
            icon: 'fas fa-user-tag',
            path: '/admin/users/roles',
          },
          {
            id: 'user-permissions',
            label: '权限管理',
            icon: 'fas fa-shield-alt',
            path: '/admin/users/permissions',
          },
        ],
      },
      {
        id: 'projects',
        label: '项目管理',
        icon: 'fas fa-project-diagram',
        path: '/admin/projects',
        children: [
          {
            id: 'project-list',
            label: '项目列表',
            icon: 'fas fa-list',
            path: '/admin/projects/list',
          },
          {
            id: 'project-analysis',
            label: '项目分析',
            icon: 'fas fa-chart-line',
            path: '/admin/projects/analysis',
          },
        ],
      },
      {
        id: 'logs',
        label: '日志管理',
        icon: 'fas fa-file-alt',
        path: '/admin/logs',
      },
    ]);

    // 独立副菜单配置
    const secondaryMenuItems = ref<MenuItem[]>([
      {
        id: 'settings',
        label: '系统设置',
        icon: 'fas fa-cog',
        path: '/admin/settings',
      },
      {
        id: 'theme-demo',
        label: '主题演示',
        icon: 'fas fa-palette',
        path: '/admin/theme-demo',
      },
      {
        id: 'help',
        label: '帮助中心',
        icon: 'fas fa-question-circle',
        path: '/admin/help',
      },
    ]);

    // 面包屑导航
    const breadcrumbs = computed(() => {
      const crumbs: BreadcrumbItem[] = [];
      const matched = route.matched.filter((item: any) => item.meta && item.meta.title);

      matched.forEach((item: any, index: number) => {
        crumbs.push({
          label: item.meta?.title as string,
          path: index < matched.length - 1 ? item.path : undefined,
        });
      });

      return crumbs;
    });

    // 切换侧边栏
    const toggleSidebar = () => {
      isSidebarCollapsed.value = !isSidebarCollapsed.value;
      localStorage.setItem('sidebar-collapsed', isSidebarCollapsed.value.toString());
    };

    // 切换子菜单
    const toggleSubmenu = (menuId: string) => {
      const index = expandedMenus.value.indexOf(menuId);
      if (index > -1) {
        expandedMenus.value.splice(index, 1);
      } else {
        expandedMenus.value.push(menuId);
      }
    };

    // 判断菜单是否激活
    const isMenuActive = (item: MenuItem): boolean => {
      if (item.path === route.path) return true;
      if (item.children) {
        return item.children.some(child => child.path === route.path);
      }
      return route.path.startsWith(item.path);
    };

    // 关闭用户菜单
    const closeUserMenu = () => {
      showUserMenu.value = false;
    };

    // 关闭通知面板
    const closeNotifications = () => {
      showNotifications.value = false;
    };

    // 处理搜索
    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({
          path: '/search',
          query: { q: searchQuery.value },
        });
      }
    };

    // 处理退出登录
    const handleLogout = () => {
      // 这里应该调用退出登录的逻辑
      router.push('/login');
    };

    // 获取通知图标
    const getNotificationIcon = (type: string) => {
      switch (type) {
        case 'info':
          return 'fas fa-info-circle text-blue-500';
        case 'warning':
          return 'fas fa-exclamation-triangle text-yellow-500';
        case 'error':
          return 'fas fa-times-circle text-red-500';
        case 'success':
          return 'fas fa-check-circle text-green-500';
        default:
          return 'fas fa-bell text-gray-500';
      }
    };

    // 格式化时间
    const formatTime = (time: Date) => {
      const now = new Date();
      const diff = now.getTime() - time.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return '刚刚';
      if (minutes < 60) return `${minutes}分钟前`;
      if (hours < 24) return `${hours}小时前`;
      return `${days}天前`;
    };

    // 监听路由变化，自动展开对应的菜单
    watch(route, (newRoute: any) => {
      mainMenuItems.value.forEach((item: MenuItem) => {
        if (item.children) {
          const hasActiveChild = item.children.some((child: MenuItem) => child.path === newRoute.path);
          if (hasActiveChild && !expandedMenus.value.includes(item.id)) {
            expandedMenus.value.push(item.id);
          }
        }
      });
    }, { immediate: true });

    // 组件挂载时恢复侧边栏状态
    onMounted(() => {
      const savedState = localStorage.getItem('sidebar-collapsed');
      if (savedState) {
        isSidebarCollapsed.value = savedState === 'true';
      }
    });

    return {
      // 状态
      currentTheme,
      isCurrentThemeDark,
      isSidebarCollapsed,
      showUserMenu,
      showNotifications,
      expandedMenus,
      searchQuery,
      currentUser,
      appVersion,
      notifications,
      unreadNotifications,
      userAvatar,
      mainMenuItems,
      secondaryMenuItems,
      breadcrumbs,

      // 方法
      toggleSidebar,
      toggleSubmenu,
      isMenuActive,
      closeUserMenu,
      closeNotifications,
      handleSearch,
      handleLogout,
      getNotificationIcon,
      formatTime,
    };
  },
});
</script>

<style scoped>
/* 管理布局基础样式 */
.admin-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--theme-bg-base);
  color: var(--theme-text-primary);
  transition: all 0.3s ease;
}

/* 顶部导航栏 */
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  background-color: var(--theme-bg-navbar);
  border-bottom: 1px solid var(--theme-border-base);
  box-shadow: var(--theme-shadow-sm);
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  color: var(--theme-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-toggle:hover {
  background-color: var(--theme-bg-hover);
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--theme-text-primary);
}

.logo-image {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: var(--theme-brand-primary);
}

/* 面包屑导航 */
.breadcrumb-nav {
  flex: 1;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-link {
  color: var(--theme-text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--theme-brand-primary);
}

.breadcrumb-text {
  color: var(--theme-text-primary);
  font-weight: 500;
}

.breadcrumb-separator {
  color: var(--theme-text-tertiary);
  font-size: 12px;
}

/* 顶部导航栏右侧 */
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 搜索框 */
.search-container {
  position: relative;
}

.search-input {
  width: 240px;
  padding: 8px 36px 8px 12px;
  background-color: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-md);
  color: var(--theme-text-primary);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--theme-brand-primary);
  box-shadow: 0 0 0 2px var(--theme-brand-primary-alpha);
}

.search-input::placeholder {
  color: var(--theme-text-placeholder);
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--theme-text-tertiary);
}

/* 用户操作区域 */
.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 通知按钮 */
.notification-container {
  position: relative;
}

.notification-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  color: var(--theme-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-button:hover {
  background-color: var(--theme-bg-hover);
}

.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background-color: var(--theme-danger);
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 用户菜单 */
.user-menu {
  position: relative;
}

.user-menu-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  color: var(--theme-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-menu-button:hover {
  background-color: var(--theme-bg-hover);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-weight: 500;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background-color: var(--theme-bg-elevated);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-lg);
  box-shadow: var(--theme-shadow-lg);
  z-index: 1000;
  overflow: hidden;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: var(--theme-bg-accent);
}

.user-avatar-large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
}

.user-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.user-name-large {
  font-weight: 600;
  color: var(--theme-text-primary);
}

.user-role {
  font-size: 14px;
  color: var(--theme-text-secondary);
}

.dropdown-divider {
  margin: 0;
  border: none;
  border-top: 1px solid var(--theme-border-base);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  color: var(--theme-text-primary);
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: var(--theme-bg-hover);
}

.logout-button {
  color: var(--theme-danger);
}

/* 主要内容区域 */
.admin-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 侧边栏 */
.admin-sidebar {
  width: 280px;
  background-color: var(--theme-bg-sidebar);
  border-right: 1px solid var(--theme-border-base);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.admin-sidebar.collapsed {
  width: 64px;
}

/* 侧边栏导航 */
.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 24px;
}

.nav-section-title {
  padding: 0 16px 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--theme-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  color: var(--theme-text-sidebar);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: var(--theme-bg-sidebar-hover);
  color: var(--theme-text-sidebar-hover);
}

.nav-item.active .nav-link {
  background-color: var(--theme-bg-sidebar-active);
  color: var(--theme-text-sidebar-active);
  border-right: 3px solid var(--theme-brand-primary);
}

.nav-icon {
  width: 20px;
  text-align: center;
  color: var(--theme-text-sidebar-icon);
}

.nav-item.active .nav-icon {
  color: var(--theme-brand-primary);
}

.nav-text {
  flex: 1;
  text-align: left;
}

.submenu-arrow {
  font-size: 12px;
  transition: transform 0.2s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* 子菜单 */
.submenu {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.submenu.expanded {
  max-height: 500px;
}

.admin-sidebar.collapsed .submenu {
  display: none;
}

.submenu-item {
  margin-bottom: 2px;
}

.submenu-link {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 16px 8px 48px;
  color: var(--theme-text-sidebar);
  text-decoration: none;
  transition: all 0.2s ease;
}

.submenu-link:hover {
  background-color: var(--theme-bg-sidebar-hover);
  color: var(--theme-text-sidebar-hover);
}

.submenu-item.active .submenu-link {
  background-color: var(--theme-bg-sidebar-active);
  color: var(--theme-text-sidebar-active);
}

.submenu-icon {
  width: 16px;
  text-align: center;
  font-size: 14px;
}

/* 独立副菜单样式 */
.secondary-menu .nav-link {
  padding: 10px 16px;
}

.secondary-menu .nav-icon {
  width: 18px;
  font-size: 16px;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--theme-border-base);
  text-align: center;
}

.sidebar-version {
  font-size: 12px;
  color: var(--theme-text-tertiary);
}

/* 内容区域 */
.admin-content {
  flex: 1;
  overflow: hidden;
}

.content-container {
  height: 100%;
  overflow-y: auto;
  padding: 24px;
}

/* 页面切换动画 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

/* 通知面板 */
.notification-panel {
  position: fixed;
  top: 64px;
  right: 24px;
  width: 360px;
  max-height: 80vh;
  background-color: var(--theme-bg-elevated);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-lg);
  box-shadow: var(--theme-shadow-lg);
  z-index: 1000;
  overflow: hidden;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--theme-border-base);
}

.notification-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.notification-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--theme-text-tertiary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-close:hover {
  background-color: var(--theme-bg-hover);
  color: var(--theme-text-primary);
}

.notification-content {
  max-height: 400px;
  overflow-y: auto;
}

.no-notifications {
  padding: 48px 16px;
  text-align: center;
  color: var(--theme-text-tertiary);
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--theme-border-base);
  transition: background-color 0.2s ease;
}

.notification-item:hover {
  background-color: var(--theme-bg-hover);
}

.notification-item.unread {
  background-color: var(--theme-bg-accent);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-icon {
  width: 24px;
  text-align: center;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 14px;
  color: var(--theme-text-secondary);
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: var(--theme-text-tertiary);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .admin-header {
    padding: 0 16px;
  }

  .header-left {
    gap: 16px;
  }

  .search-input {
    width: 200px;
  }

  .user-name {
    display: none;
  }

  .admin-sidebar {
    width: 240px;
  }

  .admin-sidebar.collapsed {
    width: 64px;
  }

  .content-container {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    left: 0;
    top: 64px;
    height: calc(100vh - 64px);
    z-index: 1000;
    transform: translateX(-100%);
  }

  .admin-layout--sidebar-collapsed .admin-sidebar {
    transform: translateX(0);
  }

  .admin-content {
    margin-left: 0;
  }

  .breadcrumb-nav {
    display: none;
  }

  .search-container {
    display: none;
  }

  .notification-panel {
    right: 16px;
    left: 16px;
    width: auto;
  }

  .user-dropdown {
    right: -50px;
    width: 240px;
  }
}

/* 暗黑模式特殊调整 */
.admin-layout--dark .admin-sidebar {
  background-color: var(--theme-bg-sidebar);
}

/* 主题特定的调整 */
.admin-layout--tech-blue .nav-item.active .nav-icon {
  color: var(--theme-brand-primary);
}

.admin-layout--deep-green .notification-badge {
  background-color: var(--theme-success);
}

.admin-layout--light-purple .logo-text {
  color: var(--theme-brand-primary);
}
</style>
