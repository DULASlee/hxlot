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
        <!-- 企业级低代码引擎 - 专注基础功能 -->
        <div class="engine-info">
          <span class="engine-title">SmartAbp LowCode Engine</span>
          <span class="engine-version">v1.0 - Enterprise Edition</span>
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

        <!-- 🚀 增强操作按钮 - 基于现有架构增量开发 -->
        <div class="action-buttons">
          <button :disabled="!canUndo" class="btn btn-icon" title="撤销 (Ctrl+Z)" @click="undo">
            <i class="icon-undo" />
          </button>
          <button :disabled="!canRedo" class="btn btn-icon" title="重做 (Ctrl+Y)" @click="redo">
            <i class="icon-redo" />
          </button>
          <button :disabled="!isDirty" class="btn btn-icon" title="保存 (Ctrl+S)" @click="save">
            <i class="icon-save" />
          </button>

          <!-- 🎯 网格对齐工具 -->
          <div class="btn-group">
            <button
              :class="{ active: dragState.snapToGrid }"
              class="btn btn-icon"
              title="网格对齐"
              @click="toggleSnapToGrid"
            >
              <i class="icon-grid" />
            </button>
            <select
              v-model="dragState.gridSize"
              class="grid-size-selector"
              title="网格大小"
              @change="setGridSize(dragState.gridSize)"
            >
              <option :value="5">5px</option>
              <option :value="10">10px</option>
              <option :value="20">20px</option>
              <option :value="25">25px</option>
              <option :value="50">50px</option>
            </select>
          </div>

          <button class="btn btn-primary" @click="preview">预览</button>
          <button class="btn btn-secondary" @click="exportDesign">导出</button>

          <!-- 🎯 预览模式工具栏 -->
          <div v-if="previewState.isPreviewMode" class="preview-toolbar">
            <div class="device-switcher">
              <button
                v-for="device in ['desktop', 'tablet', 'mobile']"
                :key="device"
                :class="{ active: previewState.deviceType === device }"
                class="device-btn"
                @click="switchDevice(device as 'desktop' | 'tablet' | 'mobile')"
              >
                <i :class="`icon-${device}`" />
                {{ device }}
              </button>
            </div>

            <button
              v-if="previewState.deviceType !== 'desktop'"
              class="btn btn-icon"
              title="切换方向"
              @click="toggleOrientation"
            >
              <i :class="previewState.orientation === 'portrait' ? 'icon-rotate' : 'icon-rotate-reverse'" />
            </button>

            <button
              :class="{ active: previewState.realTimeData }"
              class="btn btn-icon"
              title="实时数据"
              @click="toggleRealTimeData"
            >
              <i class="icon-refresh" />
            </button>

            <button class="btn btn-danger" @click="exitPreview">退出预览</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要布局 -->
    <div class="designer-layout">
      <!-- 左侧面板 -->
      <div class="designer-sidebar left" :class="{ collapsed: leftPanelCollapsed }">
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
          <button class="collapse-btn" @click="leftPanelCollapsed = !leftPanelCollapsed">
            <i :class="leftPanelCollapsed ? 'icon-expand' : 'icon-collapse'" />
          </button>
        </div>

        <div v-if="!leftPanelCollapsed" class="sidebar-content">
          <!-- 组件库 -->
          <div v-show="activeLeftTab === 'components'" class="tab-panel">
            <ComponentPalette
              v-if="designer"
              :component-library="{}"
              @component-drag-start="handleComponentDragStart"
            />
          </div>

          <!-- 图层管理 -->
          <div v-show="activeLeftTab === 'layers'" class="tab-panel">
            <LayerManager
              :components="canvasComponents"
              :selected-components="selectedComponents"
              @select-component="selectComponent"
              @toggle-visibility="toggleComponentVisibility"
              @toggle-lock="toggleComponentLock"
            />
          </div>

          <!-- 🚨 AI助手功能已移除 - 遵循低代码引擎开发铁律 -->
          <!-- 现阶段专注基础功能：代码生成、可视化设计、元数据驱动 -->
        </div>
      </div>

      <!-- 画布区域 -->
      <div class="designer-main">
        <!-- 画布工具栏 -->
        <div class="canvas-toolbar">
          <div class="toolbar-left">
            <div class="zoom-controls">
              <button class="btn btn-icon" @click="zoomOut">
                <i class="icon-zoom-out" />
              </button>
              <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
              <button class="btn btn-icon" @click="zoomIn">
                <i class="icon-zoom-in" />
              </button>
              <button class="btn btn-icon" @click="resetZoom">
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
            <div class="canvas-size-info">{{ canvasSize.width }} × {{ canvasSize.height }}</div>
          </div>
        </div>

        <!-- 画布容器 -->
        <div ref="canvasContainer" class="canvas-container">
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
      <div class="designer-sidebar right" :class="{ collapsed: rightPanelCollapsed }">
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
          <button class="collapse-btn" @click="rightPanelCollapsed = !rightPanelCollapsed">
            <i :class="rightPanelCollapsed ? 'icon-expand' : 'icon-collapse'" />
          </button>
        </div>

        <div v-if="!rightPanelCollapsed" class="sidebar-content">
          <!-- 属性面板 -->
          <div v-show="activeRightTab === 'properties'" class="tab-panel">
            <PropertyInspector
              :selected-components="selectedComponentsData"
              @update-component="updateComponent"
            />
          </div>

          <!-- 样式面板 -->
          <div v-show="activeRightTab === 'styles'" class="tab-panel">
            <StyleEditor
              :selected-components="selectedComponentsData"
              @update-styles="updateComponentStyles"
            />
          </div>

          <!-- 版本历史 -->
          <div v-show="activeRightTab === 'history'" class="tab-panel">
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
        <span v-if="isDirty" class="status-item dirty">
          <i class="icon-dot" />
          未保存
        </span>
      </div>

      <div class="status-right">
        <span class="status-item"> 最后保存: {{ lastSavedText }} </span>
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
    <el-card style="margin-top: 20px">
      <h3>兼容性功能</h3>
      <div class="actions">
        <el-button type="primary" :disabled="!hasComponents" @click="onPreview">
          <el-icon><View /></el-icon>
          预览页面
        </el-button>
        <el-button :disabled="!hasComponents" :loading="generating" @click="onGenerateCode">
          <el-icon><Document /></el-icon>
          生成代码
        </el-button>
        <el-button :disabled="!hasComponents" @click="onExportSchema">
          <el-icon><Download /></el-icon>
          导出Schema
        </el-button>
        <el-button :disabled="!hasComponents" type="danger" @click="onClearAll">
          <el-icon><Delete /></el-icon>
          清空画布
        </el-button>
      </div>

      <!-- 代码生成配置对话框 -->
      <el-dialog v-model="showCodeDialog" title="代码生成配置" width="600px">
        <el-form :model="codegenOptions" label-width="100px">
          <el-form-item label="模块名称" required>
            <el-input v-model="codegenOptions.moduleName" placeholder="例如：UserManagement" />
          </el-form-item>
          <el-form-item label="页面名称" required>
            <el-input v-model="codegenOptions.pageName" placeholder="例如：UserList" />
          </el-form-item>
          <el-form-item label="作者">
            <el-input v-model="codegenOptions.author" placeholder="可选" />
          </el-form-item>
          <el-form-item label="生成格式">
            <el-radio-group v-model="codegenOptions.format">
              <el-radio value="vue-sfc"> Vue SFC </el-radio>
              <el-radio value="designer-schema"> Designer Schema </el-radio>
              <el-radio value="both"> 两者都要 </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="codegenOptions.includeEvents"> 包含事件绑定 </el-checkbox>
            <el-checkbox v-model="codegenOptions.includeValidation"> 包含校验规则 </el-checkbox>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showCodeDialog = false"> 取消 </el-button>
          <el-button type="primary" :loading="generating" @click="handleGenerateCode">
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
              <el-button text @click="previewFullscreen = !previewFullscreen">
                <el-icon><FullScreen v-if="!previewFullscreen" /><Aim v-else /></el-icon>
              </el-button>
            </div>
          </div>
        </template>

        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane v-if="generatedCode?.vueSFC" label="Vue模板" name="template">
            <el-input
              v-model="generatedCode.vueSFC.template"
              type="textarea"
              :rows="20"
              readonly
              class="code-textarea"
            />
          </el-tab-pane>
          <el-tab-pane v-if="generatedCode?.vueSFC" label="脚本代码" name="script">
            <el-input
              v-model="generatedCode.vueSFC.script"
              type="textarea"
              :rows="20"
              readonly
              class="code-textarea"
            />
          </el-tab-pane>
          <el-tab-pane v-if="generatedCode?.vueSFC" label="样式代码" name="style">
            <el-input
              v-model="generatedCode.vueSFC.style"
              type="textarea"
              :rows="20"
              readonly
              class="code-textarea"
            />
          </el-tab-pane>
          <el-tab-pane v-if="generatedCode?.designerSchema" label="Designer Schema" name="schema">
            <el-input
              v-model="schemaText"
              type="textarea"
              :rows="20"
              readonly
              class="code-textarea"
            />
          </el-tab-pane>
          <el-tab-pane label="路由配置" name="routes">
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
          <el-button @click="showPreviewDialog = false"> 关闭 </el-button>
          <el-button type="primary" @click="copyToClipboard">
            <el-icon><CopyDocument /></el-icon>
            复制当前代码
          </el-button>
          <el-button type="success" @click="downloadCode">
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
        <el-button @click="onReadSFC"> 回读Selectors </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue"
