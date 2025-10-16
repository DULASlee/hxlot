<template>
  <div class="lowcode-studio-home">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-header">
        <el-icon class="welcome-icon" :size="48">
          <MagicStick />
        </el-icon>
        <h1>{{ greetingMessage }}，{{ userName }}</h1>
        <p class="welcome-desc">
          SmartAbp全栈代码生成器 - 已为您生成 <strong>{{ stats.totalProjects }}</strong> 个项目，节省 <strong>{{ stats.savedHours
          }}</strong> 小时开发时间
        </p>
      </div>

      <!-- 统计卡片 -->
      <div v-loading="statsLoading" class="stats-cards">
        <div class="stat-card">
          <div class="stat-value">
            {{ stats.totalProjects }}
          </div>
          <div class="stat-label">
            累计生成项目
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-value">
            {{ stats.monthlyGenerations }}
          </div>
          <div class="stat-label">
            本月生成次数
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-value">
            {{ stats.savedHours }}
          </div>
          <div class="stat-label">
            节省工时（小时）
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-value">
            {{ stats.qualityScore.toFixed(1) }}
          </div>
          <div class="stat-label">
            代码质量评分
          </div>
        </div>
      </div>
    </div>

    <!-- 快速导航卡片 -->
    <div class="quick-nav-section">
      <div class="section-title">
        <h2>快速开始</h2>
        <p>选择代码生成模式，快速构建您的业务系统</p>
      </div>

      <div class="nav-cards">
        <div v-for="nav in quickNavItems" :key="nav.path" class="nav-card" :class="{ 'most-used': nav.isMostUsed }"
          @click="navigateTo(nav.path)">
          <div class="card-icon">
            <el-icon :size="32">
              <component :is="nav.icon" />
            </el-icon>
          </div>
          <div class="card-content">
            <h3>{{ nav.title }}</h3>
            <p>{{ nav.description }}</p>
            <div v-if="nav.usageCount > 0" class="usage-info">
              <el-tag type="info" size="small">
                使用{{ nav.usageCount }}次
              </el-tag>
              <el-tag v-if="nav.isMostUsed" type="success" size="small">
                最常用
              </el-tag>
            </div>
          </div>
          <div class="card-action">
            <el-button type="primary" text>
              开始使用
              <el-icon class="ml-1">
                <ArrowRight />
              </el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近项目 -->
    <div class="recent-section">
      <div class="section-title">
        <h2>最近生成的项目</h2>
        <el-button v-if="recentProjects.length > 0" type="primary" text @click="viewAllProjects">
          查看全部
        </el-button>
      </div>

      <div v-loading="projectsLoading" class="recent-projects">
        <!-- 有数据时显示项目卡片 -->
        <div v-if="recentProjects.length > 0" class="projects-grid">
          <div v-for="project in recentProjects" :key="project.id" class="project-card">
            <div class="project-header">
              <div class="project-info">
                <h3>{{ project.projectName }}</h3>
                <el-tag :type="project.status === 'success' ? 'success' : 'danger'" size="small">
                  {{ project.status === 'success' ? '生成成功' : '生成失败' }}
                </el-tag>
              </div>
              <div class="project-meta">
                <span>{{ formatTime(project.creationTime) }}</span>
              </div>
            </div>

            <div class="project-stats">
              <div class="stat-item">
                <span class="label">模式：</span>
                <span class="value">{{ getModeLabel(project.mode) }}</span>
              </div>
              <div v-if="project.templateName" class="stat-item">
                <span class="label">模板：</span>
                <span class="value">{{ project.templateName }}</span>
              </div>
              <div class="stat-item">
                <span class="label">实体：</span>
                <span class="value">{{ project.entityCount }} 个</span>
              </div>
              <div class="stat-item">
                <span class="label">文件：</span>
                <span class="value">{{ project.generatedFileCount }} 个</span>
              </div>
              <div class="stat-item">
                <span class="label">耗时：</span>
                <span class="value">{{ project.generationDuration }}s</span>
              </div>
            </div>

            <div class="project-actions">
              <el-button size="small" @click="continueEdit(project)">
                继续编辑
              </el-button>
              <el-button size="small" type="danger" text @click="deleteProject(project)">
                删除
              </el-button>
            </div>
          </div>
        </div>

        <!-- 无数据时显示Empty -->
        <div v-else class="project-placeholder">
          <el-empty description="暂无生成记录" :image-size="80">
            <el-button type="primary" @click="startNewProject">
              开始第一个项目
            </el-button>
          </el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Brush, DataBoard, MagicStick, Opportunity } from '@element-plus/icons-vue'
