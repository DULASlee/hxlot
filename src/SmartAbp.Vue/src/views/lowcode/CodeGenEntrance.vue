<template>
  <div class="codegen-entrance">
    <div class="entrance-container">
      <!-- 标题 -->
      <h1 class="main-title">
        {{ greetingMessage }}，选择代码生成模式
      </h1>
      <p class="subtitle">
        SmartAbp低代码平台 - 面向小型私营企业的智能制造与工地管理解决方案
      </p>

      <!-- 统计横幅 -->
      <div v-if="stats.totalProjects > 0" class="stats-banner">
        <div class="stat-item">
          <el-statistic title="累计生成" :value="stats.totalProjects" :loading="statsLoading">
            <template #suffix>
              个项目
            </template>
          </el-statistic>
        </div>
        <div class="stat-item">
          <el-statistic title="本月生成" :value="stats.monthlyGenerations" :loading="statsLoading">
            <template #suffix>
              次
            </template>
          </el-statistic>
        </div>
        <div class="stat-item">
          <el-statistic title="节省时间" :value="stats.savedHours" :loading="statsLoading">
            <template #suffix>
              小时
            </template>
          </el-statistic>
        </div>
        <div class="stat-item">
          <el-statistic title="代码质量" :value="stats.qualityScore" :precision="1" :loading="statsLoading">
            <template #suffix>
              分
            </template>
          </el-statistic>
        </div>
      </div>

      <!-- 模式卡片 -->
      <div class="modes-container">
        <!-- 极简模式 -->
        <div class="mode-card simple-mode">
          <div class="mode-icon">
            ⚡
          </div>
          <h2 class="mode-title">
            极简模式
          </h2>
          <p class="mode-desc">
            三步快速生成，适合标准CRUD功能
          </p>
          <ul class="mode-features">
            <li>✅ 5分钟上手</li>
            <li>✅ 选表→配置→生成</li>
            <li>✅ 适合80%场景</li>
            <li>✅ 零学习成本</li>
          </ul>
          <el-tag v-if="recommendedMode === 'simple'" type="success" effect="dark" class="recommend-badge">
            ⭐ 推荐
          </el-tag>
          <el-button type="primary" size="large" class="mode-btn" @click.stop="goToSimpleMode">
            立即开始
          </el-button>
        </div>

        <!-- 🆕 行业模板模式 -->
        <div class="mode-card industry-mode">
          <div class="mode-icon">
            🏭
          </div>
          <h2 class="mode-title">
            行业模板
          </h2>
          <p class="mode-desc">
            一键生成MES/智慧工地完整系统
          </p>
          <ul class="mode-features">
            <li>✅ 10分钟完整系统</li>
            <li>✅ Web+APP+大屏+IoT</li>
            <li>✅ 开箱即用</li>
            <li>✅ 95%功能完整</li>
          </ul>
          <el-tag v-if="recommendedMode === 'industry'" type="warning" effect="dark" class="recommend-badge">
            ⭐ 推荐
          </el-tag>
          <el-dropdown trigger="click" size="large" @command="selectIndustryTemplate">
            <el-button type="warning" size="large" class="mode-btn">
              选择行业 <el-icon class="el-icon--right">
                <ArrowDown />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="saas-mes">
                  <div class="template-item">
                    <el-icon size="20">
                      <Tools />
                    </el-icon>
                    <div class="template-info">
                      <div class="template-name">
                        🏭 SaaS云MES系统
                      </div>
                      <div class="template-desc">
                        生产管理、设备监控、质量追溯
                      </div>
                    </div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item command="smart-construction">
                  <div class="template-item">
                    <el-icon size="20">
                      <OfficeBuilding />
                    </el-icon>
                    <div class="template-info">
                      <div class="template-name">
                        🏗️ 智慧工地管理
                      </div>
                      <div class="template-desc">
                        人员、安全、进度、环境监测
                      </div>
                    </div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item command="coming-soon" disabled>
                  <div class="template-item">
                    <el-icon size="20">
                      <MoreFilled />
                    </el-icon>
                    <div class="template-info">
                      <div class="template-name">
                        📊 更多行业模板
                      </div>
                      <div class="template-desc">
                        即将推出：仓储、零售、医疗...
                      </div>
                    </div>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 专业模式 -->
        <div class="mode-card pro-mode">
          <div class="mode-icon">
            🧩
          </div>
          <h2 class="mode-title">
            专业模式
          </h2>
          <p class="mode-desc">
            完整工作台，适合复杂业务和深度定制
          </p>
          <ul class="mode-features">
            <li>✅ 数据建模</li>
            <li>✅ 页面设计</li>
            <li>✅ 工作流编排</li>
            <li>✅ 完全自定义</li>
          </ul>
          <el-tag v-if="recommendedMode === 'pro'" type="primary" effect="dark" class="recommend-badge">
            ⭐ 推荐
          </el-tag>
          <el-button type="success" size="large" class="mode-btn" @click.stop="goToProMode">
            进入工作台
          </el-button>
        </div>
      </div>

      <!-- 对比表格 -->
      <div class="comparison">
        <h3>
          <el-icon>
            <TrendCharts />
          </el-icon>
          详细对比
        </h3>
        <el-table :data="comparisonData" border stripe style="width: 100%"
          :header-cell-style="{ background: '#f5f7fa' }">
          <el-table-column prop="feature" label="特性" width="180" fixed>
            <template #default="{ row }">
              <span v-if="row.icon" class="feature-icon">{{ row.icon }}</span>
              {{ row.feature }}
            </template>
          </el-table-column>
          <el-table-column prop="simple" label="极简模式" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.highlight === 'simple'" type="success">
                {{ row.simple }}
              </el-tag>
              <span v-else>{{ row.simple }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="industry" label="行业模板" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.highlight === 'industry'" type="warning">
                {{ row.industry }}
              </el-tag>
              <span v-else>{{ row.industry }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="pro" label="专业模式" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.highlight === 'pro'" type="primary">
                {{ row.pro }}
              </el-tag>
              <span v-else>{{ row.pro }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 行业推荐提示 -->
      <div v-if="industryRecommendation" class="industry-recommendation">
        <el-alert type="success" :closable="false" show-icon>
          <template #title>
            <span style="font-size: 16px; font-weight: 600;">
              💡 {{ industryRecommendation.reason }}
            </span>
          </template>
          <div style="margin-top: 8px;">
            推荐使用 <strong>{{ industryRecommendation.name }}</strong> 模板，
            {{ industryRecommendation.benefits }}
          </div>
          <el-button type="success" size="small" style="margin-top: 12px;"
            @click="selectIndustryTemplate(industryRecommendation.template)">
            立即使用推荐模板
          </el-button>
        </el-alert>
      </div>
    </div>

    <!-- 新手引导Dialog -->
    <el-dialog v-model="showWelcomeGuide" title="欢迎使用SmartAbp代码生成器" width="600px" :close-on-click-modal="false">
      <div class="welcome-guide-content">
        <el-steps :active="1" align-center>
          <el-step title="选择模式" description="根据需求选择" />
          <el-step title="配置参数" description="简单配置" />
          <el-step title="生成代码" description="一键生成" />
        </el-steps>

        <div class="guide-tips">
          <h4>💡 快速提示：</h4>
          <ul>
            <li><strong>极简模式</strong>：适合标准的增删改查功能，5分钟上手</li>
            <li><strong>行业模板</strong>：一键生成完整的MES/智慧工地系统，包含Web+APP+大屏</li>
            <li><strong>专业模式</strong>：完整工作台，支持复杂业务和深度定制</li>
          </ul>

          <div v-if="industryRecommendation" class="guide-recommendation">
            <el-divider />
            <p style="margin-bottom: 12px;">
              <el-icon color="#67c23a">
                <Check />
              </el-icon>
              根据您的企业信息，我们推荐使用：
            </p>
            <el-card shadow="hover">
              <strong>{{ industryRecommendation.name }}</strong>
              <p style="margin-top: 8px; color: #606266;">
                {{ industryRecommendation.benefits }}
              </p>
            </el-card>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showWelcomeGuide = false">
          我再看看
        </el-button>
        <el-button v-if="industryRecommendation" type="success" @click="useRecommendedTemplate">
          使用推荐模板
        </el-button>
        <el-button v-else type="primary" @click="showWelcomeGuide = false">
          开始使用
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowDown,
  Check,
  MoreFilled,
  OfficeBuilding,
  Tools,
  TrendCharts
} from '@element-plus/icons-vue'
import type { CodeGenStatsDto, IndustryRecommendationDto } from '@smartabp/lowcode-api'
import { codeGenStatsApi, userProfileApi } from '@smartabp/lowcode-api'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ========== 接口定义 ==========

interface ComparisonItem {
  feature: string
  simple: string
  industry: string
  pro: string
  icon?: string
  highlight?: 'simple' | 'industry' | 'pro' | 'neutral'
}

type LastUsedMode = 'simple' | 'industry' | 'pro' | null;

// ========== 使用API类型 ==========
// 已从@smartabp/lowcode-api导入CodeGenStatsDto和IndustryRecommendationDto

// ========== 状态管理 ==========

const stats = ref<CodeGenStatsDto>({
  totalProjects: 0,
  monthlyGenerations: 0,
  savedHours: 0,
  qualityScore: 0,
  lastUpdated: new Date().toISOString()
})

const statsLoading = ref(false)
const showWelcomeGuide = ref(false)
const isFirstVisit = ref(false)
const lastUsedMode = ref<LastUsedMode>(null)
const userIndustry = ref<string>('')
const industryRecommendation = ref<IndustryRecommendationDto | null>(null)
// 交互状态
const navigatingSimple = ref(false)
const navigatingPro = ref(false)
const industryLoading = ref(false)

// ========== 对比数据 ==========

const comparisonData: ComparisonItem[] = [
  {
    feature: '学习成本',
    simple: '5分钟',
    industry: '10分钟',
    pro: '30分钟',
    icon: '⏰',
    highlight: 'simple'
  },
  {
    feature: '操作步骤',
    simple: '3步',
    industry: '2步（选模板→配置）',
    pro: '多步骤',
    icon: '📝',
    highlight: 'industry'
  },
  {
    feature: '功能完整度',
    simple: '80%',
    industry: '95%（含行业特性）',
    pro: '100%',
    icon: '✨',
    highlight: 'industry'
  },
  {
    feature: '生成内容',
    simple: 'Web后台',
    industry: 'Web+APP+大屏+IoT',
    pro: '完全自定义',
    icon: '🎯',
    highlight: 'industry'
  },
  {
    feature: '适用场景',
    simple: '标准CRUD',
    industry: 'MES/智慧工地/垂直行业',
    pro: '复杂业务',
    icon: '🔧',
    highlight: 'neutral'
  },
  {
    feature: '硬件集成',
    simple: '需自行开发',
    industry: '开箱即用（PLC/摄像头/传感器）',
    pro: '需配置',
    icon: '🔌',
    highlight: 'industry'
  },
  {
    feature: '目标用户',
    simple: '新手/快速需求',
    industry: '小型私营企业/SaaS客户',
    pro: '专业开发者',
    icon: '👥',
    highlight: 'neutral'
  }
]

// ========== 计算属性 ==========

const greetingMessage = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const recommendedMode = computed(() => {
  // 优先推荐行业模板（战略重点）
  if (userIndustry.value === 'manufacturing' || userIndustry.value === 'construction') {
    return 'industry'
  }

  // 如果有上次使用记录
  if (lastUsedMode.value) return lastUsedMode.value

  // 如果是第一次访问，推荐极简
  if (isFirstVisit.value) return 'simple'

  // 默认推荐行业模板（战略重点）
  return 'industry'
})

// industryRecommendation 已改为ref，通过API加载

// ========== 生命周期 ==========

onMounted(async () => {
  // ✅ 企业级代码：使用Promise.allSettled，确保页面不会因API失败而卡死
  const results = await Promise.allSettled([
    loadStats(),
    loadUserProfile(),
    loadRecommendation()
  ])

  // 记录失败的API（用于调试）
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const apiNames = ['stats', 'userProfile', 'recommendation']
      console.warn(`⚠️ API ${apiNames[index]} 加载失败，但不影响页面使用`)
    }
  })

  // 首次访问显示引导
  if (isFirstVisit.value) {
    setTimeout(() => {
      showWelcomeGuide.value = true
    }, 800)
  }
})

