/* eslint-disable @typescript-eslint/no-unused-vars */
<template>
  <div class="page-design-view">
    <!-- 页面设计器头部 -->
    <div class="design-header">
      <div class="header-left">
        <h2>
          <i class="el-icon-brush" />
          页面设计 - 企业级界面生成器
        </h2>
        <div class="design-progress">
          <span>设计进度: {{ completedPages }}/{{ totalPages }}</span>
          <el-progress 
            :percentage="designProgressPercentage" 
            :stroke-width="6" 
            status="success"
          />
        </div>
      </div>
      <div class="header-actions">
        <el-button-group>
          <el-button 
            type="primary" 
            :icon="designMode === 'batch' ? 'el-icon-magic-stick' : 'el-icon-rank'"
            @click="toggleDesignMode"
          >
            {{ designMode === 'batch' ? '切换单页设计' : '智能批量生成' }}
          </el-button>
          <el-button 
            type="success" 
            icon="el-icon-view" 
            @click="previewPages"
          >
            预览页面
          </el-button>
          <el-button 
            type="warning" 
            icon="el-icon-download" 
            @click="exportPages"
          >
            导出设计
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 主体设计区域 -->
    <div class="design-body">
      <!-- 智能批量生成模式 -->
      <div
        v-if="designMode === 'batch'"
        class="batch-design-mode"
      >
        <div class="batch-sidebar">
          <div class="batch-section">
            <h3>实体选择</h3>
            <div class="entity-selector">
              <el-checkbox-group
                v-model="selectedEntities"
                @change="updateBatchGeneration"
              >
                <div 
                  v-for="entity in availableEntities" 
                  :key="entity.id"
                  class="entity-option"
                >
                  <el-checkbox
                    :label="entity.id"
                    class="entity-checkbox"
                  >
                    <div class="entity-info">
                      <div class="entity-name">
                        {{ entity.name }}
                      </div>
                      <div class="entity-table">
                        {{ entity.tableName }}
                      </div>
                    </div>
                  </el-checkbox>
                  <el-tag 
                    :type="entity.category === 'core' ? 'primary' : 'info'" 
                    size="small"
                  >
                    {{ getCategoryLabel(entity.category) }}
                  </el-tag>
                </div>
              </el-checkbox-group>
            </div>
          </div>

          <div class="batch-section">
            <h3>页面类型配置</h3>
            <div class="page-type-config">
              <el-form label-width="120px">
                <el-form-item label="列表页面">
                  <el-checkbox v-model="pageTypes.list">
                    数据列表 + 搜索筛选
                  </el-checkbox>
                </el-form-item>
                <el-form-item label="表单页面">
                  <el-checkbox v-model="pageTypes.form">
                    新增/编辑表单
                  </el-checkbox>
                </el-form-item>
                <el-form-item label="详情页面">
                  <el-checkbox v-model="pageTypes.detail">
                    详情查看页面
                  </el-checkbox>
                </el-form-item>
                <el-form-item label="权限控制">
                  <el-checkbox v-model="pageTypes.permission">
                    角色权限检查
                  </el-checkbox>
                </el-form-item>
                <el-form-item label="审计日志">
                  <el-checkbox v-model="pageTypes.audit">
                    操作日志记录
                  </el-checkbox>
                </el-form-item>
              </el-form>
            </div>
          </div>

          <div class="batch-section">
            <h3>UI风格选择</h3>
            <el-radio-group
              v-model="uiStyle"
              @change="updatePreview"
            >
              <el-radio label="modern">
                现代简约
              </el-radio>
              <el-radio label="enterprise">
                企业经典
              </el-radio>
              <el-radio label="dashboard">
                仪表盘风格
              </el-radio>
            </el-radio-group>
          </div>

          <div class="batch-actions">
            <el-button 
              type="primary" 
              size="large" 
              :loading="generating"
              style="width: 100%;"
              @click="generateBatchPages"
            >
              <i class="el-icon-magic-stick" />
              智能生成 {{ selectedEntities.length }} 个模块页面
            </el-button>
          </div>
        </div>

        <div class="batch-preview">
          <div class="preview-header">
            <h3>生成预览</h3>
            <div class="preview-stats">
              <el-statistic 
                title="将生成页面数" 
                :value="estimatedPageCount" 
                suffix="个"
              />
            </div>
          </div>
          
          <div class="preview-content">
            <el-tabs
              v-model="previewTab"
              type="card"
            >
              <el-tab-pane 
                v-for="entity in selectedEntityObjects" 
                :key="entity.id"
                :label="entity.name" 
                :name="entity.id"
              >
                <div class="entity-page-preview">
                  <div class="page-type-preview">
                    <div
                      v-if="pageTypes.list"
                      class="preview-card"
                    >
                      <h4>{{ entity.name }}列表页面</h4>
                      <div class="preview-mockup list-mockup">
                        <div class="mockup-toolbar">
                          <div class="search-bar" />
                          <div class="action-buttons">
                            <div class="btn-add" />
                            <div class="btn-export" />
                          </div>
                        </div>
                        <div class="mockup-table">
                          <div class="table-header" />
                          <div class="table-rows">
                            <div
                              v-for="i in 5"
                              :key="i"
                              class="table-row"
                            />
                          </div>
                        </div>
                        <div class="mockup-pagination" />
                      </div>
                    </div>

                    <div
                      v-if="pageTypes.form"
                      class="preview-card"
                    >
                      <h4>{{ entity.name }}表单页面</h4>
                      <div class="preview-mockup form-mockup">
                        <div class="form-header" />
                        <div class="form-fields">
                          <div 
                            v-for="field in entity.fields.slice(0, 6)" 
                            :key="field.name"
                            class="form-field"
                          >
                            <div class="field-label">
                              {{ field.displayName }}
                            </div>
                            <div class="field-input" />
                          </div>
                        </div>
                        <div class="form-actions">
                          <div class="btn-save" />
                          <div class="btn-cancel" />
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="pageTypes.detail"
                      class="preview-card"
                    >
                      <h4>{{ entity.name }}详情页面</h4>
                      <div class="preview-mockup detail-mockup">
                        <div class="detail-header" />
                        <div class="detail-content">
                          <div class="detail-section">
                            <div class="section-title">
                              基本信息
                            </div>
                            <div class="detail-fields">
                              <div 
                                v-for="field in entity.fields.slice(0, 4)" 
                                :key="field.name"
                                class="detail-field"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>

      <!-- 单页设计模式 -->
      <div
        v-else
        class="single-design-mode"
      >
        <!-- 左侧组件面板 -->
        <div class="components-panel">
          <div class="panel-header">
            <h3>组件库</h3>
            <el-input 
              v-model="componentSearch" 
              size="small" 
              placeholder="搜索组件..."
              prefix-icon="el-icon-search"
            />
          </div>
          
          <div class="component-categories">
            <el-collapse v-model="activeCategories">
              <el-collapse-item
                title="布局组件"
                name="layout"
              >
                <div class="component-list">
                  <div 
                    v-for="component in layoutComponents"
                    :key="component.type"
                    class="component-item"
                    draggable="true"
                    @dragstart="handleDragStart(component)"
                  >
                    <i :class="component.icon" />
                    <span>{{ component.name }}</span>
                  </div>
                </div>
              </el-collapse-item>
              
              <el-collapse-item
                title="表单组件"
                name="form"
              >
                <div class="component-list">
                  <div 
                    v-for="component in formComponents"
                    :key="component.type"
                    class="component-item"
                    draggable="true"
                    @dragstart="handleDragStart(component)"
                  >
                    <i :class="component.icon" />
                    <span>{{ component.name }}</span>
                  </div>
                </div>
              </el-collapse-item>
              
              <el-collapse-item
                title="数据展示"
                name="display"
              >
                <div class="component-list">
                  <div 
                    v-for="component in displayComponents"
                    :key="component.type"
                    class="component-item"
                    draggable="true"
                    @dragstart="handleDragStart(component)"
                  >
                    <i :class="component.icon" />
                    <span>{{ component.name }}</span>
                  </div>
                </div>
              </el-collapse-item>

              <el-collapse-item
                title="业务组件"
                name="business"
              >
                <div class="component-list">
                  <div 
                    v-for="component in businessComponents"
                    :key="component.type"
                    class="component-item"
                    draggable="true"
                    @dragstart="handleDragStart(component)"
                  >
                    <i :class="component.icon" />
                    <span>{{ component.name }}</span>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>

        <!-- 中央设计画布 -->
        <div class="design-canvas">
          <div class="canvas-toolbar">
            <div class="canvas-info">
              <span>{{ currentPage.name || '未命名页面' }}</span>
              <el-tag size="small">
                {{ canvasComponents.length }} 个组件
              </el-tag>
            </div>
            <div class="canvas-actions">
              <el-button-group size="small">
                <el-button @click="clearCanvas">
                  <i class="el-icon-delete" /> 清空
                </el-button>
                <el-button @click="undoCanvas">
                  <i class="el-icon-refresh-left" /> 撤销
                </el-button>
                <el-button @click="redoCanvas">
                  <i class="el-icon-refresh-right" /> 重做
                </el-button>
                <el-button
                  type="primary"
                  @click="previewPage"
                >
                  <i class="el-icon-view" /> 预览
                </el-button>
              </el-button-group>
            </div>
          </div>

          <div 
            class="canvas-workspace"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @click="selectCanvas"
          >
            <div
              v-if="canvasComponents.length === 0"
              class="canvas-empty"
            >
              <i class="el-icon-plus" />
              <p>拖拽组件到这里开始设计</p>
              <p class="empty-hint">
                或者使用快速模板：
              </p>
              <div class="quick-templates">
                <el-button
                  size="small"
                  @click="applyTemplate('list')"
                >
                  列表页面
                </el-button>
                <el-button
                  size="small"
                  @click="applyTemplate('form')"
                >
                  表单页面
                </el-button>
                <el-button
                  size="small"
                  @click="applyTemplate('detail')"
                >
                  详情页面
                </el-button>
              </div>
            </div>

            <!-- 渲染画布组件 -->
            <div 
              v-for="(component, index) in canvasComponents"
              :key="component.id"
              class="canvas-component"
              :class="{ selected: selectedComponent?.id === component.id }"
              @click.stop="selectComponent(component)"
            >
              <div class="component-wrapper">
                <!-- 组件渲染区域 -->
                <component 
                  :is="getComponentRenderer(component.type)"
                  v-bind="component.props"
                  :component-data="component"
                />
                
                <!-- 组件操作栏 -->
                <div
                  v-if="selectedComponent?.id === component.id"
                  class="component-toolbar"
                >
                  <el-button-group size="small">
                    <el-button @click="moveComponent(index, -1)">
                      <i class="el-icon-top" />
                    </el-button>
                    <el-button @click="moveComponent(index, 1)">
                      <i class="el-icon-bottom" />
                    </el-button>
                    <el-button @click="copyComponent(component)">
                      <i class="el-icon-document-copy" />
                    </el-button>
                    <el-button
                      type="danger"
                      @click="removeComponent(index)"
                    >
                      <i class="el-icon-delete" />
                    </el-button>
                  </el-button-group>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧属性面板 -->
        <div class="properties-panel">
          <div class="panel-header">
            <h3>属性配置</h3>
          </div>
          
          <div
            v-if="selectedComponent"
            class="property-editor"
          >
            <el-tabs v-model="propertyTab">
              <el-tab-pane
                label="属性"
                name="props"
              >
                <div class="props-editor">
                  <el-form label-width="80px">
                    <!-- 通用属性 -->
                    <el-form-item label="组件ID">
                      <el-input
                        v-model="selectedComponent.id"
                        size="small"
                        disabled
                      />
                    </el-form-item>
                    <el-form-item label="组件名称">
                      <el-input
                        v-model="selectedComponent.name"
                        size="small"
                      />
                    </el-form-item>
                    
                    <!-- 动态属性渲染 -->
                    <template
                      v-for="(propDef, propKey) in getComponentPropDefs(selectedComponent.type)"
                      :key="propKey"
                    >
                      <el-form-item :label="propDef.label">
                        <component 
                          :is="getPropertyEditor(propDef.type)"
                          v-model="selectedComponent.props[propKey]"
                          v-bind="propDef.attrs"
                          size="small"
                        />
                      </el-form-item>
                    </template>
                  </el-form>
                </div>
              </el-tab-pane>
              
              <el-tab-pane
                label="样式"
                name="style"
              >
                <div class="style-editor">
                  <el-form label-width="80px">
                    <el-form-item label="宽度">
                      <el-input
                        v-model="selectedComponent.style.width"
                        size="small"
                        placeholder="auto"
                      />
                    </el-form-item>
                    <el-form-item label="高度">
                      <el-input
                        v-model="selectedComponent.style.height"
                        size="small"
                        placeholder="auto"
                      />
                    </el-form-item>
                    <el-form-item label="边距">
                      <el-input
                        v-model="selectedComponent.style.margin"
                        size="small"
                        placeholder="0"
                      />
                    </el-form-item>
                    <el-form-item label="内边距">
                      <el-input
                        v-model="selectedComponent.style.padding"
                        size="small"
                        placeholder="0"
                      />
                    </el-form-item>
                    <el-form-item label="背景色">
                      <el-color-picker
                        v-model="selectedComponent.style.backgroundColor"
                        size="small"
                      />
                    </el-form-item>
                    <el-form-item label="边框">
                      <el-input
                        v-model="selectedComponent.style.border"
                        size="small"
                        placeholder="none"
                      />
                    </el-form-item>
                  </el-form>
                </div>
              </el-tab-pane>
              
              <el-tab-pane
                label="事件"
                name="events"
              >
                <div class="events-editor">
                  <el-form label-width="80px">
                    <el-form-item label="点击事件">
                      <el-select
                        v-model="selectedComponent.events.click"
                        size="small"
                        placeholder="选择事件"
                      >
                        <el-option
                          label="无"
                          value=""
                        />
                        <el-option
                          label="提交表单"
                          value="submit"
                        />
                        <el-option
                          label="打开弹窗"
                          value="openDialog"
                        />
                        <el-option
                          label="跳转页面"
                          value="navigate"
                        />
                        <el-option
                          label="自定义函数"
                          value="custom"
                        />
                      </el-select>
                    </el-form-item>
                    <el-form-item
                      v-if="selectedComponent.events.click === 'custom'"
                      label="函数名"
                    >
                      <el-input
                        v-model="selectedComponent.events.customFunction"
                        size="small"
                      />
                    </el-form-item>
                  </el-form>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
          
          <div
            v-else
            class="no-selection"
          >
            <el-empty description="请选择一个组件进行配置" />
          </div>
        </div>
      </div>
    </div>

    <!-- 页面预览对话框 -->
    <el-dialog 
      v-model="showPreview" 
      title="页面预览" 
      width="90%"
      top="5vh"
    >
      <div class="page-preview">
        <div class="preview-toolbar">
          <el-button-group size="small">
            <el-button 
              :type="previewDevice === 'desktop' ? 'primary' : ''"
              @click="previewDevice = 'desktop'"
            >
              <i class="el-icon-monitor" /> 桌面
            </el-button>
            <el-button 
              :type="previewDevice === 'tablet' ? 'primary' : ''"
              @click="previewDevice = 'tablet'"
            >
              <i class="el-icon-mobile" /> 平板
            </el-button>
            <el-button 
              :type="previewDevice === 'mobile' ? 'primary' : ''"
              @click="previewDevice = 'mobile'"
            >
              <i class="el-icon-mobile-phone" /> 手机
            </el-button>
          </el-button-group>
        </div>
        
        <div
          class="preview-container"
          :class="`device-${previewDevice}`"
        >
          <iframe 
            :src="getPreviewUrl()" 
            class="preview-frame"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { useEntityModelingStore } from "@/stores/lowcode/entityModeling"
