<template>
  <div v-if="shouldShow" :class="bannerClass" class="version-warning-banner">
    <div class="banner-icon">
      <span v-if="isError">⚠️</span>
      <span v-else-if="isWarning">⚡</span>
      <span v-else>ℹ️</span>
    </div>
    
    <div class="banner-content">
      <div class="banner-title">{{ title }}</div>
      <div class="banner-message">{{ message }}</div>
      <div v-if="details" class="banner-details">{{ details }}</div>
    </div>
    
    <div class="banner-actions">
      <button
        v-if="needAction && actionText"
        class="banner-action-primary"
        @click="handleAction"
      >
        {{ actionText }}
      </button>
      <button
        class="banner-action-secondary"
        @click="handleDismiss"
      >
        {{ dismissText }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CompatibilityResult } from './SchemaVersionManager'
import { VersionCompatibility } from './SchemaVersionManager'

/**
 * 组件Props
 */
interface Props {
  /** 兼容性检查结果 */
  compatibilityResult: CompatibilityResult | null
  /** 自动显示 */
  autoShow?: boolean
  /** 可关闭 */
  dismissable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoShow: true,
  dismissable: true
})

/**
 * 组件Emits
 */
interface Emits {
  /** 执行操作 */
  (e: 'action', result: CompatibilityResult): void
  /** 关闭横幅 */
  (e: 'dismiss'): void
}

const emit = defineEmits<Emits>()

/** 是否已关闭 */
const isDismissed = ref(false)

/** 是否应该显示 */
const shouldShow = computed(() => {
  if (!props.compatibilityResult) return false
  if (isDismissed.value) return false
  if (!props.autoShow) return false
  
  // 兼容状态不显示
  if (props.compatibilityResult.status === VersionCompatibility.COMPATIBLE) {
    return false
  }
  
  return true
})

/** 是否为错误级别 */
const isError = computed(() => {
  return props.compatibilityResult?.status === VersionCompatibility.INCOMPATIBLE
})

/** 是否为警告级别 */
const isWarning = computed(() => {
  const status = props.compatibilityResult?.status
  return (
    status === VersionCompatibility.NEED_UPGRADE ||
    status === VersionCompatibility.NEED_DOWNGRADE
  )
})

/** 横幅样式类 */
const bannerClass = computed(() => {
  if (isError.value) return 'banner-error'
  if (isWarning.value) return 'banner-warning'
  return 'banner-info'
})

/** 标题 */
const title = computed(() => {
  if (!props.compatibilityResult) return ''
  
  switch (props.compatibilityResult.status) {
    case VersionCompatibility.INCOMPATIBLE:
      return 'Schema版本不兼容'
    case VersionCompatibility.NEED_UPGRADE:
      return 'Schema版本升级'
    case VersionCompatibility.NEED_DOWNGRADE:
      return 'Schema版本警告'
    default:
      return 'Schema版本提示'
  }
})

/** 消息 */
const message = computed(() => {
  return props.compatibilityResult?.message || ''
})

/** 详细信息 */
const details = computed(() => {
  return props.compatibilityResult?.details
})

/** 是否需要操作 */
const needAction = computed(() => {
  return props.compatibilityResult?.needAction || false
})

/** 操作按钮文本 */
const actionText = computed(() => {
  if (!needAction.value) return ''
  
  switch (props.compatibilityResult?.status) {
    case VersionCompatibility.NEED_UPGRADE:
      return '立即刷新'
    case VersionCompatibility.INCOMPATIBLE:
      return '强制刷新'
    default:
      return '刷新页面'
  }
})

/** 关闭按钮文本 */
const dismissText = computed(() => {
  return needAction.value ? '稍后处理' : '我知道了'
})

/** 处理操作 */
function handleAction() {
  if (props.compatibilityResult) {
    emit('action', props.compatibilityResult)
    
    // 默认操作: 刷新页面
    if (needAction.value) {
      window.location.reload()
    }
  }
}

/** 处理关闭 */
function handleDismiss() {
  if (props.dismissable) {
    isDismissed.value = true
    emit('dismiss')
  }
}
</script>

<style scoped>
.version-warning-banner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.banner-error {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
}

.banner-warning {
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
}

.banner-info {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
}

.banner-icon {
  font-size: 24px;
  line-height: 1;
}

.banner-content {
  flex: 1;
}

.banner-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
  color: #262626;
}

.banner-message {
  font-size: 14px;
  color: #595959;
  margin-bottom: 4px;
}

.banner-details {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 8px;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
}

.banner-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.banner-action-primary,
.banner-action-secondary {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.banner-action-primary {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.banner-action-primary:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.banner-error .banner-action-primary {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
}

.banner-error .banner-action-primary:hover {
  background-color: #ff7875;
  border-color: #ff7875;
}

.banner-warning .banner-action-primary {
  background-color: #faad14;
  border-color: #faad14;
}

.banner-warning .banner-action-primary:hover {
  background-color: #ffc53d;
  border-color: #ffc53d;
}

.banner-action-secondary {
  background-color: white;
  color: #595959;
  border-color: #d9d9d9;
}

.banner-action-secondary:hover {
  color: #1890ff;
  border-color: #1890ff;
}
</style>

