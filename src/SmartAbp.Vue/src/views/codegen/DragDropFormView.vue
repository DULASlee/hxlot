<!--
  拖拽表单开发器
  支持拖拽组件、实时预览、代码生成
-->
<template>
  <div class="drag-drop-form-view">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-mouse-pointer" />
        拖拽表单开发器
      </h1>
      <p class="page-description">
        可视化表单设计器，支持拖拽组件、实时预览和代码生成
      </p>
    </div>

    <div class="form-designer">
      <!-- 组件面板 -->
      <div class="component-panel">
        <div class="panel-header">
          <h2 class="panel-title">
            <i class="fas fa-puzzle-piece" />
            组件库
          </h2>
          <div class="panel-actions">
            <button
              class="action-btn"
              title="折叠所有"
              @click="collapseAllGroups"
            >
              <i class="fas fa-compress" />
            </button>
            <button
              class="action-btn"
              title="展开所有"
              @click="expandAllGroups"
            >
              <i class="fas fa-expand" />
            </button>
          </div>
        </div>

        <div class="component-groups">
          <div
            v-for="group in componentGroups"
            :key="group.key"
            class="component-group"
            :class="{ collapsed: group.collapsed }"
          >
            <div
              class="group-header"
              @click="toggleGroup(group.key)"
            >
              <i
                class="group-icon"
                :class="group.icon"
              />
              <span class="group-title">{{ group.title }}</span>
              <i class="toggle-icon fas fa-chevron-down" />
            </div>

            <div class="group-content">
              <div
                v-for="component in group.components"
                :key="component.type"
                class="component-item"
                :draggable="true"
                @dragstart="onComponentDragStart($event, component)"
                @dragend="onComponentDragEnd"
              >
                <div class="component-icon">
                  <i :class="component.icon" />
                </div>
                <div class="component-info">
                  <span class="component-name">{{ component.name }}</span>
                  <span class="component-desc">{{ component.description }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 设计画布 -->
      <div class="design-canvas">
        <div class="canvas-header">
          <h2 class="canvas-title">
            <i class="fas fa-drafting-compass" />
            设计画布
          </h2>
          <div class="canvas-actions">
            <div class="zoom-controls">
              <button
                class="zoom-btn"
                :disabled="zoom <= 0.5"
                @click="zoomOut"
              >
                <i class="fas fa-search-minus" />
              </button>
              <span class="zoom-display">{{ Math.round(zoom * 100) }}%</span>
              <button
                class="zoom-btn"
                :disabled="zoom >= 2"
                @click="zoomIn"
              >
                <i class="fas fa-search-plus" />
              </button>
            </div>
            <button
              class="action-btn"
              @click="resetZoom"
            >
              <i class="fas fa-expand-arrows-alt" />
              重置
            </button>
            <button
              class="action-btn danger"
              @click="clearCanvas"
            >
              <i class="fas fa-trash" />
              清空
            </button>
          </div>
        </div>

        <div
          class="canvas-container"
          :style="{ transform: `scale(${zoom})` }"
        >
          <div
            class="form-canvas"
            @dragover.prevent="onCanvasDragOver"
            @drop="onCanvasDrop"
            @click="clearSelection"
          >
            <div
              v-if="formComponents.length === 0"
              class="canvas-placeholder"
            >
              <i class="fas fa-hand-point-up" />
              <p>从左侧拖拽组件到这里开始设计表单</p>
            </div>

            <div
              v-for="(component, index) in formComponents"
              :key="component.id"
              class="form-component"
              :class="{
                selected: selectedComponentId === component.id,
                hover: hoverComponentId === component.id
              }"
              @click.stop="selectComponent(component.id)"
              @mouseenter="hoverComponentId = component.id"
              @mouseleave="hoverComponentId = null"
            >
              <!-- 组件操作按钮 -->
              <div
                v-if="selectedComponentId === component.id"
                class="component-actions"
              >
                <button
                  class="move-btn"
                  :disabled="index === 0"
                  @click.stop="moveComponentUp(index)"
                >
                  <i class="fas fa-arrow-up" />
                </button>
                <button
                  class="move-btn"
                  :disabled="index === formComponents.length - 1"
                  @click.stop="moveComponentDown(index)"
                >
                  <i class="fas fa-arrow-down" />
                </button>
                <button
                  class="duplicate-btn"
                  @click.stop="duplicateComponent(index)"
                >
                  <i class="fas fa-copy" />
                </button>
                <button
                  class="remove-btn"
                  @click.stop="removeComponent(index)"
                >
                  <i class="fas fa-times" />
                </button>
              </div>

              <!-- 渲染表单组件 -->
              <component
                :is="getComponentRenderer(component.type)"
                v-bind="component.props"
                :model-value="getComponentValue(component.id)"
                @update:model-value="updateComponentValue(component.id, $event)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 属性面板 -->
      <div class="property-panel">
        <div class="panel-header">
          <h2 class="panel-title">
            <i class="fas fa-cog" />
            {{ selectedComponent ? '组件属性' : '表单属性' }}
          </h2>
          <div
            v-if="selectedComponent"
            class="panel-actions"
          >
            <button
              class="action-btn"
              title="重置属性"
              @click="resetComponentProps"
            >
              <i class="fas fa-undo" />
            </button>
          </div>
        </div>

        <div class="property-content">
          <!-- 表单整体属性 -->
          <div
            v-if="!selectedComponent"
            class="form-properties"
          >
            <div class="property-group">
              <h3>基础设置</h3>
              <div class="property-item">
                <label>表单名称</label>
                <input
                  v-model="formConfig.name"
                  type="text"
                  class="prop-input"
                >
              </div>
              <div class="property-item">
                <label>表单描述</label>
                <textarea
                  v-model="formConfig.description"
                  class="prop-textarea"
                  rows="3"
                />
              </div>
              <div class="property-item">
                <label>标签宽度</label>
                <input
                  v-model="formConfig.labelWidth"
                  type="text"
                  class="prop-input"
                  placeholder="120px"
                >
              </div>
            </div>

            <div class="property-group">
              <h3>布局设置</h3>
              <div class="property-item">
                <label>表单大小</label>
                <select
                  v-model="formConfig.size"
                  class="prop-select"
                >
                  <option value="large">
                    大
                  </option>
                  <option value="default">
                    默认
                  </option>
                  <option value="small">
                    小
                  </option>
                </select>
              </div>
              <div class="property-item">
                <label>内联表单</label>
                <input
                  v-model="formConfig.inline"
                  type="checkbox"
                  class="prop-checkbox"
                >
              </div>
              <div class="property-item">
                <label>禁用表单</label>
                <input
                  v-model="formConfig.disabled"
                  type="checkbox"
                  class="prop-checkbox"
                >
              </div>
            </div>
          </div>

          <!-- 组件属性 -->
          <div
            v-else
            class="component-properties"
          >
            <div class="property-group">
              <h3>基础属性</h3>
              <div class="property-item">
                <label>字段名称</label>
                <input
                  v-model="selectedComponent.props.name"
                  type="text"
                  class="prop-input"
                >
              </div>
              <div class="property-item">
                <label>字段标签</label>
                <input
                  v-model="selectedComponent.props.label"
                  type="text"
                  class="prop-input"
                >
              </div>
              <div class="property-item">
                <label>占位符</label>
                <input
                  v-model="selectedComponent.props.placeholder"
                  type="text"
                  class="prop-input"
                >
              </div>
            </div>

            <div class="property-group">
              <h3>验证规则</h3>
              <div class="property-item">
                <label>必填字段</label>
                <input
                  v-model="selectedComponent.props.required"
                  type="checkbox"
                  class="prop-checkbox"
                >
              </div>
              <div
                v-if="selectedComponent.type === 'input'"
                class="property-item"
              >
                <label>最小长度</label>
                <input
                  v-model.number="selectedComponent.props.minLength"
                  type="number"
                  class="prop-input"
                >
              </div>
              <div
                v-if="selectedComponent.type === 'input'"
                class="property-item"
              >
                <label>最大长度</label>
                <input
                  v-model.number="selectedComponent.props.maxLength"
                  type="number"
                  class="prop-input"
                >
              </div>
            </div>

            <div
              v-if="selectedComponent.type === 'select'"
              class="property-group"
            >
              <h3>选项设置</h3>
              <div class="options-editor">
                <div
                  v-for="(option, index) in selectedComponent.props.options"
                  :key="index"
                  class="option-item"
                >
                  <input
                    v-model="option.label"
                    type="text"
                    placeholder="标签"
                    class="option-input"
                  >
                  <input
                    v-model="option.value"
                    type="text"
                    placeholder="值"
                    class="option-input"
                  >
                  <button
                    class="remove-option-btn"
                    @click="removeOption(index)"
                  >
                    <i class="fas fa-times" />
                  </button>
                </div>
                <button
                  class="add-option-btn"
                  @click="addOption"
                >
                  <i class="fas fa-plus" />
                  添加选项
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-toolbar">
      <div class="toolbar-left">
        <button
          class="toolbar-btn primary"
          @click="showPreview = true"
        >
          <i class="fas fa-eye" />
          预览表单
        </button>
        <button
          class="toolbar-btn secondary"
          @click="generateCode"
        >
          <i class="fas fa-code" />
          生成代码
        </button>
        <button
          class="toolbar-btn secondary"
          @click="exportForm"
        >
          <i class="fas fa-download" />
          导出配置
        </button>
      </div>

      <div class="toolbar-right">
        <button
          class="toolbar-btn secondary"
          @click="importForm"
        >
          <i class="fas fa-upload" />
          导入配置
        </button>
        <button
          class="toolbar-btn success"
          @click="saveForm"
        >
          <i class="fas fa-save" />
          保存表单
        </button>
      </div>
    </div>

    <!-- 预览模态框 -->
    <div
      v-if="showPreview"
      class="preview-modal"
      @click="showPreview = false"
    >
      <div
        class="preview-content"
        @click.stop
      >
        <div class="preview-header">
          <h3>表单预览</h3>
          <button
            class="close-btn"
            @click="showPreview = false"
          >
            <i class="fas fa-times" />
          </button>
        </div>

        <div class="preview-form">
          <form
            class="generated-form"
            @submit.prevent="handlePreviewSubmit"
          >
            <component
              :is="getComponentRenderer(component.type)"
              v-for="component in formComponents"
              :key="component.id"
              v-bind="component.props"
              :model-value="getComponentValue(component.id)"
              @update:model-value="updateComponentValue(component.id, $event)"
            />

            <div class="form-actions">
              <button
                type="submit"
                class="submit-btn"
              >
                提交
              </button>
              <button
                type="reset"
                class="reset-btn"
                @click="resetForm"
              >
                重置
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileImport"
    >
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { logger } from '@/utils/logging'

