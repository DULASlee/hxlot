/**
 * 代码生成历史API客户端
 * @description 提供代码生成历史记录的完整API封装
 * @version 1.0.0
 * @author AI首席架构师
 * @since Phase 3 - Task 3.2.1
 */

import type {
  GenerationHistory,
  GenerationHistoryFilter,
  GenerationHistoryStatistics,
  HistoryComparisonResult,
  RevertOptions,
  RevertResult
} from '@smartabp/lowcode-shared'
import { http } from './http-client'

const BASE_URL = '/api/generation-history'

/**
 * 代码生成历史API类
 */
export class GenerationHistoryApi {
  /**
   * 获取历史记录列表
   */
  static async getList(filter?: GenerationHistoryFilter): Promise<{
    items: GenerationHistory[]
    totalCount: number
  }> {
    const params = new URLSearchParams()

    if (filter?.keyword) params.append('keyword', filter.keyword)
    if (filter?.generationType) params.append('generationType', filter.generationType)
    if (filter?.status) params.append('status', filter.status)
    if (filter?.entityId) params.append('entityId', filter.entityId)
    if (filter?.moduleName) params.append('moduleName', filter.moduleName)
    if (filter?.generatedBy) params.append('generatedBy', filter.generatedBy)
    if (filter?.startDate) params.append('startDate', filter.startDate.toISOString())
    if (filter?.endDate) params.append('endDate', filter.endDate.toISOString())
    if (filter?.isReverted !== undefined) params.append('isReverted', filter.isReverted.toString())
    if (filter?.minQualityScore) params.append('minQualityScore', filter.minQualityScore.toString())
    if (filter?.tags) params.append('tags', filter.tags.join(','))
    if (filter?.sortBy) params.append('sortBy', filter.sortBy)
    if (filter?.sortOrder) params.append('sortOrder', filter.sortOrder)
    if (filter?.page) params.append('page', filter.page.toString())
    if (filter?.pageSize) params.append('pageSize', filter.pageSize.toString())

    return await http.get<{ items: GenerationHistory[]; totalCount: number }>(
      `${BASE_URL}?${params.toString()}`
    )
  }

  /**
   * 获取单个历史记录
   */
  static async get(id: string): Promise<GenerationHistory> {
    return await http.get<GenerationHistory>(`${BASE_URL}/${id}`)
  }

  /**
   * 创建历史记录
   */
  static async create(
    history: Omit<GenerationHistory, 'id' | 'generatedAt' | 'isReverted'>
  ): Promise<GenerationHistory> {
    return await http.post<GenerationHistory>(BASE_URL, history)
  }

  /**
   * 更新历史记录（如添加备注）
   */
  static async update(id: string, data: Partial<GenerationHistory>): Promise<GenerationHistory> {
    return await http.put<GenerationHistory>(`${BASE_URL}/${id}`, data)
  }

  /**
   * 删除历史记录
   */
  static async delete(id: string): Promise<void> {
    await http.delete(`${BASE_URL}/${id}`)
  }

  /**
   * 批量删除历史记录
   */
  static async batchDelete(ids: string[]): Promise<void> {
    await http.post(`${BASE_URL}/batch-delete`, { ids })
  }

  /**
   * 获取统计信息
   */
  static async getStatistics(filter?: GenerationHistoryFilter): Promise<GenerationHistoryStatistics> {
    const params = new URLSearchParams()

    if (filter?.startDate) params.append('startDate', filter.startDate.toISOString())
    if (filter?.endDate) params.append('endDate', filter.endDate.toISOString())
    if (filter?.generatedBy) params.append('generatedBy', filter.generatedBy)

    return await http.get<GenerationHistoryStatistics>(`${BASE_URL}/statistics?${params.toString()}`)
  }

  /**
   * 对比两个历史记录
   */
  static async compare(leftId: string, rightId: string): Promise<HistoryComparisonResult> {
    return await http.post<HistoryComparisonResult>(`${BASE_URL}/compare`, { leftId, rightId })
  }

  /**
   * 回滚到指定历史记录
   */
  static async revert(id: string, options?: RevertOptions): Promise<RevertResult> {
    return await http.post<RevertResult>(`${BASE_URL}/${id}/revert`, options)
  }

  /**
   * 获取实体的所有历史记录
   */
  static async getByEntity(entityId: string): Promise<GenerationHistory[]> {
    return await http.get<GenerationHistory[]>(`${BASE_URL}/by-entity/${entityId}`)
  }

  /**
   * 获取模块的所有历史记录
   */
  static async getByModule(moduleName: string): Promise<GenerationHistory[]> {
    return await http.get<GenerationHistory[]>(`${BASE_URL}/by-module/${moduleName}`)
  }

  /**
   * 获取最近的历史记录
   */
  static async getRecent(count = 10): Promise<GenerationHistory[]> {
    return await http.get<GenerationHistory[]>(`${BASE_URL}/recent?count=${count}`)
  }

  /**
   * 导出历史记录
   */
  static async export(ids: string[]): Promise<Blob> {
    return await http.post<Blob>(`${BASE_URL}/export`, { ids }, {
      responseType: 'blob'
    })
  }

  /**
   * 清理旧历史记录
   */
  static async cleanup(beforeDate: Date): Promise<{ deletedCount: number }> {
    return await http.post<{ deletedCount: number }>(`${BASE_URL}/cleanup`, {
      beforeDate: beforeDate.toISOString()
    })
  }
}

export const generationHistoryApi = GenerationHistoryApi

