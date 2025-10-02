/**
 * 低代码API真实HTTP客户端实现
 * 连接后端 /api/code-generator 接口
 */

import axios, { AxiosInstance } from 'axios'
import type {
  ModuleMetadataDto,
  GeneratedModuleDto,
  GenerationResult,
  CodeGeneratorApi,
  Template,
  ValidationReport,
  DryRunResult,
  DatabaseIntrospectionRequest,
  DatabaseSchema,
  MenuItemDto,
  SchemaVersionManifest,
  EntityUIConfig
} from './types'

/**
 * 创建代码生成器专用的axios实例
 */
const createCodeGeneratorClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: '/api/code-generator',
    timeout: 120000, // 120秒 - 代码生成可能较慢
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // 请求拦截器
  client.interceptors.request.use(
    (config) => {
      // 从localStorage获取token（与主应用保持一致）
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      console.log(`[CodeGenerator API] ${config.method?.toUpperCase()} ${config.url}`, config.data)
      return config
    },
    (error) => {
      console.error('[CodeGenerator API] Request error:', error)
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  client.interceptors.response.use(
    (response) => {
      console.log(`[CodeGenerator API] Response:`, response.data)
      return response
    },
    (error) => {
      console.error('[CodeGenerator API] Response error:', error.response?.data || error.message)
      
      // 处理常见错误
      if (error.response) {
        const { status, data } = error.response
        
        switch (status) {
          case 400:
            throw new Error(`验证失败: ${data.message || '请检查输入参数'}`)
          case 401:
            throw new Error('未授权，请先登录')
          case 403:
            throw new Error('权限不足')
          case 404:
            throw new Error('API接口不存在')
          case 500:
            throw new Error(`服务器错误: ${data.message || '代码生成失败'}`)
          default:
            throw new Error(`请求失败 (${status}): ${data.message || error.message}`)
        }
      }
      
      throw new Error('网络错误，请检查后端服务是否启动')
    }
  )

  return client
}

const client = createCodeGeneratorClient()

/**
 * 真实的代码生成器API实现
 */
export const codeGeneratorApi: CodeGeneratorApi = {
  /**
   * 生成模块代码
   * @param config 模块元数据配置
   * @returns 生成结果（转换为前端GenerationResult格式）
   */
  async generateModule(config: ModuleMetadataDto): Promise<GenerationResult> {
    const response = await client.post<GeneratedModuleDto>('/generate-module', config)
    
    // 转换后端DTO为前端GenerationResult格式
    const result = response.data
    return {
      success: true,
      generatedFiles: result.generatedFiles.map(file => ({ 
        path: file, 
        content: undefined 
      })),
      statistics: {
        totalFiles: result.generatedFiles.length,
        totalLines: 0, // 后端未提供，设为0
        generationTime: 0 // 后端未提供，设为0
      },
      errors: [],
      report: result.generationReport,
      generatedAt: new Date().toISOString()
    }
  },

  /**
   * 从统一schema生成模块
   */
  async generateFromUnified(schema: any): Promise<GenerationResult> {
    const response = await client.post<GeneratedModuleDto>('/unified/generate-module', schema)
    
    // 转换格式
    const result = response.data
    return {
      success: true,
      generatedFiles: result.generatedFiles.map(file => ({ path: file })),
      statistics: {
        totalFiles: result.generatedFiles.length,
        totalLines: 0,
        generationTime: 0
      },
      errors: [],
      report: result.generationReport
    }
  },

  /**
   * 验证模块配置
   */
  async validateModule(config: ModuleMetadataDto): Promise<ValidationReport> {
    const response = await client.post<ValidationReport>('/validate', config)
    return response.data
  },

  /**
   * 模拟运行（不实际生成代码）
   */
  async dryRun(config: ModuleMetadataDto): Promise<DryRunResult> {
    const response = await client.post<DryRunResult>('/dry-run', config)
    return response.data
  },

  /**
   * 从统一schema验证
   */
  async validateUnified(schema: any): Promise<ValidationReport> {
    const response = await client.post<ValidationReport>('/unified/validate', schema)
    return response.data
  },

  /**
   * 从统一schema模拟运行
   */
  async dryRunUnified(schema: any): Promise<DryRunResult> {
    const response = await client.post<DryRunResult>('/unified/dry-run', schema)
    return response.data
  },

  /**
   * 获取可用模板列表
   * 注意：后端可能没有此接口，需要前端维护模板列表
   */
  async getTemplates(): Promise<Template[]> {
    // 暂时返回前端定义的模板，后续可从后端获取
    return [
      // 权限管理系统模板
      {
        id: 'organization-management',
        name: '组织管理模块',
        description: '企业组织架构管理，支持公司-部门-岗位三级结构',
        category: 'permission-system',
        features: ['CRUD操作', '树形结构', '拖拽排序', '权限控制']
      },
      {
        id: 'user-management',
        name: '用户管理模块',
        description: '系统用户管理，包含用户信息、角色分配、状态控制',
        category: 'permission-system',
        features: ['用户列表', '角色分配', '密码重置', '状态管理']
      },
      {
        id: 'role-management',
        name: '角色管理模块',
        description: '系统角色定义和管理，支持角色层级和权限分配',
        category: 'permission-system',
        features: ['角色CRUD', '权限分配', '角色继承', '批量操作']
      },
      {
        id: 'permission-management',
        name: '权限管理模块',
        description: '系统权限定义和管理，支持功能权限和数据权限',
        category: 'permission-system',
        features: ['权限树', '权限矩阵', '资源管控', '动态权限']
      },
      {
        id: 'role-permission-management',
        name: '角色权限管理',
        description: '角色与权限的关联配置，支持批量授权和权限继承',
        category: 'permission-system',
        features: ['权限分配', '批量授权', '权限继承', '权限审计']
      },
      {
        id: 'menu-management',
        name: '菜单管理模块',
        description: '系统菜单和界面权限管理，支持动态菜单生成',
        category: 'permission-system',
        features: ['菜单树', '权限绑定', '图标管理', '路由配置']
      },
      // 通用模板
      {
        id: 'crud',
        name: '通用CRUD模块',
        description: '标准增删改查功能模块，支持列表、表单、详情页面',
        category: 'general',
        features: ['数据列表', '表单编辑', '详情查看', '批量操作']
      },
      {
        id: 'form',
        name: '动态表单组件',
        description: '基于JSON配置的动态表单，支持复杂验证和联动',
        category: 'component',
        features: ['动态渲染', '验证规则', '字段联动', '数据绑定']
      },
      {
        id: 'dashboard',
        name: '数据仪表盘',
        description: '数据可视化仪表盘，支持多种图表和实时更新',
        category: 'visualization',
        features: ['图表组件', '实时数据', '响应式布局', '导出功能']
      }
    ]
  },

  /**
   * 获取UI配置
   */
  async getUiConfig(moduleName: string, entityName: string): Promise<EntityUIConfig> {
    const response = await client.get<EntityUIConfig>('/ui-config', {
      params: { module: moduleName, entity: entityName }
    })
    return response.data
  },

  /**
   * 保存UI配置
   */
  async saveUiConfig(moduleName: string, entityName: string, config: EntityUIConfig): Promise<void> {
    await client.post('/ui-config', config, {
      params: { module: moduleName, entity: entityName }
    })
  },

  /**
   * 获取连接字符串列表
   */
  async getConnectionStrings(): Promise<string[]> {
    const response = await client.get<string[]>('/connection-strings')
    return response.data
  },

  /**
   * 获取菜单树
   */
  async getMenuTree(): Promise<MenuItemDto[]> {
    const response = await client.get<MenuItemDto[]>('/menus')
    return response.data
  },

  /**
   * 数据库反查
   */
  async introspectDatabase(request: DatabaseIntrospectionRequest): Promise<DatabaseSchema> {
    const response = await client.post<DatabaseSchema>('/introspect-db', request)
    return response.data
  },

  /**
   * 获取Schema版本清单
   */
  async getSchemaVersionManifest(): Promise<SchemaVersionManifest> {
    const response = await client.get<SchemaVersionManifest>('/schema-version-manifest')
    return response.data
  }
}

/**
 * 导出辅助类型
 */
export type {
  ModuleGenerationConfig,
  GenerationResult,
  Template,
  ValidationReport,
  DryRunResult,
  DatabaseIntrospectionRequest,
  DatabaseSchema
}

