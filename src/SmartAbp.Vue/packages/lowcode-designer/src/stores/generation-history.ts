/**
 * 代码生成历史Store
 * @description 管理代码生成历史记录的状态和操作
 * @version 1.0.0
 * @author AI首席架构师
 * @since Phase 3 - Task 3.2.1
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  GenerationHistory,
  GenerationHistoryFilter,
  GenerationHistoryStatistics,
  HistoryComparisonResult,
  RevertOptions,
  RevertResult,
  GenerationType
} from '@smartabp/lowcode-shared'
import { GenerationStatus } from '@smartabp/lowcode-shared'
import { generationHistoryApi } from '@smartabp/lowcode-api'
import { ElMessage } from 'element-plus'

export const useGenerationHistoryStore = defineStore('generation-history', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // State
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const histories = ref<GenerationHistory[]>([])
  const currentHistory = ref<GenerationHistory | null>(null)
  const statistics = ref<GenerationHistoryStatistics | null>(null)
  const comparisonResult = ref<HistoryComparisonResult | null>(null)

  const loading = ref(false)
  const error = ref<string | null>(null)

  const totalCount = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)

  // 缓存机制
  const historyCache = new Map<string, GenerationHistory>()

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Getters
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const successHistories = computed(() =>
    histories.value.filter(h => h.status === GenerationStatus.Success)
  )

  const failedHistories = computed(() =>
    histories.value.filter(h => h.status === GenerationStatus.Failed)
  )

  const recentHistories = computed(() =>
    [...histories.value].sort((a, b) =>
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    ).slice(0, 10)
  )

  const historiesByType = computed(() => {
    const map = new Map<GenerationType, GenerationHistory[]>()
    histories.value.forEach(history => {
      if (!map.has(history.generationType)) {
        map.set(history.generationType, [])
      }
      map.get(history.generationType)?.push(history)
    })
    return map
  })

  const historiesByModule = computed(() => {
    const map = new Map<string, GenerationHistory[]>()
    histories.value.forEach(history => {
      if (history.moduleName) {
        if (!map.has(history.moduleName)) {
          map.set(history.moduleName, [])
        }
        map.get(history.moduleName)?.push(history)
      }
    })
    return map
  })

  const averageQuality = computed(() => {
    const withQuality = histories.value.filter(h => h.qualityMetrics)
    if (withQuality.length === 0) return 0
    const total = withQuality.reduce((sum, h) => sum + (h.qualityMetrics?.overallScore || 0), 0)
    return Math.round(total / withQuality.length)
  })

  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Actions
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 加载历史记录列表
   */
  async function loadHistories(filter?: GenerationHistoryFilter) {
    loading.value = true
    error.value = null

    try {
      const result = await generationHistoryApi.getList(filter)
      histories.value = result.items
      totalCount.value = result.totalCount

      // 更新缓存
      result.items.forEach(h => historyCache.set(h.id, h))
    } catch (err: any) {
      error.value = err.message || '加载历史记录失败'
      ElMessage.error(error.value || '加载历史记录失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载单个历史记录
   */
  async function loadHistory(id: string, force = false): Promise<GenerationHistory | null> {
    if (historyCache.has(id) && !force) {
      currentHistory.value = historyCache.get(id)!
      return currentHistory.value
    }

    loading.value = true
    error.value = null

    try {
      const history = await generationHistoryApi.get(id)
      currentHistory.value = history
      historyCache.set(id, history)
      return history
    } catch (err: any) {
      error.value = err.message || '加载历史记录详情失败'
      ElMessage.error(error.value || '加载历史记录详情失败')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建历史记录
   */
  async function createHistory(
    history: Omit<GenerationHistory, 'id' | 'generatedAt' | 'isReverted'>
  ): Promise<GenerationHistory | null> {
    loading.value = true
    error.value = null

    try {
      const newHistory = await generationHistoryApi.create(history)
      histories.value.unshift(newHistory)
      historyCache.set(newHistory.id, newHistory)
      totalCount.value++
      ElMessage.success('历史记录已创建')
      return newHistory
    } catch (err: any) {
      error.value = err.message || '创建历史记录失败'
      ElMessage.error(error.value || '创建历史记录失败')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新历史记录
   */
  async function updateHistory(
    id: string,
    data: Partial<GenerationHistory>
  ): Promise<GenerationHistory | null> {
    loading.value = true
    error.value = null

    try {
      const updated = await generationHistoryApi.update(id, data)
      const index = histories.value.findIndex(h => h.id === id)
      if (index !== -1) {
        histories.value[index] = updated
      }
      historyCache.set(id, updated)
      if (currentHistory.value?.id === id) {
        currentHistory.value = updated
      }
      ElMessage.success('历史记录已更新')
      return updated
    } catch (err: any) {
      error.value = err.message || '更新历史记录失败'
      ElMessage.error(error.value || '更新历史记录失败')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除历史记录
   */
  async function deleteHistory(id: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      await generationHistoryApi.delete(id)
      histories.value = histories.value.filter(h => h.id !== id)
      historyCache.delete(id)
      if (currentHistory.value?.id === id) {
        currentHistory.value = null
      }
      totalCount.value--
      ElMessage.success('历史记录已删除')
      return true
    } catch (err: any) {
      error.value = err.message || '删除历史记录失败'
      ElMessage.error(error.value || '删除历史记录失败')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量删除历史记录
   */
  async function batchDelete(ids: string[]): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      await generationHistoryApi.batchDelete(ids)
      histories.value = histories.value.filter(h => !ids.includes(h.id))
      ids.forEach(id => historyCache.delete(id))
      totalCount.value -= ids.length
      ElMessage.success(`已删除 ${ids.length} 条历史记录`)
      return true
    } catch (err: any) {
      error.value = err.message || '批量删除失败'
      ElMessage.error(error.value || '批量删除失败')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载统计信息
   */
  async function loadStatistics(filter?: GenerationHistoryFilter) {
    loading.value = true
    error.value = null

    try {
      statistics.value = await generationHistoryApi.getStatistics(filter)
    } catch (err: any) {
      error.value = err.message || '加载统计信息失败'
      ElMessage.error(error.value || '加载统计信息失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 对比两个历史记录
   */
  async function compareHistories(
    leftId: string,
    rightId: string
  ): Promise<HistoryComparisonResult | null> {
    loading.value = true
    error.value = null

    try {
      const result = await generationHistoryApi.compare(leftId, rightId)
      comparisonResult.value = result
      return result
    } catch (err: any) {
      error.value = err.message || '历史记录对比失败'
      ElMessage.error(error.value || '历史记录对比失败')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 回滚到指定历史记录
   */
  async function revertToHistory(
    id: string,
    options?: RevertOptions
  ): Promise<RevertResult | null> {
    loading.value = true
    error.value = null

    try {
      const result = await generationHistoryApi.revert(id, options)

      if (result.success) {
        // 更新历史记录状态
        const history = histories.value.find(h => h.id === id)
        if (history) {
          history.isReverted = true
          history.revertedAt = result.revertedAt
        }

        ElMessage.success('回滚成功')
      } else {
        ElMessage.error(result.errorMessage || '回滚失败')
      }

      return result
    } catch (err: any) {
      error.value = err.message || '回滚操作失败'
      ElMessage.error(error.value || '回滚操作失败')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取实体的所有历史记录
   */
  async function loadHistoriesByEntity(entityId: string) {
    loading.value = true
    error.value = null

    try {
      const entityHistories = await generationHistoryApi.getByEntity(entityId)
      histories.value = entityHistories
      totalCount.value = entityHistories.length
      entityHistories.forEach(h => historyCache.set(h.id, h))
    } catch (err: any) {
      error.value = err.message || '加载实体历史记录失败'
      ElMessage.error(error.value || '加载实体历史记录失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取模块的所有历史记录
   */
  async function loadHistoriesByModule(moduleName: string) {
    loading.value = true
    error.value = null

    try {
      const moduleHistories = await generationHistoryApi.getByModule(moduleName)
      histories.value = moduleHistories
      totalCount.value = moduleHistories.length
      moduleHistories.forEach(h => historyCache.set(h.id, h))
    } catch (err: any) {
      error.value = err.message || '加载模块历史记录失败'
      ElMessage.error(error.value || '加载模块历史记录失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取最近的历史记录
   */
  async function loadRecentHistories(count = 10) {
    loading.value = true
    error.value = null

    try {
      const recent = await generationHistoryApi.getRecent(count)
      histories.value = recent
      recent.forEach(h => historyCache.set(h.id, h))
    } catch (err: any) {
      error.value = err.message || '加载最近历史记录失败'
      ElMessage.error(error.value || '加载最近历史记录失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 导出历史记录
   */
  async function exportHistories(ids: string[]): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const blob = await generationHistoryApi.export(ids)

      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `generation-history-export-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)

      ElMessage.success(`已导出 ${ids.length} 条历史记录`)
      return true
    } catch (err: any) {
      error.value = err.message || '导出历史记录失败'
      ElMessage.error(error.value || '导出历史记录失败')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 清理旧历史记录
   */
  async function cleanup(beforeDate: Date): Promise<number> {
    loading.value = true
    error.value = null

    try {
      const result = await generationHistoryApi.cleanup(beforeDate)

      // 从本地状态中移除已删除的记录
      histories.value = histories.value.filter(h =>
        new Date(h.generatedAt) >= beforeDate
      )

      ElMessage.success(`已清理 ${result.deletedCount} 条旧历史记录`)
      return result.deletedCount
    } catch (err: any) {
      error.value = err.message || '清理历史记录失败'
      ElMessage.error(error.value || '清理历史记录失败')
      return 0
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置状态
   */
  function resetState() {
    histories.value = []
    currentHistory.value = null
    statistics.value = null
    comparisonResult.value = null
    error.value = null
    totalCount.value = 0
    currentPage.value = 1
    historyCache.clear()
  }

  return {
    // State
    histories,
    currentHistory,
    statistics,
    comparisonResult,
    loading,
    error,
    totalCount,
    currentPage,
    pageSize,

    // Getters
    successHistories,
    failedHistories,
    recentHistories,
    historiesByType,
    historiesByModule,
    averageQuality,
    totalPages,

    // Actions
    loadHistories,
    loadHistory,
    createHistory,
    updateHistory,
    deleteHistory,
    batchDelete,
    loadStatistics,
    compareHistories,
    revertToHistory,
    loadHistoriesByEntity,
    loadHistoriesByModule,
    loadRecentHistories,
    exportHistories,
    cleanup,
    resetState
  }
})

