<template>
  <div class="page-builder">
    <div class="builder-toolbar">
      <el-button-group>
        <el-button size="small" @click="addComponent">
          <el-icon><Plus /></el-icon>
          添加组件
        </el-button>
        <el-button size="small" @click="preview">
          <el-icon><View /></el-icon>
          预览
        </el-button>
        <el-button size="small" @click="save">
          <el-icon><Document /></el-icon>
          保存
        </el-button>
        <el-button size="small" @click="exportPage">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </el-button-group>
    </div>

    <div class="builder-content">
      <!-- 组件库 -->
      <div class="component-library">
        <h3>组件库</h3>
        <draggable
          v-model="components"
          :group="{ name: 'components', pull: 'clone', put: false }"
          :clone="cloneComponent"
          item-key="id"
        >
          <template #item="{ element }">
            <div class="component-item">
              <el-icon>{{ element.icon }}</el-icon>
              {{ element.label }}
            </div>
          </template>
        </draggable>
      </div>

      <!-- 画布 -->
      <div class="page-canvas">
        <draggable
          v-model="pageComponents"
          group="components"
          item-key="id"
          @change="handleComponentChange"
        >
          <template #item="{ element, index }">
            <div
              class="canvas-component"
              :class="{ selected: selectedIndex === index }"
              @click="selectComponent(index)"
            >
              <component :is="element.component" v-bind="element.props" />
              <div class="component-actions">
                <el-button size="small" @click.stop="editComponent(index)">编辑</el-button>
                <el-button size="small" type="danger" @click.stop="deleteComponent(index)">删除</el-button>
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <!-- 属性面板 -->
      <div class="property-panel">
        <h3>属性配置</h3>
        <div v-if="selectedComponent">
          <el-form label-position="top">
            <el-form-item
              v-for="prop in selectedComponent.editableProps"
              :key="prop.name"
              :label="prop.label"
            >
              <el-input v-model="selectedComponent.props[prop.name]" />
            </el-form-item>
          </el-form>
        </div>
        <el-empty v-else description="请选择一个组件" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import draggable from 'vuedraggable'
import { ElButton, ElButtonGroup, ElIcon, ElForm, ElFormItem, ElInput, ElEmpty, ElMessage } from 'element-plus'
import { Plus, View, Document, Download } from '@element-plus/icons-vue'

const components = ref([
  { id: 'btn', label: '按钮', icon: 'Button', component: 'el-button' },
  { id: 'input', label: '输入框', icon: 'Edit', component: 'el-input' },
  { id: 'table', label: '表格', icon: 'Grid', component: 'el-table' }
])

const pageComponents = ref<any[]>([])
const selectedIndex = ref<number | null>(null)

const selectedComponent = computed(() => {
  if (selectedIndex.value === null) return null
  return pageComponents.value[selectedIndex.value]
})

const cloneComponent = (comp: any) => ({
  ...comp,
  id: `${comp.id}_${Date.now()}`,
  props: {},
  editableProps: [
    { name: 'label', label: '标签' },
    { name: 'placeholder', label: '占位符' }
  ]
})

const handleComponentChange = () => {
  // Handle component changes
}

const selectComponent = (index: number) => {
  selectedIndex.value = index
}

const addComponent = () => {
  ElMessage.info('请从左侧组件库拖拽组件到画布')
}

const editComponent = (index: number) => {
  selectedIndex.value = index
}

const deleteComponent = (index: number) => {
  pageComponents.value.splice(index, 1)
  if (selectedIndex.value === index) {
    selectedIndex.value = null
  }
}

const preview = () => {
  ElMessage.success('预览功能')
}

const save = () => {
  ElMessage.success('保存成功')
}

const exportPage = () => {
  ElMessage.success('导出成功')
}
</script>

<style scoped>
.page-builder {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.builder-toolbar {
  padding: 12px;
  border-bottom: 1px solid #dcdfe6;
}

.builder-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.component-library {
  width: 200px;
  border-right: 1px solid #dcdfe6;
  padding: 12px;
  overflow-y: auto;
}

.component-item {
  padding: 8px 12px;
  margin-bottom: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  cursor: move;
  display: flex;
  align-items: center;
  gap: 8px;
}

.component-item:hover {
  background: #e4e7ed;
}

.page-canvas {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #fafafa;
}

.canvas-component {
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border: 2px dashed transparent;
  border-radius: 4px;
  position: relative;
}

.canvas-component:hover {
  border-color: #409eff;
}

.canvas-component.selected {
  border-color: #409eff;
  border-style: solid;
}

.component-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: none;
}

.canvas-component:hover .component-actions {
  display: block;
}

.property-panel {
  width: 300px;
  border-left: 1px solid #dcdfe6;
  padding: 12px;
  overflow-y: auto;
}
</style>
