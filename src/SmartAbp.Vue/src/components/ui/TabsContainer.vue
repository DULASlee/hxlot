<!--
  Tabs标签页界面容器
  支持动态标签、拖拽排序、多层标签等企业级功能
-->
<template>
  <div
    class="tabs-container"
    :class="`theme-${theme}`"
  >
    <!-- 标签栏 -->
    <div class="tabs-header">
      <div
        ref="tabsNavRef"
        class="tabs-nav"
      >
        <!-- 标签导航区域 -->
        <div
          class="tabs-nav-scroll"
          :style="navScrollStyle"
        >
          <div
            v-for="(tab, index) in visibleTabs"
            :key="tab.id"
            class="tab-item"
            :class="{
              'tab-active': activeTabId === tab.id,
              'tab-closable': tab.closable,
              'tab-pinned': tab.pinned,
              'tab-loading': tab.loading,
              'tab-has-changes': tab.hasChanges
            }"
            :style="getTabStyle(tab, index)"
            :draggable="false"
            @click="activateTab(tab.id)"
            @mousedown="startTabDrag($event, tab, index)"
            @contextmenu="showTabContextMenu($event, tab)"
          >
            <!-- 标签图标 -->
            <div
              v-if="tab.icon || tab.loading"
              class="tab-icon"
            >
              <el-icon
                v-if="tab.loading"
                class="is-loading"
              >
                <Loading />
              </el-icon>
              <i
                v-else
                :class="tab.icon"
              />
            </div>
            
            <!-- 标签标题 -->
            <div
              class="tab-title"
              :title="tab.title"
            >
              {{ tab.title }}
              <span
                v-if="tab.hasChanges"
                class="changes-indicator"
              >*</span>
            </div>
            
            <!-- 关闭按钮 -->
            <div 
              v-if="tab.closable"
              class="tab-close"
              @click.stop="closeTab(tab.id)"
            >
              <el-icon><Close /></el-icon>
            </div>
            
            <!-- 固定图钉 -->
            <div
              v-if="tab.pinned"
              class="tab-pin"
            >
              <i class="el-icon-thumb-tack" />
            </div>
          </div>
          
          <!-- 添加新标签按钮 -->
          <div
            v-if="showAddButton"
            class="tab-add-button"
            @click="$emit('add-tab')"
          >
            <el-icon><Plus /></el-icon>
          </div>
        </div>
        
        <!-- 标签导航控制 -->
        <div
          v-if="showNavControls"
          class="tabs-nav-controls"
        >
          <el-button
            text
            size="small"
            :disabled="!canScrollLeft"
            @click="scrollTabs('left')"
          >
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <el-button
            text
            size="small"
            :disabled="!canScrollRight"
            @click="scrollTabs('right')"
          >
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          
          <!-- 标签管理下拉菜单 -->
          <el-dropdown
            trigger="click"
            placement="bottom-end"
          >
            <el-button
              text
              size="small"
            >
              <el-icon><More /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="closeAllTabs">
                  <el-icon><Close /></el-icon> 关闭所有标签
                </el-dropdown-item>
                <el-dropdown-item @click="closeOtherTabs">
                  <el-icon><Remove /></el-icon> 关闭其他标签
                </el-dropdown-item>
                <el-dropdown-item @click="closeTabsToRight">
                  <el-icon><Right /></el-icon> 关闭右侧标签
                </el-dropdown-item>
                <el-dropdown-item
                  divided
                  @click="showTabsList"
                >
                  <el-icon><List /></el-icon> 显示所有标签
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 标签操作栏 -->
      <div
        v-if="$slots.actions"
        class="tabs-actions"
      >
        <slot name="actions" />
      </div>
    </div>
    
    <!-- 标签内容区域 -->
    <div class="tabs-content">
      <div
        v-for="tab in tabs"
        v-show="activeTabId === tab.id || keepAlive"
        :key="tab.id"
        class="tab-pane"
        :class="{ 'tab-pane-active': activeTabId === tab.id }"
      >
        <keep-alive v-if="keepAlive">
          <component 
            :is="tab.component"
            v-bind="tab.props"
            @tab-title-change="updateTabTitle(tab.id, $event)"
            @tab-icon-change="updateTabIcon(tab.id, $event)"
            @tab-loading-change="updateTabLoading(tab.id, $event)"
            @tab-changes-change="updateTabChanges(tab.id, $event)"
          />
        </keep-alive>
        <component 
          :is="tab.component"
          v-else
          v-bind="tab.props"
          @tab-title-change="updateTabTitle(tab.id, $event)"
          @tab-icon-change="updateTabIcon(tab.id, $event)"
          @tab-loading-change="updateTabLoading(tab.id, $event)"
          @tab-changes-change="updateTabChanges(tab.id, $event)"
        />
      </div>
    </div>
    
    <!-- 标签拖拽指示器 -->
    <div
      v-if="dragState.dragging"
      class="tab-drag-indicator"
      :style="dragIndicatorStyle"
    />
    
    <!-- 右键菜单 -->
    <el-dropdown
      ref="contextMenuRef"
      :visible="contextMenuVisible"
      placement="bottom-start"
      trigger="contextmenu"
      @visible-change="contextMenuVisible = $event"
    >
      <div
        class="context-menu-trigger"
        :style="contextMenuStyle"
      />
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="closeTab(contextTab?.id)">
            <el-icon><Close /></el-icon> 关闭标签
          </el-dropdown-item>
          <el-dropdown-item 
            :disabled="tabs.length <= 1"
            @click="closeOtherTabs(contextTab?.id)"
          >
            <el-icon><Remove /></el-icon> 关闭其他标签
          </el-dropdown-item>
          <el-dropdown-item 
            @click="closeTabsToRight(contextTab?.id)"
          >
            <el-icon><Right /></el-icon> 关闭右侧标签
          </el-dropdown-item>
          <el-dropdown-item
            divided
            @click="pinTab(contextTab?.id)"
          >
            <i class="el-icon-thumb-tack" /> {{ contextTab?.pinned ? '取消固定' : '固定标签' }}
          </el-dropdown-item>
          <el-dropdown-item @click="duplicateTab(contextTab?.id)">
            <el-icon><CopyDocument /></el-icon> 复制标签
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    
    <!-- 所有标签列表对话框 -->
    <el-dialog
      v-model="showAllTabsDialog"
      title="所有标签"
      width="400px"
      :show-close="true"
    >
      <div class="all-tabs-list">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="all-tabs-item"
          :class="{ active: activeTabId === tab.id }"
          @click="activateTab(tab.id); showAllTabsDialog = false"
        >
          <div class="all-tabs-icon">
            <i :class="tab.icon || 'el-icon-document'" />
          </div>
          <div class="all-tabs-info">
            <div class="all-tabs-title">
              {{ tab.title }}
            </div>
            <div
              v-if="tab.path"
              class="all-tabs-path"
            >
              {{ tab.path }}
            </div>
          </div>
          <div class="all-tabs-actions">
            <el-button
              text
              size="small"
              @click.stop="closeTab(tab.id)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  Close, Plus, ArrowLeft, ArrowRight, More, Remove, Right, 
  List, CopyDocument, Loading 
} from '@element-plus/icons-vue'
import type { TabConfig } from '@/types/unified-metadata'

