<template>
  <div class="auto-scaling-designer">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span class="title">🚀 自动伸缩引擎配置</span>
          <el-button-group>
            <el-button
              :type="activeTab === 'hpa' ? 'primary' : ''"
              @click="activeTab = 'hpa'"
            >
              HPA配置
            </el-button>
            <el-button
              :type="activeTab === 'vpa' ? 'primary' : ''"
              @click="activeTab = 'vpa'"
            >
              VPA配置
            </el-button>
            <el-button
              :type="activeTab === 'history' ? 'primary' : ''"
              @click="activeTab = 'history'"
            >
              伸缩历史
            </el-button>
            <el-button
              :type="activeTab === 'analysis' ? 'primary' : ''"
              @click="activeTab = 'analysis'"
            >
              效率分析
            </el-button>
          </el-button-group>
        </div>
      </template>

      <!-- HPA配置面板 -->
      <div v-if="activeTab === 'hpa'" class="config-panel">
        <el-form :model="hpaConfig" label-width="140px">
          <el-form-item label="服务名称">
            <el-input
              v-model="hpaConfig.serviceName"
              placeholder="请输入服务名称"
            />
          </el-form-item>

          <el-form-item label="副本数范围">
            <div class="replica-range">
              <el-input-number
                v-model="hpaConfig.minReplicas"
                :min="1"
                :max="100"
                placeholder="最小副本数"
              />
              <span class="range-separator">至</span>
              <el-input-number
                v-model="hpaConfig.maxReplicas"
                :min="1"
                :max="100"
                placeholder="最大副本数"
              />
            </div>
          </el-form-item>

          <el-form-item label="目标CPU使用率">
            <el-slider
              v-model="hpaConfig.targetCPUUtilization"
              :min="10"
              :max="90"
              :marks="{ 30: '30%', 50: '50%', 70: '70%', 90: '90%' }"
              show-input
            />
          </el-form-item>

          <el-form-item label="目标内存使用率">
            <el-slider
              v-model="hpaConfig.targetMemoryUtilization"
              :min="10"
              :max="90"
              :marks="{ 30: '30%', 50: '50%', 70: '70%', 90: '90%' }"
              show-input
            />
          </el-form-item>

          <el-form-item label="自定义指标">
            <el-button
              size="small"
              @click="addCustomMetric"
            >
              + 添加自定义指标
            </el-button>
            <div
              v-for="(metric, index) in hpaConfig.customMetrics"
              :key="index"
              class="custom-metric"
            >
              <el-input
                v-model="metric.name"
                placeholder="指标名称"
                style="width: 200px"
              />
              <el-select
                v-model="metric.type"
                placeholder="类型"
                style="width: 120px"
              >
                <el-option label="Pods" value="Pods" />
                <el-option label="Object" value="Object" />
                <el-option label="External" value="External" />
              </el-select>
              <el-input
                v-model="metric.targetValue"
                placeholder="目标值"
                style="width: 120px"
              />
              <el-button
                type="danger"
                size="small"
                icon="Delete"
                @click="removeCustomMetric(index)"
              />
            </div>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="generateHPAConfig">
              生成HPA配置
            </el-button>
            <el-button @click="getRecommendation">
              💡 智能推荐配置
            </el-button>
            <el-button @click="validateConfig">
              验证配置
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 生成的YAML预览 -->
        <el-card v-if="generatedYaml" class="yaml-preview">
          <template #header>
            <div class="card-header">
              <span>生成的HPA配置</span>
              <el-button size="small" @click="copyYaml">
                复制YAML
              </el-button>
            </div>
          </template>
          <pre><code>{{ generatedYaml }}</code></pre>
        </el-card>
      </div>

      <!-- VPA配置面板 -->
      <div v-if="activeTab === 'vpa'" class="config-panel">
        <el-form :model="vpaConfig" label-width="140px">
          <el-form-item label="服务名称">
            <el-input
              v-model="vpaConfig.serviceName"
              placeholder="请输入服务名称"
            />
          </el-form-item>

          <el-form-item label="更新模式">
            <el-select v-model="vpaConfig.updateMode">
              <el-option label="Off - 仅推荐" value="Off" />
              <el-option label="Initial - 仅初始创建" value="Initial" />
              <el-option label="Recreate - 重建Pod" value="Recreate" />
              <el-option label="Auto - 自动更新" value="Auto" />
            </el-select>
          </el-form-item>

          <el-form-item label="资源限制">
            <div class="resource-policy">
              <div class="resource-row">
                <span>最小CPU:</span>
                <el-input v-model="vpaConfig.minCPU" placeholder="100m" />
              </div>
              <div class="resource-row">
                <span>最大CPU:</span>
                <el-input v-model="vpaConfig.maxCPU" placeholder="4000m" />
              </div>
              <div class="resource-row">
                <span>最小内存:</span>
                <el-input v-model="vpaConfig.minMemory" placeholder="128Mi" />
              </div>
              <div class="resource-row">
                <span>最大内存:</span>
                <el-input v-model="vpaConfig.maxMemory" placeholder="8Gi" />
              </div>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="generateVPAConfig">
              生成VPA配置
            </el-button>
          </el-form-item>
        </el-form>

        <!-- VPA YAML预览 -->
        <el-card v-if="generatedVPAYaml" class="yaml-preview">
          <template #header>
            <div class="card-header">
              <span>生成的VPA配置</span>
              <el-button size="small" @click="copyVPAYaml">
                复制YAML
              </el-button>
            </div>
          </template>
          <pre><code>{{ generatedVPAYaml }}</code></pre>
        </el-card>
      </div>

      <!-- 伸缩历史面板 -->
      <div v-if="activeTab === 'history'" class="history-panel">
        <el-form inline>
          <el-form-item label="服务名称">
            <el-input
              v-model="historyQuery.serviceName"
              placeholder="请输入服务名称"
            />
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="historyQuery.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadScalingHistory">
              查询历史
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 伸缩历史图表 -->
        <ScalingHistoryChart
          v-if="scalingHistory"
          :history="scalingHistory"
        />

        <!-- 伸缩事件列表 -->
        <el-card v-if="scalingHistory" class="events-card">
          <template #header>
            <span>伸缩事件列表 (共{{ scalingHistory.events.length }}个事件)</span>
          </template>
          <el-table :data="scalingHistory.events" stripe>
            <el-table-column prop="timestamp" label="时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.timestamp) }}
              </template>
            </el-table-column>
            <el-table-column prop="eventType" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.eventType === 'ScaleUp' ? 'success' : 'warning'">
                  {{ row.eventType === 'ScaleUp' ? '扩容' : '缩容' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="副本数变化" width="150">
              <template #default="{ row }">
                {{ row.oldReplicas }} → {{ row.newReplicas }}
              </template>
            </el-table-column>
            <el-table-column prop="metric" label="指标" width="100" />
            <el-table-column label="当前值/目标值" width="150">
              <template #default="{ row }">
                {{ row.currentValue }}% / {{ row.targetValue }}%
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="原因" />
          </el-table>
        </el-card>

        <!-- 统计信息 -->
        <el-card v-if="scalingHistory" class="statistics-card">
          <template #header>
            <span>统计信息</span>
          </template>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="扩容次数">
              {{ scalingHistory.statistics.totalScaleUpEvents }}
            </el-descriptions-item>
            <el-descriptions-item label="缩容次数">
              {{ scalingHistory.statistics.totalScaleDownEvents }}
            </el-descriptions-item>
            <el-descriptions-item label="平均副本数">
              {{ scalingHistory.statistics.averageReplicas.toFixed(1) }}
            </el-descriptions-item>
            <el-descriptions-item label="最大副本数">
              {{ scalingHistory.statistics.maxReplicas }}
            </el-descriptions-item>
            <el-descriptions-item label="最小副本数">
              {{ scalingHistory.statistics.minReplicas }}
            </el-descriptions-item>
            <el-descriptions-item label="总伸缩时长">
              {{ formatDuration(scalingHistory.statistics.totalScalingDuration) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>

      <!-- 效率分析面板 -->
      <div v-if="activeTab === 'analysis'" class="analysis-panel">
        <el-form inline>
          <el-form-item label="服务名称">
            <el-input
              v-model="analysisQuery.serviceName"
              placeholder="请输入服务名称"
            />
          </el-form-item>
          <el-form-item label="分析周期">
            <el-date-picker
              v-model="analysisQuery.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="analyzeEfficiency">
              开始分析
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 效率分析结果 -->
        <el-card v-if="efficiencyAnalysis" class="analysis-result">
          <template #header>
            <span>效率分析报告</span>
          </template>

          <div class="efficiency-score">
            <div class="score-circle">
              <el-progress
                type="circle"
                :percentage="efficiencyAnalysis.efficiencyScore"
                :color="getScoreColor(efficiencyAnalysis.efficiencyScore)"
              >
                <template #default="{ percentage }">
                  <span class="score-text">{{ percentage }}</span>
                  <span class="score-label">效率评分</span>
                </template>
              </el-progress>
            </div>
          </div>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="扩容延迟">
              {{ efficiencyAnalysis.scaleUpLatency }}秒
            </el-descriptions-item>
            <el-descriptions-item label="缩容延迟">
              {{ efficiencyAnalysis.scaleDownLatency }}秒
            </el-descriptions-item>
            <el-descriptions-item label="抖动事件">
              <el-tag :type="efficiencyAnalysis.thrashingEvents > 5 ? 'danger' : 'success'">
                {{ efficiencyAnalysis.thrashingEvents }}次
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="成本节省">
              <span class="cost-savings">${{ efficiencyAnalysis.costSavings }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="过度配置">
              {{ efficiencyAnalysis.overProvisioningPercentage }}%
            </el-descriptions-item>
            <el-descriptions-item label="配置不足">
              {{ efficiencyAnalysis.underProvisioningPercentage }}%
            </el-descriptions-item>
          </el-descriptions>

          <el-divider />

          <div class="recommendations">
            <h4>🎯 优化建议</h4>
            <el-alert
              v-for="(recommendation, index) in efficiencyAnalysis.recommendations"
              :key="index"
              :title="recommendation"
              type="info"
              :closable="false"
              style="margin-bottom: 10px"
            />
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import ScalingHistoryChart from './ScalingHistoryChart.vue'

// 活动标签
const activeTab = ref('hpa')

// HPA配置
const hpaConfig = reactive({
  serviceName: '',
  minReplicas: 2,
  maxReplicas: 10,
  targetCPUUtilization: 70,
  targetMemoryUtilization: 80,
  customMetrics: [] as Array<{
    name: string
    type: string
    targetValue: string
  }>
})

// VPA配置
const vpaConfig = reactive({
  serviceName: '',
  updateMode: 'Auto',
  minCPU: '100m',
  maxCPU: '4000m',
  minMemory: '128Mi',
  maxMemory: '8Gi'
})

// 历史查询
const historyQuery = reactive({
  serviceName: '',
  timeRange: [] as Date[]
})

// 分析查询
const analysisQuery = reactive({
  serviceName: '',
  timeRange: [] as Date[]
})

// 生成的YAML
const generatedYaml = ref('')
const generatedVPAYaml = ref('')

// 伸缩历史
const scalingHistory = ref<any>(null)

// 效率分析
const efficiencyAnalysis = ref<any>(null)

// 添加自定义指标
const addCustomMetric = () => {
  hpaConfig.customMetrics.push({
    name: '',
    type: 'Pods',
    targetValue: ''
  })
}

// 移除自定义指标
const removeCustomMetric = (index: number) => {
  hpaConfig.customMetrics.splice(index, 1)
}

// 生成HPA配置
const generateHPAConfig = async () => {
  try {
    // TODO: 调用后端API生成HPA配置
    generatedYaml.value = `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${hpaConfig.serviceName}-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${hpaConfig.serviceName}
  minReplicas: ${hpaConfig.minReplicas}
  maxReplicas: ${hpaConfig.maxReplicas}
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: ${hpaConfig.targetCPUUtilization}
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: ${hpaConfig.targetMemoryUtilization}`

    ElMessage.success('HPA配置生成成功')
  } catch (error) {
    ElMessage.error('HPA配置生成失败')
  }
}

// 生成VPA配置
const generateVPAConfig = async () => {
  try {
    generatedVPAYaml.value = `apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: ${vpaConfig.serviceName}-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${vpaConfig.serviceName}
  updatePolicy:
    updateMode: ${vpaConfig.updateMode}
  resourcePolicy:
    containerPolicies:
    - containerName: ${vpaConfig.serviceName}
      minAllowed:
        cpu: ${vpaConfig.minCPU}
        memory: ${vpaConfig.minMemory}
      maxAllowed:
        cpu: ${vpaConfig.maxCPU}
        memory: ${vpaConfig.maxMemory}`

    ElMessage.success('VPA配置生成成功')
  } catch (error) {
    ElMessage.error('VPA配置生成失败')
  }
}

// 获取智能推荐
const getRecommendation = async () => {
  try {
    // TODO: 调用后端API获取智能推荐
    ElMessage.success('基于历史数据分析，推荐配置：Min=3, Max=15, CPU=60%, Memory=70%')
  } catch (error) {
    ElMessage.error('获取推荐失败')
  }
}

// 验证配置
const validateConfig = () => {
  const errors: string[] = []

  if (!hpaConfig.serviceName) {
    errors.push('服务名称不能为空')
  }
  if (hpaConfig.minReplicas >= hpaConfig.maxReplicas) {
    errors.push('最大副本数必须大于最小副本数')
  }
  if (hpaConfig.targetCPUUtilization < 10 || hpaConfig.targetCPUUtilization > 90) {
    errors.push('目标CPU使用率应在10%-90%之间')
  }

  if (errors.length > 0) {
    ElMessage.error(errors.join('; '))
  } else {
    ElMessage.success('配置验证通过')
  }
}

// 加载伸缩历史
const loadScalingHistory = async () => {
  try {
    // TODO: 调用后端API加载历史数据
    scalingHistory.value = {
      serviceName: historyQuery.serviceName,
      events: [
        {
          timestamp: new Date(Date.now() - 3600000),
          eventType: 'ScaleUp',
          oldReplicas: 2,
          newReplicas: 4,
          metric: 'cpu',
          currentValue: 85,
          targetValue: 70,
          reason: 'CPU utilization above target'
        }
      ],
      statistics: {
        totalScaleUpEvents: 15,
        totalScaleDownEvents: 12,
        averageReplicas: 5.2,
        maxReplicas: 10,
        minReplicas: 2,
        totalScalingDuration: 9000
      }
    }
    ElMessage.success('历史数据加载成功')
  } catch (error) {
    ElMessage.error('历史数据加载失败')
  }
}

// 分析效率
const analyzeEfficiency = async () => {
  try {
    // TODO: 调用后端API分析效率
    efficiencyAnalysis.value = {
      serviceName: analysisQuery.serviceName,
      period: '2025-01-01 ~ 2025-01-31',
      efficiencyScore: 85.5,
      scaleUpLatency: 45,
      scaleDownLatency: 120,
      thrashingEvents: 2,
      overProvisioningPercentage: 15.3,
      underProvisioningPercentage: 3.2,
      costSavings: 1250.50,
      recommendations: [
        '建议增加稳定窗口时间，减少抖动',
        '当前最大副本数设置合理',
        '可以适当降低目标CPU阈值，减少过度配置'
      ]
    }
    ElMessage.success('效率分析完成')
  } catch (error) {
    ElMessage.error('效率分析失败')
  }
}

// 复制YAML
const copyYaml = () => {
  navigator.clipboard.writeText(generatedYaml.value)
  ElMessage.success('YAML已复制到剪贴板')
}

const copyVPAYaml = () => {
  navigator.clipboard.writeText(generatedVPAYaml.value)
  ElMessage.success('YAML已复制到剪贴板')
}

// 格式化时间
const formatTime = (timestamp: Date) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 格式化时长
const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}小时${minutes}分钟`
}

// 获取评分颜色
const getScoreColor = (score: number) => {
  if (score >= 90) return '#67c23a'
  if (score >= 70) return '#e6a23c'
  return '#f56c6c'
}
</script>

<style scoped lang="scss">
.auto-scaling-designer {
  padding: 20px;

  .header-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-size: 18px;
        font-weight: 600;
      }
    }
  }

  .config-panel {
    .replica-range {
      display: flex;
      align-items: center;
      gap: 10px;

      .range-separator {
        color: #909399;
      }
    }

    .custom-metric {
      display: flex;
      gap: 10px;
      margin-top: 10px;
      align-items: center;
    }

    .resource-policy {
      .resource-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;

        span {
          width: 80px;
          text-align: right;
        }
      }
    }
  }

  .yaml-preview {
    margin-top: 20px;

    pre {
      background: #f5f7fa;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;

      code {
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.5;
      }
    }
  }

  .history-panel,
  .analysis-panel {
    .events-card,
    .statistics-card {
      margin-top: 20px;
    }
  }

  .analysis-result {
    margin-top: 20px;

    .efficiency-score {
      text-align: center;
      margin: 30px 0;

      .score-circle {
        display: inline-block;

        .score-text {
          font-size: 32px;
          font-weight: 600;
          display: block;
        }

        .score-label {
          font-size: 14px;
          color: #909399;
          display: block;
          margin-top: 5px;
        }
      }
    }

    .cost-savings {
      color: #67c23a;
      font-weight: 600;
      font-size: 16px;
    }

    .recommendations {
      h4 {
        margin: 20px 0 15px 0;
        font-size: 16px;
      }
    }
  }
}
</style>