// ========== 方法 ==========

/**
 * 加载统计数据（真实API + 优雅降级）
 */
const loadStats = async () => {
  statsLoading.value = true
  try {
    console.log('🔄 正在加载统计数据...')
    const data = await codeGenStatsApi.getMyStats()
    console.log('✅ 统计数据加载成功:', data)
    stats.value = {
      totalProjects: data.totalProjects,
      monthlyGenerations: data.monthlyGenerations,
      savedHours: data.savedHours,
      qualityScore: data.qualityScore,
      lastUpdated: data.lastUpdated
    }
  } catch (error) {
    console.warn('⚠️ 统计数据加载失败，使用默认值:', error)
    // 失败时不显示统计横幅（优雅降级）
    stats.value = {
      totalProjects: 0,
      monthlyGenerations: 0,
      savedHours: 0,
      qualityScore: 0,
      lastUpdated: new Date().toISOString()
    }
    // 不向用户显示错误，保持体验流畅
  } finally {
    statsLoading.value = false
  }
}

/**
 * 加载用户配置（真实API + localStorage降级）
 */
const loadUserProfile = async () => {
  try {
    console.log('🔄 正在加载用户配置...')
    const profile = await userProfileApi.getMyProfile()
    console.log('✅ 用户配置加载成功:', profile)
    userIndustry.value = profile.industry || ''
    isFirstVisit.value = profile.isFirstVisit
    lastUsedMode.value = profile.lastUsedMode as LastUsedMode
  } catch (error) {
    console.warn('⚠️ 用户配置加载失败，使用本地存储:', error)
    // 优雅降级到localStorage
    userIndustry.value = localStorage.getItem('userIndustry') || ''
    const visited = localStorage.getItem('codeGenVisited')
    isFirstVisit.value = !visited
    lastUsedMode.value = localStorage.getItem('lastCodeGenMode') as LastUsedMode
  }
}

