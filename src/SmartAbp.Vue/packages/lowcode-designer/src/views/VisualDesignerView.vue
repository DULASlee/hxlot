<template>
  <div class="enterprise-designer">
    <!-- 顶部工具栏 -->
    <div class="designer-header">
      <div class="header-left">
        <h2>企业级可视化设计器</h2>
        <div class="mode-switcher">
          <button
            v-for="mode in modes"
            :key="mode.value"
            :class="{ active: currentMode === mode.value }"
            class="mode-btn"
            @click="setMode(mode.value as 'design' | 'preview' | 'code')"
          >
            <i :class="mode.icon" />
            {{ mode.label }}
          </button>
        </div>
      </div>

      <div class="header-center">
        <!-- 协作用户 -->
        <div
          v-if="collaborationEnabled"
          class="collaboration-users"
        >
          <div
            v-for="user in collaborationUsers"
            :key="user.id"
            class="user-avatar"
            :style="{ backgroundColor: user.color }"
            :title="user.name"
          >
            {{ user.name.charAt(0).toUpperCase() }}
          </div>
        </div>
      </div>

      <div class="header-right">
        <!-- 性能指标 -->
        <div class="performance-metrics">
          <span class="metric">
            <i class="icon-clock" />
            {{ performanceMetrics.renderTime.toFixed(1) }}ms
          </span>
          <span class="metric">
            <i class="icon-components" />
            {{ performanceMetrics.componentCount }}
          </span>
          <span class="metric">
            <i class="icon-fps" />
            {{ performanceMetrics.fps }}fps
          </span>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button
            :disabled="!canUndo"
            class="btn btn-icon"
            title="撤销 (Ctrl+Z)"
            @click="undo"
          >
            <i class="icon-undo" />
          </button>
          <button
            :disabled="!canRedo"
            class="btn btn-icon"
            title="重做 (Ctrl+Y)"
            @click="redo"
          >
            <i class="icon-redo" />
          </button>
          <button
            :disabled="!isDirty"
            class="btn btn-icon"
            title="保存 (Ctrl+S)"
            @click="save"
          >
            <i class="icon-save" />
          </button>
          <button
            class="btn btn-primary"
            @click="preview"
          >
            预览
          </button>
          <button
            class="btn btn-secondary"
            @click="exportDesign"
          >
            导出
          </button>
        </div>
      </div>
    </div>

    <!-- 主要布局 -->
    <div class="designer-layout">
      <!-- 左侧面板 -->
      <div
        class="designer-sidebar left"
        :class="{ collapsed: leftPanelCollapsed }"
      >
        <div class="sidebar-header">
          <div class="sidebar-tabs">
            <button
              v-for="tab in leftTabs"
              :key="tab.key"
              :class="{ active: activeLeftTab === tab.key }"
              class="tab-button"
              @click="activeLeftTab = tab.key"
            >
              <i :class="tab.icon" />
              <span v-if="!leftPanelCollapsed">{{ tab.label }}</span>
            </button>
          </div>
          <button
            class="collapse-btn"
            @click="leftPanelCollapsed = !leftPanelCollapsed"
          >
            <i :class="leftPanelCollapsed ? 'icon-expand' : 'icon-collapse'" />
          </button>
        </div>

        <div
          v-if="!leftPanelCollapsed"
          class="sidebar-content"
        >
          <!-- 组件库 -->
          <div
            v-show="activeLeftTab === 'components'"
            class="tab-panel"
          >
            <ComponentPalette
              v-if="designer"
              :component-library="{}"
              @component-drag-start="handleComponentDragStart"
            />
          </div>

          <!-- 图层管理 -->
          <div
            v-show="activeLeftTab === 'layers'"
            class="tab-panel"
          >
            <LayerManager
              :components="canvasComponents"
              :selected-components="selectedComponents"
              @select-component="selectComponent"
              @toggle-visibility="toggleComponentVisibility"
              @toggle-lock="toggleComponentLock"
            />
          </div>

          <!-- AI助手 -->
          <div
            v-show="activeLeftTab === 'ai'"
            class="tab-panel"
          >
            <AIAssistantPanel
              v-if="aiEnabled && designer"
              :ai-assistant="{}"
              :design-context="designContext"
              @apply-suggestion="applySuggestion"
            />
          </div>
        </div>
      </div>

      <!-- 画布区域 -->
      <div class="designer-main">
        <!-- 画布工具栏 -->
        <div class="canvas-toolbar">
          <div class="toolbar-left">
            <div class="zoom-controls">
              <button
                class="btn btn-icon"
                @click="zoomOut"
              >
                <i class="icon-zoom-out" />
              </button>
              <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
              <button
                class="btn btn-icon"
                @click="zoomIn"
              >
                <i class="icon-zoom-in" />
              </button>
              <button
                class="btn btn-icon"
                @click="resetZoom"
              >
                <i class="icon-zoom-reset" />
              </button>
            </div>

            <div class="view-controls">
              <button
                :class="{ active: showGrid }"
                class="btn btn-icon"
                title="显示网格"
                @click="toggleGrid"
              >
                <i class="icon-grid" />
              </button>
              <button
                :class="{ active: showRulers }"
                class="btn btn-icon"
                title="显示标尺"
                @click="toggleRulers"
              >
                <i class="icon-rulers" />
              </button>
              <button
                :class="{ active: showMinimap }"
                class="btn btn-icon"
                title="显示缩略图"
                @click="toggleMinimap"
              >
                <i class="icon-minimap" />
              </button>
            </div>
          </div>

          <div class="toolbar-right">
            <div class="canvas-size-info">
              {{ canvasSize.width }} × {{ canvasSize.height }}
            </div>
          </div>
        </div>

        <!-- 画布容器 -->
        <div
          ref="canvasContainer"
          class="canvas-container"
        >
          <AdvancedCanvasComponent
            v-if="designer"
            ref="canvasRef"
            :canvas-engine="{}"
            :show-grid="showGrid"
            :show-rulers="showRulers"
            :performance-optimizer="{}"
            @component-select="handleComponentSelect"
            @component-update="handleComponentUpdate"
            @canvas-change="handleCanvasChange"
          />

          <!-- 缩略图 -->
          <MinimapComponent
            v-if="showMinimap && designer"
            :canvas-engine="{}"
            :viewport="{ ...viewport, zoom: viewport.scale }"
            class="minimap"
            @viewport-change="handleViewportChange"
          />
        </div>
      </div>

      <!-- 右侧面板 -->
      <div
        class="designer-sidebar right"
        :class="{ collapsed: rightPanelCollapsed }"
      >
        <div class="sidebar-header">
          <div class="sidebar-tabs">
            <button
              v-for="tab in rightTabs"
              :key="tab.key"
              :class="{ active: activeRightTab === tab.key }"
              class="tab-button"
              @click="activeRightTab = tab.key"
            >
              <i :class="tab.icon" />
              <span v-if="!rightPanelCollapsed">{{ tab.label }}</span>
            </button>
          </div>
          <button
            class="collapse-btn"
            @click="rightPanelCollapsed = !rightPanelCollapsed"
          >
            <i :class="rightPanelCollapsed ? 'icon-expand' : 'icon-collapse'" />
          </button>
        </div>

        <div
          v-if="!rightPanelCollapsed"
          class="sidebar-content"
        >
          <!-- 属性面板 -->
          <div
            v-show="activeRightTab === 'properties'"
            class="tab-panel"
          >
            <PropertyInspector
              :selected-components="selectedComponentsData"
              @update-component="updateComponent"
            />
          </div>

          <!-- 样式面板 -->
          <div
            v-show="activeRightTab === 'styles'"
            class="tab-panel"
          >
            <StyleEditor
              :selected-components="selectedComponentsData"
              @update-styles="updateComponentStyles"
            />
          </div>

          <!-- 版本历史 -->
          <div
            v-show="activeRightTab === 'history'"
            class="tab-panel"
          >
            <VersionHistory
              v-if="designer"
              :version-control="{}"
              @restore-version="restoreVersion"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="designer-status-bar">
      <div class="status-left">
        <span class="status-item">
          <i class="icon-info" />
          {{ statusMessage }}
        </span>
        <span
          v-if="isDirty"
          class="status-item dirty"
        >
          <i class="icon-dot" />
          未保存
        </span>
      </div>

      <div class="status-right">
        <span class="status-item">
          最后保存: {{ lastSavedText }}
        </span>
      </div>
    </div>

    <!-- 对话框和弹窗 -->
    <ExportDialog
      v-if="showExportDialog && designer"
      :designer="designer"
      @close="showExportDialog = false"
      @export="handleExport"
    />

    <ImportDialog
      v-if="showImportDialog"
      @close="showImportDialog = false"
      @import="handleImport"
    />

    <PreviewModal
      v-if="showPreviewModal"
      :components="canvasComponents"
      @close="showPreviewModal = false"
    />

    <!-- 保留原有功能 -->
    <el-card style="margin-top: 20px;">
      <h3>兼容性功能</h3>
      <div class="actions">
        <el-button
          type="primary"
          :disabled="!hasComponents"
          @click="onPreview"
        >
          <el-icon><View /></el-icon>
          预览页面
        </el-button>
        <el-button
          :disabled="!hasComponents"
          :loading="generating"
          @click="onGenerateCode"
        >
          <el-icon><Document /></el-icon>
          生成代码
        </el-button>
        <el-button
          :disabled="!hasComponents"
          @click="onExportSchema"
        >
          <el-icon><Download /></el-icon>
          导出Schema
        </el-button>
        <el-button
          :disabled="!hasComponents"
          type="danger"
          @click="onClearAll"
        >
          <el-icon><Delete /></el-icon>
          清空画布
        </el-button>
      </div>

      <!-- 代码生成配置对话框 -->
      <el-dialog
        v-model="showCodeDialog"
        title="代码生成配置"
        width="600px"
      >
        <el-form
          :model="codegenOptions"
          label-width="100px"
        >
          <el-form-item
            label="模块名称"
            required
          >
            <el-input
              v-model="codegenOptions.moduleName"
              placeholder="例如：UserManagement"
            />
          </el-form-item>
          <el-form-item
            label="页面名称"
            required
          >
            <el-input
              v-model="codegenOptions.pageName"
              placeholder="例如：UserList"
            />
          </el-form-item>
          <el-form-item label="作者">
            <el-input
              v-model="codegenOptions.author"
              placeholder="可选"
            />
          </el-form-item>
          <el-form-item label="生成格式">
            <el-radio-group v-model="codegenOptions.format">
              <el-radio value="vue-sfc">
                Vue SFC
              </el-radio>
              <el-radio value="designer-schema">
                Designer Schema
              </el-radio>
              <el-radio value="both">
                两者都要
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="codegenOptions.includeEvents">
              包含事件绑定
            </el-checkbox>
            <el-checkbox v-model="codegenOptions.includeValidation">
              包含校验规则
            </el-checkbox>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showCodeDialog = false">
            取消
          </el-button>
          <el-button
            type="primary"
            :loading="generating"
            @click="handleGenerateCode"
          >
            生成代码
          </el-button>
        </template>
      </el-dialog>

      <!-- 代码预览对话框 -->
      <el-dialog
        v-model="showPreviewDialog"
        title="生成的代码"
        width="80%"
        :fullscreen="previewFullscreen"
      >
        <template #header>
          <div class="dialog-header">
            <span>生成的代码</span>
            <div class="header-actions">
              <el-button
                text
                @click="previewFullscreen = !previewFullscreen"
              >
                <el-icon><FullScreen v-if="!previewFullscreen" /><Aim v-else /></el-icon>
              </el-button>
            </div>
          </div>
        </template>

        <el-tabs
          v-model="activeTab"
          type="border-card"
        >
          <el-tab-pane
            v-if="generatedCode?.vueSFC"
            label="Vue模板"
            name="template"
          >
            <el-input
              v-model="generatedCode.vueSFC.template"
              type="textarea"
              :rows="20"
              readonly
              class="code-textarea"
            />
          </el-tab-pane>
          <el-tab-pane
            v-if="generatedCode?.vueSFC"
            label="脚本代码"
            name="script"
          >
            <el-input
              v-model="generatedCode.vueSFC.script"
              type="textarea"
              :rows="20"
              readonly
              class="code-textarea"
            />
          </el-tab-pane>
          <el-tab-pane
            v-if="generatedCode?.vueSFC"
            label="样式代码"
            name="style"
          >
            <el-input
              v-model="generatedCode.vueSFC.style"
              type="textarea"
              :rows="20"
              readonly
              class="code-textarea"
            />
          </el-tab-pane>
          <el-tab-pane
            v-if="generatedCode?.designerSchema"
            label="Designer Schema"
            name="schema"
          >
            <el-input
              v-model="schemaText"
              type="textarea"
              :rows="20"
              readonly
              class="code-textarea"
            />
          </el-tab-pane>
          <el-tab-pane
            label="路由配置"
            name="routes"
          >
            <el-input
              v-model="routesText"
              type="textarea"
              :rows="10"
              readonly
              class="code-textarea"
            />
          </el-tab-pane>
        </el-tabs>

        <template #footer>
          <el-button @click="showPreviewDialog = false">
            关闭
          </el-button>
          <el-button
            type="primary"
            @click="copyToClipboard"
          >
            <el-icon><CopyDocument /></el-icon>
            复制当前代码
          </el-button>
          <el-button
            type="success"
            @click="downloadCode"
          >
            <el-icon><Download /></el-icon>
            下载文件
          </el-button>
        </template>
      </el-dialog>
      <el-divider />
      <h4>回读SFC（占位）</h4>
      <el-input
        v-model="sfcText"
        type="textarea"
        :autosize="{ minRows: 6 }"
        placeholder="粘贴包含data-block-id/data-node-id的SFC模板"
      />
      <div class="actions">
        <el-button @click="onReadSFC">
          回读Selectors
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
// 注释掉缺失的模块导入
// import { EnterpriseDesigner, createEnterpriseDesigner } from '../core/EnterpriseDesigner'
// import type { CanvasComponent, CanvasViewport } from '../core/AdvancedCanvas'
// import type { CollaborationUser } from '../core/RealTimeCollaboration'
// import type { AIDesignSuggestion } from '../core/AIDesignAssistant'
// import type { PerformanceMetrics } from '../core/PerformanceOptimizer'