import { usePageDesignStore } from "@/stores/lowcode/pageDesign"

// Stores
const entityStore = useEntityModelingStore()
const pageStore = usePageDesignStore()

// 设计模式
const designMode = ref<"batch" | "single">("batch")
const previewTab = ref("")
const propertyTab = ref("props")
const componentSearch = ref("")
const activeCategories = ref(["layout", "form", "display", "business"])

// 批量生成配置
const selectedEntities = ref<string[]>([])
const pageTypes = ref({
  list: true,
  form: true,
  detail: true,
  permission: true,
  audit: false
})
const uiStyle = ref<"modern" | "enterprise" | "dashboard">("modern")
const generating = ref(false)

// 单页设计状态
const canvasComponents = ref<any[]>([])
const selectedComponent = ref<any>(null)
const currentPage = ref({ name: "新页面" })
const showPreview = ref(false)
const previewDevice = ref("desktop")

// 组件库定义
const layoutComponents = [
  { type: "container", name: "容器", icon: "el-icon-menu" },
  { type: "grid", name: "栅格", icon: "el-icon-s-grid" },
  { type: "card", name: "卡片", icon: "el-icon-postcard" },
  { type: "collapse", name: "折叠面板", icon: "el-icon-arrow-down" }
]

const formComponents = [
  { type: "input", name: "输入框", icon: "el-icon-edit" },
  { type: "select", name: "选择器", icon: "el-icon-arrow-down" },
  { type: "checkbox", name: "复选框", icon: "el-icon-check" },
  { type: "radio", name: "单选框", icon: "el-icon-success" },
  { type: "date-picker", name: "日期选择", icon: "el-icon-date" },
  { type: "upload", name: "文件上传", icon: "el-icon-upload" }
]