import { ElMessage } from "element-plus"
// 注释掉缺失的模块导入
// import { EnterpriseDesigner, createEnterpriseDesigner } from '../core/EnterpriseDesigner'
// import type { CanvasComponent, CanvasViewport } from '../core/AdvancedCanvas'
// 🚨 协作和AI相关类型导入已移除 - 遵循低代码引擎开发铁律
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

  // 🚨 AI助手接口已移除 - 遵循低代码引擎开发铁律
  // aiAssistant?: {
  //   applySuggestion?(id: string): Promise<void>
  // }

  // 组件操作
  selectComponent?(id: string): void
  updateComponent?(id: string, updates: any): void

  // 其他方法
  setMode?(mode: "design" | "preview" | "code"): void
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

// 🚨 协作和AI相关接口已移除 - 遵循低代码引擎开发铁律
// interface CollaborationUser {
//   id: string
//   name: string
//   color: string
// }

// interface AIDesignSuggestion {
//   id: string
// }

interface PerformanceMetrics {
  renderTime: number
  memoryUsage: number
  componentCount: number
  fps: number
  lastUpdateTime: number
}

// 导入组件
import ComponentPalette from "./designer/Palette.vue"
import LayerManager from "./designer/LayerManager.vue"
// 🚨 AI助手组件导入已移除 - 遵循低代码引擎开发铁律
// import AIAssistantPanel from "./designer/AIAssistantPanel.vue"
import PropertyInspector from "./designer/PropertyInspector.vue"
import StyleEditor from "./designer/StyleEditor.vue"
import VersionHistory from "./designer/VersionHistory.vue"
import AdvancedCanvasComponent from "./designer/AdvancedCanvasComponent.vue"
import MinimapComponent from "./designer/MinimapComponent.vue"
import ExportDialog from "./designer/ExportDialog.vue"
import ImportDialog from "./designer/ImportDialog.vue"
import PreviewModal from "./designer/PreviewModal.vue"

