<template>
  <div class="smart-abp-layout">
    <!-- 路由进度条（无依赖） -->
    <div
      v-show="isRouting"
      class="route-progress"
      :style="{ width: progressWidth + '%' }"
    />
    <!-- 顶部导航栏 -->
    <header class="top-navbar">
      <div class="navbar-left">
        <img
          src="/logo.svg"
          alt="SmartAbp"
          class="logo"
        >
        <span class="brand-name">SmartAbp</span>
      </div>

      <nav class="navbar-center">
        <a
          href="#"
          class="nav-link"
          @click="navigateToExternal('智慧工地')"
        >智慧工地</a>
        <a
          href="#"
          class="nav-link"
          @click="navigateToExternal('MES')"
        >MES</a>
        <a
          href="#"
          class="nav-link"
          @click="navigateToExternal('系统配置')"
        >系统配置</a>
        <a
          href="#"
          class="nav-link"
          @click="navigateToExternal('APP')"
        >APP</a>
      </nav>

      <div class="navbar-right">
        <!-- 🌍 语言切换器（增强版） -->
        <LanguageSwitcher />

        <!-- 🎨 主题&图标切换（统一入口） -->
        <ThemeSwitcher />

        <button
          class="icon-btn"
          title="设置"
          @click="openSettings"
        >
          <i class="fas fa-cog" />
        </button>

        <!-- 👤 个人中心下拉菜单 -->
        <el-dropdown
          trigger="click"
          @command="handleUserCommand"
        >
          <div class="user-menu">
            <img
              src="/logo.svg"
              alt="用户头像"
              class="user-avatar"
            >
            <span class="username">{{ displayUserName }}</span>
            <i class="fas fa-chevron-down dropdown-icon" />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <i
                  class="fas fa-user"
                  style="margin-right: 8px;"
                />
                个人信息
              </el-dropdown-item>
              <el-dropdown-item
                command="logout"
                divided
              >
                <i
                  class="fas fa-sign-out-alt"
                  style="margin-right: 8px;"
                />
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 主内容区域 -->
    <div class="main-container">
      <!-- 侧边栏 -->
      <aside
        class="sidebar"
        :class="{ collapsed: sidebarCollapsed }"
      >
        <div class="sidebar-header">
          <button
            class="collapse-btn"
            @click="toggleSidebar"
          >
            <i :class="sidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'" />
          </button>
        </div>

        <nav class="sidebar-nav">
          <template
            v-for="item in filteredMenus"
            :key="item.key"
          >
            <!-- 菜单分割线（不渲染图标与标题） -->
            <div
              v-if="item.type === 'divider'"
              class="menu-divider"
              role="separator"
            />

            <!-- 普通菜单/文件夹 -->
            <div
              v-else
              class="nav-item"
            >
              <div
                class="nav-link"
                :class="{
                  active: menuState.activeMenuKey === item.key,
                  'has-children': item.type === 'folder' && item.children,
                }"
                @click="handleMenuClick(item)"
              >
                <DynamicIcon :icon="item.icon" />
                <span
                  v-if="!sidebarCollapsed"
                  class="nav-text"
                >{{ item.title }}</span>
                <i
                  v-if="item.type === 'folder' && item.children && !sidebarCollapsed"
                  :class="[
                    'fas fa-chevron-down',
                    'expand-icon',
                    { expanded: expandedMenus.includes(item.key) },
                  ]"
                />
              </div>

              <div
                v-if="item.type === 'folder' && item.children"
                v-show="expandedMenus.includes(item.key)"
                class="sub-menu"
                :class="{ collapsed: sidebarCollapsed }"
              >
                <div
                  v-for="child in item.children"
                  :key="child.key"
                  class="sub-nav-link"
                  :class="{ active: menuState.activeSubMenuKey === child.key }"
                  @click="handleSubMenuClick(child)"
                >
                  <DynamicIcon :icon="child.icon" />
                  <span class="nav-text">{{ child.title }}</span>
                </div>
              </div>
            </div>
          </template>
        </nav>
      </aside>

      <!-- 副菜单 -->
      <aside
        v-if="!sidebarCollapsed"
        class="submenu-panel"
        :class="{ show: shouldShowSubmenu }"
      >
        <div class="submenu-header">
          <h3>{{ submenuTitle }}</h3>
          <button
            class="close-submenu"
            @click="closeSubmenu"
          >
            <i class="fas fa-times" />
          </button>
        </div>

        <div class="submenu-content">
          <div
            v-for="sub in currentSubmenuItems"
            :key="sub.key"
            class="submenu-item"
            @click="handleSubMenuClick(sub)"
          >
            <DynamicIcon :icon="sub.icon" />
            <span>{{ sub.title }}</span>
          </div>
        </div>
      </aside>

      <!-- 内容区域 -->
      <main class="content-area">
        <!-- 🧭 面包屑导航 -->
        <nav
          v-if="breadcrumbs.length > 0"
          class="breadcrumb-nav"
          aria-label="breadcrumb"
        >
          <el-breadcrumb separator="/">
            <el-breadcrumb-item
              v-for="(item, index) in breadcrumbs"
              :key="index"
              :to="index < breadcrumbs.length - 1 ? item.path : undefined"
            >
              <DynamicIcon
                v-if="item.icon"
                :icon="item.icon"
                :size="14"
              />
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </nav>

        <!-- 标签页导航 -->
        <div
          v-if="openTabs.length > 0"
          class="tab-navigation"
        >
          <div class="tabs-container">
            <el-dropdown
              v-for="tab in openTabs"
              :key="tab.key"
              trigger="contextmenu"
              @command="onTabMenuCommand"
            >
              <div
                class="tab-item"
                :class="{ active: activeTab === tab.key }"
                @click="switchTab(tab.key)"
              >
                <DynamicIcon :icon="tab.icon" />
                <span class="tab-title">{{ tab.title }}</span>
                <button
                  class="tab-pin"
                  :title="isTabPinned(tab.key) ? '取消固定' : '固定标签'"
                  @click.stop="togglePinTab(tab.key)"
                >
                  {{ isTabPinned(tab.key) ? '📌' : '📍' }}
                </button>
                <button
                  v-if="tab.closable !== false && !isTabPinned(tab.key)"
                  class="tab-close"
                  @click.stop="closeTab(tab.key)"
                >
                  <i class="fas fa-times" />
                </button>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    :command="{ action: 'close', key: tab.key }"
                    :disabled="isTabPinned(tab.key)"
                  >
                    关闭当前
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'closeRight', key: tab.key }">
                    关闭右侧
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'closeOthers', key: tab.key }">
                    关闭其它
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="tabs-actions">
            <el-switch
              v-model="singleTabMode"
              active-text="单页模式"
              inline-prompt
              size="small"
            />
            <el-button
              class="tabs-clean-btn"
              text
              size="small"
              @click="closeOtherTabs"
            >
              仅保留当前+固定
            </el-button>
          </div>
        </div>

        <!-- 页面内容 -->
        <div class="page-content">
          <Transition
            name="fade-page"
            mode="out-in"
            appear
          >
            <Suspense>
              <router-view />
              <template #fallback>
                <div class="page-loading">
                  <el-icon>
                    <Loading />
                  </el-icon>
                </div>
              </template>
            </Suspense>
          </Transition>
        </div>
      </main>
    </div>

    <!-- 🔎 全局搜索（Ctrl+K） -->
    <el-dialog
      v-model="showGlobalSearch"
      width="600px"
      :show-close="false"
      align-center
      class="global-search-dialog"
    >
      <template #header>
        <div class="global-search-header">
          <DynamicIcon icon="ep-search" />
          <span>全局搜索</span>
          <span class="hint">Ctrl+K</span>
        </div>
      </template>
      <div class="global-search-body">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索功能、菜单或页面"
          @keydown.enter="goFirstSearchResult"
        />
        <div class="search-results">
          <div
            v-for="item in searchResults"
            :key="item.key"
            class="search-result-item"
            @click="navigateSearch(item)"
          >
            <DynamicIcon :icon="item.icon" />
            <span class="title">{{ item.title }}</span>
            <span
              v-if="item.parentTitle"
              class="path"
            >{{ item.parentTitle }} / {{ item.title }}</span>
          </div>
          <div
            v-if="searchResults.length === 0"
            class="search-empty"
          >
            无匹配结果
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 退出登录确认对话框 -->
    <LogoutConfirmDialog
      v-model:visible="showLogoutDialog"
      :is-loading="isLoggingOut"
      @confirm="handleLogoutConfirm"
      @cancel="handleLogoutCancel"
    />
  </div>
