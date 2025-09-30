import { ref, watch, nextTick, onUnmounted, computed } from "vue"
import type { Ref } from "vue"
import { ElMessage } from "element-plus"

/**
 * Enhanced Performance Optimizer with comprehensive error handling
 */

// Error types for different performance operations
class PerformanceError extends Error {
  constructor(
    message: string,
    public code: string,
    public operation: string,
    public retryable = false,
    public details?: any,
  ) {
    super(message)
    this.name = "PerformanceError"
  }
}

// Error handling utilities
const logPerformanceError = (operation: string, error: any, context?: any): void => {
  console.error(`[PerformanceOptimizer] ${operation} failed:`, {
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
    context,
    timestamp: new Date().toISOString(),
  })
}

const showPerformanceWarning = (message: string, details?: string): void => {
  ElMessage.warning({
    message: `Performance Warning: ${message}${details ? ` - ${details}` : ""}`,
    duration: 4000,
    showClose: true,
  })
}

const validateNumber = (value: any, fieldName: string, min?: number, max?: number): number => {
  if (typeof value !== "number" || isNaN(value)) {
    throw new PerformanceError(
      `${fieldName} must be a valid number`,
      "VALIDATION_ERROR",
      "validateNumber",
      false,
      { field: fieldName, value, type: typeof value },
    )
  }

  if (min !== undefined && value < min) {
    throw new PerformanceError(
      `${fieldName} must be at least ${min}`,
      "VALIDATION_ERROR",
      "validateNumber",
      false,
      { field: fieldName, value, min },
    )
  }

  if (max !== undefined && value > max) {
    throw new PerformanceError(
      `${fieldName} must be at most ${max}`,
      "VALIDATION_ERROR",
      "validateNumber",
      false,
      { field: fieldName, value, max },
    )
  }

  return value
}

const validateFunction = (value: any, fieldName: string): Function => {
  if (typeof value !== "function") {
    throw new PerformanceError(
      `${fieldName} must be a function`,
      "VALIDATION_ERROR",
      "validateFunction",
      false,
      { field: fieldName, type: typeof value },
    )
  }
  return value
}

const safeRequestAnimationFrame = (callback: (time: number) => void): number => {
  try {
    return requestAnimationFrame(callback)
  } catch (error) {
    logPerformanceError("requestAnimationFrame", error)
    // Fallback to setTimeout
    return window.setTimeout(() => callback(performance.now()), 16) as unknown as number
  }
}

// removed unused safeCancelAnimationFrame to satisfy noUnusedLocals

// Memory Monitor with error handling
export class MemoryMonitor {
  private isSupported = false
  private listeners: Array<(info: any) => void> = []
  private monitoring = false
  private intervalId: number | null = null
  private lastMemoryInfo: any = null

  constructor() {
    try {
      this.isSupported = !!((performance as unknown as { memory?: unknown }).memory)
      if (!this.isSupported) {
        console.warn("[MemoryMonitor] Memory API not supported in this browser")
      }
    } catch (error) {
      logPerformanceError("MemoryMonitor.constructor", error)
      this.isSupported = false
    }
  }