// 保留原有功能的导入
import {
  View,
  Document,
  Download,
  Delete,
  FullScreen,
  Aim,
  CopyDocument,
} from "@element-plus/icons-vue"
import {
  exportDesignerState,
  type ExportOptions,
  type CodeGenerationResult,
} from "../designer/schema/exporter"
type DesignerOverrideSchema = any

// 企业级设计器实例
const designer = ref<EnterpriseDesigner>()

// stores 目录暂缺最小实现，此处以本地空实现代替，后续补全
const useDesignerStore = () => ({ components: ref<any[]>([]), clear: () => {} }) as any
// UI状态
const currentMode = ref<"design" | "preview" | "code">("design")
const leftPanelCollapsed = ref(false)
const rightPanelCollapsed = ref(false)
const activeLeftTab = ref("components")
const activeRightTab = ref("properties")

// 视图控制
const showGrid = ref(true)
const showRulers = ref(true)
const showMinimap = ref(false)
const zoomLevel = ref(1)

// 对话框状态
const showExportDialog = ref(false)
const showImportDialog = ref(false)
const showPreviewModal = ref(false)

// 🚀 增强预览系统状态 - 基于现有架构增量开发
const previewState = ref<{
  isPreviewMode: boolean
  deviceType: 'desktop' | 'tablet' | 'mobile'
  orientation: 'portrait' | 'landscape'
  realTimeData: boolean
  showDeviceFrame: boolean
  customViewport: { width: number; height: number }
}>({
  isPreviewMode: false,
  deviceType: 'desktop',
  orientation: 'portrait',
  realTimeData: false,
  showDeviceFrame: true,
  customViewport: { width: 1920, height: 1080 }
})

