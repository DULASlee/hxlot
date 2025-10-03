import type { CodeGeneratorApi, GenerationResult, ModuleGenerationConfig, ModuleMetadata, Template } from "./types/index";

/**
 * 代码生成器API实现
 * 提供代码生成、模板管理、数据库检视等功能
 */
export const codeGeneratorApi: CodeGeneratorApi = {
  async generateModule(_config: ModuleGenerationConfig): Promise<GenerationResult> {
    // 实际实现将通过HTTP请求与后端通信
    throw new Error('Code generation API not implemented - bridge layer required');
  },

  async getTemplates(): Promise<Template[]> {
    // 实际实现将通过HTTP请求与后端通信
    throw new Error('Templates API not implemented - bridge layer required');
  },

  async getUiConfig(_moduleName: string, _entityName: string): Promise<any> {
    // 实际实现将通过HTTP请求与后端通信
    throw new Error('UI config API not implemented - bridge layer required');
  },

  async introspectDatabase(_req: any): Promise<any> {
    // 实际实现将通过HTTP请求与后端通信
    throw new Error('Database introspection API not implemented - bridge layer required');
  },

  async getGenerationStatus(_sessionId: string): Promise<any> {
    // 实际实现将通过HTTP请求与后端通信
    throw new Error('Generation status API not implemented - bridge layer required');
  },

  async exportGeneratedCode(_sessionId: string): Promise<Blob> {
    // 实际实现将通过HTTP请求与后端通信
    throw new Error('Code export API not implemented - bridge layer required');
  },

  async validateModule(_metadata: ModuleMetadata): Promise<{
    isValid: boolean;
    errors: Array<{ field: string; message: string; severity: 'Error' | 'Warning'; }>;
    suggestions: Array<{ type: 'Naming' | 'Structure' | 'Performance'; message: string; autoFixAvailable: boolean; }>;
  }> {
    // 实际实现将通过HTTP请求与后端通信
    throw new Error('Module validation API not implemented - bridge layer required');
  },

  async registerModule(metadata: ModuleMetadata): Promise<ModuleMetadata> {
    // 调用后端 api/metadata/register-module 幂等注册接口
    const response = await fetch('/api/metadata/register-module', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata)
    });

    if (!response.ok) {
      throw new Error(`Module registration failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  async testDatabaseConnection(_connection: { provider: string; connectionString: string; schema?: string; }): Promise<{
    success: boolean;
    message: string;
    serverVersion?: string;
    databaseName?: string;
    schemaCount?: number;
    tableCount?: number;
  }> {
    // 实际实现将通过HTTP请求与后端通信
    throw new Error('Database connection test API not implemented - bridge layer required');
  }
};
