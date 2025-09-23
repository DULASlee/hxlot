<!--
SmartAbp Enterprise Lazy Loading Image Component
企业级懒加载图片组件 - 支持占位图、错误处理、响应式图片等特性
-->
<template>
  <div 
    ref="target"
    class="lazy-image-container"
    :class="{ 
      'is-loading': isLoading,
      'has-error': hasError,
      'is-loaded': hasLoaded && !hasError
    }"
  >
    <!-- 图片元素 -->
    <img
      v-if="currentSrc"
      :src="currentSrc"
      :alt="alt"
      :class="imageClass"
      :style="imageStyle"
      @load="handleLoad"
      @error="handleError"
    />
    
    <!-- 加载状态 -->
    <div v-if="isLoading && showLoadingIndicator" class="loading-indicator">
      <div class="loading-spinner"></div>
      <span v-if="loadingText" class="loading-text">{{ loadingText }}</span>
    </div>
    
    <!-- 错误状态 -->
    <div v-if="hasError && showErrorIndicator" class="error-indicator">
      <div class="error-icon">❌</div>
      <span v-if="errorText" class="error-text">{{ errorText }}</span>
      <button v-if="allowRetry" class="retry-button" @click="retry">
        重试
      </button>
    </div>
    
    <!-- 占位内容 -->
    <div v-if="!hasLoaded && !isLoading && !hasError && showPlaceholder" class="placeholder">
      <div class="placeholder-icon">🖼️</div>
      <span v-if="placeholderText" class="placeholder-text">{{ placeholderText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useLazyImage, type LazyImageOptions } from '@/utils/performance/lazyLoading'

interface Props {
  /** 图片源地址 */
  src: string
  /** 图片alt属性 */
  alt?: string
  /** 占位图片 */
  placeholder?: string
  /** 错误图片 */
  errorImage?: string
  /** 图片类名 */
  imageClass?: string
  /** 图片样式 */
  imageStyle?: Record<string, any>
  /** 是否显示加载指示器 */
  showLoadingIndicator?: boolean
  /** 加载文本 */
  loadingText?: string
  /** 是否显示错误指示器 */
  showErrorIndicator?: boolean
  /** 错误文本 */
  errorText?: string
  /** 是否允许重试 */
  allowRetry?: boolean
  /** 是否显示占位内容 */
  showPlaceholder?: boolean
  /** 占位文本 */
  placeholderText?: string
  /** 懒加载配置 */
  lazyOptions?: Partial<LazyImageOptions>
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  placeholder: '',
  errorImage: '',
  imageClass: '',
  imageStyle: () => ({}),
  showLoadingIndicator: true,
  loadingText: '加载中...',
  showErrorIndicator: true,
  errorText: '加载失败',
  allowRetry: true,
  showPlaceholder: true,
  placeholderText: '',
  lazyOptions: () => ({})
})

// 发射事件
const emit = defineEmits<{
  load: [event: Event]
  error: [event: Event]
  retry: []
}>()

// 合并懒加载选项
const lazyImageOptions = computed<LazyImageOptions>(() => ({
  placeholder: props.placeholder,
  errorImage: props.errorImage,
  optimizeQuality: true,
  rootMargin: '50px',
  threshold: 0.1,
  once: true,
  ...props.lazyOptions
}))

// 使用懒加载图片Hook
const {
  target,
  currentSrc,
  isVisible,
  isLoading,
  hasError,
  hasLoaded,
  reload
} = useLazyImage(props.src, lazyImageOptions.value)

// 方法
const handleLoad = (event: Event) => {
  emit('load', event)
}

const handleError = (event: Event) => {
  emit('error', event)
}

const retry = () => {
  emit('retry')
  reload()
}

// 如果图片在视口内，立即开始加载
onMounted(() => {
  // 检查是否在视口内
  if (target.value) {
    const rect = target.value.getBoundingClientRect()
    const isInViewport = (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    )
    
    if (isInViewport) {
      reload()
    }
  }
})
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  display: inline-block;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.lazy-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.lazy-image-container.is-loading img {
  opacity: 0.3;
}

.lazy-image-container.is-loaded img {
  opacity: 1;
}

.lazy-image-container.has-error img {
  display: none;
}

.loading-indicator,
.error-indicator,
.placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  text-align: center;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e4e7ed;
  border-top: 2px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text,
.error-text,
.placeholder-text {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.error-icon,
.placeholder-icon {
  font-size: 24px;
  opacity: 0.5;
}

.retry-button {
  margin-top: 8px;
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.retry-button:hover {
  border-color: #409eff;
  color: #409eff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-indicator,
  .error-indicator,
  .placeholder {
    padding: 8px;
  }
  
  .loading-text,
  .error-text,
  .placeholder-text {
    font-size: 11px;
  }
  
  .error-icon,
  .placeholder-icon {
    font-size: 20px;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .lazy-image-container {
    border: 1px solid #000;
  }
  
  .loading-text,
  .error-text,
  .placeholder-text {
    color: #000;
  }
  
  .retry-button {
    border-color: #000;
    color: #000;
  }
}

/* 减少动画模式支持 */
@media (prefers-reduced-motion: reduce) {
  .lazy-image-container,
  .lazy-image-container img,
  .retry-button {
    transition: none;
  }
  
  .loading-spinner {
    animation: none;
    border-top-color: #409eff;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .lazy-image-container {
    background-color: #2d2d2d;
  }
  
  .loading-text,
  .error-text,
  .placeholder-text {
    color: #a8a8a8;
  }
  
  .retry-button {
    background: #2d2d2d;
    border-color: #4a4a4a;
    color: #a8a8a8;
  }
  
  .retry-button:hover {
    border-color: #409eff;
    color: #409eff;
  }
}
</style>