  getMemoryInfo() {
    try {
      if (!this.isSupported) {
        return {
          usedJSHeapSize: 0,
          totalJSHeapSize: 0,
          jsHeapSizeLimit: 0,
          supported: false,
        }
      }

      const memory = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory
      const info = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        supported: true,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
        timestamp: Date.now(),
      }

      this.lastMemoryInfo = info
      return info
    } catch (error) {
      logPerformanceError("getMemoryInfo", error)
      return (
        this.lastMemoryInfo || {
          usedJSHeapSize: 0,
          totalJSHeapSize: 0,
          jsHeapSizeLimit: 0,
          supported: false,
        }
      )
    }
  }

  startMonitoring(interval = 5000) {
    try {
      if (this.monitoring) {
        return
      }

      interval = validateNumber(interval, "interval", 1000, 60000) // 1s to 60s
      this.monitoring = true

      const monitor = () => {
        try {
          const info = this.getMemoryInfo()

          // Check for memory pressure
          if (info.supported && info.usagePercentage > 80) {
            showPerformanceWarning(
              "High memory usage detected",
              `${info.usagePercentage.toFixed(1)}% of heap used`,
            )
          }

          this.listeners.forEach((listener) => {
            try {
              listener(info)
            } catch (error) {
              logPerformanceError("memoryListener", error)
            }
          })
        } catch (error) {
          logPerformanceError("memoryMonitor", error)
        }
      }

      monitor() // Initial check
      this.intervalId = window.setInterval(monitor, interval)
    } catch (error) {
      logPerformanceError("startMonitoring", error)
    }
  }

  stopMonitoring() {
    try {
      this.monitoring = false
      if (this.intervalId) {
        clearInterval(this.intervalId)
        this.intervalId = null
      }
    } catch (error) {
      logPerformanceError("stopMonitoring", error)
    }
  }

  onMemoryUpdate(listener: (info: any) => void) {
    try {
      validateFunction(listener, "listener")
      this.listeners.push(listener)
    } catch (error) {
      logPerformanceError("onMemoryUpdate", error)
    }
  }

  removeMemoryListener(listener: (info: any) => void) {
    try {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    } catch (error) {
      logPerformanceError("removeMemoryListener", error)
    }
  }
}

// Auto Cleanup Decorator with error handling
export function AutoCleanup<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    cleanupFunctions: Array<() => void> = []
    originalUnmount: (() => void) | null = null

    constructor(...args: any[]) {
      super(...args)

      try {
        // Store original unmount if it exists
        const componentInstance = this as unknown as { $options?: { beforeUnmount?: () => void } }
        if (typeof componentInstance.$options?.beforeUnmount === "function") {
          this.originalUnmount = componentInstance.$options.beforeUnmount
        }

        // Override unmount to run cleanup
        componentInstance.$options = {
          ...componentInstance.$options,
          beforeUnmount: () => {
            this.runCleanup()
            if (this.originalUnmount) {
              this.originalUnmount.call(this)
            }
          },
        }
      } catch (error) {
        logPerformanceError("AutoCleanup.constructor", error)
      }
    }

    registerCleanup(cleanupFn: () => void) {
      try {
        validateFunction(cleanupFn, "cleanupFn")
        this.cleanupFunctions.push(cleanupFn)
      } catch (error) {
        logPerformanceError("registerCleanup", error)
      }
    }

    runCleanup() {
      try {
        this.cleanupFunctions.forEach((fn, index) => {
          try {
            fn()
          } catch (error) {
            logPerformanceError(`cleanupFunction[${index}]`, error)
          }
        })
        this.cleanupFunctions = []
      } catch (error) {
        logPerformanceError("runCleanup", error)
      }
    }
  }
}

// Enhanced Debounced Watch with error handling
export function useDebouncedWatch<T>(
  source: Ref<T> | (() => T),
  callback: (newValue: T, oldValue: T | undefined) => void,
  delay = 300,
) {
  try {
    delay = validateNumber(delay, "delay", 0, 10000) // 0ms to 10s
    validateFunction(callback, "callback")

    let timeoutId: number | null = null
    // let lastValue: T | undefined = undefined

    const debouncedCallback = (newValue: T, oldValue: T | undefined) => {
      try {
        if (timeoutId) {
          window.clearTimeout(timeoutId)
        }

        timeoutId = window.setTimeout(() => {
          try {
            callback(newValue, oldValue)
            // lastValue = newValue
            timeoutId = null
          } catch (error) {
            logPerformanceError("debouncedCallback", error)
          }
        }, delay)
      } catch (error) {
        logPerformanceError("debouncedCallback.setup", error)
      }
    }

    const stop = watch(source, (newValue, oldValue) => {
      try {
        debouncedCallback(newValue, oldValue)
      } catch (error) {
        logPerformanceError("watch", error)
      }
    })

    // Cleanup on unmount
    onUnmounted(() => {
      try {
        if (timeoutId) {
          window.clearTimeout(timeoutId)
        }
        stop()
      } catch (error) {
        logPerformanceError("useDebouncedWatch.cleanup", error)
      }
    })

    return stop
  } catch (error) {
    logPerformanceError("useDebouncedWatch", error)
    // Return dummy stop function
    return () => {}
  }
}