// Props
interface Props {
  tabs: TabConfig[]
  activeTabId?: string
  theme?: 'light' | 'dark'
  keepAlive?: boolean
  showAddButton?: boolean
  maxTabs?: number
  tabWidth?: 'auto' | 'fixed' | 'compact'
  scrollable?: boolean
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light',
  keepAlive: false,
  showAddButton: true,
  maxTabs: 20,
  tabWidth: 'auto',
  scrollable: true,
  closable: true
})

// Emits
const emit = defineEmits<{
  'tab-activated': [tabId: string]
  'tab-closed': [tabId: string]
  'tab-moved': [fromIndex: number, toIndex: number]
  'tab-pinned': [tabId: string, pinned: boolean]
  'tab-duplicated': [tabId: string]
  'add-tab': []
  'tab-title-changed': [tabId: string, title: string]
  'tab-icon-changed': [tabId: string, icon: string]
  'tab-loading-changed': [tabId: string, loading: boolean]
  'tab-changes-changed': [tabId: string, hasChanges: boolean]
}>()

// 响应式数据
const tabsNavRef = ref<HTMLElement>()
const contextMenuRef = ref()
const contextMenuVisible = ref(false)
const contextMenuStyle = ref({ left: '0px', top: '0px' })
const contextTab = ref<TabConfig>()
const showAllTabsDialog = ref(false)

