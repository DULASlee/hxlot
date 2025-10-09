<!--
  代码生成进度监控组件
  
  功能:
  - 实时显示代码生成进度
  - WebSocket连接后端进度推送（准备）
  - 日志流式显示
  - 错误高亮和处理
  - 取消和重试功能
-->

<template>
  <div class="generation-progress-monitor">
    <el-card shadow="hover">
      <template #header>
        <div class="monitor-header">
          <div class="header-left">
            <i
              :class="statusIcon"
              class="status-icon"
            />
            <span class="status-text">{{ statusText }}</span>
          </div>
          <div class="header-right">
            <el-tag
              :type="statusTagType"
              size="small"
            >
              {{ statusLabel }}
            </el-tag>
            <el-button
              v-if="canCancel"
              link
              type="danger"
              size="small"
              @click="handleCancel"
            >
              取消
            </el-button>
            <el-button
              v-if="canRetry"
              link
              type="primary"
              size="small"
              @click="handleRetry"
            >
              重试
            </el-button>
          </div>
        </div>
      </template>

      <!-- 总进度 -->
      <div class="overall-progress">
        <div class="progress-info">
          <span>总体进度</span>
          <span class="progress-percentage">{{ overallProgress }}%</span>
        </div>
        <el-progress
          :percentage="overallProgress"
          :status="progressStatus"
          :stroke-width="20"
          :show-text="false"
        />
        <div class="time-info">
          <span>已用时: {{ elapsedTime }}</span>
          <span v-if="estimatedTime">预计剩余: {{ estimatedTime }}</span>
        </div>
      </div>

      <!-- 阶段进度 -->
      <div class="stage-progress">
        <el-timeline>
          <el-timeline-item
            v-for="stage in stages"
            :key="stage.name"
            :type="getStageType(stage)"
            :icon="getStageIcon(stage)"
            :hollow="stage.status === 'pending'"
            :timestamp="stage.timestamp"
            placement="top"
          >
            <div class="stage-item">
              <div class="stage-header">
                <span class="stage-name">{{ stage.displayName }}</span>
                <el-tag
                  v-if="stage.status !== 'pending'"
                  :type="getStageTagType(stage)"
                  size="small"
                >
                  {{ getStageStatusText(stage) }}
                </el-tag>
              </div>
              <el-progress
                v-if="stage.status === 'running'"
                :percentage="stage.progress"
                :stroke-width="6"
                :show-text="false"
              />
              <div
                v-if="stage.details"
                class="stage-details"
              >
                {{ stage.details }}
              </div>
              <div
                v-if="stage.error"
                class="stage-error"
              >
                <el-alert
                  type="error"
                  :closable="false"
                  show-icon
                >
                  <template #title>
                    {{ stage.error }}
                  </template>
                </el-alert>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 实时日志 -->
      <div class="log-panel">
        <div class="log-header">
          <span>实时日志</span>
          <div class="log-controls">
            <el-checkbox
              v-model="autoScroll"
              label="自动滚动"
            />
            <el-button
              link
              size="small"
              @click="clearLogs"
            >
              清空
            </el-button>
            <el-button
              link
              size="small"
              @click="exportLogs"
            >
              导出
            </el-button>
          </div>
        </div>
        <div
          ref="logContainer"
          class="log-container"
        >
          <div
            v-for="(log, index) in logs"
            :key="index"
            :class="['log-entry', `log-${log.level}`]"
          >
            <span class="log-time">{{ formatTime(log.time) }}</span>
            <span :class="['log-level', `level-${log.level}`]">
              {{ log.level.toUpperCase() }}
            </span>
            <span class="log-message">{{ log.message }}</span>
          </div>
          <div
            v-if="logs.length === 0"
            class="log-empty"
          >
            暂无日志
          </div>
        </div>
      </div>

      <!-- 生成统计 -->
      <div
        v-if="statistics"
        class="statistics-panel"
      >
        <el-descriptions
          title="生成统计"
          :column="3"
          border
        >
          <el-descriptions-item label="文件总数">
            {{ statistics.totalFiles }}
          </el-descriptions-item>
          <el-descriptions-item label="代码行数">
            {{ statistics.totalLines }}
          </el-descriptions-item>
          <el-descriptions-item label="包大小">
            {{ formatBytes(statistics.totalSize) }}
          </el-descriptions-item>
          <el-descriptions-item label="C# 文件">
            {{ statistics.csharpFiles }}
          </el-descriptions-item>
          <el-descriptions-item label="Vue 文件">
            {{ statistics.vueFiles }}
          </el-descriptions-item>
          <el-descriptions-item label="TS 文件">
            {{ statistics.tsFiles }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

export interface GenerationStage {
  name: string
  displayName: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number
  timestamp?: string
  details?: string
  error?: string
}

export interface GenerationLog {
  time: Date
  level: 'info' | 'success' | 'warning' | 'error' | 'debug'
  message: string
}

export interface GenerationStatistics {
  totalFiles: number
  totalLines: number
  totalSize: number
  csharpFiles: number
  vueFiles: number
  tsFiles: number
}

interface Props {
  /** 总体进度 0-100 */
  overallProgress?: number
  /** 当前状态 */
  status?: 'idle' | 'running' | 'completed' | 'error' | 'cancelled'
  /** 阶段列表 */
  stages?: GenerationStage[]
  /** 日志列表 */
  logs?: GenerationLog[]
  /** 生成统计 */
  statistics?: GenerationStatistics
  /** 是否可取消 */
  canCancel?: boolean
  /** 是否可重试 */
  canRetry?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  overallProgress: 0,
  status: 'idle',
  stages: () => [],
  logs: () => [],
  statistics: undefined,
  canCancel: false,
  canRetry: false
})