</template>

<script setup lang="ts">
import DynamicIcon from "@/components/common/DynamicIcon.vue"
import LanguageSwitcher from "@/components/common/LanguageSwitcher.vue"
import LogoutConfirmDialog from "@/components/common/LogoutConfirmDialog.vue"
import ThemeSwitcher from "@/components/theme/ThemeSwitcher.vue"
import { useMenu } from "@/composables/useMenu"
import { useThemeStore } from "@/stores"
import { useAuthStore } from "@/stores/modules/auth"
import { Loading } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()
// 路由进度条状态
const isRouting = ref(false)
const progressWidth = ref(0)
let progressTimer: number | undefined

router.beforeEach(() => {
  isRouting.value = true
  progressWidth.value = 10
  if (progressTimer) window.clearInterval(progressTimer)
  progressTimer = window.setInterval(() => {
    // 逐步增加，最多到90%
    if (progressWidth.value < 90) progressWidth.value += 5
  }, 120)
})

router.afterEach(() => {
  progressWidth.value = 100
  window.setTimeout(() => {
    isRouting.value = false
    progressWidth.value = 0
    if (progressTimer) window.clearInterval(progressTimer)
  }, 200)
})

// 侧边栏显示
const sidebarCollapsed = ref(false)

// 退出登录对话框状态
const showLogoutDialog = ref(false)
const isLoggingOut = ref(false)