// 🎯 设备预设配置
const devicePresets = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 }
}

// 🚨 协作和AI功能已移除 - 遵循低代码引擎开发铁律
// 现阶段专注企业级通用低代码引擎基础功能

// 性能指标
const performanceMetrics = ref<PerformanceMetrics>({
  renderTime: 0,
  memoryUsage: 0,
  componentCount: 0,
  fps: 60,
  lastUpdateTime: 0,
})

// 状态信息
const statusMessage = ref("就绪")
const isDirty = ref(false)
const lastSaved = ref(0)

// 画布引用
const canvasContainer = ref<HTMLElement>()
const canvasRef = ref()

// 响应式数据（保留原有功能）
const sfcText = ref("")
const generating = ref(false)
const showCodeDialog = ref(false)
const showPreviewDialog = ref(false)
const previewFullscreen = ref(false)
const activeTab = ref("template")

// 代码生成配置
const codegenOptions = ref<ExportOptions>({
  moduleName: "UserManagement",
  pageName: "UserList",
  author: "",
  format: "vue-sfc",
  includeEvents: true,
  includeValidation: true,
})

// 生成的代码
const generatedCode = ref<CodeGenerationResult | null>(null)

// 设计器状态
const designerStore = useDesignerStore()

// 模式配置
const modes = [
  { value: "design", label: "设计", icon: "icon-design" },
  { value: "preview", label: "预览", icon: "icon-preview" },
  { value: "code", label: "代码", icon: "icon-code" },
]

// 左侧标签页
const leftTabs = [
  { key: "components", label: "组件", icon: "icon-components" },
  { key: "layers", label: "图层", icon: "icon-layers" },
  // 🚨 AI助手标签已移除 - 遵循低代码引擎开发铁律
]

// 右侧标签页
const rightTabs = [
  { key: "properties", label: "属性", icon: "icon-properties" },
  { key: "styles", label: "样式", icon: "icon-styles" },
  { key: "history", label: "历史", icon: "icon-history" },
]

// Schema处理器（保留原有功能）
const reader = {
  readFromVueSFC: (_c: string, _o: any) => ({ selectors: {}, operations: [] }),
} as any

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

// 🚨 设计上下文已简化 - 遵循低代码引擎开发铁律
// const designContext = computed(() => {
//   return {
//     components: [],
//     selectedComponents: [],
//     canvasSize: { width: 1920, height: 1080 },
//     viewport: { x: 0, y: 0, zoom: 1 },
//   }
// })

const canUndo = computed(() => false)

const canRedo = computed(() => false)

const lastSavedText = computed(() => {
  if (lastSaved.value === 0) return "从未保存"
  const diff = Date.now() - lastSaved.value
  if (diff < 60000) return "刚刚"
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  return `${Math.floor(diff / 3600000)}小时前`
})

const hasComponents = computed(() => designerStore.components.value.length > 0)

const schemaText = computed(() => {
  return generatedCode.value?.designerSchema
    ? JSON.stringify(generatedCode.value.designerSchema, null, 2)
    : ""
})

const routesText = computed(() => {
  return generatedCode.value?.routes
    ? JSON.stringify(
        {
          routes: generatedCode.value.routes,
          menuItems: generatedCode.value.menuItems,
        },
        null,
        2,
      )
    : ""
})

