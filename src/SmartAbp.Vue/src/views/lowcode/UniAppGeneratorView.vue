<template>
  <div class="uniapp-generator-view">
    <el-page-header @back="goBack">
      <template #content>
        <span class="page-title">📱 UniApp移动应用生成器</span>
      </template>
    </el-page-header>

    <div class="generator-container">
      <!-- 功能介绍卡片 -->
      <el-card shadow="never" class="intro-card">
        <template #header>
          <div class="card-header">
            <span>📱 UniApp移动应用生成器</span>
            <el-tag type="success">跨平台</el-tag>
          </div>
        </template>
        <div class="intro-content">
          <p class="description">
            基于uni-app框架，一键生成跨平台移动应用，支持iOS、Android、微信小程序、H5等多端发布。集成uView
            3.2.7 UI框架，提供美观易用的用户界面。
          </p>
          <div class="features">
            <h4>✨ 核心特性</h4>
            <ul>
              <li>📱 iOS / Android / 微信小程序 / H5 多端发布</li>
              <li>🎨 uView 3.2.7 UI组件库（80+组件）</li>
              <li>🔐 统一认证授权</li>
              <li>📡 离线数据同步</li>
              <li>📸 图片上传和压缩</li>
              <li>🌐 网络请求拦截器</li>
            </ul>
          </div>
        </div>
      </el-card>

      <!-- 配置步骤 -->
      <el-steps :active="currentStep" align-center class="config-steps">
        <el-step title="基础配置" description="应用名称和标识" />
        <el-step title="功能模块" description="选择需要的业务模块" />
        <el-step title="平台配置" description="目标平台和UI配置" />
        <el-step title="生成预览" description="确认并生成" />
      </el-steps>

      <!-- 步骤内容 -->
      <div class="step-content">
        <!-- Step 1: 基础配置 -->
        <div v-if="currentStep === 0" class="step-panel">
          <el-form :model="configForm" label-width="140px">
            <el-form-item label="应用名称">
              <el-input
                v-model="configForm.appName"
                placeholder="如：SmartMES移动端"
              />
            </el-form-item>
            <el-form-item label="应用ID">
              <el-input
                v-model="configForm.appId"
                placeholder="如：com.smartabp.mes"
              />
              <span class="tip">用于唯一标识应用，建议使用反向域名格式</span>
            </el-form-item>
            <el-form-item label="应用版本">
              <el-input v-model="configForm.version" placeholder="如：1.0.0" />
            </el-form-item>
            <el-form-item label="应用描述">
              <el-input
                v-model="configForm.description"
                type="textarea"
                :rows="3"
                placeholder="简单描述应用功能"
              />
            </el-form-item>
            <el-form-item label="API服务器地址">
              <el-input
                v-model="configForm.apiBaseUrl"
                placeholder="https://api.example.com"
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- Step 2: 功能模块 -->
        <div v-if="currentStep === 1" class="step-panel">
          <p class="step-desc">请选择需要的业务功能模块</p>
          <el-checkbox-group v-model="selectedModules" class="module-list">
            <el-card
              v-for="module in availableModules"
              :key="module.id"
              shadow="hover"
              :class="{ selected: selectedModules.includes(module.id) }"
              class="module-card"
            >
              <el-checkbox :value="module.id" :label="module.id">
                <div class="module-info">
                  <h4>{{ module.icon }} {{ module.name }}</h4>
                  <p class="description">{{ module.description }}</p>
                  <div class="tags">
                    <el-tag v-if="module.required" type="danger" size="small">
                      必需
                    </el-tag>
                    <el-tag v-if="module.recommended" type="success" size="small">
                      推荐
                    </el-tag>
                  </div>
                </div>
              </el-checkbox>
            </el-card>
          </el-checkbox-group>
        </div>

        <!-- Step 3: 平台配置 -->
        <div v-if="currentStep === 2" class="step-panel">
          <el-form :model="platformConfig" label-width="140px">
            <el-form-item label="目标平台">
              <el-checkbox-group v-model="platformConfig.targets">
                <el-checkbox value="h5">H5</el-checkbox>
                <el-checkbox value="mp-weixin">微信小程序</el-checkbox>
                <el-checkbox value="app-plus">App (iOS/Android)</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="UI主题色">
              <el-color-picker v-model="platformConfig.primaryColor" />
              <span class="tip">应用的主色调</span>
            </el-form-item>
            <el-form-item label="启用暗黑模式">
              <el-switch v-model="platformConfig.darkMode" />
            </el-form-item>
            <el-form-item label="启用离线功能">
              <el-switch v-model="platformConfig.offlineMode" />
              <span class="tip">支持离线数据存储和同步</span>
            </el-form-item>
            <el-form-item label="启用推送通知">
              <el-switch v-model="platformConfig.pushNotification" />
              <span class="tip">接收服务器推送的消息通知</span>
            </el-form-item>
          </el-form>
        </div>

        <!-- Step 4: 生成预览 -->
        <div v-if="currentStep === 3" class="step-panel">
          <el-result icon="success" title="配置完成" sub-title="即将生成以下内容">
            <template #extra>
              <div class="generation-preview">
                <h4>生成清单：</h4>
                <ul class="preview-list">
                  <li>✅ UniApp项目基础结构</li>
                  <li>✅ uView 3.2.7 UI组件库配置</li>
                  <li>✅ 业务功能模块（{{ selectedModules.length }}个模块）</li>
                  <li>✅ Pinia状态管理</li>
                  <li>✅ API接口封装</li>
                  <li>✅ 路由配置和导航</li>
                  <li>✅ 多平台适配（{{ platformConfig.targets.length }}个平台）</li>
                  <li v-if="platformConfig.offlineMode">✅ 离线数据同步</li>
                  <li v-if="platformConfig.pushNotification">✅ 推送通知</li>
                </ul>

                <el-alert
                  title="生成说明"
                  type="info"
                  :closable="false"
                  class="generation-info"
                >
                  <p>生成后的UniApp项目将保存在以下目录：</p>
                  <ul>
                    <li>项目目录：<code>output/{{ configForm.appId }}/</code></li>
                    <li>运行命令：<code>npm run dev:h5</code> 或 <code>npm run dev:mp-weixin</code></li>
                    <li>构建命令：<code>npm run build:app</code></li>
                  </ul>
                  <p style="margin-top: 12px">
                    <strong>注意：</strong>生成后请使用HBuilderX打开项目进行开发和调试。
                  </p>
                </el-alert>

                <el-button
                  type="primary"
                  size="large"
                  :loading="generating"
                  @click="startGeneration"
                >
                  {{ generating ? '生成中...' : '开始生成' }}
                </el-button>
              </div>
            </template>
          </el-result>
        </div>
      </div>

      <!-- 步骤导航 -->
      <div class="step-actions">
        <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
        <el-button v-if="currentStep < 3" type="primary" @click="nextStep">
          下一步
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCodeGenerationStore } from '@/stores/useCodeGenerationStore'
import type { UniAppGeneratorConfigDto } from '@/types/code-generation.types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const codeGenStore = useCodeGenerationStore()
const currentStep = ref(0)
const generating = ref(false)

