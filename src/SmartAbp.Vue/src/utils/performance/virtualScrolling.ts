// SmartAbp Enterprise Virtual Scrolling Performance Optimization
import { ref, computed, onMounted, onBeforeUnmount, type Ref } from 'vue'

/**
 * 企业级虚拟滚动Hook
 * 用于优化大量数据列表的渲染性能
 */
export interface VirtualScrollOptions {
  /** 每项高度（像素） */
  itemHeight: number
  /** 容器高度（像素） */
  containerHeight: number
  /** 预渲染缓冲区大小 */
  bufferSize?: number
  /** 滚动节流延迟（毫秒） */
  throttleDelay?: number
}

export interface VirtualScrollReturn<T> {
  /** 可见区域数据 */
  visibleItems: Ref<T[]>
  /** 滚动容器引用 */
  scrollContainer: Ref<HTMLElement | null>
  /** 滚动偏移量 */
  scrollTop: Ref<number>
  /** 总高度（用于滚动条） */
  totalHeight: Ref<number>
  /** 可见区域起始索引 */
  startIndex: Ref<number>
  /** 可见区域结束索引 */
  endIndex: Ref<number>
  /** 滚动到指定索引 */
   
  scrollToIndex: (_index: number) => void
  /** 更新数据源 */
   
  updateData: (_newData: T[]) => void
}

/**
 * 虚拟滚动实现
 */
export function useVirtualScroll<T>(
  data: Ref<T[]>,
  options: VirtualScrollOptions
): VirtualScrollReturn<T> {
  const {
    itemHeight,
    containerHeight,
    bufferSize = 5,
    throttleDelay = 16
  } = options

  // 响应式状态
  const scrollContainer = ref<HTMLElement | null>(null)
  const scrollTop = ref(0)
  const startIndex = ref(0)
  const endIndex = ref(0)

  // 计算属性
  const totalHeight = computed(() => data.value.length * itemHeight)
  const visibleItemCount = computed(() => Math.ceil(containerHeight / itemHeight))

  const visibleItems = computed(() => {
    const start = Math.max(0, startIndex.value - bufferSize)
    const end = Math.min(data.value.length, endIndex.value + bufferSize)
    return data.value.slice(start, end).map((item: T, index: number) => ({
      ...item,
      _virtualIndex: start + index,
      _transform: `translateY(${(start + index) * itemHeight}px)`
    }))
  })

  // 节流函数
  let throttleTimer: number | null = null
  const throttle = (fn: Function, delay: number) => {
    return (..._args: any[]) => {
      if (throttleTimer) return
      throttleTimer = window.setTimeout(() => {
        fn.apply(null, _args)
        throttleTimer = null
      }, delay)
    }
  }

  // 更新可见区域
  const updateVisibleRange = () => {
    const scrollValue = scrollTop.value
    const start = Math.floor(scrollValue / itemHeight)
    const end = Math.min(
      data.value.length,
      start + visibleItemCount.value
    )

    startIndex.value = start
    endIndex.value = end
  }

  // 节流的滚动处理
  const handleScroll = throttle(() => {
    if (!scrollContainer.value) return
    scrollTop.value = scrollContainer.value.scrollTop
    updateVisibleRange()
  }, throttleDelay)

  // 滚动到指定索引
  const scrollToIndex = (_index: number) => {
    if (!scrollContainer.value) return

    const targetScrollTop = _index * itemHeight
    scrollContainer.value.scrollTop = targetScrollTop
    scrollTop.value = targetScrollTop
    updateVisibleRange()
  }

  // 更新数据源
  const updateData = (_newData: T[]) => {
    data.value = _newData
    updateVisibleRange()
  }

  // 生命周期
  onMounted(() => {
    if (scrollContainer.value) {
      scrollContainer.value.addEventListener('scroll', handleScroll, {
        passive: true
      })
    }
    updateVisibleRange()
  })

  onBeforeUnmount(() => {
    if (scrollContainer.value) {
      scrollContainer.value.removeEventListener('scroll', handleScroll)
    }
    if (throttleTimer) {
      clearTimeout(throttleTimer)
    }
  })

  return {
    visibleItems,
    scrollContainer,
    scrollTop,
    totalHeight,
    startIndex,
    endIndex,
    scrollToIndex,
    updateData
  }
}

/**
 * 企业级表格虚拟滚动组件
 */
export interface VirtualTableOptions<T> {
  data: T[]
  itemHeight: number
  containerHeight: number
  showIndex?: boolean
  indexTitle?: string
  columns: Array<{
    key: string
    title: string
    width?: number
    align?: 'left' | 'center' | 'right'
     
    render?: (_value: any, _record: T, _index: number) => any
  }>
}

/**
 * 虚拟表格Hook
 */
export function useVirtualTable<T extends Record<string, any>>(
  data: Ref<T[]>,
  options: VirtualTableOptions<T>
) {
  const virtualScroll = useVirtualScroll(data, options)

  const { columns, showIndex = false, indexTitle = '#' } = options

  // 扩展列配置
  const enhancedColumns = computed(() => {
    const cols = [...columns]
    if (showIndex) {
      cols.unshift({
        key: '_index',
        title: indexTitle,
        width: 60,
        align: 'center' as const,
        render: (_: any, __: any, index: number) => index + 1
      })
    }
    return cols
  })

  return {
    ...virtualScroll,
    columns: enhancedColumns
  }
}

/**
 * 性能监控Hook
 */
export function usePerformanceMonitor() {
  const renderTimes = ref<number[]>([])
  const averageRenderTime = computed(() => {
    if (renderTimes.value.length === 0) return 0
    const sum = renderTimes.value.reduce((a, b) => a + b, 0)
    return sum / renderTimes.value.length
  })

  const recordRenderTime = (startTime: number) => {
    const endTime = performance.now()
    const renderTime = endTime - startTime

    renderTimes.value.push(renderTime)
    // 只保留最近100次记录
    if (renderTimes.value.length > 100) {
      renderTimes.value.shift()
    }

    // 性能警告
    if (renderTime > 50) {
      console.warn(`[Performance Warning] Slow render detected: ${renderTime.toFixed(2)}ms`)
    }
  }

  const startRenderTimer = () => performance.now()

  return {
    renderTimes,
    averageRenderTime,
    recordRenderTime,
    startRenderTimer
  }
}
