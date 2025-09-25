<!--
  MDI多文档界面容器
  支持窗口拖拽、调整大小、最大化、最小化等企业级功能
-->
<template>
  <div
    ref="containerRef"
    class="mdi-container"
  >
    <!-- MDI工作区域 -->
    <div
      class="mdi-workspace"
      :style="workspaceStyle"
    >
      <!-- 窗口实例 -->
      <div
        v-for="window in activeWindows"
        :key="window.id"
        class="mdi-window"
        :class="{
          'window-active': activeWindowId === window.id,
          'window-maximized': window.state === 'maximized',
          'window-minimized': window.state === 'minimized'
        }"
        :style="getWindowStyle(window)"
        @mousedown="activateWindow(window.id)"
        @contextmenu="showWindowContextMenu($event, window)"
      >
        <!-- 窗口标题栏 -->
        <div
          class="window-titlebar"
          @mousedown="startWindowDrag($event, window)"
          @dblclick="toggleWindowMaximize(window.id)"
        >
          <div class="titlebar-left">
            <div class="window-icon">
              <i :class="window.icon || 'el-icon-document'" />
            </div>
            <div class="window-title">
              {{ window.title }}
            </div>
          </div>
          <div class="titlebar-actions">
            <el-button
              text
              size="small"
              @click="minimizeWindow(window.id)"
            >
              <i class="el-icon-minus" />
            </el-button>
            <el-button
              text
              size="small"
              @click="toggleWindowMaximize(window.id)"
            >
              <i :class="window.state === 'maximized' ? 'el-icon-copy-document' : 'el-icon-full-screen'" />
            </el-button>
            <el-button
              text
              size="small"
              @click="closeWindow(window.id)"
            >
              <i class="el-icon-close" />
            </el-button>
          </div>
        </div>

        <!-- 窗口内容区域 -->
        <div
          v-show="window.state !== 'minimized'"
          class="window-content"
        >
          <component
            :is="window.component"
            v-bind="window.props"
            @window-title-change="updateWindowTitle(window.id, $event)"
            @window-icon-change="updateWindowIcon(window.id, $event)"
          />
        </div>

        <!-- 窗口调整大小句柄 -->
        <div
          v-show="window.state === 'normal' && window.resizable"
          class="resize-handles"
        >
          <div
            class="resize-handle resize-n"
            @mousedown="startWindowResize($event, window, 'n')"
          />
          <div
            class="resize-handle resize-ne"
            @mousedown="startWindowResize($event, window, 'ne')"
          />
          <div
            class="resize-handle resize-e"
            @mousedown="startWindowResize($event, window, 'e')"
          />
          <div
            class="resize-handle resize-se"
            @mousedown="startWindowResize($event, window, 'se')"
          />
          <div
            class="resize-handle resize-s"
            @mousedown="startWindowResize($event, window, 's')"
          />
          <div
            class="resize-handle resize-sw"
            @mousedown="startWindowResize($event, window, 'sw')"
          />
          <div
            class="resize-handle resize-w"
            @mousedown="startWindowResize($event, window, 'w')"
          />
          <div
            class="resize-handle resize-nw"
            @mousedown="startWindowResize($event, window, 'nw')"
          />
        </div>
      </div>
    </div>

    <!-- 任务栏（显示最小化的窗口） -->
    <div
      v-if="minimizedWindows.length > 0"
      class="mdi-taskbar"
    >
      <div
        v-for="window in minimizedWindows"
        :key="window.id"
        class="taskbar-item"
        @click="restoreWindow(window.id)"
      >
        <i :class="window.icon || 'el-icon-document'" />
        <span class="taskbar-title">{{ window.title }}</span>
      </div>
    </div>

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
          <el-dropdown-item @click="restoreWindow(contextWindow?.id || '')">
            <i class="el-icon-refresh-left" /> 还原
          </el-dropdown-item>
          <el-dropdown-item @click="minimizeWindow(contextWindow?.id || '')">
            <i class="el-icon-minus" /> 最小化
          </el-dropdown-item>
          <el-dropdown-item @click="maximizeWindow(contextWindow?.id || '')">
            <i class="el-icon-full-screen" /> 最大化
          </el-dropdown-item>
          <el-dropdown-item
            divided
            @click="closeWindow(contextWindow?.id || '')"
          >
            <i class="el-icon-close" /> 关闭
          </el-dropdown-item>
          <el-dropdown-item @click="closeAllWindows">
            <i class="el-icon-delete" /> 关闭所有
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { MDIWindowConfig } from '@smartabp/lowcode-core'

// Props
interface Props {
  windows: MDIWindowConfig[]
  activeWindowId?: string
  theme?: 'light' | 'dark'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light'
})

// Emits
const emit = defineEmits<{
  'window-activated': [windowId: string]
  'window-closed': [windowId: string]
  'window-minimized': [windowId: string]
  'window-maximized': [windowId: string]
  'window-restored': [windowId: string]
  'window-moved': [windowId: string, x: number, y: number]
  'window-resized': [windowId: string, width: number, height: number]
  'window-title-changed': [windowId: string, title: string]
  'window-icon-changed': [windowId: string, icon: string]
}>()

