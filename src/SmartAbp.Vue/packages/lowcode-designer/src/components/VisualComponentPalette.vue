<template>
  <div class="visual-component-palette">
    <!-- 搜索栏 -->
    <div
      v-if="searchable"
      class="palette-search"
    >
      <el-input
        v-model="searchKeyword"
        placeholder="搜索组件..."
        prefix-icon="el-icon-search"
        clearable
        size="small"
        @input="handleSearch"
      />
    </div>

    <!-- 分类标签 -->
    <div class="palette-categories">
      <el-button-group size="small">
        <el-button
          v-for="category in categories"
          :key="category.value"
          :type="currentCategory === category.value ? 'primary' : 'default'"
          @click="handleCategoryChange(category.value)"
        >
          <i :class="category.icon" />
          {{ category.label }}
        </el-button>
      </el-button-group>
    </div>

    <!-- 组件列表 -->
    <div class="palette-components">
      <el-scrollbar height="calc(100vh - 200px)">
        <div class="component-grid">
          <div
            v-for="component in filteredComponents"
            :key="component.id"
            class="component-item"
            :draggable="draggable"
            @dragstart="handleDragStart(component, $event)"
            @dragend="handleDragEnd"
            @click="handleComponentClick(component)"
          >
            <div class="component-icon">
              <i :class="component.icon" />
            </div>
            <div class="component-name">
              {{ component.displayName }}
            </div>
            <div class="component-description">
              {{ component.description }}
            </div>
            <el-tag
              v-if="component.isCustom"
              size="small"
              type="warning"
              class="custom-tag"
            >
              自定义
            </el-tag>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty
          v-if="filteredComponents.length === 0"
          description="暂无组件"
          :image-size="100"
        />
      </el-scrollbar>
    </div>

    <!-- 组件详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="组件详情"
      size="400px"
    >
      <div
        v-if="selectedComponent"
        class="component-detail"
      >
        <div class="detail-header">
          <div class="detail-icon">
            <i :class="selectedComponent.icon" />
          </div>
          <h3>{{ selectedComponent.displayName }}</h3>
          <p class="detail-name">
            {{ selectedComponent.name }}
          </p>
        </div>

        <el-divider />

        <div class="detail-section">
          <h4>描述</h4>
          <p>{{ selectedComponent.description }}</p>
        </div>

        <div class="detail-section">
          <h4>分类</h4>
          <el-tag :type="getCategoryType(selectedComponent.category)">
            {{ getCategoryLabel(selectedComponent.category) }}
          </el-tag>
        </div>

        <div
          v-if="selectedComponent.tags.length > 0"
          class="detail-section"
        >
          <h4>标签</h4>
          <el-tag
            v-for="tag in selectedComponent.tags"
            :key="tag"
            size="small"
            style="margin-right: 8px"
          >
            {{ tag }}
          </el-tag>
        </div>

        <div
          v-if="selectedComponent.props"
          class="detail-section"
        >
          <h4>默认属性</h4>
          <el-descriptions
            :column="1"
            border
            size="small"
          >
            <el-descriptions-item
              v-for="(value, key) in selectedComponent.props"
              :key="key"
              :label="key"
            >
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-actions">
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="handleAddComponent"
          >
            添加到画布
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';
import type {
    ComponentPaletteCategory,
    PaletteComponent,
    VisualComponentPaletteProps
} from '../types/designer';

// Props
const props = withDefaults(defineProps<VisualComponentPaletteProps>(), {
  searchable: true,
  draggable: true
})

// Emits
const emit = defineEmits<{
  'component-select': [component: PaletteComponent]
  'component-drag-start': [component: PaletteComponent, event: DragEvent]
  'component-drag-end': []
}>()

// 状态
const searchKeyword = ref('')
const currentCategory = ref<ComponentPaletteCategory>('basic')
const detailDrawerVisible = ref(false)
const selectedComponent = ref<PaletteComponent | null>(null)

// 分类定义
const categories = [
  { value: 'basic' as const, label: '基础', icon: 'el-icon-box' },
  { value: 'form' as const, label: '表单', icon: 'el-icon-edit' },
  { value: 'data' as const, label: '数据', icon: 'el-icon-s-data' },
  { value: 'layout' as const, label: '布局', icon: 'el-icon-s-grid' },
  { value: 'navigation' as const, label: '导航', icon: 'el-icon-menu' },
  { value: 'feedback' as const, label: '反馈', icon: 'el-icon-message-solid' },
  { value: 'chart' as const, label: '图表', icon: 'el-icon-s-data' },
  { value: 'custom' as const, label: '自定义', icon: 'el-icon-setting' }
]