// 组件日志器
const componentLogger = logger.child({ component: 'DragDropFormView' })

// 组件库定义
const componentGroups = ref([
  {
    key: 'basic',
    title: '基础组件',
    icon: 'fas fa-cube',
    collapsed: false,
    components: [
      { type: 'input', name: '文本输入', description: '单行文本输入框', icon: 'fas fa-edit' },
      { type: 'textarea', name: '文本域', description: '多行文本输入框', icon: 'fas fa-align-left' },
      { type: 'number', name: '数字输入', description: '数字输入框', icon: 'fas fa-calculator' },
      { type: 'select', name: '选择器', description: '下拉选择框', icon: 'fas fa-caret-down' },
      { type: 'radio', name: '单选框', description: '单选按钮组', icon: 'fas fa-dot-circle' },
      { type: 'checkbox', name: '复选框', description: '复选框组', icon: 'fas fa-check-square' }
    ]
  },
  {
    key: 'advanced',
    title: '高级组件',
    icon: 'fas fa-star',
    collapsed: false,
    components: [
      { type: 'date', name: '日期选择', description: '日期选择器', icon: 'fas fa-calendar' },
      { type: 'time', name: '时间选择', description: '时间选择器', icon: 'fas fa-clock' },
      { type: 'upload', name: '文件上传', description: '文件上传组件', icon: 'fas fa-cloud-upload-alt' },
      { type: 'switch', name: '开关', description: '开关切换', icon: 'fas fa-toggle-on' },
      { type: 'rate', name: '评分', description: '评分组件', icon: 'fas fa-star' },
      { type: 'slider', name: '滑块', description: '数值滑块', icon: 'fas fa-sliders-h' }
    ]
  }
])