const displayComponents = [
  { type: "table", name: "表格", icon: "el-icon-s-grid" },
  { type: "list", name: "列表", icon: "el-icon-menu" },
  { type: "tree", name: "树形控件", icon: "el-icon-share" },
  { type: "chart", name: "图表", icon: "el-icon-pie-chart" },
  { type: "text", name: "文本", icon: "el-icon-document" },
  { type: "image", name: "图片", icon: "el-icon-picture" }
]

const businessComponents = [
  { type: "user-selector", name: "用户选择器", icon: "el-icon-user" },
  { type: "org-tree", name: "组织树", icon: "el-icon-office-building" },
  { type: "permission-matrix", name: "权限矩阵", icon: "el-icon-key" },
  { type: "role-selector", name: "角色选择器", icon: "el-icon-user-solid" },
  { type: "audit-log", name: "审计日志", icon: "el-icon-document" }
]

// 计算属性
const availableEntities = computed(() => entityStore.entities)
const selectedEntityObjects = computed(() => 
  availableEntities.value.filter(e => selectedEntities.value.includes(e.id))
)
const completedPages = computed(() => pageStore.completedPages)
const totalPages = computed(() => pageStore.totalPages)
const designProgressPercentage = computed(() => 
  totalPages.value === 0 ? 0 : Math.round((completedPages.value / totalPages.value) * 100)
)
const estimatedPageCount = computed(() => {
  let count = 0
  selectedEntities.value.forEach(() => {
    if (pageTypes.value.list) count++
    if (pageTypes.value.form) count++
    if (pageTypes.value.detail) count++
  })
  return count
})

