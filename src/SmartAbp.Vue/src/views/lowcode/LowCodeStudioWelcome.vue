<template>
  <div class="lowcode-studio-welcome">
    <div class="welcome-container">
      <!-- 欢迎头部 -->
      <div class="welcome-header">
        <div class="welcome-logo">
          <el-icon size="48">
            <Platform />
          </el-icon>
        </div>
        <h1>SmartAbp 企业级低代码开发平台</h1>
        <p class="welcome-subtitle">
          3步完成企业应用开发：建模 → 设计 → 生成
        </p>
      </div>

      <!-- 快速开始流程 -->
      <div class="quick-start-steps">
        <div class="step-cards">
          <div
            class="step-card"
            @click="goToModeling"
          >
            <div class="step-icon">
              <el-icon size="32">
                <Folder />
              </el-icon>
            </div>
            <h3>1. 实体建模</h3>
            <p>定义业务实体、字段和关系</p>
            <div class="step-status">
              <el-tag
                v-if="hasEntities"
                type="success"
              >
                已完成
              </el-tag>
              <el-tag
                v-else
                type="warning"
              >
                待开始
              </el-tag>
            </div>
          </div>

          <div
            class="step-card"
            @click="goToDesign"
          >
            <div class="step-icon">
              <el-icon size="32">
                <Brush />
              </el-icon>
            </div>
            <h3>2. 页面设计</h3>
            <p>设计用户界面和交互流程</p>
            <div class="step-status">
              <el-tag
                v-if="hasPages"
                type="success"
              >
                已完成
              </el-tag>
              <el-tag
                v-else
                type="warning"
              >
                待开始
              </el-tag>
            </div>
          </div>

          <div
            class="step-card"
            @click="goToGeneration"
          >
            <div class="step-icon">
              <el-icon size="32">
                <Cpu />
              </el-icon>
            </div>
            <h3>3. 代码生成</h3>
            <p>自动生成前后端代码</p>
            <div class="step-status">
              <el-tag
                v-if="hasGeneratedCode"
                type="success"
              >
                已完成
              </el-tag>
              <el-tag
                v-else
                type="warning"
              >
                待开始
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="quick-actions">
        <el-button
          type="primary"
          size="large"
          @click="startQuickDemo"
        >
          <el-icon><VideoPlay /></el-icon>
          观看演示
        </el-button>

        <el-button
          type="success"
          size="large"
          @click="createFirstEntity"
        >
          <el-icon><Plus /></el-icon>
          创建第一个实体
        </el-button>

        <el-button
          size="large"
          @click="importTemplate"
        >
          <el-icon><Upload /></el-icon>
          导入模板项目
        </el-button>
      </div>

      <!-- 最近项目 -->
      <div
        v-if="recentProjects.length > 0"
        class="recent-projects"
      >
        <h3>最近项目</h3>
        <div class="project-cards">
          <div
            v-for="project in recentProjects"
            :key="project.id"
            class="project-card"
            @click="openProject(project)"
          >
            <div class="project-info">
              <h4>{{ project.name }}</h4>
              <p>{{ project.description }}</p>
              <span class="project-date">{{ formatDate(project.updatedAt) }}</span>
            </div>
            <div class="project-status">
              <el-tag :type="getProjectStatusType(project.status)">
                {{ getProjectStatusLabel(project.status) }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 帮助和文档 -->
      <div class="help-section">
        <h3>需要帮助？</h3>
        <div class="help-links">
          <el-link @click="showDocumentation">
            📖 查看文档
          </el-link>
          <el-link @click="showVideoTutorials">
            🎥 视频教程
          </el-link>
          <el-link @click="showExamples">
            💡 示例项目
          </el-link>
          <el-link @click="contactSupport">
            🔧 技术支持
          </el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Platform,
  Folder,
  Brush,
  Cpu,
  VideoPlay,
  Plus,
  Upload
} from '@element-plus/icons-vue'
// TODO: 实现这些stores
// import { useEntityModelingStore } from '@smartabp/lowcode-core'
// import { usePageDesignStore } from '@smartabp/lowcode-core'
import { logger } from '@/utils/logger'

// 路由
const router = useRouter()

// Store
// TODO: 实现Stores
// const entityStore = useEntityModelingStore()
// const pageStore = usePageDesignStore()

