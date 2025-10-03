export * from "./code-generator"
export * from "./types/index"
export type { TableSchema } from "./types/index"

// ESM-friendly export of codeGeneratorApi and light mocks for templates
import { codeGeneratorApi as api } from "./code-generator"

// Provide optional helper methods used by UI stores/tests
// 扩展API接口
interface ExtendedCodeGeneratorApi {
  getTemplates?(): Promise<any[]>
}

;(api as ExtendedCodeGeneratorApi).getTemplates = (api as ExtendedCodeGeneratorApi).getTemplates || (async () => [
  { id: "crud", name: "CRUD 管理页面", description: "标准增删改查页面", category: "frontend" },
  { id: "appservice", name: "应用服务", description: "ABP 应用服务模板", category: "backend" },
])

export const codeGeneratorApi = api

// 📦 Database API - 为 templates store 提供数据接口
interface Template {
  id: string
  name: string
  description: string
}

export const databaseApi = {
  getTemplates: async (): Promise<Template[]> => {
    // TODO: 集成真实后端 API
    return [
      { id: "crud", name: "CRUD 管理页面", description: "标准增删改查页面" },
      { id: "appservice", name: "应用服务", description: "ABP 应用服务模板" },
      { id: "form", name: "表单模板", description: "通用表单模板" },
      { id: "report", name: "报表模板", description: "数据报表模板" },
    ]
  },
}
