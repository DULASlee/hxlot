<template>
  <div class="visual-design-canvas">
    <div class="canvas-container">
      <!-- 画布工具栏 -->
      <div class="canvas-toolbar">
        <div class="toolbar-left">
          <el-button-group size="small">
            <el-button
              :type="canvasMode === 'design' ? 'primary' : 'default'"
              icon="el-icon-edit"
              @click="setCanvasMode('design')"
            >
              设计模式
            </el-button>
            <el-button
              :type="canvasMode === 'preview' ? 'primary' : 'default'"
              icon="el-icon-view"
              @click="setCanvasMode('preview')"
            >
              预览模式
            </el-button>
            <el-button
              :type="canvasMode === 'code' ? 'primary' : 'default'"
              icon="el-icon-document"
              @click="setCanvasMode('code')"
            >
              代码模式
            </el-button>
          </el-button-group>
        </div>

        <div class="toolbar-center">
          <div class="device-selector">
            <el-radio-group
              v-model="previewDevice"
              size="small"
            >
              <el-radio-button label="desktop">
                <i class="el-icon-monitor" /> 桌面
              </el-radio-button>
              <el-radio-button label="tablet">
                <i class="el-icon-mobile" /> 平板
              </el-radio-button>
              <el-radio-button label="mobile">
                <i class="el-icon-mobile-phone" /> 手机
              </el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <div class="toolbar-right">
          <el-button-group size="small">
            <el-button
              icon="el-icon-refresh-left"
              :disabled="!canUndo"
              @click="undo"
            >
              撤销
            </el-button>
            <el-button
              icon="el-icon-refresh-right"
              :disabled="!canRedo"
              @click="redo"
            >
              重做
            </el-button>
            <el-button
              icon="el-icon-delete"
              @click="clearCanvas"
            >
              清空
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 设计画布 -->
      <div
        class="canvas-workspace"
        :class="getCanvasClass()"
      >
        <!-- 设计模式画布 -->
        <div
          v-if="canvasMode === 'design'"
          ref="designCanvasRef"
          class="design-canvas"
          :class="getDeviceClass()"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
        >
          <!-- 拖拽提示 -->
          <div
            v-if="components.length === 0"
            class="drop-hint"
          >
            <div class="hint-content">
              <i class="el-icon-upload" />
              <h3>拖拽组件到此处开始设计</h3>
              <p>从左侧组件面板拖拽组件到画布中</p>
              <div class="quick-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="addQuickLayout"
                >
                  快速布局
                </el-button>
                <el-button
                  size="small"
                  @click="loadPageTemplate"
                >
                  加载模板
                </el-button>
              </div>
            </div>
          </div>

          <!-- 组件渲染区域 -->
          <div
            v-for="(component, index) in components"
            :key="component.id"
            class="canvas-component"
            :class="{
              selected: selectedComponent?.id === component.id,
              hover: hoverComponent?.id === component.id
            }"
            :style="getComponentStyle(component)"
            @click="selectComponent(component)"
            @mouseenter="hoverComponent = component"
            @mouseleave="hoverComponent = null"
          >
            <!-- 组件内容 -->
            <component
              :is="getComponentRenderer(component)"
              v-bind="component.props"
              :data-component-id="component.id"
              class="rendered-component"
            />

            <!-- 组件操作工具 -->
            <div
              v-if="selectedComponent?.id === component.id"
              class="component-tools"
            >
              <div class="tools-bar">
                <el-button-group size="small">
                  <el-button
                    icon="el-icon-rank"
                    :disabled="index === 0"
                    title="上移"
                    @click="moveComponent(index, 'up')"
                  />
                  <el-button
                    icon="el-icon-sort"
                    :disabled="index === components.length - 1"
                    title="下移"
                    @click="moveComponent(index, 'down')"
                  />
                  <el-button
                    icon="el-icon-document-copy"
                    title="复制"
                    @click="duplicateComponent(component)"
                  />
                  <el-button
                    icon="el-icon-delete"
                    type="danger"
                    title="删除"
                    @click="deleteComponent(component)"
                  />
                </el-button-group>
              </div>

              <!-- 尺寸调整手柄 -->
              <div class="resize-handles">
                <div
                  class="resize-handle nw"
                  @mousedown="startResize(component, 'nw', $event)"
                />
                <div
                  class="resize-handle ne"
                  @mousedown="startResize(component, 'ne', $event)"
                />
                <div
                  class="resize-handle sw"
                  @mousedown="startResize(component, 'sw', $event)"
                />
                <div
                  class="resize-handle se"
                  @mousedown="startResize(component, 'se', $event)"
                />
              </div>
            </div>

            <!-- 组件标签 -->
            <div class="component-label">
              <span class="label-text">{{ component.name || component.type }}</span>
            </div>
          </div>

          <!-- 对齐辅助线 -->
          <div
            v-for="guideLine in guideLines"
            :key="guideLine.id"
            class="guide-line"
            :class="guideLine.type"
            :style="guideLine.style"
          />
        </div>

        <!-- 预览模式画布 -->
        <div
          v-else-if="canvasMode === 'preview'"
          class="preview-canvas"
          :class="getDeviceClass()"
        >
          <iframe
            ref="previewIframeRef"
            :src="previewUrl"
            class="preview-iframe"
            @load="handlePreviewLoad"
          />
        </div>

        <!-- 代码模式画布 -->
        <div
          v-else-if="canvasMode === 'code'"
          class="code-canvas"
        >
          <div class="code-editor">
            <div class="code-tabs">
              <el-tabs
                v-model="activeCodeTab"
                type="card"
              >
                <el-tab-pane
                  label="Vue模板"
                  name="template"
                >
                  <div class="code-content">
                    <pre class="code-block">{{ generatedTemplate }}</pre>
                  </div>
                </el-tab-pane>
                <el-tab-pane
                  label="JavaScript"
                  name="script"
                >
                  <div class="code-content">
                    <pre class="code-block">{{ generatedScript }}</pre>
                  </div>
                </el-tab-pane>
                <el-tab-pane
                  label="CSS样式"
                  name="style"
                >
                  <div class="code-content">
                    <pre class="code-block">{{ generatedStyle }}</pre>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </div>
      </div>

      <!-- 画布状态栏 -->
      <div class="canvas-statusbar">
        <div class="status-left">
          <span class="status-info">组件: {{ components.length }}个</span>
          <el-divider direction="vertical" />
          <span class="status-info">选中: {{ selectedComponent?.name || '无' }}</span>
          <el-divider direction="vertical" />
          <span class="status-info">尺寸: {{ canvasSize.width }}×{{ canvasSize.height }}</span>
        </div>
        <div class="status-right">
          <span class="zoom-info">缩放: {{ Math.round(zoomLevel * 100) }}%</span>
          <el-slider
            v-model="zoomLevel"
            :min="0.25"
            :max="2"
            :step="0.25"
            :show-tooltip="false"
            style="width: 100px; margin: 0 8px"
          />
          <el-button-group size="small">
            <el-button
              icon="el-icon-zoom-out"
              @click="zoomOut"
            />
            <el-button
              @click="resetZoom"
            >
              100%
            </el-button>
            <el-button
              icon="el-icon-zoom-in"
              @click="zoomIn"
            />
          </el-button-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { 
  CanvasComponent,
  GuideLine,
  CanvasHistory,
  DeviceType,
  CanvasMode,
  MoveDirection,
  ResizeDirection,
  VisualDesignCanvasProps
} from '@smartabp/lowcode-designer/types'

