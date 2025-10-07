/**
 * Mock Server 配置
 * 
 * 用于本地开发和测试环境，模拟后端API
 * 基于MSW (Mock Service Worker) 或简单的延迟模拟
 */

import {
  mockGenerateModuleResponse,
  mockTemplatesResponse,
  mockUiConfigResponse,
  mockIntrospectDatabaseResponse,
  mockGenerationStatusResponse,
  mockValidateModuleResponse,
  mockTestConnectionSuccessResponse
} from './api-responses'

/**
 * 模拟网络延迟
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Mock Server配置
 */
export const mockServerConfig = {
  // 🔥 默认启用Mock（当后端不可用时自动降级）
  // 可以通过 VITE_USE_MOCK_API=false 禁用
  enabled: (import.meta as any).env?.VITE_USE_MOCK_API !== 'false',
  baseURL: '/api',
  delay: {
    min: 100,
    max: 500
  }
}

/**
 * 随机延迟
 */
const randomDelay = () => {
  const { min, max } = mockServerConfig.delay
  const ms = Math.floor(Math.random() * (max - min + 1)) + min
  return delay(ms)
}

/**
 * Mock API Handlers
 */
export const mockApiHandlers = {
  /**
   * Mock: POST /api/code-generator/generate
   */
  async generateModule(_config: any) {
    await randomDelay()
    
    // 模拟10%的失败率
    if (Math.random() < 0.1) {
      throw new Error('Generation failed: Template not found')
    }
    
    return mockGenerateModuleResponse
  },

  /**
   * Mock: GET /api/code-generator/templates
   */
  async getTemplates() {
    await randomDelay()
    return mockTemplatesResponse
  },

  /**
   * Mock: GET /api/code-generator/ui-config
   */
  async getUiConfig(moduleName: string, entityName: string) {
    await randomDelay()
    
    // 验证参数
    if (!moduleName || !entityName) {
      throw new Error('moduleName and entityName are required')
    }
    
    return mockUiConfigResponse
  },

  /**
   * Mock: POST /api/code-generator/introspect-database
   */
  async introspectDatabase(req: any) {
    await delay(1000) // 数据库内省需要更长时间
    
    // 模拟连接失败
    if (req.connectionString.includes('invalid')) {
      throw new Error('Database connection failed: Invalid credentials')
    }
    
    return mockIntrospectDatabaseResponse
  },

  /**
   * Mock: GET /api/code-generator/status/{sessionId}
   */
  async getGenerationStatus(sessionId: string) {
    await delay(200) // 状态查询应该很快
    
    if (!sessionId) {
      throw new Error('sessionId is required')
    }
    
    // 模拟进度递增
    const progress = Math.min(mockGenerationStatusResponse.progress + 10, 100)
    
    return {
      ...mockGenerationStatusResponse,
      progress,
      completedSteps: Math.min(mockGenerationStatusResponse.completedSteps + 1, mockGenerationStatusResponse.totalSteps)
    }
  },

  /**
   * Mock: GET /api/code-generator/export/{sessionId}
   */
  async exportGeneratedCode(sessionId: string) {
    await delay(2000) // 文件导出需要较长时间
    
    if (!sessionId) {
      throw new Error('sessionId is required')
    }
    
    // 模拟ZIP文件
    const mockZipContent = 'PK\x03\x04...' // ZIP文件头
    const blob = new Blob([mockZipContent], { type: 'application/zip' })
    
    return blob
  },

  /**
   * Mock: POST /api/code-generator/validate
   */
  async validateModule(metadata: any) {
    await randomDelay()
    
    if (!metadata || !metadata.moduleName) {
      throw new Error('Invalid metadata: moduleName is required')
    }
    
    // 模拟命名规范检查
    if (metadata.moduleName.includes('_') || metadata.moduleName.toLowerCase() === metadata.moduleName) {
      return {
        isValid: false,
        errors: [
          {
            field: 'moduleName',
            message: '模块名称应使用PascalCase命名规范',
            severity: 'Error'
          }
        ],
        suggestions: []
      }
    }
    
    return mockValidateModuleResponse
  },

  /**
   * Mock: POST /api/metadata/register-module
   */
  async registerModule(metadata: any) {
    await randomDelay()
    
    if (!metadata || !metadata.moduleName) {
      throw new Error('Invalid metadata: moduleName is required')
    }
    
    // 幂等性：如果模块已存在，返回相同的ID
    const existingModuleId = `module-${metadata.moduleName.toLowerCase()}-001`
    
    return {
      ...metadata,
      id: existingModuleId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  /**
   * Mock: POST /api/code-generator/test-connection
   */
  async testDatabaseConnection(connection: any) {
    await delay(1500) // 连接测试需要一些时间
    
    if (!connection || !connection.connectionString) {
      throw new Error('Connection string is required')
    }
    
    // 模拟连接失败
    if (connection.connectionString.includes('wrong-password')) {
      return {
        success: false,
        message: '数据库连接失败：密码错误',
        errorCode: 'INVALID_CREDENTIALS'
      }
    }
    
    return mockTestConnectionSuccessResponse
  },

  /**
   * Mock: GET /api/code-gen/stats/my
   */
  async getMyStats() {
    await randomDelay()
    
    return {
      totalProjects: 12,
      monthlyGenerations: 8,
      savedHours: 96,
      qualityScore: 94.5,
      lastUpdated: new Date().toISOString()
    }
  },

  /**
   * Mock: GET /api/code-gen/user-profile/my
   */
  async getMyProfile() {
    await randomDelay()
    
    return {
      id: 'mock-profile-001',
      userId: 'mock-user-001',
      industry: 'manufacturing',
      companyName: '示例制造企业',
      companySize: 'medium',
      lastUsedMode: 'industry',
      isFirstVisit: false
    }
  },

  /**
   * Mock: PUT /api/code-gen/user-profile/my
   */
  async updateMyProfile(input: any) {
    await randomDelay()
    
    return {
      id: 'mock-profile-001',
      userId: 'mock-user-001',
      industry: input.industry || 'manufacturing',
      companyName: input.companyName || '示例制造企业',
      companySize: input.companySize || 'medium',
      lastUsedMode: input.lastUsedMode || 'industry',
      isFirstVisit: false
    }
  },

  /**
   * Mock: GET /api/code-gen/user-profile/recommendation
   */
  async getRecommendation() {
    await randomDelay()
    
    return {
      template: 'saas-mes',
      name: 'SaaS云MES系统',
      reason: '检测到您的企业是制造业',
      benefits: '30分钟生成完整MES系统，包含生产管理、设备监控、质量追溯、移动报工APP和实时监控大屏'
    }
  }
}

/**
 * 创建Mock拦截器（用于Axios）
 */
export function setupMockInterceptor(axiosInstance: any) {
  if (!mockServerConfig.enabled) {
    return
  }

  // 响应拦截器
  axiosInstance.interceptors.response.use(
    async (response: any) => {
      // 正常响应，不需要mock
      return response
    },
    async (error: any) => {
      const { config } = error
      
      // 如果是网络错误，尝试使用mock数据
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        console.warn('[Mock Server] Network error detected, using mock data:', config.url)
        
        // 根据URL路由到对应的mock处理器
        const mockResponse = await routeToMockHandler(config)
        
        if (mockResponse) {
          return {
            data: mockResponse,
            status: 200,
            statusText: 'OK (Mock)',
            headers: {},
            config
          }
        }
      }
      
      return Promise.reject(error)
    }
  )
}

/**
 * 根据URL路由到对应的Mock处理器
 */
async function routeToMockHandler(config: any) {
  const { url, method, data, params } = config
  
  try {
    // POST /api/code-generator/generate
    if (method === 'post' && url?.includes('/code-generator/generate')) {
      return await mockApiHandlers.generateModule(data)
    }
    
    // GET /api/code-generator/templates
    if (method === 'get' && url?.includes('/code-generator/templates')) {
      return await mockApiHandlers.getTemplates()
    }
    
    // GET /api/code-generator/ui-config
    if (method === 'get' && url?.includes('/code-generator/ui-config')) {
      return await mockApiHandlers.getUiConfig(params?.moduleName, params?.entityName)
    }
    
    // POST /api/code-generator/introspect-database
    if (method === 'post' && url?.includes('/code-generator/introspect-database')) {
      return await mockApiHandlers.introspectDatabase(data)
    }
    
    // GET /api/code-generator/status/{sessionId}
    if (method === 'get' && url?.match(/\/code-generator\/status\/[\w-]+/)) {
      const sessionId = url.split('/').pop()
      return await mockApiHandlers.getGenerationStatus(sessionId)
    }
    
    // GET /api/code-generator/export/{sessionId}
    if (method === 'get' && url?.match(/\/code-generator\/export\/[\w-]+/)) {
      const sessionId = url.split('/').pop()
      return await mockApiHandlers.exportGeneratedCode(sessionId)
    }
    
    // POST /api/code-generator/validate
    if (method === 'post' && url?.includes('/code-generator/validate')) {
      return await mockApiHandlers.validateModule(data)
    }
    
    // POST /api/metadata/register-module
    if (method === 'post' && url?.includes('/metadata/register-module')) {
      return await mockApiHandlers.registerModule(data)
    }
    
    // POST /api/code-generator/test-connection
    if (method === 'post' && url?.includes('/code-generator/test-connection')) {
      return await mockApiHandlers.testDatabaseConnection(data)
    }
    
    // GET /api/code-gen/stats/my
    if (method === 'get' && url?.includes('/code-gen/stats/my')) {
      return await mockApiHandlers.getMyStats()
    }
    
    // GET /api/code-gen/user-profile/my
    if (method === 'get' && url?.includes('/code-gen/user-profile/my')) {
      return await mockApiHandlers.getMyProfile()
    }
    
    // PUT /api/code-gen/user-profile/my
    if (method === 'put' && url?.includes('/code-gen/user-profile/my')) {
      return await mockApiHandlers.updateMyProfile(data)
    }
    
    // GET /api/code-gen/user-profile/recommendation
    if (method === 'get' && url?.includes('/code-gen/user-profile/recommendation')) {
      return await mockApiHandlers.getRecommendation()
    }
    
    return null
  } catch (error) {
    console.error('[Mock Server] Error:', error)
    throw error
  }
}

/**
 * 导出Mock Server实例（用于开发环境）
 */
export const mockServer = {
  config: mockServerConfig,
  handlers: mockApiHandlers,
  setupInterceptor: setupMockInterceptor,
  routeToHandler: routeToMockHandler
}

export default mockServer

