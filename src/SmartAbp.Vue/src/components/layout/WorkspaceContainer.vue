<template>
  <div
    class="workspace-container"
    :class="containerClasses"
  >
    <!-- 全局加载遮罩 -->
    <GlobalLoadingOverlay v-if="showGlobalLoading" />

    <!-- 工具栏区域 -->
    <header
      v-if="$slots.toolbar"
      class="workspace-toolbar"
    >
      <slot name="toolbar" />
    </header>

    <!-- 主体内容区域 -->
    <div class="workspace-body">
      <!-- 左侧面板 -->
      <aside
        v-if="$slots.aside || showAside"
        class="workspace-aside"
        :style="asideStyle"
        :class="{ 'collapsed': asideCollapsed }"
      >
        <div
          v-if="asideTitle"
          class="aside-header"
        >
          <h3 class="aside-title">
            {{ asideTitle }}
          </h3>
          <el-button
            v-if="asideCollapsible"
            text
            class="aside-toggle"
            @click="toggleAside"
          >
            <el-icon>
              <ArrowLeft v-if="!asideCollapsed" />
              <ArrowRight v-else />
            </el-icon>
          </el-button>
        </div>

        <div class="aside-content">
          <slot name="aside" />
        </div>
      </aside>

      <!-- 中央内容区 -->
      <main
        class="workspace-content"
        :style="contentStyle"
      >
        <div
          v-if="$slots.header"
          class="content-header"
        >
          <slot name="header" />
        </div>

        <div class="content-body">
          <slot />
        </div>

        <div
          v-if="$slots.footer"
          class="content-footer"
        >
          <slot name="footer" />
        </div>
      </main>

      <!-- 右侧属性面板 -->
      <aside
        v-if="$slots.properties || showProperties"
        class="workspace-properties"
        :style="propertiesStyle"
        :class="{ 'collapsed': propertiesCollapsed }"
      >
        <div
          v-if="propertiesTitle"
          class="properties-header"
        >
          <h3 class="properties-title">
            {{ propertiesTitle }}
          </h3>
          <el-button
            v-if="propertiesCollapsible"
            text
            class="properties-toggle"
            @click="toggleProperties"
          >
            <el-icon>
              <ArrowRight v-if="!propertiesCollapsed" />
              <ArrowLeft v-else />
            </el-icon>
          </el-button>
        </div>

        <div class="properties-content">
          <slot name="properties" />
        </div>
      </aside>
    </div>

    <!-- 底部状态栏 -->
    <footer
      v-if="$slots.statusbar"
      class="workspace-statusbar"
    >
      <slot name="statusbar" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { useWorkspaceStore } from '@/stores/modules/workspace'
// import { storeToRefs } from 'pinia'
import GlobalLoadingOverlay from '@/components/common/GlobalLoadingOverlay.vue'

interface Props {
  /**
   * 布局模式
   */
  layout?: 'default' | 'full' | 'sidebar' | 'properties' | 'both'

  /**
   * 左侧面板宽度
   */
  asideWidth?: string

  /**
   * 右侧面板宽度
   */
  propertiesWidth?: string

  /**
   * 是否显示左侧面板
   */
  showAside?: boolean

  /**
   * 是否显示右侧面板
   */
  showProperties?: boolean

  /**
   * 左侧面板标题
   */
  asideTitle?: string

  /**
   * 右侧面板标题
   */
  propertiesTitle?: string

  /**
   * 左侧面板是否可折叠
   */
  asideCollapsible?: boolean

  /**
   * 右侧面板是否可折叠
   */
  propertiesCollapsible?: boolean

  /**
   * 响应式断点
   */
  breakpoint?: number

  /**
   * 是否显示全局加载
   */
  showGlobalLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'default',
  asideWidth: '280px',
  propertiesWidth: '320px',
  showAside: false,
  showProperties: false,
  asideTitle: '',
  propertiesTitle: '',
  asideCollapsible: true,
  propertiesCollapsible: true,
  breakpoint: 768,
  showGlobalLoading: false
})

const emit = defineEmits<{
  'aside-toggle': [collapsed: boolean]
  'properties-toggle': [collapsed: boolean]
  'layout-change': [layout: string]
}>()

// Store
const workspaceStore = useWorkspaceStore()
// const { isGlobalLoading } = storeToRefs(workspaceStore)

// 本地状态
const asideCollapsed = ref(false)
const propertiesCollapsed = ref(false)

// 计算属性
const containerClasses = computed(() => [
  `layout-${props.layout}`,
  {
    'aside-visible': props.showAside && !asideCollapsed.value,
    'properties-visible': props.showProperties && !propertiesCollapsed.value,
    'aside-collapsed': asideCollapsed.value,
    'properties-collapsed': propertiesCollapsed.value,
    'mobile': window.innerWidth <= props.breakpoint
  }
])