// Enhanced Batch Update with error handling
export function useBatchUpdate<T>(callback: (updates: T[]) => void, delay = 16) {
  try {
    delay = validateNumber(delay, "delay", 0, 1000) // 0ms to 1s
    validateFunction(callback, "callback")

    const pendingUpdates: T[] = []
    let timeoutId: number | null = null
    let isProcessing = false

    const processBatch = async () => {
      try {
        if (isProcessing || pendingUpdates.length === 0) {
          return
        }

        isProcessing = true
        const updates = [...pendingUpdates]
        pendingUpdates.length = 0

        await nextTick()
        callback(updates)

        isProcessing = false
      } catch (error) {
        isProcessing = false
        logPerformanceError("processBatch", error)
        showPerformanceWarning(
          "Batch update failed",
          error instanceof Error ? error.message : "Unknown error",
        )
      }
    }

    const addUpdate = (update: T) => {
      try {
        pendingUpdates.push(update)

        if (timeoutId) {
          window.clearTimeout(timeoutId)
        }

        timeoutId = window.setTimeout(processBatch, delay)
      } catch (error) {
        logPerformanceError("addUpdate", error)
      }
    }

    const flush = () => {
      try {
        if (timeoutId) {
          window.clearTimeout(timeoutId)
          timeoutId = null
        }
        processBatch()
      } catch (error) {
        logPerformanceError("flush", error)
      }
    }

    // Cleanup on unmount
    onUnmounted(() => {
      try {
        if (timeoutId) {
          window.clearTimeout(timeoutId)
        }
        flush()
      } catch (error) {
        logPerformanceError("useBatchUpdate.cleanup", error)
      }
    })

    return { addUpdate, flush }
  } catch (error) {
    logPerformanceError("useBatchUpdate", error)
    // Return dummy functions
    return { addUpdate: () => {}, flush: () => {} }
  }
}

// Enhanced Virtual Scroll with error handling
export function useVirtualScroll<T>(
  items: Ref<T[]>,
  itemHeight: number,
  containerHeight: number,
  options: {
    buffer?: number
    onScroll?: (info: { startIndex: number; endIndex: number; visibleCount: number }) => void
  } = {},
) {
  try {
    itemHeight = validateNumber(itemHeight, "itemHeight", 1, 1000) // 1px to 1000px
    containerHeight = validateNumber(containerHeight, "containerHeight", 1, 10000) // 1px to 10000px

    const buffer = validateNumber(options.buffer ?? 5, "buffer", 0, 50)

    const scrollTop = ref(0)
    const startIndex = ref(0)
    const endIndex = ref(0)
    const visibleCount = ref(0)
    const totalHeight = ref(0)

    const calculateVisibleRange = () => {
      try {
        const itemsCount = items.value.length
        if (itemsCount === 0) {
          startIndex.value = 0
          endIndex.value = 0
          visibleCount.value = 0
          totalHeight.value = 0
          return
        }

        const scrollOffset = Math.max(0, scrollTop.value)
        const newStartIndex = Math.max(0, Math.floor(scrollOffset / itemHeight) - buffer)
        const newVisibleCount = Math.ceil(containerHeight / itemHeight) + 2 * buffer
        const newEndIndex = Math.min(itemsCount, newStartIndex + newVisibleCount)

        startIndex.value = newStartIndex
        endIndex.value = newEndIndex
        visibleCount.value = newEndIndex - newStartIndex
        totalHeight.value = itemsCount * itemHeight

        // Notify scroll callback
        if (options.onScroll) {
          try {
            options.onScroll({
              startIndex: startIndex.value,
              endIndex: endIndex.value,
              visibleCount: visibleCount.value,
            })
          } catch (callbackError) {
            logPerformanceError("scrollCallback", callbackError)
          }
        }
      } catch (error) {
        logPerformanceError("calculateVisibleRange", error)
      }
    }

    const handleScroll = (event: Event) => {
      try {
        const target = event.target as HTMLElement
        if (target) {
          scrollTop.value = target.scrollTop
          calculateVisibleRange()
        }
      } catch (error) {
        logPerformanceError("handleScroll", error)
      }
    }

    // Watch for items changes
    watch(
      items,
      () => {
        try {
          calculateVisibleRange()
        } catch (error) {
          logPerformanceError("items.watch", error)
        }
      },
      { immediate: true },
    )

    // Watch for scroll position changes
    watch(scrollTop, () => {
      try {
        calculateVisibleRange()
      } catch (error) {
        logPerformanceError("scrollTop.watch", error)
      }
    })

    return {
      scrollTop,
      startIndex,
      endIndex,
      visibleCount,
      totalHeight,
      handleScroll,
      visibleItems: computed(() => {
        try {
          return items.value.slice(startIndex.value, endIndex.value)
        } catch (error) {
          logPerformanceError("visibleItems.computed", error)
          return []
        }
      }),
      offsetY: computed(() => startIndex.value * itemHeight),
      scrollToIndex: (index: number) => {
        try {
          index = validateNumber(index, "index", 0, items.value.length - 1)
          scrollTop.value = index * itemHeight
          calculateVisibleRange()
        } catch (error) {
          logPerformanceError("scrollToIndex", error)
        }
      },
    }
  } catch (error) {
    logPerformanceError("useVirtualScroll", error)
    // Return safe defaults
    return {
      scrollTop: ref(0),
      startIndex: ref(0),
      endIndex: ref(0),
      visibleCount: ref(0),
      totalHeight: ref(0),
      handleScroll: () => {},
      visibleItems: computed(() => []),
      offsetY: computed(() => 0),
      scrollToIndex: () => {},
    }
  }
}