// 组件库（模拟数据）
const components = ref<PaletteComponent[]>([
  // 基础组件
  {
    id: 'comp_button',
    name: 'el-button',
    displayName: '按钮',
    category: 'basic',
    icon: 'el-icon-s-promotion',
    description: '常用的操作按钮',
    props: { type: 'primary', size: 'default' },
    defaultStyle: { width: '100px', height: '32px' },
    isCustom: false,
    tags: ['button', 'action']
  },
  {
    id: 'comp_input',
    name: 'el-input',
    displayName: '输入框',
    category: 'form',
    icon: 'el-icon-edit',
    description: '通过键盘输入字符',
    props: { placeholder: '请输入', clearable: true },
    defaultStyle: { width: '200px' },
    isCustom: false,
    tags: ['input', 'form']
  },
  {
    id: 'comp_select',
    name: 'el-select',
    displayName: '选择器',
    category: 'form',
    icon: 'el-icon-arrow-down',
    description: '当选项过多时，使用下拉菜单展示并选择内容',
    props: { placeholder: '请选择', clearable: true },
    defaultStyle: { width: '200px' },
    isCustom: false,
    tags: ['select', 'form', 'dropdown']
  },
  {
    id: 'comp_table',
    name: 'el-table',
    displayName: '表格',
    category: 'data',
    icon: 'el-icon-s-grid',
    description: '用于展示多条结构类似的数据',
    props: { border: true, stripe: true },
    defaultStyle: { width: '100%', minHeight: '200px' },
    isCustom: false,
    tags: ['table', 'data', 'grid']
  },
  {
    id: 'comp_card',
    name: 'el-card',
    displayName: '卡片',
    category: 'layout',
    icon: 'el-icon-postcard',
    description: '将信息聚合在卡片容器中展示',
    props: { shadow: 'hover' },
    defaultStyle: { width: '300px', minHeight: '150px' },
    isCustom: false,
    tags: ['card', 'container']
  },
  {
    id: 'comp_dialog',
    name: 'el-dialog',
    displayName: '对话框',
    category: 'feedback',
    icon: 'el-icon-s-comment',
    description: '在保留当前页面状态的情况下，告知用户并承载相关操作',
    props: { width: '50%', title: '提示' },
    defaultStyle: {},
    isCustom: false,
    tags: ['dialog', 'modal', 'popup']
  },
  {
    id: 'comp_chart',
    name: 'echarts-chart',
    displayName: '图表',
    category: 'chart',
    icon: 'el-icon-s-data',
    description: 'ECharts 图表组件',
    props: { type: 'line' },
    defaultStyle: { width: '400px', height: '300px' },
    isCustom: false,
    tags: ['chart', 'visualization']
  }
])

// 过滤后的组件列表
const filteredComponents = computed(() => {
  let result = components.value

  // 分类过滤
  result = result.filter(c => c.category === currentCategory.value)

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      c =>
        c.displayName.toLowerCase().includes(keyword) ||
        c.name.toLowerCase().includes(keyword) ||
        c.description.toLowerCase().includes(keyword) ||
        c.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }

  return result
})

// 处理分类切换
const handleCategoryChange = (category: ComponentPaletteCategory) => {
  currentCategory.value = category
}

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

// 处理组件点击
const handleComponentClick = (component: PaletteComponent) => {
  selectedComponent.value = component
  detailDrawerVisible.value = true
  emit('component-select', component)
}

// 处理拖拽开始
const handleDragStart = (component: PaletteComponent, event: DragEvent) => {
  if (!props.draggable) return
  
  // 设置拖拽数据
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('component', JSON.stringify(component))
  }
  
  emit('component-drag-start', component, event)
  ElMessage.info(`开始拖拽：${component.displayName}`)
}

// 处理拖拽结束
const handleDragEnd = () => {
  emit('component-drag-end')
}

// 添加组件到画布
const handleAddComponent = () => {
  if (!selectedComponent.value) return
  
  emit('component-select', selectedComponent.value)
  ElMessage.success(`已添加组件：${selectedComponent.value.displayName}`)
  detailDrawerVisible.value = false
}

// 获取分类标签
const getCategoryLabel = (category: ComponentPaletteCategory): string => {
  const categoryMap: Record<ComponentPaletteCategory, string> = {
    basic: '基础',
    form: '表单',
    data: '数据',
    layout: '布局',
    navigation: '导航',
    feedback: '反馈',
    chart: '图表',
    custom: '自定义'
  }
  return categoryMap[category]
}

// 获取分类类型
const getCategoryType = (category: ComponentPaletteCategory): string => {
  const typeMap: Record<ComponentPaletteCategory, string> = {
    basic: 'primary',
    form: 'success',
    data: 'info',
    layout: 'warning',
    navigation: 'danger',
    feedback: '',
    chart: 'success',
    custom: 'warning'
  }
  return typeMap[category]
}
</script>

<style scoped lang="scss">
.visual-component-palette {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .palette-search {
    padding: 16px;
    border-bottom: 1px solid #ebeef5;
  }

  .palette-categories {
    padding: 16px;
    border-bottom: 1px solid #ebeef5;
    overflow-x: auto;

    :deep(.el-button-group) {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .el-button {
        margin: 0;
        flex-shrink: 0;
      }
    }
  }

  .palette-components {
    flex: 1;
    overflow: hidden;

    .component-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 16px;
      padding: 16px;
    }

    .component-item {
      position: relative;
      padding: 16px;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      background: #fff;
      text-align: center;

      &:hover {
        border-color: #409eff;
        box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
        transform: translateY(-2px);
      }

      &[draggable='true'] {
        cursor: move;
      }

      .component-icon {
        font-size: 32px;
        color: #409eff;
        margin-bottom: 8px;
      }

      .component-name {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .component-description {
        font-size: 12px;
        color: #909399;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .custom-tag {
        position: absolute;
        top: 8px;
        right: 8px;
      }
    }
  }

  .component-detail {
    .detail-header {
      text-align: center;
      padding: 20px 0;

      .detail-icon {
        font-size: 48px;
        color: #409eff;
        margin-bottom: 12px;
      }

      h3 {
        margin: 0 0 8px;
        font-size: 18px;
        color: #303133;
      }

      .detail-name {
        margin: 0;
        font-size: 12px;
        color: #909399;
        font-family: 'Consolas', monospace;
      }
    }

    .detail-section {
      margin-bottom: 20px;

      h4 {
        margin: 0 0 12px;
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: #606266;
        line-height: 1.6;
      }
    }

    .detail-actions {
      margin-top: 24px;
      text-align: center;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