// 企业级设计器方法实现 - 简化版本
const initializeDesigner = async () => {
  try {
    designer.value = createEnterpriseDesigner({})

    // 模拟初始化成功
    await new Promise((resolve) => setTimeout(resolve, 100))

    statusMessage.value = "设计器初始化完成（演示模式）"
    ElMessage.success("设计器初始化完成")
  } catch (error) {
    console.error("设计器初始化失败:", error)
    ElMessage.error("设计器初始化失败")
  }
}

// 模式切换
const setMode = (mode: "design" | "preview" | "code") => {
  currentMode.value = mode
  if (designer.value?.setMode) {
    designer.value.setMode(mode)
  }
  statusMessage.value = `切换到${mode === "design" ? "设计" : mode === "preview" ? "预览" : "代码"}模式`
}

// 操作方法
const undo = () => {
  if (designer.value?.undo) {
    designer.value.undo()
  }
  statusMessage.value = "撤销操作"
}

const redo = () => {
  if (designer.value?.redo) {
    designer.value.redo()
  }
  statusMessage.value = "重做操作"
}

const save = async () => {
  try {
    if (designer.value?.save) {
      await designer.value.save()
    }
    ElMessage.success("保存成功")
    statusMessage.value = "保存成功"
  } catch (error) {
    ElMessage.error("保存失败")
  }
}

const preview = () => {
  if (canvasComponents.value.length === 0) {
    ElMessage.warning("画布为空，无法预览")
    return
  }
  showPreviewModal.value = true
}

const exportDesign = () => {
  if (canvasComponents.value.length === 0) {
    ElMessage.warning("画布为空，无法导出")
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
  statusMessage.value = `网格${showGrid.value ? "已显示" : "已隐藏"}`
}

const toggleRulers = () => {
  showRulers.value = !showRulers.value
  statusMessage.value = `标尺${showRulers.value ? "已显示" : "已隐藏"}`
}

const toggleMinimap = () => {
  showMinimap.value = !showMinimap.value
  statusMessage.value = `缩略图${showMinimap.value ? "已显示" : "已隐藏"}`
}

// 🚀 增强组件拖拽操作 - 基于现有架构增量开发
const dragState = ref<{
  isDragging: boolean
  dragComponent: any
  startPosition: { x: number; y: number }
  gridSize: number
  snapToGrid: boolean
  multiSelect: boolean
  selectedComponents: string[]
}>({
  isDragging: false,
  dragComponent: null,
  startPosition: { x: 0, y: 0 },
  gridSize: 20,
  snapToGrid: true,
  multiSelect: false,
  selectedComponents: []
})

const handleComponentDragStart = (component: any, event?: DragEvent) => {
  dragState.value.isDragging = true
  dragState.value.dragComponent = component

  if (event) {
    dragState.value.startPosition = {
      x: event.clientX,
      y: event.clientY
    }
  }

  statusMessage.value = `开始拖拽 ${component.name || component.type}`

  // 🎯 网格对齐提示
  if (dragState.value.snapToGrid) {
    statusMessage.value += ` (网格对齐: ${dragState.value.gridSize}px)`
  }
}

// 🎯 网格对齐功能
const snapToGrid = (position: { x: number; y: number }) => {
  if (!dragState.value.snapToGrid) return position

  const { gridSize } = dragState.value
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  }
}

// 🎯 拖拽约束检查
const checkDragConstraints = (component: any, position: { x: number; y: number }) => {
  const constraints = {
    minX: 0,
    minY: 0,
    maxX: canvasSize.value.width - (component.width || 100),
    maxY: canvasSize.value.height - (component.height || 100)
  }

  return {
    x: Math.max(constraints.minX, Math.min(constraints.maxX, position.x)),
    y: Math.max(constraints.minY, Math.min(constraints.maxY, position.y))
  }
}

// 🎯 多选拖拽支持
const handleMultiSelectDrag = (componentIds: string[], deltaX: number, deltaY: number) => {
  componentIds.forEach(id => {
    if (designer.value?.canvas?.getComponent && designer.value?.updateComponent) {
      const component = designer.value.canvas.getComponent(id)
      if (component) {
        const newPosition = snapToGrid({
          x: component.x + deltaX,
          y: component.y + deltaY
        })

        const constrainedPosition = checkDragConstraints(component, newPosition)

        designer.value.updateComponent(id, {
          x: constrainedPosition.x,
          y: constrainedPosition.y
        })
      }
    }
  })

  statusMessage.value = `批量移动了 ${componentIds.length} 个组件`
}