// Enhanced API Cache with error handling
export class ApiCache {
  private cache = new Map<string, { data: any; expiresAt: number; retryCount: number }>()
  private stats = { hits: 0, misses: 0, errors: 0, evictions: 0 }
  private cleanupInterval: number | null = null

  constructor(
    private defaultTTL = 5 * 60 * 1000, // 5 minutes
    private maxRetryCount = 3,
  ) {
    try {
      this.defaultTTL = validateNumber(defaultTTL, "defaultTTL", 1000, 60 * 60 * 1000) // 1s to 1h
      this.maxRetryCount = validateNumber(maxRetryCount, "maxRetryCount", 0, 10)

      // Start periodic cleanup
      this.startCleanup()
    } catch (error) {
      logPerformanceError("ApiCache.constructor", error)
    }
  }

  private startCleanup() {
    try {
      this.cleanupInterval = window.setInterval(() => {
        this.cleanup()
      }, 60000) // Clean up every minute
    } catch (error) {
      logPerformanceError("startCleanup", error)
    }
  }

  private cleanup() {
    try {
      const now = Date.now()
      let evictedCount = 0

      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key)
          evictedCount++
        }
      }

      this.stats.evictions += evictedCount
    } catch (error) {
      logPerformanceError("cleanup", error)
    }
  }

  async get<T>(key: string, fetcher: () => Promise<T>, ttl = this.defaultTTL): Promise<T> {
    try {
      ttl = validateNumber(ttl, "ttl", 1000, 60 * 60 * 1000) // 1s to 1h

      const existing = this.cache.get(key)
      if (existing && Date.now() < existing.expiresAt) {
        this.stats.hits++
        return existing.data
      }

      this.stats.misses++

      try {
        const data = await fetcher()
        this.set(key, data, ttl)
        return data
      } catch (error) {
        this.stats.errors++

        // Retry with existing data if available and not too old
        if (existing && existing.retryCount < this.maxRetryCount) {
          existing.retryCount++
          existing.expiresAt = Date.now() + ttl / 2 // Shorter TTL for stale data
          showPerformanceWarning(
            "Using stale cache data due to fetch error",
            error instanceof Error ? error.message : "Unknown error",
          )
          return existing.data
        }

        throw error
      }
    } catch (error) {
      logPerformanceError("ApiCache.get", error, { key })
      throw error
    }
  }

  set<T>(key: string, data: T, ttl = this.defaultTTL): void {
    try {
      ttl = validateNumber(ttl, "ttl", 1000, 60 * 60 * 1000) // 1s to 1h

      this.cache.set(key, {
        data,
        expiresAt: Date.now() + ttl,
        retryCount: 0,
      })
    } catch (error) {
      logPerformanceError("ApiCache.set", error, { key })
    }
  }

  delete(key: string): boolean {
    try {
      return this.cache.delete(key)
    } catch (error) {
      logPerformanceError("ApiCache.delete", error, { key })
      return false
    }
  }

  clear(): void {
    try {
      this.cache.clear()
      this.stats = { hits: 0, misses: 0, errors: 0, evictions: 0 }
    } catch (error) {
      logPerformanceError("ApiCache.clear", error)
    }
  }

  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRatio:
        this.stats.hits + this.stats.misses > 0
          ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
          : 0,
    }
  }

  destroy() {
    try {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval)
        this.cleanupInterval = null
      }
      this.clear()
    } catch (error) {
      logPerformanceError("ApiCache.destroy", error)
    }
  }
}