// 动态菜单系统
const {
  menuState,
  filteredMenus,
  submenuTitle,
  currentSubmenuItems,
  shouldShowSubmenu,
  handleMenuClick,
  handleSubMenuClick,
  closeSubmenu,
  switchTab,
  closeTab,
} = useMenu()

// 🧭 面包屑导航（2025企业系统标准）
const breadcrumbs = computed(() => {
  const crumbs: Array<{ title: string; path?: string; icon?: string }> = [
    { title: '首页', path: '/dashboard', icon: 'ep-home-filled' }
  ]

  const activeKey = menuState.value.activeMenuKey
  if (activeKey) {
    // 递归查找激活的菜单项
    for (const menu of filteredMenus.value) {
      if (menu.key === activeKey) {
        crumbs.push({ title: menu.title, icon: menu.icon })
        break
      }
      if (menu.type === 'folder' && 'children' in menu && menu.children) {
        for (const child of menu.children) {
          if (child.key === activeKey) {
            crumbs.push({ title: menu.title, icon: menu.icon })
            crumbs.push({ title: child.title, icon: child.icon })
            break
          }
        }
      }
    }
  }

  return crumbs
})

const expandedMenus = computed(() => menuState.value.expandedMenuKeys)
const openTabs = computed(() => menuState.value.openTabs)
const activeTab = computed(() => menuState.value.activeTab)

// 单页模式（仅保留当前标签，固定标签除外）
const SINGLE_TAB_KEY = 'smartabp-single-tab-mode'
const singleTabMode = ref(localStorage.getItem(SINGLE_TAB_KEY) === 'true')

