<template>
  <div class="property-inspector">
    <!-- 面板头部 -->
    <div class="inspector-header">
      <div
        v-if="selectedComponent"
        class="component-info"
      >
        <el-icon
          class="component-icon"
          :size="20"
        >
          <span>{{ getComponentIcon(selectedComponent.type) }}</span>
        </el-icon>
        <div class="component-details">
          <h4 class="component-title">
            {{ getComponentDisplayName(selectedComponent.type) }}
          </h4>
          <span class="component-type">{{ selectedComponent.type }}</span>
        </div>
      </div>
      <div
        v-else
        class="no-selection"
      >
        <el-icon
          class="no-selection-icon"
          :size="24"
        >
          <Box />
        </el-icon>
        <span>未选择组件</span>
      </div>
      <el-button
        v-if="selectedComponent"
        size="small"
        text
        :icon="Refresh"
        title="重置属性"
        @click="resetProperties"
      />
    </div>

    <!-- 属性编辑区域 -->
    <div
      v-if="selectedComponent"
      class="inspector-content"
    >
      <el-scrollbar class="inspector-scrollbar">
        <!-- 基础属性 -->
        <el-collapse
          v-model="activeCollapse"
          class="property-sections"
        >
          <el-collapse-item
            name="basic"
            title="基础属性"
          >
            <el-form
              ref="basicFormRef"
              :model="basicProps"
              :rules="basicRules"
              label-width="80px"
              label-position="top"
              size="small"
            >
              <template
                v-for="(config, key) in basicPropertySchema"
                :key="key"
              >
                <el-form-item
                  :label="config.label"
                  :prop="String(key)"
                >
                  <!-- 文本输入 -->
                  <el-input
                    v-if="config.type === 'string'"
                    v-model="basicProps[key]"
                    :placeholder="config.placeholder"
                    :maxlength="config.maxLength"
                    :show-word-limit="config.showWordLimit"
                    @change="handlePropertyChange(String(key), $event)"
                  />

                  <!-- 数值输入 -->
                  <el-input-number
                    v-else-if="config.type === 'number'"
                    v-model="basicProps[key]"
                    :min="config.min"
                    :max="config.max"
                    :step="config.step"
                    :precision="config.precision"
                    controls-position="right"
                    @change="handlePropertyChange(String(key), $event)"
                  />

                  <!-- 布尔值开关 -->
                  <el-switch
                    v-else-if="config.type === 'boolean'"
                    v-model="basicProps[key]"
                    :active-text="config.activeText"
                    :inactive-text="config.inactiveText"
                    @change="handlePropertyChange(String(key), $event)"
                  />

                  <!-- 选择器 -->
                  <el-select
                    v-else-if="config.type === 'select'"
                    v-model="basicProps[key]"
                    :placeholder="config.placeholder"
                    :multiple="config.multiple"
                    :clearable="config.clearable"
                    @change="handlePropertyChange(String(key), $event)"
                  >
                    <el-option
                      v-for="option in config.options"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>

                  <!-- 颜色选择器 -->
                  <el-color-picker
                    v-else-if="config.type === 'color'"
                    v-model="basicProps[key]"
                    :predefine="config.predefine"
                    @change="handlePropertyChange(String(key), $event)"
                  />
                </el-form-item>
              </template>
            </el-form>
          </el-collapse-item>

          <!-- 样式属性 -->
          <el-collapse-item
            name="style"
            title="样式属性"
          >
            <el-form
              ref="styleFormRef"
              :model="styleProps"
              :rules="styleRules"
              label-width="80px"
              label-position="top"
              size="small"
            >
              <!-- 尺寸设置 -->
              <div class="style-section">
                <h5 class="section-title">
                  尺寸
                </h5>
                <div class="dimension-inputs">
                  <el-form-item
                    label="宽度"
                    prop="width"
                  >
                    <el-input-number
                      v-model="styleProps.width"
                      placeholder="宽度"
                      :min="0"
                      controls-position="right"
                      @change="handleStyleChange('width', $event)"
                    />
                  </el-form-item>
                  <el-form-item
                    label="高度"
                    prop="height"
                  >
                    <el-input-number
                      v-model="styleProps.height"
                      placeholder="高度"
                      :min="0"
                      controls-position="right"
                      @change="handleStyleChange('height', $event)"
                    />
                  </el-form-item>
                </div>
              </div>

              <!-- 边距设置 -->
              <div class="style-section">
                <h5 class="section-title">
                  外边距
                </h5>
                <div class="spacing-inputs">
                  <el-form-item
                    label="上"
                    prop="marginTop"
                  >
                    <el-input-number
                      v-model="styleProps.marginTop"
                      size="small"
                      @change="handleStyleChange('marginTop', $event)"
                    />
                  </el-form-item>
                  <div class="spacing-row">
                    <el-form-item
                      label="左"
                      prop="marginLeft"
                    >
                      <el-input-number
                        v-model="styleProps.marginLeft"
                        size="small"
                        @change="handleStyleChange('marginLeft', $event)"
                      />
                    </el-form-item>
                    <el-form-item
                      label="右"
                      prop="marginRight"
                    >
                      <el-input-number
                        v-model="styleProps.marginRight"
                        size="small"
                        @change="handleStyleChange('marginRight', $event)"
                      />
                    </el-form-item>
                  </div>
                  <el-form-item
                    label="下"
                    prop="marginBottom"
                  >
                    <el-input-number
                      v-model="styleProps.marginBottom"
                      size="small"
                      @change="handleStyleChange('marginBottom', $event)"
                    />
                  </el-form-item>
                </div>
              </div>
            </el-form>
          </el-collapse-item>

          <!-- 事件绑定 -->
          <el-collapse-item
            name="events"
            title="事件绑定"
          >
            <div class="event-bindings">
              <div
                v-for="(event, index) in eventBindings"
                :key="index"
                class="event-item"
              >
                <div class="event-header">
                  <el-select
                    v-model="event.type"
                    placeholder="选择事件"
                    size="small"
                    @change="handleEventTypeChange(index, $event)"
                  >
                    <el-option
                      v-for="eventType in availableEvents"
                      :key="eventType.value"
                      :label="eventType.label"
                      :value="eventType.value"
                    />
                  </el-select>
                  <el-button
                    size="small"
                    type="danger"
                    text
                    :icon="Delete"
                    @click="removeEventBinding(index)"
                  />
                </div>
                <el-input
                  v-model="event.handler"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入事件处理代码"
                  @change="handleEventHandlerChange(index, $event)"
                />
              </div>
              <el-button
                type="primary"
                text
                :icon="Plus"
                @click="addEventBinding"
              >
                添加事件
              </el-button>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-scrollbar>
    </div>

    <!-- 空状态 -->
    <div
      v-else
      class="empty-state"
    >
      <el-empty description="请选择一个组件来编辑其属性" />
    </div>

    <!-- 面板底部操作 -->
    <div
      v-if="selectedComponent"
      class="inspector-footer"
    >
      <el-button
        size="small"
        @click="handleReset"
      >
        重置
      </el-button>
      <el-button
        type="primary"
        size="small"
        :loading="applying"
        @click="handleApply"
      >
        应用
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Refresh, Box } from '@element-plus/icons-vue'
import type { DesignerComponent } from '../types/designer'