// 滚动相关
const scrollLeft = ref(0)
const navWidth = ref(0)
const tabsWidth = ref(0)

// 拖拽相关
const dragState = ref({
  dragging: false,
  dragTabId: '',
  dragIndex: -1,
  startX: 0,
  currentX: 0,
  insertIndex: -1
})

// 计算属性
const visibleTabs = computed(() => {
  // 固定标签始终显示在前面
  const pinnedTabs = props.tabs.filter(tab => tab.pinned)
  const normalTabs = props.tabs.filter(tab => !tab.pinned)
  return [...pinnedTabs, ...normalTabs]
})

const showNavControls = computed(() => {
  return props.scrollable && tabsWidth.value > navWidth.value
})

const canScrollLeft = computed(() => scrollLeft.value > 0)
const canScrollRight = computed(() => scrollLeft.value < tabsWidth.value - navWidth.value)

const navScrollStyle = computed(() => ({
  transform: `translateX(-${scrollLeft.value}px)`,
  width: `${tabsWidth.value}px`
}))

const dragIndicatorStyle = computed(() => {
  if (!dragState.value.dragging) return { display: 'none' }
  
  const insertIndex = dragState.value.insertIndex
  if (insertIndex < 0) return { display: 'none' }
  
  const tabElements = tabsNavRef.value?.querySelectorAll('.tab-item') || []
  const targetTab = tabElements[insertIndex] as HTMLElement
  
  if (!targetTab) return { display: 'none' }
  
  const rect = targetTab.getBoundingClientRect()
  const containerRect = tabsNavRef.value?.getBoundingClientRect()
  
  if (!containerRect) return { display: 'none' }
  
  return {
    left: `${rect.left - containerRect.left}px`,
    top: `${rect.bottom - containerRect.top - 2}px`,
    width: `${rect.width}px`,
    display: 'block'
  }
})

// 方法
const getTabStyle = (tab: TabConfig, index: number) => {
  const baseStyle: any = {}
  
  if (props.tabWidth === 'fixed') {
    baseStyle.width = '200px'
    baseStyle.minWidth = '200px'
  } else if (props.tabWidth === 'compact') {
    baseStyle.width = '120px'
    baseStyle.minWidth = '120px'
  }
  
  if (dragState.value.dragging && dragState.value.dragTabId === tab.id) {
    baseStyle.opacity = 0.5
    baseStyle.transform = `translateX(${dragState.value.currentX - dragState.value.startX}px)`
  }
  
  return baseStyle
}

const activateTab = (tabId: string) => {
  emit('tab-activated', tabId)
}

const closeTab = (tabId: string) => {
  const tab = props.tabs.find(t => t.id === tabId)
  if (tab && !tab.closable) return
  
  emit('tab-closed', tabId)
}

const closeAllTabs = () => {
  props.tabs.forEach(tab => {
    if (tab.closable) {
      emit('tab-closed', tab.id)
    }
  })
}

const closeOtherTabs = (keepTabId?: string) => {
  const activeId = keepTabId || props.activeTabId
  props.tabs.forEach(tab => {
    if (tab.id !== activeId && tab.closable) {
      emit('tab-closed', tab.id)
    }
  })
}

