/**
 * SmartAbp Enterprise useDataWorker Composable
 * Phoenix计划 Week 2 - Web Workers集成Hook
 * 
 * 功能：
 * - 简化Worker通信
 * - 自动管理Worker生命周期
 * - Promise化API
 * - 性能监控
 */

import { ref, onBeforeUnmount } from 'vue'
import type {
  WorkerMessage,
  WorkerResponse,
  SortPayload,
  FilterPayload,
  SearchPayload,
  AggregatePayload
} from '@/workers/data-processing.worker'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface PendingTask {
  resolve: (result: any) => void
  reject: (error: Error) => void
  startTime: number
}

interface WorkerStats {
  totalTasks: number
  completedTasks: number
  failedTasks: number
  avgDuration: number
  isProcessing: boolean
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// useDataWorker Hook
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useDataWorker() {
  let worker: Worker | null = null
  const pendingTasks = new Map<string, PendingTask>()
  
  const stats = ref<WorkerStats>({
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    avgDuration: 0,
    isProcessing: false
  })

  /**
   * 初始化Worker
   */
  function initWorker() {
    if (worker) return

    try {
      worker = new Worker(
        new URL('../workers/data-processing.worker.ts', import.meta.url),
        { type: 'module' }
      )

      worker.onmessage = handleWorkerMessage
      worker.onerror = handleWorkerError

      console.log('[DataWorker] Worker initialized')
    } catch (error) {
      console.error('[DataWorker] Failed to initialize worker:', error)
    }
  }

  /**
   * 处理Worker消息
   */
  function handleWorkerMessage(event: MessageEvent<WorkerResponse>) {
    const { id, result, error, duration } = event.data

    const task = pendingTasks.get(id)
    if (!task) return

    // 更新统计
    stats.value.completedTasks++
    stats.value.isProcessing = pendingTasks.size > 1

    // 更新平均处理时间
    const alpha = 0.1
    stats.value.avgDuration = stats.value.avgDuration * (1 - alpha) + duration * alpha

    // 移除任务
    pendingTasks.delete(id)

    // 完成Promise
    if (error) {
      stats.value.failedTasks++
      task.reject(new Error(error))
    } else {
      task.resolve(result)
    }

    console.log(`[DataWorker] Task ${id} completed in ${duration.toFixed(2)}ms`)
  }

  /**
   * 处理Worker错误
   */
  function handleWorkerError(error: ErrorEvent) {
    console.error('[DataWorker] Worker error:', error)

    // 拒绝所有待处理任务
    pendingTasks.forEach((task, id) => {
      stats.value.failedTasks++
      task.reject(new Error(`Worker error: ${error.message}`))
      pendingTasks.delete(id)
    })

    stats.value.isProcessing = false
  }

  /**
   * 发送任务到Worker
   */
  function postTask<T = any>(type: WorkerMessage['type'], payload: any): Promise<T> {
    if (!worker) {
      initWorker()
    }

    if (!worker) {
      return Promise.reject(new Error('Worker not available'))
    }

    const id = `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`

    stats.value.totalTasks++
    stats.value.isProcessing = true

    return new Promise<T>((resolve, reject) => {
      pendingTasks.set(id, {
        resolve,
        reject,
        startTime: performance.now()
      })

      const message: WorkerMessage = { id, type, payload }
      worker!.postMessage(message)
    })
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 高级API
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 排序数据
   */
  async function sortData<T = any>(
    data: T[],
    key: string,
    order: 'asc' | 'desc' = 'asc'
  ): Promise<T[]> {
    const payload: SortPayload = { data, key, order }
    return postTask<T[]>('sort', payload)
  }

  /**
   * 筛选数据
   */
  async function filterData<T = any>(
    data: T[],
    conditions: FilterPayload['conditions']
  ): Promise<T[]> {
    const payload: FilterPayload = { data, conditions }
    return postTask<T[]>('filter', payload)
  }

  /**
   * 搜索数据
   */
  async function searchData<T = any>(
    data: T[],
    keyword: string,
    fields: string[]
  ): Promise<T[]> {
    const payload: SearchPayload = { data, keyword, fields }
    return postTask<T[]>('search', payload)
  }

  /**
   * 聚合数据
   */
  async function aggregateData(
    data: any[],
    groupBy: string,
    aggregations: AggregatePayload['aggregations']
  ): Promise<any[]> {
    const payload: AggregatePayload = { data, groupBy, aggregations }
    return postTask<any[]>('aggregate', payload)
  }

  /**
   * 转换数据
   */
  async function transformData<T = any, R = any>(
    data: T[],
    transformer: string
  ): Promise<R[]> {
    const payload = { data, transformer }
    return postTask<R[]>('transform', payload)
  }

  /**
   * 销毁Worker
   */
  function destroy() {
    if (worker) {
      // 拒绝所有待处理任务
      pendingTasks.forEach((task, id) => {
        task.reject(new Error('Worker terminated'))
        pendingTasks.delete(id)
      })

      worker.terminate()
      worker = null
      stats.value.isProcessing = false

      console.log('[DataWorker] Worker terminated')
    }
  }

  // 组件卸载时自动清理
  onBeforeUnmount(() => {
    destroy()
  })

  return {
    stats,
    sortData,
    filterData,
    searchData,
    aggregateData,
    transformData,
    destroy
  }
}

/**
 * 智能Worker管理（自动选择是否使用Worker）
 */
export function useSmartDataWorker() {
  const worker = useDataWorker()
  const threshold = 100 // 数据量阈值

  /**
   * 智能排序（根据数据量自动选择策略）
   */
  async function smartSort<T extends Record<string, any>>(
    data: T[],
    key: keyof T,
    order: 'asc' | 'desc' = 'asc'
  ): Promise<T[]> {
    if (data.length < threshold) {
      // 小数据量：主线程直接处理
      return [...data].sort((a, b) => {
        const valueA = a[key]
        const valueB = b[key]
        const result = valueA < valueB ? -1 : valueA > valueB ? 1 : 0
        return order === 'asc' ? result : -result
      })
    }

    // 大数据量：Worker处理
    return worker.sortData(data, String(key), order)
  }

  /**
   * 智能搜索
   */
  async function smartSearch<T extends Record<string, any>>(
    data: T[],
    keyword: string,
    fields: Array<keyof T>
  ): Promise<T[]> {
    if (data.length < threshold) {
      // 主线程处理
      const lowerKeyword = keyword.toLowerCase()
      return data.filter(item => {
        return fields.some(field => {
          const value = item[field]
          return String(value).toLowerCase().includes(lowerKeyword)
        })
      })
    }

    // Worker处理
    return worker.searchData(data, keyword, fields.map(String))
  }

  return {
    ...worker,
    smartSort,
    smartSearch
  }
}