// 表单状态
const formConfig = ref({
  name: '未命名表单',
  description: '',
  labelWidth: '120px',
  size: 'default',
  inline: false,
  disabled: false
})

const formComponents = ref<any[]>([])
const formData = ref<Record<string, any>>({})
const selectedComponentId = ref<string | null>(null)
const hoverComponentId = ref<string | null>(null)
const draggedComponent = ref<any>(null)

// UI状态
const zoom = ref(1)
const showPreview = ref(false)

// 计算属性
const selectedComponent = computed(() => {
  return formComponents.value.find(c => c.id === selectedComponentId.value)
})

// 文件输入引用
const fileInput = ref<HTMLInputElement>()

// 方法定义
const toggleGroup = (groupKey: string) => {
  const group = componentGroups.value.find(g => g.key === groupKey)
  if (group) {
    group.collapsed = !group.collapsed
  }
}

const collapseAllGroups = () => {
  componentGroups.value.forEach(group => {
    group.collapsed = true
  })
}

const expandAllGroups = () => {
  componentGroups.value.forEach(group => {
    group.collapsed = false
  })
}

const onComponentDragStart = (event: DragEvent, component: any) => {
  draggedComponent.value = component
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
  }
  componentLogger.info('开始拖拽组件', { type: component.type })
}

