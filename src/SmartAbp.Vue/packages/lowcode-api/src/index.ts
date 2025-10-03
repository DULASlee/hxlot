// 导出所有类型定义
export * from "./types/index"
export type { TableSchema } from "./types/index"

// 导出HTTP客户端
export * from "./http-client"
export { http, createHttpClient } from "./http-client"

// 导出代码生成器API
export * from "./code-generator"
export { codeGeneratorApi } from "./code-generator"

// 兼容性：保留databaseApi别名
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