watch(singleTabMode, (val: boolean) => {
  localStorage.setItem(SINGLE_TAB_KEY, String(val))
  if (val) enforceSingleTab()
})

watch(activeTab, () => {
  if (singleTabMode.value) enforceSingleTab()
})

const enforceSingleTab = () => {
  const tabs = openTabs.value
  const current = activeTab.value
  if (!current || tabs.length <= 1) return
  // 关闭除当前与已固定外的标签
  for (const tab of tabs) {
    if (tab.key !== current && !pinnedTabKeys.value.has(tab.key)) {
      closeTab(tab.key)
    }
  }
}

const closeOtherTabs = () => {
  const tabs = openTabs.value
  const current = activeTab.value
  if (!current) return
  for (const tab of tabs) {
    if (tab.key !== current && !pinnedTabKeys.value.has(tab.key)) {
      closeTab(tab.key)
    }
  }
}

type TabMenuCommand = { action: 'close' | 'closeRight' | 'closeOthers'; key: string }
const onTabMenuCommand = (cmd: TabMenuCommand) => {
  const tabs = openTabs.value
  const idx = tabs.findIndex(t => t.key === cmd.key)
  if (idx < 0) return
  if (cmd.action === 'close') {
    if (!pinnedTabKeys.value.has(cmd.key)) closeTab(cmd.key)
    return
  }
  if (cmd.action === 'closeRight') {
    for (let i = tabs.length - 1; i > idx; i--) {
      const t = tabs[i]
      if (t && !pinnedTabKeys.value.has(t.key)) closeTab(t.key)
    }
    return
  }
  if (cmd.action === 'closeOthers') {
    const keep = new Set<string>([cmd.key, ...pinnedTabKeys.value])
    for (const t of tabs) {
      if (!keep.has(t.key)) closeTab(t.key)
    }
  }
}

// 📌 标签固定（本地状态，不侵入Store）
const pinnedTabKeys = ref<Set<string>>(new Set())
const isTabPinned = (key: string) => pinnedTabKeys.value.has(key)
const togglePinTab = (key: string) => {
  if (pinnedTabKeys.value.has(key)) pinnedTabKeys.value.delete(key)
  else pinnedTabKeys.value.add(key)
}

// 🔎 全局搜索（Ctrl+K）
const showGlobalSearch = ref(false)
const searchKeyword = ref("")
type SearchItem = { key: string; title: string; icon?: string; path?: string; parentTitle?: string }
const searchResults = computed<SearchItem[]>(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return []
  const results: SearchItem[] = []
  for (const menu of filteredMenus.value) {
    if (menu.title.toLowerCase().includes(kw)) results.push({ key: menu.key, title: menu.title, icon: menu.icon, path: (menu as any).path })
    if ((menu as any).children) {
      for (const child of (menu as any).children) {
        if (child.title.toLowerCase().includes(kw)) results.push({ key: child.key, title: child.title, icon: child.icon, path: (child as any).path, parentTitle: menu.title })
      }
    }
  }
  // 简单排序：父子命中优先，长度短的优先
  results.sort((a, b) => (a.parentTitle ? 1 : 0) - (b.parentTitle ? 1 : 0) || a.title.length - b.title.length)
  return results.slice(0, 20)
})

const goFirstSearchResult = () => {
  if (searchResults.value.length === 0) return
  const firstItem = searchResults.value[0]
  if (firstItem) navigateSearch(firstItem)
}

const navigateSearch = (item: SearchItem) => {
  showGlobalSearch.value = false
  searchKeyword.value = ""
  if (typeof item.path === 'string' && item.path) router.push(item.path)
  else switchTab(item.key)
}

const keydownHandler = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    showGlobalSearch.value = true
    // 自动聚焦
    requestAnimationFrame(() => {
      const el = document.querySelector('.global-search-dialog input') as HTMLInputElement | null
      el?.focus()
    })
  }
  if (e.key === 'Escape' && showGlobalSearch.value) {
    showGlobalSearch.value = false
  }
}