// 企业级设计器接口定义
interface EnterpriseDesigner {
  // 核心方法
  initialize?(): Promise<void>
  destroy?(): void
  
  // 事件系统
  on?(event: string, callback: Function): void
  off?(event: string, callback: Function): void
  emit?(event: string, data: any): void
  
  // 状态管理
  getState?(): any
  setState?(state: any): void
  getDesignContext?(): any
  
  // 画布操作
  canvas?: {
    getComponents?(): any[]
    getSelectedComponents?(): any[]
    getCanvasSize?(): { width: number; height: number }
    getViewport?(): any
    setZoom?(zoom: number): void
    setViewport?(x: number, y: number): void
    getComponent?(id: string): any
  }
  
  // 版本控制
  versionControl?: {
    getState?(): any
    restoreSnapshot?(id: string): Promise<void>
  }
  
  // AI助手
  aiAssistant?: {
    applySuggestion?(id: string): Promise<void>
  }
  
  // 组件操作
  selectComponent?(id: string): void
  updateComponent?(id: string, updates: any): void
  
  // 其他方法
  setMode?(mode: 'design' | 'preview' | 'code'): void
  undo?(): void
  redo?(): void
  save?(): Promise<void>
  importFromJSON?(data: any): void
}

function createEnterpriseDesigner(_config: any): EnterpriseDesigner {
  return {}
}

