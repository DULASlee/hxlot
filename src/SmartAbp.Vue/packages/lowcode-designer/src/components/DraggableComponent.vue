<template>
  <div
    :class="[
      'draggable-component',
      `draggable-component--${componentType}`,
      {
        'is-selected': isSelected,
        'is-dragging': isDragging,
        'is-hover': isHover
      }
    ]"
    :data-block-id="blockId"
    :data-node-id="nodeId"
    :draggable="!isPreviewMode"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @click="handleSelect"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 组件选中边框 -->
    <div
      v-if="isSelected && !isPreviewMode"
      class="selection-border"
    >
      <div class="selection-handles">
        <div class="handle handle--tl" />
        <div class="handle handle--tr" />
        <div class="handle handle--bl" />
        <div class="handle handle--br" />
      </div>
      <div class="selection-toolbar">
        <el-button
          size="small"
          type="primary"
          :icon="Edit"
          title="编辑属性"
          @click="handleEdit"
        />
        <el-button
          size="small"
          type="danger"
          :icon="Delete"
          title="删除组件"
          @click="handleDelete"
        />
      </div>
    </div>

    <!-- 组件内容渲染 -->
    <component
      :is="componentType"
      v-bind="safeProps"
      :class="componentClass"
      :style="componentStyle"
      @update="handlePropsUpdate"
    >
      <slot />
    </component>

    <!-- 拖拽预览 -->
    <div
      v-if="isDragging"
      class="drag-preview"
    >
      {{ componentDisplayName }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
// ElMessage 将在删除确认时使用

// 类型定义
interface ComponentProps {
  [key: string]: unknown
}

interface ComponentStyle {
  [key: string]: string | number
}

interface Props {
  componentType: string
  blockId: string
  nodeId: string
  props?: ComponentProps
  isPreviewMode?: boolean
  componentDisplayName?: string
}

interface Emits {
  select: [id: string]
  delete: [id: string]
  edit: [id: string]
  dragStart: [id: string, event: DragEvent]
  dragEnd: [id: string, event: DragEvent]
  propsUpdate: [id: string, props: ComponentProps]
}

const props = withDefaults(defineProps<Props>(), {
  props: () => ({}),
  isPreviewMode: false,
  componentDisplayName: ''
})

const emit = defineEmits<Emits>()

// 设计器上下文
const designerContext = inject('designerContext', {
  selectedId: ref<string | undefined>(undefined)
})

// 响应式状态
const isDragging = ref(false)
const isHover = ref(false)

// 类型安全的工具函数
const isValidStyle = (value: unknown): value is ComponentStyle => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const isValidProps = (props: unknown): props is ComponentProps => {
  return typeof props === 'object' && props !== null && !Array.isArray(props)
}

const getDefaultPropsForComponent = (componentType: string): ComponentProps => {
  const defaultPropsMap: Record<string, ComponentProps> = {
    'el-button': {
      type: 'primary',
      size: 'default'
    },
    'el-input': {
      placeholder: '请输入内容',
      clearable: true
    },
    'el-select': {
      placeholder: '请选择',
      clearable: true
    },
    'el-form': {
      labelWidth: '100px',
      labelPosition: 'right'
    },
    'el-table': {
      border: true,
      stripe: false,
      size: 'default'
    }
  }

  return defaultPropsMap[componentType] || {}
}

// 计算属性
const isSelected = computed(() => {
  const selectedId = designerContext.selectedId?.value
  return selectedId === props.nodeId
})

const safeProps = computed(() => {
  const defaultProps = getDefaultPropsForComponent(props.componentType)
  const userProps = isValidProps(props.props) ? props.props : {}

  return {
    ...defaultProps,
    ...userProps
  }
})

const componentClass = computed(() => ({
  'designer-component': !props.isPreviewMode,
  'preview-component': props.isPreviewMode
}))

const componentStyle = computed(() => {
  const style: ComponentStyle = {}

  // 安全地处理样式属性
  if (safeProps.value.style && isValidStyle(safeProps.value.style)) {
    Object.entries(safeProps.value.style).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        style[key] = value
      }
    })
  }

  // 应用宽高属性
  if (safeProps.value.width) {
    const width = safeProps.value.width
    style.width = typeof width === 'number' ? `${width}px` : String(width)
  }

  if (safeProps.value.height) {
    const height = safeProps.value.height
    style.height = typeof height === 'number' ? `${height}px` : String(height)
  }

  return style
})

// 事件处理
const handleDragStart = (event: DragEvent) => {
  if (props.isPreviewMode) return

  isDragging.value = true

  // 设置拖拽数据
  const dragData = {
    type: 'move-component',
    nodeId: props.nodeId,
    blockId: props.blockId,
    componentType: props.componentType
  }

  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(dragData))
    event.dataTransfer.effectAllowed = 'move'
  }

  emit('dragStart', props.nodeId, event)
}

const handleDragEnd = (event: DragEvent) => {
  isDragging.value = false
  emit('dragEnd', props.nodeId, event)
}

const handleSelect = (event: MouseEvent) => {
  if (props.isPreviewMode) return

  event.stopPropagation()
  emit('select', props.nodeId)
}

const handleEdit = () => {
  emit('edit', props.nodeId)
}

const handleDelete = () => {
  emit('delete', props.nodeId)
}

const handleMouseEnter = () => {
  if (!props.isPreviewMode) {
    isHover.value = true
  }
}

const handleMouseLeave = () => {
  isHover.value = false
}

const handlePropsUpdate = (newProps: ComponentProps) => {
  if (isValidProps(newProps)) {
    emit('propsUpdate', props.nodeId, newProps)
  }
}
</script>

<style scoped>
.draggable-component {
  position: relative;
  display: inline-block;
  transition: all 0.2s ease;
  user-select: none;
}

.draggable-component:hover {
  outline: 1px dashed var(--el-color-primary);
  outline-offset: 2px;
}

.draggable-component.is-selected {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}

.draggable-component.is-dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.selection-border {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  pointer-events: none;
  z-index: 10;
}

.selection-handles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--el-color-primary);
  border: 1px solid var(--el-color-white);
  border-radius: 50%;
  pointer-events: auto;
  cursor: pointer;
}

.handle--tl {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}

.handle--tr {
  top: -4px;
  right: -4px;
  cursor: ne-resize;
}

.handle--bl {
  bottom: -4px;
  left: -4px;
  cursor: sw-resize;
}

.handle--br {
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
}

.selection-toolbar {
  position: absolute;
  top: -36px;
  right: 0;
  display: flex;
  gap: 4px;
  background: var(--el-color-white);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
}

.drag-preview {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--el-color-primary);
  color: var(--el-color-white);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
}

.designer-component {
  min-height: 32px;
  min-width: 32px;
}

/* 组件类型特定样式 */
.draggable-component--el-form {
  border: 1px dashed var(--el-border-color-light);
  padding: 16px;
  min-height: 100px;
}

.draggable-component--el-table {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
}

.draggable-component--el-button {
  display: inline-block;
}

.draggable-component--el-input {
  display: block;
  width: 100%;
}
</style>
