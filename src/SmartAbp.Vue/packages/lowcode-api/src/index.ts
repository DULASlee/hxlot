// ============================================================================
// 类型定义导出
// ============================================================================
export * from "./types/index"
export type { TableSchema } from "./types/index"

// ============================================================================
// HTTP客户端导出
// ============================================================================
export * from "./http-client"
export { http, createHttpClient } from "./http-client"
export type { HttpClient, ApiResponse, ApiError, HttpClientConfig } from "./http-client"

// ============================================================================
// 代码生成器API导出
// ============================================================================
export * from "./code-generator"
export { codeGeneratorApi } from "./code-generator"

// ============================================================================
// Composables导出（Task 1.2 新增）
// ============================================================================
export * from "./composables"
export {
  // 错误处理
  useApiError,
  
  // Loading管理
  useApiLoading,
  createLoadingWrapper,
  
  // 统一API调用
  useApiCall,
  createApiCall,
  createCodeGenApiCall
} from "./composables"

// ============================================================================
// 兼容性接口（向后兼容）
// ============================================================================
import { codeGeneratorApi } from "./code-generator"

interface CompatTemplate {
  id: string
  name: string
  description: string
}

/**
 * 数据库API - 兼容性接口
 * @deprecated 请直接使用 codeGeneratorApi
 */
export const databaseApi = {
  /**
   * 获取模板列表
   * @deprecated 请使用 codeGeneratorApi.getTemplates()
   */
  getTemplates: async (): Promise<CompatTemplate[]> => {
    const templates = await codeGeneratorApi.getTemplates()
    return templates.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description || ''
    }))
  },
}