// 🎯 拖拽结束处理
const handleComponentDragEnd = (component: any, finalPosition?: { x: number; y: number }) => {
  dragState.value.isDragging = false

  if (finalPosition && designer.value?.updateComponent) {
    const snappedPosition = snapToGrid(finalPosition)
    const constrainedPosition = checkDragConstraints(component, snappedPosition)

    designer.value.updateComponent(component.id, constrainedPosition)

    statusMessage.value = `组件 ${component.name || component.type} 已移动到 (${constrainedPosition.x}, ${constrainedPosition.y})`
  }

  dragState.value.dragComponent = null
}

// 🎯 暴露拖拽处理函数供画布组件使用
const exposeDragHandlers = () => ({
  handleMultiSelectDrag,
  handleComponentDragEnd,
  snapToGrid,
  checkDragConstraints
})

// 暴露给模板使用
defineExpose({
  dragHandlers: exposeDragHandlers()
})

// 🎯 切换网格对齐
const toggleSnapToGrid = () => {
  dragState.value.snapToGrid = !dragState.value.snapToGrid
  statusMessage.value = `网格对齐已${dragState.value.snapToGrid ? '启用' : '禁用'}`
}

// 🎯 设置网格大小
const setGridSize = (size: number) => {
  dragState.value.gridSize = Math.max(5, Math.min(50, size))
  statusMessage.value = `网格大小设置为 ${dragState.value.gridSize}px`
}

const handleComponentSelect = (componentIds: string[]) => {
  statusMessage.value =
    componentIds.length > 0 ? `选中了 ${componentIds.length} 个组件` : "取消选择"
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
      style: {
        ...component.style,
        display: component.style?.display === "none" ? "block" : "none",
      },
    })
  }
}

const toggleComponentLock = (componentId: string) => {
  if (!designer.value?.canvas?.getComponent || !designer.value?.updateComponent) return
  const component = designer.value.canvas.getComponent(componentId)
  if (component) {
    designer.value.updateComponent(componentId, {
      locked: !component.locked,
    })
  }
}

// 🚨 AI助手功能已移除 - 遵循低代码引擎开发铁律
// 现阶段严禁AI智能辅助功能，专注基础功能完善

