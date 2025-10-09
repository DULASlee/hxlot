<template>
  <div class="chaos-experiment-designer">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>混沌工程实验设计器</span>
          <el-button
            type="primary"
            @click="handleGenerate"
          >
            生成配置
          </el-button>
        </div>
      </template>

      <el-form
        :model="experimentConfig"
        label-width="120px"
      >
        <!-- 基本信息 -->
        <el-divider content-position="left">
          <el-icon><DocumentAdd /></el-icon>
          实验基本信息
        </el-divider>

        <el-form-item label="实验名称">
          <el-input
            v-model="experimentConfig.experimentName"
            placeholder="例如: latency-injection-test"
            clearable
          />
        </el-form-item>

        <el-form-item label="目标服务">
          <el-input
            v-model="experimentConfig.serviceName"
            placeholder="请输入服务名称"
            clearable
          />
        </el-form-item>

        <el-form-item label="实验描述">
          <el-input
            v-model="experimentConfig.description"
            type="textarea"
            :rows="2"
            placeholder="描述实验目的和预期效果"
          />
        </el-form-item>

        <!-- 故障注入配置 -->
        <el-divider content-position="left">
          <el-icon><Warning /></el-icon>
          故障注入配置
        </el-divider>

        <fault-injection-config v-model="experimentConfig.faultInjection" />

        <!-- 实验调度 -->
        <el-divider content-position="left">
          <el-icon><Clock /></el-icon>
          实验调度
        </el-divider>

        <el-form-item label="调度类型">
          <el-radio-group v-model="experimentConfig.schedule.scheduleType">
            <el-radio label="Manual">
              手动执行
            </el-radio>
            <el-radio label="Scheduled">
              定时执行
            </el-radio>
            <el-radio label="Continuous">
              持续执行
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="持续时间(分钟)">
          <el-input-number
            v-model="experimentConfig.schedule.durationMinutes"
            :min="1"
            :max="1440"
            :step="1"
          />
          <span class="help-text">实验运行的持续时间</span>
        </el-form-item>

        <template v-if="experimentConfig.schedule.scheduleType === 'Scheduled'">
          <el-form-item label="开始时间">
            <el-date-picker
              v-model="experimentConfig.schedule.startTime"
              type="datetime"
              placeholder="选择开始时间"
            />
          </el-form-item>
        </template>

        <!-- 监控指标 -->
        <el-divider content-position="left">
          <el-icon><DataLine /></el-icon>
          监控指标与阈值
        </el-divider>

        <el-form-item label="监控指标">
          <el-checkbox-group v-model="experimentConfig.metrics.monitoredMetrics">
            <el-checkbox label="ResponseTime">
              响应时间
            </el-checkbox>
            <el-checkbox label="ErrorRate">
              错误率
            </el-checkbox>
            <el-checkbox label="Throughput">
              吞吐量
            </el-checkbox>
            <el-checkbox label="CPUUsage">
              CPU使用率
            </el-checkbox>
            <el-checkbox label="MemoryUsage">
              内存使用率
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="自动回滚">
          <el-switch v-model="experimentConfig.metrics.enableRollback" />
          <span class="help-text">超过阈值时自动停止实验</span>
        </el-form-item>

        <!-- 实验状态预览 -->
        <el-divider content-position="left">
          实验流程预览
        </el-divider>

        <div class="experiment-flow">
          <div class="flow-step">
            <div class="step-icon success">
              1
            </div>
            <div class="step-content">
              <div class="step-title">
                准备阶段
              </div>
              <div class="step-desc">
                验证配置、创建备份
              </div>
            </div>
          </div>
          <div class="flow-arrow">
            →
          </div>
          <div class="flow-step">
            <div class="step-icon warning">
              2
            </div>
            <div class="step-content">
              <div class="step-title">
                注入故障
              </div>
              <div class="step-desc">
                {{ experimentConfig.faultInjection.delay.enabled ? '延迟故障' : '' }}
                {{ experimentConfig.faultInjection.abort.enabled ? '中止故障' : '' }}
              </div>
            </div>
          </div>
          <div class="flow-arrow">
            →
          </div>
          <div class="flow-step">
            <div class="step-icon info">
              3
            </div>
            <div class="step-content">
              <div class="step-title">
                监控观察
              </div>
              <div class="step-desc">
                持续{{ experimentConfig.schedule.durationMinutes }}分钟
              </div>
            </div>
          </div>
          <div class="flow-arrow">
            →
          </div>
          <div class="flow-step">
            <div class="step-icon primary">
              4
            </div>
            <div class="step-content">
              <div class="step-title">
                分析报告
              </div>
              <div class="step-desc">
                生成实验结果
              </div>
            </div>
          </div>
        </div>
      </el-form>

      <!-- 生成的配置预览 -->
      <el-divider content-position="left">
        配置预览
      </el-divider>
      <el-tabs
        v-model="activeTab"
        type="card"
      >
        <el-tab-pane
          label="Istio故障注入"
          name="istio"
        >
          <el-input
            v-model="generatedConfig.istio"
            type="textarea"
            :rows="12"
            readonly
            class="code-preview"
          />
        </el-tab-pane>
        <el-tab-pane
          label="Kubernetes Chaos"
          name="k8s"
        >
          <el-input
            v-model="generatedConfig.k8s"
            type="textarea"
            :rows="12"
            readonly
            class="code-preview"
          />
        </el-tab-pane>
        <el-tab-pane
          label="Prometheus告警"
          name="prometheus"
        >
          <el-input
            v-model="generatedConfig.prometheus"
            type="textarea"
            :rows="12"
            readonly
            class="code-preview"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentAdd, Warning, Clock, DataLine } from '@element-plus/icons-vue'