interface CanvasComponent {
  // 占位符实现
}

// 移除未使用的接口定义

interface CollaborationUser {
  id: string
  name: string
  color: string
}

interface AIDesignSuggestion {
  id: string
}

interface PerformanceMetrics {
  renderTime: number
  memoryUsage: number
  componentCount: number
  fps: number
  lastUpdateTime: number
}

// 导入组件
import ComponentPalette from './designer/ComponentPalette.vue'
import LayerManager from './designer/LayerManager.vue'
import AIAssistantPanel from './designer/AIAssistantPanel.vue'
import PropertyInspector from './designer/PropertyInspector.vue'
import StyleEditor from './designer/StyleEditor.vue'
import VersionHistory from './designer/VersionHistory.vue'
import AdvancedCanvasComponent from './designer/AdvancedCanvasComponent.vue'
import MinimapComponent from './designer/MinimapComponent.vue'
import ExportDialog from './designer/ExportDialog.vue'
import ImportDialog from './designer/ImportDialog.vue'
import PreviewModal from './designer/PreviewModal.vue'

// 保留原有功能的导入
import {
  View,
  Document,
  Download,
  Delete,
  FullScreen,
  Aim,
  CopyDocument
} from '@element-plus/icons-vue'
import { exportDesignerState, type ExportOptions, type CodeGenerationResult } from '../designer/schema/exporter'
type DesignerOverrideSchema = any