// 版本控制
const restoreVersion = async (snapshotId: string) => {
  try {
    if (designer.value?.versionControl?.restoreSnapshot) {
      await designer.value.versionControl.restoreSnapshot(snapshotId)
    }
    statusMessage.value = "版本已恢复"
  } catch (error) {
    ElMessage.error("版本恢复失败")
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
  statusMessage.value = "导出完成"
}

const handleImport = (data: any) => {
  try {
    if (designer.value?.importFromJSON) {
      designer.value.importFromJSON(data)
      statusMessage.value = "导入完成"
    } else {
      ElMessage.warning("导入功能暂不可用")
    }
  } catch (error) {
    ElMessage.error("导入失败")
  }
}

// 保留原有功能的方法实现
const onPreview = () => {
  if (!hasComponents.value) {
    ElMessage.warning("请先添加一些组件到画布")
    return
  }

  // 🚀 增强预览系统 - 基于现有架构增量开发
  previewState.value.isPreviewMode = true
  setMode('preview')
  statusMessage.value = `预览模式已启动 - ${previewState.value.deviceType} 设备`
}

// 🎯 设备切换功能
const switchDevice = (device: 'desktop' | 'tablet' | 'mobile') => {
  previewState.value.deviceType = device
  const preset = devicePresets[device]
  previewState.value.customViewport = { ...preset }

  if (previewState.value.orientation === 'landscape' && device !== 'desktop') {
    previewState.value.customViewport = {
      width: preset.height,
      height: preset.width
    }
  }

  statusMessage.value = `切换到${device}设备预览 (${previewState.value.customViewport.width}x${previewState.value.customViewport.height})`
}

// 🎯 屏幕方向切换
const toggleOrientation = () => {
  if (previewState.value.deviceType === 'desktop') return

  previewState.value.orientation = previewState.value.orientation === 'portrait' ? 'landscape' : 'portrait'

  const { width, height } = previewState.value.customViewport
  previewState.value.customViewport = { width: height, height: width }

  statusMessage.value = `切换到${previewState.value.orientation === 'portrait' ? '竖屏' : '横屏'}预览`
}

// 🎯 实时数据绑定
const toggleRealTimeData = () => {
  previewState.value.realTimeData = !previewState.value.realTimeData
  statusMessage.value = `实时数据绑定已${previewState.value.realTimeData ? '启用' : '禁用'}`

  if (previewState.value.realTimeData) {
    startRealTimeDataBinding()
  } else {
    stopRealTimeDataBinding()
  }
}

let realTimeDataInterval: NodeJS.Timeout | null = null

const startRealTimeDataBinding = () => {
  if (realTimeDataInterval) return

  realTimeDataInterval = setInterval(() => {
    if (designer.value?.canvas?.getComponents) {
      const components = designer.value.canvas.getComponents()
      components.forEach((component: any) => {
        if (component.type === 'text' && component.props?.bindData) {
          const mockData = generateMockData(component.props.dataType || 'string')
          designer.value?.updateComponent?.(component.id, {
            props: { ...component.props, value: mockData }
          })
        }
      })
    }
  }, 2000)
}

const stopRealTimeDataBinding = () => {
  if (realTimeDataInterval) {
    clearInterval(realTimeDataInterval)
    realTimeDataInterval = null
  }
}

const generateMockData = (dataType: string) => {
  const mockDataMap: Record<string, () => any> = {
    'number': () => Math.floor(Math.random() * 1000),
    'string': () => `模拟数据 ${Date.now().toString().slice(-4)}`,
    'date': () => new Date().toLocaleString(),
    'boolean': () => Math.random() > 0.5
  }

  return mockDataMap[dataType]?.() || '模拟数据'
}

const exitPreview = () => {
  previewState.value.isPreviewMode = false
  stopRealTimeDataBinding()
  setMode('design')
  statusMessage.value = '已退出预览模式'
}

const onGenerateCode = () => {
  if (!hasComponents.value) {
    ElMessage.warning("请先添加一些组件到画布")
    return
  }

  // 重置配置为合理的默认值
  codegenOptions.value.moduleName = "UserManagement"
  codegenOptions.value.pageName = "UserList"
  showCodeDialog.value = true
}

const handleGenerateCode = async () => {
  if (!codegenOptions.value.moduleName || !codegenOptions.value.pageName) {
    ElMessage.error("请填写模块名称和页面名称")
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
    activeTab.value = "template"

    ElMessage.success("代码生成成功！")
  } catch (error) {
    console.error("代码生成失败:", error)
    ElMessage.error("代码生成失败，请检查组件配置")
  } finally {
    generating.value = false
  }
}

const onExportSchema = () => {
  if (!hasComponents.value) {
    ElMessage.warning("请先添加一些组件到画布")
    return
  }

  try {
    const result = exportDesignerState(designerStore.components.value, {
      moduleName: "Demo",
      pageName: "DemoPage",
      format: "designer-schema",
    } as ExportOptions)
    const schema = result.designerSchema || {
      metadata: {
        schemaVersion: "0.1.0",
        moduleName: "Demo",
        pageName: "DemoPage",
        timestamp: new Date().toISOString(),
      },
      selectors: {},
      operations: [],
    }

    // 下载Schema文件
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `designer-schema-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    ElMessage.success("Schema已导出下载")
  } catch (error) {
    console.error("导出失败:", error)
    ElMessage.error("导出失败")
  }
}

const onClearAll = () => {
  designerStore.clear()
  generatedCode.value = null
  ElMessage.success("画布已清空")
}

const copyToClipboard = async () => {
  try {
    let content = ""

    switch (activeTab.value) {
      case "template":
        content = generatedCode.value?.vueSFC?.template || ""
        break
      case "script":
        content = generatedCode.value?.vueSFC?.script || ""
        break
      case "style":
        content = generatedCode.value?.vueSFC?.style || ""
        break
      case "schema":
        content = schemaText.value
        break
      case "routes":
        content = routesText.value
        break
    }

    await navigator.clipboard.writeText(content)
    ElMessage.success("代码已复制到剪贴板")
  } catch (error) {
    ElMessage.error("复制失败")
  }
}

const downloadCode = () => {
  if (!generatedCode.value) return

  try {
    let filename = ""
    let content = ""
    let mimeType = "text/plain"

    switch (activeTab.value) {
      case "template":
        filename = `${codegenOptions.value.pageName}.vue`
        content = `${generatedCode.value.vueSFC?.template || ""}\n\n${generatedCode.value.vueSFC?.script || ""}\n\n${generatedCode.value.vueSFC?.style || ""}`
        mimeType = "text/plain"
        break
      case "script":
        filename = `${codegenOptions.value.pageName}.js`
        content = generatedCode.value.vueSFC?.script || ""
        mimeType = "text/javascript"
        break
      case "style":
        filename = `${codegenOptions.value.pageName}.css`
        content = generatedCode.value.vueSFC?.style || ""
        mimeType = "text/css"
        break
      case "schema":
        filename = `${codegenOptions.value.pageName}-schema.json`
        content = schemaText.value
        mimeType = "application/json"
        break
      case "routes":
        filename = `${codegenOptions.value.pageName}-routes.json`
        content = routesText.value
        mimeType = "application/json"
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    ElMessage.success(`文件 ${filename} 已下载`)
  } catch (error) {
    ElMessage.error("下载失败")
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

  window.addEventListener("resize", handleResize)

  onUnmounted(() => {
    window.removeEventListener("resize", handleResize)
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
    moduleName: "Demo",
    pageName: "DemoPage",
  })
}

const onReadSFC = () => {
  const schema = readFromSFC(
    sfcText.value || '<template><div data-block-id="demo-root"/></template>',
  )
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
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 0.875rem;
  line-height: 1.4;
}

.code-textarea :deep(.el-textarea__inner) {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}

/* 🚀 企业级引擎标识样式 - 专注基础功能 */
.engine-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8px 16px;
}

.engine-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary, #409eff);
  margin-bottom: 2px;
  letter-spacing: 0.5px;
}

.engine-version {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
  font-weight: 500;
  opacity: 0.8;
}

/* 🎯 增强拖拽工具样式 */
.btn-group {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 8px;
  padding: 4px 8px;
  background: var(--el-fill-color-light, #f5f7fa);
  border-radius: 4px;
}

.btn.active {
  background: var(--el-color-primary, #409eff);
  color: white;
}

.grid-size-selector {
  padding: 4px 8px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 4px;
  font-size: 12px;
  background: white;
  cursor: pointer;
}

.grid-size-selector:focus {
  outline: none;
  border-color: var(--el-color-primary, #409eff);
}

/* 🎯 拖拽状态指示器 */
.drag-indicator {
  position: absolute;
  pointer-events: none;
  border: 2px dashed var(--el-color-primary, #409eff);
  background: rgba(64, 158, 255, 0.1);
  z-index: 1000;
}

.drag-grid {
  background-image:
    linear-gradient(to right, rgba(64, 158, 255, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(64, 158, 255, 0.1) 1px, transparent 1px);
}

/* 🎯 多选框架样式 */
.multi-select-frame {
  position: absolute;
  border: 2px solid var(--el-color-primary, #409eff);
  background: rgba(64, 158, 255, 0.1);
  pointer-events: none;
  z-index: 999;
}

/* 🚀 预览模式工具栏样式 */
.preview-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: var(--el-color-primary, #409eff);
  border-radius: 6px;
  margin-left: 16px;
}

.device-switcher {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 4px;
}

.device-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: white;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.device-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.device-btn.active {
  background: white;
  color: var(--el-color-primary, #409eff);
  font-weight: 600;
}

.preview-toolbar .btn {
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}

.preview-toolbar .btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
}

.preview-toolbar .btn.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
}

.preview-toolbar .btn-danger {
  background: var(--el-color-error, #f56c6c);
  border-color: var(--el-color-error, #f56c6c);
}

.preview-toolbar .btn-danger:hover {
  background: #f78989;
  border-color: #f78989;
}
</style>