import type { CodeGenStatsDto } from '@smartabp/lowcode-api'
import { codeGenStatsApi, legacyGenerationHistoryApi, userProfileApi } from '@smartabp/lowcode-api'

// 向后兼容：旧的GenerationHistoryDto类型
interface GenerationHistoryDto {
  id: string
  projectName: string
  status: 'success' | 'failed' | 'warning'
  creationTime: string
  mode?: string
  templateName?: string
  entityCount?: number
  generatedFileCount?: number
  generationDuration?: number
}
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ========== 状态管理 ==========

const stats = ref<CodeGenStatsDto>({
  totalProjects: 0,
  monthlyGenerations: 0,
  savedHours: 0,
  qualityScore: 0,
  lastUpdated: new Date().toISOString()
})

const recentProjects = ref<GenerationHistoryDto[]>([])
const statsLoading = ref(false)
const projectsLoading = ref(false)
const userName = ref('开发者')

// ========== 计算属性 ==========

const greetingMessage = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

// 使用与 Element Plus 图标相同的组件类型，避免对 `vue` 的全局 Component 依赖
type IconComp = typeof Opportunity

interface QuickNavItem {
  path: string
  title: string
  description: string
  icon: IconComp
  usageCount: number
  isMostUsed: boolean
}

// 快速导航项目
const quickNavItems = ref<QuickNavItem[]>([
  {
    path: '/CodeGen/ultra-simple',
    title: '极简生成',
    description: '3步快速生成标准CRUD系统代码',
    icon: Opportunity,
    usageCount: 0,
    isMostUsed: false
  },
  {
    path: '/lowcode/entity-modeling',
    title: '实体建模',
    description: '设计数据模型，生成Entity/DTO代码',
    icon: DataBoard,
    usageCount: 0,
    isMostUsed: false
  },
  {
    path: '/lowcode/design',
    title: '页面设计',
    description: '可视化设计，生成Vue组件代码',
    icon: Brush,
    usageCount: 0,
    isMostUsed: false
  },
  {
    path: '/lowcode/generation',
    title: '代码生成',
    description: '查看生成进度和历史记录',
    icon: MagicStick,
    usageCount: 0,
    isMostUsed: false
  }
])

// ========== 生命周期 ==========

onMounted(async () => {
  await Promise.all([
    loadStats(),
    loadRecentProjects(),
    loadUserProfile()
  ])

  calculateMostUsed()
})

// ========== 方法 ==========

/**
 * 加载统计数据
 */
const loadStats = async () => {
  statsLoading.value = true
  try {
    const data = await codeGenStatsApi.getMyStats()
    stats.value = data
  } catch (error) {
    console.error('加载统计数据失败:', error)
    stats.value = {
      totalProjects: 0,
      monthlyGenerations: 0,
      savedHours: 0,
      qualityScore: 0,
      lastUpdated: new Date().toISOString()
    }
  } finally {
    statsLoading.value = false
  }
}

/**
 * 加载最近项目
 */
const loadRecentProjects = async () => {
  projectsLoading.value = true
  try {
    const projects = await legacyGenerationHistoryApi.getRecentProjects(5) as GenerationHistoryDto[]
    recentProjects.value = projects
  } catch (error) {
    console.error('加载最近项目失败:', error)
    recentProjects.value = []
  } finally {
    projectsLoading.value = false
  }
}

/**
 * 加载用户配置
 */
const loadUserProfile = async () => {
  try {
    const profile = await userProfileApi.getMyProfile()
    if (profile.companyName) {
      userName.value = profile.companyName
    }
  } catch (error) {
    console.error('加载用户配置失败:', error)
  }
}

/**
 * 计算最常用功能
 */