const emit = defineEmits<{
  cancel: []
  retry: []
}>()

// 内部状态
const autoScroll = ref(true)
const logContainer = ref<HTMLElement>()
const startTime = ref<Date>()
const elapsedTimeMs = ref(0)
const timerInterval = ref<number>()

// 计算属性
const statusIcon = computed(() => {
  const icons = {
    idle: 'el-icon-clock',
    running: 'el-icon-loading',
    completed: 'el-icon-success',
    error: 'el-icon-error',
    cancelled: 'el-icon-warning'
  }
  return icons[props.status]
})

const statusText = computed(() => {
  const texts = {
    idle: '准备就绪',
    running: '生成中',
    completed: '生成完成',
    error: '生成失败',
    cancelled: '已取消'
  }
  return texts[props.status]
})

const statusLabel = computed(() => {
  const labels = {
    idle: '待开始',
    running: '进行中',
    completed: '已完成',
    error: '失败',
    cancelled: '已取消'
  }
  return labels[props.status]
})

const statusTagType = computed(() => {
  const types = {
    idle: 'info',
    running: 'warning',
    completed: 'success',
    error: 'danger',
    cancelled: 'warning'
  }
  return types[props.status] as 'info' | 'warning' | 'success' | 'danger'
})

const progressStatus = computed(() => {
  if (props.status === 'completed') return 'success'
  if (props.status === 'error') return 'exception'
  return undefined
})

