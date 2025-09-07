/**
 * 菜单管理组合式函数
 * 提供统一的菜单状态管理和操作API
 * 整合菜单store和路由功能
 */

import { computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMenuStore } from '@/stores'
import type { MenuItem } from '@/types/menu'

/**
 * 菜单管理Composable
 * 提供菜单状态管理、权限检查、路由导航等功能
 */
export function useMenu() {
  const router = useRouter()
  const route = useRoute()
  const menuStore = useMenuStore()

  // ===========================================
  // 响应式状态 (从store获取)
  // ===========================================

  // 菜单状态
  const menuState = computed(() => menuStore.menuState)
  const loading = computed(() => menuStore.loading)
  const error = computed(() => menuStore.error)

  // 菜单数据
  const filteredMenus = computed(() => menuStore.filteredMenus)
  const menuMap = computed(() => menuStore.menuMap)
  const activeMenu = computed(() => menuStore.activeMenu)
  const activeSubMenu = computed(() => menuStore.activeSubMenu)
  const submenuTitle = computed(() => menuStore.submenuTitle)
  const currentSubmenuItems = computed(() => menuStore.currentSubmenuItems)
  const shouldShowSubmenu = computed(() => menuStore.shouldShowSubmenu)
  const permissionSummary = computed(() => menuStore.permissionSummary)

  // ===========================================
  // 菜单操作方法
  // ===========================================

  /**
   * 处理菜单项点击
   * 根据菜单类型执行不同的操作
   */
  const handleMenuClick = async (menuItem: MenuItem) => {
    console.log('处理菜单点击:', menuItem)

    if (menuItem.type === 'folder') {
      // 文件夹菜单：展开/收缩 + 显示副菜单
      menuStore.toggleMenuExpansion(menuItem.key)
      menuStore.toggleSubmenu(menuItem.key)
    } else if (menuItem.type === 'page') {
      // 页面菜单：导航到页面
      await navigateToPage(menuItem)
      menuStore.closeSubmenu()
    } else if (menuItem.type === 'external') {
      // 外部链接：打开新窗口/标签页
      window.open(menuItem.url, menuItem.target || '_blank')
    }
  }

  /**
   * 处理子菜单项点击
   */
  const handleSubMenuClick = async (subMenuItem: MenuItem) => {
    console.log('处理子菜单点击:', subMenuItem)

    if (subMenuItem.type === 'page') {
      await navigateToPage(subMenuItem)
      menuStore.setActiveMenu(menuStore.menuState.activeMenuKey, subMenuItem.key)
    }
  }

  /**
   * 导航到指定页面
   */
  const navigateToPage = async (menuItem: MenuItem) => {
    if (menuItem.type !== 'page') {
      return false
    }

    try {
      // 添加标签页
      menuStore.addTab(menuItem)

      // 路由导航
      await router.push(menuItem.path)

      console.log(`导航到页面: ${menuItem.title} (${menuItem.path})`)
      return true
    } catch (error) {
      console.error('页面导航失败:', error)
      return false
    }
  }

  /**
   * 切换侧边栏展开/收缩状态
   */
  const toggleMenuExpansion = (menuKey: string) => {
    menuStore.toggleMenuExpansion(menuKey)
  }

  /**
   * 切换副菜单显示状态
   */
  const toggleSubmenu = (menuKey?: string) => {
    menuStore.toggleSubmenu(menuKey)
  }

  /**
   * 关闭副菜单
   */
  const closeSubmenu = () => {
    menuStore.closeSubmenu()
  }

  // ===========================================
  // 标签页操作方法
  // ===========================================

  /**
   * 切换标签页
   */
  const switchTab = async (tabKey: string) => {
    const targetPath = menuStore.switchTab(tabKey)
    if (targetPath) {
      await router.push(targetPath)
    }
  }

  /**
   * 关闭标签页
   */
  const closeTab = async (tabKey: string) => {
    const newActivePath = menuStore.closeTab(tabKey)
    if (newActivePath) {
      await router.push(newActivePath)
    }
  }

  /**
   * 切换单个标签页模式
   */
  const toggleSingleTabMode = () => {
    menuStore.toggleSingleTabMode()
  }

  // ===========================================
  // 路由集成方法
  // ===========================================

  /**
   * 根据当前路由更新菜单状态
   */
  const updateMenuFromRoute = (currentPath: string) => {
    const success = menuStore.updateMenuStateByPath(currentPath)
    if (!success) {
      console.warn(`未找到路径对应的菜单项: ${currentPath}`)
    }
    return success
  }

  /**
   * 获取面包屑导航数据
   */
  const getBreadcrumbs = computed(() => {
    const breadcrumbs = []

    // 添加当前激活的菜单
    if (activeMenu.value) {
      breadcrumbs.push({
        title: activeMenu.value.title,
        key: activeMenu.value.key,
        icon: activeMenu.value.icon
      })
    }

    // 如果有激活的子菜单，添加子菜单
    if (activeSubMenu.value) {
      breadcrumbs.push({
        title: activeSubMenu.value.title,
        key: activeSubMenu.value.key,
        icon: activeSubMenu.value.icon
      })
    }

    return breadcrumbs
  })

  // ===========================================
  // 工具方法
  // ===========================================

  /**
   * 根据key查找菜单项
   */
  const findMenuByKey = (key: string): MenuItem | null => {
    return menuMap.value.get(key) || null
  }

  /**
   * 检查菜单是否可访问
   */
  const canAccessMenu = (menuItem: MenuItem): boolean => {
    return menuStore.filteredMenus.some((menu: MenuItem) => {
      if (menu.key === menuItem.key) return true
      if (menu.type === 'folder' && menu.children) {
        return menu.children.some((child: MenuItem) => child.key === menuItem.key)
      }
      return false
    })
  }

  /**
   * 获取菜单统计信息
   */
  const getMenuStats = computed(() => {
    let totalMenus = 0
    let pageMenus = 0
    let folderMenus = 0

    const countMenus = (menus: MenuItem[]) => {
      menus.forEach(menu => {
        totalMenus++
        if (menu.type === 'page') pageMenus++
        if (menu.type === 'folder') {
          folderMenus++
          if (menu.children) countMenus(menu.children)
        }
      })
    }

    countMenus(filteredMenus.value)

    return {
      total: totalMenus,
      pages: pageMenus,
      folders: folderMenus,
      expandedFolders: menuState.value.expandedMenuKeys.length,
      openTabs: menuState.value.openTabs.length
    }
  })

  // ===========================================
  // 生命周期和监听器
  // ===========================================

  // 监听路由变化，自动更新菜单状态
  watch(
    () => route.path,
    (newPath) => {
      updateMenuFromRoute(newPath)
    },
    { immediate: true }
  )

  // 组件挂载时初始化菜单
  onMounted(() => {
    menuStore.initializeMenu()
  })

  // ===========================================
  // 调试方法 (开发环境)
  // ===========================================

  const debugInfo = computed(() => ({
    currentPath: route.path,
    activeMenuKey: menuState.value.activeMenuKey,
    activeSubMenuKey: menuState.value.activeSubMenuKey,
    expandedMenus: menuState.value.expandedMenuKeys,
    showSubmenu: menuState.value.showSubmenu,
    tabsCount: menuState.value.openTabs.length,
    permissionSummary: permissionSummary.value,
    menuStats: getMenuStats.value
  }))

  // 开发环境下输出调试信息
  if (import.meta.env.DEV) {
    watch(
      debugInfo,
      (newDebugInfo) => {
        console.log('🍖 Menu Debug Info:', newDebugInfo)
      },
      { deep: true }
    )
  }

  // ===========================================
  // 返回公共API
  // ===========================================

  return {
    // 响应式状态
    menuState,
    loading,
    error,

    // 菜单数据
    filteredMenus,
    menuMap,
    activeMenu,
    activeSubMenu,
    submenuTitle,
    currentSubmenuItems,
    shouldShowSubmenu,
    permissionSummary,

    // 菜单操作
    handleMenuClick,
    handleSubMenuClick,
    navigateToPage,
    toggleMenuExpansion,
    toggleSubmenu,
    closeSubmenu,

    // 标签页操作
    switchTab,
    closeTab,
    toggleSingleTabMode,

    // 路由集成
    updateMenuFromRoute,
    getBreadcrumbs,

    // 工具方法
    findMenuByKey,
    canAccessMenu,
    getMenuStats,

    // 调试信息 (开发环境)
    debugInfo: import.meta.env.DEV ? debugInfo : null
  }
}