const onComponentDragEnd = () => {
  draggedComponent.value = null
}

const onCanvasDragOver = (event: DragEvent) => {
  if (draggedComponent.value) {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy'
    }
  }
}

const onCanvasDrop = (event: DragEvent) => {
  event.preventDefault()

  if (draggedComponent.value) {
    const newComponent = createFormComponent(draggedComponent.value)
    formComponents.value.push(newComponent)

    // 初始化表单数据
    formData.value[newComponent.id] = getDefaultValue(newComponent.type)

    componentLogger.info('添加表单组件', {
      type: newComponent.type,
      id: newComponent.id,
      totalComponents: formComponents.value.length
    })

    draggedComponent.value = null
  }
}

const createFormComponent = (componentDef: any) => {
  const id = `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const defaultProps = getDefaultProps(componentDef.type)

  return {
    id,
    type: componentDef.type,
    props: {
      ...defaultProps,
      name: id,
      label: componentDef.name
    }
  }
}

const getDefaultProps = (type: string) => {
  const baseProps = {
    name: '',
    label: '',
    placeholder: '',
    required: false
  }

  switch (type) {
    case 'input':
      return { ...baseProps, minLength: 0, maxLength: 100 }
    case 'textarea':
      return { ...baseProps, rows: 3 }
    case 'number':
      return { ...baseProps, min: 0, max: 100, step: 1 }
    case 'select':
      return { ...baseProps, options: [{ label: '选项1', value: 'option1' }], multiple: false }
    case 'radio':
    case 'checkbox':
      return { ...baseProps, options: [{ label: '选项1', value: 'option1' }] }
    case 'switch':
      return { ...baseProps, checkedText: '是', uncheckedText: '否' }
    case 'rate':
      return { ...baseProps, max: 5, allowHalf: false }
    case 'slider':
      return { ...baseProps, min: 0, max: 100, step: 1 }
    default:
      return baseProps
  }
}

const getDefaultValue = (type: string) => {
  switch (type) {
    case 'checkbox':
      return []
    case 'switch':
      return false
    case 'rate':
      return 0
    case 'number':
    case 'slider':
      return 0
    default:
      return ''
  }
}

const getComponentRenderer = (type: string) => {
  // 这里返回实际的渲染组件名
  // 在真实项目中应该返回对应的Vue组件

  // 根据组件类型返回不同的渲染器
  switch (type) {
    case 'input':
    case 'textarea':
    case 'number':
      return 'input'
    case 'select':
      return 'select'
    case 'checkbox':
    case 'radio':
      return 'label'
    default:
      return 'div'
  }
}

const getComponentValue = (componentId: string) => {
  return formData.value[componentId]
}

const updateComponentValue = (componentId: string, value: any) => {
  formData.value[componentId] = value
}

const selectComponent = (componentId: string) => {
  selectedComponentId.value = componentId
  componentLogger.info('选择组件', { componentId })
}

const clearSelection = () => {
  selectedComponentId.value = null
}

const moveComponentUp = (index: number) => {
  if (index > 0) {
    const component = formComponents.value.splice(index, 1)[0]
    formComponents.value.splice(index - 1, 0, component)
  }
}

const moveComponentDown = (index: number) => {
  if (index < formComponents.value.length - 1) {
    const component = formComponents.value.splice(index, 1)[0]
    formComponents.value.splice(index + 1, 0, component)
  }
}

const duplicateComponent = (index: number) => {
  const original = formComponents.value[index]
  const duplicate = {
    ...original,
    id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    props: { ...original.props, name: `${original.props.name}_copy` }
  }

  formComponents.value.splice(index + 1, 0, duplicate)
  formData.value[duplicate.id] = getDefaultValue(duplicate.type)

  componentLogger.info('复制组件', { originalId: original.id, duplicateId: duplicate.id })
}

const removeComponent = (index: number) => {
  const component = formComponents.value[index]
  formComponents.value.splice(index, 1)
  delete formData.value[component.id]

  if (selectedComponentId.value === component.id) {
    selectedComponentId.value = null
  }

  componentLogger.info('删除组件', { componentId: component.id })
}

const resetComponentProps = () => {
  if (selectedComponent.value) {
    selectedComponent.value.props = getDefaultProps(selectedComponent.value.type)
    componentLogger.info('重置组件属性', { componentId: selectedComponent.value.id })
  }
}

const addOption = () => {
  if (selectedComponent.value && selectedComponent.value.props.options) {
    selectedComponent.value.props.options.push({
      label: `选项${selectedComponent.value.props.options.length + 1}`,
      value: `option${selectedComponent.value.props.options.length + 1}`
    })
  }
}

const removeOption = (index: number) => {
  if (selectedComponent.value && selectedComponent.value.props.options) {
    selectedComponent.value.props.options.splice(index, 1)
  }
}

// 画布操作
const zoomIn = () => {
  zoom.value = Math.min(zoom.value + 0.1, 2)
}

const zoomOut = () => {
  zoom.value = Math.max(zoom.value - 0.1, 0.5)
}

const resetZoom = () => {
  zoom.value = 1
}

const clearCanvas = () => {
  if (confirm('确定要清空画布吗？此操作不可恢复。')) {
    formComponents.value = []
    formData.value = {}
    selectedComponentId.value = null
    componentLogger.info('清空画布')
  }
}

// 表单操作
const handlePreviewSubmit = () => {
  console.log('表单提交:', formData.value)
  componentLogger.info('预览表单提交', { formData: formData.value })
}

const resetForm = () => {
  Object.keys(formData.value).forEach(key => {
    const component = formComponents.value.find(c => c.id === key)
    if (component) {
      formData.value[key] = getDefaultValue(component.type)
    }
  })
  componentLogger.info('重置表单数据')
}

const generateCode = () => {
  const formSchema = {
    config: formConfig.value,
    components: formComponents.value,
    data: formData.value
  }

  // 这里应该调用低代码引擎生成Vue组件代码
  console.log('生成代码:', formSchema)
  componentLogger.info('生成表单代码', { componentCount: formComponents.value.length })

  // 模拟代码生成结果
  alert('代码生成功能开发中...')
}

const exportForm = () => {
  try {
    const formSchema = {
      config: formConfig.value,
      components: formComponents.value,
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(formSchema, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${formConfig.value.name.replace(/\s+/g, '_')}_form_schema.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    componentLogger.info('导出表单配置', { componentCount: formComponents.value.length })
  } catch (error) {
    componentLogger.error('导出表单配置失败', error as Error)
  }
}

const importForm = () => {
  fileInput.value?.click()
}

const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string
        const formSchema = JSON.parse(result)

        if (formSchema.config && formSchema.components) {
          formConfig.value = formSchema.config
          formComponents.value = formSchema.components

          // 重新初始化表单数据
          formData.value = {}
          formComponents.value.forEach(component => {
            formData.value[component.id] = getDefaultValue(component.type)
          })

          selectedComponentId.value = null
          componentLogger.info('导入表单配置成功', { componentCount: formComponents.value.length })
        } else {
          throw new Error('无效的表单配置文件')
        }
      } catch (error) {
        componentLogger.error('导入表单配置失败', error as Error)
        alert('导入失败：文件格式不正确')
      }
    }
    reader.readAsText(file)
  }

  // 清空文件选择
  target.value = ''
}

const saveForm = () => {
  // 这里应该调用API保存表单配置
  componentLogger.info('保存表单', {
    name: formConfig.value.name,
    componentCount: formComponents.value.length
  })
  alert('保存功能开发中...')
}

// 生命周期
onMounted(() => {
  componentLogger.info('拖拽表单开发器加载完成')
})
</script>

<style scoped>
.drag-drop-form-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--theme-bg-base);
}

.page-header {
  padding: var(--spacing-6) var(--spacing-6) 0;
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--theme-text-primary);
  margin: 0 0 var(--spacing-2) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.page-title i {
  color: var(--theme-brand-primary);
}

.page-description {
  color: var(--theme-text-secondary);
  margin: 0;
}

/* 表单设计器布局 */
.form-designer {
  flex: 1;
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 1px;
  margin: var(--spacing-6) var(--spacing-6) 0;
  overflow: hidden;
}

/* 组件面板 */
.component-panel {
  background: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--theme-border-base);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.panel-actions {
  display: flex;
  gap: var(--spacing-1);
}

.action-btn {
  padding: var(--spacing-1) var(--spacing-2);
  background: transparent;
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--theme-text-secondary);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--theme-bg-hover);
  color: var(--theme-text-primary);
}

.component-groups {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-2);
}

.component-group {
  margin-bottom: var(--spacing-3);
}

.group-header {
  display: flex;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--theme-bg-base);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s ease;
}

.group-header:hover {
  background: var(--theme-bg-hover);
}

.group-icon {
  font-size: var(--font-size-sm);
  color: var(--theme-brand-primary);
  margin-right: var(--spacing-2);
}

.group-title {
  flex: 1;
  font-weight: var(--font-weight-medium);
  color: var(--theme-text-primary);
}

.toggle-icon {
  font-size: var(--font-size-xs);
  color: var(--theme-text-tertiary);
  transition: transform 0.2s ease;
}

.component-group.collapsed .toggle-icon {
  transform: rotate(-90deg);
}

.group-content {
  max-height: 500px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.component-group.collapsed .group-content {
  max-height: 0;
}

.component-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-3);
  margin: var(--spacing-2) 0;
  background: var(--theme-bg-base);
  border: 1px solid var(--theme-border-light);
  border-radius: var(--radius-md);
  cursor: grab;
  transition: all 0.2s ease;
}

.component-item:hover {
  background: var(--theme-bg-hover);
  border-color: var(--theme-brand-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.component-item:active {
  cursor: grabbing;
}

.component-icon {
  font-size: var(--font-size-lg);
  color: var(--theme-brand-primary);
  margin-right: var(--spacing-3);
  width: 20px;
  text-align: center;
}

.component-info {
  flex: 1;
}

.component-name {
  display: block;
  font-weight: var(--font-weight-medium);
  color: var(--theme-text-primary);
  margin-bottom: var(--spacing-1);
}

.component-desc {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--theme-text-secondary);
}

/* 设计画布 */
.design-canvas {
  background: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.canvas-header {
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--theme-border-base);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.canvas-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.canvas-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.zoom-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-text-secondary);
}

.zoom-btn:hover:not(:disabled) {
  background: var(--theme-bg-hover);
  color: var(--theme-text-primary);
}

.zoom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-display {
  padding: 0 var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--theme-text-primary);
  min-width: 50px;
  text-align: center;
}

.action-btn.danger {
  color: var(--theme-error);
  border-color: var(--theme-error);
}

.action-btn.danger:hover {
  background: var(--theme-error);
  color: var(--theme-text-inverse);
}

.canvas-container {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-4);
  transform-origin: top left;
  transition: transform 0.2s ease;
}

.form-canvas {
  min-height: 400px;
  background: var(--theme-bg-base);
  border: 2px dashed var(--theme-border-light);
  border-radius: var(--radius-lg);
  position: relative;
  padding: var(--spacing-4);
}

.canvas-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: var(--theme-text-tertiary);
  text-align: center;
}

.canvas-placeholder i {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-4);
}

/* 表单组件 */
.form-component {
  position: relative;
  margin-bottom: var(--spacing-4);
  padding: var(--spacing-3);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.form-component.hover {
  border-color: var(--theme-brand-primary-light);
  background: var(--theme-brand-bg);
}

.form-component.selected {
  border-color: var(--theme-brand-primary);
  background: var(--theme-brand-bg);
}

.component-actions {
  position: absolute;
  top: -15px;
  right: -15px;
  display: flex;
  gap: var(--spacing-1);
  z-index: 10;
}

.move-btn, .duplicate-btn, .remove-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.move-btn {
  background: var(--theme-info);
  color: var(--theme-text-inverse);
}

.duplicate-btn {
  background: var(--theme-warning);
  color: var(--theme-text-inverse);
}

.remove-btn {
  background: var(--theme-error);
  color: var(--theme-text-inverse);
}

.move-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 属性面板 */
.property-panel {
  background: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
}

.property-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-4);
}

.property-group {
  margin-bottom: var(--spacing-6);
}

.property-group:last-child {
  margin-bottom: 0;
}

.property-group h3 {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-text-primary);
  margin: 0 0 var(--spacing-3) 0;
  text-transform: uppercase;
  border-bottom: 1px solid var(--theme-border-light);
  padding-bottom: var(--spacing-2);
}

.property-item {
  margin-bottom: var(--spacing-3);
}

.property-item label {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--theme-text-primary);
  margin-bottom: var(--spacing-1);
}

.prop-input, .prop-textarea, .prop-select {
  width: 100%;
  padding: var(--spacing-2);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-sm);
  background: var(--theme-bg-base);
  color: var(--theme-text-primary);
  font-size: var(--font-size-sm);
}

.prop-checkbox {
  width: auto;
  margin-right: var(--spacing-2);
}

.options-editor {
  display: grid;
  gap: var(--spacing-2);
}

.option-item {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
}

.option-input {
  flex: 1;
  padding: var(--spacing-2);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-sm);
  background: var(--theme-bg-base);
  color: var(--theme-text-primary);
  font-size: var(--font-size-sm);
}

.remove-option-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  background: var(--theme-error);
  color: var(--theme-text-inverse);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
}

.add-option-btn {
  padding: var(--spacing-2);
  background: var(--theme-success);
  color: var(--theme-text-inverse);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
}

/* 底部工具栏 */
.bottom-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4) var(--spacing-6);
  background: var(--theme-bg-component);
  border-top: 1px solid var(--theme-border-base);
}

.toolbar-left, .toolbar-right {
  display: flex;
  gap: var(--spacing-3);
}

.toolbar-btn {
  padding: var(--spacing-3) var(--spacing-4);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-weight: var(--font-weight-medium);
  transition: all 0.2s ease;
}

.toolbar-btn.primary {
  background: var(--theme-brand-primary);
  color: var(--theme-text-inverse);
}

.toolbar-btn.primary:hover {
  background: var(--theme-brand-primary-hover);
}

.toolbar-btn.secondary {
  background: var(--theme-bg-base);
  color: var(--theme-text-primary);
  border: 1px solid var(--theme-border-base);
}

.toolbar-btn.secondary:hover {
  background: var(--theme-bg-hover);
}

.toolbar-btn.success {
  background: var(--theme-success);
  color: var(--theme-text-inverse);
}

.toolbar-btn.success:hover {
  background: var(--theme-success-hover);
}

/* 预览模态框 */
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preview-content {
  background: var(--theme-bg-component);
  border-radius: var(--radius-lg);
  max-width: 800px;
  max-height: 80vh;
  width: 90%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid var(--theme-border-base);
}

.preview-header h3 {
  margin: 0;
  color: var(--theme-text-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-text-secondary);
}

.close-btn:hover {
  background: var(--theme-bg-hover);
  color: var(--theme-text-primary);
}

.preview-form {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-6);
}

.generated-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-actions {
  display: flex;
  gap: var(--spacing-3);
  justify-content: center;
  margin-top: var(--spacing-6);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--theme-border-base);
}

.submit-btn, .reset-btn {
  padding: var(--spacing-3) var(--spacing-6);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
}

.submit-btn {
  background: var(--theme-brand-primary);
  color: var(--theme-text-inverse);
}

.reset-btn {
  background: var(--theme-bg-base);
  color: var(--theme-text-primary);
  border: 1px solid var(--theme-border-base);
}

@media (max-width: 1200px) {
  .form-designer {
    grid-template-columns: 250px 1fr 280px;
  }
}

@media (max-width: 1024px) {
  .form-designer {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr;
  }

  .component-panel, .property-panel {
    max-height: 300px;
  }
}

@media (max-width: 768px) {
  .bottom-toolbar {
    flex-direction: column;
    gap: var(--spacing-3);
  }

  .toolbar-left, .toolbar-right {
    width: 100%;
    justify-content: center;
  }

  .preview-content {
    width: 95%;
    max-height: 90vh;
  }
}
</style>
