<template>
  <div class="lowcode-studio">
    <!-- 顶部工具栏 -->
    <div class="studio-header">
      <div class="header-left">
        <div class="logo">
          <el-icon><MagicStick /></el-icon>
          <span class="logo-text">SmartAbp LowCode Studio</span>
        </div>
        
        <el-divider direction="vertical" />
        
        <div class="project-info">
          <span class="project-name">{{ designerStore.currentProject.name }}</span>
          <el-tag v-if="designerStore.isDirty" type="warning" size="small">未保存</el-tag>
        </div>
      </div>
      
      <div class="header-center">
        <!-- 模式切换 -->
        <el-radio-group v-model="designerStore.designerMode" size="small">
          <el-radio-button value="design">
            <el-icon><Edit /></el-icon>
            设计
          </el-radio-button>
          <el-radio-button value="preview">
            <el-icon><View /></el-icon>
            预览
          </el-radio-button>
          <el-radio-button value="code">
            <el-icon><Document /></el-icon>
            代码
          </el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="header-right">
        <!-- 操作按钮 -->
        <el-button-group size="small">
          <el-button
            :disabled="!designerStore.canUndo"
            :icon="RefreshLeft"
            title="撤销 (Ctrl+Z)"
            @click="designerStore.undo()"
          />
          <el-button
            :disabled="!designerStore.canRedo"
            :icon="RefreshRight"
            title="重做 (Ctrl+Y)"
            @click="designerStore.redo()"
          />
        </el-button-group>
        
        <el-divider direction="vertical" />
        
        <el-button-group size="small">
          <el-button
            :icon="Grid"
            :type="designerStore.gridSettings.enabled ? 'primary' : 'default'"
            title="网格对齐"
            @click="designerStore.toggleGrid()"
          />
          <el-button
            :icon="ZoomIn"
            title="放大"
            @click="handleZoomIn"
          />
          <el-button
            :icon="ZoomOut"
            title="缩小"
            @click="handleZoomOut"
          />
          <el-button
            title="重置缩放"
            @click="designerStore.resetZoom()"
          >
            {{ designerStore.zoomLevel }}%
          </el-button>
        </el-button-group>
        
        <el-divider direction="vertical" />
        
        <el-button
          :loading="isSaving"
          size="small"
          type="primary"
          @click="handleSave"
        >
          <el-icon><DocumentChecked /></el-icon>
          保存
        </el-button>
        
        <el-dropdown @command="handleMenuCommand">
          <el-button size="small">
            <el-icon><More /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="new">
                <el-icon><Plus /></el-icon>
                新建项目
              </el-dropdown-item>
              <el-dropdown-item command="open">
                <el-icon><FolderOpened /></el-icon>
                打开项目
              </el-dropdown-item>
              <el-dropdown-item command="export">
                <el-icon><Download /></el-icon>
                导出
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>
                设置
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <!-- 主工作区 -->
    <div class="studio-workspace">
      <!-- 左侧：组件面板 -->
      <div class="workspace-left">
        <el-tabs v-model="leftTabActive" class="sidebar-tabs">
          <el-tab-pane label="组件" name="components">
            <LdVisualComponentPalette
              @component-drag-start="handleComponentDragStart"
              @component-drag-end="handleComponentDragEnd"
            />
          </el-tab-pane>
          <el-tab-pane label="大纲" name="outline">
            <div class="outline-panel">
              <el-tree
                :data="componentTreeData"
                :props="{ label: 'name', children: 'children' }"
                node-key="id"
                @node-click="handleTreeNodeClick"
              >
                <template #default="{ node, data }">
                  <span class="tree-node">
                    <el-icon><Component /></el-icon>
                    {{ node.label }}
                  </span>
                </template>
              </el-tree>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <!-- 中间：设计画布 -->
      <div class="workspace-center">
        <div class="canvas-container">
          <LdVisualDesignCanvas
            v-if="designerStore.designerMode === 'design'"
            :page-data="pageData"
            @component-select="handleComponentSelect"
            @component-update="handleComponentUpdate"
            @component-delete="handleComponentDelete"
          />
          
          <div v-else-if="designerStore.designerMode === 'preview'" class="preview-mode">
            <el-empty description="预览模式开发中..." />
          </div>
          
          <div v-else class="code-mode">
            <el-tabs v-model="codeTabActive">
              <el-tab-pane label="Template" name="template">
                <pre class="code-preview"><code>{{ generatedTemplate }}</code></pre>
              </el-tab-pane>
              <el-tab-pane label="Script" name="script">
                <pre class="code-preview"><code>{{ generatedScript }}</code></pre>
              </el-tab-pane>
              <el-tab-pane label="Style" name="style">
                <pre class="code-preview"><code>{{ generatedStyle }}</code></pre>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
        
        <!-- 状态栏 -->
        <div class="canvas-statusbar">
          <span class="status-item">
            <el-icon><Box /></el-icon>
            {{ designerStore.componentCount }} 个组件
          </span>
          <span class="status-item">
            <el-icon><Position /></el-icon>
            {{ selectedComponentPosition }}
          </span>
          <span class="status-item">
            <el-icon><Clock /></el-icon>
            {{ currentTime }}
          </span>
        </div>
      </div>
      
      <!-- 右侧：属性面板 -->
      <div class="workspace-right">
        <el-tabs v-model="rightTabActive" class="sidebar-tabs">
          <el-tab-pane label="属性" name="properties">
            <LdComponentPropertyPanel
              :selected-component="designerStore.selectedComponent"
              @update:component="handlePropertyUpdate"
              @delete:component="handlePropertyDelete"
              @close="designerStore.clearSelection()"
            />
          </el-tab-pane>
          <el-tab-pane label="样式" name="styles">
            <div class="styles-panel">
              <el-empty description="样式编辑器开发中..." :image-size="80" />
            </div>
          </el-tab-pane>
          <el-tab-pane label="事件" name="events">
            <div class="events-panel">
              <el-empty description="事件编辑器开发中..." :image-size="80" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  MagicStick, Edit, View, Document, RefreshLeft, RefreshRight,
  Grid, ZoomIn, ZoomOut, DocumentChecked, More, Plus,
  FolderOpened, Download, Setting, Operation, Box, Position, Clock
} from '@element-plus/icons-vue'
import { useDesignerStore } from './stores/useDesignerStore'
import {
  LdVisualComponentPalette,
  LdVisualDesignCanvas,
  LdComponentPropertyPanel
} from './components'
import type { CanvasComponent } from '@smartabp/lowcode-designer/types'

