import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

// 定义错误对象类型
export interface AppError {
  type: 'global' | 'module' | 'component';
  message: string;
  stack?: string;
  component?: string;
  timestamp?: Date;
}

// 定义工作区类型 (占位符)
export interface Workspace {
  id: string;
  name: string;
}

export const useWorkspaceStore = defineStore('workspace', () => {
  // 全局工作区状态
  const currentWorkspace = ref<Workspace | null>(null)
  const menuCollapsed = ref(false)
  const activeModule = ref<'modeling' | 'design' | 'theme' | 'generate'>('modeling')
  const showPropertyPanel = ref(true)

  // 统一的加载状态管理
  const loadingStates = reactive({
    global: false,
    modules: {} as Record<string, boolean>
  })

  // 错误收集
  const errors = ref<AppError[]>([])

  // Actions
  function setLoading(module: string, state: boolean) {
    loadingStates.modules[module] = state
  }

  function setGlobalLoading(state: boolean) {
    loadingStates.global = state
  }

  function captureError(error: Omit<AppError, 'timestamp'>) {
    errors.value.push({
      ...error,
      timestamp: new Date()
    })
  }

  function switchModule(module: 'modeling' | 'design' | 'theme' | 'generate') {
    activeModule.value = module
  }

  function toggleMenu() {
    menuCollapsed.value = !menuCollapsed.value
  }
  
  function togglePropertyPanel() {
    showPropertyPanel.value = !showPropertyPanel.value
  }

  return {
    // State
    currentWorkspace,
    menuCollapsed,
    activeModule,
    loadingStates,
    errors,
    showPropertyPanel,

    // Actions
    setLoading,
    setGlobalLoading,
    captureError,
    switchModule,
    toggleMenu,
    togglePropertyPanel,
  }
})
