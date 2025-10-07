<template>
  <div class="mdi-container">
    <!-- 🔥 临时占位组件：MDI容器 -->
    <div class="mdi-workspace">
      <div
        v-for="window in windows"
        :key="window.id"
        class="mdi-window"
        :class="{ active: window.id === activeWindowId }"
        :style="getWindowStyle(window)"
        @mousedown="handleWindowActivate(window.id)"
      >
        <!-- 窗口标题栏 -->
        <div class="window-header" @mousedown.stop="startDrag(window.id, $event)">
          <div class="window-title">
            <i :class="window.icon || 'el-icon-document'" />
            <span>{{ window.title }}</span>
          </div>
          <div class="window-controls">
            <el-button
              size="small"
              text
              icon="el-icon-minus"
              @click.stop="handleMinimize(window.id)"
            />
            <el-button
              size="small"
              text
              :icon="window.maximized ? 'el-icon-copy-document' : 'el-icon-full-screen'"
              @click.stop="handleMaximize(window.id)"
            />
            <el-button
              size="small"
              text
              icon="el-icon-close"
              @click.stop="handleClose(window.id)"
            />
          </div>
        </div>

        <!-- 窗口内容 -->
        <div class="window-content">
          <el-result
            icon="info"
            title="MDI窗口模式"
            sub-title="此功能将在Phase 2实现"
          >
            <template #extra>
              <el-tag>{{ window.component }}</el-tag>
            </template>
          </el-result>
        </div>

        <!-- 调整大小手柄 -->
        <div
          v-if="window.resizable"
          class="resize-handle"
          @mousedown.stop="startResize(window.id, $event)"
        />
      </div>
    </div>

    <!-- 空状态提示 -->
    <div v-if="windows.length === 0" class="mdi-empty">
      <el-empty description="暂无窗口，点击'添加窗口'创建" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  windows: any[]
  activeWindowId: string
}

const props = withDefaults(defineProps<Props>(), {
  windows: () => [],
  activeWindowId: ''
})

const emit = defineEmits<{
  'window-activated': [windowId: string]
  'window-closed': [windowId: string]
  'window-moved': [windowId: string, x: number, y: number]
  'window-resized': [windowId: string, width: number, height: number]
}>()

const draggingWindow = ref<string | null>(null)
const resizingWindow = ref<string | null>(null)

const getWindowStyle = (window: any) => {
  return {
    left: `${window.bounds?.x || 50}px`,
    top: `${window.bounds?.y || 50}px`,
    width: window.maximized ? '100%' : `${window.bounds?.width || 600}px`,
    height: window.maximized ? '100%' : `${window.bounds?.height || 400}px`,
    zIndex: window.id === props.activeWindowId ? 1000 : 999
  }
}

const handleWindowActivate = (windowId: string) => {
  emit('window-activated', windowId)
}

const handleClose = (windowId: string) => {
  emit('window-closed', windowId)
}

const handleMinimize = (windowId: string) => {
  console.log('Minimize window:', windowId)
}

const handleMaximize = (windowId: string) => {
  console.log('Maximize window:', windowId)
}

const startDrag = (windowId: string, event: MouseEvent) => {
  draggingWindow.value = windowId
  console.log('Start dragging:', windowId, event)
}

const startResize = (windowId: string, event: MouseEvent) => {
  resizingWindow.value = windowId
  console.log('Start resizing:', windowId, event)
}
</script>

<style scoped>
.mdi-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: var(--el-fill-color-lighter);
  overflow: hidden;
}

.mdi-workspace {
  width: 100%;
  height: 100%;
  position: relative;
}

.mdi-window {
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s;
}

.mdi-window.active {
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.3);
  border: 1px solid var(--el-color-primary);
}

.window-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color);
  cursor: move;
  user-select: none;
}

.window-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  flex: 1;
}

.window-controls {
  display: flex;
  gap: 4px;
}

.window-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
  background: linear-gradient(135deg, transparent 50%, var(--el-color-primary) 50%);
}

.mdi-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>