// 方法
const toggleDesignMode = () => {
  designMode.value = designMode.value === "batch" ? "single" : "batch"
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    core: "核心",
    relation: "关联",
    config: "配置",
    log: "日志"
  }
  return labels[category] || category
}

const updateBatchGeneration = () => {
  // 更新批量生成预览
  if (selectedEntities.value.length > 0 && !previewTab.value) {
    previewTab.value = selectedEntities.value[0]
  }
}

const updatePreview = () => {
  // 更新UI风格预览
  console.log("更新UI风格预览:", uiStyle.value)
}

const generateBatchPages = async () => {
  if (selectedEntities.value.length === 0) {
    ElMessage.warning("请选择至少一个实体")
    return
  }

  generating.value = true
  try {
    await pageStore.generateBatchPages({
      entities: selectedEntities.value,
      pageTypes: pageTypes.value,
      uiStyle: uiStyle.value
    })
    ElMessage.success(`成功生成 ${estimatedPageCount.value} 个页面`)
  } catch (error) {
    ElMessage.error("批量生成失败")
    console.error("Batch generation error:", error)
  } finally {
    generating.value = false
  }
}

const previewPages = () => {
  showPreview.value = true
}

const exportPages = () => {
  pageStore.exportPageDesigns()
  ElMessage.success("页面设计已导出")
}