const closeTabsToRight = (fromTabId?: string) => {
  const fromId = fromTabId || props.activeTabId
  const fromIndex = props.tabs.findIndex(tab => tab.id === fromId)
  if (fromIndex < 0) return
  
  for (let i = fromIndex + 1; i < props.tabs.length; i++) {
    const tab = props.tabs[i]
    if (tab.closable) {
      emit('tab-closed', tab.id)
    }
  }
}

const pinTab = (tabId: string) => {
  const tab = props.tabs.find(t => t.id === tabId)
  if (!tab) return
  
  emit('tab-pinned', tabId, !tab.pinned)
}

const duplicateTab = (tabId: string) => {
  emit('tab-duplicated', tabId)
}

const showTabsList = () => {
  showAllTabsDialog.value = true
}

// 标签拖拽
const startTabDrag = (event: MouseEvent, tab: TabConfig, index: number) => {
  if (tab.pinned) return // 固定标签不能拖拽
  
  event.preventDefault()
  dragState.value = {
    dragging: true,
    dragTabId: tab.id,
    dragIndex: index,
    startX: event.clientX,
    currentX: event.clientX,
    insertIndex: -1
  }
  
  document.addEventListener('mousemove', handleTabDrag)
  document.addEventListener('mouseup', stopTabDrag)
}

const handleTabDrag = (event: MouseEvent) => {
  if (!dragState.value.dragging) return
  
  dragState.value.currentX = event.clientX
  
  // 计算插入位置
  const tabElements = tabsNavRef.value?.querySelectorAll('.tab-item') || []
  let insertIndex = -1
  
  for (let i = 0; i < tabElements.length; i++) {
    const element = tabElements[i] as HTMLElement
    const rect = element.getBoundingClientRect()
    
    if (event.clientX < rect.left + rect.width / 2) {
      insertIndex = i
      break
    }
  }
  
  if (insertIndex < 0) {
    insertIndex = tabElements.length
  }
  
  dragState.value.insertIndex = insertIndex
}

const stopTabDrag = () => {
  if (!dragState.value.dragging) return
  
  const fromIndex = dragState.value.dragIndex
  const toIndex = dragState.value.insertIndex
  
  if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
    emit('tab-moved', fromIndex, toIndex)
  }
  
  dragState.value.dragging = false
  document.removeEventListener('mousemove', handleTabDrag)
  document.removeEventListener('mouseup', stopTabDrag)
}

// 标签滚动
const scrollTabs = (direction: 'left' | 'right') => {
  const scrollAmount = 200
  const maxScroll = Math.max(0, tabsWidth.value - navWidth.value)
  
  if (direction === 'left') {
    scrollLeft.value = Math.max(0, scrollLeft.value - scrollAmount)
  } else {
    scrollLeft.value = Math.min(maxScroll, scrollLeft.value + scrollAmount)
  }
}

// 右键菜单
const showTabContextMenu = (event: MouseEvent, tab: TabConfig) => {
  event.preventDefault()
  contextTab.value = tab
  contextMenuStyle.value = {
    left: `${event.clientX}px`,
    top: `${event.clientY}px`
  }
  contextMenuVisible.value = true
}

// 标签属性更新
const updateTabTitle = (tabId: string, title: string) => {
  emit('tab-title-changed', tabId, title)
}

const updateTabIcon = (tabId: string, icon: string) => {
  emit('tab-icon-changed', tabId, icon)
}

const updateTabLoading = (tabId: string, loading: boolean) => {
  emit('tab-loading-changed', tabId, loading)
}

const updateTabChanges = (tabId: string, hasChanges: boolean) => {
  emit('tab-changes-changed', tabId, hasChanges)
}

// 更新尺寸
const updateSizes = () => {
  if (!tabsNavRef.value) return
  
  navWidth.value = tabsNavRef.value.clientWidth
  
  const tabElements = tabsNavRef.value.querySelectorAll('.tab-item, .tab-add-button')
  let totalWidth = 0
  
  tabElements.forEach(element => {
    totalWidth += (element as HTMLElement).offsetWidth
  })
  
  tabsWidth.value = totalWidth
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    updateSizes()
  })
  
  window.addEventListener('resize', updateSizes)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleTabDrag)
  document.removeEventListener('mouseup', stopTabDrag)
  window.removeEventListener('resize', updateSizes)
})
</script>

