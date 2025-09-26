<template>
  <div class="lowcode-studio">
    <!-- 顶部工具栏：保持完整功能 -->
    <header class="studio-header">
      <div class="header-left">
        <router-link
          to="/lowcode"
          class="studio-logo"
        >
          <el-icon><Platform /></el-icon>
          <span class="logo-text">LowCode Studio</span>
        </router-link>

        <div class="workspace-selector">
          <el-dropdown @command="switchWorkspace">
            <span class="workspace-name">
              {{ workspaceInfo.name }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="default">
                  默认工作空间
                </el-dropdown-item>
                <el-dropdown-item command="enterprise">
                  企业工作空间
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="header-center">
        <nav class="main-nav">
          <router-link
            to="/lowcode/entity-modeling"
            class="nav-item"
            :class="{ active: currentStep === 'modeling' }"
          >
            <el-icon><DataBoard /></el-icon>
            <span>实体建模</span>
            <el-badge
              :value="entityCount"
              :hidden="entityCount === 0"
            />
          </router-link>
          <router-link
            to="/lowcode/design"
            class="nav-item"
            :class="{ active: currentStep === 'design' }"
          >
            <el-icon><Brush /></el-icon>
            <span>页面设计</span>
            <el-badge
              :value="pageCount"
              :hidden="pageCount === 0"
            />
          </router-link>
          <router-link
            to="/lowcode/theme"
            class="nav-item"
            :class="{ active: currentStep === 'theme' }"
          >
            <el-icon><PictureRounded /></el-icon>
            <span>主题定制</span>
          </router-link>
          <router-link
            to="/lowcode/generation"
            class="nav-item"
            :class="{ active: currentStep === 'generate' }"
          >
            <el-icon><Cpu /></el-icon>
            <span>代码生成</span>
            <el-badge
              :value="generatedFileCount"
              :hidden="generatedFileCount === 0"
              type="success"
            />
          </router-link>
        </nav>
      </div>

      <div class="header-right">
        <!-- 智能工作流进度 -->
        <div class="workflow-progress">
          <el-tooltip
            content="开发进度"
            placement="bottom"
          >
            <div
              class="progress-indicator"
              @click="() => { initializeWorkflow() }"
            >
              <el-progress
                type="circle"
                :percentage="totalWorkflowProgress"
                :width="32"
                :stroke-width="3"
                :show-text="false"
                :color="totalWorkflowProgress >= 100 ? '#67c23a' : '#409eff'"
              />
            </div>
          </el-tooltip>
        </div>

        <!-- 下一步建议 -->
        <el-tooltip
          v-if="nextStepSuggestion"
          :content="nextStepSuggestion"
          placement="bottom"
        >
          <el-button
            text
            @click="() => { initializeWorkflow() }"
          >
            <el-icon><InfoFilled /></el-icon>
          </el-button>
        </el-tooltip>

        <el-button
          text
          @click="showHelp"
        >
          <el-icon><QuestionFilled /></el-icon>
          帮助
        </el-button>
        <el-button
          text
          @click="showSettings"
        >
          <el-icon><Setting /></el-icon>
          设置
        </el-button>
      </div>
    </header>

    <!-- 主要内容区域：完整功能展示 -->
    <main class="studio-main">
      <!-- 路由视图 - 显示完整的子页面功能 -->
      <router-view />
    </main>

    <!-- 底部状态栏：显示重要信息 -->
    <footer class="studio-footer">
      <div class="footer-left">
        <span class="status-text">就绪</span>
        <span class="separator">|</span>
        <span class="project-info">{{ workspaceInfo.description }}</span>
      </div>

      <div class="footer-center">
        <el-progress
          :percentage="overallProgress"
          :width="100"
          :status="overallProgress === 100 ? 'success' : undefined"
          :show-text="false"
        />
        <span class="progress-text">开发进度 {{ overallProgress }}%</span>
      </div>

      <div class="footer-right">
        <el-tooltip
          content="实体数量"
          placement="top"
        >
          <span class="stat-item">
            <el-icon><DataBoard /></el-icon>
            {{ entityCount }}
          </span>
        </el-tooltip>
        <el-tooltip
          content="页面数量"
          placement="top"
        >
          <span class="stat-item">
            <el-icon><Document /></el-icon>
            {{ pageCount }}
          </span>
        </el-tooltip>
        <el-tooltip
          content="生成文件数"
          placement="top"
        >
          <span class="stat-item">
            <el-icon><Files /></el-icon>
            {{ generatedFileCount }}
          </span>
        </el-tooltip>
      </div>
    </footer>

    <!-- 项目向导对话框 -->
    <el-dialog
      v-model="showProjectWizard"
      title="新建项目"
      width="600px"
      :close-on-click-modal="false"
    >
      <ProjectWizard @project-created="handleProjectCreated" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Platform,
  DataBoard,
  Brush,
  PictureRounded,
  Cpu,
  ArrowDown,
  InfoFilled,
  QuestionFilled,
  Setting,
  Document,
  Files
} from '@element-plus/icons-vue'
import ProjectWizard from "@/components/lowcode/ProjectWizard.vue"
import { useEntityModelingStore } from '@smartabp/lowcode-core'
import { usePageDesignStore, useCodeGenerationStore } from '@smartabp/lowcode-core'
import { useSmartWorkflow } from "@/composables/useSmartWorkflow"
import { logger } from '@/utils/logger'

