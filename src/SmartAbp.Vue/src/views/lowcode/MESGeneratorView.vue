<template>
  <div class="mes-generator-view">
    <el-page-header @back="goBack">
      <template #content>
        <span class="page-title">🏭 MES数字大屏生成器</span>
      </template>
    </el-page-header>

    <div class="generator-container">
      <!-- 功能介绍卡片 -->
      <el-card shadow="never" class="intro-card">
        <template #header>
          <div class="card-header">
            <span>📊 数字大屏生成器</span>
            <el-tag type="success">企业级</el-tag>
          </div>
        </template>
        <div class="intro-content">
          <p class="description">
            一键生成MES生产制造执行系统的数字大屏，包括生产线监控、设备状态、质量分析、能耗统计等多个维度的实时数据可视化大屏。
          </p>
          <div class="features">
            <h4>✨ 核心功能</h4>
            <ul>
              <li>🏭 生产线实时监控大屏</li>
              <li>📈 设备OEE综合效率分析</li>
              <li>🔧 设备状态监控与告警</li>
              <li>📊 生产数据统计分析</li>
              <li>🎯 质量管理可视化</li>
              <li>⚡ 能耗监控与分析</li>
            </ul>
          </div>
        </div>
      </el-card>

      <!-- 配置步骤 -->
      <el-steps :active="currentStep" align-center class="config-steps">
        <el-step title="基础配置" description="系统名称和描述" />
        <el-step title="大屏选择" description="选择需要的大屏类型" />
        <el-step title="数据配置" description="配置数据源和实时更新" />
        <el-step title="生成预览" description="确认并生成" />
      </el-steps>

      <!-- 步骤内容 -->
      <div class="step-content">
        <!-- Step 1: 基础配置 -->
        <div v-if="currentStep === 0" class="step-panel">
          <el-form :model="configForm" label-width="140px">
            <el-form-item label="系统名称">
              <el-input
                v-model="configForm.systemName"
                placeholder="如：华宇制造MES"
              />
            </el-form-item>
            <el-form-item label="系统描述">
              <el-input
                v-model="configForm.description"
                type="textarea"
                :rows="3"
                placeholder="简单描述系统用途"
              />
            </el-form-item>
            <el-form-item label="公司名称">
              <el-input
                v-model="configForm.companyName"
                placeholder="如：华宇科技有限公司"
              />
            </el-form-item>
            <el-form-item label="数据更新频率">
              <el-select v-model="configForm.updateInterval" placeholder="选择更新频率">
                <el-option label="1秒（实时）" :value="1000" />
                <el-option label="5秒（推荐）" :value="5000" />
                <el-option label="10秒" :value="10000" />
                <el-option label="30秒" :value="30000" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <!-- Step 2: 大屏选择 -->
        <div v-if="currentStep === 1" class="step-panel">
          <p class="step-desc">请选择需要生成的数字大屏类型</p>
          <el-checkbox-group v-model="selectedDashboards" class="dashboard-list">
            <el-card
              v-for="dashboard in availableDashboards"
              :key="dashboard.id"
              shadow="hover"
              :class="{ selected: selectedDashboards.includes(dashboard.id) }"
              class="dashboard-card"
            >
              <el-checkbox :value="dashboard.id" :label="dashboard.id">
                <div class="dashboard-info">
                  <h4>{{ dashboard.icon }} {{ dashboard.name }}</h4>
                  <p class="description">{{ dashboard.description }}</p>
                  <el-tag v-if="dashboard.recommended" type="success" size="small">
                    推荐
                  </el-tag>
                </div>
              </el-checkbox>
            </el-card>
          </el-checkbox-group>
        </div>

        <!-- Step 3: 数据配置 -->
        <div v-if="currentStep === 2" class="step-panel">
          <p class="step-desc">配置数据源和实时更新设置</p>
          <el-form :model="dataConfig" label-width="140px">
            <el-form-item label="数据源类型">
              <el-radio-group v-model="dataConfig.sourceType">
                <el-radio value="realtime">实时数据（WebSocket）</el-radio>
                <el-radio value="polling">轮询数据（HTTP）</el-radio>
                <el-radio value="mock">模拟数据（开发测试）</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="WebSocket地址" v-if="dataConfig.sourceType === 'realtime'">
              <el-input
                v-model="dataConfig.wsUrl"
                placeholder="ws://localhost:5000/hub/production"
              />
            </el-form-item>
            <el-form-item label="API地址" v-if="dataConfig.sourceType === 'polling'">
              <el-input
                v-model="dataConfig.apiUrl"
                placeholder="http://localhost:5000/api/production"
              />
            </el-form-item>
            <el-form-item label="启用告警">
              <el-switch v-model="dataConfig.enableAlerts" />
              <span class="tip">设备异常时发送告警通知</span>
            </el-form-item>
            <el-form-item label="启用数据导出">
              <el-switch v-model="dataConfig.enableExport" />
              <span class="tip">支持Excel/PDF格式导出</span>
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
                  <li>✅ 数字大屏组件（{{ selectedDashboards.length }}个大屏）</li>
                  <li>✅ 实时数据WebSocket连接</li>
                  <li>✅ ECharts数据可视化图表</li>
                  <li>✅ 告警监控和通知系统</li>
                  <li>✅ 数据导出功能</li>
                  <li>✅ 响应式布局适配</li>
                </ul>

                <el-alert
                  title="生成说明"
                  type="info"
                  :closable="false"
                  class="generation-info"
                >
                  <p>生成后的大屏将保存在以下目录：</p>
                  <ul>
                    <li>前端组件：<code>src/SmartAbp.Vue/src/views/dashboard/mes/</code></li>
                    <li>路由配置：自动添加到 <code>src/router/modules/</code></li>
                    <li>API接口：<code>src/api/mes/</code></li>
                  </ul>
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
import type { MESGeneratorConfigDto } from '@/types/code-generation.types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const codeGenStore = useCodeGenerationStore()
const currentStep = ref(0)
const generating = ref(false)

