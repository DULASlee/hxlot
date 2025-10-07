import { http } from './http-client'

/**
 * 行业模板生成结果DTO（与后端C#完全一致）
 */
export interface IndustryTemplateGenerationResultDto {
  success: boolean
  generatedFiles: Array<{
    path: string
    content: string
  }>
  errors: string[]
}

/**
 * 行业模板配置DTO（与后端C#完全一致）
 */
export interface IndustryTemplateConfigDto {
  templateId: string
  systemName: string
  description: string
  companyName: string
  selectedModules: string[]
  selectedHardware: string[]
}

/**
 * 行业模板API服务
 */
class IndustryTemplateApi {
  async generate(config: IndustryTemplateConfigDto): Promise<IndustryTemplateGenerationResultDto> {
    return await http.post<IndustryTemplateGenerationResultDto>(
      '/api/lowcode/industry-templates/generate',
      config
    )
  }

  async getTemplates(industry?: string): Promise<Array<{
    id: string
    name: string
    description: string
    industry: string
  }>> {
    const params = industry ? { industry } : undefined
    return await http.get<Array<{
      id: string
      name: string
      description: string
      industry: string
    }>>('/api/lowcode/industry-templates', { params })
  }
}

export const industryTemplateApi = new IndustryTemplateApi()