/**
 * 加载行业推荐（真实API + 优雅降级）
 */
const loadRecommendation = async () => {
  try {
    console.log('🔄 正在加载行业推荐...')
    const recommendation = await userProfileApi.getRecommendation()
    console.log('✅ 行业推荐加载成功:', recommendation)
    industryRecommendation.value = recommendation
  } catch (error) {
    console.warn('⚠️ 行业推荐加载失败:', error)
    industryRecommendation.value = null
    // 不影响主要功能，静默失败
  }
}

/**
 * 跳转到极简模式（同步后端 + 确保导航）
 */
const goToSimpleMode = async () => {
  navigatingSimple.value = true
  try {
    console.log('🔄 更新用户偏好为极简模式...')
    await userProfileApi.updateMyProfile({ lastUsedMode: 'simple' })
    console.log('✅ 用户偏好更新成功')
  } catch (error) {
    console.warn('⚠️ 用户偏好更新失败，使用本地存储:', error)
    // 降级到localStorage
    localStorage.setItem('lastCodeGenMode', 'simple')
  }

  // 确保导航不受API失败影响
  try {
    console.log('🚀 导航到极简模式...')
    await router.push({ name: 'UltraSimpleStudio' })
    ElMessage.success('已进入极简模式')
  } catch (navError) {
    console.error('❌ 导航失败:', navError)
    ElMessage.error('页面跳转失败，请刷新后重试')
  } finally {
    navigatingSimple.value = false
  }
}