// 配置表单
const configForm = reactive({
  systemName: 'SmartAbp MES',
  description: '智能制造执行系统',
  companyName: '',
  updateInterval: 5000
})

// 数据配置
const dataConfig = reactive({
  sourceType: 'realtime',
  wsUrl: 'ws://localhost:5000/hub/production',
  apiUrl: 'http://localhost:5000/api/production',
  enableAlerts: true,
  enableExport: true
})

// 可选的大屏类型
const availableDashboards = ref([
  {
    id: 'production-line',
    name: '生产线监控',
    icon: '🏭',
    description: '实时监控生产线状态、产量、良品率等关键指标',
    recommended: true
  },
  {
    id: 'equipment-status',
    name: '设备状态监控',
    icon: '🔧',
    description: '设备运行状态、故障告警、维护记录等',
    recommended: true
  },
  {
    id: 'oee-analysis',
    name: 'OEE综合分析',
    icon: '📊',
    description: '设备综合效率（OEE）分析、稼动率、性能分析',
    recommended: false
  },
  {
    id: 'quality-dashboard',
    name: '质量管理看板',
    icon: '🎯',
    description: '质量检验、不良品统计、质量趋势分析',
    recommended: false
  },
  {
    id: 'energy-monitor',
    name: '能耗监控',
    icon: '⚡',
    description: '电力、水、气等能源消耗实时监控和统计',
    recommended: false
  },
  {
    id: 'warehouse-visual',
    name: '仓库可视化',
    icon: '📦',
    description: '库存状态、出入库记录、库位管理',
    recommended: false
  }
])

const selectedDashboards = ref<string[]>(['production-line', 'equipment-status'])

// 步骤导航
const nextStep = () => {
  if (currentStep.value === 1 && selectedDashboards.value.length === 0) {
    ElMessage.warning('请至少选择一个数字大屏类型')
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
      `确认生成 ${selectedDashboards.value.length} 个数字大屏吗？`,
      '确认生成',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    generating.value = true

    // ✅ 调用真实的后端API生成大屏代码
    const config: MESGeneratorConfigDto = {
      systemName: configForm.systemName,
      description: configForm.description,
      companyName: configForm.companyName,
      updateInterval: configForm.updateInterval,
      selectedDashboards: selectedDashboards.value,
      sourceType: dataConfig.sourceType,
      wsUrl: dataConfig.wsUrl,
      apiUrl: dataConfig.apiUrl,
      enableAlerts: dataConfig.enableAlerts,
      enableExport: dataConfig.enableExport
    }

    const result = await codeGenStore.generateMESDashboard(config)

    if (result.success) {
      ElMessage.success({
        message: `数字大屏生成成功！已保存到 ${result.outputDirectory} 目录`,
        duration: 5000
      })
      // 跳转到生成的大屏列表或预览页面
      router.push('/dashboard/production-line')
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
.mes-generator-view {
  padding: 20px;
  background: var(--el-bg-color-page);
  min-height: 100vh;

  .page-title {
    font-size: 20px;
    font-weight: 600;
  }
}

.generator-container {
  max-width: 1200px;
  margin: 20px auto;
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
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 10px;

        li {
          padding: 8px 12px;
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

.dashboard-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;

  .dashboard-card {
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

    .dashboard-info {
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
      padding: 8px 0;
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
      margin: 0;
      padding-left: 20px;

      li {
        margin: 4px 0;
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
  padding: 20px 0;
}
</style>