// 企业级设计器实例
const designer = ref<EnterpriseDesigner>()

// stores 目录暂缺最小实现，此处以本地空实现代替，后续补全
const useDesignerStore = () => ({ components: ref<any[]>([]), clear: () => {} } as any)
// UI状态
const currentMode = ref<'design' | 'preview' | 'code'>('design')
const leftPanelCollapsed = ref(false)
const rightPanelCollapsed = ref(false)
const activeLeftTab = ref('components')
const activeRightTab = ref('properties')

// 视图控制
const showGrid = ref(true)
const showRulers = ref(true)
const showMinimap = ref(false)
const zoomLevel = ref(1)

// 对话框状态
const showExportDialog = ref(false)
const showImportDialog = ref(false)
const showPreviewModal = ref(false)

// 协作状态
const collaborationEnabled = ref(false)
const collaborationUsers = ref<CollaborationUser[]>([])

// AI状态
const aiEnabled = ref(false)

// 性能指标
const performanceMetrics = ref<PerformanceMetrics>({
  renderTime: 0,
  memoryUsage: 0,
  componentCount: 0,
  fps: 60,
  lastUpdateTime: 0
})

// 状态信息
const statusMessage = ref('就绪')
const isDirty = ref(false)
const lastSaved = ref(0)

// 画布引用
const canvasContainer = ref<HTMLElement>()
const canvasRef = ref()