// 用户信息
const userInfo = ref({
  name: "管理员",
  email: "admin@smartabp.com",
})

// 显示用户名（优先使用 authStore 中的用户信息）
const displayUserName = computed(() => {
  return authStore.userInfo?.userName || userInfo.value.name || "用户"
})

// 方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const navigateToExternal = (name: string) => {
  console.log(`导航到外部系统: ${name}`)
}

const openSettings = () => {
  router.push("/Admin/settings")
}

// 🎨 处理用户下拉菜单命令
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push("/profile")
      ElMessage.info('跳转到个人中心')
      break
    case 'logout':
      logout()
      break
    default:
      console.warn(`未知的用户命令: ${command}`)
  }
}

// ✅ 主题和图标切换已统一到 ThemeSwitcher 组件
// 通过配置驱动自动联动，无需独立切换按钮和处理函数

const logout = () => {
  // 显示退出登录确认对话框
  showLogoutDialog.value = true
}

const handleLogoutConfirm = async () => {
  try {
    isLoggingOut.value = true

    // 调用认证存储的退出方法
    await authStore.logout()

    // 关闭对话框
    showLogoutDialog.value = false

    // 跳转到登录页
    await router.push("/login")
  } catch (error) {
    console.error("退出登录时发生错误:", error)
    // 即使出错也要清除本地状态并跳转
    authStore.logout()
    await router.push("/login")
  } finally {
    isLoggingOut.value = false
    showLogoutDialog.value = false
  }
}

const handleLogoutCancel = () => {
  showLogoutDialog.value = false
}

onMounted(() => {
  themeStore.init()
  // 初始化认证状态
  authStore.initialize()
  // 同步SmartAbp认证系统状态
  authStore.syncFromSmartAbp()
  // 绑定全局快捷键
  window.addEventListener('keydown', keydownHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', keydownHandler)
})
</script>

<style scoped>
/* 🎨 2025 设计系统规范 */
.smart-abp-layout {
  /* 字体层级 */
  --font-h1: 24px;
  --font-h2: 20px;
  --font-h3: 18px;
  --font-h4: 16px;
  --font-base: 14px;
  --font-small: 12px;

  /* z-index层级 */
  --z-header: 400;
  --z-sidebar: 300;
  --z-dropdown: 100;

  /* 基础布局 */
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--theme-bg-body);
  color: var(--theme-text-primary);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: var(--font-base);
}

/* 顶部导航栏 */
.top-navbar {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 var(--spacing-6);
  background: var(--theme-header-bg);
  border-bottom: 1px solid var(--theme-header-border);
  box-shadow: var(--theme-header-shadow);
  backdrop-filter: blur(8px);
  z-index: var(--z-header);
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
  font-size: var(--font-h2);
  font-weight: 700;
  color: var(--theme-brand-primary);
  letter-spacing: -0.02em;
}