const calculateMostUsed = () => {
  // 基于最近项目统计使用次数
  const modeCounts: Record<string, number> = {}

  recentProjects.value.forEach((p: GenerationHistoryDto) => {
    if (p.mode) {
      modeCounts[p.mode] = (modeCounts[p.mode] || 0) + 1
    }
  })

  // 映射mode到导航项
  const modeToPath: Record<string, string> = {
    'simple': '/CodeGen/ultra-simple',
    'industry': '/lowcode/industry-template-config',
    'pro': '/lowcode/entity-modeling'
  }

  // 更新使用次数
  quickNavItems.value.forEach((item: QuickNavItem) => {
    const mode = Object.keys(modeToPath).find(k => modeToPath[k] === item.path)
    if (mode) {
      item.usageCount = modeCounts[mode] || 0
    }
  })

  // 标记最常用
  const maxCount = Math.max(...quickNavItems.value.map((item: QuickNavItem) => item.usageCount))
  if (maxCount > 0) {
    quickNavItems.value.forEach((item: QuickNavItem) => {
      item.isMostUsed = item.usageCount === maxCount
    })
  }
}

/**
 * 格式化时间
 */
const formatTime = (time: string): string => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN')
}

/**
 * 获取模式标签
 */
const getModeLabel = (mode?: string): string => {
  if (!mode) return '未知模式'
  const labels: Record<string, string> = {
    'simple': '极简模式',
    'industry': '行业模板',
    'pro': '专业模式'
  }
  return labels[mode] || mode
}

/**
 * 导航到指定页面
 */
const navigateTo = (path: string) => {
  router.push(path)
}

/**
 * 查看所有项目
 */
const viewAllProjects = () => {
  router.push('/lowcode/generation')
}

/**
 * 开始新项目
 */
const startNewProject = () => {
  router.push('/codegen-entrance')
}

/**
 * 继续编辑项目
 */
const continueEdit = (project: GenerationHistoryDto) => {
  // 根据模式跳转到对应页面
  if (project.mode === 'simple') {
    router.push('/CodeGen/ultra-simple')
  } else if (project.mode === 'industry') {
    router.push({
      path: '/lowcode/industry-template-config',
      query: { template: project.templateName || '' }
    })
  } else {
    router.push('/lowcode/entity-modeling')
  }
}

/**
 * 删除项目
 */
const deleteProject = async (project: GenerationHistoryDto) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目"${project.projectName}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await legacyGenerationHistoryApi.deleteProject(project.id)

    ElMessage.success('删除成功')

    // 重新加载列表
    await loadRecentProjects()
    await loadStats()

  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除项目失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  }
}
</script>

<style scoped lang="scss">
.lowcode-studio-home {
  padding: 24px;
  background: var(--el-bg-color-page);
  min-height: 100%;
}

.welcome-section {
  text-align: center;
  padding: 40px 24px 48px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-8) 100%);
  border-radius: 12px;
  margin-bottom: 32px;
}

.welcome-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 16px 0 8px;
}

.welcome-desc {
  font-size: 16px;
  color: var(--el-text-color-regular);
  margin: 0 0 32px 0;

  strong {
    color: var(--el-color-primary);
    font-weight: 600;
  }
}

.welcome-icon {
  color: var(--el-color-primary);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--el-color-primary);
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.quick-nav-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.section-title p {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 4px 0 0;
}

.nav-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.nav-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &.most-used {
    border-color: var(--el-color-success);
    background: var(--el-color-success-light-9);
  }

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.card-icon {
  margin-right: 16px;
  color: var(--el-color-primary);
}

.card-content {
  flex: 1;
}

.card-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 4px;
}

.card-content p {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0 0 8px 0;
}

.usage-info {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.card-action {
  margin-left: 16px;
}

.recent-section {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 24px;
}

.recent-projects {
  min-height: 200px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.project-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.project-info {
  flex: 1;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 8px 0;
  }
}

.project-meta {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.project-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.stat-item {
  font-size: 14px;

  .label {
    color: var(--el-text-color-secondary);
  }

  .value {
    color: var(--el-text-color-primary);
    font-weight: 500;
  }
}

.project-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.project-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  width: 100%;
}

.ml-1 {
  margin-left: 4px;
}

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .nav-cards {
    grid-template-columns: 1fr;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
