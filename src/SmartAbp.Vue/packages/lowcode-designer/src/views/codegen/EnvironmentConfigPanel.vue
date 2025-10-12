<template>
  <div class="environment-config-panel">
    <!-- 顶部工具栏 -->
    <div class="panel-header">
      <div class="header-left">
        <el-icon class="title-icon">
          <Setting />
        </el-icon>
        <h2 class="panel-title">
          多环境配置管理
        </h2>
        <el-tag
          type="success"
          size="small"
        >
          Day 11: 生产就绪配置
        </el-tag>
      </div>
      
      <div class="header-right">
        <el-button-group>
          <el-button
            :icon="Refresh"
            @click="handleRefresh"
          >
            刷新
          </el-button>
          <el-button
            :icon="Connection"
            @click="handleCompare"
          >
            环境对比
          </el-button>
          <el-button
            type="primary"
            :icon="Check"
            :loading="saving"
            @click="handleSave"
          >
            保存配置
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 环境标签页 -->
    <el-tabs
      v-model="activeEnv"
      type="border-card"
      class="env-tabs"
    >
      <el-tab-pane
        v-for="env in environments"
        :key="env"
        :label="getEnvLabel(env)"
        :name="env"
      >
        <el-scrollbar height="calc(100vh - 250px)">
          <el-form
            :model="configs[env]"
            label-width="140px"
            size="default"
            class="env-form"
          >
            <!-- 基本配置 -->
            <el-divider content-position="left">
              <el-icon><InfoFilled /></el-icon>
              基本配置
            </el-divider>
            
            <el-form-item label="环境名称">
              <el-input
                :value="env"
                disabled
              />
            </el-form-item>
            
            <el-form-item label="默认副本数">
              <el-input-number
                v-model="configs[env].defaultReplicas"
                :min="1"
                :max="100"
              />
              <span class="form-tip">生产环境建议3个以上</span>
            </el-form-item>

            <!-- 资源配置 -->
            <el-divider content-position="left">
              <el-icon><CpuFilled /></el-icon>
              资源限制
            </el-divider>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="CPU请求">
                  <el-input
                    v-model="configs[env].resources.cpuRequest"
                    placeholder="100m"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="CPU限制">
                  <el-input
                    v-model="configs[env].resources.cpuLimit"
                    placeholder="500m"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="内存请求">
                  <el-input
                    v-model="configs[env].resources.memoryRequest"
                    placeholder="128Mi"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="内存限制">
                  <el-input
                    v-model="configs[env].resources.memoryLimit"
                    placeholder="512Mi"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 特性开关 -->
            <el-divider content-position="left">
              <el-icon><Switch /></el-icon>
              特性开关
            </el-divider>
            
            <el-form-item label="遥测追踪">
              <el-switch v-model="configs[env].features.enableTelemetry" />
            </el-form-item>
            
            <el-form-item label="指标采集">
              <el-switch v-model="configs[env].features.enableMetrics" />
            </el-form-item>
            
            <el-form-item label="链路追踪">
              <el-switch v-model="configs[env].features.enableTracing" />
            </el-form-item>
            
            <el-form-item label="健康检查">
              <el-switch v-model="configs[env].features.enableHealthChecks" />
            </el-form-item>
            
            <el-form-item label="Swagger文档">
              <el-switch v-model="configs[env].features.enableSwagger" />
              <span class="form-tip">生产环境建议关闭</span>
            </el-form-item>

            <!-- 部署策略 -->
            <el-divider content-position="left">
              <el-icon><TrendCharts /></el-icon>
              部署策略
            </el-divider>
            
            <el-form-item label="策略类型">
              <el-select v-model="configs[env].deploymentStrategy.type">
                <el-option
                  label="滚动更新"
                  value="RollingUpdate"
                />
                <el-option
                  label="蓝绿部署"
                  value="BlueGreen"
                />
                <el-option
                  label="金丝雀发布"
                  value="Canary"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="最大增量">
              <el-input
                v-model="configs[env].deploymentStrategy.maxSurge"
                placeholder="25%"
              />
              <span class="form-tip">可以是数字或百分比</span>
            </el-form-item>
            
            <el-form-item label="最大不可用">
              <el-input
                v-model="configs[env].deploymentStrategy.maxUnavailable"
                placeholder="0"
              />
            </el-form-item>

            <!-- 自动扩缩容 -->
            <el-divider content-position="left">
              <el-icon><Expand /></el-icon>
              自动扩缩容
            </el-divider>
            
            <el-form-item label="启用自动扩缩容">
              <el-switch v-model="configs[env].enableAutoScaling" />
            </el-form-item>
            
            <template v-if="configs[env].enableAutoScaling">
              <el-form-item label="最小副本数">
                <el-input-number
                  v-model="configs[env].autoScaling.minReplicas"
                  :min="1"
                  :max="configs[env].autoScaling.maxReplicas"
                />
              </el-form-item>
              
              <el-form-item label="最大副本数">
                <el-input-number
                  v-model="configs[env].autoScaling.maxReplicas"
                  :min="configs[env].autoScaling.minReplicas"
                  :max="100"
                />
              </el-form-item>
              
              <el-form-item label="CPU目标利用率">
                <el-slider
                  v-model="configs[env].autoScaling.targetCPUUtilization"
                  :min="10"
                  :max="100"
                  show-input
                />
              </el-form-item>
              
              <el-form-item label="内存目标利用率">
                <el-slider
                  v-model="configs[env].autoScaling.targetMemoryUtilization"
                  :min="10"
                  :max="100"
                  show-input
                />
              </el-form-item>
            </template>

            <!-- 环境变量 -->
            <el-divider content-position="left">
              <el-icon><Key /></el-icon>
              环境变量
            </el-divider>
            
            <el-form-item>
              <el-button
                :icon="Plus"
                @click="addEnvVar(env)"
              >
                添加环境变量
              </el-button>
            </el-form-item>
            
            <el-form-item
              v-for="(value, key) in configs[env].environmentVariables"
              :key="key"
              :label="key"
            >
              <el-input v-model="configs[env].environmentVariables[key]">
                <template #append>
                  <el-button
                    :icon="Delete"
                    @click="deleteEnvVar(env, key)"
                  />
                </template>
              </el-input>
            </el-form-item>
          </el-form>
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>

    <!-- 环境对比对话框 -->
    <el-dialog
      v-model="comparisonVisible"
      title="环境配置对比"
      width="80%"
      :close-on-click-modal="false"
    >
      <environment-comparison-view
        v-if="comparisonVisible"
        :env1="compareEnv1"
        :env2="compareEnv2"
        @close="comparisonVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting,
  Refresh,
  Connection,
  Check,
  InfoFilled,
  Cpu,
  Switch,
  TrendCharts,
  Expand,
  Key,
  Plus,
  Delete
} from '@element-plus/icons-vue'
import { useEnvironmentConfig, type EnvironmentConfig } from '@smartabp/lowcode-api'
import EnvironmentComparisonView from './EnvironmentComparisonView.vue'