// 配置表单
const configForm = reactive({
  appName: 'SmartMES移动端',
  appId: 'com.smartabp.mes',
  version: '1.0.0',
  description: '智能制造执行系统移动应用',
  apiBaseUrl: 'https://api.smartabp.com'
})

// 平台配置
const platformConfig = reactive({
  targets: ['h5', 'mp-weixin'],
  primaryColor: '#409EFF',
  darkMode: false,
  offlineMode: true,
  pushNotification: false
})

// 可选的功能模块
const availableModules = ref([
  {
    id: 'auth',
    name: '用户认证',
    icon: '🔐',
    description: '登录、注册、权限管理',
    required: true,
    recommended: false
  },
  {
    id: 'production-line',
    name: '生产线管理',
    icon: '🏭',
    description: '生产线列表、详情、数据录入',
    required: false,
    recommended: true
  },
  {
    id: 'equipment',
    name: '设备管理',
    icon: '🔧',
    description: '设备列表、状态监控、维护记录',
    required: false,
    recommended: true
  },
  {
    id: 'quality',
    name: '质量检验',
    icon: '🎯',
    description: '质量检验、不良品记录、整改跟踪',
    required: false,
    recommended: false
  },
  {
    id: 'warehouse',
    name: '仓库管理',
    icon: '📦',
    description: '库存查询、出入库、盘点',
    required: false,
    recommended: false
  },
  {
    id: 'work-order',
    name: '工单管理',
    icon: '📋',
    description: '工单列表、执行、完工报告',
    required: false,
    recommended: true
  },
  {
    id: 'scan',
    name: '扫码功能',
    icon: '📸',
    description: '二维码/条形码扫描',
    required: false,
    recommended: false
  },
  {
    id: 'report',
    name: '报表统计',
    icon: '📊',
    description: '生产报表、数据统计、图表展示',
    required: false,
    recommended: false
  }
])

const selectedModules = ref<string[]>(['auth', 'production-line', 'equipment', 'work-order'])