// 响应式数据
const containerRef = ref<HTMLElement>()
const contextMenuRef = ref()
const contextMenuVisible = ref(false)
const contextMenuStyle = ref({ left: '0px', top: '0px' })
const contextWindow = ref<MDIWindowConfig>()

// 拖拽状态
const dragState = ref({
  dragging: false,
  windowId: '',
  startX: 0,
  startY: 0,
  startWindowX: 0,
  startWindowY: 0
})

// 调整大小状态
const resizeState = ref({
  resizing: false,
  windowId: '',
  direction: '',
  startX: 0,
  startY: 0,
  startWidth: 0,
  startHeight: 0,
  startWindowX: 0,
  startWindowY: 0
})

// 计算属性
const activeWindows = computed(() => {
  return props.windows.filter(w => w.state !== 'closed')
})

const minimizedWindows = computed(() => {
  return props.windows.filter(w => w.state === 'minimized')
})

const workspaceStyle = computed(() => ({
  backgroundColor: props.theme === 'dark' ? '#1e1e1e' : '#f5f5f5'
}))

// 方法
const getWindowStyle = (window: MDIWindowConfig) => {
  if (window.state === 'maximized') {
    return {
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%',
      zIndex: props.activeWindowId === window.id ? 1000 : 100
    }
  }

  if (window.state === 'minimized') {
    return {
      display: 'none'
    }
  }

  return {
    left: `${window.bounds?.x || window.position?.x || 0}px`,
    top: `${window.bounds?.y || window.position?.y || 0}px`,
    width: `${window.bounds?.width || window.size?.width || 400}px`,
    height: `${window.bounds?.height || window.size?.height || 300}px`,
    zIndex: props.activeWindowId === window.id ? 1000 : 100
  }
}

const activateWindow = (windowId: string) => {
  emit('window-activated', windowId)
}

const closeWindow = (windowId: string) => {
  emit('window-closed', windowId)
}

const minimizeWindow = (windowId: string) => {
  emit('window-minimized', windowId)
}

const maximizeWindow = (windowId: string) => {
  emit('window-maximized', windowId)
}

const restoreWindow = (windowId: string) => {
  emit('window-restored', windowId)
}

const toggleWindowMaximize = (windowId: string) => {
  const window = props.windows.find(w => w.id === windowId)
  if (window?.state === 'maximized') {
    restoreWindow(windowId)
  } else {
    maximizeWindow(windowId)
  }
}

const closeAllWindows = () => {
  activeWindows.value.forEach(window => {
    closeWindow(window.id || '')
  })
}

// 窗口拖拽
const startWindowDrag = (event: MouseEvent, window: MDIWindowConfig) => {
  if (window.state === 'maximized' || !window.draggable) return

  event.preventDefault()
  dragState.value = {
    dragging: true,
    windowId: window.id,
    startX: event.clientX,
    startY: event.clientY,
    startWindowX: window.bounds?.x || window.position?.x || 0,
    startWindowY: window.bounds?.y || window.position?.y || 0
  }

  document.addEventListener('mousemove', handleWindowDrag)
  document.addEventListener('mouseup', stopWindowDrag)
}

const handleWindowDrag = (event: MouseEvent) => {
  if (!dragState.value.dragging) return

  const deltaX = event.clientX - dragState.value.startX
  const deltaY = event.clientY - dragState.value.startY

  const newX = dragState.value.startWindowX + deltaX
  const newY = dragState.value.startWindowY + deltaY

  emit('window-moved', dragState.value.windowId, newX, newY)
}

const stopWindowDrag = () => {
  dragState.value.dragging = false
  document.removeEventListener('mousemove', handleWindowDrag)
  document.removeEventListener('mouseup', stopWindowDrag)
}

// 窗口调整大小
const startWindowResize = (event: MouseEvent, window: MDIWindowConfig, direction: string) => {
  if (!window.resizable) return

  event.preventDefault()
  event.stopPropagation()

  resizeState.value = {
    resizing: true,
    windowId: window.id,
    direction,
    startX: event.clientX,
    startY: event.clientY,
    startWidth: window.bounds?.width || window.size?.width || 400,
    startHeight: window.bounds?.height || window.size?.height || 300,
    startWindowX: window.bounds?.x || window.position?.x || 0,
    startWindowY: window.bounds?.y || window.position?.y || 0
  }

  document.addEventListener('mousemove', handleWindowResize)
  document.addEventListener('mouseup', stopWindowResize)
}