// Props定义
defineProps<VisualDesignCanvasProps>()

// 响应式数据 - 完整类型安全
const canvasMode = ref<CanvasMode>('design')
const previewDevice = ref<DeviceType>('desktop')
const selectedComponent = ref<CanvasComponent | null>(null)
const hoverComponent = ref<CanvasComponent | null>(null)
const zoomLevel = ref(1)
const activeCodeTab = ref('template')
const components = ref<CanvasComponent[]>([])
const guideLines = ref<GuideLine[]>([])
const history = ref<CanvasHistory[]>([])
const historyIndex = ref(0)

// 画布状态 - 去除重复定义
const canvasSize = ref({ width: 1200, height: 800 })
const isDraggingOver = ref(false)
// 网格配置 - 暂时注释避免未使用警告
// const showGrid = ref(true)
// const gridSize = ref(20)
const maxHistorySize = 50

// 计算属性
const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

const previewUrl = computed(() => {
  // 生成预览URL，包含当前组件数据
  const data = encodeURIComponent(JSON.stringify({
    components: components.value,
    device: previewDevice.value
  }))
  return `/api/preview/page?data=${data}`
})

const generatedTemplate = computed(() => {
  return generateVueTemplate()
})

const generatedScript = computed(() => {
  return generateVueScript()
})

const generatedStyle = computed(() => {
  return generateVueStyle()
})

// 方法
const setCanvasMode = (mode: CanvasMode) => {
  canvasMode.value = mode

  if (mode === 'preview') {
    // 切换到预览模式时，生成预览数据
    generatePreview()
  }
}

const getCanvasClass = () => {
  return [
    `canvas-${canvasMode.value}`,
    { 'dragging-over': isDraggingOver.value }
  ]
}