/**
 * 跳转到专业模式（同步后端 + 确保导航）
 */
const goToProMode = async () => {
  navigatingPro.value = true
  try {
    console.log('🔄 更新用户偏好为专业模式...')
    await userProfileApi.updateMyProfile({ lastUsedMode: 'pro' })
    console.log('✅ 用户偏好更新成功')
  } catch (error) {
    console.warn('⚠️ 用户偏好更新失败，使用本地存储:', error)
    // 降级到localStorage
    localStorage.setItem('lastCodeGenMode', 'pro')
  }

  // 确保导航不受API失败影响
  try {
    console.log('🚀 导航到专业模式...')
    await router.push('/lowcode')
    ElMessage.success('已进入专业模式')
  } catch (navError) {
    console.error('❌ 导航失败:', navError)
    ElMessage.error('页面跳转失败，请刷新后重试')
  } finally {
    navigatingPro.value = false
  }
}

/**
 * 选择行业模板（同步后端 + 确保导航）
 */
const selectIndustryTemplate = async (template: string) => {
  industryLoading.value = true
  if (template === 'coming-soon') {
    ElMessage.info('更多行业模板即将推出，敬请期待！')
    industryLoading.value = false
    return
  }

  try {
    console.log('🔄 更新用户偏好为行业模板模式...')
    await userProfileApi.updateMyProfile({ lastUsedMode: 'industry' })
    console.log('✅ 用户偏好更新成功')
  } catch (error) {
    console.warn('⚠️ 用户偏好更新失败，使用本地存储:', error)
    // 降级到localStorage
    localStorage.setItem('lastCodeGenMode', 'industry')
  }

  localStorage.setItem('selectedIndustryTemplate', template)

  const templateName = template === 'saas-mes' ? 'SaaS云MES系统' : '智慧工地管理'
  ElMessage.success({
    message: `已选择 ${templateName} 模板`,
    duration: 2000
  })

  // 确保导航不受API失败影响
  try {
    console.log('🚀 导航到行业模板配置...')
    await router.push({
      name: 'IndustryTemplateConfig',
      query: { template }
    })
  } catch (navError) {
    console.error('❌ 导航失败:', navError)
    ElMessage.error('页面跳转失败，请刷新后重试')
  } finally {
    industryLoading.value = false
  }
}