// 类型定义
interface PropertyConfig {
  type: 'string' | 'number' | 'boolean' | 'select' | 'color'
  label: string
  placeholder?: string
  maxLength?: number
  showWordLimit?: boolean
  min?: number
  max?: number
  step?: number
  precision?: number
  activeText?: string
  inactiveText?: string
  multiple?: boolean
  clearable?: boolean
  options?: Array<{ label: string; value: any }>
  predefine?: string[]
}

interface EventBinding {
  type: string
  handler: string
}

interface ValidationRule {
  type: string
  value?: string | number
  message: string
}

interface Props {
  selectedComponent?: DesignerComponent | null
}

interface Emits {
  propertyChange: [componentId: string, properties: Record<string, any>]
  styleChange: [componentId: string, styles: Record<string, any>]
  eventChange: [componentId: string, events: EventBinding[]]
  validationChange: [componentId: string, rules: ValidationRule[]]
}

const props = withDefaults(defineProps<Props>(), {
  selectedComponent: null
})

const emit = defineEmits<Emits>()

// 响应式数据
const applying = ref(false)
const activeCollapse = ref(['basic'])

const basicFormRef = ref()
const styleFormRef = ref()

// 属性数据
const basicProps = reactive<Record<string, any>>({})
const styleProps = reactive({
  width: undefined,
  height: undefined,
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0
})

// 事件绑定
const eventBindings = ref<EventBinding[]>([])

// 类型守卫和工具函数
const isValidComponentType = (type: string): boolean => {
  return ['el-button', 'el-input', 'el-select', 'el-table', 'el-form', 'el-date-picker', 'el-switch', 'el-upload', 'el-image'].includes(type)
}