// ==================== 状态管理 ====================

const designerStore = useDesignerStore()

// 标签页状态
const leftTabActive = ref('components')
const rightTabActive = ref('properties')
const codeTabActive = ref('template')

// 保存状态
const isSaving = ref(false)

// 当前时间
const currentTime = ref(new Date().toLocaleTimeString())

// ==================== 计算属性 ====================

// 页面数据
const pageData = computed(() => ({
  components: designerStore.canvasComponents
}))

// 组件树数据
const componentTreeData = computed(() => {
  return designerStore.canvasComponents.map((c: any) => ({
    id: c.id,
    name: c.name || c.type,
    children: []
  }))
})

// 选中组件位置
const selectedComponentPosition = computed(() => {
  const comp = designerStore.selectedComponent
  if (!comp || !comp.style) return '-'
  return `X: ${comp.style.left || 0}, Y: ${comp.style.top || 0}`
})

// 生成的模板代码
const generatedTemplate = computed(() => {
  if (designerStore.canvasComponents.length === 0) {
    return '<template>\n  <div class="page">\n    <!-- 暂无组件 -->\n  </div>\n</template>'
  }
  
  let template = '<template>\n  <div class="page">\n'
  designerStore.canvasComponents.forEach((comp: any) => {
    template += `    <${comp.type} :style="{ left: '${comp.style?.left}', top: '${comp.style?.top}' }">\n`
    template += `      ${comp.props.text || comp.name}\n`
    template += `    </${comp.type}>\n`
  })
  template += '  </div>\n</template>'
  return template
})

// 生成的脚本代码
const generatedScript = computed(() => {
  return `<script setup lang="ts">
import { ref } from 'vue'

// 组件逻辑
const data = ref({})
</script>`
})

// 生成的样式代码
const generatedStyle = computed(() => {
  return `<style scoped lang="scss">
.page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: #f5f5f5;
}
</style>`
})

// ==================== 事件处理 ====================