// 拖拽处理
const handleDragStart = (component: any) => {
  // 设置拖拽数据
  console.log("开始拖拽组件:", component)
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  // 处理组件放置逻辑
  const componentType = "input" // 临时数据
  addComponentToCanvas(componentType)
}

const addComponentToCanvas = (componentType: string) => {
  const newComponent = {
    id: `component-${Date.now()}`,
    type: componentType,
    name: getComponentName(componentType),
    props: getDefaultProps(componentType),
    style: {
      width: "auto",
      height: "auto",
      margin: "8px",
      padding: "8px"
    },
    events: {}
  }
  canvasComponents.value.push(newComponent)
}

const getComponentName = (type: string) => {
  const names: Record<string, string> = {
    input: "输入框",
    select: "选择器",
    button: "按钮",
    table: "表格"
  }
  return names[type] || type
}

const getDefaultProps = (type: string) => {
  const defaults: Record<string, any> = {
    input: { placeholder: "请输入内容", size: "default" },
    select: { placeholder: "请选择", size: "default" },
    button: { text: "按钮", type: "primary" },
    table: { columns: [], data: [] }
  }
  return defaults[type] || {}
}

const selectCanvas = () => {
  selectedComponent.value = null
}

const selectComponent = (component: any) => {
  selectedComponent.value = component
}

