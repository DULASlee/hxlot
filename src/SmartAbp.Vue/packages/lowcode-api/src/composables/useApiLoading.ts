/**
 * API请求Loading状态管理Composable
 * 整合lowcode-shared的Loading管理和Element Plus Loading
 */

import { ref, computed } from 'vue'
import { ElLoading } from 'element-plus'
// import { useLoading } from '@smartabp/lowcode-shared'

/**
 * Loading显示选项
 */
export interface LoadingOptions {
  /** 是否显示全局Loading */
  showGlobal?: boolean
  /** Loading文本 */
  text?: string
  /** 目标元素（Element Plus） */
  target?: string | HTMLElement
  /** 是否锁定滚动 */
  lock?: boolean
  /** 背景颜色 */
  background?: string
  /** 自定义类名 */
  customClass?: string
  /** 是否全屏 */
  fullscreen?: boolean
}

/**
 * 默认Loading选项
 */
const DEFAULT_LOADING_OPTIONS: LoadingOptions = {
  showGlobal: false,
  text: '加载中...',
  lock: true,
  background: 'rgba(0, 0, 0, 0.7)',
  fullscreen: false
}

/**
 * API请求Loading状态跟踪
 */
interface LoadingTracker {
  /** 请求ID */
  id: string
  /** 请求描述 */
  description: string
  /** 开始时间 */
  startTime: number
  /** Loading实例（使用any避免Element Plus版本差异） */
  loadingInstance?: any
}

/**
 * API Loading管理Composable
 * 
 * @example
 * ```typescript
 * import { useApiLoading } from '@smartabp/lowcode-api'
 * 
 * const { isLoading, withLoading, startLoading, stopLoading } = useApiLoading()
 * 
 * // 方式1：自动包装
 * await withLoading(async () => {
 *   return await codeGeneratorApi.generateModule(config)
 * }, { text: '正在生成代码...' })
 * 
 * // 方式2：手动控制
 * const loadingId = startLoading({ text: '加载中...' })
 * try {
 *   await someApiCall()
 * } finally {
 *   stopLoading(loadingId)
 * }
 * ```
 */