const getComponentIcon = (componentType: string): string => {
  const iconMap: Record<string, string> = {
    'el-button': '🔘',
    'el-input': '✏️',
    'el-select': '📋',
    'el-table': '📊',
    'el-form': '📄',
    'el-date-picker': '📅',
    'el-switch': '🔀',
    'el-upload': '📤',
    'el-image': '🖼️'
  }
  return iconMap[componentType] || '📦'
}

const getComponentDisplayName = (componentType: string): string => {
  const nameMap: Record<string, string> = {
    'el-button': '按钮',
    'el-input': '输入框',
    'el-select': '选择器',
    'el-table': '表格',
    'el-form': '表单',
    'el-date-picker': '日期选择器',
    'el-switch': '开关',
    'el-upload': '上传',
    'el-image': '图片'
  }
  return nameMap[componentType] || componentType
}

// 计算属性
const basicPropertySchema = computed(() => {
  if (!props.selectedComponent || !isValidComponentType(props.selectedComponent.type)) {
    return {}
  }

  const schemas: Record<string, Record<string, PropertyConfig>> = {
    'el-button': {
      text: {
        type: 'string',
        label: '按钮文本',
        placeholder: '请输入按钮文本',
        maxLength: 20,
        showWordLimit: true
      },
      type: {
        type: 'select',
        label: '按钮类型',
        placeholder: '选择按钮类型',
        clearable: true,
        options: [
          { label: '主要', value: 'primary' },
          { label: '成功', value: 'success' },
          { label: '警告', value: 'warning' },
          { label: '危险', value: 'danger' },
          { label: '信息', value: 'info' },
          { label: '文本', value: 'text' }
        ]
      },
      size: {
        type: 'select',
        label: '尺寸',
        placeholder: '选择尺寸',
        clearable: true,
        options: [
          { label: '大', value: 'large' },
          { label: '默认', value: 'default' },
          { label: '小', value: 'small' }
        ]
      },
      disabled: {
        type: 'boolean',
        label: '禁用状态',
        activeText: '禁用',
        inactiveText: '启用'
      },
      loading: {
        type: 'boolean',
        label: '加载状态',
        activeText: '加载中',
        inactiveText: '正常'
      }
    },
    'el-input': {
      placeholder: {
        type: 'string',
        label: '占位文本',
        placeholder: '请输入占位文本',
        maxLength: 50
      },
      maxlength: {
        type: 'number',
        label: '最大长度',
        min: 1,
        max: 1000,
        step: 1
      },
      clearable: {
        type: 'boolean',
        label: '可清空',
        activeText: '可清空',
        inactiveText: '不可清空'
      },
      disabled: {
        type: 'boolean',
        label: '禁用状态',
        activeText: '禁用',
        inactiveText: '启用'
      },
      readonly: {
        type: 'boolean',
        label: '只读状态',
        activeText: '只读',
        inactiveText: '可编辑'
      }
    },
    'el-select': {
      placeholder: {
        type: 'string',
        label: '占位文本',
        placeholder: '请输入占位文本'
      },
      multiple: {
        type: 'boolean',
        label: '多选模式',
        activeText: '多选',
        inactiveText: '单选'
      },
      clearable: {
        type: 'boolean',
        label: '可清空',
        activeText: '可清空',
        inactiveText: '不可清空'
      },
      disabled: {
        type: 'boolean',
        label: '禁用状态',
        activeText: '禁用',
        inactiveText: '启用'
      }
    }
  }

  return schemas[props.selectedComponent.type] || {}
})

// 可用事件列表
const availableEvents = computed(() => {
  if (!props.selectedComponent || !isValidComponentType(props.selectedComponent.type)) {
    return []
  }

  const eventMap: Record<string, Array<{label: string, value: string}>> = {
    'el-button': [
      { label: '点击事件', value: 'click' },
      { label: '鼠标进入', value: 'mouseenter' },
      { label: '鼠标离开', value: 'mouseleave' }
    ],
    'el-input': [
      { label: '输入事件', value: 'input' },
      { label: '失焦事件', value: 'blur' },
      { label: '聚焦事件', value: 'focus' },
      { label: '回车事件', value: 'keyup.enter' }
    ],
    'el-select': [
      { label: '选择事件', value: 'change' },
      { label: '失焦事件', value: 'blur' },
      { label: '聚焦事件', value: 'focus' }
    ]
  }

  return eventMap[props.selectedComponent.type] || []
})

// 表单验证规则
const basicRules = computed(() => {
  const rules: Record<string, any[]> = {}

  Object.entries(basicPropertySchema.value).forEach(([key, config]) => {
    if (config.type === 'string' && config.maxLength) {
      rules[key] = [
        { max: config.maxLength, message: `${config.label}不能超过${config.maxLength}个字符`, trigger: 'blur' }
      ]
    }
  })

  return rules
})

