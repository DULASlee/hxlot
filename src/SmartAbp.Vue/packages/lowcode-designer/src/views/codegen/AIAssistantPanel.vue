<template>
  <div class="ai-assistant-panel">
    <!-- 顶部工具栏 -->
    <el-card class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-icon class="robot-icon">
            <ChatDotRound />
          </el-icon>
          <span class="title">🤖 AI智能助手</span>
          <el-tag
            type="success"
            size="small"
          >
            GPT-4
          </el-tag>
        </div>
        <div class="toolbar-right">
          <el-select
            v-model="assistantMode"
            size="small"
            style="width: 200px"
          >
            <el-option
              label="💬 智能对话"
              value="chat"
            />
            <el-option
              label="⚙️ 配置推荐"
              value="config"
            />
            <el-option
              label="🏗️ 架构设计"
              value="architecture"
            />
            <el-option
              label="🔍 问题诊断"
              value="diagnostic"
            />
            <el-option
              label="📚 知识库"
              value="knowledge"
            />
          </el-select>
          <el-button
            size="small"
            @click="clearConversation"
          >
            <el-icon><Delete /></el-icon>
            清空对话
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 对话模式 -->
      <div
        v-if="assistantMode === 'chat'"
        class="chat-mode"
      >
        <el-card class="chat-card">
          <!-- 对话历史 -->
          <div
            ref="chatHistoryRef"
            class="chat-history"
          >
            <div
              v-if="messages.length === 0"
              class="welcome-message"
            >
              <el-empty description="开始与AI助手对话">
                <template #image>
                  <el-icon
                    :size="80"
                    color="#409EFF"
                  >
                    <ChatDotRound />
                  </el-icon>
                </template>
              </el-empty>
              <div class="quick-actions">
                <h3>快速开始</h3>
                <el-space wrap>
                  <el-button
                    v-for="action in quickActions"
                    :key="action.text"
                    size="small"
                    @click="sendQuickAction(action.text)"
                  >
                    {{ action.icon }} {{ action.text }}
                  </el-button>
                </el-space>
              </div>
            </div>

            <div
              v-for="(message, index) in messages"
              :key="index"
              :class="['message', message.role]"
            >
              <div class="message-avatar">
                <el-avatar
                  v-if="message.role === 'user'"
                  :size="36"
                >
                  <el-icon><User /></el-icon>
                </el-avatar>
                <el-avatar
                  v-else
                  :size="36"
                  style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                >
                  <el-icon><ChatDotRound /></el-icon>
                </el-avatar>
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="message-role">
                    {{ message.role === 'user' ? '您' : 'AI助手' }}
                  </span>
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                </div>
                <div
                  class="message-text"
                  v-html="renderMarkdown(message.content)"
                />
                <div
                  v-if="message.suggestions && message.suggestions.length > 0"
                  class="suggestions"
                >
                  <el-divider content-position="left">
                    建议
                  </el-divider>
                  <ul>
                    <li
                      v-for="(suggestion, i) in message.suggestions"
                      :key="i"
                    >
                      {{ suggestion }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div
              v-if="isThinking"
              class="message assistant thinking"
            >
              <div class="message-avatar">
                <el-avatar
                  :size="36"
                  style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                >
                  <el-icon><ChatDotRound /></el-icon>
                </el-avatar>
              </div>
              <div class="message-content">
                <div class="thinking-animation">
                  <span />
                  <span />
                  <span />
                </div>
                <span>AI正在思考...</span>
              </div>
            </div>
          </div>

          <!-- 输入框 -->
          <div class="chat-input">
            <el-input
              v-model="userInput"
              type="textarea"
              :rows="3"
              placeholder="输入您的问题..."
              @keydown.enter.ctrl="sendMessage"
            />
            <div class="input-actions">
              <div class="token-info">
                <el-icon><Document /></el-icon>
                <span>{{ totalTokens }} tokens</span>
              </div>
              <el-button
                type="primary"
                :loading="isThinking"
                @click="sendMessage"
              >
                <el-icon><Promotion /></el-icon>
                发送 (Ctrl+Enter)
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 配置推荐模式 -->
      <div
        v-if="assistantMode === 'config'"
        class="config-mode"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card header="服务需求">
              <el-form
                :model="serviceRequirements"
                label-width="140px"
              >
                <el-form-item label="服务类型">
                  <el-select v-model="serviceRequirements.serviceType">
                    <el-option
                      label="Web API"
                      value="web-api"
                    />
                    <el-option
                      label="后台任务"
                      value="background-job"
                    />
                    <el-option
                      label="数据处理"
                      value="data-processing"
                    />
                    <el-option
                      label="消息队列消费者"
                      value="message-consumer"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="预期QPS">
                  <el-input-number
                    v-model="serviceRequirements.expectedQPS"
                    :min="1"
                  />
                </el-form-item>
                <el-form-item label="高可用性">
                  <el-switch v-model="serviceRequirements.highAvailability" />
                </el-form-item>
                <el-form-item label="数据持久化">
                  <el-switch v-model="serviceRequirements.requiresPersistence" />
                </el-form-item>
                <el-form-item label="安全级别">
                  <el-select v-model="serviceRequirements.securityLevel">
                    <el-option
                      label="标准"
                      value="standard"
                    />
                    <el-option
                      label="高"
                      value="high"
                    />
                    <el-option
                      label="企业级"
                      value="enterprise"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    @click="getConfigRecommendation"
                  >
                    获取AI推荐
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card header="AI推荐配置">
              <div
                v-if="configRecommendation"
                class="recommendation-result"
              >
                <el-descriptions
                  :column="1"
                  border
                >
                  <el-descriptions-item label="CPU Request">
                    {{ configRecommendation.cpuRequest }}
                  </el-descriptions-item>
                  <el-descriptions-item label="CPU Limit">
                    {{ configRecommendation.cpuLimit }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Memory Request">
                    {{ configRecommendation.memoryRequest }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Memory Limit">
                    {{ configRecommendation.memoryLimit }}
                  </el-descriptions-item>
                  <el-descriptions-item label="副本数">
                    {{ configRecommendation.replicas }}
                  </el-descriptions-item>
                  <el-descriptions-item label="置信度">
                    <el-progress
                      :percentage="configRecommendation.confidence"
                      :color="getConfidenceColor(configRecommendation.confidence)"
                    />
                  </el-descriptions-item>
                </el-descriptions>

                <el-divider content-position="left">
                  理由说明
                </el-divider>
                <p class="reasoning">
                  {{ configRecommendation.reasoning }}
                </p>

                <el-divider content-position="left">
                  备选方案
                </el-divider>
                <ul class="alternatives">
                  <li
                    v-for="(alt, i) in configRecommendation.alternatives"
                    :key="i"
                  >
                    {{ alt }}
                  </li>
                </ul>
              </div>
              <el-empty
                v-else
                description="请填写服务需求后获取AI推荐"
              />
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 架构设计模式 -->
      <div
        v-if="assistantMode === 'architecture'"
        class="architecture-mode"
      >
        <el-card header="项目需求">
          <el-form
            :model="projectRequirements"
            label-width="140px"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="项目名称">
                  <el-input v-model="projectRequirements.projectName" />
                </el-form-item>
                <el-form-item label="业务领域">
                  <el-input v-model="projectRequirements.domain" />
                </el-form-item>
                <el-form-item label="预期用户规模">
                  <el-input-number
                    v-model="projectRequirements.expectedUsers"
                    :min="100"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="核心功能">
                  <el-select
                    v-model="projectRequirements.coreFeatures"
                    multiple
                  >
                    <el-option
                      label="用户管理"
                      value="user-management"
                    />
                    <el-option
                      label="订单处理"
                      value="order-processing"
                    />
                    <el-option
                      label="支付集成"
                      value="payment"
                    />
                    <el-option
                      label="消息通知"
                      value="notification"
                    />
                    <el-option
                      label="数据分析"
                      value="analytics"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="技术栈偏好">
                  <el-select
                    v-model="projectRequirements.preferredTech"
                    multiple
                  >
                    <el-option
                      label=".NET Core"
                      value="dotnet"
                    />
                    <el-option
                      label="Node.js"
                      value="nodejs"
                    />
                    <el-option
                      label="Go"
                      value="go"
                    />
                    <el-option
                      label="PostgreSQL"
                      value="postgresql"
                    />
                    <el-option
                      label="MongoDB"
                      value="mongodb"
                    />
                    <el-option
                      label="Redis"
                      value="redis"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item>
              <el-button
                type="primary"
                @click="getArchitectureRecommendation"
              >
                生成架构设计
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card
          v-if="architectureRecommendation"
          header="AI架构设计方案"
          style="margin-top: 20px"
        >
          <el-tabs>
            <el-tab-pane label="服务拆分">
              <el-table
                :data="architectureRecommendation.services"
                stripe
              >
                <el-table-column
                  prop="name"
                  label="服务名称"
                />
                <el-table-column
                  prop="responsibility"
                  label="职责"
                />
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="通信模式">
              <el-tag
                v-for="pattern in architectureRecommendation.communicationPatterns"
                :key="pattern"
                style="margin: 5px"
              >
                {{ pattern }}
              </el-tag>
            </el-tab-pane>
            <el-tab-pane label="数据存储">
              <p>{{ architectureRecommendation.dataStrategy }}</p>
            </el-tab-pane>
            <el-tab-pane label="可观测性">
              <p>{{ architectureRecommendation.observabilityStack }}</p>
            </el-tab-pane>
            <el-tab-pane label="成本估算">
              <el-statistic
                title="月度成本估算"
                :value="architectureRecommendation.estimatedCost"
              >
                <template #prefix>
                  $
                </template>
              </el-statistic>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>

      <!-- 问题诊断模式 -->
      <div
        v-if="assistantMode === 'diagnostic'"
        class="diagnostic-mode"
      >
        <el-card header="问题信息">
          <el-form label-width="120px">
            <el-form-item label="服务名称">
              <el-input v-model="diagnosticInput.serviceName" />
            </el-form-item>
            <el-form-item label="Pod状态">
              <el-input v-model="diagnosticInput.podStatus" />
            </el-form-item>
            <el-form-item label="错误信息">
              <el-input
                v-model="diagnosticInput.errorMessage"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
            <el-form-item label="事件日志">
              <el-input
                v-model="diagnosticInput.events"
                type="textarea"
                :rows="5"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="diagnoseIssue"
              >
                开始诊断
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card
          v-if="diagnosticResult"
          header="诊断结果"
          style="margin-top: 20px"
        >
          <el-alert
            :title="diagnosticResult.rootCause"
            type="error"
            :closable="false"
          >
            <p style="margin-top: 10px">
              根因已识别
            </p>
          </el-alert>

          <el-divider content-position="left">
            可能原因
          </el-divider>
          <el-table
            :data="diagnosticResult.possibleCauses"
            stripe
          >
            <el-table-column
              prop="cause"
              label="原因"
            />
            <el-table-column
              prop="probability"
              label="概率"
              width="120"
            >
              <template #default="{ row }">
                <el-progress
                  :percentage="row.probability"
                  :color="getProbabilityColor(row.probability)"
                />
              </template>
            </el-table-column>
          </el-table>

          <el-divider content-position="left">
            修复步骤
          </el-divider>
          <el-steps
            direction="vertical"
            :active="0"
          >
            <el-step
              v-for="(step, index) in diagnosticResult.fixSteps"
              :key="index"
              :title="`步骤 ${index + 1}`"
              :description="step"
            />
          </el-steps>
        </el-card>
      </div>

      <!-- 知识库模式 -->
      <div
        v-if="assistantMode === 'knowledge'"
        class="knowledge-mode"
      >
        <el-card>
          <el-input
            v-model="knowledgeQuery"
            placeholder="搜索微服务、Kubernetes知识..."
            size="large"
          >
            <template #append>
              <el-button
                :icon="Search"
                @click="searchKnowledge"
              >
                搜索
              </el-button>
            </template>
          </el-input>

          <div
            v-if="knowledgeAnswer"
            class="knowledge-result"
          >
            <h3>{{ knowledgeAnswer.question }}</h3>
            <el-divider />
            <div class="answer-content">
              <h4>答案</h4>
              <p>{{ knowledgeAnswer.answer }}</p>

              <h4>详细解释</h4>
              <p>{{ knowledgeAnswer.explanation }}</p>

              <h4>最佳实践</h4>
              <ul>
                <li
                  v-for="(practice, i) in knowledgeAnswer.bestPractices"
                  :key="i"
                >
                  {{ practice }}
                </li>
              </ul>

              <h4>常见陷阱</h4>
              <el-alert
                v-for="(pitfall, i) in knowledgeAnswer.commonPitfalls"
                :key="i"
                :title="pitfall"
                type="warning"
                :closable="false"
                style="margin: 10px 0"
              />

              <h4>参考资源</h4>
              <el-link
                v-for="(ref, i) in knowledgeAnswer.references"
                :key="i"
                type="primary"
                :href="`#${ref}`"
                target="_blank"
                style="display: block; margin: 5px 0"
              >
                {{ ref }}
              </el-link>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ChatDotRound,
  User,
  Delete,
  Document,
  Promotion,
  Search
} from '@element-plus/icons-vue'

// 助手模式
const assistantMode = ref('chat')

// 对话相关
const messages = ref<any[]>([])
const userInput = ref('')
const isThinking = ref(false)
const chatHistoryRef = ref<HTMLElement>()

// 快速操作
const quickActions = [
  { icon: '⚙️', text: '如何配置HPA？' },
  { icon: '🏗️', text: '推荐微服务架构' },
  { icon: '💰', text: '如何优化成本？' },
  { icon: '🔍', text: '诊断Pod启动失败' }
]

// 配置推荐
const serviceRequirements = reactive({
  serviceType: 'web-api',
  expectedQPS: 100,
  highAvailability: true,
  requiresPersistence: true,
  securityLevel: 'standard'
})

const configRecommendation = ref<any>(null)

// 架构设计
const projectRequirements = reactive({
  projectName: '',
  domain: '',
  expectedUsers: 10000,
  coreFeatures: [],
  preferredTech: []
})

const architectureRecommendation = ref<any>(null)

// 问题诊断
const diagnosticInput = reactive({
  serviceName: '',
  podStatus: 'ImagePullBackOff',
  errorMessage: '',
  events: ''
})

const diagnosticResult = ref<any>(null)

// 知识库
const knowledgeQuery = ref('')
const knowledgeAnswer = ref<any>(null)

// Token统计
const totalTokens = computed(() => {
  return messages.value.reduce((sum, msg) => {
    return sum + Math.floor(msg.content.length / 3)
  }, 0)
})

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim()) return

  const userMessage = {
    role: 'user',
    content: userInput.value,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  userInput.value = ''
  isThinking.value = true

  await scrollToBottom()

  // 模拟AI响应
  setTimeout(() => {
    const aiResponse = {
      role: 'assistant',
      content: generateMockResponse(userMessage.content),
      timestamp: new Date(),
      suggestions: [
        '查看HPA配置示例',
        '了解自动伸缩最佳实践',
        '查看成本优化建议'
      ]
    }
    messages.value.push(aiResponse)
    isThinking.value = false
    scrollToBottom()
  }, 2000)
}

// 快速操作
const sendQuickAction = (text: string) => {
  userInput.value = text
  sendMessage()
}

// 清空对话
const clearConversation = () => {
  messages.value = []
  ElMessage.success('对话已清空')
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (chatHistoryRef.value) {
    chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
  }
}

// 格式化时间
const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 渲染Markdown
const renderMarkdown = (content: string) => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

// 生成模拟响应
const generateMockResponse = (query: string) => {
  return `针对您的问题"${query}"，这里是AI的建议：

**推荐方案**：
1. 基于您的需求，建议使用HPA（Horizontal Pod Autoscaler）进行自动伸缩
2. 设置目标CPU利用率为70%
3. 最小副本数设置为2，最大副本数设置为10

**详细配置**：
\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-service-hpa
spec:
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
\`\`\`

这个配置能够确保您的服务在负载增加时自动扩展，在负载降低时自动收缩，实现成本优化。`
}

// 获取配置推荐
const getConfigRecommendation = () => {
  ElMessage.info('正在生成AI推荐...')
  
  setTimeout(() => {
    configRecommendation.value = {
      cpuRequest: '500m',
      cpuLimit: '2000m',
      memoryRequest: '512Mi',
      memoryLimit: '2Gi',
      replicas: 3,
      confidence: 85,
      reasoning: '基于您的QPS需求和高可用性要求，推荐使用此配置。该配置能够处理100 QPS的流量，同时保证高可用性。',
      alternatives: [
        '方案A: 高性能配置（CPU 1000m/4000m, Memory 1Gi/4Gi）',
        '方案B: 成本优化配置（CPU 250m/1000m, Memory 256Mi/1Gi）'
      ]
    }
    ElMessage.success('AI推荐已生成')
  }, 1500)
}

// 获取架构推荐
const getArchitectureRecommendation = () => {
  ElMessage.info('AI正在设计架构...')
  
  setTimeout(() => {
    architectureRecommendation.value = {
      services: [
        { name: 'api-gateway', responsibility: 'API网关和路由' },
        { name: 'auth-service', responsibility: '认证和授权' },
        { name: 'user-service', responsibility: '用户管理' },
        { name: 'order-service', responsibility: '订单处理' }
      ],
      communicationPatterns: ['REST API', 'gRPC', 'Event Bus'],
      dataStrategy: '每个服务独立数据库（Database per Service）',
      observabilityStack: 'Prometheus + Grafana + Jaeger + ELK',
      estimatedCost: 3500.00
    }
    ElMessage.success('架构设计已完成')
  }, 2000)
}

// 诊断问题
const diagnoseIssue = () => {
  ElMessage.info('AI正在诊断问题...')
  
  setTimeout(() => {
    diagnosticResult.value = {
      rootCause: '镜像拉取失败：ImagePullBackOff',
      possibleCauses: [
        { cause: '镜像不存在或拼写错误', probability: 60 },
        { cause: '镜像仓库认证失败', probability: 30 },
        { cause: '网络问题', probability: 10 }
      ],
      fixSteps: [
        '验证镜像名称和标签是否正确',
        '检查imagePullSecrets配置',
        '验证镜像仓库访问权限',
        '查看Pod事件日志获取详细错误信息'
      ]
    }
    ElMessage.success('诊断完成')
  }, 1500)
}

// 搜索知识库
const searchKnowledge = () => {
  if (!knowledgeQuery.value.trim()) return
  
  ElMessage.info('正在搜索知识库...')
  
  setTimeout(() => {
    knowledgeAnswer.value = {
      question: knowledgeQuery.value,
      answer: 'HPA（Horizontal Pod Autoscaler）是Kubernetes的自动伸缩控制器，可以根据CPU/内存利用率或自定义指标自动调整Pod副本数量。',
      explanation: '当负载增加时，HPA会自动增加Pod副本数；当负载降低时，会自动减少副本数，从而实现资源的高效利用和成本优化。',
      bestPractices: [
        '设置合理的资源requests和limits',
        '选择合适的目标利用率（通常70-80%）',
        '配置stabilizationWindow防止频繁伸缩',
        '结合VPA实现全面的资源优化'
      ],
      commonPitfalls: [
        '忘记设置资源requests导致HPA无法工作',
        '目标利用率设置过低导致频繁扩容'
      ],
      references: [
        'Kubernetes官方文档 - HPA',
        'CNCF最佳实践指南'
      ]
    }
    ElMessage.success('搜索完成')
  }, 1000)
}

// 获取置信度颜色
const getConfidenceColor = (percentage: number) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

// 获取概率颜色
const getProbabilityColor = (percentage: number) => {
  if (percentage >= 50) return '#f56c6c'
  if (percentage >= 30) return '#e6a23c'
  return '#909399'
}
</script>

<style scoped lang="scss">
.ai-assistant-panel {
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #f5f7fa;

  .toolbar-card {
    margin-bottom: 20px;

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .toolbar-left {
        display: flex;
        align-items: center;
        gap: 10px;

        .robot-icon {
          font-size: 24px;
          color: #409EFF;
        }

        .title {
          font-size: 18px;
          font-weight: 600;
        }
      }

      .toolbar-right {
        display: flex;
        gap: 10px;
      }
    }
  }

  .main-content {
    flex: 1;
    overflow: hidden;

    .chat-mode {
      height: 100%;

      .chat-card {
        height: 100%;
        display: flex;
        flex-direction: column;

        :deep(.el-card__body) {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-history {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f5f7fa;
          border-radius: 4px;
          margin-bottom: 20px;

          .welcome-message {
            text-align: center;
            padding: 40px 20px;

            .quick-actions {
              margin-top: 30px;

              h3 {
                margin-bottom: 20px;
                color: #606266;
              }
            }
          }

          .message {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;

            &.user {
              flex-direction: row-reverse;

              .message-content {
                background: #409EFF;
                color: white;
              }
            }

            &.assistant {
              .message-content {
                background: white;
              }
            }

            &.thinking {
              .message-content {
                display: flex;
                align-items: center;
                gap: 10px;
              }
            }

            .message-avatar {
              flex-shrink: 0;
            }

            .message-content {
              max-width: 70%;
              padding: 12px 16px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

              .message-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 12px;
                opacity: 0.7;

                .message-role {
                  font-weight: 600;
                }
              }

              .message-text {
                line-height: 1.6;

                :deep(code) {
                  background: rgba(0, 0, 0, 0.05);
                  padding: 2px 6px;
                  border-radius: 3px;
                  font-family: monospace;
                }
              }

              .suggestions {
                margin-top: 12px;

                ul {
                  margin: 10px 0 0 20px;

                  li {
                    margin: 5px 0;
                    color: #409EFF;
                    cursor: pointer;

                    &:hover {
                      text-decoration: underline;
                    }
                  }
                }
              }
            }

            .thinking-animation {
              display: flex;
              gap: 4px;

              span {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #409EFF;
                animation: thinking 1.4s infinite;

                &:nth-child(2) {
                  animation-delay: 0.2s;
                }

                &:nth-child(3) {
                  animation-delay: 0.4s;
                }
              }
            }
          }
        }

        .chat-input {
          .input-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;

            .token-info {
              display: flex;
              align-items: center;
              gap: 5px;
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }
    }

    .config-mode,
    .architecture-mode,
    .diagnostic-mode,
    .knowledge-mode {
      height: 100%;
      overflow-y: auto;

      .recommendation-result {
        .reasoning {
          line-height: 1.8;
          color: #606266;
        }

        .alternatives {
          margin-left: 20px;

          li {
            margin: 10px 0;
            line-height: 1.6;
          }
        }
      }

      .knowledge-result {
        margin-top: 20px;

        h3 {
          font-size: 20px;
          color: #303133;
        }

        .answer-content {
          h4 {
            margin: 20px 0 10px;
            color: #409EFF;
          }

          p {
            line-height: 1.8;
            color: #606266;
            margin: 10px 0;
          }

          ul {
            margin-left: 20px;

            li {
              margin: 8px 0;
              line-height: 1.6;
            }
          }
        }
      }
    }
  }
}

@keyframes thinking {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}
</style>