const asideStyle = computed(() => ({
  width: asideCollapsed.value ? '60px' : props.asideWidth,
  minWidth: asideCollapsed.value ? '60px' : '200px'
}))

const propertiesStyle = computed(() => ({
  width: propertiesCollapsed.value ? '60px' : props.propertiesWidth,
  minWidth: propertiesCollapsed.value ? '60px' : '250px'
}))

const contentStyle = computed(() => {
  let marginLeft = '0'
  let marginRight = '0'

  if (props.showAside && !asideCollapsed.value) {
    marginLeft = props.asideWidth
  } else if (props.showAside && asideCollapsed.value) {
    marginLeft = '60px'
  }

  if (props.showProperties && !propertiesCollapsed.value) {
    marginRight = props.propertiesWidth
  } else if (props.showProperties && propertiesCollapsed.value) {
    marginRight = '60px'
  }

  return {
    marginLeft,
    marginRight
  }
})

// 方法
const toggleAside = () => {
  asideCollapsed.value = !asideCollapsed.value
  emit('aside-toggle', asideCollapsed.value)
}

const toggleProperties = () => {
  propertiesCollapsed.value = !propertiesCollapsed.value
  emit('properties-toggle', propertiesCollapsed.value)
}

// 监听布局变化
watch(() => props.layout, (newLayout) => {
  emit('layout-change', newLayout)
})

// 响应式处理
const handleResize = () => {
  const isMobile = window.innerWidth <= props.breakpoint
  if (isMobile) {
    asideCollapsed.value = true
    propertiesCollapsed.value = true
  }
}

// 添加窗口大小监听
window.addEventListener('resize', handleResize)
</script>

<style scoped>
.workspace-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  position: relative;
  background: var(--el-bg-color-page);
  overflow: hidden;
}

/* 工具栏 */
.workspace-toolbar {
  flex-shrink: 0;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
  z-index: 100;
}

/* 主体区域 */
.workspace-body {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

/* 左侧面板 */
.workspace-aside {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  z-index: 90;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.workspace-container:has(.workspace-toolbar) .workspace-aside {
  top: var(--toolbar-height, 60px);
}

.workspace-container:has(.workspace-statusbar) .workspace-aside {
  bottom: var(--statusbar-height, 40px);
}

.aside-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}

.aside-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.aside-toggle {
  padding: 4px;
  min-height: auto;
}

.aside-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.workspace-aside.collapsed .aside-header {
  padding: 8px;
  justify-content: center;
}

.workspace-aside.collapsed .aside-title {
  display: none;
}

/* 中央内容区 */
.workspace-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--el-bg-color-page);
  transition: margin 0.3s ease;
}

.content-header {
  flex-shrink: 0;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
}

.content-body {
  flex: 1;
  overflow: auto;
  position: relative;
}

.content-footer {
  flex-shrink: 0;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
}

/* 右侧属性面板 */
.workspace-properties {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  background: var(--el-bg-color);
  border-left: 1px solid var(--el-border-color-light);
  z-index: 90;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.workspace-container:has(.workspace-toolbar) .workspace-properties {
  top: var(--toolbar-height, 60px);
}

.workspace-container:has(.workspace-statusbar) .workspace-properties {
  bottom: var(--statusbar-height, 40px);
}

.properties-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}

.properties-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.properties-toggle {
  padding: 4px;
  min-height: auto;
}

.properties-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.workspace-properties.collapsed .properties-header {
  padding: 8px;
  justify-content: center;
}

.workspace-properties.collapsed .properties-title {
  display: none;
}

/* 底部状态栏 */
.workspace-statusbar {
  flex-shrink: 0;
  border-top: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
  z-index: 100;
}

/* 布局模式样式 */
.layout-full .workspace-aside,
.layout-full .workspace-properties {
  display: none;
}

.layout-sidebar .workspace-properties {
  display: none;
}

.layout-properties .workspace-aside {
  display: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .workspace-aside,
  .workspace-properties {
    transform: translateX(-100%);
  }

  .workspace-aside.collapsed {
    transform: translateX(-100%);
  }

  .workspace-properties.collapsed {
    transform: translateX(100%);
  }

  .workspace-content {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}

/* 动画效果 */
.workspace-aside,
.workspace-properties,
.workspace-content {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 滚动条样式 */
.aside-content::-webkit-scrollbar,
.properties-content::-webkit-scrollbar,
.content-body::-webkit-scrollbar {
  width: 6px;
}

.aside-content::-webkit-scrollbar-track,
.properties-content::-webkit-scrollbar-track,
.content-body::-webkit-scrollbar-track {
  background: var(--el-bg-color-page);
}

.aside-content::-webkit-scrollbar-thumb,
.properties-content::-webkit-scrollbar-thumb,
.content-body::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 3px;
}

.aside-content::-webkit-scrollbar-thumb:hover,
.properties-content::-webkit-scrollbar-thumb:hover,
.content-body::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-dark);
}
</style>
