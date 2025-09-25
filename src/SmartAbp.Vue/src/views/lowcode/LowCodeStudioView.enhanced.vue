<template>
  <WorkspaceContainer
    layout="both"
    :show-aside="true"
    :show-properties="showPropertyPanel"
    aside-title="导航"
    properties-title="属性"
    :aside-collapsible="true"
    :properties-collapsible="true"
    :show-global-loading="isGlobalLoading"
    @aside-toggle="handleAsideToggle"
    @properties-toggle="handlePropertiesToggle"
    @layout-change="handleLayoutChange"
  >
    <!-- 顶部工具栏 -->
    <template #toolbar>
      <StudioHeader
        :workspace="currentWorkspace"
        :active-module="activeModule"
        :progress="overallProgress"
        @module-change="handleModuleChange"
        @workspace-switch="handleWorkspaceSwitch"
        @show-help="showHelp"
        @show-settings="showSettings"
      />
    </template>

    <!-- 左侧导航面板 -->
    <template #aside>
      <StudioSidebar
        :menu-items="dynamicMenuItems"
        :active-item="activeModule"
        @menu-select="handleMenuSelect"
      />
    </template>

    <!-- 中央工作区内容 -->
    <template #default>
      <!-- 路由过渡容器 -->
      <div class="studio-workspace">
        <router-view v-slot="{ Component, route }">
          <Transition
            :name="getTransitionName(route)"
            mode="out-in"
            @enter="onTransitionEnter"
            @leave="onTransitionLeave"
          >
            <!-- 每个路由的错误边界 -->
            <ErrorBoundary
              :key="route.path"
              level="module"
              :show-reload="true"
              @error="handleModuleError"
              @retry="handleModuleRetry"
            >
              <!-- 路由组件缓存 -->
              <KeepAlive :include="cachedViews">
                <Suspense @resolve="onModuleLoaded" @fallback="onModuleLoading">
                  <template #default>
                    <component
                      :is="Component"
                      :workspace-context="workspaceContext"
                      @loading="handleModuleLoading"
                      @error="handleModuleError"
                    />
                  </template>
                  <template #fallback>
                    <ModuleLoadingState
                      :module="activeModule"
                      :message="loadingMessage"
                    />
                  </template>
                </Suspense>
              </KeepAlive>
            </ErrorBoundary>
          </Transition>
        </router-view>
      </div>
    </template>

    <!-- 右侧属性面板 -->
    <template #properties>
      <StudioPropertyPanel
        v-if="showPropertyPanel"
        :context="propertyContext"
        :selected-entity="selectedEntity"
        :selected-component="selectedComponent"
        @property-change="handlePropertyChange"
        @validation-error="handleValidationError"
      />
    </template>

    <!-- 底部状态栏 -->
    <template #statusbar>
      <StudioFooter
        :logs="recentLogs"
        :validation-status="validationStatus"
        :statistics="workspaceStatistics"
        @clear-logs="clearLogs"
        @export-logs="exportLogs"
        @show-validation-details="showValidationDetails"
      />
    </template>
  </WorkspaceContainer>

  <!-- 全局对话框和通知 -->
  <NotificationCenter
    :notifications="notifications"
    @dismiss="dismissNotification"
  />

  <!-- 项目向导对话框 -->
  <el-dialog
    v-model="showProjectWizard"
    title="新建项目"
    width="600px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <ProjectWizard
      @project-created="handleProjectCreated"
      @cancel="showProjectWizard = false"
    />
  </el-dialog>

  <!-- 设置面板 -->
  <el-drawer
    v-model="showSettingsDrawer"
    title="工作区设置"
    size="400px"
    direction="rtl"
  >
    <WorkspaceSettings
      :settings="currentWorkspace.settings"
      @update="handleSettingsUpdate"
    />
  </el-drawer>

  <!-- 帮助中心 -->
  <el-drawer
    v-model="showHelpDrawer"
    title="帮助中心"
    size="500px"
    direction="rtl"
  >
    <HelpCenter
      :current-module="activeModule"
      @navigate="handleHelpNavigate"
    />
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'

// 组件导入
import WorkspaceContainer from '@/components/layout/WorkspaceContainer.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import StudioHeader from '@/components/lowcode/StudioHeader.vue'
import StudioSidebar from '@/components/lowcode/StudioSidebar.vue'
import StudioPropertyPanel from '@/components/lowcode/StudioPropertyPanel.vue'
import StudioFooter from '@/components/lowcode/StudioFooter.vue'
import ModuleLoadingState from '@/components/lowcode/ModuleLoadingState.vue'
import NotificationCenter from '@/components/common/NotificationCenter.vue'
import ProjectWizard from '@/components/lowcode/ProjectWizard.vue'
import WorkspaceSettings from '@/components/lowcode/WorkspaceSettings.vue'
import HelpCenter from '@/components/lowcode/HelpCenter.vue'