/**
 * 使用推荐的模板
 */
const useRecommendedTemplate = () => {
  showWelcomeGuide.value = false
  if (industryRecommendation.value) {
    selectIndustryTemplate(industryRecommendation.value.template)
  }
}
</script>

<style scoped lang="scss">
.codegen-entrance {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.entrance-container {
  max-width: 1400px;
  width: 100%;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.main-title {
  font-size: 48px;
  font-weight: 700;
  color: white;
  text-align: center;
  margin-bottom: 16px;
  animation: fadeInDown 0.8s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-bottom: 40px;
}

.stats-banner {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  margin-bottom: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);

  .stat-item {
    text-align: center;

    :deep(.el-statistic__head) {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
    }

    :deep(.el-statistic__content) {
      color: white;
      font-size: 32px;
      font-weight: 700;
    }
  }
}

.modes-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 60px;
}

.mode-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  &.simple-mode {
    animation-delay: 0.1s;
  }

  &.industry-mode {
    animation-delay: 0.2s;
    border: 2px solid #e6a23c;
  }

  &.pro-mode {
    animation-delay: 0.3s;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.recommend-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 14px;
  padding: 6px 12px;
}

.mode-icon {
  font-size: 64px;
  text-align: center;
  margin-bottom: 20px;
}

.mode-title {
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 16px;
  color: #333;
}

.mode-desc {
  font-size: 16px;
  color: #666;
  text-align: center;
  margin-bottom: 24px;
  line-height: 1.6;
}

.mode-features {
  list-style: none;
  padding: 0;
  margin-bottom: 32px;

  li {
    font-size: 15px;
    color: #555;
    margin-bottom: 12px;
    padding-left: 8px;
  }
}

.mode-btn {
  width: 100%;
  font-size: 16px;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
}

.template-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;

  .template-info {
    flex: 1;

    .template-name {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .template-desc {
      font-size: 13px;
      color: #909399;
    }
  }
}

.comparison {
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 30px;
  animation: fadeInUp 0.6s ease-out 0.4s;
  animation-fill-mode: both;

  h3 {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    text-align: center;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .feature-icon {
    margin-right: 8px;
    font-size: 18px;
  }
}

.industry-recommendation {
  animation: fadeInUp 0.6s ease-out 0.5s;
  animation-fill-mode: both;
}

.welcome-guide-content {
  .guide-tips {
    margin-top: 30px;

    h4 {
      margin-bottom: 16px;
      color: #333;
      font-size: 16px;
    }

    ul {
      list-style: none;
      padding-left: 0;

      li {
        padding: 10px 0;
        color: #606266;
        line-height: 1.6;

        strong {
          color: #409eff;
        }
      }
    }
  }

  .guide-recommendation {
    margin-top: 20px;
  }
}

@media (max-width: 1200px) {
  .modes-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .modes-container {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .stats-banner {
    grid-template-columns: repeat(2, 1fr);
  }

  .main-title {
    font-size: 32px;
  }

  .subtitle {
    font-size: 16px;
  }
}
</style>
