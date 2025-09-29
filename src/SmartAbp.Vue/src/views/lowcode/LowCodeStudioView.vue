<template>
  <div class="lowcode-studio">
    <!-- 全局加载遮罩 -->
    <div
      v-if="loadingStates.global"
      class="global-loading-overlay"
    >
      <el-icon class="loading-icon">
        <Loading />
      </el-icon>
      <span>加载中...</span>
    </div>

    <!-- 主内容区 -->
    <div>
      <!-- 顶部导航 -->
      <StudioHeader
        :workspace="currentWorkspace"
        :active-module="activeModule"
        @module-change="handleModuleChange"
        @open-template-manager="openTemplateManager"
      />

      <!-- 侧边菜单 -->
      <StudioSidebar
        v-model:collapsed="menuCollapsed"
        :menu-items="dynamicMenuItems"
      />

      <!-- 工作区容器 -->
      <div class="studio-workspace">
        <!-- 路由过渡动画 -->
        <router-view v-slot="{ Component, route }">
          <Transition
            :name="(route.meta.transition as string) || 'fade'"
            mode="out-in"
          >
            <!-- 每个路由组件 -->
            <KeepAlive :include="cachedViews">
              <Suspense>
                <template #default>
                  <component :is="Component" />
                </template>
                <template #fallback>
                  <ModuleLoadingState :module="activeModule" />
                </template>
              </Suspense>
            </KeepAlive>
          </Transition>
        </router-view>
      </div>

      <!-- 属性面板 -->
      <StudioPropertyPanel
        v-if="showPropertyPanel"
        :context="propertyContext"
      />
    </div>

    <!-- 底部状态栏 -->
    <StudioFooter
      :logs="recentLogs"
      :validation-status="validationStatus"
      @clear-logs="clearLogs"
    />

    <!-- Template Manager Dialog -->
    <el-dialog
      v-model="templateManagerVisible"
      title="Template Marketplace"
      width="80%"
      top="5vh"
      destroy-on-close
    >
      <TemplateManager />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/stores/modules/workspace'
import StudioHeader from '@/components/layout/StudioHeader.vue'
import StudioSidebar from '@/components/layout/StudioSidebar.vue'
import StudioPropertyPanel from '@/components/layout/StudioPropertyPanel.vue'
import StudioFooter from '@/components/layout/StudioFooter.vue'
import ModuleLoadingState from '@/components/common/ModuleLoadingState.vue'
import TemplateManager from './templates/TemplateManager.vue'
import { Loading } from '@element-plus/icons-vue'

const workspaceStore = useWorkspaceStore()
const {
  currentWorkspace,
  menuCollapsed,
  activeModule,
  loadingStates,
  showPropertyPanel
} = storeToRefs(workspaceStore)

// --- Template Manager State ---
const templateManagerVisible = ref(false);
const openTemplateManager = () => {
  templateManagerVisible.value = true;
};

// --- Mock Data (to be replaced with real logic) ---
const dynamicMenuItems = computed(() => [])
const propertyContext = computed(() => ({}))
const recentLogs = computed(() => [])
const validationStatus = computed(() => 'success')
const clearLogs = () => {}
const handleModuleChange = (module: 'modeling' | 'design' | 'theme' | 'generate') => {
  workspaceStore.switchModule(module)
}


// 缓存策略
const cachedViews = computed(() => {
  return ['EntityModelingView', 'DesignView', 'ThemeCustomizationView']
})
</script>

<style scoped>
.lowcode-studio {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.studio-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.studio-workspace {
  flex: 1;
  overflow-y: auto;
  position: relative; /* For transitions */
}

/* Transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 全局加载遮罩样式 */
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  color: white;
}

.global-loading-overlay .loading-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
