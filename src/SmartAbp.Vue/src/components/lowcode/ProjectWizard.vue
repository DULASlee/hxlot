<template>
  <div class="enterprise-project-wizard">
    <el-card
      shadow="never"
      class="wizard-card"
    >
      <template #header>
        <div class="wizard-header">
          <div class="header-left">
            <i class="el-icon-magic-stick wizard-icon" />
            <span class="wizard-title">智能项目向导</span>
          </div>
          <div class="header-right">
            <el-tag
              type="success"
              size="small"
            >
              企业级
            </el-tag>
          </div>
        </div>
      </template>

      <div class="wizard-content">
        <el-steps
          :active="currentStep"
          align-center
          class="wizard-steps"
        >
          <el-step
            title="项目类型"
            description="选择项目模板"
          />
          <el-step
            title="基础配置"
            description="配置项目信息"
          />
          <el-step
            title="功能模块"
            description="选择功能模块"
          />
          <el-step
            title="完成创建"
            description="生成项目结构"
          />
        </el-steps>

        <div class="step-content">
          <!-- 步骤1：项目类型选择 -->
          <div
            v-if="currentStep === 0"
            class="step-panel"
          >
            <h3 class="step-title">
              选择项目类型
            </h3>
            <div class="project-templates">
              <div
                v-for="template in projectTemplates"
                :key="template.id"
                class="template-card"
                :class="{ active: selectedTemplate?.id === template.id }"
                @click="selectTemplate(template)"
              >
                <div class="template-icon">
                  <i :class="template.icon" />
                </div>
                <div class="template-info">
                  <h4>{{ template.name }}</h4>
                  <p>{{ template.description }}</p>
                </div>
                <div class="template-features">
                  <el-tag
                    v-for="feature in template.features"
                    :key="feature"
                    size="small"
                    type="info"
                  >
                    {{ feature }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤2：基础配置 -->
          <div
            v-if="currentStep === 1"
            class="step-panel"
          >
            <h3 class="step-title">
              项目基础配置
            </h3>
            <el-form
              :model="projectConfig"
              label-width="120px"
              class="config-form"
            >
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item
                    label="项目名称"
                    required
                  >
                    <el-input
                      v-model="projectConfig.name"
                      placeholder="输入项目名称"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item
                    label="项目标识"
                    required
                  >
                    <el-input
                      v-model="projectConfig.key"
                      placeholder="project-key"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="命名空间">
                    <el-input
                      v-model="projectConfig.namespace"
                      placeholder="YourCompany.ProjectName"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="版本号">
                    <el-input
                      v-model="projectConfig.version"
                      placeholder="1.0.0"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="项目描述">
                <el-input
                  v-model="projectConfig.description"
                  type="textarea"
                  :rows="3"
                  placeholder="描述项目的用途和特点"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤3：功能模块 -->
          <div
            v-if="currentStep === 2"
            class="step-panel"
          >
            <h3 class="step-title">
              选择功能模块
            </h3>
            <div class="modules-grid">
              <div
                v-for="module in availableModules"
                :key="module.id"
                class="module-card"
                :class="{ selected: selectedModules.includes(module.id) }"
                @click="toggleModule(module.id)"
              >
                <div class="module-header">
                  <i
                    :class="module.icon"
                    class="module-icon"
                  />
                  <el-checkbox
                    :model-value="selectedModules.includes(module.id)"
                    @change="toggleModule(module.id)"
                  />
                </div>
                <h4>{{ module.name }}</h4>
                <p>{{ module.description }}</p>
                <div class="module-complexity">
                  <el-tag
                    :type="getComplexityType(module.complexity)"
                    size="mini"
                  >
                    {{ module.complexity }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤4：完成创建 -->
          <div
            v-if="currentStep === 3"
            class="step-panel"
          >
            <h3 class="step-title">
              项目创建完成
            </h3>
            <div class="completion-panel">
              <div class="success-icon">
                <i class="el-icon-success" />
              </div>
              <h2>恭喜！项目创建成功</h2>
              <div class="project-summary">
                <el-card shadow="never">
                  <h4>{{ projectConfig.name }}</h4>
                  <p>{{ projectConfig.description }}</p>
                  <div class="summary-details">
                    <div class="detail-item">
                      <span class="label">项目类型：</span>
                      <span class="value">{{ selectedTemplate?.name }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">功能模块：</span>
                      <span class="value">{{ selectedModules.length }} 个模块</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">预计开发周期：</span>
                      <span class="value">{{ estimatedDays }} 工作日</span>
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
          </div>
        </div>

        <div class="wizard-actions">
          <el-button
            v-if="currentStep > 0"
            @click="prevStep"
          >
            上一步
          </el-button>
          <el-button
            v-if="currentStep < 3"
            type="primary"
            :disabled="!canProceed"
            @click="nextStep"
          >
            下一步
          </el-button>
          <el-button
            v-if="currentStep === 3"
            type="success"
            @click="createProject"
          >
            开始开发
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  projectConfig?: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'project-created': [project: any]
}>()

// 响应式数据
const currentStep = ref(0)
const selectedTemplate = ref<any>(null)
const selectedModules = ref<string[]>([])

const projectConfig = ref({
  name: '',
  key: '',
  namespace: '',
  version: '1.0.0',
  description: ''
})

// 项目模板
const projectTemplates = ref([
  {
    id: 'admin-system',
    name: '企业管理系统',
    description: '包含用户管理、权限控制、系统监控等核心功能',
    icon: 'el-icon-office-building',
    features: ['用户管理', '权限控制', '日志审计', '系统监控']
  },
  {
    id: 'business-app',
    name: '业务应用系统',
    description: '面向业务场景的快速开发模板',
    icon: 'el-icon-suitcase',
    features: ['业务流程', '数据管理', '报表分析', '工作流']
  },
  {
    id: 'mobile-app',
    name: '移动应用',
    description: '移动端优先的响应式应用模板',
    icon: 'el-icon-mobile-phone',
    features: ['响应式', '移动优化', 'PWA支持', '离线缓存']
  }
])

// 功能模块
const availableModules = ref([
  {
    id: 'user-management',
    name: '用户管理',
    description: '用户注册、登录、权限管理',
    icon: 'el-icon-user',
    complexity: '简单'
  },
  {
    id: 'content-management',
    name: '内容管理',
    description: '文章、媒体资源管理系统',
    icon: 'el-icon-document',
    complexity: '中等'
  },
  {
    id: 'workflow-engine',
    name: '工作流引擎',
    description: '可视化流程设计与执行',
    icon: 'el-icon-connection',
    complexity: '复杂'
  },
  {
    id: 'reporting-system',
    name: '报表系统',
    description: '数据分析与可视化报表',
    icon: 'el-icon-data-analysis',
    complexity: '中等'
  }
])

// 计算属性
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0: return selectedTemplate.value !== null
    case 1: return projectConfig.value.name && projectConfig.value.key
    case 2: return selectedModules.value.length > 0
    default: return true
  }
})

