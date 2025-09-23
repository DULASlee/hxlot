// SmartAbp Enterprise Lazy Loading Performance Optimization
import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'

/**
 * 企业级懒加载Hook
 */
export interface LazyLoadOptions {
  /** 根元素边距（触发加载的距离） */
  rootMargin?: string
  /** 可见性阈值 */
  threshold?: number | number[]
  /** 是否只触发一次 */
  once?: boolean
  /** 延迟时间（毫秒） */
  delay?: number
}

export interface LazyLoadReturn {
  /** 目标元素引用 */
  target: Ref<HTMLElement | null>
  /** 是否可见 */
  isVisible: Ref<boolean>
  /** 是否已经加载过 */
  hasLoaded: Ref<boolean>
  /** 手动触发加载 */
  load: () => void
}

/**
 * 懒加载实现
 */
export function useLazyLoad(
  callback: () => void | Promise<void>,
  options: LazyLoadOptions = {}
): LazyLoadReturn {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    once = true,
    delay = 0
  } = options

  const target = ref<HTMLElement | null>(null)
  const isVisible = ref(false)
  const hasLoaded = ref(false)
  
  let observer: IntersectionObserver | null = null
  let delayTimer: number | null = null

  const load = async () => {
    if (hasLoaded.value && once) return
    
    hasLoaded.value = true
    try {
      await callback()
    } catch (error) {
      console.error('[LazyLoad] Load failed:', error)
      hasLoaded.value = false // 允许重试
    }
  }

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      isVisible.value = entry.isIntersecting
      
      if (entry.isIntersecting) {
        if (delay > 0) {
          delayTimer = window.setTimeout(load, delay)
        } else {
          load()
        }
        
        if (once && observer) {
          observer.unobserve(entry.target)
        }
      } else if (delayTimer) {
        clearTimeout(delayTimer)
        delayTimer = null
      }
    })
  }

  onMounted(() => {
    if (target.value && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(handleIntersection, {
        rootMargin,
        threshold
      })
      observer.observe(target.value)
    }
  })

  onBeforeUnmount(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    if (delayTimer) {
      clearTimeout(delayTimer)
    }
  })

  return {
    target,
    isVisible,
    hasLoaded,
    load
  }
}

/**
 * 图片懒加载Hook
 */
export interface LazyImageOptions extends LazyLoadOptions {
  /** 占位图片 */
  placeholder?: string
  /** 错误图片 */
  errorImage?: string
  /** 图片质量优化 */
  optimizeQuality?: boolean
  /** 响应式图片大小 */
  responsiveSizes?: Record<string, string>
}

export function useLazyImage(
  src: string,
  options: LazyImageOptions = {}
) {
  const {
    placeholder = '',
    errorImage = '',
    optimizeQuality = true,
    responsiveSizes = {},
    ...lazyOptions
  } = options

  const currentSrc = ref(placeholder)
  const isLoading = ref(false)
  const hasError = ref(false)

  const loadImage = async () => {
    if (isLoading.value) return
    
    isLoading.value = true
    hasError.value = false

    try {
      // 根据屏幕大小选择合适的图片
      let targetSrc = src
      if (Object.keys(responsiveSizes).length > 0) {
        const screenWidth = window.innerWidth
        for (const [breakpoint, imgSrc] of Object.entries(responsiveSizes)) {
          if (screenWidth <= parseInt(breakpoint)) {
            targetSrc = imgSrc
            break
          }
        }
      }

      // 预加载图片
      const img = new Image()
      
      // 图片质量优化
      if (optimizeQuality) {
        img.loading = 'lazy'
        img.decoding = 'async'
      }

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Image load failed'))
        img.src = targetSrc
      })

      currentSrc.value = targetSrc
    } catch (error) {
      console.error('[LazyImage] Load failed:', error)
      hasError.value = true
      if (errorImage) {
        currentSrc.value = errorImage
      }
    } finally {
      isLoading.value = false
    }
  }

  const { target, isVisible, hasLoaded } = useLazyLoad(loadImage, lazyOptions)

  return {
    target,
    currentSrc,
    isVisible,
    isLoading,
    hasError,
    hasLoaded,
    reload: loadImage
  }
}

/**
 * 组件懒加载Hook
 */
export function useLazyComponent<T>(
  loader: () => Promise<T>,
  options: LazyLoadOptions = {}
) {
  const component = ref<T | null>(null)
  const isLoading = ref(false)
  const hasError = ref(false)
  const error = ref<Error | null>(null)

  const loadComponent = async () => {
    if (isLoading.value || component.value) return

    isLoading.value = true
    hasError.value = false
    error.value = null

    try {
      const loaded = await loader()
      component.value = loaded
    } catch (err) {
      console.error('[LazyComponent] Load failed:', err)
      hasError.value = true
      error.value = err as Error
    } finally {
      isLoading.value = false
    }
  }

  const { target, isVisible, hasLoaded } = useLazyLoad(loadComponent, options)

  return {
    target,
    component,
    isVisible,
    isLoading,
    hasError,
    error,
    hasLoaded,
    retry: loadComponent
  }
}

/**
 * 无限滚动Hook
 */
export interface InfiniteScrollOptions {
  /** 距离底部多少像素时触发加载 */
  distance?: number
  /** 是否立即检查 */
  immediate?: boolean
  /** 是否禁用 */
  disabled?: boolean
}

export function useInfiniteScroll(
  loader: () => Promise<boolean>, // 返回是否还有更多数据
  options: InfiniteScrollOptions = {}
) {
  const {
    distance = 100,
    immediate = true,
    disabled = false
  } = options

  const target = ref<HTMLElement | null>(null)
  const isLoading = ref(false)
  const isFinished = ref(false)
  const hasError = ref(false)

  const load = async () => {
    if (isLoading.value || isFinished.value || disabled) return

    isLoading.value = true
    hasError.value = false

    try {
      const hasMore = await loader()
      if (!hasMore) {
        isFinished.value = true
      }
    } catch (error) {
      console.error('[InfiniteScroll] Load failed:', error)
      hasError.value = true
    } finally {
      isLoading.value = false
    }
  }

  const checkAndLoad = () => {
    if (!target.value) return

    const { scrollTop, scrollHeight, clientHeight } = target.value
    const distanceToBottom = scrollHeight - scrollTop - clientHeight

    if (distanceToBottom <= distance) {
      load()
    }
  }

  let throttleTimer: number | null = null
  const handleScroll = () => {
    if (throttleTimer) return
    
    throttleTimer = window.setTimeout(() => {
      checkAndLoad()
      throttleTimer = null
    }, 100) // 节流100ms
  }

  onMounted(() => {
    if (target.value) {
      target.value.addEventListener('scroll', handleScroll, { passive: true })
      
      if (immediate) {
        load()
      }
    }
  })

  onBeforeUnmount(() => {
    if (target.value) {
      target.value.removeEventListener('scroll', handleScroll)
    }
    if (throttleTimer) {
      clearTimeout(throttleTimer)
    }
  })

  return {
    target,
    isLoading,
    isFinished,
    hasError,
    load: () => load(),
    reset: () => {
      isFinished.value = false
      hasError.value = false
    }
  }
}
