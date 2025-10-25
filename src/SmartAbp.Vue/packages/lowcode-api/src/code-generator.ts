import { http } from './http-client';
import type { CodeGeneratorApi, GenerationResult, ModuleGenerationConfig, ModuleMetadata, Template } from "./types/index";

/**
 * 代码生成器API实现
 * 通过HTTP客户端与后端ABP Framework API通信
 */
export const codeGeneratorApi: CodeGeneratorApi = {
  /**
   * 生成模块代码
   * - 后端端点期望 ModuleMetadataDto 作为根对象
   * - 兼容历史入参 { moduleMetadata, ... }：自动提取并仅提交 moduleMetadata
   */
  async generateModule(config: ModuleGenerationConfig | ModuleMetadata): Promise<GenerationResult> {
    const body: ModuleMetadata = (config && (config as any).moduleMetadata)
      ? (config as any).moduleMetadata
      : (config as ModuleMetadata);
    return await http.post<GenerationResult>('/api/code-generator/generate-module', body)
  },

  /**
   * 获取可用模板列表
   * @returns 模板列表
   */
  async getTemplates(): Promise<Template[]> {
    return http.get<Template[]>('/api/code-generator/templates')
  },

  /**
   * 获取UI配置
   * @param moduleName 模块名称
   * @param entityName 实体名称
   * @returns UI配置信息
   */
  async getUiConfig(moduleName: string, entityName: string): Promise<any> {
    return await http.get<any>('/api/code-generator/ui-config', {
      params: { moduleName, entityName }
    })
  },

  /**
   * 数据库内省 - 扫描数据库结构
   * @param req 数据库内省请求
   * @returns 数据库结构信息
   */
  async introspectDatabase(req: any): Promise<any> {
    console.log('🌐 [API] introspectDatabase 调用，URL: /api/code-generator/introspect-db')
    console.log('🌐 [API] 请求参数:', req)
    try {
      const result = await http.post<any>('/api/code-generator/introspect-db', req)
      console.log('🌐 [API] introspectDatabase 成功，返回表数量:', result?.tables?.length)
      return result
    } catch (error: any) {
      console.error('🌐 [API] introspectDatabase 失败!')
      console.error('🌐 [API] 错误:', error)
      throw error
    }
  },

  /**
   * 获取代码生成状态
   * @param sessionId 会话ID
   * @returns 生成状态信息
   */
  async getGenerationStatus(sessionId: string): Promise<any> {
    return await http.get<any>(`/api/code-generator/status/${sessionId}`)
  },

  /**
   * 导出生成的代码为ZIP包
   * @param sessionId 会话ID
   * @returns Blob对象（ZIP文件）
   */
  async exportGeneratedCode(sessionId: string): Promise<Blob> {
    return http.get<Blob>(
      `/api/code-generator/export/${sessionId}`,
      { responseType: 'blob' }
    )
  },

  /**
   * 验证模块元数据
   * @param metadata 模块元数据
   * @returns 验证结果，包含错误和建议
   */
  async validateModule(metadata: ModuleMetadata): Promise<{
    isValid: boolean;
    errors: Array<{ field: string; message: string; severity: 'Error' | 'Warning'; }>;
    suggestions: Array<{ type: 'Naming' | 'Structure' | 'Performance'; message: string; autoFixAvailable: boolean; }>;
  }> {
    return http.post<{
      isValid: boolean;
      errors: Array<{ field: string; message: string; severity: 'Error' | 'Warning'; }>;
      suggestions: Array<{ type: 'Naming' | 'Structure' | 'Performance'; message: string; autoFixAvailable: boolean; }>;
    }>('/api/code-generator/validate', metadata)
  },

  /**
   * 注册模块元数据（幂等操作）
   * @param metadata 模块元数据
   * @returns 注册后的模块元数据
   */
  async registerModule(metadata: ModuleMetadata): Promise<ModuleMetadata> {
    return await http.post<ModuleMetadata>('/api/metadata/register-module', metadata)
  },

  /**
   * 测试数据库连接
   * @param connection 数据库连接配置
   * @returns 连接测试结果
   */
  async testDatabaseConnection(connection: {
    provider: string;
    connectionString: string;
    schema?: string;
  }): Promise<{
    success: boolean;
    message: string;
    serverVersion?: string;
    databaseName?: string;
    schemaCount?: number;
    tableCount?: number;
    tables?: string[]; // 🔥 关键修复：添加表名列表
  }> {
    return http.post<{
      success: boolean;
      message: string;
      serverVersion?: string;
      databaseName?: string;
      schemaCount?: number;
      tableCount?: number;
      tables?: string[]; // 🔥 关键修复：添加表名列表
    }>('/api/code-generator/test-connection', connection)
  }
};
