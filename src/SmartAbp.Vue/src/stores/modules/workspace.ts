import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { logger } from '@/utils/logger'

// 工作区状态接口
export interface Workspace {
  id: string
  name: string
  description: string
  type: 'default' | 'enterprise' | 'team'
  settings: WorkspaceSettings
}

export interface WorkspaceSettings {
  theme: string
  language: string
  autoSave: boolean
  keepAlive: string[]
}

// 应用错误接口
export interface AppError {
  id: string
  type: 'global' | 'module' | 'component'
  level: 'error' | 'warning' | 'info'
  message: string
  stack?: string
  component?: string
  timestamp: Date
}

// 加载状态管理
export interface LoadingStates {
  global: boolean
  modules: Record<string, boolean>
  operations: Record<string, boolean>
}

/**
 * 🏗️ 统一工作区状态管理Store
 * 负责管理全局工作区状态、错误收集、加载状态等
 */
export const useWorkspaceStore = defineStore('workspace', () => {
  // ===== 核心状态 =====
  const currentWorkspace = ref<Workspace>({
    id: 'default',
    name: '企业工作空间',
    description: 'SmartAbp企业级低代码开发平台',
    type: 'enterprise',
    settings: {
      theme: 'light',
      language: 'zh-CN',
      autoSave: true,
      keepAlive: ['EntityModelingView', 'DesignView', 'ThemeCustomizationView']
    }
  })

  // 当前激活的模块
  const activeModule = ref<'modeling' | 'design' | 'theme' | 'generate' | 'workflows'>('modeling')
  
  // 菜单折叠状态
  const menuCollapsed = ref(false)
  
  // 属性面板显示状态
  const showPropertyPanel = ref(true)
  
  // 加载状态管理
  const loadingStates = reactive<LoadingStates>({
    global: false,
    modules: {},
    operations: {}
  })
  
  // 错误收集
  const errors = ref<AppError[]>([])
  
  // 全局提示消息
  const notifications = ref<any[]>([])

  // ===== 计算属性 =====
  const isGlobalLoading = computed(() => loadingStates.global)
  
  const hasActiveErrors = computed(() => 
    errors.value.filter(e => e.level === 'error').length > 0
  )
  
  const cachedViews = computed(() => currentWorkspace.value.settings.keepAlive)

  // ===== 操作方法 =====
  
  /**
   * 设置模块加载状态
   */
  const setModuleLoading = (module: string, state: boolean) => {
    loadingStates.modules[module] = state
    logger?.debug('模块加载状态更新', { module, state })
  }

  /**
   * 设置操作加载状态
   */
  const setOperationLoading = (operation: string, state: boolean) => {
    loadingStates.operations[operation] = state
    logger?.debug('操作加载状态更新', { operation, state })
  }

  /**
   * 设置全局加载状态
   */
  const setGlobalLoading = (state: boolean) => {
    loadingStates.global = state
    logger?.debug('全局加载状态更新', { state })
  }

  /**
   * 捕获应用错误
   */
  const captureError = (error: Omit<AppError, 'id' | 'timestamp'>) => {
    const appError: AppError = {
      ...error,
      id: `error-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date()
    }
    
    errors.value.push(appError)
    logger?.error('应用错误捕获', appError)
    
    // 保持错误数量在合理范围内
    if (errors.value.length > 100) {
      errors.value = errors.value.slice(-50)
    }
  }

  /**
   * 清除错误
   */
  const clearErrors = () => {
    errors.value = []
    logger?.info('错误列表已清除')
  }

  /**
   * 切换工作空间
   */
  const switchWorkspace = (workspaceId: string) => {
    // 这里可以扩展为从API获取工作空间数据
    logger?.info('切换工作空间', { workspaceId })
  }

  /**
   * 更新工作空间设置
   */
  const updateWorkspaceSettings = (settings: Partial<WorkspaceSettings>) => {
    Object.assign(currentWorkspace.value.settings, settings)
    logger?.info('工作空间设置已更新', settings)
  }

  /**
   * 切换当前模块
   */
  const switchModule = (module: typeof activeModule.value) => {
    const previousModule = activeModule.value
    activeModule.value = module
    logger?.info('模块切换', { from: previousModule, to: module })
  }

  /**
   * 添加通知
   */
  const addNotification = (notification: any) => {
    notifications.value.push({
      ...notification,
      id: `notification-${Date.now()}`,
      timestamp: new Date()
    })
  }

  /**
   * 移除通知
   */
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  // ===== 持久化状态 =====
  
  /**
   * 保存工作区状态到本地存储
   */
  const saveWorkspaceState = () => {
    try {
      const state = {
        currentWorkspace: currentWorkspace.value,
        activeModule: activeModule.value,
        menuCollapsed: menuCollapsed.value,
        showPropertyPanel: showPropertyPanel.value
      }
      localStorage.setItem('lowcode-workspace-state', JSON.stringify(state))
    } catch (error) {
      logger?.error('保存工作区状态失败', error)
    }
  }

  /**
   * 从本地存储恢复工作区状态
   */
  const restoreWorkspaceState = () => {
    try {
      const saved = localStorage.getItem('lowcode-workspace-state')
      if (saved) {
        const state = JSON.parse(saved)
        if (state.currentWorkspace) currentWorkspace.value = state.currentWorkspace
        if (state.activeModule) activeModule.value = state.activeModule
        if (typeof state.menuCollapsed === 'boolean') menuCollapsed.value = state.menuCollapsed
        if (typeof state.showPropertyPanel === 'boolean') showPropertyPanel.value = state.showPropertyPanel
      }
    } catch (error) {
      logger?.error('恢复工作区状态失败', error)
    }
  }

  return {
    // 状态
    currentWorkspace,
    activeModule,
    menuCollapsed,
    showPropertyPanel,
    loadingStates,
    errors,
    notifications,
    
    // 计算属性
    isGlobalLoading,
    hasActiveErrors,
    cachedViews,
    
    // 方法
    setModuleLoading,
    setOperationLoading,
    setGlobalLoading,
    captureError,
    clearErrors,
    switchWorkspace,
    updateWorkspaceSettings,
    switchModule,
    addNotification,
    removeNotification,
    saveWorkspaceState,
    restoreWorkspaceState
  }
})

export type WorkspaceStore = ReturnType<typeof useWorkspaceStore>