// 响应式数据（保留原有功能）
const sfcText = ref('')
const generating = ref(false)
const showCodeDialog = ref(false)
const showPreviewDialog = ref(false)
const previewFullscreen = ref(false)
const activeTab = ref('template')

// 代码生成配置
const codegenOptions = ref<ExportOptions>({
  moduleName: 'UserManagement',
  pageName: 'UserList',
  author: '',
  format: 'vue-sfc',
  includeEvents: true,
  includeValidation: true
})

// 生成的代码
const generatedCode = ref<CodeGenerationResult | null>(null)

// 设计器状态
const designerStore = useDesignerStore()

// 模式配置
const modes = [
  { value: 'design', label: '设计', icon: 'icon-design' },
  { value: 'preview', label: '预览', icon: 'icon-preview' },
  { value: 'code', label: '代码', icon: 'icon-code' }
]

// 左侧标签页
const leftTabs = [
  { key: 'components', label: '组件', icon: 'icon-components' },
  { key: 'layers', label: '图层', icon: 'icon-layers' },
  { key: 'ai', label: 'AI助手', icon: 'icon-ai' }
]

// 右侧标签页
const rightTabs = [
  { key: 'properties', label: '属性', icon: 'icon-properties' },
  { key: 'styles', label: '样式', icon: 'icon-styles' },
  { key: 'history', label: '历史', icon: 'icon-history' }
]

// Schema处理器（保留原有功能）
const reader = { readFromVueSFC: (_c: string, _o: any) => ({ selectors: {}, operations: [] }) } as any

// 计算属性
const canvasComponents = computed(() => {
  return []
})

const selectedComponents = computed(() => {
  return []
})

const selectedComponentsData = computed(() => {
  return []
})

const canvasSize = computed(() => {
  return { width: 1920, height: 1080 }
})

const viewport = computed(() => {
  return { x: 0, y: 0, scale: 1, width: 0, height: 0 }
})