// Composables
const {
  loading,
  error,
  getEnvironments,
  getEnvironmentConfig,
  saveEnvironmentConfig
} = useEnvironmentConfig()

// State
const activeEnv = ref('Development')
const environments = ref<string[]>([])
const configs = reactive<Record<string, EnvironmentConfig>>({})
const saving = ref(false)
const comparisonVisible = ref(false)
const compareEnv1 = ref('Development')
const compareEnv2 = ref('Production')

// Methods
const initializeConfigs = () => {
  environments.value.forEach(env => {
    if (!configs[env]) {
      configs[env] = {
        environment: env,
        defaultReplicas: 1,
        resources: {
          cpuRequest: '100m',
          cpuLimit: '500m',
          memoryRequest: '128Mi',
          memoryLimit: '512Mi',
          storageRequest: '1Gi',
          storageLimit: '10Gi'
        },
        environmentVariables: {},
        features: {
          enableTelemetry: true,
          enableMetrics: true,
          enableTracing: true,
          enableLogging: true,
          enableHealthChecks: true,
          enableSwagger: false,
          customFlags: {}
        },
        deploymentStrategy: {
          type: 'RollingUpdate',
          maxSurge: '25%',
          maxUnavailable: '0',
          minReadySeconds: 5,
          progressDeadlineSeconds: 600
        },
        enableAutoScaling: false,
        autoScaling: {
          minReplicas: 1,
          maxReplicas: 10,
          targetCPUUtilization: 70,
          targetMemoryUtilization: 80,
          customMetrics: []
        }
      }
    }
  })
}

const loadEnvironments = async () => {
  try {
    environments.value = await getEnvironments()
    initializeConfigs()
    
    // 加载每个环境的配置
    for (const env of environments.value) {
      const config = await getEnvironmentConfig(env)
      configs[env] = config
    }
    
    ElMessage.success('环境配置加载成功')
  } catch (err) {
    ElMessage.error('加载环境配置失败')
    console.error(err)
  }
}

const handleRefresh = () => {
  loadEnvironments()
}

const handleSave = async () => {
  try {
    saving.value = true
    
    await saveEnvironmentConfig(activeEnv.value, configs[activeEnv.value])
    
    ElMessage.success(`${activeEnv.value} 环境配置保存成功`)
  } catch (err) {
    ElMessage.error('保存配置失败')
    console.error(err)
  } finally {
    saving.value = false
  }
}

const handleCompare = () => {
  comparisonVisible.value = true
}

const getEnvLabel = (env: string) => {
  const labels: Record<string, string> = {
    Development: '🔧 开发环境',
    Staging: '🧪 预发布环境',
    Production: '🚀 生产环境'
  }
  return labels[env] || env
}

const addEnvVar = async (env: string) => {
  const { value } = await ElMessageBox.prompt('请输入环境变量名称', '添加环境变量', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
  
  if (value) {
    configs[env].environmentVariables[value] = ''
  }
}

const deleteEnvVar = (env: string, key: string) => {
  delete configs[env].environmentVariables[key]
}

// Lifecycle
onMounted(() => {
  loadEnvironments()
})
</script>

<style scoped lang="scss">
.environment-config-panel {
  padding: 20px;
  height: 100%;
  background: var(--el-bg-color);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.panel-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.env-tabs {
  :deep(.el-tabs__content) {
    padding: 0;
  }
}

.env-form {
  padding: 20px;
  max-width: 1000px;
}

.form-tip {
  margin-left: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

:deep(.el-divider__text) {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}
</style>