// Stores 和 Composables
import { useWorkspaceStore } from '@/stores/modules/workspace'
import { useEntityModelingStore } from '@smartabp/lowcode-core'
import { usePageDesignStore, useCodeGenerationStore } from '@smartabp/lowcode-core'
import { useEventBus, useEventSubscription } from '@/utils/eventBus'
import { useSmartWorkflow } from '@/composables/useSmartWorkflow'
import { logger } from '@/utils/logger'

// 路由
const route = useRoute()
const router = useRouter()

// Stores
const workspaceStore = useWorkspaceStore()
const entityStore = useEntityModelingStore()
const pageStore = usePageDesignStore()
const codeGenStore = useCodeGenerationStore()

// Store 响应式状态
const {
  currentWorkspace,
  activeModule,
  showPropertyPanel,
  isGlobalLoading,
  cachedViews,
  notifications
} = storeToRefs(workspaceStore)

// 事件总线
const { emit: emitEvent } = useEventBus()
const { subscribe, cleanup: cleanupEvents } = useEventSubscription('LowCodeStudioView')

// 智能工作流
const {
  totalWorkflowProgress,
  nextStepSuggestion,
  initializeWorkflow
} = useSmartWorkflow()

// ===== 本地状态 =====
const showProjectWizard = ref(false)
const showSettingsDrawer = ref(false)
const showHelpDrawer = ref(false)
const loadingMessage = ref('')
const selectedEntity = ref(null)
const selectedComponent = ref(null)
const propertyContext = ref({})
const validationStatus = ref({
  hasErrors: false,
  errorCount: 0,
  warningCount: 0
})

// ===== 计算属性 =====
const dynamicMenuItems = computed(() => [
  {
    key: 'modeling',
    title: '实体建模',
    icon: 'DataBoard',
    path: '/lowcode/entity-modeling',
    badge: entityStore.entities.length > 0 ? entityStore.entities.length : undefined
  },
  {
    key: 'design',
    title: '页面设计',
    icon: 'Brush',
    path: '/lowcode/design',
    badge: pageStore.pages.length > 0 ? pageStore.pages.length : undefined
  },
  {
    key: 'theme',
    title: '主题定制',
    icon: 'PictureRounded',
    path: '/lowcode/theme',
    badge: 'NEW'
  },
  {
    key: 'generate',
    title: '代码生成',
    icon: 'Cpu',
    path: '/lowcode/generation',
    disabled: entityStore.entities.length === 0
  },
  {
    key: 'workflows',
    title: '工作流',
    icon: 'Share',
    path: '/lowcode/workflows'
  }
])

const overallProgress = computed(() => {
  let progress = 0
  if (entityStore.entities.length > 0) progress += 25
  if (pageStore.pages.length > 0) progress += 25
  if (codeGenStore.generationHistory.length > 0) progress += 50
  return progress
})

const workspaceContext = computed(() => ({
  workspace: currentWorkspace.value,
  activeModule: activeModule.value,
  progress: overallProgress.value,
  stats: workspaceStatistics.value
}))

const workspaceStatistics = computed(() => ({
  entityCount: entityStore.entities.length,
  pageCount: pageStore.pages.length,
  generatedFileCount: codeGenStore.generationHistory.length > 0 ?
    codeGenStore.generationHistory[0].fileCount : 0,
  lastActivity: new Date().toISOString()
}))

const recentLogs = computed(() => {
  // 从logger获取最近的日志
  return []
})

// ===== 事件处理 =====
const handleModuleChange = (module: string) => {
  const previousModule = activeModule.value
  workspaceStore.switchModule(module as any)

  // 发布模块变化事件
  emitEvent('workspace:module-change', {
    from: previousModule,
    to: module,
    timestamp: Date.now()
  })

  // 路由跳转
  const menuItem = dynamicMenuItems.value.find(item => item.key === module)
  if (menuItem && !menuItem.disabled) {
    router.push(menuItem.path)
  }

  logger?.info('模块切换', { from: previousModule, to: module })
}

const handleWorkspaceSwitch = (workspaceId: string) => {
  workspaceStore.switchWorkspace(workspaceId)
  ElMessage.success(`已切换到工作空间: ${workspaceId}`)
}

const handleAsideToggle = (collapsed: boolean) => {
  emitEvent('ui:sidebar-toggle', {
    collapsed,
    source: 'user'
  })
}

const handlePropertiesToggle = (collapsed: boolean) => {
  workspaceStore.showPropertyPanel = !collapsed
}

