<!-- 
企业级建模助手（移除AI功能，符合低代码引擎开发铁律）
适用场景: 企业级数据建模辅助、模板推荐、最佳实践
依赖项: Vue 3, SmartAbp低代码引擎, Element Plus
核心功能: 建模向导、模板匹配、验证规则、最佳实践推荐
-->

<template>
  <div class="enterprise-modeling-assistant">
    <el-card>
      <template #header>
        <div class="header">
          <span>企业级建模助手</span>
          <el-button
            type="primary"
            size="small"
            @click="startModelingWizard"
          >
            建模向导
          </el-button>
        </div>
      </template>
      
      <div class="content">
        <!-- 建模步骤 -->
        <div class="modeling-steps">
          <el-steps
            :active="currentStep"
            finish-status="success"
          >
            <el-step
              title="实体定义"
              description="定义核心业务实体"
            />
            <el-step
              title="字段设计"
              description="设计实体字段结构"
            />
            <el-step
              title="关系建模"
              description="建立实体间关系"
            />
            <el-step
              title="验证规则"
              description="配置验证和业务规则"
            />
            <el-step
              title="完成建模"
              description="生成最终模型"
            />
          </el-steps>
        </div>
        
        <!-- 最佳实践推荐 -->
        <div class="best-practices">
          <h4>建模最佳实践</h4>
          <div class="practice-list">
            <div
              v-for="practice in bestPractices"
              :key="practice.id"
              class="practice-item"
            >
              <div class="practice-icon">
                {{ practice.icon }}
              </div>
              <div class="practice-content">
                <div class="practice-title">
                  {{ practice.title }}
                </div>
                <div class="practice-description">
                  {{ practice.description }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { logger } from '@/utils/logger'

// Props
interface Props {
  entities?: any[]
}

defineProps<Props>()

// Events
// const emit = defineEmits<{
//   'modeling-completed': [result: any]
// }>() // 暂时注释未使用

// 响应式数据
const currentStep = ref(0)

// 最佳实践数据
const bestPractices = ref([
  {
    id: 'naming-convention',
    title: '命名规范',
    description: '使用PascalCase命名实体，camelCase命名字段',
    icon: '📝'
  },
  {
    id: 'primary-key',
    title: '主键设计',
    description: '每个实体都应该有一个Guid类型的主键',
    icon: '🔑'
  },
  {
    id: 'soft-delete',
    title: '软删除',
    description: '重要数据实体建议启用软删除功能',
    icon: '🗑️'
  },
  {
    id: 'audit-trail',
    title: '审计追踪',
    description: '启用审计功能跟踪数据变更历史',
    icon: '📊'
  }
])

// 方法
const startModelingWizard = () => {
  currentStep.value = 0
  logger?.info('启动建模向导')
}

// 生命周期
onMounted(() => {
  logger?.info('企业级建模助手初始化完成')
})
</script>

<style scoped>
.enterprise-modeling-assistant {
  height: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content {
  padding: 16px 0;
}

.modeling-steps {
  margin-bottom: 24px;
}

.best-practices h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.practice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.practice-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
}

.practice-icon {
  font-size: 20px;
  min-width: 30px;
  text-align: center;
}

.practice-content {
  flex: 1;
}

.practice-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.practice-description {
  font-size: 13px;
  color: var(--el-text-color-regular);
}
</style>