<style scoped>
.tabs-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
}

/* 标签头部 */
.tabs-header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color-light);
  position: relative;
  z-index: 10;
}

.tabs-nav {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
  position: relative;
}

.tabs-nav-scroll {
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

/* 标签项 */
.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  height: 36px;
  background: transparent;
  border-right: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  position: relative;
  transition: all 0.2s ease;
  min-width: 100px;
  max-width: 250px;
}

.tab-item:hover {
  background: var(--el-color-primary-light-9);
}

.tab-item.tab-active {
  background: var(--el-bg-color);
  border-bottom: 2px solid var(--el-color-primary);
  color: var(--el-color-primary);
  font-weight: 500;
}

.tab-item.tab-pinned {
  border-left: 3px solid var(--el-color-success);
}

.tab-item.tab-loading {
  color: var(--el-color-info);
}

.tab-item.tab-has-changes .tab-title {
  font-style: italic;
}

/* 标签图标 */
.tab-icon {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: inherit;
}

.tab-icon .is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 标签标题 */
.tab-title {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.changes-indicator {
  color: var(--el-color-warning);
  font-weight: bold;
  margin-left: 2px;
}

/* 标签关闭按钮 */
.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  opacity: 0;
  transition: all 0.2s ease;
}

.tab-item:hover .tab-close {
  opacity: 1;
}

.tab-close:hover {
  background: var(--el-color-danger-light-8);
  color: var(--el-color-danger);
}

/* 标签固定图钉 */
.tab-pin {
  font-size: 12px;
  color: var(--el-color-success);
}

/* 添加标签按钮 */
.tab-add-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 36px;
  cursor: pointer;
  color: var(--el-text-color-secondary);
  transition: all 0.2s ease;
}

.tab-add-button:hover {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

/* 导航控制 */
.tabs-nav-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  border-left: 1px solid var(--el-border-color-lighter);
}

/* 标签操作栏 */
.tabs-actions {
  padding: 0 16px;
  border-left: 1px solid var(--el-border-color-lighter);
}

/* 标签内容区域 */
.tabs-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.tab-pane {
  height: 100%;
  overflow: auto;
}

.tab-pane:not(.tab-pane-active) {
  display: none;
}

/* 拖拽指示器 */
.tab-drag-indicator {
  position: absolute;
  height: 2px;
  background: var(--el-color-primary);
  z-index: 999;
  transition: all 0.2s ease;
}

/* 右键菜单触发器 */
.context-menu-trigger {
  position: absolute;
  width: 1px;
  height: 1px;
  visibility: hidden;
}

/* 所有标签列表 */
.all-tabs-list {
  max-height: 400px;
  overflow-y: auto;
}

.all-tabs-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.all-tabs-item:hover {
  background: var(--el-color-primary-light-9);
}

.all-tabs-item.active {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

.all-tabs-icon {
  font-size: 16px;
  color: inherit;
}

.all-tabs-info {
  flex: 1;
  min-width: 0;
}

.all-tabs-title {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.all-tabs-path {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.all-tabs-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.all-tabs-item:hover .all-tabs-actions {
  opacity: 1;
}

/* 主题变体 */
.theme-dark {
  background: #1e1e1e;
}

.theme-dark .tabs-header {
  background: #2d2d2d;
  border-bottom-color: #404040;
}

.theme-dark .tab-item {
  border-right-color: #404040;
}

.theme-dark .tab-item.tab-active {
  background: #1e1e1e;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tab-item {
    min-width: 80px;
    padding: 8px 12px;
  }
  
  .tab-title {
    font-size: 12px;
  }
  
  .tabs-nav-controls,
  .tabs-actions {
    padding: 0 4px;
  }
}
</style>