const getDeviceClass = () => {
  return `device-${previewDevice.value}`
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDraggingOver.value = false

  try {
    const dragData = JSON.parse(event.dataTransfer?.getData('text/plain') || '{}')

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

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  isDraggingOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  // 只有当离开整个画布区域时才取消拖拽状态
  if (event.currentTarget && (event.currentTarget as Element).contains && !(event.currentTarget as Element).contains(event.relatedTarget as Node)) {
    isDraggingOver.value = false
  }
}

const addComponentToCanvas = (componentTemplate: any, position: any) => {
  const newComponent = {
    id: `component-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: componentTemplate.tag,
    name: componentTemplate.name,
    props: { ...componentTemplate.props },
    style: {
      position: 'absolute' as const,
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

const getDefaultWidth = (componentType: string) => {
  const widthMap: Record<string, string> = {
    'el-button': '80px',
    'el-input': '200px',
    'el-select': '200px',
    'el-table': '100%',
    'el-card': '300px',
    'el-image': '200px'
  }
  return widthMap[componentType] || '200px'
}

const getDefaultHeight = (componentType: string) => {
  const heightMap: Record<string, string> = {
    'el-button': '32px',
    'el-input': '32px',
    'el-select': '32px',
    'el-table': '300px',
    'el-card': '200px',
    'el-image': '150px'
  }
  return heightMap[componentType] || 'auto'
}

const selectComponent = (component: CanvasComponent) => {
  selectedComponent.value = component
  emit('component-selected', component)
}

const moveComponent = (index: number, direction: MoveDirection) => {
  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex >= 0 && newIndex < components.value.length) {
    const temp = components.value[index]
    components.value[index] = components.value[newIndex]
    components.value[newIndex] = temp

    saveToHistory()
  }
}

const duplicateComponent = (component: CanvasComponent) => {
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

const deleteComponent = (component: CanvasComponent) => {
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

const getComponentStyle = (component: CanvasComponent) => {
  return {
    ...component.style,
    transform: `scale(${zoomLevel.value})`,
    transformOrigin: 'top left'
  }
}

const getComponentRenderer = (component: CanvasComponent) => {
  // 根据组件类型返回对应的渲染器
  const rendererMap: Record<string, string> = {
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

const startResize = (component: CanvasComponent, direction: ResizeDirection, event: MouseEvent) => {
  event.stopPropagation()

  const startX = event.clientX
  const startY = event.clientY
  const startWidth = parseInt(component.style.width)
  const startHeight = parseInt(component.style.height)
  const startLeft = parseInt(component.style.left)
  const startTop = parseInt(component.style.top)

  const handleMouseMove = (moveEvent: MouseEvent) => {
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

const showAlignmentGuides = (movingComponent: CanvasComponent) => {
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

const addGuideLine = (type: 'vertical' | 'horizontal', position: number) => {
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
      style: { position: 'absolute' as const, left: '20px', top: '20px', width: 'calc(100% - 40px)', height: '60px' },
      props: { gutter: 20 },
      children: []
    },
    {
      id: 'content-card',
      type: 'el-card',
      name: '内容区域',
      style: { position: 'absolute' as const, left: '20px', top: '100px', width: 'calc(100% - 40px)', height: '500px' },
      props: { header: '内容标题' },
      children: []
    },
    {
      id: 'action-buttons',
      type: 'el-row',
      name: '操作按钮',
      style: { position: 'absolute' as const, left: '20px', top: 'auto', bottom: '20px', width: 'calc(100% - 40px)', height: '40px' },
      props: { justify: 'end' },
      children: []
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
  const scriptContent = [
    '<script setup lang="ts">',
    'import { ref, reactive } from \'vue\'',
    '',
    '// 响应式数据',
    'const formData = reactive({',
    '  // 表单数据',
    '})',
    '',
    'const loading = ref(false)',
    '',
    '// 方法',
    'const handleSubmit = () => {',
    '  console.log(\'表单提交:\', formData)',
    '}',
    '',
    'const handleReset = () => {',
    '  Object.keys(formData).forEach(key => {',
    '    formData[key] = \'\'',
    '  })',
    '}',
    '</' + 'script>'
  ].join('\n')

  return scriptContent
}

const generateVueStyle = () => {
  const componentStyles = components.value.map(component =>
    '.' + component.type + ' {\n  /* ' + component.name + ' 样式 */\n}'
  ).join('\n')

  const styleContent = [
    '/* 页面容器样式 */',
    '.page-container {',
    '  padding: 20px;',
    '  background: var(--el-bg-color-page);',
    '  min-height: 100vh;',
    '}',
    '',
    '/* 组件样式 */',
    componentStyles,
    '',
    '/* 响应式设计 */',
    '@media (max-width: 768px) {',
    '  .page-container {',
    '    padding: 12px;',
    '  }',
    '}'
  ].join('\n')

  return styleContent
}

// Emits
const emit = defineEmits<{
  'component-added': [component: any]
  'component-selected': [component: any]
  'component-updated': [component: any]
  'component-deleted': [component: any]
  'preview-generated': [data: any]
}>()

// 引用
const designCanvasRef = ref()
const previewIframeRef = ref()

// 初始化历史记录
saveToHistory()
</script>

<style scoped>
.visual-design-canvas {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-page);
}

.canvas-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 画布工具栏样式 */
.canvas-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.device-selector {
  display: flex;
  align-items: center;
}

/* 画布工作区样式 */
.canvas-workspace {
  flex: 1;
  position: relative;
  overflow: auto;
  background: #f5f7fa;
}

.canvas-workspace.canvas-design {
  background:
    linear-gradient(90deg, rgba(0,0,0,.03) 1px, transparent 1px),
    linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px);
  background-size: 20px 20px;
}

.canvas-workspace.dragging-over {
  background-color: var(--el-color-primary-light-9);
}

/* 设计画布样式 */
.design-canvas {
  min-height: 100%;
  position: relative;
  margin: 20px auto;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.design-canvas.device-desktop {
  width: 1200px;
  min-height: 800px;
}

.design-canvas.device-tablet {
  width: 768px;
  min-height: 1024px;
}

.design-canvas.device-mobile {
  width: 375px;
  min-height: 667px;
}

/* 拖拽提示样式 */
.drop-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--el-text-color-secondary);
}

.hint-content i {
  font-size: 48px;
  color: var(--el-border-color);
  margin-bottom: 16px;
}

.hint-content h3 {
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.hint-content p {
  margin: 0 0 20px 0;
  color: var(--el-text-color-secondary);
}

.quick-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 组件样式 */
.canvas-component {
  position: absolute;
  cursor: pointer;
  transition: all 0.2s ease;
}

.canvas-component.selected {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}

.canvas-component.hover {
  outline: 1px dashed var(--el-color-primary-light-5);
  outline-offset: 1px;
}

.rendered-component {
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* 组件工具样式 */
.component-tools {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 10;
}

.tools-bar {
  background: white;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 尺寸调整手柄样式 */
.resize-handles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--el-color-primary);
  border: 1px solid white;
  border-radius: 50%;
  pointer-events: all;
  cursor: nw-resize;
}

.resize-handle.nw {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}

.resize-handle.ne {
  top: -4px;
  right: -4px;
  cursor: ne-resize;
}

.resize-handle.sw {
  bottom: -4px;
  left: -4px;
  cursor: sw-resize;
}

.resize-handle.se {
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
}

/* 组件标签样式 */
.component-label {
  position: absolute;
  top: 2px;
  left: 2px;
  background: var(--el-color-primary);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.canvas-component:hover .component-label,
.canvas-component.selected .component-label {
  opacity: 1;
}

/* 对齐辅助线样式 */
.guide-line {
  position: absolute;
  background: var(--el-color-primary);
  opacity: 0.6;
  z-index: 5;
  pointer-events: none;
}

.guide-line.vertical {
  width: 1px;
  height: 100%;
}

.guide-line.horizontal {
  width: 100%;
  height: 1px;
}

/* 预览画布样式 */
.preview-canvas {
  margin: 20px auto;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.preview-canvas.device-desktop {
  width: 1200px;
  height: 800px;
}

.preview-canvas.device-tablet {
  width: 768px;
  height: 1024px;
}

.preview-canvas.device-mobile {
  width: 375px;
  height: 667px;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* 代码画布样式 */
.code-canvas {
  padding: 20px;
  height: 100%;
}

.code-editor {
  height: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.code-content {
  height: calc(100% - 40px);
  overflow: auto;
  padding: 16px;
}

.code-block {
  margin: 0;
  font-family: var(--el-font-family-mono, Consolas, monospace);
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color-page);
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
}

/* 状态栏样式 */
.canvas-statusbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: white;
  border-top: 1px solid var(--el-border-color-lighter);
  font-size: 12px;
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-info {
  color: var(--el-text-color-secondary);
}

.zoom-info {
  color: var(--el-text-color-secondary);
  min-width: 60px;
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .design-canvas.device-desktop {
    width: 1000px;
  }
}

@media (max-width: 1200px) {
  .design-canvas.device-desktop {
    width: 900px;
  }

  .canvas-toolbar {
    flex-wrap: wrap;
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .canvas-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    justify-content: center;
  }

  .canvas-statusbar {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
