<template>
  <div class="lowcode-studio-content">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-header">
        <el-icon
          class="welcome-icon"
          :size="48"
        >
          <MagicStick />
        </el-icon>
        <h1>SmartAbp 低代码工作台</h1>
        <p class="welcome-desc">
          企业级低代码开发平台，助您快速构建高质量应用
        </p>
      </div>
    </div>

    <!-- 快速导航卡片 -->
    <div class="quick-nav-section">
      <div class="section-title">
        <h2>快速开始</h2>
        <p>选择您需要的功能模块，开始您的低代码之旅</p>
      </div>

      <div class="nav-cards">
        <div
          v-for="nav in quickNavItems"
          :key="nav.path"
          class="nav-card"
          @click="navigateTo(nav.path)"
        >
          <div class="card-icon">
            <el-icon :size="32">
              <component :is="nav.icon" />
            </el-icon>
          </div>
          <div class="card-content">
            <h3>{{ nav.title }}</h3>
            <p>{{ nav.description }}</p>
          </div>
          <div class="card-action">
            <el-button
              type="primary"
              text
            >
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
        <h2>最近项目</h2>
        <el-button
          type="primary"
          text
        >
          查看全部
        </el-button>
      </div>

      <div class="recent-projects">
        <div class="project-placeholder">
          <el-empty
            description="暂无最近项目"
            :image-size="80"
          >
            <el-button
              type="primary"
              @click="navigateTo('/lowcode/entity-modeling')"
            >
              开始第一个项目
            </el-button>
          </el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { MagicStick, DataBoard, Brush, Setting, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()

// 快速导航项目
const quickNavItems = ref([
  {
    path: '/lowcode/entity-modeling',
    title: '实体建模',
    description: '设计数据模型和实体关系',
    icon: DataBoard
  },
  {
    path: '/lowcode/design',
    title: '可视化设计',
    description: '拖拽式页面设计器',
    icon: Brush
  },
  {
    path: '/lowcode/generation',
    title: '代码生成',
    description: '一键生成完整应用代码',
    icon: MagicStick
  },
  {
    path: '/lowcode/theme',
    title: '主题定制',
    description: '自定义应用外观和样式',
    icon: Setting
  }
])

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.lowcode-studio-content {
  padding: var(--spacing-6);
  background: var(--el-bg-color-page);
  min-height: calc(100vh - 120px);
}

.welcome-section {
  text-align: center;
  padding: 40px 0 60px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-8) 100%);
  border-radius: 12px;
  margin-bottom: 32px;
}

.welcome-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: var(--spacing-4) 0 8px;
}

.welcome-desc {
  font-size: 16px;
  color: var(--el-text-color-regular);
  margin: 0;
}

.welcome-icon {
  color: var(--el-color-primary);
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
  margin: var(--spacing-1) 0 0;
}

.nav-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.nav-card {
  display: flex;
  align-items: center;
  padding: var(--spacing-5);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
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
  margin: 0;
}

.card-action {
  margin-left: 16px;
}

.recent-section {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: var(--spacing-6);
}

.recent-projects {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-placeholder {
  width: 100%;
}

.ml-1 {
  margin-left: 4px;
}
</style>