// Enhanced Request Deduplicator with error handling
export class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>()
  private stats = { deduplications: 0, errors: 0 }

  async deduplicate<T>(
    key: string,
    request: () => Promise<T>,
    options: {
      ttl?: number
      onDeduplicate?: () => void
    } = {},
  ): Promise<T> {
    try {
      if (!key || typeof key !== "string") {
        throw new PerformanceError(
          "Request key must be a non-empty string",
          "VALIDATION_ERROR",
          "deduplicate",
          false,
          { key, type: typeof key },
        )
      }

      const existingRequest = this.pendingRequests.get(key)
      if (existingRequest) {
        this.stats.deduplications++

        if (options.onDeduplicate) {
          try {
            options.onDeduplicate()
          } catch (callbackError) {
            logPerformanceError("onDeduplicate", callbackError)
          }
        }

        return existingRequest
      }

      const requestPromise = request()
        .then((result) => {
          this.pendingRequests.delete(key)
          return result
        })
        .catch((error) => {
          this.pendingRequests.delete(key)
          this.stats.errors++
          throw error
        })

      this.pendingRequests.set(key, requestPromise)

      // Auto-cleanup after TTL
      const ttl = validateNumber(options.ttl ?? 30000, "ttl", 1000, 300000) // 1s to 5m
      setTimeout(() => {
        this.pendingRequests.delete(key)
      }, ttl)

      return requestPromise
    } catch (error) {
      logPerformanceError("RequestDeduplicator.deduplicate", error, { key })
      throw error
    }
  }

  getStats() {
    return { ...this.stats, pendingCount: this.pendingRequests.size }
  }

  clear(): void {
    try {
      this.pendingRequests.clear()
      this.stats = { deduplications: 0, errors: 0 }
    } catch (error) {
      logPerformanceError("RequestDeduplicator.clear", error)
    }
  }
}

