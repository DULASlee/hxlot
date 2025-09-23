import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { logger } from "@/utils/logger"

// 页面组件定义接口
export interface PageComponent {
  id: string
  type: string
  name: string
  props: Record<string, any>
  style: Record<string, any>
  events: Record<string, any>
  children?: PageComponent[]
}

// 页面定义接口
export interface PageDefinition {
  id: string
  name: string
  type: "list" | "form" | "detail" | "custom"
  entityId?: string
  components: PageComponent[]
  metadata: {
    title: string
    description: string
    route: string
    permissions: string[]
    layout: string
  }
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

// 批量生成配置接口
export interface BatchGenerationConfig {
  entities: string[]
  pageTypes: {
    list: boolean
    form: boolean
    detail: boolean
    permission: boolean
    audit: boolean
  }
  uiStyle: "modern" | "enterprise" | "dashboard"
}

// 页面设计状态管理
export const usePageDesignStore = defineStore("pageDesign", () => {
  // 状态数据
  const pages = ref<PageDefinition[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPageId = ref<string>("")

  // 计算属性
  const completedPages = computed(() => 
    pages.value.filter(p => p.isCompleted).length
  )

  const totalPages = computed(() => pages.value.length)

  const currentPage = computed(() => 
    pages.value.find(p => p.id === currentPageId.value)
  )

  const pagesByType = computed(() => {
    const grouped: Record<string, PageDefinition[]> = {}
    pages.value.forEach(page => {
      if (!grouped[page.type]) {
        grouped[page.type] = []
      }
      grouped[page.type].push(page)
    })
    return grouped
  })

  const pagesByEntity = computed(() => {
    const grouped: Record<string, PageDefinition[]> = {}
    pages.value.forEach(page => {
      if (page.entityId) {
        if (!grouped[page.entityId]) {
          grouped[page.entityId] = []
        }
        grouped[page.entityId].push(page)
      }
    })
    return grouped
  })

  // 页面操作
  const addPage = (page: Omit<PageDefinition, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newPage: PageDefinition = {
        ...page,
        id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      pages.value.push(newPage)
      currentPageId.value = newPage.id
      logger.info(`页面已添加: ${newPage.name}`, { pageId: newPage.id })
      
      return newPage.id
    } catch (err) {
      const error = err as Error
      logger.error("添加页面失败", { error: error.message })
      throw error
    }
  }

  const updatePage = (pageId: string, updates: Partial<PageDefinition>) => {
    try {
      const index = pages.value.findIndex(p => p.id === pageId)
      if (index === -1) {
        throw new Error(`未找到页面: ${pageId}`)
      }

      pages.value[index] = { 
        ...pages.value[index], 
        ...updates,
        updatedAt: new Date()
      }
      logger.info(`页面已更新: ${pageId}`, { updates })
    } catch (err) {
      const error = err as Error
      logger.error("更新页面失败", { pageId, error: error.message })
      throw error
    }
  }

  const removePage = (pageId: string) => {
    try {
      const index = pages.value.findIndex(p => p.id === pageId)
      if (index === -1) {
        throw new Error(`未找到页面: ${pageId}`)
      }

      const page = pages.value[index]
      pages.value.splice(index, 1)
      
      if (currentPageId.value === pageId) {
        currentPageId.value = pages.value.length > 0 ? pages.value[0].id : ""
      }
      
      logger.info(`页面已删除: ${page.name}`, { pageId })
    } catch (err) {
      const error = err as Error
      logger.error("删除页面失败", { pageId, error: error.message })
      throw error
    }
  }

  const duplicatePage = (pageId: string) => {
    try {
      const originalPage = pages.value.find(p => p.id === pageId)
      if (!originalPage) {
        throw new Error(`未找到页面: ${pageId}`)
      }

      const duplicatedPage: PageDefinition = {
        ...originalPage,
        id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: `${originalPage.name}_副本`,
        metadata: {
          ...originalPage.metadata,
          title: `${originalPage.metadata.title}_副本`,
          route: `${originalPage.metadata.route}_copy`
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      pages.value.push(duplicatedPage)
      currentPageId.value = duplicatedPage.id
      logger.info(`页面已复制: ${duplicatedPage.name}`, { 
        originalId: pageId,
        newId: duplicatedPage.id 
      })
      
      return duplicatedPage.id
    } catch (err) {
      const error = err as Error
      logger.error("复制页面失败", { pageId, error: error.message })
      throw error
    }
  }

  // 组件操作
  const addComponentToPage = (pageId: string, component: Omit<PageComponent, "id">) => {
    try {
      const page = pages.value.find(p => p.id === pageId)
      if (!page) {
        throw new Error(`未找到页面: ${pageId}`)
      }

      const newComponent: PageComponent = {
        ...component,
        id: `component-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      }

      page.components.push(newComponent)
      page.updatedAt = new Date()
      
      logger.info(`组件已添加到页面: ${component.name}`, { 
        pageId, 
        componentId: newComponent.id 
      })
      
      return newComponent.id
    } catch (err) {
      const error = err as Error
      logger.error("添加组件到页面失败", { pageId, error: error.message })
      throw error
    }
  }

  const updateComponentInPage = (pageId: string, componentId: string, updates: Partial<PageComponent>) => {
    try {
      const page = pages.value.find(p => p.id === pageId)
      if (!page) {
        throw new Error(`未找到页面: ${pageId}`)
      }

      const componentIndex = page.components.findIndex(c => c.id === componentId)
      if (componentIndex === -1) {
        throw new Error(`未找到组件: ${componentId}`)
      }

      page.components[componentIndex] = { 
        ...page.components[componentIndex], 
        ...updates 
      }
      page.updatedAt = new Date()
      
      logger.info(`页面组件已更新: ${componentId}`, { pageId, updates })
    } catch (err) {
      const error = err as Error
      logger.error("更新页面组件失败", { pageId, componentId, error: error.message })
      throw error
    }
  }

  const removeComponentFromPage = (pageId: string, componentId: string) => {
    try {
      const page = pages.value.find(p => p.id === pageId)
      if (!page) {
        throw new Error(`未找到页面: ${pageId}`)
      }

      const componentIndex = page.components.findIndex(c => c.id === componentId)
      if (componentIndex === -1) {
        throw new Error(`未找到组件: ${componentId}`)
      }

      const component = page.components[componentIndex]
      page.components.splice(componentIndex, 1)
      page.updatedAt = new Date()
      
      logger.info(`组件已从页面删除: ${component.name}`, { pageId, componentId })
    } catch (err) {
      const error = err as Error
      logger.error("从页面删除组件失败", { pageId, componentId, error: error.message })
      throw error
    }
  }

  // 批量生成功能
  const generateBatchPages = async (config: BatchGenerationConfig) => {
    try {
      isLoading.value = true
      error.value = null
      
      logger.info("开始批量生成页面", config)
      
      const generatedPages: PageDefinition[] = []
      
      // 模拟实体数据（实际应该从entityStore获取）
      const mockEntities = config.entities.map(id => ({
        id,
        name: `Entity${id}`,
        tableName: `Table${id}`,
        fields: [
          { name: "Id", displayName: "主键", type: "Guid" },
          { name: "Name", displayName: "名称", type: "string" },
          { name: "Status", displayName: "状态", type: "bool" }
        ]
      }))

      for (const entity of mockEntities) {
        // 生成列表页面
        if (config.pageTypes.list) {
          const listPage = generateListPage(entity, config.uiStyle)
          generatedPages.push(listPage)
        }

        // 生成表单页面
        if (config.pageTypes.form) {
          const formPage = generateFormPage(entity, config.uiStyle)
          generatedPages.push(formPage)
        }

        // 生成详情页面
        if (config.pageTypes.detail) {
          const detailPage = generateDetailPage(entity, config.uiStyle)
          generatedPages.push(detailPage)
        }
      }

      // 添加生成的页面
      generatedPages.forEach(page => {
        const pageId = addPage(page)
        updatePage(pageId, { isCompleted: true })
      })

      logger.info(`批量生成完成，共生成 ${generatedPages.length} 个页面`)
      
      return generatedPages.length
    } catch (err) {
      const error = err as Error
      logger.error("批量生成页面失败", { error: error.message })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 页面模板生成器
  const generateListPage = (entity: any, uiStyle: string): PageDefinition => {
    const components: PageComponent[] = [
      {
        id: "search-toolbar",
        type: "search-toolbar",
        name: "搜索工具栏",
        props: {
          searchFields: entity.fields.slice(1, 3).map((f: any) => ({
            name: f.name,
            label: f.displayName,
            type: f.type === "string" ? "input" : "select"
          }))
        },
        style: { marginBottom: "16px" },
        events: { search: "handleSearch" }
      },
      {
        id: "action-toolbar",
        type: "action-toolbar", 
        name: "操作工具栏",
        props: {
          actions: [
            { name: "add", label: "新增", type: "primary", icon: "el-icon-plus" },
            { name: "export", label: "导出", type: "default", icon: "el-icon-download" },
            { name: "import", label: "导入", type: "default", icon: "el-icon-upload" }
          ]
        },
        style: { marginBottom: "16px" },
        events: { actionClick: "handleAction" }
      },
      {
        id: "data-table",
        type: "data-table",
        name: "数据表格",
        props: {
          columns: entity.fields.map((f: any) => ({
            prop: f.name,
            label: f.displayName,
            width: f.type === "Guid" ? "280" : "auto",
            sortable: true
          })).concat([
            { prop: "actions", label: "操作", width: "200", fixed: "right" }
          ]),
          pagination: true,
          selectable: true
        },
        style: {},
        events: { 
          edit: "handleEdit",
          delete: "handleDelete",
          view: "handleView"
        }
      }
    ]

    return {
      id: "",
      name: `${entity.name}列表`,
      type: "list",
      entityId: entity.id,
      components,
      metadata: {
        title: `${entity.name}管理`,
        description: `${entity.name}数据列表和管理功能`,
        route: `/${entity.name.toLowerCase()}/list`,
        permissions: [`${entity.name}.View`, `${entity.name}.Create`, `${entity.name}.Update`, `${entity.name}.Delete`],
        layout: uiStyle === "dashboard" ? "dashboard" : "default"
      },
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  const generateFormPage = (entity: any, uiStyle: string): PageDefinition => {
    const components: PageComponent[] = [
      {
        id: "page-header",
        type: "page-header",
        name: "页面头部",
        props: {
          title: `${entity.name}信息`,
          showBack: true,
          breadcrumb: [`${entity.name}管理`, "编辑"]
        },
        style: { marginBottom: "24px" },
        events: { back: "handleBack" }
      },
      {
        id: "form-container",
        type: "form-container",
        name: "表单容器",
        props: {
          layout: "grid",
          columns: 2,
          fields: entity.fields.filter((f: any) => f.name !== "Id").map((f: any) => ({
            name: f.name,
            label: f.displayName,
            type: getFormFieldType(f.type),
            required: f.isRequired || false,
            placeholder: `请输入${f.displayName}`,
            rules: getValidationRules(f)
          }))
        },
        style: { marginBottom: "24px" },
        events: { validate: "handleValidate" }
      },
      {
        id: "form-actions",
        type: "form-actions",
        name: "表单操作",
        props: {
          actions: [
            { name: "save", label: "保存", type: "primary" },
            { name: "saveAndNew", label: "保存并新增", type: "default" },
            { name: "cancel", label: "取消", type: "default" }
          ],
          align: "right"
        },
        style: {},
        events: { 
          save: "handleSave",
          saveAndNew: "handleSaveAndNew",
          cancel: "handleCancel"
        }
      }
    ]

    return {
      id: "",
      name: `${entity.name}表单`,
      type: "form",
      entityId: entity.id,
      components,
      metadata: {
        title: `${entity.name}编辑`,
        description: `${entity.name}信息录入和编辑表单`,
        route: `/${entity.name.toLowerCase()}/form`,
        permissions: [`${entity.name}.Create`, `${entity.name}.Update`],
        layout: uiStyle === "dashboard" ? "dashboard" : "default"
      },
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  const generateDetailPage = (entity: any, uiStyle: string): PageDefinition => {
    const components: PageComponent[] = [
      {
        id: "detail-header",
        type: "detail-header",
        name: "详情头部",
        props: {
          title: `${entity.name}详情`,
          showBack: true,
          showEdit: true,
          breadcrumb: [`${entity.name}管理`, "详情"]
        },
        style: { marginBottom: "24px" },
        events: { 
          back: "handleBack",
          edit: "handleEdit"
        }
      },
      {
        id: "detail-content",
        type: "detail-content",
        name: "详情内容",
        props: {
          layout: "descriptions",
          columns: 2,
          bordered: true,
          fields: entity.fields.map((f: any) => ({
            name: f.name,
            label: f.displayName,
            span: f.type === "string" && f.length > 100 ? 2 : 1
          }))
        },
        style: { marginBottom: "24px" },
        events: {}
      },
      {
        id: "related-data",
        type: "related-data",
        name: "关联数据",
        props: {
          tabs: [
            { name: "operations", label: "操作日志", component: "operation-log" },
            { name: "relations", label: "关联数据", component: "relation-list" }
          ]
        },
        style: {},
        events: { tabChange: "handleTabChange" }
      }
    ]

    return {
      id: "",
      name: `${entity.name}详情`,
      type: "detail",
      entityId: entity.id,
      components,
      metadata: {
        title: `${entity.name}详情`,
        description: `${entity.name}详细信息查看`,
        route: `/${entity.name.toLowerCase()}/detail`,
        permissions: [`${entity.name}.View`],
        layout: uiStyle === "dashboard" ? "dashboard" : "default"
      },
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  // 辅助函数
  const getFormFieldType = (dataType: string) => {
    const typeMap: Record<string, string> = {
      string: "input",
      int: "number",
      long: "number",
      bool: "switch",
      DateTime: "date-picker",
      decimal: "number",
      Guid: "input",
      enum: "select"
    }
    return typeMap[dataType] || "input"
  }

  const getValidationRules = (field: any) => {
    const rules = []
    if (field.isRequired) {
      rules.push({ required: true, message: `请输入${field.displayName}` })
    }
    if (field.length && field.type === "string") {
      rules.push({ max: field.length, message: `${field.displayName}长度不能超过${field.length}个字符` })
    }
    return rules
  }

  // 数据持久化
  const saveToLocalStorage = () => {
    try {
      const data = {
        pages: pages.value,
        currentPageId: currentPageId.value,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem("smartabp-page-design", JSON.stringify(data))
      logger.info("页面设计数据已保存到本地存储")
    } catch (err) {
      const error = err as Error
      logger.error("保存到本地存储失败", { error: error.message })
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const data = localStorage.getItem("smartabp-page-design")
      if (data) {
        const parsed = JSON.parse(data)
        pages.value = parsed.pages || []
        currentPageId.value = parsed.currentPageId || ""
        logger.info("页面设计数据已从本地存储加载", { 
          pagesCount: pages.value.length 
        })
      }
    } catch (err) {
      const error = err as Error
      logger.error("从本地存储加载失败", { error: error.message })
      pages.value = []
      currentPageId.value = ""
    }
  }

  const clearAllData = () => {
    try {
      pages.value = []
      currentPageId.value = ""
      localStorage.removeItem("smartabp-page-design")
      logger.info("所有页面设计数据已清除")
    } catch (err) {
      const error = err as Error
      logger.error("清除数据失败", { error: error.message })
    }
  }

  // 导出页面设计
  const exportPageDesigns = () => {
    try {
      const exportData = {
        pages: pages.value,
        metadata: {
          version: "1.0.0",
          exportedAt: new Date().toISOString(),
          generator: "SmartAbp LowCode Studio"
        }
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: "application/json" 
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `page-designs-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
      
      logger.info("页面设计已导出", { pagesCount: pages.value.length })
    } catch (err) {
      const error = err as Error
      logger.error("导出页面设计失败", { error: error.message })
      throw error
    }
  }

  // 导入页面设计
  const importPageDesigns = (designData: any) => {
    try {
      if (!designData.pages || !Array.isArray(designData.pages)) {
        throw new Error("无效的页面设计数据格式")
      }

      // 验证页面数据格式
      for (const page of designData.pages) {
        if (!page.name || !page.type || !Array.isArray(page.components)) {
          throw new Error(`无效的页面数据格式：${page.name || "未知页面"}`)
        }
      }

      pages.value = designData.pages
      currentPageId.value = pages.value.length > 0 ? pages.value[0].id : ""
      
      logger.info("页面设计导入成功", { 
        pagesCount: pages.value.length 
      })
    } catch (err) {
      const error = err as Error
      logger.error("导入页面设计失败", { error: error.message })
      throw error
    }
  }

  // 获取统计信息
  const getStatistics = () => {
    try {
      const stats = {
        totalPages: pages.value.length,
        completedPages: completedPages.value,
        pagesByType: {
          list: pages.value.filter(p => p.type === "list").length,
          form: pages.value.filter(p => p.type === "form").length,
          detail: pages.value.filter(p => p.type === "detail").length,
          custom: pages.value.filter(p => p.type === "custom").length
        },
        totalComponents: pages.value.reduce((sum, p) => sum + p.components.length, 0),
        avgComponentsPerPage: pages.value.length > 0 
          ? Math.round(pages.value.reduce((sum, p) => sum + p.components.length, 0) / pages.value.length)
          : 0
      }

      logger.debug("页面设计统计信息已生成", stats)
      return stats
    } catch (err) {
      const error = err as Error
      logger.error("获取统计信息失败", { error: error.message })
      throw error
    }
  }

  return {
    // 状态
    pages,
    isLoading,
    error,
    currentPageId,
    
    // 计算属性
    completedPages,
    totalPages,
    currentPage,
    pagesByType,
    pagesByEntity,
    
    // 页面操作
    addPage,
    updatePage,
    removePage,
    duplicatePage,
    
    // 组件操作
    addComponentToPage,
    updateComponentInPage,
    removeComponentFromPage,
    
    // 批量生成
    generateBatchPages,
    
    // 工具方法
    saveToLocalStorage,
    loadFromLocalStorage,
    clearAllData,
    exportPageDesigns,
    importPageDesigns,
    getStatistics
  }
})
