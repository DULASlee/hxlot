/**
 * 模板管理API
 * @description 提供模板CRUD、版本管理、测试等API接口
 * @version 1.0.0
 */

import type {
  Template,
  TemplateCategory,
  TemplateCompileOptions,
  TemplateExecutionResult,
  TemplateExportData,
  TemplateMarketFilter,
  TemplateTestCase,
  TemplateUsage,
  TemplateVersion
} from '@smartabp/lowcode-shared'
import { http } from './http-client'

const BASE_URL = '/api/templates'

/**
 * 模板API类
 */
export class TemplateApi {
  /**
   * 获取模板列表
   */
  static async getList(filter?: TemplateMarketFilter): Promise<Template[]> {
    const params = new URLSearchParams()
    if (filter?.keyword) params.append('keyword', filter.keyword)
    if (filter?.type) params.append('type', filter.type)
    if (filter?.categoryId) params.append('categoryId', filter.categoryId)
    if (filter?.tags) params.append('tags', filter.tags.join(','))
    if (filter?.minRating) params.append('minRating', filter.minRating.toString())
    if (filter?.sortBy) params.append('sortBy', filter.sortBy)
    if (filter?.sortOrder) params.append('sortOrder', filter.sortOrder)
    if (filter?.publicOnly !== undefined) params.append('publicOnly', filter.publicOnly.toString())
    if (filter?.builtInOnly !== undefined) params.append('builtInOnly', filter.builtInOnly.toString())

    return await http.get<Template[]>(`${BASE_URL}?${params.toString()}`)
  }

  /**
   * 获取单个模板
   */
  static async get(id: string): Promise<Template> {
    return await http.get<Template>(`${BASE_URL}/${id}`)
  }

  /**
   * 创建模板
   */
  static async create(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> {
    return await http.post<Template>(BASE_URL, template)
  }

  /**
   * 更新模板
   */
  static async update(id: string, template: Partial<Template>): Promise<Template> {
    return await http.put<Template>(`${BASE_URL}/${id}`, template)
  }

  /**
   * 删除模板
   */
  static async delete(id: string): Promise<void> {
    await http.delete(`${BASE_URL}/${id}`)
  }

  /**
   * 编译模板
   */
  static async compile(
    id: string,
    inputData: Record<string, unknown>,
    options?: TemplateCompileOptions
  ): Promise<TemplateExecutionResult> {
    return await http.post<TemplateExecutionResult>(`${BASE_URL}/${id}/compile`, { inputData, options })
  }

  /**
   * 测试模板
   */
  static async test(id: string, testCase: Omit<TemplateTestCase, 'id' | 'templateId' | 'createdAt' | 'updatedAt'>): Promise<TemplateTestCase> {
    return await http.post<TemplateTestCase>(`${BASE_URL}/${id}/test`, testCase)
  }

  /**
   * 获取模板版本列表
   */
  static async getVersions(id: string): Promise<TemplateVersion[]> {
    return await http.get<TemplateVersion[]>(`${BASE_URL}/${id}/versions`)
  }

  /**
   * 获取特定版本
   */
  static async getVersion(id: string, versionId: string): Promise<TemplateVersion> {
    return await http.get<TemplateVersion>(`${BASE_URL}/${id}/versions/${versionId}`)
  }

  /**
   * 创建新版本
   */
  static async createVersion(id: string, changeLog?: string): Promise<TemplateVersion> {
    return await http.post<TemplateVersion>(`${BASE_URL}/${id}/versions`, { changeLog })
  }

  /**
   * 回滚到指定版本
   */
  static async rollbackToVersion(id: string, versionId: string): Promise<Template> {
    return await http.post<Template>(`${BASE_URL}/${id}/versions/${versionId}/rollback`)
  }

  /**
   * 获取模板使用记录
   */
  static async getUsageHistory(id: string): Promise<TemplateUsage[]> {
    return await http.get<TemplateUsage[]>(`${BASE_URL}/${id}/usage`)
  }

  /**
   * 记录模板使用
   */
  static async recordUsage(id: string, usage: Omit<TemplateUsage, 'id' | 'templateId' | 'usedAt'>): Promise<TemplateUsage> {
    return await http.post<TemplateUsage>(`${BASE_URL}/${id}/usage`, usage)
  }

  /**
   * 导出模板
   */
  static async export(id: string, includeVersions = true, includeTestCases = true): Promise<TemplateExportData> {
    const params = new URLSearchParams()
    params.append('includeVersions', includeVersions.toString())
    params.append('includeTestCases', includeTestCases.toString())
    return await http.get<TemplateExportData>(`${BASE_URL}/${id}/export?${params.toString()}`)
  }

  /**
   * 导入模板
   */
  static async import(data: TemplateExportData): Promise<Template> {
    return await http.post<Template>(`${BASE_URL}/import`, data)
  }

  /**
   * 获取分类列表
   */
  static async getCategories(): Promise<TemplateCategory[]> {
    return await http.get<TemplateCategory[]>(`${BASE_URL}/categories`)
  }

  /**
   * 创建分类
   */
  static async createCategory(category: Omit<TemplateCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<TemplateCategory> {
    return await http.post<TemplateCategory>(`${BASE_URL}/categories`, category)
  }

  /**
   * 更新分类
   */
  static async updateCategory(id: string, category: Partial<TemplateCategory>): Promise<TemplateCategory> {
    return await http.put<TemplateCategory>(`${BASE_URL}/categories/${id}`, category)
  }

  /**
   * 删除分类
   */
  static async deleteCategory(id: string): Promise<void> {
    await http.delete(`${BASE_URL}/categories/${id}`)
  }

  /**
   * 复制模板
   */
  static async duplicate(id: string, newName: string): Promise<Template> {
    return await http.post<Template>(`${BASE_URL}/${id}/duplicate`, { newName })
  }

  /**
   * 发布到模板市场
   */
  static async publish(id: string): Promise<Template> {
    return await http.post<Template>(`${BASE_URL}/${id}/publish`)
  }

  /**
   * 从模板市场下架
   */
  static async unpublish(id: string): Promise<Template> {
    return await http.post<Template>(`${BASE_URL}/${id}/unpublish`)
  }

  /**
   * 评分模板
   */
  static async rate(id: string, rating: number, review?: string): Promise<void> {
    await http.post(`${BASE_URL}/${id}/rate`, { rating, review })
  }
}

export const templateApi = TemplateApi