const estimatedDays = computed(() => {
  const baseTime = selectedTemplate.value ? 5 : 0
  const moduleTime = selectedModules.value.length * 3
  return baseTime + moduleTime
})

// 方法
const selectTemplate = (template: any) => {
  selectedTemplate.value = template
}

const toggleModule = (moduleId: string) => {
  const index = selectedModules.value.indexOf(moduleId)
  if (index > -1) {
    selectedModules.value.splice(index, 1)
  } else {
    selectedModules.value.push(moduleId)
  }
}

const getComplexityType = (complexity: string) => {
  switch (complexity) {
    case '简单': return 'success'
    case '中等': return 'warning'
    case '复杂': return 'danger'
    default: return 'info'
  }
}

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const createProject = () => {
  const project = {
    ...projectConfig.value,
    template: selectedTemplate.value,
    modules: selectedModules.value,
    estimatedDays: estimatedDays.value
  }
  emit('project-created', project)
}
</script>

<style scoped>
.enterprise-project-wizard {
  height: 100%;
  padding: 20px;
}

.wizard-card {
  height: 100%;
  border: none;
}

.wizard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wizard-icon {
  font-size: 20px;
  color: var(--el-color-primary);
}

.wizard-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.wizard-content {
  padding: 20px 0;
}

.wizard-steps {
  margin-bottom: 40px;
}

.step-content {
  min-height: 400px;
}

.step-panel {
  max-width: 900px;
  margin: 0 auto;
}

.step-title {
  font-size: 20px;
  margin-bottom: 24px;
  color: var(--el-text-color-primary);
  text-align: center;
}

/* 项目模板样式 */
.project-templates {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.template-card {
  padding: 24px;
  border: 2px solid var(--el-border-color-light);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--el-bg-color);
}

.template-card:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.template-card.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.template-icon {
  text-align: center;
  margin-bottom: 16px;
}

.template-icon i {
  font-size: 48px;
  color: var(--el-color-primary);
}

.template-info h4 {
  font-size: 18px;
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
}

.template-info p {
  color: var(--el-text-color-regular);
  margin-bottom: 16px;
}

.template-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 配置表单样式 */
.config-form {
  margin-top: 20px;
}

/* 模块选择样式 */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.module-card {
  padding: 20px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.module-card:hover {
  border-color: var(--el-color-primary-light-5);
}

.module-card.selected {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.module-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.module-card h4 {
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
}

.module-card p {
  color: var(--el-text-color-regular);
  font-size: 14px;
  margin-bottom: 12px;
}

.module-complexity {
  text-align: right;
}

/* 完成页面样式 */
.completion-panel {
  text-align: center;
  padding: 40px 20px;
}

.success-icon i {
  font-size: 80px;
  color: var(--el-color-success);
  margin-bottom: 20px;
}

.completion-panel h2 {
  color: var(--el-text-color-primary);
  margin-bottom: 30px;
}

.project-summary {
  max-width: 500px;
  margin: 0 auto;
}

.summary-details {
  margin-top: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.detail-item .label {
  color: var(--el-text-color-regular);
}

.detail-item .value {
  color: var(--el-text-color-primary);
  font-weight: 500;
}

/* 操作按钮 */
.wizard-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