// Enhanced Performance Monitor with error handling
export function usePerformanceMonitor(
  options: {
    enableFPS?: boolean
    enableMemory?: boolean
    enableRenderTime?: boolean
    sampleInterval?: number
    onPerformanceIssue?: (issue: string, details: any) => void
  } = {},
) {
  try {
    const enableFPS = options.enableFPS ?? true
    const enableMemory = options.enableMemory ?? true
    const enableRenderTime = options.enableRenderTime ?? true
    const sampleInterval = validateNumber(
      options.sampleInterval ?? 1000,
      "sampleInterval",
      100,
      10000,
    ) // 100ms to 10s

    const fps = ref(0)
    const memoryUsage = ref(0)
    const renderTime = ref(0)
    const isMonitoring = ref(false)

    let frameCount = 0
    let lastFrameTime = performance.now()
    let monitoringInterval: number | null = null
    let renderStartTime = 0

    const memoryMonitor = enableMemory ? new MemoryMonitor() : null

    const checkPerformanceIssues = (metrics: {
      fps: number
      memoryUsage: number
      renderTime: number
    }) => {
      try {
        if (options.onPerformanceIssue) {
          if (metrics.fps < 30) {
            options.onPerformanceIssue("low_fps", { fps: metrics.fps })
          }

          if (metrics.memoryUsage > 80) {
            options.onPerformanceIssue("high_memory", { memoryUsage: metrics.memoryUsage })
          }

          if (metrics.renderTime > 100) {
            options.onPerformanceIssue("slow_render", { renderTime: metrics.renderTime })
          }
        }
      } catch (error) {
        logPerformanceError("checkPerformanceIssues", error)
      }
    }

    const updateMetrics = () => {
      try {
        const currentTime = performance.now()

        // Calculate FPS
        if (enableFPS) {
          frameCount++
          const deltaTime = currentTime - lastFrameTime

          if (deltaTime >= 1000) {
            const calculatedFPS = Math.round((frameCount * 1000) / deltaTime)
            fps.value = calculatedFPS
            frameCount = 0
            lastFrameTime = currentTime
          }
        }

        // Get memory usage
        if (enableMemory && memoryMonitor) {
          const memoryInfo = memoryMonitor.getMemoryInfo()
          memoryUsage.value = memoryInfo.supported ? memoryInfo.usagePercentage : 0
        }

        // Measure render time (simplified)
        if (enableRenderTime) {
          if (renderStartTime > 0) {
            renderTime.value = currentTime - renderStartTime
            renderStartTime = 0
          }
        }

        // Check for performance issues
        checkPerformanceIssues({
          fps: fps.value,
          memoryUsage: memoryUsage.value,
          renderTime: renderTime.value,
        })
      } catch (error) {
        logPerformanceError("updateMetrics", error)
      }
    }

    const startRenderMeasure = () => {
      try {
        if (enableRenderTime) {
          renderStartTime = performance.now()
        }
      } catch (error) {
        logPerformanceError("startRenderMeasure", error)
      }
    }

    const stopRenderMeasure = () => {
      try {
        if (enableRenderTime && renderStartTime > 0) {
          renderTime.value = performance.now() - renderStartTime
          renderStartTime = 0
        }
      } catch (error) {
        logPerformanceError("stopRenderMeasure", error)
      }
    }

    const startMonitoring = () => {
      try {
        if (isMonitoring.value) {
          return
        }

        isMonitoring.value = true
        frameCount = 0
        lastFrameTime = performance.now()

        // Start memory monitoring
        if (memoryMonitor) {
          memoryMonitor.startMonitoring(sampleInterval)
        }

        // Start performance monitoring
        monitoringInterval = window.setInterval(updateMetrics, sampleInterval)

        // Monitor frame rate
        if (enableFPS) {
          const measureFrame = () => {
            if (isMonitoring.value) {
              updateMetrics()
              safeRequestAnimationFrame(measureFrame)
            }
          }
          safeRequestAnimationFrame(measureFrame)
        }
      } catch (error) {
        logPerformanceError("startMonitoring", error)
      }
    }

    const stopMonitoring = () => {
      try {
        isMonitoring.value = false

        if (monitoringInterval) {
          clearInterval(monitoringInterval)
          monitoringInterval = null
        }

        if (memoryMonitor) {
          memoryMonitor.stopMonitoring()
        }
      } catch (error) {
        logPerformanceError("stopMonitoring", error)
      }
    }

    // Cleanup on unmount
    onUnmounted(() => {
      stopMonitoring()
    // MemoryMonitor has explicit stopMonitoring; destroy not required
    })

    return {
      fps,
      memoryUsage,
      renderTime,
      isMonitoring,
      startMonitoring,
      stopMonitoring,
      startRenderMeasure,
      stopRenderMeasure,
      memoryMonitor,
    }
  } catch (error) {
    logPerformanceError("usePerformanceMonitor", error)
    // Return safe defaults
    return {
      fps: ref(0),
      memoryUsage: ref(0),
      renderTime: ref(0),
      isMonitoring: ref(false),
      startMonitoring: () => {},
      stopMonitoring: () => {},
      startRenderMeasure: () => {},
      stopRenderMeasure: () => {},
      memoryMonitor: null,
    }
  }
}