// 步骤导航
const nextStep = () => {
  if (currentStep.value === 1 && selectedModules.value.length === 0) {
    ElMessage.warning('请至少选择一个功能模块')
    return
  }
  if (currentStep.value === 2 && platformConfig.targets.length === 0) {
    ElMessage.warning('请至少选择一个目标平台')
    return
  }
  currentStep.value++
}

const prevStep = () => {
  currentStep.value--
}

const goBack = () => {
  router.back()
}

// 开始生成
const startGeneration = async () => {
  try {
    await ElMessageBox.confirm(
      `确认生成UniApp项目吗？将包含 ${selectedModules.value.length} 个功能模块，支持 ${platformConfig.targets.length} 个平台。`,
      '确认生成',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    generating.value = true

    // ✅ 调用真实的后端API生成UniApp项目
    const config: UniAppGeneratorConfigDto = {
      appName: configForm.appName,
      appId: configForm.appId,
      version: configForm.version,
      description: configForm.description,
      apiBaseUrl: configForm.apiBaseUrl,
      selectedModules: selectedModules.value,
      targets: platformConfig.targets,
      primaryColor: platformConfig.primaryColor,
      darkMode: platformConfig.darkMode,
      offlineMode: platformConfig.offlineMode,
      pushNotification: platformConfig.pushNotification
    }

    const result = await codeGenStore.generateUniApp(config)

    if (result.success) {
      ElMessage.success({
        message: `UniApp项目生成成功！已保存到 ${result.outputDirectory} 目录`,
        duration: 5000
      })
      // 提示下一步操作
      ElMessageBox.alert(
        '请使用HBuilderX打开生成的项目进行开发和调试。运行命令：npm run dev:h5',
        '生成成功',
        {
          confirmButtonText: '知道了',
          type: 'success'
        }
      )
    } else {
      ElMessage.error('生成失败：' + result.errorMessage)
    }
  } catch (error: unknown) {
    if (error !== 'cancel') {
      ElMessage.error('生成失败：' + (error as Error).message)
    }
  } finally {
    generating.value = false
  }
}
</script>

<style scoped lang="scss">
.uniapp-generator-view {
  padding: var(--spacing-5);
  background: var(--el-bg-color-page);
  min-height: 100vh;

  .page-title {
    font-size: 20px;
    font-weight: 600;
  }
}

.generator-container {
  max-width: 1200px;
  margin: var(--spacing-5) auto;
}

.intro-card {
  margin-bottom: 30px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .intro-content {
    .description {
      font-size: 15px;
      line-height: 1.6;
      color: var(--el-text-color-regular);
      margin-bottom: 20px;
    }

    .features {
      h4 {
        margin-bottom: 10px;
        color: var(--el-text-color-primary);
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 10px;

        li {
          padding: var(--spacing-2) 12px;
          background: var(--el-fill-color-light);
          border-radius: 4px;
          font-size: 14px;
        }
      }
    }
  }
}

.config-steps {
  margin-bottom: 40px;
}

.step-content {
  min-height: 400px;
  margin-bottom: 30px;

  .step-panel {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  .step-desc {
    font-size: 15px;
    color: var(--el-text-color-regular);
    margin-bottom: 20px;
  }

  .tip {
    margin-left: 10px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

.module-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;

  .module-card {
    cursor: pointer;
    transition: all 0.3s;

    &.selected {
      border-color: var(--el-color-primary);
      box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }

    .module-info {
      h4 {
        margin: 0 0 8px;
        font-size: 16px;
        color: var(--el-text-color-primary);
      }

      .description {
        margin: 0 0 8px;
        font-size: 13px;
        color: var(--el-text-color-regular);
        line-height: 1.5;
      }

      .tags {
        display: flex;
        gap: 8px;
      }
    }
  }
}

.generation-preview {
  h4 {
    margin-bottom: 16px;
    color: var(--el-text-color-primary);
  }

  .preview-list {
    list-style: none;
    padding: 0;
    margin: 0 0 24px;

    li {
      padding: var(--spacing-2) 0;
      font-size: 15px;
      color: var(--el-text-color-regular);
    }
  }

  .generation-info {
    margin-bottom: 24px;

    p {
      margin: 0 0 8px;
    }

    ul {
      margin: var(--spacing-2) 0;
      padding-left: 20px;

      li {
        margin: var(--spacing-1) 0;
        font-size: 13px;

        code {
          padding: 2px 6px;
          background: var(--el-fill-color);
          border-radius: 3px;
          font-family: 'Consolas', 'Monaco', monospace;
        }
      }
    }
  }
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: var(--spacing-5) 0;
}
</style>

