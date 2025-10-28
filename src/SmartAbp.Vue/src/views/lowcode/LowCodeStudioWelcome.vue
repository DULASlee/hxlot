<template>
  <div class="lowcode-studio-welcome">
    <div class="welcome-container">
      <!-- 欢迎头部 -->
      <div class="welcome-header">
      <div class="welcome-logo">
        <el-icon size="48" color="#409EFF">
          <Platform />
        </el-icon>
      </div>
        <h1>SmartAbp 企业级低代码开发平台</h1>
        <p class="welcome-subtitle">
          选择入口，开始您的低代码之旅
        </p>
      </div>

      <!-- 三个入口卡片 -->
      <div class="entry-section">
        <el-row :gutter="24">
          <el-col :xs="24" :sm="24" :md="8">
            <EntryCard
              title="Layer1 快速起步"
              description="3分钟上手，可视化拖拽，快速生成单表CRUD"
              icon="MagicStick"
              color="#67C23A"
              @click="goToLayer1"
            />
          </el-col>
          <el-col :xs="24" :sm="24" :md="8">
            <EntryCard
              title="Layer2 进阶定制"
              description="深度配置，支持复杂业务逻辑，灵活扩展"
              icon="Setting"
              color="#409EFF"
              @click="goToLayer2"
            />
          </el-col>
          <el-col :xs="24" :sm="24" :md="8">
            <EntryCard
              title="Layer3 专业开发"
              description="企业级架构，完整DDD支持，专业开发"
              icon="Tools"
              color="#E6A23C"
              @click="goToLayer3"
            />
          </el-col>
        </el-row>
      </div>

      <!-- 主要内容区域 -->
      <div class="main-content">
        <el-row :gutter="24">
          <!-- 最近访问的项目 -->
          <el-col :xs="24" :sm="24" :md="16">
            <RecentProjects
              v-loading="loading"
              :projects="recentModules"
            />
          </el-col>

          <!-- 使用统计 -->
          <el-col :xs="24" :sm="24" :md="8">
            <UsageStatistics
              v-loading="loading"
              :stats="usageStats"
            />
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto } from '@/api/generated'
import type { UserChoiceStatsDto } from '@/api/lowcode/moduleApi'
import { getRecentModules, getUserChoiceStats } from '@/api/lowcode/moduleApi'
import { logger } from '@/utils/logger'
import { Platform } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import EntryCard from './components/EntryCard.vue'
import RecentProjects from './components/RecentProjects.vue'
import UsageStatistics from './components/UsageStatistics.vue'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const recentModules = ref<SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto[]>([])
const usageStats = ref<UserChoiceStatsDto | null>(null)

/**
 * 进入Layer1入口
 */
const goToLayer1 = () => {
  logger?.info('进入Layer1快速起步')
  router.push('/lowcode/layer1')  // ✅ 修复：正确的路由路径
}

/**
 * 进入Layer2入口
 */
const goToLayer2 = () => {
  logger?.info('进入Layer2进阶定制')
  router.push('/lowcode/layer2')  // ✅ 修复：正确的路由路径
}

/**
 * 进入Layer3入口
 */
const goToLayer3 = () => {
  logger?.info('进入Layer3专业开发')
  router.push('/lowcode/layer3')  // ✅ 修复：正确的路由路径（专业模式）
}

/**
 * 加载页面数据（并发请求优化）
 */
const loadPageData = async () => {
  loading.value = true

  try {
    // 并发加载两个API（性能优化）
    const [modules, stats] = await Promise.all([
      getRecentModules(5),
      getUserChoiceStats()
    ])

    recentModules.value = modules
    usageStats.value = stats

    logger?.info('Portal页面数据加载成功', {
      moduleCount: modules.length,
      stats
    })
  } catch (error) {
    console.error('加载Portal数据失败:', error)
    ElMessage.error('加载数据失败，请刷新页面重试')
  } finally {
    loading.value = false
  }
}

// 生命周期：页面加载时获取数据
onMounted(() => {
  logger?.info('LowCodeStudioWelcome Portal页面加载')
  loadPageData()
})
</script>

<style scoped lang="scss">
.lowcode-studio-welcome {
  height: 100%;
  overflow-y: auto;
  /* ✅ 企业级专业风格：简洁的浅灰背景 */
  background: #f5f7fa;
  padding: 40px 20px;

  .welcome-container {
    max-width: 1400px;
    margin: 0 auto;
  }

  .welcome-header {
    text-align: center;
    margin-bottom: 48px;
    /* ✅ 企业级：深色文字，专业简洁 */
    color: #303133;
    background: white;
    padding: 60px 40px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .welcome-logo {
      margin-bottom: 20px;
    }

    h1 {
      margin: 0 0 16px 0;
      font-size: 36px;
      font-weight: 700;
    }

    .welcome-subtitle {
      margin: 0;
      font-size: 16px;
      /* ✅ 企业级：灰色副标题 */
      color: #909399;
      font-weight: 400;
    }
  }

  .entry-section {
    margin-bottom: 40px;

    :deep(.el-col) {
      margin-bottom: 24px;

      @media (max-width: 768px) {
        margin-bottom: 16px;
      }
    }
  }

  .main-content {
    :deep(.el-col) {
      margin-bottom: 24px;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .lowcode-studio-welcome {
    padding: var(--spacing-5) 16px;

    .welcome-header h1 {
      font-size: 28px;
    }

    .welcome-subtitle {
      font-size: 16px;
    }
  }
}
</style>