const clearCanvas = () => {
  ElMessageBox.confirm("确定要清空画布吗？", "清空画布", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    canvasComponents.value = []
    selectedComponent.value = null
    ElMessage.success("画布已清空")
  }).catch(() => {
    // 用户取消
  })
}

const undoCanvas = () => {
  // 撤销操作
  console.log("撤销操作")
}

const redoCanvas = () => {
  // 重做操作
  console.log("重做操作")
}

const previewPage = () => {
  showPreview.value = true
}

const applyTemplate = (templateType: string) => {
  // 应用快速模板
  console.log("应用模板:", templateType)
}

const getComponentRenderer = (_type: string) => {
  // 返回组件渲染器
  return "div"
}

const moveComponent = (index: number, direction: number) => {
  const newIndex = index + direction
  if (newIndex >= 0 && newIndex < canvasComponents.value.length) {
    const component = canvasComponents.value.splice(index, 1)[0]
    canvasComponents.value.splice(newIndex, 0, component)
  }
}

const copyComponent = (component: any) => {
  const copiedComponent = {
    ...component,
    id: `component-${Date.now()}`,
    name: `${component.name}_副本`
  }
  canvasComponents.value.push(copiedComponent)
}

const removeComponent = (index: number) => {
  canvasComponents.value.splice(index, 1)
  selectedComponent.value = null
}

const getComponentPropDefs = (type: string) => {
  const propDefs: Record<string, any> = {
    input: {
      placeholder: { label: "提示文字", type: "input" },
      size: { label: "尺寸", type: "select", attrs: { options: ["large", "default", "small"] } }
    },
    button: {
      text: { label: "按钮文字", type: "input" },
      type: { label: "按钮类型", type: "select", attrs: { options: ["primary", "success", "warning", "danger"] } }
    }
  }
  return propDefs[type] || {}
}

const getPropertyEditor = (type: string) => {
  const editors: Record<string, string> = {
    input: "el-input",
    select: "el-select",
    checkbox: "el-checkbox",
    color: "el-color-picker"
  }
  return editors[type] || "el-input"
}

const getPreviewUrl = () => {
  return "/preview"
}

// 初始化
onMounted(() => {
  entityStore.loadFromLocalStorage()
  if (availableEntities.value.length > 0) {
    selectedEntities.value = [availableEntities.value[0].id]
    previewTab.value = availableEntities.value[0].id
  }
})
</script>

<style scoped>
.page-design-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.design-header {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 20px;
}

.design-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #606266;
}

.design-progress .el-progress {
  width: 200px;
}

.design-body {
  flex: 1;
  min-height: 0;
}

/* 批量设计模式 */
.batch-design-mode {
  height: 100%;
  display: flex;
}

.batch-sidebar {
  width: 350px;
  background: white;
  border-right: 1px solid #e8e8e8;
  padding: 24px;
  overflow-y: auto;
}

