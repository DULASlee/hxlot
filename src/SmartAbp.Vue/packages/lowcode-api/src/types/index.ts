export interface GenerationResult {
  success: boolean
  [key: string]: any
}

export interface ModuleGenerationConfig {
  metadata: any
  options: any
  target: any
}

export interface Template {
  id: string
  name: string
  description?: string
}

export interface CodeGeneratorApi {
  generateModule: (config: ModuleGenerationConfig) => Promise<GenerationResult>
  getTemplates: () => Promise<Template[]>
  getUiConfig: (moduleName: string, entityName: string) => Promise<any>
}

export const codeGeneratorApi: CodeGeneratorApi = {
  async generateModule(_config) {
    return { success: true }
  },
  async getTemplates() {
    return [
      {
        id: "crud",
        name: "CRUD Management",
        description: "Complete CRUD operations with list, create, edit, delete",
      },
      {
        id: "form",
        name: "Form Component",
        description: "Dynamic form with validation and submission",
      },
      {
        id: "dashboard",
        name: "Dashboard Widget",
        description: "Data visualization dashboard component",
      },
      {
        id: "report",
        name: "Report Page",
        description: "Data reporting with charts and export",
      },
    ]
  },
  async getUiConfig(_moduleName, _entityName) {
    return {}
  },
}