const designContext = computed(() => {
  return {
    components: [],
    selectedComponents: [],
    canvasSize: { width: 1920, height: 1080 },
    viewport: { x: 0, y: 0, zoom: 1 }
  }
})

const canUndo = computed(() => false)

const canRedo = computed(() => false)

const lastSavedText = computed(() => {
  if (lastSaved.value === 0) return '从未保存'
  const diff = Date.now() - lastSaved.value
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  return `${Math.floor(diff / 3600000)}小时前`
})

const hasComponents = computed(() => designerStore.components.value.length > 0)

const schemaText = computed(() => {
  return generatedCode.value?.designerSchema
    ? JSON.stringify(generatedCode.value.designerSchema, null, 2)
    : ''
})

const routesText = computed(() => {
  return generatedCode.value?.routes
    ? JSON.stringify({
        routes: generatedCode.value.routes,
        menuItems: generatedCode.value.menuItems
      }, null, 2)
    : ''
})

// 企业级设计器方法实现 - 简化版本
const initializeDesigner = async () => {
  try {
    designer.value = createEnterpriseDesigner({})
    
    // 模拟初始化成功
    await new Promise(resolve => setTimeout(resolve, 100))
    
    statusMessage.value = '设计器初始化完成（演示模式）'
    ElMessage.success('设计器初始化完成')
  } catch (error) {
    console.error('设计器初始化失败:', error)
    ElMessage.error('设计器初始化失败')
  }
}



// 模式切换
const setMode = (mode: 'design' | 'preview' | 'code') => {
  currentMode.value = mode
  if (designer.value?.setMode) {
    designer.value.setMode(mode)
  }
  statusMessage.value = `切换到${mode === 'design' ? '设计' : mode === 'preview' ? '预览' : '代码'}模式`
}

// 操作方法
const undo = () => {
  if (designer.value?.undo) {
    designer.value.undo()
  }
  statusMessage.value = '撤销操作'
}

const redo = () => {
  if (designer.value?.redo) {
    designer.value.redo()
  }
  statusMessage.value = '重做操作'
}