.nav-link {
  padding: 10px 16px;
  margin: 0 var(--spacing-1);
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
  color: var(--theme-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-btn:hover {
  background-color: var(--hover-bg);
  color: var(--theme-brand-primary);
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
  padding: var(--spacing-2);
  background-color: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
  min-width: 160px;
  z-index: 1001;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: var(--spacing-2) 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-option:hover {
  background-color: var(--hover-bg);
}

.theme-option.active {
  background-color: var(--theme-brand-primary);
  color: white;
}

.theme-divider {
  height: 1px;
  background-color: var(--theme-border-base);
  margin: var(--spacing-1) 0;
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

/* 路由进度条（无依赖） */
.route-progress {
  position: fixed;
  left: 0;
  top: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--theme-brand-primary), var(--theme-brand-primary-hover));
  box-shadow: 0 0 8px rgb(0 0 0 / 10%);
  z-index: 10000;
  transition: width 0.2s ease;
}

/* 用户菜单 */
.user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: var(--spacing-2) 14px;
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
  overflow: hidden auto;
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
  padding: 0 var(--spacing-5);
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
  padding: var(--spacing-5) 12px;
}

.menu-divider {
  height: 12px;
  margin: var(--spacing-2) 4px;
  border-bottom: 1px dashed var(--theme-border-light);
  opacity: 0.7;
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
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  background: var(--theme-brand-primary);
  border-radius: 0 2px 2px 0;
}

.sidebar-nav .nav-link i,
.sidebar-nav .nav-link :deep(.dynamic-icon) {
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
  content: "";
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
/* 🧭 面包屑导航 - 2025企业系统标准 */
.breadcrumb-nav {
  padding: var(--spacing-3) 24px;
  background: var(--theme-bg-component);
  border-bottom: 1px solid var(--theme-border-light);
}

.breadcrumb-nav :deep(.el-breadcrumb) {
  display: flex;
  align-items: center;
  font-size: var(--font-small);
}

.breadcrumb-nav :deep(.el-breadcrumb__item) {
  display: flex;
  align-items: center;
  gap: 4px;
}

.breadcrumb-nav :deep(.el-breadcrumb__inner) {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--theme-text-secondary);
  font-weight: 500;
  transition: color 0.2s;
}

.breadcrumb-nav :deep(.el-breadcrumb__inner):hover {
  color: var(--theme-brand-primary);
}

.breadcrumb-nav :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--theme-text-primary);
  font-weight: 600;
}

.tab-navigation {
  background: var(--theme-bg-component);
  border-bottom: 1px solid var(--theme-border-base);
  backdrop-filter: blur(8px);
}

.tabs-container {
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-4);
  overflow-x: auto;
  justify-content: flex-start;
  gap: 0;
}

.tabs-actions {
  display: flex;
  align-items: center;
  padding: 6px 12px;
}

.tabs-clean-btn {
  margin-left: 8px;
  color: var(--theme-text-secondary);
}

.tabs-clean-btn:hover {
  color: var(--theme-brand-primary);
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
  margin: var(--spacing-1) 2px 0 0;
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
  content: "";
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

.tab-pin {
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
  font-size: 12px;
}

.tab-pin:hover {
  background-color: var(--theme-bg-hover);
  color: var(--theme-brand-primary);
  transform: scale(1.1);
}

/* 页面内容 */
.page-content {
  flex: 1;
  padding: var(--spacing-8);
  overflow-y: auto;
  background: var(--theme-bg-base);
  border-radius: 16px 0 0;
  margin-top: 1px;
}

/* 页面切换过渡与加载 */
.page-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 160px);
  color: var(--theme-text-secondary);
}

.fade-page-enter-active,
.fade-page-leave-active {
  transition: opacity .25s ease;
}

.fade-page-enter-from,
.fade-page-leave-to {
  opacity: 0;
}

/* 响应式设计 - 2025标准 */
/* 移动端 */
@media (width <=768px) {
  .navbar-center {
    display: none;
  }

  .brand-name {
    font-size: 18px;
  }
}

/* 平板 */
@media (width >=768px) and (width <=1024px) {
  .sidebar {
    width: 220px;
  }

  .navbar-center .nav-link {
    padding: 6px 12px;
    font-size: 13px;
  }
}

/* 笔记本 */
@media (width >=1024px) and (width <=1440px) {
  .sidebar {
    width: 260px;
  }
}

/* 桌面大屏 */
@media (width >=1920px) {
  .sidebar {
    width: 300px;
  }

  .page-content {
    max-width: 1600px;
    margin: 0 auto;
  }
}

@media (width <=768px) {
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
  padding: var(--spacing-5);
  border-bottom: 1px solid var(--theme-border-base);
  background: var(--theme-header-bg);
  position: relative;
}

.submenu-header::after {
  content: "";
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
  padding: var(--spacing-2);
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
  padding: var(--spacing-4) 0;
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
  content: "";
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
