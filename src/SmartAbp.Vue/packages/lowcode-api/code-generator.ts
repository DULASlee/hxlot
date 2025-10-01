// API Service for Code Generation
import type {
  ModuleMetadata
} from "./types"

// 🚨 API错误处理类
export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'APIError'
    // 使用参数避免未使用警告
    void status
    void data
  }
}

// 📋 代码生成进度接口
export interface GenerationProgress {
  sessionId: string
  percentage: number
  currentStep: string
  totalSteps: number
  currentFile: string
  completedFiles: string[]
  status: 'idle' | 'generating' | 'completed' | 'error'
  startTime: Date
  endTime?: Date
  error?: string
}

// Database introspection types
export interface DatabaseIntrospectionRequest {
  provider: "SqlServer" | "PostgreSql" | "MySql" | "Oracle"
  connectionStringName: string
  schema?: string
}

export interface DatabaseSchema {
  tables: TableSchema[]
}

export interface TableSchema {
  name: string
  columns: ColumnSchema[]
  primaryKeys: string[]
  foreignKeys: ForeignKeySchema[]
}

export interface ColumnSchema {
  name: string
  dataType: string
  isNullable: boolean
  maxLength?: number
  isPrimaryKey: boolean
}

export interface ForeignKeySchema {
  column: string
  referencedSchema: string
  referencedTable: string
  referencedColumn: string
}

// 🚀 企业级API客户端实现 - 基于29个后端代码生成器
class CodeGeneratorAPI {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:44379'
  private apiPath = '/api/code-generation'
  // private hubConnection: any = null // 暂未使用，避免未使用变量警告

