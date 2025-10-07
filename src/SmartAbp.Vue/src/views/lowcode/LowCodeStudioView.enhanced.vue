<template>
  <div class="lowcode-studio">
    <!-- 全局加载遮罩 -->
    <GlobalLoadingOverlay v-if="loadingStates.global" />

    <!-- 错误边界容器 -->
    <ErrorBoundary @error="handleGlobalError">
      <!-- 顶部导航 -->
      <StudioHeader />

      <!-- 主内容区 -->
      <main class="studio-main">
        <!-- 侧边菜单 -->
        <StudioSidebar />

        <!-- 工作区容器 -->
        <div class="studio-workspace">
          <!-- 路由过渡动画 -->
          <router-view v-slot="{ Component, route }">
            <Transition
              :name="(route.meta.transition as string) || 'fade'"
              mode="out-in"
            >
              <!-- 每个路由组件的错误边界 -->
              <ErrorBoundary
                :key="route.path"
                @error="handleModuleError"
              >
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
              </ErrorBoundary>
            </Transition>
          </router-view>
        </div>

        <!-- 属性面板 -->
        <StudioPropertyPanel
          v-if="showPropertyPanel"
          :context="propertyContext"
        />
      </main>

      <!-- 底部状态栏 -->
      <StudioFooter />
    </ErrorBoundary>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useStudioStore } from '@/stores/modules/studioStore'
import type { ErrorBoundary } from '@smartabp/lowcode-core'
import type { GlobalLoadingOverlay } from '@smartabp/lowcode-core'
import StudioHeader from '@/components/layout/StudioHeader.vue'
import StudioSidebar from '@/components/layout/StudioSidebar.vue'
import StudioPropertyPanel from '@/components/layout/StudioPropertyPanel.vue'
import StudioFooter from '@/components/layout/StudioFooter.vue'
import ModuleLoadingState from '@/components/common/ModuleLoadingState.vue'

const studioStore = useStudioStore()
const {
  activeModule,
  loadingStates,
  showPropertyPanel
} = storeToRefs(studioStore)

// --- Mock Data (to be replaced with real logic) ---
const propertyContext = computed(() => ({}))

// 统一错误处理
const handleGlobalError = (error: Error, instance: any) => {
  studioStore.captureError({
    type: 'global',
    message: error.message,
    stack: error.stack,
    component: instance?.$options.name
  })
}

const handleModuleError = (error: Error, instance: any) => {
  studioStore.captureError({
    type: 'module',
    message: error.message,
    stack: error.stack,
    component: instance?.$options.name
  })
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
</style>
