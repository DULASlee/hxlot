/**
 * 模板市场Store
 * 管理模板浏览、搜索、下载和评价
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getGlobalLogger, type ILogger } from '@smartabp/lowcode-shared'

const logger: ILogger = getGlobalLogger()

// 模板类型定义
export interface Template {
  id: string
  name: string
  displayName: string
  description: string
  category: string
  tags: string[]
  author: string
  version: string
  downloads: number
  rating: number
  reviewCount: number
  createdAt: Date
  updatedAt: Date
  previewImage?: string
  isOfficial: boolean
  isPremium: boolean
  price?: number
}

export interface TemplateDetail extends Template {
  readme: string
  dependencies: string[]
  screenshots: string[]
  changeLog: string
  reviews: TemplateReview[]
}

export interface TemplateReview {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: Date
}

export interface TemplateFilter {
  category?: string
  tags?: string[]
  author?: string
  isOfficial?: boolean
  isPremium?: boolean
  minRating?: number
  searchQuery?: string
}

/**
 * 模板市场Store
 */
export const useTemplateMarketStore = defineStore('templateMarket', () => {
  // 状态
  const templates = ref<Template[]>([])
  const currentTemplate = ref<TemplateDetail | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const filter = ref<TemplateFilter>({})
  
  // 计算属性
  const filteredTemplates = computed(() => {
    let result = templates.value
    
    // 分类筛选
    if (filter.value.category) {
      result = result.filter(t => t.category === filter.value.category)
    }
    
    // 标签筛选
    if (filter.value.tags && filter.value.tags.length > 0) {
      result = result.filter(t => 
        filter.value.tags!.some(tag => t.tags.includes(tag))
      )
    }
    
    // 作者筛选
    if (filter.value.author) {
      result = result.filter(t => t.author === filter.value.author)
    }
    
    // 官方筛选
    if (filter.value.isOfficial !== undefined) {
      result = result.filter(t => t.isOfficial === filter.value.isOfficial)
    }
    
    // 高级筛选
    if (filter.value.isPremium !== undefined) {
      result = result.filter(t => t.isPremium === filter.value.isPremium)
    }
    
    // 评分筛选
    if (filter.value.minRating) {
      result = result.filter(t => t.rating >= filter.value.minRating!)
    }
    
    // 搜索筛选
    if (filter.value.searchQuery) {
      const query = filter.value.searchQuery.toLowerCase()
      result = result.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.displayName.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    return result
  })
  
  const categories = computed(() => {
    const cats = new Set(templates.value.map(t => t.category))
    return Array.from(cats)
  })
  
  const allTags = computed(() => {
    const tags = new Set<string>()
    templates.value.forEach(t => t.tags.forEach(tag => tags.add(tag)))
    return Array.from(tags)
  })
  
  // 方法
  const loadTemplates = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // 模拟从API加载模板
      // TODO: 实现实际API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 初始化示例模板
      templates.value = getInitialTemplates()
      
      logger.info('模板加载成功', { count: templates.value.length })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '加载模板失败'
      error.value = errorMsg
      logger.error('加载模板失败', err)
    } finally {
      isLoading.value = false
    }
  }
  
  const loadTemplateDetail = async (templateId: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      // TODO: 实现实际API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const template = templates.value.find(t => t.id === templateId)
      if (!template) {
        throw new Error('模板不存在')
      }
      
      // 构建详细信息
      currentTemplate.value = {
        ...template,
        readme: getTemplateReadme(templateId),
        dependencies: [],
        screenshots: [],
        changeLog: '初始版本',
        reviews: []
      }
      
      logger.info('模板详情加载成功', { templateId })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '加载模板详情失败'
      error.value = errorMsg
      logger.error('加载模板详情失败', err)
    } finally {
      isLoading.value = false
    }
  }
  
  const downloadTemplate = async (templateId: string) => {
    try {
      const template = templates.value.find(t => t.id === templateId)
      if (!template) {
        throw new Error('模板不存在')
      }
      
      // 增加下载计数
      template.downloads++
      
      logger.info('模板下载成功', { templateId, templateName: template.name })
      
      return template
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '下载模板失败'
      error.value = errorMsg
      logger.error('下载模板失败', err)
      throw err
    }
  }
  
  const rateTemplate = async (templateId: string, rating: number, _comment: string) => {
    try {
      const template = templates.value.find(t => t.id === templateId)
      if (!template) {
        throw new Error('模板不存在')
      }
      
      // 更新评分（简化计算）
      const totalRating = template.rating * template.reviewCount + rating
      template.reviewCount++
      template.rating = totalRating / template.reviewCount
      
      logger.info('模板评分成功', { templateId, rating })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '评分失败'
      error.value = errorMsg
      logger.error('评分失败', err)
      throw err
    }
  }
  
  const updateFilter = (newFilter: Partial<TemplateFilter>) => {
    filter.value = { ...filter.value, ...newFilter }
  }
  
  const clearFilter = () => {
    filter.value = {}
  }
  
  const searchTemplates = (query: string) => {
    filter.value.searchQuery = query
  }
  
  // 辅助函数
  const getInitialTemplates = (): Template[] => {
    return [
      {
        id: 'crud-basic',
        name: 'CrudBasic',
        displayName: 'CRUD基础模板',
        description: '标准CRUD操作模板，包含列表、新增、编辑、删除功能',
        category: '基础功能',
        tags: ['CRUD', '列表', '表单'],
        author: 'SmartAbp官方',
        version: '1.0.0',
        downloads: 1250,
        rating: 4.8,
        reviewCount: 45,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-09-01'),
        isOfficial: true,
        isPremium: false
      },
      {
        id: 'workflow-approval',
        name: 'WorkflowApproval',
        displayName: '审批工作流模板',
        description: '标准审批流程模板，支持多级审批和条件分支',
        category: '业务流程',
        tags: ['工作流', '审批', '流程'],
        author: 'SmartAbp官方',
        version: '1.2.0',
        downloads: 856,
        rating: 4.9,
        reviewCount: 32,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-09-15'),
        isOfficial: true,
        isPremium: false
      },
      {
        id: 'dashboard-analytics',
        name: 'DashboardAnalytics',
        displayName: '数据分析仪表板',
        description: '数据可视化仪表板模板，包含图表、统计卡片等',
        category: 'UI组件',
        tags: ['仪表板', '图表', '数据可视化'],
        author: 'SmartAbp官方',
        version: '2.0.0',
        downloads: 2100,
        rating: 4.7,
        reviewCount: 68,
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-10-01'),
        isOfficial: true,
        isPremium: true,
        price: 99
      }
    ]
  }
  
  const getTemplateReadme = (templateId: string): string => {
    return `# ${templateId} 模板

## 功能特性

- 完整的CRUD操作支持
- 响应式设计
- 类型安全的TypeScript代码

## 使用方法

1. 下载模板
2. 配置参数
3. 生成代码

## 技术栈

- Vue 3 + TypeScript
- Element Plus
- ABP Framework
`
  }
  
  return {
    // 状态
    templates,
    currentTemplate,
    isLoading,
    error,
    filter,
    
    // 计算属性
    filteredTemplates,
    categories,
    allTags,
    
    // 方法
    loadTemplates,
    loadTemplateDetail,
    downloadTemplate,
    rateTemplate,
    updateFilter,
    clearFilter,
    searchTemplates
  }
})