const elapsedTime = computed(() => {
  const seconds = Math.floor(elapsedTimeMs.value / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
})

const estimatedTime = computed(() => {
  if (props.overallProgress === 0 || props.status !== 'running') return null
  
  const totalEstimatedMs = (elapsedTimeMs.value / props.overallProgress) * 100
  const remainingMs = totalEstimatedMs - elapsedTimeMs.value
  
  const seconds = Math.floor(remainingMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
})

// 方法
function getStageType(stage: GenerationStage) {
  if (stage.status === 'completed') return 'success'
  if (stage.status === 'error') return 'danger'
  if (stage.status === 'running') return 'primary'
  return 'info'
}

function getStageIcon(stage: GenerationStage) {
  if (stage.status === 'completed') return 'el-icon-check'
  if (stage.status === 'error') return 'el-icon-close'
  if (stage.status === 'running') return 'el-icon-loading'
  return 'el-icon-time'
}

function getStageTagType(stage: GenerationStage) {
  if (stage.status === 'completed') return 'success'
  if (stage.status === 'error') return 'danger'
  if (stage.status === 'running') return 'warning'
  return 'info'
}

function getStageStatusText(stage: GenerationStage) {
  const texts = {
    pending: '待执行',
    running: `${stage.progress}%`,
    completed: '已完成',
    error: '失败'
  }
  return texts[stage.status]
}

function formatTime(time: Date): string {
  return time.toLocaleTimeString('zh-CN', { hour12: false })
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

function clearLogs() {
  emit('retry') // 通过父组件清空
  ElMessage.success('日志已清空')
}

function exportLogs() {
  const content = props.logs
    .map(log => `[${formatTime(log.time)}] [${log.level.toUpperCase()}] ${log.message}`)
    .join('\n')
  
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `generation-logs-${new Date().getTime()}.txt`
  link.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('日志已导出')
}

function handleCancel() {
  emit('cancel')
}

function handleRetry() {
  emit('retry')
}

// 自动滚动到底部
watch(
  () => props.logs.length,
  async () => {
    if (autoScroll.value) {
      await nextTick()
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight
      }
    }
  }
)

// 计时器
watch(
  () => props.status,
  (newStatus, oldStatus) => {
    if (newStatus === 'running' && oldStatus !== 'running') {
      // 开始计时
      startTime.value = new Date()
      elapsedTimeMs.value = 0
      timerInterval.value = window.setInterval(() => {
        if (startTime.value) {
          elapsedTimeMs.value = Date.now() - startTime.value.getTime()
        }
      }, 1000)
    } else if (newStatus !== 'running' && oldStatus === 'running') {
      // 停止计时
      if (timerInterval.value) {
        clearInterval(timerInterval.value)
        timerInterval.value = undefined
      }
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (props.status === 'running') {
    startTime.value = new Date()
    timerInterval.value = window.setInterval(() => {
      if (startTime.value) {
        elapsedTimeMs.value = Date.now() - startTime.value.getTime()
      }
    }, 1000)
  }
})

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})
</script>

<style scoped lang="scss">
.generation-progress-monitor {
  .monitor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;

      .status-icon {
        font-size: 20px;
        
        &.el-icon-loading {
          color: var(--el-color-warning);
          animation: rotating 2s linear infinite;
        }
        &.el-icon-success {
          color: var(--el-color-success);
        }
        &.el-icon-error {
          color: var(--el-color-danger);
        }
      }

      .status-text {
        font-size: 16px;
        font-weight: 600;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .overall-progress {
    margin: 20px 0;

    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;

      .progress-percentage {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-color-primary);
      }
    }

    .time-info {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .stage-progress {
    margin: 20px 0;
    max-height: 400px;
    overflow-y: auto;

    .stage-item {
      .stage-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .stage-name {
          font-weight: 500;
        }
      }

      .stage-details {
        margin-top: 8px;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }

      .stage-error {
        margin-top: 8px;
      }
    }
  }

  .log-panel {
    margin: 20px 0;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;

    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      background-color: var(--el-fill-color-light);
      border-bottom: 1px solid var(--el-border-color);
      font-weight: 500;

      .log-controls {
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }

    .log-container {
      max-height: 300px;
      overflow-y: auto;
      padding: 10px;
      background-color: #1e1e1e;
      color: #d4d4d4;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.5;

      .log-entry {
        display: flex;
        gap: 10px;
        padding: 2px 0;

        .log-time {
          color: #858585;
          flex-shrink: 0;
        }

        .log-level {
          flex-shrink: 0;
          width: 60px;
          text-align: center;
          font-weight: 600;

          &.level-info {
            color: #4fc3f7;
          }
          &.level-success {
            color: #81c784;
          }
          &.level-warning {
            color: #ffb74d;
          }
          &.level-error {
            color: #e57373;
          }
          &.level-debug {
            color: #ba68c8;
          }
        }

        .log-message {
          flex: 1;
          word-break: break-word;
        }

        &.log-error {
          background-color: rgba(229, 115, 115, 0.1);
        }
      }

      .log-empty {
        text-align: center;
        color: #858585;
        padding: 20px;
      }
    }
  }

  .statistics-panel {
    margin-top: 20px;
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