// 组件拖拽开始
const handleComponentDragStart = (componentType: string) => {
  console.log('拖拽开始:', componentType)
}

// 组件拖拽结束
const handleComponentDragEnd = () => {
  console.log('拖拽结束')
}

// 组件选择
const handleComponentSelect = (componentId: string) => {
  designerStore.selectComponent(componentId)
}

// 组件更新
const handleComponentUpdate = (component: CanvasComponent) => {
  designerStore.updateComponent(component.id, component)
}

// 组件删除
const handleComponentDelete = (componentId: string) => {
  designerStore.deleteComponent(componentId)
}

// 属性更新
const handlePropertyUpdate = (component: CanvasComponent) => {
  designerStore.updateComponent(component.id, component)
}

// 属性面板删除
const handlePropertyDelete = (componentId: string) => {
  designerStore.deleteComponent(componentId)
}

// 树节点点击
const handleTreeNodeClick = (data: any) => {
  designerStore.selectComponent(data.id)
}

// 放大
const handleZoomIn = () => {
  designerStore.setZoomLevel(designerStore.zoomLevel + 10)
}

// 缩小
const handleZoomOut = () => {
  designerStore.setZoomLevel(designerStore.zoomLevel - 10)
}

// 保存
const handleSave = async () => {
  isSaving.value = true
  try {
    await designerStore.saveProject()
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    isSaving.value = false
  }
}

// 菜单命令
const handleMenuCommand = async (command: string) => {
  switch (command) {
    case 'new':
      if (designerStore.isDirty) {
        try {
          await ElMessageBox.confirm('当前项目未保存，是否继续？', '提示', {
            type: 'warning'
          })
        } catch {
          return
        }
      }
      designerStore.newProject()
      ElMessage.success('新建项目成功')
      break
    case 'open':
      ElMessage.info('打开项目功能开发中...')
      break
    case 'export':
      ElMessage.info('导出功能开发中...')
      break
    case 'settings':
      ElMessage.info('设置功能开发中...')
      break
  }
}

// ==================== 快捷键 ====================

const handleKeyDown = (e: KeyboardEvent) => {
  // Ctrl+S 保存
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault()
    handleSave()
  }
  
  // Ctrl+Z 撤销
  if (e.ctrlKey && e.key === 'z') {
    e.preventDefault()
    designerStore.undo()
  }
  
  // Ctrl+Y 重做
  if (e.ctrlKey && e.key === 'y') {
    e.preventDefault()
    designerStore.redo()
  }
  
  // Delete 删除选中组件
  if (e.key === 'Delete' && designerStore.selectedComponentId) {
    designerStore.deleteComponent(designerStore.selectedComponentId)
  }
}

// ==================== 生命周期 ====================

onMounted(() => {
  // 初始化设计器
  designerStore.initialize()
  
  // 监听快捷键
  window.addEventListener('keydown', handleKeyDown)
  
  // 更新时间
  const timer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString()
  }, 1000)
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    clearInterval(timer)
  })
})
</script>

<style scoped lang="scss">
.lowcode-studio {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f0f2f5;
  overflow: hidden;
}

.studio-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .header-left,
  .header-center,
  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    color: #1890ff;
    
    .logo-text {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
  
  .project-info {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .project-name {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }
  }
}

.studio-workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.workspace-left,
.workspace-right {
  width: 280px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  
  .sidebar-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    :deep(.el-tabs__content) {
      flex: 1;
      overflow: auto;
    }
  }
}

.workspace-right {
  border-right: none;
  border-left: 1px solid #e8e8e8;
}

.workspace-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .canvas-container {
    flex: 1;
    overflow: auto;
    background: #fafafa;
  }
  
  .canvas-statusbar {
    display: flex;
    align-items: center;
    gap: 16px;
    height: 32px;
    padding: 0 16px;
    background: #fff;
    border-top: 1px solid #e8e8e8;
    font-size: 12px;
    color: #666;
    
    .status-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.outline-panel,
.styles-panel,
.events-panel {
  padding: 16px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 4px;
}

.preview-mode,
.code-mode {
  padding: 16px;
  height: 100%;
}

.code-preview {
  background: #282c34;
  color: #abb2bf;
  padding: 16px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow: auto;
  
  code {
    display: block;
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>