  private async request<T>(method: string, endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseUrl}${this.apiPath}${endpoint}`
    const config: globalThis.RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      credentials: 'include',
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new APIError(response.status, errorData.message || `HTTP ${response.status}`, errorData)
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }

      return await response.text() as unknown as T
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      console.error(`API request failed: ${method} ${url}`, error)
      throw new APIError(0, `Network error: ${(error as Error).message}`, { originalError: error })
    }
  }

  private getAuthToken(): string {
    return localStorage.getItem('access_token') || ''
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>('POST', endpoint, data)
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint)
  }

  // 🎯 低代码引擎核心功能 - 专注基础实现
  // ❌ 严禁添加AI智能辅助功能
  // ❌ 严禁添加多人协作功能

  // 📋 获取可用模板列表
  async getTemplates(): Promise<Array<{
    id: string
    name: string
    description: string
    category: string
    type: string
    version: string
  }>> {
    return this.get('/templates')
  }

  // 🏗️ 模块代码生成 - 对接后端CodeGenerationAppService
  async generateModule(metadata: ModuleMetadata): Promise<{
    success: boolean
    sessionId: string
    message: string
    generatedFiles?: Array<{
      path: string
      content: string
      type: 'Entity' | 'ApplicationService' | 'DTO' | 'Controller' | 'Vue' | 'TypeScript'
    }>
    errors?: string[]
  }> {
    return this.post('/generate-module', {
      moduleMetadata: metadata,
      options: {
        generateBackend: true,
        generateFrontend: true,
        generateTests: true,
        architecturePattern: metadata.architecturePattern || 'Crud',
        outputPath: './generated'
      }
    })
  }

  // 🔍 数据库结构分析 - 对接DatabaseIntrospectionService
  async introspectDatabase(req: DatabaseIntrospectionRequest): Promise<DatabaseSchema> {
    return this.post('/introspect-database', {
      connectionString: req.connectionStringName,
      provider: req.provider,
      schema: req.schema
    })
  }

  // 📊 生成统计信息
  async getStatistics(): Promise<{
    totalModules: number
    totalEntities: number
    generatedLinesOfCode: number
    lastGenerationTime: string
    popularTemplates: Array<{
      name: string
      usage: number
      category: string
    }>
    generationHistory: Array<{
      moduleName: string
      entityCount: number
      timestamp: string
      status: 'Success' | 'Failed'
    }>
  }> {
    return this.get('/statistics')
  }

  // 👁️ 模块预览 - 不生成实际文件
  async previewModule(metadata: ModuleMetadata): Promise<{
    previewFiles: Array<{
      path: string
      content: string
      language: 'csharp' | 'typescript' | 'vue'
      size: number
    }>
    estimatedLinesOfCode: number
    dependencies: string[]
    warnings: string[]
  }> {
    return this.post('/preview-module', metadata)
  }

  // ✅ 模块元数据验证
  async validateModule(metadata: ModuleMetadata): Promise<{
    isValid: boolean
    errors: Array<{
      field: string
      message: string
      severity: 'Error' | 'Warning'
    }>
    suggestions: Array<{
      type: 'Naming' | 'Structure' | 'Performance'
      message: string
      autoFixAvailable: boolean
    }>
  }> {
    return this.post('/validate-module', metadata)
  }

  // 🎨 UI配置生成 - 对接DefaultUIConfigGenerator
  async getUiConfig(module: string, entity: string): Promise<{
    listConfig: {
      title: string
      columns: Array<{
        key: string
        title: string
        type: 'text' | 'number' | 'date' | 'boolean' | 'enum'
        sortable: boolean
        filterable: boolean
        width?: number
      }>
      actions: Array<{
        name: string
        label: string
        type: 'primary' | 'success' | 'warning' | 'danger'
        permission?: string
      }>
      pagination: {
        pageSize: number
        showSizeChanger: boolean
        showQuickJumper: boolean
      }
    }
    formConfig: {
      title: string
      layout: 'horizontal' | 'vertical' | 'inline'
      sections: Array<{
        title: string
        collapsible: boolean
        fields: Array<{
          key: string
          label: string
          type: 'input' | 'textarea' | 'number' | 'select' | 'date' | 'switch'
          required: boolean
          placeholder?: string
          validation?: {
            min?: number
            max?: number
            pattern?: string
            message?: string
          }
          options?: Array<{
            label: string
            value: any
          }>
        }>
      }>
    }
    detailConfig: {
      title: string
      sections: Array<{
        title: string
        fields: Array<{
          key: string
          label: string
          type: 'text' | 'badge' | 'tag' | 'link'
          format?: string
        }>
      }>
    }
  }> {
    return this.get(`/ui-config/${module}/${entity}`)
  }

  // 📋 获取可用模板列表
  async getAvailableTemplates(): Promise<Array<{
    id: string
    name: string
    description: string
    category: 'backend' | 'frontend' | 'lowcode'
    version: string
    parameters: Array<{
      name: string
      type: string
      required: boolean
      description: string
      defaultValue?: any
    }>
    tags: string[]
    author: string
    lastUpdated: string
  }>> {
    return this.get('/templates')
  }

  // 🔧 生成任务状态查询
  async getGenerationStatus(sessionId: string): Promise<GenerationProgress> {
    return this.get(`/generation-status/${sessionId}`)
  }

  // 📝 生成历史记录
  async getGenerationHistory(page = 1, pageSize = 20): Promise<{
    items: Array<{
      id: string
      sessionId: string
      moduleName: string
      entityCount: number
      status: 'Success' | 'Failed' | 'InProgress'
      createdAt: string
      completedAt?: string
      duration?: number
      generatedFileCount: number
      errorMessage?: string
    }>
    total: number
    pageCount: number
    currentPage: number
  }> {
    return this.get(`/generation-history?page=${page}&pageSize=${pageSize}`)
  }

  // 🗑️ 删除生成历史记录
  async deleteGenerationHistory(sessionId: string): Promise<{
    success: boolean
    message: string
  }> {
    return this.request('DELETE', `/generation-history/${sessionId}`)
  }

  // 📦 导出生成的代码为ZIP
  async exportGeneratedCode(sessionId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}${this.apiPath}/export-code/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new APIError(response.status, `Export failed: ${response.statusText}`)
    }

    return await response.blob()
  }

  // 🔄 重新生成模块
  async regenerateModule(sessionId: string): Promise<{
    success: boolean
    newSessionId: string
    message: string
  }> {
    return this.post('/regenerate-module', { originalSessionId: sessionId })
  }

  // 🛠️ 获取支持的架构模式
  async getSupportedArchitectures(): Promise<Array<{
    name: 'Crud' | 'DDD' | 'CQRS'
    displayName: string
    description: string
    features: string[]
    complexity: 'Simple' | 'Medium' | 'Complex'
    recommendedFor: string[]
  }>> {
    return this.get('/supported-architectures')
  }

  // 🧪 测试数据库连接
  async testDatabaseConnection(connectionConfig: {
    provider: string
    connectionString: string
    schema?: string
  }): Promise<{
    success: boolean
    message: string
    serverVersion?: string
    databaseName?: string
    schemaCount?: number
    tableCount?: number
  }> {
    return this.post('/test-connection', connectionConfig)
  }
}

export const codeGeneratorApi = new CodeGeneratorAPI()