export function useApiLoading() {
  // TODO: 使用lowcode-shared的useLoading（待lowcode-shared完善后启用）
  // const { 
  //   isLoading: isBaseLoading, 
  //   startLoading: baseStartLoading, 
  //   stopLoading: baseStopLoading 
  // } = useLoading()
  const isBaseLoading = ref(false)
  const baseStartLoading = () => { isBaseLoading.value = true }
  const baseStopLoading = () => { isBaseLoading.value = false }

  // Loading跟踪器
  const loadingTrackers = ref<Map<string, LoadingTracker>>(new Map())
  
  // Element Plus Loading实例池（使用any避免版本差异）
  const globalLoadingInstances = ref<any[]>([])

  /**
   * 是否有任何Loading
   */
  const isLoading = computed(() => {
    return isBaseLoading.value || loadingTrackers.value.size > 0
  })

  /**
   * 当前活跃的Loading数量
   */
  const activeLoadingCount = computed(() => {
    return loadingTrackers.value.size
  })

  /**
   * 生成Loading ID
   */
  const generateLoadingId = (): string => {
    return `loading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 开始Loading
   * @param options Loading选项
   * @param description Loading描述（用于调试）
   * @returns Loading ID
   */
  const startLoading = (
    options: LoadingOptions = {},
    description = 'API Request'
  ): string => {
    const id = generateLoadingId()
    const opts = { ...DEFAULT_LOADING_OPTIONS, ...options }

    // 更新基础Loading状态
    baseStartLoading()

    // 创建Element Plus Loading实例
    let loadingInstance: any | undefined

    if (opts.showGlobal) {
      loadingInstance = ElLoading.service({
        lock: opts.lock,
        text: opts.text,
        background: opts.background,
        target: opts.target,
        customClass: opts.customClass,
        fullscreen: opts.fullscreen
      })
      
      globalLoadingInstances.value.push(loadingInstance)
    }

    // 记录Loading跟踪器
    const tracker: LoadingTracker = {
      id,
      description,
      startTime: Date.now(),
      loadingInstance
    }

    loadingTrackers.value.set(id, tracker)

    return id
  }

  /**
   * 停止Loading
   * @param loadingId Loading ID
   */
  const stopLoading = (loadingId: string): void => {
    const tracker = loadingTrackers.value.get(loadingId)
    
    if (!tracker) {
      console.warn(`Loading ID ${loadingId} not found`)
      return
    }

    // 关闭Element Plus Loading实例
    if (tracker.loadingInstance) {
      tracker.loadingInstance.close()
      const index = globalLoadingInstances.value.indexOf(tracker.loadingInstance)
      if (index > -1) {
        globalLoadingInstances.value.splice(index, 1)
      }
    }

    // 移除跟踪器
    loadingTrackers.value.delete(loadingId)

    // 更新基础Loading状态
    baseStopLoading()

    // 调试信息
    const duration = Date.now() - tracker.startTime
    if (duration > 5000) {
      console.warn(`Long loading detected: ${tracker.description} took ${duration}ms`)
    }
  }

  /**
   * 停止所有Loading
   */
  const stopAllLoading = (): void => {
    // 关闭所有Element Plus Loading实例
    globalLoadingInstances.value.forEach(instance => {
      instance.close()
    })
    globalLoadingInstances.value = []

    // 清空跟踪器
    loadingTrackers.value.clear()

    // 重置基础Loading状态
    while (isBaseLoading.value) {
      baseStopLoading()
    }
  }

  /**
   * 包装异步函数，自动管理Loading状态
   * @param fn 异步函数
   * @param options Loading选项
   * @param description Loading描述
   * @returns 异步函数的返回值
   */
  const withLoading = async <T>(
    fn: () => Promise<T>,
    options: LoadingOptions = {},
    description = 'API Request'
  ): Promise<T> => {
    const loadingId = startLoading(options, description)
    
    try {
      return await fn()
    } finally {
      stopLoading(loadingId)
    }
  }

  /**
   * 获取当前所有Loading的描述信息（用于调试）
   */
  const getActiveLoadings = (): Array<{
    id: string
    description: string
    duration: number
  }> => {
    const now = Date.now()
    return Array.from(loadingTrackers.value.values()).map(tracker => ({
      id: tracker.id,
      description: tracker.description,
      duration: now - tracker.startTime
    }))
  }

  /**
   * 检查是否存在长时间运行的Loading（超过10秒）
   */
  const hasLongRunningLoading = (): boolean => {
    const now = Date.now()
    return Array.from(loadingTrackers.value.values()).some(
      tracker => now - tracker.startTime > 10000
    )
  }

  return {
    // 状态
    isLoading,
    activeLoadingCount,
    
    // 方法
    startLoading,
    stopLoading,
    stopAllLoading,
    withLoading,
    
    // 调试方法
    getActiveLoadings,
    hasLongRunningLoading
  }
}

/**
 * 创建带Loading的API调用包装器
 * 
 * @example
 * ```typescript
 * import { createLoadingWrapper } from '@smartabp/lowcode-api'
 * 
 * const callApiWithLoading = createLoadingWrapper({
 *   text: '正在处理...',
 *   showGlobal: true
 * })
 * 
 * const result = await callApiWithLoading(
 *   () => codeGeneratorApi.generateModule(config)
 * )
 * ```
 */
export function createLoadingWrapper(defaultOptions: LoadingOptions = {}) {
  const { withLoading } = useApiLoading()

  return async <T>(
    fn: () => Promise<T>,
    options?: LoadingOptions,
    description?: string
  ): Promise<T> => {
    return withLoading(
      fn,
      { ...defaultOptions, ...options },
      description
    )
  }
}

