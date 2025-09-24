<template>
  <div class="visual-design-canvas">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue"

interface PageData {
  [key: string]: unknown
}

interface EntityData {
  [key: string]: unknown
}

defineProps<{
  pageData?: PageData
  entityData?: EntityData
}>()

defineEmits<{
  (e: "component-added", payload: unknown): void
  (e: "component-selected", payload: unknown): void
  (e: "component-updated", payload: unknown): void
  (e: "component-deleted", payload: unknown): void
  (e: "preview-generated", payload: unknown): void
}>()

const getCanvasClass = () => {
  return [
    `canvas-${canvasMode.value}`,
    { 'dragging-over': isDraggingOver.value }
  ]
}

const getDeviceClass = () => {
  return `device-${previewDevice.value}`
}

const handleDrop = (event) => {
  event.preventDefault()
  isDraggingOver.value = false

  try {
    const dragData = JSON.parse(event.dataTransfer.getData('text/plain'))

    if (dragData.sourceType === 'palette') {
      // 从组件面板拖拽的组件
      addComponentToCanvas(dragData.component, {
        x: event.offsetX,
        y: event.offsetY
      })
    }
  } catch (error) {
    console.warn('Invalid drag data:', error)
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
}

const handleDragEnter = (event) => {
  event.preventDefault()
  isDraggingOver.value = true
}

const handleDragLeave = (event) => {
  event.preventDefault()
  // 只有当离开整个画布区域时才取消拖拽状态
  if (!event.currentTarget.contains(event.relatedTarget)) {
    isDraggingOver.value = false
  }
}

const addComponentToCanvas = (componentTemplate, position) => {
  const newComponent = {
    id: `component-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: componentTemplate.tag,
    name: componentTemplate.name,
    props: { ...componentTemplate.props },
    style: {
      position: 'absolute',
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: getDefaultWidth(componentTemplate.tag),
      height: getDefaultHeight(componentTemplate.tag)
    },
    children: []
  }

  components.value.push(newComponent)
  selectedComponent.value = newComponent

  // 保存到历史记录
  saveToHistory()

  ElMessage.success(`组件"${componentTemplate.name}"添加成功`)

  // 触发组件添加事件
  emit('component-added', newComponent)
}

const getDefaultWidth = (componentType) => {
  const widthMap = {
    'el-button': '80px',
    'el-input': '200px',
    'el-select': '200px',
    'el-table': '100%',
    'el-card': '300px',
    'el-image': '200px'
  }
  return widthMap[componentType] || '200px'
}

const getDefaultHeight = (componentType) => {
  const heightMap = {
    'el-button': '32px',
    'el-input': '32px',
    'el-select': '32px',
    'el-table': '300px',
    'el-card': '200px',
    'el-image': '150px'
  }
  return heightMap[componentType] || 'auto'
}

const selectComponent = (component) => {
  selectedComponent.value = component
  emit('component-selected', component)
}

const moveComponent = (index, direction) => {
  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex >= 0 && newIndex < components.value.length) {
    const temp = components.value[index]
    components.value[index] = components.value[newIndex]
    components.value[newIndex] = temp

    saveToHistory()
  }
}

const duplicateComponent = (component) => {
  const duplicated = {
    ...component,
    id: `component-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    style: {
      ...component.style,
      left: `${parseInt(component.style.left) + 20}px`,
      top: `${parseInt(component.style.top) + 20}px`
    }
  }

  components.value.push(duplicated)
  selectedComponent.value = duplicated
  saveToHistory()

  ElMessage.success('组件复制成功')
}

const deleteComponent = (component) => {
  const index = components.value.findIndex(c => c.id === component.id)
  if (index > -1) {
    components.value.splice(index, 1)

    if (selectedComponent.value?.id === component.id) {
      selectedComponent.value = null
    }

    saveToHistory()
    ElMessage.success('组件删除成功')
  }
}

const getComponentStyle = (component) => {
  return {
    ...component.style,
    transform: `scale(${zoomLevel.value})`,
    transformOrigin: 'top left'
  }
}

const getComponentRenderer = (component) => {
  // 根据组件类型返回对应的渲染器
  const rendererMap = {
    'el-button': 'button',
    'el-input': 'input',
    'el-select': 'select',
    'el-table': 'table',
    'el-card': 'card',
    'el-image': 'image',
    'el-text': 'span',
    'el-divider': 'hr'
  }

  return rendererMap[component.type] || 'div'
}

const startResize = (component, direction, event) => {
  event.stopPropagation()

  const startX = event.clientX
  const startY = event.clientY
  const startWidth = parseInt(component.style.width)
  const startHeight = parseInt(component.style.height)
  const startLeft = parseInt(component.style.left)
  const startTop = parseInt(component.style.top)

  const handleMouseMove = (moveEvent) => {
    const deltaX = moveEvent.clientX - startX
    const deltaY = moveEvent.clientY - startY

    switch (direction) {
      case 'se': // 东南角
        component.style.width = Math.max(50, startWidth + deltaX) + 'px'
        component.style.height = Math.max(30, startHeight + deltaY) + 'px'
        break
      case 'sw': // 西南角
        component.style.width = Math.max(50, startWidth - deltaX) + 'px'
        component.style.height = Math.max(30, startHeight + deltaY) + 'px'
        component.style.left = Math.min(startLeft + deltaX, startLeft + startWidth - 50) + 'px'
        break
      case 'ne': // 东北角
        component.style.width = Math.max(50, startWidth + deltaX) + 'px'
        component.style.height = Math.max(30, startHeight - deltaY) + 'px'
        component.style.top = Math.min(startTop + deltaY, startTop + startHeight - 30) + 'px'
        break
      case 'nw': // 西北角
        component.style.width = Math.max(50, startWidth - deltaX) + 'px'
        component.style.height = Math.max(30, startHeight - deltaY) + 'px'
        component.style.left = Math.min(startLeft + deltaX, startLeft + startWidth - 50) + 'px'
        component.style.top = Math.min(startTop + deltaY, startTop + startHeight - 30) + 'px'
        break
    }

    // 显示对齐辅助线
    showAlignmentGuides(component)
  }

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)

    // 隐藏辅助线
    guideLines.value = []

    // 保存到历史记录
    saveToHistory()
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const showAlignmentGuides = (movingComponent) => {
  guideLines.value = []

  const movingRect = {
    left: parseInt(movingComponent.style.left),
    top: parseInt(movingComponent.style.top),
    right: parseInt(movingComponent.style.left) + parseInt(movingComponent.style.width),
    bottom: parseInt(movingComponent.style.top) + parseInt(movingComponent.style.height),
    centerX: parseInt(movingComponent.style.left) + parseInt(movingComponent.style.width) / 2,
    centerY: parseInt(movingComponent.style.top) + parseInt(movingComponent.style.height) / 2
  }

  // 与其他组件对齐
  components.value.forEach(component => {
    if (component.id === movingComponent.id) return

    const rect = {
      left: parseInt(component.style.left),
      top: parseInt(component.style.top),
      right: parseInt(component.style.left) + parseInt(component.style.width),
      bottom: parseInt(component.style.top) + parseInt(component.style.height),
      centerX: parseInt(component.style.left) + parseInt(component.style.width) / 2,
      centerY: parseInt(component.style.top) + parseInt(component.style.height) / 2
    }

    const threshold = 5 // 对齐阈值

    // 垂直对齐线
    if (Math.abs(movingRect.left - rect.left) < threshold) {
      addGuideLine('vertical', rect.left)
    }
    if (Math.abs(movingRect.right - rect.right) < threshold) {
      addGuideLine('vertical', rect.right)
    }
    if (Math.abs(movingRect.centerX - rect.centerX) < threshold) {
      addGuideLine('vertical', rect.centerX)
    }

    // 水平对齐线
    if (Math.abs(movingRect.top - rect.top) < threshold) {
      addGuideLine('horizontal', rect.top)
    }
    if (Math.abs(movingRect.bottom - rect.bottom) < threshold) {
      addGuideLine('horizontal', rect.bottom)
    }
    if (Math.abs(movingRect.centerY - rect.centerY) < threshold) {
      addGuideLine('horizontal', rect.centerY)
    }
  })
}

const addGuideLine = (type, position) => {
  const guideLine = {
    id: `guide-${type}-${position}`,
    type,
    style: type === 'vertical'
      ? { left: `${position}px`, top: '0', height: '100%' }
      : { top: `${position}px`, left: '0', width: '100%' }
  }

  if (!guideLines.value.some(g => g.id === guideLine.id)) {
    guideLines.value.push(guideLine)
  }
}

const addQuickLayout = () => {
  // 添加快速布局
  const quickLayoutComponents = [
    {
      id: 'header-row',
      type: 'el-row',
      name: '页面头部',
      style: { position: 'absolute', left: '20px', top: '20px', width: 'calc(100% - 40px)', height: '60px' },
      props: { gutter: 20 }
    },
    {
      id: 'content-card',
      type: 'el-card',
      name: '内容区域',
      style: { position: 'absolute', left: '20px', top: '100px', width: 'calc(100% - 40px)', height: '500px' },
      props: { header: '内容标题' }
    },
    {
      id: 'action-buttons',
      type: 'el-row',
      name: '操作按钮',
      style: { position: 'absolute', left: '20px', bottom: '20px', width: 'calc(100% - 40px)', height: '40px' },
      props: { justify: 'end' }
    }
  ]

  quickLayoutComponents.forEach(comp => {
    comp.id = `component-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    components.value.push(comp)
  })

  saveToHistory()
  ElMessage.success('快速布局添加成功')
}

const loadPageTemplate = () => {
  ElMessage.info('页面模板加载功能开发中...')
}

const clearCanvas = () => {
  if (components.value.length > 0) {
    components.value = []
    selectedComponent.value = null
    saveToHistory()
    ElMessage.success('画布已清空')
  }
}

const undo = () => {
  if (canUndo.value) {
    historyIndex.value--
    const state = history.value[historyIndex.value]
    components.value = JSON.parse(JSON.stringify(state.components))
    selectedComponent.value = null
  }
}

const redo = () => {
  if (canRedo.value) {
    historyIndex.value++
    const state = history.value[historyIndex.value]
    components.value = JSON.parse(JSON.stringify(state.components))
    selectedComponent.value = null
  }
}

const saveToHistory = () => {
  // 移除当前位置之后的历史记录
  if (historyIndex.value < history.value.length - 1) {
    history.value.splice(historyIndex.value + 1)
  }

  // 添加新的状态
  const state = {
    timestamp: Date.now(),
    components: JSON.parse(JSON.stringify(components.value))
  }

  history.value.push(state)
  historyIndex.value = history.value.length - 1

  // 限制历史记录大小
  if (history.value.length > maxHistorySize) {
    history.value.shift()
    historyIndex.value--
  }
}

const zoomIn = () => {
  zoomLevel.value = Math.min(2, zoomLevel.value + 0.25)
}

const zoomOut = () => {
  zoomLevel.value = Math.max(0.25, zoomLevel.value - 0.25)
}

const resetZoom = () => {
  zoomLevel.value = 1
}

const generatePreview = () => {
  // 生成预览数据
  emit('preview-generated', {
    components: components.value,
    device: previewDevice.value,
    mode: 'preview'
  })
}

const handlePreviewLoad = () => {
  ElMessage.success('预览加载完成')
}

const generateVueTemplate = () => {
  if (components.value.length === 0) {
    return '<template>\n  <div class="page-container">\n    <!-- 页面内容 -->\n  </div>\n</template>'
  }

  let template = '<template>\n  <div class="page-container">\n'

  components.value.forEach(component => {
    template += `    <${component.type}`

    // 添加属性
    Object.entries(component.props).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        template += ` ${key}="${value}"`
      }
    })

    template += `>\n      ${component.name}\n    </${component.type}>\n`
  })

  template += '  </div>\n</template>'
  return template
}

const generateVueScript = () => {
  return 'Vue组件代码生成功能开发中...'
}

// Emits
const emit = defineEmits<{
  'component-added': [component: any]
  'component-selected': [component: any]
  'component-updated': [component: any]
  'component-deleted': [component: any]
  'preview-generated': [data: any]
}>()

defineEmits<{
  (e: "component-added", payload: unknown): void
  (e: "component-selected", payload: unknown): void
  (e: "component-updated", payload: unknown): void
  (e: "component-deleted", payload: unknown): void
  (e: "preview-generated", payload: unknown): void
}>()
</script>

<style scoped>
.visual-design-canvas {
  min-height: 200px;
  border: 1px dashed var(--el-border-color, #dcdfe6);
  border-radius: 4px;
  background: var(--el-color-white, #fff);
}
</style>