import FaultInjectionConfig from './FaultInjectionConfig.vue'

// 实验配置数据模型
interface ExperimentConfig {
  experimentName: string
  serviceName: string
  description: string
  faultInjection: {
    delay: {
      enabled: boolean
      fixedDelayMs: number
      percentage: number
    }
    abort: {
      enabled: boolean
      httpStatusCode: number
      percentage: number
    }
    targetEndpoint: string
    injectionPercentage: number
  }
  schedule: {
    scheduleType: string
    startTime: Date | null
    endTime: Date | null
    durationMinutes: number
    cronExpression: string
  }
  metrics: {
    monitoredMetrics: string[]
    enableRollback: boolean
  }
}

// 实验配置
const experimentConfig = reactive<ExperimentConfig>({
  experimentName: '',
  serviceName: '',
  description: '',
  faultInjection: {
    delay: {
      enabled: true,
      fixedDelayMs: 5000,
      percentage: 100
    },
    abort: {
      enabled: false,
      httpStatusCode: 500,
      percentage: 100
    },
    targetEndpoint: '',
    injectionPercentage: 10
  },
  schedule: {
    scheduleType: 'Manual',
    startTime: null,
    endTime: null,
    durationMinutes: 10,
    cronExpression: ''
  },
  metrics: {
    monitoredMetrics: ['ResponseTime', 'ErrorRate'],
    enableRollback: true
  }
})

// 生成的配置
const generatedConfig = reactive({
  istio: '# Istio故障注入配置将在点击"生成配置"后显示',
  k8s: '# Kubernetes Chaos配置将在点击"生成配置"后显示',
  prometheus: '# Prometheus告警配置将在点击"生成配置"后显示'
})

// 当前激活的Tab
const activeTab = ref('istio')

// 生成配置
const handleGenerate = async () => {
  if (!experimentConfig.experimentName) {
    ElMessage.warning('请输入实验名称')
    return
  }

  if (!experimentConfig.serviceName) {
    ElMessage.warning('请输入目标服务名称')
    return
  }

  try {
    // TODO: 调用后端API生成配置
    // const response = await generateChaosConfig(experimentConfig)

    // 模拟生成的配置
    generatedConfig.istio = `# Istio故障注入 - ${experimentConfig.experimentName}\n\n` +
      `apiVersion: networking.istio.io/v1beta1\n` +
      `kind: VirtualService\n` +
      `metadata:\n` +
      `  name: ${experimentConfig.serviceName}-chaos\n` +
      `spec:\n` +
      `  hosts:\n` +
      `    - ${experimentConfig.serviceName}`

    generatedConfig.k8s = `# Kubernetes Chaos Mesh - ${experimentConfig.experimentName}\n\n` +
      `apiVersion: chaos-mesh.org/v1alpha1\n` +
      `kind: NetworkChaos\n` +
      `metadata:\n` +
      `  name: ${experimentConfig.experimentName}\n` +
      `spec:\n` +
      `  duration: "${experimentConfig.schedule.durationMinutes}m"`

    generatedConfig.prometheus = `# Prometheus告警规则 - ${experimentConfig.experimentName}\n\n` +
      `groups:\n` +
      `- name: ${experimentConfig.experimentName}\n` +
      `  rules:\n` +
      `  - alert: ChaosExperimentAlert`

    ElMessage.success('配置生成成功')
  } catch (error) {
    ElMessage.error('配置生成失败')
    console.error(error)
  }
}
</script>

<style scoped>
.chaos-experiment-designer {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.help-text {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.experiment-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin: 20px 0;
}

.flow-step {
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 18px;
}

.step-icon.success {
  background-color: #67c23a;
}

.step-icon.warning {
  background-color: #e6a23c;
}

.step-icon.info {
  background-color: #909399;
}

.step-icon.primary {
  background-color: #409eff;
}

.step-content {
  text-align: left;
}

.step-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
}

.step-desc {
  font-size: 12px;
  color: #606266;
}

.flow-arrow {
  margin: 0 15px;
  font-size: 24px;
  color: #909399;
}

.code-preview {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.code-preview :deep(textarea) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}
</style>