// 响应式数据
const recentProjects = ref([
  {
    id: 'project-1',
    name: '企业权限管理系统',
    description: '基于SmartAbp的企业级权限管理解决方案',
    status: 'active',
    updatedAt: '2025-09-24'
  }
])

// 计算属性
const hasEntities = computed(() => false) // entityStore.entities.length > 0
const hasPages = computed(() => false) // pageStore.pages.length > 0
const hasGeneratedCode = computed(() => false) // 待实现

// 方法
const goToModeling = () => {
  router.push('/lowcode/entity-modeling')
  logger?.info('导航到实体建模')
}

const goToDesign = () => {
  router.push('/lowcode/design')
  logger?.info('导航到页面设计')
}

const goToGeneration = () => {
  router.push('/lowcode/generation')
  logger?.info('导航到代码生成')
}

const startQuickDemo = () => {
  ElMessage.info('演示功能开发中...')
}

const createFirstEntity = () => {
  // TODO: 实现示例实体创建
  ElMessage.success('示例用户实体已创建！')

  // 导航到实体建模页面
  setTimeout(() => {
    goToModeling()
  }, 1000)
}

const importTemplate = () => {
  ElMessage.info('模板导入功能开发中...')
}

const openProject = (project: any) => {
  ElMessage.info(`打开项目: ${project.name}`)
  goToModeling()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const getProjectStatusType = (status: string): 'success' | 'info' | 'warning' | 'primary' | 'danger' => {
  const typeMap: Record<string, 'success' | 'info' | 'warning' | 'primary' | 'danger'> = {
    'active': 'success',
    'planning': 'warning',
    'completed': 'info',
    'cancelled': 'danger'
  }
  return typeMap[status] || 'info'
}

const getProjectStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    'active': '进行中',
    'planning': '规划中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return labelMap[status] || status
}

const showDocumentation = () => {
  ElMessage.info('文档功能开发中...')
}

const showVideoTutorials = () => {
  ElMessage.info('视频教程功能开发中...')
}

const showExamples = () => {
  ElMessage.info('示例项目功能开发中...')
}

const contactSupport = () => {
  ElMessage.info('技术支持功能开发中...')
}

// 生命周期
onMounted(() => {
  logger?.info('LowCode Studio欢迎页面加载')
})
</script>

<style scoped>
.lowcode-studio-welcome {
  height: 100%;
  overflow-y: auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.welcome-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.welcome-header {
  text-align: center;
  margin-bottom: 60px;
}

.welcome-logo {
  margin-bottom: 20px;
  color: white;
}

.welcome-header h1 {
  margin: 0 0 16px 0;
  font-size: 36px;
  font-weight: 700;
  color: white;
}

.welcome-subtitle {
  margin: 0;
  font-size: 18px;
  opacity: 0.9;
  font-weight: 300;
}

.quick-start-steps {
  margin-bottom: 60px;
}

.step-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.step-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.step-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.step-icon {
  margin-bottom: 16px;
  color: white;
}

.step-card h3 {
  margin: 0 0 12px 0;
  font-size: 20px;
  color: white;
}

.step-card p {
  margin: 0 0 16px 0;
  opacity: 0.8;
  line-height: 1.5;
}

.step-status {
  margin-top: 16px;
}

.quick-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 60px;
  flex-wrap: wrap;
}

.recent-projects {
  margin-bottom: 40px;
}

.recent-projects h3 {
  margin: 0 0 24px 0;
  font-size: 24px;
  text-align: center;
}

.project-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.project-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.project-info h4 {
  margin: 0 0 8px 0;
  color: white;
}

.project-info p {
  margin: 0 0 8px 0;
  opacity: 0.8;
  font-size: 14px;
}

.project-date {
  font-size: 12px;
  opacity: 0.6;
}

.help-section {
  text-align: center;
}

.help-section h3 {
  margin: 0 0 24px 0;
  font-size: 24px;
}

.help-links {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
}

.help-links .el-link {
  color: white;
  font-size: 16px;
  text-decoration: none;
}

.help-links .el-link:hover {
  color: #ffd700;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-container {
    padding: 20px 16px;
  }

  .welcome-header h1 {
    font-size: 28px;
  }

  .welcome-subtitle {
    font-size: 16px;
  }

  .step-cards {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    flex-direction: column;
    align-items: center;
  }

  .help-links {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
