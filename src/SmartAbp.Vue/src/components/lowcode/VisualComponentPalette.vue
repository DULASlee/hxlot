<template>
  <div class="visual-component-palette">
    <el-card>
      <template #header>
        <span>组件面板</span>
      </template>

      <div class="content">
        <!-- 基础组件 -->
        <div class="component-category">
          <h4 class="category-title">
            <i class="el-icon-collection" />
            基础组件
          </h4>
          <div class="components-grid">
            <div
              v-for="component in basicComponents"
              :key="component.type"
              class="component-item"
              draggable="true"
              @dragstart="handleDragStart($event, component)"
            >
              <div class="component-icon">
                <i :class="component.icon" />
              </div>
              <span class="component-name">{{ component.name }}</span>
            </div>
          </div>
        </div>

        <!-- 表单组件 -->
        <div class="component-category">
          <h4 class="category-title">
            <i class="el-icon-edit-outline" />
            表单组件
          </h4>
          <div class="components-grid">
            <div
              v-for="component in formComponents"
              :key="component.type"
              class="component-item"
              draggable="true"
              @dragstart="handleDragStart($event, component)"
            >
              <div class="component-icon">
                <i :class="component.icon" />
              </div>
              <span class="component-name">{{ component.name }}</span>
            </div>
          </div>
        </div>

        <!-- 数据展示 -->
        <div class="component-category">
          <h4 class="category-title">
            <i class="el-icon-data-analysis" />
            数据展示
          </h4>
          <div class="components-grid">
            <div
              v-for="component in dataComponents"
              :key="component.type"
              class="component-item"
              draggable="true"
              @dragstart="handleDragStart($event, component)"
            >
              <div class="component-icon">
                <i :class="component.icon" />
              </div>
              <span class="component-name">{{ component.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  components?: any[]
}

defineProps<Props>()

const emit = defineEmits<{
  'component-selected': [component: any]
  'component-drag-start': [component: any, event: DragEvent]
}>()

// 基础组件
const basicComponents = ref([
  { type: 'div', name: '容器', icon: 'el-icon-box' },
  { type: 'button', name: '按钮', icon: 'el-icon-switch-button' },
  { type: 'text', name: '文本', icon: 'el-icon-document' },
  { type: 'image', name: '图片', icon: 'el-icon-picture' },
  { type: 'link', name: '链接', icon: 'el-icon-link' },
  { type: 'icon', name: '图标', icon: 'el-icon-star-off' },
])

// 表单组件
const formComponents = ref([
  { type: 'input', name: '输入框', icon: 'el-icon-edit' },
  { type: 'textarea', name: '文本域', icon: 'el-icon-document-copy' },
  { type: 'select', name: '选择器', icon: 'el-icon-arrow-down' },
  { type: 'checkbox', name: '复选框', icon: 'el-icon-check' },
  { type: 'radio', name: '单选框', icon: 'el-icon-circle-check' },
  { type: 'date-picker', name: '日期选择', icon: 'el-icon-date' },
  { type: 'upload', name: '文件上传', icon: 'el-icon-upload' },
])

// 数据展示组件
const dataComponents = ref([
  { type: 'table', name: '表格', icon: 'el-icon-menu' },
  { type: 'list', name: '列表', icon: 'el-icon-tickets' },
  { type: 'card', name: '卡片', icon: 'el-icon-postcard' },
  { type: 'chart', name: '图表', icon: 'el-icon-data-line' },
  { type: 'progress', name: '进度条', icon: 'el-icon-loading' },
  { type: 'tag', name: '标签', icon: 'el-icon-price-tag' },
])

// 拖拽开始
const handleDragStart = (event: DragEvent, component: any) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(component))
    event.dataTransfer.effectAllowed = 'copy'
  }
  emit('component-drag-start', component, event)
}
</script>

<style scoped>
.visual-component-palette {
  height: 100%;
}

.content {
  padding: 16px;
}

.component-category {
  margin-bottom: 24px;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.components-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s ease;
  background: var(--el-bg-color);
  min-height: 70px;
  justify-content: center;
}

.component-item:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.15);
}

.component-item:active {
  cursor: grabbing;
  transform: translateY(0);
}

.component-icon {
  margin-bottom: 6px;
}

.component-icon i {
  font-size: 20px;
  color: var(--el-color-primary);
}

.component-name {
  font-size: 12px;
  color: var(--el-text-color-regular);
  text-align: center;
  line-height: 1.2;
}
</style>