const handleWindowResize = (event: MouseEvent) => {
  if (!resizeState.value.resizing) return

  const deltaX = event.clientX - resizeState.value.startX
  const deltaY = event.clientY - resizeState.value.startY
  const direction = resizeState.value.direction

  let newWidth = resizeState.value.startWidth
  let newHeight = resizeState.value.startHeight
  let newX = resizeState.value.startWindowX
  let newY = resizeState.value.startWindowY

  // 根据调整方向计算新的尺寸和位置
  if (direction.includes('e')) {
    newWidth = Math.max(200, resizeState.value.startWidth + deltaX)
  }
  if (direction.includes('w')) {
    newWidth = Math.max(200, resizeState.value.startWidth - deltaX)
    newX = resizeState.value.startWindowX + deltaX
  }
  if (direction.includes('s')) {
    newHeight = Math.max(150, resizeState.value.startHeight + deltaY)
  }
  if (direction.includes('n')) {
    newHeight = Math.max(150, resizeState.value.startHeight - deltaY)
    newY = resizeState.value.startWindowY + deltaY
  }

  emit('window-moved', resizeState.value.windowId, newX, newY)
  emit('window-resized', resizeState.value.windowId, newWidth, newHeight)
}

const stopWindowResize = () => {
  resizeState.value.resizing = false
  document.removeEventListener('mousemove', handleWindowResize)
  document.removeEventListener('mouseup', stopWindowResize)
}

// 右键菜单
const showWindowContextMenu = (event: MouseEvent, window: MDIWindowConfig) => {
  event.preventDefault()
  contextWindow.value = window
  contextMenuStyle.value = {
    left: `${event.clientX}px`,
    top: `${event.clientY}px`
  }
  contextMenuVisible.value = true
}

// 窗口标题和图标更新
const updateWindowTitle = (windowId: string, title: string) => {
  emit('window-title-changed', windowId, title)
}

const updateWindowIcon = (windowId: string, icon: string) => {
  emit('window-icon-changed', windowId, icon)
}

// 生命周期
onMounted(() => {
  // 阻止默认的右键菜单
  containerRef.value?.addEventListener('contextmenu', (e) => {
    if ((e.target as Element).closest('.mdi-window')) return
    e.preventDefault()
  })
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleWindowDrag)
  document.removeEventListener('mouseup', stopWindowDrag)
  document.removeEventListener('mousemove', handleWindowResize)
  document.removeEventListener('mouseup', stopWindowResize)
})
</script>

<style scoped>
.mdi-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--el-bg-color-page);
}

.mdi-workspace {
  position: relative;
  width: 100%;
  height: calc(100% - 40px);
  overflow: hidden;
  background-image: radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* MDI窗口样式 */
.mdi-window {
  position: absolute;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 6px 6px 0 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  min-width: 200px;
  min-height: 150px;
  transition: box-shadow 0.2s ease;
}

.mdi-window.window-active {
  border-color: var(--el-color-primary);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

.mdi-window.window-maximized {
  border-radius: 0;
}

/* 窗口标题栏 */
.window-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  padding: 0 8px;
  background: var(--el-bg-color-light);
  border-bottom: 1px solid var(--el-border-color);
  cursor: move;
  user-select: none;
}

.window-active .window-titlebar {
  background: var(--el-color-primary-light-9);
  border-bottom-color: var(--el-color-primary);
}

.titlebar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.window-icon {
  color: var(--el-color-primary);
  font-size: 16px;
}

.window-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.titlebar-actions {
  display: flex;
  gap: 2px;
}

.titlebar-actions .el-button {
  width: 24px;
  height: 24px;
  min-height: 24px;
  padding: 0;
  font-size: 12px;
}

.titlebar-actions .el-button:hover {
  background: var(--el-color-danger-light-8);
  color: var(--el-color-danger);
}

/* 窗口内容区域 */
.window-content {
  flex: 1;
  overflow: hidden;
  background: var(--el-bg-color);
}

/* 调整大小句柄 */
.resize-handles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  pointer-events: all;
  background: transparent;
}

.resize-n {
  top: -3px;
  left: 6px;
  right: 6px;
  height: 6px;
  cursor: n-resize;
}

.resize-s {
  bottom: -3px;
  left: 6px;
  right: 6px;
  height: 6px;
  cursor: s-resize;
}

.resize-e {
  right: -3px;
  top: 6px;
  bottom: 6px;
  width: 6px;
  cursor: e-resize;
}

.resize-w {
  left: -3px;
  top: 6px;
  bottom: 6px;
  width: 6px;
  cursor: w-resize;
}

.resize-ne {
  top: -3px;
  right: -3px;
  width: 12px;
  height: 12px;
  cursor: ne-resize;
}

.resize-nw {
  top: -3px;
  left: -3px;
  width: 12px;
  height: 12px;
  cursor: nw-resize;
}

.resize-se {
  bottom: -3px;
  right: -3px;
  width: 12px;
  height: 12px;
  cursor: se-resize;
}

.resize-sw {
  bottom: -3px;
  left: -3px;
  width: 12px;
  height: 12px;
  cursor: sw-resize;
}

/* 任务栏 */
.mdi-taskbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: var(--el-bg-color-light);
  border-top: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
  overflow-x: auto;
}

.taskbar-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.taskbar-item:hover {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}

.taskbar-title {
  font-size: 12px;
  color: var(--el-text-color-regular);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 右键菜单触发器 */
.context-menu-trigger {
  position: absolute;
  width: 1px;
  height: 1px;
  visibility: hidden;
}

/* 动画效果 */
.mdi-window {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.window-maximized {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
