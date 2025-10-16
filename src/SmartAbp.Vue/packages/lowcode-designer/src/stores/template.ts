/**
 * 模板管理Store
 * @description 管理模板的CRUD、版本控制、缓存等状态
 * @version 1.0.0
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { templateApi } from '@smartabp/lowcode-api'
import type {
  Template,
  TemplateCategory,
  TemplateCompileOptions,
  TemplateExecutionResult,
  TemplateMarketFilter,
  TemplateTestCase,
  TemplateVersion
} from '@smartabp/lowcode-shared'

/**
 * 模板Store状态
 */
export const useTemplateStore = defineStore('template', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // State
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /** 模板列表 */
  const templates = ref<Template[]>([])

  /** 当前选中的模板 */
  const currentTemplate = ref<Template | null>(null)

  /** 模板分类列表 */
  const categories = ref<TemplateCategory[]>([])

  /** 模板版本列表 */
  const versions = ref<TemplateVersion[]>([])

  /** 加载状态 */
  const loading = ref(false)

  /** 错误信息 */
  const error = ref<string | null>(null)

  /** 模板缓存（id -> 模板） */
  const templateCache = ref(new Map<string, Template>())

  /** 编译结果缓存（id -> 结果） */
  const compilationCache = ref(new Map<string, TemplateExecutionResult>())

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Getters
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /** 公开模板 */
  const publicTemplates = computed(() =>
    templates.value.filter(t => t.isPublic)
  )

  /** 内置模板 */
  const builtInTemplates = computed(() =>
    templates.value.filter(t => t.isBuiltIn)
  )

  /** 我的模板 */
  const myTemplates = computed(() =>
    templates.value.filter(t => !t.isBuiltIn && !t.isPublic)
  )

  /** 按分类分组的模板 */
  const templatesByCategory = computed(() => {
    const groups = new Map<string, Template[]>()
    templates.value.forEach(template => {
      const categoryId = template.categoryId || 'uncategorized'
      if (!groups.has(categoryId)) {
        groups.set(categoryId, [])
      }
      groups.get(categoryId)!.push(template)
    })
    return groups
  })

  /** 热门模板（按使用次数排序） */
  const popularTemplates = computed(() =>
    [...templates.value]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10)
  )

  /** 最近使用的模板 */
  const recentTemplates = computed(() =>
    [...templates.value]
      .filter(t => t.lastUsedAt)
      .sort((a, b) => {
        const dateA = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0
        const dateB = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 5)
  )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Actions
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 加载模板列表
   */
  async function loadTemplates(filter?: TemplateMarketFilter) {
    try {
      loading.value = true
      error.value = null
      templates.value = await templateApi.getList(filter)

      // 更新缓存
      templates.value.forEach(template => {
        templateCache.value.set(template.id, template)
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载模板列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取单个模板
   */
  async function loadTemplate(id: string, forceRefresh = false) {
    try {
      // 检查缓存
      if (!forceRefresh && templateCache.value.has(id)) {
        currentTemplate.value = templateCache.value.get(id)!
        return currentTemplate.value
      }

      loading.value = true
      error.value = null
      const template = await templateApi.get(id)
      currentTemplate.value = template

      // 更新缓存
      templateCache.value.set(id, template)

      return template
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载模板失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建模板
   */
  async function createTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      loading.value = true
      error.value = null
      const newTemplate = await templateApi.create(template)

      // 添加到列表
      templates.value.unshift(newTemplate)

      // 更新缓存
      templateCache.value.set(newTemplate.id, newTemplate)

      // 设置为当前模板
      currentTemplate.value = newTemplate

      return newTemplate
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建模板失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新模板
   */
  async function updateTemplate(id: string, updates: Partial<Template>) {
    try {
      loading.value = true
      error.value = null
      const updated = await templateApi.update(id, updates)

      // 更新列表
      const index = templates.value.findIndex(t => t.id === id)
      if (index !== -1) {
        templates.value[index] = updated
      }

      // 更新缓存
      templateCache.value.set(id, updated)

      // 如果是当前模板，更新
      if (currentTemplate.value?.id === id) {
        currentTemplate.value = updated
      }

      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新模板失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除模板
   */
  async function deleteTemplate(id: string) {
    try {
      loading.value = true
      error.value = null
      await templateApi.delete(id)

      // 从列表移除
      templates.value = templates.value.filter(t => t.id !== id)

      // 清除缓存
      templateCache.value.delete(id)
      compilationCache.value.delete(id)

      // 如果是当前模板，清除
      if (currentTemplate.value?.id === id) {
        currentTemplate.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除模板失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 编译模板
   */
  async function compileTemplate(
    id: string,
    inputData: Record<string, unknown>,
    options?: TemplateCompileOptions,
    useCache = true
  ): Promise<TemplateExecutionResult> {
    try {
      loading.value = true
      error.value = null

      // 检查缓存（仅成功的编译结果）
      const cacheKey = `${id}-${JSON.stringify(inputData)}`
      if (useCache && compilationCache.value.has(cacheKey)) {
        const cached = compilationCache.value.get(cacheKey)!
        if (cached.success) {
          return cached
        }
      }

      const result = await templateApi.compile(id, inputData, options)

      // 缓存成功的结果
      if (result.success) {
        compilationCache.value.set(cacheKey, result)
      }

      // 记录使用
      await templateApi.recordUsage(id, {
        userId: 'current-user', // TODO: 从认证系统获取
        success: result.success,
        errorMessage: result.error?.message,
        duration: result.duration,
        inputData
      })

      // 更新使用次数
      const template = templateCache.value.get(id)
      if (template) {
        template.usageCount += 1
        template.lastUsedAt = new Date()
        templateCache.value.set(id, template)
      }

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '编译模板失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 测试模板
   */
  async function testTemplate(
    id: string,
    testCase: Omit<TemplateTestCase, 'id' | 'templateId' | 'createdAt' | 'updatedAt'>
  ): Promise<TemplateTestCase> {
    try {
      loading.value = true
      error.value = null
      return await templateApi.test(id, testCase)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '测试模板失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载模板版本
   */
  async function loadVersions(id: string) {
    try {
      loading.value = true
      error.value = null
      versions.value = await templateApi.getVersions(id)
      return versions.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载版本列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建新版本
   */
  async function createVersion(id: string, changeLog?: string) {
    try {
      loading.value = true
      error.value = null
      const version = await templateApi.createVersion(id, changeLog)
      versions.value.unshift(version)
      return version
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建版本失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 回滚到指定版本
   */
  async function rollbackToVersion(id: string, versionId: string) {
    try {
      loading.value = true
      error.value = null
      const template = await templateApi.rollbackToVersion(id, versionId)

      // 更新当前模板
      currentTemplate.value = template
      templateCache.value.set(id, template)

      // 清除编译缓存
      compilationCache.value.clear()

      return template
    } catch (err) {
      error.value = err instanceof Error ? err.message : '回滚版本失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载分类列表
   */
  async function loadCategories() {
    try {
      loading.value = true
      error.value = null
      categories.value = await templateApi.getCategories()
      return categories.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载分类列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 复制模板
   */
  async function duplicateTemplate(id: string, newName: string) {
    try {
      loading.value = true
      error.value = null
      const newTemplate = await templateApi.duplicate(id, newName)
      templates.value.unshift(newTemplate)
      templateCache.value.set(newTemplate.id, newTemplate)
      return newTemplate
    } catch (err) {
      error.value = err instanceof Error ? err.message : '复制模板失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 发布到模板市场
   */
  async function publishTemplate(id: string) {
    try {
      loading.value = true
      error.value = null
      const template = await templateApi.publish(id)
      await updateTemplate(id, { isPublic: true })
      return template
    } catch (err) {
      error.value = err instanceof Error ? err.message : '发布模板失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 从模板市场下架
   */
  async function unpublishTemplate(id: string) {
    try {
      loading.value = true
      error.value = null
      const template = await templateApi.unpublish(id)
      await updateTemplate(id, { isPublic: false })
      return template
    } catch (err) {
      error.value = err instanceof Error ? err.message : '下架模板失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 评分模板
   */
  async function rateTemplate(id: string, rating: number, review?: string) {
    try {
      loading.value = true
      error.value = null
      await templateApi.rate(id, rating, review)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '评分失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 清除缓存
   */
  function clearCache() {
    templateCache.value.clear()
    compilationCache.value.clear()
  }

  /**
   * 重置Store
   */
  function $reset() {
    templates.value = []
    currentTemplate.value = null
    categories.value = []
    versions.value = []
    loading.value = false
    error.value = null
    clearCache()
  }

  return {
    // State
    templates,
    currentTemplate,
    categories,
    versions,
    loading,
    error,

    // Getters
    publicTemplates,
    builtInTemplates,
    myTemplates,
    templatesByCategory,
    popularTemplates,
    recentTemplates,

    // Actions
    loadTemplates,
    loadTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    compileTemplate,
    testTemplate,
    loadVersions,
    createVersion,
    rollbackToVersion,
    loadCategories,
    duplicateTemplate,
    publishTemplate,
    unpublishTemplate,
    rateTemplate,
    clearCache,
    $reset
  }
})