const handleLayoutChange = (layout: string) => {
  emitEvent('workspace:layout-change', {
    layout: layout as any,
    reason: 'user_selection'
  })
}

const handleMenuSelect = (menuKey: string) => {
  handleModuleChange(menuKey)
}

const handleModuleError = (error: Error, instance: any, info: string) => {
  logger?.error('模块错误', { error: error.message, module: activeModule.value, info })

  emitEvent('system:error', {
    error,
    component: activeModule.value,
    level: 'error',
    context: { info, instance }
  })

  ElMessage.error(`模块 "${activeModule.value}" 发生错误: ${error.message}`)
}

const handleModuleRetry = () => {
  logger?.info('模块重试', { module: activeModule.value })
  window.location.reload()
}

const handleModuleLoading = (isLoading: boolean, operation?: string) => {
  workspaceStore.setModuleLoading(activeModule.value, isLoading)

  if (isLoading && operation) {
    loadingMessage.value = operation
  }
}

const handlePropertyChange = (property: string, value: any) => {
  logger?.debug('属性变更', { property, value, module: activeModule.value })
}

const handleValidationError = (errors: any[]) => {
  validationStatus.value = {
    hasErrors: errors.length > 0,
    errorCount: errors.filter(e => e.level === 'error').length,
    warningCount: errors.filter(e => e.level === 'warning').length
  }
}

const handleProjectCreated = (project: any) => {
  showProjectWizard.value = false
  router.push('/lowcode/entity-modeling')

  emitEvent('system:notification', {
    type: 'success',
    title: '项目创建成功',
    message: `项目 "${project.name}" 已创建`,
    duration: 3000
  })
}

const handleSettingsUpdate = (settings: any) => {
  workspaceStore.updateWorkspaceSettings(settings)

  emitEvent('workspace:settings-update', {
    settings,
    source: 'user'
  })
}

// ===== 其他方法 =====
const showHelp = () => {
  showHelpDrawer.value = true
}

const showSettings = () => {
  showSettingsDrawer.value = true
}

const getTransitionName = (route: any) => {
  return route.meta?.transition || 'fade'
}

const onTransitionEnter = () => {
  logger?.debug('页面转场进入', { module: activeModule.value })
}

const onTransitionLeave = () => {
  logger?.debug('页面转场离开', { module: activeModule.value })
}

const onModuleLoaded = () => {
  workspaceStore.setModuleLoading(activeModule.value, false)
  logger?.info('模块加载完成', { module: activeModule.value })
}

const onModuleLoading = () => {
  workspaceStore.setModuleLoading(activeModule.value, true)
  logger?.info('模块加载中', { module: activeModule.value })
}

const clearLogs = () => {
  logger?.info('清除日志')
}

const exportLogs = () => {
  logger?.info('导出日志')
}

const showValidationDetails = () => {
  logger?.info('显示验证详情')
}

const dismissNotification = (id: string) => {
  workspaceStore.removeNotification(id)
}

const handleHelpNavigate = (section: string) => {
  logger?.info('帮助导航', { section })
}

// ===== 生命周期 =====
onMounted(() => {
  logger?.info('LowCode Studio 启动', { route: route.path })

  // 恢复工作区状态
  workspaceStore.restoreWorkspaceState()

  // 根据当前路由设置步骤
  const pathModuleMap: Record<string, any> = {
    'entity-modeling': 'modeling',
    'design': 'design',
    'theme': 'theme',
    'generation': 'generate',
    'workflows': 'workflows'
  }

  for (const [path, module] of Object.entries(pathModuleMap)) {
    if (route.path.includes(path)) {
      workspaceStore.switchModule(module)
      break
    }
  }

  // 初始化工作流
  initializeWorkflow()

  // 订阅关键事件
  subscribe('entity:created', (data) => {
    logger?.info('实体创建事件', data)
  })

  subscribe('page:created', (data) => {
    logger?.info('页面创建事件', data)
  })

  subscribe('codegen:completed', (data) => {
    logger?.info('代码生成完成', data)
  })
})

// 监听路由变化
watch(() => route.path, (newPath) => {
  // 根据路由自动切换模块
  const pathModuleMap: Record<string, any> = {
    'entity-modeling': 'modeling',
    'design': 'design',
    'theme': 'theme',
    'generation': 'generate',
    'workflows': 'workflows'
  }

  for (const [path, module] of Object.entries(pathModuleMap)) {
    if (newPath.includes(path) && activeModule.value !== module) {
      workspaceStore.switchModule(module)
      break
    }
  }
})

// 清理资源
onUnmounted(() => {
  cleanupEvents()
  workspaceStore.saveWorkspaceState()
  logger?.info('LowCode Studio 卸载')
})
</script>

<style scoped>
.studio-workspace {
  height: 100%;
  overflow: hidden;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
