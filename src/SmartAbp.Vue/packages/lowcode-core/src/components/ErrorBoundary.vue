<template>
  <div class="error-boundary">
    <slot v-if="!hasError" />

    <!-- 错误回退UI -->
    <div
      v-else
      class="error-fallback"
    >
      <el-result
        :icon="errorIcon"
        :title="errorTitle"
        :sub-title="errorMessage"
        class="error-result"
      >
        <template #extra>
          <div class="error-actions">
            <el-button
              :loading="retrying"
              @click="retry"
            >
              <el-icon><RefreshRight /></el-icon>
              重试
            </el-button>
            <el-button
              type="primary"
              @click="reportError"
            >
              <el-icon><Warning /></el-icon>
              报告问题
            </el-button>
            <el-button
              v-if="showReload"
              type="danger"
              @click="reloadPage"
            >
              <el-icon><Refresh /></el-icon>
              重新加载
            </el-button>
          </div>
        </template>
      </el-result>

      <!-- 错误详情（开发模式） -->
      <el-collapse
        v-if="isDev && errorInfo"
        class="error-details"
      >
        <el-collapse-item
          title="错误详情"
          name="details"
        >
          <div class="error-stack">
            <h4>错误信息</h4>
            <pre>{{ errorInfo.message }}</pre>

            <h4 v-if="errorInfo.stack">
              调用栈
            </h4>
            <pre v-if="errorInfo.stack">{{ errorInfo.stack }}</pre>

            <h4 v-if="componentInfo">
              组件信息
            </h4>
            <pre v-if="componentInfo">{{ componentInfo }}</pre>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Refresh, RefreshRight, Warning } from '@element-plus/icons-vue'
import { logger } from '@smartabp/lowcode-tools'
import { ElMessage } from 'element-plus'
import { computed, onErrorCaptured, onMounted, ref } from 'vue'
// 本组件仅用于展示错误信息，不引入跨层模块；提供最小占位以通过类型检查
const useWorkspaceStore = () => ({ addError: (_e: unknown) => {} })

interface Props {
  /**
   * 错误级别
   */
  level?: 'component' | 'module' | 'global'

  /**
   * 是否显示重新加载按钮
   */
  showReload?: boolean

  /**
   * 自定义错误消息
   */
  fallbackMessage?: string

  /**
   * 最大重试次数
   */
  maxRetries?: number
}

const props = withDefaults(defineProps<Props>(), {
  level: 'component',
  showReload: false,
  fallbackMessage: '',
  maxRetries: 3
})

const emit = defineEmits<{
  error: [error: Error, instance: any, info: string]
  retry: []
  reload: []
}>()

// 状态
const hasError = ref(false)
const errorInfo = ref<Error | null>(null)
const componentInfo = ref<string>('')
const retryCount = ref(0)
const retrying = ref(false)

// Store
const workspaceStore = useWorkspaceStore()

// 计算属性
const isDev = computed(() => import.meta.env.DEV)

const errorIcon = computed(() => {
  switch (props.level) {
    case 'global': return 'error'
    case 'module': return 'warning'
    default: return 'info'
  }
})

const errorTitle = computed(() => {
  switch (props.level) {
    case 'global': return '应用程序错误'
    case 'module': return '模块加载失败'
    default: return '组件错误'
  }
})

const errorMessage = computed(() => {
  if (props.fallbackMessage) return props.fallbackMessage

  if (errorInfo.value) {
    return `${errorInfo.value.message}${retryCount.value > 0 ? ` (已重试 ${retryCount.value} 次)` : ''}`
  }

  return '发生了未知错误，请稍后重试'
})

// 错误捕获
onErrorCaptured((err, instance, info) => {
  hasError.value = true
  errorInfo.value = err
  componentInfo.value = info

  // 记录错误到全局状态
  type WorkspaceCapable = { captureError?: (e: Error, meta?: Record<string, unknown>) => void }
  const ws = workspaceStore as unknown as WorkspaceCapable
  if (typeof ws.captureError === 'function') {
    ws.captureError(new Error(err.message), {
      level: props.level,
      component: instance?.$options?.name || instance?.$?.type?.name || 'Unknown',
      stack: err.stack
    })
  }

  // 触发错误事件
  emit('error', err, instance, info)

  // 记录到日志
  logger?.error(`ErrorBoundary[${props.level}] 捕获错误`, {
    error: err.message,
    component: instance?.$options?.name,
    info
  })

  // 防止错误向上传播
  return false
})

// 重试机制
const retry = async () => {
  if (retryCount.value >= props.maxRetries) {
    ElMessage.warning(`已达到最大重试次数 (${props.maxRetries})`)
    return
  }

  retrying.value = true
  retryCount.value++

  try {
    // 延迟一下让用户看到重试状态
    await new Promise(resolve => setTimeout(resolve, 500))

    // 重置错误状态
    hasError.value = false
    errorInfo.value = null
    componentInfo.value = ''

    emit('retry')

    ElMessage.success('重试成功')
    logger?.info(`ErrorBoundary[${props.level}] 重试成功`, { retryCount: retryCount.value })

  } catch (error) {
    logger?.error(`ErrorBoundary[${props.level}] 重试失败`, error)
    ElMessage.error('重试失败')
  } finally {
    retrying.value = false
  }
}

// 报告错误
const reportError = () => {
  if (!errorInfo.value) return

  // 这里可以集成错误报告服务
  const errorReport = {
    message: errorInfo.value.message,
    stack: errorInfo.value.stack,
    component: componentInfo.value,
    level: props.level,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  }

  logger?.error('用户报告错误', errorReport)
  ElMessage.success('错误报告已发送')
}

// 重新加载页面
const reloadPage = () => {
  emit('reload')
  window.location.reload()
}

// 组件挂载后恢复重试计数
onMounted(() => {
  retryCount.value = 0
})
</script>

<style scoped>
.error-boundary {
  position: relative;
  min-height: 200px;
}

.error-fallback {
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.error-result {
  margin: 0;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.error-details {
  margin-top: 20px;
  max-width: 100%;
}

.error-stack {
  font-size: 12px;
  line-height: 1.5;
}

.error-stack h4 {
  margin: 16px 0 8px 0;
  color: #606266;
  font-size: 14px;
}

.error-stack pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 8px 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-actions {
    flex-direction: column;
    align-items: center;
  }

  .error-actions .el-button {
    width: 100%;
    max-width: 200px;
  }
}
</style>