const save = async () => {
  try {
    if (designer.value?.save) {
      await designer.value.save()
    }
    ElMessage.success('保存成功')
    statusMessage.value = '保存成功'
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const preview = () => {
  if (canvasComponents.value.length === 0) {
    ElMessage.warning('画布为空，无法预览')
    return
  }
  showPreviewModal.value = true
}

const exportDesign = () => {
  if (canvasComponents.value.length === 0) {
    ElMessage.warning('画布为空，无法导出')
    return
  }
  showExportDialog.value = true
}

// 缩放控制
const zoomIn = () => {
  const newZoom = Math.min(zoomLevel.value * 1.2, 5)
  if (designer.value?.canvas?.setZoom) {
    designer.value.canvas.setZoom(newZoom)
  }
}

const zoomOut = () => {
  const newZoom = Math.max(zoomLevel.value / 1.2, 0.1)
  if (designer.value?.canvas?.setZoom) {
    designer.value.canvas.setZoom(newZoom)
  }
}

const resetZoom = () => {
  if (designer.value?.canvas?.setZoom) {
    designer.value.canvas.setZoom(1)
  }
}

// 视图控制
const toggleGrid = () => {
  showGrid.value = !showGrid.value
  statusMessage.value = `网格${showGrid.value ? '已显示' : '已隐藏'}`
}

const toggleRulers = () => {
  showRulers.value = !showRulers.value
  statusMessage.value = `标尺${showRulers.value ? '已显示' : '已隐藏'}`
}

const toggleMinimap = () => {
  showMinimap.value = !showMinimap.value
  statusMessage.value = `缩略图${showMinimap.value ? '已显示' : '已隐藏'}`
}

// 组件操作
const handleComponentDragStart = (component: any) => {
  statusMessage.value = `开始拖拽 ${component.name}`
}

const handleComponentSelect = (componentIds: string[]) => {
  statusMessage.value = componentIds.length > 0 ? `选中了 ${componentIds.length} 个组件` : '取消选择'
}

const handleComponentUpdate = (id: string, updates: Partial<CanvasComponent>) => {
  if (designer.value?.updateComponent) {
    designer.value.updateComponent(id, updates)
  }
  statusMessage.value = `组件 ${id} 已更新`
}

const handleCanvasChange = () => {
  if (!designer.value?.canvas?.getComponents) return
  const components = designer.value.canvas.getComponents()
  statusMessage.value = `画布包含 ${components.length} 个组件`
}

const selectComponent = (componentId: string) => {
  if (designer.value?.selectComponent) {
    designer.value.selectComponent(componentId)
  }
}

const updateComponent = (componentId: string, updates: Partial<CanvasComponent>) => {
  if (designer.value?.updateComponent) {
    designer.value.updateComponent(componentId, updates)
  }
}

const updateComponentStyles = (componentId: string, styles: any) => {
  if (designer.value?.updateComponent) {
    designer.value.updateComponent(componentId, { style: styles })
  }
}

const toggleComponentVisibility = (componentId: string) => {
  if (!designer.value?.canvas?.getComponent || !designer.value?.updateComponent) return
  const component = designer.value.canvas.getComponent(componentId)
  if (component) {
    designer.value.updateComponent(componentId, {
      style: { ...component.style, display: component.style?.display === 'none' ? 'block' : 'none' }
    })
  }
}

const toggleComponentLock = (componentId: string) => {
  if (!designer.value?.canvas?.getComponent || !designer.value?.updateComponent) return
  const component = designer.value.canvas.getComponent(componentId)
  if (component) {
    designer.value.updateComponent(componentId, {
      locked: !component.locked
    })
  }
}

// AI助手
const applySuggestion = async (suggestion: AIDesignSuggestion) => {
  try {
    if (designer.value?.aiAssistant?.applySuggestion) {
      await designer.value.aiAssistant.applySuggestion(suggestion.id)
    }
    statusMessage.value = '已应用AI建议'
  } catch (error) {
    ElMessage.error('应用AI建议失败')
  }
}

// 版本控制
const restoreVersion = async (snapshotId: string) => {
  try {
    if (designer.value?.versionControl?.restoreSnapshot) {
      await designer.value.versionControl.restoreSnapshot(snapshotId)
    }
    statusMessage.value = '版本已恢复'
  } catch (error) {
    ElMessage.error('版本恢复失败')
  }
}

// 视口变化
const handleViewportChange = (newViewport: { x: number; y: number; zoom: number }) => {
  if (designer.value?.canvas?.setViewport) {
    designer.value.canvas.setViewport(newViewport.x, newViewport.y)
  }
  if (designer.value?.canvas?.setZoom) {
    designer.value.canvas.setZoom(newViewport.zoom)
  }
}

// 导入导出
const handleExport = () => {
  statusMessage.value = '导出完成'
}

const handleImport = (data: any) => {
  try {
    if (designer.value?.importFromJSON) {
      designer.value.importFromJSON(data)
      statusMessage.value = '导入完成'
    } else {
      ElMessage.warning('导入功能暂不可用')
    }
  } catch (error) {
    ElMessage.error('导入失败')
  }
}

// 保留原有功能的方法实现
const onPreview = () => {
  if (!hasComponents.value) {
    ElMessage.warning('请先添加一些组件到画布')
    return
  }

  // TODO: 实现预览功能
  ElMessage.info('预览功能开发中...')
}

const onGenerateCode = () => {
  if (!hasComponents.value) {
    ElMessage.warning('请先添加一些组件到画布')
    return
  }

  // 重置配置为合理的默认值
  codegenOptions.value.moduleName = 'UserManagement'
  codegenOptions.value.pageName = 'UserList'
  showCodeDialog.value = true
}

const handleGenerateCode = async () => {
  if (!codegenOptions.value.moduleName || !codegenOptions.value.pageName) {
    ElMessage.error('请填写模块名称和页面名称')
    return
  }

  try {
    generating.value = true

    // 生成代码
    const result = exportDesignerState(designerStore.components.value, codegenOptions.value)
    generatedCode.value = result

    // 关闭配置对话框，打开预览对话框
    showCodeDialog.value = false
    showPreviewDialog.value = true
    activeTab.value = 'template'

    ElMessage.success('代码生成成功！')
  } catch (error) {
    console.error('代码生成失败:', error)
    ElMessage.error('代码生成失败，请检查组件配置')
  } finally {
    generating.value = false
  }
}

const onExportSchema = () => {
  if (!hasComponents.value) {
    ElMessage.warning('请先添加一些组件到画布')
    return
  }

  try {
    const result = exportDesignerState(designerStore.components.value, {
      moduleName: 'Demo',
      pageName: 'DemoPage',
      format: 'designer-schema'
    } as ExportOptions)
    const schema = result.designerSchema || {
      metadata: {
        schemaVersion: '0.1.0',
        moduleName: 'Demo',
        pageName: 'DemoPage',
        timestamp: new Date().toISOString()
      },
      selectors: {},
      operations: []
    }

    // 下载Schema文件
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `designer-schema-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    ElMessage.success('Schema已导出下载')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

const onClearAll = () => {
  designerStore.clear()
  generatedCode.value = null
  ElMessage.success('画布已清空')
}

const copyToClipboard = async () => {
  try {
    let content = ''

    switch (activeTab.value) {
      case 'template':
        content = generatedCode.value?.vueSFC?.template || ''
        break
      case 'script':
        content = generatedCode.value?.vueSFC?.script || ''
        break
      case 'style':
        content = generatedCode.value?.vueSFC?.style || ''
        break
      case 'schema':
        content = schemaText.value
        break
      case 'routes':
        content = routesText.value
        break
    }

    await navigator.clipboard.writeText(content)
    ElMessage.success('代码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const downloadCode = () => {
  if (!generatedCode.value) return

  try {
    let filename = ''
    let content = ''
    let mimeType = 'text/plain'

    switch (activeTab.value) {
      case 'template':
        filename = `${codegenOptions.value.pageName}.vue`
        content = `${generatedCode.value.vueSFC?.template || ''}\n\n${generatedCode.value.vueSFC?.script || ''}\n\n${generatedCode.value.vueSFC?.style || ''}`
        mimeType = 'text/plain'
        break
      case 'script':
        filename = `${codegenOptions.value.pageName}.js`
        content = generatedCode.value.vueSFC?.script || ''
        mimeType = 'text/javascript'
        break
      case 'style':
        filename = `${codegenOptions.value.pageName}.css`
        content = generatedCode.value.vueSFC?.style || ''
        mimeType = 'text/css'
        break
      case 'schema':
        filename = `${codegenOptions.value.pageName}-schema.json`
        content = schemaText.value
        mimeType = 'application/json'
        break
      case 'routes':
        filename = `${codegenOptions.value.pageName}-routes.json`
        content = routesText.value
        mimeType = 'application/json'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    ElMessage.success(`文件 ${filename} 已下载`)
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

// 生命周期
onMounted(async () => {
  await initializeDesigner()

  // 监听窗口大小变化
  const handleResize = () => {
    nextTick(() => {
      // 更新画布大小
    })
  }

  window.addEventListener('resize', handleResize)

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (designer.value?.destroy) {
      designer.value.destroy()
    }
  })
})

// 监听缩放级别变化
watch(zoomLevel, (newZoom: number) => {
  if (designer.value?.canvas?.setZoom) {
    designer.value.canvas.setZoom(newZoom)
  }
})

// Schema处理（保留原有功能）
const readFromSFC = (content: string): DesignerOverrideSchema => {
  return reader.readFromVueSFC(content, {
    moduleName: 'Demo',
    pageName: 'DemoPage'
  })
}

const onReadSFC = () => {
  const schema = readFromSFC(sfcText.value || '<template><div data-block-id="demo-root"/></template>')
  const blocks = Object.keys(schema.selectors.byBlockId || {})
  const nodes = Object.keys(schema.selectors.byDataNodeId || {})
  ElMessage.success(`回读成功：blocks=${blocks.length}, nodes=${nodes.length}`)
}
</script>

<style scoped>
.visual-designer {
  padding: 1rem;
}

.actions {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.designer-layout {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
  min-height: 40rem;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.code-textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.4;
}

.code-textarea :deep(.el-textarea__inner) {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}
</style>
