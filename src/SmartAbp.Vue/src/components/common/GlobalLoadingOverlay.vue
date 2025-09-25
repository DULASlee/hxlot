<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="global-loading-overlay"
      :class="overlayClasses"
    >
      <div class="loading-container">
        <!-- 加载图标 -->
        <div class="loading-icon">
          <el-icon
            v-if="iconType === 'spinner'"
            class="rotating"
          >
            <Loading />
          </el-icon>
          <el-icon
            v-else-if="iconType === 'gear'"
            class="rotating"
          >
            <Setting />
          </el-icon>
          <div
            v-else-if="iconType === 'dots'"
            class="dots-loader"
          >
            <span />
            <span />
            <span />
          </div>
          <div
            v-else-if="iconType === 'pulse'"
            class="pulse-loader"
          />
        </div>

        <!-- 加载文本 -->
        <div class="loading-text">
          <h3 class="loading-title">
            {{ title }}
          </h3>
          <p
            v-if="message"
            class="loading-message"
          >
            {{ message }}
          </p>
        </div>

        <!-- 进度条 -->
        <div
          v-if="showProgress"
          class="loading-progress"
        >
          <el-progress
            :percentage="progress"
            :status="progressStatus"
            :stroke-width="4"
            :show-text="showProgressText"
          />
          <span
            v-if="progressText"
            class="progress-text"
          >{{ progressText }}</span>
        </div>

        <!-- 操作按钮 -->
        <div
          v-if="showActions"
          class="loading-actions"
        >
          <el-button
            v-if="cancellable"
            size="small"
            :loading="cancelling"
            @click="handleCancel"
          >
            取消
          </el-button>
          <el-button
            v-if="retryable"
            size="small"
            type="primary"
            @click="handleRetry"
          >
            重试
          </el-button>
        </div>
      </div>

      <!-- 背景点击遮罩 -->
      <div
        v-if="closeOnClickOutside"
        class="overlay-mask"
        @click="handleMaskClick"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Loading, Setting } from '@element-plus/icons-vue'

interface Props {
  /**
   * 是否显示
   */
  visible?: boolean

  /**
   * 加载标题
   */
  title?: string

  /**
   * 加载消息
   */
  message?: string

  /**
   * 图标类型
   */
  iconType?: 'spinner' | 'gear' | 'dots' | 'pulse'

  /**
   * 是否显示进度
   */
  showProgress?: boolean

  /**
   * 进度百分比
   */
  progress?: number

  /**
   * 进度状态
   */
  progressStatus?: 'success' | 'exception' | 'warning' | ''

  /**
   * 是否显示进度文本
   */
  showProgressText?: boolean

  /**
   * 进度文本
   */
  progressText?: string

  /**
   * 是否可取消
   */
  cancellable?: boolean

  /**
   * 是否可重试
   */
  retryable?: boolean

  /**
   * 是否显示操作按钮
   */
  showActions?: boolean

  /**
   * 点击外部关闭
   */
  closeOnClickOutside?: boolean

  /**
   * 主题类型
   */
  theme?: 'default' | 'dark' | 'glass'

  /**
   * 层级
   */
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: '加载中...',
  message: '',
  iconType: 'spinner',
  showProgress: false,
  progress: 0,
  progressStatus: '',
  showProgressText: false,
  progressText: '',
  cancellable: false,
  retryable: false,
  showActions: false,
  closeOnClickOutside: false,
  theme: 'default',
  zIndex: 9999
})

const emit = defineEmits<{
  cancel: []
  retry: []
  close: []
}>()

// 本地状态
const cancelling = ref(false)

// 计算属性
const overlayClasses = computed(() => [
  `theme-${props.theme}`,
  {
    'with-actions': props.showActions,
    'with-progress': props.showProgress
  }
])

// 方法
const handleCancel = async () => {
  if (cancelling.value) return

  cancelling.value = true
  try {
    emit('cancel')
  } finally {
    cancelling.value = false
  }
}

const handleRetry = () => {
  emit('retry')
}

const handleMaskClick = () => {
  if (props.closeOnClickOutside) {
    emit('close')
  }
}
</script>

<style scoped>
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: v-bind(zIndex);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease-out;
}

.overlay-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  cursor: pointer;
}

.loading-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-width: 280px;
  max-width: 400px;
  text-align: center;
}

/* 主题样式 */
.theme-default .loading-container {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.theme-dark .loading-container {
  background: rgba(0, 0, 0, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

.theme-glass .loading-container {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
}

.theme-default {
  background: rgba(0, 0, 0, 0.3);
}

.theme-dark {
  background: rgba(0, 0, 0, 0.7);
}

.theme-glass {
  background: rgba(0, 0, 0, 0.1);
}

/* 加载图标 */
.loading-icon {
  font-size: 48px;
  color: var(--el-color-primary);
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 点状加载器 */
.dots-loader {
  display: flex;
  gap: 4px;
}

.dots-loader span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--el-color-primary);
  animation: bounce 1.4s ease-in-out infinite both;
}

.dots-loader span:nth-child(1) { animation-delay: -0.32s; }
.dots-loader span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 脉冲加载器 */
.pulse-loader {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--el-color-primary);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/* 加载文本 */
.loading-text {
  max-width: 300px;
}

.loading-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
  color: inherit;
}

.loading-message {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.theme-dark .loading-message {
  color: rgba(255, 255, 255, 0.7);
}

/* 进度条 */
.loading-progress {
  width: 100%;
  max-width: 280px;
}

.progress-text {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.theme-dark .progress-text {
  color: rgba(255, 255, 255, 0.6);
}

/* 操作按钮 */
.loading-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.loading-container {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .loading-container {
    padding: 24px;
    min-width: 240px;
    margin: 0 16px;
  }

  .loading-title {
    font-size: 16px;
  }

  .loading-icon {
    font-size: 40px;
  }
}
</style>
