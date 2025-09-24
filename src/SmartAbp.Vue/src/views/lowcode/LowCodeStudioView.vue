<template>
  <div class="lowcode-studio">
    <!-- 顶部壳层：工具栏 + 状态栏 -->
    <header class="studio-header">
      <div class="header-left">
        <div class="studio-logo">
          <i class="el-icon-platform-eleme" />
          <span class="logo-text">LowCode Studio</span>
        </div>
        <div class="workspace-selector">
          <el-dropdown @command="switchWorkspace">
            <span class="workspace-name">
              {{ currentWorkspace.name }}
              <i class="el-icon-arrow-down" />
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="ws in workspaces"
                  :key="ws.id"
                  :command="ws.id"
                >
                  {{ ws.name }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="header-center">
        <div class="studio-toolbar">
          <el-button-group>
            <el-button
              :icon="undoDisabled ? '' : 'el-icon-refresh-left'"
              :disabled="undoDisabled"
              @click="undo"
            >
              撤销
            </el-button>
            <el-button
              :icon="redoDisabled ? '' : 'el-icon-refresh-right'"
              :disabled="redoDisabled"
              @click="redo"
            >
              重做
            </el-button>
          </el-button-group>
          <el-button-group class="ml-2">
            <el-button
              type="success"
              :icon="'el-icon-magic-stick'"
              @click="showProjectWizard = true"
            >
              智能项目向导
            </el-button>
            <el-button
              type="primary"
              :icon="'el-icon-view'"
              @click="preview"
            >
              预览
            </el-button>
            <el-button
              type="info"
              :icon="'el-icon-download'"
              @click="generate"
            >
              生成代码
            </el-button>
          </el-button-group>
        </div>
      </div>
      <div class="header-right">
        <div class="status-indicators">
          <!-- 智能工作流进度 -->
          <div class="workflow-progress">
            <el-tooltip
              content="点击查看智能工作流指导"
              placement="bottom"
            >
              <div
                class="progress-indicator"
                @click="() => showWorkflowGuide = !showWorkflowGuide"
              >
                <el-progress
                  type="circle"
                  :percentage="totalWorkflowProgress"
                  :width="32"
                  :stroke-width="3"
                  :show-text="false"
                  :color="totalWorkflowProgress >= 100 ? '#67c23a' : '#409eff'"
                />
                <span class="progress-text">{{ totalWorkflowProgress }}%</span>
              </div>
            </el-tooltip>
          </div>

          <!-- 智能建议提示 -->
          <el-tooltip
            v-if="nextStepSuggestion"
            :content="nextStepSuggestion"
            placement="bottom"
          >
            <i
              class="el-icon-info suggestion-icon"
              @click="() => showWorkflowGuide = !showWorkflowGuide"
            />
          </el-tooltip>

          <el-badge
            :value="issueCount"
            :hidden="issueCount === 0"
            class="status-badge"
          >
            <i
              class="el-icon-warning"
              :class="{ 'status-error': issueCount > 0 }"
            />
          </el-badge>
          <div class="status-text">
            {{ buildStatus }}
          </div>
          <el-button
            text
            @click="toggleSettings"
          >
            <i class="el-icon-setting" />
          </el-button>
        </div>
      </div>
    </header>

    <!-- 主体区域：导航 + 工作区 + 侧栏 -->
    <div class="studio-body">
      <!-- 左侧企业级导航面板 -->
      <aside
        class="studio-navigation"
        :class="{ collapsed: navigationCollapsed }"
      >
        <div class="nav-header">
          <el-button
            text
            @click="toggleNavigation"
          >
            <i :class="navigationCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'" />
          </el-button>
          <span
            v-show="!navigationCollapsed"
            class="nav-title"
          >项目导航</span>
        </div>
        <nav class="nav-menu">
          <div class="nav-section">
            <div
              v-show="!navigationCollapsed"
              class="nav-section-title"
            >
              核心流程
            </div>
            <ul class="nav-items">
              <li
                class="nav-item"
                :class="{ active: currentStep === 'modeling' }"
              >
                <router-link
                  to="/lowcode/entity-modeling"
                  class="nav-link"
                  @click="setCurrentStep('modeling')"
                >
                  <i class="el-icon-data-analysis" />
                  <span v-show="!navigationCollapsed">数据建模</span>
                  <div
                    v-show="!navigationCollapsed"
                    class="step-number"
                  >
                    1
                  </div>
                </router-link>
              </li>
              <li
                class="nav-item"
                :class="{ active: currentStep === 'design' }"
              >
                <router-link
                  to="/lowcode/design"
                  class="nav-link"
                  @click="setCurrentStep('design')"
                >
                  <i class="el-icon-brush" />
                  <span v-show="!navigationCollapsed">页面设计</span>
                  <div
                    v-show="!navigationCollapsed"
                    class="step-number"
                  >
                    2
                  </div>
                </router-link>
              </li>
              <li
                class="nav-item"
                :class="{ active: currentStep === 'generate' }"
              >
                <router-link
                  to="/lowcode/generation"
                  class="nav-link"
                  @click="setCurrentStep('generate')"
                >
                  <i class="el-icon-cpu" />
                  <span v-show="!navigationCollapsed">代码生成</span>
                  <div
                    v-show="!navigationCollapsed"
                    class="step-number"
                  >
                    3
                  </div>
                </router-link>
              </li>
            </ul>
          </div>
          <div class="nav-section">
            <div
              v-show="!navigationCollapsed"
              class="nav-section-title"
            >
              高级功能
            </div>
            <ul class="nav-items">
              <li
                class="nav-item"
                :class="{ active: $route.path.includes('workflows') }"
              >
                <router-link
                  to="/studio/workflows"
                  class="nav-link"
                >
                  <i class="el-icon-share" />
                  <span v-show="!navigationCollapsed">工作流</span>
                </router-link>
              </li>
              <li
                class="nav-item"
                :class="{ active: $route.path.includes('theme') }"
              >
                <router-link
                  to="/studio/theme"
                  class="nav-link"
                >
                  <i class="el-icon-brush" />
                  <span v-show="!navigationCollapsed">主题定制</span>
                </router-link>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <!-- 中央工作区 -->
      <main class="studio-workspace">
        <div class="workspace-header">
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>{{ currentWorkspace.name }}</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentStepName }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="workspace-actions">
            <el-button-group>
              <el-button
                size="small"
                :icon="'el-icon-view'"
                @click="togglePreview"
              >
                预览
              </el-button>
              <el-button
                size="small"
                :icon="'el-icon-full-screen'"
                @click="toggleFullscreen"
              >
                全屏
              </el-button>
            </el-button-group>
          </div>
        </div>
        <div class="workspace-content">
          <router-view />
        </div>
      </main>

      <!-- 右侧属性面板 -->
      <aside
        class="studio-sidebar"
        :class="{ collapsed: sidebarCollapsed }"
      >
        <div class="sidebar-header">
          <span
            v-show="!sidebarCollapsed"
            class="sidebar-title"
          >属性面板</span>
          <el-button
            text
            @click="toggleSidebar"
          >
            <i :class="sidebarCollapsed ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'" />
          </el-button>
        </div>
        <div class="sidebar-content">
          <div class="sidebar-tabs">
            <el-tabs
              v-model="activeSidebarTab"
              tab-position="top"
            >
              <el-tab-pane
                label="属性"
                name="properties"
              >
                <component :is="currentPropertiesComponent" />
              </el-tab-pane>
              <el-tab-pane
                label="主题"
                name="theme"
              >
                <ThemeEditor />
              </el-tab-pane>
              <el-tab-pane
                label="预览"
                name="preview"
              >
                <SandboxPreview :code="previewCode" />
              </el-tab-pane>
              <el-tab-pane
                label="质量"
                name="quality"
              >
                <EnterpriseQualityAssurance />
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </aside>
    </div>

    <!-- 底部日志/校验面板 -->
    <footer
      class="studio-footer"
      :class="{ collapsed: footerCollapsed }"
    >
      <div class="footer-header">
        <div class="footer-tabs">
          <el-tabs
            v-model="activeFooterTab"
            @tab-click="onFooterTabClick"
          >
            <el-tab-pane
              label="输出"
              name="output"
            >
              <template #label>
                <span class="tab-label">
                  <i class="el-icon-document" />
                  输出
                </span>
              </template>
            </el-tab-pane>
            <el-tab-pane
              label="问题"
              name="issues"
            >
              <template #label>
                <span class="tab-label">
                  <i class="el-icon-warning" />
                  问题
                  <el-badge
                    v-if="issueCount > 0"
                    :value="issueCount"
                    type="danger"
                  />
                </span>
              </template>
            </el-tab-pane>
            <el-tab-pane
              label="日志"
              name="logs"
            >
              <template #label>
                <span class="tab-label">
                  <i class="el-icon-document-copy" />
                  日志
                </span>
              </template>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="footer-actions">
          <el-button
            text
            @click="clearLogs"
          >
            清空
          </el-button>
          <el-button
            text
            @click="toggleFooter"
          >
            <i :class="footerCollapsed ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" />
          </el-button>
        </div>
      </div>
      <div class="footer-content">
        <div
          v-if="activeFooterTab === 'output'"
          class="output-panel"
        >
          <pre class="output-content">{{ outputContent }}</pre>
        </div>
        <div
          v-if="activeFooterTab === 'issues'"
          class="issues-panel"
        >
          <div
            v-for="issue in issues"
            :key="issue.id"
            class="issue-item"
            :class="`issue-${issue.type}`"
          >
            <i :class="getIssueIcon(issue.type)" />
            <span class="issue-message">{{ issue.message }}</span>
            <span class="issue-location">{{ issue.file }}:{{ issue.line }}</span>
          </div>
        </div>
        <div
          v-if="activeFooterTab === 'logs'"
          class="logs-panel"
        >
          <div
            v-for="log in logs"
            :key="log.id"
            class="log-entry"
            :class="`log-${log.level}`"
          >
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <span class="log-level">{{ log.level.toUpperCase() }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </footer>

    <!-- 智能项目向导 -->
    <ProjectWizard
      v-model="showProjectWizard"
      @generation-complete="handleProjectGenerated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRoute } from "vue-router"
import { ElMessage } from "element-plus"
import ThemeEditor from "@/components/lowcode/ThemeEditor.vue"
import SandboxPreview from "@/components/lowcode/SandboxPreview.vue"
import ProjectWizard from "@/components/lowcode/ProjectWizard.vue"
import EnterpriseQualityAssurance from "@/components/lowcode/EnterpriseQualityAssurance.vue"
import { useSmartWorkflow } from "@/composables/useSmartWorkflow"

// 响应式数据
const route = useRoute()
const navigationCollapsed = ref(false)
const sidebarCollapsed = ref(false)
const footerCollapsed = ref(false)
const showProjectWizard = ref(false)

// 智能工作流
const {
  totalWorkflowProgress,
  nextStepSuggestion,
  showWorkflowGuide,
  initializeWorkflow
} = useSmartWorkflow()

// 工作空间管理
const workspaces = ref([
  { id: "default", name: "默认工作空间" },
  { id: "project1", name: "智慧工地项目" },
  { id: "project2", name: "用户管理系统" },
])
const currentWorkspace = ref(workspaces.value[0])

// 流程步骤管理
const currentStep = ref("modeling")
const steps = {
  modeling: "数据建模",
  design: "页面设计",
  generate: "代码生成",
}

// 状态管理
const buildStatus = ref("就绪")
const issueCount = ref(0)
const undoDisabled = ref(true)
const redoDisabled = ref(true)

// 面板状态
const activeSidebarTab = ref("properties")
const activeFooterTab = ref("output")

// 数据
const outputContent = ref("欢迎使用LowCode Studio企业级工作台\n等待您的操作...")
const previewCode = ref("<div>预览内容</div>")
const issues = ref([
  {
    id: 1,
    type: "warning",
    message: "建议为实体添加描述信息",
    file: "User.entity",
    line: 1,
  },
])
const logs = ref([
  {
    id: 1,
    level: "info",
    message: "LowCode Studio 已启动",
    timestamp: Date.now(),
  },
])

// 计算属性
const currentStepName = computed(() => steps[currentStep.value as keyof typeof steps] || "未知")

const currentPropertiesComponent = computed(() => {
  switch (currentStep.value) {
    case "modeling":
      return "div" // 这里应该是实体属性编辑器
    case "design":
      return "div" // 这里应该是组件属性编辑器
    case "generate":
      return "div" // 这里应该是生成配置编辑器
    default:
      return "div"
  }
})

// 方法
const switchWorkspace = (workspaceId: string) => {
  const workspace = workspaces.value.find(ws => ws.id === workspaceId)
  if (workspace) {
    currentWorkspace.value = workspace
    addLog("info", `切换到工作空间：${workspace.name}`)
  }
}

const setCurrentStep = (step: string) => {
  currentStep.value = step
  addLog("info", `进入步骤：${steps[step as keyof typeof steps]}`)
}

const toggleNavigation = () => {
  navigationCollapsed.value = !navigationCollapsed.value
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleFooter = () => {
  footerCollapsed.value = !footerCollapsed.value
}

const toggleSettings = () => {
  addLog("info", "设置功能开发中...")
}

const undo = () => {
  addLog("info", "执行撤销操作")
}

const redo = () => {
  addLog("info", "执行重做操作")
}

const preview = () => {
  addLog("info", "启动预览模式")
  previewCode.value = `<div style="padding: 20px;">
    <h2>预览内容</h2>
    <p>当前步骤：${currentStepName.value}</p>
    <p>工作空间：${currentWorkspace.value.name}</p>
  </div>`
}

const generate = async () => {
  buildStatus.value = "生成中..."
  addLog("info", "开始生成代码...")

  try {
    // 🚀 连接真实的后端代码生成引擎
    const generateRequest = {
      moduleName: currentWorkspace.value.name,
      entities: [
        {
          name: "User",
          properties: [
            { name: "Name", type: "string", required: true },
            { name: "Email", type: "string", required: true },
            { name: "IsActive", type: "bool", required: false }
          ]
        }
      ],
      generateBackend: true,
      generateFrontend: true,
      generateTests: true
    }

    addLog("info", "正在调用后端代码生成服务...")

    // 调用真实的CodeGenerationAppService
    const response = await fetch('/api/code-generation/generate-module', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
      },
      body: JSON.stringify(generateRequest)
    })

    if (!response.ok) {
      throw new Error(`生成失败: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    buildStatus.value = "生成完成"
    outputContent.value += "\n\n=== 代码生成完成 ===\n"
    outputContent.value += `模块名称: ${result.moduleName}\n`
    outputContent.value += `生成文件数: ${result.generatedFiles?.length || 0}\n`

    if (result.generatedFiles && result.generatedFiles.length > 0) {
      outputContent.value += "\n生成的文件:\n"
      result.generatedFiles.forEach((file: string) => {
        outputContent.value += `- ${file}\n`
      })
    }

    if (result.generationReport) {
      outputContent.value += "\n生成报告:\n"
      outputContent.value += result.generationReport
    }

    addLog("success", `代码生成完成！生成了 ${result.generatedFiles?.length || 0} 个文件`)

  } catch (error: any) {
    buildStatus.value = "生成失败"
    const errorMessage = error.message || "未知错误"
    outputContent.value += `\n\n=== 代码生成失败 ===\n`
    outputContent.value += `错误: ${errorMessage}\n`
    addLog("error", `代码生成失败: ${errorMessage}`)

    // 添加问题到问题面板
    issues.value.push({
      id: Date.now(),
      type: "error",
      message: `代码生成失败: ${errorMessage}`,
      file: "CodeGeneration",
      line: 1
    })
    issueCount.value = issues.value.length
  }
}

const togglePreview = () => {
  activeSidebarTab.value = "preview"
  preview()
}

const toggleFullscreen = () => {
  addLog("info", "全屏模式切换")
}

const onFooterTabClick = () => {
  if (footerCollapsed.value) {
    footerCollapsed.value = false
  }
}

const clearLogs = () => {
  if (activeFooterTab.value === "logs") {
    logs.value = []
  } else if (activeFooterTab.value === "output") {
    outputContent.value = ""
  }
}

const getIssueIcon = (type: string) => {
  switch (type) {
    case "error":
      return "el-icon-circle-close"
    case "warning":
      return "el-icon-warning"
    case "info":
      return "el-icon-info"
    default:
      return "el-icon-info"
  }
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const addLog = (level: string, message: string) => {
  logs.value.push({
    id: Date.now(),
    level,
    message,
    timestamp: Date.now(),
  })
}

const handleProjectGenerated = (result: any) => {
  addLog("success", `项目生成完成: ${result.config.projectName}`)
  addLog("info", `已生成 ${result.template.entities.length} 个实体`)
  addLog("info", `预计生成 ${result.template.estimatedFiles} 个代码文件`)

  // 自动切换到数据建模步骤查看结果
  setCurrentStep('modeling')

  ElMessage.success({
    message: '🎉 企业级项目生成完成！请查看数据建模结果',
    duration: 5000,
    showClose: true
  })
}

// 生命周期
onMounted(() => {
  addLog("info", "LowCode Studio 企业级工作台已启动")
  addLog("info", `当前工作空间：${currentWorkspace.value.name}`)

  // 初始化智能工作流
  initializeWorkflow()

  // 根据路由设置当前步骤
  if (route.path.includes("generation")) {
    setCurrentStep("generate")
  } else if (route.path.includes("design")) {
    setCurrentStep("design")
  } else if (route.path.includes("entity-modeling")) {
    setCurrentStep("modeling")
  } else {
    setCurrentStep("modeling")
  }
})
</script>

<style scoped>
/* 企业级LowCode Studio工作台样式 */
.lowcode-studio {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: var(--el-bg-color-page);
  font-family: var(--el-font-family);
}

/* =========================== */
/* 顶部壳层区域 */
/* =========================== */
.studio-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.studio-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
}

.workspace-selector {
  cursor: pointer;
}

.workspace-name {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.workspace-name:hover {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.studio-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicators {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 智能工作流样式 */
.workflow-progress {
  position: relative;
  cursor: pointer;
}

.progress-indicator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-text {
  position: absolute;
  font-size: 10px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  pointer-events: none;
}

.suggestion-icon {
  color: var(--el-color-primary);
  cursor: pointer;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

.status-badge {
  cursor: pointer;
}

.status-error {
  color: var(--el-color-danger);
}

.status-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  min-width: 60px;
}

/* =========================== */
/* 主体区域布局 */
/* =========================== */
.studio-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* =========================== */
/* 左侧导航面板 */
/* =========================== */
.studio-navigation {
  width: 280px;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.studio-navigation.collapsed {
  width: 64px;
}

.nav-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.nav-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.nav-menu {
  flex: 1;
  padding: 12px 8px;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 24px;
}

.nav-section-title {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 2px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  color: var(--el-text-color-regular);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.nav-item.active .nav-link {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  font-weight: 600;
}

.step-number {
  position: absolute;
  right: 12px;
  background: var(--el-color-primary);
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

/* =========================== */
/* 中央工作区 */
/* =========================== */
.studio-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-page);
  overflow: hidden;
}

.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.workspace-actions {
  display: flex;
  gap: 8px;
}

.workspace-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

/* =========================== */
/* 右侧属性面板 */
/* =========================== */
.studio-sidebar {
  width: 320px;
  background: var(--el-bg-color);
  border-left: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.studio-sidebar.collapsed {
  width: 48px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.sidebar-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.sidebar-content {
  flex: 1;
  overflow: hidden;
}

.sidebar-tabs {
  height: 100%;
}

.sidebar-tabs :deep(.el-tabs__content) {
  height: calc(100% - 40px);
  padding: 16px;
  overflow: auto;
}

/* =========================== */
/* 底部日志面板 */
/* =========================== */
.studio-footer {
  height: 280px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
  transition: height 0.3s ease;
}

.studio-footer.collapsed {
  height: 40px;
}

.footer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.footer-tabs {
  flex: 1;
}

.footer-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.footer-content {
  flex: 1;
  overflow: hidden;
}

.output-panel,
.issues-panel,
.logs-panel {
  height: 100%;
  padding: 16px;
  overflow-y: auto;
}

.output-content {
  margin: 0;
  padding: 12px;
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  font-family: var(--el-font-family-mono, Consolas, monospace);
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.issue-item,
.log-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.issue-item:last-child,
.log-entry:last-child {
  border-bottom: none;
}

.issue-error {
  color: var(--el-color-danger);
}

.issue-warning {
  color: var(--el-color-warning);
}

.issue-info {
  color: var(--el-color-info);
}

.issue-message {
  flex: 1;
  font-size: 14px;
}

.issue-location {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: var(--el-font-family-mono, Consolas, monospace);
}

.log-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  min-width: 80px;
  font-family: var(--el-font-family-mono, Consolas, monospace);
}

.log-level {
  font-size: 11px;
  font-weight: bold;
  min-width: 60px;
  padding: 2px 6px;
  border-radius: 4px;
  text-align: center;
}

.log-info .log-level {
  background: var(--el-color-info-light-8);
  color: var(--el-color-info);
}

.log-success .log-level {
  background: var(--el-color-success-light-8);
  color: var(--el-color-success);
}

.log-warning .log-level {
  background: var(--el-color-warning-light-8);
  color: var(--el-color-warning);
}

.log-error .log-level {
  background: var(--el-color-danger-light-8);
  color: var(--el-color-danger);
}

.log-message {
  flex: 1;
  font-size: 13px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* =========================== */
/* 响应式设计 */
/* =========================== */
@media (max-width: 1200px) {
  .studio-navigation {
    width: 240px;
  }

  .studio-sidebar {
    width: 280px;
  }
}

@media (max-width: 992px) {
  .studio-navigation.collapsed {
    width: 0;
    border: none;
  }

  .studio-sidebar.collapsed {
    width: 0;
    border: none;
  }
}

/* =========================== */
/* 动画效果 */
/* =========================== */
.studio-navigation,
.studio-sidebar,
.studio-footer {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link,
.workspace-name {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* =========================== */
/* 可访问性优化 */
/* =========================== */
.nav-link:focus,
.workspace-name:focus {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}

/* =========================== */
/* 默认隐藏滚动条 */
/* =========================== */
.nav-menu::-webkit-scrollbar,
.workspace-content::-webkit-scrollbar,
.output-panel::-webkit-scrollbar,
.issues-panel::-webkit-scrollbar,
.logs-panel::-webkit-scrollbar {
  width: 6px;
}

.nav-menu::-webkit-scrollbar-track,
.workspace-content::-webkit-scrollbar-track,
.output-panel::-webkit-scrollbar-track,
.issues-panel::-webkit-scrollbar-track,
.logs-panel::-webkit-scrollbar-track {
  background: transparent;
}

.nav-menu::-webkit-scrollbar-thumb,
.workspace-content::-webkit-scrollbar-thumb,
.output-panel::-webkit-scrollbar-thumb,
.issues-panel::-webkit-scrollbar-thumb,
.logs-panel::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 3px;
}

.nav-menu::-webkit-scrollbar-thumb:hover,
.workspace-content::-webkit-scrollbar-thumb:hover,
.output-panel::-webkit-scrollbar-thumb:hover,
.issues-panel::-webkit-scrollbar-thumb:hover,
.logs-panel::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-dark);
}
</style>


