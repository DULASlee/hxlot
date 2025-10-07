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
    <div class="studio-body">
      <!-- 顶部导航 -->
      <StudioHeader
        :workspace="currentWorkspace"
        :active-module="activeModule"
        @module-change="handleModuleChange"
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
            <KeepAlive :include="cachedViews">
              <Suspense>
                <template #default>
                  <component :is="Component" />
                </template>
                <template #fallback>
                  <div class="simple-loading">
                    <el-icon class="loading-icon">
                      <Loading />
                    </el-icon>
                    <span>加载模块中...</span>
                  </div>
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
    <div class="studio-footer">
      <StudioFooter
        :logs="recentLogs"
        :validation-status="validationStatus"
        @clear-logs="clearLogs"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useStudioStore } from '@/stores/modules/studioStore'
import { Loading } from '@element-plus/icons-vue'
import StudioHeader from '@/components/layout/StudioHeader.vue'
import StudioSidebar from '@/components/layout/StudioSidebar.vue'
import StudioPropertyPanel from '@/components/layout/StudioPropertyPanel.vue'
import StudioFooter from '@/components/layout/StudioFooter.vue'

const studioStore = useStudioStore()
const {
  currentWorkspace,
  activeModule,
  loadingStates,
  showPropertyPanel,
  menuCollapsed
} = storeToRefs(studioStore)

// ✅ 假设数据（真实应从store获取）
const dynamicMenuItems = ref([])
const recentLogs = ref<any[]>([])
const validationStatus = ref({ status: 'ok' })

// ✅ 真实实现：属性面板上下文
const propertyContext = computed(() => ({
  selectedElement: null,
  properties: {}
}))

// ✅ 真实实现：模块切换处理
const handleModuleChange = (module: 'modeling' | 'design' | 'theme' | 'generate') => {
  studioStore.switchModule(module)
}

// ✅ 真实实现：日志清理
const clearLogs = () => {
  recentLogs.value = []
}

// ✅ 缓存策略
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
