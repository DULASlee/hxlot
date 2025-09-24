<template>
  <div class="visual-component-palette">
    <el-card>
      <template #header>
        <div class="palette-header">
          <h3>
            <i class="el-icon-grid" />
            组件面板
          </h3>
          <div class="palette-actions">
            <el-input
              v-model="searchText"
              placeholder="搜索组件"
              prefix-icon="el-icon-search"
              size="small"
              style="width: 120px"
            />
          </div>
        </div>
      </template>

      <!-- 组件分类标签 -->
      <el-tabs v-model="activeCategory" type="border-card" size="small">
        <!-- 基础组件 -->
        <el-tab-pane label="基础组件" name="basic">
          <div class="component-grid">
            <div
              v-for="component in filteredBasicComponents"
              :key="component.id"
              class="component-item"
              :title="component.description"
              @mousedown="startDrag(component, $event)"
            >
              <div class="component-icon">
                <i :class="component.icon" />
              </div>
              <div class="component-info">
                <div class="component-name">{{ component.name }}</div>
                <div class="component-tag">{{ component.tag }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 表单组件 -->
        <el-tab-pane label="表单组件" name="form">
          <div class="component-grid">
            <div
              v-for="component in filteredFormComponents"
              :key="component.id"
              class="component-item"
              :title="component.description"
              @mousedown="startDrag(component, $event)"
            >
              <div class="component-icon">
                <i :class="component.icon" />
              </div>
              <div class="component-info">
                <div class="component-name">{{ component.name }}</div>
                <div class="component-tag">{{ component.tag }}</div>
              </div>
              <div v-if="component.isAdvanced" class="advanced-badge">
                <el-tag size="mini" type="warning">高级</el-tag>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 数据展示 -->
        <el-tab-pane label="数据展示" name="data">
          <div class="component-grid">
            <div
              v-for="component in filteredDataComponents"
              :key="component.id"
              class="component-item"
              :title="component.description"
              @mousedown="startDrag(component, $event)"
            >
              <div class="component-icon">
                <i :class="component.icon" />
              </div>
              <div class="component-info">
                <div class="component-name">{{ component.name }}</div>
                <div class="component-tag">{{ component.tag }}</div>
              </div>
              <div v-if="component.isProfessional" class="professional-badge">
                <el-tag size="mini" type="success">专业</el-tag>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 布局组件 -->
        <el-tab-pane label="布局组件" name="layout">
          <div class="component-grid">
            <div
              v-for="component in filteredLayoutComponents"
              :key="component.id"
              class="component-item"
              :title="component.description"
              @mousedown="startDrag(component, $event)"
            >
              <div class="component-icon">
                <i :class="component.icon" />
              </div>
              <div class="component-info">
                <div class="component-name">{{ component.name }}</div>
                <div class="component-tag">{{ component.tag }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 企业组件 -->
        <el-tab-pane label="企业组件" name="enterprise">
          <div class="component-grid">
            <div
              v-for="component in filteredEnterpriseComponents"
              :key="component.id"
              class="component-item enterprise-component"
              :title="component.description"
              @mousedown="startDrag(component, $event)"
            >
              <div class="component-icon">
                <i :class="component.icon" />
              </div>
              <div class="component-info">
                <div class="component-name">{{ component.name }}</div>
                <div class="component-tag">{{ component.tag }}</div>
              </div>
              <div class="enterprise-badge">
                <el-tag size="mini" type="danger">企业级</el-tag>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 自定义组件 -->
        <el-tab-pane label="自定义" name="custom">
          <div class="custom-components">
            <div class="custom-header">
              <el-button
                type="primary"
                size="small"
                icon="el-icon-plus"
                @click="showCreateCustomComponent = true"
              >
                创建自定义组件
              </el-button>
            </div>

            <div class="component-grid">
              <div
                v-for="component in customComponents"
                :key="component.id"
                class="component-item custom-component"
                :title="component.description"
                @mousedown="startDrag(component, $event)"
              >
                <div class="component-icon">
                  <i :class="component.icon" />
                </div>
                <div class="component-info">
                  <div class="component-name">{{ component.name }}</div>
                  <div class="component-tag">{{ component.tag }}</div>
                </div>
                <div class="custom-actions">
                  <el-button
                    size="mini"
                    icon="el-icon-edit"
                    @click.stop="editCustomComponent(component)"
                  />
                  <el-button
                    size="mini"
                    type="danger"
                    icon="el-icon-delete"
                    @click.stop="deleteCustomComponent(component)"
                  />
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 拖拽预览 -->
    <div
      v-if="dragging"
      class="drag-preview"
      :style="dragPreviewStyle"
    >
      <div class="preview-icon">
        <i :class="draggingComponent?.icon" />
      </div>
      <span class="preview-name">{{ draggingComponent?.name }}</span>
    </div>

    <!-- 创建自定义组件对话框 -->
    <el-dialog
      v-model="showCreateCustomComponent"
      title="创建自定义组件"
      width="600px"
    >
      <el-form
        ref="customComponentFormRef"
        :model="customComponentForm"
        label-width="100px"
      >
        <el-form-item label="组件名称" required>
          <el-input
            v-model="customComponentForm.name"
            placeholder="例如：客户信息卡片"
          />
        </el-form-item>
        <el-form-item label="组件标签" required>
          <el-input
            v-model="customComponentForm.tag"
            placeholder="例如：customer-info-card"
          />
        </el-form-item>
        <el-form-item label="组件图标">
          <el-select
            v-model="customComponentForm.icon"
            placeholder="选择图标"
          >
            <el-option
              v-for="icon in availableIcons"
              :key="icon.value"
              :label="icon.label"
              :value="icon.value"
            >
              <i :class="icon.value" /> {{ icon.label }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="组件描述">
          <el-input
            v-model="customComponentForm.description"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="组件模板">
          <el-input
            v-model="customComponentForm.template"
            type="textarea"
            :rows="8"
            placeholder="Vue组件模板代码"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateCustomComponent = false">取消</el-button>
        <el-button
          type="primary"
          @click="saveCustomComponent"
        >
          保存组件
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// Props
interface Props {
  searchFilter?: string
}

const props = withDefaults(defineProps<Props>(), {
  searchFilter: ''
})

// 响应式数据
const activeCategory = ref('basic')
const searchText = ref('')
const dragging = ref(false)
const draggingComponent = ref(null)
const dragPreviewStyle = ref({})
const showCreateCustomComponent = ref(false)

// 自定义组件表单
const customComponentForm = ref({
  name: '',
  tag: '',
  icon: 'el-icon-document',
  description: '',
  template: ''
})

// 基础组件库
const basicComponents = ref([
  {
    id: 'text',
    name: '文本',
    tag: 'el-text',
    icon: 'el-icon-document',
    description: '静态文本显示组件',
    category: 'basic',
    props: {
      content: { type: 'string', default: '文本内容' },
      size: { type: 'select', options: ['large', 'default', 'small'], default: 'default' },
      type: { type: 'select', options: ['primary', 'success', 'warning', 'danger', 'info'], default: 'default' }
    }
  },
  {
    id: 'button',
    name: '按钮',
    tag: 'el-button',
    icon: 'el-icon-position',
    description: '可点击的按钮组件',
    category: 'basic',
    props: {
      text: { type: 'string', default: '按钮' },
      type: { type: 'select', options: ['primary', 'success', 'warning', 'danger', 'info'], default: 'primary' },
      size: { type: 'select', options: ['large', 'default', 'small'], default: 'default' },
      icon: { type: 'icon', default: '' },
      disabled: { type: 'boolean', default: false }
    }
  },
  {
    id: 'image',
    name: '图片',
    tag: 'el-image',
    icon: 'el-icon-picture',
    description: '图片展示组件',
    category: 'basic',
    props: {
      src: { type: 'string', default: 'https://via.placeholder.com/300x200' },
      alt: { type: 'string', default: '图片' },
      fit: { type: 'select', options: ['fill', 'contain', 'cover', 'none', 'scale-down'], default: 'cover' }
    }
  },
  {
    id: 'divider',
    name: '分割线',
    tag: 'el-divider',
    icon: 'el-icon-minus',
    description: '内容分割线',
    category: 'basic',
    props: {
      direction: { type: 'select', options: ['horizontal', 'vertical'], default: 'horizontal' },
      contentPosition: { type: 'select', options: ['left', 'center', 'right'], default: 'center' },
      borderStyle: { type: 'select', options: ['solid', 'dashed', 'dotted'], default: 'solid' }
    }
  }
])

// 表单组件库
const formComponents = ref([
  {
    id: 'input',
    name: '输入框',
    tag: 'el-input',
    icon: 'el-icon-edit',
    description: '文本输入组件',
    category: 'form',
    props: {
      placeholder: { type: 'string', default: '请输入内容' },
      type: { type: 'select', options: ['text', 'password', 'email', 'number'], default: 'text' },
      size: { type: 'select', options: ['large', 'default', 'small'], default: 'default' },
      clearable: { type: 'boolean', default: true },
      disabled: { type: 'boolean', default: false },
      maxlength: { type: 'number', default: null }
    }
  },
  {
    id: 'select',
    name: '选择器',
    tag: 'el-select',
    icon: 'el-icon-arrow-down',
    description: '下拉选择组件',
    category: 'form',
    props: {
      placeholder: { type: 'string', default: '请选择' },
      multiple: { type: 'boolean', default: false },
      clearable: { type: 'boolean', default: true },
      filterable: { type: 'boolean', default: false },
      options: { type: 'array', default: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' }
      ]}
    }
  },
  {
    id: 'date-picker',
    name: '日期选择器',
    tag: 'el-date-picker',
    icon: 'el-icon-date',
    description: '日期时间选择组件',
    category: 'form',
    isAdvanced: true,
    props: {
      type: { type: 'select', options: ['date', 'datetime', 'daterange', 'datetimerange'], default: 'date' },
      placeholder: { type: 'string', default: '选择日期' },
      format: { type: 'string', default: 'YYYY-MM-DD' },
      valueFormat: { type: 'string', default: 'YYYY-MM-DD' },
      clearable: { type: 'boolean', default: true }
    }
  },
  {
    id: 'checkbox',
    name: '复选框',
    tag: 'el-checkbox',
    icon: 'el-icon-check',
    description: '复选框组件',
    category: 'form',
    props: {
      label: { type: 'string', default: '复选框' },
      checked: { type: 'boolean', default: false },
      disabled: { type: 'boolean', default: false },
      indeterminate: { type: 'boolean', default: false }
    }
  },
  {
    id: 'radio',
    name: '单选框',
    tag: 'el-radio',
    icon: 'el-icon-success',
    description: '单选框组件',
    category: 'form',
    props: {
      label: { type: 'string', default: '单选框' },
      value: { type: 'string', default: 'option1' },
      disabled: { type: 'boolean', default: false }
    }
  },
  {
    id: 'slider',
    name: '滑块',
    tag: 'el-slider',
    icon: 'el-icon-sort',
    description: '数值滑块组件',
    category: 'form',
    isAdvanced: true,
    props: {
      min: { type: 'number', default: 0 },
      max: { type: 'number', default: 100 },
      step: { type: 'number', default: 1 },
      showStops: { type: 'boolean', default: false },
      showTooltip: { type: 'boolean', default: true }
    }
  },
  {
    id: 'upload',
    name: '文件上传',
    tag: 'el-upload',
    icon: 'el-icon-upload',
    description: '文件上传组件',
    category: 'form',
    isAdvanced: true,
    props: {
      action: { type: 'string', default: '/api/upload' },
      multiple: { type: 'boolean', default: false },
      accept: { type: 'string', default: '*' },
      autoUpload: { type: 'boolean', default: true },
      showFileList: { type: 'boolean', default: true }
    }
  }
])

// 数据展示组件库
const dataComponents = ref([
  {
    id: 'table',
    name: '数据表格',
    tag: 'el-table',
    icon: 'el-icon-s-grid',
    description: '数据表格组件',
    category: 'data',
    isProfessional: true,
    props: {
      data: { type: 'array', default: [] },
      stripe: { type: 'boolean', default: true },
      border: { type: 'boolean', default: true },
      showHeader: { type: 'boolean', default: true },
      highlightCurrentRow: { type: 'boolean', default: false },
      size: { type: 'select', options: ['large', 'default', 'small'], default: 'default' }
    }
  },
  {
    id: 'pagination',
    name: '分页器',
    tag: 'el-pagination',
    icon: 'el-icon-more',
    description: '数据分页组件',
    category: 'data',
    isProfessional: true,
    props: {
      total: { type: 'number', default: 100 },
      pageSize: { type: 'number', default: 20 },
      currentPage: { type: 'number', default: 1 },
      layout: { type: 'string', default: 'total, sizes, prev, pager, next, jumper' },
      pageSizes: { type: 'array', default: [10, 20, 50, 100] }
    }
  },
  {
    id: 'tree',
    name: '树形控件',
    tag: 'el-tree',
    icon: 'el-icon-s-unfold',
    description: '树形数据展示组件',
    category: 'data',
    isProfessional: true,
    props: {
      data: { type: 'array', default: [] },
      showCheckbox: { type: 'boolean', default: false },
      nodeKey: { type: 'string', default: 'id' },
      expandOnClickNode: { type: 'boolean', default: true },
      checkOnClickNode: { type: 'boolean', default: false }
    }
  },
  {
    id: 'descriptions',
    name: '描述列表',
    tag: 'el-descriptions',
    icon: 'el-icon-tickets',
    description: '键值对描述列表',
    category: 'data',
    props: {
      title: { type: 'string', default: '描述列表' },
      column: { type: 'number', default: 3 },
      size: { type: 'select', options: ['large', 'default', 'small'], default: 'default' },
      border: { type: 'boolean', default: false }
    }
  }
])

// 布局组件库
const layoutComponents = ref([
  {
    id: 'row',
    name: '行布局',
    tag: 'el-row',
    icon: 'el-icon-s-unfold',
    description: '栅格行布局组件',
    category: 'layout',
    props: {
      gutter: { type: 'number', default: 0 },
      justify: { type: 'select', options: ['start', 'end', 'center', 'space-around', 'space-between'], default: 'start' },
      align: { type: 'select', options: ['top', 'middle', 'bottom'], default: 'top' }
    }
  },
  {
    id: 'col',
    name: '列布局',
    tag: 'el-col',
    icon: 'el-icon-s-fold',
    description: '栅格列布局组件',
    category: 'layout',
    props: {
      span: { type: 'number', default: 24 },
      offset: { type: 'number', default: 0 },
      push: { type: 'number', default: 0 },
      pull: { type: 'number', default: 0 }
    }
  },
  {
    id: 'card',
    name: '卡片',
    tag: 'el-card',
    icon: 'el-icon-postcard',
    description: '内容卡片容器',
    category: 'layout',
    props: {
      header: { type: 'string', default: '卡片标题' },
      shadow: { type: 'select', options: ['always', 'hover', 'never'], default: 'hover' },
      bodyStyle: { type: 'object', default: {} }
    }
  },
  {
    id: 'collapse',
    name: '折叠面板',
    tag: 'el-collapse',
    icon: 'el-icon-s-fold',
    description: '可折叠的内容面板',
    category: 'layout',
    props: {
      accordion: { type: 'boolean', default: false },
      modelValue: { type: 'array', default: [] }
    }
  },
  {
    id: 'tabs',
    name: '标签页',
    tag: 'el-tabs',
    icon: 'el-icon-folder',
    description: '标签页容器组件',
    category: 'layout',
    props: {
      type: { type: 'select', options: ['', 'card', 'border-card'], default: '' },
      tabPosition: { type: 'select', options: ['top', 'right', 'bottom', 'left'], default: 'top' },
      closable: { type: 'boolean', default: false }
    }
  }
])

// 企业级组件库
const enterpriseComponents = ref([
  {
    id: 'permission-matrix',
    name: '权限矩阵',
    tag: 'permission-matrix',
    icon: 'el-icon-lock',
    description: '企业级权限管理矩阵组件',
    category: 'enterprise',
    props: {
      roles: { type: 'array', default: [] },
      permissions: { type: 'array', default: [] },
      editable: { type: 'boolean', default: true }
    }
  },
  {
    id: 'audit-trail',
    name: '审计追踪',
    tag: 'audit-trail',
    icon: 'el-icon-document-copy',
    description: '审计日志展示组件',
    category: 'enterprise',
    props: {
      entityId: { type: 'string', default: '' },
      entityType: { type: 'string', default: '' },
      showOperations: { type: 'array', default: ['Create', 'Update', 'Delete'] }
    }
  },
  {
    id: 'org-tree',
    name: '组织架构树',
    tag: 'organization-tree',
    icon: 'el-icon-office-building',
    description: '企业组织架构树形组件',
    category: 'enterprise',
    props: {
      orgData: { type: 'array', default: [] },
      showUserCount: { type: 'boolean', default: true },
      allowDrag: { type: 'boolean', default: false },
      showActions: { type: 'boolean', default: true }
    }
  },
  {
    id: 'workflow-designer',
    name: '工作流设计器',
    tag: 'workflow-designer',
    icon: 'el-icon-share',
    description: '业务流程设计组件',
    category: 'enterprise',
    props: {
      workflowData: { type: 'object', default: {} },
      editable: { type: 'boolean', default: true },
      showMiniMap: { type: 'boolean', default: true }
    }
  },
  {
    id: 'dashboard-chart',
    name: '仪表盘图表',
    tag: 'dashboard-chart',
    icon: 'el-icon-data-analysis',
    description: '企业级数据可视化图表',
    category: 'enterprise',
    props: {
      chartType: { type: 'select', options: ['line', 'bar', 'pie', 'area', 'scatter'], default: 'line' },
      data: { type: 'array', default: [] },
      title: { type: 'string', default: '图表标题' },
      showLegend: { type: 'boolean', default: true }
    }
  },
  {
    id: 'data-export',
    name: '数据导出',
    tag: 'data-export',
    icon: 'el-icon-download',
    description: '企业级数据导出组件',
    category: 'enterprise',
    props: {
      exportFormats: { type: 'array', default: ['excel', 'pdf', 'csv'] },
      fileName: { type: 'string', default: 'export_data' },
      autoDownload: { type: 'boolean', default: true }
    }
  }
])

// 自定义组件
const customComponents = ref([
  {
    id: 'user-avatar-card',
    name: '用户头像卡片',
    tag: 'user-avatar-card',
    icon: 'el-icon-user',
    description: '显示用户头像和基本信息的卡片组件',
    category: 'custom',
    template: `<div class="user-avatar-card">
  <el-avatar :size="avatarSize" :src="userInfo.avatar">
    {{ userInfo.name?.charAt(0) }}
  </el-avatar>
  <div class="user-info">
    <div class="user-name">{{ userInfo.name }}</div>
    <div class="user-role">{{ userInfo.role }}</div>
  </div>
</div>`
  }
])

// 可用图标
const availableIcons = ref([
  { label: '文档', value: 'el-icon-document' },
  { label: '用户', value: 'el-icon-user' },
  { label: '设置', value: 'el-icon-setting' },
  { label: '搜索', value: 'el-icon-search' },
  { label: '编辑', value: 'el-icon-edit' },
  { label: '删除', value: 'el-icon-delete' },
  { label: '位置', value: 'el-icon-location' },
  { label: '时间', value: 'el-icon-time' },
  { label: '数据', value: 'el-icon-data-analysis' },
  { label: '图表', value: 'el-icon-pie-chart' }
])

// 计算属性
const filteredBasicComponents = computed(() => {
  return filterComponents(basicComponents.value)
})

const filteredFormComponents = computed(() => {
  return filterComponents(formComponents.value)
})

const filteredDataComponents = computed(() => {
  return filterComponents(dataComponents.value)
})

const filteredLayoutComponents = computed(() => {
  return filterComponents(layoutComponents.value)
})

const filteredEnterpriseComponents = computed(() => {
  return filterComponents(enterpriseComponents.value)
})

// 方法
const filterComponents = (components) => {
  if (!searchText.value && !props.searchFilter) return components
  
  const keyword = (searchText.value || props.searchFilter).toLowerCase()
  return components.filter(component => 
    component.name.toLowerCase().includes(keyword) ||
    component.tag.toLowerCase().includes(keyword) ||
    component.description.toLowerCase().includes(keyword)
  )
}

const startDrag = (component, event) => {
  dragging.value = true
  draggingComponent.value = component
  
  // 创建拖拽数据
  const dragData = {
    component: component,
    sourceType: 'palette'
  }
  
  // 设置拖拽预览位置
  updateDragPreview(event)
  
  // 触发拖拽开始事件
  emit('drag-start', dragData)
  
  // 监听鼠标移动和松开
  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
}

const handleDragMove = (event) => {
  if (dragging.value) {
    updateDragPreview(event)
  }
}

const handleDragEnd = (event) => {
  if (dragging.value) {
    // 触发拖拽结束事件
    emit('drag-end', {
      component: draggingComponent.value,
      position: { x: event.clientX, y: event.clientY }
    })
    
    // 重置拖拽状态
    dragging.value = false
    draggingComponent.value = null
    dragPreviewStyle.value = {}
  }
  
  // 移除事件监听
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
}

const updateDragPreview = (event) => {
  dragPreviewStyle.value = {
    position: 'fixed',
    left: event.clientX + 10 + 'px',
    top: event.clientY - 10 + 'px',
    zIndex: 9999,
    pointerEvents: 'none'
  }
}

const saveCustomComponent = () => {
  if (!customComponentForm.value.name || !customComponentForm.value.tag) {
    ElMessage.warning('请填写组件名称和标签')
    return
  }

  const newComponent = {
    ...customComponentForm.value,
    id: `custom-${Date.now()}`,
    category: 'custom',
    props: {} // 可以从模板中解析props
  }

  customComponents.value.push(newComponent)
  
  ElMessage.success('自定义组件创建成功')
  showCreateCustomComponent.value = false
  
  // 重置表单
  customComponentForm.value = {
    name: '',
    tag: '',
    icon: 'el-icon-document',
    description: '',
    template: ''
  }
}

const editCustomComponent = (component) => {
  customComponentForm.value = { ...component }
  showCreateCustomComponent.value = true
}

const deleteCustomComponent = (component) => {
  const index = customComponents.value.findIndex(c => c.id === component.id)
  if (index > -1) {
    customComponents.value.splice(index, 1)
    ElMessage.success('自定义组件删除成功')
  }
}

// Emits
const emit = defineEmits<{
  'drag-start': [data: any]
  'drag-end': [data: any]
  'component-selected': [component: any]
}>()

// 引用
const customComponentFormRef = ref()
</script>

<style scoped>
.visual-component-palette {
  height: 100%;
  width: 280px;
  border-right: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
}

.palette-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.palette-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
  font-size: 14px;
}

/* 组件网格样式 */
.component-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 12px 8px;
}

