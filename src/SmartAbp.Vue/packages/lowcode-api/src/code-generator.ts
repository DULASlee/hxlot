import type {
  ModuleGenerationConfig,
  GenerationResult,
  CodeGeneratorApi,
} from "./types"
import { codeGeneratorApi as api } from "./types"

export const codeGeneratorApi: CodeGeneratorApi = {
  async generateModule(
    config: ModuleGenerationConfig,
  ): Promise<GenerationResult> {
    return api.generateModule(config)
  },
  async getTemplates() {
    return api.getTemplates()
  },
  async getUiConfig(moduleName: string, entityName: string) {
    return api.getUiConfig(moduleName, entityName)
  },
}