const styleRules = {
  width: [{ min: 0, message: '宽度必须大于等于0', trigger: 'blur' }],
  height: [{ min: 0, message: '高度必须大于等于0', trigger: 'blur' }]
}

// 方法实现
const initializeProperties = () => {
  if (!props.selectedComponent) return

  // 初始化基础属性
  Object.keys(basicProps).forEach(key => {
    delete basicProps[key]
  })

  if (props.selectedComponent.props && typeof props.selectedComponent.props === 'object') {
    Object.entries(props.selectedComponent.props).forEach(([key, value]) => {
      if (key !== 'style') {
        basicProps[key] = value
      }
    })
  }

  // 初始化样式属性
  const style = props.selectedComponent.props?.style
  if (style && typeof style === 'object') {
    const styleObj = style as Record<string, any>
    styleProps.width = typeof styleObj.width === 'string' ? parseInt(styleObj.width) : styleObj.width
    styleProps.height = typeof styleObj.height === 'string' ? parseInt(styleObj.height) : styleObj.height
    styleProps.marginTop = styleObj.marginTop || 0
    styleProps.marginRight = styleObj.marginRight || 0
    styleProps.marginBottom = styleObj.marginBottom || 0
    styleProps.marginLeft = styleObj.marginLeft || 0
  }

  // 初始化事件绑定
  eventBindings.value = []
}

const handlePropertyChange = (key: string, value: any) => {
  if (props.selectedComponent) {
    emit('propertyChange', props.selectedComponent.id, { [key]: value })
  }
}

const handleStyleChange = (key: string, value: any) => {
  if (props.selectedComponent) {
    const styleUpdate: Record<string, any> = {}

    if (key === 'width' || key === 'height') {
      styleUpdate[key] = typeof value === 'number' ? `${value}px` : value
    } else {
      styleUpdate[key] = value
    }

    emit('styleChange', props.selectedComponent.id, styleUpdate)
  }
}

const addEventBinding = () => {
  eventBindings.value.push({
    type: '',
    handler: ''
  })
}

const removeEventBinding = (index: number) => {
  eventBindings.value.splice(index, 1)
  if (props.selectedComponent) {
    emit('eventChange', props.selectedComponent.id, eventBindings.value)
  }
}

const handleEventTypeChange = (index: number, type: string) => {
  eventBindings.value[index].type = type
  if (props.selectedComponent) {
    emit('eventChange', props.selectedComponent.id, eventBindings.value)
  }
}

const handleEventHandlerChange = (index: number, handler: string) => {
  eventBindings.value[index].handler = handler
  if (props.selectedComponent) {
    emit('eventChange', props.selectedComponent.id, eventBindings.value)
  }
}

const resetProperties = () => {
  initializeProperties()
  ElMessage.success('属性已重置')
}

const handleReset = () => {
  resetProperties()
}

const handleApply = async () => {
  try {
    applying.value = true

    // 验证表单
    await Promise.all([
      basicFormRef.value?.validate(),
      styleFormRef.value?.validate()
    ])

    ElMessage.success('属性已应用')
  } catch (error) {
    ElMessage.error('属性验证失败，请检查输入')
  } finally {
    applying.value = false
  }
}

// 监听选中组件变化
watch(() => props.selectedComponent, (newComponent) => {
  if (newComponent) {
    initializeProperties()
    activeCollapse.value = ['basic']
  }
}, { immediate: true })
</script>

<style scoped>
.property-inspector {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
  border-left: 1px solid var(--el-border-color);
}

.inspector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color-page);
}

.component-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.component-icon {
  color: var(--el-color-primary);
}

.component-details {
  display: flex;
  flex-direction: column;
}

.component-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.component-type {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.no-selection {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
}

.no-selection-icon {
  opacity: 0.6;
}

.inspector-content {
  flex: 1;
  overflow: hidden;
}

.inspector-scrollbar {
  height: 100%;
}

.property-sections {
  border: none;
}

.property-sections :deep(.el-collapse-item__header) {
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-weight: 500;
}

.property-sections :deep(.el-collapse-item__content) {
  padding: 16px;
}

.style-section {
  margin-bottom: 16px;
}

.section-title {
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-regular);
  text-transform: uppercase;
}

.dimension-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.spacing-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.spacing-row {
  display: flex;
  gap: 8px;
}

.event-bindings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-item {
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background: var(--el-bg-color-page);
}

.event-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inspector-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--el-border-color);
  background: var(--el-bg-color-page);
}
</style>