.component-item {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 8px;
  cursor: move;
  transition: all 0.2s ease;
  position: relative;
  user-select: none;
}

.component-item:hover {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.component-item:active {
  transform: scale(0.95);
}

.enterprise-component {
  border-color: var(--el-color-danger-light-5);
  background: var(--el-color-danger-light-9);
}

.enterprise-component:hover {
  border-color: var(--el-color-danger);
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.2);
}

.custom-component {
  border-color: var(--el-color-warning-light-5);
  background: var(--el-color-warning-light-9);
}

.component-icon {
  text-align: center;
  margin-bottom: 4px;
}

.component-icon i {
  font-size: 16px;
  color: var(--el-color-primary);
}

.enterprise-component .component-icon i {
  color: var(--el-color-danger);
}

.custom-component .component-icon i {
  color: var(--el-color-warning);
}

.component-info {
  text-align: center;
}

.component-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
  line-height: 1.2;
}

.component-tag {
  font-size: 9px;
  color: var(--el-text-color-secondary);
  font-family: var(--el-font-family-mono, Consolas, monospace);
}

/* 组件徽章 */
.advanced-badge,
.professional-badge,
.enterprise-badge {
  position: absolute;
  top: 2px;
  right: 2px;
}

.custom-actions {
  position: absolute;
  top: 2px;
  right: 2px;
  display: none;
}

.custom-component:hover .custom-actions {
  display: flex;
  gap: 2px;
}

/* 拖拽预览样式 */
.drag-preview {
  background: white;
  border: 2px solid var(--el-color-primary);
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 12px;
}

.preview-icon i {
  color: var(--el-color-primary);
}

.preview-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

/* 自定义组件区域 */
.custom-components {
  padding: 12px 8px;
}

.custom-header {
  text-align: center;
  margin-bottom: 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .visual-component-palette {
    width: 240px;
  }
  
  .component-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .visual-component-palette {
    width: 200px;
  }
  
  .component-name {
    font-size: 10px;
  }
  
  .component-tag {
    font-size: 8px;
  }
}
</style>