.batch-section {
  margin-bottom: 32px;
}

.batch-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.entity-selector {
  max-height: 300px;
  overflow-y: auto;
}

.entity-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.entity-option:last-child {
  border-bottom: none;
}

.entity-checkbox {
  flex: 1;
}

.entity-info {
  margin-left: 8px;
}

.entity-name {
  font-weight: 500;
  color: #303133;
}

.entity-table {
  font-size: 12px;
  color: #8c8c8c;
}

.page-type-config .el-form-item {
  margin-bottom: 12px;
}

.batch-actions {
  margin-top: 24px;
}

.batch-preview {
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
}

.preview-header {
  padding: 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.preview-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.entity-page-preview {
  height: 100%;
}

.page-type-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.preview-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
}

.preview-card h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #606266;
}

/* 页面模拟图样式 */
.preview-mockup {
  background: white;
  border-radius: 4px;
  padding: 12px;
  min-height: 200px;
}

.list-mockup .mockup-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.search-bar {
  width: 200px;
  height: 32px;
  background: #f5f5f5;
  border-radius: 4px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-add, .btn-export {
  width: 60px;
  height: 32px;
  background: #409eff;
  border-radius: 4px;
}

.mockup-table .table-header {
  height: 40px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

.table-row {
  height: 32px;
  background: #fafafa;
  margin-bottom: 4px;
  border-radius: 2px;
}

.mockup-pagination {
  height: 32px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-top: 12px;
}

.form-mockup .form-header {
  height: 40px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 16px;
}

.form-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  height: 16px;
  width: 60px;
  background: #e8e8e8;
  border-radius: 2px;
}

.field-input {
  height: 32px;
  background: #f5f5f5;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-save, .btn-cancel {
  width: 60px;
  height: 32px;
  border-radius: 4px;
}

.btn-save {
  background: #67c23a;
}

.btn-cancel {
  background: #e6e6e6;
}

.detail-mockup .detail-header {
  height: 40px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 16px;
}

.section-title {
  height: 20px;
  width: 80px;
  background: #409eff;
  border-radius: 2px;
  margin-bottom: 12px;
}

.detail-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.detail-field {
  height: 24px;
  background: #f5f5f5;
  border-radius: 2px;
}

/* 单页设计模式 */
.single-design-mode {
  height: 100%;
  display: flex;
}

.components-panel {
  width: 300px;
  background: white;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.components-panel .panel-header {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.components-panel .panel-header h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #303133;
}

.component-categories {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.component-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
}

.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s;
  background: white;
}

.component-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.component-item i {
  font-size: 16px;
  color: #409eff;
}

.component-item span {
  font-size: 12px;
  color: #606266;
}

.design-canvas {
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
  margin: 0 1px;
}

.canvas-toolbar {
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.canvas-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.canvas-workspace {
  flex: 1;
  margin: 16px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  position: relative;
  overflow: auto;
  min-height: 400px;
}

.canvas-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #8c8c8c;
}

.canvas-empty i {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.canvas-empty p {
  margin: 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #909399;
}

.quick-templates {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}

.canvas-component {
  margin: 8px;
  position: relative;
}

.canvas-component.selected {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}

.component-wrapper {
  position: relative;
}

.component-toolbar {
  position: absolute;
  top: -32px;
  right: 0;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 2px;
}

.properties-panel {
  width: 350px;
  background: white;
  border-left: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.properties-panel .panel-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.properties-panel .panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.property-editor {
  flex: 1;
  overflow-y: auto;
}

.props-editor,
.style-editor,
.events-editor {
  padding: 24px;
}

.no-selection {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 预览对话框 */
.page-preview {
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.preview-toolbar {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
  text-align: center;
}

.preview-container {
  flex: 1;
  padding: 16px;
  display: flex;
  justify-content: center;
}

.preview-frame {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  width: 100%;
  height: 100%;
}

.device-desktop .preview-frame {
  width: 100%;
}

.device-tablet .preview-frame {
  width: 768px;
  max-width: 100%;
}

.device-mobile .preview-frame {
  width: 375px;
  max-width: 100%;
}
</style>