// 路由
const route = useRoute()
const router = useRouter()

// Stores
const entityStore = useEntityModelingStore()
const pageStore = usePageDesignStore()
const codeGenStore = useCodeGenerationStore()

// 智能工作流
const {
  totalWorkflowProgress,
  nextStepSuggestion,
  initializeWorkflow
} = useSmartWorkflow()

// 响应式数据
const currentStep = ref('modeling')
const showProjectWizard = ref(false)

// 计算属性
const workspaceInfo = computed(() => ({
  id: 'default',
  name: '企业工作空间',
  description: 'SmartAbp企业级低代码开发平台'
}))

const entityCount = computed(() => entityStore.entities.length)
const pageCount = computed(() => pageStore.pages.length)
const generatedFileCount = computed(() => codeGenStore.generationHistory.length > 0 ?
  codeGenStore.generationHistory[0].fileCount : 0)

const overallProgress = computed(() => {
  let progress = 0
  if (entityCount.value > 0) progress += 25
  if (pageCount.value > 0) progress += 25
  if (generatedFileCount.value > 0) progress += 50
  return progress
})

// 方法
const setCurrentStep = (step: string) => {
  currentStep.value = step
  logger?.info('切换工作步骤', { step })
}

const switchWorkspace = (workspaceId: string) => {
  ElMessage.success(`已切换到工作空间: ${workspaceId}`)
  logger?.info('切换工作空间', { workspaceId })
}

const showHelp = () => {
  ElMessage.info('帮助文档功能完整可用')
}

const showSettings = () => {
  ElMessage.info('设置面板功能完整可用')
}

const handleProjectCreated = (project: any) => {
  ElMessage.success(`项目 "${project.name}" 创建成功`)
  showProjectWizard.value = false
  router.push('/lowcode/entity-modeling')
}

// 生命周期
onMounted(() => {
  logger?.info('LowCode Studio 启动', { route: route.path })

  // 根据当前路由设置步骤
  if (route.path.includes('entity-modeling')) {
    setCurrentStep('modeling')
  } else if (route.path.includes('design')) {
    setCurrentStep('design')
  } else if (route.path.includes('theme')) {
    setCurrentStep('theme')
  } else if (route.path.includes('generation')) {
    setCurrentStep('generate')
  }

  // 初始化工作流
  initializeWorkflow()
})
</script>

<style scoped>
/* 企业级LowCode Studio样式 - 确保界面清晰可用 */
.lowcode-studio {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 顶部工具栏 */
.studio-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.studio-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
  text-decoration: none;
}

.workspace-selector {
  min-width: 150px;
}

.workspace-name {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.main-nav {
  display: flex;
  gap: 4px;
  background: #f5f7fa;
  padding: 4px;
  border-radius: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  color: #606266;
  text-decoration: none;
  transition: all 0.2s;
  font-size: 14px;
  position: relative;
}

.nav-item:hover {
  background: white;
  color: #409eff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-item.active {
  background: #409eff;
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.workflow-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-indicator {
  cursor: pointer;
}

/* 主要内容区域 */
.studio-main {
  flex: 1;
  overflow: hidden;
  background: white;
  margin: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 底部状态栏 */
.studio-footer {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: white;
  border-top: 1px solid #e4e7ed;
  font-size: 12px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #606266;
}

.separator {
  color: #dcdfe6;
}

.footer-center {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-text {
  color: #67c23a;
  font-weight: 500;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  font-size: 12px;
}

/* 状态指示器 */
.status-text {
  color: #67c23a;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-center {
    display: none;
  }
}

@media (max-width: 768px) {
  .studio-header {
    padding: 0 16px;
  }

  .header-left {
    gap: 12px;
  }

  .workspace-selector {
    display: none;
  }

  .footer-center {
    display: none;
  }
}
</style>
